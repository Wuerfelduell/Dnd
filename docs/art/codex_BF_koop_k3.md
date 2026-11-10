# Codex-Paket BF: Koop in Dunscar (Geplauder, Reaktionen, Rufen zu zweit, zwei Aufträge)

**Paket-Name:** `koop_k3` · **Deine Dateien:** `docs/story/koop_k3/` (acht Standarddateien, dazu `geplauder.json`, `kampf.json`, `bindung.json`, README, offene_punkte, grafikwuensche, pruefen.mjs)

Paket AI (`src/data/packs/koop/`, `src/core/Koop.js`) hat Spieler 2 in Kettlegate und Wexmoor zum Leben erweckt: 80 Gespräche unterwegs, Kampfsprüche in zwei Stimmen (`p2a` „der grüne Mantel“, `p2b` „die Schreibmappe“), Reaktionen von zwölf Figuren und drei Aufträge nur zu zweit. **Dunscar hat davon nichts**: kein einziges Gespräch auf den 18 `ds_`-Karten, keine Reaktion der elf Kapitel-3-Figuren, und die Kernmechanik „Rufen, horchen, schweigen“ kennt Spieler 2 nur als Regel („Bindung ist persönlich“), nicht als Text. Du schreibst das nach, im selben Format und in denselben zwei Stimmen.

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

## 0.1 Vorher lesen
`docs/story/koop/hintergrund.md` (wer Spieler 2 ist, beide Varianten), `docs/story/koop/offene_punkte.md` (Regeln für Geplauder, Kampfsprüche, Rollenobjekte), `src/data/packs/koop/geplauder.json` und `kampf.json` (Format exakt übernehmen), `src/core/Koop.js`, `docs/story/kapitel3/geschichte_3.md`, `docs/story/k3_orte/rufmechanik.md`, `src/data/packs/k3_akte/dialogues.json` (Stimmen der elf Figuren). Spieler 2 ist mit dem Ermittler aus Wexmoor geflohen (eine der vier Enden-Anreisen in `docs/story/k3_akte/anreise.json`), kennt Dunscar nicht und hat einen eigenen Pfad.

## 1. Geplauder (`geplauder.json`): 40 Gespräche

`koop_pl_ds_01` bis `koop_pl_ds_40`, Format wie `koop_pl_kg_01` (`map`, `requires_flags: ["koop_aktiv", …]`, `zeilen` mit `p: "p2"` in `a`/`b` und `p: "p1"`). Verteilung: jede der 18 `ds_`-Karten mindestens einmal, die sechs Viertel je dreimal (Akt I, Akt III, Akt V), der Speisewagen viermal (nach jedem Akt), Nachtzug und Letzter Bahnsteig je zweimal, Gefahrengebiete je einmal, Unterschicht einmal. 6 der 40 hängen an den Wexmoor-Enden (Flags aus `src/data/wexmoor.json` → `case.endings`), 4 an Pfaden von Spieler 2 (`requires_pathway` gilt für den handelnden Spieler; vermerke in `offene_punkte.md`, dass das Geplauder den Pfad von Spieler 2 prüfen muss), 4 an gefundenen Rufmustern (Flag aus `rufmuster.json` → `gefunden_durch`). Themen: der Staub, der Zug, Pfiff, die fehlende Note, wer von beiden zuerst antworten würde, die Bindung, Heimweh nach Kettlegate, Streit über Gallowmeres Argument. Je Gespräch 3 bis 5 Zeilen, trockener Humor, nie Lösung einer Fährte.

## 2. Kampfsprüche (`kampf.json`): drei neue Anlässe

Die neun Anlässe aus AI gelten weiter. Du ergänzt **nur** drei neue Schlüssel, je 10 `p2a`-, 10 `p2b`-, 5 `p1`-Zeilen: `koop_schichtgaenger` (Kampf gegen einen lebenden Arbeiter, nicht töten), `koop_nachhall` (der Gegner wiederholt Bewegungen des Partners), `koop_pruefung` (Sequenz-Prüfung; der andere Spieler darf nur zusehen, Hedda nimmt einen nach dem anderen ab; Text dafür). Dazu 5 Zeilen je Stimme für den Moment, in dem der Partner gebunden ist („Du hörst dich an wie die Lohnliste.“).

## 3. Rufen zu zweit (`bindung.json`)

Für jede der sechs Horchstellen (`k3o_horch_*`) Texte für beide Sprecher: Wer ruft, wer horcht (`texte` für „Spieler 1 ruft, Spieler 2 steht in der Nische“ und umgekehrt), die ausdrückliche Warnung vor der privaten Namensantwort in der Stimme der jeweiligen Figur (p2a kürzer, p2b förmlicher), der Zustand „gebunden“ (3 Geplauder-Zeilen je Stimme, die der Gebundene in dienstlichen Wendungen spricht, der andere merkt es), die Schleuse (Erleichterung, 2 Zeilen). Koop-Regel aus `rufmechanik.md` als Text: „Ein Gerät, zwei Sprecher; ein Befehl zählt einmal.“ Paket BN liest diese Texte über `texte.json`-ähnliche IDs; vermerke die IDs in `offene_punkte.md`.

## 4. Reaktionen der elf Figuren (`dialog_zusaetze.json`)

Für `k3_pfiff`, `k3_gallowmere`, `k3_willa`, `k3_oren`, `k3_mabel`, `k3_pelham`, `k3_nellie`, `k3_huxford`, `k3_esther`, `k3_adaine`, `k3_weichenstellerin` je ein `choices_add` am Startknoten (prüfe in `src/data/packs/k3_akte/dialogues.json` und `k3_pruefungen`, wie der Einstiegsknoten heißt; Hedda startet eventuell anders) mit `requires_flags: ["koop_aktiv"]`, 2 bis 3 Knoten: Die Figur bemerkt die zweite Person. Pfiff bietet eine zweite Koje an (Flag `koop_ds_koje`), Gallowmere zählt beide („Zwei Antworten mehr.“), Mabel deckt zwei Teller, Hedda erklärt, dass sie Prüfungen nur einzeln abnimmt und der zweite Pfad eigene Zutaten braucht (passt zu Paket BG), Esther fragt nach dem Namen für die Lohnliste und bekommt keinen. Keine Belohnungen außer Flags und höchstens 5 Nerven.

## 5. Zwei Aufträge nur zu zweit (`quests.json`, `platzierung.json`, `dialogues.json`)

Format und Rollenregeln wie `koop_zwei_schluessel` (`docs/story/koop/offene_punkte.md`, Abschnitt „Gemeinsame Regeln“): Rollenobjekte `koop_ds_<auftrag>_p1`/`_p2`, flüchtige Flags, Erfolg nur bei gleichzeitig gültigen Rollen.
- `koop_ds_horchen` (Schwellenring, ab Akt II): Spieler 1 ruft an der Drehscheibe (`k3o_horch_drehscheibe`, kostet eine Ladung), Spieler 2 steht am Hinterzugang des Runddepots und meldet, wo das Echo ankommt; drei Richtungen, eine stimmt. Belohnung: der Hinterzugang bleibt dauerhaft offen (Flag `koop_ds_hinterzugang`), 40 Schilling, Bindung zu Pfiff +1.
- `koop_ds_schleuse` (Speisewagen → Rufschlucht, ab Akt IV): Die Schallschleuse am Rand der Rufschlucht klemmt. Spieler 2 hält innen den Hebel, Spieler 1 geht gebunden hinaus, holt einen `k3o_trichterglas`-Splitter aus 6 Kacheln Entfernung und kommt zurück, bevor drei Gegner-Runden um sind (als Dialogschritte, keine Echtzeit). Erfolg löst die Bindung; Belohnung: `k3o_stillring` (Artefakt aus `k3_orte`), 60 Schilling. Wer die Rollen tauscht, bekommt andere Zeilen.

## 6. Prüfer, Doku, Abgabe

`pruefen.mjs`: 40 Geplauder-IDs eindeutig, jede `map` existiert, jede Flag-Referenz existiert, jede Figur hat einen Zusatz, beide Aufträge erreichbar, keine Zeile über 160 Zeichen. README, `offene_punkte.md` (Pfadprüfung für Spieler 2 im Geplauder, Rollenadapter, Text-IDs für BN), `grafikwuensche.md` (höchstens 3 Requisiten; Figuren kommen aus AH).
