// Verdauungs-Herausforderung im Pfadviertel (Seb 2026-11-26): 15 % bei Erfolg, 1–5 % Trostpreis, 1× je Spieltag, je Pfad eigene Regel
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { VERDAU_PROBE, verdauEncId } from '../src/data/verdauProbe.js';
import { DAY_SECONDS } from '../src/core/Clock.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hero = (pid, seq = 4) => {
  const s = new GameState(content);
  s.flags.add('k4_arrived');
  s.addItem('revolver');
  s.weapon = 'revolver';
  s.pathway = { id: pid, seq, digestion: 20 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  return s;
};
const fight = (s, pid, outcome, round = 6) => {
  assert.equal(s.pendingCombat, verdauEncId(pid));
  const c = new Combat(s, verdauEncId(pid));
  c.outcome = outcome;
  c.round = round;
  if (outcome === 'won') c.enemy.hp = 0;
  return { c, res: c.finish({ noLoot: true }) };
};

test('Alle zehn Pfadviertel haben einen Prüfstein mit eigener Regel', () => {
  const regeln = new Set();
  for (const pid of Object.keys(content.pathways)) {
    assert.ok(VERDAU_PROBE[pid], pid);
    assert.ok(content.encounters[verdauEncId(pid)], pid);
    const st = content.maps[`o3_${pid}`].interactables.find((x) => x.id === `o3_${pid}_pruefstein`);
    assert.deepEqual(st.effects, { verdau_probe: pid });
    regeln.add(JSON.stringify(VERDAU_PROBE[pid].rules));
  }
  assert.equal(regeln.size, 10, 'jede Regel anders');
});

test('Erfolg: +15 %, solo mit Pfadregel; zweiter Versuch erst am nächsten Spieltag', () => {
  const s = hero('faden');
  s.applyEffects({ verdau_probe: 'faden' });
  const c = new Combat(s, verdauEncId('faden'));
  assert.ok(c.rules.verdau && c.rules.solo && c.rules.noHeal && c.rules.startHp === 0.6);
  const { res } = fight(s, 'faden', 'won');
  assert.match(res.text, /bestanden/);
  assert.ok(s.pathway.digestion >= 35, `${s.pathway.digestion}`);
  s.pendingCombat = null;
  s.applyEffects({ verdau_probe: 'faden' });
  assert.equal(s.pendingCombat, null, 'heute kein zweiter Versuch');
  s.playTime = (s.playTime ?? 0) + DAY_SECONDS;
  s.applyEffects({ verdau_probe: 'faden' });
  assert.equal(s.pendingCombat, verdauEncId('faden'));
});

test('Fehlschlag (verloren, Regel gebrochen, zu früh): Trostpreis 1 bis 5 %', () => {
  for (const [pid, outcome, round] of [['eisen', 'lost', 6], ['eisen', 'won', 3], ['sq_uhr', 'fled', 2]]) {
    const s = hero(pid);
    s.applyEffects({ verdau_probe: pid });
    const { res } = fight(s, pid, outcome, round);
    assert.match(res.text, /misslungen/);
    // Trostpreis 1–5 %; ein (zu früher) Sieg verdaut zusätzlich wie jeder Kampfsieg, darum nur nach unten fest prüfen
    const trost = Number(/Trostpreis: \+(\d+) %/.exec(res.text)?.[1]);
    assert.ok(trost >= 1 && trost <= 5, `${pid} ${outcome}: Trostpreis ${trost}`);
    const d = s.pathway.digestion - 20;
    assert.ok(d >= trost - 0.0001 && (outcome === 'won' || d <= 5.0001), `${pid} ${outcome}: ${d}`);
  }
});

test('Nur der eigene Pfad ab Seq 4; Seq 3 kämpft gegen einen stärkeren Gegner; Liste zeigt die Quelle', () => {
  const s = hero('laterne', 5);
  s.applyEffects({ verdau_probe: 'laterne' });
  assert.equal(s.pendingCombat, null);
  const t = hero('maske');
  t.applyEffects({ verdau_probe: 'laterne' });
  assert.equal(t.pendingCombat, null);
  const u = hero('maske', 3);
  u.applyEffects({ verdau_probe: 'maske' });
  const c3 = new Combat(u, verdauEncId('maske'));
  const v = hero('maske');
  v.applyEffects({ verdau_probe: 'maske' });
  const c4 = new Combat(v, verdauEncId('maske'));
  assert.ok(c3.enemy.maxHp > c4.enemy.maxHp);
  assert.ok(v.digestTable().some((r) => r.kind === 'verdau_probe' && r.points === 15));
});

test('Koop: Spieler 2 hat eigenen Versuch und eigene Verdauung', () => {
  const s = hero('echo');
  s.addP2();
  s.p2.pathway = { id: 'kessel', seq: 4, digestion: 10 };
  s.withPlayer(2, () => s.applyEffects({ verdau_probe: 'kessel' }));
  assert.equal(s.pendingCombat, verdauEncId('kessel'));
  assert.equal(s.combatBy, 2);
  // Splitscreen: Spieler 2 kämpft allein; Ergebnis landet bei ihm
  s.splitOn = true;
  const c = new Combat(s, verdauEncId('kessel'));
  assert.ok(c.rules?.verdau && c.rules.minItems === 4);
  c.outcome = 'won'; c.enemy.hp = 0; c.itemsUsedTotal = 4; c.round = 6;
  c.finish({ noLoot: true });
  assert.ok(s.pathway.digestion < 22, 'Spieler 1 bekommt die 15 % nicht');
  assert.ok(s.p2.pathway.digestion >= 25, `${s.p2.pathway.digestion}`);
  s.pendingCombat = null;
  s.applyEffects({ verdau_probe: 'echo' });
  assert.equal(s.pendingCombat, verdauEncId('echo'), 'Spieler 1 hat seinen eigenen Tagesversuch');
});
