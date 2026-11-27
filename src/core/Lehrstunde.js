// Pflicht-Kampftraining mit Sergeant Holt am Spielanfang (Seb 2026-11-27).
// Der Übungskampf `holt_training` führt Schritt für Schritt durch Angriff, Ausweichen, Parieren,
// Fertigkeiten und Gegenstände. Holt fällt erst, wenn alle Schritte geschafft sind, und der Spieler fällt nie.
// Zu zweit müssen beim Angreifen und Ausweichen beide Spieler einmal ran.

export const TRAINING_ENC = 'holt_training';
export const TRAINING_FLAG = 'training_done'; // Übungskampf gewonnen
export const TRAINING_NACH_FLAG = 'training_nach'; // Nachbesprechung (Geistsicht, Notizbuch, Verdauung) gehört

/** Parieren ist schwer: nach so vielen Angriffen in diesem Schritt geht es auch ohne geglückte Parade weiter. */
export const PARRY_TRIES = 3;

// each: jeder Spieler muss es einmal schaffen (Koop), sonst reicht einer
export const LEHR_SCHRITTE = [
  {
    id: 'angriff', need: 'attack', each: true, title: 'Angriff',
    text: 'Wähle „Angriff“. Ein Zeiger läuft über die Leiste: Drücke E oder Leertaste, wenn er im goldenen Bereich steht, im roten Kern trifft es meisterhaft. Jeder Angriff gibt dir Konzentration (die Punkte unten) und ein paar Nerven zurück.',
    duo: 'Spieler 2 bestätigt mit Enter (Gamepad A). Beide greifen einmal an.',
  },
  {
    id: 'ausweichen', need: 'dodge', each: true, title: 'Ausweichen',
    text: 'Holt holt aus: Ein Ring zieht sich um dich zusammen. Drücke die Leertaste, wenn der Ring dich erreicht. Ausweichen klappt fast immer, kostet aber Nerven. Sind die Nerven leer, kannst du nicht mehr ausweichen.',
    duo: 'Spieler 2 weicht mit ← aus (Gamepad X). Holt greift euch abwechselnd an.',
  },
  {
    id: 'parieren', need: 'parry', title: 'Parieren',
    text: 'Jetzt parieren: F genau im Moment des Einschlags. Das Fenster ist eng, aber eine Parade kostet nichts. Sie gibt Nerven und Konzentration zurück und trifft sofort. Wer alle Schläge eines Angriffs pariert, setzt zum Gegenschlag an.',
    duo: 'Spieler 2 pariert mit → (Gamepad B).',
  },
  {
    id: 'fertigkeit', need: 'skill', title: 'Fertigkeiten',
    text: 'Unter „Fertigkeiten“ liegen stärkere Schläge. Sie kosten Konzentration, manche auch Nerven. Mit 2 Konzentration geht der Doppelschlag: zwei Takte hintereinander. Später kommen die Fertigkeiten deines Pfades dazu.',
  },
  {
    id: 'gegenstand', need: 'item', title: 'Gegenstände',
    text: 'Holt hat dir einen Verband zugeworfen. Unter „Gegenstände“ kannst du einmal pro Zug etwas benutzen, ohne dass dein Zug endet: Verbände heilen, Tonika beruhigen die Nerven, Bannsalz brennt Okkultes.',
  },
  {
    id: 'frei', need: null, title: 'Jetzt ernst',
    text: '„Fliehen“ bringt dich aus fast jedem Kampf. Vor Eliten und Bossen musst du danach noch Runden durchhalten. Heute nicht: Leg Holt auf die Matte!',
  },
];

export class Lehrstunde {
  /** players: die Nummern der Kämpfer, z. B. [1] oder [1, 2]. */
  constructor(players = [1]) {
    this.players = players.map(Number);
    this.got = {}; // need -> Set der Spieler, die es geschafft haben
    this.parryTries = 0; // Angriffe, die Holt im Parier-Schritt geführt hat
  }

  get index() {
    const i = LEHR_SCHRITTE.findIndex((s) => s.need && !this.met(s));
    return i < 0 ? LEHR_SCHRITTE.length - 1 : i;
  }

  get step() {
    return LEHR_SCHRITTE[this.index];
  }

  /** Alle Schritte geschafft: Holt darf fallen. */
  get done() {
    return this.step.need === null;
  }

  met(s) {
    const got = this.got[s.need];
    if (s.need === 'parry' && this.parryTries >= PARRY_TRIES) return true;
    if (!got) return false;
    return s.each ? this.players.every((n) => got.has(n)) : got.size > 0;
  }

  /** Meldet eine Handlung ('attack', 'dodge', 'parry', 'skill', 'item', 'enemyTurn'). Liefert true, wenn ein Schritt fertig wurde. */
  note(kind, n = 1) {
    const before = this.index;
    if (kind === 'enemyTurn') {
      if (this.step.need === 'parry') this.parryTries += 1;
    } else (this.got[kind] ??= new Set()).add(Number(n));
    return this.index !== before;
  }

  /** Für die Anzeige: Titel, Text und „Schritt x/y“. */
  view(duo = false) {
    const s = this.step;
    const total = LEHR_SCHRITTE.length;
    const open = s.each && duo ? this.players.filter((n) => !this.got[s.need]?.has(n)) : [];
    return {
      id: s.id,
      title: `Übung ${this.index + 1}/${total}: ${s.title}`,
      text: s.text,
      duo: duo && s.duo ? s.duo : '',
      open: open.length && open.length < this.players.length ? `Noch dran: Spieler ${open.join(' und ')}` : '',
    };
  }
}

/** Welcher Holt-Dialogknoten startet von selbst? null, wenn nichts ansteht. */
export function trainingNode(state) {
  if (state.testmodus || !state.flags) return null;
  if (state.flags.has(TRAINING_FLAG)) return state.flags.has(TRAINING_NACH_FLAG) ? null : 'training_nach';
  // Nur ganz am Anfang (auch alte Spielstände, die noch vor Marlowe stehen)
  if (state.map !== 'revier' || state.quests?.arrival !== 'active' || state.flags.has('briefed_01')) return null;
  return 'training_start';
}

/** Schnellstarts (URL-Parameter, Testmodus) überspringen das Training. */
export function skipTraining(state) {
  state.flags.add(TRAINING_FLAG);
  state.flags.add(TRAINING_NACH_FLAG);
}
