/**
 * Die zehn Pfadviertel in Calderwick ausgebaut (Seb 2026-11-15): „jeder Pfad soll dort lange etwas zu tun haben, und die Items, die
 * man für die Formeln braucht, sollen dort auffindbar sein“.
 *
 * Je Viertel (o3_<pfad>, data/aufstieg.js CW_GEBIETE):
 * - Eine Kette „Das Herz des Viertels“: sechs Verderbnisherde, jeder stärker als der vorige, dazwischen Spuren, am Ende das Herz der
 *   Verderbnis (Boss, auf Sequenz 3 zugeschnitten). Herd 4 gibt die Kernzutat 2, das Herz die Kernzutat 1 dieses Pfades.
 * - Ein Krämer der Gilde: Grundzutaten der hohen Tränke (Nebeltau, Silberstaub; Geisteressenz nur als Beute) und die Formeln der dritten Sequenz
 *   dieses Pfades, Trank- und Ritualformel je 30.000 Schilling (Seb 2026-11-26; vorher 15.000).
 * - Die Viertel-Monster lassen die Grundzutaten fallen.
 * Damit liegt alles für die Tränke 3/2/1 im eigenen Viertel: Kernzutat 3 (Oberhaupt, data/seqHoch.js), 2 und 1 (diese Kette),
 * Formeln 3 (Krämer), 2 (Archiv), 1 (Inschriften), Grundzutaten (Krämer, Beute).
 *
 * Außerdem behoben: Die Codex-Ersatzquellen cwo_kern_1/2/3 fragten nach `sq_laterne` usw. statt der echten Pfad-Ids.
 */
import { CW_GEBIETE } from './aufstieg.js';
import { freieKachel, schlag } from './calderwickStory.js';
import { kernzutat, ritualformel } from './seqHoch.js';

export const FORMEL3_PREIS = 30000; // Seb 2026-11-26: 30.000 statt 15.000, dafür ab Seq 4 eine zufällige Seq-3-Formel je Zirkeltreffen
// Geisteressenz bleibt marktfrei (tests/treffen.test.js: ab Seq 7 nur Treffen/Beute), sie fällt bei Viertel-Monstern und Herden
const GRUNDZUTATEN = [['nebeltau', 30], ['silberstaub', 90]];
const BEUTE_ZUTATEN = ['nebeltau', 'geisteressenz', 'silberstaub'];
/** Herde 1–6 (Elite) und das Herz (Boss): Leben und stärkster Schlag. Ziel: Herde 1–3 für Seq 4, ab 4 zäh, das Herz für Seq 3. */
export const HERDE = [
  { hp: 2200, dmg: 54 }, { hp: 2600, dmg: 58 }, { hp: 3000, dmg: 62 }, { hp: 3600, dmg: 66 }, { hp: 4200, dmg: 70 }, { hp: 5000, dmg: 74 },
];
export const HERZ = { hp: 12000, dmg: 104 }; // Kernzutat 1: auf Seq 3 nur sehr geübt, eigentlich etwas für Seq 2 (tools/sim/kapitel4.mjs)
const KERN2_AB = 4;

/** Je Pfad: Namen der sechs Herde, das Herz und was man an den Spuren findet. */
export const VIERTEL = {
  laterne: { herde: ['Die schwarze Laterne', 'Der Lampenwärter ohne Augen', 'Das Fenster, das morgen zeigt', 'Die Dochtwitwe', 'Der Schattenwerfer', 'Die Lichtzehrerin'],
    herz: 'Die Sonne unter dem Pflaster', spur: 'Ruß, der nach oben fällt. Wo er sich sammelt, brennt eine Laterne schwarz.' },
  faden: { herde: ['Der Knoten im Hof', 'Die Wäscheleine der Fremden', 'Der Erinnerungsdieb', 'Die Haspel ohne Hand', 'Der Webstuhl, der atmet', 'Die Spinnerin der Nachbarn'],
    herz: 'Das Garn, aus dem alle sind', spur: 'Ein Faden, der aus einer Mauer wächst. Wer ihm folgt, erinnert sich an Straßen, die er nie gegangen ist.' },
  maske: { herde: ['Das Gesicht im Rinnstein', 'Der Hutmacher ohne Kopf', 'Die Trockenleine der Gesichter', 'Der Doppelgänger vom Eck', 'Die Larve, die zurückschaut', 'Der Mann mit allen Gesichtern'],
    herz: 'Das erste Gesicht', spur: 'Eine abgelegte Maske, noch warm. Darunter liegt kein Gesicht, nur ein Abdruck.' },
  echo: { herde: ['Das dritte Echo', 'Die Glocke ohne Klöppel', 'Der Rufer im Schacht', 'Die Stimme deiner Mutter', 'Der Chor aus Nachbarn', 'Das Lied, das zuhört'],
    herz: 'Der erste Laut', spur: 'Eine Stelle, an der jedes Geräusch verschwindet. Tage später kommt es woanders wieder heraus, mit fremden Worten.' },
  kessel: { herde: ['Der Gullysieder', 'Die Pfütze, die kocht', 'Der Nachbar im Topf', 'Die grüne Dampfwitwe', 'Der Abschäumer', 'Die Mutter aller Sude'],
    herz: 'Der Kessel unter der Stadt', spur: 'Ein Rinnstein voll warmem, grünem Sud. Etwas darin hat einmal gewunken.' },
  eisen: { herde: ['Der Rostkriecher', 'Die Wand, die näher kommt', 'Der vernietete Briefträger', 'Die Last ohne Träger', 'Der Amboss, der schlägt', 'Die eiserne Hausmutter'],
    herz: 'Das Gewicht der Stadt', spur: 'Ein Pflasterstein, der dreimal so schwer ist wie seine Nachbarn. Rost wächst daraus wie Moos.' },
  schluessel: { herde: ['Die Tür zur falschen Küche', 'Der Schlüssel ohne Bart', 'Das Schloss, das beißt', 'Die Treppe nach gestern', 'Der Türsteher aller Türen', 'Die Wohnung, die wandert'],
    herz: 'Die erste Tür', spur: 'Eine Tür mitten auf der Straße, ohne Haus dahinter. Auf der Rückseite hängt dein Mantel.' },
  sq_waage: { herde: ['Der Zöllner des Atems', 'Die Waage im Fenster', 'Der Schuldeneintreiber', 'Die leichte Witwe', 'Der Wäger der Nachbarn', 'Das Gewicht ohne Besitzer'],
    herz: 'Die Waage, die alles wiegt', spur: 'Eine Münze auf dem Pflaster, die niemand aufhebt. Wer es tut, wird ein wenig leichter.' },
  sq_moor: { herde: ['Der Torfkeller', 'Die Straße, die festhält', 'Der Wurzelnachbar', 'Die Moorleiche vom Brunnen', 'Der Faulgräber', 'Die alte Torva aus Torf'],
    herz: 'Das Moor, das sich erinnert', spur: 'Torf quillt aus einem Kellerfenster. Darin stecken Fußabdrücke von Leuten, die noch leben.' },
  sq_uhr: { herde: ['Die stehende Minute', 'Der Läufer zwischen zwei Schritten', 'Die Turmuhr ohne Zeiger', 'Der Schatten, der vorausläuft', 'Die Unruh im Keller', 'Der Mann, der schon gegangen ist'],
    herz: 'Die Stunde, die nicht schlägt', spur: 'Eine Pfütze, die nicht kräuselt, obwohl es regnet. Darin spiegelt sich der gestrige Himmel.' },
};

const herdId = (pid, i) => `o3_${pid}_herd${i}`;
const herzId = (pid) => `o3_${pid}_herz`;
const spurFlag = (pid, i) => `o3_${pid}_spur${i}`;
const kraemerId = (pid) => `o3_${pid}_kraemer`;

function angleichen(base, { hp, dmg }) {
  const top = Math.max(1, ...base.attacks.filter((a) => !a.action).map((a) => a.damage ?? 0));
  return base.attacks.map((a) => (a.action ? a : { ...a, damage: Math.round(((a.damage ?? 0) * dmg) / top) }));
}

function herdKampf(content, pid, i, cw) {
  const v = VIERTEL[pid];
  const pool = Object.keys(content.encounters).filter((id) => new RegExp(`^o3_${pid}_g\\d+$`).test(id));
  const base = content.encounters[pool[(i - 1) % pool.length]];
  const z = HERDE[i - 1];
  return {
    id: herdId(pid, i), name: `${v.herde[i - 1]}`, sprite: 'wild', sheet: base.sheet, occult: true, pathway: pid,
    chapter: 5, boss: false, elite: true, hp: z.hp, armor: 6 + i, dmg_mult: 1, max_round_dmg: 0.3, fleeable: true, zone: `o3_${pid}`,
    attacks: angleichen(base, z),
    intro: `${i}. Herd der Verderbnis im ${cw.viertel.replace(/^Das /, '')}: ${v.herde[i - 1]}. ${cw.verderbnis.split('. ')[0]}.`,
    win_text: `${v.herde[i - 1]} zerfällt. Für einen Atemzug ist das Viertel ein ganz gewöhnliches Viertel. Dann nicht mehr.`,
    lose_to: { map: `o3_${pid}`, spawn: 'default' }, lose_money: 0, lose_text: 'Du kommst am Rand des Viertels zu dir. Der Herd brennt weiter.', flee_text: 'Du weichst zurück. Der Herd folgt dir nicht, er muss nicht.',
    on_win: {},
  };
}

function herzKampf(content, pid, cw) {
  const v = VIERTEL[pid];
  const chef = content.encounters[`o3_${pid}_tiefe`] ?? content.encounters[`o3_${pid}_g1`];
  return {
    id: herzId(pid), name: v.herz, sprite: 'wild', sheet: chef.sheet, tint: '#ffe0e0', occult: true, pathway: pid,
    chapter: 5, boss: true, elite: false, tier_seq: 3, hp: HERZ.hp, armor: 10, dmg_mult: 1, max_round_dmg: 0.2, fleeable: true, zone: `o3_${pid}`, duo_hp_mult: 2.2,
    attacks: [...angleichen(chef, HERZ), { name: 'Verderbnis', action: 'guard', value: 10, text: 'Das Viertel legt sich um sein Herz: +10 Abwehr.' }],
    intro: `Unter dem ${cw.viertel.replace(/^Das /, '')} schlägt etwas. ${v.herz}. Alles, was hier verdorben ist, kommt von hier: ${cw.verderbnis}`,
    win_text: `${v.herz} hört auf zu schlagen. Das Viertel bleibt verdorben, aber es wächst nicht mehr. In der Asche liegt etwas, das nur ein Pfad je gebraucht hat.`,
    lose_to: { map: `o3_${pid}`, spawn: 'default' }, lose_money: 0, lose_text: 'Das Herz stößt dich aus wie einen Splitter. Du liegst am Eingang des Viertels.', flee_text: 'Du fliehst aus dem Takt des Herzens.',
    on_win: {},
  };
}

/** Ein Krämer je Viertel: Grundzutaten und die Formeln der dritten Sequenz dieses Pfades. */
function kraemer(content, pid, cw) {
  const stock = [...GRUNDZUTATEN.map(([item, price]) => ({ item, price })),
    ...(content.items[`formel_${pid}_3`] ? [{ item: `formel_${pid}_3`, price: FORMEL3_PREIS }] : []),
    ...(content.items[ritualformel(pid)] ? [{ item: ritualformel(pid), price: FORMEL3_PREIS }] : [])];
  content.market.merchants[kraemerId(pid)] = { name: `Krämer im ${cw.viertel.replace(/^Das /, '')}`, title: `Gildenkrämer: ${cw.viertel}`, greeting: 'Was die Gilde nicht braucht, verkaufe ich. Was sie braucht, auch, nur teurer.', stock };
  content.dialogues[kraemerId(pid)] = {
    start: 'start',
    nodes: {
      start: { text: `Zwischen zwei verdorbenen Häusern hat jemand einen Stand aufgebaut, als wäre nichts. „Nebeltau und Silberstaub. Geisteressenz musst du dir aus den Monstern schneiden. Und die Formeln der dritten Sequenz für diesen Pfad, Trank und Ritual, je ${FORMEL3_PREIS.toLocaleString('de-DE')} Schilling. Auf den Zirkeln taucht mal eine auf, aber welche, entscheidet das Glück.“`,
        choices: [{ text: 'Waren und Preise ansehen.', shop: kraemerId(pid) }, { text: 'Für heute genug.' }] },
    },
  };
}

export function applyPfadviertel(content) {
  for (const [pid, cw] of Object.entries(CW_GEBIETE)) {
    const map = content.maps[`o3_${pid}`];
    const v = VIERTEL[pid];
    if (!map || !v || !content.pathways[pid]) continue;
    // Grundzutaten fallen bei den Viertel-Monstern
    for (const id of Object.keys(content.encounters).filter((x) => new RegExp(`^o3_${pid}_g\\d+$`).test(x))) {
      const l = content.loot[id] ?? { money: [0, 0], drops: [] };
      content.loot[id] = { ...l, drops: [...(l.drops ?? []).filter((d) => !BEUTE_ZUTATEN.includes(d.item)), { item: 'nebeltau', chance: 0.25 }, { item: 'geisteressenz', chance: 0.2 }, { item: 'silberstaub', chance: 0.2 }] };
    }
    // Herde und Herz
    for (let i = 1; i <= HERDE.length; i++) {
      content.encounters[herdId(pid, i)] = herdKampf(content, pid, i, cw);
      content.loot[herdId(pid, i)] = { money: [1500 + 500 * i, 1500 + 500 * i], drops: [{ item: 'geisteressenz', chance: 1 }, { item: 'silberstaub', chance: 1 }, { item: 'nebeltau', chance: 1 }] };
    }
    content.encounters[herzId(pid)] = herzKampf(content, pid, cw);
    content.loot[herzId(pid)] = { money: [12000, 12000], drops: [] };
    kraemer(content, pid, cw);
    // Karte: Krämer am Eingang, Spuren und Herde quer durchs Viertel, das Herz in der Tiefe
    const near = map.spawns.default;
    const it = [];
    it.push({ id: kraemerId(pid), kind: 'dialogue', dialogue: kraemerId(pid), tile: freieKachel(map, { near: [near[0] + 3, near[1] + 2] }), prompt: 'Der Krämer der Gilde', marker: true, visible_if: { requires_flags: ['k4_arrived'] } });
    map.interactables.push(it[0]);
    for (let i = 1; i <= HERDE.length; i++) {
      const vor = i === 1 ? ['k4_arrived'] : [`won_${herdId(pid, i - 1)}`];
      const spur = { id: `o3_${pid}_spur${i}`, kind: 'read', tile: freieKachel(map, { seed: `o3|${pid}|spur${i}`, minDist: 6 + 3 * i }), prompt: 'Eine Spur der Verderbnis', title: `${cw.viertel}: Spur ${i}`, marker: true,
        visible_if: { requires_flags: vor, hide_if_flags: [spurFlag(pid, i)] }, done_flag: spurFlag(pid, i),
        text: `${v.spur}\n\nDie Spur führt tiefer ins Viertel, zu einem Herd der Verderbnis: ${v.herde[i - 1]}.` };
      map.interactables.push(spur);
      const herd = { id: herdId(pid, i), kind: 'combat', encounter: herdId(pid, i), tile: freieKachel(map, { seed: `o3|${pid}|herd${i}`, minDist: 8 + 3 * i }), prompt: v.herde[i - 1], marker: true,
        visible_if: { requires_flags: [spurFlag(pid, i)], hide_if_flags: [`won_${herdId(pid, i)}`] } };
      map.interactables.push(herd);
    }
    // Kernzutat 2 nach dem 4. Herd, Kernzutat 1 im Herz
    content.encounters[herdId(pid, KERN2_AB)].first_win = { gives_items: { [kernzutat(pid, 2)]: 1 } };
    content.encounters[herdId(pid, KERN2_AB)].win_text += ` In der Asche liegt ${content.items[kernzutat(pid, 2)]?.name ?? 'eine Kernzutat'}: die Kernzutat der zweiten Sequenz dieses Pfades.`;
    content.encounters[herzId(pid)].first_win = { gives_items: { [kernzutat(pid, 1)]: 1 } };
    content.encounters[herzId(pid)].win_text += ` ${content.items[kernzutat(pid, 1)]?.name ?? 'Die Kernzutat'}, die Kernzutat der ersten Sequenz.`;
    map.interactables.push({ id: herzId(pid), kind: 'combat', encounter: herzId(pid), tile: freieKachel(map, { seed: `o3|${pid}|herz`, minDist: 26 }), prompt: v.herz, marker: true,
      visible_if: { requires_flags: [`won_${herdId(pid, HERDE.length)}`], hide_if_flags: [`won_${herzId(pid)}`] } });
    // Auftrag im Notizbuch
    content.quests[`o3_${pid}_herzkette`] = {
      title: `Das Herz des ${cw.viertel.replace(/^Das /, '')}s`, kind: 'side', case: 'kapitel4_aufstieg',
      summary: `${cw.verderbnis} Sechs Herde halten die Verderbnis am Leben, und darunter schlägt ein Herz. Wer sie ausbrennt, findet die Kernzutaten der zweiten und ersten Sequenz für den ${content.pathways[pid].name}.`,
      steps: [...HERDE.map((_, k) => ({ text: `${k + 1}. Herd: ${v.herde[k]}`, done: { requires_flags: [`won_${herdId(pid, k + 1)}`] }, target: { map: `o3_${pid}`, id: `o3_${pid}_spur${k + 1}`, label: cw.viertel } })),
        { text: `Das Herz: ${v.herz}`, done: { requires_flags: [`won_${herzId(pid)}`] }, target: { map: `o3_${pid}`, id: herzId(pid), label: cw.viertel } }],
    };
    const spur1 = map.interactables.find((x) => x.id === `o3_${pid}_spur1`);
    spur1.effects = { start_quests: [`o3_${pid}_herzkette`] };
  }
  // Codex-Ersatzquellen: falsche Pfad-Ids (sq_laterne statt laterne)
  for (const n of [1, 2, 3]) for (const node of Object.values(content.dialogues[`cwo_kern_${n}`]?.nodes ?? {})) for (const ch of node.choices ?? []) {
    if (Array.isArray(ch.requires_pathway) && !content.pathways[ch.requires_pathway[0]]) {
      const echt = ch.requires_pathway[0].replace(/^sq_/, '');
      if (content.pathways[echt]) ch.requires_pathway = [echt, ch.requires_pathway[1]];
    }
  }
  return content;
}
