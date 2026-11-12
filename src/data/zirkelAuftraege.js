// Zirkel-Aufträge in Dunscar (Seb 2026-11-12): Zirkelmitglieder verteilen Aufgaben am Tisch,
// z. B. „Töte dieses Monster“ oder „Erledige diesen Polizisten“. Freiwillig, je Auftrag einmal.
// Belohnung: Geld, ein seltenes Dunscar-Wertstück (die Zirkel kaufen es teuer zurück) und Beziehung zum Auftraggeber.
// Ein toter Polizist hebt die Fahndung (Stufe 2).
// Ziele sind Elite-Gegner (Lebens-Untergrenze ab Kapitel 3), sichtbar nur solange der Auftrag läuft.

const MONSTER_LOHN = 1500;
const POLIZEI_LOHN = 2200;

/** Je Dunscar-Zirkel ein Auftraggeber mit zwei Aufträgen. `base` = Gegner, dessen Werte und Bild das Ziel übernimmt. */
export const ZIRKEL_AUFTRAEGE = {
  schichtbund: { giver: 'dsz_sb_hauer', jobs: [
    { id: 'kalkfresser', kind: 'monster', base: 'kalkstaubgeist', map: 'ds_klopfbruch', name: 'Der Kalkfresser',
      text: 'Mats senkt die Stimme. „Im Klopfbruch frisst ein Staubgeist unsere Hauer. Drei Mann diese Woche. Mach ihn weg, und die Waage zahlt.“' },
    { id: 'brask', kind: 'polizei', base: 'k3p_gangaufseher', map: 'ds_schwellenring', name: 'Wachtmeister Brask',
      text: '„Brask von der Bahnaufsicht hat zwei von uns verpfiffen“, sagt Mats. „Er geht nachts allein über den Schwellenring. Allein. Verstehst du?“' },
  ] },
  stellwerk: { giver: 'dsz_telegrafistin', jobs: [
    { id: 'stellwerksecho', kind: 'monster', base: 'nachhall', map: 'ds_rufschlucht', name: 'Das Echo des Stellwerks',
      text: 'Mira tippt eine Nachricht, die nirgends ankommt. „In der Rufschlucht antwortet etwas auf unsere Signale. Es klingt wie wir. Bring es zum Schweigen.“' },
    { id: 'stieg', kind: 'polizei', base: 'k3p_gangaufseher', map: 'ds_signalhang', name: 'Inspektor Stieg',
      text: '„Inspektor Stieg liest unsere Kreidezeichen mit“, sagt Mira. „Er steht jeden Abend am Signalhang und schreibt mit. Ein Notizbuch weniger wäre schön.“' },
  ] },
  kalkofen: { giver: 'dsz_brenner', jobs: [
    { id: 'gerueststimme', kind: 'monster', base: 'geruestklang', map: 'ds_unterschicht', name: 'Die Gerüststimme',
      text: 'Jonas wiegt den Hammer in der Hand. „In der Unterschicht singt ein Gerüst. Wer zuhört, geht hinein und kommt nicht wieder. Jem zahlt, wenn es still ist.“' },
    { id: 'kropp', kind: 'polizei', base: 'k3p_gangaufseher', map: 'ds_kalkmarkt', name: 'Konstabler Kropp',
      text: '„Konstabler Kropp nimmt am Kalkmarkt Schutzgeld und gibt uns dafür Razzien“, sagt Jonas. „Die Gesellschaft möchte, dass er aufhört. Ganz.“' },
  ] },
  salzds: { giver: 'dsz_sb_kassiererin', jobs: [
    { id: 'salzkraehe', kind: 'monster', base: 'signalkraehe', map: 'ds_rangierwueste', name: 'Die Salzkrähe',
      text: 'Ada zählt Münzen, die fehlen. „Eine Krähe in der Rangierwüste stiehlt uns jedes Wertstück vom Wagen. Groß wie ein Hund. Die Brüder zahlen für ihre Federn.“' },
    { id: 'fehr', kind: 'polizei', base: 'k3p_gangaufseher', map: 'ds_arbeiterbogen', name: 'Zollwachtmeisterin Fehr',
      text: '„Fehr wiegt unser Salz nach und zieht jedes Mal ein Drittel ein“, sagt Ada. „Am Arbeiterbogen hat sie ihre Runde. Die Brüder hätten gern ihre Waage zurück.“' },
  ] },
};

const questId = (j) => `zirkelauftrag_${j.id}`;
const encId = (j) => `za_${j.id}_elite`; // Endung _elite: Balance-Test misst Eliten mit Seq 4
const wonFlag = (j) => `won_zirkelauftrag_${j.id}`;
const paidFlag = (j) => `zirkelauftrag_${j.id}_bezahlt`;

/** Belohnung je Art: Geld, Wertstück, Beziehung zum Auftraggeber. */
function lohn(j, giver) {
  return j.kind === 'polizei'
    ? { gives_money: POLIZEI_LOHN, gives_items: { ds_beute_kalkopal: 1 }, relation: { [giver]: 1 } }
    : { gives_money: MONSTER_LOHN, gives_items: { ds_beute_schichtgold: 1 }, relation: { [giver]: 1 } };
}

export function applyZirkelAuftraege(content) {
  const circles = content.gatherings?.circles ?? {};
  for (const [cid, def] of Object.entries(ZIRKEL_AUFTRAEGE)) {
    const c = circles[cid];
    const tree = content.dialogues[def.giver];
    if (!c || !tree?.nodes?.start) continue;
    const giverName = content.npcs[def.giver]?.name ?? def.giver;
    const choices = [];
    for (const j of def.jobs) {
      const base = content.encounters[j.base];
      const map = content.maps[j.map];
      if (!base || !map) continue;
      const l = lohn(j, def.giver);
      const lohnText = `${l.gives_money} Schilling und ${content.items[Object.keys(l.gives_items)[0]]?.name ?? 'ein Wertstück'}`;
      // Ziel: Elite mit den Werten des Grundgegners
      content.encounters[encId(j)] = {
        ...base, name: j.name, elite: true, boss: false, chapter: 3, city: 'dunscar', fleeable: true, wild: undefined, zone: undefined,
        intro: j.kind === 'polizei' ? `${j.name} dreht sich um, die Hand schon am Knüppel. „Ich weiß, wer dich schickt.“` : `${j.name} wendet sich dir zu. Das ist das, wofür der Zirkel zahlt.`,
        win_text: j.kind === 'polizei' ? `${j.name} bleibt liegen. Irgendwo pfeift schon eine Streife.` : `${j.name} fällt. Der Zirkel wird es hören.`,
        on_win: { sets_flags: [wonFlag(j)], ...(j.kind === 'polizei' ? { wanted: 2, wanted_reason: `${j.name} getötet` } : {}) },
      };
      content.loot[encId(j)] = { ...(content.loot[j.base] ?? {}), repeat: false };
      map.roamers = [...(map.roamers ?? []), { id: `za_${j.id}_ziel`, encounter: encId(j), tile: [5, 5],
        visible_if: { requires_flags: ['k3_arrived'], requires_quests_active: [questId(j)], hide_if_flags: [wonFlag(j)] } }];
      content.quests[questId(j)] = {
        title: `Zirkelauftrag: ${j.name}`, kind: 'side', case: 'kapitel3',
        summary: `${giverName} (${c.name}) will ${j.kind === 'polizei' ? `${j.name} aus dem Weg haben. Ein toter Polizist bringt die Fahndung auf dich` : `${j.name} tot sehen`}. Lohn: ${lohnText}.`,
        reward: { gives_money: 0 },
        steps: [
          { text: `${j.name} erledigen.`, done: { requires_flags: [wonFlag(j)] }, target: { map: j.map, id: `za_${j.id}_ziel`, label: j.name } },
          { text: `Beim nächsten Treffen bei ${giverName} abholen.`, done: { requires_flags: [paidFlag(j)] }, target: { map: c.map, id: def.giver, label: giverName } },
        ],
      };
      tree.nodes[`auftrag_${j.id}`] = { text: `${j.text} Lohn: ${lohnText}.`, choices: [
        { text: 'Ich übernehme das.', next: `auftrag_${j.id}_an` }, { text: 'Lieber nicht.', next: 'start' }] };
      tree.nodes[`auftrag_${j.id}_an`] = { text: `${giverName} nickt. „Komm zum nächsten Treffen, wenn es erledigt ist.“`, start_quests: [questId(j)], choices: [{ text: 'Zurück.', next: 'start' }] };
      tree.nodes[`auftrag_${j.id}_lohn`] = { text: `${giverName} zählt dir ${l.gives_money} Schilling hin und legt etwas Schweres dazu. „Der Zirkel vergisst das nicht.“`,
        ...l, sets_flags: [paidFlag(j)], complete_quests: [questId(j)], choices: [{ text: 'Zurück.', next: 'start' }] };
      choices.push(
        { text: `Auftrag: ${j.name}`, next: `auftrag_${j.id}`, requires_flags: ['k3_arrived'], hide_if_quests: [questId(j)], hide_if_flags: [paidFlag(j)] },
        { text: `Lohn abholen: ${j.name}`, next: `auftrag_${j.id}_lohn`, requires_flags: [wonFlag(j)], requires_quests_active: [questId(j)], hide_if_flags: [paidFlag(j)] });
    }
    const start = tree.nodes.start;
    tree.nodes.start = { ...start, choices: [...start.choices.slice(0, -1), ...choices, start.choices.at(-1)] };
  }
}
