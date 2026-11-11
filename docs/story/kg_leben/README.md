# CN: Kettlegate lebt

Datenpaket `kg_leben`, Präfix `kgl_`, Grafikbatch `kettlegate_leben`. Lieferung für den separaten Einbau, ohne Änderungen an Laufzeitcode oder bestehenden Spieldaten. Referenzstand: `3483b84a1ba8df6e7c6967ca06d1e3d36c36b8cb`.

## Umfang

| Inhalt | Anzahl |
|---|---:|
| Einwohner mit je zwei Aufenthaltskarten | 10 |
| Einwohnerknoten, je drei Rufbegrüßungen, Pfad, drei Fallstände, Fahndung | 80 |
| Tagesplätze | 20 |
| Gerede, zehn Viertel mit je zehn Zeilen | 100 |
| Stände mit Dialog statt Warenbestand | 8 |
| Stadtaufträge und Ereignisdialoge | 6 |
| Untersuchbare Spuren | 12 |
| Ereignisausgänge | 12 |
| Zeitungsmeldungen im Kettlegater Nebelboten | 12 |
| Koop-Geplauder mit beiden P2-Stimmen | 20 |
| Karten mit expliziter Wetter-/Tierdefinition | 32 |
| PNGs: zehn Lauf-Sheets, zehn Köpfe, zehn Posen, fünf Atlanten | 35 |

`quests`, `dialogues`, `dialog_zusaetze`, `npcs`, `case`, `items`, `encounters`, `platzierung` entsprechen dem Questpack-Format. `items`, `encounters`, `dialog_zusaetze` und die Fallregister sind absichtlich leer. Es gibt keine neuen Kämpfe und keine Abhängigkeit der Hauptfälle von CN. `ereignisse.json` ist ein identischer, prüfbarer Ausschnitt der sechs Ereignisdialoge aus `dialogues.json`, kein zweites zu registrierendes Dialogpaket.

## Einbau

1. Standarddateien nach `src/data/packs/kg_leben/` übernehmen und über `applyQuestPack` laden. `einwohner` zusätzlich durch `withPackLeben` verarbeiten. NPCs nicht ein zweites Mal aus statischen Platzierungen erzeugen. `roam.speed: 0` hält Personen an den geprüften, freien Arbeits- und Heimwegplätzen. Beim Tageswechsel nur die aktive Position anzeigen.
2. `gerede.kettlegate` je Kartenarray an die bestehenden AD-Zeilen anhängen. Tageszeit verwendet das vorhandene flüchtige Flag `k3h_nacht`, nicht ein neues Flag. Begrüßungen wählen ab 60 Ansehen den ersten, ab 20 den zweiten, sonst den dritten Startknoten. Fallreaktionen sind auswählbar und setzen keine Fallflags.
3. `staende.merchants` hat die Struktur aus `market.json`. Alle acht Stände nutzen die ausdrücklich erlaubte Dialogalternative; leere `stock`-Listen dürfen kein leeres Handelsfenster öffnen. Die Interaktion zeigt stattdessen den gleichnamigen Dialog. Drehorgel nur Umgebungston und Text, kein Handel, keine Spendenbelohnung.
4. Für Ereignisse, Fahndung und Saison gilt der genaue Vertrag in `offene_punkte.md`. Die mitgelieferten Stand- und Ereignisobjekte sind native `kind: dialogue`-Objekte. Ohne die dort beschriebenen Filter würden sie dauerhaft erscheinen. Deshalb nicht ungefiltert aktivieren.
5. `leben.json` entspricht BD: Wetterlisten und Tieranzahlen je Karte. Innenräume sind ausdrücklich leer, mit Fledermäusen an der Sternwarte als Ausnahme. Für Deko, Framezerlegung, freie Felder, Abbau beim Kartenwechsel und Tageswechsel dient `src/world/WexmoorLife.js` als Vorlage; die datengetriebene Variante steht in `DunscarLife.js`. Keine Tiere auf Hinweise, Türen, NPCs oder Spawnpunkte setzen. Katzen auf geeignete Mauerplätze, Pferde neben Droschken, Fledermäuse an den Kuppelrand setzen.
6. `zeitung.json` als zwölf bedingte Ausgaben registrieren. Neue Zeitung `kgl_nebelbote` mit Anzeigename „Kettlegater Nebelbote“ in die Zeitungsauswahl aufnehmen. `geplauder.json` folgt der tatsächlichen Vorlage mit `p: p2`, `a` und `b`; dies sind die Stimmen p2a/p2b. Alle Einträge verlangen `koop_aktiv`.
7. Grafiken aus dem Manifest laden. Charaktere: 16×32, vier Spalten, Richtungszeilen unten/links/rechts/oben. Köpfe: 24×24. Sonderposen: eigene 16×32-Dateien. Stadtpins: Reihenfolge der zehn Einwohner. Gemischte Atlanten nur über ihre Regionen schneiden.

## Wetter- und Tierbindung

| Datenname | Manifestregion / Verhalten |
|---|---|
| `kgl_nebel_duenn` | `kgl_nebel_dicht`, geringere Partikeldichte und Deckkraft |
| `kgl_nebel_dicht` | gleichnamige Region, langsame Drift |
| `kgl_nieselregen`, `kgl_russschnee`, `kgl_kanalgeruch` | gleichnamige Regionen |
| `kgl_taube` | `kgl_taube_picken`, gelegentlich `kgl_taube_auffliegen` |
| `kgl_ratte`, `kgl_katze`, `kgl_hund`, `kgl_moewe`, `kgl_fledermaus`, `kgl_pferd` | gleichnamige Regionen |

Wetterliste ist ein Pool, kein Auftrag, alle Wetterarten gleichzeitig einzuschalten. Niesel mit Pfützen; Rußschnee nur bei passender Wind-/Industrieatmosphäre; Kanalgeruch nur nahe dem Wasser. Dünner und dichter Nebel sind Alternativen. Fenster nur nachts, Laterne Frame 0 aus / Frame 1 an, Rauch separat. Der Drehorgel-Ton kann aus dem vorhandenen Festbestand geliehen werden; es wird kein Audioasset in CN behauptet.

## Prüfung

```sh
node docs/story/kg_leben/pruefen.mjs
python tools/art/kettlegate_leben/check.py
```

Das Node-Skript lädt die echten Karten über `loadContent()`, prüft 46 Positionen gegen bestehende Objekte, Figuren, Spawnpunkte und Türen sowie alle Verweise, IDs, Flagproduzenten und Textlängen. Es spielt beide Ausgänge jedes Ereignisses mit `GameState` durch. Belohnungen: 10 bis 30 Schilling oder `honor: 4`, das beim bestehenden Faktor 0,25 tatsächlich einen Ansehenspunkt ergibt. `reward.gives_money: 0` unterbindet die automatische zusätzliche Nebenquest-Auszahlung. Der abgeschlossene Startknoten verhindert erneutes Kassieren.

Der Grafikcheck prüft Maße, nichtleere Frames, gemeinsame Palette, binäres Alpha, Regionsgrenzen und unterschiedliche Animationsframes. Die Vorschau wurde visuell geprüft. Spielzeit 5 bis 10 Minuten pro Ereignis ist ein Ziel für Lesen, zwei Kartenwege und Rückkehr, kein gemessener Laufzeittest vor dem Einbau.
