# Übergabe für den Einbau

## Erforderliche Integration

1. Die acht Standarddateien wie `wx_nebenquests` als `k2_orte` an `applyQuestPack` übergeben. `encounters.json` und `dialog_zusaetze.json` sind bewusst leer. Nicht zusätzlich die Monster aus `zone.json` in `encounters.json` kopieren: der Zonenlader erzeugt Kampf-, Loot- und Elite-Einträge.
2. Vor `buildContent` die Liste aus `maps.json` an Wexmoors `maps` und das Objekt aus `zone.json` an `wexmoor.zones` anhängen. `applyQuestPack` lädt selbst noch keine neuen Karten oder Zonen. Die drei festen Karten-IDs vorher auf Kollision prüfen.
3. `travel.json` an Wexmoors `travel` anhängen. `zone.wx_torfbrueche.travel` erzeugt das Torfbrüche-Ziel automatisch, daher keinen zweiten Eintrag anlegen. Beim Lichtamt bleibt die reale Zielkarte `wx_oberstadt`; ein direkter Eintrag nach `wx_lichtamt` würde Verkleidung/Schlüssel umgehen.
4. `artifacts.json.list` an `pathways.artifacts.list` anhängen, bevor Artefaktgegenstände erzeugt werden. `brautkranz` wird dadurch zu `kind: artifact`. Nicht noch einen abweichenden Eintrag in `items.json` anlegen. Die feste Belohnung hat `source: quest` und wird nicht zufällig gedroppt.
5. Die fünf Ergänzungen aus `platzierung.json` durch den Standardlader anwenden. Vorhandene Spawns werden benutzt, daher braucht es keine neuen Spawn-Felder auf Basiskarten. Die Datenprüfung kontrolliert auch die bereits eingebauten AB-Platzierungen und, falls vorhanden, die AL-/AQ-Entwürfe. Bei späteren AL/AP/AQ-Ergänzungen die Anschlusskacheln erneut vergleichen.

Die echte Zusammensetzung nach Schritten 1–4 wird in `pruefen.mjs` im Speicher durchgeführt. Es werden keine Quelldateien verändert.

## Kartenmarker und Zugang

Neue Pins in `wexmoor.city.pins`, Koordinatenvorschlag auf der vorhandenen Stadtkarte:

| Sichtbarer Ort | Pin / Bildwunsch | Vorschlag | Besonderheit |
|---|---|---|---|
| Floßfriedhof | `wx_flossfriedhof`, Floß mit Kreuz aus AN | (428,225) | Ab `k2o_friedhof_offen` |
| Torfbrüche | `wx_torfbrueche`, Stolleneingang aus AN | (49,229) | Ab `k2o_torf_offen`, Tier 3 |
| Lichtamt | Gebäude mit Linse aus AN | (288,42) | `travel.map` bleibt `wx_oberstadt`, Ziel (1,7), dann Außentür (17,4) bzw. (20,4) |

Die Pin-Positionen sind Wünsche, noch nicht im gerenderten Stadtbild geprüft. Der bestehende Reisecode adressiert Pins über `map`, nicht über eine eigene Ziel-ID. Für einen **separaten** Lichtamt-Marker mit Ziel Oberstadt braucht der Einbau entweder eine UI-Zuordnung oder zunächst den vorhandenen Oberstadt-Pin. Dafür wurde kein erfundenes `marker_id`-Feld in die Reisedaten geschrieben. Inhaltlich bleibt der Zugang über beide Außentüren vollständig vorhanden.

`k2_wear_akademierobe` wird unverändert vom bestehenden Kleiderhaken gesetzt/gelöscht. Die Kontrolle prüft dieses Flag und nicht bloß den Besitz der Robe. Optional beim Einbau die passende Polizeiverkleidung auf `wx_lichtamt` und den Torfkittel auf `wx_flossfriedhof` erweitern. Ohne Erweiterung gilt innerhalb dieser Karten das bestehende Fehlverkleidungsverhalten; Türen, Schlüsselroute und Deckung bleiben nutzbar. Ein Schlüssel bietet keine Tarnung.

## AN, AO und vorläufige Bilder

AN besitzt bereits alle drei Tilesets, Orts-Props, Monster-/Bossbilder, Kartenfiguren, Bossband, Kampfhintergründe, sieben Beute-/Artefakt-Icons und Kartenmarker. AO besitzt die drei neuen NPCs. Keine doppelte Bildbestellung in AM.

Die Karten verwenden jetzt ausschließlich vorhandene Tilesets/Deko. Gegner behalten die vereinbarten `enemy_<id>`-Keys, die erst mit AN geladen werden. Bis dahin müssen deren Alias-Zuordnungen aus `grafikwuensche.md` beim Einbau registriert werden. Dasselbe gilt für die drei NPC-Sheets und Item-Icons. Keine `platzhalter`-Felder in Laufzeit-JSON.

AN zeichnet die Moorbraut mit einer zweiten visuellen Phase. AM erfindet dafür kein unbelegtes Datenfeld und keine neue Phasenmechanik. Beim Grafikanschluss kann die vorhandene HP-/Animationsauswahl genutzt werden; Kampfwerte und Ringgewinn bleiben dieselben. Das Gasnest ist mit vorhandenem grünem Licht und Lesetext erkennbar. Neue Blubberanimationen gehören zu AN; eine periodische Gasschadensmechanik wird nicht vorausgesetzt.

## Optionale Verbindung zu Hauptstory und AQ

`k2o_amt_tilgt` und der Hinweis `k2o_fortgeltung` können Marlowe später eine zusätzliche belegte Reaktion geben: Brandt erneuerte eine alte Sperre, statt einen historischen Fehler zu berichtigen. Das ist **kein Ersatz** für die Prozessvoraussetzungen oder das Ratsbuch. AM schreibt keine Wahlmöglichkeiten in Marlowes Dialog und ändert keine bestehenden Deduktionen/Enden.

AQ darf, nach gemeinsamer Abstimmung, auf `k2o_ende_name` reagieren. AM liest/setzt keine `k2g_*`-Flags und legt weder `namensgilde`, ihre Figuren noch deren Treffpunkt an. Namen und Marker der übrigen Ausbaupakete bleiben unberührt.

## Spieltests nach Einbau

- Verkleidung im Kahn an-/ausziehen; Haupteingang entsprechend gesperrt/offen. Schlüsselroute auch nach Corvins Verrat nutzbar. Beide Innenausgänge ohne Schloss.
- Kamera, Sichtkegel, Pixelkollisionen und Grauspäher-Routen auf allen neuen Karten ansehen. Tile-BFS und konservative Deko-Sperren sind geprüft; exakte Sprite-Kollisionskörper und Lichtsicht sind ein separater Spieltest.
- Speichern/Laden vor Boss, nach Niederlage und nach Ringgewinn; beide Nichtverkaufs-Enden nach allen Hauptstory-Enden erreichbar. Nach Gerichts-/Moor-Ende darf Corvin kein Geld im Namen des aufgelösten/entmachteten Amts mehr bieten.
- Boss erscheint hier als anklickbare, bewusste Begegnung am Becken, nicht als automatisch startender Karten-Roamer. Keine zweite ungesperrte Bossquelle beim Grafikanschluss hinzufügen. `won_moorbraut` und `loot.repeat: false` schützen den einmaligen Gewinn.
- Hauptstory, bereits eingebaute AB-Aufträge und Gefährten bleiben unabhängig. Kein Abschluss der neuen Kette setzt `k2_akt4_done`, `k2_akt5` oder `kapitel2_done`.
