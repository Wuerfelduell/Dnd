# Codex-Paket DB: Soundeffekte 3 (Varrowmouth, Gezeiten, Halbgott bis Engel, Fasserin-Aufträge, Nachzügler)

**Schreibt nach:** `public/audio/sfx/` und `public/audio/manifest-sfx3.json`, Doku nach `docs/story/sfx3/README.md`

Dritte Runde Soundeffekte nach Y und CM (siehe `public/audio/manifest-sfx2.json`, nur lesen: Felder `group`, `volume`, `duration`, `note`; Formate ogg und mp3; jede Datei unter 4 Sekunden, Ambiente-Schleifen bis 8 Sekunden nahtlos). Erzeuge die Klänge synthetisch oder aus freien, eigenen Aufnahmen; keine Dateien mit fremden Rechten. Keinen Spielcode ändern; die Zuordnung zu Ereignissen steht im README, der Einbau trägt sie in `src/core/sounds.js` ein.

## 0. Regeln
Diese Datei ist in sich vollständig. IDs klein, mit Präfix der Gruppe. Lautstärken zwischen 0,2 und 0,7 (Ambiente 0,15 bis 0,35). Klangbild: trocken, nah, wenig Hall außer unter Wasser und im Registerkeller. Nichts Blutiges, keine Schreie; Furcht ist Atem und Stille.

## 1. Gruppe `varrowmouth` (ca. 34)
Ambiente-Schleifen: `vm_amb_hafen_ebbe`, `vm_amb_hafen_flut`, `vm_amb_stege`, `vm_amb_schlick` (Blubbern, Möwen fern), `vm_amb_oberstrasse`, `vm_amb_wrackfeld` (Knarren, Tropfen), `vm_amb_leuchtbank` (Wind, Glocke sehr fern), `vm_amb_registerkeller` (Tropfen, Papier), `vm_amb_kielraum`. Einzelklänge: `vm_pegelglocke` (Warnung vor dem Wechsel, dreimal), `vm_flut_kommt` (4 Sekunden Rauschen anschwellend), `vm_ebbe_geht` (ablaufendes Wasser), `vm_schritt_schlick` (4 Varianten), `vm_schritt_steg` (4), `vm_schritt_wasser` (3), `vm_boot_ruder` (2), `vm_boot_anlegen`, `vm_zollstempel`, `vm_zollschranke`, `vm_registerseite` (Papier, Tinte), `vm_pegeluhr_tick`, `vm_pegeluhr_schlag`, `vm_leuchtfeuer_dreh`, `vm_moewen` (2), `vm_tau_spannt`, `vm_wrack_knarren`, `vm_namenslinie` (türkiser Ton, kurz), `vm_nell_wischt` (Name verschwindet), `vm_rat_glocke` (Pegelrat tagt), `vm_faehre_horn`.

## 2. Gruppe `vm_kampf` (ca. 22)
Je Gegner Angriff, Treffer, Fall: `vme_zollgeist_stempel`, `vme_zollgeist_hit`, `vme_zollgeist_fall`, `vme_gezeitenlaeufer_schwall`, `_hit`, `_fall`, `vme_salzkruste_schlag`, `_bruch`, `_fall`, `vme_tauwerk_peitsche`, `_fessel`, `_fall`, `vme_hafenkraehe_schwarm`, `_stehlen`, `_flucht`, `vme_pegelknecht_haken`, `_hit`, `_verstaerkt`; Bosse: `wrackmutter_oeffnen`, `wrackmutter_ruf`, `leuchtfeuer_kegel`, `leuchtfeuer_zerspringt`, `pegelherrin_eintragen`, `pegelherrin_phase2`, `pegelherrin_ende`.

## 3. Gruppe `halbgott` (ca. 20; zu den Paketen CO/CP, falls dort nicht geliefert)
`hg_trank_4`, `hg_trank_2`, `hg_aufstieg_4` (4 Sekunden Aufbau), `hg_aufstieg_2`, `hg_form_an`, `hg_form_aus`, `hg_form_schritt` (schwer, 2 Varianten), `hg_furcht_ohnmacht` (Körper fällt, weich), `hg_furcht_zoegern` (Atem anhalten), `hg_ritual_beginn`, `hg_ritual_siegel`, `hg_schwellenwaechter_kalk`, `_schlag`, `_zerfall`, `hg_grenzwaechter_nebel`, `_umriss`, `_schlag`, `_ende`, `hg_verdauung_50` (Hinweis: Form verfügbar), `hg_kreatur_stimme` (unmenschlich, ohne Worte, 3 Varianten).

## 4. Gruppe `fasserin2` (8; zu CQ/CR)
`fa_auftrag_bestellt`, `fa_auftrag_fertig`, `fa_auftrag_misslungen` (Scherben, leise), `fa_wuerfel`, `fa_hammer` (3), `fa_uebergabe`, `fa_lohn_zurueck`.

## 5. Gruppe `oberflaeche3` (10)
`ui_erfolg` (für Paket DL), `ui_brief_an` (Paket DI), `ui_brief_oeffnen`, `ui_haus_tuer` (Paket DG), `ui_tier_ruf` (Paket DF, 2), `ui_auktion_hammer` (Paket DE), `ui_nebelseite_an`, `ui_nebelseite_aus` (Paket DH), `ui_kapitel6`.

## 6. Abgabe
Dateien, `manifest-sfx3.json`, `docs/story/sfx3/README.md` mit Zuordnung Ereignis → ID (für alle oben genannten Pakete, auch wenn sie noch nicht eingebaut sind), Prüfskript (Node ohne Pakete: jede ID hat ogg und mp3, Dauer unter der Grenze, keine Stille-Dateien), Pull Request mit Prüf-Ausgabe.
