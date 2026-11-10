# Dunscar5 – Übergabe an BC/BD und Integration

- Dieses Paket liefert ausschließlich Grafik und Export-/Prüfwerkzeuge. Die Einbindung in `src/world/assets.js`, Daten und Spielcode erfolgt separat.
- Manifest: `public/sprites/manifest-dunscar5.json`. `gameId` verwendet die festgelegten IDs; Asset-IDs entsprechen den Dateinamen ohne Erweiterung. Pfade sind relativ zu `public/sprites/`.
- Händler: `k3h_troedlerin`, `k3h_steinmetz`, `k3h_lampenwart`; Zirkel: `zirkel_schichtbund`, `tm_ds_lampe`, `tm_ds_kerbholz`, `tm_ds_stimme`; Einzelgänger: alle fünf `ez_ds_*` aus dem Auftrag.
- Einwohner haben wie gefordert keine Emotions-Sheets. Ihre Köpfe und die beiden Bahnaufseher sind in `portraits/BE_koepfe.png` enthalten; Regionen sind nach Figuren-ID benannt. Das 8×3-Raster hat zwei transparente Schlussfelder.
- Die beiden Schichtgänger-Varianten benutzen das vollständige 4×4-Laufraster (64×128), da der Auftrag trotz „eine Reihe“ diese Zielgröße festlegt.
- Alle 11 Gegner haben ein 6×5-Kampfraster: idle (4), attack (6), special (6), hurt (3), defeated (4). Ungenutzte Felder sind transparent. Die Ausholframes 7/8 und 13/14 sind jeweils identisch; `frameRate: 8` hält sie zusammen 250 ms.
- `k3k_signalbrecher` hat 64×64-Zellen und zwei explizite Phasen: `pfiff → attack`, `schichtgaenger_ruf → special`. Andere Kampfzellen sind 48×48. `k3k_schienenlaeufer.special` ist die Fluchtbewegung.
- Wenna: `attack` ist Ausweichen, `special` der einzelne Wurf, `defeated` Hinsetzen. Jorys und Wennas Niederlagen sind unblutig; im Manifest zusätzlich `nonlethalDefeat: true`.
- Elite-Variante: `battle/enemy_k3k_staubschmuggler_elite.png`, dieselbe Gegner-ID mit `variant: elite`. Keine neue Gegner-ID erforderlich.
- Bestiarium: `ui/bestiary/F_<id>.png` (96×128), abgeleitet aus der jeweiligen eigenen Kampfzeichnung. Einzelgänger-Kartenbilder `F_ow_*` übernehmen ihre eigenen Laufsheets.
- Steckbriefe: `ui/BE_steckbrief_<id>.png`, 48×64, Portrait-Ausschnitt in Sepia und Bahnsiegel ohne Buchstaben. Die Papierfläche und das geometrische Bahnsiegel sind UI-Rahmenelemente, die Kopfzeichnung stammt aus dem Generatorbild.
- Trophäen: `items/<vollständige_k3k_ID>_trophaee.png`. Das Präfix wird nur einmal gesetzt, also beispielsweise `items/k3k_kupferdieb_trophaee.png`.
- Schichtbund-Props: `props/BE_schichtbund.png`; die sieben Regionen besitzen die ausdrücklich geforderten Maße, auch wenn ihre Atlaszellen 64×64 messen. Map-Pin: Region `stadtkarten_pin`.
- Lichtkegel: `props/BE_lichtkegel.png`, 64×64, warmes Dithering auf binärem Alpha; für beide Aufseher verwendbar.
- Bewusst kein automatischer Laufzeiteinbau und keine Änderungen an BC-/BD-Dateien oder fremden Flags.

## Reproduktion

`python tools/art/dunscar5/plan.py` schreibt den Auftragssatz. Die tatsächlich verwendeten Prompts, Referenz, Quellbildnamen und SHA-256 stehen in `docs/art/batch-dunscar5-generation.json`.

Die Originalbilder aus dem eingebauten Bildgenerator werden nicht vom Spiel geladen. Für einen erneuten Export die Originale bereitstellen und `tools/art/dunscar5/generation-sources.json` mit Einträgen `{ "file": "characters/…png", "source": "/lokaler/pfad/zum/original.png" }` anlegen. Danach `python tools/art/dunscar5/export.py` (Pillow, NumPy, SciPy). Diese maschinenlokale Zuordnungsdatei gehört nicht in Git.

`python docs/art/validate-dunscar5.py` benötigt ausschließlich Pillow und die ausgelieferten Dateien, keine Originalbilder. Die Prüfung erfasst die exakte 100-Dateien-Liste, Größen, Palette, Alpha, Raster, Grundlinien, Padding, Animationsframes und Regionszuordnungen. Sichtprüfung bleibt für Blickrichtung, Ausdruck und Angriffslesbarkeit zusätzlich erforderlich.
