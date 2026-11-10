import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { loadContent } from '../../../tests/helpers.js';
import { GameState } from '../../../src/core/GameState.js';
import { Combat } from '../../../src/core/Combat.js';
const pkgDir = new URL('../../../src/data/packs/k3_handel/', import.meta.url); // seit dem Einbau liegen die Daten im Spielpaket
const load = name => JSON.parse(readFileSync(new URL(`${name}.json`, pkgDir), 'utf8'));
const files = Object.fromEntries(readdirSync(pkgDir).filter(f => f.endsWith('.json')).map(f => [f.slice(0,-5), load(f.slice(0,-5))]));
const base = loadContent({ without: ['k3_handel'] });
const t = files.treffen_schichtbund, h = files.haendler, l = files.einzelgaenger.loners;
// Der echte Spielinhalt (buildContent mit dem Paket k3_handel); die Basis ohne das Paket dient dem Kollisions- und Belegungsvergleich.
const c = loadContent();
for (const key of ['quests','items','encounters','dialogues','npcs']) for (const id of Object.keys(files[key])) assert(!base[key][id], `Kollision ${key}/${id}`);
for (const m of t.maps) assert(!base.maps[m.id] && c.maps[m.id], `Karte ${m.id}`);
let checks=0;
const ok=(v,msg)=>{checks++; assert(v,msg);};
const walk=(v,fn)=>{if(!v||typeof v!=='object')return;if(!Array.isArray(v))fn(v);for(const x of Object.values(v))walk(x,fn);};
const produced=new Set();walk(base,o=>{for(const f of o.sets_flags??[])produced.add(f);if(o.done_flag)produced.add(o.done_flag);});
walk(files,o=>{for(const f of o.sets_flags??[])produced.add(f);if(o.done_flag)produced.add(o.done_flag);});
for(const id of Object.keys(l.list))for(const f of ['freund','feind'])produced.add(`${id}_${f}`);
// External contract only: BD/clock adapter must set AND clear this dynamic flag.
const external = new Set(['k3h_nacht']);
const lists={requires_flags:null,hide_if_flags:null,requires_items:'items',hide_if_items:'items',requires_clues:'clues',gives_clues:'clues',start_quests:'quests',complete_quests:'quests',requires_quests_active:'quests',requires_quests_done:'quests',hide_if_quests:'quests'};
walk(files,o=>{
 ok(!('platzhalter' in o),'Kein Platzhalter-Feld');
 for(const [key,space] of Object.entries(lists)) for(const id of o[key]??[])ok(space ? !!c[space][id] : produced.has(id)||external.has(id),`${key}: ${id}`);
 for(const field of ['gives_items','takes_items'])for(const id of Object.keys(o[field]??{}))ok(c.items[id],`${field}: ${id}`);
 for(const field of ['bond','requires_bond','requires_bond_max'])for(const id of Object.keys(o[field]??{}))ok(c.loners.list[id],`Bindung: ${id}`);
 for(const f of o.sets_flags??[])ok(/^(k3h_|ez_ds_)/.test(f)||f==='treffen_schichtbund',`Keine fremden Flags setzen: ${f}`);
 if(o.map)ok(c.maps[o.map],`Karte ${o.map}`);
 if(o.to)ok(c.maps[o.to],`Zielkarte ${o.to}`);
 if(o.item)ok(c.items[o.item],`Ware ${o.item}`);
 if(o.shop)ok(c.market.merchants[o.shop],`Laden ${o.shop}`);
 if(o.combat)ok(c.encounters[o.combat],`Kampf ${o.combat}`);
 if(o.auction)ok(c.gatherings.circles[o.auction],`Auktion ${o.auction}`);
 if(o.requires_pathway)ok(c.pathways[o.requires_pathway[0]],`Pfad ${o.requires_pathway}`);
});
for(const [id,n] of Object.entries(files.npcs))ok(c.dialogues[n.dialogue],`Figur ${id}: Dialog`);
const destinations=spec=>typeof spec==='string'?[spec]:Array.isArray(spec)?spec.map(x=>x.node):[];
for(const [id,d] of Object.entries({...files.dialogues,...Object.fromEntries(Object.keys(files.dialog_zusaetze).map(id=>[id,c.dialogues[id]]))})){
 const seen=new Set(), queue=destinations(d.start);
 while(queue.length){const key=queue.shift();ok(d.nodes[key],`${id}/${key}`);if(seen.has(key))continue;seen.add(key);for(const ch of d.nodes[key].choices??[])queue.push(...destinations(ch.next));}
 for(const key of Object.keys(files.dialogues[id]?.nodes??files.dialog_zusaetze[id]?.nodes_add??{}))ok(seen.has(key),`Unerreichbarer Knoten ${id}/${key}`);
}
// Placement bounds, collisions and flood-fill from a public spawn; adjacent interaction is sufficient.
const ownMaps=new Set([...files.platzierung.map(p=>p.map),...t.maps.map(m=>m.id)]);
for(const map of ownMaps){
 const m=c.maps[map],rows=m.rows,W=rows[0].length,H=rows.length;
 const walkable=([x,y])=>x>=0&&y>=0&&x<W&&y<H&&'.gsw'.includes(rows[y][x]);
 const reached=new Set(),todo=[m.spawns.default];
 while(todo.length){const p=todo.pop(),k=p.join(',');if(reached.has(k)||!walkable(p))continue;reached.add(k);const [x,y]=p;todo.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
 const own=[...files.platzierung.filter(p=>p.map===map).map(p=>({id:p.npc??p.interactable.id,tile:p.tile})),...(t.maps.find(x=>x.id===map)?.npcs??[]),...(t.maps.find(x=>x.id===map)?.interactables??[])];
 const spots=new Map();for(const o of [...(base.maps[map]?.npcs??[]),...(base.maps[map]?.interactables??[])])if(o.tile)spots.set(o.tile.join(','),o.id);
 for(const o of own){const [x,y]=o.tile;ok(walkable(o.tile),`${map}/${o.id} begehbar`);ok(!spots.has(o.tile.join(',')),`${map}/${o.id} belegt durch ${spots.get(o.tile.join(','))}`);spots.set(o.tile.join(','),o.id);ok([[x-1,y],[x+1,y],[x,y-1],[x,y+1]].some(p=>reached.has(p.join(','))),`${map}/${o.id} erreichbar`);}
}
for(const q of Object.values(files.quests))for(const s of q.steps){const m=c.maps[s.target.map];ok([...(m.npcs??[]),...(m.interactables??[])].some(o=>o.id===s.target.id),`Auftragsziel ${s.target.id}`);}
for(const [id,p] of Object.entries(t.pins))ok(p[0]>=0&&p[0]<512&&p[1]>=0&&p[1]<288,`Pin ${id}`);
const stock=[...Object.values(h.merchants).flatMap(m=>m.stock),...t.circles.schichtbund.members.flatMap(m=>m.offers)];
for(const e of stock){ok(!/^sq_zutat_.*_[1-5]$/.test(e.item),`Keine Kernzutat: ${e.item}`);ok(!/^formel_.*_[1-4]$/.test(e.item),`Keine hohe Formel: ${e.item}`);ok(e.price>0&&e.price<=1000,`Preis ${e.item}`);}
for(const p of ['sq_waage','sq_moor','sq_uhr'])ok(stock.find(x=>x.item===`formel_${p}_5`).price>stock.find(x=>x.item===`formel_${p}_6`).price,`Formelstaffel ${p}`);
ok(Object.keys(h.sell_prices).length===12,'12 Verkaufspreise');
const fresh=()=>{const s=new GameState(c);s.flags.add('k3_arrived');s.flags.add('briefed_04');s.map='ds_kalkmarkt';return s;};
const enter=(s,d,k)=>{const n=c.dialogues[d].nodes[k];ok(n,`${d}/${k}`);s.applyEffects(n,{nodeKey:`${d}.${k}`});s.visitNode(d,k);return n;};
const start=(s,d)=>enter(s,d,s.pick(c.dialogues[d].start));
const pick=(s,d,k,text)=>{const n=c.dialogues[d].nodes[k];const ch=n.choices.find(x=>x.text===text&&s.meets(x));ok(ch,`Option ${d}/${k}: ${text}`);const next=s.pick(ch.next);return next?enter(s,d,next):null;};
const take=(s,d,key)=>{start(s,d);const ch=c.dialogues[d].nodes.start.choices.find(x=>destinations(x.next).includes(key)&&s.meets(x));ok(ch,`Zugang ${d}/${key}`);return enter(s,d,s.pick(ch.next));};
const use=(s,id)=>{const p=files.platzierung.find(x=>x.interactable?.id===id);ok(p&&s.meets(p.visible_if),`Objekt verfügbar ${id}`);s.applyEffects(p.interactable.effects);s.flags.add(p.interactable.done_flag);};
const blocked=(s,d,key)=>ok(!c.dialogues[d].nodes.start.choices.some(ch=>destinations(ch.next).includes(key)&&s.meets(ch)),`Gesperrt ${d}/${key}`);
const completed=new Set();
const done=(s,q)=>{ok(s.quests[q]==='done',`Quest abgeschlossen ${q}`);for(const step of c.quests[q].steps)ok(s.meets(step.done),`Schritt ${q}: ${step.text}`);completed.add(q);};
// Each route starts from a fresh state. No own progress flags are preseeded.
{
 const s=fresh(),d='k3h_troedlerin';blocked(s,d,'abgabe');take(s,d,'auftrag');use(s,'k3h_mantelnaht');take(s,'ez_ds_rangierer','mantel');take(s,d,'abgabe');done(s,'k3h_mantelbesitzer');blocked(s,d,'abgabe');
}
{
 const s=fresh(),d='k3h_steinmetz';take(s,d,'auftrag');use(s,'k3h_mass_vorn');blocked(s,d,'abgabe');use(s,'k3h_mass_hinten');take(s,d,'abgabe');done(s,'k3h_steinmass');blocked(s,d,'abgabe');
 s.money=59;blocked(s,d,'gravur');s.money=60;take(s,d,'gravur');ok(s.money===0&&s.itemCount('k3h_namenstaefelchen')===1,'Gravur genau 60');blocked(s,d,'gravur');
}
{
 const s=fresh(),d='k3h_lampenwart';take(s,d,'auftrag');s.addItem('k3o_leitungsklemme',3);blocked(s,d,'klemme1');s.removeItem('k3o_leitungsklemme',3);use(s,'k3h_klemmkasten');
 for(let i=1;i<=3;i++){take(s,d,`klemme${i}`);blocked(s,d,`klemme${i}`);ok(s.itemCount('k3o_leitungsklemme')===3-i,'Exakt eine Klemme verbraucht');}
 take(s,d,'abgabe');done(s,'k3h_klemmen');blocked(s,d,'abgabe');ok(!s.meets(files.platzierung.find(p=>p.interactable?.id==='k3h_klemmkasten').visible_if),'Bergung nicht wiederholbar');
}
function admit(s){
 take(s,'tm_ds_kerbholz','aufnahme');take(s,'k3h_steinmetz','kerbholz');blocked(s,'zirkel_schichtbund','aufnahme');
 // The existing main-story source teaches the pattern; no fabricated k3a_ruf flag.
 s.addClue('k3a_14_c2');blocked(s,'zirkel_schichtbund','aufnahme');s.flags.add('k3h_nacht');take(s,'zirkel_schichtbund','aufnahme');done(s,'k3h_aufnahme');blocked(s,'zirkel_schichtbund','aufnahme');
}
for(const [d,q] of [['tm_ds_lampe','k3h_lampenrechnung'],['tm_ds_kerbholz','k3h_doppelte_kerbe'],['tm_ds_stimme','k3h_nachtwalze']]){
 const s=fresh();blocked(s,d,'auftrag');admit(s);take(s,d,'auftrag');use(s,q+'_fund1');blocked(s,d,'abgabe');
 if(d==='tm_ds_stimme'){s.flags.delete('k3h_nacht');ok(!s.meets(files.platzierung.find(p=>p.interactable?.id===q+'_fund2').visible_if),'Nachtauftrag tagsüber gesperrt');s.flags.add('k3h_nacht');}
 use(s,q+'_fund2');take(s,d,'abgabe');done(s,q);blocked(s,d,'abgabe');ok(Object.values(s.bonds).includes(1),'Mitgliederauftrag wirkt auf Bindung');
}
ok(completed.size===Object.keys(files.quests).length,'Jeder Auftrag durchgespielt');
for(const id of Object.keys(l.list)){
 for(const sign of ['gut','schlecht']){
  const s=fresh();for(let i=1;i<=3;i++){take(s,id,sign+i);blocked(s,id,sign+i);}
  ok(s.bond(id)===(sign==='gut'?3:-3),'Bindungsgrenze');ok(s.flags.has(id+(sign==='gut'?'_freund':'_feind')),'Statusflag');
  if(sign==='gut'){take(s,id,'gabe');ok(s.itemCount(id+'_gabe')===1,'Freundschaftsgabe');blocked(s,id,'gabe');blocked(s,id,'kampf');}
  else {take(s,id,'verrat');blocked(s,id,'verrat');s.flags.delete(id+'_alarm');blocked(s,id,'verrat');take(s,id,'kampf');ok(s.pendingCombat===id||s.combat===id,'Kampf ausgelöst');s.applyEffects(files.encounters[id].on_win);blocked(s,id,'kampf');ok(s.flags.has(id+'_besiegt'),'Siegesflag');}
 }
 for(const e of ['rein','moor','lichtmeister','meer'])if(['ez_ds_rangierer','ez_ds_schrankenkind'].includes(id)){const s=fresh();s.flags.add('k2_end_'+e);take(s,id,'wexmoor_'+e);}
 const s=fresh();s.pathway={id:l.list[id].pathway,seq:5};take(s,id,'pfad');
}
{
 const s=fresh();admit(s);s.map='treffen_schichtbund';s.playTime=0;
 ok(s.gatheringOpen('schichtbund'),'Treffen offen');ok(s.startSession('schichtbund').ok,'Auktion startet');
 s.playTime=6*60;ok(!s.gatheringOpen('schichtbund'),'Treffen nach 6 Minuten geschlossen');
}
for(const [id,item] of Object.entries(files.items).filter(([,it])=>it.kind==='consumable')){
 const s=fresh();s.money=100;s.hp=5;s.composure=5;ok(s.buy('k3h_lampenwart',id).ok,'Hilfsmittel kaufbar');
 if(item.combat_only){const combat=new Combat(s,'ez_ds_rangierer');combat.useItem(id);}else s.useItem(id);
 ok(s.itemCount(id)===0,`Hilfsmittel einmal verbraucht ${id}`);
}
console.log(`BC OK: ${Object.keys(files.quests).length} Aufträge vollständig durchgespielt; ${Object.keys(files.npcs).length} Figuren; 5 Freund-/Feindwege; 6 Wexmoor-Formeln; 12 Verkaufspreise.`);
console.log(`BC OK: ${checks} Prüfungen zu Referenzen, Dialogwegen, Begehbarkeit, Preisen, Verbrauch, Belohnungssperren und Auktion.`);
console.log('OFFEN: BN-Horchstellenalarm (ez_ds_*_alarm), Auktionsmetadaten (once/requires_pathway) in Auction.memberLot. Zeitadapter (src/core/Clock.js) und BE-Grafik sind eingebaut.');
