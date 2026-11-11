# CO: Halbgott und Engel

Grafiklieferung für das getrennte Daten-/Einbaupaket CP. Kein Spielcode geändert. Batch `halbgott`; feste Kreatur-IDs `hg_form_<pfad>`, Wächter `hg_schwellenwaechter` und `hg_grenzwaechter`.

## Inventar

73 PNGs, 780 Rasterzellen: sechs Trink-Sheets, acht Effekte, zehn Kreatur-Lauf-Sheets, zehn Kreatur-Kampf-Sheets, zehn Zugportraits, zwei Wächter-Kampf-Sheets, zwei Wächter-Kartenfiguren, ein Siegelstreifen, zwei Kampfkulissen, zwanzig Sequenzbilder und zwei HUD-Größen. Keine vorhandenen Trank-Icons, Embleme oder normalen Pfadposen ersetzt.

## Registrierung in `src/world/assets.js`

| Gruppe | Registrierung | Framegröße / Verwendung |
|---|---|---|
| `characters/A_player_drink_{halbgott,engel}.png` | `ANIM_SHEETS`, Keys `player_drink_halbgott` / `player_drink_engel` | 16×32, zwölf Frames, 6 FPS, einmal |
| `characters/p2{a,b}_drink_{halbgott,engel}.png` | `ANIM_SHEETS`, Keys entsprechend Dateistamm | 16×32, zwölf Frames, 6 FPS, einmal |
| `fx/HG_aufstieg_{4,2}.png` | `ANIM_SHEETS` | 240×135, acht Frames; auf 480×270 skalieren, opak hinter Spieler |
| `fx/HG_kreatur_wechsel.png` | `ANIM_SHEETS` | 64×64, acht Frames; `transform` vorwärts, `revert` rückwärts |
| `fx/HG_furcht.png` | `ANIM_SHEETS` | sechs unabhängige 16×16-Zeichen, keine durchgehende Animation |
| `fx/HG_umfallen.png` | `ANIM_SHEETS` | 16×32, vier Frames, einmal; letzter Frame liegend und lebend |
| `fx/HG_aura_{halbgott,engel}.png` | `ANIM_SHEETS` | 24×36, vier Frames, Schleife |
| `fx/HG_zoegern.png` | `ANIM_SHEETS` | 32×32, vier Frames, Schleife |
| `characters/hg_form_<pfad>.png` | Kartenfiguren-Loader / eigene `ANIM_SHEETS`-Einträge | 32×48 statt der üblichen 16×32, vier Richtungen, Fußpunkt y=46 |
| `battle/hg_battle_<pfad>.png` | `BATTLE_SHEETS` | 96×96, sechs Spalten und sechs Reihen; Bezug zur Form `hg_form_<pfad>` |
| `battle/hg_schwellenwaechter.png` | `BATTLE_SHEETS` | **128×96**, rechteckige Frames explizit angeben |
| `battle/hg_grenzwaechter.png` | `BATTLE_SHEETS` | 128×128 |
| `characters/hg_*waechter_karte.png` | Kartenfiguren-Loader / `ANIM_SHEETS` | 32×48, vier frontale Idle-Frames |
| `battle/hg_siegel.png` | separates Overlay-Sheet, z. B. `ANIM_SHEETS` | 32×32, zehn statische Siegel; vor die Brust des Wächters setzen |
| `battle/bg_hg_{schwelle,grenze}.png` | vorhandenes Kampfkulissen-Register | 480×270 opak, als Bild laden |
| `ui/hg_zug_<pfad>.png` | `UI_SHEETS` bzw. Zugportrait-Register | 32×32, ein Bild pro Form |
| `ui/hg_seq{4,2}_<pfad>.png` | `UI_SHEETS` bzw. Sequenzbild-Register | 240×135 opak |
| `ui/HG_hud.png`, `ui/HG_hud_32.png` | `UI_SHEETS`, beim Ausschneiden Regionsdaten nutzen | zehn Zellen, 16×16 bzw. 32×32 |

`UI_SHEETS` enthält im vorhandenen Loader zum Teil Gesamtbildmaße, `ANIM_SHEETS` und `BATTLE_SHEETS` dagegen Framegrößen. Diese Konvention beim Einbau beibehalten. Die Manifestwerte sind die verbindlichen Zuschnittmaße. Die größeren Kreaturen dürfen nicht über den normalen 16×32-Figuren-Zuschnitt geladen werden.

Pfadreihenfolge für Siegel und Pfadbindung: `laterne`, `faden`, `maske`, `echo`, `kessel`, `eisen`, `schluessel`, `sq_waage`, `sq_moor`, `sq_uhr`. Zugportraits werden aus dem Kopf/Kern des jeweiligen eigenen Kampf-Idle-Bilds gewonnen. HUD32 ist eine exakte Nearest-Neighbor-Verdopplung von HUD16.

## Animationsvertrag

Kreatur-Lauf-Sheets: unten 0–3, links 4–7, rechts 8–11, oben 12–15. Vier Frames pro Richtung, 6 FPS. Karten-Wächter: 0–3, 4 FPS. Baseline für beide Größen y=46. Figurenschatten, Kollision und Namensschild am Fußpunkt ankern, keine zusätzliche große Kollisionsfläche aus dem Bild ableiten.

Kampf-Reihen: idle 0–5, attack1 6–11, attack2 12–17, special 18–23, hurt 24–29, defeated 30–35. Angriffszellen 7/8 und 13/14 sind absichtlich pixelidentische Aushol-Holds. Besiegt bedeutet bei Formen die Rückkehr in eine kniende menschliche Gestalt, bei Wächtern Kalkhaufen bzw. absinkenden Nebel mit zurückbleibenden Steinen. Keine Todesanimation.

Wächter: `idle_p1` verwendet 0/1, `idle_p2` 2/3, `idle_p3` 4/5; die Phasen nicht automatisch nacheinander abspielen. CP/der Kampfzustand entscheidet die Phase. Das Pfadsiegel ist ein getrenntes Overlay, damit zehn Varianten ohne zehn weitere Boss-Sheets möglich bleiben. Brustposition je Animationsframe beim Einbau an den sichtbaren Sockel anpassen; keine starre Weltposition verwenden.

Die Trink-Beschreibung des Auftrags zählt bei wörtlicher Addition mehr als zwölf Teilbilder auf, fordert aber verbindlich zwölf Frames und 192×32. Gewählte Verteilung: 0–1 Phiole heben, 2–3 trinken, 4 taumeln, 5 Augen bedecken, 6–7 Lichtriss, 8 aufrichten, 9–10 Doppelumriss, 11 ruhiges Leuchten. Blick nach unten und Baseline y=30; Engel-Frames 6–8 schweben zwei Pixel höher. Dies bewahrt alle Phasen innerhalb des geforderten Rasters.

Die Freischaltung bei 50 % Verdauung, Furchtstärke, Ohnmacht, Ritualzugang, Phasenwechsel und getrennte Koop-Formen sind Spiellogik und werden nicht durch dieses Grafikpaket implementiert. Pro Spieler eine eigene Form-/Aurasprite-Instanz und eigene Texture-Keys verwenden; Quellen sind gemeinsam nutzbar.

## Herstellung und Prüfung

Erzeugung über den eingebauten Bildgenerator. Die vollständigen Prompts, Quellen-Prüfsummen und Zuschnittgitter stehen in `batch-halbgott-generation.json`. Für Charaktere wurden die vorhandenen drei Trinkfiguren, für Wächterzeichen die vorhandenen zehn Embleme als Bildreferenzen verwendet. Gemeinsame Palette aus `manifest-fasserin.json`, maximal 32 Farben. Anschließend Nearest Neighbor, feste Baselines, binäres Alpha und transparente Leerbereiche.

`tools/art/halbgott/export.py <lokale-quellenliste.json>` beschreibt die Nachbearbeitung; die Quellenliste enthält pro Bild Pfad und das in der Generationsdatei dokumentierte Gitter. Die fertigen PNGs sind unabhängig vom Exportskript nutzbar. Die Rohbilder sind keine Laufzeitabhängigkeit.

```sh
python tools/art/halbgott/check.py
```

Der Prüfer schreibt `batch-halbgott-validation.json` und kontrolliert das Inventar unabhängig vom Manifest: Maße, Palette, Alpha, nichtleere Frames, Animationsgrenzen, Standlinien, schwebende Engel-Frames, Aushol-Holds, Bossphasen, Rückverwandlung und HUD-Verdopplung. Vorschau: `batch-halbgott-preview.png`. Visuelle Abnahme ergänzt die technischen Prüfungen; ein Spieletest erfolgt erst beim separaten Einbau.
