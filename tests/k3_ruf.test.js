import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { signalRouteMethods, projectSignal, hearingListeners, hearingOf, isSignalWalkable } from '../src/core/SignalRoutes.js';
import { loadContent } from './helpers.js';
import { loadRouteData, validateRoutes, escapePath } from '../docs/story/k3_ruf/pruefen.mjs';
class RouteState extends GameState {}
Object.assign(RouteState.prototype,signalRouteMethods);
const defs=loadRouteData(), content=loadContent(), station=defs.stationen[0], pattern=station.accepted[0].pattern;
function state(st=station) {
  const s=new RouteState(content);s.configureSignalRoutes(structuredClone(defs));s.resetSignalRoutes();s.map=st.map;s.addItem('k3a_signalgeraet');
  for(const p of Object.keys(st.patterns))s.applySignalRoutes({learn_pattern:p});
  for(const a of st.accepted)for(const f of a.requires_flags??[])s.flags.add(f);
  return s;
}
const call=(s,id,st=station,p=st.accepted[0].pattern)=>s.confirmCall(id,st.id,p,st.directions[0]);
const save=(s)=>JSON.parse(JSON.stringify({...s.serialize(),...s.serializeSignalRoutes()}));
function restore(snap){const s=new RouteState(content);s.configureSignalRoutes(structuredClone(defs));s.load(snap);s.loadSignalRoutes(snap);return s;}

test('BN Datenvertrag: sechs Stationen, zwölf eindeutige Ruf-/Hallpaare, begehbare Wege',()=>assert.equal(validateRoutes(defs,content).ok,true));
test('drei Rufe verbrauchen drei Ladungen, vierter bleibt ohne Mutation gesperrt',()=>{
 const s=state();for(let i=0;i<3;i++)assert.equal(call(s,'call'+i).handled,true);
 assert.equal(s.signal.charges,0);const before=save(s);assert.equal(call(s,'fourth').result.reason,'leer');assert.deepEqual(save(s),before);
});
test('Notladung bei drei bleibt erhalten; bei null einmal; Pfiff setzt Reserve nicht zurück',()=>{
 const s=state();s.applySignal({signal_reserve:station.id});assert.deepEqual(s.signal.reserveUsed,[]);
 for(let i=0;i<3;i++)call(s,'c'+i);s.applySignal({signal_reserve:station.id});assert.equal(s.signal.charges,1);
 s.applySignal({signal_reserve:station.id});assert.equal(s.signal.charges,1);s.applySignal({signal:'fill'});assert.equal(s.signal.charges,3);assert.deepEqual(s.signal.reserveUsed,[station.id]);
});
test('derselbe Koop-Befehl kostet auch bei Wiedereintritt über signal-Event nur einmal',()=>{
 const s=state();let nested,seen;s.on('signal',()=>{seen=save(s);nested=call(s,'shared');});
 assert.equal(call(s,'shared').handled,true);assert.equal(nested.handled,false);assert.equal(s.signal.charges,2);
 assert.ok(seen.signalRoutes.revealedRoutes.includes(station.id+':east'));assert.ok(seen.signalRoutes.handled.includes('shared'));
 s.addP2();s.withPlayer(2,()=>assert.equal(call(s,'shared').result.reason,'duplicate'));assert.equal(s.signal.charges,2);
});
test('falsches Muster: eine Ladung, maximal fünf Nerven, Wissen und sichere Reise bleiben',()=>{
 const s=state();const learned=[...s.signal.learnedPatterns],before=s.composure;
 const {result}=call(s,'wrong',station,'k3a_ruf_rund');assert.equal(result.kind,'fallback');assert.equal(s.signal.charges,2);
 assert.ok(before-s.composure<=5);assert.deepEqual([...s.signal.learnedPatterns],learned);assert.deepEqual(s.pendingTravel,{map:station.map,spawn:'default'});
 assert.equal(s.pendingCombat,null);assert.equal(s.flags.has('kapitel3_done'),false);
});
test('Vorschau und Horchen bleiben kostenlos und verändern weder Save noch Flags',()=>{
 const s=state();const before=save(s);assert.equal(s.previewCall(station.id,pattern,'east').ok,true);assert.equal(s.listen(station.id).hints.length,2);assert.deepEqual(save(s),before);
 s.signal.charges=0;assert.equal(s.listen(station.id).ok,true);assert.equal(s.listen('unknown').ok,false);
 s.flags.add('k3o_schwellenring_gelesen1');assert.equal(s.listen(station.id).hints.length,3);
});
test('Wände, Richtung und geschlossene Schleusen stoppen die geordnete Ausbreitung',()=>{
 const args={origin:[1,2],dir:'east',rangeTiles:5,isWalkable:(x,y)=>x>=0&&x<7&&y>=0&&y<5&&x!==4};
 assert.deepEqual(projectSignal(args),[[1,2],[2,2],[3,2]]); // branching at wall is not guessed
 assert.deepEqual(projectSignal({...args,closedTiles:[[2,2]]}),[[1,2]]);
 assert.deepEqual(projectSignal({...args,routeTiles:[[1,2],[2,2],[2,1],[3,1]]}),[[1,2],[2,2],[2,1],[3,1]]);
 assert.deepEqual(projectSignal({...args,routeTiles:[[1,2],[1,1]]}),[[1,2]]);
 assert.equal(projectSignal({...args,rangeTiles:1}).length,2);
 const s=state();s.signalRouteContext.closedLocks=[{map:s.map,tile:[37,3],closed:true}];
 assert.equal(call(s,'wall').result.reason,'blocked');assert.equal(s.signal.charges,3);assert.equal(s.signal.revealedRoutes.size,0);
});
test('Hörweite folgt begehbaren Kacheln; Wand, sichere Nische und tote Gegner schützen',()=>{
 const args={listeners:[{id:'a',encounter:'nachhall',tile:[3,2]}],tiles:[[1,2]],isWalkable:(x,y)=>x>=0&&x<5&&y>=0&&y<5&&x!==2};
 assert.equal(hearingListeners(args).length,0);
 assert.equal(hearingListeners({...args,isWalkable:(x,y)=>x>=0&&x<5&&y>=0&&y<5}).length,1);
 assert.equal(hearingListeners({...args,tiles:[[3,2]],safeTiles:[[3,2]]}).length,0);
 assert.equal(hearingListeners({...args,tiles:[[3,2]],listeners:[{...args.listeners[0],alive:false}]}).length,0);
 assert.deepEqual(['schichtgaenger','kalkstaubgeist','signalkraehe','lohnlistenmotte','geruestklang','nachhall','unknown','nachhall_elite'].map(hearingOf),[5,6,9,4,7,10,5,10]);
});
test('Live-Lauscher lösen sichtbaren Alarm aus; Ablauf zählt nur Spielsekunden',()=>{
 const s=state();s.signalRouteContext.listeners=()=>[{id:'moving',encounter:'signalkraehe',tile:[39,3],alive:true}];
 const result=call(s,'alarm',station,'k3a_ruf_rund').result;assert.equal(result.kind,'alarm');assert.ok(result.text&&result.form&&result.alarm);
 assert.equal(s.signal.charges,2);assert.equal(s.pendingCombat,null);assert.ok(!s.signal.lastAlarm.tiles.some((p)=>p.join(',')==='2,3'));
 s.tickSignalRoutes(0);s.tickSignalRoutes(NaN);assert.ok(s.signal.lastAlarm);s.tickSignalRoutes(7);assert.ok(s.signal.lastAlarm);s.tickSignalRoutes(1);assert.equal(s.signal.lastAlarm,null);
});
test('auch ein korrekter Ruf kann Lauscher erreichen, Route und Alarm werden gemeinsam gespeichert',()=>{
 const s=state();s.signalRouteContext.listeners=()=>[{id:'a',encounter:'nachhall',tile:[39,3]}];const r=call(s,'right').result;
 assert.equal(r.kind,'route');assert.ok(r.alarm);assert.ok(s.signal.revealedRoutes.has(station.id+':east'));assert.ok(restore(save(s)).signal.lastAlarm);
});
test('jede Station behält auch leer einen freien Ausgang und eine erreichbare Nische',()=>{
 for(const st of defs.stationen){const s=state(st);s.signal.charges=0;const m=content.maps[st.map];
  assert.ok(m.interactables.some((o)=>o.kind==='door'&&!o.lock&&!o.visible_if&&escapePath(m,st.tile,o.tile)),st.id);
  assert.ok(escapePath(m,st.tile,st.safeTiles[0]));assert.equal(s.listen(st.id).ok,true);assert.equal(call(s,'empty',st).handled,false);
 }
});
test('Spieler 2 muss ausdrücklich zustimmen; nur sein Passiv wirkt, kein Gerät oder Item wird verbraucht',()=>{
 const s=state();s.addP2();const inv=JSON.stringify(s.inventory);
 s.withPlayer(2,()=>{
  assert.equal(s.acceptPrivateAnswer('no',station.id,2).result.reason,'consent');
  const offer=s.offerPrivateAnswer(station.id,2);assert.ok(offer.warning.includes('bindet nur dich'));
  assert.equal(s.acceptPrivateAnswer('yes',station.id,2).handled,true);
  assert.deepEqual(s.bindingPassive(),[{key:'unruhe_tick',value:1},{key:'max_nerves',value:-5}]);
 });
 assert.deepEqual(s.bindingPassive(1),[]);assert.equal(s.signal.bindings[2].speaker,2);assert.equal(s.signal.charges,3);assert.equal(JSON.stringify(s.inventory),inv);
 assert.equal(s.meetsSignalRoutes({requires_binding:false}),true);assert.equal(s.meetsSignalRoutes({requires_binding:2}),true);
 s.withPlayer(2,()=>assert.equal(s.meetsSignalRoutes({requires_binding:false}),false));
});
test('keine Bindung ohne aktuellen Sprecher, nach Kartenwechsel oder innerhalb der Schleuse',()=>{
 const s=state();s.addP2();assert.equal(s.offerPrivateAnswer(station.id,2).reason,'speaker');
 s.offerPrivateAnswer(station.id,1);s.map='ds_speisewagen';assert.equal(s.acceptPrivateAnswer('stale',station.id,1).handled,false);
 s.map=station.map;s.signalRouteContext.insideLock=true;assert.equal(s.offerPrivateAnswer(station.id,1).reason,'inside_lock');assert.equal(s.acceptPrivateAnswer('closed',station.id,1).handled,false);
 assert.deepEqual(s.signal.bindings,{});
});
test('Schleuse löst beide Bindungen und Alarm, aber erhält Wissen, Routen und Reserven',()=>{
 const s=state();s.addP2();for(const n of [1,2])s.withPlayer(n,()=>{s.offerPrivateAnswer(station.id,n);s.acceptPrivateAnswer('bind'+n,station.id,n);});
 call(s,'route');s.signal.lastAlarm={map:s.map,tiles:[[34,3]],until:8};const before=[...s.signal.learnedPatterns];
 assert.equal(s.enterLock(s.map,'bogus').ok,false);assert.ok(s.signal.bindings[1]);s.map=station.lock.map;
 assert.equal(s.enterLock(station.lock.map,station.lock.id).ok,true);assert.deepEqual(s.signal.bindings,{});assert.equal(s.signal.lastAlarm,null);assert.deepEqual([...s.signal.learnedPatterns],before);assert.equal(s.signal.revealedRoutes.size,1);
});
test('Save/Load erhält Ladung, Reserven, Routen, Bindungen und Deduplizierung, aber keine offene Zustimmung',()=>{
 const s=state();call(s,'persist');s.applySignal({signal_reserve:station.id});s.addP2();s.withPlayer(2,()=>{s.offerPrivateAnswer(station.id,2);s.acceptPrivateAnswer('private',station.id,2);});s.offerPrivateAnswer(station.id,1);
 const t=restore(save(s));assert.deepEqual(t.signal,s.signal);assert.equal(call(t,'persist').result.reason,'duplicate');
 assert.equal(t.acceptPrivateAnswer('stale',station.id,1).result.reason,'consent');const charge=t.signal.charges;t.applySignal({signal_reserve:station.id});assert.equal(t.signal.charges,charge);
});
test('Alte und beschädigte Saves migrieren sicher; Quellenwissen nachladen, fremde Routen verwerfen',()=>{
 const s=state();s.clues.push(station.patterns[pattern].learnedFromClue);s.loadSignalRoutes({});assert.ok(s.signal.learnedPatterns.has(pattern));
 s.loadSignalRoutes({signalRoutes:{v:1,learnedPatterns:['bogus'],revealedRoutes:['bogus:north'],bindings:{1:{station:station.id,speaker:2,pattern,until:'schleuse'}},handled:Array.from({length:80},(_,i)=>'c'+i),routeTime:NaN,lastAlarm:{map:s.map,tiles:[[0,0]],until:9}}});
 assert.deepEqual(s.signal.bindings,{});assert.equal(s.signal.revealedRoutes.size,0);assert.equal(s.signal.handled.length,64);assert.equal(s.signal.lastAlarm,null);
});
test('Bedingungen und Effekte validieren IDs; Quellenform und Klangzeichen bleiben unabhängig verfügbar',()=>{
 const s=state();assert.equal(s.meetsSignalRoutes({requires_pattern:pattern}),true);assert.equal(s.meetsSignalRoutes({requires_pattern:'bogus'}),false);
 s.applySignalRoutes({reveal_route:station.id+':east'});assert.equal(s.meetsSignalRoutes({requires_route:station.id+':east'}),true);
 s.applySignalRoutes({learn_pattern:'bogus',reveal_route:'bogus:north'});assert.ok(!s.signal.learnedPatterns.has('bogus'));assert.equal(s.signal.revealedRoutes.size,1);
 assert.ok(s.patternSound(pattern).zeichen);assert.equal(typeof s.signSymbol(pattern),'number');assert.equal(s.signSymbol('bogus'),null);assert.equal(s.patternSound('bogus'),null);
});
test('bekannte Fehler und fehlende Voraussetzungen verursachen keine Abbuchung',()=>{
 const s=state();for(const [id,st,p,dir] of [['a','unknown',pattern,'east'],['b',station.id,'bad','east'],['c',station.id,pattern,'west'],['',station.id,pattern,'east']])assert.equal(s.confirmCall(id,st,p,dir).handled,false);
 s.signal.learnedPatterns.clear();assert.equal(call(s,'unknown').result.reason,'unlearned');assert.equal(s.signal.charges,3);
 const st=defs.stationen[1],h=state(st);h.flags.clear();assert.equal(call(h,'requirements',st).result.reason,'requirements');assert.equal(h.signal.charges,3);
});
test('Antwort-Stationen übernehmen exakt die vorhandenen Vorbereitungsflags, keine Bossbelohnung',()=>{
 for(const st of defs.stationen.slice(1)){const s=state(st),r=call(s,'answer',st).result;assert.equal(r.flag,st.accepted[0].flag);assert.ok(s.flags.has(r.flag));assert.ok(![...s.flags].some((f)=>f.endsWith('_geloest')));assert.equal(s.signal.charges,2);}
});
test('Kollisionsmatrix und Kartenränder: unbekannte Geometrie bleibt gesperrt',()=>{
 assert.equal(isSignalWalkable({collision:[[0,1],[false,true]]},0,0),true);assert.equal(isSignalWalkable({collision:[[0,1]]},1,0),false);assert.equal(isSignalWalkable({},0,0),false);assert.equal(isSignalWalkable({rows:['.']},1,0),false);
});
test('abgebrochene Zustimmung bleibt unwirksam; gleiche private Bestätigung erzeugt kein zweites Ereignis',()=>{
 const s=state();let events=0;s.on('signal_binding',()=>events++);
 s.offerPrivateAnswer(station.id,1);s.cancelPrivateAnswer(1);
 assert.equal(s.acceptPrivateAnswer('cancelled',station.id,1).result.reason,'consent');
 s.offerPrivateAnswer(station.id,1);assert.equal(s.acceptPrivateAnswer('once',station.id,1).handled,true);
 assert.equal(s.acceptPrivateAnswer('once',station.id,1).result.reason,'duplicate');assert.equal(events,1);
 assert.equal(call(s,'once').result.reason,'duplicate');assert.equal(s.signal.charges,3);
});
test('zurückgegebene Daten können weder Stationsdefinition noch gespeicherten Zustand verändern',()=>{
 const s=state();const p=s.previewCall(station.id,pattern,'east');p.tiles[0][0]=99;p.safeTiles[0][0]=99;
 assert.deepEqual(s.previewCall(station.id,pattern,'east').tiles[0],station.tile);
 s.offerPrivateAnswer(station.id,1);s.acceptPrivateAnswer('bind',station.id,1);const passive=s.bindingPassive(1);passive[0].value=99;
 assert.equal(s.bindingPassive(1)[0].value,1);const snapshot=s.serializeSignalRoutes();snapshot.signalRoutes.bindings[1].station='bad';assert.equal(s.signal.bindings[1].station,station.id);
});
