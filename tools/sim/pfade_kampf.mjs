// Kampf-Sweep: jeder Pfad, Seq 9 bis 4, solo und zu zweit, gegen die Gebiete von Kettlegate, Wexmoor und Dunscar.
// node tools/sim/pfade_kampf.mjs  → Tabelle: Siegquote, Runden, Restleben
import { GameState } from '../../src/core/GameState.js';
import { Combat } from '../../src/core/Combat.js';
import { loadContent, seeded, SKILLED } from '../../tests/helpers.js';

const content = loadContent();
const STAGES = [
  { seq: 9, weapon: 'stockdegen', zones: ['marsch', 'katakomben'], bosses: [] },
  { seq: 8, weapon: 'ossuarklinge', zones: ['pestgassen', 'kraterwald'], bosses: ['miss_wren'] },
  { seq: 7, weapon: 'ossuarklinge', zones: ['kraterwald'], bosses: ['starling_fight'] },
  { seq: 6, weapon: 'zirkel_moorkette', zones: ['wx_vergessmoor', 'wx_salzwatt'], bosses: ['namenlose'] },
  { seq: 5, weapon: 'zirkel_salzharpune', zones: ['wx_leuchtturm', 'ds_rangierwueste'], bosses: ['leuchtfeuer'] },
  { seq: 4, weapon: 'dsz_schienennagel', zones: ['ds_rufschlucht', 'ds_unterschicht'], bosses: [] },
];
const PIDS = Object.keys(content.pathways);
const SEEDS = [1, 2, 3, 4, 5, 6];

function equip(s, pid, seq, weapon) {
  s.addItem(weapon); s.equip(weapon); s.addItem('verband', 3); s.addItem('tonikum', 2);
  s.pathway = { id: pid, seq, digestion: 60 }; s.updateMaxHp(); s.hp = s.maxHp; s.composure = s.maxComposure();
}
function party(pid, seq, weapon, duo) {
  const s = new GameState(content);
  equip(s, pid, seq, weapon);
  if (duo) { s.addP2(); s.withPlayer(2, () => equip(s, pid, seq, weapon)); }
  return s;
}
function play(s, enc, seed) {
  const c = new Combat(s, enc);
  c.rng = seeded(seed);
  let n = 0;
  while (!c.outcome && c.round <= 60) {
    for (const p of [1, 2]) {
      if (!c.fighters[p] || c.fighters[p].down || c.outcome) continue;
      c.actor = p;
      c.on(p, () => { const h = ['tonikum', 'verband'].find((i) => s.itemCount(i)); if (s.hp < s.maxHp * 0.35 && h && c.canUseItem()) c.useItemNow(h); });
      let guard = 0;
      while (!c.outcome && guard++ < 5) {
        const sk = c.skills().filter((x) => x.usable && x.cost > 0 && x.hits > 0 && !['blind', 'ward'].includes(x.id)).sort((a, b) => (b.flat ?? b.mult * 10) * b.hits - (a.flat ?? a.mult * 10) * a.hits)[0];
        if (!sk) break;
        c.useSkill(sk.id, Array(sk.hits).fill('good'));
      }
      if (!c.outcome) c.useSkill('attack', ['good']);
    }
    if (c.outcome) break;
    do {
      const atk = c.nextEnemyAttack();
      if (atk) {
        for (const p of atk.targets) {
          const rs = atk.hits.map(() => { const r = SKILLED(n++); return r === 'parry' && atk.unparryable ? 'dodge' : r; });
          for (const r of rs) { c.resolveHit(atk, r, p); if (c.outcome) break; }
          if (!c.outcome && !c.fighters[p].down && rs.every((r) => r === 'parry')) c.riposte(p);
        }
        c.endEnemyTurn();
      }
    } while (!c.outcome && c.moreStrikes());
    c.endRound();
  }
  const hp = c.on(1, () => s.hp / s.maxHp);
  return { won: c.outcome === 'won', rounds: c.round, hp };
}
function stat(pid, seq, weapon, enc, duo) {
  const r = SEEDS.map((seed) => { try { return play(party(pid, seq, weapon, duo), enc, seed); } catch (e) { return { err: e.message }; } });
  const err = r.find((x) => x.err);
  if (err) return { err: err.err };
  const won = r.filter((x) => x.won);
  return { win: won.length / r.length, rounds: won.length ? won.reduce((a, x) => a + x.rounds, 0) / won.length : null, hp: won.length ? won.reduce((a, x) => a + x.hp, 0) / won.length : 0 };
}
const zoneEnc = (z) => { const list = content.zones[z].encounters ?? []; const ids = (Array.isArray(list) ? list : Object.keys(list)).map((e) => (typeof e === 'string' ? e : e.id ?? e.encounter)).filter(Boolean); return ids; };

const rows = [];
for (const st of STAGES) {
  for (const z of st.zones) {
    const ids = zoneEnc(z).filter((id) => content.encounters[id]);
    const pick = [ids.find((id) => !content.encounters[id].elite && !content.encounters[id].boss), ids.find((id) => content.encounters[id].elite), ids.find((id) => content.encounters[id].boss)].filter(Boolean);
    for (const enc of pick) rows.push({ seq: st.seq, weapon: st.weapon, enc, where: z });
  }
  for (const enc of st.bosses) rows.push({ seq: st.seq, weapon: st.weapon, enc, where: 'story' });
}
const fmt = (x) => (x.err ? `ERR ${x.err.slice(0, 40)}` : `${Math.round(x.win * 100)}%/${x.rounds ? x.rounds.toFixed(1) : '-'}r/${Math.round(x.hp * 100)}hp`);
const out = [];
for (const row of rows) {
  const e = content.encounters[row.enc];
  const kind = e.boss ? 'Boss' : e.elite ? 'Elite' : 'normal';
  const line = { seq: row.seq, where: row.where, enc: row.enc, kind };
  for (const pid of PIDS) { line[pid] = fmt(stat(pid, row.seq, row.weapon, row.enc, false)); line[`${pid}+`] = fmt(stat(pid, row.seq, row.weapon, row.enc, true)); }
  out.push(line);
  console.log([row.seq, row.where, row.enc, kind, ...PIDS.map((p) => `${p}:${line[p]} duo:${line[`${p}+`]}`)].join(' | '));
}
if (process.argv[2]) (await import('node:fs')).writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
