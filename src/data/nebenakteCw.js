/**
 * Seb 2026-11-27: „Die Kapitel-4-Akte als große Nebenquest wieder einbauen.“
 *
 * Die Detektivgeschichte „Die Stadt ohne Unterschrift“ (Codex CC, Pakete k4_akte + k4_nebenquests) war seit PR #422 als Hauptstory
 * gestrichen: ihre Stationen wurden entfernt, ihre Akt-Flags beim Sturz einfach gesetzt. Jetzt ist sie eine optionale Nebenakte
 * neben der Hauptstory „Die Ernte der Gefallenen“ (calderwickStory.js). Diese reinen Datenfunktionen bereiten die Rohpakete vor,
 * bevor applyQuestPack sie einbaut (runde8.js); das Einhängen in die Welt macht data/calderwickAkte.js.
 *
 * - Die Akte öffnet nicht mehr mit der Ankunft (k4_arrived), sondern mit `cwa_akte_offen` (Noel fragt nach Ida, siehe calderwickAkte.js).
 * - Ihre Enden beenden nicht mehr Kapitel 4: statt `kapitel4_done` setzen sie `cwa_akte_fertig` (+ wie bisher `cwa_end_<ende>`).
 * - Anreise aus Dunscar (Speisewagen-Papiere, Pfiff) fällt weg: nach Calderwick kommt man nur noch durch den Sturz.
 * - Ersatzkerne Seq 3/2/1 an den Bossen fallen weg (Kernzutat 3 gibt es nur beim Oberhaupt, 2/1 nur im Pfadviertel und später).
 * - Die Orte (k4_orte) hängen nicht mehr an Akt-Flags: Terrassen, Türen und Figuren der Hauptstory sind ab dem Sturz offen.
 */

export const AKTE_OFFEN = 'cwa_akte_offen';
export const AKTE_FERTIG = 'cwa_akte_fertig';

const tauschen = (o, map) => {
  if (Array.isArray(o)) return o.map((x) => tauschen(x, map));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, tauschen(v, map)]));
  return typeof o === 'string' && Object.hasOwn(map, o) ? map[o] : o;
};
const FLAG_LISTEN = new Set(['requires_flags', 'hide_if_flags', 'sets_flags', 'clears_flags']);
const dedupe = (o) => {
  if (Array.isArray(o)) return o.map(dedupe);
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, FLAG_LISTEN.has(k) && Array.isArray(v) ? [...new Set(v)] : dedupe(v)]));
  return o;
};

/** Belohnungen auf Calderwick-Niveau (die Codex-Werte stammen aus Kettlegate-Zeiten: 25 Schilling). */
const AKT_GELD = { cwa_akt1: 3000, cwa_akt2: 4000, cwa_akt3: 5000, cwa_akt4: 6000 };
const ENDE_LOHN = {
  cwa_widerspruch: { gives_money: 10000, honor: 15 },
  cwa_buecher: { gives_money: 8000, honor: 5 },
  cwa_amtsinhaber: { gives_money: 4000, honor: 0 },
  cwa_ordnung: { honor: 0 },
};

/**
 * Texte, die nach dem Umbau nicht mehr stimmen. Die Stadt bleibt bestehen (Calderwick ist der Ort der Hauptstory und deine Bleibe),
 * und Wetherby ist zugleich der gefallene Engel der Hauptstory.
 */
export const AKTE_TEXTE = {
  'Du verteilst die Bürgschaften und trennst die Hauptleitung. Calderwick bleibt mit Lücken bestehen, die örtliche Öffnung schließt. Wetherby wird festgesetzt; seine persönliche Bürgschaft und seine Verantwortung bleiben getrennte Fragen. Unter Wexmoor und Kettlegate ist der Hunger damit nicht überall besiegt.':
    'Du verteilst die Bürgschaften und trennst die Hauptleitung. Calderwick bleibt mit Lücken bestehen, die örtliche Öffnung schließt. Wetherby bleibt in seiner Druckkammer festgesetzt, ohne Presse und ohne Rohrpost; seine persönliche Bürgschaft und seine Verantwortung bleiben getrennte Fragen. Unter Wexmoor und Kettlegate ist der Hunger damit nicht überall besiegt.',
  'Du legst die Presse still und evakuierst die Menschen etappenweise über die gesicherte Frachtbahn. Niemand bleibt als Brennstoff zurück. Ohne vollständiges Zeugennetz bleiben manche Beziehungen verloren, und Calderwick als Ort verfällt. Klammer eröffnet ihre Werkstatt am ersten Ausweichbahnhof.':
    'Du legst die Presse still und bringst jeden Haushalt auf Wetherbys Liste etappenweise über die gesicherte Frachtbahn hinaus. Niemand bleibt als Brennstoff zurück. Ohne vollständiges Zeugennetz bleiben manche Beziehungen verloren, und auf der Witwenterrasse stehen die Küchen leer. Klammer eröffnet eine zweite Werkstatt am ersten Ausweichbahnhof; die Buchbinderei bleibt deine Bleibe.',
  'Klammer hängt ihre Buchklammer an eine neue Tür. Bett, Ofen und einzelne Buchlagen passen in einen kleineren Raum. Der alte Unterschlupf wird nicht als Strafe zurückbehalten. Er ist mit seinen Menschen weitergezogen.':
    'Klammer hängt eine zweite Buchklammer an eine neue Tür am Ausweichbahnhof. Bett, Ofen und einzelne Buchlagen passen in einen kleineren Raum. Die alte Werkstatt lässt sie dir. „Einer muss ja hierbleiben und schwer werden“, sagt sie.',
  'Die Standseilbahn bewegt sich noch einmal im Wind. Ohne neue Sammelbefehle steht die Presse still, doch Calderwick verfällt als Ort. Die geretteten Menschen sprechen schon über den nächsten Bahnhof. Sie müssen ihre Stadt nicht bewohnen, um einmal dort gelebt zu haben.':
    'Die Standseilbahn bewegt sich noch einmal im Wind. Ohne neue Sammelbefehle steht die Presse still, aber die Häuser auf der Liste bleiben leer. Die geretteten Menschen sprechen schon über den nächsten Bahnhof. Sie müssen ihre Stadt nicht bewohnen, um einmal dort gelebt zu haben.',
  'Der Eingriff ist abgeschlossen. Hauptbeweise bleiben zugänglich; eine bereits gesicherte Kernzutat wird nicht doppelt ausgegeben. Die Bergungsstelle kann separat geprüft werden.':
    'Der Eingriff ist abgeschlossen. Hauptbeweise bleiben zugänglich.',
  '4 · Sechs leere Terrassen': '4 · Leere Häuser',
  'Eingriff prüfen: bleisammler': 'Eingriff prüfen: Bleisammler',
  'Eingriff prüfen: blinder zusteller': 'Eingriff prüfen: Blinder Zusteller',
  'Eingriff prüfen: nullfundament': 'Eingriff prüfen: Nullfundament',
};
const textTausch = (o) => {
  if (Array.isArray(o)) return o.map(textTausch);
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, textTausch(v)]));
  if (typeof o !== 'string') return o;
  return (AKTE_TEXTE[o] ?? o).replace('Klammer legt 25 Schilling auf den Tisch.', 'Klammer legt 3.000 Schilling auf den Tisch.');
};

/** k4_akte (CC): von der Hauptstory zur Nebenakte. */
export function nebenakteK4(pack) {
  const tausch = { k4_arrived: AKTE_OFFEN, kapitel4_done: AKTE_FERTIG };
  const kern = /_kern_(station|dialog)$/;
  const platzierung = pack.platzierung
    .filter((p) => p.map !== 'ds_speisewagen' && !kern.test(p.interactable?.id ?? '') && p.interactable?.id !== 'cwa_ankunft_station')
    // Figuren bleiben, wie sie sind (die Hauptstory braucht sie ab dem Sturz); nur Stationen und Spuren warten auf die Akte
    .map((p) => (p.npc ? p : tauschen(p, tausch)));
  const dialogues = Object.fromEntries(Object.entries(pack.dialogues).filter(([id]) => !kern.test(id) && id !== 'cwa_ankunft'));
  const { k3a_pfiff, ...zusaetze } = pack.dialog_zusaetze; // Anreise aus Dunscar: gibt es nicht mehr
  const quests = Object.fromEntries(Object.entries(tauschen(pack.quests, tausch)).map(([id, q]) => [id, {
    ...q, kind: 'side', reward: { ...(q.reward ?? {}), ...(AKT_GELD[id] ? { gives_money: AKT_GELD[id] } : {}) },
  }]));
  const kase = tauschen(pack.case, tausch);
  kase.endings = Object.fromEntries(Object.entries(kase.endings).map(([id, e]) => {
    const { chapter, ...rest } = e; // kein Kapitelende-Bild: Kapitel 4 endet weiter mit der Linie nach Briarholt
    return [id, { ...rest, ...(ENDE_LOHN[id] ?? {}) }];
  }));
  return textTausch(dedupe({
    ...pack, platzierung, dialogues, quests, case: kase,
    dialog_zusaetze: tauschen(zusaetze, tausch),
    zeitung: tauschen(pack.zeitung, tausch), epiloge: tauschen(pack.epiloge, tausch), boss_texte: tauschen(pack.boss_texte, tausch),
  }));
}

/** k4_nebenquests (CF): die Nebenaufträge hängen an der Nebenakte; nach ihrem Ende statt nach dem Kapitelende. */
export function nebenquestsZurAkte(pack) {
  return dedupe(tauschen(pack, { kapitel4_done: AKTE_FERTIG }));
}

/** k4_orte (CD): Terrassen, Gebiete, Türen und Figuren ab dem Sturz offen, nicht erst nach Akt I bis IV. */
export function orteOhneAkte(pack) {
  const tausch = { cwa_akt1_done: 'k4_arrived', cwa_akt2_done: 'k4_arrived', cwa_akt3_done: 'k4_arrived', cwa_akt4_done: 'k4_arrived' };
  // Wetherby in der Villa gehört zur Akte (Akt III); in der Druckkammer steht er für die Hauptstory
  const platzierung = pack.platzierung.map((p) => (p.npc === 'cw_wetherby' && p.map === 'cw_villa' ? p : tauschen(p, tausch)));
  return dedupe({ ...pack, travel: tauschen(pack.travel, tausch), zones: tauschen(pack.zones, tausch), maps: tauschen(pack.maps, tausch), platzierung });
}
