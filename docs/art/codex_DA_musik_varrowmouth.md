# Codex-Paket DA: Musik für Varrowmouth, Gezeiten, Engel- und Finalstufe

**Schreibt nach:** `public/audio/musik/` (Dateien `vm_*.json`, `hg_*.json`, `finale_*.json`) und `docs/story/musik_varrowmouth/README.md`

Musik gibt es im Spiel nur als **Notendaten im Format `nebel-musik-1`** (siehe `public/audio/musik/abspann.json`, `bh_ankunft.json`, `ds_*.json`, nur lesen; Instrumente und Felder wie dort: `bpm`, `takt`, `loop`, `lautstaerke`, `hall`, `spuren` mit `instrument`, `lautstaerke`, `pan`, und die Noten je Spur). Keine Audiodateien. Du lieferst die Stücke für das Finale und die höchsten Sequenzen. Muster für Umfang und Zuordnung: `docs/art/codex_CL_musik_k4k5_feste.md` (nur lesen).

## 0. Regeln
Diese Datei ist in sich vollständig. Keinen Spielcode ändern. Nur neue Dateien unter `public/audio/musik/` und dein README. Alle Stücke validieren mit dem bestehenden Prüfskript, falls eines in `tools/` liegt (`tools/musik/pruefen.mjs` oder ähnlich; sonst eigenes `docs/story/musik_varrowmouth/pruefen.mjs`, Node ohne Pakete: Format, Tonumfang, keine leeren Spuren, Loop-Länge in ganzen Takten).

Klangbild Varrowmouth: Meer und Amt. Langsame Zweiklänge wie Gezeiten, ein tiefer Puls wie die Pegeluhr, darüber eine kurze Melodie, die nie zu Ende kommt (das Register ist nie fertig). Instrumente aus dem bestehenden Satz: `celesta`, `streicher`, `kontrabass`, `zither`, `harmonium`, `glocke`, `floete`, `klavier`, `pauke` (prüfe die tatsächlich unterstützten Namen in den vorhandenen Dateien und benutze nur diese). Ebbe und Flut unterscheiden sich pro Ort als **zwei Fassungen desselben Stücks** (gleiche Melodie, bei Flut tiefer, mehr Hall, bei Ebbe heller, trockener, ein Instrument weniger).

## 1. Varrowmouth (16 Stücke)
`vm_ankunft` (einmalig, kein Loop), `vm_zollhafen_ebbe`, `vm_zollhafen_flut`, `vm_stege_ebbe`, `vm_stege_flut`, `vm_schlick` (nur Ebbe), `vm_oberstrasse_tag`, `vm_oberstrasse_nacht`, `vm_wrackfeld`, `vm_leuchtbank_ebbe`, `vm_leuchtbank_flut`, `vm_kielraum` (Zirkel der Unverzeichneten, Zither und Harmonium), `vm_pegelrat` (Akt III), `vm_registerkeller`, `vm_gezeitenwechsel` (12-Sekunden-Überleitung, kein Loop, wird beim Wechsel eingeblendet), `vm_kampf` (normaler Kampf in der Stadt).

## 2. Bosse (4)
`vm_boss_wrackmutter` (schwer, Pauke, knarrend), `vm_boss_leuchtfeuer` (kreisend, Glocke im Dreiertakt), `vm_boss_pegelherrin_1` (Amt: streng, Kontrabass-Puls), `vm_boss_pegelherrin_2` (das Register: dieselbe Melodie in Umkehrung, die Zeilen „lesen“ sich rückwärts, dann Stille vor dem letzten Takt).

## 3. Engel und Finale (8)
`hg_grenzbezirk` (Karte des Seq-2-Rituals: fast nur Pedalton und Nebel), `hg_grenzwaechter` (Kampf), `hg_aufstieg_2` (Aufstiegs-Szene Seq 2, 20 Sekunden, kein Loop), `finale_register_<pfad>` wäre zu viel: stattdessen **ein** Stück `finale_register` für die Seq-1-Rituale mit vier Spur-Varianten, die der Einbau je Pfadgruppe ein- oder ausblendet (Spurnamen `licht`, `faden`, `stein`, `takt` im README zugeordnet: Laterne/Maske/Echo → licht, Faden/Schlüssel → faden, Eisen/Kessel/Moor → stein, Waage/Uhr → takt), `finale_aufstieg_1` (Aufstieg Seq 1, 30 Sekunden), `finale_verzicht` (Ende ohne Seq 1), `abspann_k6` (neuer Abspann, Variante von `abspann.json` mit dem Varrowmouth-Thema; der alte bleibt), `titel_k6` (Titelbild-Fassung ab Kapitel 6, Variante des bestehenden Titelstücks mit dem Pegel-Puls).

## 4. Zuordnung und Abgabe
`docs/story/musik_varrowmouth/README.md`: Tabelle Karte/Ereignis → Stück (alle `vm_*`-Karten aus den Eckdaten je Gezeit, `hg_grenzbezirk`, `vm_register_<pfad>` → `finale_register` mit Spurvariante, Enden → Abspann), Übergangsregeln (Gezeitenwechsel blendet 12 Sekunden `vm_gezeitenwechsel` ein, dann das Stück der neuen Gezeit), Lautstärke-Empfehlungen. Pull Request mit Prüf-Ausgabe und Gesamtdauer je Stück.
