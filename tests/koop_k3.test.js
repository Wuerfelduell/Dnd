// Paket BF: Koop in Dunscar. Geplauder und Kampfsprüche kommen zu AI dazu, der p2-Pfad zählt für die eigenen Gespräche,
// elf Figuren reagieren auf die Begleitung, der Horch-Auftrag läuft über Rollenplätze; die Schleuse wartet auf BN.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { koopRoleOf, pickChat, koopBark, koopStartEvent } from '../src/core/Koop.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const ai = loadContent({ without: ['koop_k3'] });
const DS_MAPS = Object.keys(content.maps).filter((id) => id.startsWith('ds_'));

function duo({ act = 1, end = 'rein' } = {}) {
  const s = new GameState(content);
  s.addP2();
  s.flags.add('k3_arrived');
  s.flags.add(`k2_end_${end}`);
  for (let i = 1; i < act; i++) s.flags.add(`k3a_akt${i}_done`);
  return s;
}

test('BF: Geplauder, Kampfsprüche und Bindungstexte ergänzen AI statt es zu ersetzen', () => {
  assert.equal(content.koop.geplauder.length, ai.koop.geplauder.length + 40);
  for (const k of Object.keys(ai.koop.kampf)) assert.ok(content.koop.kampf[k], `AI-Anlass ${k} fehlt`);
  for (const k of ['koop_schichtgaenger', 'koop_nachhall', 'koop_pruefung']) assert.equal(content.koop.kampf[k].p2a.length, 10);
  assert.equal(Object.keys(content.koop.bindung).length, 32);
  assert.equal(content.koop.bindung.koop_ds_partner_gebunden.p2b.length, 5);
  assert.ok(content.koop.bindung.koop_ds_bindung_regel);
  assert.equal(ai.koop.bindung && Object.keys(ai.koop.bindung).length, 0);
});

test('BF: auf jeder Dunscarer Karte gibt es zu zweit etwas zu sagen, Akt-Gespräche vor den allgemeinen', () => {
  const s = duo();
  for (const id of DS_MAPS) {
    const chat = pickChat(s, id);
    if (['ds_endbahnhof', 'ds_kalkmarkt'].includes(id)) assert.ok(chat, `kein Gespräch auf ${id} nach Ankunft`); // Schwellenring: Akt-I-Zeile nur nach dem Moor-Ende
    if (chat) { assert.ok(chat.zeilen.length >= 3); s.koopSeen.add(chat.id); }
  }
  const first = pickChat(duo(), 'ds_endbahnhof');
  assert.equal(first.id, 'koop_pl_ds_01'); // das Akt-I-Gespräch kommt vor dem Alltagsgespräch
  const solo = new GameState(content);
  solo.flags.add('k3_arrived');
  assert.equal(pickChat(solo, 'ds_endbahnhof'), null);
});

test('BF: die vier eigenen Gespräche prüfen den Pfad von Spieler 2, nie den von Spieler 1', () => {
  const own = content.koop.geplauder.filter((g) => g.requires_pathway);
  assert.equal(own.length, 4);
  for (const g of own) {
    const [pid, max] = g.requires_pathway;
    const s = duo({ act: 3 });
    s.koopSeen = new Set(content.koop.geplauder.filter((x) => x.map === g.map && x.id !== g.id).map((x) => x.id));
    assert.equal(pickChat(s, g.map), null, `${g.id} ohne Pfad`);
    s.pathway = { id: pid, seq: max, digestion: 0 }; // Spieler 1 hat den Pfad: zählt nicht
    assert.equal(pickChat(s, g.map), null, `${g.id} mit p1-Pfad`);
    s.pathway = null;
    s.withPlayer(2, () => { s.pathway = { id: pid, seq: max, digestion: 0 }; }, { quiet: true });
    assert.equal(pickChat(s, g.map)?.id, g.id, `${g.id} mit p2-Pfad`);
  }
});

test('BF: Schichtgänger, Nachhall und Prüfungen haben eigene Kampfanfänge', () => {
  assert.equal(koopStartEvent('schichtgaenger', content.encounters.schichtgaenger), 'koop_schichtgaenger');
  assert.equal(koopStartEvent('nachhall', content.encounters.nachhall), 'koop_nachhall');
  assert.equal(koopStartEvent('k3p_lampengutachter', content.encounters.k3p_lampengutachter), 'koop_pruefung');
  assert.equal(koopStartEvent('kalkstaubgeist', content.encounters.kalkstaubgeist), null);
  const s = duo();
  s.setP2Look('p2b');
  assert.ok(content.koop.kampf.koop_schichtgaenger.p2b.includes(koopBark(s, 'koop_schichtgaenger', 2)));
  assert.ok(content.koop.kampf.koop_pruefung.p1.includes(koopBark(s, 'koop_pruefung', 1)));
  // wer den Kampf auslöst, ist der Prüfling; der andere spricht
  s.withPlayer(2, () => s.startCombat('k3p_lampengutachter'));
  assert.equal(s.combatBy, 2);
  s.startCombat('k3p_lampengutachter');
  assert.equal(s.combatBy, 1);
});

test('BF: elf Dunscarer Figuren bemerken die Begleitung, nur Pfiff bietet die zweite Koje', () => {
  const names = ['pfiff', 'gallowmere', 'willa', 'oren', 'mabel', 'pelham', 'nellie', 'huxford', 'esther', 'adaine', 'weichenstellerin'];
  const s = duo();
  const solo = new GameState(content);
  for (const n of names) {
    const d = content.dialogues[content.npcs[`k3_${n}`].dialogue];
    const extra = d.nodes[d.start].choices.filter((c) => c.next?.startsWith('koop_ds_reaktion_'));
    assert.equal(extra.length, 1, n);
    assert.ok(s.meets(extra[0]) && !solo.meets(extra[0]), `${n}: nur zu zweit`);
    for (const node of Object.values(d.nodes)) if (node.sets_flags?.includes('koop_ds_koje')) assert.equal(n, 'pfiff');
  }
  const pfiff = content.dialogues.k3a_pfiff;
  s.applyEffects(pfiff.nodes.koop_ds_reaktion_pfiff_antwort);
  assert.ok(s.flags.has('koop_ds_koje'));
});

test('BF: Horchen am Schwellenring über Rollenplätze, Ruf kostet eine Ladung, Erfolg öffnet den Hinterzugang', () => {
  const s = duo({ act: 2 });
  const ring = content.maps.ds_schwellenring;
  const find = (id) => ring.interactables.find((i) => i.id === id);
  assert.ok(s.meets(find('koop_ds_horchen_auftrag').visible_if));
  assert.ok(!s.meets(find('koop_ds_horchen_p1').visible_if), 'Rollenplätze erst nach Annahme');
  assert.equal(koopRoleOf('koop_ds_horchen_p1'), 1);
  assert.equal(koopRoleOf('koop_ds_horchen_p2'), 2);
  const tree = content.dialogues.koop_ds_horchen_auftrag;
  let node = s.pick(tree.start);
  const run = (d, cur, text) => {
    const c = d.nodes[cur].choices.find((x) => x.text === text && s.meets(x));
    assert.ok(c, `${cur}: ${text}`);
    const next = s.pick(c.next);
    if (next) s.applyEffects(d.nodes[next], { nodeKey: next });
    return next;
  };
  s.applyEffects(tree.nodes[node], { nodeKey: node });
  run(tree, node, 'Wir übernehmen das.');
  assert.equal(s.quests.koop_ds_horchen, 'active');
  assert.ok(s.meets(find('koop_ds_horchen_p1').visible_if));
  s.addItem('k3a_signalgeraet', 1);
  s.signal.charges = 2;
  s.flags.add('koop_ds_horchen_p1');
  s.flags.add('koop_ds_horchen_p2');
  const ruf = content.dialogues.koop_ds_horchen_ruf;
  node = s.pick(ruf.start);
  node = run(ruf, node, 'Den Depotpfiff senden. Eine Ladung.');
  assert.equal(s.signal.charges, 1);
  node = run(ruf, node, 'Spieler 2 liest die Antwort.');
  node = run(ruf, node, 'Spieler 1 wählt die gemeldete Richtung.');
  const money = s.money;
  run(ruf, node, 'Osten.');
  assert.equal(s.quests.koop_ds_horchen, 'done');
  assert.ok(s.flags.has('koop_ds_hinterzugang'));
  assert.equal(s.money - money, 40);
  assert.ok(!s.flags.has('koop_ds_horchen_p1'));
});

test('BF: die Schallschleuse wartet auf die Rufbindung (BN) und steht noch nicht in der Rufschlucht', () => {
  assert.ok(content.quests.koop_ds_schleuse);
  assert.ok(content.dialogues.koop_ds_schleuse_gang);
  const ids = Object.values(content.maps).flatMap((m) => (m.interactables ?? []).map((i) => i.id));
  assert.ok(!ids.some((id) => id.startsWith('koop_ds_schleuse')));
  const speise = content.maps.ds_speisewagen.interactables.map((i) => i.id);
  assert.ok(!speise.includes('koop_ds_schleuse_auftrag'));
});
