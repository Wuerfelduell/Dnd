# DG – Das eigene Haus

Daten- und Grafiklieferung für den separaten Einbau, kein Spielcode. Basis: `6ccced920b21ee296edba27f20d5215e68b62695`. Das Büro und sein Lager bleiben eine eigene Funktion. Alle hier beschriebenen Effekte sind Vorschläge mit expliziten Grenzen, keine bereits eingebauten Mechaniken.

## Lieferumfang

- `haus.json`: Kaufgespräch (12 Zeilen), sechs Umzüge (je 3 Zeilen), sechs Karten à 32×20 Tiles mit je vier Räumen und je drei Beschreibungssätzen (72 Sätze), 40 Möbel, 32 Trophäen.
- `gaeste.json`: 12 Gäste mit je drei wählbaren Gesprächspfaden à 10 Zeilen; drei Koop-Erweiterungen mit P1, P2 und Gast.
- `gedanken.json`: 40 bedingte Heimkehrgedanken und 10 Koop-Zeilen.
- `zeitung.json`: vier Artikel; `gerede.json`: 20 Aussagen.
- Acht PNGs, Manifest, Promptprotokoll, Vorschau, Grafikprüfung und Datenprüfung. Grafikquelle: eingebauter Bildgenerator; einzeln auf Zielzellen verkleinert (Nearest Neighbor), gemeinsame 32-Farben-Palette aus `manifest-fasserin.json`, Alpha binär.

## Erwerb und derselbe Hausrat

Ab Fall 4 bietet `haus_maklerin` (Frau Leda Voss) den Vertrag in Kettlegate an. Der Kauf kostet einmalig 600 Schilling. `haus_kauf` ist der atomare Transaktionsschlüssel: Besitz prüfen, Geld prüfen, 600 abziehen, `haus_owned` setzen, vier Grundmöbel liefern. Abbruch oder fehlendes Geld ändern nichts. Wiederholte Bestätigung und Koop-Doppelklick dürfen keinen zweiten Abzug auslösen. Ein späterer Einkauf derselben Grundmöbel wird blockiert; jedes der 40 Stücke ist einmalig.

Ein gemeinsames Speicherobjekt `hausrat` enthält Besitz, Platzierungen, Trophäen, Einladungen und Tagesmarken. `haus_<city>` ist nur eine Ansicht desselben Objekts. Keine Kopie des Inventars beim Umzug. Formatvorschlag:

```json
{"owned":true,"furniture_owned":["haus_bett_p1"],"placements":[{"id":"haus_bett_p1","room":"kammer","tile":[2,12],"rotation":0}],"trophies":[],"guest_day":null,"gifts_claimed":[],"daily_claims":{},"revision":1}
```

Beim ersten Einzug vier Grundmöbel automatisch kollisionsfrei setzen: Bett P1 `[2,12]`, Bett P2 `[6,12]`, Schreibtisch P1 `[18,3]`, Schreibtisch P2 `[23,3]`. Alle besitzen 2×2 Bodenfelder. Keine Tiere oder Tiermöbel erzeugen: DF belegt nach eigener Definition einen reservierten Bereich `[10,12,3,3]` in der Kammer.

Umzug übernimmt das Objekt unverändert, wechselt Wandmaterial und spielt eine kurze Überblende. Das Sheet enthält sechs Stadtbilder (Frames 0–5); zur tatsächlichen Reise nur den Quell- und Zielstadtframe blenden, nicht sämtliche Städte als Reiseziele abspielen. Frame 0 zeigt die ersten Kisten. Während der Überblende keine Interaktionen; unmittelbar davor speichern. `haus_umgezogen` erst nach erfolgreichem Ziel-Commit setzen. Kein Umzug innerhalb einer Stadt und kein Haus als Teleport zwischen Städten.

## Eingänge und Räume

Die folgenden Positionen sind **Einbauvorschläge**; der Integrator prüft Kollisionen auf der dann aktuellen Karte, bevor er die Tür setzt. Alle Städte benutzen `spawn:[8,18]`. Rückweg ist genau der zuletzt benutzte Außeneingang. Türen erst bei Besitz anzeigen; die Maklerin bleibt zuvor erreichbar.

| Stadt | Bestehende Zielkarte | Vorschlag |
|---|---|---|
| Kettlegate | `altmarkt` | Freie Hausfront nahe Pfandhaus, ohne dessen Eingang zu ersetzen |
| Wexmoor | `wx_oberstadt` | Seitentür einer trockenen Holzfront |
| Dunscar | `ds_arbeiterbogen` | Mietshausfront abseits der Gleisübergänge |
| Calderwick | `cw_witwenterrasse` | Freie Erdgeschosstür, nicht die Standseilbahn |
| Briarholt | `bh_kutschenhof` und `bh_kutschenhof__warm` | Gleiche Tür in beiden Temperaturzuständen |
| Varrowmouth | nach CU zu binden | Oberstraße, trockener Zugang bei Ebbe und Flut; noch keine Laufzeitkarte im Basisstand |

Die gelieferten `rows` beschreiben Kollisionen: `#` fest, `.` begehbar. Böden und Wände werden über Manifestregionen gebunden. Stube oben links, Arbeitszimmer oben rechts, Kammer unten links, Keller unten rechts. Durchgänge bei x=15/y=5 und x=15/y=14 sowie y=9/x=7,8,23,24 freihalten. Die Kellerverbindung bei `[23,9]` erhält die Treppenoptik; das kompakte Raumlayout bleibt eine 32×20-Karte, keine zusätzliche Karte.

Die sechs Stadtfassungen verändern nur Wände, Fensteransicht und Texte. Beleuchtung der Laufzeit überlassen. Kellertreppen, Eingang, alle Durchgänge sowie der Laufweg zu Betten und Gast dürfen nicht blockiert werden. Nach jeder Platzierungsänderung Flood-Fill vom Eingang zu allen vier Räumen, beiden Betten und Gastplatz prüfen; ungültige Vorschau rot darstellen, ohne Daten zu schreiben.

## Stellen, Aufheben, Drehen

Raster 16×16 Pixel. `size_tiles` ist die belegte Grundfläche, Sprite-Regionen sind 32×32 einschließlich oberer Darstellung. Bodensachen belegen Felder; Teppiche liegen in einer separaten unteren Dekoschicht und dürfen unter Möbeln liegen, aber keine anderen Teppiche überdecken. Wandobjekte brauchen einen freien Wandabschnitt. Tisch-/Regalobjekte hängen an `support_id` und `slot` statt an einem freien Bodenfeld. Schreibtische bieten je zwei Tischslots, Nachttisch und Werkbank je einen; Aktenschrank, Weinregal und Vitrine bieten je zwei Regalslots. Kein Objekt ist sein eigener Träger. Aufheben eines Trägers räumt seine Aufsätze verlustfrei ins Hausinventar.

Bodenstücke erlauben Ausrichtungen 0/180 (links/rechts); dafür horizontal spiegeln, nicht das Bild auf den Kopf drehen. Wand-/Tisch-/Regalstücke bleiben bei 0. Drehen verändert weder Anzahl noch Bonus. Es kostet nichts. Unterstützte Ausrichtungen stehen je Stück in `rotation`; keine ungenannten Grafikvarianten nötig. `haus_staub` spielt einmal mit 12 fps. Ofenregionen sind Frames 8/40, 2 fps. Die Blume nutzt nur in Wexmoor `haus_pflanze_bluete_welk`, verliert keinen Bonus und erholt sich beim Wegzug. Spiegelmitte bleibt transparent.

## Herkunft und kleine Boni

Jeder `source` ist ein konkreter DG-Vorschlag, keine Behauptung über einen bestehenden Shop. Käufe werden auf die Lieferliste der jeweiligen Stadt gesetzt; Maklerin ist in Kettlegate die Ansprechperson. Fundstücke werden einmalig aus einer Hausratkiste in der Zielunterkunft geliefert. Quest-Stücke kommen nach einem abgeschlossenen Fall der genannten Stadt, Fasserin-Stücke nach einem dort abgeschlossenen Fasserin-Auftrag. Der Integrator bindet die abstrakten Ereignisse an tatsächliche Quest-/Auftrags-IDs. Bereits abgeschlossene Ereignisse beim Freischalten nachtragen; keine verpassbaren Möbel wegen Kapitelwechsel. Nach Erwerb bleiben alle Gegenstände verfügbar.

`haus_bonus_<stueck>` gilt ausschließlich, solange das Stück korrekt aufgestellt ist. Nach Laden, Umzug und Aufheben aus den Platzierungen neu ableiten; niemals dauerhaft durch Ansehen setzen. Vorschläge:

| Gruppe | Obergrenze | Auslösung |
|---|---:|---|
| Schlaf | +3 Nerven | Erster Schlaf pro Spieler und Welt-Tag |
| Heimkehr | +2 Nerven | Erste Heimkehr pro Spieler und Welt-Tag |
| Besuch | +2 Nerven | Ein abgeschlossenes Besuchsgespräch pro Spieler und Welt-Tag |
| Lesen | 1 bekannter Hinweis | Verweist nur auf bereits erschlossene Information |
| Ordnung | 2 Merkplätze | Markierungen bekannter Journaleinträge |
| Reise | 1 Ortsnotiz | Nur bereits freigeschaltete Ziele |
| Zutatenlager | 8 Plätze | Gewicht nur im Hauslager ausgesetzt |

Nerven immer auf das vorhandene Maximum begrenzen. Tagesmarken sind global, nicht je Unterkunft. Aufheben, erneutes Stellen, Speichern/Laden und Stadtwechsel setzen sie nicht zurück. Schlaf verbraucht die normale Tageszeit. Beim Entnehmen von Zutaten Gewicht vor dem Transfer prüfen; Platzmangel lässt den Gegenstand im Lager. Keine kostenlose Herstellung, keine permanenten Kampfwerte und kein Handelsbonus.

## Trophäen und Quellenabgleich

Der Basisstand hat **32 eigenständige Bosse und 46 Boss-/Phasen-IDs**, daher 32 statt ungefähr 30 Trophäen. `encounter_ids` deckt alle IDs ab, die unter `src/data` als Kampf mit `boss:true`, Name und HP definiert sind. Doppelte Zonenkopien werden zusammengefasst. `source_refs` enthält Datei und JSON-Pointer. Das umfasst auch `wilds.json`, `wexmoor.json` und `stadtgegner.json`, nicht nur Packs.

Phasen ergeben keine doppelten Wandstücke. Starling erhält `troph_starling_fight` erst nach `starling_stern`; Gallowmere, Unterschicht und Vorratsbosse erst nach ihrer letzten Phase. `unlock.encounter` ist das entscheidende Sieg-Ereignis. Vorhandene Abschlussflags erlauben Save-Backfill. Bei Bossen ohne Siegflag braucht der Einbau eine persistente Sieg-Historie: fehlende Historie darf nicht durch vermuteten Fortschritt ersetzt werden. Ein neuer Sieg kann die Trophäe dann nachtragen. Jeder Trophäenbesitz ist ein Set, kein Zähler. Nach dem ersten Zugang `haus_erste_trophaee` setzen.

32 Bilder stehen in zwei Reihen des 512×128-Atlas. Reihen 2 und 3 (nullbasiert) sind vollständig transparent; Reihe 3 ist ausdrücklich die leere Platzhalterreserve. Unverdiente Trophäen im Menü als generischen UI-Schatten darstellen, nicht als frei stehende fertige Trophäe. Die Wand paginiert 8 Trophäen pro Seite, sodass der Raum nicht alle 32 physisch aufnehmen muss. Kein Bonus aus Trophäen.

Nicht vorhandene Kapitel-6-Bosse aus CZ wurden nicht erfunden. Nach Integration neuer Bossdaten meldet `pruefen.mjs` fehlende IDs; dann gezielt nachliefern. Beispielnamen wie „Schwellenwächter“ aus der Aufgabenbeschreibung werden nicht als neue Kampf-IDs angelegt.

## Gäste und Koop

Sechs Gäste Kettlegate/Wexmoor, zwei Dunscar, zwei Calderwick, Ruben aus Briarholt und Tam Verrin aus Varrowmouth. Beziehung mindestens +4 und explizite Einladung `haus_eingeladen_<npc>`; `haus_owned` vorausgesetzt. Gast muss verfügbar, frei und in derselben Stadt sein. Keine Vorladung verstorbener, gefangener oder abgereister Figuren. Das Einladungsgespräch kostet nichts und erlaubt das Zurücknehmen der Einladung. Tam bleibt deaktiviert, bis CX sie tatsächlich installiert. Für Calderwick/Briarholt/Tam müssen fehlende AZ-Beziehungseinträge ergänzt werden; sie starten neutral, nie automatisch bei +4.

Höchstens ein Gast pro Welt-Abend, auch bei Stadtwechsel. Auswahl nach längster Besuchspause, dann NPC-ID. Vor Ankunft Bedingungen erneut prüfen. Ablehnen kostet keine Beziehung und verbraucht keinen Geschenkanspruch; der Abend bleibt dennoch für weitere Gäste gesperrt. Ein bereits eingetroffener Gast wartet bis Gespräch oder Tageswechsel. Tageswechsel entfernt den Gast; keine Strafe. Gespräche spoilern keine unbekannten Beweise und geben keine automatischen Schlüsse.

Geschenk erst am gemeinsamen Abschlussknoten, atomar zusammen mit `haus_geschenk_<npc>`; einmal pro Kampagne und gemeinsamem Haushalt. Alle zwölf Geschenke verwenden vorhandene `src/data/items.json`-IDs. Voller Rucksack: Geschenk in einer Hauslieferbox vormerken; Claim-Flag und Boxeintrag atomar, nicht erneut verschenken. Nach erfolgreichem Gespräch `haus_erster_gast` setzen.

Koop: Haushalt und Trophäenwand gemeinsam, Betten und Schreibtische getrennt. Interagierender Spieler wählt; P2 sieht dieselben drei Antwortmöglichkeiten und die getroffene Wahl. Für Holt, Pfiff und Tam gibt es einen zusätzlichen Einstieg zu dritt. Beziehung +4 bei einem anwesenden Spieler genügt. Geschenke nicht verdoppeln; Nervenboni pro Spieler separat und nur für Anwesende. Gleichzeitige Möbeländerungen serialisiert mit `revision` vergleichen; Verlierer einer Revision lädt neu. Bei Disconnect keine automatische zweite Transaktion. Ein Gespräch zu dritt beginnt nur, wenn beide Spieler im Haus sind.

Endkategorien in `gedanken.json` sind explizite DG-Zuordnungsaufträge an den Integrator (einschließlich Verzicht), keine erfundenen existierenden Endflags. Ohne Bindung nicht anzeigen. Zeitungsartikel und Gerede ausschließlich bei passenden Flags; die Tierzeile erst mit DF.

## Prüfung

```sh
python tools/art/haus/check.py
node docs/story/eigenes_haus/pruefen.mjs
```

`check.py` schreibt `docs/art/batch-haus-validation.json`. `pruefen.mjs` prüft Mengen, Graphpfade, Geschenke, Layout-Erreichbarkeit, Quellenpointer, vollständige Bossabdeckung, Sprite-Regionen und die drei Koop-Varianten. Bewusst keine Laufzeittests: Dieses Paket wird noch nicht vom Spiel geladen.
