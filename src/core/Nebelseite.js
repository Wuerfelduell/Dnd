// Codex DH: Nebelseite – Nacht-Flag für die Übergänge, Unruhe drüben (+1 je 20 s), erstes Betreten (Daten: data/nebelseite.js).
export const NS_TAKT = 20;

export const nebelseiteMethods = {
  nsTick(dt) {
    const nacht = !!this.isNight?.();
    if (nacht !== this.flags.has('ns_nacht')) { if (nacht) this.flags.add('ns_nacht'); else this.flags.delete('ns_nacht'); }
    const m = this.content.maps?.[this.map];
    if (!m?.nebelseite) return;
    const flag = `ns_betreten_${m.id.replace(/^ns_/, '')}`;
    if (!this.flags.has(flag)) {
      this.flags.add(flag);
      const u = this.content.nebelseite?.uebergaenge.find((x) => x.target_map === m.id);
      this.emit('notice', u?.first_entry_text ?? 'Du bist auf der Nebelseite. Den Rückweg findest du nur am Übergang.');
      this.emit('notice', 'Alle 20 Sekunden hier drüben steigt deine Unruhe um 1.');
    }
    this.nsUhr = (this.nsUhr ?? 0) + dt;
    while (this.nsUhr >= NS_TAKT) {
      this.nsUhr -= NS_TAKT;
      if (this.isBeyonder?.()) this.setUnruhe(this.unruhe + 1); else this.setComposure(this.composure - 1);
    }
  },
};
