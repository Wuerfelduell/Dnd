# CZ – Varrowmouth: Gegner und Bosse

Reines Lieferpaket, kein Laufzeit-Einbau. `encounters.json` und `bosses.json` sind ID-Objekte wie die K5-Vorlagen; `encounters.json` dort ist aktuell leer. Basisschema (`name`, `sprite`, `hp`, `armor`, `attacks`, `loot`, `on_win`, `lose_to`) bleibt erhalten. Zusätzliche Felder sind ein expliziter Einbauvertrag und werden nicht als bereits unterstützte Engine-Funktionen ausgegeben.

| Datei | Inhalt |
|---|---|
| encounters.json | Sechs normale Formen einschließlich Salzkrusten-Rest und eine Elite |
| bosses.json | Drei Bosse, Phasen, Auslöser, Vorbereitung, friedliche Ausgänge |
| bestiarium.json | Zehn Beschreibungen mit Schwächen und Bildverweisen |
| status.json | Verzeichnet, gefesselt, geblendet |
| pruefen.mjs | Schema-, Referenz-, Pflichtumfang- und Schadensdeckelprüfungen |
| pruefbericht.json | Gespeicherte Ausgabe einschließlich externer Abhängigkeiten |

## Anschluss

- CU liefert Karten und Itemdefinitionen. `vmi_zollsiegel` und `vmi_registerseite` sind ausdrücklich in CU vereinbart. Der Namenlos-Ring wird über `CU_namenlos_ring` semantisch referenziert, bis CU seine konkrete Item-ID veröffentlicht; keine konkurrierende Definition in CZ. Vorhandene Beute-IDs werden gegen `src/data/items.json` geprüft.
- CT bindet die vier Fährten aus Akt IV, Osrics Beziehung, den Ratszeugen, die Glockenvorbereitung und die Dialogwahl `register_vorlesen`. Semantische Eingänge in `trigger`, `peace` und `preparation_effect` sind keine erfundenen Story-Flags. Die Glockenbedingung gehört CU, ihre Story-Ansteuerung CT.
- CZ setzt nur `k6_cz_wrackmutter_beendet`, `k6_cz_leuchtfeuerwaechter_beendet`, `k6_cz_pegelherrin_beendet`. Gewinnen und friedlich lösen geben dieselbe einmalige Beute und dasselbe Boss-Abschlussereignis. `k6_done`, Register schließen/verbrennen/übergeben/teilen und Sequenz 1 gehören CT/DD und werden hier nicht automatisch vergeben.
- CY liefert `battle/enemy_pegelherrin.png` und `battle/enemy_pegelherrin_register.png`; CZ zeichnet sie nicht. Die Effekte Stempel und Schwall sind auch der Pegelherrin zugeordnet, CY besitzt zusätzlich die Namenslinien.
- Sprite-Schlüssel `enemy_<id>` müssen beim Einbau mit dem Manifest verbunden werden. Status, Rundentakt, Phasentransitionen, Resistenzmultiplikatoren und Schadensdeckel sind ausdrücklich neue Adapteraufgaben.

## Runden, Schaden und Koop

Eine volle Runde umfasst die Aktionen aller lebenden Spieler und Gegner. `damage_range` wird einmal je Treffer ausgewürfelt; `damage` ist der numerische Basiswert für das bestehende Format, kein zusätzlicher Treffer. `nerve_damage` gilt einmal je Attacke und Ziel, nicht pro Timingpunkt. Resistenzwerte sind Multiplikatoren (kleiner als 1 = resistent). Gezielte Angriffe wählen einen lebenden Spieler, `all_players` trifft jeden einmal.

Der eingehende Deckel wird nach Rüstung/Resistenzen angewandt und ist pro Gegner und voller Runde gemeinsam für alle Spieler, Treffer, kritischen Treffer, Begleiter, Rückschaden und Schaden über Zeit. Überschuss verfällt, Soforttötungen unterliegen ebenfalls dem Deckel. Dadurch können auch zwei Spieler die Mindestdauer nicht umgehen. Ein neuer Gegner handelt erst in der nächsten vollen Runde. Die K6-Rundenmodelle sind Spezifikation, keine Behauptung über das derzeitige Echtzeit-Kampfsystem.

Normale Gegner benötigen mindestens vier Schadensrunden, Bosse mindestens fünf. Der Krähenschwarm erhält höchstens 50 Schaden pro Runde und flieht bei 200/400 HP frühestens in Runde vier. Beim Leuchtfeuerwächter erlauben 168 Schaden pro Runde den Bruch bei 560/1400 HP frühestens in Runde fünf. Beide Pegelherrin-Phasen haben eigene Deckel (320 beziehungsweise 440) und eigene fünf Runden. Freiwillige Flucht, friedliche Lösungen und gezeitenbedingter Abbruch sind keine Niederlage durch Schaden und dürfen früher enden.

Salzkruste zahlt Beute erst nach beiden Resten, genau einmal. Gerufenes Tauwerk gibt keine Beute. Krähen stehlen maximal einen Vorrat pro ganzem Kampf, niemals Questobjekte oder Ausrüstung. Das Elite-Buff stapelt nicht und heilt nicht; fallen beide gleichzeitig, gibt es keinen Empfänger.

## Phasen und Status

Der Leuchtfeuerwächter wird bei 40 Prozent angehalten: Schaden auf die Schwelle klemmen, ausstehende Treffer und Schaden über Zeit verwerfen, Debuffs auf den Spielern löschen. Der Mensch greift nicht an. Erst eine bewusste Entscheidung (Verschonen oder Treffer) beendet den Kampf. Beides gewährt dieselbe einmalige Belohnung.

Vor der zweiten Pegelherrin-Phase prüft CT alle vier Fährten und Beziehung Osric ≥ 3. Die Vorlesen-Option muss bewusst gewählt werden; sie überspringt Phase 2. Ohne Wahl startet Phase 2 mit 2200 HP, ohne überlaufenden Schaden. Eintragen ersetzt jede dritte Gegneraktion und sperrt eine ausgerüstete, noch freie Fähigkeit; im Koop wechseln die lebenden Zielspieler. Grundangriff, Verteidigen, Gegenstände und Dialog bleiben immer verfügbar. Bei fehlender Fähigkeit erfolgt ein Registerschnitt.

**Auflösung der widersprüchlichen Dauerangabe:** „bis Kampfende“ hat keine halbierbare Rundenzahl. Unvorbereitet bleibt die Sperre wie gewünscht bis Kampfende. Ring oder Ratszeuge begrenzen sie auf drei volle Zielrunden; als halbierte Referenz dienen sechs Runden (zwei Eintragen-Takte). Beide Gegenmittel zusammen verkürzen nicht weiter. Diese konkrete Designentscheidung muss beim Einbau übernommen oder bewusst angepasst werden; keine Berechnung aus einer unbekannten zukünftigen Kampfdauer. Die Dauer beginnt nach der Anwendungsrunde zu zählen.

Verzeichnet verbietet nur freiwillige Flucht für drei Zielrunden. Gefesselt verbraucht die nächste Aktion, danach eine Runde Immunität gegen erneutes Fesseln. Geblendet senkt zwei Runden die Trefferchance auf 70 Prozent, verdeckt niemals Timing-Hinweise. Status stapeln nicht; Refresh/Ignore ist je Status angegeben. Alle Sperren und Status enden bei Kampfende, Abbruch oder Niederlage.

Gezeitenwechsel hat Vorrang vor Fluchtsperren: Im Wrackfeld und Registerkeller führt Flut zur straflosen Evakuierung nach CU, ohne Beute. Beschwörungen und Sperren verschwinden; ein erneuter Versuch startet vollständig neu. Leuchtbank bleibt während beider Gezeiten nutzbar, Gezeitenläufer erscheinen draußen nur bei Flut. Keine Rückreise in frühere Städte.

## Grafik und Prüfung

Manifest: `public/sprites/manifest-varrowmouth4.json`. Zehn Kampf-Sheets einschließlich der wehrlosen Menschenphase, sieben Karten-Sheets, sieben Köpfe und sieben Bestiariumsbilder, neun Effekte und ein Wrack-Prop: **41 PNGs**. Der Krähenschwarm nutzt 32×32-Zellen in einem 128×128-Sheet; die übrigen Kartenfiguren 16×32-Zellen in 64×128. Köpfe/Bestiarium sind zugeschnittene und mit Nearest Neighbor skalierte Idle-Posen, Herkunft im Manifest. Lichtkegel: vier 480×270-Alpha-Frames als 1920×270-Streifen. Keine optionalen Varianten.

```sh
python tools/art/varrowmouth4/check.py
node docs/story/k6_gegner/pruefen.mjs
```

Die Prüfungen kontrollieren Dateien und Verträge inklusive adversarialer Solo-/Koop-Schadensfolgen. Sie ersetzen keinen späteren Gameplay-Balancing-Test nach dem Einbau. Fremdpaket-Abhängigkeiten werden sichtbar ausgegeben und nicht als integrierte Funktion gewertet.
