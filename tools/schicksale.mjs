// Schicksals-Prüfung (Seb 2026-11-27: „Story-Inkonsistenzen, wenn man mal das falsche Ende gewählt hat“).
// Wer nach einem Ende verhaftet, suspendiert, verschwunden oder tot ist, darf danach nicht weiter herumstehen, Briefe schreiben
// oder im Gerede vorkommen, als wäre nichts gewesen.
//
//   node tools/schicksale.mjs          → Fehlerliste (Auftritte ohne passende Bedingung)
//   node tools/schicksale.mjs --enden  → Übersicht: je Fall die Flags, die nur manche Enden setzen, und wer sie abfragt
//
// Neue Figuren mit Schicksal hier eintragen. Ein Auftritt ist in Ordnung, wenn er
//   - ein `weg`-Flag in hide_if_flags hat (die Figur verschwindet nach dem Ende), oder
//   - ein `nur`-Flag in requires_flags hat (die Figur erscheint nur in dem Ende, in dem sie da ist), oder
//   - nur während eines laufenden Auftrags sichtbar ist (requires_quests_active, vor dem Ende).

/**
 * wer: Anzeige; weg: Flags, nach denen die Figur fort ist; nur: Flags, ohne die sie nicht da ist;
 * dialoge: ihre Gesprächs-Ids (alle Platzierungen auf allen Karten werden geprüft); post: Absender-Id ihrer Briefe;
 * gerede: Muster für Gerede-Zeilen über sie.
 */
export const SCHICKSALE = [
  { wer: 'Elias Thorne (stirbt in c1_half/c1_drowned)', nur: ['elias_rescued'], dialoge: ['elias'] },
  { wer: 'Hester Marsh (verstummt/verschwunden in c2_runaway/c2_anselm)', weg: ['hester_lost'], dialoge: ['hester_awake'] },
  { wer: 'Ivy Marsh, Briefe über Hester (nie gefunden in c2_anselm)', weg: ['c2_wrong'], post: 'ivy' },
  { wer: 'Totengräber Moll (verhaftet in c2_perfect/c2_good)', weg: ['hester_saved'], dialoge: ['moll'] },
  { wer: 'Constable Rook (verhaftet oder geflohen)', weg: ['case_03_raid'], dialoge: ['rook'] },
  { wer: 'Sergeant Holt (suspendiert in c3_holt)', weg: ['holt_suspended'], dialoge: ['holt'], post: 'holt', gerede: /\bHolt\b/ },
  { wer: 'Felix Dunmore (verhaftet oder untergetaucht)', weg: ['case_04_showdown'], dialoge: ['souffleur'] },
  { wer: 'Jonas Pell (verhaftet in c4_mask)', weg: ['pell_arrested'], dialoge: ['pell'] },
  { wer: 'Madame Orsolya (verhaftet in c6_seer)', weg: ['seer_arrested'], dialoge: ['wahrsagerin'] },
  { wer: 'Edmund Thorne (verhaftet in c7_heir)', weg: ['edmund_arrested'], dialoge: ['erbe'] },
  { wer: 'Miss Wren (verhaftet in c7_wren/c8_*)', weg: ['wren_arrested'], dialoge: ['gouvernante'], post: 'gouvernante', gerede: /Miss Wren/ },
  { wer: 'Jasper Reed (verhaftet in c8_piper)', weg: ['piper_arrested'], dialoge: ['rattenfaenger'] },
  { wer: 'Miriam Vey in Wexmoor (nur wenn geflohen)', nur: ['vey_fled'], dialoge: ['vey_wexmoor'] },
];

const has = (list, flags) => (list ?? []).some((f) => flags.includes(f));

/** Prüft alle Auftritte. Gibt [{ wer, wo, warum }] zurück. */
export function pruefeSchicksale(content, schicksale = SCHICKSALE) {
  const fehler = [];
  const ok = (s, v = {}) => has(v.hide_if_flags, s.weg ?? []) || has(v.requires_flags, s.nur ?? []) || (v.requires_quests_active ?? []).length > 0;
  for (const s of schicksale) {
    for (const [mapId, map] of Object.entries(content.maps)) {
      for (const n of map.npcs ?? []) {
        const d = n.dialogue ?? content.npcs?.[n.id]?.dialogue;
        if ((s.dialoge ?? []).includes(d) && !ok(s, n.visible_if)) fehler.push({ wer: s.wer, wo: `${mapId}/${n.id}`, warum: `sichtbar ohne ${s.weg ? `hide_if ${s.weg}` : `requires ${s.nur}`}` });
      }
      for (const n of map.interactables ?? []) {
        if (n.kind === 'dialogue' && (s.dialoge ?? []).includes(n.dialogue) && !ok(s, n.visible_if)) fehler.push({ wer: s.wer, wo: `${mapId}/${n.id}`, warum: 'Gespräch ohne Schicksals-Bedingung' });
      }
    }
    if (s.post) for (const b of content.post?.briefe ?? []) {
      if (b.absender !== s.post) continue;
      const a = b.ausloeser ?? {};
      if (!has(a.hide_if_flags, s.weg ?? []) && !has(a.requires_flags, s.nur ?? [])) fehler.push({ wer: s.wer, wo: `post/${b.id}`, warum: `Brief kommt auch nach ${s.weg ?? 'dem Ende'}` });
    }
    if (s.gerede) for (const [stadt, orte] of Object.entries(content.gossip ?? {})) for (const [ort, zeilen] of Object.entries(orte)) {
      (zeilen ?? []).forEach((g, i) => {
        if (!s.gerede.test(g.text ?? '')) return;
        if (has(g.requires_flags, s.weg ?? []) || ok(s, g)) return; // Zeile handelt vom Ende selbst oder ist ausgeblendet
        if (has(g.requires_flags, ['case_07_closed', 'case_08_closed', 'kapitel1_done'])) fehler.push({ wer: s.wer, wo: `gerede/${stadt}/${ort}[${i}]`, warum: `„${g.text}“ nach dem Fall ohne ${s.weg}` });
        else if (!(g.requires_flags ?? []).length || (g.requires_flags ?? []).every((f) => /^fs_/.test(f))) fehler.push({ wer: s.wer, wo: `gerede/${stadt}/${ort}[${i}]`, warum: `„${g.text}“ jederzeit, auch nach ${s.weg}` });
      });
    }
  }
  return fehler;
}

/** Übersicht je Fall: Flags, die nur manche Enden setzen, und ihre Abfragen. */
export function endenUebersicht(content) {
  const refs = {};
  const walk = (o, path) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${path}[${i}]`));
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (/flags/.test(k) && !/^sets_/.test(k)) for (const f of Array.isArray(v) ? v : v?.of ?? []) if (typeof f === 'string') (refs[f] ??= []).push(`${path}.${k}`);
      walk(v, `${path}.${k}`);
    }
  };
  for (const [k, v] of Object.entries(content)) if (k !== 'endings') walk(v, k);
  const faelle = {};
  for (const [id, e] of Object.entries(content.endings)) (faelle[e.case] ??= []).push([id, new Set(e.sets_flags ?? [])]);
  return Object.entries(faelle).map(([fall, enden]) => {
    const alle = new Set(enden.flatMap(([, s]) => [...s]));
    const flags = [...alle].filter((f) => !enden.every(([, s]) => s.has(f))).map((f) => ({ flag: f, enden: enden.filter(([, s]) => s.has(f)).map(([id]) => id), abfragen: refs[f] ?? [] }));
    return { fall, enden: enden.map(([id]) => id), flags };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { loadContent } = await import('../tests/helpers.js');
  const content = loadContent();
  if (process.argv.includes('--enden')) {
    for (const f of endenUebersicht(content)) {
      console.log(`\n${f.fall}: ${f.enden.join(' ')}`);
      for (const x of f.flags) console.log(`  ${x.flag.padEnd(42)} ${String(x.abfragen.length).padStart(3)} Abfragen  (${x.enden.join(', ')})${x.abfragen.length ? '' : '  ← wird nie abgefragt'}`);
    }
  } else {
    const fehler = pruefeSchicksale(content);
    console.log(`Schicksals-Prüfung: ${fehler.length} Fehler`);
    for (const f of fehler) console.log(`  ${f.wer}\n    ${f.wo}: ${f.warum}`);
  }
}
