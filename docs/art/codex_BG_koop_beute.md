# Codex-Paket BG: Getrennte Beute im Koop (Ansprüche je Spieler, Ersatz verlorener Tränke)

**Paket-Name:** `koop_beute` · **Deine Dateien:** `src/core/Claims.js` (neu, ohne Phaser), `src/data/packs/koop_beute/ansprueche.json`, `src/data/packs/koop_beute/ersatz.json`, `src/data/packs/koop_beute/texte.json`, `src/data/packs/koop_beute/dialog_zusaetze.json`, `tests/koop_beute.test.js`, `docs/story/koop_beute/` (README, offene_punkte, pruefen.mjs)

Im lokalen Koop (`src/core/Party.js`) teilen sich beide Spieler Geld, Ansehen, Fälle und Flags; Inventar, Ausrüstung, Pfad und Rituale sind persönlich (`PERSONAL`, `withPlayer(2, fn)`, Flags `p2_ritual_<pfad>_<seq>`). Beute dagegen fällt bisher **einmal** und landet beim handelnden Spieler. Das bricht in Kapitel 3: Die Kernzutaten der Sequenzen 5 bis 1 kommen genau einmal vom jeweiligen Boss bzw. von Hedda nach der Prüfung (`docs/story/k3_pruefungen/offene_punkte.md`, Abschnitt „Herkunft und Ersatzbeschaffung“), gefiltert auf den Pfad des Spielers (`requires_pathway` in `GameState.meets`). Spieler 2 mit anderem Pfad geht leer aus, mit gleichem Pfad bekommt nur einer die Zutat. Dazu fehlt der Ersatz, wenn ein Trank oder eine Zutat verloren geht. Du lieferst die Regeln als reine Logik, die Daten, die Texte und Tests. Seb verdrahtet sie danach in `GameState`, `CombatScene` und den Dialogen.

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

- Lies zuerst: `src/core/Party.js`, `src/core/Loot.js`, `src/core/Pathways.js` (Rituale, `ritualFlag`), `src/core/GameState.js` (`meets`, `applyEffects`, `meetsPathway`, Lager `storage`/`storeItem`), `src/data/sequenzen.js`, `src/data/packs/k3_pruefungen/` (Quests, Hedda-Dialoge, Zutatenherkunft), `src/data/packs/k3_orte/beute_vorschlag.json`, `docs/story/k3_pruefungen/offene_punkte.md`, `docs/story/koop/offene_punkte.md`, `tests/duo.test.js`.
- **Kein Phaser-Code, keine bestehende Datei ändern.** Was in `GameState.js`, `CombatScene.js`, `Ui.js` eingebaut werden muss, beschreibst du in `offene_punkte.md` als genaue Anleitung (Datei, Stelle, Vorschlag in wenigen Zeilen).
- Keine zweite Belohnung einfach global freischalten: Geld, Ehre und Questabschluss bleiben **einmal** pro Spielstand. Nur persönliche Dinge (Kernzutaten, Prüfungs-Beute, Ritualfortschritt, Artefakte mit `personal: true`) gibt es je Spieler.

## 1. `Claims.js`: Ansprüche je Spieler

Exportiere `claimMethods` (per `Object.assign` an `GameState.prototype`) und Hilfsfunktionen. Zustand `this.claims`: `{ "<quelle>": { "1": "offen|eingeloest|verfallen", "2": … } }`, gespeichert über `serializeClaims()`/`loadClaims()`.

- **Quelle** = Ereignis, das persönliche Beute auslöst: Boss bewältigt (`won_<boss>` **oder** `k3o_<boss>_geloest`), Prüfung bewältigt (`k3p_<pruefung>_bewaeltigt` oder wie das Flag in `k3_pruefungen` heißt, nachsehen), Artefaktfund (`sq_*` aus `beute_vorschlag.json`). Die Liste der Quellen mit ihrer persönlichen Beute je Pfad steht in `ansprueche.json`.
- `openClaims(source)`: wird beim Setzen des Quellflags aufgerufen; legt für **jeden aktiven Spieler** (`hasP2()`) einen offenen Anspruch an, auch wenn er gerade K.o. ist oder nicht gekämpft hat. Ein später hinzukommender Spieler 2 bekommt für bereits bewältigte Quellen ebenfalls einen offenen Anspruch (Regel „nachträglich beanspruchbar“ aus AU).
- `claimFor(source, player)` → `{ item, qty, reason }` oder `null`: wählt aus `ansprueche.json` den Eintrag für den Pfad **dieses** Spielers (`withPlayer(player, () => this.pathway)`), Seq-Grenze beachten (`requires_pathway: [pfad, seq]` mit der Semantik aus `meetsPathway`). Kein Pfad (Seq 10) → `reason: 'kein_pfad'`, Anspruch bleibt offen.
- `redeem(commandId, source, player)`: zahlt genau einmal aus (gleiche Befehls-ID zweimal → einmal), Item in das Inventar **dieses** Spielers, Anspruch `eingeloest`, emit `claim` mit `{ source, player, item }`. Wer beim Boss nicht dabei war, löst bei Hedda ein (Dialog unten), wer dabei war, sofort nach dem Kampf; beides über dieselbe Funktion.
- `forfeit(source, player, why)`: Anspruch `verfallen` (z. B. Ende „Stilllegung“ zerstört die Anlage; dann bleibt die Zutat des Superbosses unerreichbar, Text aus `texte.json`).
- Dialog-Bedingungen für `meets` (als `meetsClaims(o)`): `requires_claim: "<quelle>"` (offener Anspruch des handelnden Spielers), `requires_claim_missing: "<quelle>"`. Effekt für `applyEffects` (als `applyClaims(e)`): `claim: "<quelle>"` (löst für `this.acting` ein).

## 2. Ersatz verlorener Tränke und Zutaten (`ersatz.json`)

Die Regel aus AU, als Daten und Logik: Ersatz gibt es pro Spieler nur, wenn (a) die Quelle bewältigt ist, (b) die Zielstufe noch nicht erreicht ist, (c) die Kernzutat fehlt und (d) der Zieltrank weder im Inventar noch im Lager (`storage`, beide Verstecke) liegt. `replacementFor(player, seq)` prüft genau das und gibt `{ item, where: 'hedda'|'pfiff'|'kittering', cost }` zurück: Kernzutaten Seq 5 bis 1 bei Hedda als **sichere Wiederholungsprobe** (kein Kampf; gibt nur die Zutat, kein Geld, keine Ehre, kein Questabschluss); Formeln bei Kittering erneut kaufbar zum alten Preis (`src/data/sequenzen.js` → `KITTERING`), aber nur bei fehlendem Trank; Tränke Seq 9 bis 6 beim bisherigen Verkäufer gegen Geld (Preis = Formelpreis der Stufe). Seq 9: Pfadauswahl muss vor dem Erstkauf möglich sein, obwohl noch kein Trank getrunken wurde (Regel im Code vermerken, Einbau beschreiben).

`ersatz.json` listet je Stufe und Pfad: Zielitem, Quelle, Ersatzort, Preis, Bedingungstext. 10 Pfade × Seq 9 bis 1.

## 3. Texte und Dialogzusätze

`texte.json`: Meldungen für `claim` (Boss, Prüfung, Fund, je Spieler: „Spieler 2 nimmt den Schlagkern an sich.“), offener Anspruch im Notizbuch (ein Satz je Quelle), Hinweis bei fehlendem Pfad, Verfall, Ersatz-Angebot, Ablehnung (Trank liegt noch im Lager: „Dein Lager im Speisewagen hält schon einen. Hol ihn erst.“). Höchstens 140 Zeichen, deutsch.

`dialog_zusaetze.json` (nur `choices_add`/`nodes_add`, Figuren existieren): **Hedda** (`k3_weichenstellerin`): „Mein Anspruch“ (`requires_claim`), „Eine Probe wiederholen“ (Ersatz-Zutat; Bedingungstext erklärt, warum nein), für Spieler 2 eigene Sätze (`requires_p2`, falls es die Bedingung gibt, sonst in `offene_punkte.md` erbitten). **Pfiff** (`k3_pfiff`): verweist auf Hedda und erklärt den Lagerschrank im Speisewagen. **Kittering** (Kettlegate): Formel erneut kaufen. Dazu der Notizbuch-Text für den Pfad-Tab: „Offene Ansprüche“ als Liste.

## 4. Tests und Prüfer

`tests/koop_beute.test.js` (vitest, Inhalt über `tests/helpers.js` → `loadContent()`, GameState mit `claimMethods` angehängt; Koop über `addP2()` wie in `tests/duo.test.js`): gleicher Pfad, beide bekommen je eine Zutat, Geld nur einmal; verschiedene Pfade, jeder seine; Spieler 2 ohne Pfad behält den Anspruch offen und löst nach Pfadwahl ein; Spieler 2 tritt nach dem Boss bei und bekommt einen Anspruch; derselbe Befehl zweimal zahlt einmal; K.o.-Spieler bekommt trotzdem; Entfernen von Spieler 2 behält seine Ansprüche; Ersatz greift nur bei (a) bis (d), Trank im Lager blockiert; Speichern und Laden. `docs/story/koop_beute/pruefen.mjs` prüft die Daten (jede Quelle existiert als Flag im Inhalt, jedes Item existiert, 10 Pfade × 9 Stufen vollständig).

## 5. Doku und Abgabe

`docs/story/koop_beute/README.md` (Regeln als Tabelle: was gemeinsam, was persönlich), `offene_punkte.md` (Einbau: `GameState.setFlag`/`addFlag` ruft `openClaims`; `CombatScene.over` ruft `redeem` für anwesende Spieler; `Ui` zeigt offene Ansprüche im Pfad-Tab mit G-Umschaltung; `beute_vorschlag.json` kann danach importiert werden). Pull Request nur mit deinen Dateien, Testausgabe in die Beschreibung.
