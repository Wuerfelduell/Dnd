// Codex-Runde 9 eingebaut: CS (Figuren ohne eigene Grafik), CQ/CR (Fasserin-Aufträge), CO/CP (Halbgott und Engel).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';
import { SHEETS, CHARACTER_SHEETS, HEADS, HEAD_FILES, PORTRAIT_EXTRA, BATTLE_SHEETS, ENCOUNTER_SHEETS, WHOLE_PROPS, ANIM_SHEETS, UI_SHEETS, UI_REGIONS,
  ENCOUNTER_BACKGROUNDS, TURN_PORTRAIT_URLS, CS_FIGURES, FA_ARTEFAKTE, HG_PATHS, HG_SCENES, itemIconUrl, itemIcon32Url, portraitFor, headUrl, sceneUrl } from '../src/world/assets.js';
import { FA_AUFTRAEGE } from '../src/data/runde9.js';
import { SCHWELLE } from '../src/data/sequenzen.js';
import { ordealId } from '../src/core/Pathways.js';

const content = loadContent();
const sprite = (path) => new URL(`../public/sprites/${path}`, import.meta.url);
const file = (url) => existsSync(new URL(String(url).replace(/^.*\/sprites\//, '../public/sprites/'), import.meta.url));
const manifest = (name) => JSON.parse(readFileSync(new URL(`../public/sprites/manifest-${name}.json`, import.meta.url), 'utf8'));

test('CS: 17 Einwohner und Mina haben Lauf-Sheet, 20 Köpfe, vier Porträtleisten, drei Kampfblätter, zwei Stände', () => {
  for (const id of CS_FIGURES) {
    assert.equal(CHARACTER_SHEETS[`npc_${id}`], `cs_${id}`, id);
    assert.ok(existsSync(sprite(SHEETS[`cs_${id}`])), SHEETS[`cs_${id}`]);
    assert.ok(content.npcs[id], `${id} ist eine Figur im Spiel`);
    if (id !== 'cwo_marktstand') assert.ok(headUrl(id)?.includes('portraits/heads/'), `${id}: Kopf`);
  }
  assert.equal(headUrl('cwo_marktstand'), null, 'Mina hat laut Auftrag keinen Kopf');
  for (const id of ['wx_pfandleiherin', 'k2a_senn', 'k2a_veit', 'k2a_noll']) {
    assert.ok(HEADS.includes(id) && existsSync(sprite(HEAD_FILES[id])), `${id}: Kopf`);
    assert.ok(existsSync(sprite(`portraits/${PORTRAIT_EXTRA[id][0]}`)), `${id}: Porträtleiste`);
    assert.equal(portraitFor(id, 'suspicious').col, 2, 'Spalte 2 = misstrauisch');
    assert.equal(portraitFor(id, 'smile').col, 1, 'Spalte 1 = freundlich');
    assert.equal(portraitFor(id, 'shocked').col, 3);
    assert.equal(portraitFor(id, 'neutral').col, 0);
    assert.equal(portraitFor(id, 'irgendwas').col, 0, 'unbekannte Stimmung → neutral');
  }
  assert.equal(ENCOUNTER_SHEETS.k2a_tinte_kampf, 'enemy_k2a_senn');
  assert.equal(ENCOUNTER_SHEETS.k2a_bittere_mittel_kampf, 'enemy_k2a_veit');
  assert.equal(ENCOUNTER_SHEETS.k2a_hafenrecht_kampf, 'enemy_k2a_noll');
  for (const id of ['k2a_senn', 'k2a_veit', 'k2a_noll']) assert.ok(existsSync(sprite(BATTLE_SHEETS[`enemy_${id}`][0])) && BATTLE_SHEETS[`enemy_${id}`][1] === 64);
  for (const id of ['wx_pfandtisch', 'cwo_marktstand_tisch']) assert.ok(existsSync(sprite(WHOLE_PROPS[id])), id);
  assert.ok(content.maps.wx_salzmarkt.decor.some((d) => d.sprite === 'wx_pfandtisch'), 'Pfandtisch am Salzmarkt');
  assert.ok(content.maps.cw_quittungsmarkt.decor.some((d) => d.sprite === 'cwo_marktstand_tisch'), 'Minas Stand am Quittungsmarkt');
  // Manifest und Registrierung stimmen überein
  const m = manifest('figuren_nachzuegler');
  for (const a of m.assets.filter((a) => a.kind === 'walk')) assert.ok(Object.values(SHEETS).includes(a.file), a.file);
});

test('CR/CQ: 20 Aufträge fa_* mit CR-Chance und -Lohn, Artefakte mit Wirkung und Haken, Bilder in 16 und 32 px', () => {
  const artisan = content.gatherings.artisan;
  const s = new GameState(content);
  for (const [stueck, chance, fee] of FA_AUFTRAEGE) {
    const r = artisan.recipes.find((x) => x.id === `fa_${stueck}`);
    assert.ok(r, `Rezept fa_${stueck}`);
    assert.deepEqual(r.needs, { [stueck]: 1 });
    assert.equal(r.fee, fee);
    assert.equal(s.recipeChance(r), chance, `${stueck}: Chance`);
    assert.ok(r.line.length > 10, `${stueck}: Odas Prüfzeile`);
    const art = content.items[`fa_${stueck}`];
    assert.equal(art.kind, 'artifact');
    assert.equal(content.artifacts.list[`fa_${stueck}`].source, 'artisan');
    assert.equal(art.boons.length, 1);
    assert.equal(art.curses.length, 1);
    assert.ok(art.boons[0].text && art.curses[0].text && art.oda && art.untersuchen, `${stueck}: Texte`);
    assert.ok(file(itemIconUrl(`fa_${stueck}`)), `${stueck}: Bild 16`);
    assert.ok(itemIcon32Url(`fa_${stueck}`) && file(itemIcon32Url(`fa_${stueck}`)), `${stueck}: Bild 32`);
  }
  assert.equal(FA_ARTEFAKTE.length, 20);
  // Wirkungen nutzen nur Passiv-Schlüssel, die das Spiel kennt (ein unbekannter Schlüssel wäre wirkungslos)
  const known = new Set(readFileSync(new URL('../src/core/Combat.js', import.meta.url), 'utf8').concat(readFileSync(new URL('../src/core/Pathways.js', import.meta.url), 'utf8'), readFileSync(new URL('../src/core/GameState.js', import.meta.url), 'utf8'), readFileSync(new URL('../src/ui/Ui.js', import.meta.url), 'utf8'), readFileSync(new URL('../src/core/Wanted.js', import.meta.url), 'utf8'), readFileSync(new URL('../src/core/Artifacts.js', import.meta.url), 'utf8'), readFileSync(new URL('../src/world/CombatScene.js', import.meta.url), 'utf8')).matchAll(/passive\('([a-z_]+)'/g).map((m) => m[1]));
  for (const id of FA_ARTEFAKTE) for (const e of [...content.items[id].boons, ...content.items[id].curses]) assert.ok(known.has(e.key), `${id}: ${e.key}`);
  // Texte: Oda, Gastgeber je Zirkel, Karten- und Hinweistexte im Inhalt; Zettel, Chance, Zirkelmarken und HUD als UI-Sheets
  assert.ok(content.fasserinAuftrag.oda.annehmen.length >= 3 && content.fasserinAuftrag.gastgeber.schichtbund.host === 'zirkel_schichtbund');
  for (const k of ['cqauftrag', 'cqchance', 'cqzirkel', 'cqhud']) assert.ok(existsSync(sprite(UI_SHEETS[k][0])) && Object.keys(UI_REGIONS[k]).length >= 4, k);
  assert.ok(existsSync(sprite(ANIM_SHEETS.fasserin_posen[0])) && existsSync(sprite(`portraits/${PORTRAIT_EXTRA.fasserin[0]}`)));
  assert.equal(portraitFor('fasserin', 'pruefend').col, 2);
  // Gerede an allen sechs Treffen-Tischen, Zeitung und vier Lesestücke im Spiel
  for (const [zirkel, city] of [['waage', 'kettlegate'], ['lichtlose', 'wexmoor'], ['schichtbund', 'dunscar']]) assert.ok(content.gossip[city][`treffen_${zirkel}`]?.some((g) => /Oda|Auftr|Einladung|Fasser/.test(g.text)), zirkel);
  assert.ok(content.newspapers.some((p) => p.id === 'fa_scherben_schenke'));
  const lese = Object.values(content.maps).flatMap((m) => m.interactables ?? []).filter((i) => i.id?.startsWith('fa_') && i.kind === 'read');
  assert.equal(lese.length, 4, 'vier Lesestücke platziert');
});

test('CR: höchstens zwei offene Aufträge, fester Würfel je Auftrag, Ergebnis bleibt im Verlauf, Flags', () => {
  const s = new GameState(content);
  s.flags.add('briefed_04');
  s.flags.add(content.gatherings.circles.waage.member_flag);
  let cycle = s.marketCycle();
  for (let i = 0; i < 400; i++) {
    cycle = s.marketCycle() + 1;
    while (s.gatheringSlot(cycle).id !== 'waage') cycle++;
    s.playTime = s.gatheringSlot(cycle).start + 1;
    if (s.artisanPresent('waage', cycle)) break;
  }
  assert.ok(s.artisanPresent('waage', cycle), 'Treffen mit Oda gefunden');
  s.auction = { phase: 'artisan', circle: 'waage', cycle, crafted: [], log: [] };
  const recipes = s.artisanRecipes('waage', cycle);
  assert.ok(recipes.length >= 3);
  s.money = 5000;
  for (const r of recipes.slice(0, 3)) for (const [id, n] of Object.entries(r.needs)) s.addItem(id, n);
  assert.equal(s.orderArtifact(recipes[0].id).ok, true);
  assert.ok(s.flags.has('fa_auftrag_erteilt') && s.flags.has('fa_auftrag_waage'));
  assert.equal(s.orderArtifact(recipes[1].id).ok, true);
  const third = s.orderArtifact(recipes[2].id);
  assert.equal(third.ok, false, 'dritter Auftrag abgelehnt');
  assert.ok(content.fasserinAuftrag.oda.zu_viele.some((l) => third.text.includes(l)), third.text);
  const [o1, o2] = s.pendingOrders();
  assert.ok(o1.id && o2.id && o1.id !== o2.id && o1.owner === 1 && o1.piece, 'Auftrags-ID, Besitzer, Stück');
  // Spielstand: ID und Besitzer überleben Laden
  const s2 = new GameState(content);
  s2.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.deepEqual(s2.pendingOrders().map((o) => [o.id, o.owner, o.piece]), [o1, o2].map((o) => [o.id, o.owner, o.piece]));
  // Abholen in der nächsten Runde: Ergebnis im Verlauf, nie doppelt
  const next = cycle + 1;
  const a = s.orderSucceeds(o1, 0);
  assert.equal(s.orderSucceeds(o1, 5), a, 'fester Würfel über die ID, nicht über die Listenposition');
  s.say = () => {};
  const out = s.collectOrders('waage', next);
  assert.equal(out.length, 2);
  assert.equal(s.pendingOrders().length, 0);
  assert.equal(s.artisanHistory.length, 2);
  assert.deepEqual(s.collectOrders('waage', next), [], 'nichts zum zweiten Mal');
  if (s.artisanHistory.some((h) => !h.ok)) assert.ok(s.flags.has('fa_misslungen_1'));
});

test('CO/CP: Kreaturformen mit Texten und Sheets, Wächter mit CO-Blatt, Siegel, Kulisse und Zorn-Phase, Trinktexte, Zeitung und Gerede', () => {
  const s = new GameState(content);
  for (const pid of HG_PATHS) {
    s.pathway = { id: pid, seq: 4, digestion: 60 };
    const f = s.formDef();
    assert.equal(f.id, `hg_form_${pid}`);
    assert.ok(f.annehmen && f.ablegen && f.zu_lange && f.gesperrt && f.beschreibung, `${pid}: CP-Texte`);
    assert.ok(existsSync(sprite(ANIM_SHEETS[`hg_form_${pid}`][0])) && ANIM_SHEETS[`hg_form_${pid}`][1] === 32, `${pid}: Karten-Sheet 32x48`);
    assert.ok(existsSync(sprite(BATTLE_SHEETS[`hg_battle_${pid}`][0])) && BATTLE_SHEETS[`hg_battle_${pid}`][1] === 96, `${pid}: Kampf-Sheet 96`);
    assert.ok(TURN_PORTRAIT_URLS[`hg_form_${pid}`], `${pid}: Zugportrait`);
    for (const seq of [4, 2]) {
      assert.ok(s.hgDrinkText(pid, seq)?.trinken, `${pid} ${seq}: Trinktext`);
      assert.ok(file(sceneUrl(`hg_seq${seq}_${pid}`)), `${pid} ${seq}: Sequenzbild`);
      const enc = content.encounters[ordealId(pid, seq)];
      assert.equal(enc.sheet, SCHWELLE[seq].sheet);
      assert.equal(enc.hp, seq === 4 ? 2500 : 1850, 'Leben nach CP (Seq 2 angehoben wegen Halbgott-Schaden)');
      assert.ok(enc.phase2?.attacks?.length === 2 && enc.phase2.meldung, 'Zorn-Phase');
      assert.ok(enc.phase2.attacks.some((a) => a.nerves > 0), 'die Welle senkt Nerven');
      assert.equal(ENCOUNTER_BACKGROUNDS[ordealId(pid, seq)], seq === 4 ? 'bg_hg_schwelle' : 'bg_hg_grenze');
    }
    const on = s.toggleForm();
    assert.ok(on.ok && on.text.includes(s.formDef().annehmen), `${pid}: Annehmen-Text`);
    s.endForm();
  }
  assert.equal(HG_SCENES.length, 20);
  for (const sheet of ['hg_schwellenwaechter', 'hg_grenzwaechter']) assert.ok(existsSync(sprite(BATTLE_SHEETS[sheet][0])) && BATTLE_SHEETS[sheet][1] === 128);
  assert.deepEqual(BATTLE_SHEETS.hg_schwellenwaechter.slice(1), [128, 96], 'rechteckige Frames');
  assert.ok(existsSync(sprite('battle/bg_hg_schwelle.png')) && existsSync(sprite('battle/bg_hg_grenze.png')) && existsSync(sprite(ANIM_SHEETS.hg_siegel[0])));
  for (const k of ['player_drink_halbgott', 'player_drink_engel', 'p2a_drink_halbgott', 'p2b_drink_engel', 'HG_aufstieg_4', 'HG_aufstieg_2', 'HG_kreatur_wechsel', 'HG_furcht', 'HG_umfallen', 'HG_aura_halbgott', 'HG_aura_engel']) assert.ok(existsSync(sprite(ANIM_SHEETS[k][0])), k);
  assert.ok(Object.keys(UI_REGIONS.hghud).length === 10 && existsSync(sprite(UI_SHEETS.hghud[0])));
  // Bestiarium, Zeitung (hg_in_<stadt> wird aus der Stadt abgeleitet), Gerede und Lesestücke
  assert.ok(content.bestiaryTexts.hg_schwellenwaechter?.schwaeche);
  assert.ok(content.newspapers.some((p) => p.id === 'hg_zeitung_01'));
  s.pathway = { id: 'eisen', seq: 4, digestion: 0 };
  s.flags.add('seq4_erreicht');
  s.map = 'revier';
  s.checkPapers(true);
  assert.ok(s.flags.has('hg_in_kettlegate') && !s.flags.has('hg_in_wexmoor'));
  assert.ok(s.papers.includes('hg_zeitung_01'), 'Kettlegater Meldung erscheint');
  assert.ok(content.gossip.wexmoor.wx_salzmarkt.some((g) => g.id === 'hg_gerede_wexmoor_01'));
  const lese = Object.values(content.maps).flatMap((m) => m.interactables ?? []).filter((i) => i.id?.startsWith('hg_lese_'));
  assert.ok(lese.length >= 8, `Lesestücke platziert: ${lese.length}`);
  // Furcht: Bürger fallen um (Zeile aus CP), Polizei kostet Ansehen
  s.pathway.digestion = 60;
  s.toggleForm();
  const r = s.formFearReaction('sparring');
  assert.ok(r && r.text && ['buerger', 'polizei', 'haendler'].includes(r.klasse), JSON.stringify(r));
  assert.ok(s.flags.has('hg_form_oeffentlich'));
});
