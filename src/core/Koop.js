// Paket AI: reine Koop-Regeln ohne Phaser (Rollen, Stimmen, Geplauder, Kampfsprüche, Begrüßung).

/** Welcher Spieler darf dieses Objekt bedienen? 1, 2 oder null (beide). */
export function koopRoleOf(id) {
  const m = /^koop_[a-z_]+_p([12])$/.exec(id ?? '');
  return m ? Number(m[1]) : null;
}

/** Stimme von Spieler 2 im Geplauder: 'a' oder 'b'. */
export const koopVoice = (look) => (look === 'p2b' ? 'b' : 'a');

/** Nächstes Gespräch für diese Karte (oder null): Bedingungen erfüllt, noch nicht gehört. */
export function pickChat(state, mapId) {
  const list = state.content.koop?.geplauder ?? [];
  return list.find((g) => g.map === mapId && !state.koopSeen.has(g.id) && state.meets(g)) ?? null;
}

/** Ein Kampfspruch für den Anlass (oder null). speaker: 1 oder 2. */
export function koopBark(state, event, speaker, last = null) {
  const lines = state.content.koop?.kampf?.[event]?.[speaker === 2 ? state.p2Look() : 'p1'] ?? [];
  const pool = lines.length > 1 ? lines.filter((l) => l !== last) : lines;
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

/** Beitritt und Abschied (docs/story/koop/hintergrund.md): Kapitel 1 offen, in Wexmoor heimlich. */
export const KOOP_GREETINGS = {
  join: {
    p2a: ['Zwischen zwei Passanten taucht der grüne Mantel auf. „Pimm kommt kurz ohne mich aus. Zeig mir, wo die Akten ihre schmutzigen Schuhe herhaben.“',
      'Erst als die Schritte hinter euch verstummen, tritt der grüne Mantel aus dem Schatten. „Hab dich gefunden. Den Teil mit dem Lautrufen hab ich mir gespart.“'],
    p2b: ['Deine Begleitung schließt die kleine Schreibmappe und tritt neben dich. „Die Abschriften können warten. Ich würde jetzt gern die Umstände sehen, unter denen sie entstehen.“',
      'Deine Begleitung wartet, bis kein Laternenkegel mehr über den Weg streicht. „Die Suche war weniger diskret, als ich geplant hatte. Die Begrüßung halten wir deshalb kurz.“'],
  },
  leave: {
    p2a: ['Deine Begleitung zieht den Mantel zurecht. „Ich muss noch etwas erledigen. Lauf mir inzwischen nicht in jede offene Kellertür.“',
      'Deine Begleitung wartet auf einen dunklen Zwischenraum zwischen den Laternen. „Ich suche einen trockenen Platz. Wenn du nachkommst, bring bitte nicht die Wache mit.“'],
    p2b: ['Deine Begleitung prüft die Verschlüsse der eigenen Tasche. „Ich kümmere mich vorerst um andere Dinge. Bitte betrachte meine Abwesenheit nicht als Empfehlung, unvorsichtig zu werden.“',
      'Deine Begleitung zieht den Mantelkragen hoch und beobachtet die Gasse. „Ich ziehe mich vorerst zurück. Meine Sachen bleiben bei mir, damit wir bei der nächsten Begegnung nichts neu sortieren müssen.“'],
  },
};
export const koopGreeting = (kind, look, wexmoor) => KOOP_GREETINGS[kind][look === 'p2b' ? 'p2b' : 'p2a'][wexmoor ? 1 : 0];
