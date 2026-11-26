// i18n: ignorieren (nur für Seb, erscheint nirgends in der Oberfläche)
// Verborgener Testmodus. Kein Knopf, kein Hinweis, keine Übersetzung: wer ihn kennt, schaltet ihn frei.
// Im Testmodus: alle Gebiete erreichbar, Monster laufen weg, Zirkel immer offen ohne Wartezeit,
// Geschichte erledigt, Bosse aber noch am Leben (keine won_*-Flags).
// Für Sequenz-Tests: alle Zutaten und alle Formeln (alle Pfade, alle Sequenzen) liegen immer im Inventar
// (beider Spieler), Verdauung immer 100 %, keine Tragkraftgrenze, keine Unruhe, alle Rituale vollzogen,
// Schwellen- und Grenzwächter mit 1 Leben (Combat.js).

const TEST_ZUTATEN = 10; // so viele von jeder Zutat werden immer wieder aufgefüllt
const TEST_FUELL_SEK = 3; // Abstand der Auffüllung in Sekunden

// Nur der Hash steht im Code (das Spiel ist öffentlich).
const SALT = 'nebelakten-test:';
const HASH = '61040a982a6dc91d793c9fdce69d9057796db8a99274b0c9550c27dbe329c64f';

/** Prüft das Kennwort. Ergebnis: Promise<boolean>. */
export async function testCodeOk(text) {
  try {
    const data = new TextEncoder().encode(SALT + String(text ?? ''));
    const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    return hex === HASH;
  } catch {
    return false;
  }
}

// Tasten: Ä, Ö, Ü (deutsches Layout: Quote, Semicolon, BracketLeft) gleichzeitig mit Umschalt
const UMLAUT = { ä: 'ae', ö: 'oe', ü: 'ue', Quote: 'ae', Semicolon: 'oe', BracketLeft: 'ue' };

/**
 * Umschalt + Ä + Ö + Ü. Gezählt wird, wenn alle drei Umlaute mit gehaltener Umschalttaste innerhalb von 1,5 s
 * gedrückt wurden (viele Tastaturen melden vier gleichzeitig gehaltene Tasten nicht zuverlässig).
 */
export function watchUmlautCombo(target, onCombo, windowMs = 1500) {
  let times = {};
  const id = (e) => UMLAUT[e.key?.toLowerCase()] ?? UMLAUT[e.code];
  target.addEventListener('keydown', (e) => {
    const k = id(e);
    if (!k || e.repeat) return;
    if (!e.shiftKey) { times = {}; return; }
    const now = performance.now();
    times[k] = now;
    if (['ae', 'oe', 'ue'].every((x) => times[x] !== undefined && now - times[x] <= windowMs)) { times = {}; onCombo(e); }
  }, true);
  target.addEventListener('blur', () => { times = {}; });
}

export const testmodusMethods = {
  /** Schaltet den Testmodus für diesen Spielstand ein und erledigt die Geschichte. */
  startTestmodus() {
    this.testmodus = true;
    this.testStoryFertig();
    this.testAuffuellen();
    this.emit('changed');
  },

  /** Alle Aufträge erledigt, Fortschritts- und Freischalt-Flags gesetzt, je Fall das beste Ende. Bosse bleiben unbesiegt. */
  testStoryFertig() {
    const c = this.content;
    const flags = new Set();
    const add = (o) => {
      if (!o || typeof o !== 'object') return;
      for (const f of o.requires_flags ?? []) flags.add(f);
      for (const f of o.sets_flags ?? []) flags.add(f);
    };
    for (const q of Object.values(c.quests ?? {})) {
      for (const s of q.steps ?? []) add(s.done);
      add(q.reward);
    }
    for (const t of c.travel ?? []) add(t);
    for (const cs of c.cases ?? []) {
      const best = Object.entries(c.endings ?? {}).filter(([, e]) => e.case === cs.id).sort((a, b) => (b[1].honor ?? 0) - (a[1].honor ?? 0))[0];
      if (!best) continue;
      this.endings[cs.id] ??= best[0];
      add(best[1]);
    }
    for (const f of flags) if (!f.startsWith('won_')) this.flags.add(f);
    for (const id of Object.keys(c.quests ?? {})) this.quests[id] = 'done';
    this.tracked = null;
  },

  /** Füllt alle Zutaten (je TEST_ZUTATEN) und alle Formeln (je 1) auf, bei beiden Spielern. Verdauung 100 %, Unruhe 0. */
  testAuffuellen() {
    if (!this.testmodus) return;
    const fuell = (inv) => {
      for (const [id, it] of Object.entries(this.content.items ?? {})) {
        const soll = it.kind === 'ingredient' ? TEST_ZUTATEN : it.kind === 'formula' ? 1 : 0;
        if (soll && (inv[id] ?? 0) < soll) inv[id] = soll;
      }
    };
    fuell(this.inventory);
    if (this.p2?.inventory) { fuell(this.p2.inventory); this.p2.unruhe = 0; }
    // Verdauung immer voll, bei beiden Spielern (über addDigestion, damit „vollständig verdaut“ greift)
    if (this.pathway && this.pathway.digestion < 100) this.withPlayer(1, () => this.addDigestion(100 - this.pathway.digestion, 'test'));
    if (this.hasP2?.() && this.p2?.pathway && this.p2.pathway.digestion < 100) this.withPlayer(2, () => this.addDigestion(100 - this.pathway.digestion, 'test'), { quiet: true });
    if (this.unruhe) { this.unruhe = 0; this.emit('unruhe', 0); }
  },

  /** Aus tick(): regelmäßig nachfüllen, damit verbrauchte Zutaten gleich wieder da sind. */
  testTick(dt) {
    if (!this.testmodus) return;
    this.testFuellUhr = (this.testFuellUhr ?? 0) - dt;
    if (this.testFuellUhr > 0) return;
    this.testFuellUhr = TEST_FUELL_SEK;
    this.testAuffuellen();
  },

  /** Sichtbarkeit eines Kartenobjekts. Im Testmodus stehen alle Bosse da, bis sie besiegt sind. */
  sichtbar(def) {
    if (this.testmodus && def.encounter && (def.boss || this.content.encounters?.[def.encounter]?.boss)) return !this.flags.has(`won_${def.encounter}`);
    return !def.visible_if || this.meets(def.visible_if);
  },

  /** Alle Karten nach Stadt, für die Testreise. */
  testKarten() {
    const out = {};
    for (const m of Object.values(this.content.maps)) (out[m.city ?? 'kettlegate'] ??= []).push({ id: m.id, name: m.name ?? m.id });
    return out;
  },
};
