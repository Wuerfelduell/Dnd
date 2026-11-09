// Aufstieg über Tränke: Pfade, Sequenzen, Verdauung, Unruhe und Schilling.
//
// Begriffe:
// - Pfad (pathway): eine von sieben Linien (Laterne, Faden, Maske, Echo, Kessel, Eisen, Schlüssel).
// - Sequenz: Stufe auf dem Pfad. Man beginnt mit 9 und steigt bis 7 auf (kleiner = stärker).
// - Verdauung (digestion, 0–100): wächst, wenn man nach dem Grundsatz des Pfades handelt
//   (state.act). Erst bei 100 verträgt man den nächsten Trank gefahrlos.
// - Unruhe (0–100): kommt mit jedem Trank, mit Geistsicht und zerrütteten Nerven. Klingt mit der
//   Zeit und durch passendes Handeln ab. Bei 100 droht der Kontrollverlust (Ohnmacht, nie Game Over).
// - Schilling: Währung für die Händler auf dem Nachtmarkt.
//
// Die Methoden werden in GameState eingehängt (siehe unten in GameState.js).

export const SEQ_START = 9;
export const SEQ_MAX = 7; // höchste erreichbare Stufe in dieser Version
export const DIGEST_RATE = { 9: 1, 8: 0.7, 7: 0.5 };
export const UNRUHE_MAX = 100;
export const UNRUHE_DECAY_PER_SEC = 0.25;
export const UNRUHE_VISION_PER_SEC = 0.35;
export const VISION_DIGEST_CAP = 25; // pro Kartenbesuch
/** Was hinter den Verdauungs-Schlüsseln steckt (für Anzeige und Rückmeldungen). */
export const DIGEST_LABELS = {
  clue: 'Hinweis gefunden', hidden_clue: 'verborgene Spur gefunden', fact_likely: 'Information bestätigt',
  fact_refuted: 'Lüge widerlegt', conclusion: 'Schlussfolgerung gezogen', quest: 'Auftrag erledigt',
  side_quest: 'Nebenauftrag erledigt', combat_win: 'Kampf gewonnen', occult_win: 'okkultes Wesen besiegt',
  parry: 'Schlag pariert', vision: 'Geistsicht (pro Sekunde)', dialogue: 'neues Gespräch geführt',
  trade: 'gehandelt', brew: 'Trank gebraut', use_item: 'Heilmittel benutzt', lock: 'Verschlossenes geöffnet',
  loot: 'Belohnung eingestrichen',
};
const MULT_KEYS = new Set(['vision_cost', 'composure_regen', 'heal_bonus', 'price', 'sell', 'honor_loss', 'occult_mult',
  'money_bonus', 'skill_composure', 'calm_decay', 'dodge_window']);

export const pathwayMethods = {
  resetPathway() {
    this.money = this.content.market?.start_money ?? 0;
    this.pathway = null; // { id, seq, digestion }
    this.unruhe = 0;
    this.seenNodes = new Set();
    this.visionDigest = { map: null, total: 0 };
  },

  // --- Nachschlagen -----------------------------------------------------------
  pathwayDef(id = this.pathway?.id) {
    return id ? this.content.pathways?.[id] : null;
  },

  seqDef(id = this.pathway?.id, seq = this.pathway?.seq) {
    return this.pathwayDef(id)?.seqs[seq] ?? null;
  },

  isBeyonder() {
    return !!this.pathway;
  },

  /** Alle erreichten Sequenzen des eigenen Pfades, von 9 abwärts: [{seq, ...def}] */
  reachedSeqs() {
    if (!this.pathway) return [];
    const out = [];
    for (let s = SEQ_START; s >= this.pathway.seq; s--) out.push({ seq: s, ...this.seqDef(this.pathway.id, s) });
    return out;
  },

  /** Wert einer passiven Fähigkeit (Multiplikatoren multiplizieren sich, sonst wird addiert). */
  passive(key) {
    const mult = MULT_KEYS.has(key);
    let v = mult ? 1 : 0;
    for (const s of this.reachedSeqs()) {
      for (const p of s.passives ?? []) {
        if (p.key !== key) continue;
        if (typeof p.value === 'boolean') v = v || p.value;
        else v = mult ? v * p.value : v + p.value;
      }
    }
    return v;
  },

  /** Kampffertigkeiten des eigenen Pfades: { id: skill } */
  pathwaySkills() {
    const out = {};
    for (const s of this.reachedSeqs()) if (s.skill) out[s.skill.id] = { ...s.skill, pathway: this.pathway.id };
    return out;
  },

  // --- Schilling ------------------------------------------------------------------
  /** Fügt Schilling hinzu. loot = Belohnung/Beute (zählt für Verdauung und Boni). */
  addMoney(n, { loot = false, reason = '' } = {}) {
    if (!n) return 0;
    let amount = n;
    if (loot && n > 0) amount = Math.round(n * this.passive('money_bonus'));
    const before = this.money;
    this.money = Math.max(0, this.money + amount);
    const delta = this.money - before;
    if (delta) this.emit('money', { delta, reason, value: this.money });
    if (loot && delta > 0) this.act('loot');
    return delta;
  },

  spendMoney(n) {
    if (this.money < n) return false;
    this.addMoney(-n);
    return true;
  },

  // --- Verdauung -------------------------------------------------------------------
  /**
   * Meldet eine Handlung. Passt sie zum Grundsatz des eigenen Pfades, wird der Trank verdaut.
   * Gibt die gewonnenen Verdauungspunkte zurück.
   */
  act(kind, amount = 1) {
    const p = this.pathway;
    if (!p) return 0;
    const table = this.pathwayDef().digest ?? {};
    if (!table[kind]) return 0;
    let pts = table[kind] * amount * (DIGEST_RATE[p.seq] ?? 0.5);
    if (kind === 'vision') {
      if (this.visionDigest.map !== this.map) this.visionDigest = { map: this.map, total: 0 };
      pts = Math.min(pts, Math.max(0, VISION_DIGEST_CAP - this.visionDigest.total));
      this.visionDigest.total += pts;
    }
    if (pts <= 0) return 0;
    // Wer nach seinem Grundsatz handelt, kommt zur Ruhe
    this.setUnruhe(this.unruhe - pts * 0.5);
    if (p.digestion >= 100) return 0;
    const before = p.digestion;
    p.digestion = Math.min(100, p.digestion + pts);
    this.emit('digest', { value: p.digestion, delta: p.digestion - before, kind });
    if (before < 100 && p.digestion >= 100) {
      this.emit('notice', `Der Trank des ${this.seqDef().name} ist vollständig verdaut.`);
      this.emit('digested', p);
    }
    return p.digestion - before;
  },

  /** Was den eigenen Pfad wie stark verdaut, auf der aktuellen Sequenz: [{kind, label, points}] */
  digestTable() {
    if (!this.pathway) return [];
    const rate = DIGEST_RATE[this.pathway.seq] ?? 0.5;
    return Object.entries(this.pathwayDef().digest ?? {})
      .map(([kind, v]) => ({ kind, label: DIGEST_LABELS[kind] ?? kind, points: Math.round(v * rate * 10) / 10 }))
      .sort((a, b) => b.points - a.points);
  },

  // --- Unruhe ------------------------------------------------------------------------
  setUnruhe(v) {
    const before = this.unruhe;
    this.unruhe = Math.max(0, Math.min(UNRUHE_MAX, v));
    if (Math.round(this.unruhe) !== Math.round(before)) this.emit('unruhe', this.unruhe);
    if (this.unruhe >= UNRUHE_MAX && before < UNRUHE_MAX) this.loseControl('Die Stimmen werden zu laut.');
  },

  /** Kontrollverlust: Ohnmacht, Verlust von Leben, Schilling und Verdauung. Nie Game Over. */
  loseControl(cause) {
    const lostMoney = Math.floor(this.money * 0.2);
    this.money -= lostMoney;
    this.hp = Math.max(1, Math.round(this.maxHp * 0.4));
    this.composure = 30;
    if (this.pathway) this.pathway.digestion = Math.max(0, this.pathway.digestion - 20);
    this.unruhe = 40;
    this.spiritVision = false;
    const text = `${cause}\n\nDie Welt kippt zur Seite. Du siehst Dinge, die nicht da sind, und hörst deinen Namen in fremden Stimmen. Als du wieder zu dir kommst, liegst du auf kaltem Pflaster, die Hände zerkratzt.\n\nDu hast ${lostMoney} Schilling verloren${this.pathway ? ' und ein Stück deines Fortschritts beim Verdauen' : ''}.`;
    this.emit('vision', false);
    this.emit('hp', { value: this.hp, delta: 0 });
    this.emit('composure', this.composure);
    this.emit('unruhe', this.unruhe);
    this.emit('money', { delta: -lostMoney, value: this.money, reason: 'Kontrollverlust' });
    this.emit('lostcontrol', { text });
    this.emit('changed');
    return text;
  },

  /** Wird von tick() aufgerufen. */
  tickPathway(dt) {
    if (!this.pathway && this.unruhe <= 0) return;
    let u = this.unruhe;
    if (this.spiritVision && this.pathway) {
      u += UNRUHE_VISION_PER_SEC * dt;
      this.act('vision', dt);
    } else {
      u -= UNRUHE_DECAY_PER_SEC * this.passive('calm_decay') * dt;
    }
    this.setUnruhe(u);
  },

  // --- Trinken -------------------------------------------------------------------------
  /** Wie riskant wäre dieser Trank gerade? { ok, risk (0–1), reason? } */
  drinkCheck(itemId) {
    const it = this.item(itemId);
    if (!it || it.kind !== 'potion') return { ok: false, reason: 'Das ist kein Trank.' };
    const p = this.pathway;
    if (!p) {
      if (it.seq !== SEQ_START) return { ok: false, reason: 'Ohne die erste Stufe würde dich dieser Trank zerreißen. Beginne mit Sequenz 9.' };
      return { ok: true, risk: Math.min(0.9, this.unruhe / 200) };
    }
    if (it.pathway !== p.id) return { ok: false, reason: 'Ein zweiter Pfad in deinem Blut? Sabeth hat dich gewarnt. Lieber nicht.' };
    if (it.seq >= p.seq) return { ok: false, reason: 'Diese Stufe hast du längst erreicht.' };
    if (it.seq !== p.seq - 1) return { ok: false, reason: 'Du kannst keine Stufe überspringen.' };
    const missing = (100 - p.digestion) / 100;
    const risk = Math.min(0.95, 0.03 + missing * 0.85 + this.unruhe / 250);
    return { ok: true, risk };
  },

  /**
   * Trinkt einen Trank. rng: Zufallsquelle (Tests übergeben eine feste).
   * Ergebnis: { ok, text, lost? }
   */
  drink(itemId, rng = this.rng ?? Math.random) {
    const check = this.drinkCheck(itemId);
    if (!check.ok) return { ok: false, text: check.reason };
    const it = this.item(itemId);
    const sd = this.seqDef(it.pathway, it.seq);
    const premature = this.pathway ? (100 - this.pathway.digestion) : 0;
    this.removeItem(itemId);
    const roll = rng();
    if (roll < check.risk) {
      const text = this.loseControl(`Der Trank des ${sd.name} brennt sich durch deine Adern, aber dein Körper wehrt sich.`);
      return { ok: false, lost: true, text };
    }
    const first = !this.pathway;
    this.pathway = { id: it.pathway, seq: it.seq, digestion: 0 };
    this.unruhe = Math.min(UNRUHE_MAX - 1, this.unruhe + 20 + premature * 0.4);
    this.updateMaxHp();
    const pd = this.pathwayDef();
    const text = first
      ? `Du trinkst. Es schmeckt nach Nebel und Kupfer. Dann wird die Welt für einen Herzschlag zu laut, zu hell, zu nah.\n\nDu bist jetzt Sequenz 9 des ${pd.name.replace('Pfad', 'Pfads')}: ${sd.name}.\n\n${sd.desc}\n\nGrundsatz: „${pd.principle}“ Handle danach, um den Trank zu verdauen.`
      : `Der Trank schlägt ein wie ein Blitz. Als er abklingt, bist du jemand anderes. Ein bisschen.\n\nDu bist jetzt Sequenz ${sd ? it.seq : ''}: ${sd.name}.\n\n${sd.desc}`;
    this.emit('unruhe', this.unruhe);
    this.emit('ascend', { pathway: it.pathway, seq: it.seq });
    this.emit('changed');
    return { ok: true, text };
  },

  updateMaxHp() {
    const base = this.content.start.hp ?? 40;
    const before = this.maxHp;
    this.maxHp = base + this.passive('max_hp');
    if (this.maxHp > before) this.hp += this.maxHp - before;
    this.hp = Math.min(this.hp, this.maxHp);
    this.emit('hp', { value: this.hp, delta: 0 });
  },

  // --- Brauen ---------------------------------------------------------------------------
  /** Rezepte aller Formeln im Inventar: [{ formula, potion, ingredients: [{id, need, have}], ready }] */
  recipes() {
    return Object.keys(this.inventory).filter((id) => this.item(id)?.kind === 'formula').map((fid) => {
      const f = this.item(fid);
      const ingredients = Object.entries(f.ingredients).map(([id, need]) => ({ id, need, have: this.itemCount(id), name: this.item(id).name }));
      return { formula: fid, potion: f.potion, name: this.item(f.potion).name, seq: f.seq, pathway: f.pathway, ingredients, ready: ingredients.every((i) => i.have >= i.need) };
    }).sort((a, b) => b.seq - a.seq);
  },

  brew(formulaId) {
    const r = this.recipes().find((x) => x.formula === formulaId);
    if (!r) return { ok: false, text: 'Dafür fehlt dir die Formel.' };
    if (!r.ready) return { ok: false, text: `Es fehlt: ${r.ingredients.filter((i) => i.have < i.need).map((i) => i.name).join(', ')}.` };
    for (const i of r.ingredients) this.removeItem(i.id, i.need);
    this.addItem(r.potion);
    this.act('brew');
    this.emit('changed');
    return { ok: true, text: `Der Kessel zischt und spuckt bunten Dampf. Du füllst ${r.name} in eine Phiole.` };
  },

  // --- Händler ---------------------------------------------------------------------------
  merchant(id) {
    return this.content.market?.merchants[id];
  },

  /** Angebot eines Händlers mit Preisen und Sperren: [{item, name, price, locked?, owned?}] */
  shopStock(merchantId) {
    const m = this.merchant(merchantId);
    // Höhere Formeln anderer Pfade bleiben unsichtbar, sonst wird die Liste endlos
    const visible = m.stock.filter((e) => !e.requires_pathway || this.pathway?.id === e.requires_pathway[0]);
    return visible.map((e) => {
      const it = this.item(e.item);
      const price = Math.max(1, Math.round(e.price * this.passive('price')));
      let locked = null;
      if (e.requires_pathway) {
        const [pid, seq] = e.requires_pathway;
        if (!this.pathway || this.pathway.id !== pid || this.pathway.seq > seq) locked = e.locked_text ?? 'Gesperrt';
      }
      if (!locked && e.requires_honor !== undefined && this.honor < e.requires_honor) locked = `Rang ${this.rank(e.requires_honor).name} (Ansehen ${e.requires_honor}) nötig`;
      const owned = e.once && this.itemCount(e.item) > 0;
      return { ...e, name: it.name, desc: it.desc, kind: it.kind, price, locked, owned };
    });
  },

  buy(merchantId, itemId) {
    const e = this.shopStock(merchantId).find((x) => x.item === itemId);
    if (!e) return { ok: false, text: 'Das führt dieser Händler nicht.' };
    if (e.locked) return { ok: false, text: e.locked };
    if (e.owned) return { ok: false, text: 'Diese Formel besitzt du schon.' };
    if (!this.spendMoney(e.price)) return { ok: false, text: 'Dafür reichen deine Schilling nicht.' };
    this.addItem(itemId);
    this.act('trade');
    this.emit('changed');
    return { ok: true, text: `Gekauft: ${e.name} für ${e.price} Schilling.` };
  },

  /** Verkaufspreis eines Gegenstands (null = unverkäuflich). */
  sellPrice(itemId) {
    const it = this.item(itemId);
    if (!it || it.kind === 'key' || it.kind === 'formula') return null;
    const base = this.content.market?.sell_prices?.[itemId] ?? it.price;
    if (!base) return null;
    return Math.max(1, Math.round(base * 0.5 * this.passive('sell')));
  },

  sell(itemId) {
    const price = this.sellPrice(itemId);
    if (price === null || !this.itemCount(itemId)) return { ok: false, text: 'Das will Gorse nicht.' };
    if (this.weapon === itemId && this.itemCount(itemId) === 1) return { ok: false, text: 'Deine ausgerüstete Waffe behältst du lieber.' };
    this.removeItem(itemId);
    this.addMoney(price, { reason: 'Verkauf' });
    this.act('trade', 0.5);
    this.emit('changed');
    return { ok: true, text: `Verkauft: ${this.item(itemId).name} für ${price} Schilling.` };
  },

  /** Schlösser (Aktenschränke, Türen): Schlossflüsterer kommen mit weniger Ansehen hinein. */
  meetsLock(lock) {
    if (!lock) return true;
    if (this.meets(lock)) return true;
    const bonus = this.passive('lock_bonus');
    if (!bonus || lock.requires_honor === undefined) return false;
    return this.meets({ ...lock, requires_honor: lock.requires_honor - bonus });
  },

  // --- Dialoge ----------------------------------------------------------------------------
  /** Merkt besuchte Gesprächsknoten (für den Pfad der Maske). */
  visitNode(dialogueId, nodeId) {
    const key = `${dialogueId}.${nodeId}`;
    if (this.seenNodes.has(key)) return false;
    this.seenNodes.add(key);
    this.act('dialogue');
    return true;
  },

  /** Text für Sabeths Einschätzung und das Notizbuch. */
  pathwayReport() {
    if (!this.pathway) return 'Du hast noch keinen Trank getrunken.';
    const pd = this.pathwayDef();
    const sd = this.seqDef();
    const d = Math.floor(this.pathway.digestion);
    let t = `${pd.name}, Sequenz ${this.pathway.seq}: ${sd.name}. Verdaut: ${d} %.`;
    if (d >= 100) t += this.pathway.seq > SEQ_MAX ? '\n\n„Der Trank ist ganz in dir aufgegangen. Du bist bereit für die nächste Stufe.“' : '\n\n„Weiter kommst du hier unten nicht. Noch nicht.“';
    else t += `\n\n„Denk an deinen Grundsatz: ${pd.principle} ${pd.digest_hint}“`;
    if (this.unruhe >= 60) t += '\n\n„Und trink einen Ruhetee. Du flackerst wie eine Gaslampe im Wind.“';
    return t;
  },

  serializePathway() {
    return { money: this.money, pathway: this.pathway, unruhe: Math.round(this.unruhe), seenNodes: [...this.seenNodes] };
  },

  loadPathway(data) {
    this.money = data.money ?? this.money;
    const p = data.pathway;
    this.pathway = p && this.seqDef(p.id, p.seq) ? { id: p.id, seq: p.seq, digestion: p.digestion ?? 0 } : null;
    this.unruhe = Math.max(0, Math.min(UNRUHE_MAX - 1, data.unruhe ?? 0));
    this.seenNodes = new Set(data.seenNodes ?? []);
    this.maxHp = (this.content.start.hp ?? 40) + this.passive('max_hp');
    this.hp = Math.max(1, Math.min(this.maxHp, data.hp ?? this.maxHp));
  },
};
