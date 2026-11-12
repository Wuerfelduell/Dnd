/**
 * Paket Y und CM: welche Soundeffekte wann spielen. Reine Zuordnung ohne Phaser, damit sie testbar bleibt;
 * abgespielt wird über core/Audio.js (eine Instanz für das ganze Spiel).
 */

/** Böden mit Schlick statt Gras. */
const MUD_THEMES = ['g_marsch', 'r_vergessmoor', 's_salzwatt'];
/** CM: Briarholt-Glashäuser (Metallgitter) und Calderwick-Terrassen (Kalkpflaster) haben eigene Schritte. */
const GLASS_THEMES = /^bh_(glas|palm|verkaufshalle|pavillon|mutterhaus|wurzel|labor|klinik)/;
const TERRACE_THEMES = /^cw_/;
const CHALK_THEMES = /^ds_(stadt|bruch|schlucht|bahn)/;

/**
 * Schrittgeräusch für ein Kartenzeichen auf einem Tileset.
 * `opts.season` (Clock.season) und `opts.outdoor` legen im Winter Schnee und im Herbst Laub über Gras und Erde (CM).
 */
export function footstepSound(theme = '', ch = '', opts = {}) {
  if (ch === '~') return 'schritt_wasser';
  if (ch === 'p') return 'schritt_schlick';
  if (opts.outdoor && opts.season === 'winter' && 'g.s'.includes(ch) && ch) return 'schritt_schnee';
  if (opts.outdoor && opts.season === 'herbst' && ch === 'g') return 'schritt_laub';
  if (/^ds_zug/.test(theme) && 'g.P'.includes(ch) && ch) return 'schritt_metall';
  if ('wO'.includes(ch) && ch) return 'schritt_holz';
  if (GLASS_THEMES.test(theme) && 'g.P'.includes(ch) && ch) return 'schritt_glas';
  if (TERRACE_THEMES.test(theme) && 'gP.'.includes(ch) && ch) return 'schritt_terrasse';
  if (CHALK_THEMES.test(theme) && 'g.s'.includes(ch) && ch) return 'schritt_kalk';
  if (ch === 'P') return /^(r|s|w|q|v)_/.test(theme) || MUD_THEMES.includes(theme) ? 'schritt_holz' : 'schritt_pflaster';
  if (ch === 'g') return MUD_THEMES.includes(theme) ? 'schritt_schlick' : theme === 'g_kraterwald' ? 'schritt_gras' : theme === 'w_altstadt' ? 'schritt_pflaster' : 'schritt_gras';
  if (ch === 'C') return 'schritt_teppich';
  if (ch === 's' && theme === 'g_kraterwald') return 'schritt_kies';
  return 'schritt_pflaster';
}

/** Hintergrundgeräusch (Schleife) eines Ortes oder null. */
const ATMO_BY_MAP = {
  docks: 'atmo_hafen', wx_bojenhafen: 'atmo_hafen', wx_salzwatt: 'atmo_hafen', wx_leuchtturm: 'leuchtfeuer',
  gaskanaele: 'atmo_kanal', wx_altstadt: 'atmo_kanal',
  tavern: 'atmo_taverne', wx_glocke: 'atmo_taverne', nachtmarkt: 'atmo_taverne',
  giesserei: 'atmo_fabrik', schlachthof: 'atmo_fabrik', wx_bahnhof: 'atmo_fabrik',
  resonanzkammer: 'atmo_kirche', crypt: 'atmo_kirche',
  // Paket Y: Ofen im Torfkahn, Regen auf dem Moorbahnsteig
  wx_torfkahn: 'atmo_feuer', wx_kahn: 'atmo_feuer', kahn: 'atmo_feuer',
  // CM: Calderwick (Rohrpost in Röhrenhof und Sortierhalle, Pressen in Setzerei und Buchbinderei), Briarholt (Glashäuser), Landstraße
  cw_roehrenhof: 'atmo_rohrpost', cw_sortierhalle: 'atmo_rohrpost', cw_sortiergrube: 'atmo_rohrpost', cw_alte_setzerei: 'cw_presse', cw_buchbinderei: 'cw_presse',
  bh_glasgaerten: 'atmo_glashaus', bh_verkaufshalle: 'atmo_glashaus', bh_pavillon: 'atmo_glashaus', bh_kaltes_palmhaus: 'atmo_glashaus', bh_mutterhaus: 'atmo_glashaus', bh_wurzelkammer: 'atmo_glashaus',
  reise_landstrasse: 'atmo_hochebene',
  // CM: offene Kalkflächen in Dunscar, Speisewagen mit Phonograph, Nachtzug
  ds_signalhang: 'atmo_hochebene', ds_bruchstufen: 'atmo_hochebene', ds_rangierwueste: 'atmo_hochebene', ds_rufschlucht: 'atmo_hochebene',
  ds_speisewagen: 'ds_wachswalze', ds_nachtzug_wagen: 'ds_zug_innen', ds_nachtzug_lok: 'zug_fahrt', ds_runddepot: 'ds_drehscheibe',
  // CM: Wurzelkammer flüstert, die Fasserin hämmert
  bh_wurzelkammer__warm: 'bh_pflanze_spricht',
};
/** Briarholt (CH): die kalten Außenkarten liegen unter Reif, die warmen Fassungen klingen wie ihre Glashäuser oder schweigen. */
const BH_FROST = ['bh_kutschenhof', 'bh_kesselgrund', 'bh_winterpromenade', 'bh_stillenhaeuser', 'bh_wurzelkranz', 'bh_verlassene_waescherei'];
export function ambienceFor(mapId, map = {}) {
  if (ATMO_BY_MAP[mapId]) return ATMO_BY_MAP[mapId];
  if (mapId.endsWith('__warm')) return ATMO_BY_MAP[mapId.slice(0, -6)] ?? null;
  if (BH_FROST.includes(mapId)) return 'atmo_frost';
  if (MUD_THEMES.includes(map.tiles) || mapId === 'wx_torfstich' || mapId === 'wx_pfahldorf') return 'atmo_moor';
  return (map.ambient?.fog ?? 0) >= 0.25 ? 'atmo_wind_nebel' : null;
}

/** CM: Festplätze (CK) mit Gemurmel, gesellige Festräume mit Lachen und Gläsern. */
const FEST_CROWD = ['altmarkt', 'docks', 'wx_salzmarkt', 'wx_bojenhafen', 'ds_kalkmarkt', 'ds_arbeiterbogen'];
const FEST_LAUGH = ['tavern', 'wx_glocke', 'ds_teesaal', 'nachtmarkt'];
/** Y: Nieselregen über Wexmoors Bahnsteig, Torfstich und Pfahldorf (WexmoorLife zeichnet ihn). */
const RAIN_MAPS = ['wx_bahnhof', 'wx_torfstich', 'wx_pfahldorf', 'wx_torfbrueche'];
/**
 * CM: zweite Schleife neben der Ortsatmo, für Wetter und Feste. ctx: { mapId, outdoor, season, fest, city }.
 * Nur eine Wetterlage zugleich; drinnen schweigt sie.
 */
export function weatherLoop({ mapId = '', outdoor = false, season = null, fest = null } = {}) {
  if (fest && FEST_CROWD.includes(mapId)) return 'fest_menge';
  if (fest && FEST_LAUGH.includes(mapId)) return 'fest_lachen';
  if (!outdoor) return null;
  if (RAIN_MAPS.includes(mapId)) return 'atmo_regen';
  if (season === 'winter') return 'saison_schnee';
  if (season === 'sommer' && /^(ds_|cw_)/.test(mapId)) return 'saison_hitze';
  if (season === 'fruehling' && /^wx_/.test(mapId)) return 'saison_regen';
  return null;
}

/** Y/CM: Zufallsklänge je Ort (Schlag alle `every` Sekunden ± Hälfte), damit Kettlegate, Moor und Hafen nicht nur aus Schleifen bestehen. */
export function randomSoundsFor(mapId, map = {}, { night = false, fest = null } = {}) {
  const out = [];
  // CM: Laternennacht und Schichtwechsel schießen nachts Feuerwerk über dem Festplatz (Start, dann drei Schläge)
  if (fest && night && /^(altmarkt|docks|ds_runddepot|ds_kalkmarkt)$/.test(mapId)) out.push({ id: 'fest_feuerwerk_start', every: 24, then: ['fest_feuerwerk_knall', 1300, 3] });
  if (/^bh_(kesselgrund|labor|verteilanlage)/.test(mapId)) out.push({ id: 'bh_dampf_austritt', every: 20 });
  const theme = map.tiles ?? '';
  const outdoor = !/^(b_|d_|r_|c_bahn|i_|ds_zug|ds_speise)/.test(theme) && !/keller|interieur|wohnung|buero|zimmer|kammer/.test(mapId);
  if (MUD_THEMES.includes(theme) || /moor|torf|pfahl|floss/.test(mapId)) out.push({ id: 'frosch', every: 14 });
  if (/kanal|gasse|keller|katakomb|crypt|kanalisation|sewer|pest/.test(mapId) || theme === 'u_katakomben') out.push({ id: 'ratte', every: 22 });
  if (/docks|hafen|watt|leuchtturm|kahn|bojen/.test(mapId)) out.push({ id: 'wasser_platsch', every: 18 }, { id: 'moewe', every: 11 });
  if (outdoor && /^(w_|q_|v_|g_)|altstadt|altmarkt|docks|ashgrove|revier/.test(theme + ' ' + mapId) && !/^(r_|s_|ds_|cw_|bh_)/.test(theme)) out.push({ id: 'glocke_fern', every: night ? 75 : 110 });
  if (outdoor && /^(ds_)/.test(theme)) out.push({ id: 'ds_kalk_rieseln', every: 25 }, { id: 'kraehe', every: 30 });
  if (/^bh_/.test(mapId) && !mapId.endsWith('__warm') && outdoor) out.push({ id: 'bh_reif', every: 40 });
  if (/^bh_(glas|kaltes_palm|verkaufs)/.test(mapId)) out.push({ id: 'bh_kondensat', every: 9 });
  if (/^cw_(roehrenhof|sortierhalle|villa)/.test(mapId)) out.push({ id: 'cw_rohrpost_ankunft', every: 35 });
  if (/^cw_(alte_setzerei|setzergasse)/.test(mapId)) out.push({ id: 'cw_letter_fall', every: 28 });
  if (/^ds_(signalhang|letzter_bahnsteig|endbahnhof|rangier)/.test(mapId)) out.push({ id: 'ds_zug_fern', every: 90 });
  if (/^ds_(bruchstufen|klopfbruch)/.test(mapId)) out.push({ id: 'ds_kalk_rieseln', every: 16 });
  return out;
}

/** Spielereignis → Soundeffekt. Gibt die Id zurück (oder null, wenn nichts klingen soll). */
export function eventSound(event, data) {
  switch (event) {
    case 'clue': return 'ui_hinweis_neu';
    case 'conclusion': return 'ui_schlussfolgerung';
    case 'quest': return data?.status === 'active' ? 'ui_quest_neu' : data?.status === 'done' ? 'ui_quest_fertig' : null;
    case 'money': return data?.delta > 0 ? (data.reason === 'lohn' ? 'ds_lohntuete' : data.delta >= 50 ? 'ui_geld_viel' : 'ui_geld') : null;
    case 'item': return data?.delta > 0 ? (data.rare ? 'ui_item_selten' : 'ui_item') : null;
    case 'ascend': return 'ui_stufe';
    case 'ritual': return 'ritual_start';
    case 'artifact': return data?.active ? 'artefakt_aufnehmen' : null;
    case 'digested': return 'trank_verdauen';
    case 'lostcontrol': return data?.corrupted?.length ? 'kontrolle_tentakel' : 'kontrolle_verlust';
    case 'vision': return data ? 'geistsicht_an' : 'geistsicht_aus';
    case 'wanted': return data?.delta > 0 ? (data.level >= 2 ? 'fahndung_hoch' : 'polizei_entdeckt') : data?.level === 0 && data?.delta < 0 ? 'polizei_verloren' : null;
    // CM: Ereignisse anderer Kernmodule (Jahreszeit, Zeitung, Beziehungen, Gefährten, Korruption, Treffen, Koop-Ansprüche, Zug)
    case 'season': return data?.fest ? 'ui_fest_banner' : 'saison_wechsel';
    case 'newspaper': return 'ui_zeitung';
    case 'relation': return data?.delta > 0 ? 'beziehung_hoch' : data?.delta < 0 ? 'beziehung_runter' : null;
    case 'bond': return data?.companion ? (data.delta > 0 ? 'beziehung_hoch' : data.delta < 0 ? 'beziehung_runter' : null) : null;
    case 'corrupted': return 'korruption_tick';
    case 'cleansed': return 'kontrolle_laeutersalz';
    case 'gathering': return data?.open ? 'geheimtreffen_glocke' : null;
    case 'claim': return 'koop_anspruch';
    case 'claim_forfeit': return 'koop_anspruch_streit';
    case 'signal_route': return data?.ok ? 'ds_ruf_senden' : data?.kind === 'alarm' || data?.kind === 'fallback' ? 'ds_ruf_falsch' : null;
    // Y/CM: Partei, Sekten, Enden, Unruhe, Rang, Zwei-Spieler-Ruf
    case 'party': return data?.joined ? 'koop_beitritt' : null;
    case 'signal_binding': return data?.ok !== false ? 'koop_rufen_zu_zweit' : null;
    case 'sekten': return sektenSound(data);
    case 'ending': return data?.honor >= 15 ? 'ui_ende_hell' : 'ui_ende_dunkel';
    case 'unruhe': return data?.rising ? 'artefakt_unruhe' : null;
    case 'rank': return data?.up ? 'ui_bestaetigen' : null;
    case 'fact': return data?.status ? flagSound(data.id) : null;
    default: return null;
  }
}
export const SOUND_EVENTS = ['clue', 'conclusion', 'quest', 'money', 'item', 'ascend', 'ritual', 'artifact', 'digested', 'lostcontrol', 'vision', 'wanted',
  'season', 'newspaper', 'relation', 'bond', 'corrupted', 'cleansed', 'gathering', 'claim', 'claim_forfeit', 'signal_route',
  'party', 'signal_binding', 'sekten', 'ending', 'unruhe', 'rank', 'fact'];

/** CM Gruppe 2: Sektenereignisse (core/Sekten.js) nach Kult und Art. */
export function sektenSound(data) {
  if (!data) return null;
  if (data.kind === 'stufe') return data.stufe > data.prev ? 'sk_stufe_hoch' : 'sk_stufe_runter';
  if (data.kind === 'ende') return data.ev?.art === 'schrein' ? 'sk_schrein_abbau' : data.ev?.art === 'abwerbung' ? 'sk_abgewoben' : null;
  if (data.kind !== 'start') return null;
  const art = data.ev?.art;
  const kult = data.ev?.kult ?? '';
  if (art === 'ueberfall') return 'sk_ueberfall';
  if (art === 'sabotage') return kult === 'sk_flut' ? 'sk_sabotage_brunnen' : 'sk_laternen_aus';
  if (art === 'werbung') return kult === 'sk_asche' ? 'sk_asche_werbung' : kult === 'sk_flut' ? 'sk_flut_taufe' : 'sk_chor_summen';
  if (art === 'zeichen_am_haus') return 'sk_kreidemund';
  if (art === 'spur') return kult === 'sk_asche' ? 'sk_asche_kreis' : kult === 'sk_flut' ? 'sk_flut_knoten' : 'sk_kreidemund';
  return null;
}

/** CM Gruppen 6 bis 8: Kapitel 4/5 arbeiten mit Flags (Ventile, Anker, Abgleiche); ein gesetztes Flag klingt. */
const FLAG_SOUNDS = [
  [/^bha_ventil_\w+_offen$/, 'bh_ventil_rast'],
  [/^bha_ventil_\w+_leer$/, 'bh_ruecklauf'],
  [/^bha_ventil_klappe/, 'bh_sperrklappe'],
  [/^bha_kapsel|_kapsel_/, 'bh_kapsel'],
  [/^bha_\w*(postkarte)/, 'bh_postkarte'],
  [/^bha_\w*(beschlag|scheibe)/, 'bh_scheibe_beschlag'],
  [/^bha_\w*(bluete|pflanze_offen|oeffnet)/, 'bh_pflanze_oeffnet'],
  [/^bha_\w*(entladung|druck_ab)/, 'bh_dampf_entladung'],
  [/^bha_\w*(kurplan|kurglocke|runde)/, 'bh_kurglocke'],
  [/^cwa_anker_/, 'cw_anker_setzen'],
  [/^cwa_abgleich\d_done$/, 'cw_abgleich_rueckweg'],
  [/^cwa_abgleich\d_(start|begonnen)$/, 'cw_abgleich_start'],
  [/^cwa_\w*(rohrpost)/, 'cw_rohrpost_senden'],
  [/^cwa_\w*(stempel|gestempelt|amt_)/, 'cw_stempel'],
  [/^cwa_\w*(aufzug|schraegaufzug)/, 'cw_aufzug_halt'],
  [/^cwa_\w*(tuerschild|schild_leer)/, 'cw_tuerschild_leer'],
  [/^ls_\w*(zoll)/, 'ls_zoll_schranke'],
  [/^ls_\w*(grenzstein)/, 'ls_grenzstein'],
  [/^ls_\w*(vermesser)/, 'ls_landvermesser_tick'],
  [/^ls_\w*(kutsche_halt|halt)/, 'ls_kutsche_halt'],
  [/^ls_/, 'ls_peitsche'],
  [/^k3h_\w*(schichtglocke|schicht_beginn)|^k3\w*_schichtglocke/, 'ds_schichtglocke'],
  [/^k3\w*(lohntuete|lohn_)/, 'ds_lohntuete'],
  [/^k3\w*(horchstelle|horch_an)/, 'ds_horchstelle_an'],
  [/^fs_\w*(laterne)/, 'fest_laterne_an'],
  [/^fs_\w*(kerzenboot)/, 'fest_kerzenboot'],
  [/^fs_\w*(drehorgel)/, 'fest_drehorgel_start'],
  [/^fs_\w*(boxring|boxkampf|box_)/, 'fest_boxring_gong'],
  [/^fs_\w*(feuerwerk)/, 'fest_feuerwerk_start'],
  [/^fs_\w*(prozession|kahn)/, 'fest_kahn_horn'],
  [/^fs_\w*(salzkranz|kranz)/, 'fest_salzkranz'],
  [/^(k1|c9)\w*(starling_phase2|stern_phase|verwandl)/, 'starling_verwandlung'],
];
export function flagSound(flag = '') {
  for (const [re, id] of FLAG_SOUNDS) if (re.test(flag)) return id;
  return null;
}

/** CM: feste Variante für Ventilzustände (1 = zu, 2 = kalt, 3 = warm) und Sterne (1 bis 8). */
export function variantFor(id, data) {
  if (id === 'bh_ventil_rast') return data?.status ? 3 : 1;
  return null;
}

/** Y: Oberfläche. Fenster (Ui.open) nach Art: Karten entfalten, Zeitung rascheln, Notizbuch blättern, sonst Papier. */
const UI_OPEN = { travel: 'ui_karte', personmap: 'ui_personen_karte', notebook: 'ui_seite', brew: 'ui_oeffnen', shop: 'ui_oeffnen', vault: 'ui_oeffnen', expert: 'ui_oeffnen',
  auction: 'ui_oeffnen', probe: 'ui_oeffnen', storage: 'schublade', pause: 'ui_oeffnen', casewall: 'ui_oeffnen', signal: 'ds_horchstelle_an', gift: 'ui_seite', ending: null, dialogue: null, message: null, combat: null, clue: null, loot: 'truhe_auf' };
export function uiSound(kind, what = 'open') {
  if (what === 'close') return 'ui_schliessen';
  if (what === 'tab') return 'ui_tab';
  if (what === 'page') return 'ui_seite';
  if (what === 'dialog') return 'ui_dialog_tick';
  if (what === 'error') return 'ui_fehler';
  if (what === 'ok') return 'ui_bestaetigen';
  if (what === 'save') return 'ui_speichern';
  if (what === 'write') return 'ui_schreiben';
  if (what === 'locked') return 'ui_tuer_gesperrt';
  if (what === 'chapter') return 'ui_kapitel';
  if (what === 'epilog') return 'ui_epilog';
  if (what === 'bestiary') return 'ui_bestiarium_neu';
  if (what === 'wegweiser') return 'notizbuch_wegweiser';
  if (what === 'scroll') return 'scroll_tick';
  if (what === 'season') return 'ui_saison_banner';
  if (what === 'heavy') return 'tragkraft_voll';
  if (what === 'hover') return 'ui_hover';
  return kind in UI_OPEN ? UI_OPEN[kind] : 'ui_oeffnen';
}

/** Y: Welt. Türen nach Ziel (Zelle und Wachhaus mit Gitter, Speisewagen mit Filztür), Ausruhen, Beute, Verkleidung. */
export function worldSound(action, data = {}) {
  switch (action) {
    case 'door': return /zelle|wachhaus|gefaengnis|tor$|gitter|katakomb|crypt/.test(data.to ?? '') ? 'tuer_metall' : data.to === 'ds_speisewagen' ? 'ds_schallschleuse'
      : data.to === 'cw_gleisfuss' || data.from === 'cw_gleisfuss' ? 'cw_schraegaufzug' : data.leaving ? 'tuer_zu' : 'tuer_auf';
    case 'travel': return data.direct ? (/^ds_/.test(data.to ?? '') ? 'ds_zug_einfahrt' : 'zug_pfeife') : data.mode === 'sicher' ? 'kutsche' : data.city === 'wexmoor' ? 'ruder' : null;
    case 'use': return data.id === 'verband' || /verband|binde/.test(data.id ?? '') ? 'verband' : null;
    case 'rest': return 'ruhe_schlaf';
    case 'loot': return 'truhe_auf';
    case 'storage': return 'schublade';
    case 'read': return 'ui_schreiben';
    case 'locked': return 'ui_tuer_gesperrt';
    case 'disguise': return 'verkleidung';
    case 'arrest': return 'zelle_zu';
    case 'spotted': return 'polizei_verdacht';
    case 'whistle': return 'polizei_pfeife';
    case 'lantern': return 'laterne_an';
    case 'train': return data.arrive ? 'ds_zug_einfahrt' : 'zug_pfeife';
    case 'brew': return data.ok ? 'trank_brauen' : 'ui_fehler';
    case 'ritual': return data.ok ? 'ritual_erfolg' : 'ritual_fehlschlag';
    case 'candle': return 'ritual_kerze';
    case 'gift': return data.ok ? 'geschenk_geben' : 'geschenk_falsch';
    case 'wear': return { hut: 'ausruestung_hut', mantel: 'ausruestung_mantel', amulett: 'ausruestung_amulett' }[data.slot] ?? 'verkleidung';
    case 'equip': return 'ausruestung_waffe';
    case 'bid': return data.ok ? 'auktion_gebot' : 'ui_fehler';
    case 'hammer': return 'auktion_hammer';
    case 'craft': return data.ok ? 'fasserin_fassung' : 'ui_fehler';
    case 'artisan': return 'fasserin_werkbank';
    default: return null;
  }
}

/** Y: Kampf. Gegner holt aus (Warnsignal), Kniffe, Fähigkeiten nach Pfad und Wirkung. */
const PATH_ATTACK = { laterne: 'licht_angriff', kessel: 'eis_salz', sq_moor: 'eis_salz', schluessel: 'glocke_angriff', sq_uhr: 'glocke_angriff', sq_waage: 'glocke_angriff',
  echo: 'geist_angriff', maske: 'geist_angriff', faden: 'geist_angriff', eisen: null };
export function skillSound(def = {}, pathwayId = '') {
  if (def.burn) return 'feuer';
  if (def.holy) return 'licht_angriff';
  if (def.stun || def.weaken || def.fear || def.slow || def.curse) return def.hits ? PATH_ATTACK[pathwayId] ?? 'geist_angriff' : 'debuff';
  if (!def.hits) return null; // Schutz, Heilung, Ruhe: Treffer-Effekt (heilen) klingt schon
  return PATH_ATTACK[pathwayId] ?? null;
}
export function combatSound(event, data = {}) {
  switch (event) {
    case 'telegraph': return 'ausholen';
    case 'act': return data.action === 'taunt' || data.action === 'drain' || data.action === 'veil' ? 'debuff' : data.action === 'heal' ? 'heilen' : null;
    // DS: Schwellenwächter rieselt Kalk, das Traumgeflecht spricht mit den Stimmen der fünf, die Laternenbestie ruft (Seq 5 schon beim Entzünden)
    case 'start': return /^hg_schwellenwaechter_/.test(data.id ?? '') ? 'hg_schwellenwaechter_kalk' : data.id === 'hg_traumgeflecht' ? 'hg_kreatur_stimme' : data.id === 'laternenbestie' ? null
      : /^enemy_sk_|^chorwaechter$|^reise_kultist$/.test(data.id ?? '') ? 'sk_ueberfall' : /^fs_boxer/.test(data.id ?? '') ? 'fest_boxring_gong'
      : /schlafkutsche/.test(data.id ?? '') ? 'ls_schlafkutsche' : data.id === 'starling_stern' ? 'starling_verwandlung' : data.boss ? 'boss_auftritt' : 'kampf_start';
    case 'hit': return /^fs_boxer/.test(data.id ?? '') && (data.kind === 'blunt' || data.kind === 'slash' || data.kind === 'critical') ? 'fest_boxring_treffer'
      : /^hg_schwellenwaechter_/.test(data.id ?? '') && (data.kind === 'blunt' || data.kind === 'critical') && data.who === 'player' ? 'hg_schwellenwaechter_schlag' : null; // DS: der Wächter trifft schwer
    case 'defeated': return /^hg_schwellenwaechter_/.test(data.id ?? '') ? 'hg_schwellenwaechter_zerfall' : data.id === 'laternenbestie' || data.id === 'kokonspinne' ? null // DS: Glas klingt aus bzw. Kokon platzt (Seq5.js)
      : /schichtgaenger/.test(data.sheet ?? data.id ?? '') ? 'ds_schichtgaenger_fall' : data.human ? 'gegner_tod' : 'geist_tod';
    case 'star': return 'starling_stern';
    case 'over': return data.id === 'starling_stern' && data.outcome === 'won' ? 'starling_ende' : { won: 'sieg', lost: 'niederlage', fled: 'flucht', escaped: 'flucht' }[data.outcome] ?? null;
    default: return null;
  }
}

/** Hängt die Spielereignisse und Klicks in der Oberfläche an die Audio-Instanz. */
export function wireSounds(state, audio, uiRoot, { cityOf = null } = {}) {
  let party = state.hasP2?.() ?? false;
  let unruhe = state.unruhe ?? 0;
  const enrich = (ev, data) => {
    if (ev === 'party') { const joined = !!data?.active && !party; party = !!data?.active; return { ...data, joined }; }
    if (ev === 'unruhe') { const rising = (data ?? 0) > unruhe + 0.5; unruhe = data ?? 0; return { rising }; }
    if (ev === 'ending') return { id: data, honor: state.content?.endings?.[data]?.honor ?? 0 };
    if (ev === 'item') { const it = state.item?.(data?.id); return { ...data, rare: !!(it && (it.kind === 'artifact' || it.rare || it.kind === 'core'))}; }
    if (ev === 'season') return { ...data, fest: !!(cityOf && state.festAktiv?.(cityOf(state.map))) };
    return data;
  };
  for (const ev of SOUND_EVENTS) {
    state.on(ev, (data) => {
      const d = enrich(ev, data);
      let id = eventSound(ev, d);
      if (!id) return;
      const later = (sid, ms, opts) => setTimeout(() => audio.play(sid, opts), ms);
      // CM: Folgeklänge – Antwort aus der Schlucht, Tentakel ziehen sich zurück, Ventilrad dreht vor dem Einrasten, dritter Anker verbindet
      if (id === 'ds_ruf_senden') later('ds_nachhall', 1300);
      if (id === 'kontrolle_tentakel') later('kontrolle_zurueck', 4500);
      if (id === 'cw_anker_setzen' && [...(state.flags ?? [])].filter((f) => /^cwa_anker_/.test(f)).length % 3 === 0) id = 'cw_anker_verbunden';
      if (id === 'bh_ventil_rast') { audio.play('bh_ventil_drehen'); later('bh_ventil_rast', 1400, { variant: variantFor(id, d) }); return; }
      const variant = ev === 'fact' ? variantFor(id, d) : null;
      audio.play(id, variant ? { variant } : {});
    });
  }
  // DS: Klänge aus den Kernmodulen (state.sfx), mit fester Variante, Verzögerung und Mindestabstand
  const last = new Map();
  state.on('sfx', ({ id, variant, delay, volume, throttle } = {}) => {
    if (!id) return;
    const t = Date.now();
    if (throttle && t - (last.get(id) ?? -Infinity) < throttle) return;
    last.set(id, t);
    const opts = { ...(variant ? { variant } : {}), ...(volume ? { volume } : {}) };
    if (delay) setTimeout(() => audio.play(id, opts), delay); else audio.play(id, opts);
  });
  state.on('seq4', (d) => {
    for (const [id, ms] of seq4ResultSounds(d)) (ms ? setTimeout(() => audio.play(id), ms) : audio.play(id));
  });
  uiRoot?.addEventListener('click', (e) => {
    if (e.target.closest?.('button')) audio.play('ui_klick');
  });
  // Y: leiser Hover-Ton nur auf echten Knöpfen in Fenstern (Maus, nicht Touch)
  uiRoot?.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'mouse' && e.target.closest?.('.panel button')) audio.play('ui_hover', { volume: 0.5 });
  });
}

// --- DS: Klänge der Rituale Seq 6 bis 4 (manifest-sfx4.json) ----------------------------------------------
// Die meisten Ids spielen die Kernmodule selbst über state.sfx(id, { variant, delay }) (Seq4.js, Seq5.js, Combat.js, Proben.js,
// Auction.js, Pathways.js); wireSounds reicht sie an Audio weiter. Hier stehen die Zuordnungen, die mehr als eine Id kennen.

/** Ereignis der Laternennacht (core/Laternenwacht.js) → Klang. */
export function laternenSound(ev = {}) {
  switch (ev.type) {
    case 'hit': return 's4la_rueckstoss';
    case 'kill': return 's4la_monster_zerfall';
    case 'scorch': return 's4la_monster_zischt';
    case 'lantern_attacked': return 's4la_laterne_angegriffen';
    case 'lantern_out': return 's4la_laterne_aus';
    case 'refill': return 's4la_nachfuellen_voll';
    case 'tired': return 's4la_nachfuellen_abbruch';
    case 'guardian': return 's4r_waechter_erscheint_welt';
    case 'sunrise': return 's4la_sonnenaufgang';
    case 'sunrise_fail': return 's4r_waechter_immun';
    default: return null;
  }
}

/** Fertigkeit unter Ritualregeln: Schattenattacke, die bloße Faust der Maske, sonst null (dann der Pfadklang). */
export function ritualSkillSound(skillId, sk = {}, rules = null) {
  if (sk?.shadow) return 'schatten_attacke';
  if (rules?.onlyAttack && skillId === 'attack') return 's4ma_faust';
  return null;
}

/** Ritual des Kessels: Wurfflasche → Druckstoß, Eis oder Glut. */
export function kesselWurfSound(id = '', it = {}) {
  const t = `${id} ${it?.name ?? ''}`.toLowerCase();
  if (/frost|eis|kalt|reif/.test(t)) return 's4ke_wurf_frost';
  if (it?.burn || /glut|feuer|brand|gift|aetz|ätz|schierling|säure|saeure/.test(t)) return 's4ke_wurf_glut';
  if (it?.damage || it?.stun) return 's4ke_wurf_explosion';
  return null;
}

/** Freies Brauen: Variante von sud_zutat (1 Pulver, 2 Kraut, 3 Flüssigkeit). */
export function sudZutatVariant(id = '', it = {}) {
  const t = `${id} ${it?.name ?? ''}`.toLowerCase();
  if (/staub|pulver|asche|salz|mehl|sand|kreide|kalk|glas/.test(t)) return 1;
  if (/tau|schleim|blut|wasser|oel|öl|saft|tinte|essenz|milch|sud|harz/.test(t)) return 3;
  return 2;
}

/** Ergebnis von brewSud → [[id, Verzögerung ms], …]: gelungen oder Pfusch, danach Abfüllen. */
export function sudSounds(r = {}) {
  if (!r.ok) return [];
  return [[r.recipe ? 'sud_gelungen' : 'sud_pfusch', 0], ['sud_abfuellen', 900]];
}

/** Gesperrter Knopf im Kampfmenü unter Ritualregeln → Klang des Verbots (oder null). */
export function ruleBlockSound(rules, act = {}) {
  if (!rules || !act) return null;
  if (act.type === 'skill' && rules.potionOnly) return 's4ke_angriff_verboten';
  if (act.type === 'skill' && rules.onlyAttack) return 's4ma_gabe_verboten';
  if (rules.noHeal && (act.type === 'item' || act.type === 'skill')) return rules.shadow ? 'schatten_heilung_versagt' : 's4fa_heilung_versagt';
  return null;
}

/** Ende einer Seq-4-Prüfung ({ kind, passed }) → Klänge [[id, ms], …]: Siegel oder Fehlschlag, dazu Schatten und Traum. */
export function seq4ResultSounds({ kind, passed } = {}) {
  const out = [[passed ? 'hg_ritual_siegel' : 'ritual_fehlschlag', passed ? 600 : 400]];
  if (kind === 'schluessel') out.unshift([passed ? 'schatten_rueckkehr' : 'schatten_verloren', 0]);
  if (kind === 'faden') out.unshift(['s4fa_erwachen', 0]);
  return out;
}

/**
 * Schleifen, die gerade laufen sollen: Ritualnacht und Unruhepuls (Laterne), Traum (Faden), Schattenluft (Schlüssel),
 * Brodeln am Braukessel (freies Brauen). ctx: { modal }.
 */
export function ritualLoops(state, { modal = null } = {}) {
  const out = [];
  const kind = state.seq4Kind?.();
  const st = kind ? state.seq4?.() ?? {} : {};
  if (kind === 'laterne' && st.siege) out.push('s4la_amb_nacht', 's4la_unruhe_puls');
  if (kind === 'faden' && st.dream) out.push('s4fa_traum_amb');
  if (state.shadowActive?.()) out.push('schatten_amb');
  if (modal === 'brew' && state.freeBrewUnlocked?.()) out.push('sud_brodeln_loop');
  return out;
}
export const RITUAL_LOOPS = ['s4la_amb_nacht', 's4la_unruhe_puls', 's4fa_traum_amb', 'schatten_amb', 'sud_brodeln_loop'];

/**
 * Alle halbe Sekunde aus main.js: Schleifen an- und abschalten, der Unruhepuls wird mit der Dauer der Laternennacht lauter,
 * Übergänge klingen einmal (Kessel-Rezepte offenbart, Sudwirkung vorbei), die Wartepause der Uhr tickt jede Sekunde.
 * Gibt den Merker zurück, den der nächste Aufruf braucht.
 */
export function updateRitualSounds(state, audio, memo = {}, { modal = null, now = Date.now() } = {}) {
  const want = new Set(ritualLoops(state, { modal }));
  for (const id of RITUAL_LOOPS) {
    if (want.has(id) && !memo.loops?.has(id)) audio.loop(id);
    if (!want.has(id) && memo.loops?.has(id)) audio.stopLoop(id, 400);
  }
  if (want.has('s4la_unruhe_puls')) {
    memo.siegeStart ??= now;
    audio.loopVolume?.('s4la_unruhe_puls', Math.min(1, 0.15 + (now - memo.siegeStart) / 240000));
  } else memo.siegeStart = null;
  memo.loops = want;
  const recipes = !!state.hgRecipesUnlocked?.();
  if (recipes && memo.recipes === false) audio.play('s4ke_rezept_frei');
  memo.recipes = recipes;
  const sud = !!state.activeSudBuff?.();
  if (!sud && memo.sud) audio.play('sud_wirkung_endet');
  memo.sud = sud;
  // Seq-5-Ritual der Uhr: in den 20-s-Pausen einmal je Sekunde ein einzelner Tick
  const st5 = state.seq5Kind?.() === 'uhr' ? state.seq5?.() ?? {} : {};
  const waiting = (st5.phase === 'wait1' || st5.phase === 'wait2') && Number.isFinite(st5.t) && now - st5.t < 20000;
  const sec = waiting ? Math.floor((now - st5.t) / 1000) : null;
  if (waiting && sec !== memo.tick) audio.play('s5_uhr_warten_tick');
  memo.tick = sec;
  return memo;
}
