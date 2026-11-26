/**
 * Rivale auf dem eigenen Pfad (Seb 2026-11-26, Brainstorming): ab Wexmoor geht ein zweiter Beyonder denselben Pfad.
 *
 * - Je Pfad ein fester Rivale (RIVALEN). Im Koop hat jeder Spieler den Rivalen seines Pfades (gleicher Pfad: derselbe).
 * - Er steigt parallel auf (core/Rivale.js): holt jeden Spieltag eine Sequenz auf, ist er gleichauf, zieht er manchmal
 *   eine Sequenz davon (höchstens eine).
 * - Er kauft Zutaten deines nächsten Tranks weg: auf dem Markt (je Spieltag) und auf geheimen Treffen (je Treffen).
 * - Er taucht in den Straßen und auf den Treffen auf: Kämpfen, Bestehlen, Bündnis anbieten (ab zwei Siegen) oder gehen.
 * - Manchmal steht er schon in deinem Ritualkreis: wer heute trinken will, muss ihn hinauswerfen.
 * - Seine Kämpfe: Gegner `rivale_<pfad>_<seq>` (machBeyonder, Pfad-Fertigkeiten), Beute mit Beyonder-Rest (RIVALE_REGELN.rest).
 */
import { machBeyonder } from './gegnerBeyonder.js';
import { restId } from './beyonderRest.js';

/** Je Pfad ein Rivale (Namen gelten in beiden Sprachen). Im Koop hat Spieler 2 einen eigenen (name2), auch auf demselben Pfad. */
export const RIVALEN = {
  laterne: { name: 'Corvin Ashby', name2: 'Ada Vellacott' },
  faden: { name: 'Mirela Thorn', name2: 'Rupert Glass' },
  maske: { name: 'Silas Morrel', name2: 'Liesl Varga' },
  echo: { name: 'Ines Halloway', name2: 'Emmerich Dahl' },
  kessel: { name: 'Bram Sutter', name2: 'Clara Penhallow' },
  eisen: { name: 'Garrick Holm', name2: 'Hedda Krone' },
  schluessel: { name: 'Nell Quist', name2: 'Felix Wren' },
  sq_waage: { name: 'Ottoline Brack', name2: 'Julius Arkwright' },
  sq_moor: { name: 'Fenna Rook', name2: 'Oskar Mire' },
  sq_uhr: { name: 'Tobias Merrin', name2: 'Wilma Tock' },
};

export const RIVALE_REGELN = {
  ab_flag: 'k2_arrived', // erst ab Wexmoor (in Kettlegate wäre es komisch, Seb)
  vorsprung: 0.3, // je Spieltag: gleichauf → eine Sequenz voraus
  markt: 0.35, // je Händler und Spieltag: eine Zutat deines nächsten Tranks ist weggekauft
  treffen: 0.45, // je Händler auf einem geheimen Treffen
  ritual: 0.35, // je Spieltag: steht schon im Ritualkreis (wenn er auf deiner Zielsequenz oder weiter ist)
  begegnung: 0.2, // je betretener Straße, höchstens einmal am Tag
  begegnung_treffen: 0.5, // auf dem Ort eines geheimen Treffens
  ruhe_tage: 1, // nach einer Niederlage hält er sich so viele Spieltage (dazu der laufende) zurück
  buendnis_siege: 2, // so oft muss man ihn geschlagen haben, bevor er ein Bündnis annimmt
  rest: 0.3, // Chance auf seinen Beyonder-Rest
  stehlen_basis: 0.45,
  stehlen_je_seq: 0.12, // je Sequenz, die du ihm voraus bist (bzw. minus, wenn er voraus ist)
  stehlen_pfad: 0.15, // Schlüssel und Maske stehlen leichter
  stehlen_min: 0.15,
  stehlen_max: 0.85,
  geschenk: 0.6, // als Verbündeter: Chance je Begegnung auf eine Zutat deines nächsten Tranks
  geld_je_seq: 60, // Diebesgut, wenn kein nächster Trank mehr ansteht: (10 − Sequenz) × so viel
};

/** Gegner-Grundlage je Sequenz: [Vorlage, Faktor]. Leben × Faktor, Schaden × √Faktor. */
const BASIS = {
  9: ['wxk_gleispluenderer', 0.8],
  8: ['wxk_gleispluenderer', 0.9],
  7: ['wxk_gleispluenderer', 1.15],
  6: ['wxk_moorhehler', 1],
  5: ['k3k_staubschmuggler_elite', 1],
  4: ['k4s_kg_aschmann', 1],
  3: ['k4s_kg_aschmann', 1.6],
  2: ['k4s_kg_aschmann', 2.5],
  1: ['k4s_kg_aschmann', 4],
};

/** Felder der Vorlage, die zu ihrer Geschichte gehören (Flags, Orte, Laufen auf der Karte). */
const WEG = ['roam', 'on_win', 'first_win', 'lose_to', 'win_text', 'flee_text', 'zone', 'id', 'pathway', 'wild', 'city', 'boss', 'sieg_flag', 'phase2', 'benannt', 'on_lose', 'on_flee', 'mittelboss'];

/** Gegner-Id; nr 2 = Rivale von Spieler 2 (eigener Name). */
export const rivaleEncId = (pid, seq, nr = 1) => `${nr === 2 ? 'rivale2' : 'rivale'}_${pid}_${seq}`;
export const rivaleName = (pid, nr = 1) => (nr === 2 ? RIVALEN[pid]?.name2 : RIVALEN[pid]?.name) ?? '?';

/**
 * Texte mit Platzhaltern: {name} (Name des Rivalen), Zahlen stehen direkt im Text (I18n ersetzt sie selbst).
 * [Deutsch, Englisch]; das englische Wörterbuch (src/i18n/en/rivale.json) wird daraus erzeugt (rivaleWoerterbuch).
 */
export const RIVALE_TEXTE = {
  erste: ['Ein fremdes Gesicht, das du trotzdem kennst: {name} geht denselben Pfad wie du. Seit Wexmoor kauft jemand die Zutaten weg, bevor du kommst. Jetzt weißt du, wer.',
    'A stranger\'s face you somehow know: {name} walks the same pathway as you. Since Wexmoor someone has been buying up the ingredients before you arrive. Now you know who.'],
  voraus: ['{name} steht dir im Weg, eine Sequenz weiter als du. Das Lächeln sagt: Ich war zuerst da.',
    '{name} stands in your way, one Sequence ahead of you. The smile says: I got here first.'],
  gleich: ['{name} lehnt an einer Hauswand und hat dich längst gesehen. Derselbe Pfad, dieselbe Sequenz. Einer von euch wird zuerst trinken.',
    '{name} leans against a wall and spotted you long ago. Same pathway, same Sequence. One of you will drink first.'],
  hinter: ['{name} folgt dir seit Tagen, einen Schritt hinter dir auf deinem Pfad, und mit jedem Tag näher.',
    '{name} has been following you for days, one step behind you on your pathway, and closer every day.'],
  treffen: ['Auf dem Treffen sitzt {name} schon in der ersten Reihe und bietet auf alles, was nach deinem Pfad riecht.',
    'At the gathering {name} already sits in the front row, bidding on everything that smells of your pathway.'],
  verbuendet: ['{name} nickt dir zu. Seit eurem Bündnis legt {name} zurück, was dir fehlt, statt es dir wegzukaufen.',
    '{name} nods to you. Since your alliance, {name} sets aside what you need instead of buying it out from under you.'],
  geschlagen: ['{name} sieht dich und wechselt die Straßenseite. Die letzte Niederlage sitzt noch.',
    '{name} sees you and crosses the street. The last defeat still stings.'],
  stehlen_ok: ['Ein Griff in die Manteltasche, als {name} sich umdreht. Du hast es.',
    'A dip into the coat pocket as {name} turns away. You have it.'],
  stehlen_nichts: ['Ein Griff in die Manteltasche, als {name} sich umdreht. Nur Kleingeld, aber immerhin.',
    'A dip into the coat pocket as {name} turns away. Only coins, but still.'],
  stehlen_fehl: ['{name} packt dein Handgelenk. „Das war dumm.“',
    '{name} grabs your wrist. "That was stupid."'],
  stehlen_heute: ['{name} hält heute die Hand auf der Tasche. Einmal am Tag reicht.',
    '{name} keeps a hand on the pocket today. Once a day is enough.'],
  buendnis_ja: ['{name} wischt sich das Blut von der Lippe. „Du hast mich oft genug auf den Boden gelegt. Gut. Lieber neben dir als unter dir.“ Ab jetzt kauft {name} dir nichts mehr weg und lässt deinen Ritualkreis in Ruhe.',
    '{name} wipes the blood from their lip. "You\'ve put me on the ground often enough. Fine. Better beside you than beneath you." From now on {name} buys nothing out from under you and leaves your ritual circle alone.'],
  buendnis_nein: ['{name} lacht. „Bündnis? Schlag mich erst ein paar Mal, dann reden wir.“',
    '{name} laughs. "An alliance? Beat me a few times first, then we\'ll talk."'],
  geschenk: ['{name} drückt dir etwas in die Hand. „Für deinen nächsten Trank. Vergiss nicht, wer es dir gab.“',
    '{name} presses something into your hand. "For your next potion. Don\'t forget who gave it to you."'],
  kein_geschenk: ['{name} hat heute nichts für dich. „Morgen vielleicht.“',
    '{name} has nothing for you today. "Maybe tomorrow."'],
  sieg: ['{name} geht in die Knie und spuckt aus. „Das war nicht das letzte Mal.“ Für eine Weile lässt {name} deine Händler in Ruhe.',
    '{name} drops to one knee and spits. "That wasn\'t the last time." For a while {name} leaves your merchants alone.'],
  sieg_respekt: ['Etwas hat sich verändert: {name} sieht dich jetzt mit Respekt an. Vielleicht ließe sich über ein Bündnis reden.',
    'Something has changed: {name} now looks at you with respect. Perhaps an alliance could be discussed.'],
  niederlage: ['{name} steigt über dich hinweg und geht ohne Eile. Dein Geldbeutel ist leichter.',
    '{name} steps over you and walks off unhurried. Your purse is lighter.'],
  flucht: ['Du lässt {name} stehen. Das Lachen hörst du noch zwei Straßen weiter.',
    'You leave {name} standing. You can still hear the laughter two streets away.'],
  ritual: ['Als du den Kreis ziehst, steht schon jemand darin: {name}, auf deinem Pfad und schneller als du. „Such dir einen anderen Abend.“ Wer heute trinken will, muss {name} aus dem Kreis werfen.',
    'As you draw the circle, someone is already standing in it: {name}, on your pathway and faster than you. "Find yourself another evening." If you want to drink today, you have to throw {name} out of the circle.'],
  ritual_besetzt: ['{name} hält deinen Ritualkreis heute besetzt. Versuch es morgen wieder.',
    '{name} is occupying your ritual circle today. Try again tomorrow.'],
  ritual_frei: ['{name} hinkt aus dem Kreis. Der Platz gehört dir.',
    '{name} limps out of the circle. The place is yours.'],
  markt: ['{name} war vor dir hier und hat weggekauft, was du für deinen nächsten Trank brauchst.',
    '{name} was here before you and bought up what you need for your next potion.'],
  gegner: ['{name}, Rivale auf deinem Pfad', '{name}, rival on your pathway'],
  intro: ['{name} stellt sich dir in den Weg. Derselbe Pfad, nur einer kann zuerst ankommen.',
    '{name} blocks your way. The same pathway, and only one can arrive first.'],
};

/** Feste Texte ohne Namen. */
export const RIVALE_UI = {
  'Rivale auf deinem Pfad': 'Rival on your pathway',
  Kämpfen: 'Fight',
  Bestehlen: 'Steal',
  'Bündnis anbieten': 'Offer an alliance',
  Weitergehen: 'Walk on',
  Verbündet: 'Allied',
  Rivale: 'Rival',
  'Hält sich zurück': 'Keeping their distance',
  Weggekauft: 'Bought up',
  'Rivale war schneller': 'Rival was faster',
  'Noch nicht begegnet. Ab Wexmoor geht jemand denselben Pfad wie du.': 'Not met yet. From Wexmoor on, someone walks the same pathway as you.',
  'Diebesgut': 'Loot',
  'Ein Kampf steht bevor.': 'A fight is coming.',
};

/** Text für einen Rivalen. */
export function rivaleText(key, pid, nr = 1) {
  const t = RIVALE_TEXTE[key]?.[0] ?? key;
  return t.replaceAll('{name}', rivaleName(pid, nr));
}

/** Englisches Wörterbuch (alle Texte für alle Rivalen). */
export function rivaleWoerterbuch() {
  const out = { ...RIVALE_UI };
  for (const r of Object.values(RIVALEN)) {
    for (const name of [r.name, r.name2]) for (const [de, en] of Object.values(RIVALE_TEXTE)) out[de.replaceAll('{name}', name)] = en.replaceAll('{name}', name);
  }
  out['Siege: {0}, Niederlagen: {1}'] = 'Wins: {0}, defeats: {1}';
  out['Sequenz {0}'] = 'Sequence {0}';
  out['Chance: {0} %'] = 'Chance: {0} %';
  out['Ab {0} Siegen'] = 'From {0} wins';
  out['+{0} Schilling'] = '+{0} shillings';
  return out;
}

/** In buildContent nach applyBeyonderRest: Gegner je Pfad und Sequenz mit Pfad-Fertigkeiten und Rest. */
export function applyRivale(content) {
  for (const pid of Object.keys(RIVALEN)) {
    if (!content.pathways?.[pid]) continue;
    for (const [k, [vorlage, f]] of Object.entries(BASIS)) for (const nr of [1, 2]) {
      const seq = Number(k);
      const base = content.encounters[vorlage];
      if (!base || !content.pathways[pid].seqs?.[seq]) continue;
      const id = rivaleEncId(pid, seq, nr);
      const dm = Math.sqrt(f);
      const scale = (list) => list?.map((a) => (a.damage ? { ...a, damage: Math.round(a.damage * dm) } : { ...a }));
      const rest = { ...base };
      for (const key of WEG) delete rest[key];
      const { phase2 } = base;
      content.encounters[id] = {
        ...rest,
        name: rivaleText('gegner', pid, nr),
        sheet: seq <= 4 && content.pathways[pid] ? `hg_battle_${pid}` : rest.sheet,
        hp: Math.round(base.hp * f),
        attacks: scale(base.attacks),
        ...(phase2 ? { phase2: { ...phase2, attacks: scale(phase2.attacks) } } : {}),
        elite: true,
        fleeable: true,
        rivale: pid,
        rivale_nr: nr,
        lose_money: 0.08,
        intro: rivaleText('intro', pid, nr),
        win_text: rivaleText('sieg', pid, nr),
        lose_text: rivaleText('niederlage', pid, nr),
        flee_text: rivaleText('flucht', pid, nr),
      };
      content.loot[id] = { repeat: true, money: content.loot[vorlage]?.money ?? [20, 40], drops: [] };
      machBeyonder(content, id, pid, seq);
      if (content.items[restId(pid, seq)]) content.loot[id].drops.push({ item: restId(pid, seq), chance: RIVALE_REGELN.rest });
    }
  }
  return content;
}
