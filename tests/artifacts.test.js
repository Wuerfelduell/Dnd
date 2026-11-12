// Sequenzen 6 und 5, Wachstum von Leben und Nerven, Artefakte und die Ausgabe des Reviers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { SEQ_MAX, ordealFlag } from '../src/core/Pathways.js';
import { loadContent, talk, passTrial } from './helpers.js';

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
  s.honor = Math.max(s.honor, 165); // Formeln für 4 bis 1 verlangen bis zu 160 Ehre
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

/** Erfüllt alle Bedingungen des Rituals für die nächste Sequenz und vollzieht es (ab Sequenz 6). */
function ritual(s, pid, seq) {
  const r = s.ritualDef(pid, seq);
  if (!r) return;
  s.map = r.map === 'wx_zelle' ? 'buero' : 'wx_zelle'; // Aufstieg auch fern vom überlieferten Ritualort.
  for (const [id, n] of Object.entries(r.consumes ?? {})) s.addItem(id, n);
  if (r.vision) s.spiritVision = true;
  s.composure = s.maxComposure();
  if (r.max_hp_pct) s.hp = Math.floor(s.maxHp * r.max_hp_pct);
  if (r.min_conclusions) s.conclusions = content.deductions.slice(0, r.min_conclusions).map((d) => d.id);
  if (r.requires?.min_wins) s.wins = r.requires.min_wins;
  for (const f of r.requires?.requires_flags ?? []) s.flags.add(f);
  if (r.tribute) s.money += r.tribute;
  if (r.ordeal) s.flags.add(ordealFlag(pid, seq)); // Schwellenwächter (Sequenz 4 und 2) gilt als besiegt
  // Seq 6, ortsunabhängig (Seb 2026-11-12): Probe bestanden, Betrug aufgedeckt, Schloss geknackt
  if (r.probe) s.flags.add(s.probeFlag(pid, seq));
  if (r.fraud) s.flags.add(s.fraudFlag(pid, seq));
  if (r.min_picks) s.picks = r.min_picks;
  if (r.trial) passTrial(s, r.trial); // Seq 5 (Seb 2026-11-12): die Prüfung des Pfads gilt als bestanden
  if (r.hg) s.flags.add(s.hgFlag(pid)); // Seq 4: die Halbgott-Prüfung samt Wächter gilt als bestanden
  const res = s.performRitual();
  assert.equal(res.ok, true, `${pid} ${seq}: ${res.text}`);
  s.spiritVision = false;
}

/** Trinkt den nächsten Trank (verdaut vorher, Ritual falls nötig). */
function ascend(s, pid, seq) {
  const potion = brew(s, pid, seq);
  if (s.pathway) digestAll(s);
  ritual(s, pid, seq);
  return s.drink(potion, never);
}

test('Jeder Pfad lässt sich bis Sequenz 1 brauen und trinken, Leben und Nerven wachsen mit', () => {
  assert.equal(SEQ_MAX, 1);
  for (const pid of Object.keys(content.pathways)) {
    const s = new GameState(content);
    let lastHp = s.maxHp;
    let lastNerves = s.maxComposure();
    assert.equal(lastNerves, 100);
    for (const seq of [9, 8, 7, 6, 5, 4, 3, 2, 1]) {
      assert.equal(ascend(s, pid, seq).ok, true, `${pid} ${seq}`);
      assert.equal(s.pathway.seq, seq);
      assert.ok(s.maxHp > lastHp, `${pid} ${seq}: mehr Leben (${s.maxHp})`);
      assert.ok(s.maxComposure() > lastNerves, `${pid} ${seq}: mehr Nerven (${s.maxComposure()})`);
      lastHp = s.maxHp;
      lastNerves = s.maxComposure();
    }
    // Alle Fähigkeiten im Kampf verfügbar: je Sequenz zwei (skill und skill2)
    assert.equal(Object.keys(s.pathwaySkills()).length, 18, pid);
    const c = new Combat(s, 'moorleiche');
    c.ap = 6;
    for (const id of Object.keys(s.pathwaySkills())) assert.ok(c.skillDef(id), id);
    // Weiter als Sequenz 1 geht es nicht
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
  ascend(s, 'eisen', 6);
  const at6 = s.digestTable().find((r) => r.kind === 'combat_win').points;
  assert.ok(at6 < at7, `Sequenz 6 verdaut langsamer (${at6} < ${at7})`);
});

test('Hammerfall und Unbeugsam funktionieren im Kampf', () => {
  const s = new GameState(content);
  for (const seq of [9, 8, 7, 6, 5]) ascend(s, 'eisen', seq);
  s.composure = s.maxComposure(); // Rituale und Tränke haben an den Nerven gezehrt
  const c = new Combat(s, 'moorleiche');
  c.ap = 6;
  const r = c.useSkill('unbeugsam', []);
  assert.equal(c.shield, 30);
  assert.ok(r.effects.some((e) => e.includes('Schutz')));
  c.ap = 6;
  const h = c.useSkill('hammerfall', ['good', 'good']);
  assert.ok(h.total > 0);
  assert.equal(c.stunned, false, 'ohne präzisen Takt keine Betäubung');
  c.ap = 6;
  c.useSkill('hammerfall', ['perfect', 'good']);
  assert.equal(c.stunned || c.outcome === 'won', true);
});

test('Artefakte wirken, sobald man sie dabei hat: Vorteile und Nachteile, Aufnehmen bringt Unruhe, viele streiten sich', () => {
  const s = new GameState(content);
  const arts = Object.keys(content.artifacts.list);
  assert.ok(arts.length >= 10);
  for (const id of arts) {
    const it = content.items[id];
    assert.equal(it.kind, 'artifact');
    assert.ok(it.boons.length && (it.curses.length || it.source === 'fest'), `${id}: Vor- und Nachteile`); // CK: Fest-Andenken sind kleine reine Vorteile
  }
  assert.equal(s.equipArtifact, undefined, 'kein Anlegen mehr');
  const atk = s.weaponStats().atk;
  s.addItem('zahnkette');
  assert.ok(s.isArtifactActive('zahnkette'), 'wirkt sofort im Inventar');
  assert.equal(s.weaponStats().atk, atk + 2, 'Vorteil: +2 Angriff');
  assert.equal(s.unruhe, 10, 'Aufnehmen bringt Unruhe');
  assert.equal(s.maxHp, 50, '+10 Leben');
  // Nachteil: 30 % mehr Schaden
  s.hp = s.maxHp;
  assert.equal(s.damage(10), 13);
  for (const id of ['knochenwuerfel', 'kupferkrone']) s.addItem(id);
  assert.equal(s.maxComposure(), 65, 'Kupferkrone: -35 Nerven');
  assert.ok(s.composure <= 65);
  // Mehrere Artefakte streiten sich: Unruhe steigt von selbst
  const three = s.artifactUnruhe();
  assert.ok(three > 0);
  const u = s.unruhe;
  s.tick(10);
  assert.ok(s.unruhe > u, 'Unruhe steigt auch ohne Pfad');
  // Ein viertes ist erlaubt, aber der Streit wird deutlich heftiger
  s.addItem('wachshand');
  assert.equal(s.activeArtifacts().length, 4);
  assert.ok(s.artifactUnruhe() - three > content.artifacts.clash_tick, 'jenseits von drei wird es teuer');
  // Preise: Knochenwürfel macht teurer
  const plain = new GameState(content);
  assert.ok(s.shopStock('gorse')[0].price > plain.shopStock('gorse')[0].price);
  // Im Büro eingelagert wirkt es nicht mehr
  assert.equal(s.storeItem('kupferkrone').ok, true);
  assert.ok(!s.isArtifactActive('kupferkrone'));
  assert.equal(s.maxComposure(), 100);
  s.retrieveItem('kupferkrone');
  assert.equal(s.maxComposure(), 65, 'wieder dabei, wirkt wieder');
  // Verkaufen/wegwerfen beendet die Wirkung
  s.removeItem('zahnkette');
  assert.ok(!s.isArtifactActive('zahnkette'));
  assert.equal(s.weaponStats().atk, atk);
});

test('Artefakte bleiben beim Speichern erhalten', () => {
  const s = new GameState(content);
  s.addItem('stille_glocke');
  const hp = s.maxHp;
  const t = new GameState(content);
  assert.equal(t.load(JSON.parse(JSON.stringify(s.serialize()))), true);
  assert.deepEqual(t.activeArtifacts(), ['stille_glocke']);
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
  // Nachteil wirkt schon, weil der Hammer in der Tasche ist: doppelter Ansehensverlust
  s.addHonor(-2, 'Test');
  assert.equal(s.honor, 32);
  s.honor = 40;
  s.loseControl('Test');
  assert.equal(s.honor, 34, 'Kontrollverlust mit Revier-Artefakt: -3 Ansehen, durch den Richterhammer verdoppelt');
  // Im Büro eingelagert bleibt es Revier-Eigentum
  s.storeItem('richterhammer');
  assert.ok(s.borrowed.includes('richterhammer'));
  s.retrieveItem('richterhammer');
  assert.equal(s.sellPrice('richterhammer'), null);
  assert.equal(s.returnArtifact('richterhammer').ok, true);
  assert.equal(s.itemCount('richterhammer'), 0);
  assert.deepEqual(s.activeArtifacts(), []);
});

test('Gefahrengebiete: Gegner können Artefakte fallen lassen, Bosse häufiger', () => {
  const drops = (id) => content.loot[id].drops.filter((d) => content.items[d.item]?.kind === 'artifact');
  for (const zid of Object.keys(content.zones)) {
    if (zid.endsWith('__warm')) continue; // Briarholt: die warme Fassung teilt Gegner und Beute mit der kalten
    const encs = Object.values(content.encounters).filter((e) => e.zone === zid);
    assert.ok(encs.length);
    const boss = Object.keys(content.encounters).find((id) => content.encounters[id].zone === zid && content.encounters[id].boss);
    // Gegner, die sich mehrere Gebiete teilen (Dunscar), gehören zum zuletzt eingetragenen; dann zählt der Gegner auf der Karte
    const normal = Object.keys(content.encounters).find((id) => content.encounters[id].zone === zid && !content.encounters[id].boss && !content.encounters[id].elite)
      ?? content.maps[zid].roamers.find((r) => !r.boss && !content.encounters[r.encounter].boss).encounter;
    const sum = (id) => drops(id).reduce((n, d) => n + d.chance, 0);
    assert.ok(sum(normal) > 0 && sum(normal) < 0.05, `${zid}: seltener Drop`);
    assert.ok(sum(`${normal}_elite`) > sum(normal), `${zid}: Elite häufiger`);
    assert.ok(sum(boss) >= 0.15, `${zid}: Boss häufiger`);
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
  // Nur bis Sequenz 7: danach gibt das Revier nichts mehr aus
  s.drink('trank_faden_8', never);
  s.quests.case_04 = 'done';
  assert.equal(s.takeRevierPotion('faden').ok, true);
  s.drink('trank_faden_7', never);
  for (const q of ['case_05', 'case_06', 'case_07', 'case_08', 'case_09']) s.quests[q] = 'done';
  offers = s.revierOffers();
  assert.deepEqual(offers.map((o) => [o.pathway, o.seq]), [['faden', 6]]);
  assert.ok(offers[0].locked && !offers[0].potion, 'Sequenz 6 nie vom Revier');
  assert.equal(s.takeRevierPotion('faden').ok, false);
  assert.deepEqual(Object.keys(content.revierSupply.seqs).sort(), ['7', '8', '9']);
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

test('Ab Sequenz 6 braucht jeder Trank ein Ritual: Ort, Zutaten, Bedingung', () => {
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const seq of ['6', '5']) {
      const r = p.seqs[seq].ritual;
      assert.ok(r?.name && r.desc, `${pid} ${seq}: Ritual mit Name und Text`);
      if (r.map) assert.ok(content.maps[r.map], `${pid} ${seq}: Ritualort ${r.map}`); // Seq 6 ist ortsunabhängig, Seq 5 nennt noch einen Ort der Überlieferung
      for (const id of Object.keys(r.consumes)) assert.ok(content.items[id], `${pid} ${seq}: ${id}`);
    }
    for (const seq of ['9', '8', '7']) assert.ok(!p.seqs[seq].ritual, `${pid} ${seq}: kein Ritual`);
  }
  const s = new GameState(content);
  for (const seq of [9, 8, 7]) assert.equal(ascend(s, 'eisen', seq).ok, true);
  const p6 = brew(s, 'eisen', 6);
  digestAll(s);
  const chk = s.drinkCheck(p6);
  assert.equal(chk.ok, false);
  assert.ok(chk.ritual);
  // Der Ort ist frei, die Verwundungsbedingung bleibt aber bestehen
  s.addItem('ochsenblut', 2);
  s.addItem('eisenkraut', 2);
  const fail = s.performRitual();
  assert.equal(fail.ok, false);
  assert.match(fail.text, /Verwundet/);
  s.map = 'wx_zelle';
  s.hp = Math.floor(s.maxHp / 2);
  const unruhe = s.unruhe;
  assert.equal(s.performRitual().ok, true);
  assert.equal(s.itemCount('ochsenblut'), 0, 'Zutaten verbraucht');
  assert.ok(s.unruhe > unruhe, 'Ritual bringt Unruhe');
  assert.equal(s.drinkCheck(p6).ok, true);
  assert.equal(s.drink(p6, never).ok, true);
  assert.equal(s.pathway.seq, 6);
  // Ritual bleibt im Spielstand
  const t = new GameState(content);
  t.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.ok(t.ritualDone('eisen', 6));
});
