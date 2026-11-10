# AZ · Beziehungen und Stimmungen

47 Figurenprofile, 24 allgemeine Begrüßungen, 104 bestehende Entscheidungsknoten und 25 Auftragsbelohnungen; 20 Figuren erhalten zusammen 40 Zusatzzweige. Alle Pflichtfiguren, die fünf Händler, zehn Dunscarer Hauptfiguren und Hedda sind enthalten. Nur redaktionelle Daten, noch nicht im Spiel eingebunden.

`beziehungen.json` ersetzt beim späteren Einbau die Basisdatei vollständig; `dialog_zusaetze.json` wird einmal über `applyQuestPack` eingelesen. Nicht zusätzlich als zweites Beziehungspaket laden, sonst wird der allgemeine Begrüßungspool verdoppelt. Effekte stehen wie im vorhandenen Format direkt auf den Knoten; `requires_items` ist eine Liste, `takes_items` ein Mengenobjekt. Regeln und fünf Pflichtbeispiele bleiben unverändert.

## Geschenkübersicht

Jedes Profil enthält zwei bevorzugte Arten, zwei konkrete Lieblingsstücke, zwei eigene Begrüßungen und fünf eigene Geschenkantworten. Die IDs sind bewusst angegeben, damit die Tabelle direkt mit den Spieldaten vergleichbar ist. „—“ bedeutet keine persönliche Abneigung; Kit lehnt zusätzlich die Art `weapon` ab.

| Figur-ID | Mag | Verabscheut |
|---|---|---|
| `marlowe` | `tonikum`, `taschentuch` | `blitzpulver` |
| `holt` | `gewuerzwein`, `verband` | — |
| `pimm` | `taschentuch`, `taschenspiegel` | `lampenoel` |
| `greta` | `gewuerzwein`, `riechsalz` | — |
| `quill` | `taschenspiegel`, `glasauge` | — |
| `kit` | `ruhetee`, `taschentuch` | — |
| `pip` | `taschentuch`, `ruhetee` | — |
| `hester` | `ruhetee`, `taschentuch` | `blitzpulver` |
| `ivy` | `verband`, `taschentuch` | `blitzpulver` |
| `rook` | `tonikum`, `taschentuch` | — |
| `price` | `tonikum`, `verband` | — |
| `barnaby` | `gewuerzwein`, `taschentuch` | — |
| `miriam` | `ruhetee`, `wachsbluete` | `bannsalz` |
| `oda_vey` | `ruhetee`, `taschentuch` | — |
| `mews` | `taschenspiegel`, `taschentuch` | — |
| `astronom` | `silberstaub`, `glasauge` | — |
| `lichtmann` | `lampenoel`, `wachsbluete` | — |
| `maud` | `gewuerzwein`, `riechsalz` | — |
| `ned` | `verband`, `taschentuch` | — |
| `wick` | `lampenoel`, `eisenkraut` | — |
| `souffleur` | `ruhetee`, `taschentuch` | `blitzpulver` |
| `zunder` | `verband`, `lampenoel` | — |
| `druce` | `lampenoel`, `verband` | — |
| `sedge` | `wachsbluete`, `ruhetee` | — |
| `hale` | `verband`, `tonikum` | — |
| `brack` | `verband`, `lampenoel` | — |
| `hesper` | `gewuerzwein`, `ruhetee` | — |
| `wyle` | `silberstaub`, `taschentuch` | — |
| `pedell` | `ruhetee`, `taschentuch` | — |
| `brandt` | `silberstaub`, `taschentuch` | — |
| `elsbeth` | `taschentuch`, `taschenspiegel` | — |
| `nell` | `nebeltau`, `bitterwurz` | — |
| `kittering` | `lampenoel`, `silberstaub` | — |
| `gorse` | `glasauge`, `taschenspiegel` | — |
| `sabeth` | `bannsalz`, `nebeltau` | — |
| `grubenwirt` | `verband`, `tonikum` | — |
| `k3_pfiff` | `ruhetee`, `taschentuch` | — |
| `k3_gallowmere` | `taschentuch`, `taschenspiegel` | — |
| `k3_willa` | `silberstaub`, `taschentuch` | `blitzpulver` |
| `k3_oren` | `lampenoel`, `verband` | — |
| `k3_mabel` | `gewuerzwein`, `ruhetee` | — |
| `k3_pelham` | `verband`, `taschentuch` | — |
| `k3_nellie` | `tonikum`, `taschentuch` | — |
| `k3_huxford` | `verband`, `ruhetee` | `blitzpulver` |
| `k3_esther` | `taschentuch`, `taschenspiegel` | — |
| `k3_adaine` | `silberstaub`, `taschentuch` | — |
| `k3_weichenstellerin` | `ruhetee`, `eisenkraut` | — |

## Zusatzzweige

Marlowe, Holt, Pimm, Greta, Quill, Kit, Ivy, Maud, Nell, Gorse; Druce, Sedge, Hale, Brack, Hesper; Oren, Mabel, Nellie, Huxford und Esther. Sieben freundliche Zweige schenken einmalig etwas, zwei Händler erklären den bereits bestehenden Nachlass, elf Zweige geben spoilerfreie Gesprächs- oder Ermittlungstipps. Wiedergutmachung: sieben Entschuldigungen, sieben konkrete Sachleistungen, sechs Beiträge von 20–30 Schilling, jeweils einmalig und +1. Keine drei aufeinanderfolgenden Einträge verwenden dieselbe Mechanik. Groll bleibt allgemein genug, um zu verschiedenen Ursachen einer feindseligen Stimmung zu passen.

## Prüfung und offene Hinweise

Die Daten- und Laufzeitprüfung besteht: alle IDs, 60 Zweigpfade, Kosten, Stimmungsschranken und Einmaligkeit über Speichern/Laden. Der vorgeschriebene Bestandstest mit vorübergehend ersetzter Basisdatei besteht **13/14**: Holts Test erwartet noch einen allgemeinen Satz, obwohl AZ ausdrücklich seinen eigenen verlangt. Ohne Austausch besteht der unveränderte Bestandstest **14/14**. Details und redaktionelle Begründungen: [Prüfbericht](pruefbericht.md).

Beim Einbau den Holt-Test auf `figuren.holt.begruessung.freundlich` umstellen und den allgemeinen Rückfall getrennt an einer Figur ohne Profil prüfen. Die Pflichtbeispiele `ivy/after_bad` und `marlowe/report_bad` sind ausnahmsweise Einstiegsknoten; alle 99 neuen Zuordnungen sind gewählte Optionsziele. Auftrags- und Knotenbonus sind bewusst additiv: Abschluss +1, persönliche Anerkennung zusätzlich +1, große Hilfe selten +2. Erinnerungsknoten erhalten keinen zweiten Bonus.

Zunder und Pfiff haben nur Profile, keine neuen `relation`-Effekte; Einzelgänger bleiben vollständig beim bestehenden Vertrauen. Die 47 Portraitzuordnungen werden nicht verändert. Vor dem Einbau besonders Hesters Begrüßung während ihres bewusstlosen Zustands und Gallowmeres körperlose Geschenkannahme redaktionell im UI prüfen; gegebenenfalls Begrüßung/Geschenkmenü dort situativ unterdrücken. Neue freundlich/feindselig-Portraits für Dunscar und eine neutral zurückhaltende Pose sind spätere Grafikvorschläge, keine Voraussetzung dieses Pakets. Zusatztexte liefern weder neue Hinweise noch Fallbedingungen.
