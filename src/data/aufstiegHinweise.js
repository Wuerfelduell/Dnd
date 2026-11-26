/**
 * Aufstiegs-Hinweise und Wegbeschreibungen (Seb 2026-11-26: „Ziele unklar … mehr Hinweise auf die Seq-4/3-Items usw.
 * oder kleine Wegbeschreibung zu den wichtigen Personen“).
 * - aufstiegHinweise(state): was der handelnde Spieler für die nächsten zwei Sequenzen noch braucht (Formel, Kern- und
 *   Grundzutaten, Ritual), je Stück ✓/fehlt und WO es das gibt.
 * - wegbeschreibung(content, map, id): „Ort, oben links · Eingang: Terrasse, unten rechts“ für Personen und Orte in Calderwick.
 * - wichtigeOrte(state): Krämer, Prüfstein, Braukessel, Pendelzug, Telegramm, Zug nach oben … mit Wegbeschreibung.
 */
import { kernzutat, ritualformel } from './seqHoch.js';
import { CW_GEBIETE } from './aufstieg.js';

const LAGE_Y = ['oben', 'in der Mitte', 'unten'];
const LAGE_X = ['links', 'mittig', 'rechts'];

/** Grobe Lage eines Feldes auf seiner Karte: „oben links“, „in der Mitte“, „unten rechts“. */
export function lage(map, [x, y]) {
  const W = map.rows[0].length;
  const H = map.rows.length;
  const ix = x < W / 3 ? 0 : x >= (2 * W) / 3 ? 2 : 1;
  const iy = y < H / 3 ? 0 : y >= (2 * H) / 3 ? 2 : 1;
  if (ix === 1 && iy === 1) return 'in der Mitte';
  if (ix === 1) return `${LAGE_Y[iy]} in der Mitte`;
  if (iy === 1) return `am ${ix === 0 ? 'linken' : 'rechten'} Rand`;
  return `${LAGE_Y[iy]} ${LAGE_X[ix]}`;
}

const calderwick = (map) => !!map && (map.city === 'calderwick' || map.id.startsWith('cw_') || map.id.startsWith('o3_'));

/** Wie man in eine Karte hineinkommt: die Tür auf einer anderen Karte, die hierher führt. */
function eingang(content, mapId) {
  for (const m of Object.values(content.maps)) {
    if (m.id === mapId || !calderwick(m) || !m.id.startsWith('cw_')) continue;
    const t = (m.interactables ?? []).find((i) => i.kind === 'door' && i.to === mapId);
    if (t) return `Eingang: ${m.name}, ${lage(m, t.tile)}`;
  }
  return mapId.startsWith('o3_') ? 'über die Stadtkarte (Pfadviertel)' : '';
}

/** Wegbeschreibung zu einem Objekt oder einer Figur (nur Calderwick; sonst null). */
export function wegbeschreibung(content, mapId, id) {
  const m = content.maps[mapId];
  if (!calderwick(m)) return null;
  const def = [...(m.npcs ?? []), ...(m.interactables ?? [])].find((x) => x.id === id);
  const teile = [def?.tile ? `${m.name}, ${lage(m, def.tile)}` : m.name];
  const e = eingang(content, mapId);
  if (e && !['cw_gleisfuss', 'cw_setzergasse', 'cw_quittungsmarkt', 'cw_roehrenhof', 'cw_witwenterrasse', 'cw_kronenarchiv'].includes(mapId)) teile.push(e);
  return teile.join(' · ');
}

/** Anzeigename eines Ziels: Figur mit Namen, sonst Titel bzw. Aufforderung des Objekts. */
export function zielName(content, mapId, id, fallback) {
  const def = [...(content.maps[mapId]?.npcs ?? []), ...(content.maps[mapId]?.interactables ?? [])].find((x) => x.id === id);
  return content.npcs[id]?.name ?? def?.title ?? def?.label ?? def?.prompt ?? fallback;
}

/** Woher ein Stück kommt (für den Pfad pid). Ein kurzer Satz. */
export function woher(content, pid, itemId) {
  const v = CW_GEBIETE[pid]?.viertel ?? 'deinem Pfadviertel';
  const im = `im ${v.replace(/^Das /, '')}`;
  for (const n of [4, 3, 2, 1]) {
    if (itemId === kernzutat(pid, n)) {
      return {
        4: 'Monster ab Dunscar (selten), Dunscarer Einzelgänger handeln sie',
        3: `Oberhaupt der Gilde ${im} (fünf Rangprüfungen, dann Oberhaupt besiegen); selten bei den Monstern ${im}; Ersatz: Alte Setzerei (Setzergasse)`,
        2: `4. Herd der Verderbnis ${im} (Spuren folgen); selten bei den Monstern ${im}; Ersatz: Sortiergrube (Röhrenhof)`,
        1: 'Nullfundament unter dem Kronenarchiv (Gefahrengebiet, ganz hinten)',
      }[n];
    }
    if (itemId === `formel_${pid}_${n}`) {
      return {
        4: 'Monster ab Dunscar (selten) und geheime Zirkel, nie von Pfad-Beyondern',
        3: `Gildenkrämer ${im} (30.000 Schilling); jedes geheime Zirkeltreffen bietet eine zufällige Seq-3-Formel an`,
        2: `Archiv des Oberhaupts ${im} (nach dem Oberhaupt); selten bei den Monstern ${im}`,
        1: `Herz der Verderbnis ${im} (nach den sechs Herden, sicher beim ersten Sieg)`,
      }[n];
    }
  }
  if (itemId === ritualformel(pid)) return `Gildenkrämer ${im} (30.000 Schilling); geheime Zirkeltreffen`;
  if (itemId === 'nebeltau' || itemId === 'silberstaub') return `Gildenkrämer ${im}; Monster in den Pfadvierteln`;
  if (itemId === 'geisteressenz') return 'Beute: alle Gegner ab Dunscar, Herde der Verderbnis immer';
  // Sonst: Händler, die es führen, und Gegner, die es fallen lassen
  const laeden = Object.values(content.market?.merchants ?? {}).filter((mm) => (mm.stock ?? []).some((s) => s.item === itemId)).map((mm) => mm.name);
  const beute = Object.entries(content.loot ?? {}).filter(([, l]) => (l.drops ?? []).some((d) => d.item === itemId)).map(([enc]) => content.encounters[enc]?.name).filter(Boolean);
  const teile = [];
  if (laeden.length) teile.push(`Händler: ${[...new Set(laeden)].slice(0, 2).join(', ')}`);
  if (beute.length) teile.push(`Beute: ${[...new Set(beute)].slice(0, 2).join(', ')}`);
  return teile.join('; ') || 'Händler und Beute';
}

/**
 * Für den handelnden Spieler: [{ seq, titel, zeilen: [{ text, ok, wo? }] }] für die nächsten zwei Sequenzen.
 */
export function aufstiegHinweise(state) {
  const p = state.pathway;
  const c = state.content;
  if (!p?.id || !(p.seq > 1)) return [];
  const out = [];
  for (let seq = p.seq - 1; seq >= Math.max(1, p.seq - 2); seq--) {
    const sd = state.seqDef(p.id, seq);
    if (!sd) continue;
    const zeilen = [];
    const item = (id, n, prefix = '') => {
      if (!c.items[id]) return;
      const have = state.itemCount(id);
      zeilen.push({ text: `${prefix}${c.items[id].name}${n > 1 ? ` ×${n}` : ''} (${Math.min(have, n)}/${n})`, ok: have >= n, wo: have >= n ? '' : woher(c, p.id, id) });
    };
    const gebraut = state.itemCount(`trank_${p.id}_${seq}`) > 0;
    if (gebraut) zeilen.push({ text: 'Trank gebraut: trinken, sobald du verdaut hast', ok: true });
    else {
      item(`formel_${p.id}_${seq}`, 1);
      for (const [id, n] of Object.entries(sd.ingredients ?? {})) item(id, n);
      zeilen.push({ text: 'Brauen am Braukessel', ok: false, wo: 'Gemeinschaftsküche (Witwenterrasse), Speisewagen in Dunscar' });
    }
    const r = sd.ritual;
    if (r) {
      if (state.ritualDone(p.id, seq)) zeilen.push({ text: `Ritual „${r.name}“ vollzogen`, ok: true });
      else {
        if (seq === 3) item(ritualformel(p.id), 1);
        for (const [id, n] of Object.entries(r.consumes ?? {})) item(id, n, 'Ritual: ');
        zeilen.push({ text: `Ritual „${r.name}“ vollziehen`, ok: false, wo: 'überall, im Notizbuch unter Pfad (vor dem Trinken)' });
      }
    }
    out.push({ seq, titel: `Sequenz ${seq}: ${sd.name ?? ''}`.trim(), zeilen });
  }
  return out;
}

/** Wichtige Orte in Calderwick mit Wegbeschreibung (nur was es gibt und was der Spieler sehen darf). */
export function wichtigeOrte(state) {
  const c = state.content;
  const pid = state.pathway?.id;
  const liste = [
    ['Gildenkrämer (Formeln 3, Grundzutaten)', `o3_${pid}`, `o3_${pid}_kraemer`],
    ['Prüfstein (Verdauung)', `o3_${pid}`, `o3_${pid}_pruefstein`],
    ['Braukessel', 'cw_kueche', 'cw_braukessel'],
    ['Lottie Wicksend (Pfandhaus)', 'cw_pfandhaus', 'cw_wicksend'],
    ['Minas Marktstand', 'cw_quittungsmarkt', 'cwo_marktstand'],
    ['Telegramm an Marlowe (Rat)', 'cw_gleisfuss', 'marlowe_telegramm'],
    ['Pendelzug nach Dunscar', 'cw_gleisfuss', 'auf_pendel_ds'],
    ['Der nächste Zug nach oben', 'cw_kronenarchiv', 'auf_cw_zug2'],
    ['Linie nach Briarholt', 'cw_kronenarchiv', 'k4s_linie'],
  ];
  const out = [];
  for (const [name, map, id] of liste) {
    const m = c.maps[map];
    const def = m && [...(m.npcs ?? []), ...(m.interactables ?? [])].find((x) => x.id === id);
    if (!def || (def.visible_if && !state.meets(def.visible_if))) continue;
    out.push({ name, wo: wegbeschreibung(c, map, id) });
  }
  return out;
}
