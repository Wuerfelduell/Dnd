import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadContent} from '../../../tests/helpers.js';
import {GameState} from '../../../src/core/GameState.js';
const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const json = name => JSON.parse(read(name + '.json'));
const content = loadContent();
const npcs=json('npcs'), dialogues=json('dialogues'), seeds=json('auftragskeime'), reactions=json('reaktionen');
const expected = ['cw_crayford','cw_ida_bellcross','cw_noel_bellcross','cw_wetherby','cw_darnell','cw_hesk','cw_wicksend','cw_bexley','cw_malliver','cw_pritch','bh_bellweather','bh_orla_fencrest','bh_felix_fencrest','bh_greavesend','bh_vellish','bh_malkin','bh_rookwell','bh_henshall','bh_crowther','bh_dipple','vn_kutscherin','vn_zoellner','vn_hausiererin','vn_landarzt','vn_wanderprediger','vn_kartenzeichnerin','vn_fahrender_richter','vn_waisenjunge'];
const pathways=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr'];
const allowed = (o, keys, where) => Object.keys(o).forEach(k=>assert(keys.includes(k),`${where}: unerlaubtes Feld ${k}`));
const text = (s, where) => assert(typeof s==='string' && s.trim() && s.trim().split(/\s+/u).length<=90, `${where}: leer oder über 90 Wörter`);
assert.deepEqual(Object.keys(npcs).sort(), [...expected].sort());
assert.equal(Object.keys(dialogues).length,28);
for (const f of ['quests','items','encounters','case','dialog_zusaetze']) assert.deepEqual(json(f),{});
assert.deepEqual(json('platzierung'),[]);
const idsFrom = (file, prefix) => new Set([...read(file).matchAll(new RegExp('`('+prefix+'[a-z0-9_]+)`','g'))].map(m=>m[1]));
const vi=idsFrom('../../art/codex_BL_vorrat_items.md','vi_');
const vg=idsFrom('../../art/codex_BH_vorrat_gegner.md','vg_');
const usedItems=new Set(),usedEnemies=new Set();
function refs(o) {
  if (typeof o==='string') {
    for(const id of o.match(/\b(?:vi|vg)_[a-z0-9_]+\b/g)??[]) {
      assert((id.startsWith('vi_')?vi:vg).has(id),`Nicht deklarierte ID: ${id}`);
      (id.startsWith('vi_')?usedItems:usedEnemies).add(id);
    }
  } else if(o && typeof o==='object') for(const [k,v] of Object.entries(o)){refs(k);refs(v);}
}
refs(seeds);refs(dialogues);
let nodes=0,scenarios=0,services=0;
for (const [id,npc] of Object.entries(npcs)) {
  allowed(npc,['name','role','dialogue','palette'],id);
  assert(!content.npcs[id],`Kollision mit eingebundener Figur ${id}`);
  assert(!content.dialogues[npc.dialogue],`Dialog-Kollision ${npc.dialogue}`);
  assert.equal(Object.keys(npc.palette).length,5);
  for(const c of Object.values(npc.palette))assert.match(c,/^#[a-f0-9]{6}$/i);
  const d=dialogues[npc.dialogue];assert(d,id);allowed(d,['start','nodes'],id);
  assert.equal(Object.keys(d.nodes).length,id.startsWith('vn_')?12:10);nodes+=Object.keys(d.nodes).length;
  assert.equal(d.start.length,3);
  for(const s of d.start){allowed(s,['node','requires_honor'],id);assert(d.nodes[s.node]);}
  const state=new GameState(content);
  for(const honor of [-5,0,9,10,39,40,80]) {state.honor=honor;assert.equal(state.pick(d.start),honor>=40?'gruss_hoch':honor>=10?'gruss_mittel':'gruss_niedrig');}
  for(const [key,node] of Object.entries(d.nodes)) {
    allowed(node,['text','choices','takes_money','heal','nerves','gives_items'],id+':'+key);text(node.text,key);assert(node.choices.length);
    for(const c of node.choices){allowed(c,['text','next','requires_pathway','requires_money'],key);text(c.text,key);if(c.next)assert(d.nodes[c.next],`${id}:${c.next}`);if(c.requires_pathway){assert(pathways.includes(c.requires_pathway[0]));assert.equal(c.requires_pathway[1],9);state.pathway=null;assert(!state.meets(c));state.pathway={id:c.requires_pathway[0],seq:9};assert(state.meets(c));state.pathway={id:c.requires_pathway[0],seq:10};assert(!state.meets(c));}}
  }
  assert.equal(d.nodes.hub.choices.filter(c=>c.requires_pathway).length,1);
  const reached=new Set();
  for(const honor of [0,10,40])for(const path of [null,...pathways])for(const money of [0,100]) {
    state.honor=honor;state.pathway=path?{id:path,seq:3,digestion:0}:null;state.money=money;
    const seen=new Set(),queue=[state.pick(d.start)];
    while(queue.length){const key=queue.shift();if(seen.has(key))continue;seen.add(key);reached.add(key);for(const c of d.nodes[key].choices)if(state.meets(c)&&c.next)queue.push(c.next);}
    // Reverse reachability: every reachable node has an available route to a terminal choice.
    const exits=new Set([...seen].filter(k=>d.nodes[k].choices.some(c=>state.meets(c)&&!c.next)));
    let old=-1;while(old!==exits.size){old=exits.size;for(const k of seen)if(d.nodes[k].choices.some(c=>state.meets(c)&&exits.has(c.next)))exits.add(k);}
    assert.equal(exits.size,seen.size,`${id}: gefangener Dialogzustand`);scenarios++;
  }
  assert.deepEqual([...reached].sort(),Object.keys(d.nodes).sort(),`${id}: unerreichbarer Knoten`);
  const paid=Object.entries(d.nodes).filter(([,n])=>n.takes_money);
  assert.equal(paid.length,id.startsWith('vn_')?1:0);
  for(const [key,node] of paid){services++;const incoming=Object.values(d.nodes).flatMap(n=>n.choices).filter(c=>c.next===key);assert.equal(incoming.length,1);assert.equal(incoming[0].requires_money,node.takes_money);assert(Number.isInteger(node.takes_money)&&node.takes_money>0);
    for(const money of [0,node.takes_money-1,node.takes_money,node.takes_money*2]){state.money=money;assert.equal(state.meets(incoming[0]),money>=node.takes_money);}
    const delivered={};state.addItem=(item,n)=>{delivered[item]=(delivered[item]??0)+n;};state.pathway=null;state.hp=1;state.composure=10;state.money=node.takes_money*2;
    state.applyEffects(node);assert.equal(state.money,node.takes_money);assert.equal(state.hp,1+(node.heal??0));assert.equal(state.composure,10+(node.nerves??0));assert.deepEqual(delivered,node.gives_items??{});
    state.applyEffects(node);assert.equal(state.money,0);assert(!state.meets(incoming[0]));
  }
}
assert.equal(seeds.keime.length,28);assert.equal(seeds.ketten.length,4);
assert.deepEqual(seeds.keime.map(s=>s.figur).sort(),[...expected].sort());
const seedIds=new Set(seeds.keime.map(s=>s.id));assert.equal(seedIds.size,28);
for(const s of [...seeds.keime,...seeds.ketten]){
  text(s.title,s.id);assert(s.schritte.length>=3&&s.schritte.length<=5);s.schritte.forEach(t=>text(t,s.id));assert(s.spielzeit_minuten>0);assert(dialogues[s.ausloeser.dialogue]?.nodes[s.ausloeser.node]);
  allowed(s.belohnung,['gives_money','gives_items'],s.id);assert(s.belohnung.gives_money>=0);for(const [item,n] of Object.entries(s.belohnung.gives_items??{})){assert(vi.has(item));assert(Number.isInteger(n)&&n>0);}
  assert(s.gegner.length&&s.gegner.every(g=>vg.has(g)));text(s.friedlicher_weg,s.id);
}
for(const city of ['cw','bh']){const chains=seeds.ketten.filter(c=>c.id.startsWith('bj_kette_'+city+'_'));assert.equal(chains.length,2);for(const c of chains){assert(c.figuren.length>=2&&c.figuren.length<=3);assert.equal(new Set(c.figuren).size,c.figuren.length);assert.deepEqual(c.keime,c.figuren.map(id=>'bj_keim_'+id));for(const id of c.figuren)assert(id.startsWith(city+'_')&&npcs[id]);c.keime.forEach(id=>assert(seedIds.has(id)));}}
assert.deepEqual(reactions.wiedersehen.map(r=>r.npc).sort(),['pimm','marlowe','holt','zunder','hale','brack','k3_pfiff','k3_weichenstellerin'].sort());
for(const r of reactions.wiedersehen){assert(content.npcs[r.npc],r.npc);for(const city of ['calderwick','briarholt']){assert.equal(r[city].length,3);r[city].forEach(t=>text(t,r.npc));}}
assert.equal(reactions.geplauder.length,8);
assert.deepEqual(reactions.geplauder.map(g=>g.id).sort(),expected.filter(id=>id.startsWith('vn_')).map(id=>'bj_pl_'+id).sort());
for(const g of reactions.geplauder){allowed(g,['id','zeilen'],g.id);assert.deepEqual(g.zeilen.map(l=>l.p),['p2','p1','p2','p1']);for(const l of g.zeilen){allowed(l,l.p==='p2'?['p','a','b']:['p','text'],g.id);for(const k of l.p==='p2'?['a','b']:['text'])text(l[k],g.id);}}
const profiles=read('steckbriefe.md'), graphics=read('grafikwuensche.md');
assert.equal((profiles.match(/^## /gm)??[]).length,28);
assert.equal((graphics.match(/^\| `(?:cw|bh|vn)_/gm)??[]).length,28);
for(const id of expected){const section=profiles.split('## '+id+' – ')[1]?.split('\n## ')[0];assert(section,id);for(const field of ['Alter','Rolle','Ort','Pfad und Sequenz','Aussehen','Stimme','Wunsch','Angst','Geheimnis (nur Redaktion)','Sonderpose','Auftragskeim'])assert(section.includes('**'+field+':**'),id+':'+field);const pose=section.match(/\*\*Sonderpose:\*\* `([^`]+)`/)[1];const row=graphics.split('\n').find(l=>l.startsWith('| `'+id+'`'));assert(row?.includes('`'+pose+'`')&&row.includes('64×32')&&row.includes('No letters'));}
for(const num of [1,2]){const source=read('../kapitel3/geschichte_'+num+'.md');const table=source.split('## 4.')[1].split('## 5.')[0];const rows=table.split('\n').filter(l=>l.startsWith('| ')&&!l.startsWith('| Figur')&&!l.startsWith('|---'));let matched=0;for(const row of rows){const cells=row.split('|').map(x=>x.trim());const secret=cells[3];if(secret&&profiles.includes('**Geheimnis (nur Redaktion):** '+secret)){matched++;assert(!JSON.stringify(dialogues).includes(secret),'Geheimnis vollständig im Dialog');}}assert.equal(matched,10,`Kanon Geschichte ${num}`);}
console.log(`OK: ${expected.length} Figuren, ${nodes} Knoten, ${scenarios} Zustandsgraphen mit Ausstieg.`);
console.log(`OK: Ansehensgrenzen, Pfadbedingungen und ${services} bezahlte Dienste mit GameState geprüft.`);
console.log(`OK: 28 Keime, 4 Ketten, 48 Wiedersehenszeilen, 8 Geplauder für beide Varianten.`);
console.log(`OK: 20 kanonische Geheimnisse, 28 Steckbriefe und 28 Sonderposen.`);
console.log(`OK: ${usedItems.size} vi_- und ${usedEnemies.size} vg_-IDs in festen BL/BH-Tabellen deklariert.`);
console.log(`Hinweis: ${[...usedItems].filter(id=>!content.items[id]).length} verwendete Items und ${[...usedEnemies].filter(id=>!content.encounters[id]).length} Gegner nicht in loadContent eingebunden; keine Laufzeitfreigabe.`);
console.log('OK: Standarddateien leer; keine Karten-, Flag- oder Questabhängigkeiten im Laufzeitpaket.');
