# CF: Calderwicks Nebenaufträge und Stadtleben

Datenlieferung für Kapitel 4, ohne Laufzeit-Einbau. Acht Aufträge führen konkrete BJ-Keime weiter, vier sind neu. Keine Hauptfährte verlangt eine CF-Entscheidung. Die geplanten 20 bis 40 Minuten je Auftrag beruhen auf Wegen, Quellenvergleich und Rückkehr; sie sind noch keine gemessenen Spielzeiten.

| Quest | BJ-Keim | Start | Zielzeit | Schritte | Entscheidung |
|---|---|---|---|---|---|
| cwn_zwei_teller | bj_keim_cw_noel_bellcross | Akt 1 | 30 Min. | 4 | Die Zeugnisse offen zur Rechnung legen. / Die Zeugnisse vertraulich hinterlegen. |
| cwn_brotdose | bj_keim_cw_pritch | Akt 2 | 30 Min. | 4 | Den Satz der Eigentümerin zurückgeben. / Den Namen den Gesellen für den Aushang geben. |
| cwn_falscher_pfand | bj_keim_cw_wicksend | Akt 2 | 35 Min. | 4 | Die Gegenstände einzeln zuordnen. / Die Sammelrechnung bestehen lassen. |
| cwn_klopfzeichen | bj_keim_cw_bexley | Akt 2 | 25 Min. | 4 | Mina selbst den Eintrag berichtigen lassen. / Nur das persönliche Klopfzeichen vereinbaren. |
| cwn_durchschlaege | bj_keim_cw_darnell | Akt 3 | 30 Min. | 4 | Die anonymen Bestätigungen bei Vera bündeln. / Jede Bestätigung in ihrem Haushalt lassen. |
| cwn_falsche_adresse | bj_keim_cw_hesk | Akt 3 | 35 Min. | 4 | Offenen Schutztransport mit Zeugen organisieren. / Den verdeckten Weg zur Werkstatt sichern. |
| cwn_restaurierung | bj_keim_cw_malliver | Akt 4 | 35 Min. | 4 | Befund und Unsicherheit gemeinsam veröffentlichen. / Das Original versiegelt bei zwei Zeugen sichern. |
| cwn_warnbrief | bj_keim_cw_crayford | Akt 2 | 20 Min. | 4 | Eine persönliche Rückmeldung vereinbaren. / Ein öffentliches Übergabeprotokoll verlangen. |
| cwn_seilbahn | neu | Akt 3 | 30 Min. | 4 | Den geprüften Seitensteg für Fußgänger freigeben. / Den Steg als Wartungsreserve schließen. |
| cwn_brief_aus_dunscar | neu | Akt 1 | 25 Min. | 4 | Offen über Verantwortung und Grenzen schreiben. / Nur Rezept und Empfang bestätigen. |
| cwn_telegramm_kettlegate | neu | Akt 4 | 35 Min. | 4 | Geprüfte Kopien an Marlowe schicken. / Originale unter örtlichen Zeugen verwahren. |
| cwn_letzte_terrasse | neu | Akt 5 | 40 Min. | 5 | Eine freiwillige, vertrauliche Küchenliste sichern. / Nur den anonymen Versorgungsbedarf melden. |

## Umfang und Format

- 12 Nebenaufträge mit 24 Ausgängen, 37 Hinweisen und 37 Fakten. 60 Schilling und ein BL-Gegenstand je Abschluss; der gewählte Ausgang gibt zusätzlich Geld, Ehre oder Beziehung/Bindung. Belohnungen werden nicht über Wiederholungsgespräche ausgezahlt.
- 8 neue Einwohner mit je 6 Knoten und Tag-/Nacht-Plätzen, dazu Silas Rook als Aufzugswärter. 9 eigene Figuren insgesamt; keine BJ-Figur wird kopiert.
- 60 Gerede-Sätze: 2 je Terrasse und Akt, ohne überlappende Aktfenster. 25 zusätzliche Lesestücke, 8 Meldungen, Stadtleben auf 12 benutzten Karten.
- 24 Ambient-Koop-Zeilen in 12 Zweizeilern; zusätzlich 4 Questzweige mit je 3 Sprechakten. Die zweite Stimme hat jeweils Variante `a`/`b`, ausgewählt durch den bestehenden Koop-Renderer.
- 32 Platzierungsobjekte: Aufzugswärter, Saisonstand, Pfiff-Paket und 29 Quest-Lesestellen. Die 25 freien Lesestücke kommen separat dazu. Einwohner werden ausschließlich aus `einwohner.json` geladen, damit sie nicht doppelt erscheinen.
- 14 JSON-Dateien. `items.json` und `encounters.json` sind bewusst leer. BL liefert alle Gegenstände, BH den einzigen optionalen Kampf.

## Entscheidungen und Kanon

Noels Topfgriff, Pritchs Löffelkerbe, Lotties Krugreparatur, Bexleys Heizleitung, Veras Kapselnaht, Hesks reparierter Wagen, Mallivers Randprobe und Klammers dreifach gebundener Rezeptband tragen die acht BJ-Keime weiter. Idas frühere Mahlzeit verrät weder ihren Aufenthaltsort noch ihre spätere Entscheidung. Der neue Warnbrief ist kein wiederaufgelegter Ida-Brief und nimmt Klammers Geständnis nicht vorweg. Die restaurierte Akte und Marlowes Telegramm beginnen erst nach Akt III. Wetherby bleibt späterer Käufer der Methoden, nicht nachträglicher Urheber der Kettlegater Fälle. Die Schleierschwester bleibt unbekannt.

Pfiffs vier Pakete unterscheiden Feierabend, Stilllegung, Gegenstimme und Vollzähligkeit. Keine Variante setzt ein anderes Ende oder macht dessen Folgen rückgängig. Persönliche Pfiff-Bindung gibt nur die ehrliche Antwort. Neue Aufträge werden nach `kapitel4_done` nicht angeboten; vor dem Kapitelabschluss erledigen. Der Warnbrief kann nur vor Akt III angenommen werden, ein bereits angenommener Auftrag bleibt bis zum Kapitelende abschließbar.

## Einbau

1. BH/BJ/BL zuerst als eigene Packs laden. CF benutzt ihre IDs, keine kopierten Definitionen.
2. Standarddateien über `applyQuestPack` laden; Zusätze an BJ-Dialoge ergänzen deren vorhandenen Hub. `lesestuecke` getrennt wie Lore, `einwohner` wie BD laden. Die Einwohner NICHT nochmals aus einer generierten NPC-Platzierung importieren.
3. `gerede`, `zeitung`, `leben`, `geplauder` wie die K3-Packs registrieren. Den Anzeiger und neue Ambient-IDs separat freischalten; siehe offene Punkte.
4. CD muss die vorgeschlagenen Tiles gegen Wände, Wege, Türen und vorhandene Objekte prüfen. Sie liegen innerhalb des kleinsten vereinbarten Innenraums, sind aber noch keine bestätigten Laufwege. Questziele bei Bewohnern nennen ihren Tagesplatz; nachts stehen diese an den dokumentierten Nachtplätzen. Hinweise bleiben an beiden Plätzen erreichbar.
5. Der Saisonstand ist ein vorhandenes Dialogformat mit `takes_money`/`gives_items`, keine neue Händler-API. Selma trägt Rolle Markt. Pro Jahreszeit genau ein reserviertes Stück je Spielstand. Mit Sammelpfand kostet es abgerundet 80 Prozent des BL-Grundpreises. Einkauf ist tagsüber möglich; nach Kauf bleibt die Saisonoption gesperrt. Kein jährlicher Waren-Reset wird behauptet.
6. Kampf wird im tatsächlichen Laufzeitfeld `combat` ausgelöst, nicht im nicht ausgewerteten Aufgabenbegriff `encounter`. Er kann einmal freiwillig versucht werden und ist für die Quest unnötig. Keine BH-Werte werden überschrieben.

## Prüfung

`node docs/story/k4_nebenquests/pruefen.mjs` prüft JSON, IDs, Verweise, Textlängen, Verträge, Zählungen, Dialogzusätze und beide Ausgänge aller Quests mit dem echten `GameState`. Außerdem prüft es vier Paketvarianten, acht Saisonpreise, Belohnungssperren und Koop-Bedingungen.

`node docs/story/k4_nebenquests/pruefen.mjs --strict` verlangt zusätzlich vorhandene CC/CD-Karten und Flagquellen. Auf dem Lieferstand fehlen diese noch; der strikte Lauf endet deshalb absichtlich mit Status 1. Lokales OK bedeutet keine vollständige Kapitel-Integration. Kein Spielcode wird geändert.
