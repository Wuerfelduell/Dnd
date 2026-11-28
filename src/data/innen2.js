/**
 * Mutterhaus und Labor (Briarholt) und eigene Stücke für die Dunscarer Zirkelräume (tools/art/innen2/assets.py; Bilder docs/art/agent-innen2/).
 * Mutterhaus und Labor waren mit 2,8 bzw. 3,2 Möbeln je 100 Bodenfelder die leersten Innenräume Briarholts.
 * Die vier Dunscarer Zirkelräume trugen Möbel anderer Zirkel (Kettlegater Rußbrüder, Kreide- und Waage-Zirkel, Wexmoorer Salzzirkel).
 * Getauscht wird an Ort und Stelle (gleiches Feld, gleiche Kollision); neue Stücke nur auf freiem Boden, fest nur bei voller Erreichbarkeit.
 */
import { erreichbarMit } from './briarholtKulisse.js';

export const INNEN2_SPRITES = { bhk_reissbrett: [32, 48], bhk_fundamentmodell: [48, 32], bhk_destille: [32, 48], bhk_mikroskoppult: [32, 32],
  dsk_kalterofen: [48, 48], dsk_glasblaeserbank: [32, 32], dsk_hebelbank: [48, 32], dsk_telegrafenpult: [32, 32], dsk_stempeluhr: [16, 32], dsk_siedepfanne: [48, 32] };

/** Zirkelräume: [altes Sprite, neues Sprite]. */
export const INNEN2_TAUSCH = {
  treffen_kalkofen: [['o_russ_props_counter', 'dsk_kalterofen'], ['o_russ_props_coal_scale', 'dsk_glasblaeserbank']],
  treffen_stellwerk: [['o_kreide_props_table', 'dsk_hebelbank'], ['o_kreide_props_lectern', 'dsk_telegrafenpult']],
  treffen_schichtbund: [['o_waage_props_cabinet', 'dsk_stempeluhr']],
  treffen_salzds: [['s_salz_props_table', 'dsk_siedepfanne']],
};
/** Mutterhaus und Labor (beide Fassungen): [Sprite, Wunschfeld x, y, { fest: [b, h], licht }]. */
export const INNEN2_DAZU = {
  bh_mutterhaus: [['bhk_reissbrett', 19, 3, { fest: [22, 8], licht: { dy: -40, radius: 40, intensity: 0.6, color: '#ffcf8a' } }], ['bhk_fundamentmodell', 14, 9, { fest: [40, 8] }]],
  bh_labor: [['bhk_destille', 20, 3, { fest: [22, 8] }], ['bhk_mikroskoppult', 12, 11, { fest: [26, 8] }]],
};

export function applyInnen2(content) {
  for (const [id, liste] of Object.entries(INNEN2_TAUSCH)) {
    const m = content.maps?.[id];
    if (!m) continue;
    for (const [alt, neu] of liste) for (const d of m.decor ?? []) {
      if (d.sprite !== alt) continue;
      Object.assign(d, { sprite: neu, frame: 0, origin: [0.5, 1], offset: [0, 8], ysort: true, alpha: 1, kulisse: 'innen2', getauscht: alt });
      delete d.anim;
    }
  }
  for (const [base, liste] of Object.entries(INNEN2_DAZU)) for (const id of [base, base + '__warm']) {
    const m = content.maps?.[id];
    if (m?.rows) setzeNahe(m, liste, 'innen2');
  }
}

/**
 * Stellt Stücke nahe an Wunschfelder: freier Boden (auch links und rechts daneben), kein Objekt im Umkreis von einem Feld,
 * kein anderes Requisit direkt daneben; fest nur, wenn danach alles erreichbar bleibt. liste = [[Sprite, x, y, { fest, licht, frame }], …].
 */
export function setzeNahe(m, liste, kulisse, bodenZeichen = '.swg', radius = 3, begehbarZeichen = bodenZeichen) {
  m.decor ??= [];
  const W = m.rows[0].length;
  const H = m.rows.length;
  const key = (x, y) => x + ',' + y;
  const boden = (x, y) => bodenZeichen.includes(m.rows[y]?.[x] ?? 'I');
  const geh = (x, y) => begehbarZeichen.includes(m.rows[y]?.[x] ?? 'I'); // für die Erreichbarkeit (z. B. Stege, die kein Stellplatz sind)
  const objekte = [...(m.interactables ?? []).map((i) => i.tile), ...(m.npcs ?? []).map((n) => n.tile), ...Object.values(m.spawns ?? {}), ...(m.roamers ?? []).map((r) => r.tile)].filter(Boolean);
  const nah = new Set();
  for (const [x, y] of objekte) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) nah.add(key(x + dx, y + dy));
  const belegt = new Set();
  for (const d of m.decor) if (d.ysort || d.solid) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) belegt.add(key(d.tile[0] + dx, d.tile[1] + dy));
  const fest = new Set(m.decor.filter((d) => d.solid).map((d) => key(...d.tile)));
  const gesetzt = [];
  for (const [sprite, wx, wy, o = {}] of liste) {
    const kand = [];
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) kand.push([wx + dx, wy + dy, Math.abs(dx) + Math.abs(dy)]);
    kand.sort((p, q) => p[2] - q[2]);
    const ziel = kand.find(([x, y]) => boden(x, y) && boden(x - 1, y) && boden(x + 1, y) && !nah.has(key(x, y)) && !belegt.has(key(x, y)));
    if (!ziel) continue;
    const [x, y] = ziel;
    const d = { sprite, frame: o.frame ?? 0, tile: [x, y], offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true, kulisse };
    if (o.licht) d.light = { flicker: 0.1, glow: 0.2, ...o.licht };
    if (o.fest && erreichbarMit(m, { W, H, boden: geh, fest, neu: [key(x, y)] })) { d.solid = [o.fest[0], o.fest[1], 0, -3]; fest.add(key(x, y)); }
    for (let dy = -1; dy <= 1; dy++) for (let ddx = -1; ddx <= 1; ddx++) belegt.add(key(x + ddx, y + dy));
    m.decor.push(d);
    gesetzt.push(d);
  }
  return gesetzt;
}
