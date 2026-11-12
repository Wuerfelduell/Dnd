// Paket BG: reine, synchrone Anspruchslogik. Keine automatische Engine-Verdrahtung.
// Vor Verwendung content.claimSources = ansprueche.json und
// content.claimReplacements = ersatz.json laden; Object.assign(GameState.prototype, claimMethods).
const STATES = new Set(['offen', 'eingeloest', 'verfallen']);
const validPlayer = (s, p) => (p === 1 || p === 2) && (p === 1 || !!s.p2);
const activePlayer = (s, p) => validPlayer(s, p) && (p === 1 || s.hasP2());
const sources = s => s.content.claimSources ?? {};
const rows = s => s.content.claimReplacements ?? [];
const own = (o, k) => Object.hasOwn(o ?? {}, k);
const bag = () => Object.create(null);

/** Party.withPlayer(1) wechselt im p2-Kontext NICHT zurück. Hier explizit normalisieren. */
export function withClaimPlayer(state, player, fn) {
  if (!validPlayer(state, player)) return undefined;
  if ((state.acting ?? 1) === player) return fn();
  if (state.acting === 2) return state.withPartner(fn);
  return state.withPlayer(player, fn, { quiet: true });
}

/** Alle bestehenden Lager, auch Büro, Kahn und Speisewagen, ohne sie anzulegen. */
export function storedClaimCount(state, item) {
  return [state.storage, ...Object.values(state.stashes ?? {})]
    .reduce((n, stash) => n + Math.max(0, Number(stash?.[item]) || 0), 0);
}

export function claimSource(state, source) {
  if (own(sources(state), source)) return source;
  return Object.keys(sources(state)).find(id => sources(state)[id].flags.includes(source)) ?? null;
}
const blocked = (s, id) => sources(s)[id].blocked_by?.some(f => s.flags.has(f));
const completed = (s, id) => sources(s)[id].flags.some(f => s.flags.has(f));
function init(s) {
  s.claims ??= bag(); s.claimCommands ??= bag(); s.claimAcquisitions ??= bag(); s.claimSelections ??= bag();
}
function used(s, commandId) {
  init(s);
  return typeof commandId !== 'string' || !commandId.trim() || own(s.claimCommands, commandId);
}

export const claimMethods = {
  resetClaims() {
    this.claims = bag(); this.claimCommands = bag(); this.claimAcquisitions = bag(); this.claimSelections = bag();
  },

  openClaims(source) {
    init(this);
    const id = claimSource(this, source);
    if (!id || (!completed(this, id) && !blocked(this, id))) return false;
    const entry = this.claims[id] ??= bag();
    for (const p of this.hasP2() ? [1, 2] : [1]) {
      if (!own(entry, p)) entry[p] = blocked(this, id) ? 'verfallen' : 'offen';
      else if (blocked(this, id) && entry[p] === 'offen') entry[p] = 'verfallen';
    }
    return true;
  },

  /** Beim Beitritt/Laden aufrufen; Lookups holen verspätete Quellen ebenfalls nach. */
  syncClaims() {
    init(this);
    for (const id of Object.keys(sources(this))) this.openClaims(id);
    return this.claims;
  },

  claimFor(source, player = this.acting ?? 1) {
    if (!activePlayer(this, player)) return null;
    this.syncClaims();
    const id = claimSource(this, source);
    if (!id || this.claims[id]?.[player] !== 'offen' || !completed(this, id) || blocked(this, id)) return null;
    return withClaimPlayer(this, player, () => {
      const def = sources(this)[id];
      // Ungebundene persönliche Artefakte benötigen keinen getrunkenen Trank.
      const unbound = def.rewards.find(r => r.requires_pathway === undefined);
      if (!unbound && (!this.pathway || this.pathway.seq === 10)) return { item: null, qty: 0, reason: 'kein_pfad' };
      const reward = def.rewards.find(r => this.meetsPathway(r.requires_pathway));
      if (!reward) return { item: null, qty: 0, reason: 'pfad_oder_sequenz' };
      const item = this.item(reward.item);
      if (!item || (item.kind === 'artifact' && reward.personal !== true) || item.kind === 'key') return null;
      return { item: reward.item, qty: reward.qty, reason: def.kind };
    });
  },

  redeem(commandId, source, player = this.acting ?? 1) {
    if (used(this, commandId)) return null;
    const reward = this.claimFor(source, player);
    if (!reward?.item) return reward;
    const id = claimSource(this, source);
    // Vor addItem sperren: dessen synchrone Events dürfen keine zweite Auszahlung auslösen.
    this.claims[id][player] = 'eingeloest';
    this.claimCommands[commandId] = { source: id, player, item: reward.item };
    withClaimPlayer(this, player, () => this.addItem(reward.item, reward.qty));
    this.emit('claim', { source: id, player, item: reward.item });
    this.emit('changed');
    return reward;
  },

  forfeit(source, player, why = 'verfallen') {
    init(this);
    const id = claimSource(this, source);
    if (!id || !validPlayer(this, player)) return false;
    const entry = this.claims[id] ??= bag();
    if (entry[player] === 'eingeloest' || entry[player] === 'verfallen') return false;
    entry[player] = 'verfallen';
    this.emit('claim_forfeit', { source: id, player, why }); this.emit('changed');
    return true;
  },

  /** Auswahl vor Seq-9-Erstkauf; verändert NICHT pathway oder Ritualfortschritt. */
  selectClaimPathway(player, pathway) {
    init(this);
    if (!activePlayer(this, player) || !this.content.pathways[pathway]) return false;
    const current = withClaimPlayer(this, player, () => this.pathway);
    if (current && current.id !== pathway) return false;
    this.claimSelections[player] = pathway;
    return true;
  },

  /** Nur vom erfolgreichen Erwerbsadapter, nie vom Öffnen eines Angebots aufrufen. */
  recordClaimAcquisition(player, pathway, seq) {
    init(this);
    const row = rows(this).find(r => r.pathway === pathway && r.seq === seq);
    if (!activePlayer(this, player) || !row || row.source_type !== 'acquisition') return false;
    if (!withClaimPlayer(this, player, () => this.itemCount(row.core) > 0 || this.itemCount(row.potion) > 0)) return false;
    (this.claimAcquisitions[player] ??= bag())[row.source] = true;
    return true;
  },

  /** Gibt Ablehnungsgrund und optional Angebot; kein Kauf, kein Zufall, keine Nebenwirkung auf Beute. */
  replacementCheck(player, seq, { pathway, kind = 'item' } = {}) {
    init(this);
    if (!activePlayer(this, player) || !['item', 'formula'].includes(kind)) return { reason: 'spieler' };
    return withClaimPlayer(this, player, () => {
      const pid = this.pathway?.id ?? this.claimSelections[player];
      const row = rows(this).find(r => r.pathway === pid && r.seq === seq);
      if (!row || (pathway && pathway !== pid)) return { reason: 'kein_pfad' };
      if (this.pathway && this.pathway.seq <= seq) return { reason: 'erreicht' };
      if (seq !== 9 && !this.meetsPathway(row.requires_pathway)) return { reason: 'sequenz' };
      if (row.source_type === 'claim') {
        const id = claimSource(this, row.source);
        if (!id || blocked(this, id) || this.claims?.[id]?.[player] === 'verfallen') return { reason: 'verfallen' };
        if (!completed(this, id)) return { reason: 'quelle' };
      } else if (!this.claimAcquisitions[player]?.[row.source]) return { reason: 'quelle' };
      if (this.itemCount(row.potion) > 0) return { reason: 'trank' };
      if (storedClaimCount(this, row.potion) > 0) return { reason: 'lager' };
      if (kind === 'formula') {
        if (seq === 4) return { reason: 'formel_zirkel' }; // Seb (2026-11-12): Halbgott-Formel nur über Treffen oder Elite-Beute
        if (this.itemCount(row.formula) > 0 || storedClaimCount(this, row.formula) > 0) return { reason: 'formel' };
        if (this.honor < row.formula_honor) return { reason: 'ehre' };
        return { reason: null, offer: { item: row.formula, where: 'kittering', cost: row.formula_cost }, row };
      }
      if (this.itemCount(row.core) > 0 || storedClaimCount(this, row.core) > 0) return { reason: 'zutat' };
      return { reason: null, offer: { item: row.item, where: row.where, cost: row.cost }, row };
    });
  },

  replacementFor(player, seq, options) {
    return this.replacementCheck(player, seq, options).offer ?? null;
  },

  /** Bei Bestätigung erneut prüfen; gilt auch für sichere Wiederholungsproben. */
  redeemReplacement(commandId, player, seq, options) {
    if (this.claimReplacementBusy || used(this, commandId)) return null;
    const { offer, row } = this.replacementCheck(player, seq, options);
    if (!offer || this.money < offer.cost) return null;
    this.claimCommands[commandId] = { source: row.id, player, item: offer.item };
    // Ersatz vor erster Abholung erfüllt denselben persönlichen Anspruch, kein Doppelbezug.
    if (row.source_type === 'claim' && offer.item === row.core) {
      this.syncClaims(); this.claims[row.source][player] = 'eingeloest';
    }
    this.claimReplacementBusy = true;
    try {
      this.addMoney(-offer.cost);
      withClaimPlayer(this, player, () => this.addItem(offer.item, 1));
    } finally { this.claimReplacementBusy = false; }
    this.emit('claim_replacement', { player, ...offer }); this.emit('changed');
    return offer;
  },

  meetsClaims(o = {}) {
    this.syncClaims();
    const player = this.acting ?? 1;
    if (o.requires_p2 !== undefined && (player === 2 && this.hasP2()) !== o.requires_p2) return false;
    if (o.requires_claim !== undefined) {
      const id = claimSource(this, o.requires_claim);
      if (!id || this.claims[id]?.[player] !== 'offen') return false;
    }
    // „missing“ = bewältigter Anspruch, dessen Auszahlung noch fehlt, NICHT beliebige unbekannte Quelle.
    if (o.requires_claim_missing !== undefined) {
      const id = claimSource(this, o.requires_claim_missing);
      if (!id || !completed(this, id) || this.claims[id]?.[player] !== 'offen') return false;
    }
    if (o.requires_replacement && !this.replacementFor(player, o.requires_replacement.seq, o.requires_replacement)) return false;
    return true;
  },

  /** commandId muss vom bestätigten UI-Befehl stammen, nicht von der Knoten-ID. */
  applyClaims(e = {}, { commandId } = {}) {
    if (e.claim) return this.redeem(commandId, e.claim, this.acting ?? 1);
    if (e.replacement) return this.redeemReplacement(commandId, this.acting ?? 1, e.replacement.seq, e.replacement);
    return null;
  },

  serializeClaims() {
    init(this);
    return JSON.parse(JSON.stringify({ claims: this.claims, claimCommands: this.claimCommands,
      claimAcquisitions: this.claimAcquisitions, claimSelections: this.claimSelections }));
  },

  loadClaims(data = {}) {
    this.resetClaims();
    for (const [source, entry] of Object.entries(data?.claims ?? {})) {
      if (!own(sources(this), source) || !entry || typeof entry !== 'object') continue;
      const clean = bag();
      for (const p of [1, 2]) if (STATES.has(entry[p])) clean[p] = entry[p];
      this.claims[source] = clean;
    }
    for (const [id, cmd] of Object.entries(data?.claimCommands ?? {})) {
      if (id.trim() && cmd && [1, 2].includes(cmd.player) && this.item(cmd.item)) this.claimCommands[id] = { source: cmd.source, player: cmd.player, item: cmd.item };
    }
    for (const p of [1, 2]) {
      this.claimAcquisitions[p] = bag();
      for (const row of rows(this)) if (row.source_type === 'acquisition' && data?.claimAcquisitions?.[p]?.[row.source] === true) this.claimAcquisitions[p][row.source] = true;
      const selected = data?.claimSelections?.[p];
      if (own(this.content.pathways, selected)) this.claimSelections[p] = selected;
    }
    this.syncClaims();
  },
};
