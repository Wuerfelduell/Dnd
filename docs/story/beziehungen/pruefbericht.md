# AZ · Prüfbericht und Zuordnungsbegründungen

Geprüfter Ausgangsstand: `798fda8df2eb6d63b98629dbed6fbf2b7db87041`. Der PR enthält ausschließlich `docs/story/beziehungen/`; Spielcode, Testdateien und die produktive Basisdatei bleiben unverändert.

## Ergebnisse

| Prüfung | Ergebnis |
|---|---|
| JSON, Regeln, fünf Beispiele | bestanden; Regeln strukturgleich, Beispiele unverändert |
| Profile | 47; alle Pflicht-IDs, je zwei erlaubte Arten und zwei verschenkbare Gegenstände |
| Begrüßungen | 94 individuelle, jeweils höchstens zwei Sätze; 12 + 12 allgemeine; keine doppelten Profilbegrüßungen |
| Knoten | 104 existierende Schlüssel; 99 neue Optionsziele, fünf vorgegebene Beispiele |
| Aufträge | 25 existierende Aufträge, je +1 beim Abschluss |
| Vertrauensfiguren | keine neuen relation-Effekte auf Zunder, Pfiff oder Einzelgänger |
| Zusätze | 20 Dialoge, 40 Zweige, 60 kollisionsfreie bz_-Knoten, 27 eindeutige Einmal-Flags |
| Integration | reale applyQuestPack-/applyRelations-Funktionen erfolgreich; alte Optionen und Fallwirkungen erhalten |
| Laufzeit | 60 Pfade bestanden: jede Figur freundlich sowie feindselig mit −2 und −5 |
| Einmaligkeit | alle 20 Ausgleiche und sieben Geschenke nach Verwendung und nach Speichern/Laden gesperrt |
| Kosten | ohne Item/ausreichend Geld gesperrt; exakt ein Item bzw. der angezeigte Betrag abgezogen |
| Auftragsabschluss | alle 25 Boni einmalig, kein zweiter Bonus bei erneutem Abschluss |
| Eigene Begrüßungen | alle 47 Profile durch GameState geprüft, einschließlich Holt |

Die ergänzende Prüfung lädt den echten Inhalt über `tests/helpers.js`, hängt die Zusätze mit `applyQuestPack` an und setzt die Beziehungen mit `applyRelations`. Je Figur wird ein frischer `GameState` verwendet; der Ausgleich wird mit `applyEffects` und dem tatsächlichen Knotenschlüssel angewendet, anschließend mit `visitNode` vermerkt und über `serialize`/`load` erneut geprüft. Item- und Geldpfade werden zuerst ohne ausreichende Mittel geprüft. Die Prüfung verändert keine Quelldatei.

## Vorgeschriebener Bestandstest

`node --test tests/beziehungen.test.js` wurde nach lokalem Kopieren der gelieferten Beziehungen auf die Basisdatei ausgeführt. Die Originalbytes wurden anschließend wiederhergestellt, auch für den Fehlerfall abgesichert.

```text
Tests: 14
Bestanden: 13
Fehlgeschlagen: 1
Ereignisse melden Wechsel der Stimmung; Begrüßung nur außerhalb von neutral
assert.ok(content.relations.allgemein.freundlich.includes(s.greeting('holt')))
```

Diese Assertion setzt das alte Gerüst ohne Holts eigenes Begrüßungsprofil voraus. Die Engine wählt korrekt seinen individuellen Satz. Diesen Satz zugleich in die allgemeinen Begrüßungen zu kopieren wäre falsch, weil dadurch andere Figuren von Holts Wachschicht sprechen könnten. Der Test wurde nicht geändert und das Ergebnis nicht als vollständig grün gewertet. Nach Wiederherstellung der Basisdatei wurde derselbe Befehl erneut ausgeführt: **14 bestanden, 0 fehlgeschlagen**. Beim späteren Einbau muss die oben genannte Assertion angepasst werden.

## Zusatzzweige im Überblick

| Figur | Freundlich | Wiedergutmachung (einmalig +1) |
|---|---|---|
| `marlowe` | Spoilerfreier Tipp | Entschuldigung |
| `holt` | Geschenk: `verband` | 1 × `verband` |
| `pimm` | Spoilerfreier Tipp | 20 Schilling |
| `greta` | Geschenk: `riechsalz` | Entschuldigung |
| `quill` | Spoilerfreier Tipp | 1 × `taschentuch` |
| `kit` | Geschenk: `taschentuch` | 20 Schilling |
| `ivy` | Spoilerfreier Tipp | Entschuldigung |
| `maud` | Spoilerfreier Tipp | 1 × `tonikum` |
| `nell` | Bestehender Nachlass | 20 Schilling |
| `gorse` | Bestehender Nachlass | Entschuldigung |
| `druce` | Geschenk: `verband` | 1 × `lampenoel` |
| `sedge` | Spoilerfreier Tipp | 20 Schilling |
| `hale` | Spoilerfreier Tipp | Entschuldigung |
| `brack` | Geschenk: `verband` | 1 × `verband` |
| `hesper` | Geschenk: `ruhetee` | 30 Schilling |
| `k3_oren` | Spoilerfreier Tipp | Entschuldigung |
| `k3_mabel` | Geschenk: `ruhetee` | 1 × `ruhetee` |
| `k3_nellie` | Spoilerfreier Tipp | 20 Schilling |
| `k3_huxford` | Spoilerfreier Tipp | Entschuldigung |
| `k3_esther` | Spoilerfreier Tipp | 1 × `taschentuch` |

## Knotenwirkungen

Es werden Beziehungen der betroffenen Person verändert; das muss nicht die sprechende Person sein. Negative Werte drücken persönlichen Groll aus, kein moralisches Urteil über eine rechtmäßige Verhaftung. Ein Bericht über Rook darf also Rook verstimmen, ohne das Ermittlungsziel zu ändern.

| Dialog/Knoten | Wirkung | Begründung |
|---|---|---|
| `holt/holt_clear` | `holt` +1 | Unverändertes Pflichtbeispiel aus der Basisdatei |
| `greta/watch_dead` | `greta` +1 | Unverändertes Pflichtbeispiel aus der Basisdatei |
| `ivy/after_bad` | `ivy` -1 | Unverändertes Pflichtbeispiel aus der Basisdatei |
| `marlowe/report_bad` | `marlowe` -1 | Unverändertes Pflichtbeispiel aus der Basisdatei |
| `kit/bluff` | `kit` -1 | Unverändertes Pflichtbeispiel aus der Basisdatei |
| `marlowe/end_runaway` | `ivy` -1 | Hesters Verschwinden als Weglaufen abtun |
| `marlowe/end_anselm` | `marlowe` -1 | Anselm ohne tragfähigen Nachweis beschuldigen |
| `marlowe/end_good` | `hester` +2 | Hesters Rettung mit gesicherten Befunden veranlassen |
| `marlowe/end_perfect` | `hester` +2 | Hester retten und das Ritual unterbrechen |
| `marlowe/end_holt` | `holt` -2 | Holt fälschlich als Maulwurf anschwärzen |
| `marlowe/raid` | `rook` -1 | Rooks Beteiligung mit Belegen melden |
| `marlowe/barnaby` | `barnaby` +2 | Barnabys Freilassung durchsetzen |
| `marlowe/end_pell` | `marlowe` -1 | Den falschen Maskenmacher belasten |
| `marlowe/early4_go` | `marlowe` -1 | Zugriff ohne Kenntnis des Stimmenverstecks verlangen |
| `marlowe/showdown4` | `marlowe` +1 | Täter und Ort belegen statt vorschnell verhaften |
| `marlowe/end_rust` | `marlowe` -1 | Die Rostbrüder statt der belegten Täterin beschuldigen |
| `marlowe/early5_go` | `marlowe` -1 | Eine unvollständig vorbereitete Razzia veranlassen |
| `marlowe/showdown5` | `marlowe` +1 | Die gesicherte Spur zur Glocke vorlegen |
| `marlowe/end_seer` | `marlowe` -1 | Orsolya zu Unrecht beschuldigen |
| `marlowe/early6_go` | `marlowe` -1 | Verhaftung ohne Rettungsweg für die Schatten verlangen |
| `marlowe/showdown6` | `mews` -1 | Mews mit gesicherten Belegen stellen lassen |
| `marlowe/end_heir` | `marlowe` -1 | Edmund Thorne ohne richtigen Tatnachweis beschuldigen |
| `marlowe/end_piper` | `marlowe` -1 | Den Rattenfänger zu Unrecht belasten |
| `marlowe/early78_go` | `marlowe` -1 | Vorzeitigen Zugriff ohne Aufenthaltsort der Kinder wählen |
| `marlowe/showdown78` | `marlowe` +1 | Beide Fälle mit überprüften Quellen verbinden |
| `holt/barnaby` | `barnaby` +2 | Seine belegte Unschuld gegenüber dem Wachhabenden vertreten |
| `holt/grimes` | `greta` +1 | Gretas Erpresser mit Belegen melden |
| `holt/koop_reaktion_holt_ruhig` | `holt` +1 | Gegenseitige Verantwortung statt Selbstüberschätzung zusagen |
| `pimm/rats_done` | `pimm` +1 | Die Gefahr für das Archiv beseitigen |
| `pimm/hymnal_back` | `pimm` +1 | Das Buch wie versprochen ungeöffnet zurückbringen |
| `pimm/hymnal_back_read` | `pimm` -1 | Pimms ausdrückliche Warnung missachten |
| `pimm/koop_reaktion_pimm_ruhig` | `pimm` +1 | Die Rückgabe ausgeliehener Unterlagen zusichern |
| `greta/thanks` | `greta` +1 | Ihre gestohlene Kasse zurückholen |
| `greta/hound_done` | `greta` +1 | Die nächtliche Bedrohung beseitigen |
| `greta/watch_alive` | `greta` +1 | Die Rückgabe der Familienuhr an Elias zusagen |
| `greta/stall_thanks` | `greta` +1 | Einen Stand ohne Schutzgelderpressung ermöglichen |
| `quill/reward` | `quill` +1 | Die Gefahr in seiner Auslage beseitigen |
| `quill/koop_reaktion_quill_frage` | `quill` +1 | Seine Sicherheitsgrenze an der Vitrine respektieren |
| `kit/arrest` | `kit` -1 | Kit der Wache übergeben |
| `kit/mercy` | `kit` +1 | Rückgabe statt Haft ermöglichen |
| `pip/vey` | `marlowe` -1 | Die laufende Verfolgung öffentlich verraten |
| `pip/hound` | `pip` +1 | Eine überprüfbare Schlagzeile für seinen Lohn liefern |
| `ivy/returned` | `ivy` +1 | Das vermisste Familienmedaillon zurückgeben |
| `price/end_good` | `greta` +2 | Elias lebend finden und Hilfe schicken |
| `price/end_drowned` | `greta` -1 | Den verschwundenen Bruder unbegründet für ertrunken erklären |
| `vey/accuse` | `miriam` -1 | Miriam wegen ihrer Opfer konfrontieren |
| `vey/bell` | `miriam` -1 | Ihr ausdrücklich die Glocke verweigern |
| `starling/return` | `astronom` +1 | Gestohlenes Sternglas zurückbringen |
| `lichtmann/zeuge` | `lichtmann` +1 | Ihm eine Rolle als lebender Zeuge zugestehen |
| `maud/told` | `maud` +1 | Den wirklichen Betrüger belegen |
| `maud/accuse` | `maud` -1 | Ihre falsche Anschuldigung bestätigen und den Betrug fortbestehen lassen |
| `ned/help` | `ned` +1 | Die verletzten Hände versorgen |
| `wick/back` | `wick` +1 | Seine Laternenrunde übernehmen |
| `druce/tor7_ende` | `druce` +2 | Das siebte Tor schließen und seine jahrzehntelange Arbeit entlasten |
| `druce/k2n_schleuse_melden` | `druce` -1 | Seinen Schmuggel schriftlich melden |
| `druce/k2n_schleuse_decken` | `druce` +1 | Den Versorgungsweg ohne eigenen Anteil schützen |
| `druce/k2n_liste_druce_maske` | `druce` +1 | Zunders verschlossenen Brief unauffällig zustellen |
| `druce/k2n_liste_druce_bote` | `druce` +1 | Für sichere Zustellung selbst einen Boten bezahlen |
| `druce/k2n_liste_druce_wegfrei` | `druce` +1 | Für seinen Brief den beschwerlichen Hinterweg nehmen |
| `druce/k2v_kleister_wahl0` | `druce` +1 | Eine nutzbare Abschrift hinterlassen und das Original sichern |
| `sedge/rat_ende` | `sedge` +1 | Die Namen des alten Rats zurückbringen |
| `sedge/k2n_reet_nachbarin` | `sedge` +1 | Die trockenen Matten der Nachbarin überlassen |
| `sedge/k2n_kind_schrein` | `sedge` +1 | Den gefundenen Namen nur mit Lins Zustimmung eintragen |
| `sedge/k2n_kind_privat` | `sedge` +1 | Lins Recht auf einen privaten Namen achten |
| `sedge/k2g_aufnahme_offen` | `sedge` +1 | Die wiedergefundenen Geschichten für Ergänzungen bewahren |
| `sedge/k2g_aufnahme_lade` | `sedge` +1 | Die Namen vor Abschriften des Lichtamts schützen |
| `hale/zwoelf_ende` | `hale` +2 | Die Namen ihrer Opfer für die öffentliche Verantwortung bringen |
| `hale/k2v_hale_wahl0` | `hale` +1 | Ihr vollständiges eigenes Eingeständnis ermöglichen |
| `hale/k2v_hale_wahl1` | `hale` +1 | Auf ihren Wunsch eine unabhängige Abschrift sichern |
| `brack/bojen_ende` | `brack` +1 | Die tödliche Bedrohung der Bucht beenden |
| `brack/k2n_lied_hafen` | `brack` +1 | Das vollständige Lied weitergeben |
| `brack/k2n_lied_familien` | `brack` +1 | Den wartenden Familien eine private Abschrift geben |
| `brack/k2v_quartier_wahl0` | `brack` +1 | Unbeteiligte Nachbartüren aus dem Bericht heraushalten |
| `brack/k2v_dienstwechsel_wahl0` | `brack` +1 | Den Helfer anonym lassen |
| `brack/k2v_waerter_wahl0` | `brack` +1 | Sicherheitswissen den Werkleuten zugänglich machen |
| `hesper/zimmer3_ende` | `hesper` +2 | Den verschollenen Gast lebend zurückbringen |
| `hesper/k2n_liste_hesper_maske` | `hesper` +1 | Zunders persönliche Zahlung diskret übergeben |
| `hesper/k2n_liste_hesper_bote` | `hesper` +1 | Die persönliche Zustellung auf eigene Kosten sichern |
| `hesper/k2n_liste_hesper_wegfrei` | `hesper` +1 | Die persönliche Zustellung trotz Umweg übernehmen |
| `hesper/k2v_umschlaege_wahl0` | `hesper` +1 | Ihr die geordnete Verwahrung der Briefe anvertrauen |
| `wyle/k2v_hoersaale_wahl0` | `wyle` +1 | Lehre ermöglichen ohne die vier Namen preiszugeben |
| `wyle/k2v_hoersaale_wahl1` | `wyle` +1 | Originale schützen und die Methode trotzdem zugänglich halten |
| `pedell/k2n_liste_pedell_maske` | `pedell` +1 | Zunders vertraulichen Umschlag sicher übergeben |
| `pedell/k2n_liste_pedell_bote` | `pedell` +1 | Die vertrauliche Zustellung finanzieren |
| `pedell/k2n_liste_pedell_wegfrei` | `pedell` +1 | Den gefährlicheren Weg für eine sichere Zustellung nehmen |
| `pedell/k2v_schattenmass_wahl0` | `pedell` +1 | Den Gerätefehler sachlich dokumentieren |
| `pedell/k2v_schattenmass_wahl1` | `pedell` +1 | Das fehlerhafte Gerät sperren und Wyle informieren |
| `brandt/rein` | `brandt` -1 | Ihre Verhaftung mit Zeugen und Belegen durchsetzen |
| `brandt/meister` | `brandt` -1 | Sie ausdrücklich aus ihrem Amt verdrängen |
| `elsbeth/frei` | `elsbeth` +2 | Ihr den verlorenen Namen zurückgeben |
| `elsbeth/koop_reaktion_elsbeth_ruhig` | `elsbeth` +1 | Zeit zum Erinnern gewähren statt drängen |
| `k3a_oren/k3n_drehscheibe_laststeg` | `k3_oren` +1 | Den sicheren Weg für Lastkarren gemeinsam fertigstellen |
| `k3a_oren/k3n_drehscheibe_fusssteg` | `k3_oren` +1 | Den gesicherten und überdachten Fußweg fertigstellen |
| `k3a_mabel/k3a_veroeffentlichen` | `k3_gallowmere` -1 | Die überprüfte Vertuschung samt seiner Anweisung veröffentlichen |
| `k3a_mabel/k3n_tischgedeck_offen` | `k3_mabel` +1 | Evin mit seiner Zustimmung selbst sprechen lassen |
| `k3a_mabel/k3n_schichtmarke_fonds` | `k3_mabel` +1 | Ihre Zustimmung und Mengenbestimmung für ehrliche Essensmarken sichern |
| `k3a_pelham/k3n_grabstein_ohne_namen_zeigen` | `k3_pelham` +1 | Die eigene Privatsphäre für eine sachliche Warnung einsetzen |
| `k3a_nellie/k3n_falsche_zeit_stoppen` | `k3_nellie` +1 | Den Arbeiter sicher begleiten statt einen riskanten Versuch fortsetzen |
| `k3a_huxford/k3n_attest_patienten` | `k3_huxford` +1 | Die Berichtigungen zuerst den betroffenen Patienten zustellen |
| `k3a_esther/k3n_letzte_lohnliste_auszug` | `k3_esther` +1 | Nur ausdrücklich freigegebene Beträge veröffentlichen |
| `k3a_esther/k3n_letzte_lohnliste_archiv` | `k3_esther` +1 | Die Verfügungsgewalt der Familien über ihre Blätter wahren |
| `k3a_adaine/k3n_vermessung_beobachten` | `k3_adaine` +1 | Eine sichere Messung ohne persönlichen Ruf ermöglichen |
| `k3a_adaine/k3n_vermessung_sperren` | `k3_adaine` +1 | Den gefährlichen Messweg nach Prüfung sperren |
| `k3a_pfiff/k3n_brief_aus_wexmoor_kueche` | `k3_mabel` +1 | Die bezahlten Dochte in ihre Familienküche liefern |

## Auftragswirkungen

Der Abschlussbonus belohnt die erledigte Arbeit. Bei mehreren vertretbaren Ausgängen ist er gleich; die persönliche Entscheidung wird gegebenenfalls zusätzlich am Knoten bewertet. Hauptfälle und Aufträge von Vertrauensfiguren erhalten hier keinen pauschalen Bonus.

| Auftrag | Auftraggebende Figur | Bonus |
|---|---|---|
| `pickpocket` | `greta` | +1 |
| `lost_file` | `pimm` | +1 |
| `cell_knock` | `barnaby` | +1 |
| `medallion` | `ivy` | +1 |
| `fog_hound` | `greta` | +1 |
| `archive_rats` | `pimm` | +1 |
| `pip_headline` | `pip` | +1 |
| `lamp_round` | `wick` | +1 |
| `quill_mirror` | `quill` | +1 |
| `blind_ned` | `ned` | +1 |
| `starglass` | `astronom` | +1 |
| `k2_s_zimmer3` | `hesper` | +1 |
| `k2_s_bojen` | `brack` | +1 |
| `k2_s_druce` | `druce` | +1 |
| `k2_s_sedge` | `sedge` | +1 |
| `k2_s_hale` | `hale` | +1 |
| `k2n_reetdach` | `sedge` | +1 |
| `k2n_bojenlied` | `brack` | +1 |
| `k2n_moorkind` | `sedge` | +1 |
| `k2v_hoersaale` | `wyle` | +1 |
| `k3n_drehscheibe` | `k3_oren` | +1 |
| `k3n_tischgedeck` | `k3_mabel` | +1 |
| `k3n_grabstein_ohne_namen` | `k3_pelham` | +1 |
| `k3n_attest` | `k3_huxford` | +1 |
| `k3n_letzte_lohnliste` | `k3_esther` | +1 |
