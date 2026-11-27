/**
 * Kapitel 6: Der zweite Aufstieg (Seb 2026-11-26, Konzept „Nach Dunscar: Der Aufstieg“, mit Platzhalter-Grafiken gebaut).
 *
 * - Die Narbe: Wer oben verbrannt wurde (Flag `auf_verbrannt`), trägt für immer eine Narbe aus Licht. Die Wesen von oben
 *   (`himmel: true`) erkennen sie: Man trifft sie härter (core/Narbe.js: NARBE.schaden), sie treffen einen aber auch härter (NARBE.erlitten).
 *   Anzeige im Pfad-Tab (Ui.narbeHtml) und als schwacher Lichtstrich an der Figur (WorldScene.tickNarbe).
 * - Neue Rollen für die neun Calderwick-Leute aus Codex CN (cwn_*): Sie sind Gefallene (oder Kinder von Gefallenen) und
 *   können für dich bürgen. Jede Unterschrift hängt an etwas, das sie selbst gesehen haben (Ida befreit, Wetherby gestellt …).
 *   Sie bleiben nach Kapitel 4 in der Stadt.
 * - Der zweite Zug am Kronenarchiv: Fünf Bürgschaften, dann der Schaffner ohne Gesicht. Er ist ein höheres Wesen (min_seq 3):
 *   Wer schwächer als ein Heiliger ist, kratzt ihn nur (SEQ_WARD_MULT). Keine Sequenz-Abfrage, sondern ein Kampf (Seb 2026-11-13).
 *   Im Koop gemeinsam, mitfahren darf nur, wer am Ende steht (sieg_flag wie beim ersten Schaffner).
 * - Die Himmelsstadt, zweiter Besuch (eigene Karte HIMMEL2, gleicher Grundriss): Diesmal fällt dort jeder, auch du. Vorhof
 *   (Halbgötter, für Heilige schaffbar), Höfe (Heilige, ebenbürtig), Grat (Engel, min_seq 2) und Starling (min_seq 2).
 *   Eine Niederlage verbrennt nicht mehr das Kapitel, man fällt nur wieder nach Calderwick und darf erneut hinauf.
 * - Starling besiegt: Er fällt, wie er vor 41 Jahren fiel, und landet in Veras Fallbuch. Der Thron schickt dich hinunter,
 *   nicht verbrannt, sondern entlassen. Darüber steht nur noch Sequenz 0 (offen, Seb 2026-11-12).
 */
import { freieKachel } from './calderwickStory.js';
import { HIMMEL, STURZ_ZIEL } from './aufstieg.js';
import { NARBE_FLAG } from '../core/Narbe.js';

export const HIMMEL2 = 'hs_himmelsstadt2';
export const K6_QUEST = 'k6_aufstieg2';
export const SCHAFFNER2 = 'k6_schaffner2';
export const K6_STARLING = 'hs2_starling';
export const K6_ENDE_FLAG = 'kapitel6_done';
export const K6_BUERGEN_NOETIG = 5;

const PFADE = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr'];
const schlag = (name, damage, hits, extra = {}) => ({ name, damage, hits, ...extra });


// ---------------------------------------------------------------------------------------------------------------------
// Die Bürgen: neue Rollen für die Calderwick-Leute aus Codex CN

const KG = ['k4s_kg_aschmann', 'k4s_kg_vell', 'k4s_kg_dorn', 'k4s_kg_hollin'];
/**
 * Je Figur: neue Rolle, Gruß, was sie tut, was sie von oben weiß, und wofür sie bürgt (Bedingung + Text, wenn sie es noch nicht sieht).
 */
export const BUERGEN = {
  cwn_aufzugswaerter: { role: 'Aufzugswärter am Gleisfuß. Fiel vor zwanzig Jahren als Halbgott der Uhr.',
    gruss: 'Silas hält die Bremskurbel mit beiden Händen. „Ich war einmal schneller als dieser Aufzug. Jetzt warte ich auf ihn, wie alle anderen.“',
    arbeit: '„Ich kurble die Gefallenen von der Aufschlagstelle hinauf in die Stadt. Wer zum ersten Mal fährt, schaut nach oben. Wer zum zweiten Mal fährt, schaut auf seine Schuhe.“',
    oben: '„Oben vergeht die Zeit nicht. Sie wird verwaltet. Ich habe einmal gefragt, wem sie gehört. Danach war ich hier.“',
    bedingung: { requires_n_flags: { n: 1, of: ['cwn_seilbahn_abkuerzung', 'cwn_seilbahn_reserve'] } },
    fehlt: '„Bürgen? Für jemanden, der mir noch nicht einmal mit der Bahn geholfen hat? Kümmer dich um die siebte Haltestelle, dann reden wir.“',
    unterschrift: 'Silas zieht die Bremse an, bis der Aufzug knirscht, und unterschreibt auf dem Kurbelgehäuse. „Du hast die Bahn ehrlich gemacht. Oben zählt das nicht. Hier schon.“' },
  cwn_e_bote: { role: 'Rohrpostbote. Kind zweier Gefallener, in Calderwick geboren.',
    gruss: '„Ich bin der Einzige hier, der nie oben war. Meine Eltern sind beide gefallen. Ich bin, was dabei herauskam.“',
    arbeit: '„Ich bringe Kapseln. Die meisten sind leer, weil die Leute vergessen, was sie schreiben wollten. Das Verbrennen nimmt einem die Sätze mit.“',
    oben: '„Meine Mutter sagt, oben riecht es nach nichts. Mein Vater sagt, nach Brot. Ich glaube, sie waren an verschiedenen Tagen oben.“',
    bedingung: { requires_flags: ['k4s_ida'] },
    fehlt: '„Ida hat mir immer den Rest ihres Brots gegeben. Seit sie weg ist, gibt mir keiner mehr etwas. Bring sie zurück, dann unterschreibe ich alles.“',
    unterschrift: 'Oskar unterschreibt in großen, ungeübten Buchstaben. „Ida hat gesagt, du hast den Deckel mit bloßen Händen aufgemacht. Das reicht mir.“' },
  cwn_e_laternenwart: { role: 'Laternenwart. Fiel als Halbgott der Laterne und zündet seither nur noch Straßenlaternen an.',
    gruss: '„Früher habe ich Dinge gesehen, die noch nicht geschehen waren. Jetzt sehe ich, ob der Docht trocken ist. Es ist erholsamer.“',
    arbeit: '„In Calderwick brennt keine Laterne von allein. Die Monster mögen das Dunkel, die Gefallenen auch. Ich bin der Einzige, der es nicht mag.“',
    oben: '„Oben brauchst du kein Licht. Alles leuchtet. Darum sieht man dort auch nichts, was man nicht sehen soll.“',
    bedingung: { requires_n_flags: { n: 1, of: PFADE.map((p) => `won_o3_${p}_tiefe`) } },
    fehlt: '„Ich bürge für Leute, die schon einmal ein Gildenoberhaupt in seinem eigenen Viertel gestellt haben. Wer das nicht schafft, verbrennt oben in der ersten Stunde.“',
    unterschrift: 'Enno hält den Bürgschein gegen seine Laterne, bis die Tinte trocknet. „Ein Oberhaupt. Gut. Oben gibt es nur Oberhäupter.“' },
  cwn_e_griffmacherin: { role: 'Griffmacherin. Macht Griffe für Hände, die oben verbrannt wurden.',
    gruss: '„Zeig mir deine Hände. Nein, die Innenseite. Hm. Noch nicht verbrannt genug, um bei mir Kunde zu sein.“',
    arbeit: '„Wer oben verbrannt wird, kann danach oft nichts Heißes mehr halten. Ich mache Griffe aus Horn und Kork. Für Töpfe, für Schwerter, für Türklinken.“',
    oben: '„Ich war nie oben. Ich mache nur die Griffe für die, die dort waren. Man lernt viel über einen Ort, wenn man sieht, was er mit Händen macht.“',
    bedingung: { requires_money: 2500 }, kosten: 2500,
    fehlt: '„Eine Bürgschaft ist ein Werkstück wie jedes andere. Zweitausendfünfhundert Schilling, und ich setze meinen Namen darunter.“',
    unterschrift: 'Hanna nimmt das Geld, zählt es nicht und unterschreibt mit einer Zange, die sie in Tinte taucht. „Kein Griff hält ewig. Die Unterschrift schon.“' },
  cwn_e_nachtsetzer: { role: 'Nachtsetzer. Setzt das Fallbuch jede Nacht in Blei, damit es nicht verbrennt.',
    gruss: '„Psst. Ich setze gerade einen Namen. Wenn ich mich verlese, steht morgen jemand Falsches im Buch.“',
    arbeit: '„Vera schreibt mit Tinte. Tinte brennt. Ich setze jeden Eintrag nachts in Blei nach. Blei brennt auch, aber langsamer.“',
    oben: '„Ich setze seit zwölf Jahren Namen von Gefallenen. Ich kenne oben nur aus Buchstaben. Es sind immer dieselben: verbrannt.“',
    bedingung: { requires_flags: ['k4s_seite'] },
    fehlt: '„Zwölf Einträge sind gestrichen, und keiner kann mir sagen, wer gestrichen hat. Solange das so ist, unterschreibe ich nichts, was in ein Buch kommt.“',
    unterschrift: 'Arvo setzt deinen Namen in Blei, drückt ihn auf den Bürgschein und pustet. „Ruth hat den Strich zurückverfolgt. Wer das möglich macht, bekommt meinen Namen.“' },
  cwn_e_marktfrau: { role: 'Marktfrau am Quittungsmarkt. Zahlt in die Kasse der Gefallenen ein.',
    gruss: '„Kartoffeln, Salz, Kerzen. Keine Federn, keine Heiligenscheine. Wer so etwas verkaufen will, geht zu Lottie.“',
    arbeit: '„Ich verkaufe, was Gefallene essen. Sie essen viel. Wer verbrannt wird, muss wieder schwer werden.“',
    oben: '„Ich will nicht hinauf. Ich will, dass hier unten keiner mehr erntet. Jede Woche zahle ich in Pritchs Kasse ein, damit das aufhört.“',
    bedingung: { requires_n_flags: { n: 2, of: KG.map((k) => `${k}_bezahlt`) } },
    fehlt: '„Ich zahle in die Kasse, und du kassierst daraus. Erledige zwei von Pritchs Zetteln, dann weiß ich, dass mein Geld etwas taugt.“',
    unterschrift: 'Selma wischt sich die Hände an der Schürze ab und unterschreibt. „Zwei weniger, die ernten. Dafür bürge ich.“' },
  cwn_e_fensterputzerin: { role: 'Fensterputzerin am Kronenarchiv. Sieht von außen, was drinnen geschieht.',
    gruss: '„Ich putze die Fenster des Kronenarchivs. Von außen. Nach innen darf keiner von uns schauen, aber Glas ist Glas.“',
    arbeit: '„Ich habe jahrelang gesehen, wie Kisten aus dem Archiv getragen wurden. Ich habe weitergeputzt. Ich schäme mich dafür.“',
    oben: '„Ich fiel als Halbengel des Fadens. Oben hielt ich mich für jemanden, der hinsieht. Hier unten habe ich gelernt, dass Hinsehen nicht reicht.“',
    bedingung: { requires_flags: ['won_k4s_wetherby'] },
    fehlt: '„Solange Wetherby hinter meinen Fenstern sitzt, unterschreibe ich nichts, was nach oben geht. Er hat die Hand auf dem zweiten Zug.“',
    unterschrift: 'Mira unterschreibt mit dem Finger, nass vom Putzwasser, und dann mit Tinte darüber. „Du hast getan, was ich mich nicht getraut habe.“' },
  cwn_e_waescherin: { role: 'Wäscherin. Wäscht die verbrannten Kleider der Gefallenen.',
    gruss: 'Dora sieht dir nicht ins Gesicht, sondern auf die Brust. „Da ist sie. Die Narbe. Jeder, der fällt, hat eine. Deine leuchtet noch.“',
    arbeit: '„Ich wasche, was von oben kommt. Ruß geht raus, Blut geht raus. Licht nie. Die Kleider leuchten noch Jahre, wenn man das Licht ausmacht.“',
    oben: '„Die Narbe ist das Einzige, was man von oben mitbringt. Sie tut nicht weh. Aber wenn du wieder hinaufgehst, erkennen sie dich daran. Und du sie.“',
    bedingung: { requires_flags: [NARBE_FLAG] },
    fehlt: '„Du hast keine Narbe. Dann warst du nie oben, und dann kann ich nicht für dich bürgen.“',
    unterschrift: 'Dora legt ihre Hand flach auf deine Narbe, nur kurz, und unterschreibt dann. „Wer schon einmal gebrannt hat, weiß, wovor er Angst haben muss. Das ist eine gute Voraussetzung.“' },
  cwn_e_archivdienerin: { role: 'Archivdienerin. Staubt nachts die Register im Kronenarchiv ab.',
    gruss: '„Nachts ist das Archiv ehrlich. Keiner sortiert, keiner streicht. Nur ich und der Staub.“',
    arbeit: '„Ich staube die Register ab. Mehr nicht. Aber wer Staub wischt, liest mit. Ich weiß, welche Akten nie Staub ansetzen, weil sie jeden Tag geöffnet werden.“',
    oben: '„Meine Mutter fiel, als ich klein war. Sie kann die Treppe nicht mehr zählen, aber sie weiß noch, wie der Thron klingt. Wie ein Atemzug, der nicht aufhört.“',
    bedingung: { requires_flags: ['k4s_akte'] },
    fehlt: '„Ich unterschreibe nur, was gebunden ist. Lose Blätter fliegen weg. Lass dir von Klammer eine Akte binden, dann weiß ich, dass du sorgfältig bist.“',
    unterschrift: 'Berta pustet den Staub vom Bürgschein und unterschreibt in der Handschrift einer Archivarin. „Ordentlich. Das mögen sie oben.“' },
};
export const BUERGEN_FLAGS = Object.keys(BUERGEN).map((id) => `k6_buerge_${id}`);

function buergenEinbauen(content) {
  for (const [id, b] of Object.entries(BUERGEN)) {
    const npc = content.npcs[id];
    const d = npc && content.dialogues[npc.dialogue];
    const start = d?.nodes?.[d.start ?? 'cwn_start'] ?? d?.nodes?.cwn_start;
    if (!start) continue;
    npc.role = b.role;
    start.text = b.gruss;
    const flag = `k6_buerge_${id}`;
    const startId = Object.keys(d.nodes).find((k) => d.nodes[k] === start);
    const zurueck = [{ text: 'Noch etwas.', next: startId }];
    Object.assign(d.nodes, {
      k6_arbeit: { text: b.arbeit, choices: zurueck },
      k6_oben: { text: b.oben, choices: zurueck },
      k6_buerge: { text: b.unterschrift, sets_flags: [flag], ...(b.kosten ? { takes_money: b.kosten } : {}), choices: zurueck },
      k6_buerge_fehlt: { text: b.fehlt, choices: zurueck },
    });
    // Arbeit/Ort/Aushang der Codex-Fassung raus; das Zeugnis nur noch, solange Noels Nebenaufträge laufen (Codex CN);
    // Silas' Nebenauftrag und der Abschied bleiben
    const alt = start.choices.filter((c) => !['cwn_arbeit', 'cwn_ort', 'cwn_aushang'].includes(c.next))
      .map((c) => (c.next === 'cwn_zeugnis' ? { ...c, requires_any_quests_active: ['cwn_zwei_teller', 'cwn_letzte_terrasse'] } : c));
    const ende = alt.filter((c) => !c.next || c.next === 'cwn_ende');
    start.choices = [
      { text: 'Was tust du hier?', next: 'k6_arbeit' },
      { text: 'Was weißt du von oben?', next: 'k6_oben' },
      // Bürgen erst, wenn man den Bürgschein vom Schaffner hat; ob sie unterschreiben, hängt an dem, was sie gesehen haben
      { text: 'Würdest du für mich bürgen?', next: [{ node: 'k6_buerge', ...b.bedingung }, { node: 'k6_buerge_fehlt' }], requires_flags: ['auf_zug2_gesehen'], hide_if_flags: [flag] },
      ...alt.filter((c) => !ende.includes(c)), ...ende];
  }
  // Sie bleiben nach Kapitel 4 in der Stadt (Bürgen für den zweiten Zug)
  for (const m of Object.values(content.maps)) {
    if (m.city !== 'calderwick') continue;
    for (const n of m.npcs ?? []) {
      if (!BUERGEN[n.id] || !n.visible_if?.hide_if_flags) continue;
      n.visible_if = { ...n.visible_if, hide_if_flags: n.visible_if.hide_if_flags.filter((f) => f !== 'kapitel4_done') };
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Gegner

const FALL_TEXT = 'Diesmal verbrennst du nicht. Du wirst nur zu leicht. Der weiße Stein lässt dich los, und du fällst, durch die Wolken, die du schon kennst, bis Calderwick dich wieder auffängt.\n\nVera trägt dich ein zweites Mal ins Fallbuch ein. Unter „Ursache“ schreibt sie diesmal: zu früh.';
const FALL = { lose_to: STURZ_ZIEL, lose_money: 0, lose_text: FALL_TEXT, flee_text: 'Du ziehst dich zum Bahnsteig zurück. Hier oben folgt dir keiner. Sie haben Zeit.' };

/** Gegner des zweiten Aufstiegs: echte Werte, sie fallen, du auch. Narbe wirkt über `himmel`. */
function himmel2(id, name, o) {
  return { id, name, sprite: 'wild', occult: true, chapter: 5, boss: false, elite: false, armor: 8, dmg_mult: 1, fleeable: true, himmel: true, duo_hp_mult: 1.6, on_win: {}, ...FALL, ...o };
}

function zweiterAufstiegGegner(content) {
  const out = {};
  const seqName = (pid, n) => content.pathways[pid]?.seqs?.[n]?.name ?? 'Unbekannt';
  for (const pid of PFADE) {
    if (!content.pathways[pid]) continue;
    // Vorhof: Halbgötter (Seq 4). Für einen Heiligen ein harter, fairer Kampf
    out[`hs2_halbgott_${pid}`] = himmel2(`hs2_halbgott_${pid}`, `${seqName(pid, 4)} des Vorhofs`, {
      sheet: `hg_battle_${pid}__vh`, pathway: pid, elite: true, tier_seq: 4, hp: 6500, armor: 8, max_round_dmg: 0.2,
      attacks: [schlag('Halbgöttlicher Schlag', 70, [900, 1500]), schlag('Wille des Pfades', 46, [600, 900, 1200, 1500]), schlag('Mythische Gestalt', 108, [2100], { unparryable: true })],
      intro: 'Ein Halbgott steht wieder in der Schlange vor den Höfen, so alt wie eine Stadt. Er erkennt deine Narbe. „Du warst schon einmal hier. Damals warst du Asche. Mal sehen, was du jetzt bist.“',
      win_text: 'Der Halbgott fällt auf die Knie. Unter ihm gibt der weiße Stein nach, und er rutscht hinab, durch die Wolken, nach Calderwick. Hier oben fällt man nicht. Man wird nur zu leicht.',
    });
    // Höfe: Heilige (Seq 3). Ebenbürtig
    out[`hs2_heiliger_${pid}`] = himmel2(`hs2_heiliger_${pid}`, `${seqName(pid, 3)} der Höfe`, {
      sheet: `enemy_hs_heiliger_${pid}`, pathway: pid, elite: true, tier_seq: 3, hp: 9500, armor: 9, max_round_dmg: 0.18,
      attacks: [schlag('Heiliges Urteil', 84, [1200], { unparryable: true }), schlag('Lichtkette', 56, [700, 1300, 1900], { nerves: 10 }),
        { name: 'Gebet', action: 'guard', value: 8, text: 'Er betet. Die Welt unter den Wolken antwortet: +8 Abwehr.' }, schlag('Segen, der brennt', 120, [2400])],
      intro: 'Ein Heiliger unterbricht sein Gebet und sieht auf deine Narbe. „Ein Heiliger mit einer Narbe. Das gibt es selten. Die meisten von euch bleiben unten.“',
      win_text: 'Der Heilige beendet sein Gebet nicht. Er sinkt in sich zusammen, und das Licht, mit dem er betete, rinnt durch die Fugen nach unten.',
    });
  }
  // Grat: Engel (Seq 2). Ein Heiliger kratzt sie nur (min_seq 2)
  ['Engel des Grats', 'Engel der Schwelle', 'Engel des Thrones'].forEach((name, i) => {
    const id = `hs2_engel_${i + 1}`;
    out[id] = himmel2(id, name, {
      sheet: `enemy_hs_engel_${i + 1}`, boss: true, tier_seq: 2, min_seq: 2, hp: 13000 + i * 2000, armor: 12, max_round_dmg: 0.12,
      attacks: [schlag('Flügelschlag aus Licht', 120, [1100, 1700]), schlag('Chor der Zerstörung', 76, [800, 1400, 2000], { unparryable: true }),
        { name: 'Schweigen', action: 'guard', value: 12, text: 'Der Engel schweigt. Das Schweigen legt sich wie Rüstung um ihn: +12 Abwehr.' }, schlag('Das Wort', 190, [2600], { unparryable: true, nerves: 18 })],
      phase2: { meldung: 'Der Engel öffnet den Mund. Kein Laut kommt heraus, aber die Wolken unter dem Grat reißen auf.', attacks: [schlag('Das Wort, zweimal', 150, [1300, 2400], { unparryable: true }),
        schlag('Flügelschlag aus Licht', 130, [900, 1400]), schlag('Chor der Zerstörung', 84, [700, 1200, 1700, 2200])] },
      intro: 'Diesmal sieht der Engel dich an. Er hat keine Augen, nur Licht, das dorthin fällt, wo Augen wären, und es fällt auf deine Narbe. Er hebt die Flügel.',
      win_text: 'Der Engel fällt nicht. Er legt die Flügel an und tritt zur Seite, als hättest du eine Frage richtig beantwortet. Hinter ihm ist der Grat frei.',
    });
  });
  out[K6_STARLING] = himmel2(K6_STARLING, 'Lucius Starling, Hand des Alten', {
    sprite: 'npc:cultist', sheet: 'enemy_starling2', tint: '#fff2b0', boss: true, tier_seq: 2, min_seq: 2, hp: 16000, armor: 12, max_round_dmg: 0.1, fleeable: false,
    attacks: [schlag('Brennglas des Alten', 130, [900, 1300]), schlag('Sternregen', 64, [500, 750, 1000, 1250, 1500]),
      { name: 'Kaltes Licht', action: 'guard', value: 12, text: 'Starling zieht den Mantel enger. Das Licht um ihn wird kalt und hart: +12 Abwehr.' }, schlag('Ernte', 210, [2400], { unparryable: true, nerves: 20 })],
    phase2: { meldung: 'Starling steht auf. Ohne die Leitung aus Briarholt ist er leichter geworden, und er weiß es. Er greift nach dem Thron hinter sich, und der Thron lässt ihn.', attacks: [schlag('Zwölf Namen', 72, [400, 650, 900, 1150, 1400, 1650], { nerves: 12 }),
      schlag('Brennglas des Alten', 150, [800, 1200]), schlag('Die letzte Ernte', 260, [2300], { unparryable: true })] },
    intro: 'Starling sitzt auf der untersten Stufe des Thrones und friert. Er trägt zwei Mäntel übereinander. „Sie haben die Leitung abgedreht“, sagt er. „Natürlich. Mein bester Ermittler.“\n\nEr steht auf, langsam, wie ein alter Mann. Dann nicht mehr langsam. „Hier oben ist man so schwer, wie man geerntet hat. Ich habe viel geerntet.“',
    win_text: 'Starling fällt auf die Stufen. Der Stein unter ihm wird weich, und er sinkt hinein, wie in Wasser. „Einundvierzig Jahre“, sagt er, und es klingt fast erleichtert. „Ich hatte vergessen, wie es ist, zu fallen.“\n\nDann ist er weg. Irgendwo unter den Wolken wird Vera Darnell morgen früh einen Namen ins Fallbuch schreiben, den sie schon einmal geschrieben hat.',
    lose_text: `Starling sieht dir nach, wie du fällst. „Wiedervorlage“, sagt er, wie Wetherby es gesagt hätte.\n\n${FALL_TEXT}`,
  });
  return out;
}

/** Der Schaffner ohne Gesicht am Kronenarchiv: höheres Wesen (min_seq 3), Heilige schaffen ihn, Halbgötter kratzen ihn nur. */
function schaffner2Kampf() {
  return {
    id: SCHAFFNER2, name: 'Der Schaffner ohne Gesicht', sprite: 'wild', sheet: 'enemy_bn_schaffner_ohne_zug', tint: '#ffe8a0', occult: true,
    chapter: 5, boss: true, elite: false, tier_seq: 3, min_seq: 3, hp: 6000, armor: 8, dmg_mult: 1, max_round_dmg: 0.18, fleeable: true, duo_hp_mult: 1.6, sieg_flag: SCHAFFNER2,
    intro: 'Der Schaffner ohne Gesicht nimmt den Bürgschein, liest jede Unterschrift und gibt ihn zurück. „Bürgen haben Sie. Jetzt zeigen Sie mir, was Sie wiegen. Halbgötter verbrennen schon auf der Fahrt. Heilige erst oben.“',
    attacks: [schlag('Lochzange', 72, [1000, 1600]), schlag('Pfiff zur Abfahrt', 48, [700, 1100, 1500], { nerves: 12 }),
      { name: 'Fahrplan', action: 'guard', value: 8, text: 'Er schlägt im Fahrplan nach. Seine Uniform wird schwer wie Gusseisen: +8 Abwehr.' }, schlag('Türen schließen', 108, [1900], { unparryable: true })],
    phase2: { meldung: 'Der Schaffner reißt die Uniform auf. Darunter ist kein Licht mehr wie beim ersten Mal, sondern ein Gleis, das nach oben führt.', attacks: [schlag('Licht aus dem Waggon', 92, [1000, 1700], { unparryable: true }),
      schlag('Lochzange', 62, [600, 900, 1200, 1500]), { name: 'Nachzahlung', action: 'guard', value: 10, text: 'Er bucht nach: +10 Abwehr.' }, schlag('Letzter Pfiff', 140, [2200], { nerves: 18 })] },
    on_win: {}, lose_money: 0, lose_to: { map: 'cw_kronenarchiv', spawn: 'default' },
    win_text: 'Der Schaffner locht den Bürgschein, einmal für jede Unterschrift. „Wer noch steht, fährt. Wer am Boden liegt, hat gute Bürgen und zu wenig Gewicht.“',
    lose_text: 'Der Schaffner legt dir den Bürgschein auf die Brust, ordentlich gefaltet. „Gute Bürgen“, sagt er. „Zu wenig Gewicht. Kommen Sie als Heiliger wieder.“',
    flee_text: 'Du trittst vom Gleis zurück. Der Schaffner wartet. Er wartet seit Jahren.',
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Die Himmelsstadt, zweiter Besuch

function himmelsKarte2(content) {
  const alt = content.maps[HIMMEL];
  if (!alt) return null;
  const tausch = (enc) => enc.replace(/^hs_/, 'hs2_');
  const roamers = alt.roamers.map((r) => ({ ...r, id: r.id.replace(/^hs_/, 'hs2_'), encounter: tausch(r.encounter) }));
  // Der dritte Engel steht diesmal vor dem Thron (beim ersten Besuch wartete dort niemand, der fallen konnte)
  const engel3 = freieKachel({ ...alt, roamers, npcs: [], interactables: alt.interactables }, { near: [28, 8] });
  if (engel3) roamers.push({ id: 'hs2_grat_3', encounter: 'hs2_engel_3', tile: engel3, elite_chance: 0 });
  const tafeln = alt.interactables.filter((i) => i.id.startsWith('hs_tafel_')).map((i) => ({ ...i, id: i.id.replace(/^hs_/, 'hs2_') }));
  const interactables = [
    { id: 'hs2_ankunft', kind: 'read', tile: [26, 36], prompt: 'Der Bahnsteig über den Wolken', title: 'Die Himmelsstadt, zum zweiten Mal', marker: true, done_flag: 'hs2_angekommen',
      text: 'Derselbe weiße Bahnsteig, dieselben Wolken. Aber diesmal wiegt dich der Ort nicht. Du stehst.\n\nDeine Narbe zieht, als erinnere sie sich. Die Wesen hier oben spüren sie auch: Sie sehen dich jetzt an, statt durch dich hindurch. Wer dich ansieht, kann fallen. Und du auch.',
      effects: { sets_flags: ['k6_oben'] } },
    ...tafeln,
    { id: 'hs2_zug_runter', kind: 'read', tile: [30, 37], prompt: 'Der Zug nach unten', title: 'Der zweite Zug', marker: true,
      text: 'Der Schaffner ohne Gesicht hält die Tür auf. „Hinunter nach Calderwick? Die Fahrkarte gilt in beide Richtungen. Sie haben dafür bezahlt.“', effects: { travel: { map: 'cw_kronenarchiv', spawn: 'default' } } },
    { id: K6_STARLING, kind: 'combat', encounter: K6_STARLING, tile: [28, 6], prompt: 'Starling stellen', marker: true, visible_if: { hide_if_flags: [`won_${K6_STARLING}`] } },
    { id: 'hs2_thron', kind: 'read', tile: [28, 3], prompt: 'Vor den Thron des Alten treten', title: 'Der Thron des Alten', marker: true, scene: 'kapitel_ende',
      visible_if: { requires_flags: [`won_${K6_STARLING}`], hide_if_flags: [K6_ENDE_FLAG] },
      text: 'Auf dem Thron sitzt niemand, und doch ist er voll. Diesmal brennst du nicht. Der Alte sieht dich an, lange, so wie man ein Werkstück ansieht, das noch nicht fertig ist.\n\nDann spricht er, ohne Mund, ohne Laut. Es ist nur ein Gewicht, das sich auf dich legt, und du verstehst es trotzdem: Eine Hand hat er verloren. Er braucht keine neue. Er braucht jemanden, der ihm gegenübersitzt.\n\nÜber dem Engel, über der ersten Sequenz, steht kein Thron für Diener. Sequenz 0.\n\nDer Boden lässt dich los, sanft diesmal. Du fällst nicht. Du wirst hinuntergeschickt.',
      effects: { sets_flags: [K6_ENDE_FLAG, 'k6_thron'], complete_quests: [K6_QUEST], travel: STURZ_ZIEL } },
  ];
  return { ...alt, id: HIMMEL2, name: 'Die Himmelsstadt', roamers, interactables };
}

// ---------------------------------------------------------------------------------------------------------------------

const ZUG2_TEXT = 'Über dem Kronenarchiv endet ein Gleis in der Luft. Ein Schaffner ohne Gesicht wartet daneben, seit Jahren, sagen die Leute.\n\n„Der Zug nach oben fährt wieder“, sagt er. „Nicht für jeden. Wer oben bestehen will, kommt als Heiliger, und selbst Heilige verbrennen dort ohne Bürgen.“\n\nEr hält dir einen leeren Bürgschein hin. „Fünf Gefallene müssen für Sie unterschreiben. Leute, die hier unten leben und wissen, was oben geschieht. Dann prüfe ich Ihr Gewicht.“';
const TUER_TEXT = 'Der Schaffner ohne Gesicht nimmt den Bürgschein entgegen. Fünf Namen, fünf Handschriften. Er nickt und tritt vor die Tür des Waggons.\n\n„Die Bürgen sind gut. Jetzt Ihr Gewicht.“';
const HOCH_TEXT = 'Du steigst ein. Diesmal kippt der Boden nicht weg, er hebt sich. Der Zug fährt durch Rauch, durch Wolken, durch das Licht, das dich beim ersten Mal verbrannt hat. Es brennt noch immer. Aber du bleibst.\n\nDeine Narbe glüht die ganze Fahrt lang.';

function zugAmArchiv(content) {
  const archiv = content.maps.cw_kronenarchiv;
  if (!archiv) return;
  const zug2 = archiv.interactables.find((i) => i.id === 'auf_cw_zug2');
  if (zug2) Object.assign(zug2, { text: ZUG2_TEXT, effects: { ...(zug2.effects ?? {}), start_quests: [K6_QUEST] } });
  const near = zug2?.tile ?? archiv.spawns?.oben ?? archiv.spawns?.default;
  const t1 = freieKachel(archiv, { near: [near[0] + 2, near[1]], seed: 'k6_tuer' });
  archiv.interactables.push({ id: 'k6_schaffner2_tuer', kind: 'read', tile: t1, prompt: 'Den Bürgschein vorzeigen', title: 'Der Schaffner ohne Gesicht', marker: true,
    visible_if: { requires_flags: ['k4_arrived', 'auf_zug2_gesehen', 'kapitel5_done'], requires_n_flags: { n: K6_BUERGEN_NOETIG, of: BUERGEN_FLAGS }, hide_if_alle_flag: SCHAFFNER2 },
    text: TUER_TEXT, effects: { start_quests: [K6_QUEST], combat: SCHAFFNER2 } });
  const t2 = freieKachel(archiv, { near: t1, seed: 'k6_zug' });
  archiv.interactables.push({ id: 'k6_zug_hoch', kind: 'read', tile: t2, prompt: 'Mit dem zweiten Zug hinauf', title: 'Der zweite Zug', marker: true,
    visible_if: { requires_flags: ['k4_arrived'], requires_alle_flag: SCHAFFNER2 }, text: HOCH_TEXT, effects: { start_quests: [K6_QUEST], travel: { map: HIMMEL2, spawn: 'default' } } });
}

/** Starling im Fallbuch: Vera trägt ihn ein zweites Mal ein. */
function fallbuchNachtrag(content) {
  const npc = content.npcs.cw_darnell;
  const d = npc && content.dialogues[npc.dialogue];
  if (!d?.nodes?.hub) return;
  d.nodes.k6_starling_eintrag = { text: 'Vera schlägt das Fallbuch auf, ganz hinten. Der letzte Eintrag ist frisch.\n\n„Lucius Starling. Gefallen heute früh. Pfad: unleserlich. Sequenz 2. Ursache: verbrannt.“ Darunter hat sie mit Lineal einen Strich gezogen, nicht nach oben, sondern quer.\n\n„Er liegt in Bexleys Witwenterrasse und spricht mit niemandem“, sagt sie. „Zum ersten Mal seit einundvierzig Jahren ist er hier unten nur einer von uns.“',
    choices: [{ text: 'Zurück.', next: 'hub' }] };
  d.nodes.hub.choices = [{ text: 'Ist Starling unten angekommen?', next: 'k6_starling_eintrag', requires_flags: [`won_${K6_STARLING}`] }, ...d.nodes.hub.choices];
}

export function applyZweiterAufstieg(content) {
  const enc = zweiterAufstiegGegner(content);
  Object.assign(content.encounters, enc);
  for (const id of Object.keys(enc)) content.loot[id] = { money: id === K6_STARLING ? [20000, 20000] : id.startsWith('hs2_engel') ? [6000, 9000] : [1500, 3000], drops: [], ...(id === K6_STARLING ? {} : { repeat: true }) };
  content.encounters[SCHAFFNER2] = schaffner2Kampf();
  content.loot[SCHAFFNER2] = { money: [0, 0], drops: [] };
  const karte = himmelsKarte2(content);
  if (karte) content.maps[HIMMEL2] = karte;

  buergenEinbauen(content);
  zugAmArchiv(content);
  fallbuchNachtrag(content);

  // Briarholt: die kalte Leitung zeigt auf den zweiten Zug
  for (const mid of ['bh_verteilanlage', 'bh_verteilanlage__warm']) {
    const it = content.maps[mid]?.interactables.find((i) => i.id === 'k5s_zug2');
    if (!it) continue;
    it.text = it.text.replace('\n\n(Der zweite Aufstieg ist noch nicht gebaut.)', '\n\nÜber dem Kronenarchiv in Calderwick wartet ein Schaffner ohne Gesicht auf Leute, für die Gefallene bürgen.');
    it.effects = { ...(it.effects ?? {}), start_quests: [K6_QUEST] };
  }

  content.cases = [...(content.cases ?? []).filter((c) => c.id !== 'kapitel6_aufstieg2'), { id: 'kapitel6_aufstieg2', title: 'Kapitel 6: Der zweite Aufstieg' }];
  content.quests[K6_QUEST] = {
    title: 'Kapitel 6: Der zweite Aufstieg', kind: 'main', case: 'kapitel6_aufstieg2',
    summary: 'Starling sitzt oben vor dem Thron und friert, seit die Leitung aus Briarholt kalt ist. Er kommt nicht mehr herunter. Über dem Kronenarchiv fährt der zweite Zug, aber nur für Heilige, für die Gefallene bürgen. Diesmal fällt oben jeder, der verliert. Auch du.',
    steps: [
      { text: 'Finde den zweiten Zug über dem Kronenarchiv', done: { requires_flags: ['auf_zug2_gesehen'] }, target: { map: 'cw_kronenarchiv', id: 'auf_cw_zug2', label: 'Kronenarchiv' } },
      { text: `Sammle ${K6_BUERGEN_NOETIG} Bürgschaften von Gefallenen in Calderwick`, done: { requires_n_flags: { n: K6_BUERGEN_NOETIG, of: BUERGEN_FLAGS } } },
      { text: 'Werde ein Heiliger: Sequenz 3', done: { requires_seq: 3 } },
      { text: 'Besiege den Schaffner ohne Gesicht', done: { requires_alle_flag: SCHAFFNER2 }, target: { map: 'cw_kronenarchiv', id: 'k6_schaffner2_tuer', label: 'Kronenarchiv' } },
      { text: 'Fahr mit dem zweiten Zug hinauf', done: { requires_flags: ['k6_oben'] }, target: { map: 'cw_kronenarchiv', id: 'k6_zug_hoch', label: 'Kronenarchiv' } },
      { text: 'Werde ein Engel: Sequenz 2', done: { requires_seq: 2 } },
      { text: 'Stelle Starling vor dem Thron', done: { requires_flags: [`won_${K6_STARLING}`] }, target: { map: HIMMEL2, id: K6_STARLING, label: 'Himmelsstadt' } },
      { text: 'Tritt vor den Thron des Alten', done: { requires_flags: [K6_ENDE_FLAG] }, target: { map: HIMMEL2, id: 'hs2_thron', label: 'Himmelsstadt' } },
    ],
  };
  const gossip = content.gossip?.calderwick;
  if (gossip) for (const map of Object.keys(gossip)) gossip[map] = [...gossip[map],
    { text: 'Fünf Unterschriften für den zweiten Zug. Fünf Leute, die sagen: Der da ist schwer genug. Die meisten hier bekommen nicht eine.', requires_flags: ['auf_zug2_gesehen'] },
    { text: 'Die Narbe? Jeder hat eine. Oben erkennen sie dich daran. Ob das gut ist, weiß keiner.', requires_flags: [NARBE_FLAG] },
    { text: 'Starling ist gefallen, sagen sie. Er liegt bei Bexley und spricht mit niemandem. Keiner hier erntet mehr für ihn.', requires_flags: [`won_${K6_STARLING}`] }];
  return content;
}
