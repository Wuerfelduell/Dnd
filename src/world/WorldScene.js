import Phaser from 'phaser';
import { createTextures, createCharacterSheet, hash2, TILE, TILE_INDEX, SOLID_KEYS } from './textures.js';
import { Lighting, DEPTH } from './Lighting.js';

export const VIEW_W = 480;
export const VIEW_H = 270;

const PLAYER_SPEED = 72;
const INTERACT_RANGE = 22;
const DIRS = ['down', 'left', 'right', 'up'];

export const PLAYER_PALETTE = {
  coat: '#6a5a48', hat: '#2e2a26', skin: '#e0b894', hair: '#3a2a20', legs: '#2c2a30', scarf: '#7a3a3a',
};

/** Wählt für ein Kartenzeichen den passenden Tile-Index (inkl. Variationen). */
export function tileIndexFor(rows, x, y) {
  const ch = rows[y][x];
  const at = (dx, dy) => rows[y + dy]?.[x + dx];
  const v = (n, seed) => Math.floor(hash2(x, y, seed) * n);
  switch (ch) {
    case '.': return TILE_INDEX[`cobble${v(4, 0)}`];
    case 'L': case 'X': {
      // Laternen übernehmen den Boden ihrer Nachbarn (Friedhof: Gras/Weg)
      const n = [at(-1, 0), at(1, 0)];
      if (n.includes('p')) return TILE_INDEX.path;
      if (n.includes('g')) return TILE_INDEX[`grass${v(2, 9)}`];
      return TILE_INDEX[hash2(x, y, 3) > 0.8 ? 'walk1' : 'walk0'];
    }
    case ',': return TILE_INDEX[hash2(x, y, 3) > 0.8 ? 'walk1' : 'walk0'];
    case '#': return TILE_INDEX.brick;
    case 'W': return TILE_INDEX.window;
    case 'D': return TILE_INDEX.door;
    case 'R': return TILE_INDEX[at(0, 1) && at(0, 1) !== 'R' ? 'roofEaveBottom' : 'roofEaveTop'];
    case 'f': return TILE_INDEX.fence;
    case '~': return TILE_INDEX[v(2, 5) ? 'water1' : 'water0'];
    case '=':
      if (at(-1, 0) !== '=') return TILE_INDEX.bridgeLeft;
      if (at(1, 0) !== '=') return TILE_INDEX.bridgeRight;
      return TILE_INDEX.bridgeMid;
    case 'w': case 'O': return TILE_INDEX[`wood${v(2, 7)}`];
    case 'I': return TILE_INDEX[at(0, 1) === 'I' || at(0, 1) === 'E' || at(0, 1) === undefined ? 'wallTop' : 'wallFace'];
    case 'E': return TILE_INDEX.wallDoor;
    case 'T': return TILE_INDEX.desk;
    case 'B': return TILE_INDEX.shelf;
    case 'H': return TILE_INDEX.bars;
    case 'g': return TILE_INDEX[`grass${v(2, 9)}`];
    case 'p': return TILE_INDEX.path;
    case 'G': return TILE_INDEX.grave;
    case 'U': return TILE_INDEX.openGrave;
    case 'c': return TILE_INDEX.charred;
    case 'r': return TILE_INDEX.rubble;
    case 'Y': return TILE_INDEX.deadTree;
    case 's': case 'K': return TILE_INDEX.stone;
    case '|': return TILE_INDEX[at(0, 1) === '|' || at(0, 1) === undefined ? 'cryptTop' : 'cryptFace'];
    case 'A': return TILE_INDEX.altar;
    default: throw new Error(`Unbekanntes Kartenzeichen "${ch}" bei ${x},${y}`);
  }
}

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('world');
  }

  create() {
    this.state = this.registry.get('state');
    this.ui = this.registry.get('ui');
    this.mapDef = this.state.content.maps[this.state.map];
    this.interactables = [];
    this.conditional = []; // Objekte mit visible_if
    this.hidden = []; // nur in der Geistsicht sichtbar
    this.cleanups = [];
    this.leaving = false;
    this.focus = null;
    this.pending = null;

    createTextures(this);
    this.buildMap();
    const amb = this.mapDef.ambient ?? {};
    this.lighting = new Lighting(this, { width: VIEW_W, height: VIEW_H });
    this.baseNight = amb.night ?? 0.88;
    this.blockers = this.physics.add.staticGroup();
    this.buildLamps();
    this.buildWindows();
    this.buildObjects();
    this.buildNpcs();
    this.buildPlayer();
    this.buildAtmosphere(amb);
    this.bindInput();
    this.bindState();
    this.refreshVisibility();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanups.forEach((fn) => fn()));
    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.ui.onSceneReady(this);
  }

  // --- Aufbau ---------------------------------------------------------------

  buildMap() {
    const rows = this.mapDef.rows;
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
    this.mapDef.rows.forEach((row, y) => [...row].forEach((ch, x) => chars.includes(ch) && fn(x, y, ch)));
  }

  addBlocker(x, y, w, h) {
    const zone = this.add.zone(x, y, w, h);
    this.physics.add.existing(zone, true);
    this.blockers.add(zone);
    return zone;
  }

  buildLamps() {
    const vision = () => this.state.spiritVision;
    this.forEachTile(['L', 'X', 'O', 'K'], (tx, ty, ch) => {
      const x = tx * TILE + 8;
      const y = ty * TILE + 15;
      if (ch === 'L' || ch === 'X') {
        const lit = ch === 'L';
        this.add.image(x, y + 1, lit ? 'lamp_lit' : 'lamp_frost').setOrigin(0.5, 1).setDepth(100 + y);
        this.addBlocker(x, y - 2, 6, 4);
        if (lit) this.lighting.add({ x, y: y - 36, radius: 78, intensity: 1, color: 0xffb860, glowAlpha: 0.32, flicker: 0.12 });
        else this.lighting.add({ x, y: y - 36, radius: 34, intensity: 0.55, color: 0x6fe0d0, glowAlpha: 0.35, flicker: 0.3, active: vision });
      } else if (ch === 'O') {
        this.add.image(x, y + 1, 'oil_lamp').setOrigin(0.5, 1).setDepth(100 + y);
        this.addBlocker(x, y - 2, 6, 4);
        this.lighting.add({ x, y: y - 22, radius: 70, intensity: 1, color: 0xffb060, glowAlpha: 0.28, flicker: 0.08 });
      } else {
        this.add.image(x, y - 7, 'candle').setDepth(100 + y);
        this.lighting.add({ x, y: y - 10, radius: 40, intensity: 0.9, color: 0xffa050, glowAlpha: 0.3, flicker: 0.25 });
      }
    });
  }

  buildWindows() {
    this.mapDef.rows.forEach((row, ty) => {
      for (const m of row.matchAll(/W+/g)) {
        const x = (m.index + m[0].length / 2) * TILE;
        this.lighting.add({ x, y: ty * TILE + 8, radius: 22 + m[0].length * 6, intensity: 0.5, color: 0xffa040, glowAlpha: 0.14, flicker: 0.04 });
      }
    });
  }

  registerVisibility(obj, def, parts) {
    if (def.visible_if) this.conditional.push({ obj, def, parts });
  }

  buildObjects() {
    for (const def of this.mapDef.decor ?? []) {
      const [tx, ty] = def.tile;
      const img = this.add.image(tx * TILE + 8, ty * TILE + 8, def.sprite).setDepth(def.depth ?? 50).setAlpha(def.alpha ?? 0.85);
      if (def.hidden) this.hidden.push(img);
      this.registerVisibility(null, def, [img]);
    }
    for (const def of this.mapDef.interactables ?? []) {
      const [tx, ty] = def.tile;
      const x = tx * TILE + 8;
      const y = ty * TILE + 8;
      const item = { kind: def.kind ?? 'clue', def, x, y, hidden: !!def.hidden, prompt: def.prompt, reach: def.reach ?? INTERACT_RANGE, active: true, parts: [] };
      if (def.sprite) {
        item.sprite = this.add.image(x, y, def.sprite).setDepth(50);
        item.parts.push(item.sprite);
        if (item.hidden) this.hidden.push(item.sprite);
      }
      const isClue = item.kind === 'clue' || item.kind === 'read';
      if (def.marker ?? isClue) {
        item.glint = this.add.image(x + 3, y - 5, 'glint').setDepth(60).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
        item.parts.push(item.glint);
        this.tweens.add({ targets: item.glint, alpha: 0.9, duration: 700, yoyo: true, repeat: -1, repeatDelay: 1800 + Math.random() * 1500, delay: Math.random() * 2000 });
      }
      if (item.kind === 'combat') {
        this.lighting.add({ x, y: y - 4, radius: 30, intensity: 0.6, color: 0x6fe0d0, glowAlpha: 0.35, flicker: 0.25, active: () => item.active });
      }
      if (def.solid) item.blocker = this.addBlocker(x, y + 2, def.solid[0] ?? 16, def.solid[1] ?? 12);
      if (def.sprite_scale) item.sprite?.setScale(def.sprite_scale).setOrigin(0.5, 0.75);
      if (item.hidden) {
        item.light = this.lighting.add({ x, y, radius: 22, intensity: 0.7, color: 0x6fe0d0, glowAlpha: 0.4, flicker: 0.2, active: () => this.state.spiritVision && item.active });
      }
      this.interactables.push(item);
      this.registerVisibility(item, def, item.parts);
    }
  }

  buildNpcs() {
    for (const def of this.mapDef.npcs ?? []) {
      const npc = this.state.content.npcs[def.id];
      if (!npc) throw new Error(`Unbekannte Figur: ${def.id}`);
      const key = `npc_${def.id}`;
      createCharacterSheet(this, key, npc.palette);
      const [tx, ty] = def.tile;
      const x = tx * TILE + 8;
      const y = ty * TILE + 15;
      const facing = def.facing ?? 'down';
      const sprite = this.add.sprite(x, y, key, DIRS.indexOf(facing) * 4).setOrigin(0.5, 1).setDepth(100 + y);
      const blocker = this.addBlocker(x, y - 3, 10, 6);
      const item = {
        kind: 'npc', def: { ...npc, ...def, dialogue: def.dialogue ?? npc.dialogue }, sprite, blocker, x, y: y - 4,
        prompt: `Mit ${npc.name} sprechen`, facing, reach: def.reach ?? INTERACT_RANGE, active: true, parts: [sprite],
      };
      this.interactables.push(item);
      this.registerVisibility(item, def, item.parts);
    }
  }

  buildPlayer() {
    createCharacterSheet(this, 'player', PLAYER_PALETTE);
    DIRS.forEach((dir, row) => {
      if (this.anims.exists(`walk-${dir}`)) return;
      this.anims.create({ key: `walk-${dir}`, frames: this.anims.generateFrameNumbers('player', { start: row * 4, end: row * 4 + 3 }), frameRate: 8, repeat: -1 });
    });
    let px;
    let py;
    if (this.state.position) {
      [px, py] = this.state.position;
      this.state.position = null;
    } else {
      const spawns = this.mapDef.spawns;
      const [tx, ty] = spawns[this.state.spawn] ?? spawns.default;
      px = tx * TILE + 8;
      py = ty * TILE + 15;
    }
    this.player = this.physics.add.sprite(px, py, 'player', 0).setOrigin(0.5, 1);
    this.player.body.setSize(10, 6).setOffset(3, 26);
    this.player.setCollideWorldBounds(true);
    this.facing = 'down';
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.blockers);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, Math.max(this.mapW, VIEW_W), Math.max(this.mapH, VIEW_H));
    if (this.mapW < VIEW_W || this.mapH < VIEW_H) {
      cam.setBounds(-(VIEW_W - Math.min(this.mapW, VIEW_W)) / 2, -(VIEW_H - Math.min(this.mapH, VIEW_H)) / 2, Math.max(this.mapW, VIEW_W), Math.max(this.mapH, VIEW_H));
    }
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setRoundPixels(true);
    cam.setBackgroundColor('#06070d');

    this.lighting.add({ follow: this.player, offsetX: 0, offsetY: -14, radius: 46, intensity: 0.6, color: 0xffc888, glowAlpha: 0.12, flicker: 0.06 });
  }

  buildAtmosphere(amb) {
    const fog = amb.fog ?? 0.4;
    this.fogA = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_a').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.fog).setAlpha(fog);
    this.fogB = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_b').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.fog).setAlpha(fog * 0.6);
    this.visionOverlay = this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0x30c0a8, 0.1)
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.vision).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    this.applyVision(this.state.spiritVision);
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
    this.input.keyboard.on('keydown-I', queue('inventory'));
  }

  bindState() {
    const s = this.state;
    const refresh = () => this.refreshVisibility();
    this.cleanups.push(
      s.on('vision', (on) => this.applyVision(on)),
      s.on('clue', (id) => {
        for (const it of this.interactables) {
          if (it.def.clue === id && it.glint) { it.glint.destroy(); it.parts = it.parts.filter((p) => p !== it.glint); it.glint = null; }
        }
        refresh();
      }),
      s.on('changed', refresh),
      s.on('conclusion', refresh),
      s.on('quest', refresh),
    );
    // Bereits bekannte Hinweise: kein Funkeln mehr
    for (const it of this.interactables) {
      if ((it.def.clue && s.hasClue(it.def.clue)) || (it.def.done_flag && s.flags.has(it.def.done_flag))) {
        it.glint?.destroy();
        it.parts = it.parts.filter((p) => p !== it.glint);
        it.glint = null;
      }
    }
  }

  refreshVisibility() {
    for (const c of this.conditional) {
      const on = this.state.meets(c.def.visible_if);
      if (c.obj) c.obj.active = on;
      for (const p of c.parts) {
        if (!p.active) continue;
        const hiddenNow = this.hidden.includes(p) && !this.state.spiritVision;
        p.setVisible(on && !hiddenNow);
      }
      if (c.obj?.blocker) c.obj.blocker.body.enable = on;
    }
  }

  applyVision(on) {
    for (const o of this.hidden) {
      const owner = this.conditional.find((c) => c.parts.includes(o));
      o.setVisible(on && (!owner || this.state.meets(owner.def.visible_if)));
    }
    this.visionOverlay.setVisible(on);
    this.setVisionFx(on);
    this.lighting.nightAlpha = on ? Math.max(0.5, this.baseNight - 0.1) : this.baseNight;
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
    const blocked = this.ui.isBlocking() || this.leaving;
    if (!blocked) this.state.tick(delta / 1000);
    this.updateMovement(blocked);
    this.updateFocus(blocked);
    this.checkAuto(blocked);
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
    let bestScore = Infinity;
    if (!blocked) {
      const px = this.player.x;
      const py = this.player.y - 3;
      for (const it of this.interactables) {
        if (!it.active || (it.hidden && !this.state.spiritVision)) continue;
        const d = Phaser.Math.Distance.Between(px, py, it.x, it.y);
        if (d < it.reach && d / it.reach < bestScore) { best = it; bestScore = d / it.reach; }
      }
    }
    this.focus = best;
    this.ui.setPrompt(best ? best.prompt : null);
  }

  /** Objekte mit "auto" lösen von selbst aus (z. B. ein Hinterhalt), sobald man nah genug ist. */
  checkAuto(blocked) {
    if (blocked) return;
    for (const it of this.interactables) {
      if (!it.def.auto || !it.active) continue;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y - 3, it.x, it.y) < it.def.auto) { this.interact(it); return; }
    }
  }

  handleKeys(blocked) {
    const action = this.pending;
    this.pending = null;
    if (blocked || !action) return;
    if (action === 'interact' && this.focus) this.interact(this.focus);
    else if (action === 'vision') this.state.setSpiritVision(!this.state.spiritVision);
    else if (action === 'notebook') this.ui.openNotebook();
    else if (action === 'inventory') this.ui.openNotebook('items');
  }

  interact(it) {
    const def = it.def;
    if (def.lock && !this.state.meets(def.lock)) {
      this.ui.showMessage(def.title ?? def.prompt, def.lock.text, { footer: def.lock.footer ?? '' });
      return;
    }
    switch (it.kind) {
      case 'npc': {
        const dx = this.player.x - it.sprite.x;
        const dy = this.player.y - it.sprite.y;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        if (!def.static) it.sprite.setFrame(DIRS.indexOf(dir) * 4);
        this.ui.openDialogue(def, () => it.sprite.setFrame(DIRS.indexOf(it.facing) * 4));
        break;
      }
      case 'dialogue':
        this.ui.openDialogue({ name: def.title, role: def.role ?? '', dialogue: def.dialogue });
        break;
      case 'travel':
        this.ui.openTravel(this.state.map);
        break;
      case 'combat':
        this.startCombat(def.encounter);
        break;
      case 'rest': {
        const healed = this.state.heal(this.state.maxHp);
        this.state.setComposure(100);
        this.ui.showMessage(def.title, def.text, { footer: healed > 0 ? `+${healed} Leben, Nerven beruhigt.` : 'Du bist ausgeruht.' });
        break;
      }
      case 'door':
        this.travelTo(def.to, def.spawn);
        break;
      case 'read': {
        const isNew = !def.done_flag || !this.state.flags.has(def.done_flag);
        this.ui.showMessage(def.title, def.text, { footer: def.footer ?? '' });
        if (isNew) this.state.applyEffects({ ...def.effects, sets_flags: [...(def.effects?.sets_flags ?? []), ...(def.done_flag ? [def.done_flag] : [])] });
        break;
      }
      default: { // 'clue'
        const clue = this.state.clue(def.clue);
        const isNew = this.state.addClue(def.clue);
        this.state.applyEffects(def.effects);
        this.ui.showClue(def.clue, isNew);
        if (!isNew && !clue) throw new Error(`Hinweis fehlt: ${def.clue}`);
      }
    }
  }

  travelTo(mapId, spawn) {
    if (this.leaving) return;
    if (!this.state.content.maps[mapId]) throw new Error(`Unbekannter Ort: ${mapId}`);
    this.leaving = true;
    this.state.setSpiritVision(false);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.state.map = mapId;
      this.state.spawn = spawn ?? 'default';
      this.state.position = null;
      this.state.emit('travel', mapId);
      this.scene.restart();
    });
  }

  /** Pausiert die Welt und startet den Kampfbildschirm. */
  startCombat(id) {
    if (this.leaving || this.scene.isActive('combat')) return;
    this.state.pendingCombat = null;
    this.state.setSpiritVision(false);
    this.player.setVelocity(0, 0);
    this.player.anims.stop();
    this.scene.pause();
    this.scene.launch('combat', {
      id,
      onDone: (result) => {
        this.scene.resume();
        this.refreshVisibility();
        if (result.travel) this.travelTo(result.travel.map, result.travel.spawn);
      },
    });
  }

  playerPosition() {
    return [Math.round(this.player.x), Math.round(this.player.y)];
  }

  /** Hilfen für automatische Tests im Browser. */
  debugTeleport(tx, ty) {
    this.player.setPosition(tx * TILE + 8, ty * TILE + 15);
    this.player.body.reset(this.player.x, this.player.y);
  }
}
