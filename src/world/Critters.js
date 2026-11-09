import { TILE } from './textures.js';
import { playSheetAnim } from './assets.js';

// Kleine Tiere in den Vierteln (Deko "creatures"): Ratten huschen, Katzen streunen und setzen sich,
// Tauben trippeln, Krähen hüpfen und flattern davon, wenn man ihnen zu nahe kommt.
// Reine Deko ohne Physik: Ziele werden nur angesteuert, wenn der Boden frei ist.

/** Verhalten je Animation aus C_08_creatures. Fehlt ein Eintrag, bleibt das Tier stehen (z. B. Motten). */
const KINDS = {
  rat: { speed: 34, range: 3.5, pause: [250, 1600], shy: 30, fleeSpeed: 70 },
  cat_walk: { speed: 15, range: 4, pause: [1800, 5200], idle: 'cat_blink', shy: 18, fleeSpeed: 40 },
  dog: { speed: 22, range: 4, pause: [1000, 3600], shy: 0 },
  pigeons: { speed: 11, range: 2, pause: [400, 2200], shy: 30, fleeSpeed: 32 },
  crow_hop: { speed: 12, range: 2, pause: [500, 2400], shy: 34, fly: 'crow_takeoff' },
};
/** Sitzende Katzen stehen ab und zu auf und laufen ein Stück. */
const ALIASES = { cat_blink: { ...KINDS.cat_walk, walk: 'cat_walk', idle: 'cat_blink', startIdle: true } };

const rnd = (a, b) => a + Math.random() * (b - a);

export class Critters {
  constructor(scene) {
    this.scene = scene;
    this.list = [];
  }

  /** Nimmt ein Deko-Sprite auf, wenn es ein laufendes Tier ist. Liefert true, wenn es übernommen wurde. */
  add(sprite, def) {
    const [sheet, name] = def.anim ?? [];
    const kind = sheet === 'creatures' && def.wander !== false ? KINDS[name] ?? ALIASES[name] : null;
    if (!kind) return false;
    // Fußpunkt als Bezug, damit die Tiefe beim Laufen stimmt
    const foot = sprite.y + sprite.displayHeight * (1 - sprite.originY);
    sprite.setOrigin(0.5, 1).setY(foot).setDepth(100 + foot);
    const c = {
      sprite, kind, walk: kind.walk ?? name, home: { x: sprite.x, y: foot }, target: null, mode: kind.startIdle ? 'sit' : 'idle',
      wait: kind.startIdle ? rnd(3000, 9000) : rnd(0, 2000), facing: def.flip ? -1 : 1, gone: 0,
    };
    this.setIdle(c);
    this.list.push(c);
    return true;
  }

  /** Ist der Punkt begehbar (kein festes Tile, kein Hindernis, innerhalb der Karte)? */
  free(x, y) {
    const s = this.scene;
    if (x < 4 || y < 4 || x > s.mapW - 4 || y > s.mapH - 2) return false;
    const tile = s.groundLayer.getTileAtWorldXY(x, y - 2);
    if (!tile || tile.collides) return false;
    for (const b of s.blockers.getChildren()) {
      const body = b.body;
      if (body.enable && x > body.left - 2 && x < body.right + 2 && y > body.top - 2 && y < body.bottom + 2) return false;
    }
    return true;
  }

  /** Prüft die Strecke in kleinen Schritten. */
  clearPath(x0, y0, x1, y1) {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6);
    for (let i = 1; i <= steps; i++) if (!this.free(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps)) return false;
    return true;
  }

  pickTarget(c) {
    const { x, y } = c.sprite;
    for (let tries = 0; tries < 8; tries++) {
      const a = Math.random() * Math.PI * 2;
      const d = rnd(0.35, 1) * c.kind.range * TILE;
      const tx = c.home.x + Math.cos(a) * d;
      const ty = c.home.y + Math.sin(a) * d * 0.6; // eher seitlich: die Tiere sind von der Seite gezeichnet
      if (Math.hypot(tx - x, ty - y) > 6 && this.clearPath(x, y, tx, ty)) return { x: tx, y: ty };
    }
    return null;
  }

  setIdle(c) {
    const spr = c.sprite;
    if (c.mode === 'sit' && c.kind.idle) { playSheetAnim(spr, 'creatures', c.kind.idle); return; }
    // Stehen: Laufanimation auf dem ersten Bild anhalten
    playSheetAnim(spr, 'creatures', c.walk);
    spr.anims.pause(spr.anims.currentAnim?.frames[0]);
  }

  setWalking(c) {
    const spr = c.sprite;
    if (spr.anims.currentAnim?.key !== `creatures-${c.walk}`) playSheetAnim(spr, 'creatures', c.walk);
    else if (spr.anims.isPaused) spr.anims.resume();
  }

  update(time, delta, blocked) {
    if (blocked) return;
    const p = this.scene.player;
    for (const c of this.list) {
      const spr = c.sprite;
      if (c.mode === 'flown') {
        c.gone -= delta;
        if (c.gone <= 0 && Math.hypot(p.x - c.home.x, p.y - c.home.y) > 90) {
          c.mode = 'idle';
          spr.setPosition(c.home.x, c.home.y).setAlpha(0).setVisible(true);
          this.scene.tweens.add({ targets: spr, alpha: 1, duration: 600 });
          this.setIdle(c);
        }
        continue;
      }
      if (c.mode === 'flying') continue;
      const dx = spr.x - p.x;
      const dy = spr.y - p.y;
      const near = Math.hypot(dx, dy);
      // Zu nah: wegfliegen oder weghuschen
      if (c.kind.shy && near < c.kind.shy && c.mode !== 'flee') {
        if (c.kind.fly) { this.flyAway(c, dx); continue; }
        const len = near || 1;
        const tx = spr.x + (dx / len) * 2.5 * TILE;
        const ty = spr.y + (dy / len) * 1.5 * TILE;
        if (this.clearPath(spr.x, spr.y, tx, ty)) { c.target = { x: tx, y: ty }; c.mode = 'flee'; this.setWalking(c); }
      }
      if (c.mode === 'idle' || c.mode === 'sit') {
        c.wait -= delta;
        if (c.wait > 0) continue;
        c.target = this.pickTarget(c);
        if (!c.target) { c.wait = rnd(...c.kind.pause); continue; }
        c.mode = 'walk';
        this.setWalking(c);
      }
      // Laufen (auch Flucht)
      const tx = c.target.x - spr.x;
      const ty = c.target.y - spr.y;
      const dist = Math.hypot(tx, ty);
      const speed = c.mode === 'flee' ? c.kind.fleeSpeed ?? c.kind.speed * 2 : c.kind.speed;
      const step = (speed * delta) / 1000;
      if (dist <= step + 0.5) {
        spr.setPosition(c.target.x, c.target.y);
        c.target = null;
        // Katzen setzen sich gern hin
        c.mode = c.kind.idle && Math.random() < 0.5 ? 'sit' : 'idle';
        c.wait = rnd(...c.kind.pause) * (c.mode === 'sit' ? 2 : 1);
        this.setIdle(c);
      } else {
        const nx = spr.x + (tx / dist) * step;
        const ny = spr.y + (ty / dist) * step;
        if (!this.free(nx, ny)) { c.target = null; c.mode = 'idle'; c.wait = rnd(200, 900); this.setIdle(c); continue; }
        spr.setPosition(nx, ny);
        if (Math.abs(tx) > 0.5) spr.setFlipX(tx < 0); // Sheets schauen nach rechts
      }
      spr.setDepth(100 + spr.y);
    }
  }

  /** Krähe fliegt auf, steigt weg und kommt später wieder. */
  flyAway(c, dx) {
    const spr = c.sprite;
    c.mode = 'flying';
    const dir = dx >= 0 ? 1 : -1;
    spr.setFlipX(dir < 0);
    playSheetAnim(spr, 'creatures', c.kind.fly);
    spr.setDepth(100 + this.scene.mapH);
    this.scene.tweens.add({
      targets: spr, x: spr.x + dir * 70, y: spr.y - 90, alpha: 0, duration: 1300, ease: 'Sine.in',
      onComplete: () => { c.mode = 'flown'; c.gone = rnd(9000, 16000); spr.setVisible(false); },
    });
  }
}
