# DE · Die Fahrende Auktion

Eigenständiger Grafik- und Textvorrat für Perpetua Vance (`fa2_vance`), ihren stummen Träger, den Glockenhund und drei feste Mitbieter. **Kein Spielcode und keine bestehenden Packs geändert.** JSON-Dateien sind Einbauverträge, keine bereits registrierten Dialoge. Die Salzmarkt-Auktion und ihre `T_auktion_*`-Assets bleiben eigenständig.

## Inhalt

| Datei | Inhalt |
|---|---|
| `vance.json` | 12 Begrüßungen, 8 Aufrufe, je 6 Gebots-/Überboten-/Spielerzuschlagszeilen, 9 NPC-Zuschläge, 7 Einlieferungszeilen, je 4 Auszahlungen/Abschiede, 6 Koop-Zeilen |
| `bieter.json` | Drei Charaktere mit je 6 Geboten, 3 Rückzügen, Kategorien und Budgetregeln |
| `lose.json` | 92 Stadtpool-Einträge, 10 neue Kuriositäten, 6 bedingte Nachholangebote |
| `fahrplan.json` | Sechs Städte, zwei Tage Halt, drei Tage Pause, Sperren und Zeitwechsel |
| `zeitung.json`, `gerede.json`, `lesestuecke.json` | 8 Meldungen, 30 Gerüchte, 3 vollständige Lesestücke |

Grafik: `public/sprites/manifest-auktion.json`, 55 PNG-Dateien. Generation: 24 eigenständige Aufrufe des eingebauten Bildgenerators, vollständige Prompts und Quellbild-Hashes in `docs/art/batch-auktion-generation.json`. Vorschau und maschineller Bericht liegen daneben. Rohbilder sind nicht für den Einbau erforderlich.

## Gebotsrunden als Dialog

Wiederverwendungsreferenz ist `src/data/packs/k2_gilde/treffen_namensgilde.json`: Dort öffnet eine Dialogwahl mit `auction: "namensgilde"` eine Auktion. DE liefert bewusst keine neuen Engine-Felder für dieses bestehende Verhalten. Der Einbau benötigt einen eigenen persistenten Auktionszustand und einen Dialogadapter; `vance.json` enthält dessen Zeilenpools.

1. Vor dem ersten Gebot zeigt Vance Los, Herkunft, Wert, Startpreis, bekannte Vor-/Nachteile, führenden Bieter und eigenen verfügbaren Geldbetrag. Vor jedem Erinnerungsstück steht die Warnung der Witwe. Besichtigen und Passen sind jederzeit möglich.
2. Die erste Wahl lautet „Zum Startpreis bieten“. Danach sind die Optionen `+10 %`, `+25 %`, `+50 %` **vom aktuellen führenden Gebot**, nicht vom Wert: `neu = aktuell + max(1, ceil(aktuell * prozent / 100))`. Angezeigt wird immer auch der konkrete Gesamtbetrag. Kein Bieten gegen das eigene führende Gebot. Bestätigung reserviert diesen Gesamtbetrag; Überbotenwerden hebt die vorige Reservierung auf. Abbuchung erst beim Zuschlag.
3. Beim Ausrufen jedes Loses werden Teilnahme und Budget je NPC einmal bestimmt und gespeichert. Der Reeder nimmt mit 25 % teil, Zirkelgast mit 85 %, Witwe immer. Bei Vorlieben gilt der höhere Prozentwert; Zufall ist ein gespeicherter ganzzahliger Faktor von 90 bis 110: `floor(Wert * Budgetprozent * Faktor / 10000)`. Keine Neuwürfe pro Klick oder nach Laden. Ein aktiver NPC antwortet nur, wenn die kleinste Erhöhung (+10 %) sein Budget nicht überschreitet.
4. Nach einer menschlichen Aktion erhalten die NPCs in der Reihenfolge Reeder, Witwe, Zirkel je höchstens eine Antwort. Jeder sieht das zuletzt erhöhte Gebot. Bereits führende Bieter überspringen ihren Zug. Die jeweils letzte gültige Erhöhung führt. Danach sind wieder die Menschen an der Reihe. Ein Rückzug gilt für dieses Los endgültig; die Aufgeben-Zeile wird nur einmal gesprochen.
5. **Witwe bei Kategorie `erinnerung`: kein endliches Höchstgebot.** Sie erhöht immer, solange sie nicht führt. Ihre Aufgeben-Zeilen werden dafür nie verwendet. Der Spieler kann dieses Los gegen sie nicht gewinnen; das steht vor dem ersten Gebot offen da. Passen kostet nichts. Keine künstliche versteckte Rundengrenze.
6. Wenn alle menschlichen Teilnehmer gepasst haben, wickelt der Adapter die restlichen NPC-Runden ab. Finite Budgets enden durch die steigenden Mindestgebote. Ist die Witwe unbegrenzt, wird ihr Sieg spätestens eine Mindeststufe über dem letzten finanzierbaren Gegenangebot aufgelöst; niemals eine Endlosschleife oder ein Unendlich-Geldwert speichern. Ohne Gebot bleibt das Los unverkauft.
7. Beim Zuschlag in **einer** gespeicherten Transaktion prüfen: richtige Halt-/Losversion, gültiges Gebot, verfügbarer/reservierter Betrag, noch nicht verkauft. Dann Geld abbuchen, genau ein Exemplar an den Gewinner geben, Los schließen, Historie schreiben. Bei vollem Inventar kommt ein bezahltes Stück in die Abholverwahrung des Wagens; kein Verlust und kein zweiter Kauf. Fehlgeschlagene Transaktionen ändern nichts.

Geld ist ganzzahlig. Negative, NaN-, unendliche oder nicht sicher darstellbare Beträge ablehnen. Dialoglesen verbraucht keine zusätzliche Spielzeit. Der Hund hat keinerlei Kampfwerte und löst keine Begegnung aus.

## Loskatalog, Wert und verpasste Fährten

Alle 92 Stadtpool-Einträge verweisen auf die vier in `lose.json.quellen` genannten vorhandenen Itemdateien. Wert ist deren `price`; Startpreis ist `max(1, ceil(Wert * 0.6))`. Ein Halt enthält insgesamt sechs unterschiedliche Item-IDs: eine der zehn neuen Kuriositäten, einen `geisterkern` für die Fasserin, ein zulässiges Nachholartefakt (sonst Stadtpool) und drei weitere Stadtpool-Lose. Vor dem Ziehen alle belegten IDs aus dem Restpool entfernen. Kuriositäten und Fasserin-Los kommen zusätzlich zur stadtspezifischen Auswahl, nicht als zusätzliche Lose. Ein Exemplar je Los.

Ein späterer Halt kann ein nicht gekauftes Nachholartefakt erneut anbieten. Zulässige Nachholangebote rotieren deterministisch, damit ein NPC-Zuschlag keine endgültige Verlustquelle wird. Bereits von einem Spieler erworbene einzigartige Nachholartefakte kommen nie erneut, auch nach Verkauf. Beide Koop-Inventare, Lager, Ausrüstung, Abholverwahrung und Einlieferungen zählen als Besitz. Gewöhnliche Zutaten dürfen wiederkehren. Katalog und Zufallsentscheidungen werden beim Öffnen des Halts festgeschrieben und beim Laden nicht erneuert.

**Die sechs Zuordnungen von Fährte zu Ersatzartefakt sind DE-Vorschläge.** Die Akten liefern echte Flags, aber keine vollständige verbindliche Tabelle „Fährte → Artefaktbelohnung“. Der Vertrag behauptet diese Zuordnung nicht als bestehenden Spielinhalt. Ab Kapitel 5 dürfen die drei Calderwick-Artefakte nur nach `kapitel4_done` und bei fehlendem angegebenen Anker auftauchen; ab Kapitel 6 entsprechend die drei Briarholt-Artefakte nach `kapitel5_done` und bei fehlendem angegebenen Fährtenabschluss. Der Einbau kann diese Zuordnungen mit späteren Belohnungstabellen abgleichen. Ein Kauf erzeugt **keinen** Beweis, Fährtenabschluss, Zugang oder nachträglich anderes Ende. Bestehende Artefakt-Nachteile bleiben vollständig erhalten und werden vor dem Bieten gezeigt.

Höhere Zutaten stehen in den späteren Stadtpools (Sequenzen 4/3/2/1 in Calderwick/Briarholt/Varrowmouth); eine Stadt wird ausschließlich nach realem Besuch und aktuellem Zugang gewählt. Zutaten allein ersetzen keine Formeln oder Ritualvoraussetzungen. Die zehn neuen Kuriositäten sind einmal benutzbare Vorschläge mit kleinen Wirkungen, keine wiederholt aktivierbaren Gratisheilungen. Ihr Text weist auf den Verbrauch hin; bei bereits vollem Zielwert verlangt die Benutzung eine Warnbestätigung.

## Einlieferung und Abrechnung

Der Spieler wählt **eine konkrete Iteminstanz**, sieht Katalogwert, Startpreis und 15-%-Provision und bestätigt. Der Adapter prüft Besitz und Herkunft, Mindestwert 10 Münzen und sichere Verwahrung. Quest-/Beweis-/Schlüsselstücke, ausgerüstete, reservierte, bereits eingelieferte oder gestohlene Instanzen sind nicht zulässig. Unbekannter Wert wird nicht geraten. Nur geprüfte gewöhnliche Beute/Ausrüstung, Zutaten und freigegebene Artefakte/Kuriositäten; aktive gefährliche Artefakte müssen zuvor sicher deaktiviert werden können. Sonst Ablehnung. Abbruch vor Bestätigung lässt das Inventar unverändert.

Bestätigung entfernt genau ein Exemplar in derselben Transaktion, die eine dauerhafte Einlieferungs-ID mit Eigentümer, Herkunftsinstanz, Halt-ID, Wert, Mindestpreis und Zustand `verwahrt` speichert. Ein Beleg erscheint im Notizbuch. Einlieferungen werden während der Reise separat durch Vances Händlerkontakte vermittelt; sie verdrängen keines der sechs öffentlichen Lose. Beide Koop-Spieler sind von Geboten auf die gemeinsame Kampagneneinlieferung ausgeschlossen.

Beim **nächsten tatsächlichen** Halt wird genau einmal mit gespeichertem Seed abgerechnet: 20 % unverkauft; sonst ganzzahliger Bruttoerlös gleichmäßig zwischen Startpreis und `floor(Wert * 1.4)`. Diese konservative Vermittlungsregel ist eigenständig und nutzt keine unbegrenzten Witwen-Gebote; damit ist Einliefern kein garantierter Geldkreislauf. Bei Verkauf: `Gebühr = ceil(Brutto * 15 / 100)`, `Netto = Brutto - Gebühr`. Unverkauft: keine Gebühr, genau dieselbe Instanz zur Rückgabe. Beispiel 92 brutto → 14 Gebühr → 78 netto. Das Ergebnis wird gespeichert, bevor der Dialog eine Auszahlung anbietet.

Abholen bucht entweder Geld oder Gegenstand einmalig zum gespeicherten Eigentümer und setzt atomar `ausgezahlt` bzw. `zurueckgegeben`. Platzmangel lässt das Stück in Verwahrung; kein Wegwerfen. Wiederholte Dialoge, Reconnects und spätere Halte zahlen nicht erneut. Nicht abgeholte Erlöse und Rückgaben verfallen nie. Wird kein neuer Halt möglich, bleiben sie erhalten; die Abrechnung wartet, statt einen gesperrten Ort zu erzwingen.

## Fahrplan, Ereignisse, Koop und Notizbuch

Die Spieluhr liefert absolute Spieltage. Beispiel: Halt ab Tag 10 umfasst `[10,12)`; Pause `[12,15)`; nächster Halt frühestens Tag 15. `fa2_tag` ist die absolute Tageszahl, kein Boolean. Der Adapter schreibt sie nur bei echtem Zeitfortschritt. Bei geschlossenem Spiel keine Echtzeit nachrechnen. DE legt keine eigene Tageslänge fest: CK dokumentiert eine Abweichung zum alten Zwei-Tage-Saisonkalender; beide Systeme müssen dieselbe beschlossene Uhr verwenden.

Route: Kettlegate → Wexmoor → Dunscar → Calderwick → Briarholt → Varrowmouth → zurück. Nicht erreichte/gesperrte Städte überspringen; Besuchs- und Zugangsdaten aus der zentralen Spielregistrierung lesen. Nur eine zugängliche Stadt: Wiederbesuch nach voller Pause zulässig. Keine zugängliche Stadt: warten, täglich neu prüfen, keinen fiktiven Halt und keine Auszahlung erzeugen. Erreichbarkeit unmittelbar vor Aufstellen, Bieten und Übergabe erneut prüfen.

CK-Sperren: `fs_fest_laternennacht_aktiv`, `fs_fest_salzsegen_aktiv`, `fs_fest_schichtwechsel_aktiv` jeweils lokal; `fs_stiller_abend_aktiv` überall. Nur ein aktives Fest sperrt, nicht dessen Ankündigung/Nachlese. Varrowmouth: `gezeit_flut` aus dem CU-Vertrag; der endgültige Steg und der Gezeitenadapter müssen beim Einbau gebunden werden. Solange diese Daten fehlen, Varrowmouth nicht wählen. Bei Flut aktive Runde pausieren und Reservierungen unverändert lassen; bei Ebbe vor Haltende fortsetzen. Am Haltende unentschiedene Lose schließen und Reservierungen lösen. Keine Abbuchung für unterbrochene Gebote. Das Haltfenster wird durch Sperren nicht verlängert.

Auf der **Stadtkarte** steht das Wagen-Pin-Symbol aus `ui/fa2_symbole.png`, Region `pin`, nur am aktiven zugänglichen Halt. Im Notizbuch „Nächster Halt“: bestätigte Stadt, frühester Tag, Abreisetag, sechs Lose und Zustände, offene Einlieferungen/Abholungen. In der Pause „frühestens Tag …“; bei unbekanntem Ziel „Route wird geprüft“. Keine unerreichten Stadtnamen oder Kartenpositionen verraten. Bei Fest/Flut erscheint der Sperrgrund statt einer falschen Kaufoption.

Koop teilt Katalog, Seed und NPC-Entscheidungen. Persönliche Geldbeutel, Gewinner und Eigentümer bleiben getrennt. Pro Runde beginnt abwechselnd Spieler 1/2; beide bestätigen oder passen, danach antworten NPCs. Ein veraltetes gleichzeitiges Gebot wird zurückgewiesen und zeigt den neuen Preis, niemals automatisch teurer angenommen. Bei Disconnect des führenden Spielers bleibt die Reservierung erhalten, die Runde pausiert bis Reconnect oder Haltende. Kein stellvertretender Kauf. Persistente eindeutige Transaktions-IDs verhindern doppelte Lose und doppelte Auszahlungen.

Zeitungsmeldungen benötigen den angegebenen Ereignistrigger und werden pro Halt einmal veröffentlicht. `{stadt}` erst nach bestätigter zugänglicher Route auflösen. Gerüchte über Verkäufe/Einlieferungen nur nach passenden tatsächlichen Ereignissen freigeben; übrige Zeilen nach Erstkontakt. Platzhalter in Vances Aufrufen: `{los}`. Auszahlung: `{brutto}`, `{gebuehr}`, `{netto}`; Nummern im UI lokal formatiert, Namen als Text escaped.

## Grafikvertrag

| Gruppe | Raster und Reihenfolge |
|---|---|
| 5 Menschen-Lauf-Sheets | 64×128; 16×32-Zellen, Reihen unten/links/rechts/oben, 4 Schritte; Grundlinie y=30 |
| Glockenhund | 128×128; 32×32-Zellen, dieselbe Reihenfolge; kein Kampf |
| Portraits/Köpfe | 6 neutrale Portraits 64×64, 6 Köpfe 24×24; Vance 8 Stimmungen (4×2), Mitbieter je 4 (2×2) |
| Wagen | 192×128; 96×64-Zellen, geschlossen `[0,1]`, Bühne `[2,3]`; je 2 Laternenframes |
| Lose | Streifen 160×16 und 320×32; dieselben 10 IDs zusätzlich als einzelne Item-PNGs in 16/32 |
| Posen | Vance Hammer 4, Zeigen 3, Träger Hochhalten 3 (je 16×32); Hund Bellen 2 (32×32) |
| UI | 240×135-Atlas; getrennte Pult-, Gebots-, Bieter- und Hammerregionen; Symbole 112×16 |
| Effekte/Props | Zuschlag 192×32 (6), Glocke 64×16 (4), Hammer 64×16 (4), leere Tafel 48×32 |

Alle PNGs haben binäres Alpha und verwenden nur die gemeinsame 32-Farben-Palette aus `manifest-fasserin.json`. Die Bildvorlagen wurden pro Zelle mit Nearest Neighbor normalisiert, Farbsäume entfernt und geprüft. Das Manifest liefert Animationen, fps, Regionen und genaue Maße.

Für den äußeren UI-Rahmen **`regions.panel.parts`** verwenden: Die Mitte ist ein transparentes 1×1-Muster; die neun Teile dürfen nicht durch einen Vollbild-Crop des Atlanten ersetzt werden, sonst würden Pult und Bieterfelder mitgestreckt. Die vier Unterpanels haben eigene 5-Pixel-Slice-Ränder. Unbenutzte Zwischenflächen sind transparent. Alle Texte entstehen im späteren Renderer, nicht im PNG.

## Prüfung und Grenzen

```sh
python tools/art/auktion/check.py
node docs/story/fahrende_auktion/pruefen.mjs
git diff --check
```

Der Pillow-Check prüft den unabhängigen Sollumfang, Maße/Raster, jede Framebelegung, Grundlinie, Animationen, gemeinsame Palette, Alpha, Regionen, Icon-Atlas-Gleichheit und Laternenänderungen. `pruefen.mjs` prüft Textzahlen, Platzhalter, Itemwerte/IDs, echte Flag-Produzenten, externe Vertragsverweise und Grenzbeispiele der beschriebenen Rechenregeln. Das ist **kein** Nachweis einer integrierten Auktion: Zeitadapter, Dialogadapter, Transaktionen, Koop-Reihenfolge und Kartenplatzierung werden erst beim separaten Einbau implementiert und im Spiel getestet.
