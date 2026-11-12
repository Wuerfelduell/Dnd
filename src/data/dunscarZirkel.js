// Geheime Zirkel in Dunscar (Seb, 2026-11-12):
//  - Die Auktionen in Dunscar spielen im Tausenderbereich (Gegner bringen hier ~90 Schilling, Kopfgelder 675–1200).
//    Billiger Kram (Rufwachs, Schichtkappe …) fliegt aus den Losen; Formeln, Kernzutaten und seltene Stücke bleiben.
//  - Neue seltene und „unmögliche“ Stücke (starke Artefakte mit heftigem Fluch, zwei Waffen), Bilder aus dem Vorrat nebel200.
//  - Zwei weitere Zirkel neben dem Schichtbund, ohne Aufnahme-Quest offen ab der Ankunft (offene, harte Welt):
//      Der Kalte Ofen   (Alchemie: Halbgott-Formeln aller Pfade, Seq-5-Zutaten, Tränke-Artefakte), alter Kalkofen am Kalkmarkt
//      Das Stumme Stellwerk (Formeln 6/5 der übrigen Pfade, Waffen, Schloss- und Signal-Artefakte), am Signalhang
//    Die Treffen wechseln sich ab (Uhr wie bisher: alle 5 Minuten eines, also jeder Zirkel alle 15 Minuten).
//  - Seq-3-Formeln gibt es hier NIE (nur später im pfadeigenen Gebiet). Seq-4-Formel nur hier oder als Elite-Fund.

/** Ausrufpreise (Startgebot = 60 %). */
export const DS_LOS = {
  formel: { 6: 2500, 5: 4000, 4: 9000 },
  zutat4: { price: 7500, chance: 0.35 }, // Start 4500, etwa 10 % je Treffen für die eigene Zutat
  zutat5: { price: 1800, chance: 0.3 },
  min: 1500, // alles darunter ist kein Los für Dunscar
};

const art = (name, price, desc, boons, curses) => ({ name, source: 'treffen', price, weight: 1, desc, boons, curses });
const b = (key, value, text) => ({ key, value, text });

/** Neue Artefakte (selten und „unmöglich“). Bilder: items/<id>.png aus nebel200. */
export const DS_ARTEFAKTE = {
  dsz_kalkherz: art('Kalkherz', 3500, 'Ein Uhrwerkherz, mit Kalk verfugt. Es schlägt, wenn deins aussetzt.',
    [b('max_hp', 80, '+80 maximales Leben.')], [b('composure_regen', 0.7, 'Nervenerholung nur 70 %.')]),
  dsz_weichenuhr: art('Stehengebliebene Weichenuhr', 4800, 'Steht auf 4:12, der Minute des Unglücks im Runddepot. Wer sie trägt, ist immer eine Minute früher da.',
    [b('ap_start', 1, '+1 Konzentration zum Kampfbeginn.'), b('ap_max', 1, '+1 Höchstkonzentration.')], [b('unruhe_tick', 0.25, '+0,25 Unruhe pro Sekunde.')]),
  dsz_signallinse: art('Rote Signallinse', 3200, 'Aus dem Signal, das niemand mehr stellt. Durch sie sieht man, was im Nebel steht.',
    [b('occult_mult', 1.35, '35 % mehr Schaden gegen Okkultes.')], [b('max_nerves', -10, '10 weniger maximale Nerven.')]),
  dsz_lohnbuch: art('Lohnbuch der Toten Schicht', 2800, 'Jede Seite ein Name, jeder Name ein offener Lohn. Das Buch zahlt, aber es merkt sich, wer nimmt.',
    [b('money_bonus', 1.5, 'Beutegeld ×1,50.')], [b('honor_loss', 1.5, 'Ansehensverluste wiegen 50 % schwerer.')]),
  dsz_rohrpost: art('Rohrpostkapsel ohne Absender', 2600, 'Kommt jeden Morgen wieder in der Tasche an, auch wenn man sie wegwirft.',
    [b('dodge_window', 1.35, 'Ausweichfenster +35 %.')], [b('damage_taken', 1.1, '10 % mehr Schaden.')]),
  dsz_glasschluessel: art('Okkulter Glasschlüssel', 2200, 'Passt in kein Schloss und öffnet trotzdem jedes.',
    [b('lock_bonus', 15, 'Gesperrte Schränke und Türen öffnen sich mit 15 Ansehen weniger.'), b('carry', 10, '+10 Pfund Tragkraft.')], [b('price', 1.15, 'Händlerpreise ×1,15.')]),
  dsz_augenamulett: art('Auge des Stellwerks', 3800, 'Ein Amulett mit einem Glasauge, das nie blinzelt. Es sieht den Schlag, bevor er kommt.',
    [b('damage_taken', 0.85, '15 % weniger Schaden.'), b('parry_ap', 1, 'Paraden bringen +1 Konzentration.')], [b('heal_bonus', 0.75, 'Heilmittel wirken nur zu 75 %.')]),
  // „Unmögliche“ Stücke: sehr stark, sehr teuer, selten im Angebot, mit heftigem Preis
  dsz_sanduhr: art('Sanduhr, die rückwärts läuft', 12000, 'Unmöglich, sagt der Ofen. Der Sand steigt. Jede Runde gibt sie dir Zeit, die du nie hattest, und nimmt dir dafür Leben, das du noch hast.',
    [b('ap_round', 1, 'Zu Beginn jeder weiteren Runde +1 Konzentration.'), b('ap_start', 2, '+2 Konzentration zum Kampfbeginn.')],
    [b('max_hp', -60, '60 weniger maximales Leben.'), b('unruhe_tick', 0.5, '+0,5 Unruhe pro Sekunde.')]),
  dsz_spiegel: art('Spiegel ohne Gestern', 10000, 'Zeigt dich so, wie du morgen zuschlägst. Wer zu lange hineinsieht, vergisst, wie man sich wehrt.',
    [b('dmg_mult', 1.4, 'Schaden ×1,40.')], [b('damage_taken', 1.3, '30 % mehr Schaden.'), b('composure_regen', 0.5, 'Nervenerholung nur 50 %.')]),
  dsz_herzwalze: art('Walze, die dein Herz spielt', 14000, 'Eine Spieluhrwalze, gestanzt nach deinem Puls. Solange sie läuft, stirbst du schwer, und du verdaust schwer.',
    [b('max_hp', 150, '+150 maximales Leben.'), b('heal_bonus', 1.5, 'Heilmittel wirken 50 % stärker.')],
    [b('digest_mult', 0.6, 'Tränke verdauen 40 % langsamer.'), b('honor_loss', 1.3, 'Ansehensverluste wiegen 30 % schwerer.')]),
  dsz_tresorscheibe: art('Tresorscheibe der Dunscar-Bank', 9000, 'Die Bank gibt es nicht mehr. Die Scheibe dreht sich weiter und rechnet für dich.',
    [b('price', 0.75, 'Einkaufen kostet 25 % weniger.'), b('sell', 1.4, '40 % höherer Erlös beim Verkaufen.')], [b('money_bonus', 0.6, 'Geldbeute fällt 40 % geringer aus.')]),
};

/** Neue Waffen und Verbrauchsgüter. */
export const DS_ITEMS = {
  dsz_schienennagel: { weight: 2, name: 'Geweihter Schienennagel', kind: 'weapon', atk: 16, occult: 1.8, price: 1200,
    desc: 'Ein Nagel aus der ersten Schwelle von Dunscar, über drei Schichten mit Namen beschrieben. Trifft, was keinen Körper hat.' },
  dsz_ofenhammer: { weight: 4, name: 'Hammer der Ofenmutter', kind: 'weapon', atk: 19, occult: 1.3, price: 1500,
    desc: 'Damit wurde der Kalte Ofen zum letzten Mal geschlossen. Unmöglich schwer für seine Größe.' },
  dsz_geisterlaterne: { weight: 1, name: 'Geisterlaterne', kind: 'consumable', price: 300, calm: 60, composure: 40,
    desc: 'Brennt mit einem Licht, das nicht wärmt. Ein Atemzug davon beruhigt Kopf und Nerven. Senkt die Unruhe um 60 und beruhigt die Nerven (+40).' },
};

// Lose der Zirkel. Feste Lose hier, Formeln und Zutaten werden in applyDunscarZirkel je Pfad ergänzt.
const L = (item, price, chance, extra = {}) => ({ item, price, chance, ...extra });
const EINMAL = { once: true };

const FIG = { coat: '#4a4f58', hat: '#2a2c30', skin: '#c99f7b', hair: '#5a4a3a', legs: '#2a2c30' };
const npc = (name, role, coat) => ({ name, role, palette: { ...FIG, coat } });

export const DS_ZIRKEL = {
  kalkofen: {
    name: 'Der Kalte Ofen',
    short: 'Asche, Glas und Halbgott-Formeln',
    host: 'dsz_ofenmutter',
    pin: [300, 72],
    exit: 'ds_kalkmarkt',
    mapName: 'Im Kalten Ofen',
    desc: 'Der stillgelegte Kalkofen hinter dem Kalkmarkt. Wer in Dunscar angekommen ist, darf hinein.',
    invite: 'Der Kalte Ofen glimmt wieder. Hinter dem Kalkmarkt wird heute versteigert, was nicht verkauft werden darf. Der Treffpunkt steht auf der Stadtkarte.',
    light: '#ff9a5a',
    npcs: {
      dsz_ofenmutter: npc('Ofenmutter Selma Grau', 'Hüterin des Kalten Ofens', '#6a3a2a'),
      dsz_brenner: npc('Jonas Brenn', 'Kalkbrenner', '#5a4a3a'),
      dsz_aschenleserin: npc('Ilse Aschgrund', 'Aschenleserin', '#4a3a5a'),
      dsz_loeschmeister: npc('Ruben Lösch', 'Löschmeister', '#3a4a3a'),
    },
    members: [
      { id: 'dsz_brenner', offers: [L('dsz_ofenhammer', 6500, 0.15, EINMAL), L('dsz_kalkherz', 3500, 0.25, EINMAL), L('dsz_herzwalze', 14000, 0.06, EINMAL)], wants: ['k3o_schichtknopf', 'k3o_stillkiesel'] },
      { id: 'dsz_aschenleserin', offers: [L('dsz_geisterlaterne', 1500, 0.5), L('dsz_spiegel', 10000, 0.07, EINMAL)], wants: ['k3o_schraubenzahn', 'k3o_schichtknopf'] },
      { id: 'dsz_loeschmeister', offers: [L('dsz_lohnbuch', 2800, 0.25, EINMAL), L('dsz_sanduhr', 12000, 0.06, EINMAL)], wants: ['k3o_stillkiesel', 'k3o_schraubenzahn'] },
    ],
    say: {
      dsz_ofenmutter: '„Der Ofen ist kalt, seit die Bank fiel“, sagt Selma. „Was hier brennt, brennt nicht für Kalk. Wer in Dunscar lebt, darf zusehen. Wer bieten will, bringt Tausender mit.“',
      dsz_brenner: 'Jonas wischt Ruß von einem Hammerkopf. „Alles hier hat einmal jemandem gehört, der es nicht hergeben wollte.“',
      dsz_aschenleserin: 'Ilse streut Asche auf ein Blech und liest darin. „Du suchst etwas, das es nicht geben dürfte. Gut. Ich habe es.“',
      dsz_loeschmeister: 'Ruben zählt Münzen in einen Eimer. „Ich lösche keine Feuer. Ich lösche Schulden.“',
    },
  },
  stellwerk: {
    name: 'Das Stumme Stellwerk',
    short: 'Hebel, Signale und verbotene Formeln',
    host: 'dsz_stellwerker',
    pin: [255, 150],
    exit: 'ds_signalhang',
    mapName: 'Im Stummen Stellwerk',
    desc: 'Das abgeschaltete Stellwerk am Signalhang. Wer in Dunscar angekommen ist, darf hinein.',
    invite: 'Im Stummen Stellwerk am Signalhang leuchtet ein rotes Licht. Die Hebelrunde handelt heute. Der Treffpunkt steht auf der Stadtkarte.',
    light: '#ff5a5a',
    npcs: {
      dsz_stellwerker: npc('Stellwerksmeister Corvin Lathe', 'Hält die Hebelrunde', '#2a3a5a'),
      dsz_telegrafistin: npc('Mira Tackt', 'Telegrafistin', '#5a2a3a'),
      dsz_weichenwaerter: npc('Ansgar Weich', 'Weichenwärter', '#3a5a4a'),
      dsz_fundsammler: npc('Bertolt Fund', 'Sammler aus den Gleisen', '#4a4a3a'),
    },
    members: [
      { id: 'dsz_telegrafistin', offers: [L('dsz_rohrpost', 2600, 0.3, EINMAL), L('dsz_weichenuhr', 4800, 0.2, EINMAL)], wants: ['k3o_schichtknopf', 'k3o_stillkiesel'] },
      { id: 'dsz_weichenwaerter', offers: [L('dsz_schienennagel', 5000, 0.2, EINMAL), L('dsz_signallinse', 3200, 0.25, EINMAL), L('dsz_augenamulett', 3800, 0.2, EINMAL)], wants: ['k3o_schraubenzahn', 'k3o_schichtknopf'] },
      { id: 'dsz_fundsammler', offers: [L('dsz_glasschluessel', 2200, 0.3, EINMAL), L('dsz_tresorscheibe', 9000, 0.07, EINMAL)], wants: ['k3o_stillkiesel', 'k3o_schraubenzahn'] },
    ],
    say: {
      dsz_stellwerker: '„Hier wird nichts mehr gestellt“, sagt Corvin und legt die Hand auf einen Hebel. „Nur noch gehandelt. Wer in Dunscar angekommen ist, sitzt mit am Pult.“',
      dsz_telegrafistin: 'Mira tippt ohne Strom auf die Morsetaste. „Die Leitung ist tot. Antworten kommen trotzdem.“',
      dsz_weichenwaerter: 'Ansgar ölt einen Nagel, als wäre er eine Klinge. „Auf der falschen Weiche fährt man nur einmal.“',
      dsz_fundsammler: 'Bertolt kippt einen Sack Gleisschotter aus und sortiert mit spitzen Fingern. „Die Gleise geben alles zurück. Irgendwann.“',
    },
  },
};

/** Sitzplätze im Raum (Gastgeber oben, drei Mitglieder unten). */
const SEATS = [[12, 4], [5, 7], [12, 8], [19, 7]];

function room(id, z) {
  return {
    id: `treffen_${id}`,
    name: z.mapName,
    city: 'dunscar',
    tiles: 'ds_bahn',
    rows: ['IIIIIIIIIIIIIIIIIIIIIIII', ...Array(12).fill('I......................I'), 'IIIIIIIIIIIIIIIIIIIIIIII'],
    spawns: { default: [3, 11] },
    lights: [{ tile: [12, 6], radius: 100, intensity: 0.7, color: z.light }],
    ambient: { night: 0.62, fog: 0 },
    npcs: [z.host, ...z.members.map((m) => m.id)].map((n, i) => ({ id: n, tile: SEATS[i] })),
    interactables: [{ id: `dsz_${id}_ausgang`, kind: 'door', tile: [3, 12], to: z.exit, spawn: 'default', prompt: 'Hinaus nach Dunscar', marker: true }],
    decor: [],
  };
}

function dialogues(id, z) {
  const out = {};
  out[z.host] = { start: 'start', nodes: {
    start: { text: z.say[z.host], choices: [
      { text: 'Die Auktion eröffnen.', auction: id, requires_gathering: id },
      { text: 'Wann trefft ihr euch?', next: 'regel' },
      { text: 'Auf Wiedersehen.' }] },
    regel: { text: `„Drei Zirkel teilen sich die Nacht in Dunscar: der Schichtbund, der Kalte Ofen und das Stumme Stellwerk. Alle fünf Minuten hält einer Runde. Wer zu spät kommt, wartet eine Viertelstunde auf uns.“`, choices: [{ text: 'Auf Wiedersehen.' }] },
  } };
  for (const m of z.members) {
    out[m.id] = { start: 'start', nodes: { start: { text: z.say[m.id], choices: [
      { text: 'Die Angebote der Runde ansehen.', auction: id, requires_gathering: id },
      { text: 'Auf Wiedersehen.' }] } } };
  }
  return out;
}

/** Pack für buildContent: Zirkel, Räume, Reiseziele, Figuren, Gespräche, Artefakte und Gegenstände. Nach k3_handel einhängen. */
export function dunscarZirkelPack() {
  const circles = {};
  const pins = {};
  const travel = [];
  const maps = [];
  let npcs = {};
  let dlg = {};
  for (const [id, z] of Object.entries(DS_ZIRKEL)) {
    circles[id] = { name: z.name, member_flag: 'k3_arrived', map: `treffen_${id}`, short: z.short, city: 'dunscar', invite: z.invite, host: z.host,
      members: z.members.map((m) => ({ id: m.id, offers: m.offers.map((o) => ({ ...o })), wants: ['k3o_schichtknopf', 'k3o_stillkiesel'] })) };
    pins[`treffen_${id}`] = z.pin;
    travel.push({ map: `treffen_${id}`, spawn: 'default', name: z.name, desc: `${z.desc} Nur während eines offenen Treffens.`, requires_gathering: id, requires_flags: ['k3_arrived'], city: 'dunscar' });
    maps.push(room(id, z));
    npcs = { ...npcs, ...Object.fromEntries(Object.entries(z.npcs).map(([n, d]) => [n, { ...d, dialogue: n }])) };
    dlg = { ...dlg, ...dialogues(id, z) };
  }
  return {
    name: 'ds_zirkel',
    items: { ...DS_ITEMS },
    npcs,
    dialogues: dlg,
    artifacts: { list: DS_ARTEFAKTE },
    treffen: { rules: { orders: { dunscar: ['schichtbund', 'kalkofen', 'stellwerk'] } }, circles, pins, travel, maps },
  };
}

/** Alle Figuren der neuen Zirkel (für Lauf-Sheets in assets.js). */
export const DS_ZIRKEL_FIGUREN = Object.values(DS_ZIRKEL).flatMap((z) => Object.keys(z.npcs));
/** Alle neuen Gegenstände mit eigenem Bild. */
export const DS_ZIRKEL_ICONS = [...Object.keys(DS_ARTEFAKTE), ...Object.keys(DS_ITEMS)];

/** Billiger Kram, den der Schichtbund bisher versteigert hat, ersetzt durch seltene Stücke. */
const SCHICHTBUND_NEU = {
  tm_ds_lampe: [L('dsz_geisterlaterne', 1500, 0.4)],
  tm_ds_kerbholz: [L('dsz_lohnbuch', 2800, 0.15, EINMAL)],
  tm_ds_stimme: [L('dsz_rohrpost', 2600, 0.15, EINMAL)],
};

/**
 * Nach applySequenzen: Preise aller Dunscar-Zirkel in den Tausenderbereich, billige Lose raus,
 * Halbgott-Formeln (alle Pfade) und Seq-5-Zutaten in den Kalten Ofen, Formeln 6/5 der übrigen Pfade ins Stellwerk.
 */
export function applyDunscarZirkel(content) {
  const circles = content.gatherings?.circles;
  if (!circles?.kalkofen || !circles?.stellwerk) return;
  const pids = Object.keys(content.pathways ?? {});
  const has = (id) => !!content.items[id];
  const seat = (cid, i) => circles[cid].members[i % circles[cid].members.length];
  // Halbgott-Formel (Seq 4): nur auf Treffen oder als Elite-Fund, nie bei Pfad-Beyondern. Seq-5-Zutaten dazu.
  pids.filter((p) => has(`formel_${p}_4`)).forEach((p, i) => seat('kalkofen', i).offers.push(
    L(`formel_${p}_4`, DS_LOS.formel[4], 0.12, { once: true, requires_pathway: [p, 5], locked_text: 'Erst ab Sequenz 5 dieses Pfades' })));
  // Kernzutat der Formel 5 (die erste Zutat, z. B. Lichtperle oder sq_zutat_waage_5)
  const kern5 = (p) => Object.keys(content.items[`formel_${p}_5`]?.ingredients ?? {})[0];
  pids.filter((p) => kern5(p) && has(kern5(p))).forEach((p, i) => seat('kalkofen', i + 1).offers.push(
    L(kern5(p), DS_LOS.zutat5.price, DS_LOS.zutat5.chance, { requires_pathway: [p, 6], locked_text: 'Erst ab Sequenz 6 dieses Pfades' })));
  // Formeln 6/5 der Pfade, die der Schichtbund nicht führt
  const bund = new Set((circles.schichtbund?.members ?? []).flatMap((m) => m.offers.map((o) => o.item)));
  pids.filter((p) => !bund.has(`formel_${p}_5`)).forEach((p, i) => {
    for (const s of [6, 5]) {
      if (has(`formel_${p}_${s}`)) seat('stellwerk', i).offers.push(L(`formel_${p}_${s}`, DS_LOS.formel[s], 0.2, { once: true, requires_pathway: [p, s + 1], locked_text: `Erst ab Sequenz ${s + 1} dieses Pfades` }));
    }
  });
  // Schichtbund: billiges raus, seltenes rein
  for (const m of circles.schichtbund?.members ?? []) m.offers.push(...(SCHICHTBUND_NEU[m.id] ?? []).map((o) => ({ ...o })));
  // Alle Dunscar-Lose neu bepreisen
  for (const c of Object.values(circles)) {
    if (c.city !== 'dunscar') continue;
    for (const m of c.members) {
      m.offers = m.offers.flatMap((o) => {
        const it = content.items[o.item];
        if (!it) return [];
        if (it.kind === 'formula') {
          if (it.seq <= 3) return []; // Seq-3-Formeln nur im pfadeigenen Gebiet
          return [{ ...o, price: DS_LOS.formel[it.seq] ?? o.price }];
        }
        if (/^sq_zutat_.+_4$/.test(o.item)) return [{ ...o, ...DS_LOS.zutat4 }];
        return o.price >= DS_LOS.min ? [o] : [];
      });
    }
  }
}
