// Sequenz 4 = Halbgott, Sequenz 2 = Engel (Seb, 2026-11-11): brutale Durchbrüche, schwere Rituale mit Schwellenwächter,
// Aufstiegs-Szene beim Trinken und die mythische Gestalt, vor der Nicht-Beyonder und schwächere Wesen zusammenbrechen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { HOCH_DURCHBRUCH, HALBGOTT_EIGENHEIT, HOCH_RITUAL, ASCENSION_TEXT, FORM_MIN_DIGEST, FORM_MIN_NERVES, HG_FORMS, ordealId, ordealFlag, SEQ_GROWTH_STEPS } from '../src/core/Pathways.js';
import { encounterSeq } from '../src/core/Fear.js';
import { loadContent, fight, EXPERT, SKILLED } from './helpers.js';

const content = loadContent();
const hero = (seq, pid = 'eisen', weapon = 'revolver') => {
  const s = new GameState(content);
  s.addItem(weapon);
  s.weapon = weapon;
  s.addItem('verband', 4);
  s.addItem('tonikum', 3);
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  return s;
};

test('Durchbrüche: Sequenz 4 und 2 sind brutale Sprünge, 3 und 1 gute; jeder Pfad trägt sie samt Eigenheit', () => {
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const n of [4, 3, 2, 1]) {
      const keys = p.seqs[n].passives.map((x) => x.key);
      for (const want of HOCH_DURCHBRUCH[n].passives) assert.ok(keys.includes(want.key), `${pid} Seq ${n}: ${want.key}`);
      assert.equal(p.seqs[n].durchbruch, HOCH_DURCHBRUCH[n].titel);
    }
    assert.ok(p.seqs[4].passives.some((x) => x.text === HALBGOTT_EIGENHEIT[pid].text), `${pid}: Eigenheit`);
  }
  // Schaden und Wehrhaftigkeit: 5 → 4 und 3 → 2 sind die großen Sprünge, 4 → 3 und 2 → 1 kleinere
  const dmg = (seq) => hero(seq).passive('dmg_mult');
  const taken = (seq) => hero(seq).passive('damage_taken');
  assert.ok(dmg(4) / dmg(5) >= 1.5 && taken(4) / taken(5) <= 0.75, 'Halbgott');
  assert.ok(dmg(2) / dmg(3) >= 1.5 && taken(2) / taken(3) <= 0.75, 'Engel');
  assert.ok(dmg(3) / dmg(4) < 1.3 && dmg(1) / dmg(2) < 1.3, 'dazwischen moderat');
  assert.ok(SEQ_GROWTH_STEPS[4] >= 4 && SEQ_GROWTH_STEPS[2] >= 4);
  assert.ok(hero(4).maxHp - hero(5).maxHp >= 50, `Leben 5 → 4: ${hero(5).maxHp} → ${hero(4).maxHp}`);
  assert.ok(hero(2).maxHp - hero(3).maxHp >= 60, `Leben 3 → 2: ${hero(3).maxHp} → ${hero(2).maxHp}`);
  const hit = (seq) => new Combat(hero(seq), 'rook_fight').hitDamage(1, 'good');
  assert.ok(hit(4) >= hit(5) * 1.5 && hit(2) >= hit(3) * 1.5, 'Treffer');
});

test('Rituale 4 bis 1: Tribut, Siege, Schlussfolgerungen, Nerven; 4 und 2 verlangen den Schwellenwächter', () => {
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const n of [4, 3, 2, 1]) {
      const r = p.seqs[n].ritual;
      assert.equal(r.tribute, HOCH_RITUAL[n].tribute, `${pid} ${n}: Tribut`);
      assert.equal(r.requires.min_wins, HOCH_RITUAL[n].min_wins, `${pid} ${n}: Siege`);
      if (n === 4) { // Seq-4-Prüfungen (core/Seq4.js): ortsunabhängig, ohne Fallbedingung
        assert.ok(r.hg && !r.map && !r.also_maps && !r.requires.requires_flags, `${pid} 4: Halbgott-Prüfung ohne Ort und Fall`);
      } else { // Seq 3 bis 1 (core/SeqHoch.js): Prüfung aus Schritten, ortsunabhängig, ohne Fallbedingung
        assert.ok(r.hoch?.steps?.length && !r.map && !r.requires.requires_flags, `${pid} ${n}: Prüfung ohne Ort und Fall`);
        if (n === 2) assert.ok(r.hoch.steps.some((s) => s.type === 'waechter') && r.hoch.welt, `${pid} 2: Weltwandel und Grenzwächter`);
        if (n === 1) assert.ok(!r.hoch.steps.some((s) => ['kampf', 'waechter'].includes(s.type)), `${pid} 1: ohne Gegner`);
      }
      if (n === 2) {
        const enc = content.encounters[ordealId(pid, n)];
        assert.ok(enc?.boss && enc.waechter === 'hg_grenzwaechter', `${pid} 2: Grenzwächter`);
      }
      if (n === 4) {
        assert.ok(r.ordeal && r.min_conclusions && r.min_nerves, `${pid} ${n}: schweres Ritual`);
        const enc = content.encounters[ordealId(pid, n)];
        assert.ok(enc?.boss && enc.occult && enc.hp >= 400 && enc.max_round_dmg, `${pid} ${n}: Schwellenwächter`);
        assert.ok(enc.name.includes(p.name.replace(/^Pfad (der|des) /, '')), enc.name);
        assert.equal(enc.waechter, n === 4 ? 'hg_schwellenwaechter' : 'hg_grenzwaechter');
        assert.equal(ordealId(pid, n), `${enc.waechter}_${pid}`);
      } else assert.ok(!r.ordeal); // Seq 2: der Grenzwächter ist der letzte Schritt der Prüfung
    }
  }
});

test('Schweres Ritual: erst steht alles, dann tritt der Schwellenwächter an, nach dem Sieg lässt sich das Ritual vollenden', () => {
  const s = hero(5, 'laterne');
  const steps0 = s.ritualSteps('laterne', 4);
  assert.ok(steps0.some((x) => x.ordeal && !x.done));
  assert.ok(steps0.some((x) => /600 Schilling/.test(x.text)) && steps0.some((x) => /40 Kämpfe/.test(x.text)) && steps0.some((x) => /10 Schlussfolgerungen/.test(x.text)));
  // Alles außer dem Wächter erfüllen
  for (const f of ['kapitel2_done', 'k3p_laterne_done']) s.flags.add(f);
  s.map = 'ds_kalkmarkt';
  s.addItem('nebeltau', 2); s.addItem('silberstaub', 1); s.addItem('trank_laterne_4');
  s.spiritVision = true;
  s.wins = 40;
  s.money = 600;
  s.composure = s.maxComposure();
  s.conclusions = Array.from({ length: 10 }, (_, i) => `c${i}`);
  // Seq 4 (core/Seq4.js): der Wächter kommt nur aus der Prüfung heraus, nicht über den Ritualknopf
  assert.ok(s.ritualSteps('laterne', 4).filter((x) => !x.done).every((x) => x.hg));
  const first = s.performRitual();
  assert.equal(first.ok, false);
  assert.equal(first.fight, undefined);
  assert.match(first.text, /Prüfung/);
  assert.equal(s.ritualDone('laterne', 4), false);
  assert.equal(s.itemCount('nebeltau'), 2, 'noch nichts verbraucht');
  // Der Wächter (2500 Leben, Seb 2026-11-12) ist für Sequenz 5 nur voll ausgerüstet und mit Übung zu schaffen, für Sequenz 6 gar nicht
  // (Maßstab: Pfad des Eisens, Ossuarklinge, Wuchtschlag in Ketten, fünf Tonika)
  const kit = (seq) => { const h = hero(seq); h.addItem('ossuarklinge'); h.equip('ossuarklinge'); h.removeItem('verband', 4); h.addItem('tonikum', 2); h.pathway.digestion = 100; h.updateMaxHp(); h.hp = h.maxHp; return h; };
  const play = (defend) => ({ defend, skill: 'wuchtschlag', chain: true, healBelow: 25 });
  assert.equal(fight(kit(6), ordealId('eisen', 4), play(EXPERT)).result.outcome, 'lost');
  const won = fight(kit(5), ordealId('eisen', 4), play(EXPERT));
  assert.equal(won.result.outcome, 'won');
  assert.ok(won.combat.round >= 25, `lange Prüfung: ${won.combat.round} Runden`);
  assert.equal(fight(kit(5), ordealId('eisen', 4), play(SKILLED)).result.outcome, 'lost', 'ohne Übung nicht');
  s.flags.add(s.hgFlag('laterne'));
  const done = s.performRitual();
  assert.equal(done.ok, true, done.text);
  assert.ok(s.ritualDone('laterne', 4) && s.money === 0 && s.itemCount('nebeltau') === 0);
  assert.equal(s.drinkCheck('trank_laterne_4').ok, true);
  // Der Schwellenrichter der Sequenz 2 ist für Sequenz 3 die gleiche Hürde
  assert.equal(fight(hero(3), ordealId('eisen', 2), { defend: EXPERT, skill: 'double', healBelow: 20 }).result.outcome, 'won');
  assert.equal(fight(hero(4), ordealId('eisen', 2), { defend: SKILLED, skill: 'double', healBelow: 20 }).result.outcome, 'lost');
});

test('Trinken auf Sequenz 4 und 2: Halbgott- und Engel-Text samt Aufstiegs-Szene, dazwischen der gewohnte Trank', () => {
  const drinkTo = (seq) => {
    const s = hero(seq + 1, 'eisen');
    s.pathway.digestion = 100;
    s.flags.add(`ritual_eisen_${seq}`);
    s.addItem(`trank_eisen_${seq}`);
    const r = s.drink(`trank_eisen_${seq}`, () => 0.99);
    assert.equal(r.ok, true, r.text);
    assert.ok(s.flags.has(`seq${seq}_erreicht`), `seq${seq}_erreicht (Merker für Zeitung und Gerede)`);
    return r;
  };
  const halb = drinkTo(4);
  assert.equal(halb.ascension?.title, 'Halbgott');
  assert.equal(halb.ascension.color, content.pathways.eisen.color);
  assert.match(halb.text, /Halbgott/);
  assert.match(halb.text, new RegExp(`${FORM_MIN_DIGEST} % Verdauung`));
  assert.match(halb.text, /Sequenz 4: Lastnieter/);
  assert.equal(drinkTo(3).ascension, null);
  const engel = drinkTo(2);
  assert.equal(engel.ascension?.title, 'Engel');
  assert.match(engel.text, /Engel/);
  assert.deepEqual(Object.keys(ASCENSION_TEXT).map(Number), [2, 4]);
  // Das Ereignis trägt die Szene für die Welt
  const s = hero(5, 'kessel');
  s.pathway.digestion = 100;
  s.flags.add('ritual_kessel_4');
  s.addItem('trank_kessel_4');
  let got = null;
  s.on('ascend', (e) => { got = e; });
  s.drink('trank_kessel_4', () => 0.99);
  assert.equal(got?.ascension?.seq, 4);
});

test('Mythische Gestalt: ab Sequenz 4 und halber Verdauung; Nicht-Beyonder und schwächere Wesen brechen zusammen, Bosse und höhere Wesen nicht', () => {
  const s = hero(5, 'maske');
  assert.match(s.formBlock(), /Sequenz 4/);
  s.pathway = { id: 'maske', seq: 4, digestion: 10 };
  s.updateMaxHp();
  assert.match(s.formBlock(), /Hälfte verdaut/);
  assert.equal(s.toggleForm().ok, false);
  s.pathway.digestion = FORM_MIN_DIGEST;
  assert.equal(s.formBlock(), null);
  const on = s.toggleForm();
  assert.ok(on.ok && on.active && s.formActive());
  assert.match(on.text, /Hundertmiene/);
  assert.equal(s.formDef().id, 'hg_form_maske');
  assert.deepEqual(Object.keys(HG_FORMS).sort(), Object.keys(content.pathways).sort());
  assert.ok(s.flags.has('kreaturform_an') && s.flags.has('kreaturform_gezeigt_1'));
  // Wer fällt um: Menschen ohne Pfad (Stadtgegner), Wexmoorer und Dunscarer Monster; nicht: Bosse, höhere Wesen, Calderwick (Stufe 5 gegen Seq 4)
  const human = Object.keys(content.encounters).find((id) => content.encounters[id].city && !content.encounters[id].occult && !content.encounters[id].boss);
  assert.ok(human, 'ein menschlicher Stadtgegner');
  assert.equal(s.awes(human), true, human);
  assert.equal(s.awes('schichtgaenger'), true, 'Dunscarer Laufgegner (Stufe 6)');
  assert.equal(s.awes('vg_cw_letternlaeufer'), false, 'Calderwick ist Stufe 5: nur eine Sequenz unter dir');
  assert.equal(s.awes('vg_bh_glasmotte'), false, 'Briarholt Stufe 4');
  assert.equal(s.awes('vielrufer'), false, 'Boss');
  assert.equal(s.awes('starling_fight'), false, 'höheres Wesen (min_seq)');
  assert.equal(s.awes('sabeth_practice'), false, 'Übungskampf');
  assert.equal(encounterSeq(content.encounters.vg_cw_letternlaeufer, content), 5);
  assert.equal(encounterSeq(content.encounters.vg_bh_glasmotte, content), 4);
  assert.equal(encounterSeq(content.encounters.vielrufer, content), 4, 'Dunscarer Boss in einem Gebiet der Stufe 5');
  // Auf Sequenz 3 fallen auch die Calderwicker, auf 2 die Briarholter
  s.pathway.seq = 3;
  assert.equal(s.awes('vg_cw_letternlaeufer'), true);
  assert.equal(s.awes('vg_bh_glasmotte'), false);
  s.pathway.seq = 2;
  assert.equal(s.awes('vg_bh_glasmotte'), true);
  // Ein Sieg ohne Kampf zählt wie ein Sieg: Flagge, Verdauung
  const c = new Combat(s, human);
  c.outcome = 'won';
  const r = c.finish();
  assert.equal(r.outcome, 'won');
  assert.ok(s.flags.has(`won_${human}`));
  // Die Gestalt zehrt und fällt ab, wenn die Nerven ausgehen
  s.pathway.seq = 4;
  const nerves = s.composure;
  s.tick(10);
  assert.ok(s.composure < nerves - 10, 'zehrt an den Nerven');
  s.composure = FORM_MIN_NERVES - 1;
  s.tick(1);
  assert.equal(s.formActive(), false, 'fällt ab');
  assert.ok(!s.flags.has('kreaturform_an') && s.flags.has('kreaturform_gezeigt'));
  // Ablegen von Hand und Spielstand
  s.composure = s.maxComposure();
  assert.ok(s.toggleForm().active);
  const data = s.serialize({ map: 'altmarkt', x: 0, y: 0 });
  const t = new GameState(content);
  t.load(data);
  assert.equal(t.formActive(), true);
  assert.ok(t.toggleForm().ok && !t.formActive());
});

test('Kapitel 4/5 auf Halbgott-Stärke: jeder Vorratsgegner ist skaliert, Calderwick ab Sequenz 4, Briarholt ab Sequenz 3 zu schaffen', () => {
  const vg = Object.entries(content.encounters).filter(([id]) => id.startsWith('vg_'));
  assert.ok(vg.length >= 40);
  for (const [id, e] of vg) {
    assert.ok(e.halbgott_skaliert && e.max_round_dmg && e.tier_seq, id);
    assert.ok(e.hp >= 350 && e.armor >= 3, `${id}: ${e.hp} Leben, Panzer ${e.armor}`);
  }
  const bh = vg.filter(([id, e]) => /^vg_bh_/.test(id) && !e.boss && !e.elite);
  let won = 0;
  for (const [id] of bh) if (fight(hero(3), id, { defend: EXPERT, skill: 'double', healBelow: 20 }).result.outcome === 'won') won++;
  assert.equal(won, bh.length, `Briarholt mit Sequenz 3: ${won} von ${bh.length}`);
  assert.equal(fight(hero(5), 'vg_bh_glasmotte', { defend: EXPERT, skill: 'double', healBelow: 20 }).result.outcome, 'lost', 'Briarholt ist nichts für Sequenz 5');
  assert.equal(fight(hero(2), 'vg_bh_boss_glasgaertner', { defend: EXPERT, skill: 'double', healBelow: 20 }).result.outcome, 'won', 'ein Engel schafft den Glasgärtner');
});
