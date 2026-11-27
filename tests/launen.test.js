// Launische Artefakte (Seb 2026-11-27): Bindung durch Tragezeit, Stärkestufen, Tagesforderungen, Groll, Koop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { DAY_SECONDS } from '../src/core/Clock.js';
import { wesenOf, launeScale } from '../src/core/Launen.js';
import { WESEN, LAUNE_STUFEN, STUFE_MELDUNG, GROLL_MELDUNG, GROLL_WIRKUNG, GROLL_STUFEN, SATT_MELDUNG, BESAENFTIGT_MELDUNG, RISS_MELDUNG } from '../src/data/launen.js';
import { lookup, setDict } from '../src/core/I18n.js';
import { loadContent } from './helpers.js';

const content = loadContent();

/** Spielzeit vorspulen, wie tick() es täte (Tragezeit in Schritten, Tageswechsel über playTime). */
function spiele(s, sek, schritt = 60) {
  for (let t = 0; t < sek; t += schritt) {
    s.playTime += schritt;
    s.launeTick(schritt);
  }
}

function neu() {
  const s = new GameState(content);
  s.playTime = 0;
  return s;
}

test('jedes Artefakt hat ein Wesen, und jede Forderung zählt echte Handlungen', () => {
  const arts = Object.entries(content.items).filter(([, i]) => i.kind === 'artifact');
  assert.ok(arts.length > 50);
  for (const [id, a] of arts) assert.ok(WESEN[wesenOf(a)], id);
  const kinds = new Set(['combat_win', 'parry', 'vision', 'hidden_clue', 'dialogue', 'clue', 'conclusion', 'fact_likely', 'fact_refuted', 'loot', 'trade', 'lock']);
  for (const w of Object.values(WESEN)) for (const k of Object.keys(w.kinds)) assert.ok(kinds.has(k), k);
  assert.equal(wesenOf(content.items.richterhammer), 'kampf');
  assert.equal(wesenOf(content.items.kupferkrone), 'wacht');
});

test('Tragezeit hebt die Bindung: Vertraut nach einem Spieltag, Vorteile stärker', () => {
  const s = neu();
  s.addItem('kupferkrone'); // +25 Leben
  const hp0 = s.calcMaxHp();
  assert.equal(s.launeStufe('kupferkrone').name, 'Fremd');
  spiele(s, DAY_SECONDS);
  assert.equal(s.launeStufe('kupferkrone').name, 'Vertraut');
  assert.equal(s.calcMaxHp() - hp0, Math.floor(25 * 1.25) - 25);
  assert.deepEqual(s.launeForderung('kupferkrone'), []);
  spiele(s, DAY_SECONDS * 2);
  assert.equal(s.launeStufe('kupferkrone').name, 'Gebunden');
  assert.equal(s.launeForderung('kupferkrone').length, 1);
});

test('Gebunden: unerfüllte Forderung bringt Groll, Erfüllen besänftigt', () => {
  const s = neu();
  s.addItem('richterhammer'); // Blutdurst: 1 Sieg je Spieltag
  const atk = () => s.passive('atk');
  spiele(s, DAY_SECONDS * 3); // jetzt Gebunden
  assert.equal(s.launeStufe('richterhammer').stufe, 2);
  assert.equal(atk(), 6); // 4 × 1,5
  // Einen ganzen Spieltag ohne Sieg
  spiele(s, DAY_SECONDS);
  spiele(s, 60);
  assert.equal(s.launeEintrag('richterhammer').groll, 1);
  assert.equal(atk(), 3); // 4 × 1,5 × 0,5
  assert.ok(s.artifactUnruhe() >= 0.1);
  // Noch zwei Tage → Groll 3 (und inzwischen Verwachsen): keine Vorteile, Flüche ×2 × 1,25
  spiele(s, DAY_SECONDS * 2);
  assert.equal(s.launeEintrag('richterhammer').groll, 3);
  assert.equal(atk(), 0);
  assert.equal(s.passive('max_nerves'), -50);
  // Verwachsen will zwei Siege; dann besänftigt es sich sofort um eine Stufe
  s.act('combat_win');
  assert.equal(s.launeEintrag('richterhammer').groll, 3);
  s.act('combat_win');
  assert.equal(s.launeEintrag('richterhammer').groll, 2);
  assert.ok(s.launeErfuellt('richterhammer'));
  s.act('combat_win'); // satt ist satt: nur einmal je Tag
  assert.equal(s.launeEintrag('richterhammer').groll, 2);
});

test('Verwachsen: doppelte Forderung plus Pfad-Grundsatz, Flüche schwerer', () => {
  const s = neu();
  s.pathway = { id: 'eisen', seq: 7, digestion: 0 };
  const atk0 = s.passive('atk');
  const nerv0 = s.passive('max_nerves');
  s.addItem('richterhammer');
  spiele(s, DAY_SECONDS * 6);
  assert.equal(s.launeStufe('richterhammer').name, 'Verwachsen');
  s.launeEintrag('richterhammer').groll = 0; // Groll der Tage ohne Sieg vergessen
  const f = s.launeForderung('richterhammer');
  assert.equal(f.length, 2);
  assert.equal(f[0].need, 2);
  assert.equal(f[1].art, 'pfad');
  assert.equal(s.passive('atk') - atk0, 8);
  assert.equal(s.passive('max_nerves') - nerv0, -25);
  s.act('combat_win');
  assert.equal(s.launeErfuellt('richterhammer'), false);
  s.act('combat_win'); // Eisen: Kampfsieg ist auch der Grundsatz
  assert.equal(s.launeErfuellt('richterhammer'), true);
});

test('Ein halber Tag reicht nicht für Groll; Einlagern hält die Bindung, Hergeben reißt sie', () => {
  const s = neu();
  s.addItem('richterhammer');
  spiele(s, DAY_SECONDS * 3);
  const t = s.launeEintrag('richterhammer').t;
  // nach Tageswechsel nur kurz dabei
  s.playTime = Math.ceil(s.playTime / DAY_SECONDS) * DAY_SECONDS + 10;
  s.launeTick(0);
  s.inventory.richterhammer = 0; // wie eingelagert: keine Tragezeit
  s.playTime += DAY_SECONDS;
  s.launeTick(1);
  assert.equal(s.launeEintrag('richterhammer').groll, 0);
  assert.ok(s.launeEintrag('richterhammer').t <= t + 20);
  s.inventory.richterhammer = 1;
  s.launeVergessen('richterhammer');
  assert.equal(s.launeEintrag('richterhammer'), null);
  assert.equal(s.launeStufe('richterhammer').name, 'Fremd');
});

test('Wegwerfen löst die Bindung über dropArtifactIfGone', () => {
  const s = neu();
  s.addItem('kupferkrone');
  spiele(s, DAY_SECONDS);
  assert.ok(s.launeEintrag('kupferkrone'));
  s.removeItem('kupferkrone');
  assert.equal(s.launeEintrag('kupferkrone'), null);
});

test('Koop: gemeinsame Siege zählen für beide, Paraden nur für den, der pariert', () => {
  const s = neu();
  s.addP2();
  s.addItem('richterhammer');
  s.withPlayer(2, () => { s.addItem('gluehglocke'); s.addItem('perlenpaar'); }, { quiet: true });
  const tick = (sek) => { for (let t = 0; t < sek; t += 60) { s.playTime += 60; s.launeTick(60); s.tickParty(60); } };
  tick(DAY_SECONDS * 3);
  s.withPlayer(2, () => assert.equal(s.launeStufe('gluehglocke').stufe, 2), { quiet: true });
  s.act('combat_win');
  assert.ok(s.launeErfuellt('richterhammer'));
  s.withPlayer(2, () => assert.ok(s.launeErfuellt('gluehglocke')), { quiet: true }); // Blutdurst auch bei Spieler 2
  s.act('parry', 3); // Spieler 1 pariert: zählt nicht für Spieler 2
  s.withPlayer(2, () => assert.equal(s.launeErfuellt('perlenpaar'), false), { quiet: true });
  s.withPlayer(2, () => s.act('parry', 3), { quiet: true });
  s.withPlayer(2, () => assert.ok(s.launeErfuellt('perlenpaar')), { quiet: true });
  assert.equal(s.launeEintrag('perlenpaar'), null); // Spieler 1 hat keine Bindung dazu
});

test('Speichern und Laden behält Bindung und Groll beider Spieler', () => {
  const s = neu();
  s.addP2();
  s.addItem('richterhammer');
  s.withPlayer(2, () => s.addItem('kupferkrone'), { quiet: true });
  for (let t = 0; t < DAY_SECONDS * 5; t += 60) { s.playTime += 60; s.launeTick(60); s.tickParty(60); }
  const g1 = s.launeEintrag('richterhammer').groll;
  assert.ok(g1 > 0);
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const s2 = new GameState(content);
  s2.load(data);
  assert.equal(s2.launeEintrag('richterhammer').groll, g1);
  assert.equal(s2.launeStufe('richterhammer').stufe, 2);
  s2.withPlayer(2, () => assert.equal(s2.launeStufe('kupferkrone').stufe, 2), { quiet: true });
  // alte Stände ohne Bindungen laden ohne Fehler
  delete data.launen;
  const s3 = new GameState(content);
  s3.load(data);
  assert.equal(s3.launeStufe('richterhammer').stufe, 0);
});

test('Skalieren: Konzentration bleibt, Multiplikatoren um 1, Flüche nie absurd', () => {
  assert.equal(launeScale({ key: 'ap_max', value: 1 }, 2).value, 1);
  assert.equal(launeScale({ key: 'damage_taken', value: 0.8 }, 2).value, 0.6);
  assert.equal(launeScale({ key: 'damage_taken', value: 0.7 }, 2).value, 0.5); // Untergrenze
  assert.equal(launeScale({ key: 'heal_bonus', value: 0.6 }, 2, true).value, 0.2);
  assert.equal(launeScale({ key: 'heal_bonus', value: 0.3 }, 2, true).value, 0.05);
  assert.equal(launeScale({ key: 'no_flee', value: true }, 2, true).value, true);
  assert.equal(launeScale({ key: 'atk', value: 4 }, 0), null);
});

test('Englisch: alle neuen Texte stehen im Wörterbuch', () => {
  const dict = {};
  for (const f of fs.readdirSync('src/i18n/en').filter((x) => x.endsWith('.json'))) Object.assign(dict, JSON.parse(fs.readFileSync(`src/i18n/en/${f}`, 'utf8')));
  setDict(dict);
  const texte = [
    ...LAUNE_STUFEN.flatMap((s) => [s.name, s.text, `Bindung: ${s.name}`]),
    ...GROLL_STUFEN.flatMap((g) => [g.name, `Groll: ${g.name}`]),
    ...Object.values(STUFE_MELDUNG), ...Object.values(GROLL_MELDUNG), ...Object.values(GROLL_WIRKUNG),
    SATT_MELDUNG, BESAENFTIGT_MELDUNG, RISS_MELDUNG,
    ...Object.values(WESEN).flatMap((w) => [w.name, w.text, `Wesen: ${w.name}`, `Heute: 1/3 ${w.will}`, `Heute: 1/3 ${w.will} ✓`]),
    'Pfad: 0/1 Tat nach deinem Grundsatz', 'Pfad: 1/1 Tat nach deinem Grundsatz ✓',
    'noch 2,5 Spieltage bis Gebunden', 'noch 1 Spieltage bis Vertraut', 'noch 3 Spieltage bis Verwachsen',
    'Vorteile ×1,5', 'Vorteile ruhen', 'Flüche ×1,25',
    'Lange getragene Artefakte binden sich an dich: Sie werden stärker, wollen ab „Gebunden“ aber jeden Spieltag etwas und grollen, wenn sie es nicht bekommen.',
  ];
  for (const t of texte) assert.ok(lookup(t), `fehlt: ${t}`);
});
