// Welt-Fähigkeiten ab Seq 4 mit eigenem Kniff (Seb 2026-11-26): jede Seq 4–1 jedes Pfades hat ein eigenes Gimmick.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { BUFF_LABELS } from '../src/core/Talents.js';
import { loadContent, seeded } from './helpers.js';

const content = loadContent();
const WELT_BUFFS = ['move_speed', 'gegnergesicht', 'patrol_blind', 'lichtschranke', 'lautlos', 'ironskin', 'moorgrund', 'schattengestalt'];
const GIMMICKS = ['smite', 'freeze', 'lure', 'rob', 'blink', 'rewind', 'knockback', 'infight', 'harvest', 'tether', 'forget', 'tribute', 'balance', 'brew'];

function beyonder(pid, seq, s = new GameState(content)) {
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.composure = s.maxComposure();
  return s;
}

test('Seq 4–1: jede Welt-Fähigkeit hat ein Gimmick oder einen Karten-Buff, keine Ansehen-Wirkung, keine Kombination doppelt', () => {
  const seen = new Set();
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const n of [4, 3, 2, 1]) {
      const t = p.seqs[n]?.talent;
      if (!t) continue;
      const buffs = [t.buff, t.buff2].filter(Boolean).map((b) => b.key);
      const gim = Object.keys(t.gimmick ?? {});
      for (const g of gim) assert.ok(GIMMICKS.includes(g), `${t.id}: unbekanntes Gimmick ${g}`);
      for (const k of buffs) { assert.ok(BUFF_LABELS[k], `${t.id}: Buff ${k} ohne Text`); assert.ok(!/honor/.test(k), `${t.id}: Ansehen`); }
      assert.ok(gim.length || buffs.some((k) => WELT_BUFFS.includes(k)), `${pid} ${n}: ${t.id} ohne eigenen Kniff`);
      const sig = [...gim.map((g) => `${g}:${JSON.stringify(t.gimmick[g])}`), ...[t.buff, t.buff2].filter((b) => b && WELT_BUFFS.includes(b.key)).map((b) => `${b.key}:${b.value}`)].sort().join('|');
      assert.ok(!seen.has(sig), `${t.id}: gleicher Kniff wie eine andere Fähigkeit`);
      seen.add(sig);
    }
  }
  assert.ok(seen.size >= 40);
});

test('Gimmick-Fähigkeiten melden sich bei der Karte, Karten-Buffs gehören dem Spieler', () => {
  const s = beyonder('sq_uhr', 4);
  const events = [];
  s.on('talent', (e) => events.push(e));
  assert.equal(s.useTalent('uhr_sekundenschatten').ok, true);
  const g = events.find((e) => e.effect === 'gimmick');
  assert.deepEqual(g.gimmick.rewind, { seconds: 10 });
  assert.equal(g.player, 1);

  const k = beyonder('kessel', 4);
  k.useTalent('schichtung');
  assert.equal(k.buffOf('move_speed', 1), 1.35);
  assert.equal(k.buffOf('move_speed', 2), null);
  k.tickTalents(400);
  assert.equal(k.buffOf('move_speed', 1), null, 'läuft ab');
});

test('Waage: Gleichgewicht hebt das Niedrigere auf den Mittelwert, nichts sinkt', () => {
  const s = beyonder('sq_waage', 4);
  s.hp = Math.round(s.maxHp * 0.2);
  s.composure = s.maxComposure();
  const cost = s.talentDef('waage_pfandkoerper').nerves;
  const r = s.useTalent('waage_pfandkoerper');
  assert.equal(r.ok, true);
  assert.ok(s.hp >= Math.round(s.maxHp * 0.5) - 1, `Leben ${s.hp}/${s.maxHp}`);
  assert.ok(s.composure >= s.maxComposure() - cost - 1, 'Nerven sinken nur um die Kosten');
  assert.match(r.text, /Waage/);
});

test('Kessel: Abwärme braut zwei Heilmittel', () => {
  const s = beyonder('kessel', 2);
  const before = Object.values(s.inventory).reduce((a, b) => a + b, 0);
  const r = s.useTalent('abwaerme', seeded(3));
  assert.equal(r.ok, true);
  assert.equal(Object.values(s.inventory).reduce((a, b) => a + b, 0), before + 2);
  assert.match(r.text, /Gebraut/);
});

test('Alte Spielstände: Buffs ohne neue Schlüssel laden, neue Buffs speichern mit', () => {
  const s = beyonder('echo', 3);
  s.useTalent('nachruf');
  const t = new GameState(content);
  t.loadTalents(JSON.parse(JSON.stringify(s.serializeTalents())));
  t.pathway = { id: 'echo', seq: 3, digestion: 0 };
  assert.equal(t.buffOf('lautlos', 1), 1);
  const old = new GameState(content);
  old.loadTalents({ talentTime: 5 });
  assert.equal(old.buffOf('lautlos', 1), null);
});
