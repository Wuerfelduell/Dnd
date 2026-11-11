import { SPRITE_BASE as BASE, GEAR_ORDER, gearFile, gearKey } from './assets.js';

// Paket BU: sichtbare Ausrüstung. Über jeder Spielerfigur liegen Overlay-Sprites (Mantel, Amulett, Waffe, Hut,
// Korruptionsfaden) im selben 4x4-Raster wie das Lauf-Sheet; sie übernehmen Frame, Position und Tiefe der Figur.
// Verkleidungen (eigene Sheets) decken die Ausrüstung ab, dann bleiben die Overlays aus.

/** Welche Figur ein Sprite-Key zeigt: 'player', 'p2a', 'p2b' oder null (Verkleidung, Fremdsheet). */
const figureOf = (key) => (['player', 'p2a', 'p2b'].includes(key) ? key : null);

/** Overlay-Dateien für Spieler n aus dessen Waffe, Kleidung und Korruption. */
export function gearFilesFor(state, n, figure) {
  if (!figure) return [];
  const read = () => ({ weapon: state.weapon, gear: { ...(state.gear ?? {}) }, corrupted: (id) => !!id && !!state.isCorrupted?.(id) });
  const g = n === 2 ? state.withPlayer(2, read, { quiet: true }) : read();
  const out = [];
  const add = (slot, item) => { const file = gearFile(figure, slot, item); if (file) out.push({ slot, file, key: gearKey(file), order: GEAR_ORDER[slot] }); };
  add('mantel', g.gear.mantel);
  add('amulett', g.gear.amulett);
  add('weapon', g.weapon);
  add('hut', g.gear.hut);
  if (g.corrupted(g.weapon) || g.corrupted(g.gear.mantel)) add('korruption', true);
  return out;
}

/** Lädt die Overlays der aktuellen Ausrüstung vor (WorldScene.preload). */
export function preloadGear(scene, state) {
  const files = [...gearFilesFor(state, 1, 'player'), ...(state.hasP2?.() ? gearFilesFor(state, 2, state.p2Look?.()) : [])];
  for (const f of files) if (!scene.textures.exists(f.key)) scene.load.spritesheet(f.key, BASE + f.file, { frameWidth: 16, frameHeight: 32 });
}

export class GearOverlay {
  constructor(scene) {
    this.scene = scene;
    this.layers = { 1: [], 2: [] };
    this.sig = { 1: null, 2: null };
    this.pending = { 1: null, 2: null };
  }

  /** Figur und Sprite von Spieler n (null, wenn er nicht da ist oder verkleidet läuft). */
  target(n) {
    const s = this.scene;
    const spr = n === 1 ? s.player : s.p2;
    if (!spr?.active) return null;
    const base = n === 1 ? s.playerKey : s.p2Key;
    const figure = figureOf(base);
    // Spieler 2 mit dem Ermittler-Sheet (getönt) trägt keine Overlays des Ermittlers
    if (!figure || spr.texture.key !== base || (n === 2 && figure === 'player')) return { spr, figure: null };
    return { spr, figure };
  }

  /** Einmal pro Frame: Ausrüstung prüfen, Overlays nachziehen. */
  sync() {
    for (const n of [1, 2]) {
      const t = this.target(n);
      if (!t) { this.clear(n); continue; }
      const want = t.figure ? gearFilesFor(this.scene.state, n, t.figure) : [];
      const sig = want.map((w) => w.key).join('|');
      if (sig !== this.sig[n]) this.rebuild(n, want, sig);
      for (const o of this.layers[n]) {
        o.setPosition(t.spr.x, t.spr.y).setDepth(t.spr.depth + o.gearOrder).setVisible(t.spr.visible).setAlpha(t.spr.alpha).setFlipX(t.spr.flipX);
        if (o.frame.name !== t.spr.frame.name && o.texture.has(t.spr.frame.name)) o.setFrame(t.spr.frame.name);
      }
    }
  }

  clear(n) {
    for (const o of this.layers[n]) o.destroy();
    this.layers[n] = [];
    this.sig[n] = null;
  }

  /** Baut die Overlays neu; fehlende Sheets werden nachgeladen und danach angelegt. */
  rebuild(n, want, sig) {
    const s = this.scene;
    const missing = want.filter((w) => !s.textures.exists(w.key));
    if (missing.length) {
      if (this.pending[n] === sig) return; // lädt schon
      this.pending[n] = sig;
      for (const w of missing) s.load.spritesheet(w.key, BASE + w.file, { frameWidth: 16, frameHeight: 32 });
      s.load.once('complete', () => { if (s.scene.isActive()) { this.pending[n] = null; this.sig[n] = null; } });
      s.load.start();
      return;
    }
    this.clear(n);
    this.sig[n] = sig;
    for (const w of want) {
      if (!s.textures.exists(w.key)) continue;
      const o = s.add.sprite(0, 0, w.key, 0).setOrigin(0.5, 1);
      o.gearOrder = w.order;
      o.gearSlot = w.slot;
      this.layers[n].push(o);
    }
  }

  destroy() { this.clear(1); this.clear(2); }
}
