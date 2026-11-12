// Kapitel 4 (Seb, 2026-11-12): In Calderwick muss jeder Spieler in das Gebiet seines eigenen Pfades. Darum teilt sich zu zweit
// zum ersten Mal der Bildschirm: zwei Kameras, beide Spieler auf verschiedenen Karten gleichzeitig. Der Splitscreen endet für
// immer, wenn BEIDE ihr Seq-3-Ritual geschafft haben (beide auf Sequenz 3 oder höher); dann wird das Bild wieder eins.
//
// Technik: Solange der Splitscreen läuft (splitOn), hat Spieler 2 eine eigene Karte, eine eigene Ankunftsstelle und eine eigene
// Position in this.p2 (map, spawn, position). withPlayer(2) tauscht sie mit, sodass alles, was für Spieler 2 rechnet (Rituale,
// Kämpfe, Gespräche), seine Karte sieht. Die zweite Weltszene (world2) arbeitet auf p2View(state): einem Blick auf den Spielstand,
// der dauerhaft Spieler 2 ist.
import { PERSONAL } from './Party.js';

export const SPLIT_KEYS = ['map', 'spawn', 'position'];
export const SPLIT_ENDE_FLAG = 'split_vorbei';
export const SPLIT_STADT = 'calderwick';

const cityOf = (s, map) => s.content.maps[map]?.city ?? 'kettlegate';
const seqOf = (p) => p?.seq ?? 9;

export const splitMethods = {
  /** Soll der Bildschirm gerade geteilt sein? Zu zweit, in Calderwick, bis beide Seq 3 erreicht haben. */
  splitSoll() {
    if (!this.hasP2?.() || !this.flags.has('k4_arrived') || this.flags.has(SPLIT_ENDE_FLAG)) return false;
    return cityOf(this, this.map) === SPLIT_STADT;
  },

  /** Seq 3 bei beiden: der Splitscreen endet. Spieler 1 und 2 aus Sicht des Spielstands (ohne Tausch). */
  splitBeideSeq3() {
    return seqOf(this.pathway) <= 3 && seqOf(this.p2?.pathway) <= 3;
  },

  /** Einmal je Tick, nur ohne laufenden Tausch: Splitscreen an- oder ausschalten. Gibt true zurück, wenn sich etwas geändert hat. */
  splitTick() {
    if (this.acting !== 1) return false;
    if (this.hasP2?.() && this.flags.has('k4_arrived') && !this.flags.has(SPLIT_ENDE_FLAG) && this.splitBeideSeq3()) {
      this.flags.add(SPLIT_ENDE_FLAG);
      if (this.splitOn) this.emit('notice', 'Ihr habt beide das Ritual der dritten Sequenz geschafft. Ihr seid Heilige, und der Bildschirm wird wieder eins.');
    }
    const soll = this.splitSoll();
    if (soll === !!this.splitOn) return false;
    if (soll) {
      // Spieler 2 beginnt dort, wo Spieler 1 gerade steht
      Object.assign(this.p2, { map: this.p2.map && this.content.maps[this.p2.map] ? this.p2.map : this.map, spawn: this.p2.spawn ?? this.spawn, position: this.p2.position ?? null });
      this.splitOn = true;
      this.emit('notice', 'Calderwick trennt euch: Jeder muss in das Gebiet seines eigenen Pfades. Der Bildschirm teilt sich (Spieler 1 links mit WASD und E, Spieler 2 rechts mit Pfeilen und Enter).');
    } else {
      this.splitOn = false;
      for (const k of SPLIT_KEYS) delete this.p2?.[k];
    }
    this.emit('split', this.splitOn);
    return true;
  },
};

/**
 * Blick auf den Spielstand, der dauerhaft Spieler 2 ist: persönliche Werte, Karte, Ankunftsstelle und Position kommen aus p2.
 * Methoden laufen mit diesem Blick als `this`, sie sehen also überall Spieler 2. `acting` meldet 2, damit withPlayer(2) nicht noch einmal tauscht.
 */
export function p2View(state) {
  const keys = new Set([...PERSONAL, ...SPLIT_KEYS]);
  const own = (t, k) => keys.has(k) && t.acting === 1 && t.p2;
  return new Proxy(state, {
    get(t, k, r) {
      if (k === 'acting') return 2;
      if (k === 'isP2View') return true;
      if (own(t, k)) return t.p2[k];
      return Reflect.get(t, k, r);
    },
    set(t, k, v) {
      if (own(t, k)) t.p2[k] = v;
      else t[k] = v;
      return true;
    },
  });
}
