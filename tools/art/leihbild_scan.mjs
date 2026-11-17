// Sucht Leihbilder und Platzhalter: Items mit fremdem Icon, Figuren ohne Lauf-Sheet, Gegner mit fremdem Kampf-Sheet.
import { existsSync } from 'node:fs';
import { content as c } from '../../src/data/index.js';
import * as A from '../../src/world/assets.js';

const pub = (u) => new URL(`../../public/${u.replace(/^\.\//, '')}`, import.meta.url);
const out = { items: [], itemsMissing: [], npcs: [], enemies: [], enemiesMissing: [] };
for (const [id, it] of Object.entries(c.items)) {
  const u = A.itemIconUrl(id);
  const file = u.split('/items/')[1].replace(/\.png$/, '');
  if (!existsSync(pub(u))) out.itemsMissing.push(id);
  else if (file !== id) out.items.push([id, file, it.kind ?? '', it.name ?? '']);
}
const npcIds = new Set();
for (const m of Object.values(c.maps ?? {})) for (const n of m.npcs ?? []) npcIds.add(n.id ?? n);
for (const id of npcIds) if (!A.CHARACTER_SHEETS[`npc_${id}`] && !A.CHARACTER_SHEETS[id]) out.npcs.push(id);
for (const [id, e] of Object.entries(c.encounters ?? {})) {
  const s = [e.sheet, A.ENCOUNTER_SHEETS[id], A.ENEMY_BATTLE_SHEETS[e.sprite]].find((k) => k && (A.BATTLE_SHEETS[k] || A.SHEETS[k]));
  const base = id.replace(/_(elite|phase\d|rest)$/, '');
  if (!s) out.enemiesMissing.push([id, e.sprite ?? '', e.name ?? '']);
  else if (!s.includes(base)) out.enemies.push([id, s, e.name ?? '']);
}
console.log(JSON.stringify(out, null, 0));
