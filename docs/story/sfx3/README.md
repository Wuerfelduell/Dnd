# DB · Soundeffekte 3

91 bestellte Basis-IDs, 107 Klangvarianten, 214 Dateien (OGG + MP3). Die neun Ambiente-Schleifen dauern je sechs Sekunden. Einzelklänge bleiben einschließlich Container-Padding unter vier Sekunden; `vm_flut_kommt` und `hg_aufstieg_4` dauern deshalb 3,9 statt exakt vier Sekunden. Die ungefähren Gruppenanzahlen im Auftrag sind keine Sollzahlen; die ausgeschriebenen IDs ergeben 30 + 25 + 20 + 7 + 9 = 91. `vm_kampf` ist ausschließlich ein Gruppenname und wird nicht als zusätzlicher Sound geliefert.

Eigene deterministische Synthese mit Oszillatoren und gefiltertem Rauschen, keine Aufnahmen oder Fremdsamples. Der vorhandene Entwurf aus `DB-sfx3.zip` wurde übernommen, gegen den Auftrag geprüft, um den Gruppenname-Fehleintrag bereinigt bei den neun Ambientes differenziert und bei identischen Rufvarianten korrigiert. `generate.py` benötigt Python, NumPy, SciPy und FFmpeg; der Prüfer verwendet Node-Standardmodule sowie FFmpeg/ffprobe, keine npm-Pakete. Mono, 24 kHz, OGG Vorbis q4 und MP3 LAME q4. Das Manifest entspricht der Struktur aus SFX2.

## Anschluss

Kein Spielcode geändert. Die folgende Tabelle nennt fachliche Auslöser, keine bereits vorhandenen Event-Bus-Namen. Der Einbau registriert das Manifest und verbindet diese Auslöser in `src/core/sounds.js`. Trefferklänge nur bei bestätigtem Treffer, Belohnungen nur bei erfolgreicher einmaliger Zustandsänderung. Varianten zufällig ohne unmittelbare Wiederholung; bei mehreren Varianten heißen Dateien `<id>_1` bis `<id>_N`, sonst `<id>`. OGG bevorzugen; MP3-Schleifen brauchen einen Decoder, der das Encoder-Padding entfernt.

Ambiente beim Verlassen stoppen. Hafen-Ebbe und Hafen-Flut ersetzen einander mit kurzem Crossfade; keine gleichzeitigen Vollpegel-Schleifen. Andere Bereichsloops laufen unabhängig vom Pegel weiter, sofern die Karte erreichbar bleibt. `vm_pegelglocke` enthält bereits drei Schläge und wird pro Warnung nur einmal gestartet. `fa_auftrag_fertig` bestätigt Abholbereitschaft, keinen vorweggenommenen Erfolgswurf. CQ/CR würfelt weiterhin einmal beim Abholen; Audio darf keine neue Zufallsentscheidung auslösen.

Koop: Weltklänge pro lokalem Audiomischer nur einmal abspielen, auch wenn beide Spieler denselben bestätigten Vorgang melden. Persönliche Hinweise wie Brief, Erfolg und Verdauung nur beim betroffenen Besitzer. Beim Abbruch einer Szene keine nachlaufenden Phasenklänge. Furcht besteht aus Atem und weichem Aufsetzen, nicht aus Schreien. Hall bleibt bis auf den Registerkeller zurückhaltend.

CO/CP-Klänge waren im geprüften main-Ausgangsstand nicht vorhanden. Vor dem späteren Einbau weiterhin auf doppelte IDs achten; dieser PR überschreibt keine vorhandenen Audiodateien. `ui_auktion_hammer` ist die neue DE-Oberflächen-ID, der bestehende `auktion_hammer` bleibt unverändert.

## Ereignis → ID

| Paket / Ereignis | ID | Varianten | Sekunden |
|---|---|---:|---:|
| CU/CW: hafen ebbe betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_hafen_ebbe` | 1 | 6 |
| CU/CW: hafen flut betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_hafen_flut` | 1 | 6 |
| CU/CW: stege betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_stege` | 1 | 6 |
| CU/CW: schlick betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_schlick` | 1 | 6 |
| CU/CW: oberstrasse betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_oberstrasse` | 1 | 6 |
| CU/CW: wrackfeld betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_wrackfeld` | 1 | 6 |
| CU/CW: leuchtbank betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_leuchtbank` | 1 | 6 |
| CU/CW: registerkeller betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_registerkeller` | 1 | 6 |
| CU/CW: kielraum betreten bzw. aktiven Gezeitenzustand übernehmen; Schleife starten | `vm_amb_kielraum` | 1 | 6 |
| CU: Vorwarnung vor einem Gezeitenwechsel; einmal auslösen, die Datei enthält bereits drei Schläge | `vm_pegelglocke` | 1 | 2.8 |
| CU/CW: Wechsel von Ebbe zu Flut bestätigt | `vm_flut_kommt` | 1 | 3.9 |
| CU/CW: Wechsel von Flut zu Ebbe bestätigt | `vm_ebbe_geht` | 1 | 1.4 |
| CU/CV: Fußkontakt auf Schlick | `vm_schritt_schlick` | 4 | 1.4 |
| CU/CV: Fußkontakt auf Holzsteg | `vm_schritt_steg` | 4 | 1.4 |
| CU/CV: Fußkontakt in flachem Wasser | `vm_schritt_wasser` | 3 | 1.4 |
| CU: Ruderschlag ausgeführt | `vm_boot_ruder` | 2 | 1.4 |
| CU: Boot erreicht den Anleger | `vm_boot_anlegen` | 1 | 1.4 |
| CT/CX: ziviler Zollstempel wird aufgesetzt | `vm_zollstempel` | 1 | 1.4 |
| CU: Zollschranke wird bewegt | `vm_zollschranke` | 1 | 1.4 |
| CT: Registerseite wird umgeblättert | `vm_registerseite` | 1 | 1.4 |
| CU/CW: sichtbarer Tick der Pegeluhr | `vm_pegeluhr_tick` | 1 | 1.4 |
| CU/CW: Pegeluhr erreicht eine markierte Stunde | `vm_pegeluhr_schlag` | 1 | 1.4 |
| CU/CW: Linsenrad dreht an der markierten Position vorbei | `vm_leuchtfeuer_dreh` | 1 | 1.4 |
| CU: entfernter Möwenruf am Hafen | `vm_moewen` | 2 | 1.4 |
| CV: Tau erreicht sichtbare Spannung | `vm_tau_spannt` | 1 | 1.4 |
| CV: Wrackbalken gerät unter Last | `vm_wrack_knarren` | 1 | 1.4 |
| CT/CW: okkulte Namenslinie wird sichtbar | `vm_namenslinie` | 1 | 1.4 |
| CT/CX: Nell entfernt einen Namen | `vm_nell_wischt` | 1 | 1.4 |
| CT/CX: Sitzung des Pegelrats beginnt | `vm_rat_glocke` | 1 | 2.8 |
| CU: Fähre kündigt Ankunft oder Abfahrt an | `vm_faehre_horn` | 1 | 2.8 |
| CZ: Zollgeist setzt den Angriffsstempel auf | `vme_zollgeist_stempel` | 1 | 1.4 |
| CZ: Zollgeist erhält einen Treffer | `vme_zollgeist_hit` | 1 | 1.4 |
| CZ: Zollgeist fällt besiegt zusammen | `vme_zollgeist_fall` | 1 | 1.4 |
| CZ: Gezeitenläufer löst den Wasserschwall aus | `vme_gezeitenlaeufer_schwall` | 1 | 1.4 |
| CZ: Gezeitenläufer erhält einen Treffer | `vme_gezeitenlaeufer_hit` | 1 | 1.4 |
| CZ: Gezeitenläufer fällt besiegt zusammen | `vme_gezeitenlaeufer_fall` | 1 | 1.4 |
| CZ: Salzkruste landet seinen Schlag | `vme_salzkruste_schlag` | 1 | 1.4 |
| CZ: Salzkruste bricht seine Salzkruste auf | `vme_salzkruste_bruch` | 1 | 1.4 |
| CZ: Salzkruste fällt besiegt zusammen | `vme_salzkruste_fall` | 1 | 1.4 |
| CZ: Tauwerk schwingt das Tau | `vme_tauwerk_peitsche` | 1 | 1.4 |
| CZ: Tauwerk legt eine Fessel an | `vme_tauwerk_fessel` | 1 | 1.4 |
| CZ: Tauwerk fällt besiegt zusammen | `vme_tauwerk_fall` | 1 | 1.4 |
| CZ: Hafenkrähen startet den Schwarmangriff | `vme_hafenkraehe_schwarm` | 1 | 1.4 |
| CZ: Hafenkrähen stiehlt einen Vorrat | `vme_hafenkraehe_stehlen` | 1 | 1.4 |
| CZ: Hafenkrähen fliegt aus dem Kampf | `vme_hafenkraehe_flucht` | 1 | 1.4 |
| CZ: Pegelknecht schwingt den Haken | `vme_pegelknecht_haken` | 1 | 1.4 |
| CZ: Pegelknecht erhält einen Treffer | `vme_pegelknecht_hit` | 1 | 1.4 |
| CZ: Pegelknecht wird nach dem Fall des Partners stärker | `vme_pegelknecht_verstaerkt` | 1 | 1.4 |
| CZ: Wrackmutter öffnet den Rumpf | `wrackmutter_oeffnen` | 1 | 1.4 |
| CZ: Wrackmutter ruft Tauwerk herbei | `wrackmutter_ruf` | 1 | 1.4 |
| CZ: Leuchtfeuerwächter setzt den Lichtkegel frei | `leuchtfeuer_kegel` | 1 | 1.4 |
| CZ: Leuchtfeuerwächter zerspringt in der Phasenüberleitung | `leuchtfeuer_zerspringt` | 1 | 1.4 |
| CZ: Pegelherrin trägt eine Fähigkeit ins Register ein | `pegelherrin_eintragen` | 1 | 1.4 |
| CZ: Pegelherrin wechselt in Phase 2 | `pegelherrin_phase2` | 1 | 2.8 |
| CZ: Pegelherrin beendet ihren Kampf | `pegelherrin_ende` | 1 | 1.4 |
| CO/CP: Sequenz-4-Trank wird getrunken | `hg_trank_4` | 1 | 1.4 |
| CO/CP: Sequenz-2-Trank wird getrunken | `hg_trank_2` | 1 | 1.4 |
| CO/CP: Aufstieg zu Sequenz 4 beginnt | `hg_aufstieg_4` | 1 | 3.9 |
| CO/CP: Aufstieg zu Sequenz 2 beginnt | `hg_aufstieg_2` | 1 | 2.8 |
| CO/CP: Kreaturform wird aktiv | `hg_form_an` | 1 | 1.4 |
| CO/CP: Kreaturform endet | `hg_form_aus` | 1 | 1.4 |
| CO: Fußkontakt in Kreaturform | `hg_form_schritt` | 2 | 1.4 |
| CP: Figur sinkt durch Furcht bewusstlos zu Boden | `hg_furcht_ohnmacht` | 1 | 1.4 |
| CP: Figur hält vor Furcht den Atem an | `hg_furcht_zoegern` | 1 | 1.4 |
| CP: Ritual startet nach bestätigter Wahl | `hg_ritual_beginn` | 1 | 1.4 |
| CP: Ritualsiegel rastet ein | `hg_ritual_siegel` | 1 | 1.4 |
| CO/CP: Schwellenwächter formt sich aus Kalk | `hg_schwellenwaechter_kalk` | 1 | 1.4 |
| CO/CP: Schlag des Schwellenwächters setzt auf | `hg_schwellenwaechter_schlag` | 1 | 1.4 |
| CO/CP: Schwellenwächter zerfällt | `hg_schwellenwaechter_zerfall` | 1 | 1.4 |
| CO/CP: Grenzwächter tritt aus dem Nebel | `hg_grenzwaechter_nebel` | 1 | 1.4 |
| CO/CP: Grenzwächter erhält einen festen Umriss | `hg_grenzwaechter_umriss` | 1 | 1.4 |
| CO/CP: Schlag des Grenzwächters setzt auf | `hg_grenzwaechter_schlag` | 1 | 1.4 |
| CO/CP: Grenzwächter-Begegnung endet | `hg_grenzwaechter_ende` | 1 | 1.4 |
| CP: Verdauungsschwelle 50 erstmals erreicht; Form verfügbar | `hg_verdauung_50` | 1 | 1.4 |
| CO: wortlose Lautäußerung der Kreaturform | `hg_kreatur_stimme` | 3 | 1.4 |
| CQ/CR: Auftrag samt Stück und Lohn verbindlich angenommen | `fa_auftrag_bestellt` | 1 | 1.4 |
| CQ/CR: fertiger Auftrag wird erstmals als abholbereit angezeigt; kein erneutes Spielen bei Menüwechsel | `fa_auftrag_fertig` | 1 | 1.4 |
| CQ/CR: dauerhaft gespeichertes Misserfolgsergebnis erstmals aufgedeckt | `fa_auftrag_misslungen` | 1 | 1.4 |
| CQ/CR: sichtbare Ergebniswurf-Animation; nicht erneut würfeln | `fa_wuerfel` | 1 | 1.4 |
| CQ: Hammer trifft in Odas Arbeitsanimation auf die Werkbank | `fa_hammer` | 3 | 1.4 |
| CQ/CR: Artefakt dem Besitzer übergeben | `fa_uebergabe` | 1 | 1.4 |
| CQ/CR: halber Lohn einmalig zurückgezahlt | `fa_lohn_zurueck` | 1 | 1.4 |
| DL: neuer Erfolg erstmals freigeschaltet | `ui_erfolg` | 1 | 1.4 |
| DI: neuer Brief eingetroffen | `ui_brief_an` | 1 | 1.4 |
| DI: Brief zum Lesen geöffnet | `ui_brief_oeffnen` | 1 | 1.4 |
| DG: Haustür passiert | `ui_haus_tuer` | 1 | 1.4 |
| DF: Spieler ruft sein Tier; zwei wortlose Rufvarianten, kein tierartspezifischer Dialog | `ui_tier_ruf` | 2 | 1.4 |
| DE: Zuschlag einer Auktion verbindlich erfolgt | `ui_auktion_hammer` | 1 | 1.4 |
| DH: Eintritt in die Nebelseite abgeschlossen | `ui_nebelseite_an` | 1 | 1.4 |
| DH: Rückkehr aus der Nebelseite abgeschlossen | `ui_nebelseite_aus` | 1 | 1.4 |
| CT: Kapitel-6-Titel erscheint | `ui_kapitel6` | 1 | 2.8 |

## Prüfen und reproduzieren

`node docs/story/sfx3/verify.cjs` prüft vollständige Soll-IDs, Varianten, Dateiformate, Samplerate, Dauer, Pegel, Nicht-Stille, unterschiedliche Varianten, Hashes und beide Loop-Nähte. `validation.txt` enthält die Ausgabe des vollständigen Decodierlaufs. Das ist eine technische Prüfung, kein Hörtest im späteren Spielmix.

`python docs/story/sfx3/generate.py` erzeugt die Dateien aus `catalog.json`. Bereits vorhandene Ausgabedateien führen absichtlich zum Abbruch; für eine Reproduktion einen separaten Checkout mit leerem DB-Ausgabebestand verwenden. Der Generator verändert weder Spielcode noch diese Dokumentation.

Der Generator aktualisiert nach erfolgreicher Erzeugung die Datei-Hashes. Die Synthese ist auf PCM-Ebene deterministisch; Container-Bytes können zwischen FFmpeg-Versionen abweichen. `--ambience-only` erneuert ausschließlich die neun Loops, sofern deren Ausgabedateien vorher in einem separaten Arbeitsstand entfernt wurden.
