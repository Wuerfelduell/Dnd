// Kampfanimationen je Pfad (Seb 2026-11-27: „mehr Kampfanimationen für die verschiedenen Angriffe“).
// Bisher teilten sich die zweiten Fertigkeiten jeder Sequenz (skill2/skill3) den Effekt-Streifen der ersten,
// die drei neuen Pfade liehen sich zusätzlich die Streifen ihrer Stellvertreter, und Grundfertigkeiten wie
// Doppelschlag oder Bannwort hatten gar keinen Effekt. Dieses Modul legt über jeden Streifen eine Pfad-Signatur
// aus Pixelpartikeln (Glut, Fäden, Scherben, Schallringe, Blasen, Funken, Schatten, Salz, Moor, Uhrwerk),
// die sich nach Art der Fertigkeit richtet (Geschoss, Fläche, Schutz, Heilung, Betäubung, Brand).
// Zweite und dritte Fertigkeiten bekommen eine eigene Fassung: anderer Bewegungsablauf, getönter, gespiegelter
// Streifen und, wo vorhanden, einen bislang ungenutzten Effekt-Streifen (Salzbruch, Dornenfessel, Siegel, Krähen …).
// Alles läuft in der eigenen Kampfszene, damit auch der Splitscreen-Kampf (zwei Szenen, Zoom 0,5) passt.

/** Zusatz-Streifen aus public/sprites/fx, die bisher nirgends liefen: [Datei, Breite, Höhe, Frames]. */
export const KFX_SHEETS = {
  kfx_salzbruch: ['fx/vm_salzbruch.png', 48, 48, 5],
  kfx_fessel: ['fx/vm_fessel.png', 32, 32, 4],
  kfx_schwall: ['fx/vm_schwall.png', 96, 32, 6],
  kfx_stempel: ['fx/vm_stempel.png', 32, 32, 6],
  kfx_kraehen: ['fx/vm_kraehen_abflug.png', 64, 64, 6],
  kfx_vorrat: ['fx/BI_vorrat_fx.png', 48, 48, 6], // Einzelbilder: 0 Steine, 1 Fass, 2 Rauch, 3 Splitter, 4 Wurzeln, 5 Staub
  kfx_kombi: ['fx/AH_kombi.png', 64, 48, 8],
};

/** Pfad → Signatur. col: Hauptfarbe, alt: Zweitfarbe (Tönung der zweiten Fertigkeit). */
export const PFAD_STIL = {
  laterne: { stil: 'glut', col: 0xffc860, alt: 0xff7a30 },
  faden: { stil: 'faden', col: 0xc8b0e8, alt: 0x8fb8ff },
  maske: { stil: 'maske', col: 0xe07a8a, alt: 0xb070e0 },
  echo: { stil: 'echo', col: 0x6fe0d0, alt: 0xa0f0ff },
  kessel: { stil: 'kessel', col: 0x9ad06a, alt: 0xd0e050 },
  eisen: { stil: 'eisen', col: 0xa8b4c0, alt: 0xffb070 },
  schluessel: { stil: 'schatten', col: 0x8a70d0, alt: 0x40306a },
  sq_waage: { stil: 'salz', col: 0xf0e8d0, alt: 0xd8c070 },
  sq_moor: { stil: 'moor', col: 0x7a9a40, alt: 0x6a4a28 },
  sq_uhr: { stil: 'uhr', col: 0x70e0f0, alt: 0xd0b060 },
  grund: { stil: 'grund', col: 0xe8d8b0, alt: 0xffffff },
};

/** Grundfertigkeiten ohne eigenen Streifen bekommen eine kleine Signatur. */
const GRUND = { double: 'doppel', blind: 'blende', ward: 'bann' };

const rnd = (a, b) => a + Math.random() * (b - a);

/** Welche Art von Wirkung hat die Fertigkeit? */
export function skillArt(def) {
  if (!def) return 'self';
  if (def.hits) return def.aoe || def.sweep ? 'aoe' : 'hit';
  if (def.heal || def.heal_all) return 'heal';
  if (def.shield || def.shield_all || def.evade) return 'shield';
  if (def.aoe) return 'aoe';
  return 'self';
}

/** Zweite (1) oder dritte (2) Fertigkeit einer Sequenz? */
export const skillVariant = (def) => (def?.third ? 2 : def?.second ? 1 : 0);

export class SkillFx {
  constructor(scene) {
    this.scene = scene;
    this.px = scene.splitHalf ? 2 : 1; // im Splitscreen ist die Bühne halb so groß: Partikel doppelt
  }

  // --- Bausteine ---------------------------------------------------------------

  /** Ein Pixelpartikel, das fliegt und verblasst. */
  dot(x, y, col, { dx = 0, dy = 0, size = 2, dur = 450, delay = 0, grav = 0, shape = 'rect', alpha = 1, depth = 33, shrink = true } = {}) {
    const s = this.scene;
    const n = size * this.px;
    const o = shape === 'circle' ? s.add.circle(x, y, n / 2, col, alpha) : shape === 'diamond'
      ? s.add.rectangle(x, y, n, n, col, alpha).setAngle(45)
      : s.add.rectangle(x, y, n, n, col, alpha);
    o.setDepth(depth);
    s.tweens.add({ targets: o, x: x + dx, duration: dur, delay, ease: 'Quad.out' });
    s.tweens.add({ targets: o, y: y + dy + grav, duration: dur, delay, ease: grav ? 'Quad.in' : 'Quad.out' });
    s.tweens.add({ targets: o, alpha: 0, ...(shrink ? { scale: 0.3 } : {}), duration: dur, delay, ease: 'Sine.in', onComplete: () => o.destroy() });
    return o;
  }

  burst(x, y, col, { n = 12, r = 30, size = 2, dur = 450, grav = 0, shape, up = 0, delay = 0 } = {}) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.3, 0.3);
      const d = r * rnd(0.5, 1);
      this.dot(x, y, col, { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.7 - up, size, dur: dur * rnd(0.8, 1.2), grav, shape, delay });
    }
  }

  ring(x, y, col, { r0 = 6, r1 = 40, w = 2, dur = 420, delay = 0, flat = 1, alpha = 0.9 } = {}) {
    const s = this.scene;
    const g = s.add.graphics().setDepth(32);
    const st = { r: r0, a: alpha };
    s.tweens.add({
      targets: st, r: r1, a: 0, duration: dur, delay, ease: 'Sine.out',
      onUpdate: () => { g.clear(); g.lineStyle(w * this.px, col, st.a).strokeEllipse(x, y, st.r * 2, st.r * 2 * flat); },
      onComplete: () => g.destroy(),
    });
  }

  /** Geschoss vom Spieler zum Ziel mit Spur. */
  bolt(from, to, col, { dur = 170, size = 4, trail = 6, arc = 0, onArrive, shape = 'rect' } = {}) {
    const s = this.scene;
    const st = { t: 0 };
    let last = 0;
    s.tweens.add({
      targets: st, t: 1, duration: dur, ease: 'Sine.in',
      onUpdate: () => {
        const x = from.x + (to.x - from.x) * st.t;
        const y = from.y + (to.y - from.y) * st.t - Math.sin(st.t * Math.PI) * arc;
        if (st.t - last > 1 / (trail * 2)) {
          last = st.t;
          this.dot(x, y, col, { size, dur: 220, shape });
          this.dot(x + rnd(-2, 2), y + rnd(-2, 2), 0xffffff, { size: Math.max(1, size - 2), dur: 120, shape });
        }
      },
      onComplete: () => onArrive?.(),
    });
  }

  /** Fäden: gezackte Linien vom Spieler zum Ziel, die kurz aufleuchten. */
  threads(from, to, col, { n = 3, dur = 380 } = {}) {
    const s = this.scene;
    for (let k = 0; k < n; k++) {
      const g = s.add.graphics().setDepth(32);
      const off = (k - (n - 1) / 2) * 8;
      g.lineStyle(1 * this.px, col, 1);
      g.beginPath();
      g.moveTo(from.x, from.y + off);
      const steps = 6;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        g.lineTo(from.x + (to.x - from.x) * t, from.y + off + (to.y - from.y - off) * t + Math.sin(t * Math.PI * 2 + k) * 6);
      }
      g.strokePath();
      g.setAlpha(0);
      s.tweens.add({ targets: g, alpha: 1, duration: 90, delay: k * 50, yoyo: true, hold: dur - 180, onComplete: () => g.destroy() });
    }
  }

  /** Aufsteigende Partikel (Heilung, Stärkung, Aura). */
  rise(x, y, col, { n = 10, w = 26, h = 40, size = 2, dur = 700, shape } = {}) {
    for (let i = 0; i < n; i++) this.dot(x + rnd(-w / 2, w / 2), y + rnd(0, 20), col, { dy: -h * rnd(0.6, 1), size, dur, delay: i * 35, shape, shrink: false });
  }

  /** Fallende Körner (Salz, Moor, Funkenregen). */
  rain(x, y, col, { n = 12, w = 40, h = 46, size = 2, dur = 420, shape } = {}) {
    for (let i = 0; i < n; i++) this.dot(x + rnd(-w / 2, w / 2), y - h, col, { dy: h + rnd(0, 8), size, dur, delay: i * 25, shape, shrink: false });
  }

  /** Schutzschild: Sechseck, das aufleuchtet und verblasst. */
  shield(x, y, col, { r = 26, dur = 520 } = {}) {
    const s = this.scene;
    const g = s.add.graphics().setDepth(32);
    const pts = Array.from({ length: 6 }, (_, i) => ({ x: x + Math.cos(i * Math.PI / 3 + Math.PI / 6) * r, y: y + Math.sin(i * Math.PI / 3 + Math.PI / 6) * r * 1.2 }));
    g.fillStyle(col, 0.18).fillPoints(pts, true);
    g.lineStyle(2 * this.px, col, 1).strokePoints(pts, true);
    g.setScale(0.6).setAlpha(0);
    g.x = x * 0.4; g.y = y * 0.4; // Skalierung um den Mittelpunkt
    s.tweens.add({ targets: g, scale: 1, x: 0, y: 0, alpha: 1, duration: 160, ease: 'Back.out' });
    s.tweens.add({ targets: g, alpha: 0, duration: dur - 160, delay: 260, onComplete: () => g.destroy() });
  }

  /** Kreisende Sterne über dem Kopf (Betäubung). */
  stars(x, y, col = 0xfff0a0) {
    const s = this.scene;
    for (let i = 0; i < 3; i++) {
      const o = s.add.rectangle(x, y, 3 * this.px, 3 * this.px, col).setAngle(45).setDepth(34);
      const st = { a: (i / 3) * Math.PI * 2 };
      s.tweens.add({
        targets: st, a: st.a + Math.PI * 3, duration: 900, ease: 'Linear',
        onUpdate: () => o.setPosition(x + Math.cos(st.a) * 12, y - 34 + Math.sin(st.a) * 4),
        onComplete: () => o.destroy(),
      });
      s.tweens.add({ targets: o, alpha: 0, delay: 650, duration: 250 });
    }
  }

  /** Kleine Flammen am Ziel (Brand, Folgeschaden). */
  flames(x, y, col = 0xff8a30) {
    for (let i = 0; i < 7; i++) {
      const fx = x + rnd(-14, 14);
      this.dot(fx, y + 18, col, { dy: -rnd(14, 26), size: 3, dur: 500, delay: i * 60, shrink: true });
      this.dot(fx, y + 18, 0xffe080, { dy: -rnd(8, 14), size: 1, dur: 350, delay: i * 60 + 30 });
    }
  }

  /** Bodenwelle unter dem Ziel. */
  shock(x, y, col, { r1 = 50, delay = 0 } = {}) {
    this.ring(x, y + 40, col, { r0: 4, r1, flat: 0.25, w: 3, dur: 380, delay });
    this.ring(x, y + 40, 0xffffff, { r0: 2, r1: r1 * 0.6, flat: 0.25, w: 1, dur: 300, delay: delay + 60, alpha: 0.6 });
  }

  /** Zifferblatt mit rückwärts laufendem Zeiger. */
  clock(x, y, col, { r = 18, dur = 600, back = false } = {}) {
    const s = this.scene;
    const g = s.add.graphics().setDepth(33);
    const st = { a: -Math.PI / 2, al: 1 };
    s.tweens.add({
      targets: st, a: st.a + (back ? -1 : 1) * Math.PI * 2, al: 0, duration: dur, ease: 'Cubic.inOut',
      onUpdate: () => {
        g.clear();
        g.lineStyle(1 * this.px, col, st.al).strokeCircle(x, y, r);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          g.fillStyle(col, st.al).fillRect(x + Math.cos(a) * (r - 3) - 1, y + Math.sin(a) * (r - 3) - 1, 2, 2);
        }
        g.lineStyle(2 * this.px, 0xffffff, st.al).lineBetween(x, y, x + Math.cos(st.a) * (r - 4), y + Math.sin(st.a) * (r - 4));
      },
      onComplete: () => g.destroy(),
    });
  }

  /** Schattenwolke: dunkle Kreise, die anschwellen und vergehen. */
  smoke(x, y, col, { n = 8, r = 18, dark = 0x101018 } = {}) {
    const s = this.scene;
    for (let i = 0; i < n; i++) {
      const c = s.add.circle(x + rnd(-r, r), y + rnd(-r * 0.6, r * 0.6), rnd(3, 6) * this.px, i % 3 ? dark : col, 0.85).setDepth(32);
      s.tweens.add({ targets: c, scale: rnd(1.8, 2.6), alpha: 0, y: c.y - rnd(4, 12), duration: rnd(420, 620), delay: i * 30, ease: 'Sine.out', onComplete: () => c.destroy() });
    }
  }

  /** Ein Bogen-Hieb (Sichel) am Ziel. */
  slash(x, y, col, { flip = false, delay = 0, r = 26 } = {}) {
    const s = this.scene;
    const g = s.add.graphics().setDepth(33);
    const st = { t: 0 };
    s.tweens.add({
      targets: st, t: 1, duration: 220, delay, ease: 'Quad.out',
      onUpdate: () => {
        g.clear();
        const a0 = flip ? Math.PI * 1.15 : -Math.PI * 0.15;
        const a1 = a0 + (flip ? -1 : 1) * Math.PI * 0.9 * st.t;
        g.lineStyle(3 * this.px, col, 1 - st.t * 0.8);
        g.beginPath(); g.arc(x, y, r, Math.min(a0, a1), Math.max(a0, a1)); g.strokePath();
        g.lineStyle(1 * this.px, 0xffffff, 1 - st.t);
        g.beginPath(); g.arc(x, y, r - 3, Math.min(a0, a1), Math.max(a0, a1)); g.strokePath();
      },
      onComplete: () => g.destroy(),
    });
  }

  /** Bisher ungenutzter Effekt-Streifen (KFX_SHEETS); frame: nur dieses Einzelbild aufploppen lassen. */
  sheet(key, x, y, { scale = 1.4, frame = null, tint = null, flip = false, rate = 12, delay = 0 } = {}) {
    const s = this.scene;
    const d = KFX_SHEETS[key];
    if (!d || !s.textures.exists(key)) return false;
    s.time.delayedCall(delay, () => {
      const o = s.add.sprite(x, y, key, frame ?? 0).setScale(scale * this.px ** 0.5).setDepth(31).setFlipX(flip);
      if (tint !== null) o.setTint(tint);
      if (frame !== null) {
        o.setScale(scale * 0.5).setAlpha(0);
        s.tweens.add({ targets: o, scale, alpha: 1, duration: 140, ease: 'Back.out' });
        s.tweens.add({ targets: o, alpha: 0, y: y - 6, duration: 320, delay: 300, onComplete: () => o.destroy() });
        return;
      }
      const anim = `${key}-play`;
      if (!s.anims.exists(anim)) s.anims.create({ key: anim, frames: s.anims.generateFrameNumbers(key, { start: 0, end: d[3] - 1 }), frameRate: rate });
      o.play(anim);
      o.once(`animationcomplete-${anim}`, () => o.destroy());
    });
    return true;
  }

  // --- Pfad-Signaturen ----------------------------------------------------------

  /**
   * Spielt die Signatur einer Fertigkeit. from: Spielermitte, targets: Mitten der Ziele (leer bei Selbstwirkung).
   * opts: pid (Pfad), def (Fertigkeit), variant (0/1/2), form (mythische Gestalt), grund (Grundfertigkeit-Id).
   */
  play({ pid, def, variant = 0, form = false, grund = null, from, targets = [] }) {
    const st = PFAD_STIL[pid] ?? PFAD_STIL.grund;
    const art = skillArt(def);
    const col = variant ? st.alt : st.col;
    const big = form ? 1.4 : 1;
    if (grund && GRUND[grund]) return this.grund(GRUND[grund], from, targets);
    const self = art === 'heal' || art === 'shield' || art === 'self' || !targets.length;
    if (self) this.selfSig(st.stil, from, st, col, variant, big, art);
    else targets.forEach((to, i) => this.scene.time.delayedCall(i * 70, () => this.hitSig(st.stil, from, to, st, col, variant, big, art)));
    if (def?.stun || def?.confuse) for (const to of targets) this.scene.time.delayedCall(260, () => this.stars(to.x, to.y));
    if (def?.burn) for (const to of targets) this.scene.time.delayedCall(260, () => this.flames(to.x, to.y, col));
    if (form) { // mythische Gestalt: ein zusätzlicher Ring in Pfadfarbe
      this.ring(from.x, from.y, st.col, { r0: 10, r1: 70, w: 2, dur: 600 });
      for (const to of targets) this.ring(to.x, to.y, st.alt, { r0: 8, r1: 56, w: 2, dur: 520, delay: 180 });
    }
  }

  grund(kind, from, targets) {
    const to = targets[0] ?? from;
    if (kind === 'doppel') { this.slash(to.x, to.y, 0xffffff, { delay: 60 }); this.slash(to.x, to.y + 4, 0xe8d8b0, { flip: true, delay: 200 }); }
    if (kind === 'blende') { this.bolt(from, to, 0xfff4c0, { size: 3, onArrive: () => { this.burst(to.x, to.y, 0xffffff, { n: 16, r: 34, size: 2 }); this.ring(to.x, to.y, 0xfff4c0, { r1: 46 }); } }); }
    if (kind === 'bann') { this.ring(from.x, from.y + 30, 0xe8c070, { r0: 6, r1: 30, flat: 0.3 }); this.bolt(from, to, 0xe8c070, { size: 4, arc: 10, onArrive: () => { this.ring(to.x, to.y, 0xe8c070, { r1: 44, w: 3 }); this.burst(to.x, to.y, 0xffe8a0, { n: 10, r: 28, shape: 'diamond' }); } }); }
  }

  /** Treffer-Signatur am Ziel to. */
  hitSig(stil, from, to, st, col, v, big, art) {
    const aoe = art === 'aoe';
    const r = 30 * big;
    switch (stil) {
      case 'glut':
        if (v) { this.rain(to.x, to.y, col, { n: 14, size: 2 }); this.flames(to.x, to.y, st.alt); }
        else this.bolt(from, to, col, { size: 4, onArrive: () => this.burst(to.x, to.y, col, { n: 14, r, grav: 14 }) });
        break;
      case 'faden':
        this.threads(from, to, col, { n: v ? 5 : 3 });
        this.scene.time.delayedCall(200, () => { this.burst(to.x, to.y, col, { n: 8, r: r * 0.7, size: 1 }); if (v) this.ring(to.x, to.y, col, { r0: 30, r1: 4, dur: 300 }); });
        break;
      case 'maske':
        if (v) this.sheet('kfx_kraehen', to.x, to.y - 10, { scale: 1, tint: col });
        this.burst(to.x, to.y, col, { n: 10, r, shape: 'diamond', size: 3 });
        this.slash(to.x, to.y, col, { flip: !!v, delay: 100 });
        break;
      case 'echo':
        for (let k = 0; k < (v ? 2 : 3); k++) this.ring(to.x, to.y, col, { r0: 4, r1: r + k * 12, delay: k * 90, w: v ? 1 : 2 });
        if (v) this.bolt(from, to, col, { size: 2, trail: 10, shape: 'circle' });
        break;
      case 'kessel':
        if (v) this.sheet('kfx_vorrat', to.x, to.y, { frame: 2, tint: col, scale: 1.1 });
        else this.bolt(from, to, col, { size: 4, arc: 26, shape: 'circle', onArrive: () => this.burst(to.x, to.y, col, { n: 12, r, grav: 20, shape: 'circle' }) });
        this.scene.time.delayedCall(180, () => this.rise(to.x, to.y, col, { n: 6, shape: 'circle', h: 26 }));
        break;
      case 'eisen':
        this.scene.time.delayedCall(150, () => {
          this.shock(to.x, to.y, col, { r1: aoe ? 70 : 46 });
          this.burst(to.x, to.y, v ? st.alt : 0xffe0a0, { n: 12, r, grav: 18, size: 2 });
          if (v) this.sheet('kfx_vorrat', to.x, to.y + 6, { frame: 0, scale: 1 });
        });
        break;
      case 'schatten':
        if (v) { this.sheet('kfx_vorrat', to.x, to.y, { frame: 5, tint: 0x6a58a8, scale: 1.1 }); this.slash(to.x, to.y, col, { flip: true, delay: 120 }); }
        else { this.smoke(from.x, from.y, col, { n: 5, r: 10 }); this.scene.time.delayedCall(140, () => this.smoke(to.x, to.y, col)); }
        break;
      case 'salz':
        if (v) this.sheet('kfx_salzbruch', to.x, to.y, { scale: 1.1 });
        else this.rain(to.x, to.y, col, { n: 16, size: 2 });
        this.scene.time.delayedCall(220, () => this.ring(to.x, to.y + 40, st.alt, { r0: 4, r1: 30, flat: 0.25 }));
        break;
      case 'moor':
        if (aoe) this.sheet('kfx_schwall', to.x, to.y + 26, { scale: 1, tint: v ? st.alt : null });
        else if (v) this.sheet('kfx_fessel', to.x, to.y + 30, { scale: 1.4, rate: 8 });
        else this.bolt(from, to, st.alt, { size: 5, arc: 18, shape: 'circle', onArrive: () => this.burst(to.x, to.y, st.alt, { n: 10, r, grav: 24, shape: 'circle', size: 3 }) });
        if (!aoe && v) this.sheet('kfx_vorrat', to.x, to.y + 10, { frame: 4, scale: 1 });
        break;
      case 'uhr':
        if (v) this.sheet('kfx_stempel', to.x, to.y, { scale: 1.3 });
        this.clock(to.x, to.y, col, { back: !!v, r: 16 * big });
        break;
      default: // neutral (Beyonder-Gegner): Geschoss und Aufprall ohne Pfadfarbe
        this.bolt(from, to, col, { size: 3, onArrive: () => this.burst(to.x, to.y, col, { n: 10, r }) });
    }
    if (aoe && stil !== 'eisen') this.shock(to.x, to.y, col, { r1: 54, delay: 120 });
  }

  /** Selbstwirkung (Schutz, Heilung, Stärkung) am Spieler. */
  selfSig(stil, at, st, col, v, big, art) {
    const { x, y } = at;
    if (art === 'shield') this.shield(x, y, col, { r: 24 * big });
    if (art === 'heal') this.rise(x, y, 0x90f0a0, { n: 8, shape: 'diamond', size: 2 });
    switch (stil) {
      case 'glut': this.rise(x, y, col, { n: 12, size: 2 }); this.flames(x, y, col); break;
      case 'faden': this.ring(x, y, col, { r0: 34, r1: 6, dur: 420 }); this.threads({ x: x - 30, y: y - 20 }, { x: x + 30, y: y + 20 }, col, { n: 2 }); break;
      case 'maske': this.burst(x, y, col, { n: 12, r: 26, shape: 'diamond', size: 2 }); if (v) this.sheet('kfx_kraehen', x, y - 10, { scale: 0.8, tint: col }); break;
      case 'echo': for (let k = 0; k < 3; k++) this.ring(x, y, col, { r0: 6, r1: 40, delay: k * 110, w: 1 }); break;
      case 'kessel': this.rise(x, y, col, { n: 10, shape: 'circle', size: 3 }); break;
      case 'eisen': this.ring(x, y + 40, col, { r0: 30, r1: 8, flat: 0.25, w: 3 }); this.shield(x, y, v ? st.alt : col, { r: 22 * big }); break;
      case 'schatten': this.smoke(x, y, col, { n: 9 }); break;
      case 'salz': this.rain(x, y, col, { n: 10, w: 30 }); if (v) this.sheet('kfx_salzbruch', x, y + 10, { scale: 0.9 }); break;
      case 'moor': this.rise(x, y + 10, col, { n: 10, shape: 'circle', size: 3, h: 24 }); if (v) this.sheet('kfx_fessel', x, y + 32, { scale: 1.2, tint: col, rate: 8 }); break;
      case 'uhr': this.clock(x, y, col, { back: !!v, r: 20 * big }); if (v) this.sheet('kfx_stempel', x, y, { scale: 1.2 }); break;
      default: this.rise(x, y, col);
    }
  }
}
