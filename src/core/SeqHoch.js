// Sequenz 3 bis 1 (Seb, 2026-11-12): Rituale aus Schritten (data/seqHoch.js), solo, ortsunabhängig.
// Fehlschlag −17 % Verdauung und +10 Unruhe, beliebig wiederholbar. Der Stand liegt je Spieler an `pathway.hoch`
// und verschwindet mit dem Trank. Bestanden: Flag hoch_<seq>_<pfad> (Spieler 2: p2_…).
//
// Schritte: kampf (n Siege unter Regeln, Kette), zeit (echte Sekunden unter Bedingungen), probe (n Proben ohne Fehler),
// opfer (Geld, Gegenstände, Artefakte), welt (Seq 2: Weltwandel, bleibt für immer), waechter (Seq 2: brutaler Grenzwächter).
// Dazu die Spuren zum Ort der Sequenz 3: ab Sequenz 4 bringt ein Sieg in einem Monstergebiet ab Kapitel 3 manchmal eine Spur.
import { ordealId } from './Pathways.js';
import { ritualformel, gildeFlag, HOCH_SEQ1_VERSIEGELT, HOCH, HOCH_FAIL_PCT, HOCH_FAIL_UNRUHE, HOCH_SCALE, GRENZ_SCALE, WELT_MULT, ORTE } from '../data/seqHoch.js';
import { PROBE_NAMEN } from './Proben.js';
import { NACHBARPFADE } from '../data/nachbarpfade.js';
import { CW_GEBIETE } from '../data/aufstieg.js';

const LATE = /^(ds_|cw_|bh_|o3_)/; // Monstergebiete ab Dunscar (Kapitel 3)

export const seqHochMethods = {
  // --- Nachschlagen -------------------------------------------------------------------------------
  hochRitual(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    const r = this.ritualDef(pid, seq);
    return r?.hoch && !this.ritualDone(pid, seq) ? r.hoch : null;
  },

  hochState() {
    if (!this.pathway) return {};
    return (this.pathway.hoch ??= {});
  },

  hochFlag(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    return `${this.acting === 2 ? 'p2_' : ''}hoch_${seq}_${pid}`;
  },

  hochPassed(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    return this.flags.has(this.hochFlag(pid, seq));
  },

  /** Aktueller Schritt der laufenden Prüfung (oder null). */
  hochStep() {
    const st = this.pathway?.hoch; // nur lesen: kein leeres Objekt am Pfad anlegen
    if (!st?.active) return null;
    const h = this.hochRitual();
    if (!h) return null;
    return h.steps[st.step ?? 0] ?? null;
  },

  hochName() {
    const p = this.pathway;
    return p ? this.ritualDef(p.id, p.seq - 1)?.name ?? 'Die Prüfung' : 'Die Prüfung';
  },

  /** Schritte fürs Ritualfenster. */
  hochSteps(r) {
    const h = r?.hoch;
    if (!h) return [];
    const st = this.hochState();
    const done = this.hochPassed(h.pid, h.seq);
    const cur = st.active ? st.step ?? 0 : -1;
    // Seq 3: Ritualformel und Mitgliedschaft in der Gilde (Seb 2026-11-12)
    const pre = h.seq === 3 ? [
      { text: 'Ritualformel der dritten Sequenz dabei (getrennt von der Trankformel)', done: done || !!this.itemCount(ritualformel(h.pid)) },
      { text: `Mitglied von ${ORTE[h.pid]?.gilde ?? 'der Gilde deines Pfades'}`, done: done || this.gildeMitglied(h.pid) },
    ] : [];
    return [...pre, ...h.steps.map((s, i) => {
      let text = s.text;
      if (i === cur) {
        if (s.type === 'kampf' || s.type === 'probe') text += ` (${st.n ?? 0}/${s.n})`;
        if (s.type === 'zeit') text += ` (${Math.floor(st.t ?? 0)}/${s.sek} s${s.maps ? `, ${(st.maps ?? []).length}/${s.maps} Gebiete` : ''}${this.hochZeitOk(s) ? '' : ', steht gerade still'})`;
        if (s.type === 'opfer' && s.artefakte) text += ` (${st.n ?? 0}/${s.artefakte})`;
      }
      return { text, done: done || (st.active && i < cur) };
    })];
  },

  hochRunning() {
    return !!this.hochState().active;
  },

  // --- Beginnen, Erfolg, Fehlschlag ---------------------------------------------------------------
  startHoch() {
    const h = this.hochRitual();
    if (!h) return { ok: false, text: 'Dein nächstes Ritual hat keine solche Prüfung.' };
    if (this.hochPassed(h.pid, h.seq)) return { ok: false, text: 'Die Prüfung ist bestanden. Vollzieh das Ritual.' };
    if (h.seq === 3 && !this.itemCount(ritualformel(h.pid))) return { ok: false, text: `Ohne die Ritualformel der dritten Sequenz geht es nicht. Sie ist so selten wie die Trankformel: Zirkel-Lose in Dunscar (15 000) oder sehr seltene Monster-Beute.` };
    if (h.seq === 3 && !this.gildeMitglied(h.pid)) return { ok: false, text: `Erst ${ORTE[h.pid]?.gilde ?? 'der Gilde deines Pfades'} beitreten (Stadtkarte ab Dunscar).` };
    if (HOCH_SEQ1_VERSIEGELT && h.seq === 1) return { ok: false, text: 'Noch versiegelt: Das Ritual der ersten Sequenz ist noch nicht freigegeben.' }; // Seb 2026-11-12: Seq 1 erst nach Abstimmung
    const st = this.hochState();
    if (st.active) return { ok: false, text: 'Die Prüfung läuft schon.' };
    for (const k of Object.keys(st)) delete st[k];
    Object.assign(st, { active: true, step: 0, n: 0, t: 0 });
    this.sfx?.('s4r_bedingung_erfuellt');
    this.emit('changed');
    return { ok: true, text: `${this.hochName()}: begonnen. ${h.steps[0].text}. Solo: Spieler 2 kann nicht helfen.` };
  },

  hochAdvance(text = '') {
    const h = this.hochRitual();
    const st = this.hochState();
    st.step = (st.step ?? 0) + 1;
    st.n = 0;
    st.t = 0;
    st.maps = [];
    if (st.step >= h.steps.length) return this.hochPass(text);
    this.sfx?.('s4r_bedingung_erfuellt');
    this.emit('changed');
    const msg = `${text ? `${text} ` : ''}Weiter: ${h.steps[st.step].text}.`;
    this.emit('notice', `${this.hochName()}: ${msg}`);
    return msg;
  },

  hochPass(text = '') {
    const h = this.hochRitual();
    const st = this.hochState();
    for (const k of Object.keys(st)) delete st[k];
    this.flags.add(this.hochFlag(h.pid, h.seq));
    const full = `${this.hochName()}: bestanden. ${text} Das Ritual kann vollzogen werden (Pfad-Tab).`;
    this.sfx?.('s4r_bedingung_erfuellt');
    this.emit('notice', full);
    this.emit('changed');
    return full;
  },

  hochFail(text) {
    const p = this.pathway;
    const st = this.hochState();
    for (const k of Object.keys(st)) delete st[k];
    if (p) {
      const before = p.digestion;
      p.digestion = Math.max(0, p.digestion - HOCH_FAIL_PCT);
      this.emit('digest', { value: p.digestion, delta: p.digestion - before, kind: 'seq4_fail', player: this.acting ?? 1 });
      this.setUnruhe(this.unruhe + HOCH_FAIL_UNRUHE);
    }
    this.emit('ritualFx', { fx: 's4r_ritual_gescheitert', pathway: p?.id, player: this.acting ?? 1 });
    const full = `${this.hochName()}: gescheitert. ${text} (−${HOCH_FAIL_PCT} % Verdauung, +${HOCH_FAIL_UNRUHE * this.unruheGainMult()} Unruhe. Du kannst es noch einmal versuchen.)`;
    this.emit('notice', full);
    this.emit('changed');
    return full;
  },

  hochCancel() {
    const st = this.hochState();
    if (!st.active) return { ok: false, text: 'Da läuft nichts.' };
    const begun = (st.step ?? 0) > 0 || (st.n ?? 0) > 0 || (st.t ?? 0) > 5;
    if (begun) return { ok: true, passed: false, text: this.hochFail('Du brichst ab.') };
    for (const k of Object.keys(st)) delete st[k];
    this.emit('changed');
    return { ok: true, text: 'Abgebrochen, ohne Folgen.' };
  },

  // --- Opfer, Weltwandel, Wächter (Knöpfe) --------------------------------------------------------
  hochOpfer(artId = null) {
    const s = this.hochStep();
    if (s?.type !== 'opfer') return { ok: false, text: 'Gerade ist kein Opfer verlangt.' };
    const st = this.hochState();
    if (s.artefakte) {
      if (!artId || this.item(artId)?.kind !== 'artifact' || !this.itemCount(artId)) return { ok: false, text: 'Wähl ein Artefakt aus deinem Gepäck.' };
      this.removeItem(artId);
      this.updateMaxHp?.();
      st.n = (st.n ?? 0) + 1;
      if (st.n < s.artefakte) { this.emit('changed'); return { ok: true, text: `${this.item(artId).name} schmilzt im Feuer. ${st.n}/${s.artefakte}.` }; }
      return { ok: true, text: this.hochAdvance(`${this.item(artId).name} schmilzt im Feuer.`) };
    }
    if (s.money && this.money < s.money) return { ok: false, text: `Dafür fehlen dir ${s.money - this.money} Schilling.` };
    const miss = Object.entries(s.items ?? {}).filter(([id, n]) => this.itemCount(id) < n);
    if (miss.length) return { ok: false, text: `Es fehlt noch: ${miss.map(([id, n]) => `${this.item(id)?.name ?? id} ${this.itemCount(id)}/${n}`).join(', ')}.` };
    if (s.money) this.addMoney(-s.money, { reason: 'Opfer' });
    for (const [id, n] of Object.entries(s.items ?? {})) this.removeItem(id, n);
    return { ok: true, text: this.hochAdvance('Das Opfer ist angenommen.') };
  },

  /** Seq 2: der Weltwandel des Pfades (bleibt für immer, auch nach dem Aufstieg). */
  hochWelt() {
    const s = this.hochStep();
    const h = this.hochRitual();
    if (s?.type !== 'welt' || !h?.welt) return { ok: false, text: 'Gerade ist kein Weltwandel verlangt.' };
    const w = h.welt;
    const fresh = !this.flags.has(`weltwandel_${h.pid}`);
    this.flags.add(`weltwandel_${h.pid}`);
    if (fresh && w.wanted && this.policeRules?.()) this.setWanted(this.wanted + w.wanted, w.titel);
    this.emit('weltwandel', { pathway: h.pid, ...w });
    const text = `${w.titel}. ${w.text} (Alle Gegner der Welt sind jetzt stärker, und das bleibt so.)`;
    this.emit('ritualFx', { fx: 's4r_waechter_erscheint_welt', pathway: h.pid, player: this.acting ?? 1 });
    return { ok: true, welt: true, text: this.hochAdvance(text) };
  },

  /** Aktive Weltwandel (für Combat, Kartenfarbe, Zeitung). */
  weltwandel() {
    return Object.keys(HOCH).filter((pid) => this.flags.has(`weltwandel_${pid}`));
  },

  /** Wie viel stärker alle Gegner durch die Weltwandel sind. */
  weltMult() {
    const n = this.weltwandel().length;
    return { hp: 1 + WELT_MULT.hp * n, dmg: 1 + WELT_MULT.dmg * n };
  },

  /** Farbschleier der Welt: der zuletzt gewirkte Wandel (oder null). */
  weltTint() {
    const list = this.weltwandel();
    if (!list.length) return null;
    const w = HOCH[list[list.length - 1]][2].welt;
    return { color: w.farbe, alpha: Math.min(0.3, w.alpha + 0.03 * (list.length - 1)) };
  },

  hochGuardian() {
    const s = this.hochStep();
    const h = this.hochRitual();
    if (s?.type !== 'waechter') return { ok: false, text: 'Der Grenzwächter kommt erst am Ende.' };
    const id = ordealId(h.pid, 2);
    if (!this.content.encounters[id]) return { ok: false, text: 'Der Grenzwächter dieses Pfades fehlt.' };
    this.hochState().guardian = true;
    this.startCombat(id);
    this.emit('changed');
    return { ok: true, fight: id, text: `Die Welt hält den Atem an. Aus dem Nebel tritt ${this.content.encounters[id].name}, größer als alles, was du je gesehen hast. ${s.text}.` };
  },

  // --- Kampf ----------------------------------------------------------------------------------------
  hochTarget(id, enc, s) {
    if (!enc || enc.practice || enc.mirror || /^hg_(schwellen|grenz)waechter_/.test(id)) return false;
    if (!enc.zone || !LATE.test(enc.zone)) return false;
    if (s.ziel === 'okkult' && !enc.occult) return false;
    return true;
  },

  /** Regeln für Combat.js (oder null). */
  hochCombatRules(id, enc) {
    const s = this.hochStep();
    if (!s) return null;
    const h = this.hochRitual();
    if (s.type === 'kampf' && this.hochTarget(id, enc, s)) return { solo: true, hoch: 'kampf', scale: HOCH_SCALE[h.seq] ?? HOCH_SCALE[3], ...s.rules };
    if (s.type === 'waechter' && id === ordealId(h.pid, 2) && this.hochState().guardian) return { solo: true, hoch: 'waechter', scale: GRENZ_SCALE, ...s.rules };
    return null;
  },

  /** Heilung verboten (Faden 3: auch außerhalb des Kampfes). */
  hochHealBlocked() {
    return !!this.hochStep()?.noHealAll;
  },

  /** Nach jedem Kampf (Combat.finish), auch für den Zuschauer (bystander). */
  hochCombatEnd(combat, { bystander = false } = {}) {
    const res = null;
    const s = this.hochStep();
    if (!s) return res;
    if (s.type === 'zeit' && (s.forbid ?? []).includes('combat') && !combat.enc.practice) return this.hochFail(`${combat.enc.name} hat dich gestellt. Diese Prüfung verlangt, dass es zu keinem Kampf kommt.`);
    if (bystander) return res;
    const rules = combat.rules;
    if (!rules?.hoch) return res;
    const won = combat.outcome === 'won' || (rules.spare && combat.outcome === 'spared');
    if (combat.ruleBroken) return this.hochFail(combat.ruleBroken);
    if (rules.spare && combat.outcome === 'won') return this.hochFail(`${combat.enc.name} ist tot. Die Maske verlangt, dass du verschonst.`);
    if (!won) return this.hochFail(combat.outcome === 'lost' ? 'Die Kette ist gerissen: verloren.' : 'Die Kette ist gerissen: wer flieht, fängt von vorn an.');
    if (rules.minItems && (combat.itemsUsedTotal ?? 0) < rules.minItems) return this.hochFail(`Nur ${combat.itemsUsedTotal ?? 0} Gegenstände benutzt, verlangt waren ${rules.minItems}.`);
    if (rules.minKillRound && combat.round < rules.minKillRound) return this.hochFail('Zu früh gesiegt.');
    if (rules.endMin) {
      if (this.hp < this.maxHp * (rules.endMin.hp ?? 0)) return this.hochFail('Die Waage kippt: zu wenig Leben am Ende.');
      if (this.composure < this.maxComposure() * (rules.endMin.nerves ?? 0)) return this.hochFail('Die Waage kippt: zu wenig Nerven am Ende.');
    }
    if (rules.hoch === 'waechter') return this.hochAdvance(`${combat.enc.name} ist gefallen.`);
    const st = this.hochState();
    st.n = (st.n ?? 0) + 1;
    this.sfx?.('s4r_bedingung_erfuellt');
    if (st.n >= s.n) return this.hochAdvance(`${st.n} Siege in Folge.`);
    this.emit('changed');
    return `${this.hochName()}: ${st.n}/${s.n}.`;
  },

  // --- Zeit -----------------------------------------------------------------------------------------
  hochZeitOk(s) {
    const need = s.need ?? [];
    const danger = !!(this.content.zones?.[this.map] || this.content.maps?.[this.map]?.danger);
    if (need.includes('danger') && !danger) return false;
    if (need.includes('vision') && !this.spiritVision) return false;
    if (need.includes('form') && !this.formActive?.()) return false;
    if (need.includes('noArtifacts') && this.activeArtifacts?.().length) return false;
    if (need.includes('load') && this.carryWeight() < 2 * Math.max(1, this.carryCapacity())) return false;
    if (need.includes('unruhe') && this.unruhe < 60) return false;
    return true;
  },

  /** Aus tick(): Zeitschritte zählen echte Sekunden, solange die Bedingungen stimmen. */
  hochTick(dt) {
    const s = this.hochStep();
    if (s?.type !== 'zeit' || this.pendingCombat || !(dt > 0)) return;
    const st = this.hochState();
    if (s.maps && (this.content.zones?.[this.map] || this.content.maps?.[this.map]?.danger)) {
      st.maps ??= [];
      if (!st.maps.includes(this.map)) { st.maps.push(this.map); this.emit('changed'); }
    }
    if (!this.hochZeitOk(s)) return;
    const before = Math.floor(st.t ?? 0);
    st.t = Math.min(s.sek, (st.t ?? 0) + dt);
    if (st.t >= s.sek && (!s.maps || (st.maps ?? []).length >= s.maps)) { this.hochAdvance(`${s.sek} Sekunden gehalten.`); return; }
    if (Math.floor(st.t) !== before && Math.floor(st.t) % 30 === 0) this.emit('changed');
  },

  /** Kontrollverlust bricht die Unruhe-Prüfung des Kessels (Pathways.loseControl ruft). */
  hochLostControl() {
    const s = this.hochStep();
    if (s?.type === 'zeit' && (s.need ?? []).includes('unruhe')) return this.hochFail('Du hast die Kontrolle verloren.');
    return null;
  },

  // --- Proben ---------------------------------------------------------------------------------------
  hochProbe() {
    const s = this.hochStep();
    const p = this.pathway;
    if (s?.type !== 'probe' || !p) return null;
    return { kind: s.kind, pid: p.id, seq: p.seq - 1, name: `${PROBE_NAMEN[s.kind] ?? 'Die Probe'} (${(this.hochState().n ?? 0) + 1}/${s.n})`, hoch: true };
  },

  /** Ergebnis einer Probe dieser Prüfung: zählen oder scheitern. Gibt Text oder null. */
  hochProbeResult(passed) {
    const s = this.hochStep();
    if (s?.type !== 'probe') return null;
    if (!passed) return this.hochFail(`Ein Fehler in Probe ${(this.hochState().n ?? 0) + 1} von ${s.n}.`);
    const st = this.hochState();
    st.n = (st.n ?? 0) + 1;
    if (st.n >= s.n) return this.hochAdvance(`${s.n} Proben ohne Fehler.`);
    this.emit('changed');
    return `${st.n}/${s.n} ohne Fehler.`;
  },

  /** Teststart (?hoch=<pfad>&seq=<3|2|1>): eine Stufe über dem Ziel, voll verdaut, Ort gefunden, das Nötigste dabei. */
  hochProbeStart(pid, seq = 3) {
    if (!this.content.pathways?.[pid]?.seqs?.[seq]?.ritual?.hoch) return false;
    for (const f of ['kapitel1_done', 'k2_arrived', 'k3_arrived', 'k4_arrived', gildeFlag(pid, 'bekannt')]) this.flags.add(f);
    this.pathway = { id: pid, seq: seq + 1, digestion: 100 };
    if (seq === 3) this.flags.add(gildeFlag(pid, 'mitglied'));
    for (const [id, n] of Object.entries({ revolver: 1, tonikum: 6, verband: 6, [`formel_${pid}_${seq}`]: 1, [ritualformel(pid)]: 1 })) if (this.item(id)) this.addItem(id, n);
    if (this.item('revolver')) this.equip?.('revolver');
    this.money = 30000;
    this.updateMaxHp();
    this.hp = this.maxHp;
    this.composure = this.maxComposure();
    this.map = seq === 3 ? `o3_${pid}` : 'ds_speisewagen';
    this.spawn = 'default';
    this.position = null;
    this.emit('changed');
    return true;
  },

  // --- Gilden der Sequenz 3 -------------------------------------------------------------------------
  /** Mitglied der Gilde dieses Pfades (eigener Pfad, oder Nachbarpfad beim Pfadwechsel). */
  gildeMitglied(pid) {
    return this.flags.has(gildeFlag(pid, 'mitglied'));
  },

  /** Ab Dunscar kennt man den Sitz der Gilde des eigenen Pfades, ab Sequenz 4 auch den des Nachbarpfads (je Spieler). */
  gildeTick() {
    if (!this.flags.has('k4_arrived')) return; // Kapitel 4: die Gilden sitzen in den Pfadgebieten von Calderwick
    for (const n of this.hasP2?.() ? [1, 2] : [1]) {
      const p = n === 1 && this.acting !== 2 ? this.pathway : this.withPlayer(n, () => this.pathway, { quiet: true });
      if (!p) continue;
      for (const pid of [p.id, ...(p.seq <= 4 && NACHBARPFADE[p.id] ? [NACHBARPFADE[p.id]] : [])]) {
        if (!ORTE[pid] || this.flags.has(gildeFlag(pid, 'bekannt'))) continue;
        this.flags.add(gildeFlag(pid, 'bekannt'));
        const o = ORTE[pid];
        // Seb (2026-11-12): ein Gildenmitglied sagt dir, dass es die Kernzutat 3 nur bei der Gilde gibt
        this.emit('notice', `Ein Mitglied von ${o.gilde} spricht dich an: „Du trägst unseren Pfad. Die Kernzutat für die dritte Sequenz bekommst du nirgends sonst, nur bei uns. Tritt bei, steig durch die fünf Ränge und stell dich ${o.chef}. Wer das Oberhaupt besiegt, ob er es tötet oder selbst Oberhaupt wird, hält den Kern in der Hand. Unser Sitz: ${o.name}, mitten in ${CW_GEBIETE[pid]?.viertel ?? 'Calderwick'}.“ (steht auf der Stadtkarte von Calderwick)`);
      }
    }
  },

  /** Pfad-Tab: Stand bei der Gilde. */
  gildeStand(pid = this.pathway?.id) {
    const o = ORTE[pid];
    if (!o) return null;
    return { gilde: o.gilde, ort: o.name, chef: o.chef, bekannt: this.flags.has(gildeFlag(pid, 'bekannt')), mitglied: this.gildeMitglied(pid),
      kern: this.flags.has(gildeFlag(pid, 'chef')) ? 'chef' : this.flags.has(gildeFlag(pid, 'chef_tot')) ? 'tot' : null };
  },
};
