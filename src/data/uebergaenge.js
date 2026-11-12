/**
 * Kapitelübergänge (Seb 2026-11-12): Abschied, Reise und Ankunft als kleine Szenenfolge statt einer bloßen Reisezeile.
 *
 * - Kapitel 1 → 2: Der Reiseeintrag „Zug nach Wexmoor“ öffnet `uebergang_k1k2` (Bahnsteig in Kettlegate, Nachtzug übers Moor,
 *   Einfahrt in Wexmoor). Erst die Einfahrt setzt die Reise; „Noch nicht“ lässt dich in Kettlegate.
 * - Kapitel 2 → 3: Die vier Anreise-Dialoge `k3a_anreise_<ende>` erzählen jetzt passend zum Kapitel-2-Ende, warum es nach
 *   Dunscar geht (Starlings Spur), wer dich verabschiedet, die Fahrt durch die Kalkberge und die Ankunft.
 * - Auf der Fahrt wählst du eine Kleinigkeit: schlafen (volle Heilung), zuhören (Vorwissen) oder nachdenken (Nerven).
 *
 * Bilder: nur vorhandene Szenen (Codex ist aufgebraucht), `ds_nachtzug` ist neu angemeldet (assets.js).
 */

const K2_ENDEN = ['rein', 'moor', 'lichtmeister', 'meer'];

/** Kapitel 1 → 2: vom Bahnsteig in Kettlegate bis zur Einfahrt in Wexmoor. */
const K1K2 = {
  start: [
    { node: 'abschied_marlowe', requires_flags: ['marlowe_trusts'] },
    { node: 'abschied_vey', requires_flags: ['c9_wrong'] },
    { node: 'abschied' },
  ],
  nodes: {
    abschied_marlowe: {
      scene: 'marlowe',
      text: 'Der Bahnhof von Kettlegate riecht nach nassem Ruß. Auf dem Bahnsteig steht Marlowe, den Kragen hochgeschlagen, als wäre sie zufällig hier.\n\n„Price lässt die Halle in einer Stunde absperren“, sagt sie, ohne dich anzusehen. „Bis dahin bin ich nur eine Frau, die auf einen Zug wartet.“ Sie steckt dir ein Päckchen Zwieback in die Tasche. „Iss was. Und schreib mir nicht. Ich finde dich, wenn es so weit ist.“\n\nEin Junge vom Kohlenhof drückt sich an euch vorbei und lässt einen Zettel fallen: „Von Jem. In Wexmoor frag nach Zunder. Sie schuldet mir was.“',
      choices: [
        { text: 'Einsteigen. (Danach gibt es kein Zurück nach Kettlegate.)', next: 'fahrt' },
        { text: 'Noch nicht. Ich habe hier noch etwas zu erledigen.' },
      ],
    },
    abschied_vey: {
      scene: 'brief',
      text: 'Der Bahnhof von Kettlegate riecht nach nassem Ruß. Niemand ist gekommen, um dich zu verabschieden. An der Wand des Wartesaals hängen zwei Steckbriefe nebeneinander: deiner und der von Miriam Vey. Über ihrem steht jetzt „verurteilt“.\n\nDu weißt, dass es die falsche Frau war. Starling weiß es auch.\n\nEin Junge vom Kohlenhof drückt sich an dir vorbei und lässt einen Zettel fallen: „Von Jem. In Wexmoor frag nach Zunder. Sie schuldet mir was.“',
      choices: [
        { text: 'Einsteigen. (Danach gibt es kein Zurück nach Kettlegate.)', next: 'fahrt' },
        { text: 'Noch nicht. Ich habe hier noch etwas zu erledigen.' },
      ],
    },
    abschied: {
      scene: 'brief',
      text: 'Der Bahnhof von Kettlegate riecht nach nassem Ruß. Die Uhr über dem Gleis zeigt kurz vor fünf. An jeder Säule hängt ein Steckbrief, und der Kleister ist noch feucht.\n\nDer Schaffner prüft deine Fahrkarte, liest den fremden Namen darauf und nickt, als wäre es deiner.\n\nEin Junge vom Kohlenhof drückt sich an dir vorbei und lässt einen Zettel fallen: „Von Jem. In Wexmoor frag nach Zunder. Sie schuldet mir was.“',
      choices: [
        { text: 'Einsteigen. (Danach gibt es kein Zurück nach Kettlegate.)', next: 'fahrt' },
        { text: 'Noch nicht. Ich habe hier noch etwas zu erledigen.' },
      ],
    },
    fahrt: {
      scene: 'reise_nebel',
      text: 'Der Zug rollt aus der Halle. Hinter den letzten Schornsteinen wird das Land flach, dann nass, dann still. Das Moor.\n\nStundenlang nur Nebel, Birkenstümpfe und Wasser, das im Licht der Lok aufblitzt. Im Abteil sitzt eine alte Torfstecherin mit einem Korb voller Soden, die dich mustert, als würde sie dein Gewicht schätzen.\n\nIn deiner Tasche knistern Starlings Briefe. Vier Stück, alle unterschrieben mit „L.“.',
      choices: [
        { text: 'Schlafen, solange es geht.', next: 'fahrt_schlaf' },
        { text: 'Der Torfstecherin zuhören.', next: 'fahrt_torf' },
        { text: 'Starlings Briefe noch einmal lesen.', next: 'fahrt_briefe' },
      ],
    },
    fahrt_schlaf: {
      heal: 'full',
      text: 'Du lehnst den Kopf an die kalte Scheibe. Das Rattern der Räder wird zu einem Herzschlag, und zum ersten Mal seit Tagen träumst du nichts.\n\nAls du aufwachst, liegt eine Decke über dir, die vorher nicht da war. Die Torfstecherin tut, als hätte sie nichts gesehen.',
      choices: [{ text: 'Aus dem Fenster sehen.', next: 'einfahrt' }],
    },
    fahrt_torf: {
      nerves: 2,
      sets_flags: ['k2_reise_torf'],
      text: '„Fremde erkennt man in Wexmoor an den Schuhen“, sagt sie. „Zu sauber. Die Grauspäher tragen Sturmlaternen, und was im Lichtkegel steht, gehört ihnen. Bleib im Schatten, dann bist du Nebel.“\n\nSie zeigt aus dem Fenster, wo über dem Moor ein Licht kreist. „Der Leuchtturm. Kein Meer weit und breit, und trotzdem brennt er jede Nacht. Frag nicht, wofür. Wer fragt, steht irgendwann selbst im Licht.“',
      choices: [{ text: 'Aus dem Fenster sehen.', next: 'einfahrt' }],
    },
    fahrt_briefe: {
      nerves: 1,
      sets_flags: ['k2_reise_briefe'],
      text: 'Starlings Schrift ist eng und höflich. „Die Ernte aus Kettlegate wie besprochen. L. wird zufrieden sein.“ Und weiter unten: „Das Licht braucht Namen, nicht Körper.“\n\nL. Nicht Lucius. Jemand, dem Starling Bericht erstattet. Jemand, der in der Stadt wartet, in die dieser Zug fährt.\n\nDu faltest die Briefe zusammen und merkst erst jetzt, dass deine Hände zittern.',
      choices: [{ text: 'Aus dem Fenster sehen.', next: 'einfahrt' }],
    },
    einfahrt: {
      scene: 'r_lichter',
      travel: { map: 'wx_bahnhof', spawn: 'zug' },
      complete_quests: ['k1_abreise'],
      text: 'Gegen Morgen bremst der Zug. Aus dem Nebel wachsen Pfahlbauten, Stege, Lastkähne, ein Gewirr aus Dächern, die alle ein wenig schief stehen, als würde die Stadt langsam einsinken.\n\nDer Schaffner geht durch den Wagen und klopft an jede Tür. „Wexmoor. Endstation.“ Vor deinem Abteil bleibt er kurz stehen. „Für Fremde jedenfalls.“',
      choices: [{ text: 'Aussteigen.' }],
    },
  },
};

/** Kapitel 2 → 3: Brief je Kapitel-2-Ende, Abschied je Ende, gemeinsame Fahrt und Ankunft in Dunscar. */
const BRIEF = {
  rein: 'Marlowe telegrafiert aus Kettlegate: „STARLING AUS ZEUGENVERWAHRUNG VERSCHWUNDEN STOP NACHT NACH SEINER AUSSAGE STOP LOKFÜHRER DER KALKBAHN SAH DURCHSICHTIGEN MANN IN DUNSCAR AUSSTEIGEN STOP MINISTERIUM NENNT IHN ZEUGEN STOP ICH DARF IHN NICHT JAGEN STOP DU SCHON“',
  moor: 'Zunder legt dir einen ölverschmierten Zettel auf den Tisch. „Hat ein Bahnarbeiter in einem leeren Güterwagen gefunden.“ Es ist Starlings Schrift, eine Liste mit Namen, und unten ein Lieferschild: Kalkbahn, Endbahnhof Dunscar.\n\n„Das Feuer ist aus“, sagt Zunder. „Aber dein Sammler läuft noch frei herum.“',
  lichtmeister: 'Auf dem Schreibtisch im Leuchtturm liegt ein Brief, adressiert an „den neuen Lichtmeister“. Starlings Schrift. „Gratuliere. Sie haben das Feuer, ich habe Dunscar. Dort gibt es etwas, das älter ist als jedes Licht, und es mag mich. Kommen Sie, wenn Sie sich trauen.“\n\nDaneben eine Fahrkarte erster Klasse, auf deinen Amtstitel ausgestellt.',
  meer: 'Kit hat beim Umladen eine Kohlenkiste aufgebrochen. Darin: ein Fahrplan der Kalkbahn und eine Quittung über eine Passage nach Dunscar, bezahlt mit Starlings Siegel.\n\n„Der Kerl hat sich abgesetzt, während wir auf dem Wasser waren“, sagt Kit und spuckt über die Reling. „Ins Landesinnere. Da, wo keiner ein Meer kennt.“',
};

const ABSCHIED = {
  rein: { scene: 'r_ankunft', text: 'Am Güterbahnhof warten zwei Leute auf dich. Hale in Uniform, die Mütze in der Hand, und Zunder mit einem Ölkanister, den sie dir in den Arm drückt.\n\n„Das Kommando hier gehört jetzt mir“, sagt Hale. „Wenn du Starling findest, bring ihn lebend. Ich will ihn vor Gericht sehen.“\n\nZunder sagt nichts. Sie boxt dich nur gegen die Schulter, zu fest, und dreht sich weg, bevor der Zug einfährt.' },
  moor: { scene: 'r_ueberfahrt', text: 'Zunder rudert dich ein letztes Mal durch die Kanäle zum Güterbahnhof. Das Moor ist ruhig, zum ersten Mal, seit du hier bist. Kein Licht kreist mehr über den Dächern.\n\n„Wenn du ihn erwischst“, sagt sie, als der Kahn anlegt, „dann frag ihn, wie viele es waren. Die genaue Zahl. Ich will sie wissen.“' },
  lichtmeister: { scene: 'r_brandt', text: 'Niemand kommt zum Bahnhof. Die Schreiber des Lichtamts stehen in einer Reihe und verbeugen sich, als du vorbeigehst, und keiner sieht dir in die Augen.\n\nAuf dem Bahnsteig liegt ein Zettel unter einem Stein, in Zunders krakeliger Schrift: „Fahr ruhig. Hier vermisst dich keiner.“\n\nHinter dir dreht sich das Leuchtfeuer weiter. Es wartet auf dich.' },
  meer: { scene: 'r_ueberfahrt', text: 'Kit und Zunder bringen dich mit dem Kohlekahn zur Verladestelle, wo die Kalkbahn ihre Wagen füllt. Brandt brennt noch immer oben im Leuchtturm, und ihr alle wisst es.\n\n„Wir bleiben beim Kahn“, sagt Kit. „Irgendwer muss ja den Fluchtweg warm halten.“ Zunder wirft dir einen Hering zu. „Für unterwegs. Und komm wieder, wenn du ihn hast.“' },
};

const k3Anreise = (k) => ({
  start: `k3a_anreise_${k}_lesen`,
  nodes: {
    [`k3a_anreise_${k}_lesen`]: {
      scene: k === 'rein' ? 'lese_telegramm' : undefined,
      text: BRIEF[k],
      choices: [
        { text: 'Nach Dunscar reisen.', next: `k3a_anreise_${k}_abschied`, requires_flags: ['kapitel2_done', `k2_end_${k}`], hide_if_flags: ['k3_arrived'] },
        { text: 'Noch hierbleiben.' },
      ],
    },
    [`k3a_anreise_${k}_abschied`]: {
      scene: ABSCHIED[k].scene,
      text: ABSCHIED[k].text,
      choices: [
        { text: 'Einsteigen. (Danach gibt es kein Zurück nach Wexmoor.)', next: `k3a_anreise_${k}_fahrt` },
        { text: 'Noch nicht.' },
      ],
    },
    [`k3a_anreise_${k}_fahrt`]: {
      scene: 'ds_nachtzug',
      text: 'Der Zug lässt das Moor hinter sich. Erst wird das Wasser weniger, dann das Gras, und irgendwann ist alles weiß: Kalkberge, Fördertürme, Halden, die im Mondlicht leuchten wie Knochen.\n\nIm Wagen sitzen Bergleute auf dem Heimweg, Grubenlampen am Gürtel. Einer von ihnen hat dich schon zweimal angesehen und schnell wieder weg.',
      choices: [
        { text: 'Schlafen, solange es geht.', next: `k3a_anreise_${k}_schlaf` },
        { text: 'Den Bergmann fragen, was er weiß.', next: `k3a_anreise_${k}_bergmann` },
        { text: 'Aus dem Fenster sehen und an Starling denken.', next: `k3a_anreise_${k}_fenster` },
      ],
    },
    [`k3a_anreise_${k}_schlaf`]: {
      heal: 'full',
      text: 'Das Rattern der Räder wiegt dich in den Schlaf. Du träumst von einem Fels, der atmet, und wachst auf, weil der Zug in eine Kurve geht. Deine Wunden haben sich geschlossen, als hätte die Nacht sie zugenäht.',
      choices: [{ text: 'Weiter.', next: `k3a_anreise_${k}_ankunft` }],
    },
    [`k3a_anreise_${k}_bergmann`]: {
      sets_flags: ['k3r_gott_gehoert'],
      text: '„Du suchst den Mann, der durch Wände sieht?“, fragt der Bergmann leise. „Den Durchsichtigen. Der war hier. Der wohnt jetzt unter dem Fels.“\n\nEr klopft dreimal gegen das Holz der Bank. „Unter Dunscar schläft was, das älter ist als die Gruben. Wir nennen es den Alten. Wer ihm was mitbringt, den lässt er in Ruhe. Und dein Mann hat ihm viel mitgebracht.“\n\nDann dreht er sich zur Wand und sagt kein Wort mehr.',
      choices: [{ text: 'Weiter.', next: `k3a_anreise_${k}_ankunft` }],
    },
    [`k3a_anreise_${k}_fenster`]: {
      nerves: 3,
      text: 'Draußen ziehen die weißen Halden vorbei. Du denkst an Kettlegate, an die Lichter über den Dächern, an Wexmoor und das Feuer. Jedes Mal war Starling einen Schritt voraus. Jedes Mal hat er gelächelt.\n\nDiesmal nicht. Du zählst die Fördertürme, bis dein Atem ruhig wird.',
      choices: [{ text: 'Weiter.', next: `k3a_anreise_${k}_ankunft` }],
    },
    [`k3a_anreise_${k}_ankunft`]: {
      scene: 'kapitel3_karte',
      sets_flags: [`k3a_anreise_${k}`],
      travel: { map: 'ds_endbahnhof', spawn: 'zug' },
      complete_quests: [`k2_weiter_${k}`],
      text: 'Der Zug fährt in einen Bahnhof, der zu groß ist für die Stadt dahinter. Die Gleise enden an einem Prellbock aus Kalkstein. Weiter geht es nicht, für keinen Zug.\n\nDunscar. Endbahnhof.',
      choices: [{ text: 'Aussteigen.' }],
    },
  },
});

export function applyUebergaenge(content) {
  content.dialogues.uebergang_k1k2 = K1K2;
  for (const k of K2_ENDEN) {
    const tree = k3Anreise(k);
    for (const n of Object.values(tree.nodes)) if (n.scene === undefined) delete n.scene;
    content.dialogues[`k3a_anreise_${k}`] = tree;
  }
  // Der Zug nach Wexmoor fährt nicht mehr wortlos ab: erst Bahnsteig, Fahrt und Einfahrt
  const zug = content.travel.find((t) => t.map === 'wx_bahnhof' && t.spawn === 'zug');
  if (zug) Object.assign(zug, { dialogue: 'uebergang_k1k2', desc: 'Kapitel 2. Mit der Fahrkarte über das Moor in eine fremde Stadt. Danach gibt es kein Zurück nach Kettlegate.' });
  // Die Briefe im Kahn bzw. Leuchtturm erzählen dieselbe Spur wie der Anreise-Dialog
  for (const m of Object.values(content.maps)) {
    for (const it of m.interactables ?? []) {
      const k = /^k3a_anreise_(\w+)_brief$/.exec(it.id ?? '')?.[1];
      if (k && BRIEF[k]) it.text = BRIEF[k];
    }
  }
  // Wegweiser im Notizbuch zwischen Fall 9 und der Abfahrt
  content.quests.k1_abreise = {
    title: 'Der letzte Zug',
    kind: 'main',
    case: 'case_09',
    summary: 'Kapitel 1 ist vorbei. In deiner Tasche steckt eine Fahrkarte nach Wexmoor. Wenn du in Kettlegate alles erledigt hast, nimm den Zug. Danach gibt es kein Zurück.',
    steps: [{ text: 'Nimm über die Stadtkarte den „Zug nach Wexmoor“', done: { requires_flags: ['k2_arrived'] } }],
  };
  for (const id of ['c9_perfect', 'c9_good', 'c9_early', 'c9_vey']) {
    const e = content.endings?.[id];
    if (e) e.start_quests = [...new Set([...(e.start_quests ?? []), 'k1_abreise'])];
  }
}
