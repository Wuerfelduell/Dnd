# CH · Briarholt: Karten und Heiznetz

Inhaltspaket für Kapitel 5 „Der Garten der fehlenden Tage“, zum separaten Einbau. Keine Änderungen an Spielcode oder bestehenden Vorratsdaten.

## Umfang

- 18 Orte in je zwei geometrisch identischen Zuständen: sechs Viertel, acht reguläre Innenräume, die Verteilanlage und drei Gefahrengebiete. Maßgeblich ist die feste ID-Tabelle des Auftrags, deren 18 Einträge gegenüber der einleitenden Raumzählung Vorrang haben.
- 108 ortsspezifische Grundlesetexte, ergänzt um Ventilschilder, Kondensatschrift, Wartungsschränke und Fundstücke. Jede Karte besitzt 6 bis 12 Leseobjekte. Ein Temperaturwechsel verdoppelt keine einmaligen Funde.
- Drei Gefahrengebiete mit je zwei kalten und drei warmen Gegnerplätzen. BH bleibt Quelle sämtlicher vorhandener Gegner, Eliten und Bossabschnitte.
- 30 vorhandene, pfadgefilterte Kernzutaten als alternative Bossquellen, zehn neue Beuteobjekte und ein Artefakt. Die kleine Nebenquest „Zwei Skalen, ein Befund“ hat zwei Belohnungsentscheidungen.
- Zwölf Ventilorte und zwölf Fernzüge im immer warmen Bügelraum; Rückwege, Feuerstelle, Bett, Lager und Fallwand.
- Optionaler Aussaatschwarm nach ausdrücklicher Bestätigung. Greavesend bleibt Gesprächsgegnerin.

## Dateien und Einbau

Die Standarddateien entsprechen den vorhandenen Paketformen. `npcs.json`, `encounters.json` und `platzierung.json` sind bewusst leer: BJ-Figuren stehen über Referenzen direkt in `maps.json`, BH-Kämpfe werden nicht dupliziert. `case.json` erzeugt keinen zweiten Hauptfall.

1. BH, BJ und BL einmal zentral laden. CG-Dialoge, Platzierungen und Ventilentscheidungen übernehmen.
2. CH-Karten, Reisen, Gegenstände, Artefakt und Dialoge übernehmen. `dialog_zusaetze.json` erweitert bestehende Dialoge ohne fremde Knoten zu ersetzen.
3. **Vor Spielbarkeit** die Verbindungen aus `zonen_bindungen.md` und `offene_punkte.md` umsetzen. Insbesondere sind leere `zones.encounters` keine selbstauflösenden Vorratsverweise. CG-Bosszugänge benötigen die letzten Abschnittsflags und die Temperaturprüfung.
4. CI-Tilesets später anhand von `tiles_wunsch` zuordnen. Die Platzhalter verwenden vorhandene Renderer-Schlüssel, keine erfundenen Tileset-Felder.
5. Wärme ausschließlich nach bestätigten Handgriffen ändern. `Heat.skeleton.js` enthält nur Signaturen und Kommentare, keine Implementierung.

Die Figuren stehen abhängig von Akt-Flags an ihren Stationen. CGs zusätzliche Storyobjekte müssen nach dem Zusammenführen auf beide Temperaturvarianten gespiegelt werden; gemeinsame IDs und Fortschrittsflags bleiben identisch. CH kopiert diese Inhalte nicht.

## Prüfung

Vom Repository-Stamm:

```sh
node docs/story/k5_orte/pruefen.mjs
node docs/story/k5_orte/pruefen.mjs --cg-dir /pfad/zum/CG-Ordner
node --check docs/story/k5_orte/Heat.skeleton.js
git diff --check
```

Ohne CG-Dateien weist die Prüfung die genau benannten externen Verträge als OFFEN aus. Mit CG prüft sie deren tatsächliche Setter, Ventilorte und 7.500 Schaltübergänge aus allen 125 zulässigen Bankbelegungen. Der geprüfte Quellenstand steht in `quellen.md`. Geprüft werden Daten und Laufwege; eine spielinterne Integration wird damit nicht behauptet.

## Indexzeile für den späteren gemeinsamen Einbau

`- [CH: Briarholt, Karten und Heiznetz](k5_orte/README.md) – 36 Kartenstände, drei Gefahrengebiete, Wärme und Rücklauf.`

Die Indexzeile liegt hier bereit: Der Auftrag verlangt gleichzeitig eine zentrale README-Ergänzung und einen PR ausschließlich im eigenen Ordner. Wie CG bleibt dieser PR auf `docs/story/k5_orte/` begrenzt.
