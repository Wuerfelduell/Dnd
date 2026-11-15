// Englisch für die Calderwick-Pfadviertel (data/pfadviertel.js): baut src/i18n/en/pfadviertel.json aus den echten deutschen Texten
// und denselben Schablonen auf Englisch. Nach Textänderungen in pfadviertel.js neu laufen lassen: node tools/i18n-pfadviertel.mjs
import fs from 'fs';
import { loadContent } from '../tests/helpers.js';
import { CW_GEBIETE } from '../src/data/aufstieg.js';
import { HERDE, FORMEL3_PREIS } from '../src/data/pfadviertel.js';

const c = loadContent();
const dict = {}; for (const f of fs.readdirSync('src/i18n/en')) if (f !== 'pfadviertel.json') Object.assign(dict, JSON.parse(fs.readFileSync(`src/i18n/en/${f}`, 'utf8')));
const tr = (de) => { if (!(de in dict)) throw new Error(`fehlt im Wörterbuch: ${de}`); return dict[de]; };
const EN = {
  laterne: { herde: ['The Black Lantern', 'The Eyeless Lamp-Keeper', 'The Window That Shows Tomorrow', 'The Wick Widow', 'The Shadow Caster', 'The Light Eater'], herz: 'The Sun Beneath the Cobbles', spur: 'Soot that falls upward. Where it gathers, a lantern burns black.' },
  faden: { herde: ['The Knot in the Yard', 'The Strangers\' Washing Line', 'The Memory Thief', 'The Handless Reel', 'The Breathing Loom', 'The Spinner of Neighbours'], herz: 'The Yarn Everyone Is Made Of', spur: 'A thread growing out of a wall. Whoever follows it remembers streets they never walked.' },
  maske: { herde: ['The Face in the Gutter', 'The Headless Hatter', 'The Drying Line of Faces', 'The Double on the Corner', 'The Mask That Looks Back', 'The Man With All Faces'], herz: 'The First Face', spur: 'A discarded mask, still warm. Beneath it lies no face, only an imprint.' },
  echo: { herde: ['The Third Echo', 'The Bell Without a Clapper', 'The Caller in the Shaft', 'Your Mother\'s Voice', 'The Choir of Neighbours', 'The Song That Listens'], herz: 'The First Sound', spur: 'A spot where every sound disappears. Days later it comes out somewhere else, with strange words.' },
  kessel: { herde: ['The Gutter Boiler', 'The Puddle That Boils', 'The Neighbour in the Pot', 'The Green Steam Widow', 'The Skimmer', 'The Mother of All Brews'], herz: 'The Cauldron Beneath the City', spur: 'A gutter full of warm green brew. Something in it once waved.' },
  eisen: { herde: ['The Rust Crawler', 'The Wall That Comes Closer', 'The Riveted Postman', 'The Load Without a Bearer', 'The Anvil That Strikes', 'The Iron House Mother'], herz: 'The Weight of the City', spur: 'A cobblestone three times as heavy as its neighbours. Rust grows from it like moss.' },
  schluessel: { herde: ['The Door to the Wrong Kitchen', 'The Bitless Key', 'The Lock That Bites', 'The Stairs to Yesterday', 'The Doorman of All Doors', 'The Wandering Flat'], herz: 'The First Door', spur: 'A door in the middle of the street with no house behind it. Your coat hangs on the back.' },
  sq_waage: { herde: ['The Toll-Keeper of Breath', 'The Scale in the Window', 'The Debt Collector', 'The Light Widow', 'The Weigher of Neighbours', 'The Ownerless Weight'], herz: 'The Scale That Weighs Everything', spur: 'A coin on the cobbles that nobody picks up. Whoever does grows a little lighter.' },
  sq_moor: { herde: ['The Peat Cellar', 'The Street That Holds On', 'The Root Neighbour', 'The Bog Body by the Well', 'The Rot Digger', 'Old Torva Made of Peat'], herz: 'The Bog That Remembers', spur: 'Peat oozes from a cellar window. In it are footprints of people who are still alive.' },
  sq_uhr: { herde: ['The Standing Minute', 'The Runner Between Two Steps', 'The Tower Clock Without Hands', 'The Shadow That Runs Ahead', 'The Balance Wheel in the Cellar', 'The Man Who Has Already Left'], herz: 'The Hour That Does Not Strike', spur: 'A puddle that does not ripple although it is raining. It mirrors yesterday\'s sky.' },
};
const out = {};
const put = (de, en) => { if (de) out[de] = en; };
const n = (x) => x.toLocaleString('en-GB');
for (const [pid, cw] of Object.entries(CW_GEBIETE)) {
  if (!c.maps[`o3_${pid}`]) continue;
  const e = EN[pid]; const vEn = tr(cw.viertel); const kurz = vEn.replace(/^The /, ''); const verdEn = tr(cw.verderbnis); const pEn = tr(c.pathways[pid].name);
  for (let i = 1; i <= HERDE.length; i++) {
    const h = c.encounters[`o3_${pid}_herd${i}`];
    put(h.name, e.herde[i - 1]);
    put(h.intro, `Hotbed of corruption no. ${i} in the ${kurz}: ${e.herde[i - 1]}. ${verdEn.split('. ')[0].replace(/\.$/, '')}.`);
    put(h.win_text, `${e.herde[i - 1]} crumbles. For one breath the quarter is a perfectly ordinary quarter. Then it is not.` + (i === 4 ? ` In the ash lies ${tr(c.items[`sq_zutat_${pid.replace(/^sq_/, '')}_2`].name)}: the core ingredient of this pathway's second sequence.` : ''));
    const sp = c.maps[`o3_${pid}`].interactables.find((x) => x.id === `o3_${pid}_spur${i}`);
    put(sp.title, `${vEn}: trace ${i}`);
    put(sp.text, `${e.spur}\n\nThe trace leads deeper into the quarter, to a hotbed of corruption: ${e.herde[i - 1]}.`);
  }
  const hz = c.encounters[`o3_${pid}_herz`];
  put(hz.name, e.herz);
  put(hz.intro, `Something beats beneath the ${kurz}. ${e.herz}. Everything corrupted here comes from here: ${verdEn}`);
  put(hz.win_text, `${e.herz} stops beating. The quarter stays corrupted, but it no longer grows. In the ash lies something only one pathway has ever needed. ${tr(c.items[`sq_zutat_${pid.replace(/^sq_/, '')}_1`].name)}, the core ingredient of the first sequence.`);
  const m = c.market.merchants[`o3_${pid}_kraemer`];
  put(m.name, `Trader in the ${kurz}`); put(m.title, `Guild trader: ${vEn}`);
  const q = c.quests[`o3_${pid}_herzkette`];
  put(q.title, `The Heart of the ${kurz}`);
  put(q.summary, `${verdEn} Six hotbeds keep the corruption alive, and beneath them beats a heart. Whoever burns them out finds the core ingredients of the second and first sequence for the ${pEn}.`);
  q.steps.forEach((st, k) => put(st.text, k < HERDE.length ? `Hotbed ${k + 1}: ${e.herde[k]}` : `The heart: ${e.herz}`));
}
const any = Object.keys(c.dialogues).find((k) => /^o3_\w+_kraemer$/.test(k));
put(c.dialogues[any].nodes.start.text, `Between two corrupted houses someone has set up a stall as if nothing were wrong. "Mist dew and silver dust. Spirit essence you will have to cut out of the monsters yourself. And the formulas of the third sequence for this pathway, potion and ritual, ${n(FORMEL3_PREIS)} shillings each. You won't get them cheaper anywhere, because you won't get them anywhere else."`);
Object.assign(out, {
  'Was die Gilde nicht braucht, verkaufe ich. Was sie braucht, auch, nur teurer.': 'What the guild does not need, I sell. What it does need, too, only dearer.',
  'Waren und Preise ansehen.': dict['Waren und Preise ansehen.'] ?? 'View goods and prices.', 'Für heute genug.': dict['Für heute genug.'] ?? 'Enough for today.',
  'Der Krämer der Gilde': 'The guild trader', 'Eine Spur der Verderbnis': 'A trace of corruption',
  'Du kommst am Rand des Viertels zu dir. Der Herd brennt weiter.': 'You come to at the edge of the quarter. The hotbed keeps burning.',
  'Du weichst zurück. Der Herd folgt dir nicht, er muss nicht.': 'You fall back. The hotbed does not follow you. It does not need to.',
  'Das Viertel legt sich um sein Herz: +10 Abwehr.': 'The quarter wraps itself around its heart: +10 defense.', Verderbnis: 'Corruption',
  'Das Herz stößt dich aus wie einen Splitter. Du liegst am Eingang des Viertels.': 'The heart expels you like a splinter. You lie at the entrance of the quarter.',
  'Du fliehst aus dem Takt des Herzens.': 'You flee the rhythm of the heart.',
});
fs.writeFileSync('src/i18n/en/pfadviertel.json', JSON.stringify(out, null, 1));
console.log(Object.keys(out).length);
