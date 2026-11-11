# Codex-Batch CB: Icons für die geliehenen Dunscar-Gegenstände (Händler, Einzelgänger-Gaben, Kalkblatt)

**Batch-Name:** `icons3` (Manifest: `public/sprites/manifest-icons3.json`)

Die Pakete BC (Händler, Schichtbund, Einzelgänger) und BD (Zeitung) haben Gegenstände gebracht, die im Spiel noch **geliehene Bilder** tragen (`src/world/assets.js` → `ITEM_ICON_ALIASES`, Abschnitt BC/BD). Das sind **35 Icons**: 8 Ausrüstungsstücke und Werkzeuge der Dunscar-Händler, 10 Prüfungshilfen (eine je Pfad), 3 Fundstücke der Schichtbund-Aufträge, 5 persönliche Gaben der Einzelgänger und 9 Ausgaben des „Dunscarer Kalkblatts“. Du lieferst **eigene Bilder, Dateiname = Item-Id**; der Einbau streicht danach nur die Alias-Zeilen.

Nicht in diesem Paket: die Nerven-Artefakte (Paket BY), Konzentrations-Artefakte (BX), die Fasserin-Artefakte (BO) und die Tränke/Formeln (BB).

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat.

**Setting:** Dunscar ist eine stillgelegte Kalkbergbau-Stadt auf einer baumarmen Kalkhochebene: heller Kalkstein, weißer Staub, rostige Schienen, Holzgerüste, Signalmasten, Wind. Gedämpftes Weiß, Ocker, Rostbraun, Schiefergrau; Türkis und Violett nur für Übernatürliches.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial city called Kettlegate with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Grid: strict 16x16 pixel tiles. Overworld characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces or for fake transparency. 1px dark outline in deep blue-grey (around #1a1c2c, not pure black) on characters, props and icons; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; turquoise #6fe0d0 or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites (the engine adds lighting).
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.2 Ablage im Repo
- 16x16 unter `public/sprites/items/<id>.png` für **alle 35** Ids.
- 32x32 unter `public/sprites/items/32/<id>.png` für die 8 Ausrüstungsstücke/Werkzeuge (Tabelle 1), die 3 Fundstücke (Tabelle 3) und die 5 Gaben (Tabelle 4), weil sie im Ausrüstungs- und Artefakt-Tab groß gezeigt werden. Prüfungshilfen und Zeitungen nur 16x16.
- Manifest `public/sprites/manifest-icons3.json` wie `manifest-14b.json` (Liste der Ids, Größen).
- Prompts in `docs/art/batch-icons3-generation.json`, Vorschau `docs/art/preview-icons3.png`, Absatz in `docs/art/README.md`.
- Prüfskript (Pillow) `tools/art/icons3/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, 35 Dateien vorhanden.

### 0.3 Nachbearbeitung
1. Nearest Neighbor exakt aufs Zielraster; 16er nicht aus den 32ern herunterrechnen, sondern eigens zeichnen oder nachpixeln.
2. Auf die gemeinsame Palette indizieren; als Referenz vorhandene Icons mitgeben: Ausrüstung `items/32/mantel_leder.png`, `items/32/hut_schirmmuetze.png`; Verbrauchsgüter `items/verband.png`, `items/riechsalz.png`; Artefakte `items/32/stille_glocke.png`; Zeitung `items/zeitungsausschnitt.png`.
3. Transparenz prüfen: kein weißer oder schwarzer Rand.

## 1. Ausrüstung und Werkzeuge der Händler (8 Stück, 16 + 32)
Verkauft von Trödlerin, Steinmetz Bram Tolley und Lampenwart. Abgetragene Arbeiterkleidung: Filz, Leinwand, Leder, Messing, Kalkstaub in den Falten.

| Id | Name | Slot | Platzhalter (jetzt) | Motiv |
|---|---|---|---|---|
| `k3h_schichtkappe` | Schichtkappe | Hut | `hut_schirmmuetze` | flache Arbeiterkappe aus doppelt gelegtem grauem Filz, stumpfe Messingspange vorn, Kalkstaub auf dem Schirm |
| `k3h_staubhaube` | Staubhaube | Hut | `hut_schutzbrille` | Haube aus gewaschener heller Leinwand, zwei schmale Schutzgläser in Blechfassung, Band unterm Kinn |
| `k3h_rangiermantel` | Rangiermantel | Mantel | `mantel_leder` | schwerer dunkelbrauner Mantel mit verstärkten Schultern, auf denen helle Druckstellen von Kupplungen sitzen, Lederriemen |
| `k3h_taschenrock` | Taschenrock | Mantel | `mantel_flicken` | langer Rock/Kittel mit vielen aufgesetzten Taschen, jede in anderem Stoffton geflickt, ein Knopf fehlt |
| `k3h_feierabendmarke` | Feierabendmarke | Amulett | `pfandmarke_alt` | ausgemusterte Blechmarke mit gestanztem Loch am abgewetzten Lederband, Kerbe statt Nummer |
| `k3h_kupplungsring` | Kupplungsring | Amulett | `siegelring` | glatt geschliffener dicker Ring aus dunklem Eisen, eine Bruchkante poliert, an einer Schnur |
| `k3h_faeustel` | Steinmetzfäustel | Waffe | `richterhammer` | kurzer Hammer mit breitem Stahlkopf und mit Schnur umwickeltem Griff, Kalkstaub am Kopf |
| `k3h_steinmeissel` | Langer Steinmeißel | Waffe | `brecheisen` | langer Stahlmeißel mit rundem Handschutz aus Messing, Schneide leicht ausgebrochen |

## 2. Prüfungshilfen (10 Stück, nur 16)
Hedda Quists Prüfungen: je Pfad ein Verbrauchsgut, das Händler in Dunscar führen. Familie: kleine Portionen in Papier, Dose oder Fläschchen, mit einem Siegelpunkt in der Pfadfarbe (Laterne amber, Faden lilac #c8b0e8, Maske rose #e07a8a, Echo türkis #6fe0d0, Kessel giftgrün #9ad06a, Eisen stahlgrau, Schlüssel messing, Waage mattgold, Moor torfbraun, Uhr kupfer).

| Id | Name | Pfad | Platzhalter (jetzt) | Motiv |
|---|---|---|---|---|
| `k3h_hilfe_laterne` | Blendkreide | Laterne | `kreidestummel` | kurzes Kreidestück in gelblichem Papier, ein heller Funke an der Spitze |
| `k3h_hilfe_faden` | Nahtbalsam | Faden | `salamanderoel` | flache runde Blechdose, Deckel halb offen, heller Balsam mit einem lila Faden quer |
| `k3h_hilfe_maske` | Riechfläschchen | Maske | `riechsalz` | kleines geschliffenes Fläschchen mit Glasstöpsel, rosa Flüssigkeit, Quaste |
| `k3h_hilfe_echo` | Dämpfpfropfen | Echo | `madenwachs` | zwei Wachspfropfen in gefaltetem Papier, türkiser Punkt auf jedem |
| `k3h_hilfe_kessel` | Laugenumschlag | Kessel | `verband` | zusammengelegte Leinenkompresse, grünlich getränkt, mit Schnur gebunden |
| `k3h_hilfe_eisen` | Griffsalbe | Eisen | `ambossstaub` | kleiner Tiegel aus Steingut mit grauer Salbe, Fingerabdruck in der Oberfläche |
| `k3h_hilfe_schluessel` | Federöl | Schlüssel | `lampenoel` | Ölkännchen aus Messing mit langer Tülle, ein Tropfen an der Spitze |
| `k3h_hilfe_sq_waage` | Gewichtspulver | Waage | `glockenstaub` | Papiertütchen mit mattgoldenem Pulver, eine winzige Waagschale als Prägung |
| `k3h_hilfe_sq_moor` | Torfkompresse | Moor | `grabmoos` | dunkelbrauner Torfbrocken in feuchtem Leinen, Moosfaser |
| `k3h_hilfe_sq_uhr` | Taktessenz | Uhr | `fremdlicht_phiole` | schlanke Phiole mit kupferfarbener Essenz, in der ein Pendel-Tropfen schwebt |

## 3. Fundstücke der Schichtbund-Aufträge (3 Stück, 16 + 32)

| Id | Name | Platzhalter (jetzt) | Motiv |
|---|---|---|---|
| `k3h_namenstaefelchen` | Bram Tolleys Namenstäfelchen | `schreintaefelchen` | kleines Täfelchen aus hellem Kalkholz mit eingeschnittenen Kerben (kein lesbarer Text), Lederöse, ein feiner Riss |
| `k3h_kerbholz` | Eigenes Kerbholz | `pfahlholz` | kurzer Holzstab mit Kerbreihe, oben ein frischer, hellerer Schnitt, Schnur |
| `k3h_mantelzettel` | Abschrift der Mantelnaht | `k2n_pfandzettel` | abgerissenes Stück Futterstoff mit eingenähtem Namensband, daneben ein Zettel mit Bleistiftstrichen (keine Buchstaben) |

## 4. Gaben der Einzelgänger (5 Stück, 16 + 32)
Persönliche Erinnerungsstücke, die als Artefakte wirken („die Erinnerung hilft und belastet zugleich“). Jedes trägt einen Hauch Türkis `#6fe0d0` oder Violett, sonst Rost, Kalkweiß, Messing.

| Id | Name | Von | Platzhalter (jetzt) | Motiv |
|---|---|---|---|---|
| `ez_ds_rangierer_gabe` | Hemmschuh am Band | Holm Varley, Rangierer | `ankerhaken` | kleiner eiserner Hemmschuh (Bremskeil für Schienen) an einem Lederband, Rost, türkiser Schimmer in der Kerbe |
| `ez_ds_kalkbrennerin_gabe` | Kalter Ofenlöffel | Senta Quill, Kalkbrennerin | `amulett_eisen` | langer Eisenlöffel mit verbrannter Laffe, weißer Kalkrest, ein violetter Funke in der Asche |
| `ez_ds_streckenlaeufer_gabe` | Stillstehende Taschenuhr | Der Streckenläufer | `taschenuhr` | Taschenuhr mit gesprungenem Glas, Zeiger stehen beide oben (keine Ziffern), Kette abgerissen, türkiser Punkt im Glas |
| `ez_ds_walzenstimme_gabe` | Leerer Trichterring | Jory Pell, Walzenstimme | `wachszylinder` | Messingring eines Schalltrichters ohne Trichter, innen dunkel, zwei feine Schallringe in Türkis |
| `ez_ds_schrankenkind_gabe` | Unbenannte Kerbe | Wenna, Schrankenkind | `knotengarn` | Holzspan von einer Schranke, rot-weiß gestreift, mit einer einzigen tiefen Kerbe, violetter Schimmer in der Kerbe |

## 5. Dunscarer Kalkblatt, Ausgaben 1 bis 9 (9 Stück, nur 16)
Die Zeitung von Dunscar, gekauft am Stand. Alle neun sehen als gefaltetes Blatt gleich aus; sie unterscheiden sich nur durch ein **Titelbild-Feld** oben (kein Text, keine Zahlen) und einen leichten Vergilbungsgrad (Ausgabe 1 am gelbsten, Ausgabe 9 am hellsten). Am besten als **ein Streifen 144x16** (neun Zellen) plus Einzeldateien.

| Id | Titelbild-Feld |
|---|---|
| `k3e_ausgabe_1` | kleiner Bahnhof mit Uhr |
| `k3e_ausgabe_2` | Signalmast |
| `k3e_ausgabe_3` | Kalkofen mit Rauch |
| `k3e_ausgabe_4` | Lokomotive von vorn |
| `k3e_ausgabe_5` | Steinbruch-Treppe |
| `k3e_ausgabe_6` | Walze mit Trichter |
| `k3e_ausgabe_7` | Schranke |
| `k3e_ausgabe_8` | Lohnbüro-Fenster mit Lampe |
| `k3e_ausgabe_9` | leerer Bahnsteig |

## 6. Prompt-Vorlagen

**Einzelnes Icon (16 oder 32):**
```
[STYLE BLOCK]
Single inventory item icon, <16x16|32x32> pixels on transparent background, centered, 1px deep blue-grey outline, 1px light rim top-left. Subject: <Motiv aus der Tabelle, auf Englisch>. Worn working-class object from a chalk-quarry railway town: felt, canvas, leather, iron, brass, chalk dust in the folds. <Für Gaben: one small touch of turquoise #6fe0d0 or deep violet.> Readable at 16x16.
```

**Zeitungsstreifen:**
```
[STYLE BLOCK]
Horizontal strip of 9 newspaper icons, each 16x16 pixels, no gap, transparent background. Each: a folded broadsheet in yellowed paper with a dark masthead bar and a tiny picture box showing, left to right: 1) a small station with a clock 2) a signal mast 3) a lime kiln with smoke 4) a locomotive front 5) quarry stairs 6) a roller with a horn 7) a railway barrier 8) an office window with a lamp 9) an empty platform. Paper gets slightly lighter from left to right. No letters, no numbers, only grey line stubs for text.
```

## 7. Einbau (macht ein anderer Thread, nur zur Info)
In `src/world/assets.js` die Alias-Zeilen für diese 35 Ids streichen, die 16 Ids mit 32er-Fassung in `ICON32` eintragen, Manifest in `tests/sprites.test.js`, `npm test`.
