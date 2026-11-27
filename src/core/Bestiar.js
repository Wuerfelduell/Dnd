// Bestiarium als Wegweiser (Seb 2026-11-27): Jede Gegnerart bekommt eine Seite, die sich schrittweise füllt.
// Nach der ersten Begegnung: Name, Bild und wo sie vorkommt. Mit Siegen kommen Beschreibung und Angriffe,
// dann die Beute, zuletzt die Schwächen samt Kampftipp. Oben im Reiter zeigt „Für deinen Pfad gesucht“,
// welche Gegner eine noch fehlende Pfad-Zutat fallen lassen (core/Bedarf.js). Formeln bleiben geheim (hiddenLoot).
import { hiddenLoot } from './Loot.js';

/** Siege, ab denen ein Teil der Seite lesbar wird. Einmalige Gegner (Bosse, Story-Kämpfe) zeigen alles nach dem ersten Sieg. */
export const BEAST_STUFEN = { info: 1, beute: 3, schwaechen: 5 };

export const STADT_NAMEN = { kettlegate: 'Kettlegate', wexmoor: 'Wexmoor', dunscar: 'Dunscar', calderwick: 'Calderwick', briarholt: 'Briarholt', varrowmouth: 'Varrowmouth', himmel: 'Himmel' };

/** Elite-Varianten und Kampfphasen zählen zum Grundgegner. */
export const beastBase = (id) => String(id ?? '').replace(/_phase\d+$/, '').replace(/_elite$/, '');

/** Kapitel → Stadt, für Gegner ohne feste Karte. */
const KAPITEL_STADT = { 1: 'kettlegate', 2: 'wexmoor', 3: 'dunscar', 4: 'calderwick' };

export const stadtVon = (mapId, map) => map?.city ?? (/^wx_/.test(mapId) ? 'wexmoor' : /^ds_/.test(mapId) ? 'dunscar' : /^(cw_|o3_)/.test(mapId) ? 'calderwick'
  : /^bh_/.test(mapId) ? 'briarholt' : /^(vm_|vw_)/.test(mapId) ? 'varrowmouth' : 'kettlegate');

const placeCache = new WeakMap();
/**
 * Fundorte aller Gegner: Grundgegner → { maps: Set(mapId), roam: bool }. `roam` = streift über eine Karte (kommt also wieder).
 * Quellen: Gegner auf Karten, Kampf-Objekte und Gespräche, die in einen Kampf münden.
 */
export function beastIndex(content) {
  if (placeCache.has(content)) return placeCache.get(content);
  const idx = new Map();
  const add = (enc, mapId, roam = false) => {
    if (!enc) return;
    const id = beastBase(enc);
    const e = idx.get(id) ?? { maps: new Set(), roam: false };
    if (mapId) e.maps.add(mapId.replace(/__warm$/, ''));
    if (roam) e.roam = true;
    idx.set(id, e);
  };
  const dialogCombats = new Map();
  for (const [dId, tree] of Object.entries(content.dialogues ?? {})) {
    const set = new Set(Object.values(tree.nodes ?? {}).map((n) => n.combat).filter(Boolean));
    if (set.size) dialogCombats.set(dId, set);
  }
  for (const [mapId, map] of Object.entries(content.maps ?? {})) {
    for (const r of map.roamers ?? []) add(r.encounter, mapId, !r.boss || !!r.respawn);
    for (const i of map.interactables ?? []) {
      if (i.kind === 'combat') add(i.encounter, mapId);
      if (i.kind === 'dialogue') for (const c of dialogCombats.get(i.dialogue) ?? []) add(c, mapId);
    }
    for (const n of map.npcs ?? []) for (const c of dialogCombats.get(n.dialogue ?? content.npcs?.[n.id]?.dialogue) ?? []) add(c, mapId);
  }
  placeCache.set(content, idx);
  return idx;
}

/** Wo kommt der Gegner vor? [{ map, name, city, cityName }], nach Stadt sortiert. Fallback über Gebiet bzw. Stadt der Daten. */
export function beastPlaces(content, id) {
  const base = beastBase(id);
  const enc = content.encounters?.[base] ?? content.encounters?.[id];
  const maps = new Set(beastIndex(content).get(base)?.maps ?? []);
  if (!maps.size && enc?.zone && content.maps?.[enc.zone]) maps.add(enc.zone);
  const order = Object.keys(STADT_NAMEN);
  const out = [...maps].filter((m) => content.maps?.[m]).map((m) => {
    const city = stadtVon(m, content.maps[m]);
    return { map: m, name: content.maps[m].name ?? m, city, cityName: STADT_NAMEN[city] ?? city };
  });
  if (out.length) return out.sort((a, b) => order.indexOf(a.city) - order.indexOf(b.city) || String(a.name).localeCompare(String(b.name)));
  // Gegner ohne feste Karte: Ritualwächter, Rivale, Sekten, Reise-Überfälle, sonst die Stadt des Kapitels
  const city = enc?.city ?? KAPITEL_STADT[enc?.chapter] ?? null;
  const cityName = city ? STADT_NAMEN[city] ?? city : null;
  const label = /^(hg|hs|hs2)_/.test(base) || enc?.waechter ? 'Beim Aufstiegsritual' : enc?.rivale ? 'Wo dein Rivale dich stellt'
    : /^enemy_sk_/.test(base) ? 'Bei Umtrieben der Sekten' : /^reise_/.test(base) ? 'Auf der Landstraße' : null;
  if (label) out.push({ map: null, name: label, city: null, cityName: null });
  else if (city) out.push({ map: null, name: null, city, cityName });
  return out.sort((a, b) => order.indexOf(a.city) - order.indexOf(b.city) || String(a.name).localeCompare(String(b.name)));
}

/** Einmaliger Gegner: Boss oder Story-Kampf, der nicht über eine Karte streift. Dann reicht ein Sieg für die ganze Seite. */
export function beastEinmalig(content, id) {
  const base = beastBase(id);
  const enc = content.encounters?.[base];
  if (enc?.boss && !enc.respawn) return true;
  return !beastIndex(content).get(base)?.roam;
}

/** Angriffe, die man nicht parieren kann (gleiche Regel wie im Kampf, core/Combat.js initFoe). */
export function unparierbar(enc) {
  const attacks = (enc?.attacks ?? []).filter((a) => !a.action);
  const flagged = attacks.some((a) => a.unparryable !== undefined);
  const heavy = attacks.filter((a) => a.hits?.length === 1).sort((a, b) => b.damage - a.damage)[0];
  return attacks.filter((a) => (flagged ? a.unparryable : a === heavy && attacks.length > 2)).map((a) => a.name);
}

/** Schwächen und Eigenheiten aus den Kampfdaten, als kurze Sätze. */
export function beastSchwaechen(content, id) {
  const enc = content.encounters?.[beastBase(id)];
  if (!enc) return [];
  const out = [];
  if (enc.occult) out.push('Okkult: heiliges Licht und geworfene Weihgaben treffen doppelt.');
  else out.push('Nicht okkult: Weihgaben wirken nur einfach, dafür greifen Stehl-Fertigkeiten.');
  if (enc.weak_if && enc.weak_text) out.push(`Schwachstelle: ${enc.weak_text}`);
  if (enc.schwaeche) out.push(`Schwäche: ${enc.schwaeche}`);
  if (enc.eigenheit) out.push(`Eigenheit: ${enc.eigenheit}`);
  const np = unparierbar(enc);
  if (np.length) out.push(`Nicht parierbar, nur ausweichen: ${np.join(', ')}.`);
  if (enc.min_seq) out.push(`Höheres Wesen: Blenden und Verwirren wirken erst ab Sequenz ${enc.min_seq}.`);
  if (enc.max_round_dmg) out.push(`Zäh: nimmt je Runde höchstens ${Math.round(enc.max_round_dmg * 100)} % seiner Leben Schaden.`);
  if (enc.armor) out.push(`Gepanzert: jeder Treffer verliert ${enc.armor} Schaden.`);
  return out;
}

const dropIndex = new WeakMap();
/** Welche Gegner lassen ein Stück fallen? itemId → [{ id (Grundgegner), chance, elite, first }]. Ohne Formeln. */
export function beastDrops(content) {
  if (dropIndex.has(content)) return dropIndex.get(content);
  const idx = new Map();
  for (const [encId, table] of Object.entries(content.loot ?? {})) {
    if (!content.encounters?.[encId] || content.encounters[encId].practice) continue;
    const base = beastBase(encId);
    const elite = encId.endsWith('_elite');
    const add = (item, chance, first = false) => {
      if (hiddenLoot(item, content.items)) return;
      const list = idx.get(item) ?? [];
      const old = list.find((e) => e.id === base);
      if (old) { if (!elite && old.elite) Object.assign(old, { chance, elite: false, first }); else old.chance = Math.max(old.chance, chance); }
      else list.push({ id: base, chance, elite, first });
      idx.set(item, list);
    };
    for (const d of table?.drops ?? []) add(d.item, Math.min(1, d.chance ?? 1));
    for (const item of Object.keys(table?.items ?? {})) add(item, 1, true);
  }
  dropIndex.set(content, idx);
  return idx;
}

export const bestiarMethods = {
  /** Eintrag eines Grundgegners: { seen, wins }. */
  bestiarEintrag(id) {
    const base = beastBase(id);
    const e = this.bestiar?.[base] ?? { seen: false, wins: 0 };
    // alte Stände ohne Zählung: ein gesetztes won_-Flag zählt als ein Sieg
    const won = this.flags?.has(`won_${base}`) || this.flags?.has(`won_${base}_elite`);
    return { seen: !!e.seen || !!won || e.wins > 0, wins: Math.max(e.wins ?? 0, won ? 1 : 0) };
  },

  /** Kampf beginnt: der Gegner steht ab jetzt mit Name und Ort im Bestiarium. */
  bestiarBegegnet(id) {
    const enc = this.content.encounters?.[id];
    if (!enc || enc.practice) return;
    const base = beastBase(id);
    this.bestiar ??= {};
    const e = this.bestiar[base] ?? { seen: false, wins: 0 };
    e.seen = true;
    this.bestiar[base] = e;
  },

  /** Sieg über einen Gegner (auch Begleiter einer Gruppe, Elite zählt zum Grundgegner). */
  bestiarSieg(id) {
    const enc = this.content.encounters?.[id];
    if (!enc || enc.practice) return;
    const base = beastBase(id);
    this.bestiar ??= {};
    const e = this.bestiar[base] ?? { seen: true, wins: 0 };
    e.seen = true;
    e.wins = (e.wins ?? 0) + 1;
    this.bestiar[base] = e;
  },

  /** Freigeschaltete Teile einer Seite: { seen, wins, info, beute, schwaechen, next: { teil, wins } | null }. */
  bestiarStufe(id) {
    const { seen, wins } = this.bestiarEintrag(id);
    const einmalig = beastEinmalig(this.content, id);
    const need = (k) => (einmalig ? 1 : BEAST_STUFEN[k]);
    const res = { seen, wins, einmalig, info: wins >= need('info'), beute: wins >= need('beute'), schwaechen: wins >= need('schwaechen') };
    const next = ['info', 'beute', 'schwaechen'].find((k) => !res[k]);
    res.next = next ? { teil: next, wins: need(next) } : null;
    return res;
  },

  /**
   * Wegweiser „Für deinen Pfad gesucht“: noch fehlende Pfad-Stücke (Bedarf.js), die ein Gegner fallen lässt.
   * [{ player, item, name, have, need, seq, kind, main, sources: [{ id, name, known, seen, wins, needWins, chance, elite, first, places }] }]
   * `known` = Beute dieses Gegners ist erforscht; sonst nur Stadt-Ahnung (bzw. Name, wenn schon begegnet).
   */
  bestiarWegweiser() {
    const drops = beastDrops(this.content);
    const stadt = stadtVon(this.map, this.content.maps?.[this.map]);
    const hier = (s) => Number(s.places.some((p) => p.city === stadt)); // Gegner in der aktuellen Stadt zuerst
    const out = [];
    for (const [player, map] of Object.entries(this.pfadBedarfAlle?.() ?? {})) {
      const n = Number(player);
      const have = (id) => (n === (this.acting ?? 1) ? this.itemCount(id) : this.withPartner(() => this.itemCount(id)));
      for (const [item, e] of map) {
        const srcs = drops.get(item);
        if (!srcs?.length || have(item) >= e.need) continue;
        const sources = srcs.filter((s) => this.content.encounters[s.id]).map((s) => {
          const st = this.bestiarStufe(s.id);
          return { ...s, name: this.content.encounters[s.id].name, known: st.beute, seen: st.seen, wins: st.wins,
            needWins: st.einmalig ? 1 : BEAST_STUFEN.beute, places: beastPlaces(this.content, s.id) };
        }).filter((s) => s.places.length || s.known)
          .sort((a, b) => Number(b.known) - Number(a.known) || Number(b.seen) - Number(a.seen) || hier(b) - hier(a) || b.chance - a.chance);
        if (!sources.length) continue;
        const seq = Math.max(...e.reasons.map((r) => r.seq));
        out.push({ player: n, item, name: this.item(item)?.name ?? item, have: have(item), need: e.need, seq,
          kind: e.reasons[0].kind, main: e.reasons.some((r) => r.main), sources });
      }
    }
    return out.sort((a, b) => a.player - b.player || b.seq - a.seq || Number(b.main) - Number(a.main) || a.name.localeCompare(b.name));
  },

  serializeBestiar() { return { bestiar: this.bestiar ?? {} }; },
  loadBestiar(data) {
    const b = data?.bestiar ?? {};
    this.bestiar = Object.fromEntries(Object.entries(b).filter(([id]) => this.content.encounters?.[id])
      .map(([id, e]) => [id, { seen: !!e?.seen, wins: Math.max(0, Number(e?.wins) || 0) }]));
    // alte Stände ohne Zählung: jeder schon besiegte Gegner zählt als ein Sieg
    for (const f of this.flags ?? []) {
      if (!f.startsWith('won_')) continue;
      const base = beastBase(f.slice(4));
      if (this.content.encounters?.[base] && !this.bestiar[base]) this.bestiar[base] = { seen: true, wins: 1 };
    }
  },
};
