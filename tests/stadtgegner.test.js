// Paket L: Stadtgegner streifen durch die Viertel, Kopfgeld-Brett im Revier mit Steckbriefen. `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, fight, SKILLED, EXPERT } from './helpers.js';
import { questTarget } from '../src/core/Guide.js';
import { L_ENEMIES, L_ITEMS, WANTED } from '../src/world/assets.js';

const content = loadContent();
const CITY = ['docks', 'altmarkt', 'nachtmarkt', 'ashgrove', 'nordtor'];

/** Mitten im Spiel: Fälle 1 bis 4 gelöst, Dienstschlagstock, etwas Heilung. */
function midgame() {
  const s = new GameState(content);
  ['case_01_closed', 'case_02_closed', 'case_03_closed', 'case_04_closed', 'briefed_01'].forEach((f) => s.flags.add(f));
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('verband', 3);
  s.addItem('tonikum', 1);
  return s;
}

test('Alle elf Stadtgegner aus Paket L haben Werte, Beute und einen Platz in der Stadt', () => {
  const placed = new Set(CITY.flatMap((m) => (content.maps[m].roamers ?? []).map((r) => r.encounter)));
  for (const id of Object.keys(L_ENEMIES)) {
    const e = content.encounters[id];
    assert.ok(e?.city, `${id}: Werte fehlen`);
    assert.ok(placed.has(id) || placed.has(`kopfgeld_${id}`), `${id}: steht nirgends in der Stadt`);
    if (!e.boss) assert.ok(content.encounters[`${id}_elite`]?.hp > e.hp, `${id}: Elite`);
  }
  for (const id of L_ITEMS) assert.ok(content.items[id], `${id}: Gegenstand fehlt`);
  // Jede Beute ist irgendwo zu holen
  const drops = new Set(Object.values(content.loot).flatMap((l) => (l.drops ?? []).map((d) => d.item)));
  const rewards = new Set(Object.values(content.dialogues.kopfgeldbrett.nodes).flatMap((n) => Object.keys(n.gives_items ?? {})));
  for (const id of L_ITEMS) assert.ok(drops.has(id) || rewards.has(id), `${id}: keine Quelle`);
});

test('Stadtgegner stehen frei, weit weg von Eingängen und erscheinen erst mit dem Spielfortschritt', () => {
  const walk = new Set([...'.,gpscwPK=']);
  for (const mid of CITY) {
    const map = content.maps[mid];
    for (const r of map.roamers) {
      assert.ok(walk.has(map.rows[r.tile[1]][r.tile[0]]), `${mid}: ${r.encounter} steht auf ${map.rows[r.tile[1]][r.tile[0]]}`);
      for (const [sx, sy] of Object.values(map.spawns)) assert.ok(Math.abs(r.tile[0] - sx) + Math.abs(r.tile[1] - sy) >= 10, `${mid}: ${r.encounter} zu nah am Eingang`);
      assert.ok(r.visible_if, `${mid}: ${r.encounter} ohne Bedingung`);
    }
  }
  const s = new GameState(content);
  assert.ok(content.maps.docks.roamers.every((r) => !s.meets(r.visible_if)), 'Zu Spielbeginn ist die Stadt ruhig');
  s.flags.add('case_01_closed');
  assert.ok(content.maps.docks.roamers.some((r) => s.meets(r.visible_if)), 'Nach Fall 1 sind Schmuggler unterwegs');
});

test('Balance: Geübte schaffen Stadtgegner mit dem Dienstschlagstock, Eliten und Kopfgeld-Ziele verlangen sauberes Timing', () => {
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!e.city) continue;
    const tough = e.elite || e.boss || id.startsWith('kopfgeld_');
    const { result, combat } = fight(midgame(), id, { defend: tough ? EXPERT : SKILLED, healBelow: 15 });
    assert.equal(result.outcome, 'won', `${id}: verloren in Runde ${combat.round}`);
  }
});

test('Niederlage in der Stadt: Aufwachen im Revier, ein Zehntel des Geldes weg', () => {
  const s = midgame();
  s.money = 100;
  const { result } = fight(s, 'kanalschmuggler', { defend: () => 'miss' });
  assert.equal(result.outcome, 'lost');
  assert.deepEqual(result.travel, { map: 'revier', spawn: 'default' });
  assert.equal(s.money, 90);
});

test('Kopfgeld-Brett: Steckbrief nehmen, Ziel stellen, Belohnung kassieren', () => {
  const s = midgame();
  talk(s, 'kopfgeldbrett', ['Moe Harker', 'abnehmen']);
  assert.equal(s.quests.kopfgeld_laternendieb, 'active');
  const target = questTarget(s, 'kopfgeld_laternendieb');
  assert.equal(target?.map, 'altmarkt', 'Der Pfeil zeigt zum Altmarkt');
  const roamer = content.maps.altmarkt.roamers.find((r) => r.encounter === 'kopfgeld_laternendieb');
  assert.ok(roamer.boss && s.meets(roamer.visible_if), 'Ziel erscheint mit dem Auftrag und bleibt besiegt');
  assert.equal(fight(s, 'kopfgeld_laternendieb', { defend: EXPERT, healBelow: 15 }).result.outcome, 'won');
  const money = s.money;
  talk(s, 'kopfgeldbrett', ['kassieren: „Funzel“']);
  assert.equal(s.quests.kopfgeld_laternendieb, 'done');
  assert.ok(s.money >= money + 25, 'Kopfgeld ausgezahlt');
  // Der Steckbrief verschwindet vom Brett
  const node = content.dialogues.kopfgeldbrett.nodes.start;
  assert.ok(!node.choices.some((c) => c.text.includes('Moe Harker') && s.meets(c)));
});

test('Schmugglerkönigin: Kopfgeld-Bossin, Fluchtweg vom verhörten Schmuggler macht sie verwundbar', () => {
  const s = midgame();
  talk(s, 'kopfgeldbrett', ['Schmugglerkönigin', 'abnehmen']);
  assert.equal(s.quests.kopfgeld_koenigin, 'active');
  const queen = content.encounters.schmugglerkoenigin;
  assert.ok(queen.boss && !queen.fleeable);
  // Ohne Fluchtweg: keine Schwachstelle
  assert.ok(!fight(midgame(), 'schmugglerkoenigin', { defend: EXPERT, healBelow: 15 }).combat.weak);
  fight(s, 'kanalschmuggler', { defend: SKILLED, healBelow: 15 });
  const verhoer = content.maps.docks.interactables.find((i) => i.id === 'verhoer');
  assert.ok(s.meets(verhoer.visible_if), 'Der besiegte Schmuggler lässt sich verhören');
  talk(s, 'schmuggler_verhoer', ['Wo legt']);
  assert.ok(s.flags.has('koenigin_route'));
  const { combat, result } = fight(s, 'schmugglerkoenigin', { defend: EXPERT, healBelow: 15 });
  assert.ok(combat.weak);
  assert.equal(result.outcome, 'won');
  talk(s, 'kopfgeldbrett', ['kassieren: Die Schmugglerkönigin']);
  assert.equal(s.quests.kopfgeld_koenigin, 'done');
  for (const id of ['entermesser', 'polizeimarke_gold', 'mantel_oelzeug']) assert.equal(s.itemCount(id), 1, id);
  assert.ok(WANTED.includes('schmugglerkoenigin'));
});
