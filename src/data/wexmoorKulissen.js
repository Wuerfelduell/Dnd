/**
 * Zehn Requisiten für Wexmoor (tools/art/wx_kulissen/assets.py, Bilder docs/art/agent-wx-kulissen/), je zwei für Torf, Moor, Salz, Friedhof und Lichtamt.
 * Wexmoor hat keine Platzhalter-Klötze (keine I-Blöcke auf den Außenkarten); leer wirken die Torfbrüche (0,8 Requisiten je 100 Bodenfelder),
 * das Vergessmoor (1,6), das Salzwatt (2,3) und das Lichtamt (5,0); auf dem Floßfriedhof ist der Mittelsteg kahl.
 * Gesetzt mit setzeNahe (innen2.js): nur auf Boden (Stellzeichen), nicht neben Objekten, Figuren, Streifen und Spawns; fest nur, wenn über die
 * begehbaren Zeichen (Boden, Stege, Pfade; Geröll 'r' ist fest) danach noch alles erreichbar ist.
 * Läuft nach applyHeimkehr, damit spätere Objekte (Heimkehr-Trupp im Lichtamt) schon stehen.
 */
import { setzeNahe } from './innen2.js';

export const WX_KULISSEN_SPRITES = { wxr_stuetzjoch: [32, 40], wxr_torfpresse: [32, 32], wxr_versunkener_karren: [32, 24], wxr_faschinen: [32, 24],
  wxr_gradierwerk: [48, 40], wxr_solebrunnen: [32, 32], wxr_totenfloss: [32, 24], wxr_sargstapel: [32, 32], wxr_lichtmessbank: [48, 32], wxr_plombenpresse: [32, 32] };
const KERZEN = { dy: -10, radius: 30, intensity: 0.55, color: '#ffb860' };
export const WX_KULISSEN_PLAN = {
  wx_torfbrueche: ['s', 's', [['wxr_stuetzjoch', 4, 3, { fest: [26, 6] }], ['wxr_torfpresse', 28, 9, { fest: [24, 8] }], ['wxr_stuetzjoch', 43, 20, { fest: [26, 6] }],
    ['wxr_torfpresse', 12, 22, { fest: [24, 8] }]]],
  wx_vergessmoor: ['g', 'gpP', [['wxr_versunkener_karren', 10, 26, { fest: [22, 6] }], ['wxr_faschinen', 50, 4, { fest: [24, 6] }], ['wxr_faschinen', 30, 22, { fest: [24, 6] }],
    ['wxr_versunkener_karren', 44, 2, { fest: [22, 6] }]]],
  wx_salzwatt: ['g', 'gP', [['wxr_gradierwerk', 45, 10, { fest: [40, 8] }], ['wxr_solebrunnen', 24, 22, { fest: [22, 8] }], ['wxr_gradierwerk', 8, 20, { fest: [40, 8] }]]],
  wx_flossfriedhof: ['P', 'P', [['wxr_totenfloss', 12, 8, { fest: [24, 6], licht: KERZEN }], ['wxr_sargstapel', 36, 9, { fest: [26, 8] }]]],
  wx_lichtamt: ['w', 'w', [['wxr_lichtmessbank', 28, 15, { fest: [40, 8], licht: { dx: -16, dy: -16, radius: 34, intensity: 0.6, color: '#ffc870' } }], ['wxr_plombenpresse', 8, 8, { fest: [20, 8] }]]],
};

export function applyWexmoorKulissen(content) {
  for (const [id, [boden, begehbar, liste]] of Object.entries(WX_KULISSEN_PLAN)) {
    const m = content.maps?.[id];
    if (m?.rows) setzeNahe(m, liste, 'wxr', boden, 3, begehbar);
  }
}
