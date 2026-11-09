import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import Audio from '../../../src/core/Audio.js';

class Sound extends EventEmitter {
  constructor(key) { super(); this.key = key; this.volume = 1; this.calls = []; this.markers = []; }
  setVolume(v) { this.volume = v; return this; }
  setMute(v) { this.mute = v; return this; }
  addMarker(m) { this.markers.push(m); }
  play(...args) { this.calls.push(args); return true; }
  destroy() { this.destroyed = true; this.removeAllListeners(); }
}
function fixture({ locked = false, storage = null } = {}) {
  const doc = new EventEmitter(); doc.hidden = false;
  doc.addEventListener = doc.on.bind(doc); doc.removeEventListener = doc.off.bind(doc);
  globalThis.document = doc;
  globalThis.localStorage = { getItem: () => storage, setItem: (_k, value) => { globalThis.saved = value; } };
  const cacheAudio = new Set(); const cacheJson = new Map();
  const manager = new EventEmitter(); manager.locked = locked; manager.created = [];
  manager.add = key => { const sound = new Sound(key); manager.created.push(sound); return sound; };
  const load = new EventEmitter(); load.audioRequests = []; load.jsonRequests = [];
  load.audio = (key, urls) => { load.audioRequests.push({ key, urls }); };
  load.json = (key, url) => { load.jsonRequests.push({ key, url }); };
  const scene = { sound: manager, load, game: { events: new EventEmitter() }, cache: {
    audio: { exists: key => cacheAudio.has(key) },
    json: { exists: key => cacheJson.has(key), get: key => cacheJson.get(key) },
  } };
  const audio = new Audio({ base: '/Dnd/', random: () => .99 }); audio.preload(scene);
  const register = (kind, entries) => {
    const manifest = { base: `audio/${kind}/`, formats: ['ogg', 'mp3'], [kind === 'sfx' ? 'sounds' : 'tracks']: entries };
    cacheJson.set(`nebelakten:manifest:${kind}`, manifest);
    load.emit(`filecomplete-json-nebelakten:manifest:${kind}`, `nebelakten:manifest:${kind}`, 'json', manifest);
    for (const request of load.audioRequests) cacheAudio.add(request.key);
    load.emit('complete');
  };
  return { audio, scene, doc, manager, load, cacheAudio, cacheJson, register };
}

test('preload queues both manifests, variants, fallback formats and deployment base', () => {
  const f = fixture();
  assert.deepEqual(f.load.jsonRequests.map(x => x.url), ['/Dnd/audio/manifest-sfx.json', '/Dnd/audio/manifest-musik.json']);
  f.register('sfx', { schritt: { variants: 3, volume: .35 } });
  assert.equal(f.load.audioRequests.length, 3);
  assert.deepEqual(f.load.audioRequests[2], { key: 'sfx:schritt_3', urls: ['/Dnd/audio/sfx/schritt_3.ogg', '/Dnd/audio/sfx/schritt_3.mp3'] });
  f.audio.preload(f.scene);
  assert.equal(f.load.audioRequests.length, 3);
  f.audio.destroy();
});

test('optional missing music does not prevent effects or leave failed preload listeners', async () => {
  const f = fixture(); f.register('sfx', { ui_klick: { volume: .5 } });
  f.load.emit('loaderror', { key: 'nebelakten:manifest:musik' });
  await f.audio.unlock(); assert.ok(f.audio.play('ui_klick')); assert.equal(f.audio.music('missing'), null);
  f.audio.destroy(); assert.equal(f.load.listenerCount('filecomplete-json-nebelakten:manifest:musik'), 0);
});

test('gesture gate drops old clicks but remembers the latest music and loops', async () => {
  const f = fixture();
  f.register('sfx', { ui_klick: {}, regen: { loop: true } });
  f.register('musik', { a: { loop: true }, b: { loop: true } });
  assert.equal(f.audio.play('ui_klick'), null);
  f.audio.music('a'); f.audio.music('b'); f.audio.loop('regen');
  assert.equal(f.manager.created.length, 0);
  await f.audio.unlock();
  assert.deepEqual(f.manager.created.map(s => s.key).sort(), ['musik:b', 'sfx:regen']);
  assert.equal(f.audio.pendingMusic, null); assert.equal(f.audio.pendingLoops.size, 0);
  f.audio.destroy();
});

test('failed resume is retried and Phaser unlock waits for a real gesture', async () => {
  const f = fixture({ locked: true });
  f.manager.emit('unlocked'); assert.equal(f.audio.unlocked, false);
  f.manager.context = { state: 'suspended', resume: async () => { throw Error('blocked'); } };
  await f.audio.unlock(); assert.equal(f.audio.unlocked, false);
  f.manager.locked = false;
  f.manager.context.resume = async () => { f.manager.context.state = 'running'; };
  await f.audio.unlock(); assert.equal(f.audio.unlocked, true);
  f.audio.destroy();
});

test('variants and bounded pitch differ from music while both sieg IDs coexist', async () => {
  const f = fixture(); f.register('sfx', { schritt: { variants: 3 }, sieg: {} }); f.register('musik', { sieg: { loop: false } });
  await f.audio.unlock();
  const step = f.audio.play('schritt'); assert.equal(step.key, 'sfx:schritt_3');
  assert.ok(step.calls[0][0].rate >= .97 && step.calls[0][0].rate <= 1.03);
  assert.equal(f.audio.play('sieg').key, 'sfx:sieg');
  const music = f.audio.music('sieg', 0); assert.equal(music.key, 'musik:sieg'); assert.equal(music.calls[0][0].rate, 1);
  music.emit('complete'); assert.equal(f.audio.currentMusic, null); assert.ok(music.destroyed);
  step.emit('complete'); assert.ok(step.destroyed); f.audio.destroy();
});

test('volume persistence sanitizes bad data and live changes preserve fades', async () => {
  const f = fixture({ storage: '{"master":2,"musik":-1,"effekte":"bad"}' });
  assert.deepEqual(f.audio.levels, { master: 1, musik: 0, effekte: .8 });
  f.register('sfx', { regen: { volume: .5 } }); await f.audio.unlock();
  const sound = f.audio.loop('regen'); assert.equal(sound.volume, .4);
  f.audio.stopLoop('regen', 100); f.scene.game.events.emit('step', 0, 50);
  f.audio.master = .5; assert.equal(sound.volume, .1);
  assert.equal(JSON.parse(globalThis.saved).master, .5);
  f.audio.effekte = NaN; assert.equal(f.audio.effekte, .8); f.audio.destroy();
});

test('storage failures and malformed JSON are harmless', () => {
  const f = fixture({ storage: 'broken' });
  globalThis.localStorage = { setItem() { throw Error('private'); } };
  assert.doesNotThrow(() => { f.audio.master = .3; }); f.audio.destroy();
});

test('hidden windows mute active sounds and drop new effects, visibility restores them', async () => {
  const f = fixture(); f.register('sfx', { rain: { loop: true }, click: {} }); await f.audio.unlock();
  const rain = f.audio.loop('rain'); f.doc.hidden = true; f.doc.emit('visibilitychange');
  assert.equal(rain.mute, true); assert.equal(f.audio.play('click'), null);
  f.audio.stopLoop('rain', 100); f.scene.game.events.emit('step', 0, 200); assert.ok(!rain.destroyed);
  f.doc.hidden = false; f.doc.emit('visibilitychange'); assert.equal(rain.mute, false);
  f.scene.game.events.emit('step', 0, 100); assert.ok(rain.destroyed); f.audio.destroy();
});

test('loop restart during fade is not deleted by the old loop cleanup', async () => {
  const f = fixture(); f.register('sfx', { rain: {} }); await f.audio.unlock();
  const old = f.audio.loop('rain'); assert.equal(f.audio.loop('rain'), old);
  f.audio.stopLoop('rain', 100); const fresh = f.audio.loop('rain'); assert.notEqual(old, fresh);
  f.scene.game.events.emit('step', 0, 100);
  assert.ok(old.destroyed); assert.equal(f.audio.loop('rain'), fresh);
  f.audio.stopLoop('rain', 0); assert.ok(fresh.destroyed); f.audio.destroy();
});

test('crossfades do not restart the same track, and rapid switches clean up old tracks', async () => {
  const f = fixture(); f.register('musik', { a: { loop: true }, b: { loop: true }, c: { loop: true } }); await f.audio.unlock();
  const a = f.audio.music('a', 100); assert.equal(f.audio.music('a'), a); assert.equal(a.calls.length, 1);
  f.scene.game.events.emit('step', 0, 100); assert.ok(a.volume > 0);
  const b = f.audio.music('b', 100); f.scene.game.events.emit('step', 0, 50);
  assert.ok(a.volume > 0 && b.volume > 0);
  const c = f.audio.music('c', 100); f.scene.game.events.emit('step', 0, 100);
  assert.ok(a.destroyed && b.destroyed); assert.equal(f.audio.active.size, 1); assert.equal(f.audio.currentMusic.sound, c);
  f.audio.music(null, 0); assert.ok(c.destroyed); assert.equal(f.audio.active.size, 0); f.audio.destroy();
});

test('music markers honor loop bounds and intro transition', async () => {
  const f = fixture(); f.register('musik', { titel: { loop: true, loopStart: 4, loopEnd: 94 } }); await f.audio.unlock();
  const sound = f.audio.music('titel', 0);
  assert.deepEqual(sound.markers[0], { name: 'body', start: 4, duration: 90, config: { loop: true } });
  assert.equal(sound.calls[0][0], 'intro'); sound.emit('complete'); assert.equal(sound.calls[1][0], 'body');
  assert.equal(sound.calls[1][1].loop, true); assert.ok(!sound.destroyed); f.audio.destroy();
});

test('destroy clears game, DOM, loader listeners, sounds and queued intentions', async () => {
  const f = fixture(); f.register('sfx', { rain: {} }); await f.audio.unlock();
  const sound = f.audio.loop('rain'); f.scene.game.events.emit('destroy');
  assert.ok(sound.destroyed); assert.equal(f.audio.active.size, 0);
  for (const event of ['pointerdown', 'touchend', 'keydown', 'visibilitychange']) assert.equal(f.doc.listenerCount(event), 0);
  assert.equal(f.scene.game.events.listenerCount('step'), 0); assert.equal(f.manager.listenerCount('unlocked'), 0);
  assert.equal(f.load.listenerCount('complete'), 0); assert.equal(f.audio.loop('rain'), null);
  assert.doesNotThrow(() => f.audio.destroy());
});
