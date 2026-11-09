# AL · Vier Wexmoorer Akten

> Eingebaut: Die Daten liegen jetzt in `src/data/packs/k2_akten/`. Enden, Fallregister und Zeitung übernimmt der Paketlader. Senn, Veit und Noll kämpfen bis zu eigener Grafik mit vorhandenen Sheets.

Inhaltspaket für **Nebelakten**, Stand der Vorlage `docs/art/codex_AL_k2_akten.md` auf `1ecfc2df1facaacfd4e6e0caf7a554a08db20d41`. Nur dieser Ordner wird geliefert. Die Daten sind noch nicht in den Spielimport eingebunden.

| Akte | Freigabe | Schauplätze | Umfang |
|---|---|---|---|
| `k2a_tinte` · Die Tinte des Telegrafisten | `k2_akt1_done` | Bahnhof, Schleuse im Bahnhof, Salzmarkt, Wärterhütte am Torfstich | 16 Hinweise, 5 Deduktionen, 3 Enden |
| `k2a_bittere_mittel` · Bittere Mittel | `k2_akt2_done` | Salzmarkt, Pfahldorf, öffentliches Akademietor in der Oberstadt, Torfstich | 16 Hinweise, 5 Deduktionen, 3 Enden |
| `k2a_hafenrecht` · Hafenrecht | `k2_akt2_done` | Bojenhafen, Salzmarkt, Pfahldorf, Salzwatt | 16 Hinweise, 5 Deduktionen, 3 Enden |
| `k2a_letztes_bild` · Das letzte Bild | `k2_akt3_done` | Oberstadt mit Wandatelier, Salzmarkt, Pfahldorf | 16 Hinweise, 5 Deduktionen, 3 Enden |

Jede Akte hat sieben Questschritte, acht Fakten mit je zwei Quellen, eine widerlegbare falsche Behauptung, vier echte und eine falsche Deduktion, eine Polizeiszene, einen zwingenden Showdown und drei endgültige Abschlüsse. Der Bilderfall enthält zusätzlich den vermeidbaren Kampf gegen Vane. Insgesamt: **64 Hinweise, 32 Fakten, 20 Deduktionen, 5 Begegnungen, 12 Enden, 12 Zeitungsmeldungen, 12 spätere Reaktionen**.

## Dateien

- `quests.json`, `dialogues.json`, `dialog_zusaetze.json`, `npcs.json`, `case.json`, `items.json`, `encounters.json`, `platzierung.json`: die acht Pack-Dateien im vorhandenen Format. `case.json` enthält zusätzlich die aus Kapitel 1 bekannten `endings`.
- `faelle.json`: vier Fallwand-Einträge mit Titel, Kurztext, Bedingungen, Zielkontakt und Abschlussbedingung. Der notwendige Adapter ist in `offene_punkte.md` beschrieben.
- `zeitung.json`: Liste im Format von `packs/lore/zeitungen.json`, Zeitung `bote`.
- `ablauf.md`: Wahrheit, Chronologie, Verdächtige, Beweisführung, Spielzeitansatz und Konsequenzen.
- `grafikwuensche.md`: nur zusätzliche Wünsche außerhalb der gemeinsam vergebenen AO-Figuren.
- `offene_punkte.md`: konkrete Einbauarbeiten, Darstellungsgrenzen und Abgrenzung zu anderen Paketen.
- `pruefen.mjs`: Struktur-, Karten- und Ablaufprüfung mit vorhandenen DOM-freien Spielmodulen.

## Spielen und integrieren

Beginn beim jeweiligen neuen Auftraggeber. Zunder nennt die Kontakte, solange ein Fall noch nicht angenommen ist. Ein Verschwinden Zunders während Akt IV verhindert weder Start noch Abschluss bei diesen Kontakten. Die Fallwand im Kahn wird in diesem Paket nicht verändert.

Neue Akten beginnen vor dem Abschluss der Hauptgeschichte. Bereits angenommene Akten bleiben nach allen vier Hauptenden offen und lösbar. Keine Akte setzt, löscht oder verlangt Flags aus AM, AP oder AQ. Die vier gemeinsam reservierten NPC-IDs werden exakt übernommen. Senn, Veit und Noll gehören dagegen ausschließlich AL.

Eine Niederlage oder Flucht schließt keinen Fall. Nach einem Sieg wird der Gegner nicht erneut angeboten. Die Abschlusswahl ist durch aktive Quest, Siegflag und fehlendes Abschlussflag geschützt. Inventarabschriften sind keine verbrauchbaren Schlüssel für Pflichtbeweise. Ein ausgeräumtes Inventar blockiert die Ermittlung nicht.

**Spielzeit-Ziel: 30 bis 45 Minuten pro Akte.** Das ist ein redaktioneller Ansatz aus Lesen, Befragen, Wegstrecken, Deduktionen und Kampf. Ein gemessener visueller Spieltest ist erst nach dem Einbau möglich. Es gibt keine echte Wartewoche im Bilderfall: Die Siebentagesfrist betrifft die bereits geschehenen Fälle; Vane hat das nächste Bild zurückgehalten.

## Prüfung

Vom Repo-Verzeichnis aus:

```sh
node docs/story/k2_akten/pruefen.mjs
```

Keine Paketinstallation erforderlich. Das Skript verwendet nur Node und bereits vorhandene lokale Spielmodule, darunter den zentralen Test-Inhaltslader. Es ergänzt Enden, Fallregister und Zeitung ausschließlich im Arbeitsspeicher. Damit wird keine bereits vorhandene Live-Unterstützung behauptet.

Die Ablaufprüfung klickt nur sichtbare Dialogpfade, sammelt die erreichbaren Quellen, kombiniert Fakten über `GameState.combine` und wertet Kämpfe mit `Combat` aus. Sie prüft alle zwölf Abschlüsse, acht Flucht-/Niederlagepfade, den falschen Bilderpfad, erneute Gespräche und Save/Load. Für die Abschlussprüfung werden perfekte Paraden benutzt; sie ist kein Nachweis der Schwierigkeit für ungeübte Spieler.

## Belohnungen

Die Werte in `case.json` sind die Rohwerte des vorhandenen Systems. `GameState.setEnding` zahlt bei positiver Ende-Ehre zusätzlich zweimal diesen Rohwert als Geld. Positive Ehre wird im Spiel mit `HONOR_GAIN = 0.25` verarbeitet; Deduktionen können weiteres Ansehen bringen. Keine Abschlussprämie darf zusätzlich in einen Dialogknoten kopiert werden.

| Akte / Ende | `gives_money` | Ehre roh | Geld beim Ende, ohne weitere Modifikatoren |
|---|---:|---:|---:|
| Tinte / offen | 35 | 7 | 49 |
| Tinte / still | 25 | 3 | 31 |
| Tinte / verkauft | 65 | -9 | 65 |
| Bittere Mittel / offen | 40 | 8 | 56 |
| Bittere Mittel / geschützt | 30 | 5 | 40 |
| Bittere Mittel / Vergleich | 70 | -10 | 70 |
| Hafenrecht / Namen | 45 | 8 | 61 |
| Hafenrecht / still | 30 | 5 | 40 |
| Hafenrecht / Kasse | 80 | -12 | 80 |
| Letztes Bild / Rückgabe | 50 | 9 | 68 |
| Letztes Bild / Bruch | 25 | -5 | 25 |
| Letztes Bild / geheim | 35 | 2 | 39 |

Kämpfe geben keine eigene Geld- oder Itembeute. Die vier versiegelten Abschriften sind gewichtlose Schlüsselgegenstände ohne Verkaufswert und werden einmal bei Annahme vergeben.
