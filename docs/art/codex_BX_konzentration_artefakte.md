# Codex-Batch BX: Icons für die Konzentrations-Artefakte

**Batch-Name:** `konzentration` · Zielordner: `public/sprites/items/<id>.png` (16×16) und `public/sprites/items/32/<id>.png` (32×32, optional)

Seit PR „Konzentrations-Artefakte mit harten Nachteilen“ gibt es 16 Artefakte, die im Kampf Konzentration bringen (Höchstwert, Rundenstart, Angriff) und dafür brutale Flüche tragen (`src/data/pathways.json` → `artifacts.list`, Feld `konzentration: true`). Im Spiel laufen **Platzhalter**: jedes Icon ist eine Kopie eines bestehenden Item-Bildes (Spalte „Platzhalter“). Dieses Paket ersetzt sie 1:1, die Dateinamen bleiben.

## 0. Regeln

- Style-Block wie in `codex_BP_kontrollverlust_grafik.md` (Abschnitt 0.1) vor jeden Prompt setzen.
- 16×16 Pixel, transparenter Hintergrund, 1px Outline #1a1c2c, max. 3 Schattenstufen, kein Text.
- Okkult-Türkis #6fe0d0 und Violett nur sparsam als Akzent (Konzentration = kühler, klarer Glanz; Flüche = ein roter oder violetter Störpunkt).
- Alle 16 Icons in **einem** Sheet `items/BX_konzentration_icons.png` (4×4 Raster, Reihenfolge wie unten) **plus** Einzeldateien.

## 1. Icons

| # | Datei (`items/<id>.png`) | Name | Herkunft | Platzhalter (jetzt) | Prompt-Kern |
|---|---|---|---|---|---|
| 1 | `siebter_fingerring` | Ring für den siebten Finger | Asservatenkammer (Thale, Revier) | `siegelring.png` | schmaler Silberring mit einem siebten „Finger“-Abdruck innen, leicht verbogen, kaltes Blaugrau |
| 2 | `metronom_ohne_feder` | Metronom ohne Feder | Asservatenkammer (Thale, Revier) | `taschenuhr.png` | kleines Holz-Metronom ohne Pendelfeder, offener Kasten, ein verbogener Zeiger, Messingbeschlag |
| 3 | `schlagzaehler` | Schlagzähler des Preisboxers | Asservatenkammer (Thale, Revier) | `messingschlagring.png` | Messing-Zähler am Lederriemen, zwei kleine Ziffernräder (ohne lesbare Zahlen, nur Kerben), abgenutzt |
| 4 | `hohle_krone` | Die hohle Krone | Asservatenkammer (Thale, Revier) | `kupferkrone.png` | dünne Blechkrone, innen sichtbar hohl und dunkel, eine Zacke eingeknickt, matt-kupfern |
| 5 | `tickender_zahn` | Der tickende Zahn | Beute in Gefahrengebieten | `schlickzahn.png` | großer gelblicher Backenzahn mit einem feinen Riss, aus dem ein winziges Zahnrad blitzt |
| 6 | `nadel_der_naeherin` | Nadel der Näherin | Beute in Gefahrengebieten | `haarnadel.png` | lange Stopfnadel mit rotem Faden, der sich zu einer Schlinge legt, Stahl mit Rostpunkt |
| 7 | `gedankenkaefig` | Der Gedankenkäfig | Beute in Gefahrengebieten | `kette_rauchfass.png` | faustgroßer Drahtkäfig, leer, Tür offen, schwach türkisfarbener Schimmer innen (#6fe0d0) |
| 8 | `stummer_chor` | Der stumme Chor | Beute in Gefahrengebieten | `puppenglas.png` | kleines Glasgefäß mit zwölf winzigen Figuren mit offenem Mund, Korken, Glasreflex |
| 9 | `zweites_herz` | Das zweite Herz | Beute in Gefahrengebieten | `wachsherz.png` | Herz aus Torf, mit Draht umwickelt, ein violetter Puls-Riss (#5a2a7a) |
| 10 | `rangierlinse` | Die Rangierlinse | Beute in Gefahrengebieten | `linsenscherbe.png` | runde rote Signallinse mit Riss, Messingfassung, ein Lichtpunkt in der Mitte |
| 11 | `kreidezirkel` | Kreidezirkel des Rechenmeisters | Geheime Treffen | `kreidestummel.png` | Zeichenzirkel aus Messing, eine Spitze durch ein Kreidestück ersetzt, Kreidestaub |
| 12 | `sanduhr_voll_asche` | Sanduhr voll Asche | Geheime Treffen | `knochenmehl.png` | kleine Sanduhr mit grauer Asche statt Sand, Holzgestell, rieselnde Säule |
| 13 | `uhrwerkherz` | Uhrwerkherz | Geheime Treffen | `zahnrad_klein.png` | Herz aus Zahnrädern und Messingblech, kleiner Aufziehschlüssel seitlich, ein roter Tropfen |
| 14 | `knoechelrosenkranz` | Rosenkranz aus Fingerknöcheln | Geheime Treffen | `knochenwuerfel.png` | Schnur mit zwölf kleinen Fingerknöcheln (bone white), eine Quaste, leicht gebogen |
| 15 | `kerzenkrone` | Krone aus sieben Kerzen | Geheime Treffen | `kerze_schwarz.png` | Metallreif mit sieben schwarzen Kerzenstummeln ohne Flamme, nur Glut-Punkte in Amber |
| 16 | `aschestundenglas` | Stundenglas aus Knochenasche | Geheime Treffen | `grubenglas.png` | Stundenglas aus trübem grau-weißem Glas (Knochenasche), eine einzige Rinne, Holzfüße |

## 2. Kontext je Artefakt (für den Prompt-Text)

### Ring für den siebten Finger (`siebter_fingerring`)
Ein Ring, der an keinen deiner Finger passt. Trag ihn trotzdem bei dir: Er sucht sich einen Platz, den du nicht siehst.
- Segen: +1 Höchstwert Konzentration.
- Flüche: −15 Leben. Unruhe steigt langsam, solange du ihn trägst.

### Metronom ohne Feder (`metronom_ohne_feder`)
Ein Metronom, dem jemand die Feder gezogen hat. Es schlägt trotzdem, aber erst, wenn man es eine Weile angestarrt hat.
- Segen: Zu Beginn jeder weiteren Runde +1 Konzentration.
- Flüche: Du beginnst jeden Kampf ohne Konzentration. Nerven erholen sich nur halb so schnell. Du nimmst 15 % mehr Schaden.

### Schlagzähler des Preisboxers (`schlagzaehler`)
Ein Messingzähler, den ein Boxer am Handgelenk trug. Er zählt jeden Treffer mit, und solange er zählt, denkt man nicht an Rückzug.
- Segen: Jeder einfache Angriff bringt +1 Konzentration mehr.
- Flüche: Du kannst aus keinem Kampf fliehen. Du nimmst 25 % mehr Schaden.

### Die hohle Krone (`hohle_krone`)
Eine Krone aus dünnem Blech, innen leer. Wer sie bei sich trägt, denkt in geraden Linien und vergisst, dass ein Körper dazugehört.
- Segen: +3 Höchstwert Konzentration. Zu Beginn jeder weiteren Runde +1 Konzentration.
- Flüche: −30 Leben. Du nimmst 30 % mehr Schaden. Jeder am Rundenende ungenutzte Punkt Konzentration kostet 1 Leben. Heilmittel wirken nur halb.

### Der tickende Zahn (`tickender_zahn`)
Ein Backenzahn, in dem etwas tickt. Legt man ihn ans Ohr, zählt er mit, und man kann nicht aufhören mitzuzählen.
- Segen: Zu Beginn jeder weiteren Runde +1 Konzentration.
- Flüche: Jeder am Rundenende ungenutzte Punkt Konzentration kostet 3 Leben. −15 Nerven.

### Nadel der Näherin (`nadel_der_naeherin`)
Eine Stopfnadel, die jemand sechzig Jahre lang zwischen den Lippen hielt. Mit ihr in der Tasche ist man vom ersten Herzschlag an bei der Sache. Dann näht sie weiter.
- Segen: Jeder Kampf beginnt mit +2 Konzentration.
- Flüche: Jede Kampfrunde kostet 4 Nerven. Nerven erholen sich 30 % langsamer.

### Der Gedankenkäfig (`gedankenkaefig`)
Ein Käfig aus Draht, so groß wie eine Faust, mit nichts darin. Wer ihn trägt, hat Platz im Kopf für mehr. Für anderes bleibt keiner.
- Segen: +3 Höchstwert Konzentration.
- Flüche: Im Kampf kannst du keine Gegenstände benutzen. Paraden bringen keine Konzentration. −20 Nerven.

### Der stumme Chor (`stummer_chor`)
Ein Glasgefäß mit zwölf winzigen Figuren, die alle den Mund offen haben. Man hört nichts. Man denkt nur klarer, und jede Anstrengung hallt nach.
- Segen: +2 Höchstwert Konzentration. Jeder Kampf beginnt mit +1 Konzentration.
- Flüche: Fertigkeiten kosten doppelt so viele Nerven. Unruhe steigt, solange du es trägst.

### Das zweite Herz (`zweites_herz`)
Ein Herz aus Torf und Draht, das im Takt des eigenen schlägt, nur schneller. Es gibt viel und behält nichts.
- Segen: Zu Beginn jeder weiteren Runde +2 Konzentration.
- Flüche: Am Rundenende verfällt alle übrige Konzentration. Jeder ausgegebene Punkt Konzentration kostet 2 Leben. Heilmittel wirken 30 % schwächer.

### Die Rangierlinse (`rangierlinse`)
Eine Signallinse aus der Rangierwüste, rot und rissig. Durch sie sieht man nur das Ziel. Alles andere kommt näher, ohne dass man es merkt.
- Segen: +2 Höchstwert Konzentration. +10 % Schaden.
- Flüche: Gegner schlagen jede Runde 8 % härter zu. Du kannst aus keinem Kampf fliehen. Unruhe klingt nur halb so schnell ab.

### Kreidezirkel des Rechenmeisters (`kreidezirkel`)
Ein Zirkel mit Kreide statt Spitze. Wer ihn trägt, rechnet jeden Schlag voraus. Nur die eigenen Füße kommen in der Rechnung nicht vor.
- Segen: Paraden bringen +1 Konzentration. Zu Beginn jeder weiteren Runde +1 Konzentration.
- Flüche: Ausweichfenster −40 %. Beute bringt 30 % weniger Geld.

### Sanduhr voll Asche (`sanduhr_voll_asche`)
Eine Sanduhr, gefüllt mit der Asche von jemandem, der nie wartete. Sie rieselt immer. Je länger ein Kampf dauert, desto lauter.
- Segen: Zu Beginn jeder weiteren Runde +1 Konzentration. +1 Höchstwert Konzentration.
- Flüche: Gegner schlagen jede Runde 6 % härter zu. Nerven erholen sich 40 % langsamer.

### Uhrwerkherz (`uhrwerkherz`)
Ein Uhrwerk in Herzform, das aufgezogen werden will. Es treibt an, Schlag für Schlag, und nimmt sich dafür ein wenig Blut.
- Segen: Zu Beginn jeder weiteren Runde +1 Konzentration. Jeder einfache Angriff bringt +1 Konzentration mehr.
- Flüche: Jeder ausgegebene Punkt Konzentration kostet 1 Leben. Ansehen sinkt 50 % schneller. −10 Leben.

### Rosenkranz aus Fingerknöcheln (`knoechelrosenkranz`)
Zwölf Fingerknöchel auf einer Schnur. Wer sie beim Zuschlagen durch die Hand gleiten lässt, bleibt bei der Sache. Abwehr zählt der Rosenkranz nicht.
- Segen: Jeder einfache Angriff bringt +1 Konzentration mehr. +1 Höchstwert Konzentration.
- Flüche: Paraden bringen keine Konzentration. Nerven erholen sich nur halb so schnell.

### Krone aus sieben Kerzen (`kerzenkrone`)
Ein Reif mit sieben Kerzenstummeln, die ohne Flamme brennen. Was man nicht ausgibt, verbrennt.
- Segen: +2 Höchstwert Konzentration. Jeder einfache Angriff bringt +1 Konzentration mehr.
- Flüche: Jeder am Rundenende ungenutzte Punkt Konzentration kostet 2 Leben. Geistsicht kostet 50 % mehr Nerven.

### Stundenglas aus Knochenasche (`aschestundenglas`)
Ein Stundenglas aus Glas, das man aus Knochenasche geschmolzen hat. Es misst nur die eine Runde, dann ist alles, was man gesammelt hat, weg.
- Segen: +1 Höchstwert Konzentration. Zu Beginn jeder weiteren Runde +1 Konzentration.
- Flüche: Am Rundenende verfällt alle übrige Konzentration. Jede Kampfrunde kostet 3 Nerven.

## 3. Einbau nach Lieferung

1. PNGs nach `public/sprites/items/` (und `items/32/`) kopieren, Dateinamen = Artefakt-Id.
2. Für 32er-Fassungen die Ids in `ICON32` (`src/world/assets.js`) ergänzen.
3. `npm test` (tests/sprites.test.js prüft, dass jedes Item ein Icon hat).
