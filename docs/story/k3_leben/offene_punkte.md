# Einbindung und offene Punkte

> **Stand nach dem Einbau:** Die Daten liegen in `src/data/packs/k3_leben/` und werden über `src/data/index.js` geladen. Eingebaut sind: der Dunscar-Stadtgegnerausschnitt mit eigener Niederlagen-/Elitenregel (`buildContent.cityContent` je Paket), die Einwohner mit Tag-/Nachtplatz über das Nachtflag `k3h_nacht` (`src/core/Clock.js`, Umbau in `buildContent.withPackLeben`), der Tageswechsel in der Welt (`WorldScene.applyClock`: Figuren, Gegner, Aufseher, Tiere), die zivilen Aufseher (`src/core/Aufsicht.js`, `world/Patrols.js` mit `kind: aufsicht`), die Gegnerflucht nach drei Runden (`flees_after`/`escape_text` in Combat.js, Ergebnis `escaped`), Schichtgänger mit der Figur des Einwohners (`figur` am Roamer), Phasen, Gerede, Zeitung, Wetter/Tiere (`world/DunscarLife.js` mit BA-Sheets) und die BA-Stände. BE-Figuren, Kopfgeldgegner, Bestiarium und Steckbriefe sind in `assets.js` eingetragen. Der Schienenläufer hat 54 statt 162 Leben, damit er in drei Runden stellbar ist (Seq 6 mit Doppelschlag). **Offen:** Nachhall-Begleiter des Walzenhehlers (kein Mehrgegnerkampf) und der Lese-Snapshot gekaufter Zeitungsausgaben (Belege sind Schlüsselgegenstände).

Ursprüngliche Hinweise des Pakets (Stand vor dem Einbau):

## Laden ohne Doppelungen

- Acht Standarddateien wie andere Questpakete laden. Die NPC-Positionen in `platzierung.json` sind **Tagesvorschläge**, nicht dauerhaft zusätzlich zu `einwohner.json` einzubauen. Beim Zeitwechsel dieselbe Identität versetzen/entfernen.
- `stadtgegner_dunscar.json` entspricht dem Aufbau von `src/data/stadtgegner.json`; der aktuelle Loader kennt jedoch nur den globalen Stadtgegnerbestand. Den Dunscar-Ausschnitt mit dessen eigener Niederlagen-/Elitenkonfiguration hinzufügen; Kettlegates Vorgaben nicht überschreiben. Items stehen ausschließlich in `items.json`, Gegner ausschließlich im Stadtgegnerausschnitt. `encounters.json` bleibt deshalb leer.
- Brettposition im Stadtgegnerausschnitt und in `platzierung.json` beschreibt dasselbe Objekt `kopfgeldbrett_ds`: genau einmal einfügen. Acht NPCs nicht zusätzlich als Kampf-Roamer erzeugen.
- `phasen.json` wie die vorhandenen AS-Folgeabschnitte laden. Der erste Signalbrecher setzt nur `k3k_signalbrecher_phase1_done`. Die Ansprechstelle startet den zweiten Kampf. Flucht/Niederlage lässt diesen Wiedereinstieg offen; nur Phase 2 setzt den Kopfgeldsieg. Eine nahtlose Inszenierung ist optional, kein erfundenes `next_phase`-Feld.
- Die `sheet`-Werte `enemy_k3k_*` sind Zielregistrierungen für BE, keine bereits vorhandenen Grafiken. `grafikwuensche.md` nennt Rückfallgrafiken und Maße.

## Tagesplan und Einwohner

`einwohner.json` ist eine Liste von bedingten Varianten derselben acht IDs. Erst `visible_if` mit `GameState.meets()` auswerten, dann `zeit.tag` oder `zeit.nacht`. Pro Figur passt genau eine Variante. `null` bedeutet abwesend. Name/Palette/Bewegung sind gemeinsame Figureneigenschaften, kein neuer NPC pro Variante.

Die einzige neue Zeitstruktur ist das ausdrücklich verlangte `zeit`. Roamers und zivile Spaziergänger müssen dasselbe Signal wie `MusicDirector.js` nutzen: `Math.floor(playTime / DAY_NIGHT_SECONDS) % 2`, `DAY_NIGHT_SECONDS = 900`. Keine zweite Uhr, kein Rücksetzen beim Kartenwechsel; Spielstand mit demselben Spielzeitwert wiederherstellen. Tageswechsel wartet laufende Dialoge/Kämpfe ab und baut danach die sichtbaren Figuren neu auf.

- Ab Akt IV bis Kapitelende: Wagenputzer/Steinmetzgeselle nachts als Gesprächspartner abwesend; je ein nächtlicher `schichtgaenger` an ihren Arbeitsorten. Die Reihenfolge dieser zwei Roamer im Ausschnitt entspricht Wagenputzer, Geselle. Lebende werden ausschließlich bewusstlos, keine Tötungsbeschreibung. Beim Rendern ihre BE-Identität erhalten.
- Nach Feierabend: beide nachts daheim im Arbeiterbogen, auch nach dem Superboss. Stilllegung/Gegenstimme ebenso ohne Zwangsschicht.
- Vollzählig: alle acht nachts abwesend, tags dienstliches Gerede. Ein Sieg über die Unterschicht hebt dieses Ende nicht auf.
- Sichere Nische: Kalkjunge bleibt am Schwellenring und zeigt nur den geschützten Speisewagenzugang. Flag `k3e_nische_ds_schwellenring` markiert Orientierung, verleiht selbst keine Immunität und öffnet keinen neuen Schallweg. Bei späterem Versetzen braucht er eine ortsbezogene Wegauskunft; keine erfundenen BN-Nischen-IDs.
- Dienste ohne eigene Mechanik bleiben kleine Textleistungen. Kartoffeln kosten bei jedem tatsächlichen Kauf 3 Schilling und geben 5 Nerven. Teetausch und Mantelbürsten sind einmalig. Kein Dienst vergibt Beweise, Fährten oder fremde Flags.

## Kopfgeld und Kampfbesonderheiten

Alle sechs Aufträge starten ausschließlich über das Brett. `on_win` setzt explizit `won_kopfgeld_ds_<gegner>`, da die kanonischen Gegner-IDs mit `k3k_` beginnen. Diese sechs Siegflags sind die ausdrücklich verlangte Ausnahme vom Präfix; alle sonstigen neuen Flags beginnen mit `k3e_`/`k3k_`. Trophäen werden über `first_win` direkt ins Inventar gelegt, damit eine verlorene Bodenbeute keine Auszahlung sperrt. Sie sind unverkäufliche Schlüsselgegenstände. Am Brett werden sie verbraucht; bezahlte Aufträge sind verborgen und nicht erneut annehmbar. `reward.gives_money: 0` verhindert die sonst zusätzliche Standard-Nebenquestprämie.

- Schienenläufer nur nachts. **Noch keine Gegnerflucht nach drei Runden in Combat vorhanden.** Nach der dritten vollständig abgeschlossenen Kampfrunde, sofern kein Spielersieg vorliegt, Begegnung ohne Sieg, Trophäe oder Questfortschritt beenden. Gegner bleibt beim nächsten Nachtbesuch erneut stellbar. Ein Sieg in Runde 3 vor der Flucht zählt. Kein spekulatives Datenfeld angelegt.
- Lohnfälscher: Vor Kontaktkampf den Dialog `k3k_lohnfaelscher` öffnen, vorhandene Ansprechstelle bleibt zugänglich. Niemals einen sofort angreifenden Roamer auf die friedliche Option setzen. Faden Sequenz 7 oder besser löst ihn friedlich; alle anderen können kämpfen oder gehen. Beide Wege setzen denselben Siegflag und dieselbe Trophäe; keine Änderung der echten Hauptstory-Lohnliste.
- Staubschmuggler: `elite_chance: 0.2`, HP ×1,35 und Angriffsschaden ×1,2 wie Stadtgegner. Roamer absichtlich kein `boss`, sonst deaktiviert Roamers die Eliteauswahl. Das gemeinsame Siegflag entfernt auch die Elite. Beim Einfügen `first_win`/`on_win` beider Varianten erhalten, keine doppelte Trophäe.
- Walzenhehler: **Begleiteraufruf zu Kampfbeginn fehlt als unterstütztes Gegnerfeld.** Einen vorhandenen `nachhall` als Gegnerbegleiter aufrufen, nicht neu definieren, keine erste Runde abwarten. Der Begleiter darf weder eine zweite Kopfgeldbelohnung noch ein fremdes Hauptstory-Flag geben. Bis dieser Kampfmodus vorliegt, diese Besonderheit nicht als implementiert ausgeben.
- Signalbrecher: Einstieg am oberen Rand der Rufschlucht (kleine y-Koordinate), ab Akt IV. Der Randzugang muss zu diesem Zeitpunkt über den bestehenden Fußweg erreichbar bleiben, unabhängig vom tieferen Vielrufer-Kampf. Zwei gespeicherte Abschnitte mit sicherem Rückzug. Erste Phase niemals mit der Kopfgeldtrophäe belohnen.

## Zwei Aufseher ohne Polizei

`streifen.json` verwendet das tatsächlich bestehende Kartenfeld `patrols` mit `route`, `speed`, `wait`; nicht `patrol`. Ein Aufseher patrouilliert nachts am Endbahnhof, einer am Signalhang. Es sind insgesamt zwei, keine vier. Das gewünschte zivile Verhalten braucht einen separaten Sichtkontakt-Handler:

1. Nur nachts und außerhalb von Dialog/Kampf; Sichtkegel wie Wexmoor, durch Wände blockiert.
2. Besitz von **entweder** `k3a_bahnkarte` **oder** `k3a_aufsichtsmarke` befreit vom Wegschicken. Keine `requires_items`-Liste mit beiden, diese wäre logisch UND.
3. Sonst einmal Nerven −5 und Reise nach `ds_speisewagen`, Spawn `default`; Text: „Ohne Berechtigung geht es hier nachts nicht weiter. Kommen Sie. Im Speisewagen ist Licht.“
4. Keine Fahndungsstufe, Geldstrafe, Beschlagnahme, Zelle oder Kampf. Bei erneutem Laden des Speisewagens keine zweite Bestrafung. Die vorhandene Wexmoor-Polizei nicht global aktivieren.

## Zeitung und Gerede

- `zeitung.json` an die bestehende `dunscarer_kalkblatt` anhängen. Keine neue Zeitungsdefinition, keine zweite ID. Anzeigen sind normale Meldungen mit `Anzeige:` im Titel: `kind: anzeige` ist kein vorhandener Vertrag. `kurz` bleibt ein Array.
- Lotte verkauft pro Akt/Ende eine Ausgabe für einen Schilling. Ein Kauf erzeugt einen eigenen Ausgabe-Beleg; der vorhandene automatische Zeitungsmechanismus ersetzt keinen bezahlten Verkauf. Beim Kauf die zu diesem Zeitpunkt freigegebenen Meldungen/Anzeigen als lesbaren Ausgabestand speichern und über den Beleg wieder öffnen. **Diese Snapshot-/Leseanbindung fehlt noch.** Spätere Kopfgeldmeldungen erscheinen in der laufenden Zeitung; sie dürfen ältere gekaufte Ausgaben nicht nachträglich umschreiben. Endausgaben bleiben nach dem Superboss kaufbar.
- `gerede.json` entspricht dem vorhandenen Stadt/Kartenformat; keine erfundenen Sprecherfelder. Für figurengebundene Sprechblasen auf den passenden Dialogzustand zugreifen, nicht eine fremde Bewohnerzeile zufällig zuordnen. Varianten ohne Dialogmenü über die AE-Sprechblasen zeigen. Alte Aktzeilen müssen nach Ende verborgen bleiben.

## Tiere, Wetter und Deko (BA)

`leben.json` übernimmt ausschließlich die vorhandenen `weather`-/`animals`-Felder als JSON. Der Renderer legt die Bedeutung der festen IDs fest: `kalkstaub` nur tagsüber, `wind` immer, `nachtnebel` nur nachts; `ds_motte` nur nachts, übrige Tiere tagsüber. Drei Kalkziegen auf den Bruchstufen; Schwalben fliegen in Bögen vor dem Runddepot am Schwellenring, **nicht im stillen Innenraum**. Krähen fliegen bei Annäherung auf. Staubteufel bleiben kleine Deko-Wirbel, keine Gegner.

Alle Innenräume, beide Nachtzug-Innenräume und die Rufschlucht haben leere Zuordnungen. Unterschicht ausschließlich Nachtnebel, keine Tiere und kein Wind. Tier- und Wetterregionen erst nach BA-Manifest zuordnen, keine Framekoordinaten raten. Stände sind nicht blockierende `kind: read`-Objekte; ihre Grafiken erst nach BA zuordnen. Sie eröffnen keine zusätzlichen Läden. Marktgeräusche leise über die vorhandene Audioanbindung ergänzen, keine unbestätigten Audio-IDs.

Parallelpakete BC/BN/BA/BE können später dieselben freien Flächen wählen. Prüfer nach Zusammenführung erneut ausführen; eine freie Kachel auf diesem Basisstand ist keine Reservierung gegenüber gleichzeitig entstehenden Paketen.
