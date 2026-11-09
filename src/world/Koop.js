import Phaser from 'phaser';
import { KOOP_ROLE_FLAG } from '../core/Party.js';
import { speechBubble } from './WexmoorLife.js';
import { koopRoleOf, koopVoice, pickChat } from '../core/Koop.js';

export * from '../core/Koop.js';

// Paket AI: Leben zu zweit auf der Karte.
// - Rollenobjekte (koop_<auftrag>_p1/_p2, Blick und Rad) bedient nur der genannte Spieler.
// - Platz-Flags (koop_<auftrag>_p1/_p2) gelten nur, solange der Spieler an seinem Platz steht.
// - Geplauder: höchstens ein Gespräch je Karteneintritt, 90 s Pause, jedes nur einmal je Spielstand.

/** Reichweite um den Platz (1,5 Kacheln plus Spielraum für die Figurenmitte). */
export const KOOP_REACH = 28;
export const KOOP_CHAT_PAUSE = 90000;
const LINE_MS = 3400;

export class KoopLife {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.checkT = 0;
    this.chatT = 2500; // kurz nach dem Eintreten
    this.chatted = false;
    this.bubbles = [];
  }

  /** Wer darf das? Liefert einen Hinweistext, wenn der falsche Spieler es versucht. */
  refuse(it, acting) {
    const role = koopRoleOf(it.def?.id);
    if (!role || role === acting) return null;
    return `Das ist der Platz von Spieler ${role}.`;
  }

  update(delta, blocked) {
    const s = this.state;
    this.checkT -= delta;
    if (this.checkT <= 0) {
      this.checkT = 250;
      this.checkSeats();
    }
    if (this.chatted || !s.hasP2() || !this.scene.p2) return;
    this.chatT -= delta;
    if (this.chatT > 0 || blocked) return;
    this.chatT = 4000;
    if ((s.koopChatAt ?? -Infinity) + KOOP_CHAT_PAUSE > Date.now()) { this.chatted = true; return; }
    const chat = pickChat(s, s.map);
    this.chatted = true;
    if (chat) this.play(chat);
  }

  /** Platz-Flags fallen weg, sobald der Spieler seinen Platz verlässt (oder es ihn hier nicht gibt). */
  checkSeats() {
    const s = this.state;
    let changed = false;
    for (const f of [...s.flags]) {
      if (!KOOP_ROLE_FLAG.test(f)) continue;
      const it = this.scene.interactables.find((i) => i.def?.id === f);
      const who = koopRoleOf(f) === 2 ? this.scene.p2 : this.scene.player;
      if (!it || !who || Phaser.Math.Distance.Between(who.x, who.y - 3, it.x, it.y) > KOOP_REACH) {
        s.flags.delete(f);
        changed = true;
      }
    }
    if (changed) s.emit('changed');
  }

  /** Gespräch als Sprechblasen über beiden Figuren, Zeile für Zeile. */
  play(chat) {
    const s = this.state;
    s.koopSeen.add(chat.id);
    s.koopChatAt = Date.now();
    const voice = koopVoice(s.p2Look());
    chat.zeilen.forEach((z, i) => {
      this.scene.time.delayedCall(i * LINE_MS, () => {
        const who = z.p === 'p2' ? this.scene.p2 : this.scene.player;
        const text = z.p === 'p2' ? z[voice] : z.text;
        if (!who || !text || !s.hasP2()) return;
        const b = speechBubble(this.scene, text, who, this.scene.cameras.main.worldView);
        this.scene.tweens.add({ targets: b, alpha: 0.95, duration: 180 });
        this.scene.tweens.add({ targets: b, alpha: 0, delay: LINE_MS - 400, duration: 300, onComplete: () => b.destroy() });
      });
    });
  }
}
