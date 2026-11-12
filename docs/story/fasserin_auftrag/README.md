# CR – Fasserin-Aufträge: Texte

Reines Textpaket für Oda Kessels Auftragsgeschäft. Kein Loader, keine Rezepte, keine Effekte und keine Änderungen unter `src/`. Grundlage: `docs/art/codex_CR_fasserin_auftrag_texte.md`, Odas Charakterbogen `docs/story/fasserin/oda_kessel.md`, BO-Textformate und der unten benannte Laufzeitstand. Grafik liefert CQ (`fasserin2`).

## Dateien

| Datei | Inhalt / Auswahl |
|---|---|
| `oda.json` | 6 allgemeine Erklärungen, 6 Zirkelzeilen; Prüfen und Misserfolg über Beutestück-ID, Erfolg über Artefakt-ID; Annahme, Sperren, Warten, Nachfragen, Abschied, 6 Koop-Zeilen |
| `gastgeber.json` | Je Zirkel verifizierte Gastgeber-ID, 3 Erfolgs-, 2 Misserfolgs- und 1 Abwesenheitszeile; 36 Zeilen insgesamt |
| `texte.json` | 6 Abholzusätze, 4 Oda-Ankündigungen, Beschriftungen mit 5 Zuständen, Chance-Muster, 8 Notizbuch-Meldungen |
| `artefakte.json` | 20 feste `fa_*`-IDs mit Inventartext, Untersuchung, Wirkungs- und Nachteiltext und Oda-Zeile; keine numerischen Effektdefinitionen |
| `gerede.json` | 24 Einträge im BO-Schema `Gruppe → Ort → [{text}]`, je 4 für die fünf Städte und für Treffen allgemein |
| `zeitung.json` | 6 Meldungen im bestehenden Format mit vorgeschlagenen Freischaltungen und Kurzzeile |
| `lesestuecke.json` | 4 Einträge `{id,title,text}`, je 100–160 Wörter im eigentlichen Text, noch ohne Kartenplatzierung |
| `pruefen.mjs` | Node-Prüfer ohne Fremdpakete; Pflichtumfang, Referenzen, IDs, Textlängen, Chancen, Platzhalter und Wortzahl |

Prüfung aus dem Repo-Stamm: `node docs/story/fasserin_auftrag/pruefen.mjs`. Die Wortzahl umfasst ausschließlich die benannten Spielertexte, einschließlich Titel und Varianten, ohne IDs, Flags, Platzhalternamen und diese Anleitung. Die vier Lesestücke werden zusätzlich einzeln gezählt.

## Auswahl und Stimme

Oda und Gastgeber sprechen den Spieler mit „Sie“ an; UI und Erzähler verwenden „du“. Je Ereignis genau eine passende Variante auswählen. Begrüßung nicht als sechs aufeinanderfolgende Sprechblasen ausgeben: Die vollständigen Vertragsdaten stehen vor der Bestätigung zusätzlich auf der Auftragskarte. Pro Gespräch höchstens eine der trocken humorvollen Varianten wählen; die Varianten sollen keinen Schlagabtausch aus sechs Witzen bilden. Keine zusätzliche Belohnung durch einen Textknoten.

`oda.je_zirkel` ergänzt eine allgemeine Begrüßung. `pruefen[beutestueck]` kommt vor der Bestätigung; `annehmen` erst nach erfolgreicher Abbuchung. `kein_geld`, `kein_stueck` und `zu_viele` dürfen nichts verbrauchen. Die Nachteil- und Wirkungszeilen müssen neben Chance, einem Beutestück, Lohn und Rückgabe vor der Bestellung lesbar sein. Die begrenzte Auswahl am aktuellen Treffen kann zusätzlich auf ein vorhandenes, aber heute nicht angebotenes Stück treffen: dafür den bestehenden Nicht-im-Angebot-Text benutzen, nicht `kein_stueck`.

Die Zeilen sind benannte Textvorräte, keine neuen `dialogues.json`-Bäume. Das UI ruft sie an den bestehenden oder ergänzten Ereignissen auf. `oda_zeile` ist die kurze Ansicht am angebotenen Artefakt, `uebergabe_erfolg` dagegen die abgeschlossene Ausgabe.

## Zirkel und Quellen

| Zirkel | Gastgeber-ID | Mitgliedschaft | Abholkarte |
|---|---|---|---|
| `waage` | `tresswell` | `treffen_waage` | `treffen_waage` |
| `kreide` | `vellacourt` | `treffen_kreide` | `treffen_kreide` |
| `russ` | `kohlenjem` | `treffen_russ` | `treffen_russ` |
| `lichtlose` | `zirkel_lichtlose` | `treffen_lichtlose` | `treffen_lichtlose` |
| `salz` | `zirkel_salzbruder` | `treffen_salz` | `treffen_salz` |
| `schichtbund` | `zirkel_schichtbund` | `treffen_schichtbund` | `treffen_schichtbund` |

Die ersten fünf stammen aus `src/data/treffen.json → circles`; Schichtbund aus `src/data/packs/k3_handel/treffen_schichtbund.json → circles`. BO enthält außerdem Namensgilde-Texte; CR erweitert ausdrücklich nur die sechs beauftragten Zirkel. Calderwick und Briarholt bekommen Gerede, keine neue Fasserin und keinen erfundenen Abholzirkel.

Die Sondergruppe `gerede.treffen_allgemein.allgemein` ist ein redaktioneller Vorrat, **keine neue Stadt oder Karte**. Beim Einbau die vier Zeilen in die sechs bestehenden Treffen-Pools ergänzen; die übrigen Gruppen verwenden echte Karten-IDs. Die vier Lesestücke über bestehende Lesestellen oder das Notizbuch anbieten; ihre IDs beginnen mit `fa_`, sie erzeugen keine Gegenstände. Stadtgerede ist Hörensagen und behauptet keinen persönlichen Auftrag des Spielers.

## Auftragszustände und Ereignisse

| Zustand | Bedeutung / Textanschluss |
|---|---|
| `bestellt` | Ein passendes Stück und voller Lohn wurden atomar abgegeben; Oda-Annahme und `hinweise.auftrag_erteilt` |
| `in_arbeit` | Bis zum nächsten Treffen desselben Zirkels; `oda.warten` |
| `fertig` | Ab dem nächsten Treffen desselben Zirkels abholbar, Erfolg noch nicht gezeigt; UI „Abholbereit“, Abholeinladung |
| `misslungen` | Bei der Abholung einmal ermittelter Fehlschlag; Beute verloren, halber Lohn einmal zurück, passende Oda- oder Gastgeberzeile |
| `abgeholt` | Abgeschlossen; Artefakt oder Erstattung wurde zugeordnet, keine erneute Ausgabe |

`misslungen` ist das angezeigte Ergebnis vor dem Abschluss `abgeholt`, kein dauerhaft erneut auszahlbarer Auftrag. Im Verlauf das Ergebnis getrennt vom Abschlusszustand erhalten. Bei Erfolg führt `fertig` nach Ausgabe direkt zu `abgeholt`. Die Scherben sind Erzählung und keine erneut verwertbare Beute oder zusätzliche Item-ID.

Vorgeschlagener Anschluss `auftrag_abholen`: Auftrags-ID, Besitzer, Zirkel, Bestellrunde, gespeicherte Chance, Lohn, Ergebnis und Erstattung bereitstellen. Erst die fachliche Ausgabe samt dauerhaft gespeichertem Ergebnis abschließen, dann die zutreffende Zeile anzeigen. Bei Oda-Anwesenheit die stückspezifische Oda-Zeile, sonst die Zirkelvariante des Gastgebers auswählen. Derselbe Auftrag darf durch erneutes Gespräch, Menüöffnen, Neuladen oder den zweiten Spieler weder neu würfeln noch doppelt auszahlen. Der Wurf erfolgt beim Abholen; die vorherige Einladung darf keinen Erfolg versprechen. Versäumte Treffen verschieben nur die Übergabe, nicht den Wurf oder die Chance.

Zwei offene Aufträge gelten als gemeinsame Obergrenze, auch im Koop. Vor dem Abgeben Besitzer und zahlende Person eindeutig anzeigen; keine stille Abbuchung beim Partner. Die sechs Koop-Zeilen setzen diese Zuordnung voraus. Falls der Einbau stattdessen ein gemeinsames Portemonnaie beibehält, müssen die personenbezogenen Zahlungszeilen vor Aktivierung angepasst werden. CR führt keine zweite Wirtschaftslogik ein.

### Flags (Vorschläge, nicht in diesem Paket gesetzt)

- `fa_auftrag_erteilt`: einmalig nach der ersten erfolgreichen Annahme; Zeitung freischalten.
- `fa_auftrag_<zirkel>`: dauerhafter Nachweis mindestens eines angenommenen Auftrags in diesem Zirkel, z. B. `fa_auftrag_schichtbund`. Kein Ersatz für offene Aufträge, Mengen oder Besitzer; nach Abholung nicht zur erneuten Auszahlung verwenden.
- `fa_misslungen_<n>`: Verlaufsschwelle nach dem n-ten tatsächlich abgeholten Fehlschlag. `fa_misslungen_1` reicht für die gelieferten Meldungen. Beim wiederholten Lesen keine neue Schwelle setzen.
- `treffen_*`: bestehende Mitgliedschaftsflags nur lesen, nie durch einen Auftrag gewähren.

`zeitung[].requires_flags` sind UND-Bedingungen. Die neuen `fa_*`-Flags brauchen Erzeuger; bis dahin die Meldungen gesperrt lassen. Keine dieser Freischaltungen darf Storyfortschritt ersetzen.

### Platzhalter

`{zirkel}` = sichtbarer Zirkelname; `{artefakt}` = Artefaktname; `{beutestueck}` = sichtbarer Name des eingesetzten Stücks; `{lohn}`/`{erstattung}` = gespeicherte Schillingbeträge; `{auftraggeber}` = Anzeigename der zugeordneten Person; `{tage}` = aus dem tatsächlichen Termin berechnete Spieltage; `{zaehler}`/`{nenner}` = exakter Bruch der Chance. Vor dem Rendern einsetzen und UI-escapen. Keine Roh-IDs oder unerfüllten Platzhalter anzeigen.

Die Pflichtmuster 40/50/60/70/80 stehen unter `auftragskarte.chance`. Für 45/55/65/75 den exakten Bruch einsetzen: 9/20, 11/20, 13/20, 3/4. Keine Rundung auf Zehnerschritte! Der Termin im derzeitigen Treffenplan wird in Spielminuten berechnet. Die verlangte Tagesmeldung darf nur mit einer passenden Spielkalender-Umrechnung verwendet werden; bei einem Termin noch am selben Spieltag die konkrete Uhrzeit/Restzeit im vorhandenen Termin-UI zeigen, statt „in 0 Tagen“ oder einer erfundenen Echtzeitfrist. Eine Einladung kann Abholzusatz und Oda-Ankündigung gleichzeitig enthalten: neue Bestellung und alte Abholung bleiben getrennt.

## Balancevorschlag für den separaten Einbau

Genau ein Stück pro Auftrag. Die Chancen und Artefaktnamen sind der feste CR/CQ-Vertrag. Die Löhne hier sind Vorschläge; höhere Chance ist immer günstiger. Alle Löhne sind gerade, die Hälfte ist ohne Rundungsverlust auszahlbar. Zahlenwerte ausschließlich hier, nicht als versteckte Wirkungsfelder in den JSON-Texten.

| Beutestück → Artefakt | Chance | Lohn / Rückgabe bei Fehlschlag | Wirkung und kleiner Haken als Vorschlag |
|---|---:|---:|---|
| `rattenkrone` → `fa_rattenkrone` | 70 % | 120 / 60 | Normale Stadtgegner starten keinen Nähekampf; je Reise +1 Unruhe |
| `sternhirschgeweih` → `fa_sternhirschgeweih` | 55 % | 180 / 90 | Geistsicht-Unruhe ×0,8; nach Nutzung Ausweichkosten im nächsten Kampf ×1,1 |
| `geweihreif` → `fa_geweihreif` | 50 % | 200 / 100 | Gift/Schlick-Status verhindern; erste Kampfrunde Bewegung ×0,9 |
| `geisterkern` → `fa_geisterkern` | 60 % | 160 / 80 | Ersten schädigenden Treffer je Kampf vollständig abfangen; danach +2 Unruhe |
| `glasfeder` → `fa_glasfeder` | 75 % | 100 / 50 | Erstschlag; Schaden dieses ersten Angriffs ×0,95 |
| `wachsherz` → `fa_wachsherz` | 65 % | 140 / 70 | Pro Kampfrunde +1 Nerven bis Maximum; maximale Konzentration −1 |
| `moorperle` → `fa_moorperle` | 80 % | 80 / 40 | Reisefallen vor Auswahl sichtbar; je neu entdeckter Falle +1 Unruhe, keine Wiederholungsstrafe |
| `schlickperle` → `fa_schlickperle` | 80 % | 80 / 40 | Kahngebühr auf zugänglichen Wasserwegen 0; Nervenerholung nach Fahrt für 30 aktive Sekunden ×0,9 |
| `brutschale` → `fa_brutschale` | 60 % | 160 / 80 | Einmaliger Begleitgeist im nächsten Kampf für 3 Runden, Zusatzschaden 2/Runde; beim Erscheinen +2 Unruhe, danach dauerhaft als verbraucht markieren |
| `moewenglas` → `fa_moewenglas` | 75 % | 100 / 50 | Einkaufspreise ×0,9; nach abgeschlossenem Kauf +1 Unruhe, kein höherer Verkaufserlös |
| `irrlichtfunke` → `fa_irrlichtfunke` | 70 % | 120 / 60 | Sichtlicht in dunklen Karten; gegnerische Wahrnehmungsweite ×1,1 |
| `schaedelsplitter` → `fa_schaedelsplitter` | 65 % | 140 / 70 | Ersten Untotenangriff um 0,5 Sekunden verzögern; maximale Konzentration −1 |
| `ratssiegel` → `fa_ratssiegel` | 45 % | 210 / 105 | Nur explizit markierte optionale Oberstadt-Türen öffnen; je Öffnung +1 Unruhe |
| `medaille_polizei` → `fa_medaille_polizei` | 55 % | 180 / 90 | Ansehensverlust ×0,9, Restbruchteile speichern; Tragkraft −1, niemals unter 0 |
| `fernrohr_messing` → `fa_fernrohr_messing` | 50 % | 200 / 100 | Lesereichweite ×1,5 bei freier Sicht; je neuem fern gelesenem Hinweis +1 Unruhe |
| `bronzeglocke_klein` → `fa_bronzeglocke_klein` | 60 % | 160 / 80 | Einmal je Kampf 1 Runde Gesangsangriffe von Chor-Gegnern aussetzen; eigene Fähigkeitskosten in dieser Runde +1 Konzentration |
| `spinnfaden_lila` → `fa_spinnfaden_lila` | 40 % | 220 / 110 | Nervenfaden-Fähigkeiten Konzentrationskosten ×0,9, aufrunden; je verbilligter Nutzung +1 Unruhe |
| `linsenscherbe` → `fa_linsenscherbe` | 45 % | 210 / 105 | Nur redaktionell als Lüge markierte verfügbare Aussagen hervorheben; pro neuer Markierung +1 Unruhe |
| `madenwachs` → `fa_madenwachs` | 70 % | 120 / 60 | Krankheitsstatus verhindern, bestehende Krankheit nicht heilen; erhaltene Heilung ×0,95 |
| `russklumpen` → `fa_russklumpen` | 65 % | 140 / 70 | Wiedererkennung bei gewöhnlichen Sektenbegegnungen unterbinden; Einkaufspreise ×1,05 |

Die kleinen Haken sind eigene Vorschläge, keine schon beschlossenen Spielwerte. Wirkungen und Haken gemeinsam einbauen und zusammen anzeigen. Keine Wirkung darf allein aufgrund dieser Prosa als aktiv gelten. Boss- und Pflichtkämpfe, gesperrte Karten, Beweise, Zustimmungen und Story-Flags bleiben maßgeblich; Ratssiegel, Monokel, Fernrohr und Rußzeichen umgehen keine Hauptstorybedingungen. Insbesondere markiert das Monokel kein unbekanntes Weltwissen, das noch gar nicht geäußert wurde. Brutschale lädt sich durch Ablegen oder Neuladen nicht erneut auf.

## Abweichungen vom gelesenen Laufzeitstand

Geprüfte Basis: `eecf5ac` (2026-11-11). `src/core/Artisan.js` nimmt bereits einzelne Stücke an, speichert Aufträge und händigt sie bei einem späteren Treffen über den Gastgeber aus. Der neue Textvertrag ist trotzdem **noch nicht vollständig angeschlossen**:

1. `src/data/treffen.json → artisan.recipes` bietet noch 13 alte Artefakt-IDs an; CR liefert die 20 festen `fa_*`-IDs. Neue Item-/Artefaktdefinitionen und Rezeptzuordnung separat ergänzen, alte Grafiken behalten, alte Mehrteilangebote nicht erneut anbieten. Die 20 Beutestück-IDs werden im Prüfer gegen den vorhandenen Datenbestand geprüft. Bereits gespeicherte Altaufträge weiter mit ihrer gespeicherten Ausgabe abwickeln, nicht pauschal auf einen ähnlich klingenden neuen Gegenstand umdeuten.
2. Neue Rezepte brauchen ausdrücklich `chance` gemäß obiger Tabelle. `recipeChance()` unterstützt diese Angabe schon; die bisherige Preisinterpolation allein garantiert die CR-Chancen nicht.
3. `orderArtifact()` begrenzt im gelesenen Stand offene Aufträge nicht auf zwei; `zu_viele` und die entsprechenden Hinweise erst zusammen mit dieser Prüfung aktivieren. Bei der Bestätigung erneut prüfen, damit zwei Spieler keinen dritten Auftrag gleichzeitig anlegen.
4. Aufträge enthalten bisher weder stabile Auftrags-ID noch individuellen Besitzer. `orderSucceeds()` verwendet einen übergebenen Listenindex im Zufallsschlüssel; für dauerhaft feste Ergebnisse und Koop eine stabile Auftragskennung und gespeichertes Ergebnis benutzen. Das ist ein Integrationsbedarf, keine in CR behobene Laufzeitgarantie.
5. `collectOrders()` gibt derzeit beim Eröffnen der Auktionsrunde automatisch aus und entfernt erledigte Aufträge. Diesen Zeitpunkt kann der Einbau als `auftrag_abholen` verwenden; dann die Schaltfläche „Ergebnis abholen“ nicht zusätzlich auszahlend anschließen. Für eine manuelle Abholung zuerst den Ablauf ändern. Ausgabe-, Geld- und Persistenzvorgang gemeinsam absichern, bevor ein Erfolgstext erscheint.
6. Die Zustands- und Journaltexte, neuen Verlauf-Flags, Nachrichten und Einladungszusätze benötigen Anschluss. Die vorhandenen Textschlüssel `allgemein`, `begruessung`, `fehlende_beute`, `fehlendes_geld`, `auftrag`, `gelungen`, `missglueckt`, `abschied` sind keine automatische Abbildung aller neuen schlüsselabhängigen Zeilen. Die passenden CR-Pools explizit auswählen, keine Artefaktzeile als allgemeine Erfolgsmeldung verwenden.
7. Die aktuelle globale Inventar-/Geldzuordnung erfüllt die personenbezogenen Koop-Texte noch nicht. Besitzer und Zahlung vor Aktivierung anschließen oder den Textvertrag ausdrücklich auf eine gemeinsame Kasse anpassen. Fehlende Oda-Anwesenheit darf eine schon fällige Abholung nicht sperren.

Der Prüfer bestätigt redaktionelle Vollständigkeit und Referenzen, nicht die spätere Laufzeitimplementierung oder Balance.
