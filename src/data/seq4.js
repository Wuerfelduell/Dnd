/**
 * Seq-4-Rituale (Seb, 2026-11-12): Gegenstände, Rezepte und Ritualdaten der zehn Halbgott-Prüfungen.
 * Die Regeln stehen in core/Seq4.js. Läuft nach applySeq5 in buildContent.
 *
 * Jedes Seq-4-Ritual bekommt das Feld `hg` (Art der Prüfung) und verliert Ort, Fallbedingung und Geistsicht:
 * keine Rückreise in frühere Städte, also darf nichts an einem Ort hängen, den man verpasst haben kann.
 * Tribut, Siege, Schlussfolgerungen, Nerven und Zutaten bleiben; der Schwellenwächter (`ordeal`) ist bei allen
 * zehn der Abschluss der Prüfung selbst.
 */
import { LEERES_GEFAESS } from './sude.js';
import { applySeq4Dr, DR_KEY, pct } from './seq4Dr.js';

export const HG_KIND = { laterne: 'laterne', faden: 'faden', maske: 'maske', echo: 'echo', kessel: 'kessel', eisen: 'eisen', schluessel: 'schluessel', sq_waage: 'waage', sq_moor: 'moor', sq_uhr: 'uhr' };

export const HG_NAMES = {
  laterne: 'Die Nacht der Laternen', faden: 'Das Netz der Schicksale', maske: 'Das Gesicht ohne Macht', echo: 'Die Welt ohne Klang',
  kessel: 'Die fünffache Essenz', eisen: 'Die Last des Halbgottes', schluessel: 'Der Schatten ohne Körper', waage: 'Der Preis der Macht',
  moor: 'Das Relikt des Verfalls', uhr: 'Der perfekte Augenblick',
};

const HG_DESC = {
  laterne: 'Sechs Laternen in einem Monstergebiet, eine Nacht lang gegen fünfzehn Wesen gehalten, die nur das Licht töten kann. Am Ende steht der Wächter zwischen drei brennenden Flammen, und du rufst den Sonnenaufgang.',
  faden: 'Fünf Fäden an fünf Wesen aus fünf Gebieten. Im Schlaf ziehst du sie zusammen und stehst ihnen allen zugleich gegenüber, dann dem Wächter. Im Traum heilt nichts.',
  maske: 'Ohne Pfad, ohne Gabe, im Gesicht eines gewöhnlichen Menschen: einen Beyonder der Sequenz 5 oder höher besiegen und verschonen, danach den Wächter, noch immer als niemand.',
  echo: 'Taub. Drei Kämpfe und der Wächter, ohne Ringe, ohne Warnklang. Nur das Auge sagt dir, wann der Schlag kommt.',
  kessel: 'Fünf neue Essenzen, im Ritual gebraut und nacheinander getrunken. Dann der Wächter, und Schaden richtet nur an, was aus einer Flasche kommt.',
  eisen: 'Fünf Artefakte und doppelte Last auf einem Körper ohne Rüstung. Der Wächter kommt zu dir. Fünf Runden lang darfst du ihn nicht fällen und nie ausweichen.',
  schluessel: 'Der Schatten löst sich vom Körper. Mit vierzig von hundert Teilen Leben, ohne Heilung, ohne Parade, zwei Gegner und dann der Wächter.',
  waage: 'Alles abgelegt. Mit selbst gewähltem Kapital in einen Zirkel und jedes Los kaufen, das dort angeboten wird. Dann der Wächter, nur mit dem Gekauften.',
  moor: 'Fünf okkulte oder seltene Dinge mit der Kraft des Moores zersetzen und aus den Resten ein Relikt formen. Mit ihm den Wächter besiegen und jede Runde eine Flasche Moorwasser trinken.',
  uhr: 'Drei Monster, jedes greift an, und jeder Schlag wird im perfekten Augenblick ausgewichen. Beim Wächter darfst du dich dreimal verfehlen.',
};

/** Die fünf Ritual-Essenzen des Kessels: erst brau- und sichtbar, wenn Sequenz 5 voll verdaut ist und die Formel der 4 im Gepäck liegt. */
export const HG_SUDE = [
  { id: 's4ke_nachtschierling', name: 'Nachtschierling', zutaten: { schattenpilz: 1, grabmoos: 2 }, desc: 'Schwärzer, als das Glas dick ist, und bitter wie Schierling. Die erste der fünf Essenzen.' },
  { id: 's4ke_aetzwasser', name: 'Ätzwasser', zutaten: { kroetenschleim: 2, bitterwurz: 1 }, desc: 'Frisst sich in den Korken. Die zweite der fünf Essenzen.' },
  { id: 's4ke_knallsud', name: 'Knallsud', zutaten: { gluehwurmasche: 2, sternglas: 1 }, desc: 'Knistert im Glas wie ein Docht kurz vor dem Pulver. Die dritte der fünf Essenzen.' },
  { id: 's4ke_frostlauge', name: 'Frostlauge', zutaten: { nebeltau: 2, silberstaub: 1, mondmohn: 1 }, desc: 'Beschlägt das Glas von innen mit Raureif. Die vierte der fünf Essenzen.' },
  { id: 's4ke_glutschleim', name: 'Glutschleim', zutaten: { ochsenblut: 1, leuchtmoos: 2 }, desc: 'Zäh, rotglühend, klebt an allem. Die fünfte der fünf Essenzen.' },
];

export const MOORWASSER = 'moorwasser';
export const RELIKT = 's4mo_relikt'; // IDs nach Codex DN/DR (PR #323), damit spätere Grafik und Texte passen

export const SEQ4_ITEMS = {
  ...Object.fromEntries(HG_SUDE.map((s) => [s.id, { name: s.name, kind: 'trophy', weight: 0.5, hg_sud: true, desc: `${s.desc} Nur für das Ritual des Kessels (Sequenz 4), im Pfad-Tab trinken.` }])),
  // Wurfflaschen: Schaden aus der Flasche (auch im Ritual des Kessels erlaubt), doppelt gegen Okkultes
  wurf_saeure: { name: 'Säurephiole', kind: 'consumable', combat_only: true, damage: 22, price: 45, weight: 0.5, desc: 'Ein dünnwandiges Glas voll grüner Säure. Nur im Kampf: 22 Schaden, doppelt gegen Okkultes.' },
  wurf_gift: { name: 'Giftphiole', kind: 'consumable', combat_only: true, damage: 6, burn: [10, 3], price: 40, weight: 0.5, desc: 'Ein Schwall gelben Dunstes. Nur im Kampf: 6 Schaden, dann drei Runden je 10 Gift.' },
  wurf_spreng: { name: 'Sprengflasche', kind: 'consumable', combat_only: true, damage: 34, price: 70, weight: 1, desc: 'Lampenöl, Pulver und ein Docht. Nur im Kampf: 34 Schaden, doppelt gegen Okkultes.' },
  s4sc_schattenband: { name: 'Schattenband', kind: 'trophy', weight: 0, price: 0, desc: 'Ein schwarzblaues Band, zu einem Schlüssel geknotet. Es blieb zurück, als der Schatten wieder an deine Fersen fand. Andenken an das Ritual des Schlüssels.' },
  [RELIKT]: { name: 'Relikt des Verfalls', kind: 'artifact', weight: 1, boons: [{ key: 'occult_mult', value: 1, text: 'Trägt Eigenschaften der fünf zersetzten Dinge (je Spieler verschieden).' }], curses: [{ key: 'unruhe_tick', value: 0, text: 'Was im Moor zerfällt, zerfällt weiter.' }], desc: 'Aus fünf zersetzten Dingen geformt, schwarz wie Torf und warm wie ein Atem. Es trägt Eigenschaften seiner Herkunft, bei jedem anders.' },
};

/** Wer die Wurfflaschen führt (Wexmoor und später). Moorwasser gibt es nicht im Laden (die Zirkel suchen es), es fällt in den Mooren. */
const STOCK = {
  wx_pfandleiherin: [{ item: 'wurf_saeure', price: 45 }, { item: 'wurf_gift', price: 40 }, { item: 'wurf_spreng', price: 70 }],
  k3h_troedlerin: [{ item: 'wurf_saeure', price: 50 }, { item: 'wurf_gift', price: 45 }, { item: 'wurf_spreng', price: 80 }],
};

/** Wexmoor-Einnahmen (Seb): wer für das Waage-Ritual bis zu 10 000 Schilling braucht, soll sie dort ehrlich erfarmen können. */
export const WX_MONEY_MULT = 3; // Seb 2026-11-12: ×6 war viel zu viel

/** Kessel-Essenzen mit den Zutaten und Wirkungstexten aus Codex DR (kessel_rezepte.json), je eine Zutat plus Leeres Gefäß. */
function drSude(dr) {
  return HG_SUDE.map((s) => {
    const r = dr?.kessel_rezepte?.[s.id];
    if (!r) return s;
    return { ...s, name: r.name ?? s.name, zutaten: Object.fromEntries((r.zutaten_vorschlag ?? []).map((z) => [z, 1])), desc: `${r.desc} Getrunken: ${r.wirkung_trinken} Geworfen: ${r.wirkung_wurf}`, wirkung: r.wirkung_trinken };
  });
}

/** dr: Codex-Paket DR (data/seq4Dr.js), optional. */
export function applySeq4(content, dr = null) {
  const sude = drSude(dr);
  content.seq4Sude = sude;
  content.items = { ...content.items, ...SEQ4_ITEMS };
  for (const s of sude) content.items[s.id] = { ...content.items[s.id], name: s.name, desc: `${s.desc} Nur für das Ritual des Kessels (Sequenz 4), im Pfad-Tab trinken.` };
  // Rituale der Sequenz 4: Prüfung statt Ortsbindung
  const pathways = {};
  for (const [pid, p] of Object.entries(content.pathways)) {
    const r = p.seqs?.[4]?.ritual;
    const kind = HG_KIND[pid];
    if (!r || !kind) { pathways[pid] = p; continue; }
    const { map, also_maps, vision, requires, ...rest } = r;
    const req = { ...(requires ?? {}) };
    delete req.requires_flags;
    const t = dr?.rituale?.[DR_KEY[kind]];
    pathways[pid] = { ...p, seqs: { ...p.seqs, 4: { ...p.seqs[4], ritual: { ...rest, name: t?.name ?? HG_NAMES[kind], desc: t?.desc ? pct(t.desc) : HG_DESC[kind], hg: kind, ordeal: true, ...(Object.keys(req).length ? { requires: req } : {}) } } } };
  }
  content.pathways = pathways;
  const m = content.market;
  if (m) {
    const merchants = { ...m.merchants };
    for (const [mid, extra] of Object.entries(STOCK)) {
      if (!merchants[mid]) continue;
      const have = new Set(merchants[mid].stock.map((e) => e.item));
      merchants[mid] = { ...merchants[mid], stock: [...merchants[mid].stock, ...extra.filter((e) => !have.has(e.item))] };
    }
    content.market = { ...m, merchants };
  }
  // Wexmoor: Gegner in den Gebieten tragen mehr Geld bei sich
  const wx = new Set(Object.entries(content.maps).filter(([, mp]) => mp.city === 'wexmoor').map(([id]) => id));
  const loot = { ...content.loot };
  for (const [id, enc] of Object.entries(content.encounters)) {
    if (!wx.has(enc.zone) || !loot[id]?.money || loot[id].wx_buffed) continue;
    loot[id] = { ...loot[id], money: loot[id].money.map((v) => Math.round(v * WX_MONEY_MULT)), wx_buffed: true };
  }
  content.loot = loot;
  applySeq4Dr(content, dr); // Codex DR: Texte, Wächterzeilen, Gerede, Zeitung, Wexmoor-Einnahmen
  return content;
}

export { LEERES_GEFAESS };
