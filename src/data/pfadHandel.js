/**
 * Pfad-Beyonder in Wexmoor (Seb, 2026-11-12): Zu jedem der zehn Pfade gibt es in Wexmoor einen Einzelgänger, der bei
 * den Kernzutaten für Sequenz 5 und 4 hilft. Die Art wechselt je nach Pfad: Wucher (sehr teuer), Gefallen bzw. schwere
 * Aufgabe oder ein Hinweis, bei welchen Gegnern die Zutat fällt. Seq 5 ist schwer, aber machbar. Seq 4 ist entweder sehr
 * teuer oder eine sehr schwere Aufgabe. Formeln geben die Einzelgänger NIE her (die gibt es nur auf geheimen Treffen
 * oder mit 0,5 % bei Elite-Gegnern, siehe core/PfadHandel.js).
 *
 * Dazu laufen die Einzelgänger je nach Tageszeit durch zwei bis drei Viertel (Tag A, Tag B an geraden Tagen, Nacht).
 * Neu sind drei Beyonder für Waage, Moor und Uhr: Maud Keel (die Pfandleiherin) und zwei neue Figuren.
 * Läuft in buildContent nach applySeq4 (die Kampfregeln stehen in core/PfadHandel.js).
 */
import { NIGHT_FLAG, DAY_B_FLAG } from '../core/Clock.js';

/** Ab dieser Beziehung reden die Einzelgänger über Zutaten. */
export const PH_BOND = 2;
/** Wer die Seq-4-Formel ohne Treffen sucht: Chance je Sieg über einen Elite-Gegner. */
export const FORMEL_ELITE_CHANCE = 0.005;
/** Uhr (Seq 5): so viele Sekunden Spielzeit für alle vier Schleusenräder. */
export const SCHLEUSEN_FRIST = 180;
/** Wexmoors Monstergebiete (Uhr, Seq 4: fünf Siege in einer Nacht). */
export const WX_ZONES = ['wx_vergessmoor', 'wx_salzwatt', 'wx_altstadt', 'wx_leuchtturm', 'wx_torfbrueche'];

const SEEN = ['k2_met_zunder'];

/** Die drei neuen Beyonder (Waage über Maud Keel, die es schon gibt). */
const NEW_LONERS = {
  wx_pfandleiherin: { name: 'Maud Keel', title: 'die Pfandleiherin', pathway: 'sq_waage', seq: 6, map: 'wx_salzmarkt', circle: null },
  ez_torfmutter: { name: 'Wenna Kolk', title: 'die Torfmutter', pathway: 'sq_moor', seq: 6, map: 'wx_pfahldorf', circle: null },
  ez_schleusenuhr: { name: 'Corvin Hake', title: 'der Schleusenuhrmacher', pathway: 'sq_uhr', seq: 6, map: 'wx_bahnhof', circle: null },
};

const NEW_NPCS = {
  ez_torfmutter: { name: 'Wenna Kolk, die Torfmutter', role: 'Einzelgänger · Pfad des Moores, Sequenz 6: Namensbank', dialogue: 'ez_torfmutter',
    palette: { coat: '#4a4630', hat: '#2a2818', skin: '#c8a888', hair: '#c0c0b0', legs: '#2a2818', scarf: '#6a7a40' } },
  ez_schleusenuhr: { name: 'Corvin Hake, der Schleusenuhrmacher', role: 'Einzelgänger · Pfad der Uhr, Sequenz 6: Gangbewahrer', dialogue: 'ez_schleusenuhr',
    palette: { coat: '#3a4450', hat: '#20262e', skin: '#d0b090', hair: '#7a6a5a', legs: '#20262e', scarf: '#b08a40' } },
};

/** Laufplan: tag = Tag A, tag_b = Tag B (gerade Tage der Jahreszeit), nacht. */
export const PH_SCHEDULE = {
  ez_brennerin: { tag: ['wx_torfstich', [15, 12]], tag_b: ['wx_bahnhof', [6, 8]], nacht: ['wx_pfahldorf', [23, 7]] },
  ez_reetkoenig: { tag: ['wx_torfstich', [5, 3]], tag_b: ['wx_pfahldorf', [27, 8]], nacht: ['wx_bahnhof', [26, 16]] },
  ez_spinnerin: { tag: ['wx_oberstadt', [12, 6]], tag_b: ['wx_salzmarkt', [24, 9]], nacht: ['wx_glocke', [3, 4]] },
  ez_maskenwirt: { tag: ['wx_salzmarkt', [34, 4]], tag_b: ['wx_oberstadt', [22, 5]], nacht: ['wx_glocke', [15, 4]] },
  ez_baender: { tag: ['wx_bojenhafen', [30, 3]], tag_b: ['wx_bahnhof', [33, 3]], nacht: ['wx_salzmarkt', [20, 10]] },
  ez_glockenfischer: { tag: ['wx_bojenhafen', [7, 7]], tag_b: ['wx_pfahldorf', [5, 10]], nacht: ['wx_bojenhafen', [17, 9]] },
  ez_schleusendieb: { tag: ['wx_bahnhof', [38, 14]], tag_b: ['wx_torfstich', [20, 6]], nacht: ['wx_salzmarkt', [36, 10]] },
  ez_torfmutter: { tag: ['wx_pfahldorf', [28, 9]], tag_b: ['wx_torfstich', [11, 14]], nacht: ['wx_bahnhof', [8, 16]] },
  ez_schleusenuhr: { tag: ['wx_bahnhof', [12, 8]], tag_b: ['wx_oberstadt', [38, 8]], nacht: ['wx_bojenhafen', [12, 9]] },
  // Maud bleibt an ihrem Pfandtisch (Laden, immer da); sie verschwindet nur, wenn man sie besiegt
  wx_pfandleiherin: {},
};

/** Kurzes Herumlaufen um die eigene Stelle (WorldScene: roam). */
const ROAM = { speed: 12, radius: 3 };

// --- Angebote --------------------------------------------------------------------------------------------------------
// kind: wucher (Preis, ggf. Zusatzware), gefallen/aufgabe (Auftrag, dann Lohn), hinweis (Zutat fällt bei Gegnern).
// task: Art der Prüfung, die core/PfadHandel.js auswertet.
const Z = (pid, n) => `sq_zutat_${pid}_${n}`;
export const PH_OFFERS = [
  // Laterne
  { id: 'laterne5', npc: 'ez_brennerin', pathway: 'laterne', seq: 5, kind: 'gefallen', item: 'lichtperle', task: 'laternen',
    ask: '„Im Vergessmoor stehen drei alte Moorlaternen, aus der Zeit, als man dort noch Torf stach. Das Lichtamt hat sie ausgehen lassen. Zünde alle drei in einer einzigen Nacht wieder an. An jeder lauert ein Weißlicht, das dir das Feuer nicht gönnt.“',
    done: '„Drei Lichter, eine Nacht.“ Mara legt dir eine Perle in die Hand, die im Dunkeln heller wird. „Lichtperle. Die gebe ich nicht jedem.“' },
  { id: 'laterne4', npc: 'ez_brennerin', pathway: 'laterne', seq: 4, kind: 'wucher', item: Z('laterne', 4), price: 3500,
    ask: '„Einen Zeugendocht? Der hat gebrannt, während jemand gelogen hat, und er hat sich die Lüge gemerkt. Ich habe genau einen. 3500 Schilling, und ich handle nicht.“',
    done: 'Mara wickelt den Docht in schwarzes Tuch. „Verschwende ihn nicht.“' },
  // Faden
  { id: 'faden5', npc: 'ez_spinnerin', pathway: 'faden', seq: 5, kind: 'hinweis', item: 'spindelknochen', drops: { namensmade: 0.1, namensmade_elite: 0.2 },
    ask: '„Spindelknochen? Die Namensmaden in der versunkenen Altstadt fressen sich durch alte Webstühle. Manche tragen einen Knochen in sich, der sich noch dreht. Selten. Sehr selten. Aber es gibt sie.“' },
  { id: 'faden4', npc: 'ez_spinnerin', pathway: 'faden', seq: 4, kind: 'aufgabe', item: Z('faden', 4), task: 'kampf', fight: 'ph_namenlose_echo', rules: { noHeal: true }, at: ['wx_vergessmoor', [39, 18]],
    spot: { prompt: 'Den Faden ins Moor werfen', text: 'Agathes grauer Faden sinkt ins schwarze Wasser. Etwas packt ihn von unten, zieht, und dann steigt sie herauf: die Namenlose, oder das, was von ihr übrig blieb. Größer. Hungriger. Heilen wird hier nicht helfen, der Faden saugt jede Wunde fest.' },
    ask: '„Die Namenlose ist nicht ganz fort. Ihr Echo hängt noch im Moor, und es hält eine Lückenspule fest. Ich gebe dir einen Faden, den wirfst du an der Insel ins Wasser. Was dann kommt, besiegst du ohne jede Heilung. Der Faden lässt keine zu.“',
    done: 'Agathe nimmt die nasse Spule, wickelt einen einzigen Faden ab und gibt sie dir zurück. „Lückenspule. Was fehlt, hält sie fest.“' },
  // Maske
  { id: 'maske5', npc: 'ez_maskenwirt', pathway: 'maske', seq: 5, kind: 'wucher', item: 'schminkasche', price: 1200,
    ask: '„Schminkasche. Der Rest einer Theaterschminke, die einmal ein ganzes Gesicht getragen hat. 1200 Schilling. Ja, das ist Wucher. Nein, ich schäme mich nicht.“',
    done: 'Ambrose schiebt dir ein Döschen über den Tresen. „Trag sie mit Würde.“' },
  { id: 'maske4', npc: 'ez_maskenwirt', pathway: 'maske', seq: 4, kind: 'aufgabe', item: Z('maske', 4), task: 'siegel', needs: { ph_hales_siegel: 1 },
    ask: '„Hale trägt ein Siegel, mit dem er Haftbefehle macht. Es liegt nachts im Wachhaus, in seiner Schreibstube. Geh hinein, während die ganze Stadt nach dir sucht, mit voller Fahndung, und bring es mir. Ein Gesicht, das gesucht wird und trotzdem durchkommt, das ist der Wachs, den ich brauche.“',
    done: 'Ambrose dreht Hales Siegel zwischen den Fingern und lacht leise. Dann gibt er dir ein Stück Wachs, auf dessen Rückseite ein Gesicht eingedrückt ist. „Rückseitenwachs. Verdient.“' },
  // Echo
  { id: 'echo5', npc: 'ez_glockenfischer', pathway: 'echo', seq: 5, kind: 'hinweis', item: 'atemglas', drops: { nebelfischer_elite: 0.25, nebelfischer: 0.06 },
    ask: '„Atemglas? Die ertrunkenen Kapitäne im Salzwatt tragen ihren letzten Atemzug in einem Glas am Gürtel. Die alten. Die gewöhnlichen Nebelfischer fast nie.“' },
  { id: 'echo4', npc: 'ez_glockenfischer', pathway: 'echo', seq: 4, kind: 'aufgabe', item: Z('echo', 4), task: 'ertrunkene',
    fights: [
      { id: 'ph_ertrunkener_1', at: ['wx_salzwatt', [25, 5]], prompt: 'Den Lotsen rufen' },
      { id: 'ph_ertrunkener_2', at: ['wx_salzwatt', [35, 12]], prompt: 'Die Netzflickerin rufen' },
      { id: 'ph_ertrunkener_3', at: ['wx_salzwatt', [41, 21]], prompt: 'Den Glöckner rufen' },
    ], rules: { deaf: true },
    ask: '„Drei liegen im Salzwatt, die nie zur Ruhe kamen: ein Lotse, eine Netzflickerin, ein Glöckner. Ruf sie, und sie kommen. Aber unter Wasser hört man nichts, keinen Schrei, keine Warnung. Bring alle drei zur Ruhe.“',
    done: 'Ole hält sein Ohr an die Glocke an seinem Gürtel. „Still“, sagt er. „Endlich still.“ Er gibt dir ein Fläschchen, in dem nichts ist, nicht einmal Luft. „Atempause.“' },
  // Kessel
  { id: 'kessel5', npc: 'ez_reetkoenig', pathway: 'kessel', seq: 5, kind: 'gefallen', item: 'goldschimmel', task: 'sammeln', needs: { ph_torfprobe: 5, moorwasser: 1 }, drops: { '@wx_vergessmoor': 0.35 }, dropItem: 'ph_torfprobe',
    ask: '„Ich brauche Torf aus dem Vergessmoor, aber nicht irgendeinen. Fünf Proben aus den Leibern der Dinger, die dort laufen, dazu eine Flasche Moorwasser. Dann braue ich dir Goldschimmel.“',
    done: 'Hagen kippt alles in den Kessel. Es zischt, es stinkt, und am Ende kratzt er einen goldenen Belag vom Rand. „Goldschimmel. Frisch.“' },
  { id: 'kessel4', npc: 'ez_reetkoenig', pathway: 'kessel', seq: 4, kind: 'wucher', item: Z('kessel', 4), price: 4000, needs: { nebelherz: 2, moorperle: 3 },
    ask: '„Fehlchargensalz. Bleibt übrig, wenn ein Trank misslingt, der eine Stadt hätte retten können. 4000 Schilling, zwei Nebelherzen und drei Moorperlen. Die Herzen und Perlen kommen in den nächsten Kessel, das Geld in meine Tasche.“',
    done: 'Hagen gibt dir einen Klumpen graues Salz. „Nicht ablecken.“' },
  // Eisen
  { id: 'eisen5', npc: 'ez_baender', pathway: 'eisen', seq: 5, kind: 'gefallen', item: 'schwertsplitter', task: 'serie', zone: 'wx_salzwatt', count: 3, rules: { noHeal: true },
    ask: '„Geh ins Salzwatt und gewinn drei Kämpfe hintereinander, ohne dich zu heilen. Kein Trank, kein Verband, kein Schlaf dazwischen. Wer verliert oder wegläuft, fängt von vorn an.“',
    done: 'Tobin legt dir einen Splitter in die Hand, kalt und schwer. „Hundert Kämpfe. Deiner war der hundertunderste.“' },
  { id: 'eisen4', npc: 'ez_baender', pathway: 'eisen', seq: 4, kind: 'aufgabe', item: Z('eisen', 4), task: 'kampf', fight: 'ph_leuchtfeuer_elite', rules: { noDodge: true }, at: ['wx_leuchtturm', [40, 6]],
    spot: { prompt: 'Die Kette am Turmfuß anschlagen', text: 'Tobins Kette schlägt gegen den Stein, und der Turm antwortet. Das Licht oben dreht sich zurück, wird gelb, wird heiß. Das Leuchtfeuer kommt wieder, stärker als zuvor. Ausweichen gibt es nicht. Ein Eisen steht.' },
    ask: '„Im Leuchtturm sitzt eine Niete, die den ganzen Turm trägt. Sie kommt nur raus, wenn das Leuchtfeuer noch einmal brennt und du es besiegst, ohne ein einziges Mal auszuweichen. Schlag meine Kette am Turmfuß an.“',
    done: 'Tobin dreht die Niete im Licht. „Tragende Niete. Die hat einen Turm gehalten. Jetzt hält sie dich.“' },
  // Schlüssel
  { id: 'schluessel5', npc: 'ez_schleusendieb', pathway: 'schluessel', seq: 5, kind: 'wucher', item: 'schattenseide', price: 900, debt: 300,
    ask: '„Schattenseide, frisch aus einer Tür, die es nicht mehr gibt. 900 Schilling. Und du schuldest mir danach noch was, 300. Ich rufe die Schuld ein, wenn ich will.“',
    done: 'Fitz zieht etwas aus dem Ärmel, das du erst siehst, als du wegschaust. „Schattenseide. Und vergiss die Schuld nicht.“' },
  { id: 'schluessel4', npc: 'ez_schleusendieb', pathway: 'schluessel', seq: 4, kind: 'aufgabe', item: Z('schluessel', 4), task: 'tresor', at: ['wx_lichtamt', [5, 5]],
    ask: '„Im Lichtamt steht ein Tresor, in dem sie beschlagnahmte Schlüssel aufbewahren. Darin liegt ein Zollbart, der jede Grenze öffnet. Knack ihn, aber nur, wenn die Fahndung auf voller Stufe ist. Nur dann ist der Tresor offen, weil alle Wachen draußen nach dir suchen.“',
    done: 'Fitz pfeift durch die Zähne, als er den Zollbart sieht. „Behalt ihn. Du hast ihn dir verdient.“' },
  // Waage
  { id: 'waage5', npc: 'wx_pfandleiherin', pathway: 'sq_waage', seq: 5, kind: 'wucher', item: Z('waage', 5), pfand: 2,
    ask: '„Die Kernzutat? Habe ich. Aber nicht für Geld. Zwei Artefakte als Pfand, und ich gebe sie nicht zurück. Die Waage verlangt Gewicht, nicht Münzen.“',
    done: 'Maud wiegt die beiden Artefakte auf ihrer Handfläche, nickt und legt sie weg, wo du sie nie wieder siehst. Dann gibt sie dir die Zutat.' },
  { id: 'waage4', npc: 'wx_pfandleiherin', pathway: 'sq_waage', seq: 4, kind: 'wucher', item: Z('waage', 4), price: 5000,
    ask: '„Gleichfristblei. 5000 Schilling. Ich weiß, was es wert ist. Du weißt es auch.“',
    done: 'Maud zählt das Geld zweimal. Dann legt sie dir ein Bleistück in die Hand, das schwerer ist, als es aussieht.' },
  // Moor
  { id: 'moor5', npc: 'ez_torfmutter', pathway: 'sq_moor', seq: 5, kind: 'hinweis', item: Z('moor', 5), drops: { kellerkrebs: 0.1, kellerkrebs_elite: 0.2 },
    ask: '„Die Krebse im Ratskeller der versunkenen Altstadt fressen alte Urkunden. Manchmal bleibt ein Name in ihnen stecken, so tief, dass er Torf geworden ist. Such dort.“' },
  { id: 'moor4', npc: 'ez_torfmutter', pathway: 'sq_moor', seq: 4, kind: 'aufgabe', item: Z('moor', 4), task: 'kampf', fight: 'ph_buergermeister_echo', rules: { moorwater: true }, at: ['wx_altstadt', [29, 13]],
    spot: { prompt: 'Den Namen des Bürgermeisters ins Wasser sprechen', text: 'Du sprichst den Namen, den Wenna dir gegeben hat, und das Wasser in der Altstadt steigt. Der Bürgermeister kommt zurück, mit Amtskette und Algen. Jede Runde musst du Moorwasser trinken. Geht es dir aus, lässt das Moor dich los.' },
    ask: '„Der ertrunkene Bürgermeister hat einen Schichtnamen verschluckt. Ich gebe dir seinen Namen. Sprich ihn in der Altstadt ins Wasser und besiege ihn noch einmal, während du jede Runde einen Schluck Moorwasser trinkst. Nimm genug mit.“',
    done: 'Wenna wischt den Schlamm von einem Täfelchen, auf dem ein Name steht, den du nicht lesen kannst. „Schichtname. Er gehört jetzt dir.“' },
  // Uhr
  { id: 'uhr5', npc: 'ez_schleusenuhr', pathway: 'sq_uhr', seq: 5, kind: 'gefallen', item: Z('uhr', 5), task: 'schleusen',
    wheels: [['wx_bahnhof', [17, 10]], ['wx_torfstich', [32, 9]], ['wx_bojenhafen', [9, 8]], ['wx_pfahldorf', [33, 6]]],
    ask: `„Vier Schleusenräder in vier Vierteln: Bahnhof, Torfstich, Bojenhafen, Pfahldorf. Stell alle vier, bevor die Frist abläuft, ${SCHLEUSEN_FRIST / 60} Minuten ab dem ersten Rad. Zu spät, und du fängst wieder beim Rad an, an dem du gerade stehst.“`,
    done: 'Corvin lauscht. Irgendwo in der Stadt schließt sich eine Schleuse im Takt. Er lächelt und gibt dir die Zutat. „Pünktlich.“' },
  { id: 'uhr4', npc: 'ez_schleusenuhr', pathway: 'sq_uhr', seq: 4, kind: 'aufgabe', item: Z('uhr', 4), task: 'nacht', count: 5,
    ask: '„Fünf Siege in Wexmoors Monstergebieten, alle in derselben Nacht. Wer verliert oder flieht, fängt neu an. Wird es hell, auch.“',
    done: 'Corvin klappt seine Uhr auf. Zwischen zwei Sekunden steckt etwas. Er zieht es heraus wie einen Splitter. „Zwischensekunde. Die Nacht war lang genug.“' },
];

export const PH_ITEMS = {
  ph_torfprobe: { name: 'Torfprobe aus dem Vergessmoor', kind: 'trophy', price: 4, weight: 0.3, desc: 'Ein Klumpen Torf aus dem Leib eines Moorwesens. Hagen Wisp will fünf davon.' },
  ph_hales_siegel: { name: 'Hales Siegel', kind: 'trophy', price: 0, weight: 0.2, desc: 'Das Dienstsiegel des Hauptmanns. Ambrose Fell will es haben.' },
};

/** Gegner der Aufgaben: verstärkte Kopien bekannter Bosse und Eliten (keine eigene Beute, der Lohn kommt vom Einzelgänger). */
const PH_COPIES = {
  ph_namenlose_echo: { from: 'namenlose', hp: 1.6, dmg: 1.4, name: 'Echo der Namenlosen', intro: 'Sie steigt aus dem Wasser, größer als damals. Die Täfelchen an ihrem Leib klappern, und auf einem steht dein Name. Heilen kannst du hier nicht.' },
  ph_leuchtfeuer_elite: { from: 'leuchtfeuer', hp: 1.6, dmg: 1.4, name: 'Das wiederentzündete Leuchtfeuer', intro: 'Das Licht oben im Turm brennt wieder, gelb und heiß. Ausweichen ist verboten: Ein Eisen steht.' },
  ph_buergermeister_echo: { from: 'buergermeister', hp: 1.5, dmg: 1.3, name: 'Der wiederkehrende Bürgermeister', intro: 'Er steigt aus dem Wasser mit Amtskette und Algen. Jede Runde trinkst du Moorwasser.' },
  ph_ertrunkener_1: { from: 'nebelfischer_elite', hp: 1.6, dmg: 1.3, name: 'Der ertrunkene Lotse', intro: 'Er kommt ohne Laut. Unter Wasser gibt es keine Warnung.' },
  ph_ertrunkener_2: { from: 'nebelfischer_elite', hp: 1.6, dmg: 1.3, name: 'Die ertrunkene Netzflickerin', intro: 'Ihre Nadel bewegt sich, ohne dass du sie hörst.' },
  ph_ertrunkener_3: { from: 'nebelfischer_elite', hp: 1.7, dmg: 1.35, name: 'Der ertrunkene Glöckner', intro: 'Er schwingt eine Glocke, die keinen Ton gibt.' },
};

/** Einzelgänger-Kämpfe der drei neuen (Verrat oder Feindschaft), nach dem Muster der sieben aus wexmoor.json. */
function lonerFight(id, name, title, sheet, text, intro) {
  return {
    name: `${name}, ${title}`, sprite: `npc:${id}`, sheet, loner: true, occult: true, fleeable: false, hp: 130,
    intro: `${intro}\n\n${text}`,
    attacks: [
      { name: 'Erster Schlag', damage: 9, hits: [800, 1200] },
      { name: 'Sequenz 6', damage: 12, hits: [1100] },
      { name: 'Wut', action: 'taunt', value: 12, text: `${name} sieht dich an, und plötzlich weißt du wieder genau, was du getan hast. -8 Nerven.` },
      { name: 'Alles oder nichts', damage: 20, hits: [1800] },
    ],
    on_win: { sets_flags: [`${id}_besiegt`] }, lose_to: { map: 'wx_kahn', spawn: 'default' },
    lose_text: `Du wachst im Kahn auf, Zunder tupft dir die Stirn. „${name}? Mit der Sorte legt man sich nicht an.“`,
    win_text: `${name} geht in die Knie. „Nimm, was du willst. Aber komm nie wieder.“\n\nDann ist da niemand mehr, nur das, was zurückblieb.`,
    armor: 2, ramp: 0.02, hp_mult: 1.8, dmg_mult: 1.5, duo_full: true,
  };
}

const NEW_FIGHTS = {
  wx_pfandleiherin: lonerFight('wx_pfandleiherin', 'Maud Keel', 'die Pfandleiherin', 'enemy_ez_ds_walzenstimme', 'Einzelgänger · Pfad der Waage, Sequenz 6: Ausgleichsführer',
    'Maud legt die Lupe weg. „Du hast mich verpfändet. An die Grauspäher.“ Sie hebt eine Hand, und auf einmal ist alles, was du trägst, doppelt so schwer.'),
  ez_torfmutter: lonerFight('ez_torfmutter', 'Wenna Kolk', 'die Torfmutter', 'enemy_ez_ds_kalkbrennerin', 'Einzelgänger · Pfad des Moores, Sequenz 6: Namensbank',
    'Wenna steht bis zu den Knien im Wasser. „Du hast ihnen gesagt, wo ich die Namen verwahre.“ Das Moor um sie herum flüstert dir deinen eigenen zu.'),
  ez_schleusenuhr: lonerFight('ez_schleusenuhr', 'Corvin Hake', 'der Schleusenuhrmacher', 'enemy_ez_ds_rangierer', 'Einzelgänger · Pfad der Uhr, Sequenz 6: Gangbewahrer',
    'Corvin klappt seine Uhr zu. „Du hast mich verraten. Das war eine Minute zu früh.“ Um dich herum wird jede Bewegung zäh wie Teer.'),
};

const NEW_LOOT = {
  wx_pfandleiherin: { money: [40, 80], drops: [{ item: 'geisteressenz', chance: 0.5 }] },
  ez_torfmutter: { money: [15, 28], drops: [{ item: 'moorwasser', chance: 1 }, { item: 'geisteressenz', chance: 0.5 }] },
  ez_schleusenuhr: { money: [15, 28], drops: [{ item: 'uhr_taschen', chance: 0.6 }, { item: 'geisteressenz', chance: 0.5 }] },
};

// --- Dialoge ---------------------------------------------------------------------------------------------------------
const back = (id) => ({ text: 'Zurück.', next: [{ node: 'freund', requires_flags: [`${id}_freund`] }, { node: 'hub' }] });

/** Vollständiger Einzelgänger-Dialog (nach dem Muster der sieben aus wexmoor.json). */
function lonerDialogue(id, t) {
  const hideOpen = [`${id}_freund`, `${id}_feind`];
  return {
    start: [{ node: 'freund', requires_flags: [`${id}_freund`] }, { node: 'feind', requires_flags: [`${id}_feind`] }, { node: 'hub', requires_flags: [`${id}_getroffen`] }, { node: 'erst' }],
    nodes: {
      erst: { text: t.erst, sets_flags: [`${id}_getroffen`], choices: [{ text: t.nett_choice, next: 'nett' }, { text: t.grob_choice, next: 'grob' }] },
      nett: { text: t.nett, bond: { [id]: 1 }, choices: [{ text: 'Weiter.', next: 'hub' }] },
      grob: { text: t.grob, bond: { [id]: -1 }, choices: [{ text: 'Weiter.', next: 'hub' }] },
      hub: { text: t.hub, choices: [
        { text: 'Kann ich etwas für Sie tun?', next: 'auftrag', hide_if_flags: [`${id}_auftrag`, ...hideOpen] },
        { text: t.give_choice, next: [{ node: 'dank2', requires_flags: [`${id}_erledigt`] }, { node: 'dank' }], requires_flags: [`${id}_auftrag`], requires_item_counts: t.wants, hide_if_flags: hideOpen },
        { text: 'Was sind Sie, wenn ich fragen darf?', next: 'pfad' },
        { text: t.verrat_choice, next: [{ node: 'kampf', requires_bond_max: { [id]: -1 } }, { node: 'verrat' }], hide_if_flags: hideOpen },
        { text: 'Bis später.' },
      ] },
      auftrag: { text: t.auftrag, sets_flags: [`${id}_auftrag`], choices: [{ text: 'Mach ich.', next: 'hub' }] },
      dank: { text: t.dank, takes_items: t.wants, bond: { [id]: 2 }, gives_items: t.gift, sets_flags: [`${id}_erledigt`], choices: [{ text: 'Danke.', next: [{ node: 'freund', requires_flags: [`${id}_freund`] }, { node: 'hub' }] }] },
      dank2: { text: t.dank2, takes_items: t.wants, bond: { [id]: 2 }, choices: [{ text: 'Gern.', next: [{ node: 'freund', requires_flags: [`${id}_freund`] }, { node: 'hub' }] }] },
      pfad: { text: t.pfad, choices: [{ text: 'Verstehe.', next: 'hub' }] },
      verrat: { text: t.verrat, bond: { [id]: -2 }, nerves: -5, choices: [{ text: 'Weiter.' }] },
      kampf: { text: `${t.verrat}\n\n${t.rache}`, bond: { [id]: -3 }, combat: id, choices: [{ text: 'Kämpfen.' }] },
      freund: { text: t.freund, choices: [{ text: 'Bis später.' }] },
      feind: { text: t.feind, choices: [{ text: 'Es wird Zeit, das zu klären.', next: 'rache' }, { text: 'Gehen.' }] },
      rache: { text: t.rache, combat: id, choices: [{ text: 'Kämpfen.' }] },
    },
  };
}

const NEW_DIALOGUES = {
  ez_torfmutter: lonerDialogue('ez_torfmutter', {
    erst: 'Eine alte Frau sitzt auf einem umgedrehten Torfkorb und sortiert Holztäfelchen. Auf manchen steht ein Name, auf den meisten nicht.\n\n„Tritt nicht auf die Namen“, sagt sie, ohne aufzusehen.',
    nett_choice: '„Wem gehören sie?“', nett: '„Leuten, die sie vergessen haben. Ich verwahre sie, bis jemand fragt.“ Sie sieht auf. „Du fragst. Das ist selten. Ich bin Wenna.“',
    grob_choice: '„Was soll der Kram?“', grob: '„Kram.“ Wenna legt ein Täfelchen weg, sehr sorgfältig. „Den Namen merke ich mir.“',
    hub: 'Wenna Kolk sortiert weiter.', give_choice: 'Hier, fünf Flaschen Moorwasser.', wants: { moorwasser: 5 }, gift: { geisteressenz: 1, moorperle: 1 },
    auftrag: '„Das Moor trocknet mir die Täfelchen aus. Bring mir fünf Flaschen Moorwasser, dann bleiben die Namen lesbar.“',
    dank: 'Wenna gießt das Wasser über die Täfelchen. Einige Namen werden deutlicher. „Du hast Hände, die etwas aufbewahren. Komm wieder.“',
    dank2: 'Wenna nimmt das Wasser mit einem Nicken. „Die Namen danken dir.“',
    pfad: '„Pfad des Moores. Sequenz 6, Namensbank. Ich bewahre die Herkunft, auch wenn der Name fehlt. Zirkel brauche ich keinen.“',
    verrat_choice: 'Ihr Täfelchenlager den Grauspähern melden.', verrat: 'Du sagst einem Grauspäher, wo im Pfahldorf jemand Namen sammelt. Am nächsten Tag schwimmen Täfelchen im Kanal.',
    freund: 'Wenna hält dir ein leeres Täfelchen hin. „Für den Tag, an dem du deinen vergisst.“',
    feind: 'Wenna dreht sich weg und sortiert weiter. Dein Name ist nicht dabei.',
    rache: 'Wenna steht bis zu den Knien im Wasser. „Du hast ihnen gesagt, wo ich die Namen verwahre.“ Das Moor um sie herum flüstert dir deinen eigenen zu.',
  }),
  ez_schleusenuhr: lonerDialogue('ez_schleusenuhr', {
    erst: 'Ein Mann im Schleusenwärter-Mantel hält eine aufgeklappte Taschenuhr ans Ohr und zählt leise mit.\n\n„Achtzehn. Neunzehn. Sie stören bei zwanzig.“',
    nett_choice: 'Warten, bis er bei zwanzig ist.', nett: '„Zwanzig.“ Er klappt die Uhr zu und sieht dich an. „Sie können warten. Das können wenige. Corvin Hake, ich halte die Schleusen im Takt.“',
    grob_choice: '„Zählen Sie später weiter.“', grob: 'Corvin seufzt. „Jetzt muss ich von vorn anfangen. Das merke ich mir.“',
    hub: 'Corvin Hake hört auf seine Uhr.', give_choice: 'Hier, zwei Sternglas-Splitter.', wants: { sternglas: 2 }, gift: { geisteressenz: 1, uhr_taschen: 1 },
    auftrag: '„Meine Hemmung springt. Sternglas hält das Licht fest, das hält auch den Gang fest. Bring mir zwei Splitter.“',
    dank: 'Corvin setzt die Splitter in die Uhr. Das Ticken wird gleichmäßig wie ein Herzschlag. „Pünktlich. Das vergesse ich nicht.“',
    dank2: 'Corvin nimmt die Splitter mit einem Nicken. „Auf die Sekunde.“',
    pfad: '„Pfad der Uhr. Sequenz 6, Gangbewahrer. Ich erkenne die Abweichung, ohne den Ablauf zu leugnen. Zirkel? Die kommen nie pünktlich.“',
    verrat_choice: 'Seine Schleusenkammer den Grauspähern melden.', verrat: 'Du sagst einem Grauspäher, wer die Schleusen nachts verstellt. Am nächsten Morgen ist seine Kammer versiegelt.',
    freund: 'Corvin stellt deine Uhr, ohne zu fragen, eine Sekunde vor. „Damit du nie zu spät kommst.“',
    feind: 'Corvin sieht auf seine Uhr, nicht auf dich.',
    rache: 'Corvin klappt seine Uhr zu. „Du hast mich verraten. Das war eine Minute zu früh.“ Um dich herum wird jede Bewegung zäh wie Teer.',
  }),
};

/** Maud Keel (Pfandleiherin) wird zur Beyonderin der Waage: Kennenlernen, kleiner Gefallen, Verrat, Pfad. */
function withMaud(d) {
  const id = 'wx_pfandleiherin';
  const hideOpen = [`${id}_freund`, `${id}_feind`];
  const start = d.nodes.start;
  return {
    ...d,
    start: [{ node: 'feind', requires_flags: [`${id}_feind`] }, { node: 'start' }],
    nodes: {
      ...d.nodes,
      start: { ...start, sets_flags: [...(start.sets_flags ?? []), `${id}_getroffen`], choices: [
        ...start.choices.slice(0, -1),
        { text: 'Sie wiegen das Silber, ohne eine Waage zu benutzen.', next: 'ph_merkt', hide_if_flags: [`${id}_ph_gemerkt`] },
        { text: 'Kann ich etwas für Sie tun?', next: 'ph_auftrag', requires_flags: [`${id}_ph_gemerkt`], hide_if_flags: [`${id}_auftrag`, ...hideOpen] },
        { text: 'Hier, zwei Moorperlen.', next: 'ph_dank', requires_flags: [`${id}_auftrag`], requires_item_counts: { moorperle: 2 }, hide_if_flags: [`${id}_erledigt`, ...hideOpen] },
        { text: 'Was sind Sie, wenn ich fragen darf?', next: 'ph_pfad', requires_flags: [`${id}_ph_gemerkt`] },
        { text: 'Ihren Pfandtisch den Grauspähern melden.', next: [{ node: 'ph_kampf', requires_bond_max: { [id]: -1 } }, { node: 'ph_verrat' }], requires_flags: [`${id}_ph_gemerkt`], hide_if_flags: hideOpen },
        start.choices.at(-1),
      ] },
      ph_merkt: { text: 'Maud hebt eine Augenbraue. „Aufmerksam. Das ist selten in Wexmoor, und meistens teuer.“ Sie legt die Münzen in zwei Häufchen, beide gleich schwer. „Die Hand lügt nicht.“', sets_flags: [`${id}_ph_gemerkt`], bond: { [id]: 1 }, choices: [{ text: 'Weiter.', next: 'start' }] },
      ph_auftrag: { text: '„Moorperlen. Zwei. Die Leute im Vergessmoor finden sie bei den großen Dingern. Bring sie mir, und wir reden über Gewichte, die nicht jeder tragen kann.“', sets_flags: [`${id}_auftrag`], choices: [{ text: 'Mach ich.', next: 'start' }] },
      ph_dank: { text: 'Maud wiegt die Perlen auf der flachen Hand. „Gleich schwer. Gut.“ Sie schiebt dir etwas hinüber. „Du handelst ehrlich. Das merke ich mir.“', takes_items: { moorperle: 2 }, bond: { [id]: 2 }, gives_items: { geisteressenz: 1 }, sets_flags: [`${id}_erledigt`], choices: [{ text: 'Danke.', next: 'start' }] },
      ph_pfad: { text: '„Pfad der Waage. Sequenz 6, Ausgleichsführer. Ich trage meinen Anteil, bevor ich fremde Schuld wiege. Zirkel? Die wollen immer Rabatt.“', choices: [{ text: 'Verstehe.', next: 'start' }] },
      ph_verrat: { text: 'Du sagst einem Grauspäher, wo am Salzmarkt Diebesgut den Besitzer wechselt. Am nächsten Tag ist Mauds Tisch umgeworfen.', bond: { [id]: -2 }, nerves: -5, choices: [{ text: 'Weiter.' }] },
      ph_kampf: { text: 'Du sagst einem Grauspäher, wo am Salzmarkt Diebesgut den Besitzer wechselt.\n\nMaud legt die Lupe weg. „Du hast mich verpfändet. An die Grauspäher.“', bond: { [id]: -3 }, combat: id, choices: [{ text: 'Kämpfen.' }] },
      feind: { text: 'Maud sieht durch dich hindurch. „Ich kaufe nichts von dir. Und ich verkaufe dir nichts.“', choices: [{ text: 'Es wird Zeit, das zu klären.', next: 'rache' }, { text: 'Gehen.' }] },
      rache: { text: 'Maud legt die Lupe weg. „Du hast mich verpfändet.“ Sie hebt eine Hand, und auf einmal ist alles, was du trägst, doppelt so schwer.', combat: id, choices: [{ text: 'Kämpfen.' }] },
    },
  };
}

// --- Angebotsknoten --------------------------------------------------------------------------------------------------
const itemName = (c, id) => c.items[id]?.name ?? id;
const needsText = (c, needs) => Object.entries(needs ?? {}).map(([i, n]) => `${n}× ${itemName(c, i)}`).join(', ');

/** Knoten und Auswahlpunkte eines Angebots. Gibt { nodes, choices } für das Zutaten-Menü. */
function offerNodes(c, o, menu) {
  const base = `ph_${o.id}`;
  const active = `${base}_aktiv`;
  const fertig = `${base}_fertig`;
  const done = `${base}_done`;
  const item = itemName(c, o.item);
  const path = { requires_pathway: [o.pathway, o.seq + 1] };
  const nodes = {};
  const choices = [];
  const toMenu = { text: 'Zurück.', next: menu };
  const reward = { gives_items: { [o.item]: 1 }, sets_flags: [done], clears_flags: [active, fertig] };
  if (o.kind === 'wucher') {
    const cost = [o.price ? `${o.price} Schilling` : null, o.needs ? needsText(c, o.needs) : null, o.pfand ? `${o.pfand} Artefakte als Pfand` : null].filter(Boolean).join(' + ');
    choices.push({ text: `${item} (Sequenz ${o.seq}): Was soll das kosten?`, next: `${base}_frage`, ...path, hide_if_flags: [done] });
    nodes[`${base}_frage`] = { text: o.ask, choices: [
      { text: `Kaufen: ${cost}.`, next: `${base}_kauf`, ...(o.price ? { requires_money: o.price } : {}), ...(o.needs ? { requires_item_counts: o.needs } : {}), ...(o.pfand ? { requires_artifacts: o.pfand } : {}) },
      { text: 'Zu teuer.', next: menu },
    ] };
    nodes[`${base}_kauf`] = { text: o.done, ...reward, ...(o.price ? { takes_money: o.price } : {}), ...(o.needs ? { takes_items: o.needs } : {}),
      ...(o.pfand ? { pfad: { pfand: o.pfand } } : {}), ...(o.debt ? { sets_flags: [done, `ph_${o.npc}_schuld`] } : {}), choices: [toMenu] };
  } else if (o.kind === 'hinweis') {
    choices.push({ text: `${item} (Sequenz ${o.seq}): Wo finde ich das?`, next: `${base}_hinweis`, ...path });
    nodes[`${base}_hinweis`] = { text: o.ask, sets_flags: [`${base}_hinweis`], choices: [toMenu] };
  } else {
    choices.push({ text: `${item} (Sequenz ${o.seq}): Was verlangen Sie dafür?`, next: `${base}_frage`, ...path, hide_if_flags: [done, active] });
    nodes[`${base}_frage`] = { text: o.ask, choices: [{ text: 'Ich mache es.', next: `${base}_an` }, { text: 'Später.', next: menu }] };
    nodes[`${base}_an`] = { text: 'Abgemacht.', sets_flags: [active], pfad: { start: o.id }, choices: [toMenu] };
    const turnIn = o.needs ? { requires_item_counts: o.needs } : { requires_flags: [fertig] };
    choices.push({ text: `${item}: Erledigt.`, next: `${base}_lohn`, requires_flags: [active, ...(turnIn.requires_flags ?? [])], ...(o.needs ? { requires_item_counts: o.needs } : {}) });
    choices.push({ text: `${item}: Was war noch mal zu tun?`, next: `${base}_frage2`, requires_flags: [active], hide_if_flags: [fertig] });
    nodes[`${base}_frage2`] = { text: o.ask, choices: [toMenu] };
    nodes[`${base}_lohn`] = { text: o.done, ...reward, ...(o.needs ? { takes_items: o.needs } : {}), choices: [toMenu] };
  }
  return { nodes, choices };
}

/** Pfadnamen für die Menüzeile „taugt nur für …“. */
function pathName(c, pid) {
  return c.pathways[pid]?.name ?? pid;
}

/** Zutaten-Menü in den Dialog eines Einzelgängers einhängen. */
function withMenu(c, dialogue, npc, offers) {
  const menu = 'ph_menu';
  const pid = offers[0].pathway;
  const nodes = { ...dialogue.nodes };
  const choices = [];
  for (const o of offers) {
    const n = offerNodes(c, o, menu);
    Object.assign(nodes, n.nodes);
    choices.push(...n.choices);
  }
  const debtFlag = `ph_${npc}_schuld`;
  const debt = offers.find((o) => o.debt);
  if (debt) {
    choices.push({ text: `Schuld begleichen: ${debt.debt} Schilling.`, next: 'ph_schuld', requires_flags: [debtFlag], requires_money: debt.debt });
    nodes.ph_schuld = { text: 'Fitz zählt nach, ohne die Münzen anzusehen. „Quitt. Jetzt reden wir wieder über richtige Geschäfte.“', takes_money: debt.debt, clears_flags: [debtFlag], choices: [{ text: 'Zurück.', next: menu }] };
    // Solange die Schuld offen ist, bleibt das Seq-4-Angebot zu
    for (const ch of choices) if (ch.text.includes('(Sequenz 4)')) ch.hide_if_flags = [...(ch.hide_if_flags ?? []), debtFlag];
  }
  nodes[menu] = {
    text: `Was ich habe, taugt nur für den ${pathName(c, pid)}, und nur, wenn du schon weit bist: ab Sequenz 6 für die Zutat der 5, ab Sequenz 5 für die Zutat der 4. Formeln verkaufe ich nicht. Die gibt es nur bei den Zirkeln.`,
    choices: [...choices, back(npc)],
  };
  // Zugang: im Hub (ab Beziehung PH_BOND) und bei Freunden
  const entry = { text: 'Über Zutaten für höhere Sequenzen reden.', next: menu, requires_bond: { [npc]: PH_BOND } };
  for (const key of ['hub', 'freund', 'start']) {
    const node = nodes[key];
    if (!node || nodes[key].choices.some((ch) => ch.next === menu)) continue;
    if (key === 'start' && npc !== 'wx_pfandleiherin') continue;
    const list = [...node.choices];
    list.splice(Math.max(0, list.length - 1), 0, { ...entry, ...(npc === 'wx_pfandleiherin' ? { hide_if_flags: [`${npc}_feind`] } : {}) });
    nodes[key] = { ...node, choices: list };
  }
  // „Zurück“ landet bei Maud im Startknoten
  if (npc === 'wx_pfandleiherin') nodes[menu].choices = nodes[menu].choices.map((ch) => (ch.text === 'Zurück.' ? { text: 'Zurück.', next: 'start' } : ch));
  return { ...dialogue, nodes };
}

/** Objekte der Aufgaben (Laternen, Schleusenräder, Kampfstellen, Siegel, Tresor) als Dialog-Objekte auf den Karten. */
function taskSpots() {
  const spots = []; // [mapId, interactable, dialogueId, dialogue]
  const lantern = PH_OFFERS.find((o) => o.id === 'laterne5');
  [[28, 6], [39, 12], [45, 23]].forEach((tile, i) => {
    const d = `ph_laterne_${i + 1}`;
    spots.push(['wx_vergessmoor', { id: d, kind: 'dialogue', dialogue: d, title: 'Alte Moorlaterne', role: 'Maras Auftrag', tile, prompt: 'Die alte Moorlaterne ansehen', marker: true, lamp: { requires_ph_step: ['laterne5', i + 1] }, visible_if: { requires_flags: [`ph_${lantern.id}_aktiv`] } }, d, {
      start: [{ node: 'brennt', requires_ph_step: ['laterne5', i + 1] }, { node: 'tag', hide_if_flags: [NIGHT_FLAG] }, { node: 'an' }],
      nodes: {
        brennt: { text: 'Die Laterne brennt. Für diese Nacht.', choices: [{ text: 'Weiter.' }] },
        tag: { text: 'Eine alte Moorlaterne, kalt und voller Spinnweben. Mara sagte: nachts. Tagsüber ist das Licht nichts wert.', choices: [{ text: 'Weiter.' }] },
        an: { text: 'Du hältst das Streichholz an den Docht. Im Schilf leuchtet etwas Weißes auf und kommt näher.', choices: [{ text: 'Anzünden.', next: 'kampf' }, { text: 'Später.' }] },
        kampf: { text: 'Das Weißlicht stürzt sich auf die Flamme.', pfad: { step: ['laterne5', i + 1], fight: 'weisslicht_elite' }, choices: [{ text: 'Kämpfen.' }] },
      },
    }]);
  });
  const uhr = PH_OFFERS.find((o) => o.id === 'uhr5');
  uhr.wheels.forEach(([map, tile], i) => {
    const d = `ph_schleuse_${i + 1}`;
    spots.push([map, { id: d, kind: 'dialogue', dialogue: d, title: 'Schleusenrad', role: 'Corvins Auftrag', tile, prompt: 'Das Schleusenrad stellen', marker: true, visible_if: { requires_flags: [`ph_${uhr.id}_aktiv`], hide_if_flags: [`ph_${uhr.id}_fertig`] } }, d, {
      start: [{ node: 'steht', requires_ph_step: ['uhr5', i + 1] }, { node: 'rad' }],
      nodes: {
        steht: { text: 'Das Rad steht schon richtig. Die Frist läuft.', choices: [{ text: 'Weiter.' }] },
        rad: { text: 'Ein eisernes Schleusenrad, nass und schwer. Corvin hat dir die Stellung genannt.', choices: [{ text: 'Rad stellen.', next: 'gestellt' }, { text: 'Später.' }] },
        gestellt: { text: 'Du stemmst dich gegen das Rad, bis es einrastet. Irgendwo tickt eine Uhr.', pfad: { step: ['uhr5', i + 1] }, choices: [{ text: 'Weiter.' }] },
      },
    }]);
  });
  for (const o of PH_OFFERS) {
    const fights = o.fights ?? (o.fight ? [{ id: o.fight, at: o.at, prompt: o.spot.prompt, text: o.spot.text }] : []);
    fights.forEach((f, i) => {
      const d = `ph_${o.id}_stelle_${i + 1}`;
      const step = o.fights ? { step: [o.id, i + 1], fight: f.id } : { fight: f.id };
      spots.push([f.at[0], { id: d, kind: 'dialogue', dialogue: d, title: c0(f.prompt), role: 'Auftrag', tile: f.at[1], prompt: f.prompt, marker: true,
        visible_if: { requires_flags: [`ph_${o.id}_aktiv`], hide_if_flags: [`ph_${o.id}_fertig`] } }, d, {
        start: [...(o.fights ? [{ node: 'ruhe', requires_ph_step: [o.id, i + 1] }] : []), { node: 'ruf' }],
        nodes: {
          ruhe: { text: 'Hier ist es still. Diese Seele hat Ruhe.', choices: [{ text: 'Weiter.' }] },
          ruf: { text: f.text ?? 'Das Wasser wird still. Dann bewegt sich etwas darunter, ohne einen Laut.', choices: [{ text: 'Jetzt.', next: 'kampf' }, { text: 'Später.' }] },
          kampf: { text: 'Es kommt.', pfad: step, choices: [{ text: 'Kämpfen.' }] },
        },
      }]);
    });
  }
  // Maske (Seq 4): Hales Siegel im Wachhaus, nur mit voller Fahndung
  spots.push(['wx_wachhaus', { id: 'ph_siegel', kind: 'dialogue', dialogue: 'ph_siegel', title: 'Hales Schreibtisch', role: 'Ambroses Auftrag', tile: [25, 6], prompt: 'Hales Schreibtisch durchsuchen', marker: true,
    visible_if: { requires_flags: ['ph_maske4_aktiv'], hide_if_items: ['ph_hales_siegel'] } }, 'ph_siegel', {
    start: [{ node: 'offen', requires_wanted: 3 }, { node: 'zu' }],
    nodes: {
      zu: { text: 'Die Schublade ist abgeschlossen, und im Flur sitzt ein Grauspäher. Ambrose sagte: nur, wenn die ganze Stadt nach dir sucht. Dann ist hier niemand.', choices: [{ text: 'Weiter.' }] },
      offen: { text: 'Die Schreibstube ist leer, alle sind draußen und suchen dich. In der Schublade liegt Hales Siegel.', gives_items: { ph_hales_siegel: 1 }, choices: [{ text: 'Einstecken.' }] },
    },
  }]);
  // Schlüssel (Seq 4): Tresor im Lichtamt, nur mit voller Fahndung
  spots.push(['wx_lichtamt', { id: 'ph_tresor', kind: 'dialogue', dialogue: 'ph_tresor', title: 'Tresor des Lichtamts', role: 'Fitz’ Auftrag', tile: [5, 5], prompt: 'Den Tresor knacken', marker: true,
    visible_if: { requires_flags: ['ph_schluessel4_aktiv'], hide_if_flags: ['ph_schluessel4_fertig'] } }, 'ph_tresor', {
    start: [{ node: 'offen', requires_wanted: 3 }, { node: 'zu' }],
    nodes: {
      zu: { text: 'Der Tresor ist verriegelt, und zwei Beamte schreiben im Nebenraum. Fitz sagte: nur bei voller Fahndung, wenn alle draußen suchen.', choices: [{ text: 'Weiter.' }] },
      offen: { text: 'Das Amt ist leer. Fitz’ Trick funktioniert: drei Drehungen links, eine halbe rechts, ein Klopfen. Die Tür schwingt auf. Zwischen beschlagnahmten Schlüsseln liegt ein Zollbart.', sets_flags: ['ph_schluessel4_fertig'], choices: [{ text: 'Weiter.' }] },
    },
  }]);
  return spots;
}
const c0 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Laufplan als Kartenplatzierungen (Sichtbarkeit je Tageszeit), alte feste Platzierung entfällt. */
function scheduleNpcs(content) {
  const maps = content.maps;
  const own = (id) => (maps[id] = { ...maps[id], npcs: [...(maps[id].npcs ?? [])], interactables: [...(maps[id].interactables ?? [])] });
  for (const [npc, plan] of Object.entries(PH_SCHEDULE)) {
    const keepDay = !plan.tag; // Maud: Tagesstelle aus wexmoor.json bleibt, nur nicht nachts
    let base = null;
    for (const [mid, m] of Object.entries(maps)) {
      const defs = (m.npcs ?? []).filter((n) => n.id === npc);
      if (!defs.length) continue;
      base = base ?? defs[0].visible_if ?? null;
      const map = own(mid);
      map.npcs = map.npcs.flatMap((n) => {
        if (n.id !== npc) return [n];
        if (!keepDay) return [];
        const v = n.visible_if ?? {};
        return [{ ...n, visible_if: { ...v, hide_if_flags: [...new Set([...(v.hide_if_flags ?? []), `${npc}_besiegt`, ...(plan.nacht ? [NIGHT_FLAG] : [])])] } }];
      });
    }
    const v0 = base ?? { requires_flags: SEEN };
    const req = v0.requires_flags ?? [];
    const hide = [...new Set([...(v0.hide_if_flags ?? []), `${npc}_besiegt`])];
    const slot = {
      tag: { requires_flags: req, hide_if_flags: [...hide, NIGHT_FLAG, DAY_B_FLAG] },
      tag_b: { requires_flags: [...req, DAY_B_FLAG], hide_if_flags: [...hide, NIGHT_FLAG] },
      nacht: { requires_flags: [...req, NIGHT_FLAG], hide_if_flags: hide },
    };
    for (const [when, spot] of Object.entries(plan)) {
      if (!spot) continue;
      const [mid, tile] = spot;
      if (!maps[mid]) throw new Error(`Pfad-Beyonder: unbekannte Karte ${mid}`);
      own(mid).npcs.push({ id: npc, tile, facing: 'down', ...(keepDay ? {} : { roam: ROAM }), visible_if: { ...v0, ...slot[when] } });
    }
  }
}

/** Nach applySeq4 in buildContent. */
export function applyPfadHandel(content) {
  if (!content.loners || !content.maps.wx_salzmarkt) return content;
  content.items = { ...content.items, ...PH_ITEMS };
  content.npcs = { ...content.npcs, ...NEW_NPCS };
  content.loners = { ...content.loners, list: { ...content.loners.list, ...NEW_LONERS } };
  // Kampfgegner: neue Einzelgänger und die verstärkten Kopien
  const enc = { ...content.encounters, ...NEW_FIGHTS };
  for (const [id, cp] of Object.entries(PH_COPIES)) {
    const src = content.encounters[cp.from];
    if (!src) throw new Error(`Pfad-Beyonder: Vorlage ${cp.from} fehlt`);
    enc[id] = {
      ...src, name: cp.name, intro: cp.intro, hp: Math.round(src.hp * cp.hp), elite: true, fleeable: true,
      attacks: src.attacks.map((a) => (a.damage ? { ...a, damage: Math.round(a.damage * cp.dmg) } : a)),
      on_win: {}, win_text: `${cp.name} sinkt zurück. Diesmal für immer.`, pfad_handel: true,
    };
  }
  content.encounters = enc;
  // Wie die sieben aus wexmoor.json: Besiegte lassen die Zutat ihrer eigenen Sequenz fallen
  const ownIng = (id) => { const l = NEW_LONERS[id]; return Object.keys(content.pathways[l.pathway]?.seqs[l.seq]?.ingredients ?? {})[0]; };
  content.loot = { ...content.loot, ...Object.fromEntries(Object.entries(NEW_LOOT).map(([id, t]) => [id, { ...t, drops: [...(ownIng(id) ? [{ item: ownIng(id), chance: 1 }] : []), ...t.drops] }])) };
  // Dialoge
  const dialogues = { ...content.dialogues, ...NEW_DIALOGUES };
  dialogues.wx_pfandleiherin = withMaud(dialogues.wx_pfandleiherin);
  const byNpc = {};
  for (const o of PH_OFFERS) (byNpc[o.npc] ??= []).push(o);
  for (const [npc, offers] of Object.entries(byNpc)) {
    if (!dialogues[npc]) throw new Error(`Pfad-Beyonder: Dialog ${npc} fehlt`);
    dialogues[npc] = withMenu(content, dialogues[npc], npc, offers);
  }
  // Orte der Aufgaben
  for (const [mid, def, did, dlg] of taskSpots()) {
    if (!content.maps[mid]) throw new Error(`Pfad-Beyonder: unbekannte Karte ${mid}`);
    content.maps[mid] = { ...content.maps[mid], interactables: [...(content.maps[mid].interactables ?? []), def] };
    dialogues[did] = dlg;
  }
  content.dialogues = dialogues;
  scheduleNpcs(content);
  content.pfadHandel = { offers: PH_OFFERS };
  return content;
}
