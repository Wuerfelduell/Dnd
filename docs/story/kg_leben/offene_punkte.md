# Einbauvertrag und fehlende Laufzeitfilter

Keine der folgenden Anforderungen wird durch ein erfundenes JSON-Feld vorgetäuscht. Die vorhandenen Datenformate enthalten für diese Aufgaben keine geeignete deklarative Schnittstelle. Der separate Einbau muss sie ergänzen.

## Fahndung

`GameState.meets()` kennt keine Fahndungsschwelle. Vor dem normalen Start der zehn Einwohnerdialoge bei `state.wanted >= 2` den vorhandenen Knoten `kgl_fahndung` aufrufen. Figuren weichen sichtbar aus, bleiben nicht als Kollision im Weg stehen und geben keine normalen Optionen aus. Bei sinkender Fahndung normalisieren. Für alle acht Stände ab Stufe 2 ausschließlich `kgl_geschlossen` anzeigen und Szene/Handel deaktivieren; auch der Nachtmarkt bleibt sicher, ohne Gegner oder Jagdtrigger. Die Bedingung wird auf Öffnen und auf Wiederaufnahme eines Dialogs geprüft. Kein CN-Flag als dauerhafter Ersatz für den veränderlichen Fahndungswert.

## Ereignisse: genau eine Chance pro Kartenbesuch

Vor dem Einfügen eines noch nicht begonnenen Ereignisobjekts einmal `random() < 0.1` auswerten. Das Ergebnis für diesen Besuch merken; Gesprächsschließen oder erneutes Interagieren würfelt nicht erneut. Begonnene Ereignisse bleiben bis zum Abschluss erreichbar und werden nicht erneut ausgewürfelt. Abgeschlossene Ereignisse dürfen den folgenlosen Nachher-Dialog zeigen. Keine Kämpfe in diesem Paket.

| Ereignis / Dialog-ID | Startkarte | Spur 1 | Spur 2 | Abschlussflag |
|---|---|---|---|---|
| `kgl_ev_droschke` | nordtor | altmarkt | ashgrove | `kgl_ev_droschke_done` |
| `kgl_ev_brand` | ashgrove | altmarkt | nordtor | `kgl_ev_brand_done` |
| `kgl_ev_tasche` | altmarkt | ashgrove | docks | `kgl_ev_tasche_done` |
| `kgl_ev_prediger` | ankerhof | altmarkt | nachtmarkt | `kgl_ev_prediger_done` |
| `kgl_ev_kreide` | nachtmarkt | altmarkt | ashgrove | `kgl_ev_kreide_done` |
| `kgl_ev_brief` | ashgrove | altmarkt | ebba | `kgl_ev_brief_done` |

Taschendieb: Entscheidung 1 Flicken/Zeuge, Entscheidung 2 leise/Begleitung, Entscheidung 3 Rückgabe/Forderung mit Zeugen. Die erste Entscheidung ermöglicht einen zusätzlichen Zeugenweg, die zweite die direkte Beteiligung der Bestohlenen. Unterbrechen und Wiederaufnehmen setzt bei der letzten gewählten Verfolgungsstufe an. Nach zwei Beobachtungen ist immer mindestens der gewaltfreie Rückgabeweg offen.

Die Schlussoptionen schließen einander aus. Bei gemeinsamem Spiel den Dialogabschluss als einen gemeinsamen Zustandsbefehl behandeln, nicht pro Spieler auszahlen. Das ist die übliche Quest-/Dialogautorität; dieses Datenpaket fügt keinen Netcode hinzu.

## Stände und Saison

`kgl_s_kastanien` nur im Herbst/Winter instanziieren. Die restlichen Stände sind ganzjährig. Saisonprüfung mit dem vorhandenen Kalender erledigen; keine erfundenen `season`- oder `chance`-Felder in `market.json`. Ein Standdialog ist eine Alternative zum Warenhandel und benötigt keine neuen Waren oder Item-Icons. Die Drehorgel spielt nur einen Umgebungston, verkauft nichts und vergibt keine wiederholbaren Belohnungen.

## Zeitung und Wetter

`kgl_nebelbote` als zusätzliche Zeitungs-ID registrieren; die Daten allein legen keinen neuen UI-Reiter an. Die zwölf Meldungen sind je zwei alternative Folgen der sechs Ereignisse und nennen auch die beteiligten Einwohner. Beide Alternativen niemals gleichzeitig auswählen.

Die `kgl_*`-Wetter-/Tierkennungen an die Manifestregionen binden, siehe README. Keine Regenpartikel in Innenräumen. Dichte Nebelschleier dürfen Hinweise und Wegmarkierungen nicht verdecken. Tageszeit, Oberflächen und Spawn-Sicherheit muss der Deko-Controller prüfen; in den Wetterobjekten werden keine unbekannten Filterfelder eingeführt.

## Grafiken

Alle geforderten Bilder sind enthalten, keine Grafiklieferung offen. Für die Animationen sind noch Texture-Keys, Regionsausschnitte, FPS und die Stadtpin-Bindung aus dem Manifest in den Loader zu übernehmen. Die Sonderposen werden nur bei passender Interaktion abgespielt. Mit 16×32 sind kleine Requisiten bewusst abstrahiert.
