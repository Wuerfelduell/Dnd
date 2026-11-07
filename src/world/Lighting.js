import Phaser from 'phaser';

// Nachtbeleuchtung: eine bildschirmgroße Dunkelheits-Textur, aus der jede Lichtquelle
// ein weiches Loch "radiert". Darunter liegen additive Farbschimmer (warmes Gaslicht),
// sodass Nebel und Pflaster um die Laternen herum aufglühen.

export const DEPTH = { glow: 2000, fog: 2100, dark: 2200, vision: 2300 };

export class Lighting {
  constructor(scene, { width, height }) {
    this.scene = scene;
    this.lights = [];
    this.nightColor = 0x070914;
    this.nightAlpha = 0.88;
    this.darkness = scene.add.renderTexture(0, 0, width, height).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.dark);
    this.brush = scene.make.image({ key: 'light', add: false }).setOrigin(0.5);
  }

  /**
   * @param {object} opts x, y, radius, intensity (0..1), color (Glanzfarbe), glowAlpha,
   *   flicker (0..1), follow (GameObject mit x/y), offsetX/Y, active () => bool
   */
  add(opts) {
    const light = {
      radius: 60, intensity: 1, color: 0xffc070, glowAlpha: 0.22, flicker: 0,
      offsetX: 0, offsetY: 0, active: () => true, seed: Math.random() * 1000, ...opts,
    };
    light.glow = this.scene.add.image(light.x, light.y, 'glow')
      .setBlendMode(Phaser.BlendModes.ADD).setTint(light.color).setDepth(DEPTH.glow);
    this.lights.push(light);
    return light;
  }

  update(time) {
    const cam = this.scene.cameras.main;
    const view = cam.worldView;
    this.darkness.clear();
    this.darkness.fill(this.nightColor, this.nightAlpha);
    for (const l of this.lights) {
      if (l.follow) { l.x = l.follow.x + l.offsetX; l.y = l.follow.y + l.offsetY; }
      const on = l.active();
      l.glow.setVisible(on);
      if (!on) continue;
      const f = l.flicker
        ? 1 - l.flicker * (0.5 + 0.5 * Math.sin(time * 0.011 + l.seed) * Math.sin(time * 0.0037 + l.seed * 3))
        : 1;
      const r = l.radius * (0.96 + 0.04 * f);
      l.glow.setPosition(l.x, l.y).setScale((r * 1.3) / 32).setAlpha(l.glowAlpha * f);
      if (l.x + r < view.x || l.x - r > view.right || l.y + r < view.y || l.y - r > view.bottom) continue;
      this.brush.setScale((r * 2) / 128).setAlpha(l.intensity * f).setPosition(l.x - view.x, l.y - view.y);
      this.darkness.erase(this.brush);
    }
  }
}
