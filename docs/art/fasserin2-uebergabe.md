# CQ – Fasserin-Aufträge als Grafik

Batch `fasserin2` ergänzt Oda Kessel aus BO. Enthalten sind exakt 54 PNGs: sieben UI-Dateien, ein Posen-Sheet, eine Portrait-Ergänzung, zwei Props, drei Effekte und 20 Artefakte in je zwei Größen. Das sind 136 Rasterzellen einschließlich der transparenten Mitte des 9-Slice-Rahmens. Die ungefähre Dateizahl im Auftrag zählt die zweite Icon-Größe nicht vollständig mit.

Spielcode und bestehende BO-Dateien bleiben unverändert. Auftragstexte, Preise und Spielregeln liefert CR. Diese Lieferung ist ein Grafikpaket; die Laufzeitintegration steht aus.

## Dateien und Einbau

Das Manifest `public/sprites/manifest-fasserin2.json` enthält Zellmaße, Regionen, Frame-Listen, Bildraten und Wiederholungen. Alle Frame-Indices sind nullbasiert und zeilenweise. Alle Bilder verwenden dieselbe 32-Farben-Palette wie BO. Transparenz ist binär; nur die Einladung ist vollständig opak. Beim Rendern Nearest Neighbor und ganzzahlige Positionen verwenden.

| Ziel in `src/world/assets.js` | Dateien / Verwendung |
|---|---|
| `UI_SHEETS` | `CQ_auftrag` (80×16), `CQ_auftrag_32` (160×32), `CQ_chance` (80×16), `CQ_zirkel_marke` (96×16), `CQ_hud` (64×16); Regionen aus Manifest verwenden. |
| UI-Bild / 9-Slice | `CQ_einladung` (96×48), `CQ_rahmen_auftrag` (48×48), Insets jeweils 16; transparente Mitte nicht als Sprite anzeigen. |
| `ANIM_SHEETS` | `fasserin_posen`, Zellen 16×32; drei `CQ_*`-Effekte, Zellen 32×32. Animationen explizit nach Manifest anlegen. |
| Portrait-Ergänzung | `fasserin_emotions2`, Zellen 64×64; als zusätzliches Sheet laden. Das vorhandene Portrait nicht ersetzen. |
| Props / `SHEETS` | `fasserin_werkbank_zustaende`, vier 32×32-Regionen; `fasserin_auftragsbrett`, ganzes Bild 32×48 plus vier Zettelregionen. |
| Item-Icons | 20 `fa_*`-IDs aus dem Manifest: `items/fa_<stueck>.png` und `items/32/fa_<stueck>.png`. |

Der Auftrag nennt `ITEM_ICONS`; im geprüften Stand existiert diese Konstante nicht. Die vorhandene Funktion `itemIconUrl(id)` löst die neuen 16px-Dateinamen bereits nach ID auf. Für die 32px-Variante müssen die 20 IDs beim separaten Einbau in `ICON32` ergänzt werden, damit `itemIcon32Url` sie liefert. Keine Aliase auf die rohen Beutestücke setzen. Die bestehenden Mehrteil-Rezeptbilder bleiben erhalten.

## Zustände und Animationen

- Auftragszettel: `bestellt`, `in_arbeit`, `fertig`, `misslungen`, `abgeholt`, in beiden Größen identische Reihenfolge.
- Zirkelmarken: `waage`, `kreide`, `russ`, `lichtlose`, `salz`, `schichtbund`. Die im Auftrag genannten sechs Vorlagen fehlen unter `factions/` im geprüften Stand (dort liegen nur Rostbrüder und Schleierschwestern). Deshalb eigene, benannte Wachssiegel-Motive: Waage, Kreidering, rauchender Schlot, unbeleuchtete Laterne, Salzkristalle, gekreuzte Hämmer mit Zahnrad. Keine fremden Fraktionsbilder überschrieben.
- HUD: offener Auftrag, beim nächsten Treffen fertig, Einladung mit Abholung, Oda anwesend. Oda-Anwesenheit und Abholbereitschaft getrennt darstellen: Der Gastgeber kann auch ohne Oda aushändigen.
- Posenreihen 0–4: `pruefen`, `haemmern`, `uebergabe`, `kopfschuetteln`, `abwesend`. Je sechs Frames, Blick nach unten, Grundlinie y=30. Hammern und leerer Platz laufen mit 6 fps in Schleife; übrige Posen einmal. Werkbank separat darunter platzieren. In der letzten Reihe bleibt Oda unsichtbar, Zange und Licht markieren den leeren Platz.
- Portraits: zufrieden, bedauernd, prüfend, müde.
- Werkbank: leer, eingespanntes Beutestück, fertiges Artefakt unter Glas, Scherben und Asche. Auftragsbrett-Regionen markieren vier Papierflächen; UI kann sie überlagern oder als Anker nutzen.
- Fassungseffekte: je acht Frames, 10 fps, einmal. Der Würfel hat gemeinsame Frames 0–3, danach **nur Frame 4 bei Erfolg oder nur Frame 5 bei Misserfolg**. Die Animation zeigt das bereits fest gespeicherte Ergebnis; sie würfelt nicht selbst und darf beim erneuten Öffnen keine neue Entscheidung auslösen.

Die Chancenmarke zeigt fünf Füllstände mit exakt 4, 5, 6, 7 oder 8 gefüllten Zeilen in einem zehn Pixel hohen Innenfeld. Bei Zwischenwerten 45/55/65/75 Prozent die darunterliegende Zehnerstufe als grobe Marke wählen und den **exakten Prozentwert aus CR als UI-Text daneben** anzeigen. Die Grafik allein ersetzt diese Zahl nicht.

## Artefakte

Jede der 20 festen `fa_*`-IDs zeigt das zugehörige Beutestück in Metallfassung, an Band oder Kette. Nur Kernphiole, Brutschale, Funkenlaterne und Nervenspule tragen türkise Akzente. Die fertigen 32px-Icons sind die Quelle der 16px-Versionen (Nearest Neighbor); originale Beute-Icons wurden ausschließlich gelesen.

## Erzeugung und Prüfung

`docs/art/batch-fasserin2-generation.json` dokumentiert 37 verwendete Generatorbilder mit vollständigen Prompts und Quellprüfsummen. Die fünf Posenreihen werden zu einem Sheet zusammengefügt. Pixel-Nachbearbeitung: Alpha-Schwelle, Freistellungsbereinigung, Nearest-Neighbor-Skalierung, gemeinsamer Palettenabgleich, Messing statt unzulässiger türkiser Schmucksteine, exakte Chancenfüllung und Freistellung der Rahmenmitte. Bei Effekten und Werkbank bleibt der Maßstab über die Frames gleich.

```sh
python tools/art/fasserin2/check.py
```

Ergebnis: `CQ fasserin2: PASS | 54/54 PNG | 136 frames | palette <=32 | errors=0`

Der Validator prüft die feste Dateiliste unabhängig vom Manifest, Maße, Palette, Alpha, Rasterzellen, Regionen, Animationsindices und -variation, Posenreihen, Grundlinie, Icon-Paare, Farbbeschränkung, exakte Füllstände und exklusive Würfelausgänge. Er schreibt `docs/art/batch-fasserin2-validation.json`. Die vollständige Vorschau steht in `docs/art/batch-fasserin2-preview.png`. Zusätzlich wurden UI, Posen, alle Icons und Effekte visuell im vergrößerten Zielraster geprüft. Eine Prüfung im laufenden Spiel ist erst nach dem separaten Einbau möglich.
