// Die Runde eines geheimen Treffens (Daten: treffen.json, circles.*.members).
// Ablauf: Reihum stellt jedes Mitglied ein Los vor und die anderen bieten mit (Auktion).
// Danach fragt es nach einer Zutat, die es sucht (Gesuch). Wer sie dabei hat, verkauft gut.
// Zum Schluss darf man selbst Artefakte oder Formeln versteigern. Sitzt die Fasserin dabei
// (core/Artisan.js, 30 %), kann man ihr dann Beutestücke zu Artefakten fassen lassen.
// Lose und Gesuche stehen pro Treffen fest (Startwert aus Runde und Zirkel), damit man sie
// vorher ankündigen kann und Neuladen nichts ändert.
import { seeded } from './Gatherings.js';

const FORMULA_VALUE = { 9: 25, 8: 60, 7: 140, 6: 260, 5: 420 };

export const auctionMethods = {
  auctionRules() {
    return this.gatheringRules()?.auction ?? {};
  },

  /** Ungefährer Wert eines Gegenstands in Schilling (für Startgebote, Gesuche und eigene Lose). */
  itemValue(id) {
    const it = this.item(id);
    if (!it) return 0;
    if (it.kind === 'formula') return FORMULA_VALUE[it.seq] ?? 50;
    if (it.kind === 'artifact') {
      // Auf den Treffen sind gute Artefakte ein paar hundert Schilling wert
      const lot = Math.max(0, ...Object.values(this.content.gatherings?.circles ?? {}).flatMap((c) => (c.members ?? []).flatMap((m) => m.offers.filter((e) => e.item === id).map((e) => e.price))));
      return lot || Math.round((this.artifactDef?.(id)?.price ?? it.price ?? 80) * 3.5);
    }
    let best = 0;
    for (const m of Object.values(this.content.market?.merchants ?? {})) {
      for (const e of m.stock ?? []) if (e.item === id) best = Math.max(best, e.price);
    }
    for (const c of Object.values(this.content.gatherings?.circles ?? {})) {
      for (const mem of c.members ?? []) for (const e of mem.offers) if (e.item === id) best = Math.max(best, e.price);
    }
    if (best) return best;
    const sell = this.content.market?.sell_prices?.[id] ?? it.price;
    return sell ? sell * 2 : 12;
  },

  /**
   * Was ein Angebot taugt, bevor man bietet oder abgibt: Segen und Flüche von Artefakten und
   * Kleidung, Pfad und Sequenz von Formeln, Angriff von Waffen. Damit ist kein Los ein blinder Kauf.
   * Ergebnis { kind, boons: [text], curses: [text], notes: [text] } oder null.
   */
  offerInfo(id) {
    const it = this.item(id);
    if (!it) return null;
    const info = { kind: it.kind, boons: (it.boons ?? []).map((b) => b.text), curses: (it.curses ?? []).map((c) => c.text), notes: [] };
    if (it.kind === 'formula') {
      // Pfad und Sequenz stehen schon in der Beschreibung; hier nur, ob sie einem selbst etwas nützt
      if (!this.pathway) info.notes.push('Du hast noch keinen Pfad. Als Formel nur etwas für den Weiterverkauf, bis du einen betrittst.');
      else if (this.pathway.id !== it.pathway) info.notes.push('Nicht dein Pfad: nur zum Weiterverkauf.');
      else if (it.seq >= this.pathway.seq) info.notes.push('Dein Pfad, aber diese Stufe hast du schon hinter dir.');
      else if (it.seq === this.pathway.seq - 1) info.notes.push('Dein Pfad, deine nächste Stufe.');
      else info.notes.push(`Dein Pfad, aber erst ${this.pathway.seq - 1 - it.seq} Stufe${this.pathway.seq - 1 - it.seq === 1 ? '' : 'n'} später dran.`);
      const ing = Object.entries(it.ingredients ?? {}).map(([iid, n]) => `${this.item(iid)?.name ?? iid}${n > 1 ? ` ×${n}` : ''}`);
      if (ing.length) info.notes.push(`Zutaten: ${ing.join(', ')}`);
    }
    if (it.kind === 'weapon') info.notes.push(`Angriff ${it.atk}${it.occult ? ', stark gegen Okkultes' : ''}`);
    return info;
  },

  /** Für Lose und Gesuche: Würfel pro Treffen, Zirkel und Thema. */
  sessionRng(circleId, cycle, topic) {
    return seeded(`${cycle}|${circleId}|${topic}`);
  },

  circleMembers(circleId) {
    return this.gatheringDef(circleId)?.members ?? [];
  },

  memberName(id) {
    return this.content.npcs[id]?.name ?? id;
  },

  /**
   * Das Los eines Mitglieds in dieser Runde (oder null). Formeln aller Pfade kommen vor, eine
   * für den eigenen Pfad ist also selten (fremde lassen sich am Ende weiterversteigern).
   */
  memberLot(circleId, cycle, memberId) {
    const mem = this.circleMembers(circleId).find((m) => m.id === memberId);
    const rng = this.sessionRng(circleId, cycle, `lot:${memberId}`);
    const pool = mem.offers.filter((e) => rng() < (e.chance ?? 1));
    if (!pool.length) return mem.offers.length ? { ...mem.offers[Math.floor(rng() * mem.offers.length)] } : null;
    return { ...pool[Math.floor(rng() * pool.length)] };
  },

  /** Das Gesuch eines Mitglieds in dieser Runde: { member, item, price } oder null. */
  memberRequest(circleId, cycle, memberId) {
    const r = this.auctionRules();
    const mem = this.circleMembers(circleId).find((m) => m.id === memberId);
    const rng = this.sessionRng(circleId, cycle, `want:${memberId}`);
    if (!mem?.wants.length || rng() >= (r.request_chance ?? 0.75)) return null;
    const item = mem.wants[Math.floor(rng() * mem.wants.length)];
    const price = Math.max(8, Math.round(this.itemValue(item) * (r.request_markup ?? 1.8)));
    return { member: memberId, item, price };
  },

  /** Alle Gesuche eines Treffens, z. B. um sie vorher anzukündigen. */
  sessionRequests(circleId, cycle) {
    return this.circleMembers(circleId).map((m) => this.memberRequest(circleId, cycle, m.id)).filter(Boolean);
  },

  /** Hat die Runde in diesem Treffen schon stattgefunden? */
  sessionHeld(circleId, cycle = this.marketCycle()) {
    return this.sessionsHeld.includes(`${circleId}:${cycle}`);
  },

  /** Eröffnet die Runde. Ergebnis { ok, text }. Der Ablauf steht danach in `this.auction`. */
  startSession(circleId) {
    if (!this.gatheringOpen(circleId) || !this.isMember(circleId)) return { ok: false, text: 'Das Treffen ist vorbei.' };
    const cycle = this.marketCycle();
    if (this.sessionHeld(circleId, cycle)) return { ok: false, text: 'Die Runde ist für heute durch. Wartet auf das nächste Treffen.' };
    this.sessionsHeld = [...this.sessionsHeld.filter((k) => Number(k.split(':')[1]) >= cycle - 1), `${circleId}:${cycle}`];
    const members = this.circleMembers(circleId).map((m) => m.id);
    const artisan = !!this.artisanPresent?.(circleId, cycle);
    this.auction = { circle: circleId, cycle, members, turn: 0, phase: 'lot', lot: null, request: null, own: null, artisan, log: [], bought: [], sold: [], crafted: [], collected: [] };
    this.say(`${this.gatheringDef(circleId).name}: Die Runde ist eröffnet.${artisan ? ` ${this.artisanName()} sitzt mit am Tisch.` : ''}`);
    // Was die Fasserin seit dem letzten Treffen dieses Zirkels fertig hat, übergibt der Gastgeber zuerst
    this.auction.collected = this.collectOrders?.(circleId, cycle) ?? [];
    this.openLot();
    return { ok: true };
  },

  say(text) {
    this.auction.log.push(text);
    if (this.auction.log.length > 6) this.auction.log.shift();
  },

  /** Wer redet gerade? */
  auctionSpeaker() {
    const a = this.auction;
    if (!a || a.phase === 'own' || a.phase === 'own_bids' || a.phase === 'done') return null;
    if (a.phase === 'artisan') return this.artisanId();
    return a.members[a.turn];
  },

  /** Nächstes Los vorbereiten; die Mitbieter haben je eine geheime Obergrenze. */
  openLot() {
    const a = this.auction;
    const r = this.auctionRules();
    const seller = a.members[a.turn];
    const e = this.memberLot(a.circle, a.cycle, seller);
    if (!e) { a.lot = null; this.openRequest(); return; }
    const rng = this.sessionRng(a.circle, a.cycle, `rivals:${seller}`);
    const ceilings = {};
    for (const m of a.members) {
      if (m === seller) continue;
      if (rng() < (r.rival_interest ?? 0.65)) {
        const lo = r.rival_min ?? 0.75;
        const hi = r.rival_max ?? 1.45;
        ceilings[m] = Math.round(e.price * (lo + rng() * (hi - lo)));
      }
    }
    const start = Math.max(1, Math.round(e.price * (r.lot_start ?? 0.6)));
    const step = Math.max(1, Math.round(e.price * (r.step ?? 0.1)));
    a.phase = 'lot';
    a.lot = { seller, item: e.item, value: e.price, price: start, step, leader: null, ceilings };
    this.say(`${this.memberName(seller)} legt ${this.item(e.item).name} auf den Tisch. Start bei ${start} Schilling.`);
    // Der eifrigste Mitbieter eröffnet, wenn ihm der Startpreis recht ist
    const [first] = this.rivalsAbove(start);
    if (first) { a.lot.leader = first; this.say(`${this.memberName(first)} bietet ${start}.`); }
  },

  /** Mitbieter, die mindestens `price` zahlen würden, der höchste zuerst. */
  rivalsAbove(price) {
    const c = this.auction.lot.ceilings;
    return Object.keys(c).filter((m) => c[m] >= price).sort((x, y) => c[y] - c[x]);
  },

  /** Nächstes Gebot, das der Spieler abgeben müsste. */
  nextBid() {
    const l = this.auction?.lot;
    if (!l) return null;
    return l.leader ? l.price + l.step : l.price;
  },

  /** Der Spieler bietet. Die anderen ziehen mit oder steigen aus. */
  bid() {
    const a = this.auction;
    const l = a?.lot;
    if (!l || a.phase !== 'lot') return { ok: false, text: 'Gerade steht nichts zum Verkauf.' };
    if (l.leader === 'player') return { ok: false, text: 'Du führst schon.' };
    const price = this.nextBid();
    if (this.money < price) return { ok: false, text: `Für ${price} Schilling reicht deine Börse nicht.` };
    l.price = price;
    l.leader = 'player';
    this.say(`Du bietest ${price}.`);
    const [rival] = this.rivalsAbove(price + l.step);
    if (rival) {
      l.price = price + l.step;
      l.leader = rival;
      this.say(`${this.memberName(rival)} hält dagegen: ${l.price}.`);
      return { ok: true, outbid: true };
    }
    // Niemand geht mit: Zuschlag
    this.spendMoney(price);
    this.addItem(l.item);
    this.act?.('trade');
    this.act?.('gathering');
    a.bought.push({ item: l.item, price });
    this.say(`Zuschlag! ${this.item(l.item).name} geht für ${price} Schilling an dich.`);
    this.emit('changed');
    this.openRequest();
    return { ok: true, won: true };
  },

  /** Der Spieler steigt aus. */
  passLot() {
    const a = this.auction;
    const l = a?.lot;
    if (!l || a.phase !== 'lot') return { ok: false };
    if (l.leader && l.leader !== 'player') this.say(`${this.item(l.item).name} geht für ${l.price} an ${this.memberName(l.leader)}.`);
    else this.say(`Niemand will ${this.item(l.item).name}. ${this.memberName(l.seller)} packt es wieder ein.`);
    this.openRequest();
    return { ok: true };
  },

  /** Nach dem Los: das Gesuch desselben Mitglieds (falls es eins hat). */
  openRequest() {
    const a = this.auction;
    a.lot = null;
    const req = this.memberRequest(a.circle, a.cycle, a.members[a.turn]);
    if (!req) { this.nextTurn(); return; }
    a.phase = 'request';
    a.request = req;
    this.say(`${this.memberName(req.member)} sucht ${this.item(req.item).name} und zahlt ${req.price} Schilling.`);
  },

  fulfillRequest() {
    const a = this.auction;
    const q = a?.request;
    if (!q || a.phase !== 'request') return { ok: false };
    if (!this.itemCount(q.item)) return { ok: false, text: `Du hast kein ${this.item(q.item).name} dabei.` };
    this.removeItem(q.item);
    this.addMoney(q.price, { reason: 'Gesuch erfüllt' });
    a.sold.push({ item: q.item, price: q.price });
    this.say(`Du gibst ${this.item(q.item).name} ab und bekommst ${q.price} Schilling.`);
    this.nextTurn();
    return { ok: true };
  },

  declineRequest() {
    const a = this.auction;
    if (!a?.request || a.phase !== 'request') return { ok: false };
    if (!this.itemCount(a.request.item)) this.say(`Du hast nichts davon dabei. ${this.memberName(a.request.member)} zuckt die Schultern.`);
    this.nextTurn();
    return { ok: true };
  },

  nextTurn() {
    const a = this.auction;
    a.request = null;
    a.turn += 1;
    if (a.turn < a.members.length) { this.openLot(); return; }
    a.phase = 'own';
    this.say(`Alle waren dran. Jetzt darfst du selbst etwas anbieten.${a.artisan ? ` ${this.artisanName()} wartet auf Beute zum Fassen.` : ''}`);
  },

  /** Was man selbst versteigern darf: eigene (nicht geliehene) Artefakte und Formeln. */
  ownOfferables() {
    return Object.keys(this.inventory)
      .filter((id) => ['artifact', 'formula'].includes(this.item(id)?.kind) && !(this.borrowed ?? []).includes(id))
      .map((id) => ({ id, name: this.item(id).name, kind: this.item(id).kind, value: this.itemValue(id) }));
  },

  /** Eigenes Los: Die Mitglieder bieten, man kann annehmen oder zurückziehen. */
  offerOwn(itemId) {
    const a = this.auction;
    if (!a || a.phase !== 'own') return { ok: false };
    const e = this.ownOfferables().find((x) => x.id === itemId);
    if (!e) return { ok: false, text: 'Das kannst du hier nicht anbieten.' };
    const r = this.auctionRules();
    const rng = this.sessionRng(a.circle, a.cycle, `own:${itemId}:${a.sold.length}`);
    const lo = r.own_min ?? 0.55;
    const hi = r.own_max ?? 1.5;
    const bids = a.members.map((m) => ({ member: m, price: rng() < 0.75 ? Math.round(e.value * (lo + rng() * (hi - lo))) : 0 }))
      .filter((b) => b.price > 0).sort((x, y) => y.price - x.price);
    a.own = { item: itemId, bids };
    a.phase = 'own_bids';
    if (!bids.length) {
      this.say(`Du legst ${e.name} auf den Tisch. Schweigen. Niemand bietet.`);
    } else {
      this.say(`Du legst ${e.name} auf den Tisch.`);
      for (const b of bids.slice(0, 3).reverse()) this.say(`${this.memberName(b.member)} bietet ${b.price}.`);
    }
    return { ok: true };
  },

  acceptOwn() {
    const a = this.auction;
    const o = a?.own;
    if (!o || a.phase !== 'own_bids' || !o.bids.length) return { ok: false };
    const best = o.bids[0];
    const name = this.item(o.item).name;
    this.removeItem(o.item);
    this.addMoney(best.price, { reason: 'Eigenes Los' });
    a.sold.push({ item: o.item, price: best.price });
    this.say(`Zuschlag: ${name} geht für ${best.price} Schilling an ${this.memberName(best.member)}.`);
    a.own = null;
    a.phase = 'own';
    this.emit('changed');
    return { ok: true };
  },

  withdrawOwn() {
    const a = this.auction;
    if (!a?.own) return { ok: false };
    this.say(`Du nimmst ${this.item(a.own.item).name} wieder an dich.`);
    a.own = null;
    a.phase = 'own';
    return { ok: true };
  },

  /** Runde beenden (auch vorzeitig). */
  endSession() {
    const a = this.auction;
    if (!a) return null;
    a.phase = 'done';
    const summary = { bought: a.bought, sold: a.sold, crafted: a.crafted ?? [], collected: a.collected ?? [] };
    this.auction = null;
    this.emit('changed');
    return summary;
  },
};
