// Paket AB: Ausbau von Zunders Kahn (Daten in data/packs/wx_nebenquests/kahn_ausbau.json).
// Jeder Ausbau ist ein Flag. Kiste, Glocke und Kartentisch sind einmalige Objekte in der Kajüte (questPacks.js),
// Reetmatten, Ofen und Waschtisch wirken hier: beim Essen/Trinken im Kahn und beim Ausruhen.

/** Zusatz-Nerven beim Verbrauch im Kahn: Item → [Ausbau-Flag, Nerven]. */
const KAHN_FOOD = { salzbrot: ['k2n_kahn_reet', 3], moortee: ['k2n_kahn_ofen', 10] };

export const kahnMethods = {
  inKahn() {
    return this.map === 'wx_kahn';
  },

  /** Lohnt sich das Essen/Trinken hier auch bei vollem Leben (wegen der Nerven)? */
  kahnFoodHelps(id) {
    const [flag] = KAHN_FOOD[id] ?? [];
    return !!flag && this.inKahn() && this.flags.has(flag) && this.composure < this.maxComposure();
  },

  /** Nach useItem(): Textteile für den Bonus oder []. */
  kahnItemBonus(id) {
    const [flag, n] = KAHN_FOOD[id] ?? [];
    if (!flag || !this.inKahn() || !this.flags.has(flag)) return [];
    this.setComposure(this.composure + n);
    return [`+${n} Nerven (${id === 'salzbrot' ? 'trocken bei den Reetmatten' : 'am neuen Ofen'})`];
  },

  /** Beim Ausruhen im Kahn: Waschtisch senkt die Unruhe von Beyondern um 5. Gibt die Menge zurück. */
  kahnRestBonus() {
    if (!this.inKahn() || !this.flags.has('k2n_kahn_waschtisch') || !this.isBeyonder() || this.unruhe <= 0) return 0;
    const n = Math.min(5, this.unruhe);
    this.setUnruhe(this.unruhe - n);
    return n;
  },
};
