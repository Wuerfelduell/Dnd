// Pfad-Beyonder in Wexmoor (Seb, 2026-11-12): Zu jedem Pfad ein Einzelgänger, der bei den Kernzutaten für Sequenz 5
// und 4 hilft (Wucher, Gefallen, Aufgabe oder Hinweis). Formeln geben sie nie her; die Halbgott-Formel gibt es nur auf
// geheimen Treffen oder mit 0,5 % bei Elite-Gegnern. Die Einzelgänger laufen je Tageszeit durch zwei bis drei Viertel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { DAY_NIGHT_SECONDS, NIGHT_FLAG, DAY_B_FLAG } from '../src/core/Clock.js';
import { PH_OFFERS, PH_SCHEDULE, FORMEL_ELITE_CHANCE, SCHLEUSEN_FRIST, PH_BOND } from '../src/data/pfadHandel.js';
import { loadContent, talk } from './helpers.js';

const content = loadContent();
const PATHS = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr'];

/** In Wexmoor, mit Zunder bekannt, auf einem Pfad, mit dem Einzelgänger gut genug bekannt. */
function at(pid, seq, npc) {
  const s = new GameState(content);
  ['kapitel1_done', 'k2_arrived', 'k2_met_zunder', 'k2_hideout'].forEach((f) => s.flags.add(f));
  s.map = 'wx_kahn';
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  if (npc) {
    s.flags.add(`${npc}_getroffen`);
    if (npc === 'wx_pfandleiherin') s.flags.add('wx_pfandleiherin_ph_gemerkt');
    s.bonds[npc] = PH_BOND;
  }
  return s;
}

/** Ins Zutaten-Menü und dort Auswahlpunkte wählen. */
const menu = (s, npc, picks) => talk(s, npc, ['Über Zutaten', ...picks]);

/** Kampf sofort entscheiden (die Regeln der Aufgabe gelten trotzdem). */
function finish(s, id, outcome = 'won') {
  const c = new Combat(s, id);
  c.rng = () => 0.99;
  c.outcome = outcome;
  return { c, r: c.finish() };
}

test('Jeder der zehn Pfade hat in Wexmoor einen Beyonder mit Figur, Laufplan, Dialog, Kampf und zwei Angeboten (5 und 4)', () => {
  const byPath = {};
  for (const [id, l] of Object.entries(content.loners.list)) if (l.map.startsWith('wx_')) byPath[l.pathway] = id;
  assert.deepEqual(Object.keys(byPath).sort(), [...PATHS].sort());
  for (const [pid, id] of Object.entries(byPath)) {
    assert.ok(content.npcs[id] && content.dialogues[id] && content.encounters[id], id);
    const offers = PH_OFFERS.filter((o) => o.npc === id);
    assert.deepEqual(offers.map((o) => o.seq).sort(), [4, 5], id);
    for (const o of offers) {
      assert.equal(o.pathway, pid);
      assert.ok(content.items[o.item], o.item);
      assert.ok(!o.item.startsWith('formel_'), 'Formeln verkauft kein Einzelgänger');
    }
  }
  // Seq 5 schwer, aber machbar: gemischt; Seq 4 nur Wucher oder schwere Aufgabe
  const kinds5 = new Set(PH_OFFERS.filter((o) => o.seq === 5).map((o) => o.kind));
  assert.deepEqual([...kinds5].sort(), ['gefallen', 'hinweis', 'wucher']);
  for (const o of PH_OFFERS.filter((x) => x.seq === 4)) assert.ok(['wucher', 'aufgabe'].includes(o.kind), o.id);
  for (const o of PH_OFFERS.filter((x) => x.seq === 4 && x.kind === 'wucher')) assert.ok(o.price >= 3500, o.id);
});

test('Kein Einzelgänger-Dialog gibt eine Formel her', () => {
  for (const o of PH_OFFERS) {
    for (const node of Object.values(content.dialogues[o.npc].nodes)) {
      for (const id of Object.keys(node.gives_items ?? {})) assert.ok(!id.startsWith('formel_'), `${o.npc}: ${id}`);
    }
  }
});

test('Laufplan: jeder ist zu jeder Tageszeit an genau einer Stelle, über mindestens zwei Viertel verteilt', () => {
  const slots = { tag: [], tag_b: [DAY_B_FLAG], nacht: [NIGHT_FLAG] };
  for (const npc of Object.keys(PH_SCHEDULE)) {
    const places = new Set();
    for (const flags of Object.values(slots)) {
      const s = at('eisen', 7);
      flags.forEach((f) => s.flags.add(f));
      const here = Object.entries(content.maps).filter(([, m]) => (m.npcs ?? []).some((n) => n.id === npc && s.meets(n.visible_if)));
      assert.equal(here.length, 1, `${npc} ${flags}: ${here.map(([id]) => id)}`);
      places.add(here[0][0]);
      for (const [mid] of here) {
        const n = content.maps[mid].npcs.find((x) => x.id === npc && s.meets(x.visible_if));
        const ch = content.maps[mid].rows[n.tile[1]]?.[n.tile[0]];
        assert.ok(ch !== undefined, `${npc}: Feld auf ${mid}`);
      }
      s.flags.add(`${npc}_besiegt`);
      assert.ok(!Object.values(content.maps).some((m) => (m.npcs ?? []).some((n) => n.id === npc && s.meets(n.visible_if))), `${npc} besiegt: fort`);
    }
    if (npc !== 'wx_pfandleiherin') assert.ok(places.size >= 2, `${npc}: ${[...places]}`);
  }
});

test('Zutaten-Menü erst ab Beziehung +2 und nur für den eigenen Pfad ab der passenden Sequenz', () => {
  const s = at('laterne', 6, null);
  talk(s, 'ez_brennerin', ['']);
  assert.throws(() => menu(s, 'ez_brennerin', []), /Über Zutaten/);
  s.bonds.ez_brennerin = 2;
  assert.throws(() => menu(s, 'ez_brennerin', ['Zeugendocht']), /Zeugendocht/, 'Seq-4-Zutat erst ab Sequenz 5');
  menu(s, 'ez_brennerin', ['Lichtperle']);
  const other = at('eisen', 6, 'ez_brennerin');
  assert.throws(() => menu(other, 'ez_brennerin', ['Lichtperle']), /Lichtperle/, 'fremder Pfad');
});

test('Wucher: Maske 5, Laterne 4, Kessel 4 und Waage 4 kosten Geld (und Ware), einmalig', () => {
  const cases = [['maske', 6, 'ez_maskenwirt', 'Schminkasche', 1200], ['laterne', 5, 'ez_brennerin', 'Zeugendocht', 3500],
    ['kessel', 5, 'ez_reetkoenig', 'Fehlchargensalz', 4000], ['sq_waage', 5, 'wx_pfandleiherin', 'Gleichfristblei', 5000]];
  for (const [pid, seq, npc, name, price] of cases) {
    const s = at(pid, seq, npc);
    const o = PH_OFFERS.find((x) => x.npc === npc && content.items[x.item].name.includes(name));
    s.money = price - 1;
    assert.throws(() => menu(s, npc, [name, 'Kaufen']), /Kaufen/, `${npc}: zu wenig Geld`);
    s.money = price;
    for (const [i, n] of Object.entries(o.needs ?? {})) s.addItem(i, n);
    menu(s, npc, [name, 'Kaufen']);
    assert.equal(s.itemCount(o.item), 1, npc);
    assert.equal(s.money, 0);
    for (const i of Object.keys(o.needs ?? {})) assert.equal(s.itemCount(i), 0);
    assert.throws(() => menu(s, npc, [name]), new RegExp(name), 'nur einmal');
  }
});

test('Schlüssel: Schattenseide für 900 plus Schuld; erst nach der Schuld gibt es die Seq-4-Aufgabe', () => {
  const s = at('schluessel', 5, 'ez_schleusendieb');
  s.money = 900;
  menu(s, 'ez_schleusendieb', ['Schattenseide', 'Kaufen']);
  assert.equal(s.itemCount('schattenseide'), 1);
  assert.ok(s.flags.has('ph_ez_schleusendieb_schuld'));
  assert.throws(() => menu(s, 'ez_schleusendieb', ['Zollbart']), /Zollbart/);
  s.money = 300;
  menu(s, 'ez_schleusendieb', ['Schuld begleichen']);
  assert.equal(s.money, 0);
  menu(s, 'ez_schleusendieb', ['Zollbart', 'Ich mache es']);
  // Tresor im Lichtamt: nur bei voller Fahndung
  s.wanted = 2;
  assert.equal(talk(s, 'ph_tresor').at(-1), 'zu');
  s.wanted = 3;
  talk(s, 'ph_tresor');
  assert.ok(s.flags.has('ph_schluessel4_fertig'));
  menu(s, 'ez_schleusendieb', ['Zollbart: Erledigt']);
  assert.equal(s.itemCount('sq_zutat_schluessel_4'), 1);
});

test('Waage 5: Maud nimmt zwei Artefakte als Pfand, die billigsten', () => {
  const s = at('sq_waage', 6, 'wx_pfandleiherin');
  const arts = Object.keys(content.items).filter((id) => content.items[id].kind === 'artifact').slice(0, 3);
  s.addItem(arts[0]);
  assert.throws(() => menu(s, 'wx_pfandleiherin', ['Sequenz 5', 'Kaufen']), /Kaufen/, 'ein Artefakt reicht nicht');
  s.addItem(arts[1]);
  s.addItem(arts[2]);
  menu(s, 'wx_pfandleiherin', ['Sequenz 5', 'Kaufen']);
  assert.equal(s.itemCount('sq_zutat_waage_5'), 1);
  assert.equal(arts.filter((a) => s.itemCount(a) > 0).length, 1);
});

test('Hinweise: erst nach dem Gespräch fallen Spindelknochen, Atemglas und Moor-Zutat bei den genannten Gegnern', () => {
  for (const [pid, npc, foe, item] of [['faden', 'ez_spinnerin', 'namensmade_elite', 'spindelknochen'], ['echo', 'ez_glockenfischer', 'nebelfischer_elite', 'atemglas'], ['sq_moor', 'ez_torfmutter', 'kellerkrebs_elite', 'sq_zutat_moor_5']]) {
    const s = at(pid, 6, npc);
    const loot = { money: 0, items: {} };
    s.pfadExtraLoot({ enc: content.encounters[foe], id: foe }, loot, () => 0);
    assert.equal(loot.items[item], undefined, `${item} ohne Hinweis`);
    menu(s, npc, ['Wo finde ich']);
    s.pfadExtraLoot({ enc: content.encounters[foe], id: foe }, loot, () => 0);
    assert.equal(loot.items[item], 1, item);
    const o = PH_OFFERS.find((x) => x.npc === npc && x.seq === 5);
    assert.ok(Object.values(o.drops).every((c) => c <= 0.25), 'selten');
  }
});

test('Laterne 5: drei Moorlaternen in einer Nacht, jede kostet einen Kampf; ein neuer Abend setzt zurück', () => {
  const s = at('laterne', 6, 'ez_brennerin');
  menu(s, 'ez_brennerin', ['Lichtperle', 'Ich mache es']);
  s.playTime = DAY_NIGHT_SECONDS * 1 + 10; // Nacht
  s.syncClock();
  talk(s, 'ph_laterne_1', ['Anzünden']);
  assert.equal(s.pendingCombat, 'weisslicht_elite');
  finish(s, 'weisslicht_elite');
  talk(s, 'ph_laterne_2', ['Anzünden']);
  finish(s, 'weisslicht_elite', 'fled');
  assert.ok(!s.phStepDone('laterne5', 2), 'geflohen zählt nicht');
  // nächste Nacht: alles von vorn
  s.playTime = DAY_NIGHT_SECONDS * 3 + 10;
  s.syncClock();
  assert.ok(!s.phStepDone('laterne5', 1));
  for (const n of [1, 2, 3]) { talk(s, `ph_laterne_${n}`, ['Anzünden']); finish(s, 'weisslicht_elite'); }
  assert.ok(s.flags.has('ph_laterne5_fertig'));
  menu(s, 'ez_brennerin', ['Lichtperle: Erledigt']);
  assert.equal(s.itemCount('lichtperle'), 1);
  // tagsüber brennt nichts
  const d = at('laterne', 6, 'ez_brennerin');
  menu(d, 'ez_brennerin', ['Lichtperle', 'Ich mache es']);
  assert.equal(talk(d, 'ph_laterne_1').at(-1), 'tag');
});

test('Uhr 5: vier Schleusenräder innerhalb der Frist', () => {
  const s = at('sq_uhr', 6, 'ez_schleusenuhr');
  menu(s, 'ez_schleusenuhr', ['Sequenz 5', 'Ich mache es']);
  s.playTime = 0;
  for (const n of [1, 2, 3]) talk(s, `ph_schleuse_${n}`, ['Rad stellen']);
  s.playTime = SCHLEUSEN_FRIST + 1; // zu spät
  talk(s, 'ph_schleuse_4', ['Rad stellen']);
  assert.ok(!s.flags.has('ph_uhr5_fertig'));
  assert.ok(s.phStepDone('uhr5', 4) && !s.phStepDone('uhr5', 1), 'neue Frist ab dem letzten Rad');
  for (const n of [1, 2, 3]) talk(s, `ph_schleuse_${n}`, ['Rad stellen']);
  assert.ok(s.flags.has('ph_uhr5_fertig'));
  menu(s, 'ez_schleusenuhr', ['Erledigt']);
  assert.equal(s.itemCount('sq_zutat_uhr_5'), 1);
});

test('Eisen 5: drei Siege im Salzwatt hintereinander, ohne Heilung (im Kampf verboten, dazwischen bricht die Serie)', () => {
  const s = at('eisen', 6, 'ez_baender');
  menu(s, 'ez_baender', ['Schwertsplitter', 'Ich mache es']);
  const foe = 'salzgeist';
  const { c } = finish(s, foe);
  assert.equal(c.rules?.noHeal, true, 'Heilen ist im Kampf gesperrt');
  s.hp -= 10;
  finish(s, foe);
  s.hp += 5; // geheilt
  finish(s, foe);
  assert.ok(!s.flags.has('ph_eisen5_fertig'), 'Heilung zwischendurch setzt zurück');
  finish(s, foe);
  finish(s, foe, 'fled');
  assert.equal(s.phState().eisen5.n, 0, 'Flucht setzt zurück');
  for (let i = 0; i < 3; i++) finish(s, foe);
  assert.ok(s.flags.has('ph_eisen5_fertig'));
  menu(s, 'ez_baender', ['Erledigt']);
  assert.equal(s.itemCount('schwertsplitter'), 1);
});

test('Kessel 5: fünf Torfproben (fallen nur während des Auftrags im Vergessmoor) und Moorwasser', () => {
  const s = at('kessel', 6, 'ez_reetkoenig');
  const foe = 'torfgaenger';
  const loot = { money: 0, items: {} };
  s.pfadExtraLoot({ enc: content.encounters[foe], id: foe }, loot, () => 0);
  assert.equal(loot.items.ph_torfprobe, undefined);
  menu(s, 'ez_reetkoenig', ['Goldschimmel', 'Ich mache es']);
  s.pfadExtraLoot({ enc: content.encounters[foe], id: foe }, loot, () => 0);
  assert.equal(loot.items.ph_torfprobe, 1);
  s.addItem('ph_torfprobe', 4);
  assert.throws(() => menu(s, 'ez_reetkoenig', ['Goldschimmel: Erledigt']), /Erledigt/);
  s.addItem('ph_torfprobe', 1);
  s.addItem('moorwasser', 1);
  menu(s, 'ez_reetkoenig', ['Goldschimmel: Erledigt']);
  assert.equal(s.itemCount('goldschimmel'), 1);
  assert.equal(s.itemCount('ph_torfprobe'), 0);
});

test('Seq-4-Kämpfe: Faden ohne Heilung, Eisen ohne Ausweichen, Moor mit Moorwasser, Echo dreimal taub; verstärkte Gegner', () => {
  const cases = [['faden', 'ez_spinnerin', 'Lückenspule', 'ph_faden4_stelle_1', 'ph_namenlose_echo', 'namenlose', 'noHeal'],
    ['eisen', 'ez_baender', 'Tragende Niete', 'ph_eisen4_stelle_1', 'ph_leuchtfeuer_elite', 'leuchtfeuer', 'noDodge'],
    ['sq_moor', 'ez_torfmutter', 'Schichtname', 'ph_moor4_stelle_1', 'ph_buergermeister_echo', 'buergermeister', 'moorwater']];
  for (const [pid, npc, name, spot, foe, base, rule] of cases) {
    const s = at(pid, 5, npc);
    s.addItem('moorwasser', 30);
    menu(s, npc, [name, 'Ich mache es']);
    talk(s, spot, ['Jetzt']);
    assert.equal(s.pendingCombat, foe);
    assert.ok(content.encounters[foe].hp > content.encounters[base].hp * 1.4, `${foe} verstärkt`);
    const { c } = finish(s, foe, 'lost');
    assert.equal(c.rules?.[rule], true, `${foe}: ${rule}`);
    assert.ok(!s.flags.has(`ph_${pid.replace('sq_', '')}4_fertig`), 'verloren zählt nicht');
    talk(s, spot, ['Jetzt']);
    finish(s, foe);
    menu(s, npc, [`${name}: Erledigt`]);
    assert.equal(s.itemCount(PH_OFFERS.find((o) => o.npc === npc && o.seq === 4).item), 1, npc);
  }
  const s = at('echo', 5, 'ez_glockenfischer');
  menu(s, 'ez_glockenfischer', ['Atempause', 'Ich mache es']);
  for (const n of [1, 2, 3]) {
    talk(s, `ph_echo4_stelle_${n}`, ['Jetzt']);
    const { c } = finish(s, `ph_ertrunkener_${n}`);
    assert.equal(c.rules?.deaf, true);
  }
  assert.ok(s.flags.has('ph_echo4_fertig'));
  assert.ok(!s.meets(content.maps.wx_salzwatt.interactables.find((i) => i.id === 'ph_echo4_stelle_1').visible_if), 'Stellen verschwinden');
  menu(s, 'ez_glockenfischer', ['Atempause: Erledigt']);
  assert.equal(s.itemCount('sq_zutat_echo_4'), 1);
});

test('Maske 4: Hales Siegel nur bei voller Fahndung', () => {
  const s = at('maske', 5, 'ez_maskenwirt');
  menu(s, 'ez_maskenwirt', ['Rückseitenwachs', 'Ich mache es']);
  assert.equal(talk(s, 'ph_siegel').at(-1), 'zu');
  s.wanted = 3;
  talk(s, 'ph_siegel', ['Einstecken']);
  menu(s, 'ez_maskenwirt', ['Rückseitenwachs: Erledigt']);
  assert.equal(s.itemCount('sq_zutat_maske_4'), 1);
  assert.equal(s.itemCount('ph_hales_siegel'), 0);
});

test('Uhr 4: fünf Siege in Wexmoors Monstergebieten in einer Nacht; Tag oder Niederlage setzt zurück', () => {
  const s = at('sq_uhr', 5, 'ez_schleusenuhr');
  menu(s, 'ez_schleusenuhr', ['Sequenz 4', 'Ich mache es']);
  s.playTime = DAY_NIGHT_SECONDS + 5;
  for (let i = 0; i < 4; i++) finish(s, 'torfgaenger');
  finish(s, 'torfgaenger', 'lost');
  assert.equal(s.phState().uhr4.n, 0);
  for (let i = 0; i < 4; i++) finish(s, 'salzgeist');
  s.playTime = DAY_NIGHT_SECONDS * 3 + 5; // neue Nacht
  finish(s, 'salzgeist');
  assert.ok(!s.flags.has('ph_uhr4_fertig'));
  for (let i = 0; i < 4; i++) finish(s, 'salzgeist');
  assert.ok(s.flags.has('ph_uhr4_fertig'));
});

test('Halbgott-Formel: nicht bei Kittering, aber 0,5 % bei Elite-Gegnern für Sequenz 5 (einmal) und auf Wexmoorer Treffen', () => {
  assert.equal(FORMEL_ELITE_CHANCE, 0.005);
  const s = at('eisen', 5);
  const loot = () => ({ money: 0, items: {} });
  const elite = { enc: content.encounters.torfgaenger_elite, id: 'torfgaenger_elite' };
  const normal = { enc: content.encounters.torfgaenger, id: 'torfgaenger' };
  let l = loot();
  s.pfadExtraLoot(normal, l, () => 0);
  assert.equal(l.items.formel_eisen_4, undefined, 'normale Gegner nie');
  s.pfadExtraLoot(elite, l, () => 0.006);
  assert.equal(l.items.formel_eisen_4, undefined, 'über 0,5 % nicht');
  s.pfadExtraLoot(elite, l, () => 0.004);
  assert.equal(l.items.formel_eisen_4, 1);
  l = loot();
  s.pfadExtraLoot(elite, l, () => 0);
  assert.equal(l.items.formel_eisen_4, undefined, 'nur einmal');
  const s6 = at('eisen', 6);
  l = loot();
  s6.pfadExtraLoot(elite, l, () => 0);
  assert.equal(l.items.formel_eisen_4, undefined, 'erst ab Sequenz 5');
  assert.ok(!content.market.merchants.kittering.stock.some((e) => /^formel_.*_4$/.test(e.item)));
});

test('Neue Einzelgänger: Torfmutter und Schleusenuhrmacher lassen sich anfreunden und verraten; Maud auch', () => {
  for (const [id, wants] of [['ez_torfmutter', { moorwasser: 5 }], ['ez_schleusenuhr', { sternglas: 2 }]]) {
    const s = at('eisen', 7);
    talk(s, id, ['']);
    assert.equal(s.bond(id), 1);
    talk(s, id, ['Kann ich etwas']);
    for (const [i, n] of Object.entries(wants)) s.addItem(i, n);
    talk(s, id, ['Hier']);
    assert.equal(s.bondStatus(id), 'freund');
    talk(s, id, ['Über Zutaten']);
  }
  const s = at('eisen', 7);
  talk(s, 'wx_pfandleiherin', ['Sie wiegen']);
  assert.equal(s.bond('wx_pfandleiherin'), 1);
  talk(s, 'wx_pfandleiherin', ['Kann ich etwas']);
  s.addItem('moorperle', 2);
  talk(s, 'wx_pfandleiherin', ['Hier, zwei Moorperlen']);
  assert.equal(s.bondStatus('wx_pfandleiherin'), 'freund');
  assert.ok(talk(s, 'wx_pfandleiherin', ['Über Zutaten']));
  const f = at('eisen', 7);
  talk(f, 'wx_pfandleiherin', ['Sie wiegen']);
  f.bonds.wx_pfandleiherin = -1;
  talk(f, 'wx_pfandleiherin', ['Pfandtisch']);
  assert.equal(f.pendingCombat, 'wx_pfandleiherin');
  assert.ok(f.isBeyonderNpc('wx_pfandleiherin') && f.isBeyonderFoe('wx_pfandleiherin'));
});

test('Aufgaben überleben Speichern und Laden', () => {
  const s = at('eisen', 6, 'ez_baender');
  menu(s, 'ez_baender', ['Schwertsplitter', 'Ich mache es']);
  finish(s, 'salzgeist');
  const t = new GameState(content);
  t.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.equal(t.phState().eisen5.n, 1);
});
