// Altmarkt, Taverne und die sechs neuen Nebenaufträge über die echten Dialoge und Objekte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, use, fight } from './helpers.js';

const content = loadContent();
const WIN = { defend: (i) => (i % 2 ? 'miss' : 'dodge'), healBelow: 15 };

function fresh(honor = 20) {
  const s = new GameState(content);
  s.honor = honor;
  ['briefed_01', 'travel_ashgrove'].forEach((f) => s.flags.add(f));
  s.addItem('schlagstock');
  s.equip('schlagstock');
  return s;
}

test('Altmarkt ist nach Ashgrove auf der Stadtkarte erreichbar, Taverne über die Tür', () => {
  const s = fresh();
  const t = content.travel.find((x) => x.map === 'altmarkt');
  assert.ok(s.meets(t));
  const door = content.maps.ashgrove.interactables.find((i) => i.id === 'tavern_door');
  assert.equal(door.to, 'tavern');
  assert.ok(content.maps.ashgrove.spawns.tavern);
  assert.equal(content.maps.ashgrove.rows[0].length, 64);
});

test('Gezinkte Würfel: Mauds Verdacht ist falsch, zwei Quellen überführen Silas', () => {
  const s = fresh();
  talk(s, 'maud', ['Ärger', 'sehe mich um']);
  assert.equal(s.quests.dice, 'active');
  assert.equal(s.factStatus('tobias_cheats'), 'suspected');
  use(s, 'tavern', 'dice');
  talk(s, 'silas', ['gezinkt']); // mit nur einer Quelle bloß ein Bluff
  assert.ok(!s.flags.has('silas_resolved'));
  use(s, 'ashgrove', 'yard_dice');
  assert.equal(s.factStatus('silas_cheats'), 'likely');
  assert.equal(s.factStatus('tobias_cheats'), 'refuted');
  talk(s, 'silas', ['gezinkt', 'Revier']);
  assert.equal(s.pendingCombat, 'silas_fight');
  const { result } = fight(s, 'silas_fight', WIN);
  assert.equal(result.outcome, 'won');
  talk(s, 'maud', ['betrügt']);
  assert.equal(s.quests.dice, 'done');
  assert.equal(s.itemCount('gewuerzwein'), 2);
});

test('Gezinkte Würfel: Wer Tobias beschuldigt, verliert den Auftrag und Ansehen', () => {
  const s = fresh();
  talk(s, 'maud', ['Ärger', 'sehe mich um']);
  const before = s.honor;
  talk(s, 'maud', ['Tobias war es']);
  assert.equal(s.quests.dice, 'failed');
  assert.ok(s.honor < before);
});

test('Laternenrunde: vier Laternen, ein Zeichen, zusammen mit dem Spiegel ein Hinweis auf den Chor', () => {
  const s = fresh();
  talk(s, 'wick', ['Laternen', 'gemacht']);
  for (const id of ['lamp1', 'lamp2', 'lamp3', 'lamp4']) {
    use(s, 'altmarkt', id);
    s.flags.add(`${id}_lit`); // done_flag setzt sonst die WorldScene
  }
  assert.equal(s.factStatus('lamp_sabotage'), 'suspected');
  talk(s, 'wick', ['brennen wieder']);
  assert.equal(s.quests.lamp_round, 'done');
  assert.equal(s.itemCount('lampenoel'), 2);

  talk(s, 'quill', ['Geschichte', 'sehe ihn', 'Woher']);
  use(s, 'altmarkt', 'mirror_sigil');
  assert.equal(s.factStatus('mirror_choir'), 'likely');
  s.addClue('ned_song');
  assert.equal(s.combine('lamp_sabotage', 'mirror_choir').result, 'new');
  const { combat, result } = fight(s, 'mirror_shade', { ...WIN, items: ['lampenoel', 'lampenoel'] });
  assert.ok(combat.weak, 'Quills Kassenbuch schwächt den Schatten');
  assert.equal(result.outcome, 'won');
  talk(s, 'quill', ['still']);
  assert.equal(s.quests.quill_mirror, 'done');
});

test('Ned hilft gegen einen Verband und weiß über Grimes und Silas Bescheid', () => {
  const s = fresh();
  talk(s, 'ned', ['Händen', 'sehe']);
  assert.equal(s.quests.blind_ned, 'active');
  const n = s.itemCount('verband');
  talk(s, 'ned', ['Verband', 'höre', 'Marktwart', 'Weiter', 'Mond', 'Weiter', 'nachts']);
  assert.equal(s.quests.blind_ned, 'done');
  assert.equal(s.itemCount('verband'), n - 1);
  assert.equal(s.factStatus('silas_cheats'), 'suspected');
  assert.equal(s.factStatus('lamp_sabotage'), 'suspected');
});

test('Die schwarzen Kerzen: der Chor war es nicht, sondern Agnes', () => {
  const s = fresh();
  talk(s, 'ambrose', ['bedrückt', 'kümmere']);
  assert.equal(s.factStatus('candles_cult'), 'suspected');
  use(s, 'altmarkt', 'wax');
  talk(s, 'agnes', ['Kerzen']);
  assert.equal(s.factStatus('candles_agnes'), 'likely');
  assert.equal(s.factStatus('candles_cult'), 'refuted');
  talk(s, 'ambrose', ['Agnes']);
  assert.equal(s.quests.black_candles, 'done');
});

test('Gretas Stand: drei Wege (Holt, Ansehen, Bestechung)', () => {
  const viaHolt = fresh(20);
  talk(viaHolt, 'greta', ['Stand am Altmarkt']);
  talk(viaHolt, 'ned', ['Händen', 'sehe']);
  talk(viaHolt, 'ned', ['Verband', 'höre', 'Marktwart']);
  assert.equal(viaHolt.factStatus('grimes_bribes'), 'likely');
  talk(viaHolt, 'holt', ['Grimes']);
  assert.equal(viaHolt.quests.greta_stall, 'done');
  assert.ok(viaHolt.flags.has('grimes_gone'));

  const viaHonor = fresh(55);
  talk(viaHonor, 'greta', ['Stand am Altmarkt']);
  use(viaHonor, 'altmarkt', 'ledger');
  talk(viaHonor, 'grimes', ['Schutzgeld', 'umsonst verkaufen']);
  assert.equal(viaHonor.quests.greta_stall, 'done');

  const viaBribe = fresh(20);
  viaBribe.addItem('tonikum');
  talk(viaBribe, 'greta', ['Stand am Altmarkt']);
  talk(viaBribe, 'grimes', ['Greta', 'verstehe']);
  const before = viaBribe.honor;
  talk(viaBribe, 'grimes', ['Tonikum']);
  assert.equal(viaBribe.quests.greta_stall, 'done');
  assert.ok(viaBribe.honor < before, 'Bestechung kostet unterm Strich Ansehen');
  assert.ok(viaBribe.flags.has('greta_stall_open'));
});
