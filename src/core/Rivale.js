// Rivale auf dem eigenen Pfad (Daten und Regeln in data/rivale.js).
// Zustand `rivalen` (gemeinsam für beide Spieler, je Pfad einer): { [pfad]: { seq, tag, status, siege, niederlagen, … } }.
// Alles, was würfelt, würfelt mit festem Startwert je Spieltag (bzw. je Treffen), damit Neuladen nichts ändert.
import { seeded } from './Gatherings.js';
import { DAY_SECONDS } from './Clock.js';
import { RIVALEN, RIVALE_REGELN as R, rivaleEncId, rivaleText } from '../data/rivale.js';

const TAG_FELDER = ['tag', 'ruhe_bis', 'stahl_tag', 'treff_tag', 'kreis_frei', 'kreis_besetzt', 'kreis_kampf'];

/** Gespeicherte Rivalen säubern (alte Stände haben keine). */
export function cleanRivalen(data) {
  const out = {};
  for (const [pid, r] of Object.entries(data ?? {})) {
    if (!RIVALEN[pid] || !r || typeof r !== 'object') continue;
    const n = (v, d) => (Number.isFinite(v) ? v : d);
    out[pid] = {
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

  /** Pfade der Spieler (Spieler 2 nur, wenn er mitspielt), ohne doppelte. */
  rivalePfade() {
    if (!this.flags.has(R.ab_flag)) return [];
    const pws = [this.pathway, this.p2?.active ? this.p2.pathway : null].filter((pw) => pw?.id && RIVALEN[pw.id] && pw.seq);
    return [...new Set(pws.map((pw) => pw.id))];
  },

  /** Niedrigste (also weiteste) Sequenz der Spieler auf diesem Pfad, sonst null. */
  rivaleSpielerSeq(pid) {
    const seqs = [this.pathway, this.p2?.active ? this.p2.pathway : null].filter((pw) => pw?.id === pid && pw.seq).map((pw) => pw.seq);
    return seqs.length ? Math.min(...seqs) : null;
  },

  /** Der Rivale dieses Pfades, auf den heutigen Spieltag gebracht (oder null vor Wexmoor / ohne Spieler auf dem Pfad). */
  rivaleDaten(pid) {
    if (!RIVALEN[pid] || !this.flags.has(R.ab_flag)) return null;
    const ps = this.rivaleSpielerSeq(pid);
    if (ps === null) return null;
    const tag = this.rivaleTagNr();
    this.rivalen ??= {};
    let r = this.rivalen[pid];
    if (!r) {
      r = cleanRivalen({ [pid]: { seq: ps } })[pid];
      r.tag = tag;
      this.rivalen[pid] = r;
    }
    // Parallel aufsteigen: hinterher → je Tag eine Sequenz auf; gleichauf → manchmal eine voraus (nie mehr als eine)
    if (r.tag < tag - 60) r.tag = tag - 60; // lange Pausen nicht Tag für Tag nachrechnen
    while (r.tag < tag) {
      r.tag++;
      if (r.seq > ps) r.seq--;
      else if (r.seq > Math.max(1, ps - 1) && seeded(`${this.seed ?? ''}|rv|${pid}|${r.tag}`)() < R.vorsprung) r.seq--;
    }
    r.seq = Math.max(r.seq, Math.max(1, ps - 1));
    return r;
  },

  /** Arbeitet der Rivale heute gegen dich (kein Bündnis, nicht frisch geschlagen)? */
  rivaleAktiv(pid) {
    const r = this.rivaleDaten(pid);
    if (!r || r.status !== 'rivale' || this.rivaleTagNr() <= r.ruhe_bis) return null;
    return r;
  },

  /** Zutaten des nächsten Tranks dieses Pfades (Spieler auf dem Pfad), ohne die Hauptzutat. */
  rivaleNebenzutaten(pid) {
    const ps = this.rivaleSpielerSeq(pid);
    const f = ps ? this.item(`formel_${pid}_${ps - 1}`) : null;
    return Object.keys(f?.ingredients ?? {}).slice(1).filter((id) => this.item(id));
  },

  /** Auf dem Markt oder einem Treffen: hat der Rivale dieses Angebot heute (bzw. auf diesem Treffen) weggekauft? */
  rivaleWeggekauft(merchantId, e) {
    const pid = this.pathway?.id;
    if (!pid || !e?.item || e.locked || e.owned || !this.rivaleAktiv(pid)) return false;
    const f = this.item(`formel_${pid}_${this.pathway.seq - 1}`);
    if (!f?.ingredients || !(e.item in f.ingredients)) return false;
    const m = this.merchant(merchantId);
    if (!m) return false;
    const relevant = [...new Set(this.merchantStock(merchantId).map((x) => x.item).filter((id) => id in f.ingredients))].sort();
    if (!relevant.length) return false;
    const runde = m.gathering ? `t${this.marketCycle()}` : `d${this.rivaleTagNr()}`;
    const rng = seeded(`${this.seed ?? ''}|rvm|${pid}|${merchantId}|${runde}`);
    if (rng() >= (m.gathering ? R.treffen : R.markt)) return false;
    return relevant[Math.floor(rng() * relevant.length)] === e.item;
  },

  /**
   * Ritual (Pathways.performRitual, wenn alles bereitsteht): Ist der Rivale gleichauf oder voraus, steht er manchmal
   * schon im Kreis. Ergebnis wie performRitual ({ ok: false, fight, text }) oder null, wenn er nicht stört.
   */
  rivaleImKreis(pid, seq) {
    if (this.testmodus) return null;
    const r = this.rivaleAktiv(pid);
    if (!r) return null;
    const tag = this.rivaleTagNr();
    if (r.kreis_frei === tag) return null;
    if (r.kreis_besetzt === tag) return { ok: false, text: rivaleText('ritual_besetzt', pid) };
    if (r.seq > seq + 1) return null; // noch hinter dir: kein Grund, dir zuvorzukommen
    if (seeded(`${this.seed ?? ''}|rvk|${pid}|${tag}`)() >= R.ritual) return null;
    const id = rivaleEncId(pid, r.seq);
    if (!this.content.encounters[id]) return null;
    r.kreis_kampf = tag;
    this.startCombat(id);
    return { ok: false, fight: id, text: rivaleText('ritual', pid) };
  },

  /** Combat.finish: Sieg, Niederlage oder Flucht gegen den Rivalen. Gibt einen Zusatztext zurück. */
  rivaleKampfEnde(combat) {
    const pid = combat?.enc?.rivale;
    const r = pid ? this.rivalen?.[pid] : null;
    if (!r) return null;
    const tag = this.rivaleTagNr();
    const imKreis = r.kreis_kampf === tag;
    r.kreis_kampf = -1;
    const out = [];
    if (combat.outcome === 'won') {
      r.siege++;
      r.ruhe_bis = tag + R.ruhe_tage;
      if (imKreis) { r.kreis_frei = tag; out.push(rivaleText('ritual_frei', pid)); }
      if (r.status === 'rivale' && r.siege === R.buendnis_siege) out.push(rivaleText('sieg_respekt', pid));
    } else {
      if (combat.outcome === 'lost') r.niederlagen++;
      if (imKreis) { r.kreis_besetzt = tag; out.push(rivaleText('ritual_besetzt', pid)); }
    }
    this.emit('changed');
    return out.join('\n\n') || null;
  },

  /** Begegnung beim Betreten einer Straße (ab Wexmoor, höchstens einmal am Tag je Rivale). { pid, treffen } oder null. */
  rivaleBegegnung(mapId, rng = Math.random) {
    const m = this.content.maps?.[mapId];
    if (!m?.city || m.city === 'kettlegate' || m.danger) return null;
    const treffen = mapId.startsWith('treffen_');
    if (!treffen && !(m.patrols || m.passanten || m.facades || m.police)) return null;
    const tag = this.rivaleTagNr();
    for (const pid of this.rivalePfade()) {
      const r = this.rivaleDaten(pid);
      if (!r || r.treff_tag === tag) continue;
      const chance = !r.getroffen ? 1 : treffen ? R.begegnung_treffen : R.begegnung;
      if (rng() < chance) return { pid, treffen };
    }
    return null;
  },

  /** Die Begegnung findet statt: Text und Möglichkeiten. Merkt den Tag (einmal am Tag). */
  rivaleTreffen(pid, { treffen = false } = {}) {
    const r = this.rivaleDaten(pid);
    if (!r) return null;
    const tag = this.rivaleTagNr();
    const erste = !r.getroffen;
    r.getroffen = true;
    r.treff_tag = tag;
    const ps = this.rivaleSpielerSeq(pid);
    const ruht = tag <= r.ruhe_bis;
    let key = r.seq < ps ? 'voraus' : r.seq > ps ? 'hinter' : 'gleich';
    if (treffen) key = 'treffen';
    if (ruht) key = 'geschlagen';
    if (erste) key = 'erste';
    const lage = { pid, name: RIVALEN[pid].name, seq: r.seq, status: r.status, text: rivaleText(key, pid), optionen: [] };
    if (r.status === 'verbuendet') {
      const g = this.rivaleGeschenk(pid, seeded(`${this.seed ?? ''}|rvg|${pid}|${tag}`));
      lage.text = `${rivaleText('verbuendet', pid)}\n\n${g.text}`;
      lage.beute = g.beute;
      lage.optionen = ['gehen'];
      return lage;
    }
    if (!ruht) lage.optionen.push('kampf');
    if (r.stahl_tag !== tag) lage.optionen.push('stehlen');
    lage.optionen.push('buendnis', 'gehen');
    lage.stehlChance = this.rivaleStehlChance(pid);
    this.emit('changed');
    return lage;
  },

  rivaleStehlChance(pid) {
    const r = this.rivalen?.[pid];
    const ps = this.rivaleSpielerSeq(pid);
    if (!r || ps === null) return 0;
    const c = R.stehlen_basis + R.stehlen_je_seq * (r.seq - ps) + (['schluessel', 'maske'].includes(pid) ? R.stehlen_pfad : 0);
    return Math.min(R.stehlen_max, Math.max(R.stehlen_min, c));
  },

  /** Führt fn als der Spieler aus, der diesen Pfad geht (im Koop vielleicht Spieler 2). */
  rivaleAlsSpieler(pid, fn) {
    if (this.pathway?.id !== pid && this.p2?.active && this.p2.pathway?.id === pid) return this.withPartner(fn);
    return fn();
  },

  /** Eine Nebenzutat des nächsten Tranks in die Tasche: die, von der am meisten fehlt. */
  rivaleZutatGeben(pid) {
    return this.rivaleAlsSpieler(pid, () => {
      const f = this.item(`formel_${pid}_${(this.pathway?.seq ?? 0) - 1}`);
      const ids = this.rivaleNebenzutaten(pid);
      if (!f || !ids.length) return null;
      const id = [...ids].sort((a, b) => (f.ingredients[b] - this.itemCount(b)) - (f.ingredients[a] - this.itemCount(a)))[0];
      this.addItem(id);
      return id;
    });
  },

  /** Bestehlen: einmal am Tag. Gelingt es, gibt es eine Zutat deines nächsten Tranks; sonst beginnt der Kampf. */
  rivaleStehlen(pid, rng = Math.random) {
    const r = this.rivaleDaten(pid);
    const tag = this.rivaleTagNr();
    if (!r) return { ok: false, text: '' };
    if (r.stahl_tag === tag) return { ok: false, text: rivaleText('stehlen_heute', pid) };
    r.stahl_tag = tag;
    if (rng() < this.rivaleStehlChance(pid)) {
      const id = this.rivaleZutatGeben(pid);
      if (id) { this.emit('changed'); return { ok: true, text: rivaleText('stehlen_ok', pid), beute: this.item(id).name }; }
      const geld = (10 - r.seq) * R.geld_je_seq;
      this.addMoney(geld, { loot: true, reason: RIVALEN[pid].name });
      return { ok: true, text: rivaleText('stehlen_nichts', pid), beute: `+${geld} Schilling` };
    }
    const id = rivaleEncId(pid, r.seq);
    if (this.content.encounters[id]) this.startCombat(id);
    this.emit('changed');
    return { ok: false, fight: id, text: rivaleText('stehlen_fehl', pid) };
  },

  /** Kampf aus der Begegnung heraus. */
  rivaleKampf(pid) {
    const r = this.rivaleDaten(pid);
    const id = r ? rivaleEncId(pid, r.seq) : null;
    if (!id || !this.content.encounters[id]) return null;
    this.startCombat(id);
    return id;
  },

  /** Bündnis anbieten: nimmt er an, kauft er nichts mehr weg, stört kein Ritual und legt manchmal etwas zurück. */
  rivaleBuendnis(pid) {
    const r = this.rivaleDaten(pid);
    if (!r) return { ok: false, text: '' };
    if (r.status === 'verbuendet') return { ok: true, text: rivaleText('verbuendet', pid) };
    if (r.siege < R.buendnis_siege) return { ok: false, text: rivaleText('buendnis_nein', pid) };
    r.status = 'verbuendet';
    this.emit('changed');
    return { ok: true, text: rivaleText('buendnis_ja', pid) };
  },

  /** Als Verbündeter: manchmal eine Zutat deines nächsten Tranks. */
  rivaleGeschenk(pid, rng = Math.random) {
    if (rng() >= R.geschenk) return { text: rivaleText('kein_geschenk', pid) };
    const id = this.rivaleZutatGeben(pid);
    if (!id) return { text: rivaleText('kein_geschenk', pid) };
    this.emit('changed');
    return { text: rivaleText('geschenk', pid), beute: this.item(id).name };
  },

  /** Für das Notizbuch: alle Rivalen der Spieler. */
  rivaleUebersicht() {
    return this.rivalePfade().map((pid) => {
      const r = this.rivaleDaten(pid);
      const ruht = r && this.rivaleTagNr() <= r.ruhe_bis;
      return { pid, name: RIVALEN[pid].name, seq: r?.seq, getroffen: !!r?.getroffen, siege: r?.siege ?? 0, niederlagen: r?.niederlagen ?? 0, status: r?.status === 'verbuendet' ? 'verbuendet' : ruht ? 'ruht' : 'rivale' };
    });
  },

  serializeRivalen() {
    return { rivalen: cleanRivalen(this.rivalen) };
  },

  loadRivalen(data) {
    this.rivalen = cleanRivalen(data?.rivalen);
  },
};
