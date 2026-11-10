// Korruption: Was ein Kontrollverlust mit deinen Sachen macht (ohne Phaser, in Node testbar).
//
// Bei jedem Kontrollverlust wachsen Tentakel aus der Figur und fressen sich in alles, was sie gerade
// am Leib trägt: die ausgerüstete Waffe, angelegte Kleidung und alle mitgeführten Artefakte.
// Korrumpierte Stücke kosten Leben und Nerven pro Sekunde, solange sie in Gebrauch sind:
// - Waffe: solange sie ausgerüstet ist (eine korrumpierte Waffe darf man ablegen, dann kämpft man mit Fäusten;
//   dafür beißt sie etwas besser).
// - Kleidung: solange sie angelegt ist.
// - Artefakte wirken sonst immer, sobald sie im Inventar sind (siehe Artifacts.js). Korrumpierte Artefakte
//   sind die Ausnahme: Man kann sie „beiseitelegen“, dann ruhen Fluch, Segen und Korruption, bis man sie
//   wieder aufnimmt.
// Die Korruption haftet am Stück, nicht am Platz: Einlagern und Wiederholen hilft nicht, Weitergeben auch nicht.
// Erst wenn das Stück ganz weg ist (verkauft, weggeworfen, zurückgegeben), erlischt sie.
// Reinigen: Dr. Varga im Revier (gegen Schilling) oder Läutersalz von Nell Rauhfuß (ein Beutel je Stück).
// Regeln in pathways.json → corruption.

export const DEFAULT_CORRUPTION = {
  hp_per_sec: 0.12, // Leben pro Sekunde und korrumpiertem Stück in Gebrauch (nie unter 1 Leben)
  nerves_per_sec: 0.5, // Nerven pro Sekunde und Stück
  weapon_atk_bonus: 2, // eine korrumpierte Waffe schlägt härter
  cleanse_price: { weapon: 60, gear: 45, artifact: 120 }, // Dr. Varga
  cleanse_item: 'laeutersalz',
};

export const corruptionMethods = {
  resetCorruption() {
    this.corrupted = {}; // id -> Anzahl der Kontrollverluste, die das Stück getroffen haben
    this.setAside = []; // korrumpierte Artefakte, die beiseitegelegt sind (ruhen)
    this.corruptionAcc = 0; // angesammelter Lebensverlust unter einem ganzen Punkt
  },

  corruptionRules() {
    const r = this.content.corruption ?? {};
    return { ...DEFAULT_CORRUPTION, ...r, cleanse_price: { ...DEFAULT_CORRUPTION.cleanse_price, ...(r.cleanse_price ?? {}) } };
  },

  isCorrupted(id) {
    return (this.corrupted?.[id] ?? 0) > 0;
  },

  isSetAside(id) {
    return this.isCorrupted(id) && (this.setAside ?? []).includes(id);
  },

  /** Alles Korrumpierte, das du gerade besitzt (im Inventar), für Anzeige und Reinigung. */
  corruptedItems() {
    return Object.keys(this.corrupted ?? {}).filter((id) => this.isCorrupted(id) && this.itemCount(id) > 0);
  },

  /** Was gerade an dir zehrt: ausgerüstete Waffe, angelegte Kleidung, mitgeführte (nicht beiseitegelegte) Artefakte. */
  corruptedInUse() {
    const out = [];
    if (this.weapon && this.isCorrupted(this.weapon)) out.push(this.weapon);
    for (const id of this.equippedGear()) if (this.isCorrupted(id)) out.push(id);
    for (const id of this.activeArtifacts()) if (this.isCorrupted(id)) out.push(id);
    return out;
  },

  /** Leben und Nerven pro Sekunde durch Korruption (für Anzeige). */
  corruptionDrain() {
    const n = this.corruptedInUse().length;
    const r = this.corruptionRules();
    return { count: n, hp: n * r.hp_per_sec, nerves: n * r.nerves_per_sec };
  },

  /**
   * Beim Kontrollverlust: Tentakel fressen sich in Waffe, Kleidung und Artefakte am Leib.
   * Gibt die Ids der jetzt (neu oder erneut) korrumpierten Stücke zurück.
   */
  corruptEquipment() {
    const hit = [];
    if (this.weapon && this.itemCount(this.weapon)) hit.push(this.weapon);
    hit.push(...this.equippedGear());
    hit.push(...this.activeArtifacts());
    for (const id of hit) {
      this.corrupted[id] = (this.corrupted[id] ?? 0) + 1;
      this.setAside = this.setAside.filter((x) => x !== id);
    }
    if (hit.length) this.emit('corrupted', { ids: hit, player: this.acting ?? 1 });
    return hit;
  },

  /** Wird von tickPathway aufgerufen: korrumpierte Stücke in Gebrauch zehren an Leben und Nerven. */
  tickCorruption(dt) {
    const n = this.corruptedInUse().length;
    if (!n) return;
    const r = this.corruptionRules();
    this.corruptionAcc += r.hp_per_sec * n * dt;
    const whole = Math.floor(this.corruptionAcc);
    if (whole >= 1 && this.hp > 1) {
      this.corruptionAcc -= whole;
      const before = this.hp;
      this.hp = Math.max(1, this.hp - whole);
      if (this.hp !== before) this.emit('hp', { value: this.hp, delta: this.hp - before, reason: 'Korruption' });
    } else if (whole >= 1) this.corruptionAcc = 0;
    this.composure = Math.max(0, this.composure - r.nerves_per_sec * n * dt);
  },

  // --- Ablegen -----------------------------------------------------------------------
  /** Korrumpierte Waffe ablegen: weiter mit Fäusten. */
  unequipWeapon() {
    if (!this.weapon || !this.isCorrupted(this.weapon)) return false;
    this.weapon = null;
    this.emit('changed');
    return true;
  },

  /** Korrumpiertes Artefakt beiseitelegen: Es bleibt im Inventar, wirkt aber nicht mehr (die Ausnahme vom Mitführen). */
  setAsideArtifact(id) {
    if (this.item(id)?.kind !== 'artifact' || !this.isCorrupted(id) || !this.itemCount(id)) return { ok: false, text: 'Nur korrumpierte Artefakte lassen sich beiseitelegen. Alles andere wirkt, solange du es bei dir hast.' };
    if (this.setAside.includes(id)) return { ok: false, text: 'Liegt schon beiseite.' };
    this.setAside = [...this.setAside, id];
    this.refreshGearStats();
    this.emit('artifact', { id, active: false });
    this.emit('changed');
    return { ok: true, text: `${this.item(id).name} liegt eingewickelt zuunterst in der Tasche. Es ruht, samt Segen, Fluch und Korruption.` };
  },

  /** Beiseitegelegtes Artefakt wieder aufnehmen: Es wirkt wieder, und die Korruption zehrt wieder. */
  takeUpArtifact(id) {
    if (!this.setAside.includes(id)) return { ok: false, text: 'Das wirkt bereits.' };
    this.setAside = this.setAside.filter((x) => x !== id);
    this.refreshGearStats();
    this.emit('artifact', { id, active: true });
    this.emit('changed');
    return { ok: true, text: `${this.item(id).name} wirkt wieder. Und frisst wieder.` };
  },

  // --- Reinigen ---------------------------------------------------------------------
  cleansePrice(id) {
    const r = this.corruptionRules();
    const kind = this.item(id)?.kind;
    const base = r.cleanse_price[kind] ?? r.cleanse_price.gear;
    return base * (this.corrupted?.[id] ?? 1); // mehrfach korrumpiert: entsprechend teurer
  },

  /** Angebot der Reinigung bei Dr. Varga: [{id, name, price, affordable}] */
  cleanseOffers() {
    return this.corruptedItems().map((id) => {
      const price = this.cleansePrice(id);
      return { id, ...this.item(id), price, affordable: this.money >= price };
    });
  },

  /** Entfernt die Korruption von einem Stück. */
  purify(id) {
    if (!this.isCorrupted(id)) return false;
    delete this.corrupted[id];
    this.setAside = this.setAside.filter((x) => x !== id);
    this.refreshGearStats();
    this.emit('cleansed', { id, player: this.acting ?? 1 });
    this.emit('changed');
    return true;
  },

  /** Reinigung bei Dr. Varga gegen Schilling. */
  cleanseAt(id) {
    if (!this.isCorrupted(id) || !this.itemCount(id)) return { ok: false, text: 'Daran ist nichts zu reinigen.' };
    const price = this.cleansePrice(id);
    if (this.money < price) return { ok: false, text: `Die Reinigung kostet ${price} Schilling. So viel hast du nicht.` };
    this.money -= price;
    this.emit('money', { delta: -price, value: this.money, reason: 'Reinigung' });
    this.purify(id);
    return { ok: true, text: `Dr. Varga legt ${this.item(id).name} in eine Schale mit Salzlauge und murmelt etwas Lateinisches. Das Wasser wird schwarz. „Das war's. Trinken Sie nächstes Mal langsamer.“ (${price} Schilling)` };
  },

  /** Reinigung unterwegs mit Läutersalz (verbraucht einen Beutel). */
  cleanseWithSalt(id) {
    const salt = this.corruptionRules().cleanse_item;
    if (!this.itemCount(salt)) return { ok: false, text: `Dafür brauchst du ${this.item(salt)?.name ?? 'Läutersalz'}. Nell Rauhfuß auf dem Nachtmarkt hat welches.` };
    if (!this.isCorrupted(id) || !this.itemCount(id)) return { ok: false, text: 'Daran ist nichts zu reinigen.' };
    this.removeItem(salt);
    this.purify(id);
    return { ok: true, text: `Du reibst ${this.item(id).name} mit Läutersalz ein. Es zischt, etwas Schwarzes tropft ab und verdampft, bevor es den Boden berührt.` };
  },

  /** Wird aufgerufen, wenn ein Gegenstand das Inventar verlässt: ganz weg = Korruption erlischt, eingelagert bleibt sie. */
  corruptionDropped(id) {
    if (!this.isCorrupted(id) || this.itemCount(id) > 0) return;
    const kept = this.storedCount?.(id, 'buero') > 0 || Object.values(this.stashes ?? {}).some((st) => (st?.[id] ?? 0) > 0);
    if (kept) return;
    delete this.corrupted[id];
    this.setAside = this.setAside.filter((x) => x !== id);
  },

  serializeCorruption() {
    return { corrupted: this.corrupted, setAside: this.setAside };
  },

  loadCorruption(data) {
    this.corrupted = Object.fromEntries(Object.entries(data?.corrupted ?? {}).filter(([id, n]) => this.item(id) && n > 0));
    this.setAside = (data?.setAside ?? []).filter((id) => this.isCorrupted(id) && this.item(id)?.kind === 'artifact');
    this.corruptionAcc = 0;
  },
};
