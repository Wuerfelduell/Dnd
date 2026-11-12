# CX · Menschen von Varrowmouth

Reines Autorenpaket. Neun Dateien, kein Laufzeitcode und keine Änderung unter `src/`. Die 23 Figuren sind verbindliche Namens- und Aussehensangebote für CY. Die angegebenen Spritepfade sind Zielverträge, keine Behauptung bereits vorhandener Bilder. Geheimnisse sind Autorenwissen und dürfen nicht als frei sichtbare NPC-Beschreibung übernommen werden.

## Dateien und Vorlagen

| Datei | Inhalt und Anschluss |
|---|---|
| `figuren.md` | 23 Bögen mit jeweils 120–200 Wörtern; CY verwendet Kleidung, Silhouette, Farben und auffällige Merkmale. |
| `npcs.json` | Nach ID geschlüsseltes Objekt mit name, role, dialogue, palette und sheet. `cx` ist Autorenmetadaten. |
| `tagesplaene.json` | 23 Einträge mit drei lückenlosen Zeitfenstern 6–24 Uhr und zwei Gezeitenpositionen je Fenster. |
| `beziehungen.json` | Sechs Figuren, je neun Stufen mit zwei Begrüßungen, drei Geschenken, zwei Ablehnungen und einer Freischaltung. Sechs neue Geschenkdefinitionen liegen unter items. |
| `dialogues.json` | Bestehendes start/nodes/choices-Format. Je Figur fünf Alltagszeilen pro Gezeit, vier Zeilen je Ende; sieben Ratsvorgespräche und vier optionale Briarholt-Erinnerungen. |
| `gerede.json` | Bestehende Stadt/Karte/Eintragslisten-Struktur, 80 Zeilen mit Bedingungen. |
| `stimmungen.json` | Vorschläge für sieben Portraits, je acht Emotionen mit Bedingungen und Priorität. |
| `pruefen.mjs` | Node ohne Pakete: Struktur, Mengen, IDs, Texte, Verweise, Bedingungen, Zeiten, Geschenke, Wortzahlen. |

Gelesene Vorlagen: `docs/story/k5_orte/npcs.json` ist am Ausgangsstand ein leeres Objekt. Deshalb konkretisiert CX dieses Objekt nach `docs/story/kg_leben/npcs.json`. Tagespläne übernehmen `id`, `name`, `roam`, `zeit`, `visible_if` aus `docs/story/kg_leben/einwohner.json`, erweitern `zeit` aber ausdrücklich um numerische Fenster und Gezeiten. Es werden keine ungesicherten Tile-Koordinaten erfunden. CU muss die position_hint-Angaben einmalig auf begehbare Tiles abbilden. Das ist Autorenformat, kein direkt ladbares Laufzeitpaket.

`src/data/packs/beziehungen/` enthält Dialogergänzungen, aber keine numerischen Stufen. Die bestehenden Schlüssel mag, verabscheut und begruessung stammen daher aus `src/data/beziehungen.json`; stufen, items und freischaltung sind hier deklarierte Erweiterungen. Der Einbau übernimmt sie über einen Adapter, nicht durch blindes Ersetzen der bestehenden Beziehungsregeln. Referenzierte Altgegenstände wurden gegen `src/data/items.json` geprüft.

## Figuren für CY

| ID | Name | Beruf |
| `vmn_tam_verrin` | Tam Verrin | Lotsin |
| `vmn_osric_dale` | Pater Osric Dale | Leuchtfeuerwärter und ehemaliger Registerschreiber |
| `vmn_nell_quarrie` | Nell Quarrie | Kind aus den Schlickgassen |
| `vmn_pegelherrin` | Ismay Harrow | Pegelherrin und Vorsitzende des Pegelrats |
| `vmn_rat_1` | Merren Voss | Zollherr des Zollamts |
| `vmn_rat_2` | Selda Rusk | Zollherrin des Pegelamts |
| `vmn_rat_3` | Edren Pell | Zollherr des Registeramts |
| `vmn_rat_4` | Orven Tebb | Zollherr des Hafenamts |
| `vmn_rat_5` | Bessa Kelm | Zollherrin des Zunftamts |
| `vmn_rat_6` | Hester Rill | Zollherrin des Kirchenamts |
| `vmn_rat_7` | Jorin Fane | Zollherr des Armenhausamts |
| `vmn_zollschreiber` | Iven Dorr | Zollschreiber, stumm |
| `vmn_fischerin` | Marda Sennick | Stegmarkt-Fischerin |
| `vmn_kantinenwirt` | Uldren Beck | Kantinenwirt |
| `vmn_apothekerin` | Veyla Mossen | Reeder-Apothekerin |
| `vmn_faehrmann` | Roven Ilt | Fährmann |
| `vmn_kielwirtin` | Dessa Orren | Kielraum-Wirtin der Unverzeichneten |
| `vmn_mutter` | Ressa Quarrie | Flickerin und Nells Mutter |
| `vmn_mechaniker` | Belven Kett | Pegeluhr-Mechaniker |
| `vmn_zollknecht` | Tavin Murr | Zollknecht |
| `vmn_taucherin` | Edda Vey | Taucherin |
| `vmn_zeuge_kettlegate` | Corven Nall | Handelsvertreter und Zeuge aus Kettlegate |
| `vmn_kurgast` | Alwen Tor | Kurgast und ehemalige Buchbinderin |

## Dramaturgischer Vertrag mit CT

- `vmn_rat_1` Merren Voss verantwortet Zoll und lügt für den Spieler mit der Deckbuchung „leere Fracht“. `vmn_rat_3` Edren Pell verantwortet Register und will es verbrennen. Diese beiden sind die Alternativen der Ratsvertrauensentscheidung. Vorschlag für CT: `k6_vertraut_vmn_rat_1` / `k6_vertraut_vmn_rat_3`, gegenseitig ausschließend; CX setzt keines dieser Flags. Beziehungspunkte ersetzen diese Entscheidung nicht.
- `vmn_rat_2` Selda Rusk ist unbemerkt Gezeitenwasser, `vmn_rat_4` Orven Tebb ein Salz- und Listenrest. Beide halten sich weiterhin für Menschen. Die übrigen fünf Zollherren bleiben Menschen. Ismay ist die gesonderte Vorsitzende, kein achtes Zollamt.
- Ämterfolge 1–7: Zoll, Pegel, Register, Hafen, Zunft, Kirche, Armenhaus. Voss und Pell sind beide verantwortungsfähig, keine eindeutigen guten oder bösen Ausgänge.
- Corven Nall hat den Spieler nach Fall 9 in Kettlegate gesehen und den Geschäftsbrief mit dessen Namen versandt. Seine Dialogzeilen verraten nicht vorzeitig, dass Ismay das Register ist. CT kann den Durchschlag als Zeugenaussage anbinden.
- Ressa Quarrie ist Nells Mutter, kein zusätzlicher 24. NPC. Nell bleibt elf. Ihre Gabe benötigt Zustimmung und Pausen. Geschenke kaufen keine Anwendungen.
- CX folgt der hier geltenden Anrede „Sie“, auch bei Nell. CT nennt für Nell ausdrücklich „du“; beim Zusammenführen muss CT diese Abweichung bewusst behandeln. CX hat CT nicht geändert.
- CX benutzt die vier Ende-Flags aus `docs/art/codex_CT_k6_akte.md`: `k6_ende_schliessen`, `k6_ende_verbrennen`, `k6_ende_uebergeben`, `k6_ende_teilen`. Ein implementiertes CT-Paket lag am Ausgangsstand noch nicht vor. Keine zusätzlichen Enden und keine eigenen Sequenzfreigaben.

## Dialogrouting und Abschluss

`start` wird von oben nach unten geprüft. Endgespräche haben Vorrang; vor Akt III erscheinen einmalig Ratsvorgespräche, dann gezeitenabhängiger Alltag. Die jeweiligen letzten Vorgesprächsknoten setzen `k6_cx_rat_1_vorgespraech` bis `k6_cx_rat_7_vorgespraech`. Nach `k6_akt3_done` sind diese Vorgespräche verborgen. Alle gewöhnlichen Gespräche und das Gerede enden bei `k6_done`.

Beim Abschluss muss genau eines der vier Ende-Flags zusammen mit `k6_done` gelten. `teilen` erfordert Koop. Die Endgespräche sind Rückblicke im Epilog, keine frei begehbare Stadt nach dem Abspann. Besonders nach `verbrennen` finden sie während der Räumung auf den sicheren oberen Wegen statt; keine Rückreise wird angeboten. Ismays vier Beiträge sind ausdrücklich hinterlassene Randtexte (`cx_medium: nachlass`), bei verbrennen niemals eine lebende Sprecherin. CT soll diese bedingten Texte nach dem Finale als Fund/Erinnerung präsentieren; sie beschreiben keine Zukunft, die Ismay vorher kennen müsste.

Beide Koop-Spieler bleiben eingetragen. Wer den Abschluss auslöst, gehört zum CT-Vertrag; CX schreibt diese Identität nicht um. Das Teilen-Ende ersetzt weder die zwei CT-Sichtweisen noch erzeugt es Sequenz 1. `schliessen` eröffnet den Weg zum Ritual; CX führt es nicht automatisch aus. Die zwei Schlussentscheidenden-Varianten und Ritualorte bleiben CT/DD vorbehalten.

Alwen Tors vier optionale Erinnerungen lesen die echten Briarholt-Flags `bha_end_wahl`, `bha_end_winter`, `bha_end_verwahrt`, `bha_end_schmerzlos` aus `docs/story/k5_akte/epiloge.json`. Nur die vorhandene, gewählte Variante anbieten. Küstenbahn und Fähre bleiben die Anreise; keine Rückfahrkarten oder Rückreise-Dienste.

## Gezeiten und Platzierung

Genau eines von `gezeit_ebbe` und `gezeit_flut` gilt, abgeleitet aus dem flüchtigen Zustand gezeit. Sechs Spielminuten je Wechsel sind ein Integrationsvorschlag, kein neuer Timer in CX. Bei Wechsel ein offenes Gespräch abschließen, dann die Figur atomar auf den sicheren Standplatz versetzen. Niemals NPC-Pfade durch geflutete Schlickgassen oder das Wrackfeld berechnen. Osric wechselt bei Flut zum Zollhafen, Dessa und Edda zum oberen Steg. Nacht 24–6: Routine unsichtbar; offene Hinweise bleiben bis zum nächsten Tag verfügbar.

Ismays Routine vor dem Finale gilt auf der Oberstraße. Während der von CT gesteuerten Finalszene wird sie dort ausgeblendet und nur im `vm_registerkeller` dargestellt. Keine doppelte Figur. CT-Szenen haben stets Vorrang vor Tagesplänen. `hg_grenzbezirk` und `vm_register_<pfad>` erhalten in CX keine neuen Orte oder NPC-Platzierungen.

Dessa ist bei Ebbe erst nach `k6_cx_zirkelzugang` im Kielraum sichtbar/ansprechbar. Bei Flut ist ihr oberes Steggespräch öffentlich, aber weder die Liste noch der Zirkel zugänglich. Das Wrackfeld kann gefährlich bleiben; Zugang bedeutet keinen automatischen Sieg über die Wrackmutter. Tam bleibt ab Beziehung +4 als Bootsdienst unabhängig von Uhrzeit/Gezeit über den sicheren Anleger erreichbar (Override vor der allgemeinen Nachtregel). Ihr Boot bedient nur verfügbare Strecken innerhalb Varrowmouths, keine Flutkeller und keine früheren Städte.

## Beziehungen und Effekte

Stufen -3 bis +5; genau zwei Begrüßungen, drei passende Geschenke und zwei begründete Ablehnungen je Stufe. Je Gespräch eine Begrüßung wählen. Kumulative Schwellen, keine erneute Belohnung nach Absinken und Wiederanstieg. Geschenke außerhalb des Caps ablehnen, keine Pflichtgegenstände verbrauchen. Hauptfährten, Ratsvorgespräche und CTs Vertrauenswahl bleiben unabhängig davon erreichbar.

Freischaltungen mit art gespraech sind optionale Gesprächsthemen mit fertigem Themenhinweis, keine erfundenen Questflags. Ihre IDs unter `k6_cx_<figur>_stufe_<n>` sind stabile Entdeckungskennungen. `m3`, `m2`, `m1` bezeichnen negative Stufen. Beim Einbau als UI-Thema anzeigen; keine Pflichtketten daraus erzeugen.

- Tam +3: bewusste Einladung setzt `k6_cx_zirkelzugang`, Ziel `unverzeichnete`. +4: Boot jederzeit; sicherer Anleger und gültige Route weiterhin erforderlich.
- Osric +2: optionaler vollständiger Lesetext unter text_inhalt. CTs Geständnis und Hauptbeweis bleiben unabhängig davon.
- Nell +3: nur mit ihrer Zustimmung eine aktive Kontrollzeile für genau einen gewählten Spieler löschen. Zollgeister ignorieren diesen Spieler 24 Spielstunden; kein globales Vergessen, keine Wirkung auf Pegelknechte/Bosse, keine Entfernung aus der Hauptakte. Einen individuellen Ablaufzeitpunkt speichern, nicht nur ein dauerhaftes Bool setzen. `k6_cx_nell_pause` zeigt ihre Erholung und endet nach 24 Spielstunden. Höchstens eine Anwendung insgesamt pro Spieltag; kein Koop-Doppelbezug. Wenn sie ablehnt, kein Verbrauch. Diese temporäre Gabe ermöglicht keine Ausreise.
- Voss, Pell und Dessa: optionale persönliche Einsichten; keine Handlungsvollmacht aus Geschenken. Dessas Gesprächsthemen zur Versorgung zusätzlich hinter Tams Zirkelzugang prüfen.
- Sechs `vmi_cx_*`-Geschenke sind unter items vollständig als Autorenangebote beschrieben. Vor Übernahme in den Markt Preise und verfügbare Stückzahl festlegen. Keine Kampfwerte und keine Inventargewährung durch CX.

## Ereignisse und Stimmungen

| Eingang / Ausgang | Anschluss |
|---|---|
| `k6_arrived`, `k6_done` | Ankunft / Ende aus CT, Routine sichtbar bzw. beendet. |
| `k6_akt2_done`, `k6_akt3_done` | Einmaliges Vorgespräch vor Akt III / dessen Ende. |
| `k6_cx_wrackmutter_besiegt` | Adapterflag erst nach tatsächlichem Sieg gegen `wrackmutter`, nicht schon beim Ende von Akt II. |
| `k6_cx_leuchtfeuer_befreit` | Adapterflag nach Abschluss des Leuchtfeuer-Ereignisses mit `leuchtfeuerwaechter`. |
| `k6_cx_pegelstoss` | Flüchtiger Szenenimpuls für erschrockene Portraits; danach löschen. |
| `k6_cx_vertrauen_verletzt` | Flüchtiger Szenenimpuls für wütende Portraits; nur betroffene Figur auswerten, danach löschen. |
| relation_min / relation_max | Beziehung der jeweils adressierten Figur, nicht des gesamten Rats. |
| dialogue | Exakte aktuelle Knoten-ID in dialogues.json. |

Die Adapterflags sind CX-Vorschläge und keine Behauptung schon vorhandener Laufzeitflags. Stimmungen wählen die höchste zutreffende priority, sonst neutral. Ismays Abschlussbilder sind Erinnerungsbilder, kein überlebender Boss. Tams Lächeln bleibt an Ebbe gebunden. Keine blutigen Details, keine Schreie, keine Folter.

## Prüfung

Aus dem Repository-Root: `node docs/story/k6_figuren/pruefen.mjs`.
Wortzahlen der Bögen zählen durch Leerraum getrennte Wörter ohne Überschriften. Zusätzlich wird eine nachvollziehbare Gesamtwortzahl aller redaktionellen Markdown-Dateien und JSON-Stringwerte ohne technische IDs/Farben/Pfade ausgegeben; wiederholte Texte zählen dabei an jedem Vorkommen. Die Zahl ist keine Behauptung einzigartiger Wörter. Das Skript läuft auch nach dem Kopieren des Ordners ohne npm-Pakete; Altgegenstände sind dafür als verifizierter Satz hinterlegt.
