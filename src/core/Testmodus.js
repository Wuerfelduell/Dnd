// i18n: ignorieren (nur für Seb, erscheint nirgends in der Oberfläche)
// Verborgener Testmodus. Kein Knopf, kein Hinweis, keine Übersetzung: wer ihn kennt, schaltet ihn frei.
// Im Testmodus: alle Gebiete erreichbar, Monster laufen weg, Zirkel immer offen ohne Wartezeit,
// Geschichte erledigt, Bosse aber noch am Leben (keine won_*-Flags).

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

/** Merkt sich gedrückte Umlaute. `onCombo` läuft, sobald Umschalt + Ä + Ö + Ü zusammen gedrückt sind. */
export function watchUmlautCombo(target, onCombo) {
  const held = new Set();
  const id = (e) => UMLAUT[e.key?.toLowerCase()] ?? UMLAUT[e.code];
  target.addEventListener('keydown', (e) => {
    const k = id(e);
    if (!k) return;
    held.add(k);
    if (e.shiftKey && held.size === 3 && !e.repeat) { held.clear(); onCombo(e); }
  }, true);
  target.addEventListener('keyup', (e) => { const k = id(e); if (k) held.delete(k); }, true);
  target.addEventListener('blur', () => held.clear());
}

export const testmodusMethods = {
  /** Schaltet den Testmodus für diesen Spielstand ein und erledigt die Geschichte. */
  startTestmodus() {
    this.testmodus = true;
    this.testStoryFertig();
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
