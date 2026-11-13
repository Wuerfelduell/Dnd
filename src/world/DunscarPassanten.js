import Phaser from 'phaser';
import { DEPTH } from './Lighting.js';
import { speechBubble } from './WexmoorLife.js';
import { createCharacterSheet, TILE } from './textures.js';
import { RASTER } from '../data/dunscarKulisse.js';
import {
  DICHTE, FIGUREN, FARBSTICH, PALETTEN, ROLLEN, RICHTUNG, TRATSCH, EREIGNISSE, TAKT, tagesabschnitt, gemurmelFuer,
} from '../data/dunscarPassanten.js';

// Passanten in Dunscars Vierteln (Daten: data/dunscarPassanten.js). Reine Kulisse ohne Physik:
// Wege laufen nur über das Straßenkreuz des Viertel-Rasters (Reihen 10/11, Spalten 21/22), Haustüren und Straßenenden
// sind Start und Ziel. Wer nach Osten oder Süden geht, nimmt die rechte Spur (Reihe 11, Spalte 22), die anderen die linke.

const DIRS = ['down', 'left', 'right', 'up'];
const VIEW_W = 480;
const VIEW_H = 270;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rnd = (a, b) => a + Math.random() * (b - a);
const px = ([tx, ty]) => ({ x: tx * TILE + 8, y: ty * TILE + 15 });

export class DunscarPassanten {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.def = scene.mapDef.passanten ?? null;
    this.list = [];
    this.bubbles = [];
    this.murmelT = 0;
    this.eventT = rnd(...TAKT.ereignis) * 500; // erstes Ereignis etwas früher
    this.abschnitt = null;
    this.ends = null;
  }

  get aktiv() { return !!this.def && this.scene.splitRole !== 2; }

  build() {
    if (!this.aktiv) return;
    this.ends = this.endpunkte();
    if (this.ends.rand.length + this.ends.tuer.length < 2) { this.def = null; return; }
    this.abschnitt = tagesabschnitt(this.state.playTime);
    // Beim Betreten ist die Straße schon belebt: Leute stehen irgendwo auf ihrem Weg
    for (let i = 0; i < this.ziel(); i++) this.spawn({ mitten: true });
  }

  rebuild() {
    for (const p of this.list) this.entferne(p, true);
    this.list = [];
    this.build();
  }

  ziel() {
    const d = DICHTE[this.def.art] ?? DICHTE.wohnen;
    return d[this.abschnitt] ?? 4;
  }

  /** Start-/Zielpunkte: Straßenenden (Rand) und Haustüren, deren Weg zur Straße frei ist. */
  endpunkte() {
    const free = (t) => { const { x, y } = px(t); return s.critters?.free(x, y - 2); };
    const s = this.scene;
    const [y0] = RASTER.strasseY;
    const [x0] = RASTER.strasseX;
    // Straßenenden: Leute kommen vom Kartenrand (meist außerhalb des Bildes) und gehen dorthin
    const rand = [[[1, y0], 'W'], [[RASTER.W - 2, y0], 'E'], [[x0, 1], 'N'], [[x0, RASTER.H - 2], 'S']]
      .filter(([t]) => free(t)).map(([tile, seite]) => ({ tile, seite }));
    const tuer = [];
    for (const hx of RASTER.haeuser) {
      const t = [hx, RASTER.hausY + 1];
      const a = px(t);
      const b = px([hx, y0]);
      if (free(t) && s.critters?.clearPath(a.x, a.y - 2, b.x, b.y - 2)) tuer.push({ tile: t, seite: 'H' });
    }
    return { rand, tuer };
  }

  /** Weg in Kacheln von a nach b über das Straßenkreuz, mit Spur je Richtung. */
  weg(a, b) {
    const [y0, y1] = RASTER.strasseY;
    const [x0, x1] = RASTER.strasseX;
    const onRow = (e) => e.seite === 'W' || e.seite === 'E' || e.seite === 'H';
    const pts = [a.tile];
    if (onRow(a) && onRow(b)) {
      const y = b.tile[0] >= a.tile[0] ? y1 : y0;
      pts.push([a.tile[0], y], [b.tile[0], y]);
    } else if (!onRow(a) && !onRow(b)) {
      const x = b.tile[1] >= a.tile[1] ? x1 : x0;
      pts.push([x, a.tile[1]], [x, b.tile[1]]);
    } else if (onRow(a)) { // Zeile → Spalte: erst zur Kreuzung, dann hoch oder runter
      const x = b.tile[1] >= y0 ? x1 : x0;
      const y = x >= a.tile[0] ? y1 : y0;
      pts.push([a.tile[0], y], [x, y], [x, b.tile[1]]);
    } else { // Spalte → Zeile
      const x = a.tile[1] < y0 ? x1 : x0;
      const y = b.tile[0] >= x ? y1 : y0;
      pts.push([x, a.tile[1]], [x, y], [b.tile[0], y]);
    }
    pts.push(b.tile);
    return pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]).map(px);
  }

  /** Start und Ziel nach Tagesablauf: morgens aus den Häusern hinaus, abends heim. */
  route() {
    const { rand, tuer } = this.ends;
    const alle = [...rand, ...tuer];
    const r = RICHTUNG[this.abschnitt];
    let a; let b;
    if (r === 'raus' && tuer.length && rand.length && Math.random() < 0.7) { a = pick(tuer); b = pick(rand); }
    else if (r === 'heim' && tuer.length && rand.length && Math.random() < 0.7) { a = pick(rand); b = pick(tuer); }
    else { a = pick(alle); b = pick(alle.filter((e) => e !== a)); }
    return b ? this.weg(a, b) : null;
  }

  /** Figur wählen: Lauf-Blatt aus alten Gebieten, in Dunscar immer eingefärbt (Kalk, Ruß, Rost). */
  look(rolle) {
    const s = this.scene;
    const blaetter = FIGUREN.filter((f) => f.rollen.includes(rolle) && s.textures.exists(f.sheet));
    if (blaetter.length) return { key: pick(blaetter).sheet, tint: pick(FARBSTICH) };
    // nur falls keine Lauf-Blätter geladen sind: Arbeitskleidung aus dem Zeichner
    const pal = PALETTEN.filter((p) => p.rollen.includes(rolle));
    const i = PALETTEN.indexOf(pick(pal.length ? pal : PALETTEN));
    const key = `dsp_passant_${i}`;
    createCharacterSheet(s, key, PALETTEN[i].palette);
    return { key, tint: 0xffffff };
  }

  spawn({ mitten = false, rolle = null, pfad = null, rufe = null, langsam = false, licht = false } = {}) {
    const s = this.scene;
    const pts = pfad ?? this.route();
    if (!pts || pts.length < 2) return null;
    const r = rolle ?? pick(ROLLEN[this.abschnitt] ?? ROLLEN.mittag);
    const { key, tint } = this.look(r);
    let seg = 0;
    let start = { ...pts[0] };
    if (mitten) { // irgendwo auf dem Weg einsetzen
      seg = Math.floor(Math.random() * (pts.length - 1));
      const t = Math.random();
      start = { x: pts[seg].x + (pts[seg + 1].x - pts[seg].x) * t, y: pts[seg].y + (pts[seg + 1].y - pts[seg].y) * t };
    }
    const spr = s.add.sprite(start.x, start.y, key, 0).setOrigin(0.5, 1).setDepth(100 + start.y).setTint(tint).setAlpha(mitten ? 1 : 0);
    if (!mitten) s.tweens.add({ targets: spr, alpha: 1, duration: 500 });
    const speed = langsam ? rnd(9, 12) : r === 'kind' ? rnd(30, 38) : this.abschnitt === 'morgen' ? rnd(22, 30) : rnd(14, 22);
    const p = { spr, key, pts, seg: seg + 1, speed, wait: 0, murmelt: false, rolle: r, rufe, wobble: langsam, facing: 'down', licht: null, fertig: false };
    if (licht && s.lighting) p.licht = s.lighting.add({ x: start.x, y: start.y, follow: spr, offsetY: -18, radius: 46, intensity: 0.9, color: 0xffc070, glowAlpha: 0.3, flicker: 0.15 });
    this.list.push(p);
    return p;
  }

  entferne(p, sofort = false) {
    if (p.fertig && !sofort) return;
    p.fertig = true;
    const weg = () => {
      if (p.licht) this.scene.lighting?.remove?.(p.licht);
      p.spr.destroy();
    };
    if (sofort) weg();
    else this.scene.tweens.add({ targets: p.spr, alpha: 0, duration: 450, onComplete: weg });
  }

  /** Sprechblase über einer Figur (ohne Kamera-Bewegung: an der Figur festgemacht). */
  sag(who, text, ms = 2600) {
    const s = this.scene;
    if (!text || !who?.active) return;
    const b = speechBubble(s, text, who, s.cameras.main.worldView);
    const dx = b.x - who.x;
    const dy = b.y - who.y;
    const entry = { b, who, dx, dy };
    this.bubbles.push(entry);
    s.tweens.add({ targets: b, alpha: 0.95, duration: 180 });
    s.tweens.add({ targets: b, alpha: 0, delay: ms - 350, duration: 300, onComplete: () => { b.destroy(); this.bubbles = this.bubbles.filter((e) => e !== entry); } });
  }

  sichtbar(spr) {
    const v = this.scene.cameras.main.worldView;
    return spr.x > v.x + 8 && spr.x < v.right - 8 && spr.y > v.y + 24 && spr.y < v.bottom;
  }

  face(p, dir) {
    p.facing = dir;
    p.spr.anims?.stop();
    p.spr.setFrame(DIRS.indexOf(dir) * 4);
  }

  walkAnim(p, dir) {
    const s = this.scene;
    const anim = `${p.key}-walk-${dir}`;
    if (!s.anims.exists(anim) && s.textures.get(p.key).frameTotal > DIRS.indexOf(dir) * 4 + 3) {
      s.anims.create({ key: anim, frames: s.anims.generateFrameNumbers(p.key, { start: DIRS.indexOf(dir) * 4, end: DIRS.indexOf(dir) * 4 + 3 }), frameRate: 6, repeat: -1 });
    }
    if (s.anims.exists(anim) && p.spr.anims?.currentAnim?.key !== anim) p.spr.play(anim);
    p.facing = dir;
  }

  update(delta, blocked) {
    if (!this.aktiv || !this.ends) return;
    const s = this.scene;
    for (const e of this.bubbles) if (e.who.active) e.b.setPosition(e.who.x + e.dx, e.who.y + e.dy);
    if (blocked) { for (const p of this.list) p.spr.anims?.pause(); return; }
    const jetzt = tagesabschnitt(this.state.playTime);
    if (jetzt !== this.abschnitt) {
      this.abschnitt = jetzt;
      if (jetzt === 'morgen' || jetzt === 'abend') this.ereignis('schichtglocke'); // Schichtbeginn und Feierabend
    }
    // Leute laufen ihren Weg ab
    for (const p of this.list) {
      if (p.fertig) continue;
      if (p.wait > 0) { p.wait -= delta; continue; }
      const t = p.pts[p.seg];
      const dx = t.x - p.spr.x;
      const dy = t.y - p.spr.y;
      const dist = Math.hypot(dx, dy);
      const step = (p.speed * delta) / 1000;
      if (dist <= step) {
        p.spr.setPosition(t.x, t.y);
        p.seg++;
        if (p.seg >= p.pts.length) {
          if (p.pts.length > 2 && t.y <= (RASTER.hausY + 1) * TILE + 15 && this.sichtbar(p.spr)) s.sfx?.('tuer_zu', { volume: 0.3 }); // geht ins Haus
          this.entferne(p);
          continue;
        }
        // an der Kreuzung bleibt mancher kurz stehen und schaut sich um
        if (Math.random() < 0.12) { p.wait = rnd(900, 2600); this.face(p, pick(DIRS)); }
      } else {
        this.walkAnim(p, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        p.spr.anims?.resume();
        const wob = p.wobble ? Math.sin(s.time.now / 260) * 0.6 : 0;
        p.spr.setPosition(p.spr.x + (dx / dist) * step + (Math.abs(dy) > Math.abs(dx) ? wob : 0), p.spr.y + (dy / dist) * step + (Math.abs(dx) >= Math.abs(dy) ? wob : 0));
      }
      p.spr.setDepth(100 + p.spr.y);
    }
    this.list = this.list.filter((p) => !p.fertig);
    // Nachschub nach Tagesablauf
    if (this.list.filter((p) => !p.event).length < this.ziel() && Math.random() < delta / 1800) this.spawn();
    this.murmeln(delta);
    this.tratschen();
    this.eventT -= delta / 1000;
    if (this.eventT <= 0) {
      this.eventT = rnd(...TAKT.ereignis);
      const art = this.def.art;
      const passend = Object.entries(EREIGNISSE).filter(([id, e]) => id !== 'schichtglocke' && e.wann.includes(this.abschnitt) && (!e.arten.length || e.arten.includes(art)));
      if (passend.length) this.ereignis(pick(passend)[0]);
    }
  }

  /** Wer nah an Spieler 1 oder 2 vorbeigeht, sagt einen Satz (mit Pause dazwischen). */
  murmeln(delta) {
    this.murmelT -= delta;
    if (this.murmelT > 0) return;
    const s = this.scene;
    const spieler = [s.player, s.p2].filter(Boolean);
    for (const p of this.list) {
      if (p.murmelt || p.fertig || p.event) continue;
      const nah = spieler.find((pl) => Math.hypot(pl.x - p.spr.x, pl.y - p.spr.y) < TAKT.gemurmelReichweite);
      if (!nah) continue;
      p.murmelt = true;
      const { normal, bedingt } = gemurmelFuer(this.state, this.def.art, this.abschnitt);
      const text = bedingt.length && Math.random() < 0.45 ? pick(bedingt) : pick(normal);
      this.face(p, Math.abs(nah.x - p.spr.x) > Math.abs(nah.y - p.spr.y) ? (nah.x > p.spr.x ? 'right' : 'left') : (nah.y > p.spr.y ? 'down' : 'up'));
      p.wait = 1400;
      this.sag(p.spr, text);
      this.murmelT = TAKT.gemurmelPause;
      return;
    }
  }

  /** Zwei Passanten, die sich begegnen, bleiben manchmal stehen und tratschen. */
  tratschen() {
    if (this.tratschLaeuft) return;
    const frei = this.list.filter((p) => !p.fertig && !p.event && !p.getratscht && p.wait <= 0 && this.sichtbar(p.spr));
    for (let i = 0; i < frei.length; i++) {
      for (let j = i + 1; j < frei.length; j++) {
        const a = frei[i];
        const b = frei[j];
        if (Math.hypot(a.spr.x - b.spr.x, a.spr.y - b.spr.y) > 18) continue;
        a.getratscht = b.getratscht = true;
        if (Math.random() > TAKT.tratschChance) continue;
        this.gespraech(a, b, pick(TRATSCH));
        return;
      }
    }
  }

  gespraech(a, b, zeilen) {
    const ms = TAKT.tratschZeile;
    this.tratschLaeuft = true;
    a.wait = b.wait = zeilen.length * ms + 300;
    this.face(a, Math.abs(b.spr.x - a.spr.x) > Math.abs(b.spr.y - a.spr.y) ? (b.spr.x > a.spr.x ? 'right' : 'left') : (b.spr.y > a.spr.y ? 'down' : 'up'));
    this.face(b, Math.abs(a.spr.x - b.spr.x) > Math.abs(a.spr.y - b.spr.y) ? (a.spr.x > b.spr.x ? 'right' : 'left') : (a.spr.y > b.spr.y ? 'down' : 'up'));
    zeilen.forEach((z, i) => this.scene.time.delayedCall(i * ms, () => this.sag((i % 2 ? b : a).spr, z, ms)));
    this.scene.time.delayedCall(zeilen.length * ms, () => { this.tratschLaeuft = false; });
  }

  /** Straßenereignisse. Liefert true, wenn etwas passiert ist. */
  ereignis(id) {
    const e = EREIGNISSE[id];
    const s = this.scene;
    if (!e || !this.ends) return false;
    if (e.ton) s.sfx?.(e.ton, { volume: 0.5 });
    const rufe = Array.isArray(e.rufe) ? e.rufe : e.rufe?.[this.abschnitt] ?? [];
    const naechster = () => this.list.filter((p) => !p.fertig && this.sichtbar(p.spr)).sort((a, b) => Math.hypot(a.spr.x - s.player.x, a.spr.y - s.player.y) - Math.hypot(b.spr.x - s.player.x, b.spr.y - s.player.y))[0];
    switch (id) {
      case 'schichtglocke': {
        for (let i = 0; i < 4; i++) s.time.delayedCall(i * 700, () => this.spawn({ rolle: 'arbeiter' }));
        const p = naechster();
        if (p) this.sag(p.spr, pick(rufe));
        else s.time.delayedCall(1200, () => { const q = naechster(); if (q) this.sag(q.spr, pick(rufe)); });
        return true;
      }
      case 'zeitung': {
        const titel = this.schlagzeilen();
        const p = this.spawn({ rolle: 'kind', pfad: this.querweg() });
        if (!p) return false;
        p.event = true;
        p.speed = 20;
        const rufe2 = [...rufe, ...titel];
        for (let i = 0; i < 4; i++) s.time.delayedCall(800 + i * 4200, () => { if (!p.fertig && this.sichtbar(p.spr)) this.sag(p.spr, pick(rufe2), 3000); });
        return true;
      }
      case 'kalkboe': {
        const veil = s.add.rectangle(0, 0, VIEW_W, VIEW_H, 0xe8e0cc).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.dark + 3).setAlpha(0);
        s.tweens.add({ targets: veil, alpha: 0.38, duration: 900, yoyo: true, hold: 1400, onComplete: () => veil.destroy() });
        s.cameras.main.shake(500, 0.0015);
        for (const p of this.list.filter((q) => !q.fertig && this.sichtbar(q.spr)).slice(0, 3)) { p.wait = 2200; this.face(p, 'down'); }
        const p = naechster();
        if (p) s.time.delayedCall(700, () => this.sag(p.spr, pick(rufe)));
        return true;
      }
      case 'streit': {
        const zeilen = pick(e.zeilen);
        const [y0] = RASTER.strasseY;
        const mx = Phaser.Math.Clamp(Math.floor(s.player.x / TILE), 3, RASTER.W - 4);
        const a = this.spawn({ pfad: [px([mx - 2, y0]), px([mx - 1, y0])], rolle: 'arbeiter' });
        const b = this.spawn({ pfad: [px([mx + 2, y0]), px([mx + 1, y0])], rolle: 'markt' });
        if (!a || !b) { for (const p of [a, b]) if (p) this.entferne(p, true); return false; }
        a.event = b.event = true;
        s.time.delayedCall(1500, () => {
          if (a.fertig || b.fertig) return;
          this.gespraech(a, b, zeilen);
          // danach gehen beide getrennt weiter
          s.time.delayedCall(zeilen.length * TAKT.tratschZeile + 400, () => {
            for (const p of [a, b]) if (!p.fertig) { const r = this.route(); if (r) { p.pts = [{ x: p.spr.x, y: p.spr.y }, ...r.slice(1)]; p.seg = 1; } }
          });
        });
        return true;
      }
      case 'nachtwache': {
        const p = this.spawn({ rolle: 'nacht', pfad: this.querweg(), licht: true });
        if (!p) return false;
        p.event = true;
        p.speed = 13;
        for (let i = 0; i < 3; i++) s.time.delayedCall(1500 + i * 6000, () => { if (!p.fertig && this.sichtbar(p.spr)) this.sag(p.spr, pick(rufe), 3000); });
        return true;
      }
      case 'betrunken': {
        const p = this.spawn({ rolle: 'nacht', langsam: true });
        if (!p) return false;
        p.event = true;
        for (let i = 0; i < 3; i++) s.time.delayedCall(2000 + i * 7000, () => { if (!p.fertig && this.sichtbar(p.spr)) this.sag(p.spr, pick(rufe), 3200); });
        return true;
      }
      case 'gueterzug': {
        s.time.delayedCall(600, () => s.sfx?.('zug_pfeife', { volume: 0.4 }));
        s.cameras.main.shake(2200, 0.0012);
        for (const p of this.list.filter((q) => !q.fertig && this.sichtbar(q.spr))) { p.wait = 1800; this.face(p, 'down'); }
        const p = naechster();
        if (p) s.time.delayedCall(1200, () => this.sag(p.spr, pick(rufe)));
        return true;
      }
      default: return false;
    }
  }

  /** Einmal quer über die Hauptstraße, von einem Rand zum anderen (oder Tür zu Rand). */
  querweg() {
    const { rand, tuer } = this.ends;
    const w = rand.find((r) => r.seite === 'W');
    const o = rand.find((r) => r.seite === 'E');
    if (w && o) return Math.random() < 0.5 ? this.weg(w, o) : this.weg(o, w);
    const alle = [...rand, ...tuer];
    if (alle.length < 2) return null;
    const a = pick(alle);
    return this.weg(a, pick(alle.filter((x) => x !== a)));
  }

  /** Schlagzeilen aus dem Dunscarer Kalkblatt, die gerade gelten (k3_leben zeitung). */
  schlagzeilen() {
    const st = this.state;
    return (st.content?.newspapers ?? []).filter((n) => /kalkblatt|dunscar/.test(n.zeitung ?? '') && st.meets?.(n)).map((n) => n.title).filter(Boolean).slice(-6);
  }
}
