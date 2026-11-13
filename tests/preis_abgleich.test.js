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
