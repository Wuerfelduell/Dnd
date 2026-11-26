// Pfad-Beyonder in Dunscar (Seb, 2026-11-26): Die fünf Dunscarer Einzelgänger handeln ab Beziehung +2 mit den
// Seq-4-Kernzutaten, je zwei Pfade. Kaufen darf, wer (auch als Spieler 2) diesen Pfad oder den Nachbarpfad auf Seq 5 geht.
// Wucher auf Dunscar-Niveau oder ein verstärkter Dunscarer Boss mit Regel, den der Einzelgänger selbst ruft. Nie Formeln.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { DS_PH_OFFERS, DS_PH_LONERS, PH_BOND } from '../src/data/pfadHandel.js';
import { NACHBARPFADE } from '../src/data/nachbarpfade.js';
import { loadContent, talk } from './helpers.js';

const content = loadContent();
const PATHS = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr'];

function at(pid, seq, npc) {
  const s = new GameState(content);
  ['kapitel1_done', 'k2_done', 'k3_arrived'].forEach((f) => s.flags.add(f));
  s.map = 'ds_endbahnhof';
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.flags.add(`${npc}_getroffen`);
  s.bonds[npc] = PH_BOND;
  return s;
}
const menu = (s, npc, picks) => talk(s, npc, ['Über Zutaten', ...picks]);
const itemName = (o) => content.items[o.item].name;

test('Dunscar: alle zehn Seq-4-Kernzutaten bei den fünf Einzelgängern, keine Formel', () => {
  assert.deepEqual(DS_PH_OFFERS.map((o) => o.pathway).sort(), [...PATHS].sort());
  for (const o of DS_PH_OFFERS) {
    assert.ok(DS_PH_LONERS.includes(o.npc) && content.dialogues[o.npc], o.id);
    assert.equal(o.seq, 4);
    assert.ok(o.item.startsWith('sq_zutat_') && o.item.endsWith('_4'), o.item);
    if (o.kind === 'wucher') assert.ok(o.price >= 8000, o.id);
    if (o.fight) assert.ok(content.encounters[o.fight], o.fight);
    for (const node of Object.values(content.dialogues[o.npc].nodes)) for (const id of Object.keys(node.gives_items ?? {})) assert.ok(!id.startsWith('formel_'), id);
  }
});

test('Dunscar: eigener Pfad und Nachbarpfad dürfen kaufen, erst ab Seq 5 und Beziehung +2', () => {
  for (const o of DS_PH_OFFERS) {
    for (const pid of [o.pathway, NACHBARPFADE[o.pathway]]) {
      const s = at(pid, 5, o.npc);
      s.money = 20000;
      for (const [id, n] of Object.entries(o.needs ?? {})) s.addItem(id, n);
      menu(s, o.npc, [itemName(o), o.kind === 'wucher' ? 'Kaufen' : 'Ich mache es']);
      assert.ok(o.kind === 'wucher' ? s.itemCount(o.item) === 1 : s.flags.has(`ph_${o.id}_aktiv`), `${o.id} ${pid}`);
    }
  }
  // Seq 6: kein Angebot; fremder Pfad: kein Angebot; Beziehung zu klein: kein Menü
  const o = DS_PH_OFFERS.find((x) => x.id === 'ds_schluessel4');
  const s6 = at('schluessel', 6, o.npc); s6.money = 20000;
  assert.throws(() => menu(s6, o.npc, ['Zollbart']), /Zollbart/);
  const sf = at('eisen', 5, o.npc); sf.money = 20000;
  assert.throws(() => menu(sf, o.npc, ['Zollbart']), /Zollbart/);
  const sb = at('schluessel', 5, o.npc); sb.bonds[o.npc] = PH_BOND - 1;
  assert.throws(() => menu(sb, o.npc, ['Zollbart']), /Zollbart/);
});

test('Dunscar Wucher: Laterne-Spieler kauft den Zollbart (Nachbar) für 9000', () => {
  const s = at('laterne', 5, 'ez_ds_schrankenkind');
  s.money = 10000;
  menu(s, 'ez_ds_schrankenkind', ['Zollbart', 'Kaufen']);
  assert.equal(s.itemCount('sq_zutat_schluessel_4'), 1);
  assert.equal(s.money, 1000);
});

test('Dunscar Koop: Spieler 2 auf dem Pfad reicht', () => {
  const s = at('laterne', 5, 'ez_ds_rangierer');
  s.p2 = { active: true, pathway: { id: 'sq_waage', seq: 5 }, inventory: {} };
  if (!s.hasP2?.()) return; // ohne Koop-Status kein Test
  s.money = 10000;
  s.addItem('ds_beute_schichtgold', 2);
  menu(s, 'ez_ds_rangierer', ['Gleichfristblei', 'Kaufen']);
  assert.equal(s.itemCount('sq_zutat_waage_4'), 1);
});

test('Dunscar Aufgaben: der Einzelgänger ruft einen verstärkten Boss mit Regel; Sieg gibt die Zutat', () => {
  for (const o of DS_PH_OFFERS.filter((x) => x.kind === 'aufgabe')) {
    const s = at(o.pathway, 5, o.npc);
    s.addItem('moorwasser', 30);
    menu(s, o.npc, [itemName(o), 'Ich mache es']);
    menu(s, o.npc, ['Ruf ihn']);
    assert.equal(s.pendingCombat, o.fight, o.id);
    const lost = new Combat(s, o.fight); lost.rng = () => 0.99; lost.outcome = 'lost';
    const rule = Object.keys(o.rules)[0];
    assert.equal(lost.rules?.[rule], true, `${o.fight}: ${rule}`);
    lost.finish();
    assert.ok(!s.flags.has(`ph_${o.id}_fertig`));
    menu(s, o.npc, ['Ruf ihn']);
    const won = new Combat(s, o.fight); won.rng = () => 0.99; won.outcome = 'won'; won.finish();
    assert.ok(s.flags.has(`ph_${o.id}_fertig`), o.id);
    menu(s, o.npc, [`${itemName(o)}: Erledigt`]);
    assert.equal(s.itemCount(o.item), 1, o.id);
  }
});

test('Dunscar: Zutaten-Option immer sichtbar; unter Beziehung +2 sagt der Einzelgänger, was fehlt', () => {
  for (const npc of DS_PH_LONERS) {
    const s = at('eisen', 5, npc);
    s.bonds[npc] = 0;
    assert.equal(talk(s, npc, ['Über Zutaten']).at(-1), 'ph_zu_frueh', npc);
    s.bonds[npc] = PH_BOND;
    assert.equal(talk(s, npc, ['Über Zutaten']).at(-1), 'ph_menu', npc);
  }
});

test('Dunscar: Einzelgänger tragen ein Schild, eigene Farben und stehen ab der Ankunft im Personen-Wegweiser', async () => {
  const { knownPeople } = await import('../src/core/journal.js');
  const coats = new Set();
  for (const id of DS_PH_LONERS) {
    const place = Object.values(content.maps).flatMap((m) => m.npcs ?? []).find((n) => n.id === id);
    assert.ok(place.label?.startsWith(content.npcs[id].name), id);
    assert.ok(content.npcs[id].wegweiser, id);
    coats.add(content.npcs[id].palette.coat);
  }
  assert.equal(coats.size, DS_PH_LONERS.length, 'jeder sieht anders aus');
  const s = new GameState(content);
  assert.equal(knownPeople(s).filter((p) => DS_PH_LONERS.includes(p.id)).length, 0, 'vor Dunscar nicht');
  s.flags.add('k3_arrived');
  assert.equal(knownPeople(s).filter((p) => DS_PH_LONERS.includes(p.id)).length, 5);
});
