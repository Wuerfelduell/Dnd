/**
 * Seb 2026-11-27: „Die Kapitel-4-Akte als große Nebenquest wieder einbauen.“
 *
 * Nebenakte „Die Stadt ohne Unterschrift“ (Codex CC/CF, 5 Akte mit je 4 Fährten, Bürgen und Abgleich, 4 Enden). Die Rohpakete bereitet
 * nebenakteCw.js vor; hier wird sie an die Hauptstory „Die Ernte der Gefallenen“ (calderwickStory.js) angeschlossen, ohne ihr zu
 * widersprechen:
 *
 * - Ida verschwindet ein zweites Mal. Erst wenn du sie aus der Kiste in der Sortiergrube geholt hast (`k4s_ida`), deckt Noel eines
 *   Morgens wieder zwei Teller: Ida wollte mit dem Pendelzug fort und kam am Bahnhof nie an, und Mietvertrag, Lohnbuch und
 *   Heiratsurkunde behaupten, es habe sie nie gegeben. Das ist nicht die Ernte (Starlings Geschäft), sondern Wetherbys eigenes Werk:
 *   die Sammelurkunde. Noel startet die Akte (`cwa_akte_offen`, Auftrag `cwa_akt1`); Klammer erklärt den Unterschied.
 * - Solange Ida gefangen ist (`cwa_ida_fort`), fehlt sie in der Küche; sie steht hinter Glas in Sortierhalle bzw. Archivsaal, bis Akt IV
 *   sie befreit (`cwa_ida_frei`).
 * - Wetherby bleibt nach seiner Niederlage als gefallener Engel in der Druckkammer sitzen: „Der Engel ist besiegt, der Direktor nicht.“
 *   (Akt III der Akte zeigt, dass ihn nur noch sein Titel zusammenhält.) So bleibt das Verhör in Akt V möglich, egal in welcher
 *   Reihenfolge man Hauptstory und Nebenakte spielt.
 * - Folgen der vier Enden: Ida, Noel, Klammer und Wetherby sprechen danach darüber, Calderwick redet (Gerede), dazu wie bisher
 *   Epiloge, „Calderwicker Anzeiger“ und die Reaktionen in Briarholt (k5-Pakete, `cwa_end_*`).
 * Koop: alles hängt an gemeinsamen Flags, jede Zeile funktioniert mit einem oder zwei Spielern.
 */
import { AKTE_OFFEN } from './nebenakteCw.js';
import { K4S_WETHERBY } from './calderwickStory.js';

export const IDA_FORT = 'cwa_ida_fort';
export const ENDEN = ['widerspruch', 'amtsinhaber', 'buecher', 'ordnung'];

const START_TEXT = 'Noel hat zwei Teller gedeckt. Der zweite ist voll und kalt.\n\n„Sie wollte nur weg“, sagt er. „Nach der Kiste. Mit dem Pendelzug nach Dunscar, heute früh. Sie ist am Bahnhof nie angekommen.“ Er schiebt dir drei Papiere hin: Mietvertrag, Lohnbuch, Heiratsurkunde. Auf allen dreien ist eine Zeile leer, als hätte es dort nie einen Namen gegeben.\n\n„Das Archiv sagt, ich war nie verheiratet. Ich habe trotzdem für zwei gekocht.“ Er sieht auf den Teller. „Klammer kennt sie länger als ich. Frag Klammer.“';
const KLAMMER_TEXT = 'Klammer legt die drei Papiere nebeneinander und fährt mit dem Daumen über die leeren Zeilen.\n\n„Das war nicht die Ernte“, sagt sie. „Die Ernte stempelt Kisten. Das hier stempelt Menschen weg. Wetherby macht beides, aber nur eins davon für Starling. Das andere ist sein eigenes Werk: eine Sammelurkunde. Eine einzige Unterschrift für die ganze Stadt, und wer sich nicht fügt, fällt aus den Büchern.“\n\nSie öffnet die Werkstatt ganz. „Ida hat Korrekturfahnen für das Archiv gesetzt. Sie hat den Fehler gefunden. Darum ist sie weg. Vier Fährten fürs Erste: der Bahnhof, Noels Küche, die Leerfracht am Röhrenhof und die Alte Setzerei.“';
const IDA_GEFANGEN = '„Nicht so laut.“ Ida steht hinter beschlagenem Glas, die Hände voller Druckerschwärze. „Er braucht mich, solange der Satz nicht fertig ist. Sag Klammer, ich setze langsam. Und sag Noel, er soll nicht für zwei kochen. Er tut es trotzdem, ich weiß.“';

/** Danach: je Ende ein Satz von Ida, Noel, Klammer und Wetherby. */
const NACHHER = {
  widerspruch: {
    ida: '„Ich stehe wieder in drei Büchern, und in keinem gleich. Das gefällt mir. Gleich war das Problem.“',
    noel: '„Zwei Teller. Und zum ersten Mal isst jemand vom zweiten.“ Er lacht, dann muss er sich setzen.',
    klammer: '„Die Stadt hat widersprochen. Laut, schief und jeder für sich. So klingt eine Stadt, die lebt.“',
    wetherby: '„Festgesetzt, in meiner eigenen Druckkammer.“ Wetherby legt den Federhalter weg, als wäre er schwer. „Jemand hat für mich gebürgt. Ich weiß nicht, ob ich ihm das verzeihe.“',
    gerede: ['Auf dem Markt hängen drei Fassungen derselben Geschichte. Keine stimmt ganz. Darum glaubt man allen dreien.', 'Wetherby sitzt unten in der Druckkammer fest. Die Presse steht. Man hört ihn manchmal Namen aufsagen, einen nach dem anderen.'],
  },
  amtsinhaber: {
    ida: '„Direktor.“ Ida sagt das Wort, als korrigiere sie einen Satzfehler. „Ich unterschreibe dir nichts. Aber ich lese alles, was du unterschreibst.“',
    noel: '„Du sitzt jetzt oben im Archiv. Komm trotzdem zum Essen. Wer dort oben nicht mehr isst, wird wie er.“',
    klammer: '„Du hast seinen Stuhl. Nicht seine Ausrede.“ Klammer legt dir eine Liste einzelner Fragen hin, jede auf einem eigenen Blatt.',
    wetherby: '„Sie tragen jetzt meinen Titel“, sagt Wetherby. „Mich hält nur noch, was ich oben war. Es ist erstaunlich wenig.“',
    gerede: ['Neuer Direktor im Kronenarchiv. Einer von oben, sagen sie. Hoffentlich bleibt er lieber schwer als ordentlich.', 'Seit der neue Amtsinhaber da ist, kommt jeder Bescheid mit einer leeren Zeile für den Widerspruch.'],
  },
  buecher: {
    ida: '„Die Liste ist leer. Nicht gelöscht. Leer.“ Ida streicht über das Papier. „Alle sind gefahren. Ich bleibe, bis die letzte Küche ausgekühlt ist.“',
    noel: '„Die Witwenterrasse ist still. Ich koche trotzdem. Irgendwer fällt immer von oben, und der hat dann Hunger.“',
    klammer: '„Die zweite Werkstatt am Ausweichbahnhof läuft. Die hier bleibt deine. Einer muss ja hierbleiben und schwer werden.“',
    wetherby: '„Die Presse steht still“, sagt Wetherby. „Und die Stadt läuft mir davon, Haushalt für Haushalt. Ordentlicher wäre es gewesen, sie zu behalten.“',
    gerede: ['Halbe Witwenterrasse leer. Die Leute sind mit der Frachtbahn fort, mit Namen auf dem Fahrschein. Jeder mit seinem eigenen.', 'Die große Presse unter dem Archiv steht. Zum ersten Mal seit Jahren kann man oben im Lesesaal schlafen.'],
  },
  ordnung: {
    ida: 'Ida sieht dich an und sagt nichts. Unter der Sammelurkunde ist ihre Zeile leer, und sie wird es bleiben.',
    noel: 'Noel deckt zwei Teller. „Für den Adressaten Calderwick“, sagt er tonlos, und schöpft zweimal.',
    klammer: '„Ordentlich“, sagt Klammer. „Jede Tür hat ein Schild. Hinter keiner wohnt mehr jemand Bestimmtes.“',
    wetherby: '„Ich danke Ihnen“, sagt Wetherby, „im Namen der Bürgerschaft.“ Er lächelt. Es ist das erste Mal, dass er dabei nicht allein klingt.',
    gerede: ['Alle Post kommt jetzt an. An die Bürgerschaft Calderwick. Keiner weiß mehr, wer sie aufmachen darf.', 'Wenn man im Nullfundament ruft, antwortet die ganze Stadt. Mit einer Stimme. Ich geh da nicht mehr runter.'],
  },
};

const hubOf = (content, npcId) => {
  const npc = content.npcs[npcId];
  const d = npc && content.dialogues[npc.dialogue];
  return d?.nodes?.hub ? d : null;
};
const vorne = (d, ...choices) => { d.nodes.hub.choices = [...choices, ...d.nodes.hub.choices]; };
const zurueck = [{ text: 'Noch eine Frage.', next: 'hub' }, { text: 'Danke.', next: 'abschied' }];
const nachherChoices = () => ENDEN.map((e) => ({ text: 'Wie geht es jetzt weiter?', next: `cwa_nachher_${e}`, requires_flags: [`cwa_end_${e}`] }));
const nachherNodes = (wer, choices = zurueck) => Object.fromEntries(ENDEN.map((e) => [`cwa_nachher_${e}`, { text: NACHHER[e][wer], choices }]));

/** Alle Stellen, die Ida befreien, holen sie auch in die Küche zurück. */
function idaZurueck(content) {
  const fix = (eff) => { if (eff?.sets_flags?.includes('cwa_ida_frei')) eff.clears_flags = [...new Set([...(eff.clears_flags ?? []), IDA_FORT])]; };
  for (const d of Object.values(content.dialogues)) for (const n of Object.values(d.nodes ?? {})) fix(n);
  for (const m of Object.values(content.maps)) for (const i of m.interactables ?? []) fix(i.effects);
  for (const q of Object.values(content.quests)) fix(q.reward);
  for (const e of Object.values(content.endings ?? {})) fix(e);
}

export function applyCalderwickAkte(content) {
  if (!content.quests.cwa_akt1) return content;

  // Start bei Noel: Ida ist wieder weg
  const noel = hubOf(content, 'cw_noel_bellcross');
  if (noel) {
    vorne(noel, { text: 'Wo ist Ida?', next: 'cwa_neben_start', requires_flags: ['k4s_ida'], hide_if_flags: [AKTE_OFFEN] });
    noel.nodes.cwa_neben_start = { text: START_TEXT, scene: 'cw_zwei_teller', sets_flags: [AKTE_OFFEN, IDA_FORT], start_quests: ['cwa_akt1'],
      choices: [{ text: 'Ich finde sie. Noch einmal.', next: 'hub' }] };
    noel.nodes.hub.choices.push(...nachherChoices());
    Object.assign(noel.nodes, nachherNodes('noel'));
  }
  // Klammer: Ernte und Sammelurkunde sind zwei verschiedene Dinge
  const klammer = hubOf(content, 'cw_crayford');
  if (klammer) {
    vorne(klammer, { text: 'Ida ist wieder verschwunden.', next: 'cwa_neben_klammer', requires_flags: [AKTE_OFFEN], hide_if_flags: ['cwa_neben_klammer'] });
    klammer.nodes.cwa_neben_klammer = { text: KLAMMER_TEXT, sets_flags: ['cwa_neben_klammer'], choices: [{ text: 'Dann fangen wir an.', next: 'hub' }] };
    klammer.nodes.hub.choices.push(...nachherChoices());
    Object.assign(klammer.nodes, nachherNodes('klammer'));
  }

  // Ida: in der Küche erst wieder, wenn sie frei ist; solange sie gefangen ist, ein eigener Gruß hinter Glas
  const kueche = content.maps.cw_kueche;
  for (const n of kueche?.npcs ?? []) if (n.id === 'cw_ida_bellcross' && !n.visible_if?.requires_flags?.some((f) => f.startsWith('cwa_'))) {
    n.visible_if = { ...(n.visible_if ?? {}), hide_if_flags: [...new Set([...(n.visible_if?.hide_if_flags ?? []), IDA_FORT])] };
  }
  const ida = content.dialogues[content.npcs.cw_ida_bellcross?.dialogue];
  if (ida?.nodes?.start) {
    ida.start = [{ node: 'cwa_gefangen', requires_flags: [IDA_FORT] }, { node: typeof ida.start === 'string' ? ida.start : 'start' }];
    ida.nodes.cwa_gefangen = { text: IDA_GEFANGEN, choices: [{ text: 'Halt durch.' }] };
    const folge = content.dialogues.bj_cw_ida_bellcross?.nodes?.cwa_folge_cw_ida_bellcross;
    const extra = [];
    if (folge) {
      ida.nodes.cwa_folge_cw_ida_bellcross = { ...folge, choices: [{ text: 'Noch etwas.', next: 'start' }] };
      extra.push({ text: 'Den öffentlich verratenen Kontakt persönlich wieder sichern.', next: 'cwa_folge_cw_ida_bellcross', requires_flags: ['cwa_akt4_done', 'cwa_verraten_cw_ida_bellcross'], hide_if_flags: ['cwa_folge_cw_ida_bellcross_gesichert'] });
    }
    Object.assign(ida.nodes, nachherNodes('ida', [{ text: 'Noch etwas.', next: 'start' }]));
    const ende = ida.nodes.start.choices.filter((c) => !c.next);
    ida.nodes.start.choices = [...ida.nodes.start.choices.filter((c) => c.next), ...extra, ...nachherChoices(), ...ende];
  }
  idaZurueck(content);

  // Wetherby: nach seiner Niederlage bleibt er in der Druckkammer (Titel statt Engel); Villa wie bisher
  for (const n of content.maps.cw_druckkammer?.npcs ?? []) if (n.id === 'cw_wetherby' && n.visible_if?.hide_if_flags) {
    n.visible_if.hide_if_flags = n.visible_if.hide_if_flags.filter((f) => f !== `won_${K4S_WETHERBY}`);
    if (!n.visible_if.hide_if_flags.length) delete n.visible_if.hide_if_flags;
  }
  const wetherby = hubOf(content, 'cw_wetherby');
  if (wetherby) {
    wetherby.nodes.hub.choices.splice(1, 0, { text: 'Sie sind noch hier?', next: 'cwa_wetherby_titel', requires_flags: [`won_${K4S_WETHERBY}`] }, ...nachherChoices());
    wetherby.nodes.cwa_wetherby_titel = { text: 'Wetherby sortiert einen Stapel, den du ihm vor die Füße geschlagen hast. „Der Engel ist besiegt“, sagt er. „Der Direktor nicht. Ein Amt fällt nicht, nur weil sein Inhaber verliert. Fragen Sie Ihre Buchbinderin, was mich noch zusammenhält. Sie wird es Ihnen nicht gern erklären.“', choices: zurueck };
    Object.assign(wetherby.nodes, nachherNodes('wetherby'));
  }

  // Briarholts Briefe zu den Enden (k5_akte) bieten eine eigene Reise nach Briarholt an. Die gehört der Hauptstory (Linie nach unten):
  // erst nach dem Kapitelende, sonst würde die Nebenakte Kapitel 4 überspringen. Die warmen Sendungen zum Lesen bleiben sofort.
  for (const i of content.maps.cw_buchbinderei?.interactables ?? []) if (/^bha_anreise_\w+_brief$/.test(i.id)) {
    i.visible_if = { ...(i.visible_if ?? {}), requires_flags: [...new Set([...(i.visible_if?.requires_flags ?? []), 'kapitel4_done'])] };
  }

  // Calderwick redet über das Ende
  const gossip = content.gossip?.calderwick;
  if (gossip) for (const map of Object.keys(gossip)) gossip[map] = [...gossip[map], ...ENDEN.flatMap((e) => NACHHER[e].gerede.map((text) => ({ text, requires_flags: [`cwa_end_${e}`] }))),
    { text: 'Noel Bellcross deckt wieder zwei Teller. Seine Frau ist zum zweiten Mal weg, und diesmal sagen die Bücher, es hätte sie nie gegeben.', requires_flags: [AKTE_OFFEN], hide_if_flags: ['cwa_ida_frei'] }];

  // Fallakte im Notizbuch: „Die Stadt ohne Unterschrift“ als Nebenakte
  const fall = content.cases?.find((c) => c.id === 'cwa_kapitel4');
  if (fall) fall.title = 'Nebenakte: Die Stadt ohne Unterschrift';
  return content;
}
