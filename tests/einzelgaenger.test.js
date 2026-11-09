// Kapitel 2: Einzelgänger mit eigener Sequenz (Freund oder Feind), die Zirkel von Wexmoor und die neuen Monster.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, fight, EXPERT } from './helpers.js';

const content = loadContent();
const LONERS = Object.keys(content.loners.list);

/** In Wexmoor angekommen, mit Unterschlupf. */
function inWexmoor() {
  const s = new GameState(content);
  ['kapitel1_done', 'k2_arrived', 'k2_met_zunder', 'k2_hideout', 'briefed_04'].forEach((f) => s.flags.add(f));
  s.map = 'wx_kahn';
  s.money = 300;
  return s;
}

/** Was der Einzelgänger haben will, in die Tasche legen. */
function bring(s, id) {
  const give = content.dialogues[id].nodes.hub.choices.find((c) => Array.isArray(c.next) && c.next.some((v) => v.node === 'dank'));
  for (const i of give.requires_items ?? []) s.addItem(i, 5);
}

/** Ausrüstung je nach Sequenz: Sequenz 7 wie Bosse der Stufe 3, darüber wie Stufe 4. */
function armed(s, seq) {
  const w = seq >= 7 ? 'egelhaken' : 'ossuarklinge';
  s.addItem(w);
  s.equip(w);
  s.addItem('tonikum', seq >= 7 ? 3 : 4);
  s.addItem('verband', 2);
  return s;
}

test('Sieben Einzelgänger, je ein Pfad, alle mit Figur, Ort, Dialog und Kampf', () => {
  assert.equal(LONERS.length, 7);
  const paths = new Set();
  for (const id of LONERS) {
    const l = content.loners.list[id];
    paths.add(l.pathway);
    assert.ok(content.pathways[l.pathway]?.seqs[l.seq], `${id}: Sequenz`);
    assert.ok(content.npcs[id] && content.dialogues[id] && content.encounters[id], id);
    assert.ok(content.maps[l.map].npcs.some((n) => n.id === id), `${id} steht auf ${l.map}`);
    // Feinde lassen die Zutat ihrer eigenen Sequenz fallen
    const ing = Object.keys(content.pathways[l.pathway].seqs[l.seq].ingredients)[0];
    assert.ok(content.loot[id].drops.some((d) => d.item === ing && d.chance === 1), `${id}: ${ing}`);
  }
  assert.equal(paths.size, 7, 'jeder Pfad einmal');
});

test('Anfreunden: nett begegnen, Auftrag erledigen, Geschenk und Freundschaft', () => {
  for (const id of LONERS) {
    const s = inWexmoor();
    talk(s, id, ['']); // erste Begegnung: erste Antwort ist die freundliche
    assert.equal(s.bond(id), 1, id);
    talk(s, id, ['Kann ich etwas']);
    assert.ok(s.flags.has(`${id}_auftrag`));
    bring(s, id);
    const gift = Object.keys(content.dialogues[id].nodes.dank.gives_items);
    talk(s, id, ['Hier']);
    assert.equal(s.bondStatus(id), 'freund', id);
    for (const g of gift) assert.ok(s.itemCount(g) > 0, `${id}: Geschenk ${g}`);
    // Freundschaft steht fest, Verrat geht nicht mehr
    s.changeBond(id, -5);
    assert.equal(s.bondStatus(id), 'freund');
  }
});

test('Wer grob anfängt, braucht einen zweiten Gefallen', () => {
  const s = inWexmoor();
  const id = 'ez_baender';
  talk(s, id, ['Bezahlung']);
  assert.equal(s.bond(id), -1);
  talk(s, id, ['Kann ich etwas']);
  s.addItem('salzkristall', 8);
  talk(s, id, ['Hier']);
  assert.equal(s.bond(id), 1);
  assert.equal(s.bondStatus(id), null);
  assert.equal(talk(s, id, ['Hier']).at(-1), 'dank2');
  assert.equal(s.bondStatus(id), 'freund');
  assert.equal(s.itemCount('sternschlacke'), 1, 'Geschenk nur einmal');
});

test('Anfeinden: zweimal schlecht behandelt, dann greift der Einzelgänger an', () => {
  for (const id of LONERS) {
    const l = content.loners.list[id];
    const s = armed(inWexmoor(), l.seq);
    const rude = content.dialogues[id].nodes.erst.choices[1].text;
    talk(s, id, [rude]);
    const betray = content.dialogues[id].nodes.hub.choices.find((c) => Array.isArray(c.next) && c.next.some((v) => v.node === 'kampf')).text;
    talk(s, id, [betray]);
    assert.equal(s.bondStatus(id), 'feind', id);
    assert.equal(s.pendingCombat, id);
    const { result, combat } = fight(s, id, { defend: EXPERT, skill: 'double', healBelow: 18 });
    assert.equal(result.outcome, 'won', `${id}: verloren in Runde ${combat.round}`);
    assert.ok(s.flags.has(`${id}_besiegt`));
    const visible = content.maps[l.map].npcs.find((n) => n.id === id).visible_if;
    assert.ok(!s.meets(visible), `${id} ist danach fort`);
    const ing = Object.keys(content.pathways[l.pathway].seqs[l.seq].ingredients)[0];
    assert.ok(s.itemCount(ing) >= 1, `${id}: ${ing}`);
  }
});

test('Einzelgänger-Kämpfe sind hart: halbe Deckung verliert', () => {
  for (const id of LONERS) {
    const s = armed(inWexmoor(), content.loners.list[id].seq);
    const { result } = fight(s, id, { defend: (i) => (i % 2 ? 'miss' : 'dodge'), healBelow: 18 });
    assert.equal(result.outcome, 'lost', id);
  }
});

test('Nett anfangen und einmal verraten reicht noch nicht für einen Kampf', () => {
  const s = inWexmoor();
  talk(s, 'ez_reetkoenig', ['Hut']);
  assert.equal(talk(s, 'ez_reetkoenig', ['Torfstechern']).at(-1), 'verrat');
  assert.equal(s.bond('ez_reetkoenig'), -1);
  assert.equal(s.pendingCombat, null);
});

test('Zirkel in Wexmoor: Lichtlose und Salzbrüder nur über befreundete Einzelgänger', () => {
  const s = inWexmoor();
  assert.deepEqual(content.gatherings.rules.orders.wexmoor, ['lichtlose', 'salz', 'namensgilde']); // Paket AQ: Täfelchengilde
  // In Wexmoor wechseln sich nur die Wexmoorer Zirkel ab, in Kettlegate die alten
  const ids = (n) => Array.from({ length: n }, (_, c) => s.gatheringSlot(c).id);
  assert.deepEqual([...new Set(ids(6))].sort(), ['lichtlose', 'namensgilde', 'salz']);
  s.map = 'revier';
  assert.deepEqual([...new Set(ids(6))].sort(), ['kreide', 'russ', 'waage']);
  s.map = 'wx_kahn';
  // Fitz bürgt für die Lichtlosen
  talk(s, 'ez_schleusendieb', ['An was']);
  talk(s, 'ez_schleusendieb', ['Kann ich etwas']);
  talk(s, 'ez_schleusendieb', ['Kaution']);
  assert.equal(s.bondStatus('ez_schleusendieb'), 'freund');
  talk(s, 'ez_schleusendieb', ['Lichtlosen']);
  assert.ok(s.isMember('lichtlose'));
  assert.ok(!s.isMember('salz'));
  // Treffen offen: der Gastgeber verkauft
  let c = s.marketCycle() + 1;
  while (s.gatheringSlot(c).id !== 'lichtlose') c++;
  s.playTime = s.gatheringSlot(c).start + 1;
  assert.ok(s.gatheringOpen('lichtlose'));
  assert.equal(talk(s, 'zirkel_lichtlose', [])[0], 'open');
  assert.ok(content.travel.some((t) => t.map === 'treffen_lichtlose' && t.city === 'wexmoor'));
});

test('Neue Monster: eigene Namen in Vergessmoor und Leuchtturm, Salzwatt mit Glockenmutter', () => {
  const zone = (z) => Object.entries(content.encounters).filter(([, e]) => e.zone === z && !e.elite).map(([id]) => id).sort();
  assert.deepEqual(zone('wx_vergessmoor'), ['namenlose', 'reetmann', 'torfgaenger', 'weisslicht']);
  assert.deepEqual(zone('wx_leuchtturm'), ['glasmoewe', 'leuchtfeuer', 'lichtbrut', 'linsensplitter']);
  assert.deepEqual(zone('wx_salzwatt'), ['bojenglocke', 'glockenmutter', 'nebelfischer', 'salzgeist', 'schlickaal']);
  // Jeder Auftrag der Einzelgänger lässt sich mit Beute aus den Gefahrengebieten erfüllen
  const dropped = new Set(Object.values(content.loot).flatMap((t) => (t.drops ?? []).map((d) => d.item)));
  for (const id of LONERS) {
    const give = content.dialogues[id].nodes.hub.choices.find((c) => Array.isArray(c.next) && c.next.some((v) => v.node === 'dank'));
    for (const i of give.requires_items ?? []) assert.ok(dropped.has(i), `${id} will ${i}`);
  }
  for (const a of ['namenstaefelchen', 'leuchtturmlinse', 'bojenglocke_klein', 'torfmesser_alt']) assert.equal(content.items[a].kind, 'artifact', a);
});

test('Beziehungen werden gespeichert', () => {
  const s = inWexmoor();
  s.changeBond('ez_maskenwirt', 2);
  const t = new GameState(content);
  assert.equal(t.load(JSON.parse(JSON.stringify(s.serialize()))), true);
  assert.equal(t.bond('ez_maskenwirt'), 2);
});
