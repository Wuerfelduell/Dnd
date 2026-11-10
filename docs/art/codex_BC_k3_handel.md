# Codex-Paket BC: Handel in Dunscar (3 Händler, Zirkel „Schichtbund“, 5 Einzelgänger)

**Paket-Name:** `k3_handel` · **Deine Dateien:** `docs/story/k3_handel/` (acht Standarddateien, dazu `treffen_schichtbund.json`, `einzelgaenger.json`, `haendler.json`, README, offene_punkte, grafikwuensche, pruefen.mjs)

Dunscar hat bisher **keinen einzigen Laden**, keinen Zirkel und keine Einzelgänger. Kettlegate hat drei Händler (`src/data/market.json`), drei Zirkel mit Auktion (`src/data/treffen.json`) und Wexmoor hat zwei Zirkel plus die Täfelchengilde (`src/data/packs/k2_gilde/`) und sieben Einzelgänger mit Bindung (`src/data/wexmoor.json` → `loners`, `src/core/Bonds.js`). Kapitel 3 soll dieselbe Tiefe bekommen: Wo kauft man Verbandszeug, wo verkauft man die Beute aus den Brüchen, wo gibt es die Formeln und Ausrüstung, die zu Seq 5 bis 1 passen, und wer sind die Leute, die abseits der Hauptgeschichte ihr eigenes Spiel spielen.

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

## 1. Drei Händler (`haendler.json`, Format `src/data/market.json` → `merchants`)

| ID | Wer | Wo | Sortiment |
|---|---|---|---|
| `k3h_troedlerin` | Ida Marrow, 60, Witwe eines Rangierers, handelt mit allem, was Familien zurückließen | `ds_kalkmarkt`, Trödelstand | Verbrauch (`k3o_kalkpastille`, `k3o_schichttee`, `k3o_filzverband`, `verband`, `tonikum`, `riechsalz`), 6 Kleidungsstücke der Arbeiterstadt (neue `gear`-Items, Slots `hut`/`mantel`/`amulett`, Werte zwischen Wexmoor-Ausrüstung und den Prüfungsbelohnungen; Boons im Artefakt-Format wie in `src/data/items.json` → `kind: gear`), kauft Beute aus den Brüchen an |
| `k3h_steinmetz` | Bram Tolley, Steinmetz, spricht wenig, schlägt Grabsteine ohne Namen | `ds_kalkmarkt`, Steinmetzhof | Materialien (`k3o_kreidestaub`, `k3o_ventilspan`, `k3o_schlagkern`), 2 Waffen (Fäustel, Steinmeißel als Stockdegen-Ersatz; Format wie `schlagstock`), Gravur-Dienst: ein Namenstäfelchen (`schreintaefelchen`-Stil) für 60 Schilling, Flag `k3h_taefelchen` |
| `k3h_lampenwart` | Cato Finch, ehemaliger Signalwart, repariert, was Gallowmere stillgelegt hat | `ds_signalhang`, Schaltbude | Ruf-Zubehör: `k3o_rufwachs`, `k3o_trichterglas`, `k3o_leitungsklemme`, `k3o_prueflinse`, `k3o_stillring`; verkauft die **Formeln Seq 4 bis 1** der zehn Pfade **nicht** (die bleiben bei Kittering, `src/data/sequenzen.js`), aber je Pfad ein Hilfsmittel für die Prüfung (10 neue Verbrauchs-Items `k3h_hilfe_<pfad>`, einmal nutzbar, kleiner Vorteil im Prüfungskampf, Effektformat wie vorhandene Verbrauchs-Items) |

Alle drei mit `npcs.json`-Eintrag (`palette` wie die `k3_*`-Figuren, Grafik macht BE), Platz in `platzierung.json`, Begrüßungsdialog mit 3 bis 4 Knoten (Kaufen über die bestehende `shop`-Choice wie bei `gorse`, ansehen in `src/data/dialogues/`), je ein kleiner Nebenauftrag (15 Minuten): Ida sucht den Besitzer eines Mantels (`k3h_mantelbesitzer`), Bram will einen Stein ohne Namen im Klopfbruch vermessen (`k3h_steinmass`, Gefahrengebiet), Cato braucht drei `k3o_leitungsklemme` aus der Rufschlucht (`k3h_klemmen`). Preise für Verkauf (`sell_prices`) der zwölf `k3o_*`-Beutestücke. Ankauf für Trophäen der Dunscar-Gegner.

## 2. Zirkel „Der Schichtbund“ (`treffen_schichtbund.json`, Format `src/data/packs/k2_gilde/treffen_namensgilde.json`)

Ein stiller Bund ehemaliger Schichtführer, die die gestrichenen Namen in Kerbhölzern bewahren und untereinander Stimmreste, Werkzeug und Formeln tauschen. Sie halten Gallowmere für einen Verräter an den Namen, misstrauen aber auch dem Ermittler.
- `circles.schichtbund`: `name`, `member_flag: "treffen_schichtbund"`, `map: "treffen_schichtbund"`, `short`, `city: "dunscar"`, `invite`-Text, **Aufnahme-Auftrag** `k3h_aufnahme` (Hinweis bei Dora am Kalkmarkt → Kerbholz mit dem eigenen Namen schneiden lassen (Bram) → Nachtbesuch im Runddepot, Rufmuster vorzeigen (`requires_pattern`, falls Paket BN es liefert; sonst `requires_flags` auf ein `k3a_ruf_*`-Journalflag) → Flag `treffen_schichtbund`).
- Gastgeberin `zirkel_schichtbund` ohne Laden; Waren bei den drei Mitgliedern `tm_ds_lampe`, `tm_ds_kerbholz`, `tm_ds_stimme` als `offers` (Chance, Preis, `once`, `requires_pathway`, `locked_text`) und `wants`. Angebote: Formeln Seq 6 und 5 der **neuen** Pfade (`formel_sq_waage_6` usw., prüfe die IDs in `src/data/packs/sequenzen/`) als Zweitquelle neben Wexmoor, Ausrüstung der Arbeiterstadt, `k3o_rufwachs`, seltene Trophäen; **keine** Kernzutaten Seq 5 bis 1 (exklusive Herkunft laut AU).
- Drei Mitglieder-Aufträge (je 20 Minuten) mit Bindungswirkung, einer davon nur nachts (siehe BD-Feld `zeit`).
- `rules.orders.dunscar: ["schichtbund"]`, Treff-Intervall wie Wexmoor. Karte `treffen_schichtbund` als neue Innenraum-Karte (Format `src/data/packs/k3_orte/maps.json`, Thema `ds_runddepot` wiederverwenden; Grafikwunsch für eigene Props an BE), Pin für die Stadtkarte (`pins`, Position unter dem Schwellenring auf der 512×288-Karte) und Reiseeintrag.

## 3. Fünf Einzelgänger (`einzelgaenger.json`, Format `src/data/wexmoor.json` → `loners`)

| ID | Pfad | Wer | Ort |
|---|---|---|---|
| `ez_ds_rangierer` | eisen | Holm Varley, kuppelt nachts allein Wagen, die niemand bestellt hat | `ds_schwellenring`, Drehscheibe |
| `ez_ds_kalkbrennerin` | kessel | Senta Quill, brennt Kalk im letzten Ofen und verkauft „weißen Schlaf“ | `ds_bruchstufen`, Ofen |
| `ez_ds_streckenlaeufer` | sq_uhr | der Streckenläufer, geht die Strecke im Takt ab und meldet Zeiten, die keiner braucht | `ds_signalhang`, Bahnsteig |
| `ez_ds_walzenstimme` | echo | Jory Pell, Junge mit einem Phonographentrichter, spricht nur mit fremden Stimmen | `ds_arbeiterbogen`, Platz |
| `ez_ds_schrankenkind` | sq_moor | Wenna, sammelt Kerben von den Schranken und weiß, wer fehlt | `ds_endbahnhof`, Schranke |

Je Einzelgänger: Dialogbaum mit Bindung -3 bis 3 (Effekt `bond`, Bedingungen `requires_bond`/`requires_bond_max`, Flags `<id>_freund`/`_feind`/`_getroffen`/`_besiegt`), ein Kampf (`encounters.json`, `loner: true`, `chapter: 3`, Werte Seq 5, Sheet-Platzhalter in `grafikwuensche.md`), eine Gabe bei Freundschaft (ein Artefakt oder Rezept, Format `src/data/packs/k3_orte/artifacts.json`), ein Verrat bei Feindschaft (Alarm bei einer Horchstelle, Flag für Paket BN in `offene_punkte.md`). Wer den Pfad des Einzelgängers teilt, bekommt einen Extrasatz. Zwei der fünf reagieren auf das Wexmoor-Ende (`k2_rein`, `k2_moor`, `k2_lichtmeister`, `k2_meer`, Flagnamen in `src/data/wexmoor.json` nachsehen).

## 4. Prüfer, Doku, Abgabe

`pruefen.mjs`: alle IDs existieren, jeder Auftrag erreichbar, kein Angebot enthält eine Kernzutat Seq 5 bis 1, Preise plausibel (Seq-5-Formel teurer als Seq-6-Formel), Pin innerhalb 512×288. README mit Spielzeit (Ziel: 2 Stunden zusätzlich), `offene_punkte.md` (Merge von `rules.orders.dunscar` ohne flaches Ersetzen, Pin auch in `travelRules.cities.dunscar.pins`, Zeitfenster-Feld), `grafikwuensche.md` (an BE: 3 Händler, 4 Zirkelfiguren, 5 Einzelgänger mit Kampf-Sheet, Treffpunkt-Props, 6 Kleidungs-Icons, 2 Waffen, 10 Hilfsmittel; an BB nichts, BB hat eine feste Liste).
