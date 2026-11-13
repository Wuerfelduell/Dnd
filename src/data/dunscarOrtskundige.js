/**
 * Ortskundige in Dunscar (Seb 2026-11-12: Dunscar ausbauen, man soll sich zurechtfinden).
 * Je Viertel steht eine Person am Platz neben der Viertelstafel und erklärt, was es hier gibt, wohin die Wege führen,
 * worauf man achten muss, und was man sich erzählt. Figuren: die Vorratsfiguren ds_einwohner_1–6 (Paket AW).
 * `tafel`: Zusatzzeile für die Viertelstafel.
 */
const FIG = { coat: '#4a4f58', hat: '#2a2c30', skin: '#c99f7b', hair: '#5a4a3a', legs: '#2a2c30' };

function dialog({ gruss, viertel, wege, gefahr, gerede, gerede2, gott, wechsel }) {
  const zurueck = [{ text: 'Noch etwas.', next: 'start' }];
  return {
    start: 'start',
    nodes: {
      start: {
        text: gruss,
        choices: [
          { text: 'Was gibt es in diesem Viertel?', next: 'viertel' },
          { text: 'Wohin komme ich von hier?', next: 'wege' },
          { text: 'Worauf muss ich achten?', next: 'gefahr' },
          { text: 'Was erzählt man sich?', next: 'gerede', hide_if_flags: ['k3a_akt1_done'] },
          { text: 'Was erzählt man sich?', next: 'gerede2', requires_flags: ['k3a_akt1_done'] },
          { text: 'Ein Mann namens Starling. Und ein alter Gott?', next: 'gott' },
          ...(wechsel ? [{ text: 'Kann man auf einen anderen Pfad wechseln?', next: 'wechsel' }] : []),
          { text: 'Auf Wiedersehen.' },
        ],
      },
      viertel: { text: viertel, choices: zurueck },
      wege: { text: wege, choices: zurueck },
      gefahr: { text: gefahr, choices: zurueck },
      gerede: { text: gerede, choices: zurueck },
      gerede2: { text: gerede2, choices: zurueck },
      // Seb 2026-11-12: Kapitel 3 = Rache an Starling, den ein uralter Gott beschützt. Gerüchte zählen fürs Kapitelziel.
      gott: { text: gott, choices: zurueck, sets_flags: ['k3r_gott_gehoert'] },
      // Seb 2026-11-12: Pfadwechsel ab Seq 4 zum Nachbarpfad (core/Pathways.js WECHSEL_SEQ)
      ...(wechsel ? { wechsel: { text: wechsel, choices: zurueck, sets_flags: ['pfadwechsel_gehoert'] } } : {}),
    },
  };
}

const ok = (id, sheet, name, role, coat, texte, tafel) => ({ id, sheet, name, role, palette: { ...FIG, coat }, tafel, dialog: dialog(texte) });

export const DS_ORTSKUNDIGE = {
  ds_endbahnhof: ok('ds_ok_endbahnhof', 'ds_einwohner_1', 'Gepäckträgerin Lotte Brack', 'Ortskundige am Endbahnhof', '#4a5a6a', {
    gruss: 'Eine Frau mit Messingmarke an der Mütze lehnt an einem leeren Gepäckkarren. „Brack. Ich trage nichts mehr, seit keiner mehr abfährt. Aber ich weiß, wo alles steht.“',
    viertel: '„Der Endbahnhof. Schalter und Fahrplantafel oben an der Nordwand, die Wartebänke unten am Gleis. Hier kommt jeder an, und hier bleibt jeder hängen. In der Nordwestecke hängen die Aushänge, da liest du, wer gerade wen sucht.“',
    wege: '„Nach Norden die Straße hoch zum Schwellenring, da ist Pfiffs Speisewagen, dein Bett und dein Kessel. Nach Osten raus zum Signalhang. Die Stadtkarte hängt hier am Platz, wenn du schneller woanders sein willst.“',
    gefahr: '„Am Bahnhof selbst tut dir keiner was. Polizei gibt’s hier nicht, nur den Fels. Die schlimmen Ecken haben ein rotes Licht am Ausgang und eine Zahl auf dem Schild. Je höher die Zahl, desto weniger kommen zurück.“',
    gerede: '„Die Uhr da oben hat keine Ziffern. Trotzdem sagen alle, sie geht vor.“',
    gerede2: '„Seit der Sache am Ruf schläft die Stadt unruhiger. Die Gleise summen nachts, als würde ein Zug kommen. Es kommt keiner.“',
    gott: '„Heller Mantel, ruhige Hände? Der kam ohne Billett an und ist ohne Billett weiter. Der Schalter hat sich vor ihm verbeugt. Ich schwöre es, die Klappe ging runter wie ein Kopf.“',
  }, 'Ortskundige: Lotte Brack am Platz kennt jeden Weg.'),
  ds_schwellenring: ok('ds_ok_schwellenring', 'ds_einwohner_2', 'Weichenwärter Anton Riegel', 'Ortskundiger am Schwellenring', '#5a4a3a', {
    gruss: 'Ein Mann mit Ölkanne prüft eine Weiche, die längst nirgends mehr hinführt. „Riegel. Ich stelle die Weichen, damit sie nicht vergessen, wie es geht.“',
    viertel: '„Der Schwellenring ist dein Zuhause hier. An der Nordwand Pfiffs Speisewagen: Bett, Lager, Fallwand und Pfiffs Kessel zum Brauen. Daneben das Runddepot, da hinten trifft sich der Schichtbund. Wenn ein Treffen läuft, sitzt dort auch Hanne Saum, die Flickerin.“',
    wege: '„Nach Norden zum Arbeiterbogen, nach Süden zum Endbahnhof. Und ganz unten am Südende die Straße in die Rangierwüste. Über den Wartungssteg kommst du zu den Bruchstufen, wenn man ihn dir geöffnet hat.“',
    gefahr: '„Die Rangierwüste, Gefahr vier. Schichtgänger, Signalkrähen, und hinten der Weichenfresser. Den hält man nur mit einer starken Sequenz aus. Geh ausgeschlafen, und geh mit jemandem.“',
    gerede: '„Im Runddepot zählen sie neue Gesichter. Wer nicht zählbar ist, wird aufgeschrieben.“',
    gerede2: '„Die Weichen stellen sich nachts manchmal von selbst zurück. Ich stelle sie morgens wieder hin. Wir haben eine Abmachung.“',
    wechsel: '„Umstellen? Davon verstehe ich was.“ Riegel klopft auf den Weichenhebel. „Bis Sequenz vier fährst du auf deinem Gleis, da gibt es keine Weiche. Wer Halbgott ist, Sequenz vier, kann einmal umstellen, aufs Nachbargleis, und nur dorthin. Laterne und Schlüssel liegen nebeneinander, Echo und Maske, Faden und Uhr, Waage und Eisen, Kessel und Moor. Du trinkst statt deiner dritten Stufe die dritte des Nachbarn. Das Ritual deiner Schwelle brauchst du trotzdem. Die Strecke hinter dir bleibt dir, deine alten Gaben auch. Aber zurückstellen geht nicht, und ein zweites Mal auch nicht. Die Formel dafür findest du hier: als seltenes Los bei den Zirkeln oder bei denen, die du in den Gruben erlegst.“',
    gott: '„Die Alten sagen, unter Dunscar schläft einer, der älter ist als jede Weiche. Er schläft nicht tief. Wer ihm etwas bringt, bekommt Schutz. Dein Starling hat ihm wohl etwas gebracht.“',
  }, 'Ortskundiger: Anton Riegel am Platz. Rast, Lager und Kessel im Speisewagen.'),
  ds_arbeiterbogen: ok('ds_ok_arbeiterbogen', 'ds_einwohner_3', 'Wäscherin Grete Lind', 'Ortskundige im Arbeiterbogen', '#6a5a4a', {
    gruss: 'Eine Frau mit nassen Ärmeln hängt Hemden auf, die nie ganz trocken werden. „Lind. Bei dem Staub wäscht man zweimal am Tag oder gar nicht.“',
    viertel: '„Hier wohnen die, die noch Schicht haben. Oben an der Nordseite der Teesaal „Zur letzten Schicht“, da gibt Mabel Tee gegen die Unruhe. In der Mitte reden die Leute, Nordost meistens, wenn sie nicht gerade arbeiten.“',
    wege: '„Nach Osten zum Kalkmarkt, da kriegst du alles, was man kaufen kann. Nach Süden zurück zum Schwellenring. Die Stadtkarte hängt am Platz.“',
    gefahr: '„Hier ist es ruhig. Nachts gehen die Aufseher die Hauptstraße ab. Wer gesucht wird, nimmt die Ecken.“',
    gerede: '„Am Abendtisch ist immer ein Platz leer. Keiner deckt ihn ab, keiner setzt sich hin.“',
    gerede2: '„Seit dem Ruf hängen die Leute ihre Wäsche anders herum. Sagen, dann hört sie nicht zu.“',
    gott: '„Eine Frau aus dem Teesaal hat ihn gesehen, deinen Starling. Sie sagt, sein Schatten fiel in die falsche Richtung. Zur Erde hin, nicht vom Licht weg.“',
  }, 'Ortskundige: Grete Lind am Platz. Gegen Unruhe hilft Mabels Tee im Teesaal.'),
  ds_kalkmarkt: ok('ds_ok_kalkmarkt', 'ds_einwohner_4', 'Marktruferin Paula Kreid', 'Ortskundige am Kalkmarkt', '#7a5a3a', {
    gruss: 'Eine Frau mit Kreidetafel um den Hals ruft Preise aus, die niemand bezahlt. „Kreid! Ich rufe, die anderen verkaufen. Was suchst du?“',
    viertel: '„Händler stehen im Südwesten, immer. Greta Hask mit Waffen, Wilma Rook mit Kleidung und Anhängern, Hester Wynn mit Kräutern. Ida Marrow kauft deine Beute an und hat Grundvorräte. Bram Tolley macht Steinarbeit. Und hinter dem Markt glimmt der Kalte Ofen, wenn dort versteigert wird. Den findest du auf der Stadtkarte.“',
    wege: '„Nach Westen zum Arbeiterbogen, nach Osten zu den Bruchstufen. Von dort geht es in den Klopfbruch, aber das willst du nicht ohne Not.“',
    gefahr: '„Auf dem Markt passiert nichts, solange du zahlst. Die Preise sind doppelt so hoch wie in Kettlegate, das ist die einzige Gefahr hier.“',
    gerede: '„Die Grabsteine beim Steinmetz sind alle leer. Er sagt, die Namen bringt jeder selbst mit.“',
    gerede2: '„Im Kalten Ofen sollen sie Dinge versteigern, die es gar nicht geben dürfte. Ich rufe sie nicht aus. Ich bin nicht verrückt.“',
    gott: '„Im Kalten Ofen handeln sie mit Zeug, das nach dem Alten riecht. Kalt, auch wenn es glüht. Wer so etwas trägt, steht unter seiner Hand. Gegen den kommst du mit Fäusten nicht an.“',
  }, 'Ortskundige: Paula Kreid am Platz kennt alle Stände.'),
  ds_bruchstufen: ok('ds_ok_bruchstufen', 'ds_einwohner_5', 'Steinbrecher Matthis Hauer', 'Ortskundiger an den Bruchstufen', '#4a4a3a', {
    gruss: 'Ein Mann mit Kalk im Bart sitzt auf einem Gerüstbalken. „Hauer. Ich klopfe Stein, und manchmal klopft er zurück.“',
    viertel: '„Die Bruchstufen. Gerüste, Messgeräte, Bretterwege. Hier wohnt keiner gern, aber alle kommen durch. Die Stufen verbinden Markt, Hang und die Gruben.“',
    wege: '„Nach Westen zum Kalkmarkt. Nach Süden zum Signalhang und, etwas weiter, zum letzten Bahnsteig. Nach Norden geht es in den Klopfbruch.“',
    gefahr: '„Klopfbruch, Gefahr vier. Gerüstklang, Kalkstaubgeister, und hinten der Bruchmeister. Im Lager gleich hinter dem Eingang liegen Notizen von denen, die vor dir drin waren. Lies sie, bevor du weitergehst.“',
    gerede: '„Wenn du im Bruch dein Klopfen zurückhörst, bevor du klopfst, geh heim.“',
    gerede2: '„Der Bruchmeister steht wieder. Man hat ihn umgeworfen, und er steht wieder. Wie die Gerüste.“',
    gott: '„Ganz unten im Bruch sind Zeichen im Fels, die hat kein Mensch geschlagen. Ein Auge, das nach innen schaut. Seit dein Starling hier war, sind sie frisch nachgezogen.“',
  }, 'Ortskundiger: Matthis Hauer am Platz.'),
  ds_signalhang: ok('ds_ok_signalhang', 'ds_einwohner_6', 'Signalgehilfe Fritz Lauscher', 'Ortskundiger am Signalhang', '#3a4a5a', {
    gruss: 'Ein junger Mann mit Hörrohr am Ohr zuckt bei jedem Geräusch. „Lauscher. Das ist mein Name und mein Beruf. Sprich bitte leise.“',
    viertel: '„Oben an der Nordseite das Klangprüfhaus und das alte Lohnbüro. Cato Finch, der Lampenwart, verkauft im Südwesten Licht und Öl. Und das Stumme Stellwerk trifft sich hier, über die Stadtkarte. Da wird nicht geredet, da wird geboten.“',
    wege: '„Nach Norden zu den Bruchstufen, nach Westen zum Endbahnhof. Nach Osten die zwei schlimmen Wege: Rufschlucht und Unterschicht.“',
    gefahr: '„Rufschlucht, Gefahr fünf. Da antwortet die Wand, und der Schluchtrufer am Ende ruft dich mit deiner eigenen Stimme. Unterschicht, Gefahr sechs. Da unten arbeitet noch einer, der Tiefenvorarbeiter. Ohne Sequenz vier kommst du an ihm nicht vorbei.“',
    gerede: '„Die Hörrohre am Hang drehen sich nachts in Richtung Schlucht. Keiner dreht sie.“',
    gerede2: '„Seit dem Ruf ist es in der Schlucht stiller. Stille ist schlimmer. Stille hört zu.“',
    gott: '„Der Alte frisst keine Leute. Er leiht ihnen Kraft und holt sie sich später. Wenn du an seinen Diener willst, musst du selbst so stark sein, dass er überlegen muss, ob es sich lohnt.“',
  }, 'Ortskundiger: Fritz Lauscher am Platz. Rote Lichter an den Ausgängen heißen Gefahr.'),
};
