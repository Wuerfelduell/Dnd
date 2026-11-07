import Phaser from 'phaser';
import { createTextures, createCharacterSheet, hash2, TILE, TILE_INDEX, SOLID_KEYS } from './textures.js';
import { Lighting, DEPTH } from './Lighting.js';

export const VIEW_W = 480;
export const VIEW_H = 270;

const PLAYER_SPEED = 72;
const INTERACT_RANGE = 22;
const DIRS = ['down', 'left', 'right', 'up'];

const PLAYER_PALETTE = {
  coat: '#6a5a48', hat: '#2e2a26', skin: '#e0b894', hair: '#3a2a20', legs: '#2c2a30', scarf: '#7a3a3a',
};

/** Wählt für ein Kartenzeichen den passenden Tile-Index (inkl. Variationen). */
export function tileIndexFor(rows, x, y) {
  const ch = rows[y][x];
  const at = (dx, dy) => rows[y + dy]?.[x + dx];
  switch (ch) {
    case '.': return TILE_INDEX[`cobble${Math.floor(hash2(x, y) * 4)}`];
    case ',': case 'L': case 'X': return TILE_INDEX[hash2(x, y, 3) > 0.8 ? 'walk1' : 'walk0'];
    case '#': return TILE_INDEX.brick;
    case 'W': return TILE_INDEX.window;
    case 'D': return TILE_INDEX.door;
    case 'R': return TILE_INDEX[at(0, 1) && at(0, 1) !== 'R' ? 'roofEaveBottom' : 'roofEaveTop'];
    case 'f': return TILE_INDEX.fence;
    case '~': return TILE_INDEX[hash2(x, y, 5) > 0.5 ? 'water1' : 'water0'];
    case '=':
      if (at(-1, 0) !== '=') return TILE_INDEX.bridgeLeft;
      if (at(1, 0) !== '=') return TILE_INDEX.bridgeRight;
      return TILE_INDEX.bridgeMid;
    default: throw new Error(`Unbekanntes Kartenzeichen "${ch}" bei ${x},${y}`);
  }
}

export class StreetScene extends Phaser.Scene {
  constructor() {
    super('street');
  }

  create() {
    this.state = this.registry.get('state');
    this.ui = this.registry.get('ui');
    this.caseData = this.state.caseData;
    this.interactables = [];
    this.cleanups = [];

    createTextures(this);
    this.buildMap();
    this.lighting = new Lighting(this, { width: VIEW_W, height: VIEW_H });
    this.blockers = this.physics.add.staticGroup();
    this.buildLamps();
    this.buildWindows();
    this.buildClues();
    this.buildNpcs();
    this.buildPlayer();
    this.buildAtmosphere();
    this.bindInput();
    this.bindState();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanups.forEach((fn) => fn()));
    this.ui.onSceneReady(this);
  }

  // --- Aufbau ---------------------------------------------------------------

  buildMap() {
    const rows = this.caseData.map;
    this.mapW = rows[0].length * TILE;
    this.mapH = rows.length * TILE;
    const data = rows.map((row, y) => [...row].map((_, x) => tileIndexFor(rows, x, y)));
    const map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0);
    this.groundLayer = map.createLayer(0, tileset, 0, 0).setDepth(0);
    this.groundLayer.setCollision(SOLID_KEYS.map((k) => TILE_INDEX[k]));
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);
  }

  forEachTile(chars, fn) {
    this.caseData.map.forEach((row, y) => [...row].forEach((ch, x) => chars.includes(ch) && fn(x, y, ch)));
  }

  addBlocker(x, y, w, h) {
    const zone = this.add.zone(x, y, w, h);
    this.physics.add.existing(zone, true);
    this.blockers.add(zone);
    return zone;
  }

  buildLamps() {
    this.forEachTile(['L', 'X'], (tx, ty, ch) => {
      const x = tx * TILE + 8;
      const y = ty * TILE + 15;
      const lit = ch === 'L';
      this.add.image(x, y + 1, lit ? 'lamp_lit' : 'lamp_frost').setOrigin(0.5, 1).setDepth(100 + y);
      this.addBlocker(x, y - 2, 6, 4);
      if (lit) {
        this.lighting.add({ x, y: y - 36, radius: 78, intensity: 1, color: 0xffb860, glowAlpha: 0.32, flicker: 0.12 });
      } else {
        // Die erloschene Laterne strahlt in der Geistsicht eine kalte Aura aus.
        this.lighting.add({
          x, y: y - 36, radius: 34, intensity: 0.55, color: 0x6fe0d0, glowAlpha: 0.35, flicker: 0.3,
          active: () => this.state.spiritVision,
        });
      }
    });
  }

  buildWindows() {
    this.caseData.map.forEach((row, ty) => {
      for (const m of row.matchAll(/W+/g)) {
        const x = (m.index + m[0].length / 2) * TILE;
        this.lighting.add({ x, y: ty * TILE + 8, radius: 22 + m[0].length * 6, intensity: 0.5, color: 0xffa040, glowAlpha: 0.14, flicker: 0.04 });
      }
    });
  }

  buildClues() {
    const vision = () => this.state.spiritVision;
    for (const def of this.caseData.decor ?? []) {
      const [tx, ty] = def.tile;
      const img = this.add.image(tx * TILE + 8, ty * TILE + 8, def.sprite).setDepth(50).setAlpha(0.85);
      if (def.hidden) this.hiddenObjects.push(img);
    }
    for (const def of this.caseData.interactables) {
      const [tx, ty] = def.tile;
      const x = tx * TILE + 8;
      const y = ty * TILE + 8;
      const item = { kind: 'clue', def, x, y, hidden: !!def.hidden, prompt: def.prompt };
      if (def.sprite) {
        item.sprite = this.add.image(x, y, def.sprite).setDepth(50);
        if (item.hidden) this.hiddenObjects.push(item.sprite);
      }
      if (def.marker !== false) {
        item.glint = this.add.image(x + 3, y - 5, 'glint').setDepth(60).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: item.glint, alpha: 0.9, duration: 700, yoyo: true, repeat: -1, repeatDelay: 1800 + Math.random() * 1500, delay: Math.random() * 2000 });
      }
      if (item.hidden) {
        this.lighting.add({ x, y, radius: 22, intensity: 0.7, color: 0x6fe0d0, glowAlpha: 0.4, flicker: 0.2, active: vision });
      }
      this.interactables.push(item);
    }
  }

  buildNpcs() {
    for (const def of this.caseData.npcs) {
      const key = `npc_${def.id}`;
      createCharacterSheet(this, key, def.palette);
      const [tx, ty] = def.tile;
      const x = tx * TILE + 8;
      const y = ty * TILE + 15;
      const sprite = this.add.sprite(x, y, key, DIRS.indexOf(def.facing ?? 'down') * 4).setOrigin(0.5, 1).setDepth(100 + y);
      this.addBlocker(x, y - 3, 10, 6);
      this.interactables.push({ kind: 'npc', def, sprite, x, y: y - 4, prompt: `Mit ${def.name} sprechen`, facing: def.facing });
    }
  }

  buildPlayer() {
    createCharacterSheet(this, 'player', PLAYER_PALETTE);
    DIRS.forEach((dir, row) => {
      if (this.anims.exists(`walk-${dir}`)) return;
      this.anims.create({ key: `walk-${dir}`, frames: this.anims.generateFrameNumbers('player', { start: row * 4, end: row * 4 + 3 }), frameRate: 8, repeat: -1 });
    });
    const [tx, ty] = this.caseData.player_start;
    this.player = this.physics.add.sprite(tx * TILE + 8, ty * TILE + 15, 'player', 0).setOrigin(0.5, 1);
    this.player.body.setSize(10, 6).setOffset(3, 26);
    this.player.setCollideWorldBounds(true);
    this.facing = 'down';
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.blockers);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.mapW, this.mapH);
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setRoundPixels(true);
    cam.setBackgroundColor('#06070d');

    this.lighting.add({ follow: this.player, offsetX: 0, offsetY: -14, radius: 46, intensity: 0.6, color: 0xffc888, glowAlpha: 0.12, flicker: 0.06 });
  }

  buildAtmosphere() {
    this.fogA = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_a').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.fog).setAlpha(0.4);
    this.fogB = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_b').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.fog).setAlpha(0.25);

    // Geistsicht: türkiser Schleier + (bei WebGL) Entsättigung und Vignette.
    this.visionOverlay = this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0x30c0a8, 0.1)
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.vision).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    this.applyVision(this.state.spiritVision);
  }

  get hiddenObjects() {
    if (!this._hidden) this._hidden = [];
    return this._hidden;
  }

  bindInput() {
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.input.keyboard.addCapture('TAB,SPACE');
    // Aktionen per Event statt JustDown: so geht auch ein sehr kurzer Tastendruck nicht verloren.
    this.pending = null;
    const queue = (action) => (e) => { if (!e.repeat) this.pending = action; };
    this.input.keyboard.on('keydown-E', queue('interact'));
    this.input.keyboard.on('keydown-Q', queue('vision'));
    this.input.keyboard.on('keydown-J', queue('notebook'));
    this.input.keyboard.on('keydown-TAB', queue('notebook'));
  }

  bindState() {
    const s = this.state;
    this.cleanups.push(
      s.on('vision', (on) => this.applyVision(on)),
      s.on('clue', (id) => {
        for (const it of this.interactables) {
          if (it.kind === 'clue' && it.def.clue === id && it.glint) { it.glint.destroy(); it.glint = null; }
        }
      }),
    );
  }

  applyVision(on) {
    this.hiddenObjects.forEach((o) => o.setVisible(on));
    for (const it of this.interactables) if (it.hidden && it.glint) it.glint.setVisible(on);
    this.visionOverlay.setVisible(on);
    this.setVisionFx(on);
    this.lighting.nightAlpha = on ? 0.78 : 0.88;
  }

  /** Teil-Entsättigung + Vignette per WebGL-Post-FX (fällt bei Canvas-Renderer einfach weg). */
  setVisionFx(on) {
    const fx = this.cameras.main.postFX;
    if (!fx) return;
    try {
      fx.clear();
      if (on) {
        const cm = fx.addColorMatrix();
        cm.saturate(-0.55);
        cm.brightness(1.08, true);
        fx.addVignette(0.5, 0.5, 0.75, 0.45);
      }
    } catch (e) {
      console.warn('Post-FX nicht verfügbar', e);
    }
  }

  // --- Spielschleife ----------------------------------------------------------

  update(time, delta) {
    const blocked = this.ui.isBlocking();
    if (!blocked) this.state.tick(delta / 1000);
    this.updateMovement(blocked);
    this.updateFocus(blocked);
    this.handleKeys(blocked);
    this.lighting.update(time);
    const cam = this.cameras.main;
    this.fogA.setTilePosition(cam.scrollX * 0.9 + time * 0.006, cam.scrollY * 0.9 + time * 0.002);
    this.fogB.setTilePosition(cam.scrollX * 1.1 - time * 0.004, cam.scrollY * 1.1);
  }

  updateMovement(blocked) {
    const k = this.keys;
    let vx = 0;
    let vy = 0;
    if (!blocked) {
      vx = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
      vy = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    }
    const v = new Phaser.Math.Vector2(vx, vy).normalize().scale(PLAYER_SPEED);
    this.player.setVelocity(v.x, v.y);
    if (vx || vy) {
      this.facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      this.player.anims.play(`walk-${this.facing}`, true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(DIRS.indexOf(this.facing) * 4);
    }
    this.player.setDepth(100 + this.player.y);
  }

  updateFocus(blocked) {
    let best = null;
    let bestDist = INTERACT_RANGE;
    if (!blocked) {
      const px = this.player.x;
      const py = this.player.y - 3;
      for (const it of this.interactables) {
        if (it.hidden && !this.state.spiritVision) continue;
        const d = Phaser.Math.Distance.Between(px, py, it.x, it.y);
        if (d < bestDist) { best = it; bestDist = d; }
      }
    }
    this.focus = best;
    this.ui.setPrompt(best ? best.prompt : null);
  }

  handleKeys(blocked) {
    const action = this.pending;
    this.pending = null;
    if (blocked || !action) return;
    if (action === 'interact' && this.focus) this.interact(this.focus);
    else if (action === 'vision') this.state.setSpiritVision(!this.state.spiritVision);
    else if (action === 'notebook') this.ui.openNotebook();
  }

  interact(it) {
    if (it.kind === 'clue') {
      const clue = this.state.clue(it.def.clue);
      const isNew = this.state.addClue(it.def.clue);
      this.ui.showMessage(clue.name, clue.text, { footer: isNew ? 'Im Notizbuch vermerkt.' : 'Steht bereits in deinem Notizbuch.' });
    } else if (it.kind === 'npc') {
      const dx = this.player.x - it.sprite.x;
      const dy = this.player.y - it.sprite.y;
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      it.sprite.setFrame(DIRS.indexOf(dir) * 4);
      this.ui.openDialogue(it.def, () => it.sprite.setFrame(DIRS.indexOf(it.facing ?? 'down') * 4));
    }
  }

  /** Hilfen für automatische Tests im Browser. */
  debugTeleport(tx, ty) {
    this.player.setPosition(tx * TILE + 8, ty * TILE + 15);
    this.player.body.reset(this.player.x, this.player.y);
  }
}
