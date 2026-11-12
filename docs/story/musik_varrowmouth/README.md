# DA – Varrowmouth, Engel und Finale

28 neue Partituren in `public/audio/musik/`, Format `nebel-musik-1`. Kein Spielcode, keine Audiodateien. Die Registrierung beim Einbau ergänzen; die beiden ausdrücklich angeforderten Ausnahmen vom Präfixschema heißen `abspann_k6` und `titel_k6`.

## Karten und Gezeiten

| Karte | Ebbe | Flut |
|---|---|---|
| vm_zollhafen | vm_zollhafen_ebbe | vm_zollhafen_flut |
| vm_stegviertel | vm_stege_ebbe | vm_stege_flut |
| vm_schlickgassen | vm_schlick | geschlossen; Musik der tatsächlichen Zielkarte |
| vm_oberstrasse | vm_oberstrasse_tag / vm_oberstrasse_nacht | gleich, abhängig von Tageszeit |
| vm_wrackfeld | vm_wrackfeld | geschlossen; nach Evakuierung Zielkartenmusik |
| vm_leuchtbank | vm_leuchtbank_ebbe | vm_leuchtbank_flut |
| vm_registerkeller | vm_registerkeller | geschlossen; nach Evakuierung Zielkartenmusik |
| vm_grenzzaun | hg_grenzbezirk | hg_grenzbezirk |
| hg_grenzbezirk | hg_grenzbezirk | hg_grenzbezirk |

## Rituale: ein Stück, vier alternativ aktive Spuren

Alle Registerkarten verwenden `finale_register`. Spur `pegel` bleibt aktiv, genau eine der vier Varianten wird hörbar. Die übrigen Varianten beim Einbau stummschalten; die Datei selbst enthält alle vier. Keine neue Laufzeitfunktion in diesem Paket.

| Karten | Aktive Variante |
|---|---|
| vm_register_laterne, vm_register_maske, vm_register_echo | licht |
| vm_register_faden, vm_register_schluessel | faden |
| vm_register_eisen, vm_register_kessel, vm_register_moor | stein |
| vm_register_waage, vm_register_uhr | takt |

## Ereignisse

| Auslöser | Stück |
|---|---|
| erste Ankunft / k6_arrived | vm_ankunft, danach Zollhafen nach Gezeit |
| Unverzeichnete im Kielraum | vm_kielraum |
| Pegelrat, Akt III | vm_pegelrat |
| Gezeitenwechsel | vm_gezeitenwechsel |
| normaler Stadtkampf | vm_kampf |
| wrackmutter | vm_boss_wrackmutter |
| leuchtfeuerwaechter | vm_boss_leuchtfeuer |
| pegelherrin Phase 1 / Phase 2 | vm_boss_pegelherrin_1 / vm_boss_pegelherrin_2 |
| Grenzwächterkampf | hg_grenzwaechter |
| Aufstieg Seq 2 | hg_aufstieg_2 |
| Aufstieg Seq 1, auch beide Koop-Epiloge | finale_aufstieg_1 → abspann_k6 |
| bewusster Verzicht, auch Koop | finale_verzicht → abspann_k6 |
| Titel ab Kapitel 6 | titel_k6 |

## Arrangement und Übergänge

Varrowmouth-Motiv: D–A–F–E, Antwort D–G–F–A, jeweils mit ausgesparter Schlusszeit. Zweiklänge und tiefer Pegelpuls tragen die offene Phrase. Ebbe/Flut besitzen identische Melodierhythmen, Flut eine Oktave tiefer, Hall 0,55 statt 0,28, zusätzlich Harmonium. Kielraum verwendet Zither und Harmonium, Leuchtfeuer einen kreisenden Dreiertakt. Wrackmutter verbindet tiefe Streicher-Zweiklänge mit ungleich gewichteter Pauke.

Pegelherrin 2 spiegelt die acht Motivtöne um D4 und kehrt ihre Reihenfolge um. Im vorletzten Takt von C pausieren alle Spuren; für echte Stille einschließlich Hall den Effekt-Return dort ausblenden und zum letzten Takt wieder öffnen. Keine bloße Stummschaltung der Melodie. Grenzbezirk bleibt nahezu ausschließlich D-Pedal und leisem A-Nebel vorbehalten.

Abspann und Titel übernehmen die bestehenden Originalpartituren unverändert als Grundlage und ergänzen Varrowmouth-Motiv und Pegelpuls. Alte Dateien bleiben erhalten.

Gezeiten: Ortsmusik in 0,5 s ausblenden; `vm_gezeitenwechsel` einmal von Anfang an 12 s spielen, dann neue Gezeitenfassung starten. Keine gleichzeitigen Doppelstarts bei Kartenwechsel: zuletzt gültige Zielkarte entscheidet. Geschlossene Karten erst verlassen, dann deren Zielmusik wählen. Boss und Aufstieg haben Vorrang; Gezeitenzustand merken und Ortsmusik nach der Szene aktualisieren. Paarwechsel nicht über beide Melodien gleichzeitig blenden.

Schleifen haben ein einmaliges Intro (`loop_ab: 1`) und A/B/C; danach wieder A. Szenen, Verzicht und Abspann laufen einmalig. Transportlängen sind ohne Hallnachlauf angegeben: für exakt 12/20/30 s Szene den Ausgang in den letzten 0,5 s ausblenden und am Ende stoppen.

Lautstärke: neue Ortsstücke Master 0,58, unter Dialog zusätzlich auf 60 % absenken; Kampf optional Faktor 1,1. Register nur Pegel plus gewählte Variante spielen. Titel/Abspann behalten Master 0,72, bei Bedarf Faktor 0,8. Track-Gains sind absichtlich zurückhaltend.

## Prüfung und Dauer

Bestehender Prüfer: `node tools/audio/musik/pruefen.mjs`. Er ignoriert Dateiparameter und prüft auch vollständige Manifestregistrierung. Zum Prüfen wurde ausschließlich temporär `public/audio/manifest-musik-da-test.json` mit allen 28 IDs angelegt und danach entfernt. Dieses Manifest ist kein Lieferbestandteil. Ohne spätere Registrierung meldet der globale Prüfer erwartungsgemäß „Unregistered score abspann_k6“; die Notendaten werden zuvor vollständig kompiliert.

Prüfausgabe mit temporärer Registrierung:

```text
SELFTEST: 24 checks passed (parser, ties, errors, sections, transposition, scheduler, pause/resume, crossfade, stale loads).
abspann_k6: 4/4 · 72 BPM · intro 0.00 s + piece 150.00 s · total 150.00 s · 3685 bytes
finale_aufstieg_1: 4/4 · 64 BPM · intro 0.00 s + piece 30.00 s · total 30.00 s · 1401 bytes
finale_register: 4/4 · 60 BPM · intro 4.00 s + loop 96.00 s · total 100.00 s · 5362 bytes
finale_verzicht: 4/4 · 64 BPM · intro 0.00 s + piece 60.00 s · total 60.00 s · 1908 bytes
hg_aufstieg_2: 4/4 · 72 BPM · intro 0.00 s + piece 20.00 s · total 20.00 s · 1268 bytes
hg_grenzbezirk: 4/4 · 48 BPM · intro 5.00 s + loop 120.00 s · total 125.00 s · 2767 bytes
hg_grenzwaechter: 4/4 · 112 BPM · intro 2.14 s + loop 51.43 s · total 53.57 s · 4611 bytes
titel_k6: 4/4 · 72 BPM · intro 6.67 s + loop 93.33 s · total 100.00 s · 2486 bytes
vm_ankunft: 4/4 · 72 BPM · intro 0.00 s + piece 53.33 s · total 53.33 s · 1899 bytes
vm_boss_leuchtfeuer: 3/4 · 90 BPM · intro 2.00 s + loop 48.00 s · total 50.00 s · 4139 bytes
vm_boss_pegelherrin_1: 4/4 · 104 BPM · intro 2.31 s + loop 55.38 s · total 57.69 s · 4621 bytes
vm_boss_pegelherrin_2: 4/4 · 104 BPM · intro 2.31 s + loop 55.38 s · total 57.69 s · 4561 bytes
vm_boss_wrackmutter: 4/4 · 96 BPM · intro 2.50 s + loop 60.00 s · total 62.50 s · 4616 bytes
vm_gezeitenwechsel: 4/4 · 80 BPM · intro 0.00 s + piece 12.00 s · total 12.00 s · 1150 bytes
vm_kampf: 4/4 · 120 BPM · intro 2.00 s + loop 48.00 s · total 50.00 s · 4595 bytes
vm_kielraum: 4/4 · 64 BPM · intro 3.75 s + loop 90.00 s · total 93.75 s · 3484 bytes
vm_leuchtbank_ebbe: 4/4 · 60 BPM · intro 4.00 s + loop 96.00 s · total 100.00 s · 3498 bytes
vm_leuchtbank_flut: 4/4 · 60 BPM · intro 4.00 s + loop 96.00 s · total 100.00 s · 4447 bytes
vm_oberstrasse_nacht: 4/4 · 60 BPM · intro 4.00 s + loop 96.00 s · total 100.00 s · 3503 bytes
vm_oberstrasse_tag: 4/4 · 80 BPM · intro 3.00 s + loop 72.00 s · total 75.00 s · 3499 bytes
vm_pegelrat: 4/4 · 72 BPM · intro 3.33 s + loop 80.00 s · total 83.33 s · 3487 bytes
vm_registerkeller: 4/4 · 52 BPM · intro 4.62 s + loop 110.77 s · total 115.38 s · 3497 bytes
vm_schlick: 4/4 · 56 BPM · intro 4.29 s + loop 102.86 s · total 107.14 s · 3482 bytes
vm_stege_ebbe: 4/4 · 72 BPM · intro 3.33 s + loop 80.00 s · total 83.33 s · 3488 bytes
vm_stege_flut: 4/4 · 72 BPM · intro 3.33 s + loop 80.00 s · total 83.33 s · 4437 bytes
vm_wrackfeld: 4/4 · 60 BPM · intro 4.00 s + loop 96.00 s · total 100.00 s · 3489 bytes
vm_zollhafen_ebbe: 4/4 · 64 BPM · intro 3.75 s + loop 90.00 s · total 93.75 s · 3497 bytes
vm_zollhafen_flut: 4/4 · 64 BPM · intro 3.75 s + loop 90.00 s · total 93.75 s · 4446 bytes
PASS: 113 pieces, 30 instruments, 8 manifests, 442232 JSON bytes; all files <= 60 KB.
```

Gesamtdauer bezeichnet einen vollständigen ersten Durchlauf einschließlich Intro; Loop-Dauer ist separat angegeben. Alle Tonhöhen werden durch den bestehenden Compiler auf MIDI 0–127 geprüft, jede Musterdauer auf vollständige Takte. Keine leeren Spuren; bewusste Pausentakte sind Teil der Komposition. Eine Hörprobe im Spiel steht noch aus.
