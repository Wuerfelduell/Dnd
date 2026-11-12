// Paket BN, Einbau: Rufdaten im Inhalt, Horchstellen an den Arbeitsstellen und am Trichter, Ruf mit Vorschau und Flag,
// Namensantwort als persönliche Passive, Schleuse beendet sie, Spielstand trägt alles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { STATION_DIALOGUES } from '../src/data/k3Ruf.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const sr = content.signalRoutes;
const hund = sr.stationen.find((s) => s.id === 'k3o_horch_hund');

function atStation(st = hund) {
  const s = new GameState(content);
  s.map = st.map;
  s.addItem('k3a_signalgeraet');
  for (const a of st.accepted) for (const f of a.requires_flags ?? []) s.flags.add(f);
  return s;
}

test('BN: Rufdaten geladen, fünf Arbeitsstellen bieten die Rufaktion, der Trichter an der Drehscheibe ist gestrichen', () => {
  assert.equal(sr.stationen.length, 6);
  assert.equal(Object.keys(sr.texte).length, 37);
  for (const [station, dialog] of Object.entries(STATION_DIALOGUES)) {
    const d = content.dialogues[dialog];
    const c = d.nodes[d.start].choices.find((x) => x.signal_station === station);
    assert.ok(c, dialog);
    assert.ok(c.requires_items.includes('k3a_signalgeraet'));
  }
  assert.ok(!content.maps.ds_schwellenring.interactables.some((i) => i.id === 'k3r_trichter_drehscheibe'));
  const s = new GameState(content);
  assert.ok(s.signal.learnedPatterns instanceof Set);
});

test('BN: Muster lernen, Vorschau ohne Kosten, Ruf setzt das AS-Vorbereitungsflag und kostet eine Ladung', () => {
  const s = atStation();
  const pattern = hund.accepted[0].pattern;
  assert.equal(s.previewCall(hund.id, pattern, 'north').reason, 'unlearned');
  s.applyEffects({ learn_pattern: pattern });
  assert.ok(s.meets({ requires_pattern: pattern }));
  const pv = s.previewCall(hund.id, pattern, 'north');
  assert.equal(pv.ok, true);
  assert.equal(s.signal.charges, 3, 'Vorschau kostet nichts');
  const { handled, result } = s.confirmCall('t1', hund.id, pattern, 'north');
  assert.equal(handled, true);
  assert.equal(result.kind, 'route');
  assert.ok(s.flags.has('k3o_falscher_pfiff'));
  assert.equal(s.signal.charges, 2);
  assert.equal(s.confirmCall('t1', hund.id, pattern, 'north').handled, false, 'gleicher Befehl nur einmal');
  const d = content.dialogues[STATION_DIALOGUES[hund.id]];
  assert.equal(s.meets(d.nodes[d.start].choices.find((x) => x.signal_station === hund.id)), false, 'nach dem Erfolg verschwindet die Rufaktion');
});

test('BN: Namensantwort bindet nur den Sprecher (fünf Höchstnerven weniger, Unruhe), die Schleuse löst sie', () => {
  const dreh = sr.stationen.find((x) => x.id === 'k3o_horch_drehscheibe');
  const s = atStation(dreh);
  s.addP2();
  s.pathway = { id: 'laterne', seq: 7, digestion: 0 };
  const maxBefore = s.maxComposure();
  assert.equal(s.acceptPrivateAnswer('b0', dreh.id, 1).handled, false, 'ohne Angebot keine Bindung');
  assert.equal(s.offerPrivateAnswer(dreh.id, 1).ok, true);
  const { handled, result } = s.acceptPrivateAnswer('b1', dreh.id, 1);
  assert.equal(handled, true);
  assert.ok(s.flags.has(result.flag));
  assert.equal(s.maxComposure(), maxBefore - 5);
  assert.equal(s.passive('unruhe_tick'), 1);
  assert.equal(s.artifactUnruhe(), 1, 'Bindung wirkt ohne Artefakt');
  assert.equal(s.withPlayer(2, () => s.passive('unruhe_tick'), { quiet: true }), 0, 'der Partner bleibt frei');
  const data = JSON.parse(JSON.stringify(s.serialize(null)));
  const t = new GameState(content);
  t.load(data);
  assert.ok(t.signal.bindings[1]);
  assert.equal(t.maxComposure(), maxBefore - 5);
  t.map = 'ds_speisewagen';
  const lock = t.enterLock('ds_speisewagen', 'k3r_schleuse_speisewagen');
  assert.equal(lock.ended.length, 1);
  assert.equal(t.maxComposure(), maxBefore);
  assert.equal(t.enterLock('ds_speisewagen', 'k3r_schleuse_klopfbruch').ok, false, 'fremde Schleuse');
});

test('BN: falscher Ruf ohne Lauscher führt sicher zurück, kostet höchstens fünf Nerven und kein Wissen', () => {
  const s = atStation();
  s.applyEffects({ learn_pattern: 'k3a_ruf_rund' });
  const before = s.composure;
  const { result } = s.confirmCall('w1', hund.id, 'k3a_ruf_rund', 'north');
  assert.ok(['fallback', 'alarm'].includes(result.kind));
  assert.ok(before - s.composure <= 5);
  assert.equal(s.signal.charges, 2);
  if (result.kind === 'fallback') assert.deepEqual(s.pendingTravel, { map: hund.map, spawn: 'default' });
  assert.ok(!s.flags.has('k3o_falscher_pfiff'));
});
