// BQ/BR: Sekten in drei Städten (Aschenbund, Flutkinder, Stummer Chor). Daten in data/packs/sekten (content.sekten),
// Grafik in manifest-sekten.json, Kartenobjekte in world/SektenLife.js. Hier steht die reine Spiellogik:
// - Umtriebe-Stufe je Kult als Zahl 0..3 (`sekten.stufe`), gespiegelt in genau ein Anzeigeflag sk_<kult>_anzeige_<n>
//   für Zeitung und Gerede. Freigabe (`sk_freigegeben`) sobald Kapitel 3 begonnen hat und alle drei Städte offen sind.
// - Je echtem Kartenbesuch würfelt jeder Kult einmal gegen seine Ereignisrate; höchstens ein Ereignis je Besuch,
//   höchstens ein laufendes je Karte, jede Ereignis-ID einmal je Spielstand.
// - Ein laufendes Ereignis endet, wenn sein Dialog das Flag <id>_aktiv löscht (Ablehnen, Gegenmaßnahme, Abbauen,
//   Rückholung), wenn seine Frist abläuft (Spielminuten, auch auf anderen Karten) oder wenn eine abgeworbene Figur
//   für die Hauptgeschichte gebraucht wird (sektenRueckruf).
// - Sabotage wirkt nur auf ihrer Karte: Heiltränke halb (mindestens 1 Leben), Reiseaufschlag bis 5 Schilling
//   (0 bei Geldmangel), oder die Laternen bleiben dunkel. Schreinabbau senkt die Stufe einmal um 1 und gibt die Ereignisbeute.
import { rollLoot, takeLoot } from './Loot.js';
import { NIGHT_FLAG } from './Clock.js';

export const SK_STUFEN = ['Gerücht', 'Spuren', 'Umtriebe', 'Aufmarsch'];
export const SK_FREI = 'sk_freigegeben';
const MIN = 60; // eine Spielminute in Sekunden Spielzeit
/** Fristen für Ereignisse ohne eigene dauer_min (Spielminuten): Überfälle lösen sich auf, Schreine ziehen weiter. */
const DEFAULT_DAUER = { ueberfall: 30, schrein: 90 };
const clamp = (v) => Math.max(0, Math.min(3, Math.round(v)));

export const sektenMethods = {
  resetSekten() {
    this.sekten = { stufe: {}, aktiv: {}, erledigt: [], abwesend: {}, besuche: 0 };
  },

  sektenData() {
    return this.content.sekten ?? null;
  },
  sektenKulte() {
    return this.sektenData()?.kulte ?? [];
  },
  sektenKult(id) {
    return this.sektenKulte().find((k) => k.id === id) ?? null;
  },
  sektenEreignis(id) {
    return this.sektenData()?.ereignisse.find((e) => e.id === id) ?? null;
  },
  sektenFrei() {
    return this.flags.has(SK_FREI);
  },

  /** Freigabe: alle drei Städte und Rückreisen offen (Kapitel 3 begonnen). Setzt einmalig die Anzeigeflags der Stufe 0. */
  sektenUnlock() {
    if (!this.sektenData() || this.sektenFrei() || !this.flags.has('k3_arrived')) return false;
    this.flags.add(SK_FREI);
    for (const k of this.sektenKulte()) this.setSektenStufe(k.id, this.sektenStufe(k.id), { force: true });
    this.emit('sekten', { kind: 'frei' });
    this.emit('changed');
    return true;
  },

  sektenStufe(k) {
    return this.sekten?.stufe[k] ?? 0;
  },
  sektenStufeName(k) {
    return SK_STUFEN[this.sektenStufe(k)];
  },
  /** Stufe 0..3 setzen; die vier Anzeigeflags folgen (genau eines gesetzt), neue Zeitungsausgaben erscheinen. */
  setSektenStufe(k, v, { force = false } = {}) {
    const next = clamp(v);
    const prev = this.sektenStufe(k);
    if (!force && next === prev) return prev;
    this.sekten.stufe[k] = next;
    for (let s = 0; s < 4; s++) this.flags.delete(`${k}_anzeige_${s}`);
    this.flags.add(`${k}_anzeige_${next}`);
    this.checkPapers?.();
    if (next !== prev) this.emit('sekten', { kind: 'stufe', kult: k, stufe: next, prev });
    return next;
  },
  /** HUD-, Notizbuch- und Wegweisertext einer Stufe. */
  sektenStufeText(k, s = this.sektenStufe(k)) {
    return this.sektenData()?.stufen?.[k]?.[String(s)] ?? null;
  },
  /** Notizbuch: der Steckbrief wächst mit der Stufe (Absätze 0..Stufe). */
  sektenSteckbrief(k) {
    const s = this.sektenStufe(k);
    return [0, 1, 2, 3].filter((i) => i <= s).map((i) => this.sektenStufeText(k, i)?.notizbuch).filter(Boolean);
  },

  sektenAktiv(id) {
    return this.sekten.aktiv[id] ?? null;
  },
  /** Laufende Ereignisse auf einer Karte, mit ihrer Definition. */
  sektenAktiveAuf(map = this.map) {
    return Object.entries(this.sekten.aktiv).filter(([, a]) => a.map === map).map(([id, a]) => ({ ...this.sektenEreignis(id), ...a, id }));
  },
  sektenAlleAktiven() {
    return Object.entries(this.sekten.aktiv).map(([id, a]) => ({ ...this.sektenEreignis(id), ...a, id }));
  },
  /** Abgeworbene Figur: steht nicht an ihrem Platz, bis sie zurückgeholt wird oder die Frist abläuft. */
  sektenAbwesend(npcId) {
    return !!this.sekten.abwesend[npcId];
  },
  /** Steht die Figur gerade irgendwo sichtbar auf einer Karte? */
  sektenFigurDa(npcId) {
    return Object.values(this.content.maps).some((m) => (m.npcs ?? []).some((n) => n.id === npcId && this.meets(n.visible_if)));
  },
  /** Figur, die ein laufender Hauptauftrag als Ziel nennt, wird nicht abgeworben. */
  sektenFigurGebraucht(npcId) {
    return Object.entries(this.quests).some(([q, st]) => st === 'active' && this.quest(q)?.kind === 'main' && (this.quest(q).steps ?? []).some((s) => s.target?.id === npcId));
  },
  sektenZeitPasst(ev) {
    const night = this.flags.has(NIGHT_FLAG);
    return ev.zeit === 'immer' || (ev.zeit === 'nacht') === night;
  },

  /** Erlaubte, noch nicht erlebte Ereignisse eines Kults auf dieser Karte (Stufe, Tageszeit, Figur frei). */
  sektenKandidaten(k, map = this.map) {
    const kult = this.sektenKult(k);
    if (!kult) return [];
    const ids = kult.stufen[String(this.sektenStufe(k))]?.freischaltet ?? [];
    const aktiv = Object.values(this.sekten.aktiv);
    return ids.map((id) => this.sektenEreignis(id)).filter((ev) => ev && ev.karten.includes(map) && this.sektenZeitPasst(ev)
      && !this.sekten.erledigt.includes(ev.id) && !this.sekten.aktiv[ev.id] && !this.flags.has(`${ev.id}_erledigt`)
      && (ev.art !== 'abwerbung' || (!this.sekten.abwesend[ev.figur] && !aktiv.some((a) => a.art === 'abwerbung' && a.kult === k)
        && this.sektenFigurDa(ev.figur) && !this.sektenFigurGebraucht(ev.figur)))
      && (ev.art !== 'zeichen_am_haus' || this.sektenFigurDa(ev.figur)));
  },

  /** Ein echter Kartenbesuch (kein Laden): je Kult einmal würfeln, höchstens ein Ereignis beginnen. */
  sektenBesuch(map = this.map, rng = Math.random) {
    this.sektenUnlock();
    if (!this.sektenFrei()) return null;
    this.sekten.besuche += 1;
    if (this.sektenAktiveAuf(map).length) return null;
    const order = [...this.sektenKulte()];
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } // feste Zahl Würfe je Besuch
    for (const k of order) {
      const rate = k.stufen[String(this.sektenStufe(k.id))]?.ereignisrate ?? 0;
      if (rng() >= rate) continue;
      const c = this.sektenKandidaten(k.id, map);
      if (!c.length) continue;
      return this.sektenStart(c[Math.floor(rng() * c.length)].id, map);
    }
    return null;
  },

  /** Ereignis beginnen: Startwirkung, Frist, Figur ausblenden, Stufe einmal anpassen. */
  sektenStart(id, map = this.map) {
    const ev = this.sektenEreignis(id);
    if (!ev || this.sekten.aktiv[id]) return null;
    this.applyEffects(ev.start);
    const dauer = ev.dauer_min ?? DEFAULT_DAUER[ev.art] ?? null;
    const a = { map, art: ev.art, kult: ev.kult, start: this.playTime, until: dauer ? this.playTime + dauer * MIN : null, figur: ev.figur ?? null };
    this.sekten.aktiv[id] = a;
    if (ev.art === 'abwerbung') this.sekten.abwesend[ev.figur] = id;
    if (ev.folge_stufe) this.setSektenStufe(ev.kult, this.sektenStufe(ev.kult) + ev.folge_stufe);
    this.emit('sekten', { kind: 'start', id, ev, map });
    this.emit('changed');
    return { ...ev, ...a, id };
  },

  /**
   * Ereignis beenden. grund: 'dialog' (der Dialog hat das Aktivflag gelöscht: Ablehnen, Gegenmaßnahme, Abbauen,
   * Rückholung), 'zeit' (Frist abgelaufen oder Rückruf für die Hauptgeschichte: keine Belohnung, Quest bleibt offen).
   */
  sektenEnde(id, grund = 'dialog') {
    const ev = this.sektenEreignis(id);
    const a = this.sekten.aktiv[id];
    if (!ev || !a) return false;
    if (grund === 'zeit' && ev.rueckkehr?.zeitablauf_effekte) this.applyEffects(ev.rueckkehr.zeitablauf_effekte);
    else if (grund === 'zeit' && ev.ablauf) this.applyEffects(ev.ablauf);
    else this.applyEffects(ev.ende);
    let beute = null;
    if (ev.art === 'schrein' && grund === 'dialog' && this.flags.has(`${id}_erledigt`)) {
      if (ev.abbauen) this.setSektenStufe(ev.kult, this.sektenStufe(ev.kult) + (ev.abbauen.stufe_delta ?? -1));
      if (ev.beute) { beute = rollLoot(ev.beute, this.rng ?? Math.random); takeLoot(this, beute, ev.titel); }
    }
    delete this.sekten.aktiv[id];
    if (!this.sekten.erledigt.includes(id)) this.sekten.erledigt.push(id);
    if (ev.figur && this.sekten.abwesend[ev.figur] === id) delete this.sekten.abwesend[ev.figur];
    this.emit('sekten', { kind: 'ende', id, ev, grund, map: a.map, beute });
    this.emit('changed');
    return true;
  },

  /** Läuft mit der Spielzeit: Dialoge lösen Ereignisse über ihr Aktivflag auf, Fristen laufen ab. */
  tickSekten() {
    if (!this.sekten || !Object.keys(this.sekten.aktiv).length) return;
    for (const [id, a] of Object.entries(this.sekten.aktiv)) {
      if (!this.flags.has(`${id}_aktiv`)) this.sektenEnde(id, 'dialog');
      else if (a.until !== null && this.playTime >= a.until) this.sektenEnde(id, 'zeit');
    }
  },

  /** Vor einer Hauptinteraktion oder einem Kapitelwechsel: abgeworbene Figur sofort zurück (ohne Belohnung). */
  sektenRueckruf(npcId) {
    const id = this.sekten.abwesend[npcId];
    if (id) this.sektenEnde(id, 'zeit');
    return !!id;
  },

  // --- Örtliche Sabotage ---------------------------------------------------------------------------------
  sektenWirkungen(map = this.map) {
    return this.sektenAktiveAuf(map).filter((e) => e.art === 'sabotage' && e.wirkung).map((e) => e.wirkung);
  },
  /** Heiltränke wirken auf einer vergifteten Karte nur zum Teil (mindestens 1 Leben, nur Tränke). */
  sektenHeilFaktor(map = this.map) {
    return this.sektenWirkungen(map).find((w) => w.art === 'heilung')?.heiltrank_faktor ?? 1;
  },
  /** Gesperrte Fähre/Bahn: Aufschlag auf die Reise von dieser Karte, höchstens 5 Schilling, bei Geldmangel 0. */
  sektenReiseAufschlag(map = this.map) {
    const w = this.sektenWirkungen(map).find((x) => x.art === 'reise');
    if (!w) return 0;
    const fee = Math.min(5, w.aufpreis_schilling ?? 5);
    return this.money >= fee ? fee : (w.bei_geldmangel ?? 0);
  },
  /** Abgedrehte Laternen: nur das Licht dieser Karte, kein globales Nachtflag. */
  sektenDunkel(map = this.map) {
    return this.sektenWirkungen(map).some((w) => w.art === 'nacht');
  },
  /** HUD-Hinweis beim Betreten: laufende Ereignisse hier, sonst die Stufe eines Kults, der hier wandert. */
  sektenHinweis(map = this.map) {
    const here = this.sektenAktiveAuf(map);
    if (here.length) return here.map((e) => `${this.sektenKult(e.kult)?.name}: ${e.titel}`).join(' · ');
    const k = this.sektenKulte().find((x) => this.sektenStufe(x.id) > 0 && x.wanderkarten.includes(map));
    return k ? this.sektenStufeText(k.id)?.hud ?? null : null;
  },
  /** Wegweiser, wenn man feststeckt: der Tipp der höchsten Stufe. */
  sektenWegweiser() {
    const k = [...this.sektenKulte()].sort((a, b) => this.sektenStufe(b.id) - this.sektenStufe(a.id))[0];
    return k && this.sektenFrei() ? this.sektenStufeText(k.id)?.wegweiser ?? null : null;
  },

  serializeSekten() {
    return { sekten: { stufe: { ...this.sekten.stufe }, aktiv: { ...this.sekten.aktiv }, erledigt: [...this.sekten.erledigt], abwesend: { ...this.sekten.abwesend }, besuche: this.sekten.besuche } };
  },
  loadSekten(data) {
    this.resetSekten();
    const d = data?.sekten;
    if (!d) return;
    for (const k of this.sektenKulte()) this.sekten.stufe[k.id] = clamp(d.stufe?.[k.id] ?? 0);
    for (const [id, a] of Object.entries(d.aktiv ?? {})) if (this.sektenEreignis(id) && this.content.maps[a.map]) this.sekten.aktiv[id] = { ...a };
    this.sekten.erledigt = (d.erledigt ?? []).filter((id) => this.sektenEreignis(id));
    for (const [npc, id] of Object.entries(d.abwesend ?? {})) if (this.sekten.aktiv[id]) this.sekten.abwesend[npc] = id;
    this.sekten.besuche = d.besuche ?? 0;
    this.tickSekten(); // abgelaufene Fristen vor dem ersten Bild auflösen
  },
};
