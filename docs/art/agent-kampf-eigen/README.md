# Eigene Kampffiguren für Gegner mit fremdem Bild

Erzeugt mit `python3 tools/art/kampf_eigen/figuren.py` und `public/sprites/manifest-kampf-eigen.json`.
Bilder: `python3 tools/art/kampf_eigen/vergleich.py docs/art/agent-kampf-eigen`. Einbau: `src/data/kampfEigen.js` (läuft zuletzt in buildContent und setzt `e.sheet`).
Test: `tests/kampf_eigen.test.js`.

- Format wie die Codex-Kampfblätter: 288×240, 48er-Zellen, 6×5.
  - Zeilen: idle 0–3, attack 6–11, special 12–17, hurt 18–20, defeated 24–27.
  - Blick nach links, Füße auf Zeile 45/46.
- Palette `manifest-halbgott.json`, gleich der Codex-Kampfpalette (`manifest-benannte.json`). Binäres Alpha, Umriss #1a1c2c.
- Ruhe und Angriff sind eigens gezeichnet. Spezial (Angriff mit voller Wirkung), Treffer (erstes Bild aufgehellt) und Niederlage entstehen aus denselben Posen.

## Suche

Ich habe für alle 896 Begegnungen die Kampfbild-Datei aufgelöst (`e.sheet` → `ENCOUNTER_SHEETS` → `ENEMY_BATTLE_SHEETS`). 185 Dateien nutzen mehrere Begegnungen.
Nicht mitgezählt habe ich Elite-Fassungen, Bossphasen, Pfadviertel-Spielarten (`__o3_`), Stadtfassungen derselben Nebelgestalt und Rivalen derselben Person auf verschiedenen Stufen.
Übrig blieben rund 30 Fälle, in denen ein anderer Gegner das Bild trägt. Davon wurden zehn gezeichnet:

| neues Blatt | Begegnung(en) | bisher | Figur |
|---|---|---|---|
| enemy_ke_thorne | kgj_bh_thorne | enemy_kgj_eisen (wie Mara Harrow) | Pelzmütze, Vollbart, Pelzkragen, Setzhammer; Funken beim Aufschlag |
| enemy_ke_dunmore | kgj_bh_dunmore | enemy_kgj_maske (wie Silas Quill) | Zylinder, „dein Gesicht“ als schief sitzende Maske mit Naht, Stilett; Nachbilder des Gesichts |
| enemy_ke_lerch | kgj_bh_lerch | enemy_kgj_laterne (wie Ilka Barlow) | Ölzeug-Cape, Krempe, Blendlaterne, Messer; schmaler Lichtkeil |
| enemy_ke_kopfgeldrotte | hkr_dunscar_trupp | enemy_kgj_eisen | Jäger mit Gewehr und Patronengurt, zweiter Jäger abgedunkelt dahinter; Mündungsfeuer, Rauch |
| enemy_ke_rostbrueder | hkr_kettlegate_trupp | enemy_schlachtergehilfe (wie Knox) | alter Rostbruder in geflickter rostroter Kutte, Enterhaken an der Kette |
| enemy_ke_gefolge | rivale_gefolge_1–4 | hg_battle_kessel (Kessel-Halbgott der Rivalen) | Leibwächter mit Melone, Weste, Schlagring; pfadneutral |
| enemy_ke_grauer_schleier | schleier_schatten | enemy_schleier_messerin (wie Fräulein Grau) | Blumenverkäuferin mit Korb, Schleier, Porzellan blitzt darunter, Messer |
| enemy_ke_aschenweberin | sg_aschenweberin | enemy_lohnlistenmotte | Motte aus Asche mit Glutaugen, Vorderbeine halten Ascheschleier; Aschewolke |
| enemy_ke_aussaatschwarm | bha_aussaat_schwarm | Blatt des Bosses Mutterwurzel (128×96) | drei offene Samenschoten mit Ranken; Samen spritzen |
| enemy_ke_registerleib_rest | cwa_registerleib_rest | Blatt des Bosses Nullfundament (128×96) | gebückter Rest aus Blattlagen und Bleilettern, Glutauge, Stempelarm; Tinte spritzt |

Die Kopfgeldjäger tragen weiter das rote Halstuch und den Steckbrief am Gürtel, damit sie als Gruppe erkennbar bleiben.

## Kein neues Bild nötig: zwei Verdrahtungsfehler

Torfmutter (`ez_torfmutter`) und Schleusenuhrmacher (`ez_schleusenuhr`) haben seit Grok GA Teil 2 eigene Kampfbilder (`ENCOUNTER_SHEETS`).
`pfadHandel.js` gab ihnen aber noch die Leihbilder Kalkbrennerin und Rangierer als `sheet` mit, und `e.sheet` hat Vorrang. Das ist jetzt korrigiert und getestet.

## Sichtprüfung

- Die ersten Fassungen habe ich verworfen:
  - Motte als dunkler Klumpen: nicht als Motte lesbar.
  - Registerleib als gestreifter Turm mit Roboterkopf.
  - Thornes Bart in Blaugrau: sah aus wie ein Tuch vor dem Mund.
  - Dunmores Maske in Blaugrau mit roten Lippen: sah aus wie ein Totenkopf.
  - Weste des Leibwächters in Rot und Weiß: sah aus wie eine Wunde.
- Überarbeitet:
  - Motte jetzt in Seitenansicht mit V-Flügeln.
  - Registerleib als Blattkapuze.
  - Bart in Braungrau.
  - Maske in hellem Hautton mit Naht und Band.
  - Hemdkragen, schwarze Krawatte, graue Weste.
- Thornes Hammer verschwand beim Ausholen oben aus dem Bild. Er hängt jetzt hinter der Schulter.
- Lerchs Laterne war zu weit vorn: Für den Lichtkeil blieb kein Platz. Sie wird jetzt näher am Körper gehalten.
- Ehrlich: Neben den Codex-Figuren wirken die Menschen einfacher, eher frontal, mit weniger Stofftextur und schlichteren Gesichtern.
  Größe, Palette, Umriss und Rasterung passen aber, und sie sind deutlich näher an den Codex-Proportionen als die Rivalen-Blätter der früheren Runde.

## Gefunden, aber nicht geändert

- Die vier Seq-4-Beyonder aus Kapitel 4 (`k4s_kg_aschmann`, `_vell`, `_dorn`, `_hollin`) kämpfen in den Halbgott-Blättern ihres Pfads, wie die Rivalen ab Seq 4.
  - Das ist die Konvention „Seq 4 = Halbgott-Gestalt“. Eine eigene Gestalt bräuchte 96er-Blätter.
  - Aschmann ist laut Text Eisen, hat aber `pathway: 'kessel'` und das Kessel-Blatt.
- „Wilder Beyonder (gemeinsame Jagd)“ `rivale_jagd_1–4` nutzt ebenfalls das Kessel-Halbgott-Blatt und übernimmt Aschmanns Einleitungstext (Textfehler in `rivale.js`, Vorlage kopiert).
- Gebietsbosse `ds_gb_*`: Die eigenen Grok-Bilder (`ENCOUNTER_SHEETS`) werden von den Umfärbungen aus Runde 9 (`skriptSheets.js`, `e.sheet`) überstimmt. Welche Fassung gelten soll, ist eine Entscheidung.
- `k3k_staubschmuggler_elite`: Ein eigenes Elitebild ist vorhanden, wird aber vom Grundbild überstimmt.
- Weiter geteilt:
  - vier Benannte auf vme-Blättern (Zollgeist mit Gesicht, Witwe auf Stelzen, Salzmann im Ölzeug, Knoten).
  - drei Schlackengruben-Gegner auf Benannten-Blättern.
  - Die Kokonspinne sieht laut Text absichtlich wie die Fadenspinne aus.

Neue Spieltexte: keine.
