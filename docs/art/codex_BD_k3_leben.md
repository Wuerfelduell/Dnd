# Codex-Paket BD: Leben in Dunscar (Einwohner, Gerede, Kopfgeld-Brett, Zeitung, Tiere und Wetter)

**Paket-Name:** `k3_leben` · **Deine Dateien:** `docs/story/k3_leben/` (acht Standarddateien, dazu `einwohner.json`, `stadtgegner_dunscar.json`, `zeitung.json`, `leben.json`, `gerede.json`, README, offene_punkte, grafikwuensche, pruefen.mjs)

Die sechs Viertel von Dunscar sind fertig gebaut und haben Lesetexte, aber **niemand wohnt dort**: Es gibt keine Passanten, keine Marktgeräusche, keine Krähen auf den Masten, kein Wetter, keine Streife, kein Kopfgeld-Brett, und die Zeitung erscheint nur zu den Nebenaufträgen. Kettlegate hat Stadtgegner und Steckbriefe (`src/data/stadtgegner.json`, `src/data/dialogues/kopfgeld.json`), Wexmoor hat Tiere, Wetter und Sprechblasen (`src/world/WexmoorLife.js`, Paket AE) sowie Polizeistreifen. Dunscar bekommt sein eigenes Leben: ruhiger, staubiger, mit Menschen, die nachts verschwinden.

## 0. Regeln für Text- und Datenpakete (bitte zuerst lesen)

Diese Datei ist in sich vollständig. „Nebelakten“ ist ein originales 2D-Pixel-Mysteryspiel in Phaser 3 (Repo `Wuerfelduell/Dnd`, Browser, Sprache Deutsch). Kapitel 1 spielt in der Nebelstadt Kettlegate, Kapitel 2 in der Moorstadt Wexmoor, Kapitel 3 in der stillgelegten Kalkbergbau-Stadt Dunscar. Du lieferst **Daten und Texte**, keinen Spielcode (außer dort, wo ein Paket ausdrücklich ein Grundgerüst verlangt).

**Format:** Jedes Text-Paket liefert nach `docs/story/<paket>/` die acht Standarddateien im Format von `src/data/packs/k2_gilde/` bzw. `src/data/packs/k3_orte/`: `quests.json`, `items.json`, `encounters.json`, `dialogues.json`, `npcs.json`, `case.json`, `dialog_zusaetze.json` (nur `choices_add` und `nodes_add` an bestehende Figuren), `platzierung.json` (Objekte und NPC-Positionen auf **vorhandenen** Karten, Koordinaten nullbasiert in 16-Pixel-Kacheln, als Vorschlag markiert). Leere Dateien sind `[]` bzw. `{}`. Dazu `README.md` (Überblick, Spielzeit, Reihenfolge), `offene_punkte.md` (alles, was Code oder ein anderes Paket braucht), `grafikwuensche.md` (Tabelle: ID, Art, Maße, Beschreibung, bisheriger Platzhalter, englischer Bildprompt) und `pruefen.mjs` (Node ohne Pakete: lädt den Inhalt über `tests/helpers.js` → `loadContent()`, prüft, dass alle verwiesenen Karten, Items, Flags, Figuren und Dialogknoten existieren und dass jede Quest vom Start aus erreichbar ist; Ausgabe in die PR-Beschreibung).

**Vorhandene Felder benutzen, keine erfinden.** Dialoge: `nodes.<id>.text`, `choices[].{text, next, requires_flags, hide_if_flags, requires_items, requires_money, requires_pathway: [pfad, seq], requires_bond, requires_nerves, requires_signal_charge, effects: {sets_flags, gives_items, takes_items, money, honor, nerves, bond, unruhe, wanted, signal, combat, quest_start, quest_step, scene}}`. Quests: `id, title, summary, steps[].{text, done_flag, target}, rewards`. Begegnungen: wie `src/data/packs/k3_orte/encounters.json` (`hp, power, defense, speed, loot, chapter: 3, sheet`). Gegner, Karten oder Figuren, die du brauchst, aber nicht besitzt, stehen in `offene_punkte.md`. Kein `platzhalter`-Feld in Spieldaten, Platzhalter nur in `grafikwuensche.md`.

**Ton:** nüchtern, viktorianisch-industriell, melancholisch, trocken-humorvoll, nie albern, keine Anglizismen, keine Markennamen, keine Zitate aus fremden Werken. Figuren sprechen in kurzen Sätzen; Lesestücke höchstens 90 Wörter. Keine Buchstaben in Bildbeschreibungen.

**Abgabe:** ein Pull Request nur mit deinen Dateien, Beschreibung mit Prüf-Ausgabe, Inhaltsliste und Spielzeit-Schätzung. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Ordner an, ändere keine bestehenden Dateien außer `docs/story/README.md` (eine Zeile anhängen).

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

## 1. Acht Einwohner mit Tagesplan (`einwohner.json`)

Die festen IDs stehen in den Eckdaten (`k3e_schichtwitwe` bis `k3e_signalkind`). Jeder Einwohner ist ein Roamer wie in `src/data/packs/k3_orte/maps.json` (`roamers`/`npcs` mit `tile`, `roam`), aber mit zwei Plätzen: `tag` und `nacht` (neues Feld `zeit: { tag: { map, tile }, nacht: { map, tile } | null }`; `null` nachts = verschwunden, weil der Zug fährt). Das Spiel hat keine eigene Uhr; Tag und Nacht wechseln alle 15 Minuten Spielzeit (`src/core/MusicDirector.js`, `DAY_NIGHT_SECONDS`). Schreib in `offene_punkte.md`, dass `Roamers` dasselbe Signal braucht. Je Einwohner: `name` (nur Rollenname, keine Vornamen, außer bei `k3e_zeitungsfrau` „Lotte“), `palette`, 6 Gerede-Zeilen je Akt I bis V plus eine je Ende (Format `gerede.json` unten), 1 kleiner Dienst: die Schichtwitwe verkauft heiße Kartoffeln (Nerven +5, 3 Schilling), der Kalkjunge zeigt für 2 Schilling den Weg zur nächsten sicheren Nische (Flag `k3e_nische_<karte>`), die Zeitungsfrau verkauft die aktuelle Ausgabe, der Bahnbettler tauscht Gerüchte gegen `k3o_schichttee`. Zwei Einwohner (`k3e_wagenputzer`, `k3e_steinmetzgeselle`) stehen auf der Lohnliste, die Gallowmere nachts aufruft: ab Akt IV sind sie nachts Schichtgänger (`visible_if` mit `hide_if_flags`), nach dem Ende „Feierabend“ bleiben sie nachts zu Hause, nach „Die Schicht ist vollzählig“ sind **alle acht** nachts verschwunden.

## 2. Gerede (`gerede.json`)

Format wie `src/data/packs/k3_nebenquests/` (ansehen, Gerede heißt dort vermutlich `gerede` oder `talk`; übernimm das vorhandene). 80 Zeilen: 8 Einwohner × (5 Akte + 4 Enden + 1 nach Superboss). Die Zeilen spiegeln den Stand der Stadt: Akt I Misstrauen gegen den Fremden, Akt II Gerüchte über die offene Schicht, Akt III wer nachts geantwortet hat, Akt IV Angst, Akt V Entscheidung. Kein Einwohner nennt Beweise oder löst Fährten; sie färben nur. Bedingungen über die vorhandenen Akt-Flags (`src/data/packs/k3_akte/quests.json` nachsehen) und Enden (`k3_feierabend`, `k3_stilllegung`, `k3_gegenstimme`, `k3_vollzaehlig` oder wie sie in `case.json` heißen).

## 3. Kopfgeld-Brett und sechs Stadtgegner (`stadtgegner_dunscar.json`, Format `src/data/stadtgegner.json`)

Es gibt keine Polizei in Dunscar, nur die Bahnaufsicht. Das Brett hängt im `ds_lohnbuero` (Esther verwaltet es; `interactables.ds_lohnbuero` wie `kopfgeldbrett` im Revier, Dialog `kopfgeldbrett_ds` in `dialogues.json`, Choices-Muster aus `src/data/dialogues/kopfgeld.json` übernehmen: Steckbrief ansehen → Auftrag `kopfgeld_ds_<gegner>` → `won_kopfgeld_ds_<gegner>` → kassieren). Sechs Gegner, Werte Seq 5 (vergleiche `src/data/packs/k3_orte/encounters.json`), je ein Steckbrief-Text (ohne Buchstaben im Bild, Grafik BE), Trophäe als Item, Fundort als Roamer in einem Viertel mit `visible_if` nach Akt:

| ID | Wer | Viertel | Besonderheit |
|---|---|---|---|
| `k3k_kupferdieb` | zieht Signalkabel aus den Masten | `ds_signalhang` | hat `k3o_leitungsklemme` als Beute |
| `k3k_schienenlaeufer` | läuft dem Nachtzug hinterher und springt auf | `ds_schwellenring`, nur nachts | flieht nach 3 Runden, wenn man ihn nicht stellt |
| `k3k_lohnfaelscher` | schreibt Lebende in die alte Lohnliste | `ds_arbeiterbogen` | Dialog vor dem Kampf, friedliche Lösung mit `requires_pathway: ["faden", 7]` |
| `k3k_staubschmuggler` | verkauft Kalkstaub als „weißen Schlaf“ | `ds_kalkmarkt` | Elite-Chance 0.2 |
| `k3k_walzenhehler` | handelt mit gestohlenen Stimmwalzen | `ds_bruchstufen` | ruft beim Kampfbeginn einen `nachhall` (Begleiter) |
| `k3k_signalbrecher` | sendet falsche Muster, lockt Schichtgänger | `ds_rufschlucht`, Rand | ab Akt IV, Kampf mit 2 Phasen (Format `phasen.json`) |

Dazu `lose_to` (`ds_speisewagen`, `default`), `lose_money`, `lose_text`, `flee_text`, `elite_*` wie in Kettlegate. Eine Bahnaufsichts-Streife (2 Aufseher, Roamer mit `patrol`-Feld, falls `src/data/wexmoor.json` → `police` es so nennt; sonst wie dort) läuft nachts am Endbahnhof und am Signalhang: Sie greift nicht an, sondern schickt den Spieler bei Sichtkontakt in den Speisewagen (Nerven -5), es sei denn, `k3a_bahnkarte` oder `k3a_aufsichtsmarke` ist im Gepäck.

## 4. Zeitung (`zeitung.json`)

Die vorhandene Dunscar-Zeitung heißt `dunscarer_kalkblatt` (`src/data/packs/k3_nebenquests/zeitung.json`, Format übernehmen, `kurz`-Feld beachten). 20 neue Meldungen: 10 an Akt-Flags (zwei je Akt, eine davon Lokalkolorit, eine zur Hauptgeschichte ohne Lösung), 4 an die Enden, 6 an Kopfgeld-Erfolge. Dazu 6 Anzeigen-Texte (Trödel, Steinmetz, Schaltbude, Teesaal, Walzen gesucht, Kalk zu verkaufen) als eigene `kind: "anzeige"`-Einträge, falls das Format es zulässt; sonst als Meldungen mit Präfix „Anzeige:“ im Titel.

## 5. Tiere, Wetter, Stände (`leben.json`)

Zuordnung je Karte im Format `WEXMOOR_LIFE` aus `src/world/WexmoorLife.js` (als JSON): `weather` aus `kalkstaub` (treibender weißer Staub, tags), `wind` (Grasbüschel und Fahnen, immer), `nachtnebel` (nur nachts); `animals` aus `ds_kraehe` (sitzt auf Masten, fliegt auf), `ds_kalkziege` (3 auf den Bruchstufen), `ds_staubteufel` (kleiner Wirbel, Rangierwüste), `ds_motte` (nachts an Laternen), `ds_eidechse` (Kalkmarkt, Mauern), `ds_schwalbe` (Runddepot, fliegt in Bögen). Innenräume und die Rufschlucht bleiben still; die Unterschicht hat nur `nachtnebel`. Dazu 6 Marktstände für den Kalkmarkt und 4 für den Arbeiterbogen als Deko-Objekte mit `kind: read` (ein Satz je Stand), Positionen in `platzierung.json`. Die Grafik (Tier-Sheet `fx/BA_dunscar_tiere.png`, Wetter `fx/BA_dunscar_wetter.png`, Stände als Props) liefert Paket BA; du lieferst nur IDs, Zahlen und Texte.

## 6. Prüfer, Doku, Abgabe

`pruefen.mjs`: alle Karten, Flags, Items, Dialogknoten existieren; jede Kopfgeld-Kette ist vom Brett aus erreichbar; jede Einwohner-Position liegt auf einer begehbaren Kachel (Kollision aus `maps.json`); kein Einwohner steht auf einer belegten Kachel der bestehenden Pakete. README (Spielzeit Kopfgeld: 1 Stunde), `offene_punkte.md` (Feld `zeit`, Streife ohne Polizei, Sprechblasen wie AE, Zeitungsanzeigen), `grafikwuensche.md` (an BE: 8 Einwohner-Lauf-Sheets mit Kopf, 6 Gegner-Kampf-Sheets, 6 Steckbriefe, 2 Aufseher, 6 Trophäen-Icons; an BA: Tiere, Wetter, 10 Stände).
