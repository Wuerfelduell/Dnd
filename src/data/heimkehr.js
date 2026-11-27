/**
 * Heimkehr ab Seq 3 (Seb 2026-11-27): „Ab Seq 3 kann man wieder zurückreisen in die alten Viertel, immerhin kann dich ja da nix mehr
 * aufhalten. Da sollten dann aber sichtbare Veränderungen in Kettlegate, Wexmoor und Dunscar sein.“
 *
 * - Reiseziele: Fernzüge zwischen Calderwick, Briarholt, Dunscar, Wexmoor und Kettlegate (`requires_heimkehr`, core/Heimkehr.js).
 *   Im Koop reicht ein Spieler auf Seq 3 oder besser.
 * - Gewöhnliche Gegner der alten Städte fliehen und brechen zusammen, wenn sie dich sehen (Pathways.awes, Roamers).
 * - Nachhall: je Stadt sechs Orte der eigenen Geschichte, je einmal, verdauen ab Seq 3 fest (data/seq3Weg.js NACHHALL_PCT).
 * - Stimmen: die bekannten Leute erkennen dich und fürchten oder verehren den Halbgott (erste Variante ihres Begrüßungstexts).
 * - Kulisse: kleine Schreine mit Opfergaben, Steckbriefe, die niemand mehr aufhängt (Deko mit visible_if).
 * Texte [de, en] über L(), das Wörterbuch HEIMKEHR_EN steht auch in src/i18n/en/heimkehr.json (Test prüft Gleichheit).
 */
import { freieKachel } from './calderwickStory.js';

const EN = {};
/** Deutscher Text, die englische Übersetzung wird mitgeschrieben. */
const L = (de, en) => { EN[de] = en; return de; };
export const HEIMKEHR_EN = EN;

export const HK = { requires_heimkehr: true };
export const HK_QUEST = 'hk_heimkehr';

// --- Reiseziele -------------------------------------------------------------------------------------------------

const ZIELE = {
  kettlegate: { map: 'nordtor', spawn: 'default', name: L('Fernzug nach Kettlegate', 'Long-distance train to Kettlegate'),
    desc: L('Ab Sequenz 3. Zurück an den Anfang. Am Nordtor hängen noch Steckbriefe, aber niemand wagt, sie zu vollstrecken.', 'From Sequence 3. Back to the beginning. Wanted posters still hang at the North Gate, but nobody dares to act on them.') },
  wexmoor: { map: 'wx_bahnhof', spawn: 'zug', name: L('Fernzug nach Wexmoor', 'Long-distance train to Wexmoor'),
    desc: L('Ab Sequenz 3. Über das Moor zurück zur Schleuse. Die Grauspäher haben deine Akte geschlossen.', 'From Sequence 3. Back across the moor to the lock. The Grey Scouts have closed your file.') },
  dunscar: { map: 'ds_endbahnhof', spawn: 'zug', name: L('Fernzug nach Dunscar', 'Long-distance train to Dunscar'),
    desc: L('Ab Sequenz 3. Hinab zum Endbahnhof. Die Kalkstadt weiß, wer damals nach oben gefahren ist.', 'From Sequence 3. Down to the terminus. The lime city knows who rode up back then.') },
  calderwick: { map: 'cw_gleisfuss', spawn: 'default', name: L('Fernzug nach Calderwick', 'Long-distance train to Calderwick'),
    desc: L('Zurück nach oben, an den Gleisfuß.', 'Back up, to the Railfoot.') },
};
/** Aus diesen Städten fahren die Fernzüge. */
const VON = ['kettlegate', 'wexmoor', 'dunscar', 'calderwick']; // Briarholt: Linie nach Calderwick, von dort weiter

// --- Nachhall: sechs Orte je Stadt ------------------------------------------------------------------------------

const prompt = L('Nachhall', 'Echo');
/** [id, Karte, Titel, Text] — der Text erzählt, was dort damals war und was heute davon übrig ist. */
export const NACHHALL = {
  kettlegate: [
    ['kg_revier', 'revier', L('Dein alter Schreibtisch', 'Your old desk'),
      L('Dein Schreibtisch im Revier steht noch da. Jemand hat ihn geräumt und dann doch nicht weggetragen. In der Schublade liegt ein Bleistiftstummel, mit dem du die erste Akte geschrieben hast. Als du ihn berührst, ist das Revier für einen Atemzug wieder laut und jung, und du warst nur ein Mensch mit einer Laterne.',
        'Your desk at the station is still there. Someone cleared it and then never carried it away. In the drawer lies a pencil stub you wrote the first file with. When you touch it, the station is loud and young again for a breath, and you were only a person with a lantern.')],
    ['kg_pfandhaus', 'ashgrove', L('Halloways Kellertür', 'Halloway\'s cellar door'),
      L('Die Kellertür des Pfandhauses in der Ashgrove Lane ist zugenagelt. Hier hat alles angefangen: ein vermisster Mann, ein Keller, eine Stimme im Dunkeln. Heute hörst du die Stimme nicht mehr. Du verstehst jetzt, was sie damals gesagt hat.',
        'The cellar door of the pawnshop in Ashgrove Lane is nailed shut. This is where it all began: a missing man, a cellar, a voice in the dark. Today you no longer hear the voice. You understand now what it said back then.')],
    ['kg_uhrturm', 'uhrturm', L('Die Uhr, die nachgeht', 'The clock that runs slow'),
      L('Die Turmuhr geht seit deiner Abreise genau so viele Minuten nach, wie du Sequenzen gestiegen bist. Die Uhrmacherin schwört, sie habe nichts verstellt. Du legst die Hand an das Werk, und die Zeiger springen auf die richtige Zeit.',
        'Since you left, the tower clock runs slow by exactly as many minutes as the Sequences you have climbed. The clockmaker swears she adjusted nothing. You lay your hand on the works, and the hands jump to the right time.')],
    ['kg_nachtmarkt', 'nachtmarkt', L('Dein erster Trank', 'Your first potion'),
      L('Hinter Nells Stand liegt der Kessel, in dem du deinen ersten Trank gebraut hast, verbeult und kalt. Damals hat dir ein Schluck die Hände zittern lassen. Heute könntest du den ganzen Markt mit einem Gedanken zum Schweigen bringen. Du tust es nicht.',
        'Behind Nell\'s stall lies the kettle you brewed your first potion in, dented and cold. Back then one sip made your hands shake. Today you could silence the whole market with a thought. You don\'t.')],
    ['kg_altmarkt', 'altmarkt', L('Der Steckbrief am Brunnen', 'The poster by the well'),
      L('Am Brunnen klebt dein Steckbrief, ausgeblichen, mit einem Gesicht, das dir nicht mehr ganz ähnlich sieht. Jemand hat darunter mit Kreide geschrieben: „Nicht anfassen. Er kommt zurück.“ Daneben brennen drei Kerzen.',
        'Your wanted poster is pasted on the well, faded, with a face that no longer quite looks like you. Underneath, someone has written in chalk: "Don\'t touch. He comes back." Three candles burn beside it.')],
    ['kg_docks', 'docks', L('Die Stelle am Wasser', 'The spot by the water'),
      L('Hier am Kai hast du zum ersten Mal mit der Geistsicht hingesehen und dich vor dem gefürchtet, was du gesehen hast. Das Wasser ist dasselbe. Die Dinge darin weichen jetzt vor dir zurück, bis die Bucht leer ist wie ein gefegter Boden.',
        'Here on the quay you first looked with spirit sight and feared what you saw. The water is the same. The things in it now shrink back from you until the bay is as empty as a swept floor.')],
  ],
  wexmoor: [
    ['wx_bahnhof', 'wx_bahnhof', L('Die Ankunft', 'The arrival'),
      L('Auf dem Bahnsteig liegt noch der Abdruck deines Koffers im Ruß, als hätte ihn niemand weggekehrt. Damals kamst du als Gesuchter, mit einer Fahrkarte und sonst nichts. Der Telegrafist sieht auf, erkennt dich und vergisst, das Telegramm zu Ende zu tippen.',
        'On the platform the imprint of your suitcase is still in the soot, as if no one had swept it away. Back then you came as a wanted person, with a ticket and nothing else. The telegraphist looks up, recognises you and forgets to finish tapping the telegram.')],
    ['wx_kahn', 'wx_kahn', L('Der Unterschlupf', 'The hideout'),
      L('Im Kahn hängt noch deine Decke über der Pritsche. Zunder hat sie nie abgenommen. Auf dem Tisch liegt ein Zettel in ihrer Schrift: „Falls du zurückkommst: Der Kessel ist noch warm. Falls nicht: auch.“',
        'Your blanket still hangs over the bunk in the barge. Tinder never took it down. A note in her hand lies on the table: "If you come back: the kettle is still warm. If you don\'t: same."')],
    ['wx_salzmarkt', 'wx_salzmarkt', L('Der Stand, an dem man dich verraten hat', 'The stall where you were betrayed'),
      L('An diesem Stand hat dich jemand an die Grauspäher verkauft, für einen Sack Salz. Der Stand ist leer, das Schild abgeschraubt. Die Leute machen einen Bogen darum, als wäre der Boden heiß.',
        'At this stall someone sold you to the Grey Scouts for a sack of salt. The stall is empty, the sign unscrewed. People give it a wide berth, as if the ground were hot.')],
    ['wx_leuchtturm', 'wx_leuchtturm', L('Das erloschene Feuer', 'The extinguished fire'),
      L('Das Leuchtfeuer brennt nicht mehr so, wie es damals gebrannt hat. Es ist ein gewöhnliches Licht geworden, für Schiffe, nicht für Seelen. Auf den Stufen liegen Muscheln, Kerzenstümpfe und ein Zettel: „Danke.“',
        'The beacon no longer burns the way it did back then. It has become an ordinary light, for ships, not for souls. On the steps lie shells, candle stubs and a note: "Thank you."')],
    ['wx_akademie', 'wx_akademie', L('Dein Name im Hörsaal', 'Your name in the lecture hall'),
      L('Auf der Tafel im Hörsaal steht dein Name, halb weggewischt, darunter eine Frage in Wyles Schrift: „Wie viel Mensch bleibt bei Sequenz 3?“ Niemand hat sie beantwortet. Du nimmst die Kreide und lässt sie wieder sinken.',
        'Your name is on the blackboard in the lecture hall, half wiped away, and beneath it a question in Wyle\'s hand: "How much of a person remains at Sequence 3?" No one has answered it. You pick up the chalk and lower it again.')],
    ['wx_lichtamt', 'wx_lichtamt', L('Deine Akte', 'Your file'),
      L('Im Lichtamt steht deine Akte im Regal, dick wie ein Gesangbuch. Auf dem Rücken klebt ein neuer Zettel: „Geschlossen. Nicht vollstreckbar.“ Darunter, kleiner: „Gott steh uns bei.“',
        'Your file stands on the shelf in the Office of Light, thick as a hymnal. A new label is stuck on its spine: "Closed. Not enforceable." Below, smaller: "God help us."')],
  ],
  dunscar: [
    ['ds_endbahnhof', 'ds_endbahnhof', L('Der Bahnsteig nach oben', 'The platform going up'),
      L('Am Endbahnhof steht der Bahnsteig, an dem du Starling in den Zug nach oben folgtest. Die Gleise enden jetzt in einer Mauer aus Kalk. Kinder haben darauf gemalt: einen Zug, eine Figur aus Licht, die nach unten fällt, und dieselbe Figur, die wieder aufsteht.',
        'At the terminus is the platform where you followed Starling onto the train going up. The rails now end in a wall of lime. Children have painted on it: a train, a figure of light falling down, and the same figure getting up again.')],
    ['ds_speisewagen', 'ds_speisewagen', L('Pfiffs Becher', 'Whistle\'s mug'),
      L('Im Speisewagen steht dein Becher noch im Regal, mit einem Kreidestrich für jeden Tag, den du fort warst. Pfiff hat irgendwann aufgehört zu zählen und stattdessen einen Kreis gemalt.',
        'In the dining car your mug still stands on the shelf, with a chalk mark for every day you were gone. At some point Whistle stopped counting and drew a circle instead.')],
    ['ds_runddepot', 'ds_runddepot', L('Die Drehscheibe', 'The turntable'),
      L('Die Drehscheibe im Runddepot dreht sich, wenn du darauf trittst, ganz ohne Dampf, einmal im Kreis, und bleibt mit dem Gleis nach oben stehen. Die Arbeiter nehmen die Mützen ab.',
        'When you step onto it, the turntable in the roundhouse turns, without any steam, once around, and stops with its rail pointing upward. The workers take off their caps.')],
    ['ds_letzter_bahnsteig', 'ds_letzter_bahnsteig', L('Der letzte Bahnsteig', 'The last platform'),
      L('Am letzten Bahnsteig hast du zum ersten Mal vom Alten gehört. Die Stimme, die damals aus den Schienen kam, ist still. Vielleicht hat sie Angst vor dir. Vielleicht wartet sie nur.',
        'On the last platform you first heard of the Old One. The voice that came from the rails back then is silent. Perhaps it is afraid of you. Perhaps it is only waiting.')],
    ['ds_kalkmarkt', 'ds_kalkmarkt', L('Der Kalkmarkt', 'The lime market'),
      L('Auf dem Kalkmarkt verkauft jemand kleine Figuren aus Kalk: eine Gestalt mit deinem Mantel und einem Heiligenschein aus Ruß. „Glücksbringer“, sagt die Händlerin, ohne dich anzusehen. „Gegen Aufseher.“',
        'At the lime market someone is selling little lime figures: a shape in your coat with a halo of soot. "Lucky charms," says the trader without looking at you. "Against overseers."')],
    ['ds_teesaal', 'ds_teesaal', L('Der Tisch am Fenster', 'The table by the window'),
      L('Im Teesaal ist dein Tisch am Fenster immer frei. Mabel stellt jeden Abend eine Tasse darauf, die niemand trinkt. Heute trinkst du sie. Sie ist kalt und schmeckt trotzdem nach Ankommen.',
        'In the tea room your table by the window is always free. Mabel sets a cup on it every evening that nobody drinks. Today you drink it. It is cold and still tastes of arriving.')],
  ],
};

// --- Stimmen: bekannte Leute erkennen dich ---------------------------------------------------------------------------

/** NPC-Id → erster Satz bei der Heimkehr (ersetzt den Begrüßungstext, solange die Gruppe heimkehren darf). */
export const STIMMEN = {
  // Kettlegate
  pimm: L('Miss Pimm lässt den Stempel fallen. „Sie …“ Sie fasst sich. „Die Inspektorin ist nicht mehr hier. Aber Ihr Stuhl. Den hat keiner nehmen wollen.“',
    'Miss Pimm drops her stamp. "You …" She composes herself. "The Inspector isn\'t here any more. But your chair is. Nobody wanted to take it."'),
  halloway: L('Halloway weicht hinter den Tresen zurück, bis das Regal klirrt. „Ich hab den Keller zugenagelt. Ich schwöre, ich hab ihn zugenagelt.“',
    'Halloway backs behind the counter until the shelf rattles. "I nailed the cellar shut. I swear I nailed it shut."'),
  price: L('Constable Price legt die Hand an den Knüppel, sieht dir in die Augen und nimmt sie wieder weg. „Ich habe Befehl, Sie festzunehmen“, sagt er leise. „Ich habe außerdem Kinder.“',
    'Constable Price puts his hand to his truncheon, looks you in the eye and takes it away again. "I have orders to arrest you," he says quietly. "I also have children."'),
  wick: L('Wick pfeift durch die Zähne. „Die ganze Gasse redet von dir. Die Hälfte betet, die andere Hälfte packt.“',
    'Wick whistles through his teeth. "The whole alley is talking about you. Half are praying, the other half are packing."'),
  ned: L('Der blinde Ned hebt den Kopf, bevor du etwas sagst. „Du klingst anders. Wie eine Glocke, die man im Bauch hört statt im Ohr.“',
    'Blind Ned lifts his head before you say anything. "You sound different. Like a bell you hear in your belly instead of your ear."'),
  quill: L('Mr. Quill schreibt nicht weiter. „Ich habe eine Kolumne über Sie geschrieben. Der Verleger hat sie verbrannt. Er sagte, er wolle nicht, dass Sie sie lesen.“',
    'Mr. Quill stops writing. "I wrote a column about you. The publisher burned it. He said he didn\'t want you to read it."'),
  ambrose: L('Pater Ambrose bekreuzigt sich, zögert und weiß dann nicht, ob er es vor dir oder für dich getan hat.',
    'Father Ambrose crosses himself, hesitates, and then doesn\'t know whether he did it against you or for you.'),
  maud: L('Maud stellt dir ein Glas hin und tritt einen Schritt zurück. „Geht aufs Haus. Alles geht aufs Haus. Bitte bleib nicht zu lange.“',
    'Maud sets a glass in front of you and steps back. "On the house. Everything\'s on the house. Please don\'t stay too long."'),
  nell: L('Nell lacht, zu laut. „Sieh an, mein bester Kunde. Ich hab gehört, du brauchst keine Zutaten mehr. Du bist jetzt selbst eine.“',
    'Nell laughs, too loudly. "Look who it is, my best customer. I hear you don\'t need ingredients any more. You\'ve become one."'),
  kittering: L('Kittering verbeugt sich so tief, dass sein Hut fällt. „Für Sie: alles zum Einkaufspreis. Für Sie: alles umsonst, wenn Sie es wünschen. Wünschen Sie es?“',
    'Kittering bows so low that his hat falls off. "For you: everything at cost. For you: everything free, if you wish. Do you wish it?"'),
  turmwaechter: L('Ezra am Nordtor hält das Tor auf, ohne dass du fragst. „Die Wache hat gesagt, wir sollen Sie aufhalten. Ich hab gefragt, womit.“',
    'Ezra at the North Gate holds the gate open before you ask. "The watch said we should stop you. I asked them with what."'),
  uhrmacherin: L('Meisterin Brass sieht auf ihre Taschenuhr, dann auf dich. „Seit Sie da sind, geht sie richtig. Das war vorher nie so.“',
    'Master Brass looks at her pocket watch, then at you. "Since you arrived, it keeps proper time. It never did before."'),
  crane: L('Odile Crane schiebt dir ein Pfandbuch hin. „Sie stehen da drin. Als Pfand. Jemand hat Sie verpfändet, für eine Kerze. Ich hab’s nicht über mich gebracht, es zu streichen.“',
    'Odile Crane pushes a pawn ledger towards you. "You\'re in there. As a pledge. Someone pawned you for a candle. I couldn\'t bring myself to strike it out."'),
  // Wexmoor
  druce: L('Abel Druce sieht von seinem Fahrplan auf und streicht still eine Zeile durch. „Sonderzug. Für Sie halten jetzt alle Züge.“',
    'Abel Druce looks up from his timetable and silently crosses out a line. "Special train. Every train stops for you now."'),
  hesper: L('Hesper Quell lässt das Salz durch die Finger rieseln. „Man sagt, wo du gehst, wird das Moor still. Ich hab’s nicht geglaubt. Hör mal hin.“ Es ist still.',
    'Hesper Quell lets the salt run through her fingers. "They say the moor goes quiet where you walk. I didn\'t believe it. Listen." It is quiet.'),
  wx_schneiderin: L('Ottilie Fenn misst dich mit den Augen und legt das Maßband weg. „Sie passen in nichts mehr, was ich nähen kann. Nicht der Größe wegen.“',
    'Ottilie Fenn measures you with her eyes and puts the tape away. "Nothing I can sew fits you any more. Not because of the size."'),
  brack: L('Ottilie Brack zieht das Kopftuch tiefer. „Die Grauspäher haben einen Erlass: Wer Sie sieht, soll Ihnen aus dem Weg gehen. Ist der erste Erlass, an den sich alle halten.“',
    'Ottilie Brack pulls her headscarf lower. "The Grey Scouts issued a decree: whoever sees you should get out of your way. First decree everyone actually follows."'),
  pedell: L('Der Pedell schließt die Tür hinter dir, sehr leise, als könnte sie zerbrechen. „Die Magistra sagt, Sie seien eine Prüfungsfrage geworden.“',
    'The beadle closes the door behind you very softly, as if it might break. "The Magistra says you have become an exam question."'),
  sedge: L('Mutter Sedge nimmt deine Hand und lässt sie sofort wieder los, als hätte sie sich verbrannt. „Kind. Was haben sie aus dir gemacht? Nein. Was hast du aus dir gemacht?“',
    'Mother Sedge takes your hand and lets go at once, as if she had burned herself. "Child. What have they made of you? No. What have you made of yourself?"'),
  wyle: L('Magistra Wyle legt die Brille ab. „Ich habe eine Wette verloren. Ich hatte gesagt, niemand kommt von oben zurück.“',
    'Magistra Wyle takes off her glasses. "I lost a bet. I said no one comes back from up there."'),
  wxn_bestatterin: L('Agathe Mulch sieht dich an wie ein Maß, das nicht passt. „Für Sie hab ich keinen Sarg. Ich glaub, für Sie braucht man auch keinen mehr.“',
    'Agathe Mulch looks at you like a measurement that doesn\'t fit. "I have no coffin for you. I don\'t think you need one any more."'),
  wxn_lichtschreiber: L('Corvin Tallow hält die Feder über dem Papier und schreibt nichts. „Das Amt hat mich angewiesen, Ihre Ankunft nicht zu vermerken. Es heißt, Sie lesen mit.“',
    'Corvin Tallow holds his pen over the paper and writes nothing. "The office has instructed me not to record your arrival. They say you read along."'),
  grauspaeher: L('Der Grauspäher tritt beiseite und senkt den Blick. Hinter seiner Maske hörst du, wie er zu atmen vergisst.',
    'The Grey Scout steps aside and lowers his gaze. Behind his mask you hear him forget to breathe.'),
  // Dunscar
  k3_pfiff: L('Pfiff lässt den Becher fallen. Er fängt ihn, bevor er aufschlägt, und lacht dabei, als hätte er dich gefangen. „Du bist runtergekommen. Freiwillig. Das hat noch keiner gemacht.“',
    'Whistle drops his mug. He catches it before it hits the floor and laughs as though he had caught you. "You came down. Of your own accord. Nobody has ever done that."'),
  k3_nellie: L('Nellie Swarth starrt dich an, dann den Himmel, dann wieder dich. „Sie waren oben. Sie waren wirklich oben. Wie ist es? Nein. Sagen Sie es nicht.“',
    'Nellie Swarth stares at you, then at the sky, then at you again. "You were up there. You were really up there. What\'s it like? No. Don\'t tell me."'),
  k3_huxford: L('Dr. Huxford legt das Stethoskop weg, bevor er dich überhaupt anfasst. „Ich höre Ihr Herz von hier. Es schlägt nicht mehr ganz in diesem Takt.“',
    'Dr. Huxford sets the stethoscope aside before he even touches you. "I can hear your heart from here. It no longer quite beats to this rhythm."'),
  k3_esther: L('Esther Brindle zählt die Lohntüten zweimal und schiebt dir eine hin. „Die Schicht hat gesammelt. Für den Fall, dass Sie zurückkommen. Für den Fall, dass Sie etwas brauchen. Was brauchen Sie?“',
    'Esther Brindle counts the pay packets twice and pushes one towards you. "The shift took a collection. In case you came back. In case you needed something. What do you need?"'),
  k3_pelham: L('Jonas Pelham tritt vom Stand zurück und hält die Hände hoch, als wärst du ein Aufseher. Dann merkt er, dass du schlimmer bist, und lässt sie sinken.',
    'Jonas Pelham steps back from the stall and raises his hands as if you were an overseer. Then he realises you are worse, and lets them drop.'),
  k3_adaine: L('Adaine Quarrell nickt dir zu wie einem alten Gläubiger. „Die Bruchstufen haben aufgehört zu rutschen, als Sie oben waren. Heute rutschen sie wieder. Nur weg von Ihnen.“',
    'Adaine Quarrell nods to you like an old creditor. "The quarry steps stopped slipping while you were up there. Today they slip again. Only away from you."'),
  k3_mabel: L('Mabel Caskett stellt dir eine Tasse hin, mit beiden Händen, damit sie nicht zittert. „Der Tisch am Fenster ist frei. Er war immer frei.“',
    'Mabel Caskett sets a cup in front of you with both hands so it won\'t shake. "The table by the window is free. It was always free."'),
  k3_oren: L('Oren Fallowby wischt sich die Hände an der Schürze ab, wieder und wieder. „Das Depot läuft. Alles läuft. Sie brauchen nichts anfassen. Bitte fassen Sie nichts an.“',
    'Oren Fallowby wipes his hands on his apron again and again. "The depot is running. Everything is running. You needn\'t touch anything. Please don\'t touch anything."'),
  k3_willa: L('Willa Trentfold umarmt dich, bevor sie es sich anders überlegen kann, und tritt dann erschrocken zurück. „Du bist warm. Wie ein Ofen. Wie eine Lok.“',
    'Willa Trentfold hugs you before she can think better of it, then steps back startled. "You\'re warm. Like a stove. Like an engine."'),
  k3_gallowmere: L('Perrin Gallowmere zieht den Hut. „Der letzte Bahnsteig hat seit Ihrer Abfahrt keinen Zug mehr gesehen. Ich glaube, er wartet auf Ihre Rückfahrt.“',
    'Perrin Gallowmere raises his hat. "The last platform hasn\'t seen a train since you left. I think it\'s waiting for your return journey."'),
};

// --- Kulisse: Schreine und Steckbriefe ----------------------------------------------------------------------------

/** [Karte, Deko-Sprite, Seed] — kleine Gaben-Schreine für den Halbgott, nur sichtbar bei der Heimkehr. */
const SCHREINE = [
  ['altmarkt', 'b_okkult_schrein', 'a'], ['altmarkt', 'b_okkult_opferschale', 'b'], ['ashgrove', 'b_okkult_schrein', 'a'], ['nachtmarkt', 'b_okkult_opferschale', 'a'],
  ['docks', 'b_okkult_schrein', 'a'], ['nordtor', 'b_revier_steckbriefe', 'a'], ['revier', 'b_revier_steckbriefe', 'b'],
  ['wx_salzmarkt', 'b_okkult_schrein', 'a'], ['wx_salzmarkt', 'b_okkult_opferschale', 'b'], ['wx_bahnhof', 'b_okkult_schrein', 'a'], ['wx_bojenhafen', 'b_okkult_opferschale', 'a'], ['wx_pfahldorf', 'b_okkult_schrein', 'a'],
  ['ds_endbahnhof', 'b_okkult_altar', 'a'], ['ds_kalkmarkt', 'b_okkult_schrein', 'a'], ['ds_kalkmarkt', 'b_okkult_opferschale', 'b'], ['ds_arbeiterbogen', 'b_okkult_schrein', 'a'], ['ds_schwellenring', 'b_okkult_opferschale', 'a'],
];
const SCHREIN_TEXT = {
  b_okkult_schrein: [L('Ein Schrein für dich', 'A shrine for you'), L('Ein kleiner Schrein aus Kisten und Kerzen. Darin steht eine grobe Figur in deinem Mantel, davor liegen Münzen, Brot, ein Kinderschuh. Niemand ist zu sehen, aber das Wachs ist noch warm.',
    'A small shrine of crates and candles. Inside stands a crude figure in your coat, with coins, bread and a child\'s shoe laid before it. No one is in sight, but the wax is still warm.')],
  b_okkult_opferschale: [L('Eine Opferschale', 'An offering bowl'), L('Eine Schale voller Münzen und Zettel. Auf einem steht: „Bitte nimm meinen Bruder nicht.“ Auf einem anderen: „Bitte nimm meinen Vermieter.“',
    'A bowl full of coins and notes. One says: "Please don\'t take my brother." Another: "Please take my landlord."')],
  b_okkult_altar: [L('Ein Altar am Bahnsteig', 'An altar on the platform'), L('Jemand hat aus Schwellen und Kalk einen Altar gebaut, genau an der Stelle, an der der Zug nach oben abfuhr. Darauf liegen Fahrkarten ohne Ziel.',
    'Someone has built an altar of sleepers and lime, exactly where the train going up departed. On it lie tickets with no destination.')],
  b_revier_steckbriefe: [L('Alte Steckbriefe', 'Old wanted posters'), L('Dein Steckbrief, ein Dutzend Mal. Auf jedem ist das Gesicht ausgekratzt. Nicht aus Hass, sagt ein Zettel daneben: „Man soll es nicht ansehen. Es sieht zurück.“',
    'Your wanted poster, a dozen times over. The face has been scratched out on every one. Not out of hatred, says a note beside them: "You shouldn\'t look at it. It looks back."')],
};


// --- Gebete: Leute beten zu dir und bitten um Hilfe (Seb 2026-11-27) ------------------------------------------------------------

/**
 * Seb: „Die Leute, denen du schon mal geholfen hast, beten und fragen dich um Hilfe. Du hörst leises Flüstern, kannst aber erst ab
 * Seq 3 wieder helfen. Ab Seq 3 hörst du Stimmen aus Wexmoor, ab Seq 2 aus Dunscar.“
 * [id, Gebet, Ziel-Karte, Ziel-Prompt, Ziel-Text]. Hören: Kettlegate ab Seq 4, Wexmoor ab Seq 3, Dunscar ab Seq 2 (ein Spieler reicht).
 * Helfen: an Ort und Stelle, sobald man dort sein kann (Heimkehr ab Seq 3; Dunscar erst, wenn man die Stimmen hört).
 * Lohn moderat: 3000 Schilling und ein Nachhall (Seq 3 +2 %). Folgen fürs Ignorieren gibt es (noch) nicht.
 */
export const GEBET_HOEREN = { kettlegate: 4, wexmoor: 3, dunscar: 2 };
export const GEBETE = [
  ['kg_krypta',     L('Pater Ambrose senkt die Stimme. „Seit du fort bist, schreit etwas in der Krypta. Nachts, immer um drei. Ich habe gebetet, ich habe geräuchert, ich habe die Tür vermauern lassen. Es schreit durch die Mauer. Du bist das Einzige in dieser Stadt, vor dem es vielleicht Angst hat.“',
      'Father Ambrose lowers his voice. "Since you left, something screams in the crypt. At night, always at three. I prayed, I burned incense, I had the door walled up. It screams through the wall. You are the only thing in this city it might be afraid of."'),
    'crypt', L('Der Schrei in der Krypta', 'The scream in the crypt'),
    L('Hinter der vermauerten Tür kauert ein Echo, das sich an einem alten Grab festgebissen hat. Es schreit dich an, dann erkennt es dich und verstummt mitten im Ton. Du sagst ihm, dass es gehen darf. Es geht. Die Krypta ist zum ersten Mal seit Monaten still.',
      'Behind the walled-up door crouches an echo that has sunk its teeth into an old grave. It screams at you, then recognises you and falls silent mid-note. You tell it that it may go. It goes. For the first time in months the crypt is quiet.')],
  ['kg_reliquien',     L('Nell schiebt dir ein Fläschchen hin: „Haar des Halbgotts, echt, gesegnet“. „Im Lagerhaus am Hafen füllt einer solches Zeug ab und verkauft es an Leute, die sich vor dir fürchten. Manche trinken es. Zwei liegen im Hospital. Ich fass das nicht an. Du schon.“',
      'Nell pushes a vial towards you: "Hair of the Demigod, genuine, blessed". "Someone in the harbour warehouse is bottling this stuff and selling it to people who are afraid of you. Some drink it. Two are in hospital. I\'m not touching it. You can."'),
    'warehouse', L('Die falschen Reliquien', 'The false relics'),
    L('Zwischen den Kisten stehen Hunderte Fläschchen mit grauem Sud und einem Etikett mit deinem Gesicht. Der Abfüller ist längst geflohen, als er hörte, wer kommt. Du zerschlägst die Ware, Kiste für Kiste. Auf das letzte Etikett schreibst du: „Nicht trinken.“',
      'Between the crates stand hundreds of vials of grey brew with a label bearing your face. The bottler fled long ago when he heard who was coming. You smash the stock, crate by crate. On the last label you write: "Do not drink."')],
  ['wx_moorkinder',     L('Mutter Sedge hält dich am Ärmel fest. „Das Moor nimmt Kinder, seit du fort bist. Nicht viele. Eins im Monat. Sie gehen nachts zum Torfstich und kommen nicht wieder. Wir hören sie singen. Geh hin. Bitte.“',
      'Mother Sedge holds you by the sleeve. "The moor has been taking children since you left. Not many. One a month. They go to the peat cutting at night and don\'t come back. We hear them singing. Go there. Please."'),
    'wx_torfstich', L('Das Singen im Torf', 'The singing in the peat'),
    L('Unter dem Torf singt etwas mit Kinderstimmen. Als du dich hinkniest, hört es auf. Du gräbst mit den Händen, und der Torf gibt nach wie Stoff. Drei Kinder schlafen darunter, kalt, aber lebendig. Das Moor lässt sie los, als hätte es sie dir nur aufbewahrt.',
      'Beneath the peat something sings with children\'s voices. When you kneel, it stops. You dig with your hands, and the peat gives way like cloth. Three children sleep beneath it, cold but alive. The moor lets them go as though it had only been keeping them for you.')],
  ['wx_lake',     L('Hesper wischt sich die Hände an der Schürze ab. „Die Lake im Bojenhafen spricht. Sie sagt Namen. Wer seinen Namen hört, steht am nächsten Morgen im Wasser und weiß nicht, wie er hingekommen ist. Mein Neffe hat seinen Namen gestern gehört.“',
      'Hesper wipes her hands on her apron. "The brine in the Buoy Harbour talks. It says names. Whoever hears their name is standing in the water the next morning and doesn\'t know how they got there. My nephew heard his name yesterday."'),
    'wx_bojenhafen', L('Die Lake, die Namen sagt', 'The brine that speaks names'),
    L('Die Lake flüstert, und dann flüstert sie deinen Namen. Du antwortest. Nicht mit Worten. Das Wasser zieht sich zurück, als hätte es sich verbrannt, und am Grund liegt eine verrostete Glocke, die niemand mehr läuten wird.',
      'The brine whispers, and then it whispers your name. You answer. Not with words. The water draws back as if it had burned itself, and on the bottom lies a rusted bell that no one will ever ring again.')],
  ['ds_verschuettet',     L('Esther Brindle legt den Finger auf drei Namen. „Verschüttet. Im Bruch, unter den Stufen. Die Aufseher sagen, da ist nichts mehr zu machen. Die Aufseher sagen das immer. Wir hören sie noch klopfen.“',
      'Esther Brindle lays her finger on three names. "Buried. In the quarry, under the steps. The overseers say nothing can be done. The overseers always say that. We can still hear them knocking."'),
    'ds_bruchstufen', L('Das Klopfen unter den Stufen', 'The knocking under the steps'),
    L('Du legst die Hand auf den Kalk. Er gibt nach, Stein für Stein, als würde der Berg sich an etwas erinnern, das er dir schuldet. Drei Männer kriechen ins Licht, grau wie Statuen. Einer fragt, ob er jetzt tot ist. Du sagst: noch nicht.',
      'You lay your hand on the lime. It yields, stone by stone, as though the mountain remembered something it owed you. Three men crawl into the light, grey as statues. One asks whether he is dead now. You say: not yet.')],
  ['ds_signalkinder',     L('Mabel stellt die Kanne ab. „Die Signalkinder. Nachts laufen sie zum Signalhang und stellen sich auf die Schienen. Sie sagen, eine Stimme verspricht ihnen einen Zug nach oben. So wie deinen.“',
      'Mabel sets the pot down. "The signal children. At night they run to the Signal Slope and stand on the rails. They say a voice promises them a train going up. Like yours."'),
    'ds_signalhang', L('Der Zug, der nicht kommt', 'The train that doesn\'t come'),
    L('Am Signalhang steht ein Signal auf Fahrt, obwohl kein Zug kommt. Die Stimme darin ist dünn und gierig. Du stellst das Signal mit der bloßen Hand auf Halt und hältst es fest, bis die Stimme aufgibt. Die Kinder gehen nach Hause. Eins winkt.',
      'On the Signal Slope a signal stands at clear although no train is coming. The voice inside it is thin and greedy. You pull the signal to stop with your bare hand and hold it until the voice gives up. The children go home. One waves.')],
];
const BITTE_LOHN = 3000;
/** Wem du hilfst, der wird dein Gläubiger (Seb 2026-11-27: wichtig für spätere Rituale Seq 1/0). Flag glaeubiger_<id>. */
export const GLAEUBIGER = { kg_krypta: 'Pater Ambrose', kg_reliquien: 'Nell Rauhfuß', wx_moorkinder: 'Mutter Sedge', wx_lake: 'Hesper Quell', ds_verschuettet: 'Esther Brindle', ds_signalkinder: 'Mabel Caskett' };
export const GLAEUBIGER_TEXT = L('{0} glaubt jetzt an dich. Ein Gläubiger mehr.', '{0} now believes in you. One more believer.');
export const GEBET_FLUESTERN = L('Du hörst ein leises Flüstern. Jemand betet zu dir.', 'You hear a faint whisper. Someone is praying to you.');
const GEBET_STADT = { kettlegate: L('Ein Gebet aus Kettlegate', 'A prayer from Kettlegate'), wexmoor: L('Eine Stimme aus Wexmoor', 'A voice from Wexmoor'), dunscar: L('Eine Stimme aus Dunscar', 'A voice from Dunscar') };
const GEBET_WARTEN = L('Hinfahren und helfen (Fernzug ab Sequenz 3)', 'Go there and help (long-distance train from Sequence 3)');

// --- Rache: alte Feinde haben gewartet ------------------------------------------------------------------------------

/** Je Stadt ein Trupp und ein Anführer (Boss, für Seq 3 gebaut). Vorlage = vorhandener Gegner (Bild). */
export const RACHE = {
  kettlegate: {
    map: 'ankerhof',
    trupp: { vorlage: 'rost_schmied', sheet: 'enemy_schlachtergehilfe', name: L('Die letzten Rostbrüder', 'The last Rust Brothers'),
      intro: L('Sie haben die Kapelle wieder aufgebaut, Niet für Niet, und dabei jeden Tag deinen Namen auf den Amboss geschlagen. „Als du ein Mensch warst, hast du uns zerschlagen. Jetzt bist du nicht mal mehr ein Mensch. Das macht es leichter.“',
        'They rebuilt the chapel rivet by rivet, beating your name into the anvil every day. "When you were human, you broke us. Now you\'re not even human. That makes it easier."') },
    boss: { vorlage: 'schleier_mutter', sheet: 'enemy_chorfanatiker', name: L('Mutter Ysoldes Rache', 'Mother Ysolde\'s Revenge'),
      intro: L('Aus dem Nebel am Anker tritt eine Frau im grauen Schleier, und hinter ihr zwanzig weitere. „Du hast meine Schwestern in alle Winde zerstreut. Jede von ihnen hat seitdem ein Gesicht gestohlen. Heute geben wir sie dir alle zurück.“',
        'From the fog by the anchor steps a woman in a grey veil, and behind her twenty more. "You scattered my sisters to every wind. Each of them has stolen a face since. Today we give them all back to you."') },
  },
  wexmoor: {
    map: 'wx_lichtamt',
    trupp: { vorlage: 'wx_grauspaeher_fight', name: L('Das letzte Kommando der Grauspäher', 'The Grey Scouts\' last squad'),
      intro: L('Nicht alle Grauspäher halten sich an den Erlass. Ein Dutzend wartet im Lichtamt, die Lampen auf volle Flamme gedreht. „Die Akte ist geschlossen“, sagt ihr Anführer. „Wir nicht.“',
        'Not every Grey Scout follows the decree. A dozen wait in the Office of Light, their lamps turned to full flame. "The file is closed," says their leader. "We are not."') },
    boss: { vorlage: 'ph_leuchtfeuer_elite', name: L('Die Erben des Leuchtfeuers', 'The Heirs of the Beacon'),
      intro: L('Die Wärter des alten Leuchtfeuers haben gesammelt, was nach seinem Erlöschen übrig blieb: Glut, Gebete, Hass. Jetzt brennt es in ihnen. „Du hast unser Licht gelöscht. Wir zeigen dir, wie es sich anfühlt, im Dunkeln zu stehen.“',
        'The keepers of the old Beacon have gathered what remained after it went out: embers, prayers, hatred. Now it burns in them. "You put out our light. We\'ll show you what it feels like to stand in the dark."') },
  },
  dunscar: {
    map: 'ds_runddepot',
    trupp: { vorlage: 'kgj_ds_harrow', name: L('Die Kopfgeldrotte', 'The bounty pack'),
      intro: L('Fünf Kopfgeldjäger, die das Kopfgeld auf dich nie abgehängt haben. Inzwischen ist es hoch genug, um dafür zu sterben. „Halbgott oder nicht“, sagt einer und lädt nach, „bezahlt ist bezahlt.“',
        'Five bounty hunters who never took down the bounty on you. By now it is high enough to die for. "Demigod or not," says one, reloading, "paid is paid."') },
    boss: { vorlage: 'auf_schaffner', name: L('Die Bremser des Schaffners', 'The Conductor\'s Brakemen'),
      intro: L('Du hast den Schaffner des Alten besiegt. Seine Bremser haben ihn begraben, unter der Drehscheibe, und seitdem gewartet. Ihre Gesichter sind verrußt, ihre Augen leer wie Tunnel. „Der Alte hat nichts vergessen. Wir auch nicht.“',
        'You defeated the Old One\'s Conductor. His brakemen buried him under the turntable and have waited ever since. Their faces are sooted, their eyes as empty as tunnels. "The Old One has forgotten nothing. Neither have we."') },
  },
};
const RACHE_WERTE = { trupp: { hp: 6000, dmg: 72, money: 4000 }, boss: { hp: 7500, dmg: 78, money: 9000 } }; // Sim: etwa wie Wetherby (Seq 3 gewinnt meist)
const RACHE_TITEL = L('Alte Feinde', 'Old enemies');
const RACHE_TEXT = L('Nicht alle haben vergessen, was du ihnen angetan hast. In jeder alten Stadt warten Leute, die Rache wollen.', 'Not everyone has forgotten what you did to them. In every old city there are people who want revenge.');
const RACHE_SIEG = L('Sie liegen im Staub. Niemand hier wird es noch einmal versuchen.', 'They lie in the dust. No one here will try again.');
const RACHE_NIEDERLAGE = L('Du kommst zu dir. Sie sind fort, aber sie kommen wieder.', 'You come to. They are gone, but they will come back.');
const RACHE_FLUCHT = L('Du ziehst dich zurück. Sie lachen. Sie warten.', 'You withdraw. They laugh. They wait.');
const SCHRITT_STADT = { kettlegate: 'Kettlegate', wexmoor: 'Wexmoor', dunscar: 'Dunscar' };
const RACHE_SCHRITT = { kettlegate: L('Rache in Kettlegate', 'Revenge in Kettlegate'), wexmoor: L('Rache in Wexmoor', 'Revenge in Wexmoor'), dunscar: L('Rache in Dunscar', 'Revenge in Dunscar') };

const RACHE_ANGRIFF = [L('Alter Groll', 'Old grudge'), L('Viele Hände', 'Many hands'), L('Sie schließen den Kreis', 'They close the circle'),
  L('Sie schließen den Kreis um dich: +8 Abwehr.', 'They close the circle around you: +8 defence.'), L('Alles, was sie haben', 'Everything they have')];

function racheKampf(content, city, art, r) {
  const v = RACHE_WERTE[art];
  const base = content.encounters[r.vorlage] ?? {};
  const id = `hkr_${city}_${art}`;
  return {
    id, name: r.name, sprite: base.sprite ?? 'wild', ...(r.sheet ?? base.sheet ? { sheet: r.sheet ?? base.sheet } : {}), occult: true, chapter: 5, boss: true, elite: false, tier_seq: 3,
    hp: v.hp, armor: 8, dmg_mult: 1, max_round_dmg: 0.2, fleeable: true, duo_hp_mult: 2.2, heimkehr_rache: true,
    attacks: [
      { name: RACHE_ANGRIFF[0], damage: v.dmg, hits: [900, 1500] },
      { name: RACHE_ANGRIFF[1], damage: Math.round(v.dmg * 0.6), hits: [600, 1000, 1400, 1800] },
      { name: RACHE_ANGRIFF[2], action: 'guard', value: 8, text: RACHE_ANGRIFF[3] },
      { name: RACHE_ANGRIFF[4], damage: Math.round(v.dmg * 1.4), hits: [1700], unparryable: true },
    ],
    intro: r.intro, win_text: RACHE_SIEG, lose_text: RACHE_NIEDERLAGE, flee_text: RACHE_FLUCHT, lose_money: 0, on_win: {},
  };
}

// --- Einbau ---------------------------------------------------------------------------------------------------------

const STADT_SCHRITT = { kettlegate: L('Nachhall in Kettlegate (6 Orte)', 'Echoes in Kettlegate (6 places)'), wexmoor: L('Nachhall in Wexmoor (6 Orte)', 'Echoes in Wexmoor (6 places)'), dunscar: L('Nachhall in Dunscar (6 Orte)', 'Echoes in Dunscar (6 places)') };
const QUEST_TITEL = L('Heimkehr', 'Homecoming');
const QUEST_TEXT = L('Ab der dritten Sequenz hält dich nichts mehr auf. Die Fernzüge fahren wieder nach Dunscar, Wexmoor und Kettlegate. An den Orten deiner Geschichte hallt etwas nach, das dir hilft, den Trank zu verdauen, wenn er wieder stockt.',
  'From the third Sequence on, nothing can stop you any more. The long-distance trains run again to Dunscar, Wexmoor and Kettlegate. At the places of your story something echoes that helps you digest the potion when it stalls again.');
const FAHRPLAN = [L('Ein neuer Fahrplan', 'A new timetable'), L('Fernzüge nach unten', 'Long-distance trains down'),
  L('Am Gleisfuß hängt ein neuer Fahrplan, frisch gedruckt: Fernzüge nach Dunscar, Wexmoor und Kettlegate, täglich. Darunter hat jemand mit Bleistift geschrieben: „Für den, den nichts mehr aufhält.“ Über die Stadtkarte kannst du jetzt in die alten Städte zurückreisen.',
    'A new timetable hangs at the Railfoot, freshly printed: long-distance trains to Dunscar, Wexmoor and Kettlegate, daily. Underneath, someone has written in pencil: "For the one nothing can stop any more." You can now travel back to the old cities via the city map.')];

const startNodes = (d) => (typeof d.start === 'string' ? [d.start] : Array.isArray(d.start) ? d.start.map((v) => v.node) : ['start']).filter((k) => d.nodes?.[k]);

export function applyHeimkehr(content) {
  const stadt = (mapId) => content.maps[mapId]?.city ?? 'kettlegate';
  // Fernzüge
  for (const von of VON) for (const [nach, z] of Object.entries(ZIELE)) {
    if (nach === von || !content.maps[z.map]) continue;
    content.travel.push({ map: z.map, spawn: z.spawn, name: z.name, desc: z.desc, city: von, direct: true, requires_flags: ['k4_arrived'], ...HK, heimkehr: true });
  }
  // Kettlegate hat eine gemalte Stadtkarte: alle Fernzüge stehen am Pin des Zugs nach Wexmoor
  const pins = content.travelRules?.pins;
  if (pins?.wx_bahnhof) for (const z of Object.values(ZIELE)) pins[z.map] ??= pins.wx_bahnhof;
  // Nachhall
  const ids = [];
  for (const [city, liste] of Object.entries(NACHHALL)) for (const [id, mapId, title, text] of liste) {
    const map = content.maps[mapId];
    if (!map || stadt(mapId) !== city) continue;
    const tile = freieKachel(map, { seed: `hk|${id}`, minDist: 5 });
    if (!tile) continue;
    ids.push(id);
    map.interactables.push({ id: `hk_${id}`, kind: 'read', tile, prompt, title, marker: true, text,
      visible_if: { ...HK, hide_if_flags: [`hk_${id}`] }, effects: { sets_flags: [`hk_${id}`], nachhall: id } });
  }
  content.heimkehr = { nachhall: ids };

  // Stimmen
  for (const [npc, text] of Object.entries(STIMMEN)) {
    const d = content.dialogues[content.npcs?.[npc]?.dialogue ?? npc];
    if (!d) continue;
    for (const k of startNodes(d)) {
      const node = d.nodes[k];
      const alt = node.texte ?? [];
      const vorn = alt[0]?.erneut === true ? 1 : 0; // „erneut“-Variante (Dunscar-Stimmen) bleibt vorn
      node.texte = [...alt.slice(0, vorn), { ...HK, erneut: false, text }, ...alt.slice(vorn)];
    }
  }
  // Kulisse
  for (const [mapId, sprite, seed] of SCHREINE) {
    const map = content.maps[mapId];
    if (!map) continue;
    const tile = freieKachel(map, { seed: `hk|schrein|${mapId}|${seed}`, minDist: 4 });
    if (!tile) continue;
    map.decor ??= [];
    map.decor.push({ sprite, tile, alpha: 1, origin: [0.5, 1], offset: [0, 8], ysort: true, visible_if: HK });
    const [title, text] = SCHREIN_TEXT[sprite];
    map.interactables.push({ id: `hk_schrein_${mapId}_${seed}`, kind: 'read', tile, prompt: title, title, text, visible_if: HK });
  }
  // Gebete: hören (core/Heimkehr.js gebeteTick startet den Auftrag), helfen am Ort
  const gebete = [];
  for (const [id, bitte, map, zielPrompt, zielText] of GEBETE) {
    const m = content.maps[map];
    if (!m) continue;
    const city = stadt(map);
    const hoer = GEBET_HOEREN[city] ?? 3;
    const fertig = `hkg_${id}`;
    gebete.push({ id, quest: fertig, hoer, city, name: GLAEUBIGER[id] });
    m.interactables.push({ id: `${fertig}_ziel`, kind: 'read', tile: freieKachel(m, { seed: `hk|gebet|${id}`, minDist: 5 }), prompt: zielPrompt, title: zielPrompt, marker: true, text: zielText,
      visible_if: { ...HK, requires_quests_active: [fertig], ...(hoer < 3 ? { requires_einer_seq: hoer } : {}) },
      effects: { sets_flags: [fertig], nachhall: `gebet_${id}`, gives_money: BITTE_LOHN, complete_quests: [fertig], glaeubiger: id } });
    content.quests[fertig] = { title: GEBET_STADT[city], kind: 'side', case: 'kapitel4_aufstieg', summary: bitte,
      steps: [{ text: hoer >= 3 ? GEBET_WARTEN : zielPrompt, done: { requires_flags: [fertig] }, target: { map, id: `${fertig}_ziel`, label: zielPrompt } }] };
  }
  // Rache: Trupp, danach der Anführer
  for (const [city, r] of Object.entries(RACHE)) {
    const m = content.maps[r.map];
    if (!m) continue;
    for (const art of ['trupp', 'boss']) {
      const enc = racheKampf(content, city, art, r[art]);
      enc.lose_to = { map: r.map, spawn: 'default' };
      content.encounters[enc.id] = enc;
      const v = RACHE_WERTE[art];
      content.loot[enc.id] = { money: [v.money, v.money], drops: [{ item: 'geisteressenz', chance: 1 }, { item: 'silberstaub', chance: 1 }, { item: 'nebeltau', chance: 0.5 }].filter((x) => content.items[x.item]) };
      const vor = art === 'trupp' ? [] : ['won_hkr_' + city + '_trupp'];
      m.interactables.push({ id: enc.id, kind: 'combat', encounter: enc.id, tile: freieKachel(m, { seed: `hk|rache|${city}|${art}`, minDist: 6 }), prompt: r[art].name, marker: true,
        visible_if: { ...HK, requires_flags: vor, hide_if_flags: [`won_${enc.id}`] } });
    }
  }
  content.quests.hkr_rache = { title: RACHE_TITEL, kind: 'side', case: 'kapitel4_aufstieg', summary: RACHE_TEXT,
    steps: Object.entries(RACHE).filter(([, r]) => content.maps[r.map]).map(([city, r]) => ({ text: RACHE_SCHRITT[city], done: { requires_flags: [`won_hkr_${city}_boss`] }, target: { map: r.map, id: `hkr_${city}_trupp`, label: SCHRITT_STADT[city] } })) };
  content.heimkehr.gebete = gebete;
  // Auftrag im Notizbuch: Fahrplan am Gleisfuß
  const steps = Object.entries(NACHHALL).map(([city, liste]) => {
    const of = liste.map(([id]) => `hk_${id}`).filter((f) => ids.includes(f.slice(3)));
    const erst = liste.find(([id]) => ids.includes(id));
    return { text: STADT_SCHRITT[city],
      done: { requires_n_flags: { of, n: of.length } }, ...(erst ? { target: { map: erst[1], id: `hk_${erst[0]}`, label: erst[2] } } : {}) };
  });
  content.quests[HK_QUEST] = {
    title: QUEST_TITEL, kind: 'side', case: 'kapitel4_aufstieg', summary: QUEST_TEXT,
    steps,
  };
  const fuss = content.maps.cw_gleisfuss;
  if (fuss) {
    fuss.interactables.push({ id: 'hk_fahrplan', kind: 'read', tile: freieKachel(fuss, { near: [6, 22], seed: 'hk_fahrplan' }), prompt: FAHRPLAN[0], marker: true,
      title: FAHRPLAN[1], visible_if: { ...HK, hide_if_quests: [HK_QUEST] }, effects: { start_quests: [HK_QUEST, 'hkr_rache'] }, text: FAHRPLAN[2] });
  }
  return content;
}
