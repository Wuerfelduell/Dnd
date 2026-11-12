// Paket AD: Zeitungen. Eine Ausgabe erscheint, sobald ihre Bedingungen erfüllt sind (Fallabschluss, Akt, Ende),
// und bleibt danach im Archiv, auch wenn spätere Flags sie ausschließen würden.

export const newspaperMethods = {
  resetPapers() {
    this.papers = []; // erschienene Ausgaben (IDs), älteste zuerst
  },

  /** Neue Ausgaben prüfen. silent: nur ins Archiv (z. B. beim Laden eines alten Spielstands). */
  checkPapers(silent = false) {
    this.syncCityFlags();
    const fresh = [];
    for (const p of this.content.newspapers ?? []) {
      if (this.papers.includes(p.id) || !this.meets(p)) continue;
      this.papers.push(p.id);
      fresh.push(p);
    }
    if (!silent) for (const p of fresh) this.emit('newspaper', p);
    return fresh;
  },

  /** Paket CP: `hg_in_<stadt>` ist eine abgeleitete Flagge der aktuellen Stadt (Zeitungen melden den Halbgott vor Ort). */
  syncCityFlags() {
    const city = this.content.maps?.[this.map]?.city ?? 'kettlegate';
    for (const c of ['kettlegate', 'wexmoor', 'dunscar', 'calderwick', 'briarholt']) {
      if (c === city) this.flags.add(`hg_in_${c}`); else this.flags.delete(`hg_in_${c}`);
    }
  },

  /** Archiv, neueste zuerst. */
  paperArchive() {
    const byId = Object.fromEntries((this.content.newspapers ?? []).map((p) => [p.id, p]));
    return this.papers.map((id) => byId[id]).filter(Boolean).reverse();
  },

  loadPapers(data) {
    this.papers = (data.papers ?? []).filter((id) => (this.content.newspapers ?? []).some((p) => p.id === id));
    this.checkPapers(true);
  },
};
