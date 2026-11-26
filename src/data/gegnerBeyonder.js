/**
 * Gegner-Beyonder (Seb 2026-11-26): Gegner nutzen die Kampffertigkeiten der zehn Pfade.
 *
 * - `gegnerFaehigkeit(skill, …)` macht aus einer Spieler-Fertigkeit (pathways → seqs[n].skill / skill2) einen Eintrag
 *   für `enc.attacks`: Schaden wird zum Angriff mit Ringen (sicher/durchdringend → nicht parierbar, Brand → Blutung,
 *   Betäuben/Verwirren/Verlangsamen/Schwächen → Nerven, Flächen-Fertigkeiten → trifft alle), Echo-Raub wird `drain`,
 *   Heilen/Schutz/Ausweichen werden die Kniffe `heal`, `guard`, `veil` (Combat.enemyAct), reine Kontrolle ein Schlag auf die Nerven. Der Schaden richtet sich nach dem
 *   Durchschnitt der eigenen Angriffe des Gegners, damit die Härte des Ortes bleibt.
 * - `pfadAngriffe(content, pid, seq, enc)`: Hauptfertigkeit und zweite Fertigkeit dieser Sequenz als Gegner-Einträge.
 * - `machBeyonder(content, id, pid, seq)`: macht einen Gegner zum Beyonder ohne Zirkel (`beyonder`, `tier_seq`), mischt
 *   die Pfad-Fertigkeiten in seine Angriffe (auch Phase 2) und legt mit seltener Chance die Formel seiner Sequenz
 *   in die Beute (Seq 4 nur 0,5 %, Seb: die Formel der 4 gibt es sonst nur auf geheimen Treffen).
 * - KOPFGELD_BEYONDER: alle menschlichen Kopfgeld-Ziele von Kettlegate bis Calderwick sind jetzt solche Beyonder,
 *   jeder der zehn Pfade kommt vor. Pfadlose Kopfgelder gibt es damit nicht mehr.
 */

/** Chance auf die Formel der eigenen Sequenz (Kopfgeld-Ziele kämpfen meist nur einmal). */
export const FORMEL_CHANCE = 0.05; // wie die übrigen Formel-Funde (treffen.test.js: höchstens 5 %)
/** Formel der Sequenz 4: so selten wie bei Eliten (Seb, 2026-11-12). */
export const FORMEL_CHANCE_SEQ4 = 0.005;

/** Kopfgeld-Ziel → [Pfad, Sequenz]. */
export const KOPFGELD_BEYONDER = {
  // Kettlegate: Revier-Brett samt Schmugglerkönigin (Seq 9) und Stadtleben-Steckbriefe (Seq 8)
  kopfgeld_laternendieb: ['laterne', 9],
  kopfgeld_falschgeldpraeger: ['sq_waage', 9],
  kopfgeld_nachtkraemer: ['kessel', 9],
  schmugglerkoenigin: ['schluessel', 9],
  kg_kopfgeld_siegelbrecher: ['schluessel', 8],
  kg_kopfgeld_schichtdieb: ['maske', 8],
  kg_kopfgeld_pfandvogt: ['eisen', 8],
  // Wexmoor: Steckbriefe der Hafenwache (Seq 7, die zwei großen Seq 6)
  wxk_gleispluenderer: ['eisen', 7],
  wxk_torfschneider: ['sq_moor', 7],
  wxk_salzfaelscher: ['sq_waage', 7],
  wxk_bojenbrecher: ['echo', 7],
  wxk_pfahlraeuber: ['faden', 7],
  wxk_wattgaenger: ['sq_uhr', 7],
  wxk_moorhehler: ['sq_moor', 6],
  wxk_linsendieb: ['laterne', 6],
  // Dunscar: Kopfgelder (Seq 6, Signalbrecher und verstärkter Staubschmuggler Seq 5)
  k3k_kupferdieb: ['schluessel', 6],
  k3k_schienenlaeufer: ['sq_uhr', 6],
  k3k_lohnfaelscher: ['sq_waage', 6],
  k3k_staubschmuggler: ['kessel', 6],
  k3k_staubschmuggler_elite: ['kessel', 5],
  k3k_walzenhehler: ['echo', 6],
  k3k_signalbrecher: ['faden', 5],
  k3k_signalbrecher_phase2: ['faden', 5],
  // Calderwick: Kasse der Gefallenen (Seq 4)
  k4s_kg_aschmann: ['eisen', 4],
  k4s_kg_vell: ['echo', 4],
  k4s_kg_dorn: ['maske', 4],
  k4s_kg_hollin: ['sq_waage', 4],
};

const TEXT = {
  heal: (v) => `Die Gabe des Pfades schließt die Wunden: +${v} Leben.`,
  guard: (v) => `Die Gabe des Pfades legt sich wie Panzer an: +${v} Abwehr.`,
  veil: () => 'Kaum noch zu fassen: nur präzise Treffer zählen.',
};

/** Takt der Ringe je Trefferzahl (wie die Daten der Gegner, höchstens vier). */
const TAKT = { 1: [1900], 2: [1100, 1800], 3: [900, 1400, 1900], 4: [800, 1200, 1600, 2000] };

/** Durchschnittlicher Schaden der eigenen Angriffe eines Gegners. */
export function grundSchaden(enc) {
  const d = (enc?.attacks ?? []).filter((a) => !a.action && a.damage > 0).map((a) => a.damage);
  return d.length ? d.reduce((s, x) => s + x, 0) / d.length : 10;
}

/**
 * Spieler-Fertigkeit → Gegner-Eintrag. base: Grundschaden des Gegners, hp: seine Leben, seq: seine Sequenz.
 */
export function gegnerFaehigkeit(skill, { base = 10, hp = 100, seq = 9 } = {}) {
  const name = skill.name;
  const hits = Math.min(4, skill.hits ?? 0);
  if (hits > 0) {
    if (skill.drain) return { name, action: 'drain', value: 1, heal: Math.round(hp * 0.04), heal_per_ap: Math.round(hp * 0.02), text: '', pfad: true };
    const per = hits >= 3 ? 0.6 : hits === 2 ? 0.8 : 1.15;
    const atk = { name, damage: Math.max(1, Math.round(base * per)), hits: [...TAKT[hits]], pfad: true };
    if (skill.sure || skill.pierce) atk.unparryable = true;
    if (skill.burn) atk.bleed = [Math.max(2, Math.round(base * 0.3)), skill.burn[1] ?? 2];
    if (skill.stun || skill.confuse || skill.slow || skill.weaken) atk.nerves = Math.max(2, Math.round(base * 0.4));
    if (skill.aoe || skill.sweep) atk.sweep = true;
    return atk;
  }
  if (skill.heal || skill.heal_all) { const v = Math.round(hp * 0.1); return { name, action: 'heal', value: v, text: TEXT.heal(v), pfad: true }; }
  if (skill.shield || skill.shield_all) { const v = Math.min(14, Math.max(4, Math.round(base * 0.5))); return { name, action: 'guard', value: v, text: TEXT.guard(v), pfad: true }; }
  if (skill.evade || skill.read) return { name, action: 'veil', text: TEXT.veil(), pfad: true };
  // Reine Kontrolle (Betäuben, Verwirren, Schwächen, Verlangsamen): ein Schlag, der an den Nerven zerrt
  return { name, damage: Math.max(1, Math.round(base)), hits: [...TAKT[1]], nerves: Math.round(4 + (9 - seq) * 1.2), pfad: true };
}

/** Hauptfertigkeit und zweite Fertigkeit des Pfades auf dieser Sequenz als Gegner-Einträge. */
export function pfadAngriffe(content, pid, seq, enc) {
  const sd = content.pathways?.[pid]?.seqs?.[seq];
  if (!sd) return [];
  const opt = { base: grundSchaden(enc), hp: enc?.hp ?? 100, seq };
  return [sd.skill, sd.skill2].filter(Boolean).map((sk) => gegnerFaehigkeit(sk, opt));
}

/** Schaden je Gegnerzug im Schnitt einer Rotation (Kniffe zählen als Zug ohne Schaden). */
/**
 * Pfad-Einträge in eine Angriffsliste mischen. Eine Schadens-Fertigkeit ERSETZT einen eigenen Angriff des Gegners
 * (die erste den ersten, die zweite den letzten) und übernimmt dessen Schaden und Takt, bringt aber Namen und
 * Wirkung des Pfades mit (nicht parierbar, Blutung, Nerven, trifft alle).
 * Ein Kniff (Heilen, Panzer, Schleier, Nerven, Raub) kommt als eigener Zug dazu, höchstens einer je Beyonder.
 * So ändern die Fertigkeiten, WIE ein Beyonder kämpft, kaum, wie hart der Ort ist.
 */
export function einmischen(list, extra) {
  const out = (list ?? []).filter((a) => !a.pfad);
  const slots = out.map((a, i) => (a.action ? -1 : i)).filter((i) => i >= 0);
  let kniff = null;
  extra.forEach((x, n) => {
    if (x.action) { kniff ??= x; return; }
    const i = n === 0 ? slots.shift() : slots.pop();
    if (i === undefined) { out.push(x); return; }
    out[i] = { ...x, damage: out[i].damage, hits: [...out[i].hits] }; // Takt und Wucht des ersetzten Angriffs
  });
  if (kniff) out.splice(Math.min(1, out.length), 0, kniff);
  return out;
}

/** Ein Satz für den Kampfbeginn: welcher Pfad, welche Sequenz. */
export function beyonderSatz(content, pid, seq) {
  const p = content.pathways?.[pid];
  return `Ein Beyonder ohne Zirkel: ${p?.seqs?.[seq]?.name ?? '?'}, Sequenz ${seq}, ${p?.name ?? pid}.`;
}

/** Macht aus einem Gegner einen Beyonder ohne Zirkel mit den Fertigkeiten seines Pfades. */
export function machBeyonder(content, id, pid, seq, { formel: mitFormel = true, rest_chance = undefined } = {}) {
  const enc = content.encounters?.[id];
  if (!enc || !content.pathways?.[pid]?.seqs?.[seq]) return false;
  const extra = pfadAngriffe(content, pid, seq, enc);
  const satz = beyonderSatz(content, pid, seq);
  content.encounters[id] = {
    ...enc,
    beyonder: true, tier_seq: seq, beyonder_pfad: pid, beyonder_seq: seq,
    attacks: einmischen(enc.attacks, extra),
    ...(enc.phase2?.attacks ? { phase2: { ...enc.phase2, attacks: einmischen(enc.phase2.attacks, extra) } } : {}),
    intro: enc.intro?.includes(satz) ? enc.intro : `${enc.intro ?? ''}${enc.intro ? '\n\n' : ''}${satz}`,
    ...(rest_chance !== undefined ? { rest_chance } : {}),
  };
  const formel = `formel_${pid}_${seq}`;
  if (mitFormel && content.items?.[formel]) {
    const loot = content.loot[id] ?? {};
    const drops = (loot.drops ?? []).filter((d) => d.item !== formel);
    drops.push({ item: formel, chance: seq <= 4 ? FORMEL_CHANCE_SEQ4 : FORMEL_CHANCE });
    content.loot[id] = { ...loot, drops };
  }
  return true;
}

/** In buildContent (nach allen Kopfgeld-Bausteinen): Kopfgeld-Ziele werden Beyonder ihres Pfades. */
export function applyGegnerBeyonder(content) {
  for (const [id, [pid, seq]] of Object.entries(KOPFGELD_BEYONDER)) machBeyonder(content, id, pid, seq);
}

/**
 * Wilde Beyonder (Seb 2026-11-26: „von den Beyonder-Fähigkeiten der Gegner nix mitbekommen“): Bis dahin trugen nur
 * Kopfgeld-Ziele, Kopfgeldjäger, der Rivale und die Ritualwächter Pfad-Fertigkeiten, also fast nur Kämpfe, die man
 * gezielt sucht. Ab Dunscar ist jetzt jede ELITE-Spielart der Gebietsgegner (die 12 % stärkeren Laufgegner) ein
 * Beyonder ohne Zirkel: fester Pfad je Gegnerart, Sequenz nach Kapitel. Keine Formel als Beute (Seb: Formeln nur
 * über Zirkel/Kopfgeld), der Beyonder-Rest nur selten.
 */
export const WILDE_SEQ = { 3: 5, 4: 4, 5: 3, 6: 3 };
export const WILDE_REST_CHANCE = { 5: 0.02, 4: 0.01, 3: 0.01 };
const PFAD_REIHE = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr'];

/** Fester Pfad je Gegnerart (gleicher Name → gleicher Pfad, unabhängig von der Ladereihenfolge). */
export function wilderPfad(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PFAD_REIHE[h % PFAD_REIHE.length];
}

export function applyWildeBeyonder(content) {
  const out = [];
  for (const [id, enc] of Object.entries(content.encounters)) {
    if (!id.endsWith('_elite') || enc.beyonder || enc.boss || enc.practice) continue;
    const base = id.slice(0, -'_elite'.length);
    const ch = enc.chapter ?? content.encounters[base]?.chapter;
    const seq = WILDE_SEQ[ch];
    if (!seq) continue;
    const pid = wilderPfad(base);
    if (machBeyonder(content, id, pid, seq, { formel: false, rest_chance: WILDE_REST_CHANCE[seq] })) out.push(id);
  }
  return out;
}
