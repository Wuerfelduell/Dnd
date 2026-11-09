import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

// Technical pixel-grid export only; artwork is generated with image_gen.
// Usage from repository root: node docs/art/export-14b.mjs <source-directory>
const sourceDir = process.argv[2];
if (!sourceDir) throw new Error('Provide the directory containing the generated source PNGs.');
const spec = JSON.parse(fs.readFileSync('docs/art/batch-14b-generation.json', 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dnd-14b-'));
const run = (...args) => execFileSync('magick', args);
const colors = ['#1a1c2c','#252b38','#303b49','#425360','#586c78','#71858b','#95a5a5',
  '#2d2629','#413433','#58433c','#715648','#92745a','#b3946e','#cfb18a','#e0c9a1',
  '#494b3a','#686850','#8b8870','#b4ac91','#dbd2b3','#eee2c5',
  '#173d40','#245b59','#36817a','#4eafa2','#6fe0d0',
  '#5f4829','#886332','#ba8942','#dbac5d','#f0ce80'];
try {
  const palette = path.join(tmp, 'palette.png');
  run(...colors.flatMap(c => ['-size','1x1',`xc:${c}`]), '+append', palette);
  for (const job of spec.jobs) {
    const out = path.join('public/sprites', job.path);
    fs.mkdirSync(path.dirname(out), {recursive:true});
    const args = [path.join(sourceDir, path.basename(job.source)), '-filter','point','-resize',`${job.size[0]}x${job.size[1]}!`];
    const mask = path.join(tmp, `${job.id}-alpha.png`);
    if (job.transparent) run(...args,'-alpha','extract','-threshold','50%',mask);
    args.push('-alpha','off','+dither','-remap',palette);
    // Explicitly clear padded frames; they never contain animation frames.
    const counts = job.id === 'battle_player' ? [4,6,5,4,4,4,3,4,6]
      : job.id === 'enemy_holt' ? [4,6,3,4]
      : job.id.startsWith('enemy_') ? [4,6,6,3,6] : null;
    if (counts) {
      const cell = job.size[0]/6;
      const maskArgs = [mask,'-fill','black','-stroke','none'];
      counts.forEach((count,row) => {
        if (count < 6) maskArgs.push('-draw',`rectangle ${count*cell},${row*cell} ${job.size[0]-1},${(row+1)*cell-1}`);
      });
      run(...maskArgs,mask);
    }
    if (job.id === 'items_14b') run(mask,'-fill','black','-stroke','none','-draw','rectangle 48,16 63,31',mask);
    if (job.transparent) args.push(mask,'-alpha','off','-compose','CopyOpacity','-composite');
    args.push('-strip', `PNG32:${out}`);
    run(...args);
  }
  const ids = ['spazierstock','schlagstock','stockdegen','verband','tonikum','riechsalz','bannsalz'];
  for (const [i,id] of ids.entries()) run('public/sprites/items/14b_items.png','-crop',`16x16+${i%4*16}+${Math.floor(i/4)*16}`,'+repage',`PNG32:public/sprites/items/${id}.png`);
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}
