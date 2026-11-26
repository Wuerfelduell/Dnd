// Seb 2026-11-26: Ab dem Halbgott (Seq 4, und damit auch Seq 3–1) sind die Kampffertigkeiten (`skill`, `skill2`)
// IN DER MYTHISCHEN GESTALT waffenunabhängig und teilen richtig aus; in normaler Form gehen sie wie gehabt über die Waffe.
// Die Daten bleiben wie sie sind; hier wird beim Aufbau die Gestalt-Fassung als `hg` an die Fertigkeit gehängt
// (Pathways.pathwaySkills nimmt sie, solange die Gestalt angenommen ist):
// - Waffenfertigkeiten (`mult`) bekommen festen Grundschaden: mult × HG_WAFFENWERT (eine „Halbgott-Waffe“, stärker als jede echte).
// - Grundschaden-Fertigkeiten (`flat`) werden auf dieselbe Stufe gehoben: flat × HG_GRUND_MULT.
// - Brand/Gift (`burn`) steigt mit: × HG_BRAND_MULT (Brand bekommt keinen dmg_mult, daher etwas weniger als die Treffer).
// Präzise bleibt, was vorher präzise war (`precise` wird festgeschrieben). Texte rechnen mit: DE hier, EN im Wörterbuch
// (src/i18n/en/faehigkeiten.json, erzeugt mit denselben Regeln über halbgottTextEn).
export const HG_SKILL_SEQ = 4;
export const HG_WAFFENWERT = 50;
export const HG_GRUND_MULT = 7;
export const HG_BRAND_MULT = 6;

const HEAVY_MULT = 3.5; // wie Combat.js (kein Import, damit die Inhaltsdaten ohne Kampflogik auskommen)
const HEAVY_FLAT = 24;
function wasPrecise(sk) {
  if (sk.precise !== undefined) return !!sk.precise;
  if (sk.stun) return true;
  const hits = sk.hits || 0;
  if (sk.flat) return hits * sk.flat >= HEAVY_FLAT;
  return hits * (sk.mult ?? 0) >= HEAVY_MULT;
}

/** Umgerechnete Werte einer Fertigkeit (ohne Text), null wenn sie keinen Treffer- oder Brandschaden hat. */
export function halbgottWerte(sk) {
  if (!sk || (!sk.hits && !sk.burn)) return null;
  const out = { precise: wasPrecise(sk), waffenfrei: true };
  if (sk.hits) {
    if (sk.flat) out.flat = Math.round(sk.flat * HG_GRUND_MULT);
    else if (sk.mult) out.flat = Math.round(sk.mult * HG_WAFFENWERT);
  }
  if (sk.burn) out.burn = [Math.round(sk.burn[0] * HG_BRAND_MULT), sk.burn[1]];
  return out;
}

/** Ersetzt die erste Zahl `old`, die zu `re` passt (Gruppe 1 = Zahl), durch `neu`. */
function swap(text, re, old, neu) {
  let done = false;
  return text.replace(re, (m, num, ...rest) => {
    if (done || +num !== old) return m;
    done = true;
    return m.replace(num, String(neu));
  });
}

function rewrite(text, sk, w, lang) {
  if (!text) return text;
  const de = lang === 'de';
  let t = text;
  if (sk.burn && w.burn) {
    t = de ? swap(t, /Runden je (\d+)/g, sk.burn[0], w.burn[0]) : swap(t, /(\d+) (?:follow-up damage|burn|poison|damage per round)/g, sk.burn[0], w.burn[0]);
  }
  if (sk.hits && w.flat) {
    if (sk.flat) {
      t = de ? swap(t, /(?<!Runden je )\b(\d+) (?:Grundschaden|Schaden)/g, sk.flat, w.flat) : swap(t, /\b(\d+) (?:base damage|damage)(?! per round)/g, sk.flat, w.flat);
    } else {
      const before = t;
      t = de ? t.replace(/\d+(?:[.,]\d+)? % Waffenschaden/, `${w.flat} Grundschaden`) : t.replace(/\d+(?:[.,]\d+)? % weapon damage/, `${w.flat} base damage`);
      if (t === before) t += de ? ` Je Treffer ${w.flat} Grundschaden.` : ` ${w.flat} base damage per hit.`;
    }
  }
  return t + (de ? ' Waffenunabhängig.' : ' Weapon-independent.');
}

/** Deutscher Text einer Halbgott-Fertigkeit nach der Umrechnung. */
export function halbgottText(sk) {
  const w = halbgottWerte(sk);
  return w ? rewrite(sk.desc, sk, w, 'de') : sk.desc;
}

/** Englischer Text zur gleichen Fertigkeit (Übersetzung des alten Textes als Vorlage). */
export function halbgottTextEn(sk, en) {
  const w = halbgottWerte(sk);
  return w ? rewrite(en, sk, w, 'en') : en;
}

/** Zusatzsatz für die normale Fassung: was die Fertigkeit in der Gestalt macht. */
export function halbgottHinweis(sk, lang = 'de') {
  const w = halbgottWerte(sk);
  if (!w) return '';
  const de = lang === 'de';
  const parts = [];
  if (w.flat) parts.push(de ? `${w.flat} Grundschaden je Treffer` : `${w.flat} base damage per hit`);
  if (w.burn) parts.push(de ? `${w.burn[0]} Folgeschaden je Runde` : `${w.burn[0]} follow-up damage per round`);
  return de ? ` In mythischer Gestalt waffenunabhängig: ${parts.join(', ')}.` : ` In mythic form, weapon-independent: ${parts.join(', ')}.`;
}

function convert(sk) {
  const w = halbgottWerte(sk);
  if (!w || sk.hg) return sk;
  return { ...sk, desc: sk.desc + halbgottHinweis(sk), hg: { ...w, mult: undefined, desc: halbgottText(sk) } };
}

/** Nach withFaehigkeiten: skill und skill2 aller Sequenzen ≤ HG_SKILL_SEQ umrechnen. */
export function withHalbgottFertigkeiten(pathways) {
  if (!pathways?.pathways) return pathways;
  const out = {};
  for (const [pid, p] of Object.entries(pathways.pathways)) {
    const seqs = { ...p.seqs };
    for (const [n, s] of Object.entries(seqs)) {
      if (+n > HG_SKILL_SEQ || !s) continue;
      seqs[n] = { ...s, ...(s.skill ? { skill: convert(s.skill) } : {}), ...(s.skill2 ? { skill2: convert(s.skill2) } : {}), ...(s.skill3 ? { skill3: convert(s.skill3) } : {}) };
    }
    out[pid] = { ...p, seqs };
  }
  return { ...pathways, pathways: out };
}
