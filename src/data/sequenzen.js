/**
 * Paket AF (data/packs/sequenzen): drei neue Pfade (Waage, Moor, Uhr) mit Sequenz 9 bis 5, ihre Zutaten,
 * sechs Artefakte und die Stufen 4 bis 1 aller zehn Pfade.
 *
 * Spielbar sind bis auf Weiteres nur die Stufen bis SEQ_HIGHEST (wie im Bestand bis 5). Die Stufen 4 bis 1
 * liegen geladen unter content.highSeqs (Kernzutaten unter content.highItems), bis Kapitel 3 die Bosse für ihre Kernzutaten bringt.
 * Die sechs Artefakte sind Belohnungen dieser Seq-4-Aufgaben und stehen schon in artifacts.list.
 */
import { HOCH_DURCHBRUCH, HALBGOTT_EIGENHEIT, HOCH_RITUAL, ordealId } from '../core/Pathways.js';

export const SEQ_HIGHEST = 1; // Kapitel 3: alle Stufen bis 1 sind spielbar

/**
 * Die hohen Stufen (Seb, 2026-11-11): Sequenz 4 = Halbgott, 2 = Engel. Jede Stufe 4 bis 1 bekommt die Passiven ihres
 * Durchbruchs (HOCH_DURCHBRUCH) zu dem, was der Pfad dort ohnehin mitbringt; Sequenz 4 dazu die Eigenheit des Pfades.
 * Die Rituale 4 bis 1 werden um Tribut, Siege, Schlussfolgerungen, Nerven und (4 und 2) den Schwellenwächter ergänzt.
 */
function withDurchbruch(pid, n, sd) {
  const d = HOCH_DURCHBRUCH[n];
  if (!d) return sd;
  const extra = [...d.passives, ...(Number(n) === 4 && HALBGOTT_EIGENHEIT[pid] ? [HALBGOTT_EIGENHEIT[pid]] : [])];
  const have = new Set((sd.passives ?? []).map((x) => x.text));
  return { ...sd, durchbruch: d.titel, passives: [...(sd.passives ?? []), ...extra.filter((x) => !have.has(x.text))] };
}
function withRitualHaerte(n, ritual) {
  const h = HOCH_RITUAL[n];
  if (!h || !ritual) return ritual;
  const { min_wins, ...rest } = h;
  return { ...ritual, ...rest, requires: { ...(ritual.requires ?? {}), ...(min_wins ? { min_wins } : {}) } };
}
const hochSeqs = (pid, seqs) => Object.fromEntries(Object.entries(seqs).map(([n, sd]) => [n, withDurchbruch(pid, n, { ...sd, ritual: withRitualHaerte(n, sd.ritual) })]));

/** Schwellenwächter: der Gegner des schweren Rituals (Sequenz 4 und 2) je Pfad, aus dem Grundsatz des Pfades geformt. */
export const SCHWELLE = {
  4: { sheet: 'enemy_schwellenhund', hp: 400, armor: 3, dmg: [16, 20, 14], titel: 'Schwellenwächter', chapter: 3 },
  2: { sheet: 'enemy_unterschicht', hp: 900, armor: 4, dmg: [26, 32, 23], titel: 'Schwellenrichter', chapter: 4 },
};
export function schwelleEncounter(pid, p, seq) {
  const w = SCHWELLE[seq];
  const was = p.name.replace(/^Pfad (der|des) /, '');
  const [a, b, c] = w.dmg;
  return {
    name: `${w.titel} ${p.name.replace('Pfad der', 'der').replace('Pfad des', 'des')}`,
    sprite: 'wild', sheet: w.sheet, boss: true, occult: true, fleeable: true, hp: w.hp, armor: w.armor, max_round_dmg: 0.2, ramp: 0.02, chapter: w.chapter,
    intro: `Aus dem Nebel tritt etwas, das aussieht wie dein Grundsatz, wenn er Zähne hätte. „${p.principle}“, sagt es mit deiner Stimme. „Zeig mir, dass du es meinst.“`,
    attacks: [
      { name: `Prüfung ${was}: zwei Schläge`, damage: a, hits: [1100, 1800] },
      { name: `Urteil ${was}: ein schwerer Schlag, ausweichen`, damage: b, hits: [2400], unparryable: true },
      { name: `Zweifel ${was}: drei schnelle Schläge`, damage: c, hits: [900, 1500, 2100] },
    ],
    on_win: {},
    win_text: `${w.titel} ${was}: Die Gestalt zerfällt zu Nebel und sinkt in den Kreis zurück. Du hast deinen eigenen Grundsatz niedergerungen. Jetzt kannst du das Ritual vollenden.`,
    lose_text: 'Die Gestalt löst sich auf, als du fällst. Nichts ist verloren, nur der Versuch. Der Kreis bleibt, der Tribut bleibt. Komm wieder, wenn du stärker bist.',
    loot: { money: [0, 0], drops: [] },
  };
}

/** Neue Pfade leihen sich bis zur eigenen Grafik Emblem, Karte, Pose, Trankbild und Effekte bei einem Bestandspfad. */
export const PATHWAY_STANDIN = { sq_waage: 'eisen', sq_moor: 'kessel', sq_uhr: 'schluessel' };

/** Formelpreise und Rangschwellen wie bei den Bestandspfaden (Kittering, ab 7 nur selten; dazu Wexmoorer Treffen für 6 und 5). */
const KITTERING = {
  9: { price: 30 }, 8: { price: 70 }, 7: { price: 160, honor: 35, rare: 0.15, rank: 'Ermittler' },
  6: { price: 260, honor: 50, rare: 0.08, rank: 'Vertrauter des Reviers' }, 5: { price: 420, honor: 70, rare: 0.05, rank: 'Geachteter Ermittler' },
};
const TREFFEN = { 6: 640, 5: 900 };
/** Kapitel 3: Formeln für Sequenz 4 bis 1 aller Pfade bei Kittering (Preise und Ehre nach AF, einmaliger Kauf). */
const KITTERING_HOCH = { 4: { price: 180, honor: 90 }, 3: { price: 260, honor: 110 }, 2: { price: 380, honor: 135 }, 1: { price: 560, honor: 160 } };
/** Knapper Markt: Zutaten ab Sequenz 7 nur auf geheimen Treffen (7 und 6 in Kettlegate, der Kern für 5 in Wexmoor). */
const ZUTAT_TREFFEN = { 7: { price: 120, chance: 0.45 }, 6: { price: 200, chance: 0.3 }, 5: { price: 320, chance: 0.3 } };
/** Wer auf den Treffen Zutaten und Formeln der neuen Pfade anbietet: Kettlegate [Zirkel, Mitglied], Wexmoor [Zirkel, Mitglied]. */
const TREFFEN_MEMBER = {
  sq_waage: { kg: ['waage', 'tm_ferro'], wx: ['salz', 'tm_tam'] },
  sq_moor: { kg: ['kreide', 'tm_corve'], wx: ['lichtlose', 'tm_mareike'] },
  sq_uhr: { kg: ['russ', 'tm_cobb'], wx: ['salz', 'tm_tam'] },
};

/** Kernzutaten für Sequenz 4 bis 1 kommen erst mit ihren Bossen ins Spiel. */
const lockedIngredient = (id) => Number(/_(\d)$/.exec(id)?.[1]) < SEQ_HIGHEST;
const zutat = (pid, n) => `sq_zutat_${pid.replace(/^sq_/, '')}_${n}`;

/** Vor buildContent: neue Pfade, Zutaten und Artefakte in die Pfaddaten einfügen. */
export function withSequenzen(pathways, sq) {
  if (!pathways || !sq) return { pathways, highSeqs: {}, highItems: {} };
  const live = (seqs) => Object.fromEntries(Object.entries(seqs).filter(([n]) => Number(n) >= SEQ_HIGHEST));
  const high = (seqs) => Object.fromEntries(Object.entries(seqs).filter(([n]) => Number(n) < SEQ_HIGHEST));
  const highSeqs = {};
  const added = {};
  for (const [pid, p] of Object.entries(sq.seq_4_bis_1 ?? {})) {
    highSeqs[pid] = high(p.seqs);
    const old = pathways.pathways[pid];
    if (old) added[pid] = { ...old, seqs: { ...old.seqs, ...hochSeqs(pid, live(p.seqs)) } };
  }
  for (const [pid, p] of Object.entries(sq.neue_pfade ?? {})) {
    highSeqs[pid] = high(p.seqs);
    const standin = pathways.pathways[PATHWAY_STANDIN[pid]];
    const seqs = Object.fromEntries(Object.entries(live(p.seqs)).map(([n, sd]) => [n, {
      ...sd, skill: { fx: standin?.seqs[n]?.skill.id, ...sd.skill },
    }]));
    added[pid] = { ...p, seqs: hochSeqs(pid, seqs) };
  }
  // Kapitel 3 (AU): die offenen Proben ersetzen die Rituale der Stufen 4 bis 1
  for (const [pid, perSeq] of Object.entries(sq.rituale ?? {})) {
    const p = added[pid];
    if (!p) continue;
    added[pid] = { ...p, seqs: Object.fromEntries(Object.entries(p.seqs).map(([n, sd]) => [n, perSeq[n] ? { ...sd, ritual: withRitualHaerte(n, perSeq[n]) } : sd])) };
  }
  const highItems = Object.fromEntries(Object.entries(sq.zutaten ?? {}).filter(([id]) => lockedIngredient(id)));
  return {
    highSeqs,
    highItems,
    pathways: {
      ...pathways,
      pathways: { ...pathways.pathways, ...added },
      items: { ...(pathways.items ?? {}), ...Object.fromEntries(Object.entries(sq.zutaten ?? {}).filter(([id]) => !lockedIngredient(id))) },
      artifacts: pathways.artifacts && { ...pathways.artifacts, list: { ...pathways.artifacts.list, ...(sq.artefakte ?? {}) } },
    },
  };
}

/** Nach buildContent: Zutaten bei Nell und auf den Treffen, Formeln bei Kittering, auf den Treffen und als seltener Fund. */
export function applySequenzen(content, sq, { highSeqs = {}, highItems = {} } = {}) {
  content.highSeqs = highSeqs; // Stufen 4 bis 1, noch nicht erreichbar
  content.highItems = highItems; // ihre Kernzutaten, ebenso
  // Schwellenwächter der schweren Rituale (Sequenz 4 und 2) für jeden Pfad, der diese Stufen hat
  const encounters = { ...content.encounters };
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const seq of Object.keys(SCHWELLE).map(Number)) {
      if (p.seqs[seq]?.ritual?.ordeal && !encounters[ordealId(pid, seq)]) encounters[ordealId(pid, seq)] = schwelleEncounter(pid, p, seq);
    }
  }
  content.encounters = encounters;
  if (!sq?.neue_pfade) return content;
  const pids = Object.keys(sq.neue_pfade);
  const m = content.market;
  if (m) {
    const merchants = { ...m.merchants };
    const nell = { ...merchants.nell, stock: [...merchants.nell.stock] };
    const kit = { ...merchants.kittering, stock: [...merchants.kittering.stock] };
    for (const pid of pids) {
      const p = content.pathways[pid];
      // Grundzutat für jeden, die für Sequenz 8 erst ab der Vorstufe
      for (const n of [9, 8]) {
        const id = zutat(pid, n);
        if (!content.items[id]) continue;
        nell.stock.push({ item: id, price: content.items[id].price,
          ...(n < 9 ? { requires_pathway: [pid, n + 1], locked_text: `Erst für ${p.name.replace('Pfad', 'Anhänger des Pfads')} ab Sequenz ${n + 1}` } : {}) });
      }
      for (const [n, k] of Object.entries(KITTERING)) {
        const seq = Number(n);
        kit.stock.push({ item: `formel_${pid}_${seq}`, price: k.price, once: true,
          ...(seq < 9 ? { requires_pathway: [pid, seq + 1], locked_text: `Erst ab Sequenz ${seq + 1} dieses Pfades${k.rank ? ` und Rang ${k.rank}` : ''}` } : {}),
          ...(k.honor ? { requires_honor: k.honor } : {}), ...(k.rare ? { rare: k.rare } : {}) });
      }
    }
    for (const pid of Object.keys(content.pathways)) {
      for (const [n, k] of Object.entries(KITTERING_HOCH)) {
        const seq = Number(n);
        if (!content.items[`formel_${pid}_${seq}`]) continue;
        kit.stock.push({ item: `formel_${pid}_${seq}`, price: k.price, once: true, requires_honor: k.honor,
          requires_pathway: [pid, seq + 1], locked_text: `Erst ab Sequenz ${seq + 1} dieses Pfades und ${k.honor} Ehre` });
      }
    }
    content.market = { ...m, merchants: { ...merchants, nell, kittering: kit } };
  }
  // Geheime Treffen: Zutaten 7 und 6 in Kettlegate; Kernzutat 5 und Formeln 6 und 5 in Wexmoor
  const circles = content.gatherings?.circles;
  if (circles) {
    const copy = { ...circles };
    const offer = ([cid, mid], offers) => {
      if (!copy[cid]) return;
      copy[cid] = { ...copy[cid], members: copy[cid].members.map((mem) => (mem.id !== mid ? mem : { ...mem, offers: [...mem.offers, ...offers] })) };
    };
    for (const pid of pids) {
      const at = TREFFEN_MEMBER[pid];
      const ing = (n) => ({ item: zutat(pid, n), ...ZUTAT_TREFFEN[n] });
      offer(at.kg, [ing(7), ing(6)]);
      offer(at.wx, [ing(5), ...[6, 5].map((seq) => ({ item: `formel_${pid}_${seq}`, price: TREFFEN[seq], once: true, chance: 0.4,
        requires_pathway: [pid, seq + 1], locked_text: `Erst ab Sequenz ${seq + 1} dieses Pfades` }))]);
    }
    content.gatherings = { ...content.gatherings, circles: copy };
  }
  // Seltene Funde: wo die Laternen-Formel 6 oder 5 fallen kann, fallen auch die der neuen Pfade
  const extend = (tables) => Object.fromEntries(Object.entries(tables ?? {}).map(([id, t]) => {
    if (!t?.drops?.some((d) => /^formel_laterne_[65]$/.test(d.item))) return [id, t];
    const more = t.drops.filter((d) => /^formel_laterne_[65]$/.test(d.item))
      .flatMap((d) => pids.map((pid) => ({ ...d, item: d.item.replace('laterne', pid) })));
    return [id, { ...t, drops: [...t.drops, ...more] }];
  }));
  content.loot = extend(content.loot);
  if (content.lootTables) content.lootTables = extend(content.lootTables);
  return content;
}
