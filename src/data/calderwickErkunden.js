/**
 * Calderwick erkunden (Seb 2026-11-26: „wenig zu erkunden“).
 * Läuft direkt nach dem Stadtplan (braucht dessen Sackgassen):
 * - Je Terrasse ein Versteck in einer Sackgasse zwischen den Häusern an der Nordmauer: eine Truhe, bewacht von einem
 *   Calderwicker Monster (eigene Begegnung, einmal). Die Truhe öffnet sich erst nach dem Sieg und gibt Geld, Grundzutaten
 *   und einen Calderwicker Fund (Zutaten 4/3, Kleidung, Waffen, Artefakte).
 * - Je Terrasse ein verbrannter Brief in einer zweiten Sackgasse (Lesetext über die Gefallenen).
 * - Zwei Nebenaufträge: „Die sechs Verstecke“ (alle Truhen) und „Verbrannte Briefe“ (alle Briefe), mit Belohnung am Ende.
 */
import { CW_TERRASSEN } from './calderwickStadtplan.js';
import { cwBeuteTopf } from './calderwickBeute.js';

/** Wächter je Terrasse (Vorlage aus den Gefahrengebieten) und was im Versteck liegt. */
const VERSTECKE = {
  cw_gleisfuss: { vorlage: 'vg_cw_registerratte', titel: 'Kiste unter dem Bremsklotz', text: 'Unter einem losen Bremsklotz hat ein Träger seine Rücklage versteckt. Er ist nie zurückgekommen.' },
  cw_setzergasse: { vorlage: 'vg_cw_letternlaeufer', titel: 'Setzkasten hinter der Mauer', text: 'Ein Setzkasten, zugenagelt. Statt Lettern liegen darin Dinge, die jemand nicht verpfänden wollte.' },
  cw_quittungsmarkt: { vorlage: 'vg_cw_stempelhand', titel: 'Die Kasse ohne Quittung', text: 'Eine Geldkassette ohne Beleg. Auf dem Markt gilt sie damit als nie vorhanden.' },
  cw_roehrenhof: { vorlage: 'vg_cw_rohrpostwespe', titel: 'Verstopfte Rohrpostkapsel', text: 'Eine Kapsel, die seit Jahren im Rohr steckte. Die Wespen haben sie bewacht, als wüssten sie, was darin ist.' },
  cw_witwenterrasse: { vorlage: 'vg_cw_durchschlag', titel: 'Truhe unter der Wäscheleine', text: 'Unter den Laken, die nie trocknen, steht eine Truhe. Die Witwen sagen, sie gehöre allen, die noch zurückkommen.' },
  cw_kronenarchiv: { vorlage: 'vg_cw_tintenschatten', titel: 'Ausgemusterter Archivkasten', text: 'Ein Kasten mit dem Stempel „ausgesondert“. Ausgesondert wurde nur das Inventar, nicht der Inhalt.' },
};

/** Verbrannte Briefe der Gefallenen, je Terrasse einer. */
const BRIEFE = {
  cw_gleisfuss: ['Brief ohne Absender', 'Liebe Mara, oben haben sie mir die Haut genommen und den Namen gleich mit. Hier unten nennt man mich „der vom Dienstag“. Ich hoffe, du nennst mich noch anders.'],
  cw_setzergasse: ['Angesengter Satzbogen', 'Wir setzen jeden Morgen die Namen der Neuen. Abends sind drei davon schon wieder herausgekratzt. Niemand fragt, wer die Lettern holt.'],
  cw_quittungsmarkt: ['Zerknüllte Schuldnotiz', 'Ich schulde dem Pfandhaus meinen Mantel, dem Markt mein Brot und der Stadt meinen Namen. Nur Letzteres wird jeden Tag teurer.'],
  cw_roehrenhof: ['Rohrpostzettel, halb verkohlt', 'Wer diese Kapsel findet: Die Rohre führen nicht nur hinauf. Eins führt hinunter, unter das Kronenarchiv. Dort wird nichts zugestellt, dort wird gesammelt.'],
  cw_witwenterrasse: ['Brief einer Witwe', 'Sie sagen, mein Mann sei gestürzt. Ich habe ihn nicht fallen sehen. Ich habe nur gesehen, wie sein Name von der Tafel verschwand, eine Stunde bevor sie es mir sagten.'],
  cw_kronenarchiv: ['Verbrannte Austrittsliste', 'Zwölf Namen, sauber durchgestrichen, alle mit derselben Tinte. Am Rand, in anderer Hand: „Nicht gestrichen. Geerntet.“'],
};

const verstFlag = (id) => `cwx_${id}_truhe`;
const briefFlag = (id) => `cwx_${id}_brief`;
const waechterId = (id) => `cwx_${id}_waechter`;

/** Sackgassen: Bodenfelder an der Nordmauer (y = 1) zwischen zwei Häusern. */
function sackgassen(m) {
  const r = m.rows;
  const out = [];
  for (let x = 3; x < r[0].length - 8; x++) {
    if (r[1][x] !== '.' || r[2][x] !== '.') continue;
    const haus = (xx) => 'R#WD'.includes(r[1][xx]);
    // echte Gasse: links ein Haus, rechts nach höchstens einem weiteren Feld wieder eins
    const rechts = [1, 2, 3].find((d) => haus(x + d));
    if (haus(x - 1) && rechts && [...Array(rechts - 1).keys()].every((d) => r[1][x + 1 + d] === '.')) out.push([x, 1]);
  }
  return out;
}

export function applyCalderwickErkunden(content) {
  const pool = cwBeuteTopf(content);
  const verstStufen = [];
  const briefStufen = [];
  for (const id of CW_TERRASSEN) {
    const m = content.maps[id];
    const v = VERSTECKE[id];
    const b = BRIEFE[id];
    if (!m || !v) continue;
    const belegt = new Set([...m.interactables, ...m.npcs].map((o) => o.tile.join(',')));
    const gassen = sackgassen(m).filter(([x, y]) => !belegt.has(`${x},${y}`) && !belegt.has(`${x},${y + 1}`) && !belegt.has(`${x},${y + 2}`));
    if (gassen.length < 2) continue;
    // Versteck in der Gasse ganz rechts, Brief in der ganz links (die Nachbarfelder bleiben frei, damit man vorbeikommt)
    const [vx, vy] = gassen[gassen.length - 1];
    const [bx, by] = gassen[0];
    const base = content.encounters[v.vorlage];
    if (base) {
      content.encounters[waechterId(id)] = {
        ...structuredClone(base), id: waechterId(id), elite: true, roam: false,
        name: `${base.name} (Wächter)`, intro: `In der Sackgasse hat sich etwas eingenistet: ${base.name}. Es bewacht ${v.titel.toLowerCase()}.`,
        win_text: `${base.name} zerfällt. Dahinter steht ${v.titel.toLowerCase()}.`, lose_to: { map: id, spawn: 'default' },
      };
      content.loot[waechterId(id)] = structuredClone(content.loot[v.vorlage] ?? { money: [0, 0], drops: [] });
      delete content.loot[waechterId(id)].repeat;
      m.interactables.push({ id: waechterId(id), kind: 'combat', encounter: waechterId(id), tile: [vx, vy + 2], sprite: `ow_${v.vorlage}`, frame: 0, prompt: `${base.name} stellen`, marker: true,
        visible_if: { requires_flags: ['k4_arrived'], hide_if_flags: [`won_${waechterId(id)}`] } });
    }
    // Truhe: Geld, Grundzutaten und zwei feste Calderwicker Fundstücke (ein Ausrüstungs-/Artefaktstück, eine Seq-4-Zutat)
    const n = CW_TERRASSEN.indexOf(id);
    const stueck = (f, k) => { const l = pool.filter((e) => f(content.items[e.item])); return l.length ? l[(n * 7 + k) % l.length].item : null; };
    const gaben = { nebeltau: 2, silberstaub: 2, geisteressenz: 1 };
    for (const it of [stueck((x) => ['gear', 'weapon', 'artifact'].includes(x.kind), 3), stueck((x) => x.kind === 'ingredient', 5), stueck((x) => x.cw_fund, 2)]) if (it) gaben[it] = (gaben[it] ?? 0) + 1;
    m.interactables.push({ id: `cwx_${id}_versteck`, kind: 'read', tile: [vx, vy], sprite: 'G_loot_truhe', frame: 0, prompt: 'Durchsuchen', title: v.titel, text: v.text, marker: true,
      done_flag: verstFlag(id), effects: { gives_money: 2400, gives_items: gaben },
      visible_if: { requires_flags: base ? ['k4_arrived', `won_${waechterId(id)}`] : ['k4_arrived'], hide_if_flags: [verstFlag(id)] } });
    m.interactables.push({ id: `cwx_${id}_brief`, kind: 'read', tile: [bx, by], sprite: 'paper', prompt: 'Untersuchen', title: b[0], text: b[1], marker: false,
      done_flag: briefFlag(id), effects: { start_quests: ['cwx_briefe'] }, visible_if: { requires_flags: ['k4_arrived'] } });
    verstStufen.push({ text: `${v.titel} (${m.name})`, done: { requires_flags: [verstFlag(id)] }, target: { map: id, id: `cwx_${id}_versteck`, label: m.name } });
    briefStufen.push({ text: `${b[0]} (${m.name})`, done: { requires_flags: [briefFlag(id)] }, target: { map: id, id: `cwx_${id}_brief`, label: m.name } });
    // Hinweis auf die Verstecke: ein Aushang am Gleisfuß startet den Auftrag
  }
  if (!verstStufen.length) return content;
  const gf = content.maps.cw_gleisfuss;
  const frei = (t) => !gf.interactables.some((o) => o.tile[0] === t[0] && o.tile[1] === t[1]);
  const aushang = [[16, 20], [17, 20], [27, 20], [28, 20]].find(frei) ?? [16, 20];
  gf.interactables.push({ id: 'cwx_aushang', kind: 'read', tile: aushang, prompt: 'Aushang lesen', title: 'Aushang der Träger', marker: true,
    text: 'Mit Kreide auf ein Brett geschrieben: „In jeder Terrasse hat einer von uns etwas versteckt, ehe er gestrichen wurde. Hinten in den Gassen an der Mauer. Passt auf, was dort jetzt wohnt.“',
    done_flag: 'cwx_aushang_gelesen', effects: { start_quests: ['cwx_verstecke'] }, visible_if: { requires_flags: ['k4_arrived'] } });
  // Belohnungen: am Aushang bzw. im Kronenarchiv, sobald alles gefunden ist
  gf.interactables.push({ id: 'cwx_verstecke_lohn', kind: 'read', tile: aushang, prompt: 'Den Trägern Bescheid geben', title: 'Die sechs Verstecke',
    text: 'Unter dem Aushang liegt ein Umschlag mit deinem Namen. Die Träger zahlen, was sie sich gegenseitig schuldeten: an den, der alles gefunden hat.',
    marker: true, done_flag: 'cwx_verstecke_fertig', effects: { gives_money: 15000, gives_items: { silberstaub: 3, nebeltau: 3, geisteressenz: 2 }, complete_quests: ['cwx_verstecke'] },
    visible_if: { requires_flags: verstStufen.map((s) => s.done.requires_flags[0]), hide_if_flags: ['cwx_verstecke_fertig'] } });
  const ka = content.maps.cw_kronenarchiv;
  const ruth = content.maps.cw_archivsaal;
  const lohnKarte = ruth ?? ka;
  const lohnTile = ruth ? (ruth.npcs.find((n) => n.id === 'cw_malliver')?.tile ?? [12, 6]) : [25, 20];
  lohnKarte.interactables.push({ id: 'cwx_briefe_lohn', kind: 'read', tile: [lohnTile[0] + 1, lohnTile[1]], prompt: 'Die Briefe abgeben', title: 'Verbrannte Briefe',
    text: 'Ruth Malliver legt die sechs Briefe nebeneinander und liest lange. „Die Tinte ist überall dieselbe“, sagt sie. „Das hier ist kein Zufall, das ist eine Liste.“ Sie gibt dir, was das Archiv für Beweise zahlt.',
    marker: true, done_flag: 'cwx_briefe_fertig', effects: { gives_money: 12000, gives_items: { geisteressenz: 3 }, complete_quests: ['cwx_briefe'] },
    visible_if: { requires_flags: briefStufen.map((s) => s.done.requires_flags[0]), hide_if_flags: ['cwx_briefe_fertig'] } });
  content.quests.cwx_verstecke = {
    title: 'Die sechs Verstecke', kind: 'side', case: 'side',
    summary: 'Gestrichene Träger haben in jeder Terrasse etwas versteckt, hinten in den Sackgassen an der Nordmauer. Dort wohnt jetzt etwas, das die Verstecke bewacht.',
    steps: [...verstStufen, { text: 'Den Trägern am Aushang Bescheid geben', done: { requires_flags: ['cwx_verstecke_fertig'] }, target: { map: 'cw_gleisfuss', id: 'cwx_verstecke_lohn', label: 'Gleisfuß' } }],
  };
  content.quests.cwx_briefe = {
    title: 'Verbrannte Briefe', kind: 'side', case: 'side',
    summary: 'In den Gassen Calderwicks liegen angesengte Briefe von Gefallenen. Zusammen erzählen sie, wohin die Gestrichenen gehen.',
    steps: [...briefStufen, { text: 'Die Briefe zu Ruth Malliver ins Archiv bringen', done: { requires_flags: ['cwx_briefe_fertig'] }, target: { map: lohnKarte.id, id: 'cwx_briefe_lohn', label: lohnKarte.name } }],
  };
  return content;
}
