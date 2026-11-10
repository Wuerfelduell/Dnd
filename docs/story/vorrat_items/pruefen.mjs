// Datenprüfung des isolierten Vorrats; fehlende Mechaniken werden nicht simuliert.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent } from '../../../tests/helpers.js';
import { GameState } from '../../../src/core/GameState.js';
const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const json = name => JSON.parse(read(`${name}.json`));
const items = json('items'), gear = json('gear'), artifacts = json('artifacts').list;
const dialogues = json('fundstuecke'), market = json('handel');
const existing = loadContent(), pending = read('offene_punkte.md');
const prompt = read('../../art/codex_BL_vorrat_items.md');
const expected = [...prompt.matchAll(/^\| `(vi_[a-z0-9_]+)` \|/gm)].map(m => m[1]);
assert.equal(expected.length, 72);
assert.deepEqual(Object.keys(items).sort(), expected.sort(), 'genau die 72 vereinbarten IDs');
const kinds = {gear:12, weapon:6, consumable:16, artifact:8, trophy:18, key:12};
for (const [kind,n] of Object.entries(kinds)) assert.equal(Object.values(items).filter(i=>i.kind===kind).length,n,kind);
const fields = new Set(['kind','name','desc','weight','price','slot','boons','curses','atk','occult','heal','composure','calm','combat_only','stun','source','rarity','inspect']);
const passiveKeys = new Set(['max_hp','max_nerves','sell','lock_bonus','honor_loss','carry','vision_cost','calm_decay','dodge_window','heal_bonus','always_flee']);
let specifications=0;
for (const [id,it] of Object.entries(items)) {
  assert(!existing.items[id], `${id}: Kollision mit laufendem Inhalt`);
  for (const f of Object.keys(it)) assert(fields.has(f), `${id}: unbekanntes Feld ${f}`);
  assert(it.name?.trim() && it.desc?.trim(), id);
  assert(Number.isFinite(it.weight) && it.weight>0, `${id}: Gewicht`);
  assert(Number.isInteger(it.price) && it.price>=0, `${id}: Preis`);
  assert.equal(it.price===0,it.kind==='key', `${id}: unverkäuflich`);
  if (it.inspect) assert(dialogues[it.inspect], `${id}: inspect fehlt`);
  for (const p of [...it.boons??[],...it.curses??[]]) {
    assert(p.text?.trim(),`${id}: Wirkungstext`);
    if ('key' in p) {
      assert(passiveKeys.has(p.key),`${id}: passiver Schlüssel ${p.key}`);
      assert(typeof p.value==='boolean' || Number.isFinite(p.value),`${id}: Wert`);
      assert.deepEqual(Object.keys(p).sort(),['key','text','value']);
    } else {
      specifications++;
      assert.deepEqual(Object.keys(p),['text']);
      assert(pending.includes(`### \`${id}\``) && pending.includes(p.text),`${id}: fehlender Integrationsvertrag`);
    }
  }
  if (it.kind==='consumable' && !['heal','composure','calm','stun'].some(f=>it[f])) assert(pending.includes(`### \`${id}\``),`${id}: wirkungsloser Verbrauch nicht dokumentiert`);
}
assert.equal(Object.keys(gear).length,12);
for(const [id,it] of Object.entries(gear)) assert.deepEqual(it,items[id],`${id}: Auszug driftet`);
for(const slot of ['hut','mantel','amulett']) {
  const ids=Object.keys(gear).filter(id=>gear[id].slot===slot);
  assert.equal(ids.length,4);
  for(const role of ['Kampf','Ermittlung','Reise','Soziales']) assert.equal(ids.filter(id=>read('README.md').includes(`| \`${id}\` | ${slot} | ${role} |`)).length,1);
}
assert.equal(Object.keys(artifacts).length,8);
for(const [id,a] of Object.entries(artifacts)) {
  const {kind,rarity,...rest}=items[id]; assert.deepEqual(a,rest);
  assert(a.boons.length>0 && a.curses.length>0,id);
  assert.equal(dialogues[a.inspect].nodes.start.text.match(/[.!?](?:\s|$)/g).length,3,`${id}: drei Fundsätze`);
}
assert.equal(Object.keys(dialogues).length,20);
let nodeCount=0;
for(const [id,d] of Object.entries(dialogues)) {
  assert(!existing.dialogues[id],`${id}: Kollision`);
  assert.equal(Object.values(items).filter(i=>i.inspect===id).length,1,`${id}: Besitzer`);
  const seen=new Set(), queue=[d.start];
  while(queue.length) {
    const key=queue.shift(); if(seen.has(key))continue;
    const n=d.nodes[key]; assert(n,`${id}.${key} fehlt`); seen.add(key);nodeCount++;
    assert(n.text.trim().split(/\s+/u).length<=90,`${id}.${key}: Leselänge`);
    assert.deepEqual(Object.keys(n).sort(),['choices','text'],`${id}: keine Wissens-/Flag-Effekte`);
    for(const ch of n.choices) {
      assert(ch.text?.trim());
      assert(Object.keys(ch).every(k=>['text','next'].includes(k)),`${id}: unerlaubte Referenz oder Effekt`);
      if(ch.next)queue.push(ch.next);
    }
  }
  assert.equal(seen.size,Object.keys(d.nodes).length,`${id}: unerreichbarer Knoten`);
  assert(Object.values(d.nodes).some(n=>n.choices.some(c=>!c.next)),`${id}: Ausgang fehlt`);
  if(id.startsWith('inspect_vi_k_')) assert.equal(seen.size,4,`${id}: drei Erkenntnisse plus Start`);
}
for(const prefix of ['vi_k_cw_','vi_k_bh_']) assert.equal(Object.keys(items).filter(id=>id.startsWith(prefix)).length,6);
for(const file of ['quests','encounters','dialogues','npcs','case','dialog_zusaetze']) assert.deepEqual(json(file),{},`${file}: keine fremden Referenzen/Quests`);
assert.deepEqual(json('platzierung'),[]);
assert.deepEqual(market.currency,existing.market.currency);
const stock=Object.values(market.merchants).flatMap(m=>m.stock);
assert.equal(stock.length,18);assert.equal(new Set(stock.map(s=>s.item)).size,18);
for(const entry of stock) {assert.equal(items[entry.item]?.kind,'trophy');assert.equal(entry.price,items[entry.item].price);}
assert.equal(Object.keys(market.sell_prices).length,60);
for(const [id,price] of Object.entries(market.sell_prices)){assert(items[id]);assert.equal(price,items[id].price);assert.notEqual(items[id].kind,'key');}
const best=Math.max(...Object.values(existing.items).filter(i=>i.kind==='weapon').map(i=>i.atk??0));
assert(best>=existing.items.ossuarklinge.atk,'vorhandene Waffenreferenz');
for(const it of Object.values(items).filter(i=>i.kind==='weapon')) {assert(it.atk<=best*1.25);assert(!it.occult || it.occult<=1.5);}
// Isoliertes Overlay nur für vorhandene Mechaniken, nicht in buildContent registriert.
const overlay={...existing,items:{...existing.items,...items},market:{...existing.market,...market}};
const state=new GameState(overlay);
for(const [id,it] of Object.entries(items)) assert.equal(state.sellPrice(id),it.kind==='key'?null:Math.round(it.price*.5),`${id}: echter Verkaufspreis`);
const hp=state.maxHp;
state.addItem('vi_hut_kurhaube');assert.equal(state.maxHp,hp+10);
state.hp=10;
for(let i=0;i<3;i++){state.takeOff('hut');state.wear('vi_hut_kurhaube');}
assert.equal(state.hp,10,'Umziehen darf nicht heilen');
state.addItem('vi_amulett_bleiletter');assert.equal(state.passive('vision_cost'),.7);
state.hp=1;state.applyConsumable(items.vi_v_setzerbrot);assert.equal(state.hp,31);
state.composure=0;state.applyConsumable(items.vi_v_terrassentee);assert.equal(state.composure,48);
state.setUnruhe(40);state.applyConsumable(items.vi_v_wurzelpastille);assert.equal(state.unruhe,15);
console.log('OK: 72 feste IDs; 12 Ausrüstung, 6 Waffen, 16 Verbrauch, 8 Artefakte, 18 Materialien, 12 Schlüssel.');
console.log(`OK: 20 Untersuchen-Dialoge, ${nodeCount} erreichbare Knoten; 8 Fundgeschichten; Lesestücke <= 90 Wörter.`);
console.log('OK: 18 Handelsangebote; 60 Verkaufsbasen; Preise, Auszüge, Waffenobergrenze und vorhandene Laufzeiteffekte.');
console.log(`HINWEIS: ${specifications} reine Wirkungstexte ohne passive Schlüssel; fehlende Mechaniken sind dokumentiert und nicht als implementiert geprüft.`);
console.log('OK: keine Quests, Platzierungen oder Kapitel-Flags; Vorrat nicht ins Spiel eingebaut.');
