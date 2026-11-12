import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';

const content = loadContent();

test('Paket AA: elf Kettlegate-Nebenaufträge und drei Steckbriefe sind im Spiel', () => {
  const kg = Object.keys(content.quests).filter((id) => id.startsWith('kg_'));
  assert.equal(kg.length, 14);
  for (const id of kg) assert.equal(content.quests[id].kind, 'side', id);
  // Zusatzoptionen stehen vor der Abschiedsoption, die neuen Knoten hängen am selben Dialog
  const martha = content.dialogues[content.npcs.waescherin.dialogue];
  assert.ok(martha.nodes.start.choices.some((c) => c.next?.startsWith('kg_')));
  assert.ok(!martha.nodes.start.choices.at(-1).next?.startsWith('kg_'));
  // Verhaftete Figuren verschwinden von ihrem alten Platz
  const erbe = Object.values(content.maps).flatMap((m) => m.npcs ?? []).find((n) => n.id === 'erbe' && !n.visible_if?.requires_flags?.includes('case_08_closed'));
  assert.ok(erbe.visible_if.hide_if_flags.includes('edmund_arrested'));
  // Neue Fundstellen liegen auf den Karten
  assert.ok(content.maps.ashgrove.interactables.some((i) => i.id === 'kg_hemd'));
});

test('Paket AA: Martha bietet nach Fall 5 den Waschtag an', () => {
  const s = new GameState(content);
  s.flags.add('case_05_closed');
  const d = content.dialogues[content.npcs.waescherin.dialogue];
  const start = s.pickStart ? s.pickStart(d) : 'start';
  const choices = d.nodes[start].choices.filter((c) => s.meets(c));
  assert.ok(choices.some((c) => c.next?.startsWith('kg_')), 'Option für den neuen Auftrag sichtbar');
});

test('Paket AB: zehn Wexmoor-Nebenaufträge und sechs Kahn-Ausbauten sind im Spiel', () => {
  const k2n = Object.keys(content.quests).filter((id) => id.startsWith('k2n_'));
  assert.equal(k2n.length, 10);
  const kahn = content.maps.wx_kahn.interactables.filter((i) => i.id.startsWith('k2n_kahn_'));
  assert.equal(kahn.length, 6);
  for (const i of kahn) assert.ok('wO'.includes(content.maps.wx_kahn.rows[i.tile[1]][i.tile[0]]), `${i.id} steht auf dem Boden`);
});

test('Paket AB: Fahndung senken, Zunders Vertrauen und die Wirkungen des Kahn-Ausbaus', () => {
  const s = new GameState(content);
  s.setWanted(2, '');
  s.applyEffects({ wanted: -1 });
  assert.equal(s.wanted, 1);
  s.applyEffects({ wanted: -3 });
  assert.equal(s.wanted, 0);
  s.applyEffects({ bond: { zunder: 3 } });
  assert.equal(s.bond('zunder'), 3);
  // Reetmatten: Salzbrot im Kahn gibt 3 Nerven extra, anderswo nicht
  s.map = 'wx_kahn';
  s.flags.add('k2n_kahn_reet');
  s.addItem('salzbrot', 2);
  s.setComposure(50);
  const before = s.composure;
  s.useItem('salzbrot');
  const inKahn = s.composure - before;
  s.map = 'wx_salzmarkt';
  s.setComposure(50);
  s.useItem('salzbrot');
  assert.equal(inKahn - (s.composure - 50), 3);
  // Waschtisch: nur für Beyonder, nur im Kahn
  s.map = 'wx_kahn';
  s.flags.add('k2n_kahn_waschtisch');
  assert.equal(s.kahnRestBonus(), 0, 'kein Beyonder');
  s.pathway = { id: 'laterne', seq: 9, digestion: 0 };
  s.setUnruhe(12);
  assert.equal(s.kahnRestBonus(), 5);
  assert.equal(Math.round(s.unruhe), 7);
});

test('Paket AD: Itemtexte, Lesestücke, Bestiarium und Gerede sind im Spiel', () => {
  assert.ok(content.items.schlagstock.desc.startsWith('Am Griff glänzt'));
  assert.ok(content.maps.revier.interactables.some((i) => i.id === 'lore_staubordnung'));
  assert.ok(content.bestiaryTexts.sparring.hinweis);
  assert.ok(content.gossip.kettlegate.altmarkt.length > 3);
  assert.equal(content.newspapers.length, 42 + 12 + 9 + 8 + 26 + 2 + 36 + 3 + 9 + 8 + 9 + 8 + 12 + 12 + 18 + 20 + 3 + 4 + 3); // DG: Haus-Meldungen // DE: 4 Wagen-Meldungen // DF: 3 Tier-Meldungen // DR: 5 Seq-4-Meldungen je Stadtblatt (4) // Runde 9: Fasserin-Aufträge (CR) + Halbgott (CP) // CN: 12 Meldungen des Nebelboten // Runde 8: Anzeiger (CC + CF), Kurblatt (CG + CJ), Feste (CK) // 12 Meldungen aus Paket AL, 9 + 8 Ausgaben des Kalkblatts (Kapitel 3, AR + AT), 20 Meldungen + 6 Anzeigen (BD), 2 Zunftwarnungen (BO), 36 Sekten-Meldungen (BQ)
});

test('Paket AD: eine Zeitungsausgabe erscheint mit dem Fallende und bleibt im Archiv', () => {
  const s = new GameState(content);
  const seen = [];
  s.on('newspaper', (p) => seen.push(p.id));
  s.applyEffects({ sets_flags: ['case_01_closed', 'elias_rescued'] });
  assert.deepEqual(seen, ['lore_kurier_c1_good']);
  const save = JSON.parse(JSON.stringify(s.serialize(null)));
  const t = new GameState(content);
  t.load(save);
  assert.deepEqual(t.paperArchive().map((p) => p.id), ['lore_kurier_c1_good']);
  // Alte Spielstände ohne Archiv bekommen die schon passenden Ausgaben still nachgetragen
  delete save.papers;
  const u = new GameState(content);
  u.load(save);
  assert.equal(u.papers.length, 1);
});
