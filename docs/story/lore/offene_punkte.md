# Offene Punkte für die spätere Einbindung

Die Texte sind fertig. Die folgenden Punkte betreffen Anzeige oder Grenzen des vorhandenen Spielschemas. Hier wurden dafür keine neuen Datenfelder oder Spielregeln erfunden.

## Zeitungsauswahl und Archiv

Es fehlt eine Oberfläche für Zeitungsständer beziehungsweise das nachträgliche Lesen von Ausgaben. Sie benötigt Titel, Haupttext und zwei Kurzmeldungen aus `zeitungen.json`. `zeitung: "kurier"` steht für den Kettlegater Kurier, `"bote"` für den Wexmoorer Boten. Am Abschlusszeitpunkt anhand der bestehenden Flagbedingungen auswählen und die gewählte `id` für ein Archiv speichern.

Besondere Vorsicht bei Fall 7/8: `c7_wren` ist in `case_08.json` definiert. `c8_perfect`, `c8_good` und `c8_early` schließen beide Fälle und setzen unter anderem `wren_arrested`. Deshalb schließt die direkte c7_wren-Ausgabe `case_08_closed` aus. Nach einem früheren falschen Urteil gegen Edmund muss die spätere Fall-8-Ausgabe als neuere Nachricht erscheinen können; der alte Zeitungsausschnitt bleibt als damaliger Bericht verständlich. Nicht pauschal alle passenden historischen Flags bei jedem Öffnen als neue Veröffentlichungen behandeln. Der vorhandene Zustand `state.endings` kann bei dieser Zuordnung helfen, ist aber kein unterstütztes Bedingungsfeld in den gelieferten JSON-Daten.

Die Aktausgaben des Boten werden durch den nächsten Akt beziehungsweise `kapitel2_done` abgelöst. Das verhindert gleichzeitig sichtbare aktuelle Berichte aus unterschiedlichen Phasen. Ein Archiv bewahrt separat die schon erschienenen Ausgaben.

## Fahndung: aktueller Wert nicht filterbar

`Wanted.js` verwaltet einen numerischen Wert `wanted`, der durch Sichtungen steigt, durch Zeit und Ruhe sinkt. Die vorhandenen Textbedingungen bieten keinen Filter für dessen aktuellen Bereich. Es gibt insbesondere kein für diese Daten nutzbares `max_wanted`-Feld. Neue Schwellenfelder oder frei erfundene Hochfahndungsflags wurden nicht angelegt.

Die beiden schärferen Botenfassungen verwenden stattdessen `k2_price_beaten`, das der vorhandene Kampf `price_wx_fight` setzt. Die Reaktion bezieht sich ausdrücklich auf den Hafenstreit, nicht auf eine behauptete aktuelle Streifenstärke. Ein Passant reagiert darauf und ein weiterer auf `k2_zunder_free`. Beide Ereignisse können erhöhte Aufmerksamkeit plausibel machen, garantieren aber keine gegenwärtige Fahndungsstufe. Für echte stufenabhängige Zeitungssprache und Gerede benötigt die Integration einen freigegebenen numerischen Bedingungsfilter oder vom Fahndungssystem gepflegte Schwellenflags samt Rücknahme beim Sinken. Das bleibt ein offener Teil der gewünschten dynamischen Darstellung.

`k2_in_cell` und `k2_bail_due` werden bereits im Spielcode gesetzt, sind aber ebenfalls kein zuverlässiger Ersatz für eine aktuelle hohe Fahndung. Der Prüfcode erkennt ihre Setzstellen, die gelieferten Texte nutzen sie nicht als Abkürzung.

## Lesefundorte und Passanten

Die äußere Struktur von `lesestuecke.json` ist das im Auftrag verlangte Platzierungsformat. Die Integration übernimmt `interactable` und ergänzt darin `tile`. Nicht die komplette äußere Struktur als Interactable laden. `paper` existiert bereits; es sind keine neuen Grafikwünsche nötig.

Die 40 Fundorte sind mit Kartenzeilen und festen Blockaden geprüft. Vor der Veröffentlichung im Spiel die tatsächlichen PNG-Überdeckungen und die Lesbarkeit der Marker ansehen. In der Versunkenen Altstadt dienen die vorhandenen Ruinenkacheln `r` als Gebäuderänder, im Torfstich und Salzwatt vorhandene feste Requisiten als Nachbarschaft. Alle vorgeschlagenen Lesekacheln selbst bleiben begehbar.

Gerede braucht eine zurückhaltende Sprechblasenanzeige und eine Auswahl unter den aktuell passenden Einträgen der Karte. Wiederholungen begrenzen und nicht jeden Satz bei jedem Schritt abspielen. Manche genannte Karten haben noch keine geeigneten umhergehenden Figuren; die Integration muss vorhandene NPCs oder spätere Passanten zuordnen. Dieses Paket erfindet dafür keine neuen NPC-IDs und keine `speaker`-Felder.

## Itemtexte

`item_texte.json` ist ein Vergleichsvorschlag, kein Ersatz für die Itemdefinitionen. Nur bei weiterhin identischem `alt` den Wert `neu` als neue Beschreibung übernehmen. Bei späteren Änderungen am Gegenstand neu abgleichen. Werte aus `atk`, `boons`, Preisen und anderen strukturierten Feldern bleiben vollständig unter Kontrolle der bestehenden Itemdaten und der vorhandenen Anzeige. Numerische Effektsätze aus den bisherigen Beschreibungen wurden wörtlich bewahrt.

Die Mindestmenge von 40 liegt über den 19 strikt unter acht Wörtern liegenden Beschreibungen im aktuellen Laufzeitkatalog. Deshalb wurden 39 weitere kurze Beschreibungen erweitert. Es wurden keine leeren Beschreibungen künstlich erzeugt und keine vollständigen Itemdatensätze überschrieben.

## Bestiarium: Freischaltung und Quellauffälligkeiten

Die Anzeige sollte erst nach einer Begegnung oder dem vorhandenen Siegflag `won_<encounter-id>` freigeschaltet werden. Täter und späte Erkenntnisse stehen sonst zu früh offen. Das verlangte Bestiariumformat hat keine Freischaltungsfelder; diese wurden nicht hinzugefügt. Jede Elite-ID besitzt einen eigenen Eintrag, obwohl sich ihre Herkunft mit der Grundbegegnung deckt.

In den derzeitigen Wexmoor-Daten gibt es übernommene Angriffsnamen:

| Begegnung | Auffälligkeit in den vorhandenen Angriffen |
| --- | --- |
| `bojenglocke`, `schlickaal` | `Skalpell`, `Aderlass`, `Räuchern`, `Diagnose ...` |
| `nebelfischer` | `Nagen`, `Sprung`, `Seuchenbiss` |
| `glockenmutter` | `Schwanzknoten`, `Rattenflut`, `Kronenbiss`, `Pestgesang ...` |
| `leuchtfeuer` | unter anderem `Geweihstoß`, `Hufschlag` |

Die Tipps beziehen sich auf reale Trefferfolgen beziehungsweise Effekte; daraus werden keine anatomischen Erklärungen erfunden. Falls Claude diese Angriffsnamen später korrigiert, müssen die betroffenen Bestiariumstipps erneut abgeglichen werden. Das Prüfskript meldet solche Abweichungen.

Bei Miriams Heilaktion `Ein fremdes Gesicht` nennt der Beschreibungstext `+7 Leben`, während `value` tatsächlich 6 ist. AD ändert diesen Quellfehler nicht. Ihr Bestiariumstipp bezieht sich auf den eindeutigen Nervenverlust des Wiegenlieds. Bei allen numerischen Kampftipps zählt der mechanische Wert, nicht eine möglicherweise veraltete erklärende Zeile.
