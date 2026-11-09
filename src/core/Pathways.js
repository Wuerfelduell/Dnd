// Aufstieg über Tränke: Pfade, Sequenzen, Verdauung, Unruhe und Schilling.
//
// Begriffe:
// - Pfad (pathway): eine von sieben Linien (Laterne, Faden, Maske, Echo, Kessel, Eisen, Schlüssel).
// - Sequenz: Stufe auf dem Pfad. Man beginnt mit 9 und steigt bis 5 auf (kleiner = stärker).
//   Jede erreichte Sequenz bringt mehr Leben und Nerven (growth im Pfad).
// - Verdauung (digestion, 0–100): wächst, wenn man nach dem Grundsatz des Pfades handelt
//   (state.act). Erst bei 100 verträgt man den nächsten Trank gefahrlos.
// - Unruhe (0–100): kommt mit jedem Trank, mit Geistsicht und zerrütteten Nerven. Klingt mit der
//   Zeit und durch passendes Handeln ab. Bei 100 droht der Kontrollverlust (Ohnmacht, nie Game Over).
// - Schilling: Währung für die Händler auf dem Nachtmarkt.
//
// Die Methoden werden in GameState eingehängt (siehe unten in GameState.js).

export const SEQ_START = 9;
export const SEQ_MAX = 5; // höchste erreichbare Stufe in dieser Version
export const DIGEST_RATE = { 9: 1, 8: 0.7, 7: 0.5, 6: 0.35, 5: 0.25 };
export const COMPOSURE_BASE = 100;
export const DEFAULT_GROWTH = { hp: 5, nerves: 5 };
// Durchbrüche: Sequenz 7 und 6 zählen beim Wachstum doppelt (große Sprünge an Leben und Nerven).
export const SEQ_GROWTH_STEPS = { 7: 2, 6: 2 };
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
/** Handlungen, die nur den Pfad dessen verdauen, der sie selbst tut. Alles andere verdaut beide Spieler. */
export const PERSONAL_DIGEST = new Set(['parry', 'vision', 'use_item', 'brew']);
const MULT_KEYS = new Set(['vision_cost', 'composure_regen', 'heal_bonus', 'price', 'sell', 'honor_loss', 'occult_mult',
  'money_bonus', 'skill_composure', 'calm_decay', 'dodge_window', 'damage_taken', 'digest_mult', 'dmg_mult']);

export const pathwayMethods = {
  resetPathway() {
    this.money = this.content.market?.start_money ?? 0;
    this.pathway = null; // { id, seq, digestion }
    this.unruhe = 0;
    this.seenNodes = new Set();
    this.visionDigest = { map: null, total: 0 };
    this.wins = 0; // gewonnene Kämpfe (für Rituale)
    this.resetArtifacts();
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

  /**
   * Wert einer passiven Fähigkeit (Multiplikatoren multiplizieren sich, sonst wird addiert).
   * Zählt die Passiven aller erreichten Sequenzen, die Vor- und Nachteile mitgeführter Artefakte und angelegte Kleidung.
   */
  passive(key) {
    const mult = MULT_KEYS.has(key);
    let v = mult ? 1 : 0;
    const lists = [...this.reachedSeqs().map((s) => s.passives ?? []), ...this.artifactEffects(), ...this.gearEffects()];
    for (const list of lists) {
      for (const p of list) {
        if (p.key !== key) continue;
        if (typeof p.value === 'boolean') v = v || p.value;
        else v = mult ? v * p.value : v + p.value;
      }
    }
    return v;
  },

  /** Wie viele Sequenzen schon erreicht sind (9 = 1, 5 = 5). */
  seqSteps() {
    return this.pathway ? SEQ_START + 1 - this.pathway.seq : 0;
  },

  /** Wachstumsstufen: jede erreichte Sequenz eine, die Durchbrüche (7 und 6) zwei. */
  growthSteps() {
    if (!this.pathway) return 0;
    let n = 0;
    for (let s = SEQ_START; s >= this.pathway.seq; s--) n += SEQ_GROWTH_STEPS[s] ?? 1;
    return n;
  },

  /** Zuwachs an Leben und Nerven pro erreichter Sequenz. */
  growth() {
    return { ...DEFAULT_GROWTH, ...(this.pathwayDef()?.growth ?? {}) };
  },

  /** Höchstwert der Nerven: Grundwert, Sequenzen, Passive und Artefakte. */
  maxComposure() {
    return Math.max(20, COMPOSURE_BASE + this.growth().nerves * this.growthSteps() + this.passive('max_nerves'));
  },

  /** Höchstwert des Lebens (ohne zu heilen oder zu verletzen). */
  calcMaxHp() {
    const base = this.content.start.hp ?? 40;
    return Math.max(10, base + this.growth().hp * this.growthSteps() + this.passive('max_hp'));
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
    if (kind === 'combat_win') this.wins = (this.wins ?? 0) + 1;
    const gained = this.digestOwn(kind, amount);
    // Zu zweit: was beide gemeinsam erleben, verdaut auch den Trank des anderen Spielers
    if (this.hasP2?.() && !PERSONAL_DIGEST.has(kind)) this.withPartner(() => this.digestOwn(kind, amount));
    return gained;
  },

  /** Verdauung nur für den Spieler, dessen Werte gerade gelten. */
  digestOwn(kind, amount = 1) {
    const p = this.pathway;
    if (!p) return 0;
    const table = this.pathwayDef().digest ?? {};
    if (!table[kind]) return 0;
    let pts = table[kind] * amount * (DIGEST_RATE[p.seq] ?? 0.25) * this.passive('digest_mult');
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
    const player = this.acting ?? 1;
    this.emit('digest', { value: p.digestion, delta: p.digestion - before, kind, player });
    if (before < 100 && p.digestion >= 100) {
      this.emit('notice', `${player === 2 ? 'Spieler 2: ' : ''}Der Trank des ${this.seqDef().name} ist vollständig verdaut.`);
      this.emit('digested', { ...p, player });
    }
    return p.digestion - before;
  },

  /** Was den eigenen Pfad wie stark verdaut, auf der aktuellen Sequenz: [{kind, label, points}] */
  digestTable() {
    if (!this.pathway) return [];
    const rate = (DIGEST_RATE[this.pathway.seq] ?? 0.25) * this.passive('digest_mult');
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
    const shame = this.artifactShame();
    const text = `${cause}\n\nDie Welt kippt zur Seite. Du siehst Dinge, die nicht da sind, und hörst deinen Namen in fremden Stimmen. Als du wieder zu dir kommst, liegst du auf kaltem Pflaster, die Hände zerkratzt.\n\nDu hast ${lostMoney} Schilling verloren${this.pathway ? ' und ein Stück deines Fortschritts beim Verdauen' : ''}.${shame}`;
    this.emit('vision', false);
    this.emit('hp', { value: this.hp, delta: 0 });
    this.emit('composure', this.composure);
    this.emit('unruhe', this.unruhe);
    this.emit('money', { delta: -lostMoney, value: this.money, reason: 'Kontrollverlust' });
    this.emit('lostcontrol', { text, player: this.acting ?? 1 });
    this.emit('changed');
    return text;
  },

  /** Wird von tick() aufgerufen. */
  tickPathway(dt) {
    const pull = this.artifactUnruhe();
    if (!this.pathway && this.unruhe <= 0 && !pull) return;
    let u = this.unruhe + pull * dt;
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
    const rit = this.ritualDef(p.id, it.seq);
    if (rit && !this.ritualDone(p.id, it.seq)) return { ok: false, reason: `Ohne Ritual zerreißt dich dieser Trank. Vollziehe zuerst „${rit.name}“ (siehe Pfad).`, ritual: true };
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
    this.emit('ascend', { pathway: it.pathway, seq: it.seq, player: this.acting ?? 1 });
    this.emit('changed');
    return { ok: true, text };
  },

  /** Rechnet Leben und Nerven neu (nach Aufstieg oder Artefaktwechsel). Mehr Höchstwert heilt um die Differenz. */
  updateMaxHp() {
    const before = this.maxHp;
    this.maxHp = this.calcMaxHp();
    if (this.maxHp > before) this.hp += this.maxHp - before;
    this.hp = Math.max(1, Math.min(this.hp, this.maxHp));
    this.emit('hp', { value: this.hp, delta: 0 });
    const maxC = this.maxComposure();
    if (this.composure > maxC) this.composure = maxC;
    this.emit('composure', this.composure);
  },

  // --- Rituale ---------------------------------------------------------------------------
  // Ab Sequenz 6 verlangt jeder Trank ein Ritual: an einem bestimmten Ort, mit Zutaten, die dabei
  // verbraucht werden, und einer Bedingung (Geistsicht, Nerven, Wunden, Schlussfolgerungen, Siege, Tribut).
  // Danach darf genau dieser Trank getrunken werden (Flag ritual_<pfad>_<seq>).

  ritualDef(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    return this.seqDef(pid, seq)?.ritual ?? null;
  },

  /** Merker für ein vollzogenes Ritual. Spieler 2 hat eigene (er kann denselben Pfad gehen). */
  ritualFlag(pid, seq) {
    return `${this.acting === 2 ? 'p2_' : ''}ritual_${pid}_${seq}`;
  },

  ritualDone(pid, seq) {
    return this.flags.has(this.ritualFlag(pid, seq));
  },

  /** Schritte des nächsten Rituals mit Status: [{text, done}] (oder null, wenn keines nötig ist). */
  ritualSteps(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    const r = this.ritualDef(pid, seq);
    if (!r) return null;
    const steps = [];
    const mapName = this.content.maps[r.map]?.name ?? r.map;
    steps.push({ text: `Ort: ${mapName}${r.also_maps?.length ? ' (auch drinnen)' : ''}`, done: this.map === r.map || (r.also_maps ?? []).includes(this.map) });
    for (const [id, n] of Object.entries(r.consumes ?? {})) steps.push({ text: `${this.item(id).name} ×${n} (wird verbraucht)`, done: this.itemCount(id) >= n });
    if (r.vision) steps.push({ text: 'Geistsicht ist aktiv', done: !!this.spiritVision });
    if (r.min_nerves) steps.push({ text: `Mindestens ${r.min_nerves} Nerven`, done: this.composure >= r.min_nerves });
    if (r.max_hp_pct) steps.push({ text: `Verwundet: höchstens ${Math.round(r.max_hp_pct * 100)} % Leben`, done: this.hp <= this.maxHp * r.max_hp_pct });
    if (r.min_conclusions) steps.push({ text: `${r.min_conclusions} Schlussfolgerungen gezogen (${this.conclusions.length})`, done: this.conclusions.length >= r.min_conclusions });
    if (r.requires?.min_wins) steps.push({ text: `${r.requires.min_wins} Kämpfe gewonnen (${this.wins ?? 0})`, done: (this.wins ?? 0) >= r.requires.min_wins });
    if (r.requires?.requires_flags) {
      for (const f of r.requires.requires_flags) {
        const enc = this.content.encounters[f.replace(/^won_/, '')];
        steps.push({ text: enc ? `${enc.name} besiegt` : f, done: this.flags.has(f) });
      }
    }
    if (r.tribute) steps.push({ text: `${r.tribute} Schilling als Tribut`, done: this.money >= r.tribute });
    if (!this.itemCount(`trank_${pid}_${seq}`)) steps.push({ text: `Trank der Sequenz ${seq} dabei`, done: false });
    return steps;
  },

  /** Vollzieht das Ritual für den nächsten Trank. Ergebnis: { ok, text } */
  performRitual() {
    const p = this.pathway;
    const seq = (p?.seq ?? 0) - 1;
    const r = p && this.ritualDef(p.id, seq);
    if (!r) return { ok: false, text: 'Für deinen nächsten Trank brauchst du kein Ritual.' };
    if (this.ritualDone(p.id, seq)) return { ok: false, text: 'Das Ritual ist schon vollzogen. Trink den Trank.' };
    const open = this.ritualSteps(p.id, seq).filter((x) => !x.done);
    if (open.length) return { ok: false, text: `Es fehlt noch: ${open.map((x) => x.text).join(', ')}.` };
    for (const [id, n] of Object.entries(r.consumes ?? {})) this.removeItem(id, n);
    if (r.tribute) this.addMoney(-r.tribute, { reason: 'Tribut' });
    const rules = this.content.ritualRules ?? { unruhe: 20, nerves: 20 };
    this.flags.add(this.ritualFlag(p.id, seq));
    this.setComposure(this.composure - (rules.nerves ?? 20));
    this.setUnruhe(this.unruhe + (rules.unruhe ?? 20));
    this.emit('ritual', { pathway: p.id, seq, player: this.acting ?? 1 });
    this.emit('changed');
    return { ok: true, text: `${r.name}\n\n${r.desc}\n\nDas Ritual ist vollzogen. Die Luft um dich summt. Jetzt kannst du den Trank der Sequenz ${seq} trinken.` };
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
    const visible = this.merchantStock(merchantId).filter((e) => !e.requires_pathway || this.pathway?.id === e.requires_pathway[0]);
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
      return this.gatheringEntry(merchantId, { ...e, name: it.name, desc: it.desc, kind: it.kind, price, locked, owned });
    });
  },

  buy(merchantId, itemId) {
    const e = this.shopStock(merchantId).find((x) => x.item === itemId);
    if (!e) return { ok: false, text: 'Das führt dieser Händler nicht.' };
    if (e.locked) return { ok: false, text: e.locked };
    if (e.soldOut) return { ok: false, text: 'Davon ist auf diesem Treffen nichts mehr übrig.' };
    if (e.owned) return { ok: false, text: 'Diese Formel besitzt du schon.' };
    if (!this.spendMoney(e.price)) return { ok: false, text: 'Dafür reichen deine Schilling nicht.' };
    this.addItem(itemId);
    this.noteGatheringBuy(merchantId, itemId);
    this.act('trade');
    this.emit('changed');
    return { ok: true, text: `Gekauft: ${e.name} für ${e.price} Schilling.` };
  },

  /** Verkaufspreis eines Gegenstands (null = unverkäuflich). */
  sellPrice(itemId) {
    const it = this.item(itemId);
    if (!it || it.kind === 'key' || it.kind === 'formula') return null;
    if (this.borrowed?.includes(itemId)) return null; // Revier-Eigentum
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
    return { money: this.money, pathway: this.pathway, unruhe: Math.round(this.unruhe), seenNodes: [...this.seenNodes], wins: this.wins, ...this.serializeArtifacts() };
  },

  loadPathway(data) {
    this.money = data.money ?? this.money;
    const p = data.pathway;
    this.pathway = p && this.seqDef(p.id, p.seq) ? { id: p.id, seq: p.seq, digestion: p.digestion ?? 0 } : null;
    this.unruhe = Math.max(0, Math.min(UNRUHE_MAX - 1, data.unruhe ?? 0));
    this.seenNodes = new Set(data.seenNodes ?? []);
    this.wins = data.wins ?? 0;
    this.loadArtifacts(data);
    this.maxHp = this.calcMaxHp();
    this.hp = Math.max(1, Math.min(this.maxHp, data.hp ?? this.maxHp));
    this.composure = Math.min(this.composure, this.maxComposure());
  },
};
