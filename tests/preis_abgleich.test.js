import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';

// Preisabgleich (Seb, 2026-11-13): Heilung, Nerven, Konzentration und Artefakte passen zum Kapitel.
const content = loadContent();
const M = content.market.merchants;
const maxHeal = (mid) => Math.max(...M[mid].stock.filter((e) => e.rare === undefined).map((e) => content.items[e.item]?.heal ?? 0));

test('Jedes Gebiet heilt im Laden passend zu den Leben dort', () => {
  assert.ok(maxHeal('gorse') >= 25, 'Kettlegate');
  assert.ok(maxHeal('wx_pfandleiherin') >= 50, 'Wexmoor');
  assert.ok(maxHeal('dsa_apothekerin') >= 250, 'Dunscar');
  assert.ok(Math.max(maxHeal('vi_handel_garten'), maxHeal('vi_handel_reise')) >= 250, 'Calderwick/Briarholt');
});

test('Kapitel-4/5-Waffen liegen über allem aus Dunscar-Läden', () => {
  const ds = Math.max(...['ds_waffenhaendlerin', 'k3h_steinmetz'].flatMap((m) => M[m].stock.map((e) => content.items[e.item]?.atk ?? 0)));
  const spaet = ['vi_handel_druckerei', 'vi_handel_garten', 'vi_handel_reise'].flatMap((m) => M[m].stock.filter((e) => e.rare === undefined).map((e) => content.items[e.item]).filter((i) => i.kind === 'weapon').map((i) => i.atk));
  assert.ok(Math.min(...spaet) > ds);
});

test('Kapitel-4/5-Ware schlägt auch die Dunscar-Zirkelware (Seb: 27er-Zirkelwaffe machte sie zu Müll)', () => {
  const zirkel = ['schichtbund', 'kalkofen', 'stellwerk', 'salzds'].flatMap((c) => content.gatherings.circles[c].members.flatMap((m) => m.offers ?? [])).map((e) => content.items[e.item]);
  const median = (a) => a.sort((x, y) => x - y)[a.length >> 1];
  const ladenWaffen = ['vi_handel_druckerei', 'vi_handel_garten', 'vi_handel_reise'].flatMap((m) => M[m].stock.filter((e) => e.rare === undefined).map((e) => content.items[e.item]).filter((i) => i.kind === 'weapon').map((i) => i.atk));
  const zirkelAtk = zirkel.filter((i) => i?.kind === 'weapon').map((i) => i.atk);
  assert.ok(Math.min(...ladenWaffen) > median(zirkelAtk), 'schwächste K4-Waffe über dem Zirkel-Median');
  assert.ok(Math.max(...ladenWaffen) > Math.max(...zirkelAtk), 'stärkste K4-Waffe über der stärksten Zirkelwaffe');
  assert.equal(Math.max(...ladenWaffen), 50, 'Seb: Waffen bis 50');
  for (const [id, it] of Object.entries(content.items)) if (it.kind === 'weapon' && it.atk >= 50) assert.ok(it.price >= 25000, `${id}: eine 50er kostet mindestens 25.000`);
  const hp = (i) => (i.boons ?? []).filter((b) => b.key === 'max_hp').reduce((a, b) => a + b.value, 0);
  const ladenHp = Math.max(...['vi_handel_druckerei', 'vi_handel_garten', 'vi_handel_reise'].flatMap((m) => M[m].stock.filter((e) => e.rare === undefined).map((e) => content.items[e.item]).filter((i) => i.kind === 'gear').map(hp)));
  assert.ok(ladenHp > Math.max(...zirkel.filter((i) => i?.kind === 'gear').map(hp)), 'K4-Kleidung über Zirkelkleidung');
});

test('Alle Artefakte haben mindestens eine echte Wirkung', () => {
  for (const [id, it] of Object.entries(content.items)) {
    if (it.kind !== 'artifact' || id === 's4mo_relikt') continue;
    assert.ok((it.boons ?? []).some((b) => b.key), `${id}: Vorteil ohne Wirkung`);
  }
});

test('Rangiererkaffee gibt im Kampf Konzentration', () => {
  const s = new GameState(content);
  s.addItem('dsh_kaffee');
  const c = new Combat(s, 'miriam');
  const before = c.fighters[1].ap;
  c.useItem('dsh_kaffee');
  assert.equal(c.fighters[1].ap, before + 1);
});

test('Kurglocke: gewöhnliche Gegner setzen den ersten Zug aus', () => {
  const s = new GameState(content);
  s.addItem('vi_art_die_kurglocke');
  assert.ok(s.passive('opening_stun')); // Artefakte wirken beim Mitführen
  assert.equal(new Combat(s, 'miriam').stunned, !content.encounters.miriam.boss);
});

test('Geisterlaterne: eine Minute lang keine neue Unruhe, alter Preis', () => {
  const s = new GameState(content);
  s.pathway = { id: 'eisen', seq: 6, digestion: 0 };
  s.addItem('dsz_geisterlaterne');
  s.useItem('dsz_geisterlaterne');
  s.setUnruhe(10);
  assert.equal(s.unruhe, 0);
  s.talentTime = (s.talentTime ?? 0) + 61;
  s.setUnruhe(10);
  assert.equal(s.unruhe, 10);
  const lose = Object.values(content.gatherings.circles).flatMap((c) => c.members.flatMap((m) => m.offers ?? [])).filter((e) => e.item === 'dsz_geisterlaterne');
  assert.ok(lose.length && lose.every((e) => e.price === 1500));
});
