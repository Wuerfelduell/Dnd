import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('In Kettlegate gibt es kein Auto-Verknüpfen', () => {
  const s = new GameState(content);
  s.addClue('frosted_lamp');
  s.addClue('testimony_humming');
  assert.equal(s.autoLinkFrei(), false);
  assert.equal(s.autoCombine('case_01').result, 'locked');
  assert.equal(s.hasConclusion('unnatural_cold'), false);
});

test('Ab Wexmoor zieht Auto-Verknüpfen alle vollständigen Paare eines Falls, aber keine widerlegten', () => {
  const s = new GameState(content);
  s.flags.add('k2_arrived');
  assert.equal(s.autoLinkFrei(), true);
  assert.equal(s.autoCombine('case_01').result, 'nothing');
  s.addClue('frosted_lamp');
  s.addClue('testimony_humming'); // unnatural_cold: lamp_frozen + lullaby
  s.addClue('wax_seal'); // seal_at_bridge, Partner vey_key fehlt noch
  s.addClue('dropped_pole');
  s.addClue('footprints'); // elias_alive: pole_climb + to_pawnshop
  const r = s.autoCombine('case_01');
  assert.equal(r.result, 'new');
  assert.deepEqual(r.deductions.map((d) => d.id).sort(), ['elias_alive', 'unnatural_cold']);
  assert.equal(s.hasConclusion('vey_sigil'), false, 'halbes Paar bleibt offen');
  // Zweiter Druck: nichts Neues
  assert.equal(s.autoCombine('case_01').result, 'nothing');
  // Sobald der Partner auftaucht, folgt die nächste Schlussfolgerung
  s.addClue('pawn_ledger');
  assert.deepEqual(s.autoCombine('case_01').deductions.map((d) => d.id), ['vey_sigil']);
});

test('Auto-Verknüpfen bleibt beim gewählten Fall', () => {
  const s = new GameState(content);
  s.flags.add('k2_arrived');
  s.addClue('frosted_lamp');
  s.addClue('testimony_humming');
  assert.equal(s.autoCombine('case_02').result, 'nothing');
  assert.equal(s.hasConclusion('unnatural_cold'), false);
  assert.equal(s.autoCombine('case_01').result, 'new');
});
