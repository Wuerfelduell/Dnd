# CT · Die Stadt, die das Meer vergaß

Hauptakte für Kapitel 6 in Varrowmouth, zum separaten Einbau. 5 Akte mit je 4 Fährten, 60 Hinweise, 20 Verknüpfungen, 60 Dialoge mit 162 Knoten, 7 Ratsverhöre, 5 Anreisevarianten, 12 Zwischenszenen und 4 Enden. Ausschließlich Daten und Texte; keine Änderungen unter `src/` oder `public/`.

## Geschichte und Ermittlungsweg

| Akt | Frage und vier Fährten | Abschluss |
|---|---|---|
| I · Der Eintrag | Warum steht dein Name schon hier? Stempel, falsches Datum, Lotsenmarke, stummer Schreiber. | Tam zeigt den Schmuggelweg; ein Brief aus Fall 9 erklärt die Eintragung. |
| II · Ebbe | Was verschwindet beim Vergessen? Schlicknamen, Wrackseite, Nells Gabe, Wrackmutter. | Nell erreicht die Lotsenkammer; der Kampf öffnet die lose Registersammlung. |
| III · Der Pegelrat | Wer deckt dich, wer verschweigt Verantwortung? Einladung, Pegelkurve, Registeramt, Hafenprotokoll. | Wahl zwischen `vmn_rat_1` und `vmn_rat_4` nach deren aufgedeckter Lüge. |
| IV · Das alte Leuchtfeuer | Welche Flut droht wann? Schreibbuch, Glocke, Totenliste, zwei Pegelkurven. | Osric gesteht; der Leuchtfeuerwächter wird überwunden und der wehrlose Mensch geschont. |
| V · Das Register schließen | Wer trägt die Namen? Harrows Körper, Ratszeuge, Nells Antwort, offene Schlusszeile. | Zwei Kampfphasen oder Vorlesen nach Phase 1; danach gesonderte Endentscheidung. |

Jede Fährte verlangt drei gefundene Hinweise und einen Schluss aus dem ersten Faktenpaar. Beim Rat stammt der dritte Hinweis aus der dritten Verhörantwort. Die vier Fährten eines Akts werden anschließend an der Bilanzstation zusammengeführt. Die ersten vier Akte geben jeweils einmal 20 Schilling; das Finale belohnt mit der ausdrücklich gewählten Weltfolge. Kein Hinweis wird durch Flut gelöscht. Der Zirkelzugang ist kein Pflichtbeweis: Beziehungshürden bei Tam können die Hauptakte nicht blockieren.

## Dateien

| Datei | Aufgabe |
|---|---|
| `case.json`, `faelle.json` | Vorhandene Fallfelder facts/clues/deductions/endings plus ausdrücklich angefragte `akte`-Übersicht mit Fragen, Fundorten und Abschlussprosa. |
| `quests.json` | Fünf Hauptquests, eindeutige Schritte und Ziele. |
| `dialogues.json` | Hauptgespräche, Ratsfragen, Anreise, Bossbestätigungen, Bilanz, Schlusswahl und lesbare Szenen. |
| `anreise.json` | Vier Briarholt-Quellen und ein Koop-Zusatz, je zehn Zeilen; Quellplatzierung wie CG. |
| `encounters.json` | **Nur narrative Referenzverträge**, keine Kampfdefinitionen. CZ liefert sämtliche Werte. |
| `npcs.json` | Leer: Figuren und Namen gehören CX. |
| `sprecher_bindung.json` | Zwölf bestehende/reservierte Sprecher-IDs auf CT-Hauptdialoge abbilden, CX-Alltagsdialoge erhalten. |
| `platzierung.json` | Sprecher, Fundorte, Stationsdialoge und Szenen; `gezeit` plus bereits unterstützte Flagbedingungen. |
| `szenen.json` | Zwölf `szene`-Einträge mit je sechs Zeilen. `szene` bezeichnet Textmetadaten, keine erfundene Bild-ID. |
| `epiloge.json`, `koop_epiloge.json` | Zehn Grundkarten je Ende; zwei Alternativen für die schließende Hand und zwei Sichtweisen des geteilten Endes. |
| `abspann.json` | Je zwanzig kurze Zeilen pro Ende. |
| `zeitung.json` | Zwanzig Berichte nach Fährten und vier Meldungen je Ende. |
| `pruefen.mjs` | Strukturprüfung und 128 Abläufe mit dem echten `GameState`, mit zwölf minimalen CX-Sprecherhüllen ausschließlich im Test. |

## Anschlüsse

1. CU-Karten und CX-Figuren vor CT laden. Normale Paketfelder `case`, `faelle`, `quests`, `dialogues` übernehmen. `encounters.json` **nicht** an `applyQuestPack` als Kampfdaten übergeben; stattdessen CZs vier kanonische Kämpfe auflösen. Die zusätzlichen Textmetadaten selektiv an die entsprechende Oberfläche anschließen.
2. Die vier Reiseobjekte aus `anreise.json` an `bh_buegelraum` und dessen bestehende warme Variante anbinden. Voraussetzung ist `kapitel5_done` plus genau eines von `bha_end_wahl`, `bha_end_winter`, `bha_end_verwahrt`, `bha_end_schmerzlos`. Erst nach ausdrücklicher Reisebestätigung `k6_arrived` setzen und am CU-Spawn `vm_zollhafen/default` landen. Kein Rückreiseziel wird erzeugt. Koop ergänzt die gewählte Herkunft, ersetzt sie nicht.
3. CU übernimmt die vorgeschlagenen Koordinaten aus `platzierung.json`, prüft sie gegen echte Geometrie und verschiebt sie nötigenfalls. CT liefert keine Karten. NPCs nicht doppelt hinzufügen, wenn CX sie bereits platziert. Hauptdialoge über `sprecher_bindung.json` als Optionen anschließen; Stationsdialoge sind der lesbare Fallback. Ermittlungsgespräche und Fundobjekte pausieren den Gezeitentakt oder werden vor dem Wechsel ohne Beweisverlust geschlossen.
4. CU besitzt die gegenseitig ausschließenden flüchtigen Flags `gezeit_ebbe` und `gezeit_flut`. CT liest sie nur. Schlickgassen, Wrackfeld und Registerkeller sind Ebbeorte; die Leuchtbank ist mit Tams für die Ermittlung zugesagter Bootsfahrt bei beiden Zuständen erreichbar. Diese Pflichtfahrt darf nicht hinter der optionalen Beziehung-+4-Bootsfreigabe von CX liegen.
5. Flut beendet offene Wrackkämpfe ohne Strafe und **ohne Siegflag**. Ein begonnener Bosskampf ist kein Abschluss. Bei der Pegelherrin nach `won_pegelherrin` in den Zwischendialog zurückkehren; Phase 2 ist `pegelherrin_register`. Nach deren Sieg oder dem belegten Vorlesen setzt CT `k6_pegelherrin_geloest`.
6. CZs nicht angreifende Menschenform des Leuchtfeuerwächters beendet die Kampfstrecke; CT legt die Hauptaktenfortsetzung auf Verschonen fest. `won_leuchtfeuerwaechter` muss erst nach dieser Auflösung gesetzt werden. Kein CT-Knoten fordert einen Angriff auf den Wehrlosen. Bis zur finalen CZ-Schnittstelle ist dies ein ausdrücklicher Vertrag.
7. `requires_relation` und `relation` sind die vorhandenen NPC-Beziehungsfelder. Drei einmalige, beleggebundene Osric-Gespräche geben zusammen +3; alle vier geschlossenen Akt-IV-Fährten plus Osric ≥ +3 und Phase-1-Sieg erlauben das Vorlesen. Tam gewinnt ebenfalls drei einmalige Beziehungspunkte durch Hilfe, Schutz der Marke und Nells Rettung. Ihr Zirkelzugang verlangt +3. CX muss die Profile unter denselben NPC-IDs führen, nicht daneben einen zweiten Bond-Zähler.
8. Der Ratszeuge wirkt erst nach `k6_zeuge_bereit`. Der Zollrat liefert `k6_zeuge_eintragung`; der Hafenrat zusätzlich `k6_zeuge_ausgang` und eine bestätigte Räumung. CZ halbiert entsprechend seiner Vorgabe die Sperrdauer durch Eintragen; CT erfindet keine eigenen Kampfwerte.

## Enden, Koop und Sequenz 1

| Ende | Unmittelbare Folge | Anschluss DD |
|---|---|---|
| `k6_ende_schliessen` | Gewählte Hand trägt die Namen; freie Ausreisen, Küstenschutz für Jahre. | `k6_done` + Ende + `k6_seq1_zugang` erlauben die Letzten Register. Kein automatischer Aufstieg. |
| `k6_ende_verbrennen` | Harrow stirbt, sofortige Flut; `k6_raeumung_bereit` ist Pflicht. | Bewusster Verzicht, `k6_seq1_verzicht`; DD zeigt den pfadspezifischen Verzicht, keine Aufstiegsoption. |
| `k6_ende_uebergeben` | Nell stimmt ausdrücklich zu; der Spieler bleibt ihr Schreiber. | `k6_seq1_spaeter` ist eine spätere Möglichkeit, keine sofort erfüllte Ritualvoraussetzung. DD muss die tragfähige Neuordnung vor einer Freigabe prüfen. |
| `k6_ende_teilen` | Nur mit `koop_aktiv`; beide tragen und bleiben. | Beide verzichten; kein einzelner Spieler darf danach durch eine Solo-Prüfung aufsteigen. |

Alle vier setzen `k6_done`. Dieses Flag bezeichnet den Abschluss der Hauptakte, nicht den bereits vollzogenen Seq-1-Aufstieg. Reihenfolge: Endwahl → passende Grundepiloge → bei Schließen DD-Prüfung oder ausdrücklicher Verzicht → DD-Zusatzkarte → CT-Abspann. Bei Übergabe darf die spätere Möglichkeit offenbleiben; der bittere unmittelbare Epilog behauptet keine Befreiung Nells. CT setzt `seq1_register_<pfad>_done` und `seq1_verzicht` nicht selbst; DD besitzt diese Ritualflags. Der Seq-2-Grenzbezirk bleibt ein CO/CP-Anschluss von `vm_grenzzaun` nach `hg_grenzbezirk`, kein CT-Ritual.

Im Koop muss die Oberfläche vor `k6_schliessender_p1`/`p2` und dem geteilten Ende **beide Spieler zustimmen lassen**. Die Dialogtexte und zwei alternativen Trägerepiloge liegen vor; ein einzelner Klick des Hosts ersetzt keine zweite Zustimmung. Endbestätigung und Trägerwahl atomar gegen aktuelle Flags prüfen; nur eine Endmarke zulassen. Der bestehende `GameState.setEnding` prüft Voraussetzungen nicht selbst, daher dürfen Aufrufer den Choice-Guard nicht umgehen. Das gilt auch nach Laden eines Spielstands.

Die Bestellung verlangt zehn Karten, nennt aber zwölf Themen. Deshalb teilen Varrowmouth und die Unverzeichneten eine Karte, Nell und der Spieler eine zweite. Tam, Osric, Rat und jede der fünf früheren Städte erhalten jeweils eine eigene Karte. Frühere Stadtenden werden weder überschrieben noch pauschal in ein glückliches Ende umgedeutet.

## Prüfung und Grenzen

`node docs/story/k6_akte/pruefen.mjs`

Der Test prüft alle vier Briarholt-Herkünfte, beide Ratszeugen, Kampf/Vorlesen und acht Solo-/Koop-Ausgänge: 128 Datenabläufe. Er nutzt echte Bedingungen, Effekte, Hinweisvergabe und Schlussbildung. Da `changeRelation` unbekannte Figuren ignoriert, legt der Test zwölf minimale Sprecherhüllen mit der jeweiligen technischen ID als Name an. Sie ersetzen keine CX-Lieferung und werden nicht in die Paketdaten geschrieben. CZ-Siege werden nur als ausdrücklich simulierte Resultate eingespielt; weder Kampfbalance noch Laufwege noch Koop-Netzwerk werden behauptet. Externe IDs sind gegen die Aufgabenverträge abgeglichen, nicht gegen bereits vorhandene CU/CX/CZ-Lieferungen.

Die Textwortzahl zählt JSON-Prosa einschließlich absichtlich wiederholter Hinweis-, Vorschau- und Quelltexte. Sie ist keine Zahl einzigartiger Wörter und keine gemessene Spielzeit. `pruefbericht.md` enthält den tatsächlichen Lauf.
