// Beziehungen: Wert je Figur, drei Stimmungen, Geschenke, Händlerpreise, Bedingungen, Spielstand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);

test('Regeln und Profile sind geladen, alle Profile zeigen auf bekannte Figuren und Gegenstände', () => {
  const r = content.relations;
  assert.ok(r.rules.freundlich_ab > 0 && r.rules.feindselig_ab < 0);
  assert.ok(r.allgemein.freundlich.length >= 3 && r.allgemein.feindselig.length >= 3);
  for (const [id, f] of Object.entries(r.figuren)) {
    assert.ok(content.npcs[id], `Figur ${id}`);
    for (const it of [...(f.mag ?? []), ...(f.verabscheut ?? [])]) assert.ok(content.items[it], `${id} mag/verabscheut unbekanntes ${it}`);
  }
});

test('Drei Stimmungen aus dem Wert: neutral am Anfang, freundlich ab +3, feindselig ab -2, mit Grenzen', () => {
  const s = fresh();
  assert.equal(s.mood('marlowe'), 'neutral');
  assert.equal(s.relation('marlowe'), 0);
  s.changeRelation('marlowe', 2);
  assert.equal(s.mood('marlowe'), 'neutral');
  s.changeRelation('marlowe', 1);
  assert.equal(s.mood('marlowe'), 'freundlich');
  s.changeRelation('marlowe', 99);
  assert.equal(s.relation('marlowe'), content.relations.rules.max);
  s.changeRelation('marlowe', -99);
  assert.equal(s.relation('marlowe'), content.relations.rules.min);
  assert.equal(s.mood('marlowe'), 'feindselig');
  // unbekannte Figur: nichts passiert
  assert.equal(s.changeRelation('niemand', 3), 0);
});

test('Ereignisse melden Wechsel der Stimmung; Begrüßung nur außerhalb von neutral', () => {
  const s = fresh();
  const seen = [];
  s.on('relation', (e) => seen.push(e));
  assert.equal(s.greeting('holt'), null);
  s.changeRelation('holt', -3);
  assert.equal(seen.at(-1).changed, true);
  assert.equal(seen.at(-1).mood, 'feindselig');
  assert.ok(s.greeting('holt'));
  s.changeRelation('holt', 1);
  assert.equal(seen.at(-1).changed, false);
  assert.equal(s.mood('holt'), 'feindselig');
  s.changeRelation('holt', 5);
  assert.equal(s.mood('holt'), 'freundlich');
  assert.ok(content.relations.allgemein.freundlich.includes(s.greeting('holt')));
});

test('Dialogknoten mit relation wirken nur beim ersten Besuch', () => {
  const s = fresh();
  const node = content.dialogues.holt.nodes.holt_clear;
  assert.deepEqual(node.relation, { holt: 1 });
  s.applyEffects(node, { nodeKey: 'holt.holt_clear' });
  s.visitNode('holt', 'holt_clear');
  assert.equal(s.relation('holt'), 1);
  s.applyEffects(node, { nodeKey: 'holt.holt_clear' });
  assert.equal(s.relation('holt'), 1);
  // ohne Knotenschlüssel (z. B. Auftragsbelohnung) wirkt es jedes Mal
  s.applyEffects({ relation: { holt: 1 } });
  assert.equal(s.relation('holt'), 2);
});

test('Bedingungen: requires_relation, requires_relation_max, requires_mood, hide_if_mood', () => {
  const s = fresh();
  assert.equal(s.meets({ requires_relation: { pimm: 1 } }), false);
  assert.equal(s.meets({ requires_relation_max: { pimm: 0 } }), true);
  assert.equal(s.meets({ requires_mood: { pimm: 'neutral' } }), true);
  assert.equal(s.meets({ requires_mood: { pimm: ['freundlich', 'feindselig'] } }), false);
  s.changeRelation('pimm', 3);
  assert.equal(s.meets({ requires_relation: { pimm: 1 } }), true);
  assert.equal(s.meets({ requires_mood: { pimm: 'freundlich' } }), true);
  assert.equal(s.meets({ hide_if_mood: { pimm: 'freundlich' } }), false);
});

test('Geschenke: Gemochtes und Wertvolles zählt bis zur Grenze, Verabscheutes kostet, Billiges wird mit Wunsch abgelehnt', () => {
  const s = fresh();
  const r = content.relations.rules;
  const cheap = Object.keys(content.items).find((i) => content.items[i].kind === 'ingredient' && s.giftValue(i) < r.geschenk_wert);
  const dear = Object.keys(content.items).find((i) => content.items[i].kind === 'gear' && s.giftValue(i) >= r.geschenk_wert);
  s.addItem('tonikum', 5);
  s.addItem('blitzpulver', 1);
  s.addItem(cheap, 1);
  s.addItem(dear, 1);
  assert.deepEqual(s.giftTastes('marlowe').kinds, ['consumable', 'trophy']);
  assert.equal(s.giftFit('marlowe', 'tonikum'), 'mag');
  assert.equal(s.giftFit('marlowe', cheap), 'nein');
  assert.equal(s.giftFit('marlowe', dear), 'wertvoll');
  assert.equal(s.giftFit('marlowe', 'blitzpulver'), 'hass');
  const no = s.giveGift('marlowe', cheap);
  assert.equal(no.ok, false);
  assert.ok(/Stärkungsmittel oder Kuriositäten/.test(no.text), 'Ablehnung verrät den Wunsch');
  assert.equal(s.itemCount(cheap), 1);
  assert.equal(s.relation('marlowe'), 0);
  const first = s.giveGift('marlowe', 'tonikum');
  assert.equal(first.ok, true);
  assert.equal(first.delta, 1);
  assert.equal(s.itemCount('tonikum'), 4);
  const rich = s.giveGift('marlowe', dear);
  assert.equal(rich.fit, 'wertvoll');
  assert.equal(s.relation('marlowe'), 2);
  s.giveGift('marlowe', 'tonikum');
  assert.equal(s.relation('marlowe'), 3);
  const more = s.giveGift('marlowe', 'tonikum');
  assert.equal(more.ok, true);
  assert.equal(more.delta, 0, 'mehr als geschenk_max bringt nichts mehr');
  const bad = s.giveGift('marlowe', 'blitzpulver');
  assert.equal(bad.delta, -1);
  assert.equal(s.itemCount('blitzpulver'), 1, 'Verabscheutes behält sie nicht');
  assert.equal(s.relation('marlowe'), 2);
  assert.ok(/Fenwicks Tonikum/.test(first.text) && /Marlowe/.test(first.text));
});

test('Jede Figur mag etwas: ohne Profil zwei feste Arten, mit Profil die eigenen', () => {
  const s = fresh();
  for (const id of Object.keys(content.npcs)) {
    const t = s.giftTastes(id);
    assert.ok(t.kinds.length >= 1 && t.kinds.length <= 2, id);
    assert.deepEqual(t.kinds, s.giftTastes(id).kinds);
  }
  assert.deepEqual(s.giftTastes('nell').kinds, ['ingredient', 'potion']);
  assert.equal(s.giftFit('kit', 'spazierstock'), 'hass');
  const opts = s.giftOptions('greta');
  assert.ok(opts.every((o) => ['mag', 'wertvoll', 'hass', 'nein'].includes(o.fit)));
});

test('Beweisstücke, Formeln und die einzige Waffe lassen sich nicht verschenken', () => {
  const s = fresh();
  const key = Object.keys(content.items).find((i) => content.items[i].kind === 'key');
  s.addItem(key, 1);
  s.inventory.spazierstock = 1;
  s.equip('spazierstock');
  const ids = s.giftOptions().map((it) => it.id);
  assert.ok(!ids.includes(key));
  assert.ok(!ids.includes('spazierstock'));
  s.addItem('spazierstock', 1);
  assert.ok(s.giftOptions().some((it) => it.id === 'spazierstock'), 'die zweite Waffe darf weg');
});

test('Kampf im Gespräch macht die Figur feindselig, Übungskämpfe nicht', () => {
  const s = fresh();
  const practice = Object.keys(content.encounters).find((e) => content.encounters[e].practice);
  s.hostileAfterFight('holt', practice);
  assert.equal(s.mood('holt'), 'neutral');
  s.hostileAfterFight('price', 'fog_hound');
  assert.equal(s.mood('price'), 'feindselig');
  // war sie schon weiter unten, bleibt sie dort
  s.changeRelation('price', -2);
  const v = s.relation('price');
  s.hostileAfterFight('price', 'fog_hound');
  assert.equal(s.relation('price'), v);
});

test('Händler: freundliche geben Nachlass, feindselige schlagen auf', () => {
  const s = fresh();
  const dearest = (st) => st.reduce((a, b) => (b.price > a.price ? b : a));
  const base = dearest(s.shopStock('nell'));
  s.changeRelation('nell', 3);
  assert.ok(s.shopStock('nell').find((e) => e.item === base.item).price < base.price);
  s.changeRelation('nell', -6);
  assert.equal(s.mood('nell'), 'feindselig');
  assert.ok(s.shopStock('nell').find((e) => e.item === base.item).price > base.price);
});

test('Einzelgänger und Gefährten behalten ihren Vertrauenswert, er zählt als Beziehung', () => {
  const s = fresh();
  const loner = Object.keys(content.loners.list)[0];
  s.changeRelation(loner, 1);
  assert.equal(s.bond(loner), 1);
  assert.equal(s.relation(loner), 1);
  s.changeRelation('zunder', 2);
  assert.equal(s.bond('zunder'), 2);
  assert.equal(s.relation('zunder'), 2);
  assert.equal(s.relations.zunder, undefined);
  s.changeRelation(loner, 5);
  assert.equal(s.mood(loner), 'freundlich');
});

test('Gespräch über talk(): Holts Entlastung hebt die Beziehung, auch über den Spielstand hinweg', () => {
  const s = fresh();
  ['case_02_closed', 'holt_suspect'].forEach((f) => s.flags.add(f));
  s.applyEffects(content.dialogues.holt.nodes.holt_clear, { nodeKey: 'holt.holt_clear' });
  s.changeRelation('greta', 4);
  s.addItem('tonikum', 1);
  s.giveGift('marlowe', 'tonikum');
  const data = JSON.parse(JSON.stringify(s.serialize(null)));
  const t = fresh();
  assert.ok(t.load(data));
  assert.equal(t.relation('holt'), 1);
  assert.equal(t.mood('greta'), 'freundlich');
  assert.equal(t.gifts.marlowe, 1);
  // alter Stand ohne Beziehungen: alles neutral
  delete data.relations;
  delete data.gifts;
  const u = fresh();
  assert.ok(u.load(data));
  assert.equal(u.mood('greta'), 'neutral');
});

test('Zu zweit: die Beziehung gehört dem Ermittler und bleibt, wenn Spieler 2 handelt', () => {
  const s = fresh();
  s.addP2();
  s.withPlayer(2, () => { s.addItem('tonikum', 1); s.giveGift('marlowe', 'tonikum'); });
  assert.equal(s.relation('marlowe'), 1);
  assert.equal(s.itemCount('tonikum'), 0);
  assert.equal(s.p2.inventory.tonikum, undefined);
  s.removeP2?.();
  assert.equal(s.relation('marlowe'), 1);
});

test('Alle Beziehungs-Bedingungen in den Dialogen nennen bekannte Figuren', () => {
  const bad = [];
  for (const [d, tree] of Object.entries(content.dialogues)) {
    for (const [n, node] of Object.entries(tree.nodes ?? {})) {
      const specs = [node, ...(node.choices ?? []), ...(node.choices ?? []).flatMap((c) => (Array.isArray(c.next) ? c.next : []))];
      for (const o of specs) {
        for (const key of ['relation', 'requires_relation', 'requires_relation_max', 'requires_mood', 'hide_if_mood']) {
          for (const id of Object.keys(o?.[key] ?? {})) if (!content.npcs[id]) bad.push(`${d}/${n}: ${key} ${id}`);
        }
      }
    }
  }
  assert.deepEqual(bad, []);
  // talk() liefert weiterhin Knotenfolgen
  const s = fresh();
  assert.ok(talk(s, 'pimm').length >= 1);
});
