// Artefakte und die Ausgabe des Reviers (ohne Phaser, in Node testbar).
//
// Artefakte sind Gegenstände der Art 'artifact' mit Vorteilen (boons) und schweren Nachteilen (curses).
// Es gibt kein An- und Ablegen: Beide wirken über passive(), sobald das Artefakt im Inventar ist.
// Einzige Ausnahme: korrumpierte Artefakte (Corruption.js) darf man beiseitelegen, dann ruhen sie.
// Wer etwas nicht spüren will, muss es im Büro (oder einem Versteck) einlagern oder zurückgeben.
// - Ein Artefakt aufzunehmen bringt Unruhe. Mehrere Artefakte streiten sich (Unruhe pro Sekunde),
//   jenseits von max_active wird der Streit deutlich heftiger.
// - Herkunft: Asservatenkammer des Reviers (ausleihen, nach Rang) oder selten als Beute in Gefahrengebieten.
// - Geliehene Artefakte kann man nicht verkaufen. Wer mit einem geliehenen Artefakt die Kontrolle verliert,
//   verliert Ansehen.
//
// Revier-Ausgabe (pathways.json → revier_supply): Die Gutachterin Dr. Varga gibt für wenige Pfade
// fertige Tränke aus, jede Sequenz einmal, sobald der passende Fall gelöst ist. Nur bis Sequenz 7:
// höhere Stufen gibt es nur bei geheimen Treffen (Auktionen) oder als seltenen Fund.

export const artifactMethods = {
  resetArtifacts() {
    this.borrowed = []; // vom Revier geliehen (ids)
    this.revierPotions = []; // bereits abgeholte Revier-Tränke: 'pfad_seq'
  },

  artifactRules() {
    return this.content.artifacts ?? { max_active: 3, list: {} };
  },

  artifactDef(id) {
    return this.artifactRules().list?.[id] ?? null;
  },

  /** Alle Artefakte, die du gerade bei dir trägst. Genau diese wirken. */
  activeArtifacts() {
    return Object.keys(this.inventory ?? {}).filter((id) => this.inventory[id] > 0 && this.item(id)?.kind === 'artifact' && !this.isSetAside?.(id));
  },

  isArtifactActive(id) {
    return this.item(id)?.kind === 'artifact' && this.itemCount(id) > 0 && !this.isSetAside?.(id);
  },

  /** Alle Vor- und Nachteile der mitgeführten Artefakte als Listen für passive(). */
  artifactEffects() {
    const out = [];
    for (const id of this.activeArtifacts()) {
      const it = this.item(id);
      if (it) out.push(it.boons ?? [], it.curses ?? []);
    }
    return out;
  },

  /** Unruhe pro Sekunde durch Artefakte (Flüche plus Streit zwischen mehreren). */
  artifactUnruhe() {
    const n = this.activeArtifacts().length;
    if (!n) return Math.max(0, this.passive('unruhe_tick')); // BN: Bindung wirkt auch ohne Artefakt
    const rules = this.artifactRules();
    const clash = (rules.clash_tick ?? 0.2) * Math.max(0, n - 1);
    const over = (rules.overload_tick ?? 0.6) * Math.max(0, n - (rules.max_active ?? 3));
    return Math.max(0, this.passive('unruhe_tick') + clash + over);
  },

  /** Wird aufgerufen, wenn ein Artefakt neu ins Inventar kommt. */
  artifactPickedUp(id) {
    const u = this.artifactRules().pickup_unruhe ?? 10;
    if (u) this.setUnruhe(this.unruhe + u);
    this.updateMaxHp();
    this.emit('artifact', { id, active: true });
    const max = this.artifactRules().max_active ?? 3;
    const n = this.activeArtifacts().length;
    this.emit('notice', `${this.item(id).name} wirkt jetzt, solange du es bei dir hast (+${u} Unruhe).${n > max ? ` ${n} Artefakte auf einmal: Sie zerren heftig aneinander.` : ''}`);
  },

  /** Wird aufgerufen, wenn ein Gegenstand das Inventar verlässt. */
  dropArtifactIfGone(id) {
    if (this.itemCount(id) > 0) return;
    this.updateMaxHp();
    this.emit('artifact', { id, active: false });
    // Eingelagert bleibt es Revier-Eigentum; nur wenn es ganz weg ist, endet die Ausleihe.
    const kept = this.storedCount?.(id, 'buero') > 0 || Object.values(this.stashes ?? {}).some((st) => (st?.[id] ?? 0) > 0);
    if (!kept) this.borrowed = this.borrowed.filter((b) => b !== id);
  },

  // --- Asservatenkammer ------------------------------------------------------------
  /** Wie viele Artefakte das Revier dir gleichzeitig leiht (nach Ansehen). */
  borrowLimit() {
    let n = 0;
    for (const [min, lim] of this.artifactRules().borrow_limit ?? []) if (this.honor >= min) n = lim;
    return n;
  },

  /** Angebot der Asservatenkammer: [{id, name, desc, boons, curses, locked?, borrowed}] */
  vaultStock() {
    const limit = this.borrowLimit();
    return Object.entries(this.artifactRules().list ?? {}).filter(([, a]) => a.source === 'revier').map(([id, a]) => {
      const borrowed = this.borrowed.includes(id);
      let locked = null;
      if (!borrowed) {
        if (a.requires_honor !== undefined && this.honor < a.requires_honor) locked = `Rang ${this.rank(a.requires_honor).name} (Ansehen ${a.requires_honor}) nötig`;
        else if (!limit) locked = 'Erst ab Rang Ermittler leiht dir das Revier etwas';
        else if (this.borrowed.length >= limit) locked = `Du hast schon ${this.borrowed.length} von ${limit} erlaubten Stücken`;
      }
      return { id, ...this.item(id), borrowed, locked };
    });
  },

  borrowArtifact(id) {
    const e = this.vaultStock().find((x) => x.id === id);
    if (!e) return { ok: false, text: 'Das liegt nicht in der Asservatenkammer.' };
    if (e.borrowed) return { ok: false, text: 'Das hast du schon ausgeliehen.' };
    if (e.locked) return { ok: false, text: e.locked };
    this.borrowed.push(id);
    this.addItem(id);
    this.emit('changed');
    return { ok: true, text: `Thale trägt ${e.name} ins Ausleihbuch ein. „Unterschreiben Sie hier. Und hier. Und hier, dass Sie über die Nebenwirkungen belehrt wurden.“` };
  },

  returnArtifact(id) {
    if (!this.borrowed.includes(id) || !this.itemCount(id)) return { ok: false, text: 'Das gehört nicht dem Revier.' };
    this.borrowed = this.borrowed.filter((b) => b !== id);
    this.removeItem(id);
    this.emit('changed');
    return { ok: true, text: `${this.item(id).name} ist zurück im Regal. Thale streicht den Eintrag durch.` };
  },

  /** Kontrollverlust mit geliehenem Artefakt am Leib: Das Revier erfährt davon. */
  artifactShame() {
    const worn = this.activeArtifacts().filter((a) => this.borrowed.includes(a));
    if (!worn.length) return '';
    this.addHonor(-3 * worn.length, 'Kontrollverlust mit Revier-Artefakt');
    return '\n\nEin Constable hat dich gefunden, mit Revier-Eigentum am Leib. Das spricht sich herum.';
  },

  // --- Revier-Ausgabe (Dr. Varga) ----------------------------------------------------
  revierSupply() {
    return this.content.revierSupply ?? null;
  },

  /**
   * Was Dr. Varga gerade ausgeben könnte: [{pathway, seq, potion, name, ready, locked?, taken}]
   * Ohne Pfad: die Sequenz 9 jedes Revier-Pfades. Mit Revier-Pfad: die nächste Sequenz.
   */
  revierOffers() {
    const sup = this.revierSupply();
    if (!sup) return [];
    const pids = this.pathway ? sup.pathways.filter((p) => p === this.pathway.id) : sup.pathways;
    return pids.map((pid) => {
      const seq = this.pathway ? this.pathway.seq - 1 : 9;
      const step = sup.seqs[seq];
      const sd = this.seqDef(pid, seq);
      if (!step || !sd) return { pathway: pid, seq, locked: sup.beyond_text ?? 'Weiter reicht die Ausgabe des Reviers nicht.', taken: false };
      const taken = this.revierPotions.includes(`${pid}_${seq}`) || this.itemCount(`trank_${pid}_${seq}`) > 0;
      let locked = null;
      if (!this.meets(step)) locked = step.locked_text;
      return { pathway: pid, seq, potion: `trank_${pid}_${seq}`, name: sd.name, taken, locked };
    });
  },

  takeRevierPotion(pid) {
    const o = this.revierOffers().find((x) => x.pathway === pid);
    if (!o) return { ok: false, text: 'Für diesen Pfad gibt das Revier nichts aus.' };
    if (o.taken) return { ok: false, text: 'Diesen Trank hast du schon abgeholt.' };
    if (o.locked || !o.potion) return { ok: false, text: o.locked ?? 'Gesperrt.' };
    this.revierPotions.push(`${pid}_${o.seq}`);
    this.addItem(o.potion);
    this.emit('changed');
    return { ok: true, text: `Dr. Varga stellt eine versiegelte Phiole auf den Tisch: ${this.item(o.potion).name}. „Erst verdauen, dann trinken. Ich will Sie nicht vom Pflaster kratzen müssen.“` };
  },

  serializeArtifacts() {
    return { borrowed: this.borrowed, revierPotions: this.revierPotions };
  },

  loadArtifacts(data) {
    const owned = (id) => this.itemCount(id) > 0 || this.storedCount?.(id, 'buero') > 0 || Object.values(this.stashes ?? {}).some((st) => (st?.[id] ?? 0) > 0);
    this.borrowed = (data.borrowed ?? []).filter((id) => this.item(id)?.kind === 'artifact' && owned(id));
    this.revierPotions = data.revierPotions ?? [];
  },
};
