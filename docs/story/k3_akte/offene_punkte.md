# Einbauvertrag und offene Punkte

## 1. Liefergrenze

AR liefert Storydaten. Alle Änderungen bleiben in diesem Ordner. AS erstellt Karten, Wege, Spawns, Gegnerwerte und die Rufmechanik; AU liefert Sequenzprüfungen und Zutatenherkunft. AW/AV/AX/AY liefern die gemeinsamen Grafiken und Klänge. Keine fremden Paketflags werden gesetzt. Feste gemeinsame NPC-/Ende-IDs sind keine versehentlichen Präfixkollisionen.

## 2. Karten und Anreise: Position prüfen

**Alle `tile`-Koordinaten sind Vorschläge, Position prüfen.** AS war beim Erstellen nicht vorhanden. Die Koordinatenprüfung bestätigt nur ganzzahlige Paare, weder Kollisionsfreiheit noch Kartengrenzen. Verbindliche externe IDs stehen im AR-Auftrag und sind im Prüfer einzeln aufgezählt; unbekannte IDs werden nicht durch ein allgemeines `ds_`-Muster durchgewinkt.

| Anschluss | Erforderlicher Einbau |
|---|---|
| `ds_endbahnhof` | Spawn `zug`, Ankunft bei `[6,4]` erreichbar; `k3_arrived` nicht vor der Leseszene setzen |
| Alle sechs Viertel | Sichere Fußwege ab Ankunft, keine Sequenz- oder Rufladungs-Schranken |
| `ds_speisewagen` | `default` als Rettungsspawn; Koje, Lager, Fallwand, Ofen, Schallschleuse ab Akt-I-Abschluss; Pfiff für frühe Untersuchung zugänglich |
| `ds_letzter_bahnsteig` | Bereits Akt III für Gespräch 34 über sicheren Zugang erreichbar, nicht bis zum Endkampf sperren |
| `ds_nachtzug_wagen` | Ab Akt V ohne Sieg über Gallowmere erreichbar, damit frühe Stilllegung nach Evakuierung möglich bleibt |
| `ds_schwellenring` | Objekt `k3a_lagerabschrift` als Materiallager anlegen, Gegenquelle zu Esthers Original im Lohnbüro |
| `wx_kahn`, `wx_leuchtturm` | Reiseobjekte nach dem jeweiligen Wexmoor-Ende erreichbar machen; keine Rückkehr zu einer überwundenen Handlung voraussetzen |

Die Reise folgt dem Fall-9-Prinzip einer angebotenen Weiterfahrt: erst Brief, dann Reiseentscheidung mit bestehendem `travel: {map: "ds_endbahnhof", spawn: "zug"}`. Kein Fahrpreis, Pflichtgegenstand oder Zeuge blockiert sie. Der Meer-Auftakt ist ein am Küstenkahn erreichbarer Übergang; die alte `wx_kahn`-Karte muss nach diesem Ende als Kahnzugang erreichbar bleiben oder der Einbau die zwei Objekte auf den tatsächlich erreichbaren Küstenkahn versetzen. Der Amtsauftakt gehört in den erreichbaren Amtsbereich der Leuchtturmkarte. Zunder wird dort nicht als Helferin eingesetzt.

`anreise.json` nicht neben `platzierung.json` nochmals anwenden. Nach Kapitelabschluss muss eine reguläre Rückreise offen bleiben; genaue Reisemenü-Anschlüsse und Tarifwirkung der Bahnkarte macht der Integrationsteil. Keine neue Spawn-ID wird als bereits existent behauptet.

## 3. Bestehende Enginegrenzen

- `applyQuestPack` übernimmt `case.facts/clues/deductions`, **nicht `case.endings`**. Die vier Enden explizit in `content.endings` registrieren. Der Effekt `ending` existiert bereits in `GameState.applyEffects`; er ist hier kein neues Datenfeld. Bedingungen stehen zusätzlich auf den Auswahl- und Bestätigungschoices, denn `setEnding` prüft sie nicht selbst.
- `COMPANIONS` in `Bonds.js` enthält bisher nur `zunder`. `k3_pfiff` registrieren, damit die vorhandenen `bond`-Effekte wirken. AR verändert diese Codedatei nicht. Ohne den Einbau geht lediglich der Vertrauenswert verloren; keine Storybedingung hängt davon ab.
- `dunscarer_kalkblatt` ist als Zeitungsreihe noch zu registrieren. `zeitung.json` hat neun separate Ausgaben; Epilogszenen nach dem gewählten Ende in Dateireihenfolge anzeigen. Keine neue Zeitungs-/Epilog-API ist impliziert.
- Leitungsprüfer nutzt den tatsächlich vorhandenen Platz `amulett`, `kind: gear`, `max_nerves +5`. Seine Bedeutung für die Schaltung ist erzählerisch; kein erfundener passiver Rufbonus.
- Depotmarke: AS/Integration muss die versprochenen kostenlosen Reparaturen freischalten. Es gibt hier keinen erfundenen Reparatur-Effekt.

## 4. Bosse, friedliche Lösungen und gleiche Beute

`encounters.json` bleibt leer. `boss_texte.json` ist eine **Teilfeldvorlage** für die folgenden festen AS-Kampf-IDs. Nicht direkt als vollständige Begegnungsdefinition importieren. Intro, Sieg, Niederlage und `lose_to` in die AS-Definitionen übernehmen; deren Werte, Angriffe, Loot und `on_win` dabei erhalten. AS soll Flucht in den Speisewagen ermöglichen. Lebende Schichtgänger werden nur bewusstlos, nicht getötet.

| Kampf | Kampfabschluss | Friedensabschluss | Gemeinsame AR-Passage | Zutat |
|---|---|---|---|---|
| `schwellenhund` | Engine setzt `won_schwellenhund` | `k3a_schwellenhund_friedlich` nach falschem Anfahrpfiff | `k3a_24_passage` | `sq_zutat_waage_5`, `sq_zutat_moor_5` oder `sq_zutat_uhr_5`, nur eigener neuer Pfad |
| `vorhauer` | `won_vorhauer` | `k3a_vorhauer_friedlich` nach Rettungsschlägen | `k3a_33_passage` | `sq_zutat_<pfad>_3`, eigener Pfad |
| `vielrufer` | `won_vielrufer` | `k3a_vielrufer_friedlich` nach Leitungstrennung | `k3a_52_passage` | `sq_zutat_<pfad>_2`, eigener Pfad |
| `gallowmere` | `won_gallowmere` | `k3a_gallowmere_friedlich` nach eigener Schuld-Deduktion und Ausfahrtssignal | `k3a_53_geschlossen` | Keine zusätzliche Kernzutat vorgesehen |

Friedliche Effekte stehen bereits in den Dialogen. Nach Kampfsieg setzt der nächste Stationsbesuch dieselbe Passage. Die Passage ist für Hinweise maßgeblich, nicht die Art des Erfolgs. Eine Niederlage setzt keine Passage und löscht keine Hinweise.

**AS/AU muss den gemeinsamen einmaligen Beuteanspruch an Sieg ODER Frieden binden**, nicht jeweils eine zweite Auszahlung einbauen. Pfadschlüssel: `laterne`, `faden`, `maske`, `echo`, `kessel`, `eisen`, `schluessel`, `sq_waage`, `sq_moor`, `sq_uhr`; in Zutaten-IDs entfallen die `sq_`-Teile der drei neuen Pfade. Keine Zutat eines fremden Pfads auszahlen. Ohne Pfadwahl den Anspruch behalten. AF-Zutatenbeschreibungen nennen teilweise ältere Entwurfsbosse; die aktuellen AR–AY-Eckdaten haben Vorrang.

Warum hier kein scheinbarer fertiger Beutedialog steht: `requires_pathway` wird im aktuellen `GameState.meets` für Dialogchoices **nicht** ausgewertet, nur im Händlerpfad. Eine Liste solcher Choices würde alle Pfadzutaten zugänglich machen. Daher ist die pfadsichere Auszahlung ein expliziter Integrationspunkt. Kein Hauptstory-Ende verlangt diese Zutat oder eine Sequenz-4-Fähigkeit.

## 5. Rufen, horchen, schweigen

Die 12 Muster enthalten Form, Herkunft, Bedeutung und Hinweis-ID. Sie sind Journalwissen, keine verbrauchbaren Items. Alle neun Horchstellen sind über vorhandene Dialogchoices mit `requires_clues` spielbar, auch ohne Audio. Die Fundstellen der richtigen Muster liegen jeweils **vor** ihrer eigenen Zugangsschranke. Der erste Wandversuch benutzt Pfiffs Leihgerät, bevor Akt I das eigene Gerät verleiht.

| Ort | Dialogfallback |
|---|---|
| Schwellenring | `k3a_14_dialog`, `k3a_14_horchen` |
| Signalhang, Zeitprobe | `k3a_23_dialog`, `k3a_23_probe` |
| Rangierwüste | `k3a_24_dialog`, `k3a_24_horchen` |
| Klopfbruch | `k3a_33_dialog`, `k3a_33_horchen` |
| Bruchstufen | `k3a_42_dialog`, `k3a_42_probe` |
| Prüfhaus | `k3a_43_dialog`, `k3a_43_probe` |
| Rufschlucht | `k3a_52_dialog`, `k3a_52_horchen` |
| Personenwagen | `k3a_54_dialog`, `k3a_54_probe` |
| Letzter Bahnsteig | `k3a_53_dialog`, `k3a_gallowmere_konfrontation`; falscher Rundruf ausschließlich über gewarntes Endmenü |

Der **Fallback** verbraucht keine Ladung und zieht für Fehler keine Nerven ab. Falsche Proben zeigen eine bekannte falsche Haltestelle bzw. den getrennten Prüfzeiger; Umkehr bleibt frei. Er bildet Wissen und Konsequenzen ab, nicht die noch fehlende räumliche Schallberechnung.

AS soll für das spätere System drei Ladungen pro Ausflug, kostenloses Auffüllen bei Pfiff, eine einmalige Ersatzladung an jeder Pflichtstelle, vorab sichtbare Reichweite und sichere Nischen umsetzen. Horchen und Deduktionen bleiben kostenlos. Untertitel, sichtbare Linien und optionale Vibration liefern dieselbe Information. Fehlversuche kosten höchstens eine Ladung und Nerven; keine verlorenen Journalbelege, Sackgassen oder echte Zeitfrist. Der Zug rückt erst nach dem ausdrücklich bestätigten Aktschritt vor.

Die optionale private Namensantwort im Familienvergleich hat eine eigene Warnung und Bestätigung. `k3a_privatruf_gebunden` wird nur dafür gesetzt und an der Schallschleuse wieder gelöscht. Sie öffnet keinen Pflichtbeleg. Die Weltreaktion auf diese Bindung braucht AS; im Fallback ist sie ein klar sichtbarer Zustand ohne versteckte automatische Antworten. Ein Namenstäfelchen verhindert persönliche Entnahme, nicht das Echo des bewusst abgegebenen Signals. Beim Gegenstimme-Ende wird weder ein vorhandenes Täfelchen konsumiert noch eine permanente Unsterblichkeit behauptet.

## 6. Enden, frühe Ausgänge und Veröffentlichung

| Ende | Verbindliche Zugangsschranken |
|---|---|
| Feierabend | Pfiffs vollständige Akt-V-Bilanz, Lebende draußen, ausdrücklich gesicherte Familienzustimmung, Vertuschung (41), Fahrmeisterschuld (53), getrennte Leitungen (52) |
| Stilllegung | Akt IV bestätigt, Hauptleitung deduziert (44), sämtliche Lebenden nach Abgleich draußen; keine Familienzustimmung oder Gallowmere-Niederlage verlangt |
| Gegenstimme | Akt IV bestätigt, Lebende draußen, personenfreier Ruf (43), Leitungstrennung (52), ausdrückliche eigene Einwilligung nach Pfiffs Warnung |
| Vollzählig | Akt IV bestätigt, Hauptleitung/Rundruf verstanden (44), ausdrückliche doppelte Bestätigung trotz Warnung; Evakuierung und Zustimmung sind dafür keine Schranken |

Frühe Ausgänge beenden `k3a_akt5`, markieren aber keine ausgelassenen Fährten fälschlich als untersucht. Die Endeffekte setzen `kapitel3_done` und sperren alle vier Auszahlungen gegeneinander. Beim frühen bösen Ende behauptet die Zeitung keine erfolgreiche Evakuierung. Bei später Wahl des Rundrufs werden auch vorher Gerettete wieder gefährdet. Dass die Leitungen für den Rundruf bewusst wieder verbunden werden, steht ausdrücklich im Endtext.

Ehre gibt ausschließlich `k3a_veroeffentlichen` im Teesaal: 41 und 53 müssen deduziert und die Unterlagen tatsächlich öffentlich zugänglich gemacht werden. `k3a_nachweis_offen` sperrt die einmaligen +8 Ehre. Enden geben keine automatische Ehrenbelohnung; die Aufsichtsmarke erst recht nicht. Nellies geheime Verbindung ist nach Veröffentlichung ihrer Warnung geschlossen, aber ihre vorhandenen Abschriften bleiben für IV nutzbar.

## 7. Prüfung und Grenzen

Der Prüfer kann mit Absicht keine unbekannten AS-Inhalte als vorhanden bestätigen. Er meldet jeden vertraglich vorgesehenen, aber noch nicht registrierten externen Verweis. `--strict-external` macht daraus einen Fehler für den späteren Integrationslauf. Die 64 Storydurchläufe beweisen Daten-Erreichbarkeit, keine Laufzeitfunktion, Kampfbalance oder Kartenbegehbarkeit. Zusätzlich werden frühe Endbedingungen, Belohnungssperren, Muster-Quellen und negative Voraussetzungen geprüft. Nach Integration: Pfiff-Vertrauen, Zeitungsanzeige, Beuteparität, Spawns, Reise-Rückwege, Wiederaufnahme nach Niederlage und alle Kachelpositionen im Spiel prüfen.
