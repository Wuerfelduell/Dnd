/**
 * Rivalen Etappe 4 (Seb 2026-11-27): ein kurzer persönlicher Bogen je Pfad in drei Schritten, der erst mit höheren
 * Sequenzen aufgeht (Schritt 1 ab Seq 5, Schritt 2 ab Seq 4, Finale ab Seq 3 des Spielers). Im Finale: Kämpfen
 * (Sieg = der Rivale ist für immer erledigt, sein Rest fällt sicher), Bündnis für immer (kein Verrat mehr) oder ein
 * dritter Weg, der etwas kostet (der Rivale verlässt den Pfad). Texte [de, en] mit {name}; Logik in core/Rivale.js.
 */
export const BOGEN_SEQ = { 1: 5, 2: 4, 3: 3 };

/** dritter: Kosten des dritten Weges ({ unruhe } | { honor } | { money } | { items }). */
export const RIVALE_BOGEN = {
  laterne: {
    s1: ['{name} bleibt stehen, das Gesicht im Schatten. „Ich habe in eine schwarze Laterne gesehen. Darin stand nur einer von uns ganz oben. Deshalb renne ich.“', '{name} stops, face in shadow. "I looked into a black lantern. In it only one of us stood at the top. That is why I run."'],
    s2: ['{name} hält dir eine Scherbe Dunkelglas hin. Darin brennt ihr beide. „Sie zeigt es jeden Tag anders. Heute sterbe ich zuerst. Gestern du.“', '{name} holds out a shard of darkglass. In it you are both burning. "It shows it differently every day. Today I die first. Yesterday you did."'],
    s3: ['{name} wartet unter der letzten schwarzen Laterne. „Die Vision wird nicht klarer. Heute machen wir sie klar.“', '{name} waits beneath the last black lantern. "The vision won\'t get any clearer. Today we make it clear."'],
    dritter: [['Die Laterne löschen (Ansehen −5)', 'Put out the lantern (reputation −5)'], ['Du zerschlägst die Laterne vor allen Leuten. Keine Vision mehr, für keinen von euch. Man hält dich für verrückt. {name} sieht dich lange an und geht, ohne sich umzudrehen.', 'You smash the lantern in front of everyone. No more visions, for either of you. People think you are mad. {name} looks at you for a long time and leaves without turning back.']],
    kosten: { honor: -5 } },
  faden: {
    s1: ['{name} zieht einen Faden aus dem Ärmel. „Das ist eine Erinnerung von dir. Ich habe sie mir geborgt, um zu verstehen, warum du nicht aufgibst.“', '{name} pulls a thread from their sleeve. "This is one of your memories. I borrowed it to understand why you won\'t give up."'],
    s2: ['{name} wirkt verwirrt. „Ich habe zu viele fremde Fäden getragen. Manchmal weiß ich nicht mehr, welcher Weg meiner ist und welcher deiner.“', '{name} seems confused. "I have worn too many borrowed threads. Sometimes I no longer know which path is mine and which is yours."'],
    s3: ['{name} hat alle Fäden zwischen euch gespannt. „Einer von uns schneidet. Der andere bleibt hängen.“', '{name} has strung every thread between you. "One of us cuts. The other stays caught."'],
    dritter: [['Die eigenen Fäden opfern (Unruhe +30)', 'Sacrifice your own threads (Unrest +30)'], ['Du gibst {name} die Erinnerungen, die {name} sucht, und noch ein paar mehr. In deinem Kopf wird es laut und leer zugleich. {name} geht, beschenkt und verloren.', 'You give {name} the memories {name} is looking for, and a few more. Your head becomes loud and empty at once. {name} leaves, gifted and lost.']],
    kosten: { unruhe: 30 } },
  maske: {
    s1: ['{name} trägt heute kein fremdes Gesicht. „Das ist mein echtes. Ich habe es seit Jahren nicht mehr gezeigt. Gefällt es dir?“', '{name} wears no borrowed face today. "This is my real one. I haven\'t shown it in years. Do you like it?"'],
    s2: ['{name} erzählt leise: „In Kettlegate gab es einen Beyonder, der mein Gesicht gestohlen hat. Seitdem nehme ich mir, was ich brauche, bevor man es mir nimmt.“', '{name} speaks quietly: "In Kettlegate there was a Beyonder who stole my face. Since then I take what I need before it is taken from me."'],
    s3: ['{name} trägt dein Gesicht, perfekt. „Nur einer von uns darf so aussehen. Entscheide.“', '{name} wears your face, perfectly. "Only one of us gets to look like this. Decide."'],
    dritter: [['Dein Gesicht hergeben (Ansehen −5)', 'Give up your face (reputation −5)'], ['Du lässt {name} dein Gesicht. Eine Woche lang erkennt dich niemand, und was {name} damit anstellt, fällt auf dich zurück. Dann ist {name} fort, mit einem Gesicht, das endlich bleibt.', 'You let {name} keep your face. For a week no one recognises you, and what {name} does with it falls back on you. Then {name} is gone, with a face that finally stays.']],
    kosten: { honor: -5 } },
  echo: {
    s1: ['{name} hält sich die Ohren zu. „Hörst du sie auch? Die Stimmen auf unserem Pfad sagen deinen Namen öfter als meinen.“', '{name} covers their ears. "Do you hear them too? The voices on our pathway say your name more often than mine."'],
    s2: ['{name} flüstert, und diesmal kommt nur ein Echo zurück. „Ich bin leiser geworden. Wenn ich nicht bald weiterkomme, bin ich bald nur noch ein Echo von dir.“', '{name} whispers, and this time only one echo returns. "I have grown quieter. If I don\'t move on soon, I will be nothing but an echo of you."'],
    s3: ['{name} steht in einer Halle, in der jedes Wort dreimal zurückkommt. „Hier hört man, wer lauter ist.“', '{name} stands in a hall where every word comes back three times. "Here you can hear who is louder."'],
    dritter: [['Die Stimmen teilen (Unruhe +30)', 'Share the voices (Unrest +30)'], ['Du nimmst {name} einen Teil der Stimmen ab. Sie ziehen in deinen Kopf und richten sich ein. {name} atmet zum ersten Mal ruhig, nickt dir zu und verlässt den Pfad.', 'You take some of the voices from {name}. They move into your head and settle in. {name} breathes calmly for the first time, nods to you and leaves the pathway.']],
    kosten: { unruhe: 30 } },
  kessel: {
    s1: ['{name} rührt in einem Topf, der nicht auf dem Feuer steht. „Mein Meister hat mir ein Rezept vererbt, das den Pfad bis ganz nach oben braut. Es fehlt nur eine Zutat. Ich glaube, die bist du.“', '{name} stirs a pot that isn\'t on the fire. "My master left me a recipe that brews the pathway all the way up. Only one ingredient is missing. I think it\'s you."'],
    s2: ['{name} zeigt dir das Rezept. Die letzte Zeile ist durchgestrichen und neu geschrieben, in zwei Handschriften. Eine davon sieht aus wie deine.', '{name} shows you the recipe. The last line is crossed out and rewritten, in two hands. One of them looks like yours.'],
    s3: ['{name} hat den Kessel angeheizt. „Entweder du kommst hinein oder ich. Oder wir finden etwas anderes, das genauso gut brennt.“', '{name} has fired up the cauldron. "Either you go in, or I do. Or we find something else that burns just as well."'],
    dritter: [['Etwas anderes in den Kessel (3 Geisteressenz)', 'Something else in the cauldron (3 spirit essence)'], ['Du kippst drei Geisteressenzen in den Kessel. Es brodelt, es stinkt, und es reicht. {name} füllt den Trank ab, verbeugt sich und braut ab jetzt woanders.', 'You pour three spirit essences into the cauldron. It bubbles, it stinks, and it is enough. {name} bottles the potion, bows and brews somewhere else from now on.']],
    kosten: { items: { geisteressenz: 3 } } },
  eisen: {
    s1: ['{name} zeigt dir die Narben auf den Fäusten. „Ich habe jeden auf meinem Pfad niedergeschlagen. Nur dich nicht ganz. Das lässt mich nicht schlafen.“', '{name} shows you the scars on their fists. "I have knocked down everyone on my pathway. Only you not quite. It keeps me up at night."'],
    s2: ['{name} schmiedet nachts an einer Rüstung, die zu groß für {name} ist. „Für oben. Da oben schlägt einen keiner mehr zurück.“', '{name} forges armour at night that is too big for {name}. "For the top. Up there no one hits back any more."'],
    s3: ['{name} hat die Rüstung angelegt. „Kein Gerede mehr. Wer steht, steigt auf.“', '{name} has put on the armour. "No more talk. Whoever stands, ascends."'],
    dritter: [['Vor {name} niederknien (Ansehen −5)', 'Kneel before {name} (reputation −5)'], ['Du kniest vor allen Leuten nieder. {name} ist so überrascht, dass die Fäuste sinken. „Das zählt nicht. Aber ich lasse es gelten.“ {name} zieht weiter, als Sieger, und du bleibst mit deinem Stolz im Staub.', 'You kneel in front of everyone. {name} is so surprised that the fists drop. "That doesn\'t count. But I\'ll let it stand." {name} moves on, as the victor, and you stay in the dust with your pride.']],
    kosten: { honor: -5 } },
  schluessel: {
    s1: ['{name} wirft dir einen Schlüssel zu. „Der passt in die Tür, durch die ich hergekommen bin. Ich finde sie nicht mehr. Du vielleicht.“', '{name} tosses you a key. "It fits the door I came through. I can\'t find it any more. Maybe you can."'],
    s2: ['{name} sitzt auf einer Schwelle, die nirgendwohin führt. „Ich habe jede Tür auf unserem Pfad geöffnet. Hinter keiner war ein Zuhause.“', '{name} sits on a threshold that leads nowhere. "I have opened every door on our pathway. There was no home behind any of them."'],
    s3: ['{name} steht vor der letzten Tür und hält den einzigen Schlüssel. „Durch die passt nur einer.“', '{name} stands before the last door holding the only key. "Only one fits through this one."'],
    dritter: [['Eine zweite Tür aufbrechen (3 Geisteressenz)', 'Force a second door (3 spirit essence)'], ['Mit drei Geisteressenzen brichst du eine zweite Tür in die Wand. {name} lacht ungläubig, geht hindurch und schließt sie hinter sich. Ihr steht euch nie wieder im Weg.', 'With three spirit essences you break a second door into the wall. {name} laughs in disbelief, walks through it and closes it behind them. You will never stand in each other\'s way again.']],
    kosten: { items: { geisteressenz: 3 } } },
  sq_waage: {
    s1: ['{name} schlägt das Schuldbuch auf. „Du stehst darin. Jeder Schritt auf unserem Pfad, den du vor mir gemacht hast. Die Summe ist beachtlich.“', '{name} opens the ledger. "You are in it. Every step on our pathway you took before me. The sum is considerable."'],
    s2: ['{name} rechnet laut. „Wenn ich dich überhole, ist die Schuld beglichen. Wenn nicht, schulde ich dir. Ich hasse Schulden.“', '{name} calculates aloud. "If I overtake you, the debt is settled. If not, I owe you. I hate debts."'],
    s3: ['{name} legt die Waage zwischen euch. „Heute wird abgerechnet.“', '{name} sets the scales between you. "Today we settle the account."'],
    dritter: [['Die Schuld bezahlen (10.000 Schilling)', 'Pay the debt (10,000 shillings)'], ['Du zählst {name} zehntausend Schilling auf die Waage. Sie kippt, und {name} streicht die Zeile durch. „Quitt.“ {name} klappt das Buch zu und verlässt den Pfad.', 'You count ten thousand shillings onto the scales. They tip, and {name} strikes out the line. "Square." {name} closes the book and leaves the pathway.']],
    kosten: { money: 10000 } },
  sq_moor: {
    s1: ['{name} steht bis zu den Knien im Torf und sinkt nicht. „Das Moor hat meine Familie geholt. Ich will hoch genug kommen, um es zurückzufordern.“', '{name} stands knee-deep in peat and does not sink. "The bog took my family. I want to climb high enough to demand them back."'],
    s2: ['{name} zeigt dir Gesichter unter der Torfdecke. „Es gibt nur einen Platz, von dem aus man das Moor befehlen kann. Wir wollen beide dorthin.“', '{name} shows you faces beneath the peat. "There is only one place from which the bog can be commanded. We both want to get there."'],
    s3: ['{name} hat das Moor gerufen, es steigt um euch beide. „Wer hier steht, wenn es sich legt, bekommt den Platz.“', '{name} has called the bog, it rises around you both. "Whoever is standing here when it settles gets the place."'],
    dritter: [['Dem Moor etwas geben (3 Geisteressenz)', 'Give the bog something (3 spirit essence)'], ['Du versenkst drei Geisteressenzen im Torf. Das Moor gibt ein Gesicht frei, und {name} zieht ein Kind heraus. {name} weint, nimmt es auf den Arm und geht. Den Platz will {name} nicht mehr.', 'You sink three spirit essences into the peat. The bog releases a face, and {name} pulls out a child. {name} weeps, lifts it up and leaves. {name} no longer wants the place.']],
    kosten: { items: { geisteressenz: 3 } } },
  sq_uhr: {
    s1: ['{name} zeigt dir eine Taschenuhr, die rückwärts läuft. „Meine Lebenszeit. Ich habe sie verbraucht, um schneller zu sein als du. Es bleibt nicht mehr viel.“', '{name} shows you a pocket watch running backwards. "My lifetime. I spent it to be faster than you. Not much is left."'],
    s2: ['{name} ist sichtbar gealtert. „Noch ein Sprung, dann bin ich oben. Oder tot. Hauptsache vor dir.“', '{name} has visibly aged. "One more leap and I\'m at the top. Or dead. As long as it\'s before you."'],
    s3: ['{name} hält die Zeit an, nur für euch beide. „Hier vergeht keine Sekunde, bis einer von uns fällt.“', '{name} stops time, just for the two of you. "Not a second passes here until one of us falls."'],
    dritter: [['{name} Zeit schenken (Unruhe +30)', 'Give {name} time (Unrest +30)'], ['Du gibst {name} ein Stück deiner eigenen Zeit. Es fühlt sich an, als fehle dir ein Jahr, und die Stimmen nutzen die Lücke. Die Uhr von {name} läuft wieder vorwärts. {name} geht, langsam, zum ersten Mal ohne Eile.', 'You give {name} a piece of your own time. It feels as if a year is missing, and the voices use the gap. {name}\'s watch runs forwards again. {name} leaves, slowly, for the first time without hurry.']],
    kosten: { unruhe: 30 } },
};

/** Feste Texte des Finales (mit {name}). */
export const BOGEN_TEXTE = {
  finale_sieg: ['{name} liegt am Boden und lacht leise. „Dann eben du.“ Der Rivale ist erledigt und wird dir nie wieder im Weg stehen. Was von {name}s Kraft bleibt, gehört dir.', '{name} lies on the ground and laughs softly. "Then you it is." The rival is finished and will never stand in your way again. What remains of {name}\'s power is yours.'],
  finale_buendnis: ['{name} streckt die Hand aus. „Dann gehen wir eben zu zweit nach oben. Und diesmal für immer.“ Das Bündnis hält, egal wie weit einer von euch zurückfällt.', '{name} holds out a hand. "Then we go up together. And this time for good." The alliance holds, however far one of you falls behind.'],
  finale_nein: ['{name} schüttelt den Kopf. „Ein Bündnis mit jemandem, den ich nie geschlagen habe? Erst kämpfen.“', '{name} shakes their head. "An alliance with someone I have never fought? Fight first."'],
  finale_kosten: ['Das kannst du dir gerade nicht leisten.', 'You cannot afford that right now.'],
  finale_kampf: ['Kämpfen', 'Fight'],
  finale_bund: ['Bündnis für immer', 'Alliance for good'],
  fort: ['Erledigt', 'Finished'],
};

const ersetze = (t, name) => t.replaceAll('{name}s', `${name}s`).replaceAll('{name}', name);

/** Text eines Bogens (s1, s2, s3, dritter_label, dritter_text) oder des Finales. */
export function bogenText(feld, pid, name) {
  const b = RIVALE_BOGEN[pid];
  const t = feld === 'dritter_label' ? b?.dritter[0][0] : feld === 'dritter_text' ? b?.dritter[1][0] : b?.[feld]?.[0] ?? BOGEN_TEXTE[feld]?.[0] ?? '';
  return ersetze(t ?? '', name);
}

/** Englisches Wörterbuch für alle Namen. */
export function bogenWoerterbuch(rivalen) {
  const out = {};
  for (const [pid, r] of Object.entries(rivalen)) {
    const b = RIVALE_BOGEN[pid];
    if (!b) continue;
    const paare = [b.s1, b.s2, b.s3, b.dritter[0], b.dritter[1], ...Object.values(BOGEN_TEXTE)];
    for (const name of [r.name, r.name2]) for (const [de, en] of paare) out[ersetze(de, name)] = en.replaceAll('{name}', name);
  }
  return out;
}
