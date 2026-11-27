// Englisch für die Calderwick-Pfadviertel (data/pfadviertel.js): baut src/i18n/en/pfadviertel.json aus den echten deutschen Texten
// und denselben Schablonen auf Englisch. Nach Textänderungen in pfadviertel.js neu laufen lassen: node tools/i18n-pfadviertel.mjs
import fs from 'fs';
import { loadContent } from '../tests/helpers.js';
import { setDict, lookup } from '../src/core/I18n.js';
import { CW_GEBIETE } from '../src/data/aufstieg.js';
import { HERDE, FORMEL3_PREIS } from '../src/data/pfadviertel.js';
import { ORTE } from '../src/data/seqHoch.js';

const c = loadContent();
const dict = {}; for (const f of fs.readdirSync('src/i18n/en')) if (f !== 'pfadviertel.json') Object.assign(dict, JSON.parse(fs.readFileSync(`src/i18n/en/${f}`, 'utf8')));
setDict(dict);
const tr = (de) => { if (!(de in dict) && lookup(de) != null) return lookup(de); if (!(de in dict)) throw new Error(`fehlt im Wörterbuch: ${de}`); return dict[de]; };
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
    put(h.intro, `${h.zwischenboss ? 'Mid-boss. ' : ''}Hotbed of corruption no. ${i} in the ${kurz}: ${e.herde[i - 1]}. ${verdEn.split('. ')[0].replace(/\.$/, '')}.`);
    put(h.win_text, `${e.herde[i - 1]} crumbles. For one breath the quarter is a perfectly ordinary quarter. Then it is not.` + (i === 4 ? ` In the ash lies ${tr(c.items[`sq_zutat_${pid.replace(/^sq_/, '')}_2`].name)}: the core ingredient of this pathway's second sequence.` : ''));
    const sp = c.maps[`o3_${pid}`].interactables.find((x) => x.id === `o3_${pid}_spur${i}`);
    put(sp.title, `${vEn}: trace ${i}`);
    put(sp.text, `${e.spur}\n\nThe trace leads deeper into the quarter, to a hotbed of corruption: ${e.herde[i - 1]}.`);
  }

  // Gildensitz (data/seqHoch.js) und Viertel-Kopf (aufstieg.js)
  const o = ORTE[pid];
  if (o) {
    const g = o.gilde, gE = tr(g), ch = o.chef, chE = tr(ch), nm = o.name, nmE = tr(nm);
    const it = (id) => c.maps[`o3_${pid}`].interactables.find((x) => x.id === id);
    put(`Ein Mitglied von ${g}`, `A member of ${gE}`); put(`Mitglied von ${g}`, `Member of ${gE}`);
    put(`„Die Kernzutat für die dritte Sequenz gibt es nirgends sonst, nicht auf den Treffen, nicht bei den Händlern. Nur hier, beim Oberhaupt. Tritt bei, besteh die fünf Ränge und stell dich ${ch}. Töte das Oberhaupt oder werde selbst eins, für den Kern ist es fast dasselbe. Die Formel musst du dir woanders suchen: selten auf den Zirkeln, noch seltener bei Monstern.“`,
      `“The core ingredient for the third sequence is found nowhere else, not at the meetings, not at the traders. Only here, with the head. Join, pass the five ranks and face the ${chE}. Kill the head or become one yourself; for the core it is almost the same. You will have to look for the formula elsewhere: rarely at the circles, even more rarely from monsters.”`);
    put(`${g} beitreten`, `Join ${gE}`);
    const join = `You lay your hand on the guild's sign. From now on you belong to ${gE}. The five ranks are open to you, and at the end the ${chE}.`;
    put(`Du legst die Hand auf das Zeichen der Gilde. Ab jetzt gehörst du zu ${g}. Die fünf Ränge stehen dir offen, und am Ende ${ch}.`, join);
    put(`Du legst die Hand auf das Zeichen der Gilde. Ab jetzt gehörst du zu ${g}. Die fünf Ränge stehen dir offen, und am Ende ${ch}. Dein Nachbarpfad öffnet dir diese Tür.`, `${join} Your neighbouring pathway opens this door for you.`);
    put(`${ch} herausfordern`, `Challenge the ${chE}`); put(`${ch} töten`, `Kill the ${chE}`); put(`Selbst ${ch} werden`, `Become the ${chE} yourself`);
    put(`Du tötest ${ch}. Aus dem Gewand fällt das Kernstück der Gilde: die Kernzutat der dritten Sequenz. Die Gilde schweigt, und keiner wird dir das je verzeihen.`, `You kill the ${chE}. The guild's centrepiece falls from the robe: the core ingredient of the third sequence. The guild falls silent, and no one will ever forgive you for it.`);
    put(`Du lässt ${ch} leben und nimmst den Platz ein. Mit dem Amt geht dir die Kernzutat der dritten Sequenz zu, die das Oberhaupt verwahrt. Fast dasselbe wie ein Mord, nur dass dich jetzt alle grüßen.`, `You let the ${chE} live and take the seat. With the office comes the core ingredient of the third sequence that the head keeps. Almost the same as a murder, except that now everyone greets you.`);
    put(`${g}: das Archiv`, `${gE}: the archive`); put(`${nm}: der letzte Schrein`, `${nmE}: the last shrine`);
    for (let i = 1; i <= 6; i++) put(`${nm}: Inschrift ${i}`, `${nmE}: inscription ${i}`);
    const t = c.encounters[`o3_${pid}_tiefe`];
    if (t) { put(t.name, `${chE} of ${gE.replace(/^The /, 'the ')}`);
      put(t.intro, `The ${chE} of the guild rises. Whoever defeats the head holds the core ingredient of the third sequence, as murderer or as successor.`);
      put(t.win_text, `The ${chE} lies on the ground. Now you decide: kill, or become the head yourself.`); }
    const kopf = c.maps[`o3_${pid}`].interactables.find((x) => /Beyonder in Menschengestalt/.test(x.text ?? ''));
    if (kopf) { const pp = kopf.text.split('\n\n'); const m2 = pp[pp.length - 1].match(/^Hier sitzt (?:die Gilde „(.+)“|eine Gilde)\. Oberhaupt: (.+)\. Stellvertretung: (.+)\. Beide/);
      if (m2) put(pp[pp.length - 1], `The ${m2[1] ? `guild “${tr(m2[1])}”` : 'guild'} has its seat here. Head: ${dict[m2[2]] ?? m2[2]}. Deputy: ${dict[m2[3]] ?? m2[3]}. Both are Beyonders in human form; everything else here is monsters.`);
      put(kopf.title, kopf.title && (dict[kopf.title] ?? lookup(kopf.title) ?? kopf.title)); }
  }
  const hz = c.encounters[`o3_${pid}_herz`];
  put(hz.name, e.herz);
  put(hz.intro, `Something beats beneath the ${kurz}. ${e.herz}. Everything corrupted here comes from here: ${verdEn}`);
  put(hz.win_text, `${e.herz} stops beating. The quarter stays corrupted, but it no longer grows. In the ash lies something only one pathway has ever needed. ${tr(c.items[`formel_${pid}_1`].name)}: the formula of the first sequence.`);
  const m = c.market.merchants[`o3_${pid}_kraemer`];
  put(m.name, `Trader in the ${kurz}`); put(m.title, `Guild trader: ${vEn}`);
  const q = c.quests[`o3_${pid}_herzkette`];
  put(q.title, `The Heart of the ${kurz}`);
  put(q.summary, `${verdEn} Six hotbeds keep the corruption alive, and beneath them beats a heart. Whoever burns them out finds the core ingredient of the second and the formula of the first sequence for the ${pEn}.`);
  q.steps.forEach((st, k) => put(st.text, k < HERDE.length ? `Hotbed ${k + 1}: ${e.herde[k]}` : `The heart: ${e.herz}`));
}
const any = Object.keys(c.dialogues).find((k) => /^o3_\w+_kraemer$/.test(k));
put(c.dialogues[any].nodes.start.text, `Between two corrupted houses someone has set up a stall as if nothing were wrong. "Mist dew and silver dust. Spirit essence you will have to cut out of the monsters yourself. And the formulas of the third sequence for this pathway, potion and ritual, ${n(FORMEL3_PREIS)} shillings each. You won't get them cheaper anywhere, because you won't get them anywhere else."`);
Object.assign(out, {
  'Was die Gilde nicht braucht, verkaufe ich. Was sie braucht, auch, nur teurer.': 'What the guild does not need, I sell. What it does need, too, only dearer.',
  'Waren und Preise ansehen.': dict['Waren und Preise ansehen.'] ?? 'View goods and prices.', 'Für heute genug.': dict['Für heute genug.'] ?? 'Enough for today.',
  'Der Krämer der Gilde': 'The guild trader',
  'Boulevard →': 'Boulevard →', '↑ Gildenhalle': '↑ Guild hall', '↓ Verderbte Gassen': '↓ Corrupted alleys', 'Das Herz →': 'The heart →', 'Saal des Oberhaupts →': 'Hall of the head →',
  'Vom Gildenhof führt der Boulevard ins Viertel. Oben die Gildenhalle mit den Rangprüfungen, unten die verderbten Gassen, ganz hinten das Herz.': 'From the guild yard the boulevard leads into the quarter. Above, the guild hall with the rank trials; below, the corrupted alleys; at the very back, the heart.',
  'Die Gildenhalle: fünf Nischen, fünf Rangprüfungen. Wer alle besteht, trifft am Ende des Gangs auf die Stellvertretung und dahinter auf das Oberhaupt.': 'The guild hall: five niches, five rank trials. Whoever passes them all meets the deputy at the end of the corridor and the head beyond.',
  'Die verderbten Gassen: drei Höfe, sechs Herde der Verderbnis. Folge den Spuren, ein Herd nach dem anderen.': 'The corrupted alleys: three yards, six hotbeds of corruption. Follow the traces, one hotbed after another.',
  'Hinter dem letzten Hof schlägt das Herz des Viertels. Es zeigt sich erst, wenn alle sechs Herde ausgebrannt sind.': 'Behind the last yard beats the heart of the quarter. It only shows itself once all six hotbeds are burnt out.',
  'Der Saal des Oberhaupts. Nur Mitglieder, die alle fünf Rangprüfungen bestanden haben, werden vorgelassen.': 'The hall of the head. Only members who have passed all five rank trials are admitted.',
  'Wegweiser lesen': 'Read the signpost', Zwischenboss: 'Mid-boss', Stellvertretung: 'Deputy', Oberhaupt: 'Head', 'Herz des Viertels': 'Heart of the quarter',
  'Ersatzzutat für den eigenen Pfad': 'Substitute ingredient for your own pathway', 'Eine Spur der Verderbnis': 'A trace of corruption',
  'Du kommst am Rand des Viertels zu dir. Der Herd brennt weiter.': 'You come to at the edge of the quarter. The hotbed keeps burning.',
  'Du weichst zurück. Der Herd folgt dir nicht, er muss nicht.': 'You fall back. The hotbed does not follow you. It does not need to.',
  'Das Viertel legt sich um sein Herz: +10 Abwehr.': 'The quarter wraps itself around its heart: +10 defense.', Verderbnis: 'Corruption',
  'Das Herz stößt dich aus wie einen Splitter. Du liegst am Eingang des Viertels.': 'The heart expels you like a splinter. You lie at the entrance of the quarter.',
  'Du fliehst aus dem Takt des Herzens.': 'You flee the rhythm of the heart.',
});
fs.writeFileSync('src/i18n/en/pfadviertel.json', JSON.stringify(out, null, 1));
console.log(Object.keys(out).length);
