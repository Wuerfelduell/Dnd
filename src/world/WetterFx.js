// Wetter über der Karte (core/Wetter.js): Regen, Sturm mit Blitz, Schneeflocken bei Frost, treibender Nebel.
// Selbst gezeichnet (keine Grafikdatei), nur draußen. In der Nebelnacht liegt dichter, grünlicher Nebel auch über Innenräumen.
import { DEPTH } from './Lighting.js';

const RAIN = { regen: { n: 90, speed: 260, wind: 40, len: 7, alpha: 0.45 }, sturm: { n: 170, speed: 380, wind: 150, len: 10, alpha: 0.55 } };

export class WetterFx {
  constructor(scene, width, height) {
    this.scene = scene;
    this.w = width;
    this.h = height;
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH.dark + 5); // Regen und Schnee über der Nacht
    this.fogG = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH.dark - 5); // Nebel unter der Nacht, damit es dunkel bleibt
    this.veil = scene.add.rectangle(0, 0, width, height, 0x8fa89a, 0).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.dark - 6);
    this.parts = [];
    this.flash = 0;
    this.key = null;
  }

  /** Wetter setzen (nur bei Änderung neu aufbauen). */
  set(art, { outdoor = true, nebelnacht = false } = {}) {
    const kind = nebelnacht ? 'nebelnacht' : outdoor ? art : null;
    if (kind === this.key) return;
    this.key = kind;
    const rnd = (n) => Math.random() * n;
    this.parts = [];
    this.veil.setFillStyle(nebelnacht ? 0x8fa89a : 0xb8c0cc, nebelnacht ? 0.18 : kind === 'nebel' ? 0.08 : kind === 'sturm' ? 0.06 : 0);
    if (RAIN[kind]) for (let i = 0; i < RAIN[kind].n; i++) this.parts.push({ x: rnd(this.w), y: rnd(this.h), v: 0.8 + rnd(0.4) });
    if (kind === 'frost') for (let i = 0; i < 70; i++) this.parts.push({ x: rnd(this.w), y: rnd(this.h), v: 0.5 + rnd(0.8), p: rnd(6.3) });
    if (kind === 'nebel' || kind === 'nebelnacht') {
      const n = kind === 'nebelnacht' ? 16 : 9;
      for (let i = 0; i < n; i++) this.parts.push({ x: rnd(this.w), y: rnd(this.h), r: 50 + rnd(70), v: 4 + rnd(8) });
    }
    this.g.clear();
    this.fogG.clear();
  }

  update(delta) {
    if (!this.key) return;
    const dt = delta / 1000;
    const g = this.g;
    g.clear();
    const rain = RAIN[this.key];
    if (rain) {
      g.lineStyle(1, 0xa8bcd8, rain.alpha);
      for (const d of this.parts) {
        d.y += rain.speed * d.v * dt;
        d.x += rain.wind * dt;
        if (d.y > this.h) { d.y -= this.h + 10; d.x = Math.random() * this.w; }
        if (d.x > this.w) d.x -= this.w;
        g.lineBetween(d.x, d.y, d.x - rain.wind * 0.03, d.y - rain.len * d.v);
      }
      if (this.key === 'sturm') {
        if (this.flash <= 0 && Math.random() < dt * 0.08) this.flash = 0.25;
        if (this.flash > 0) { this.flash -= dt; g.fillStyle(0xf0f4ff, Math.max(0, this.flash) * 1.6); g.fillRect(0, 0, this.w, this.h); }
      }
    } else if (this.key === 'frost') {
      g.fillStyle(0xf4f8ff, 0.85);
      for (const f of this.parts) {
        f.p += dt * 1.5;
        f.y += 22 * f.v * dt;
        f.x += Math.sin(f.p) * 8 * dt;
        if (f.y > this.h) { f.y = -2; f.x = Math.random() * this.w; }
        g.fillRect(f.x, f.y, f.v > 1 ? 2 : 1, f.v > 1 ? 2 : 1);
      }
    } else {
      const dense = this.key === 'nebelnacht';
      const f = this.fogG;
      f.clear();
      for (const b of this.parts) {
        b.x += b.v * dt;
        if (b.x - b.r > this.w) b.x = -b.r;
        // weicher Rand: drei Lagen, außen am blassesten
        for (const [k, a] of [[1, 0.025], [0.75, 0.03], [0.5, 0.035]]) { f.fillStyle(dense ? 0xb0c8b8 : 0xc8d0d8, dense ? a * 1.6 : a); f.fillEllipse(b.x, b.y, b.r * 2 * k, b.r * k); }
      }
    }
  }

  destroy() {
    this.g.destroy();
    this.fogG.destroy();
    this.veil.destroy();
  }
}
