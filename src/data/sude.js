/**
 * Freies Trankbrauen (Seb, 2026-11-12): Wer den Pfad des Kessels bis Sequenz 6 gegangen ist, darf am Braukessel
 * ohne Formel brauen: bis zu drei Zutaten in den Kessel, den Sud in ein leeres Gefäß füllen. Passt die Mischung zu
 * einem der festen Rezepte hier, entsteht dieser Sud; sonst ein Trüber Sud (Pfusch), der kaum etwas taugt.
 * Reihenfolge der Zutaten ist egal. Die Sude sind Verbrauchsgüter (auch im Kampf); `buff` wirkt wie eine
 * Welt-Fähigkeit auf Zeit (core/Talents.js), die Sekunden zählen nur außerhalb von Menüs und Kämpfen.
 */
export const LEERES_GEFAESS = 'leeres_gefaess';
export const SUD_MAX_ZUTATEN = 3;
export const SUD_PFUSCH = 'sud_pfusch';

export const SUDE = [
  { id: 'nebelsud', name: 'Nebelsud', zutaten: ['nebeltau', 'bitterwurz'], heal: 12, desc: 'Grau, lauwarm, schmeckt nach Kanal. Schließt kleine Wunden.' },
  { id: 'silberklar', name: 'Silberklar', zutaten: ['nebeltau', 'silberstaub'], composure: 20, desc: 'Klar wie Quellwasser, mit einem Silberfaden darin. Beruhigt die Hände.' },
  { id: 'mohnschlaf', name: 'Mohnschlaf', zutaten: ['mondmohn', 'nebeltau'], calm: 15, desc: 'Milchig und süß. Die Stimmen werden leiser.' },
  { id: 'gluehtrunk', name: 'Glühtrunk', zutaten: ['gluehwurmasche', 'nebeltau'], buff: { key: 'dmg_mult', value: 1.15, seconds: 90 }, desc: 'Glimmt im Glas nach. Eine Weile schlägt man härter zu.' },
  { id: 'eisensud', name: 'Eisensud', zutaten: ['eisenkraut', 'ochsenblut'], buff: { key: 'damage_taken', value: 0.85, seconds: 90 }, desc: 'Dick wie Suppe, riecht nach Schlachthof. Die Haut wird zäh.' },
  { id: 'kroetenbitter', name: 'Krötenbitter', zutaten: ['kroetenschleim', 'bitterwurz'], damage: 14, combat_only: true, desc: 'Ein Wurfgift. Nur im Kampf: 14 Schaden, doppelt gegen Okkultes.' },
  { id: 'wachsglanz', name: 'Wachsglanz', zutaten: ['wachsbluete', 'silberstaub'], buff: { key: 'price', value: 0.85, seconds: 120 }, desc: 'Macht das Gesicht offen und ehrlich. Händler verlangen weniger.' },
  { id: 'grabruhe', name: 'Grabruhe', zutaten: ['grabmoos', 'mondmohn'], buff: { key: 'composure_regen', value: 1.5, seconds: 90 }, desc: 'Schmeckt nach Erde und Schlaf. Die Nerven erholen sich schneller.' },
  { id: 'kraehenauge', name: 'Krähenauge', zutaten: ['kraehenfeder', 'nebeltau', 'silberstaub'], buff: { key: 'lock_bonus', value: 10, seconds: 120 }, desc: 'Man sieht Schlösser, wie eine Krähe Ringe sieht. Sie öffnen sich mit weniger Ansehen.' },
  { id: 'moosleuchte', name: 'Moosleuchte', zutaten: ['leuchtmoos', 'gluehwurmasche'], buff: { key: 'vision_cost', value: 0.5, seconds: 90 }, desc: 'Leuchtet blassgelb von innen. Die Geistsicht kostet halb so viele Nerven.' },
  { id: 'seidenschritt', name: 'Seidenschritt', zutaten: ['spinnenseide', 'nebeltau'], buff: { key: 'dodge_window', value: 1.3, seconds: 90 }, desc: 'Die Beine werden leicht. Ausweichen gelingt großzügiger.' },
  { id: 'schattenhauch', name: 'Schattenhauch', zutaten: ['schattenpilz', 'grabmoos', 'nebeltau'], buff: { key: 'occult_mult', value: 1.3, seconds: 90 }, desc: 'Schwarz und kalt. Okkultes spürt deine Schläge stärker.' },
  { id: 'glockenruf', name: 'Glockenruf', zutaten: ['glockenstaub', 'silberstaub'], buff: { key: 'money_bonus', value: 1.2, seconds: 120 }, desc: 'Klingelt leise im Magen. Beute und Lohn fallen reicher aus.' },
  { id: 'dreikraut', name: 'Dreikraut', zutaten: ['bitterwurz', 'eisenkraut', 'kraehenfeder'], heal: 10, composure: 10, desc: 'Bitter, zäh, federig. Ein bisschen von allem.' },
  { id: 'sternfunke', name: 'Sternfunke', zutaten: ['sternglas', 'gluehwurmasche', 'nebeltau'], buff: { key: 'dmg_mult', value: 1.3, seconds: 60 }, desc: 'Funkelt wie ein Krater bei Nacht. Kurz, aber gewaltig.' },
  { id: 'kesselzorn', name: 'Kesselzorn', zutaten: ['kroetenschleim', 'schattenpilz', 'ochsenblut'], buff: { key: 'atk', value: 3, seconds: 90 }, desc: 'Brodelt noch im Glas. Jeder Schlag trägt drei Punkte mehr.' },
];

/** Gegenstände der Sude (kind consumable, `sud: true`) für content.items. */
export function sudItems() {
  const out = {};
  for (const s of SUDE) {
    const { id, zutaten, ...rest } = s;
    out[`sud_${id}`] = { ...rest, kind: 'consumable', sud: id, zutaten, price: 18, weight: 1 };
  }
  out[SUD_PFUSCH] = { name: 'Trüber Sud', kind: 'consumable', sud: 'pfusch', calm: 3, price: 2, weight: 1, desc: 'Nichts, was ein Rezept wäre. Schmeckt nach nasser Asche und senkt die Unruhe um ein bisschen.' };
  return out;
}

/** Welches Rezept passt zu dieser Zutatenmischung (Reihenfolge egal, Vielfache nicht)? */
export function sudRecipeFor(ids) {
  const key = [...ids].sort().join('+');
  return SUDE.find((s) => [...s.zutaten].sort().join('+') === key) ?? null;
}

/** Lesbare Wirkung eines Suds. */
export function sudEffectText(it, buffLabel) {
  const parts = [];
  if (it.heal) parts.push(`+${it.heal} Leben`);
  if (it.composure) parts.push(`+${it.composure} Nerven`);
  if (it.calm) parts.push(`-${it.calm} Unruhe`);
  if (it.damage) parts.push(`${it.damage} Schaden (Wurf im Kampf)`);
  if (it.buff) parts.push(`${buffLabel ? buffLabel(it.buff) : `${it.buff.key} ${it.buff.value}`} für ${it.buff.seconds} s`);
  return parts.join(', ');
}
