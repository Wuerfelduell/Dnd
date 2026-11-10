// Paket BG, Einbau: verbindet Claims.js mit Bestand (Kernfächer, Hedda, Kampfende, Käufe, alte Spielstände).
import { claimSource } from './Claims.js';

const fmt = (tpl, vars) => String(tpl ?? '').replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

export const claimEinbauMethods = {
  /** Bestandsauszahlung (Kernfach, Heddas Belohnung) erfüllt den persönlichen Anspruch des handelnden Spielers. */
  settleClaims(items = {}) {
    const given = Object.keys(items);
    if (!given.length || !this.content.claimSources) return;
    const player = this.acting ?? 1;
    for (const [id, def] of Object.entries(this.content.claimSources)) {
      if (!def.rewards.some((r) => given.includes(r.item))) continue;
      if (!this.openClaims(id) || this.claims[id]?.[player] !== 'offen') continue;
      this.claims[id][player] = 'eingeloest';
      this.emit('claim', { source: id, player, item: def.rewards.find((r) => given.includes(r.item)).item });
    }
  },

  /** Nach einem gewonnenen Hüterkampf holt jeder Beteiligte seine Kernzutat sofort; Prüfungen bleiben bei Hedda. */
  claimAfterWin(encounterId, players) {
    if (!this.content.claimSources) return [];
    const id = claimSource(this, `won_${encounterId}`);
    if (!id || this.content.claimSources[id].kind !== 'boss') return [];
    const lines = [];
    for (const p of players) {
      const r = this.redeem(`kampf:${id}:${p}:${Date.now()}`, id, p);
      if (r?.item) lines.push(fmt(this.content.claimTexts?.k3b_claim?.boss, { player: p, item: this.item(r.item)?.name ?? r.item }));
    }
    return lines;
  },

  /** Erwerbsquittung: Kernzutat oder Trank einer Ersatzzeile landet in der Tasche des handelnden Spielers. */
  recordClaimItem(itemId) {
    for (const row of this.content.claimReplacements ?? []) {
      if (row.source_type === 'acquisition' && (row.core === itemId || row.potion === itemId)) this.recordClaimAcquisition(this.acting ?? 1, row.pathway, row.seq);
    }
  },

  /** Alte Spielstände ohne Anspruchsregister: Spieler 1 hat damals abgeholt, wenn das globale Merkflag steht. */
  migrateLegacyClaims() {
    for (const [id, def] of Object.entries(this.content.claimSources ?? {})) {
      const m = /^won_(\w+)$/.exec(id);
      const legacy = def.kind === 'boss' && m ? `k3o_${m[1]}_kern_abgeholt` : /^k3p_(\w+)_bewaeltigt$/.test(id) ? id.replace(/_bewaeltigt$/, '_done') : null;
      if (legacy && this.flags.has(legacy) && this.claims[id]?.[1] === 'offen') this.claims[id][1] = 'eingeloest';
    }
  },

  /** Notizbuch: offene Ansprüche eines Spielers als Texte. */
  openClaimTexts(player) {
    const t = this.content.claimTexts;
    if (!t || !this.content.claimSources) return [];
    return Object.entries(this.syncClaims()).filter(([, e]) => e[player] === 'offen').map(([id]) => t.k3b_offen?.[id] ?? id);
  },
};
