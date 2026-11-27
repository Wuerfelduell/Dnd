import Phaser from 'phaser';

/**
 * Geistsicht (Seb 2026-11-27): Wer die Geistsicht an hat, sieht um jeden Beyonder eine Aura, um Figuren wie um Gegner.
 * Kein Schild und kein Abzeichen verrät mehr, wer Beyonder ist. Die Aura ist blass, solange man den Pfad nicht kennt;
 * hat man ihn im Gespräch erfahren (state.npcPfadBekannt), leuchtet sie in der Pfadfarbe.
 */
const NEUTRAL = 0xd8ccff;

export class BeyonderAuras {
  constructor(scene) {
    this.scene = scene;
    this.list = [];
  }

  /** sprite: Figur, der die Aura folgt. color(): Farbe als Zahl oder null für blass. */
  add(sprite, color = () => null) {
    const s = this.scene;
    const outer = s.add.ellipse(sprite.x, sprite.y, 22, 30, NEUTRAL, 0.18).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    const inner = s.add.ellipse(sprite.x, sprite.y, 14, 22, NEUTRAL, 0.22).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    const ring = s.add.ellipse(sprite.x, sprite.y, 16, 5).setStrokeStyle(1, NEUTRAL, 0.7).setVisible(false);
    const a = { sprite, color, outer, inner, ring, phase: Math.random() * 6 };
    this.list.push(a);
    return a;
  }

  update(time, on) {
    this.list = this.list.filter((a) => {
      if (!a.sprite.active) { a.outer.destroy(); a.inner.destroy(); a.ring.destroy(); return false; }
      return true;
    });
    for (const a of this.list) {
      const show = on && a.sprite.visible && a.sprite.alpha > 0.1;
      for (const o of [a.outer, a.inner, a.ring]) o.setVisible(show);
      if (!show) continue;
      const col = a.color() ?? NEUTRAL;
      const h = a.sprite.displayHeight || 24;
      const cx = a.sprite.x;
      const cy = a.sprite.y - h * (a.sprite.originY ?? 1) + h * 0.5;
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.004 + a.phase);
      const sc = Math.max(1, h / 24);
      a.outer.setPosition(cx, cy).setSize(22 * sc, 34 * sc).setFillStyle(col, 0.18 + 0.12 * pulse).setDepth(a.sprite.depth - 0.2);
      a.inner.setPosition(cx, cy).setSize(14 * sc, 24 * sc).setFillStyle(col, 0.24 + 0.12 * pulse).setDepth(a.sprite.depth - 0.1);
      a.ring.setPosition(cx, a.sprite.y + h * (1 - (a.sprite.originY ?? 1)) - 1).setSize(16 * sc + pulse * 4, 5 * sc).setStrokeStyle(1, col, 0.5 + 0.4 * pulse).setDepth(a.sprite.depth - 0.3);
    }
  }
}
