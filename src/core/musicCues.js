/**
 * Paket Z/AY/CL: Ereignisstücke der Musikmanifeste (`zuordnung.ereignisse`), die keine Karte und kein Kampf auslöst.
 * Reine Zuordnung von Spielereignissen auf Stinger (einmalig, zeitlich begrenzt) und Lagen (Schleife, solange sie anhält);
 * angebunden über wireMusicCues(state, music). Testbar ohne Phaser.
 */

/** Ende → Ereignisstück. Kapitel 3 bis 5 haben eigene Schlussstücke, Kapitel 2 den Abspann, Fälle Dur oder Moll. */
export function endingCue(id = '', honor = 0) {
  const fixed = {
    k3_feierabend: 'feierabend', k3_stilllegung: 'stilllegung', k3_vollzaehlig: 'vollzaehlig', k3_gegenstimme: 'fall_geloest',
    cwa_widerspruch: 'cw_ende_widerspruch', cwa_amtsinhaber: 'cw_ende_amtsinhaber', cwa_buecher: 'cw_ende_buecher', cwa_ordnung: 'cw_ende_ordnung',
    bha_wahl: 'bh_ende_wahl', bha_winter: 'bh_ende_winter', bha_verwahrt: 'bh_ende_verwahrt', bha_schmerzlos: 'bh_ende_schmerzlos',
  };
  if (fixed[id]) return fixed[id];
  if (/^k2_/.test(id)) return 'abspann_k2';
  return honor >= 15 ? 'fall_geloest' : honor < 0 ? 'ende_dunkel' : null;
}

/** Erste Ankunft in einer Stadt (Kartenwechsel). */
export function arrivalCue(mapId = '', seenCities = new Set()) {
  const city = /^cw_/.test(mapId) ? 'calderwick' : /^bh_/.test(mapId) ? 'briarholt' : /^ds_/.test(mapId) ? 'dunscar' : null;
  if (!city || seenCities.has(city)) return null;
  seenCities.add(city);
  return { calderwick: 'cw_ankunft', briarholt: 'bh_ankunft', dunscar: 'ds_ankunft' }[city];
}

/** Gesetztes Flag → Ereignisstück (Spannung ohne Kampf in Kapitel 4/5) oder Ende eines solchen Stücks. */
export function flagCue(flag = '') {
  if (/^cwa_abgleich\d_(oeffentlich|vertraulich)$/.test(flag)) return { cue: 'cw_abgleich', seconds: 60 };
  if (/^cwa_abgleich\d_done$/.test(flag)) return { clear: 'cw_abgleich' };
  if (/^bha_ventil_\w+_offen$/.test(flag)) return { cue: 'bh_leitungen', seconds: 45 };
  return null;
}

/** Kampfende → Stinger (Bosssieg, Flucht, Starlings zweites Ende). */
export function combatCue(outcome, enc = {}) {
  if (outcome === 'fled' || outcome === 'escaped') return 'flucht';
  if (outcome === 'won' && (enc.boss || enc.elite)) return 'sieg';
  return null;
}

/**
 * Lage ohne Kampf: Horchstelle offen → horchen, Treffen/Auktion → treffen, gesucht im Freien einer Polizeistadt → streife.
 * ctx: { modal, auction, wanted, police, outdoor }
 */
export function modeFor({ modal = null, auction = false, wanted = 0, police = false, outdoor = false } = {}) {
  if (modal === 'signal') return 'horchen';
  if (auction) return 'treffen';
  if (wanted > 0 && police && outdoor) return 'streife';
  return null;
}

/** Hängt die Stinger an den Spielzustand. `music.cue(id, seconds)`/`music.clearCue(id)` wie in MusicDirector. */
export function wireMusicCues(state, music) {
  const seen = new Set();
  let season = state.season?.() ?? null;
  state.on('ending', (id) => music.cue(endingCue(id, state.content?.endings?.[id]?.honor ?? 0)));
  state.on('travel', (mapId) => { const c = arrivalCue(mapId, seen); if (c) music.cue(c, 40); });
  state.on('fact', ({ id, status }) => {
    if (!status) return;
    const c = flagCue(id);
    if (c?.cue) music.cue(c.cue, c.seconds); else if (c?.clear) music.clearCue(c.clear);
  });
  state.on('ritual', () => music.cue('ritual', 25));
  state.on('season', (d) => {
    if (d?.season && d.season !== season) { season = d.season; music.cue(`saison_${d.season}`); }
  });
  return seen;
}
