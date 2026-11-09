# Balancing AF

Reproduzierbarer Entwurf, kein Nachweis einer fertig balancierten Kampagne. Erzeugung: `node docs/story/sequenzen/balancing.mjs > docs/story/sequenzen/balancing.md`.

## Rechenbasis

Die Tabelle führt echte `Combat.useSkill`- und `endRound`-Aufrufe aus. Jede Fertigkeit wird auf ihrer Freischaltsequenz mit Dienstschlagstock (6 Angriff), allen bis dahin erworbenen Pfadpassiven, vollen Nerven, 6 Konzentration, ohne Kleidung/Artefakte, ohne vorherige Schwachstelle und ohne Gegnerschutz gerechnet. Alle Takttreffer sind `good`. Der Prüfgegner lebt lang genug für alle Brandrunden. Dies ist Einzelanwendungs-Schaden, kein Schaden pro Runde.

Normal/okkult bezeichnet den Gegner, nicht den Angriff. Bei Flat-Skills: pro Treffer `round(flat × Timing × holy × occult_mult × dmg_mult × vorhandene Schwachstelle)`. Bei Waffen-Skills: `round((6 + atk) × mult × Timing × occult_mult × dmg_mult × vorhandene Schwachstelle)`. `holy` verdoppelt nur den Flat-Grundschaden gegen Okkultes. Die Rundung erfolgt je Treffer. `weak` wird erst nach der ersten Schadensabrechnung gesetzt und verstärkt spätere Angriffe um 50 %. `sure` macht einen Miss zum Good; Perfect ist ×1,3 vor Rundung.

Entgegen dem Panzer-Kommentar im Quelltext zieht `useSkillNow` Panzer nur einmal von der Summe einer Fertigkeit ab. Brand zieht Panzer bei jedem Tick ab, mindestens 1 Schaden bleibt; `pierce` umgeht Panzer beim Direktschaden, nicht Gegnerschutz. Brand skaliert nicht mit Pfad- oder Okkultmultiplikatoren und überschreibt vorhandenen Brand. Nervenkosten sind `round(composure × skill_composure)`. Heil-Skills und Drain erhalten keinen `heal_bonus`; dieser gilt im Bestand bei Heilgegenständen.

## Alle 90 Pfadfertigkeiten

D = direkter Schaden normal/okkult; F = gesamte Folgeschäden ohne Panzer; Σ = D + F normal/okkult. B3 = Σ normal gegen Panzer 3. N = effektive Nervenkosten. Sekundäre Effekte werden ausgewiesen, aber nicht als erfundener Schadenswert verbucht.

| Pfad | Seq | Fertigkeit | K | D N/O | F | Σ N/O | B3 | N | Zusatz |
|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| Laterne | 9 | Lichtstoß | 2 | 9/18 | 0 | 9/18 | 6 | 0 | keiner |
| Laterne | 8 | Funkenregen | 3 | 12/15 | 6 | 18/21 | 11 | 0 | keiner |
| Laterne | 7 | Gleißendes Feuer | 4 | 18/44 | 0 | 18/44 | 15 | 10 | stun: true |
| Laterne | 6 | Lichtbann | 4 | 32/98 | 0 | 32/98 | 29 | 0 | weak: true |
| Laterne | 5 | Weißglut | 5 | 38/114 | 15 | 53/129 | 41 | 15 | stun: true |
| Laterne | 4 | Dochtgericht | 5 | 57/171 | 24 | 81/195 | 69 | 18 | stun: true |
| Laterne | 3 | Aschenlesung | 6 | 75/224 | 30 | 105/254 | 93 | 24 | stun: true |
| Laterne | 2 | Horizontschnitt | 6 | 96/288 | 39 | 135/327 | 123 | 32 | stun: true |
| Laterne | 1 | Offene Beleuchtung | 6 | 125/376 | 48 | 173/424 | 161 | 42 | stun: true |
| Faden | 9 | Schwachstelle lesen | 1 | 0/0 | 0 | 0/0 | 0 | 0 | weak: true |
| Faden | 8 | Vorahnung | 2 | 0/0 | 0 | 0/0 | 0 | 0 | evade: true |
| Faden | 7 | Schicksalsfaden | 4 | 18/18 | 0 | 18/18 | 18 | 0 | sure: true, pierce: true |
| Faden | 6 | Fangnetz | 2 | 0/0 | 0 | 0/0 | 0 | 0 | stun: true, weak: true |
| Faden | 5 | Zerreißen | 5 | 28/28 | 0 | 28/28 | 25 | 0 | sure: true, weak: true |
| Faden | 4 | Nahtbefund | 5 | 40/40 | 0 | 40/40 | 37 | 18 | sure: true, weak: true |
| Faden | 3 | Bruchvermerk | 6 | 52/52 | 0 | 52/52 | 49 | 24 | sure: true, weak: true |
| Faden | 2 | Saumzug | 6 | 68/68 | 0 | 68/68 | 65 | 32 | sure: true, weak: true |
| Faden | 1 | Offener Knoten | 6 | 92/92 | 0 | 92/92 | 89 | 42 | sure: true, weak: true |
| Maske | 9 | Trugbild | 2 | 0/0 | 0 | 0/0 | 0 | 0 | shield: 10 |
| Maske | 8 | Verwirrung | 3 | 3/3 | 0 | 3/3 | 1 | 0 | confuse: true |
| Maske | 7 | Spiegelschritt | 4 | 16/16 | 0 | 16/16 | 13 | 0 | evade: true |
| Maske | 6 | Spiegelbild | 3 | 0/0 | 0 | 0/0 | 0 | 0 | shield: 22, confuse: true |
| Maske | 5 | Maskenball | 5 | 24/24 | 0 | 24/24 | 21 | 0 | evade: true, confuse: true |
| Maske | 4 | Fremde Miene | 5 | 36/36 | 0 | 36/36 | 33 | 18 | evade: true, confuse: true |
| Maske | 3 | Rollenwechsel | 6 | 45/45 | 0 | 45/45 | 42 | 24 | evade: true, confuse: true |
| Maske | 2 | Leeres Parkett | 6 | 57/57 | 0 | 57/57 | 54 | 32 | evade: true, confuse: true |
| Maske | 1 | Eigener Auftritt | 6 | 75/75 | 0 | 75/75 | 72 | 42 | evade: true, confuse: true |
| Echo | 9 | Klagelaut | 1 | 7/14 | 0 | 7/14 | 4 | 5 | keiner |
| Echo | 8 | Grabesstimme | 3 | 0/0 | 0 | 0/0 | 0 | 5 | stun: true |
| Echo | 7 | Seelenzug | 4 | 15/15 | 0 | 15/15 | 12 | 0 | drain: 0.5 |
| Echo | 6 | Totenchor | 4 | 27/54 | 0 | 27/54 | 24 | 4 | keiner |
| Echo | 5 | Stillgesang | 5 | 30/30 | 0 | 30/30 | 27 | 5 | drain: 0.6, stun: true |
| Echo | 4 | Restton | 5 | 46/46 | 0 | 46/46 | 43 | 16 | drain: 0.6, stun: true |
| Echo | 3 | Nachrufzug | 6 | 59/59 | 0 | 59/59 | 56 | 21 | drain: 0.6, stun: true |
| Echo | 2 | Uferlaut | 6 | 77/77 | 0 | 77/77 | 74 | 28 | drain: 0.6, stun: true |
| Echo | 1 | Ausgehört | 6 | 100/100 | 0 | 100/100 | 97 | 37 | drain: 0.6, stun: true |
| Kessel | 9 | Wundsalbe | 2 | 0/0 | 0 | 0/0 | 0 | 0 | heal: 14 |
| Kessel | 8 | Giftphiole | 2 | 5/5 | 12 | 17/17 | 5 | 0 | keiner |
| Kessel | 7 | Ätzende Wolke | 4 | 11/11 | 15 | 26/26 | 14 | 0 | weak: true |
| Kessel | 6 | Lebenselixier | 3 | 0/0 | 0 | 0/0 | 0 | 0 | heal: 30, shield: 14 |
| Kessel | 5 | Zersetzung | 5 | 30/30 | 24 | 54/54 | 42 | 0 | weak: true |
| Kessel | 4 | Rückstandslauge | 5 | 46/46 | 36 | 82/82 | 70 | 18 | weak: true |
| Kessel | 3 | Rücklauf | 6 | 58/58 | 48 | 106/106 | 94 | 24 | weak: true |
| Kessel | 2 | Abwärmesud | 6 | 76/76 | 60 | 136/136 | 124 | 32 | weak: true |
| Kessel | 1 | Letzte Fraktion | 6 | 102/102 | 78 | 180/180 | 168 | 42 | weak: true |
| Eisen | 9 | Wuchtschlag | 2 | 11/11 | 0 | 11/11 | 8 | 0 | keiner |
| Eisen | 8 | Eiserne Haut | 2 | 0/0 | 0 | 0/0 | 0 | 0 | shield: 16 |
| Eisen | 7 | Klingenwirbel | 4 | 27/27 | 0 | 27/27 | 24 | 0 | keiner |
| Eisen | 6 | Unbeugsam | 3 | 0/0 | 0 | 0/0 | 0 | 0 | shield: 30, heal: 10 |
| Eisen | 5 | Hammerfall | 5 | 56/56 | 0 | 56/56 | 53 | 0 | stun: true |
| Eisen | 4 | Lastschlag | 5 | 84/84 | 0 | 84/84 | 81 | 18 | stun: true |
| Eisen | 3 | Widerlager | 6 | 108/108 | 0 | 108/108 | 105 | 24 | stun: true |
| Eisen | 2 | Tragwerkstoß | 6 | 142/142 | 0 | 142/142 | 139 | 32 | stun: true |
| Eisen | 1 | Standhalten | 6 | 184/184 | 0 | 184/184 | 181 | 42 | stun: true |
| Schlüssel | 9 | Hinterhalt | 1 | 8/8 | 0 | 8/8 | 5 | 0 | keiner |
| Schlüssel | 8 | Fallstrick | 2 | 0/0 | 0 | 0/0 | 0 | 0 | stun: true |
| Schlüssel | 7 | Schattenschritt | 4 | 16/16 | 0 | 16/16 | 13 | 0 | evade: true |
| Schlüssel | 6 | Taschenspiel | 3 | 20/20 | 0 | 20/20 | 17 | 0 | confuse: true |
| Schlüssel | 5 | Kehlschnitt | 5 | 33/33 | 0 | 33/33 | 30 | 0 | sure: true, evade: true |
| Schlüssel | 4 | Schwellenschnitt | 5 | 48/48 | 0 | 48/48 | 45 | 18 | sure: true, evade: true |
| Schlüssel | 3 | Leerriegel | 6 | 63/63 | 0 | 63/63 | 60 | 24 | sure: true, evade: true |
| Schlüssel | 2 | Randsprung | 6 | 81/81 | 0 | 81/81 | 78 | 32 | sure: true, evade: true |
| Schlüssel | 1 | Offene Schwelle | 6 | 105/105 | 0 | 105/105 | 102 | 42 | sure: true, evade: true |
| Waage | 9 | Pfanddruck | 2 | 7/7 | 0 | 7/7 | 4 | 0 | shield: 4 |
| Waage | 8 | Gegengewicht | 3 | 10/10 | 0 | 10/10 | 7 | 0 | shield: 6 |
| Waage | 7 | Fristpfand | 4 | 18/18 | 0 | 18/18 | 15 | 0 | shield: 8 |
| Waage | 6 | Ausgleichshieb | 4 | 26/26 | 0 | 26/26 | 23 | 0 | shield: 10 |
| Waage | 5 | Pfandsaldo | 5 | 32/32 | 0 | 32/32 | 29 | 10 | shield: 12 |
| Waage | 4 | Pfandabruf | 5 | 50/50 | 0 | 50/50 | 47 | 18 | shield: 18 |
| Waage | 3 | Saldenstoß | 6 | 64/64 | 0 | 64/64 | 61 | 24 | shield: 23 |
| Waage | 2 | Gegenbuchung | 6 | 84/84 | 0 | 84/84 | 81 | 32 | shield: 30 |
| Waage | 1 | Letzte Quittung | 6 | 108/108 | 0 | 108/108 | 105 | 42 | shield: 40 |
| Moor | 9 | Schlickgriff | 2 | 6/6 | 0 | 6/6 | 3 | 0 | heal: 4 |
| Moor | 8 | Namenslast | 3 | 9/9 | 0 | 9/9 | 6 | 0 | heal: 7 |
| Moor | 7 | Torfdruck | 4 | 16/16 | 0 | 16/16 | 13 | 0 | heal: 9 |
| Moor | 6 | Uferhand | 4 | 22/22 | 0 | 22/22 | 19 | 0 | heal: 11 |
| Moor | 5 | Schichtschluss | 5 | 30/30 | 0 | 30/30 | 27 | 10 | heal: 14 |
| Moor | 4 | Schichtdruck | 5 | 46/46 | 0 | 46/46 | 43 | 18 | heal: 21 |
| Moor | 3 | Sedimentgriff | 6 | 58/58 | 0 | 58/58 | 55 | 24 | heal: 27 |
| Moor | 2 | Uferschlick | 6 | 76/76 | 0 | 76/76 | 73 | 32 | heal: 35 |
| Moor | 1 | Fehlstellenruf | 6 | 102/102 | 0 | 102/102 | 99 | 42 | heal: 46 |
| Uhr | 9 | Taktschlag | 2 | 7/7 | 0 | 7/7 | 4 | 0 | sure: true |
| Uhr | 8 | Vortritt | 3 | 10/10 | 0 | 10/10 | 7 | 0 | evade: true |
| Uhr | 7 | Pendelkehr | 4 | 18/18 | 0 | 18/18 | 15 | 0 | sure: true |
| Uhr | 6 | Gangausgleich | 4 | 26/26 | 0 | 26/26 | 23 | 0 | evade: true |
| Uhr | 5 | Fristkehr | 5 | 32/32 | 0 | 32/32 | 29 | 10 | sure: true, evade: true |
| Uhr | 4 | Taktlücke | 5 | 50/50 | 0 | 50/50 | 47 | 18 | sure: true, evade: true |
| Uhr | 3 | Friststoß | 6 | 64/64 | 0 | 64/64 | 61 | 24 | sure: true, evade: true |
| Uhr | 2 | Wiederkehrschlag | 6 | 84/84 | 0 | 84/84 | 81 | 32 | sure: true, evade: true |
| Uhr | 1 | Minutenfreigabe | 6 | 108/108 | 0 | 108/108 | 105 | 42 | sure: true, evade: true |

## Gemeinsame Grundfertigkeiten (ohne Pfad)

| Fertigkeit | K | Schaden normal/okkult | Nerven |
|---|---:|---:|---:|
| Angriff | 0 | 6/6 | 0 |
| Doppelschlag | 2 | 10/10 | 0 |
| Laternenblende | 2 | 2/2 | 0 |
| Bannwort | 3 | 12/24 | 15 |

## Wachstum des Einzelanwendungs-Schadens

Quotient des Gesamtschadens der neuen Stufe durch den auf der jeweiligen Vorstufe gemessenen Gesamtschaden. Ziel 5→4: 1,50; danach 1,30. Toleranz ±0,12 wegen ganzzahliger Treffer/Brandwerte. Diese Kurve ist keine Gleichsetzung von Kontroll-, Heil- und Schadenswirkung. Höhere AP-Kosten bremsen den Schaden pro Konzentration zusätzlich.

| Pfad | Schritt | Ziel | Normal | Okkult |
|---|---|---:|---:|---:|
| Laterne | 5→4 | 1,50 | 1.528 | 1.512 |
| Laterne | 4→3 | 1,30 | 1.296 | 1.303 |
| Laterne | 3→2 | 1,30 | 1.286 | 1.287 |
| Laterne | 2→1 | 1,30 | 1.281 | 1.297 |
| Faden | 5→4 | 1,50 | 1.429 | 1.429 |
| Faden | 4→3 | 1,30 | 1.300 | 1.300 |
| Faden | 3→2 | 1,30 | 1.308 | 1.308 |
| Faden | 2→1 | 1,30 | 1.353 | 1.353 |
| Maske | 5→4 | 1,50 | 1.500 | 1.500 |
| Maske | 4→3 | 1,30 | 1.250 | 1.250 |
| Maske | 3→2 | 1,30 | 1.267 | 1.267 |
| Maske | 2→1 | 1,30 | 1.316 | 1.316 |
| Echo | 5→4 | 1,50 | 1.533 | 1.533 |
| Echo | 4→3 | 1,30 | 1.283 | 1.283 |
| Echo | 3→2 | 1,30 | 1.305 | 1.305 |
| Echo | 2→1 | 1,30 | 1.299 | 1.299 |
| Kessel | 5→4 | 1,50 | 1.519 | 1.519 |
| Kessel | 4→3 | 1,30 | 1.293 | 1.293 |
| Kessel | 3→2 | 1,30 | 1.283 | 1.283 |
| Kessel | 2→1 | 1,30 | 1.324 | 1.324 |
| Eisen | 5→4 | 1,50 | 1.500 | 1.500 |
| Eisen | 4→3 | 1,30 | 1.286 | 1.286 |
| Eisen | 3→2 | 1,30 | 1.315 | 1.315 |
| Eisen | 2→1 | 1,30 | 1.296 | 1.296 |
| Schlüssel | 5→4 | 1,50 | 1.455 | 1.455 |
| Schlüssel | 4→3 | 1,30 | 1.313 | 1.313 |
| Schlüssel | 3→2 | 1,30 | 1.286 | 1.286 |
| Schlüssel | 2→1 | 1,30 | 1.296 | 1.296 |
| Waage | 5→4 | 1,50 | 1.563 | 1.563 |
| Waage | 4→3 | 1,30 | 1.280 | 1.280 |
| Waage | 3→2 | 1,30 | 1.313 | 1.313 |
| Waage | 2→1 | 1,30 | 1.286 | 1.286 |
| Moor | 5→4 | 1,50 | 1.533 | 1.533 |
| Moor | 4→3 | 1,30 | 1.261 | 1.261 |
| Moor | 3→2 | 1,30 | 1.310 | 1.310 |
| Moor | 2→1 | 1,30 | 1.342 | 1.342 |
| Uhr | 5→4 | 1,50 | 1.563 | 1.563 |
| Uhr | 4→3 | 1,30 | 1.280 | 1.280 |
| Uhr | 3→2 | 1,30 | 1.313 | 1.313 |
| Uhr | 2→1 | 1,30 | 1.286 | 1.286 |

## Leben und Nerven

Basis: 40 Leben, 100 Nerven. Seq 9/8/5 je ein Wachstumsschritt, 7/6 je zwei. Vorschlag für 4/3/2/1: 2/2/3/3 Schritte, kumuliert 9/11/14/17. Formel: Basis + Wachstum des Pfads × kumulierte Schritte + alle additiven Maximalwert-Passiven. Artefakte und Kleidung sind ausgeschlossen; der Nachteil der Maske ist enthalten.

| Pfad | Wachstum LP/N | Seq 4 LP/N | Seq 3 LP/N | Seq 2 LP/N | Seq 1 LP/N |
|---|---:|---:|---:|---:|---:|
| Laterne | 5/6 | 93/154 | 103/174 | 118/192 | 139/210 |
| Faden | 4/7 | 76/186 | 84/200 | 96/221 | 114/242 |
| Maske | 5/6 | 85/150 | 95/162 | 110/180 | 131/198 |
| Echo | 4/8 | 82/192 | 90/216 | 102/240 | 120/264 |
| Kessel | 6/5 | 99/145 | 111/163 | 135/178 | 153/193 |
| Eisen | 8/3 | 137/127 | 153/141 | 183/150 | 207/167 |
| Schlüssel | 5/5 | 85/145 | 95/163 | 110/178 | 131/193 |
| Waage | 6/5 | 94/150 | 106/160 | 124/183 | 148/198 |
| Moor | 7/5 | 122/153 | 136/171 | 157/186 | 184/201 |
| Uhr | 5/7 | 85/181 | 95/195 | 116/216 | 131/245 |

## Bestehende Vergleichsgegner in Wexmoor

Das Finale mit Brandt wird über Dialog und Enden entschieden, nicht über einen definierten Brandt-Bosskampf. Vergleichswerte sind daher die stärksten vorhandenen Einzelgänger und Constable Price. Ihre `encounters` stehen in `wexmoor.json`; sie sind dort nicht mit `boss: true` markiert. Keine erfundenen Bosswerte.

| Gegner | HP Daten | HP solo | höchster Einzelhit Daten | Einzelhit solo |
|---|---:|---:|---:|---:|
| Constable Price | 72 | 101 | 14 | 20 |
| Hagen Wisp, der Reetkönig | 90 | 126 | 16 | 22 |
| Agathe Garn, die Spinnerin | 110 | 154 | 18 | 25 |
| Mara Docht, die Brennerin | 85 | 119 | 16 | 22 |

## Zielkorridore für Kapitel 3 und später

Solo-HP werden bereits mit 1.4 multipliziert, Schaden mit 1.4. Duo-HP zusätzlich ×1.6, Duo-Schaden ×1,15; Rage-Schaden ×1,20. Nicht doppelt in Daten einrechnen. Zahlen unten sind neue Vorschläge, keine existierenden Encounters.

| Zugang mit | Rolle | HP Daten / solo | Schaden je Ring Daten / solo | Ringe je Angriff |
|---|---|---|---|---|
| Seq 5, Freischaltung 4 | Hüter der ersten Kernzutat | 170–220 / 238–308 | 10–14 / 14–20 | 2, angekündigter Einzelhit |
| Seq 4 | regulärer Kapitel-3-Gegner | 200–280 / 280–392 | 11–15 / 15–21 | 2 |
| Seq 4, Freischaltung 3 | Kapitel-3-Boss | 360–460 / 504–644 | 14–19 / 20–27 | 2–3 |
| Seq 3, Freischaltung 2 | später Boss | 480–620 / 672–868 | 16–21 / 22–29 | 2–3 |
| Seq 2, Freischaltung 1 | Abschluss einer Mythosreihe | 650–820 / 910–1148 | 18–23 / 25–32 | 2–3 |
| Seq 1 | optionale Mythosprobe | 800–1050 / 1120–1470 | 20–25 / 28–35 | 2–3 |

Beispiel: Laterne Seq 4 verursacht ohne Vorarbeit 81 normalen oder 195 okkulten Gesamtschaden, einschließlich 24 Brand über drei Runden. Ein okkulter K3-Boss mit 560 tatsächlichen HP fällt dadurch nicht sofort. Die Werte allein beseitigen aber Kontrollketten nicht. Ein Nutzer des Fadens oder der Uhr hat deutlich weniger Schaden; für diese Pfade müssen längere Kämpfe auch ohne perfekte Paraden überlebbar bleiben. Vor Freigabe alle zehn Pfade gegen dieselben Szenarien spielen, einschließlich normaler statt okkulter Gegner.

## Verdauung, Wirtschaft und Artefakte

Vorgeschlagene Raten 4/3/2/1: 0,20 / 0,16 / 0,13 / 0,10. Der letzte Wert betrifft optionales Ausmeistern, keinen Aufstieg auf Seq 0. Kein neuer Pfad braucht einen neuen Verdauungsschlüssel. Waage verlangt einen Schutz gegen Wiederverkaufs-Schleifen, Uhr gegen endlose sichere Übungsparaden, Moor gegen wiederholt vergütete Fundstellen. Siehe neue_mechaniken.md. Kleine Ereigniswerte alleine verhindern Farmen nicht.

Einzelner Seq-4-Nachteil bleibt auf höheren Stufen wirksam. Es werden darüber keine weiteren Schadensmultiplikatoren oder AP-Startboni aufgestapelt. Die neuen Pfade erreichen durch 7/6 zusammen dmg_mult 1,265 und 3 Start-AP. Kein Skill kostet mehr als das vorhandene AP-Limit 6.

Artefakte wirken bereits im Inventar. Beispiel Faden: Gegenakte gibt +2 Schlussfolgerungs-Ansehen, vergrößert aber zusammen mit Seq 4 den Ansehensverlust auf 1,20×1,70 = 2,04. Beispiel Torfsiegel: 0,32 Unruhe/s minus 0,25 natürlicher Abbau ergibt bei calm_decay=1 netto +0,07/s; zusammen mit weiteren Artefakten kommen Streit und gegebenenfalls Überlast hinzu. Nicht pauschal behaupten, jeder Pfad bekomme denselben Nettowert. Bestehende Rabatt- und Verkaufsmultiplikatoren können Arbitrage erlauben; AF fügt deshalb keinen neuen Preisrabatt und keinen Verkaufsbonus hinzu.

## Grenzen und Freigabekriterien

Die 1,5-/1,3-Kurve gilt für garantierbaren Direktschaden plus einmal vollständig auslaufenden Brand. Verwirrung ist gegnerabhängig und kann bei einer Sonderaktion 0 verursachen. Betäubung, Ausweichen, Schild und Heilung sind separat ausgewiesen. Ein bereits gesetztes weak, Perfect-Timing, bessere Waffen und Artefakte können den Schaden erheblich erhöhen. Ein Schild stapelt sich; neuer Brand überschreibt alten. Deshalb darf die Tabelle weder als DPS noch als Beweis für faire Bosskämpfe gelesen werden.

Vor Integration: bei 50/70/90 % erfolgreichen Verteidigungen jeweils alle zehn Pfade, Solo und Duo, normale/okkulte/gepanzerte Ziele, mit und ohne Artefakte vergleichen. Ziel: Seq-4-Regelkämpfe 4–7 Runden, Bosse 8–12; Niederlage soll aus mehreren lesbaren Fehlern entstehen. Kessel/Moor dürfen durch günstige Heilung keine verlustfreie Dauerschleife haben. Echofertigkeiten zahlen ihre wegen ×0,35 deutlich reduzierten Nervenkosten weiterhin. Alte Fertigkeiten bleiben verfügbar; billige Kontrolle aus Seq 6 kann jede neue Bosskurve umgehen. Die in neue_mechaniken.md vorgeschlagene Kontrollresistenz muss vor Endgame-Freigabe entschieden werden.
