import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadContent} from '../../../tests/helpers.js';
import {applyQuestPack} from '../../../src/data/questPacks.js';
import {GameState} from '../../../src/core/GameState.js';
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
const json=f=>JSON.parse(read(f+'.json'));
const kult=json('kulte'), events=json('ereignisse'), enemy=json('gegner'), fig=json('figuren'), jobs=json('auftraege'), extras=json('dialog_zusaetze'), text=json('texte');
const base=loadContent();
// Scan every user-facing short field, including nested item and quest descriptions.
function checkShortFields(value) {
  if (Array.isArray(value)) { value.forEach(checkShortFields); return; }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (['title','titel','summary','desc','name','beiname','hud','wegweiser','label','meldung'].includes(key) && typeof child === 'string')
      assert([...child].length <= 140, `${key}: Oberfläche über 140 Zeichen`);
    checkShortFields(child);
  }
}
[kult, events, enemy, fig, jobs, extras, text].forEach(checkShortFields);
const city=m=>m.startsWith('wx_')?'wx':m.startsWith('ds_')?'ds':'kg';
const map=m=>assert(base.maps[m],`Unbekannte Karte ${m}`);
const short=(v,max,where)=>assert(typeof v==='string'&&v.trim()&&[...v].length<=max,`${where}: ${[...(v??'')].length} Zeichen, erlaubt ${max}`);
const keys=(o,allowed,where)=>Object.keys(o).forEach(k=>assert(allowed.includes(k),`${where}: unbekanntes Laufzeitfeld ${k}`));
const unique=(ids,where)=>assert.equal(new Set(ids).size,ids.length,`${where}: doppelte IDs`);
const ownedFlag=f=>assert(f.startsWith('sk_')&&Object.hasOwn(text.flags,f),`Flag nicht deklariert: ${f}`);
const dialogs={...fig.dialogues,...text.ereignis_dialoge,...text.auftrags_dialoge};
assert.equal(Object.keys(dialogs).length,Object.keys(fig.dialogues).length+Object.keys(text.ereignis_dialoge).length+Object.keys(text.auftrags_dialoge).length);
const dialogRef=r=>assert(dialogs[r.id]?.nodes[r.node],`Unbekannter Dialog/Knoten: ${JSON.stringify(r)}`);
const item=id=>assert(enemy.items[id]||base.items[id],`Unbekanntes Item ${id}`);
const quest=id=>assert(jobs.quests[id],`Unbekannte Quest ${id}`);
const ENEMY_FIELDS=['name','sheet','sprite','fleeable','hp','armor','occult','intro','attacks','win_text','lose_money','lose_text','flee_text','loot','flees_after','elite','boss'];
const NODE_FIELDS=['text','choices','sets_flags','clears_flags','start_quests','complete_quests','nerves','takes_items','gives_items'];
const CHOICE_FIELDS=['text','next','requires_flags','hide_if_flags','requires_items','requires_quests_active','hide_if_quests','requires_pathway'];
const condition=o=>{
 for(const field of ['requires_flags','hide_if_flags','sets_flags','clears_flags'])for(const f of o[field]??[])ownedFlag(f);
 for(const field of ['start_quests','complete_quests','requires_quests_active','hide_if_quests'])for(const q of o[field]??[])quest(q);
 for(const i of o.requires_items??[])item(i);
 for(const field of ['takes_items','gives_items'])for(const [i,n] of Object.entries(o[field]??{})){item(i);assert(Number.isInteger(n)&&n>0);}
 if(o.nerves!==undefined)assert(o.nerves>=-10&&o.nerves<=0);
};
// All new content must be distinct from the live game.
for(const [own,live] of [[fig.npcs,base.npcs],[enemy.items,base.items],[enemy.encounters,base.encounters],[jobs.quests,base.quests],[dialogs,base.dialogues]])for(const id of Object.keys(own))assert(!live[id],`Kollision mit bestehendem Inhalt: ${id}`);
assert.equal(kult.length,3);unique(kult.map(k=>k.id),'Kulte');
assert.deepEqual(kult.map(k=>k.id),['sk_asche','sk_flut','sk_chor']);
assert.equal(events.length,36);unique(events.map(e=>e.id),'Ereignisse');
let newspaperCount=0,gossipCount=0,coverage=[];
for(const k of kult){
 assert.equal(k.zustand,k.id+'_stufe');assert.deepEqual(text.einbau.zahlen[k.zustand],{typ:'integer',min:0,max:3,initial:0});
 assert.equal(k.glaube.length,3);k.glaube.forEach(s=>short(s,220,k.id));assert.deepEqual(k['ränge'],['Novize','Sprecher','Hand','Haupt']);
 map(k.heimat);k.wanderkarten.forEach(map);unique(k.wanderkarten,k.id);assert.equal(k.wanderkarten.length,9);assert.equal(new Set(k.wanderkarten.map(city)).size,3);assert(k.wanderkarten.filter(m=>city(m)===city(k.heimat)).length<=3);
 const es=events.filter(e=>e.kult===k.id);assert.equal(es.length,12);
 assert.deepEqual([...new Set(es.flatMap(e=>e.karten))].sort(),[...k.wanderkarten].sort());
 assert.deepEqual(new Set(es.map(e=>e.art)),new Set(['spur','werbung','abwerbung','sabotage','schrein','ueberfall','zeichen_am_haus']));
 let previous=new Set(),counts=[];
 for(let s=0;s<4;s++){
  const stage=k.stufen[s];assert.equal(stage.name,['Gerücht','Spuren','Umtriebe','Aufmarsch'][s]);assert(stage.ereignisrate>=0&&stage.ereignisrate<=1);
  const ids=es.filter(e=>e.min_stufe<=s).map(e=>e.id);assert.deepEqual(stage.freischaltet,ids);
  const maps=new Set(es.filter(e=>ids.includes(e.id)).flatMap(e=>e.karten));assert(maps.size>previous.size);for(const m of previous)assert(maps.has(m));assert.equal(new Set([...maps].map(city)).size,3);previous=maps;counts.push(maps.size);
  const t=text.stufen[k.id][s];assert.equal(t.zeitung.length,3);assert.equal(t.gerede.length,6);
  for(const n of t.zeitung){keys(n,['id','zeitung','requires_flags','hide_if_flags','title','text','kurz'],n.id);assert(base.newspapers.some(p=>p.zeitung===n.zeitung));condition(n);short(n.title,140,n.id);short(n.text,220,n.id);n.kurz.forEach(v=>short(v,140,n.id));newspaperCount++;}
  for(const line of t.gerede){short(line,220,'Gerede');gossipCount++;}
  short(t.hud,140,'HUD');short(t.wegweiser,140,'Wegweiser');short(t.notizbuch,300,'Notizbuch');
 }
 assert.deepEqual(counts,[3,6,8,9]);coverage.push(k.id+': '+counts.join('/'));
}
assert.equal(newspaperCount,36);assert.equal(gossipCount,72);
unique(Object.values(text.stufen).flatMap(st=>Object.values(st).flatMap(s=>s.zeitung.map(p=>p.id))),'Zeitung');
for(const e of events){
 assert(kult.some(k=>k.id===e.kult));assert(e.id.startsWith(e.kult+'_'));assert(Number.isInteger(e.min_stufe)&&e.min_stufe>=0&&e.min_stufe<=3);assert([-1,0,1].includes(e.folge_stufe));assert(['tag','nacht','immer'].includes(e.zeit));e.karten.forEach(map);unique(e.karten,e.id);
 short(e.titel,140,e.id);short(e.meldung,140,e.id);short(e.koop_zeile,220,e.id);condition(e.visible_if);condition(e.start);condition(e.ende);
 assert(e.visible_if.hide_if_flags.includes(e.id+'_erledigt'));assert(e.ende.clears_flags.includes(e.id+'_aktiv'));
 if(e.dialog)dialogRef(e.dialog);
 if(e.art==='spur'){short(e.text,220,e.id);ownedFlag(e.setzt_hinweis);assert(e.ende.sets_flags.includes(e.setzt_hinweis));}
 if(e.art==='werbung'){const d=dialogs[e.dialog.id];assert.equal(d.nodes.start.choices.length,3);assert.equal(d.nodes.mitgehen.nerves,-5);assert(d.nodes.mitgehen.sets_flags.includes(e.id+'_mitgegangen'));assert(d.nodes.mitgehen.clears_flags.includes(e.id+'_aktiv'));}
 if(e.art==='abwerbung'){
  assert(base.npcs[e.figur]);assert([1440,2880].includes(e.dauer_min));quest(e.rueckholung);assert.equal(e.rueckkehr.bei_quest,e.rueckholung);for(const f of ['bei_zeitablauf','bei_hauptinteraktion','bei_kapitelwechsel'])assert.equal(e.rueckkehr[f],true);
  assert(!e.rueckkehr.zeitablauf_effekte.complete_quests);assert(!e.rueckkehr.zeitablauf_effekte.gives_money);
  assert(e.karten.some(m=>(base.maps[m].npcs??[]).some(n=>n.id===e.figur)),e.id+': Figur nicht auf Ereigniskarte');
 }
 if(e.art==='sabotage'){
  assert(e.dauer_min>=6&&e.dauer_min<=20);assert.equal(e.wirkung.nur_aktuelle_karte,true);item(e.gegenmassnahme.item);dialogRef(e.gegenmassnahme.dialog);dialogRef(e.gegenmassnahme.kostenlos);assert.deepEqual(e.ablauf,e.ende);
  const d=dialogs[e.gegenmassnahme.kostenlos.id],free=d.nodes[e.gegenmassnahme.kostenlos.node];assert(!free.takes_items&&!free.takes_money&&!free.nerves);assert.deepEqual(free.clears_flags,e.ende.clears_flags);
  if(e.wirkung.art==='heilung')assert.equal(e.wirkung.heiltrank_faktor,0.5);
  if(e.wirkung.art==='reise'){assert.equal(e.wirkung.aufpreis_schilling,5);assert(e.wirkung.hauptreise_ausgenommen);assert.equal(e.wirkung.bei_geldmangel,0);}
  if(e.wirkung.art==='nacht'){ownedFlag(e.wirkung.nachtflag);assert(e.ende.clears_flags.includes(e.wirkung.nachtflag));}
 }
 if(e.art==='schrein'){assert(e.gegner.length>=2&&e.gegner.length<=3);assert.equal(e.abbauen.stufe_delta,-1);dialogRef(e.abbauen.dialog);assert(e.beute.drops.length);for(const x of e.beute.drops)item(x.item);assert(dialogs[e.dialog.id].nodes.ablenken);}
 if(e.art==='ueberfall'){assert(e.min_stufe>=2);dialogRef(e.ausweichen.dialog);}
 if(e.art==='zeichen_am_haus'){assert(base.npcs[e.figur]);dialogRef(e.naechster_besuch.dialog);assert(e.karten.some(m=>base.maps[m].npcs.some(n=>n.id===e.figur)));}
 for(const id of e.gegner??[])assert(enemy.encounters[id],id);
}
assert.deepEqual(new Set(events.filter(e=>e.art==='abwerbung').map(e=>e.figur)),new Set(['pimm','ned','sedge','brack','k3n_secondhaendler','k3e_zeitungsfrau']));
const cityData=JSON.parse(read('../../../src/data/stadtgegner.json'));
const moneyRanges=new Set(Object.values(cityData.encounters).map(e=>JSON.stringify(e.loot?.money)));
assert.equal(Object.keys(enemy.encounters).length,12);assert.equal(Object.keys(enemy.profile).length,12);assert.equal(Object.keys(enemy.items).length,12);
for(const [id,e] of Object.entries(enemy.encounters)){
 keys(e,ENEMY_FIELDS,id);assert(id.startsWith('enemy_sk_'));assert.equal(e.sheet,id);assert(e.fleeable);assert.equal(e.lose_money,0);assert(e.hp>0);assert(moneyRanges.has(JSON.stringify(e.loot.money)));
 for(const field of ['intro','win_text','lose_text','flee_text'])short(e[field],220,id);
 for(const d of e.loot.drops){item(d.item);assert(d.item.startsWith('ski_'));assert(d.chance>=0&&d.chance<=1);}
 const p=enemy.profile[id];assert([1,2,3].includes(p.tier));assert.equal(p.atk,e.attacks[0].damage);assert.equal(p.nervenverlust_max,0);
 const checkAttack=a=>{keys(a,['name','damage','hits'],id);short(a.name,140,id);assert(a.damage>0&&a.hits.length>0);a.hits.forEach(t=>assert(t>=600));};e.attacks.forEach(checkAttack);
 assert.deepEqual(p.skills[0].attacks,e.attacks);p.skills.flatMap(s=>s.attacks).forEach(checkAttack);
 if(id.endsWith('_novize'))assert.equal(e.flees_after,3);
 if(id.endsWith('_haupt')){assert(e.elite&&e.boss);assert.equal(p.tier,3);assert.equal(p.skills.length,2);assert.deepEqual(p.skills.map(s=>[s.hp_von,s.hp_bis]),[[1,0.5],[0.5,0]]);}else assert.equal(p.skills.length,1);
}
const requiredNPC=['sk_asche_sprecher_ida','sk_asche_aussteiger_tobin','sk_asche_opfer_wenz','sk_flut_sprecher_maren','sk_flut_aussteiger_pell','sk_flut_opfer_lotte','sk_chor_sprecher_ansgar','sk_chor_aussteiger_rike','sk_chor_opfer_jost'];
assert.deepEqual(Object.keys(fig.npcs).sort(),requiredNPC.sort());assert.equal(Object.keys(fig.dialogues).length,9);
for(const [id,n] of Object.entries(fig.npcs)){keys(n,['name','role','dialogue','palette'],id);assert.equal(n.dialogue,id);assert.equal(Object.keys(dialogs[id].nodes).length,8);assert.equal(fig.einsatz[id].sheet,id);for(const v of Object.values(fig.einsatz[id].zeit))map(v.map);condition(fig.einsatz[id].visible_if);for(const a of fig.einsatz[id].aktionen??[])assert(dialogs[a.dialogue]);}
let nodeCount=0;
function checkDialogue(id,d){
 const starts=typeof d.start==='string'?[d.start]:d.start.map(s=>s.node);for(const s of starts)assert(d.nodes[s],id+': Start fehlt');
 const seen=new Set(),q=[...starts];while(q.length){const at=q.shift();if(seen.has(at))continue;seen.add(at);for(const c of d.nodes[at].choices)if(c.next)q.push(c.next);}
 assert.equal(seen.size,Object.keys(d.nodes).length,id+': unerreichbarer Knoten');
 const exits=new Set(Object.keys(d.nodes).filter(n=>d.nodes[n].choices.some(c=>!c.next)));let old=-1;while(old!==exits.size){old=exits.size;for(const [n,node]of Object.entries(d.nodes))if(node.choices.some(c=>exits.has(c.next)))exits.add(n);}assert.equal(exits.size,Object.keys(d.nodes).length,id+': ohne Ausstieg');
 for(const [nid,n]of Object.entries(d.nodes)){
  keys(n,NODE_FIELDS,id+'/'+nid);short(n.text,220,id+'/'+nid);condition(n);nodeCount++;
  for(const c of n.choices){keys(c,CHOICE_FIELDS,id+'/'+nid);short(c.text,140,id+'/'+nid);condition(c);if(c.next)assert(d.nodes[c.next],id+': next '+c.next);if(c.requires_pathway)assert(base.pathways[c.requires_pathway[0]],'Pfad '+c.requires_pathway[0]);}
  if(n.takes_items)for(const key of Object.keys(n.takes_items)){const incoming=Object.values(d.nodes).flatMap(n=>n.choices).filter(c=>c.next===nid);assert(incoming.length&&incoming.every(c=>c.requires_items?.includes(key)),id+': Verbrauch ohne Wahlbedingung');}
 }
}
for(const [id,d]of Object.entries(dialogs))checkDialogue(id,d);
const expectedExtra=['marlowe','holt','greta','zunder','hale','k3a_pfiff','k3p_hedda','kittering','k3n_secondhaendler','varga'];assert.deepEqual(Object.keys(extras).sort(),expectedExtra.sort());
for(const [id,a]of Object.entries(extras)){assert(base.dialogues[id]);keys(a,['choices_add','nodes_add'],id);assert.equal(a.choices_add.length,1);const start=a.choices_add[0].next;condition(a.choices_add[0]);checkDialogue(id,{start,nodes:a.nodes_add});for(const n of Object.keys(a.nodes_add))assert(!base.dialogues[id].nodes[n]);}
assert.equal(Object.keys(jobs.quests).length,9);assert.equal(jobs.lesestellen.length,12);unique(jobs.lesestellen.map(s=>s.map),'Ermittlungslesestellen pro Karte');unique(jobs.lesestellen.map(s=>s.id),'Lesestellen');
for(const s of jobs.lesestellen){map(s.map);assert(dialogs[s.dialogue]);condition(s.visible_if);short(s.title,140,s.id);}
const sites=new Set(jobs.lesestellen.map(s=>s.id));
for(const [id,q]of Object.entries(jobs.quests)){
 keys(q,['title','kind','case','summary','steps','reward'],id);assert.equal(q.kind,'side');assert.equal(q.case,'side');assert(q.reward.gives_money>=40&&q.reward.gives_money<=180);short(q.title,140,id);short(q.summary,220,id);
 assert.equal(q.steps.length,id.endsWith('_kette')?5:1);
 if(q.steps.length===5){assert.equal(new Set(q.steps.map(s=>city(s.target.map))).size,3);assert.equal(Object.keys(q.reward.gives_items).length,1);}
 for(const step of q.steps){keys(step,['text','done','target'],id);condition(step.done);map(step.target.map);assert(sites.has(step.target.id)||fig.npcs[step.target.id]);short(step.text,140,id);}
 condition(q.reward);
}
assert.equal(Object.keys(jobs.artifacts.list).length,3);
const existingEffectKeys=new Set(Object.values(base.artifacts.list).flatMap(a=>[...a.boons,...a.curses].map(e=>e.key)));
for(const [id,a]of Object.entries(jobs.artifacts.list)){assert.equal(a.source,'sekten');assert.equal(enemy.items[id].kind,'artifact');assert.deepEqual(enemy.items[id].boons,a.boons);assert.deepEqual(enemy.items[id].curses,a.curses);assert(a.boons.length&&a.curses.length);for(const effect of [...a.boons,...a.curses]){assert(existingEffectKeys.has(effect.key));short(effect.text,140,id);}}
assert.equal(text.geplauder.length,12);unique(text.geplauder.map(g=>g.id),'Geplauder');for(const g of text.geplauder){condition(g);assert.deepEqual(g.zeilen.map(l=>l.p),['p2','p1','p2','p1']);for(const l of g.zeilen)for(const f of l.p==='p2'?['a','b']:['text'])short(l[f],220,g.id);}
const brief=read('grafik_briefe.md'),br=read('../../art/codex_BR_sekten_grafik.md');assert.equal((brief.match(/^## /gm)??[]).length,39);
for(const id of [...requiredNPC,...Object.keys(enemy.encounters),...Object.keys(enemy.items),...kult.flatMap(k=>[k.id+'_zeichen',k.id+'_schrein'])])assert(brief.includes('## '+id+' —'),id+': Grafikbrief fehlt');
for(const id of [...requiredNPC,...Object.keys(enemy.items)])assert(br.includes('`'+id+'`'),id+': BR-Abweichung');
// Use the real pack merger on an isolated copy. This is not a runtime integration.
const content=structuredClone(base);applyQuestPack(content,{name:'bq_test',npcs:fig.npcs,items:enemy.items,encounters:enemy.encounters,quests:jobs.quests,dialogues:dialogs,dialog_zusaetze:extras});Object.assign(content.artifacts.list,jobs.artifacts.list);
const fresh=()=>{const s=new GameState(content);s.inventory={};s.money=0;return s;};
const choose=(s,d,nodeId,index)=>{const c=d.nodes[nodeId].choices[index];assert(s.meets(c),'Wahlbedingungen nicht erfüllt: '+nodeId);assert(c.next);s.applyEffects(d.nodes[c.next]);return c.next;};
for(const [id,d]of Object.entries(fig.dialogues)){
 const s=fresh();for(const h of [0,9,10,39,40,100]){s.honor=h;assert.equal(s.pick(d.start),'gruss_'+(h>=40?'hoch':h>=10?'mittel':'niedrig'));}
 const p=d.nodes.hub.choices.find(c=>c.requires_pathway);assert(p);assert(!s.meets(p));s.pathway={id:p.requires_pathway[0],seq:9};assert(s.meets(p));s.pathway={id:p.requires_pathway[0],seq:10};assert(!s.meets(p));
}
for(const k of kult){
 const cid=k.id,qid=cid+'_kette',s=fresh();s.startQuest(qid);
 const q=jobs.quests[qid],artifact=Object.keys(q.reward.gives_items)[0];
 // Cannot collect later pages or the reward out of order.
 for(let i=2;i<=4;i++){const d=dialogs[cid+'_schritt_'+i];assert(!s.meets(d.nodes.start.choices[0]));}
 const first=dialogs[cid+'_schritt_1'];assert(!s.meets(first.nodes.abschluss.choices[0]));
 for(let i=1;i<=4;i++){const d=dialogs[cid+'_schritt_'+i];s.map=q.steps[i-1].target.map;choose(s,d,'start',0);assert(s.questSteps(qid)[i-1].done);assert(!s.meets(d.nodes.start.choices[0]));}
 assert.equal(s.pick(first.start),'abschluss');choose(s,first,'abschluss',0);assert.equal(s.quests[qid],'done');assert.equal(s.money,180);assert.equal(s.itemCount(artifact),1);assert(s.questSteps(qid).every(x=>x.done));assert(!s.meets(first.nodes.abschluss.choices[0]));
 // Re-entering a completion node cannot pay a quest reward twice.
 s.applyEffects(first.nodes.auszahlen);assert.equal(s.money,180);assert.equal(s.itemCount(artifact),1);
 const ex=Object.keys(fig.npcs).find(id=>id.startsWith(cid+'_aussteiger'));
 const recipe=Object.values(text.rezepte).find(r=>r.requires_flags[0]===cid+'_rezept');const rd=dialogs[recipe.dialog.id];const t=fresh();assert(!t.meets(rd.nodes.start.choices[0]));
 t.applyEffects(fig.dialogues[ex].nodes.hilfe);assert(!t.meets(rd.nodes.start.choices[0]));for(const [item,n]of Object.entries(recipe.takes_items))t.addItem(item,n);
 assert(t.meets(rd.nodes.start.choices[0]));choose(t,rd,'start',0);for(const id of Object.keys(recipe.takes_items))assert.equal(t.itemCount(id),0);for(const id of Object.keys(recipe.gives_items))assert.equal(t.itemCount(id),1);assert(!t.meets(rd.nodes.start.choices[0]));
}
for(const e of events){
 const s=fresh();s.flags.add('sk_freigegeben');s.applyEffects(e.start);
 if(e.art==='werbung'){const d=dialogs[e.dialog.id];s.composure=50;choose(s,d,'start',2);assert.equal(s.composure,45);assert(!s.meets(d.nodes.start.choices[2]));}
 if(e.art==='sabotage'){
  const d=dialogs[e.gegenmassnahme.dialog.id];assert(!s.meets(d.nodes.start.choices[0]));choose(s,d,'start',1);for(const f of e.ende.clears_flags)assert(!s.flags.has(f));assert(!s.meets(d.nodes.start.choices[1]));assert.equal(s.money,0);
  const t=fresh();t.applyEffects(e.start);t.addItem(e.gegenmassnahme.item,1);choose(t,d,'start',0);assert.equal(t.itemCount(e.gegenmassnahme.item),0);assert(!t.meets(d.nodes.start.choices[0]));
 }
 if(e.art==='abwerbung'){
  const d=dialogs[e.dialog.id];choose(s,d,'start',0);assert.equal(s.quests[e.rueckholung],'done');assert.equal(s.money,60);s.applyEffects(d.nodes.frei);assert.equal(s.money,60);
  const t=fresh();t.applyEffects(e.start);t.applyEffects(e.rueckkehr.zeitablauf_effekte);assert.equal(t.money,0);assert.equal(t.quests[e.rueckholung],'active');assert(!t.flags.has(e.id+'_aktiv'));
 }
 if(e.art==='schrein'){const d=dialogs[e.dialog.id];assert(!s.meets(d.nodes.start.choices[1]));const n=choose(s,d,'start',0);choose(s,d,n,0);assert(s.flags.has(e.id+'_erledigt'));assert(!s.meets(d.nodes.start.choices[1]));if(e.start.start_quests){assert.equal(s.money,40);s.applyEffects(d.nodes.abbauen);assert.equal(s.money,40);}}
 if(e.art==='zeichen_am_haus'){const d=dialogs[e.naechster_besuch.dialog.id];choose(s,d,'start',0);assert(s.flags.has(e.id+'_erledigt'));if(e.start.start_quests)assert.equal(s.money,40);}
}
// Explicit, statically verifiable protections. Timers and phase switching still require the later engine adapter.
assert.equal(text.einbau.auswahl.max_ereignisse_pro_besuch,1);assert.equal(text.einbau.auswahl.max_aktive_pro_karte,1);assert.equal(text.einbau.schutz.hauptgeschichte_blockieren,false);assert.equal(text.einbau.schutz.inventar_automatisch_entziehen,false);assert.equal(text.einbau.schutz.sabotage_stapeln,false);assert.equal(text.einbau.schutz.hauptrouten_frei,true);assert.equal(text.einbau.schutz.nervenverlust_max_pro_ereignis,10);
console.log('OK: 3 Kulte, 36 eindeutige Ereignisse; Kartenabdeckung '+coverage.join(', ')+'.');
console.log('OK: Je Kult 9 reale Karten in 3 Städten, maximal 3 Heimatkarten; alle 7 Ereignisarten vorhanden.');
console.log('OK: 12 Gegner, 3 Haupt-Eliten mit 2 deklarierten Phasen, 12 Items und 3 Artefakte; BR-IDs stimmen.');
console.log(`OK: 9 Figuren mit 72 Knoten, insgesamt ${nodeCount} geprüfte Dialogknoten, 10 bestehende Dialogzweige.`);
console.log('OK: 3 Ketten mit je 5 Schritten, 6 kleine Aufträge, 12 Lesestellen ohne Karten-Doppelbelegung.');
console.log('OK: 36 Zeitungsmeldungen, 72 Geredezeilen, je 12 HUD/Notizbuch/Wegweiser, 12 Koop-Geplauder, Textgrenzen.');
console.log('OK: Echter Pack-Merge und GameState: Ansehen, Pfad, Rezeptverbrauch, Schrittfolge, einmalige Belohnungen, Rückholung, kostenlose Hilfe.');
console.log('OK: 6 Abwerbungen mit Rückkehrvertrag, 6 begrenzte Sabotagen; keine automatische Inventarstrafe.');
console.log('Hinweis: Ereignisplaner, Timer, lokale Wirkungen, NPC-Rückkehr und Phasenwechsel sind Vertragsdaten, noch keine Laufzeitintegration.');
