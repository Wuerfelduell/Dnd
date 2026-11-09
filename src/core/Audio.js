/**
 * Optional Phaser 3 audio facade; intentionally not imported by the game yet.
 * Later: keep ONE instance on game, call audio.preload(this) in scene.preload(),
 * then audio.play('ui_klick') / audio.music('kettlegate_tag') in WorldScene or
 * CombatScene. Reuse the instance between scenes; game destruction cleans it up.
 * All URLs are relative to Vite BASE_URL. Music is optional. SFX/music cache keys
 * are namespaced because both packages have a sound named "sieg".
 */
const clamp = (n, fallback = 1) => Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : fallback;
const storageKey = 'nebelakten_audio';
const gestures = ['pointerdown', 'touchend', 'keydown'];

export class Audio {
  constructor({ base = import.meta.env?.BASE_URL ?? './', random = Math.random } = {}) {
    this.base = base.endsWith('/') ? base : `${base}/`;
    this.random = random;
    this.levels = { master: 0.8, musik: 0.65, effekte: 0.8 };
    try {
      const saved = JSON.parse(globalThis.localStorage?.getItem(storageKey) ?? 'null');
      for (const key of Object.keys(this.levels)) this.levels[key] = clamp(saved?.[key], this.levels[key]);
    } catch { /* Private browsing or inaccessible storage must not break the game. */ }
    this.entries = { sfx: new Map(), musik: new Map() };
    this.active = new Set();
    this.loops = new Map();
    this.pendingLoops = new Set();
    this.pendingMusic = null;
    this.currentMusic = null;
    this.unlocked = false;
    this.gestureSeen = false;
    this.destroyed = false;
    this.hidden = globalThis.document?.hidden ?? false;
    this.loaders = new Set();
    this.loading = new Set();
    this.listeners = [];
    this.diagnostics = [];
    this.onGesture = () => this.unlock();
    this.onVisibility = () => {
      this.hidden = globalThis.document?.hidden ?? false;
      for (const record of this.active) record.sound.setMute(this.hidden);
      if (!this.hidden) this.flush();
    };
    this.onUnlocked = () => {
      if (this.gestureSeen && !this.destroyed) {
        this.unlocked = true;
        this.flush();
      }
    };
    this.onStep = (_time, delta) => this.update(delta);
    this.onDestroy = () => this.destroy();
    for (const type of gestures) globalThis.document?.addEventListener(type, this.onGesture);
    globalThis.document?.addEventListener('visibilitychange', this.onVisibility);
  }

  get master() { return this.levels.master; }
  set master(value) { this.setVolumes({ master: value }); }
  get musik() { return this.levels.musik; }
  set musik(value) { this.setVolumes({ musik: value }); }
  get effekte() { return this.levels.effekte; }
  set effekte(value) { this.setVolumes({ effekte: value }); }

  setVolumes(values = {}) {
    for (const key of Object.keys(this.levels)) this.levels[key] = clamp(values[key], this.levels[key]);
    try { globalThis.localStorage?.setItem(storageKey, JSON.stringify(this.levels)); } catch { /* optional */ }
    for (const record of this.active) this.mix(record);
    return { ...this.levels };
  }

  preload(scene) {
    if (this.destroyed) return;
    if (this.manager && this.manager !== scene.sound) throw new Error('Reuse Audio only within the same Phaser game.');
    this.scene = scene;
    if (!this.manager) {
      this.manager = scene.sound;
      this.game = scene.game;
      this.manager.on('unlocked', this.onUnlocked);
      this.game.events.on('step', this.onStep);
      this.game.events.once('destroy', this.onDestroy);
    }
    // Register once per loader; Phaser permits queueing audio inside filecomplete.
    if (!this.loaders.has(scene.load)) {
      this.loaders.add(scene.load);
      const complete = () => this.flush();
      const failed = file => {
        if (file.key?.startsWith('nebelakten:manifest:')) {
          this.loading.delete(file.key);
          this.diagnostics.push(`Manifest unavailable: ${file.key}`);
        }
      };
      scene.load.on('complete', complete);
      scene.load.on('loaderror', failed);
      this.listeners.push([scene.load, 'complete', complete], [scene.load, 'loaderror', failed]);
    }
    for (const kind of ['sfx', 'musik']) {
      const key = `nebelakten:manifest:${kind}`;
      if (scene.cache.json.exists(key)) {
        this.register(scene, kind, scene.cache.json.get(key));
      } else if (!this.loading.has(key)) {
        this.loading.add(key);
        const event = `filecomplete-json-${key}`;
        const receive = (_key, _type, data) => {
          this.loading.delete(key);
          if (!this.destroyed) this.register(scene, kind, data);
        };
        scene.load.once(event, receive);
        this.listeners.push([scene.load, event, receive]);
        scene.load.json(key, `${this.base}audio/manifest-${kind}.json`);
      }
    }
  }

  register(scene, kind, manifest) {
    const entries = manifest?.[kind === 'sfx' ? 'sounds' : 'tracks'];
    if (!entries || typeof manifest.base !== 'string') return;
    for (const [id, raw] of Object.entries(entries)) {
      if (!raw || !/^[a-z0-9_]+$/.test(id)) continue;
      const variants = Number.isInteger(raw.variants) && raw.variants > 1 ? raw.variants : 1;
      const entry = { ...raw, volume: clamp(raw.volume), variants };
      this.entries[kind].set(id, entry);
      for (let v = 1; v <= variants; v++) {
        const file = variants > 1 ? `${id}_${v}` : id;
        const key = `${kind}:${file}`;
        if (!scene.cache.audio.exists(key)) {
          const formats = (manifest.formats ?? ['ogg', 'mp3']).filter(f => f === 'ogg' || f === 'mp3');
          scene.load.audio(key, formats.map(f => `${this.base}${manifest.base}${file}.${f}`));
        }
      }
    }
  }

  async unlock() {
    if (this.destroyed || this.hidden) return;
    this.gestureSeen = true;
    try {
      const context = this.manager?.context;
      if (context?.state === 'suspended' || context?.state === 'interrupted') await context.resume();
      // Phaser emits unlocked on its next update. Do not bypass its lock queue.
      if (this.manager && !this.manager.locked && (!context || context.state === 'running')) this.onUnlocked();
    } catch { /* A later real gesture can retry; no stale effect queue is kept. */ }
  }

  ready() { return this.unlocked && !this.hidden && !this.destroyed && !!this.manager; }

  flush() {
    if (!this.ready()) return;
    for (const id of [...this.pendingLoops]) this.loop(id);
    if (this.pendingMusic) this.music(this.pendingMusic.id, this.pendingMusic.fadeMs);
  }

  create(id, kind, opts = {}) {
    const entry = this.entries[kind].get(id);
    if (!entry || !this.ready()) return null;
    const variant = entry.variants > 1 ? `_${1 + Math.min(entry.variants - 1, Math.floor(this.random() * entry.variants))}` : '';
    const key = `${kind}:${id}${variant}`;
    if (!this.scene.cache.audio.exists(key)) return null;
    const sound = this.manager.add(key);
    const record = { id, kind, sound, entry, gain: clamp(opts.volume), envelope: opts.envelope ?? 1, fade: null };
    this.active.add(record);
    this.mix(record);
    sound.setMute(this.hidden);
    const config = {
      volume: sound.volume, loop: !!opts.loop,
      rate: kind === 'sfx' && !opts.loop ? 0.97 + this.random() * 0.06 : 1,
    };
    let started;
    if (kind === 'musik' && opts.loop && Number.isFinite(entry.loopEnd) && entry.loopEnd > (entry.loopStart ?? 0)) {
      const start = Math.max(0, entry.loopStart ?? 0);
      sound.addMarker({ name: 'body', start, duration: entry.loopEnd - start, config: { loop: true } });
      if (start > 0) {
        sound.addMarker({ name: 'intro', start: 0, duration: start });
        sound.once('complete', () => {
          if (this.active.has(record)) {
            if (!sound.play('body', { ...config, volume: sound.volume })) this.remove(record);
          }
        });
        started = sound.play('intro', { ...config, loop: false });
      } else started = sound.play('body', config);
    } else {
      if (!opts.loop) sound.once('complete', () => this.remove(record));
      started = sound.play(config);
    }
    if (!started) { this.remove(record); return null; }
    return record;
  }

  play(id, opts = {}) {
    // Intentionally drop pre-gesture/hidden one-shots rather than replay old clicks.
    return this.create(id, 'sfx', { volume: opts.volume })?.sound ?? null;
  }

  loop(id) {
    if (this.destroyed) return null;
    const existing = this.loops.get(id);
    if (existing) return existing.sound;
    this.pendingLoops.add(id);
    const record = this.create(id, 'sfx', { loop: true });
    if (!record) return null;
    this.pendingLoops.delete(id);
    this.loops.set(id, record);
    return record.sound;
  }

  stopLoop(id, fadeMs = 250) {
    this.pendingLoops.delete(id);
    const record = this.loops.get(id);
    if (!record) return;
    this.loops.delete(id);
    this.fade(record, 0, fadeMs, true);
  }

  music(id, fadeMs = 800) {
    if (this.destroyed) return null;
    if (id == null) {
      this.pendingMusic = null;
      if (this.currentMusic) this.fade(this.currentMusic, 0, fadeMs, true);
      this.currentMusic = null;
      return null;
    }
    if (this.currentMusic?.id === id) {
      this.pendingMusic = null;
      return this.currentMusic.sound;
    }
    this.pendingMusic = { id, fadeMs };
    const entry = this.entries.musik.get(id);
    if (!entry) return null;
    const record = this.create(id, 'musik', { loop: entry.loop === true, envelope: 0 });
    if (!record) return null;
    this.pendingMusic = null;
    if (this.currentMusic) this.fade(this.currentMusic, 0, fadeMs, true);
    this.currentMusic = record;
    this.fade(record, 1, fadeMs);
    return record.sound;
  }

  mix(record) {
    const bus = record.kind === 'musik' ? 'musik' : 'effekte';
    record.sound.setVolume(clamp(this.master * this.levels[bus] * record.entry.volume * record.gain * record.envelope));
  }

  fade(record, to, ms, remove = false) {
    if (!Number.isFinite(ms) || ms <= 0) {
      record.envelope = to;
      this.mix(record);
      if (remove) this.remove(record);
    } else record.fade = { from: record.envelope, to, duration: ms, elapsed: 0, remove };
  }

  update(delta) {
    if (this.hidden || !Number.isFinite(delta)) return;
    for (const record of this.active) {
      const f = record.fade;
      if (!f) continue;
      f.elapsed = Math.min(f.duration, f.elapsed + Math.max(0, delta));
      record.envelope = f.from + (f.to - f.from) * f.elapsed / f.duration;
      this.mix(record);
      if (f.elapsed === f.duration) {
        record.fade = null;
        if (f.remove) this.remove(record);
      }
    }
  }

  remove(record) {
    if (!this.active.delete(record)) return;
    if (this.loops.get(record.id) === record) this.loops.delete(record.id);
    if (this.currentMusic === record) this.currentMusic = null;
    record.sound.destroy();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const record of [...this.active]) this.remove(record);
    for (const type of gestures) globalThis.document?.removeEventListener(type, this.onGesture);
    globalThis.document?.removeEventListener('visibilitychange', this.onVisibility);
    for (const [emitter, event, listener] of this.listeners) emitter.off(event, listener);
    this.manager?.off('unlocked', this.onUnlocked);
    this.game?.events.off('step', this.onStep);
    this.game?.events.off('destroy', this.onDestroy);
    this.pendingLoops.clear();
    this.pendingMusic = null;
    this.listeners.length = 0;
    this.loaders.clear();
  }
}

export default Audio;
