# Kanonische Gegnerbindung

`maps.json` ist die maschinenlesbare Referenzliste: jeder Roamer nennt seine bestehende BH-ID in `encounter`. Die Bosszugänge in `dialogues.json` nennen die vorhandenen Abschnitts-IDs. Es werden weder neue IDs für BH-Varianten noch Kopien ihrer Kampfwerte angelegt.

| Kartenpaar | Kalt: zwei Roamer | Warm: zusätzlicher dritter Roamer | Bossabschnitte | Ersatzzutat |
|---|---|---|---|---|
| `bh_kaltes_palmhaus` | `vg_bh_glasmotte`, `vg_bh_bluetenkopf` | `vg_bh_wurzelgaenger` | `vg_bh_boss_glasgaertner`, `vg_bh_boss_glasgaertner_phase2` | Sequenz 3 |
| `bh_verlassene_waescherei` | `vg_bh_rohrwurm`, `vg_bh_waeschegeist` | `vg_bh_dampfschwester` | `vg_bh_boss_waescherei`, `vg_bh_boss_waescherei_phase2` | Sequenz 2 |
| `bh_wurzelkammer` | `vg_bh_sudtraeger`, `vg_bh_wurzelgaenger` | `vg_bh_rohrwurm` | `vg_bh_boss_mutterwurzel`, `vg_bh_boss_mutterwurzel_phase2`, `vg_bh_boss_mutterwurzel_phase3` | Sequenz 1 |

Kalt beträgt die Elitechance null; warm 0,12. HP-, Schadensmultiplikatoren, Roam-Verhalten und übrige Elitewerte kommen unverändert aus BH. Der Blütenmund ist frühestens nach `bha_akt4_done` erreichbar. Die warme Wartungsnische gibt 8 bis 16 Schilling, die kalte 4 bis 8; das zugehörige Item bleibt gewöhnliche Beute. Warme Eliten können zusätzlich Kühlfilz geben. Der warme Glasgärten-Wurzelgänger und der ausdrücklich bestätigte, nicht tödliche Postkartenschreiber-Eingriff sind zusätzliche Stadtbegegnungen mit denselben bestehenden IDs.

## Weshalb `encounters` in den Zonen leer bleibt

Der aktuelle Loader `src/data/buildContent.js`, Funktion `wildContent`, expandiert vollständige Definitionen und überschreibt pro ID den Kampfkontext. Ein Eintrag mit einem ID-String oder einem erfundenen `ref` wäre daher falsch. Kopierte vollständige BH-Werte würden der ausdrücklichen Vorgabe widersprechen, den Vorrat nur zu verknüpfen.

Der Einbau muss die vorhandenen BH-Definitionen einmal auflösen und die obige, auch in den Karten enthaltene Zuordnung mit dem aktiven CH-Zonenkontext verbinden. Dabei `elite` zu den bereits verwendeten `<id>_elite`-Kämpfen expandieren und Beute übernehmen. CH erfindet dafür kein Datenfeld. `zones.json` allein erzeugt noch keine Kämpfe und ist entsprechend kein fertig eingebautes Gefahrengebiet.

`lose_to`, `lose_money`, `lose_text`, `flee_text`, `elite_drops` und `loot_tables` stehen im bestehenden Zonenformat bereit. Alle Rettungen gehen zum eigenen Bügelraum; normale Gegner dürfen keine Hinweise, Kernzutaten oder Ventilzustände löschen. Warm und kalt verwenden dieselben einmaligen Fundflags.

## Abschluss und Zutaten

Die CH-Zugänge erkennen `vg_bh_boss_glasgaertner_geloest`, `vg_bh_boss_waescherei_geloest` bzw. `vg_bh_boss_mutterwurzel_geloest`. Alternativ gilt CGs jeweiliges `bha_<glasgaertner|atemkessel|bluetenmund>_friedlich`. Erst dann wird der eigene CH-Abschluss gesetzt. Ein `won_` des ersten Abschnitts genügt nie.

Je Quelle gibt es genau zehn Bedingungen auf den eigenen Pfad: Laterne, Eisen, Echo, Maske, Faden, Schlüssel, Kessel, Waage, Moor und Uhr. Die letzten drei haben intern die Pfad-IDs `sq_waage`, `sq_moor`, `sq_uhr`; ihre vorhandenen Zutaten heißen ohne dieses zusätzliche Präfix. Bereits vorhandene Zutaten und bereits entnommene Quellen werden ausgeblendet. Keine neuen Rezepte oder Rituale entstehen.

Der neue `bha_aussaat_schwarm` ist die ausdrücklich reservierte Ausnahme zum CH-Präfix. HP, Rüstung und Schaden entsprechen gerundet 0,7 des vorhandenen Mutterwurzel-Abschnitts 2: 200 HP, Rüstung 2, Schadenswerte 15/18/15. Schlagzeitpunkte bleiben unverändert. Es gibt keine Folgephase. Einleitung, Sieg und Rettung stammen aus CGs `boss_texte.json`.
