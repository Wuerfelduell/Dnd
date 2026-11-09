import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const {assets} = JSON.parse(fs.readFileSync('public/sprites/manifest-14b.json'));
const items = JSON.parse(fs.readFileSync('src/data/items.json'));
const itemIds = new Set(Array.isArray(items) ? items.map(x => x.id) : Object.keys(items));
for (const asset of assets) {
  const file = `public/sprites/${asset.file}`;
  const png = fs.readFileSync(file);
  assert.equal(png.subarray(1,4).toString(),'PNG',file);
  assert.equal(png.readUInt32BE(16),asset.width,file);
  assert.equal(png.readUInt32BE(20),asset.height,file);
  const rgba = execFileSync('magick',[file,'-depth','8','rgba:-']);
  assert.equal(rgba.length,asset.width*asset.height*4,file);
  const colors = new Set();
  let transparent = 0;
  for (let p=0;p<rgba.length;p+=4) {
    const a = rgba[p+3];
    assert.ok(a===0||a===255,`${file}: partial alpha`);
    if (!a) transparent++;
    else colors.add(`${rgba[p]},${rgba[p+1]},${rgba[p+2]}`);
  }
  assert.ok(colors.size <=31 && colors.size>0,`${file}: visible palette ${colors.size}`);
  assert.equal(transparent>0,asset.transparent,`${file}: transparency`);
  if (asset.animations || asset.id==='items_14b') {
    const used = asset.animations ? new Set(Object.values(asset.animations).flatMap(x=>x.frames)) : new Set([0,1,2,3,4,5,6]);
    const fw = asset.frameWidth, fh = asset.frameHeight;
    const total = asset.width/fw * asset.height/fh;
    for(let frame=0;frame<total;frame++) {
      const sx = frame%asset.columns*fw, sy = Math.floor(frame/asset.columns)*fh;
      let occupied = 0;
      for(let y=sy;y<sy+fh;y++) for(let x=sx;x<sx+fw;x++) occupied+=rgba[(y*asset.width+x)*4+3]>0;
      assert.equal(occupied>0,used.has(frame),`${file}: frame ${frame}`);
    }
  }
  if(asset.file.startsWith('items/') && asset.id!=='items_14b') assert.ok(itemIds.has(asset.id),`Unknown item: ${asset.id}`);
  console.log(`${asset.id}: ${asset.width}x${asset.height}, ${colors.size} colors, OK`);
}
console.log(`Verified ${assets.length} PNG assets.`);
