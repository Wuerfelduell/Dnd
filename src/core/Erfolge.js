// Codex DL: „Akte des Ermittlers“ – 80 stille Erfolge ohne Belohnung (Daten: packs/erfolge).
// Ein Erfolg gilt, wenn alle requires_flags gesetzt sind oder sein Zähler das Minimum erreicht.
// Nur Zähler, die das Spiel heute wirklich messen kann, stehen in COUNTERS; alle anderen bleiben offen
// (Kapitel 6, Tiere, Haus, Nebelseite … kommen erst mit ihren Systemen).
// Gespeichert wird pro Spielerprofil (localStorage), nicht im Spielstand: ein neuer Durchlauf behält die Akte.
// Die erste Prüfung nach dem Start trägt still nach (keine 80 Einblendungen), danach meldet jeder neue Erfolg sich einmal.

export const ERFOLGE_KEY = 'nebelakten_erfolge_v1';
const ZIRKEL = ['treffen_waage', 'treffen_kreide', 'treffen_russ', 'treffen_lichtlose', 'treffen_salz', 'treffen_schichtbund'];
const KAPITEL_FLAG = { 1: 'case_09_closed', 2: 'kapitel2_done', 3: 'kapitel3_done', 4: 'kapitel4_done', 5: 'kapitel5_done' };

const emptyProfile = () => ({ ids: [], neu: [], endings: {}, pfade: [], seqMin: 10 });
const memoryStore = { data: null };

export function loadProfile() {
  try {
    const raw = globalThis.localStorage?.getItem(ERFOLGE_KEY);
    if (raw) return { ...emptyProfile(), ...JSON.parse(raw) };
  } catch { /* privat/kein Speicher */ }
  return memoryStore.data ? { ...memoryStore.data } : emptyProfile();
}

function saveProfile(p) {
  memoryStore.data = p;
  try { globalThis.localStorage?.setItem(ERFOLGE_KEY, JSON.stringify(p)); } catch { /* egal */ }
}

/** Nur für Tests: Profil zurücksetzen. */
export function resetErfolgeProfile() {
  memoryStore.data = null;
  try { globalThis.localStorage?.removeItem(ERFOLGE_KEY); } catch { /* egal */ }
}

const players = (s) => [s.pathway, s.p2?.active ? s.p2.pathway : null].filter((pw) => pw?.id);

/** Messbare Zähler: Wert aus Spielstand und Profil. */
const COUNTERS = {
  ...Object.fromEntries([8, 7, 6, 5, 4, 3, 2, 1].map((n) => [`dl_sequenz_${n}`, (s, p) => (p.seqMin <= n ? 1 : 0)])),
  dl_kreaturform: (s) => (s.flags.has('kreaturform_gezeigt') ? 1 : 0),
  dl_pfade_profil: (s, p) => p.pfade.length,
  dl_enden_eines_kapitels: (s, p) => Math.max(0, ...Object.values(p.endings).map((l) => l.length)),
  dl_zwei_zirkel: (s) => ZIRKEL.filter((f) => s.flags.has(f)).length,
  dl_fuenf_freunde: (s) => Object.keys(s.content.npcs ?? {}).filter((id) => s.mood?.(id) === 'freundlich').length,
  dl_drei_feinde: (s) => Object.keys(s.content.npcs ?? {}).filter((id) => s.mood?.(id) === 'feindselig').length,
  dl_fasserin_bilanz: (s) => { const h = s.artisanHistory ?? []; return (h.some((x) => x.ok) ? 1 : 0) + (h.some((x) => !x.ok) ? 1 : 0); },
  zaehler_kaempfe: (s) => s.erfolgZaehler?.kaempfe ?? 0,
  zaehler_briefe: (s) => (s.post?.fach ?? []).filter((f) => f.gelesen).length, // Codex DI
  dl_koop_pfade: (s) => { const pw = players(s); return pw.length === 2 && pw[0].id !== pw[1].id ? 1 : 0; },
  ...Object.fromEntries(Object.entries(KAPITEL_FLAG).map(([k, f]) => [`dl_koop_kapitel_${k}`, (s) => (s.p2?.active && s.flags.has(f) ? 1 : 0)])),
};

/** Diese Zähler werden im Profil gemerkt, sobald sie einmal erreicht waren (Koop-Kapitel hängt am Moment). */
const LATCH = new Set(Object.keys(KAPITEL_FLAG).map((k) => `dl_koop_kapitel_${k}`).concat('dl_koop_pfade'));

export const erfolgeMethods = {
  erfolgeDefs() {
    return this.content.erfolge?.list ?? [];
  },

  erfolgeProfil() {
    if (!this._erfolgProfil) this._erfolgProfil = loadProfile();
    return this._erfolgProfil;
  },

  /** Ist der Zähler messbar? (sonst bleibt der Erfolg vorerst offen) */
  erfolgMessbar(def) {
    const z = def.bedingung?.zaehler;
    return !z || !!COUNTERS[z.id];
  },

  erfolgWert(def) {
    const b = def.bedingung ?? {};
    if (b.requires_flags) return b.requires_flags.every((f) => this.flags.has(f)) ? 1 : 0;
    const fn = COUNTERS[b.zaehler?.id];
    return fn ? fn(this, this.erfolgeProfil()) : 0;
  },

  erfolgErfuellt(def) {
    const b = def.bedingung ?? {};
    if (b.requires_flags) return b.requires_flags.length > 0 && this.erfolgWert(def) >= 1;
    if (!b.zaehler || !COUNTERS[b.zaehler.id]) return false;
    if (LATCH.has(b.zaehler.id) && this.erfolgeProfil().ids.includes(def.id)) return true;
    return this.erfolgWert(def) >= (b.zaehler.min ?? 1);
  },

  erfolgFrei(id) {
    return this.erfolgeProfil().ids.includes(id);
  },

  /** Zählt einen gewonnenen Kampf (nicht Übung) für „Hundert Kämpfe“. */
  erfolgKampf() {
    this.erfolgZaehler = { ...(this.erfolgZaehler ?? {}), kaempfe: (this.erfolgZaehler?.kaempfe ?? 0) + 1 };
  },

  /** Profilwerte aus dem aktuellen Stand nachführen (Pfade, tiefste Sequenz, Kapitelenden). */
  erfolgeNachfuehren(p) {
    let dirty = false;
    for (const pw of players(this)) {
      if (!p.pfade.includes(pw.id)) { p.pfade = [...p.pfade, pw.id]; dirty = true; }
      if (pw.seq < p.seqMin) { p.seqMin = pw.seq; dirty = true; }
    }
    for (const id of Object.keys(this.endings ?? {})) {
      const k = /^(k\d)_/.exec(id)?.[1];
      if (!k || !this.content.endings?.[id]) continue;
      const list = p.endings[k] ?? [];
      if (!list.includes(id)) { p.endings = { ...p.endings, [k]: [...list, id] }; dirty = true; }
    }
    return dirty;
  },

  /**
   * Prüft alle Erfolge. Gibt die neu erfüllten zurück und meldet sie (Ereignis 'erfolg'),
   * außer beim ersten Lauf nach dem Start oder mit silent: dann wird still nachgetragen.
   */
  checkErfolge({ silent = false } = {}) {
    const defs = this.erfolgeDefs();
    if (!defs.length) return [];
    const p = this.erfolgeProfil();
    let dirty = this.erfolgeNachfuehren(p);
    const quiet = silent || !this._erfolgPrimed;
    this._erfolgPrimed = true;
    const neu = [];
    for (const def of defs) {
      if (p.ids.includes(def.id) || !this.erfolgErfuellt(def)) continue;
      p.ids = [...p.ids, def.id];
      if (!quiet) p.neu = [...p.neu, def.id];
      neu.push(def);
      dirty = true;
    }
    if (dirty) saveProfile(p);
    if (!quiet) for (const def of neu) this.emit?.('erfolg', def);
    return neu;
  },

  /** Das Neu-Zeichen verschwindet, sobald die Akte geöffnet wurde. */
  erfolgeGesehen() {
    const p = this.erfolgeProfil();
    if (!p.neu.length) return;
    p.neu = [];
    saveProfile(p);
  },

  /** Einblendungstext (wechselt reihum, Koop-Erfolge mit eigener Zeile). */
  erfolgMeldung(def) {
    const m = this.content.erfolge?.meldungen ?? {};
    const pool = def.koop ? m.koop : m.einblendungen;
    const i = this.erfolgeProfil().ids.indexOf(def.id);
    const t = pool?.length ? pool[Math.max(0, i) % pool.length] : 'Vermerk angelegt: {name}';
    return t.replace('{name}', def.name);
  },

  /** Seitentext oben auf der Akte. */
  erfolgeSeitentext() {
    const defs = this.erfolgeDefs();
    const a = this.content.erfolge?.meldungen?.akte ?? {};
    const n = defs.filter((d) => this.erfolgFrei(d.id)).length;
    const lines = [n === 0 ? a.leer : n >= defs.length ? a.voll : n >= 40 ? a.halb : `${n} von ${defs.length} Vermerken.`];
    const hidden = defs.filter((d) => d.versteckt);
    if (hidden.length && hidden.every((d) => this.erfolgFrei(d.id))) lines.push(a.alles_versteckt);
    return lines.filter(Boolean);
  },
};
