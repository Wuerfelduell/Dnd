# Paket AT: Stadtleben in Dunscar

Inhaltslieferung für „Nebelakten“, Kapitel 3 „Der letzte Zug nach Dunscar“. Verbindliche Vorlage: [`geschichte_3.md`](../kapitel3/geschichte_3.md), ergänzt um [`story_bisher.md`](../kapitel3/story_bisher.md). Geschichten 1 und 2 werden nicht verwendet. Dieses Paket wird noch nicht vom Spiel geladen.

## Umfang und Dateien

| Datei | Inhalt |
|---|---|
| `quests.json` | 12 Nebenaufträge, elf mit fünf Schritten, einer mit sechs |
| `dialogues.json`, `dialog_zusaetze.json` | Ruths eigener Dialog und additive Zweige für acht feste Kapitel-3-Figuren |
| `npcs.json` | Nur die neue Händlerin Ruth Bellwick |
| `case.json` | 26 Fakten, 26 Hinweise und elf Deduktionen |
| `items.json` | Vier endabhängige, dauerhaft lesbare Begleitbriefe von Zunder |
| `encounters.json` | Absichtlich leer; der optionale Gerüstklang benutzt die AS-ID |
| `platzierung.json` | Auftragsobjekte und Ruth, im Format des Wexmoor-Pakets |
| `gerede.json` | 60 einzelne Sätze: sechs Viertel × fünf Akte × zwei Sätze |
| `lesestuecke.json` | 25 platzierbare Alltagsdokumente, jeweils unter 120 Wörtern |
| `zeitung.json` | Acht beleg- und entscheidungsabhängige Meldungen im Dunscarer Kalkblatt |
| `bestiarium.json` | Sechs Einträge unter den bereits vergebenen Gegner-IDs |
| `koop_stimmen.md` | Zwei ausgearbeitete Stimmen für jeden der vier Koop-Zweige |
| `grafikwuensche.md`, `offene_punkte.md` | Grafikbedarf und konkrete Einbauverträge |
| `pruefen.mjs` | Abhängigkeitsfreier Daten- und Inhaltsprüfer |

## Aufträge und Ablauf

Akt I beginnt mit `k3_arrived`; die folgenden Akte mit dem jeweiligen `k3a_akt<n>_done` des vorigen Akts. Keine Nebenquest setzt ein fremdes Flag oder schreitet die Hauptgeschichte fort. Die Aufträge bleiben später nachholbar. Für den Kapitelabschluss sind sie nicht erforderlich.

| Akt | Quest-ID | Kontakt / Startkarte | Entscheidung und Folge | Grundlohn im Dialog |
|---|---|---|---|---|---:|
| I | `k3n_tischgedeck` | Mabel / Arbeiterbogen | Freiwillige Aussprache mit Evin oder private Versorgung; neues gemeinsames Gedeck oder bleibende Ungewissheit | 18 |
| I | `k3n_grabstein_ohne_namen` | Pelham / Kalkmarkt | Namen abwaschen oder Fehler öffentlich erklären; Privatsphäre oder Warnwirkung | 22 |
| I | `k3n_kalkkinder` | Pfiff / Arbeiterbogen, Zweig am regulären Pfiff-Standort anbinden | Warnvers ergänzen oder Spiel umbenennen; alte Namen bewahren oder aus dem Spiel nehmen | 16 |
| II | `k3n_falsche_zeit` | Nellie / Endbahnhof | Begrenzten Versuch mit Zustimmung durchführen oder stoppen; geheime Verzögerung oder begleiteter Heimweg | 24 |
| II | `k3n_attest` | Huxford / Arbeiterbogen | Öffentliche Berichtigung ohne Patientennamen oder zuerst Einzelinformation | 26 |
| II | `k3n_secondhand` | Ruth / Kalkmarkt | Rückruf oder ehrliche Kennzeichnung mit Rückgabeoption; leere Auslage oder fortgesetzter, offener Verkauf | 25 |
| III | `k3n_vermessung` | Adaine / Bruchstufen | Zielhilfe sperren oder sicheren Beobachtungsstand einrichten | 28 |
| III | `k3n_schichtmarke` | Mabel / Teesaal | Ehrlicher Mahlzeitenfonds oder Verkauf des Zinnvorrats; laufende Vereinbarung oder begrenzte Soforthilfe | 20 |
| III | `k3n_brief_aus_wexmoor` | Pfiff / Speisewagen, Nellie übergibt den Brief | Familienküche oder Bahnhofsvorrat; heutiger Bedarf oder spätere Ankunft | 18 |
| IV | `k3n_drehscheibe` | Oren / Schwellenring | Laststeg oder geschützter Fußsteg; beide öffnen dieselbe zusätzliche Verbindung | 30 |
| IV | `k3n_kettlegate` | Nellie / Endbahnhof | Vertrauliche Gegenprüfung oder zusätzliche sachliche Warnung; keine verfrühte Täterfestlegung | 24 |
| V | `k3n_letzte_lohnliste` | Esther / Lohnbüro, nach Akt IV | Erlaubten anonymisierten Auszug veröffentlichen oder ausschließlich vertraulich archivieren | 36 |

Die ersten elf Aufträge führen über zwei eigenständige Beobachtungen, eine gemeinsame Gegenprobe mit Rückfrage, eine Journal-Deduktion und eine Entscheidung. Hinweise können in beliebiger Reihenfolge gefunden werden. Die gemeinsame Gegenprobe verlangt beide Hinweise, die Entscheidung zusätzlich den Schluss. Bei der Lohnliste sind alle vier Familienbesuche gleichrangig; keine Reihenfolge oder Reaktion wird erzwungen.

**Spielzeit-Ziel:** 20 bis 40 Minuten je Auftrag einschließlich Erkunden der zwei Schauplätze, Gesprächen, Journal und Rückweg. Für die Lohnliste vier kurze Hausbesuche. Als Abnahmebudget: 3–5 Minuten Einstieg, 8–15 Minuten Spuren und Wege, 4–8 Minuten Gegenprobe/Journal, 5–10 Minuten Entscheidung und Wiederbegegnung. Das ist ein Gestaltungsziel, keine gemessene Laufzeit. Nach AS-Kartenintegration mit Erstspielern messen; weder Wartezeiten noch wiederholte Kämpfe dürfen fehlende Spielzeit strecken. Wer alle Wege bereits kennt und Texte überspringt, wird schneller sein.

## Wiedereinstieg und Einmaligkeit

Jede Abschlusswahl verlangt die aktive Quest und verbirgt sich nach deren `_done`-Flag. Auszahlungsknoten haben keinen Rücksprung. Wiederbegegnungen besitzen eigene Knoten ohne Effekte. Briefvarianten sind ebenfalls nach erster Übergabe verborgen; Zunders Brief bleibt als Schlüsselgegenstand erhalten. Abbruch eines Gesprächs lässt den Auftrag offen. Kein Auftrag nimmt ein für den Hauptfall nötiges Objekt weg, verkauft fremde Stimmen oder vergibt eine Sequenzzutat.

Die angegebenen Geldbeträge sind die **Dialogbeträge**. Das bestehende Quest-System vergibt zusätzlich seine normale Nebenquest-Prämie (derzeit 12 Schilling; siehe `src/core/GameState.js`). Weil das AT-Vorgabenschema kein `reward` fordert, bleibt diese Prämie erhalten. Globale Beute-/Ehrenmodifikatoren können die tatsächliche Anzeige ändern. Keine Geldwirkung ist an wiederholbares Gerede oder reine Wiederbegegnungen gebunden.

## Historie und Koop

Zunders vier Briefe folgen exakt `k2_end_rein`, `k2_end_moor`, `k2_end_lichtmeister`, `k2_end_meer`. Im Lichtmeister-Zweig kommt eine alte bezahlte Bestellung ohne Geschenk oder Versöhnung; beim Meer-Ende bleibt Brandt im Amt. Der Kettlegate-Absender wird priorisiert: `marlowe_trusts` → Marlowe, sonst `star_shattered` → Kohlen-Jem, sonst Miss Pimm. Diese Flags existieren bereits in den Kapitel-1-Enddaten. Kein früher geretteter Mensch wird erneut gefangen vorausgesetzt.

Vier optionale Beiträge der Archivbegleitung sind mit `koop_aktiv` gated: Tischgedeck, Attest, Secondhand und Kettlegate. Sie ergänzen eine eigene Beobachtung, ersetzen aber weder die Pflichtbelege noch einen Zeugen. Die JSON-Fassung ist stimmneutral; [`koop_stimmen.md`](koop_stimmen.md) liefert die vollständigen Ersatztexte für p2a/p2b ohne erfundene Variantenschalter im Spielschema.

## Prüfung

Vom Repository aus: `node docs/story/k3_nebenquests/pruefen.mjs`.

Der Prüfer kontrolliert JSON, neue Präfixe, Dialogkanten und Erreichbarkeit, Flag-Erzeuger, Referenzen, Zielobjekte, Faktenpaare, Inhaltszahlen und Auszahlungssperren. Er durchläuft außerdem alle zwölf Quests in 48 Konfigurationen aus vier Wexmoor-Enden, drei Kettlegate-Absendern, Solo/Koop und beiden Ausgangsgruppen. Der Durchlauf ist ein Datenmodell, keine Ausführung der Phaser-Spielwelt.

Externe Kapitel-3-IDs werden einzeln als **OFFEN** ausgegeben, nicht als implementiert ausgegeben. `--strict-integration` liefert deshalb bis zum tatsächlichen Einbau einen Fehlerstatus. Die Details stehen in [`offene_punkte.md`](offene_punkte.md). Keine Änderung an `src/`, `public/` oder `tests/` gehört zu diesem Paket.

## Eingebaut

Die Spieldaten liegen in `src/data/packs/k3_nebenquests/`. Gerede, Bestiarium und Lesestücke lädt `withPackLore` in `buildContent`. Beim Einbau geändert:
- Die Dialogzusätze hängen an den AR-Dialogen (`k3a_<figur>`, jeweils am Startknoten).
- Das Kalkblatt ist dieselbe Zeitung wie bei AR (`dunscarer_kalkblatt`).
- Der Wartungssteg steht als zwei Türen `k3o_steg_*` mit dem Spawn `k3o_steg` auf den AS-Karten und erscheint mit `k3n_drehscheibe_offen`.
- 16 Fundstellen wurden auf freie Felder verschoben.
- Zunders Begleitbriefe nutzen vorerst das Icon von Ivys Brief.

Die Stimmfassungen aus `koop_stimmen.md` sind noch nicht eingebaut. Die neutralen Koop-Knoten funktionieren.
