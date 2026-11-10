// Kontrollverlust korrumpiert Waffe, Kleidung und Artefakte am Leib; sie zehren, bis man sie ablegt oder reinigt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const gearId = Object.keys(content.items).find((id) => content.items[id].kind === 'gear' && content.items[id].slot === 'hut');
const artId = Object.keys(content.artifacts.list)[0];

/** Ermittler mit Waffe, Hut und einem Artefakt, der gerade die Kontrolle verliert. */
function fallen() {
  const s = new GameState(content);
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem(gearId);
  s.wear(gearId);
  s.addItem(artId);
  s.money = 500;
  s.loseControl('Test');
  return s;
}

test('Kontrollverlust korrumpiert alles am Leib und erzählt von den Tentakeln', () => {
  const s = new GameState(content);
  let ev = null;
  s.on('lostcontrol', (e) => { ev = e; });
  s.addItem('schlagstock'); s.addItem(gearId); s.wear(gearId); s.addItem(artId);
  s.addItem('spazierstock'); // nicht ausgerüstet: bleibt sauber
  const text = s.loseControl('Test');
  assert.match(text, /Tentakel/);
  assert.match(text, /korrumpiert/);
  assert.deepEqual(new Set(ev.corrupted), new Set(['schlagstock', gearId, artId]));
  assert.ok(s.isCorrupted('schlagstock') && s.isCorrupted(gearId) && s.isCorrupted(artId));
  assert.equal(s.isCorrupted('spazierstock'), false);
  assert.equal(s.corruptedInUse().length, 3);
});

test('Ohne etwas am Leib finden die Tentakel nichts', () => {
  const s = new GameState(content);
  s.weapon = null;
  const text = s.loseControl('Test');
  assert.match(text, /finden nichts/);
  assert.equal(s.corruptedItems().length, 0);
});

test('Korrumpierte Stücke in Gebrauch kosten Leben und Nerven, nie unter 1 Leben', () => {
  const s = fallen();
  s.hp = s.maxHp; s.composure = s.maxComposure();
  const r = s.corruptionRules();
  s.tick(10);
  // 3 Stücke * 10 s: Leben um floor(3 * hp_per_sec * 10) gesunken (Regeneration der Nerven im Spiel: 6/s, Korruption 1,5/s)
  assert.equal(s.hp, s.maxHp - Math.floor(3 * r.hp_per_sec * 10));
  assert.ok(s.composure < s.maxComposure(), 'Nerven unter Höchstwert');
  s.hp = 2;
  s.tick(200);
  assert.equal(s.hp, 1);
});

test('Ablegen beendet das Zehren: Waffe, Hut und ausnahmsweise das Artefakt', () => {
  const s = fallen();
  assert.equal(s.unequipWeapon(), true);
  assert.equal(s.weapon, null);
  assert.equal(s.weaponStats().name, 'Fäuste');
  s.takeOff('hut');
  // Artefakte wirken sonst immer beim Mitführen; korrumpierte darf man beiseitelegen
  assert.equal(s.setAsideArtifact(artId).ok, true);
  assert.equal(s.isArtifactActive(artId), false);
  assert.equal(s.activeArtifacts().includes(artId), false);
  assert.equal(s.corruptedInUse().length, 0);
  const hp = s.hp;
  s.tick(30);
  assert.equal(s.hp, hp);
  // Wieder aufnehmen: wirkt und zehrt wieder
  assert.equal(s.takeUpArtifact(artId).ok, true);
  assert.equal(s.corruptedInUse().includes(artId), true);
  // Saubere Artefakte lassen sich nicht beiseitelegen
  const clean = new GameState(content);
  clean.addItem(artId);
  assert.equal(clean.setAsideArtifact(artId).ok, false);
  assert.equal(clean.unequipWeapon(), false);
});

test('Eine korrumpierte Waffe schlägt härter', () => {
  const s = fallen();
  assert.equal(s.weaponStats().atk, content.items.schlagstock.atk + s.corruptionRules().weapon_atk_bonus + s.passive('atk'));
});

test('Reinigen bei Dr. Varga kostet Schilling, Läutersalz einen Beutel', () => {
  const s = fallen();
  const offers = s.cleanseOffers();
  assert.equal(offers.length, 3);
  const art = offers.find((o) => o.id === artId);
  assert.equal(art.price, s.corruptionRules().cleanse_price.artifact);
  const money = s.money;
  assert.equal(s.cleanseAt(artId).ok, true);
  assert.equal(s.money, money - art.price);
  assert.equal(s.isCorrupted(artId), false);
  s.money = 0;
  assert.equal(s.cleanseAt('schlagstock').ok, false);
  assert.equal(s.cleanseWithSalt('schlagstock').ok, false, 'ohne Salz');
  s.addItem('laeutersalz');
  assert.equal(s.cleanseWithSalt('schlagstock').ok, true);
  assert.equal(s.itemCount('laeutersalz'), 0);
  assert.equal(s.isCorrupted('schlagstock'), false);
  assert.equal(s.corruptedInUse().length, 1); // nur noch der Hut
});

test('Zweiter Kontrollverlust macht die Reinigung teurer', () => {
  const s = fallen();
  s.loseControl('Nochmal');
  assert.equal(s.corrupted.schlagstock, 2);
  assert.equal(s.cleansePrice('schlagstock'), 2 * s.corruptionRules().cleanse_price.weapon);
});

test('Einlagern hilft nicht, Wegwerfen schon; Weitergeben nimmt die Korruption mit', () => {
  const s = fallen();
  s.storeItem(gearId, 1, 'buero');
  s.retrieveItem(gearId, 1, 'buero');
  assert.equal(s.isCorrupted(gearId), true, 'nach Einlagern noch korrumpiert');
  s.unequipWeapon();
  assert.equal(s.dropItem('schlagstock').ok, true);
  assert.equal(s.isCorrupted('schlagstock'), false);
  s.addP2();
  assert.equal(s.giveItem(artId, 1).ok, true);
  assert.equal(s.withPlayer(2, () => s.isCorrupted(artId)), true);
  assert.equal(s.isCorrupted(artId), false);
});

test('Läutersalz gibt es bei Nell, es hat ein Icon und nützt nur außerhalb des Kampfes', () => {
  assert.ok(content.market.merchants.nell.stock.some((e) => e.item === 'laeutersalz'));
  assert.ok(existsSync(new URL('../public/sprites/items/laeutersalz.png', import.meta.url)));
  assert.ok(existsSync(new URL('../public/sprites/ui/scenes/kontrollverlust.png', import.meta.url)), 'Platzhalterbild der Cutscene');
  const s = new GameState(content);
  s.addItem('laeutersalz');
  assert.match(s.useItem('laeutersalz'), /Nichts an dir/);
  assert.equal(s.itemCount('laeutersalz'), 1);
});

test('Korruption überlebt Speichern und Laden, auch bei Spieler 2', () => {
  const s = fallen();
  s.setAsideArtifact(artId);
  s.addP2();
  s.withPlayer(2, () => { s.addItem('spazierstock'); s.loseControl('P2'); });
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const t = new GameState(content);
  assert.equal(t.load(data), true);
  assert.equal(t.isCorrupted('schlagstock'), true);
  assert.equal(t.isSetAside(artId), true);
  assert.equal(t.isArtifactActive(artId), false);
  assert.equal(t.withPlayer(2, () => t.isCorrupted('spazierstock')), true);
  assert.equal(t.isCorrupted('spazierstock'), false);
});
