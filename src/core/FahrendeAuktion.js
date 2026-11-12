// Codex DE: Fahrplan der Fahrenden Auktion. Der Wagen fährt mit: 2 Spieltage Halt in der Stadt, in der man gerade ist,
// dann 3 Spieltage Pause. Eine Runde je Halt (Treffen-Auktion, core/Auction.js). Daten: data/fahrendeAuktion.js.
import { DAY_SECONDS } from './Clock.js';

export const FA2_HALT = 2;
export const FA2_TAKT = 5;
/** Ab hier steht der Wagen (Wexmoor ab Ankunft in Kapitel 2). */
const AB = 'k2_arrived';

export const fahrendeAuktionMethods = {
  fa2Tag() { return Math.floor((this.playTime ?? 0) / DAY_SECONDS); },
  /** Steht der Wagen gerade? */
  fa2Halt() { return this.flags.has(AB) && this.fa2Tag() % FA2_TAKT < FA2_HALT; },
  /** Nummer des laufenden Halts (für die Lose und „eine Runde je Halt“). */
  fa2HaltId() { return Math.floor(this.fa2Tag() / FA2_TAKT); },
  fa2TageBisHalt() { const r = this.fa2Tag() % FA2_TAKT; return r < FA2_HALT ? 0 : FA2_TAKT - r; },

  /** Für startSession: undefined = kein Wagen-Zirkel; null = geschlossen; sonst die Runde (Halt-Nummer). */
  fa2Cycle(circleId) {
    const c = this.gatheringDef(circleId);
    if (!c?.fahrend) return undefined;
    const city = this.content.maps[this.map]?.city;
    if (!this.fa2Halt() || city !== c.city) return null;
    return 1000000 + this.fa2HaltId();
  },

  /** Flag fa2_halt für die Sichtbarkeit von Vance und Wagen. */
  fa2Tick() {
    const halt = this.fa2Halt();
    if (halt === this.flags.has('fa2_halt')) return;
    if (halt) this.flags.add('fa2_halt'); else this.flags.delete('fa2_halt');
    this.emit('changed');
    if (halt && this.flags.has('fa2_kontakt')) this.emit('notice', 'Perpetua Vances Wagen steht wieder auf dem Markt. Zwei Spieltage lang wird versteigert.');
  },
};
