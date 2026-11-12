/**
 * Codex-Paket DR (PR #326): Texte der zehn Seq-4-Rituale und die Wexmoor-Einnahmen.
 * Kopien der JSON-Dateien liegen in data/packs/seq4_dr (Original: docs/story/seq4_rituale).
 *
 * - Ritualtexte (Name, Beschreibung, Regelkarte, Vorbereitung, Beginn, Erfolg), Kurzmeldungen, Wächterzeilen,
 *   Kessel-Rezepte, Namen und Eigenschaften des Moor-Relikts, Gerede, Zeitungen und Lesestücke → content.seq4Texte.
 *   Der Prozentsatz `{pct}` ist überall 17 (Seb, 2026-11-12; das README nennt noch 20/25).
 * - Wexmoor-Einnahmen: acht Kopfgelder (Brett im Wachhaus, Gesuchte als Gegner auf ihren Karten), sechs tägliche
 *   Arbeiten (Aushang am Ort, einmal je Spieltag, kosten Nerven) und zehn seltene Funde (Fundstelle je Ort, einmal je
 *   Spieltag), die Maud Keel ankauft. Geldwerte setzt LOHN, damit ~10 000 Schilling durch Farmen erreichbar sind.
 */
/** Fehlschlag-Prozent aller Seq-4-Rituale (= HG_FAIL_PCT in core/Seq4.js; Test prüft die Gleichheit, Import wäre ein Kreis). */
export const DR_PCT = 17;

export const SEQ4_DR_FILES = ['rituale', 'meldungen', 'waechter', 'kessel_rezepte', 'moor_relikt', 'nebentexte', 'wexmoor_einnahmen'];

/** Ritual-Art (ritual.hg) → Schlüssel in den DR-Dateien. */
export const DR_KEY = {
  laterne: 's4r_laterne', faden: 's4r_faden', maske: 's4r_maske', echo: 's4r_echo', kessel: 's4r_kessel', eisen: 's4r_eisen',
  schluessel: 's4r_schluessel', waage: 's4r_sq_waage', moor: 's4r_sq_moor', uhr: 's4r_sq_uhr',
};

/** Schilling je Lohnstufe. Funde: Grundwert (Maud zahlt die Hälfte). */
export const LOHN = {
  kopfgeld: { klein: 150, mittel: 350, gross: 800 },
  arbeit: { klein: 60, mittel: 120, gross: 200 },
  fund: { klein: 120, mittel: 240, gross: 480 },
};
export const ARBEIT_NERVEN = 8;

/** Gesuchte: Grafik und Stärke je Lohnstufe (Wexmoor-Niveau, gross = Boss mit Fluchtfrist). */
const GESUCHT_SHEET = {
  wxk_gleispluenderer: 'enemy_ez_schleusendieb', wxk_torfschneider: 'enemy_k3k_kupferdieb', wxk_salzfaelscher: 'enemy_falschgeldpraeger',
  wxk_bojenbrecher: 'enemy_kanalschmuggler', wxk_pfahlraeuber: 'enemy_pfandeintreiber', wxk_wattgaenger: 'enemy_vg_all_wegelagerer',
  wxk_moorhehler: 'enemy_k3k_walzenhehler', wxk_linsendieb: 'enemy_laternendieb',
};
const GESUCHT_STATS = {
  klein: { hp: 150, armor: 1, attacks: [['Schlag', 13, [1000, 1700]], ['Stoß', 20, [2100]]] },
  mittel: { hp: 230, armor: 2, attacks: [['Hieb', 16, [900, 1500]], ['Wurf', 24, [2000]], ['Tritt', 12, [800, 1200, 1600]]] },
  gross: { hp: 290, armor: 3, boss: true, attacks: [['Klinge', 18, [900, 1600]], ['Überfall', 27, [2300], true], ['Hagel', 11, [700, 1100, 1500, 1900]]] },
};

/** Moor-Relikt: Wirkung der zwanzig DR-Eigenschaften mit Schaltern, die das Spiel kennt (Pathways.passive). */
const RELIKT_WIRKUNG = {
  s4mo_e_01: ['occult_mult', 1.1, '+10 % Schaden gegen Okkultes'], s4mo_e_02: ['composure_regen', 1.1, 'Nerven erholen sich schneller'],
  s4mo_e_03: ['dmg_mult', 1.05, '+5 % Schaden'], s4mo_e_04: ['damage_taken', 0.95, '−5 % erlittener Schaden'],
  s4mo_e_05: ['damage_taken', 0.95, '−5 % erlittener Schaden'], s4mo_e_06: ['atk', 2, '+2 Angriff'],
  s4mo_e_07: ['vision_cost', 0.85, 'Geistsicht kostet weniger'], s4mo_e_08: ['damage_taken', 0.95, '−5 % erlittener Schaden'],
  s4mo_e_09: ['occult_mult', 1.08, '+8 % Schaden gegen Okkultes'], s4mo_e_10: ['dodge_window', 1.1, 'größeres Ausweichfenster'],
  s4mo_e_11: ['round_nerves', 1, '+1 Nerven je Kampfrunde'], s4mo_e_12: ['dmg_mult', 1.06, '+6 % Schaden'],
  s4mo_e_13: ['ap_start', 1, 'eine Konzentration mehr zu Kampfbeginn'], s4mo_e_14: ['damage_taken', 0.92, '−8 % erlittener Schaden'],
  s4mo_e_15: ['atk', 1, '+1 Angriff'], s4mo_e_16: ['damage_taken', 0.95, '−5 % erlittener Schaden'],
  s4mo_e_17: ['link_hints', true, 'Hinweise verknüpfen sich leichter'], s4mo_e_18: ['dmg_mult', 1.08, '+8 % Schaden'],
  s4mo_e_19: ['damage_taken', 0.94, '−6 % erlittener Schaden'], s4mo_e_20: ['composure_regen', 1.1, 'Nerven erholen sich schneller'],
};

/** Gerede (Index in nebentexte.gerede) und Zeitung je Ritual: erscheinen erst, wenn jemand dieses Ritual bestanden hat. */
const GEREDE_ART = ['laterne', 'laterne', 'laterne', 'faden', 'faden', 'maske', 'maske', 'echo', 'echo', 'kessel', 'kessel', 'eisen', 'schluessel', 'schluessel', 'schluessel', 'waage', 'waage', 'moor', 'moor', 'uhr'];
const ZEITUNG_ART = ['laterne', 'faden', 'maske', 'waage', 'moor'];
const BLATT = { wexmoor: 'bote', dunscar: 'dunscarer_kalkblatt', calderwick: 'calderwicker_anzeiger', briarholt: 'briarholter_kurblatt' };
const GEREDE_STAEDTE = Object.keys(BLATT);

export const pct = (s) => String(s ?? '').replaceAll('{pct}', String(DR_PCT));
const fill = (s, vars = {}) => Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{${k}}`, String(v)), pct(s));

function lesePlatz(id, map, title, text) {
  return { map, spawn_offset: [2, 0], interactable: { id, kind: 'read', sprite: 'paper', prompt: `„${title}“ lesen`, title, text, footer: 'Ohne Absender abgelegt.', visible_if: {} } };
}

/** Paket für buildContent: Rohdaten plus die Lesestücke (Akademie und Wachhaus). */
export function seq4DrPack(f) {
  const maps = ['wx_akademie', 'wx_wachhaus'];
  return {
    name: 'seq4_dr',
    seq4Dr: f,
    lesestuecke: (f.nebentexte?.lesestueck ?? []).map((l, i) => lesePlatz(l.id, maps[i % maps.length], l.titel, l.text)),
  };
}

/** Texte nach Ritual-Art (für Seq4.js). */
function texte(f) {
  const by = (src) => Object.fromEntries(Object.entries(DR_KEY).map(([k, key]) => [k, src?.[key] ?? null]));
  return {
    rituale: by(f.rituale),
    meldungen: by(f.meldungen),
    waechter: by(f.waechter),
    zuschauer: by(f.nebentexte?.koop_zuschauer),
    zweifel: f.nebentexte?.maske_zweifel ?? [],
    relikt: f.moor_relikt ?? null,
    reliktWirkung: RELIKT_WIRKUNG,
  };
}

/** Kurzmeldung (`{pct}` = 17, weitere Platzhalter aus vars). */
export function drMeldung(content, kind, key, vars) {
  const t = content.seq4Texte?.meldungen?.[kind]?.[key];
  return t ? fill(t, vars) : '';
}

/** Freie Bodenkachel nahe `near` (oder dem Standard-Spawn) auf einer Karte. */
function freeTile(m, near, start = [3, 0]) {
  const base = near ?? m.spawns?.default ?? Object.values(m.spawns ?? {})[0];
  if (!base) return null;
  const taken = new Set([...(m.npcs ?? []), ...(m.interactables ?? []), ...(m.roamers ?? [])].filter((o) => o.tile).map((o) => `${o.tile[0]},${o.tile[1]}`));
  taken.add(`${base[0]},${base[1]}`);
  const free = (x, y) => !taken.has(`${x},${y}`) && /[.,gpscwPK=]/.test(m.rows?.[y]?.[x] ?? '');
  const cands = [start];
  for (let r = 1; r <= 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r) cands.push([start[0] + dx, start[1] + dy]);
  const hit = cands.find(([dx, dy]) => free(base[0] + dx, base[1] + dy));
  return hit ? [base[0] + hit[0], base[1] + hit[1]] : null;
}

function addTo(content, mapId, key, obj, start) {
  const m = content.maps[mapId];
  if (!m) return false;
  const tile = obj.tile ?? freeTile(m, null, start);
  if (!tile) return false;
  content.maps[mapId] = { ...m, [key]: [...(m[key] ?? []), { ...obj, tile }] };
  return true;
}

/** Wendet DR an (aus applySeq4). */
export function applySeq4Dr(content, f) {
  if (!f) return content;
  content.seq4Texte = texte(f);
  applyGuardians(content);
  applyGerede(content, f.nebentexte ?? {});
  applyEinnahmen(content, f.wexmoor_einnahmen ?? {});
  return content;
}

/** Wächterzeilen: Zwischenrufe je Runde, beim Echo nur Sichtbeschreibungen (stumm), beim Eisen Rundenansagen. */
function applyGuardians(content) {
  for (const [pid, p] of Object.entries(content.pathways ?? {})) {
    const kind = p.seqs?.[4]?.ritual?.hg;
    const w = kind && content.seq4Texte.waechter[kind];
    const id = `hg_schwellenwaechter_${pid}`;
    const enc = content.encounters[id];
    if (!w || !enc) continue;
    const rufe_runde = kind === 'eisen' ? { ...Object.fromEntries([1, 2, 3, 4, 5].map((n) => [n, w[`runde_${n}`]]).filter(([, t]) => t)), ...(w.verwundbar ? { 6: w.verwundbar } : {}) } : null;
    content.encounters[id] = {
      ...enc,
      rufe: w.zwischenrufe ?? [],
      ...(rufe_runde ? { rufe_runde } : {}),
      ...(kind === 'echo' ? { intro: (w.intro ?? []).join(' '), win_text: (w.sieg_spieler ?? []).join(' ') || enc.win_text } : {}),
    };
  }
}

/** Gerede in den späteren Städten und je Stadt eine Zeitungsmeldung, sobald ein Ritual bestanden ist. */
function applyGerede(content, n) {
  content.gossip ??= {};
  (n.gerede ?? []).forEach((text, i) => {
    const kind = GEREDE_ART[i];
    if (!kind) return;
    for (const city of GEREDE_STAEDTE) {
      const own = (content.gossip[city] ??= {});
      for (const map of Object.keys(own)) own[map] = [...own[map], { text, requires_flags: [`hg_gerede_${kind}`] }];
    }
  });
  const papers = [];
  (n.zeitung ?? []).forEach((z, i) => {
    const kind = ZEITUNG_ART[i];
    if (!kind) return;
    for (const [city, zeitung] of Object.entries(BLATT)) {
      papers.push({ id: `s4r_zeitung_${kind}_${city}`, zeitung, city, requires_flags: [`hg_gerede_${kind}`, `hg_in_${city}`], hide_if_flags: [`hg_zeitung_${kind}`], title: z.ueberschrift, text: z.text, kurz: [z.ueberschrift] });
    }
  });
  content.newspapers = [...(content.newspapers ?? []), ...papers];
}

/** Kopfgelder, tägliche Arbeiten und seltene Funde in Wexmoor. */
function applyEinnahmen(content, w) {
  const steckbriefe = { start: { text: 'Ein Brett neben der Wachstube, mit Reißzwecken voller Steckbriefe der Hafenwache. Unter jedem steht der Lohn, mit Bleistift nachgetragen.', choices: [] } };
  const nodes = steckbriefe;
  const lose = { lose_to: { map: 'wx_kahn', spawn: 'default' }, lose_money: 0.1, lose_text: 'Jemand zieht dich in Zunders Kahn. Der Gesuchte ist fort, der Steckbrief hängt noch.', flee_text: 'Du ziehst dich zurück. Der Steckbrief bleibt offen.' };
  for (const [qid, k] of Object.entries(w.kopfgelder ?? {})) {
    const encId = k.gesuchter?.id;
    const st = GESUCHT_STATS[k.lohn_stufe] ?? GESUCHT_STATS.klein;
    const lohn = LOHN.kopfgeld[k.lohn_stufe] ?? LOHN.kopfgeld.klein;
    const target = k.steps?.[0]?.target ?? {};
    const name = target.label ?? k.title.replace('Kopfgeld: ', '');
    const won = `won_${qid}`;
    const paid = `${qid}_bezahlt`;
    content.encounters[encId] = {
      name, sprite: 'wild', sheet: GESUCHT_SHEET[encId] ?? 'enemy_kanalschmuggler', chapter: 2, city: true, fleeable: true, occult: false,
      hp: st.hp, armor: st.armor, ...(st.boss ? { boss: true } : {}),
      intro: `${k.summary.split('.')[0]}. ${k.gesuchter?.steckbrief ?? ''}`.trim(),
      attacks: st.attacks.map(([n, damage, hits, unparryable]) => ({ name: n, damage, hits, ...(unparryable ? { unparryable: true } : {}) })),
      win_text: `${name} gibt auf. Die Hafenwache holt ihn ab; im Wachhaus wartet der Lohn.`,
      on_win: { sets_flags: [won] },
      roam: { speed: 20, chase: 40, aggro: 40 },
      ...lose,
    };
    content.loot[encId] = { repeat: false, money: [10, 30] };
    content.quests[qid] = {
      title: k.title, kind: 'side', case: k.case ?? 'kapitel2', summary: `${k.summary} Lohn: ${lohn} Schilling.`, reward: { gives_money: 0 },
      steps: [
        { ...k.steps[0], done: { requires_flags: [won] } },
        { text: 'Im Wachhaus abrechnen.', done: { requires_flags: [paid] }, target: { map: 'wx_wachhaus', id: 'wx_steckbriefe', label: 'Steckbriefe' } },
      ],
    };
    addTo(content, target.map, 'roamers', { encounter: encId, boss: true, visible_if: { requires_quests_active: [qid], hide_if_flags: [won] } }, [5, 0]);
    nodes.start.choices.push(
      { text: `Steckbrief: ${name} (${lohn} Schilling)`, next: qid, hide_if_flags: [paid], hide_if_quests: [qid] },
      { text: `Kopfgeld kassieren: ${name}`, next: `${qid}_zahlen`, requires_flags: [won], requires_quests_active: [qid] },
    );
    nodes[qid] = { text: `GESUCHT: ${name}. ${k.gesuchter?.steckbrief ?? k.summary} Lohn: ${lohn} Schilling. Zu finden: ${content.maps[target.map]?.name ?? target.map}.`, choices: [{ text: 'Steckbrief abnehmen.', next: `${qid}_nehmen` }, { text: 'Zurück.', next: 'start' }] };
    nodes[`${qid}_nehmen`] = { text: `Du nimmst den Steckbrief ab. ${k.summary}`, start_quests: [qid], choices: [{ text: 'Zurück zum Brett.', next: 'start' }] };
    nodes[`${qid}_zahlen`] = { text: `${k.abgabetext ?? 'Die Wache zahlt.'} (${lohn} Schilling)`, sets_flags: [paid], complete_quests: [qid], gives_money: lohn, honor: 1, honor_reason: k.title, choices: [{ text: 'Zurück zum Brett.', next: 'start' }] };
  }
  nodes.start.choices.push({ text: 'Weggehen.' });
  content.dialogues.wx_steckbriefe = { start: 'start', nodes };
  addTo(content, 'wx_wachhaus', 'interactables', { id: 'wx_steckbriefe', kind: 'dialogue', dialogue: 'wx_steckbriefe', title: 'Steckbriefe der Hafenwache', role: 'Kopfgelder', sprite: 'paper', marker: true, prompt: 'Steckbriefe ansehen', visible_if: { requires_flags: ['k2_arrived'] } }, [2, -2]);

  // Tägliche Arbeiten: Aushang am Ort, einmal je Spieltag, kosten Nerven
  for (const [jid, j] of Object.entries(w.gelegenheitsarbeiten ?? {})) {
    const lohn = LOHN.arbeit[j.lohn_stufe] ?? LOHN.arbeit.klein;
    const zf = j.zwischenfaelle?.length ? j.zwischenfaelle : [''];
    const d = { start: { text: `${j.title}. ${j.auftraggeber} Lohn: ${lohn} Schilling, einmal am Tag.`, choices: [
      { text: `Arbeit annehmen (${ARBEIT_NERVEN} Nerven)`, requires_daily: jid, requires_nerves: ARBEIT_NERVEN, next: zf.map((_, i) => ({ node: `z${i}`, ...(i < zf.length - 1 ? { chance: 1 / (zf.length - i) } : {}) })) },
      { text: 'Für heute ist die Arbeit getan.', hide_if_daily: jid, next: 'fertig' },
      { text: 'Weggehen.' },
    ] }, fertig: { text: 'Der Vorarbeiter winkt ab. Morgen wieder.' } };
    zf.forEach((z, i) => { d[`z${i}`] = { text: `${j.ablauf} ${z} ${j.abschluss} (+${lohn} Schilling)`, daily: jid, nerves: -ARBEIT_NERVEN, gives_money: lohn, honor_reason: j.title }; });
    const { start, ...rest } = d;
    content.dialogues[jid] = { start: 'start', nodes: { start, ...rest } };
    addTo(content, j.ort, 'interactables', { id: `${jid}_aushang`, kind: 'dialogue', dialogue: jid, title: `Aushang: ${j.title}`, role: 'Arbeit', sprite: 'paper', marker: true, prompt: 'Aushang lesen', visible_if: { requires_flags: ['k2_arrived'] } }, [2, 1]);
  }

  // Seltene Funde: eine Fundstelle je Ort, einmal je Spieltag; Maud kauft sie
  const sell = { ...(content.market?.sell_prices ?? {}) };
  const byMap = {};
  for (const [fid, x] of Object.entries(w.seltene_funde ?? {})) {
    const wert = LOHN.fund[x.lohn_stufe] ?? LOHN.fund.klein;
    content.items[fid] = { name: x.name, kind: 'trophy', weight: 0.3, rarity: 'selten', price: wert, desc: `${x.desc} Maud Keel am Salzmarkt zahlt etwa ${Math.round(wert / 2)} Schilling.` };
    sell[fid] = wert;
    (byMap[x.fundort] ??= []).push(fid);
  }
  if (content.market) content.market = { ...content.market, sell_prices: sell };
  for (const [map, finds] of Object.entries(byMap)) {
    const id = `wxf_stelle_${map}`;
    const nodes2 = { start: { text: 'Aufgewühlter Grund, eine Stelle, an der die Gezeiten oder die Leute etwas liegen lassen.', choices: [
      { text: 'Absuchen.', requires_daily: id, next: finds.map((fid, i) => ({ node: fid, ...(i < finds.length - 1 ? { chance: 1 / (finds.length - i) } : {}) })) },
      { text: 'Heute ist hier nichts mehr.', hide_if_daily: id, next: 'leer' },
      { text: 'Weggehen.' },
    ] }, leer: { text: 'Nur Schlick und Scherben. Morgen vielleicht wieder.' } };
    for (const fid of finds) nodes2[fid] = { text: `Zwischen Schlick und Kies: ${content.items[fid].name}. Maud Keel wird es ansehen wollen.`, daily: id, gives_items: { [fid]: 1 } };
    content.dialogues[id] = { start: 'start', nodes: nodes2 };
    addTo(content, map, 'interactables', { id, kind: 'dialogue', dialogue: id, title: 'Fundstelle', role: 'Seltene Funde', sprite: 'paper', marker: true, prompt: 'Absuchen', visible_if: { requires_flags: ['k2_arrived'] } }, [4, 2]);
  }
  // Maud: kommentiert die Funde
  const maud = content.dialogues.wx_pfandleiherin;
  const lines = w.maud_keel ?? [];
  if (maud && lines.length) {
    const key = maud.nodes.start ? 'start' : maud.start;
    const start = maud.nodes[key];
    const choices = [...start.choices];
    choices.splice(Math.max(0, choices.length - 1), 0, { text: 'Was halten Sie von meinen Funden?', next: lines.map((_, i) => ({ node: `wxf_maud_${i}`, ...(i < lines.length - 1 ? { chance: 1 / (lines.length - i) } : {}) })) });
    const add = Object.fromEntries(lines.map((t, i) => [`wxf_maud_${i}`, { text: `„${t}“`, choices: [{ text: 'Zurück.', next: key }] }]));
    content.dialogues.wx_pfandleiherin = { ...maud, nodes: { ...maud.nodes, [key]: { ...start, choices }, ...add } };
  }
}
