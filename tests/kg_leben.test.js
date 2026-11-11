// Paket CN: Kettlegate lebt. Zehn Einwohner mit Tag-/Nachtplatz, acht Stände als Gespräch, sechs Zufallsereignisse mit zwei Spuren,
// Gerede, Nebelbote, Koop-Geplauder, Wetter und Tiere je Karte, Fahndungs- und Saisonregeln aus offene_punkte.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { DAY_NIGHT_SECONDS, NIGHT_FLAG, SEASON_SECONDS } from '../src/core/Clock.js';
import { NEWSPAPERS } from '../src/data/lore.js';
import { KGL_FIGURES, KGL_FILES, KGL_TIERE, KGL_WETTER, KGL_STAENDE, KGL_NACHT, CHARACTER_SHEETS, SHEETS, ANIM_SHEETS, headUrl } from '../src/world/assets.js';
import { loadContent, talk } from './helpers.js';

const content = loadContent();
const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const pub = (url) => new URL(`../public/${url.replace(/^\.\//, '')}`, import.meta.url);
const manifest = JSON.parse(readFileSync(sprite('manifest-kettlegate-leben.json'), 'utf8'));
const KG_MAPS = Object.values(content.maps).filter((m) => !m.city || m.city === 'kettlegate');
const STANDS = ['kgl_s_kastanien', 'kgl_s_zeitung', 'kgl_s_heisswasser', 'kgl_s_streichholz', 'kgl_s_drehorgel', 'kgl_s_schleifer', 'kgl_s_austern', 'kgl_s_oel'];
const EVENTS = ['kgl_ev_droschke', 'kgl_ev_brand', 'kgl_ev_tasche', 'kgl_ev_prediger', 'kgl_ev_kreide', 'kgl_ev_brief'];
const objects = (id) => KG_MAPS.flatMap((m) => (m.interactables ?? []).filter((i) => i.id === id).map((i) => ({ map: m.id, ...i })));

function at({ night = false, season = null } = {}) {
  const s = new GameState(content);
  if (season) s.playTime = ['herbst', 'winter', 'fruehling', 'sommer'].indexOf(season) * SEASON_SECONDS + 1;
  if (night) s.tickGatherings(DAY_NIGHT_SECONDS + 1);
  return s;
}
const places = (s, id) => KG_MAPS.flatMap((m) => (m.npcs ?? []).filter((n) => n.id === id && s.meets(n.visible_if)).map((n) => `${m.id}:${n.tile}`));

test('Einwohner: zehn Figuren mit Sheet, Kopf und Pose; tags und nachts genau ein Platz, nie derselbe', () => {
  assert.equal(KGL_FIGURES.length, 10);
  for (const id of KGL_FIGURES) {
    assert.ok(content.npcs[id], id);
    assert.ok(content.dialogues[id], `${id}: Gespräch`);
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), `${id}: Lauf-Sheet`);
    assert.ok(existsSync(pub(headUrl(id))), `${id}: Kopf`);
    assert.ok(existsSync(sprite(ANIM_SHEETS[`pose_${id}`][0])), `${id}: Pose`);
    const day = places(at(), id);
    const night = places(at({ night: true }), id);
    assert.equal(day.length, 1, `${id} tags`);
    assert.equal(night.length, 1, `${id} nachts`);
    assert.notEqual(day[0], night[0], id);
  }
  assert.ok(at({ night: true }).flags.has(NIGHT_FLAG));
});

test('Einwohner: drei Begrüßungen nach Ansehen, Fallreaktionen nach Fallabschluss, Fahndungsknoten ab Stufe 2 an jeder Figur', () => {
  const tree = content.dialogues.kgl_e_laternenanzuender;
  const s = at();
  assert.equal(s.pick(tree.start), 'kgl_gruss_niedrig');
  s.honor = 25;
  assert.equal(s.pick(tree.start), 'kgl_gruss_mittel');
  s.honor = 60;
  assert.equal(s.pick(tree.start), 'kgl_gruss_hoch');
  const open = () => tree.nodes[s.pick(tree.start)].choices.filter((c) => s.meets(c));
  assert.ok(!open().some((c) => /Hafenakte/.test(c.text)));
  s.flags.add('case_03_closed');
  assert.ok(open().some((c) => /Hafenakte/.test(c.text)));
  for (const id of KGL_FIGURES) {
    assert.ok(content.dialogues[id].nodes.kgl_fahndung, `${id}: kgl_fahndung`);
    for (const n of KG_MAPS.flatMap((m) => (m.npcs ?? []).filter((x) => x.id === id))) assert.deepEqual(n.fahndung, { min: 2, node: 'kgl_fahndung' }, `${id}: Fahndung`);
  }
});

test('Stände: acht Gespräche statt Handel, Standbild aus dem Atlas, geschlossen bei Fahndung, Kastanien nur Herbst und Winter', () => {
  for (const id of STANDS) {
    const [o, ...more] = objects(id);
    assert.ok(o && !more.length, id);
    assert.equal(o.kind, 'dialogue');
    assert.equal(o.dialogue, id);
    assert.ok(KGL_STAENDE[o.stand], `${id}: Standbild ${o.stand}`);
    assert.deepEqual(o.fahndung, { min: 2, node: 'kgl_geschlossen' });
    assert.ok(content.dialogues[id].nodes.kgl_geschlossen, `${id}: kgl_geschlossen`);
    assert.ok(!content.merchants?.[id], `${id}: kein Händler`);
  }
  const kastanien = objects('kgl_s_kastanien')[0];
  assert.equal(kastanien.map, 'altmarkt');
  assert.ok(at({ season: 'herbst' }).meets(kastanien.visible_if));
  assert.ok(at({ season: 'winter' }).meets(kastanien.visible_if));
  assert.ok(!at({ season: 'fruehling' }).meets(kastanien.visible_if));
  assert.ok(!at({ season: 'sommer' }).meets(kastanien.visible_if));
  assert.equal(objects('kgl_s_drehorgel')[0].map, 'nachtmarkt');
});

test('Ereignisse: Chance je Besuch, begonnen bleibt, zwei Spuren, zwei Ausgänge mit Nachher-Dialog, Belohnung nur einmal', () => {
  for (const id of EVENTS) {
    const [o] = objects(id);
    assert.ok(o, id);
    assert.equal(o.visit_chance, 0.1);
    assert.equal(o.visit_started, `${id}_start`);
    assert.ok(content.quests[id.replace('kgl_ev_', 'kgl_q_')], `${id}: Auftrag`);
    for (const n of [1, 2]) {
      const [h] = objects(`${id}_hinweis${n}`);
      assert.ok(h && h.kind === 'read', `${id}: Spur ${n}`);
      assert.ok(h.visible_if.requires_flags.includes(`${id}_start`) && h.visible_if.hide_if_flags.includes(`${id}_done`), `${id}: Spur ${n} Sichtbarkeit`);
    }
    const s = at();
    const tree = content.dialogues[id];
    assert.equal(talk(s, id)[0], 'kgl_start');
    assert.ok(s.flags.has(`${id}_start`) && s.quests[id.replace('kgl_ev_', 'kgl_q_')] === 'active', `${id}: Start`);
    // Ohne Spuren keine Entscheidung (der Taschendieb hat drei eigene Verfolgungsstufen)
    if (id !== 'kgl_ev_tasche') assert.equal(s.pick(tree.start), 'kgl_auftrag', id);
    s.flags.add(`${id}_spur1`);
    s.flags.add(`${id}_spur2`);
    if (id === 'kgl_ev_tasche') for (const f of ['kgl_ev_tasche_route', 'kgl_ev_tasche_leise', 'kgl_ev_tasche_zeuge', 'kgl_ev_tasche_begleitung']) s.flags.add(f);
    const before = { money: s.money, honor: s.honor };
    const node = s.pick(tree.start);
    const open = tree.nodes[node].choices.filter((c) => s.meets(c));
    assert.ok(open.length >= 2, `${id}: ${open.length} Ausgänge an ${node}`);
    talk(s, id, [open[0].text]);
    assert.ok(s.flags.has(`${id}_done`), `${id}: Abschluss`);
    assert.ok(s.money > before.money || s.honor > before.honor, `${id}: Belohnung`);
    const after = { money: s.money, honor: s.honor };
    talk(s, id);
    assert.deepEqual({ money: s.money, honor: s.honor }, after, `${id}: Nachher ohne Auszahlung`);
    assert.equal(s.pick(content.dialogues[id].start), 'kgl_nachher');
  }
});

test('Nebelbote: zwölf Meldungen, je zwei je Ereignis, nie beide zugleich', () => {
  assert.equal(NEWSPAPERS.kgl_nebelbote, 'Kettlegater Nebelbote');
  const papers = content.newspapers.filter((p) => p.zeitung === 'kgl_nebelbote');
  assert.equal(papers.length, 12);
  for (const id of EVENTS) {
    const a = at();
    a.flags.add(`${id}_a`);
    const b = at();
    b.flags.add(`${id}_b`);
    assert.equal(papers.filter((p) => a.meets(p)).length, 1, `${id} a`);
    assert.equal(papers.filter((p) => b.meets(p)).length, 1, `${id} b`);
  }
});

test('Gerede, Koop-Geplauder, Wetter und Tiere: Zeilen hängen an den Vierteln, Innenräume bleiben still', () => {
  for (const map of ['altmarkt', 'ashgrove', 'docks', 'nordtor', 'nachtmarkt', 'ebba', 'ankerhof']) assert.ok(content.gossip.kettlegate[map].length >= 10, map);
  assert.ok(content.gossip.kettlegate.altmarkt.some((l) => /Kastanienmann/.test(l.text)));
  const koop = content.koop.geplauder.filter((g) => g.id.startsWith('kgl_koop_'));
  assert.equal(koop.length, 20);
  for (const g of koop) {
    assert.ok(g.requires_flags.includes('koop_aktiv'));
    assert.ok(g.zeilen.some((z) => z.p === 'p2' && z.a && z.b), g.id);
  }
  const leben = (id) => content.maps[id].leben;
  assert.deepEqual(leben('altmarkt').weather, ['kgl_nebel_duenn', 'kgl_nebel_dicht', 'kgl_nieselregen', 'kgl_russschnee']);
  assert.equal(leben('docks').animals.kgl_moewe, 3);
  assert.ok(leben('docks').weather.includes('kgl_kanalgeruch'));
  assert.deepEqual(leben('crypt'), { weather: [], animals: {} });
  assert.equal(leben('sternwarte').animals.kgl_fledermaus, 2);
  for (const m of KG_MAPS.filter((x) => x.leben)) {
    for (const w of m.leben.weather) assert.ok(w === 'kgl_nebel_duenn' || KGL_WETTER[w], `${m.id}: ${w}`);
    for (const a of Object.keys(m.leben.animals)) assert.ok(['kgl_taube', 'kgl_ratte', 'kgl_katze', 'kgl_hund', 'kgl_moewe', 'kgl_fledermaus', 'kgl_pferd'].includes(a), `${m.id}: ${a}`);
  }
});

test('Grafik: Atlanten liegen vor, Regionen passen zum Manifest und liegen im Bild', () => {
  for (const [key, file] of Object.entries(KGL_FILES)) {
    assert.ok(existsSync(sprite(file)), file);
    const def = manifest.assets.find((a) => a.id === key);
    assert.equal(def.file, file);
    const table = { kgl_tiere: KGL_TIERE, kgl_wetter: KGL_WETTER, kgl_staende: KGL_STAENDE, kgl_nacht: KGL_NACHT }[key];
    assert.deepEqual(Object.keys(table), Object.keys(def.regions), key);
    for (const [name, [x, y, w, h, n, fps]] of Object.entries(table)) {
      const r = def.regions[name];
      assert.deepEqual([x, y, w, h, n], [r.x, r.y, r.frameWidth, r.frameHeight, r.columns * (r.rows ?? 1)], name);
      assert.ok(x + n * w <= def.width && y + h <= def.height, `${name} im Bild`);
      assert.ok(fps >= 1);
    }
  }
  assert.ok(KGL_TIERE.kgl_taube_picken && KGL_TIERE.kgl_taube_auffliegen && KGL_NACHT.kgl_fenster_4 && KGL_STAENDE.kgl_droschke_umgestuerzt);
  assert.equal(objects('kgl_ev_droschke')[0].stand, 'kgl_droschke_umgestuerzt');
  assert.equal(objects('kgl_ev_brand')[0].stand, 'kgl_schornsteinbrand');
});
