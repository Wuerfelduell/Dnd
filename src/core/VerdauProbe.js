// Verdauungs-Herausforderung im Pfadviertel (Seb 2026-11-26): In jedem Calderwicker Pfadviertel steht ein Prüfstein.
// Wer auf diesem Pfad ist (Seq 4 oder höher), kann sich einmal je Spieltag einer pfadtypischen Kampfprüfung stellen:
// solo, unter der Regel des Pfades, gegen einen harten Gegner des Viertels. Bestanden: sofort 15 % des Tranks verdaut.
// Misslungen (verloren, geflohen oder Regel gebrochen): ein Trostpreis von 1 bis 5 % (zufällig).
// Abklingzeit: ein Versuch je Spieltag (30 Minuten Spielzeit) und Spieler. 15 % sind auf Seq 4 so viel wie dutzende Bosse,
// darum kein Spam; einmal am Tag hält es als feste Gewohnheit neben der Jagd, ohne die langsame Verdauung auszuhebeln.
// Funktioniert im Splitscreen: der Versuch hängt am Pfad des Spielers, der den Prüfstein berührt (Combat.combatBy).
import { VERDAU_PROBE, verdauEncId, verdauStufeMult } from '../data/verdauProbe.js';
import { VIERTEL_VERDAU, viertelArt } from '../data/seq3Weg.js';

const tagId = (p2, pid) => `verdau_${p2 ? 'p2_' : ''}${pid}`;

export const verdauProbeMethods = {
  /**
   * Viertel-Resonanz (data/seq3Weg.js, Seb 2026-11-27): Sieg im eigenen Pfadviertel auf Seq 4 verdaut fest, Herde, Rangprüfungen
   * und Bosse beim ersten Sieg deutlich mehr. Gilt für den Spieler, dessen Werte gerade gelten (Combat ruft es je Kämpfer).
   */
  viertelVerdau(encId, enc, first) {
    const p = this.pathway;
    if (!p || p.seq !== 4 || !enc || enc.practice || enc.verdau_probe) return 0;
    if (!encId.startsWith(`o3_${p.id}_`)) return 0;
    const art = viertelArt(encId);
    const pct = VIERTEL_VERDAU.sieg + (first && art ? VIERTEL_VERDAU.erst[art] : 0);
    return this.addDigestion(pct, first && art ? 'viertel_erst' : 'viertel_sieg');
  },

  /** Kann dieser Spieler heute die Prüfung des Viertels `pid` ablegen? Gibt null oder den Grund. */
  verdauProbeBlock(pid) {
    const p = this.pathway;
    if (!p || p.id !== pid || p.seq > 4) return 'Der Prüfstein schweigt. Er antwortet nur Beyondern dieses Pfades ab der vierten Sequenz.';
    if (p.seq < 4) return 'Der Prüfstein schweigt. Ab der dritten Sequenz hat er dir nichts mehr zu geben.'; // Seb 2026-11-27: nur Seq 4
    if (p.digestion >= 100) return 'Dein Trank ist schon vollständig verdaut. Der Prüfstein hat dir nichts mehr zu geben.';
    if (this.dailyDone(tagId(this.acting === 2, pid))) return 'Der Prüfstein ist noch kalt von deinem letzten Versuch. Morgen wieder.';
    return null;
  },

  /** Effekt `verdau_probe: pid` (Prüfstein im Viertel): Versuch verbrauchen und den Kampf starten. */
  startVerdauProbe(pid) {
    const why = this.verdauProbeBlock(pid);
    if (why) { this.emit('notice', `${this.acting === 2 ? 'Spieler 2: ' : ''}${why}`); return false; }
    this.markDaily(tagId(this.acting === 2, pid));
    this.emit('notice', `${this.acting === 2 ? 'Spieler 2: ' : ''}${this.verdauStufeText(this.verdauStufe())}`);
    this.pathway.verdauPending = verdauEncId(pid);
    this.startCombat(verdauEncId(pid));
    return true;
  },

  /** Kampfregeln der laufenden Prüfung (Combat fragt zuerst hier). */
  verdauCombatRules(id) {
    if (!this.pathway || this.pathway.verdauPending !== id) return null;
    const def = VERDAU_PROBE[this.pathway.id];
    if (!def) return null;
    const base = def.scale[this.pathway.seq] ?? def.scale[4];
    const stufe = this.verdauStufe();
    const m = verdauStufeMult(stufe);
    return { solo: true, verdau: true, verdauStufe: stufe, scale: { hp: base.hp * m.hp, dmg: base.dmg * m.dmg }, ...def.rules };
  },

  /** Stufe des Prüfsteins für den handelnden Spieler: 1 + bisherige Siege (gilt für alle Viertel gemeinsam). */
  verdauStufe() {
    return 1 + (this.pathway?.verdauSiege ?? 0);
  },

  verdauStufeText(stufe) {
    const m = verdauStufeMult(stufe);
    return `Prüfstein Stufe ${stufe}: Gegner mit ${Math.round(m.hp * 100)} % Leben und ${Math.round(m.dmg * 100)} % Schaden.`;
  },

  /** Nach dem Kampf (Combat.finish, im Splitscreen schon mit dem Stand des Prüflings): auswerten. */
  verdauCombatEnd(combat, rng = Math.random) {
    const p = this.pathway;
    if (!p?.verdauPending || p.verdauPending !== combat.id) return null;
    delete p.verdauPending;
    const def = VERDAU_PROBE[p.id];
    const r = combat.rules ?? {};
    let fail = null;
    if (combat.ruleBroken) fail = combat.ruleBroken;
    else if (r.spare && combat.outcome === 'won') fail = `${combat.enc.name} ist tot. Die Maske verlangt, dass du verschonst.`;
    else if (!(combat.outcome === 'won' || (r.spare && combat.outcome === 'spared'))) fail = combat.outcome === 'lost' ? 'Verloren.' : 'Geflohen.';
    else if (r.minItems && (combat.itemsUsedTotal ?? 0) < r.minItems) fail = `Nur ${combat.itemsUsedTotal ?? 0} Gegenstände benutzt, verlangt waren ${r.minItems}.`;
    else if (r.minKillRound && combat.round < r.minKillRound) fail = `Zu früh gesiegt (Runde ${combat.round}, verlangt ab Runde ${r.minKillRound}).`;
    else if (r.endMin && this.hp < this.maxHp * (r.endMin.hp ?? 0)) fail = 'Zu wenig Leben am Ende.';
    else if (r.endMin && this.composure < this.maxComposure() * (r.endMin.nerves ?? 0)) fail = 'Zu wenig Nerven am Ende.';
    if (!fail) {
      this.addDigestion(VERDAU_PROBE_WIN, 'verdau_probe');
      p.verdauSiege = (p.verdauSiege ?? 0) + 1;
      this.sfx?.('probe_bestanden');
      return `${def?.name ?? 'Prüfstein'}: bestanden. +${VERDAU_PROBE_WIN} % Verdauung. Der Prüfstein wächst: nächstes Mal Stufe ${p.verdauSiege + 1}.`;
    }
    const trost = 1 + Math.floor(rng() * 5);
    this.addDigestion(trost, 'verdau_trost');
    this.sfx?.('probe_fehlversuch');
    return `${def?.name ?? 'Prüfstein'}: misslungen. ${fail} Trostpreis: +${trost} % Verdauung. Morgen darfst du es wieder versuchen.`;
  },
};

export const VERDAU_PROBE_WIN = 15;
