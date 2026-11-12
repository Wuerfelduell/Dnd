/**
 * Seq-5-Rituale (Seb, 2026-11-12): Gegenstände, Händler, Gegner und Beute, die die zehn Prüfungen brauchen.
 * Die Regeln stehen in core/Seq5.js, das freie Brauen in core/Sude.js, die Rezepte in data/sude.js.
 * Läuft nach applySequenzen in buildContent.
 */
import { sudItems, LEERES_GEFAESS } from './sude.js';

export const SPINNENFADEN = 'spinnfaden_lila'; // gibt es schon (stadtgegner.json): Beute der Stadtgegner in Kettlegate
export const GEFAESS_ERINNERUNG = 'gefaess_erinnerung';
export const UHR_ITEM = 'uhr_taschen';

export const SEQ5_ITEMS = {
  [LEERES_GEFAESS]: { name: 'Leeres Gefäß', kind: 'ingredient', price: 6, weight: 0.5, desc: 'Ein gewöhnliches Glasfläschchen mit Korken. Nimmt auf, was man hineinfüllt: einen Sud vom Kessel oder, sagt man im Moor, eine Erinnerung.' },
  [GEFAESS_ERINNERUNG]: { name: 'Gefäß mit einer fremden Erinnerung', kind: 'trophy', weight: 0.5, desc: 'Das Glas ist beschlagen, als atme jemand darin. Eine Erinnerung, die ihrem Besitzer nicht fehlt, weil er sie nicht mehr kennt. Zutat für das Ritual des Moores.' },
  [UHR_ITEM]: { name: 'Einfache Taschenuhr', kind: 'trophy', price: 60, weight: 0.5, desc: 'Messing, läuft, tickt laut. Nichts Besonderes, aber sie zeigt die Zeit, und das Ritual der Uhr verlangt nichts anderes.' },
};

/** Händler, die das Gefäß und die Uhr führen (Kettlegate, Wexmoor, Dunscar). */
const STOCK = {
  nell: [{ item: LEERES_GEFAESS, price: 6 }],
  crane: [{ item: LEERES_GEFAESS, price: 7 }, { item: UHR_ITEM, price: 60 }],
  wx_pfandleiherin: [{ item: LEERES_GEFAESS, price: 7 }, { item: UHR_ITEM, price: 65 }],
  k3h_troedlerin: [{ item: LEERES_GEFAESS, price: 8 }, { item: UHR_ITEM, price: 70 }],
};

/**
 * Gegner der Rituale. `mirror`: Leben als Vielfaches des Spieler-Höchstlebens, Schaden der Angriffe als Vielfaches
 * seiner Schlagkraft (Combat.js rechnet das beim Kampfbeginn um). So ist die Laternenbestie genau so stark wie man selbst.
 */
export const SEQ5_ENCOUNTERS = {
  laternenbestie: {
    name: 'Die Laternenbestie', sprite: 'hound', occult: true, fleeable: true, chapter: 2, mirror: { hp: 1.4, dmg: 0.75 }, hp: 60, ritual: 'laterne',
    intro: 'Zehn Laternen brennen. Zwischen ihnen verdichtet sich das Licht zu einem Leib aus Glas und Flamme, mit deinen Bewegungen, deinem Schritt. Die Laternenbestie ist so stark wie du. Nur ein Leuchten darf sie beenden.',
    attacks: [
      { name: 'Lichtbiss: zwei Schläge', damage: 0.7, hits: [900, 1500] },
      { name: 'Blendsprung: ein schwerer Schlag', damage: 1.1, hits: [2000], unparryable: true },
      { name: 'Funkenregen: drei schnelle Schläge', damage: 0.5, hits: [700, 1100, 1500], nerves: 3 },
    ],
    on_win: {}, on_lose: {},
    win_text: 'Die Bestie zerfällt zu Licht. Die zehn Laternen erlöschen, eine nach der anderen.',
    lose_text: 'Das Licht wirft dich um. Als du zu dir kommst, sind die Laternen kalt.',
    flee_text: 'Du läufst aus dem Lichtkreis. Hinter dir erlischt die Bestie, als wäre sie nie gewesen.',
  },
  kokonspinne: {
    name: 'Kokonspinne', sprite: 'wild', sheet: 'enemy_fadenspinne', occult: true, fleeable: true, chapter: 2, hp: 36, ritual: 'faden',
    intro: 'Aus dem violetten Garn um deine Arme löst sich etwas mit acht Beinen und einem Auge wie eine glühende Perle. Eine gewöhnliche Spinne. Nur du bist nicht gewöhnlich eingewickelt.',
    attacks: [
      { name: 'Nadelstich', damage: 4, hits: [600, 850, 1100] },
      { name: 'Fadennetz', damage: 7, hits: [1200], nerves: 2 },
      { name: 'Durchbohren', damage: 11, hits: [2000] },
    ],
    on_win: {}, on_lose: {},
    win_text: 'Die Spinne zerfällt zu Garn. Der Kokon um dich wird leicht und fällt ab. Das Netz hat gehalten.',
    lose_text: 'Die Spinne wickelt dich fester ein, bis du nichts mehr siehst. Als du erwachst, ist das Garn zerrissen.',
    flee_text: 'Du reißt dich los. Das Garn bleibt an der Spinne hängen.',
  },
};

export function applySeq5(content) {
  content.items = { ...content.items, ...SEQ5_ITEMS, ...sudItems() };
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
  content.encounters = { ...content.encounters, ...Object.fromEntries(Object.entries(SEQ5_ENCOUNTERS).filter(([id]) => !content.encounters[id])) };
  // Fadenspinnen tragen die lila Fäden immer in sich
  const loot = { ...content.loot };
  for (const id of ['fadenspinne', 'fadenspinne_elite']) {
    if (!loot[id]) continue;
    loot[id] = { ...loot[id], drops: [...(loot[id].drops ?? []), { item: SPINNENFADEN, chance: id.endsWith('_elite') ? 1 : 0.7, n: id.endsWith('_elite') ? [2, 3] : [1, 2] }] };
  }
  content.loot = loot;
  return content;
}
