// Anschlagbrett am Endbahnhof (Seb 2026-11-13): Dunscar braucht mehr Inhalt für den langen Weg von Sequenz 5 zu 4.
// Die Verdauung bleibt langsam (Kämpfe ändern sich nicht), aber große Taten bringen feste Verdauung (Effekt
// `digest_pct`, Pathways.digestFixed: voll auf Seq 5, auf Seq 4 ein Zehntel). Alles einmalig, alles freiwillig.
//  - Jagdgesuche: benannte Elite-Gegner in den Gefahrengebieten. Stufe 2 erst nach drei erledigten Jagden.
//  - Liefergesuche: Beute aus den Gruben gegen Geld und Verdauung.
//  - Die Spur des Alten: kurzer Strang zur Rache an Starling (Opfermarken, sein Bote, der Hüter der Opfergrube).
// Auftraggeber ist der Anschlagschreiber Ezra Pell am Endbahnhof. Lohn holt man bei ihm ab.

import { LATE_DMG_MULT } from '../core/Combat.js';

/**
 * Härte der benannten Ziele (Seb 2026-11-13: Schlüssel + Eisen auf Seq 5 machen zu zweit ~1600 Schaden je Runde).
 * `hp`: Faktor auf die Kapitel-3-Untergrenze (Elite 1600 / Boss 3200 solo, zu zweit ×2,34).
 * Ziel zu zweit: Stufe 1 ~6 Runden, Bote ~7, Stufe 2 ~8, Hüter ~14. `dmg`: Faktor auf den Spätschaden des Rangs.
 */
export const ZIEL_HAERTE = { stufe1: { hp: 2.5, dmg: 2 }, stufe2: { hp: 3.5, dmg: 1.6 }, bote: { hp: 3, dmg: 2 }, hueter: { hp: 3, dmg: 1 } };

export const ANSCHLAG_NPC = 'dan_anschlagschreiber';
/** Wie viele Jagden der ersten Stufe man braucht, bis die zweite aushängt. */
export const JAGD_STUFE2_AB = 3;

/** Jagdgesuche. `base` = Gegner, dessen Werte und Bild das Ziel übernimmt. */
export const JAGDEN = [
  { id: 'weisse_kraehe', stufe: 1, base: 'signalkraehe', map: 'ds_rangierwueste', name: 'Die Weiße Krähe', geld: 1200, digest: 1.5, item: 'ds_beute_signalsilber',
    text: 'Gesucht: eine weiße Signalkrähe, Rangierwüste. Sie stiehlt Lampen von den Masten, bis die Weichen im Dunkeln stehen. Lohn von der Bahnmeisterei.' },
  { id: 'staubkoenig', stufe: 1, base: 'kalkstaubgeist', map: 'ds_klopfbruch', name: 'Der Staubkönig', geld: 1300, digest: 1.5, item: 'ds_beute_signalsilber',
    text: 'Gesucht: ein Kalkstaubgeist im Klopfbruch, so dicht, dass man ihn für eine Wand hält. Zwei Hauer sind hineingelaufen. Lohn von den Witwen der Schicht.' },
  { id: 'falsches_signal', stufe: 1, base: 'nachhall', map: 'ds_rufschlucht', name: 'Das Falsche Signal', geld: 1300, digest: 1.5, item: 'ds_beute_signalsilber',
    text: 'Gesucht: ein Nachhall in der Rufschlucht, der Abfahrtsignale nachahmt. Seinetwegen sind drei Draisinen in den Abgrund gefahren.' },
  { id: 'lohnfresserin', stufe: 1, base: 'lohnlistenmotte', map: 'ds_unterschicht', name: 'Die Lohnfresserin', geld: 1200, digest: 1.5, item: 'ds_beute_signalsilber',
    text: 'Gesucht: eine Lohnlistenmotte in der Unterschicht, die ganze Namen von den Listen frisst. Wer gefressen ist, bekommt keinen Lohn mehr und wird von niemandem vermisst.' },
  { id: 'vorarbeiterin', stufe: 2, base: 'geruestklang', map: 'ds_unterschicht', name: 'Die Vorarbeiterin aus Klang', geld: 2200, digest: 2, item: 'ds_beute_schichtgold',
    text: 'Gesucht: ein Gerüstklang in der Unterschicht, der Schichtbefehle singt. Die Leute arbeiten, bis sie umfallen. Nur für Leute, die schon etwas erledigt haben.' },
  { id: 'schichtbaron', stufe: 2, base: 'schichtgaenger', map: 'ds_klopfbruch', name: 'Der Schichtbaron', geld: 2200, digest: 2, item: 'ds_beute_schichtgold',
    text: 'Gesucht: ein Schichtgänger im Klopfbruch, der eine Gruppe anderer um sich schart und Zoll erhebt. Wer nicht zahlt, fährt nicht wieder hoch.' },
  { id: 'aschenmutter', stufe: 2, base: 'sg_aschenweberin', map: 'ds_schlackengrube', name: 'Die Aschenmutter', geld: 3200, digest: 2, item: 'ds_schlacke_ofenherz',
    text: 'Gesucht: eine Aschenweberin in der Schlackengrube, älter als die anderen. Sie webt Schlackenfäden über die Ausgänge. Nur mit starker Sequenz annehmen.' },
  { id: 'eiserner_kessel', stufe: 2, base: 'sg_ofenpanzer', map: 'ds_schlackengrube', name: 'Der Eiserne Kessel', geld: 3500, digest: 2, item: 'ds_schlacke_ofenherz',
    text: 'Gesucht: ein Ofenpanzer in der Schlackengrube, der einen ganzen Hochofen auf dem Rücken trägt. Die Rußgesellschaft zahlt mit. Nur mit starker Sequenz annehmen.' },
];

/** Liefergesuche: Beute abgeben gegen Geld und Verdauung. */
export const LIEFERUNGEN = [
  { id: 'silber_fuer_signale', items: { ds_beute_signalsilber: 3 }, geld: 1600, digest: 1,
    text: 'Gesucht: drei Stück Signalsilber für die neuen Laternen am Signalhang. Die Bahnmeisterei zahlt über Marktpreis.' },
  { id: 'gold_fuer_witwen', items: { ds_beute_schichtgold: 2 }, geld: 2600, digest: 1,
    text: 'Gesucht: zwei Stück Schichtgold. Die Witwenkasse der Unterschicht will Grabplatten gießen lassen, mit Namen darauf.' },
  { id: 'glut_fuer_apotheke', items: { ds_schlacke_glutperle: 3 }, geld: 1800, digest: 1,
    text: 'Gesucht: drei Glutperlen aus der Schlackengrube für die Kalkapotheke. Sie brennen Fieber aus, sagt die Apothekerin.' },
  { id: 'herz_fuer_ofen', items: { ds_schlacke_ofenherz: 1 }, geld: 2400, digest: 1,
    text: 'Gesucht: ein Ofenherz. Der Speisewagen hat keine Wärme mehr, seit der Kessel gesprungen ist. Pfiff legt etwas dazu.' },
];

/** Die Spur des Alten: drei Opfermarken, Starlings Bote, der Hüter der Opfergrube. */
export const SPUR = {
  quest: 'dan_spur_des_alten',
  marken: [
    { id: 'marke_klopfbruch', map: 'ds_klopfbruch', title: 'Eine bleiche Handfläche',
      text: 'Auf einer Bruchkante, wo kein Hauer hinreicht, ein Handabdruck aus Kalk. Darunter ein Ring aus Asche, darin drei Zähne. Nicht menschlich. Jemand hat hier etwas dargebracht und gewollt, dass es bleibt.' },
    { id: 'marke_rufschlucht', map: 'ds_rufschlucht', title: 'Eingeritzte Fahrpläne',
      text: 'In den Fels sind Abfahrtszeiten geritzt, sauber wie von einem Schreiber. Alle führen nach unten. Unter der letzten steht ein Name, schon halb weggekratzt: Starling.' },
    { id: 'marke_unterschicht', map: 'ds_unterschicht', title: 'Ein Gedeck für niemanden',
      text: 'Ein Teller auf einem Gerüstbrett, darauf eine erloschene Kerze und ein Lohnzettel ohne Namen. Der Betrag ist absurd hoch. Daneben, mit dem Finger in den Staub geschrieben: „Für den Alten, bis er satt ist.“' },
  ],
  bote: { base: 'schichtgaenger', map: 'ds_rangierwueste', name: 'Starlings Bote', digest: 3, geld: 1500 },
  hueter: { base: 'sg_schlackenvorhauer', map: 'ds_schlackengrube', name: 'Der Hüter der Opfergrube', digest: 6, geld: 5000 },
  markeDigest: 1,
};

const jq = (j) => `dan_jagd_${j.id}`;
const jEnc = (j) => `dan_${j.id}_elite`; // Endung _elite: Balance-Test misst Eliten mit Seq 4
const jWon = (j) => `won_dan_jagd_${j.id}`;
const jPaid = (j) => `dan_jagd_${j.id}_bezahlt`;
const lq = (l) => `dan_liefer_${l.id}`;
const lPaid = (l) => `dan_liefer_${l.id}_bezahlt`;
const BOTE_ENC = 'dan_bote_elite';
const HUETER_ENC = 'dan_hueter_boss';
const markeFlag = (m) => `dan_${m.id}_gelesen`;

const itemName = (content, id) => content.items[id]?.name ?? id;
const lieferText = (content, items) => Object.entries(items).map(([id, n]) => `${n}× ${itemName(content, id)}`).join(', ');

/** Ein Ziel-Gegner auf Grundlage eines vorhandenen Gegners, sichtbar nur solange `visible_if` gilt. */
function ziel(content, { encId, base, map, name, boss = false, haerte, intro, win_text, on_win, visible_if, roamerId }) {
  const b = content.encounters[base];
  const m = content.maps[map];
  if (!b || !m) return false;
  content.encounters[encId] = {
    ...b, name, elite: !boss, boss, mittelboss: undefined, chapter: 3, city: 'dunscar', fleeable: true, wild: undefined, zone: undefined,
    respawn: undefined, intro, win_text, on_win,
    sheet: `enemy_dan_${encId.replace(/^dan_|_elite$|_boss$/g, '')}`, tint: undefined, // umgefärbtes Blatt (assets.js DAN_ZIELE)
    anschlag: true, hp_floor_mult: haerte.hp, dmg_mult: (b.dmg_mult ?? LATE_DMG_MULT[3][boss ? 'boss' : 'elite']) * haerte.dmg,
  };
  content.loot[encId] = { ...(content.loot[base] ?? {}), repeat: false };
  const vorbild = (m.roamers ?? [])[0]?.tile ?? [5, 5];
  m.roamers = [...(m.roamers ?? []), { id: roamerId, encounter: encId, tile: [...vorbild], visible_if }];
  return true;
}

export function applyDunscarAnschlag(content) {
  const bahnhof = content.maps.ds_endbahnhof;
  if (!bahnhof) return;
  const nodes = {};
  const choices = [];
  const back = [{ text: 'Zurück zum Brett.', next: 'start' }];

  // --- Jagdgesuche -------------------------------------------------------------------------
  const stufe1 = JAGDEN.filter((j) => j.stufe === 1);
  for (const j of JAGDEN) {
    const ok = ziel(content, {
      encId: jEnc(j), base: j.base, haerte: ZIEL_HAERTE[`stufe${j.stufe}`], map: j.map, name: j.name, roamerId: `dan_${j.id}_ziel`,
      intro: `${j.name}. Das Gesicht vom Anschlag, nur größer.`,
      win_text: `${j.name} fällt. Ezra Pell wird einen Zettel weniger am Brett haben.`,
      on_win: { sets_flags: [jWon(j)] },
      visible_if: { requires_flags: ['k3_arrived'], requires_quests_active: [jq(j)], hide_if_flags: [jWon(j)] },
    });
    if (!ok) continue;
    const lohnText = `${j.geld} Schilling und ${itemName(content, j.item)}`;
    content.quests[jq(j)] = {
      title: `Anschlag: ${j.name}`, kind: 'side', case: 'kapitel3',
      summary: `${j.text} Lohn: ${lohnText}.`,
      reward: { gives_money: 0 },
      steps: [
        { text: `${j.name} erledigen.`, done: { requires_flags: [jWon(j)] }, target: { map: j.map, id: `dan_${j.id}_ziel`, label: j.name } },
        { text: 'Bei Ezra Pell am Endbahnhof abholen.', done: { requires_flags: [jPaid(j)] }, target: { map: 'ds_endbahnhof', id: ANSCHLAG_NPC, label: 'Ezra Pell' } },
      ],
    };
    nodes[`jagd_${j.id}`] = { text: `${j.text} Lohn: ${lohnText}.`, choices: [{ text: 'Den Zettel abreißen.', next: `jagd_${j.id}_an` }, { text: 'Hängen lassen.', next: 'start' }] };
    nodes[`jagd_${j.id}_an`] = { text: 'Ezra Pell streicht den Anschlag mit Kreide an. „Gehört dir. Bring mir einen Beweis, dann zahlt das Brett.“', start_quests: [jq(j)], choices: back };
    nodes[`jagd_${j.id}_lohn`] = { text: `Ezra Pell vergleicht deinen Beweis mit dem Anschlag, nickt und zählt ${j.geld} Schilling ab. „Gut gemacht. Dunscar merkt sich so was.“`,
      gives_money: j.geld, gives_items: { [j.item]: 1 }, digest_pct: j.digest, sets_flags: [jPaid(j)], complete_quests: [jq(j)], choices: back };
    const stufe2 = j.stufe === 2 ? { requires_n_flags: { n: JAGD_STUFE2_AB, of: stufe1.map(jPaid) } } : {};
    choices.push(
      { text: `Jagd: ${j.name}`, next: `jagd_${j.id}`, requires_flags: ['k3_arrived'], ...stufe2, hide_if_quests: [jq(j)] },
      { text: `Lohn abholen: ${j.name}`, next: `jagd_${j.id}_lohn`, requires_flags: [jWon(j)], requires_quests_active: [jq(j)], hide_if_flags: [jPaid(j)] });
  }

  // --- Liefergesuche -----------------------------------------------------------------------
  for (const l of LIEFERUNGEN) {
    if (!Object.keys(l.items).every((id) => content.items[id])) continue;
    const was = lieferText(content, l.items);
    content.quests[lq(l)] = {
      title: `Liefergesuch: ${was}`, kind: 'side', case: 'kapitel3',
      summary: `${l.text} Lohn: ${l.geld} Schilling.`,
      reward: { gives_money: 0 },
      steps: [{ text: `${was} zu Ezra Pell am Endbahnhof bringen.`, done: { requires_flags: [lPaid(l)] }, target: { map: 'ds_endbahnhof', id: ANSCHLAG_NPC, label: 'Ezra Pell' } }],
    };
    nodes[`liefer_${l.id}`] = { text: `${l.text} Lohn: ${l.geld} Schilling.`, choices: [
      { text: `${was} abgeben.`, next: `liefer_${l.id}_lohn`, requires_item_counts: l.items },
      { text: 'Ich merke es mir.', next: `liefer_${l.id}_an`, hide_if_quests: [lq(l)] },
      { text: 'Zurück zum Brett.', next: 'start' }] };
    nodes[`liefer_${l.id}_an`] = { text: 'Ezra Pell schreibt deinen Namen klein unter den Anschlag. „Bring es, wenn du es hast.“', start_quests: [lq(l)], choices: back };
    nodes[`liefer_${l.id}_lohn`] = { text: `Ezra Pell wiegt die Ware, schreibt eine Quittung und zählt ${l.geld} Schilling ab. „Geht heute noch raus.“`,
      takes_items: l.items, gives_money: l.geld, digest_pct: l.digest, sets_flags: [lPaid(l)], start_quests: [lq(l)], complete_quests: [lq(l)], choices: back };
    choices.push({ text: `Liefergesuch: ${was}`, next: `liefer_${l.id}`, requires_flags: ['k3_arrived'], hide_if_flags: [lPaid(l)] });
  }

  // --- Die Spur des Alten ------------------------------------------------------------------
  const sp = SPUR;
  const markenOk = sp.marken.filter((m) => content.maps[m.map]);
  for (const m of markenOk) {
    const map = content.maps[m.map];
    const vorbild = (map.roamers ?? [])[1]?.tile ?? [6, 6];
    map.interactables = [...(map.interactables ?? []), {
      id: `dan_${m.id}`, kind: 'read', sprite: 'paper', prompt: m.title, title: m.title, text: m.text,
      footer: 'Die Spur des Alten', done_flag: markeFlag(m), effects: { digest_pct: sp.markeDigest },
      tile: [vorbild[0] + 1, vorbild[1]], visible_if: { requires_quests_active: [sp.quest] },
    }];
  }
  const alleMarken = markenOk.map(markeFlag);
  ziel(content, {
    encId: BOTE_ENC, base: sp.bote.base, haerte: ZIEL_HAERTE.bote, map: sp.bote.map, name: sp.bote.name, roamerId: 'dan_bote_ziel',
    intro: 'Ein Mann in einem Mantel, der ihm nicht gehört, die Hände kalkweiß. „Er hat gesagt, du kommst. Er hat gesagt, du bist zu klein.“',
    win_text: 'Der Bote sackt zusammen. In seiner Manteltasche steckt ein gefalteter Fahrschein ohne Zielbahnhof. Auf der Rückseite: „Opfergrube, Schlackengrund. Der Hüter wartet.“',
    on_win: { sets_flags: ['dan_bote_besiegt'], digest_pct: sp.bote.digest, gives_money: sp.bote.geld },
    visible_if: { requires_quests_active: [sp.quest], requires_flags: alleMarken, hide_if_flags: ['dan_bote_besiegt'] },
  });
  ziel(content, {
    encId: HUETER_ENC, base: sp.hueter.base, haerte: ZIEL_HAERTE.hueter, map: sp.hueter.map, name: sp.hueter.name, boss: true, roamerId: 'dan_hueter_ziel',
    intro: 'Aus der Schlacke steigt etwas, das einmal ein Vorarbeiter war. Auf seiner Brust brennt dieselbe bleiche Hand wie auf den Marken. Der Boden unter dir atmet.',
    win_text: 'Der Hüter zerfällt zu Asche. Tief unten im Fels dreht sich etwas im Schlaf um. Irgendwo in Dunscar hebt Starling den Kopf.',
    on_win: { sets_flags: ['dan_hueter_besiegt'], digest_pct: sp.hueter.digest, gives_money: sp.hueter.geld, gives_items: { ds_schlacke_kronglas: 1 } },
    visible_if: { requires_quests_active: [sp.quest], requires_flags: ['dan_bote_besiegt'], hide_if_flags: ['dan_hueter_besiegt'] },
  });
  content.quests[sp.quest] = {
    title: 'Die Spur des Alten', kind: 'side', case: 'kapitel3',
    summary: 'Ezra Pell sammelt seit Jahren, was über den bleichen Mann am Brett hängt. Starling hat dem Alten unter dem Fels Opfer gebracht. Wer die Opferstellen findet, findet seine Diener.',
    reward: { gives_money: 0 },
    steps: [
      ...markenOk.map((m) => ({ text: `Opfermarke finden: ${m.title}.`, done: { requires_flags: [markeFlag(m)] }, target: { map: m.map, id: `dan_${m.id}`, label: m.title } })),
      { text: 'Starlings Boten in der Rangierwüste stellen.', done: { requires_flags: ['dan_bote_besiegt'] }, target: { map: sp.bote.map, id: 'dan_bote_ziel', label: sp.bote.name } },
      { text: 'Den Hüter der Opfergrube in der Schlackengrube besiegen.', done: { requires_flags: ['dan_hueter_besiegt'] }, target: { map: sp.hueter.map, id: 'dan_hueter_ziel', label: sp.hueter.name } },
      { text: 'Ezra Pell berichten.', done: { requires_flags: ['dan_spur_berichtet'] }, target: { map: 'ds_endbahnhof', id: ANSCHLAG_NPC, label: 'Ezra Pell' } },
    ],
  };
  nodes.spur = { text: 'Ezra Pell zieht unter dem Brett eine Mappe hervor, voller Zettel über einen bleichen Mann. „Starling. Er hat dem Alten Opfer gebracht, an drei Stellen, ich weiß nur nicht, wo. Finde die Stellen, und du findest seine Diener. Bezahlt wird das nicht vom Brett. Das zahle ich selbst.“',
    choices: [{ text: 'Ich suche die Opferstellen.', next: 'spur_an' }, { text: 'Noch nicht.', next: 'start' }] };
  nodes.spur_an = { text: '„Klopfbruch, Rufschlucht, Unterschicht. Da hat man ihn gesehen. Schau dorthin, wo keiner hinschaut.“', start_quests: [sp.quest], choices: back };
  nodes.spur_ende = { text: 'Ezra Pell hört zu, ohne zu schreiben. Dann nimmt er den ältesten Zettel aus der Mappe und heftet ihn ganz oben ans Brett. „Jetzt weiß er, dass jemand kommt. Gut. Soll er sich fürchten.“',
    sets_flags: ['dan_spur_berichtet'], complete_quests: [sp.quest], gives_money: 2000, choices: back };
  choices.push(
    { text: 'Die Spur des Alten', next: 'spur', requires_flags: ['k3_arrived', 'k3r_gott_gehoert'], hide_if_quests: [sp.quest] },
    { text: 'Vom Hüter berichten.', next: 'spur_ende', requires_flags: ['dan_hueter_besiegt'], requires_quests_active: [sp.quest] });

  // --- Ezra Pell -----------------------------------------------------------------------------
  nodes.start = {
    text: 'Ein dünner Mann mit Kreide an allen Fingern heftet Zettel an ein Brett, das schon unter dem Papier durchbiegt. „Pell. Wer hier etwas sucht, sucht es am Brett. Jagd, Lieferung, und was sonst keiner laut sagt. Bezahlt wird bei mir.“',
    choices: [...choices, { text: 'Wie viele Anschläge hängen denn hier?', next: 'brett' }, { text: 'Auf Wiedersehen.' }],
  };
  nodes.brett = { text: `„Mehr, als einer allein schafft. Die harten Jagden hänge ich erst aus, wenn jemand ${JAGD_STUFE2_AB} von den leichten erledigt hat. Ich schicke keine Leute in die Schlacke, die ich nicht kenne.“`, choices: back };
  content.dialogues[ANSCHLAG_NPC] = { start: 'start', nodes };
  content.npcs[ANSCHLAG_NPC] = { name: 'Ezra Pell', role: 'Anschlagschreiber, Endbahnhof',
    palette: { coat: '#5a5448', hat: '#2a2622', skin: '#d0b090', hair: '#9a8a70', legs: '#2a2622', scarf: '#c8c0a8' }, dialogue: ANSCHLAG_NPC };
  if (!bahnhof.npcs.some((n) => n.id === ANSCHLAG_NPC)) bahnhof.npcs.push({ id: ANSCHLAG_NPC, tile: [3, 3], facing: 'down', visible_if: { requires_flags: ['k3_arrived'] } });
}
