# Codex-Paket CM: Soundeffekte, Runde 2 (alles seit Paket Y)

**Schreibt nach:** `public/audio/sfx/` und `public/audio/manifest-sfx2.json` (Format wie `manifest-sfx.json`)

Paket Y hat 105 Grundgeräusche geliefert (Oberfläche, Schritte, Welt, Polizei, Kampf, Okkult, Atmo). Seitdem sind Dunscar, die Sekten, die Feste, die Fasserin, der Kontrollverlust, Starling Phase 2, die Beziehungen, der Koop mit Ansprüchen und jetzt Calderwick und Briarholt dazugekommen, alle ohne eigene Klänge. Du lieferst **etwa 90 neue Effekte**, synthetisch oder aus freien, selbst erzeugten Quellen, ohne Stimmen und ohne Fremdmaterial. **Keinen Spielcode ändern.**


## 0. Format (Pflicht, zuerst lesen)
- Vorbild `public/audio/manifest-sfx.json`: je Id `group`, `volume`, `duration`, `note`, optional `variants`, `loop`. Dateien `public/audio/sfx/<id>.ogg` (Pflicht) und `.mp3` (nur, wenn der Upload klein bleibt; sonst in der PR-Beschreibung vermerken). Varianten `<id>_1.ogg` usw.
- Mono, 44,1 kHz, OGG Qualität 4, Spitzen bei −3 dB, kein Nachhall-Schwanz länger als 1,5 s außer wo genannt. Jede Datei kürzer als 4 s außer Schleifen. Gesamtgröße unter 12 MB; wenn mehr, **zwei PRs** (Gruppen 1 bis 4, dann 5 bis 9).
- Zuordnung: `src/core/sounds.js` (nur lesen) zeigt, wie Ereignisse und Karten auf Ids zeigen. Schreib in `docs/audio/sfx2_zuordnung.md`, welches Spielereignis oder welche Karte welche neue Id nutzen soll (Ereignisnamen aus `sounds.js`, Karten-Ids aus `src/data/`), damit der Einbau nur noch Zeilen ergänzt.
- Stil wie Y: trocken, nahe, wenig Hall, viktorianisch-industriell; Okkultes gläsern und türkis gedacht, nie Horror-Schreie.

## 1. Dunscar und Rufen (Gruppe `dunscar`)
| ID | Beschreibung |
|---|---|
| `ds_zug_fern` | der Nachtzug weit weg: tiefes Rollen + ein Pfiff, 3 s |
| `ds_zug_einfahrt` | Einfahrt in den Endbahnhof: Bremsen, Dampf, 4 s |
| `ds_zug_innen` | **Schleife** im Wagen: Rattern gedämpft, Holz knarrt, 4 s |
| `ds_ruf_senden` | Rufmuster abschicken: kurzer Signalpfiff aus Messing (3 Varianten, tonal verschieden) |
| `ds_nachhall` | Antwort aus der Schlucht: derselbe Pfiff als Echo, türkis gedacht, mit 1,5 s Hall |
| `ds_ruf_falsch` | falsches Muster: der Nachhall kippt, verstimmt, kurz |
| `ds_horchstelle_an` | Trichter wird aktiv: Pulsieren, gläsern, 1 s |
| `ds_drehscheibe` | **Schleife** Drehscheibe läuft: Zahnrad, Knarren, 3 s |
| `ds_kalk_rieseln` | Kalkstaub rieselt (2 Varianten) |
| `ds_lohntuete` | Lohntüte wird gereicht: Papier + Münzen |
| `ds_schichtglocke` | Schichtglocke: ein Schlag, metallisch, trocken |
| `ds_schichtgaenger_fall` | ein Schichtgänger sinkt bewusstlos: Stoff, dumpf, kein Schlag |
| `ds_schallschleuse` | Filztür des Speisewagens: dumpfes Puffen |
| `ds_wachswalze` | **Schleife** Phonograph: Knistern + leises Walzenkratzen, 4 s |
| `schritt_kalk` | Schritte auf Kalkstaub (3 Varianten, knirschend trocken) |
| `atmo_hochebene` | **Schleife** Wind über Kalk, 6 s |

## 2. Sekten (Gruppe `sekten`, Paket BQ/BR)
`sk_asche_kreis` (Aschekreis entdeckt: Knistern + tiefer Ton), `sk_asche_werbung` (Zunder, Flamme fängt), `sk_flut_knoten` (nasses Seil knarrt), `sk_flut_taufe` (etwas taucht unter, blubbert, ohne Schrei), `sk_chor_summen` (**Schleife**, Summen ohne Mund, mehrstimmig synthetisch, 4 s, Tonhöhe in 3 Varianten), `sk_kreidemund` (Kreide quietscht kurz), `sk_schrein_abbau` (Holz bricht, Glocke fällt), `sk_stufe_hoch` (Umtriebe steigen: drei dumpfe Schläge + Pfeife fern), `sk_stufe_runter` (Spannung löst sich, absteigend), `sk_sabotage_brunnen` (Wasser kippt, bitter: tiefer Gurgelton), `sk_laternen_aus` (Gas zischt aus, dann Stille), `sk_ueberfall` (Kampf aus dem Nebel: Y-`kampf_start` mit Chor-Stich), `sk_abgewoben` (Figur verschwindet: Stoff und Türschlag fern).

## 3. Feste und Jahreszeiten (Gruppe `feste`, Paket BV/CK)
`fest_laterne_an` (Papierlaterne zündet, 2 Varianten), `fest_kerzenboot` (Boot ins Wasser gesetzt), `fest_menge` (**Schleife**, Festgemurmel ohne Worte, 6 s), `fest_lachen` (**Schleife**, fernes Lachen und Gläser, 4 s), `fest_drehorgel_start` (Drehorgel hebt an, 2 s), `fest_boxring_gong`, `fest_boxring_treffer` (gepolstert, 3 Varianten), `fest_feuerwerk_start`, `fest_feuerwerk_knall` (3 Varianten, weich), `fest_kahn_horn` (Bojenhorn für die Prozession), `fest_salzkranz` (Salz knirscht), `saison_wechsel` (Jahreszeit wechselt: Windzug + Glockenton, 2 s), `saison_regen` (**Schleife** Regen auf Pflaster, 6 s), `saison_schnee` (**Schleife** Schneetreiben, 6 s), `saison_hitze` (**Schleife** Fliegen und Flimmern, 6 s), `saison_laub` (Laub raschelt beim Gehen, 3 Varianten), `schritt_schnee` (3 Varianten), `schritt_laub` (3 Varianten).

## 4. Fasserin, Kontrollverlust, Starling (Gruppe `okkult2`)
`fasserin_werkbank` (**Schleife** Hämmern und Feilen, 3 s), `fasserin_fassung` (Artefakt eingefasst: Metall klickt + gläserner Glanz), `kontrolle_tentakel` (Tentakel wachsen: nasses Dehnen, tief, 2 s), `kontrolle_zurueck` (ziehen sich zurück, rückwärts gedacht), `kontrolle_laeutersalz` (Salz zischt, Erleichterung), `korruption_tick` (Verderbnis steigt um einen Punkt: Herzschlag + gläsern), `starling_verwandlung` (Sternsammler verwandelt sich: Glas splittert nach innen, Chor, 3 s), `starling_stern` (ein Fall-Stern leuchtet auf, 8 Varianten tonal gestuft), `starling_ende` (nicht tödliches Ende: Atem, Glas legt sich), `geheimtreffen_glocke` (Treffen beginnt), `auktion_hammer` (Zuschlag, 2 Varianten), `auktion_gebot` (Papier + Räuspern ohne Stimme).

## 5. Beziehungen, Koop, Ausrüstung (Gruppe `sozial`)
`beziehung_hoch` (Stimmung steigt: warmer kurzer Akkord), `beziehung_runter` (kühl, abfallend), `geschenk_geben` (Papier + Schleife), `geschenk_falsch` (höfliches Räuspern als Holzton), `koop_anspruch` (Spieler meldet Anspruch auf Beute: Stempel klein), `koop_anspruch_streit` (beide gleichzeitig: Doppelstempel, schräg), `koop_beitritt` (Spieler 2 steigt ein: zwei Töne, die zusammenfinden), `koop_rufen_zu_zweit` (zwei Signalpfiffe im Abstand), `ausruestung_hut`, `ausruestung_mantel` (Stoff, Knöpfe), `ausruestung_waffe` (Holz/Metall aus dem Gürtel), `ausruestung_amulett` (Kette klickt), `tragkraft_voll` (Tasche ächzt), `notizbuch_wegweiser` (Person angeklickt: Bleistift + Kartenpapier), `scroll_tick` (Pixel-Scrollbalken rastet, sehr leise).

## 6. Calderwick (Gruppe `calderwick`, Kapitel 4)
`cw_presse` (**Schleife** Druckerpresse, 3 s), `cw_rohrpost_senden` (Kapsel zischt los), `cw_rohrpost_ankunft` (Kapsel plumpst, Klappe), `cw_schraegaufzug` (**Schleife** Standseilbahn: Seil, Knarren, 4 s), `cw_aufzug_halt` (Kabine rastet ein), `cw_stempel` (Amtsstempel, 3 Varianten), `cw_letter_fall` (eine Bleiletter fällt, 3 Varianten), `cw_abgleich_start` (Abgleich beginnt: Papier reißt rückwärts + tiefer Ton), `cw_abgleich_rueckweg` (Straße verblasst: Rauschen, Rückweg), `cw_anker_setzen` (Marke ins Bürgenbrett: Nadel + Faden spannt), `cw_anker_verbunden` (drei Fäden halten: dreifacher heller Ton), `cw_tuerschild_leer` (Türschild wird leer: Metall, dann nichts), `atmo_rohrpost` (**Schleife** Zischen in den Wänden, 6 s), `schritt_terrasse` (Kalkpflaster, trocken, hallend, 3 Varianten).

## 7. Briarholt (Gruppe `briarholt`, Kapitel 5)
`bh_ventil_drehen` (**Schleife** Rad dreht, 2 s), `bh_ventil_rast` (Ventil rastet ein, 3 Zustände tonal: zu / kalt / warm), `bh_dampf_austritt` (Dampf zischt, 2 Varianten), `bh_dampf_entladung` (groß, 3 s), `bh_kondensat` (Tropfen auf Glas, **Schleife**, 4 s), `bh_scheibe_beschlag` (Schrift erscheint im Beschlag: Finger auf Glas), `bh_reif` (Frost zieht ein: feines Knistern), `bh_pflanze_oeffnet` (Blüte öffnet sich: nasses Entfalten + türkis gedacht), `bh_pflanze_spricht` (**Schleife**, Flüstern ohne Worte als Luftstrom, 3 s), `bh_kapsel` (Pflanzenkapsel klickt in den Halter), `bh_ruecklauf` (belasteter Rücklauf fließt: tiefes Gurgeln, violett gedacht), `bh_sperrklappe` (schwerer Riegel fällt), `bh_kurglocke` (helle Kurglocke, zwei Schläge), `bh_postkarte` (Karte wird geschrieben: Feder), `atmo_glashaus` (**Schleife** Tropfen und ferne Pumpe, 6 s), `atmo_frost` (**Schleife** Wind im Talkessel, 6 s), `schritt_glas` (Metallgitter im Glashaus, 3 Varianten).

## 8. Landstraße (Gruppe `reise2`)
`ls_kutsche_halt` (Pferde schnauben, Räder stoppen), `ls_zoll_schranke` (Holzschranke hebt sich), `ls_grenzstein` (Stein summt kurz, okkult leise), `ls_peitsche` (Kutschpeitsche, trocken), `ls_schlafkutsche` (**Schleife** Spieluhr-artiges Räderknarren, 4 s), `ls_landvermesser_tick` (Messkette klackt, 3 Varianten).

## 9. Oberfläche-Ergänzungen (Gruppe `ui2`)
`ui_kapitel` (Kapitelkarte erscheint: Papier entrollt + Glocke fern, 2 s), `ui_epilog` (Epilog-Text blendet ein: Feder + Hall), `ui_ende_hell` (gutes Ende: warmer Dreiklang mit Glocke), `ui_ende_dunkel` (dunkles Ende: tiefer Schlag, Stille), `ui_bestiarium_neu` (Eintrag freigeschaltet: Feder + Tier-Rascheln), `ui_personen_karte` (Aufenthaltsorte einer Figur: Kartenpapier + drei Nadeln), `ui_zeitung` (Zeitung aufgeschlagen), `ui_fest_banner` (Festbanner erscheint: kurzer Tusch mit Drehorgel), `ui_saison_banner` (Jahreszeiten-Hinweis: Windzug + Glöckchen).

## 10. Abgabe
`public/audio/manifest-sfx2.json`, alle OGG-Dateien, `docs/audio/sfx2_zuordnung.md`, ein Prüfskript `tools/audio/sfx/pruefen_sfx2.mjs` (Node ohne Pakete: jede Id im Manifest hat eine Datei, Dauer unter 4 s außer Schleifen, Gesamtgröße). Pull Request mit Prüf-Ausgabe und Gesamtgröße; wenn über 12 MB, zwei PRs wie oben.

