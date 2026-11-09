# Integrationsvertrag und offene Punkte

Stand: AS basiert auf main `1fe89c5`. Nur dieser Paketordner wird geliefert. Keine der folgenden Erweiterungen wird als bereits implementiert ausgegeben.

## Freigabeblocker

1. **Pfadbeute:** `rollLoot` in `src/core/Loot.js` wertet keine `requires_pathway` aus. Zusätzlich ignoriert `GameState.meets` dieses Feld; nur der Pfadhandel hat eine spezielle Prüfung. Die im Auftrag aufgeführte Bedingung ist deshalb noch kein sicherer Dialogfilter. `beute_vorschlag.json` enthält 33 vollständige, aber **nicht zu importierende** Auszahlungszweige im Dialogformat. Die Karten haben dafür nur lesbare versiegelte Fächer. Vor Integration generische Pfadprüfung ergänzen oder einen eigenen atomaren Belohnungsadapter einsetzen. Keine unbedingten Kernzutaten in `loot.drops` einsetzen.
2. **Rufen:** Neue Ladungen, Stationen, Hörreichweite, private Bindung und Linienprojektion existieren noch nicht. `rufmechanik.md` und `Signals.skeleton.js` sind der Vertrag. Lokale Vorbereitungsdialoge sind eine lesbare Ausweichfassung ohne Ladungsmodell, kein Ersatz für die fertige Mechanik. Vor Aktivierung der echten Signale diese Zweige durch Signals aufrufen lassen, sonst wäre die Ladung umgehbar.
3. **Phasen:** Das vorhandene Kampfmodell besitzt keine HP-abhängigen Phasen. `bosses.json` + `phasen.json` liefern eine ausführbare Abschnittsfolge: Abschlussflag der Vorphase öffnet im Stationsdialog die nächste. Keine verschachtelten Combat-Starts in `on_win`. Zwischen Abschnitten ist Rückkehr erlaubt, Fortschritt bleibt erhalten. Für die gewünschte nahtlose 2-/3-Phasenfassung muss ein Adapter HP-Anteile, Kampfrunden, Kontrollzustände, Rücksetzung und Auszahlung zusammenführen. Erst der letzte Abschnitt setzt `k3o_<boss>_geloest`.
4. **Neue Karten/Erweiterungen laden:** `applyQuestPack` lädt keine `maps`, `zones`, `travel`, `bosses`, `phasen` oder `artifacts`. Diese Dateien nach dem Wexmoor-Muster zusätzlich einbauen. `tiles_wunsch` ist die ausdrücklich verlangte AS/AV-Metadaten-Ausnahme, kein registriertes Thema. Bis AV integriert wird, immer `tiles` verwenden.
5. **AR/AU-Verweise:** AS definiert und setzt keine fremden Figuren oder Kapitel-/Aktflags. Die folgende vollständige Liste ist extern gebunden; `pruefen.mjs --strict-external` muss vor Gesamtintegration ohne Ausnahmen bestehen.

## Externe Definitionen

| Typ | IDs | Eigentümer / erwarteter Zeitpunkt |
|---|---|---|
| Flags | `k3_arrived`, `k3a_akt1_done`, `k3a_akt2_done`, `k3a_akt4_done`, `kapitel3_done` | AR; Ankunft, bestätigte Aktschritte, gewähltes Ende |
| Figuren | `k3_pfiff`, `k3_gallowmere`, `k3_willa`, `k3_oren`, `k3_mabel`, `k3_pelham`, `k3_nellie`, `k3_huxford`, `k3_esther`, `k3_adaine` | AR; IDs gemäß gemeinsamem Auftrag, keine Ersatzdialoge in AS |
| Figur | `k3_weichenstellerin` | AU; Hedda Quist, Prüfungen erst nach Akt I |
| Zutaten | `sq_zutat_waage_5`, `sq_zutat_moor_5`, `sq_zutat_uhr_5`; `sq_zutat_<pfad>_3`, `_2`, `_1` für alle zehn Pfade | Bereits AF in `src/data/packs/sequenzen/zutaten.json`; Pfad-IDs der drei neuen Pfade haben `sq_`, Item-IDs nicht doppelt |

AR soll die `k3o_<boss>_geloest`-Flags lesen, **nicht ausschließlich** `won_<boss>`. Friedliche Lösungen setzen kein künstliches Kampfsiegflag. Finale Enden, öffentliche Anerkennung, Zustimmung der Familien und Evakuierung bleiben allein AR. Das Flag `k3o_rolle_getrennt` ist nur eine technische Kampfschwäche, kein Beweis für Schuld und keine Freigabe eines Endes.

## Beutevertrag: geforderte Drops als Vorschlag

Für jede Zeile `chance: 1`, `n: 1`, Filter `requires_pathway: [pfadId, 9]`; die zweite Zahl bedeutet „dieser Pfad ab Seq 9“, schließt also alle höheren Stufen ein. Tatsächliche Implementierung muss Pfad-ID und Seq vergleichen. Ein einmaliger Anspruch wird pro Boss gespeichert, unabhängig von Kampf oder friedlicher Lösung. Im Koop braucht es Ansprüche pro Person; die Entwurfsdialoge verwenden derzeit den Einzelspielerflag und dürfen nicht als fertige Koop-Auszahlung importiert werden.

| Boss | zulässige Pfade | Item-Muster | Anzahl |
|---|---|---|---:|
| schwellenhund | sq_waage, sq_moor, sq_uhr | sq_zutat_waage_5 / sq_zutat_moor_5 / sq_zutat_uhr_5 | 3 |
| vorhauer | laterne, faden, maske, echo, kessel, eisen, schluessel, sq_waage, sq_moor, sq_uhr | sq_zutat_{Pfad ohne sq_}_3 | 10 |
| vielrufer | dieselben zehn | sq_zutat_{Pfad ohne sq_}_2 | 10 |
| unterschicht | dieselben zehn | sq_zutat_{Pfad ohne sq_}_1 | 10 |

Die sieben alten Pfade bekommen beim Schwellenhund keine weitere Seq-5-Zutat. Seq 4 gehört ausschließlich zu den AU-Prüfungen. Der Anspruch darf bei vollem Inventar nicht verloren gehen; erst nach erfolgreicher Ausgabe quittieren. Ersatzbeschaffung nach Verlust/Verkauf mit AU abstimmen, kein wiederholbares Gratisduplikat. Zutaten ermöglichen allein weder Rezeptkenntnis noch Verdauung oder sofortigen Aufstieg.

## Zusammenführung und Kollisionsschutz

- `zones.encounters` wiederholt absichtlich die sechs gemeinsam festgelegten Gegner-IDs wie ein eigenständiges Wexmoor-Gebiet. `wildContent` überschreibt bei mehreren Gebieten deren `zone` und Beutetabelle. Alle hier wiederholten Basiswerte sind identisch und haben explizit Panzer 2, alle Elite-Zusatztabellen sind gleich. Für gebietsspezifische spätere Werte benötigt der Adapter Instanzkontext oder neue AS-Varianten; nicht versehentlich letzter-Zone-gewinnt ausliefern.
- `encounters.json` enthält direkte Normalgegner ohne das truthy Elite-Konfigurationsobjekt. `zones.json` enthält die Elite-Vorlagen für den Wildnis-Builder. Beim Zusammenführen keine Vorlagen direkt als Elitegegner importieren.
- `bosses.json` einmal registrieren, `phasen.json` ergänzen. Die Zonen-Kopien sind dieselben ersten Abschnitte. Gallowmere liegt ausschließlich beim Finale, nicht im Zufallspool. Karten platzieren nur normale Roamer; Bosse werden bewusst an der Station begonnen. Nach friedlicher Lösung nicht zusätzlich einen unbedingten Boss-Roamer erzeugen.
- Standard-Paketloader registriert `loot` aus direkten Encounters nicht automatisch als `content.loot`. Normale Gebietsdrops kommen über Wildnis-Builder. Finale Phasen geben die Trophäe über `on_win.gives_items`; Einmaligkeit über gesperrte Station, beim späteren Adapter atomar absichern.
- `artifacts.json.list` in die globale Liste mergen; `items.json` enthält dieselben Vor-/Nachteile als tragbare Gegenstände. Globale Maximalzahl/Fluchregeln unverändert lassen.
- Öffentliche Türen bleiben offen. Schnellreise wird später freigeschaltet. Lohnbüro/Prüfhaus dürfen früh angeschaut werden; AR platziert sensible Hinweise mit eigenen Sichtbedingungen. AS-Lesetexte sind Umweltbeobachtung ohne Aktenfortschritt.
- AS definiert Ortsgeometrie und die elf Figurenplätze. AR/AT/AU sollen weitere Objekte in freien Randbereichen ergänzen, nicht vorhandene IDs ersetzen. Der Speisewagen ist ab Ankunft erreichbar, Pfiff wechselt nach Akt I dorthin. Gerätevergabe bleibt AR.
- Nachtzugwagen sind fest im Depot verbunden; kein autonom fahrender Kartentransport. Für spätere Zugphasen spawn-sicheren Rückweg erhalten. Der letzte Bahnsteig öffnet nach Akt II für das Gespräch in Akt III, nicht erst im Finale. Der eigentliche Gallowmere-Kampf wird erst nach Akt IV angeboten.

## AV/AX/AY

`tiles_wunsch` benennt je Karte das Zielthema. AV vereinbart bei anderem Atlasnamen eine explizite Zuordnung. Kartenmarker: Bahnhof Billet, Schwellenring Weiche, Arbeiterbogen Fenster, Kalkmarkt Steinplatte, Bruchstufen Treppe, Signalhang Trichter, Wagen Tasse. AX liefert sechs normale Gegner und fünf Bosse einschließlich Phasendarstellung. Keine zusätzlichen Figurenbilder durch AS. AY erhält Rufmuster aus AR; Bild/Untertitel bleiben vollwertige Alternativen.

## Balance-Abnahme

Datenwerte berücksichtigen die vorhandenen Solo-Multiplikatoren nicht doppelt. Alle zehn Pfade, Solo/Koop, 50/70/90 % Verteidigung, mit/ohne Artefakte, Kontrollketten und Heilung vor Endgame-Freigabe testen. Ein Datentest ist kein Gameplay-Balancenachweis. Die spätere nahtlose Phasenfassung verändert Erholung und Schwierigkeit gegenüber den gelieferten Abschnitten.

## Abweichung der Auftrags-Kurzliste vom tatsächlichen Code

Die Kurzliste nennt `encounter` als Dialogeffekt. `GameState.applyEffects` und `Ui` erwarten jedoch `combat`. Die Stationsknoten verwenden deshalb das vorhandene Feld `combat`; `encounter` bleibt korrekt für Karten-Roamer. Das ist keine neue Engine-Erweiterung. Der Prüfer kontrolliert beide Referenzarten.
