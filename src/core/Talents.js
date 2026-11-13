// Welt-Fähigkeiten: Was ein Pfad außerhalb des Kampfes kann (Erkundung, Ermittlung, Handel, Reisen).
//
// Jede erreichte Sequenz bringt eine Welt-Fähigkeit (`talent` an der Sequenz, Daten in
// data/packs/sequenzen/faehigkeiten2.json). Eingesetzt wird sie im Pfad-Tab des Notizbuchs.
// Sie kostet Nerven und Unruhe und klingt danach eine Weile ab (Sekunden Spielzeit, Menüs und Kämpfe zählen nicht).
//
// Wirkungen (mehrere je Fähigkeit möglich):
// - buff / buff2 {key, value, seconds}: zeitweiliges Passiv, zählt in state.passive() wie eine Sequenz-Passive
// - calm n: Unruhe -n · nerves_gain n: Nerven +n · heal_pct p: Leben +p·maxHp
// - hint: nächster offener Schritt des wichtigsten Auftrags · review: eine Vermutung ohne zweite Quelle
// - reveal s: verborgene Spuren s Sekunden ohne Geistsicht sichtbar (WorldScene fragt state.seesHidden())
// - scare s: gewöhnliche Gegner auf der Karte weichen s Sekunden (Roamers fragt state.scaresEnemies())
// - clock s: Uhr der Stadt steht s Sekunden (Treffen, Fahndung, Tageszeit; Gatherings/Wanted fragen state.clockStopped())
// - digest n: Verdauung +n · wanted n: Fahndung n Stufen (negativ) · money [min, max]: Schilling
// - scout: die Karte zählt ihre Gegner (Ereignis 'talent', die WorldScene antwortet mit einer Meldung)
//
// Abklingzeiten und Buffs gehören jedem Spieler selbst (talentCd, buffs in Party.PERSONAL); Sichtbarkeit,
// Furcht und die stehende Uhr gelten für die ganze Karte.
import { DECAY_PER_LOCK } from './Wanted.js';
import { digestSlowdown, fmtDigest, TALENT_DIGEST_PER_NERVES, TALENT_DIGEST_SPAN } from './Pathways.js';

/** Ab Wexmoor (Flag kapitel1_done): Schilling je Punkt `conclusion_honor` und Schlussfolgerung (Ansehen zählt dort nicht mehr). */
export const CONCLUSION_SCHILLING = 30;

/** Lesbare Beschreibung eines zeitweiligen Passivs (für Pfad-Tab und Meldungen). */
export const BUFF_LABELS = {
  unruhe_gain: (v) => (v === 0 ? 'Keine neue Unruhe' : `Unruhe steigt ${Math.round((1 - v) * 100)} % langsamer`),
  vision_cost: (v) => `Geistsicht kostet ${Math.round((1 - v) * 100)} % weniger Nerven`,
  price: (v) => `Händler verlangen ${Math.round((1 - v) * 100)} % weniger`,
  sell: (v) => `Verkauf bringt ${Math.round((v - 1) * 100)} % mehr`,
  lock_bonus: (v) => `Schlösser öffnen sich mit ${v} Ansehen weniger, Fahndung sinkt ${Math.round(v * DECAY_PER_LOCK * 100)} % schneller`,
  money_bonus: (v) => `+${Math.round((v - 1) * 100)} % Schilling aus Beute und Belohnungen`,
  dodge_window: (v) => `Ausweichfenster +${Math.round((v - 1) * 100)} %`,
  damage_taken: (v) => `${Math.round((1 - v) * 100)} % weniger Schaden`,
  dmg_mult: (v) => `+${Math.round((v - 1) * 100)} % Schaden`,
  occult_mult: (v) => `+${Math.round((v - 1) * 100)} % Schaden gegen Okkultes`,
  carry: (v) => `+${v} Pfund Tragkraft`,
  heal_bonus: (v) => `Heilmittel wirken ${Math.round((v - 1) * 100)} % stärker`,
  honor_loss: (v) => `nur ${Math.round(v * 100)} % Ansehensverlust, Grauspäher erkennen dich langsamer`,
  conclusion_honor: (v) => `+${v} Ansehen je Schlussfolgerung (ab Wexmoor +${v * CONCLUSION_SCHILLING} Schilling)`,
  composure_regen: (v) => `Nerven erholen sich ${Math.round((v - 1) * 100)} % schneller`,
  hurry_cost: (v) => (v === 0 ? 'schnelle Reise kostet keine Nerven' : `schnelle Reise kostet ${Math.round((1 - v) * 100)} % weniger Nerven`),
  atk: (v) => `+${v} Angriff`,
  parry_ap: (v) => `Paraden geben ${v} Konzentration mehr`,
  ap_start: (v) => `Kämpfe beginnen mit +${v} Konzentration`,
  always_flee: () => 'aus jedem Kampf fliehen',
  schattengestalt: () => 'Schattengestalt: Gegner und Streifen sehen dich nicht',
};
export const buffLabel = (b) => (BUFF_LABELS[b.key] ? BUFF_LABELS[b.key](b.value) : `${b.key} ${b.value}`);

/** Ab dieser Verdauung der Sequenz gilt `talent_50` statt `talent`. */
export const TALENT_UPGRADE_DIGEST = 50;

export const fmtSec = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(Math.ceil(s % 60)).padStart(2, '0')} min` : `${Math.ceil(s)} s`);

export const talentMethods = {
  resetTalents() {
    this.talentTime = 0; // läuft immer (auch wenn die Uhr der Stadt steht), für Abklingzeiten und Buffs
    this.talentCd = {}; // id -> talentTime, ab dem die Fähigkeit wieder bereit ist
    this.buffs = []; // [{key, value, until, source}]
    this.revealUntil = 0;
    this.scareUntil = 0;
    this.clockFrozen = 0; // Sekunden, die die Uhr der Stadt noch steht
  },

  /** Welt-Fähigkeiten aller erreichten Sequenzen, von 9 abwärts: [{...talent, seq, ready, remaining}] */
  talents() {
    this.talentCd ??= {};
    return this.reachedSeqs().filter((s) => s.talent).map((s) => {
      // `talent_50` ersetzt die Fähigkeit, sobald die Sequenz zur Hälfte verdaut ist (Schlüssel Seq 5: Schattengestalt)
      const upgraded = s.talent_50 && (this.pathway.seq < s.seq || (this.pathway.digestion ?? 0) >= TALENT_UPGRADE_DIGEST);
      if (upgraded) s = { ...s, talent: s.talent_50 };
      const remaining = Math.max(0, (this.talentCd[s.talent.id] ?? 0) - this.talentTime);
      return { ...s.talent, seq: s.seq, remaining, remainingText: remaining ? fmtSec(remaining) : '', ready: remaining <= 0 && this.composure >= (s.talent.nerves ?? 0) };
    });
  },

  talentDef(id) {
    return this.talents().find((t) => t.id === id) ?? null;
  },

  /** Warum eine Fähigkeit gerade nicht geht (oder null). */
  talentBlock(id) {
    const t = this.talentDef(id);
    if (!t) return 'Diese Fähigkeit hast du nicht.';
    if (t.remaining > 0) return `Noch nicht bereit (${t.remainingText}).`;
    if (this.composure < (t.nerves ?? 0)) return `Dafür fehlen dir die Nerven (${t.nerves} nötig).`;
    return null;
  },

  /** Setzt eine Welt-Fähigkeit ein. rng für Schilling-Funde. Ergebnis: { ok, text, parts? } */
  useTalent(id, rng = this.rng ?? Math.random) {
    const block = this.talentBlock(id);
    if (block) return { ok: false, text: block };
    const t = this.talentDef(id);
    this.talentCd ??= {};
    this.buffs ??= [];
    this.talentCd[id] = this.talentTime + (t.cooldown ?? 60);
    if (t.nerves) this.setComposure(this.composure - t.nerves);
    if (t.unruhe) this.setUnruhe(this.unruhe + t.unruhe);
    const parts = [];
    for (const b of [t.buff, t.buff2].filter(Boolean)) {
      // Dieselbe Wirkung derselben Quelle wird erneuert, nicht gestapelt
      this.buffs = this.buffs.filter((x) => !(x.source === id && x.key === b.key));
      this.buffs.push({ key: b.key, value: b.value, until: this.talentTime + b.seconds, source: id });
      parts.push(`${buffLabel(b)} (${fmtSec(b.seconds)})`);
    }
    if (t.calm && this.unruhe > 0) { const before = this.unruhe; this.setUnruhe(this.unruhe - t.calm); parts.push(`-${Math.round(before - this.unruhe)} Unruhe`); }
    if (t.nerves_gain) { const before = this.composure; this.setComposure(this.composure + t.nerves_gain); parts.push(`+${Math.round(this.composure - before)} Nerven`); }
    if (t.heal_pct) { const got = this.heal(Math.max(1, Math.round(this.maxHp * t.heal_pct))); if (got) parts.push(`+${got} Leben`); }
    if (t.reveal) { this.revealUntil = Math.max(this.revealUntil, this.talentTime + t.reveal); parts.push(`verborgene Spuren ${fmtSec(t.reveal)} sichtbar`); this.emit('vision', this.spiritVision); }
    if (t.scare) { this.scareUntil = Math.max(this.scareUntil, this.talentTime + t.scare); parts.push(`Gegner weichen ${fmtSec(t.scare)}`); }
    if (t.clock) { this.clockFrozen = Math.max(this.clockFrozen, t.clock); parts.push(`die Uhr der Stadt steht ${fmtSec(t.clock)}`); }
    // Die eigene Kraft außerhalb des Kampfes zu wirken, verdaut den Trank: je 10 Nerven Einsatz ein Schritt
    if (this.pathway) {
      const amount = Math.min(TALENT_DIGEST_SPAN[1], Math.max(TALENT_DIGEST_SPAN[0], (t.nerves ?? 0) / TALENT_DIGEST_PER_NERVES));
      const got = this.act('talent', amount);
      if (got > 0) parts.push(`+${fmtDigest(got)} % verdaut`);
    }
    if (t.digest && this.pathway) {
      const p = this.pathway;
      const before = p.digestion;
      // Fähigkeiten verdauen auf tiefen Sequenzen genauso gebremst wie Handlungen (siehe DIGEST_RATE)
      p.digestion = Math.min(100, p.digestion + t.digest * digestSlowdown(p.seq) * this.p2DigestMult());
      if (p.digestion > before) { parts.push(`+${fmtDigest(p.digestion - before)} % verdaut`); this.emit('digest', { value: p.digestion, delta: p.digestion - before, kind: 'talent', player: this.acting ?? 1 }); }
      if (before < 100 && p.digestion >= 100) this.emit('digested', { ...p, player: this.acting ?? 1 });
    }
    if (t.wanted && this.wanted > 0) { const before = this.wanted; this.setWanted(this.wanted + t.wanted, t.name); parts.push(`Fahndung -${before - this.wanted}`); }
    if (t.money) {
      const [min, max] = t.money;
      const n = min + Math.floor(rng() * (max - min + 1));
      const got = this.addMoney(n, { loot: true, reason: t.name });
      parts.push(`+${got} Schilling`);
    }
    if (t.hint) { const h = this.nextHint(); parts.push(h ? `${h.quest}: ${h.text}` : 'Kein offener Schritt. Du hast gerade alles getan, was zu tun war.'); }
    if (t.review) {
      const open = this.content.cases.flatMap((c) => this.knownFacts(c.id)).filter((f) => this.factStatus(f) === 'suspected');
      parts.push(open.length ? `Vermutung: „${this.fact(open[Math.floor(rng() * open.length)]).text}“ (eine zweite Quelle fehlt noch)` : 'Keine offene Vermutung: Alles, was du weißt, ist bestätigt oder widerlegt.');
    }
    if (t.scout) this.emit('talent', { id, effect: 'scout', player: this.acting ?? 1 });
    this.emit('talent', { id, effect: 'used', player: this.acting ?? 1 });
    this.emit('changed');
    return { ok: true, text: `${t.name}: ${parts.join(' · ')}`, parts };
  },

  /** Zeitweilige Passive, die gerade wirken: [{key, value, until, source, remainingText}] */
  activeBuffs() {
    this.buffs ??= [];
    return this.buffs.filter((b) => b.until > this.talentTime).map((b) => ({ ...b, remainingText: fmtSec(b.until - this.talentTime) }));
  },

  /** Für state.passive(): die Werte der laufenden Buffs. */
  buffEffects() {
    return this.activeBuffs().map((b) => ({ key: b.key, value: b.value }));
  },

  /** Sind verborgene Spuren gerade sichtbar (Geistsicht oder eine Welt-Fähigkeit)? */
  seesHidden() {
    return !!this.spiritVision || this.revealUntil > this.talentTime;
  },

  /** Weichen gewöhnliche Gegner gerade vor dir zurück (Welt-Fähigkeit)? */
  scaresEnemies() {
    return this.scareUntil > this.talentTime;
  },

  /** Ist Spieler n gerade in der Schattengestalt (unsichtbar für Gegner und Streifen)? Buffs gehören jedem Spieler selbst. */
  inShadow(n = 1) {
    const own = n === (this.acting ?? 1) ? this.buffs : this.p2?.buffs;
    return (own ?? []).some((b) => b.key === 'schattengestalt' && b.until > (this.talentTime ?? 0));
  },

  /** Steht die Uhr der Stadt (Treffen, Fahndung, Tageszeit)? */
  clockStopped() {
    return this.clockFrozen > 0;
  },

  /** Wird aus tick() aufgerufen, vor allem anderen. */
  tickTalents(dt) {
    this.talentTime = (this.talentTime ?? 0) + dt;
    if (this.clockFrozen > 0) this.clockFrozen = Math.max(0, this.clockFrozen - dt);
    const wasRevealing = this.revealing;
    this.revealing = this.revealUntil > this.talentTime;
    if (wasRevealing && !this.revealing) this.emit('vision', this.spiritVision); // Karte blendet die Spuren wieder aus
    this.buffs = (this.buffs ?? []).filter((b) => b.until > this.talentTime);
    if (this.p2) this.p2.buffs = (this.p2.buffs ?? []).filter((b) => b.until > this.talentTime);
  },

  serializeTalents() {
    return { talentTime: Math.round(this.talentTime), talentCd: this.talentCd, buffs: this.buffs, revealUntil: Math.round(this.revealUntil), scareUntil: Math.round(this.scareUntil), clockFrozen: Math.round(this.clockFrozen) };
  },

  loadTalents(data) {
    this.talentTime = data.talentTime ?? 0;
    this.talentCd = { ...(data.talentCd ?? {}) };
    this.buffs = [...(data.buffs ?? [])];
    this.revealUntil = data.revealUntil ?? 0;
    this.scareUntil = data.scareUntil ?? 0;
    this.clockFrozen = data.clockFrozen ?? 0;
  },
};
