// BN: deterministic, renderer-free extension of Signals.js. See docs/story/k3_ruf.
export const HEARING = Object.freeze({ schichtgaenger: 5, kalkstaubgeist: 6, signalkraehe: 9, lohnlistenmotte: 4, geruestklang: 7, nachhall: 10 });
export const DIRECTIONS = Object.freeze({ north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] });
export const HANDLED_LIMIT = 64;
const key = ([x, y]) => `${x},${y}`;
const tile = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger);
const copy = (v) => JSON.parse(JSON.stringify(v));
const distance = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const has = (set, value) => set instanceof Set ? set.has(value) : Array.isArray(set) && set.includes(value);
const unique = (a) => [...new Set(Array.isArray(a) ? a.filter((s) => typeof s === 'string') : [])];
export const hearingOf = (id) => HEARING[String(id).replace(/_elite$/, '')] ?? 5;

/** Current Dunscar rows: '.', 's', 'g', 'w' are floor, 'I' is solid.
 * Collision matrices use 0/false for floor. Unknown tiles fail closed.
 * Runtime should pass its ground-layer AND blocker-aware callback instead. */
export function isSignalWalkable(map, x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) return false;
  if (Array.isArray(map?.collision)) {
    const v = map.collision[y]?.[x];
    return v === 0 || v === false;
  }
  return typeof map?.rows?.[y]?.[x] === 'string' && '.sgw'.includes(map.rows[y][x]);
}

/** Ordered four-neighbour corridor, origin included; range counts EDGES.
 * Authored corridor wins. Without one, go straight, turn only at a unique bend;
 * never fan out into an open plaza or guess a branch. */
export function projectSignal({ origin, dir, rangeTiles, routeTiles = [], isWalkable, closedTiles = [] }) {
  if (!tile(origin) || !DIRECTIONS[dir] || !Number.isInteger(rangeTiles) || rangeTiles < 1) return [];
  const closed = new Set(closedTiles.filter(tile).map(key));
  const open = (p) => tile(p) && !closed.has(key(p)) && isWalkable(...p);
  if (!open(origin)) return [];
  const out = [[...origin]], seen = new Set([key(origin)]);
  let vector = DIRECTIONS[dir];
  if (routeTiles.length) {
    if (!tile(routeTiles[0]) || key(routeTiles[0]) !== key(origin)) return out;
    for (const next of routeTiles.slice(1, rangeTiles + 1)) {
      const prev = out.at(-1);
      if (!open(next) || distance(prev, next) !== 1 || seen.has(key(next))) break;
      if (out.length === 1 && (next[0] - prev[0] !== vector[0] || next[1] - prev[1] !== vector[1])) break;
      out.push([...next]); seen.add(key(next));
    }
    return out;
  }
  for (let step = 0; step < rangeTiles; step++) {
    const prev = out.at(-1);
    let next = [prev[0] + vector[0], prev[1] + vector[1]];
    if (!open(next) || seen.has(key(next))) {
      if (step === 0) break; // chosen first direction cannot turn around a wall
      const candidates = Object.values(DIRECTIONS).map(([dx, dy]) => [prev[0] + dx, prev[1] + dy]).filter((p) => open(p) && !seen.has(key(p)));
      if (candidates.length !== 1) break;
      next = candidates[0]; vector = [next[0] - prev[0], next[1] - prev[1]];
    }
    out.push(next); seen.add(key(next));
  }
  return out;
}

/** Hearing follows traversable floor, not Euclidean distance through walls. */
export function hearingListeners({ listeners, tiles, safeTiles = [], isWalkable, closedTiles = [] }) {
  const safe = new Set(safeTiles.map(key)), closed = new Set(closedTiles.map(key));
  const targets = new Set(tiles.filter((p) => !safe.has(key(p))).map(key));
  return listeners.filter((l) => {
    if (l.alive === false || !tile(l.tile) || safe.has(key(l.tile)) || closed.has(key(l.tile)) || !isWalkable(...l.tile)) return false;
    const radius = Number.isInteger(l.hearing) && l.hearing >= 0 ? l.hearing : hearingOf(l.encounter);
    const queue = [[l.tile, 0]], seen = new Set([key(l.tile)]);
    for (let i = 0; i < queue.length; i++) {
      const [p, d] = queue[i];
      if (targets.has(key(p))) return true;
      if (d >= radius) continue;
      for (const [dx, dy] of Object.values(DIRECTIONS)) {
        const n = [p[0] + dx, p[1] + dy], k = key(n);
        if (!seen.has(k) && !closed.has(k) && isWalkable(...n)) { seen.add(k); queue.push([n, d + 1]); }
      }
    }
    return false;
  }).map((l) => ({ ...copy(l), hearing: l.hearing ?? hearingOf(l.encounter) }));
}

const data = (s) => s.signalRoutesData ?? s.content.signalRoutes ?? {};
const stations = (s) => data(s).stationen ?? [];
const station = (s, id) => stations(s).find((st) => st.id === id);
const pattern = (s, id) => stations(s).map((st) => st.patterns?.[id]).find(Boolean);
const text = (s, id) => data(s).texte?.[id] ?? 'Rufaktion nicht verfügbar.';
const reason = (s, id) => ({ ok: false, reason: id, text: text(s, id), form: 'linie_fehl' });
const known = (s, id) => has(s.signal?.learnedPatterns, id) || (pattern(s, id)?.learnedFromClue && s.hasClue?.(pattern(s, id).learnedFromClue));
const flagsMeet = (s, obj) => (obj?.requires_flags ?? []).every((f) => s.flags.has(f));
const validSpeaker = (s, n) => (n === 1 || n === 2 && s.hasP2?.()) && n === (s.acting ?? 1);
const context = (s) => s.signalRouteContext ?? {};
const closedTiles = (s, map) => (context(s).closedLocks ?? []).filter((l) => l.map === map && l.closed !== false).map((l) => l.tile).filter(tile);
const walkable = (s, map) => (x, y) => isSignalWalkable(s.content.maps[map], x, y) && (!context(s).isWalkable || context(s).isWalkable(map, x, y));
const inLock = (s) => s.map === 'ds_speisewagen' || (typeof context(s).insideLock === 'function' ? context(s).insideLock(s.acting ?? 1) : context(s).insideLock === true);
function commandCheck(s, id) {
  if (typeof id !== 'string' || !id.trim() || id.length > 160) return reason(s, 'command');
  if (has(s.signal?.handled, id)) return reason(s, 'duplicate');
  return null;
}
function ensure(s) {
  // Never replace the base charges/reserveUsed owned by Signals.js.
  s.signal.learnedPatterns ??= new Set(); s.signal.revealedRoutes ??= new Set();
  s.signal.bindings ??= {}; s.signal.lastAlarm ??= null; s.signal.handled ??= []; s.signal.routeTime ??= 0;
}
function remember(s, id) { ensure(s); s.signal.handled.push(id); s.signal.handled = s.signal.handled.slice(-HANDLED_LIMIT); }
function locks(s) { return [...new Map(stations(s).map((st) => [st.lock.id, st.lock])).values()]; }
const validRoute = (s, r) => typeof r === 'string' && stations(s).some((st) => st.directions.some((dir) => r === `${st.id}:${dir}`));

export const signalRouteMethods = {
  /** Data injection avoids Node/Vite JSON import differences; context is transient. */
  configureSignalRoutes(defs, runtimeContext = {}) { this.signalRoutesData = defs; this.signalRouteContext = runtimeContext; },
  resetSignalRoutes() {
    Object.assign(this.signal, { learnedPatterns: new Set(), revealedRoutes: new Set(), bindings: {}, lastAlarm: null, handled: [], routeTime: 0 });
    this.signalRouteOffers = new Map();
  },
  hearingOf,
  patternSound(id) {
    const sound = data(this).klang_zuordnung?.[id];
    return pattern(this, id) && sound ? { call: sound.call, hall: sound.hall, zeichen: sound.zeichen } : null;
  },
  signSymbol(id) {
    const n = data(this).klang_zuordnung?.[id]?.symbol;
    return pattern(this, id) && Number.isInteger(n) && n >= 0 && n <= 15 ? n : null;
  },
  previewCall(stationId, patternId, dir) {
    const st = station(this, stationId);
    const base = { tiles: [], safeTiles: copy(st?.safeTiles ?? []), listeners: [], cost: 1, warning: '' };
    const fail = (why) => ({ ...base, ...reason(this, why), warning: text(this, why) });
    if (!st) return fail('unknown_station');
    if (st.map !== this.map) return fail('wrong_map');
    if (!st.patterns[patternId]) return fail('unknown_pattern');
    if (!known(this, patternId)) return fail('unlearned');
    if (!st.directions.includes(dir)) return fail('direction');
    const isWalkable = walkable(this, st.map), shut = closedTiles(this, st.map);
    base.tiles = projectSignal({ origin: st.tile, dir, rangeTiles: st.rangeTiles, routeTiles: st.routeTiles, isWalkable, closedTiles: shut });
    const live = context(this).listeners?.(st.map) ?? this.content.maps[st.map]?.roamers ?? st.listeners;
    base.listeners = hearingListeners({ listeners: live.filter((l) => flagsMeet(this, l.visible_if)).map((l) => ({ ...l, hearing: st.listeners.find((d) => d.id === l.id)?.hearing ?? hearingOf(l.encounter) })), tiles: base.tiles, safeTiles: st.safeTiles, isWalkable, closedTiles: shut });
    if (!this.hasSignalDevice()) return fail('no_device');
    if (this.signal.charges <= 0) return fail('leer');
    if (base.tiles.length < 2 || st.routeTiles.length && base.tiles.length !== st.routeTiles.length) return fail('blocked');
    const accepted = st.accepted.find((a) => a.pattern === patternId && a.dir === dir);
    if (accepted && !flagsMeet(this, accepted)) return fail('requirements');
    const [x, y] = st.safeTiles[0];
    const warning = text(this, 'warnung').replace('{count}', base.listeners.length).replace('{x}', x).replace('{y}', y);
    return { ...base, ok: true, reason: null, warning, risk: text(this, 'risiko'), text: text(this, 'vorschau'), form: 'linie_vorschau', sound: this.patternSound(patternId), symbol: this.signSymbol(patternId) };
  },
  confirmCall(commandId, stationId, patternId, dir) {
    const rejected = commandCheck(this, commandId);
    if (rejected) return { handled: false, result: rejected };
    const preview = this.previewCall(stationId, patternId, dir);
    if (!preview.ok) return { handled: false, result: preview };
    const st = station(this, stationId), accepted = st.accepted.find((a) => a.pattern === patternId && a.dir === dir);
    const kind = accepted?.kind ?? (preview.listeners.length ? 'alarm' : 'fallback');
    const result = { ok: true, kind, station: stationId, pattern: patternId, dir, speaker: this.acting ?? 1, map: st.map, tiles: preview.tiles, safeTiles: preview.safeTiles, listeners: preview.listeners, cost: 1, text: text(this, kind), form: accepted ? 'linie_aktiv' : 'linie_fehl', sound: this.patternSound(patternId), symbol: this.signSymbol(patternId) };
    // Commit id + semantic effects BEFORE applySignal emits: reentrant events/saves
    // see the complete operation once the existing charge method subtracts once.
    remember(this, commandId);
    if (accepted) {
      if (kind === 'route') { this.signal.revealedRoutes.add(`${stationId}:${dir}`); result.routeTiles = copy(preview.tiles); }
      if (accepted.flag) { this.flags.add(accepted.flag); result.flag = accepted.flag; }
    } else if (kind === 'fallback') {
      Object.assign(result, { map: st.fallback.map, spawn: st.fallback.spawn, nerves: Math.min(5, Math.max(0, st.fallback.nerves ?? 0)) });
      this.composure = Math.max(0, this.composure - result.nerves);
      this.pendingTravel = { map: result.map, spawn: result.spawn };
    }
    if (preview.listeners.length) {
      const safe = new Set(st.safeTiles.map(key));
      this.signal.lastAlarm = { map: st.map, tiles: preview.tiles.filter((p) => !safe.has(key(p))), until: this.signal.routeTime + st.fallback.alarmSeconds };
      result.alarm = copy(this.signal.lastAlarm);
    }
    this.applySignal({ signal: 'call' });
    this.emit('signal_route', copy(result));
    return { handled: true, result };
  },
  listen(stationId) {
    const st = station(this, stationId);
    if (!st) return reason(this, 'unknown_station');
    if (st.map !== this.map) return reason(this, 'wrong_map');
    return { ok: true, hints: copy(st.hints.filter((h) => flagsMeet(this, h))), text: text(this, 'horch_an'), form: 'horchtrichter', cost: 0 };
  },
  offerPrivateAnswer(stationId, speaker = this.acting ?? 1) {
    const st = station(this, stationId);
    if (!st?.privateAnswer || !data(this).bindungen?.[stationId]) return reason(this, 'unknown_station');
    if (st.map !== this.map) return reason(this, 'wrong_map');
    if (!validSpeaker(this, speaker)) return reason(this, 'speaker');
    if (inLock(this)) return reason(this, 'inside_lock');
    if (this.signal.bindings?.[speaker]) return reason(this, 'bound');
    // Transient consent offer, deliberately absent from saves and cleared on load.
    this.signalRouteOffers ??= new Map(); this.signalRouteOffers.set(speaker, { stationId, map: this.map });
    return { ok: true, speaker, warning: text(this, 'bindung_warnung'), text: text(this, 'bindung_warnung'), form: speaker === 2 ? 'bindung_p2' : 'bindung', koop: text(this, 'koop'), passives: copy(data(this).bindungen[stationId].passives) };
  },
  cancelPrivateAnswer(speaker = this.acting ?? 1) { this.signalRouteOffers?.delete(speaker); },
  acceptPrivateAnswer(commandId, stationId, speaker = this.acting ?? 1) {
    const rejected = commandCheck(this, commandId);
    if (rejected) return { handled: false, result: rejected };
    const offer = this.signalRouteOffers?.get(speaker), st = station(this, stationId);
    if (!validSpeaker(this, speaker)) return { handled: false, result: reason(this, 'speaker') };
    if (!st || this.map !== st.map || offer?.map !== this.map || offer?.stationId !== stationId) return { handled: false, result: reason(this, 'consent') };
    if (inLock(this)) return { handled: false, result: reason(this, 'inside_lock') };
    if (this.signal.bindings?.[speaker]) return { handled: false, result: reason(this, 'bound') };
    const def = data(this).bindungen[stationId];
    remember(this, commandId); this.signalRouteOffers.delete(speaker);
    this.signal.bindings[speaker] = { station: stationId, pattern: st.privateAnswer.pattern, speaker, until: 'schleuse' };
    this.flags.add(def.flag);
    const result = { ok: true, speaker, binding: copy(this.signal.bindings[speaker]), flag: def.flag, text: def.journal, warning: text(this, 'bindung_warnung'), form: speaker === 2 ? 'bindung_p2' : 'bindung', koop: text(this, 'koop') };
    this.emit('signal_binding', copy(result)); return { handled: true, result };
  },
  bindingPassive(speaker = this.acting ?? 1) {
    const binding = this.signal.bindings?.[speaker];
    return binding ? copy(data(this).bindungen[binding.station]?.passives ?? []) : [];
  },
  enterLock(mapId, lockId) {
    if (this.map !== mapId || !locks(this).some((l) => l.id === lockId && l.map === mapId)) return reason(this, 'invalid_lock');
    ensure(this);
    const ended = Object.values(this.signal.bindings).map((b) => ({ speaker: b.speaker, text: data(this).bindungen[b.station].endText, form: 'schleuse_auf' }));
    this.signal.bindings = {}; this.signal.lastAlarm = null; this.signalRouteOffers = new Map();
    const result = { ok: true, map: mapId, lock: lockId, ended, text: text(this, 'schleuse'), form: 'schleuse_auf' };
    this.emit('signal_lock', copy(result)); return result;
  },
  tickSignalRoutes(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    ensure(this); this.signal.routeTime += dt;
    if (this.signal.lastAlarm && this.signal.lastAlarm.until <= this.signal.routeTime) {
      this.signal.lastAlarm = null;
      this.emit('signal_alarm_end', { text: text(this, 'alarm_ende'), form: 'hoerkreis' });
    }
  },
  meetsSignalRoutes(o = {}) {
    if (o.requires_route !== undefined && !has(this.signal.revealedRoutes, o.requires_route)) return false;
    if (o.requires_pattern !== undefined && !known(this, o.requires_pattern)) return false;
    if (o.requires_binding !== undefined) {
      if (o.requires_binding === false) return !this.signal.bindings?.[this.acting ?? 1];
      if (![1, 2].includes(o.requires_binding) || !this.signal.bindings?.[o.requires_binding]) return false;
    }
    return true;
  },
  applySignalRoutes(e = {}) {
    ensure(this);
    if (pattern(this, e.learn_pattern)) this.signal.learnedPatterns.add(e.learn_pattern);
    if (validRoute(this, e.reveal_route)) this.signal.revealedRoutes.add(e.reveal_route);
    if (e.enter_lock) return this.enterLock(e.enter_lock.map, e.enter_lock.id);
    return { ok: true, text: text(this, 'wissen'), form: 'horchtrichter' };
  },
  serializeSignalRoutes() {
    return { signalRoutes: { v: 1, learnedPatterns: [...(this.signal.learnedPatterns ?? [])], revealedRoutes: [...(this.signal.revealedRoutes ?? [])], bindings: copy(this.signal.bindings ?? {}), lastAlarm: copy(this.signal.lastAlarm ?? null), handled: [...(this.signal.handled ?? [])].slice(-HANDLED_LIMIT), routeTime: this.signal.routeTime ?? 0 } };
  },
  loadSignalRoutes(snapshot = {}) {
    // Invoke AFTER loadSignal(snapshot); reserves and charges are never rewritten here.
    const raw = snapshot?.signalRoutes;
    const s = raw?.v === 1 ? raw : {};
    this.resetSignalRoutes();
    for (const id of unique(s.learnedPatterns)) if (pattern(this, id)) this.signal.learnedPatterns.add(id);
    for (const st of stations(this)) for (const [id, def] of Object.entries(st.patterns)) if (this.hasClue?.(def.learnedFromClue)) this.signal.learnedPatterns.add(id);
    for (const id of unique(s.revealedRoutes)) if (validRoute(this, id)) this.signal.revealedRoutes.add(id);
    for (const n of [1, 2]) {
      const b = s.bindings?.[n], st = station(this, b?.station);
      if (st && b.speaker === n && b.until === 'schleuse' && b.pattern === st.privateAnswer.pattern && data(this).bindungen?.[st.id]) this.signal.bindings[n] = copy(b);
    }
    this.signal.handled = unique(s.handled).filter((id) => id.trim() && id.length <= 160).slice(-HANDLED_LIMIT);
    this.signal.routeTime = Number.isFinite(s.routeTime) && s.routeTime >= 0 ? s.routeTime : 0;
    const a = s.lastAlarm;
    if (a && this.content.maps[a.map] && Number.isFinite(a.until) && a.until > this.signal.routeTime && Array.isArray(a.tiles)) {
      const safe = new Set(stations(this).filter((st) => st.map === a.map).flatMap((st) => st.safeTiles).map(key));
      const tiles = a.tiles.filter((p) => tile(p) && isSignalWalkable(this.content.maps[a.map], ...p) && !safe.has(key(p)));
      if (tiles.length) this.signal.lastAlarm = { map: a.map, tiles: copy(tiles), until: a.until };
    }
  },
};
