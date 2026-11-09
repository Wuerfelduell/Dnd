// Paket AD: Zeitungen. Eine Ausgabe erscheint, sobald ihre Bedingungen erfüllt sind (Fallabschluss, Akt, Ende),
// und bleibt danach im Archiv, auch wenn spätere Flags sie ausschließen würden.

export const newspaperMethods = {
  resetPapers() {
    this.papers = []; // erschienene Ausgaben (IDs), älteste zuerst
  },

  /** Neue Ausgaben prüfen. silent: nur ins Archiv (z. B. beim Laden eines alten Spielstands). */
  checkPapers(silent = false) {
    const fresh = [];
    for (const p of this.content.newspapers ?? []) {
      if (this.papers.includes(p.id) || !this.meets(p)) continue;
      this.papers.push(p.id);
      fresh.push(p);
    }
    if (!silent) for (const p of fresh) this.emit('newspaper', p);
    return fresh;
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
