// Tag-Nacht- und Wetterzyklus, Schlafen, Nebelnächte, Träume (core/Wetter.js, Seb 2026-11-26)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { DAY_NIGHT_SECONDS, VOLATILE_FLAGS } from '../src/core/Clock.js';
import { WETTER, WETTER_ARTEN, wetterAt, nebelnachtAt, phaseAt, uhrzeitAt, traumStufe, NEBELNACHT, NAP_COOLDOWN } from '../src/core/Wetter.js';
import { NEBEL_MAERKTE, nebelMerchant } from '../src/data/nebelnacht.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const N = DAY_NIGHT_SECONDS;
const ersteNebelnacht = () => { for (let p = 1; p < 400; p += 2) if (nebelnachtAt(p * N + 1)) return p; return null; };

test('Wetter: fest je Stadt und Tageshälfte, passend zu Stadt und Jahreszeit; Frost nur im Winter', () => {
  for (const city of ['kettlegate', 'wexmoor', 'dunscar']) {
    const seen = new Set();
    for (let p = 0; p < 400; p++) {
      const w = wetterAt(p * N + 5, city);
      assert.ok(WETTER_ARTEN.includes(w));
      assert.equal(w, wetterAt(p * N + N - 1, city), 'eine Tageshälfte, ein Wetter');
      if (w === 'frost') assert.equal(Math.floor(p / 12) % 4, 1, 'Frost nur im Winter');
      seen.add(w);
    }
    assert.ok(seen.size >= 4, `${city}: abwechslungsreich (${[...seen]})`);
  }
  assert.equal(wetterAt(5 * N + 3, 'himmel'), 'klar');
});

test('Uhr: Tag 6 bis 18 Uhr, Nacht 18 bis 6 Uhr', () => {
  assert.deepEqual(uhrzeitAt(0), { h: 6, m: 0 });
  assert.deepEqual(uhrzeitAt(N / 2), { h: 12, m: 0 });
  assert.deepEqual(uhrzeitAt(N), { h: 18, m: 0 });
  assert.deepEqual(uhrzeitAt(N * 1.5), { h: 0, m: 0 });
  assert.deepEqual(uhrzeitAt(2 * N), { h: 6, m: 0 });
});

test('Nebelnacht: selten, nie in den ersten Nächten, setzt flüchtige Flags; Nebelkrämerin nur dann sichtbar', () => {
  let count = 0;
  for (let p = 1; p < 600; p += 2) if (nebelnachtAt(p * N + 1)) count++;
  assert.ok(count > 20 && count < 100, `etwa jede sechste Nacht (${count} von 300)`);
  assert.ok(!nebelnachtAt(N + 1) && !nebelnachtAt(3 * N + 1), 'die ersten Nächte bleiben ruhig');
  const p = ersteNebelnacht();
  const s = new GameState(content);
  s.playTime = p * N + 10;
  s.tick(0);
  assert.ok(s.flags.has('nebelnacht') && s.flags.has('wetter_nebel'));
  assert.ok(VOLATILE_FLAGS('nebelnacht') && VOLATILE_FLAGS('wetter_regen'));
  assert.ok(!s.serialize().flags.some((f) => f === 'nebelnacht' || f.startsWith('wetter_')));
  s.playTime = (p + 1) * N + 10;
  s.tick(0);
  assert.ok(!s.flags.has('nebelnacht'));
  for (const [city, def] of Object.entries(NEBEL_MAERKTE)) {
    const m = content.market.merchants[nebelMerchant(city)];
    assert.ok(m?.nebel && m.stock.length >= 3, city);
    const placed = def.maps.filter((id) => content.maps[id]).some((id) => content.maps[id].npcs.some((n) => n.id === 'nebel_kraemerin' && n.visible_if?.requires_flags?.includes('nebelnacht')));
    assert.ok(placed, `${city}: Krämerin auf dem Markt`);
  }
  s.playTime = p * N + 10;
  const a = s.merchantStock(nebelMerchant('wexmoor'));
  assert.equal(a.length, 3);
  s.playTime = p * N + 800;
  assert.deepEqual(s.merchantStock(nebelMerchant('wexmoor')), a, 'die ganze Nacht dasselbe Angebot');
});

test('Schlafen: nachts einmal je Nacht, tagsüber Nickerchen mit Abklingzeit, Spielstand merkt es sich', () => {
  const s = new GameState(content);
  s.playTime = 10;
  assert.equal(s.schlafStatus().kind, 'nickerchen');
  s.schlafMerken('nickerchen');
  assert.equal(s.schlafStatus().kind, null);
  assert.match(s.schlafStatus().text, /nicht müde/);
  s.playTime = 10 + NAP_COOLDOWN - 1;
  assert.equal(s.schlafStatus().kind, 'nacht', 'nachts geht Schlafen trotz Nickerchen');
  s.schlafMerken('nacht');
  assert.equal(s.schlafStatus().kind, null);
  assert.match(s.schlafStatus().text, /schon geschlafen/);
  const t = new GameState(content);
  t.load(s.serialize());
  t.playTime = s.playTime;
  assert.equal(t.schlafStatus().kind, null, 'nach dem Laden nicht erneut');
  t.playTime = 3 * N + 5;
  assert.equal(t.schlafStatus().kind, 'nacht', 'nächste Nacht wieder');
  // Alte Stände ohne Schlafdaten dürfen sofort schlafen
  const old = s.serialize(); delete old.schlaf;
  const u = new GameState(content); u.load(old); u.playTime = 20;
  assert.equal(u.schlafStatus().kind, 'nickerchen');
  // Testmodus: Bett immer frei
  s.testmodus = true;
  assert.ok(s.schlafStatus().kind);
});

test('Träume: höchstens einer je Nacht, Fall-Hinweis oder Pfadwesen; gefährlicher mit höherer Sequenz', () => {
  assert.equal(traumStufe(9).risk, 0);
  assert.ok(traumStufe(5).risk > 0 && traumStufe(3).hp > 0 && traumStufe(1).risk > traumStufe(4).risk);
  const s = new GameState(content);
  s.playTime = N + 5;
  const r = s.traeumen({ hint: 'Sprich mit der Wäscherin.', rng: () => 0.1 });
  assert.equal(r.kind, 'fall');
  assert.match(r.text, /Wäscherin/);
  assert.equal(s.traeumen({ rng: () => 0.1 }), null, 'zweiter Traum in derselben Nacht');
  s.playTime = 3 * N + 5;
  s.pathway = { id: 'laterne', seq: 3, digestion: 0 };
  s.unruhe = 0;
  const hp = s.hp;
  const d = s.traeumen({ rng: () => 0.1 });
  assert.equal(d.kind, 'albtraum');
  assert.ok(s.hp < hp && s.unruhe > 0);
  assert.ok(s.activeBuffs().some((b) => b.source === 'traum' && b.key === 'dmg_mult'));
  s.playTime = 4 * N + 5;
  assert.equal(s.traeumen({ rng: () => 0.1 }), null, 'tagsüber kein Traum');
});

test('Kampf: Wetter wirkt draußen, Nebelnacht stärkt Gegner, Übungen bleiben unberührt', () => {
  const s = new GameState(content);
  const outdoorEnc = Object.entries(content.encounters).find(([id, e]) => !e.practice && !e.boss && e.zone && content.zones?.[e.zone] && Object.values(content.maps).some((m) => m.id === e.zone));
  const encId = outdoorEnc?.[0] ?? Object.keys(content.encounters).find((id) => !content.encounters[id].practice);
  const p = ersteNebelnacht();
  s.playTime = (p - 1) * N + 5; // Tag vor der Nebelnacht
  const plain = new Combat(s, encId);
  s.playTime = p * N + 5;
  const foggy = new Combat(s, encId);
  assert.ok(foggy.wetter?.nebelnacht);
  assert.ok(foggy.enemy.maxHp > plain.enemy.maxHp, 'Nebelnacht: mehr Leben');
  assert.ok(foggy.wetterFoeMult() >= NEBELNACHT.dmg);
  assert.match(foggy.wetterText(), /Nebelnacht/);
  const practice = Object.keys(content.encounters).find((id) => content.encounters[id].practice);
  if (practice) assert.equal(new Combat(s, practice).wetter, null);
  // Regen dämpft Brand, Sturm stärkt das Moor
  const c = new Combat(s, encId);
  c.wetter = { art: 'sturm', def: WETTER.sturm, nebelnacht: false };
  s.pathway = { id: 'sq_moor', seq: 6, digestion: 0 };
  assert.equal(c.wetterSkillMult(), 1.25);
  c.wetter = { art: 'regen', def: WETTER.regen, nebelnacht: false };
  assert.equal(c.wetter.def.burn, 0.6);
});

test('Wetterphase zählt jede Tag- und Nachthälfte', () => {
  assert.equal(phaseAt(0), 0);
  assert.equal(phaseAt(N), 1);
  assert.equal(phaseAt(2 * N + 1), 2);
});
