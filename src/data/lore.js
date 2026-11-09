import { applyQuestPack } from './questPacks.js';

/**
 * Paket AD (data/packs/lore): Lesestücke auf den Karten, neue Itembeschreibungen (nur wenn die alte noch stimmt),
 * Bestiariumstexte mit Kampftipp, Zeitungsausgaben und Gerede der Passanten.
 */
export function applyLore(content, lore) {
  if (!lore) return content;
  for (const [id, t] of Object.entries(lore.item_texte ?? {})) {
    const it = content.items[id];
    if (it && it.desc === t.alt) content.items[id] = { ...it, desc: t.neu };
  }
  content.bestiaryTexts = lore.bestiarium ?? {};
  content.newspapers = lore.zeitungen ?? [];
  content.gossip = lore.gerede ?? {};
  applyQuestPack(content, { name: 'lore', platzierung: lore.lesestuecke ?? [] });
  return content;
}

/** Name der Zeitung. */
export const NEWSPAPERS = { kurier: 'Kettlegater Kurier', bote: 'Wexmoorer Bote', dunscarer_kalkblatt: 'Dunscarer Kalkblatt' }; // Kapitel 3 (AR)
