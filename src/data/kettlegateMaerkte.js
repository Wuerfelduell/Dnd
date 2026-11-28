/**
 * Zehn Requisiten für Altmarkt und Nachtmarkt (tools/art/kg_maerkte/assets.py; Bilder docs/art/agent-kg-maerkte/).
 * Der Altmarkt hatte 2,8 Requisiten je 100 Bodenfelder (acht Stände aus vier Bauarten, große kahle Mittelflächen); die neuen Stände
 * stehen in den Mittelflächen auf Höhe der Standreihen. Der Nachtmarkt wurde im Kettlegate-Feinschliff absichtlich breiter gemacht,
 * damit die Stände Luft haben; dort kommen nur vier Stücke dazu: drei in die untere Gasse, das hohe Amulettgestell an die Rückwand
 * neben den Pfandtisch (in der Gasse hätte es Wahrsagerecke und Figuren verdeckt). Läuft nach applyKettlegateKulisse.
 */
import { setzeNahe } from './innen2.js';

export const KG_MAERKTE_SPRITES = { kgm_fischstand: [32, 32], kgm_blumenkarren: [32, 24], kgm_kaesestand: [32, 32], kgm_gefluegel: [32, 32], kgm_gewuerzstand: [32, 32],
  kgm_zeitungsstaender: [16, 32], kgm_amulettgestell: [32, 48], kgm_maskenstaender: [24, 40], kgm_schmugglerkarren: [48, 32], kgm_kerzenstand: [32, 32] };
const KERZE = { dy: -18, radius: 52, intensity: 0.8, color: '#ffb860' };
export const KG_MAERKTE_PLAN = {
  altmarkt: [['kgm_fischstand', 19, 9, { fest: [24, 8] }], ['kgm_gewuerzstand', 37, 9, { fest: [24, 8] }], ['kgm_kaesestand', 19, 22, { fest: [24, 8] }],
    ['kgm_blumenkarren', 37, 22, { fest: [22, 6] }], ['kgm_gefluegel', 33, 25, { fest: [22, 8] }], ['kgm_zeitungsstaender', 28, 7, { fest: [10, 6] }]],
  nachtmarkt: [['kgm_amulettgestell', 28, 2, { fest: [22, 6], licht: { dy: -16, radius: 32, intensity: 0.5, color: '#ffb860' } }], ['kgm_maskenstaender', 14, 9, { fest: [16, 6] }],
    ['kgm_kerzenstand', 27, 9, { fest: [22, 8], licht: KERZE }], ['kgm_schmugglerkarren', 34, 9, { fest: [36, 8] }]],
};
const KG_BODEN = '.,gPswpc=';

export function applyKettlegateMaerkte(content) {
  for (const [id, liste] of Object.entries(KG_MAERKTE_PLAN)) {
    const m = content.maps?.[id];
    if (m?.rows) setzeNahe(m, liste, 'kgm', KG_BODEN);
  }
}
