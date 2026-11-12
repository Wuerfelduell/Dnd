import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { DSH_ITEMS, DSH_ICONS } from '../src/data/dunscarAusbau.js';

const content = loadContent();

test('Dunscar-Ausbau: Speisewagen hat sichtbares Bett, Spind und Braukessel mit Schild', () => {
  const m = content.maps.ds_speisewagen;
  for (const [kind, label] of [['rest', 'Bett'], ['storage', 'Spind'], ['brew', 'Braukessel']]) {
    const d = m.interactables.find((i) => i.kind === kind);
    assert.equal(d?.label, label, kind);
  }
  assert.ok(m.decor.some((d) => d.sprite === 'dspi_speisewagen_bunk'));
  assert.ok(m.decor.some((d) => d.sprite === 'locker'));
  assert.ok(!m.rows.slice(1, -1).some((r) => r.slice(1, -1).includes('I')), 'keine Pfeiler mehr');
});

test('Dunscar-Ausbau: Gasthaus und Kalkapotheke hängen mit Tür an ihrem Viertel, Läden führen die neuen Mittel', () => {
  for (const [id, viertel, wirt] of [['ds_gasthaus', 'ds_arbeiterbogen', 'dsg_wirtin'], ['ds_apotheke', 'ds_kalkmarkt', 'dsa_apothekerin']]) {
    const tuer = content.maps[viertel].interactables.find((d) => d.kind === 'door' && d.to === id);
    assert.ok(tuer?.label, `${viertel} → ${id}`);
    assert.ok(content.maps[id].npcs.some((n) => n.id === wirt));
    assert.ok(content.market.merchants[wirt].stock.length >= 8);
  }
  const g = content.maps.ds_gasthaus.interactables;
  for (const k of ['rest', 'storage', 'brew']) assert.ok(g.some((d) => d.kind === k), k);
  const apo = content.market.merchants.dsa_apothekerin.stock.map((e) => e.item);
  for (const id of ['dsh_kalkelixier', 'dsh_wachtrank', 'dsh_stillschlaf', 'dsh_geisterblume']) assert.ok(apo.includes(id), id);
});

test('Dunscar-Ausbau: neue Mittel wirken stärker als die alten und haben Bilder aus dem Vorrat', () => {
  for (const [id, it] of Object.entries(DSH_ITEMS)) {
    assert.equal(content.items[id]?.kind, 'consumable', id);
    assert.ok(existsSync(new URL(`../public/sprites/items/${DSH_ICONS[id]}.png`, import.meta.url)), id);
    assert.ok(it.heal || it.composure || it.calm, id);
  }
  assert.ok(DSH_ITEMS.dsh_kalkelixier.heal > content.items.tonikum.heal * 8);
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 4, digestion: 50 };
  s.updateMaxHp();
  s.hp = 1;
  s.addItem('dsh_kalkelixier', 1);
  s.useItem('dsh_kalkelixier');
  assert.ok(s.hp >= 200, `Leben ${s.hp}`);
});

test('Dunscar-Ausbau: Händler am Kalkmarkt stehen an Ständen mit Schild', () => {
  const m = content.maps.ds_kalkmarkt;
  for (const id of ['ds_waffenhaendlerin', 'ds_kleiderhaendlerin', 'ds_kraeuterfrau', 'k3h_troedlerin']) {
    const n = m.npcs.find((x) => x.id === id);
    const st = m.interactables.find((d) => d.id === `${id}_stand`);
    assert.ok(st?.label && st.sprite === 'BA_staende', id);
    assert.deepEqual(st.tile, [n.tile[0], n.tile[1] - 1]);
  }
});
