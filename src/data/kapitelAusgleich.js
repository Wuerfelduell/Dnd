// Kapitel-Abgleich (Seb 2026-11-12, „Scaling checken: Leben, Geld, Items“).
// Kapitel 4 (Calderwick, Briarholt, Landstraße) zahlte noch Wexmoor-Geld (normal ~13, Elite ~30, Bosse 0),
// obwohl Dunscar davor schon ×10 zahlt und die Läden dort 1200–2000 für Waffen nehmen.
// Und die Sekten-Häupter in Dunscar (Bosse mit 3200 Leben) zahlten nur 300, Gebietsbosse dort 1000–1250.

export const K4_MONEY_MULT = 15; // eine Spur über Dunscar (×10), die Läden dort sind ~1,5× teurer
export const K4_BOSS_MONEY = [100, 160]; // vor ×15: 1500–2400, Bosse hatten gar kein Geld
export const K3_BOSS_MONEY_MIN = [700, 1000]; // so viel wie der kleinste Dunscar-Gebietsboss

export function applyKapitelAusgleich(content) {
  const loot = { ...content.loot };
  for (const [id, enc] of Object.entries(content.encounters)) {
    const L = loot[id];
    if (!L || !Array.isArray(L.money) || enc.practice) continue;
    if (enc.chapter === 4 && !L.k4_buffed) {
      const base = enc.boss && !/_phase\d/.test(id) && !L.money[1] ? K4_BOSS_MONEY : L.money;
      loot[id] = { ...L, money: base.map((v) => Math.round(v * K4_MONEY_MULT)), k4_buffed: true };
    } else if (enc.chapter === 3 && enc.boss && L.repeat && L.money[1] && L.money[1] < K3_BOSS_MONEY_MIN[0]) {
      loot[id] = { ...L, money: [...K3_BOSS_MONEY_MIN] };
    }
  }
  content.loot = loot;
}
