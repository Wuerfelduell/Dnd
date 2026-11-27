/**
 * Rivale auf dem eigenen Pfad (Seb 2026-11-26, Brainstorming): ab Wexmoor geht ein zweiter Beyonder denselben Pfad.
 *
 * - Je Pfad ein fester Rivale (RIVALEN). Im Koop hat jeder Spieler den Rivalen seines Pfades (gleicher Pfad: derselbe).
 * - Er steigt parallel auf (core/Rivale.js): holt jeden Spieltag eine Sequenz auf, ist er gleichauf, zieht er manchmal
 *   eine Sequenz davon (höchstens eine).
 * - Er kauft Zutaten deines nächsten Tranks weg: auf dem Markt (je Spieltag) und auf geheimen Treffen (je Treffen).
 * - Er taucht in den Straßen und auf den Treffen auf: Kämpfen, Bestehlen, Bündnis anbieten (ab zwei Siegen) oder gehen.
 * - Manchmal steht er schon in deinem Ritualkreis: wer heute trinken will, muss ihn hinauswerfen.
 * - Seine Kämpfe: Gegner `rivale_<pfad>_<seq>` (machBeyonder, Pfad-Fertigkeiten), Beute mit Beyonder-Rest (RIVALE_REGELN.rest).
 */
import { machBeyonder } from './gegnerBeyonder.js';
import { restId } from './beyonderRest.js';

/** Je Pfad ein Rivale (Namen gelten in beiden Sprachen). Im Koop hat Spieler 2 einen eigenen (name2), auch auf demselben Pfad. */
export const RIVALEN = {
  laterne: { name: 'Corvin Ashby', name2: 'Ada Vellacott' },
  faden: { name: 'Mirela Thorn', name2: 'Rupert Glass' },
  maske: { name: 'Silas Morrel', name2: 'Liesl Varga' },
  echo: { name: 'Ines Halloway', name2: 'Emmerich Dahl' },
  kessel: { name: 'Bram Sutter', name2: 'Clara Penhallow' },
  eisen: { name: 'Garrick Holm', name2: 'Hedda Krone' },
  schluessel: { name: 'Nell Quist', name2: 'Felix Wren' },
  sq_waage: { name: 'Ottoline Brack', name2: 'Julius Arkwright' },
  sq_moor: { name: 'Fenna Rook', name2: 'Oskar Mire' },
  sq_uhr: { name: 'Tobias Merrin', name2: 'Wilma Tock' },
};

export const RIVALE_REGELN = {
  ab_flag: 'k2_arrived', // erst ab Wexmoor (in Kettlegate wäre es komisch, Seb)
  vorsprung: 0.3, // je Spieltag: gleichauf → eine Sequenz voraus
  markt: 0.35, // je Händler und Spieltag: eine Zutat deines nächsten Tranks ist weggekauft
  treffen: 0.45, // je Händler auf einem geheimen Treffen
  ritual: 0.35, // je Spieltag: steht schon im Ritualkreis (wenn er auf deiner Zielsequenz oder weiter ist)
  begegnung: 0.2, // je betretener Straße, höchstens einmal am Tag
  begegnung_treffen: 0.5, // auf dem Ort eines geheimen Treffens
  ruhe_tage: 1, // nach einer Niederlage hält er sich so viele Spieltage (dazu der laufende) zurück
  buendnis_siege: 2, // so oft muss man ihn geschlagen haben, bevor er ein Bündnis annimmt
  rest: 0.3, // Chance auf seinen Beyonder-Rest
  wache: 0.5, // Bündnis: Kosten des Rituals (Nerven, Unruhe) mit dem Rivalen als Wache am Kreis
  verrat: 0.15, // Bündnis: je Spieltag, an dem er dir eine Sequenz voraus ist, verrät er dich (Siege zählen wieder von vorn)
  jagd_hp: 1.2, // Gemeinsame Jagd (1× je Tag als Verbündeter): fremder Beyonder, so stark wie ein Rivale × das
  jagd_geld: 3, // Beute der Jagd: Geld × das (gegenüber einem Rivalen)
  jagd_essenz: 0.6, // Chance auf Geisteressenz
  aktion: 0.4, // je Begegnung (feindlich, nicht die erste): seine eigene Pfad-Aktion (RIVALE_ART)
  aktion_schaden: 0.12, // Gift/Stoß: Anteil der maximalen Leben
  aktion_gebuehr: 0.05, // Waage: Anteil deines Geldes (höchstens 5000)
  stehlen_basis: 0.45,
  stehlen_je_seq: 0.12, // je Sequenz, die du ihm voraus bist (bzw. minus, wenn er voraus ist)
  stehlen_pfad: 0.15, // Schlüssel und Maske stehlen leichter
  stehlen_min: 0.15,
  stehlen_max: 0.85,
  geschenk: 0.6, // als Verbündeter: Chance je Begegnung auf eine Zutat deines nächsten Tranks
  geld_je_seq: 60, // Diebesgut, wenn kein nächster Trank mehr ansteht: (10 − Sequenz) × so viel
};

/** Gegner-Grundlage je Sequenz: [Vorlage, Faktor]. Leben × Faktor, Schaden × √Faktor. */
const BASIS = {
  9: ['wxk_gleispluenderer', 0.8],
  8: ['wxk_gleispluenderer', 0.9],
  7: ['wxk_gleispluenderer', 1.15],
  6: ['wxk_moorhehler', 1],
  5: ['k3k_staubschmuggler_elite', 1],
  4: ['k4s_kg_aschmann', 1],
  3: ['k4s_kg_aschmann', 1.6],
  2: ['k4s_kg_aschmann', 2.5],
  1: ['k4s_kg_aschmann', 4],
};

/** Felder der Vorlage, die zu ihrer Geschichte gehören (Flags, Orte, Laufen auf der Karte). */
const WEG = ['roam', 'on_win', 'first_win', 'lose_to', 'win_text', 'flee_text', 'zone', 'id', 'pathway', 'wild', 'city', 'boss', 'sieg_flag', 'phase2', 'benannt', 'on_lose', 'on_flee', 'mittelboss'];

/** Gegner-Id; nr 2 = Rivale von Spieler 2 (eigener Name). */
export const rivaleEncId = (pid, seq, nr = 1) => `${nr === 2 ? 'rivale2' : 'rivale'}_${pid}_${seq}`;
export const rivaleName = (pid, nr = 1) => (nr === 2 ? RIVALEN[pid]?.name2 : RIVALEN[pid]?.name) ?? '?';

/**
 * Texte mit Platzhaltern: {name} (Name des Rivalen), Zahlen stehen direkt im Text (I18n ersetzt sie selbst).
 * [Deutsch, Englisch]; das englische Wörterbuch (src/i18n/en/rivale.json) wird daraus erzeugt (rivaleWoerterbuch).
 */
export const RIVALE_TEXTE = {
  erste: ['Ein fremdes Gesicht, das du trotzdem kennst: {name} geht denselben Pfad wie du. Seit Wexmoor kauft jemand die Zutaten weg, bevor du kommst. Jetzt weißt du, wer.',
    'A stranger\'s face you somehow know: {name} walks the same pathway as you. Since Wexmoor someone has been buying up the ingredients before you arrive. Now you know who.'],
  voraus: ['{name} steht dir im Weg, eine Sequenz weiter als du. Das Lächeln sagt: Ich war zuerst da.',
    '{name} stands in your way, one Sequence ahead of you. The smile says: I got here first.'],
  gleich: ['{name} lehnt an einer Hauswand und hat dich längst gesehen. Derselbe Pfad, dieselbe Sequenz. Einer von euch wird zuerst trinken.',
    '{name} leans against a wall and spotted you long ago. Same pathway, same Sequence. One of you will drink first.'],
  hinter: ['{name} folgt dir seit Tagen, einen Schritt hinter dir auf deinem Pfad, und mit jedem Tag näher.',
    '{name} has been following you for days, one step behind you on your pathway, and closer every day.'],
  treffen: ['Auf dem Treffen sitzt {name} schon in der ersten Reihe und bietet auf alles, was nach deinem Pfad riecht.',
    'At the gathering {name} already sits in the front row, bidding on everything that smells of your pathway.'],
  verbuendet: ['{name} nickt dir zu. Seit eurem Bündnis legt {name} zurück, was dir fehlt, statt es dir wegzukaufen.',
    '{name} nods to you. Since your alliance, {name} sets aside what you need instead of buying it out from under you.'],
  geschlagen: ['{name} sieht dich und wechselt die Straßenseite. Die letzte Niederlage sitzt noch.',
    '{name} sees you and crosses the street. The last defeat still stings.'],
  stehlen_ok: ['Ein Griff in die Manteltasche, als {name} sich umdreht. Du hast es.',
    'A dip into the coat pocket as {name} turns away. You have it.'],
  stehlen_nichts: ['Ein Griff in die Manteltasche, als {name} sich umdreht. Nur Kleingeld, aber immerhin.',
    'A dip into the coat pocket as {name} turns away. Only coins, but still.'],
  stehlen_fehl: ['{name} packt dein Handgelenk. „Das war dumm.“',
    '{name} grabs your wrist. "That was stupid."'],
  stehlen_heute: ['{name} hält heute die Hand auf der Tasche. Einmal am Tag reicht.',
    '{name} keeps a hand on the pocket today. Once a day is enough.'],
  buendnis_ja: ['{name} wischt sich das Blut von der Lippe. „Du hast mich oft genug auf den Boden gelegt. Gut. Lieber neben dir als unter dir.“ Ab jetzt kauft {name} dir nichts mehr weg und lässt deinen Ritualkreis in Ruhe.',
    '{name} wipes the blood from their lip. "You\'ve put me on the ground often enough. Fine. Better beside you than beneath you." From now on {name} buys nothing out from under you and leaves your ritual circle alone.'],
  buendnis_nein: ['{name} lacht. „Bündnis? Schlag mich erst ein paar Mal, dann reden wir.“',
    '{name} laughs. "An alliance? Beat me a few times first, then we\'ll talk."'],
  geschenk: ['{name} drückt dir etwas in die Hand. „Für deinen nächsten Trank. Vergiss nicht, wer es dir gab.“',
    '{name} presses something into your hand. "For your next potion. Don\'t forget who gave it to you."'],
  kein_geschenk: ['{name} hat heute nichts für dich. „Morgen vielleicht.“',
    '{name} has nothing for you today. "Maybe tomorrow."'],
  sieg: ['{name} geht in die Knie und spuckt aus. „Das war nicht das letzte Mal.“ Für eine Weile lässt {name} deine Händler in Ruhe.',
    '{name} drops to one knee and spits. "That wasn\'t the last time." For a while {name} leaves your merchants alone.'],
  sieg_respekt: ['Etwas hat sich verändert: {name} sieht dich jetzt mit Respekt an. Vielleicht ließe sich über ein Bündnis reden.',
    'Something has changed: {name} now looks at you with respect. Perhaps an alliance could be discussed.'],
  niederlage: ['{name} steigt über dich hinweg und geht ohne Eile. Dein Geldbeutel ist leichter.',
    '{name} steps over you and walks off unhurried. Your purse is lighter.'],
  flucht: ['Du lässt {name} stehen. Das Lachen hörst du noch zwei Straßen weiter.',
    'You leave {name} standing. You can still hear the laughter two streets away.'],
  ritual: ['Als du den Kreis ziehst, steht schon jemand darin: {name}, auf deinem Pfad und schneller als du. „Such dir einen anderen Abend.“ Wer heute trinken will, muss {name} aus dem Kreis werfen.',
    'As you draw the circle, someone is already standing in it: {name}, on your pathway and faster than you. "Find yourself another evening." If you want to drink today, you have to throw {name} out of the circle.'],
  ritual_besetzt: ['{name} hält deinen Ritualkreis heute besetzt. Versuch es morgen wieder.',
    '{name} is occupying your ritual circle today. Try again tomorrow.'],
  ritual_frei: ['{name} hinkt aus dem Kreis. Der Platz gehört dir.',
    '{name} limps out of the circle. The place is yours.'],
  markt: ['{name} war vor dir hier und hat weggekauft, was du für deinen nächsten Trank brauchst.',
    '{name} was here before you and bought up what you need for your next potion.'],
  // Pfadviertel-Geschichte (pfadviertelGeschichte.js): am letzten Hof hält der Rivale das letzte Stück
  viertel: ['{name} steht schon da, das letzte Stück dieser Geschichte in der Hand. „Ein ganzes Viertel voller Geheimnisse, und du dachtest, du bist die einzige Person auf unserem Pfad, die hier sucht?“ Wer es haben will, muss es {name} abnehmen.',
    '{name} is already standing there, the last piece of this story in hand. "A whole quarter full of secrets, and you thought you were the only one on our pathway searching here?" Whoever wants it has to take it from {name}.'],
  viertel_verbuendet: ['{name} wartet schon und hält dir das letzte Stück hin. „Ich hab es vor den anderen gefunden. Für dich. Bündnis ist Bündnis.“',
    '{name} is already waiting and holds out the last piece to you. "I found it before the others did. For you. An alliance is an alliance."'],
  viertel_sieg: ['{name} lässt fallen, was hier gefunden wurde, und verschwindet in den Gassen. Das letzte Stück gehört dir.',
    '{name} drops what was found here and vanishes into the alleys. The last piece is yours.'],
  // Etappe 2: Bündnis mit mehr Nutzen
  tratsch: ['{name} beugt sich zu dir: „Ich höre mehr als du. Hier, was dir für den nächsten Trank fehlt und wo es liegt:“',
    '{name} leans towards you: "I hear more than you do. Here is what you are missing for your next potion and where it is:"'],
  tratsch_nichts: ['{name} grinst: „Dir fehlt nichts mehr? Dann trink endlich, ich warte nicht ewig.“',
    '{name} grins: "You are not missing anything? Then drink already, I won\'t wait forever."'],
  wache: ['{name} steht am Rand des Kreises und hält Wache. Kein fremder Beyonder kommt heute an euch vorbei, und das Ritual zehrt nur halb so sehr an dir.',
    '{name} stands at the edge of the circle and keeps watch. No stranger Beyonder gets past the two of you today, and the ritual takes only half as much out of you.'],
  verrat: ['{name} sieht dich an wie einen Fremden. „Du bist zu langsam. Ein Bündnis mit jemandem, der hinterherläuft, kostet mich nur.“ Das Bündnis ist vorbei.',
    '{name} looks at you like a stranger. "You are too slow. An alliance with someone who lags behind only costs me." The alliance is over.'],
  jagd_intro: ['{name} zeigt in eine Seitengasse. „Da drin wartet ein wilder Beyonder, fremder Pfad, fette Beute. Allein schafft das keiner von uns. Zusammen schon.“ {name} kämpft an deiner Seite und hält dir den Rücken frei.',
    '{name} points into a side alley. "A wild Beyonder waits in there, foreign pathway, rich pickings. Neither of us can take it alone. Together we can." {name} fights at your side and covers your back.'],
  jagd_sieg: ['Der fremde Beyonder fällt. {name} teilt die Beute ehrlich, fast zu ehrlich. „Das machen wir wieder.“',
    'The foreign Beyonder falls. {name} splits the loot fairly, almost too fairly. "Let\'s do this again."'],
  gegner: ['{name}, Rivale auf deinem Pfad', '{name}, rival on your pathway'],
  intro: ['{name} stellt sich dir in den Weg. Derselbe Pfad, nur einer kann zuerst ankommen.',
    '{name} blocks your way. The same pathway, and only one can arrive first.'],
};

/**
 * Etappe 1 (Seb 2026-11-27): jeder Rivale ist eine Figur mit eigenem Wesen, Ziel, Spruch und einer eigenen Aktion.
 * art: Effekt-Art (core/Rivale.js rivaleAktion). Texte [de, en] mit {name}; wesen/ziel stehen im Pfad-Tab.
 */
export const RIVALE_ART = {
  laterne: { art: 'bloss',
    wesen: ['Eitel und laut. Will gesehen werden und dich im Dunkeln lassen.', 'Vain and loud. Wants to be seen and to keep you in the dark.'],
    ziel: ['Dich bloßstellen, bis dich die Streife kennt.', 'Expose you until the patrols know your face.'],
    spruch: ['„Lächeln, bitte. Gleich sehen dich alle.“', '"Smile, please. Everyone is about to see you."'],
    aktion: ['{name} zeigt laut auf dich: „Da! Der da hat mit Beyondern zu tun!“ Leute drehen sich um, irgendwo pfeift eine Streife.', '{name} points at you loudly: "There! That one deals with Beyonders!" People turn, somewhere a patrol whistles.'] },
  faden: { art: 'spur',
    wesen: ['Geduldig und verschlagen. Webt Lügen in die Wahrheit.', 'Patient and devious. Weaves lies into the truth.'],
    ziel: ['Dich mit falschen Spuren verwirren.', 'Confuse you with false leads.'],
    spruch: ['„Hast du deine Notizen heute schon gelesen? Bist du sicher, dass es deine sind?“', '"Have you read your notes today? Are you sure they are yours?"'],
    aktion: ['{name} hat dir eine falsche Spur in die Tasche gesteckt. Du merkst es erst, als du ihr eine Stunde lang gefolgt bist. Kopfschmerzen, und das Gefühl, dass etwas in deinem Kopf nicht dir gehört.', '{name} slipped a false lead into your pocket. You only notice after following it for an hour. A headache, and the feeling that something in your head is not yours.'] },
  maske: { art: 'ruf',
    wesen: ['Charmant und falsch. Trägt gern dein Gesicht.', 'Charming and false. Likes to wear your face.'],
    ziel: ['Deinen Ruf ruinieren, mit deinem eigenen Gesicht.', 'Ruin your reputation, with your own face.'],
    spruch: ['„Gestern war ich du. Die Leute fanden dich ziemlich unhöflich.“', '"Yesterday I was you. People found you rather rude."'],
    aktion: ['Gestern hat jemand mit deinem Gesicht einen Händler betrogen. Heute sehen dich die Leute schief an, und {name} winkt dir von der anderen Straßenseite zu.', 'Yesterday someone with your face cheated a merchant. Today people look at you askance, and {name} waves at you from across the street.'] },
  echo: { art: 'fluestern',
    wesen: ['Leise und hartnäckig. Wiederholt deine Gedanken, bis sie fremd klingen.', 'Quiet and persistent. Repeats your thoughts until they sound foreign.'],
    ziel: ['Die Stimmen in deinem Kopf lauter machen.', 'Make the voices in your head louder.'],
    spruch: ['„Hörst du das auch? Nein? Dann hör genauer hin.“', '"Do you hear that too? No? Then listen closer."'],
    aktion: ['{name} flüstert dir etwas zu, und es kommt dreimal zurück, jedes Mal lauter. Die Stimmen in deinem Kopf haben einen neuen Chor.', '{name} whispers something to you, and it comes back three times, louder each time. The voices in your head have a new choir.'] },
  kessel: { art: 'gift',
    wesen: ['Gastfreundlich und gefährlich. Teilt gern einen Becher.', 'Hospitable and dangerous. Likes to share a cup.'],
    ziel: ['Dich schwächen, Schluck für Schluck.', 'Weaken you, sip by sip.'],
    spruch: ['„Durstig? Ich habe extra für dich gebraut.“', '"Thirsty? I brewed this especially for you."'],
    aktion: ['{name} hat dir im Vorbeigehen etwas in den Becher getan. Dein Magen krampft, und {name} lacht: „Nur ein Gruß unter Kollegen.“', '{name} slipped something into your cup in passing. Your stomach cramps, and {name} laughs: "Just a greeting between colleagues."'] },
  eisen: { art: 'stoss',
    wesen: ['Direkt und stur. Achtet nur Stärke.', 'Blunt and stubborn. Respects only strength.'],
    ziel: ['Dich auf offener Straße niederschlagen, immer wieder.', 'Knock you down in the open street, again and again.'],
    spruch: ['„Reden ist was für Leute, die verlieren. Fäuste hoch.“', '"Talking is for people who lose. Fists up."'],
    aktion: ['{name} rammt dich ohne ein Wort gegen die Hauswand. „Wegrennen gilt nicht. Heute nur Kämpfen oder Gehen, und wer geht, ist feige.“', '{name} slams you into the wall without a word. "No running. Today it\'s fight or walk away, and whoever walks is a coward."'] },
  schluessel: { art: 'aussperren',
    wesen: ['Flink und frech. Kein Schloss hält, keine Tür bleibt offen.', 'Nimble and cheeky. No lock holds, no door stays open.'],
    ziel: ['Dir jede Tür vor der Nase zuschließen, auch die zu deinem Ritual.', 'Lock every door in your face, including the one to your ritual.'],
    spruch: ['„Suchst du was? Ich hab abgeschlossen.“', '"Looking for something? I locked it."'],
    aktion: ['{name} klimpert mit einem Schlüssel, der dir bekannt vorkommt. „Dein Ritualplatz ist heute abgeschlossen. Versuch es morgen.“', '{name} jingles a key that looks familiar. "Your ritual spot is locked today. Try tomorrow."'] },
  sq_waage: { art: 'gebuehr',
    wesen: ['Kühl und genau. Führt über alles Buch, auch über dich.', 'Cool and precise. Keeps a ledger on everything, including you.'],
    ziel: ['Dich für jeden Schritt auf dem gemeinsamen Pfad bezahlen lassen.', 'Make you pay for every step on the shared pathway.'],
    spruch: ['„Der Pfad gehört mir. Wer ihn benutzt, zahlt.“', '"The pathway is mine. Whoever uses it pays."'],
    aktion: ['{name} legt dir eine Rechnung in die Hand, und dein Geldbeutel wird leichter, ehe du protestieren kannst. „Wegegeld. Steht alles im Buch.“', '{name} presses a bill into your hand, and your purse grows lighter before you can protest. "Toll. It\'s all in the ledger."'] },
  sq_moor: { art: 'versinken',
    wesen: ['Langsam und unerbittlich. Hält fest, was einmal gegriffen ist.', 'Slow and relentless. Holds on to whatever it has grasped.'],
    ziel: ['Dir nehmen, was du sammelst, und es im Torf versenken.', 'Take what you gather and sink it in the peat.'],
    spruch: ['„Alles sinkt irgendwann. Deine Vorräte zuerst.“', '"Everything sinks eventually. Your supplies first."'],
    aktion: ['Der Boden unter dir wird weich. Als du dich freigezogen hast, fehlt etwas in deiner Tasche, und {name} wischt sich Torf von den Fingern.', 'The ground beneath you turns soft. When you have pulled yourself free, something is missing from your bag, and {name} wipes peat from their fingers.'] },
  sq_uhr: { art: 'zeit',
    wesen: ['Ungeduldig und berechnend. Stiehlt Zeit wie andere Geld.', 'Impatient and calculating. Steals time the way others steal money.'],
    ziel: ['Dir die Zeit stehlen und damit vorauslaufen.', 'Steal your time and run ahead with it.'],
    spruch: ['„Du bist spät dran. Schon wieder.“', '"You\'re late. Again."'],
    aktion: ['Für einen Herzschlag bleibt alles stehen, nur {name} bewegt sich. Danach fehlt dir ein ganzer Tag, und {name} ist auf dem Pfad ein Stück weiter.', 'For one heartbeat everything stops, only {name} moves. Afterwards a whole day is missing for you, and {name} is a little further along the pathway.'] },
};

/** Text aus RIVALE_ART (wesen, ziel, spruch, aktion) für einen Rivalen. */
export function rivaleArtText(feld, pid, nr = 1) {
  return (RIVALE_ART[pid]?.[feld]?.[0] ?? '').replaceAll('{name}', rivaleName(pid, nr));
}

/** Feste Texte ohne Namen. */
export const RIVALE_UI = {
  'Rivale auf deinem Pfad': 'Rival on your pathway',
  Kämpfen: 'Fight',
  Bestehlen: 'Steal',
  'Bündnis anbieten': 'Offer an alliance',
  Weitergehen: 'Walk on',
  Verbündet: 'Allied',
  Rivale: 'Rival',
  'Hält sich zurück': 'Keeping their distance',
  Weggekauft: 'Bought up',
  'Rivale war schneller': 'Rival was faster',
  'Noch nicht begegnet. Ab Wexmoor geht jemand denselben Pfad wie du.': 'Not met yet. From Wexmoor on, someone walks the same pathway as you.',
  'Diebesgut': 'Loot',
  'Ein Kampf steht bevor.': 'A fight is coming.',
  Später: 'Later',
  'Gemeinsame Jagd': 'Hunt together',
  'Wilder Beyonder (gemeinsame Jagd)': 'Wild Beyonder (joint hunt)',
  Wesen: 'Nature',
  Ziel: 'Agenda',
  Feindlich: 'Hostile',
  'Spieler {0}': 'Player {0}',
};

/** Text für einen Rivalen. */
export function rivaleText(key, pid, nr = 1) {
  const t = RIVALE_TEXTE[key]?.[0] ?? key;
  return t.replaceAll('{name}', rivaleName(pid, nr));
}

/** Englisches Wörterbuch (alle Texte für alle Rivalen). */
export function rivaleWoerterbuch() {
  const out = { ...RIVALE_UI };
  for (const r of Object.values(RIVALEN)) {
    for (const name of [r.name, r.name2]) for (const [de, en] of Object.values(RIVALE_TEXTE)) out[de.replaceAll('{name}', name)] = en.replaceAll('{name}', name);
  }
  for (const [pid, a] of Object.entries(RIVALE_ART)) {
    for (const name of [RIVALEN[pid].name, RIVALEN[pid].name2]) for (const f of ['wesen', 'ziel', 'spruch', 'aktion']) out[a[f][0].replaceAll('{name}', name)] = a[f][1].replaceAll('{name}', name);
  }
  out['Siege: {0}, Niederlagen: {1}'] = 'Wins: {0}, defeats: {1}';
  out['Sequenz {0}'] = 'Sequence {0}';
  out['Chance: {0} %'] = 'Chance: {0} %';
  out['Ab {0} Siegen'] = 'From {0} wins';
  out['+{0} Schilling'] = '+{0} shillings';
  out['-{0} Schilling'] = '-{0} shillings';
  return out;
}

/** In buildContent nach applyBeyonderRest: Gegner je Pfad und Sequenz mit Pfad-Fertigkeiten und Rest. */
export function applyRivale(content) {
  for (const pid of Object.keys(RIVALEN)) {
    if (!content.pathways?.[pid]) continue;
    for (const [k, [vorlage, f]] of Object.entries(BASIS)) for (const nr of [1, 2]) {
      const seq = Number(k);
      const base = content.encounters[vorlage];
      if (!base || !content.pathways[pid].seqs?.[seq]) continue;
      const id = rivaleEncId(pid, seq, nr);
      const dm = Math.sqrt(f);
      const scale = (list) => list?.map((a) => (a.damage ? { ...a, damage: Math.round(a.damage * dm) } : { ...a }));
      const rest = { ...base };
      for (const key of WEG) delete rest[key];
      const { phase2 } = base;
      content.encounters[id] = {
        ...rest,
        name: rivaleText('gegner', pid, nr),
        sheet: seq <= 4 && content.pathways[pid] ? `hg_battle_${pid}` : rest.sheet,
        hp: Math.round(base.hp * f),
        attacks: scale(base.attacks),
        ...(phase2 ? { phase2: { ...phase2, attacks: scale(phase2.attacks) } } : {}),
        elite: true,
        fleeable: true,
        rivale: pid,
        rivale_nr: nr,
        lose_money: 0.08,
        intro: rivaleText('intro', pid, nr),
        win_text: rivaleText('sieg', pid, nr),
        lose_text: rivaleText('niederlage', pid, nr),
        flee_text: rivaleText('flucht', pid, nr),
      };
      content.loot[id] = { repeat: true, money: content.loot[vorlage]?.money ?? [20, 40], drops: [] };
      machBeyonder(content, id, pid, seq);
      if (content.items[restId(pid, seq)]) content.loot[id].drops.push({ item: restId(pid, seq), chance: RIVALE_REGELN.rest });
    }
  }
  // Gemeinsame Jagd (Etappe 2): je Sequenz ein wilder Beyonder, gegen den der verbündete Rivale mitkämpft
  for (const [k, [vorlage, f]] of Object.entries(BASIS)) {
    const base = content.encounters[vorlage];
    if (!base) continue;
    const id = `rivale_jagd_${k}`;
    const rest = { ...base };
    for (const key of WEG) delete rest[key];
    delete rest.phase2;
    const dm = Math.sqrt(f);
    content.encounters[id] = { ...rest, name: 'Wilder Beyonder (gemeinsame Jagd)', hp: Math.round(base.hp * f * RIVALE_REGELN.jagd_hp),
      attacks: base.attacks?.map((a) => (a.damage ? { ...a, damage: Math.round(a.damage * dm) } : { ...a })), elite: true, fleeable: true, rivale_jagd: true };
    const m = content.loot[vorlage]?.money ?? [20, 40];
    content.loot[id] = { repeat: true, money: m.map((x) => Math.round(x * RIVALE_REGELN.jagd_geld)), drops: content.items.geisteressenz ? [{ item: 'geisteressenz', chance: RIVALE_REGELN.jagd_essenz }] : [] };
    const pids = Object.keys(RIVALEN).filter((p) => content.pathways?.[p]?.seqs?.[Number(k)]);
    if (pids.length) machBeyonder(content, id, pids[Number(k) % pids.length], Number(k));
  }
  return content;
}
