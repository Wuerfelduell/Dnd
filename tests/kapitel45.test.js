// Codex-Runde 8: Kapitel 4 Calderwick (CC/CD/CF) und 5 Briarholt (CG/CH/CJ) aus dem Vorrat (BH/BJ/BL), Feste-Leben (CK)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { districtOf } from '../src/core/Guide.js';
import { travelDestinations } from '../src/core/Travel.js';
import { COMPANIONS } from '../src/core/Bonds.js';
import { DAY_SECONDS, SEASON_SECONDS } from '../src/core/Clock.js';
import { mapMarkerOf, BATTLE_SHEETS, ENCOUNTER_SHEETS, PORTRAITS, CHARACTER_SHEETS, BOSS_INTROS, headUrl } from '../src/world/assets.js';
import { loadContent, talk, use, fight, EXPERT } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);
const WALK = new Set([...'.,gpscwPK=']);
/** Gebiet → Boss, den man an seiner Station im Gespräch stellt (alle Abschnitte über dasselbe Gespräch). */
const BOSSES = { cw_alte_setzerei: 'vg_cw_boss_bleisammler', cw_sortiergrube: 'vg_cw_boss_blinder_zusteller', cw_nullfundament: 'vg_cw_boss_nullfundament', reise_landstrasse: 'vg_all_boss_landvermesser',
  bh_kaltes_palmhaus: 'vg_bh_boss_glasgaertner', bh_verlassene_waescherei: 'vg_bh_boss_waescherei', bh_wurzelkammer: 'vg_bh_boss_mutterwurzel' };

test('Vorrat BH: zehn Gefahrengebiete tragen Gegner, Eliten, Bosse und Beute aus dem Vorrat; Briarholt je kalt und warm', () => {
  const zones = Object.keys(content.zones).filter((z) => /^(cw_|bh_|reise_)/.test(z));
  assert.equal(zones.length, 10);
  for (const zid of zones) {
    const map = content.maps[zid];
    assert.ok(map?.danger >= 5, `${zid}: Gefahrenstufe`);
    assert.ok(content.travel.some((t) => t.map === zid), `${zid}: Reiseziel`);
    assert.ok(map.roamers.length >= 2, `${zid}: Streifen`);
    const [sx, sy] = map.spawns.default;
    for (const r of map.roamers.filter((x) => !x.bn)) { // DJ: benannte Gegner prüft benannte.test.js
      const e = content.encounters[r.encounter];
      assert.ok(e?.wild && e.chapter >= 4 && e.zone, `${zid}: ${r.encounter}`);
      assert.ok(WALK.has(map.rows[r.tile[1]][r.tile[0]]), `${zid}: ${r.encounter} steht auf ${map.rows[r.tile[1]][r.tile[0]]}`);
      assert.ok(Math.abs(r.tile[0] - sx) + Math.abs(r.tile[1] - sy) >= 10, `${zid}: ${r.encounter} zu nah am Eingang`);
      assert.ok(content.encounters[`${r.encounter}_elite`]?.elite, `${r.encounter}: Elite`);
      assert.ok(content.loot[r.encounter].drops.length && content.loot[`${r.encounter}_elite`].money[1] > content.loot[r.encounter].money[1], `${r.encounter}: Beute`);
    }
    const boss = BOSSES[zid.replace(/__warm$/, '')];
    const b = content.encounters[boss];
    assert.ok(b?.boss && b.zone && b.lose_to?.map === content.zones[zid].lose_to.map, `${zid}: Boss ${boss}`);
    assert.ok(content.dialogues[`${boss}_dialog`] && Object.values(content.dialogues[`${boss}_dialog`].nodes).some((n) => n.combat === boss), `${boss}: Gespräch an der Station`);
    assert.ok(content.encounters[`${boss}_phase2`]?.boss, `${boss}: zweiter Abschnitt`);
    // Bergung nach dem Sieg: der letzte Abschnitt gibt das Artefakt bzw. die Trophäe
    assert.ok(Object.values(content.dialogues[`${boss}_dialog`].nodes).some((n) => n.gives_items), `${boss}: Bergung`);
  }
  // Die Zonen-Gegner teilen sich kalte und warme Fassung; die warme Fassung hat einen Gast aus einem anderen Gebiet
  assert.ok(content.maps.bh_kaltes_palmhaus__warm.roamers.length > content.maps.bh_kaltes_palmhaus.roamers.length);
  // Gegner ohne Gebiet (Marktschreier) stehen trotzdem mit Beute bereit
  assert.ok(content.encounters.vg_all_marktschreier && content.loot.vg_all_marktschreier);
  // Jedes Gebiet hat ein seltenes Artefakt (Vorrat BL als Wildnisfund)
  for (const zid of zones.filter((z) => !z.endsWith('__warm'))) {
    const arts = Object.values(content.artifacts.list).filter((a) => a.source === 'wild' && a.zones?.includes(zid));
    assert.ok(arts.length >= 1, `${zid}: Artefakt`);
  }
});

test('Kapitel 4: Anreise aus Dunscar, Terrassen hinter k4_arrived, vier Enden setzen kapitel4_done und zeigen Epiloge', () => {
  const s = fresh();
  s.map = 'ds_speisewagen';
  for (const f of ['kapitel3_done', 'k3a_end_feierabend']) s.flags.add(f);
  // Pfiffs Abfahrt nach Calderwick (CC-Zusatz an k3a_pfiff)
  const nodes = content.dialogues.k3a_pfiff.nodes;
  const abfahrt = Object.entries(nodes).find(([id]) => id === 'cwa_anreise_feierabend_abfahrt')[1];
  s.applyEffects(abfahrt);
  assert.ok(s.flags.has('cwa_reise_freigegeben') && s.pendingTravel?.map === 'cw_gleisfuss');
  // Ankunft am Gleisfuß: Rettung setzt k4_arrived, dann öffnen sich die Terrassen
  s.map = 'cw_gleisfuss';
  assert.deepEqual(travelDestinations(s, 'cw_gleisfuss').map((t) => t.map), ['reise_landstrasse'], 'vor der Ankunft nur die Landstraße zurück');
  s.applyEffects(content.dialogues.cwa_ankunft.nodes.cwa_ankunft_rettung);
  assert.ok(s.flags.has('k4_arrived'));
  assert.ok(travelDestinations(s, 'cw_gleisfuss').some((t) => t.map === 'cw_alte_setzerei'), 'mit der Ankunft öffnet sich das erste Gebiet');
  // Die Terrassen folgen den Akten: Werkstatt (Setzergasse), Akt 1 (Quittungsmarkt, Röhrenhof), Akt 2 (Witwenterrasse), Akt 3 (Kronenarchiv)
  for (const [flag, map] of [['cwa_werkstatt', 'cw_setzergasse'], ['cwa_akt1_done', 'cw_quittungsmarkt'], ['cwa_akt2_done', 'cw_witwenterrasse'], ['cwa_akt3_done', 'cw_kronenarchiv']]) {
    assert.ok(!travelDestinations(s, 'cw_gleisfuss').some((t) => t.map === map), `${map} zu früh`);
    s.flags.add(flag);
    assert.ok(travelDestinations(s, 'cw_gleisfuss').some((t) => t.map === map), map);
  }
  assert.ok(content.travelRules.cities.calderwick?.pins.cw_gleisfuss, 'Stadtkarte Calderwick');
  for (const t of content.travel.filter((x) => x.city === 'calderwick')) assert.ok(mapMarkerOf(t.map)[1] !== undefined, `Marker ${t.map}`);
  // Jede Calderwicker Karte hat einen Bezirk auf der Stadtkarte
  for (const id of Object.keys(content.maps).filter((m) => m.startsWith('cw_'))) assert.ok(districtOf(content, id), `${id}: Bezirk`);
  // Akte 1 bis 5 und die Enden
  assert.deepEqual(Object.keys(content.quests).filter((q) => /^cwa_akt\d$/.test(q)), ['cwa_akt1', 'cwa_akt2', 'cwa_akt3', 'cwa_akt4', 'cwa_akt5']);
  assert.ok(content.cases.some((c) => c.id === 'cwa_kapitel4'));
  for (const end of ['cwa_widerspruch', 'cwa_amtsinhaber', 'cwa_buecher', 'cwa_ordnung']) {
    const t = fresh();
    t.setEnding(end);
    assert.ok(t.flags.has('kapitel4_done') && t.flags.has(`cwa_end_${end.slice(4)}`), end);
    assert.ok(t.epilogue(end).length >= 3, `${end}: Epilog`);
    assert.ok(content.newspapers.some((n) => n.zeitung === 'calderwicker_anzeiger'));
  }
  // Reiseereignisse der Landstraße gehören zur schnellen Reise in Calderwick
  assert.ok(content.travelRules.events.filter((e) => e.city === 'calderwick').length >= 10);
  // Gefährtinnen mit Vertrauen: Ida und Klammer (Kapitel 4), Bellweather (Kapitel 5)
  for (const id of ['cw_ida_bellcross', 'cw_crayford', 'bh_bellweather']) assert.ok(COMPANIONS.includes(id) && content.npcs[id], id);
});

test('Kapitel 5: Briefe nach den Calderwick-Enden, Ankunft im Bügelraum, Ventilkreise schalten die warmen Fassungen', () => {
  const s = fresh();
  s.flags.add('cwa_end_widerspruch');
  const brief = content.maps.cw_buchbinderei.interactables.find((i) => i.id === 'bha_anreise_widerspruch_brief');
  assert.ok(brief && s.meets(brief.visible_if));
  s.applyEffects(content.dialogues.bha_anreise_widerspruch.nodes.bha_anreise_widerspruch_reisen);
  assert.ok(s.flags.has('bha_reise_frei') && s.pendingTravel?.map === 'reise_landstrasse');
  s.applyEffects(content.dialogues.bha_ankunft.nodes.bha_ankunft_frost);
  assert.ok(s.flags.has('k5_arrived') && s.pendingTravel?.map === 'bh_buegelraum');
  // Der Bügelraum ist immer warm und hat keine Zwillingskarte; alle anderen Orte haben eine
  assert.ok(content.maps.bh_buegelraum && !content.maps.bh_buegelraum__warm && content.travel.some((t) => t.map === 'bh_buegelraum'));
  const base = Object.keys(content.maps).filter((m) => m.startsWith('bh_') && !m.endsWith('__warm') && m !== 'bh_buegelraum');
  assert.equal(base.length, 17);
  for (const id of base) {
    const warm = content.maps[`${id}__warm`];
    assert.ok(warm?.warm_if?.requires_flags?.[0].startsWith('bha_ventil_'), `${id}: warme Fassung mit Ventilbedingung`);
    assert.equal(s.variantOf(id), id, `${id}: kalt`);
    assert.equal(s.variantOf(`${id}__warm`), id, `${id}: warm wird kalt, solange der Kreis zu ist`);
    // Figuren, Objekte und Lesestücke der Akte stehen auf beiden Fassungen
    const ids = (m) => new Set([...(m.npcs ?? []).map((n) => n.id), ...(m.interactables ?? []).map((i) => i.id)]);
    for (const x of ids(content.maps[id])) assert.ok(ids(warm).has(x), `${id}: ${x} fehlt auf der warmen Fassung`);
    for (const d of (warm.interactables ?? []).filter((i) => i.kind === 'door')) assert.ok(d.to.endsWith('__warm') || d.to === 'bh_buegelraum', `${id}__warm: Tür nach ${d.to}`);
    assert.ok(districtOf(content, `${id}__warm`), `${id}__warm: Bezirk`);
  }
  // Ventilkreis Hof öffnen: Kutschenhof und Kutschenhalle werden warm, auf der Stadtkarte steht nur noch die warme Fassung
  s.map = 'bh_buegelraum';
  const before = travelDestinations(s, 'bh_buegelraum').map((t) => t.map);
  assert.ok(before.includes('bh_kutschenhof') && !before.includes('bh_kutschenhof__warm'));
  s.applyEffects(content.dialogues.bha_ventil_hof.nodes.bha_ventil_hof_warm);
  assert.ok(s.flags.has('bha_ventil_hof_offen'));
  assert.equal(s.variantOf('bh_kutschenhof'), 'bh_kutschenhof__warm');
  assert.equal(s.variantOf('bh_kutschenhalle'), 'bh_kutschenhalle__warm');
  assert.equal(s.variantOf('bh_kesselgrund'), 'bh_kesselgrund');
  const after = travelDestinations(s, 'bh_buegelraum').map((t) => t.map);
  assert.ok(after.includes('bh_kutschenhof__warm') && !after.includes('bh_kutschenhof'));
  // Spielstand: wer in einer kalten Karte speichert, landet nach dem Laden in der passenden Fassung
  s.map = 'bh_kutschenhof';
  const t = fresh();
  t.load(s.serialize());
  assert.equal(t.map, 'bh_kutschenhof__warm');
  // Enden
  for (const end of ['bha_wahl', 'bha_winter', 'bha_verwahrt', 'bha_schmerzlos']) {
    const u = fresh();
    u.setEnding(end);
    assert.ok(u.flags.has('kapitel5_done') && u.epilogue(end).length >= 3, end);
  }
  assert.ok(content.newspapers.some((n) => n.zeitung === 'briarholter_kurblatt') && !content.newspapers.some((n) => n.zeitung === 'bhn_kurblatt'));
});

test('Vorrat BJ/BL und BI/BK/BM: Figuren mit Sheet, Portrait und Kopf; Gegner mit Sheet und Bossbild; Händler verkaufen die Kleidung', () => {
  for (const id of Object.keys(content.npcs).filter((n) => /^(cw_|bh_|vn_)/.test(n))) {
    assert.ok(CHARACTER_SHEETS[`npc_${id}`] && PORTRAITS[id] && headUrl(id), id);
  }
  for (const [id, e] of Object.entries(content.encounters).filter(([i]) => i.startsWith('vg_'))) {
    const sheet = e.sheet ?? ENCOUNTER_SHEETS[id];
    assert.ok(BATTLE_SHEETS[sheet], `${id}: Sheet`);
    if (e.boss) assert.ok(BOSS_INTROS[id.replace(/_phase\d$/, '')], `${id}: Bossbild`);
  }
  assert.ok(BOSS_INTROS.cwa_registerleib_rest && BOSS_INTROS.bha_aussaat_schwarm);
  const sold = new Set(Object.values(content.market.merchants).flatMap((m) => m.stock.map((e) => e.item)));
  for (const id of Object.keys(content.items).filter((i) => i.startsWith('vi_') && content.items[i].kind === 'gear')) assert.ok(sold.has(id), `${id}: im Laden`);
  for (const id of ['vi_handel_druckerei', 'vi_handel_garten', 'vi_handel_reise']) assert.ok(content.market.merchants[id], id);
  for (const id of Object.keys(content.items).filter((i) => i.startsWith('vt_'))) assert.equal(content.items[id].kind, 'trophy', id);
  assert.ok(Object.keys(content.bestiaryTexts).filter((i) => i.startsWith('vg_')).length >= 30);
});

test('Balance Kapitel 4/5: mit Ausrüstung der Stufe 4 und Sequenz 4 (Halbgott) schafft ein sehr Geübter die normalen Gegner, ein Unachtsamer verliert', () => {
  // Seb (2026-11-11): Sequenz 4 ist der Halbgott-Sprung, die Gegner von Kapitel 4/5 sind darauf skaliert (vorrat_gegner, halbgott_skaliert)
  const geared = (seq = 4) => {
    const s = fresh();
    s.addItem('revolver');
    s.addItem('verband', 4);
    s.addItem('tonikum', 3);
    s.pathway = { id: 'eisen', seq, digestion: 0 };
    s.updateMaxHp();
    s.hp = s.maxHp;
    return s;
  };
  const normal = Object.entries(content.encounters).filter(([, e]) => e.wild && e.chapter >= 4 && !e.boss && !e.elite);
  assert.ok(normal.length >= 20);
  let won = 0;
  for (const [id] of normal) {
    const { result } = fight(geared(), id, { defend: EXPERT, skill: 'double', healBelow: 20 });
    if (result.outcome === 'won') won++;
  }
  assert.ok(won >= normal.length * 0.8, `nur ${won} von ${normal.length} Siege`);
  const { result } = fight(geared(), 'vg_cw_boss_bleisammler', { defend: (i) => (i % 2 ? 'miss' : 'dodge') });
  assert.equal(result.outcome, 'lost');
  // Ohne den Halbgott-Sprung (Sequenz 5) sind die Calderwicker Gegner eine Nummer zu groß
  let wonSeq5 = 0;
  for (const [id] of normal.filter(([i]) => /^vg_(cw|all)_/.test(i))) {
    if (fight(geared(5), id, { defend: EXPERT, skill: 'double', healBelow: 20 }).result.outcome === 'won') wonSeq5++;
  }
  assert.ok(wonSeq5 <= normal.length * 0.5, `Sequenz 5 gewinnt ${wonSeq5} von ${normal.length}`);
});

test('Feste-Leben (CK): Buden, Gäste und Auftrag nur am Festtag; Saisonwirkungen liegen einmal je Jahreszeit auf den Märkten; Stiller Abend', () => {
  const s = fresh();
  s.syncClock();
  const gast = content.maps.altmarkt.npcs.find((n) => n.id === 'fs_laternennacht_gast_1');
  assert.ok(gast && !s.meets(gast.visible_if), 'Gast vor dem Fest unsichtbar');
  s.playTime = 3 * DAY_SECONDS + 1; // Herbsttag 4
  s.tick(0);
  assert.ok(s.meets(gast.visible_if) && s.festAktiv('kettlegate') === 'laternennacht');
  assert.ok(content.dialogues.fs_laternennacht_gast_1 && content.market.merchants.fs_laternennacht_bude_1.stock.length >= 4);
  assert.equal(content.quests.fs_laternennacht_auftrag.reward?.gives_money ?? 0, 0, 'Festauftrag ohne Geldlohn');
  for (const id of ['fs_laternennacht_andenken', 'fs_salzsegen_andenken', 'fs_schichtwechsel_andenken']) assert.equal(content.items[id].kind, 'artifact', id);
  // Saisonwirkung: im Herbst sichtbar, einmal nutzbar, im Winter weg und im nächsten Herbst wieder frei
  const w = content.maps.altmarkt.interactables.find((i) => i.id === 'fs_herbst_wirkung_1');
  assert.ok(w && s.meets(w.visible_if));
  assert.equal(use(s, 'altmarkt', 'fs_herbst_wirkung_1'), 'ok');
  assert.ok(s.itemCount('fs_laternennacht_kastanien') === 1 && !s.meets(w.visible_if));
  s.playTime = SEASON_SECONDS + 1;
  s.tick(0);
  assert.ok(!s.meets(w.visible_if) && s.flags.has('fs_winter'));
  s.playTime = 4 * SEASON_SECONDS + 1;
  s.tick(0);
  assert.ok(s.meets(w.visible_if), 'im nächsten Herbst wieder frei');
  // Stiller Abend: vierter Wintertag
  s.playTime = SEASON_SECONDS + 3 * DAY_SECONDS + 1;
  s.tick(0);
  assert.ok(s.stillerAbend() && s.flags.has('fs_stiller_abend_aktiv'));
  // Gerede und Händlersprüche je Jahreszeit sind im Spiel
  assert.ok(content.gossip.kettlegate.altmarkt.some((g) => g.requires_flags?.includes('fs_winter')));
  assert.ok(content.festeLeben.haendler.fs_winter.altmarkt.text.length > 5 && content.festeLeben.hud.fs_herbst.length >= 2);
});
