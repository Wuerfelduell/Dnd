/**
 * Paket Y: welche Soundeffekte wann spielen. Reine Zuordnung ohne Phaser, damit sie testbar bleibt;
 * abgespielt wird über core/Audio.js (eine Instanz für das ganze Spiel).
 */

/** Böden mit Schlick statt Gras. */
const MUD_THEMES = ['g_marsch', 'r_vergessmoor', 's_salzwatt'];

/** Schrittgeräusch für ein Kartenzeichen auf einem Tileset. */
export function footstepSound(theme = '', ch = '') {
  if (ch === '~') return 'schritt_wasser';
  if (ch === 'p') return 'schritt_schlick';
  if ('wO'.includes(ch) && ch) return 'schritt_holz';
  if (ch === 'P') return /^(r|s|w|q|v)_/.test(theme) || MUD_THEMES.includes(theme) ? 'schritt_holz' : 'schritt_pflaster';
  if (ch === 'g') return MUD_THEMES.includes(theme) ? 'schritt_schlick' : theme === 'g_kraterwald' ? 'schritt_gras' : theme === 'w_altstadt' ? 'schritt_pflaster' : 'schritt_gras';
  if (ch === 'C') return 'schritt_teppich';
  if (ch === 's' && theme === 'g_kraterwald') return 'schritt_kies';
  return 'schritt_pflaster';
}

/** Hintergrundgeräusch (Schleife) eines Ortes oder null. */
const ATMO_BY_MAP = {
  docks: 'atmo_hafen', wx_bojenhafen: 'atmo_hafen', wx_salzwatt: 'atmo_hafen', wx_leuchtturm: 'atmo_hafen',
  gaskanaele: 'atmo_kanal', wx_altstadt: 'atmo_kanal',
  tavern: 'atmo_taverne', wx_glocke: 'atmo_taverne', nachtmarkt: 'atmo_taverne',
  giesserei: 'atmo_fabrik', schlachthof: 'atmo_fabrik', wx_bahnhof: 'atmo_fabrik',
  resonanzkammer: 'atmo_kirche', crypt: 'atmo_kirche',
};
export function ambienceFor(mapId, map = {}) {
  if (ATMO_BY_MAP[mapId]) return ATMO_BY_MAP[mapId];
  if (MUD_THEMES.includes(map.tiles) || mapId === 'wx_torfstich' || mapId === 'wx_pfahldorf') return 'atmo_moor';
  return (map.ambient?.fog ?? 0) >= 0.25 ? 'atmo_wind_nebel' : null;
}

/** Spielereignis → Soundeffekt. Gibt die Id zurück (oder null, wenn nichts klingen soll). */
export function eventSound(event, data) {
  switch (event) {
    case 'clue': return 'ui_hinweis_neu';
    case 'conclusion': return 'ui_schlussfolgerung';
    case 'quest': return data?.status === 'active' ? 'ui_quest_neu' : data?.status === 'done' ? 'ui_quest_fertig' : null;
    case 'money': return data?.delta > 0 ? (data.delta >= 50 ? 'ui_geld_viel' : 'ui_geld') : null;
    case 'item': return data?.delta > 0 ? 'ui_item' : null;
    case 'ascend': return 'ui_stufe';
    case 'ritual': return 'ritual_start';
    case 'artifact': return data?.active ? 'artefakt_aufnehmen' : null;
    case 'digested': return 'trank_verdauen';
    case 'lostcontrol': return 'kontrolle_verlust';
    case 'vision': return data ? 'geistsicht_an' : 'geistsicht_aus';
    case 'wanted': return data?.delta > 0 ? (data.level >= 2 ? 'fahndung_hoch' : 'polizei_entdeckt') : data?.level === 0 && data?.delta < 0 ? 'polizei_verloren' : null;
    default: return null;
  }
}
export const SOUND_EVENTS = ['clue', 'conclusion', 'quest', 'money', 'item', 'ascend', 'ritual', 'artifact', 'digested', 'lostcontrol', 'vision', 'wanted'];

/** Hängt die Spielereignisse und Klicks in der Oberfläche an die Audio-Instanz. */
export function wireSounds(state, audio, uiRoot) {
  for (const ev of SOUND_EVENTS) {
    state.on(ev, (data) => {
      const id = eventSound(ev, data);
      if (id) audio.play(id);
    });
  }
  uiRoot?.addEventListener('click', (e) => {
    if (e.target.closest?.('button')) audio.play('ui_klick');
  });
}
