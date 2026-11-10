// Lokaler Zwei-Spieler-Modus: Spieler 2 begleitet den Ermittler auf demselben Bildschirm.
//
// Spieler 1 ist der Ermittler mit Ansehen, Fällen und Geldbeutel (alles gemeinsam).
// Spieler 2 hat eigenes Leben, eigene Nerven, ein eigenes Inventar, eine eigene Waffe und
// einen eigenen Pfad: eigene Sequenz, Verdauung, Unruhe, Fähigkeiten, Tränke und Rituale.
// Er hinterlässt beim Entfernen nichts: seine Sachen bleiben bei ihm, bis er wieder mitspielt.
//
// Technik: Die Spielregeln in GameState rechnen alle mit this.hp, this.inventory usw.
// withPlayer(2, fn) tauscht für die Dauer von fn die persönlichen Werte von Spieler 2 ein,
// so gelten dieselben Regeln (Tragkraft, Artefakte, Heilmittel, Ausrüsten) auch für ihn.
// Gemeinsame Taten (Hinweise, Gespräche, Siege ...) verdauen die Tränke beider Spieler (siehe act()).

/** Persönliche Werte, die zwischen den Spielern getauscht werden. */
/** Flüchtige Platz-Flags der Koop-Rätsel (Paket AI). */
export const KOOP_ROLE_FLAG = /^koop_[a-z_]+_p[12]$/;
export const PERSONAL = ['hp', 'maxHp', 'inventory', 'weapon', 'gear', 'composure', 'pathway', 'unruhe', 'spiritVision', 'visionDigest', 'corrupted', 'setAside', 'corruptionAcc'];

export const P2_COMPOSURE_REGEN = 6; // pro Sekunde

export const P2_START = { hp: 40, items: { spazierstock: 1, verband: 2 }, weapon: 'spazierstock' };

export const partyMethods = {
  resetParty() {
    this.p2 = null; // { active, hp, maxHp, inventory, weapon, composure, pathway, unruhe, spiritVision }
    this.acting = 1; // wessen Werte gerade in this.hp usw. stehen
    this.koopSeen = new Set(); // Paket AI: schon gehörtes Geplauder
  },

  /**
   * Paket AI: `koop_aktiv` folgt allein hasP2(); die flüchtigen Platz-Flags der Koop-Rätsel
   * (koop_<auftrag>_p1/_p2) gelten nur, solange jemand wirklich dort steht, und fallen hier weg.
   */
  syncKoop() {
    if (!this.flags) return;
    if (this.hasP2()) this.flags.add('koop_aktiv');
    else this.flags.delete('koop_aktiv');
    for (const f of [...this.flags]) if (KOOP_ROLE_FLAG.test(f)) this.flags.delete(f);
  },

  /** Spielt Spieler 2 gerade mit? */
  hasP2() {
    return !!this.p2?.active;
  },

  /** Spieler 2 dazuholen. Beim ersten Mal mit Startausrüstung, danach mit seinen alten Sachen. */
  addP2() {
    if (!this.p2) {
      const s = this.content.start;
      const items = { ...(this.content.party?.items ?? P2_START.items) };
      const hp = s.hp ?? P2_START.hp;
      this.p2 = {
        active: true, hp, maxHp: hp, inventory: items,
        weapon: this.content.party?.weapon ?? (items[P2_START.weapon] ? P2_START.weapon : null), gear: { hut: null, mantel: null, amulett: null },
        composure: 100, pathway: null, unruhe: 0, spiritVision: false, visionDigest: { map: null, total: 0 }, look: 'p2a',
        corrupted: {}, setAside: [], corruptionAcc: 0,
      };
    }
    this.p2.active = true;
    this.p2.hp = Math.max(1, this.p2.hp);
    this.syncKoop();
    this.syncClaims?.(); // BG: späte Beitritte bekommen offene Ansprüche
    this.emit('party', { active: true });
    this.emit('changed');
    return true;
  },

  /** Paket AH: Figur von Spieler 2 ('p2a' Schiebermütze, 'p2b' Melone). Alte Spielstände haben 'p2a'. */
  p2Look() {
    return this.p2?.look ?? 'p2a';
  },

  setP2Look(look) {
    if (!this.p2 || !['p2a', 'p2b'].includes(look)) return false;
    this.p2.look = look;
    this.emit('p2look', { look });
    this.emit('changed');
    return true;
  },

  /** Spieler 2 entfernen. Seine Sachen behält er für das nächste Mal. */
  removeP2() {
    if (!this.p2) return false;
    this.p2.active = false;
    this.syncKoop();
    this.emit('party', { active: false });
    this.emit('changed');
    return true;
  },

  swapPersonal() {
    for (const k of PERSONAL) {
      const mine = this[k];
      this[k] = this.p2[k];
      this.p2[k] = mine;
    }
    this.acting = this.acting === 1 ? 2 : 1;
  },

  /** Führt fn mit den Werten des gerade nicht handelnden Spielers aus (egal ob das 1 oder 2 ist). */
  withPartner(fn) {
    if (!this.p2) return undefined;
    this.swapPersonal();
    try {
      return fn();
    } finally {
      this.swapPersonal();
    }
  },

  /**
   * Führt fn mit den Werten von Spieler n aus. Für Spieler 1 (oder ohne Spieler 2) ändert sich nichts.
   * Beweisstücke (Art "key"), die Spieler 2 dabei bekommt, wandern sofort zum Ermittler.
   */
  withPlayer(n, fn, { quiet = false } = {}) {
    if (n !== 2 || !this.p2 || this.acting === 2) return fn();
    this.swapPersonal();
    let out;
    try {
      out = fn();
    } finally {
      this.swapPersonal();
      for (const [id, cnt] of Object.entries(this.p2.inventory)) {
        if (this.item(id)?.kind !== 'key') continue;
        delete this.p2.inventory[id];
        this.inventory[id] = (this.inventory[id] ?? 0) + cnt;
      }
      if (!quiet) {
        this.emit('hp', { value: this.hp, delta: 0 });
        this.emit('composure', this.composure);
        this.emit('party', { active: true });
      }
    }
    return out;
  },

  /** Lesbare Werte eines Spielers (für HUD, Kampf und Inventar). */
  playerView(n = 1) {
    if (n === 2 && !this.p2) return null;
    return this.withPlayer(n, () => ({
      n, hp: this.hp, maxHp: this.maxHp, composure: this.composure, maxComposure: this.maxComposure(),
      weapon: this.weaponStats(), overloaded: this.isOverloaded(), carry: this.carryText(),
      pathway: this.pathway ? { ...this.pathway, name: this.pathwayDef().name, seqName: this.seqDef().name, color: this.pathwayDef().color } : null,
      unruhe: this.unruhe,
    }), { quiet: true });
  },

  /**
   * Gibt einen Gegenstand an den anderen Spieler weiter. from: 1 oder 2.
   * Beweisstücke bleiben beim Ermittler, geliehene Artefakte dürfen weitergereicht werden.
   */
  giveItem(id, from = 1, n = 1) {
    if (!this.hasP2()) return { ok: false, text: 'Spieler 2 spielt gerade nicht mit.' };
    const it = this.item(id);
    if (!it) return { ok: false, text: 'Unbekannter Gegenstand.' };
    if (it.kind === 'key') return { ok: false, text: 'Beweisstücke behält der Ermittler.' };
    const to = from === 1 ? 2 : 1;
    const have = this.withPlayer(from, () => this.itemCount(id));
    n = Math.min(n, have);
    if (n <= 0) return { ok: false, text: 'Davon ist nichts mehr da.' };
    const tainted = this.withPlayer(from, () => this.corrupted?.[id] ?? 0);
    this.withPlayer(from, () => this.removeItem(id, n));
    this.withPlayer(to, () => this.addItem(id, n));
    // Die Korruption haftet am Stück und wandert mit
    if (tainted) this.withPlayer(to, () => { this.corrupted[id] = Math.max(this.corrupted[id] ?? 0, tainted); });
    this.emit('changed');
    return { ok: true, text: `${it.name}${n > 1 ? ` ×${n}` : ''} an Spieler ${to} gegeben.` };
  },

  /** Heilung für die ganze Gruppe (Rast, sichere Reise): Spieler 2 bekommt denselben Anteil. */
  /**
   * Heilt den jeweils anderen Spieler mit (Rast, sichere Reise, Heil-Effekte aus Gesprächen).
   * amount: Lebenspunkte oder 'full'; pct: Anteil an seinem Höchstwert.
   * this.p2 hält immer die Werte des Spielers, der gerade nicht handelt.
   */
  healPartner(amount, { pct = null } = {}) {
    if (!this.hasP2()) return 0;
    const o = this.p2;
    const add = amount === 'full' ? o.maxHp : pct !== null ? Math.max(1, Math.round(o.maxHp * pct)) : amount;
    const before = o.hp;
    o.hp = Math.min(o.maxHp, o.hp + Math.max(0, add));
    if (o.hp !== before) this.emit('party', { active: true });
    return o.hp - before;
  },

  /** Spieler 2 mit der Zeit: Nerven erholen sich (ohne Geistsicht), Unruhe klingt ab, Artefakte zerren. */
  tickParty(dt) {
    if (!this.hasP2() || this.acting !== 1) return;
    this.withPlayer(2, () => {
      const calmMind = this.unruhe >= 60 ? 0.5 : 1;
      this.composure = Math.min(this.maxComposure(), this.composure + P2_COMPOSURE_REGEN * this.passive('composure_regen') * calmMind * dt);
      this.tickPathway(dt);
    }, { quiet: true });
  },

  serializeParty() {
    return { ...(this.p2 ? { p2: { ...this.p2, inventory: { ...this.p2.inventory }, gear: { ...this.p2.gear } } } : {}), koopSeen: [...this.koopSeen] };
  },

  loadParty(data) {
    this.koopSeen = new Set(data?.koopSeen ?? []);
    const p = data?.p2;
    if (!p) { this.syncKoop(); return; }
    const path = p.pathway;
    const inventory = Object.fromEntries(Object.entries(p.inventory ?? {}).filter(([i, n]) => this.item(i) && n > 0));
    this.p2 = {
      active: !!p.active, hp: Math.max(1, p.hp ?? 40), maxHp: p.maxHp ?? 40, inventory,
      weapon: inventory[p.weapon] ? p.weapon : null, gear: this.cleanGear(p.gear, inventory), composure: p.composure ?? 100,
      pathway: path && this.seqDef(path.id, path.seq) ? { id: path.id, seq: path.seq, digestion: path.digestion ?? 0 } : null,
      unruhe: Math.max(0, Math.min(99, p.unruhe ?? 0)), spiritVision: false, visionDigest: { map: null, total: 0 },
      look: p.look === 'p2b' ? 'p2b' : 'p2a',
      corrupted: Object.fromEntries(Object.entries(p.corrupted ?? {}).filter(([i, n]) => inventory[i] && n > 0)), setAside: [], corruptionAcc: 0,
    };
    this.p2.setAside = (p.setAside ?? []).filter((id) => this.p2.corrupted[id] && this.item(id)?.kind === 'artifact');
    // Höchstwerte aus Pfad, Artefakten und Kleidung neu rechnen
    this.withPlayer(2, () => { this.maxHp = this.calcMaxHp(); this.hp = Math.min(this.hp, this.maxHp); }, { quiet: true });
    this.syncKoop();
  },
};
