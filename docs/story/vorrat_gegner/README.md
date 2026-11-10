# BH – Vorrat an Gegnern und Bossen

Vorrat für Calderwick, Briarholt und die Landstraße nach Dunscar. Verbindliche Grundlage sind die vollständig gelesenen Geschichten 1 und 2 aus `docs/story/kapitel3/`. Die früheren Wexmoor-Anreisen dieser Entwürfe werden hier nicht als neue Kapitel-4-Anreisen festgelegt. Wetherby und Greavesend bleiben Figuren des späteren Storypakets; sie werden nicht als zusätzliche Bosse erfunden.

**Nicht eingebaut:** Kein Loader, keine Karte, kein laufender Auftrag und kein Fortschrittsflag der Kapitel 1–3 wird geändert. Alle neuen Spiel-Flags gehören zu `vg_`, alle eigenen Gegenstände zu `vt_`.

## Inhaltsliste

| Datei | Inhalt |
|---|---|
| encounters.json | 24 normale Gegner mit je zwei angekündigten Angriffen, garantierter Trophäe und BL-Material |
| bosses.json | Acht erste Bossabschnitte |
| phasen.json | Zehn Folgeabschnitte; Nullfundament und Mutterwurzel insgesamt je drei, alle übrigen je zwei |
| items.json | 32 verkäufliche Trophäen, keine Kernzutaten |
| bestiarium.json | 32 Einträge: Herkunft, Schwäche, Beobachtung, je zwei Geredezeilen und eine Zeitungsnotiz |
| dialogues.json | Acht Bossabläufe mit gemeinsamer Einmalbeute; drei friedliche Lösungen; Marktschreier-Gespräch |
| zonen_vorschlag.json | Sieben Gebiete ohne Karte, Reiseeintrag oder bestehende Weltverweise; Elite- und Behälterbeute |
| quests.json, npcs.json, case.json, dialog_zusaetze.json, platzierung.json | Leere Standarddateien; es werden noch keine Figuren, Fälle, Quests oder Positionen eingebaut |
| verhalten.md | Streifen, Gruppen, Wahrnehmungsweiten, Tag/Nacht, Koop-Vorschläge und konkrete Angriffssignale |
| offene_punkte.md, grafikwuensche.md, pruefen.mjs | Einbauvertrag, Grafikabweichungen und reproduzierbare Daten-/Kampfprüfung |

Die Aufgabenliste enthält **24 + 8 = 32** verschiedene Wesen. Die einmalige Angabe „34 Trophäen“ ist ein Zählfehler; genau eine Trophäe pro fester ID ergibt 32. Die zehn Folgephasen erhalten keine eigenen Trophäen. So bleibt die Zuordnung zu BI und BM eindeutig.

## Spätere Reihenfolge und Spielzeit

Calderwick: Alte Setzerei → Sortiergrube → Nullfundament. Briarholt: Kaltes Palmhaus → Verlassene Wäscherei → Wurzelkammer. Landstraße: einzeln auswählbare Reisebegegnungen, Landvermesser **oder** Schlafkutsche pro größerem Reiseereignis. Die sieben Gebietsvorschläge sind keine Kapitelroute und beide Stadtgeschichten werden nicht zu einer Handlung verschmolzen.

Geschätzter Umfang bei einmaliger Nutzung aller Inhalte: **100–160 Minuten** Kampf, Beobachtung und kurze Gespräche. Pro normaler Begegnung etwa 1–3 Minuten, pro zweiphasigem Boss 4–7, pro dreiphasigem Boss 8–12; eine tatsächliche Kapitelspielzeit hängt von Karten und Fährten ab. Friedliche Lösungen verkürzen drei Begegnungen. Es gibt keine Belohnung für unnötiges Verletzen der vier ausdrücklich nicht tödlich endenden Gegner.

## Balance und Messverfahren

Normale Grundwerte: sechs Dunscar-Vorlagen aus `src/data/packs/k3_orte/zones.json` (die separate `encounters.json` ist aktuell leer), Leben und Angriffsschaden ×1,3, kaufmännisch auf ganze Werte gerundet. Dadurch ergeben sich 234–364 Daten-Leben und 14–20 Grundschaden. Rüstung 2 bleibt erhalten; Tempo, Trefferfolgen und Ausweichsignale unterscheiden die Rollen.

Bossanfang: Vorhauer 410 → 533 Leben, Nullfundament/Mutterwurzel Vielrufer 550 → 715. Zweiter Abschnitt: Gallowmeres bestehender 220-Leben-Abschnitt → 286. Dritter Abschnitt: Unterschicht-Phase 3 mit 270 → 351. Der Vorhauer-/Vielrufer-Schaden wird ebenfalls ×1,3 gerundet. Jeder Folgeabschnitt ergänzt mindestens eine neue Angriffsart und einen eigenen Übergangstext. Die Kampfengine wendet danach ihre globalen Faktoren selbst an; Datenwerte enthalten diese **nicht nochmals**.

Elite: Leben ×1,4, Angriffsschaden ×1,2 wie der Stadtgegnervertrag. In den Zonen stehen `elite_hp`/`elite_dmg`; die vorhandene Wildnisfassung erhält dieselben Werte über `elite.hp_mult`/`elite.dmg_mult`. Beide Fassungen werden auf Gleichheit geprüft. Eliten erhalten keine eigene Trophäen-ID.

Referenzfigur: **Eisen, Sequenz 4**, Ossuarklinge, Gießermantel, Constable-Helm und Dunscar-Leitungsprüfer, volle 153 Leben und volle Nerven, genau vier Tonika und zwei Verbände. Keine BL-Ausrüstung und keine erfundenen Itemwerte. Normale Gegner: `fight()` mit `SKILLED`, Basisangriff; Eliten/Bosse: `EXPERT`, Doppelschlag wenn verfügbar, sonst Basisangriff. Heilung nur aus dem mitgebrachten Vorrat unter 35 Leben. Deterministischer Zufall aus dem vorhandenen Helfer; dies ist ein reproduzierbares Referenzszenario, keine Aussage über alle Pfade und Spielweisen.

Der Prüfer simuliert alle 42 Abschnitte und 24 Eliten jeweils auf Sequenz 4 und 3 sowie acht vollständige Bossketten ohne Aufstocken/Heilen zwischen den Abschnitten: **150 Kämpfe**. Jeder Seq4-Abschnitt dauert mindestens vier Runden. Normale Gegner dauern 9–22 Runden, zweiphasige Bosse zusammen 21, dreiphasige zusammen 41. Die dreiphasigen Ketten enden im Referenzlauf mit 13 Leben: als spätere schwere Gebietshüter vorgesehen, nicht als überraschende Pflichtbegegnung auf einer Reise.

In der Tabelle stehen bei Bossen **Gesamtrunden und Restleben nach der gesamten Kette**, bei Normalgegnern die Einzelbegegnung. Ein neuer Gegner beginnt für die Messung mit einer frischen Referenzfigur; innerhalb einer Bosskette bleibt ihr Zustand erhalten.

| Gegner/Boss | Runden Seq4 | Restleben |
|---|---:|---:|
| vg_cw_letternlaeufer | 9 | 93/153 |
| vg_cw_rohrpostwespe | 10 | 93/153 |
| vg_cw_stempelhand | 13 | 54/153 |
| vg_cw_durchschlag | 14 | 54/153 |
| vg_cw_registerratte | 9 | 93/153 |
| vg_cw_seilbahnwaechter | 13 | 54/153 |
| vg_cw_tintenschatten | 11 | 79/153 |
| vg_cw_leerfracht | 14 | 54/153 |
| vg_bh_dampfschwester | 11 | 79/153 |
| vg_bh_wurzelgaenger | 13 | 54/153 |
| vg_bh_glasmotte | 10 | 93/153 |
| vg_bh_bluetenkopf | 10 | 87/153 |
| vg_bh_rohrwurm | 13 | 54/153 |
| vg_bh_postkartenschreiber | 14 | 65/153 |
| vg_bh_waeschegeist | 11 | 79/153 |
| vg_bh_sudtraeger | 14 | 54/153 |
| vg_all_wegelagerer | 14 | 65/153 |
| vg_all_kutschengeist | 14 | 54/153 |
| vg_all_zollhund | 22 | 38/153 |
| vg_all_nebelkraehe | 10 | 93/153 |
| vg_all_marktschreier | 16 | 39/153 |
| vg_all_grenzstein | 13 | 54/153 |
| vg_all_fuhrmannsschatten | 11 | 79/153 |
| vg_all_brueckenzoll | 14 | 54/153 |
| vg_cw_boss_bleisammler | 21 | 51/153 |
| vg_cw_boss_blinder_zusteller | 21 | 51/153 |
| vg_cw_boss_nullfundament | 41 | 13/153 |
| vg_bh_boss_glasgaertner | 21 | 51/153 |
| vg_bh_boss_waescherei | 21 | 51/153 |
| vg_bh_boss_mutterwurzel | 41 | 13/153 |
| vg_all_boss_landvermesser | 21 | 51/153 |
| vg_all_boss_schlafkutsche | 21 | 51/153 |

## Sieben Textskizzen für 40 × 30 Kacheln

Koordinaten sind nullbasiert, x = 0–39, y = 0–29. Dies sind Entwurfsvorschläge, **keine existierenden Karten-IDs**. Außenkante geschlossen außer dem später angebundenen Eingang. Jeder Grundriss besitzt eine freie südliche Rückwegspur y=25–27 und einen sicheren Eingangsbereich x=1–8/y=21–28; keine Streife steht darin. Türen und Beobachtungsplätze liegen neben den Angriffslinien, nicht darin.

| Vorschlag | Räume und Wegführung | Gegner-/Bossbereich und Behälter |
|---|---|---|
| Alte Setzerei | Eingang (3,27), Papierlager x=3–14/y=13–20, Pressenhalle x=18–36/y=4–21; zwei Gänge bei x=15 und y=22 verbinden beide. | Letternpaare im Lager, Stempelhand vor der Halle; Bleisammler (30,9), Walzenführung (25,9), Wartungskasten (12,19). |
| Sortiergrube | Eingang (3,27), Empfangsrampe x=3–17/y=17–22, drei Zustellfächer (8,9), (19,6), (30,9); freie Randgänge umgehen alle Fächer. | Wespe über dem Mittelsteg, Leerfrachten in Seitennischen; Zusteller (29,16), Rücklaufbelege (16,20), Kasten (7,20). |
| Nullfundament | Eingang (3,27), getrennte Registerkammern x=3–12 und x=15–24/y=6–19; innere Öffnung x=27–37/y=5–20. | Wächter (16,17), Tintenschatten (9,10); Registerleib (32,12), unabhängige Registerablagen (24,8)/(24,17); Kasten (10,21). |
| Kaltes Palmhaus | Eingang (3,27), kalter Umgang x=3–36/y=21–24, drei Beetinseln x=9–14, 20–25, 30–35/y=6–17. | Blüten sitzen in Beeten, Motten außerhalb des Umgangs, Patient (8,19); Glasgärtner (26,9), äußere Fäden (23,13), Kasten (6,22). |
| Verlassene Wäscherei | Nur gefährlicher Keller: Eingang (3,27), Trockengang x=3–16/y=8–22, abgetrennte Kesselgrube x=20–36/y=5–21; zwei Ventilnischen am Quergang y=23. | Rohrwurm unter dem Gestell, Geist zwischen Tüchern; Atemkessel (29,11), Rücklauf (19,20), Kasten (8,22). Bügelraum ist außerhalb dieses Grundrisses. |
| Wurzelkammer | Eingang (3,27), äußere Wartungszone x=3–16/y=18–23, trockene Gänge x=17–22/y=5–23, Wurzelraum x=25–37/y=4–20. | Postkartenschreiber nur am äußeren Zugang, Sudträger bei (14,18); Blütenmund (31,12), getrennte Probenablage (23,20), Kasten (8,22). |
| Landstraße im Nebel | Straße von (3,27) über (13,21) und (22,15) nach (35,3), zwei einsehbare Wegbuchten x=5–14/y=10–16 und x=26–36/y=17–23; Fußpfad y=26 bleibt frei. | Kurze isolierte Streifen; Marktschreier (10,18) nur per Gespräch. Landvermesser (29,10) oder Schlafkutsche (30,19), nicht gleichzeitig; Reisekasten (7,23). |

Jeder `loot_tables`-Eintrag bezeichnet einen vorhandenen Beutetabellen-Typ, noch keinen platzierten Behälter. Inhalt: etwas Geld und ein garantiertes Material der lokalen BL-Liste. Erst das spätere Kartenpaket bindet einen begehbaren Behälter daran.

## Prüfung

`node docs/story/vorrat_gegner/pruefen.mjs` vom Repository-Stamm. Lädt den aktuellen Spielinhalt über `tests/helpers.js → loadContent()`, prüft IDs gegen die beiden Aufgabenlisten und führt echte `fight()`-Simulationen aus. Externe BL-Definitionen werden nicht erfunden: solange BL fehlt, wird nur deren verbindliche ID-Tabelle geprüft. Die reinen Kampfsimulationen unterdrücken die Auszahlung in ihrer Arbeitsspeicher-Kopie, damit ein fehlendes externes Item keine falschen Testdaten erzwingt. Beim Einbau ist BL als vollständige Abhängigkeit Pflicht.
