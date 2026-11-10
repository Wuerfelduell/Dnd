// Vitest und der unveränderte npm-test-Runner (node:test) verwenden dieselben Fälle.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { claimMethods, withClaimPlayer } from '../src/core/Claims.js';
import { loadContent } from './helpers.js';
const { test } = process.env.VITEST ? await import('vitest') : await import('node:test');
const read = name => JSON.parse(readFileSync(new URL(`../src/data/packs/koop_beute/${name}.json`, import.meta.url)));
const content = { ...loadContent(), claimSources: read('ansprueche'), claimReplacements: read('ersatz') };
Object.assign(GameState.prototype, claimMethods);
function state(p1 = 'eisen', p2 = 'eisen', seq = 4) {
  const s = new GameState(content); s.resetClaims(); s.pathway = p1 ? { id: p1, seq, digestion: 0 } : null;
  if (p2 !== false) { s.addP2(); s.withPlayer(2, () => { s.pathway = p2 ? { id: p2, seq, digestion: 0 } : null; }); }
  return s;
}
const win = (s, source = 'won_vorhauer') => { s.flags.add(source); s.openClaims(source); };
const count = (s, p, id) => withClaimPlayer(s, p, () => s.itemCount(id));

test('gleicher Pfad: je eine Zutat, Geld/Ehre/Quest bleiben einmal gemeinsam', () => {
  const s = state(), money = s.money, honor = s.honor; s.applyEffects({ gives_money: 15, honor: 10 });
  const shared = [s.money, s.honor, JSON.stringify(s.quests)]; win(s);
  for (const p of [1, 2]) assert.equal(s.redeem(`boss-${p}`, 'won_vorhauer', p).item, 'sq_zutat_eisen_3');
  assert.deepEqual([count(s,1,'sq_zutat_eisen_3'),count(s,2,'sq_zutat_eisen_3')],[1,1]);
  assert.deepEqual([s.money,s.honor,JSON.stringify(s.quests)],shared);assert.ok(s.money>money && s.honor>honor);
});

test('verschiedene Pfade und friedliche Quelle: jeder bekommt seine Zutat', () => {
  const s = state('eisen','laterne');win(s,'k3o_vorhauer_geloest');
  assert.equal(s.redeem('a','k3o_vorhauer_geloest',1).item,'sq_zutat_eisen_3');
  assert.equal(s.redeem('b','won_vorhauer',2).item,'sq_zutat_laterne_3');
  win(s);assert.equal(s.redeem('c','won_vorhauer',1),null);
});

test('kein Pfad und Sequenzgrenze lassen den Anspruch offen', () => {
  const s=state('eisen',null);win(s);
  assert.equal(s.redeem('a','won_vorhauer',2).reason,'kein_pfad');
  s.withPlayer(2,()=>{s.pathway={id:'laterne',seq:9};});
  // Bestandsfächer erlauben Kern 3 bereits jedem Träger des Pfads (Grenze 9).
  assert.equal(s.redeem('a','won_vorhauer',2).item,'sq_zutat_laterne_3');
  win(s,'k3p_laterne_bewaeltigt');assert.equal(s.claimFor('k3p_laterne_bewaeltigt',2).reason,'pfad_oder_sequenz');
  s.withPlayer(2,()=>{s.pathway.seq=5;});assert.equal(s.redeem('b','k3p_laterne_bewaeltigt',2).item,'sq_zutat_laterne_4');
});

test('später Beitritt, K.o. und Entfernen bewahren Ansprüche', () => {
  const s=state('eisen',false);win(s);s.redeem('a','won_vorhauer',1);s.addP2();
  s.withPlayer(2,()=>{s.pathway={id:'echo',seq:4};s.hp=0;});s.syncClaims();
  assert.equal(s.claims.won_vorhauer[2],'offen');s.removeP2();s.syncClaims();
  assert.equal(s.redeem('b','won_vorhauer',2),null);assert.equal(s.claims.won_vorhauer[2],'offen');
  s.addP2();s.p2.hp=0;assert.equal(s.redeem('b','won_vorhauer',2).item,'sq_zutat_echo_3');
});

test('Befehl, Alias, neue Befehls-ID und synchrone Events zahlen niemals doppelt', () => {
  const s=state();win(s);let events=0;s.on('claim',()=>events++);
  s.on('item',()=>s.redeem('reentrant','won_vorhauer',1));
  s.redeem('same','won_vorhauer',1);assert.equal(s.redeem('same','won_vorhauer',1),null);
  assert.equal(s.redeem('same','won_vorhauer',2),null);assert.equal(s.redeem('new','k3o_vorhauer_geloest',1),null);
  assert.equal(count(s,1,'sq_zutat_eisen_3'),1);assert.equal(events,1);
});

test('aus p2-Dialog heraus bleibt gezielter Zugriff auf p1 korrekt', () => {
  const s=state('eisen','echo');win(s);
  s.withPlayer(2,()=>{assert.equal(s.claimFor('won_vorhauer',1).item,'sq_zutat_eisen_3');s.redeem('p1','won_vorhauer',1);assert.equal(s.acting,2);s.applyClaims({claim:'won_vorhauer'},{commandId:'p2'});});
  assert.equal(count(s,1,'sq_zutat_eisen_3'),1);assert.equal(count(s,2,'sq_zutat_echo_3'),1);assert.equal(s.acting,1);
});

test('Ersatz prüft Quelle, Zielstufe, Kernzutat und Zieltrank', () => {
  const s=state();assert.equal(s.replacementFor(1,3),null);win(s);
  const expected={item:'sq_zutat_eisen_3',where:'hedda',cost:0};assert.deepEqual(s.replacementFor(1,3),expected);
  s.pathway.seq=3;assert.equal(s.replacementFor(1,3),null);s.pathway.seq=4;
  s.addItem(expected.item);assert.equal(s.replacementFor(1,3),null);s.removeItem(expected.item);
  s.addItem('trank_eisen_3');assert.equal(s.replacementFor(1,3),null);s.removeItem('trank_eisen_3');
  assert.deepEqual(s.replacementFor(1,3),expected);
});

test('Büro, beide Verstecke und eingelagerte Zutaten blockieren Ersatz', () => {
  for(const where of ['buero','kahn','ds_speisewagen']) for(const item of ['trank_eisen_3','sq_zutat_eisen_3']) {
    const s=state();win(s);s.addItem(item);assert.equal(s.storeItem(item,1,where).ok,true);
    assert.equal(s.replacementFor(1,3),null,`${where}: ${item}`);
    s.retrieveItem(item,1,where);s.removeItem(item);assert.ok(s.replacementFor(1,3));
  }
});

test('persönliche Taschen sind unabhängig; ein gemeinsamer gelagerter Trank sperrt beide', () => {
  const s=state();win(s);s.withPlayer(2,()=>s.addItem('trank_eisen_3'));
  assert.ok(s.replacementFor(1,3));assert.equal(s.replacementFor(2,3),null);
  s.withPlayer(2,()=>s.storeItem('trank_eisen_3',1,'ds_speisewagen'));
  assert.equal(s.replacementFor(1,3),null);assert.equal(s.replacementFor(2,3),null);
});

test('Ersatz vor erster Abholung erfüllt den Anspruch; sichere Wiederholung nur nach Verlust', () => {
  const s=state();win(s);const shared=[s.money,s.honor,JSON.stringify(s.quests),JSON.stringify([...s.flags])];
  s.redeemReplacement('r1',1,3);assert.equal(s.redeem('initial','won_vorhauer',1),null);
  assert.equal(s.redeemReplacement('r2',1,3),null);s.removeItem('sq_zutat_eisen_3');
  assert.equal(s.redeemReplacement('r1',1,3),null);assert.ok(s.redeemReplacement('r2',1,3));
  assert.deepEqual([s.money,s.honor,JSON.stringify(s.quests),JSON.stringify([...s.flags])],shared);
});

test('Verfall verhindert Ersatz und spätere Wiederöffnung, bereits ausgezahlte Beute bleibt', () => {
  const s=state('eisen','laterne',2);win(s,'won_unterschicht');s.redeem('a','won_unterschicht',1);
  assert.equal(s.forfeit('won_unterschicht',2,'stilllegung'),true);s.syncClaims();assert.equal(s.claims.won_unterschicht[2],'verfallen');
  assert.equal(s.replacementFor(2,1),null);s.flags.add('k3a_end_stilllegung');s.syncClaims();
  assert.equal(s.claims.won_unterschicht[1],'eingeloest');assert.equal(count(s,1,'sq_zutat_eisen_1'),1);
  const late=state('eisen',false,2);late.flags.add('k3a_end_stilllegung');late.addP2();late.syncClaims();assert.equal(late.claims.won_unterschicht[2],'verfallen');
});

test('Speichern/Laden erhält offene, eingelöste, verfallene Ansprüche und Befehlsschutz', () => {
  const s=state('eisen',null);win(s);s.redeem('a','won_vorhauer',1);s.forfeit('won_unterschicht',2,'stilllegung');s.removeP2();
  const payload=JSON.parse(JSON.stringify({...s.serialize(),...s.serializeClaims()}));const t=new GameState(content);t.load(payload);t.loadClaims(payload);
  assert.equal(t.claims.won_vorhauer[1],'eingeloest');assert.equal(t.claims.won_vorhauer[2],'offen');assert.equal(t.claims.won_unterschicht[2],'verfallen');
  assert.equal(t.redeem('a','won_vorhauer',1),null);assert.equal(t.hasP2(),false);
  t.addP2();t.withPlayer(2,()=>{t.pathway={id:'echo',seq:4};});assert.ok(t.redeem('b','won_vorhauer',2));
  const snapshot=t.serializeClaims();snapshot.claims.won_vorhauer[1]='offen';assert.equal(t.claims.won_vorhauer[1],'eingeloest');
});

test('Dialogbedingungen und Effekte verwenden den handelnden Spieler; fehlende ID zahlt nichts', () => {
  const s=state();assert.equal(s.meetsClaims({requires_claim:'won_vorhauer'}),false);win(s);
  assert.equal(s.meetsClaims({requires_claim:'won_vorhauer',requires_claim_missing:'won_vorhauer'}),true);
  assert.equal(s.applyClaims({claim:'won_vorhauer'}),null);
  s.withPlayer(2,()=>{assert.equal(s.meetsClaims({requires_p2:true}),true);assert.ok(s.applyClaims({claim:'won_vorhauer'},{commandId:'a'}));assert.equal(s.meetsClaims({requires_claim:'won_vorhauer'}),false);});
  assert.equal(s.meetsClaims({requires_claim:'won_vorhauer'}),true);assert.equal(s.meetsClaims({requires_claim:'nichts'}),false);
});

test('Seq-9-Auswahl ist vor Trinken möglich, Ersatz erst nach echtem Erwerb', () => {
  const s=state(null,null);assert.equal(s.selectClaimPathway(2,'sq_uhr'),true);assert.equal(s.p2.pathway,null);
  assert.equal(s.recordClaimAcquisition(2,'sq_uhr',9),false);assert.equal(s.replacementFor(2,9),null);
  s.withPlayer(2,()=>s.addItem('trank_sq_uhr_9'));assert.equal(s.recordClaimAcquisition(2,'sq_uhr',9),true);
  s.withPlayer(2,()=>s.removeItem('trank_sq_uhr_9'));s.money=29;assert.equal(s.redeemReplacement('buy',2,9),null);
  s.money=50;assert.deepEqual(s.redeemReplacement('buy',2,9),{item:'trank_sq_uhr_9',where:'pfiff',cost:30});assert.equal(s.money,20);
  const t=new GameState(content);t.load({...s.serialize(),...s.serializeClaims()});t.loadClaims(s.serializeClaims());assert.equal(t.claimSelections[2],'sq_uhr');assert.equal(t.claimAcquisitions[2].k3b_erworben_sq_uhr_9,true);
});

test('Formel zum alten Preis: Besitz, Lager, fehlender Trank, Ehre und Geld geprüft', () => {
  const s=state();win(s);s.honor=200;s.money=1000;const opts={kind:'formula'};
  assert.deepEqual(s.replacementFor(1,3,opts),{item:'formel_eisen_3',where:'kittering',cost:260});
  s.addItem('trank_eisen_3');assert.equal(s.replacementFor(1,3,opts),null);s.removeItem('trank_eisen_3');
  s.honor=0;assert.equal(s.replacementFor(1,3,opts),null);s.honor=200;
  assert.ok(s.redeemReplacement('formula',1,3,opts));assert.equal(s.money,740);assert.equal(s.replacementFor(1,3,opts),null);
  s.storeItem('formel_eisen_3',1,'kahn');assert.equal(s.replacementFor(1,3,opts),null);
});

test('alle zehn Prüfungen und alle Kernfächer liefern exakt den Daten entsprechend', () => {
  for(const [source,def] of Object.entries(content.claimSources)) for(const reward of def.rewards) {
    const [path,seq]=reward.requires_pathway;const s=state(path,path,seq);win(s,source);
    for(const p of [1,2]) { assert.equal(s.redeem(`${source}-${p}`,source,p).item,reward.item);assert.equal(count(s,p,reward.item),1); }
  }
});

test('Artefakte müssen explizit persönlich sein; keine Schlüsselkopien', () => {
  const s=state(null,null);s.content={...content,claimSources:{...content.claimSources,k3b_test_fund:{kind:'fund',flags:['k3b_test_fund'],rewards:[{item:'sq_offene_blende',qty:1,personal:true}]}}};
  win(s,'k3b_test_fund');for(const p of [1,2]) assert.equal(s.redeem(`f${p}`,'k3b_test_fund',p).item,'sq_offene_blende');
  s.content.claimSources.k3b_test_fund.rewards[0].personal=false;s.resetClaims();assert.equal(s.claimFor('k3b_test_fund',1),null);
});

test('ungültige Spieler/Quellen, alte Saves und unbekannte Save-Daten bleiben harmlos', () => {
  const s=state('eisen',false);assert.equal(s.openClaims('won_vorhauer'),false);win(s);
  for(const p of [0,2,3,'2']) assert.equal(s.claimFor('won_vorhauer',p),null);
  s.loadClaims({claims:{unknown:{1:'offen'},won_vorhauer:{1:'kaputt'}}});assert.equal(s.claims.unknown,undefined);assert.equal(s.claims.won_vorhauer[1],'offen');
});

test('bezahlter Ersatz kann durch Geld-/Item-Events nicht erneut eintreten', () => {
  const s=state(null,false);s.selectClaimPathway(1,'laterne');s.addItem('trank_laterne_9');s.recordClaimAcquisition(1,'laterne',9);s.removeItem('trank_laterne_9');s.money=100;
  s.on('money',()=>s.redeemReplacement('nested-money',1,9));s.on('item',()=>s.redeemReplacement('nested-item',1,9));
  s.redeemReplacement('purchase',1,9);assert.equal(s.money,70);assert.equal(s.itemCount('trank_laterne_9'),1);
});

test('90 Ersatzzeilen berücksichtigen jeweils die richtige Quelle und den individuellen Pfad', () => {
  for(const row of content.claimReplacements) {
    const s=state(row.pathway,row.pathway,Math.min(9,row.seq+1));
    if(row.seq===9){s.pathway=null;s.selectClaimPathway(1,row.pathway);}
    if(row.source_type==='claim') win(s,row.source);
    else {s.addItem(row.core);assert.equal(s.recordClaimAcquisition(1,row.pathway,row.seq),true);s.removeItem(row.core);}
    assert.deepEqual(s.replacementFor(1,row.seq),{item:row.item,where:row.where,cost:row.cost},row.id);
    assert.equal(s.replacementFor(1,row.seq,{pathway:'unbekannt'}),null);
  }
});
