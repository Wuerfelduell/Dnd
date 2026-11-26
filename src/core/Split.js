// Kapitel 4 (Seb, 2026-11-12): In Calderwick muss jeder Spieler in das Gebiet seines eigenen Pfades. Darum teilt sich zu zweit
// zum ersten Mal der Bildschirm. Seb 2026-11-26: nur in den Pfadvierteln (o3_<pfad>); sobald beide wieder draußen sind, ist das Bild
// wieder gemeinsam: zwei Kameras, beide Spieler auf verschiedenen Karten gleichzeitig. Der Splitscreen endet für
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
/** Pfadviertel (Gildensitz o3_<pfad>) in Calderwick: nur dort teilt sich der Bildschirm (Seb 2026-11-26). */
export const imPfadviertel = (s, map) => !!map && map.startsWith('o3_') && !!s.content.maps[map] && cityOf(s, map) === SPLIT_STADT;

export const splitMethods = {
  /** Darf der Bildschirm sich überhaupt teilen? Zu zweit, nach der Ankunft in Calderwick, bis beide Seq 3 erreicht haben. */
  splitMoeglich() {
    return !!this.hasP2?.() && this.flags.has('k4_arrived') && !this.flags.has(SPLIT_ENDE_FLAG);
  },

  /** Soll der Bildschirm gerade geteilt sein? Seb 2026-11-26: nur solange einer von beiden in einem Pfadviertel steht, sonst gemeinsames Bild. */
  splitSoll() {
    if (!this.splitMoeglich() || cityOf(this, this.map) !== SPLIT_STADT) return false;
    return imPfadviertel(this, this.map) || imPfadviertel(this, this.p2?.map);
  },

  /**
   * Gemeinsames Bild, einer geht durch die Tür eines Pfadviertels: nur er geht hinein, der andere bleibt draußen stehen, und der
   * Bildschirm teilt sich. by = wer die Tür benutzt hat, pos2 = Stelle von Spieler 2 draußen. Gibt true zurück, wenn Spieler 2
   * allein hineingeht (Spieler 1 bleibt dann auf seiner Karte, die Szene wechselt nicht).
   */
  splitBetreten(by, mapId, spawn, pos2) {
    if (this.splitOn || !this.splitMoeglich() || !imPfadviertel(this, mapId) || imPfadviertel(this, this.map)) return false;
    if (by === 2) {
      Object.assign(this.p2, { map: mapId, spawn: spawn ?? 'default', position: null });
      return true;
    }
    Object.assign(this.p2, { map: this.map, spawn: this.spawn, position: pos2 ?? null });
    return false;
  },

  /** Seq 3 bei beiden: der Splitscreen endet. Spieler 1 und 2 aus Sicht des Spielstands (ohne Tausch). */
  splitBeideSeq3() {
    return seqOf(this.pathway) <= 3 && seqOf(this.p2?.pathway) <= 3;
  },

  /** Einmal je Tick, nur ohne laufenden Tausch: Splitscreen an- oder ausschalten. Gibt true zurück, wenn sich etwas geändert hat. */
  splitTick() {
    if (this.acting !== 1 || this.splitKampf) return false; // während ein Spieler in seiner Hälfte kämpft, bleibt das Bild, wie es ist
    if (this.hasP2?.() && this.flags.has('k4_arrived') && !this.flags.has(SPLIT_ENDE_FLAG) && this.splitBeideSeq3()) {
      this.flags.add(SPLIT_ENDE_FLAG);
      if (this.splitOn) this.emit('notice', 'Ihr habt beide das Ritual der dritten Sequenz geschafft. Ihr seid Heilige, und der Bildschirm wird wieder eins.');
    }
    // Seb 2026-11-26: Reist Spieler 2 im Splitscreen in eine andere Stadt (Pendelzug, Lastenzug), kommt Spieler 1 mit.
    // Nie getrennt in zwei Städten. Repariert auch Spielstände, in denen einer in Dunscar und einer in Calderwick steht.
    if (this.hasP2?.() && this.p2?.map && this.content.maps[this.p2.map] && cityOf(this, this.p2.map) !== cityOf(this, this.map) && cityOf(this, this.map) === SPLIT_STADT) {
      Object.assign(this, { map: this.p2.map, spawn: this.p2.spawn ?? 'default', position: this.p2.position ?? null });
    }
    const soll = this.splitSoll();
    if (soll === !!this.splitOn) return false;
    if (soll) {
      // Spieler 2 bleibt draußen (splitBetreten hat seine Stelle gemerkt); sonst vor dem Eingang, durch den Spieler 1 kam
      const rueck = [...this.flags].find((f) => f.startsWith('o3_rueck:'))?.slice(9);
      const draussen = rueck && this.content.maps[rueck] ? rueck : 'cw_gleisfuss';
      if (!this.p2.map || !this.content.maps[this.p2.map]) Object.assign(this.p2, { map: draussen, spawn: 'default', position: null });
      this.splitOn = true;
      this.emit('notice', 'Ein Pfadviertel trennt euch: Jeder kämpft in seinem eigenen Gebiet. Der Bildschirm teilt sich, bis ihr beide wieder draußen seid (Spieler 1 links mit WASD und E, Spieler 2 rechts mit Pfeilen und Enter).');
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
