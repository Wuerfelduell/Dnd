/**
 * Pfadviertel-Geschichten (Seb 2026-11-27: „Bau eine kleine Story ein, und der Rivale soll auch mal auftauchen“).
 *
 * Jedes der zehn Calderwick-Pfadviertel (o3_<pfad>) bekommt neben dem Farmen einen kleinen Auftrag mit eigener Geschichte:
 *   1. Eine Bittstellerin oder ein Bittsteller im Gildenhof erzählt, was die Verderbnis angerichtet hat (startet den Auftrag).
 *   2. Drei Fundstücke im Viertel (Boulevard, erster und zweiter Hof der Gassen) erzählen die Geschichte weiter.
 *   3. Am letzten Hof wartet der eigene Rivale (core/Rivale.js) mit dem letzten Stück: Kampf, oder als Verbündeter
 *      gibt er es freiwillig her. Ohne Rivalen (z. B. alte Stände ohne Pfad) liegt das Stück einfach da.
 *   4. Zurück im Gildenhof: Auflösung und Lohn.
 * Läuft vor applyPfadviertelPlan, der die Objekte an ihre festen Plätze (PLATZ, Endungen pvg_*) legt.
 * Deutsche und englische Texte stehen hier zusammen; src/i18n/en/pfadviertel_geschichten.json wird daraus erzeugt
 * (pvgWoerterbuch, der Test prüft Gleichheit).
 */

export const PVG_LOHN = { money: 16000, items: { geisteressenz: 3, silberstaub: 2, nebeltau: 2 } };

/** Je Pfad: Viertel [de, en], Titel, Bittsteller, Bitte, drei Funde [Titel, Text], Auflösung. Jeder Eintrag [de, en]. */
export const PVG = {
  laterne: {
    viertel: ['Das Dunkelglasviertel', 'The Darkglass Quarter'],
    titel: ['Was der Junge sah', 'What the Boy Saw'],
    wer: ['Elsa Rußbach, Laternenanzünderin', 'Elsa Soot, lamplighter'],
    bitte: ['„Mein Junge hat die schwarzen Laternen angezündet, jeden Abend, wie ich es ihm beigebracht habe. Seitdem sieht er Dinge, die noch nicht passiert sind. Vor drei Nächten ist er losgelaufen, weil er gesehen hat, wer kommt. Bitte finde ihn.“',
      '"My boy lit the black lanterns, every evening, the way I taught him. Since then he sees things that haven\'t happened yet. Three nights ago he ran off because he saw who is coming. Please find him."'],
    funde: [
      [['Eine Kindermütze', 'A child\'s cap'], ['Unter einer schwarzen Laterne liegt eine Mütze, darin ein Zettel in Kinderschrift: „Ich habe gesehen, wer kommt. Er geht denselben Weg wie der Fremde.“',
        'Under a black lantern lies a cap with a note inside in a child\'s hand: "I saw who is coming. He walks the same way as the stranger."']],
      [['Kreidezeichen', 'Chalk marks'], ['Eine Laterne mit Kreide auf das Pflaster gemalt, die nach unten leuchtet. Daneben ein Pfeil in die Gassen. Der Junge wollte gefunden werden.',
        'A lantern drawn in chalk on the cobbles, shining downwards. Next to it an arrow into the alleys. The boy wanted to be found.']],
      [['Eine zerbrochene Laternenstange', 'A broken lamp pole'], ['Die Stange des Jungen, zerbrochen. Daneben frische Stiefelspuren, und ein Geruch, den du kennst: ein Beyonder deines eigenen Pfades war vor dir hier.',
        'The boy\'s pole, broken. Next to it fresh boot prints, and a smell you know: a Beyonder of your own pathway was here before you.']],
    ],
    lohn: ['In dem Heft, das du dem Rivalen abgenommen hast, hat der Junge aufgeschrieben, wo er sich versteckt: im Keller unter der Gildentafel. Elsa läuft los. Später kommt sie mit ihm an der Hand zurück und drückt dir ihre Ersparnisse in die Hand. „Er sagt, du wirst noch weit kommen. Er sagt es nicht gern.“',
      'In the notebook you took from the rival, the boy wrote down where he is hiding: in the cellar beneath the guild board. Elsa runs off. Later she comes back holding his hand and presses her savings into yours. "He says you will go far. He doesn\'t like saying it."'],
  },
  faden: {
    viertel: ['Das Garnviertel', 'The Yarn Quarter'],
    titel: ['Fremde Erinnerungen', 'Borrowed Memories'],
    wer: ['Jost Weber, ehemaliger Spinner', 'Jost Weaver, former spinner'],
    bitte: ['„Ich habe einen Faden berührt und bin mit den Erinnerungen eines anderen aufgewacht. Ich weiß, wie seine Frau lacht. Meine eigene habe ich vergessen. Irgendwo hängt mein Faden noch. Hilf mir, ihn zu finden.“',
      '"I touched a thread and woke up with someone else\'s memories. I know how his wife laughs. My own I have forgotten. Somewhere my thread is still hanging. Help me find it."'],
    funde: [
      [['Ein verknoteter Faden', 'A knotted thread'], ['Zwischen zwei Häusern hängt ein Faden mit hundert Knoten. Jeder Knoten ein Name. Josts ist nicht dabei, aber der Faden führt nach unten.',
        'Between two houses hangs a thread with a hundred knots. Each knot a name. Jost\'s is not among them, but the thread leads downwards.']],
      [['Ein Spinnrad', 'A spinning wheel'], ['Ein Spinnrad mitten im Hof, das sich von allein dreht. Es spinnt Erinnerungen zu Garn. Eine Spule fehlt.',
        'A spinning wheel in the middle of the yard, turning by itself. It spins memories into yarn. One spool is missing.']],
      [['Abgeschnittene Fäden', 'Cut threads'], ['Hier hat jemand Fäden abgeschnitten und eingesteckt, sauber, mit einer Klinge deines eigenen Pfades. Wer immer das war, sammelt fremde Erinnerungen.',
        'Someone has cut threads here and pocketed them, cleanly, with a blade of your own pathway. Whoever it was is collecting other people\'s memories.']],
    ],
    lohn: ['Auf der Spule, die du dem Rivalen abgenommen hast, steht Josts Name. Er hält sie an die Stirn und weint. „Sie heißt Marthe. Sie lacht wie ein Kessel, der überkocht.“ Er gibt dir alles, was er hat.',
      'Jost\'s name is on the spool you took from the rival. He holds it to his forehead and weeps. "Her name is Marthe. She laughs like a kettle boiling over." He gives you everything he has.'],
  },
  maske: {
    viertel: ['Das Larvenviertel', 'The Mask Quarter'],
    titel: ['Das eigene Gesicht', 'One\'s Own Face'],
    wer: ['Eine Frau ohne Gesicht', 'A woman without a face'],
    bitte: ['„Ich habe mein Gesicht zum Trocknen ins Fenster gehängt, wie alle hier. Am Morgen war es weg. Ohne Gesicht erkennt mich meine Tochter nicht mehr. Bitte, bring es mir zurück.“',
      '"I hung my face in the window to dry, like everyone here. In the morning it was gone. Without a face my daughter no longer knows me. Please, bring it back to me."'],
    funde: [
      [['Ein leeres Fenster', 'An empty window'], ['Ein Haken, an dem kein Gesicht mehr hängt. Darunter Fußspuren, die in jedem Schritt andere Schuhe tragen.',
        'A hook with no face hanging on it any more. Beneath it footprints that wear different shoes with every step.']],
      [['Ein Haufen Gesichter', 'A pile of faces'], ['Im Hof ein Haufen abgelegter Gesichter. Keines passt zur Beschreibung. Jemand hat sie durchwühlt und nur eines mitgenommen.',
        'In the yard a pile of discarded faces. None fits the description. Someone rummaged through them and took only one.']],
      [['Ein Spiegelsplitter', 'A mirror shard'], ['Im Splitter siehst du kurz ein Gesicht, das nicht deins ist, und dahinter jemanden, der dir sehr ähnlich ist: ein Beyonder deines Pfades, der Gesichter sammelt.',
        'In the shard you briefly see a face that is not yours, and behind it someone very much like you: a Beyonder of your pathway who collects faces.']],
    ],
    lohn: ['Die Frau setzt ihr Gesicht auf, und es sitzt sofort. Ein Mädchen rennt aus einer Tür und fällt ihr um den Hals. Die Frau lächelt dich an, zum ersten Mal mit eigenem Mund, und gibt dir den Lohn eines ganzen Jahres.',
      'The woman puts on her face, and it fits at once. A girl runs out of a door and throws her arms around her neck. The woman smiles at you, for the first time with her own mouth, and gives you a whole year\'s wages.'],
  },
  echo: {
    viertel: ['Das Hallviertel', 'The Hall Quarter'],
    titel: ['Das dritte Echo', 'The Third Echo'],
    wer: ['Bruder Anselm, Glöckner', 'Brother Anselm, bell-ringer'],
    bitte: ['„Jeder Laut kommt hier dreimal zurück, das dritte Mal mit fremden Worten. Ich habe zugehört. Das dritte Echo spricht von einer Glocke unter dem Viertel, die niemand läuten darf. Und jemand sucht sie.“',
      '"Every sound comes back three times here, the third time with strange words. I have listened. The third echo speaks of a bell beneath the quarter that no one may ring. And someone is looking for it."'],
    funde: [
      [['Eine Stimmgabel', 'A tuning fork'], ['Eine Stimmgabel, die summt, ohne dass sie jemand angeschlagen hat. Sie wird lauter, wenn du in Richtung der Gassen gehst.',
        'A tuning fork that hums without anyone striking it. It grows louder when you walk towards the alleys.']],
      [['Ein Gitter im Boden', 'A grate in the ground'], ['Durch das Gitter hörst du das dritte Echo deutlich: „Der Klöppel ist weg. Ohne Klöppel schweigt sie. Mit Klöppel weckt sie alle.“',
        'Through the grate you hear the third echo clearly: "The clapper is gone. Without the clapper she is silent. With the clapper she wakes everyone."']],
      [['Kratzspuren', 'Scratch marks'], ['Jemand hat hier etwas Schweres weggeschleppt. Die Spuren klingen nach, und das dritte Echo nennt keinen Fremden, sondern jemanden deines eigenen Pfades.',
        'Someone dragged something heavy away here. The marks still ring, and the third echo names no stranger but someone of your own pathway.']],
    ],
    lohn: ['Bruder Anselm nimmt den Klöppel und wiegt ihn in beiden Händen. „Dann bleibt sie stumm. Gut.“ Er versenkt ihn im tiefsten Brunnen der Gilde und bezahlt dich aus der Opferkasse.',
      'Brother Anselm takes the clapper and weighs it in both hands. "Then she stays silent. Good." He sinks it in the guild\'s deepest well and pays you from the offering box.'],
  },
  kessel: {
    viertel: ['Das Sudviertel', 'The Brew Quarter'],
    titel: ['Das Rezept des Nachbarn', 'The Neighbour\'s Recipe'],
    wer: ['Greta Kumm, Garköchin', 'Greta Kumm, cook'],
    bitte: ['„Was in den Pfützen schwimmt, war einmal ein Nachbar. Mein Nachbar, Hannes. Er hat ein Rezept gebraut, das ihn zurückholen sollte, und dann ist er selbst in den Topf gefallen. Sein Rezeptbuch ist weg. Ohne das bleibt er Suppe.“',
      '"What swims in the puddles used to be a neighbour. My neighbour, Hannes. He brewed a recipe that was meant to bring someone back, and then he fell into the pot himself. His recipe book is gone. Without it he stays soup."'],
    funde: [
      [['Eine kochende Pfütze', 'A boiling puddle'], ['In der Pfütze treibt eine Brille. Hannes hat sie getragen, sagt Greta. Daneben eine ausgerissene Seite: „Zutat drei: Geduld. Nicht ersetzen.“',
        'A pair of spectacles drifts in the puddle. Hannes wore them, Greta says. Next to it a torn-out page: "Ingredient three: patience. Do not substitute."']],
      [['Ein umgestürzter Kessel', 'An overturned cauldron'], ['Der Kessel ist leer, aber noch warm. Am Rand Fingerabdrücke von jemandem, der etwas Schweres herausgehoben hat.',
        'The cauldron is empty but still warm. On the rim the fingerprints of someone who lifted something heavy out.']],
      [['Fremde Zutatenreste', 'Foreign ingredient scraps'], ['Hier hat jemand gebraut, schnell und schlampig, mit Zutaten deines eigenen Pfades. Wer immer es war, will das Rezept für sich.',
        'Someone brewed here, quickly and sloppily, with ingredients of your own pathway. Whoever it was wants the recipe for themselves.']],
    ],
    lohn: ['Greta braut nach Hannes\' Buch, mit Geduld und ohne Ersatz. Am Abend sitzt ein nasser, verwirrter Mann an ihrem Tisch und isst ihre Suppe, ohne zu fragen, was darin ist. Greta bezahlt dich mit allem aus der Ladenkasse.',
      'Greta brews from Hannes\' book, with patience and no substitutes. In the evening a wet, confused man sits at her table and eats her soup without asking what is in it. Greta pays you with everything in the till.'],
  },
  eisen: {
    viertel: ['Das Nietenviertel', 'The Rivet Quarter'],
    titel: ['Der Rost auf der Haut', 'Rust on the Skin'],
    wer: ['Meister Ulrich Hammerl, Schmied', 'Master Ulrich Hammerl, smith'],
    bitte: ['„Der Rost wächst auf meinen Lehrlingen. Erst die Hände, dann die Arme. In der Gilde gab es einen Ölstein, der den Rost aufhält. Seit die Wände nachts zusammenrücken, ist er verschwunden.“',
      '"The rust is growing on my apprentices. First the hands, then the arms. The guild had an oilstone that holds back the rust. Since the walls started moving closer at night, it has disappeared."'],
    funde: [
      [['Eine verrostete Zange', 'A rusted pair of tongs'], ['Die Zange eines Lehrlings, halb zu Rost zerfallen. Daran ein Ölfleck, frisch, der in Richtung der Gassen tropft.',
        'An apprentice\'s tongs, half crumbled to rust. On them an oil stain, fresh, dripping towards the alleys.']],
      [['Eine eingedrückte Tür', 'A dented door'], ['Die Wände haben diese Tür in der Nacht zerquetscht. Dahinter ein leerer Samtbeutel, in dem etwas Schweres gelegen hat.',
        'The walls crushed this door in the night. Behind it an empty velvet pouch that once held something heavy.']],
      [['Schmiedespuren', 'Forge marks'], ['Jemand hat hier die Wände mit bloßer Kraft auseinandergestemmt, die Kraft deines eigenen Pfades. Der Ölstein ist nicht verloren, er ist gestohlen.',
        'Someone pried the walls apart here with bare strength, the strength of your own pathway. The oilstone is not lost, it is stolen.']],
    ],
    lohn: ['Meister Hammerl reibt seinen Lehrlingen die Hände mit dem Ölstein ein. Der Rost blättert ab wie alte Farbe. Er schmiedet nicht für dich, er zahlt. „Bessere Arbeit kann ich dir nicht anbieten als die, die du schon kannst.“',
      'Master Hammerl rubs his apprentices\' hands with the oilstone. The rust flakes off like old paint. He doesn\'t forge for you, he pays. "I can\'t offer you better work than what you can already do."'],
  },
  schluessel: {
    viertel: ['Das Türenviertel', 'The Door Quarter'],
    titel: ['Der Weg in die Küche', 'The Way to the Kitchen'],
    wer: ['Herr Pölz, sucht seit sieben Jahren seine Küche', 'Mr Pölz, has been looking for his kitchen for seven years'],
    bitte: ['„Jede Tür führt woandershin als gestern. Ich suche seit sieben Jahren meine Küche. Ich weiß, dass es einen Hauptschlüssel gibt, der jede Tür dahin führt, wo sie hingehört. Die Gilde hat ihn verloren. Oder verkauft.“',
      '"Every door leads somewhere other than yesterday. I have been looking for my kitchen for seven years. I know there is a master key that leads every door to where it belongs. The guild lost it. Or sold it."'],
    funde: [
      [['Eine Tür ins Nichts', 'A door to nowhere'], ['Hinter der Tür nur eine Mauer, darauf in Kreide: „Der Schlüssel ist unten. Frag nicht, welche Tür.“',
        'Behind the door only a wall, with chalk on it: "The key is below. Don\'t ask which door."']],
      [['Ein Schlüsselbrett', 'A key board'], ['Hundert Haken, hundert Schlüssel. Ein Haken ist leer, und er ist der größte.',
        'A hundred hooks, a hundred keys. One hook is empty, and it is the largest.']],
      [['Ein aufgebrochenes Schloss', 'A forced lock'], ['Kein Dietrich, kein Werkzeug: Das Schloss hat sich selbst geöffnet, für jemanden deines eigenen Pfades. Du bist nicht der Erste, der den Hauptschlüssel sucht.',
        'No lockpick, no tool: the lock opened itself, for someone of your own pathway. You are not the first to look for the master key.']],
    ],
    lohn: ['Herr Pölz steckt den Hauptschlüssel in die nächste Tür und dreht ihn. Dahinter riecht es nach Zwiebeln. „Meine Küche!“ Er gibt dir den Inhalt seiner Speisekammer und seines Sparstrumpfs, sieben Jahre Erspartes.',
      'Mr Pölz puts the master key in the nearest door and turns it. Behind it there is a smell of onions. "My kitchen!" He gives you the contents of his pantry and his savings stocking, seven years\' worth.'],
  },
  sq_waage: {
    viertel: ['Das Gewichtsviertel', 'The Weight Quarter'],
    titel: ['Die Schuld der Leichten', 'The Debt of the Light'],
    wer: ['Edda Kornfeld, Witwe eines Schuldners', 'Edda Kornfeld, widow of a debtor'],
    bitte: ['„Mein Mann konnte nicht zahlen, also wurde er leichter, bis der Wind ihn mitgenommen hat. Seine Schuld steht in einem Buch der Gilde. Wird sie gestrichen, kommt er zurück. Das Buch ist verschwunden.“',
      '"My husband couldn\'t pay, so he grew lighter until the wind took him. His debt is written in a book of the guild. If it is struck out, he comes back. The book has disappeared."'],
    funde: [
      [['Eine Feder an einer Schnur', 'A feather on a string'], ['An einem Laternenpfahl flattert eine Feder an einer Schnur. Darauf ein Name: Kornfeld. Er ist noch nicht ganz fort.',
        'A feather on a string flutters from a lamppost. A name is on it: Kornfeld. He is not quite gone yet.']],
      [['Eine leere Waagschale', 'An empty scale pan'], ['Die Waage im Hof ist aus dem Gleichgewicht. Auf der leeren Seite lag einmal ein Buch, schwer genug, um eine ganze Gasse zu halten.',
        'The scale in the yard is off balance. On the empty side a book once lay, heavy enough to hold an entire alley.']],
      [['Eine Quittung', 'A receipt'], ['Eine Quittung, unterschrieben von jemandem deines eigenen Pfades: „Schuldbuch übernommen. Zahlung folgt nie.“ Jemand will die Schulden des Viertels eintreiben.',
        'A receipt, signed by someone of your own pathway: "Debt ledger taken over. Payment will never follow." Someone wants to collect the quarter\'s debts.']],
    ],
    lohn: ['Edda streicht die Zeile mit zitternder Hand. Draußen fällt jemand vom Himmel in den Rinnstein und flucht. Edda lacht und weint und zahlt dich mit dem Geld, das nun keiner mehr schuldet.',
      'Edda strikes out the line with a trembling hand. Outside someone falls from the sky into the gutter and curses. Edda laughs and weeps and pays you with the money that no one owes any more.'],
  },
  sq_moor: {
    viertel: ['Das Faulviertel', 'The Rot Quarter'],
    titel: ['Was die Straße festhält', 'What the Street Holds'],
    wer: ['Lene Brack, Torfstecherin', 'Lene Brack, peat cutter'],
    bitte: ['„Die Straßen erinnern sich an jeden, der sie betreten hat, und manche halten sie fest. Meine Schwester steckt bis zur Hüfte im Torf, seit Wochen. Es gab ein Moorlicht, das die Straße zum Loslassen bringt. Es ist ausgegangen, oder jemand hat es mitgenommen.“',
      '"The streets remember everyone who has walked them, and some they hold on to. My sister has been stuck up to her hips in peat for weeks. There was a bog light that makes the street let go. It went out, or someone took it."'],
    funde: [
      [['Ein Torfstecher', 'A peat spade'], ['Lenes Spaten, im Boden steckengeblieben. Der Torf darunter ist warm und flüstert Namen.',
        'Lene\'s spade, stuck in the ground. The peat beneath is warm and whispers names.']],
      [['Eine leere Laterne', 'An empty lantern'], ['Eine Moorlaterne ohne Licht. Am Glas Spuren von Fingern, die keine Angst vor dem Moor hatten.',
        'A bog lantern without light. On the glass the marks of fingers that had no fear of the bog.']],
      [['Fußspuren, die nicht einsinken', 'Footprints that don\'t sink'], ['Jemand ist hier über den Torf gegangen, ohne einzusinken. Das kann nur jemand deines eigenen Pfades. Das Moorlicht ist mit ihm gegangen.',
        'Someone walked across the peat here without sinking. Only someone of your own pathway can do that. The bog light went with them.']],
    ],
    lohn: ['Lene hält das Moorlicht über den Torf. Die Straße seufzt und gibt ihre Schwester frei, nass und lachend. Die beiden geben dir den Lohn einer ganzen Torfsaison.',
      'Lene holds the bog light over the peat. The street sighs and releases her sister, wet and laughing. The two of them give you a whole peat season\'s wages.'],
  },
  sq_uhr: {
    viertel: ['Das Stillviertel', 'The Still Quarter'],
    titel: ['Die stehengebliebene Stunde', 'The Stopped Hour'],
    wer: ['Uhrmacherin Thea Gang', 'Clockmaker Thea Gang'],
    bitte: ['„Die Zeit läuft hier in Stücken, seit jemand die Unruh aus der Gildenuhr gerissen hat. Mein Vater steht seit einem Jahr mitten in einem Schritt auf dem Boulevard. Ohne die Unruh kommt er nie an.“',
      '"Time here runs in pieces since someone tore the balance wheel out of the guild clock. My father has been standing mid-step on the boulevard for a year. Without the balance wheel he will never arrive."'],
    funde: [
      [['Ein Mann mitten im Schritt', 'A man mid-step'], ['Theas Vater, erstarrt, ein Bein in der Luft. In seiner Hand eine Taschenuhr, die zurückläuft, in Richtung der Gassen.',
        'Thea\'s father, frozen, one leg in the air. In his hand a pocket watch running backwards, towards the alleys.']],
      [['Zahnräder im Rinnstein', 'Cogs in the gutter'], ['Zahnräder, verstreut wie Brotkrumen. Sie drehen sich alle, außer einem, das zerbrochen ist.',
        'Cogs, scattered like breadcrumbs. They all turn, except one that is broken.']],
      [['Eine angehaltene Sekunde', 'A held second'], ['Hier steht eine einzige Sekunde still in der Luft, und darin der Abdruck einer Hand deines eigenen Pfades. Jemand hat die Unruh gestohlen, um die Zeit für sich laufen zu lassen.',
        'Here a single second hangs still in the air, and in it the imprint of a hand of your own pathway. Someone stole the balance wheel to make time run for themselves.']],
    ],
    lohn: ['Thea setzt die Unruh ein. Auf dem Boulevard setzt ihr Vater den Fuß auf, ein Jahr später, und fragt, warum alle so alt aussehen. Thea bezahlt dich mit der teuersten Uhr ihres Ladens und allem Geld, das sie hat.',
      'Thea fits the balance wheel. On the boulevard her father sets his foot down, a year late, and asks why everyone looks so old. Thea pays you with the most expensive watch in her shop and all the money she has.'],
  },
};

/** Feste Texte (ohne Pfad). [de, en] */
export const PVG_UI = {
  zuhoeren: ['Zuhören', 'Listen'],
  untersuchen: ['Untersuchen', 'Examine'],
  rivale: ['Das letzte Stück', 'The last piece'],
  abgeben: ['Das letzte Stück abgeben', 'Hand over the last piece'],
  ohne_rivale: ['Am Ende der Gassen liegt, was noch fehlte. Wer immer es hier abgelegt hat, ist längst fort.', 'At the end of the alleys lies what was still missing. Whoever left it here is long gone.'],
  schritt_bitte: ['Im Gildenhof zuhören', 'Listen in the guild yard'],
  schritt_rivale: ['Dem Rivalen das letzte Stück abnehmen', 'Take the last piece from the rival'],
  schritt_lohn: ['Zurück in den Gildenhof', 'Back to the guild yard'],
};

export const pvgFlag = (pid, was) => `pvg_${pid}_${was}`;

/** Alle Texte eines Viertels in einer Sprache (0 = de, 1 = en). */
function texte(pid, l) {
  const g = PVG[pid];
  const v = g.viertel[l];
  const t = {
    quest: `${v}: ${g.titel[l]}`,
    wer: g.wer[l], bitte: g.bitte[l], lohn: g.lohn[l],
    ...Object.fromEntries(Object.entries(PVG_UI).map(([k, x]) => [`ui_${k}`, x[l]])),
  };
  g.funde.forEach(([titel, text], i) => {
    t[`fund${i + 1}_titel`] = `${v}: ${titel[l]}`;
    t[`fund${i + 1}_text`] = text[l];
    t[`fund${i + 1}_schritt`] = l ? `Examine: ${titel[l]}` : `Untersuchen: ${titel[l]}`;
  });
  return t;
}

/** Englisches Wörterbuch (src/i18n/en/pfadviertel_geschichten.json). */
export function pvgWoerterbuch() {
  const out = {};
  for (const pid of Object.keys(PVG)) {
    const de = texte(pid, 0);
    const en = texte(pid, 1);
    for (const k of Object.keys(de)) out[de[k]] = en[k];
  }
  return out;
}

/** In buildContent vor applyPfadviertelPlan: Auftrag, Funde, Rivale und Lohn je Pfadviertel. */
export function applyPfadviertelGeschichte(content) {
  for (const pid of Object.keys(PVG)) {
    const m = content.maps[`o3_${pid}`];
    if (!m || m.city !== 'calderwick') continue;
    const t = texte(pid, 0);
    const id = (s) => `${m.id}_pvg_${s}`;
    const f = (s) => pvgFlag(pid, s);
    const funde = [1, 2, 3].map((n) => f(`fund${n}`));
    m.interactables ??= [];
    m.interactables.push(
      { id: id('bitte'), kind: 'read', tile: [6, 24], prompt: t.ui_zuhoeren, title: t.wer, text: t.bitte, marker: true,
        done_flag: f('start'), effects: { sets_flags: [f('start')], start_quests: [`pvg_${pid}`] }, visible_if: { hide_if_flags: [f('start')] } },
      ...[1, 2, 3].map((n) => ({ id: id(`fund${n}`), kind: 'read', tile: [0, 0], prompt: t.ui_untersuchen, title: t[`fund${n}_titel`], text: t[`fund${n}_text`], marker: true,
        done_flag: funde[n - 1], visible_if: { requires_flags: [f('start'), ...funde.slice(0, n - 1)], hide_if_flags: [funde[n - 1]] } })),
      { id: id('rivale'), kind: 'rivale_viertel', viertel: pid, done_flag: f('rivale'), tile: [0, 0], prompt: t.ui_rivale, marker: true,
        visible_if: { requires_flags: funde, hide_if_flags: [f('rivale')] } },
      { id: id('lohn'), kind: 'read', tile: [6, 24], prompt: t.ui_abgeben, title: t.wer, text: t.lohn, marker: true, done_flag: f('fertig'),
        effects: { gives_money: PVG_LOHN.money, gives_items: { ...PVG_LOHN.items }, complete_quests: [`pvg_${pid}`] },
        visible_if: { requires_flags: [f('rivale')], hide_if_flags: [f('fertig')] } },
    );
    const ziel = (s, label) => ({ map: m.id, id: id(s), label });
    content.quests[`pvg_${pid}`] = {
      title: t.quest, kind: 'side', case: 'side',
      steps: [
        { text: t.ui_schritt_bitte, done: { requires_flags: [f('start')] }, target: ziel('bitte', m.name) },
        ...[1, 2, 3].map((n) => ({ text: t[`fund${n}_schritt`], done: { requires_flags: [funde[n - 1]] }, target: ziel(`fund${n}`, m.name) })),
        { text: t.ui_schritt_rivale, done: { requires_flags: [f('rivale')] }, target: ziel('rivale', m.name) },
        { text: t.ui_schritt_lohn, done: { requires_flags: [f('fertig')] }, target: ziel('lohn', m.name) },
      ],
    };
  }
  return content;
}
