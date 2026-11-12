# DH – Die Nebelseite

Daten und Grafik für einen getrennten Einbau; kein Laufzeitcode geändert. Basis: `6ccced920b21ee296edba27f20d5215e68b62695`. Die Karte drüben ist eine lokale Ebene derselben Stadt, keine zusätzliche Reisemöglichkeit. Vor dem Nachspiel werden dadurch keine früheren Städte wieder erreichbar.

## Umfang und Dateien

`karten.json`: 15 feste Karten-IDs, Beschreibungen, Originalgeometrie-Referenzen, Weg-/Tür-/Fundortvorschläge, genau 30 einmalige Fundstücke und Gegnerplätze. `stilles_wesen.json`: sechs Stadtfassungen, je 20 Antworten, drei Verweigerungen und ein gemeinsames Tagesbudget. `wesen.json`: fünf Encounter-Datensätze, Stadt-Skalierung als Balancevorschlag, Sonderregeln und acht Gesprächsknoten. `uebergaenge.json`: 20 Ein- und Rückwege. `zeitung.json`, `gerede.json`, `lesestuecke.json`: sechs Meldungen, 30 Gerüchte und sechs frühere Grenzgängerberichte. Gerüchte und Berichte sind Figurenperspektiven, keine objektiven Deduktionen.

Die ursprüngliche Umfangsaussage „drei Karten je Stadt“ widerspricht der ausdrücklichen Liste und dem geforderten Gesamtumfang 15. Geliefert wird die feste Liste mit Verteilung **3/3/3/2/2/2**. Es werden keine zusätzlichen Karten erfunden.

## Originalkarten und Ersatzzuordnungen

| Nebelseite | Originalkarte im geprüften Stand | Einbauhinweis |
|---|---|---|
| ns_altmarkt | altmarkt | direkt |
| ns_sternwarte | sternwarte | direkt |
| ns_katakomben | katakomben | direkt |
| ns_salzmarkt | wx_salzmarkt | `src/data/wexmoor.json` |
| ns_flossfriedhof | wx_flossfriedhof | K2-Orte |
| ns_torfbrueche | wx_torfbrueche | K2-Orte |
| ns_bahnhof | ds_endbahnhof | K3-Orte |
| ns_schwellenring | ds_schwellenring | K3-Orte |
| ns_speisewagen | ds_speisewagen | K3-Orte |
| ns_terrasse_3 | cw_quittungsmarkt | funktional nächster Markt-/Terrassenort; terrasse_3 fehlt |
| ns_landstrasse | reise_landstrasse | K4-Orte |
| ns_kurhaus | bh_speisesaal | nächster vorhandener Kurhaus-Innenraum |
| ns_leitungsplan | bh_verteilanlage | nächster vorhandener Leitungsort |
| ns_zollhafen | docks | Geometrieersatz; CU vm_zollhafen fehlt auf der Basis |
| ns_registerkeller | crypt | Geometrieersatz; CU vm_registerkeller fehlt auf der Basis |

**Varrowmouth-Ersatz ist keine Reise nach Kettlegate:** `docks` und `crypt` dienen ausschließlich als lokal kopierte Geometrievorlage für die beiden Varrowmouth-Ebenen. Die zugehörigen Übergänge dürfen nicht auf den tatsächlichen Kettlegate-Karten installiert werden. Sobald CU verfügbar ist, die beiden Originalreferenzen und Übergangspositionen zusammen auf `vm_zollhafen`/`vm_registerkeller` setzen; anschließend Dimensionen und Laufwege erneut prüfen. Bis dahin diese vier Varrowmouth-Referenzen beim Runtime-Einbau sperren. Die übrigen Aliase sind reguläre Ersatzorte innerhalb der richtigen Stadt.

Alle `position_proposal`, `tile_proposal`, `geometry` und Gegnerplätze sind **Einbauvorschläge**. Die Prüfung bestätigt Grenzen und Herkunft, nicht Kollisionsfreiheit. Der Einbau kopiert die Originalkarte, entfernt Ortswechsel, NPCs, Questtrigger und Beute des Originals, ersetzt nur Grafik und lokale Kollisionen und setzt die beschriebenen Wege/Türen/Fundorte. Kein unveränderter Original-Trigger darf versehentlich auf der Nebelseite laufen. Rückweg, Fundort und stilles Wesen müssen über einen geprüften begehbaren Weg verbunden sein. Gegner bleiben mindestens drei Tiles vom Rückweg entfernt; gegebenenfalls den Vorschlagsplatz verschieben.

## Übergang und Unruhe

Eintritt: erreichte Sequenznummer **≤ 5**, Nacht, Geistsicht aktiv, gültiger lokaler Übergang und ausdrückliche Interaktion. Die kleinere Nummer bezeichnet den höheren Rang. Eintritt setzt `ns_betreten_<karte>` ohne doppeltes `ns_`; das erste Übergangserlebnis nutzt zusätzlich `ns_uebergang_<n>_gesehen`. Die vollständige Ausgangsposition einschließlich Stadt, Karte, Gezeitenvariante und Übergangs-ID wird gespeichert. Rückkehr ist ausschließlich am betretenen Übergang möglich. Er bleibt unabhängig von Uhrzeit, Geistsicht, Unruhe und Gezeiten offen. Andere Übergänge derselben Ebene bleiben für diese Sitzung inaktiv. Nicht durch Wände oder Kartenränder ausreisen.

Unruhe steigt **+1 pro 20.000 ms aktiver Spielzeit drüben**, getrennt je Spieler. Ein autoritativer Akkumulator verarbeitet auch mehrere verstrichene Takte; Bruchteile werden beim Speichern und Rückweg erhalten, nicht durch schnelles Wiederbetreten gelöscht. Kämpfe und Dialoge zählen mit, echte Pause/Ladebildschirm/Offlinezeit nicht. Der HUD-Puls zeigt den nächsten Takt. Das vorhandene Unruhe-Maximum gilt; dieses Paket erfindet weder zusätzliche Schäden noch eine Zwangsrückkehr bei Höchstwert. Auf dem Rückweg endet nur der Zuwachs, nicht die bereits erworbene Unruhe.

Bei Niederlage stehen Betroffene auf der sicheren inneren Eintrittsfläche, ohne Fundverlust; sie müssen den Übergang selbst benutzen. Flucht endet auf einer sicheren Nebelseitenposition. Bei Ladefehlern wird der gespeicherte Übergang wiederhergestellt, nicht auf eine zufällige Karte teleportiert. Gezeitenänderungen während des Aufenthalts dürfen die sichere Rückkehrfläche nicht überfluten; der Einbau hält diese Fläche frei und aktualisiert anschließend den restlichen Stadtzustand.

## Inventar, Fallakte und Fragen

Inventarkategorie `nebelseite`, graue diesseitige Darstellung ohne Änderung der Item-ID. Genau zwei einmalige Funde pro Karte, pro Spieler separat verbucht; nicht handelbar, nicht verbrauchbar, keine vervielfältigbare Währung. Die Wirkungen sind bewusst Beobachtungs-Vorschläge. Einsammeln erzeugt den zugehörigen `ns_hinweis_*`-Eintrag genau einmal. Kein Fund setzt bestehende Hauptfall-Beweise, Schuld-Flags oder Ritualabschlüsse. Der Einbau ordnet diese Zusatzbeobachtungen passenden Fallakten zu; sie dürfen keine vorherige Lösungsvoraussetzung nachträglich verschärfen.

`ns_still_<city>_fragen` ist ein numerischer Zähler 0–3, kein boolesches Flag. Zusätzlich Spieltag speichern. Reset nur beim autoritativen Wechsel des Spieltags; Laden, Kartenwechsel und Hostwechsel setzen ihn nicht zurück. Zähler und Antwort atomar verbuchen, Wiederholung verbraucht ebenfalls einen Platz. Nicht freigeschaltete Fragen verbrauchen nichts. Die Stadtfassungen teilen den grafischen Archetyp `nsw_still`; Aussehen und Sprechtempo unterscheiden sich im Text, keine zusätzlichen Bilddateien nötig. Varrowmouth-Fragen benötigen `k6_arrived`. Bei den anderen Städten ist der normale Stadtzugang die Wissensvoraussetzung; Antworten lösen keine Fälle.

## Koop und Spiegelspieler

Beide Spieler stehen höchstens ein Tile vom selben Übergang, beide bestätigen; Transfer erfolgt atomar. Auch bei Rückkehr gemeinsam bestätigen. Disconnect pausiert die gemeinsame Ebene und ihren Timer bis Reconnect oder regulärer gemeinsamer Sitzungsauflösung; keine alleinige Fortsetzung mit gestrandeter Figur. Funde/Unruhe bleiben personenbezogen, Tagesfragenbudget und Bossabschluss gehören der Gruppe. „Der Leisere“ wird ohne Mikrofon durch die Aktion **Zurücktreten** bestimmt. Bei Gleichstand muss ein Fragender gewählt werden; beide lesen die Antwort, nur ein Budgetplatz wird verbraucht.

Der Spiegelspieler erscheint einmal pro Spielstand im Registerkeller, solange `ns_spiegelspieler_done` fehlt. Er kopiert beim Kampfbeginn die drei zuletzt erfolgreich eingesetzten Fähigkeiten des jeweiligen Spielers in Reihenfolge, einschließlich Wiederholungen. Fehlende Plätze werden mit Grundschlag gefüllt. Snapshot bleibt im Kampf unverändert; Kosten und Cooldowns gelten, Inventar- und Questwirkungen werden nie kopiert. Im Koop steht jedem Spieler genau sein Spiegel gegenüber. Basis-HP sind Vorschlag; der Einbau bindet Werte an den eigenen Snapshot und prüft die Balance separat.

Drei aufeinanderfolgende vollständige Runden ohne Angriff, Schaden oder offensiven Status führen zu `ns_spiegel_1`. Warten, Verteidigen und Selbstheilung sind erlaubt. Tierautomatik und reflektierter Schaden sind während dieses Versuchs aus; beide Spiegel warten ebenfalls. Ein Angriff setzt den Zähler auf null. Im Koop müssen beide die Bedingung erfüllen. Das achtteilige Gespräch setzt beim Abschluss atomar dasselbe Done-Flag wie der Kampfsieg; keine zusätzlichen Doppelbelohnungen. Abgebrochenes Gespräch kann am Anfang erneut begonnen werden. Flucht oder Niederlage setzt das Flag nicht.

## Grafik und Prüfung

Manifest: `public/sprites/manifest-nebelseite.json`, Prompts und Verarbeitung: `docs/art/batch-nebelseite-generation.json`, Vorschau und Validation daneben. Figurenzellen 16×32 verwenden Grundlinie 30. Ausnahme `nsw_still`: 32×48-Zellen ergeben bei 4×4 Frames **128×192**, nicht das widersprüchliche 64×128. Kutsche: 4×2 Frames à 64×48. Kampf: 6×5 Frames; zwei identische Ausholframes je Angriffsreihe. Spiegelspieler nutzt vorhandenen Spieler plus Overlay, kein neues Körpersheet. Köpfe/Bestiarium werden aus den erzeugten Figuren abgeleitet. Atlasregionen stehen im Manifest, leere Felder bleiben transparent.

`node docs/story/nebelseite/pruefen.mjs` prüft Inhalte, Umfänge, Kartenherkunft, Referenzen, Satz-/Wortzahlen und den Gesprächsgraphen. `python tools/art/nebelseite/check.py` prüft die exportierten Bilder und schreibt den Bericht. Beide sind Datenprüfungen; Kollisionsfreiheit, Laufzeitverhalten, visuelle Animation im Spiel und Kampfbalance benötigen nach dem Einbau einen Spieltest.
