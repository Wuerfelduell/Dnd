# CU · Varrowmouth: Orte und Gezeiten

Datenentwurf, kein Laufzeit-Einbau. JSON-Grundformen folgen K5: Karten und Reisen als Listen, Zonen/Gespräche/Items als Wörterbücher, Artefakte unter `list`. `city.json` und `zonen_bindung.json` fehlen in K5; als Referenz dient dort `zonen_bindungen.md`. CU-Zusatzfelder brauchen einen Adapter. Keine neuen Kampfwerte.

## Dateien

| Datei | Zweck |
|---|---|
| city.json | Stadt, acht Pins, Händler, Schlafplatz, Büro |
| maps.json | Acht Karten, Tile-Raster, Türen, Sprecher, Licht und Gezeiten |
| zones.json | Drei Zonen mit Rettung und Beute |
| zonen_bindung.json | CZ-Gegnerzuordnung, Gruppen und Stärke |
| travel.json | Zwölf Ereignisse, darunter zwei Koop-Varianten |
| platzierung.json | Zirkelzugang und Artefaktfund |
| items.json / artifacts.json | Zehn Gegenstände und zwei Artefakte |
| dialogues.json | Zoll-, Markt- und Fährgespräche |
| bosses.json | Standorte und bestätigte Auslöser, Werte aus CZ |
| gezeiten.schema.json | Schema für das Feld `gezeiten`, kein Karten-Gesamtschema |
| pruefen.mjs | Node-Prüfung ohne Pakete |

## Mechanik

Vorschlag: Wechsel alle 360 Sekunden aktiver Spielzeit; ein voller Zyklus dauert 720 Sekunden. Das ist eine komprimierte Darstellung der zweimal täglichen Tide, kein Echtzeitkalender. Ein gemeinsamer Zeitgeber gilt für beide Spieler und alle Karten. `gezeit` hat genau einen Wert `ebbe` oder `flut`; die flüchtigen Aliasflags `gezeit_ebbe` und `gezeit_flut` werden exklusiv daraus abgeleitet. Speichern erhält Phase, Restzeit und bereits verwendete Verzögerung. Laden setzt keinen Zyklus zurück.

30 Sekunden vor dem Wechsel läutet die Pegeluhr: Soundgruppe `varrowmouth`, konkreten Sound-Key mit CW abstimmen. HUD: zweigeteilter Ring mit Wasserlinie, Text „Ebbe“/„Flut“, Restzeit und Warnsymbol. CW liefert Grafik; Farbe ist nie der einzige Hinweis.

Beim Wechsel werden zuerst offene Aktionen abgeschlossen oder ohne Kosten zurückgenommen, dann Gezeit, Türen und Kollisionsflächen atomar ersetzt. Rechtecke sind `[x,y,breite,höhe]`, inklusive Start, exklusiv Ende. Außerhalb ihrer Vereinigung ist keine Bewegung möglich. NPCs und Gegner stehen nur auf gültigen Flächen; unzulässige Spawns verschwinden ohne Beute. Bereits besiegte Begegnungen erscheinen nicht durch bloßes Umschalten erneut.

Spieler auf gesperrten Flächen werden zum angegebenen Rettungspunkt gesetzt, ohne Schaden, Geldverlust oder verlorene Questitems. Das gilt auch für beide Koop-Spieler einzeln. Gespräche an verschwundenen Punkten schließen ohne automatische Antwort; schon bestätigte Folgen bleiben, unbestätigte Käufe werden nicht belastet. Sichere Gespräche dürfen weiterlaufen. Menüs und Pausen halten aktive Spielzeit an, Dialoge nicht.

Im Wrackfeld endet ein offener Kampf bei Flut mit „Das Wasser kommt“: Flucht ohne Strafe, ohne Siegflag und ohne Beute. Bereits bezahlte Kampfverbrauchsgüter werden nicht doppelt abgerechnet. Bossversuche starten später neu; dauerhafte Questfortschritte bleiben. Im Registerkeller gilt dieselbe Evakuierung nach `vm_oberstrasse`; die Pegelherrin erhält nur nach beiden abgeschlossenen Phasen ihr Siegflag. Der Einbau muss ausreichend Zeit vor Bossbeginn anzeigen und Warten bis zur nächsten Ebbe anbieten. Sichere Kämpfe auf Leuchtbank/Grenzzaun werden nicht unterbrochen.

Schlafen zeigt vor Bestätigung die Zielphase. Verstrichene Zeit wird einmal berechnet, Zwischenzyklen lösen keine Begegnungen aus. Aufwachen erfolgt auf dem trockenen Steg. Kostenloses Warten an Pegeluhr und Anlegern verhindert Fortschrittsblockaden. Keine Fähigkeit umgeht Story-, Ritual- oder Sequenzsperren.

| Pfad (vorhandene ID) | Optionaler Vorschlag, einmal pro Zyklus |
|---|---|
| laterne | Hochwassermarken durch Nebel lesen |
| eisen | Einen Begleiter ohne Zeitaufschlag auf den Steg ziehen |
| echo | Warnschlag auf einer entfernten Karte hören |
| maske | Eine gewöhnliche Zollkontrolle vermeiden |
| faden | Den sicheren Rückweg sichtbar markieren |
| schluessel | Eine nicht handlungsrelevante Wartungsklappe öffnen |
| kessel | Nasse Ausrüstung ohne Reisepause trocknen |
| sq_waage | Den angezeigten Bootspreis vor Abfahrt festhalten |
| sq_moor | Im Schlick atmen; nur Ebbe-Erkundung, keine Flutfreigabe |
| sq_uhr | Nächsten Wechsel um 60 Sekunden verschieben; gruppenweit einmal, nicht stapelbar |

## Kartenverhalten

| Karte | Ebbe | Flut |
|---|---|---|
| vm_zollhafen | Kai und Zollhaus | Oberkai bleibt offen |
| vm_stegviertel | Markt und Pfahlwege | Nur oberer und westlicher Steg |
| vm_schlickgassen | Begehbar; Nell erreichbar | Gesperrt; vom Steg aus sichtbar; Rettung zum Stegviertel |
| vm_oberstrasse | Alle Wege | Alle Wege, Kellerzugang gesperrt |
| vm_wrackfeld | Zone, größtes Wrack, Kielraum | Nur Oberdeck per Boot; Zone und Zirkel geschlossen |
| vm_leuchtbank | Oberer Wartungsweg und Bank | Oberer Wartungsweg; Anreise nur per Tam-Boot |
| vm_registerkeller | Finale zugänglich | Vollgelaufen; Rettung auf die Oberstraße |
| vm_grenzzaun | Zweierpatrouille oder Zollsiegel | Gleiche Passage |

## Kartenpläne

Das `rows`-Raster ist eine Kollisionsgrundfläche (`I` Rand, `.` Boden); die Gezeitenrechtecke beschränken diese weiter. CV muss die sichtbare Bebauung um die festgelegten Wege legen. Alle Außenkarten sind 48×32, Keller 24×16. Koordinaten beginnen links oben. Die folgenden schematischen Pläne sind nicht maßstäblich.

### Zollhafen

```text
N ↑
+--------------------------------+
| Anleger / Türen (y=4)           |
| Sprecher / Licht (y=6)          |
| Westweg | tiefer Bereich        |
|         | bei Flut gesperrt*    |
+--------------------------------+
```

Verbindungen: vm_stegviertel, vm_oberstrasse, vm_leuchtbank. *Nur für Stegviertel, Wrackfeld und Leuchtbank; Schlickgassen vollständig gesperrt. Oberstraße, Grenzzaun und Zollhafen bleiben trocken.

### Stegviertel

```text
N ↑
+--------------------------------+
| Anleger / Türen (y=4)           |
| Sprecher / Licht (y=6)          |
| Westweg | tiefer Bereich        |
|         | bei Flut gesperrt*    |
+--------------------------------+
```

Verbindungen: vm_zollhafen, vm_schlickgassen, vm_wrackfeld. *Nur für Stegviertel, Wrackfeld und Leuchtbank; Schlickgassen vollständig gesperrt. Oberstraße, Grenzzaun und Zollhafen bleiben trocken.

### Schlickgassen

```text
N ↑
+--------------------------------+
| Anleger / Türen (y=4)           |
| Sprecher / Licht (y=6)          |
| Westweg | tiefer Bereich        |
|         | bei Flut gesperrt*    |
+--------------------------------+
```

Verbindungen: vm_stegviertel, vm_wrackfeld. *Nur für Stegviertel, Wrackfeld und Leuchtbank; Schlickgassen vollständig gesperrt. Oberstraße, Grenzzaun und Zollhafen bleiben trocken.

### Oberstraße

```text
N ↑
+--------------------------------+
| Anleger / Türen (y=4)           |
| Sprecher / Licht (y=6)          |
| Westweg | tiefer Bereich        |
|         | bei Flut gesperrt*    |
+--------------------------------+
```

Verbindungen: vm_zollhafen, vm_registerkeller, vm_grenzzaun. *Nur für Stegviertel, Wrackfeld und Leuchtbank; Schlickgassen vollständig gesperrt. Oberstraße, Grenzzaun und Zollhafen bleiben trocken.

### Wrackfeld

```text
N ↑
+--------------------------------+
| Anleger / Türen (y=4)           |
| Sprecher / Licht (y=6)          |
| Westweg | tiefer Bereich        |
|         | bei Flut gesperrt*    |
+--------------------------------+
```

Verbindungen: vm_schlickgassen, vm_stegviertel. *Nur für Stegviertel, Wrackfeld und Leuchtbank; Schlickgassen vollständig gesperrt. Oberstraße, Grenzzaun und Zollhafen bleiben trocken.

### Leuchtbank

```text
N ↑
+--------------------------------+
| Anleger / Türen (y=4)           |
| Sprecher / Licht (y=6)          |
| Westweg | tiefer Bereich        |
|         | bei Flut gesperrt*    |
+--------------------------------+
```

Verbindungen: vm_zollhafen. *Nur für Stegviertel, Wrackfeld und Leuchtbank; Schlickgassen vollständig gesperrt. Oberstraße, Grenzzaun und Zollhafen bleiben trocken.

### Grenzzaun

```text
N ↑
+--------------------------------+
| Anleger / Türen (y=4)           |
| Sprecher / Licht (y=6)          |
| Westweg | tiefer Bereich        |
|         | bei Flut gesperrt*    |
+--------------------------------+
```

Verbindungen: vm_oberstrasse, hg_grenzbezirk. *Nur für Stegviertel, Wrackfeld und Leuchtbank; Schlickgassen vollständig gesperrt. Oberstraße, Grenzzaun und Zollhafen bleiben trocken.

## Anschlussliste

- CT setzt `k6_arrived` erst nach abgeschlossener Fähre. Bahnereignisse 01–03, Fähre 04–06; 11 ersetzt im Koop Ereignis 06. Die vier Eingänge werden über genau eines von `bha_end_wahl`, `bha_end_winter`, `bha_end_verwahrt`, `bha_end_schmerzlos` gewählt. Bei mehreren Flags ist vor Anreise die kanonische CG-Endauswahl aufzulösen. Texte bewerten kein Ende neu.
- Stadtboote: 07 Zollhafen → Leuchtbank, 08 zurück; 09 Stegviertel → Wrackfeld-Oberdeck, 10 zurück (nur Flut). 12 ersetzt 07 im Koop. Alle Ankünfte werden gegen die dann geltende Gezeit geprüft; bei Phasenwechsel kostenlose Rückkehr zum Ausgangsanleger. Die Slots 07/08 sind bei Ebbe ebenfalls per Boot nutzbar; der Fußweg zur Leuchtbank kann denselben Kartenübergang nutzen, bei Flut ausschließlich Boot.
- `travel.json`-Entscheidungen sind Ereignis-Spezifikation; `result`/`set_flags` atomar pro Ereignis übernehmen. Einmaligkeit in einem Journal je Reise-ID speichern, keine erneute Auszahlung beim Laden. Reiseereignisse haben keine erzwungenen Kämpfe; Gegnerreferenzen sind beobachtete Gefahren.
- CT meldet Akt I/III über lokale Adapterflags `k6_cu_akt1`, `k6_cu_akt3`, Finalfreigabe über `k6_cu_finale_bereit`. Diese Namen beanspruchen keine CT-Storyflags. Büro und Lotsenkammer sind Interaktionspunkte bestehender Karten, keine neuen Innenkarten.
- CX bindet die Sprecherpunkte; Zollgespräch `vm_cu_zoll` an Rat 1, Markt-/Fährgespräche an Tam. Händler sind Dienststellen-IDs ohne erfundene Personennamen. NPC-Definitionen bleiben CX vorbehalten.
- CZ liefert Kampfdefinitionen einmalig. `encounters: {}` ist bewusst wie K5 leer; keine String-Refs als vollständige Encounter laden. Bindungen vor Laufzeit mit CZ auflösen. Grenzpatrouille besteht aus zwei Pegelknechten. Siegelprüfung oder bestätigter Sieg setzt `k6_cu_grenzpassage`; Siegel nicht verbrauchen. Tam vergibt das Siegel nach CTs entsprechender Zollfreigabe, nicht automatisch bei Ankunft.
- Bossflags erst nach vollständigem Sieg setzen. CT darf über einen eigenen Abschlussadapter friedliche Storylösungen an dieselben Ortsfreigaben anschließen. Keine Bosswerte aus CU importieren.
- Zutaten im Wrackfeld: je zwei vorhandene Seq-2-/Seq-1-IDs für Moor und Laterne. Wiederholbare Beute, keine alleinige Pflichtquelle für andere Pfade. DD/CP bleiben für vollständige Ritualversorgung zuständig.
- CP schließt `hg_grenzbezirk` an die Nordtür an und liefert dessen Spawn. DD hängt die zehn `vm_register_<pfad>`-Karten nach `k6_cu_pegelherrin_besiegt` an; CU legt diese Karten nicht an. Seq 2 nur im Grenzbezirk, Seq 1 erst nach Sieg. CT hält Aufstieg und bewussten Verzicht offen und setzt `k6_done` erst nach der Wahl.
- Koop: Beide Namen bleiben eingetragen. CT führt vor dem Schließen eine von beiden bestätigte Auswahl des handelnden Spielers durch; genau eine Schließaktion, zwei darauf bezogene Epiloge. Keine automatische Zuweisung an den Host.
- Artefakteffekte und alle `wirkungsvorschlag`-Angaben brauchen Einbaucode außerhalb CU. Ring nur aus dem Zirkel (Tam-Beziehung ≥3), Linse nach Leuchtfeuerwächter; Questfundflags pro Gruppe, Artefaktvergabe im Koop pro berechtigtem Spieler einmal.
- CV liefert Themes und Props; CW Pegeluhr, Glockenvisual und Gezeitenanzeige. Prop-Keys sind Grafik-Anschlusswünsche, keine behaupteten vorhandenen Assets.
- Keine Rückreise, kein Nachtzug; weder Reiseereignis noch Fähigkeit darf frühere Städte öffnen.

## Prüfung

`node docs/story/k6_orte/pruefen.mjs`
