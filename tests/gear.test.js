// Ausrüstung: Hut, Mantel und Amulett wirken nur angelegt, gehören jedem Spieler selbst und kommen irgendwoher.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { GEAR_SLOTS } from '../src/core/Gear.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const gearIds = Object.keys(content.items).filter((id) => content.items[id].kind === 'gear');

test('Kleidung hat Icon, Platz und Wirkung', () => {
  assert.ok(gearIds.length >= 35, `${gearIds.length} Stücke`);
  for (const id of gearIds) {
    assert.ok(existsSync(new URL(`../public/sprites/items/${id}.png`, import.meta.url)), `${id}: Icon`);
    assert.ok(GEAR_SLOTS.includes(content.items[id].slot), `${id}: Platz`);
  }
  for (const slot of GEAR_SLOTS) assert.ok(gearIds.filter((id) => content.items[id].slot === slot).length >= 10, slot);
});

test('Jedes neue Stück gibt es zu kaufen oder als Beute', () => {
  const sold = new Set(Object.values(content.market.merchants).flatMap((m) => m.stock.map((e) => e.item)));
  const dropped = new Set(Object.values(content.loot).flatMap((l) => [...(l.drops ?? []).map((d) => d.item), ...Object.keys(l.items ?? {})]));
  const ids = [...gearIds, 'revolver', 'messingschlagring', 'brecheisen', 'regenschirmdegen', 'taktstock_silber', 'kette_rauchfass', 'laterne_kampf',
    'stimmgabel_gross', 'knochenmesser', 'sternglasdolch', 'taktstock_vey', 'blitzpulver', 'taschentuch', 'glasauge', 'taschenspiegel', 'geisterkern'];
  for (const id of ids) {
    assert.ok(content.items[id], `${id} fehlt`);
    assert.ok(sold.has(id) || dropped.has(id), `${id}: weder im Laden noch als Beute`);
  }
});

test('Angelegt wirkt, abgelegt nicht; An- und Ablegen heilt nicht', () => {
  const s = new GameState(content);
  const hp0 = s.maxHp;
  s.addItem('mantel_wolle');
  assert.equal(s.gear.mantel, 'mantel_wolle', 'leerer Platz füllt sich von selbst');
  assert.equal(s.maxHp, hp0 + 3);
  s.hp = 10;
  for (let i = 0; i < 5; i++) { s.takeOff('mantel'); s.wear('mantel_wolle'); }
  assert.equal(s.hp, 10, 'kein Heilen durch Umziehen');
  s.addItem('mantel_leder');
  assert.equal(s.gear.mantel, 'mantel_wolle', 'belegter Platz bleibt');
  assert.equal(s.passive('damage_taken'), 1);
  assert.ok(s.wear('mantel_leder'));
  assert.equal(s.maxHp, hp0);
  assert.ok(s.passive('damage_taken') < 1);
  s.removeItem('mantel_leder');
  assert.equal(s.gear.mantel, null, 'verkauft oder weggegeben: Platz frei');
  assert.equal(s.passive('damage_taken'), 1);
  assert.equal(s.wear('verband'), false);
});

test('Ausrüstung wird gespeichert und gehört jedem Spieler selbst', () => {
  const s = new GameState(content);
  s.addItem('hut_melone');
  s.addItem('amulett_eisen');
  s.addP2();
  s.withPlayer(2, () => s.addItem('hut_zylinder'));
  assert.equal(s.gear.hut, 'hut_melone');
  assert.equal(s.withPlayer(2, () => s.gear.hut, { quiet: true }), 'hut_zylinder');
  assert.equal(s.withPlayer(2, () => s.passive('sell'), { quiet: true }), 1.1);
  assert.equal(s.passive('sell'), 1);
  const t = new GameState(content);
  assert.ok(t.load(JSON.parse(JSON.stringify(s.serialize()))));
  assert.deepEqual(t.gear, { hut: 'hut_melone', mantel: null, amulett: 'amulett_eisen' });
  assert.equal(t.maxHp, s.maxHp);
  assert.equal(t.withPlayer(2, () => t.gear.hut, { quiet: true }), 'hut_zylinder');
});

test('Gorse verkauft Kleidung, Blitzpulver blendet im Kampf', () => {
  const s = new GameState(content);
  s.money = 500;
  s.honor = 60;
  assert.ok(s.shopStock('gorse').some((e) => e.item === 'mantel_wolle'));
  assert.equal(s.buy('gorse', 'hut_melone').ok, true);
  assert.equal(s.gear.hut, 'hut_melone');
  assert.equal(content.items.blitzpulver.stun, true);
});
