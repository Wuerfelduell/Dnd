// Seq-5-Rituale (Seb, 2026-11-12): Jeder Pfad legt vor dem Trank der Sequenz 5 eine eigene Prüfung ab, die zu ihm passt.
// Keine festen Orte, keine Fälle; was man im Kampf zeigen muss, zählt in Runden, Wartezeiten in echten Sekunden.
// Misslingt eine Prüfung, kostet das Verdauung (10 bis 20 Punkte) und Unruhe; wiederholen darf man immer.
//
// Die zehn Prüfungen (`ritual.trial` an der Sequenz 5 in pathways.json / neue_pfade.json):
// - laterne:    zehn Laternen in einem Monstergebiet entzünden (je ein Lampenöl), die Laternenbestie (so stark wie man selbst)
//               erscheint und muss mit einer Leuchtfähigkeit (holy) als Todesstoß fallen.
// - faden:      zehn lila Spinnfäden sammeln (okkulte Wesen tragen sie, solange man sucht), sich einwickeln (Kokon:
//               man läuft wie überladen), unter 20 % Leben und Nerven die Spinne aus dem Kokon locken und besiegen.
// - maske:      einen Beyonder besiegen und sein Gesicht nehmen; dann zwei andere Beyonder im Gespräch überzeugen (je zwei
//               Fragen zum Steckbrief). Eine falsche Antwort: −20 % und dauerhaftes Misstrauen bei allen Angesprochenen.
// - echo:       einen Beyonder unter 10 % Leben bringen, verschonen und „Stimme rauben“ (Kampfmenü); die Zutaten gehen dabei drauf.
// - kessel:     einen eigenen Sud erfinden (core/Sude.js), trinken, und das Ritual samt Trank vollziehen, solange die Wirkung hält.
// - eisen:      fünf Gegner in höchstens zwölf Runden zusammen, nie über 40 % Leben, keinerlei Heilung.
// - schluessel: mit Schillingbonus am Leib (Kleidung oder Artefakt) in einem einzigen Kampf 50 Schilling stehlen und gewinnen.
// - waage:      mit 3000 Schilling beginnen, auf einer Runde eines geheimen Treffens genau drei Lose kaufen und drei Dinge verkaufen.
// - moor:       einem Bürger im Gespräch eine Erinnerung nehmen (ins leere Gefäß), aber nie die seiner Herkunft; dazu teure Zutaten.
// - uhr:        eine Uhr dabei; einen Gegner in höchstens drei Runden, 20 Sekunden warten, noch einen, 20 Sekunden warten, trinken.
//
// Der Stand jeder Prüfung liegt am Pfad (state.pathway.seq5), also je Spieler, und verschwindet mit dem nächsten Trank.
import { SPINNENFADEN, GEFAESS_ERINNERUNG, UHR_ITEM } from '../data/seq5.js';
import { LEERES_GEFAESS } from '../data/sude.js';
import { seeded } from './Gatherings.js';

export const FAIL_PCT = { laterne: 10, faden: 10, maske: 20, echo: 10, kessel: 15, eisen: 15, schluessel: 10, waage: 10, moor: 15, uhr: 15 };
export const FAIL_UNRUHE = 10;
export const LATERNEN = 10;
export const LAMPENOEL = 'lampenoel';
export const KOKON_FAEDEN = 10;
export const KOKON_PCT = 0.2;
export const MASKE_PRUEFUNGEN = 2; // so viele Beyonder müssen überzeugt werden (Seb: zwei statt drei)
export const MASKE_FRAGEN = 2;
export const MISSTRAUEN = -3;
export const ECHO_PCT = 0.1;
export const SUD_MIN_SEC = 10;
export const EISEN = { wins: 5, rounds: 12, hp: 0.4 };
export const DIEBSTAHL = 50;
export const HANDEL = { money: 3000, n: 3 };
export const UHR = { rounds: 3, waitMs: 20000 };
export const UHREN = ['taschenuhr', UHR_ITEM, 'sq_fristpendel'];
export const TRIAL_NAMES = { laterne: 'Die Laternenbestie', faden: 'Der violette Kokon', maske: 'Die gestohlene Identität', echo: 'Die geraubte Stimme', kessel: 'Die eigene Schöpfung', eisen: 'Die Kampfprüfung', schluessel: 'Der große Diebstahl', waage: 'Das Gleichgewicht des Handels', moor: 'Der Namenlose', uhr: 'Der Rhythmus der Zeit' };

/** Beyonder unter den Figuren: Zirkelmitglieder, Einzelgänger und ein paar Bekannte vom Nachtmarkt. */
export const BEYONDER_NPCS = new Set(['sabeth', 'kittering', 'nell', 'schleierbote']);
/** Beyonder unter den Gegnern: okkulte Menschen (Sektenhände und -häupter, Einzelgänger, die Bosse der Fälle). */
export function isBeyonderFoe(id, enc) {
  if (!enc || enc.practice || enc.mirror) return false;
  if (enc.beyonder !== undefined) return !!enc.beyonder;
  return !!enc.occult && ((enc.sprite ?? '').startsWith('npc:') || /^enemy_sk_.*_(hand|haupt)$/.test(id));
}

const CITY_NAMES = { kettlegate: 'Kettlegate', wexmoor: 'Wexmoor', dunscar: 'Dunscar', calderwick: 'Calderwick', briarholt: 'Briarholt', varrowmouth: 'Varrowmouth' };
const MARKS = ['eine Narbe über der linken Braue', 'ein Ring aus schwarzem Eisen', 'ein Hinken auf dem rechten Bein', 'ein Taschentuch mit rotem Saum', 'eine Uhrkette ohne Uhr', 'ein Geruch nach Kampfer', 'ein fehlender kleiner Finger', 'ein Monokel mit gesprungenem Glas', 'ein Hut, der nie abgenommen wird', 'eine Stimme wie nasses Papier'];
const MASKE_FRAGEN_TEXT = {
  pathway: (n) => `„Welchen Pfad gehst du, ${n}? Sag es laut, damit ich es glaube.“`,
  city: (n) => `„Aus welcher Stadt bist du zu uns gekommen, ${n}?“`,
  mark: (n) => `„Woran erkennt man ${n}, wenn das Gesicht im Nebel steht?“`,
};
/** Erinnerungen der Bürger: die der Herkunft darf man nicht nehmen (Grundsatz des Moores), alle anderen schon. */
const HERKUNFT = ['der Name meiner Mutter und das Haus, in dem ich geboren bin', 'die Straße, in der ich aufgewachsen bin, und der Geruch des Hofes', 'das Dorf, aus dem meine Leute kamen, bevor sie in die Stadt zogen', 'der Tag, an dem mein Vater mir meinen Namen erklärt hat', 'das Lied, das man bei uns zu Hause am Herd sang'];
const ANDERE = ['ein Streit um zwölf Pence, der mir seit Jahren nachgeht', 'der Winter, in dem der Kanal zufror und wir darauf liefen', 'das Gesicht eines Fremden, der mir einmal den Weg zeigte', 'ein Versprechen, das ich nicht gehalten habe', 'die Melodie aus einem Wirtshaus, dessen Namen ich vergessen habe', 'der Geschmack von Honig aus einem Glas, das mir nicht gehörte', 'eine Beerdigung, bei der ich an der falschen Stelle stand', 'ein Brief, den ich nie abgeschickt habe', 'die Farbe eines Kleides auf einem Fest vor zwanzig Jahren', 'ein Hund, der mir drei Tage lang folgte'];

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export const seq5Methods = {
  // --- Nachschlagen ------------------------------------------------------------------------------
  /** Das Ritual mit Prüfung, das als Nächstes ansteht (oder null, wenn keines oder schon vollzogen). */
  seq5Ritual(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    const r = this.ritualDef(pid, seq);
    return r?.trial && !this.ritualDone(pid, seq) ? r : null;
  },

  seq5Kind() {
    return this.seq5Ritual()?.trial ?? null;
  },

  /** Stand der Prüfung des Spielers, dessen Werte gerade gelten (liegt am Pfad, also je Spieler). */
  seq5() {
    if (!this.pathway) return {};
    return (this.pathway.seq5 ??= {});
  },

  seq5Name(kind = this.seq5Kind()) {
    return TRIAL_NAMES[kind] ?? 'Die Prüfung';
  },

  /** Wer unter den Figuren ein Beyonder ist (für Maske und Moor). */
  isBeyonderNpc(id) {
    if (!id || !this.content.npcs?.[id]) return false;
    if (BEYONDER_NPCS.has(id) || this.loner?.(id)) return true;
    return Object.values(this.content.gatherings?.circles ?? {}).some((c) => (c.members ?? []).some((m) => m.id === id));
  },

  isBeyonderFoe(id) {
    return isBeyonderFoe(id, this.content.encounters[id]);
  },

  /** Sind die Zutaten des anstehenden Rituals da (für Echo, wo sie beim Rauben draufgehen)? */
  ritualConsumesReady(r = this.seq5Ritual()) {
    return !!r && Object.entries(r.consumes ?? {}).every(([id, n]) => this.itemCount(id) >= n);
  },

  /** Ist die Prüfung bestanden? */
  seq5IsDone(kind = this.seq5Kind(), now = Date.now()) {
    const st = this.seq5();
    switch (kind) {
      case 'maske': return (st.convinced?.length ?? 0) >= MASKE_PRUEFUNGEN;
      case 'kessel': return !!this.activeSudBuff?.();
      case 'moor': return true; // das Gefäß mit der Erinnerung ist eine Zutat
      case 'uhr': return st.phase === 'wait2' && now - (st.t ?? 0) >= UHR.waitMs;
      case null: return true;
      default: return !!st.done;
    }
  },

  /** Schritte der Prüfung für das Ritualfenster: [{ text, done }]. */
  seq5Steps(r = this.seq5Ritual(), now = Date.now()) {
    if (!r?.trial) return [];
    const st = this.seq5();
    const k = r.trial;
    const sec = (ms) => Math.ceil(ms / 1000);
    if (k === 'laterne') return [{ text: `Zehn Laternen in einem Monstergebiet entzündet (${Math.min(LATERNEN, st.lanterns ?? 0)}/${LATERNEN}, je ein Lampenöl)`, done: !!st.done || (st.lanterns ?? 0) >= LATERNEN }, { text: 'Die Laternenbestie mit einer Leuchtfähigkeit als Todesstoß besiegt', done: !!st.done }];
    if (k === 'faden') return [{ text: `In den Kokon aus zehn lila Spinnfäden gewickelt (${Math.min(KOKON_FAEDEN, this.itemCount(SPINNENFADEN))}/${KOKON_FAEDEN} dabei)`, done: !!st.kokon || !!st.done }, { text: 'Eingewickelt, unter 20 % Leben und Nerven, eine Spinne besiegt', done: !!st.done }];
    if (k === 'maske') return [{ text: st.identity ? `Gesicht genommen: ${st.identity.name}` : 'Einen Beyonder besiegt und sein Gesicht genommen', done: !!st.identity || this.seq5IsDone(k) }, { text: `${MASKE_PRUEFUNGEN} andere Beyonder überzeugt, diese Person zu sein (${Math.min(MASKE_PRUEFUNGEN, st.convinced?.length ?? 0)}/${MASKE_PRUEFUNGEN})`, done: this.seq5IsDone(k) }];
    if (k === 'echo') return [{ text: st.done ? `Stimme geraubt: ${st.voiceOf}` : 'Einen Beyonder unter 10 % Leben gebracht, verschont und seine Stimme geraubt (Kampfmenü)', done: !!st.done }];
    if (k === 'kessel') {
      const buff = this.activeSudBuff?.();
      return [{ text: 'Einen eigenen Sud erfunden (am Braukessel ohne Formel, bis zu drei Zutaten ins leere Gefäß)', done: (this.sudeBekannt?.length ?? 0) > 0 }, { text: buff ? `Die Wirkung deines Suds hält noch ${buff.remainingText}` : `Einen Sud mit Wirkung (mindestens ${SUD_MIN_SEC} s) getrunken, dessen Wirkung gerade anhält`, done: !!buff }];
    }
    if (k === 'eisen') return [{ text: st.active ? `Kampfprüfung läuft: ${st.wins}/${EISEN.wins} Siege, ${st.rounds}/${EISEN.rounds} Runden, höchstens ${EISEN.hp * 100} % Leben, keine Heilung` : `Kampfprüfung: ${EISEN.wins} Siege in höchstens ${EISEN.rounds} Runden zusammen, nie über ${EISEN.hp * 100} % Leben, keine Heilung`, done: !!st.done }];
    if (k === 'schluessel') return [{ text: 'Kleidung oder Artefakt mit Schillingbonus am Leib', done: !!st.done || this.moneyBonusFromGear() > 1 }, { text: st.armed ? `Der Diebstahl ist angesetzt: im nächsten Kampf ${DIEBSTAHL} Schilling stehlen und gewinnen` : `In einem einzigen Kampf ${DIEBSTAHL} Schilling gestohlen und gewonnen`, done: !!st.done }];
    if (k === 'waage') return [{ text: `${HANDEL.money} Schilling beim Beginn der Handelsprobe`, done: !!st.armed || !!st.done || this.money >= HANDEL.money }, { text: st.armed ? `Handelsprobe läuft: ${st.bought.length}/${HANDEL.n} gekauft, ${st.sold.length}/${HANDEL.n} verkauft, nichts doppelt` : `Auf einer Runde eines geheimen Treffens genau ${HANDEL.n} Lose gekauft und ${HANDEL.n} andere Dinge verkauft`, done: !!st.done }];
    if (k === 'moor') return [{ text: 'Einem Bürger im Gespräch eine Erinnerung genommen (leeres Gefäß dabei, nicht die seiner Herkunft)', done: this.itemCount(GEFAESS_ERINNERUNG) > 0 }];
    if (k === 'uhr') {
      const wait = st.phase === 'wait1' || st.phase === 'wait2' ? Math.max(0, UHR.waitMs - (now - (st.t ?? 0))) : 0;
      const status = !st.armed ? `Zeitprüfung: zwei Gegner in je höchstens ${UHR.rounds} Runden, dazwischen und danach je ${sec(UHR.waitMs)} Sekunden warten`
        : st.phase === 'fight1' ? `Zeitprüfung läuft: ersten Gegner in höchstens ${UHR.rounds} Runden besiegen`
          : st.phase === 'wait1' ? (wait ? `Warten: noch ${sec(wait)} s, dann den zweiten Gegner in höchstens ${UHR.rounds} Runden` : `Jetzt den zweiten Gegner in höchstens ${UHR.rounds} Runden besiegen`)
            : st.phase === 'fight2' ? `Zweiten Gegner in höchstens ${UHR.rounds} Runden besiegen`
              : wait ? `Warten: noch ${sec(wait)} s, dann Ritual und Trank` : 'Beide Siege sitzen, die Frist ist um';
      return [{ text: 'Eine Uhr in der Tasche', done: this.hasWatch() }, { text: status, done: this.seq5IsDone(k, now) }];
    }
    return [];
  },

  /** Hinweis fürs Ritualfenster, was zu tun ist (Kurzfassung der Regel). */
  seq5Hint(kind = this.seq5Kind()) {
    return {
      laterne: 'Geh in ein Monstergebiet und entzünde dort zehn Laternen (Pfad-Tab, je ein Lampenöl). Die Bestie ist so stark wie du; ihr letzter Treffer muss eine Leuchtfähigkeit sein.',
      faden: 'Lila Spinnenfäden tragen okkulte Wesen in sich, solange du den Kokon suchst (und Fadenspinnen immer). Eingewickelt läufst du wie überladen. Lass dich unter 20 % Leben und Nerven fallen, dann lock die Spinne.',
      maske: 'Beyonder unter den Gegnern: Sektenhände und -häupter, Einzelgänger, die Köpfe der Fälle. Beyonder unter den Figuren: Zirkelmitglieder, Einzelgänger, Sabeth, Kittering, Nell. Im Gespräch: „Als … auftreten“. Zwei Fragen je Gespräch, eine falsche Antwort und alle Angesprochenen misstrauen dir für immer.',
      echo: 'Beyonder unter den Gegnern: Sektenhände und -häupter, Einzelgänger, die Köpfe der Fälle. Bring einen unter 10 % Leben, dann steht „Stimme rauben“ im Kampfmenü. Die Zutaten gehen in dem Moment drauf.',
      kessel: 'Am Braukessel (ohne Formel): bis zu drei Zutaten und ein leeres Gefäß. Trink deinen Sud und vollzieh Ritual und Trank, solange die Wirkung läuft. Läuft sie vorher ab, ist das Ritual verfallen.',
      eisen: 'Beginne die Prüfung erst unter 40 % Leben. Dann fünf Siege in zusammen zwölf Runden, ohne Verband, Tonikum, Heilfertigkeit oder Trank. Verlieren oder fliehen heißt scheitern.',
      schluessel: 'Trag etwas mit Schillingbonus (Maskenballhut, Knochenwürfel, Wachshand, Pfandmarke, Spiegelmünze …). Setz den Diebstahl an; im nächsten Kampf gegen Menschen mit Börsenschnitt oder Griff in die Tasche 50 Schilling nehmen und gewinnen.',
      waage: 'Beginne die Handelsprobe mit 3000 Schilling. Auf der nächsten Runde eines Treffens: genau drei Lose ersteigern, genau drei Dinge verkaufen (Gesuche erfüllen, eigene Lose), nichts kaufen, was du verkaufst. Ein viertes Geschäft oder die Runde ohne drei und drei: gescheitert.',
      moor: 'Sprich einen Bürger (keinen Beyonder) mit leerem Gefäß in der Tasche an: „Eine Erinnerung nehmen …“. Er bietet drei an. Nimm nie die seiner Herkunft. Dazu Atemglas, Spindelknochen, zwei Geisteressenzen und Grabmoos.',
      uhr: 'Eine Uhr in der Tasche (die gravierte aus dem Fall, eine einfache von Crane, Maud Keel oder der Trödlerin, das Fristpendel). Prüfung beginnen, einen Gegner in höchstens drei Runden, 20 Sekunden warten, noch einen, 20 Sekunden warten, dann Ritual und Trank.',
    }[kind] ?? '';
  },

  // --- Erfolg und Fehlschlag ----------------------------------------------------------------------
  seq5Fail(kind, text) {
    const p = this.pathway;
    const pct = FAIL_PCT[kind] ?? 10;
    const st = this.seq5();
    for (const key of Object.keys(st)) if (key !== 'identity' || kind === 'maske') delete st[key];
    if (p) {
      const before = p.digestion;
      p.digestion = Math.max(0, p.digestion - pct);
      this.emit('digest', { value: p.digestion, delta: p.digestion - before, kind: 'seq5_fail', player: this.acting ?? 1 });
      this.setUnruhe(this.unruhe + FAIL_UNRUHE);
    }
    const full = `${this.seq5Name(kind)}: misslungen. ${text} (−${pct} % Verdauung, +${FAIL_UNRUHE} Unruhe. Du kannst es noch einmal versuchen.)`;
    this.emit('seq5', { kind, passed: false, player: this.acting ?? 1, text: full });
    this.emit('notice', full);
    this.emit('changed');
    return { ok: true, passed: false, text: full };
  },

  seq5Pass(kind, text, { paid = false } = {}) {
    const st = this.seq5();
    st.done = true;
    if (paid) st.paid = true;
    const full = `${this.seq5Name(kind)}: bestanden. ${text} Das Ritual kann vollzogen werden (Pfad-Tab).`;
    this.emit('seq5', { kind, passed: true, player: this.acting ?? 1, text: full });
    this.emit('notice', full);
    this.emit('changed');
    return { ok: true, passed: true, text: full };
  },

  /** Laufende Prüfung abbrechen: umsonst, solange nichts geschehen ist, sonst ein Fehlschlag. */
  seq5Cancel() {
    const k = this.seq5Kind();
    const st = this.seq5();
    if (!k || st.done) return { ok: false, text: 'Da läuft nichts, was man abbrechen könnte.' };
    const begun = { laterne: (st.lanterns ?? 0) > 0, faden: !!st.kokon, eisen: st.active && (st.wins > 0 || st.rounds > 0), schluessel: false, waage: st.armed && (st.bought.length || st.sold.length), uhr: st.armed && st.phase !== 'fight1', maske: !!st.identity }[k];
    const armed = { laterne: (st.lanterns ?? 0) > 0, faden: !!st.kokon, eisen: !!st.active, schluessel: !!st.armed, waage: !!st.armed, uhr: !!st.armed, maske: !!st.identity }[k];
    if (!armed) return { ok: false, text: 'Die Prüfung hat noch nicht begonnen.' };
    if (begun) return this.seq5Fail(k, 'Du brichst ab.');
    for (const key of Object.keys(st)) delete st[key];
    this.emit('changed');
    return { ok: true, passed: undefined, text: 'Abgebrochen, ohne Folgen.' };
  },

  // --- Laterne ---------------------------------------------------------------------------------------
  inLanternZone() {
    return !!this.content.zones?.[this.map];
  },

  lightLantern() {
    if (this.seq5Kind() !== 'laterne') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq5();
    if (st.done) return { ok: false, text: 'Die Bestie ist schon besiegt.' };
    if (!this.inLanternZone()) return { ok: false, text: 'Laternen für die Bestie entzündet man nur in einem Monstergebiet.' };
    if (!this.itemCount(LAMPENOEL)) return { ok: false, text: 'Dafür brauchst du Lampenöl (Crane, Maud Keel).' };
    if (st.lanternMap && st.lanternMap !== this.map) { st.lanterns = 0; }
    st.lanternMap = this.map;
    this.removeItem(LAMPENOEL);
    st.lanterns = (st.lanterns ?? 0) + 1;
    this.emit('changed');
    if (st.lanterns >= LATERNEN) {
      this.startCombat('laternenbestie');
      return { ok: true, fight: 'laternenbestie', text: 'Die zehnte Laterne brennt. Das Licht zwischen ihnen wird dick wie Honig, und etwas richtet sich darin auf, das deine Haltung hat. Die Laternenbestie. Nur ein Leuchten darf sie beenden.' };
    }
    return { ok: true, text: `Laterne ${st.lanterns} von ${LATERNEN} brennt.${st.lanterns === LATERNEN - 1 ? ' Noch eine, dann kommt sie.' : ''}` };
  },

  // --- Faden -----------------------------------------------------------------------------------------
  cocoonActive() {
    return !!this.pathway?.seq5?.kokon;
  },

  cocoonReady() {
    return this.cocoonActive() && this.hp <= this.maxHp * KOKON_PCT && this.composure <= this.maxComposure() * KOKON_PCT;
  },

  wrapCocoon() {
    if (this.seq5Kind() !== 'faden') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq5();
    if (st.kokon) return { ok: false, text: 'Du steckst schon im Kokon.' };
    if (this.itemCount(SPINNENFADEN) < KOKON_FAEDEN) return { ok: false, text: `Dafür brauchst du ${KOKON_FAEDEN} lila Spinnfäden (${this.itemCount(SPINNENFADEN)} dabei).` };
    this.removeItem(SPINNENFADEN, KOKON_FAEDEN);
    st.kokon = true;
    this.emit('changed');
    return { ok: true, text: `Du wickelst die Fäden um Arme, Brust und Beine, bis sie dich halten wie ein zweiter Körper. Jeder Schritt wird schwer. Lass Leben und Nerven unter ${KOKON_PCT * 100} % fallen, dann lock die Spinne (Pfad-Tab).` };
  },

  lureSpider() {
    if (this.seq5Kind() !== 'faden' || !this.cocoonActive()) return { ok: false, text: 'Erst in den Kokon.' };
    if (!this.cocoonReady()) return { ok: false, text: `Die Spinne kommt erst, wenn Leben und Nerven unter ${KOKON_PCT * 100} % liegen (${Math.round(this.hp / this.maxHp * 100)} % Leben, ${Math.round(this.composure / this.maxComposure() * 100)} % Nerven).` };
    this.startCombat('kokonspinne');
    return { ok: true, fight: 'kokonspinne', text: 'Du zupfst am Garn. Irgendwo im Kokon antwortet es. Acht Beine, ein glühendes Auge.' };
  },

  // --- Maske -----------------------------------------------------------------------------------------
  maskeIdentity() {
    return this.pathway?.seq5?.identity ?? null;
  },

  /** Nach einem Sieg über einen Beyonder (aus Combat.finish): das Gesicht nehmen. */
  seq5TakeIdentity(encId) {
    const enc = this.content.encounters[encId];
    const st = this.seq5();
    const rng = seeded(`${encId}|${this.pathway?.id}`);
    const paths = Object.keys(this.content.pathways);
    const pathway = enc.pathway && this.content.pathways[enc.pathway] ? enc.pathway : paths[Math.floor(rng() * paths.length)];
    const city = this.content.maps[this.map]?.city ?? 'kettlegate';
    st.identity = { name: enc.name, enc: encId, pathway, city, mark: MARKS[Math.floor(rng() * MARKS.length)] };
    st.convinced = [];
    st.asked = [];
    this.emit('changed');
    return `Du beugst dich über ${enc.name} und nimmst, was die Maske nehmen kann: die Züge, den Gang, den Namen. Steckbrief im Pfad-Tab: ${this.content.pathways[pathway].name}, aus ${CITY_NAMES[city] ?? city}, ${st.identity.mark}. Überzeuge ${MASKE_PRUEFUNGEN} andere Beyonder, dass du diese Person bist.`;
  },

  identityText() {
    const id = this.maskeIdentity();
    if (!id) return '';
    return `${id.name}: ${this.content.pathways[id.pathway]?.name ?? id.pathway}, aus ${CITY_NAMES[id.city] ?? id.city}, ${id.mark}.`;
  },

  canImpersonate(npcId) {
    if (this.seq5Kind() !== 'maske' || !this.maskeIdentity() || this.seq5IsDone('maske')) return false;
    const st = this.seq5();
    return this.isBeyonderNpc(npcId) && !(st.asked ?? []).includes(npcId) && !this.flags.has(`misstrauen_${npcId}`);
  },

  /** Beginnt die Gesprächsprüfung bei einer Figur: zwei Fragen zum Steckbrief. */
  startImpersonation(npcId, rng = seeded(`${npcId}|${this.maskeIdentity()?.enc}`)) {
    if (!this.canImpersonate(npcId)) return { ok: false, text: 'Hier gibt es niemanden zu überzeugen.' };
    const id = this.maskeIdentity();
    const name = id.name;
    const paths = Object.keys(this.content.pathways);
    const q = {
      pathway: { prompt: MASKE_FRAGEN_TEXT.pathway(name), answer: this.content.pathways[id.pathway].name, options: shuffle([id.pathway, ...shuffle(paths.filter((p) => p !== id.pathway), rng).slice(0, 2)], rng).map((p) => this.content.pathways[p].name) },
      city: { prompt: MASKE_FRAGEN_TEXT.city(name), answer: CITY_NAMES[id.city] ?? id.city, options: shuffle([id.city, ...shuffle(Object.keys(CITY_NAMES).filter((c) => c !== id.city), rng).slice(0, 2)], rng).map((c) => CITY_NAMES[c]) },
      mark: { prompt: MASKE_FRAGEN_TEXT.mark(name), answer: id.mark, options: shuffle([id.mark, ...shuffle(MARKS.filter((m) => m !== id.mark), rng).slice(0, 2)], rng) },
    };
    const rounds = shuffle(Object.values(q), rng).slice(0, MASKE_FRAGEN);
    this.maskeQuiz = { npc: npcId, step: 0, rounds };
    return { ok: true, quiz: this.maskeQuiz };
  },

  answerImpersonation(i) {
    const quiz = this.maskeQuiz;
    if (!quiz) return { ok: false };
    const round = quiz.rounds[quiz.step];
    const picked = round?.options[i];
    if (picked === undefined) return { ok: false };
    const st = this.seq5();
    const npc = this.content.npcs[quiz.npc]?.name ?? quiz.npc;
    if (picked !== round.answer) {
      this.maskeQuiz = null;
      const asked = [...new Set([...(st.asked ?? []), quiz.npc])];
      for (const id of asked) { this.flags.add(`misstrauen_${id}`); this.changeRelation(id, MISSTRAUEN, 'Enttarnt'); }
      st.identity = null;
      const r = this.seq5Fail('maske', `${npc} sieht dich lange an. „Nein. Das bist du nicht.“ Das Gesicht fällt von dir ab. ${asked.length === 1 ? 'Diese Figur' : 'Diese Figuren'} misstraut dir von nun an: ${asked.map((id) => this.content.npcs[id]?.name ?? id).join(', ')}.`);
      return { ...r, wrong: round.answer };
    }
    quiz.step += 1;
    if (quiz.step < quiz.rounds.length) return { ok: true, next: quiz.rounds[quiz.step] };
    this.maskeQuiz = null;
    st.asked = [...new Set([...(st.asked ?? []), quiz.npc])];
    st.convinced = [...new Set([...(st.convinced ?? []), quiz.npc])];
    this.act('dialogue');
    if (this.seq5IsDone('maske')) return this.seq5Pass('maske', `${npc} nickt. Du bist, wer du vorgibst zu sein, zumindest für ${MASKE_PRUEFUNGEN} Beyonder.`);
    this.emit('changed');
    return { ok: true, passed: true, text: `${npc} nickt langsam. Noch ${MASKE_PRUEFUNGEN - st.convinced.length} ${MASKE_PRUEFUNGEN - st.convinced.length === 1 ? 'Beyonder' : 'Beyonder'} fehlt.` };
  },

  /** Gespräch abgebrochen: nach der ersten Antwort zählt das als Enttarnung. */
  cancelImpersonation() {
    const quiz = this.maskeQuiz;
    if (!quiz) return { ok: false };
    this.maskeQuiz = null;
    if (quiz.step === 0) return { ok: true };
    const st = this.seq5();
    const asked = [...new Set([...(st.asked ?? []), quiz.npc])];
    for (const id of asked) { this.flags.add(`misstrauen_${id}`); this.changeRelation(id, MISSTRAUEN, 'Enttarnt'); }
    st.identity = null;
    return this.seq5Fail('maske', `Du verstummst mitten im Satz. ${this.content.npcs[quiz.npc]?.name ?? quiz.npc} hat genug gesehen. Misstrauen von nun an: ${asked.map((id) => this.content.npcs[id]?.name ?? id).join(', ')}.`);
  },

  // --- Echo ------------------------------------------------------------------------------------------
  seq5VoicePending() {
    return this.seq5Kind() === 'echo' && !this.seq5().done;
  },

  /** Aus Combat.stealVoice: Zutaten gehen drauf, der Beyonder behält sein Leben und verliert die Stimme. */
  seq5StealVoice(encId) {
    const r = this.seq5Ritual();
    if (!r || r.trial !== 'echo') return null;
    for (const [id, n] of Object.entries(r.consumes ?? {})) this.removeItem(id, n);
    this.flags.add(`stimmlos_${encId}`);
    const st = this.seq5();
    st.voiceOf = this.content.encounters[encId]?.name ?? encId;
    return this.seq5Pass('echo', `Du legst ${st.voiceOf} die Hand auf die Kehle und ziehst. Was herauskommt, ist dünn und kalt und gehört jetzt dir. ${st.voiceOf} lebt, wird aber nie wieder sprechen.`, { paid: true }).text;
  },

  // --- Eisen -----------------------------------------------------------------------------------------
  startEisen() {
    if (this.seq5Kind() !== 'eisen') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq5();
    if (st.done) return { ok: false, text: 'Die Kampfprüfung ist bestanden.' };
    if (st.active) return { ok: false, text: 'Die Kampfprüfung läuft schon.' };
    if (this.hp > this.maxHp * EISEN.hp) return { ok: false, text: `Erst unter ${EISEN.hp * 100} % Leben (gerade ${Math.round(this.hp / this.maxHp * 100)} %). Wer sich an Schmerz gewöhnt hat, kann ihn tragen.` };
    st.active = true;
    st.wins = 0;
    st.rounds = 0;
    this.emit('changed');
    return { ok: true, text: `Die Kampfprüfung läuft: ${EISEN.wins} Siege in zusammen höchstens ${EISEN.rounds} Runden. Kein Verband, kein Tonikum, keine Heilfertigkeit, nie über ${EISEN.hp * 100} % Leben.` };
  },

  /** Aus GameState.heal: jede Heilung bricht die Kampfprüfung. */
  seq5Heal(n) {
    if (n <= 0 || this.seq5Kind() !== 'eisen' || !this.seq5().active) return;
    this.seq5Fail('eisen', 'Du hast dich geheilt. Das Eisen verzeiht das nicht.');
  },

  // --- Schlüssel -------------------------------------------------------------------------------------
  /** Schillingbonus nur aus Kleidung und Artefakten am Leib (nicht aus Sequenzen oder Suden). */
  moneyBonusFromGear() {
    let v = 1;
    for (const list of [...this.artifactEffects(), ...this.gearEffects()]) for (const p of list) if (p.key === 'money_bonus') v *= p.value;
    return v;
  },

  startDiebstahl() {
    if (this.seq5Kind() !== 'schluessel') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq5();
    if (st.done) return { ok: false, text: 'Der Diebstahl ist gelungen.' };
    if (st.armed) return { ok: false, text: 'Der Diebstahl ist schon angesetzt. Such dir einen Gegner mit Börse.' };
    if (this.moneyBonusFromGear() <= 1) return { ok: false, text: 'Dafür musst du etwas mit Schillingbonus tragen: den Maskenballhut, ein Artefakt wie Knochenwürfel, Wachshand oder Spiegelmünze.' };
    st.armed = true;
    this.emit('changed');
    return { ok: true, text: `Angesetzt. Im nächsten Kampf: mindestens ${DIEBSTAHL} Schilling stehlen (Griff in die Tasche, Börsenschnitt) und gewinnen. Gegen Wesen ohne Taschen gibt es nichts zu holen.` };
  },

  // --- Waage -----------------------------------------------------------------------------------------
  startHandel() {
    if (this.seq5Kind() !== 'waage') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq5();
    if (st.done) return { ok: false, text: 'Die Handelsprobe ist bestanden.' };
    if (st.armed) return { ok: false, text: 'Die Handelsprobe läuft schon.' };
    if (this.money < HANDEL.money) return { ok: false, text: `Dafür brauchst du ${HANDEL.money} Schilling (${this.money} dabei).` };
    st.armed = true;
    st.bought = [];
    st.sold = [];
    this.emit('changed');
    return { ok: true, text: `Die Handelsprobe läuft. Auf der nächsten Runde eines Treffens: genau ${HANDEL.n} Lose kaufen, genau ${HANDEL.n} andere Dinge verkaufen. Nichts doppelt, kein viertes Geschäft.` };
  },

  /** Aus Auction.js: ein Los ersteigert ('buy') oder etwas abgegeben ('sell'). */
  seq5Trade(kind, item) {
    const st = this.seq5();
    if (this.seq5Kind() !== 'waage' || !st.armed || st.done) return;
    const list = kind === 'buy' ? st.bought : st.sold;
    list.push(item);
    const other = kind === 'buy' ? st.sold : st.bought;
    if (list.length > HANDEL.n) { this.seq5Fail('waage', `Ein ${kind === 'buy' ? 'viertes Los' : 'viertes Geschäft'}. Die Waage kippt.`); return; }
    if (other.includes(item)) { this.seq5Fail('waage', `${this.item(item)?.name ?? item} gekauft und verkauft. Das ist kein Gleichgewicht, das ist ein Kreis.`); return; }
    this.emit('changed');
  },

  /** Aus Auction.endSession: die Runde ist vorbei, jetzt wird gewogen. */
  seq5SessionEnd() {
    const st = this.seq5();
    if (this.seq5Kind() !== 'waage' || !st.armed || st.done) return;
    if (st.bought.length === HANDEL.n && st.sold.length === HANDEL.n) this.seq5Pass('waage', `Drei genommen, drei gegeben, nichts doppelt. Die Waage steht still.`);
    else this.seq5Fail('waage', `Die Runde ist vorbei mit ${st.bought.length} Käufen und ${st.sold.length} Verkäufen statt je ${HANDEL.n}.`);
  },

  // --- Moor ------------------------------------------------------------------------------------------
  canTakeMemory(npcId) {
    if (this.seq5Kind() !== 'moor' || !npcId || !this.content.npcs?.[npcId]) return false;
    if (this.isBeyonderNpc(npcId) || this.flags.has(`erinnerung_${npcId}`)) return false;
    return this.itemCount(GEFAESS_ERINNERUNG) === 0;
  },

  /** Drei Erinnerungen, die der Bürger hergeben könnte; eine ist die seiner Herkunft. */
  moorMemories(npcId) {
    const rng = seeded(`moor|${npcId}`);
    const origin = HERKUNFT[Math.floor(rng() * HERKUNFT.length)];
    const others = shuffle(ANDERE, rng).slice(0, 2);
    return shuffle([{ text: origin, herkunft: true }, ...others.map((text) => ({ text, herkunft: false }))], rng);
  },

  takeMemory(npcId, i) {
    if (!this.canTakeMemory(npcId)) return { ok: false, text: 'Hier gibt es nichts zu nehmen.' };
    if (!this.itemCount(LEERES_GEFAESS)) return { ok: false, text: 'Du brauchst ein leeres Gefäß, um die Erinnerung aufzufangen.' };
    const opt = this.moorMemories(npcId)[i];
    if (!opt) return { ok: false };
    const npc = this.content.npcs[npcId].name;
    this.removeItem(LEERES_GEFAESS);
    this.flags.add(`erinnerung_${npcId}`);
    if (opt.herkunft) {
      return this.seq5Fail('moor', `Du greifst nach dem, woher ${npc} kommt. Das Glas springt in deiner Hand. Das Moor bewahrt die Herkunft, auch wenn der Name fehlt. ${npc} behält sie, und du einen Schnitt im Daumen.`);
    }
    this.addItem(GEFAESS_ERINNERUNG);
    this.changeRelation(npcId, -1, 'Erinnerung genommen');
    this.act('hidden_clue');
    this.emit('changed');
    return { ok: true, passed: true, text: `${npc} redet, und während ${npc} redet, wird das Glas in deiner Hand beschlagen. „${opt.text[0].toUpperCase()}${opt.text.slice(1)} … wovon habe ich gerade gesprochen?“ Die Erinnerung ist im Gefäß. ${npc} wird sie nie vermissen.` };
  },

  // --- Uhr -------------------------------------------------------------------------------------------
  hasWatch() {
    return UHREN.some((id) => this.itemCount(id) > 0);
  },

  startUhr() {
    if (this.seq5Kind() !== 'uhr') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq5();
    if (st.armed) return { ok: false, text: 'Die Zeitprüfung läuft schon.' };
    if (!this.hasWatch()) return { ok: false, text: 'Dafür brauchst du eine Uhr in der Tasche.' };
    st.armed = true;
    st.phase = 'fight1';
    this.emit('changed');
    return { ok: true, text: `Die Zeitprüfung läuft. Ersten Gegner in höchstens ${UHR.rounds} Runden, ${UHR.waitMs / 1000} Sekunden warten, zweiten in höchstens ${UHR.rounds} Runden, ${UHR.waitMs / 1000} Sekunden warten, dann Ritual und Trank.` };
  },

  // --- Kampf-Haken (aus Combat.js) ---------------------------------------------------------------------
  /** Beim Kampfbeginn: die Uhr verlangt die Pause zwischen den Siegen. */
  seq5CombatStart(combat, now = Date.now()) {
    const k = this.seq5Kind();
    const st = this.seq5();
    if (combat.enc.practice) return;
    if (k === 'uhr' && st.armed && st.phase === 'wait1') {
      if (now - st.t < UHR.waitMs) this.seq5Fail('uhr', `Zu früh: nur ${Math.floor((now - st.t) / 1000)} Sekunden Pause statt ${UHR.waitMs / 1000}.`);
      else st.phase = 'fight2';
    }
  },

  /** Nach dem Kampf (aus Combat.finish): wertet die laufende Prüfung aus. Gibt Text für die Siegmeldung oder null. */
  seq5CombatEnd(combat, now = Date.now()) {
    const k = this.seq5Kind();
    if (!k || combat.enc.practice) return null;
    const st = this.seq5();
    const won = combat.outcome === 'won';
    const id = combat.id;
    if (k === 'laterne' && id === 'laternenbestie') {
      if (won && combat.killedBy?.holy) return this.seq5Pass('laterne', 'Der letzte Schlag war Licht.').text;
      return this.seq5Fail('laterne', won ? 'Die Bestie fiel, aber nicht durch ein Leuchten. Das zählt nicht.' : 'Die Bestie steht noch.').text;
    }
    if (k === 'faden' && id === 'kokonspinne') {
      if (won && st.kokon) { delete st.kokon; return this.seq5Pass('faden', 'Eingewickelt, halb tot, und die Spinne liegt.').text; }
      return this.seq5Fail('faden', 'Die Spinne lebt, der Kokon ist zerrissen.').text;
    }
    if (k === 'maske' && won && !st.identity && this.isBeyonderFoe(id)) return this.seq5TakeIdentity(id);
    if (k === 'echo' && this.isBeyonderFoe(id) && combat.voiceWindow && combat.outcome !== 'spared' && !st.done) {
      return this.seq5Fail('echo', won ? `${combat.enc.name} lag unter 10 % Leben, und du hast nicht verschont. Eine Stimme raubt man nur Lebenden.` : 'Die Gelegenheit war da und ist vorbei.').text;
    }
    if (k === 'eisen' && st.active) {
      st.rounds += combat.round;
      if (!won) return this.seq5Fail('eisen', combat.outcome === 'lost' ? 'Du bist gefallen.' : 'Du bist gewichen.').text;
      st.wins += 1;
      if (st.rounds > EISEN.rounds) return this.seq5Fail('eisen', `${st.rounds} Runden, erlaubt waren ${EISEN.rounds}.`).text;
      if (this.hp > this.maxHp * EISEN.hp) return this.seq5Fail('eisen', `Über ${EISEN.hp * 100} % Leben.`).text;
      if (st.wins >= EISEN.wins) return this.seq5Pass('eisen', `${EISEN.wins} Siege in ${st.rounds} Runden, verwundet und ungeheilt.`).text;
      this.emit('changed');
      return `Kampfprüfung: ${st.wins}/${EISEN.wins} Siege, ${st.rounds}/${EISEN.rounds} Runden.`;
    }
    if (k === 'schluessel' && st.armed) {
      if (won && combat.stolen >= DIEBSTAHL && this.moneyBonusFromGear() > 1) return this.seq5Pass('schluessel', `${combat.stolen} Schilling aus fremder Tasche, und der Kampf gewonnen. Sie bleiben bei dir.`).text;
      return this.seq5Fail('schluessel', !won ? 'Der Kampf ging verloren.' : this.moneyBonusFromGear() <= 1 ? 'Nichts mit Schillingbonus am Leib.' : `Nur ${combat.stolen} Schilling gestohlen statt ${DIEBSTAHL}.`).text;
    }
    if (k === 'uhr' && st.armed && (st.phase === 'fight1' || st.phase === 'fight2')) {
      if (!won) return this.seq5Fail('uhr', 'Kein Sieg, kein Takt.').text;
      if (combat.round > UHR.rounds) return this.seq5Fail('uhr', `${combat.round} Runden, erlaubt waren ${UHR.rounds}.`).text;
      st.t = now;
      if (st.phase === 'fight1') { st.phase = 'wait1'; this.emit('changed'); return `Erster Takt sitzt (${combat.round} ${combat.round === 1 ? 'Runde' : 'Runden'}). Jetzt ${UHR.waitMs / 1000} Sekunden warten, dann der zweite Gegner.`; }
      st.phase = 'wait2';
      this.emit('changed');
      return `Zweiter Takt sitzt. Noch ${UHR.waitMs / 1000} Sekunden warten, dann Ritual und Trank.`;
    }
    return null;
  },

  /** Aus Combat.rollLoot: wer den Kokon sucht, findet lila Fäden in okkulten Wesen. */
  seq5ExtraLoot(combat, loot, rng = combat.rng) {
    if (this.seq5Kind() !== 'faden' || this.seq5().kokon || this.seq5().done) return;
    if (!combat.enc.occult || combat.enc.practice) return;
    if (rng() < 0.4) loot.items[SPINNENFADEN] = (loot.items[SPINNENFADEN] ?? 0) + 1;
  },

  // --- Trinken und Tick --------------------------------------------------------------------------------
  /** Warum der Trank der Sequenz 5 gerade nicht geht (Kessel: Wirkung muss laufen; Uhr: Frist). Sonst null. */
  seq5DrinkBlock(pid, seq, now = Date.now()) {
    const r = this.ritualDef(pid, seq);
    if (!r?.trial) return null;
    if (r.trial === 'kessel' && !this.activeSudBuff?.()) return 'Die Wirkung deines eigenen Suds muss anhalten, während du trinkst.';
    if (r.trial === 'uhr') {
      const st = this.seq5();
      if (st.phase === 'wait2' && now - (st.t ?? 0) < UHR.waitMs) return `Noch ${Math.ceil((UHR.waitMs - (now - st.t)) / 1000)} Sekunden warten.`;
    }
    return null;
  },

  /** Aus tick(): das vollzogene Kessel-Ritual verfällt, wenn die Wirkung des Suds vor dem Trank abläuft. */
  seq5Tick() {
    const p = this.pathway;
    if (!p) return;
    const seq = p.seq - 1;
    const r = this.ritualDef(p.id, seq);
    if (r?.trial !== 'kessel' || !this.ritualDone(p.id, seq)) return;
    const st = this.seq5();
    if (!st.armed) return;
    if (this.activeSudBuff?.()) return;
    this.flags.delete(this.ritualFlag(p.id, seq));
    this.seq5Fail('kessel', 'Die Wirkung deines Suds ist verflogen, bevor du getrunken hast. Das Ritual ist verfallen.');
  },
};
