# BG – Persönliche Koop-Beute

Eigenständiges Logik- und Datenpaket; noch nicht in das Spiel eingebunden. Es ändert keine vorhandene Datei. `Claims.js` braucht kein Phaser. Integration, Bestandsmigration und die nicht belegbaren Artefaktquellen stehen in `offene_punkte.md`.

| Gemeinsam, einmal pro Spielstand | Persönlich, je Spieler |
|---|---|
| Geld, Ehre, Fall-/Questabschluss und Weltflags | Kernzutat aus einem bewältigten Hüter-/Prüfungsereignis |
| Freischaltung einer Quelle (Kampf oder friedlich) | Offen / eingelöst / verfallen je Quelle und Spieler |
| Schränke: `storage` und alle `stashes` | Inventar, Ausrüstung, Pfad, Sequenz |
| Keine wiederholte Questprämie durch Ersatz | Ritualfortschritt über bestehendes `ritualFlag` bzw. `p2_ritual_*` |
| Gewöhnliche Beute und nicht persönliche Artefakte bleiben unverändert | Artefakte ausschließlich mit explizitem `personal: true` im Belohnungseintrag |

## Lieferung

- `ansprueche.json`: 14 belegte Quellen, 43 Zutatenoptionen (33 Hüterzutaten, 10 Prüfungszutaten). Kampf-/Friedensflags sind Aliasse derselben Quelle.
- `ersatz.json`: 90 Zeilen, zehn Pfade × neun Zielsequenzen; konkrete Trank-/Formel-/Kern-IDs, Quelle, Ort, Preis, Voraussetzung.
- `texte.json`: 32 deutsche Kurztexte einschließlich Vorlagen, jeweils höchstens 140 Zeichen.
- `dialog_zusaetze.json`: ausschließlich `choices_add`/`nodes_add` für Heddas, Pfiffs und Kitterings bestehende Dialoge.
- `Claims.js`: Anspruchsverwaltung, sichere Spieleransprache, Lagerprüfung, Ersatzangebote und atomare synchrone Befehlsverarbeitung ohne gemeinsame Belohnungen.
- `tests/koop_beute.test.js`: dieselben Tests laufen unter Vitest und dem bestehenden `node:test`-Runner; kein Wechsel des Projekt-Testsystems erforderlich.

## API-Vertrag

Den beiden Datenobjekten im geladenen Inhalt die Namen `claimSources` und `claimReplacements` geben, `claimMethods` an `GameState.prototype` hängen und bei neuem Spiel `resetClaims()` aufrufen.

`openClaims(flagOderQuelle)` setzt ein bereits vorhandenes Weltflag voraus. `syncClaims()` ergänzt Ansprüche für aktive Spieler und späte Beitritte, ohne abgeschlossene Ansprüche zurückzusetzen. K.o. ist kein Ausschlussgrund. Entfernte Spieler behalten ihren Datensatz, können während ihrer Abwesenheit aber nichts abholen.

`claimFor(source, player)` gibt `{ item, qty, reason }`, einen offenen Hinderungsgrund mit `item: null` oder `null` zurück. Kein Pfad und eine noch nicht ausreichende Sequenz verbrauchen den Anspruch nicht. Die Seq-Grenzen sind exakt diejenigen der Bestandsfächer: kleiner bedeutet stärker. Prüfungen verlangen Seq 5 oder besser; die Hüterfächer sind schon ab dem im Bestand angegebenen Pfadzugang verfügbar.

`redeem(commandId, source, player)` zahlt einmal in die persönliche Tasche. IDs gelten spielstandweit; ein Befehl für p1 und ein Befehl für p2 benötigen verschiedene IDs. Nur erfolgreiche Transaktionen verbrauchen eine ID. Der Anspruch schützt zusätzlich gegen neue IDs für dasselbe Ereignis. `forfeit` lässt bereits eingelöste Beute unangetastet.

`replacementCheck` liefert einen Ablehnungsgrund oder das Angebot. `replacementFor(player, seq, options)` liefert nur `{ item, where, cost }` oder `null`. Für Formeln `options.kind = 'formula'`; diese dürfen auch bei vorhandener Kernzutat erneut gekauft werden, aber niemals bei vorhandenem Zieltrank oder vorhandener Formel. Die ursprünglichen Ehren-Schwellen bleiben erhalten, zufälliges Händlerauftauchen entfällt für diesen Ersatzdienst. `redeemReplacement` prüft alles beim Bestätigen erneut und bezahlt aus dem gemeinsamen Geldbeutel. Hedda liefert kostenlos eine Zutat nach sicherer Gegenprobe, keine Prämie. Ersatz vor erster regulärer Abholung erfüllt denselben Anspruch.

Lager sind im Bestand nicht nach Besitzer getrennt: Ein dort liegender passender Trank oder Kern blockiert beide Spieler desselben Pfads. Taschen bleiben persönlich. Deshalb alle Verstecke einschließlich Büro prüfen, nicht nur den aktuellen Aufenthaltsort.

Für frühe bzw. gekaufte Zutaten speichert `recordClaimAcquisition` eine persönliche Erwerbsquittung, nachdem der erfolgreiche Kauf/Fund die echte Zutat oder den Trank ins Inventar gegeben hat. Die Quittung schaltet keinen Questfortschritt frei. `selectClaimPathway` ermöglicht eine Auswahl vor Seq 9, ohne vorzeitig den Pfad zu setzen. Der Erstkauf ist kein Ersatz und benötigt weiterhin seinen normalen Händleradapter.

`meetsClaims` unterstützt `requires_claim` (offen), `requires_claim_missing` (bewältigt und noch nicht ausgezahlt), `requires_p2` (handelnder Spieler ist p2) und `requires_replacement`. `applyClaims(e, {commandId})` verarbeitet `claim` oder `replacement`; ohne Befehls-ID gibt es keine Auszahlung. Alle Bedingungen eines Knotens zusätzlich am Bestätigen prüfen.

`serializeClaims()` liefert ein unabhängig kopiertes Save-Fragment. Nach `GameState.load` inklusive `loadParty` ruft der Adapter `loadClaims(data)` auf. Save-Zeitpunkt nur nach abgeschlossener synchroner Transaktion. Alte Saves benötigen zuerst die dokumentierte Migrationsentscheidung.

## Prüfen

```sh
node docs/story/koop_beute/pruefen.mjs
node --test tests/koop_beute.test.js
npx vitest run tests/koop_beute.test.js
npm test
npm run build
```

Vitest 3.2.4 kann für diese Abnahme lokal mit `npm install --no-save --package-lock=false vitest@3.2.4` installiert werden. Manifest und Lockdatei bleiben unverändert. Der Prüfer gleicht Quellen gegen tatsächlich gesetzte Flags und Combat-Siegflags, Items gegen `loadContent()`, Preise gegen Kitterings geladenes Sortiment und alle 90 Kombinationen ab. Der Build kann die noch nicht eingebundene Spieloberfläche nicht abnehmen; dafür gilt die Einbau-Checkliste.
