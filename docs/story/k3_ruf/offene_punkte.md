# BN — genaue Einbaupunkte und abgeglichene Quellen

Dieses Paket ändert ausschließlich seine neun neuen Dateien. Die folgenden
Ausschnitte sind Vorschläge für den separaten Integrations-PR, nicht schon aktiver
Spielcode. BA stellt die Grafik in `manifest-dunscar4.json` bereit.

## 1. Daten und GameState

**`src/data/index.js`, nach `buildContent(...)`:** vier JSON-Dateien wie andere
Vite-JSON-Importe laden und unverändert als gemeinsamen Datenblock anhängen.

```js
import stationen from './packs/k3_ruf/stationen.json';
import klang_zuordnung from './packs/k3_ruf/klang_zuordnung.json';
import bindungen from './packs/k3_ruf/bindungen.json';
import texte from './packs/k3_ruf/texte.json';
content.signalRoutes = { stationen, klang_zuordnung, bindungen, texte };
```

**`src/core/GameState.js`:** Methoden importieren und beim vorhandenen
`Object.assign` ergänzen. Bei `reset`, `serialize`, `load` an den angegebenen
Stellen aufrufen; Daten müssen vor dem ersten Reset verfügbar sein.

```js
import { signalRouteMethods } from './SignalRoutes.js';
Object.assign(GameState.prototype, signalRouteMethods); // neben bestehendem Object.assign
this.resetSignalRoutes(); // reset(): direkt NACH resetSignal()
...this.serializeSignalRoutes(), // serialize(): neben ...serializeSignal()
this.loadSignalRoutes(data); // load(): direkt NACH loadSignal(data)
```

Die letzte Zeile muss vor der abschließenden UI-Aktualisierung ausgeführt werden.
`serializeSignalRoutes` liefert `signalRoutes`, nicht `signal`: kein Überschreiben
von Rufladungen und Reserven. Beim Reset nur neue Teilfelder initialisieren.

**`GameState.meets`, `applyEffects`, `tick`:** neben den Signal-Aufrufen ergänzen.

```js
this.meetsSignalRoutes(o) && // in meets() vor dem letzten Ausdruck
this.applySignalRoutes(e); // applyEffects(): nach dem Setzen von Flags
this.tickSignalRoutes(dtSeconds); // tick(): genau einmal pro gemeinsamem Zustand
```

Die Effektfelder sind `learn_pattern: id`, `reveal_route: "station:dir"` und
`enter_lock: {map,id}`. Beim Erwerb einer AR-Musterquelle zusätzlich `learn_pattern`
ausführen; bereits gefundene Quellen erkennt BN auch ohne Änderung der Altdaten.
Nur existierende Stationsrichtungen werden für `reveal_route` akzeptiert.

**Persistenz/Koop:** Jede neue Bestätigung bekommt beim ersten lokalen Klick eine
stabile ID (z. B. `crypto.randomUUID()`). Derselbe Koop-Befehl muss bei beiden
Übertragungen dieselbe ID behalten. Nur die autoritative Instanz darf bestätigen.
`handled` ist absichtlich auf 64 Einträge begrenzt: alte Sequenznummern auf
Transportebene verwerfen, statt nach 64 neueren Kommandos erneut zuzustellen.
`signal_route`, `signal_binding`, `signal_lock` als Speicheranlässe behandeln.
Fallback-Reise nach Dialogschluss ausführen, dann speichern; `pendingTravel` ist
wie bisher kein dauerhaft gespeicherter Szenenübergang.

## 2. Persönliche Passive und Zeit

**`src/core/Pathways.js`, `passive(key)`:** die Liste der aktuell handelnden Person
ergänzen. Die echte Engine heißt `max_nerves`, nicht das Beispiel `nerves_max`
aus dem Prompt. Die Bindungsdaten benutzen den tatsächlich wirksamen Schlüssel.

```js
const lists = [...this.reachedSeqs().map(s => s.passives ?? []),
  ...this.artifactEffects(), ...this.gearEffects(),
  this.bindingPassive(this.acting ?? 1)];
```

**`src/core/Artifacts.js`, `artifactUnruhe()`:** der bisherige frühe Rücksprung
`if (!n) return 0` würde Bindungen ohne getragenes Artefakt unterdrücken. Ersetzen:

```js
const n = this.activeArtifacts().length;
if (!n) return Math.max(0, this.passive('unruhe_tick'));
const rules = this.artifactRules(); // bestehende Berechnung für n > 0 beibehalten
```

Den Bindungswert nicht noch einmal direkt in `tickPathway` addieren: mit obiger
Ergänzung ist er bereits in `artifactUnruhe()` enthalten. Beim Bindungsereignis
für den betroffenen Spieler `setComposure(Math.min(composure,maxComposure()))`
aufrufen. `tickParty` benutzt bereits `withPlayer(2,...)`; die Partnerwerte werden
dadurch getrennt berechnet. `bindings` gehört **nicht** in `Party.PERSONAL`.

## 3. WorldScene: Kollision, Bestätigung und Schleusen

**`src/world/WorldScene.js`, nach Karten-/Blocker-Aufbau und vor Vorschau:**
`signalRouteContext` mit aktuellen Daten versorgen. Das existierende
`TapMove.blockedGrid()` berücksichtigt Boden und Blocker; alternativ denselben
Rastercode in eine gemeinsame reine Funktion auslagern. Kein zweiter abweichender
Phaser-Kollisionstest allein über den Boden.

```js
const { grid, w, h } = this.tap.blockedGrid(); // vorhandene TapMove-Instanz in WorldScene
this.state.signalRouteContext = {
  isWalkable: (map,x,y) => map === this.state.map && x>=0 && y>=0 && x<w && y<h && !grid[y*w+x],
  listeners: () => this.roamers.list.map(r => ({id:r.def.id,encounter:r.id,alive:r.alive,tile:[Math.floor(r.body.x/16),Math.floor(r.body.y/16)]})),
};
```

Raster vor **jeder** Vorschau/Bestätigung aktualisieren, damit bewegliche Blocker
nicht veralten. `closedLocks` und `insideLock` anschließend aus der tatsächlich
geschlossenen Schleusentür bzw. dem abgeschirmten Bereich ergänzen; unbekannte
Kacheln bleiben konservativ gesperrt. Im Speisewagen ist Bindung ohnehin verboten.
Ein Schleusen-Overlay darf nicht den einzigen normalen Fußweg entfernen.

**Rufaktion:** Spieler an Stationskachel/Interaktionsreichweite prüfen; der Kern
prüft Karte, Muster, Richtung, Ladungen und Kollision. `preview.tiles` gestrichelt,
`safeTiles` als Nischen und `listeners` mit Hörkreis darstellen. Vor dem ersten
Klick `warning` UND `risk` anzeigen, inklusive Lautlos-/Bewegungsreduktionsmodus.

```js
const preview = state.previewCall(station.id, patternId, dir);
if (!preview.ok) return showText(preview.text);
showPreview(preview.tiles, preview.safeTiles, preview.listeners, preview.warning, preview.risk);
// Erst der getrennte Bestätigungsbutton ruft auf; erneute Übertragung behält commandId:
const { handled, result } = state.confirmCall(commandId, station.id, patternId, dir);
```

`showText`/`showPreview` sind zu implementierende UI-Adapter, keine vorhandenen
Methoden. Auf `signal_route` `result.form` und bei `route` die `routeTiles` zeichnen;
`alarm.tiles` nur als Suchzone, keinen Sofortkampf auslösen. `fallback` benutzt die
vorhandene `pendingTravel`-Abwicklung in `Ui.close()`. Die bisherigen Dialogknoten
mit `signal:'call'` nicht zusätzlich aufrufen, sonst entstünde doppelte Abbuchung.
Die BN-Antworten setzen dieselben fünf Vorbereitungsflags wie diese Knoten.

**Schleusen:** fünf neue `k3r_schleuse_*`-IDs aus Stationsdaten an die dort genannten
begehbaren Eingänge hängen. Erst nach vollendetem Übergang und aktualisiertem
`state.map` aufrufen; nicht beim bloßen Anzeigen einer Tür. Kein Aufruf aus einer
beliebigen anderen Karte. Alle Bindungen enden gemeinsam nach einem Schleusenwechsel.

```js
state.enterLock(lock.map, lock.id); // nur nach tatsächlichem Durchtritt
state.cancelPrivateAnswer(1); // zusätzlich bei Kartenwechsel oder geschlossenem Dialog
state.cancelPrivateAnswer(2);
```

Den Zusatz-Zeittakt in `GameState.tick` platzieren; `WorldScene.update` ruft ihn
bereits nur bei `!ui.isBlocking() && !leaving` auf. Nicht zweimal in WorldScene
und GameState ticken. `routeTime` ist pausierbare Spielzeit, niemals `Date.now()`.

## 4. Ui: Journal und ausdrückliche private Zustimmung

**`src/ui/Ui.js`, Journal-Tab neben Fallnotizen:** bekannte Muster nach
`learnedPatterns`/Quellenwissen zeigen. `signSymbol(id)` ist ein 16×16-Frame aus
`ui/ds_rufmuster.png`; BA liefert Journalrahmen und Zustandsrahmen. Zusätzlich
immer Name, Herkunft, AR-Form und Bedeutung textlich anzeigen. AYs `zeichen`
ist eine Audiotranskription, kein Ersatz für die AR-Beweisbeschreibung.

```js
const iconFrame = state.signSymbol(patternId);
const audio = state.patternSound(patternId);
const entry = station.patterns[patternId];
// iconFrame + entry.source/form/meaning und audio.zeichen gemeinsam rendern
```

**Privatantwort-Dialog:** innerhalb `withPlayer(speaker,...)` zunächst
`offerPrivateAnswer` anzeigen, dann getrennte Schaltflächen „Meinen Namen bewusst
antworten“ / „Schweigen“. Die Bestätigungsfunktion darf nicht beim Öffnen laufen.

```js
state.withPlayer(speaker, () => state.offerPrivateAnswer(station.id, speaker));
// Warnung und persönliche Passive zeigen; nur der ausdrückliche Bestätigungsklick:
state.withPlayer(speaker, () => state.acceptPrivateAnswer(commandId, station.id, speaker));
// Abbruch / Dialog schließen:
state.cancelPrivateAnswer(speaker);
```

Wird das angebotene Gespräch während eines Kartenwechsels verworfen, zwingend
abbrechen. Laden verwirft Angebote automatisch. Keine automatische Namensantwort
bei normalen Dialogen, Schlussfolgerungen oder einem gewöhnlichen Ruf.

## 5. sounds.js / MusicDirector

**`src/core/sounds.js`, `eventSound`/`wireSounds`:** neue Signalereignisse können
über die Daten zugeordnet werden, sollen aber **nicht** als OGG/WAV-ID blind an
`Audio.play` gehen. AY liefert JSON-Notensammlungen, keine SFX-Dateien.

**`src/core/MusicDirector.js`, nach Instrumentbank-Laden:** separaten
`MusicSynth` für Rufklänge bereitstellen, damit dessen `spiele()` keine laufende
Hintergrundmusik wegblendet. `MusicSynth.ladeManifest` liest derzeit `tracks`,
AYs Manifest aber `klaenge`; zusätzlich Sammlungen `stuecke` einzeln laden:

```js
await signalSynth.ladeManifest(`${base}audio/manifest-klang-dunscar.json`); // Instrumente laden
const bank = await fetch(`${base}audio/musik/ds_klaenge_rufe.json`).then(r => r.json());
for (const score of Object.values(bank.stuecke)) await signalSynth.lade(score);
const sound = state.patternSound(patternId);
if (sound) await signalSynth.spiele(sound.call, { blende: 0 });
```

Analog `ds_klaenge_horchen.json` für die sechs vorhandenen UI-Klänge vorbereiten.
Nach der Rufdarstellung den zugeordneten Hall mit eigenem Bestätigungsereignis
abspielen; beim Replay nur Audio/Grafik, niemals erneut `confirmCall`. Lautstärke,
Stummschaltung und User-Gesture-Start wie beim vorhandenen Director behandeln.
Die `.volume`-Werte des AY-Manifests beim Sample-/Notenadapter berücksichtigen.

`bindung_an` und `bindung_aus` fehlen in AY. Deshalb im neuen Mapping `sound:null`
mit vollständigem Text/Form; keinen erfundenen Klang registrieren. Ein späteres
Audio-Paket kann die zwei Klänge ergänzen. Vier AY-Musterpaare 13–16 bleiben frei.

## 6. Roamers: Hörweite ist nicht Sichtaggro

**`src/world/Roamers.js`, `signal_route`-Listener und Update:**

```js
const hearing = state.hearingOf(r.id); // Elite-Ableitung wird unterstützt
const heard = event.listeners.find(l => l.id === r.def.id);
if (heard && event.alarm) r.target = event.alarm.tiles.at(-1); // Kachelziel adaptieren
// vorhandene roam.aggro für normale Sichtjagd beibehalten, nicht global ersetzen
```

Die reale Suchsteuerung muss Kachelziel in Pixel umrechnen, Nischen respektieren
und bei `signal_alarm_end`/`signal_lock` zurücksetzen. Kein Wissen über die aktuelle
Spielerposition aus dem Ruf ableiten. Der Adapter liefert bewegte Instanzpositionen,
nicht nur die Spawnkacheln aus stationen.json. In den aktuellen Karten stehen die
Startwachen oft außerhalb der sechs Kacheln langen Rufkorridore; BN versetzt sie
nicht heimlich näher an die Station.

## Quellenabweichungen bewusst aufgelöst

- AS/rufmechanik und aktuelle maps.json: Trichter `(34,3)`, sonst `(4,9)`.
  AR/horchstellen.json enthält ältere `(9,9)`-Vorschläge und weitere Prüfstellen;
  BN verändert diese Datei nicht und implementiert genau die sechs verlangten AS-Stationen.
- Drehscheibe: AR identifiziert `k3a_ruf_weg`, AS sagt allgemein Depotpfiff.
  BN bestätigt nur die sichtbare Route. Es existiert kein AS-Vorbereitungsflag
  dafür; weder `k3n_drehscheibe_offen` noch AR-Deduktionen werden erfunden/gesetzt.
- Rettungsschläge: AS nennt vier–Pause–zwei, AR drei Punkte/Pause/zwei Striche.
  Die bestehende AR-Muster-ID und ihre Form bleiben verbindlich im Journal;
  AS-Tafel später redaktionell angleichen. Kein Rhythmusrätsel voraussetzen.
- Bahnsteig: BN-Vertrag verlangt sicheren Halt (`k3a_ruf_halt`), ARs separate
  Konfrontation nutzt Ausfahrt. BN setzt nur `k3o_rolle_getrennt`, kein Kapitelende.
- Tiefe: kein eigenes AR-Muster „drei Leerstellen“. Der vorhandene personenfreie
  Ruf `k3a_ruf_leer` begrenzt die Lücken; es wird kein dreizehntes Muster erfunden.
- AX bietet elementare Symbolformen, keine exakte vollständige AR-Notation.
  Die zwölf Indizes sind eindeutige Merkhilfen; vollständige Form als Text zeigen.
- Prompt nennt Vitest, das tatsächliche Repo benutzt `node:test`. Tests bleiben
  beim bestehenden Runner und benötigen keine zusätzlichen Abhängigkeiten.
