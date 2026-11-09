import Phaser from 'phaser';
import { TILE } from './textures.js';

// Tap-to-run fürs Handy (geht auch mit der Maus): irgendwo hintippen, die Figur läuft hin.
// Tippt man auf eine Person oder einen Gegenstand, läuft sie hin und spricht/untersucht.
// Finger gedrückt halten und ziehen: die Figur folgt dem Finger.

const FEET = 3; // Mitte des Fußkörpers liegt 3 px über player.y
const ARRIVE = 2.5;
const REPATH_MS = 140;

export class TapMove {
  constructor(scene) {
    this.scene = scene;
    this.path = null; // Wegpunkte [{x, y}] (Fußmitte)
    this.target = null; // Interaktionsziel
    this.held = false;
    this.lastPath = 0;
    this.stuck = 0;
    this.marker = null;
    const input = scene.input;
    input.on('pointerdown', (p) => this.down(p));
    input.on('pointermove', (p) => this.move(p));
    input.on('pointerup', () => { this.held = false; });
    input.on('pointerupoutside', () => { this.held = false; });
  }

  get active() { return !!this.path; }

  cancel() {
    this.path = null;
    this.target = null;
    this.held = false;
    this.marker?.setVisible(false);
  }

  down(pointer) {
    const s = this.scene;
    if (s.ui.isBlocking() || s.leaving || !s.player) return;
    s.ui.holdClicks?.();
    const x = pointer.worldX;
    const y = pointer.worldY;
    const it = this.pick(x, y);
    this.held = !it;
    if (it && this.inReach(it)) { this.cancel(); s.pending = 'interact'; s.focus = it; this.forced = it; return; }
    this.target = it;
    this.goTo(it ? it.x : x, it ? it.y : y);
  }

  move(pointer) {
    if (!this.held || !pointer.isDown) return;
    const now = this.scene.time.now;
    if (now - this.lastPath < REPATH_MS) return;
    this.target = null;
    this.goTo(pointer.worldX, pointer.worldY);
  }

  /** Was liegt unter dem Finger? Personen sind höher als ihr Fußpunkt, deshalb ein hohes Kästchen. */
  pick(x, y) {
    const s = this.scene;
    let best = null;
    let bestD = Infinity;
    for (const it of s.interactables) {
      if (!it.active || (it.hidden && !s.state.spiritVision)) continue;
      if (it.def?.auto) continue;
      const dx = Math.abs(x - it.x);
      const dy = y - it.y;
      const tall = it.kind === 'npc' ? 30 : 16;
      if (dx > 12 || dy < -tall || dy > 10) continue;
      const d = dx + Math.abs(dy + (it.kind === 'npc' ? 12 : 0)) * 0.5;
      if (d < bestD) { best = it; bestD = d; }
    }
    return best;
  }

  inReach(it) {
    const p = this.scene.player;
    return Phaser.Math.Distance.Between(p.x, p.y - FEET, it.x, it.y) < it.reach;
  }

  // --- Wegsuche auf dem Kachelraster ---------------------------------------------

  blockedGrid() {
    const s = this.scene;
    const rows = s.mapDef.rows;
    const h = rows.length;
    const w = rows[0].length;
    const grid = new Uint8Array(w * h);
    for (let ty = 0; ty < h; ty++) {
      for (let tx = 0; tx < w; tx++) {
        if (s.groundLayer.getTileAt(tx, ty)?.collides) grid[ty * w + tx] = 1;
      }
    }
    // Hindernisse (Möbel, Personen): eine Kachel ist zu, wenn das Hindernis ihre Mitte überdeckt
    for (const b of s.blockers.getChildren()) {
      const body = b.body;
      if (!body || !body.enable) continue;
      const x0 = Math.max(0, Math.floor((body.x + 3) / TILE));
      const x1 = Math.min(w - 1, Math.floor((body.right - 3) / TILE));
      const y0 = Math.max(0, Math.floor((body.y + 2) / TILE));
      const y1 = Math.min(h - 1, Math.floor((body.bottom - 2) / TILE));
      for (let ty = y0; ty <= y1; ty++) {
        for (let tx = x0; tx <= x1; tx++) {
          const cx = tx * TILE + 8;
          const cy = ty * TILE + 8;
          if (body.right > cx - 5 && body.x < cx + 5 && body.bottom > cy - 3 && body.y < cy + 3) grid[ty * w + tx] = 1;
        }
      }
    }
    return { grid, w, h };
  }

  goTo(x, y) {
    const s = this.scene;
    const p = s.player;
    this.lastPath = s.time.now;
    const { grid, w, h } = this.blockedGrid();
    const sx = Phaser.Math.Clamp(Math.floor(p.x / TILE), 0, w - 1);
    const sy = Phaser.Math.Clamp(Math.floor((p.y - FEET) / TILE), 0, h - 1);
    const start = sy * w + sx;
    // Breitensuche (8 Richtungen, keine Ecken schneiden); Ziel = erreichbare Kachel, die dem Tipp am nächsten liegt
    const prev = new Int32Array(w * h).fill(-1);
    prev[start] = start;
    const queue = [start];
    let best = start;
    let bestD = Infinity;
    const gx = x / TILE - 0.5;
    const gy = y / TILE - 0.5;
    for (let qi = 0; qi < queue.length; qi++) {
      const i = queue[qi];
      const tx = i % w;
      const ty = (i - tx) / w;
      const d = (tx - gx) ** 2 + (ty - gy) ** 2;
      if (d < bestD - 0.01) { best = i; bestD = d; }
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (!ox && !oy) continue;
          const nx = tx + ox;
          const ny = ty + oy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (prev[j] !== -1 || grid[j]) continue;
          if (ox && oy && (grid[ty * w + nx] || grid[ny * w + tx])) continue;
          prev[j] = i;
          queue.push(j);
        }
      }
    }
    const tiles = [];
    for (let i = best; i !== start; i = prev[i]) tiles.push(i);
    tiles.reverse();
    const pts = tiles.map((i) => ({ x: (i % w) * TILE + 8, y: Math.floor(i / w) * TILE + 8 }));
    // Letztes Stück: genau zum Tipp, wenn er auf freiem Boden liegt
    const tipFree = !this.target && !grid[Math.floor(y / TILE) * w + Math.floor(x / TILE)] && Math.floor(y / TILE) * w + Math.floor(x / TILE) === best;
    if (tipFree) {
      if (pts.length) pts[pts.length - 1] = { x, y: y };
      else pts.push({ x, y });
    }
    this.path = this.smooth(pts, grid, w, h);
    this.stuck = 0;
    this.lastPos = null;
    if (!this.path.length && !this.target) { this.path = null; return; }
    this.showMarker(this.target ? this.target.x : x, this.target ? this.target.y : y);
  }

  /** Wegpunkte überspringen, solange der direkte Weg frei ist (sonst läuft die Figur Treppchen). */
  smooth(pts, grid, w, h) {
    if (pts.length < 3) return pts;
    const free = (ax, ay, bx, by) => {
      const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 3);
      for (let k = 1; k <= n; k++) {
        const px = ax + ((bx - ax) * k) / n;
        const py = ay + ((by - ay) * k) / n;
        for (const [ox, oy] of [[-5, -3], [5, -3], [-5, 3], [5, 3]]) {
          const tx = Math.floor((px + ox) / TILE);
          const ty = Math.floor((py + oy) / TILE);
          if (tx < 0 || ty < 0 || tx >= w || ty >= h || grid[ty * w + tx]) return false;
        }
      }
      return true;
    };
    const p = this.scene.player;
    const out = [];
    let cx = p.x;
    let cy = p.y - FEET;
    let i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !free(cx, cy, pts[j].x, pts[j].y)) j--;
      out.push(pts[j]);
      cx = pts[j].x;
      cy = pts[j].y;
      i = j + 1;
    }
    return out;
  }

  showMarker(x, y) {
    const s = this.scene;
    if (!this.marker) {
      this.marker = s.add.graphics().setDepth(99);
    }
    const g = this.marker;
    g.clear().setVisible(true).setAlpha(1).setPosition(x, y);
    g.lineStyle(1, 0xe8c070, 0.9).strokeEllipse(0, 0, 10, 5);
    g.fillStyle(0xe8c070, 0.35).fillEllipse(0, 0, 4, 2);
    s.tweens.killTweensOf(g);
    s.tweens.add({ targets: g, alpha: 0.25, duration: 600, yoyo: true, repeat: -1 });
  }

  /** Richtung für diesen Frame (oder null, wenn kein Tap-Weg aktiv ist). */
  steer(delta) {
    const s = this.scene;
    const p = s.player;
    if (!this.path) return null;
    if (this.target) {
      if (!this.target.active) { this.cancel(); return null; }
      if (this.inReach(this.target)) {
        const it = this.target;
        this.cancel();
        s.focus = it;
        this.forced = it;
        s.pending = 'interact';
        return null;
      }
    }
    const fx = p.x;
    const fy = p.y - FEET;
    while (this.path.length && Math.hypot(this.path[0].x - fx, this.path[0].y - fy) < ARRIVE) this.path.shift();
    if (!this.path.length) {
      if (this.target) { // am Rand angekommen, aber nicht in Reichweite: nicht erreichbar
        this.cancel();
      } else if (!this.held) this.cancel();
      else { this.path = []; }
      return null;
    }
    // Hängt fest (z. B. an einer Ecke oder einer anderen Figur)?
    if (this.lastPos && Math.hypot(fx - this.lastPos.x, fy - this.lastPos.y) < 0.15 * (delta / 16)) this.stuck += delta;
    else this.stuck = 0;
    this.lastPos = { x: fx, y: fy };
    if (this.stuck > 450) { this.cancel(); return null; }
    const wp = this.path[0];
    return [wp.x - fx, wp.y - fy];
  }
}
