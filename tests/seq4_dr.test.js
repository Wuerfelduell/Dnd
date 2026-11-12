// Codex DR: Texte der Seq-4-Rituale und Wexmoor-Einnahmen (data/seq4Dr.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, fight, seeded, talk, EXPERT, SKILLED } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { HG_FAIL_PCT } from '../src/core/Seq4.js';
import { DAY_SECONDS } from '../src/core/Clock.js';
import { DR_PCT, LOHN, ARBEIT_NERVEN } from '../src/data/seq4Dr.js';
import { HG_KIND } from '../src/data/seq4.js';

const content = loadContent();

function wexmoor({ pid = null, seq = 5 } = {}) {
  const s = new GameState(content);
  s.addItem('revolver');
  s.weapon = 'revolver';
  if (pid) s.pathway = { id: pid, seq, digestion: 100 };
  else s.pathway = { id: 'laterne', seq: 6, digestion: 100 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  s.flags.add('k2_arrived');
  s.map = 'wx_salzmarkt';
  s.rng = seeded(7);
  return s;
}

test('DR: einheitlich 17 %, Namen, Regelkarten und Meldungen für alle zehn Prüfungen', () => {
  assert.equal(DR_PCT, HG_FAIL_PCT);
  for (const [pid, kind] of Object.entries(HG_KIND)) {
    const s = wexmoor({ pid });
    const card = s.seq4Card(kind);
    assert.ok(card?.regeln.length >= 3 && card.beginn && card.erfolg, kind);
    assert.ok(!JSON.stringify(card).includes('{pct}'), `${kind}: Platzhalter`);
    assert.equal(content.pathways[pid].seqs[4].ritual.name, s.seq4Name(kind), kind);
    const g = content.encounters[`hg_schwellenwaechter_${pid}`];
    assert.ok(g.rufe?.length >= 3, `${kind}: Zwischenrufe des Wächters`);
  }
  assert.equal(content.pathways.faden.seqs[4].ritual.name, 'Das Netz der fünf Träume');
  assert.ok(!content.encounters.hg_schwellenwaechter_echo.intro.includes('„'), 'Echo: der Wächter spricht nicht');
  assert.ok(content.encounters.hg_schwellenwaechter_eisen.rufe_runde[6]);
  const s = wexmoor({ pid: 'faden' });
  assert.equal(s.seq4Msg('faden', 'kreatur_markiert', { name: 'Torfgänger', n: 2 }), 'Torfgänger markiert (2/5).');
});

test('DR: Wächterzwischenrufe kommen in geraden Runden, beim Eisen nach Rundenzahl', () => {
  const s = wexmoor({ pid: 'eisen' });
  const { combat } = fight(s, 'hg_schwellenwaechter_eisen', { defend: EXPERT, healBelow: 30, maxRounds: 2 });
  // Ansage zur überstandenen Runde n erst zu Beginn von Runde n + 1, in Runde 6 auch „jetzt tötbar“
  assert.equal(combat.ruf(1), null);
  assert.ok(combat.ruf(2).text.startsWith('Die Last zieht an Ihren Schultern'));
  assert.ok(combat.ruf(6).text.endsWith('jetzt können Sie mich töten.'));
  assert.ok(content.encounters.hg_schwellenwaechter_eisen.win_text.startsWith('„'), 'eigene Siegzeile');
  const s2 = wexmoor({ pid: 'faden' });
  const c2 = fight(s2, 'hg_schwellenwaechter_faden', { defend: EXPERT, maxRounds: 1 }).combat;
  assert.equal(c2.ruf(1), null);
  assert.equal(c2.ruf(2).text, content.encounters.hg_schwellenwaechter_faden.rufe[0]);
});

test('DR Kessel: Rezepte aus kessel_rezepte.json mit Wirkungstext', () => {
  assert.equal(content.seq4Sude.length, 5);
  for (const e of content.seq4Sude) {
    for (const id of Object.keys(e.zutaten)) assert.ok(content.items[id], `${e.id}: ${id}`);
    assert.ok(content.items[e.id].desc.includes('Getrunken'), e.id);
  }
});

test('DR Moor: das Relikt bekommt einen Namen und Moor-Eigenschaften', () => {
  const s = wexmoor({ pid: 'sq_moor' });
  const st = s.seq4();
  st.decayed = [1, 2, 3, 4, 5].map((i) => ({ id: `x${i}`, name: `Ding ${i}`, boons: [], curses: [] }));
  const text = s.formRelic(seeded(3));
  const r = s.pathway.relikt;
  // die Moor-Eigenschaften hängen an den fünf zersetzten Dingen: andere Zufallszahl, dieselben Kandidaten
  const s2 = wexmoor({ pid: 'sq_moor' });
  s2.seq4().decayed = st.decayed;
  s2.formRelic(seeded(99));
  const pool = (list) => list.every((b) => b.name);
  assert.ok(pool(r.boons) && pool(s2.pathway.relikt.boons));
  assert.ok(r.name && r.name !== 'Relikt des Verfalls', r.name);
  assert.ok(r.boons.length >= 2 && r.boons.every((b) => b.key && b.text), JSON.stringify(r.boons));
  assert.ok(text.includes(r.name));
});

/** Wie tests/wexmoor_balance.test.js: Ossuarklinge, Tonikum, Wuchtschlag. */
function hero(seq = 7) {
  const s = wexmoor();
  s.addItem('ossuarklinge');
  s.equip('ossuarklinge');
  s.addItem('tonikum', 3);
  s.addItem('verband', 2);
  s.pathway = { id: 'eisen', seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  return s;
}
const PLAY = (defend) => ({ defend, skill: 'wuchtschlag', chain: true, healBelow: 18 });

test('Wexmoor-Kopfgelder: kleine schaffen Geübte, mittlere verlangen sauberes Timing, große eine Sequenz 6', () => {
  for (const [id, e] of Object.entries(content.encounters).filter(([i]) => i.startsWith('wxk_'))) {
    const tier = e.boss ? 'gross' : e.hp >= 200 ? 'mittel' : 'klein';
    const s = hero(tier === 'gross' ? 6 : 7);
    assert.equal(fight(s, id, PLAY(tier === 'klein' ? SKILLED : EXPERT)).result.outcome, 'won', id);
    if (tier !== 'klein') assert.equal(fight(hero(tier === 'gross' ? 6 : 7), id, PLAY(SKILLED)).result.outcome, 'lost', `${id}: nicht ohne Timing`);
  }
});

test('Wexmoor-Kopfgeld: Steckbrief im Wachhaus, Gesuchter auf seiner Karte, Lohn beim Abrechnen', () => {
  const s = hero();
  const board = content.maps.wx_wachhaus.interactables.find((i) => i.id === 'wx_steckbriefe');
  assert.ok(board && s.meets(board.visible_if));
  talk(s, 'wx_steckbriefe', ['Gleisplünderer', 'abnehmen']);
  assert.equal(s.quests.kopfgeld_wx_gleispluenderer, 'active');
  const roamer = content.maps.wx_bahnhof.roamers.find((r) => r.encounter === 'wxk_gleispluenderer');
  assert.ok(roamer?.boss && s.meets(roamer.visible_if));
  assert.equal(fight(s, 'wxk_gleispluenderer', PLAY(EXPERT)).result.outcome, 'won');
  assert.ok(!s.meets(roamer.visible_if), 'besiegt: verschwunden');
  const money = s.money;
  talk(s, 'wx_steckbriefe', ['kassieren: Gleisplünderer']);
  assert.equal(s.quests.kopfgeld_wx_gleispluenderer, 'done');
  assert.equal(s.money - money, LOHN.kopfgeld.klein);
  // alle acht Gesuchten stehen auf existierenden Karten
  assert.equal(Object.keys(content.quests).filter((q) => q.startsWith('kopfgeld_wx_')).length, 8);
  for (const q of Object.keys(content.quests).filter((x) => x.startsWith('kopfgeld_wx_'))) {
    const t = content.quests[q].steps[0].target;
    assert.ok(content.maps[t.map].roamers.some((r) => r.encounter === t.id), q);
  }
  // Aushänge: auf jeder Karte platziert
  for (const id of [...Object.keys(content.dialogues).filter((d) => d.startsWith('wxj_')).map((d) => `${d}_aushang`)]) {
    assert.ok(Object.values(content.maps).some((m) => (m.interactables ?? []).some((i) => i.id === id)), id);
  }
});

test('Wexmoor-Arbeiten und Funde: einmal je Spieltag, Maud kauft die Funde', () => {
  const s = wexmoor();
  s.playTime = 10;
  const nerves = s.composure;
  const money = s.money;
  talk(s, 'wxj_salzwagen_bewachen', ['Arbeit annehmen']);
  assert.equal(s.money - money, LOHN.arbeit.mittel);
  assert.equal(nerves - s.composure, ARBEIT_NERVEN);
  assert.throws(() => talk(s, 'wxj_salzwagen_bewachen', ['Arbeit annehmen']), /keine verfügbare Option/);
  s.playTime += DAY_SECONDS;
  talk(s, 'wxj_salzwagen_bewachen', ['Arbeit annehmen']);
  assert.equal(s.money - money, 2 * LOHN.arbeit.mittel);
  // Funde: seltene Beute der Monster im Fundgebiet (Eliten doppelt), Maud kauft sie
  for (const [fid, x] of Object.entries(content.items).filter(([i]) => i.startsWith('wxf_'))) {
    const zone = Object.entries(content.encounters).filter(([id, e]) => content.loot[id]?.drops?.some((d) => d.item === fid)).map(([, e]) => e.zone);
    assert.ok(zone.length >= 3 && zone.every((z) => content.zones[z]), `${fid}: ${zone}`);
    assert.ok(s.sellPrice(fid) >= LOHN.fund.klein / 2, fid);
  }
  for (const it of content.maps.wx_salzmarkt.interactables.filter((i) => /^wx[fj]_/.test(i.id))) {
    assert.ok(/[.,gpscwPK=]/.test(content.maps.wx_salzmarkt.rows[it.tile[1]][it.tile[0]]), it.id);
  }
});

test('Wexmoor-Einnahmen: ein Spieltag Arbeiten und Funde plus Kopfgelder reichen in wenigen Tagen für ~10 000', () => {
  const jobs = Object.keys(content.dialogues).filter((d) => d.startsWith('wxj_')).length;
  assert.equal(jobs, 6);
  const perDay = 2 * LOHN.arbeit.klein + 2 * LOHN.arbeit.mittel + 2 * LOHN.arbeit.gross;
  const bounties = 2 * LOHN.kopfgeld.klein + 4 * LOHN.kopfgeld.mittel + 2 * LOHN.kopfgeld.gross;
  assert.ok(perDay >= 700 && bounties >= 3000, `${perDay} / ${bounties}`);
});

test('DR: Gerede und eine Zeitungsmeldung nach bestandenem Ritual', () => {
  const s = wexmoor({ pid: 'laterne' });
  s.map = 'wx_salzmarkt';
  const lines = content.gossip.wexmoor.wx_salzmarkt.filter((g) => g.requires_flags?.includes('hg_gerede_laterne'));
  assert.equal(lines.length, 3);
  s.seq4Pass('laterne', 'Test.');
  assert.ok(s.flags.has('hg_gerede_laterne'));
  const papers = s.papers.filter((id) => id.startsWith('s4r_zeitung_laterne'));
  assert.deepEqual(papers, ['s4r_zeitung_laterne_wexmoor']);
});

test('Teststart ?probe=<pfad>: Sequenz 5 voll verdaut im Vergessmoor, Laternennacht sofort möglich', () => {
  const s = new GameState(content);
  assert.equal(s.seq4Probe('laterne'), true);
  assert.equal(s.seq4Kind(), 'laterne');
  assert.equal(s.map, 'wx_vergessmoor');
  assert.equal(s.startSiege().ok, true);
  assert.equal(new GameState(content).seq4Probe('gibtsnicht'), false);
});
