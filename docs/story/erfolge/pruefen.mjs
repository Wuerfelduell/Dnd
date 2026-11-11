import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(dir,'../../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const a=read(path.join(dir,'erfolge.json')), s=read(path.join(dir,'bedingungen.json')), m=read(path.join(dir,'meldungen.json'));
assert.equal(a.length,80);assert.equal(new Set(a.map(e=>e.id)).size,80);
const groups={faelle:16,sequenzen:12,zirkel:12,welt:16,kampf:12,koop:8,kuriositaeten:4};
for(const [g,n] of Object.entries(groups))assert.equal(a.filter(e=>s[e.id]?.gruppe===g).length,n,g);
for(const [i,e] of a.entries()){
 assert.match(e.id,/^erf_[a-z0-9_]+$/);assert.ok(e.name.trim().split(/\s+/).length>=2&&e.name.trim().split(/\s+/).length<=4,e.name);
 assert.match(e.text,/^[^.!?]+[.]$/);assert.equal(typeof e.versteckt,'boolean');assert.equal(typeof e.koop,'boolean');assert.equal(s[e.id].index,i);
 assert.equal(Object.keys(e.bedingung).length,1);const {requires_flags:f,zaehler:z}=e.bedingung;
 if(f){assert.ok(Array.isArray(f)&&f.length);for(const flag of f){assert.equal(typeof flag,'string');const files=s[e.id].quelle.split('; ');assert.ok(files.some(p=>fs.existsSync(path.join(root,p))&&fs.readFileSync(path.join(root,p),'utf8').includes('"'+flag+'"')),`${e.id}: flag ${flag} fehlt in Quelle`);}}
 else {assert.ok(z&&/^[a-z0-9_]+$/.test(z.id));assert.ok(Number.isInteger(z.min)&&z.min>0);assert.equal(s[e.id].status,'Zähler-Vorschlag');assert.ok(s[e.id].regel.length>25);}
 if(e.freischaltung)assert.match(e.freischaltung,/^(haus_[a-z0-9_]+|titel_[0-9]+)$/);
 assert.equal(e.koop,s[e.id].gruppe==='koop');if(s[e.id].gruppe==='kuriositaeten')assert.equal(e.versteckt,true);
}
assert.equal(m.einblendungen.length,6);assert.equal(Object.keys(m.akte).length,4);assert.equal(m.koop.length,4);
for(const t of [...m.einblendungen,...m.koop])assert.equal((t.match(/\{name\}/g)||[]).length,1);
const atlas=path.join(root,'public/sprites/manifest-erfolge.json');
if(fs.existsSync(atlas)){const manifest=read(atlas);for(const [i,e] of a.entries()){const c=manifest.achievementAtlas[e.id];assert.deepEqual(c.cell,[i%10,Math.floor(i/10)]);assert.equal(c.index,i);}assert.equal(Object.keys(manifest.achievementAtlas).length,80);}
console.log('PASS: 80 eindeutige Erfolge; Gruppen 16/12/12/16/12/8/4; Texte, Bedingungen, Flag-Quellen, Meldungen und Atlas-Zuordnung gültig.');
console.log(`Flags: ${a.filter(e=>e.bedingung.requires_flags).length}; dokumentierte Zählerbedingungen: ${a.filter(e=>e.bedingung.zaehler).length}; versteckt: ${a.filter(e=>e.versteckt).length}.`);
