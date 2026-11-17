// Seq-4-Rituale in Wexmoor UND Dunscar (Seb, 2026-11-17): keine Rückreise, also muss jede der zehn Halbgott-Prüfungen
// in beiden Städten abschließbar sein, für Spieler 1 und Spieler 2. Geprüft wird, was jede Prüfung vor Ort braucht.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, seeded } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { HG_LATERNEN, HG_FAEDEN, ECHO_FIGHTS, UHR } from '../src/core/Seq4.js';
import { ordealId } from '../src/core/Pathways.js';
import { kesselZutaten } from '../src/data/ritual4Vorrat.js';
import { RITUAL6_LAEDEN } from '../src/data/ritual6Vorrat.js';

const content = loadContent();
const LAEDEN = {
  wexmoor: ['wx_pfandleiherin', 'wx_schneiderin'],
  dunscar: ['k3h_troedlerin', 'k3h_steinmetz', 'k3h_lampenwart', 'k3_mabel', 'ds_waffenhaendlerin', 'ds_kleiderhaendlerin', 'ds_kraeuterfrau', 'dsa_apothekerin', 'dsg_wirtin'],
};
const RUHE = { wexmoor: ['wx_kahn', 'haus_wexmoor'], dunscar: ['ds_speisewagen', 'ds_gasthaus', 'haus_dunscar'] };
const MASKE = { wexmoor: ['wx_pfandleiherin', 'ez_torfmutter', 'ez_schleusenuhr'], dunscar: Object.keys(content.encounters).filter((id) => id.startsWith('ez_ds_')) };

const zonen = (stadt) => Object.keys(content.zones).filter((z) => content.zones[z].travel?.city === stadt);
const gegner = (stadt) => Object.entries(content.encounters).filter(([, e]) => zonen(stadt).includes(e.zone) && !e.boss && e.attacks?.some((a) => a.hits?.length));
/** Was man in der Stadt sicher bekommt: Ladenware (ohne Seltenes) und feste Beute der Gegner in ihren Gebieten. */
function zuHaben(stadt) {
  const ids = new Set();
  for (const sid of LAEDEN[stadt]) for (const s of content.market.merchants[sid]?.stock ?? []) if (!s.rare && !s.requires_flags && !s.requires_honor) ids.add(s.item);
  for (const [id] of gegner(stadt)) for (const d of content.loot[id]?.drops ?? []) if (d.chance >= 0.05) ids.add(d.item);
  // Zirkel-Lose der Stadt mit ordentlicher Chance (Hauptzutaten gibt es in Dunscar nie im Laden)
  for (const c of Object.values(content.gatherings.circles)) if (c.city === stadt) for (const m of c.members ?? []) for (const o of m.offers ?? []) if ((o.chance ?? 1) >= 0.3) ids.add(o.item);
  return ids;
}

for (const stadt of ['wexmoor', 'dunscar']) {
  test(`${stadt}: jede Seq-4-Prüfung findet vor Ort, was sie braucht`, () => {
    const da = zuHaben(stadt);
    assert.ok(RITUAL6_LAEDEN[stadt]);
    // Laterne, Schlüssel, Echo, Uhr, Faden: Monstergebiete mit angreifenden Gegnern
    assert.ok(zonen(stadt).length >= HG_FAEDEN, `${stadt}: ${HG_FAEDEN} Gebiete für die Fäden`);
    assert.ok(gegner(stadt).length >= Math.max(ECHO_FIGHTS, UHR.monsters));
    assert.ok(da.has('lampenoel'), 'Laterne: Lampenöl');
    // Faden: ein Bett in der Stadt
    assert.ok(RUHE[stadt].some((m) => JSON.stringify(content.maps[m]?.interactables ?? []).includes('"rest"')), 'Faden: Schlafplatz');
    // Maske: ein Beyonder, der zählt
    const s = new GameState(content);
    s.pathway = { id: 'maske', seq: 5, digestion: 100 };
    assert.ok(MASKE[stadt].filter((id) => s.maskeTarget(id)).length >= 3, `Maske: Beyonder in ${stadt}`);
    // Kessel: alle Essenz-Zutaten, Gefäß und Wurfflaschen
    for (const id of [...kesselZutaten(content), 'wurf_saeure', 'wurf_gift', 'wurf_spreng']) assert.ok(da.has(id), `Kessel: ${id} in ${stadt}`);
    // Waage: ein Zirkel der Stadt
    assert.ok(Object.values(content.gatherings.circles).some((c) => c.city === stadt), 'Waage: Zirkel');
    // Moor: Moorwasser
    assert.ok(da.has('moorwasser'), `Moor: Moorwasser in ${stadt}`);
  });

  test(`${stadt}: Spieler 1 und 2 können jede Prüfung im Gebiet beginnen`, () => {
    const zone = zonen(stadt)[0];
    const [mon] = gegner(stadt).find(([, e]) => e.zone === zone);
    for (const pid of Object.keys(content.pathways)) for (const who of [1, 2]) {
      const s = new GameState(content);
      s.rng = seeded(3);
      s.addP2();
      s.map = zone;
      s.flags.add('k2_arrived');
      if (stadt === 'dunscar') s.flags.add('k3_arrived');
      s.withPlayer(who, () => {
        s.pathway = { id: pid, seq: 5, digestion: 100 };
        s.updateMaxHp();
        s.hp = s.maxHp;
        const k = s.seq4Kind();
        assert.ok(k, `${pid} P${who}`);
        s.addItem('lampenoel', HG_LATERNEN);
        const start = { laterne: () => s.startSiege(), schluessel: () => s.startShadow(), echo: () => s.startEcho(), uhr: () => s.startUhr4(), maske: () => s.startMaske() }[k];
        if (start) assert.equal(start().ok, true, `${pid} P${who}: ${k} startet in ${zone}`);
        if (k === 'faden') {
          s.combatBy = who;
          const c = new Combat(s, mon);
          assert.equal(c.canMarkFate(), true, `${pid} P${who}: Faden in ${zone}`);
        }
      });
    }
  });
}

test('Seq 4 ist ein deutlicher Sprung für alle Pfade, Spieler 1 und 2; die Gestalt stärkt im Kampf', () => {
  for (const pid of Object.keys(content.pathways)) for (const who of [1, 2]) {
    const s = new GameState(content);
    s.addP2();
    s.withPlayer(who, () => {
      const at = (seq, digestion) => { s.pathway = { id: pid, seq, digestion }; s.updateMaxHp(); return { hp: s.maxHp, nerv: s.maxComposure(), dmg: s.passive('dmg_mult'), tk: s.passive('damage_taken') }; };
      const f = at(5, 100);
      const v = at(4, 0);
      assert.ok(v.hp >= f.hp * 1.9 && v.nerv >= f.nerv * 1.4 && v.dmg >= f.dmg * 2 && v.tk <= f.tk * 0.71, `${pid} P${who}: ${JSON.stringify({ f, v })}`);
      s.pathway.digestion = 50;
      s.composure = s.maxComposure();
      assert.equal(s.toggleForm().active, true, `${pid} P${who}: Gestalt ab 50 %`);
      assert.ok(Math.abs(s.passive('dmg_mult') - v.dmg * 1.3) < 1e-9 && Math.abs(s.passive('damage_taken') - v.tk * 0.8) < 1e-9);
    });
  }
});

test('Schwellenwächter der Sequenz 4: im Kampf 2000 Leben, alle Pfade (Seb 2026-11-17)', () => {
  for (const pid of Object.keys(content.pathways)) for (const who of [1, 2]) {
    const s = new GameState(content);
    s.addP2();
    s.withPlayer(who, () => { s.pathway = { id: pid, seq: 5, digestion: 100 }; s.updateMaxHp(); s.hp = s.maxHp; });
    s.combatBy = who;
    s.splitOn = true;
    const c = new Combat(s, ordealId(pid, 4));
    assert.equal(c.enemy.maxHp, 2000, `${pid} P${who}`);
  }
});
