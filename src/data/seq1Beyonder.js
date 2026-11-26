/**
 * Seq-1-Beyonder in Briarholt (Seb 2026-11-26): Für jeden der zehn Pfade steht in Briarholt ein Beyonder der Sequenz 1.
 * Sie werden später für Sequenz 0 gebraucht (noch nicht gebaut): Ihre Beute ist die Charakteristik ihres Pfades
 * (`char_seq1_<pfad>`, Platzhalter, wird nirgends verbraucht).
 *
 * - Ansprechbar (eigene Figur mit Skript-Palette, kurzer Dialog), auf Wunsch Kampf.
 * - Höhere Wesen mit `min_seq: 1`: Wer schwächer ist als Sequenz 1, kratzt sie nur (SEQ_WARD_MULT). Seb: Zwei Engel
 *   (Seq 2) im Koop dürfen nicht gewinnen können. Prüfung: tools/sim/seq1_beyonder.mjs.
 * - Kampf mit den Pfad-Fertigkeiten der Sequenz 1 (gegnerBeyonder.pfadAngriffe) auf den eigenen Schlägen, Zorn-Phase.
 * - Keine Spätleben-Skalierung (`spaet_leben`), feste Koop-Leben (`duo_hp_mult`).
 */
import { freieKachel } from './calderwickStory.js';
import { einmischen, pfadAngriffe } from './gegnerBeyonder.js';

/** Leben allein (vor ENEMY_HP_MULT) und Koop-Aufschlag. Engel (hs2) zum Vergleich: 13.000–17.000. */
export const SEQ1_HP = 22000;
export const SEQ1_DUO_HP_MULT = 1.6;
export const charId = (pid) => `char_seq1_${pid}`;

const schlag = (name, damage, hits, extra = {}) => ({ name, damage, hits, ...extra });

/**
 * Je Pfad: Figur, Ort, Gruß, Herausforderung, Sieg und Niederlage (DE + EN).
 */
export const SEQ1_BEYONDER = {
  laterne: { name: 'Ysolde Wick', map: 'bh_winterpromenade', palette: { coat: '#e8d8a0', hat: '#b89040', skin: '#e0c8a8', hair: '#f4ecd0', legs: '#6a5a30', scarf: '#fff4c0' },
    gruss: 'Eine Frau steht unter einer Laterne, die nicht brennt, und trotzdem ist es um sie herum hell. Man sieht alles. Auch Dinge, die man lieber nicht sähe.\n\n„Ich sehe, was du bist, und was du noch nicht bist“, sagt sie. „Sequenz 1. Darüber ist nur noch einer.“',
    gruss_en: 'A woman stands beneath a lantern that is not lit, and yet it is bright all around her. You can see everything. Even things you would rather not see.\n\n"I see what you are, and what you are not yet," she says. "Sequence 1. Above that there is only one."' },
  faden: { name: 'Bram Ossery', map: 'bh_kutschenhof', palette: { coat: '#6a4a7a', hat: '#3a2a48', skin: '#d8b898', hair: '#2a2028', legs: '#2a2030', scarf: '#c0a0e0' },
    gruss: 'Ein Mann sitzt auf einem Kutschbock ohne Pferde und hält eine Handvoll Fäden. Jeder führt irgendwohin in die Stadt. Einer führt zu dir.\n\n„Ich halte Briarholt zusammen“, sagt er. „Nicht die Stadt. Den Zusammenhang. Willst du sehen, wie fest er ist?“',
    gruss_en: 'A man sits on a coach box without horses, holding a handful of threads. Each leads somewhere into the city. One leads to you.\n\n"I hold Briarholt together," he says. "Not the city. The connection. Do you want to see how strong it is?"' },
  maske: { name: 'Die Frau ohne Mietvertrag', name_en: 'The Woman Without a Lease', map: 'bh_pavillon', palette: { coat: '#a03040', hat: '#401018', skin: '#f0d8c0', hair: '#101010', legs: '#301018', scarf: '#f0f0f0' },
    gruss: 'Sie trägt kein Gesicht, das jemand anderem gehört. Es ist ihr eigenes, und genau deshalb kann man es sich nicht merken.\n\n„Ich habe jede Rolle gespielt, die diese Welt zu vergeben hat“, sagt sie. „Jetzt spiele ich nur noch mich. Möchtest du gegen mich auftreten?“',
    gruss_en: 'She wears no face that belongs to anyone else. It is her own, and that is exactly why you cannot remember it.\n\n"I have played every role this world has to give," she says. "Now I only play myself. Would you like to perform against me?"' },
  echo: { name: 'Hesper Dunmore', map: 'bh_stillenhaeuser', palette: { coat: '#405868', hat: '#203038', skin: '#d0c0b0', hair: '#a0a8b0', legs: '#203038', scarf: '#90c0d0' },
    gruss: 'In den Stillenhäusern ist es leise. Um diesen Mann herum ist es lauter als Stille: Man hört jedes Wort, das hier je gesagt wurde, gleichzeitig.\n\n„Ich bin die letzte Stelle, an der zugehört wird“, sagt er. „Was du jetzt sagst, höre ich noch, wenn du längst gefallen bist.“',
    gruss_en: 'It is quiet in the Silent Houses. Around this man it is louder than silence: you hear every word ever spoken here, all at once.\n\n"I am the last place where anyone listens," he says. "What you say now, I will still hear long after you have fallen."' },
  kessel: { name: 'Mutter Grisel', name_en: 'Mother Grisel', map: 'bh_kesselgrund', palette: { coat: '#5a6a30', hat: '#303818', skin: '#c8b090', hair: '#e0e0d0', legs: '#303818', scarf: '#c0d060' },
    gruss: 'Eine alte Frau rührt in einem Kessel, der größer ist als sie. Was darin kocht, hat keine Farbe, nur Gewicht.\n\n„Nichts geht verloren“, sagt sie. „Kein Rest, kein Tropfen, kein Beyonder. Ich koche aus allem etwas. Auch aus dir, wenn du willst.“',
    gruss_en: 'An old woman stirs a cauldron larger than herself. What boils inside has no colour, only weight.\n\n"Nothing is lost," she says. "No remainder, no drop, no Beyonder. I cook something out of everything. Out of you too, if you like."' },
  eisen: { name: 'Konrad Vass', map: 'bh_wurzelkranz', palette: { coat: '#5a5a60', hat: '#2a2a30', skin: '#c8a888', hair: '#3a3028', legs: '#2a2a30', scarf: '#a0a0a8' },
    gruss: 'Ein Mann lehnt an einer Mauer, die nur noch steht, weil er an ihr lehnt. Er wirkt nicht angestrengt.\n\n„Ich trage seit vierzig Jahren, was andere fallen lassen“, sagt er. „Eine Stadt. Einen Pfad. Ein paar Engel. Du wärst leicht.“',
    gruss_en: 'A man leans against a wall that only still stands because he leans on it. He does not look strained.\n\n"For forty years I have carried what others drop," he says. "A city. A pathway. A few angels. You would be light."' },
  schluessel: { name: 'Niemand Thorne', name_en: 'Nobody Thorne', map: 'bh_kaltes_palmhaus', palette: { coat: '#2a3a30', hat: '#101810', skin: '#d0b898', hair: '#504030', legs: '#101810', scarf: '#80b090' },
    gruss: 'Zwischen den toten Palmen steht ein Mann, und keine Tür in Briarholt ist mehr verschlossen, seit er hier wartet.\n\n„Jede Tür öffnet sich für mich“, sagt er. „Auch die, hinter der Sequenz 0 liegt. Ich gehe nur nicht hindurch. Noch nicht.“',
    gruss_en: 'Among the dead palms stands a man, and no door in Briarholt has stayed locked since he began waiting here.\n\n"Every door opens for me," he says. "Even the one behind which Sequence 0 lies. I just do not walk through it. Not yet."' },
  sq_waage: { name: 'Frau Aldine Quarry', name_en: 'Mrs Aldine Quarry', map: 'bh_glasgaerten', palette: { coat: '#706040', hat: '#40381c', skin: '#e0c8a8', hair: '#c0b090', legs: '#40381c', scarf: '#d0b060' },
    gruss: 'Eine Dame sitzt an einem Gartentisch und unterschreibt Quittungen. Jede ist ein Leben, das jemandem geschuldet wurde und das sie beglichen hat.\n\n„Alles hat seinen Preis“, sagt sie. „Meiner ist hoch. Möchtest du ihn bezahlen?“',
    gruss_en: 'A lady sits at a garden table signing receipts. Each one is a life that was owed to someone and that she has settled.\n\n"Everything has its price," she says. "Mine is high. Would you like to pay it?"' },
  sq_moor: { name: 'Der Torfvater', name_en: 'The Peat Father', map: 'bh_wurzelkammer', palette: { coat: '#3a3020', hat: '#201810', skin: '#a08868', hair: '#605040', legs: '#201810', scarf: '#6a7a40' },
    gruss: 'Zwischen den Wurzeln sitzt etwas, das einmal ein Mann war. Er erinnert sich an alles, was fehlt: an jeden Namen, an jede verlorene Stadt.\n\n„Ich bin, was übrig bleibt, wenn alles vergessen ist“, sagt er. „Komm näher. Das Moor nimmt jeden.“',
    gruss_en: 'Among the roots sits something that was once a man. He remembers everything that is missing: every name, every lost city.\n\n"I am what remains when everything is forgotten," he says. "Come closer. The moor takes everyone."' },
  sq_uhr: { name: 'Meister Tobias Hale', name_en: 'Master Tobias Hale', map: 'bh_verlassene_waescherei', palette: { coat: '#3a4450', hat: '#20262e', skin: '#d0b090', hair: '#d0d0d0', legs: '#20262e', scarf: '#d0a040' },
    gruss: 'Ein Uhrmacher sitzt zwischen den kalten Bottichen. Die Zeit um ihn läuft nicht, sie wartet, bis er ihr erlaubt weiterzugehen.\n\n„Ich gewähre Minuten“, sagt er. „Wem ich keine gewähre, der hat keine. Wie viele willst du?“',
    gruss_en: 'A clockmaker sits among the cold vats. Time around him does not run; it waits until he allows it to move on.\n\n"I grant minutes," he says. "Whoever I grant none to, has none. How many do you want?"' },
};

/** Gemeinsame Texte (DE → EN). */
export const SEQ1_TEXTE = {
  frage: ['Was bist du?', 'What are you?'],
  pfad: ['„Sequenz 1. Über mir gibt es nur noch den Thron, und der ist leer. Wer ihn will, braucht, was ich trage: die Charakteristik meines Pfades. Und um sie zu bekommen, muss man mich besiegen.“',
    '"Sequence 1. Above me there is only the throne, and it is empty. Whoever wants it needs what I carry: the characteristic of my pathway. And to get it, you have to defeat me."'],
  fordern: ['Ich fordere dich heraus.', 'I challenge you.'],
  kampf: ['„Gut. Engel versuchen es oft. Sie fallen immer.“', '"Good. Angels try it often. They always fall."'],
  gehen: ['Gehen.', 'Leave.'],
  zurueck: ['Zurück.', 'Back.'],
  kaempfen: ['Kämpfen.', 'Fight.'],
  besiegt: ['Der Beyonder ist fort. Wo er stand, ist die Luft noch warm.', 'The Beyonder is gone. Where they stood, the air is still warm.'],
  win: ['Der Beyonder sinkt in die Knie. Was von ihm übrig bleibt, ist kein Rest, sondern etwas Ganzes: die Charakteristik der ersten Sequenz. Sie wiegt mehr als du.',
    'The Beyonder sinks to their knees. What remains is not a remnant but something whole: the characteristic of the first Sequence. It weighs more than you.'],
  lose: ['Du wachst am Rand von Briarholt auf. Der Beyonder hat dich nicht getötet. Für ihn warst du keine Gefahr, nur Wetter.',
    'You wake on the edge of Briarholt. The Beyonder did not kill you. To them you were no danger, only weather.'],
  flee: ['Du ziehst dich zurück. Der Beyonder sieht dir nach, ohne sich zu rühren.', 'You withdraw. The Beyonder watches you go without moving.'],
  intro: ['Unter Sequenz 1 prallt fast alles an ihm ab. Zwei Engel reichen nicht.', 'Below Sequence 1 almost everything glances off. Two angels are not enough.'],
  item_desc: ['Die Charakteristik eines Beyonders der Sequenz 1. Sie verbraucht sich nicht und will nichts. Noch nicht: Sie wartet auf Sequenz 0.',
    'The characteristic of a Sequence 1 Beyonder. It does not wear away and wants nothing. Not yet: it waits for Sequence 0.'],
  schlaege: [['Wille der ersten Sequenz', 'Will of the First Sequence'], ['Gewicht des Pfades', 'Weight of the Pathway'], ['Nähe zum Thron', 'Nearness to the Throne'],
    ['Verweigerte Welt', 'Denied World'], ['Erste Sequenz', 'First Sequence']],
  guard: ['Die Welt rückt näher an ihn heran: +8 Abwehr.', 'The world moves closer to them: +8 defence.'],
  phase2: ['Der Beyonder hört auf, sich zurückzuhalten. Für einen Augenblick sieht man die Gestalt dahinter, und sie ist größer als Briarholt.',
    'The Beyonder stops holding back. For a moment you see the form behind them, and it is larger than Briarholt.'],
};
const T = (k) => SEQ1_TEXTE[k][0];
const S = (i) => SEQ1_TEXTE.schlaege[i][0];

/** Dialog-, Rollen- und Namenstexte, die vom Pfad abhängen (DE, EN aus Pfadnamen). */
export function seq1Namen(content, pid, dict = null) {
  const p = content.pathways[pid];
  const sn = p.seqs[1].name;
  const b = SEQ1_BEYONDER[pid];
  const en = (s) => dict?.[s] ?? s;
  const bn = b.name_en ?? b.name;
  return {
    name: [`${b.name}, ${sn}`, `${bn}, ${en(sn)}`],
    role: [`Einzelgänger · ${p.name}, Sequenz 1: ${sn}`, `Loner · ${en(p.name)}, Sequence 1: ${en(sn)}`],
    item: [`Charakteristik Seq 1: ${sn}`, `Characteristic Seq 1: ${en(sn)}`],
  };
}

function kampf(content, pid) {
  const id = `s1b_${pid}`;
  const n = seq1Namen(content, pid);
  const base = {
    id, name: n.name[0], sprite: 'wild', sheet: `hg_battle_${pid}`, tint: '#fff6d0', pathway: pid, occult: true, chapter: 5,
    boss: true, elite: false, beyonder: true, tier_seq: 1, min_seq: 1, hp: SEQ1_HP, armor: 16, dmg_mult: 1, max_round_dmg: 0.16,
    fleeable: true, duo_hp_mult: SEQ1_DUO_HP_MULT, spaet_leben: true, on_win: {},
    attacks: [schlag(S(0), 170, [1000, 1600]), schlag(S(1), 96, [700, 1200, 1700, 2200], { nerves: 14 }),
      { name: S(3), action: 'guard', value: 8, text: T('guard') }, schlag(S(2), 260, [2300], { unparryable: true, nerves: 20 })],
    phase2: { meldung: T('phase2'), attacks: [schlag(S(4), 200, [900, 1500], { unparryable: true }), schlag(S(1), 110, [600, 1000, 1400, 1800]),
      schlag(S(2), 300, [2200], { unparryable: true, nerves: 24 })] },
    intro: `${SEQ1_BEYONDER[pid].gruss.split('\n\n')[0]}\n\n${T('intro')}`,
    win_text: T('win'), lose_text: T('lose'), flee_text: T('flee'),
    lose_money: 0, lose_to: { map: 'bh_kutschenhof', spawn: 'default' },
  };
  // Heilen als Kniff: 3 % statt 10 % der Leben (bei diesen Leben sonst endlos)
  const extra = pfadAngriffe(content, pid, 1, base).map((a) => (a.action === 'heal' ? { ...a, value: Math.round(SEQ1_HP * 0.03), text: a.text.replace(/\d+/, Math.round(SEQ1_HP * 0.03)) } : a));
  return { ...base, attacks: einmischen(base.attacks, extra), phase2: { ...base.phase2, attacks: einmischen(base.phase2.attacks, extra) } };
}

function dialog(id, pid) {
  const b = SEQ1_BEYONDER[pid];
  const hub = { text: b.gruss, choices: [{ text: T('frage'), next: 'pfad' }, { text: T('fordern'), next: 'kampf' }, { text: T('gehen') }] };
  return {
    start: 'hub',
    nodes: {
      hub,
      pfad: { text: T('pfad'), choices: [{ text: T('zurueck'), next: 'hub' }] },
      kampf: { text: T('kampf'), combat: id, choices: [{ text: T('kaempfen') }] },
    },
  };
}

/** In buildContent nach dem zweiten Aufstieg (vor applyGegnerBeyonder/Rest, damit keine Formel und kein Rest dazukommen). */
export function applySeq1Beyonder(content) {
  for (const pid of Object.keys(SEQ1_BEYONDER)) {
    if (!content.pathways[pid]?.seqs?.[1]) continue;
    const b = SEQ1_BEYONDER[pid];
    const map = content.maps[b.map];
    if (!map) continue;
    const id = `s1b_${pid}`;
    const n = seq1Namen(content, pid);
    content.encounters[id] = kampf(content, pid);
    content.items[charId(pid)] = { name: n.item[0], kind: 'key', weight: 0, price: 0, pathway: pid, seq: 1, charakteristik: true, desc: T('item_desc') };
    content.loot[id] = { money: [30000, 30000], drops: [{ item: charId(pid), chance: 1 }] };
    content.npcs[id] = { name: n.name[0], role: n.role[0], dialogue: id, palette: b.palette };
    content.dialogues[id] = dialog(id, pid);
    const tile = freieKachel(map, { seed: id, minDist: 10 });
    for (const mid of [b.map, `${b.map}__warm`]) {
      const m = content.maps[mid];
      if (!m) continue;
      const t = mid === b.map ? tile : freieKachel(m, { near: tile });
      m.npcs = [...(m.npcs ?? []), { id, tile: t, facing: 'down', visible_if: { hide_if_flags: [`won_${id}`] } }];
    }
  }
  return content;
}
