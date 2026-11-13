// Prüfung vor dem Zug nach oben: schafft ein Seq-5-Held den Wächter (soll praktisch nie), ein Seq-4-Held (soll meist)?
// node tools/sim/zugwaechter.mjs [encounter] [seeds]  → je Pfad Siegquote Seq 5 / Seq 4, solo (SKILLED und EXPERT)
import { GameState } from '../../src/core/GameState.js';
import { Combat } from '../../src/core/Combat.js';
import { loadContent, seeded, SKILLED, EXPERT } from '../../tests/helpers.js';

const content = loadContent();
const ENC = process.argv[2] ?? 'auf_zugwaechter';
const SEEDS = Array.from({ length: Number(process.argv[3] ?? 12) }, (_, i) => i + 1);
// Probieren: HP=… DMG=… (Faktoren auf Leben/Schaden des Gegners)
if (process.env.HP || process.env.DMG) { const e = content.encounters[ENC]; const k = Number(process.env.DMG ?? 1); const sc = (l) => l.map((a) => (a.action ? a : { ...a, damage: Math.round(a.damage * k) }));
  content.encounters[ENC] = { ...e, hp: Math.round(e.hp * Number(process.env.HP ?? 1)), attacks: sc(e.attacks), ...(e.phase2 ? { phase2: { ...e.phase2, attacks: sc(e.phase2.attacks) } } : {}) }; }
const PIDS = Object.keys(content.pathways);
const WEAPON = 'dsz_schienennagel';

export function held(pid, seq, digestion = 60) {
  const s = new GameState(content);
  s.addItem(WEAPON); s.equip(WEAPON); s.addItem('verband', 4); s.addItem('tonikum', 4);
  s.pathway = { id: pid, seq, digestion }; s.updateMaxHp(); s.hp = s.maxHp; s.composure = s.maxComposure();
  return s;
}
export function play(s, enc, seed, defend = SKILLED) {
  const c = new Combat(s, enc);
  c.rng = seeded(seed);
  let n = 0;
  while (!c.outcome && c.round <= 60) {
    c.actor = 1;
    c.on(1, () => { const h = ['tonikum', 'verband'].find((i) => s.itemCount(i)); if (s.hp < s.maxHp * 0.4 && h && c.canUseItem()) c.useItemNow(h); });
    let guard = 0;
    while (!c.outcome && guard++ < 5) {
      const sk = c.skills().filter((x) => x.usable && x.cost > 0 && x.hits > 0 && !['blind', 'ward'].includes(x.id)).sort((a, b) => (b.flat ?? b.mult * 10) * b.hits - (a.flat ?? a.mult * 10) * a.hits)[0];
      if (!sk) break;
      c.useSkill(sk.id, Array(sk.hits).fill('good'));
    }
    if (!c.outcome) c.useSkill('attack', ['good']);
    if (c.outcome) break;
    do {
      const atk = c.nextEnemyAttack();
      if (atk) {
        for (const p of atk.targets) {
          const rs = atk.hits.map(() => { const r = defend(n++); return r === 'parry' && atk.unparryable ? 'dodge' : r; });
          for (const r of rs) { c.resolveHit(atk, r, p); if (c.outcome) break; }
          if (!c.outcome && !c.fighters[p].down && rs.every((r) => r === 'parry')) c.riposte(p);
        }
        c.endEnemyTurn();
      }
    } while (!c.outcome && c.moreStrikes());
    c.endRound();
  }
  return { won: c.outcome === 'won', rounds: c.round, hp: s.hp / s.maxHp, left: c.enemy.hp / c.enemy.maxHp };
}
const rate = (pid, seq, def, dig) => { const r = SEEDS.map((x) => play(held(pid, seq, dig), ENC, x, def)); const w = r.filter((x) => x.won); return `${Math.round(100 * w.length / r.length)}%${w.length ? '/' + (w.reduce((a, x) => a + x.rounds, 0) / w.length).toFixed(0) + 'r' : '/' + Math.round(100 * r.reduce((a, x) => a + x.left, 0) / r.length) + 'übrig'}`; };
if (process.argv[1].endsWith('zugwaechter.mjs')) {
  console.log('Pfad | S5 geübt (100% verdaut) | S4 geübt (0%) | S4 geübt (60%) | S5 Experte | S4 Experte');
  for (const pid of PIDS) console.log([pid, rate(pid, 5, SKILLED, 100), rate(pid, 4, SKILLED, 0), rate(pid, 4, SKILLED, 60), rate(pid, 5, EXPERT, 100), rate(pid, 4, EXPERT, 0)].join(' | '));
}
