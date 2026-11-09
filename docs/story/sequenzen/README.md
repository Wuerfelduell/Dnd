# AF: Sequenzen und Pfade

**Status: eingebaut.** Die JSON-Dateien liegen jetzt unter `src/data/packs/sequenzen/`, angewendet von `src/data/sequenzen.js`. Spielbar sind die drei neuen Pfade bis Sequenz 5: Zutaten 9 und 8 bei Nell, 7 und 6 auf den Kettlegater Treffen, der Kern für 5 auf den Wexmoorer Treffen; Formeln bei Kittering und (6/5) auf den Wexmoorer Treffen und als seltener Fund. Grafik leihen sie bis zur eigenen bei Eisen (Waage), Kessel (Moor) und Schlüssel (Uhr). Die Stufen 4 bis 1 aller zehn Pfade, ihre 40 Kernzutaten und die sechs Artefakte sind geladen (`content.highSeqs`, `content.highItems`, `artifacts.list`), bleiben aber gesperrt, bis Kapitel 3 die Bosse bringt. Ursprünglicher Entwurfsstand: 28 Stufen für die sieben bestehenden Pfade, drei neue Pfade mit zusammen 27 Stufen, 55 Zutaten und sechs Artefakte.

## Dateien und Formate

| Datei | Form und Verwendung |
|---|---|
| `seq_4_bis_1.json` | `{ pfadId: { seqs: { "4": …, "3": …, "2": …, "1": … } } }`; zusätzlich in die bestehenden `pathways` einfügen |
| `neue_pfade.json` | `{ sq_waage: …, sq_moor: …, sq_uhr: … }`; Einträge für `pathways` |
| `zutaten.json` | Item-Wörterbuch für `items`; Beschaffung und künftiger Boss stehen im vorhandenen `desc` |
| `artefakte.json` | Wörterbuch für `artifacts.list`, nicht das gesamte `artifacts`-Objekt ersetzen |
| `balancing.md` | 90 Pfadskills, vier Grundskills, 40 Aufstiegsschritte jeweils normal/okkult, LP/Nerven und Gegnervorschläge |
| `offene_punkte.md` | Jede Zutatenquelle, 40 höhere Bossaufgaben, zehn Seq-1-Questketten, Wiederbeschaffung, Zugangs- und Integrationsfragen |
| `neue_mechaniken.md` | Notwendige Adapter und optionale Regeln mit datenkompatibler Fassung |
| `grafikwuensche.md` | 55 Fertigkeitseffekte, drei Symbole, drei Auren, 55 Zutaten- und sechs Artefakticons mit vorhandenen Platzhaltern |
| `pruefen.mjs` | Struktur-, Referenz-, Kollisions-, Grafik- und Zahlenprüfung; optional `--selftest` |
| `balancing.mjs` | Zahlen aus tatsächlichen Aufrufen der vorhandenen Kampf-Engine, nur im Speicher |

Die Formate übernehmen den Bestand. Ausschließlich die ausdrücklich verlangten Sequenzfelder `honor`, `growth_steps`, `digest_rate` und `veraenderung` sind Metadaten des Entwurfs. Die Engine liest sie derzeit nicht. Untere neue Stufen 9 bis 7 haben wie im Bestand kein Ritual, 6 bis 1 schon. Alle neuen Stufen enthalten dennoch die vier Metadatenfelder. Rituale behalten ihr vorhandenes Objektformat ohne erfundene Ritual-ID.

## Zehn spielerische Rollen

| Pfad | Kampfprofil | Ermittlung und Verdauung | Grenze / sichtbarer Bruch auf Seq 4 |
|---|---|---|---|
| Laterne | Starker Flat-Schaden gegen Okkultes, Brand, Betäubung | Verborgene Spuren und widerlegte Lügen; günstigere Geistsicht | Gegen Menschen fällt der heilige Bonus weg; sichtbare Dochte verteuern Einkäufe |
| Faden | Sichere Waffentreffer, Schwachstelle und Kontrolle | Verbindungen, bestätigte Aussagen, markierte Verknüpfungen | Bleibt von Waffen abhängig; sichtbare Nähte machen Fehlurteile teurer |
| Maske | Verwirrung und Ausweichen, geliehene Gesichter | Neue Gespräche, Handel, Nebenaufträge; bestehende Preis- und Verkaufsboni | Gegen Sonderaktionen schwacher Verwirrungsschaden; fremde Spiegelmiene kostet maximale Nerven |
| Echo | Drain und Betäubung, teils heiliger Schaden | Geistsicht und Stimmen hinter verborgenen Spuren | Drain braucht tatsächlichen Schaden; Atemschrift und Stimmen bremsen die Erholung |
| Kessel | Brand über mehrere Runden, Heilmittel, vorbereitete Schwachstelle | Brauen und Heilmittel verwenden | Brand wird überschrieben statt gestapelt; sichtbare Rückstände erhöhen Preise |
| Eisen | Hoher Waffenschaden, große Lebensreserve und Paraden | Siege und Standhalten im Kampf | Weniger Nervenwachstum; sichtbare Nieten machen Geistsicht teurer |
| Schlüssel | Sichere Waffentreffer, Flucht und Ausweichen | Schlösser, verborgene Funde und Beute | Keine neue robuste Defensive; Schlüssellochschatten verstärken Ansehensverluste |
| Waage | Flat-Schaden **plus Schild bei jeder neuen Angriffsstufe**, keine Betäubung/Verwirrung | Forderungen widerlegen, handeln und Belohnungen abrechnen; Schlussfolgerungs-Ansehen statt Maskenrabatt | Schild muss vor Treffern aufgebaut werden; sichtbare Gewichte machen Rufschäden größer |
| Moor | Flat-Schaden **plus feste Heilung**, keine Okkultverdopplung, kein Drain | Fundschichten und bestätigte Identitäten; verborgene Spuren und Nebenaufträge | Heilung bleibt auch bei Panzer zuverlässig, ist bei voller Gesundheit verschwendet; Schichtenhaut erhöht Preise |
| Uhr | Flat-Schaden, sichere Treffer und Ausweichen; Parade-Konzentration | Zeitabläufe rekonstruieren, Widersprüche widerlegen und parieren | Kein Zurückspulen, keine Betäubung; versetzter Schatten bremst Erholung |

Waage braucht weder einen günstigen Gegenstandskauf noch einen Sieg, um ihre Kampfdefensive zu erhalten. Moor heilt einen festen Betrag und ist damit unabhängig vom tatsächlich angerichteten Schaden des Echos. Uhr konzentriert sich auf defensive Taktfenster und reproduzierbare Treffer statt Waffenwachstum und Flucht des Schlüssels. Neue Ermittlungsrollen nutzen bestehende Ereignisse; die optionale spezifische Belegdarstellung steht in `neue_mechaniken.md`.

## Aufstieg und Risiko

Seq 4 ist bei allen zehn Pfaden eine körperlich sichtbare Zäsur mit einem permanenten Nachteil. Die Veränderung steht sowohl in `desc` als auch in `veraenderung`. Höhere Stufen entwickeln dieses Bild weiter, statt den Preis wieder zu entfernen. Die Namen sind für Nebelakten neu formuliert und an Gaslicht, Pfandwesen, Verwaltung, Torf und Industrie gebunden.

Seq 4 bis 1 benötigen jeweils eine eigene seltene Kernzutat. Alle höheren Rituale verlangen Belege aus beiden bisherigen Kapiteln über `case_09_closed` und `kapitel2_done`; zusätzlich sperrt die Beschaffung der jeweiligen Kernzutat die Stufe. Es gibt keinen Sprung über eine Sequenz. Die hohen Formelschwellen sind 90/110/135/160 Ansehen. Die vollständigen Seq-1-Reihen sind Skizzen für spätere Questdaten, keine bereits eingehängten Quests.

Ein bestandenes Ritual verhindert im aktuellen Spiel nicht das Trankrisiko: selbst bei vollständig verdauter Vorstufe bleibt der Basisanteil 0,03 plus Unruhe/250. Das Ritual selbst erhöht Unruhe um 20 und kostet 20 Nerven. Die dokumentierte Ersatzbeschaffung ist deshalb vor der Integration wichtig. Gekaufte Formeln bleiben erhalten, seltene Kernzutaten müssen erneut erreichbar sein.

## Prüfen

Vom Repository-Stamm aus:

```sh
node docs/story/sequenzen/balancing.mjs > docs/story/sequenzen/balancing.md
node docs/story/sequenzen/pruefen.mjs --selftest
```

Keine Installation erforderlich. Die Skripte verwenden Node-Bordmittel und lesen lokale Engine-/Testhelferdateien, deren Module ebenfalls ohne Phaser laufen. Sie ändern keinen Spielstand und keine Quelldatei. `balancing.mjs` druckt Markdown; nur die explizite Shell-Umleitung schreibt die Berichtdatei. `pruefen.mjs` schreibt nichts und endet bei Fehler mit Status 1.

## Einbaufolge für das Folgepaket

1. Neue Stufen und Wörterbücher in die passenden Datensammlungen übernehmen. Metadatenadapter, Aufstiegsgrenzen und generierte Trank-/Formel-IDs gemeinsam behandeln.
2. Formelzugang, Zutatenquellen, Rückwege und die verlorenen-Trank-Ersatzbeschaffung einbauen. `neu:`-Orte erst nach Auswahl des Kapitel-3-Entwurfs auf echte Karten abbilden.
3. Eigene Skill-FX, Symbole und Auren erzeugen beziehungsweise die dokumentierten Platzhalter über die vorhandene Assetregistrierung einhängen.
4. Die vorgeschlagenen Kontroll- und Wirtschaftsschutzregeln entscheiden und Solo/Duo gegen alle zehn Pfade spielen. Die vorliegenden Schadenskurven ersetzen diese Begegnungstests nicht.
