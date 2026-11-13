// Tipps nur noch von Marlowe (Seb 2026-11-13): Notizbuch und Inventar zeigen keine Tipps mehr. Damit man auch nach
// Kettlegate nicht festhängt, steht in jeder späteren Stadt ein Telegrammschalter, über den Marlowe denselben Rat
// gibt wie in ihrem Büro (Dialogknoten mit `hint: true` → Guide.advice).

const WALKABLE = new Set(['.', ',', '=', 'w', 'g', 'p', 'c', 's', 'P']);

/** Bahnhof oder Ankunftsort jeder späteren Stadt; ab der Ankunft dort sichtbar. */
export const TELEGRAMM_ORTE = [
  { map: 'wx_bahnhof', flag: 'k2_arrived' },
  { map: 'ds_speisewagen', flag: 'k3_arrived' },
  { map: 'cw_gleisfuss', flag: 'k4_arrived' },
  { map: 'bh_kutschenhof', flag: 'k5_arrived' },
];

export const TELEGRAMM_DIALOG = {
  start: 'start',
  nodes: {
    start: {
      text: 'Ein Telegrammschalter mit einem Messinggerät, das leise vor sich hin tickt. Für ein paar Münzen kabelst du Inspektorin Marlowe in Kettlegate. Sie liest jede Akte, die du ihr schickst, und antwortet schneller, als man denkt.',
      choices: [
        { text: 'Marlowe um Rat bitten.', next: 'rat' },
        { text: 'Später.' },
      ],
    },
    rat: {
      hint: true,
      text: 'Der Streifen kommt ratternd aus dem Gerät. Marlowes Art erkennt man selbst im Telegrammstil.',
      choices: [{ text: 'Danke.' }],
    },
  },
};

/** Freies, begehbares Feld möglichst nahe am Ankunftspunkt, auf dem noch nichts steht. */
function freeTile(map) {
  const taken = new Set([...(map.npcs ?? []), ...(map.interactables ?? [])].map((d) => `${d.tile?.[0]},${d.tile?.[1]}`));
  for (const s of Object.values(map.spawns ?? {})) taken.add(`${s[0]},${s[1]}`);
  const [sx, sy] = map.spawns?.default ?? [1, 1];
  for (let r = 2; r < 12; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = sx + dx; const y = sy + dy;
      if (WALKABLE.has(map.rows[y]?.[x]) && !taken.has(`${x},${y}`)) return [x, y];
    }
  }
  return null;
}

export function applyMarloweTelegramm(content) {
  content.dialogues.marlowe_telegramm = TELEGRAMM_DIALOG;
  for (const { map: id, flag } of TELEGRAMM_ORTE) {
    const map = content.maps[id];
    if (!map) continue;
    const tile = freeTile(map);
    if (!tile) continue;
    const def = {
      id: 'marlowe_telegramm', kind: 'dialogue', dialogue: 'marlowe_telegramm', tile, sprite: 'paper',
      prompt: 'Telegramm an Marlowe', title: 'Telegramm an Marlowe', visible_if: { requires_flags: [flag] },
    };
    // Briarholt: die warme Fassung einer Karte trägt dieselben Objekte
    for (const m of [map, content.maps[`${id}__warm`]]) m?.interactables.push({ ...def });
  }
}
