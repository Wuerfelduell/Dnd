# DS · Klang der neuen Rituale

92 Basis-IDs, 117 Klangvarianten, 234 Audiodateien (OGG/Vorbis und MP3), fünf Schleifen und vier Notendaten-Stücke. Die ausgeschriebenen Auftrags-IDs sind die Sollmenge, nicht die ungefähren Gruppenanzahlen. Nur neue Audio-Assets, Notendaten und diese Dokumentation; kein Spielcode geändert.

## Herkunft und Reproduktion

Alle SFX sind eigene deterministische Synthesen aus Oszillatoren, gefiltertem Rauschen und zeitlich komponierten Materialgeräuschen. Keine Aufnahmen, Fremdsamples, Sprache oder Schreie. Trocken, mono, 24 kHz; kein künstlicher Hall in den SFX. Musik verwendet ausschließlich `instrumente.json` und die beiden vorhandenen Vorlagen. `generate.py` enthält die vollständige Klangrezeptur und den Sollkatalog; benötigt Python 3, NumPy, SciPy und FFmpeg. Start aus beliebigem Arbeitsverzeichnis: `python3 docs/story/sfx4/generate.py` (Pfad relativ zur Repo-Wurzel).

`node docs/story/sfx4/pruefen.mjs` prüft ohne npm-Pakete alle kodierten Dateien mit FFmpeg/ffprobe sowie die Musik mit dem Originalparser. `node docs/story/sfx4/pruefen_musik.mjs` benötigt nur Node und die vorhandenen Repository-Module. Ergebnisse stehen in `validation.txt`. SHA-256 sichert die abgegebenen Dateien; Codec-Versionen können bei erneuter Synthese andere Binärdateien erzeugen. Musik wird mit `compileStueck` geprüft, einschließlich unbekannter Instrumente, falscher Taktlänge, unbekannter Abschnitte und ungültigem Loopstart als Negativproben.

Einzelklänge bleiben auch einschließlich MP3-Padding unter vier Sekunden. Der ausdrücklich mit vier Sekunden beschriebene Sonnenaufgang dauert wegen dieser strengeren Vorgabe 3,9 Sekunden. Die fünf Loops haben exakt 2/4/8 Sekunden Nutzdaten; MP3-Container können Encoder-Padding bis knapp 0,1 Sekunden enthalten. OGG bevorzugen. MP3 für Loops nur gapless dekodiert verwenden, niemals Container-Padding als Pause wiederholen. Die Übergangsregionen sind ohne Stille verbunden; der Prüfer kontrolliert die Naht an den tatsächlich dekodierten Dateien. Ein Hör- und Spielmix-Test im Zielclient bleibt beim Einbau erforderlich.

## Anschluss und Lebensdauer

Die Tabellen beschreiben fachliche Auslöser, keine behaupteten vorhandenen Eventnamen. Der Einbau registriert `manifest-sfx4.json` in `src/core/sounds.js` und verbindet bestätigte Zustandsänderungen. Mehrfachvarianten heißen `<id>_1` bis `<id>_N`, einzelne Dateien `<id>`. Zufällig ohne sofortige Wiederholung wählen, außer den fest zugeordneten Trank- und Zutatenvarianten. Audio würfelt keine Spielergebnisse aus.

Alle Seq-4-Prüfungen sind ortsunabhängig und solo. Im Koop kommen persönliche Klänge vom aufsteigenden Spieler; ein gemeinsam gehörter Vorgang wird nur einmal gemischt. Der Zuschauer löst keine eigenen Ritualhinweise aus. Flag-Vorschläge: `s4r_<pfad>_aktiv`, `s4r_<pfad>_done`, `s4r_<pfad>_fehlschlag`; für Spieler 2 davor `p2_`. Keine Stadt- oder Fallvoraussetzung durch Audio hinzufügen.

Beim Abbruch, Fehlschlag, Tod, Kartenwechsel oder Laden sämtliche Ritual-Loops und geplanten Hinweise stoppen; außerhalb der Echo-Taubsperre mit 30–80 ms Abblendung. Weltambiente und Kampfmusik ersetzen ihre Vorgänger, nicht stapeln. `s4r_regel_gebrochen` markiert einen tatsächlich registrierten Regelbruch; abgewiesene Eingaben spielen den speziellen Verbotston, sofern keine Taubsperre gilt. Bei endgültigem Scheitern danach einmal `ritual_fehlschlag`; Verdauungsabzug und Wiederholbarkeit gehören der Spiellogik.

### Laterne

`s4la_nachfuellen_loop` beim Beginn des Haltens einmal starten; beim Loslassen, Unterbrechen, Tod oder Fertigfüllen sofort stoppen. `s4la_nachfuellen_voll` nur bei abgeschlossener Füllung, `s4la_nachfuellen_abbruch` nur bei Unterbrechung. Kein Loop-Neustart pro Frame. Für Monsterzischen höchstens vier gleichzeitige Stimmen, pro Monster mindestens 180 ms Abstand; Glaswarnungen höchstens alle 250 ms pro Laterne. `s4la_unruhe_puls` enthält einen Puls; dessen Gain mit Ritualdauer von 0 bis Manifestpegel erhöhen, nicht durch mehrfaches Überlagern. `s4la_sonnenaufgang` nur bei bestätigter Wächterbedingung zwischen drei brennenden Laternen. Kein normaler Treffer darf dadurch irrtümlich den Wächter töten.

### Echo: absolute Stille

Vor Aktivierung bisherigen Mixerzustand sichern. In 1,5 Sekunden Musik, Ambiente, UI, Warnungen, Angriffe, Treffer, Schritte, Stimmen und Koop-Zuschauerklänge vollständig auf null fahren; `s4ec_taub_an` begleitet diese Übergangsphase und endet selbst bei null. Erst danach die taube Prüfungsphase starten. Während der drei Gegner und des Wächters **keine Klänge**, auch keine Verbotstöne, Paraden, Erfolgs-, Regelbruch- oder Fehlertöne. Bestehende Audio-Tails stoppen und neue Starts zentral sperren; bloß fehlende Angriffswarnungen reichen nicht.

Beim Ende oder Abbruch die Sperre kontrolliert lösen: `s4ec_taub_aus` einmal, normale Welt langsam zurück. Vorherigen Nutzer-Mute und Lautstärken respektieren, niemals einen stummgeschalteten Client hörbar machen. Keine Ereignisse aus der stillen Phase nachspielen. Musik `s4r_waechter` wird beim Echo niemals gestartet. Gemeinsamer lokaler Audiomischer muss auch den Zuschauer stumm halten; getrennte Clients dürfen keine akustischen Kampfhinweise an den Prüfling übertragen.

### Weitere Prüfungen

Faden: `s4fa_markieren` nur für eine neu akzeptierte Kreatur aus einem weiteren Gebiet; Traumambiente beginnt beim Übergang nach fünf Markierungen. Heilung bleibt verboten. Maske: Faustvarianten enthalten nur Materialkontakt, keine okkulte Aufwertung; Zweifel erst nach bestätigtem Verschonen.

Kessel: `s4ke_trinken_reihe_1..5` sind feste Positionen in der von der Spiellogik festgelegten Trankfolge, keine zufälligen Varianten. Der Auftrag benennt nicht alle fünf Tränke; die endgültigen Item-IDs werden vom Code zugeordnet. Explosions-, Frost- und Gluttreffer nutzen ihre Spezial-ID, Gift nutzt `gift`; kein zusätzlicher Giftton wird geliefert. Andere Wurfeffekte erst nach bestätigter Wirkung.

Eisen: `s4ei_runde_ueberstanden` einmal nach Runde 1–5, `s4ei_waechter_frei` einmal beim Eintritt in Runde 6. Davor bei Schadenversuchen `s4r_waechter_immun`. Ausweichen bleibt gesperrt.

Schlüssel: `schatten_amb` ersetzt das normale Weltambiente ab der Trennung. Schritte bewusst leise (Manifest 0,2 und niedriger Dateipegel). Schatten 40 % Leben, keine Ausrüstung/Heilung/Parade; Ausweichen bleibt erlaubt. `schatten_auslosen` erst nach feststehender eigener Zufallsfähigkeit einmal pro Runde; dieser Klang löst keinen RNG-Wurf aus. Zwei Gegner, danach Wächter; Rückkehr und Verlust beenden das Ambiente.

Waage: Besitz vor Zirkeleintritt versiegeln, Kapital bleibt freie Spielerentscheidung. `s4wa_kauf` nur nach bezahltem Kauf; `s4wa_alles_gekauft` einmal nach der letzten Ware. Nur dort gekaufte Ausrüstung ist zugelassen.

Moor: Zersetzung nur nach bestätigtem Verbrauch eines geeigneten seltenen/okkulten Gegenstands durch Moorfähigkeit. Reliktklang nach fünf Resten; Eigenschaften würfelt die Logik. Pro Runde genau der tatsächliche Moorwasserverbrauch löst den Trinkton aus. Leere Flasche ersetzt keinen Verbrauch.

Uhr: `s4uh_monster_angriff_gezaehlt` erst nach tatsächlichem ersten Angriff des jeweiligen Monsters, ohne Vorwarnung. Perfektton erst nach ausgewertetem Ausweichen. Vorprüfung ohne Fehler, Wächter höchstens drei Fehler; Parieren gesperrt. Kein Sound verändert das Eingabefenster.

Freies Brauen: Zutaten 1 Pulver, 2 Kraut, 3 Flüssigkeit. Brodelloop startet einmal beim Brauen und endet vor Ergebnis/Abfüllen oder bei Abbruch. Uhrwarteprüfung: `s5_uhr_warten_tick` ist genau ein Tick in einer Sekunde; die Logik spielt ihn 20-mal anhand bestätigter Sekunden, kein eigener Audiotimer entscheidet den Erfolg.

## Musik und Mischung

Die vier JSON-Dateien werden vom Einbau über die vorhandene Musikregistrierung geladen; dieses Paket verändert keine zentralen Musikmanifeste. Der allgemeine Vollrepository-Musikprüfer verlangt registrierte Stücke, daher wird hier der eigene DS-Prüfer mit demselben Originalcompiler verwendet.

| Datei / Musik-ID | Einsatz | Aufbau |
|---|---|---|
| `s4r_laternennacht` | Echtzeit-Nachtprüfung | 64 BPM, langsame Pauke `puls`; Melodielagen `voll`, `halb`, `rest` |
| `s4r_traum` | Kampf gegen fünf Traumkreaturen | 48 statt 66 BPM; sämtliche Vorlagenmotive eine Oktave tiefer, gleiche Tonklassen und Abschnittstranspositionen; Celesta |
| `s4r_schattenseite` | Getrennter Schatten auf der Karte / zwei Gegner | 52 BPM; nur Kontrabass und Celesta, lange Pausen |
| `s4r_waechter` | Abschlusswächter aller Pfade außer Echo | 128 statt 112 BPM; aus Grenzwächter A/B, je vier Takte, kürzere Melodieimpulse und doppelte Paukenschläge; Loop 15 s |

Laternen-Spuren sind **additive Schichten**: bei 5–6 brennenden Laternen alle an; bei 3–4 `voll` aus; bei 1–2 auch `halb` aus; bei 0 alle Melodielagen aus, nur `puls` bis zum Ende der Prüfung. Damit wird mit abnehmendem Licht schrittweise Melodie entfernt. Reaktivieren entsprechend der aktuellen Anzahl. Track-Gains über 250 ms blenden, musikalische Position beibehalten. Die aktuelle Synth-API hat dafür noch keine öffentliche einzelne Spur-Gain-Funktion; der Code-Thread muss diese Steuerung ergänzen. Kein Neustart des Stücks bei jeder Laternenänderung.

Beim Wächter zu `s4r_waechter` wechseln (Echo: Stille); in der Laternenprüfung endet damit die adaptive Nachtmusik. Am Sonnenaufgang Musik abblenden, damit der warme SFX-Akkord Platz bekommt. Traum-/Schattenambiente gegenüber Musik absenken. `ritual.json` bleibt Musik für allgemeine Ritualvorbereitung, `hg_grenzwaechter.json` für den bisherigen Grenzwächter; beide werden unverändert wiederverwendet.

## Vorhandene Klänge wiederverwenden

| Ereignis | Vorhandene ID |
|---|---|
| Allgemeine Seq-5/6-Ritualvorbereitung | `ritual_start` |
| Seq-4-Beginn nach Bestätigung | `hg_ritual_beginn` |
| Ritual erfolgreich abgeschlossen | `ritual_erfolg` |
| Ritual endgültig fehlgeschlagen, außerhalb Echo-Stille | `ritual_fehlschlag` |
| Kerze am Ritual entzündet | `ritual_kerze` |
| Bestehende Laterne angezündet | `laterne_an` |
| Lichtangriff bestätigt | `licht_angriff` |
| Regulärer Trank gebraut (kein neuer Ritualtrank/freier Sud) | `trank_brauen` |
| Normales erlaubtes Ausweichen, außer Uhr-Perfektbestätigung und Echo | `ausweichen` |
| Giftwirkung eines Ritualtranks | `gift` |
| Pfadsiegel rastet ein | `hg_ritual_siegel` |
| Wächter materialisiert im Kampfbild; Weltauftritt separat | `hg_schwellenwaechter_kalk` |
| Wächtertreffer | `hg_schwellenwaechter_schlag` |
| Wächter zerfällt | `hg_schwellenwaechter_zerfall` |
| Bereits vorhandene Kreaturform äußert sich wortlos | `hg_kreatur_stimme_1`, `hg_kreatur_stimme_2`, `hg_kreatur_stimme_3` |

Nicht gleichzeitig den Weltauftritt und die komplette Kalk-Materialisierung stapeln. Allgemeiner Start und Seq-4-Beginn sind Alternativen. Erfolgs-/Fehlschlagsmeldungen niemals doppelt für beide Spieler ausgeben. Im Echo gelten alle Zuordnungen erst wieder außerhalb der Taubsperre.

## Neue Ereignisse → IDs

| Ereignis / Klang | ID | Varianten | Sekunden | Gruppe |
|---|---|---:|---:|---|
| Ritualregel gebrochen: trockener Riss, danach Stille | `s4r_regel_gebrochen` | 1 | 0.55 | s4r |
| Wächter erscheint auf der Karte: Kalk rieselt, schwere Tür | `s4r_waechter_erscheint_welt` | 1 | 2.6 | s4r |
| Unverwundbarer Wächter getroffen: dumpfes Abprallen | `s4r_waechter_immun` | 1 | 0.45 | s4r |
| Teilbedingung erstmals erfüllt: leiser kurzer Siegelklang | `s4r_bedingung_erfuellt` | 1 | 0.7 | s4r |
| Laterne gesetzt: Eisenpfahl in Erde | `s4la_laterne_aufstellen` | 1 | 0.7 | s4r |
| Nachfülltaste gehalten: Öl gluckert, nahtlose Schleife | `s4la_nachfuellen_loop` | 1 | 2 | s4r |
| Nachfüllen abgeschlossen: Flamme springt auf | `s4la_nachfuellen_voll` | 1 | 0.8 | s4r |
| Nachfüllen abgebrochen: Ölfluss stoppt | `s4la_nachfuellen_abbruch` | 1 | 0.35 | s4r |
| Monster trifft Laterne: kurzes Glasklirren | `s4la_laterne_angegriffen` | 2 | 0.55 | s4r |
| Laterne erlischt: erstickte Flamme | `s4la_laterne_aus` | 1 | 0.6 | s4r |
| Monster erleidet Lichtschaden: Schatten zischt | `s4la_monster_zischt` | 3 | 0.8 | s4r |
| Monster stirbt am Licht: trockener Zerfall | `s4la_monster_zerfall` | 1 | 1.2 | s4r |
| Spieler zurückgestoßen: Treffer und Rutschen | `s4la_rueckstoss` | 1 | 0.65 | s4r |
| Nachtprüfung läuft: Wind, fernes Scharren, Flammen | `s4la_amb_nacht` | 1 | 8 | s4r |
| Unruhe steigt: tiefer Puls, zeitabhängig einblenden | `s4la_unruhe_puls` | 1 | 1.5 | s4r |
| Wächter zwischen drei brennenden Laternen: drei Töne, warmer Akkord, ferner Vogel | `s4la_sonnenaufgang` | 1 | 3.9 | s4r |
| Neue Kreatur markiert: Faden spannt sich, hoher Ton | `s4fa_markieren` | 1 | 0.8 | s4r |
| Fünf Markierungen vollständig, Schlaf beginnt: Atem und zuziehende Fäden | `s4fa_einschlafen` | 1 | 2.2 | s4r |
| Traumkampf aktiv: gedämpftes Bett und rückwärts klingende Glocke | `s4fa_traum_amb` | 1 | 8 | s4r |
| Traum verlassen: Atem und sich lösender Faden | `s4fa_erwachen` | 1 | 1.2 | s4r |
| Heilversuch im Traum abgewiesen: Faden reißt leise | `s4fa_heilung_versagt` | 1 | 0.4 | s4r |
| Zivilistengestalt angenommen: Porzellan abgelegt und Stoff | `s4ma_verwandeln` | 1 | 1.5 | s4r |
| Beyonder herausgefordert: Lederhandschuh fällt auf Stein | `s4ma_handschuh` | 1 | 0.55 | s4r |
| Bloßer Faustschlag trifft: trockener Körperkontakt ohne Magie | `s4ma_faust` | 3 | 0.32 | s4r |
| Fähigkeit im Zivilistenritual abgewiesen: Maske springt | `s4ma_gabe_verboten` | 1 | 0.5 | s4r |
| Gegner verschont: Atem, Schritte entfernen sich | `s4ma_verschonen` | 1 | 1.7 | s4r |
| Dauerhafter Zweifel gesetzt: Ton bricht ab | `s4ma_zweifel` | 1 | 0.65 | s4r |
| Taubheit beginnt: Rauschen wird tiefpassgefiltert und verschwindet | `s4ec_taub_an` | 1 | 1.5 | s4r |
| Taubheit beendet: Welt kehrt weich zurück, kein Tinnitus | `s4ec_taub_aus` | 1 | 0.8 | s4r |
| Ritualrezept freigeschaltet: Kessel klingt wie Glocke | `s4ke_rezept_frei` | 1 | 1 | s4r |
| Ritualtrank fertig: Blase und heller Dampf | `s4ke_ritualtrank_gebraut` | 1 | 1.1 | s4r |
| Nächsten Ritualtrank getrunken: fünf feste Schluck-/Zischfarben | `s4ke_trinken_reihe` | 5 | 1.1 | s4r |
| Explosiver Ritualtrank trifft: kurzer gedämpfter Druckstoß | `s4ke_wurf_explosion` | 1 | 1.2 | s4r |
| Frosttrank trifft: Eis knackt | `s4ke_wurf_frost` | 1 | 0.9 | s4r |
| Gluttrank trifft: weiches Zischen und Brutzeln | `s4ke_wurf_glut` | 1 | 1.1 | s4r |
| Direkter Angriff abgewiesen: Kesselrand dämpft Schlag | `s4ke_angriff_verboten` | 1 | 0.45 | s4r |
| Überlast bewegt sich: Metall knarrt unter Gewicht | `s4ei_last_aechzt` | 2 | 1.2 | s4r |
| Runde eins bis fünf überstanden: Niet schlägt ein | `s4ei_runde_ueberstanden` | 1 | 0.5 | s4r |
| Runde sechs beginnt: Nietring springt, Wächter verwundbar | `s4ei_waechter_frei` | 1 | 1 | s4r |
| Ausweichversuch abgewiesen: Gewicht schleift | `s4ei_ausweichen_verboten` | 1 | 0.5 | s4r |
| Besitz abgelegt und versiegelt: Schnur, Plombe, Blei | `s4wa_besitz_versiegeln` | 1 | 1.3 | s4r |
| Zirkelware bezahlt: Münzen auf Waagschale | `s4wa_kauf` | 3 | 0.8 | s4r |
| Geld für nächsten Kauf fehlt: leerer Beutel | `s4wa_kapital_knapp` | 1 | 0.6 | s4r |
| Letzte Ware gekauft: Waage pendelt ein | `s4wa_alles_gekauft` | 1 | 1.4 | s4r |
| Geeigneter Gegenstand durch Moorfähigkeit zersetzt: feuchte Blasen | `s4mo_zersetzen` | 3 | 1.4 | s4r |
| Fünf Reste zum Relikt geformt: Torf pressen und trockener Knochenknacks | `s4mo_relikt_formen` | 1 | 3 | s4r |
| Moorwasser der aktuellen Runde getrunken: zäher Schluck | `s4mo_moorwasser_trinken` | 2 | 1.1 | s4r |
| Moorwasser fehlt: leere Flasche | `s4mo_moorwasser_leer` | 1 | 0.55 | s4r |
| Perfektes Ausweichen bestätigt: Tick pausiert, heller Schlag | `s4uh_perfekt` | 1 | 0.65 | s4r |
| Ausweichen verfehlt: Zahnrad bricht | `s4uh_fehler` | 1 | 0.55 | s4r |
| Erster tatsächlicher Monsterangriff gezählt: kurzer Tick | `s4uh_monster_angriff_gezaehlt` | 1 | 0.2 | s4r |
| Schatten gelöst: Stoff hebt sich vom Boden, Unterdruck | `schatten_trennen` | 1 | 1.8 | schatten |
| Schatten kehrt zum Körper zurück: Druck löst sich | `schatten_rueckkehr` | 1 | 1.5 | schatten |
| Schatten besiegt: Rauch verweht | `schatten_verloren` | 1 | 1.4 | schatten |
| Schatten setzt Schritt: fast lautloses Streifen | `schatten_schritt` | 2 | 0.3 | schatten |
| Schattenattacke ausgeführt: dunkler Luftschnitt | `schatten_attacke` | 3 | 0.65 | schatten |
| Schatten getroffen: gedämpfter Luftstoß | `schatten_treffer` | 1 | 0.45 | schatten |
| Rundenfähigkeit festgelegt: dunkles Würfeln | `schatten_auslosen` | 1 | 0.9 | schatten |
| Schattenheilung abgewiesen: hohler abreißender Hauch | `schatten_heilung_versagt` | 1 | 0.45 | schatten |
| Schattensteuerung aktiv: leiser tiefer Druck und Luft | `schatten_amb` | 1 | 8 | schatten |
| Zutat hinzugefügt: Variante 1 Pulver, 2 Kraut, 3 Flüssigkeit | `sud_zutat` | 3 | 0.8 | rituale56 |
| Freies Brauen aktiv: nahtloses Brodeln | `sud_brodeln_loop` | 1 | 4 | rituale56 |
| Sud gelungen: heller Dampfstoß | `sud_gelungen` | 1 | 1 | rituale56 |
| Sud misslungen: dumpfe Blase und Asche | `sud_pfusch` | 1 | 1.2 | rituale56 |
| Sud abgefüllt: Fluss in Glas | `sud_abfuellen` | 1 | 1.1 | rituale56 |
| Sudwirkung abgelaufen: leises Ausatmen | `sud_wirkung_endet` | 1 | 0.7 | rituale56 |
| Laternenbestie erscheint: tiefer wortloser Glasruf | `s5_laternenbestie_ruf` | 1 | 1.6 | rituale56 |
| Laternenbestie besiegt: Glas klingt aus | `s5_laternenbestie_fall` | 1 | 1.4 | rituale56 |
| Kokon wird gewickelt: trockene Faserzüge | `s5_kokon_wickeln` | 1 | 1.5 | rituale56 |
| Kokon geöffnet: Fasern reißen | `s5_kokon_platzt` | 1 | 0.8 | rituale56 |
| Gesicht angenommen: leise Porzellankontakte | `s5_gesicht_nehmen` | 1 | 1 | rituale56 |
| Misstrauen ausgelöst: wortloses synthetisches Raunen | `s5_misstrauen` | 1 | 1.2 | rituale56 |
| Diebstahl gelingt: Münzen verschwinden in Stoff | `s5_diebstahl` | 2 | 0.65 | rituale56 |
| Erinnerung entnommen: Atemhauch in Glas | `s5_erinnerung_ziehen` | 1 | 1.6 | rituale56 |
| Erinnerungsentnahme verweigert: Glaston verstummt | `s5_erinnerung_verweigert` | 1 | 0.55 | rituale56 |
| Warteprüfung: ein Taschenuhrtick pro bestätigter Sekunde | `s5_uhr_warten_tick` | 1 | 1 | rituale56 |
| Seq-5-Prüfung gescheitert: trockener absinkender Klang | `s5_pruefung_gescheitert` | 1 | 1 | rituale56 |
| Seq-6-Probe gestartet: kurzer gedämpfter Auftakt | `probe_start` | 1 | 0.9 | rituale56 |
| Seq-6-Probe bestanden: zwei nahe helle Töne | `probe_bestanden` | 1 | 1 | rituale56 |
| Seq-6-Fehlversuch gezählt: kurzer matter Schlag | `probe_fehlversuch` | 1 | 0.6 | rituale56 |
| Probefäden verbunden: zwei gespannte Saiten vereinen sich | `probe_faden_verbinden` | 1 | 1.1 | rituale56 |
| Echo-Probe spricht: wortlose synthetische Nebelstimme | `probe_echo_stimme` | 3 | 1.5 | rituale56 |
| Antwort der Echo-Probe: abklingende ferne Resonanz | `probe_echo_nachhall` | 1 | 1.8 | rituale56 |
| Name im Moor entfernt: feuchtes Wischen | `probe_moor_name_weg` | 1 | 1.2 | rituale56 |
| Uhr-Probe: zwei Schläge, danach Stille | `probe_uhr_puls` | 1 | 1.3 | rituale56 |
| Betrugsverdacht vorgebracht: Faust auf Tisch | `waage_anprangern` | 1 | 0.6 | rituale56 |
| Betrug bestätigt: Wachsstempel und Raunen | `waage_betrug_aufgedeckt` | 1 | 1.3 | rituale56 |
| Beschuldigung falsch: Stuhl rückt, danach Stille | `waage_falsch_beschuldigt` | 1 | 1.1 | rituale56 |
| Dietrich bewegt: feine Metallstifte | `schloss_dietrich` | 3 | 0.65 | rituale56 |
| Schloss geöffnet: Stift und Riegel | `schloss_auf` | 1 | 0.6 | rituale56 |
| Schloss mit Brecheisen geöffnet: Hebeln und kurzer Bruch | `schloss_brecheisen` | 1 | 1 | rituale56 |
| Öffnungsversuch misslungen: Stift rutscht ab | `schloss_misslungen` | 1 | 0.65 | rituale56 |
