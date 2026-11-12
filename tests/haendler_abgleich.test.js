import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';

// Händler-Abgleich (Seb, 2026-11-12): Ware passt zum Gebiet, alte Stücke gibt es auch später noch zu alten Preisen.
const content = loadContent();
const M = content.market.merchants;
const atk = (mid) => M[mid].stock.map((e) => content.items[e.item]).filter((i) => i?.kind === 'weapon' && i.atk).map((i) => i.atk);

test('Waffen werden mit jedem Gebiet stärker: Wexmoor < Dunscar-Steinmetz < Calderwick/Briarholt', () => {
  assert.ok(Math.max(...atk('wx_pfandleiherin')) >= 9);
  assert.ok(Math.max(...atk('ds_waffenhaendlerin')) >= 12);
  const spaet = ['vi_handel_druckerei', 'vi_handel_garten', 'vi_handel_reise'].flatMap((m) => M[m].stock.filter((e) => e.rare === undefined).map((e) => content.items[e.item]).filter((i) => i.kind === 'weapon').map((i) => i.atk));
  assert.equal(spaet.length, 6);
  assert.ok(Math.min(...spaet) > Math.max(...atk('k3h_steinmetz')));
});

test('In jedem späteren Gebiet gibt es alte Stücke zu alten Preisen', () => {
  const alt = (mid, item, price) => {
    const e = M[mid].stock.find((x) => x.item === item);
    assert.ok(e, `${mid}: ${item}`);
    assert.equal(e.price, price, `${mid}: ${item}`);
  };
  alt('wx_pfandleiherin', 'revolver', 160); // Gorse-Preis
  alt('wx_pfandleiherin', 'ossuarklinge', 220); // Kettlegater Zirkel
  alt('ds_waffenhaendlerin', 'zirkel_salzharpune', 560); // Wexmoorer Zirkel
  alt('k3h_troedlerin', 'hungriger_ring', 420); // altes Artefakt, Dunscar-Gegner droppen keine mehr
  alt('vi_handel_reise', 'k3h_faeustel', 900); // Dunscar-Preis (Steinmetz, dunscarAusbau.js)
  alt('ds_kleiderhaendlerin', 'wachsamulett', 80);
  assert.ok(M.vi_handel_reise.buys, 'Ankauf in Calderwick/Briarholt');
});

test('Keine Formeln oder Seq-Zutaten durch den Abgleich, Restposten sind kaufbar', () => {
  for (const mid of ['wx_pfandleiherin', 'ds_waffenhaendlerin', 'ds_kleiderhaendlerin', 'vi_handel_reise']) {
    for (const e of M[mid].stock) assert.ok(!/^(formel_|sq_zutat_)/.test(e.item), `${mid}: ${e.item}`);
  }
  const s = new GameState(content);
  s.money = 100000;
  const e = s.shopStock('vi_handel_reise').find((x) => M.vi_handel_reise.stock.find((y) => y.item === x.item)?.rare);
  assert.ok(e, 'mindestens ein Restposten sichtbar');
  assert.ok(s.buy('vi_handel_reise', e.item).ok);
});
