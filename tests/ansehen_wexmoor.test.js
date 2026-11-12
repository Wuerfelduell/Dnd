// Ansehen zählt nur bei der Polizei von Kettlegate. Ab Wexmoor bekommen die Ansehens-Fähigkeiten eine zweite Wirkung:
// conclusion_honor → Schilling je Schlussfolgerung, honor_loss → Grauspäher erkennen langsamer, lock_bonus → Fahndung sinkt schneller.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { CONCLUSION_SCHILLING } from '../src/core/Talents.js';
import { RECOGNIZE_MULT } from '../src/core/Wanted.js';
import { loadContent } from './helpers.js';

const content = loadContent();

function wexmoor(pid, seq) {
  const s = new GameState(content);
  s.flags.add('kapitel1_done');
  s.map = 'wx_salzmarkt';
  if (pid) {
    s.pathway = { id: pid, seq, digestion: 0 };
    s.updateMaxHp();
    s.composure = s.maxComposure();
  }
  return s;
}

const conclusionIn = (caseId) => content.deductions.find((d) => d.case === caseId && d.honor !== 0).id;

test('Schlussfolgerungen bringen mit Ansehens-Passiv ab Wexmoor Schilling, in Kettlegate nicht', () => {
  const s = wexmoor('faden', 6); // Spurenleser 9 + Netzknüpfer 6: +2
  const bonus = s.passive('conclusion_honor');
  assert.ok(bonus >= 2);
  const before = s.money;
  s.addConclusion(conclusionIn('kapitel2'));
  assert.equal(s.money - before, bonus * CONCLUSION_SCHILLING);

  const k = new GameState(content);
  k.pathway = { id: 'faden', seq: 6, digestion: 0 };
  const m = k.money;
  k.addConclusion(conclusionIn('case_01'));
  assert.equal(k.money, m, 'vor Wexmoor nur Ansehen');

  const plain = wexmoor('eisen', 7);
  const p = plain.money;
  plain.addConclusion(conclusionIn('kapitel2'));
  assert.equal(plain.money, p, 'ohne Passiv kein Geld');
});

test('Netz spannen erhöht den Schilling-Lohn je Schlussfolgerung', () => {
  const s = wexmoor('faden', 6);
  const base = s.passive('conclusion_honor');
  assert.ok(s.useTalent('netz_spannen').ok);
  assert.equal(s.passive('conclusion_honor'), base + 2);
  const before = s.money;
  s.addConclusion(conclusionIn('kapitel2'));
  assert.equal(s.money - before, (base + 2) * CONCLUSION_SCHILLING);
});

test('Maske: Grauspäher brauchen länger, Seq-4-Nachteile machen schneller erkannt', () => {
  const plain = wexmoor('eisen', 7).policeCone(0);
  const maske = wexmoor('maske', 7).policeCone(0); // honor_loss 0.5
  assert.ok(Math.abs(maske.catchSec - plain.catchSec * 2) < 1e-9, 'halber Ansehensverlust = doppelte Erkennungszeit');
  const deep = wexmoor('maske', 4);
  assert.ok(deep.useTalent('mietgesicht').ok);
  assert.ok(deep.policeCone(0).catchSec <= plain.catchSec * RECOGNIZE_MULT[1] + 1e-9, 'gedeckelt');
  const faden4 = wexmoor('faden', 4); // Nahtträger: honor_loss 1.2
  assert.ok(faden4.passive('honor_loss') > 1 && faden4.policeCone(0).catchSec < plain.catchSec);
});

test('Schlüssel: Fahndung sinkt schneller, Schlossflüstern senkt sie sofort um eine Stufe', () => {
  const r = content.police;
  const s = wexmoor('schluessel', 8); // lock_bonus 15
  s.setWanted(2);
  assert.ok(s.wantedDecaySec() < r.decay_sec);
  s.tickWanted(s.wantedDecaySec() + 1);
  assert.equal(s.wanted, 1, 'früher vergessen als decay_sec');

  const plain = wexmoor('eisen', 7);
  plain.setWanted(2);
  plain.tickWanted(s.wantedDecaySec() + 1);
  assert.equal(plain.wanted, 2, 'ohne Schlösser-Fähigkeit noch nicht');

  s.setWanted(3);
  const res = s.useTalent('schlossfluestern');
  assert.ok(res.ok, res.text);
  assert.equal(s.wanted, 2);
  assert.match(res.text, /Fahndung -1/);
  assert.ok(s.wantedDecaySec() < wexmoor('schluessel', 8).wantedDecaySec(), 'Buff beschleunigt weiter');
});
