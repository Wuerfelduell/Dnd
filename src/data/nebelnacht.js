// Nebelnächte (core/Wetter.js): Die Nebelkrämerin steht nur in Nebelnächten auf dem Markt jeder Stadt (Flag `nebelnacht`).
// Sie verkauft Hauptzutaten, die es sonst nur als seltene Monsterbeute gibt (data/zutatDrops.js), teuer und
// je Nebelnacht nur drei davon (core/Gatherings.js → merchantStock). Kein Ankauf.
import { KG_SEQ7, WX_SEQ6, WX_SEQ5 } from './zutatDrops.js';

export const NEBEL_NPC = 'nebel_kraemerin';
/** Stadt → Markt, Auswahl (Zutaten) und Preisfaktor auf den Grundpreis. */
export const NEBEL_MAERKTE = {
  kettlegate: { maps: ['altmarkt'], items: Object.keys(KG_SEQ7), f: 4 },
  wexmoor: { maps: ['wx_salzmarkt'], items: [...Object.keys(WX_SEQ6), ...Object.keys(WX_SEQ5)], f: 6 },
  dunscar: { maps: ['ds_kalkmarkt'], items: Object.keys(WX_SEQ5), f: 12 },
  calderwick: { maps: ['cw_quittungsmarkt'], items: Object.keys(WX_SEQ5), f: 20 },
  briarholt: { maps: ['bh_winterpromenade', 'bh_winterpromenade__warm'], items: Object.keys(WX_SEQ5), f: 20 },
};
export const NEBEL_ANGEBOT = 3;
export const nebelMerchant = (city) => `nebel_${city}`;

const FIG = { coat: '#3c4a44', hat: '#202a26', skin: '#c8b8a8', hair: '#9aa8a0', legs: '#202a26' };

export function applyNebelnacht(content) {
  content.npcs[NEBEL_NPC] = { name: 'Ysolde Grau', role: 'Nebelkrämerin', palette: FIG };
  for (const [city, def] of Object.entries(NEBEL_MAERKTE)) {
    const stock = def.items.filter((i) => content.items[i]).map((item) => ({ item, price: Math.max(100, Math.round((content.items[item].price ?? 50) * def.f)) }));
    if (!stock.length) continue;
    const mid = nebelMerchant(city);
    content.market.merchants[mid] = {
      name: 'Ysolde Grau', title: 'Nebelkrämerin', nebel: true, angebot: NEBEL_ANGEBOT, city,
      greeting: 'Nur heute Nacht, nur solange der Nebel steht. Morgen früh bin ich fort, und was Sie nicht gekauft haben, mit mir.',
      stock,
    };
    content.dialogues[`nebel_kraemerin_${city}`] = { start: 'start', nodes: {
      start: { text: 'Eine Frau in grauem Mantel steht zwischen den Ständen, als wäre sie mit dem Nebel gekommen. Vor ihr liegen Dinge auf einem Tuch, die sonst nur in den Bäuchen von Monstern zu finden sind.\n\n„Nur heute Nacht“, sagt sie. „Morgen früh bin ich fort.“',
        choices: [{ text: 'Zeigen Sie mir, was Sie haben.', shop: mid }, { text: 'Woher haben Sie das?', next: 'woher' }, { text: 'Auf Wiedersehen.' }] },
      woher: { text: '„Der Nebel bringt mir Dinge, und ich bringe sie Ihnen. Fragen Sie nicht, wem sie vorher gehört haben.“', choices: [{ text: 'Gut.', next: 'start' }] },
    } };
    for (const mapId of def.maps) {
      const m = content.maps[mapId];
      if (!m) continue;
      m.npcs ??= [];
      const base = m.spawns?.default ?? Object.values(m.spawns ?? {})[0] ?? [5, 5];
      const taken = new Set([...(m.npcs ?? []), ...(m.interactables ?? [])].filter((o) => o.tile).map((o) => `${o.tile[0]},${o.tile[1]}`));
      const free = (x, y) => !taken.has(`${x},${y}`) && /[.swg,]/.test(m.rows?.[y]?.[x] ?? '');
      let spot = null;
      for (let r = 2; r < 10 && !spot; r++) for (let dx = -r; dx <= r && !spot; dx++) for (const dy of [-r, r]) if (!spot && free(base[0] + dx, base[1] + dy)) spot = [base[0] + dx, base[1] + dy];
      if (!spot) continue;
      m.npcs.push({ id: NEBEL_NPC, tile: spot, dialogue: `nebel_kraemerin_${city}`, visible_if: { requires_flags: ['nebelnacht'] } });
    }
  }
  return content;
}
