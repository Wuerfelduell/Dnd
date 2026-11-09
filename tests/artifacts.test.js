// Sequenzen 6 und 5, Wachstum von Leben und Nerven, Artefakte und die Ausgabe des Reviers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { SEQ_MAX } from '../src/core/Pathways.js';
import { loadContent, talk } from './helpers.js';

const content = loadContent();
const never = () => 0.999;

/** Formeln ab Sequenz 7 hat Kittering nur selten: Spielzeit auf eine Runde stellen, in der er sie anbietet. */
function withOffer(s, merchant, item) {
  const round = content.gatherings.rules.interval_min * 60;
  for (let c = 0; c < 2000; c++) {
    s.playTime = c * round;
    if (s.shopStock(merchant).some((e) => e.item === item)) return s.shopStock(merchant).find((e) => e.item === item);
  }
  throw new Error(`${merchant} bietet ${item} nie an`);
}

/** Kauft Formel und Zutaten bei den Händlern und braut (Geld und Ansehen werden aufgefüllt). */
function brew(s, pid, seq) {
  s.money = 5000;
  s.honor = Math.max(s.honor, 75);
  withOffer(s, 'kittering', `formel_${pid}_${seq}`);
  assert.equal(s.buy('kittering', `formel_${pid}_${seq}`).ok, true, `Formel ${pid} ${seq}`);
  for (const [id, n] of Object.entries(content.items[`formel_${pid}_${seq}`].ingredients)) {
    const shop = ['nell', 'kittering'].find((m) => s.shopStock(m).some((e) => e.item === id));
    // Zutaten ab Sequenz 7 gibt es nur auf geheimen Treffen oder als Beute
    if (!shop) { s.addItem(id, n); continue; }
    for (let i = 0; i < n; i++) assert.equal(s.buy(shop, id).ok, true, `Zutat ${id} (Sequenz ${seq})`);
  }
  assert.equal(s.brew(`formel_${pid}_${seq}`).ok, true);
  return `trank_${pid}_${seq}`;
}

const digestAll = (s) => { s.pathway.digestion = 100; };

test('Jeder Pfad lässt sich bis Sequenz 5 brauen und trinken, Leben und Nerven wachsen mit', () => {
  assert.equal(SEQ_MAX, 5);
  for (const pid of Object.keys(content.pathways)) {
    const s = new GameState(content);
    let lastHp = s.maxHp;
    let lastNerves = s.maxComposure();
    assert.equal(lastNerves, 100);
    for (const seq of [9, 8, 7, 6, 5]) {
      const potion = brew(s, pid, seq);
      if (s.pathway) digestAll(s);
      assert.equal(s.drink(potion, never).ok, true, `${pid} ${seq}`);
      assert.equal(s.pathway.seq, seq);
      assert.ok(s.maxHp > lastHp, `${pid} ${seq}: mehr Leben (${s.maxHp})`);
      assert.ok(s.maxComposure() > lastNerves, `${pid} ${seq}: mehr Nerven (${s.maxComposure()})`);
      lastHp = s.maxHp;
      lastNerves = s.maxComposure();
    }
    // Alle fünf Fähigkeiten im Kampf verfügbar
    assert.equal(Object.keys(s.pathwaySkills()).length, 5, pid);
    const c = new Combat(s, 'moorleiche');
    c.ap = 6;
    for (const id of Object.keys(s.pathwaySkills())) assert.ok(c.skillDef(id), id);
    // Weiter als Sequenz 5 geht es nicht
    digestAll(s);
    assert.match(s.pathwayReport(), /Weiter kommst du hier unten nicht/);
  }
});

test('Sequenz 6 und 5: Formeln erst mit Rang, nur für den eigenen Pfad; Verdauen wird langsamer', () => {
  const s = new GameState(content);
  for (const seq of [9, 8, 7]) { const p = brew(s, 'eisen', seq); if (s.pathway) digestAll(s); s.drink(p, never); }
  s.honor = 40;
  const f6 = withOffer(s, 'kittering', 'formel_eisen_6');
  assert.ok(f6.locked, 'Sequenz 6 erst ab Vertrauter des Reviers');
  assert.ok(!s.shopStock('kittering').some((e) => e.item === 'formel_laterne_6'), 'fremde Pfade unsichtbar');
  s.honor = 55;
  assert.ok(!s.shopStock('kittering').find((e) => e.item === 'formel_eisen_6').locked);
  assert.ok(withOffer(s, 'kittering', 'formel_eisen_5').locked, 'Sequenz 5 braucht Sequenz 6');
  const at7 = s.digestTable().find((r) => r.kind === 'combat_win').points;
  digestAll(s);
  s.drink(brew(s, 'eisen', 6), never);
  const at6 = s.digestTable().find((r) => r.kind === 'combat_win').points;
  assert.ok(at6 < at7, `Sequenz 6 verdaut langsamer (${at6} < ${at7})`);
});

test('Hammerfall und Unbeugsam funktionieren im Kampf', () => {
  const s = new GameState(content);
  for (const seq of [9, 8, 7, 6, 5]) { const p = brew(s, 'eisen', seq); if (s.pathway) digestAll(s); s.drink(p, never); }
  const c = new Combat(s, 'moorleiche');
  c.ap = 6;
  const r = c.useSkill('unbeugsam', []);
  assert.equal(c.shield, 30);
  assert.ok(r.effects.some((e) => e.includes('Schutz')));
  c.ap = 6;
  const h = c.useSkill('hammerfall', ['good', 'good']);
  assert.ok(h.total > 0);
  assert.equal(c.stunned || c.outcome === 'won', true);
});

test('Artefakte: höchstens drei, Vorteile und Nachteile wirken, Anlegen bringt Unruhe, Ablegen kostet Nerven', () => {
  const s = new GameState(content);
  const arts = Object.keys(content.artifacts.list);
  assert.ok(arts.length >= 10);
  for (const id of arts) {
    const it = content.items[id];
    assert.equal(it.kind, 'artifact');
    assert.ok(it.boons.length && it.curses.length, `${id}: Vor- und Nachteile`);
  }
  const atk = s.weaponStats().atk;
  s.addItem('zahnkette');
  assert.equal(s.equipArtifact('zahnkette').ok, true);
  assert.equal(s.weaponStats().atk, atk + 2, 'Vorteil: +2 Angriff');
  assert.equal(s.unruhe, 10, 'Anlegen bringt Unruhe');
  assert.equal(s.maxHp, 50, '+10 Leben');
  // Nachteil: 30 % mehr Schaden
  s.hp = s.maxHp;
  assert.equal(s.damage(10), 13);
  for (const id of ['knochenwuerfel', 'kupferkrone', 'wachshand']) s.addItem(id);
  assert.equal(s.equipArtifact('knochenwuerfel').ok, true);
  assert.equal(s.equipArtifact('kupferkrone').ok, true);
  assert.equal(s.maxComposure(), 65, 'Kupferkrone: -35 Nerven');
  assert.ok(s.composure <= 65);
  const fourth = s.equipArtifact('wachshand');
  assert.equal(fourth.ok, false, 'viertes Artefakt verboten');
  assert.match(fourth.text, /Mehr als 3/);
  // Mehrere Artefakte streiten sich: Unruhe steigt von selbst
  assert.ok(s.artifactUnruhe() > 0);
  const u = s.unruhe;
  s.tick(10);
  assert.ok(s.unruhe > u, 'Unruhe steigt auch ohne Pfad');
  // Preise: Knochenwürfel macht teurer
  const plain = new GameState(content);
  assert.ok(s.shopStock('gorse')[0].price > plain.shopStock('gorse')[0].price);
  const nerves = s.composure;
  assert.equal(s.unequipArtifact('kupferkrone').ok, true);
  assert.equal(s.composure, nerves - 15, 'Ablegen kostet Nerven');
  assert.equal(s.equipArtifact('wachshand').ok, true, 'jetzt ist wieder Platz');
  // Verkaufen legt es ab
  s.removeItem('zahnkette');
  assert.ok(!s.isArtifactActive('zahnkette'));
});

test('Artefakte bleiben beim Speichern erhalten', () => {
  const s = new GameState(content);
  s.addItem('stille_glocke');
  s.equipArtifact('stille_glocke');
  const hp = s.maxHp;
  const t = new GameState(content);
  assert.equal(t.load(JSON.parse(JSON.stringify(s.serialize()))), true);
  assert.deepEqual(t.artifacts, ['stille_glocke']);
  assert.equal(t.maxHp, hp);
});

test('Asservatenkammer: ausleihen nach Rang, nicht verkaufen, zurückgeben; Kontrollverlust kostet Ansehen', () => {
  const s = new GameState(content);
  s.honor = 10;
  assert.equal(s.borrowLimit(), 0);
  assert.ok(s.vaultStock().every((e) => e.locked));
  s.honor = 36;
  assert.equal(s.borrowLimit(), 1);
  const stock = s.vaultStock();
  assert.ok(stock.find((e) => e.id === 'rahmenloser_spiegel').locked, 'Spiegel erst ab Geachteter Ermittler');
  assert.equal(s.borrowArtifact('richterhammer').ok, true);
  assert.equal(s.itemCount('richterhammer'), 1);
  assert.equal(s.borrowArtifact('uhr_ertrunkener').ok, false, 'Limit erreicht');
  assert.equal(s.sellPrice('richterhammer'), null, 'Revier-Eigentum ist unverkäuflich');
  s.equipArtifact('richterhammer');
  // Nachteil: doppelter Ansehensverlust
  s.addHonor(-2, 'Test');
  assert.equal(s.honor, 32);
  s.honor = 40;
  s.loseControl('Test');
  assert.equal(s.honor, 34, 'Kontrollverlust mit Revier-Artefakt: -3 Ansehen, durch den Richterhammer verdoppelt');
  assert.equal(s.returnArtifact('richterhammer').ok, true);
  assert.equal(s.itemCount('richterhammer'), 0);
  assert.deepEqual(s.artifacts, []);
});

test('Gefahrengebiete: Gegner können Artefakte fallen lassen, Bosse häufiger', () => {
  const drops = (id) => content.loot[id].drops.filter((d) => content.items[d.item]?.kind === 'artifact');
  for (const zid of Object.keys(content.zones)) {
    const encs = Object.values(content.encounters).filter((e) => e.zone === zid);
    assert.ok(encs.length);
    const boss = Object.keys(content.encounters).find((id) => content.encounters[id].zone === zid && content.encounters[id].boss);
    const normal = Object.keys(content.encounters).find((id) => content.encounters[id].zone === zid && !content.encounters[id].boss && !content.encounters[id].elite);
    const sum = (id) => drops(id).reduce((n, d) => n + d.chance, 0);
    assert.ok(sum(normal) > 0 && sum(normal) < 0.05, `${zid}: seltener Drop`);
    assert.ok(sum(`${normal}_elite`) > sum(normal), `${zid}: Elite häufiger`);
    assert.ok(sum(boss) >= 0.25, `${zid}: Boss häufiger`);
  }
  // Nebelherz für Sequenz 5 fällt bei späten Bossen
  assert.ok(content.loot.sternhirsch.drops.some((d) => d.item === 'nebelherz'));
});

test('Revier: Dr. Varga gibt Tränke für Laterne, Faden und Eisen nach gelösten Fällen aus', () => {
  const s = new GameState(content);
  assert.deepEqual(content.revierSupply.pathways, ['laterne', 'faden', 'eisen']);
  let offers = s.revierOffers();
  assert.equal(offers.length, 3);
  assert.ok(offers.every((o) => o.seq === 9 && o.locked));
  s.quests.case_01 = 'done';
  assert.equal(s.takeRevierPotion('faden').ok, true);
  assert.equal(s.itemCount('trank_faden_9'), 1);
  assert.equal(s.takeRevierPotion('faden').ok, false, 'jede Stufe nur einmal');
  s.drink('trank_faden_9', never);
  offers = s.revierOffers();
  assert.deepEqual(offers.map((o) => [o.pathway, o.seq]), [['faden', 8]]);
  assert.ok(offers[0].locked, 'Sequenz 8 erst nach Fall 2');
  s.quests.case_02 = 'done';
  assert.equal(s.takeRevierPotion('faden').ok, true);
  // Fremde Pfade bekommen nichts
  const m = new GameState(content);
  m.addItem('trank_maske_9');
  m.drink('trank_maske_9', never);
  assert.deepEqual(m.revierOffers(), []);
});

test('Revier-Dialoge öffnen Asservatenkammer und Gutachterin', () => {
  const s = new GameState(content);
  assert.ok(content.dialogues.thale.nodes.start.choices.some((c) => c.vault));
  assert.ok(content.dialogues.varga.nodes.start.choices.some((c) => c.expert));
  talk(s, 'varga', ['Sequenzen', 'Welcher Fall']);
  const wing = content.maps.revier_fluegel;
  for (const id of ['thale', 'varga']) {
    assert.ok(wing.npcs.some((n) => n.id === id), `${id} steht im Revierflügel`);
    assert.ok(content.npcs[id]);
  }
});
