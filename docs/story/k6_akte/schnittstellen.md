# Benutzte externe IDs und Zuständigkeiten

## CU: Karten

`vm_zollhafen`, `vm_stegviertel`, `vm_schlickgassen`, `vm_oberstrasse`, `vm_wrackfeld`, `vm_leuchtbank`, `vm_registerkeller`, `vm_grenzzaun`.

Reiseziel `vm_zollhafen/default`. `hg_grenzbezirk` wird als CO/CP-Anschluss beschrieben, nicht als neue CT-Karte angelegt. Keine neuen Items nötig; Hinweise sind Journalbelege, keine duplizierten CU-Questgegenstände.

## CX: Sprecher

`vmn_tam_verrin`, `vmn_osric_dale`, `vmn_nell_quarrie`, `vmn_pegelherrin`, `vmn_zollschreiber`, `vmn_rat_1`, `vmn_rat_2`, `vmn_rat_3`, `vmn_rat_4`, `vmn_rat_5`, `vmn_rat_6`, `vmn_rat_7`.

CX war beim Schreiben noch nicht als Lieferordner vorhanden. CT erfindet deshalb keine Eigennamen für Rat oder Schreiber. Vorläufige Zuordnung der sieben in CX genannten Ämter in ihrer Auftragsreihenfolge: 1 Zoll, 2 Pegel, 3 Register, 4 Hafen, 5 Zunft, 6 Kirche, 7 Armenhaus. Rat 1 lügt für den Spieler; 2 und 3 erkennen ihre nichtmenschliche Veränderung nicht; 5 fordert Verbrennung. Vertrauen gilt wahlweise Rat 1 oder 4. Diese Rolle/ID-Zuordnung mit CX beim Einbau abgleichen, dessen fertige Eigennamen in Sprecherüberschriften einsetzen. Dialoge sprechen bewusst überwiegend vom Amt, damit dabei keine neue Person entsteht.

Der Schreiber antwortet schriftlich. Erwachsene siezen den Spieler; Nell duzt ihn. Das `luege: true` ist Autorenmetadatum an genau einer Antwort jedes Ratsverhörs und darf vor dem Belegvergleich keine automatische Wahrheitsanzeige sein.

## CZ: Kämpfe

`wrackmutter`, `leuchtfeuerwaechter`, `pegelherrin`, `pegelherrin_register`.

Verlangte bestätigte Resultate: `won_wrackmutter`, `won_leuchtfeuerwaechter`, `won_pegelherrin`, `won_pegelherrin_register`. Erster Harrow-Sieg führt nur in die Zwischenphase. `k6_pegelherrin_geloest` stammt aus CTs Nachkampfdialog oder dem Vorlesen; der friedliche Weg überspringt ausschließlich Phase 2. Für die Vorleseoption gelten alle vier Akt-IV-Schlüsse und Osric-Beziehung mindestens +3. Keine Zahlenwerte und keine erfundenen Boss-Phasen-IDs in CT.

CZs Menschenform `leuchtfeuerwaechter_mensch` wird nur als Auflösungsvertrag beschrieben, nicht als weiterer von CT startbarer Kampf. Der Gesamt-Sieg des Leuchtfeuerwächters muss nach Verschonen verfügbar sein. Bei Gezeitenabbruch kein Siegflag setzen.

## Weitere Anschlüsse

- CG: `kapitel5_done` und `bha_end_wahl`, `bha_end_winter`, `bha_end_verwahrt`, `bha_end_schmerzlos`; Quellkarte `bh_buegelraum` samt bestehender warmer Variante. Der Auftrag ersetzt CGs frühere Aussage über Rückreisen: Nach CT-Ankunft keine Rückfahrt.
- CU/Clock: `gezeit_ebbe`, `gezeit_flut` exklusiv; während kritischer Texte Gezeiten nicht stillschweigend mitten in eine Endbestätigung wechseln lassen.
- Koop: `koop_aktiv`; CT schreibt `k6_schliessender_p1` oder `k6_schliessender_p2`. Beteiligung beider Personen vor der Mutation in der Oberfläche bestätigen.
- Zirkel: `unverzeichnete`; Zugang `k6_unverzeichnete_zugang` und Wrackmutter-Sieg. Der Zirkel wird nicht doppelt definiert.
- DD: `k6_done`, die vier `k6_ende_*`, `k6_seq1_zugang`, `k6_seq1_spaeter`, `k6_seq1_verzicht`. Die vorhandenen Pfade und ihre Seq-1-Rituale bleiben ausschließlich dort.

## Noch nicht vorhandene Lieferungen

CU-Karten, CX-Namen/-Profile, CZ-Kampfdefinitionen und DD-Rituale fehlen als geladene K6-Pakete auf der geprüften Basis. Das sind geplante Anschlüsse; die CT-Prüfung erfindet dafür keine echten Karten, Personen oder Kampfdaten. Vor dem Einbau müssen deren tatsächliche Inhalte und die Gezeiten-/Koop-Ereignisse ergänzt und gemeinsam getestet werden.
