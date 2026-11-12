// Pfad-Beyonder in Wexmoor (Seb, 2026-11-12; Daten in data/pfadHandel.js): Die Einzelgänger helfen bei den
// Kernzutaten für Sequenz 5 und 4 mit Wucher, Gefallen, Aufgaben oder Hinweisen. Hier steht, was die Daten nicht können:
// Schritte mit Frist (Laternen in einer Nacht, Schleusenräder in drei Minuten), Kampfserien ohne Heilung, Kämpfe mit
// Sonderregeln (keine Heilung, kein Ausweichen, Taubheit, Moorwasser), Hinweis-Beute und die Seq-4-Formel als seltene
// Elite-Beute (0,5 %; sonst gibt es sie nur auf geheimen Treffen).
import { DAY_NIGHT_SECONDS } from './Clock.js';
import { FORMEL_ELITE_CHANCE, FORMEL_K3_CHANCE, K3_ZUTAT4_CHANCE, SCHLEUSEN_FRIST, WX_ZONES } from '../data/pfadHandel.js';

/** Wie viele Schritte jede Aufgabe mit Stationen hat. */
const STEPS = { laterne5: 3, uhr5: 4, echo4: 3 };

export const pfadHandelMethods = {
  phState() {
    return (this.pfadHandel ??= {});
  },

  phOffer(id) {
    return this.content.pfadHandel?.offers.find((o) => o.id === id) ?? null;
  },

  phActive(id) {
    return this.flags.has(`ph_${id}_aktiv`) && !this.flags.has(`ph_${id}_fertig`);
  },

  /** Laufendes Fenster eines Schritts: Laternen je Nacht, Schleusen mit Frist ab dem ersten Rad, sonst dauerhaft. */
  phWindowOk(task, st) {
    if (!st) return false;
    if (task === 'laterne5') return st.win === Math.floor((this.playTime ?? 0) / DAY_NIGHT_SECONDS) && this.isNight?.();
    if (task === 'uhr5') return (this.playTime ?? 0) - st.start <= SCHLEUSEN_FRIST;
    return true;
  },

  phStepDone(task, n) {
    const st = this.phState()[task];
    return !!st && this.phWindowOk(task, st) && (st.set ?? []).includes(n);
  },

  /** Für meets(): requires_item_counts, requires_artifacts, requires_ph_step. */
  meetsPfad(o) {
    for (const [id, n] of Object.entries(o.requires_item_counts ?? {})) if (this.itemCount(id) < n) return false;
    if (o.requires_artifacts !== undefined && this.phArtifacts().length < o.requires_artifacts) return false;
    if (o.requires_ph_step && !this.phStepDone(...o.requires_ph_step)) return false;
    return true;
  },

  /** Mitgeführte Artefakte, billigste zuerst (Maud nimmt sie als Pfand). */
  phArtifacts() {
    return Object.keys(this.inventory ?? {}).filter((id) => this.inventory[id] > 0 && this.item(id)?.kind === 'artifact')
      .sort((a, b) => (this.item(a).price ?? 0) - (this.item(b).price ?? 0));
  },

  /** Schritt einer Aufgabe festhalten; meldet, wenn sie damit fertig ist. */
  phRecord(task, n) {
    const all = this.phState();
    const now = this.playTime ?? 0;
    let st = all[task];
    if (!this.phWindowOk(task, st)) st = all[task] = task === 'laterne5' ? { win: Math.floor(now / DAY_NIGHT_SECONDS), set: [] } : { start: now, set: [] };
    if (!st.set.includes(n)) st.set.push(n);
    const total = STEPS[task] ?? 1;
    if (st.set.length >= total) {
      this.flags.add(`ph_${task}_fertig`);
      delete all[task];
      this.emit('notice', 'Erledigt. Zurück zum Auftraggeber.');
    } else {
      const left = task === 'uhr5' ? ` Noch ${Math.max(0, Math.ceil(SCHLEUSEN_FRIST - (now - st.start)))} Sekunden.` : '';
      this.emit('notice', `${st.set.length} von ${total}.${left}`);
    }
    this.emit('changed');
  },

  /** Effekt `pfad` aus Dialogknoten: { start }, { step, fight? }, { fight }, { pfand }. */
  pfadEffect(e) {
    const all = this.phState();
    if (e.start) {
      delete all[e.start];
      if (e.start === 'eisen5' || e.start === 'uhr4') all[e.start] = { n: 0 };
    }
    if (e.pfand) for (const id of this.phArtifacts().slice(0, e.pfand)) this.removeItem(id, 1);
    if (e.fight) {
      all.pending = { fight: e.fight, step: e.step ?? null };
      this.startCombat(e.fight);
    } else if (e.step) this.phRecord(...e.step);
  },

  /** Regeln eines ausdrücklich gerufenen Aufgaben-Kampfs (gehen den Seq-4-Prüfungen vor). */
  pfadTaskRules(id, enc) {
    if (!enc || enc.practice || this.phState().pending?.fight !== id) return null;
    const o = this.content.pfadHandel?.offers.find((x) => x.fight === id || x.fights?.some((f) => f.id === id));
    return o?.rules ? { ...o.rules, pfad: true } : null;
  },

  /** Kampfregeln der Serien-Aufgaben (Combat fragt, wenn keine Seq-4-Prüfung Regeln setzt). */
  pfadCombatRules(id, enc) {
    if (!enc || enc.practice) return null;
    const all = this.phState();
    const eisen = this.phOffer('eisen5');
    if (eisen && this.phActive('eisen5') && enc.zone === eisen.zone) {
      const st = (all.eisen5 ??= { n: 0 });
      // Zwischen zwei Kämpfen geheilt (Leben gestiegen)? Dann beginnt die Serie von vorn.
      if (st.n > 0 && st.hp !== undefined && this.hp > st.hp) st.n = 0;
      return { ...eisen.rules, pfad: true };
    }
    return null;
  },

  /** Nach jedem Kampf (Combat.finish): Aufgaben auswerten. Gibt Text für die Meldung oder null. */
  pfadCombatEnd(combat) {
    if (combat.enc.practice) return null;
    const all = this.phState();
    const won = combat.outcome === 'won';
    const out = [];
    const p = all.pending;
    if (p && p.fight === combat.id) {
      delete all.pending;
      if (won) {
        if (p.step) this.phRecord(...p.step);
        else {
          const o = this.content.pfadHandel?.offers.find((x) => x.fight === combat.id);
          if (o) { this.flags.add(`ph_${o.id}_fertig`); out.push('Geschafft. Zurück zum Auftraggeber.'); }
        }
      } else if (combat.ruleBroken) out.push('Die Aufgabe ist misslungen. Du kannst es noch einmal versuchen.');
    }
    const eisen = this.phOffer('eisen5');
    if (eisen && this.phActive('eisen5') && combat.enc.zone === eisen.zone) {
      const st = (all.eisen5 ??= { n: 0 });
      if (won) {
        st.n += 1;
        st.hp = this.hp;
        if (st.n >= eisen.count) { this.flags.add('ph_eisen5_fertig'); delete all.eisen5; out.push(`${eisen.count} Siege ohne Heilung. Tobin wird zufrieden sein.`); }
        else out.push(`Serie ohne Heilung: ${st.n} von ${eisen.count}.`);
      } else { st.n = 0; out.push('Die Serie ist gerissen. Sie beginnt von vorn.'); }
    }
    const uhr = this.phOffer('uhr4');
    if (uhr && this.phActive('uhr4') && WX_ZONES.includes(combat.enc.zone)) {
      const night = Math.floor((this.playTime ?? 0) / DAY_NIGHT_SECONDS);
      let st = (all.uhr4 ??= { n: 0 });
      if (st.night !== night || !this.isNight?.()) st = all.uhr4 = { n: 0, night };
      if (!this.isNight?.()) out.push('Corvin wollte Siege in der Nacht. Tagsüber zählt keiner.');
      else if (won) {
        st.n += 1;
        if (st.n >= uhr.count) { this.flags.add('ph_uhr4_fertig'); delete all.uhr4; out.push(`${uhr.count} Siege in einer Nacht. Corvin wartet.`); }
        else out.push(`Siege in dieser Nacht: ${st.n} von ${uhr.count}.`);
      } else { st.n = 0; out.push('Die Nacht ist verdorben. Die Zählung beginnt von vorn.'); }
    }
    if (out.length) this.emit('changed');
    return out.length ? out.join(' ') : null;
  },

  /** Zusätzliche Beute (Combat.rollLoot): Hinweise, Sammelaufträge, die Seq-4-Formel bei Eliten. */
  pfadExtraLoot(combat, loot, rng = combat.rng ?? Math.random) {
    const enc = combat.enc;
    if (enc.practice || enc.pfad_handel) return;
    const add = (id) => { loot.items[id] = (loot.items[id] ?? 0) + 1; };
    for (const o of this.content.pfadHandel?.offers ?? []) {
      if (o.kind === 'hinweis' && this.flags.has(`ph_${o.id}_hinweis`)) {
        const c = o.drops[combat.id];
        if (c && rng() < c) add(o.item);
      }
      if (o.dropItem && this.phActive(o.id)) {
        const c = o.drops[`@${enc.zone}`];
        if (c && rng() < c) add(o.dropItem);
      }
    }
    // Seb (2026-11-12): die Halbgott-Formel fällt nur selten bei Eliten (sonst nur auf geheimen Treffen).
    // In Kapitel 3 (Dunscar) fallen Formel 4 und 3 bei allen Gegnern mit sehr kleiner Chance, je Spieler-Pfad (auch Spieler 2).
    const k3f = enc.chapter === 3;
    const tier = enc.boss ? 'boss' : enc.elite ? 'elite' : 'normal';
    // Gebiete mit eigenen Chancen (Schlackengrube): `formel_chance` / `zutat4_chance` je Rang, Mittelbosse eigener Rang
    const zone = this.content.zones?.[enc.zone];
    const rang = enc.mittelboss ? 'mittel' : tier;
    const pws = [this.pathway, this.p2?.active ? this.p2.pathway : null].filter((pw) => pw?.id);
    const seen = new Set();
    for (const pw of pws) {
      const target = pw.seq - 1;
      const own = zone?.formel_chance?.[target]?.[rang];
      const chance = own !== undefined && k3f ? own : target === 4 ? (k3f ? FORMEL_K3_CHANCE[4][tier] : enc.elite ? FORMEL_ELITE_CHANCE : 0)
        : target === 3 && k3f ? FORMEL_K3_CHANCE[3][tier] : 0;
      const id = `formel_${pw.id}_${target}`;
      const flag = target === 4 ? `ph_formel_${pw.id}` : `ph_formel${target}_${pw.id}`;
      if (!chance || seen.has(id) || !this.item(id) || this.flags.has(flag)) continue;
      seen.add(id);
      const have = (this.inventory[id] ?? 0) + (this.p2?.inventory?.[id] ?? 0) + (this.storage?.[id] ?? 0) + (loot.items[id] ?? 0);
      if (have === 0 && rng() < chance) { add(id); this.flags.add(flag); }
    }
    // Kapitel 3: Seq-4-Kernzutat bei Eliten und Bossen, je Pfad, der auf Seq 5 steht (auch Spieler 2)
    const k3 = enc.chapter === 3 && (zone?.zutat4_chance?.[rang] ?? (enc.boss ? K3_ZUTAT4_CHANCE.boss : enc.elite ? K3_ZUTAT4_CHANCE.elite : 0));
    if (k3) {
      const need = {};
      for (const pw of [this.pathway, this.p2?.active ? this.p2.pathway : null]) if (pw?.seq === 5) need[pw.id] = (need[pw.id] ?? 0) + 1;
      for (const [pid, n] of Object.entries(need)) {
        const id = `sq_zutat_${pid.replace(/^sq_/, '')}_4`;
        const have = (this.inventory[id] ?? 0) + (this.p2?.inventory?.[id] ?? 0) + (this.storage?.[id] ?? 0) + (loot.items[id] ?? 0);
        if (this.item(id) && have < n && rng() < k3) add(id);
      }
    }
  },

  serializePfadHandel() {
    const { pending, ...rest } = this.phState();
    return { pfadHandel: rest };
  },

  loadPfadHandel(data) {
    this.pfadHandel = data?.pfadHandel && typeof data.pfadHandel === 'object' ? { ...data.pfadHandel } : {};
  },
};
