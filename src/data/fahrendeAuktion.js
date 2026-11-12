// Codex DE: Die Fahrende Auktion von Perpetua Vance (Seb, 2026-11-12: „alle restlichen Codex-Sachen einbauen“).
// Vereinfachter Einbau: Weil es kein Zurück in alte Städte gibt, hält der Wagen dort, wo man gerade ist
// (Salzmarkt in Wexmoor, Kalkmarkt in Dunscar): 2 Spieltage Halt, 3 Spieltage Pause (core/FahrendeAuktion.js).
// Die Runde läuft über die vorhandene Treffen-Auktion (core/Auction.js): Vance, ihr Träger und die drei
// Mitbieter rufen je ein Los aus, danach darf man selbst etwas versteigern (statt Einlieferung).
// Kein Zirkel, keine Bürgen: wer Vance einmal angesprochen hat, darf bieten. Calderwick und später bleiben draußen.
export const FA2_FILES = ['vance', 'bieter', 'lose', 'gerede', 'lesestuecke', 'zeitung'];
export const FA2_CITIES = { wexmoor: { map: 'wx_salzmarkt', circle: 'fa2_wexmoor' }, dunscar: { map: 'ds_kalkmarkt', circle: 'fa2_dunscar' } };
export const FA2_FIGUREN = ['fa2_vance', 'fa2_traeger', 'fa2_bieter_reeder', 'fa2_bieter_witwe', 'fa2_bieter_zirkel'];
/** Preisfaktor je Stadt: die Kataloge sind auf Kettlegate-Preise geschrieben. */
const PREIS = { wexmoor: 4, dunscar: 12 };
/** Kuriositäten: Wirkung ×6, damit sie in Wexmoor/Dunscar spürbar sind. */
const WIRKUNG = 6;

const FIG = { coat: '#4a3a4a', hat: '#2a2026', skin: '#d1a888', hair: '#3a2a26', legs: '#2a2026' };

export function fahrendeAuktionPack({ vance, bieter, lose, gerede, lesestuecke, zeitung }) {
  const items = {};
  for (const l of lose.neue_lose) {
    const eff = Object.fromEntries(Object.entries(l.wirkung_vorschlag.effects).map(([k, v]) => [k, v * WIRKUNG]));
    const wirkt = Object.entries(eff).map(([k, v]) => `${k === 'heal' ? `+${v} Leben` : k === 'composure' ? `+${v} Nerven` : `−${v} Unruhe`}`).join(', ');
    items[l.id] = { name: l.name, kind: 'consumable', weight: l.gewicht, price: l.wert * PREIS.wexmoor, desc: `${l.beschreibung} Einmal benutzbar: ${wirkt}.`, ...eff };
  }
  const B = Object.fromEntries(bieter.bieter.map((b) => [b.id, b]));
  const npcs = {
    fa2_vance: { name: vance.name, role: 'Fahrende Auktionatorin', palette: { ...FIG, coat: '#5a2a3a' } },
    fa2_traeger: { name: 'Der stumme Träger', role: 'Trägt die Lose', palette: { ...FIG, coat: '#3a3a2a' } },
    ...Object.fromEntries(bieter.bieter.map((b) => [b.id, { name: b.name, role: 'Mitbieter', palette: FIG }])),
  };
  const circles = {};
  const dialogues = {};
  for (const [city, c] of Object.entries(FA2_CITIES)) {
    const f = PREIS[city];
    const katalog = lose.staedte[city].map((l) => ({ item: l.item, price: Math.max(90, l.wert * f), chance: 0.5 }));
    const neu = lose.neue_lose.map((l) => ({ item: l.id, price: Math.max(90, l.wert * f), chance: 0.35 }));
    const verteilt = (i) => [...katalog, ...neu].filter((_, k) => k % 5 === i);
    circles[c.circle] = {
      name: 'Die Fahrende Auktion', short: `Perpetua Vances Wagen am ${city === 'wexmoor' ? 'Salzmarkt' : 'Kalkmarkt'}`, city, fahrend: true,
      member_flag: 'fa2_kontakt', host: 'fa2_vance', map: c.map,
      invite: 'Perpetua Vances Wagen steht für zwei Spieltage auf dem Markt.',
      members: FA2_FIGUREN.map((id, i) => ({ id, offers: verteilt(i), wants: [] })),
    };
  }
  const greet = (city) => vance.begruessung[city][0];
  const say = (id) => B[id]?.charakter ?? '';
  for (const [city, c] of Object.entries(FA2_CITIES)) {
    dialogues[`fa2_vance_${city}`] = { start: 'start', nodes: {
      start: { text: `${greet(city)}\n\nPerpetua Vance klopft mit dem Hammer auf das Pult. Fünf Lose, dann dürfen Sie selbst etwas ausrufen lassen. Ihr Hund liegt unter dem Wagen und hebt den Kopf, sobald jemand bietet.`,
        sets_flags: ['fa2_kontakt'],
        choices: [{ text: 'Mitbieten.', auction: c.circle }, { text: 'Wann kommt der Wagen wieder?', next: 'plan' }, { text: 'Die Hausordnung lesen.', next: 'ordnung' }, { text: 'Auf Wiedersehen.', next: 'ade' }] },
      plan: { text: '„Zwei Tage Halt, drei Tage Weg. Wir fahren, wohin die Kundschaft fährt. Wo Sie sind, sind wir bald.“', choices: [{ text: 'Gut.', next: 'start' }] },
      ordnung: { text: lesestuecke.find((l) => l.id === 'fa2_hausordnung')?.text ?? '', choices: [{ text: 'Verstanden.', next: 'start' }] },
      ade: { text: vance.abschied[0], choices: [{ text: 'Auf Wiedersehen.' }] },
    } };
  }
  for (const id of FA2_FIGUREN.slice(1)) {
    dialogues[id] = { start: 'start', nodes: { start: { text: id === 'fa2_traeger' ? 'Der Träger stellt eine Kiste ab, nickt zum Pult hinüber und sagt nichts.' : say(id), choices: [{ text: 'Auf Wiedersehen.' }] } } };
    npcs[id].dialogue = id;
  }
  // Gerede nur nach dem ersten Kontakt, in beiden Städten am Markt
  const lines = gerede.filter((g) => !/Verk|einliefer/i.test(g.text)).map((g) => ({ text: g.text, requires_flags: ['fa2_kontakt'] }));
  return {
    name: 'fahrende_auktion', items, npcs, dialogues,
    gerede: { wexmoor: { wx_salzmarkt: lines.slice(0, 10) }, dunscar: { ds_kalkmarkt: lines.slice(10, 20) } },
    zeitung: zeitung.filter((z) => !z.text.includes('{')).slice(0, 4).map((z) => ({ id: z.id, title: z.title, text: z.text, requires_flags: ['fa2_kontakt'] })),
    fa2Circles: circles,
  };
}

/** Vance und Wagen auf den Märkten; sichtbar nur während eines Halts (Flag fa2_halt). */
export function applyFahrendeAuktion(content) {
  for (const [city, c] of Object.entries(FA2_CITIES)) {
    const m = content.maps[c.map];
    if (!m || !content.npcs.fa2_vance) continue;
    const base = m.spawns?.default ?? Object.values(m.spawns ?? {})[0] ?? [5, 5];
    const taken = new Set([...(m.npcs ?? []), ...(m.interactables ?? [])].filter((o) => o.tile).map((o) => `${o.tile[0]},${o.tile[1]}`));
    const free = (x, y) => !taken.has(`${x},${y}`) && /[.swg,]/.test(m.rows?.[y]?.[x] ?? '');
    let spot = null;
    for (let r = 2; r < 9 && !spot; r++) for (let dx = -r; dx <= r && !spot; dx++) for (const dy of [-r, r]) if (!spot && free(base[0] + dx, base[1] + dy) && free(base[0] + dx + 1, base[1] + dy) && free(base[0] + dx - 1, base[1] + dy)) spot = [base[0] + dx, base[1] + dy];
    if (!spot) continue;
    const vis = { requires_flags: ['fa2_halt'] };
    m.npcs.push({ id: 'fa2_vance', tile: spot, dialogue: `fa2_vance_${city}`, visible_if: vis });
    m.npcs.push({ id: 'fa2_traeger', tile: [spot[0] + 1, spot[1]], visible_if: vis });
  }
  return content;
}
