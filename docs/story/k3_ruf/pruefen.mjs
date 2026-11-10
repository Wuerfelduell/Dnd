import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { loadContent } from '../../../tests/helpers.js';
import { isSignalWalkable, projectSignal, hearingOf } from '../../../src/core/SignalRoutes.js';
const read = (path) => JSON.parse(readFileSync(new URL('../../../' + path, import.meta.url), 'utf8'));
export function loadRouteData() {
  return Object.fromEntries(['stationen', 'klang_zuordnung', 'bindungen', 'texte'].map((n) => [n, read(`src/data/packs/k3_ruf/${n}.json`)]));
}
export function escapePath(map, origin, target) {
  const queue = [[origin]], visited = new Set([origin.join(',')]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i], [x, y] = path.at(-1);
    if (x === target[0] && y === target[1]) return path;
    for (const p of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) if (isSignalWalkable(map,...p) && !visited.has(p.join(','))) {
      visited.add(p.join(',')); queue.push([...path,p]);
    }
  }
  return null;
}
export function validateRoutes(defs = loadRouteData(), content = loadContent()) {
  const patterns = read('docs/story/k3_akte/rufmuster.json'), audio = read('public/audio/manifest-klang-dunscar.json').klaenge;
  const required = ['drehscheibe','hund','vorhauer','verteiler','bahnsteig','tiefe'].map((n) => 'k3o_horch_'+n);
  assert.deepEqual(defs.stationen.map((s) => s.id).sort(),required.sort());
  const flags = new Set();
  const scan = (v) => { if (!v || typeof v !== 'object') return; if (v.done_flag) flags.add(v.done_flag); for (const f of v.sets_flags ?? []) flags.add(f); for (const x of Object.values(v)) scan(x); };
  scan(content.maps); scan(content.dialogues);
  const callSet = new Set(), hallSet = new Set();
  for (const p of patterns) {
    assert.ok(content.clues[p.gefunden_durch],p.id+' source');
    const s = defs.klang_zuordnung[p.id];assert.ok(s,p.id);
    assert.ok(audio[s.call] && audio[s.hall],p.id+' audio');
    assert.equal(s.zeichen,audio[s.call].zeichen);
    assert.equal(s.zeichen,audio[s.hall].zeichen);
    assert.ok(!callSet.has(s.call) && !hallSet.has(s.hall),'duplicate audio');callSet.add(s.call);hallSet.add(s.hall);
    assert.ok(Number.isInteger(s.symbol) && s.symbol>=0 && s.symbol<=15);
  }
  assert.equal(Object.keys(defs.klang_zuordnung).filter((k)=>k!=='events').length,patterns.length);
  assert.equal(Object.keys(defs.bindungen).length,6);
  for (const [id,t] of Object.entries(defs.texte)) assert.ok(typeof t==='string' && t.length<=140 && !/k3[a-z]?_|ds_/.test(t),id);
  assert.equal(Object.keys(defs.klang_zuordnung.events).length,8);
  for (const [id,e] of Object.entries(defs.klang_zuordnung.events)) { assert.ok(e.sound===null || audio[e.sound],id);assert.ok(defs.texte[e.text] && e.form,id); }
  const expectedFlags=[null,'k3o_falscher_pfiff','k3o_originalfolge','k3o_leitungen_getrennt','k3o_rolle_getrennt','k3o_luecken_begrenzt'];
  const checks=[];
  for (const [i,s] of defs.stationen.entries()) {
    for (const f of ['map','tile','directions','patterns','accepted','rangeTiles','safeTiles','routeTiles','fallback','reserve','listeners','privateAnswer','hints','lock']) assert.ok(Object.hasOwn(s,f),s.id+':'+f);
    const map=content.maps[s.map];assert.ok(map,s.map);assert.equal(map.city,'dunscar');
    for (const p of [s.tile,...s.safeTiles,...s.routeTiles]) assert.ok(isSignalWalkable(map,...p),s.id+':'+p);
    assert.deepEqual(Object.keys(s.patterns).sort(),patterns.map((p)=>p.id).sort());
    for (const p of patterns) assert.equal(s.patterns[p.id].form,p.form);
    assert.ok(s.hints.length>=2 && s.hints.length<=4);
    for (const h of s.hints) { assert.ok(h.text.length<=140);for (const f of h.requires_flags ?? []) assert.ok(flags.has(f),f); }
    for (const a of s.accepted) {
      assert.ok(s.patterns[a.pattern] && s.directions.includes(a.dir));
      assert.equal(a.flag ?? null,expectedFlags[i]); if(a.flag)assert.ok(flags.has(a.flag),a.flag);
      for (const f of a.requires_flags ?? [])assert.ok(flags.has(f),f);
      assert.deepEqual(projectSignal({origin:s.tile,dir:a.dir,rangeTiles:s.rangeTiles,routeTiles:s.routeTiles,isWalkable:(x,y)=>isSignalWalkable(map,x,y)}),s.routeTiles);
    }
    for (const l of s.listeners) { assert.ok(map.roamers.some((r)=>r.id===l.id && r.encounter===l.encounter));assert.ok(content.encounters[l.encounter]);assert.equal(l.hearing,hearingOf(l.encounter)); }
    assert.ok(content.maps[s.fallback.map]?.spawns[s.fallback.spawn]);
    assert.ok(s.fallback.nerves>=0 && s.fallback.nerves<=5);
    assert.ok(s.fallback.alarmSeconds>0 && s.fallback.alarmSeconds<=30);
    const lockMap=content.maps[s.lock.map];assert.ok(isSignalWalkable(lockMap,...s.lock.tile));assert.ok(s.lock.id.startsWith('k3r_'));assert.ok(escapePath(lockMap,lockMap.spawns.default,s.lock.tile));
    const exits=map.interactables.filter((o)=>o.kind==='door'&&!o.lock&&!o.visible_if);
    const escape=exits.map((e)=>escapePath(map,s.tile,e.tile)).find(Boolean);assert.ok(escape,s.id+' escape');
    assert.ok(escapePath(map,s.safeTiles[0],map.spawns.default));
    const fbMap=content.maps[s.fallback.map];assert.ok(fbMap.interactables.some((e)=>e.kind==='door'&&!e.lock&&!e.visible_if&&escapePath(fbMap,fbMap.spawns[s.fallback.spawn],e.tile)));
    const b=defs.bindungen[s.id];assert.ok(b.flag.startsWith('k3r_'));assert.equal(b.duration,'bis_schleuse');assert.equal(b.pattern,s.privateAnswer.pattern);
    assert.deepEqual(b.passives,[{key:'unruhe_tick',value:1},{key:'max_nerves',value:-5}]);
    assert.ok(b.journal.length<=140 && b.endText.length<=140);
    checks.push({station:s.id,routeSteps:s.routeTiles.length-1,escapeSteps:escape.length-1});
  }
  return {stations:checks,patterns:patterns.length,uniqueCalls:callSet.size,missingAudio:['bindung_an','bindung_aus'].filter((k)=>defs.klang_zuordnung.events[k].sound===null),ok:true};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(validateRoutes(),null,2));
