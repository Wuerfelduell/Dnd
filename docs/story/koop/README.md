# Paket AI: Koop-Texte

> Eingebaut: Die Daten liegen jetzt in `src/data/packs/koop/`. Rollenbindung, Platz-Flags und Geplauder steuert `src/world/Koop.js`, die Kampfsprüche `CombatScene.bark()`.

Inhaltsentwurf für „Nebelakten“, nach `docs/art/codex_AI_koop_texte.md`. Nur dieser Ordner wird geliefert. Das Spiel lädt diese Dateien noch nicht. Die räumlichen Prüfungen, Stimme-Auswahl und Ereignisanbindungen sind in [offene_punkte.md](offene_punkte.md) konkret beschrieben und vor Aktivierung erforderlich.

| Datei | Inhalt |
|---|---|
| `hintergrund.md` | Gemeinsame Archiv-Vorgeschichte, sechs Namensvorschläge, Spitzname, acht Beitritts-/Abschiedstexte. |
| `geplauder.json` | Genau 80 Gespräche mit je zwei Stimmen für p2, 40 Kettlegate und 40 Wexmoor. |
| `kampf.json` | Neun Anlässe, je 10 p2a-, 10 p2b- und 5 p1-Sprüche; insgesamt 225. |
| `dialog_zusaetze.json` | Zwölf vorhandene Figuren, jeweils drei neue Knoten, nur im Koop erreichbar. |
| `quests.json`, `dialogues.json`, `case.json`, `platzierung.json` | Drei Koop-Aufträge mit räumlichen Rollen, Hinweisen, Entscheidungen und Geldbelohnungen. |
| `items.json`, `encounters.json` | Bewusst leere Objekte: keine neuen Items oder Kämpfe nötig. |
| `grafikwuensche.md` | Optionale Requisiten und klar benannte Platzhaltergrenzen. |
| `offene_punkte.md` | Erforderlicher Einbau, Wiederaufnahme, Sichtbarkeit, Synchronität und private Hinweise. |
| `pruefen.mjs` | Abhängigkeitsfreie Prüfung mit Node. |

## Die Aufträge

| ID | Beginn | Zusammenarbeit | Entscheidung und Prämie |
|---|---|---|---|
| `koop_zwei_schluessel` | Revier, nach Fall 4 | Zwei Schlösser an verschiedenen Wänden gleichzeitig drehen, Gravur beachten. | Original intern ablegen: 28 Schilling. Private Randnotiz verschlossen lassen: 20 Schilling und Ansehensbonus (`honor: 2`, global skaliert). |
| `koop_ablenkung` | Salzmarkt, Akt II bis V | p1 beschäftigt einen Grauspäher, p2 sucht den Gegenbeleg im richtigen Fach. | Volle Prämie: 30 Schilling. Zehn für die Gemeinschaftskasse zurücklassen: 20 Schilling und Ansehensbonus (`honor: 2`, global skaliert). |
| `koop_spiegelbild` | Spiegelkabinett, nach Fall 6 | Zwei Runden abwechselnder Hinweise, jeweils beide Standplätze erforderlich. | Neue Seitenrahmen verhängen oder als Prüfgerät bewahren; jeweils 24 Schilling, sichtbarer unterschiedlicher Endzustand beim Einbau. |

Geld und Ehre sind gemeinsam. `reward: {gives_money: 0}` in jeder Quest unterdrückt die sonst automatisch hinzukommende Nebenquest-Prämie; die tatsächliche Geldsumme steht nur im gewählten Abschlussknoten. Es gibt keine unsichtbare Bevorzugung des gerade interagierenden Inventars. Alle Hauptfälle bleiben solo lösbar. Seitenaufträge behaupten keinen bestimmten Ausgang eines Hauptfalls.

## Datenvertrag

Quest-, Hinweis-, Dialog- und Interactable-Felder folgen den bestehenden Vorlagen. `platzierung.json` nutzt den bereits im Repo verwendeten Zusatzumschlag `{map,tile,visible_if,interactable}`. `dialog_zusaetze.json` erhält bestehende Dialog-IDs als äußere Schlüssel; neue Knoten tragen `koop_`. `kampf.json` ist ein separat anzubindender Katalog mit Anlass-IDs und Sprecherlisten. Geplauder folgt exakt dem Format aus dem Auftrag.

`case.json` enthält ausschließlich zusätzliche Nebenfallhinweise, keine Überschreibung einer Hauptlösung. Alle neuen IDs einschließlich Objekt-, Knoten- und Fortschritts-IDs beginnen mit `koop_`. `koop_aktiv` wird als einzige externe Flagquelle dokumentiert. Die kurzlebigen Rollenflags werden in den Daten an Interactables deklariert, dürfen aber nur nach der räumlichen Prüfung aus `offene_punkte.md` gesetzt werden.

## Prüfen

Vom Repo aus:

```sh
node docs/story/koop/pruefen.mjs
```

Geprüft werden JSON, Formen und Anzahl der Texte, Präfixe, Start-/Next-Verweise, Flagquellen, Karte/NPC/Dialog/Item/Kampf/Quest/Hinweis-Referenzen, Questziel-Objekte, Koordinaten und jede p2-Doppelfassung. Die Prüfung ist vom Arbeitsverzeichnis unabhängig und benutzt nur Node-Bordmittel. Sie prüft keine noch nicht implementierten Steuerungs- oder Renderingfunktionen.

Quellenstand: Hauptbranch beim Arbeitsbeginn, `4e1e38b3b7405196526bc37bbb64ffb94f1f6bd4`; abschließend gegen `1ecfc2d` aktualisiert und geprüft. Die Paket-AI-Vorgabe blieb unverändert. Gelesen: `Party.js`, `campaign.json`, Fälle 1 bis 9, Kapitel-2-Quests/Hinweise/Karten/Dialoge, besonders Zunder und Marlowe, außerdem bestehende Dialog- und Platzierungsformate.

Zusätzlich wurden alle sechs Belohnungswege gegen den vorhandenen `GameState` durchlaufen, einschließlich falscher Rätselwahl, fehlendem zweiten Rollenflag und erneutem Öffnen der Auszahlung. Fünf gezielte Negativproben (Karte, Stimme, Flag, Knoten, Präfix) wurden vom Prüfskript abgewiesen. Das Zusammenführen der Questdaten wurde ohne NPC-Zusätze geprüft; Marlowes abweichender `hub` benötigt den dokumentierten Loader-Anschluss.
