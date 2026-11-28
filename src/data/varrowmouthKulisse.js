/**
 * Varrowmouth-Kulissen, Runde 1 (Skript-Grafik, tools/art/vm_kulissen/assets.py; Vergleichsbilder docs/art/agent-runde1/).
 * Befund vor dieser Runde: Kein Varrowmouth-Ort nutzte Kacheln oder Requisiten aus anderen Städten, alle Karten hatten aber
 * null Deko. Leuchtturm, Wracks, Regale, Registerschrank und der Grenzzaun waren nur generische Hauswand-Blöcke (mit Fenstern und Türen).
 * Diese Blöcke heißen jetzt Y (fest, Boden-Optik) bzw. Z (fest, Schlick-Optik, tools/vm/karten.py) und tragen die neuen Requisiten.
 * Die Begehbarkeit ändert sich dadurch nicht: Y/Z sind genau die Felder, die vorher I waren. Der Nebel ist nicht fest.
 */

const LAMPE = '#e8cc8b';
const TILE = 16;

/** Requisit über einem Block (x0..x1, y0..y1): unten mittig auf der Blockunterkante, Tiefe nach Fußpunkt. */
function block(sprite, x0, y0, x1, y1, o = {}) {
  const cx = ((x0 + x1 + 1) / 2) * TILE;
  return { sprite, tile: [x0, y1], offset: [cx - (x0 * TILE + 8), 8], origin: [0.5, 1], alpha: 1, ysort: true, kulisse: 'vm1', block: [x0, y0, x1, y1], ...o };
}
// Das Zolltor steht mit den Pfosten auf zwei Zaunfeldern; darunter bleibt der Durchgang (22..25) frei (durchgang: true).
/** Nebelschwade: halbtransparent über Figuren, unter Licht und Dunkelheit (Lighting.DEPTH ab 2000), nicht fest. */
const nebel = (x, y, frame, alpha = 0.35) => ({ sprite: 'vmk_nebelschwaden', frame, tile: [x, y], alpha, depth: 1500, kulisse: 'vm1', nebel: true });

/** Zaunfelder einer Reihe mit wechselnden Varianten (0 meist, 1 Tau, 2 gebrochen, 3 Zollmarke). */
function zaun(y, x0, x1) {
  const out = [];
  for (let x = x0; x <= x1; x++) {
    const v = (x * 7 + 3) % 11;
    out.push(block('vmk_pegelzaun', x, y, x, y, { frame: v === 0 ? 2 : v === 4 ? 1 : v === 8 ? 3 : 0 }));
  }
  return out;
}

export const VM_KULISSE = {
  vm_grenzzaun: {
    decor: [...zaun(15, 1, 20), block('vmk_zolltor', 21, 15, 26, 15, { durchgang: true }), ...zaun(15, 27, 46),
      nebel(6, 19, 0), nebel(17, 22, 1), nebel(31, 18, 2), nebel(40, 23, 0), nebel(11, 27, 2, 0.3), nebel(29, 26, 1, 0.3)],
    // die zwei Laternen unter dem Querbalken des Tors (Pixel 24/72, 17 im 96x48-Bild)
    lights: [{ tile: [21.97, 13.56], radius: 46, intensity: 0.75, color: LAMPE, flicker: 0.12 }, { tile: [24.97, 13.56], radius: 46, intensity: 0.75, color: LAMPE, flicker: 0.12 }],
  },
  vm_leuchtbank: {
    decor: [block('vmk_leuchtturm_fuss', 33, 3, 38, 7),
      // der CV-Turm (vm_fassaden) steht auf dem Rundsockel, immer vor dem Fuß gezeichnet
      { sprite: 'vmf_leuchtfeuer_turm_tag', tile: [35, 5], offset: [8, 10], origin: [0.5, 1], alpha: 1, depth: 229, kulisse: 'vm1',
        light: { dy: -84, radius: 74, intensity: 0.9, color: LAMPE, flicker: 0.1, glow: 0.25 } },
      nebel(5, 3, 0), nebel(24, 2, 1), nebel(45, 13, 2), nebel(43, 28, 0), nebel(12, 29, 1)],
  },
  vm_wrackfeld: {
    decor: [block('vmk_wrackrumpf', 14, 4, 18, 6), block('vmk_wrackrumpf', 33, 4, 37, 6, { flip: true }), block('vmk_wrackrumpf', 24, 18, 28, 20, { flip: true }),
      block('vmk_wrackrumpf_lang', 5, 25, 11, 27), block('vmk_wrackheck', 13, 20, 16, 22), block('vmk_wrackmutter_rumpf', 37, 11, 44, 17),
      nebel(23, 13, 0), nebel(7, 8, 1), nebel(30, 26, 2), nebel(44, 21, 0, 0.3), nebel(17, 16, 2, 0.3)],
  },
  vm_registerkeller: {
    decor: [...[5, 13, 21, 29, 37].map((x, i) => block('vmk_registerregal', x, 4, x + 4, 9, { frame: i === 2 ? 1 : 0 })),
      ...[5, 13, 21, 29, 37].map((x, i) => block('vmk_registerregal', x, 18, x + 4, 23, { frame: [1, 0, 1, 1, 0][i] })),
      block('vmk_registerschrank', 42, 24, 45, 28)],
  },
};

export function applyVarrowmouthKulisse(content) {
  for (const [id, plan] of Object.entries(VM_KULISSE)) {
    const m = content.maps?.[id];
    if (!m) continue;
    m.decor = [...(m.decor ?? []).filter((d) => d.kulisse !== 'vm1'), ...plan.decor.map((d) => ({ ...d }))];
    if (plan.lights) m.lights = [...(m.lights ?? []), ...plan.lights];
  }
}
