// Die Fasserin auf geheimen Treffen (Daten: treffen.json → artisan).
// Mit `chance` (30 %) sitzt sie bei einem Treffen mit am Tisch, pro Runde und Zirkel fest gewürfelt,
// damit die Einladung sie vorher ankündigen kann und Neuladen nichts ändert. Sie nimmt ein einzelnes
// starkes Beutestück (`needs`, genau ein Stück, z. B. die Rattenkönig-Krone) und den Fasserlohn (`fee`)
// in Auftrag. Das Artefakt ist nicht sofort fertig: Es liegt erst beim nächsten Treffen desselben
// Zirkels bereit (`artisanOrders`, gespeichert), der Gastgeber übergibt es auch ohne sie. Ob die
// Fassung gelingt, ist ein fester Würfel je Auftrag (`erfolg`: 80 % beim schwächsten, 40 % beim
// stärksten Artefakt); misslingt sie, ist das Stück hin und ein Teil des Lohns kommt zurück.
// Pro Treffen bietet sie `offers` Rezepte aus dem Pool an; erreichbar in der laufenden Runde
// (core/Auction.js), nachdem alle Mitglieder dran waren.

export const artisanMethods = {
  artisanDef() {
    return this.content.gatherings?.artisan ?? null;
  },

  artisanId() {
    return this.artisanDef()?.npc ?? 'fasserin';
  },

  artisanName() {
    return this.content.npcs[this.artisanId()]?.name ?? 'Die Fasserin';
  },

  /** Sitzt die Fasserin bei diesem Treffen dabei? Pro Runde und Zirkel fest. */
  artisanPresent(circleId, cycle = this.marketCycle()) {
    const a = this.artisanDef();
    if (!a || !this.gatheringDef(circleId)) return false;
    return this.sessionRng(circleId, cycle, 'artisan')() < (a.chance ?? 0.3);
  },

  resetArtisan() {
    this.artisanOrders = []; // [{ circle, cycle, recipe, artifact, fee, chance }] – warten auf das nächste Treffen des Zirkels
  },

  serializeArtisan() {
    return { artisanOrders: this.artisanOrders ?? [] };
  },

  loadArtisan(data) {
    this.artisanOrders = Array.isArray(data.artisanOrders)
      ? data.artisanOrders.filter((o) => o && typeof o.circle === 'string' && typeof o.cycle === 'number' && typeof o.recipe === 'string')
        .map((o) => ({ circle: o.circle, cycle: o.cycle, recipe: o.recipe, artifact: o.artifact ?? o.recipe, fee: o.fee ?? 0, chance: o.chance ?? this.recipeChance(o.recipe) }))
      : [];
  },

  recipeDef(id) {
    return (this.artisanDef()?.recipes ?? []).find((r) => r.id === id) ?? null;
  },

  /** Welche Rezepte sie bei diesem Treffen anbietet (fest je Runde und Zirkel). */
  artisanRecipes(circleId, cycle = this.marketCycle()) {
    const a = this.artisanDef();
    if (!a || !this.artisanPresent(circleId, cycle)) return [];
    const rng = this.sessionRng(circleId, cycle, 'recipes');
    const pool = [...(a.recipes ?? [])];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, a.offers ?? 4);
  },

  /**
   * Erfolgschance einer Fassung (0–1): linear vom schwächsten (`erfolg.max`, Preis `price_min`) zum
   * stärksten Artefakt (`erfolg.min`, Preis `price_max`), auf 5 % gerundet. Stärkere Artefakte misslingen öfter.
   */
  recipeChance(recipe) {
    const r = typeof recipe === 'string' ? this.recipeDef(recipe) : recipe;
    const e = this.artisanDef()?.erfolg ?? {};
    const min = e.min ?? 0.4, max = e.max ?? 0.8, lo = e.price_min ?? 120, hi = e.price_max ?? 200;
    if (!r) return max;
    if (typeof r.chance === 'number') return r.chance;
    const price = this.content.artifacts?.list?.[r.artifact ?? r.id]?.price ?? this.item(r.artifact ?? r.id)?.price ?? lo;
    const t = hi > lo ? Math.min(1, Math.max(0, (price - lo) / (hi - lo))) : 0;
    return Math.round((max - t * (max - min)) * 20) / 20;
  },

  /** Was zu einem Rezept fehlt: { ok, artifact, needs: [{item, n, have}], fee, missing, poor, chance } */
  recipeCheck(recipe) {
    const r = typeof recipe === 'string' ? this.recipeDef(recipe) : recipe;
    if (!r) return { ok: false, needs: [], missing: [], fee: 0, poor: false, chance: 0 };
    const needs = Object.entries(r.needs ?? {}).map(([item, n]) => ({ item, n, have: this.itemCount(item) }));
    const missing = needs.filter((x) => x.have < x.n);
    const poor = this.money < (r.fee ?? 0);
    return { ok: !missing.length && !poor, artifact: r.artifact ?? r.id, needs, missing, fee: r.fee ?? 0, poor, chance: this.recipeChance(r) };
  },

  /** Offene Aufträge, wahlweise nur eines Zirkels. */
  pendingOrders(circleId) {
    return (this.artisanOrders ?? []).filter((o) => !circleId || o.circle === circleId);
  },

  /** Aufträge, die bei diesem Treffen (Zirkel + Runde) abgeholt werden: alles, was aus einer früheren Runde des Zirkels stammt. */
  readyOrders(circleId, cycle = this.marketCycle()) {
    return this.pendingOrders(circleId).filter((o) => o.cycle < cycle);
  },

  /** Gelingt die Fassung? Fester Würfel je Auftrag (Zirkel, Runde der Bestellung, Rezept, laufende Nummer). */
  orderSucceeds(order, index = 0) {
    return this.sessionRng(order.circle, order.cycle, `craft:${order.recipe}:${index}`)() < (order.chance ?? this.recipeChance(order.recipe));
  },

  /**
   * Beim Eröffnen einer Runde: Der Gastgeber übergibt, was die Fasserin seit dem letzten Treffen dieses
   * Zirkels fertig hat. Ergebnis [{ item, ok, refund, price }], steht auch in auction.collected.
   */
  collectOrders(circleId, cycle = this.marketCycle()) {
    const ready = this.readyOrders(circleId, cycle);
    if (!ready.length) return [];
    const e = this.artisanDef()?.erfolg ?? {};
    const out = [];
    ready.forEach((o, i) => {
      const ok = this.orderSucceeds(o, i);
      const refund = ok ? 0 : Math.floor((o.fee ?? 0) * (e.erstattung ?? 0.5));
      if (ok) this.addItem(o.artifact);
      else if (refund) this.addMoney(refund);
      out.push({ item: o.artifact, ok, refund, price: o.fee });
      const name = this.item(o.artifact)?.name ?? o.artifact;
      this.say?.(ok
        ? `Der Gastgeber schiebt dir ${name} zu. „${this.artisanLine('gelungen', 'Die Fasserin lässt grüßen. Es hat gehalten.')}“`
        : `Der Gastgeber legt ${refund} Schilling vor dich. „${this.artisanLine('missglueckt', `${name} ist ihr zersprungen. Den halben Lohn gibt sie zurück.`)}“`);
    });
    this.artisanOrders = this.pendingOrders().filter((o) => !ready.includes(o));
    this.emit('changed');
    return out;
  },

  /** In der Runde: zur Fasserin gehen (nur wenn sie da ist, nach den Losen). */
  openArtisan() {
    const a = this.auction;
    if (!a || a.phase !== 'own' || !a.artisan) return { ok: false, text: 'Die Fasserin ist heute nicht da.' };
    a.phase = 'artisan';
    this.say(`${this.artisanName()} schiebt ihre Zangen zurecht. „${this.artisanGreeting(a.circle, a.cycle)}“`);
    return { ok: true };
  },

  /** BO: Textvorrat der Fasserin (treffen.json → artisan.texte, Pack fasserin). */
  artisanTexts() {
    return this.artisanDef()?.texte ?? {};
  },

  /** Begrüßung je Zirkel (zwei Varianten, fest je Runde), sonst die allgemeine Werkstattstimme. */
  artisanGreeting(circleId, cycle = this.marketCycle()) {
    const t = this.artisanTexts();
    const lines = t.begruessung?.[circleId] ?? t.allgemein ?? ['Zeigen Sie, was Sie haben.'];
    return lines[(cycle ?? 0) % lines.length];
  },

  /** Eine Zeile aus einem Vorrat (`fehlende_beute`, `fehlendes_geld`, `abschied`), reihum. */
  artisanLine(kind, fallback) {
    const lines = this.artisanTexts()[kind];
    if (!lines?.length) return fallback;
    this.artisanLineCount = (this.artisanLineCount ?? 0) + 1;
    return lines[this.artisanLineCount % lines.length];
  },

  leaveArtisan() {
    const a = this.auction;
    if (!a || a.phase !== 'artisan') return { ok: false };
    a.phase = 'own';
    this.say(`${this.artisanName()}: „${this.artisanLine('abschied', 'Die Zange ist wieder sauber.')}“`);
    return { ok: true };
  },

  /**
   * Beute in Auftrag geben: verbraucht das Beutestück und den Lohn. Das Artefakt (oder die Nachricht,
   * dass es misslang) gibt es erst beim nächsten Treffen desselben Zirkels (collectOrders).
   */
  orderArtifact(recipeId) {
    const a = this.auction;
    if (!a || a.phase !== 'artisan') return { ok: false, text: 'Die Fasserin arbeitet nur am Tisch der Runde.' };
    const r = this.artisanRecipes(a.circle, a.cycle).find((x) => x.id === recipeId);
    if (!r) return { ok: false, text: 'Das fasst sie heute nicht.' };
    const c = this.recipeCheck(r);
    if (c.missing.length) return { ok: false, text: `„${this.artisanLine('fehlende_beute', 'Bringen Sie den Rest.')}“ Es fehlt: ${c.missing.map((x) => `${this.item(x.item)?.name ?? x.item} (${x.have}/${x.n})`).join(', ')}.` };
    if (c.poor) return { ok: false, text: `„${this.artisanLine('fehlendes_geld', 'Der Lohn steht fest.')}“ Der Fasserlohn sind ${c.fee} Schilling. So viel hast du nicht.` };
    for (const x of c.needs) this.removeItem(x.item, x.n);
    if (c.fee) this.spendMoney(c.fee);
    const order = { circle: a.circle, cycle: a.cycle, recipe: r.id, artifact: c.artifact, fee: c.fee, chance: c.chance };
    this.artisanOrders = [...(this.artisanOrders ?? []), order];
    this.act?.('trade');
    this.act?.('gathering');
    a.crafted.push({ item: c.artifact, price: c.fee, chance: c.chance });
    this.say(`${this.artisanName()} nimmt ${this.item(c.needs[0]?.item)?.name ?? 'das Stück'} an sich. ${r.line ?? ''} „${this.artisanLine('auftrag', 'Beim nächsten Treffen dieses Zirkels.')}“`.trim());
    this.emit('changed');
    return { ok: true, artifact: c.artifact, order };
  },

  /** Alter Name (Tests, Mods): heute gibt es nur den Auftrag. */
  craftArtifact(recipeId) {
    return this.orderArtifact(recipeId);
  },
};
