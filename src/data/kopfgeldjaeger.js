/**
 * Kopfgeld auf den Spieler (Seb 2026-11-26): Wer viele Beyonder getötet hat, auf den ist ab Dunscar ein Preis ausgesetzt.
 * Dann jagen ihn Kopfgeldjäger: starke Beyonder mit den Fertigkeiten ihres Pfades (machBeyonder), Boss-Rang
 * (Lebens-Untergrenze und Schaden wie Bosse), die ihren Rest deutlich öfter fallen lassen (REST_CHANCE_JAEGER).
 * Damit man Reste nicht farmen kann: je Stadt und Spieltag höchstens EIN Jäger in EINEM zufälligen Gefahrengebiet,
 * nach seinem Sieg erst am nächsten Spieltag wieder (core/Kopfgeldjaeger.js).
 */
import { machBeyonder } from './gegnerBeyonder.js';

/** Ab so vielen verschiedenen getöteten Beyondern (won_-Flags) ist ein Kopfgeld auf dich ausgesetzt. */
export const KGJ_AB_BEYONDERN = 5;
/** Rest-Chance der Jäger (sonst 3–12 %). */
export const REST_CHANCE_JAEGER = 0.35;

/** Stadtgruppen: Gefahrengebiete (Präfix) und Jäger [id, Körper, Pfad, Sequenz, Name, Satz]. */
export const KGJ_GRUPPEN = {
  dunscar: {
    praefix: 'ds_', seq: 5, geld: [900, 1400], // wie ein Dunscar-Gebietsboss
    jaeger: [
      ['kgj_ds_harrow', 'k3k_staubschmuggler_elite', 'eisen', 'Mara Harrow', 'Sie trägt deinen Steckbrief am Gürtel, gefaltet wie einen Liebesbrief.'],
      ['kgj_ds_quill', 'k3k_signalbrecher', 'maske', 'Silas Quill', 'Er lächelt mit einem Gesicht, das gestern noch jemand anderem gehört hat.'],
      ['kgj_ds_brandt', 'k3k_kupferdieb', 'laterne', 'Ilka Barlow', 'Ihre Laterne leuchtet dir genau ins Gesicht, damit sie es mit dem Steckbrief vergleichen kann.'],
      ['kgj_ds_vos', 'k3k_walzenhehler', 'sq_uhr', 'Jonas Vos', 'Er zählt laut die Sekunden, die dir noch bleiben.'],
      ['kgj_ds_marr', 'k3k_lohnfaelscher', 'kessel', 'Odile Marr', 'An ihrem Gürtel klirren Phiolen. In einer davon schwimmt etwas, das einmal ein Beyonder war.'],
    ],
  },
  calderwick: {
    praefix: 'cw_', seq: 4,
    jaeger: [
      ['kgj_cw_pell', 'k4s_kg_aschmann', 'schluessel', 'Rutger Pell', 'Er hat jede Tür zwischen dir und ihm schon geöffnet, bevor du sie gesehen hast.'],
      ['kgj_cw_kade', 'k4s_kg_vell', 'faden', 'Lysbet Kade', 'Feine Fäden laufen von ihren Fingern zu deinem Schatten.'],
      ['kgj_cw_edding', 'k4s_kg_dorn', 'sq_moor', 'Nils Edding', 'Er riecht nach Torf und nach den Gräbern der anderen, die er gejagt hat.'],
      ['kgj_cw_saar', 'k4s_kg_hollin', 'echo', 'Wenda Saar', 'Sie spricht deinen Namen, und hinter ihr sprechen ihn zehn andere Stimmen nach.'],
    ],
  },
  briarholt: {
    praefix: 'bh_', seq: 4,
    jaeger: [
      ['kgj_bh_thorne', 'k4s_kg_aschmann', 'eisen', 'Aldo Thorne', 'Die Kälte macht ihm nichts aus. Er hat schon in schlimmeren Wintern gejagt.'],
      ['kgj_bh_lerch', 'k4s_kg_vell', 'laterne', 'Merit Lerch', 'Ihr Licht schneidet durch den Nebel wie ein Messer.'],
      ['kgj_bh_dunmore', 'k4s_kg_dorn', 'maske', 'Feodor Dunmore', 'Er trägt dein Gesicht. Schlecht, aber erkennbar.'],
      ['kgj_bh_wilk', 'k4s_kg_hollin', 'sq_waage', 'Tilde Wilk', 'Sie hat ausgerechnet, was dein Kopf wert ist, auf den Pence genau.'],
    ],
  },
};

/** Gebiete einer Gruppe (Gefahrengebiete mit diesem Präfix, warme Fassungen in Briarholt zählen zum selben Gebiet). */
export function kgjZonen(content, gruppe) {
  const g = KGJ_GRUPPEN[gruppe];
  return Object.keys(content.zones ?? {}).filter((z) => z.startsWith(g.praefix) && !OHNE.has(z) && content.maps[z]?.rows);
}

/** Gebiete ohne Jäger: die Schlackengrube hat ihre eigene feste Besetzung. */
const OHNE = new Set(['ds_schlackengrube']);

/** Grundgebiet ohne __warm. */
export const kgjGebiet = (z) => String(z).replace(/__warm$/, '');

/** Zu welcher Gruppe gehört ein Gebiet? */
export function kgjGruppeVon(zone) {
  return Object.entries(KGJ_GRUPPEN).find(([, g]) => String(zone).startsWith(g.praefix))?.[0] ?? null;
}

/** Freie Bodenkachel abseits der Eingänge (wie bei den benannten Gegnern). */
function freeTile(m) {
  const spawns = Object.values(m.spawns ?? {});
  const taken = new Set([...(m.npcs ?? []), ...(m.interactables ?? []), ...(m.roamers ?? [])].filter((o) => o.tile).map((o) => `${o.tile[0]},${o.tile[1]}`));
  const w = m.rows[0].length;
  const h = m.rows.length;
  const sx = spawns[0]?.[0] ?? 0;
  const goal = [sx < w / 2 ? Math.round(w * 0.55) : Math.round(w * 0.45), Math.round(h * 0.6)];
  let best = null;
  m.rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!(ch === '.' || /[gpscwPK=,]/.test(ch)) || taken.has(`${x},${y}`)) return;
    if (spawns.some(([a, b]) => Math.abs(x - a) + Math.abs(y - b) < 9)) return;
    const d = Math.abs(x - goal[0]) + Math.abs(y - goal[1]);
    if (!best || d < best.d) best = { d, tile: [x, y] };
  }));
  return best?.tile ?? null;
}

/** In buildContent vor applyBeyonderRest: Jäger anlegen, zu Beyondern machen, in jedes Gebiet ihrer Stadt stellen. */
export function applyKopfgeldjaeger(content) {
  for (const [gruppe, g] of Object.entries(KGJ_GRUPPEN)) {
    const zonen = kgjZonen(content, gruppe);
    if (!zonen.length) continue;
    const ids = [];
    for (const [id, from, pid, name, satz] of g.jaeger) {
      const body = content.encounters[from];
      if (!body || content.encounters[id] || !content.pathways?.[pid]?.seqs?.[g.seq]) continue;
      const { weak_if, on_win, first_win, phase2, elite, wanted, intro, beyonder, beyonder_pfad, beyonder_seq, tier_seq, ...rest } = body;
      content.encounters[id] = {
        ...rest, id, name: `Kopfgeldjäger ${name}`, boss: true, kopfgeldjaeger: true, kgj_gruppe: gruppe,
        attacks: (body.attacks ?? []).filter((a) => !a.pfad),
        intro: `Jemand hat einen Preis auf deinen Kopf ausgesetzt, und ${name} will ihn kassieren. ${satz}`,
        on_win: {}, win_text: `${name} fällt. Der Steckbrief in der Tasche ist zerknittert und blutig. Für heute bist du sicher.`,
        rest_chance: REST_CHANCE_JAEGER,
      };
      machBeyonder(content, id, pid, g.seq);
      content.encounters[id].sheet = `enemy_kgj_${pid}`; // eigenes Kampfblatt je Pfad statt Leihkörper (tools/art/rivalen/rivalen.py)
      const l = content.loot[from] ?? {};
      content.loot[id] = { ...l, repeat: true, money: g.geld ?? (Array.isArray(l.money) ? l.money.map((n) => n * 2) : [200, 400]), drops: [...(content.loot[id]?.drops ?? []), ...(l.drops ?? []).filter((d) => !String(d.item).startsWith('formel_'))] };
      ids.push(id);
    }
    for (const z of zonen) {
      const m = content.maps[z];
      const tile = freeTile(m);
      if (!tile) continue;
      content.maps[z] = { ...m, roamers: [...(m.roamers ?? []), ...ids.map((id) => ({ id: `${z}_${id}`, encounter: id, tile, boss: true, respawn: true, kgj: true }))] };
    }
  }
  return content;
}
