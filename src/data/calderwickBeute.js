/**
 * Calderwicker Beute (Seb 2026-11-26: „Drops von Monstern nicht gut“).
 * Alle Gegner der Calderwicker Gefahrengebiete (cw_alte_setzerei, cw_sortiergrube, cw_nullfundament) und der Pfadviertel (o3_*)
 * bekommen einen eigenen Fund-Topf (Mechanismus `alt` aus altbeute.js: mit `chance` genau ein gewichtetes Stück):
 * Seq-4/3-Zutaten aller Pfade (Nebenzutaten häufig, Kernzutat 4 selten, Kernzutat 3 sehr selten), Calderwicker Kleidung,
 * Waffen und wilde Artefakte. Chance: normal 30 %, Elite 55 %, Boss 100 %.
 * Dazu in den Gefahrengebieten die Grundzutaten der hohen Tränke (Nebeltau, Silberstaub), die es vorher nur in den Vierteln gab.
 * Formeln und die Kernzutaten 2/1 bleiben draußen (Formeln: Krämer, Zirkel, Herde; Seb: Seq-4-Formel nie hier).
 */
import { kernzutat } from './seqHoch.js';
import { cwFundTopf } from './calderwickFunde.js';

export const CW_BEUTE_CHANCE = { normal: 0.3, elite: 0.55, boss: 1 };
const GEFAHR = ['cw_alte_setzerei', 'cw_sortiergrube', 'cw_nullfundament'];
const GRUND = new Set(['nebeltau', 'silberstaub', 'geisteressenz']);

export function cwBeuteTopf(content) {
  const pool = new Map();
  const add = (item, w) => { if (content.items[item] && !pool.has(item)) pool.set(item, w); };
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const seq of [4, 3]) {
      const ing = Object.keys(p.seqs?.[seq]?.ingredients ?? {});
      ing.forEach((id, i) => {
        if (GRUND.has(id)) return;
        const stufe = Number(/^sq_zutat_.+_(\d)$/.exec(id)?.[1] ?? 0);
        if (stufe === 4 || (i === 0 && seq === 4) || id === kernzutat(pid, 4)) add(id, 1); // Kernzutaten 4 (auch die zweite des Nachbarpfads)
        else if (stufe === 3 || (i === 0 && seq === 3)) add(id, 0.2); // Kernzutat 3: sehr selten (eigentlich Gilde)
        else add(id, stufe ? 3 : 5);
      });
    }
  }
  for (const [id, it] of Object.entries(content.items)) {
    if (!id.startsWith('vi_')) continue; // Calderwicker/Briarholter Vorrat (Kleidung, Waffen, wilde Artefakte)
    if (it.kind === 'gear') add(id, 1.5);
    else if (it.kind === 'weapon') add(id, 1);
    else if (it.kind === 'artifact' && id.startsWith('vi_art_')) add(id, 0.6);
  }
  for (const e of cwFundTopf(content)) add(e.item, e.w); // Habseligkeiten der Gefallenen (Codex-Vorrat Reserve200/Future200)
  return [...pool].map(([item, w]) => ({ item, w }));
}

export function applyCalderwickBeute(content) {
  const pool = cwBeuteTopf(content);
  for (const [id, e] of Object.entries(content.encounters)) {
    const zone = e.zone ?? '';
    const viertel = zone.startsWith('o3_');
    if (!GEFAHR.includes(zone) && !viertel) continue;
    const l = (content.loot[id] ??= { money: [0, 0], drops: [] });
    const rang = e.boss ? 'boss' : e.elite ? 'elite' : 'normal';
    l.alt = { chance: CW_BEUTE_CHANCE[rang], label: viertel ? 'Fund im Viertel' : 'Calderwicker Fund', pool };
    if (!viertel) {
      const drops = (l.drops ??= []);
      for (const [item, ch] of [['nebeltau', 0.2], ['silberstaub', 0.15]]) if (content.items[item] && !drops.some((d) => d.item === item)) drops.push({ item, chance: e.boss ? 1 : e.elite ? ch * 2 : ch });
    }
  }
  return content;
}
