// Paket AK: Stimmung eines Dialogknotens aus dem Text erraten, wenn der Knoten keine `mood` hat.
// Nur für Figuren mit den zusätzlichen Ausdrücken (wütend, traurig, nachdenklich, entschlossen).
// Bewusst vorsichtig: ohne deutliches Signal bleibt es beim neutralen Gesicht.

const CUES = [
  ['angry', /\b(verdammt|verflucht|raus hier|raus!|wagen sie es|lügner|lügnerin|halt(?:en sie)? den mund|schreit sie|schreit er|brüllt|faucht|knurrt|zischt|ballt die faust|schlägt (?:mit der faust|auf den tisch)|wütend|zornig)/i],
  ['sad', /\b(weint|tränen|schluchz|vermisse|trauert?|beerdig|gestorben|ist tot|sind tot|nie wieder singen|leise, fast)/i],
  ['determined', /\b(wir müssen|ich schwöre|versprochen|das endet (?:heute|hier)|bringen wir es zu ende|ich bin bereit|entschlossen|gehen wir)/i],
  ['thoughtful', /(^hm+\b|\bhmm+\b|ich frage mich|nachdenklich|überlegt lange|grübelt)/i],
];

/** Stimmung zu einem Text: 'angry' | 'sad' | 'determined' | 'thoughtful' | null. */
export function guessMood(text) {
  if (!text) return null;
  for (const [mood, re] of CUES) if (re.test(text)) return mood;
  return null;
}
