/**
 * Kapitel 4 ausgebaut (Seb 2026-11-15): „Die Ernte der Gefallenen“.
 *
 * Calderwick hatte nach dem Sturz eine offene, harte Welt, aber keine Geschichte mehr (die alte Detektivakte um Wetherby und
 * Bellcross ist seit PR #422 gestrichen). Die Figuren aus der Akte bekommen hier neue Rollen als Gefallene und tragen eine neue
 * Kapitelgeschichte:
 *
 * - Vera Darnell führt das Fallbuch: Jeder, der von oben fällt, wird eingetragen. Zwölf Einträge sind mit derselben Tinte gestrichen.
 * - Hesk trägt die Gefallenen vom Krater weg. Manche trägt er zweimal, das zweite Mal in einer Kiste zum Kronenarchiv.
 * - Noel sucht Ida, eine gefallene Halbengel. Sie liegt in einer Kiste in der Sortiergrube, bewacht von einem Erntehelfer.
 * - Ruth Malliver stellt aus drei verbrannten Seiten (in den Gefahrengebieten) Starlings eigenen Eintrag wieder her: Er fiel
 *   selbst einmal nach Calderwick und kam mit dem zweiten Zug wieder hinauf, bezahlt mit zwölf Gefallenen (die „Ernte“ aus Kapitel 1).
 * - Klammer bindet daraus die Akte Starling. Damit stellt man Oswin Wetherby, einen gefallenen Engel, der die Ernte bis heute
 *   für Starling betreibt: Die Kisten gehen die Linie hinunter nach Briarholt, in die Kur.
 * - Wetherby ist für Sequenz 4 kaum zu schaffen (Sim tools/sim/kapitel4.mjs), keine Sequenz-Abfrage. Nach dem Sieg fährt die
 *   Linie nach unten: Kapitel 4 endet, Briarholt (Kapitel 5) beginnt.
 * - Pritchs Kasse der Gefallenen: vier Kopfgelder auf abtrünnige Gefallene in den Gefahrengebieten.
 */
import { seeded } from '../core/Gatherings.js';

const WALK = new Set([...'.,gpscwPK=']);
const schlag = (name, damage, hits, extra = {}) => ({ name, damage, hits, ...extra });

/** Freie, begehbare Kachel, möglichst nah an `near` (oder zufällig, weit vom Eingang). */
export function freieKachel(map, { near = null, seed = map.id, minDist = 8 } = {}) {
  const taken = new Set([...(map.npcs ?? []), ...(map.interactables ?? []), ...(map.roamers ?? [])].filter((o) => o.tile).map((o) => o.tile.join(',')));
  const [sx, sy] = map.spawns?.default ?? [0, 0];
  const opts = [];
  map.rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!WALK.has(ch) || x < 2 || y < 2 || x > row.length - 3 || y > map.rows.length - 3 || taken.has(`${x},${y}`)) return;
    if (!WALK.has(row[x - 1] ?? 'I') || !WALK.has(row[x + 1] ?? 'I')) return;
    if (!near && Math.abs(x - sx) + Math.abs(y - sy) < minDist) return;
    opts.push([x, y]);
  }));
  if (!opts.length) return null;
  if (near) return opts.sort((a, b) => Math.abs(a[0] - near[0]) + Math.abs(a[1] - near[1]) - (Math.abs(b[0] - near[0]) + Math.abs(b[1] - near[1])))[0];
  const rng = seeded(seed);
  return opts[Math.floor(rng() * opts.length)];
}

// ---------------------------------------------------------------------------------------------------------------------
// Gegner

export const K4S_WETHERBY = 'k4s_wetherby';
export const K4S_ERNTEHELFER = 'k4s_erntehelfer';

/** Oswin Wetherby, gefallener Engel. Ziel: Seq 3 gewinnt meist, Seq 4 fast nie. */
function wetherbyKampf() {
  return {
    id: K4S_WETHERBY, name: 'Oswin Wetherby, gefallener Engel', sprite: 'wild', sheet: 'enemy_k4s_wetherby', occult: true,
    chapter: 5, boss: true, elite: false, tier_seq: 3, hp: 7000, armor: 8, dmg_mult: 1, max_round_dmg: 0.2, fleeable: true, duo_hp_mult: 2.2,
    intro: 'Wetherby legt den Federhalter ab. Hinter ihm entfaltet sich etwas, das einmal Flügel aus Licht waren und jetzt verkohlt und gebrochen von ihm absteht. Lose Aktenblätter kreisen um ihn. „Ich war ein Engel“, sagt er ruhig. „Gefallen bin ich bis auf das Gewicht eines Halbgotts. Den Rest trage ich als Erinnerung. Sie wiegen weniger, als Sie glauben.“',
    attacks: [schlag('Stempel des Archivs', 75, [900, 1500]), schlag('Gestrichener Name', 52, [700, 1100, 1500], { nerves: 14 }),
      { name: 'Ablage', action: 'guard', value: 8, text: 'Er legt sich selbst ab. Papier schichtet sich vor ihn: +8 Abwehr.' }, schlag('Flügel aus Akten', 115, [1800], { unparryable: true })],
    phase2: { meldung: 'Die Aktendeckel brennen. Darunter ist Licht, das nicht mehr ganz hell ist.', attacks: [schlag('Engelslicht, getrübt', 95, [1000, 1700], { unparryable: true }),
      schlag('Die Ernte', 62, [600, 900, 1200, 1500]), { name: 'Nachtrag', action: 'guard', value: 10, text: 'Er trägt sich selbst nach. Neue Seiten legen sich über ihn: +10 Abwehr.' }, schlag('Letzter Vermerk', 150, [2200], { nerves: 20 })] },
    on_win: {}, lose_money: 0, lose_to: { map: 'cw_archivsaal', spawn: 'default' },
    win_text: 'Wetherby sinkt zwischen die Akten. „Er hat mir versprochen, mich mitzunehmen“, sagt er. „Beim nächsten Zug. Seit einundvierzig Jahren beim nächsten Zug.“ Er schiebt dir einen Frachtbrief hin. „Briarholt. Die Kur. Dort geht hin, was ich hier ernte.“',
    lose_text: 'Wetherby trägt dich eigenhändig in den Archivsaal und legt dich auf einen Tisch, zwischen zwei Stapel. „Noch zu leicht“, notiert er. „Wiedervorlage, wenn Sie ein Heiliger sind.“',
    flee_text: 'Du ziehst dich zwischen die Regale zurück. Wetherby schreibt weiter.',
  };
}

/** Der Erntehelfer bewacht Idas Kiste in der Sortiergrube (Elite in Calderwick-Stärke). */
function erntehelferKampf(content) {
  const base = Object.values(content.encounters).find((e) => e.zone === 'cw_sortiergrube' && e.elite && !e.boss) ?? {};
  return {
    id: K4S_ERNTEHELFER, name: 'Erntehelfer des Archivs', sprite: 'wild', sheet: base.sheet ?? 'enemy_vg_cw_leerfracht', occult: true,
    chapter: 5, boss: false, elite: true, hp: 4200, armor: 6, dmg_mult: 1, max_round_dmg: 0.3, fleeable: true, zone: 'cw_sortiergrube',
    intro: 'Neben der Kiste steht ein Halbgott in einer Trägerweste mit dem Stempel des Kronenarchivs. „Abgezählte Fracht“, sagt er. „Wer sie öffnet, wird mitgezählt.“',
    attacks: [schlag('Frachthaken', 60, [900, 1500]), schlag('Zählen', 42, [700, 1100, 1500], { nerves: 8 }), schlag('Deckel drauf', 85, [1900], { unparryable: true })],
    on_win: {}, lose_money: 0, lose_to: { map: 'cw_sortiergrube', spawn: 'default' },
    win_text: 'Der Erntehelfer fällt rückwärts gegen die Kiste. Von innen klopft es, dreimal, dann noch einmal.',
    lose_text: 'Du wachst am Rand der Grube auf. Die Kiste steht noch da. Jemand hat einen zweiten Deckel darauf genagelt.',
    flee_text: 'Du ziehst dich zurück. Das Klopfen aus der Kiste wird leiser.',
  };
}

/** Pritchs Kasse der Gefallenen: abtrünnige Gefallene in den Gefahrengebieten (Seq 4: knapp schaffbar). */
export const K4S_KOPFGELDER = [
  { id: 'k4s_kg_aschmann', name: 'Gerold Aschmann, der Rückfällige', pfad: 'kessel', zone: 'cw_alte_setzerei', lohn: 6000,
    tat: 'Fiel als Halbgott und hat seither drei Nachbarn in seinen Sud getaucht, um wieder leichter zu werden.' },
  { id: 'k4s_kg_vell', name: 'Ines Vell, die Stimme aus dem Schacht', pfad: 'echo', zone: 'cw_sortiergrube', lohn: 6500,
    tat: 'Ruft Gefallene mit den Stimmen ihrer Toten in die Grube. Unten wartet nur sie.' },
  { id: 'k4s_kg_dorn', name: 'Kaspar Dorn, ohne Gesicht', pfad: 'maske', zone: 'cw_nullfundament', lohn: 7000,
    tat: 'Trägt die Gesichter von Leuten, die von oben fielen. Ein Gesicht pro Woche.' },
  { id: 'k4s_kg_hollin', name: 'Marthe Hollin, Wegezoll', pfad: 'eisen', zone: 'reise_landstrasse', lohn: 7500,
    tat: 'Hält die Landstraße für sich. Wer zahlen kann, darf vorbei. Wer nicht, wird Teil der Straße.' },
];
function kopfgeldKampf(k) {
  return {
    id: k.id, name: k.name, sprite: 'wild', sheet: `hg_battle_${k.pfad}`, pathway: k.pfad, occult: true, chapter: 5, boss: true, elite: false,
    hp: 5000, armor: 5, dmg_mult: 1, max_round_dmg: 0.16, fleeable: true, zone: k.zone, wild: true,
    attacks: [schlag('Halbgöttlicher Schlag', 60, [900, 1500]), schlag('Wille des Pfades', 40, [600, 900, 1200, 1500]), schlag('Mythische Gestalt', 92, [2100], { unparryable: true })],
    intro: `${k.name.split(',')[0]} dreht sich um. „Pritch schickt dich? Pritch hat selbst einmal geerntet. Frag ihn mal danach.“`,
    win_text: `${k.name.split(',')[0]} bleibt liegen. Pritch wird sich freuen. Oder zumindest zahlen.`,
    lose_to: { map: k.zone, spawn: 'default' }, lose_money: 0, lose_text: 'Du kommst am Rand des Gebiets zu dir. Dein Geldbeutel ist noch da. Dein Stolz nicht.',
    flee_text: 'Du ziehst dich zurück.', on_win: {},
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Figuren: neue Rollen und Gespräche

/** Rolle, Gruß und zwei Themen je Figur (Allerwelts-Themen fliegen raus; Nebenakte cwa_*, Nebenaufträge cwn_* und Handel bleiben). */
const FIGUREN = {
  cw_darnell: { role: 'Schreiberin des Fallbuchs am Gleisfuß. Fiel vor neun Jahren als Halbgott.', gruss: '„Name, Pfad, Sequenz, Uhrzeit des Aufschlags. Hinter die Linie, bitte. Auch Gefallene stehen in einer Schlange.“',
    themen: [['Was ist das Fallbuch?', '„Jeder, der von oben fällt, steht hier drin. Seit zweihundert Jahren. Wer gestorben ist, bekommt ein Kreuz. Wer wieder hinaufkam, einen Strich nach oben. Das sind sehr wenige Striche.“'],
      ['Warum bist du noch hier?', '„Weil ich schreiben kann und kämpfen nicht mehr will. Calderwick braucht beides. Die Monster lesen nicht.“']] },
  cw_hesk: { role: 'Träger am Röhrenhof. Trägt die Gefallenen vom Krater weg.', gruss: '„Du bist der Krater von letzter Woche. Ich hab dich getragen. Du warst schwerer, als du aussiehst.“',
    themen: [['Was trägst du sonst?', '„Gefallene, meistens. Monsterreste. Manchmal Kisten, die atmen. Die trag ich nicht gern.“'],
      ['Wie ist es, ein Halbgott zu sein, der Kisten trägt?', '„Ehrlich. Oben hab ich gebetet. Hier trag ich. Ich weiß nicht, was mehr wiegt.“']] },
  cw_noel_bellcross: { role: 'Koch in der Gemeinschaftsküche. Sucht seine Frau Ida.', gruss: '„Setz dich. Der kleine Topf ist für Neue, der große für alle anderen. Hast du meine Frau gesehen? Nein. Natürlich nicht.“',
    themen: [['Was kochst du hier?', '„Suppe für Halbgötter. Sie schmeckt nach nichts, aber sie wiegt etwas. Wer oben verbrannt wurde, muss erst wieder lernen, schwer zu sein.“'],
      ['Wer ist Ida?', '„Eine Halbengel. Sie fiel vor sechs Jahren, direkt in meine Küche, durchs Dach. Ich hab sie geheiratet, statt das Dach zu flicken.“']] },
  cw_malliver: { role: 'Restauratorin im Kronenarchiv. Stellt verbrannte Seiten wieder her.', gruss: '„Bitte nicht über die Arbeitsfläche atmen. Ich kann Asche lesen, aber nicht, wenn sie wegfliegt.“',
    themen: [['Was restaurierst du?', '„Verbranntes. Wer oben verbrannt wird, verliert nicht nur Gewicht. Er verliert Seiten aus seinem Leben. Manche finde ich wieder, in den Gruben, in den Mauern.“'],
      ['Was ist das Kronenarchiv?', '„Das Gedächtnis der Gefallenen. Wetherby leitet es. Er sagt, er schützt es. Ich sage, er sortiert es.“']] },
  cw_crayford: { role: 'Buchbinderin. Ihre Werkstatt ist deine Bleibe in Calderwick.', gruss: '„Noch kenne ich deine Hände nicht. Leg sie sichtbar hin. Und wenn du schläfst, schlaf auf der Seite ohne Leim.“',
    themen: [['Warum hilfst du mir?', '„Weil du gefallen bist und noch nicht aufgegeben hast. Das sieht man hier selten genug. Die Werkbank ist deine, solange du sie nicht verklebst.“'],
      ['Was bindest du?', '„Alles, was zusammengehört und auseinanderfallen will. Bücher. Aussagen. Manchmal Leute.“']] },
  cw_wetherby: { role: 'Direktor des Kronenarchivs. Ein gefallener Engel.', gruss: '„Ihr Anliegen ist noch keiner Stelle zugeordnet. Sprechen Sie langsam. Ich habe Zeit, ich hatte immer Zeit.“',
    themen: [['Was waren Sie oben?', '„Ein Engel. Ich stand auf dem Grat. Dann habe ich eine Frage gestellt, die man dort nicht stellt, und bin gefallen. Seitdem ordne ich.“'],
      ['Wie kommt man wieder hinauf?', '„Mit dem zweiten Zug. Er nimmt Heilige, und auch die nur, wenn jemand für sie bürgt. Ich bürge für niemanden. Fast niemanden.“']] },
  cw_pritch: { role: 'Verwalter der Kasse der Gefallenen. Zahlt Kopfgelder.', gruss: '„Wer nur zuhören will, darf mitessen. Wer kämpfen will, liest erst das Brett.“',
    themen: [['Was ist die Kasse der Gefallenen?', '„Ein Topf. Jeder Gefallene zahlt ein, was er kann. Davon zahlen wir Leute wie dich, die die Abtrünnigen erledigen. Die, die andere ernten, um leichter zu werden.“'],
      ['Haben Sie selbst geerntet?', 'Pritch schweigt lange. „Einmal“, sagt er dann. „Darum verwalte ich jetzt die Kasse.“']] },
  cw_bexley: { role: 'Hauswart der Witwenterrasse. Vermietet Betten an Gefallene.', gruss: '„Bist du schon einmal hier gewesen? Die Stufen klingen bekannt. Alle, die fallen, klingen gleich, wenn sie zum ersten Mal hochsteigen.“',
    themen: [['Wer wohnt hier?', '„Witwen. Also Leute, die oben jemanden verloren haben. Sich selbst, meistens.“'],
      ['Was weißt du über Sequenz 0?', '„Dass jeder hier davon träumt und keiner es sagt. Ein Gott werden. Wer laut davon redet, wird ausgelacht. Wer leise davon redet, wird gefährlich.“']] },
  cw_wicksend: { role: 'Pfandleiherin am Quittungsmarkt. Kauft, was Gefallene nicht mehr brauchen.', gruss: '„Schau erst. Eigentum entsteht hier nicht durch Anfassen. Und was von oben mitgefallen ist, gehört dem, der es zuerst findet.“',
    themen: [['Was bringen die Gefallenen?', '„Was oben übrig blieb. Halbe Heiligenscheine, verbogene Federn, Gebete auf Papier. Das meiste ist wertlos. Das Wertvolle verkauft niemand.“'],
      ['Wovon lebt Calderwick?', '„Von Monstern. Was man aus ihnen schneidet, verkaufe ich. Was sie von uns schneiden, bezahlt die Kasse.“']] },
};

const STORY_NODES = {
  cw_darnell: {
    choices: [{ text: 'Trag mich ins Fallbuch ein.', next: 'k4s_fallbuch', hide_if_flags: ['k4s_fallbuch'] },
      { text: 'Die gestrichenen Einträge.', next: 'k4s_fallbuch_gestrichen', requires_flags: ['k4s_fallbuch'] }],
    nodes: {
      k4s_fallbuch: { text: 'Vera schlägt ein Buch auf, so dick wie eine Tür. Sie schreibt deinen Namen, deinen Pfad, deine Sequenz. Unter „Ursache“ schreibt sie, ohne zu fragen: verbrannt.\n\nDann blättert sie zurück, ohne es zu wollen, und du siehst es auch: Zwölf Einträge dieses Jahres sind gestrichen. Alle mit derselben Tinte, alle mit demselben geraden Strich. Kein Kreuz, kein Strich nach oben. Einfach weg.\n\n„Das war ich nicht“, sagt Vera leise. „Das Buch liegt nachts im Kronenarchiv. Frag Hesk. Er trägt die, die fallen. Er weiß, wohin.“',
        sets_flags: ['k4s_fallbuch'], choices: [{ text: 'Ich frage Hesk.', next: 'hub' }] },
      k4s_fallbuch_gestrichen: { text: '„Zwölf in einem Jahr. Früher war es einer alle paar Jahre. Und immer Halbgötter, die gerade schwer genug für die Gilden geworden waren. Als hätte jemand gewartet, bis sie reif sind.“', choices: [{ text: 'Zurück.', next: 'hub' }] },
    },
  },
  cw_hesk: {
    choices: [{ text: 'Wohin bringst du die Verschwundenen?', next: 'k4s_hesk', hide_if_flags: ['k4s_hesk'] }],
    nodes: {
      k4s_hesk: { text: 'Hesk setzt den Riemen ab. „Ich trag sie zweimal. Einmal vom Krater ins Bett. Und später, wenn sie stark geworden sind, holt sie jemand ab. Dann trag ich eine Kiste. Sie atmet. Ich bring sie zum Kronenarchiv, an das Gleis hinter dem Archivsaal. Von dort geht sie die Linie hinunter.“\n\nEr sieht dich nicht an. „Letzte Woche war es eine Halbengel. Noel Bellcross’ Frau. Die Kiste ist nicht angekommen. Der Zug war voll, sie steht noch in der Sortiergrube. Ich hab nichts gesagt. Ich sag es jetzt.“',
        sets_flags: ['k4s_hesk'], choices: [{ text: 'Ich hole sie da raus.', next: 'hub' }] },
    },
  },
  cw_noel_bellcross: {
    choices: [{ text: 'Ich weiß, wo Ida ist.', next: 'k4s_noel', requires_flags: ['k4s_hesk'], hide_if_flags: ['k4s_noel', 'k4s_ida'] },
      { text: 'Ida ist frei.', next: 'k4s_noel_dank', requires_flags: ['k4s_ida'], hide_if_flags: ['k4s_noel_dank'] }],
    nodes: {
      k4s_noel: { text: 'Noel lässt den Löffel fallen. „In der Sortiergrube? In einer Kiste?“ Er nimmt die Schürze ab, legt sie wieder an. „Ich kann nicht kämpfen. Ich war oben ein Halbgott des Kessels und jetzt koche ich Suppe. Bitte. Bring sie zurück.“',
        sets_flags: ['k4s_noel'], choices: [{ text: 'Ich bringe sie zurück.', next: 'hub' }] },
      k4s_noel_dank: { text: 'Noel steht an der Tür und weint in den großen Topf. „Ich salze ihn eben nach“, sagt er. Dann gibt er dir alles, was in der Kasse der Küche liegt. „Nimm es. Wir essen eine Woche lang Kartoffeln, das ist es wert.“',
        sets_flags: ['k4s_noel_dank'], gives_money: 3000, relation: { cw_noel_bellcross: 2 }, choices: [{ text: 'Danke, Noel.', next: 'hub' }] },
    },
  },
  cw_malliver: {
    choices: [{ text: 'Kannst du gestrichene Seiten lesen?', next: 'k4s_malliver', hide_if_flags: ['k4s_malliver'] },
      { text: 'Hier sind die drei verbrannten Seiten.', next: 'k4s_seite', requires_flags: ['k4s_malliver', 'k4s_brand1', 'k4s_brand2', 'k4s_brand3'], hide_if_flags: ['k4s_seite'] },
      { text: 'Starlings Eintrag, noch einmal.', next: 'k4s_seite_wieder', requires_flags: ['k4s_seite'] }],
    nodes: {
      k4s_malliver: { text: '„Gestrichen? Nein. Verbrannt, ja.“ Ruth zeigt auf eine Wand voller Glasrahmen mit Asche darin. „Wer Einträge streicht, verbrennt meistens auch die alten Seiten, aus denen man sie zurückverfolgen könnte. Aber Asche fliegt. In Calderwick fliegt sie in die Gruben: in die Alte Setzerei, in die Sortiergrube, ins Nullfundament.“\n\n„Bring mir drei verkohlte Seiten aus dem Fallbuch. Dann lese ich dir vor, wer hier zuerst gestrichen hat.“',
        sets_flags: ['k4s_malliver'], choices: [{ text: 'Ich suche sie.', next: 'hub' }] },
      k4s_seite: { text: 'Ruth legt die drei Seiten unter Glas und atmet nicht. Nach einer Stunde liest sie vor:\n\n„Lucius Starling. Gefallen vor einundvierzig Jahren. Pfad: unleserlich. Sequenz 4. Ursache: verbrannt.“ Darunter, in einer anderen Hand: „Ausgereist mit dem zweiten Zug. Bürge: O. Wetherby.“ Und darunter zwölf Namen, alle gestrichen, mit demselben geraden Strich.\n\nRuth legt die Lupe weg. „Er war einer von uns. Er hat zwölf Gefallene geerntet, um schwer genug für die Fahrt zu werden. Und Wetherby hat für ihn gebürgt.“ Sie sieht dich an. „Das Kronenarchiv erntet immer noch. Für ihn.“\n\nDu denkst an Kettlegate. An neun Fälle, die Starling „Ernte“ nannte. Er hat damit nicht angefangen. Er hat damit aufgehört, hier unten.',
        sets_flags: ['k4s_seite'], choices: [{ text: 'Klammer soll das binden.', next: 'hub' }] },
      k4s_seite_wieder: { text: '„Ausgereist mit dem zweiten Zug. Bürge: O. Wetherby.“ Ruth liest es dir noch einmal vor, ohne ins Glas zu sehen. Sie kann es auswendig.', choices: [{ text: 'Zurück.', next: 'hub' }] },
    },
  },
  cw_crayford: {
    choices: [{ text: 'Binde mir eine Akte: Starling.', next: 'k4s_akte', requires_flags: ['k4s_fallbuch', 'k4s_seite', 'k4s_ida'], hide_if_flags: ['k4s_akte'] },
      { text: 'Was fehlt noch für die Akte?', next: 'k4s_akte_fehlt', hide_if_flags: ['k4s_akte'] }],
    nodes: {
      k4s_akte: { text: 'Klammer legt alles nebeneinander: Veras Fallbuch mit den gestrichenen Namen, Ruths wiederhergestellte Seite, Idas Aussage über die Kisten und das Gleis. Sie bindet es mit rotem Faden in einen grauen Deckel.\n\n„Eine Akte ist kein Urteil“, sagt sie. „Aber wenn du damit zu Wetherby gehst, wird er nicht mehr so tun können, als hätte er nichts abgelegt.“ Sie klopft auf den Deckel. „Er sitzt in der Druckkammer hinter dem Archivsaal. Und er ist kein Archivar. Er ist ein Engel, auch wenn er gefallen ist. Geh nicht hin, solange du ein Halbgott bist.“',
        sets_flags: ['k4s_akte'], gives_items: { k4s_akte_starling: 1 }, choices: [{ text: 'Danke, Klammer.', next: 'hub' }] },
      k4s_akte_fehlt: { text: '„Für eine Akte brauche ich drei Dinge, die sich gegenseitig stützen: das Fallbuch, eine Seite, die beweist, wer gestrichen hat, und eine Zeugin, die die Kisten gesehen hat. Von innen, am besten.“', choices: [{ text: 'Zurück.', next: 'hub' }] },
    },
  },
  cw_wetherby: {
    choices: [{ text: 'Die Akte Starling auf den Tisch legen.', next: 'k4s_wetherby', requires_flags: ['k4s_akte'], hide_if_flags: [`won_${K4S_WETHERBY}`] }],
    nodes: {
      k4s_wetherby: { text: 'Wetherby liest die Akte, Seite für Seite, und korrigiert dabei einen Schreibfehler in Veras Handschrift. Dann klappt er sie zu.\n\n„Lucius war der Beste, den ich je hatte“, sagt er. „Er hat verstanden, dass Calderwick ein Acker ist. Halbgötter fallen, werden schwer, und wer erntet, steigt auf. Er hat mir versprochen, mich mitzunehmen. Beim nächsten Zug.“\n\n„Die Kisten gehen nach Briarholt. In der Kur wird das Gewicht aus ihnen gekocht und die Linie hinaufgeschickt. Zu ihm. Er braucht es, um oben zu bleiben.“ Wetherby steht auf. „Und Sie sind gerade schwer genug geworden, um geerntet zu werden.“',
        combat: K4S_WETHERBY, choices: [{ text: 'Kämpfen.' }] },
    },
  },
  cw_pritch: {
    choices: [{ text: 'Das Kopfgeldbrett der Kasse.', next: 'k4s_kasse' }],
    nodes: {
      k4s_kasse: { text: `Pritch tippt auf ein Brett mit vier Zetteln. „Abtrünnige. Gefallene, die andere ernten, um leichter zu werden. Jeder Zettel zahlt aus der Kasse, wenn du mir sagst, dass er erledigt ist.“\n\n${K4S_KOPFGELDER.map((k) => `• ${k.name}: ${k.tat} Lohn ${k.lohn.toLocaleString('de-DE')} Schilling.`).join('\n')}`,
        sets_flags: ['k4s_kasse_gesehen'], start_quests: ['k4s_kasse'], choices: [
          ...K4S_KOPFGELDER.map((k) => ({ text: `${k.name.split(',')[0]} ist erledigt.`, next: `${k.id}_lohn`, requires_flags: [`won_${k.id}`], hide_if_flags: [`${k.id}_bezahlt`] })),
          { text: 'Zurück.', next: 'hub' }] },
      ...Object.fromEntries(K4S_KOPFGELDER.map((k) => [`${k.id}_lohn`, { text: `Pritch streicht den Zettel durch, mit einem geraden Strich, und zählt ${k.lohn.toLocaleString('de-DE')} Schilling ab. „Einer weniger, der erntet.“`,
        sets_flags: [`${k.id}_bezahlt`], gives_money: k.lohn, choices: [{ text: 'Zurück zum Brett.', next: 'k4s_kasse' }] }])),
    },
  },
  cw_bexley: {
    choices: [{ text: 'Ein Bett für die Nacht?', next: 'k4s_bett' }],
    nodes: {
      k4s_bett: { text: '„Für Gefallene umsonst, für Halbgötter, die noch hinauf wollen, auch. Für Heilige nehme ich Miete.“ Bexley zeigt dir ein Bett unter einem Fenster ohne Glas. Du schläfst, ohne zu träumen, und wachst schwerer auf.',
        heal: 'full', nerves: 200, choices: [{ text: 'Danke.', next: 'hub' }] },
    },
  },
};

/** Ida, frei: eigene, neue Rolle (die alte Akte-Figur „verschleppte Setzerin“ hatte nur Verhör-Zweige). */
function idaDialog() {
  return {
    start: 'start',
    nodes: {
      start: { text: 'Ida sitzt am Küchentisch, eine Decke um die Schultern, und hält eine Tasse, ohne zu trinken. Wo ihre Flügel sein sollten, sind zwei Narben aus Licht. „Du warst das in der Grube“, sagt sie.',
        choices: [{ text: 'Was ist mit dir passiert?', next: 'aussage' }, { text: 'Wohin wollten sie dich bringen?', next: 'briarholt' }, { text: 'Ruh dich aus.', next: 'ende' }] },
      aussage: { text: '„Ich war schwer genug geworden. Die Gilde der Laterne hatte mich zur Prüfung zugelassen. In der Nacht danach hat mich jemand im Schlaf eingepackt. Ich habe gehört, wie einer sagte: ‚Reif.‘ Wie bei Obst.“ Sie dreht die Tasse. „Die Kisten tragen den Stempel des Kronenarchivs. Das sage ich jedem, der es aufschreiben will.“',
        sets_flags: ['k4s_ida_aussage'], choices: [{ text: 'Noch etwas.', next: 'start' }] },
      briarholt: { text: '„Die Linie hinunter. Briarholt. Ein Kurort, sagen sie, für Gefallene, die nicht mehr können. In der Kiste roch es nach Kräutersud und nach etwas, das ich oben gerochen habe, am Grat. Licht, das man kocht.“', choices: [{ text: 'Noch etwas.', next: 'start' }] },
      ende: { text: '„Noel macht Suppe. Er macht immer Suppe, wenn er nicht weiß, was er sagen soll. Ich bleibe.“', choices: [{ text: 'Bis bald.' }] },
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------------

const BRAND_ORTE = ['cw_alte_setzerei', 'cw_sortiergrube', 'cw_nullfundament'];
const BRAND_TEXT = [
  'Zwischen geschmolzenen Lettern klemmt ein verkohltes Blatt. Die Linien sind die des Fallbuchs, die Schrift ist Asche. Ruth kann es vielleicht lesen.',
  'Unter einem Haufen leerer Rohrpostkapseln liegt eine angesengte Seite. Am Rand ist noch ein Stempel zu erkennen: Kronenarchiv, Ablage.',
  'Im Fundament, wo nichts steht, liegt eine Seite, die nicht ganz verbrannt ist. Jemand hat sie hier unten verbrennen wollen, wo keiner sucht.',
];

/** Briarholt (Kapitel 5): Ziel der Linie nach unten. */
export const K5_ANKUNFT = { map: 'bh_kutschenhof', spawn: 'kutsche' };
export const K4_ENDE_FLAGS = ['kapitel4_done', 'bha_reise_frei', 'k4s_linie'];
export { schlag };

export function applyCalderwickStory(content) {
  const enc = content.encounters;
  enc[K4S_WETHERBY] = wetherbyKampf();
  content.loot[K4S_WETHERBY] = { money: [8000, 8000], drops: [] };
  enc[K4S_ERNTEHELFER] = erntehelferKampf(content);
  content.loot[K4S_ERNTEHELFER] = { money: [1500, 1500], drops: [] };
  for (const k of K4S_KOPFGELDER) { enc[k.id] = kopfgeldKampf(k); content.loot[k.id] = { money: [800, 1200], drops: [] }; }

  content.items.k4s_akte_starling = { name: 'Akte Starling', kind: 'key', weight: 0, desc: 'Grauer Deckel, roter Faden. Das Fallbuch, Starlings wiederhergestellter Eintrag und Idas Aussage. Gebunden von Klammer.' };

  // Figuren umbauen: neue Rolle, neuer Gruß, neue Themen, Story-Zweige; Akte-Reste und Allerwelts-Themen raus
  for (const [id, f] of Object.entries(FIGUREN)) {
    const npc = content.npcs[id];
    const d = npc && content.dialogues[npc.dialogue];
    if (!d?.nodes?.hub) continue;
    npc.role = f.role;
    for (const g of ['gruss_niedrig', 'gruss_mittel', 'gruss_hoch']) if (d.nodes[g]) d.nodes[g].text = f.gruss;
    const story = STORY_NODES[id] ?? { choices: [], nodes: {} };
    Object.assign(d.nodes, story.nodes);
    f.themen.forEach(([frage, antwort], i) => { d.nodes[`k4s_thema${i + 1}`] = { text: antwort, choices: [{ text: 'Noch eine Frage.', next: 'hub' }, { text: 'Danke.', next: 'abschied' }] }; });
    const alt = d.nodes.hub.choices.filter((c) => !c.next || !/^(thema_|pfad$|bitte)/.test(c.next)); // cwa_: Nebenakte (calderwickAkte.js) bleibt
    const abschied = alt.filter((c) => c.next === 'abschied');
    d.nodes.hub.choices = [...story.choices, ...f.themen.map(([frage], i) => ({ text: frage, next: `k4s_thema${i + 1}` })), ...alt.filter((c) => c.next !== 'abschied'), ...abschied];
  }
  // Ida: nur noch in der Küche, sobald sie frei ist
  if (content.npcs.cw_ida_bellcross) {
    content.npcs.cw_ida_bellcross.role = 'Gefallene Halbengel. Aus einer Kiste in der Sortiergrube befreit.';
    content.dialogues.k4s_ida = idaDialog();
    content.npcs.cw_ida_bellcross.dialogue = 'k4s_ida';
  }
  // (Seb 2026-11-27: außer hinter Glas in der Nebenakte, Sortierhalle und Archivsaal; dort steht sie, solange sie gefangen ist)
  const gefangen = (n) => (n.visible_if?.requires_flags ?? []).some((f) => f === 'cwa_akt1_done' || f === 'cwa_ida_im_archiv');
  for (const m of Object.values(content.maps)) if (m.city === 'calderwick' && m.npcs) m.npcs = m.npcs.filter((n) => n.id !== 'cw_ida_bellcross' || gefangen(n));
  const kueche = content.maps.cw_kueche;
  if (kueche) {
    const noel = kueche.npcs.find((n) => n.id === 'cw_noel_bellcross');
    const t = freieKachel(kueche, { near: noel ? [noel.tile[0] + 2, noel.tile[1]] : null });
    if (t) kueche.npcs.push({ id: 'cw_ida_bellcross', tile: t, visible_if: { requires_flags: ['k4s_ida'] } });
  }
  // Wetherby: nach dem Kampf nicht mehr in der Druckkammer
  for (const id of ['cw_druckkammer', 'cw_villa']) for (const n of content.maps[id]?.npcs ?? []) if (n.id === 'cw_wetherby') n.visible_if = { ...(n.visible_if ?? {}), hide_if_flags: [...(n.visible_if?.hide_if_flags ?? []), `won_${K4S_WETHERBY}`] };

  // Idas Kiste in der Sortiergrube
  const grube = content.maps.cw_sortiergrube;
  if (grube) {
    const t = freieKachel(grube, { seed: 'k4s_kiste', minDist: 14 });
    grube.interactables.push(
      { id: 'k4s_kiste_waechter', kind: 'combat', encounter: K4S_ERNTEHELFER, tile: t, prompt: 'Eine Kiste mit Atemlöchern', marker: true,
        visible_if: { requires_flags: ['k4_arrived'], hide_if_flags: [`won_${K4S_ERNTEHELFER}`] } },
      { id: 'k4s_kiste', kind: 'read', tile: t, prompt: 'Die Kiste öffnen', title: 'Eine Kiste mit Atemlöchern', marker: true,
        visible_if: { requires_flags: [`won_${K4S_ERNTEHELFER}`], hide_if_flags: ['k4s_ida'] }, done_flag: 'k4s_ida',
        text: 'Du hebelst den Deckel auf. Drinnen liegt eine Frau auf Stroh, zusammengekrümmt, die Hände um die Knie. Wo Flügel sein sollten, leuchten zwei Narben. Sie blinzelt ins Grubenlicht.\n\n„Ida“, sagt sie, bevor du fragst. „Ida Bellcross. Sag Noel, ich hab Hunger.“\n\nAuf dem Deckel steht ein Stempel: KRONENARCHIV, ABLAGE. Darunter, mit Kreide: BRIARHOLT, KUR.',
        effects: { sets_flags: ['k4s_ida'] } });
  }
  // Drei verbrannte Seiten in den Gefahrengebieten
  BRAND_ORTE.forEach((mid, i) => {
    const m = content.maps[mid];
    if (!m) return;
    const t = freieKachel(m, { seed: `k4s_brand${i + 1}`, minDist: 12 });
    if (t) m.interactables.push({ id: `k4s_brand${i + 1}`, kind: 'read', tile: t, prompt: 'Ein verkohltes Blatt', title: 'Eine verbrannte Seite', marker: true,
      visible_if: { requires_flags: ['k4_arrived'], hide_if_flags: [`k4s_brand${i + 1}`] }, done_flag: `k4s_brand${i + 1}`, text: BRAND_TEXT[i] });
  });
  // Kopfgelder: frei stehend in ihren Gebieten
  for (const k of K4S_KOPFGELDER) {
    const m = content.maps[k.zone];
    if (!m) continue;
    const t = freieKachel(m, { seed: k.id, minDist: 12 });
    if (t) m.interactables.push({ id: `${k.id}_ort`, kind: 'combat', encounter: k.id, tile: t, prompt: `${k.name.split(',')[0]} stellen`, marker: true,
      visible_if: { requires_flags: ['k4_arrived'], hide_if_flags: [`won_${k.id}`] } });
  }
  content.quests.k4s_kasse = {
    title: 'Die Kasse der Gefallenen', kind: 'side', case: 'kapitel4_aufstieg',
    summary: 'Ewan Pritch zahlt aus der Kasse der Gefallenen für jeden Abtrünnigen, der andere erntet, um leichter zu werden.',
    steps: K4S_KOPFGELDER.map((k) => ({ text: `${k.name}`, done: { requires_flags: [`${k.id}_bezahlt`] }, target: { map: k.zone, id: `${k.id}_ort`, label: content.maps[k.zone]?.name ?? k.zone } })),
    reward: { honor: 10, honor_reason: 'Kasse der Gefallenen' },
  };

  // Der zweite Zug: der Schaffner ohne Gesicht spricht jetzt von der Linie nach unten
  const archiv = content.maps.cw_kronenarchiv;
  const zug2 = archiv?.interactables.find((i) => i.id === 'auf_cw_zug2');
  if (zug2) zug2.text = 'Über dem Kronenarchiv endet ein Gleis in der Luft. Ein Schaffner ohne Gesicht wartet daneben, seit Jahren, sagen die Leute.\n\n„Der Zug nach oben fährt wieder“, sagt er. „Nicht für dich. Nicht so, wie du jetzt bist. Wer oben bestehen will, kommt als Heiliger, und selbst Heilige verbrennen dort ohne Bürgen.“\n\nEr nickt zu einem zweiten Gleis, das nach unten führt, hinter den Archivsaal. „Der Weg nach oben fängt manchmal unten an.“';
  if (archiv) {
    const t = freieKachel(archiv, { near: zug2 ? [zug2.tile[0] - 2, zug2.tile[1] + 2] : null, seed: 'k4s_linie' });
    archiv.interactables.push({ id: 'k4s_linie', kind: 'read', tile: t, prompt: 'Die Linie nach unten', title: 'Die Linie nach Briarholt', marker: true,
      visible_if: { requires_flags: [`won_${K4S_WETHERBY}`], hide_if_flags: ['k4s_linie'] }, scene: 'kapitel_ende',
      text: 'Hinter dem Archivsaal steht ein Frachtzug, beladen mit leeren Kisten. Wetherbys Frachtbrief passt auf jede einzelne: BRIARHOLT, KUR.\n\nDu steigst nicht in eine Kiste. Du setzt dich auf eine. Der Zug rollt an, nicht nach oben, sondern hinunter, durch Nebel und Frost, bis die Luft nach Kräutersud riecht.\n\nCalderwick bleibt hinter dir. Ida und Noel winken nicht, sie kochen. Irgendwo vor dir liegt ein Kurort, in dem Gefallene „geheilt“ werden, und am Ende der Linie, ganz oben, wartet Starling auf das, was dort gekocht wird.',
      effects: { sets_flags: K4_ENDE_FLAGS, complete_quests: ['k4_aufstieg', 'k4s_kasse'], start_quests: ['k5_kur'], travel: K5_ANKUNFT } });
  }

  // Kapitelziel: die Ernte der Gefallenen, offen in beliebiger Reihenfolge
  const q = content.quests.k4_aufstieg;
  if (q) {
    q.title = 'Kapitel 4: Die Ernte der Gefallenen';
    q.summary = 'Oben wurdest du verbrannt. Jetzt liegst du in Calderwick, der Stadt der Gefallenen. Zwölf von ihnen sind dieses Jahr verschwunden, gestrichen mit derselben Tinte. Jemand erntet hier, und die Spur führt zu Starling.';
    const vorne = q.steps.filter((s) => s.done?.requires_flags?.includes('auf_cw_aufgewacht'));
    const hinten = q.steps.filter((s) => !vorne.includes(s));
    q.steps = [...vorne,
      { text: 'Lass dich bei Vera Darnell ins Fallbuch eintragen', done: { requires_flags: ['k4s_fallbuch'] }, target: { map: 'cw_gepaeckhalle', id: 'cw_darnell', label: 'Gepäckhalle' } },
      { text: 'Frag den Träger Hesk, wohin die Verschwundenen gehen', done: { requires_flags: ['k4s_hesk'] }, target: { map: 'cw_roehrenhof', id: 'cw_hesk', label: 'Röhrenhof' } },
      { text: 'Befreie Ida Bellcross aus der Kiste in der Sortiergrube', done: { requires_flags: ['k4s_ida'] }, target: { map: 'cw_sortiergrube', id: 'k4s_kiste_waechter', label: 'Sortiergrube' } },
      { text: 'Bring Ruth Malliver drei verbrannte Seiten des Fallbuchs', done: { requires_flags: ['k4s_seite'] }, target: { map: 'cw_archivsaal', id: 'cw_malliver', label: 'Archivsaal' } },
      { text: 'Lass Klammer die Akte Starling binden', done: { requires_flags: ['k4s_akte'] }, target: { map: 'cw_buchbinderei', id: 'cw_crayford', label: 'Buchbinderei' } },
      ...hinten,
      { text: 'Stelle Wetherby in der Druckkammer (ein gefallener Engel)', done: { requires_flags: [`won_${K4S_WETHERBY}`] }, target: { map: 'cw_druckkammer', id: 'cw_wetherby', label: 'Druckkammer' } },
      { text: 'Nimm die Linie nach unten, nach Briarholt', done: { requires_flags: ['k4s_linie'] }, target: { map: 'cw_kronenarchiv', id: 'k4s_linie', label: 'Kronenarchiv' } }];
  }
  // Gerede
  const gossip = content.gossip?.calderwick;
  if (gossip) for (const map of Object.keys(gossip)) gossip[map] = [...gossip[map],
    { text: 'Zwölf in einem Jahr. Alle schwer genug für die Gilden, alle über Nacht weg. Die Monster waren es nicht, Monster stempeln keine Kisten.', requires_flags: ['k4_arrived'] },
    { text: 'Wetherby war ein Engel, sagen sie. Und Engel fallen nicht tief. Nur bis zur nächsten Stufe, auf der sie wieder von oben herabsehen können.', requires_flags: ['k4_arrived'] },
    { text: 'Briarholt? Ein Kurort, die Linie runter. Wer dort hingeht, kommt erholt zurück, sagt man. Ich kenne keinen, der zurückkam.', requires_flags: ['k4_arrived'] }];
  return content;
}
