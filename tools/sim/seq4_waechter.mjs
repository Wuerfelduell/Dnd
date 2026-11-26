// Seq-4-Wächter unter Prüfungsregeln mit Seq-5-Ausrüstung (voll verdaut). node tools/sim/seq4_waechter.mjs [--seeds 10]
import { GameState } from '../../src/core/GameState.js';
import { Combat, isPrecise } from '../../src/core/Combat.js';
import { ordealId } from '../../src/core/Pathways.js';
import { TRAUM_ID } from '../../src/core/Seq4.js';
import { HG_SUDE } from '../../src/data/seq4.js';
import { loadContent, seeded, SKILLED, SKILLED_HIT, EXPERT } from '../../tests/helpers.js';

const content = loadContent();
const PIDS = Object.keys(content.pathways).filter((p) => content.pathways[p].seqs?.[4]?.ritual?.hg);
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SCALE = +(arg('--scale') ?? 1);
const DSCALE = +(arg('--dmg') ?? 1);
const SEEDS = Array.from({ length: +(arg('--seeds') ?? 8) }, (_, i) => i + 1);
const WEAPON = 'zirkel_salzharpune';

function hero(pid, kind) {
  const s = new GameState(content);
  if (!['maske', 'waage'].includes(kind) || kind === 'maske') { s.addItem(WEAPON); s.equip(WEAPON); }
  if (kind !== 'waage') { s.addItem('tonikum', 6); s.addItem('verband', 6); }
  s.pathway = { id: pid, seq: 5, digestion: 100 }; s.updateMaxHp(); s.hp = s.maxHp; s.composure = s.maxComposure();
  return s;
}

function fight(s, id, seed, def, kind) {
  const c = new Combat(s, id);
  c.rng = seeded(seed);
  let n = 0, k = 0;
  const hit = (sk, bars) => Array.from({ length: bars }, () => SKILLED_HIT(k++, isPrecise(sk)));
  const flasks = ['wurf_spreng', 'wurf_saeure', 'wurf_gift'];
  while (!c.outcome && c.round <= 120) {
    c.actor = 1;
    const heal = ['tonikum', 'verband'].find((i) => s.itemCount(i));
    if (kind === 'kessel') { const f = s.hp < s.maxHp * 0.35 && heal ? heal : flasks.find((i) => s.itemCount(i)); if (f && c.canUseItem()) c.useItemNow(f); }
    else if (s.hp < s.maxHp * 0.5 && heal && c.canUseItem()) c.useItemNow(heal);
    let guard = 0;
    while (!c.outcome && guard++ < 5 && kind !== 'kessel') {
      const sk = c.skills().filter((x) => x.usable && x.cost > 0 && x.hits > 0 && !['blind', 'ward'].includes(x.id)).sort((a, b) => (b.flat ?? b.mult * 10) * b.hits - (a.flat ?? a.mult * 10) * a.hits)[0];
      if (!sk) break;
      c.useSkill(sk.id, hit(sk, sk.hits));
    }
    if (!c.outcome && kind !== 'kessel') c.useSkill('attack', hit({ id: 'attack' }, 1));
    if (c.outcome) break;
    do {
      const atk = c.nextEnemyAttack();
      if (atk) {
        for (const p of atk.targets) {
          const rs = atk.hits.map(() => { let r = def(n++); if (kind === 'eisen' && r === 'dodge') r = atk.unparryable ? 'miss' : 'parry'; if (kind === 'schluessel' && r === 'parry') r = 'dodge'; return r === 'parry' && atk.unparryable ? 'dodge' : r; });
          for (const r of rs) { c.resolveHit(atk, r, p); if (c.outcome) break; }
          if (!c.outcome && !c.fighters[p].down && rs.every((r) => r === 'parry')) c.riposte(p);
        }
        c.endEnemyTurn();
      }
    } while (!c.outcome && c.moreStrikes());
    if (!c.outcome) c.endRound();
  }
  const out = { outcome: c.outcome ?? 'timeout', rounds: c.round, left: Math.round(100 * c.foes[0].enemy.hp / c.foes[0].enemy.maxHp), broken: c.ruleBroken ?? null, moor: c.moorDrunk ?? 0 };
  c.finish?.();
  return out;
}

const KINDS = { laterne: null, uhr: null };
const rows = [];
for (const pid of PIDS) {
  const kind0 = content.pathways[pid].seqs[4].ritual.hg; for (const kind of process.argv.includes('--plain') ? ['plain'] : [kind0]) {
  if (kind in KINDS) { rows.push({ pid, kind, note: 'Echtzeit/Timing, nicht simuliert' }); continue; }
  if (kind === 'plain') { /* normale Regeln */ }
  for (const [dn, def] of [['EXPERT', EXPERT], ['SKILLED', SKILLED]]) {
    let wins = 0, rounds = 0, moor = 0; const why = {}; let left = 0, lr = 0;
    for (const seed of SEEDS) {
      const s = hero(pid, kind);
      const st = s.seq4();
      if (SCALE !== 1 || DSCALE !== 1) { const orig = s.seq4CombatRules.bind(s); s.seq4CombatRules = (id, enc) => { const r = orig(id, enc); return r && id === ordealId(pid, 4) ? { ...r, scale: { hp: SCALE, dmg: DSCALE } } : r; }; }
      if (kind === 'maske') st.masked = true;
      if (kind === 'echo') st.active = true;
      if (kind === 'kessel') { st.drunk = HG_SUDE.map((x) => x.id); s.addItem('wurf_spreng', 60); s.addItem('wurf_saeure', 30); }
      if (kind === 'moor') { s.addItem('moorwasser', 200); s.addItem('s4mo_relikt'); }
      if (kind === 'schluessel') { st.shadow = true; st.shadowMax = Math.round(s.maxHp * 0.4); st.shadowHp = st.shadowMax; }
      if (kind === 'faden') {
        st.marks = ['wx_moorhund', 'wx_irrlicht', 'wx_salzkrabbe', 'wx_nebelreiher', 'wx_torfgeist'].map((e) => content.encounters[e] ? { enc: e, name: content.encounters[e].name } : null).filter(Boolean);
        while (st.marks.length < 5) { const z = Object.keys(content.encounters).filter((e) => content.encounters[e].zone?.startsWith?.('wx_') && !st.marks.some((m) => m.enc === e))[st.marks.length]; st.marks.push({ enc: z, name: content.encounters[z].name }); }
        st.dream = true; s.buildDream();
        const d = fight(s, TRAUM_ID, seed, def, kind);
        if (d.outcome !== 'won') { left += d.left; lr += d.rounds; why['traum_' + d.outcome] = (why['traum_' + d.outcome] ?? 0) + 1; continue; }
        st.dreamWon = true;
      }
      if (kind === 'schluessel') {
        const zone = Object.keys(content.zones.wx_vergessmoor.encounters ?? {}).filter((e) => content.encounters[e] && !content.encounters[e].boss && !content.encounters[e].elite);
        let ok = true;
        for (let i = 0; i < 2 && ok; i++) { const r = fight(s, zone[i % zone.length], seed * 7 + i, def, kind); ok = r.outcome === 'won'; if (!ok) why['vorkampf_' + r.outcome] = (why['vorkampf_' + r.outcome] ?? 0) + 1; }
        if (!ok) continue;
      }
      if (kind !== 'plain') st.guardian = true;
      const r = fight(s, ordealId(pid, 4), seed, def, kind);
      if (r.outcome === 'won') { wins++; rounds += r.rounds; moor += r.moor; } else { left += r.left; lr += r.rounds; const key = r.broken ? 'regel' : r.outcome; why[key] = (why[key] ?? 0) + 1; }
    }
    rows.push({ pid, kind, def: dn, sieg: `${wins}/${SEEDS.length}`, runden: wins ? Math.round(rounds / wins) : '-', moor: kind === 'moor' && wins ? Math.round(moor / wins) : '', gruende: JSON.stringify(why), rest: wins < SEEDS.length ? `${Math.round(left / (SEEDS.length - wins))}% nach ${Math.round(lr / (SEEDS.length - wins))}R` : '' });
  }
}}
console.table(rows);
