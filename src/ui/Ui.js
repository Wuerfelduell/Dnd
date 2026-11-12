import { NEWSPAPERS } from '../data/lore.js';
import { uiSound, worldSound, sudZutatVariant, sudSounds, ruleBlockSound } from '../core/sounds.js';
import { FESTE } from '../core/Clock.js';
import { DIGEST_LABELS, digestSlowdown, fmtDigest, FORM_SEQ, FORM_MIN_DIGEST, FORM_NERVES_PER_SEC, FORM_UNRUHE_PER_SEC, FORM_MIN_NERVES } from '../core/Pathways.js';
import { buffLabel, fmtSec } from '../core/Talents.js';
import { PROBE_FAIL } from '../core/Proben.js';
import { FAIL_PCT, FAIL_UNRUHE, LATERNEN, LAMPENOEL, KOKON_FAEDEN, SUD_MIN_SEC } from '../core/Seq5.js';
import { SPINNENFADEN } from '../data/seq5.js';
import { SUD_MAX_ZUTATEN, LEERES_GEFAESS, sudEffectText } from '../data/sude.js';
import { CARRY_PER_STEP } from '../core/GameState.js';
import { GEAR_SLOT_NAMES } from '../core/Gear.js';
import { isPrecise } from '../core/Combat.js';
import { lootList, itemRarity, RARITY_NAMES, lootPreview, chanceWord } from '../core/Loot.js';
import {
  itemIconUrl, itemIcon32Url, pathwayEmblemUrl, pathwayCardUrl, COIN_URL, moneyIconUrl, UI_SKINS, UI_SHEETS, UI_REGIONS, DAMAGE_FONT, STATUS_ICONS, STATUS_ICONS_URL,
  portraitUrl, portraitFor, AK_FIGURES, P2_LOOKS, P2_CHOICE_URL, p2HeadUrl, p2PortraitUrl, KOOP2_TRENNUNG_URL, festBannerUrl, mapMarkerOf, LOG_MARKERS, LOG_MARKERS_URL, SOURCE_ICONS, SPRITE_BASE,
  endingImageUrl, caseFileUrl, sceneUrl, wantedUrl, wantedSingle, QUEST_UI_URL, QUEST_PINS, QUEST_BANNERS,
  TURN_PORTRAITS, TURN_PORTRAITS_URL, TURN_PORTRAIT_URLS, BESTIARY, bestiaryUrl, TITLE_LAYERS,
  headUrl, ritualCardUrl, ZIRKEL_URL, ZIRKEL_ICONS, AUKTION_URL, AUKTION_REGIONS, LONER_UI_URL, LONER_UI, LONER_SEALS, S_ZIRKEL_URL, S_ZIRKEL, skillIconOf, talentIconOf, PULSE_ICONS, ARTIFACT_UI_URL, sourceKind, sourceKindUrl, inspectUrl, RISK_ICONS, RISK_ICONS_URL, JOURNAL_FRAME, JOURNAL_FRAME_URL, choiceRisk, riskOf,
  factionEmblemUrl, PLACE_PICTURES, TRAVEL_MODES_URL, TRAVEL_MODE_ICONS, TRAVEL_MARKER_URL,
  DANGER_URL, DANGER_ICONS, DANGER_BANNER, RARITY_SHEET, RARITY_SHEET_URL, RARITY_GEMS,
} from '../world/assets.js';
import { sourceOf } from '../core/sources.js';
import { openGuesses, gapText, knowledgeGaps, onlyKnowledgeMissing } from '../core/hints.js';
import { guessMood } from '../core/Moods.js';
import { MOOD_LABEL, GIFT_KINDS } from '../core/Relations.js';
import { koopGreeting } from '../core/Koop.js';
import { STATION_NAMES, DIRECTION_NAMES } from '../data/k3Ruf.js';
import { isSolved, knownPeople, journalQuestVisible } from '../core/journal.js';
import { canHurry, hurryCost, travelSafe, travelFast, afterHurryFight, travelDestinations, cityOf } from '../core/Travel.js';
import { questTarget, leadTarget, personPlaces, advice } from '../core/Guide.js';

/** 16x16-Icon vor einem Item-Namen. Lädt es nicht, verschwindet es einfach. */
const itemIcon = (id) => (PULSE_ICONS[id] ? `<span class="item-icon pulse" style="background-image:url(${PULSE_ICONS[id]})"></span>` : `<img class="item-icon" src="${itemIconUrl(id)}" alt="" width="16" height="16" onerror="this.remove()">`);
/** Größeres Icon (Tränke in 32px, sonst das 16er doppelt). */
const itemIconBig = (id) => `<img class="item-icon big" src="${itemIcon32Url(id) ?? itemIconUrl(id)}" alt="" width="32" height="32" onerror="this.remove()">`;
/** Vor- und Nachteile eines Artefakts als kleine Liste. */
/** Rate pro Sekunde lesbar (0.12 → „0,12“). */
const fmtRate = (v) => String(Math.round(v * 100) / 100).replace('.', ',');
/** Korruption eines Stücks: wie oft getroffen, was es gerade kostet. */
const corruptionHtml = (s, id) => {
  const r = s.corruptionRules();
  const n = s.corrupted?.[id] ?? 1;
  const using = s.corruptedInUse().includes(id);
  return `<span class="arteffects"><span class="curse"><i class="artmark minus"></i>Korrumpiert${n > 1 ? ` (${n}×)` : ''}: ${using ? `kostet gerade ${fmtRate(r.hp_per_sec)} Leben und ${fmtRate(r.nerves_per_sec)} Nerven pro Sekunde` : 'ruht, solange du es nicht trägst'}</span></span>`;
};
const artifactEffectsHtml = (it) => `<span class="arteffects">${(it.boons ?? []).map((x) => `<span class="boon"><i class="artmark plus"></i>${esc(x.text)}</span>`).join('')}${(it.curses ?? []).map((x) => `<span class="curse"><i class="artmark minus"></i>${esc(x.text)}</span>`).join('')}</span>`;
/**
 * Was ein Angebot taugt, bevor man zahlt (Treffen, Läden, Fasserin): Segen und Flüche von Artefakten
 * und Kleidung, Pfad und Sequenz von Formeln, Angriff von Waffen (core/Auction.js offerInfo).
 */
const offerHtml = (s, id) => {
  const it = s.item(id);
  const info = s.offerInfo?.(id);
  if (!it || !info) return '';
  const slot = it.kind === 'gear' ? `<span class="muted">${GEAR_SLOT_NAMES[it.slot]}</span>` : '';
  const notes = info.notes.map((t) => `<span class="muted note">${esc(t)}</span>`).join('');
  const effects = info.boons.length || info.curses.length ? artifactEffectsHtml(it) : '';
  return slot || notes || effects ? `<span class="offerinfo">${slot}${notes}${effects}</span>` : '';
};
/** Ausrüstung (F_07): Figur mit vier Plätzen; ein Klick auf ein angelegtes Stück legt es ab. Plätze in Pixeln des Bogens. */
const DOLL_SLOTS = [['hut', 69, 4], ['amulett', 69, 30], ['mantel', 69, 55], ['waffe', 73, 82]];
const paperDoll = (s) => {
  const k = 1 / 8;
  const slots = DOLL_SLOTS.map(([slot, x, y]) => {
    const id = slot === 'waffe' ? s.weapon : s.gear?.[slot];
    const it = id && s.itemCount(id) ? s.item(id) : null;
    const tip = it ? `${it.name}${(it.boons ?? []).map((b) => ` · ${b.text}`).join('')}${it.atk ? ` · Angriff ${it.atk}` : ''}` : `${GEAR_SLOT_NAMES[slot]}: leer`;
    const inner = it ? `<img src="${itemIcon32Url(id) ?? itemIconUrl(id)}" alt="">` : '';
    const attr = it && slot !== 'waffe' ? ` data-takeoff="${slot}"` : it && s.isCorrupted(id) ? ` data-unequip="${id}"` : '';
    return `<button class="dollslot${it ? ' filled' : ''}${it && s.isCorrupted(id) ? ' tainted' : ''}"${attr} title="${esc(tip)}" style="left:${x * k}em;top:${y * k}em;width:${20 * k}em;height:${20 * k}em">${inner}</button>`;
  }).join('');
  const worn = [...DOLL_SLOTS.map(([slot]) => slot).filter((x) => x !== 'waffe').map((slot) => s.gear?.[slot]).filter((id) => id && s.itemCount(id))];
  const list = worn.length ? worn.map((id) => `<li>${itemIcon(id)}<strong>${esc(s.item(id).name)}</strong>${artifactEffectsHtml(s.item(id))}</li>`).join('') : '<li class="muted">Noch nichts angelegt. Hüte, Mäntel und Amulette wirken nur, solange du sie trägst.</li>';
  return `<div class="paperdoll"><div class="doll">${uiSprite('equip', 'doll', k)}${slots}</div><ul class="worn">${list}</ul></div>`;
};
const emblem = (pid, size = 16) => `<img class="emblem" src="${pathwayEmblemUrl(pid, size)}" alt="" width="${size}" height="${size}" onerror="this.remove()">`;
/** 16x16-Zelle aus einem Icon-Atlas (Fähigkeiten: 7 Spalten, Zustände: 12 Spalten). */
const atlasIcon = (url, index, cols, title = '') => (index === undefined ? ''
  : `<span class="atlas-icon" title="${title}" style="background-image:url(${url});background-position:-${(index % cols) * 16}px -${Math.floor(index / cols) * 16}px"></span>`);
/** Ausschnitt aus dem Auktions-Atlas (Paket T, 128x64), k = em pro Pixel. */
const auktionIcon = (name, cls = '', k = 1 / 8) => {
  const r = AUKTION_REGIONS[name];
  if (!r) return '';
  const [x, y, w, h] = r;
  return `<span class="auk ${cls}" style="width:${w * k}em;height:${h * k}em;background-image:url(${AUKTION_URL});background-size:${128 * k}em ${64 * k}em;background-position:-${x * k}em -${y * k}em"></span>`;
};
/** Ausschnitt [x, y, w, h] aus einem Atlas der Größe sw x sh, k = em pro Pixel. */
const regionIcon = (url, [x, y, w, h], sw, sh, cls = '', k = 1 / 8, title = '') => `<span class="auk ${cls}" title="${title}" style="width:${w * k}em;height:${h * k}em;background-image:url(${url});background-size:${sw * k}em ${sh * k}em;background-position:-${x * k}em -${y * k}em"></span>`;
/** Paket S: Beziehung zu einem Einzelgänger (Abzeichen, Pfadsiegel, Leiste von Feind bis Freund, Sequenz-Punkte). */
const lonerBar = (s, id) => {
  const l = s.loner?.(id);
  if (!l) return '';
  const r = s.lonerRules();
  const v = s.bond(id);
  const st = s.bondStatus(id);
  const badge = st === 'freund' ? 'ally' : st === 'feind' ? 'enemy' : v >= 2 ? 'friend' : v <= -1 ? 'wary' : 'neutral';
  const label = { ally: 'Verbündet', enemy: 'Feind', friend: 'Freundlich', wary: 'Misstrauisch', neutral: 'Neutral' }[badge];
  const k = 1 / 6;
  const pos = (v - r.foe_at) / (r.friend_at - r.foe_at); // 0 = Feind, 1 = Freund
  const fill = v < 0 ? `<span class="lfill neg" style="left:${pos * 64 * k}em;width:${(0.5 - pos) * 64 * k}em">${regionIcon(LONER_UI_URL, LONER_UI.enemy_fill, 128, 96, '', k)}</span>`
    : v > 0 ? `<span class="lfill pos" style="left:${32 * k}em;width:${(pos - 0.5) * 64 * k}em">${regionIcon(LONER_UI_URL, LONER_UI.friend_fill, 128, 96, '', k)}</span>` : '';
  const seal = LONER_SEALS[l.pathway] ? regionIcon(LONER_UI_URL, [...LONER_SEALS[l.pathway], 8, 8], 128, 96, 'seal', k, l.pathway) : '';
  const pips = Array.from({ length: 4 }, (_, i) => regionIcon(LONER_UI_URL, i < Math.max(0, 9 - l.seq) - 1 ? LONER_UI.pip_filled : LONER_UI.pip_empty, 128, 96, 'pip', k)).join('');
  return `<div class="lonerbar" title="${label} (${v > 0 ? '+' : ''}${v})">${regionIcon(LONER_UI_URL, LONER_UI[badge], 128, 96, 'badge', k, label)}${seal}
    <span class="lbar">${fill}${regionIcon(LONER_UI_URL, LONER_UI.bar, 128, 96, 'frame', k)}<span class="needle" style="left:${(pos * 64 - 2) * k}em">${regionIcon(LONER_UI_URL, LONER_UI.needle, 128, 96, '', k)}</span></span>
    <span class="pips" title="Sequenz ${l.seq}">${pips}</span><span class="lstate">${label}</span></div>`;
};
/** Stimmung eines Einzelgängers ohne eigene Knoten-Stimmung: freundlich als Freund, feindselig als Feind oder bei Misstrauen. */
const lonerMood = (s, id) => {
  if (!s.loner?.(id)) return undefined;
  const st = s.bondStatus(id);
  return st === 'freund' ? 'friendly' : st === 'feind' || s.bond(id) < 0 ? 'hostile' : s.bond(id) >= 2 ? 'friendly' : undefined;
};
/** Beziehung: Gesicht je Stimmung, wenn der Knoten keine eigene hat (freundlich lächelt, feindselig misstraut bzw. zürnt). */
const relationMood = (s, id) => {
  if (!s.content.npcs?.[id] || s.loner?.(id)) return undefined;
  const m = s.mood(id);
  return m === 'freundlich' ? 'smile' : m === 'feindselig' ? (AK_FIGURES.has(id) ? 'angry' : 'suspicious') : undefined;
};
/** Beziehung: Abzeichen (freundlich, neutral, feindselig) mit Wert neben dem Namen; Einzelgänger haben ihre eigene Leiste. */
const relationBadge = (s, id, withLabel = true) => {
  if (!s.content.npcs?.[id] || s.loner?.(id)) return '';
  const m = s.mood(id);
  const v = s.relation(id);
  const icon = { freundlich: 'friend', neutral: 'neutral', feindselig: 'wary' }[m];
  const title = `${MOOD_LABEL[m]} (${v > 0 ? '+' : ''}${v})`;
  return `<span class="relbadge ${m}" title="${title}">${regionIcon(LONER_UI_URL, LONER_UI[icon], 128, 96, 'badge', 1 / 8, title)}${withLabel ? `<span class="rellabel">${MOOD_LABEL[m]}</span>` : ''}</span>`;
};
/** Zug-Portrait (16x16, Paket F) neben den Namen im Kampf. */
const turnFace = (id) => {
  if (TURN_PORTRAITS[id] === undefined) return '';
  const [url, cols] = TURN_PORTRAIT_URLS[id] ?? [TURN_PORTRAITS_URL, 19];
  return `<span class="turnface" style="background-image:url(${url});background-size:${cols * 2}em 2em;background-position:-${TURN_PORTRAITS[id] * 2}em 0"></span>`;
};
const BASE_SKILL_IDS = ['double', 'blind', 'ward'];
/** Icon-Größe der Kampf-Kacheln in em (1em = 8 Spielpixel). */
const TILE_ICON_EM = 1.75;
const skillIcon = (id) => { const ic = skillIconOf(id); return ic ? atlasIcon(ic[0], ic[1], ic[2] ?? 7) : ''; };
/** Icon einer Welt-Fähigkeit (BZ: ui/talent_icons.png), sonst das Sonnenzeichen. */
const talentIcon = (id) => { const ic = talentIconOf(id); return ic ? atlasIcon(ic[0], ic[1], ic[2]) : '☉ '; };
/** Welt-Fähigkeit in der Schnellleiste: 16er-Zelle auf 1.75em, sonst das Sonnenzeichen. */
const talentIconHud = (id) => {
  const ic = talentIconOf(id);
  if (!ic) return '<span class="ticon sun">☉</span>';
  const [url, index, cols] = ic;
  const k = TILE_ICON_EM;
  return `<span class="atlas-icon big ticon" style="background-image:url(${url});background-size:${cols * k}em auto;background-position:-${(index % cols) * k}em -${Math.floor(index / cols) * k}em"></span>`;
};
/** Großes Fähigkeits-Icon fürs Kampfmenü: 16er-Zelle auf 1.75em (skaliert mit der Oberfläche, nicht in festen Pixeln). */
const skillIconBig = (id) => {
  const ic = skillIconOf(id);
  // Grundfertigkeiten ohne eigenes Bild leihen sich die Menüsymbole
  if (!ic) return uiSprite('bmenu', id === 'double' ? 'attack' : BASE_SKILL_IDS.includes(id) ? 'skill' : 'defend', TILE_ICON_EM / 16, 'cbicon big');
  const [url, index, cols = 7] = ic;
  const k = TILE_ICON_EM;
  return `<span class="atlas-icon big" style="background-image:url(${url});background-size:${cols * k}em auto;background-position:-${(index % cols) * k}em -${Math.floor(index / cols) * k}em"></span>`;
};
/** Artefakt-Slots (20x20 aus ui/N_artefakt_ui.png), mitgeführte mit Icon in der Öffnung. */
const artifactSlots = (ids, max, overloaded) => Array.from({ length: Math.max(max, ids.length) }, (_, i) => {
  const id = ids[i];
  const kind = !id ? 'empty' : overloaded ? 'overloaded' : 'equipped';
  return `<span class="artslot ${kind}">${id ? `<img src="${itemIconUrl(id)}" alt="" width="12" height="12">` : ''}</span>`;
}).join('');
const statusIcon = (id, title) => atlasIcon(STATUS_ICONS_URL, STATUS_ICONS[id], 12, title);
/** Portrait (64x64 aus einem 256x64-Streifen) für den Dialog. */
const portrait = (id, mood) => {
  const p = portraitFor(id, mood);
  if (!p) return '';
  return `<div class="portrait" style="background-image:url(${p.url});background-position:${(p.col / 3) * 100}% 0"></div>`;
};
/** Zwischensequenzbild (240x135) über einem Text. */
/** Steckbrief (Paket L): 64x80, Spalte 0 gesucht, Spalte 1 gefasst. */
const wantedImg = (id, caught) => (id ? `<div class="wanted ${caught ? 'caught' : ''}${wantedSingle(id) ? ' single' : ''}" style="background-image:url('${wantedUrl(id)}')"></div>` : '');
const sceneImg = (id) => { const url = id && sceneUrl(id); return url ? `<img class="scene" src="${url}" alt="" onerror="this.remove()">` : ''; };
/** Paket AE: Die Karte zu Kapitel 1 hat unten ein leeres Band für den Kapitelnamen. */
const CHAPTER_CAPTIONS = { kapitel1_karte: ['Kapitel 1', 'Kettlegate'] };
const sceneHtml = (id) => (CHAPTER_CAPTIONS[id] ? `<div class="chaptercard">${sceneImg(id)}<div class="cap"><small>${CHAPTER_CAPTIONS[id][0]}</small>${CHAPTER_CAPTIONS[id][1]}</div></div>` : sceneImg(id));
/** Ausschnitt aus ui/E_04_quest_ui.png (Banner, Nadeln). */
const questUi = (cls, [x, y], k = 1 / 8) => `<span class="${cls}" style="background-image:url(${QUEST_UI_URL});background-size:${160 * k}em ${176 * k}em;background-position:-${x * k}em -${y * k}em"></span>`;
/** Kleines Quellenbild im Notizbuch: Gesicht der erzählenden Person, sonst ein Symbol. */
const SOURCE_LABEL = { observation: 'Eigene Beobachtung', vision: 'Geistsicht', police: 'Polizeibericht', archive: 'Akte', note: 'Gelesen', object: 'Spur am Ort', npc: 'Aussage' };
/** Paket H: Bild im Journal-Rahmen (Foto 32x36 mit Kopf, Dokument 32x32 mit Quellensymbol). k = em pro Pixel. */
const K = 1 / 12;
const framed = (frame, img, [ax, ay], size, title, cls = '') => {
  const [fx, fy, fw, fh] = JOURNAL_FRAME[frame];
  return `<span class="srcface framed ${cls}" title="${title}" style="width:${fw * K}em;height:${fh * K}em;background-image:url(${JOURNAL_FRAME_URL}),url(${img});`
    + `background-size:${128 * K}em ${64 * K}em,${size * K}em ${size * K}em;background-position:-${fx * K}em -${fy * K}em,${ax * K}em ${ay * K}em"></span>`;
};
/** Kopf einer Figur im Foto-Rahmen (zweifelhaft: zerrissenes Foto); ohne Mini-Kopf das Portrait. */
const headFace = (id, title = '', unreliable = false) => {
  const head = headUrl(id);
  if (head) return framed(unreliable ? 'photo_unreliable' : 'photo', head, [4, 6], 24, title, 'head');
  const url = portraitUrl(id);
  return url ? `<span class="srcface face" title="${title}" style="background-image:url(${url})"></span>` : '<span class="srcface"></span>';
};
/** Marker aus dem Journal-Rahmen (16x16). */
const journalMark = (id, title) => {
  const [x, y] = JOURNAL_FRAME[id];
  return `<span class="jmark" title="${title}" style="background-image:url(${JOURNAL_FRAME_URL});background-position:-${x / 8}em -${y / 8}em"></span>`;
};
/** Risiko-Symbol (ui/H_06_risiko_icons.png). */
const riskIcon = (id, title = '') => {
  const [x, y, n] = RISK_ICONS[id];
  const k = n === 8 ? 1 / 5 : 1 / 8; // die kleinen Punkte größer zeigen
  return `<span class="riskicon" title="${title}" style="width:${n * k}em;height:${n * k}em;background-image:url(${RISK_ICONS_URL});`
    + `background-size:${80 * k}em ${24 * k}em;background-position:-${x * k}em -${y * k}em"></span>`;
};
/** Paket I: Symbol der Reiseart (32x32). */
const modeIcon = (id) => `<span class="modeicon" style="background-image:url(${TRAVEL_MODES_URL});background-position:-${TRAVEL_MODE_ICONS[id] * 4}em 0"></span>`;
const RISK_TITLES = { risk_low: 'Wenig Risiko', risk_medium: 'Riskant', risk_high: 'Gefährlich' };
const sourceFace = (content, clue, unreliable = false) => {
  const src = sourceOf(content, clue);
  const title = esc(`${clue.source} (${SOURCE_LABEL[src.type]})`);
  if (src.type === 'npc') return headFace(src.npc, title, unreliable);
  if (src.type === 'observation') return headFace('player', title, unreliable);
  if (src.type === 'vision') return headFace('spirit', title, unreliable);
  const kind = sourceKind(src.type, clue.source);
  if (kind) return framed('document', sourceKindUrl(kind), [4, 4], 24, title, 'doc');
  const [url, cell, cols] = SOURCE_ICONS[src.type] ?? SOURCE_ICONS.object;
  return `<span class="srcface icon" title="${title}" style="background-image:url(${url});background-size:${cols * 100}% 100%;background-position:${(cell / (cols - 1)) * 100}% 0"></span>`;
};
/** Paket G: Gefahrenstufe (1 bis 5) und Edelstein der Seltenheit. */
const dangerIcon = (n) => {
  const [x, y] = DANGER_ICONS[Math.min(5, Math.max(1, n)) - 1];
  return `<span class="dangericon" style="background-image:url(${DANGER_URL});background-position:-${x / 8}em -${y / 8}em"></span>`;
};
const rarityGem = (r) => {
  const [x, y] = RARITY_GEMS[RARITY_SHEET[r]] ?? [];
  return x === undefined ? '' : `<span class="raritygem" style="background-image:url(${RARITY_SHEET_URL});background-position:-${x / 8}em -${y / 8}em"></span>`;
};
const coin = '<img class="coin" src="' + COIN_URL + '" alt="" width="16" height="16" onerror="this.remove()">';
/** Ausschnitt aus einem UI-Bogen (UI_SHEETS/UI_REGIONS), k = em pro Pixel. */
const uiSprite = (sheet, region, k = 1 / 8, cls = '', title = '') => {
  const r = UI_REGIONS[sheet]?.[region];
  if (!r) return '';
  const [path, w, h] = UI_SHEETS[sheet];
  return regionIcon(SPRITE_BASE + path, r, w, h, `ui-${sheet} ${cls}`, k, title);
};
/** Paket BP: Korruptionsabzeichen (Knoten) bzw. gereinigt/beiseitegelegt aus ui/BP_korruption.png. */
const korrIcon = (name = 'corrupted', title = 'korrumpiert') => uiSprite('bpkorr', name, 1 / 6, 'korricon', title);
const korrBadge = () => `<span class="badge refuted korr">${korrIcon()}korrumpiert</span>`;
/** Paket AE: gezeichneter Touch-Knopf (32x32, nur im Touch-Modus sichtbar) und Einstellungs-Symbol (16x16). */
const touchIcon = (name) => uiSprite('aetouch', name, 1 / 16, 'touch-only aeicon');
const setIcon = (name, cls = '') => uiSprite('aeset', name, 1 / 12, `aeicon ${cls}`);
const damageDigits = (text, row, k) => [...text].map((ch) => {
  const i = DAMAGE_FONT.glyphs.indexOf(ch);
  const r = DAMAGE_FONT.rows[row];
  return i < 0 ? '' : regionIcon(SPRITE_BASE + UI_SHEETS.dmg[0], [i * 8, r * 10, 8, 10], 96, 50, 'glyph', k);
}).join('');
/**
 * Ausschnitte für 9-Slice-Rahmen und Zeiger: werden einmal auf ein Canvas kopiert und als CSS-Variable gesetzt
 * (border-image braucht ein eigenes Bild). Lädt ein Bogen nicht, bleibt der bisherige Rahmen.
 */
const CROPS = {
  'bmenu-panel': ['bmenu', [0, 0, 48, 48]], 'bmenu-pointer': ['bmenu', [80, 0, 8, 8]],
  'shop-frame': ['shop', [0, 0, 48, 48]], 'shop-slot': ['shop', [0, 64, 20, 20]], 'shop-slot-hi': ['shop', [24, 64, 20, 20]],
  'shop-slot-locked': ['shop', [96, 64, 20, 20]], 'shop-tag': ['shop', [64, 0, 16, 8]],
  'loot-window': ['loot', [96, 0, 48, 48]], 'result-loot': ['bresult', [0, 96, 48, 48]],
  'strip-suspected': ['logstrips', [0, 0, 160, 24]], 'strip-likely': ['logstrips', [0, 24, 160, 24]],
  'equip-slot': ['equip', [112, 0, 20, 20]], 'equip-filled': ['equip', [112, 32, 20, 20]],
  // Paket AE: Zeitungsseite (9-Slice, 16px-Ränder) und Kopfleisten der beiden Blätter
  'paper-page': ['aezeitung', [0, 0, 48, 48]], 'paper-kopf-kurier': ['aezeitung', [0, 48, 160, 24]], 'paper-kopf-bote': ['aezeitung', [160, 48, 160, 24]],
};
function cropSkins(root) {
  const sheets = { ...Object.fromEntries(Object.entries(UI_SHEETS).map(([k, [p]]) => [k, p])), logstrips: 'ui/C_07_log_strips.png' };
  const byFile = {};
  for (const [name, [sheet, r]] of Object.entries(CROPS)) (byFile[sheets[sheet]] ??= []).push([name, r]);
  for (const [path, list] of Object.entries(byFile)) {
    const img = new Image();
    img.onload = () => {
      for (const [name, [x, y, w, h]] of list) {
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
        root.style.setProperty(`--${name}`, `url(${cv.toDataURL()})`);
      }
      root.classList.add(`skin-${path.replace(/\W/g, '_')}`);
    };
    img.src = SPRITE_BASE + path;
  }
}
/** Notizbuch-Reiter → Symbol aus 07_03_icons.png (Fallakten: Lupe). */
const TAB_ICONS = { quests: 'ausruf', items: 'schluessel', pfad: 'auge', personen: 'sprechen', bestiar: 'spuren', archiv: 'notebook', kulte: 'spuren' };
const pctStep = (frac, n) => Math.max(0, Math.min(n - 1, Math.round((1 - Math.max(0, Math.min(1, frac))) * (n - 1))));
const moneyIcon = (n) => `<img class="coin" src="${moneyIconUrl(n)}" alt="" width="16" height="16" onerror="this.remove()">`;
/** Beute als Liste mit Icon, Anzahl und Seltenheit (Farbe). */
const lootHtml = (loot, items) => {
  const rows = lootList(loot, items).map((e) => `<li class="loot-row rar-${e.rarity}">${itemIcon(e.id)}<strong>${esc(e.name)}</strong>${e.n > 1 ? ` ×${e.n}` : ''} <span class="rar">${rarityGem(e.rarity)}${RARITY_NAMES[e.rarity]}</span></li>`);
  if (loot?.money) rows.unshift(`<li class="loot-row">${moneyIcon(loot.money)}<strong>${loot.money} Schilling</strong></li>`);
  return rows.length ? `<ul class="loot">${rows.join('')}</ul>` : '';
};

// HTML-Oberfläche über dem Spiel-Canvas: HUD, Hinweise, Dialoge, Notizbuch,
// Stadtkarte und Enden. Text als HTML bleibt bei jeder Skalierung scharf.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtLb = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
/** Tragkraft-Balken: Pfund getragen / Pfund möglich, rot bei Überlast. */
const carryHtml = (s) => {
  const w = s.carryWeight();
  const cap = s.carryCapacity();
  const heavy = w > cap;
  return `<div class="carry ${heavy ? 'heavy' : ''}" title="Tragkraft: ${esc(s.carryBreakdown())} Pfund. Jede Sequenz trägt mehr."><span>Last</span><div class="bar"><div class="cfill" style="width:${Math.min(100, (w / cap) * 100)}%"></div></div>
    <em>${fmtLb(w)}/${fmtLb(cap)} Pfund</em>${heavy ? '<span class="curse">Überladen: halbes Tempo, kein schneller Weg</span>' : ''}</div>`;
};
const paragraphs = (s) => esc(s).split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

export const STATUS_LABEL = { suspected: 'Vermutung', likely: 'sehr wahrscheinlich', refuted: 'widerlegt' };

// Unterkategorien im Inventar, nach Gegenstandsart
const ITEM_CATS = [
  { id: 'alle', title: 'Alle' },
  { id: 'waffen', title: 'Waffen', kinds: ['weapon'] },
  { id: 'kleidung', title: 'Kleidung & Schmuck', kinds: ['gear'] },
  { id: 'artefakte', title: 'Artefakte', kinds: ['artifact'] },
  { id: 'traenke', title: 'Tränke & Heilmittel', kinds: ['potion', 'consumable'] },
  { id: 'zutaten', title: 'Zutaten & Rezepte', kinds: ['ingredient', 'formula'] },
  { id: 'beute', title: 'Beute', kinds: ['trophy'] },
  { id: 'quest', title: 'Quest', kinds: ['key'] },
];

export class Ui {
  constructor(root, state, { onNewGame, onContinue, hasSave }) {
    this.root = root;
    root.style.setProperty('--artui', `url(${new URL(ARTIFACT_UI_URL, document.baseURI).href})`);
    for (const [v, path] of Object.entries(UI_SKINS)) root.style.setProperty(`--${v}`, `url(${new URL(SPRITE_BASE + path, document.baseURI).href})`);
    cropSkins(root);
    this.state = state;
    this.onNewGame = onNewGame;
    this.onContinue = onContinue;
    this.hasSave = hasSave;
    this.modal = null; // 'title' | 'message' | 'dialogue' | 'notebook' | 'travel' | 'ending'
    this.blockedUntil = 0;
    this.selected = [];
    this.tab = 'quests';
    this.itemCat = 'alle';
    this.actor = 1; // wer das aktuelle Fenster bedient (Spieler 2 per Enter geöffnet)
    this.invPlayer = 1; // wessen Inventar im Notizbuch angezeigt wird

    root.innerHTML = `
      <div class="hud">
        <div class="hud-left">
          <div class="place"></div>
          <div class="meter life"><span>Leben</span><div class="bar"><div class="lfill"></div></div><em class="hpnum"></em></div>
          <div class="meter"><span>Nerven</span><div class="bar"><div class="fill"></div></div></div>
          <div class="meter honor"><span class="rank"></span><div class="bar"><div class="hfill"></div></div><span class="repbar"></span></div>
          <div class="meter digest hidden"><span>Verdaut</span><div class="bar"><div class="dfill"></div></div><em class="dnum"></em></div>
          <div class="meter unruhe hidden"><span>Unruhe</span><div class="bar"><div class="ufill"></div></div></div>
          <div class="money"></div>
          <div class="overload hidden"></div>
          <div class="fahndung hidden"></div>
          <div class="signal hidden"></div>
          <div class="treffen hidden"></div>
          <div class="goal hidden"></div>
        </div>
        <div class="hud-right">
          <div class="hudbtns">
            <button class="hudbtn" data-hud="notebook">${touchIcon('notizbuch')}<span class="key">J</span> Notizbuch</button>
            <button class="hudbtn" data-hud="inventory">${touchIcon('inventar')}<span class="key">I</span> Inventar</button>
            <button class="hudbtn" data-hud="pathway">${touchIcon('faehigkeit')}<span class="key">P</span> Pfad</button>
            <button class="hudbtn" data-hud="vision">${touchIcon('geistsicht')}<span class="key">Q</span> Geistsicht</button>
            <button class="hudbtn" data-hud="menu">${setIcon('zahnrad', 'touch-only')}<span class="key">Esc</span> Menü</button>
          </div>
          <div class="hud-p2 hidden">
            <div class="p2name"><img class="p2head" alt="" width="12" height="12">Spieler 2 <span class="p2state"></span><span class="muted p2weapon"></span></div>
            <div class="meter life"><span>Leben</span><div class="bar"><div class="p2hp"></div></div><em class="p2hpnum"></em></div>
            <div class="meter"><span>Nerven</span><div class="bar"><div class="p2nv"></div></div></div>
            <div class="p2path hidden"></div>
            <div class="p2load hidden"></div>
          </div>
        </div>
        <div class="vision-tag">Geistsicht</div>
        <div class="talentbar hidden" data-tbar="1"></div>
        <div class="talentbar p2 hidden" data-tbar="2"></div>
      </div>
      <button class="prompt hidden"></button>
      <div class="toasts"></div>
      <div class="layer"></div>
      <div class="floats"></div>`;
    this.$ = (sel) => root.querySelector(sel);
    this.layer = this.$('.layer');

    state.on('composure', (v) => this.updateComposure(v));
    state.on('vision', (on) => root.classList.toggle('vision', on));
    state.on('notice', (t) => { this.toast(t, 'warn'); if (/^Zu schwer/.test(t)) this.sfx(uiSound('notebook', 'heavy')); });
    state.on('clue', (id) => this.toast(`Neuer Hinweis: ${state.clue(id).name}`));
    state.on('cross', ({ fact, case: c }) => {
      const title = state.content.cases.find((x) => x.id === c)?.title.split(':')[0] ?? 'einem anderen Fall';
      this.toast(`Querverbindung: „${state.fact(fact).text}“ gehört auch zu ${title}`, 'gold');
    });
    state.on('fact', ({ id, status }) => {
      if (status === 'likely') this.toast(`Bestätigt: ${state.fact(id).text}`, 'gold');
      if (status === 'refuted') this.toast(`Widerlegt: ${state.fact(id).text}`, 'warn');
    });
    state.on('conclusion', (id) => this.toast(`Schlussfolgerung: ${state.deduction(id).name}`, 'gold'));
    state.on('honor', ({ delta, reason }) => { this.toast(`${delta > 0 ? '+' : ''}${delta} Ansehen${reason ? `: ${reason}` : ''}`, delta > 0 ? 'honor' : 'warn'); this.updateHonor(); });
    state.on('rank', ({ rank, up }) => this.toast(`${up ? 'Neuer Rang' : 'Rang verloren'}: ${rank.name}`, up ? 'gold' : 'warn'));
    state.on('quest', ({ id, status }) => {
      const q = state.quest(id);
      if (status === 'active') this.toast(`Neuer Auftrag: ${q.title}`, 'quest', QUEST_BANNERS.active);
      if (status === 'done') this.toast(`Auftrag erledigt: ${q.title}`, 'quest', QUEST_BANNERS.done);
    });
    state.on('ending', (id) => { this.pendingEnding = id; });
    state.on('hp', () => this.updateHp());
    state.on('item', ({ id, delta }) => {
      if (id === 'k3a_signalgeraet') this.updateSignal();
      if (this.modal === 'combat') return;
      const it = state.item(id);
      const who = state.acting === 2 ? 'Spieler 2: ' : '';
      if (delta > 0) this.toast(`${who}Erhalten: ${it.name}${delta > 1 ? ` ×${delta}` : ''}`, 'item');
      else if (it.kind !== 'consumable') this.toast(`${who}Abgegeben: ${it.name}`, 'warn');
    });

    state.on('money', ({ delta, reason }) => {
      this.updateMoney();
      if (this.modal === 'combat' || this.modal === 'shop') return;
      this.toast(`${delta > 0 ? '+' : ''}${delta} Schilling${reason ? `: ${reason}` : ''}`, delta > 0 ? 'item' : 'warn');
    });
    state.on('unruhe', () => (state.acting === 2 ? this.updateP2() : this.updateUnruhe()));
    state.on('signal', ({ charges, delta }) => {
      this.updateSignal();
      this.toast(delta > 0 ? `Rufladungen aufgefüllt: ${charges} von 3` : `Rufladung verbraucht: noch ${charges} von 3`, delta > 0 ? 'item' : 'warn');
    });
    state.on('wanted', ({ level, delta, reason }) => {
      this.updateWanted();
      this.toast(`Fahndungsstufe ${level}${reason ? `: ${reason}` : ''}`, delta > 0 ? 'warn' : 'item');
    });
    state.on('newspaper', (p) => this.toast(`${NEWSPAPERS[p.zeitung] ?? 'Zeitung'}: „${p.title}“ (Notizbuch → Zeitung)`, 'gold'));
    // CK: Jahreszeit und Festtage melden sich kurz (Zeilen aus texte.json → hud); nur bei echtem Wechsel, nicht beim Laden
    state.on('season', ({ season, day }) => {
      const key = `${season}:${day}`;
      if (this.seasonSeen === undefined) { this.seasonSeen = key; return; }
      if (this.seasonSeen === key) return;
      this.seasonSeen = key;
      const lines = state.content.festeLeben?.hud?.[`fs_${season}`] ?? [];
      const fest = Object.keys(FESTE).find((f) => state.flags.has(`fs_fest_${f}_aktiv`));
      const text = state.flags.has('fs_stiller_abend_aktiv') ? 'Stiller Abend: Heute ruht der Verkauf, nicht deine Ermittlung.'
        : fest ? `${FESTE[fest].name}: Heute feiert ${FESTE[fest].city === 'kettlegate' ? 'Kettlegate' : FESTE[fest].city === 'wexmoor' ? 'Wexmoor' : 'Dunscar'}.`
          : lines[(day - 1) % Math.max(1, lines.length)];
      if (text) this.toast(text, 'gold');
    });
    state.on('relation', ({ name, delta, mood, changed }) => {
      if (changed) this.toast(`${name} ist dir gegenüber jetzt ${MOOD_LABEL[mood].toLowerCase()}.`, mood === 'feindselig' ? 'warn' : 'item');
      else this.toast(`${name} ${delta > 0 ? 'hält mehr von dir' : 'hält weniger von dir'}.`, delta > 0 ? 'item' : 'warn');
    });
    state.on('bond', ({ name, value, delta, status, companion }) => {
      if (companion) { this.toast(`${name} ${delta > 0 ? 'vertraut dir mehr' : 'vertraut dir weniger'}.`, delta > 0 ? 'item' : 'warn'); return; }
      const max = state.lonerRules()?.friend_at ?? 3;
      if (status === 'freund') this.toast(`${name} ist jetzt dein Freund.`, 'item');
      else if (status === 'feind') this.toast(`${name} ist jetzt dein Feind.`, 'warn');
      else this.toast(`${name}: ${delta > 0 ? 'Vertrauen' : 'Misstrauen'} (${value > 0 ? '+' : ''}${value} von ±${max})`, delta > 0 ? 'item' : 'warn');
    });
    this.digestAcc = {};
    state.on('digest', ({ delta, kind, player = 1 }) => {
      this.updateUnruhe();
      if (player === 2) this.updateP2();
      // Rückmeldung: welche Handlung hat verdaut? Geistsicht sammelt, bis es sich lohnt.
      const key = `${player}:${kind}`;
      this.digestAcc[key] = (this.digestAcc[key] ?? 0) + delta;
      const acc = this.digestAcc[key];
      // Auf tiefen Sequenzen tröpfelt die Verdauung: die Meldung kommt entsprechend früher
      if (acc < (kind === 'vision' ? 5 : 1) * digestSlowdown(state.pathway.seq) && state.pathway.digestion < 100) return;
      this.digestAcc[key] = 0;
      if (this.modal === 'combat') return;
      this.toast(`${player === 2 ? 'Spieler 2: ' : ''}+${fmtDigest(acc)} % verdaut: ${DIGEST_LABELS[kind] ?? kind}`, 'digest');
    });
    state.on('digested', ({ seq, player = 1 }) => this.toast(`${player === 2 ? 'Spieler 2: ' : ''}${seq <= 8 ? 'Bereit für den nächsten Trank. Die Formel gibt es auf geheimen Treffen, selten bei Kittering.' : 'Bereit für den nächsten Trank. Kittering hat die Formel.'}`, 'gold'));
    // Geheime Treffen: Ankündigung und Uhr im HUD
    state.on('gathering', ({ text, open }) => {
      this.updateGathering();
      if (this.modal === 'combat') return;
      this.toast(text, open ? 'gold' : 'warn');
    });
    this.gatheringTimer = setInterval(() => this.updateGathering(), 1000);
    state.on('ascend', () => { this.updateUnruhe(); this.updateHp(); });
    state.on('lostcontrol', ({ text, player = 1, corrupted = [] }) => {
      this.updateHp();
      this.updateUnruhe();
      this.updateP2();
      const title = player === 2 ? 'Kontrollverlust: Spieler 2' : 'Kontrollverlust';
      // Im Kampf oder in einem anderen Fenster: Die Tentakel kommen, sobald es zu ist
      if (this.modal) { this.pendingLost = { title, text, corrupted, player }; return; }
      this.showCorruption(title, text, corrupted, player);
    });
    state.on('cleansed', ({ id }) => this.toast(`${this.state.item(id)?.name ?? 'Das Stück'} ist gereinigt.`, 'gold'));
    // Flüstern bei hoher Unruhe
    this.whisperTimer = setInterval(() => {
      if (this.modal || state.unruhe < 60 || !this.scene) return;
      const lines = ['Jemand flüstert deinen Namen.', 'Die Schatten am Rand deines Blicks bewegen sich.', 'Deine Hände zittern. Ein Ruhetee würde helfen.', 'Du hörst ein Lachen, das niemandem gehört.'];
      this.toast(lines[Math.floor(Math.random() * lines.length)], 'warn');
    }, 22000);

    ['track', 'changed', 'quest', 'clue', 'conclusion', 'travel'].forEach((ev) => state.on(ev, () => this.updateGoal()));
    ['item', 'changed', 'pathway'].forEach((ev) => state.on(ev, () => this.updateLoad()));
    ['party', 'hp', 'composure', 'item', 'changed'].forEach((ev) => state.on(ev, () => this.updateP2()));
    window.addEventListener('keydown', (e) => this.onKey(e), true);
    this.bindTouch();
    this.bindTalentBar();
    this.updateComposure(state.composure);
    this.updateHonor();
    this.updateHp();
    this.updateMoney();
    this.updateUnruhe();
  }

  // --- Handy / Touch -----------------------------------------------------------

  /** Touch-Modus: Tastenhinweise ausblenden, Kampfknöpfe zeigen. Schaltet sich beim ersten Fingertipp ein. */
  setTouch(on) {
    if (this.touch === on) return;
    this.touch = on;
    document.documentElement.classList.toggle('touch', on);
  }

  bindTouch() {
    this.setTouch(!!window.matchMedia?.('(pointer: coarse)').matches);
    window.addEventListener('touchstart', () => this.setTouch(true), { passive: true, capture: true });
    // HUD-Knöpfe (statt J, I, P, Q, Esc)
    this.root.querySelectorAll('[data-hud]').forEach((b) => {
      b.onclick = () => {
        if (!this.scene || this.isBlocking()) return;
        const a = b.dataset.hud;
        if (a === 'menu') this.openPause();
        else this.scene.pending = a;
      };
    });
    // Hinweis unten antippen = E
    this.$('.prompt').onclick = () => { if (this.scene && !this.isBlocking()) this.scene.pending = 'interact'; };
    // Jeder Knopf mit data-key wirkt wie die Taste (G Tasche wechseln, ← → Untertabs usw.)
    this.root.addEventListener('click', (e) => {
      const b = e.target.closest?.('[data-key]');
      if (!b || !this.root.contains(b)) return;
      e.preventDefault();
      this.onKey({ key: b.dataset.key, repeat: false, preventDefault() {}, stopPropagation() {} });
    });
    // Ein Tipp, der in der Welt oder im Kampf etwas auslöst, darf nicht gleich im neu geöffneten Fenster weiterklicken
    const release = () => { if (this.clickHold === Infinity) this.clickHold = performance.now() + 250; };
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);
    window.addEventListener('click', (e) => {
      if (!this.clickHold) return;
      const live = performance.now() <= this.clickHold;
      this.clickHold = 0; // nur den einen Klick dieses Tipps schlucken
      if (live && this.root.contains(e.target)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    // Kampf: irgendwo tippen = Takt / Weiter (E). Ausweichen und Parieren haben eigene Knöpfe.
    window.addEventListener('pointerdown', (e) => {
      if (this.modal !== 'combat' || !this.combatScene) return;
      if (e.button > 0 || e.target.closest?.('button, .cb-menu')) return;
      if (this.combatScene.onKey('confirm', 1)) this.holdClicks();
    }, true);
    // Vollbild: Knopf aktualisieren, wenn sich der Zustand ändert
    document.addEventListener('fullscreenchange', () => this.root.querySelectorAll('[data-act=fullscreen]').forEach((b) => { b.innerHTML = this.fullscreenLabel(); }));
  }

  /** Klicks bis kurz nach dem Loslassen schlucken (siehe bindTouch). */
  holdClicks() { this.clickHold = Infinity; }

  canFullscreen() {
    const d = document.documentElement;
    return !!(d.requestFullscreen || d.webkitRequestFullscreen);
  }

  isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }

  /** Paket Y: Ton laut, leise oder aus (Effekte und Musik gemeinsam über die Gesamtlautstärke). */
  soundLabel() {
    const m = this.audio?.master ?? 0;
    return m <= 0 ? 'Ton: aus' : m < 0.6 ? 'Ton: leise' : 'Ton: an';
  }

  cycleSound() {
    if (!this.audio) return;
    const m = this.audio.master;
    this.audio.master = m <= 0 ? 0.8 : m < 0.6 ? 0 : 0.4;
  }

  fullscreenLabel() { return this.isFullscreen() ? 'Vollbild beenden' : 'Vollbild'; }

  /** Vollbild an/aus. Auf dem iPhone gibt es das im Browser nicht: dort Hinweis auf „Zum Home-Bildschirm“. */
  toggleFullscreen() {
    const d = document.documentElement;
    if (this.isFullscreen()) {
      (document.exitFullscreen ?? document.webkitExitFullscreen)?.call(document);
      return;
    }
    if (!this.canFullscreen()) {
      this.showMessage('Vollbild', 'Dein Browser erlaubt hier kein Vollbild (so ist das auf dem iPhone).\n\nSo geht es trotzdem: Tippe in Safari unten auf „Teilen“ (Viereck mit Pfeil) und dann auf „Zum Home-Bildschirm“. Starte Nebelakten danach über das neue Symbol: Dann läuft das Spiel ohne Adressleiste, im Querformat über den ganzen Bildschirm.', { footer: 'Der Spielstand bleibt erhalten.' });
      return;
    }
    const req = d.requestFullscreen ?? d.webkitRequestFullscreen;
    Promise.resolve(req.call(d, { navigationUI: 'hide' }))
      .then(() => screen.orientation?.lock?.('landscape'))
      .catch(() => {});
  }

  onSceneReady(scene) {
    this.scene = scene;
    const map = this.state.content.maps[this.state.map];
    this.$('.place').innerHTML = map.danger ? `${dangerIcon(map.danger)}${esc(map.name)} · Gefahr ${'☠'.repeat(map.danger)}` : esc(map.name);
    this.$('.place').classList.toggle('danger', !!map.danger);
    if (map.danger && this.lastZone !== map.id) this.zoneBanner(map);
    this.lastZone = map.danger ? map.id : null;
    this.updateHonor();
    this.updateHp();
    this.updateMoney();
    this.updateUnruhe();
    this.updateWanted();
    this.updateSignal();
    this.updateGoal();
    this.updateLoad();
  }

  /** Wegweiser im HUD: nächster Schritt des verfolgten Auftrags. */
  goalText(t) {
    if (!t) return '';
    if (t.notebook) return `${t.notebook} (J)`;
    const where = t.map === this.state.map ? 'hier' : (this.state.content.maps[t.district]?.name ?? t.mapName);
    const text = `${t.name} · ${t.map === t.district || t.map === this.state.map ? where : `${t.mapName}, ${where}`}`;
    return t.locked ? `${text} (gesperrt, ${t.locked.how})` : text;
  }

  updateGoal() {
    const el = this.$('.goal');
    if (!el) return;
    const s = this.state;
    // Ohne verfolgten Auftrag zeigt der Wegweiser die nächste offene Spur (z. B. Nan Kettle für Fall 8).
    const t = s.tracked && journalQuestVisible(s, s.tracked) ? questTarget(s, s.tracked) : leadTarget(s, s.openLeads()[0]);
    el.classList.toggle('hidden', !t);
    if (t) el.innerHTML = `<span class="arrow">➤</span> ${esc(this.goalText(t))}<span class="gstep">${esc(t.lead ? `Neue Spur: ${s.quest(t.quest).title}` : t.step)}</span>${t.because ? `<span class="gwhy">${esc(t.because.length > 150 ? `${t.because.slice(0, 147)}…` : t.because)}</span>` : ''}`;
  }

  updateGathering() {
    const el = this.$('.treffen');
    if (!el) return;
    const st = this.state.gatheringStatus();
    el.classList.toggle('hidden', !st);
    el.classList.toggle('open', !!st?.open);
    if (!st) return;
    const g = st.open ?? st.next;
    const [, inv] = ZIRKEL_ICONS[g.id] ?? [];
    const frac = st.open ? (g.end - this.state.playTime) / Math.max(1, g.end - g.start) : 1;
    const timer = st.open ? atlasIcon(ZIRKEL_URL, 24 + Math.min(7, Math.max(0, Math.floor((1 - frac) * 8))), 8) : '';
    const sInv = S_ZIRKEL[g.id] && regionIcon(S_ZIRKEL_URL, S_ZIRKEL[g.id].invite, 128, 64, 'invite', 1 / 16);
    el.innerHTML = `${inv !== undefined ? atlasIcon(ZIRKEL_URL, 16 + inv, 8) : sInv || (st.open ? '◆' : '◇')}${timer} ${esc(st.text)}`;
  }

  /** HUD-Hinweis nur bei Überlast, damit die Anzeige sonst ruhig bleibt. */
  updateLoad() {
    const el = this.$('.overload');
    if (!el || this.state.acting === 2) return;
    const heavy = this.state.isOverloaded();
    el.classList.toggle('hidden', !heavy);
    if (heavy) el.innerHTML = `${uiSprite('loot', 'full', 1 / 16, 'toastico')}Überladen · ${esc(this.state.carryText())}`;
  }

  /** Fahndungsstufe im HUD: in Wexmoor, und in Kettlegate, sobald Price nach dir suchen lässt (Ende Fall 9). */
  updateWanted() {
    const el = this.$('.fahndung');
    const s = this.state;
    const r = s.cityPolice?.();
    const show = !!r;
    el.classList.toggle('hidden', !show);
    if (!show) return;
    el.classList.toggle('hot', s.wanted > 0);
    el.textContent = `Fahndung ${'★'.repeat(s.wanted)}${'☆'.repeat(r.max_level - s.wanted)}`;
  }

  /** Kapitel 3: Rufladungen von Pfiffs Signalgerät, nur in Dunscar und solange man es trägt. */
  updateSignal() {
    const el = this.$('.signal');
    const s = this.state;
    const show = s.hasSignalDevice() && s.content.maps[s.map]?.city === 'dunscar';
    el.classList.toggle('hidden', !show);
    if (!show) return;
    el.classList.toggle('empty', s.signal.charges === 0);
    el.textContent = `Rufladungen ${'●'.repeat(s.signal.charges)}${'○'.repeat(3 - s.signal.charges)}`;
  }

  updateMoney() {
    const m = this.state.money;
    const changed = this.lastMoney !== undefined && this.lastMoney !== m;
    this.lastMoney = m;
    // Paket A: Münze dreht sich kurz, wenn sich das Geld ändert
    this.$('.money').innerHTML = `${changed ? '<span class="coinspin"></span>' : coin}${m} Schilling`;
  }

  updateUnruhe() {
    const s = this.state;
    if (s.acting === 2) return; // Werte von Spieler 2 stehen im eigenen HUD-Kasten
    const dm = this.$('.meter.digest');
    dm.classList.toggle('hidden', !s.isBeyonder());
    if (s.isBeyonder()) {
      const d = Math.floor(s.pathway.digestion);
      this.$('.meter.digest .dfill').style.width = `${d}%`;
      this.$('.meter.digest .dfill').classList.toggle('full', d >= 100);
      this.$('.dnum').textContent = `${s.pathway.seq <= 6 && d < 100 ? fmtDigest(s.pathway.digestion) : d} %`;
    }
    const el = this.$('.meter.unruhe');
    el.classList.toggle('hidden', !s.isBeyonder() && s.unruhe <= 0);
    const fill = this.$('.ufill');
    fill.style.width = `${s.unruhe}%`;
    fill.classList.toggle('low', s.unruhe >= 60);
  }

  isBlocking() {
    return this.modal !== null || performance.now() < this.blockedUntil;
  }

  // --- HUD ------------------------------------------------------------------

  updateComposure(v) {
    if (this.state.acting === 2) return;
    const fill = this.$('.fill');
    const pct = (v / this.state.maxComposure()) * 100;
    fill.style.width = `${pct}%`;
    fill.classList.toggle('low', pct < 30);
  }

  updateHp() {
    const s = this.state;
    if (s.acting === 2) return;
    const fill = this.$('.lfill');
    fill.style.width = `${(s.hp / s.maxHp) * 100}%`;
    fill.classList.toggle('low', s.hp / s.maxHp < 0.3);
    this.$('.hpnum').textContent = `${s.hp}/${s.maxHp}`;
  }

  /** HUD von Spieler 2 (rechts oben), nur wenn er mitspielt. */
  updateP2() {
    const el = this.$('.hud-p2');
    if (!el) return;
    const on = this.state.hasP2();
    el.classList.toggle('hidden', !on);
    this.root.classList.toggle('koop', on);
    if (!on) return;
    const v = this.state.playerView(2);
    const head = this.$('.p2head');
    const look = this.state.p2Look();
    if (head && head.dataset.look !== look) { head.dataset.look = look; head.src = p2HeadUrl(look); }
    const hp = this.$('.p2hp');
    hp.style.width = `${(v.hp / v.maxHp) * 100}%`;
    hp.classList.toggle('low', v.hp / v.maxHp < 0.3);
    this.$('.p2hpnum').textContent = `${v.hp}/${v.maxHp}`;
    this.$('.p2nv').style.width = `${(v.composure / v.maxComposure) * 100}%`;
    this.$('.p2weapon').textContent = v.weapon.name;
    // Paket BU: Zustand als Symbol (im Kampf, gebunden, Anspruch offen, sonst wartet/geht mit)
    const anspruch = Object.values(this.state.claims ?? {}).some((e) => e?.[2] === 'offen');
    const zustand = this.combatScene ? 'im_kampf' : anspruch ? 'anspruch_offen' : this.isBlocking() ? 'wartet' : null;
    const st = this.$('.p2state');
    if (st && st.dataset.z !== (zustand ?? '')) { st.dataset.z = zustand ?? ''; st.innerHTML = zustand ? uiSprite('koop2', `p2_${zustand}`, 1 / 12, 'p2sym', zustand.replace('_', ' ')) : ''; }

    const path = this.$('.p2path');
    path.classList.toggle('hidden', !v.pathway && v.unruhe <= 0);
    if (v.pathway) path.innerHTML = `<span style="color:${v.pathway.color}">Seq ${v.pathway.seq} ${esc(v.pathway.seqName)}</span> · ${Math.floor(v.pathway.digestion)} % · <span class="${v.unruhe >= 60 ? 'curse' : ''}">Unruhe ${Math.round(v.unruhe)}</span>`;
    else if (v.unruhe > 0) path.innerHTML = `<span class="${v.unruhe >= 60 ? 'curse' : ''}">Unruhe ${Math.round(v.unruhe)}</span>`;
    const load = this.$('.p2load');
    load.classList.toggle('hidden', !v.overloaded);
    if (v.overloaded) load.textContent = `Überladen · ${v.carry}`;
  }

  // --- Schnellleiste der Welt-Fähigkeiten -------------------------------------------
  // Unten links (Spieler 2 unten rechts) liegen alle Welt-Fähigkeiten der erreichten Sequenzen,
  // in derselben Reihenfolge wie im Pfad-Tab (Sequenz 9 zuerst). Tasten 1–9 setzen sie ein,
  // Spieler 2 nimmt den Ziffernblock oder am Gamepad LB/RB zum Wählen und X zum Einsetzen.

  bindTalentBar() {
    this.talentSel2 = 0;
    this.root.addEventListener('click', (e) => {
      const b = e.target.closest?.('[data-tslot]');
      if (!b || !this.root.contains(b)) return;
      e.preventDefault();
      this.useTalentSlot(Number(b.dataset.tplayer), Number(b.dataset.tslot));
    });
    // Ereignisse kommen oft mitten aus withPlayer(2): erst danach zeichnen, sonst stünden die Werte vertauscht
    const later = () => { if (!this.talentBarTimer) this.talentBarTimer = setTimeout(() => { this.talentBarTimer = null; this.updateTalentBar(); }, 0); };
    ['talent', 'composure', 'party', 'ascend', 'changed', 'digested'].forEach((ev) => this.state.on(ev, later));
    // Abklingzeiten zählen sichtbar herunter (gezeichnet wird nur, wenn sich etwas ändert)
    setInterval(() => this.updateTalentBar(), 500);
    this.updateTalentBar();
  }

  /** Welt-Fähigkeiten eines Spielers für die Leiste (leer ohne Pfad oder ohne Spieler 2). */
  talentSlots(n) {
    if (n === 2 && !this.state.hasP2()) return [];
    return this.as(() => this.state.talents?.() ?? [], n);
  }

  updateTalentBar() {
    for (const n of [1, 2]) {
      const el = this.$(`[data-tbar="${n}"]`);
      if (!el) continue;
      const list = this.talentSlots(n);
      if (n === 2 && this.talentSel2 >= list.length) this.talentSel2 = 0;
      const html = list.map((t, i) => this.talentSlotHtml(t, i, n)).join('');
      if (el.dataset.html === html) continue;
      el.dataset.html = html;
      el.innerHTML = html;
      el.classList.toggle('hidden', !list.length);
    }
  }

  talentSlotHtml(t, i, n) {
    const state = t.remaining > 0 ? 'cd' : t.ready ? 'ready' : 'nonerves';
    const cost = [t.nerves ? `${t.nerves} Nerven` : '', t.unruhe ? `+${t.unruhe} Unruhe` : '', `${fmtSec(t.cooldown ?? 60)} Pause`].filter(Boolean).join(' · ');
    const why = t.remaining > 0 ? `bereit in ${t.remainingText}` : t.ready ? 'bereit' : 'zu wenig Nerven';
    const key = n === 2 ? `Num ${i + 1}` : `${i + 1}`;
    const title = `${t.name} (Seq ${t.seq}, Taste ${key}): ${t.desc ?? ''} [${cost}] – ${why}`;
    const sel = n === 2 && this.talentSel2 === i ? ' sel' : '';
    const left = Math.ceil(t.remaining);
    const cd = left > 0 ? `<span class="tcd">${left >= 60 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : left}</span>` : '';
    return `<button class="tslot ${state}${sel}" data-tslot="${i}" data-tplayer="${n}" title="${esc(title)}">${talentIconHud(t.id)}${cd}<span class="key">${i + 1}</span></button>`;
  }

  /** Spieler 2 am Gamepad: Auswahl in der Leiste verschieben (LB/RB). */
  moveTalentSel2(d) {
    const len = this.talentSlots(2).length;
    if (!len) return;
    this.talentSel2 = (this.talentSel2 + d + len) % len;
    this.updateTalentBar();
  }

  /** Welt-Fähigkeit auf Platz idx einsetzen (Taste, Klick oder Tipp). Nur in der Welt, nicht in Fenstern oder Kämpfen. */
  useTalentSlot(n, idx) {
    if (!this.scene || this.combatScene || this.isBlocking()) return null;
    if (idx === 'sel') idx = this.talentSel2 ?? 0;
    const list = this.talentSlots(n);
    const who = n === 2 ? 'Spieler 2: ' : '';
    const t = list[idx];
    if (!t) {
      if (n === 2 && !this.state.hasP2()) return null;
      this.toast(list.length ? `${who}Auf Taste ${idx + 1} liegt keine Welt-Fähigkeit (du hast ${list.length}).` : `${who}Welt-Fähigkeiten bekommst du mit deinem ersten Trank.`, 'warn');
      return null;
    }
    const r = this.as(() => this.state.useTalent(t.id), n);
    this.toast(`${who}${r.text}`, r.ok ? 'good' : 'warn');
    this.updateTalentBar();
    return r;
  }

  /** Führt fn mit den Werten des Spielers aus, der das Fenster bedient. */
  as(fn, n = this.actor) {
    return this.state.withPlayer(n, fn);
  }

  updateHonor() {
    const s = this.state;
    const r = s.rank();
    const next = s.nextRank();
    // Grundpaket: Rangabzeichen und Rufleiste (14_01, 14_02)
    const ri = Math.min(4, s.content.ranks.indexOf(r));
    this.$('.rank').innerHTML = `${uiSprite('ranks', `r${Math.max(0, ri)}`, 1 / 16, 'rankbadge', r.name)}${esc(r.name)} · ${s.honor}`;
    const pct = next ? ((s.honor - r.min) / (next.min - r.min)) * 100 : 100;
    this.$('.hfill').style.width = `${Math.max(0, Math.min(100, pct))}%`;
    this.$('.repbar').innerHTML = uiSprite('repbar', `f${Math.max(0, Math.min(4, Math.round(pct / 25)))}`, 1 / 12.8);
  }

  setPrompt(text, key = 'E', kind = '') {
    const el = this.$('.prompt');
    if (!text || this.modal) { el.classList.add('hidden'); return; }
    if (el.dataset.text !== text || el.dataset.key !== key) {
      el.dataset.text = text;
      el.dataset.key = key;
      // Grundpaket: animiertes Symbol (07_05) – sprechen, aufheben oder untersuchen
      const icon = kind === 'npc' ? 'sprechen' : kind === 'loot' || /aufheben|nehmen|einstecken|öffnen/i.test(text) ? 'hand' : 'lupe';
      el.innerHTML = `${uiSprite('interact', `${icon}0`, 1 / 16, 'promptico')}<span class="key">${esc(key)}</span> ${esc(text)}`;
    }
    el.classList.remove('hidden');
  }

  /** Paket BV: Ankündigungsbanner eines Festes (ui/fest_<id>_banner.png, freie Mitte 96x16 für den Text). */
  festBanner(id, name) {
    const old = this.$('.festbanner');
    old?.remove();
    const el = document.createElement('div');
    el.className = 'festbanner';
    el.style.backgroundImage = `url(${festBannerUrl(id)})`;
    el.innerHTML = `<span>${esc(name)}</span>`;
    this.root.appendChild(el);
    setTimeout(() => el.classList.add('out'), 4200);
    setTimeout(() => el.remove(), 4900);
  }

  toast(text, kind = '', banner = null) {
    const box = this.$('.toasts');
    while (box.children.length > 5) box.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
    if (kind === 'honor' || (kind === 'warn' && /Ansehen/.test(text))) el.insertAdjacentHTML('afterbegin', uiSprite('reppop', kind === 'honor' ? 'up' : 'down', 1 / 16, 'toastico'));
    // Aufträge: gemaltes Banner (160x32) über dem Text
    if (banner) { el.classList.add('with-banner'); el.insertAdjacentHTML('afterbegin', questUi('qbanner', banner, 1 / 16)); }
    box.appendChild(el);
    setTimeout(() => el.classList.add('out'), 3200);
    setTimeout(() => el.remove(), 3800);
  }

  badge(status) {
    return status && STATUS_LABEL[status] ? `<span class="badge ${status}">${atlasIcon(LOG_MARKERS_URL, LOG_MARKERS[status], 7)}${STATUS_LABEL[status]}</span>` : '';
  }

  // --- Modale Fenster --------------------------------------------------------

  /** Paket Y: Klang der Oberfläche (still ohne Audio). */
  sfx(id, opts) {
    if (id) this.audio?.play(id, opts);
  }

  open(kind, html, cls = '') {
    this.rememberScroll();
    // Y: ein Fenster klingt beim Öffnen (Karte entfalten, Notizbuch blättern, Schublade), nicht bei jedem Neuaufbau
    if (this.modal !== kind) { this.sfx(this.nextOpenSound ?? uiSound(kind)); }
    this.nextOpenSound = null;
    this.modal = kind;
    this.layer.classList.remove('has-titlescene');
    this.layer.onpointermove = null;
    this.layer.innerHTML = `<div class="panel ${cls}">${html}</div>`;
    this.setPrompt(null);
    this.restoreScroll(kind);
    return this.layer.firstElementChild;
  }

  /** Alle gescrollten Listen (und das Fenster selbst) eines Fensters, mit einem Schlüssel aus Tag, Klassen und laufender Nummer. */
  scrollables(panel) {
    const seen = {};
    const key = (el) => {
      const k = `${el.tagName}.${[...el.classList].filter((c) => c !== 'sel' && c !== 'armed').sort().join('.')}`;
      seen[k] = (seen[k] ?? 0) + 1;
      return `${k}#${seen[k]}`;
    };
    return [panel, ...panel.querySelectorAll('*')].map((el) => [key(el), el]);
  }

  /** Scrollposition des offenen Fensters merken, damit ein Neuaufbau (Klick auf Benutzen, Einlagern, Kaufen …) nicht nach oben springt. */
  rememberScroll() {
    const panel = this.layer?.firstElementChild;
    if (!this.modal || !panel?.classList.contains('panel')) return;
    const pos = {};
    for (const [k, el] of this.scrollables(panel)) if (el.scrollTop || el.scrollLeft) pos[k] = [el.scrollTop, el.scrollLeft];
    this.scrollMemo ??= {};
    if (Object.keys(pos).length) this.scrollMemo[this.modal] = pos; else delete this.scrollMemo[this.modal];
  }

  restoreScroll(kind) {
    const pos = this.scrollMemo?.[kind];
    const panel = this.layer.firstElementChild;
    if (!pos || !panel) return;
    for (const [k, el] of this.scrollables(panel)) if (pos[k]) [el.scrollTop, el.scrollLeft] = pos[k];
  }

  /** Beim Wechsel auf eine andere Seite (Reiter) soll die neue Liste oben anfangen. */
  forgetScroll(kind = this.modal, only = null) {
    if (!this.scrollMemo?.[kind]) return;
    if (!only) { delete this.scrollMemo[kind]; return; }
    for (const k of Object.keys(this.scrollMemo[kind])) if (only.test(k)) delete this.scrollMemo[kind][k];
  }

  close() {
    if (this.modal && this.modal !== 'title') this.sfx(uiSound(this.modal, 'close'));
    if (this.modal === 'signal') { this.state.cancelPrivateAnswer?.(1); this.state.cancelPrivateAnswer?.(2); this.signalUi = null; } // BN: offenes Angebot verfällt
    this.forgetScroll();
    this.modal = null;
    this.actor = 1;
    this.layer.classList.remove('has-titlescene');
    this.layer.onpointermove = null;
    this.layer.innerHTML = '';
    this.blockedUntil = performance.now() + 150;
    if (this.pendingEnding) {
      const id = this.pendingEnding;
      this.pendingEnding = null;
      this.showEnding(id);
    } else if (this.pendingEpilogue?.length) {
      // AP/AR: Epilogszenen nach dem Schlussbild, eine Tafel je Szene, dann die Kapitelkarte
      const scene = this.pendingEpilogue.shift();
      this.showMessage(scene.title, scene.text, { footer: 'Epilog' });
      this.sfx(uiSound('message', 'epilog'));
      this.layer.querySelector('.panel.message')?.classList.add('chapterbook');
    } else if (this.pendingChapter) {
      // Kapitelende (z. B. Fall 9): eigene Tafel nach dem Schlussbild
      const ch = this.pendingChapter;
      this.pendingChapter = null;
      // Paket AE: Kapitelkarte (Ende von Kapitel 1 kündigt Kapitel 2 an, sonst die Schlusskarte)
      const card = ch.scene ?? (/Kapitel 1\b/.test(ch.title) ? 'kapitel2_karte' : /Kapitel 2\b/.test(ch.title) ? 'kapitel3_karte' : /Kapitel 3\b/.test(ch.title) ? 'kapitel4_karte' : /Kapitel 4\b/.test(ch.title) ? 'kapitel5_karte' : 'kapitel_ende');
      this.showMessage(ch.title, ch.text, { footer: ch.footer ?? '', scene: card });
      this.sfx(uiSound('message', 'chapter'));
      this.layer.querySelector('.panel.message')?.classList.add('chapterbook'); // Grundpaket: aufgeschlagenes Notizbuch (07_02)
    } else if (this.pendingLost) {
      const { title, text, corrupted = [], player = 1 } = this.pendingLost;
      this.pendingLost = null;
      this.showCorruption(title, text, corrupted, player);
    } else if (this.state.pendingCombat && this.scene) {
      this.scene.startCombat(this.state.pendingCombat);
    } else if (this.state.pendingTravel && this.scene) {
      const t = this.state.pendingTravel;
      this.state.pendingTravel = null;
      this.scene.travelTo(t.map, t.spawn);
    } else if (this.afterClose) {
      const after = this.afterClose;
      this.afterClose = null;
      after();
    }
  }

  showTitle() {
    const c = this.state.content;
    const save = this.hasSave();
    const el = this.open('title', `
      <h1>${esc(c.title)}</h1>
      <h2>Ein Mystery in Kettlegate</h2>
      <div class="controls touch-only">
        <div>Tippen: hinlaufen · auf Personen und Dinge tippen: sprechen / untersuchen</div>
        <div>Finger halten und ziehen: die Figur folgt dem Finger</div>
        <div>Knöpfe oben rechts: Notizbuch, Inventar, Pfad, Geistsicht, Menü</div>
        <div>Leiste unten links: Welt-Fähigkeiten antippen</div>
        <div>Kampf: tippen für den Takt · Knöpfe für Ausweichen und Parieren</div>
      </div>
      <div class="controls no-touch">
        <div><span class="key">WASD</span> / <span class="key">Pfeile</span> laufen · oder hinklicken</div>
        <div><span class="key">E</span> untersuchen / sprechen</div>
        <div><span class="key">Q</span> Geistsicht (kostet Nerven)</div>
        <div><span class="key">1</span>–<span class="key">9</span> Welt-Fähigkeiten (Leiste unten links)</div>
        <div><span class="key">J</span> Notizbuch: Aufträge, Quellen, Schlussfolgerungen</div>
        <div><span class="key">Esc</span> Menü: Spieler 2 hinzufügen oder entfernen</div>
      </div>
      <div class="actions center">
        ${save ? '<button class="primary" data-act="continue">Fortsetzen <span class="key">E</span></button>' : ''}
        <button class="${save ? '' : 'primary'}" data-act="new">Neues Spiel ${save ? '<span class="key">N</span>' : '<span class="key">E</span>'}</button>
        <button data-act="fullscreen">${this.fullscreenLabel()}</button>
      </div>`, 'title');
    this.titleScene();
    el.querySelector('[data-act=fullscreen]').onclick = () => this.toggleFullscreen();
    this.titleContinue = save ? () => { this.close(); this.onContinue(); } : null;
    this.titleNew = () => {
      this.close();
      this.onNewGame();
      this.showMessage(c.start.intro_title, c.start.intro, { scene: 'kapitel1_karte', footer: this.touch ? 'Tipp: Im Notizbuch (Knopf oben rechts) siehst du deine Aufträge.' : 'Tipp: Im Notizbuch (J) siehst du deine Aufträge.' });
    };
    el.querySelector('[data-act=new]').onclick = this.titleNew;
    el.querySelector('[data-act=continue]')?.addEventListener('click', this.titleContinue);
  }

  /**
   * Paket AE: Titelbild in Ebenen hinter dem Titelfenster. Mond, Fenster, Laterne und Regen laufen als Streifen,
   * der Nebel zieht langsam, und die Häuser verschieben sich leicht mit der Maus (Parallax).
   */
  titleScene() {
    const box = (l) => (l.box ? `left:${(l.box[0] / 480) * 100}%;top:${(l.box[1] / 270) * 100}%;width:${(l.box[2] / 480) * 100}%;height:${(l.box[3] / 270) * 100}%;right:auto;bottom:auto` : '');
    const layer = (l) => `<div class="tl${l.depth ? ` d${l.depth}` : ''}" style="${box(l)}">${l.drift
      ? `<div class="drift" style="animation-duration:${l.drift}s"><img src="${l.url}" alt=""><img src="${l.url}" alt=""></div>`
      : `<img src="${l.url}" alt="" class="${l.frames ? `f${l.frames}` : ''}" style="${l.frames ? `width:${l.frames * 100}%;animation-duration:${l.sec}s` : ''}">`}</div>`;
    const scene = document.createElement('div');
    scene.className = 'titlescene';
    scene.innerHTML = TITLE_LAYERS.map(layer).join('');
    // Fehlt eine Ebene, bleibt das alte Titelbild sichtbar
    scene.querySelector('img')?.addEventListener('load', () => this.layer.classList.add('has-titlescene'), { once: true });
    this.layer.prepend(scene);
    this.layer.onpointermove = (e) => {
      const r = this.layer.getBoundingClientRect();
      scene.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    };
  }

  /** Dialogportrait als HTML (z. B. für Meldungen außerhalb von Gesprächen). */
  portraitHtml(id, mood) { return portrait(id, mood); }

  showMessage(title, text, { footer = '', extra = '', face = '', onClose = null, scene = null, aside = '' } = {}) {
    if (onClose) this.afterClose = onClose;
    const el = this.open('message', `
      ${sceneHtml(scene)}${aside}
      <h3>${face}${esc(title)}</h3>
      <div class="text">${paragraphs(text)}</div>
      ${extra}
      ${footer ? `<div class="footer">${esc(footer)}</div>` : ''}
      <button class="next" data-act="ok">Weiter <span class="key">E</span></button>`, 'message');
    el.querySelector('[data-act=ok]').onclick = () => this.close();
  }

  /**
   * Kontrollverlust: Tentakel wachsen aus der Figur (Animation in der Welt, Bild im Fenster) und
   * korrumpieren alles am Leib. corrupted: Ids der getroffenen Stücke.
   */
  showCorruption(title, text, corrupted = [], player = 1) {
    this.scene?.playCorruption?.(player);
    const s = this.state;
    const hit = corrupted.filter((id) => s.item(id));
    const extra = hit.length
      ? `<ul class="corruptlist">${hit.map((id) => `<li>${itemIcon(id)}<strong>${esc(s.item(id).name)}</strong> <span class="curse">${korrIcon()}korrumpiert</span></li>`).join('')}</ul>`
      : '';
    const r = s.corruptionRules();
    const footer = hit.length
      ? `Jedes korrumpierte Stück in Gebrauch kostet ${fmtRate(r.hp_per_sec)} Leben und ${fmtRate(r.nerves_per_sec)} Nerven pro Sekunde. Ablegen im Inventar (I), reinigen bei Dr. Varga oder mit Läutersalz.`
      : '';
    this.showMessage(title, text, { scene: 'kontrollverlust', extra, footer });
    this.layer.querySelector('.panel.message')?.classList.add('corruption');
    this.keysBlockedUntil = performance.now() + 2000; // Erst die Tentakel sehen, dann lesen
  }

  /** Inhalt eines Beutebehälters. */
  showLoot(title, loot) {
    const list = lootHtml(loot, this.state.content.items);
    // Paket G: Beutefenster mit Aufheben-Funkeln (G_03_loot_ui.png)
    const aside = list ? `<span class="lootfx">${uiSprite('loot', 'pickup0', 1 / 8, 'pickup')}</span>` : '';
    this.showMessage(title, list ? 'Du steckst alles ein:' : 'Leer. Jemand war schneller.', { extra: list ? `<div class="takeall">${uiSprite('loot', 'take_all', 1 / 16, 'toastico')}Alles genommen</div>${list}` : '', aside });
    this.layer.querySelector('.panel.message')?.classList.add('lootwin');
  }

  showClue(id, isNew) {
    const s = this.state;
    const clue = s.clue(id);
    const status = s.factStatus(clue.fact);
    const n = s.factSources(clue.fact).length;
    const extra = `<div class="factline">${this.badge(status)} ${esc(s.fact(clue.fact).text)} <span class="muted">(${n} ${n === 1 ? 'Quelle' : 'Quellen'})</span></div>`;
    this.showMessage(clue.name, clue.text, { extra, face: sourceFace(s.content, clue), footer: isNew ? `Quelle: ${clue.source}. Im Notizbuch vermerkt.` : 'Steht bereits in deinem Notizbuch.' });
  }

  /** Paket G: eiserne Plakette beim Betreten eines Gefahrengebiets. */
  zoneBanner(map) {
    this.root.querySelector('.zonebanner')?.remove();
    const [x, y, w, h] = DANGER_BANNER;
    const el = document.createElement('div');
    el.className = 'zonebanner';
    el.style.cssText = `width:${w / 6}em;height:${h / 6}em;background-image:url(${DANGER_URL});background-size:${512 / 6}em ${1136 / 6}em;background-position:-${x / 6}em -${y / 6}em`;
    el.innerHTML = `<span>${esc(map.name)}</span><small>Gefahrenstufe ${map.danger}</small>`;
    this.root.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3400);
  }

  // --- Dialoge --------------------------------------------------------------

  openDialogue(npc, onClose) {
    const tree = this.state.content.dialogues[npc.dialogue];
    if (!tree) throw new Error(`Dialog fehlt: ${npc.dialogue}`);
    this.dialogue = { npc, tree, onClose, greeted: false };
    this.showNode(npc.start ?? this.state.pick(tree.start)); // CN: `start` erzwingt einen Knoten (Fahndung)
  }

  showNode(nodeId) {
    const s = this.state;
    const { npc, tree } = this.dialogue;
    const node = tree.nodes[nodeId];
    if (!node) throw new Error(`Dialogknoten fehlt: ${npc.dialogue}.${nodeId}`);
    this.sfx(uiSound('dialogue', 'dialog'), { volume: 0.7 });
    if (s.map === 'reise_landstrasse' && !this.dialogue.greeted) this.music?.cue?.('ls_ereignis', 45); // CL: Reiseereignis auf der Landstraße
    this.as(() => s.applyEffects(node, { nodeKey: `${npc.dialogue}.${nodeId}`, commandId: `${npc.dialogue}.${nodeId}@${Date.now()}` })); // BG: jeder bestätigte Schritt ist ein eigener Befehl
    if (node.combat) { this.dialogue.combat = true; if (npc.id) s.hostileAfterFight(npc.id, node.combat); }
    s.visitNode(npc.dialogue, nodeId);
    let text = node.text;
    // Beziehung: ein Begrüßungssatz je Stimmung, einmal pro Gespräch (nicht für Fundstücke und Objekte)
    if (!this.dialogue.greeted && npc.id && !npc.item) {
      this.dialogue.greeted = true;
      const g = s.greeting(npc.id);
      if (g) text = `${g}\n\n${text}`;
    }
    if (node.pathway_report) text += `\n\n${s.pathwayReport()}`;
    if (node.rank) {
      const r = s.rank();
      const next = s.nextRank();
      text += `\n\nRang: ${r.name} (Ansehen ${s.honor}). ${r.text}${next ? `\n\nNächster Rang: ${next.name} ab ${next.min}. ${next.text}` : ''}`;
    }
    // Rat der Inspektorin: konkrete Hinweise, wo man schauen und wen man fragen soll (Guide.advice)
    if (node.hint) text += `\n\n${advice(s, npc.id).map((l) => `„${l}“`).join('\n\n')}`;
    // Hierher kam man nur, weil der bessere Zweig am Wissen scheiterte: dann steht dabei, was genau fehlt
    if (this.dialogue.blockedNote) { text += `\n\n${this.dialogue.blockedNote}`; this.dialogue.blockedNote = null; }
    // Sichtbare Optionen + wegen Ansehen gesperrte Optionen (ausgegraut mit Hinweis)
    const choices = [];
    this.as(() => { for (const c of node.choices ?? []) { // Bedingungen gelten für den Spieler, der das Gespräch führt (Pfad, Tasche, Ansprüche)
      if (s.meets(c)) {
        // Die Option geht, aber ihr bester Zweig scheitert noch am Wissen (z. B. „zweite Quelle“): das steht gleich dabei
        const weak = Array.isArray(c.next) ? c.next.find((v) => !s.meets(v)) : null;
        const chosen = Array.isArray(c.next) ? c.next.find((v) => s.meets(v)) : null;
        const gaps = weak && chosen && c.next.indexOf(weak) < c.next.indexOf(chosen) && onlyKnowledgeMissing(s, weak) ? knowledgeGaps(s, weak) : [];
        choices.push({ ...c, ...(gaps.length ? { note: `Noch nicht wasserdicht: ${gaps.map((g) => gapText(g)).join(' ')}` } : {}) });
      } else if (c.requires_honor !== undefined && s.honor < c.requires_honor && s.meets({ ...c, requires_honor: undefined })) {
        choices.push({ ...c, locked: `Rang ${s.rank(c.requires_honor).name} (Ansehen ${c.requires_honor}) nötig` });
      } else if (onlyKnowledgeMissing(s, c) && !c.hidden_lock) {
        // Fehlt nur Wissen, bleibt die Option sichtbar und sagt, was noch fehlt
        const gaps = knowledgeGaps(s, c);
        if (gaps.length) choices.push({ ...c, locked: gaps.map((g) => gapText(g)).join(' ') });
      }
    } });
    // Beziehung: Geschenke im Menü einer Figur (Start- oder Hub-Knoten), vor der letzten Option
    const menu = nodeId === (tree.nodes.start ? 'start' : tree.start && tree.nodes[tree.start] ? tree.start : 'hub');
    if (menu && npc.id && !npc.item && s.content.npcs[npc.id] && !node.ending && !node.combat && (node.choices ?? []).length) {
      choices.splice(Math.max(0, choices.length - 1), 0, { text: 'Etwas schenken …', gift: true });
      // Seq-5-Rituale: dem Bürger eine Erinnerung nehmen (Moor), als gestohlene Identität auftreten (Maske)
      if (this.as(() => s.canTakeMemory(npc.id))) choices.splice(Math.max(0, choices.length - 1), 0, { text: 'Eine Erinnerung nehmen …', moor: true });
      if (this.as(() => s.canImpersonate(npc.id))) choices.splice(Math.max(0, choices.length - 1), 0, { text: `Als ${this.as(() => s.maskeIdentity())?.name ?? '…'} auftreten …`, maske: true });
      this.dialogue.menuNode = nodeId;
    }
    if (choices.filter((c) => !c.locked).length === 0) choices.push({ text: node.ending ? 'Weiter' : 'Ende' });
    this.dialogue.choices = choices;
    let n = 0;
    const face = portrait(npc.id, node.mood ?? lonerMood(this.state, npc.id) ?? relationMood(this.state, npc.id) ?? (AK_FIGURES.has(npc.id) ? guessMood(node.text) : undefined));
    // Paket H: Nahansicht beim Untersuchen, verflucht bei Schaden oder Kampf; Risiko-Effekt über dem Bild
    const risk = npc.item ? riskOf(node) : null;
    const closeup = npc.item && inspectUrl(npc.item)
      ? `<img class="scene inspect" src="${inspectUrl(npc.item, risk === 'curse' || risk === 'ambush')}" alt="" onerror="this.remove()">` : '';
    if (risk) this.scene?.playRiskFx?.(risk);
    if (npc.item && nodeId !== tree.start) this.scene?.playInspect?.(risk === 'curse' || risk === 'ambush' ? 'flinch' : risk === 'bonus_clue' ? 'note' : risk === 'unrest' ? 'clutch_head' : 'read');
    const el = this.open('dialogue', `${closeup || sceneImg(node.scene)}${wantedImg(node.wanted, node.wanted_caught)}${face}
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span>${relationBadge(this.state, npc.id)}</div>${lonerBar(this.state, npc.id)}
      <div class="text">${paragraphs(text)}</div>
      <ol class="choices">${choices.map((c, i) => (c.locked
        ? `<li><button disabled class="locked">${uiSprite('locked', /^Rang/.test(c.locked) ? 'schloss' : 'gespraech', 1 / 16, 'lockico')}${esc(c.text)} <span class="lockinfo">${esc(c.locked)}</span></button></li>`
        : `<li><button data-i="${i}"><span class="key">${++n}</span> ${choiceRisk(c.text) ? riskIcon(choiceRisk(c.text), RISK_TITLES[choiceRisk(c.text)]) : ''}${esc(c.text)}${c.note ? `<span class="lockinfo note">${esc(c.note)}</span>` : ''}</button></li>`)).join('')}</ol>`, `dialogue${face ? ' with-portrait' : ''}`);
    this.dialogue.keyMap = choices.map((c, i) => (c.locked ? null : i)).filter((i) => i !== null);
    el.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => this.choose(Number(b.dataset.i)); });
  }

  choose(i) {
    const choice = this.dialogue?.choices[i];
    if (!choice || choice.locked) return;
    if (choice.gift) { this.openGift(); return; }
    if (choice.moor) { this.openMoor(); return; }
    if (choice.maske) { this.openMaske(); return; }
    if (choice.shop || choice.vault || choice.expert || choice.auction || choice.signal_station) {
      const { onClose } = this.dialogue;
      this.dialogue = null;
      onClose?.();
      if (choice.signal_station) this.openSignalStation(choice.signal_station); // BN
      else if (choice.auction) this.openAuction(choice.auction);
      else if (choice.shop) this.openShop(choice.shop, choice.shop_mode === 'sell' && this.state.merchant(choice.shop)?.buys ? 'sell' : 'buy'); // shop_mode: 'sell' öffnet gleich den Ankauf
      else if (choice.vault) this.openVault();
      else this.openExpert();
      return;
    }
    const next = this.as(() => this.state.pick(choice.next));
    if (next) {
      if (Array.isArray(choice.next)) {
        const chosen = choice.next.find((v) => v.node === next && this.as(() => this.state.meets(v)));
        const skipped = choice.next.slice(0, choice.next.indexOf(chosen)).filter((v) => onlyKnowledgeMissing(this.state, v));
        const gaps = skipped.flatMap((v) => knowledgeGaps(this.state, v));
        if (gaps.length) this.dialogue.blockedNote = `Dir fehlt noch: ${[...new Set(gaps.map((g) => gapText(g)))].join(' ')}`;
      }
      this.showNode(next);
      return;
    }
    const { onClose, combat } = this.dialogue;
    this.dialogue = null;
    this.close();
    onClose?.({ combat: !!combat });
  }

  /** Beziehung: etwas aus der eigenen Tasche verschenken; danach zurück ins Gespräch. */
  openGift(feedback = '') {
    const s = this.state;
    const { npc } = this.dialogue;
    const items = this.as(() => s.giftOptions(npc.id));
    const who = s.hasP2() ? ` <span class="muted">aus der Tasche von Spieler ${this.actor}</span>` : '';
    const tastes = s.giftTastes(npc.id);
    const known = tastes.kinds.map((k) => GIFT_KINDS[k] ?? k).join(', ');
    const FIT = { mag: ['gefällt', 'fit-mag'], wertvoll: ['wertvoll', 'fit-wert'], hass: ['verhasst', 'fit-hass'], nein: ['', ''] };
    const tag = (it) => (FIT[it.fit]?.[0] ? `<span class="fittag ${FIT[it.fit][1]}">${FIT[it.fit][0]}</span>` : '');
    const el = this.open('gift', `${portrait(npc.id, relationMood(s, npc.id))}
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span>${relationBadge(s, npc.id)}</div>
      <h3>Etwas schenken${who}</h3>
      <p class="tastes">Hat ein Auge für <b>${esc(known)}</b>${s.relationRules().geschenk_wert ? `; Wertvolles (ab ${s.relationRules().geschenk_wert} Schilling) nimmt jeder an` : ''}. Zählt bis zu ${s.relationRules().geschenk_max} Mal${(s.gifts[npc.id] ?? 0) ? ` (${Math.min(s.gifts[npc.id], s.relationRules().geschenk_max)} schon)` : ''}.</p>
      ${feedback ? `<div class="feedback">${esc(feedback)}</div>` : ''}
      <ul class="choices giftlist">${items.map((it, i) => `<li><button data-gift="${it.id}" class="${it.fit}">${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${itemIcon(it.id)}${esc(it.name)} <span class="muted">×${it.count}</span>${tag(it)}</button></li>`).join('') || '<li class="empty">Du hast nichts, was du verschenken könntest.</li>'}</ul>
      <div class="actions"><button data-act="back">Zurück <span class="key">Esc</span></button></div>`, `dialogue with-portrait gift`);
    this.giftIds = items.map((it) => it.id);
    el.querySelectorAll('[data-gift]').forEach((b) => { b.onclick = () => this.giveGift(b.dataset.gift); });
    el.querySelector('[data-act=back]').onclick = () => this.closeGift();
  }

  giveGift(itemId) {
    const r = this.as(() => this.state.giveGift(this.dialogue.npc.id, itemId));
    this.sfx(worldSound('gift', r));
    this.openGift(r.text);
  }

  /** Zurück ins Menü der Figur (ohne neue Begrüßung). */
  closeGift() {
    this.showNode(this.dialogue.menuNode);
  }

  // --- Seq-5-Rituale im Gespräch (core/Seq5.js) ----------------------------------------------------
  /** Moor: der Bürger bietet drei Erinnerungen an; die seiner Herkunft darf man nicht nehmen. */
  openMoor() {
    const s = this.state;
    const { npc } = this.dialogue;
    const mems = this.as(() => s.moorMemories(npc.id));
    this.moorCount = mems.length;
    const el = this.open('moor', `${portrait(npc.id, relationMood(s, npc.id))}
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span>${relationBadge(s, npc.id)}</div>
      <h3>Eine Erinnerung nehmen</h3>
      <p class="tastes">Du hältst das leere Gefäß unter dem Tisch und lässt ${esc(npc.name)} reden. Drei Dinge kommen zur Sprache. Eines davon ist die Herkunft, und die bewahrt das Moor: Greifst du danach, springt das Glas. Hör genau hin.</p>
      <ul class="choices giftlist">${mems.map((m, i) => `<li><button data-mem="${i}"><span class="key">${i + 1}</span> „${esc(m.text[0].toUpperCase() + m.text.slice(1))}“</button></li>`).join('')}</ul>
      <div class="actions"><button data-act="back">Doch nicht <span class="key">Esc</span></button></div>`, 'dialogue with-portrait gift');
    el.querySelectorAll('[data-mem]').forEach((b) => { b.onclick = () => this.moorPick(Number(b.dataset.mem)); });
    el.querySelector('[data-act=back]').onclick = () => this.closeGift();
  }

  moorPick(i) {
    const { npc } = this.dialogue;
    const r = this.as(() => this.state.takeMemory(npc.id, i));
    if (!r.ok && r.passed === undefined) { this.openMoor(); this.toast(r.text, 'bad'); return; }
    this.sfx(worldSound('ritual', r));
    this.dialogue = null;
    this.close();
    this.showMessage(r.passed ? 'Die Erinnerung ist im Glas' : 'Das Glas springt', r.text);
  }

  /** Maske: zwei Fragen zum Steckbrief der gestohlenen Identität. */
  openMaske() {
    const s = this.state;
    const { npc } = this.dialogue;
    if (!s.maskeQuiz || s.maskeQuiz.npc !== npc.id) {
      const r = this.as(() => s.startImpersonation(npc.id));
      if (!r.ok) { this.closeGift(); return; }
    }
    const quiz = s.maskeQuiz;
    const round = quiz.rounds[quiz.step];
    this.maskeOptions = round.options;
    const el = this.open('maske', `${portrait(npc.id, relationMood(s, npc.id))}
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span>${relationBadge(s, npc.id)}</div>
      <h3>Als ${esc(this.as(() => s.maskeIdentity())?.name ?? '')} auftreten <span class="muted">Frage ${quiz.step + 1} von ${quiz.rounds.length}</span></h3>
      <p class="tastes">${esc(npc.name)} mustert dich. ${esc(round.prompt)}</p>
      <p class="muted">Eine falsche Antwort, und die Maske fällt: −${FAIL_PCT.maske} % Verdauung, und alle, die du angesprochen hast, misstrauen dir für immer.</p>
      <ul class="choices giftlist">${round.options.map((o, i) => `<li><button data-opt="${i}"><span class="key">${i + 1}</span> ${esc(o)}</button></li>`).join('')}</ul>
      <div class="actions"><button data-act="back">${quiz.step > 0 ? 'Verstummen (gilt als enttarnt)' : 'Doch nicht'} <span class="key">Esc</span></button></div>`, 'dialogue with-portrait gift');
    el.querySelectorAll('[data-opt]').forEach((b) => { b.onclick = () => this.maskePick(Number(b.dataset.opt)); });
    el.querySelector('[data-act=back]').onclick = () => this.cancelMaske();
  }

  maskePick(i) {
    const r = this.as(() => this.state.answerImpersonation(i));
    if (!r.ok && r.passed === undefined) return;
    if (r.next) { this.sfx(uiSound('probe', 'ok')); this.openMaske(); return; }
    this.sfx(worldSound('ritual', r));
    this.dialogue = null;
    this.close();
    this.showMessage(r.passed ? 'Die Maske hält' : 'Die Maske fällt', r.text);
  }

  cancelMaske() {
    const r = this.as(() => this.state.cancelImpersonation());
    if (r?.passed === false) { this.dialogue = null; this.close(); this.showMessage('Die Maske fällt', r.text); return; }
    this.closeGift();
  }

  // --- Stadtkarte ----------------------------------------------------------------

  /** Gemalte Stadtkarte: Marker für jeden freigeschalteten Ort, danach die Reiseart. */
  openTravel(current) {
    const s = this.state;
    const all = s.content.travelRules;
    // Kapitel 2: Jede Stadt hat ihre eigene Karte (Wexmoor vorerst ohne gemaltes Bild, nur Ziele als Liste).
    const cityRules = all.cities?.[cityOf(s, current)];
    const rules = cityRules ? { ...cityRules, pins: cityRules.pins ?? {} } : all;
    const dests = travelDestinations(s, current);
    this.travelDests = dests;
    this.travelPick = null;
    this.travelFrom = current;
    const pins = rules.pins ?? {};
    this.travelPins = pins;
    const goal = s.tracked && journalQuestVisible(s, s.tracked) ? questTarget(s, s.tracked) : leadTarget(s, s.openLeads()[0]);
    const goalMap = goal?.district ?? null;
    const meetMap = s.gatheringTarget?.()?.district ?? null;
    this.personMap = null;
    // Gemerkte Person aus dem Notizbuch: ihr Gesicht hängt an jedem Bezirk, in dem sie sein kann
    const who = this.personPin ? personPlaces(s, this.personPin).filter((p) => p.district && p.city === cityOf(s, current)) : [];
    const whoFace = who.length ? headFace(this.personPin, esc(s.content.npcs[this.personPin]?.name ?? '')) : '';
    const pin = (map, cls, inner, attrs = '') => {
      if (map === meetMap) { cls += ' goal meet'; inner += `${questUi('qpin', QUEST_PINS.amber)}<span class="goaltag">Treffen</span>`; }
      else if (map === goalMap) { cls += ' goal'; inner += `${questUi('qpin', QUEST_PINS.amber)}<span class="goaltag">Ziel</span>`; }
      const there = who.filter((p) => p.district === map);
      if (there.length) inner += `<span class="who${there.some((p) => p.now) ? ' now' : ''}">${whoFace}</span>`;
      const sk = s.sektenAktiveAuf?.(map)[0]; // BQ: laufendes Sektenereignis in diesem Viertel
      if (sk) inner += `<span class="skpin">${uiSprite('skpins', `${{ sk_asche: 'asche', sk_flut: 'flut', sk_chor: 'chor' }[sk.kult]}_aktiv`, 1 / 6, '', sk.titel)}</span>`;
      return this.mapPin(pins, map, cls, inner, attrs);
    };
    const here = pins[current] ? pin(current, 'here', `<span class="youmark" style="background-image:url(${TRAVEL_MARKER_URL})"></span><span class="tag">Du bist hier</span>`, 'disabled') : '';
    const destPins = dests.map((d, i) => (pins[d.map] ? pin(d.map, '', `<span class="num">${i + 1}</span><span class="tag">${esc(d.name)}</span>`, `data-i="${i}"`) : '')).join('');
    // Ziel liegt in einem noch gesperrten Viertel: trotzdem zeigen, damit man weiß, wo es ist und wie man hinkommt.
    const lockedPin = goal?.locked && pins[goalMap] && !dests.some((d) => d.map === goalMap) && goalMap !== current
      ? pin(goalMap, 'locked', `<span class="tag">${esc(goal.locked.name)} (gesperrt)</span>`, 'disabled') : '';
    const unpinned = dests.map((d, i) => (pins[d.map] ? '' : `<button data-i="${i}"><span class="key">${i + 1}</span> ${esc(d.name)}</button>`)).join('');
    const el = this.open('travel', `
      <div class="map${rules.map_image ? '' : ' plain'}"${rules.map_image ? ` style="background-image:${rules.overlay_image ? `url(${SPRITE_BASE}${rules.overlay_image}),` : ''}url(${SPRITE_BASE}${rules.map_image})"` : ''}>
        ${rules.fog_image ? '<canvas class="fog" width="480" height="270"></canvas>' : ''}
        ${here}${destPins}${lockedPin}
        ${unpinned ? `<div class="unpinned">${unpinned}</div>` : ''}
      </div>
      <div class="modes hidden"></div>
      <div class="mapbar">
        <div class="info"><h3>${esc(rules.title ?? 'Stadtkarte von Kettlegate')}</h3><span class="muted">${goal?.map ? `Ziel: ${esc(this.goalText(goal))}` : 'Wähle ein Ziel mit Zahl oder Klick.'}</span></div>
        <button data-act="stay"><span class="key">Esc</span> Hierbleiben</button>
      </div>`, 'citymap');
    el.querySelectorAll('[data-i]').forEach((b) => {
      b.onclick = () => this.travel(Number(b.dataset.i));
      b.onmouseenter = () => { if (this.travelPick === null) this.travelInfo(dests[Number(b.dataset.i)]); };
    });
    el.querySelector('[data-act=stay]').onclick = () => (this.travelPick === null ? this.close() : this.openTravel(current));
    const fog = el.querySelector('canvas.fog');
    if (fog) this.drawFog(fog, `${SPRITE_BASE}${rules.fog_image}`, [current, ...dests.map((d) => d.map), ...(lockedPin ? [goalMap] : [])].map((m) => pins[m]).filter(Boolean));
  }

  /** Ein Marker auf der Stadtkarte: Ortsbild aus dem Marker-Satz, dazu beliebiger Inhalt (Nummer, Schild, Gesicht). */
  mapPin(pins, map, cls, inner, attrs = '') {
    const [x, y] = pins[map];
    const [url, cell = 0, cols = 13, live = false, grid = null] = mapMarkerOf(map);
    const col = cell % cols;
    const size = grid ? `${cols * 2}em ${grid.rows * 2}em;--r:${grid.row}` : `${cols * 2}em ${live ? 8 : 4}em`;
    return `<button class="pin ${cls}${live ? ' live' : ''}" ${attrs} style="left:${x / 8}em;top:${y / 8}em">
      <span class="mk${grid ? ' one' : ''}" style="--c:${col};background-image:url(${url});background-size:${size}"></span>${inner}</button>`;
  }

  /**
   * Wegweiser zu einer Person (Notizbuch → Personen → Klick): die Stadtkarte zeigt jeden Ort, an dem die Figur
   * stehen kann. Orte, an denen sie gerade ist, leuchten; die übrigen stehen als „sonst“ dabei. Nur ansehen, kein Reisen.
   * Die Person bleibt danach auf der Reisekarte markiert, bis man die Markierung im Notizbuch oder hier löscht.
   */
  openPersonMap(npcId) {
    const s = this.state;
    const npc = s.content.npcs[npcId];
    const places = personPlaces(s, npcId);
    if (!npc || !places.length) return;
    this.personPin = npcId;
    this.nextOpenSound = this.modal === 'travel' ? null : uiSound('personmap');
    if (this.modal === 'notebook') this.sfx(uiSound('notebook', 'wegweiser')); // CM: Person angeklickt, Wegweiser zeigt alle Aufenthaltsorte
    const all = s.content.travelRules;
    const ownCity = cityOf(s, s.map);
    const city = places.some((p) => p.city === ownCity) ? ownCity : places[0].city;
    const cityRules = all.cities?.[city];
    const rules = cityRules ? { ...cityRules, pins: cityRules.pins ?? {} } : all;
    const pins = rules.pins ?? {};
    this.travelDests = [];
    this.travelPick = null;
    this.travelFrom = s.map;
    this.travelPins = pins;
    // Ein Marker je Bezirk; mehrere Karten im selben Bezirk (z. B. Haus und Gasse) teilen sich den Marker
    const groups = new Map();
    for (const p of places.filter((x) => x.city === city)) {
      const key = p.district ?? p.map;
      const g = groups.get(key) ?? { district: p.district, now: false, names: [], locked: p.locked };
      g.now ||= p.now;
      if (!g.names.includes(p.mapName)) g.names.push(p.mapName);
      groups.set(key, g);
    }
    const name = esc(npc.name);
    const face = headFace(npcId, name);
    const label = (g) => `${esc(g.names.join(' / '))}${g.locked ? ' (gesperrt)' : ''}${g.now ? '' : ' · sonst'}`;
    const marked = [...groups.values()].filter((g) => g.district && pins[g.district]);
    const personPins = marked.map((g) => this.mapPin(pins, g.district, `person ${g.now ? 'now' : 'maybe'}${g.locked ? ' locked' : ''}`, `${face}<span class="tag">${label(g)}</span>`, 'disabled')).join('');
    const sameCity = city === ownCity && pins[s.map];
    const here = sameCity ? this.mapPin(pins, s.map, 'here', `<span class="youmark" style="background-image:url(${TRAVEL_MARKER_URL})"></span><span class="tag">Du bist hier</span>`, 'disabled') : '';
    const unpinned = [...groups.values()].filter((g) => !marked.includes(g)).map((g) => `<button disabled>${face} ${label(g)}</button>`).join('');
    const elsewhere = places.filter((p) => p.city !== city);
    // Stadtname aus dem Kartentitel („Stadtkarte von Wexmoor“ → Wexmoor), sonst die Kennung mit großem Anfangsbuchstaben
    const cityName = (id) => all.cities?.[id]?.title?.replace(/^Stadtkarte von /, '') ?? (id === 'kettlegate' ? 'Kettlegate' : id[0].toUpperCase() + id.slice(1));
    const nowNames = places.filter((p) => p.city === city && p.now).map((p) => p.mapName);
    const laterNames = places.filter((p) => p.city === city && !p.now).map((p) => p.mapName);
    const summary = [nowNames.length ? `jetzt: ${nowNames.join(', ')}` : 'gerade nirgends anzutreffen',
      laterNames.length ? `sonst: ${laterNames.join(', ')}` : '',
      elsewhere.length ? `außerdem in ${[...new Set(elsewhere.map((p) => cityName(p.city)))].join(', ')}: ${elsewhere.map((p) => p.mapName).join(', ')}` : ''].filter(Boolean).join(' · ');
    const el = this.open('travel', `
      <div class="map${rules.map_image ? '' : ' plain'}"${rules.map_image ? ` style="background-image:url(${SPRITE_BASE}${rules.map_image})"` : ''}>
        ${rules.fog_image ? '<canvas class="fog" width="480" height="270"></canvas>' : ''}
        ${here}${personPins}
        ${unpinned ? `<div class="unpinned">${unpinned}</div>` : ''}
      </div>
      <div class="modes hidden"></div>
      <div class="mapbar">
        <div class="info">${face}<h3>Wo ist ${name}?</h3><span class="muted">${esc(summary)}</span></div>
        <button data-act="unpin">Markierung löschen</button>
        <button data-act="stay"><span class="key">Esc</span> Zurück zum Notizbuch</button>
      </div>`, 'citymap personmap');
    this.personMap = npcId;
    el.querySelector('[data-act=stay]').onclick = () => this.openNotebook('personen');
    el.querySelector('[data-act=unpin]').onclick = () => { this.personPin = null; this.openNotebook('personen'); };
    const fog = el.querySelector('canvas.fog');
    if (fog) this.drawFog(fog, `${SPRITE_BASE}${rules.fog_image}`, [...(sameCity ? [s.map] : []), ...marked.map((g) => g.district)].map((m) => pins[m]).filter(Boolean));
  }

  /** Paket I: gestrichelte Route vom Standort zum Ziel (I_reise_routen.png), am Ziel ein Fähnchen. */
  drawRoute(map, from, to) {
    map?.querySelector('.route')?.remove();
    if (!map || !from || !to) return;
    const [x0, y0] = from;
    const [x1, y1] = to;
    const len = Math.hypot(x1 - x0, y1 - y0);
    const angle = Math.atan2(y1 - y0, x1 - x0);
    const n = Math.max(1, Math.floor(len / 9));
    const dots = Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      return `<span class="seg" style="left:${(x0 + (x1 - x0) * t) / 8}em;top:${(y0 + (y1 - y0) * t) / 8}em;transform:translate(-50%,-50%) rotate(${angle}rad) scale(1.6)"></span>`;
    }).join('');
    map.insertAdjacentHTML('beforeend', `<div class="route">${dots}<span class="flag" style="left:${x1 / 8}em;top:${y1 / 8}em"></span></div>`);
  }

  /** Nebel über der Stadtkarte; um bekannte Orte herum lichtet er sich. */
  drawFog(canvas, url, spots) {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
      ctx.globalCompositeOperation = 'destination-out';
      for (const [x, y] of spots) {
        const g = ctx.createRadialGradient(x, y, 18, x, y, 54);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 54, y - 54, 108, 108);
      }
    };
    img.src = url;
  }

  travelInfo(d) {
    const info = this.layer.querySelector('.citymap .info');
    if (info) info.innerHTML = `${PLACE_PICTURES[d.map] ? `<img class="placepic" src="${PLACE_PICTURES[d.map]}" alt="">` : ''}<h3>${esc(d.name)}</h3><span class="muted">${esc(d.desc)}</span>`;
  }

  /** Ziel gewählt: jetzt die Reiseart. */
  travel(i) {
    const d = this.travelDests?.[i];
    if (!d) return;
    const s = this.state;
    const rules = s.content.travelRules;
    if (d.direct) { // Zugfahrt zwischen den Städten: keine Reiseart, direkt hin
      this.sfx(worldSound('travel', { direct: true, to: d.map }));
      this.close();
      this.scene.travelTo(d.map, d.spawn);
      return;
    }
    this.travelPick = d;
    this.travelInfo(d);
    const el = this.layer.querySelector('.citymap');
    el.querySelectorAll('.pin[data-i]').forEach((p) => p.classList.toggle('sel', Number(p.dataset.i) === i));
    this.drawRoute(el.querySelector('.map'), this.travelPins?.[this.travelFrom], this.travelPins?.[d.map]);
    const safe = rules.modes.sicher;
    const fast = rules.modes.schnell;
    const hurry = canHurry(s);
    const modes = el.querySelector('.modes');
    modes.classList.remove('hidden');
    modes.innerHTML = `
      <button class="mode safe" data-mode="sicher">${modeIcon('sicher')}<b><span class="key">1</span> ${esc(safe.name)}</b>
        <span class="muted">${esc(safe.desc)}</span><span class="gain">+${Math.round(s.maxHp * safe.heal_pct)} Leben · +${safe.nerves} Nerven · Journal</span></button>
      <button class="mode fast" data-mode="schnell" ${hurry ? '' : 'disabled'}>${modeIcon('schnell')}<b><span class="key">2</span> ${esc(fast.name)}</b>
        <span class="muted">${esc(fast.desc)}</span><span class="cost">${hurry ? `−${hurryCost(s)} Nerven · Monster · Beute` : s.isOverloaded() ? `Zu schwer beladen (${s.carryText()})` : `Zu wenig Nerven (mind. ${hurryCost(s)})`}</span></button>`;
    const fee = s.sektenReiseAufschlag?.(this.travelFrom) ?? 0; // BQ: gesperrte Fähre/Bahn
    if (fee) modes.insertAdjacentHTML('beforeend', `<p class="muted skfee">Die Überfahrt ist gestört: ${fee} Schilling Aufschlag, bis jemand die Sperre löst.</p>`);
    modes.querySelectorAll('[data-mode]').forEach((b) => {
      b.onclick = () => this.travelMode(b.dataset.mode);
      b.onmouseenter = () => el.querySelector('.route')?.classList.toggle('schnell', b.dataset.mode === 'schnell');
    });
    el.querySelector('[data-act=stay] .key').nextSibling.textContent = ' Anderes Ziel';
  }

  travelMode(mode) {
    const d = this.travelPick;
    if (!d) return;
    const s = this.state;
    const fee = s.sektenReiseAufschlag?.(this.travelFrom) ?? 0;
    if (fee) { s.addMoney(-fee); this.toast(`Aufschlag an der Sperre: −${fee} Schilling`, 'warn'); }
    const go = () => this.scene.travelTo(d.map, d.spawn);
    this.sfx(worldSound('travel', { mode, city: cityOf(s, s.map) })); // Y: Kutsche rumpelt, in Wexmoor rudert man die Abkürzung
    if (mode === 'sicher') {
      const r = travelSafe(s);
      const parts = [`Die Kutsche rumpelt über das Kopfsteinpflaster nach ${d.name}. Du lehnst dich zurück und schlägst dein Journal auf.`];
      if (r.hint) parts.push(`${r.hint.quest}: ${r.hint.text}`);
      if (r.review) parts.push(`Eine Notiz, die noch auf eine zweite Quelle wartet: „${r.review}“`);
      if (!r.hint && !r.review) parts.push('Keine offenen Fragen. Du genießt den Blick auf die nebligen Straßen.');
      const gains = [r.healed > 0 ? `+${r.healed} Leben` : '', r.nerves > 0 ? `+${r.nerves} Nerven` : ''].filter(Boolean).join(', ');
      this.showMessage('Unterwegs: Journal lesen', parts.join('\n\n'), { footer: gains || 'Du bist ausgeruht.', onClose: go });
      return;
    }
    if (mode !== 'schnell' || !canHurry(s)) return;
    const ev = travelFast(s);
    if (ev.encounter) {
      this.showMessage(ev.title, ev.text, {
        scene: ev.id,
        footer: 'Ein Kampf steht bevor.',
        onClose: () => this.scene.startCombat(ev.encounter, (result) => {
          const loot = afterHurryFight(s, ev, result.outcome);
          // Nach der Kampfmeldung: Beute zeigen und weiterreisen
          this.afterClose = () => {
            if (loot.length) this.showMessage('Beute', `Du durchsuchst die Stelle und findest:\n${loot.join('\n')}`, { onClose: go });
            else go();
          };
        }),
      });
      return;
    }
    const lines = [ev.text];
    if (ev.loot?.length) lines.push(`Gefunden:\n${ev.loot.join('\n')}`);
    const footer = [ev.damage ? `−${ev.damage} Leben` : '', ev.lostMoney ? `−${ev.lostMoney} Schilling` : ''].filter(Boolean).join(', ');
    this.showMessage(ev.title, lines.join('\n\n'), { footer, onClose: go, scene: ev.id });
  }

  // --- Notizbuch ---------------------------------------------------------------

  openNotebook(tab, who = null) {
    this.selected = [];
    if (tab) this.tab = tab;
    if (who) this.invPlayer = who;
    this.renderNotebook('');
  }

  visibleCases() {
    const s = this.state;
    return s.content.cases.filter((c) => s.knownFacts(c.id).length > 0
      || Object.keys(s.quests).some((q) => s.quest(q).case === c.id && c.id !== 'side'));
  }

  renderNotebook(feedback) {
    const all = this.visibleCases();
    const solved = all.filter((c) => isSolved(this.state, c.id));
    const cases = all.filter((c) => !solved.includes(c));
    const beasts = this.knownBeasts();
    const papers = this.state.paperArchive();
    const fixed = ['quests', 'items', 'pfad', 'personen', 'kulte', 'bestiar', 'zeitung', 'archiv'];
    if (this.tab === 'kulte' && !this.state.sektenFrei?.()) this.tab = 'quests';
    if (this.tab === 'zeitung' && !papers.length) this.tab = 'quests';
    if (this.tab === 'archiv' && !solved.length) this.tab = 'quests';
    if (this.tab === 'bestiar' && !beasts.length) this.tab = 'quests';
    // Ein gelöster Fall wird im Archiv geöffnet
    if (solved.some((c) => c.id === this.tab)) { this.archiveCase = this.tab; this.tab = 'archiv'; }
    if (!fixed.includes(this.tab) && !cases.some((c) => c.id === this.tab)) this.tab = 'quests';
    if (this.tab === 'archiv' && !solved.some((c) => c.id === this.archiveCase)) this.archiveCase = solved.at(-1)?.id;
    const tabs = [{ id: 'quests', title: 'Aufträge' }, { id: 'items', title: 'Inventar' }, { id: 'pfad', title: 'Pfad' }, { id: 'personen', title: 'Personen' },
      ...(this.state.sektenFrei?.() ? [{ id: 'kulte', title: 'Kulte' }] : []), // BQ: Umtriebe der drei Sekten
      ...(beasts.length ? [{ id: 'bestiar', title: 'Bestiarium' }] : []),
      ...(papers.length ? [{ id: 'zeitung', title: 'Zeitung' }] : []),
      ...cases.map((c) => ({ id: c.id, title: c.title.replace(/:.*/, '') })), ...(solved.length ? [{ id: 'archiv', title: `Archiv (${solved.length})` }] : [])];
    const caseId = this.currentCase();
    const body = this.tab === 'quests' ? this.questsHtml() + this.signalJournalHtml() : this.tab === 'items' ? this.itemsHtml() : this.tab === 'pfad' ? this.pathwayTabHtml()
      : this.tab === 'personen' ? this.peopleHtml() : this.tab === 'kulte' ? this.kulteHtml() : this.tab === 'bestiar' ? this.bestiaryHtml(beasts) : this.tab === 'zeitung' ? this.papersHtml(papers)
      : this.tab === 'archiv' ? this.archiveHtml(solved) : this.caseHtml(this.tab);
    const isCase = !!caseId;
    const el = this.open('notebook', `
      <div class="tabs">${tabs.map((t, i) => `<button class="tab ${t.id === this.tab ? 'sel' : ''}" data-tab="${t.id}"><span class="key">${i + 1}</span> ${uiSprite('icons', TAB_ICONS[t.id] ?? 'lupe', 1 / 16, 'tabico')}${esc(t.title)}</button>`).join('')}
        <span class="rankinfo">${uiSprite('ranks', `r${Math.max(0, Math.min(4, this.state.content.ranks.indexOf(this.state.rank())))}`, 1 / 16, 'rankbadge')}${esc(this.state.rank().name)} · Ansehen ${this.state.honor}</span></div>
      ${body}
      <div class="feedback">${feedback}</div>
      <div class="actions">
        ${isCase ? `<button class="primary" data-act="combine" ${this.selected.length === 2 ? '' : 'disabled'}>Verknüpfen <span class="key">V</span></button>` : ''}
        ${isCase && this.state.autoLinkFrei() ? `<button data-act="autocombine" title="Zieht alle Verbindungen, deren Informationen schon im Notizbuch stehen">Auto-Verknüpfen <span class="key">A</span></button>` : ''}
        <button data-act="close">Schließen <span class="key">J</span></button>
      </div>`, 'notebook');
    this.notebookTabs = tabs;
    el.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { if (this.tab !== b.dataset.tab) this.sfx(uiSound('notebook', 'tab')); this.tab = b.dataset.tab; this.selected = []; this.forgetScroll(); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-itemcat]').forEach((b) => { b.onclick = () => { if (this.itemCat !== b.dataset.itemcat) this.sfx(uiSound('notebook', 'page')); this.itemCat = b.dataset.itemcat; this.forgetScroll('notebook', /^UL\./); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-fact]').forEach((b) => { b.onclick = () => this.toggleFact(b.dataset.fact); });
    el.querySelectorAll('[data-quest-case]').forEach((b) => { b.onclick = (event) => {
      event.stopPropagation();
      this.sfx(uiSound('notebook', 'page'));
      this.forgetScroll();
      this.openNotebook(b.dataset.questCase);
    }; });
    el.querySelector('[data-act=quests]')?.addEventListener('click', () => { this.sfx(uiSound('notebook', 'page')); this.forgetScroll(); this.openNotebook('quests'); });
    el.querySelectorAll('[data-archive]').forEach((b) => { b.onclick = () => { this.sfx(uiSound('notebook', 'page')); this.archiveCase = b.dataset.archive; this.selected = []; this.forgetScroll(); this.renderNotebook(''); }; });
    el.querySelector('[data-act=combine]')?.addEventListener('click', () => this.combine());
    el.querySelector('[data-act=autocombine]')?.addEventListener('click', () => this.autoCombine());
    const inv = (fn) => this.as(fn, this.tab === 'items' || this.tab === 'pfad' ? this.invPlayer : 1);
    el.querySelectorAll('[data-use]').forEach((b) => { b.onclick = () => { this.sfx(worldSound('use', { id: b.dataset.use })); this.renderNotebook(esc(inv(() => this.state.useItem(b.dataset.use)) ?? '')); }; });
    el.querySelectorAll('[data-equip]').forEach((b) => { b.onclick = () => { if (inv(() => this.state.equip(b.dataset.equip))) this.sfx(worldSound('equip')); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-unequip]').forEach((b) => { b.onclick = () => { inv(() => this.state.unequipWeapon()); this.renderNotebook('Du kämpfst jetzt mit bloßen Fäusten. Die Korruption ruht.'); }; });
    el.querySelectorAll('[data-aside]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(inv(() => this.state.setAsideArtifact(b.dataset.aside)).text)); });
    el.querySelectorAll('[data-takeup]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(inv(() => this.state.takeUpArtifact(b.dataset.takeup)).text)); });
    el.querySelectorAll('[data-cleanse]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(inv(() => this.state.cleanseWithSalt(b.dataset.cleanse)).text)); });
    el.querySelectorAll('[data-wear]').forEach((b) => { b.onclick = () => { if (inv(() => this.state.wear(b.dataset.wear))) this.sfx(worldSound('wear', { slot: this.state.item(b.dataset.wear)?.slot })); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-takeoff]').forEach((b) => { b.onclick = () => { if (inv(() => this.state.takeOff(b.dataset.takeoff))) this.sfx(worldSound('wear', { slot: b.dataset.takeoff })); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-invplayer]').forEach((b) => { b.onclick = () => { this.invPlayer = Number(b.dataset.invplayer); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-give]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(this.state.giveItem(b.dataset.give, this.invPlayer).text)); });
    // Wegwerfen braucht einen zweiten Klick, damit nichts aus Versehen verschwindet
    el.querySelectorAll('[data-drop]').forEach((b) => {
      b.onclick = () => {
        if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = 'Wegwerfen?'; return; }
        this.renderNotebook(esc(inv(() => this.state.dropItem(b.dataset.drop, 1)).text));
      };
    });
    el.querySelectorAll('[data-drink]').forEach((b) => { b.onclick = () => this.drink(b.dataset.drink); });
    el.querySelectorAll('[data-talent]').forEach((b) => {
      b.onclick = () => {
        const r = inv(() => this.state.useTalent(b.dataset.talent));
        this.renderNotebook(esc(r.text));
        if (r.ok) this.toast(r.text, 'good');
      };
    });
    el.querySelector('[data-form]')?.addEventListener('click', () => {
      const r = inv(() => this.state.toggleForm());
      if (r.ok && r.active) { this.close(); this.showMessage('Mythische Gestalt', r.text); } else this.renderNotebook(esc(r.text));
    });
    el.querySelector('[data-probe]')?.addEventListener('click', () => this.openProbe());
    // Seq-4-Prüfungen (core/Seq4.js): Knöpfe im Ritualblock
    el.querySelectorAll('[data-seq4]').forEach((b) => {
      b.onclick = () => {
        const [act, arg] = b.dataset.seq4.split(':');
        const st = this.state;
        const call = {
          laterne: () => st.startSiege(), maske: () => st.startMaske(), echo: () => st.startEcho(), schatten: () => st.startShadow(), uhr: () => st.startUhr4(),
          waage: () => st.startWaage(el.querySelector('.hg-kapital')?.value), brew: () => st.brewEssence(Number(arg)), drink: () => st.drinkEssence(Number(arg)),
          decay: () => st.decayItem(arg), moorwaechter: () => st.summonMoor(), abbrechen: () => st.seq4Cancel(),
        }[act];
        if (!call) return;
        const r = inv(call);
        const title = inv(() => this.state.seq4Name());
        if (r.siege) { this.close(); this.scene?.hg?.startSiege(); this.toast(r.text, 'good'); return; }
        if (r.fight || r.passed === false || r.shadow) { this.close(); this.showMessage(title, r.text); return; }
        this.renderNotebook(esc(r.text));
      };
    });
    // Seq-5-Prüfungen (core/Seq5.js): Knöpfe im Ritualblock
    el.querySelectorAll('[data-seq5]').forEach((b) => {
      b.onclick = () => {
        const fn = { laterne: 'lightLantern', kokon: 'wrapCocoon', spinne: 'lureSpider', eisen: 'startEisen', diebstahl: 'startDiebstahl', handel: 'startHandel', uhr: 'startUhr', abbrechen: 'seq5Cancel' }[b.dataset.seq5];
        if (!fn) return;
        const r = inv(() => this.state[fn]());
        if (r.fight) { this.close(); this.showMessage(inv(() => this.state.seq5Name()), r.text); return; } // der Kampf startet, sobald das Fenster zu ist
        if (r.passed === false) { this.close(); this.showMessage(inv(() => this.state.seq5Name()), r.text); return; }
        this.renderNotebook(esc(r.text));
      };
    });
    el.querySelector('[data-ritual]')?.addEventListener('click', () => {
      const who = this.state.hasP2() ? this.invPlayer : 1;
      const r = inv(() => this.state.performRitual());
      this.sfx(worldSound('ritual', r));
      if (r.ok) {
        const pid = inv(() => this.state.pathway?.id);
        this.close();
        const card = ritualCardUrl(pid);
        this.showMessage(who === 2 ? 'Ritual: Spieler 2' : 'Ritual', r.text, { aside: card ? `<img class="ritualcard" src="${card}" alt="" onerror="this.remove()">` : '' });
        this.scene?.playRitual?.(pid, who);
      } else if (r.fight) {
        // Schweres Ritual (Sequenz 4 und 2): der Schwellenwächter tritt an; der Kampf startet, sobald das Fenster zu ist
        const pid = inv(() => this.state.pathway?.id);
        this.close();
        this.scene?.playRitual?.(pid, who);
        this.showMessage('Ritual', r.text);
      } else this.renderNotebook(esc(r.text));
    });
    el.querySelectorAll('[data-inspect]').forEach((b) => { b.onclick = () => this.inspectItem(b.dataset.inspect); });
    el.querySelectorAll('[data-track]').forEach((b) => { b.onclick = () => { const id = b.dataset.track; this.state.track(this.state.tracked === id ? null : id); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-recipe]').forEach((b) => { b.onclick = () => { this.tab = 'pfad'; this.forgetScroll(); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-person]').forEach((b) => { b.onclick = () => this.openPersonMap(b.dataset.person); });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  /** Fundstück untersuchen: eigener Dialog mit Risiko (Unruhe, Verletzung, Kampf) und möglichen Bonus-Hinweisen. */
  inspectItem(id) {
    const it = this.state.item(id);
    this.scene?.playInspect?.('read');
    this.openDialogue({ name: it.name, role: 'Fundstück', dialogue: it.inspect, item: id }, ({ combat } = {}) => {
      if (!combat && !this.modal) this.openNotebook('items');
    });
  }

  /** Besiegte Gegner: mit Bestiariumsseite oder mit Beute (Elite-Varianten zählen zum Grundgegner). */
  knownBeasts() {
    const { flags } = this.state;
    const { encounters, loot } = this.state.content;
    const hasLoot = (id) => (loot?.[id]?.drops ?? []).length || Object.keys(loot?.[id]?.items ?? {}).length || loot?.[id]?.money;
    const won = (id) => flags.has(`won_${id}`) || flags.has(`won_${id}_elite`);
    const lore = this.state.content.bestiaryTexts ?? {};
    const extra = Object.keys(encounters).filter((id) => !id.endsWith('_elite') && !BESTIARY.includes(id) && (hasLoot(id) || lore[id]));
    return [...BESTIARY, ...extra].filter((id) => encounters[id] && won(id));
  }

  bestiaryHtml(ids) {
    const { encounters: encs, loot, items } = this.state.content;
    const card = (id) => {
      const e = encs[id];
      const eliteWon = this.state.flags.has(`won_${id}_elite`);
      return `<li><img src="${bestiaryUrl(id)}" alt="" onerror="this.remove()"><div class="beast-info">
        <strong>${esc(e.name)}</strong><span class="muted">${e.occult ? 'Okkult · ' : ''}${e.hp} Leben${eliteWon ? ' · Elite besiegt' : ''}</span>
        ${this.beastLoreHtml(id)}
        ${this.beastLootHtml(loot?.[id], items, eliteWon ? loot?.[`${id}_elite`] : null)}</div></li>`;
    };
    return `<ul class="bestiary">${ids.map(card).join('')}</ul>`;
  }

  /** Paket AD: Beschreibung und Kampftipp im Bestiarium. */
  beastLoreHtml(id) {
    const t = this.state.content.bestiaryTexts?.[id];
    return t ? `<p class="beast-text">${esc(t.text)}</p><p class="beast-tip"><b>Tipp:</b> ${esc(t.hinweis)}</p>` : '';
  }

  /** Paket AD: erschienene Zeitungsausgaben, neueste zuerst. */
  papersHtml(papers) {
    const issue = (p) => `<article class="paper paper-${p.zeitung}"><div class="masthead">${esc(NEWSPAPERS[p.zeitung] ?? p.zeitung)}</div>
      <h4>${esc(p.title)}</h4><div class="text">${paragraphs(p.text)}</div>
      ${(p.kurz ?? []).length ? `<ul class="kurz">${p.kurz.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}</article>`;
    return `<div class="papers">${papers.map(issue).join('')}</div>`;
  }

  /** Beute-Liste eines Gegners im Bestiarium. */
  beastLootHtml(table, items, elite) {
    const p = lootPreview(table, items, elite);
    const rows = p.items.map((e) => `<li class="loot-row rar-${e.rarity}" title="${esc(RARITY_NAMES[e.rarity])}">${itemIcon(e.id)}<span>${esc(e.name)}</span>
      <span class="rar">${e.first ? 'erster Sieg' : chanceWord(e.chance)}${e.elite ? ' · Elite' : ''}</span></li>`);
    const [lo, hi] = p.money;
    if (hi) rows.unshift(`<li class="loot-row">${moneyIcon(hi)}<span>${lo === hi ? lo : `${lo}–${hi}`} Schilling</span></li>`);
    if (!rows.length) return '<p class="beast-noloot">Keine Beute bekannt.</p>';
    return `<h5>Beute${p.repeat ? '' : ' <span class="muted">(nur einmal)</span>'}</h5><ul class="loot beast-loot">${rows.join('')}</ul>`;
  }

  questsHtml() {
    const s = this.state;
    const ids = Object.keys(s.quests).filter((id) => journalQuestVisible(s, id));
    const order = (q) => (s.quests[q] === 'active' ? 0 : 1) * 10 + (s.quest(q).kind === 'main' ? 0 : 1);
    ids.sort((a, b) => order(a) - order(b));
    if (!ids.length && !s.openLeads().length) return '<p class="empty">Noch keine Aufträge.</p>';
    const row = (id) => {
      const q = s.quest(id);
      const st = s.quests[id];
      const active = st === 'active';
      const tracked = s.tracked === id;
      const steps = active ? `<ul class="steps">${s.questSteps(id).map((x) => `<li class="${x.done ? 'done' : ''}">${x.done ? '✓' : '○'} ${esc(x.text)}</li>`).join('')}</ul>` : '';
      const t = active ? questTarget(s, id) : null;
      const goal = active ? `<div class="qgoal">➤ ${t ? esc(this.goalText(t)) : 'Kein fester Ort bekannt'}</div>${t?.because ? `<div class="qwhy">${esc(t.because)}</div>` : ''}` : '';
      const caseLink = s.content.cases.some((c) => c.id === q.case)
        ? `<button class="small" data-quest-case="${esc(q.case)}" aria-label="${esc(q.title)}: Schlüsse ziehen">Schlüsse ziehen</button>` : '';
      return `<li class="quest ${st} ${tracked ? 'tracked' : ''}" ${active ? `data-track="${id}"` : ''}><div class="qtitle">${uiSprite('qstatus', !active ? 'q1' : tracked ? 'q6' : q.kind === 'main' ? 'q5' : 'q2', 1 / 12, 'qico')}<span class="qkind">${q.kind === 'main' ? 'Hauptfall' : 'Nebenauftrag'}</span> ${esc(q.title)} ${!active ? '<span class="badge likely">erledigt</span>' : ''}${tracked ? '<span class="badge track">verfolgt</span>' : ''}</div>
        ${active ? `<div class="qsum">${q.wanted ? wantedImg(q.wanted, false) : ''}${esc(q.summary)}</div>` : ''}${steps}${goal}${caseLink}</li>`;
    };
    // Offene Spuren: Aufträge, die noch abgeholt werden müssen (z. B. Fall 8 bei Nan Kettle am Nachtmarkt)
    const leadRow = (l) => {
      const t = leadTarget(s, l);
      const q = s.quest(l.quest);
      return `<li class="quest lead"><div class="qtitle">${uiSprite('qstatus', 'q2', 1 / 12, 'qico')}<span class="qkind">Neue Spur</span> ${esc(q.title)}</div>
        <div class="qsum">${esc(l.text)}</div>${t ? `<div class="qgoal">➤ ${esc(this.goalText(t))}</div>` : ''}</li>`;
    };
    const leads = s.openLeads().map(leadRow).join('');
    // Erledigte Aufträge zusammengeklappt, damit die offenen oben sichtbar bleiben
    const open = ids.filter((id) => s.quests[id] === 'active');
    const closed = ids.filter((id) => s.quests[id] !== 'active');
    return `<p class="hintline">Klicke auf einen Auftrag, um ihn zu verfolgen. „Schlüsse ziehen“ öffnet die Informationen zu diesem Fall.</p>
      <ul class="quests">${leads}${open.map(row).join('') || (leads ? '' : '<li class="empty">Gerade keine offenen Aufträge.</li>')}</ul>
      ${closed.length ? `<details class="closed-quests"><summary>Erledigt (${closed.length})</summary><ul class="quests">${closed.map(row).join('')}</ul></details>` : ''}`;
  }

  /** Umschaltung (G) zwischen Spieler 1 und 2 für Inventar und Pfad. */
  playerTabsHtml() {
    const who = this.invPlayer;
    return `<div class="tabs playertabs">${[1, 2].map((n) => `<button class="tab ${n === who ? 'sel' : ''}" data-invplayer="${n}">Spieler ${n}${n === 1 ? ' · Ermittler' : ''}</button>`).join('')}<button class="muted subkeys keybtn" data-key="g">wechseln <span class="key">G</span></button></div>`;
  }

  /** Inventar-Reiter: mit Spieler 2 gibt es oben eine Umschaltung (G) zwischen beiden Taschen. */
  itemsHtml() {
    const s = this.state;
    if (!s.hasP2()) { this.invPlayer = 1; return this.itemsListHtml(); }
    return this.playerTabsHtml() + s.withPlayer(this.invPlayer, () => this.itemsListHtml(), { quiet: true });
  }

  /** Pfad-Reiter: jeder Spieler hat seinen eigenen Pfad (G wechselt). */
  pathwayTabHtml() {
    const s = this.state;
    if (!s.hasP2()) { this.invPlayer = 1; return this.pathwayHtml() + this.claimsHtml(1); }
    return this.playerTabsHtml() + s.withPlayer(this.invPlayer, () => this.pathwayHtml(), { quiet: true }) + this.claimsHtml(this.invPlayer);
  }

  /** Paket BN: Journal der bekannten Rufmuster (Symbol, Form, Quelle, Bedeutung, Klangzeichen) und laufende Bindungen. */
  signalJournalHtml() {
    const s = this.state;
    const sr = s.content.signalRoutes;
    if (!sr) return '';
    const seen = new Set();
    const known = [];
    for (const st of sr.stationen) for (const [id, p] of Object.entries(st.patterns)) if (!seen.has(id) && s.meetsSignalRoutes({ requires_pattern: id })) { seen.add(id); known.push([id, p]); }
    const b = s.signal.bindings ?? {};
    const bound = [1, 2].filter((n) => b[n]).map((n) => `<li>${s.hasP2() ? `Spieler ${n}: ` : ''}${esc(sr.bindungen[b[n].station]?.journal ?? '')} <span class="muted">${esc(sr.texte.bindung_an)}</span></li>`);
    if (!known.length && !bound.length) return '';
    const row = ([id, p]) => `<li>${this.signalSymbol(id)}<strong>${esc(p.form)}</strong> <span class="muted">${esc(p.source)}</span><br><span class="desc">${esc(p.meaning)}${s.patternSound(id) ? ` · ${esc(s.patternSound(id).zeichen)}` : ''}</span></li>`;
    return `<h4>Rufmuster</h4>${known.length ? `<ul class="rufmuster">${known.map(row).join('')}</ul>` : ''}${bound.length ? `<ul class="rufmuster">${bound.join('')}</ul>` : ''}`;
  }

  /** BN/BA: 16×16-Merksymbol eines Rufmusters aus ui/ds_rufmuster.png. */
  signalSymbol(id) {
    const n = this.state.signSymbol?.(id);
    return n === null || n === undefined ? '' : regionIcon(`${SPRITE_BASE}ui/ds_rufmuster.png`, [n * 16, 0, 16, 16], 256, 16, 'rufmuster', 1 / 6);
  }

  /**
   * Paket BN: Fenster an einer Horchstelle. Horchen ist kostenlos, ein Ruf braucht Muster, Richtung und eine Ladung;
   * die Vorschau zeigt Warnung und Risiko, erst der getrennte Knopf ruft. Die Namensantwort bindet nur den Sprecher.
   */
  openSignalStation(stationId, feedback = '') {
    const s = this.state;
    const sr = s.content.signalRoutes;
    const st = sr?.stationen.find((x) => x.id === stationId);
    if (!st) return;
    const t = sr.texte;
    const actor = this.actor;
    const run = (fn) => this.as(fn, actor);
    const sel = this.signalUi?.station === stationId ? this.signalUi : { station: stationId, pattern: null, dir: st.directions[0], offer: null };
    this.signalUi = sel;
    const listen = run(() => s.listen(stationId));
    const known = Object.entries(st.patterns).filter(([id]) => s.meetsSignalRoutes({ requires_pattern: id }));
    if (!sel.pattern || !st.patterns[sel.pattern]) sel.pattern = known[0]?.[0] ?? null;
    const preview = sel.pattern ? run(() => s.previewCall(stationId, sel.pattern, sel.dir)) : null;
    const patterns = known.length
      ? `<ul class="items shoplist">${known.map(([id, p], i) => `<li class="item"><div>${this.signalSymbol(id)}<strong>${esc(p.form)}</strong><br><span class="desc">${esc(p.source)} – ${esc(p.meaning)}</span>${s.patternSound(id) ? `<br><span class="muted">${esc(s.patternSound(id).zeichen)}</span>` : ''}</div><div><button class="small" data-pattern="${id}" ${id === sel.pattern ? 'disabled' : ''}><span class="key">${i + 1}</span> ${id === sel.pattern ? 'Gewählt' : 'Wählen'}</button></div></li>`).join('')}</ul>`
      : `<p class="muted">${esc(t.unlearned)}</p>`;
    const dirs = st.directions.length > 1 ? `<div class="actions">${st.directions.map((d) => `<button class="small" data-dir="${d}" ${d === sel.dir ? 'disabled' : ''}>${DIRECTION_NAMES[d]}</button>`).join('')}</div>` : `<p class="muted">Der Trichter zeigt nach ${DIRECTION_NAMES[sel.dir]}.</p>`;
    const hints = listen.ok && listen.hints.length ? `<p class="lead">${esc(t.horch_an)}</p><ul class="hints">${listen.hints.map((h) => `<li>${esc(h.text)}</li>`).join('')}</ul>` : '';
    const pv = preview ? `<div class="status">${esc(preview.text)}${preview.ok ? `<br>${esc(preview.warning)}<br><span class="muted">${esc(preview.risk)}</span>` : ''}</div>` : '';
    const bindung = st.privateAnswer && sr.bindungen?.[stationId];
    const bound = !!s.signal.bindings?.[actor];
    const bind = !bindung ? '' : sel.offer
      ? `<div class="status"><strong>${esc(sel.offer.warning)}</strong><br>${esc(sel.offer.koop)}<br><span class="muted">${sel.offer.passives.map((p) => `${p.key === 'max_nerves' ? 'Höchstnerven' : 'Unruhe je Takt'} ${p.value > 0 ? '+' : ''}${p.value}`).join(' · ')}</span></div>
         <div class="actions"><button data-act="bind">Meinen Namen bewusst antworten</button><button data-act="silence">Schweigen</button></div>`
      : `<div class="actions"><button data-act="offer" ${bound ? 'disabled' : ''}>${bound ? esc(t.bound) : 'Namensantwort anbieten …'}</button></div>`;
    const el = this.open('signal', `
      <h3>${esc(STATION_NAMES[stationId] ?? 'Horchstelle')}${s.hasP2() ? ` <span class="muted">Spieler ${actor}</span>` : ''}</h3>
      ${hints}
      <h4>Rufmuster</h4>${patterns}${dirs}${pv}
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="call" ${preview?.ok ? '' : 'disabled'}>Rufen (1 Ladung · ${s.signal.charges}/3)</button></div>
      ${bind}
      <div class="actions"><button data-act="close">Gehen <span class="key">Esc</span></button></div>`, 'notebook shop');
    el.querySelectorAll('[data-pattern]').forEach((b) => { b.onclick = () => { sel.pattern = b.dataset.pattern; this.openSignalStation(stationId); }; });
    el.querySelectorAll('[data-dir]').forEach((b) => { b.onclick = () => { sel.dir = b.dataset.dir; this.openSignalStation(stationId); }; });
    el.querySelector('[data-act=close]').onclick = () => this.close();
    el.querySelector('[data-act=call]').onclick = () => {
      const cmd = `ruf:${stationId}:${sel.pattern}:${sel.dir}:${Date.now()}`;
      const { handled, result } = run(() => s.confirmCall(cmd, stationId, sel.pattern, sel.dir));
      if (!handled) { this.openSignalStation(stationId, esc(result.text)); return; }
      run(() => s.cancelPrivateAnswer(actor));
      this.signalUi = null;
      const parts = [result.text, result.flag ? t.wissen : '', result.alarm ? t.alarm : ''].filter(Boolean);
      this.showMessage(STATION_NAMES[stationId] ?? 'Ruf', parts.join('\n\n'), { footer: result.kind === 'fallback' ? `−${result.nerves} Nerven · Ladungen ${s.signal.charges}/3` : `Ladungen ${s.signal.charges}/3` });
    };
    el.querySelector('[data-act=offer]')?.addEventListener('click', () => {
      const offer = run(() => s.offerPrivateAnswer(stationId, actor));
      if (!offer.ok) { this.openSignalStation(stationId, esc(offer.text)); return; }
      sel.offer = offer;
      this.openSignalStation(stationId);
    });
    el.querySelector('[data-act=silence]')?.addEventListener('click', () => { run(() => s.cancelPrivateAnswer(actor)); sel.offer = null; this.openSignalStation(stationId, esc(t.horch_aus)); });
    el.querySelector('[data-act=bind]')?.addEventListener('click', () => {
      const cmd = `bindung:${stationId}:${actor}:${Date.now()}`;
      const { handled, result } = run(() => s.acceptPrivateAnswer(cmd, stationId, actor));
      sel.offer = null;
      if (!handled) { this.openSignalStation(stationId, esc(result.text)); return; }
      run(() => s.setComposure(Math.min(s.composure, s.maxComposure())));
      this.signalUi = null;
      this.showMessage('Namensantwort', [result.text, t.bindung_an, s.hasP2() ? result.koop : ''].filter(Boolean).join('\n\n'));
    });
  }

  /** Paket BG: offene persönliche Ansprüche (Hüter- und Prüfungszutaten bei Hedda). */
  claimsHtml(player) {
    const s = this.state;
    const open = s.openClaimTexts?.(player) ?? [];
    if (!open.length) return '';
    return `<h4>${esc(s.content.claimTexts.k3b_notizbuch)}</h4><ul class="claims">${open.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }

  itemsListHtml() {
    const s = this.state;
    const p2 = s.hasP2();
    const other = s.acting === 2 ? 1 : 2;
    const kindOrder = { weapon: 0, gear: 0.5, artifact: 1, consumable: 2, potion: 3, formula: 4, ingredient: 5, trophy: 6, key: 7 };
    const all = s.items().sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);
    const cats = ITEM_CATS.map((c) => ({ ...c, n: c.kinds ? all.filter((it) => c.kinds.includes(it.kind)).length : all.length }));
    if (!cats.some((c) => c.id === this.itemCat && c.n)) this.itemCat = 'alle';
    this.itemCats = cats.filter((c) => c.n || c.id === 'alle');
    const cat = cats.find((c) => c.id === this.itemCat);
    const list = cat.kinds ? all.filter((it) => cat.kinds.includes(it.kind)) : all;
    const subtabs = `<div class="tabs subtabs">${cats.map((c) => `<button class="tab ${c.id === this.itemCat ? 'sel' : ''}" data-itemcat="${c.id}" ${c.n ? '' : 'disabled'}>${esc(c.title)} <span class="muted">${c.n}</span></button>`).join('')}<span class="muted subkeys"><button class="keybtn" data-key="ArrowLeft"><span class="key">←</span></button><button class="keybtn" data-key="ArrowRight"><span class="key">→</span></button></span></div>`;
    const w = s.weaponStats();
    const rows = list.map((it) => {
      let action = '';
      const tainted = s.isCorrupted(it.id);
      if (it.kind === 'weapon') action = s.weapon === it.id ? `<span class="badge likely">ausgerüstet</span>${tainted ? `<br><button class="small" data-unequip="${it.id}">Ablegen</button>` : ''}` : `<button class="small" data-equip="${it.id}">Ausrüsten</button>`;
      else if (it.kind === 'gear') action = s.isWorn(it.id) ? `<span class="badge likely">angelegt</span><br><button class="small" data-takeoff="${it.slot}">Ablegen</button>` : `<button class="small" data-wear="${it.id}">Anlegen</button>`;
      else if (it.kind === 'consumable' && !it.combat_only) action = `<button class="small" data-use="${it.id}">Benutzen</button>`;
      else if (it.combat_only) action = '<span class="muted">nur im Kampf</span>';
      else if (it.kind === 'potion') {
        const chk = s.drinkCheck(it.id);
        action = chk.ok ? `<button class="small" data-drink="${it.id}">Trinken</button><br><span class="muted">Risiko ${Math.round(chk.risk * 100)} %</span>` : chk.ritual ? '<button class="small" data-recipe="1">Ritual nötig</button>' : '<span class="muted">nicht trinkbar</span>';
      } else if (it.kind === 'formula') action = '<button class="small" data-recipe="1">Rezept</button>';
      else if (it.kind === 'artifact') {
        // Artefakte wirken, solange man sie bei sich hat. Korrumpierte darf man ausnahmsweise beiseitelegen.
        if (s.isSetAside(it.id)) action = `<span class="badge suspected">${korrIcon('set_aside', 'beiseitegelegt')}ruht</span><br><button class="small" data-takeup="${it.id}">Aufnehmen</button>`;
        else action = `<span class="badge likely">wirkt</span>${tainted ? `<br><button class="small" data-aside="${it.id}">Beiseitelegen</button>` : ''}`;
        if (s.borrowed.includes(it.id)) action += '<br><span class="muted">vom Revier geliehen</span>';
      } else if (it.kind === 'ingredient') action = '<span class="muted">Zutat</span>';
      else if (it.kind === 'trophy') action = `<span class="muted rar-${itemRarity(it)}">Beutestück · ${RARITY_NAMES[itemRarity(it)]}</span>`;
      if (!action && it.inspect) action = `<button class="small" data-inspect="${it.id}">Untersuchen</button>`;
      if (tainted && s.itemCount(s.corruptionRules().cleanse_item)) action += `${action ? '<br>' : ''}<button class="small" data-cleanse="${it.id}">Reinigen (Läutersalz)</button>`;
      const wt = s.itemWeight(it.id);
      if (wt > 0) action += `${action ? '<br>' : ''}<span class="muted weight">${fmtLb(wt * it.count)} Pfd.</span>`;
      if (p2 && it.kind !== 'key') action += ` <button class="small give" data-give="${it.id}" title="Eins an Spieler ${other} geben">→ Sp. ${other}</button>`;
      if (s.canDrop(it.id) && !(it.kind === 'weapon' && s.weapon === it.id)) action += ` <button class="small drop" data-drop="${it.id}" title="Wegwerfen (eins)">×</button>`;
      const stat = it.kind === 'weapon' ? ` <span class="muted">Angriff ${it.atk}${it.occult ? ', stark gegen Okkultes' : ''}</span>`
        : it.kind === 'gear' ? ` <span class="muted">${GEAR_SLOT_NAMES[it.slot]}</span>` : '';
      const effects = it.kind === 'artifact' || it.kind === 'gear' ? artifactEffectsHtml(it) : '';
      const taint = tainted ? corruptionHtml(s, it.id) : '';
      return `<li class="item${tainted ? ' tainted' : ''}"><div>${it.kind === 'potion' || it.kind === 'formula' ? itemIconBig(it.id) : itemIcon(it.id)}<strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}${stat}${tainted ? ` ${korrBadge()}` : ''}<br><span class="desc">${esc(it.desc)}</span>${effects}${taint}</div><div>${action}</div></li>`;
    }).join('');
    const carried = s.activeArtifacts();
    const maxArt = s.artifactRules().max_active ?? 3;
    const arts = carried.length
      ? `<div class="status"><span class="artslots">${artifactSlots(carried, maxArt, carried.length > maxArt || s.unruhe >= 60)}</span>Artefakte dabei <strong>${carried.length}</strong>${s.artifactUnruhe() ? ` · <span class="curse">Unruhe +${Math.round(s.artifactUnruhe() * 10) / 10} pro Sekunde</span>` : ''} · Alles, was du bei dir trägst, wirkt: Vorteile wie Flüche. Was du nicht brauchst, lagere im Büro ein.${carried.length > maxArt ? ` <span class="curse">Mehr als ${maxArt} zerren heftig aneinander.</span>` : ''}</div>` : '';
    const drain = s.corruptionDrain();
    const taintBox = drain.count
      ? `<div class="status taintbox">${korrIcon('pulse1', 'Korruption')}<strong>${drain.count}</strong> korrumpierte${drain.count === 1 ? 's Stück zehrt' : ' Stücke zehren'} an dir: <span class="curse">−${fmtRate(drain.hp)} Leben, −${fmtRate(drain.nerves)} Nerven pro Sekunde</span>. Ablegen hilft sofort, reinigen Dr. Varga im Revier oder Läutersalz (Nell).</div>`
      : s.corruptedItems().length ? '<div class="status taintbox muted">Korrumpierte Stücke liegen abgelegt in deiner Tasche. Sie zehren erst wieder, wenn du sie trägst.</div>' : '';
    return `
      ${carryHtml(s)}${taintBox}
      <div class="status">Leben <strong>${s.hp}/${s.maxHp}</strong> · Nerven <strong>${Math.round(s.composure)}/${s.maxComposure()}</strong> · Waffe <strong>${esc(w.name)}</strong> (Angriff ${w.atk}) · ${coin}<strong>${s.money}</strong> Schilling</div>
      ${cat.id === 'alle' || cat.id === 'waffen' || cat.id === 'kleidung' ? paperDoll(s) : ''}
      ${cat.id === 'alle' || cat.id === 'artefakte' ? arts : ''}
      ${subtabs}
      <ul class="items">${rows || '<li class="empty">Deine Taschen sind leer.</li>'}</ul>`;
  }

  caseHtml(caseId) {
    const s = this.state;
    const facts = s.knownFacts(caseId);
    const order = { likely: 0, suspected: 1, refuted: 2 };
    facts.sort((a, b) => order[s.factStatus(a)] - order[s.factStatus(b)]);
    // Musterweber (Faden, Sequenz 7): markiert Informationen, die sich noch verknüpfen lassen
    const linkable = new Set();
    if (s.passive('link_hints')) {
      const usable = (f) => !['unknown', 'refuted'].includes(s.factStatus(f));
      for (const d of s.content.deductions) {
        if (s.hasConclusion(d.id)) continue;
        for (const [a, b] of d.pairs) if (usable(a) && usable(b)) { linkable.add(a); linkable.add(b); }
      }
    }
    const factItems = facts.map((f) => {
      const st = s.factStatus(f);
      const n = s.factSources(f).length;
      return `<li><button class="fact ${st} ${this.selected.includes(f) ? 'sel' : ''}" data-fact="${f}" ${st === 'refuted' ? 'data-refuted="1"' : ''}>
        ${this.badge(st)} ${linkable.has(f) ? `${journalMark('string_pin', 'Lässt sich verknüpfen')} ` : ''}${esc(s.fact(f).text)} <span class="src">${n}×</span>${s.fact(f).case !== caseId ? `<span class="cross">Spur aus ${esc(s.content.cases.find((c) => c.id === s.fact(f).case)?.title.split(':')[0] ?? 'einem anderen Fall')}</span>` : ''}</button></li>`;
    }).join('');
    const ded = s.content.deductions.filter((d) => d.case === caseId && s.hasConclusion(d.id));
    // Eine Vermutung sagt gleich, welche Information noch eine Quelle braucht und wo es eine gibt
    const guesses = Object.fromEntries(openGuesses(s, caseId).map((g) => [g.deduction.id, g]));
    const needLine = (d) => (guesses[d.id] ? `<div class="need">${esc(gapText(guesses[d.id]).replace(/^„[^“]*“ ist erst eine Vermutung: /, 'Braucht noch: '))}</div>` : '');
    const concl = ded.map((d) => `<li class="${guesses[d.id] ? 'open' : ''}"><strong>${esc(d.name)}</strong> ${s.isCertain(d.id) ? '<span class="badge likely">gesichert</span>' : '<span class="badge suspected">Vermutung</span>'}<br>${esc(d.text)}${needLine(d)}</li>`).join('');
    // Warum blockiert der Auftraggeber? Der Wegweiser des Hauptauftrags weiß es (z. B. „Marlowe braucht erst …“)
    const mainQuest = Object.keys(s.quests).find((q) => s.quests[q] === 'active' && s.quest(q).case === caseId && s.quest(q).kind === 'main');
    const mainTarget = mainQuest ? questTarget(s, mainQuest) : null;
    const blockBox = mainTarget?.because ? `<div class="blockbox">${uiSprite('locked', 'gespraech', 1 / 16, 'lockico')}<strong>Was noch fehlt:</strong> ${esc(mainTarget.because)}</div>` : '';
    const total = s.content.deductions.filter((d) => d.case === caseId && d.honor !== 0).length;
    const detailId = this.selected[this.selected.length - 1];
    const detail = detailId
      ? `<strong>Quellen:</strong>${s.factStatus(detailId) === 'refuted' ? journalMark('contradicts', 'Widerlegt') : s.factSources(detailId).length > 1 ? journalMark('same_source', 'Mehrere Quellen bestätigen das') : ''}
        <ul class="sources">${s.factSources(detailId).map((c) => `<li>${sourceFace(s.content, s.clue(c), s.factStatus(detailId) === 'refuted')}<div><em>${esc(s.clue(c).source)}:</em> ${esc(s.clue(c).text)}</div></li>`).join('')}</ul>`
      : 'Klicke eine Information an, um ihre Quellen zu sehen. Ab zwei Quellen gilt sie als sehr wahrscheinlich. Wähle zwei Informationen und verknüpfe sie.';
    return `
      <div class="actions"><button class="small" data-act="quests">← Zurück zu den Aufträgen</button></div>
      <h4>${esc(s.content.cases.find((c) => c.id === caseId)?.title ?? 'Fallakte')}</h4>
      ${blockBox}
      <div class="cols">
        <div class="col">
          <h4>Informationen (${facts.length})</h4>
          <ul class="facts">${factItems || '<li class="empty">Noch nichts.</li>'}</ul>
        </div>
        <div class="col">
          <h4>Schlussfolgerungen${caseId !== 'side' ? ` (${ded.filter((d) => d.honor !== 0).length}/${total})` : ''}</h4>
          <ul class="concl">${concl || '<li class="empty">Wähle zwei Informationen aus und verknüpfe sie.</li>'}</ul>
        </div>
      </div>
      <div class="detail">${detailId ? '' : `<img class="casefile" src="${caseFileUrl(caseId)}" alt="" onerror="this.remove()">`}${detail}</div>`;
  }

  toggleFact(id) {
    if (this.selected.includes(id)) this.selected = this.selected.filter((x) => x !== id);
    else this.selected = [...this.selected, id].slice(-2);
    this.renderNotebook('');
  }

  /** Der Fall, der gerade im Notizbuch offen ist (auch im Archiv), sonst null. */
  currentCase() {
    if (this.tab === 'archiv') return this.archiveCase ?? null;
    return ['quests', 'items', 'pfad', 'personen', 'bestiar'].includes(this.tab) ? null : this.tab;
  }

  /** Archiv: gelöste Fälle mit ihrem Ende; ein Klick öffnet die alten Informationen. */
  archiveHtml(solved) {
    const s = this.state;
    const list = solved.map((c) => {
      const end = s.content.endings[s.endings[c.id]];
      return `<button class="tab ${c.id === this.archiveCase ? 'sel' : ''}" data-archive="${c.id}">${esc(c.title)}${end ? ` <span class="muted">· ${esc(end.title ?? '')}</span>` : ''}</button>`;
    }).join('');
    return `<div class="archive-list">${list}</div>${this.archiveCase ? this.caseHtml(this.archiveCase) : ''}`;
  }

  /** Personen, mit denen man gesprochen hat: Gesicht, Rolle, Ort, laufende Aufträge. */
  /** Paket I: Akte zu den Sekten (I_fraktionen.png) – Ermittlungsstand aus den Schritten des Auftrags. */
  factionsHtml() {
    const s = this.state;
    const quests = { rostbrueder: 'rost_im_hafen', schleierschwestern: 'graue_schleier' };
    const rows = Object.entries(quests).filter(([, q]) => s.quests[q]).map(([fid, q]) => {
      const f = s.content.factions?.[fid];
      if (!f) return '';
      const steps = s.questSteps(q);
      const done = steps.filter((x) => x.done).length;
      const level = s.quests[q] !== 'active' ? 5 : Math.min(4, Math.round((done / steps.length) * 5));
      const [icon, label] = s.quests[q] !== 'active' ? ['infiltrated', 'zerschlagen'] : done === 0 ? ['suspicious', 'Verdacht']
        : done < steps.length - 1 ? ['hostile', 'feindlich'] : ['tolerated', 'fast am Ziel'];
      return `<li>${uiSprite('frak', icon, 1 / 8, 'frakico', label)}<div><strong>${esc(f.full ?? f.name)}</strong> <span class="muted">${label}</span><br>${uiSprite('frak', `${fid}${level}`, 1 / 6, 'frakbar')}
        <br><span class="muted">${esc(f.motto ?? '')}</span></div></li>`;
    }).join('');
    return rows ? `<h4>Sekten</h4><ul class="people factions">${rows}</ul><h4>Personen</h4>` : '';
  }

  /** BQ: Steckbrief je Kult, wächst mit der Umtriebe-Stufe; laufende Ereignisse und der Wegweiser der Stufe. */
  kulteHtml() {
    const s = this.state;
    const kurz = { sk_asche: 'asche', sk_flut: 'flut', sk_chor: 'chor' };
    const aktiv = s.sektenAlleAktiven();
    const cards = s.sektenKulte().map((k) => {
      const st = s.sektenStufe(k.id);
      const text = s.sektenStufeText(k.id);
      const mine = aktiv.filter((e) => e.kult === k.id);
      return `<li class="kult"><div class="kulthead">${uiSprite('skumtriebe', `${kurz[k.id]}_${st}`, 1 / 6, 'kulticon', `Stufe ${st}`)}<strong>${esc(k.name)}</strong> <span class="muted">${esc(k.beiname)}</span>
        <span class="badge ${st >= 2 ? 'refuted' : st === 1 ? 'suspected' : 'likely'}">${esc(s.sektenStufeName(k.id))}</span></div>
        <p class="desc">${esc(k.glaube[0])} Erkennungszeichen: ${esc(k.erkennungszeichen)}.</p>
        ${s.sektenSteckbrief(k.id).map((p) => `<p>${esc(p)}</p>`).join('')}
        ${mine.length ? `<p><b>Gerade:</b> ${mine.map((e) => `${esc(e.titel)} (${esc(s.content.maps[e.map]?.name ?? e.map)})`).join(' · ')}</p>` : ''}
        ${text?.wegweiser ? `<p class="muted">Wegweiser: ${esc(text.wegweiser)}</p>` : ''}</li>`;
    }).join('');
    return `<h4>Wandernde Kulte</h4><p class="muted">Drei Sekten treiben sich durch Kettlegate, Wexmoor und Dunscar. Spuren lesen, Einladungen ablehnen, Brunnen reinigen, Kultplätze abbauen: Jede Hilfe senkt ihre Umtriebe, jedes übersehene Zeichen stärkt sie.</p><ul class="kulte">${cards}</ul>`;
  }

  peopleHtml() {
    const people = knownPeople(this.state);
    if (!people.length) return `${this.factionsHtml()}<p class="empty">Du hast noch mit niemandem gesprochen.</p>`;
    const hint = '<p class="muted peoplehint">Auf eine Person tippen: die Stadtkarte zeigt alle Orte, an denen sie sein kann.</p>';
    return `${this.factionsHtml()}${hint}<ul class="people">${people.map((p) => {
      const face = headFace(p.id, esc(p.name));
      const places = personPlaces(this.state, p.id);
      const where = places.length ? places.map((x) => `<span class="${x.now ? 'now' : 'maybe'}">${esc(x.mapName)}</span>`).join(', ') : 'unterwegs';
      const pinned = this.personPin === p.id;
      return `<li class="${p.quests.length ? 'busy' : ''}${pinned ? ' pinned' : ''}" data-person="${p.id}" title="Auf der Stadtkarte zeigen">${face}<div><strong>${esc(p.name)}</strong> <span class="muted">${esc(p.role)}</span> ${relationBadge(this.state, p.id, this.state.mood(p.id) !== 'neutral')}${pinned ? '<span class="badge track">auf der Karte</span>' : ''}
        <br><span class="where">${where}</span>${p.quests.map((q) => `<br><span class="qtag">${esc(q)}</span>`).join('')}</div>${places.length ? '<span class="mapbtn">Karte ›</span>' : ''}</li>`;
    }).join('')}</ul>`;
  }

  combine() {
    if (this.selected.length !== 2) return;
    const [a, b] = this.selected;
    const { result, deduction } = this.state.combine(a, b);
    this.selected = [];
    const msg = {
      new: `<span class="good">Erkenntnis: ${esc(deduction?.name)}</span>`,
      known: 'Diese Verbindung hast du schon gezogen.',
      refuted: 'Eine der beiden Informationen ist widerlegt. Darauf lässt sich nichts bauen.',
      none: 'Diese Informationen ergeben zusammen keinen Sinn.',
    }[result];
    this.renderNotebook(msg);
  }

  /** Ab Wexmoor: alle Paare des offenen Falls auf einmal verknüpfen. */
  autoCombine() {
    const caseId = this.currentCase();
    if (!caseId || !this.state.autoLinkFrei()) return;
    const { result, deductions } = this.state.autoCombine(caseId);
    this.selected = [];
    const msg = result === 'new'
      ? `<span class="good">Automatisch verknüpft: ${deductions.map((d) => esc(d.name)).join(', ')}</span>`
      : 'Nichts Neues zu verknüpfen. Dir fehlen noch Informationen.';
    this.renderNotebook(msg);
  }


  // --- Pfad, Tränke, Händler, Kessel --------------------------------------------

  pathwayHtml() {
    const s = this.state;
    const all = s.content.pathways;
    if (!s.isBeyonder()) {
      return `
        <p class="lead">Du hast noch keinen Trank getrunken. Auf dem <strong>Nachtmarkt</strong> unter der Krähenbrücke erklärt dir Sabeth Orr die Pfade, Cornelius Kittering verkauft Formeln, Nell Rauhfuß die Zutaten. Gebraut wird am Kessel.</p>
        <ul class="paths">${Object.entries(all).map(([pid, p]) => `<li>${emblem(pid, 32)}<strong style="color:${p.color}">${esc(p.name)}</strong> <span class="muted">${Object.keys(p.seqs).sort((a, b) => b - a).map((k) => `${k}: ${esc(p.seqs[k].name)}`).join(' · ')}</span><br><em>„${esc(p.principle)}“</em> ${esc(p.digest_hint)}</li>`).join('')}</ul>
        ${this.recipesHtml(false)}`;
    }
    const p = s.pathwayDef();
    const cur = s.pathway;
    const seqs = Object.keys(p.seqs).map(Number).sort((a, b) => b - a);
    const rows = seqs.map((n) => {
      const sd = p.seqs[n];
      const reached = n >= cur.seq;
      // Paket A: Sockel der Pfad-Leiter (leer = als Nächstes, verriegelt = später, Riss bei hoher Unruhe)
      const socket = uiSprite('ladder', !reached ? (n === cur.seq - 1 ? 'empty' : 'locked') : n === cur.seq && s.unruhe >= 60 ? 'cracked' : 'unlocked', 1 / 12, 'socket');
      if (!reached) return `<li class="seq locked">${socket}<strong>Sequenz ${n}: ${esc(sd.name)}</strong> <span class="muted">noch nicht erreicht${sd.skill2 || sd.talent ? ` · bringt ${[sd.skill.name, sd.skill2?.name, sd.talent?.name].filter(Boolean).map(esc).join(', ')}` : ''}</span></li>`;
      const talent = sd.talent ? this.talentRowHtml(s, sd.talent) : '';
      const hgScene = (n === 4 || n === 2) && n === cur.seq ? sceneImg(`hg_seq${n}_${cur.id}`) : ''; // Paket CO: Sequenzbild der großen Stufen
      return `<li class="seq${sd.durchbruch ? ' durchbruch' : ''}">${socket}<strong>Sequenz ${n}: ${esc(sd.name)}</strong> ${sd.durchbruch ? `<span class="badge halbgott">${esc(sd.durchbruch)}</span>` : ''}${n === cur.seq ? '<span class="badge likely">aktuell</span>' : ''}${hgScene}<br>
        <span class="desc">${esc(sd.desc)}</span><br>
        ${skillIcon(sd.skill.id) || '⚔ '}<strong>${esc(sd.skill.name)}</strong> <span class="muted">(${sd.skill.cost} K${s.skillComposureCost({ ...sd.skill, seq: n }) ? ` · ${s.skillComposureCost({ ...sd.skill, seq: n })} Nerven` : ''})</span> ${esc(sd.skill.desc)}
        ${sd.skill2 ? `<br>${skillIcon(sd.skill2.id) || '⚔ '}<strong>${esc(sd.skill2.name)}</strong> <span class="muted">(${sd.skill2.cost} K${s.skillComposureCost({ ...sd.skill2, seq: n }) ? ` · ${s.skillComposureCost({ ...sd.skill2, seq: n })} Nerven` : ''})</span> ${esc(sd.skill2.desc)}` : ''}
        ${talent}
        ${(sd.passives ?? []).map((x) => `<br>✧ ${esc(x.text)}`).join('')}</li>`;
    }).join('');
    const d = Math.floor(cur.digestion);
    return `
      <div class="pathhead"><div class="pathcard"><img src="${pathwayCardUrl(cur.id)}" alt="" width="96" height="128" onerror="this.parentNode.remove()"><span style="color:${p.color}">Sequenz ${cur.seq}<br>${esc(s.seqDef().name)}</span></div><div>${emblem(cur.id, 32)}<strong style="color:${p.color}">${esc(p.name)}</strong> · Sequenz ${cur.seq}: ${esc(s.seqDef().name)}</div></div>
      <div class="meters2">
        <div class="meter"><span>Verdaut</span><div class="bar"><div class="dfill" style="width:${d}%"></div></div>${uiSprite('digest', `fill${Math.min(100, Math.floor(d / 20) * 20)}`, 1 / 8, 'digestbar')}${d >= 100 ? uiSprite('digest', 'digested', 1 / 12, 'digestico', 'Verdaut') : ''}<em>${d} %</em></div>
        <div class="meter"><span>Unruhe</span><div class="bar"><div class="ufill ${s.unruhe >= 60 ? 'low' : ''}" style="width:${s.unruhe}%"></div></div>${s.unruhe >= 60 ? uiSprite('digest', 'warning', 1 / 12, 'digestico', 'Gefahr') : ''}<em>${Math.round(s.unruhe)}</em></div>
        <div class="meter vialm">${uiSprite('vial', `v${pctStep(s.composure / s.maxComposure(), 6)}`, 1 / 24, 'vial', 'Nerven')}<span>Nerven</span><em>${Math.round(s.composure)}/${s.maxComposure()}</em></div>
      </div>
      <p class="lead"><em>„${esc(p.principle)}“</em> ${esc(p.digest_hint)}</p>
      <p class="muted">Jede Sequenz dieses Pfades: +${s.growth().hp} Leben, +${s.growth().nerves} Nerven, +${CARRY_PER_STEP} Pfund Tragkraft, die Durchbrüche 7 und 6 das Doppelte. Gerade: ${s.maxHp} Leben, ${s.maxComposure()} Nerven, ${esc(s.carryBreakdown())} = ${fmtLb(s.carryCapacity())} Pfund Tragkraft.</p>
      ${s.corruptionDrain().count ? `<p class="curse">Korruption: ${s.corruptionDrain().count} Stück an dir zehrt an Leben und Nerven (siehe Inventar). Bei 100 Unruhe wachsen die Tentakel erneut und treffen alles, was du dann trägst.</p>` : '<p class="muted">Bei 100 Unruhe verlierst du die Kontrolle: Tentakel korrumpieren Waffe, Kleidung und Artefakte am Leib, die dich danach Leben und Nerven kosten, solange du sie trägst.</p>'}
      ${this.buffsHtml(s)}
      ${this.formHtml(s)}
      ${this.ritualHtml()}
      <h4>Was deinen Trank verdaut</h4>
      <ul class="digestlist">${s.digestTable().map((r) => `<li><span>${esc(r.label)}</span> <strong>+${r.text} %</strong></li>`).join('')}
        <li class="muted">Alles andere verdaut diesen Pfad nicht. Bosse zählen vierfach, Elitegegner doppelt, gefährliche Gebiete bringen je Stufe ein Viertel mehr. Ab Sequenz 6 verdaut jede Stufe zehnmal so langsam wie die davor.</li></ul>
      <ul class="seqs">${rows}</ul>
      ${this.recipesHtml(false)}`;
  }

  /** Welt-Fähigkeit einer Sequenz: Kosten, Abklingzeit und Knopf zum Einsetzen (nur außerhalb von Kämpfen). */
  talentRowHtml(s, def) {
    const t = s.talentDef(def.id) ?? def;
    const cost = [def.nerves ? `${def.nerves} Nerven` : '', def.unruhe ? `+${def.unruhe} Unruhe` : '', `${fmtSec(def.cooldown)} Pause`].filter(Boolean).join(' · ');
    const block = s.talentBlock(def.id);
    const label = t.remaining > 0 ? `bereit in ${t.remainingText}` : block ? 'zu wenig Nerven' : 'Einsetzen';
    return `<br>${talentIcon(def.id)}<strong>${esc(def.name)}</strong> <span class="muted">(${cost})</span> ${esc(def.desc)} <button class="small talentbtn ${block ? '' : 'primary'}" data-talent="${def.id}" ${block ? 'disabled' : ''}>${label}</button>`;
  }

  /** Laufende Wirkungen der Welt-Fähigkeiten. */
  buffsHtml(s) {
    const list = s.activeBuffs();
    const world = [s.revealUntil > s.talentTime ? 'verborgene Spuren sichtbar' : '', s.scaresEnemies() ? 'Gegner weichen' : '', s.clockStopped() ? 'die Uhr der Stadt steht' : ''].filter(Boolean);
    if (!list.length && !world.length) return `<p class="muted">☉ Welt-Fähigkeiten setzt du hier im Pfad-Tab ein oder in der Welt über die Leiste unten links${this.touch ? '' : ' (Tasten <span class="key">1</span>–<span class="key">9</span>, Spieler 2 Ziffernblock)'}, nicht im Kampf. Sie kosten Nerven und brauchen danach eine Pause.</p>`;
    return `<p class="buffs">☉ Wirkt gerade: ${[...list.map((b) => `${esc(buffLabel(b))} <span class="muted">(${b.remainingText})</span>`), ...world.map(esc)].join(' · ')}</p>`;
  }

  /** Mythische Gestalt (ab Sequenz 4 und halb verdautem Trank): Knopf zum Annehmen und Ablegen. */
  formHtml(s) {
    if (!s.pathway || s.pathway.seq > FORM_SEQ) return '';
    const active = s.formActive();
    const block = active ? null : s.formBlock();
    const form = s.formDef?.();
    const hud = uiSprite('hghud32', active ? 'form_an' : block ? 'verdauung_gesperrt' : 'form_aus', 1 / 10, 'hgicon');
    const cp = form?.beschreibung ? `<p class="desc"><strong>${esc(form.name)}.</strong> ${esc(form.beschreibung)}${form.karte ? ` <span class="muted">${esc(form.karte)}</span>` : ''}</p>` : '';
    return `<div class="gestalt ${active ? 'active' : ''}"><h4>${hud}Mythische Gestalt ${active ? '<span class="badge halbgott">angenommen</span>' : ''}</h4>${cp}
      <p class="muted">${active
        ? `Menschen ohne Pfad und Wesen, die deutlich unter dir stehen, brechen beim Anblick zusammen (Sieg samt Beute, ohne Kampf). Kostet ${FORM_NERVES_PER_SEC} Nerven und ${FORM_UNRUHE_PER_SEC} Unruhe je Sekunde; fällt ab, wenn die Nerven unter ${FORM_MIN_NERVES} sinken. Bosse und höhere Wesen bleiben.`
        : `Ab ${FORM_MIN_DIGEST} % Verdauung auf Sequenz ${FORM_SEQ}: die wahre Gestalt des Pfades. Nicht-Beyonder und schwächere Monster fallen vor ihr um. Zehrt an Nerven und Unruhe.`}</p>
      <button class="small ${block ? '' : 'primary'}" data-form="1" ${block ? 'disabled' : ''}>${active ? 'Gestalt ablegen' : 'Gestalt annehmen'}</button> ${block ? `<span class="muted">${esc(block)}</span>` : ''}</div>`;
  }

  /** Ritual für den nächsten Trank (ab Sequenz 6): Zutaten, Bedingungen, Knopf. */
  ritualHtml() {
    const s = this.state;
    if (!s.pathway) return '';
    const seq = s.pathway.seq - 1;
    const r = s.ritualDef(s.pathway.id, seq);
    if (!r) return '';
    if (s.ritualDone(s.pathway.id, seq)) return `<div class="ritual done"><h4>Ritual: ${esc(r.name)} <span class="badge likely">vollzogen</span></h4><p class="muted">Du kannst den Trank der Sequenz ${seq} trinken.</p></div>`;
    const steps = s.ritualSteps();
    const ready = r.hg ? steps.every((x) => x.done) : steps.every((x) => x.done || x.ordeal); // Seq 4: der Wächter kommt aus der Prüfung
    const probe = s.pendingProbe(s.pathway.id, seq); // Seq 6: zufällige, ortsunabhängige Prüfung
    // Paket CP: die persönliche Probe der schweren Rituale (4 und 2) mit ihren drei Vorbereitungen als Überlieferung
    const cp = s.content.halbgott?.rituale?.[`hg_ritual_${s.pathway.id}_${seq}`];
    const cpHtml = cp ? `<p class="desc"><strong>${esc(cp.name)}.</strong> ${esc(cp.desc)}</p>${cp.vorbereitung?.length ? `<ul class="steps muted">${cp.vorbereitung.map((v) => `<li>✎ ${esc(v)}</li>`).join('')}</ul>` : ''}` : '';
    return `<div class="ritual"><h4>${r.ordeal ? uiSprite('hghud', s.ordealDone(s.pathway.id, seq) ? 'ritual_bestanden' : 'ritual_offen', 1 / 6, 'hgicon') : ''}Ritual für Sequenz ${seq}: ${esc(r.name)}</h4>
      <p><strong>Überall ausführbar.</strong> Die genannten Orte sind Teil der Überlieferung und keine Voraussetzung.</p>
      <p class="desc">${esc(r.desc)}</p>${cpHtml}
      <ul class="steps">${steps.map((x) => `<li class="${x.done ? 'done' : ''}">${x.done ? '✓' : '○'} ${esc(x.text)}</li>`).join('')}</ul>
      ${this.seq5Html(r)}
      ${this.seq4Html(r)}
      ${probe ? `<p><button class="small primary" data-probe="1">${esc(probe.name)} antreten</button> <span class="muted">Eine zufällige Prüfung, überall ablegbar. Misslingt sie, kostet das ${PROBE_FAIL.nerves} Nerven und bringt ${PROBE_FAIL.unruhe} Unruhe; dann kannst du es gleich noch einmal versuchen.</span></p>` : ''}
      ${steps.some((x) => x.fraud && !x.done) ? '<p class="muted">Auf jedem geheimen Treffen ist ein Los überteuert: Bei jedem Los siehst du den Schätzwert neben dem Ausruf. Ruft ein Anbieter weit über Wert aus, „Betrug anprangern“.</p>' : ''}
      <button class="small ${ready ? 'primary' : ''}" data-ritual="1" ${ready ? '' : 'disabled'}>${ready && r.ordeal && !s.ordealDone(s.pathway.id, seq) ? 'Schwellenwächter rufen' : 'Ritual vollziehen'}</button> <span class="muted">Kostet 20 Nerven und bringt 20 Unruhe.${r.ordeal ? ' Ein schweres Ritual: Wenn alles andere steht, tritt der Schwellenwächter deines Pfades an.' : ''}</span></div>`;
  }

  /** Seq-4-Prüfung im Ritualblock: Regel, Knöpfe, Essenzen, Zersetzen (core/Seq4.js). */
  seq4Html(r) {
    const s = this.state;
    if (!r?.hg || s.hgPassed()) return '';
    const k = r.hg;
    const st = s.seq4();
    const btn = (act, label, enabled = true, extra = '') => `<button class="small ${enabled ? 'primary' : ''}" data-seq4="${act}" ${extra} ${enabled ? '' : 'disabled'}>${esc(label)}</button>`;
    const acts = [];
    let more = '';
    const zone = !!s.content.zones?.[s.map];
    if (k === 'laterne' && !st.siege) acts.push(btn('laterne', `Sechs Laternen aufstellen (${s.itemCount('lampenoel')}/6 Lampenöl)`, zone && s.itemCount('lampenoel') >= 6));
    if (k === 'maske' && !st.masked) acts.push(btn('maske', 'Zivilistengestalt annehmen', !s.activeArtifacts().length));
    if (k === 'echo' && !st.active) acts.push(btn('echo', 'Taub werden'));
    if (k === 'schluessel' && !st.shadow) acts.push(btn('schatten', 'Den Schatten lösen', zone));
    if (k === 'uhr' && !st.active) acts.push(btn('uhr', 'Zeitprüfung beginnen'));
    if (k === 'waage' && !st.stash) more += `<p>Kapital: <input type="number" class="hg-kapital" min="0" max="${s.money}" step="100" value="${Math.min(s.money, 4000)}" style="width:7em"> von ${s.money} Schilling ${btn('waage', 'Allen Besitz ablegen')}</p>`;
    if (k === 'kessel') {
      const list = s.hgRecipes();
      if (list.length) more += `<ul class="steps">${list.map((e) => `<li class="${e.drunk ? 'done' : ''}">${e.drunk ? '✓' : '○'} <strong>${esc(e.name)}</strong>: ${Object.entries(e.need).map(([id, n]) => `${esc(s.item(id)?.name ?? id)} ${e.have[id]}/${n}`).join(', ')}
        ${e.drunk ? '' : `${btn(`brew:${e.i}`, 'Brauen', e.ready)} ${btn(`drink:${e.i}`, `Trinken (${e.owned})`, e.owned > 0)}`}</li>`).join('')}</ul>`;
    }
    if (k === 'moor') {
      if (!s.pathway.relikt) {
        const list = s.decayables();
        more += list.length ? `<p class="muted">Zersetzbar: ${list.map((e) => btn(`decay:${e.id}`, `${e.name}${e.count > 1 ? ` ×${e.count}` : ''}`)).join(' ')}</p>` : '<p class="muted">Nichts Okkultes oder Seltenes im Gepäck.</p>';
      } else if (!st.guardian) acts.push(btn('moorwaechter', 'Den Wächter rufen', s.itemCount('s4mo_relikt') > 0 && s.itemCount('moorwasser') > 0));
    }
    if (k === 'kessel' && !s.hgRecipesUnlocked()) more += `<p class="muted">${esc(s.seq4Msg('kessel', 'rezept_gesperrt'))}</p>`;
    if (s.seq4Running()) acts.push('<button class="small" data-seq4="abbrechen">Prüfung abbrechen</button>');
    // Codex DR: Regelkarte und Vorbereitung
    const card = s.seq4Card(k);
    const rules = card?.regeln?.length ? `<p class="muted"><strong>Regeln:</strong> ${card.regeln.map(esc).join(' · ')}</p>` : '';
    const prep = card?.vorbereitung?.length && !s.seq4Running() ? `<p class="muted"><strong>Vorbereitung:</strong> ${card.vorbereitung.map(esc).join(' ')}</p>` : '';
    return `<div class="seq5 seq4"><p class="desc"><strong>${esc(s.seq4Name(k))}.</strong> ${esc(s.seq4Hint(k))}</p>${rules}${prep}${more}
      <p>${acts.join(' ')} <span class="muted">Solo: Spieler 2 schaut zu. Gescheitert: −17 % Verdauung, +10 Unruhe; wiederholen darfst du jederzeit.</span></p></div>`;
  }

  /** Seq-5-Prüfung im Ritualblock: Regel, Knöpfe, Steckbrief (core/Seq5.js). */
  seq5Html(r) {
    const s = this.state;
    if (!r?.trial) return '';
    const k = r.trial;
    const st = s.seq5();
    const done = s.seq5IsDone(k);
    const btn = (act, label, enabled = true, title = '') => `<button class="small ${enabled ? 'primary' : ''}" data-seq5="${act}" ${enabled ? '' : 'disabled'} title="${esc(title)}">${esc(label)}</button>`;
    const acts = [];
    if (!done) {
      if (k === 'laterne') acts.push(btn('laterne', `Laterne entzünden (${Math.min(LATERNEN, st.lanterns ?? 0)}/${LATERNEN})`, s.inLanternZone() && s.itemCount(LAMPENOEL) > 0, s.inLanternZone() ? `Lampenöl: ${s.itemCount(LAMPENOEL)}` : 'Nur in einem Monstergebiet'));
      if (k === 'faden') acts.push(st.kokon ? btn('spinne', 'Die Spinne locken', s.cocoonReady(), `Erst unter ${20} % Leben und Nerven`) : btn('kokon', `In den Kokon wickeln (${Math.min(KOKON_FAEDEN, s.itemCount(SPINNENFADEN))}/${KOKON_FAEDEN} Fäden)`, s.itemCount(SPINNENFADEN) >= KOKON_FAEDEN));
      if (k === 'eisen' && !st.active) acts.push(btn('eisen', 'Kampfprüfung beginnen', s.hp <= s.maxHp * 0.4, 'Erst unter 40 % Leben'));
      if (k === 'schluessel' && !st.armed) acts.push(btn('diebstahl', 'Diebstahl ansetzen', s.moneyBonusFromGear() > 1, 'Etwas mit Schillingbonus tragen'));
      if (k === 'waage' && !st.armed) acts.push(btn('handel', 'Handelsprobe beginnen', s.money >= 3000));
      if (k === 'uhr' && !st.armed) acts.push(btn('uhr', 'Zeitprüfung beginnen', s.hasWatch(), 'Eine Uhr in der Tasche'));
      const running = !!(st.armed || st.active || st.kokon || (st.lanterns ?? 0) > 0 || st.identity);
      if (running) acts.push(`<button class="small" data-seq5="abbrechen">Prüfung abbrechen</button>`);
    }
    const ident = k === 'maske' && st.identity ? `<p class="desc"><strong>Steckbrief:</strong> ${esc(s.identityText())}${st.convinced?.length ? ` Überzeugt: ${st.convinced.map((id) => s.content.npcs[id]?.name ?? id).join(', ')}.` : ''}</p>` : '';
    const sude = k === 'kessel' ? `<p class="muted">Eigene Sude bisher: ${(s.sudeBekannt ?? []).length}. Die Wirkung muss mindestens ${SUD_MIN_SEC} Sekunden halten und noch laufen, wenn du Ritual und Trank vollziehst.</p>` : '';
    return `<div class="seq5"><p class="desc"><strong>${esc(s.seq5Name(k))}.</strong> ${esc(s.seq5Hint(k))}</p>${ident}${sude}
      <p>${acts.join(' ')} <span class="muted">Misslingt die Prüfung: −${FAIL_PCT[k]} % Verdauung, +${FAIL_UNRUHE} Unruhe; wiederholen darfst du jederzeit.</span></p></div>`;
  }

  // --- Proben der Seq-6-Rituale (core/Proben.js) -------------------------------------------------
  openProbe() {
    const who = this.state.hasP2() ? this.invPlayer : 1;
    const r = this.state.withPlayer(who, () => this.state.startProbe(), { quiet: true });
    if (!r.ok) { this.renderNotebook(esc(r.text)); return; }
    this.probePlayer = who;
    this.renderProbe();
  }

  renderProbe(feedback = '') {
    const s = this.state;
    const pr = s.probe;
    if (!pr) { this.close(); return; }
    const acts = [];
    let body = '';
    const asking = pr.rounds.length && (pr.kind === 'faden' || pr.phase === 'fragen');
    if (pr.kind === 'uhr') {
      body = pr.startedAt === null
        ? `<p class="lead">${esc(pr.intro)}</p>`
        : `<p class="lead">Die Frist läuft. Halte nach <b>${pr.target} Sekunden</b> an.</p><p class="muted">Kein Zählwerk hilft dir. Nur dein Takt.</p>`;
      if (pr.startedAt === null) acts.push({ label: 'Die Frist beginnt', fn: () => s.probeStart() });
      else acts.push({ label: 'Jetzt!', fn: () => s.probeStop() });
    } else if (!asking) {
      body = `<p class="lead">${esc(pr.intro)}</p>`;
      if (pr.kind === 'echo') body += `<ul class="voices">${pr.listen.map((l) => `<li><b>${esc(l.who)}:</b> ${esc(l.text)}</li>`).join('')}</ul>`;
      if (pr.kind === 'moor') body += `<ul class="voices names">${pr.listen.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
      acts.push({ label: pr.kind === 'echo' ? 'Ich habe gelauscht' : 'Ich habe sie mir eingeprägt', fn: () => s.probeListened() });
    } else {
      const round = pr.rounds[pr.step];
      body = `<p class="lead muted">${esc(pr.intro)}</p>`;
      if (pr.kind === 'moor') body += `<ul class="voices names">${pr.second.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
      body += `<p class="lead"><b>${pr.step + 1} von ${pr.rounds.length}:</b> ${esc(round.prompt)}</p>`;
      for (const o of round.options) acts.push({ label: o, fn: () => s.probeAnswer(round.options.indexOf(o)) });
    }
    this.probeActs = acts;
    let n = 0;
    const el = this.open('probe', `
      <h3>${esc(pr.name)} <span class="muted">Ritual für Sequenz ${pr.seq}${this.probePlayer === 2 ? ' · Spieler 2' : ''}</span></h3>
      <div class="stage">${body}</div>
      ${pr.log?.length ? `<ul class="alog">${pr.log.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      ${feedback ? `<p class="feedback">${feedback}</p>` : ''}
      <div class="actions">${acts.map((x, i) => `<button class="small" data-act-i="${i}"><span class="key">${++n}</span> ${esc(x.label)}</button>`).join('')}
        <button data-act="leave">Abbrechen <span class="key">Esc</span></button></div>`, 'notebook auction probe');
    el.querySelectorAll('[data-act-i]').forEach((b) => { b.onclick = () => this.probePick(Number(b.dataset.actI)); });
    el.querySelector('[data-act=leave]').onclick = () => this.cancelProbe();
  }

  probePick(i) {
    const x = this.probeActs?.[i];
    if (!x) return;
    const r = this.state.withPlayer(this.probePlayer ?? 1, () => x.fn(), { quiet: true });
    if (r && r.passed !== undefined) { this.finishProbe(r); return; }
    if (r && r.ok === false) this.sfx(uiSound('probe', 'error'));
    this.renderProbe(r?.text ? esc(r.text) : '');
  }

  cancelProbe() {
    const r = this.state.withPlayer(this.probePlayer ?? 1, () => this.state.cancelProbe(), { quiet: true });
    if (r && r.passed !== undefined) { this.finishProbe(r); return; }
    this.close();
    this.openNotebook('pfad');
  }

  finishProbe(r) {
    this.sfx(worldSound('ritual', { ok: r.passed }));
    this.close();
    this.showMessage(r.passed ? 'Probe bestanden' : 'Probe misslungen', r.text, { onClose: () => this.openNotebook('pfad') });
  }

  recipesHtml(withButtons) {
    const list = this.state.recipes();
    if (!list.length) return withButtons ? '<p class="empty">Du besitzt keine Formel. Cornelius Kittering verkauft welche.</p>' : '';
    return `<h4>Formeln</h4><ul class="recipes">${list.map((r, i) => `<li><div>${itemIconBig(r.potion)}<strong>${esc(r.name)}</strong> <span class="muted">Seq. ${r.seq}</span><br>
      ${r.ingredients.map((x) => `<span class="ing ${x.have >= x.need ? 'good' : 'muted'}">${itemIcon(x.id)}${esc(x.name)} ${x.have}/${x.need}</span>`).join(' · ')}</div>
      ${withButtons ? `<div><button class="small" data-brew="${r.formula}" ${r.ready ? '' : 'disabled'}><span class="key">${i + 1}</span> Brauen</button></div>` : ''}</li>`).join('')}</ul>`;
  }

  drink(itemId) {
    const who = this.state.hasP2() && (this.tab === 'items' || this.tab === 'pfad') ? this.invPlayer : 1;
    const r = this.as(() => this.state.drink(itemId), who);
    if (r.lost) { this.close(); return; } // Meldung kommt über 'lostcontrol'
    if (!r.ok) { this.renderNotebook(esc(r.text)); return; }
    this.close();
    const title = `${who === 2 ? 'Spieler 2: ' : ''}${this.state.item(itemId).name}`;
    if (r.ascension) this.playAscension(r.ascension, () => this.showMessage(title, r.text));
    else this.showMessage(title, r.text);
  }

  /**
   * Aufstiegs-Szene für Halbgott (Sequenz 4) und Engel (Sequenz 2): Lichtflut in der Pfadfarbe über dem ganzen Bild,
   * Ringe, dann das Wort in großen Lettern und der Name der Stufe. Die Welt spielt dazu ihre eigenen Funken (WorldScene).
   * Tasten sind so lange gesperrt; danach folgt das Trankfenster.
   */
  playAscension(asc, then) {
    const color = asc.color ?? '#e8c070';
    const el = document.createElement('div');
    el.className = 'ascension';
    el.style.setProperty('--c', color);
    el.innerHTML = `<div class="rings"><i></i><i></i><i></i></div><div class="words"><span class="rank">Sequenz ${asc.seq}</span><strong>${esc(asc.title)}</strong><span class="name">${esc(asc.name ?? '')}</span></div>`;
    this.root.appendChild(el);
    this.keysBlockedUntil = performance.now() + 4200;
    setTimeout(() => el.classList.add('fade'), 3600);
    setTimeout(() => { el.remove(); then?.(); }, 4300);
  }

  /** Braukessel: wer ihn bedient (Spieler 2 per Enter), braut aus seiner eigenen Tasche. */
  openBrew(feedback = '') {
    this.state.withPlayer(this.actor, () => this.renderBrew(feedback), { quiet: true });
  }

  renderBrew(feedback) {
    const list = this.state.recipes();
    this.brewList = list;
    const el = this.open('brew', `
      <h3>Braukessel${this.state.hasP2() ? ` <span class="muted">für Spieler ${this.state.acting}</span>` : ''}</h3>
      <p class="lead">Der Kessel blubbert über einem Kohlebecken. Wähle eine Formel. Die Zutaten werden verbraucht.</p>
      ${this.recipesHtml(true)}
      ${this.sudHtml()}
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="close">Fertig <span class="key">Esc</span></button></div>`, 'notebook brew');
    el.querySelectorAll('[data-brew]').forEach((b) => { b.onclick = () => this.brew(b.dataset.brew); });
    el.querySelectorAll('[data-sud-add]').forEach((b) => { b.onclick = () => {
      if ((this.sudPick ??= []).length < SUD_MAX_ZUTATEN) { this.sudPick.push(b.dataset.sudAdd); this.sfx('sud_zutat', { variant: sudZutatVariant(b.dataset.sudAdd, this.state.item(b.dataset.sudAdd)) }); } // DS: Pulver, Kraut oder Flüssigkeit
      this.openBrew('');
    }; });
    el.querySelectorAll('[data-sud-rm]').forEach((b) => { b.onclick = () => { this.sudPick?.splice(Number(b.dataset.sudRm), 1); this.openBrew(''); }; });
    el.querySelector('[data-sud-brew]')?.addEventListener('click', () => this.brewSud());
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  /** Freies Brauen (Pfad des Kessels ab Sequenz 6, core/Sude.js): bis zu drei Zutaten ins leere Gefäß. */
  sudHtml() {
    const s = this.state;
    if (!s.freeBrewUnlocked()) return s.pathway?.id === 'kessel' ? `<p class="muted">${esc(s.freeBrewBlock())}</p>` : '';
    const pick = (this.sudPick ??= []).filter((id) => s.itemCount(id) > 0);
    this.sudPick = pick;
    const used = {};
    for (const id of pick) used[id] = (used[id] ?? 0) + 1;
    const ingredients = s.sudIngredients().filter((z) => z.count > (used[z.id] ?? 0));
    const known = s.knownSude();
    const vessels = s.itemCount(LEERES_GEFAESS);
    return `<div class="sud"><h4>Eigener Sud <span class="muted">ohne Formel · bis zu ${SUD_MAX_ZUTATEN} Zutaten · leere Gefäße: ${vessels}</span></h4>
      <p class="muted">Was zusammenpasst, wird ein Sud mit Wirkung; was nicht passt, ein Trüber Sud. Jedes neue Rezept gilt als eigene Schöpfung.</p>
      <p>Im Kessel: ${pick.length ? pick.map((id, i) => `<button class="small" data-sud-rm="${i}" title="Herausnehmen">${itemIcon(id)}${esc(s.item(id).name)} ✕</button>`).join(' ') : '<span class="muted">nichts</span>'}
        <button class="small ${pick.length && vessels ? 'primary' : ''}" data-sud-brew="1" ${pick.length && vessels ? '' : 'disabled'}>Abfüllen</button></p>
      <ul class="choices giftlist">${ingredients.map((z) => `<li><button data-sud-add="${z.id}" ${pick.length >= SUD_MAX_ZUTATEN ? 'disabled' : ''}>${itemIcon(z.id)}${esc(z.name)} <span class="muted">×${z.count - (used[z.id] ?? 0)}</span></button></li>`).join('') || '<li class="empty">Keine Zutaten in der Tasche.</li>'}</ul>
      ${known.length ? `<h4>Deine Rezepte</h4><ul class="steps">${known.map((k) => `<li>${itemIcon(k.item)}<strong>${esc(k.name)}</strong>: ${k.zutaten.map((z) => esc(z.name)).join(' + ')} <span class="muted">(${esc(sudEffectText(s.item(k.item), buffLabel))})</span></li>`).join('')}</ul>` : ''}</div>`;
  }

  brewSud() {
    const r = this.as(() => this.state.brewSud(this.sudPick ?? []));
    // DS: gelungen (heller Dampf) oder Trüber Sud (Asche), danach fließt er ins Glas
    if (r.ok) sudSounds(r).forEach(([id, ms]) => (ms ? setTimeout(() => this.sfx(id), ms) : this.sfx(id)));
    else this.sfx(worldSound('brew', r));
    this.scene?.playBrewFx?.(r.ok);
    if (r.ok) this.sudPick = [];
    this.openBrew(`<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
  }

  brew(formulaId) {
    const r = this.as(() => this.state.brew(formulaId));
    this.sfx(worldSound('brew', r));
    this.scene?.playBrewFx?.(r.ok);
    this.openBrew(`<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
  }

  openShop(merchantId, mode = 'buy', feedback = '') {
    // CK: am Stillen Abend (vierter Wintertag) bleiben alle Verkaufstische leer; Zeugen, Fälle und Unterschlüpfe bleiben offen
    if (this.state.stillerAbend?.()) {
      const m = this.state.merchant(merchantId);
      this.showMessage('Stiller Abend', `${m?.name ?? 'Der Händler'} hat heute nichts ausgelegt. Am Stillen Abend ruht der Verkauf in allen Städten, nicht deine Ermittlung. Morgen geht es weiter.`);
      return;
    }
    this.state.withPlayer(this.actor, () => this.renderShop(merchantId, mode, feedback), { quiet: true });
  }

  /** CK: Händlerspruch zur Jahreszeit (texte.json → haendler) für den Markt dieser Karte. */
  seasonGreeting() {
    const s = this.state;
    const line = s.content.festeLeben?.haendler?.[`fs_${s.season?.()}`]?.[s.map];
    return line && s.meets(line) ? line.text.replace(/^„|“$/g, "") : null; // die Festtexte bringen eigene Anführungszeichen mit, der Laden setzt seine selbst
  }

  renderShop(merchantId, mode, feedback) {
    const s = this.state;
    const m = s.merchant(merchantId);
    if (!m) throw new Error(`Händler fehlt: ${merchantId}`);
    this.shop = { id: merchantId, mode };
    let rows;
    if (mode === 'buy') {
      const stock = s.shopStock(merchantId);
      this.shop.entries = stock.map((e) => ({ id: e.item, disabled: !!e.locked || e.owned || s.money < e.price }));
      // Paket A: Ladenfächer, Schlösser und Preisschilder (A_10_shop.png)
      rows = stock.map((e, i) => `<li class="item ${e.locked ? 'lockedrow' : ''}"><div><span class="shopslot ${e.locked ? 'locked' : e.owned ? 'sold' : ''}">${itemIconBig(e.item)}</span><strong>${esc(e.name)}</strong>${s.itemCount(e.item) ? ` <span class="muted">(hast ${s.itemCount(e.item)})</span>` : ''}<br>
        <span class="desc">${e.locked ? uiSprite('shop', /Rang|Ansehen/.test(e.locked) ? 'locked_rank' : 'locked_pathway', 1 / 12, 'shopico') : ''}${esc(e.locked ?? e.desc)}</span>${e.locked ? '' : offerHtml(s, e.item)}</div>
        <div>${e.owned ? `<span class="badge likely">${uiSprite('shop', 'only_once', 1 / 16, 'shopico')}${e.soldOut ? 'vergriffen' : 'gekauft'}</span>` : `${e.left ? `<span class="muted">noch ${e.left}</span> ` : ''}<button class="small pricetag" data-buy="${i}" ${this.shop.entries[i].disabled ? 'disabled' : ''}>${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${e.price} Sch.</button>`}</div></li>`).join('');
    } else {
      const sellable = s.items().filter((it) => s.sellPrice(it.id) !== null);
      this.shop.entries = sellable.map((it) => ({ id: it.id }));
      rows = sellable.map((it, i) => `<li class="item"><div><span class="shopslot">${itemIconBig(it.id)}</span><strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}<br><span class="desc">${esc(it.desc)}</span>${offerHtml(s, it.id)}</div>
        <div><button class="small pricetag" data-sell="${i}">${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${s.sellPrice(it.id)} Sch.</button></div></li>`).join('') || `<li class="empty">Nichts, was ${esc(m.name)} haben will.</li>`;
    }
    const el = this.open('shop', `
      <h3>${esc(m.name)} <span class="muted">${esc(m.title)}</span>${s.hasP2() ? ` <button class="badge keybtn" data-key="g">für Spieler ${s.acting} · <span class="key">G</span> wechseln</button>` : ''}</h3>
      <p class="lead">„${esc(this.seasonGreeting() ?? m.greeting)}“</p>
      ${m.buys ? `<div class="tabs"><button class="tab ${mode === 'buy' ? 'sel' : ''}" data-mode="buy">${uiSprite('shop', 'buy', 1 / 16, 'tabico')}Kaufen</button><button class="tab ${mode === 'sell' ? 'sel' : ''}" data-mode="sell">${uiSprite('shop', 'sell', 1 / 16, 'tabico')}Verkaufen</button> <span class="muted">Wechseln mit <span class="key">V</span></span></div>` : ''}
      <ul class="items shoplist">${rows}</ul>
      <div class="feedback">${feedback}</div>
      <div class="actions"><span class="purse">${moneyIcon(s.money)}${s.money} Schilling</span><button data-act="close">Gehen <span class="key">Esc</span></button></div>`, 'notebook shop');
    el.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => this.shopPick(Number(b.dataset.buy)); });
    el.querySelectorAll('[data-sell]').forEach((b) => { b.onclick = () => this.shopPick(Number(b.dataset.sell)); });
    el.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => { this.forgetScroll(); this.openShop(merchantId, b.dataset.mode); }; });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  // --- Revier: Asservatenkammer und Gutachterin ---------------------------------------

  /** Asservatenkammer: Artefakte ausleihen und zurückgeben. */
  openVault(feedback = '') {
    const s = this.state;
    const stock = s.vaultStock();
    this.vault = stock.map((e) => ({ type: 'artifact', id: e.id, borrowed: e.borrowed, disabled: !e.borrowed && !!e.locked }));
    const rows = stock.map((e, i) => `<li class="item ${e.locked && !e.borrowed ? 'lockedrow' : ''}"><div>${itemIconBig(e.id)}<strong>${esc(e.name)}</strong><br>
      <span class="desc">${esc(e.desc)}</span>${artifactEffectsHtml(e)}${e.locked && !e.borrowed ? `<span class="muted">🔒 ${esc(e.locked)}</span>` : ''}</div>
      <div><button class="small" data-vault="${i}" ${this.vault[i].disabled ? 'disabled' : ''}><span class="key">${i + 1}</span> ${e.borrowed ? 'Zurückgeben' : 'Ausleihen'}</button></div></li>`).join('');
    const el = this.open('vault', `
      <h3>Asservatenkammer <span class="muted">Sergeant Thale</span></h3>
      <p class="lead">„Alles hier ist beschlagnahmt, weil es jemandem geschadet hat. Ich leihe es Ihnen trotzdem. Höchstens drei Dinge gleichzeitig am Leib, sonst holen wir Sie aus dem Kanal.“</p>
      <div class="status">Ausgeliehen <strong>${s.borrowed.length}/${s.borrowLimit()}</strong> · Mit höherem Rang darfst du mehr mitnehmen.</div>
      <ul class="items shoplist">${rows}</ul>
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="close">Gehen <span class="key">Esc</span></button></div>`, 'notebook shop');
    el.querySelectorAll('[data-vault]').forEach((b) => { b.onclick = () => this.vaultPick(Number(b.dataset.vault)); });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  vaultPick(i) {
    const e = this.vault?.[i];
    if (!e || e.disabled) return;
    if (e.type === 'potion') {
      const r = this.state.takeRevierPotion(e.pathway);
      this.openExpert(`<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
      return;
    }
    if (e.type === 'cleanse') {
      const r = this.as(() => this.state.cleanseAt(e.id));
      this.openExpert(`<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
      return;
    }
    const r = e.borrowed ? this.state.returnArtifact(e.id) : this.state.borrowArtifact(e.id);
    this.openVault(`<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
  }

  /** Gutachterin Dr. Varga: Tränke des Reviers für gelöste Fälle, dazu eine Einschätzung des eigenen Pfades. */
  openExpert(feedback = '') {
    const s = this.state;
    const sup = s.revierSupply();
    const offers = s.revierOffers();
    this.vault = offers.map((o) => ({ type: 'potion', pathway: o.pathway, disabled: o.taken || !!o.locked || !o.potion }));
    const names = (sup?.pathways ?? []).map((pid) => s.content.pathways[pid]?.short).join(', ');
    const rows = offers.map((o, i) => {
      const p = s.content.pathways[o.pathway];
      return `<li class="item ${o.locked ? 'lockedrow' : ''}"><div>${o.potion ? itemIconBig(o.potion) : emblem(o.pathway, 32)}<strong style="color:${p.color}">${esc(p.name)}</strong> · Sequenz ${o.seq}${o.name ? `: ${esc(o.name)}` : ''}<br>
        <span class="desc">${esc(o.locked ? `🔒 ${o.locked}` : o.taken ? 'Schon abgeholt.' : p.seqs[o.seq]?.desc ?? '')}</span></div>
        <div><button class="small" data-vault="${i}" ${this.vault[i].disabled ? 'disabled' : ''}><span class="key">${i + 1}</span> Abholen</button></div></li>`;
    }).join('');
    const cleanse = this.as(() => s.cleanseOffers());
    const base = this.vault.length;
    this.vault.push(...cleanse.map((c) => ({ type: 'cleanse', id: c.id, disabled: !c.affordable })));
    const cleanseRows = cleanse.map((c, i) => `<li class="item tainted"><div>${itemIcon(c.id)}<strong>${esc(c.name)}</strong> ${korrBadge()}<br>
        <span class="desc">${esc(c.kind === 'artifact' ? 'Ein Artefakt mit schwarzem Faden darin. Teuer, aber danach wirkt nur noch sein eigener Fluch.' : 'Der schwarze Faden lässt sich mit Salzlauge und Geduld herauslösen.')}</span></div>
        <div><button class="small" data-vault="${base + i}" ${c.affordable ? '' : 'disabled'}><span class="key">${base + i + 1}</span> Reinigen · ${coin}${c.price}</button></div></li>`).join('');
    const cleanseBox = cleanse.length
      ? `<h4>Reinigung</h4><p class="lead">„Da ist etwas in Ihren Sachen, das da nicht hingehört. Ich kann es herauslösen. Es kostet, und es tut dem Stück nicht gut, aber Ihnen tut es noch weniger gut.“</p><ul class="items shoplist">${cleanseRows}</ul>`
      : '';
    const intro = !s.isBeyonder()
      ? `Das Revier führt Tränke für drei Pfade: ${names}, und nur bis Sequenz 7. Jede Stufe gibt es einmal, sobald ein bestimmter Fall gelöst ist. Für alle anderen Pfade gehen Sie auf den Nachtmarkt.`
      : offers.length ? 'Ihr Pfad gehört zu denen, die das Revier unterstützt, bis Sequenz 7. Danach müssen Sie sich die Formeln selbst beschaffen: bei geheimen Treffen, oder mit viel Glück irgendwo da draußen. Trinken sollten Sie erst, wenn der letzte Trank verdaut ist.'
        : `Ihr Pfad gehört nicht zu denen des Reviers (${names}). Beraten kann ich Sie trotzdem, aber Tränke bekommen Sie bei Kittering auf dem Nachtmarkt.`;
    const el = this.open('vault', `
      <h3>Dr. Ilse Varga <span class="muted">Gutachterin für Okkultes</span></h3>
      <p class="lead">„${esc(intro)}“</p>
      ${s.isBeyonder() ? `<div class="lead">${paragraphs(s.pathwayReport())}</div>` : ''}
      <ul class="items shoplist">${rows || '<li class="empty">Gerade nichts für Sie.</li>'}</ul>
      ${cleanseBox}
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="close">Gehen <span class="key">Esc</span></button></div>`, 'notebook shop');
    el.querySelectorAll('[data-vault]').forEach((b) => { b.onclick = () => this.vaultPick(Number(b.dataset.vault)); });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  shopPick(i) {
    const sh = this.shop;
    const e = sh?.entries[i];
    if (!e) return;
    const r = this.as(() => (sh.mode === 'buy' ? this.state.buy(sh.id, e.id) : this.state.sell(e.id, sh.id)));
    this.openShop(sh.id, sh.mode, `<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
  }

  // --- Geheime Treffen: die Runde (core/Auction.js) ---------------------------------------

  openAuction(circleId) {
    const r = this.state.startSession(circleId);
    if (!r.ok) { this.showMessage(this.state.gatheringDef(circleId)?.name ?? 'Treffen', r.text); return; }
    this.renderAuction();
  }

  renderAuction(feedback = '') {
    const s = this.state;
    const a = s.auction;
    if (!a) { this.close(); return; }
    const g = s.gatheringDef(a.circle);
    const speaker = s.auctionSpeaker();
    const [emblem] = ZIRKEL_ICONS[a.circle] ?? [];
    const leader = a.phase === 'lot' ? a.lot?.leader : null;
    const seats = a.members.map((m, i) => `<li class="seat ${m === speaker ? 'active' : ''} ${i < a.turn ? 'done' : ''}">${headFace(m, s.memberName(m))}<span>${esc(s.memberName(m))}</span>${m === leader ? auktionIcon('bid_0', 'bidhand') : ''}</li>`).join('')
      + `<li class="seat you ${a.phase.startsWith('own') ? 'active' : ''}">${headFace('player', 'Du')}<span>Du</span>${leader === 'player' ? auktionIcon('bid_0', 'bidhand') : ''}</li>`
      + (a.artisan ? `<li class="seat artisan ${a.phase === 'artisan' ? 'active' : ''}">${headFace(s.artisanId(), s.artisanName())}<span>${esc(s.artisanName())}</span></li>` : '');
    const acts = [];
    let stage = '';
    const who = (id) => (id === 'player' ? 'dir' : id ? esc(s.memberName(id)) : 'niemandem');
    if (a.phase === 'lot') {
      const l = a.lot;
      const it = s.item(l.item);
      const next = s.nextBid();
      stage = `${portrait(l.seller)}<div class="speaker">${esc(s.memberName(l.seller))} <span class="role">${esc(s.content.npcs[l.seller]?.role ?? '')}</span></div>
        <div class="lot">${itemIconBig(l.item)}<strong>${esc(it.name)}</strong>${s.itemCount(l.item) ? ` <span class="muted">(hast ${s.itemCount(l.item)})</span>` : ''}<br><span class="desc">${esc(it.desc ?? '')}</span>${offerHtml(s, l.item)}</div>
        ${l.appraisal ? `<p class="bidline waage">Schätzwert: <b>${l.appraisal} Sch.</b> · Ausruf: <b>${l.start ?? l.price} Sch.</b></p>` : ''}
        <p class="bidline">${l.leader && l.leader !== 'player' ? headFace(l.leader, s.memberName(l.leader)) : ''}Gebot: <b>${l.price} Sch.</b> · führt: ${who(l.leader)}</p>`;
      if (l.leader !== 'player') acts.push({ label: `${l.leader ? 'Überbieten' : 'Bieten'}: ${next} Sch.`, fn: () => s.bid(), off: s.money < next });
      acts.push({ label: 'Aussteigen', fn: () => s.passLot() });
      if (a.fraud && !a.fraud.exposed) acts.push({ label: 'Betrug anprangern', fn: () => s.accuseFraud() }); // Ritual der Waage
    } else if (a.phase === 'request') {
      const q = a.request;
      const it = s.item(q.item);
      const have = s.itemCount(q.item);
      stage = `${portrait(q.member, 'bidding')}<div class="speaker">${esc(s.memberName(q.member))} <span class="role">Gesuch</span></div>
        <div class="lot">${itemIconBig(q.item)}<strong>Sucht: ${esc(it.name)}</strong> <span class="muted">(du hast ${have})</span><br><span class="desc">Zahlt ${q.price} Schilling.</span></div>`;
      acts.push({ label: `Abgeben für ${q.price} Sch.`, fn: () => s.fulfillRequest(), off: !have });
      acts.push({ label: have ? 'Behalten' : 'Habe ich nicht dabei', fn: () => s.declineRequest() });
    } else if (a.phase === 'own') {
      const list = s.ownOfferables();
      stage = `<div class="speaker">Dein Angebot <span class="role">Artefakte und Formeln</span></div>
        ${list.length ? '<p class="lead">Was legst du auf den Tisch?</p>' : '<p class="lead">Du hast keine Artefakte oder Formeln dabei, die du anbieten könntest.</p>'}
        ${list.length ? `<ul class="offers">${list.slice(0, 8).map((o) => `<li>${itemIcon(o.id)}<strong>${esc(o.name)}</strong> <span class="muted">etwa ${o.value} Sch.</span>${offerHtml(s, o.id)}</li>`).join('')}</ul>` : ''}
        ${a.artisan ? `<p class="lead muted">${esc(s.artisanName())} sitzt abseits und nimmt starke Beutestücke in Auftrag.</p>` : ''}`;
      if (a.artisan) acts.push({ label: `Zu ${s.artisanName()}: Beute fassen lassen`, fn: () => s.openArtisan() });
      for (const o of list.slice(0, 8)) acts.push({ label: `${o.name} anbieten`, fn: () => s.offerOwn(o.id), icon: o.id });
      acts.push({ label: 'Runde beenden', fn: () => this.finishAuction() });
    } else if (a.phase === 'artisan') {
      const recipes = s.artisanRecipes(a.circle, a.cycle);
      const pct = (c) => `${Math.round(c * 100)} %`;
      // Paket CQ/CR: Chancenmarke (Zehnerstufe) neben dem exakten Wert, Rückgabe bei Fehlschlag, Odas Zeile am Stück, Zirkelmarke
      const chanceIcon = (c) => uiSprite('cqchance', String(Math.min(80, Math.max(40, Math.floor(c * 10) * 10))), 1 / 6, 'cqicon', pct(c));
      const stateIcon = (st) => uiSprite('cqauftrag', st, 1 / 6, 'cqicon', s.faTexte?.()?.texte?.auftragskarte?.zustand?.[st] ?? st);
      const zirkelIcon = (id) => uiSprite('cqzirkel', id, 1 / 6, 'cqicon', s.gatheringDef(id)?.name ?? id);
      const erst = s.artisanDef()?.erfolg?.erstattung ?? 0.5;
      const rows = recipes.map((r) => {
        const c = s.recipeCheck(r);
        const it = s.item(c.artifact);
        const needs = c.needs.map((x) => `<span class="${x.have >= x.n ? 'got' : 'lack'}">${itemIcon(x.item)}${esc(s.item(x.item)?.name ?? x.item)} ${x.have}/${x.n}</span>`).join(' · ');
        const oda = it?.oda ? `<br><span class="muted">„${esc(it.oda)}“</span>` : '';
        return `<li class="recipe ${c.ok ? 'ready' : ''}">${itemIconBig(c.artifact)}<strong>${esc(it?.name ?? c.artifact)}</strong> <span class="muted">Lohn ${c.fee} Sch. · ${chanceIcon(c.chance)}gelingt zu ${pct(c.chance)} · Rückgabe ${Math.floor(c.fee * erst)} Sch.</span>${artifactEffectsHtml(it ?? {})}<span class="needs">Aus: ${needs}</span>${oda}</li>`;
      }).join('');
      const pending = s.pendingOrders();
      const openMax = s.maxOpenOrders?.() ?? 2;
      const pendingHtml = pending.length ? `<p class="lead muted">Offen (${pending.length} von ${openMax}): ${pending.map((o) => `${stateIcon(s.orderState?.(o, a.cycle) ?? 'in_arbeit')}${esc(s.item(o.artifact)?.name ?? o.artifact)} (${zirkelIcon(o.circle)}${esc(s.gatheringDef(o.circle)?.name ?? o.circle)}${o.owner === 2 ? ', Spieler 2' : ''})`).join(', ')}.</p>` : '';
      const history = (s.artisanHistory ?? []).slice(-3).reverse();
      const historyHtml = history.length ? `<p class="lead muted">Zuletzt: ${history.map((h) => `${stateIcon(h.ok ? 'abgeholt' : 'misslungen')}${esc(s.item(h.artifact)?.name ?? h.artifact)}${h.ok ? '' : ` (${h.refund} Sch. zurück)`}`).join(', ')}.</p>` : '';
      const zirkelZeile = s.artisanCircleLine?.(a.circle);
      stage = `${portrait(s.artisanId(), 'pruefend')}<div class="speaker">${esc(s.artisanName())} <span class="role">${esc(s.content.npcs[s.artisanId()]?.role ?? 'Fasserin')}</span></div>
        <p class="lead">„${esc(s.artisanGreeting(a.circle, a.cycle))}${zirkelZeile ? ` ${esc(zirkelZeile)}` : ''}“ <span class="muted">Ein Stück, fester Lohn. Fertig ist es beim nächsten Treffen dieses Zirkels; misslingt die Fassung, ist das Stück hin und die Hälfte des Lohns kommt zurück. Höchstens ${openMax} Aufträge gleichzeitig.</span></p>
        <ul class="recipes">${rows || '<li class="muted">Heute hat sie nichts auf dem Tisch.</li>'}</ul>${pendingHtml}${historyHtml}`;
      for (const r of recipes) {
        const c = s.recipeCheck(r);
        acts.push({ label: `${s.item(c.artifact)?.name ?? r.id} in Auftrag geben (${c.fee} Sch., ${pct(c.chance)})`, fn: () => s.orderArtifact(r.id), off: !c.ok, icon: c.artifact });
      }
      acts.push({ label: 'Zurück zur Runde', fn: () => s.leaveArtisan() });
    } else if (a.phase === 'own_bids') {
      const o = a.own;
      const it = s.item(o.item);
      stage = `<div class="speaker">Dein Los <span class="role">${esc(it.name)}</span></div>
        <div class="lot">${itemIconBig(o.item)}<strong>${esc(it.name)}</strong><br><span class="desc">${o.bids.length ? o.bids.map((b) => `${esc(s.memberName(b.member))}: ${b.price} Sch.`).join(' · ') : 'Kein Gebot.'}</span>${offerHtml(s, o.item)}</div>`;
      if (o.bids.length) acts.push({ label: `Zuschlag an ${s.memberName(o.bids[0].member)}: ${o.bids[0].price} Sch.`, fn: () => s.acceptOwn() });
      acts.push({ label: 'Zurückziehen', fn: () => s.withdrawOwn() });
    }
    this.auctionActs = acts;
    let n = 0;
    const el = this.open('auction', `
      <h3>${emblem !== undefined ? atlasIcon(ZIRKEL_URL, emblem, 8) : S_ZIRKEL[a.circle] ? regionIcon(S_ZIRKEL_URL, S_ZIRKEL[a.circle].emblem, 128, 64, 'mark', 1 / 16) : auktionIcon(a.circle, 'mark', 1 / 6)}${esc(g.name)} <span class="muted">${a.phase === 'artisan' ? 'Bei der Fasserin' : a.phase.startsWith('own') ? 'Eigenes Angebot' : `Runde ${Math.min(a.turn + 1, a.members.length)} von ${a.members.length}`}</span></h3>
      <ul class="seats">${seats}</ul>
      <div class="stage">${stage}</div>
      <ul class="alog">${a.log.map((t) => `<li>${t.startsWith('Zuschlag') ? auktionIcon('sold', 'sold', 1 / 12) : ''}${esc(t)}</li>`).join('')}</ul>
      ${feedback ? `<p class="feedback">${feedback}</p>` : ''}
      <div class="actions"><span class="purse">${moneyIcon(s.money)}${s.money} Schilling</span>
        ${acts.map((x, i) => `<button class="small" data-act-i="${i}" ${x.off ? 'disabled' : ''}><span class="key">${++n}</span> ${x.icon ? itemIcon(x.icon) : ''}${esc(x.label)}</button>`).join('')}
        <button data-act="leave">Gehen <span class="key">Esc</span></button></div>`, 'notebook auction');
    el.querySelectorAll('[data-act-i]').forEach((b) => { b.onclick = () => this.auctionPick(Number(b.dataset.actI)); });
    el.querySelector('[data-act=leave]').onclick = () => this.finishAuction();
  }

  auctionPick(i) {
    const x = this.auctionActs?.[i];
    if (!x || x.off) return;
    const a0 = this.state.auction;
    const before = a0 ? a0.bought.length + a0.sold.length : 0;
    const r = x.fn();
    // CM: Gebot (Papier und Räuspern), Zuschlag (Hammer), Fassung (Metall klickt), Fehlschlag (Doppel-Tock)
    if (/^(Über)?[Bb]ieten/.test(x.label)) this.sfx(worldSound('bid', r ?? { ok: true }));
    else if (/ fassen /.test(x.label)) this.sfx(worldSound('craft', r ?? { ok: false }));
    else if (r && r.ok === false) this.sfx(uiSound('auction', 'error'));
    const a1 = this.state.auction;
    if (a1 && a1.bought.length + a1.sold.length > before) this.sfx(worldSound('hammer'));
    if (r?.exposed !== undefined) this.sfx(worldSound('ritual', { ok: r.exposed }));
    if (r?.ended) { this.close(); this.showMessage('Vor die Tür gesetzt', r.text, { footer: 'Bis zum nächsten Treffen.' }); return; } // falsche Anschuldigung (Waage)
    if (!this.state.auction) return;
    this.renderAuction(r?.text ? esc(r.text) : '');
  }

  finishAuction() {
    const sum = this.state.endSession();
    this.close();
    if (!sum) return;
    const line = (l, verb) => l.map((x) => `${this.state.item(x.item).name} (${x.price} Sch.)`).join(', ') || 'nichts';
    const got = (sum.collected ?? []).map((x) => (x.ok ? `${this.state.item(x.item).name} gelungen` : `${this.state.item(x.item).name} misslungen (${x.refund} Sch. zurück)`)).join(', ');
    this.showMessage('Die Runde löst sich auf', `Gekauft: ${line(sum.bought)}\n\nVerkauft: ${line(sum.sold)}${got ? `\n\nAbgeholt: ${got}` : ''}${sum.crafted?.length ? `\n\nIn Auftrag: ${line(sum.crafted)} · fertig beim nächsten Treffen dieses Zirkels` : ''}`, { footer: 'Bis zum nächsten Treffen.' });
  }

  // --- Eigenes Büro: Lagerschrank und Fallwand -------------------------------------------

  /** Zwei Spalten: was du dabeihast und was im Lager liegt. where: 'buero' oder ein anderes Versteck. */
  openStorage(feedback = '', where = 'buero', title = null) {
    this.state.withPlayer(this.actor, () => this.renderStorage(feedback, where, title), { quiet: true });
  }

  renderStorage(feedback, where, title) {
    const s = this.state;
    this.storageArgs = [where, title];
    const who = s.hasP2() ? ` <button class="badge keybtn" data-key="g">Spieler ${s.acting} · <span class="key">G</span> wechseln</button>` : '';
    const own = where === 'buero';
    const row = (it, act, label, all) => `<li class="item"><div>${itemIcon(it.id)}<strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}${s.itemWeight(it.id) ? ` <span class="muted weight">${fmtLb(s.itemWeight(it.id) * it.count)} Pfd.</span>` : ''}</div>
      <div><button class="small" data-${act}="${it.id}">${label}</button>${it.count > 1 ? ` <button class="small" data-${act}-all="${it.id}">${all}</button>` : ''}</div></li>`;
    // Schwerstes zuerst: das will man meistens loswerden
    const heavy = (a, b) => s.itemWeight(b.id) * b.count - s.itemWeight(a.id) * a.count;
    const carried = s.items().filter((it) => s.canStore(it.id)).sort(heavy);
    const stored = s.storedItems(where).sort(heavy);
    const el = this.open('storage', `
      <h3>${own ? 'Asservatenschrank <span class="muted">Dein Büro im Revier</span>' : esc(title ?? 'Versteck')}${who}</h3>
      <p class="lead">Was hier liegt, ist sicher, auch wenn du unterwegs ohnmächtig wirst oder ausgeraubt wirst. Beweisstücke bleiben bei dir.</p>
      ${carryHtml(s)}
      <div class="storage">
        <div><h4>Bei dir</h4><ul class="items">${carried.map((it) => row(it, 'store', 'Einlagern', 'Alle')).join('') || '<li class="empty">Nichts zum Einlagern.</li>'}</ul></div>
        <div><h4>${own ? 'Im Schrank' : 'Im Versteck'}</h4><ul class="items">${stored.map((it) => row(it, 'take', 'Nehmen', 'Alle')).join('') || `<li class="empty">${own ? 'Der Schrank ist leer.' : 'Hier liegt nichts.'}</li>`}</ul></div>
      </div>
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="close">Schließen <span class="key">Esc</span></button></div>`, 'notebook shop storage-panel');
    const act = (fn) => () => {
      const r = this.as(fn);
      this.openStorage(`<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`, where, title);
    };
    el.querySelectorAll('[data-store]').forEach((b) => { b.onclick = act(() => s.storeItem(b.dataset.store, 1, where)); });
    el.querySelectorAll('[data-store-all]').forEach((b) => { b.onclick = act(() => s.storeItem(b.dataset.storeAll, s.itemCount(b.dataset.storeAll), where)); });
    el.querySelectorAll('[data-take]').forEach((b) => { b.onclick = act(() => s.retrieveItem(b.dataset.take, 1, where)); });
    el.querySelectorAll('[data-take-all]').forEach((b) => { b.onclick = act(() => s.retrieveItem(b.dataset.takeAll, s.storedCount(b.dataset.takeAll, where), where)); });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  /** Fallwand im Büro: alle abgeschlossenen Fälle mit Aktendeckel und Ausgang. */
  showCaseWall() {
    const s = this.state;
    const cases = Object.entries(s.endings).map(([caseId, endId]) => ({ caseId, quest: s.quest(caseId), end: s.content.endings[endId] }));
    const extra = cases.length ? `<ul class="casewall">${cases.map((c) => `<li><img src="${caseFileUrl(c.caseId)}" alt="" onerror="this.remove()">
      <div><strong>${esc(c.quest?.title ?? c.caseId)}</strong><br><span class="muted">${esc(c.end?.title ?? '')}</span></div></li>`).join('')}</ul>` : '';
    this.showMessage('Fallwand', cases.length
      ? 'Zeitungsausschnitte, Fotos, rote Fäden. Jeder Fall, den du abgeschlossen hast, hängt hier.'
      : 'Noch leer. Ein paar Reißzwecken warten auf deinen ersten abgeschlossenen Fall.', { extra, footer: `Rang: ${s.rank().name} · Ansehen ${s.honor}` });
  }

  // --- Pausemenü und Spieler 2 ---------------------------------------------------

  openPause(feedback = '') {
    const s = this.state;
    const on = s.hasP2();
    const label = on ? 'Spieler 2 entfernen' : s.p2 ? 'Spieler 2 wieder hinzufügen' : 'Spieler 2 hinzufügen';
    const pad = typeof navigator !== 'undefined' && [...(navigator.getGamepads?.() ?? [])].some(Boolean);
    const el = this.open('pause', `
      <h3>Pause</h3>
      <div class="pausemenu">
        <button class="primary" data-act="resume">${setIcon('weiter')}<span class="key">Esc</span> Weiter</button>
        <button data-act="p2">${uiSprite('ahkoop', on ? 'verlassen' : 'beitreten', 1 / 12, 'aeicon')}<span class="key">2</span> ${label}</button>
        <button data-act="fullscreen">${setIcon(this.isFullscreen() ? 'fenster' : 'vollbild')}${this.fullscreenLabel()}</button>
        <button data-act="sound">${setIcon((this.audio?.master ?? 0) <= 0 ? 'stumm' : 'lautstaerke')}${this.soundLabel()}</button>
      </div>
      <div class="feedback">${feedback}</div>
      ${on ? this.p2LookPicker() : ''}
      <p class="lead">${on ? 'Ihr spielt zu zweit an diesem Rechner. Die Kamera hält euch beide im Bild, jeder hat sein eigenes Inventar. Geld, Ansehen und Fälle teilt ihr.' : 'Zu zweit an einem Rechner: Spieler 2 läuft als Begleiter mit über denselben Bildschirm, mit eigenem Leben und eigenem Inventar.'}</p>
      <div class="controls2">
        <div><h4>Spieler 1 · Ermittler</h4>
          <div><span class="key">WASD</span> laufen${on ? '' : ' (allein auch <span class="key">Pfeile</span>)'}</div>
          <div><span class="key">E</span> untersuchen / sprechen</div>
          <div><span class="key">Q</span> Geistsicht · <span class="key">J</span> Notizbuch · <span class="key">I</span> Inventar</div>
          <div><span class="key">1</span>–<span class="key">9</span> Welt-Fähigkeiten</div>
          <div>Kampf: <span class="key">E</span> Takt · <span class="key">Leertaste</span> ausweichen · <span class="key">F</span> parieren</div>
        </div>
        <div><h4>Spieler 2 · Begleiter</h4>
          <div><span class="key">Pfeile</span> laufen</div>
          <div><span class="key">Enter</span> untersuchen / sprechen / aufheben</div>
          <div><span class="key">I</span> dann <span class="key">G</span> eigenes Inventar</div>
          <div>Ziffernblock <span class="key">1</span>–<span class="key">9</span> Welt-Fähigkeiten</div>
          <div>Kampf: <span class="key">Enter</span> Takt · <span class="key">←</span> ausweichen · <span class="key">→</span> parieren</div>
          <div class="muted">Gamepad${pad ? ' (erkannt)' : ''}: Stick laufen · A Aktion/Takt · X ausweichen · B parieren · Y Inventar · LB/RB Fähigkeit wählen, X einsetzen</div>
        </div>
      </div>`, 'pause');
    el.querySelector('[data-act=resume]').onclick = () => this.close();
    el.querySelector('[data-act=p2]').onclick = () => this.togglePlayer2();
    el.querySelectorAll('[data-look]').forEach((b) => { b.onclick = () => { this.state.setP2Look(b.dataset.look); this.openPause(`Spieler 2 spielt jetzt mit ${P2_LOOKS[b.dataset.look].name}.`); }; });
    el.querySelector('[data-act=fullscreen]').onclick = () => this.toggleFullscreen();
    el.querySelector('[data-act=sound]').onclick = (e) => { this.cycleSound(); e.currentTarget.textContent = this.soundLabel(); };
  }

  /** Paket AH: Auswahl der Figur von Spieler 2 (Auswahlbild mit beiden Figuren). */
  p2LookPicker() {
    const cur = this.state.p2Look();
    return `<div class="p2looks"><img class="p2wahl" src="${P2_CHOICE_URL}" alt="" onerror="this.remove()"><div class="p2lookbtns">${Object.entries(P2_LOOKS).map(([id, l]) => `
      <button data-look="${id}" class="${id === cur ? 'primary' : ''}"><span class="p2face" style="background-image:url(${p2PortraitUrl(id)})"></span>${esc(l.name)}<small class="muted">${esc(l.desc)}</small></button>`).join('')}</div></div>`;
  }

  togglePlayer2() {
    const s = this.state;
    // Paket AI: kurze Begrüßung oder Verabschiedung der gewählten Figur (in Wexmoor heimlich)
    const wx = cityOf(s, s.map) === 'wexmoor';
    if (s.hasP2()) {
      s.removeP2();
      // Paket BU: Trennungsbild zur Verabschiedung
      this.openPause(`<img class="scene koop2trennung" src="${KOOP2_TRENNUNG_URL}" alt="">${uiSprite('koop2', 'p2_trennung', 1 / 12)} ${koopGreeting('leave', s.p2Look(), wx)}<br><span class="muted">Spieler 2 behält seine Sachen für das nächste Mal.</span>`);
    } else {
      const back = !!s.p2;
      s.addP2();
      this.openPause(`${uiSprite('koop2', back ? 'p2_wiedersehen' : 'p2_am_zug', 1 / 12)} ${koopGreeting('join', s.p2Look(), wx)}<br><span class="muted">${back ? 'Spieler 2 ist wieder dabei, mit seinen alten Sachen.' : 'Spieler 2 ist dabei: Spazierstock und zwei Verbände in der Tasche.'}</span>`);
    }
  }

  // --- Kampf -----------------------------------------------------------------

  openCombat(scene) {
    this.combatScene = scene;
    this.combatMenuOpen = null;
    this.modal = 'combat';
    this.setPrompt(null);
    this.root.classList.add('in-combat');
    this.layer.innerHTML = `
      <div class="combat">
        <div class="cb-enemy">${turnFace(scene.encounterId)}<div class="cb-name"></div><div class="bar big"><div class="efill"></div></div><div class="hudbar enemy"></div><div class="cb-tags"></div></div>
        <div class="cb-turn"></div><div class="cb-target hidden">${uiSprite('hud', 'target0', 1 / 6, 'reticle')}</div>
        <div class="cb-msg"><div class="cb-text"></div><div class="cb-help"></div></div>
        <div class="cb-bottom">
          <div class="cb-players">${Object.keys(scene.combat.fighters).map((n) => `
          <div class="cb-player" data-p="${n}">
            <div class="cb-name">${turnFace(n === '2' ? this.state.p2Look() : 'player')}${scene.combat.duo ? `Spieler ${n}` : 'Du'} <span class="muted cb-weapon"></span> <span class="cb-status"></span></div>
            <div class="meter"><span>Leben</span><div class="bar"><div class="pfill"></div></div><span class="hudbar hp"></span><em class="cb-hp"></em></div>
            <div class="meter"><span>Nerven</span><div class="bar"><div class="nfill"></div></div><span class="hudbar nerves"></span></div>
            <div class="cb-ap"><span>Konzentration</span> <span class="pips"></span></div>
          </div>`).join('')}</div>
          <div class="cb-menu"></div>
        </div>
        <div class="cb-touch">
          <button class="cb-def dodge" data-def="dodge">${touchIcon('ausweichen')}Ausweichen</button>
          <button class="cb-def parry" data-def="parry">${touchIcon('parieren')}Parieren</button>
        </div>
      </div>`;
    this.layer.querySelectorAll('[data-def]').forEach((b) => {
      // pointerdown statt click: zählt sofort, wichtig für den Takt
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.holdClicks();
        this.combatScene?.onKey(b.dataset.def, 1);
        b.classList.add('hit');
        setTimeout(() => b.classList.remove('hit'), 120);
      });
    });
    this.combatRefresh();
  }

  combatRefresh() {
    const sc = this.combatScene;
    if (!sc || this.modal !== 'combat') return;
    const c = sc.combat;
    const s = this.state;
    const q = (sel) => this.layer.querySelector(sel);
    q('.cb-enemy .cb-name').innerHTML = `${c.enemy.occult ? uiSprite('hud', 'occult', 1 / 8, 'occult', 'okkult') : ''}${esc(c.enemy.name)} · ${c.enemy.hp}/${c.enemy.maxHp}`;
    // Paket B: Leisten aus battle_hud.png (sechs Füllstände)
    q('.hudbar.enemy').innerHTML = uiSprite('hud', `enemy${pctStep(c.enemy.hp / c.enemy.maxHp, 6)}`, 1 / 4);
    q('.efill').style.width = `${(c.enemy.hp / c.enemy.maxHp) * 100}%`;
    const burn = c.burn ? { giftphiole: ['gift', 'Gift'], aetzwolke: ['zerfressen', 'Ätzend'] }[c.burn.source] ?? ['brennen', 'Brand'] : null;
    q('.cb-tags').innerHTML = [c.enemy.occult ? '<span class="badge refuted">okkult</span>' : '', c.weak ? `<span class="badge likely">${statusIcon('schwachstelle')}Schwachstelle bekannt</span>` : '', c.enc.practice ? '<span class="badge suspected">Übung</span>' : '',
      c.enc.elite ? '<span class="badge refuted">★ Elite</span>' : '', c.enc.boss ? '<span class="badge refuted">☠ Boss</span>' : '',
      this.possibleLoot(c.id),
      burn ? `<span class="badge suspected">${statusIcon(burn[0])}${burn[1]} ${c.burn.rounds}</span>` : '',
      c.stunned ? `<span class="badge suspected">${statusIcon('betaeubt')}betäubt</span>` : '',
      c.fleeing ? `<span class="badge likely flee-badge">⏳ Rückzug · ${c.fleeStatus()}</span>` : '',
      c.confused ? `<span class="badge suspected">${statusIcon('verwirrt')}verwirrt</span>` : '',
      c.enemyGuard ? `<span class="badge refuted">${statusIcon('eisenhaut')}Panzer ${c.enemyGuard}</span>` : '',
      c.veiled ? `<span class="badge refuted">${statusIcon('schatten')}verschleiert</span>` : '',
      c.enc.faction ? `<span class="badge"><span class="emblem16" style="background-image:url(${factionEmblemUrl(c.enc.faction)})"></span>${c.state.content.factions?.[c.enc.faction]?.name ?? ''}</span>` : ''].join(' ');
    // Ein Feld pro Spieler; zu zweit leuchtet, wer am Zug ist bzw. angegriffen wird
    const focus = sc.phase === 'enemy' ? c.targets ?? [c.target] : [c.actor]; // Flächenangriff: beide leuchten
    for (const [n, f] of Object.entries(c.fighters)) {
      const box = this.layer.querySelector(`.cb-player[data-p="${n}"]`);
      if (!box) continue;
      const v = s.playerView(Number(n));
      const b = (sel) => box.querySelector(sel);
      box.classList.toggle('active', c.duo && focus.includes(Number(n)) && !f.down);
      box.classList.toggle('down', f.down);
      b('.cb-status').innerHTML = [f.down ? '<span class="curse">K.o.</span>' : '', f.shield ? statusIcon('eisenhaut', `Schutz ${f.shield}`) + f.shield : '', f.evading ? statusIcon('vorahnung', 'Nächster Angriff geht ins Leere') : '',
        f.bleed ? statusIcon('blutung', `Blutung: ${f.bleed.damage} pro Runde, noch ${f.bleed.rounds}`) + f.bleed.rounds : ''].join(' ');
      b('.pfill').style.width = `${(v.hp / v.maxHp) * 100}%`;
      b('.pfill').classList.toggle('low', v.hp / v.maxHp < 0.3);
      b('.cb-hp').textContent = `${v.hp}/${v.maxHp}`;
      b('.nfill').style.width = `${(v.composure / v.maxComposure) * 100}%`;
      b('.cb-weapon').textContent = v.weapon.name;
      // Paket B: Leisten und Konzentration aus battle_hud.png
      b('.hudbar.hp').innerHTML = uiSprite('hud', `hp${pctStep(v.hp / v.maxHp, 6)}`, 1 / 6);
      b('.hudbar.nerves').innerHTML = uiSprite('hud', `nerves${pctStep(v.composure / v.maxComposure, 6)}`, 1 / 6);
      const apMax = c.apMaxOf(Number(n)); // Konzentrations-Artefakte können den Höchstwert verschieben
      b('.pips').innerHTML = Array.from({ length: apMax }, (_, i) => uiSprite('hud', i >= f.ap ? 'conc_empty' : f.ap >= apMax ? 'conc_glow' : 'conc_full', 1 / 6, 'pip')).join('');
    }
  }

  /** Gamepad A im Menü (Spieler 2 am Zug): Angriff bzw. erster Eintrag. */
  combatPadPick() {
    const m = this.combatMenuOpen;
    if (!m) return;
    const i = m.entries.findIndex((e) => !e.disabled && !e.back);
    if (i >= 0) this.combatPick(i);
  }

  /** Mögliche Beute eines Gegners als Icon-Reihe (seltenes zuerst). */
  possibleLoot(encId) {
    const t = this.state.content.loot?.[encId];
    const items = this.state.content.items;
    const ids = [...new Set([...(t?.drops ?? []).map((d) => d.item), ...Object.keys(t?.items ?? {})])];
    if (!ids.length) return '';
    ids.sort((a, b) => ['gewoehnlich', 'ungewoehnlich', 'selten', 'okkult'].indexOf(itemRarity(items[b])) - ['gewoehnlich', 'ungewoehnlich', 'selten', 'okkult'].indexOf(itemRarity(items[a])));
    return `<span class="cb-loot">Beute: ${ids.map((id) => `<span class="loot-ico rar-${itemRarity(items[id])}" title="${esc(items[id]?.name ?? id)}">${itemIcon(id)}</span>`).join('')}</span>`;
  }

  combatMessage(text, help = '', scene = null) {
    const el = this.layer.querySelector('.cb-text');
    if (!el) return;
    if (this.touch) {
      const t = (x) => x.replace('Weiter mit E', 'Weiter: irgendwo tippen')
        .replace('Drücke E oder Leertaste', 'Tippe irgendwo auf den Bildschirm')
        .replace('Leertaste: ausweichen', 'Knopf Ausweichen').replace('F: parieren', 'Knopf Parieren');
      text = t(text);
      help = t(help);
    }
    el.innerHTML = (scene ? sceneImg(scene) : '') + paragraphs(text); // BS: Sequenzbild vor dem Kampfbeginn
    this.layer.querySelector('.cb-help').textContent = help;
    this.layer.querySelector('.cb-menu').innerHTML = '';
    this.layer.querySelector('.cb-target')?.classList.add('hidden');
    this.combatMenuOpen = null;
  }

  /** Hauptmenü bzw. Untermenüs ('skills', 'items'). */
  combatMenu(sub = 'main') {
    const sc = this.combatScene;
    const c = sc.combat;
    let entries;
    const mine = (fn) => this.state.withPlayer(c.actor, fn, { quiet: true });
    const turn = c.duo ? `Spieler ${c.actor} ist am Zug. ` : '';
    if (sub === 'main') {
      const items = mine(() => this.state.items().filter((i) => i.kind === 'consumable' && !i.cleanse).length);
      entries = [
        { text: c.rules?.shadow ? 'Schattenattacke' : 'Angriff', ui: 'attack', info: c.canUse('attack') ? `+${1 + mine(() => this.state.passive('attack_ap'))} K · beendet den Zug` : 'die Prüfung verbietet es', act: { type: 'skill', id: 'attack' }, disabled: !c.canUse('attack') },
        { text: 'Fertigkeiten', ui: 'skill', info: `${c.ap}/${c.apMax} K`, sub: 'skills' },
        { text: 'Gegenstände', ui: 'item', info: c.canUseItem() ? `${items}` : c.itemBlockedText(), sub: 'items', disabled: !c.canUseItem() },
        // Starke Gegner: Fliehen startet nur den Rückzug, man muss noch Runden durchhalten; läuft er, zeigt der Eintrag den Stand
        { text: 'Fliehen', ui: 'flee', info: c.fleeing ? `Rückzug läuft · ${c.fleeStatus()}` : c.canFlee() ? (c.fleeRounds > 0 ? `${c.fleeRounds} Runden durchhalten` : '') : 'unmöglich', act: { type: 'flee' }, disabled: !c.canFlee(),
          desc: c.fleeRounds > 0 && !c.fleeing ? `${esc(c.enemy.name)} lässt dich nicht einfach gehen: Nach „Fliehen“ ist dein Zug vorbei, und du musst noch ${c.fleeRounds} Runden durchhalten.` : '' },
      ];
      // Seq-4-Prüfungen: Maske verschont, Faden knüpft den Schicksalsfaden
      if (c.canSpare?.()) entries.splice(3, 0, { text: 'Verschonen', ui: 'skill', info: 'Maske · Ende des Kampfes', act: { type: 'spare' }, desc: `${esc(c.enemy.name)} liegt unter 15 % Leben. Verschone ihn: Er wird an seinen Kräften zweifeln, und der Wächter tritt an.` });
      if (c.canMarkFate?.()) entries.splice(3, 0, { text: 'Schicksalsfaden', ui: 'skill', info: 'Faden · kostet die Aktion', act: { type: 'mark' }, desc: `Knüpfe einen Faden an ${esc(c.enemy.name)}. Fünf verschiedene Wesen aus fünf Gebieten, dann schlafen.` });
      if (c.rules?.shadow && c.roundSkill) entries[1].info = `diese Runde: ${esc(c.skillDef(c.roundSkill)?.name ?? '')}`;
      if (c.canStealVoice?.()) entries.splice(3, 0, { text: 'Stimme rauben', ui: 'skill', info: 'verschonen · Zutaten gehen drauf', act: { type: 'voice' }, desc: `${esc(c.enemy.name)} liegt unter 10 % Leben. Nimm die Stimme statt das Leben: Der Kampf endet, keine Beute, das Ritual des Echos ist bestanden.` });
      const fleeNote = c.fleeing ? `<p class="flee-note">⏳ Rückzug läuft: ${c.fleeStatus()} durchhalten${c.duo ? ', dann seid ihr weg' : ', dann bist du weg'}.</p>` : '';
      if (c.actions) entries.push({ text: 'Zug beenden', ui: 'defend', info: '', act: { type: 'end' } });
      else this.combatTurn('player');
      this.layer.querySelector('.cb-text').innerHTML = fleeNote + (c.actions
        ? `<p>${esc(c.log.at(-1) ?? '')}.</p><p>Runde ${c.round}: ${c.duo ? `Spieler ${c.actor} ist` : 'Du bist'} noch am Zug (${c.ap} Konzentration). Fertigkeiten kosten Konzentration, ein Gegenstand pro Zug.</p>`
        : `<p>Runde ${c.round}. ${turn}Was tust du? Solange die Konzentration reicht, kannst du mehrere Fertigkeiten nacheinander einsetzen.</p>`);
      this.layer.querySelector('.cb-help').textContent = '';
    } else if (sub === 'skills') {
      entries = c.skills().filter((k) => k.id !== 'attack').map((k) => ({
        text: k.name, skill: k.id, info: `${k.cost} K${k.composure ? ` · ${k.composure} Nerven` : ''}${isPrecise(k) ? ' · ◎ präzise' : ''}`,
        desc: `${k.desc ?? ''}${isPrecise(k) ? ` ◎ Präzise: volle Wirkung${k.stun ? ' und Betäubung' : ''} nur bei perfektem Takt, das goldene Fenster ist winzig.` : ''}`, act: { type: 'skill', id: k.id }, disabled: !k.usable,
      }));
    } else {
      entries = mine(() => this.state.items()).filter((i) => i.kind === 'consumable' && !i.cleanse).map((i) => ({ text: `${i.name} ×${i.count}`, icon: i.id, desc: i.desc, act: { type: 'item', id: i.id }, disabled: !c.itemAllowed?.(i.id) }));
      if (!entries.length) entries = [{ text: 'Keine Gegenstände', disabled: true }];
    }
    if (sub !== 'main') entries.push({ text: 'Zurück', back: true });
    this.combatMenuOpen = { sub, entries };
    this.layer.querySelector('.cb-target')?.classList.remove('hidden');
    const menu = this.layer.querySelector('.cb-menu');
    menu.classList.toggle('tiles', sub !== 'main');
    const key = (e, i) => (e.back ? 'Esc' : i < 9 ? i + 1 : '');
    const btn = (e, i, inner) => `<li><button data-i="${i}" ${e.disabled ? 'disabled' : ''} title="${esc(e.desc ?? '')}">${inner}</button></li>`;
    if (sub === 'main') {
      menu.innerHTML = `<ol class="choices">${entries.map((e, i) => btn(e, i, `<span class="key">${key(e, i)}</span> ${e.ui ? uiSprite('bmenu', e.disabled ? `${e.ui}_off` : e.ui, 1 / 8, 'cbicon') : ''}${esc(e.text)} <span class="muted">${esc(e.info ?? '')}</span>`)).join('')}</ol>
        <div class="cb-desc"></div>`;
    } else {
      // Fertigkeiten und Gegenstände: kompakte Kacheln mit großem Icon in der alten Fensterhöhe, damit der Gegner sichtbar bleibt;
      // bis Sequenz 1 sind es zwölf Einträge, die Liste scrollt. „Zurück“ steht vorn, die Beschreibung wandert in die Rundenmeldung.
      const back = entries.length - 1;
      menu.innerHTML = `<ol class="choices">${btn(entries[back], back, `<span class="tile-text"><span class="tile-name"><span class="key">Esc</span>Zurück</span></span>`)}${entries.slice(0, back).map((e, i) => btn(e, i, `
          <span class="tile-icon">${e.icon ? itemIconBig(e.icon) : e.skill ? skillIconBig(e.skill) : ''}<span class="key">${key(e, i)}</span></span><span class="tile-text">${esc(e.text)} <span class="muted">${esc(e.info ?? '')}</span></span>`)).join('')}</ol>`;
      // Pfeil unten rechts, solange es weiter unten noch Einträge gibt (auch ohne sichtbaren Scrollbalken, z. B. am Handy)
      const list = menu.querySelector('.choices');
      const more = () => menu.classList.toggle('more', list.scrollTop + list.clientHeight < list.scrollHeight - 2);
      list.onscroll = more;
      requestAnimationFrame(more);
    }
    const help = this.layer.querySelector('.cb-help');
    menu.querySelectorAll('[data-i]').forEach((b) => {
      b.onclick = () => this.combatPick(Number(b.dataset.i));
      b.onmouseenter = () => { (menu.querySelector('.cb-desc') ?? help).textContent = entries[Number(b.dataset.i)].desc ?? ''; };
    });
  }

  combatPick(i) {
    const m = this.combatMenuOpen;
    const e = m?.entries[i];
    if (e?.disabled && e.act) this.sfx(ruleBlockSound(this.combatScene?.combat?.rules, e.act)); // DS: die Prüfung verbietet es hörbar
    if (!e || e.disabled) return;
    if (e.back) { this.combatMenu('main'); return; }
    if (e.sub) { this.combatMenu(e.sub); return; }
    this.combatScene.choose(e.act);
  }

  combatFloat(text, xPct, yPct, cls) {
    const box = this.$('.floats');
    const el = document.createElement('div');
    el.className = `float ${cls}`;
    // Paket B: Zahlen in der Schadensschrift (damage_font.png), Text bleibt Text
    const row = /^[+-]?\d+$/.test(text) ? (text.startsWith('+') ? 'healing' : { crit: 'critical', hurt: 'player_damage', nerves: 'nerves' }[cls] ?? 'damage') : null;
    if (row) { el.classList.add('digits'); el.innerHTML = damageDigits(text, row, 1 / 8); } else el.textContent = text;
    el.style.left = `${xPct}%`;
    el.style.top = `${yPct}%`;
    box.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  /** Kurzes Banner „Du bist am Zug“ / „Gegner am Zug“ (battle_hud.png). */
  combatTurn(who) {
    const el = this.layer.querySelector('.cb-turn');
    if (!el) return;
    const duo = who !== 'enemy' && this.combatScene?.combat?.duo ? this.combatScene.combat.actor : 0;
    // Paket BU: zu zweit zeigt das Banner das Symbol des Spielers, der dran ist
    el.innerHTML = `${duo ? uiSprite('koop2', `p${duo}_am_zug`, 1 / 12) : uiSprite('hud', who === 'enemy' ? 'enemy_turn' : 'your_turn', 1 / 10)}<span>${who === 'enemy' ? 'Gegner am Zug' : duo ? `Spieler ${duo} am Zug` : 'Du bist am Zug'}</span>`;
    el.classList.toggle('enemy', who === 'enemy');
    el.classList.remove('show');
    void el.offsetWidth; // Animation neu starten
    el.classList.add('show');
  }

  combatOver(title) {
    const c = this.combatScene.combat;
    const text = { won: `${c.enemy.name} ist besiegt.`, lost: 'Deine Beine geben nach.', fled: 'Du bringst dich in Sicherheit.', escaped: `${c.enemy.name} entzieht sich.`, spared: `${c.enemy.name} lebt und schweigt.` }[c.outcome];
    this.combatMessage(`${title}! ${text}`, 'Weiter mit E');
  }

  closeCombat(result, enc) {
    this.combatScene = null;
    this.root.classList.remove('in-combat');
    this.$('.floats').innerHTML = '';
    this.modal = null;
    this.layer.innerHTML = '';
    this.updateHp();
    this.updateP2();
    const title = { won: 'Sieg', lost: 'Ohnmacht', fled: 'Rückzug', escaped: 'Entkommen', spared: 'Verschont' }[result.outcome];
    this.keysBlockedUntil = performance.now() + 400; // hastiges E-Drücken schließt die Meldung nicht sofort
    const list = result.loot ? lootHtml(result.loot, this.state.content.items) : '';
    const extra = list ? `<h4 class="loot-title">${uiSprite('bresult', 'loot', 1 / 8)}${result.lootDeferred ? 'Beute liegt am Boden' : 'Beute'}</h4>${list}` : '';
    const footer = result.lootDeferred && list ? 'Geh hin und drück E, um sie aufzuheben.' : '';
    const banner = { won: uiSprite('bresult', 'victory', 1 / 8, 'result-banner'), lost: uiSprite('bresult', 'defeat', 1 / 8, 'result-banner') }[result.outcome] ?? '';
    this.showMessage(`${title}: ${enc.name}`, result.text, { extra, footer, aside: banner });
  }

  // --- Ende -------------------------------------------------------------------

  showEnding(id) {
    const s = this.state;
    const end = s.content.endings[id];
    const caseTitle = s.content.cases.find((c) => c.id === end.case)?.title ?? '';
    const el = this.open('ending', `
      <div class="sub">${esc(caseTitle)}</div>
      <h1>${esc(end.title)}</h1>
      <div class="text">${paragraphs(end.text)}</div>
      <div class="footer">Ansehen ${(s.lastEndingHonor ?? end.honor) > 0 ? '+' : ''}${s.lastEndingHonor ?? end.honor} · Rang: ${esc(s.rank().name)}</div>
      <button class="primary" data-act="ok">Weiter <span class="key">E</span></button>`, `ending ending-${end.honor >= 15 ? 'good' : 'bad'}`);
    // Schlussbild als Hintergrund (480x270)
    // Paket CI: „Ein Leben ohne Schmerz“ zeigt Turm und Garten nebeneinander, wenn Kapitel 2 mit dem Lichtmeister endete
    const img = endingImageUrl(id === 'bha_schmerzlos' && s.flags.has('k2_end_lichtmeister') ? 'bha_schmerzlos_lichtmeister' : id, end.case);
    if (img) { el.classList.add('with-image'); el.style.backgroundImage = `linear-gradient(rgba(10, 8, 14, 0.3), rgba(10, 8, 14, 0.85) 50%), url(${img})`; }
    if (end.chapter) this.pendingChapter = end.chapter;
    this.pendingEpilogue = s.epilogue(id);
    el.querySelector('[data-act=ok]').onclick = () => this.close();
  }

  // --- Tastatur ---------------------------------------------------------------

  onKey(e) {
    if (!this.modal) {
      // Esc in der Welt: Pausemenü (Spieler 2 hinzufügen oder entfernen)
      if (e.key === 'Escape' && !e.repeat && this.scene && !this.combatScene && performance.now() >= this.blockedUntil) {
        this.openPause();
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }
    if (e.repeat) return;
    if (performance.now() < (this.keysBlockedUntil ?? 0)) { e.preventDefault(); e.stopPropagation(); return; }
    const k = e.key.toLowerCase();
    if (this.modal === 'combat') { this.onCombatKey(e, k); return; }
    const confirm = k === 'e' || k === ' ' || k === 'enter';
    const num = /^[1-9]$/.test(k) ? Number(k) - 1 : -1;
    let handled = true;
    if (this.modal === 'title' && confirm) (this.titleContinue ?? this.titleNew)();
    else if (this.modal === 'title' && k === 'n') this.titleNew();
    else if ((this.modal === 'message' || this.modal === 'ending') && (confirm || k === 'escape')) this.close();
    else if (this.modal === 'pause' && (k === 'escape' || confirm)) this.close();
    else if (this.modal === 'pause' && k === '2') this.togglePlayer2();
    else if (this.modal === 'dialogue' && num >= 0) this.choose(this.dialogue.keyMap[num]);
    else if (this.modal === 'gift' && num >= 0 && this.giftIds?.[num]) this.giveGift(this.giftIds[num]);
    else if (this.modal === 'gift' && (k === 'escape' || k === 'e')) this.closeGift();
    else if (this.modal === 'gift' && k === 'g' && this.state.hasP2()) { this.actor = this.actor === 1 ? 2 : 1; this.openGift(); }
    else if (this.modal === 'moor' && num >= 0 && num < (this.moorCount ?? 0)) this.moorPick(num);
    else if (this.modal === 'moor' && (k === 'escape' || k === 'e')) this.closeGift();
    else if (this.modal === 'maske' && num >= 0 && this.maskeOptions?.[num] !== undefined) this.maskePick(num);
    else if (this.modal === 'maske' && (k === 'escape' || k === 'e')) this.cancelMaske();
    else if (this.modal === 'dialogue' && confirm && this.dialogue?.keyMap.length === 1) this.choose(this.dialogue.keyMap[0]);
    else if (this.modal === 'travel' && this.travelPick && (num === 0 || num === 1)) this.travelMode(num === 0 ? 'sicher' : 'schnell');
    else if (this.modal === 'travel' && !this.travelPick && num >= 0) this.travel(num);
    else if (this.modal === 'travel' && this.personMap && (k === 'escape' || k === 'j')) this.openNotebook('personen');
    else if (this.modal === 'travel' && k === 'escape') { if (this.travelPick) this.openTravel(this.travelFrom); else this.close(); }
    else if (this.modal === 'notebook' && (k === 'j' || k === 'i' || k === 'p' || k === 'tab' || k === 'escape')) this.close();
    else if (this.modal === 'shop' && num >= 0) this.shopPick(num);
    else if (this.modal === 'auction' && num >= 0) this.auctionPick(num);
    else if (this.modal === 'auction' && k === 'escape') this.finishAuction();
    else if (this.modal === 'probe' && num >= 0) this.probePick(num);
    else if (this.modal === 'probe' && k === 'escape') this.cancelProbe();
    else if (this.modal === 'shop' && k === 'v' && this.state.merchant(this.shop.id).buys) this.openShop(this.shop.id, this.shop.mode === 'buy' ? 'sell' : 'buy');
    else if ((this.modal === 'shop' || this.modal === 'brew' || this.modal === 'storage' || this.modal === 'vault') && (k === 'escape' || k === 'e')) this.close();
    else if (this.modal === 'vault' && num >= 0) this.vaultPick(num);
    else if (this.modal === 'brew' && num >= 0 && this.brewList?.[num]) this.brew(this.brewList[num].formula);
    else if ((this.modal === 'shop' || this.modal === 'storage') && k === 'g' && this.state.hasP2()) {
      this.actor = this.actor === 1 ? 2 : 1;
      if (this.modal === 'shop') this.openShop(this.shop.id, this.shop.mode); else this.openStorage('', ...this.storageArgs);
    } else if (this.modal === 'notebook' && k === 'g' && (this.tab === 'items' || this.tab === 'pfad') && this.state.hasP2()) { this.invPlayer = this.invPlayer === 1 ? 2 : 1; this.renderNotebook(''); }
    else if (this.modal === 'notebook' && k === 'v') this.combine();
    else if (this.modal === 'notebook' && k === 'a') this.autoCombine();
    else if (this.modal === 'notebook' && this.tab === 'items' && (k === 'arrowleft' || k === 'arrowright') && this.itemCats?.length) {
      const i = this.itemCats.findIndex((c) => c.id === this.itemCat);
      const n = this.itemCats.length;
      this.itemCat = this.itemCats[(i + (k === 'arrowright' ? 1 : n - 1)) % n].id;
      this.forgetScroll('notebook', /^UL\./);
      this.renderNotebook('');
    } else if (this.modal === 'notebook' && num >= 0 && this.notebookTabs[num]) { this.tab = this.notebookTabs[num].id; this.selected = []; this.forgetScroll(); this.renderNotebook(''); }
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  }

  onCombatKey(e, k) {
    const sc = this.combatScene;
    if (!sc) return;
    let handled = false;
    const num = /^[1-9]$/.test(k) ? Number(k) - 1 : -1;
    if (sc.phase === 'menu' && this.combatMenuOpen) {
      if (num >= 0) { this.combatPick(num); handled = true; }
      else if ((k === 'escape' || k === 'backspace') && this.combatMenuOpen.sub !== 'main') { this.combatMenu('main'); handled = true; }
    } else {
      // Zu zweit: Spieler 1 E/Leertaste/F, Spieler 2 Enter/←/→
      let kind = k === ' ' ? 'dodge' : k === 'f' ? 'parry' : (k === 'e' || k === 'enter') ? 'confirm' : null;
      let who = 1;
      if (sc.combat?.duo) {
        if (k === 'enter') who = 2;
        else if (k === 'arrowleft') { kind = 'dodge'; who = 2; } else if (k === 'arrowright') { kind = 'parry'; who = 2; }
      }
      if (kind) handled = sc.onKey(kind, who);
    }
    if (handled || k === ' ' || k === 'tab') { e.preventDefault(); e.stopPropagation(); }
  }
}
