/**
 * Eigene Stimmen für die Leute in Dunscar (Seb 2026-11-13: „jedes Gespräch fühlt sich so ähnlich an“).
 *
 * Vorher begannen alle Hauptfiguren mit demselben Schablonensatz („… wartet, bis du deine Unterlagen geordnet hast“),
 * Willa und Gallowmere hatten gar nichts zu sagen, und Ortskundige wie Händler stellten dieselben Fragen im selben Wortlaut.
 * Jetzt hat jede Figur:
 * - eine Begrüßung beim ersten Treffen, danach wechselnde Alltagssätze in ihrer eigenen Art,
 * - Reaktionen auf Fortschritt (Sequenz 5 / Halbgott), Fahndung, Gerüchte über den Alten und die Stimmung (Beziehung),
 * - kurze Rückkehrsätze, wenn man im selben Gespräch ins Menü zurückkommt,
 * - zwei eigene Gesprächsthemen (eins über sich, eins über Starling und den Alten, das zählt fürs Kapitelziel),
 * - Antwortoptionen im eigenen Wortlaut statt „Die beiden Beobachtungen gemeinsam prüfen.“.
 * Technik: Knotenfeld `texte` (GameState.nodeText). Englisch steht direkt daneben (L(de, en)) und landet über
 * tools/stimmen-en.mjs in src/i18n/en/kapitel3_stimmen.json (Test prüft den Gleichstand).
 */

const EN = {};
/** Deutscher Text, englische Übersetzung wird mitgeschrieben. */
const L = (de, en) => { EN[de] = en; return de; };
export const DUNSCAR_STIMMEN_EN = EN;

// --- Hauptfiguren -------------------------------------------------------------------------------------------

const FIGUREN = {
  k3a_pfiff: {
    npc: 'k3_pfiff',
    erstes: L('Ein alter Mann mit Signalpfeife an der Weste schiebt dir einen Becher Tee hin, bevor du etwas sagst. „Cedrow. Alle sagen Pfiff. Bett, Lager und Kessel stehen dir offen. Trink, dann reden wir.“',
      'An old man with a signal whistle on his waistcoat pushes a mug of tea towards you before you can speak. “Cedrow. Everyone calls me Whistle. Bed, storage and kettle are yours. Drink first, then we talk.”'),
    erneut: [
      L('Pfiff gießt nach, ohne zu fragen. „Und sonst?“', 'Whistle tops up your mug without asking. “Anything else?”'),
      L('„Noch was auf dem Fahrplan?“ Pfiff tippt auf den Tisch.', '“Anything else on the timetable?” Whistle taps the table.'),
    ],
    seq4: L('Pfiff stellt den Becher ab und sieht dich lange an. „Halbgott. Ich hab mal einen Zug gesehen, der zu schnell für seine Gleise war. Der ist angekommen. Die Gleise nicht.“',
      'Whistle sets the mug down and looks at you for a long time. “Demigod. I once saw a train that was too fast for its rails. The train arrived. The rails didn’t.”'),
    seq5: L('Pfiff pfeift leise durch die Zähne. „Du gehst anders als bei deiner Ankunft. Schwerer. Als hättest du Kohle geladen.“',
      'Whistle whistles softly through his teeth. “You walk differently than when you arrived. Heavier. Like you’ve taken on coal.”'),
    fahndung: L('Pfiff zieht den Vorhang am Fenster zu. „Draußen fragen Aufseher nach einem Gesicht wie deinem. Trink aus, bevor du rausgehst.“',
      'Whistle draws the curtain across the window. “Overseers outside are asking after a face like yours. Finish your tea before you go out.”'),
    gott: L('„Hast du wieder vom Alten gehört?“ Pfiff dreht den Becher in den Händen. „Die Leute reden über ihn wie übers Wetter. Damit sie nicht über ihn reden müssen wie über einen Nachbarn.“',
      '“Heard about the Old One again?” Whistle turns the mug in his hands. “People talk about him like the weather. So they don’t have to talk about him like a neighbour.”'),
    freundlich: L('Pfiff hat deinen Becher schon vorgewärmt. „Ich hab dich an den Schritten erkannt. Die Schwelle knarrt bei dir anders.“',
      'Whistle has already warmed your mug. “I knew you by your footsteps. The threshold creaks differently for you.”'),
    feindselig: [L('Pfiff lässt die Kanne, wo sie ist. „Bett und Kessel gehören dir trotzdem. So weit reicht mein Groll nicht.“',
      'Whistle leaves the pot where it is. “Bed and kettle are still yours. My grudge doesn’t stretch that far.”')],
    alltag: [
      L('Ansel „Pfiff“ Cedrow schiebt dir einen Becher Tee hin. „Bett, Lager und Kessel stehen dir offen. Was brauchst du?“',
        'Ansel “Whistle” Cedrow pushes a mug of tea towards you. “Bed, storage and kettle are yours. What do you need?”'),
      L('Pfiff poliert seine alte Signalpfeife am Ärmel. „Die hat dreißig Jahre lang Züge angehalten. Jetzt hält sie nur noch mich wach.“',
        'Whistle polishes his old signal whistle on his sleeve. “This stopped trains for thirty years. Now it only keeps me awake.”'),
      L('Pfiff zählt Teeblätter in die Kanne, eins zu viel. „Für den, der noch kommt. Kommt meistens keiner.“',
        'Whistle counts tea leaves into the pot, one too many. “For whoever’s still coming. Usually nobody does.”'),
      L('„Bett gemacht, Kessel kalt, Lager so, wie du es verlassen hast.“ Pfiff grinst. „Fast wie Familie. Nur ordentlicher.“',
        '“Bed made, kettle cold, storage just as you left it.” Whistle grins. “Almost like family. Only tidier.”'),
    ],
    themen: [
      { label: L('Wie war Dunscar, als die Züge noch fuhren?', 'What was Dunscar like when the trains still ran?'),
        text: L('Pfiff lehnt sich zurück. „Laut. Jede Stunde ein Pfiff, jeder Pfiff ein Name auf der Liste. Wir haben die Leute nach Gehör gezählt. Dann wurde die Strecke stillgelegt, und die Liste hat weitergezählt. Ohne uns.“',
          'Whistle leans back. “Loud. A whistle every hour, a name on the list with every whistle. We counted people by ear. Then the line was shut down, and the list kept counting. Without us.”') },
    ],
    weiter: L('Noch was anderes.', 'Something else.'),
    abschied: L('Danke für den Tee, Pfiff.', 'Thanks for the tea, Whistle.'),
    begleitung: L('„Wir sind zu zweit, Pfiff. Zwei Becher.“', '“There are two of us, Whistle. Two mugs.”'),
    zeugnis: {
      k3n_kalkkinder: L('Pfiff zeigen, was die beiden Spuren zum Kreidekreis verraten.', 'Show Whistle what the two leads about the chalk circle reveal.'),
      k3n_brief_aus_wexmoor: L('Mit Pfiff Paket und Begleitbrief nebeneinanderlegen.', 'Lay the parcel and the covering letter side by side with Whistle.'),
    },
  },

  k3a_nellie: {
    npc: 'k3_nellie',
    erstes: L('Eine junge Frau mit Botenriemen und schiefgelaufenen Absätzen tritt dir in den Weg. „Swarth. Nellie. Botin. Wer neu ist, kriegt Post. Irgendwann. Meistens schlechte.“',
      'A young woman with a courier strap and worn-down heels steps into your path. “Swarth. Nellie. Courier. New people get post. Eventually. Mostly bad.”'),
    erneut: [
      L('„Weiter. Kurz fassen.“', '“Go on. Keep it short.”'),
      L('Nellie tritt auf der Stelle. „Noch was?“', 'Nellie shifts from foot to foot. “Anything else?”'),
    ],
    seq4: L('Nellie mustert dich und spart ausnahmsweise kein Wort. „Du bist jetzt etwas, worüber man Telegramme schickt. Nicht an dich. Über dich.“',
      'Nellie looks you over and, for once, doesn’t save on words. “You’re something people send telegrams about now. Not to you. About you.”'),
    seq5: L('„Neue Gangart“, sagt Nellie. „Leute machen dir Platz. Merk ich an den Wegen.“', '“New gait,” says Nellie. “People step aside for you. I notice it on my rounds.”'),
    fahndung: L('Nellie schiebt dir einen Zettel zu: Aufsicht fragt. Ich sagte: unbekannt. Laut sagt sie nur: „Kostet nichts. Diesmal.“',
      'Nellie slips you a note: Supervision asking. I said: unknown. Out loud she only says: “No charge. This time.”'),
    gott: L('„Der Alte. Hab gehört, du fragst rum.“ Nellie senkt die Stimme. „Lass es. Oder frag schneller. Langsames Fragen hört er.“',
      '“The Old One. Heard you’ve been asking around.” Nellie lowers her voice. “Drop it. Or ask faster. He hears slow questions.”'),
    freundlich: L('Nellie wirft dir im Vorbeigehen einen Apfel zu. „Unzustellbar. Gehört jetzt dir.“', 'Nellie tosses you an apple in passing. “Undeliverable. Yours now.”'),
    feindselig: [L('Nellie bleibt nicht stehen. „Sprich im Gehen. Ich hab Wege.“', 'Nellie doesn’t stop. “Talk while I walk. I’ve got rounds.”')],
    alltag: [
      L('Nellie zählt Umschläge, die Lippen bewegen sich. „Elf. Zwölf. Einer zu viel. Immer einer zu viel.“', 'Nellie counts envelopes, lips moving. “Eleven. Twelve. One too many. Always one too many.”'),
      L('„Gerannt. Wieder gerannt. Hier wartet keiner auf etwas, aber alle wollen es sofort.“', '“Ran. Ran again. Nobody here is waiting for anything, but everyone wants it now.”'),
      L('Nellie wedelt mit einem Telegrammstreifen. „Nicht für dich. Fast für dich. Name falsch geschrieben.“', 'Nellie waves a telegram strip. “Not for you. Almost for you. Name misspelled.”'),
    ],
    themen: [
      { label: L('Wer schickt hier überhaupt noch Post?', 'Who even sends post here any more?'),
        text: L('„Tote. Verwandte von Toten. Und die Aufsicht.“ Nellie zuckt mit den Schultern. „Die Leitung nach draußen ist stillgelegt. Die Telegramme kommen trotzdem. Ich frag nicht mehr, wie. Ich trag aus.“',
          '“The dead. Relatives of the dead. And Supervision.” Nellie shrugs. “The line to the outside is shut down. The telegrams come anyway. I’ve stopped asking how. I deliver.”') },
      { label: L('Hast du je etwas für Starling zugestellt?', 'Did you ever deliver anything for Starling?'), gott: true,
        text: L('„Einmal. Ein Umschlag ohne Absender, adressiert an den, der unten wohnt.“ Nellie reibt sich die Finger. „Kalt, durch den Handschuh. Ich hab ihn in den Bruch geworfen, wie verlangt. Er ist nicht runtergefallen. Er ist eingesunken.“',
          '“Once. An envelope with no sender, addressed to the one who lives below.” Nellie rubs her fingers. “Cold, through the glove. I threw it into the quarry, as instructed. It didn’t fall. It sank in.”') },
    ],
    weiter: L('Eine Sache noch.', 'One more thing.'),
    abschied: L('Lauf weiter, Nellie.', 'Off you go, Nellie.'),
    begleitung: L('„Wir sind zu zweit unterwegs, Nellie.“', '“We’re travelling as two, Nellie.”'),
    zeugnis: {
      k3n_kettlegate: L('Nellie beide Spuren zur alten Rechnung vorlegen.', 'Show Nellie both leads on the old debt.'),
      k3n_falsche_zeit: L('Mit Nellie die beiden Empfangszeiten vergleichen.', 'Compare the two receipt times with Nellie.'),
    },
  },

  k3a_huxford: {
    npc: 'k3_huxford',
    erstes: L('Ein Mann im zu weiten Arztmantel hält zwei Finger an das Handgelenk eines Schlafenden und zählt lautlos. Erst dann sieht er auf. „Huxford. Arzt. Früher habe ich hier Gesundheit bescheinigt. Heute zähle ich nur noch.“',
      'A man in an oversized doctor’s coat holds two fingers to a sleeper’s wrist and counts silently. Only then does he look up. “Huxford. Physician. I used to certify good health here. Now I just count.”'),
    erneut: [
      L('Huxford notiert etwas. „Weiter.“', 'Huxford writes something down. “Go on.”'),
      L('„Noch eine Frage? Die sind billiger als Medizin.“', '“Another question? They’re cheaper than medicine.”'),
    ],
    seq4: L('Huxford greift ungefragt nach deinem Handgelenk und lässt sofort wieder los. „Gleichmäßig. Zu gleichmäßig. Ich schreibe das nicht auf. Manches sollte man nicht bescheinigen.“',
      'Huxford takes your wrist without asking and lets go at once. “Steady. Too steady. I won’t write that down. Some things shouldn’t be certified.”'),
    seq5: L('„Ihre Pupillen reagieren spät auf Licht“, sagt Huxford. „Bei Leuten wie Ihnen ist das wohl normal. Ich habe aufgehört, es normal zu finden.“',
      '“Your pupils are slow to react to light,” says Huxford. “I suppose that’s normal for people like you. I’ve stopped finding it normal.”'),
    fahndung: L('Huxford schiebt dir einen Verband hin, ohne aufzusehen. „Falls die Aufseher Sie erwischen. Ich habe Sie nicht gesehen. Ärztliche Schweigepflicht.“',
      'Huxford pushes a bandage towards you without looking up. “In case the overseers catch you. I haven’t seen you. Medical confidentiality.”'),
    gott: L('„Sie fragen nach dem Alten“, sagt Huxford leise. „Ich habe Leute gesehen, die er berührt hat. Sie sterben nicht. Das ist das Schlimme.“',
      '“You’ve been asking about the Old One,” Huxford says quietly. “I’ve seen people he touched. They don’t die. That’s the terrible part.”'),
    freundlich: L('Huxford rückt dir einen Hocker hin. „Setzen Sie sich. Sie sind der einzige Besuch, der nicht krank ist. Meistens.“',
      'Huxford pulls up a stool for you. “Sit down. You’re the only visitor who isn’t ill. Mostly.”'),
    feindselig: [L('Huxford bleibt über sein Messbuch gebeugt. „Sprechen Sie. Ich höre auch mit dem Rücken zu.“', 'Huxford stays bent over his measurement book. “Speak. I can listen with my back turned.”')],
    alltag: [
      L('Huxford wäscht sich die Hände in einer Schüssel mit trübem Wasser, dreimal. „Kalkstaub“, sagt er. „Geht nie ganz ab.“', 'Huxford washes his hands in a bowl of cloudy water, three times. “Lime dust,” he says. “It never comes off completely.”'),
      L('„Drei Husten heute Morgen, zwei Brüche, ein Mann, der nicht mehr wusste, wie er heißt.“ Huxford klappt das Messbuch zu. „Ein ruhiger Tag.“', '“Three coughs this morning, two fractures, one man who no longer knew his name.” Huxford shuts the measurement book. “A quiet day.”'),
      L('Huxford sitzt auf der Kante einer Pritsche und schläft fast. Er schreckt hoch. „Ich war wach. Ich war wach.“', 'Huxford sits on the edge of a cot, almost asleep. He jolts up. “I was awake. I was awake.”'),
    ],
    themen: [
      { label: L('Was fehlt den Leuten hier?', 'What do the people here lack?'),
        text: L('„Schlaf. Licht. Bezahlung.“ Er zählt an den Fingern ab. „Und Namen. Wer zu lange Schicht hat, vergisst seinen. Ich schreibe ihn ihnen mit Tinte aufs Handgelenk. Die Tinte hält länger als das Gedächtnis.“',
          '“Sleep. Light. Wages.” He counts them off on his fingers. “And names. Anyone on shift too long forgets theirs. I write it on their wrist in ink. The ink lasts longer than the memory.”') },
      { label: L('Haben Sie je jemanden behandelt, den der Alte berührt hat?', 'Have you ever treated someone the Old One touched?'), gott: true,
        text: L('Huxford schweigt lange. „Einen Mann aus dem Bruch. Kein Kratzer, aber kalt wie Stein, seit Tagen. Er lächelte. Er sagte, er sei im Voraus bezahlt worden, genau wie Starling. Am Morgen war die Pritsche leer, und der Abdruck darin war zu schwer für einen Menschen.“',
          'Huxford is silent for a long time. “A man from the quarry. Not a scratch, but cold as stone, for days. He smiled. He said he’d been paid in advance, just like Starling. In the morning the cot was empty, and the hollow in it was too heavy for a man.”') },
    ],
    weiter: L('Noch eine Frage, Doktor.', 'One more question, Doctor.'),
    abschied: L('Ruhen Sie sich aus, Doktor.', 'Get some rest, Doctor.'),
    begleitung: L('„Meine Begleitung braucht keine Untersuchung, Doktor.“', '“My companion doesn’t need an examination, Doctor.”'),
    zeugnis: {
      k3n_attest: L('Huxford die beiden Aussagen zu seinem Attest vorlegen.', 'Put both statements about his certificate before Huxford.'),
    },
  },

  k3a_esther: {
    npc: 'k3_esther',
    erstes: L('Eine Frau mit Ärmelschonern hält eine Mappe mit der flachen Hand fest, als könnte sie weglaufen. „Brindle. Ich habe vierzig Jahre lang die Löhne dieser Stadt gebucht. Fragen Sie nur, wenn Sie die Antwort auch abzeichnen.“',
      'A woman in sleeve protectors holds a folder flat with her palm, as if it might run off. “Brindle. For forty years I booked this town’s wages. Only ask if you’re willing to sign for the answer.”'),
    erneut: [
      L('„Nächster Posten?“', '“Next item?”'),
      L('Esther zieht einen Strich unter die letzte Zeile. „Bitte.“', 'Esther draws a line under the last entry. “Go ahead.”'),
    ],
    seq4: L('Esther blättert, findet keine Spalte für Sie und legt den Stift weg. „Für Halbgötter gibt es kein Konto. Das ist entweder sehr gut für Sie oder sehr schlecht für uns.“',
      'Esther leafs through, finds no column for you and puts down her pen. “There is no account for demigods. That is either very good for you or very bad for us.”'),
    seq5: L('„Sie sind im Wert gestiegen“, sagt Esther trocken. „Die Aufseher führen Sie in einer anderen Spalte. Ich habe nachgesehen.“',
      '“Your value has gone up,” Esther says drily. “The overseers list you in a different column. I checked.”'),
    fahndung: L('Esther schlägt eine Seite um, auf der Ihr Name steht, und schlägt sie wieder zu. „Ein Buchungsfehler. Ich korrigiere ihn. Langsam.“',
      'Esther turns to a page with your name on it, then closes it again. “A booking error. I’ll correct it. Slowly.”'),
    reich: L('Esther hebt eine Braue. „Sie klimpern. In Dunscar klimpert keiner lange. Legen Sie etwas zurück, die Stadt rechnet gern nach.“',
      'Esther raises an eyebrow. “You jingle. Nobody jingles in Dunscar for long. Put something aside, this town likes to audit.”'),
    gott: L('„Sie haben vom Alten gehört.“ Esther tippt auf eine leere Spalte. „Dann wissen Sie jetzt, warum hier unten keine Bilanz je aufgeht.“',
      '“You’ve heard about the Old One.” Esther taps an empty column. “Then now you know why no balance down here ever adds up.”'),
    freundlich: L('Esther hat Ihnen einen Stuhl freigeräumt, die Akten darauf säuberlich gestapelt. „Ich habe Sie erwartet. Nicht verbucht. Erwartet.“',
      'Esther has cleared a chair for you, the files on it neatly stacked. “I expected you. Not booked. Expected.”'),
    feindselig: [L('Esther schließt die Mappe. „Die Sprechstunde ist kurz. Bitte formulieren Sie entsprechend.“', 'Esther closes the folder. “Office hours are short. Please phrase things accordingly.”')],
    alltag: [
      L('Esther rechnet halblaut. „Übertrag … Übertrag … verloren.“ Sie sieht auf. „Nicht das Geld. Die Zeile.“', 'Esther calculates under her breath. “Carried over … carried over … lost.” She looks up. “Not the money. The line.”'),
      L('„Ein Mann ist heute zweimal ausbezahlt worden. Er ist seit siebzig Jahren tot.“ Esther legt den Stift weg. „Ich bin ehrlich gesagt beeindruckt.“', '“A man was paid twice today. He has been dead for seventy years.” Esther puts her pen down. “Frankly, I’m impressed.”'),
      L('Esther stempelt ein leeres Blatt, betrachtet es und stempelt es noch einmal. „Gewohnheit. Man stempelt, damit etwas geschehen ist.“', 'Esther stamps a blank sheet, looks at it and stamps it again. “Habit. You stamp things so that something has happened.”'),
    ],
    themen: [
      { label: L('Was ist ein Leben in Dunscar wert?', 'What is a life worth in Dunscar?'),
        text: L('„Laut Tarif ein Wochenlohn Sterbegeld, auszuzahlen an den nächsten Angehörigen.“ Esther klappt die Mappe zu. „Die Kalkbahn hat nie einen einzigen Angehörigen gefunden. Erstaunlich, wie viele Waisen hier gearbeitet haben.“',
          '“According to the tariff, one week’s wage in death benefit, payable to the next of kin.” Esther closes the folder. “The Lime Railway never found a single next of kin. Remarkable how many orphans worked here.”') },
      { label: L('Steht der Alte in Ihren Büchern?', 'Is the Old One in your books?'), gott: true,
        text: L('Esther zögert, dann schlägt sie die letzte Seite auf. Eine Spalte ohne Überschrift, Beträge in Kreide, nie abgezeichnet. „Abgänge ohne Empfänger. Jede Woche. Jemand zahlt da unten etwas ab. Ihr Starling hat die Spalte eröffnet, mit einer Anzahlung, die ich nicht beziffern kann.“',
          'Esther hesitates, then opens the last page. A column without a heading, sums in chalk, never signed. “Withdrawals without a recipient. Every week. Someone is paying something off down there. Your Starling opened that column, with a deposit I cannot put a figure on.”') },
    ],
    weiter: L('Noch ein Posten.', 'One more item.'),
    abschied: L('Ich halte Sie nicht länger auf.', 'I won’t keep you any longer.'),
    begleitung: L('„Wir sind zu zweit, Frau Brindle.“', '“There are two of us, Mrs Brindle.”'),
    zeugnis: {},
  },

  k3a_pelham: {
    npc: 'k3_pelham',
    erstes: L('Ein Mann mit Staubmaske um den Hals meißelt an einem Stein ohne Inschrift und hört nicht auf. „Pelham. Ich mach Grabsteine. Wenn du einen willst, sag den Namen deutlich. Ich meißel nicht gern zweimal.“',
      'A man with a dust mask round his neck is chiselling a stone with no inscription and doesn’t stop. “Pelham. I make gravestones. If you want one, say the name clearly. I don’t like chiselling twice.”'),
    erneut: [
      L('Pelham klopft weiter. „Hm?“', 'Pelham keeps tapping. “Hm?”'),
      L('„Noch was. Sag schon.“ Tock. Tock.', '“Something else. Out with it.” Tock. Tock.'),
    ],
    seq4: L('Pelham legt den Meißel weg. „Ich hab deinen Stein schon angefangen, wie bei allen Neuen. Jetzt weiß ich nicht, ob ich ihn je brauche.“ Er klingt fast enttäuscht.',
      'Pelham puts the chisel down. “I’d already started your stone, like for all the new ones. Now I don’t know if I’ll ever need it.” He sounds almost disappointed.'),
    seq5: L('„Du riechst nach Gruben.“ Pelham schnuppert. „Und nach etwas, das zurückgeblieben ist. Gut so. Wer nichts mitbringt, liegt bald bei mir.“',
      '“You smell of the pits.” Pelham sniffs. “And of something that stayed behind. Good. Anyone who brings nothing back ends up with me soon enough.”'),
    fahndung: L('„Die Aufsicht war hier. Wollte wissen, ob ich deinen Namen schon im Stein hab.“ Pelham grinst schief. „Hab gesagt, ich warte noch auf die Schreibweise.“',
      '“Supervision came by. Wanted to know if I had your name in stone yet.” Pelham grins crookedly. “Told them I’m still waiting on the spelling.”'),
    gott: L('Pelham fährt mit dem Daumen über eine Kerbe. „Hast also vom Alten gehört. Seine Steine sind älter als meine. Und keiner davon hat einen Namen.“',
      'Pelham runs his thumb along a notch. “So you’ve heard about the Old One. His stones are older than mine. And none of them have names.”'),
    freundlich: L('Pelham klopft auf einen fertigen Stein neben sich. „Setz dich. Der Kunde braucht ihn noch nicht.“', 'Pelham pats a finished stone beside him. “Sit. The customer doesn’t need it yet.”'),
    feindselig: [L('Pelham meißelt lauter. „Red ruhig. Ich hör zwischen den Schlägen.“', 'Pelham chisels louder. “Talk if you like. I listen between the blows.”')],
    alltag: [
      L('Pelham bläst Staub aus einer Kerbe. „Ein Buchstabe pro Stunde. Kurze Namen sind ein Segen.“', 'Pelham blows dust out of a notch. “One letter an hour. Short names are a blessing.”'),
      L('„Heute ist keiner gestorben.“ Pelham klingt ehrlich überrascht. „Wird schon.“', '“Nobody died today.” Pelham sounds honestly surprised. “Give it time.”'),
      L('Pelham sitzt auf einem fertigen Stein und isst Brot. „Der Kunde braucht ihn noch nicht. Bequem ist er trotzdem.“', 'Pelham sits on a finished stone, eating bread. “The customer doesn’t need it yet. Comfortable all the same.”'),
    ],
    themen: [
      { label: L('Warum stehen hier so viele Steine ohne Namen?', 'Why are there so many stones without names here?'),
        text: L('„Weil die Leute ihren Namen hier unten verlieren, bevor sie sterben.“ Pelham zuckt mit den Schultern. „Ich lass die Fläche frei. Wenn sich einer erinnert, kommt er vorbei und sagt’s mir. Manche kommen erst hinterher.“',
          '“Because people down here lose their names before they die.” Pelham shrugs. “I leave the face blank. If someone remembers, they come by and tell me. Some only come afterwards.”') },
      { label: L('Hast du Steine für die Leute aus dem Bruch gemacht?', 'Did you make stones for the people from the quarry?'), gott: true,
        text: L('„Für die, die man gefunden hat.“ Pelham wischt den Meißel ab. „Die anderen haben ihre Steine unten im Fels. Mit einem Auge drauf, das nach innen guckt. Das hab nicht ich gemeißelt. Seit Starling hier war, sind die Kerben frisch.“',
          '“For the ones they found.” Pelham wipes the chisel. “The others have their stones down in the rock. With an eye on them that looks inwards. I didn’t carve that. Since Starling came through, the cuts are fresh.”') },
    ],
    weiter: L('Noch was, Pelham.', 'One more thing, Pelham.'),
    abschied: L('Lass dich nicht stören.', 'Don’t let me interrupt.'),
    begleitung: L('„Wir kommen zu zweit, Pelham. Mach dir keine Mühe mit den Steinen.“', '“We came as two, Pelham. Don’t bother with the stones.”'),
    zeugnis: {
      k3n_grabstein_ohne_namen: L('Pelham Bestellung und Durchschlag nebeneinanderlegen.', 'Lay the order and the carbon copy side by side for Pelham.'),
    },
  },

  k3a_adaine: {
    npc: 'k3_adaine',
    erstes: L('Eine Frau mit Theodolit und kalkweißen Knien peilt über dich hinweg. „Stehen bleiben. Nicht bewegen. … Danke. Quarrell, Vermessung. Sie standen in meiner Sichtlinie. Das war ein Kompliment an Ihre Größe.“',
      'A woman with a theodolite and lime-white knees sights past you. “Stay there. Don’t move. … Thank you. Quarrell, surveying. You were in my line of sight. That was a compliment to your height.”'),
    erneut: [
      L('„Weiter, ich halte den Festpunkt.“', '“Go on, I’m holding the fixed point.”'),
      L('Adaine kritzelt eine Zahl. „Ja?“', 'Adaine scribbles a figure. “Yes?”'),
    ],
    seq4: L('Adaine nimmt das Auge vom Okular. „Mit Ihnen im Bild weicht die Nadel ab. Um genau so viel wie bei den Zeichen unten im Bruch.“ Sie notiert es. „Wissenschaftlich interessant. Persönlich beunruhigend.“',
      'Adaine takes her eye from the eyepiece. “With you in the frame the needle drifts. By exactly as much as near the signs down in the quarry.” She notes it down. “Scientifically interesting. Personally unsettling.”'),
    seq5: L('„Sie werfen einen Schatten, der nicht ganz zur Sonne passt“, sagt Adaine nebenbei. „Ich messe nur. Ich urteile nicht.“',
      '“You cast a shadow that doesn’t quite match the sun,” Adaine says in passing. “I only measure. I don’t judge.”'),
    gott: L('„Sie fragen nach dem Alten. Gut.“ Adaine rollt einen Plan aus. „Dann sind wir schon zwei, die wissen wollen, warum diese Stadt zur Mitte hin sinkt.“',
      '“You’re asking about the Old One. Good.” Adaine unrolls a plan. “Then there are two of us who want to know why this town is sinking towards the middle.”'),
    freundlich: L('Adaine reicht dir das Ende eines Maßbands. „Halten Sie. Sie sind die einzige Person hier, die nicht zittert.“', 'Adaine hands you the end of a measuring tape. “Hold this. You’re the only person here who doesn’t shake.”'),
    feindselig: [L('Adaine peilt demonstrativ an dir vorbei. „Sie stehen im Weg. Wie immer.“', 'Adaine pointedly sights past you. “You’re in the way. As usual.”')],
    alltag: [
      L('Adaine radiert ein Loch in den Plan, flucht leise und klebt einen Zettel darüber. „Der Nullpunkt ist wieder gewandert. Dunscar hält nicht still.“', 'Adaine rubs a hole in the plan, swears quietly and pastes a slip over it. “The zero point has wandered again. Dunscar won’t keep still.”'),
      L('„Die Stadt liegt seit gestern einen Fingerbreit tiefer.“ Adaine sagt es so, wie andere das Wetter melden.', '“The town has dropped a finger’s width since yesterday.” Adaine says it the way others report the weather.'),
      L('Adaine zählt Schritte zwischen zwei Kreidekreuzen und kommt zweimal auf eine andere Zahl. „Interessant“, sagt sie, und sie meint es nicht gut.', 'Adaine paces between two chalk crosses and gets a different count twice. “Interesting,” she says, and she doesn’t mean it kindly.'),
    ],
    themen: [
      { label: L('Was messen Sie hier eigentlich?', 'What exactly are you measuring here?'),
        text: L('„Wie weit Dunscar sinkt. Und wohin.“ Adaine tippt auf eine Linie, die nach unten weist. „Nicht gleichmäßig. Es zieht zur Mitte, als würde unter der Stadt etwas einatmen. Ich hätte lieber einen Fehler in meinen Instrumenten gefunden.“',
          '“How far Dunscar is sinking. And where to.” Adaine taps a line pointing downwards. “Not evenly. It pulls towards the middle, as if something beneath the town were breathing in. I would rather have found a fault in my instruments.”') },
      { label: L('Haben Sie die Zeichen unten im Bruch vermessen?', 'Have you surveyed the signs down in the quarry?'), gott: true,
        text: L('„Ein Auge, nach innen gerichtet. Ja.“ Adaine wird leiser. „Jedes Mal, wenn ich es vermesse, ist es größer. Nicht nachgemeißelt. Gewachsen. Seit Starling hier war, wächst es schneller. Wenn Sie ihm etwas antun wollen, beeilen Sie sich.“',
          '“An eye, turned inwards. Yes.” Adaine grows quieter. “Every time I survey it, it’s larger. Not re-carved. Grown. Since Starling was here it grows faster. If you mean to do something to him, hurry.”') },
    ],
    weiter: L('Noch eine Messung.', 'One more measurement.'),
    abschied: L('Ich gehe Ihnen aus der Sichtlinie.', 'I’ll get out of your line of sight.'),
    begleitung: L('„Zu zweit messen wir doppelt so schnell.“', '“With two of us we’ll measure twice as fast.”'),
    zeugnis: {
      k3n_vermessung: L('Adaine beide Messmarken zum Abgleich geben.', 'Give Adaine both survey marks to cross-check.'),
    },
  },

  k3a_oren: {
    npc: 'k3_oren',
    erstes: L('Ein Mann in ölschwarzer Jacke liegt halb unter einer kalten Lok und schiebt nur den Kopf hervor. „Fallowby. Oren. Fass nichts an, was warm ist. Hier ist nichts warm. Fass trotzdem nichts an.“',
      'A man in an oil-black jacket lies half under a cold locomotive and pokes only his head out. “Fallowby. Oren. Don’t touch anything warm. Nothing here is warm. Don’t touch anything anyway.”'),
    erneut: [
      L('„Ja. Weiter.“ Oren wischt einen Schlüssel ab.', '“Yeah. Go on.” Oren wipes off a spanner.'),
      L('Oren klopft zweimal gegen den Kessel. „Sie hört zu. Ich auch.“', 'Oren knocks twice on the boiler. “She’s listening. So am I.”'),
    ],
    seq4: L('Oren kriecht unter der Lok hervor und bleibt sitzen. „Die Manometer zucken, wenn du reinkommst. Alle. Und die Lok hat seit Jahren keinen Dampf.“ Er sieht dich an. „Bleib von meinem Kessel weg, ja? Nur so.“',
      'Oren crawls out from under the locomotive and stays sitting. “The gauges twitch when you walk in. All of them. And she hasn’t had steam in years.” He looks at you. “Keep away from my boiler, yeah? Just because.”'),
    seq5: L('„Du läufst wie einer, der mehr trägt, als man sieht“, brummt Oren. „Pass auf deine Achsen auf.“', '“You walk like someone carrying more than shows,” Oren grumbles. “Mind your axles.”'),
    gott: L('„Der Alte, hm?“ Oren zieht eine Mutter fest, fester als nötig. „Red nicht so laut darüber im Depot. Der Boden ist hier dünn.“',
      '“The Old One, eh?” Oren tightens a nut, tighter than needed. “Don’t talk so loud about him in the depot. The floor’s thin here.”'),
    freundlich: L('Oren reicht dir wortlos einen Lappen. Bei ihm heißt das: willkommen.', 'Oren hands you a rag without a word. From him, that means: welcome.'),
    feindselig: [L('Oren kommt nicht unter der Lok hervor. „Ich hör dich. Mach’s kurz.“', 'Oren doesn’t come out from under the locomotive. “I can hear you. Make it quick.”')],
    alltag: [
      L('Oren redet leise mit der Lok. „Ruhig, Berta. Ist nur Besuch.“ Dann bemerkt er dich. „Was?“', 'Oren talks quietly to the locomotive. “Easy, Berta. It’s only a visitor.” Then he notices you. “What?”'),
      L('„Drei Bolzen getauscht. Fährt trotzdem nicht. Fährt nie. Ich tausch trotzdem.“', '“Swapped three bolts. Still doesn’t run. Never runs. I swap them anyway.”'),
      L('Oren hält einen Schraubenschlüssel gegen das Licht. „Verbogen. Wie alles hier. Geht trotzdem, wenn man weiß, wie man zieht.“', 'Oren holds a spanner up to the light. “Bent. Like everything here. Works anyway, if you know how to pull.”'),
    ],
    themen: [
      { label: L('Warum reparierst du eine Lok, die nie fährt?', 'Why do you repair a locomotive that never runs?'),
        text: L('Oren schweigt eine Weile. „Weil mein Vater sie gefahren hat. Und weil der Tag kommt, an dem einer hier raus muss.“ Er klopft gegen das Blech. „Dann soll’s nicht an Berta liegen.“',
          'Oren is quiet for a while. “Because my father drove her. And because the day will come when someone has to get out of here.” He knocks on the plating. “Then it won’t be Berta’s fault.”') },
      { label: L('Hörst du manchmal etwas unter dem Depot?', 'Do you ever hear anything beneath the depot?'), gott: true,
        text: L('„Jede Nacht.“ Oren legt den Schlüssel weg. „Ein Takt. Wie eine Pumpe. Langsamer als ein Herz, gleichmäßiger als eine Maschine. Als Starling hier durchkam, hat er einmal ausgesetzt. Einen Schlag lang. Dann ging er schneller weiter.“',
          '“Every night.” Oren puts the spanner down. “A beat. Like a pump. Slower than a heart, steadier than a machine. When Starling came through, it skipped once. One beat. Then it carried on faster.”') },
    ],
    weiter: L('Noch was, Oren.', 'One more thing, Oren.'),
    abschied: L('Ich lass dich arbeiten.', 'I’ll let you work.'),
    begleitung: L('„Wir sind zu zweit, Oren.“', '“There are two of us, Oren.”'),
    zeugnis: {
      k3n_drehscheibe: L('Oren die beiden Befunde zur Drehscheibe zeigen.', 'Show Oren both findings on the turntable.'),
    },
  },

  k3a_willa: {
    npc: 'k3_willa',
    erstes: L('Eine schmale Frau mit Hörtrichter hebt einen Finger, bevor du etwas sagst, und lauscht deinen Schritten nach. „Trentfold. Klangprüfung. Sie treten links schwerer auf. Bitte sprechen Sie jetzt, aber in Zimmerlautstärke.“',
      'A slight woman with an ear trumpet raises a finger before you can speak and listens to your footsteps fade. “Trentfold. Sound testing. You step harder on the left. Please speak now, but at indoor volume.”'),
    erneut: [
      L('Willa neigt den Kopf. „Ich höre.“', 'Willa tilts her head. “I’m listening.”'),
      L('„Ja?“ Willas Stimme ist kaum lauter als ein Atemzug.', '“Yes?” Willa’s voice is barely louder than a breath.'),
    ],
    seq4: L('Willa zuckt zusammen, als du sprichst. „Ihre Stimme hat einen zweiten Ton bekommen, tief darunter. Wie eine Glocke, die keiner angeschlagen hat. Bitte flüstern Sie. Mir zuliebe.“',
      'Willa flinches when you speak. “Your voice has gained a second tone, deep underneath. Like a bell nobody struck. Please whisper. For my sake.”'),
    seq5: L('„Sie klingen heute dichter“, sagt Willa. „Mehr Obertöne. Ich mag es nicht, aber es ist sauber.“', '“You sound denser today,” says Willa. “More overtones. I don’t like it, but it’s clean.”'),
    gott: L('„Sie haben von ihm gehört.“ Willa legt die Hand flach auf den Tisch, als fühle sie etwas darin. „Dann hören Sie ihn bald auch. Erst im Schlaf, dann im Wachen.“',
      '“You’ve heard of him.” Willa lays her hand flat on the table, as if feeling something in it. “Then you’ll hear him soon too. First in sleep, then awake.”'),
    freundlich: L('Willa nimmt den Trichter vom Ohr. „Sie darf ich ohne hören. Das ist selten.“', 'Willa takes the trumpet from her ear. “You I can hear without it. That’s rare.”'),
    feindselig: [L('Willa dreht den Trichter von dir weg. „Ich prüfe gerade etwas Angenehmeres.“', 'Willa turns the trumpet away from you. “I’m testing something more pleasant at the moment.”')],
    alltag: [
      L('Willa spannt eine Walze ein und hört eine leere Aufnahme ab, Minute um Minute. „Stille hat Muster“, sagt sie, ohne aufzusehen.', 'Willa mounts a cylinder and listens to an empty recording, minute after minute. “Silence has patterns,” she says without looking up.'),
      L('„Die Glocke am Hang ist um einen Viertelton gesunken.“ Willa notiert es. „Niemand hat sie berührt.“', '“The bell on the slope has dropped a quarter tone.” Willa notes it down. “Nobody touched it.”'),
      L('Willa summt einen Ton, bricht ab und schreibt ihn auf. „Den hat gestern Nacht jemand gesungen. Unter der Erde.“', 'Willa hums a note, breaks off and writes it down. “Someone sang that last night. Underground.”'),
    ],
    themen: [
      { label: L('Was prüfen Sie hier?', 'What do you test here?'),
        text: L('„Früher, ob eine Pfeife laut genug ist, um einen Mann im Bruch zu erreichen.“ Willa legt den Trichter ab. „Heute, ob das, was antwortet, noch ein Mann ist. Die Rufschlucht antwortet mit den Stimmen von Leuten, die ich kannte. Ich prüfe, ob sie stimmen. Bisher stimmen sie immer.“',
          '“Once, whether a whistle was loud enough to reach a man in the quarry.” Willa sets the trumpet down. “Now, whether what answers is still a man. The Call Gorge answers with the voices of people I knew. I test whether they’re true. So far they always are.”') },
      { label: L('Haben Sie den Alten je gehört?', 'Have you ever heard the Old One?'), gott: true,
        text: L('Willa legt eine Walze auf, ohne sie abzuspielen. „Einmal. Ein Ton so tief, dass die Gläser im Prüfhaus mitliefen. Er hatte keinen Anfang. Am Ende war ein Name darin, ganz leise, und der Name war Starling. Nicht gerufen. Quittiert.“',
          'Willa puts a cylinder on without playing it. “Once. A tone so deep the glasses in the test house walked along the shelf. It had no beginning. At the end there was a name in it, very quietly, and the name was Starling. Not called. Receipted.”') },
    ],
    weiter: L('Noch eine Frage, leise.', 'One more question, quietly.'),
    abschied: L('Ich gehe leise.', 'I’ll go quietly.'),
    begleitung: L('„Wir sind zu zweit. Wir sprechen nacheinander.“', '“There are two of us. We’ll speak one at a time.”'),
    zeugnis: {},
  },

  k3a_mabel: {
    npc: 'k3_mabel',
    erstes: L('Eine kräftige Frau mit hochgekrempelten Ärmeln stellt dir eine Tasse hin, bevor du sitzt. „Caskett. Mabel. Hier wird erst getrunken, dann geredet. Wer zuerst redet, kriegt kalten Tee.“',
      'A sturdy woman with rolled-up sleeves sets a cup in front of you before you sit down. “Caskett. Mabel. Here you drink first, then talk. Talk first and you get cold tea.”'),
    erneut: [
      L('Mabel füllt nach. „Und?“', 'Mabel tops you up. “And?”'),
      L('„Raus damit, Schätzchen, der Tee wartet nicht.“', '“Out with it, love, the tea won’t wait.”'),
    ],
    seq4: L('Mabel stellt die Tasse ab, zögert und stellt eine zweite daneben. „Für das, was du jetzt mit dir herumträgst. Ich weiß nicht, ob es trinkt. Schaden kann’s nicht.“',
      'Mabel sets the cup down, hesitates, and puts a second one beside it. “For whatever you’re carrying around now. I don’t know if it drinks. Can’t hurt.”'),
    seq5: L('Mabel mustert dich von oben bis unten. „Du isst nicht genug für das, was du da tust. Setz dich. Keine Widerrede.“', 'Mabel looks you up and down. “You don’t eat enough for what you’re doing. Sit. No arguments.”'),
    fahndung: L('„Die Aufseher waren hier und haben nach dir gefragt.“ Mabel wischt deinen Platz doppelt so gründlich. „Ich hab gesagt, hier trinkt man Tee und fragt nicht. Bezahlt haben sie trotzdem.“',
      '“The overseers were here asking after you.” Mabel wipes your spot twice as thoroughly. “I told them here you drink tea and don’t ask. They paid anyway.”'),
    gott: L('Mabel stellt ein Stück Brot ans Fenster, ohne es zu erklären. „Sei still. Das macht man so, seit man von ihm redet.“', 'Mabel puts a piece of bread on the windowsill without explaining. “Hush. That’s what you do, ever since people started talking about him.”'),
    freundlich: L('Deine Tasse steht schon da, mit Untertasse. Die gibt Mabel nicht jedem. „Na, da bist du ja.“', 'Your cup is already waiting, with a saucer. Mabel doesn’t give those to everyone. “Well, there you are.”'),
    feindselig: [L('Mabel stellt die Tasse ein Stück zu hart ab. „Trink. Reden kannst du, wenn du’s verdient hast.“', 'Mabel sets the cup down a touch too hard. “Drink. You can talk when you’ve earned it.”')],
    alltag: [
      L('Mabel scheucht einen Gast vom Stuhl. „Der ist besetzt. Von dem, der noch kommt.“ Dann zu dir: „Nicht du. Setz dich woandershin.“', 'Mabel shoos a guest off a chair. “That one’s taken. By whoever’s still coming.” Then to you: “Not you. Sit somewhere else.”'),
      L('„Heute gibt’s Kalksuppe. Schmeckt wie gestern, nur wärmer.“', '“Lime soup today. Tastes like yesterday, only warmer.”'),
      L('Mabel zählt die Tassen am Haken. Eine hängt immer verkehrt herum. „Lass die. Die gehört jemandem.“', 'Mabel counts the cups on their hooks. One always hangs upside down. “Leave that one. It belongs to someone.”'),
    ],
    themen: [
      { label: L('Wer kommt hier eigentlich alles her?', 'Who actually comes in here?'),
        text: L('„Alle, die Schicht hatten, und alle, die keine mehr haben.“ Mabel lacht kurz. „Die Lebenden sitzen vorne. Die anderen hinten am Fenster, und die bestellen nichts. Ich decke trotzdem. Man weiß nie, wer zahlt.“',
          '“Everyone who had a shift, and everyone who doesn’t any more.” Mabel laughs briefly. “The living sit at the front. The others at the back by the window, and they never order. I lay a place anyway. You never know who’ll pay.”') },
      { label: L('Weißt du etwas über den Alten unter dem Fels?', 'Do you know anything about the Old One Under the Rock?'), gott: true,
        text: L('Mabel hört auf zu wischen. „Meine Großmutter hat ihm jeden Winter einen Laib Brot in den Bruch gebracht, damit er die Stadt nicht holt. Ich hab damit aufgehört, als ich die Stube übernahm.“ Sie sieht zum Fenster. „Starling hat ihm etwas Besseres gebracht als Brot. Seitdem ist es hier kälter.“',
          'Mabel stops wiping. “Every winter my grandmother took a loaf of bread down to the quarry for him, so he wouldn’t take the town. I stopped when I took over the tea room.” She looks at the window. “Starling brought him something better than bread. It’s been colder here ever since.”') },
    ],
    weiter: L('Noch was, Mabel.', 'One more thing, Mabel.'),
    abschied: L('Danke, Mabel.', 'Thanks, Mabel.'),
    begleitung: L('„Wir sind zu zweit, Mabel. Zwei Tassen.“', '“There are two of us, Mabel. Two cups.”'),
    zeugnis: {
      k3n_schichtmarke: L('Mabel die beiden Marken nebeneinander zeigen.', 'Show Mabel the two tokens side by side.'),
      k3n_tischgedeck: L('Mit Mabel klären, wer am leeren Platz gegessen hat.', 'Work out with Mabel who ate at the empty place.'),
    },
  },

  k3a_gallowmere: {
    npc: 'k3_gallowmere',
    erstes: L('Ein Mann in tadelloser Uniform steht an der Bahnsteigkante, als warte er auf einen Zug, der seit siebzig Jahren ausfällt. Seine Stimme kommt einen Herzschlag zu spät. „Gallowmere, Fahrmeister. Bitte zurücktreten. Ihr Name steht noch nicht auf meiner Liste.“',
      'A man in an immaculate uniform stands at the platform edge, as if waiting for a train cancelled seventy years ago. His voice arrives a heartbeat late. “Gallowmere, Trainmaster. Please stand back. Your name is not yet on my list.”'),
    erneut: [
      L('„Bitte fahren Sie fort“, hallt es, einen Takt verzögert.', '“Please continue,” it echoes, one beat delayed.'),
      L('Gallowmere blättert in einer Liste, deren Seiten nicht rascheln.', 'Gallowmere leafs through a list whose pages make no sound.'),
    ],
    seq4: L('Gallowmere tritt einen Schritt zurück, zum ersten Mal. „Abweichung vom Fahrplan“, sagt er tonlos. „Ein Halbgott war nicht angekündigt. Wir bitten um Ihr Verständnis.“',
      'Gallowmere steps back, for the first time. “Deviation from the timetable,” he says flatly. “A demigod was not announced. We apologise for any inconvenience.”'),
    seq5: L('„Ihr Name steht jetzt auf der Liste“, sagt Gallowmere. „In Bleistift. Die Bahn dankt für Ihre Geduld.“', '“Your name is on the list now,” says Gallowmere. “In pencil. The railway thanks you for your patience.”'),
    gott: L('„Sie haben nach dem Abnehmer gefragt.“ Gallowmeres Echo bleibt länger in der Luft als sonst. „Fragen werden weitergeleitet. Antworten nicht.“',
      '“You have been asking after the recipient.” Gallowmere’s echo hangs in the air longer than usual. “Questions are forwarded. Answers are not.”'),
    feindselig: [L('„Störung im Betriebsablauf“, sagt Gallowmere, ohne dich anzusehen.', '“Disruption to service,” says Gallowmere, without looking at you.')],
    alltag: [
      L('„Achtung an Gleis eins“, sagt Gallowmere zu niemandem. Kein Zug kommt. Er nickt zufrieden.', '“Attention, platform one,” Gallowmere says to no one. No train comes. He nods, satisfied.'),
      L('Gallowmere zieht eine Taschenuhr ohne Zeiger und vergleicht sie mit dem Himmel. „Pünktlich.“', 'Gallowmere draws a pocket watch with no hands and compares it to the sky. “On time.”'),
      L('Der Fahrmeister zählt die leeren Gleise ab. Bei jeder Zahl hallt der Bahnsteig nach, als zählten viele mit.', 'The Trainmaster counts the empty tracks. With every number the platform echoes, as if many were counting along.'),
    ],
    themen: [
      { label: L('Worauf warten Sie hier?', 'What are you waiting for here?'),
        text: L('„Auf die letzte Schicht.“ Gallowmere sieht auf die Gleise. „Sie wurde nie abgemeldet. Solange einer fehlt, ist die Liste offen. Solange die Liste offen ist, bin ich im Dienst.“ Er lächelt nicht. „Es ist eine sehr lange Schicht.“',
          '“For the last shift.” Gallowmere looks at the tracks. “It was never signed off. As long as one is missing, the list stays open. As long as the list is open, I am on duty.” He does not smile. “It is a very long shift.”') },
      { label: L('Für wen haben Sie die Liste wirklich geführt?', 'Who did you really keep the list for?'), gott: true,
        text: L('Gallowmeres Hand bleibt über der Liste stehen. „Für den Abnehmer. Jede Schicht, jeder Name, abgezeichnet und nach unten durchgereicht.“ Sein Echo klingt einen Augenblick wie eine andere, viel ältere Stimme. „Starling hat meinen Posten gekauft. Ich bin nur noch die Ansage.“',
          'Gallowmere’s hand stops above the list. “For the recipient. Every shift, every name, signed off and passed down.” For a moment his echo sounds like another, far older voice. “Starling bought my post. I am only the announcement now.”') },
    ],
    weiter: L('Noch eine Frage, Fahrmeister.', 'One more question, Trainmaster.'),
    abschied: L('Ich trete von der Kante zurück.', 'I’ll step back from the edge.'),
    begleitung: L('„Zwei Fahrgäste, Fahrmeister.“', '“Two passengers, Trainmaster.”'),
    zeugnis: {},
  },
};

function varianten(f, flag) {
  const v = [{ erneut: true, zufall: f.erneut }];
  if (f.erstes) v.push({ hide_if_flags: [flag], text: f.erstes });
  if (f.feindselig) v.push({ requires_mood: { [f.npc]: 'feindselig' }, zufall: f.feindselig });
  if (f.seq4) v.push({ requires_seq: 4, text: f.seq4, chance: 0.7 });
  if (f.fahndung) v.push({ requires_wanted: 2, text: f.fahndung, chance: 0.6 });
  if (f.seq5) v.push({ requires_seq: 5, text: f.seq5, chance: 0.4 });
  if (f.reich) v.push({ requires_money: 10000, text: f.reich, chance: 0.3 });
  if (f.gott) v.push({ requires_flags: ['k3r_gott_gehoert'], text: f.gott, chance: 0.25 });
  if (f.freundlich) v.push({ requires_mood: { [f.npc]: 'freundlich' }, text: f.freundlich, chance: 0.4 });
  v.push({ zufall: f.alltag });
  return v;
}

const startKey = (d) => (typeof d.start === 'string' && d.nodes[d.start] ? d.start : 'start');

function applyHauptfiguren(content) {
  for (const [did, f] of Object.entries(FIGUREN)) {
    const d = content.dialogues[did];
    const key = d && startKey(d);
    const node = d?.nodes?.[key];
    if (!node) continue;
    const flag = `dsv_${f.npc}`;
    node.text = f.alltag[0];
    node.texte = varianten(f, flag);
    node.sets_flags = [...new Set([...(node.sets_flags ?? []), flag])];
    for (const c of node.choices ?? []) {
      if (typeof c.next !== 'string') continue;
      const q = c.next.match(/^(k3n_.+)_zeugnis$/)?.[1];
      if (q && f.zeugnis?.[q]) c.text = f.zeugnis[q];
      else if (c.next.startsWith('koop_ds_reaktion_') && f.begleitung) c.text = f.begleitung;
    }
    const last = node.choices?.at(-1);
    if (last && !last.next) last.text = f.abschied;
    // Eigene Themen vor dem Abschied
    f.themen.forEach((t, i) => {
      const id = `dsv_thema_${i + 1}`;
      d.nodes[id] = {
        text: t.text,
        ...(t.gott ? { sets_flags: ['k3r_gott_gehoert'] } : {}),
        choices: [{ text: f.weiter, next: key }, { text: f.abschied }],
      };
      node.choices.splice(Math.max(0, node.choices.length - 1), 0, { text: t.label, next: id });
    });
  }
}

// --- Ortskundige (dunscarOrtskundige.js) -------------------------------------------------------------------

const ORTSKUNDIGE = {
  ds_ok_endbahnhof: {
    npc: 'ds_ok_endbahnhof',
    fragen: {
      viertel: L('Was steht hier am Bahnhof alles?', 'What is there here at the station?'),
      wege: L('Wohin geht’s vom Bahnhof aus?', 'Where can I get to from the station?'),
      gefahr: L('Wovor sollte ich mich hier hüten?', 'What should I watch out for here?'),
      gerede: L('Was hört man so auf dem Bahnsteig?', 'What do people say on the platform?'),
      gott: L('Starling. Ist der hier angekommen?', 'Starling. Did he arrive here?'),
    },
    weiter: L('Und noch was.', 'And another thing.'),
    abschied: L('Danke, Lotte.', 'Thanks, Lotte.'),
    erneut: [L('Lotte rückt die Mütze zurecht. „Frag nur.“', 'Lotte straightens her cap. “Just ask.”'), L('„Ich hab Zeit. Hier fährt ja nichts.“', '“I’ve got time. Nothing leaves here anyway.”')],
    seq4: L('Lotte nimmt die Mütze ab, als ginge ein hoher Herr vorbei. Dann merkt sie, dass du es bist. „Entschuldigung. Gewohnheit. Du trägst dich jetzt anders.“',
      'Lotte takes her cap off as if a gentleman were passing. Then she realises it’s you. “Sorry. Habit. You carry yourself differently now.”'),
    alltag: [
      L('Lotte schiebt den leeren Gepäckkarren ein Stück vor und wieder zurück. „Damit die Räder nicht vergessen, wie es geht.“', 'Lotte pushes the empty luggage cart forward a little and back again. “So the wheels don’t forget how.”'),
      L('„Na, wieder da?“ Lotte tippt an ihre Messingmarke. „Gepäck hast du ja keins. Fragen schon.“', '“Back again?” Lotte taps her brass badge. “No luggage, I see. Questions, though.”'),
    ],
  },
  ds_ok_schwellenring: {
    npc: 'ds_ok_schwellenring',
    fragen: {
      viertel: L('Was gibt es am Schwellenring?', 'What is there at the Sleeper Ring?'),
      wege: L('Welche Weiche führt wohin?', 'Which switch leads where?'),
      gefahr: L('Wo wird es gefährlich?', 'Where does it get dangerous?'),
      gerede: L('Gibt’s was Neues an den Weichen?', 'Anything new at the switches?'),
      gott: L('Was weißt du über Starling und den Alten?', 'What do you know about Starling and the Old One?'),
      wechsel: L('Kann man auf ein anderes Gleis wechseln? Auf einen anderen Pfad?', 'Can you switch to another track? To another pathway?'),
    },
    weiter: L('Noch eine Weiche.', 'One more switch.'),
    abschied: L('Gute Schicht, Riegel.', 'Good shift, Riegel.'),
    erneut: [L('Riegel ölt den Hebel nach. „Weiter.“', 'Riegel oils the lever again. “Go on.”'), L('„Ich stell noch eine. Du fragst inzwischen.“', '“I’ll set one more. You ask meanwhile.”')],
    seq4: L('Riegel lässt den Hebel los. „Bei dir stellen sich die Weichen von allein. Hab’s gerade gesehen. Ich weiß nicht, ob mir das gefällt.“',
      'Riegel lets go of the lever. “The switches set themselves for you. I just saw it. Not sure I like that.”'),
    alltag: [
      L('Riegel klopft auf die Weiche. „Steht. Noch.“ Dann nickt er dir zu.', 'Riegel taps the switch. “Holding. For now.” Then he nods to you.'),
      L('„Du schon wieder.“ Riegel klingt nicht unfreundlich. „Bist das einzige, was hier regelmäßig fährt.“', '“You again.” Riegel doesn’t sound unfriendly. “You’re the only thing that runs regularly round here.”'),
    ],
  },
  ds_ok_arbeiterbogen: {
    npc: 'ds_ok_arbeiterbogen',
    fragen: {
      viertel: L('Wer wohnt hier im Arbeiterbogen?', 'Who lives here in the Workers’ Arch?'),
      wege: L('Wo komme ich von hier aus hin?', 'Where can I get to from here?'),
      gefahr: L('Ist es hier sicher?', 'Is it safe here?'),
      gerede: L('Was wird an der Wäscheleine erzählt?', 'What gets said at the washing line?'),
      gott: L('Hast du von Starling gehört?', 'Have you heard of Starling?'),
    },
    weiter: L('Noch eine Frage.', 'One more question.'),
    abschied: L('Ich lass dich waschen.', 'I’ll let you get on with the washing.'),
    erneut: [L('Grete wringt ein Hemd aus. „Ja?“', 'Grete wrings out a shirt. “Yes?”'), L('„Frag, solange die Hände nass sind. Trocken werd ich ungeduldig.“', '“Ask while my hands are wet. Dry, I get impatient.”')],
    seq4: L('Grete hält ein Hemd vor sich wie einen Schild. „Du wirfst Schatten, wo keine Sonne ist. Sag, was du brauchst, und dann geh bitte weiter.“',
      'Grete holds a shirt in front of her like a shield. “You cast shadows where there’s no sun. Say what you need, then please move on.”'),
    alltag: [
      L('Grete schüttelt ein Laken aus, und Kalkstaub fliegt wie Mehl. „Siehst du? Zweimal am Tag.“', 'Grete shakes out a sheet, and lime dust flies like flour. “See? Twice a day.”'),
      L('„Du hast Staub am Kragen.“ Grete schnalzt. „Gib her, ich mach das schnell.“', '“You’ve got dust on your collar.” Grete clicks her tongue. “Give it here, I’ll be quick.”'),
    ],
  },
  ds_ok_kalkmarkt: {
    npc: 'ds_ok_kalkmarkt',
    fragen: {
      viertel: L('Was kann man hier kaufen?', 'What can you buy here?'),
      wege: L('Wohin führen die Wege vom Markt?', 'Where do the roads from the market lead?'),
      gefahr: L('Worauf muss ein Käufer achten?', 'What should a buyer watch out for?'),
      gerede: L('Was ruft man sich auf dem Markt zu?', 'What are people calling out at the market?'),
      gott: L('Wird hier mit Starlings Sachen gehandelt?', 'Does anyone trade in Starling’s things here?'),
    },
    weiter: L('Noch was, Paula.', 'Something else, Paula.'),
    abschied: L('Ruf weiter, Paula.', 'Keep calling, Paula.'),
    erneut: [L('„Weiter im Text!“ Paula klopft auf ihre Tafel.', '“Carry on!” Paula raps her slate.'), L('Paula wischt einen Preis weg und schreibt einen höheren hin. „Frag schnell, es wird teurer.“', 'Paula wipes away a price and writes a higher one. “Ask quickly, it’s getting dearer.”')],
    seq4: L('Paula verstummt mitten im Ausruf. Der halbe Markt sieht zu dir. „Na“, sagt sie dann, lauter als nötig, „wer so auftritt, zahlt hoffentlich auch so.“',
      'Paula falls silent mid-call. Half the market looks your way. “Well,” she says, louder than needed, “someone who walks like that had better pay like that.”'),
    alltag: [
      L('„Kalk! Kohle! Kerzen! Keiner kauft!“ Paula grinst. „Außer dir vielleicht.“', '“Lime! Coal! Candles! Nobody’s buying!” Paula grins. “Except you, maybe.”'),
      L('Paula schreibt einen Preis an, liest ihn, wischt ihn weg. „Zu ehrlich. Was suchst du?“', 'Paula chalks up a price, reads it, wipes it off. “Too honest. What are you after?”'),
    ],
  },
  ds_ok_bruchstufen: {
    npc: 'ds_ok_bruchstufen',
    fragen: {
      viertel: L('Was ist an den Bruchstufen los?', 'What goes on at the Quarry Steps?'),
      wege: L('Wohin führen die Stufen?', 'Where do the steps lead?'),
      gefahr: L('Wie gefährlich ist der Bruch?', 'How dangerous is the quarry?'),
      gerede: L('Was klopft man sich hier so zu?', 'What do people knock out to each other here?'),
      gott: L('Was ist unten im Fels?', 'What is down in the rock?'),
    },
    weiter: L('Noch eine Frage, Hauer.', 'One more question, Hauer.'),
    abschied: L('Pass auf dich auf da unten.', 'Look after yourself down there.'),
    erneut: [L('Matthis klopft zweimal auf den Balken. „Weiter.“', 'Matthis knocks twice on the beam. “Go on.”'), L('„Hm.“ Matthis wartet, ob der Stein antwortet. Dann sieht er dich an.', '“Hm.” Matthis waits to see if the stone answers. Then he looks at you.')],
    seq4: L('Matthis legt den Hammer weg. „Der Fels ist still geworden, als du kamst. Das macht er sonst nur bei Einsturz.“',
      'Matthis puts his hammer down. “The rock went quiet when you came. It only does that before a collapse.”'),
    alltag: [
      L('Matthis schlägt einmal gegen das Gerüst und lauscht. „Klingt gesund. Heute.“', 'Matthis strikes the scaffold once and listens. “Sounds healthy. Today.”'),
      L('„Du schon wieder.“ Matthis wischt sich Kalk aus dem Bart. „Bist du oft genug hier, klopft der Stein bald deinen Namen.“', '“You again.” Matthis wipes lime from his beard. “Come often enough and the stone will start knocking your name.”'),
    ],
  },
  ds_ok_signalhang: {
    npc: 'ds_ok_signalhang',
    fragen: {
      viertel: L('Was gibt es hier am Hang?', 'What is there here on the slope?'),
      wege: L('Wohin geht es von hier? Leise, versprochen.', 'Where does it go from here? Quietly, I promise.'),
      gefahr: L('Was hörst du aus der Schlucht?', 'What do you hear from the gorge?'),
      gerede: L('Was flüstert man hier?', 'What do people whisper here?'),
      gott: L('Hast du etwas über Starling gehört? Wirklich gehört?', 'Have you heard anything about Starling? Actually heard?'),
    },
    weiter: L('Noch eine Frage. Ganz leise.', 'One more question. Very quietly.'),
    abschied: L('Ich bin schon still.', 'I’m already quiet.'),
    erneut: [L('Fritz hebt das Hörrohr. „Leiser. Aber ja.“', 'Fritz raises the ear trumpet. “Quieter. But yes.”'), L('„Pst. … Gut. Jetzt du.“', '“Shh. … Fine. Now you.”')],
    seq4: L('Fritz lässt das Hörrohr sinken und starrt dich an. „Du brummst. Ganz tief. Wie die Schlucht nachts.“ Er tritt einen Schritt zurück.',
      'Fritz lowers the ear trumpet and stares at you. “You hum. Very deep. Like the gorge at night.” He takes a step back.'),
    alltag: [
      L('Fritz zuckt, als ein Stein den Hang hinunterrollt. Dann atmet er aus. „Nur ein Stein. Diesmal.“', 'Fritz flinches as a stone rolls down the slope. Then he breathes out. “Just a stone. This time.”'),
      L('„Deine Schritte kenn ich jetzt.“ Fritz flüstert es fast stolz. „Links schwerer als rechts.“', '“I know your footsteps now.” Fritz whispers it almost proudly. “Heavier on the left than the right.”'),
    ],
  },
};

function applyOrtskundige(content) {
  for (const [did, o] of Object.entries(ORTSKUNDIGE)) {
    const d = content.dialogues[did];
    const node = d?.nodes?.start;
    if (!node) continue;
    const flag = `dsv_${o.npc}`;
    const gruss = node.text;
    node.texte = [
      { erneut: true, zufall: o.erneut },
      { hide_if_flags: [flag], text: gruss },
      { requires_seq: 4, text: o.seq4, chance: 0.6 },
      { zufall: o.alltag },
    ];
    node.sets_flags = [...new Set([...(node.sets_flags ?? []), flag])];
    for (const c of node.choices ?? []) {
      const thema = c.next === 'gerede2' ? 'gerede' : c.next;
      if (thema && o.fragen[thema]) c.text = o.fragen[thema];
      else if (!c.next) c.text = o.abschied;
    }
    for (const [k, n] of Object.entries(d.nodes)) {
      if (k === 'start') continue;
      for (const c of n.choices ?? []) if (c.next === 'start') c.text = o.weiter;
    }
  }
}

// --- Händler, Gasthaus, Apotheke ----------------------------------------------------------------------------

const KLEINE = {
  ds_waffenhaendlerin: {
    frage: L('Deine Preise sind gesalzen, Hask.', 'Your prices are steep, Hask.'),
    alltag: [
      L('Greta Hask lässt einen Stockdegen aus der Scheide gleiten und wieder zurück. „Hört sich gut an, oder? Wie Geld, das den Besitzer wechselt.“', 'Greta Hask slides a sword cane out of its sheath and back. “Sounds good, doesn’t it? Like money changing hands.”'),
      L('„Wieder du.“ Hask wischt Öl von der Klinge. „Die letzte Waffe hat also gehalten. Oder du brauchst eine neue.“', '“You again.” Hask wipes oil off a blade. “So the last weapon held up. Or you need a new one.”'),
    ],
    seq4: L('Hask legt den Revolver zurück unter die Plane. „Du brauchst meine Ware eigentlich nicht mehr. Kauf trotzdem was. Für die Stimmung.“', 'Hask puts the revolver back under the tarp. “You don’t really need my goods any more. Buy something anyway. For morale.”'),
  },
  ds_kleiderhaendlerin: {
    frage: L('Das kostet ja das Doppelte wie in Kettlegate.', 'That costs twice what it does in Kettlegate.'),
    alltag: [
      L('Wilma Rook hält dir einen Mantel an die Schultern, ohne zu fragen. „Nein. Nicht deine Farbe. Der nächste.“', 'Wilma Rook holds a coat up to your shoulders without asking. “No. Not your colour. Next.”'),
      L('„Du trägst immer noch denselben Kragen.“ Rook seufzt. „Ich nehm’s persönlich.“', '“Still the same collar.” Rook sighs. “I take that personally.”'),
    ],
    seq4: L('Rook mustert dich lange. „Für das, was du jetzt bist, hab ich nichts auf der Stange. Aber ein Anhänger steht jedem.“', 'Rook studies you for a long time. “I’ve nothing on the rail for what you are now. But a pendant suits anyone.”'),
  },
  ds_kraeuterfrau: {
    frage: L('Warum kosten Kräuter hier so viel?', 'Why do herbs cost so much here?'),
    alltag: [
      L('Hester Wynn riecht an einer Wurzel und legt sie in den falschen Korb. Dann in den richtigen. „Alt werden ist auch eine Kunst.“', 'Hester Wynn sniffs a root and puts it in the wrong basket. Then the right one. “Growing old is an art too.”'),
      L('„Du siehst blass aus.“ Wynn schiebt dir einen Zweig hin. „Kauen. Nicht schlucken. Und nicht fragen, was es ist.“', '“You look pale.” Wynn pushes a sprig towards you. “Chew. Don’t swallow. And don’t ask what it is.”'),
    ],
  },
  dsg_wirtin: {
    alltag: [
      L('Marta Prell stellt dir einen Krug hin, bevor du bestellst. „Du siehst aus wie einer, der sitzen muss. Sitz.“', 'Marta Prell sets a jug in front of you before you order. “You look like someone who needs to sit. Sit.”'),
      L('„Wieder im Prellbock.“ Prell nickt zufrieden. „Alles hält hier an. Sogar du.“', '“Back at the Buffer Stop.” Prell nods, satisfied. “Everything stops here. Even you.”'),
    ],
  },
  dsg_heizer: {
    alltag: [
      L('Bodo Ruß bläst in seine Suppe, als schüre er ein Feuer. „Zu kalt. Alles hier ist zu kalt.“', 'Bodo Ruß blows on his soup as if stoking a fire. “Too cold. Everything here is too cold.”'),
      L('Ruß hebt den Löffel zum Gruß. „Setz dich an den Ofen. Da hab ich ihn geheizt. Den einzigen, der noch brennt.“', 'Ruß raises his spoon in greeting. “Sit by the stove. I lit that one. The only one still burning.”'),
    ],
  },
  dsg_naeherin: {
    alltag: [
      L('Lene Faden beißt einen Faden ab. „Dein Saum hält noch. Erstaunlich. Zeig mal, wenn er reißt.“', 'Lene Faden bites off a thread. “Your hem’s still holding. Amazing. Show me when it tears.”'),
      L('„Pst. Ich zähl Stiche.“ Lene zählt bis zum Ende der Naht und lächelt dann. „So. Jetzt du.“', '“Shh. I’m counting stitches.” Lene counts to the end of the seam, then smiles. “There. Your turn.”'),
    ],
  },
  dsa_apothekerin: {
    alltag: [
      L('Edda Kalb wiegt ein Pulver dreimal und notiert drei verschiedene Gewichte. „Dunscar“, sagt sie nur.', 'Edda Kalb weighs a powder three times and writes down three different weights. “Dunscar,” is all she says.'),
      L('„Sie leben noch.“ Kalb klingt beinahe zufrieden. „Dann hat die letzte Flasche gewirkt.“', '“You’re still alive.” Kalb sounds almost satisfied. “Then the last bottle worked.”'),
    ],
  },
  dsa_lehrling: {
    alltag: [
      L('Till Mörser zerstößt etwas Weißes und niest. „Nicht weitersagen. Das war Kalk, kein Heilmittel.“', 'Till Mörser grinds something white and sneezes. “Don’t tell anyone. That was lime, not medicine.”'),
      L('„Ich hab heute schon zwei Flaschen nicht verwechselt!“ Till strahlt. „Rekord.“', '“I’ve already not mixed up two bottles today!” Till beams. “A record.”'),
    ],
  },
};

function applyKleine(content) {
  for (const [did, k] of Object.entries(KLEINE)) {
    const d = content.dialogues[did];
    const node = d?.nodes?.start;
    if (!node) continue;
    const flag = `dsv_${did}`;
    node.texte = [
      { hide_if_flags: [flag], text: node.text },
      ...(k.seq4 ? [{ requires_seq: 4, text: k.seq4, chance: 0.5 }] : []),
      { zufall: [node.text, ...k.alltag] },
    ];
    node.sets_flags = [...new Set([...(node.sets_flags ?? []), flag])];
    if (k.frage) for (const c of node.choices ?? []) if (c.next === 'preis') c.text = k.frage;
  }
}

/** Letzter Schritt in buildContent: Stimmen der Dunscarer Figuren. */
export function applyDunscarStimmen(content) {
  applyHauptfiguren(content);
  applyOrtskundige(content);
  applyKleine(content);
}
