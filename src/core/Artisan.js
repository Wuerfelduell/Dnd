// Die Fasserin auf geheimen Treffen (Daten: treffen.json → artisan).
// Mit `chance` (30 %) sitzt sie bei einem Treffen mit am Tisch, pro Runde und Zirkel fest gewürfelt,
// damit die Einladung sie vorher ankündigen kann und Neuladen nichts ändert. Sie fasst ungewöhnliche,
// seltene und okkulte Beutestücke zu Artefakten: Jedes Rezept verbraucht die Beute (`needs`) und
// kostet Fasserlohn (`fee`). Pro Treffen bietet sie `offers` Rezepte aus dem Pool an.
// Die Rezepte sind in der laufenden Runde (core/Auction.js) erreichbar, nachdem alle Mitglieder dran waren.

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

  /** Was zu einem Rezept fehlt: { ok, artifact, needs: [{item, n, have}], fee, missing, poor } */
  recipeCheck(recipe) {
    const r = typeof recipe === 'string' ? this.recipeDef(recipe) : recipe;
    if (!r) return { ok: false, needs: [], missing: [], fee: 0, poor: false };
    const needs = Object.entries(r.needs ?? {}).map(([item, n]) => ({ item, n, have: this.itemCount(item) }));
    const missing = needs.filter((x) => x.have < x.n);
    const poor = this.money < (r.fee ?? 0);
    return { ok: !missing.length && !poor, artifact: r.artifact ?? r.id, needs, missing, fee: r.fee ?? 0, poor };
  },

  /** In der Runde: zur Fasserin gehen (nur wenn sie da ist, nach den Losen). */
  openArtisan() {
    const a = this.auction;
    if (!a || a.phase !== 'own' || !a.artisan) return { ok: false, text: 'Die Fasserin ist heute nicht da.' };
    a.phase = 'artisan';
    this.say(`${this.artisanName()} schiebt ihre Zangen zurecht. „Zeigen Sie, was Sie haben.“`);
    return { ok: true };
  },

  leaveArtisan() {
    const a = this.auction;
    if (!a || a.phase !== 'artisan') return { ok: false };
    a.phase = 'own';
    return { ok: true };
  },

  /** Beute fassen lassen: verbraucht die Beutestücke und den Lohn, gibt das Artefakt. */
  craftArtifact(recipeId) {
    const a = this.auction;
    if (!a || a.phase !== 'artisan') return { ok: false, text: 'Die Fasserin arbeitet nur am Tisch der Runde.' };
    const r = this.artisanRecipes(a.circle, a.cycle).find((x) => x.id === recipeId);
    if (!r) return { ok: false, text: 'Das fasst sie heute nicht.' };
    const c = this.recipeCheck(r);
    if (c.missing.length) return { ok: false, text: `Es fehlt: ${c.missing.map((x) => `${this.item(x.item)?.name ?? x.item} (${x.have}/${x.n})`).join(', ')}.` };
    if (c.poor) return { ok: false, text: `Der Fasserlohn sind ${c.fee} Schilling. So viel hast du nicht.` };
    for (const x of c.needs) this.removeItem(x.item, x.n);
    if (c.fee) this.spendMoney(c.fee);
    this.addItem(c.artifact);
    this.act?.('trade');
    a.crafted.push({ item: c.artifact, price: c.fee });
    this.say(`${this.artisanName()} fasst ${this.item(c.artifact).name}. ${r.line ?? ''}`.trim());
    this.emit('changed');
    return { ok: true, artifact: c.artifact };
  },
};
