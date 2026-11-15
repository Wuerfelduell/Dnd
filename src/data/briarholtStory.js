/**
 * Kapitel 5 ausgebaut (Seb 2026-11-15): Briarholt, die Kur der Gefallenen.
 *
 * - Anreise: Nach dem Sieg über Wetherby fährt die Linie aus Calderwick hinunter nach Briarholt (data/calderwickStory.js). Sie setzt
 *   `bha_reise_frei`; am Kutschenhof wartet Frost (Codex-Akte CG, Station bha_ankunft), der `k5_arrived` setzt und Akt 1 startet.
 * - Die Codex-Akte (Klinik, Greavesend, Ventile) bleibt, wie sie ist. Ein Rahmen deutet sie um: Was die Klinik den Patienten
 *   „entnimmt“, ist das Gewicht der Gefallenen, das die Linie hinauf zu Starling geht.
 * - Nachspiel nach dem Kapitelende: Der Sammler der Linie, ein Heiliger in Starlings Dienst, holt die letzte Lieferung an der
 *   Verteilanlage. Ziel Seq 3 (tools/sim/kapitel4.mjs k5s_sammler).
 * - Gegner Briarholt auf Sequenz 3: Leben-Untergrenze ×1,4, Schaden ×1,75 statt ×1,4 (Bosse ×1,1/×1,5), dichter besetzt (12 je Gebiet).
 *   tier_seq bleibt 4, damit die mythische Gestalt sie wie bisher erst ab Seq 2 umwirft.
 * - Die Linie fährt in beide Richtungen: In Calderwick liegen die Gildensitze (Formeln 2/1), darum bleibt es erreichbar.
 */
import { freieKachel, schlag } from './calderwickStory.js';

export const K5S_SAMMLER = 'k5s_sammler';
export const BH_SEQ3 = { hp_floor_mult: 1.4, dmg_mult: 1.75, boss_hp_floor_mult: 1.1, boss_dmg_mult: 1.5, dichte: 12 };

function sammlerKampf() {
  return {
    id: K5S_SAMMLER, name: 'Der Sammler der Linie, Heiliger', sprite: 'npc:cultist', tint: '#fff2b0', occult: true,
    chapter: 5, boss: true, elite: false, tier_seq: 3, hp: 7500, armor: 9, dmg_mult: 1, max_round_dmg: 0.2, fleeable: true, duo_hp_mult: 2.2,
    intro: 'An der Verteilanlage steht ein Mann im hellen Mantel, so hell wie Starlings. Er hält eine Kapsel gegen das Licht, in der etwas Warmes schwappt. „Die letzte Lieferung“, sagt er. „Der Professor braucht sie. Oben ist es kalt, wenn man nicht genug wiegt.“',
    attacks: [schlag('Heiliges Urteil', 82, [900, 1500]), schlag('Lichtkette', 56, [700, 1100, 1500], { nerves: 14 }),
      { name: 'Segen', action: 'guard', value: 10, text: 'Er segnet sich selbst. Licht legt sich um ihn: +10 Abwehr.' }, schlag('Gewicht der Gefallenen', 125, [2000], { unparryable: true })],
    phase2: { meldung: 'Der Sammler öffnet die Kapsel und trinkt. Er wird schwerer, und das Licht um ihn bekommt Ränder.', attacks: [schlag('Gekochtes Licht', 100, [1000, 1700], { unparryable: true }),
      schlag('Lichtkette', 66, [600, 900, 1200, 1500]), { name: 'Gebet nach oben', action: 'guard', value: 10, text: 'Er betet nach oben. Niemand antwortet, aber er wird härter: +10 Abwehr.' }, schlag('Ernte', 160, [2200], { nerves: 20 })] },
    on_win: {}, lose_money: 0, lose_to: { map: 'bh_kutschenhof', spawn: 'default' },
    win_text: 'Der Sammler fällt gegen die Rohre. „Er wird es merken“, flüstert er. „Wenn die Leitung kalt bleibt, merkt er es. Dann kommt er nicht mehr herunter, um zu ernten. Dann musst du hinauf.“',
    lose_text: 'Du wachst am Kutschenhof auf, in eine Wärmedecke gewickelt. Jemand hat dir Sud eingeflößt. Er schmeckt nach Licht.',
    flee_text: 'Du ziehst dich zwischen die Rohre zurück. Die Kapsel schwappt weiter.',
  };
}

const LEITUNG_TEXT = 'Hinter der Verteilanlage läuft ein Rohr nicht in die Gewächshäuser, sondern senkrecht nach oben, durch das Dach, in den Nebel. Es ist warm wie ein Körper. Auf einem Messingschild steht: CALDERWICK, KRONENARCHIV, OBEN.\n\nDas also ist die Kur. Was Greavesend den Patienten nimmt, ist kein Fieber und keine Trauer. Es ist ihr Gewicht. Es wird gekocht, abgefüllt und die Linie hinaufgeschickt, an Calderwick vorbei, bis zu Starling. Er braucht es, um oben zu bleiben.';

export function applyBriarholtStory(content) {
  content.encounters[K5S_SAMMLER] = sammlerKampf();
  content.loot[K5S_SAMMLER] = { money: [12000, 12000], drops: [] };

  // Briarholt auf Sequenz 3: stärkere Gegner (nach der Untergrenze und dem Kapitel-Schaden) und dichter besetzt
  for (const e of Object.values(content.encounters)) {
    if (!/^bh_/.test(e.zone ?? '') || e.bh_seq3) continue;
    // Bosse etwas weniger, sonst schafft selbst ein Engel den Glasgärtner nicht mehr (tests/halbgott.test.js)
    Object.assign(e, { bh_seq3: true, hp_floor_mult: e.boss ? BH_SEQ3.boss_hp_floor_mult : BH_SEQ3.hp_floor_mult, dmg_mult: e.boss ? BH_SEQ3.boss_dmg_mult : BH_SEQ3.dmg_mult });
  }
  for (const [mid, m] of Object.entries(content.maps)) {
    if (m.city !== 'briarholt' || !(m.danger >= 5) || !m.roamers?.length) continue;
    const pool = [...new Set(m.roamers.filter((r) => !r.bn).map((r) => r.encounter))].filter((id) => !content.encounters[id]?.boss);
    if (!pool.length) continue;
    const ziel = BH_SEQ3.dichte + (mid.endsWith('__warm') ? 2 : 0); // warm ist belebter als kalt
    for (let i = m.roamers.length; i < ziel; i++) {
      const tile = freieKachel(m, { seed: `bh_dichte|${mid}|${i}`, minDist: 10 });
      if (tile) m.roamers.push({ id: `${mid}_k5s${i}`, encounter: pool[i % pool.length], tile, elite_chance: 0.15 });
    }
  }

  // Anreise: Platzhalter-Beschriftungen der Codex-Stationen
  for (const m of Object.values(content.maps)) for (const it of m.interactables ?? []) {
    if (it.id === 'bha_ankunft_station') Object.assign(it, { prompt: 'Der Heizer am Dampfrohr', marker: true });
    if (it.id === 'bha_reise_station') it.prompt = 'Die Kutsche nach Briarholt';
  }

  // Die Linie in beide Richtungen
  for (const mid of ['bh_kutschenhof', 'bh_kutschenhof__warm']) {
    const m = content.maps[mid];
    if (!m) continue;
    const t = freieKachel(m, { near: m.spawns?.kutsche ?? m.spawns?.default });
    m.interactables.push({ id: 'k5s_linie_hoch', kind: 'read', tile: t, prompt: 'Die Linie hinauf nach Calderwick', title: 'Die Linie nach Calderwick', marker: true,
      visible_if: { requires_flags: ['k5_arrived'] },
      text: 'Der Frachtzug fährt leer zurück hinauf nach Calderwick. Wer will, sitzt auf einer Kiste mit.', effects: { travel: { map: 'cw_kronenarchiv', spawn: 'default' } } });
  }
  const archiv = content.maps.cw_kronenarchiv;
  const linie = archiv?.interactables.find((i) => i.id === 'k4s_linie');
  if (archiv && linie) archiv.interactables.push({ id: 'k5s_linie_runter', kind: 'read', tile: linie.tile, prompt: 'Die Linie nach unten', title: 'Die Linie nach Briarholt', marker: true,
    visible_if: { requires_flags: ['k4s_linie'] }, text: 'Der Frachtzug rollt hinunter nach Briarholt. Die Kisten sind leer, seit Wetherby nicht mehr erntet.',
    effects: { travel: { map: 'bh_kutschenhof', spawn: 'kutsche' } } });

  // Nachspiel an der Verteilanlage: die Leitung nach oben und der Sammler der Linie
  for (const mid of ['bh_verteilanlage', 'bh_verteilanlage__warm']) {
    const m = content.maps[mid];
    if (!m) continue;
    const t1 = freieKachel(m, { seed: 'k5s_leitung', minDist: 4 });
    m.interactables.push({ id: 'k5s_leitung', kind: 'read', tile: t1, prompt: 'Ein Rohr, das nach oben führt', title: 'Die Leitung nach oben', marker: true,
      visible_if: { requires_flags: ['k5_arrived'] }, done_flag: 'k5s_leitung', text: LEITUNG_TEXT });
    const t2 = freieKachel(m, { near: t1 });
    m.interactables.push({ id: 'k5s_sammler', kind: 'combat', encounter: K5S_SAMMLER, tile: t2, prompt: 'Der Sammler der Linie', marker: true,
      visible_if: { requires_flags: ['k5s_leitung', 'kapitel5_done'], hide_if_flags: [`won_${K5S_SAMMLER}`] } });
    const t3 = freieKachel(m, { near: t2 });
    m.interactables.push({ id: 'k5s_zug2', kind: 'read', tile: t3, prompt: 'Die kalte Leitung', title: 'Die Leitung bleibt kalt', marker: true,
      visible_if: { requires_flags: [`won_${K5S_SAMMLER}`] }, done_flag: 'k5s_leitung_kalt',
      text: 'Du drehst das Ventil zu. Das Rohr wird kalt, von unten nach oben, so langsam, dass du zusehen kannst. Irgendwo über Calderwick, über den Wolken, sitzt jetzt ein Mann auf den Stufen eines Thrones und friert.\n\nEr wird nicht mehr herunterkommen. Wenn du ihn willst, musst du hinauf. Als Heiliger verbrennst du dort noch. Als Engel vielleicht nicht.\n\n(Der zweite Aufstieg ist noch nicht gebaut.)' });
  }
  content.cases = [...(content.cases ?? []).filter((c) => c.id !== 'kapitel5_kur'), { id: 'kapitel5_kur', title: 'Kapitel 5: Die Kur der Gefallenen' }];
  content.quests.k5_kur = {
    title: 'Kapitel 5: Die Kur der Gefallenen', kind: 'main', case: 'kapitel5_kur',
    summary: 'Wetherbys Kisten gingen die Linie hinunter nach Briarholt, in die Kur. Dort wird den Gefallenen etwas entnommen, und es geht wieder hinauf, zu Starling. Finde heraus, was, und dreh es ab.',
    steps: [
      { text: 'Folge dem Heizer Frost am Kutschenhof', done: { requires_flags: ['k5_arrived'] }, target: { map: 'bh_kutschenhof', id: 'bha_ankunft_station', label: 'Kutschenhof' } },
      { text: 'Finde heraus, wohin die Kur das Entnommene schickt', done: { requires_flags: ['k5s_leitung'] }, target: { map: 'bh_verteilanlage', id: 'k5s_leitung', label: 'Verteilanlage' } },
      { text: 'Bring die Klinik zu Fall (Akten von Briarholt)', done: { requires_flags: ['kapitel5_done'] } },
      { text: 'Halte den Sammler der Linie auf', done: { requires_flags: [`won_${K5S_SAMMLER}`] }, target: { map: 'bh_verteilanlage', id: 'k5s_sammler', label: 'Verteilanlage' } },
      { text: 'Dreh die Leitung nach oben ab', done: { requires_flags: ['k5s_leitung_kalt'] }, target: { map: 'bh_verteilanlage', id: 'k5s_zug2', label: 'Verteilanlage' } },
    ],
  };
  const gossip = content.gossip?.briarholt;
  if (gossip) for (const map of Object.keys(gossip)) gossip[map] = [...gossip[map],
    { text: 'Aus Calderwick kommen sie in Kisten und gehen in Kapseln. Dazwischen nennt man es Kur.', requires_flags: ['k5_arrived'] },
    { text: 'Hinter der Verteilanlage geht ein Rohr nach oben. Im Winter wärmen sich die Kutscher daran. Keiner fragt, warum es warm ist.', requires_flags: ['k5_arrived'] }];
  return content;
}
