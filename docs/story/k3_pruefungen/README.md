# AU: Die offenen Proben

Inhaltspaket für Kapitel 3, ausschließlich zur späteren Integration. Grundlage: `docs/art/codex_AU_k3_pruefungen.md`, Geschichte 3 und AF, gelesen auf Commit `1fe89c56d45f76843bbc4d96b3731259b377ae51`. Kein Spielcode verändert.

| Pfad | Prüfung | Boss-ID | Zutat |
|---|---|---|---|
| laterne | Das Licht unter dem Lack | `k3p_lampengutachter` | `sq_zutat_laterne_4` |
| faden | Die Naht zwischen zwei Zeiten | `k3p_gegenzeugenknuepfer` | `sq_zutat_faden_4` |
| maske | Der Mantel des Widerspruchs | `k3p_garderobenpfaender` | `sq_zutat_maske_4` |
| echo | Der Satz, der fehlen darf | `k3p_pausenfischer` | `sq_zutat_echo_4` |
| kessel | Die saubere Rückstandsprobe | `k3p_chargenpruefer` | `sq_zutat_kessel_4` |
| eisen | Die Last mit zwei Schultern | `k3p_brueckenpresser` | `sq_zutat_eisen_4` |
| schluessel | Die Tür ohne Pfand | `k3p_zollriegel` | `sq_zutat_schluessel_4` |
| sq_waage | Die doppelte Forderung | `k3p_fristpfaender` | `sq_zutat_waage_4` |
| sq_moor | Der Name im falschen Torf | `k3p_schichtsammler` | `sq_zutat_moor_4` |
| sq_uhr | Die Pause im Gangrad | `k3p_gangaufseher` | `sq_zutat_uhr_4` |

## Ablauf

Hedda erscheint nach `k3a_akt2_done`. Alle zehn Gespräche sind frei lesbar; nur der eigene Pfad ab Sequenz 5 kann seine Prüfung annehmen. Jede Prüfung hat vier Schritte, zwei konkrete Fundtexte, eine korrigierbare falsche Antwort, eine friedliche Handlung und einen Kampfweg. Beide Wege setzen denselben Abschlussmerker; ausschließlich Hedda zahlt einmal Zutat und 25 Schilling aus. Flucht und Niederlage bewahren die gefundenen Spuren.

Die zehn Sequenz-1-Quests öffnen erst nach `kapitel3_done` und ab Sequenz 2. Gegenbeleg lesen, Aufbewahrung entscheiden, Ritual vollziehen und bei Hedda abrechnen. Der Entscheidungsmerker öffnet das Ritual; der technische Ritualmerker öffnet erst danach die einmalige Auszahlung von 50 Schilling. Keine zirkuläre Abschlussbedingung.

`rituale.json` ist eine Zuordnung Pfad → Sequenz → bestehende Ritualfelder, kein automatisch geladenes Questpaket. Beim Einbau ersetzt jeder Eintrag genau das jeweilige `seqs[seq].ritual`. Die 55 Herkunftseinträge sind Beschaffungsspezifikation, keine aktiven Loot-Callbacks. Leere Standarddateien sind absichtlich vorhanden. Alle Grafikplatzhalter stehen ausschließlich in der Wunschliste.

## Prüfung

`node docs/story/k3_pruefungen/pruefen.mjs` prüft Struktur, Verweise, Freigaben, Vollständigkeit und Belohnungspfade. Noch nicht vorhandene AR/AS-Vertragsziele werden namentlich als Abhängigkeiten ausgegeben; `--strict` behandelt sie als Fehler. Das ist keine Behauptung einer bereits lauffähigen Integration.

## Eingebaut

Die Spieldaten liegen in `src/data/packs/k3_pruefungen/`. Die Herkunftstabelle bleibt hier.
- `GameState.meets` wertet `requires_pathway` aus: `[pfad, grenze]` verlangt diesen Pfad mit Sequenz grenze oder besser. Ohne Pfad ist die Bedingung nicht erfüllt.
- Sequenz 4 bis 1 sind spielbar (`SEQ_MAX = 1`). Neu sind die Verdauungsraten 0,20, 0,16, 0,13 und 0,10 und die Wachstumsschritte 2/2/3/3 auf den Bestand, wie empfohlen.
- Die Formeln für 4 bis 1 gibt es bei Kittering ab 90/110/135/160 Ehre, zu den AF-Preisen 180/260/380/560.
- `rituale.json` ersetzt die Rituale der Stufen 4 bis 1.
- Die Kernzutaten 3 bis 1 (und 5 der neuen Pfade beim Schwellenhund) geben die Kernfächer der Hüter aus. Das sind die Dialoge aus `beute_vorschlag.json`, nur für den eigenen Pfad.
- Für Trank- und Formelbilder ab Stufe 4 wird vorerst das Bild der Stufe 5 genutzt.

Noch offen:
- Ersatz nach verlorenem Trank
- harte 100-%-Verdauung vor dem Trinken
- Koop-Ansprüche je Spieler
- die `k3p_*_friedlich`-Adapter der Hauptbosse
