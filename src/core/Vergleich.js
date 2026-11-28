// Ausrüstungsvergleich (Seb 2026-11-27): Beim Händler und im Inventar zeigt jeder Wert mit einem grünen
// oder roten Pfeil, ob ein Stück besser oder schlechter ist als das, was man gerade trägt.
//
// - Waffe: gegen die geführte Waffe (ohne Waffe: Fäuste, Angriff 3).
// - Kleidung (Hut, Mantel, Amulett): gegen das Stück am selben Platz.
// - Artefakte wirken alle zugleich (Artifacts.js). Verglichen wird mit dem mitgeführten Artefakt, das die meisten
//   Werte gemeinsam hat; teilt keines einen Wert, kommt das neue nur dazu.
// Personenbezogene Werte (Waffe, Kleidung, Inventar) gehören im Koop dem Spieler, der gerade schaut
// (Ui rendert Laden und Inventar mit dessen Werten, Party.js).

import { MULT_KEYS } from './Pathways.js';

/** Werte, bei denen weniger besser ist. */
const WENIGER_BESSER = new Set(['damage_taken', 'vision_cost', 'price', 'honor_loss', 'recognize', 'skill_composure', 'hurry_cost',
  'unruhe_gain', 'unruhe_tick', 'skill_unruhe', 'combat_drain', 'hit_nerves', 'enemy_ramp', 'dodge_cost', 'gewicht']);

/** Kurznamen der Werte. Was hier fehlt (Schalter, seltene Eigenheiten), erscheint mit dem Text des Stücks. */
export const VERGLEICH_NAMEN = {
  atk: 'Angriff', occult: 'Gegen Okkultes', gewicht: 'Gewicht',
  max_hp: 'Leben', max_nerves: 'Nerven', damage_taken: 'Erlittener Schaden', dmg_mult: 'Schaden', occult_mult: 'Schaden gegen Okkultes',
  shield_mult: 'Schild', composure_regen: 'Nervenerholung', dodge_window: 'Ausweichfenster', dodge_cost: 'Ausweichkosten',
  heal_bonus: 'Heilmittel', price: 'Händlerpreise', sell: 'Verkaufserlös', honor_loss: 'Ansehensverlust', recognize: 'Auffälligkeit',
  vision_cost: 'Geistsicht-Kosten', unruhe_tick: 'Unruhe pro Sekunde', unruhe_gain: 'Unruhe-Zuwachs', calm_decay: 'Unruhe klingt ab',
  skill_unruhe: 'Unruhe je Fertigkeit', skill_composure: 'Nervenkosten der Fertigkeiten', ap_start: 'Konzentration zu Kampfbeginn',
  ap_max: 'Höchstkonzentration', ap_round: 'Konzentration je Runde', attack_ap: 'Konzentration je Treffer', parry_ap: 'Konzentration je Parade',
  parry_nerves: 'Nerven je Parade', round_nerves: 'Nerven je Kampfrunde', hit_nerves: 'Nervenschock bei Treffern', money_bonus: 'Geldfunde',
  carry: 'Tragkraft', lock_bonus: 'Schlösser', digest_mult: 'Verdauung', conclusion_money: 'Geld je gelöstem Fall',
  conclusion_honor: 'Ansehen je gelöstem Fall', hurry_cost: 'Eile-Kosten', use_calm: 'Beruhigung durch Heilmittel', combat_drain: 'Zehren im Kampf',
  enemy_ramp: 'Gegner werden stärker', move_speed: 'Lauftempo',
};

const isMult = (key) => MULT_KEYS.has(key) || key === 'occult';
const neutral = (key) => (isMult(key) ? 1 : 0);

/** Werte eines Stücks, gleiche Schlüssel zusammengefasst: Map key → {value} oder {text, gut} für Schalter und Unbekanntes. */
function werte(it) {
  const out = new Map();
  if (!it) return out;
  const add = (p, gut) => {
    if (typeof p.value === 'number' && VERGLEICH_NAMEN[p.key]) {
      const alt = out.get(p.key)?.value ?? neutral(p.key);
      out.set(p.key, { value: isMult(p.key) ? alt * p.value : alt + p.value });
    } else out.set(`text:${p.text ?? p.key}`, { text: p.text ?? p.key, gut });
  };
  (it.boons ?? []).forEach((p) => add(p, true));
  (it.curses ?? []).forEach((p) => add(p, false));
  return out;
}

const r2 = (v) => Math.round(v * 100) / 100;
const zahl = (v) => String(r2(v)).replace('.', ',');

/** Anzeige eines Werts: Multiplikatoren als Prozent, sonst als Zahl mit Vorzeichen (Angriff und Gewicht ohne). */
export function vergleichWert(key, v) {
  if (key === 'occult') return v === 1 ? '–' : `×${zahl(v)}`;
  if (key === 'atk' || key === 'gewicht') return zahl(v);
  if (isMult(key)) {
    const pct = Math.round((v - 1) * 100);
    return pct === 0 ? '–' : `${pct > 0 ? '+' : '−'}${Math.abs(pct)} %`;
  }
  if (r2(v) === 0) return '–';
  return `${v > 0 ? '+' : '−'}${zahl(Math.abs(v))}`;
}

export const vergleichMethods = {
  /**
   * Vergleich eines Stücks mit dem, was der schauende Spieler gerade trägt.
   * → { gegen: Name | null, art: 'tausch' | 'dazu', zeilen: [{ key, label, neu, alt, besser }] } oder null,
   *   wenn es nichts zu vergleichen gibt (keine Ausrüstung, oder genau dieses Stück ist schon angelegt).
   */
  vergleich(id) {
    const it = this.item(id);
    if (!it || id === 's4mo_relikt') return null;
    let altId = null;
    let gegen = null;
    let art = 'tausch';
    const zeilen = [];
    const zeile = (key, neu, alt, label = VERGLEICH_NAMEN[key]) => {
      if (r2(neu) === r2(alt)) return;
      zeilen.push({ key, label, neu, alt, besser: WENIGER_BESSER.has(key) ? neu < alt : neu > alt });
    };
    if (it.kind === 'weapon') {
      if (this.weapon === id && this.itemCount(id)) return null;
      const alt = this.weapon && this.itemCount(this.weapon) ? this.item(this.weapon) : null;
      altId = alt ? this.weapon : null;
      gegen = alt?.name ?? 'Fäuste';
      zeile('atk', it.atk ?? 0, alt?.atk ?? 3);
      zeile('occult', it.occult ?? 1, alt?.occult ?? 1);
    } else if (it.kind === 'gear') {
      if (this.isWorn(id)) return null;
      const altG = this.gear?.[it.slot];
      altId = altG && this.itemCount(altG) ? altG : null;
      gegen = altId ? this.item(altId).name : null;
    } else if (it.kind === 'artifact') {
      if (this.isArtifactActive(id)) return null;
      const eigene = new Set([...werte(it).keys()]);
      let best = 0;
      for (const a of this.activeArtifacts()) {
        if (a === 's4mo_relikt') continue;
        const n = [...werte(this.launeWirkung?.(a) ?? this.item(a)).keys()].filter((k) => eigene.has(k)).length;
        if (n > best) { best = n; altId = a; }
      }
      gegen = altId ? this.item(altId).name : null;
      if (!altId) art = 'dazu';
    } else return null;
    const neuW = werte(it);
    // Mitgeführte Artefakte mit ihrer jetzigen Wirkung (Launen.js: Bindung stärkt, Groll schwächt)
    const altW = werte(!altId ? null : it.kind === 'artifact' ? this.launeWirkung?.(altId) ?? this.item(altId) : this.item(altId));
    for (const key of new Set([...neuW.keys(), ...altW.keys()])) {
      const n = neuW.get(key);
      const a = altW.get(key);
      if (n?.text != null || a?.text != null) {
        // Schalter und seltene Eigenheiten: gewonnen oder verloren
        if (n && a) continue;
        const x = n ?? a;
        zeilen.push({ key, label: x.text, text: true, weg: !n, besser: n ? x.gut : !x.gut });
      } else zeile(key, n?.value ?? neutral(key), a?.value ?? neutral(key));
    }
    if (art === 'tausch') zeile('gewicht', this.itemWeight(id), altId ? this.itemWeight(altId) : 0);
    return { gegen, art, slot: it.kind === 'gear' ? it.slot : null, zeilen };
  },
};
