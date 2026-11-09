# Paket AM: Drei Orte und „Das Grab ohne Namen“

> **Eingebaut** (zusammen mit den Grafiken aus AN): Die JSON-Dateien liegen unter `src/data/packs/k2_orte/`, dazu `pins.json` mit den vorgeschlagenen Pins. `buildContent` hängt `maps`, `zone`, `travel` und `pins` an Wexmoor und `artifacts.list` an die Artefakte. Auftragsgegenstände sind `kind: key`. Die Torfbrüche lassen zusätzlich das Namenstäfelchen fallen (wie alle Gefahrengebiete). Offen: AN-Tilesets und -Props sind noch nicht auf die Karten gelegt, die Karten nutzen weiter vorhandene Kacheln.

Fertige Inhaltsdaten zur separaten Integration. Basis und abschließend abgeglichener Stand: `main` bei `e90e5b040f9c3b6ae66c0edd55bad3f7de29a867`, Prompt `docs/art/codex_AM_k2_orte.md` mit Blob `4db1bd5396d307b2b0d2c6708e5d84f36feec07e`. Alle Änderungen dieses Pakets liegen in diesem Ordner. Keine Laufzeitdateien, Grafiken oder fremden Pakete werden geändert.

## Inhalt

| Datei | Zweck |
|---|---|
| `quests.json` | Vier verkettete Nebenaufträge ab `k2_akt3_done` |
| `dialogues.json` | Jonas, Agathe, Corvin, Brautbecken und Täfelchenplatz; 5 Dialoge |
| `dialog_zusaetze.json` | Leeres Objekt, keine Änderung bestehender Gespräche |
| `npcs.json` | Drei fest vereinbarte Figuren mit Palette |
| `case.json` | Drei neue Fakten, vier Hinweise, keine Deduktionsänderung |
| `items.json` | Sechs feste Beute-/Auftragsgegenstände und ein Schlüssel |
| `encounters.json` | Leeres Objekt; die fünf Zonenbegegnungen stehen ausschließlich in `zone.json` |
| `platzierung.json` | Jonas und vier Eingänge auf bestehenden Karten |
| `maps.json` | Drei vollständige Karten einschließlich Deko, Lichtern, Streifen und insgesamt 25 Lesetexten |
| `travel.json` | Floßfriedhof und Zugang zum Lichtamt; Torfbrüche kommen aus `zone.travel` |
| `zone.json` | Tier 3, vier Monster mit Elite-Vorlagen, Moorbraut, Beute, Flucht und Niederlage |
| `artifacts.json` | `artifacts.list`-Fragment für `brautkranz`, mit Vor- und Nachteilen |
| `grafikwuensche.md` | Ein zusätzlicher Icon-Wunsch und vorhandene Platzhalter |
| `offene_punkte.md` | Konkrete Einbaureihenfolge, Kartenmarker, Grafikzuordnung und optionale Storyverknüpfung |
| `pruefen.mjs` | Prüfung mit Node ohne Abhängigkeiten, einschließlich echter Inhaltslader-Probe im Speicher |

## Geschichte und Abgrenzung

Marta Vennick war Grubenvermesserin. Vor zweihundert Jahren starb sie am Morgen ihrer Trauung beim Einsturz eines ungestützten Torfbruchs, den sie zuvor beanstandet hatte. Das Lichtamt ließ ihre Warnung durch Tilgung ihres Namens als unzuordenbar ablegen. Der Leib wurde vom bereits vorbereiteten Floßgrab zurück ins Moor gebracht. Der Amtsring hält den Bann, nicht eine freiwillige Bindung an das Amt.

Brandt hat die alte Sperre vor zwölf Jahren erneuert. Sie wird damit für die Fortsetzung einer Vertuschung verantwortlich, nicht rückwirkend zur Täterin eines zweihundert Jahre alten Todes gemacht. Der neue Fakt ersetzt weder Haftregister noch Ratsbuch, Starling, Hale oder die Voraussetzungen der vier Hauptstory-Enden.

Die Untersuchung betrifft einen historischen Arbeitsunfall, seine Verwaltung und eine Bestattungsentscheidung. Sie übernimmt weder die Rettung Elsbeth Rowes noch das verlorene Kind, den Hausnamen, die Ratsnamen, den Leuchtturmwärter oder die Lichtlosen-/Salzbrüder-Aufträge. Die Täfelchengilde wird nicht angelegt; ihre möglichen Anschlüsse bleiben in den offenen Punkten.

## Ablauf und Belohnungen

| Auftrag | Erforderlicher Fund / Entscheidung | Abschluss und einmalige Belohnung |
|---|---|---|
| `k2o_ring_im_torf` | Ringabdruck und Fährmarke am sicheren Sichtsteg prüfen | Agathe: 12 Schilling, Auftrag 2 |
| `k2o_leeres_floss` | Schabspuren und Überführungsquittung vergleichen | Agathe: 16 Schilling, Bestatterschlüssel, Auftrag 3 |
| `k2o_gestrichene_braut` | Corvin schützen oder bedrohen; Trauregister und Fortgeltung lesen | Jonas: 20 Schilling, Auftrag 4 |
| `k2o_grab_ohne_namen` | Ringbann im Bosskampf brechen, anschließend endgültig entscheiden | Einer der drei Abschlüsse unten |

Corvin hilft bei einem Schutzversprechen (+1 Ehre). Eine Drohung führt zum Verrat (Fahndung mindestens 2, −2 Ehre, Rückkehr in die Oberstadt). Er nennt die Fundstellen vorher, daher bleibt der Auftrag über den Schlüsselzugang lösbar. Die Entscheidung ist einmalig. Spätere Verhaftungen verwenden die bestehende Wexmoor-Polizei; die Kette setzt weder Begleiter noch Zunders Anwesenheit voraus.

| Ende | Ort und Handlung | Belohnung | Konsequenz |
|---|---|---|---|
| Namen zurückgeben | Täfelchen auf Floß 17 beschriften und Ring befestigen | 20 Schilling, +6 Ehre, `brautkranz` | Der Grabplatz bekommt Gewicht; Agathe reagiert darauf |
| Im Moor lassen | Ring am Brautbecken zurücklegen | 30 Schilling, +1 Ehre | Marta bleibt unter dem Moor; das Floß bleibt leer |
| Ring verkaufen | Corvins Angebot im Lichtamt ausdrücklich annehmen | 75 Schilling, −5 Ehre | Ring im Amt, Name weiter gestrichen; Agathe missbilligt es |

Alle Abschlüsse verbrauchen genau einen Ring, setzen `k2o_ende` und genau ein Endflag und beenden Auftrag 4. Jede Entscheidung hat einen Bestätigungsschritt ohne Vorabverbrauch. Wissen und Hinweise bleiben auch beim Verkauf erhalten. Der Verkauf ist nach `k2_end_rein` oder `k2_end_moor` gesperrt; die beiden anderen Abschlüsse bleiben möglich. Ein neuer Kettenstart ist nach `kapitel2_done` gesperrt, eine bereits aktive Kette bleibt abschließbar.

Der Brautkranz gibt +15 maximale Nerven und +20 % Heilmittelwirkung, kostet aber 8 maximale Leben. Er ist eine feste Belohnung ausschließlich des Namens-Endes, kein zufälliger Zonenfund. Ring und Schlüssel sind gewichtlose Auftragsgegenstände. Agathe ersetzt einen fehlenden Schlüssel ohne Geldvoraussetzung.

## Karten

Alle Koordinaten sind Kacheln, nullbasiert. Bodenzeichen: `P` auf `r_torf`, `w` auf `r_wachhaus`, `s` auf `g_katakomben`. Wasser `~`, Innenwände `I` und Einsturzschutt `r` bleiben gesperrt. Die Prüfung behandelt solide Deko-Kacheln vorsichtig als vollständig blockiert.

| Karte | Aufbau | Einstieg / Ausstieg |
|---|---|---|
| `wx_flossfriedhof`, 40 × 18 | Fünf Grabflöße, breiter Hauptsteg, Leichenhaus rechts oben; Grabsteine mit `cover: true`; eine Grauspäher-Streife | Spawn (2,9), Tür (0,9) nach `wx_pfahldorf/default` |
| `wx_lichtamt`, 32 × 20 | Halle unten, Archiv oben links, Kartenraum oben rechts; drei gerade Streifenrouten, Regale als Deckung | Hauptspawn (4,17), Seitenspawn (28,17); zwei freie Ausgänge nach `wx_oberstadt/default` |
| `wx_torfbrueche`, 48 × 30 | Sichtsteg am Eingang; fünf Stollenkammern, Grubenwasser, Einstürze, Gasnest-Lesestelle; sechs normale Roamer | Spawn (2,14), Tür (0,14) nach `wx_torfstich/default`; Brautbecken (39,25) |

Der Pförtner verwendet die bereits vorhandene Figur `grauspaeher`. Die Kontrolle findet an der Außentür statt. Nur das **angezogene** Gewand (`k2_wear_akademierobe`) erfüllt den Haupteingang. Der Seiteneingang verlangt Agathes Schlüssel. Das Stadtkarte-Ziel „Das Lichtamt: Zugang“ führt ausdrücklich in die Oberstadt, damit die Zugangssperre auch bei Schnellreise gilt. Die Markerzuordnung steht in `offene_punkte.md`.

Die Moorbraut ist eine bewusste Begegnung am Dialogobjekt, kein automatisch angreifender Roamer. Sie kann erst nach Auftrag 3 herausgefordert werden. Der Kampf ist nach `won_moorbraut` nicht erneut anwählbar; Niederlage lässt den Versuch offen. Das Becken bleibt danach für die Entscheidung zugänglich. Es gibt keine Zufallsdroprate für den Ring.

## Kampfwerte

| Gegner | LP | Angriffsschaden pro Treffer und Zeitpunkte in ms | Beute |
|---|---:|---|---|
| Torfleiche | 50 | 6 bei 850/1350; 10 bei 1500; 14 bei 2200 | 5–11 Schilling, Torfbernstein 6 % |
| Grubenlicht | 44 | 4 bei 700/1050/1400; 9 bei 1300; 14 bei 2200 | 5–11, Grubenglas 65 %, Bernstein 4 % |
| Torfwurm | 52 | 6 bei 900/1400; 10 bei 1500; 15 bei 2300 | 5–11, Wurmseide 70 %, Bernstein 4 % |
| Schlickhund | 46 | 5 bei 750/1100; 9 bei 1300; 13 bei 2100 | 5–11, Schlickzahn 75 %, Bernstein 4 % |
| Moorbraut | 154 | 8 bei 950/1500; 4 bei 650/950/1250/1550/1850; 11 bei 1400; 17 bei 2400 | 45–60, Schleier 100 %, Bernstein 25 %, Ring garantiert über `on_win` |

Vergleich: Salzwatt-Monster 40–46 LP, Glockenmutter und Bürgermeister 140 LP. Die Moorbraut hat 10 % mehr LP als die Glockenmutter; der schwerste Treffer steigt von 16 auf 17, mit längerem Vorlauf. Normale Eliten verwenden vorhandene Faktoren 1,5 LP und 1,3 Schaden. Zusätzlicher Elite-Bernstein: 15 %. Kein neuer Statuseffekt, keine neue Kampfmechanik, keine behauptete zweite Bossphase.

## Prüfen

Im Repository ausführen:

```sh
node docs/story/k2_orte/pruefen.mjs
```

Das Skript prüft JSON, IDs und die ausdrücklich zugelassenen Fest-IDs, Dialogkanten, Flag-Produzenten, Referenzen, Kartenbreiten, Boden, Erreichbarkeit, gerade Patrouillenabschnitte und Anschlusskacheln. Sechs Datenabläufe prüfen die Corvin-/Endvarianten einschließlich Frühzugriff, Schlüsselverlust, Niederlagen-Retry, wiederholtem Lesen, Zustandsserialisierung und gesperrten Wiederholungsauszahlungen. Die vier Hauptstory-Endflags werden gesondert geprüft.

Zusätzlich setzt der **echte** `buildContent` die Karten/Zone/Artefakte mit `applyQuestPack` im Speicher zusammen. Prüfausgaben sind in der PR-Beschreibung. Diese Prüfungen ersetzen keinen visuellen Phaser-Spieltest und keine Kontrolle der tatsächlich geladenen AN-/AO-Grafiken. Das Paket ist absichtlich noch nicht im Spiel registriert.
