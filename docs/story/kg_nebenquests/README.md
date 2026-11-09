# Paket AA: Nebenaufträge in Kettlegate

**Status: geprüfter Datenentwurf zur separaten Integration.** 11 Nebenaufträge, 3 Steckbriefe, 6 Kampfdefinitionen (3 vorhandene Gegnertypen und 3 neue Gesuchte), 2 neue Gegenstände. Keine Laufzeitdatei wird verändert.

Die Daten basieren auf dem bei Arbeitsbeginn ausgecheckten main. Quellen, Zustandsvarianten und die genaue Einbauanweisung stehen in [offene_punkte.md](offene_punkte.md). `node docs/story/kg_nebenquests/pruefen.mjs` prüft die Daten ohne zusätzliche Pakete.

Die angegebenen Geldbeträge sind Basisbeträge. `reward.gives_money: 0` unterbindet die sonst zusätzlichen 12 Schilling Nebenquestlohn; Pfad-/Ausrüstungsboni auf `addMoney(..., {loot:true})` bleiben Spielregeln. Alle Aufträge sind vor Ende von Fall 9 lösbar, ohne Kapitel-2-Flags oder Zufallsdrops. Einmal angenommene Aufträge bleiben nach dem Finale abschließbar.

## Das Hemd vom Donnerstag

Martha findet jede Woche fremdes Blut und Ruß auf einem Herrenhemd. Ein Ausgabebuch und eine Kiste verletzter Tauben erklären die Flecken. Du entscheidest, ob Lens Hilfe vertraulich bleibt oder seine Herrschaft davon erfährt.

- ID: `kg_waschtag`
- Start: `case_05_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Ashgrove → Schlachthof → Hafen → Martha.
- Belohnung: 18 Schilling / +3 Ehre oder 30 Schilling / −2 Ehre.
- Entscheidung: Schutz oder namentlicher Bericht; Arbeitgeber verbietet Hilfe in der Dienstzeit.

## Feierabend im Schornstein

Ein Schornstein ruft die Namen alter Arbeiter und neuer Lehrlinge. Ben findet die Ursache in verbrannten Lohnzetteln. Du beendest die eingebildete Schicht mit Kerzen oder vertreibst ihren Rußgeist im Kampf.

- ID: `kg_schornstein`
- Start: `case_05_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Hafen → Altmarkt → Hafen.
- Belohnung: 24 / +3 Ehre friedlich; 16 Schilling nach Kampf.
- Entscheidung: Friedlicher Schlot bleibt heil, Kampf hinterlässt Reparaturkosten.

## Das Fenster ohne Zimmer

Tam fürchtet ein Fenster, das nur auf Emils Bildern existiert. Der ehemalige Pausenraum wurde für größere Öfen zugemauert. Du gibst der verlorenen Pause einen Platz oder entfernst das Bild und verlegst die Runde.

- ID: `kg_nachtschicht`
- Start: `case_05_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Gießerei → Altmarkt → Gießerei.
- Belohnung: 22 / +3 Ehre oder 28 / −1 Ehre.
- Entscheidung: Erinnerung mit anderen teilen oder aus dem Blick schaffen.

## Die letzte Fahrt

Ein toter Linienheizer bleibt Nacht für Nacht in Abels Droschke sitzen. Sein Fahrschein und das Gräberregister erzählen von einer gemeinsamen Beisetzung. Du lässt ihn am Grab ankommen oder beendest die Fahrt mit der nackten Wahrheit.

- ID: `kg_letzte_fahrt`
- Start: `case_06_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Nordtor → St. Ebba → Nordtor.
- Belohnung: 20 / +3 Ehre oder 26 Schilling.
- Entscheidung: Tröstende letzte Fahrt oder sofortige Aufklärung.

## Die offenen Augen

Auf Adas Totenbild sind die Augen offen, obwohl die Aufnahme geschlossene Lider zeigte. Drei Orte belegen eine nachträgliche Retusche gegen den erklärten Willen des Toten. Nach der Deduktion entscheidest du zwischen dem Original und dem offen gekennzeichneten Trostbild.

- ID: `kg_totenbild`
- Start: `case_06_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Atelier → Villa Ashcombe → Revier → Atelier.
- Belohnung: 26 / +3 Ehre oder 34 / −2 Ehre.
- Entscheidung: Letzten Willen achten oder den Trost der Hinterbliebenen bevorzugen.

## Unter Kollegen

Pratt wurde selbst mit einer erfundenen Krankenhauslotterie betrogen. Nach Prüfung von Zeichnungsbuch und Zulassung kannst du Voss zu einer Rückzahlung bringen. Du entschädigst entweder die Anleger oder teilst einen betrügerisch erlangten Rückkauf mit Pratt.

- ID: `kg_gezinkt`
- Start: `case_06_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Nachtmarkt → Revier → Nachtmarkt; nach pratt_resolved per Brief.
- Belohnung: 12 / +5 Ehre oder 48 / −6 Ehre.
- Entscheidung: Entschädigung gegen persönliche Bereicherung; kein Würfelbetrug und kein zweites Tonikum.

## Das verschlossene Haus

Orsolyas Karten zeigen jedem das verschlossene Haus. Eine okkulte Druckplatte zwingt ihre Bilder in dieselbe Form. Du sicherst die Platte diskret oder machst sie vor betroffenen Kunden unbrauchbar.

- ID: `kg_kartenlegerin`
- Start: `case_06_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Nachtmarkt; bei seer_arrested Besuch im Revier.
- Belohnung: 24 Schilling diskret oder 12 / +4 Ehre öffentlich.
- Entscheidung: Reputation schützen oder Kunden aufklären; Haft wird nicht aufgehoben.

## Landgang ohne Rückkehr

Hales Kamerad Orrin verschwindet bei einem bezahlten Kanalauftrag. Du kämpfst gegen einen Gasgeist und bringst ihn zur Leiter. Anschließend zeigst du den ausbeuterischen Vermittler an oder ermöglichst Orrins rasche Abreise durch eine Ablösung.

- ID: `kg_landgang`
- Start: `case_08_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Hafen → Gaskanäle → Hafen.
- Belohnung: 28 / +4 Ehre oder 12 Schilling + Verband.
- Entscheidung: Aussage gegen Vermittler oder sofortige Heimfahrt; gleicher vorhandener Gasgeist-Typ.

## Licht für einen Schuldner

Ein Nachtrag bindet Brenngeld an dreißig Lichterabende für einen abgewiesenen Schuldner. Edmund verschweigt den Fonds, während Wren eine persönliche Verfügung daraus macht. Zwei Schriftstücke und Wrens Aussage erlauben die Deduktion, anschließend wählst du öffentliche Offenlegung oder einen vertraulichen Vergleich.

- ID: `kg_kodizill`
- Start: `case_08_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Kontor → St. Brigid → ggf. Revier; Gefangene bleiben in Haft.
- Belohnung: 24 / +5 Ehre oder 38 / −2 Ehre.
- Entscheidung: Beide Täuschungen öffentlich machen oder Wärme ohne öffentliche Rechenschaft sichern.

## Ein König aus Draht

Jasper soll einen vermeintlichen Rattenkönig unter dem Schlachthof beseitigen. Am Wartungsgitter erkennst du einen in Bündeldraht gefangenen Schwarm. Du löst die Drähte oder vertreibst die Tiere im Kampf und erhältst unterschiedliche Bezahlung.

- ID: `kg_rattenkoenig`
- Start: `case_08_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Ashgrove oder Besuch im Revier → Schlachthof → Jasper.
- Belohnung: 16 + Verband / +4 Ehre friedlich; 32 Schilling im Kampf.
- Entscheidung: Verschonen ohne Meisterprämie oder bezahlte gewaltsame Vertreibung.

## Die falsche Druckzeile

Nan soll Flugblätter austragen, die Clara einen gewaltsamen Aufruf unterschieben. Owen erkennt die manipulierte Uhrzeit, Clara den fremden Text, und eine Quittung benennt den Nutznießer. Du machst die Fälschung öffentlich oder tauschst die Blätter still aus, bevor du die Stadt verlässt.

- ID: `kg_flugblatt`
- Start: `case_09 aktiv und nicht kapitel1_done`; neue Annahme nur vor `kapitel1_done`.
- Orte: Nachtmarkt → Nordtor → Altmarkt → Nan.
- Belohnung: 10 + 2 Verbände / +5 Ehre öffentlich; 10 / +1 Ehre still.
- Entscheidung: Öffentliche Rechenschaft oder Schutz durch stillen Austausch; kein vorweggenommener Hauptfallbeweis.

## Kopfgeld: Leda Marn, die Siegelbrecherin

Leda Marn, die Siegelbrecherin wird wegen eines belegbaren Betrugs gesucht. Erst der Fundbeleg schaltet die Festnahme am genannten Ort frei. Bei der Abrechnung reichst du die Unterlagen für die Geschädigten ein oder lässt ihre Prüfung liegen.

- ID: `kg_kopfgeld_siegelbrecher`
- Start: `case_06_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Revier → ankerhof → Revier.
- Belohnung: 42 Schilling, +3 oder −1 Ehre.
- Entscheidung: Belege zur Entschädigung einreichen oder nur Kopfgeld kassieren.

## Kopfgeld: Bramwell Silt, der Schichtdieb

Bramwell Silt, der Schichtdieb wird wegen eines belegbaren Betrugs gesucht. Erst der Fundbeleg schaltet die Festnahme am genannten Ort frei. Bei der Abrechnung reichst du die Unterlagen für die Geschädigten ein oder lässt ihre Prüfung liegen.

- ID: `kg_kopfgeld_schichtdieb`
- Start: `case_07_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Revier → giesserei → Revier.
- Belohnung: 52 Schilling, +3 oder −1 Ehre.
- Entscheidung: Belege zur Entschädigung einreichen oder nur Kopfgeld kassieren.

## Kopfgeld: Nessa Rusk, die Pfandvögtin

Nessa Rusk, die Pfandvögtin wird wegen eines belegbaren Betrugs gesucht. Erst der Fundbeleg schaltet die Festnahme am genannten Ort frei. Bei der Abrechnung reichst du die Unterlagen für die Geschädigten ein oder lässt ihre Prüfung liegen.

- ID: `kg_kopfgeld_pfandvogt`
- Start: `case_08_closed`; neue Annahme nur vor `kapitel1_done`.
- Orte: Revier → nordtor → Revier.
- Belohnung: 64 Schilling, +3 oder −1 Ehre.
- Entscheidung: Belege zur Entschädigung einreichen oder nur Kopfgeld kassieren.

## Prüfung und Umfang

- JSON-Syntax, erlaubte Felder, lokale Dialogkanten, Namensräume und alle Referenzen.
- Flags einschließlich automatisch gesetzter Siegflags; Quellen aller Hinweise und Zutaten.
- Begehbare, erreichbare Platzierungen mit Abstand zu Türen, Ausgängen und Spawns.
- Simulierte Dialog-/Objektpfade mit den echten `GameState`-Bedingungen, beide Enden jeder Quest, beide Deduktionen, wiederholte Abrechnung, Niederlage und Flucht.
- Zustände für Pratt fort, Orsolya/Edmund/Wren/Jasper in Haft sowie laufenden Fall 9.

Kein Spiel-Build nötig: Dieses Paket wird noch nicht von `src/data/index.js` geladen. Die Laufzeitsimulation im Prüfer integriert ausschließlich eine Kopie im Speicher.
