// Codex-Runde 10: Pakete, die schon zu vorhandenen Inhalten passen (Rest liegt nur in docs/story).
export const ERFOLGE_FILES = ['erfolge', 'bedingungen', 'meldungen'];

/** DL Erfolge: Liste in Atlas-Reihenfolge, mit Gruppe und Atlas-Index aus bedingungen.json. */
export function erfolgePack({ erfolge, bedingungen, meldungen }) {
  const list = erfolge.map((e, i) => ({ ...e, gruppe: bedingungen[e.id]?.gruppe ?? 'kurios', index: bedingungen[e.id]?.index ?? i }));
  return { name: 'erfolge', erfolge: { list, meldungen } };
}

export const POST_FILES = ['briefe', 'beilagen', 'post'];

/** DI Post: 91 Briefe, 11 Beilagen, Schalter-/Büro-/Notizbuchzeilen. */
export function postPack({ briefe, beilagen, post }) {
  return { name: 'post', post: { briefe, beilagen, post } };
}
