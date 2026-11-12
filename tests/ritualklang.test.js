// Paket DS (Codex, PR #331): Klänge der Rituale Seq 6 bis 4 (manifest-sfx4.json) und vier Musikstücke (manifest-musik-rituale.json).
// Wie bei Y/CM (tests/sounds.test.js) muss jede gelieferte Id eine Stelle im Spiel haben.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { loadContent, seeded } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { Laternenwacht, WACHT } from '../src/core/Laternenwacht.js';
import { HG_SUDE } from '../src/data/seq4.js';
import {
  laternenSound, ritualSkillSound, kesselWurfSound, sudZutatVariant, sudSounds, ruleBlockSound, seq4ResultSounds, ritualLoops, RITUAL_LOOPS,
  updateRitualSounds, wireSounds, combatSound,
} from '../src/core/sounds.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const sfx4 = json('public/audio/manifest-sfx4.json');
const older = ['sfx', 'sfx2', 'sfx3'].map((k) => json(`public/audio/manifest-${k}.json`));
const known = (id) => !!sfx4.sounds[id] || older.some((m) => m.sounds[id]);
const files = (m, id) => {
  const s = m.sounds[id];
  const names = s.variants > 1 ? Array.from({ length: s.variants }, (_, i) => `${id}_${i + 1}`) : [id];
  return names.flatMap((n) => m.formats.map((f) => new URL(`../public/${m.base}${n}.${f}`, import.meta.url)));
};
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');
const USED = ['core/sounds.js', 'core/Seq4.js', 'core/Seq5.js', 'core/Combat.js', 'core/Proben.js', 'core/Auction.js', 'core/Pathways.js', 'core/GameState.js',
  'world/WorldScene.js', 'world/CombatScene.js', 'world/HalbgottRitual.js', 'ui/Ui.js'].map(src).join('\n');
const content = loadContent();

test('DS: alle 92 Klänge liegen mit jeder Variante als OGG und MP3 vor und werden im Spiel angesprochen', () => {
  const ids = Object.keys(sfx4.sounds);
  assert.equal(ids.length, 92);
  const missing = [];
  for (const id of ids) {
    for (const f of files(sfx4, id)) assert.ok(existsSync(f), f.pathname);
    if (!new RegExp(`(^|[^a-z0-9_])${id}([^a-z0-9_]|$)`).test(USED)) missing.push(id);
  }
  assert.deepEqual(missing, []);
});

test('DS: das Spiel lädt sfx4 und aus Paket DB die wiederverwendeten Halbgott-Klänge', () => {
  const main = src('main.js');
  assert.match(main, /'sfx4'/);
  assert.match(main, /'sfx3:hg_'/);
  const sfx3 = older[2];
  for (const id of ['hg_ritual_beginn', 'hg_ritual_siegel', 'hg_schwellenwaechter_kalk', 'hg_schwellenwaechter_schlag', 'hg_schwellenwaechter_zerfall', 'hg_kreatur_stimme']) {
    assert.ok(sfx3.sounds[id], id);
    for (const f of files(sfx3, id)) assert.ok(existsSync(f), f.pathname);
  }
});

test('DS: Zuordnungen zeigen auf vorhandene Klänge (Laternennacht, Kessel, Sude, Verbote, Ergebnisse, Kampf)', () => {
  const ids = [
    ...['hit', 'kill', 'scorch', 'lantern_attacked', 'lantern_out', 'refill', 'tired', 'guardian', 'sunrise', 'sunrise_fail'].map((type) => laternenSound({ type })),
    ritualSkillSound('attack', { shadow: true }), ritualSkillSound('attack', {}, { onlyAttack: true }),
    ...HG_SUDE.map((e) => kesselWurfSound(e.id, { name: e.name, damage: 10 })), kesselWurfSound('wurf_spreng', content.items.wurf_spreng), kesselWurfSound('wurf_gift', content.items.wurf_gift),
    ...sudSounds({ ok: true, recipe: 'x' }).map(([id]) => id), ...sudSounds({ ok: true, recipe: null }).map(([id]) => id),
    ruleBlockSound({ potionOnly: true }, { type: 'skill' }), ruleBlockSound({ onlyAttack: true }, { type: 'skill' }), ruleBlockSound({ noHeal: true, dream: true }, { type: 'item' }), ruleBlockSound({ noHeal: true, shadow: true }, { type: 'skill' }),
    ...['laterne', 'faden', 'schluessel', 'echo'].flatMap((kind) => [true, false].flatMap((passed) => seq4ResultSounds({ kind, passed }).map(([id]) => id))),
    ...RITUAL_LOOPS,
    combatSound('start', { id: 'hg_schwellenwaechter_eisen' }), combatSound('start', { id: 'hg_traumgeflecht' }), combatSound('defeated', { id: 'hg_schwellenwaechter_uhr' }),
    combatSound('hit', { id: 'hg_schwellenwaechter_maske', kind: 'blunt', who: 'player' }),
  ];
  for (const id of ids) assert.ok(id && known(id), String(id));
  for (const id of RITUAL_LOOPS) assert.equal(sfx4.sounds[id].loop, true, id);
  assert.equal(kesselWurfSound('s4ke_frostlauge', { name: 'Frostlauge', damage: 1 }), 's4ke_wurf_frost');
  assert.equal(kesselWurfSound('s4ke_glutschleim', { name: 'Glutschleim', damage: 1 }), 's4ke_wurf_glut');
  assert.equal(kesselWurfSound('s4ke_knallsud', { name: 'Knallsud', damage: 1 }), 's4ke_wurf_explosion');
  assert.equal(kesselWurfSound('tonikum', { name: 'Tonikum', heal: 10 }), null);
  assert.equal(sudZutatVariant('silberstaub'), 1);
  assert.equal(sudZutatVariant('nebeltau'), 3);
  assert.equal(sudZutatVariant('bitterwurz'), 2);
  assert.equal(ruleBlockSound(null, { type: 'skill' }), null);
  assert.equal(combatSound('start', { id: 'holt_training' }), 'kampf_start');
});

test('DS: state.sfx spielt über wireSounds, mit fester Variante, Verzögerung und Mindestabstand; Prüfungsenden klingen', async () => {
  const s = new GameState(content);
  const played = [];
  wireSounds(s, { play: (id, o) => played.push(o?.variant ? `${id}#${o.variant}` : id) }, null);
  s.sfx('s4ke_trinken_reihe', { variant: 3 });
  s.sfx('s4r_waechter_immun', { throttle: 1000 });
  s.sfx('s4r_waechter_immun', { throttle: 1000 });
  s.sfx('s4ma_zweifel', { delay: 5 });
  s.emit('seq4', { kind: 'schluessel', passed: false });
  assert.deepEqual(played, ['s4ke_trinken_reihe#3', 's4r_waechter_immun', 'schatten_verloren']);
  await new Promise((r) => setTimeout(r, 700));
  assert.deepEqual(played.slice(3).sort(), ['ritual_fehlschlag', 's4ma_zweifel']);
});

/** Wie seq4_rituale.test.js: Sequenz 5, voll verdaut, im Monstergebiet von Wexmoor. */
function at(pid) {
  const s = new GameState(content);
  s.pathway = { id: pid, seq: 5, digestion: 100 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  s.map = content.encounters.torfgaenger.zone;
  s.rng = seeded(5);
  const heard = [];
  s.on('sfx', ({ id, variant }) => heard.push(variant ? `${id}#${variant}` : id));
  return { s, heard };
}

test('DS: Seq-4-Prüfungen klingen an ihren Schritten (Schatten, Maske, Waage, Faden, Moorwasser, Uhr, Eisen)', () => {
  let { s, heard } = at('schluessel');
  assert.equal(s.startShadow().ok, true);
  assert.ok(heard.includes('schatten_trennen'));
  ({ s, heard } = at('maske'));
  s.startMaske();
  assert.ok(heard.includes('s4ma_verwandeln'));
  ({ s, heard } = at('sq_waage'));
  s.money = 500;
  s.startWaage(200);
  assert.ok(heard.includes('s4wa_besitz_versiegeln'));
  ({ s, heard } = at('faden'));
  s.markFate('torfgaenger');
  assert.ok(heard.includes('s4fa_markieren'));
  // Moorwasser je Runde, leer bricht die Regel
  ({ s, heard } = at('sq_moor'));
  s.addItem('moorwasser');
  const c = new Combat(s, 'torfgaenger', { rng: seeded(1) });
  c.rules = { moorwater: true };
  c.drinkMoor();
  c.drinkMoor();
  assert.deepEqual(heard.filter((h) => h.startsWith('s4mo') || h.startsWith('s4r')), ['s4mo_moorwasser_trinken', 's4mo_moorwasser_leer', 's4r_regel_gebrochen']);
  // Eisen: Nieten bis Runde 5, dann springt der Ring
  ({ s, heard } = at('eisen'));
  const e = new Combat(s, 'torfgaenger', { rng: seeded(1) });
  e.rules = { minKillRound: 3 };
  e.endRound();
  e.endRound();
  assert.deepEqual(heard.filter((h) => h.startsWith('s4ei')), ['s4ei_runde_ueberstanden', 's4ei_waechter_frei']);
});

test('DS: Laternennacht meldet Klirren und Zischen gedrosselt, Schleifen folgen dem Ritual', () => {
  const w = new Laternenwacht({ x: 0, y: 0 }, { rng: seeded(3), rules: { ...WACHT, monsterHp: 400 }, hooks: { nerves: () => 100, spend: () => {}, hurt: () => 50, unruhe: () => {} } });
  const types = new Set();
  let attacked = 0;
  for (let i = 0; i < 400; i++) for (const ev of w.update(0.1, { x: 0, y: 0 })) { types.add(ev.type); if (ev.type === 'lantern_attacked') attacked += 1; }
  assert.ok(types.has('scorch'), [...types].join(','));
  assert.ok(types.has('lantern_attacked') && attacked <= 40 / 1.4 + 1, `${attacked}`);
  // Schleifen: Laternennacht an, wieder aus; Kessel-Rezepte offenbart klingen einmal
  const calls = [];
  const audio = { loop: (id) => calls.push(`+${id}`), stopLoop: (id) => calls.push(`-${id}`), play: (id) => calls.push(id), loopVolume: () => {} };
  const st = { siege: true };
  let unlocked = false;
  const state = { seq4Kind: () => 'laterne', seq4: () => st, shadowActive: () => false, freeBrewUnlocked: () => false, hgRecipesUnlocked: () => unlocked };
  assert.deepEqual(ritualLoops(state), ['s4la_amb_nacht', 's4la_unruhe_puls']);
  let memo = updateRitualSounds(state, audio, {});
  st.siege = false;
  unlocked = true;
  memo = updateRitualSounds(state, audio, memo);
  updateRitualSounds(state, audio, memo);
  assert.deepEqual(calls, ['+s4la_amb_nacht', '+s4la_unruhe_puls', '-s4la_amb_nacht', '-s4la_unruhe_puls', 's4ke_rezept_frei']);
  assert.deepEqual(ritualLoops({ freeBrewUnlocked: () => true }, { modal: 'brew' }), ['sud_brodeln_loop']);
});
