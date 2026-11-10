# Vorrat an Gegenständen – Paket BL

72 Gegenstände für Calderwick, Briarholt und die Landstraße, vorgesehen für Sequenz 4–3 nach Dunscar. Dieser Vorrat wird nicht geladen und enthält keine Karten, Aufträge oder Kapitel-Flags. Aktuelle zusätzliche Spielzeit: **0 Minuten**. Für das spätere vollständige Lesen der 20 Untersuchen-Dialoge sind etwa **15–25 Minuten** vorgesehen, ohne Beschaffung oder Reise.

## Dateien und spätere Reihenfolge

1. `items.json` ist das vollständige Register mit allen 72 IDs. `gear.json` enthält dieselben zwölf Kleidungsstücke als Arbeitsauszug, keine zusätzlichen Gegenstände.
2. `artifacts.json` enthält acht Definitionen im Format `list`; die entsprechenden Item-Definitionen stehen bereits im Register. Beim späteren Zusammenführen dieselben IDs nicht doppelt vergeben.
3. `fundstuecke.json` enthält 20 Dialoge, auf die `inspect` verweist. Vor einem Einbau ausdrücklich mit dem Dialogregister zusammenführen. `dialogues.json` bleibt leer, um keine zweite Kopie zu pflegen.
4. `handel.json` folgt dem Marktformat mit drei unplatzierten Händlerrollen und 18 Materialangeboten. Das sind keine neuen Figuren. Erst BJ und das spätere Kapitel ordnen die Rollen konkreten Figuren zu.
5. Die übrigen Standarddateien sind leer. Es gibt keine Quest-Reihenfolge, Platzierung oder neue Fallhinweise.
6. Vor dem Einbau **offene_punkte.md vollständig abarbeiten**: Mehrere verlangte Wirkungen fehlen im heutigen Code. Einträge in `boons`/`curses`, die nur `text` tragen, sind ausdrücklich inaktive Spezifikationen ohne erfundenen passiven Schlüssel. Sie dürfen nicht als fertige Mechanik freigegeben werden. Verbrauch ohne unterstützten Effekt würde heute wirkungslos verbraucht; diese Items bis zur Umsetzung sperren.

## Ausrüstung und Balance

Je Slot sind Kampf, Ermittlung, Reise und Soziales einmal vertreten. Der Schwerpunkt beschreibt den Einsatzzweck; er ist kein neues Datenfeld. Alle negativen Kleidereffekte stehen ebenfalls in `boons`, weil Gear diese Liste auswertet.

| ID | Slot | Schwerpunkt | Vorhandene numerische Werte / spezifizierte Wirkung |
|---|---|---|---|
| `vi_hut_setzerkappe` | hut | Ermittlung | `max_nerves` = 8: +8 maximale Nerven.; Noch umzusetzen: Beim bestätigten Lesen eines Lesestücks 25 % weniger Nervenverlust; mindestens 1 bei einem ursprünglichen Verlust. Kein Schutz vor Gesprächs- oder Kampfkosten. |
| `vi_hut_kurhaube` | hut | Kampf | `max_hp` = 10: +10 maximales Leben.; `max_nerves` = -6: −6 maximale Nerven. |
| `vi_hut_zylinder_vermesser` | hut | Soziales | `sell` = 1.15: 15 % höherer Erlös beim Verkaufen.; Noch umzusetzen: Bei einer bezahlten Reisebegegnung 20 % geringere Geldforderung, aufrunden; keine Änderung von Zeugen, Entscheidungen oder Beweisen. |
| `vi_hut_fuhrmannshut` | hut | Reise | `max_hp` = 6: +6 maximales Leben.; Noch umzusetzen: Wetterbedingte Nerven- und Tempomali auf Reisen entfallen. Keine allgemeine Schadensimmunität, keine Wirkung gegen gegnerische Angriffe. |
| `vi_mantel_druckerschurz` | mantel | Ermittlung | `max_nerves` = 8: +8 maximale Nerven.; Noch umzusetzen: 20 % weniger Schnittschaden, auf den eingehenden Schnittanteil vor Rundung. Kein Schutz gegen Dampf, Sturz oder Namenverlust. |
| `vi_mantel_dampfmantel` | mantel | Kampf | `max_hp` = 8: +8 maximales Leben.; Noch umzusetzen: 25 % weniger Hitze- und Dampfschaden; überlappende Kennzeichnungen zählen einmal. Kein Schutz gegen andere Schadensarten. |
| `vi_mantel_reisepelerine` | mantel | Reise | `carry` = 10: +10 Pfund Tragkraft. |
| `vi_mantel_archivrobe` | mantel | Soziales | `lock_bonus` = 12: Amtsschlösser verlangen 12 Ansehen weniger.; `honor_loss` = 0.7: 30 % weniger Ansehensverlust. |
| `vi_amulett_bleiletter` | amulett | Ermittlung | `vision_cost` = 0.7: Geistsicht kostet 30 % weniger Nerven. |
| `vi_amulett_pfirsichkern` | amulett | Soziales | `calm_decay` = 0.75: Unruhe klingt 25 % langsamer ab.; `max_nerves` = 8: +8 maximale Nerven.; Noch umzusetzen: Außerhalb des Kampfes alle 10 aktiven Spielsekunden +1 Leben bis zum Höchstwert. Menüzeit zählt nicht; Anlegen startet keinen sofortigen Heilimpuls. Der soziale Schwerpunkt ist geduldiges Zuhören, keine erzwungene Zustimmung. |
| `vi_amulett_grenzsteinsplitter` | amulett | Reise | `dodge_window` = 1.25: Ausweichfenster +25 %.; Noch umzusetzen: Bei ausdrücklich fliehbaren Begegnungen +20 Prozentpunkte auf eine spätere Fluchtprobe, höchstens 95 %. Der Bestand kennt nur erlaubte/verbotene Flucht und braucht hierfür eine echte Probe; niemals einen Bossausgang stillschweigend öffnen. |
| `vi_amulett_rohrpostkapsel` | amulett | Kampf | Noch umzusetzen: Einmal je Kampf den ersten schadensverursachenden Treffer gegen den Träger vollständig abwehren. Nur dessen Ladung verbrauchen; An- und Ablegen sowie Laden eines Spielstands geben keine zusätzliche Ladung. |

Referenz im aktuellen Gesamtbestand ist der Dunscar-Steinmetzfäustel (`k3h_faeustel`) mit `atk: 15`; daneben bleibt die Ossuarklinge mit `atk: 10` und `occult: 1.5` der Okkult-Vergleich. Die Obergrenze für die neue rohe Angriffsstärke beträgt damit 18,75. BL bleibt bewusst bei höchstens 12 und vergibt keinen zusätzlichen Okkult-Multiplikator: Die Waffen sind spezialisierte Alternativen mit schwächerem Grundschaden, keine pauschalen Verbesserungen des Fäustels. Die Schere teilt ihren Gesamtschaden, sie verdoppelt ihn nicht. Tempo und Sonderwirkungen sind noch nicht im Waffenformat vorhanden; ihre Gesamteffektivität muss nach Implementierung zusätzlich gegen die Referenz geprüft werden.

`k3o_stillring` ist tatsächlich ein Artefakt (Ausweichfenster 1,2 und Fassungserholung 0,6), keine Kleidung. Der Grenzsteinsplitter steigert das Fenster auf 1,25; die Bleiletter senkt Sichtkosten auf 0,7 gegenüber vorhandener Kleidung mit 0,85 und der Prüflinse mit 0,75. Tragkraft +10 statt vorhandener +6, Leben +10 statt +5 bilden die nächste Stufe. Nicht jedes Stück übertrifft jeden alten Bonus: Einsatzrollen und Nachteile bleiben relevant. `k3_pruefungen/items.json` ist leer; daraus werden keine erfundenen Vergleichswerte abgeleitet.

## Waffen – Zielwerte nach Ergänzung des Codes

`atk` und Gewicht/Preis sind bereits bestehende Felder. Alle weiteren Angaben dieser Tabelle sind Spezifikation, keine derzeit aktive Wirkung. Prozentwerte beziehen sich auf den normalen Angriff; Tempo verändert keine Anzahl von Zügen.

| Waffe | atk | Tempo | Trefferfenster | Treffer und Besonderheit |
|---|---:|---:|---:|---|
| Setzhaken | 9 | 120 % | 110 % | 1 Treffer |
| Bleihammer | 12 | 80 % | 90 % | 1 Treffer |
| Veredelungsschere | 10 | 100 % | 100 % | 2 × 50 % Gesamtschaden; Rüstung einmal |
| Dampfrohr | 11 | 90 % | 100 % | 1 Treffer; 30 % Hitze, 70 % stumpf |
| Kutschpeitsche | 9 | 110 % | 105 % | 1 Treffer; Reichweite 2 statt 1; Vorrang nur bei Initiativegleichstand |
| Richterstab | 10 | 95 % | 100 % | 1 Treffer; nach Parade nächster Treffer desselben gegnerischen Angriffs × 0,8 |

## Preise und Gewicht

Preise in Schilling, Gewicht in den bestehenden Traglast-Einheiten. Kauf ist ein Richtpreis, keine Platzierung; nur die 18 Handelswaren stehen in den drei Vorratsläden. Verkauf ohne passive Boni, nach der echten Formel `Math.round(Basis * 0.5)`. `handel.sell_prices` speichert deshalb den Basiswert, nicht den bereits halbierten Erlös. Schlüsselstücke sind unverkäuflich. Positive Preise und halber Erlös vermeiden einen Ankauf-/Verkaufskreislauf ohne fremde Boni.

| ID | Name | Gewicht | Kauf/Richtpreis | Verkauf |
|---|---|---:|---:|---:|
| `vi_hut_setzerkappe` | Setzerkappe | 1 | 100 | 50 |
| `vi_hut_kurhaube` | Kurhaube | 0.5 | 110 | 55 |
| `vi_hut_zylinder_vermesser` | Vermesserzylinder | 1 | 130 | 65 |
| `vi_hut_fuhrmannshut` | Fuhrmannshut | 1.2 | 105 | 53 |
| `vi_mantel_druckerschurz` | Druckerschurz | 3 | 165 | 83 |
| `vi_mantel_dampfmantel` | Dampfmantel | 3.5 | 180 | 90 |
| `vi_mantel_reisepelerine` | Reisepelerine | 2 | 140 | 70 |
| `vi_mantel_archivrobe` | Archivrobe | 2 | 170 | 85 |
| `vi_amulett_bleiletter` | Bleiletter am Band | 0.3 | 180 | 90 |
| `vi_amulett_pfirsichkern` | Geschnitzter Pfirsichkern | 0.2 | 175 | 88 |
| `vi_amulett_grenzsteinsplitter` | Grenzsteinsplitter | 0.5 | 160 | 80 |
| `vi_amulett_rohrpostkapsel` | Rohrpostkapsel am Band | 0.3 | 195 | 98 |
| `vi_waffe_setzhaken` | Setzhaken | 1.5 | 145 | 73 |
| `vi_waffe_bleihammer` | Bleihammer | 5 | 210 | 105 |
| `vi_waffe_veredelungsschere` | Veredelungsschere | 2 | 195 | 98 |
| `vi_waffe_dampfrohr` | Warmes Dampfrohr | 3.5 | 185 | 93 |
| `vi_waffe_kutschpeitsche` | Kutschpeitsche mit Bleiknoten | 1.5 | 190 | 95 |
| `vi_waffe_richterstab` | Richterstab | 2.5 | 205 | 103 |
| `vi_v_setzerbrot` | Setzerbrot | 0.4 | 16 | 8 |
| `vi_v_terrassentee` | Terrassentee | 0.4 | 22 | 11 |
| `vi_v_durchschlagpapier` | Durchschlagpapier | 0.1 | 24 | 12 |
| `vi_v_rohrpostmarke` | Rohrpostmarke | 0.1 | 18 | 9 |
| `vi_v_pfirsichsud` | Pfirsichsud | 0.4 | 36 | 18 |
| `vi_v_wurzelpastille` | Wurzelpastille | 0.1 | 20 | 10 |
| `vi_v_dampfkompresse` | Dampfkompresse | 0.3 | 24 | 12 |
| `vi_v_kurkarte` | Blaue Kurkarte | 0.1 | 20 | 10 |
| `vi_v_wegzehrung` | Wegzehrung im Tuch | 0.6 | 20 | 10 |
| `vi_v_laternenoel_klar` | Klares Laternenöl | 0.3 | 28 | 14 |
| `vi_v_zollsiegel` | Zollsiegel | 0.1 | 30 | 15 |
| `vi_v_riechsalz_stark` | Starkes Riechsalz | 0.2 | 45 | 23 |
| `vi_v_nebelkerze` | Nebelkerze | 0.2 | 32 | 16 |
| `vi_v_schlafpulver` | Schlafpulver | 0.1 | 30 | 15 |
| `vi_v_schreibfeder_eisen` | Eiserne Schreibfeder | 0.2 | 26 | 13 |
| `vi_v_bitterwasser` | Bitterwasser | 0.4 | 24 | 12 |
| `vi_art_das_leere_tuerschild` | Das leere Türschild | 0.6 | 360 | 180 |
| `vi_art_der_erste_durchschlag` | Der erste Durchschlag | 0.1 | 380 | 190 |
| `vi_art_die_warme_postkarte` | Die warme Postkarte | 0.1 | 340 | 170 |
| `vi_art_der_falsche_fahrplan` | Der falsche Fahrplan | 0.2 | 400 | 200 |
| `vi_art_die_gaertnerschnur` | Die Gärtnerschnur | 0.2 | 370 | 185 |
| `vi_art_der_stille_stempel` | Der stille Stempel | 0.4 | 350 | 175 |
| `vi_art_das_bremserseil` | Das Bremserseil | 1.2 | 390 | 195 |
| `vi_art_die_kurglocke` | Die Kurglocke | 0.4 | 420 | 210 |
| `vi_m_bleiletter` | Ausgesonderte Bleilettern | 1 | 14 | 7 |
| `vi_m_tintenkuchen` | Tintenkuchen | 0.3 | 16 | 8 |
| `vi_m_rohrpostkapsel_leer` | Leere Rohrpostkapsel | 0.5 | 18 | 9 |
| `vi_m_registerband` | Registerband | 0.1 | 10 | 5 |
| `vi_m_terrassenruss` | Terrassenruß | 0.3 | 8 | 4 |
| `vi_m_seilbahnfett` | Seilbahnfett | 0.5 | 20 | 10 |
| `vi_m_pfirsichholz` | Pfirsichholz | 0.8 | 16 | 8 |
| `vi_m_glasscherbe_beschlagen` | Beschlagene Glasscherbe | 0.2 | 12 | 6 |
| `vi_m_wurzelfaser` | Warme Wurzelfaser | 0.2 | 18 | 9 |
| `vi_m_kupferrohrstueck` | Kupferrohrstück | 0.7 | 22 | 11 |
| `vi_m_kurwaesche` | Saubere Kurwäsche | 0.5 | 12 | 6 |
| `vi_m_sudflasche` | Leere Sudflasche mit Rest | 0.3 | 10 | 5 |
| `vi_m_wegzoll_marke` | Alte Wegzollmarke | 0.1 | 10 | 5 |
| `vi_m_kutschenlaterne` | Beschädigte Kutschenlaterne | 0.8 | 24 | 12 |
| `vi_m_landkarte_rest` | Landkartenrest | 0.1 | 14 | 7 |
| `vi_m_pferdehaar` | Pferdehaar | 0.1 | 8 | 4 |
| `vi_m_grenzsteinmoos` | Grenzsteinmoos | 0.1 | 8 | 4 |
| `vi_m_predigerzettel` | Verwitterter Predigerzettel | 0.1 | 6 | 3 |
| `vi_k_cw_randkorrektur` | Idas Randkorrektur | 0.1 | – | – |
| `vi_k_cw_ungestempelter_durchschlag` | Veras ungestempelter Durchschlag | 0.1 | – | – |
| `vi_k_cw_falsche_quittung` | Hesks falsche Quittung | 0.1 | – | – |
| `vi_k_cw_pfandzettel` | Lotties Pfandzettel | 0.1 | – | – |
| `vi_k_cw_heizungsrohr_skizze` | Bexleys Rohrskizze | 0.1 | – | – |
| `vi_k_cw_streiktopf_auszug` | Pritchs Auszugsblatt | 0.1 | – | – |
| `vi_k_bh_postkarte_verworfen` | Orlas verworfene Postkarte | 0.1 | – | – |
| `vi_k_bh_pflanzenkapsel` | Versiegelte Pflanzenkapsel | 0.2 | – | – |
| `vi_k_bh_einweisung` | Felix’ Einweisung | 0.1 | – | – |
| `vi_k_bh_beetschild` | Umgedrehtes Beetschild | 0.1 | – | – |
| `vi_k_bh_namensheft` | Ennas Namensheft | 0.1 | – | – |
| `vi_k_bh_wurzelzeichnung` | Dipples alte Wurzelzeichnung | 0.1 | – | – |

## Handelswaren: Rollen und Verwendung

Materialien nutzen das vorhandene `kind: trophy`; sie sind keine Kernzutaten. Die folgenden Keime sind textliche Anknüpfungen für BJ, keine existierenden Quest-Referenzen oder verpflichtenden Lieferaufträge.

| ID | Verkaufende Rolle | Ankaufende Rolle | Verwendung / möglicher Keim |
|---|---|---|---|
| `vi_m_bleiletter` | Druckereibedarf | Setzerei | Unbrauchbare Lettern als Metall zurückgeben; keine Namenanker daraus ableiten. |
| `vi_m_tintenkuchen` | Druckereibedarf | Druckergesellen | Eine kleine Nachtschicht mit Druckerschwärze versorgen; mögliche Hilfslieferung für Pritchs Umfeld. |
| `vi_m_rohrpostkapsel_leer` | Druckereibedarf | Rohrpostwerkstatt | Dichtungen einer leeren Zustellkapsel prüfen; nie ein bereits versandtes Dokument daraus erfinden. |
| `vi_m_registerband` | Druckereibedarf | Buchbinderei | Lose Lagen verschiedener Haushalte getrennt binden; möglicher Werkstattkeim bei Crayford. |
| `vi_m_terrassenruss` | Druckereibedarf | Restaurierungswerkstatt | Rußschichten vergleichen oder einfach als Schwärzemittel verkaufen; kein automatischer Fallbeweis. |
| `vi_m_seilbahnfett` | Druckereibedarf | Seilbahnwerkstatt | Eine schwergängige Frachtbremse warten; keine neue Strecke damit freischalten. |
| `vi_m_pfirsichholz` | Gartenbedarf | Gartenwerkstatt | Stützen für gewöhnliche Setzlinge schnitzen; möglicher Lieferkeim bei Vellish. |
| `vi_m_glasscherbe_beschlagen` | Gartenbedarf | Glaserei | Dichtungen an Gewächshausfenstern vergleichen; kein Beleg für eine bestimmte Patientenstimme. |
| `vi_m_wurzelfaser` | Gartenbedarf | Botanische Werkstatt | Eine abgetrennte Faser zeichnen lassen; keine Kernzutat und keine verwertbare Personenprobe. |
| `vi_m_kupferrohrstueck` | Gartenbedarf | Rohrwartung | Ein kleines Leck in einer gewöhnlichen Leitung abdichten; möglicher Reparaturkeim bei Malkin. |
| `vi_m_kurwaesche` | Gartenbedarf | Wäscherei | Frische Bettwäsche an eine Wärmestube liefern; kein Zugang zu Patientenakten. |
| `vi_m_sudflasche` | Gartenbedarf | Flaschenrücknahme | Flaschen reinigen und Glas zurückgewinnen; Rest nicht als Heilmittel verabreichen. |
| `vi_m_wegzoll_marke` | Reisebedarf | Zollsammlung | Alte Marken nach Ausgabeort ordnen; kein gültiger Gebührenersatz. |
| `vi_m_kutschenlaterne` | Reisebedarf | Kutschenwerkstatt | Gesprungenes Glas ersetzen; möglicher Reparaturkeim der Kutscherin. |
| `vi_m_landkarte_rest` | Reisebedarf | Kartenwerkstatt | Zeichnungen von Wegen vergleichen; mögliche Ergänzung für die Kartenzeichnerin, keine automatische Schnellreise. |
| `vi_m_pferdehaar` | Reisebedarf | Seilerei | Bürsten ausbessern und kleine Schnüre flechten; keine magische Bindung. |
| `vi_m_grenzsteinmoos` | Reisebedarf | Naturkundlicher Ankauf | Moos trocken vergleichen; möglicher Beobachtungskeim ohne Beweis für den rechtmäßigen Grenzverlauf. |
| `vi_m_predigerzettel` | Reisebedarf | Papierankauf | Eine Predigtfassung besprechen; möglicher Gesprächskeim beim Wanderprediger, keine Wahrheitsprüfung. |

## Prüfung

Vom Repository-Stamm: `node docs/story/vorrat_items/pruefen.mjs`.
Die Prüfung lädt den bestehenden Inhalt über `tests/helpers.js`, prüft die feste ID-Liste, Kategorien, Felder, Preise, Auszüge, Dialog-Erreichbarkeit, Leselängen und Handel. Kleine isolierte Laufzeitproben prüfen vorhandene Ausrüstungseffekte und Verkaufspreise. Sie bestätigen ausdrücklich nicht die noch fehlenden Mechaniken.
