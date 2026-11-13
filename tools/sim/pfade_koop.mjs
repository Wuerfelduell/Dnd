// Koop-Check: laufen die Seq-5- und Seq-4-Prüfungen auch, wenn Spieler 2 sie ablegt?
// Verdrahtung wie im Spiel: Knöpfe im Pfad-Tab laufen unter withPlayer(2); Kämpfe gegen Kartengegner
// startet die Welt mit combatBy = acting (1); Kampfmenü-Aktionen (Stimme rauben, Faden, Verschonen) kommen ohne Spielerwechsel.
import { GameState } from '../../src/core/GameState.js';
import { Combat } from '../../src/core/Combat.js';
import { loadContent } from '../../tests/helpers.js';
import { SPINNENFADEN } from '../../src/data/seq5.js';

const content = loadContent();
export function runChecks(P2 = 2) {
function pair(pid, seq) {
  const s = new GameState(content);
  s.pathway = { id: P2 === 1 ? pid : 'eisen', seq: P2 === 1 ? seq : 7, digestion: 30 }; s.updateMaxHp(); s.hp = s.maxHp;
  s.addP2();
  s.withPlayer(2, () => { s.pathway = { id: P2 === 2 ? pid : 'eisen', seq: P2 === 2 ? seq : 7, digestion: 100 }; s.updateMaxHp(); s.hp = s.maxHp; s.composure = s.maxComposure(); });
  return s;
}
const me = (s, fn) => s.withPlayer(P2, fn);
/** Kampf wie aus der Welt gestartet (Kartengegner: combatBy = 1, vorgemerkt: wer ihn ausgelöst hat). */
function mapFight(s, id, { win = true, rounds = 1, kill = null } = {}) {
  if (!s.pendingCombat) s.combatBy = s.acting; s.pendingCombat = null;
  const c = new Combat(s, id);
  c.rng = () => 0.5;
  c.round = rounds;
  if (kill) kill(c); else c.outcome = win ? 'won' : 'lost';
  const r = c.finish();
  return { c, r };
}
const res = {};
const check = (name, fn) => { try { const v = fn(); res[name] = v === true ? 'ok' : `FEHLT: ${v}`; } catch (e) { res[name] = `FEHLER: ${e.message.slice(0, 80)}`; } };

// --- Seq 5 (von 6) ---
check('s5 uhr: Schlüssel-Taschenuhr zählt', () => {
  const s = pair('sq_uhr', 6); s.addItem('taschenuhr');
  return me(s, () => s.hasWatch()) || 'die Taschenuhr (Schlüsselgegenstand, liegt immer beim Ermittler) zählt nicht';
});
check('s5 uhr', () => {
  const s = pair('sq_uhr', 6); me(s, () => s.addItem('uhr_taschen'));
  let r = me(s, () => s.startUhr()); if (!r.ok) return r.text;
  mapFight(s, 'moorleiche');
  const st = me(s, () => s.seq5()); st.t -= 25000;
  mapFight(s, 'moorleiche');
  return me(s, () => s.seq5().phase) === 'wait2' || `Phase nach 2. Kampf: ${me(s, () => s.seq5().phase)}`;
});
check('s5 faden (Fäden fallen)', () => {
  const s = pair('faden', 6);
  let n = 0;
  for (let i = 0; i < 20; i++) { const c = new Combat(s, 'moorleiche'); c.rng = () => 0.1; n += c.rollLoot(true).items[SPINNENFADEN] ?? 0; }
  return n > 0 || 'keine Spinnenfäden aus okkulten Wesen';
});
check('s5 echo (Stimme rauben)', () => {
  const s = pair('echo', 6);
  me(s, () => { for (const [id, n] of Object.entries(s.ritualDef('echo', 5).consumes ?? {})) s.addItem(id, n); });
  s.combatBy = 1;
  const c = new Combat(s, 'enemy_sk_asche_hand'); c.rng = () => 0.5;
  if (P2 === 2) c.actor = 2;
  c.enemy.hp = Math.floor(c.enemy.maxHp * 0.08); c.hurtEnemy(0);
  if (!c.canStealVoice()) return 'Kampfmenü bietet „Stimme rauben“ nicht an';
  c.stealVoice(); c.finish();
  return me(s, () => !!s.seq5().done) || 'Prüfung nicht bestanden';
});
check('s5 eisen', () => {
  const s = pair('eisen', 6);
  me(s, () => { s.hp = Math.floor(s.maxHp * 0.3); });
  let r = me(s, () => s.startEisen()); if (!r.ok) return r.text;
  for (let i = 0; i < 5; i++) mapFight(s, 'moorleiche', { rounds: 2 });
  return me(s, () => !!s.seq5().done) || `Stand ${JSON.stringify(me(s, () => s.seq5()))}`;
});
// --- Seq 4 (von 5) ---
check('s4 eisen (Wächter erscheint)', () => {
  const s = pair('eisen', 5);
  me(s, () => { s.flags; s.pathway.digestion = 100; });
  const arts = Object.keys(content.artifacts ?? {}).length ? Object.keys(s.content.items).filter((id) => s.content.items[id].kind === 'artifact').slice(0, 5) : [];
  me(s, () => { for (const a of arts) s.addItem(a); for (const sl of ['hut', 'mantel', 'amulett']) if (s.gear) s.gear[sl] = null; s.addItem('brecheisen', 200); });
  const cond = me(s, () => s.eisenConditions());
  if (!cond.ok) return `Bedingungen im Test nicht erfüllt ${JSON.stringify(cond)}`;
  s.tick(1);
  return !!s.pendingCombat || 'Wächter erscheint nicht';
});
check('s4 echo (Kartenkampf taub + zählt)', () => {
  const s = pair('echo', 5);
  let r = me(s, () => s.startEcho()); if (!r.ok) return r.text;
  const { c } = mapFight(s, 'moorleiche');
  if (!c.rules?.deaf) return 'Kampf ohne Taub-Regel';
  return me(s, () => s.seq4().wins) === 1 || `Siege ${me(s, () => s.seq4().wins)}`;
});
check('s4 uhr (Kartenkampf zählt)', () => {
  const s = pair('sq_uhr', 5); me(s, () => s.addItem('uhr_taschen'));
  let r = me(s, () => s.startUhr4()); if (!r.ok) return r.text;
  const { c } = mapFight(s, 'moorleiche');
  return !!c.rules?.uhr || 'Kampf ohne Uhr-Regel';
});
check('s4 faden (Faden knüpfen)', () => {
  const s = pair('faden', 5);
  s.combatBy = 1; const c = new Combat(s, 'moorleiche'); if (P2 === 2) c.actor = 2;
  return c.canMarkFate() || 'Kampfmenü bietet „Schicksalsfaden“ nicht an';
});
check('s4 laterne (Laternennacht)', () => {
  const s = pair('laterne', 5); s.map = 'marsch'; me(s, () => s.addItem('lampenoel', 6));
  const r = me(s, () => s.startSiege()); return r.ok || r.text.slice(0, 70);
});
check('s4 schluessel (Schatten)', () => {
  const s = pair('schluessel', 5); s.map = 'marsch';
  const r = me(s, () => s.startShadow()); if (!r.ok) return r.text.slice(0, 70);
  const { c } = mapFight(s, 'moorleiche');
  if (!c.rules?.shadow) return 'Kartenkampf ohne Schattenregeln';
  return me(s, () => s.seq4().wins) === 1 || `Schatten-Siege ${me(s, () => s.seq4().wins)}`;
});
check('s4 maske (Kartenkampf mit Regeln)', () => {
  const s = pair('maske', 5);
  const r = me(s, () => s.startMaske()); if (!r.ok) return r.text.slice(0, 80);
  const tgt = Object.keys(content.encounters).find((id) => me(s, () => s.maskeTarget(id)));
  const { c } = mapFight(s, tgt, { win: false });
  return !!c.rules?.onlyAttack || `Kampf gegen ${tgt} ohne Maskenregeln`;
});
return res;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const P = process.argv.includes('--p1') ? 1 : 2;
  console.log(`Prüfling: Spieler ${P}`);
  for (const [k, v] of Object.entries(runChecks(P))) console.log(`${v === 'ok' ? 'ok  ' : '!!  '}${k}: ${v}`);
}
