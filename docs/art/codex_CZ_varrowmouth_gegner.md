# Codex-Paket CZ: Varrowmouth-Gegner und Bosse (Grafik und Kampfdaten)

**Batch-Name:** `varrowmouth4` (Manifest: `public/sprites/manifest-varrowmouth4.json`) **und** Daten nach `docs/story/k6_gegner/`

Du lieferst **sechs Gegnerarten, eine Elite und drei Bosse** für das Finale: Kampf-Sheets, Karten-Sheets, Effekte, Bestiariumsbilder und dazu die Kampfdaten im Format `docs/story/k5_orte/encounters.json` und `bosses.json` (nur lesen). Die Pegelherrin als Figur zeichnet Paket CY (beide Kampf-Sheets); du lieferst für sie nur Daten und Effekte. Muster für Gegner-Pakete: `docs/art/codex_AX_dunscar_gegner.md` und `public/sprites/manifest-dunscar3.json` (nur lesen).

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat. Halte das Paket klein: keine optionalen Extras, keine Varianten, die nicht unten stehen.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial world with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Grid: strict 16x16 pixel tiles. Overworld characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces or for fake transparency. 1px dark outline in deep blue-grey (around #1a1c2c, not pure black) on characters, props and icons; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; turquoise #6fe0d0 or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites (the engine adds lighting).
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.2 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, genau mit den Namen unten.
- Manifest `public/sprites/manifest-<batch>.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-<batch>-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-<batch>-preview.png`.
- Prüfskript (Pillow) unter `tools/art/<batch>/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-<batch>-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

## Gemeinsame Eckdaten „Kapitel 6: Varrowmouth“ (gilt für die Pakete CT bis DA)

Nach Briarholt (Kapitel 5) führt der letzte Weg ans Meer: **Varrowmouth**, die alte Zoll- und Hafenhauptstadt an einer Flussmündung, in der die Gezeiten die Stadt zweimal am Tag umbauen. Bei Ebbe liegen Schlickgassen, Wrackfelder und die unteren Zollkeller frei, bei Flut sind sie Wasser und nur die Stege, Brücken und Oberstraßen begehbar. Die Stadt wird vom **Pegelrat** regiert, sieben Zollherren, die ihre Macht aus einer Sache beziehen, die sie „das Register“ nennen: ein Verzeichnis aller Namen, die je durch den Hafen kamen. Wer im Register steht, kann die Stadt nicht verlassen, ohne dass der Rat es weiß. Der Spieler kommt mit einem Namen an, der schon drinsteht, obwohl er nie hier war. Kapitel 6 ist das **Finale des Spiels**: hier liegt der Grenzbezirk für das Seq-2-Ritual (Karte `hg_grenzbezirk`, siehe Pakete CO/CP, im Norden der Stadt hinter dem Zollzaun) und hier stehen die **Letzten Register**, die Ritualorte für Sequenz 1 (je Pfad eine Karte `vm_register_<pfad>`, siehe Paket DD). Kapitel 6 endet mit dem Aufstieg auf Sequenz 1 oder dem bewussten Verzicht darauf.

Feste IDs:
- Stadt `varrowmouth`, Präfixe: Karten `vm_`, Einwohner und Sprecher `vmn_`, Gegner `vme_`, Gegenstände `vmi_`, Musik `vm_`, Soundgruppe `varrowmouth`, Flags `k6_*`. Ankunfts-Flag `k6_arrived`, Abschluss `k6_done`.
- Stadtteile und Außenkarten (Paket CU legt sie an): `vm_zollhafen` (Ankunft, Zollhaus, Pegelturm), `vm_stegviertel` (Pfahlbauten, Markt auf Stegen), `vm_schlickgassen` (nur bei Ebbe), `vm_oberstrasse` (Reederhäuser, Pegelrat), `vm_wrackfeld` (Gefahrengebiet, Ebbe), `vm_leuchtbank` (Sandbank mit dem alten Leuchtfeuer, Gefahrengebiet), `vm_registerkeller` (Finale), `vm_grenzzaun` (Übergang zu `hg_grenzbezirk`).
- Gezeiten: feste Zustände `ebbe` und `flut`, Wechsel alle 6 Spielminuten (Vorschlag), Flag `gezeit` als flüchtiges Flag `gezeit_ebbe`/`gezeit_flut`; je Karte steht, was sich ändert. Die Pegeluhr am Zollhafen zeigt den Stand.
- Der Pegelrat (sieben Zollherren, Sprecher-IDs `vmn_rat_1` bis `vmn_rat_7`, Namen vergibt Paket CX), seine Vorsitzende **Ismay Harrow, die Pegelherrin** (`vmn_pegelherrin`, Endgegnerin, Boss-ID `pegelherrin`, ein Wesen auf Stufe eines Engels mit einem fremden Pfad „Register“, der nicht spielbar ist).
- Verbündete: **Tam Verrin** (`vmn_tam_verrin`), Lotsin ohne Eintrag, die den Spieler in die Stadt schmuggelt; **Pater Osric Dale** (`vmn_osric_dale`), Leuchtfeuerwärter und letzter Schreiber des alten Registers; **Nell Quarrie** (`vmn_nell_quarrie`), Kind aus den Schlickgassen, das Namen aus dem Register „vergessen“ kann.
- Gegner (Paket CZ beschreibt sie): `vme_zollgeist` (Beamter ohne Gesicht mit Stempel), `vme_gezeitenlaeufer` (Wasserleib auf Stelzen), `vme_salzkruste` (verkrusteter Ertrunkener), `vme_tauwerk` (lebendes Seil), `vme_hafenkraehe` (Schwarm), `vme_pegelknecht` (Wächter des Rats, Elite), Bosse `wrackmutter` (Wrackfeld), `leuchtfeuerwaechter` (Leuchtbank), `pegelherrin` (Finale, zwei Phasen).
- Zirkel in Varrowmouth: **Die Unverzeichneten** (`unverzeichnete`), geheimer Zirkel der Namenlosen, Treffpunkt im Kielraum eines Wracks; Zugang über Tam Verrin ab Beziehung +3.
- Anreise: aus den vier Briarholt-Enden (Paket CG, `docs/story/k5_akte/epiloge.json`, nur lesen) per Küstenbahn und Fähre; keine Rückreise in frühere Städte (feste Regel des Spiels).
- Sequenzen: Der Spieler kommt mit Sequenz 4 oder 3 an. Seq 2 (Engel) wird im Grenzbezirk möglich, Seq 1 erst nach dem Fall der Pegelherrin. Koop: beide Spieler stehen im Register, nur einer kann am Ende das Register schließen; wer es tut, ist eine Entscheidung mit zwei Epilogen.

## 1. Gegner (Karten-Sheet 64x128 oder 32x48 wo angegeben, Kampf-Sheet 6 Spalten, Reihen idle, attack1, attack2, hurt, defeated)
| ID | Bild | Zelle Kampf | Besonderheit |
|---|---|---|---|
| `vme_zollgeist` | Beamter in grauem Rock ohne Gesicht, der Kopf ein Stempelabdruck in Türkis, in der Hand ein Stempel so groß wie ein Hammer | 48x48 | Angriff 2 „Eintragen“: markiert den Spieler (Status `verzeichnet`: Fluchtversuch unmöglich, 3 Runden) |
| `vme_gezeitenlaeufer` | Wasserleib auf langen Treibholz-Stelzen, oben ein Schwall ohne Kopf | 64x64 | nur bei Flut draußen; Angriff 1 ist ein Schwall über die ganze Reihe (Koop: beide) |
| `vme_salzkruste` | Ertrunkener, vollständig mit Salzkruste und Seepocken bedeckt, bewegt sich ruckend, gebleichtes Ölzeug | 48x48 | langsam, viel Leben; zerbricht in zwei kleinere (`vme_salzkruste_rest`, 48x48, nur idle/attack1/hurt/defeated) |
| `vme_tauwerk` | ein lebendes, nasses Tau mit Knoten als Gelenken, am Ende ein rostiger Haken | 64x64 | fesselt (Status `gefesselt`: eine Runde aussetzen), geringe Nerven-Schäden |
| `vme_hafenkraehe` | Schwarm aus 7 Krähen mit Salz an den Federn, Karten-Sheet 32x32 als Wolke | 64x64 | zieht Gegenstände ab (ein Grundvorrat je Kampf), flieht bei 50 % |
| `vme_pegelknecht` (Elite) | Wächter des Rats, lange Zollmäntel, Gesicht hinter einer Pegelskala aus Messing, Stock mit Haken | 64x64 | tritt zu zweit auf; wenn einer fällt, wird der andere stärker |

Karten-Sheets `characters/<id>.png`, Kampf-Sheets `battle/enemy_<id>.png`, Köpfe fürs Bestiarium `portraits/heads/<id>.png` (24x24), Bestiariums-Bild `ui/bestiar/<id>.png` (48x48).

## 2. Bosse
- `wrackmutter` (128x96, Reihen idle, attack1, attack2, special, hurt, defeated): ein gestrandeter Walfänger-Rumpf, aus dem eine Gestalt aus Netzen, Tauen und Galionsfigur wächst; special: ruft zwei `vme_tauwerk`. Nur bei Ebbe. Karten-Darstellung als Prop (Wrack geschlossen/offen, 96x64, 2 Frames) in CV vorhanden? Nein: liefere sie hier unter `props/vm_wrackmutter_wrack.png`.
- `leuchtfeuerwaechter` (96x96): eine Gestalt aus der alten Leuchtfeuer-Linse, Körper ein drehendes Linsenrad, in der Mitte eine Flamme, die wie ein Auge wirkt; special: Lichtkegel über die Reihe, blendet (Status `geblendet`). Zweite Phase bei 40 %: das Rad zerspringt, ein Mensch bleibt (`leuchtfeuerwaechter_mensch`, 64x64, Reihen idle, hurt, defeated, kein Angriff: er wehrt sich nicht mehr; Kampf endet durch Verschonen oder Treffer).
- `pegelherrin` (Sheets aus CY): Daten für zwei Phasen; Phase 1 ~1600 Leben, Phase 2 ~2200 (Vorschlag, Sequenz-Erwartung 3), Phase-2-Mechanik „Eintragen“: jede dritte Runde trägt sie eine Fähigkeit des Spielers ins Register ein (gesperrt bis Kampfende), Gegenmittel: Nells Namenlos-Ring oder ein Zollherr als Zeuge halbiert die Dauer. Friedliche Lösung: Mit allen vier Fährten aus Akt IV und Beziehung Osric ≥ +3 kann der Spieler vor Phase 2 das Register „vorlesen“ (Dialog in CT); dann endet der Kampf ohne Phase 2.

## 3. Effekte (`fx/`)
`vm_stempel.png` (32x32 x 6, türkiser Stempelabdruck), `vm_schwall.png` (96x32 x 6, Wasserschwall über die Reihe), `vm_salzbruch.png` (48x48 x 5), `vm_fessel.png` (32x32 x 4 Schleife), `vm_kraehen_abflug.png` (64x64 x 6), `vm_lichtkegel.png` (480x270, 4 Frames, Alpha), `vm_verzeichnet.png` (16x16 x 4 Status-Icon), `vm_geblendet.png`, `vm_gefesselt.png` (je 16x16 x 4).

## 4. Daten (`docs/story/k6_gegner/`)
`encounters.json` (alle Gegner mit Leben, Angriffen, Schadensspannen, Nerven-Schaden, Resistenzen, Beute mit bestehenden Item-IDs plus `vmi_*` aus CU; Sequenz-Erwartung 4 bis 3; Schadensdeckel so, dass normale Gegner mindestens 4 Runden und Bosse mindestens 5 Runden stehen), `bosses.json` (Phasen, Auslöser, Vorbereitung, Beute), `bestiarium.json` (je Gegner 2 bis 3 Sätze Beschreibung und ein Hinweis zur Schwäche), `status.json` (die drei neuen Status mit Dauer und Text), `README.md`, `pruefen.mjs`.

## 5. Abgabe
PNGs, Manifest, `tools/art/varrowmouth4/check.py`, Validation, Preview, die Daten mit Prüf-Ausgabe, README-Ergänzung, Pull Request.
