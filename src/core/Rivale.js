// Rivale auf dem eigenen Pfad (Daten und Regeln in data/rivale.js).
// Jeder Spieler hat seinen eigenen Rivalen (Seb 2026-11-26: im Koop zwei Rivalen, auch auf demselben Pfad,
// sonst hätte ein Spieler Vorteile). Zustand `rivalen`: { p1: {...}, p2: {...} } mit Pfad, Sequenz, Status usw.
// Alles, was würfelt, würfelt mit festem Startwert je Spieltag (bzw. je Treffen) und Spieler, damit Neuladen nichts ändert.
import { seeded } from './Gatherings.js';
import { DAY_SECONDS } from './Clock.js';
import { RIVALEN, RIVALE_REGELN as R, rivaleEncId, rivaleName, rivaleText } from '../data/rivale.js';

const TAG_FELDER = ['tag', 'ruhe_bis', 'stahl_tag', 'treff_tag', 'kreis_frei', 'kreis_besetzt', 'kreis_kampf'];
const KEY = { 1: 'p1', 2: 'p2' };

/** Gespeicherte Rivalen säubern (alte Stände haben keine). */
export function cleanRivalen(data) {
  const out = {};
  for (const key of Object.values(KEY)) {
    const r = data?.[key];
    if (!r || typeof r !== 'object' || !RIVALEN[r.pid]) continue;
    const n = (v, d) => (Number.isFinite(v) ? v : d);
    out[key] = {
      pid: r.pid,
      seq: Math.min(9, Math.max(1, n(r.seq, 9))),
      status: r.status === 'verbuendet' ? 'verbuendet' : 'rivale',
      siege: Math.max(0, n(r.siege, 0)),
      niederlagen: Math.max(0, n(r.niederlagen, 0)),
      getroffen: !!r.getroffen,
      ...Object.fromEntries(TAG_FELDER.map((k) => [k, n(r[k], -1)])),
    };
  }
  return out;
}

export const rivaleMethods = {
  rivaleTagNr() {
    return Math.floor((this.playTime ?? 0) / DAY_SECONDS);
  },

  /** Pfad von Spieler n (1 oder 2), egal wer gerade handelt. */
  rivalePfadVon(n) {
    if (n === 2 && !this.p2?.active) return null;
    const pw = n === (this.acting ?? 1) ? this.pathway : this.p2?.pathway;
    return pw?.id && RIVALEN[pw.id] && pw.seq ? pw : null;
  },

  /** Spieler mit Rivalen (ab Wexmoor): [1] oder [1, 2]. */
  rivaleSpieler() {
    if (!this.flags.has(R.ab_flag)) return [];
    return [1, 2].filter((n) => this.rivalePfadVon(n));
  },

  /** Führt fn als Spieler n aus. */
  rivaleAls(n, fn) {
    return n === (this.acting ?? 1) || !this.p2 ? fn() : this.withPartner(fn);
  },

  /** Der Rivale von Spieler n, auf den heutigen Spieltag gebracht (oder null vor Wexmoor / ohne Pfad). */
  rivaleDaten(n = this.acting ?? 1) {
    if (!this.flags.has(R.ab_flag)) return null;
    const pw = this.rivalePfadVon(n);
    if (!pw) return null;
    const ps = pw.seq;
    const tag = this.rivaleTagNr();
    this.rivalen ??= {};
    let r = this.rivalen[KEY[n]];
    if (!r || r.pid !== pw.id) { // neu, oder Pfadwechsel: der Rivale des neuen Pfades
      r = cleanRivalen({ [KEY[n]]: { pid: pw.id, seq: ps } })[KEY[n]];
      r.tag = tag;
      this.rivalen[KEY[n]] = r;
    }
    // Parallel aufsteigen: hinterher → je Tag eine Sequenz auf; gleichauf → manchmal eine voraus (nie mehr als eine)
    if (r.tag < tag - 60) r.tag = tag - 60; // lange Pausen nicht Tag für Tag nachrechnen
    while (r.tag < tag) {
      r.tag++;
      if (r.seq > ps) r.seq--;
      else if (r.seq > Math.max(1, ps - 1) && seeded(`${this.seed ?? ''}|rv|${n}|${r.pid}|${r.tag}`)() < R.vorsprung) r.seq--;
    }
    r.seq = Math.max(r.seq, Math.max(1, ps - 1));
    return r;
  },

  /** Arbeitet der Rivale von Spieler n heute gegen ihn (kein Bündnis, nicht frisch geschlagen)? */
  rivaleAktiv(n = this.acting ?? 1) {
    const r = this.rivaleDaten(n);
    if (!r || r.status !== 'rivale' || this.rivaleTagNr() <= r.ruhe_bis) return null;
    return r;
  },

  rivaleText(key, n) {
    return rivaleText(key, this.rivalen?.[KEY[n]]?.pid, n);
  },

  /** Auf dem Markt oder einem Treffen: hat der Rivale des handelnden Spielers dieses Angebot weggekauft? */
  rivaleWeggekauft(merchantId, e) {
    const n = this.acting ?? 1;
    const pid = this.pathway?.id;
    if (!pid || !e?.item || e.locked || e.owned || !this.rivaleAktiv(n)) return false;
    const f = this.item(`formel_${pid}_${this.pathway.seq - 1}`);
    if (!f?.ingredients || !(e.item in f.ingredients)) return false;
    const m = this.merchant(merchantId);
    if (!m) return false;
    const relevant = [...new Set(this.merchantStock(merchantId).map((x) => x.item).filter((id) => id in f.ingredients))].sort();
    if (!relevant.length) return false;
    const runde = m.gathering ? `t${this.marketCycle()}` : `d${this.rivaleTagNr()}`;
    const rng = seeded(`${this.seed ?? ''}|rvm|${n}|${pid}|${merchantId}|${runde}`);
    if (rng() >= (m.gathering ? R.treffen : R.markt)) return false;
    return relevant[Math.floor(rng() * relevant.length)] === e.item;
  },

  /** Meldung im Laden: wessen Rivale war hier? */
  rivaleMarktText() {
    return this.rivaleText('markt', this.acting ?? 1);
  },

  /**
   * Ritual (Pathways.performRitual, wenn alles bereitsteht): Ist der Rivale des handelnden Spielers gleichauf oder voraus,
   * steht er manchmal schon im Kreis. Ergebnis wie performRitual ({ ok: false, fight, text }) oder null.
   */
  rivaleImKreis(pid, seq) {
    if (this.testmodus) return null;
    const n = this.acting ?? 1;
    const r = this.rivaleAktiv(n);
    if (!r || r.pid !== pid) return null;
    const tag = this.rivaleTagNr();
    if (r.kreis_frei === tag) return null;
    if (r.kreis_besetzt === tag) return { ok: false, text: this.rivaleText('ritual_besetzt', n) };
    if (r.seq > seq + 1) return null; // noch hinter dir: kein Grund, dir zuvorzukommen
    if (seeded(`${this.seed ?? ''}|rvk|${n}|${pid}|${tag}`)() >= R.ritual) return null;
    const id = rivaleEncId(pid, r.seq, n);
    if (!this.content.encounters[id]) return null;
    r.kreis_kampf = tag;
    this.startCombat(id);
    return { ok: false, fight: id, text: this.rivaleText('ritual', n) };
  },

  /** Combat.finish: Sieg, Niederlage oder Flucht gegen einen Rivalen. Gibt einen Zusatztext zurück. */
  rivaleKampfEnde(combat) {
    const n = combat?.enc?.rivale_nr;
    const r = n ? this.rivalen?.[KEY[n]] : null;
    if (!r) return null;
    const tag = this.rivaleTagNr();
    const imKreis = r.kreis_kampf === tag;
    r.kreis_kampf = -1;
    const out = [];
    if (combat.outcome === 'won') {
      r.siege++;
      r.ruhe_bis = tag + R.ruhe_tage;
      if (imKreis) { r.kreis_frei = tag; out.push(this.rivaleText('ritual_frei', n)); }
      if (r.status === 'rivale' && r.siege === R.buendnis_siege) out.push(this.rivaleText('sieg_respekt', n));
    } else {
      if (combat.outcome === 'lost') r.niederlagen++;
      if (imKreis) { r.kreis_besetzt = tag; out.push(this.rivaleText('ritual_besetzt', n)); }
    }
    this.emit('changed');
    return out.join('\n\n') || null;
  },

  /** Begegnung beim Betreten einer Straße (ab Wexmoor, je Rivale höchstens einmal am Tag). { nr, treffen } oder null. */
  rivaleBegegnung(mapId, rng = Math.random) {
    const m = this.content.maps?.[mapId];
    if (!m?.city || m.city === 'kettlegate' || m.danger) return null;
    const treffen = mapId.startsWith('treffen_');
    if (!treffen && !(m.patrols || m.passanten || m.facades || m.police)) return null;
    const tag = this.rivaleTagNr();
    for (const n of this.rivaleSpieler()) {
      const r = this.rivaleDaten(n);
      if (!r || r.treff_tag === tag) continue;
      const chance = !r.getroffen ? 1 : treffen ? R.begegnung_treffen : R.begegnung;
      if (rng() < chance) return { nr: n, treffen };
    }
    return null;
  },

  /** Die Begegnung findet statt: Text und Möglichkeiten. Merkt den Tag (einmal am Tag). */
  rivaleTreffen(n = 1, { treffen = false } = {}) {
    const r = this.rivaleDaten(n);
    if (!r) return null;
    const tag = this.rivaleTagNr();
    const erste = !r.getroffen;
    r.getroffen = true;
    r.treff_tag = tag;
    const ps = this.rivalePfadVon(n).seq;
    const ruht = tag <= r.ruhe_bis;
    let key = r.seq < ps ? 'voraus' : r.seq > ps ? 'hinter' : 'gleich';
    if (treffen) key = 'treffen';
    if (ruht) key = 'geschlagen';
    if (erste) key = 'erste';
    const lage = { nr: n, pid: r.pid, name: rivaleName(r.pid, n), seq: r.seq, status: r.status, text: this.rivaleText(key, n), optionen: [] };
    if (r.status === 'verbuendet') {
      const g = this.rivaleGeschenk(n, seeded(`${this.seed ?? ''}|rvg|${n}|${r.pid}|${tag}`));
      lage.text = `${this.rivaleText('verbuendet', n)}\n\n${g.text}`;
      lage.beute = g.beute;
      lage.optionen = ['gehen'];
      return lage;
    }
    if (!ruht) lage.optionen.push('kampf');
    if (r.stahl_tag !== tag) lage.optionen.push('stehlen');
    lage.optionen.push('buendnis', 'gehen');
    lage.stehlChance = this.rivaleStehlChance(n);
    this.emit('changed');
    return lage;
  },

  rivaleStehlChance(n) {
    const r = this.rivalen?.[KEY[n]];
    const pw = this.rivalePfadVon(n);
    if (!r || !pw) return 0;
    const c = R.stehlen_basis + R.stehlen_je_seq * (r.seq - pw.seq) + (['schluessel', 'maske'].includes(r.pid) ? R.stehlen_pfad : 0);
    return Math.min(R.stehlen_max, Math.max(R.stehlen_min, c));
  },

  /** Eine Nebenzutat (nie die Hauptzutat) des nächsten Tranks für Spieler n: die, von der am meisten fehlt. */
  rivaleZutatGeben(n) {
    return this.rivaleAls(n, () => {
      const pw = this.pathway;
      const f = pw ? this.item(`formel_${pw.id}_${pw.seq - 1}`) : null;
      const ids = Object.keys(f?.ingredients ?? {}).slice(1).filter((id) => this.item(id));
      if (!ids.length) return null;
      const id = [...ids].sort((a, b) => (f.ingredients[b] - this.itemCount(b)) - (f.ingredients[a] - this.itemCount(a)))[0];
      this.addItem(id);
      return id;
    });
  },

  /** Bestehlen: einmal am Tag. Gelingt es, gibt es eine Zutat deines nächsten Tranks; sonst beginnt der Kampf. */
  rivaleStehlen(n = 1, rng = Math.random) {
    const r = this.rivaleDaten(n);
    const tag = this.rivaleTagNr();
    if (!r) return { ok: false, text: '' };
    if (r.stahl_tag === tag) return { ok: false, text: this.rivaleText('stehlen_heute', n) };
    r.stahl_tag = tag;
    if (rng() < this.rivaleStehlChance(n)) {
      const id = this.rivaleZutatGeben(n);
      if (id) { this.emit('changed'); return { ok: true, text: this.rivaleText('stehlen_ok', n), beute: this.item(id).name }; }
      const geld = (10 - r.seq) * R.geld_je_seq;
      this.rivaleAls(n, () => this.addMoney(geld, { loot: true, reason: rivaleName(r.pid, n) }));
      return { ok: true, text: this.rivaleText('stehlen_nichts', n), beute: `+${geld} Schilling` };
    }
    const id = rivaleEncId(r.pid, r.seq, n);
    if (this.content.encounters[id]) this.rivaleAls(n, () => this.startCombat(id));
    this.emit('changed');
    return { ok: false, fight: id, text: this.rivaleText('stehlen_fehl', n) };
  },

  /** Kampf aus der Begegnung heraus (der Spieler, dessen Rivale es ist, löst ihn aus). */
  rivaleKampf(n = 1) {
    const r = this.rivaleDaten(n);
    const id = r ? rivaleEncId(r.pid, r.seq, n) : null;
    if (!id || !this.content.encounters[id]) return null;
    this.rivaleAls(n, () => this.startCombat(id));
    return id;
  },

  /** Bündnis anbieten: nimmt er an, kauft er nichts mehr weg, stört kein Ritual und legt manchmal etwas zurück. */
  rivaleBuendnis(n = 1) {
    const r = this.rivaleDaten(n);
    if (!r) return { ok: false, text: '' };
    if (r.status === 'verbuendet') return { ok: true, text: this.rivaleText('verbuendet', n) };
    if (r.siege < R.buendnis_siege) return { ok: false, text: this.rivaleText('buendnis_nein', n) };
    r.status = 'verbuendet';
    this.emit('changed');
    return { ok: true, text: this.rivaleText('buendnis_ja', n) };
  },

  /** Als Verbündeter: manchmal eine Zutat deines nächsten Tranks. */
  rivaleGeschenk(n, rng = Math.random) {
    if (rng() >= R.geschenk) return { text: this.rivaleText('kein_geschenk', n) };
    const id = this.rivaleZutatGeben(n);
    if (!id) return { text: this.rivaleText('kein_geschenk', n) };
    this.emit('changed');
    return { text: this.rivaleText('geschenk', n), beute: this.item(id).name };
  },

  /** Für das Notizbuch: der Rivale des handelnden Spielers. */
  rivaleUebersicht(n = this.acting ?? 1) {
    const r = this.rivaleDaten(n);
    if (!r) return null;
    const ruht = this.rivaleTagNr() <= r.ruhe_bis;
    return { nr: n, pid: r.pid, name: rivaleName(r.pid, n), seq: r.seq, getroffen: r.getroffen, siege: r.siege, niederlagen: r.niederlagen, status: r.status === 'verbuendet' ? 'verbuendet' : ruht ? 'ruht' : 'rivale' };
  },

  serializeRivalen() {
    return { rivalen: cleanRivalen(this.rivalen) };
  },

  loadRivalen(data) {
    this.rivalen = cleanRivalen(data?.rivalen);
  },
};
