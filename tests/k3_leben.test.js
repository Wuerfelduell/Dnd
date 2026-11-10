// Kapitel 3 (BD): Leben in Dunscar. Einwohner mit Tag-/Nachtplatz, Kopfgeld-Ziele als Stadtgegner, zivile Aufseher,
// Gegner, die sich nach drei Runden entziehen, Zeitung, Gerede, Wetter und Tiere.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { DAY_NIGHT_SECONDS, NIGHT_FLAG } from '../src/core/Clock.js';
import { AUFSICHT } from '../src/core/Aufsicht.js';
import { BD_FIGURES, K3K_ENEMIES, CHARACTER_SHEETS, SHEETS, BATTLE_SHEETS, OVERWORLD_SHEETS, headUrl, itemIconUrl, wantedUrl, bestiaryUrl, ANIM_SHEETS } from '../src/world/assets.js';
import { loadContent, fight, EXPERT } from './helpers.js';

const content = loadContent();
const pub = (url) => new URL(`../public/${url.replace(/^\.\//, '')}`, import.meta.url);
const RESIDENTS = ['k3e_schichtwitwe', 'k3e_kalkjunge', 'k3e_wagenputzer', 'k3e_zeitungsfrau', 'k3e_bahnbettler', 'k3e_steinmetzgeselle', 'k3e_teesaalgast', 'k3e_signalkind'];
const DS_MAPS = Object.values(content.maps).filter((m) => m.id.startsWith('ds_'));

/** In Dunscar angekommen, wahlweise mit abgeschlossenen Akten oder einem Ende. */
function arrived({ act = 1, end = null, night = false } = {}) {
  const s = new GameState(content);
  s.flags.add('k3_arrived');
  for (let i = 1; i < act; i++) s.flags.add(`k3a_akt${i}_done`);
  if (end) ['kapitel3_done', 'k3a_akt5_done', `k3a_end_${end}`].forEach((f) => s.flags.add(f));
  if (night) s.tickGatherings(DAY_NIGHT_SECONDS + 1);
  return s;
}
/** Sichtbare Standorte einer Figur auf den Dunscarer Karten. */
const places = (s, id) => DS_MAPS.flatMap((m) => (m.npcs ?? []).filter((n) => n.id === id && s.meets(n.visible_if)).map((n) => `${m.id}:${n.tile}`));

test('Einwohner: tags genau ein Platz je Figur, nachts je nach Akt zu Hause, bei der Schicht oder abwesend', () => {
  for (const act of [1, 2, 3, 4, 5]) {
    const day = arrived({ act });
    for (const id of RESIDENTS) assert.equal(places(day, id).length, 1, `${id} tags in Akt ${act}`);
    const night = arrived({ act, night: true });
    assert.ok(night.flags.has(NIGHT_FLAG));
    for (const id of RESIDENTS) {
      const n = places(night, id).length;
      if (act >= 4 && ['k3e_wagenputzer', 'k3e_steinmetzgeselle'].includes(id)) assert.equal(n, 0, `${id} ist nachts in Akt ${act} in der Schicht`);
      else assert.ok(n <= 1, `${id} nachts in Akt ${act}: ${n}`);
    }
  }
  // Vollzählig: nachts alle fort; Feierabend: alle acht wieder da
  for (const id of RESIDENTS) assert.equal(places(arrived({ act: 5, end: 'vollzaehlig', night: true }), id).length, 0, id);
  assert.equal(RESIDENTS.filter((id) => places(arrived({ act: 5, end: 'feierabend', night: true }), id).length === 1).length, 8);
  // Die Tagesvorschläge aus platzierung.json stehen nicht zusätzlich auf den Karten
});

test('Schichtgänger: ab Akt IV nachts zwei lebende Nachtschichten mit der Figur des Einwohners, nach dem Ende keine', () => {
  const shifts = (s) => DS_MAPS.flatMap((m) => (m.roamers ?? []).filter((r) => r.encounter === 'schichtgaenger' && r.figur && s.meets(r.visible_if)));
  assert.equal(shifts(arrived({ act: 4, night: true })).length, 2);
  assert.equal(shifts(arrived({ act: 4 })).length, 0, 'tags nicht');
  assert.equal(shifts(arrived({ act: 3, night: true })).length, 0);
  assert.equal(shifts(arrived({ act: 5, end: 'feierabend', night: true })).length, 0);
  for (const r of shifts(arrived({ act: 4, night: true }))) assert.ok(CHARACTER_SHEETS[`npc_${r.figur}`] && existsSync(pub(`sprites/${SHEETS[CHARACTER_SHEETS[`npc_${r.figur}`]]}`)), r.figur);
});

test('Kopfgeld: sechs Ziele als Stadtgegner mit Dunscarer Niederlagenregel, Brett im Lohnbüro, Steckbriefe und Trophäen', () => {
  for (const id of K3K_ENEMIES) {
    const e = content.encounters[id];
    assert.ok(e?.city && e.chapter === 3, id);
    assert.deepEqual(e.lose_to, { map: 'ds_speisewagen', spawn: 'default' });
    assert.equal(e.lose_money, 0.05);
    assert.ok(content.loot[id] && !content.loot[id].repeat, `${id}: Beute nur einmal`);
    assert.ok(content.quests[`kopfgeld_ds_${id.slice(4)}`], id);
    assert.ok(existsSync(pub(`sprites/${BATTLE_SHEETS[`enemy_${id}`][0]}`)) && existsSync(pub(`sprites/${OVERWORLD_SHEETS[id][0]}`)), id);
    assert.ok(existsSync(pub(bestiaryUrl(id))) && existsSync(pub(wantedUrl(id))), id);
    assert.ok(existsSync(pub(itemIconUrl(`${id}_trophaee`))), `${id}: Trophäe`);
  }
  assert.ok(content.encounters.k3k_staubschmuggler_elite?.elite, 'Elite aus dem Dunscar-Ausschnitt');
  assert.equal(content.encounters.k3k_staubschmuggler_elite.hp, Math.round(content.encounters.k3k_staubschmuggler.hp * 1.35));
  assert.ok(content.maps.ds_lohnbuero.interactables.some((i) => i.id === 'kopfgeldbrett_ds'));
  assert.ok(content.encounters.k3k_signalbrecher_phase2, 'zweiter Abschnitt des Signalbrechers');
  // Kettlegates Regeln bleiben
  assert.deepEqual(content.encounters.kanalschmuggler.lose_to, { map: 'revier', spawn: 'default' });
});

test('Schienenläufer: entzieht sich nach drei Runden ohne Sieg, Trophäe oder Fortschritt; mit Doppelschlag schafft man ihn', () => {
  const s = arrived({ act: 2 });
  s.addItem('ossuarklinge');
  s.equip('ossuarklinge');
  s.pathway = { id: 'eisen', seq: 7, digestion: 0 };
  s.updateMaxHp();
  s.heal(s.maxHp);
  const slow = fight(s, 'k3k_schienenlaeufer', { defend: EXPERT, skill: 'attack' });
  assert.equal(slow.result.outcome, 'escaped');
  assert.equal(slow.combat.round, 4);
  assert.ok(!s.flags.has('won_kopfgeld_ds_schienenlaeufer') && !s.flags.has('won_k3k_schienenlaeufer'));
  assert.equal(s.itemCount('k3k_schienenlaeufer_trophaee'), 0);
  assert.equal(slow.result.loot, null);
  assert.ok(slow.result.text.includes('Schienenläufer'));
  const t = arrived({ act: 2 });
  t.addItem('ossuarklinge');
  t.equip('ossuarklinge');
  t.pathway = { id: 'eisen', seq: 5, digestion: 0 };
  t.updateMaxHp();
  t.heal(t.maxHp);
  const fast = fight(t, 'k3k_schienenlaeufer', { defend: EXPERT, skill: 'double' });
  assert.equal(fast.result.outcome, 'won');
  assert.ok(fast.combat.round <= 3);
  assert.equal(t.itemCount('k3k_schienenlaeufer_trophaee'), 1);
  // Wer rechtzeitig siegt, bekommt den Sieg; ein Gegner ohne Frist kennt kein Entziehen
  const c = new Combat(arrived(), 'k3k_kupferdieb');
  for (let i = 0; i < 6; i++) c.endRound();
  assert.equal(c.outcome, null);
});

test('Aufseher: nachts je einer am Endbahnhof und am Signalhang, zivil, Bahnkarte oder Marke befreit', () => {
  const patrols = DS_MAPS.flatMap((m) => (m.patrols ?? []).map((p) => ({ ...p, map: m.id })));
  assert.equal(patrols.length, 2);
  for (const p of patrols) {
    assert.equal(p.kind, 'aufsicht');
    assert.ok(['ds_endbahnhof', 'ds_signalhang'].includes(p.map));
    assert.ok(arrived({ night: true }).meets(p.visible_if), `${p.id} nachts`);
    assert.ok(!arrived().meets(p.visible_if), `${p.id} tags nicht`);
    assert.ok(!content.maps[p.map].police, 'keine Polizei in Dunscar');
  }
  assert.deepEqual(AUFSICHT.passes, ['k3a_bahnkarte', 'k3a_aufsichtsmarke']);
  assert.deepEqual(AUFSICHT.to, { map: 'ds_speisewagen', spawn: 'default' });
  assert.equal(AUFSICHT.nerves, -5);
  for (const id of AUFSICHT.figures) assert.ok(content.npcs[id] && existsSync(pub(`sprites/${SHEETS[CHARACTER_SHEETS[`npc_${id}`]]}`)), id);
  for (const id of ['k3a_bahnkarte', 'k3a_aufsichtsmarke']) assert.ok(content.items[id], id);
});

test('Zeitung, Gerede, Wetter, Tiere und Stände sind im Spiel', () => {
  const k3e = content.newspapers.filter((n) => /^(k3e_blatt_|k3e_anzeige_|k3k_blatt_)/.test(n.id));
  assert.equal(k3e.length, 26);
  assert.ok(k3e.every((n) => n.zeitung === 'dunscarer_kalkblatt' && Array.isArray(n.kurz)));
  assert.equal(k3e.filter((n) => n.title.startsWith('Anzeige:')).length, 6);
  const lines = Object.values(content.gossip.dunscar).flat().filter((g) => g.requires_flags?.some((f) => f.startsWith('k3')) || g.hide_if_flags?.includes('kapitel3_done'));
  assert.ok(lines.length >= 80);
  for (const m of DS_MAPS) {
    assert.ok(m.leben, `${m.id}: Wetter/Tiere`);
    for (const w of m.leben.weather) assert.ok(['kalkstaub', 'wind', 'nachtnebel'].includes(w), w);
  }
  assert.deepEqual(content.maps.ds_unterschicht.leben, { weather: ['nachtnebel'], animals: {} });
  assert.equal(content.maps.ds_bruchstufen.leben.animals.ds_kalkziege, 3);
  assert.ok(existsSync(pub('sprites/fx/BA_dunscar_tiere.png')) && existsSync(pub('sprites/fx/BA_dunscar_wetter.png')));
  const stands = DS_MAPS.flatMap((m) => m.interactables.filter((i) => i.id.startsWith('k3e_stand_')));
  assert.equal(stands.length, 10);
  for (const st of stands) assert.ok(st.kind === 'read' && st.sprite === 'BA_staende' && Number.isInteger(st.frame), st.id);
  assert.ok(existsSync(pub(`sprites/${ANIM_SHEETS.BA_staende[0]}`)));
});

test('BE/BA: Einwohner, Aufseher und Ruth Bellwick haben Lauf-Sheet und Kopf', () => {
  for (const id of [...BD_FIGURES, 'k3n_secondhaendler']) {
    assert.ok(content.npcs[id], id);
    assert.ok(existsSync(pub(`sprites/${SHEETS[CHARACTER_SHEETS[`npc_${id}`]]}`)), id);
    assert.ok(headUrl(id) && existsSync(pub(headUrl(id))), id);
  }
  for (let i = 1; i <= 9; i++) assert.ok(existsSync(pub(itemIconUrl(`k3e_ausgabe_${i}`))));
});
