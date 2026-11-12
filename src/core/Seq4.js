// Seq-4-Rituale (Seb, 2026-11-12): Jeder Pfad legt vor dem Trank der Sequenz 4 (Halbgott) eine schwere Prüfung ab.
// Alle zehn enden mit dem Schwellenwächter des Pfades, alle sind solo (Spieler 2 schaut zu), keine ist an einen Ort gebunden.
// Fehlschlag: −17 % Verdauung und Unruhe (Seb: einheitlich 17 %, „sonst tut's zu sehr weh“), beliebig wiederholbar.
//
// Die Prüfungen (`ritual.hg` an der Sequenz 4, data/seq4.js):
// - laterne:    sechs Laternen in einem Monstergebiet (je ein Lampenöl), Echtzeit ohne Kampfbildschirm (core/Laternenwacht.js):
//               fünfzehn Wesen, die nur das Licht tötet; am Ende der Wächter, der nur im „Sonnenaufgang“ zwischen drei Flammen fällt.
// - faden:      fünf verschiedene Wesen aus fünf verschiedenen Gebieten im Kampf mit Schicksalsfäden markieren (bleibt über Kapitel),
//               schlafen: Traumkampf gegen alle fünf zugleich (verstärkt), als letzter Gegner der Wächter; im Traum keine Heilung.
// - maske:      Zivilistengestalt annehmen (keine Artefakte), einen Beyonder der Sequenz 5 oder höher nur mit dem einfachen Angriff
//               besiegen und verschonen (er zweifelt danach dauerhaft); gleich danach der Wächter, ebenfalls ohne Fähigkeiten.
// - echo:       taub: drei Kämpfe und der Wächter ohne Ringe und ohne Warnklang; Heilung und Fähigkeiten erlaubt.
// - kessel:     fünf Ritual-Essenzen brauen (erst ab voll verdauter 5 mit der Formel der 4) und nacheinander trinken; dann der Wächter,
//               Schaden nur aus Flaschen (Wurfflaschen, Gifte, Sude), kein Angriff, keine offensiven Fähigkeiten.
// - eisen:      fünf Artefakte, Last ≥ 200 % der Tragkraft, Hut/Mantel/Amulett abgelegt: der Wächter erscheint am Standort.
//               Nie ausweichen; die ersten fünf Runden fällt er nicht, erst ab Runde 6. Die Bedingungen müssen bis zum Ende halten.
// - schluessel: Schattensteuerung: der Körper bleibt stehen, man führt den Schatten (40 % Leben, keine Heilung, keine Parade, keine
//               Gegenstände; Schattenattacke plus jede Runde eine zufällige eigene Fähigkeit); zwei Gegner, dann der Wächter.
// - waage:      allen Besitz ablegen (bleibt sicher verwahrt), mit selbst gewähltem Kapital in einen Zirkel und jedes Los der Runde
//               kaufen; nach dem letzten Kauf der Wächter, nur mit dem Gekauften. Der Zirkel bleibt, wie er ist.
// - moor:       fünf okkulte oder seltene Dinge mit Moorkraft zersetzen, daraus das Relikt des Verfalls (zufällige Eigenschaften der fünf);
//               den Wächter mit dem Relikt besiegen, jede Runde eine Flasche Moorwasser (echt verbraucht).
// - uhr:        drei Monster, jedes greift mindestens einmal an, nur perfekte Ausweichmanöver, kein Fehler; beim Wächter höchstens
//               drei verfehlte Ausweichmanöver, Parieren verboten.
//
// Der Stand liegt am Pfad (state.pathway.seq4, je Spieler) und verschwindet mit dem Trank; die Fäden bleiben bis dahin über Kapitel hinweg.
import { ordealId } from './Pathways.js';
import { isBeyonderFoe } from './Seq5.js';
import { encounterSeq } from './Fear.js';
import { HG_NAMES, HG_SUDE, MOORWASSER, RELIKT } from '../data/seq4.js';
import { LEERES_GEFAESS } from '../data/sude.js';
import { seeded } from './Gatherings.js';

export const HG_FAIL_PCT = 17;
export const HG_FAIL_UNRUHE = 10;
export const HG_LATERNEN = 6;
export const HG_FAEDEN = 5;
export const TRAUM_ID = 'hg_traumgeflecht';
export const TRAUM_BOOST = { hp: 0.55, dmg: 1.35 }; // Traumgeflecht: Summe der Leben × hp, Schlag × dmg
export const MASKE_SPARE_PCT = 0.15;
export const MASKE_MIN_SEQ = 6; // Beyonder dieser geschätzten Stufe oder stärker; schwächere als 5 kämpfen in der Prüfung auf Stufe 5
export const ECHO_FIGHTS = 3;
export const EISEN = { artifacts: 5, load: 2, slots: ['hut', 'mantel', 'amulett'], killRound: 6 };
export const SCHATTEN = { hp: 0.4, fights: 2, mult: 0.8 };
export const SCHATTEN_ATTACKE = { name: 'Schattenattacke', cost: 0, hits: 1, mult: SCHATTEN.mult, shadow: true, desc: 'Ein Hieb aus Dunkelheit. Immer verfügbar, kostet keine Nerven, etwa vier Fünftel deiner gewohnten Wucht.' };
export const MOOR = { items: 5 };
export const UHR = { monsters: 3, guardianMisses: 3 };
export const PERFECT_DODGE = 45; // ± ms um den Einschlag: perfektes Ausweichen (Ritual der Uhr)
export const ESSENZ_BONUS = 0.1; // je getrunkener Essenz +10 % Flaschenschaden im Kampf gegen den Wächter des Kessels

const HINTS = {
  laterne: 'In einem Monstergebiet sechs Laternen aufstellen (je ein Lampenöl). Fünfzehn Wesen greifen die schwächste Laterne an, nur Licht verletzt sie. R halten (1,5 s) füllt eine Laterne nach und kostet Nerven; dein eigenes Leuchten versengt Wesen in der Nähe und zehrt ebenfalls an den Nerven. Treffer unterbrechen das Nachfüllen. Der Wächter fällt nur durch den Sonnenaufgang (F), wenn er zwischen drei brennenden Laternen steht. Alle Laternen aus, oder du fällst: gescheitert.',
  faden: 'Im Kampf „Schicksalsfaden“ wählen: fünf verschiedene Wesen (Monster oder Beyonder) aus fünf verschiedenen Gebieten. Die Fäden halten, auch wenn du weiterreist. Dann in einem Bett oder einer Koje schlafen: Im Traum stehen alle fünf zugleich vor dir, verstärkt, danach der Wächter. Im Traum heilt nichts.',
  maske: 'Lege alle Artefakte ab und nimm die Gestalt eines Zivilisten an. Dann einen Beyonder der Sequenz 5 oder höher stellen (Sektenhände und -häupter, Einzelgänger von Dunscar): nur der einfache Angriff, Tränke sind erlaubt. Unter 15 % Leben „Verschonen“. Töten, verlieren oder eine Fähigkeit benutzen heißt scheitern. Gleich danach kommt der Wächter, auch er nur mit dem einfachen Angriff.',
  echo: 'Taub werden. Drei Kämpfe in Folge gewinnen und danach den Wächter, alles ohne Angriffskreise und ohne Warnklang. Ausweichen und Parieren gehen, nur siehst du nicht, wann. Verlieren oder fliehen heißt scheitern.',
  kessel: 'Die fünf Essenzen erscheinen erst, wenn Sequenz 5 voll verdaut ist und die Formel der Sequenz 4 in deinem Gepäck liegt. Brau sie (je ein leeres Gefäß), trink sie nacheinander. Nach der fünften kommt der Wächter: Schaden nur aus Flaschen (Wurfflaschen, Gifte, Krötenbitter; vorbereitete Tränke sind erlaubt), kein Angriff, keine offensive Fähigkeit. Heilen und Schützen darfst du.',
  eisen: 'Fünf Artefakte im Gepäck, mindestens doppelte Last und kein Hut, kein Mantel, kein Amulett angelegt. Sobald alles zugleich stimmt, tritt der Wächter an, wo du stehst. Nie ausweichen; parieren und heilen geht. Die ersten fünf Runden fällt er nicht, erst ab Runde 6. Bricht eine Bedingung vor Kampfende, ist es gescheitert.',
  schluessel: 'In einem Monstergebiet den Schatten lösen: Dein Körper bleibt stehen, du führst den Schatten. Er hat 40 % deines Lebens, heilt nicht, pariert nicht, trägt nichts. Er schlägt mit der Schattenattacke und jede Runde mit einer zufälligen deiner Fähigkeiten. Zwei Gegner, dann der Wächter. Stirbt der Schatten, scheitert das Ritual, du nicht.',
  waage: 'Leg alles ab (Inventar und Kleidung kommen in sichere Verwahrung) und wähl dein Kapital. Dann auf der nächsten Runde eines Zirkels jedes Los kaufen, das angeboten wird. Ein ausgelassenes Los oder eine leere Börse heißt scheitern. Nach dem letzten Kauf kommt der Wächter, und du hast nur, was du gekauft hast. Die Formel der 4 kann 4000 Schilling kosten: Schätz deinen Bedarf selbst.',
  moor: 'Fünf okkulte oder seltene Dinge (Artefakte, okkulte Trophäen und Zutaten, Seltenes) mit Moorkraft zersetzen. Aus den Resten formt sich das Relikt des Verfalls mit Eigenschaften der fünf. Dann den Wächter rufen und mit dem Relikt im Gepäck besiegen. Jede Runde trinkst du eine Flasche Moorwasser (fällt in den Mooren um Wexmoor); ist keine mehr da, ist es gescheitert.',
  uhr: 'Drei Monster besiegen, jedes muss mindestens einmal angreifen. Jeden Schlag perfekt ausweichen (der Moment, in dem der Ring einrastet); ein gewöhnliches Ausweichen, eine Parade oder ein Treffer ist ein Fehler, und bei den Monstern ist kein Fehler erlaubt. Danach der Wächter: höchstens drei Fehler, der vierte heißt scheitern, Parieren verboten.',
};

/** Kreaturen für den Schicksalsfaden: Monster der Gebiete, okkulte Wesen und Beyonder. */
function markable(id, enc) {
  if (!enc || enc.practice || enc.mirror || id === TRAUM_ID || /^hg_(schwellen|grenz)waechter_/.test(id)) return false;
  return !!(enc.zone || enc.occult || isBeyonderFoe(id, enc));
}

export const seq4Methods = {
  // --- Nachschlagen -------------------------------------------------------------------------------
  seq4Ritual(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    const r = this.ritualDef(pid, seq);
    return r?.hg && !this.ritualDone(pid, seq) ? r : null;
  },

  seq4Kind() {
    return this.seq4Ritual()?.hg ?? null;
  },

  seq4() {
    if (!this.pathway) return {};
    return (this.pathway.seq4 ??= {});
  },

  seq4Name(kind = this.seq4Kind()) {
    return HG_NAMES[kind] ?? 'Die Prüfung';
  },

  seq4Hint(kind = this.seq4Kind()) {
    return HINTS[kind] ?? '';
  },

  /** Merker: die Prüfung samt Wächter ist bestanden (je Spieler). */
  hgFlag(pid = this.pathway?.id) {
    return `${this.acting === 2 ? 'p2_' : ''}hg_bestanden_${pid}`;
  },

  hgPassed(pid = this.pathway?.id) {
    return this.flags.has(this.hgFlag(pid));
  },

  hgGuardianId() {
    return ordealId(this.pathway?.id, 4);
  },

  /** Läuft gerade etwas, das man abbrechen könnte? */
  seq4Running() {
    const st = this.seq4();
    return !!(st.active || st.masked || st.shadow || st.stash || st.guardian || st.siege || st.dream);
  },

  // --- Schritte fürs Ritualfenster ----------------------------------------------------------------
  seq4Steps(r = this.seq4Ritual()) {
    if (!r?.hg) return [];
    const st = this.seq4();
    const k = r.hg;
    const done = this.hgPassed();
    const g = { text: `${this.content.encounters[this.hgGuardianId()]?.name ?? 'Schwellenwächter'} unter den Regeln der Prüfung besiegt`, done };
    const s = (text, ok) => ({ text, done: done || !!ok });
    if (k === 'laterne') return [s(`Sechs Laternen in einem Monstergebiet aufgestellt (je ein Lampenöl, ${this.itemCount('lampenoel')} dabei)`, st.siege), s('Fünfzehn Wesen nur mit Licht vertrieben', st.siegeKills >= 15), g];
    if (k === 'faden') {
      const marks = st.marks ?? [];
      return [s(`Schicksalsfäden an fünf Wesen aus fünf Gebieten (${Math.min(HG_FAEDEN, marks.length)}/${HG_FAEDEN}${marks.length ? `: ${marks.map((m) => m.name).join(', ')}` : ''})`, marks.length >= HG_FAEDEN), s('Geschlafen und den Traum gegen alle fünf überstanden', st.dreamWon), g];
    }
    if (k === 'maske') return [s('Zivilistengestalt angenommen, keine Artefakte dabei', st.masked), s(st.spared ? `${st.spared} verschont` : 'Einen Beyonder der Sequenz 5 oder höher nur mit dem einfachen Angriff besiegt und verschont', st.spared), g];
    if (k === 'echo') return [s(st.active ? `Taub: ${st.wins ?? 0}/${ECHO_FIGHTS} Kämpfe ohne Ringe und Warnklang gewonnen` : `Taub ${ECHO_FIGHTS} Kämpfe ohne Ringe und Warnklang gewonnen`, (st.wins ?? 0) >= ECHO_FIGHTS), g];
    if (k === 'kessel') {
      const open = this.hgRecipesUnlocked();
      return [s(open ? 'Die fünf Essenzen sind offenbart' : 'Sequenz 5 voll verdaut und die Formel der Sequenz 4 im Gepäck', open), s(`Fünf Essenzen gebraut und nacheinander getrunken (${(st.drunk ?? []).length}/5)`, (st.drunk ?? []).length >= 5), g];
    }
    if (k === 'eisen') {
      const c = this.eisenConditions();
      return [s(`${EISEN.artifacts} Artefakte dabei (${c.artifacts})`, c.artifacts >= EISEN.artifacts || st.guardian), s(`Last mindestens ${EISEN.load * 100} % der Tragkraft (${Math.round(c.load * 100)} %)`, c.load >= EISEN.load || st.guardian), s('Hut, Mantel und Amulett abgelegt', c.bare || st.guardian), g];
    }
    if (k === 'schluessel') return [s(st.shadow ? `Der Schatten läuft: ${st.wins ?? 0}/${SCHATTEN.fights} Gegner, ${st.shadowHp}/${st.shadowMax} Leben` : `Mit dem Schatten ${SCHATTEN.fights} Gegner besiegt`, (st.wins ?? 0) >= SCHATTEN.fights), g];
    if (k === 'waage') return [s(st.stash ? `Besitz verwahrt, Kapital ${st.capital} Schilling` : 'Allen Besitz abgelegt und Kapital gewählt', st.stash), s(st.bought ? `Jedes Los einer Zirkelrunde gekauft (${st.bought})` : 'Jedes Los einer Zirkelrunde gekauft', st.allBought), g];
    if (k === 'moor') return [s(`${MOOR.items} okkulte oder seltene Dinge mit Moorkraft zersetzt (${(st.decayed ?? []).length}/${MOOR.items})`, (st.decayed ?? []).length >= MOOR.items), s('Das Relikt des Verfalls geformt', this.pathway?.relikt), s(`Moorwasser für den Kampf (${this.itemCount(MOORWASSER)} Flaschen)`, this.itemCount(MOORWASSER) >= 8), g];
    if (k === 'uhr') return [s(st.active ? `Zeitprüfung: ${st.count ?? 0}/${UHR.monsters} Monster ohne Fehler` : `${UHR.monsters} Monster, nur perfekt ausgewichen, kein Fehler`, (st.count ?? 0) >= UHR.monsters), g];
    return [];
  },

  // --- Erfolg und Fehlschlag ----------------------------------------------------------------------
  seq4Fail(kind, text) {
    const p = this.pathway;
    const st = this.seq4();
    this.seq4Cleanup(st);
    const keep = { marks: st.marks }; // Fäden bleiben
    for (const key of Object.keys(st)) delete st[key];
    if (kind === 'faden' && keep.marks) st.marks = keep.marks;
    if (p) {
      const before = p.digestion;
      p.digestion = Math.max(0, p.digestion - HG_FAIL_PCT);
      this.emit('digest', { value: p.digestion, delta: p.digestion - before, kind: 'seq4_fail', player: this.acting ?? 1 });
      this.setUnruhe(this.unruhe + HG_FAIL_UNRUHE);
    }
    const full = `${this.seq4Name(kind)}: gescheitert. ${text} (−${HG_FAIL_PCT} % Verdauung, +${HG_FAIL_UNRUHE} Unruhe. Du kannst es noch einmal versuchen.)`;
    this.emit('seq4', { kind, passed: false, player: this.acting ?? 1, text: full });
    this.emit('notice', full);
    this.emit('changed');
    return { ok: true, passed: false, text: full };
  },

  seq4Pass(kind, text) {
    const st = this.seq4();
    this.seq4Cleanup(st);
    for (const key of Object.keys(st)) delete st[key];
    st.done = true;
    this.flags.add(this.hgFlag());
    this.flags.add(`${this.acting === 2 ? 'p2_' : ''}${`won_${this.hgGuardianId()}`}`);
    const full = `${this.seq4Name(kind)}: bestanden. ${text} Der Wächter ist gefallen. Das Ritual kann vollzogen werden (Pfad-Tab).`;
    this.emit('seq4', { kind, passed: true, player: this.acting ?? 1, text: full });
    this.emit('notice', full);
    this.emit('changed');
    return { ok: true, passed: true, text: full };
  },

  /** Was nach jeder Prüfung zurück muss: verwahrter Besitz (Waage). */
  seq4Cleanup(st = this.seq4()) {
    if (st.stash) this.waageRestore(st);
  },

  /** Laufende Prüfung abbrechen: vor dem ersten echten Schritt umsonst, sonst ein Fehlschlag. */
  seq4Cancel() {
    const k = this.seq4Kind();
    const st = this.seq4();
    if (!k || !this.seq4Running()) return { ok: false, text: 'Da läuft nichts, was man abbrechen könnte.' };
    const begun = { echo: (st.wins ?? 0) > 0, maske: false, schluessel: (st.wins ?? 0) > 0 || st.shadowHp < st.shadowMax, waage: !!st.inSession, uhr: (st.count ?? 0) > 0, laterne: !!st.siege }[k];
    if (begun || st.guardian) return this.seq4Fail(k, 'Du brichst ab.');
    this.seq4Cleanup(st);
    const marks = st.marks;
    for (const key of Object.keys(st)) delete st[key];
    if (marks) st.marks = marks;
    this.emit('changed');
    return { ok: true, passed: undefined, text: 'Abgebrochen, ohne Folgen.' };
  },

  /** Ruft den Schwellenwächter des Pfades (unter den Regeln der laufenden Prüfung). */
  seq4Summon(text) {
    const st = this.seq4();
    const id = this.hgGuardianId();
    if (!this.content.encounters[id]) return text;
    st.guardian = true;
    this.startCombat(id);
    this.emit('changed');
    return `${text}\n\nDann wird es still. Aus dem Nebel tritt ${this.content.encounters[id].name}.`;
  },

  // --- Regeln für den Kampf (Combat.js liest sie beim Kampfbeginn) ---------------------------------
  /** Regeln der laufenden Prüfung für diesen Kampf oder null. */
  seq4CombatRules(id, enc) {
    const k = this.seq4Kind();
    if (!k || !enc || enc.practice) return null;
    const st = this.seq4();
    const g = id === this.hgGuardianId() && !!st.guardian;
    if (k === 'faden') {
      if (id === TRAUM_ID || (g && st.dream)) return { solo: true, noHeal: true, dream: true };
      if (!st.dreamWon && (st.marks ?? []).length < HG_FAEDEN && markable(id, enc)) return { mark: true };
      return null;
    }
    if (k === 'maske' && st.masked && (g || this.maskeTarget(id))) return { solo: true, onlyAttack: true, spare: !g, scale: g ? null : this.maskeScale(id) };
    if (k === 'echo' && st.active) return { solo: true, deaf: true };
    if (k === 'kessel' && g) return { solo: true, potionOnly: true, itemMult: 1 + ESSENZ_BONUS * (st.drunk?.length ?? 0) };
    if (k === 'eisen' && g) return { solo: true, noDodge: true, minKillRound: EISEN.killRound };
    if (k === 'schluessel' && st.shadow) return { solo: true, shadow: true, noHeal: true, noParry: true, noItems: true, shadowHp: st.shadowHp, shadowMax: st.shadowMax };
    if (k === 'waage' && g) return { solo: true };
    if (k === 'moor' && g) return { solo: true, moorwater: true };
    if (k === 'uhr' && st.active) return { solo: true, uhr: g ? 'guardian' : 'monster', noParry: true };
    return null;
  },

  /** Darf in einem Kampf mit diesen Regeln gerade geheilt werden? (GameState.heal fragt) */
  healBlocked() {
    return !!this.combatRules?.noHeal;
  },

  /** Nach dem Kampf (aus Combat.finish): wertet die Prüfung aus. Gibt Text für die Siegmeldung oder null. */
  seq4CombatEnd(combat) {
    const k = this.seq4Kind();
    const rules = combat.rules;
    if (!k || combat.enc.practice) return null;
    const st = this.seq4();
    const won = combat.outcome === 'won';
    const id = combat.id;
    const g = id === this.hgGuardianId() && !!st.guardian;
    const broken = combat.ruleBroken;
    if (k === 'faden' && rules?.dream) {
      if (id === TRAUM_ID) {
        if (!won) return this.seq4Fail('faden', combat.outcome === 'lost' ? 'Die fünf Fäden ziehen sich zu, und du wachst schweißnass auf.' : 'Du reißt dich aus dem Traum. Die Fäden sind schlaff.').text;
        st.dreamWon = true;
        return this.seq4Summon('Die fünf Gestalten lösen sich in Garn auf. Der Traum aber endet nicht.');
      }
      if (g) return won ? this.seq4Pass('faden', 'Du erwachst mit Garn zwischen den Fingern.').text : this.seq4Fail('faden', 'Der Wächter zerschneidet das Netz, und du wachst auf.').text;
    }
    if (k === 'maske' && rules) {
      if (broken) return this.seq4Fail('maske', broken).text;
      if (!g) {
        if (combat.outcome === 'spared') {
          st.spared = combat.enc.name;
          this.flags.add(`zweifel_${id}`);
          return this.seq4Summon(`${combat.enc.name} starrt auf die eigenen Hände. Ein Mensch ohne Pfad hat das getan. Dieser Zweifel bleibt.`);
        }
        if (won) return this.seq4Fail('maske', `${combat.enc.name} ist tot. Die Maske verlangte Gnade.`).text;
        if (combat.outcome === 'lost') return this.seq4Fail('maske', 'Ein gewöhnlicher Mensch verliert gegen einen Beyonder. Diesmal du.').text;
        return null; // geflohen: kein Schaden, keine Wertung
      }
      return won ? this.seq4Pass('maske', 'Ohne eine einzige Gabe.').text : this.seq4Fail('maske', 'Der Wächter sieht durch das Gesicht hindurch.').text;
    }
    if (k === 'echo' && rules?.deaf) {
      if (!won) return this.seq4Fail('echo', combat.outcome === 'lost' ? 'Die Stille hat dich gefällt.' : 'Du bist der Stille ausgewichen. Das zählt nicht.').text;
      if (g) return this.seq4Pass('echo', 'In der Stille hast du den Schlag gesehen, bevor er kam.').text;
      st.wins = (st.wins ?? 0) + 1;
      if (st.wins >= ECHO_FIGHTS) return this.seq4Summon(`${ECHO_FIGHTS} Kämpfe in völliger Stille.`);
      this.emit('changed');
      return `Die Welt ohne Klang: ${st.wins}/${ECHO_FIGHTS} Kämpfe.`;
    }
    if (k === 'kessel' && g) {
      if (broken) return this.seq4Fail('kessel', broken).text;
      return won ? this.seq4Pass('kessel', 'Kein Schlag, nur Glas, Gift und Feuer.').text : this.seq4Fail('kessel', 'Die Flaschen sind leer, der Wächter steht.').text;
    }
    if (k === 'eisen' && g) {
      if (!won) return this.seq4Fail('eisen', combat.outcome === 'lost' ? 'Die Last hat dich niedergedrückt.' : 'Du bist gewichen. Das Eisen verzeiht das nicht.').text;
      if (broken) return this.seq4Fail('eisen', broken).text;
      const c = this.eisenConditions();
      if (!c.ok) return this.seq4Fail('eisen', 'Die Last war am Ende nicht mehr dieselbe.').text;
      return this.seq4Pass('eisen', 'Unter doppelter Last, ohne zu weichen.').text;
    }
    if (k === 'schluessel' && rules?.shadow) {
      st.shadowHp = Math.max(0, combat.shadowHpLeft ?? st.shadowHp);
      if (combat.outcome === 'lost') return this.seq4Fail('schluessel', 'Der Schatten zerreißt und kriecht zurück in deinen Körper. Du lebst.').text;
      if (!won) { this.emit('changed'); return null; }
      if (g) return this.seq4Pass('schluessel', 'Der Schatten gleitet zurück an deine Füße.').text;
      st.wins = (st.wins ?? 0) + 1;
      if (st.wins >= SCHATTEN.fights) return this.seq4Summon('Zwei Gegner, gefällt von einem Schatten.');
      this.emit('changed');
      return `Der Schatten ohne Körper: ${st.wins}/${SCHATTEN.fights} Gegner, ${st.shadowHp}/${st.shadowMax} Leben übrig.`;
    }
    if (k === 'waage' && g) return won ? this.seq4Pass('waage', 'Mit nichts als dem Gekauften.').text : this.seq4Fail('waage', 'Was du gekauft hast, hat nicht gereicht.').text;
    if (k === 'moor' && g) {
      if (broken) return this.seq4Fail('moor', broken).text;
      if (won && !this.itemCount(RELIKT)) return this.seq4Fail('moor', 'Das Relikt war nicht bei dir.').text;
      return won ? this.seq4Pass('moor', 'Verfall gegen Schwelle, und der Verfall hat gesiegt.').text : this.seq4Fail('moor', 'Der Wächter steht, das Moor hat dich nicht getragen.').text;
    }
    if (k === 'uhr' && rules?.uhr) {
      if (broken) return this.seq4Fail('uhr', broken).text;
      if (!won) return this.seq4Fail('uhr', combat.outcome === 'lost' ? 'Kein Sieg, kein Augenblick.' : 'Wer flieht, verpasst den Augenblick.').text;
      if (g) return this.seq4Pass('uhr', `${combat.dodgeErrors} ${combat.dodgeErrors === 1 ? 'Fehler' : 'Fehler'} beim Wächter.`).text;
      if (!combat.enemyAttacks) { this.emit('changed'); return `${combat.enc.name} hat nicht ein einziges Mal angegriffen. Das zählt nicht.`; }
      st.count = (st.count ?? 0) + 1;
      if (st.count >= UHR.monsters) return this.seq4Summon('Drei Monster, kein einziger verfehlter Augenblick.');
      this.emit('changed');
      return `Der perfekte Augenblick: ${st.count}/${UHR.monsters} Monster.`;
    }
    if (k === 'laterne' && g) return null; // der Wächter der Laterne kämpft nicht auf dem Kampfbildschirm
    return null;
  },

  /** Aus tick(): Eisen ruft den Wächter, sobald alles stimmt. */
  seq4Tick() {
    if (this.seq4Kind() !== 'eisen') return;
    const st = this.seq4();
    if (st.guardian || this.pendingCombat) return;
    if (!this.eisenConditions().ok) return;
    this.seq4Summon('Die Last zieht dich in die Knie. Das Eisen hört es.');
    this.emit('notice', `${this.seq4Name('eisen')}: Der Wächter tritt an, wo du stehst.`);
  },

  // --- Laterne ---------------------------------------------------------------------------------------
  /** Beginnt die Laternennacht (die Szene übernimmt mit core/Laternenwacht.js). */
  startSiege() {
    if (this.seq4Kind() !== 'laterne') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq4();
    if (st.siege) return { ok: false, text: 'Die Laternen brennen schon.' };
    if (!this.content.zones?.[this.map]) return { ok: false, text: 'Die Laternennacht hält man nur in einem Monstergebiet.' };
    if (this.itemCount('lampenoel') < HG_LATERNEN) return { ok: false, text: `Dafür brauchst du ${HG_LATERNEN} Lampenöl (${this.itemCount('lampenoel')} dabei).` };
    this.removeItem('lampenoel', HG_LATERNEN);
    st.siege = true;
    st.siegeMap = this.map;
    st.siegeKills = 0;
    this.emit('changed');
    return { ok: true, siege: true, text: 'Du stellst sechs Laternen im Kreis auf und zündest sie an. Im Dunkel dahinter regt sich etwas. Halte das Licht.' };
  },

  /** Ergebnis der Laternennacht (aus der Szene). */
  endSiege(result) {
    const st = this.seq4();
    if (!st.siege) return null;
    if (result.won) return this.seq4Pass('laterne', 'Der Sonnenaufgang zwischen drei Flammen hat ihn ausgelöscht.');
    return this.seq4Fail('laterne', result.reason ?? 'Das Licht ist erloschen.');
  },

  // --- Faden -----------------------------------------------------------------------------------------
  /** Darf in diesem Kampf ein Schicksalsfaden gesetzt werden? */
  canMarkFate(id) {
    if (this.seq4Kind() !== 'faden') return false;
    const st = this.seq4();
    const marks = st.marks ?? [];
    if (marks.length >= HG_FAEDEN || st.dreamWon) return false;
    const enc = this.content.encounters[id];
    if (!markable(id, enc)) return false;
    const area = this.map;
    return !marks.some((m) => m.enc === id || m.area === area);
  },

  markFate(id) {
    if (!this.canMarkFate(id)) return null;
    const st = this.seq4();
    const enc = this.content.encounters[id];
    st.marks = [...(st.marks ?? []), { enc: id, name: enc.name, area: this.map, hp: enc.hp, attacks: enc.attacks }];
    this.emit('changed');
    const n = st.marks.length;
    return `Ein violetter Faden spannt sich von deinem Finger zu ${enc.name}. Schicksalsfaden ${n}/${HG_FAEDEN}.${n >= HG_FAEDEN ? ' Alle fünf halten. Schlaf, wenn du bereit bist.' : ''}`;
  },

  /** Aus der Koje: mit fünf Fäden beginnt der Traum. Gibt Text zurück oder null. */
  seq4Rest() {
    if (this.seq4Kind() !== 'faden') return null;
    const st = this.seq4();
    if ((st.marks ?? []).length < HG_FAEDEN || st.dream) return null;
    st.dream = true;
    this.buildDream();
    this.startCombat(TRAUM_ID);
    return 'Kaum sind die Augen zu, ziehen die fünf Fäden. Sie ziehen dich hinab, und am anderen Ende warten alle fünf zugleich. Im Traum heilt nichts.';
  },

  /** Baut das Traumgeflecht aus den fünf markierten Wesen (ein Gegner, alle Angriffe, verstärkt). */
  buildDream() {
    const marks = this.seq4().marks ?? [];
    const attacks = [];
    for (const m of marks) {
      const enc = this.content.encounters[m.enc] ?? m;
      const list = enc.attacks?.filter((a) => !a.action) ?? [];
      if (!list.length) continue;
      const strongest = [...list].sort((a, b) => b.damage * b.hits.length - a.damage * a.hits.length)[0];
      attacks.push({ ...strongest, name: `${enc.name}: ${strongest.name}`, damage: Math.max(1, Math.round(strongest.damage * TRAUM_BOOST.dmg)), unparryable: undefined });
    }
    const hp = Math.round(marks.reduce((n, m) => n + (this.content.encounters[m.enc]?.hp ?? m.hp ?? 40), 0) * TRAUM_BOOST.hp);
    this.content.encounters[TRAUM_ID] = {
      name: 'Das Traumgeflecht', sprite: 'wild', sheet: 'enemy_fadenspinne', occult: true, boss: true, fleeable: true, chapter: 3, hp: Math.max(120, hp), dream: true,
      intro: `Fünf Fäden, fünf Gestalten: ${marks.map((m) => m.name).join(', ')}. Sie stehen nicht nebeneinander, sie stehen ineinander, und jede schlägt zu. Im Traum heilt nichts.`,
      attacks: attacks.length ? attacks : [{ name: 'Fadenriss', damage: 14, hits: [900, 1500] }],
      on_win: {}, on_lose: {},
      win_text: 'Die fünf Gestalten zerfallen zu Garn.', lose_text: 'Die Fäden ziehen sich zu.', flee_text: 'Du reißt die Augen auf.',
    };
    return this.content.encounters[TRAUM_ID];
  },

  // --- Maske -----------------------------------------------------------------------------------------
  /** Gegner, gegen den die Maske zählt: ein Beyonder, geschätzt Sequenz 6 oder stärker (in der Prüfung auf Stufe 5 gehoben). */
  maskeTarget(id) {
    const enc = this.content.encounters[id];
    return isBeyonderFoe(id, enc) && encounterSeq(enc, this.content) <= MASKE_MIN_SEQ;
  },

  /** Schwächere als Stufe 5 kämpfen in der Maskenprüfung mit allem, was sie haben (mehr Leben und Wucht). */
  maskeScale(id) {
    const seq = encounterSeq(this.content.encounters[id], this.content);
    return seq > 5 ? { hp: 1.6, dmg: 1.35 } : null;
  },

  startMaske() {
    if (this.seq4Kind() !== 'maske') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq4();
    if (st.masked) return { ok: false, text: 'Du trägst die Zivilistengestalt schon.' };
    const arts = this.activeArtifacts().length;
    if (arts) return { ok: false, text: `Ein Zivilist trägt keine Artefakte. Lagere sie ein (${arts} dabei).` };
    if (this.formActive?.()) return { ok: false, text: 'Leg erst die mythische Gestalt ab.' };
    st.masked = true;
    this.emit('changed');
    return { ok: true, text: 'Du nimmst das Gesicht eines Menschen an, den niemand ansieht: Mantel vom Trödler, krumme Schultern, leere Hände. Jetzt such dir einen Beyonder der Sequenz 5 oder höher. Nur der einfache Angriff, Tränke sind erlaubt. Verschone ihn.' };
  },

  // --- Echo ------------------------------------------------------------------------------------------
  startEcho() {
    if (this.seq4Kind() !== 'echo') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq4();
    if (st.active) return { ok: false, text: 'Die Welt ist schon still.' };
    st.active = true;
    st.wins = 0;
    this.emit('changed');
    return { ok: true, text: `Du drückst die Hände auf die Ohren, bis das Rauschen aufhört. Dann ist es still. Ganz still. ${ECHO_FIGHTS} Kämpfe und der Wächter, ohne Ringe, ohne Warnklang.` };
  },

  /** Ist der Spieler taub (Ton aus)? */
  seq4Deaf() {
    return this.seq4Kind() === 'echo' && !!this.seq4().active;
  },

  // --- Kessel ----------------------------------------------------------------------------------------
  /** Die fünf Essenzen: erst wenn Sequenz 5 voll verdaut ist und die Formel der 4 im Gepäck liegt. */
  hgRecipesUnlocked() {
    const p = this.pathway;
    if (!p || p.seq !== 5 || this.seq4Kind() !== 'kessel') return false;
    return p.digestion >= 100 && this.itemCount(`formel_${p.id}_4`) > 0;
  },

  hgRecipes() {
    if (!this.hgRecipesUnlocked()) return [];
    const st = this.seq4();
    return HG_SUDE.map((s, i) => {
      const need = { ...s.zutaten, [LEERES_GEFAESS]: 1 };
      return { ...s, i, need, have: Object.fromEntries(Object.keys(need).map((id) => [id, this.itemCount(id)])), ready: Object.entries(need).every(([id, n]) => this.itemCount(id) >= n), drunk: (st.drunk ?? []).includes(s.id), owned: this.itemCount(s.id) };
    });
  },

  brewEssence(i) {
    const r = this.hgRecipes()[i];
    if (!r) return { ok: false, text: 'Diese Essenz kennst du noch nicht.' };
    if (r.drunk) return { ok: false, text: `${r.name} hast du schon getrunken.` };
    if (!r.ready) return { ok: false, text: `Es fehlt: ${Object.entries(r.need).filter(([id, n]) => this.itemCount(id) < n).map(([id, n]) => `${this.item(id)?.name ?? id} ×${n}`).join(', ')}.` };
    for (const [id, n] of Object.entries(r.need)) this.removeItem(id, n);
    this.addItem(r.id);
    this.act('brew');
    this.emit('changed');
    return { ok: true, text: `${r.name} gebraut. ${r.desc}` };
  },

  drinkEssence(i) {
    const r = this.hgRecipes()[i];
    if (!r || !this.itemCount(r.id)) return { ok: false, text: 'Die Essenz musst du erst brauen.' };
    const st = this.seq4();
    if (r.drunk) return { ok: false, text: 'Diese Essenz hast du schon getrunken. Jede zählt nur einmal.' };
    this.removeItem(r.id);
    st.drunk = [...(st.drunk ?? []), r.id];
    st.active = true;
    this.emit('changed');
    if (st.drunk.length >= 5) return { ok: true, fight: this.hgGuardianId(), text: this.seq4Summon('Die fünfte Essenz brennt hinab. Fünf Feuer in einem Bauch, und sie werden eins.') };
    return { ok: true, text: `${r.name} getrunken (${st.drunk.length}/5). Es brennt, dann wird es warm.` };
  },

  // --- Eisen -----------------------------------------------------------------------------------------
  eisenConditions() {
    const artifacts = this.activeArtifacts().length;
    const cap = Math.max(1, this.carryCapacity());
    const load = this.carryWeight() / cap;
    const bare = EISEN.slots.every((slot) => !this.gear?.[slot] || !this.itemCount(this.gear[slot]));
    return { artifacts, load, bare, ok: artifacts >= EISEN.artifacts && load >= EISEN.load && bare };
  },

  // --- Schlüssel: Schattensteuerung -------------------------------------------------------------------
  startShadow() {
    if (this.seq4Kind() !== 'schluessel') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq4();
    if (st.shadow) return { ok: false, text: 'Der Schatten läuft schon.' };
    if (!this.content.zones?.[this.map]) return { ok: false, text: 'Den Schatten löst man in einem Monstergebiet, wo es etwas zu jagen gibt.' };
    st.shadow = true;
    st.shadowMax = Math.max(1, Math.round(this.maxHp * SCHATTEN.hp));
    st.shadowHp = st.shadowMax;
    st.shadowMap = this.map;
    st.wins = 0;
    this.emit('changed');
    return { ok: true, shadow: true, text: `Du stellst dich still und lässt los. Dein Schatten steht auf, ohne dich. Dein Körper bleibt, wo er ist. Der Schatten hat ${st.shadowMax} Leben, heilt nicht, pariert nicht und trägt nichts. ${SCHATTEN.fights} Gegner, dann der Wächter.` };
  },

  shadowActive() {
    return this.seq4Kind() === 'schluessel' && !!this.seq4().shadow;
  },

  // --- Waage -----------------------------------------------------------------------------------------
  /** Legt allen Besitz ab und behält nur das gewählte Kapital. */
  startWaage(capital) {
    if (this.seq4Kind() !== 'waage') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq4();
    if (st.stash) return { ok: false, text: 'Dein Besitz ist schon verwahrt.' };
    capital = Math.floor(Number(capital));
    if (!Number.isFinite(capital) || capital < 0) return { ok: false, text: 'Wie viel Kapital nimmst du mit?' };
    if (capital > this.money) return { ok: false, text: `So viel hast du nicht (${this.money} Schilling).` };
    if (this.auction) return { ok: false, text: 'Nicht mitten in einer Runde.' };
    const keep = {};
    const stash = {};
    for (const [id, n] of Object.entries(this.inventory)) {
      if (this.item(id)?.kind === 'key') keep[id] = n; // Beweisstücke gehören der Akte, nicht dir
      else stash[id] = n;
    }
    st.stash = { inventory: stash, gear: { ...(this.gear ?? {}) }, weapon: this.weapon, money: this.money - capital };
    this.inventory = keep;
    this.gear = { hut: null, mantel: null, amulett: null };
    this.weapon = null;
    this.money = capital;
    st.capital = capital;
    this.updateMaxHp();
    this.emit('money', this.money);
    this.emit('changed');
    return { ok: true, text: `Alles, was du besitzt, liegt in sicherer Verwahrung. In deiner Tasche: ${capital} Schilling und sonst nichts. Geh zu einem Zirkel und kauf jedes Los der nächsten Runde.` };
  },

  /** Gibt den verwahrten Besitz zurück (Gekauftes bleibt dazu). */
  waageRestore(st = this.seq4()) {
    const s = st.stash;
    if (!s) return;
    for (const [id, n] of Object.entries(s.inventory)) this.inventory[id] = (this.inventory[id] ?? 0) + n;
    if (s.weapon && this.inventory[s.weapon]) this.weapon = s.weapon;
    else if (!this.weapon || !this.inventory[this.weapon]) this.weapon = s.weapon ?? null;
    for (const [slot, id] of Object.entries(s.gear ?? {})) if (id && this.inventory[id] && !this.gear?.[slot]) this.gear[slot] = id;
    this.money += s.money;
    delete st.stash;
    this.updateMaxHp();
    this.emit('money', this.money);
  },

  /** Aus Auction.startSession: die Runde zählt für die Waage. */
  seq4SessionStart() {
    const st = this.seq4();
    if (this.seq4Kind() !== 'waage' || !st.stash || st.guardian) return;
    st.inSession = true;
    st.bought = 0;
    st.offered = 0;
  },

  /** Aus Auction.openLot: ein Los liegt auf dem Tisch. */
  seq4LotOffered() {
    const st = this.seq4();
    if (this.seq4Kind() === 'waage' && st.inSession) st.offered = (st.offered ?? 0) + 1;
  },

  /** Aus Auction.bid (Zuschlag) und passLot (ausgelassen). */
  seq4Lot(kind) {
    const st = this.seq4();
    if (this.seq4Kind() !== 'waage' || !st.inSession) return null;
    if (kind === 'buy') { st.bought = (st.bought ?? 0) + 1; this.emit('changed'); return null; }
    return this.seq4Fail('waage', 'Ein Los ist an dir vorbeigegangen. Die Waage verlangt alles.');
  },

  /** Aus Auction.nextTurn: alle Mitglieder waren dran. Alles gekauft? Dann kommt der Wächter (beim Schließen der Runde). */
  seq4LotsDone() {
    const st = this.seq4();
    if (this.seq4Kind() !== 'waage' || !st.inSession) return;
    st.inSession = false;
    st.allBought = true;
    st.guardianDue = true;
  },

  /** Aus Auction.endSession: Runde vorbei. */
  seq4SessionEnd() {
    const st = this.seq4();
    if (this.seq4Kind() !== 'waage' || !st.stash) return;
    if (st.inSession) { this.seq4Fail('waage', 'Die Runde ging zu Ende, bevor jedes Los dir gehörte.'); return; }
    if (st.guardianDue) {
      delete st.guardianDue;
      this.seq4Summon(`Jedes Los gehört dir (${st.bought}). Die Börse ist leichter, die Waage steht still.`);
    }
  },

  // --- Moor ------------------------------------------------------------------------------------------
  /** Was die Moorkraft zersetzen darf: Artefakte (nicht geliehen), Okkultes und Seltenes. */
  decayable(id) {
    const it = this.item(id);
    if (!it || !this.itemCount(id) || id === RELIKT || it.kind === 'key' || it.kind === 'potion' || it.kind === 'formula') return false;
    if ((this.borrowed ?? []).includes(id)) return false;
    return it.kind === 'artifact' || it.occult || ['okkult', 'selten'].includes(it.rarity);
  },

  decayables() {
    if (this.seq4Kind() !== 'moor') return [];
    return Object.keys(this.inventory).filter((id) => this.decayable(id)).map((id) => ({ id, name: this.item(id).name, count: this.itemCount(id) }));
  },

  decayItem(id) {
    if (this.seq4Kind() !== 'moor') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq4();
    if (this.pathway.relikt) return { ok: false, text: 'Das Relikt ist schon geformt.' };
    if (!this.decayable(id)) return { ok: false, text: 'Das trägt nicht genug Verfall in sich.' };
    if ((st.decayed ?? []).some((d) => d.id === id)) return { ok: false, text: 'Davon hast du schon eines zersetzt. Die Moorkraft will fünf verschiedene.' };
    const it = this.item(id);
    this.removeItem(id);
    this.dropArtifactIfGone?.(id);
    st.decayed = [...(st.decayed ?? []), { id, name: it.name, boons: it.boons ?? [], curses: it.curses ?? [] }];
    this.act('use_item');
    if (st.decayed.length >= MOOR.items) return { ok: true, text: `${it.name} wird schwarz und weich, dann Schlamm. ${this.formRelic()}` };
    this.emit('changed');
    return { ok: true, text: `${it.name} wird schwarz und weich, dann Schlamm. (${st.decayed.length}/${MOOR.items})` };
  },

  /** Formt das Relikt aus den Resten: zufällige Eigenschaften der fünf, bei jedem anders. */
  formRelic(rng = seeded(`${this.pathway?.id}|${(this.seq4().decayed ?? []).map((d) => d.id).join(',')}|${this.wins ?? 0}`)) {
    const st = this.seq4();
    const boonsPool = (st.decayed ?? []).flatMap((d) => d.boons);
    const cursePool = (st.decayed ?? []).flatMap((d) => d.curses);
    const pick = (pool, n) => {
      const a = [...pool];
      const out = [];
      while (a.length && out.length < n) { const j = Math.floor(rng() * a.length); const [x] = a.splice(j, 1); if (!out.some((o) => o.key === x.key)) out.push(x); }
      return out;
    };
    const boons = pick(boonsPool, 3);
    // Ohne Artefakte unter den fünf: der Verfall selbst gibt etwas
    if (!boons.length) boons.push({ key: 'occult_mult', value: 1.2, text: 'Verfall frisst Okkultes: +20 % Schaden gegen okkulte Wesen.' });
    const curses = pick(cursePool, 1);
    this.pathway.relikt = { boons, curses };
    this.addItem(RELIKT);
    this.emit('changed');
    return `Aus dem Schlamm hebst du etwas Festes: das Relikt des Verfalls. ${boons.map((b) => b.text).join(' ')}${curses.length ? ` Aber: ${curses.map((c) => c.text).join(' ')}` : ''}`;
  },

  /** Wächter des Moores rufen: Relikt und Moorwasser müssen dabei sein. */
  summonMoor() {
    if (this.seq4Kind() !== 'moor') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq4();
    if (!this.pathway.relikt || !this.itemCount(RELIKT)) return { ok: false, text: 'Erst das Relikt formen, und es muss bei dir sein.' };
    if (!this.itemCount(MOORWASSER)) return { ok: false, text: 'Ohne Moorwasser hältst du keine Runde durch.' };
    if (st.guardian) return { ok: false, text: 'Der Wächter ist schon gerufen.' };
    return { ok: true, fight: this.hgGuardianId(), text: this.seq4Summon('Du trinkst die erste Flasche Moorwasser und hältst das Relikt hoch.') };
  },

  // --- Uhr -------------------------------------------------------------------------------------------
  startUhr4() {
    if (this.seq4Kind() !== 'uhr') return { ok: false, text: 'Das verlangt dein Ritual nicht.' };
    const st = this.seq4();
    if (st.active) return { ok: false, text: 'Die Zeitprüfung läuft schon.' };
    st.active = true;
    st.count = 0;
    this.emit('changed');
    return { ok: true, text: `Der Augenblick zählt. ${UHR.monsters} Monster, jedes muss angreifen, jeder Schlag perfekt ausgewichen. Kein Fehler.` };
  },
};
