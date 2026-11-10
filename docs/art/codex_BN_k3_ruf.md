# Codex-Paket BN: Rufextras für Kapitel 3 (Linienprojektion, Hörreichweite, private Bindung, Klänge)

**Paket-Name:** `k3_ruf` (Paket BN; AZ ist das Beziehungs-Paket) · **Deine Dateien:** `src/core/SignalRoutes.js` (neu, ohne Phaser), `src/data/packs/k3_ruf/stationen.json`, `src/data/packs/k3_ruf/klang_zuordnung.json`, `src/data/packs/k3_ruf/bindungen.json`, `src/data/packs/k3_ruf/texte.json`, `tests/k3_ruf.test.js`, `docs/story/k3_ruf/` (README, offene_punkte, pruefen.mjs)

Die Rufladungen sind seit PR #177 im Spiel (`src/core/Signals.js`: 3 Ladungen, Notladung je Station, Pfiff füllt). Was noch fehlt, steht als Vertrag in `docs/story/k3_orte/rufmechanik.md`: die **Linienprojektion** (Vorschau und Nachhallweg auf der Karte), die **Hörreichweite** der Gegner, die **private Namensantwort** mit Bindung bis zur nächsten Schallschleuse, und die **Klänge** aus Paket AY (`ds_ruf_01` bis `ds_ruf_16`, `ds_hall_*`), die noch an keinem Rufmuster hängen. Du lieferst dafür reine Logik und Daten. Die Darstellung in `WorldScene` baut Seb danach ein; sie bekommt von dir Ereignisse und fertige Kachellisten.

## Gemeinsame Eckdaten „Kapitel 3: Der letzte Zug nach Dunscar“ (gilt für die Pakete AR bis AY)

Seb hat für Kapitel 3 **Geschichte 3** aus Paket AC gewählt. Sie steht vollständig in **`docs/story/kapitel3/geschichte_3.md`**: lies sie zuerst ganz, sie ist die verbindliche Vorlage (Prämisse, Anschluss an die vier Wexmoor-Enden, sechs Viertel, zehn Figuren, Gegenspieler Gallowmere, Kernmechanik „Rufen, horchen, schweigen“, 5 Akte x 4 Fährten, Wendepunkte, vier Enden). Die Geschichten 1 und 2 im selben Ordner werden **nicht** benutzt, sie bleiben für später.

Acht Pakete bauen Kapitel 3 gleichzeitig. Damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so und lege nichts an, was einem anderen Paket gehört.

**Stadt:** `dunscar` (Feld `city` auf allen Karten). Ende Kapitel 2 setzt `kapitel2_done`; Kapitel 3 startet mit Flag `k3_arrived`, Ende Kapitel 3 setzt `kapitel3_done`.

**Karten** (Daten: AS, Grafik: AV)
| ID | Was |
|---|---|
| `ds_endbahnhof` | Viertel: Endbahnhof mit Wartesaal und Fahrkartenschalter (Ankunft) |
| `ds_schwellenring` | Viertel: Werkstätten, Runddepot, überwachsene Drehscheibe |
| `ds_arbeiterbogen` | Viertel: Reihenhäuser um einen windstillen Platz |
| `ds_kalkmarkt` | Viertel: Steinmetze, Trödel, Teesaal |
| `ds_bruchstufen` | Viertel: breite Treppen hinab in die Steinbrüche, Gerüste |
| `ds_signalhang` | Viertel: Schaltbuden, Prüfhaus, überdeckter Bahnsteig über der Schlucht |
| `ds_speisewagen` | Innenraum: Pfiffs Speisewagen, **Unterschlupf** (Koje, Lager, Fallwand, Kohlenofen, Schallschleuse) |
| `ds_runddepot` | Innenraum: Lokschuppen mit dem Nachtzug in der Wartung |
| `ds_pruefhaus` | Innenraum: Willas Klangprüfhaus mit Walzen und Trichtern |
| `ds_teesaal` | Innenraum: Mabels Wirtshaus „Zur letzten Schicht“ am Arbeiterbogen |
| `ds_lohnbuero` | Innenraum: altes Lohnbüro am Signalhang, Esthers Archiv |
| `ds_nachtzug_wagen` / `ds_nachtzug_lok` | Innenräume des Nachtzugs (Personenwagen voller Schichtgänger, Führerstand) |
| `ds_rangierwueste` | Gefahrengebiet tier 4, Boss `schwellenhund` |
| `ds_klopfbruch` | Gefahrengebiet tier 4, Boss `vorhauer` |
| `ds_rufschlucht` | Gefahrengebiet tier 5, Boss `vielrufer` |
| `ds_letzter_bahnsteig` | Finale: verlassener Bruchbahnsteig, Endkampf/-gespräch mit `gallowmere` |
| `ds_unterschicht` | nach dem Kapitel: Gefahrengebiet unter der Schlucht, Superboss `unterschicht` |

**Figuren** (Geschichte: AR/AT/AU, Grafik: AW)
`k3_pfiff` (Ansel „Pfiff“ Cedrow, Verbündeter), `k3_gallowmere` (Perrin Gallowmere, Fahrmeister, Gegenspieler), `k3_willa` (Willa Trentfold), `k3_oren` (Oren Fallowby), `k3_mabel` (Mabel Caskett), `k3_pelham` (Jonas Pelham), `k3_nellie` (Nellie Swarth), `k3_huxford` (Dr. Corin Huxford), `k3_esther` (Esther Brindle), `k3_adaine` (Adaine Quarrell), dazu neu **`k3_weichenstellerin`** (Hedda Quist, alte Weichenstellerin am Schwellenring, kennt die Pfade und nimmt die Sequenz-Prüfungen ab, Paket AU).

**Gegner** (Werte: AS bzw. AU, Grafik: AX)
- Normale Gegner: `schichtgaenger` (verzauberter lebender Arbeiter, wird nur bewusstlos), `kalkstaubgeist`, `signalkraehe`, `lohnlistenmotte`, `geruestklang`, `nachhall`.
- Bosse: `schwellenhund` (Akt II), `vorhauer` (Akt III), `vielrufer` (Akt V), `gallowmere` (Finale), `unterschicht` (Superboss nach dem Kapitel).
- Sequenz-Prüfungen (Paket AU, je ein Boss pro Pfad, Namen aus Paket AF): `k3p_lampengutachter` (laterne), `k3p_gegenzeugenknuepfer` (faden), `k3p_garderobenpfaender` (maske), `k3p_pausenfischer` (echo), `k3p_chargenpruefer` (kessel), `k3p_brueckenpresser` (eisen), `k3p_zollriegel` (schluessel), `k3p_fristpfaender` (sq_waage), `k3p_schichtsammler` (sq_moor), `k3p_gangaufseher` (sq_uhr).

**Kernzutaten der hohen Sequenzen** (Paket AF, liegen jetzt in `src/data/packs/sequenzen/zutaten.json`; Herkunft legt Paket AU fest):
- Seq 5 der neuen Pfade (`sq_zutat_<pfad>_5`): Beute von `schwellenhund`.
- Seq 4 aller Pfade (`sq_zutat_<pfad>_4`): Beute der eigenen Sequenz-Prüfung.
- Seq 3: Beute von `vorhauer`. Seq 2: Beute von `vielrufer`. Seq 1: Beute von `unterschicht`.
Bosse geben nur die Zutat des Pfads, dem der Spieler folgt; eine friedliche Lösung gibt dieselbe Zutat.

**Präfixe für neue IDs:** AR `k3a_`, AS `k3o_`, AT `k3n_`, AU `k3p_`. Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

## Eckdaten Runde 5 (gilt für die Pakete BA bis BG und BN, Stand 2026-11-10)

Kapitel 3 ist spielbar (Pakete AR bis AY sind eingebaut, siehe `src/data/packs/k3_*`, `src/core/Signals.js`, `src/core/MusicDirector.js`). Runde 5 füllt die Lücken. Acht Pakete laufen **gleichzeitig**; damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so, lege nichts an, was einem anderen Paket gehört, und schreib alles, was du von einem anderen Paket brauchst, in deine `offene_punkte.md`.

| Paket | Name | Liefert | Schreibt nach |
|---|---|---|---|
| BN | `k3_ruf` | Rufextras: Linienprojektion, Hörreichweite, private Bindung, Klang-Zuordnung, Stationsdaten (Code-Gerüst + Daten) | `src/core/SignalRoutes.js`, `src/data/packs/k3_ruf/`, `tests/k3_ruf.test.js`, `docs/story/k3_ruf/` |
| BA | `dunscar4` | Grafik: Ruf-Oberfläche, Dunscar-Leben (Tiere, Wetter, Stände), Ruth Bellwick | Batch `dunscar4` |
| BB | `icons2` | Grafik: alle noch geliehenen Item-Icons (40), Tränke und Formeln der neuen Pfade 9 bis 5 und aller Pfade 4 bis 1 | Batch `icons2` |
| BC | `k3_handel` | Daten: 3 Händler, Zirkel „Schichtbund“ mit Auktion, 5 Einzelgänger mit Bindung | `docs/story/k3_handel/` |
| BD | `k3_leben` | Daten: Einwohner mit Tagesplänen, Gerede je Akt, Kopfgeld-Brett mit 6 Stadtgegnern, Zeitung „Dunscarer Kalkblatt“, Tier- und Wetterzuordnung | `docs/story/k3_leben/` |
| BE | `dunscar5` | Grafik: Figuren aus BC und BD (Händler, Zirkel, Einzelgänger, Einwohner), 11 Gegner-Sheets | Batch `dunscar5` |
| BF | `koop_k3` | Texte: Koop in Dunscar (Geplauder, Reaktionen, Rufen zu zweit, 2 Aufträge) | `docs/story/koop_k3/` |
| BG | `koop_beute` | Getrennte Beute im Koop: Ansprüche je Spieler, Ersatz verlorener Tränke (Code-Gerüst + Daten + Texte) | `src/core/Claims.js`, `src/data/packs/koop_beute/`, `tests/koop_beute.test.js`, `docs/story/koop_beute/` |

**Feste IDs dieser Runde** (Daten: BC/BD/BF, Grafik: BA/BE):
- Händler (BC): `k3h_troedlerin` (Ida Marrow, Trödel am Kalkmarkt), `k3h_steinmetz` (Bram Tolley, Steinmetzhof am Kalkmarkt), `k3h_lampenwart` (Cato Finch, Schaltbude am Signalhang). Mabel (`k3_mabel`) bekommt über `dialog_zusaetze` einen kleinen Ausschank, keine neue Figur.
- Zirkel (BC): `schichtbund` („Der Schichtbund“), Treffpunkt-Karte `treffen_schichtbund` (Innenraum unter dem Runddepot), Gastgeberin `zirkel_schichtbund` (Agathe Rooke, „die Stempelmeisterin“), Mitglieder `tm_ds_lampe` (Lampenputzer Wim), `tm_ds_kerbholz` (Kerbholzschreiberin Dora), `tm_ds_stimme` (Walzenhändler Rufus). Mitgliedsflag `treffen_schichtbund`, `city: "dunscar"`, Reihenfolge `rules.orders.dunscar: ["schichtbund"]`.
- Einzelgänger (BC, je ein Pfad, Bindung -3 bis 3 wie in `src/data/wexmoor.json` → `loners`): `ez_ds_rangierer` (eisen), `ez_ds_kalkbrennerin` (kessel), `ez_ds_streckenlaeufer` (sq_uhr), `ez_ds_walzenstimme` (echo), `ez_ds_schrankenkind` (sq_moor).
- Einwohner ohne Namen (BD, Roamer mit Tagesplan): `k3e_schichtwitwe`, `k3e_kalkjunge`, `k3e_wagenputzer`, `k3e_zeitungsfrau`, `k3e_bahnbettler`, `k3e_steinmetzgeselle`, `k3e_teesaalgast`, `k3e_signalkind`.
- Kopfgeld (BD, Brett im `ds_lohnbuero`): Gegner `k3k_kupferdieb`, `k3k_schienenlaeufer`, `k3k_lohnfaelscher`, `k3k_staubschmuggler`, `k3k_walzenhehler`, `k3k_signalbrecher`; Aufträge `kopfgeld_ds_<gegner>`.
- Tiere und Wetter (BD ordnet zu, BA zeichnet): Tiere `ds_kraehe`, `ds_kalkziege`, `ds_staubteufel`, `ds_motte`, `ds_eidechse`, `ds_schwalbe`; Wetter `kalkstaub`, `wind`, `nachtnebel`.
- Zeitung (BD): die vorhandene Dunscar-Zeitung `dunscarer_kalkblatt` (siehe `src/data/packs/k3_nebenquests/zeitung.json`), **keine** neue Zeitungs-ID.
- Ruf-Oberfläche (BN beschreibt, BA zeichnet): Sheet `ui/ds_ruflinien.png` mit Regionen `linie_vorschau`, `linie_aktiv`, `linie_echo`, `linie_fehl`, `ecke_*`, `nische`, `hoerkreis`, `bindung`, `notladung`, `schleuse_zu`, `schleuse_auf`, `horchtrichter`; Journal-Tab-Rahmen `ui/ds_rufjournal.png`.
- Koop Dunscar (BF): Geplauder `koop_pl_ds_01` bis `_40`, Aufträge `koop_ds_horchen`, `koop_ds_schleuse`, Rollenobjekte `koop_ds_<auftrag>_p1`/`_p2`.
- Koop-Beute (BG): Dialog-Bedingungen `requires_claim`, `requires_claim_missing`, Effekt `claim`; Flags `p2_` wie bisher.

**Präfixe für neue IDs:** BN `k3r_`, BC `k3h_` (Händler), `tm_ds_` (Mitglieder), `ez_ds_` (Einzelgänger), BD `k3e_` (Einwohner), `k3k_` (Kopfgeld), BF `koop_ds_`, BG `k3b_`. Flags anderer Pakete sind tabu.

**Was es schon gibt (nicht neu anlegen):** die 11 Figuren `k3_*`, 6 Gegner, 5 Bosse, 10 Prüfungen, 18 Karten `ds_*`, 12 Nebenaufträge `k3n_*`, Rufmuster `k3a_ruf_*` (`docs/story/k3_akte/rufmuster.json`), Horchstellen `k3o_horch_*` (`docs/story/k3_orte/rufmechanik.md`), Rufladungen (`src/core/Signals.js`), Dunscar-Musik und 16 Rufklänge `ds_ruf_01` bis `ds_ruf_16` mit Nachhall `ds_hall_*` (`public/audio/manifest-klang-dunscar.json`).

## 0. Regeln für dieses Paket

- Lies zuerst ganz: `docs/story/kapitel3/geschichte_3.md` Abschnitt 6, `docs/story/k3_orte/rufmechanik.md`, `docs/story/k3_orte/Signals.skeleton.js`, `src/core/Signals.js`, `src/core/GameState.js` (Methoden `meets`, `applyEffects`, `emit`, `serialize`/`load`), `docs/story/k3_akte/rufmuster.json` und `horchstellen.json`, `src/data/packs/k3_orte/maps.json` (die sechs Karten mit Horchstellen) sowie `public/audio/manifest-klang-dunscar.json`.
- **Kein Phaser-Code.** `SignalRoutes.js` ist in Node testbar wie `Signals.js`, `Combat.js`, `Koop.js`. Du änderst **keine** bestehende Datei; was in `GameState.js`, `WorldScene.js`, `Ui.js` oder `sounds.js` verdrahtet werden muss, beschreibst du in `offene_punkte.md` als genaue Einbauanleitung (Datei, Stelle, drei bis fünf Zeilen Vorschlag).
- Alles, was Ton ist, muss auch sichtbar sein: jedes Ereignis liefert Text und eine Form, nie nur eine Klang-ID.

## 1. `SignalRoutes.js`: reine Logik

Exportiere ein Objekt `signalRouteMethods` im Stil von `signalMethods` (wird per `Object.assign` an `GameState.prototype` gehängt) und freie Hilfsfunktionen. Zustand liegt in `this.signal` (bereits `charges`, `reserveUsed`) und wird um `learnedPatterns` (Set von Muster-IDs), `revealedRoutes` (Set von Stations-ID+Richtung), `bindings` (Objekt Spieler → `{ station, pattern, speaker, until: 'schleuse' }`), `lastAlarm` (`{ map, tiles, until }`) und `handled` (Liste verarbeiteter Befehls-IDs, höchstens 64) erweitert. `serializeSignalRoutes()`/`loadSignalRoutes()` ergänzen `serializeSignal`/`loadSignal`, ohne sie zu ersetzen.

Funktionen (alle ohne Nebenwirkungen außer den beschriebenen):
- `previewCall(stationId, patternId, dir)` → `{ ok, reason, tiles, safeTiles, listeners, cost: 1, warning }`. `tiles` ist die geordnete Kachelliste der Ausbreitung: Vier-Nachbarn, höchstens `rangeTiles` Schritte, nur begehbare Kacheln der Karte (nutze `content.maps[map].collision` bzw. die Funktion, die `WorldScene` dafür benutzt; wenn du sie nicht findest, nimm eine übergebene `isWalkable(x, y)`), Wände und geschlossene Schleusen stoppen. Erst nur die gewählte Richtung, dann der belegte Korridor. `listeners` sind die Gegnerinstanzen der Karte, deren Hörreichweite (Tabelle in `rufmechanik.md`: Schichtgänger 5, Kalkstaubgeist 6, Signalkrähe 9, Lohnlistenmotte 4, Gerüstklang 7, Nachhall 10) eine Kachel der Ausbreitung erreicht. `warning` ist der Text, der vor dem Senden steht („Zwei Lauscher in Hörweite. Sichere Nische bei (2,3).“).
- `confirmCall(commandId, stationId, patternId, dir)` → `{ handled, result }`. Jede `commandId` genau einmal (Koop: beide Spieler können denselben Befehl schicken). Zieht eine Ladung über das vorhandene `applySignal({ signal: 'call' })` ab, nie selbst. `result.kind` ist `route` (Weg bestätigt, `revealedRoutes` ergänzt, `routeTiles` zurück), `answer` (ein Raum antwortet, `flag` aus `accepted`), `fallback` (bekannte falsche Haltestelle: `map`, `spawn`, Nerven höchstens 5) oder `alarm` (`lastAlarm` mit Kacheln und Dauer in Spielsekunden). Ein falsches Muster kostet nie eine zweite Ladung. Emit `signal_route` mit dem Ergebnis.
- `listen(stationId)` → kostenlos, gibt die sichtbaren Hinweise der Station zurück (`hints` aus den Daten, gefiltert nach Flags), setzt keine Flags.
- `offerPrivateAnswer(stationId, speaker)` / `acceptPrivateAnswer(commandId, stationId, speaker)`: nur außerhalb einer Schleuse, nur mit ausdrücklicher Warnung (`texte.json` → `bindung_warnung`), bindet **nur** diesen Sprecher (`bindings[speaker]`). Gebundene Sprecher bekommen bis zur nächsten Schleuse den Malus aus `bindungen.json` (z. B. `unruhe_tick +1`, `nerves_max -5`); liefere `bindingPassive(speaker)` im Format von `passive()`-Einträgen (`src/core/Artifacts.js` zeigt das Format), damit der Einbau es nur addieren muss.
- `enterLock(mapId, lockId)` → beendet alle Bindungen und `lastAlarm`, emit `signal_lock`.
- `patternSound(patternId)` → `{ call, hall, zeichen }` aus `klang_zuordnung.json`; `signSymbol(patternId)` → Index 0 bis 15 im Rufmuster-Sheet `ui/ds_rufmuster.png` (Paket AX).
- `hearingOf(enemyId)` → Kacheln (Tabelle oben, Standard 5).
- Dialog-Bedingungen für `meets` (als `meetsSignalRoutes(o)`): `requires_route: "<station>:<dir>"`, `requires_pattern: "<muster>"`, `requires_binding: 1|2|false`. Effekte für `applyEffects` (als `applySignalRoutes(e)`): `learn_pattern`, `reveal_route`, `enter_lock`.

Koop: Es gibt ein Gerät, aber zwei Sprecher. `speaker` ist 1 oder 2 (`state.acting`). Eine Bindung von Spieler 2 belastet nur Spieler 2 (`withPlayer(2, …)` aus `src/core/Party.js` zeigt, wie PERSONAL-Felder getauscht werden; beschreibe in `offene_punkte.md`, ob `bindings` PERSONAL sein soll oder, wie vorgeschlagen, nach Sprecher getrennt im gemeinsamen `signal` liegt).

## 2. Daten

**`stationen.json`:** die sechs Stationen aus `rufmechanik.md` (`k3o_horch_drehscheibe`, `k3o_horch_hund`, `k3o_horch_vorhauer`, `k3o_horch_verteiler`, `k3o_horch_bahnsteig`, `k3o_horch_tiefe`) mit genau den dort vorgeschlagenen Feldern (`map, tile, directions, patterns, accepted, rangeTiles, safeTiles, routeTiles, fallback, reserve, listeners, privateAnswer`) plus `hints` (2 bis 4 kostenlose Horch-Hinweise je Station mit optionalen `requires_flags`) und `lock` (ID und Kachel der nächsten Schallschleuse; der Speisewagen hat eine, dazu je eine am Eingang der drei Gefahrengebiete und am letzten Bahnsteig). `patterns`/`accepted` verwenden die Rufmuster-IDs aus `docs/story/k3_akte/rufmuster.json` und die Ergebnisflags, die `src/data/packs/k3_orte/dialogues.json` heute schon setzt (z. B. `k3o_falscher_pfiff`), damit die bestehende Dialogfassung später 1:1 ersetzt werden kann. Prüfe die Koordinaten gegen `maps.json`: Stationskachel, Nische und Rückweg müssen begehbar sein.

**`klang_zuordnung.json`:** jedes Rufmuster aus `rufmuster.json` → `{ "call": "ds_ruf_NN", "hall": "ds_hall_NN", "zeichen": "— · —" }` (das `zeichen` aus dem AY-Manifest übernehmen), dazu `horch_an`, `horch_aus`, `ladung_leer`, `ladung_voll`, `falsches_muster`, `richtiges_muster`, `bindung_an`, `bindung_aus` (vorhandene AY-Klänge oder, falls einer fehlt, Eintrag in `offene_punkte.md`). Ein AY-Klang darf von höchstens einem Rufmuster benutzt werden.

**`bindungen.json`:** je Station die Wirkung einer privaten Bindung (Malus, Dauer `bis_schleuse`), welcher Nachhall antwortet, was der Spieler dafür erfährt (`flag`, Journal-Text) und der Text, mit dem die Bindung endet.

**`texte.json`:** alle Oberflächentexte: Vorschau, Warnungen, Ergebnisse je `kind`, leere Ladung, Notladung, Bindungswarnung (ausdrücklich, zwei Sätze), Schleusen-Übergang, Koop-Hinweis („Nur du bist gebunden, nicht dein Partner.“). Jeder Text höchstens 140 Zeichen, deutsch, keine englischen IDs sichtbar.

## 3. Tests und Prüfer

`tests/k3_ruf.test.js` (vitest wie `tests/duo.test.js`, Inhalt über `tests/helpers.js` → `loadContent()` und ein GameState, dem du `signalRouteMethods` per `Object.assign` anhängst): drei Rufe, der vierte gesperrt; Notladung bei 0 und bei 3; derselbe Befehl zweimal kostet einmal; falsches Muster verliert nie `learnedPatterns`; Ausbreitung stoppt an Wand und Schleuse; jede Station erreicht mit 0 Ladungen noch einen Ausgang; Spieler 2 antwortet privat und nur Spieler 2 ist gebunden; Schleuse beendet Bindung; Speichern und Laden erhält Routen und verbrauchte Reserven; jedes Rufmuster hat genau einen Klang. `docs/story/k3_ruf/pruefen.mjs` prüft die Daten ohne vitest (IDs existieren, Kacheln begehbar, keine doppelten Klänge).

## 4. Doku und Abgabe

`docs/story/k3_ruf/README.md` (Überblick, Ablauf eines Rufs als Schrittfolge, Ereignisse mit Feldern), `offene_punkte.md` (Einbau in `GameState`, `WorldScene` (Linien aus `tiles`/`routeTiles` zeichnen, Sheet `ui/ds_ruflinien.png` aus Paket BA), `Ui` (Journal-Tab „Rufmuster“ mit `signSymbol`), `sounds.js`/`MusicDirector` (`patternSound`), `Roamers` (`hearingOf` statt `roam.aggro`)). Pull Request nur mit deinen Dateien; Testausgabe in die Beschreibung.
