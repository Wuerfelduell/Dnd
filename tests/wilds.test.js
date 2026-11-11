// Gefahrengebiete: Gegner auf der Karte, Elite-Varianten, Bosse, Drops und Beutebehälter. `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { rollLoot, lootRarity, itemRarity, takeLoot, CONTAINERS, RARITIES } from '../src/core/Loot.js';
import { loadContent, fight, SKILLED, EXPERT } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);
const ZONES = Object.keys(content.zones).filter((z) => !/^(cw_|bh_|reise_)/.test(z)); // Kapitel 4/5: tests/kapitel45.test.js
// Erzählgebiete: wenige Gegner, den Boss stellt man bewusst an seiner Station (Kapitel 3: Dunscar)
const STORY_ZONES = { wx_torfbrueche: 'moorbraut', ds_rangierwueste: 'schwellenhund', ds_klopfbruch: 'vorhauer', ds_rufschlucht: 'vielrufer', ds_unterschicht: 'unterschicht' };
/** Feste Zufallsfolge für reproduzierbare Würfe. */
const seq = (...values) => { let i = 0; return () => values[i++ % values.length]; };

test('dreizehn Gefahrengebiete (fünf in Wexmoor, vier in Dunscar) mit Karte, Reiseziel, vielen Gegnern und einem Boss', () => {
  assert.deepEqual(ZONES, ['marsch', 'katakomben', 'pestgassen', 'kraterwald', 'wx_vergessmoor', 'wx_leuchtturm', 'wx_salzwatt', 'wx_altstadt', 'wx_torfbrueche', 'ds_rangierwueste', 'ds_klopfbruch', 'ds_rufschlucht', 'ds_unterschicht']);
  for (const zid of ZONES) {
    const map = content.maps[zid];
    assert.ok(map, zid);
    assert.ok(map.danger >= 1, `${zid}: Gefahrenstufe`);
    assert.ok(content.travel.some((t) => t.map === zid), `${zid}: Reiseziel`);
    const roamers = map.roamers.filter((r) => !content.encounters[r.encounter]?.city); // BD: Kopfgeld-Ziele am Rand der Rufschlucht zählen zur Stadt
    // Paket AM: die Torfbrüche sind ein Erzählort mit wenigen Gegnern; die Moorbraut stellt man bewusst am Brautbecken
    const story = STORY_ZONES[zid];
    assert.ok(roamers.length >= (story ? 3 : 15), `${zid}: nur ${roamers.length} Gegner`);
    assert.equal(roamers.filter((r) => r.boss).length, story ? 0 : 1, `${zid}: ein Boss`);
    if (story) assert.ok(content.encounters[story]?.boss && Object.values(content.dialogues).some((d) => Object.values(d.nodes).some((n) => n.encounter === story || n.combat === story)), `${zid}: Boss ${story} im Gespräch`);
    const walk = new Set([...'.,gpscwPK=']);
    for (const r of roamers) {
      assert.ok(content.encounters[r.encounter]?.wild, `${zid}: ${r.encounter}`);
      assert.ok(walk.has(map.rows[r.tile[1]][r.tile[0]]), `${zid}: ${r.encounter} steht auf ${map.rows[r.tile[1]][r.tile[0]]}`);
    }
    // Eingang sicher: kein Gegner näher als 10 Felder
    const [sx, sy] = map.spawns.default;
    for (const r of roamers) assert.ok(Math.abs(r.tile[0] - sx) + Math.abs(r.tile[1] - sy) >= 10, `${zid}: ${r.encounter} zu nah am Eingang`);
    for (const it of map.interactables.filter((i) => i.kind === 'loot')) assert.ok(content.lootTables[it.table], `${zid}/${it.id}: ${it.table}`);
  }
});

test('jeder normale Gegner hat eine stärkere Elite-Variante mit besserer Beute', () => {
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!e.wild || e.boss || e.elite || e.chapter >= 4) continue; // Kapitel 4/5: tests/kapitel45.test.js
    const el = content.encounters[`${id}_elite`];
    assert.ok(el, `${id}: Elite fehlt`);
    assert.ok(el.hp > e.hp && el.attacks[0].damage >= e.attacks[0].damage, `${id}: Elite nicht stärker`);
    assert.ok(el.fleeable, `${id}: vor Elite kann man fliehen`);
    const base = content.loot[id];
    const elite = content.loot[`${id}_elite`];
    assert.ok(elite.drops.length > base.drops.length, `${id}: Elite-Bonus-Drop`);
    assert.ok(elite.money[1] > base.money[1], `${id}: Elite-Geld`);
  }
  for (const zid of ZONES) {
    const boss = STORY_ZONES[zid] ?? content.maps[zid].roamers.find((r) => r.boss).encounter;
    if (content.encounters[boss].chapter === 3) continue; // Dunscar: vor den Bossen flieht man in Pfiffs Speisewagen
    assert.equal(content.encounters[boss].fleeable, false, `${boss}: Boss lässt dich nicht fliehen`);
  }
});

test('Drops: Beutetabellen würfeln Geld und Gegenstände, Seltenheit wählt den Behälter', () => {
  const table = content.loot.moorleiche;
  // Alle Würfe niedrig: jeder Drop fällt
  const all = rollLoot(table, () => 0);
  assert.equal(all.money, table.money[0]);
  for (const d of table.drops) assert.ok(all.items[d.item] >= 1, d.item);
  // Alle Würfe hoch: nichts fällt außer dem Höchstgeld
  const none = rollLoot(table, () => 0.999);
  assert.deepEqual(none.items, {});
  assert.equal(none.money, table.money[1]);
  assert.equal(lootRarity({ items: { moorwasser: 1, moorperle: 1 } }, content.items), 'selten'); // Moorperle
  assert.equal(CONTAINERS[lootRarity({ items: { moorwasser: 1 } }, content.items)], 'beutel');
  assert.equal(CONTAINERS[lootRarity({ items: { rattenkrone: 1 } }, content.items)], 'okkulter_schrein');
  for (const [id, it] of Object.entries(content.items)) assert.ok(RARITIES.includes(itemRarity(it)), id);
  // Jeder Drop verweist auf einen echten Gegenstand
  for (const [id, t] of [...Object.entries(content.loot), ...Object.entries(content.lootTables)]) {
    for (const d of t.drops ?? []) assert.ok(content.items[d.item], `${id}: ${d.item}`);
    for (const item of Object.keys(t.items ?? {})) assert.ok(content.items[item], `${id}: ${item}`);
  }
});

test('Sieg gegen Gegner auf der Karte: Beute kommt erst mit dem Behälter, sonst sofort', () => {
  const s = fresh();
  s.addItem('stockdegen');
  s.rng = seq(0);
  const { result } = fight(s, 'moorleiche', { attack: 'perfect', defend: () => 'parry' });
  assert.equal(result.outcome, 'won');
  assert.ok(result.loot.items.moorwasser >= 1);
  // fight() ruft finish() ohne deferLoot: liegt schon in der Tasche
  assert.ok(s.itemCount('moorwasser') >= 1);
  // Wie in CombatScene bei Gegnern auf der Karte: Beute bleibt liegen, bis man den Behälter öffnet
  const s2 = fresh();
  s2.rng = seq(0);
  const before = s2.money;
  const c = new Combat(s2, 'irrlicht');
  c.hurtEnemy(c.enemy.maxHp);
  const r = c.finish({ deferLoot: true });
  assert.equal(r.lootDeferred, true);
  assert.equal(s2.itemCount('irrlichtfunke'), 0);
  assert.equal(s2.money, before);
  takeLoot(s2, r.loot, 'Irrlicht');
  assert.ok(s2.itemCount('irrlichtfunke') >= 1);
  assert.ok(s2.money > before);
  // Wiederholbar: Gegner im Gefahrengebiet geben jedes Mal Beute
  const again = fight(s, 'moorleiche', { attack: 'perfect', defend: () => 'parry' }).result;
  assert.ok(again.loot.money > 0);
});

test('Niederlage im Gefahrengebiet: Ohnmacht am Eingang und ein Viertel des Geldes ist weg', () => {
  const s = fresh();
  s.money = 100;
  const { result } = fight(s, 'moorleiche', { attack: 'miss', defend: () => 'miss' });
  assert.equal(result.outcome, 'lost');
  assert.deepEqual(result.travel, { map: 'marsch', spawn: 'default' });
  assert.equal(s.money, 75);
  assert.match(result.text, /25 Schilling/);
});

test('Boss-Beute: Waffe beim ersten Sieg, Ossuarschlüssel öffnet den Schrein', () => {
  const s = fresh();
  for (let i = 0; i < 6; i++) s.addItem('tonikum');
  s.addItem('stockdegen');
  s.rng = seq(0.5);
  fight(s, 'moorkoenigin', { attack: 'perfect', defend: () => 'parry' });
  assert.equal(s.itemCount('egelhaken'), 1);
  assert.equal(s.itemCount('moorperle') >= 1, true);
  fight(s, 'ossuarwaechter', { attack: 'perfect', defend: () => 'parry' });
  assert.equal(s.itemCount('ossuarschluessel'), 1);
  const shrine = content.maps.katakomben.interactables.find((i) => i.id === 'schrein');
  assert.ok(s.meets(shrine.lock));
  assert.ok(content.lootTables[shrine.table].items.ossuarklinge);
});

// Ausrüstung, die man für die Gebiete realistisch hat: je höher die Stufe, desto besser
const GEAR = {
  1: { weapon: 'schlagstock', tonikum: 0, verband: 2 },
  2: { weapon: 'stockdegen', tonikum: 2, verband: 2 },
  3: { weapon: 'egelhaken', tonikum: 3, verband: 2 },
  4: { weapon: 'ossuarklinge', tonikum: 4, verband: 2 },
};
const geared = (tier) => {
  const s = fresh();
  const g = GEAR[tier];
  s.addItem(g.weapon);
  if (g.tonikum) s.addItem('tonikum', g.tonikum);
  s.addItem('verband', g.verband);
  return s;
};

test('Balance: Geübte schaffen normale Gegner ihres Gebiets, sehr Geübte auch Eliten und Bosse mit passender Ausrüstung', () => {
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!e.wild || e.chapter >= 3 || e.zone.startsWith('wx_')) continue; // Kapitel 2 bis 5 haben eine eigene Balance (tests/wexmoor_balance.test.js, tests/kapitel3.test.js)
    // Bosse sind für Ausrüstung der nächsten Stufe gedacht (die Waffe dafür liegt beim vorigen Boss bzw. im Schrein)
    const tier = Math.min(4, content.zones[e.zone].tier + (e.boss ? 1 : 0));
    const s = geared(tier);
    // Höhere Wesen (Sequenz-Schranke) brauchen die passende Sequenz
    if (e.min_seq) { s.pathway = { id: 'eisen', seq: e.min_seq, digestion: 0 }; s.updateMaxHp(); s.hp = s.maxHp; }
    // Sehr Geübte nutzen auch ihre Konzentration (Doppelschlag)
    const tough = e.elite || e.boss;
    const { result, combat } = fight(s, id, { defend: tough ? EXPERT : SKILLED, skill: tough ? 'double' : 'attack', healBelow: 18 });
    assert.equal(result.outcome, 'won', `${id}: verloren in Runde ${combat.round}`);
  }
});

test('Balance: Wer nur jedem zweiten Schlag ausweicht, verliert gegen Elite und Boss', () => {
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!e.wild || !(e.elite || e.boss) || e.zone.startsWith('wx_') || e.chapter >= 4) continue; // Wexmoor: tests/wexmoor_balance.test.js, Kapitel 4/5: tests/kapitel45.test.js
    const s = geared(Math.min(4, content.zones[e.zone].tier + (e.boss ? 1 : 0)));
    const { result } = fight(s, id, { defend: (i) => (i % 2 ? 'miss' : 'dodge'), healBelow: 18 });
    assert.equal(result.outcome, 'lost', id);
  }
});

test('Gefährlich: drei Gegner hintereinander ohne Heilung schafft man nicht mit halber Deckung', () => {
  const s = geared(1);
  s.inventory.verband = 0;
  let lost = false;
  for (const id of ['moorleiche', 'schlammegel', 'irrlicht']) {
    const { result } = fight(s, id, { defend: (i) => (i % 3 === 2 ? 'miss' : i % 3 ? 'dodge' : 'miss') });
    if (result.outcome === 'lost') { lost = true; break; }
  }
  assert.ok(lost);
});
