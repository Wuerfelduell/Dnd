import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { COMPANIONS } from '../src/core/Bonds.js';
import { DS_FIGURES, DS_ENEMIES, DS_MAP_MARKERS_URL, SHEETS, PORTRAITS, BATTLE_SHEETS, ENCOUNTER_SHEETS, OVERWORLD_SHEETS, bestiaryUrl, mapMarkerOf, CHAPTER_CARDS } from '../src/world/assets.js';
import { loadContent, fight, talk, use, EXPERT, SKILLED } from './helpers.js';

// Kapitel 3 „Der letzte Zug nach Dunscar“ (Codex AR Akte, AS Orte/Gegner, AV/AW/AX Grafik)
const content = loadContent();
const pub = (url) => new URL(`../public/${url.replace(/^\.?\//, '')}`, import.meta.url);
const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const DS_MAPS = Object.keys(content.maps).filter((id) => id.startsWith('ds_'));

test('Kapitel 3: 18 Dunscarer Karten, eigene Stadtkarte mit Pins und Markern', () => {
  assert.equal(DS_MAPS.length, 18);
  const city = content.travelRules.cities.dunscar;
  assert.ok(city, 'Stadt Dunscar');
  assert.ok(existsSync(sprite(city.map_image)) && existsSync(sprite(city.fog_image)));
  assert.ok(existsSync(pub(DS_MAP_MARKERS_URL)));
  for (const id of Object.keys(city.pins)) {
    assert.ok(content.maps[id], id);
    assert.ok(mapMarkerOf(id)[0].includes(id.startsWith('treffen_') ? 'BE_schichtbund' : 'ds_marker'), id); // Zirkelpin (BC/BE) aus dem Schichtbund-Atlas
  }
  for (const id of ['ds_endbahnhof', 'ds_schwellenring', 'ds_arbeiterbogen']) assert.ok(content.travel.some((t) => t.map === id), id);
  assert.ok(CHAPTER_CARDS.includes('kapitel3_karte'));
});

test('Kapitel 3: jedes Reiseziel aus Dialogen und Türen hat Karte und Ankunftspunkt', () => {
  const targets = [];
  (function walk(v) {
    if (!v || typeof v !== 'object') return;
    if (typeof v.map === 'string' && typeof v.spawn === 'string') targets.push(v);
    for (const x of Object.values(v)) walk(x);
  })({ d: content.dialogues, m: DS_MAPS.map((id) => content.maps[id]) });
  for (const t of targets.filter((x) => x.map.startsWith('ds_'))) {
    const m = content.maps[t.map];
    assert.ok(m, t.map);
    assert.ok(m.spawns[t.spawn], `${t.map}/${t.spawn}`);
  }
  assert.deepEqual(content.maps.ds_endbahnhof.spawns.zug, [6, 4]);
});

test('Kapitel 3: Figuren, Gegner und Bosse haben ihre Grafiken', () => {
  for (const id of DS_FIGURES) {
    assert.ok(existsSync(sprite(SHEETS[`ds_${id}`])), id);
    assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
  }
  for (const id of Object.keys(DS_ENEMIES)) {
    assert.ok(content.encounters[id], id);
    assert.ok(existsSync(sprite(BATTLE_SHEETS[ENCOUNTER_SHEETS[id]][0])), id);
    assert.ok(existsSync(sprite(OVERWORLD_SHEETS[id][0])), id);
    assert.ok(existsSync(pub(bestiaryUrl(id))), id);
  }
});

test('Kapitel 3: Pfiff ist Begleiterin wie Zunder', () => {
  assert.ok(COMPANIONS.includes('k3_pfiff'));
  assert.ok(content.npcs.k3_pfiff);
});

const seq = (n) => {
  const s = new GameState(content);
  s.addItem('ossuarklinge');
  s.equip('ossuarklinge');
  s.pathway = { id: 'eisen', seq: n, digestion: 0 };
  s.updateMaxHp();
  s.addItem('tonikum', 4);
  s.addItem('verband', 2);
  s.heal(s.maxHp);
  return s;
};

test('Balance Kapitel 3: mit Sequenz 5 schaffen sehr Geübte jeden Gegner und jeden Bossabschnitt', () => {
  const ch3 = Object.entries(content.encounters).filter(([, e]) => e.chapter === 3);
  assert.ok(ch3.length >= 20);
  for (const [id, e] of ch3) {
    const tough = e.elite || e.boss || e.flees_after; // BD: wer sich nach drei Runden entzieht, verlangt den Doppelschlag
    const { result, combat } = fight(seq(5), id, { defend: EXPERT, skill: tough ? 'double' : 'attack', healBelow: 18 });
    assert.equal(result.outcome, 'won', `${id}: verloren in Runde ${combat.round}`);
  }
});

test('Balance Kapitel 3: mit Sequenz 6 reicht es nicht für Vielrufer und Unterschicht', () => {
  for (const id of ['vielrufer', 'unterschicht']) {
    const { result } = fight(seq(6), id, { defend: SKILLED, skill: 'double', healBelow: 18 });
    assert.equal(result.outcome, 'lost', id);
  }
});

test('Paket AT: zwölf Dunscarer Nebenaufträge mit Gerede, Bestiarium, Lesestücken und Kalkblatt', () => {
  const k3n = Object.keys(content.quests).filter((q) => q.startsWith('k3n_'));
  assert.equal(k3n.length, 12);
  // Zusatzoptionen hängen an den Startknoten der AR-Figuren
  for (const id of ['k3a_pfiff', 'k3a_mabel', 'k3a_oren', 'k3a_esther']) {
    const d = content.dialogues[id];
    assert.ok(d.nodes[d.start].choices.some((c) => c.next?.startsWith('k3n_')), id);
  }
  assert.ok(content.gossip.dunscar.ds_endbahnhof.length > 3);
  assert.ok(content.bestiaryTexts.schichtgaenger);
  assert.ok(content.maps.ds_endbahnhof.interactables.some((i) => i.id.startsWith('k3n_lese_')));
  assert.equal(content.newspapers.filter((n) => n.id.startsWith('k3n_') && n.zeitung === 'dunscarer_kalkblatt').length, 8);
});

test('Paket AT: der Wartungssteg verbindet Schwellenring und Bruchstufen erst nach der Drehscheibe', () => {
  const s = new GameState(content);
  for (const [from, to] of [['ds_schwellenring', 'ds_bruchstufen'], ['ds_bruchstufen', 'ds_schwellenring']]) {
    const door = content.maps[from].interactables.find((i) => i.to === to && i.id.startsWith('k3o_steg'));
    assert.ok(door, from);
    assert.ok(!s.meets(door.visible_if));
    assert.ok(content.maps[to].spawns[door.spawn], `${to}/${door.spawn}`);
  }
  s.flags.add('k3n_drehscheibe_offen');
  assert.ok(content.maps.ds_schwellenring.interactables.filter((i) => i.id.startsWith('k3o_steg')).every((d) => s.meets(d.visible_if)));
});

test('Paket AU: Hedda gibt die Prüfung nur dem eigenen Pfad ab Sequenz 5, die Zutat für Sequenz 4 einmal', () => {
  const s = seq(5);
  s.flags.add('k3a_akt2_done');
  assert.throws(() => talk(s, 'k3p_hedda', ['Über den Pfad Laterne', 'Prüfung an']), /keine verfügbare Option/);
  talk(s, 'k3p_hedda', ['Über den Pfad Eisen', 'Prüfung an']);
  assert.equal(s.quests.k3p_eisen_pruefung, 'active');
  use(s, 'ds_bruchstufen', 'k3p_eisen_spur_a');
  use(s, 'ds_bruchstufen', 'k3p_eisen_spur_b');
  talk(s, 'k3p_eisen_probe_dialog', ['leeren Steg']);
  assert.ok(s.flags.has('k3p_eisen_bewaeltigt'));
  talk(s, 'k3p_hedda', ['ist bewältigt']);
  assert.equal(s.itemCount('sq_zutat_eisen_4'), 1);
  assert.equal(s.quests.k3p_eisen_pruefung, 'done');
  assert.throws(() => talk(s, 'k3p_hedda', ['ist bewältigt']), /keine verfügbare Option/);
});

test('Balance Paket AU: jeder Prüfungsgegner ist mit Sequenz 5 schaffbar', () => {
  for (const id of Object.keys(content.encounters).filter((e) => e.startsWith('k3p_'))) {
    const { result, combat } = fight(seq(5), id, { defend: EXPERT, skill: 'double', healBelow: 18 });
    assert.equal(result.outcome, 'won', `${id}: verloren in Runde ${combat.round}`);
  }
});

test('Kapitel 3: das Kernfach des Vorhauers gibt nur die Zutat des eigenen Pfads, einmal', () => {
  const s = seq(4);
  const fach = content.maps.ds_klopfbruch.interactables.find((i) => i.id === 'k3o_vorhauer_beute');
  assert.equal(fach.kind, 'dialogue');
  assert.throws(() => talk(s, fach.dialogue, ['Kernzutat']), /keine verfügbare Option/);
  s.flags.add('k3o_vorhauer_geloest');
  talk(s, fach.dialogue, ['Kernzutat']);
  assert.equal(s.itemCount('sq_zutat_eisen_3'), 1);
  assert.throws(() => talk(s, fach.dialogue, ['Kernzutat']), /keine verfügbare Option/);
});

test('Epiloge (AP/AR): jedes Kapitel-2/3-Ende zeigt seine Szenen in Dateireihenfolge', () => {
  const ends = [...new Set(content.epiloge.map((e) => e.ending))].filter((id) => !/^(c9_|cwa_|bha_)/.test(id)); // Kapitel 1: tests/case9.test.js, Kapitel 4/5: tests/kapitel45.test.js
  assert.deepEqual(ends.sort(), ['k2_lichtmeister', 'k2_meer', 'k2_moor', 'k2_rein', 'k3_feierabend', 'k3_gegenstimme', 'k3_stilllegung', 'k3_vollzaehlig']);
  for (const id of ends) {
    const s = new GameState(content);
    assert.deepEqual(s.epilogue(id), [], `${id}: vor dem Ende keine Szenen`);
    s.setEnding(id);
    const scenes = s.epilogue(id);
    const slots = scenes.map((e) => e.title.split(' ·')[0]);
    assert.deepEqual(slots, [...new Set(slots)], `${id}: je Szenenplatz höchstens eine Variante`);
    assert.ok(scenes.length >= (id.startsWith('k3') ? 4 : 6), `${id}: ${scenes.length} Szenen`);
  }
  // bedingte Variante: Zunders Vertrauen ersetzt die Standardszene auf demselben Platz
  const s = new GameState(content);
  s.flags.add('k2v_zunder_vertraut');
  s.setEnding('k2_rein');
  assert.ok(s.epilogue('k2_rein').some((e) => e.requires_flags.includes('k2v_zunder_vertraut')));
});

test('AV: Dunscarer Karten nutzen die eigenen Tilesets', () => {
  for (const id of DS_MAPS) assert.match(content.maps[id].tiles, /^ds_/, id);
});

test('Rufladungen: Ruf kostet eine Ladung, Notladung einmal je Station, Pfiff füllt auf, Spielstand behält alles', () => {
  const s = new GameState(content);
  s.flags.add('k3o_rangierwueste_gelesen1');
  const station = content.dialogues.k3o_schwellenhund_station;
  const choice = (t) => station.nodes.k3o_start.choices.find((c) => c.text.startsWith(t));
  assert.ok(!s.meets(choice('Den falschen Anfahrpfiff')), 'ohne Gerät kein Ruf');
  s.addItem('k3a_signalgeraet');
  assert.equal(s.signal.charges, 3);
  assert.ok(!s.meets(choice('Die Notladung')), 'bei vollem Gerät bleibt die Notladung im Kasten');
  s.signal.charges = 1;
  talk(s, 'k3o_schwellenhund_station', ['Den falschen Anfahrpfiff']);
  assert.ok(s.flags.has('k3o_falscher_pfiff'));
  assert.equal(s.signal.charges, 0);
  // gleiche Lage an einer anderen Station: leer, dann einmalige Notladung
  s.flags.add('k3o_klopfbruch_gelesen1');
  assert.throws(() => talk(s, 'k3o_vorhauer_station', ['Die originale Rettungsfolge']), /keine verfügbare Option/);
  talk(s, 'k3o_vorhauer_station', ['Das Gerät ist leer']);
  talk(s, 'k3o_vorhauer_station', ['Die Notladung']);
  assert.equal(s.signal.charges, 1);
  assert.deepEqual(s.signal.reserveUsed, ['k3o_horch_vorhauer']);
  s.signal.charges = 0;
  const t = new GameState(content);
  assert.ok(t.load(JSON.parse(JSON.stringify(s.serialize()))));
  assert.deepEqual([t.signal.charges, t.signal.reserveUsed], [0, ['k3o_horch_vorhauer']], 'Reserve bleibt nach dem Laden verbraucht'); // BN hängt eigene Felder an signal
  assert.throws(() => talk(t, 'k3o_vorhauer_station', ['Die Notladung']), /keine verfügbare Option/);
  t.flags.add('k3a_speisewagen_sicher');
  talk(t, 'k3a_pfiff', ['Das Signalgerät füllen']);
  assert.equal(t.signal.charges, 3);
  assert.deepEqual(t.signal.reserveUsed, ['k3o_horch_vorhauer'], 'Pfiff setzt keine Reserven zurück');
});

test('Ab Kapitel 3: Gegnerleben-Untergrenze (zu zweit 1300 / 2200 / 5000), Wächter und Ausreißer ausgenommen', async () => {
  const { Combat, HP_FLOOR, DUO_HP_MULT } = await import('../src/core/Combat.js');
  assert.equal(Math.round(HP_FLOOR.normal * DUO_HP_MULT), 1300);
  assert.equal(Math.round(HP_FLOOR.elite * DUO_HP_MULT), 2200);
  assert.equal(Math.round(HP_FLOOR.boss * DUO_HP_MULT), 5000);
  const s = seq(5);
  assert.ok(new Combat(s, 'schichtgaenger').enemy.maxHp >= HP_FLOOR.normal);
  assert.ok(new Combat(s, 'nachhall_elite').enemy.maxHp >= HP_FLOOR.elite);
  assert.ok(new Combat(s, 'vorhauer').enemy.maxHp >= HP_FLOOR.boss);
  assert.ok(new Combat(s, 'k3k_schienenlaeufer').enemy.maxHp < HP_FLOOR.normal, 'Ausreißer bleibt flink');
});
