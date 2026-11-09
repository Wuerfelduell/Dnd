/** Standalone Nebel-Musik v1. Later Audio.js may share Phaser's AudioContext,
 * call ladeManifest/lade, then spiele from music(id), and set lautstaerke to
 * levels.master * levels.musik. main.js currently requests kinds:['sfx']; this
 * module deliberately does not change that integration or install listeners. */
const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const number = (n, label, lo, hi) => {
  if (!Number.isFinite(n) || n < lo || n > hi) throw Error(`${label}: expected ${lo}..${hi}, got ${n}`);
  return n;
};
const pitchPattern = /^[a-g][#b]?-?\d+$/;
export function midi(note) {
  const m = /^([a-g])([#b]?)(-?\d+)$/.exec(note);
  if (!m) throw Error(`Invalid pitch: ${note}`);
  return (Number(m[3]) + 1) * 12 + { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1]] + ({ '#': 1, b: -1 }[m[2]] || 0);
}

/** Parse to {events:[{at,duration,pitches,hit,velocity,tie,position}], length}.
 * Durations and offsets are sixteenths. Bar lines must fall on real boundaries. */
export function parseNoten(text, sechzehntelProTakt) {
  number(sechzehntelProTakt, 'sixteenths per bar', 1, 128);
  if (typeof text !== 'string' || !text.trim()) throw Error('Notes must be a nonempty string');
  const events = []; let at = 0;
  for (const match of text.matchAll(/\S+/g)) {
    const token = match[0], position = match.index;
    if (token === '|') {
      if (!at || at % sechzehntelProTakt !== 0) throw Error(`Position ${position}: misplaced bar line at ${at}`);
      continue;
    }
    const m = /^(\[[^\]]+\]|[a-z][a-z#b\d-]*):(\d+)(?:@((?:\d+(?:\.\d*)?|\.\d+)))?(~)?$/.exec(token);
    if (!m) throw Error(`Position ${position}: invalid token ${token}`);
    const [, value, len, velocity, tie] = m;
    const duration = number(Number(len), `Position ${position}: duration`, 1, 65536);
    const vel = number(velocity === undefined ? .8 : Number(velocity), `Position ${position}: velocity`, 0, 1);
    let pitches = [], hit = null;
    if (value.startsWith('[')) {
      const names = value.slice(1, -1).split(',');
      if (!names.length || names.some(n => !pitchPattern.test(n))) throw Error(`Position ${position}: invalid chord`);
      pitches = names.map(midi);
    } else if (pitchPattern.test(value)) pitches = [midi(value)];
    else if (value !== 'r') hit = value;
    if (tie && !pitches.length) throw Error(`Position ${position}: only pitched notes can be tied`);
    if (pitches.some(p => p < 0 || p > 127)) throw Error(`Position ${position}: MIDI pitch outside 0..127`);
    events.push({ at, duration, pitches, hit, velocity: vel, tie: !!tie, position }); at += duration;
  }
  if (!events.length) throw Error('No notes or rests');
  return { events, length: at };
}

function instrumentBank(bank) { return bank?.instrumente ?? bank; }
function validateFilter(filter, label) {
  if (!filter) return;
  if (typeof filter !== 'object') throw Error(`${label}: invalid filter`);
  if (filter.tiefpass !== undefined) number(filter.tiefpass, `${label}.tiefpass`, 20, 22000);
  if (filter.bandpass !== undefined) number(filter.bandpass, `${label}.bandpass`, 20, 22000);
}
export function validateInstrumente(raw) {
  const bank = instrumentBank(raw);
  if (!bank || typeof bank !== 'object') throw Error('Missing instrument bank');
  for (const [name, def] of Object.entries(bank)) {
    if (!['osc', 'fm', 'pluck', 'noise', 'formant'].includes(def.typ)) throw Error(`${name}: unknown instrument type`);
    for (const key of ['attack', 'decay', 'release']) if (def[key] !== undefined) number(def[key], `${name}.${key}`, 0, 30);
    if (def.sustain !== undefined) number(def.sustain, `${name}.sustain`, 0, 1);
    if (def.welle && !['sine', 'square', 'sawtooth', 'triangle'].includes(def.welle)) throw Error(`${name}: invalid wave`);
    if (def.stimmen !== undefined) number(def.stimmen, `${name}.stimmen`, 1, 4);
    if (def.pulsbreite !== undefined) number(def.pulsbreite, `${name}.pulsbreite`, .01, .99);
    if (def.detune !== undefined) number(def.detune, `${name}.detune`, 0, 100);
    if (def.vibrato) { number(def.vibrato.rate, `${name}.vibrato.rate`, 0, 30); number(def.vibrato.tiefe, `${name}.vibrato.tiefe`, 0, 200); }
    validateFilter(def.filter, name);
    if (def.schlaege) for (const [hit, patch] of Object.entries(def.schlaege)) validateInstrumente({ [`${name}.${hit}`]: { ...def, ...patch, schlaege: undefined } });
  }
  return bank;
}

/** Compile and validate with no browser APIs. All section offsets are seconds. */
export function compileStueck(score, rawBank) {
  const id = score?.id || '<unknown>';
  try {
    if (score.format !== 'nebel-musik-1') throw Error('format must be nebel-musik-1');
    if (!/^[a-z0-9_]+$/.test(id)) throw Error('invalid ID');
    const bpm = number(score.bpm, 'bpm', 20, 300);
    if (!Array.isArray(score.takt) || score.takt.length !== 2) throw Error('takt must be [numerator, denominator]');
    const [top, bottom] = score.takt;
    if (!Number.isInteger(top) || top < 1 || top > 16 || ![2, 4, 8, 16].includes(bottom)) throw Error('unsupported meter');
    const bar = top * 16 / bottom, unit = 60 / bpm / 4;
    const bank = instrumentBank(rawBank);
    if (score.art !== undefined && !['musik', 'klang'].includes(score.art)) throw Error('art must be musik or klang');
    if (typeof score.loop !== 'boolean') throw Error('loop must be boolean');
    number(score.lautstaerke ?? .7, 'lautstaerke', 0, 1); number(score.hall ?? .25, 'hall', 0, 1);
    validateFilter(score.filter, 'filter');
    if (score.echo) {
      number(score.echo.verzoegerung_ms, 'echo.verzoegerung_ms', 1, 5000);
      number(score.echo.rueckkopplung, 'echo.rueckkopplung', 0, .85);
      number(score.echo.nass, 'echo.nass', 0, 1);
      number(score.echo.tiefpass ?? 1800, 'echo.tiefpass', 20, 22000);
    }
    if (!score.spuren || !Object.keys(score.spuren).length) throw Error('missing spuren');
    for (const [name, track] of Object.entries(score.spuren)) {
      if (!bank?.[track.instrument]) throw Error(`Track ${name}: unknown instrument ${track.instrument}`);
      number(track.lautstaerke ?? .7, `Track ${name} volume`, 0, 1); number(track.pan ?? 0, `Track ${name} pan`, -1, 1);
      if (track.oktave !== undefined && !Number.isInteger(track.oktave)) throw Error(`Track ${name}: integer octave required`);
      validateFilter(track.filter, `Track ${name}`);
    }
    const patterns = new Map();
    for (const [name, p] of Object.entries(score.muster || {})) {
      try {
        if (!score.spuren[p.spur]) throw Error(`unknown track ${p.spur}`);
        if (!Number.isInteger(p.takte) || p.takte < 1 || p.takte > 256) throw Error('takte must be 1..256');
        const parsed = parseNoten(p.noten, bar);
        if (parsed.length !== p.takte * bar) throw Error(`length ${parsed.length}, expected ${p.takte * bar}`);
        const def = bank[score.spuren[p.spur].instrument];
        for (const e of parsed.events) if (e.hit && !(e.hit === 'x' || def.schlaege?.[e.hit])) throw Error(`unknown hit ${e.hit}`);
        patterns.set(name, { ...parsed, spur: p.spur });
      } catch (error) { throw Error(`Pattern ${name}: ${error.message}`); }
    }
    const resolved = new Map();
    function resolve(name, stack = []) {
      if (resolved.has(name)) return resolved.get(name);
      if (stack.includes(name)) throw Error(`Cyclic section: ${[...stack, name].join(' -> ')}`);
      const s = score.abschnitte?.[name];
      if (!s) throw Error(`Unknown section ${name}`);
      let entries, transpose = 0;
      if (Array.isArray(s)) entries = s;
      else {
        const base = resolve(s.basis, [...stack, name]); entries = base.entries;
        if (!Number.isInteger(s.transponieren) || Math.abs(s.transponieren) > 48) throw Error(`Section ${name}: invalid transposition`);
        transpose = base.transpose + s.transponieren;
      }
      if (!entries.length) throw Error(`Section ${name}: empty`);
      const items = entries.map(ref => {
        if (typeof ref !== 'string') throw Error(`Section ${name}: invalid pattern reference`);
        const m = /^([a-zA-Z0-9_]+)(?:\*([1-9]\d*))?$/.exec(ref);
        if (!m || !patterns.has(m[1])) throw Error(`Section ${name}: unknown pattern ${ref}`);
        const repeat = Number(m[2] || 1);
        if (repeat > 256) throw Error(`Section ${name}: repeat limit`);
        return { pattern: patterns.get(m[1]), repeat };
      });
      const length = Math.max(...items.map(x => x.pattern.length * x.repeat));
      const result = { entries, items, transpose, length }; resolved.set(name, result); return result;
    }
    for (const name of Object.keys(score.abschnitte || {})) resolve(name);
    if (!Array.isArray(score.ablauf) || !score.ablauf.length || score.ablauf.length > 512) throw Error('invalid ablauf');
    const loopIndex = score.loop_ab ?? 0;
    if (!Number.isInteger(loopIndex) || loopIndex < 0 || loopIndex >= score.ablauf.length) throw Error('loop_ab outside ablauf');
    let cursor = 0, loopStart = 0; const events = [], sections = [];
    score.ablauf.forEach((name, index) => {
      const sec = resolve(name); if (index === loopIndex) loopStart = cursor * unit;
      sections.push({ name, index, start: cursor * unit, duration: sec.length * unit });
      for (const { pattern } of sec.items) {
        for (let base = 0; base < sec.length; base += pattern.length) {
          for (const e of pattern.events) {
            if (base + e.at >= sec.length) continue;
            const track = score.spuren[pattern.spur], transpose = sec.transpose + (track.oktave || 0) * 12;
            const pitches = e.pitches.map(p => p + transpose);
            if (pitches.some(p => p < 0 || p > 127)) throw Error(`Section ${name}: transposed pitch outside MIDI range`);
            events.push({ ...e, tie: e.tie && !(sec.length % pattern.length !== 0 && base + e.at + e.duration >= sec.length), pitches, at: (cursor + base + e.at) * unit, duration: Math.min(e.duration, sec.length - base - e.at) * unit, track: pattern.spur });
            if (events.length > 100000) throw Error('Score exceeds 100000 events');
          }
        }
      }
      cursor += sec.length;
    });
    // Merge ties after expansion, including pattern and section boundaries.
    const merged = [];
    for (const track of Object.keys(score.spuren)) {
      const line = events.filter(e => e.track === track).sort((a, b) => a.at - b.at);
      let previous;
      for (const e of line) {
        if (previous?.tie) {
          if (Math.abs(previous.at + previous.duration - e.at) > 1e-7 || String(previous.pitches) !== String(e.pitches) || !e.pitches.length) throw Error(`Track ${track}: tie must lead to the same adjacent pitch/chord`);
          previous.duration += e.duration; previous.tie = e.tie;
        } else { previous = { ...e }; merged.push(previous); }
      }
      if (previous?.tie) throw Error(`Track ${track}: dangling final tie (end with an untied note)`);
    }
    return { score, events: merged.filter(e => e.pitches.length || e.hit).sort((a, b) => a.at - b.at), sections, duration: cursor * unit, loopStart, loopDuration: cursor * unit - loopStart };
  } catch (error) { throw Error(`Piece ${id}: ${error.message}`); }
}

function random(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
function impulse(ctx) {
  const buffer = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * 2.2), ctx.sampleRate), rand = random(7411);
  for (let c = 0; c < 2; c++) { const data = buffer.getChannelData(c); let last = 0;
    for (let i = 0; i < data.length; i++) { last = .65 * last + .35 * (rand() * 2 - 1); data[i] = last * Math.exp(-i / ctx.sampleRate * 3.5) * Math.min(1, i / (ctx.sampleRate * .012)); }
  } return buffer;
}

export class MusicSynth {
  constructor({ context, destination, instrumente = {}, maxVoices = 24 } = {}) {
    this.context = context || null; this.ownsContext = !context; this.destination = destination;
    this.instrumente = validateInstrumente(instrumente); this.maxVoices = Math.floor(number(maxVoices, 'maxVoices', 1, 128));
    this.tracks = new Map(); this.cache = new Map(); this.zuordnung = {}; this.layers = new Set();
    this._volume = .65; this.request = 0; this.destroyed = false; this.paused = null; this.timer = null;
  }
  _ensure() {
    if (this.destroyed) throw Error('MusicSynth destroyed');
    if (!this.context) {
      const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Ctor) throw Error('Web Audio is unavailable'); this.context = new Ctor();
    }
    if (!this.bus) {
      const c = this.context; this.bus = c.createGain(); this.bus.gain.value = this._volume;
      this.limiter = c.createDynamicsCompressor(); this.limiter.threshold.value = -10; this.limiter.knee.value = 6; this.limiter.ratio.value = 12; this.limiter.attack.value = .003; this.limiter.release.value = .15;
      this.bus.connect(this.limiter); this.limiter.connect(this.destination || c.destination);
      this.ir = impulse(c);
    }
  }
  get lautstaerke() { return this._volume; }
  set lautstaerke(value) { this._volume = number(value, 'lautstaerke', 0, 1); if (this.bus) this.bus.gain.setTargetAtTime(value, this.context.currentTime, .02); }
  async ladeManifest(url) {
    if (this.destroyed) throw Error('MusicSynth destroyed');
    const absolute = new URL(url, globalThis.document?.baseURI || globalThis.location?.href || 'http://localhost/');
    const response = await fetch(absolute); if (!response.ok) throw Error(`Manifest ${absolute}: HTTP ${response.status}`);
    const m = await response.json(); if (m.format !== 'nebel-musik-1') throw Error('Unsupported manifest format');
    // base is public-root relative (audio/musik/), resolved from the manifest's parent audio directory.
    const base = new URL(m.base, new URL('../', absolute));
    const bankFiles = m.instrumente || ['instrumente.json'];
    const nextBank = { ...this.instrumente };
    for (const file of bankFiles) {
      const r = await fetch(new URL(file, base)); if (!r.ok) throw Error(`Instrument file ${file}: HTTP ${r.status}`);
      const b = await r.json(); if (b.format !== 'nebel-instrumente-1') throw Error(`Invalid instrument format: ${file}`);
      Object.assign(nextBank, validateInstrumente(b));
    }
    if (this.destroyed) throw Error('MusicSynth destroyed');
    this.instrumente = nextBank;
    for (const [id, entry] of Object.entries(m.tracks || {})) {
      number(entry.volume ?? .7, `Manifest ${id} volume`, 0, 1);
      if (this.tracks.has(id) && this.tracks.get(id).url !== new URL(entry.file, base).href) throw Error(`Conflicting track ${id}`);
      this.tracks.set(id, { ...entry, url: new URL(entry.file, base).href });
    }
    const merge = (a, b) => { for (const [k, v] of Object.entries(b)) { if (v && typeof v === 'object' && !Array.isArray(v)) { if (!a[k] || typeof a[k] !== 'object') a[k] = {}; merge(a[k], v); } else a[k] = v; } };
    merge(this.zuordnung, m.zuordnung || {}); return m;
  }
  async lade(input) {
    if (this.destroyed) throw Error('MusicSynth destroyed');
    if (typeof input === 'object') { const result = compileStueck(input, this.instrumente); this.cache.set(input.id, result); return result; }
    if (this.cache.has(input)) return this.cache.get(input);
    const entry = this.tracks.get(input); if (!entry) throw Error(`Unknown piece ${input}`);
    const response = await fetch(entry.url); if (!response.ok) throw Error(`${input}: HTTP ${response.status}`);
    const score = await response.json(); if (score.id !== input) throw Error(`${input}: file ID mismatch`);
    if (this.destroyed) throw Error('MusicSynth destroyed');
    return this.lade(score);
  }
  async spiele(id, { blende = 1.5, position = 0 } = {}) {
    number(blende, 'blende', 0, 30); const token = ++this.request; this._ensure();
    // Must be invoked by a user gesture. Call resume before the network await.
    await this.context.resume(); const data = await this.lade(id);
    if (token !== this.request || this.destroyed) return;
    this.paused = null; this._start(data, position, blende);
  }
  _start(data, position, fade) {
    number(position, 'position', 0, data.duration);
    const c = this.context, now = c.currentTime;
    for (const layer of this.layers) this._fade(layer, fade);
    const layer = this._layer(data); layer.origin = now + .03 - position; layer.scheduledUntil = position; layer.seek = position;
    const amount = (data.score.lautstaerke ?? .7) * (this.tracks.get(data.score.id)?.volume ?? 1);
    layer.gain.gain.setValueAtTime(fade ? 0 : amount, now);
    if (fade) layer.gain.gain.linearRampToValueAtTime(amount, now + fade);
    this.current = layer; this.layers.add(layer);
    // Resume/seek into held notes as shortened notes; do not leave a silent pad gap.
    if (position > 0) for (const e of data.events) {
      if (e.at < position && e.at + e.duration > position) this._voice(layer, { ...e, duration: e.at + e.duration - position }, now + .03);
    }
    this._tick(); if (!this.timer) this.timer = setInterval(() => this._tick(), 25);
  }
  _layer(data) {
    const c = this.context, gain = c.createGain(), input = c.createGain(), wet = c.createGain(), convolver = c.createConvolver();
    const nodes = [gain, input, wet, convolver]; let route = input;
    if (data.score.filter) { const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = Math.min(data.score.filter.tiefpass ?? 20000, c.sampleRate * .45); input.connect(filter); route = filter; nodes.push(filter); }
    route.connect(gain); convolver.buffer = this.ir; route.connect(convolver); convolver.connect(wet); wet.gain.value = data.score.hall ?? .25; wet.connect(gain);
    if (data.score.echo) {
      const e = data.score.echo, delay = c.createDelay(5), feedback = c.createGain(), filter = c.createBiquadFilter(), out = c.createGain();
      delay.delayTime.value = e.verzoegerung_ms / 1000; feedback.gain.value = e.rueckkopplung; filter.type = 'lowpass'; filter.frequency.value = Math.min(e.tiefpass ?? 1800, c.sampleRate * .45); out.gain.value = e.nass;
      route.connect(delay); delay.connect(filter); filter.connect(feedback); feedback.connect(delay); filter.connect(out); out.connect(gain); nodes.push(delay, feedback, filter, out);
    }
    gain.connect(this.bus);
    return { data, gain, input, nodes, voices: [], retired: false, killAt: Infinity };
  }
  _fade(layer, seconds) {
    const now = this.context.currentTime;
    layer.retired = true; layer.killAt = now + seconds + .01;
    const p = layer.gain.gain;
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(now); else { const value = p.value; p.cancelScheduledValues(now); p.setValueAtTime(value, now); }
    p.linearRampToValueAtTime(0, now + seconds);
  }
  _dispose(layer) {
    for (const v of [...layer.voices]) v.stop(this.context.currentTime);
    for (const node of layer.nodes) node.disconnect(); this.layers.delete(layer);
    if (this.current === layer) this.current = null;
  }
  _tick() {
    if (this.destroyed || !this.context || this.context.state === 'suspended') return;
    const now = this.context.currentTime;
    for (const layer of [...this.layers]) {
      if (now >= layer.killAt) { this._dispose(layer); continue; }
      if (layer.retired) continue;
      const data = layer.data, end = now + .12 - layer.origin;
      // A throttled/background timer skips missed notes instead of bursting them.
      const from = Math.max(layer.scheduledUntil, now - layer.origin);
      this._scheduleRange(layer, from, end);
      layer.scheduledUntil = Math.max(layer.scheduledUntil, end);
      if (!data.score.loop && now - layer.origin >= data.duration + 6) this._dispose(layer);
    }
    if (!this.layers.size && this.timer) { clearInterval(this.timer); this.timer = null; }
  }
  _scheduleRange(layer, from, to) {
    const { data } = layer, length = data.loopDuration;
    // First pass contains intro; later passes only repeat the loop body.
    const first = Math.max(0, Math.floor((from - data.duration) / length) + 1);
    const last = data.score.loop ? Math.max(0, Math.floor((to - data.duration) / length) + 1) : 0;
    for (let cycle = first; cycle <= last; cycle++) {
      if (cycle && !data.score.loop) break;
      const shift = cycle * length;
      for (const event of data.events) {
        if (cycle && event.at < data.loopStart - 1e-8) continue;
        const at = event.at + shift;
        if (at >= from - 1e-8 && at < to - 1e-8) this._voice(layer, event, layer.origin + at);
      }
    }
  }
  _voice(layer, event, at) {
    const ctx = this.context, track = layer.data.score.spuren[event.track], base = this.instrumente[track.instrument];
    const def = event.hit && base.schlaege?.[event.hit] ? { ...base, ...base.schlaege[event.hit] } : base;
    const pitches = event.pitches.length ? event.pitches : [def.note ?? 48];
    for (const pitch of pitches) {
      // Count overlapping scheduled voices at this note's time, across crossfades.
      const active = [...this.layers].flatMap(l => l.voices).filter(v => v.start <= at && v.end > at && v.stolenAt > at);
      if (active.length >= this.maxVoices) active.sort((a, b) => a.start - b.start)[0].stop(at);
      const freq = 440 * 2 ** ((pitch - 69) / 12), duration = event.duration;
      const attack = Math.max(.004, def.attack ?? .01), decay = Math.max(.004, def.decay ?? .1), release = Math.max(.004, def.release ?? .2);
      const sustain = def.sustain ?? .6, end = at + duration + release;
      const env = ctx.createGain(), pan = ctx.createStereoPanner(), nodes = [env, pan], sources = [];
      const amp = .2 * event.velocity * (track.lautstaerke ?? .7) / Math.sqrt(pitches.length);
      env.gain.setValueAtTime(0, at); const aEnd = at + Math.min(attack, duration * .45), dEnd = Math.min(at + duration, aEnd + decay);
      env.gain.linearRampToValueAtTime(amp, aEnd); env.gain.linearRampToValueAtTime(amp * sustain, dEnd); env.gain.setValueAtTime(amp * sustain, at + duration); env.gain.linearRampToValueAtTime(0, end);
      pan.pan.value = track.pan ?? 0; env.connect(pan); pan.connect(layer.input);
      let destination = env;
      const filter = track.filter || def.filter;
      if (filter) { const f = ctx.createBiquadFilter(); f.type = filter.bandpass ? 'bandpass' : 'lowpass'; f.frequency.value = Math.min(filter.bandpass ?? filter.tiefpass ?? 5000, ctx.sampleRate * .45); f.Q.value = filter.q ?? .7; f.connect(env); destination = f; nodes.push(f); }
      const osc = (frequency, wave = 'sine', detune = 0) => {
        const o = ctx.createOscillator(); o.type = wave; o.frequency.setValueAtTime(frequency, at); o.detune.value = detune;
        if (wave === 'square' && def.pulsbreite) {
          const real = new Float32Array(48), imag = new Float32Array(48);
          for (let k = 1; k < real.length; k++) { real[k] = 2 * Math.sin(2 * Math.PI * k * def.pulsbreite) / (Math.PI * k); imag[k] = 2 * (1 - Math.cos(2 * Math.PI * k * def.pulsbreite)) / (Math.PI * k); }
          o.setPeriodicWave(ctx.createPeriodicWave(real, imag));
        }
        sources.push(o); nodes.push(o); return o;
      };
      if (def.typ === 'pluck' || def.typ === 'noise') {
        const buffer = ctx.createBuffer(1, Math.ceil((duration + release) * ctx.sampleRate), ctx.sampleRate), data = buffer.getChannelData(0);
        const rand = random(1709 + pitch * 97 + Math.round(event.at * 100));
        if (def.typ === 'pluck') {
          const period = Math.max(2, Math.round(ctx.sampleRate / freq));
          for (let i = 0; i < Math.min(period, data.length); i++) data[i] = rand() * 2 - 1;
          for (let i = period; i < data.length; i++) data[i] = (def.daempfung ?? .993) * .5 * (data[i - period] + data[Math.max(0, i - period - 1)]);
        } else { let pink = 0;
          for (let i = 0; i < data.length; i++) { const white = rand() * 2 - 1; pink = .97 * pink + .03 * white;
            data[i] = (def.farbe === 'rosa' ? pink * 3 : white) * (def.modulation ? .65 + .35 * Math.sin(i / ctx.sampleRate * 2 * Math.PI * def.modulation) : 1);
            if (def.impuls) data[i] *= Math.exp(-i / ctx.sampleRate / def.impuls);
          }
        }
        const source = ctx.createBufferSource(); source.buffer = buffer; source.connect(destination); sources.push(source); nodes.push(source);
        if (def.ton) { const o = osc(def.ton, 'sine'); o.frequency.exponentialRampToValueAtTime(Math.max(20, def.ton / 2), at + .08); const g = ctx.createGain(); g.gain.setValueAtTime(.7, at); g.gain.exponentialRampToValueAtTime(.001, Math.min(end, at + .6)); o.connect(g); g.connect(destination); nodes.push(g); }
      } else if (def.typ === 'fm') {
        const carrier = osc(freq), mod = osc(freq * (def.verhaeltnis ?? 2)), depth = ctx.createGain();
        depth.gain.setValueAtTime(freq * (def.index ?? 1.2), at); depth.gain.exponentialRampToValueAtTime(.001, Math.min(end, at + .7)); mod.connect(depth); depth.connect(carrier.frequency); carrier.connect(destination); nodes.push(depth);
      } else {
        const count = def.typ === 'formant' ? 1 : Math.floor(def.stimmen ?? 1);
        for (let i = 0; i < count; i++) {
          const o = osc(freq, def.welle ?? 'sawtooth', (i - (count - 1) / 2) * (def.detune ?? 0));
          if (def.typ === 'formant') for (const f of (def.formanten ?? [350, 800, 2200])) { const band = ctx.createBiquadFilter(), g = ctx.createGain(); band.type = 'bandpass'; band.frequency.value = f; band.Q.value = 5; g.gain.value = .65; o.connect(band); band.connect(g); g.connect(destination); nodes.push(band, g); }
          else { const g = ctx.createGain(); g.gain.value = 1 / count; o.connect(g); g.connect(destination); nodes.push(g); }
          if (def.vibrato) { const lfo = osc(def.vibrato.rate), depth = ctx.createGain(); depth.gain.value = def.vibrato.tiefe; lfo.connect(depth); depth.connect(o.detune); nodes.push(depth); }
        }
      }
      let cleaned = false;
      const voice = { start: at, end, stolenAt: Infinity, stop: when => {
        if (cleaned) return;
        voice.stolenAt = Math.min(voice.stolenAt, when);
        voice.end = Math.min(voice.end, when + .005);
        env.gain.cancelScheduledValues(when); env.gain.setValueAtTime(env.gain.value, when); env.gain.linearRampToValueAtTime(0, when + .004);
        for (const s of sources) { try { s.stop(when + .005); } catch { /* already ended */ } }
      } };
      const cleanup = () => { if (cleaned) return; cleaned = true; for (const n of nodes) n.disconnect(); layer.voices = layer.voices.filter(v => v !== voice); };
      sources[0].onended = cleanup; layer.voices.push(voice);
      for (const s of sources) { s.start(at); s.stop(end); }
    }
  }
  stopp({ blende = 1 } = {}) {
    number(blende, 'blende', 0, 30); ++this.request; this.paused = null;
    if (!this.context) return; for (const l of this.layers) this._fade(l, blende); this.current = null;
    if (blende === 0) { for (const l of [...this.layers]) this._dispose(l); if (this.timer) clearInterval(this.timer); this.timer = null; }
  }
  get status() {
    if (!this.current) return this.paused ? { id: this.paused.data.score.id, pausiert: true, position: this.paused.position } : null;
    const d = this.current.data; let position = Math.max(0, this.context.currentTime - this.current.origin);
    if (d.score.loop && position >= d.duration) position = d.loopStart + (position - d.loopStart) % d.loopDuration;
    return { id: d.score.id, position, abschnitt: d.sections.findLast(s => s.start <= position)?.name, dauer: d.duration, loopStart: d.loopStart };
  }
  pause() {
    if (!this.current) { ++this.request; return; } const saved = { data: this.current.data, position: Math.min(this.current.data.duration, this.status.position) };
    this.stopp({ blende: 0 }); this.paused = saved;
  }
  async weiter() {
    if (!this.paused) return; const saved = this.paused; this.paused = null; const token = ++this.request;
    this._ensure(); await this.context.resume(); if (token !== this.request || this.destroyed) return; this._start(saved.data, saved.position, .05);
  }
  async renderOffline(id, sekunden) {
    number(sekunden, 'sekunden', .05, 600); const data = await this.lade(id);
    const Offline = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
    if (!Offline) throw Error('OfflineAudioContext unavailable');
    const ctx = new Offline(2, Math.ceil(sekunden * 44100), 44100), synth = new MusicSynth({ context: ctx, instrumente: this.instrumente, maxVoices: this.maxVoices });
    synth._volume = this._volume; synth._ensure(); const layer = synth._layer(data); layer.origin = 0; layer.gain.gain.value = (data.score.lautstaerke ?? .7) * (this.tracks.get(data.score.id)?.volume ?? 1); synth.layers.add(layer);
    synth._scheduleRange(layer, 0, sekunden); const result = await ctx.startRendering(); synth.zerstoere(); return result;
  }
  zerstoere() {
    if (this.destroyed) return; this.stopp({ blende: 0 }); this.destroyed = true;
    this.bus?.disconnect(); this.limiter?.disconnect(); this.cache.clear(); this.tracks.clear();
    if (this.ownsContext && this.context?.state !== 'closed') this.context?.close();
  }
}
export default MusicSynth;
