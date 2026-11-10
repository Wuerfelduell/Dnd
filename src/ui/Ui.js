import { NEWSPAPERS } from '../data/lore.js';
import { DIGEST_LABELS } from '../core/Pathways.js';
import { GEAR_SLOT_NAMES } from '../core/Gear.js';
import { lootList, itemRarity, RARITY_NAMES, lootPreview, chanceWord } from '../core/Loot.js';
import {
  itemIconUrl, itemIcon32Url, pathwayEmblemUrl, pathwayCardUrl, COIN_URL, moneyIconUrl, UI_SKINS, UI_SHEETS, UI_REGIONS, DAMAGE_FONT, STATUS_ICONS, STATUS_ICONS_URL,
  portraitUrl, portraitFor, AK_FIGURES, P2_LOOKS, P2_CHOICE_URL, p2HeadUrl, p2PortraitUrl, mapMarkerOf, LOG_MARKERS, LOG_MARKERS_URL, SOURCE_ICONS, SPRITE_BASE,
  endingImageUrl, caseFileUrl, sceneUrl, wantedUrl, QUEST_UI_URL, QUEST_PINS, QUEST_BANNERS,
  TURN_PORTRAITS, TURN_PORTRAITS_URL, TURN_PORTRAIT_URLS, BESTIARY, bestiaryUrl, TITLE_LAYERS,
  headUrl, ritualCardUrl, ZIRKEL_URL, ZIRKEL_ICONS, AUKTION_URL, AUKTION_REGIONS, LONER_UI_URL, LONER_UI, LONER_SEALS, S_ZIRKEL_URL, S_ZIRKEL, skillIconOf, PULSE_ICONS, ARTIFACT_UI_URL, sourceKind, sourceKindUrl, inspectUrl, RISK_ICONS, RISK_ICONS_URL, JOURNAL_FRAME, JOURNAL_FRAME_URL, choiceRisk, riskOf,
  factionEmblemUrl, PLACE_PICTURES, TRAVEL_MODES_URL, TRAVEL_MODE_ICONS, TRAVEL_MARKER_URL,
  DANGER_URL, DANGER_ICONS, DANGER_BANNER, RARITY_SHEET, RARITY_SHEET_URL, RARITY_GEMS,
} from '../world/assets.js';
import { sourceOf } from '../core/sources.js';
import { caseHints, nextDeduction } from '../core/hints.js';
import { guessMood } from '../core/Moods.js';
import { MOOD_LABEL } from '../core/Relations.js';
import { koopGreeting } from '../core/Koop.js';
import { isSolved, knownPeople } from '../core/journal.js';
import { canHurry, travelSafe, travelFast, afterHurryFight, travelDestinations, cityOf } from '../core/Travel.js';
import { questTarget, leadTarget } from '../core/Guide.js';

/** 16x16-Icon vor einem Item-Namen. Lädt es nicht, verschwindet es einfach. */
const itemIcon = (id) => (PULSE_ICONS[id] ? `<span class="item-icon pulse" style="background-image:url(${PULSE_ICONS[id]})"></span>` : `<img class="item-icon" src="${itemIconUrl(id)}" alt="" width="16" height="16" onerror="this.remove()">`);
/** Größeres Icon (Tränke in 32px, sonst das 16er doppelt). */
const itemIconBig = (id) => `<img class="item-icon big" src="${itemIcon32Url(id) ?? itemIconUrl(id)}" alt="" width="32" height="32" onerror="this.remove()">`;
/** Vor- und Nachteile eines Artefakts als kleine Liste. */
const artifactEffectsHtml = (it) => `<span class="arteffects">${(it.boons ?? []).map((x) => `<span class="boon"><i class="artmark plus"></i>${esc(x.text)}</span>`).join('')}${(it.curses ?? []).map((x) => `<span class="curse"><i class="artmark minus"></i>${esc(x.text)}</span>`).join('')}</span>`;
/** Im Laden: Angriff von Waffen, Platz und Wirkung von Kleidung. */
const shopStats = (it) => (it?.kind === 'weapon' ? `<br><span class="muted">Angriff ${it.atk}${it.occult ? ', stark gegen Okkultes' : ''}</span>`
  : it?.kind === 'gear' ? `<br><span class="muted">${GEAR_SLOT_NAMES[it.slot]}</span>${artifactEffectsHtml(it)}` : '');
/** Ausrüstung (F_07): Figur mit vier Plätzen; ein Klick auf ein angelegtes Stück legt es ab. Plätze in Pixeln des Bogens. */
const DOLL_SLOTS = [['hut', 69, 4], ['amulett', 69, 30], ['mantel', 69, 55], ['waffe', 73, 82]];
const paperDoll = (s) => {
  const k = 1 / 8;
  const slots = DOLL_SLOTS.map(([slot, x, y]) => {
    const id = slot === 'waffe' ? s.weapon : s.gear?.[slot];
    const it = id && s.itemCount(id) ? s.item(id) : null;
    const tip = it ? `${it.name}${(it.boons ?? []).map((b) => ` · ${b.text}`).join('')}${it.atk ? ` · Angriff ${it.atk}` : ''}` : `${GEAR_SLOT_NAMES[slot]}: leer`;
    const inner = it ? `<img src="${itemIcon32Url(id) ?? itemIconUrl(id)}" alt="">` : '';
    const attr = it && slot !== 'waffe' ? ` data-takeoff="${slot}"` : '';
    return `<button class="dollslot${it ? ' filled' : ''}"${attr} title="${esc(tip)}" style="left:${x * k}em;top:${y * k}em;width:${20 * k}em;height:${20 * k}em">${inner}</button>`;
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
const skillIcon = (id) => { const ic = skillIconOf(id); return ic ? atlasIcon(ic[0], ic[1], 7) : ''; };
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
const wantedImg = (id, caught) => (id ? `<div class="wanted ${caught ? 'caught' : ''}" style="background-image:url('${wantedUrl(id)}')"></div>` : '');
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
const TAB_ICONS = { quests: 'ausruf', items: 'schluessel', pfad: 'auge', personen: 'sprechen', bestiar: 'spuren', archiv: 'notebook' };
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
  return `<div class="carry ${heavy ? 'heavy' : ''}"><span>Last</span><div class="bar"><div class="cfill" style="width:${Math.min(100, (w / cap) * 100)}%"></div></div>
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
            <div class="p2name"><img class="p2head" alt="" width="12" height="12">Spieler 2 <span class="muted p2weapon"></span></div>
            <div class="meter life"><span>Leben</span><div class="bar"><div class="p2hp"></div></div><em class="p2hpnum"></em></div>
            <div class="meter"><span>Nerven</span><div class="bar"><div class="p2nv"></div></div></div>
            <div class="p2path hidden"></div>
            <div class="p2load hidden"></div>
          </div>
        </div>
        <div class="vision-tag">Geistsicht</div>
      </div>
      <button class="prompt hidden"></button>
      <div class="toasts"></div>
      <div class="layer"></div>
      <div class="floats"></div>`;
    this.$ = (sel) => root.querySelector(sel);
    this.layer = this.$('.layer');

    state.on('composure', (v) => this.updateComposure(v));
    state.on('vision', (on) => root.classList.toggle('vision', on));
    state.on('notice', (t) => this.toast(t, 'warn'));
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
      if (acc < (kind === 'vision' ? 5 : 1) && state.pathway.digestion < 100) return;
      this.digestAcc[key] = 0;
      if (this.modal === 'combat') return;
      this.toast(`${player === 2 ? 'Spieler 2: ' : ''}+${Math.round(acc)} % verdaut: ${DIGEST_LABELS[kind] ?? kind}`, 'digest');
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
    state.on('lostcontrol', ({ text, player = 1 }) => {
      this.updateHp();
      this.updateUnruhe();
      this.updateP2();
      if (this.modal === 'combat') return;
      const title = player === 2 ? 'Kontrollverlust: Spieler 2' : 'Kontrollverlust';
      if (this.modal) { this.pendingLost = { title, text }; return; }
      this.showMessage(title, text);
    });
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
    const t = s.tracked ? questTarget(s, s.tracked) : leadTarget(s, s.openLeads()[0]);
    el.classList.toggle('hidden', !t);
    if (t) el.innerHTML = `<span class="arrow">➤</span> ${esc(this.goalText(t))}<span class="gstep">${esc(t.lead ? `Neue Spur: ${s.quest(t.quest).title}` : t.step)}</span>`;
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

  /** Kapitel 2: Fahndungsstufe im HUD, nur in Wexmoor. */
  updateWanted() {
    const el = this.$('.fahndung');
    const s = this.state;
    const r = s.policeRules?.();
    const show = !!r && s.content.maps[s.map]?.city === 'wexmoor';
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
      this.$('.dnum').textContent = `${d} %`;
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
    const path = this.$('.p2path');
    path.classList.toggle('hidden', !v.pathway && v.unruhe <= 0);
    if (v.pathway) path.innerHTML = `<span style="color:${v.pathway.color}">Seq ${v.pathway.seq} ${esc(v.pathway.seqName)}</span> · ${Math.floor(v.pathway.digestion)} % · <span class="${v.unruhe >= 60 ? 'curse' : ''}">Unruhe ${Math.round(v.unruhe)}</span>`;
    else if (v.unruhe > 0) path.innerHTML = `<span class="${v.unruhe >= 60 ? 'curse' : ''}">Unruhe ${Math.round(v.unruhe)}</span>`;
    const load = this.$('.p2load');
    load.classList.toggle('hidden', !v.overloaded);
    if (v.overloaded) load.textContent = `Überladen · ${v.carry}`;
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

  open(kind, html, cls = '') {
    this.modal = kind;
    this.layer.classList.remove('has-titlescene');
    this.layer.onpointermove = null;
    this.layer.innerHTML = `<div class="panel ${cls}">${html}</div>`;
    this.setPrompt(null);
    return this.layer.firstElementChild;
  }

  close() {
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
      this.layer.querySelector('.panel.message')?.classList.add('chapterbook');
    } else if (this.pendingChapter) {
      // Kapitelende (z. B. Fall 9): eigene Tafel nach dem Schlussbild
      const ch = this.pendingChapter;
      this.pendingChapter = null;
      // Paket AE: Kapitelkarte (Ende von Kapitel 1 kündigt Kapitel 2 an, sonst die Schlusskarte)
      const card = ch.scene ?? (/Kapitel 1\b/.test(ch.title) ? 'kapitel2_karte' : /Kapitel 2\b/.test(ch.title) ? 'kapitel3_karte' : 'kapitel_ende');
      this.showMessage(ch.title, ch.text, { footer: ch.footer ?? '', scene: card });
      this.layer.querySelector('.panel.message')?.classList.add('chapterbook'); // Grundpaket: aufgeschlagenes Notizbuch (07_02)
    } else if (this.pendingLost) {
      const { title, text } = this.pendingLost;
      this.pendingLost = null;
      this.showMessage(title, text);
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
        <div>Kampf: tippen für den Takt · Knöpfe für Ausweichen und Parieren</div>
      </div>
      <div class="controls no-touch">
        <div><span class="key">WASD</span> / <span class="key">Pfeile</span> laufen · oder hinklicken</div>
        <div><span class="key">E</span> untersuchen / sprechen</div>
        <div><span class="key">Q</span> Geistsicht (kostet Nerven)</div>
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
    this.showNode(this.state.pick(tree.start));
  }

  showNode(nodeId) {
    const s = this.state;
    const { npc, tree } = this.dialogue;
    const node = tree.nodes[nodeId];
    if (!node) throw new Error(`Dialogknoten fehlt: ${npc.dialogue}.${nodeId}`);
    this.as(() => s.applyEffects(node, { nodeKey: `${npc.dialogue}.${nodeId}` }));
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
    if (node.hint) {
      const h = s.nextHint();
      text += h ? `\n\n„${h.quest}: ${h.text}.“` : '\n\n„Im Moment liegt nichts an. Genießen Sie die Ruhe.“';
    }
    // Sichtbare Optionen + wegen Ansehen gesperrte Optionen (ausgegraut mit Hinweis)
    const choices = [];
    for (const c of node.choices ?? []) {
      if (s.meets(c)) choices.push({ ...c });
      else if (c.requires_honor !== undefined && s.honor < c.requires_honor && s.meets({ ...c, requires_honor: undefined })) {
        choices.push({ ...c, locked: `Rang ${s.rank(c.requires_honor).name} (Ansehen ${c.requires_honor}) nötig` });
      }
    }
    // Beziehung: Geschenke im Menü einer Figur (Start- oder Hub-Knoten), vor der letzten Option
    const menu = nodeId === (tree.nodes.start ? 'start' : tree.start && tree.nodes[tree.start] ? tree.start : 'hub');
    if (menu && npc.id && !npc.item && s.content.npcs[npc.id] && !node.ending && !node.combat && (node.choices ?? []).length) {
      choices.splice(Math.max(0, choices.length - 1), 0, { text: 'Etwas schenken …', gift: true });
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
        : `<li><button data-i="${i}"><span class="key">${++n}</span> ${choiceRisk(c.text) ? riskIcon(choiceRisk(c.text), RISK_TITLES[choiceRisk(c.text)]) : ''}${esc(c.text)}</button></li>`)).join('')}</ol>`, `dialogue${face ? ' with-portrait' : ''}`);
    this.dialogue.keyMap = choices.map((c, i) => (c.locked ? null : i)).filter((i) => i !== null);
    el.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => this.choose(Number(b.dataset.i)); });
  }

  choose(i) {
    const choice = this.dialogue?.choices[i];
    if (!choice || choice.locked) return;
    if (choice.gift) { this.openGift(); return; }
    if (choice.shop || choice.vault || choice.expert || choice.auction) {
      const { onClose } = this.dialogue;
      this.dialogue = null;
      onClose?.();
      if (choice.auction) this.openAuction(choice.auction);
      else if (choice.shop) this.openShop(choice.shop);
      else if (choice.vault) this.openVault();
      else this.openExpert();
      return;
    }
    const next = this.state.pick(choice.next);
    if (next) { this.showNode(next); return; }
    const { onClose, combat } = this.dialogue;
    this.dialogue = null;
    this.close();
    onClose?.({ combat: !!combat });
  }

  /** Beziehung: etwas aus der eigenen Tasche verschenken; danach zurück ins Gespräch. */
  openGift(feedback = '') {
    const s = this.state;
    const { npc } = this.dialogue;
    const items = this.as(() => s.giftOptions());
    const who = s.hasP2() ? ` <span class="muted">aus der Tasche von Spieler ${this.actor}</span>` : '';
    const el = this.open('gift', `${portrait(npc.id, relationMood(s, npc.id))}
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span>${relationBadge(s, npc.id)}</div>
      <h3>Etwas schenken${who}</h3>
      ${feedback ? `<div class="feedback">${esc(feedback)}</div>` : ''}
      <ul class="choices giftlist">${items.map((it, i) => `<li><button data-gift="${it.id}">${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${itemIcon(it.id)}${esc(it.name)} <span class="muted">×${it.count}</span></button></li>`).join('') || '<li class="empty">Du hast nichts, was du verschenken könntest.</li>'}</ul>
      <div class="actions"><button data-act="back">Zurück <span class="key">Esc</span></button></div>`, `dialogue with-portrait gift`);
    this.giftIds = items.map((it) => it.id);
    el.querySelectorAll('[data-gift]').forEach((b) => { b.onclick = () => this.giveGift(b.dataset.gift); });
    el.querySelector('[data-act=back]').onclick = () => this.closeGift();
  }

  giveGift(itemId) {
    const r = this.as(() => this.state.giveGift(this.dialogue.npc.id, itemId));
    this.openGift(r.text);
  }

  /** Zurück ins Menü der Figur (ohne neue Begrüßung). */
  closeGift() {
    this.showNode(this.dialogue.menuNode);
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
    const goal = s.tracked ? questTarget(s, s.tracked) : leadTarget(s, s.openLeads()[0]);
    const goalMap = goal?.district ?? null;
    const meetMap = s.gatheringTarget?.()?.district ?? null;
    const pin = (map, cls, inner, attrs = '') => {
      if (map === meetMap) { cls += ' goal meet'; inner += `${questUi('qpin', QUEST_PINS.amber)}<span class="goaltag">Treffen</span>`; }
      else if (map === goalMap) { cls += ' goal'; inner += `${questUi('qpin', QUEST_PINS.amber)}<span class="goaltag">Ziel</span>`; }
      const [x, y] = pins[map];
      const [url, cell = 0, cols = 13, live = false, grid = null] = mapMarkerOf(map);
      const col = cell % cols;
      const size = grid ? `${cols * 2}em ${grid.rows * 2}em;--r:${grid.row}` : `${cols * 2}em ${live ? 8 : 4}em`;
      return `<button class="pin ${cls}${live ? ' live' : ''}" ${attrs} style="left:${x / 8}em;top:${y / 8}em">
        <span class="mk${grid ? ' one' : ''}" style="--c:${col};background-image:url(${url});background-size:${size}"></span>${inner}</button>`;
    };
    const here = pins[current] ? pin(current, 'here', `<span class="youmark" style="background-image:url(${TRAVEL_MARKER_URL})"></span><span class="tag">Du bist hier</span>`, 'disabled') : '';
    const destPins = dests.map((d, i) => (pins[d.map] ? pin(d.map, '', `<span class="num">${i + 1}</span><span class="tag">${esc(d.name)}</span>`, `data-i="${i}"`) : '')).join('');
    // Ziel liegt in einem noch gesperrten Viertel: trotzdem zeigen, damit man weiß, wo es ist und wie man hinkommt.
    const lockedPin = goal?.locked && pins[goalMap] && !dests.some((d) => d.map === goalMap) && goalMap !== current
      ? pin(goalMap, 'locked', `<span class="tag">${esc(goal.locked.name)} (gesperrt)</span>`, 'disabled') : '';
    const unpinned = dests.map((d, i) => (pins[d.map] ? '' : `<button data-i="${i}"><span class="key">${i + 1}</span> ${esc(d.name)}</button>`)).join('');
    const el = this.open('travel', `
      <div class="map${rules.map_image ? '' : ' plain'}"${rules.map_image ? ` style="background-image:url(${SPRITE_BASE}${rules.map_image})"` : ''}>
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
        <span class="muted">${esc(fast.desc)}</span><span class="cost">${hurry ? `−${fast.nerves_cost} Nerven · Monster · Beute` : s.isOverloaded() ? `Zu schwer beladen (${s.carryText()})` : `Zu wenig Nerven (mind. ${fast.nerves_cost})`}</span></button>`;
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
    const go = () => this.scene.travelTo(d.map, d.spawn);
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
    const footer = ev.lostMoney ? `−${ev.lostMoney} Schilling` : '';
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
    const fixed = ['quests', 'items', 'pfad', 'personen', 'bestiar', 'zeitung', 'archiv'];
    if (this.tab === 'zeitung' && !papers.length) this.tab = 'quests';
    if (this.tab === 'archiv' && !solved.length) this.tab = 'quests';
    if (this.tab === 'bestiar' && !beasts.length) this.tab = 'quests';
    // Ein gelöster Fall wird im Archiv geöffnet
    if (solved.some((c) => c.id === this.tab)) { this.archiveCase = this.tab; this.tab = 'archiv'; }
    if (!fixed.includes(this.tab) && !cases.some((c) => c.id === this.tab)) this.tab = 'quests';
    if (this.tab === 'archiv' && !solved.some((c) => c.id === this.archiveCase)) this.archiveCase = solved.at(-1)?.id;
    const tabs = [{ id: 'quests', title: 'Aufträge' }, { id: 'items', title: 'Inventar' }, { id: 'pfad', title: 'Pfad' }, { id: 'personen', title: 'Personen' },
      ...(beasts.length ? [{ id: 'bestiar', title: 'Bestiarium' }] : []),
      ...(papers.length ? [{ id: 'zeitung', title: 'Zeitung' }] : []),
      ...cases.map((c) => ({ id: c.id, title: c.title.replace(/:.*/, '') })), ...(solved.length ? [{ id: 'archiv', title: `Archiv (${solved.length})` }] : [])];
    const caseId = this.currentCase();
    const body = this.tab === 'quests' ? this.questsHtml() : this.tab === 'items' ? this.itemsHtml() : this.tab === 'pfad' ? this.pathwayTabHtml()
      : this.tab === 'personen' ? this.peopleHtml() : this.tab === 'bestiar' ? this.bestiaryHtml(beasts) : this.tab === 'zeitung' ? this.papersHtml(papers)
      : this.tab === 'archiv' ? this.archiveHtml(solved) : this.caseHtml(this.tab);
    const isCase = !!caseId;
    const hint = String(feedback ?? '').startsWith('<div class="hint">') ? feedback : '';
    const el = this.open('notebook', `
      <div class="tabs">${tabs.map((t, i) => `<button class="tab ${t.id === this.tab ? 'sel' : ''}" data-tab="${t.id}"><span class="key">${i + 1}</span> ${uiSprite('icons', TAB_ICONS[t.id] ?? 'lupe', 1 / 16, 'tabico')}${esc(t.title)}</button>`).join('')}
        <span class="rankinfo">${uiSprite('ranks', `r${Math.max(0, Math.min(4, this.state.content.ranks.indexOf(this.state.rank())))}`, 1 / 16, 'rankbadge')}${esc(this.state.rank().name)} · Ansehen ${this.state.honor}</span></div>
      ${hint ? `<div class="feedback hintbox">${hint}</div>` : ''}
      ${body}
      <div class="feedback">${hint ? '' : feedback}</div>
      <div class="actions">
        ${isCase ? `<button data-act="hint" title="Jeder Klick verrät etwas mehr">Tipp${this.hintStage(caseId) ? ` ${this.hintStage(caseId)}/3` : ''} <span class="key">T</span></button>` : ''}
        ${isCase ? `<button class="primary" data-act="combine" ${this.selected.length === 2 ? '' : 'disabled'}>Verknüpfen <span class="key">V</span></button>` : ''}
        <button data-act="close">Schließen <span class="key">J</span></button>
      </div>`, 'notebook');
    this.notebookTabs = tabs;
    el.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { this.tab = b.dataset.tab; this.selected = []; this.renderNotebook(''); }; });
    el.querySelectorAll('[data-itemcat]').forEach((b) => { b.onclick = () => { this.itemCat = b.dataset.itemcat; this.renderNotebook(''); }; });
    el.querySelectorAll('[data-fact]').forEach((b) => { b.onclick = () => this.toggleFact(b.dataset.fact); });
    el.querySelectorAll('[data-archive]').forEach((b) => { b.onclick = () => { this.archiveCase = b.dataset.archive; this.selected = []; this.renderNotebook(''); }; });
    el.querySelector('[data-act=combine]')?.addEventListener('click', () => this.combine());
    el.querySelector('[data-act=hint]')?.addEventListener('click', () => this.showHint());
    const inv = (fn) => this.as(fn, this.tab === 'items' || this.tab === 'pfad' ? this.invPlayer : 1);
    el.querySelectorAll('[data-use]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(inv(() => this.state.useItem(b.dataset.use)) ?? '')); });
    el.querySelectorAll('[data-equip]').forEach((b) => { b.onclick = () => { inv(() => this.state.equip(b.dataset.equip)); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-wear]').forEach((b) => { b.onclick = () => { inv(() => this.state.wear(b.dataset.wear)); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-takeoff]').forEach((b) => { b.onclick = () => { inv(() => this.state.takeOff(b.dataset.takeoff)); this.renderNotebook(''); }; });
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
    el.querySelector('[data-ritual]')?.addEventListener('click', () => {
      const who = this.state.hasP2() ? this.invPlayer : 1;
      const r = inv(() => this.state.performRitual());
      if (r.ok) {
        const pid = inv(() => this.state.pathway?.id);
        this.close();
        const card = ritualCardUrl(pid);
        this.showMessage(who === 2 ? 'Ritual: Spieler 2' : 'Ritual', r.text, { aside: card ? `<img class="ritualcard" src="${card}" alt="" onerror="this.remove()">` : '' });
        this.scene?.playRitual?.(pid, who);
      } else this.renderNotebook(esc(r.text));
    });
    el.querySelectorAll('[data-inspect]').forEach((b) => { b.onclick = () => this.inspectItem(b.dataset.inspect); });
    el.querySelectorAll('[data-track]').forEach((b) => { b.onclick = () => { const id = b.dataset.track; this.state.track(this.state.tracked === id ? null : id); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-recipe]').forEach((b) => { b.onclick = () => { this.tab = 'pfad'; this.renderNotebook(''); }; });
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
    const ids = Object.keys(s.quests);
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
      const goal = active ? `<div class="qgoal">➤ ${t ? esc(this.goalText(t)) : 'Kein fester Ort bekannt'}</div>` : '';
      return `<li class="quest ${st} ${tracked ? 'tracked' : ''}" ${active ? `data-track="${id}"` : ''}><div class="qtitle">${uiSprite('qstatus', !active ? 'q1' : tracked ? 'q6' : q.kind === 'main' ? 'q5' : 'q2', 1 / 12, 'qico')}<span class="qkind">${q.kind === 'main' ? 'Hauptfall' : 'Nebenauftrag'}</span> ${esc(q.title)} ${!active ? '<span class="badge likely">erledigt</span>' : ''}${tracked ? '<span class="badge track">verfolgt</span>' : ''}</div>
        ${active ? `<div class="qsum">${q.wanted ? wantedImg(q.wanted, false) : ''}${esc(q.summary)}</div>` : ''}${steps}${goal}</li>`;
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
    return `<p class="hintline">Klicke auf einen Auftrag, um ihn zu verfolgen. Ein Pfeil zeigt dir dann den Weg.</p>
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
    if (!s.hasP2()) { this.invPlayer = 1; return this.pathwayHtml(); }
    return this.playerTabsHtml() + s.withPlayer(this.invPlayer, () => this.pathwayHtml(), { quiet: true });
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
      if (it.kind === 'weapon') action = s.weapon === it.id ? '<span class="badge likely">ausgerüstet</span>' : `<button class="small" data-equip="${it.id}">Ausrüsten</button>`;
      else if (it.kind === 'gear') action = s.isWorn(it.id) ? `<span class="badge likely">angelegt</span><br><button class="small" data-takeoff="${it.slot}">Ablegen</button>` : `<button class="small" data-wear="${it.id}">Anlegen</button>`;
      else if (it.kind === 'consumable' && !it.combat_only) action = `<button class="small" data-use="${it.id}">Benutzen</button>`;
      else if (it.combat_only) action = '<span class="muted">nur im Kampf</span>';
      else if (it.kind === 'potion') {
        const chk = s.drinkCheck(it.id);
        action = chk.ok ? `<button class="small" data-drink="${it.id}">Trinken</button><br><span class="muted">Risiko ${Math.round(chk.risk * 100)} %</span>` : chk.ritual ? '<button class="small" data-recipe="1">Ritual nötig</button>' : '<span class="muted">nicht trinkbar</span>';
      } else if (it.kind === 'formula') action = '<button class="small" data-recipe="1">Rezept</button>';
      else if (it.kind === 'artifact') {
        action = '<span class="badge likely">wirkt</span>';
        if (s.borrowed.includes(it.id)) action += '<br><span class="muted">vom Revier geliehen</span>';
      } else if (it.kind === 'ingredient') action = '<span class="muted">Zutat</span>';
      else if (it.kind === 'trophy') action = `<span class="muted rar-${itemRarity(it)}">Beutestück · ${RARITY_NAMES[itemRarity(it)]}</span>`;
      if (!action && it.inspect) action = `<button class="small" data-inspect="${it.id}">Untersuchen</button>`;
      const wt = s.itemWeight(it.id);
      if (wt > 0) action += `${action ? '<br>' : ''}<span class="muted weight">${fmtLb(wt * it.count)} Pfd.</span>`;
      if (p2 && it.kind !== 'key') action += ` <button class="small give" data-give="${it.id}" title="Eins an Spieler ${other} geben">→ Sp. ${other}</button>`;
      if (s.canDrop(it.id) && !(it.kind === 'weapon' && s.weapon === it.id)) action += ` <button class="small drop" data-drop="${it.id}" title="Wegwerfen (eins)">×</button>`;
      const stat = it.kind === 'weapon' ? ` <span class="muted">Angriff ${it.atk}${it.occult ? ', stark gegen Okkultes' : ''}</span>`
        : it.kind === 'gear' ? ` <span class="muted">${GEAR_SLOT_NAMES[it.slot]}</span>` : '';
      const effects = it.kind === 'artifact' || it.kind === 'gear' ? artifactEffectsHtml(it) : '';
      return `<li class="item"><div>${it.kind === 'potion' || it.kind === 'formula' ? itemIconBig(it.id) : itemIcon(it.id)}<strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}${stat}<br><span class="desc">${esc(it.desc)}</span>${effects}</div><div>${action}</div></li>`;
    }).join('');
    const carried = s.activeArtifacts();
    const maxArt = s.artifactRules().max_active ?? 3;
    const arts = carried.length
      ? `<div class="status"><span class="artslots">${artifactSlots(carried, maxArt, carried.length > maxArt || s.unruhe >= 60)}</span>Artefakte dabei <strong>${carried.length}</strong>${s.artifactUnruhe() ? ` · <span class="curse">Unruhe +${Math.round(s.artifactUnruhe() * 10) / 10} pro Sekunde</span>` : ''} · Alles, was du bei dir trägst, wirkt: Vorteile wie Flüche. Was du nicht brauchst, lagere im Büro ein.${carried.length > maxArt ? ` <span class="curse">Mehr als ${maxArt} zerren heftig aneinander.</span>` : ''}</div>` : '';
    return `
      ${carryHtml(s)}
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
    // Tipp ab Stufe 2: schwache Information markieren, ab Stufe 3 beide des Paares
    const hinted = new Set();
    const stage = this.hintStage(caseId);
    const target = stage >= 2 ? nextDeduction(s, caseId) : null;
    if (target) {
      const weak = Math.max(0, target.status.findIndex((x) => x !== 'likely'));
      target.pair.forEach((f, i) => { if (stage >= 3 || i === weak) hinted.add(f); });
    }
    const factItems = facts.map((f) => {
      const st = s.factStatus(f);
      const n = s.factSources(f).length;
      return `<li><button class="fact ${st} ${this.selected.includes(f) ? 'sel' : ''} ${hinted.has(f) ? 'hinted' : ''}" data-fact="${f}" ${st === 'refuted' ? 'data-refuted="1"' : ''}>
        ${this.badge(st)} ${linkable.has(f) ? `${journalMark('string_pin', 'Lässt sich verknüpfen')} ` : ''}${esc(s.fact(f).text)} <span class="src">${n}×</span>${s.fact(f).case !== caseId ? `<span class="cross">Spur aus ${esc(s.content.cases.find((c) => c.id === s.fact(f).case)?.title.split(':')[0] ?? 'einem anderen Fall')}</span>` : ''}</button></li>`;
    }).join('');
    const ded = s.content.deductions.filter((d) => d.case === caseId && s.hasConclusion(d.id));
    const concl = ded.map((d) => `<li><strong>${esc(d.name)}</strong> ${s.isCertain(d.id) ? '<span class="badge likely">gesichert</span>' : '<span class="badge suspected">Vermutung</span>'}<br>${esc(d.text)}</li>`).join('');
    const total = s.content.deductions.filter((d) => d.case === caseId && d.honor !== 0).length;
    const detailId = this.selected[this.selected.length - 1];
    const detail = detailId
      ? `<strong>Quellen:</strong>${s.factStatus(detailId) === 'refuted' ? journalMark('contradicts', 'Widerlegt') : s.factSources(detailId).length > 1 ? journalMark('same_source', 'Mehrere Quellen bestätigen das') : ''}
        <ul class="sources">${s.factSources(detailId).map((c) => `<li>${sourceFace(s.content, s.clue(c), s.factStatus(detailId) === 'refuted')}<div><em>${esc(s.clue(c).source)}:</em> ${esc(s.clue(c).text)}</div></li>`).join('')}</ul>`
      : 'Klicke eine Information an, um ihre Quellen zu sehen. Ab zwei Quellen gilt sie als sehr wahrscheinlich. Wähle zwei Informationen und verknüpfe sie.';
    return `
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

  peopleHtml() {
    const people = knownPeople(this.state);
    if (!people.length) return `${this.factionsHtml()}<p class="empty">Du hast noch mit niemandem gesprochen.</p>`;
    return `${this.factionsHtml()}<ul class="people">${people.map((p) => {
      const face = headFace(p.id, esc(p.name));
      return `<li class="${p.quests.length ? 'busy' : ''}">${face}<div><strong>${esc(p.name)}</strong> <span class="muted">${esc(p.role)}</span> ${relationBadge(this.state, p.id, this.state.mood(p.id) !== 'neutral')}
        <br><span class="where">${esc(p.places.join(', ') || 'unterwegs')}</span>${p.quests.map((q) => `<br><span class="qtag">${esc(q)}</span>`).join('')}</div></li>`;
    }).join('')}</ul>`;
  }

  /** Aktuelle Tipp-Stufe eines Falls (0 = noch kein Tipp). Ändert sich das Ziel, beginnt es von vorn. */
  hintStage(caseId) {
    const h = this.hints?.[caseId];
    if (!h) return 0;
    return caseHints(this.state, caseId, 1).key === h.key ? h.level : 0;
  }

  /** Gestufter Tipp: jeder Klick verrät etwas mehr über die nächste offene Schlussfolgerung. */
  showHint() {
    const caseId = this.currentCase();
    if (!caseId) return;
    this.hints ??= {};
    const level = Math.min(3, this.hintStage(caseId) + 1);
    const h = caseHints(this.state, caseId, level);
    this.hints[caseId] = { key: h.key, level };
    this.renderNotebook(`<div class="hint">${h.lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`);
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
      if (!reached) return `<li class="seq locked">${socket}<strong>Sequenz ${n}: ${esc(sd.name)}</strong> <span class="muted">noch nicht erreicht</span></li>`;
      return `<li class="seq">${socket}<strong>Sequenz ${n}: ${esc(sd.name)}</strong> ${n === cur.seq ? '<span class="badge likely">aktuell</span>' : ''}<br>
        <span class="desc">${esc(sd.desc)}</span><br>
        ⚔ <strong>${esc(sd.skill.name)}</strong> <span class="muted">(${sd.skill.cost} K)</span> ${esc(sd.skill.desc)}
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
      <p class="muted">Jede Sequenz dieses Pfades: +${s.growth().hp} Leben, +${s.growth().nerves} Nerven, die Durchbrüche 7 und 6 das Doppelte. Gerade: ${s.maxHp} Leben, ${s.maxComposure()} Nerven.</p>
      ${this.ritualHtml()}
      <h4>Was deinen Trank verdaut</h4>
      <ul class="digestlist">${s.digestTable().map((r) => `<li><span>${esc(r.label)}</span> <strong>+${r.points} %</strong></li>`).join('')}
        <li class="muted">Alles andere verdaut diesen Pfad nicht. Auf höheren Sequenzen geht es langsamer.</li></ul>
      <ul class="seqs">${rows}</ul>
      ${this.recipesHtml(false)}`;
  }

  /** Ritual für den nächsten Trank (ab Sequenz 6): Ort, Zutaten, Bedingungen, Knopf. */
  ritualHtml() {
    const s = this.state;
    if (!s.pathway) return '';
    const seq = s.pathway.seq - 1;
    const r = s.ritualDef(s.pathway.id, seq);
    if (!r) return '';
    if (s.ritualDone(s.pathway.id, seq)) return `<div class="ritual done"><h4>Ritual: ${esc(r.name)} <span class="badge likely">vollzogen</span></h4><p class="muted">Du kannst den Trank der Sequenz ${seq} trinken.</p></div>`;
    const steps = s.ritualSteps();
    const ready = steps.every((x) => x.done);
    return `<div class="ritual"><h4>Ritual für Sequenz ${seq}: ${esc(r.name)}</h4>
      <p class="desc">${esc(r.desc)}</p>
      <ul class="steps">${steps.map((x) => `<li class="${x.done ? 'done' : ''}">${x.done ? '✓' : '○'} ${esc(x.text)}</li>`).join('')}</ul>
      <button class="small ${ready ? 'primary' : ''}" data-ritual="1" ${ready ? '' : 'disabled'}>Ritual vollziehen</button> <span class="muted">Kostet 20 Nerven und bringt 20 Unruhe.</span></div>`;
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
    this.showMessage(`${who === 2 ? 'Spieler 2: ' : ''}${this.state.item(itemId).name}`, r.text);
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
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="close">Fertig <span class="key">Esc</span></button></div>`, 'notebook brew');
    el.querySelectorAll('[data-brew]').forEach((b) => { b.onclick = () => this.brew(b.dataset.brew); });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  brew(formulaId) {
    const r = this.as(() => this.state.brew(formulaId));
    this.scene?.playBrewFx?.(r.ok);
    this.openBrew(`<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
  }

  openShop(merchantId, mode = 'buy', feedback = '') {
    this.state.withPlayer(this.actor, () => this.renderShop(merchantId, mode, feedback), { quiet: true });
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
        <span class="desc">${e.locked ? uiSprite('shop', /Rang|Ansehen/.test(e.locked) ? 'locked_rank' : 'locked_pathway', 1 / 12, 'shopico') : ''}${esc(e.locked ?? e.desc)}</span>${e.locked ? '' : shopStats(s.item(e.item))}</div>
        <div>${e.owned ? `<span class="badge likely">${uiSprite('shop', 'only_once', 1 / 16, 'shopico')}${e.soldOut ? 'vergriffen' : 'gekauft'}</span>` : `${e.left ? `<span class="muted">noch ${e.left}</span> ` : ''}<button class="small pricetag" data-buy="${i}" ${this.shop.entries[i].disabled ? 'disabled' : ''}>${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${e.price} Sch.</button>`}</div></li>`).join('');
    } else {
      const sellable = s.items().filter((it) => s.sellPrice(it.id) !== null);
      this.shop.entries = sellable.map((it) => ({ id: it.id }));
      rows = sellable.map((it, i) => `<li class="item"><div><span class="shopslot">${itemIconBig(it.id)}</span><strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}<br><span class="desc">${esc(it.desc)}</span></div>
        <div><button class="small pricetag" data-sell="${i}">${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${s.sellPrice(it.id)} Sch.</button></div></li>`).join('') || `<li class="empty">Nichts, was ${esc(m.name)} haben will.</li>`;
    }
    const el = this.open('shop', `
      <h3>${esc(m.name)} <span class="muted">${esc(m.title)}</span>${s.hasP2() ? ` <button class="badge keybtn" data-key="g">für Spieler ${s.acting} · <span class="key">G</span> wechseln</button>` : ''}</h3>
      <p class="lead">„${esc(m.greeting)}“</p>
      ${m.buys ? `<div class="tabs"><button class="tab ${mode === 'buy' ? 'sel' : ''}" data-mode="buy">${uiSprite('shop', 'buy', 1 / 16, 'tabico')}Kaufen</button><button class="tab ${mode === 'sell' ? 'sel' : ''}" data-mode="sell">${uiSprite('shop', 'sell', 1 / 16, 'tabico')}Verkaufen</button> <span class="muted">Wechseln mit <span class="key">V</span></span></div>` : ''}
      <ul class="items shoplist">${rows}</ul>
      <div class="feedback">${feedback}</div>
      <div class="actions"><span class="purse">${moneyIcon(s.money)}${s.money} Schilling</span><button data-act="close">Gehen <span class="key">Esc</span></button></div>`, 'notebook shop');
    el.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => this.shopPick(Number(b.dataset.buy)); });
    el.querySelectorAll('[data-sell]').forEach((b) => { b.onclick = () => this.shopPick(Number(b.dataset.sell)); });
    el.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => this.openShop(merchantId, b.dataset.mode); });
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
    const intro = !s.isBeyonder()
      ? `Das Revier führt Tränke für drei Pfade: ${names}, und nur bis Sequenz 7. Jede Stufe gibt es einmal, sobald ein bestimmter Fall gelöst ist. Für alle anderen Pfade gehen Sie auf den Nachtmarkt.`
      : offers.length ? 'Ihr Pfad gehört zu denen, die das Revier unterstützt, bis Sequenz 7. Danach müssen Sie sich die Formeln selbst beschaffen: bei geheimen Treffen, oder mit viel Glück irgendwo da draußen. Trinken sollten Sie erst, wenn der letzte Trank verdaut ist.'
        : `Ihr Pfad gehört nicht zu denen des Reviers (${names}). Beraten kann ich Sie trotzdem, aber Tränke bekommen Sie bei Kittering auf dem Nachtmarkt.`;
    const el = this.open('vault', `
      <h3>Dr. Ilse Varga <span class="muted">Gutachterin für Okkultes</span></h3>
      <p class="lead">„${esc(intro)}“</p>
      ${s.isBeyonder() ? `<div class="lead">${paragraphs(s.pathwayReport())}</div>` : ''}
      <ul class="items shoplist">${rows || '<li class="empty">Gerade nichts für Sie.</li>'}</ul>
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="close">Gehen <span class="key">Esc</span></button></div>`, 'notebook shop');
    el.querySelectorAll('[data-vault]').forEach((b) => { b.onclick = () => this.vaultPick(Number(b.dataset.vault)); });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  shopPick(i) {
    const sh = this.shop;
    const e = sh?.entries[i];
    if (!e) return;
    const r = this.as(() => (sh.mode === 'buy' ? this.state.buy(sh.id, e.id) : this.state.sell(e.id)));
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
      + `<li class="seat you ${a.phase.startsWith('own') ? 'active' : ''}">${headFace('player', 'Du')}<span>Du</span>${leader === 'player' ? auktionIcon('bid_0', 'bidhand') : ''}</li>`;
    const acts = [];
    let stage = '';
    const who = (id) => (id === 'player' ? 'dir' : id ? esc(s.memberName(id)) : 'niemandem');
    if (a.phase === 'lot') {
      const l = a.lot;
      const it = s.item(l.item);
      const next = s.nextBid();
      stage = `${portrait(l.seller)}<div class="speaker">${esc(s.memberName(l.seller))} <span class="role">${esc(s.content.npcs[l.seller]?.role ?? '')}</span></div>
        <div class="lot">${itemIconBig(l.item)}<strong>${esc(it.name)}</strong>${s.itemCount(l.item) ? ` <span class="muted">(hast ${s.itemCount(l.item)})</span>` : ''}<br><span class="desc">${esc(it.desc ?? '')}</span></div>
        <p class="bidline">${l.leader && l.leader !== 'player' ? headFace(l.leader, s.memberName(l.leader)) : ''}Gebot: <b>${l.price} Sch.</b> · führt: ${who(l.leader)}</p>`;
      if (l.leader !== 'player') acts.push({ label: `${l.leader ? 'Überbieten' : 'Bieten'}: ${next} Sch.`, fn: () => s.bid(), off: s.money < next });
      acts.push({ label: 'Aussteigen', fn: () => s.passLot() });
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
        ${list.length ? '<p class="lead">Was legst du auf den Tisch?</p>' : '<p class="lead">Du hast keine Artefakte oder Formeln dabei, die du anbieten könntest.</p>'}`;
      for (const o of list.slice(0, 8)) acts.push({ label: `${o.name} anbieten`, fn: () => s.offerOwn(o.id), icon: o.id });
      acts.push({ label: 'Runde beenden', fn: () => this.finishAuction() });
    } else if (a.phase === 'own_bids') {
      const o = a.own;
      const it = s.item(o.item);
      stage = `<div class="speaker">Dein Los <span class="role">${esc(it.name)}</span></div>
        <div class="lot">${itemIconBig(o.item)}<strong>${esc(it.name)}</strong><br><span class="desc">${o.bids.length ? o.bids.map((b) => `${esc(s.memberName(b.member))}: ${b.price} Sch.`).join(' · ') : 'Kein Gebot.'}</span></div>`;
      if (o.bids.length) acts.push({ label: `Zuschlag an ${s.memberName(o.bids[0].member)}: ${o.bids[0].price} Sch.`, fn: () => s.acceptOwn() });
      acts.push({ label: 'Zurückziehen', fn: () => s.withdrawOwn() });
    }
    this.auctionActs = acts;
    let n = 0;
    const el = this.open('auction', `
      <h3>${emblem !== undefined ? atlasIcon(ZIRKEL_URL, emblem, 8) : S_ZIRKEL[a.circle] ? regionIcon(S_ZIRKEL_URL, S_ZIRKEL[a.circle].emblem, 128, 64, 'mark', 1 / 16) : auktionIcon(a.circle, 'mark', 1 / 6)}${esc(g.name)} <span class="muted">${a.phase.startsWith('own') ? 'Eigenes Angebot' : `Runde ${Math.min(a.turn + 1, a.members.length)} von ${a.members.length}`}</span></h3>
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
    const r = x.fn();
    if (!this.state.auction) return;
    this.renderAuction(r?.text ? esc(r.text) : '');
  }

  finishAuction() {
    const sum = this.state.endSession();
    this.close();
    if (!sum) return;
    const line = (l, verb) => l.map((x) => `${this.state.item(x.item).name} (${x.price} Sch.)`).join(', ') || 'nichts';
    this.showMessage('Die Runde löst sich auf', `Gekauft: ${line(sum.bought)}\n\nVerkauft: ${line(sum.sold)}`, { footer: 'Bis zum nächsten Treffen.' });
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
          <div>Kampf: <span class="key">E</span> Takt · <span class="key">Leertaste</span> ausweichen · <span class="key">F</span> parieren</div>
        </div>
        <div><h4>Spieler 2 · Begleiter</h4>
          <div><span class="key">Pfeile</span> laufen</div>
          <div><span class="key">Enter</span> untersuchen / sprechen / aufheben</div>
          <div><span class="key">I</span> dann <span class="key">G</span> eigenes Inventar</div>
          <div>Kampf: <span class="key">Enter</span> Takt · <span class="key">←</span> ausweichen · <span class="key">→</span> parieren</div>
          <div class="muted">Gamepad${pad ? ' (erkannt)' : ''}: Stick laufen · A Aktion/Takt · X ausweichen · B parieren · Y Inventar</div>
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
      this.openPause(`${koopGreeting('leave', s.p2Look(), wx)}<br><span class="muted">Spieler 2 behält seine Sachen für das nächste Mal.</span>`);
    } else {
      const back = !!s.p2;
      s.addP2();
      this.openPause(`${koopGreeting('join', s.p2Look(), wx)}<br><span class="muted">${back ? 'Spieler 2 ist wieder dabei, mit seinen alten Sachen.' : 'Spieler 2 ist dabei: Spazierstock und zwei Verbände in der Tasche.'}</span>`);
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
      c.confused ? `<span class="badge suspected">${statusIcon('verwirrt')}verwirrt</span>` : '',
      c.enemyGuard ? `<span class="badge refuted">${statusIcon('eisenhaut')}Panzer ${c.enemyGuard}</span>` : '',
      c.veiled ? `<span class="badge refuted">${statusIcon('schatten')}verschleiert</span>` : '',
      c.enc.faction ? `<span class="badge"><span class="emblem16" style="background-image:url(${factionEmblemUrl(c.enc.faction)})"></span>${c.state.content.factions?.[c.enc.faction]?.name ?? ''}</span>` : ''].join(' ');
    // Ein Feld pro Spieler; zu zweit leuchtet, wer am Zug ist bzw. angegriffen wird
    const focus = sc.phase === 'enemy' ? c.target : c.actor;
    for (const [n, f] of Object.entries(c.fighters)) {
      const box = this.layer.querySelector(`.cb-player[data-p="${n}"]`);
      if (!box) continue;
      const v = s.playerView(Number(n));
      const b = (sel) => box.querySelector(sel);
      box.classList.toggle('active', c.duo && Number(n) === focus && !f.down);
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
      b('.pips').innerHTML = Array.from({ length: 6 }, (_, i) => uiSprite('hud', i >= f.ap ? 'conc_empty' : f.ap >= 6 ? 'conc_glow' : 'conc_full', 1 / 6, 'pip')).join('');
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

  combatMessage(text, help = '') {
    const el = this.layer.querySelector('.cb-text');
    if (!el) return;
    if (this.touch) {
      const t = (x) => x.replace('Weiter mit E', 'Weiter: irgendwo tippen')
        .replace('Drücke E oder Leertaste', 'Tippe irgendwo auf den Bildschirm')
        .replace('Leertaste: ausweichen', 'Knopf Ausweichen').replace('F: parieren', 'Knopf Parieren');
      text = t(text);
      help = t(help);
    }
    el.innerHTML = paragraphs(text);
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
      const items = mine(() => this.state.items().filter((i) => i.kind === 'consumable').length);
      entries = [
        { text: 'Angriff', ui: 'attack', info: '+1 K · beendet den Zug', act: { type: 'skill', id: 'attack' } },
        { text: 'Fertigkeiten', ui: 'skill', info: `${c.ap} K`, sub: 'skills' },
        { text: 'Gegenstände', ui: 'item', info: c.canUseItem() ? `${items}` : 'schon benutzt', sub: 'items', disabled: !c.canUseItem() },
        { text: 'Fliehen', ui: 'flee', info: c.canFlee() ? '' : 'unmöglich', act: { type: 'flee' }, disabled: !c.canFlee() },
      ];
      if (c.actions) entries.push({ text: 'Zug beenden', ui: 'defend', info: '', act: { type: 'end' } });
      else this.combatTurn('player');
      this.layer.querySelector('.cb-text').innerHTML = c.actions
        ? `<p>${esc(c.log.at(-1) ?? '')}.</p><p>Runde ${c.round}: ${c.duo ? `Spieler ${c.actor} ist` : 'Du bist'} noch am Zug (${c.ap} Konzentration). Fertigkeiten kosten Konzentration, ein Gegenstand pro Zug.</p>`
        : `<p>Runde ${c.round}. ${turn}Was tust du? Solange die Konzentration reicht, kannst du mehrere Fertigkeiten nacheinander einsetzen.</p>`;
      this.layer.querySelector('.cb-help').textContent = '';
    } else if (sub === 'skills') {
      entries = c.skills().filter((k) => k.id !== 'attack').map((k) => ({
        text: `${k.pathway && !skillIconOf(k.id) ? '✧ ' : ''}${k.name}`, skill: k.id, info: `${k.cost} K${k.composure ? ` · ${k.composure} Nerven` : ''}`, desc: k.desc, act: { type: 'skill', id: k.id }, disabled: !k.usable,
      }));
    } else {
      entries = mine(() => this.state.items()).filter((i) => i.kind === 'consumable').map((i) => ({ text: `${i.name} ×${i.count}`, icon: i.id, desc: i.desc, act: { type: 'item', id: i.id } }));
      if (!entries.length) entries = [{ text: 'Keine Gegenstände', disabled: true }];
    }
    if (sub !== 'main') entries.push({ text: 'Zurück', back: true });
    this.combatMenuOpen = { sub, entries };
    this.layer.querySelector('.cb-target')?.classList.remove('hidden');
    const menu = this.layer.querySelector('.cb-menu');
    menu.innerHTML = `<ol class="choices">${entries.map((e, i) => `<li><button data-i="${i}" ${e.disabled ? 'disabled' : ''} title="${esc(e.desc ?? '')}">
      <span class="key">${e.back ? 'Esc' : i + 1}</span> ${e.ui ? uiSprite('bmenu', e.disabled ? `${e.ui}_off` : e.ui, 1 / 16 * 1.4, 'cbicon') : ''}${e.icon ? itemIcon(e.icon) : ''}${e.skill ? skillIcon(e.skill) : ''}${esc(e.text)} <span class="muted">${esc(e.info ?? '')}</span></button></li>`).join('')}</ol>
      <div class="cb-desc"></div>`;
    menu.querySelectorAll('[data-i]').forEach((b) => {
      b.onclick = () => this.combatPick(Number(b.dataset.i));
      b.onmouseenter = () => { menu.querySelector('.cb-desc').textContent = entries[Number(b.dataset.i)].desc ?? ''; };
    });
  }

  combatPick(i) {
    const m = this.combatMenuOpen;
    const e = m?.entries[i];
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
    el.innerHTML = `${uiSprite('hud', who === 'enemy' ? 'enemy_turn' : 'your_turn', 1 / 10)}<span>${who === 'enemy' ? 'Gegner am Zug' : this.combatScene?.combat?.duo ? `Spieler ${this.combatScene.combat.actor} am Zug` : 'Du bist am Zug'}</span>`;
    el.classList.toggle('enemy', who === 'enemy');
    el.classList.remove('show');
    void el.offsetWidth; // Animation neu starten
    el.classList.add('show');
  }

  combatOver(title) {
    const c = this.combatScene.combat;
    const text = { won: `${c.enemy.name} ist besiegt.`, lost: 'Deine Beine geben nach.', fled: 'Du bringst dich in Sicherheit.' }[c.outcome];
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
    const title = { won: 'Sieg', lost: 'Ohnmacht', fled: 'Rückzug' }[result.outcome];
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
    const img = endingImageUrl(id, end.case);
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
    else if (this.modal === 'dialogue' && confirm && this.dialogue?.keyMap.length === 1) this.choose(this.dialogue.keyMap[0]);
    else if (this.modal === 'travel' && this.travelPick && (num === 0 || num === 1)) this.travelMode(num === 0 ? 'sicher' : 'schnell');
    else if (this.modal === 'travel' && !this.travelPick && num >= 0) this.travel(num);
    else if (this.modal === 'travel' && k === 'escape') { if (this.travelPick) this.openTravel(this.travelFrom); else this.close(); }
    else if (this.modal === 'notebook' && (k === 'j' || k === 'i' || k === 'p' || k === 'tab' || k === 'escape')) this.close();
    else if (this.modal === 'shop' && num >= 0) this.shopPick(num);
    else if (this.modal === 'auction' && num >= 0) this.auctionPick(num);
    else if (this.modal === 'auction' && k === 'escape') this.finishAuction();
    else if (this.modal === 'shop' && k === 'v' && this.state.merchant(this.shop.id).buys) this.openShop(this.shop.id, this.shop.mode === 'buy' ? 'sell' : 'buy');
    else if ((this.modal === 'shop' || this.modal === 'brew' || this.modal === 'storage' || this.modal === 'vault') && (k === 'escape' || k === 'e')) this.close();
    else if (this.modal === 'vault' && num >= 0) this.vaultPick(num);
    else if (this.modal === 'brew' && num >= 0 && this.brewList?.[num]) this.brew(this.brewList[num].formula);
    else if ((this.modal === 'shop' || this.modal === 'storage') && k === 'g' && this.state.hasP2()) {
      this.actor = this.actor === 1 ? 2 : 1;
      if (this.modal === 'shop') this.openShop(this.shop.id, this.shop.mode); else this.openStorage('', ...this.storageArgs);
    } else if (this.modal === 'notebook' && k === 'g' && (this.tab === 'items' || this.tab === 'pfad') && this.state.hasP2()) { this.invPlayer = this.invPlayer === 1 ? 2 : 1; this.renderNotebook(''); }
    else if (this.modal === 'notebook' && k === 'v') this.combine();
    else if (this.modal === 'notebook' && k === 't') this.showHint();
    else if (this.modal === 'notebook' && this.tab === 'items' && (k === 'arrowleft' || k === 'arrowright') && this.itemCats?.length) {
      const i = this.itemCats.findIndex((c) => c.id === this.itemCat);
      const n = this.itemCats.length;
      this.itemCat = this.itemCats[(i + (k === 'arrowright' ? 1 : n - 1)) % n].id;
      this.renderNotebook('');
    } else if (this.modal === 'notebook' && num >= 0 && this.notebookTabs[num]) { this.tab = this.notebookTabs[num].id; this.selected = []; this.renderNotebook(''); }
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
