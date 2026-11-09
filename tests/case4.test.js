// Fall 4 „Die gestohlenen Stimmen“ und die Nebenaufträge am Nordtor über die echten Dialoge und Objekte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, use, fight, SKILLED } from './helpers.js';

const content = loadContent();
const WIN = { defend: SKILLED, healBelow: 15 };

/** Zustand nach Fall 3 (gutes Ende). */
function afterCase3(honor = 40) {
  const s = new GameState(content);
  s.honor = honor;
  ['briefed_01', 'travel_ashgrove', 'travel_ebba', 'travel_docks', 'case_01_closed', 'elias_rescued', 'reported_01', 'case_02_closed',
    'hester_saved', 'briefed_03', 'case_03_raid', 'case_03_closed', 'rook_arrested'].forEach((f) => s.flags.add(f));
  ['case_01', 'case_02', 'case_03'].forEach((q) => { s.quests[q] = 'done'; });
  s.addItem('schlagstock');
  s.equip('schlagstock');
  return s;
}

function brief(s) {
  talk(s, 'marlowe', []); // erst der Epilog von Fall 3
  talk(s, 'marlowe', ['Nordtor']);
  assert.equal(s.quests.case_04, 'active');
  assert.ok(s.meets(content.travel.find((t) => t.map === 'nordtor')));
  assert.equal(s.factStatus('mask_maker'), 'suspected');
}

function investigate(s, { vials = true } = {}) {
  use(s, 'theater', 'mirror_table');
  talk(s, 'diva', ['jener Nacht']);
  assert.equal(s.factStatus('voice_stolen'), 'likely');
  use(s, 'theater', 'prompter');
  talk(s, 'agnes', ['Felix']);
  assert.equal(s.factStatus('felix_choir'), 'likely');
  assert.equal(s.factStatus('mask_maker'), 'refuted');
  assert.equal(s.combine('voice_stolen', 'felix_choir').result, 'new');
  use(s, 'theater', 'trapdoor');
  talk(s, 'mott', ['Theater']);
  talk(s, 'ezra', ['Turmuhr']);
  talk(s, 'hettie', ['Schlagwerk']);
  assert.equal(s.combine('tunnel_route', 'tower_tones').result, 'new');
  if (vials) {
    use(s, 'uhrturm', 'vial');
    talk(s, 'starling', ['Was kann Sternglas']);
    assert.equal(s.combine('glass_vials', 'tower_tones').result, 'new');
    assert.ok(s.isCertain('vials_choir'));
  }
  assert.ok(s.isCertain('felix_thief') && s.isCertain('tower_lair'));
}

test('Fall 4: Briefing erst nach dem Epilog von Fall 3, neue Orte auf der Stadtkarte', () => {
  const s = afterCase3();
  talk(s, 'marlowe', []);
  assert.equal(s.quests.case_04, undefined);
  talk(s, 'marlowe', ['Nordtor']);
  assert.equal(s.quests.case_04, 'active');
  assert.ok(content.maps.nordtor.rows.every((r) => r.length === 64));
  assert.equal(use(s, 'uhrturm', 'cellar'), 'locked', 'Kellertür erst mit Hinweis auf den Kanal');
});

test('Fall 4: bestes Ende, Phiolen im Takt der Uhr geöffnet', () => {
  const s = afterCase3();
  brief(s);
  investigate(s);
  assert.equal(use(s, 'uhrturm', 'cellar'), 'ok');
  talk(s, 'marlowe', ['Stimmen stiehlt', 'Gaskanal']);
  assert.ok(s.flags.has('case_04_showdown'));
  talk(s, 'mott', ['singt']);
  assert.equal(fight(s, 'gasgeist', WIN).result.outcome, 'won');
  const { combat, result } = fight(s, 'felix_fight', WIN);
  assert.ok(combat.weak);
  assert.equal(result.outcome, 'won');
  talk(s, 'vials', ['Takt']);
  assert.equal(s.endings.case_04, 'c4_perfect');
  assert.equal(s.quests.case_04, 'done');
  talk(s, 'marlowe', ['Wir finden sie']);
  assert.ok(s.flags.has('epilogue4_seen'));
});

test('Fall 4: Ohne die Phiolen zu verstehen bleibt nur das Zerschlagen', () => {
  const s = afterCase3();
  brief(s);
  investigate(s, { vials: false });
  talk(s, 'marlowe', ['Stimmen stiehlt', 'Gaskanal']);
  fight(s, 'felix_fight', WIN);
  assert.throws(() => talk(s, 'vials', ['Takt']));
  talk(s, 'vials', ['zerschlagen']);
  assert.equal(s.endings.case_04, 'c4_good');
});

test('Fall 4: Wer dem Polizeibericht glaubt, verhaftet den Falschen', () => {
  const s = afterCase3();
  brief(s);
  const before = s.honor;
  talk(s, 'marlowe', ['Stimmen stiehlt', 'Pell']);
  assert.equal(s.endings.case_04, 'c4_mask');
  assert.ok(s.honor < before);
});

test('Fall 4: Felix zu früh verhaften lässt die Stimmen verschwinden', () => {
  const s = afterCase3();
  brief(s);
  use(s, 'theater', 'mirror_table');
  talk(s, 'diva', ['jener Nacht']);
  use(s, 'theater', 'prompter');
  s.combine('voice_stolen', 'felix_choir');
  talk(s, 'marlowe', ['Stimmen stiehlt', 'weiß ich nicht', 'Verhaften']);
  assert.equal(s.endings.case_04, 'c4_early');
});

test('Nebenaufträge am Nordtor: Kröte, Uhrwerk, Sternglas', () => {
  const s = afterCase3();
  brief(s);
  talk(s, 'mott', ['Quaken', 'nach']);
  const toad = fight(s, 'kanalkroete', WIN);
  assert.ok(toad.combat.weak);
  talk(s, 'mott', ['Kröte ist weg']);
  assert.equal(s.quests.toad, 'done');

  talk(s, 'hettie', ['nachts oben', 'halte']);
  s.heal(s.maxHp); // zwischendurch auf der Pritsche ausgeruht
  fight(s, 'uhrwerkwaechter', WIN);
  talk(s, 'hettie', ['steht still']);
  assert.equal(s.quests.clockwork, 'done');
  assert.ok(s.itemCount('spinnenseide') >= 2);

  talk(s, 'starling', ['Was ist mit dem Sternglas', 'Uhrturm']);
  use(s, 'uhrturm', 'shards');
  talk(s, 'starling', ['Splitter']);
  assert.equal(s.quests.starglass, 'done');
  assert.equal(s.itemCount('sternglas'), 1);
});

test('Der Maskenspieler und Leere Haken: zweimal ist Finn der Falsche', () => {
  const s = afterCase3();
  talk(s, 'pell', ['Maske?', 'Dieb']);
  assert.equal(s.factStatus('finn_masks'), 'suspected');
  use(s, 'theater', 'rack');
  talk(s, 'finn', ['weiße Maske']);
  assert.equal(s.factStatus('crabb_masks'), 'likely');
  assert.equal(s.factStatus('finn_masks'), 'refuted');
  fight(s, 'maskenspieler', WIN);
  talk(s, 'pell', ['zurück']);
  assert.equal(s.quests.masked_thief, 'done');

  talk(s, 'bram', ['gestohlen', 'sehe mich um']);
  talk(s, 'finn', ['Fässer']);
  use(s, 'schlachthof', 'salt');
  assert.equal(s.factStatus('knox_steals'), 'likely');
  assert.equal(s.combine('crabb_masks', 'knox_steals').result, 'new');
  fight(s, 'schlachtergehilfe', WIN);
  talk(s, 'bram', ['Knox']);
  assert.equal(s.quests.empty_hooks, 'done');
});

test('Leere Haken: Finn beschuldigen kostet ihn die Stelle', () => {
  const s = afterCase3();
  talk(s, 'bram', ['gestohlen', 'sehe mich um']);
  talk(s, 'bram', ['Finn war es']);
  assert.equal(s.quests.empty_hooks, 'failed');
  assert.ok(s.flags.has('finn_fired'));
});
