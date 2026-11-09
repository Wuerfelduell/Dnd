import { DIGEST_LABELS } from '../core/Pathways.js';
import { lootList, itemRarity, RARITY_NAMES } from '../core/Loot.js';
import {
  itemIconUrl, itemIcon32Url, pathwayEmblemUrl, pathwayCardUrl, COIN_URL, SKILL_ICONS, SKILL_ICONS_URL, STATUS_ICONS, STATUS_ICONS_URL,
  portraitUrl, portraitFor, mapMarkerOf, LOG_MARKERS, LOG_MARKERS_URL, SOURCE_ICONS, SPRITE_BASE,
  endingImageUrl, caseFileUrl, sceneUrl, wantedUrl, QUEST_UI_URL, QUEST_PINS, QUEST_BANNERS,
  TURN_PORTRAITS, TURN_PORTRAITS_URL, TURN_PORTRAIT_URLS, BESTIARY, bestiaryUrl,
  headUrl, ZIRKEL_URL, ZIRKEL_ICONS, skillIconOf, PULSE_ICONS, ARTIFACT_UI_URL, sourceKind, sourceKindUrl, inspectUrl, RISK_ICONS, RISK_ICONS_URL, JOURNAL_FRAME, JOURNAL_FRAME_URL, choiceRisk, riskOf,
  factionEmblemUrl, TRAVEL_MODES_URL, TRAVEL_MODE_ICONS, TRAVEL_MARKER_URL,
  DANGER_URL, DANGER_ICONS, DANGER_BANNER, RARITY_SHEET, RARITY_SHEET_URL, RARITY_GEMS,
} from '../world/assets.js';
import { sourceOf } from '../core/sources.js';
import { caseHints, nextDeduction } from '../core/hints.js';
import { isSolved, knownPeople } from '../core/journal.js';
import { canHurry, travelSafe, travelFast, afterHurryFight, travelDestinations, cityOf } from '../core/Travel.js';
import { questTarget } from '../core/Guide.js';

/** 16x16-Icon vor einem Item-Namen. Lädt es nicht, verschwindet es einfach. */
const itemIcon = (id) => (PULSE_ICONS[id] ? `<span class="item-icon pulse" style="background-image:url(${PULSE_ICONS[id]})"></span>` : `<img class="item-icon" src="${itemIconUrl(id)}" alt="" width="16" height="16" onerror="this.remove()">`);
/** Größeres Icon (Tränke in 32px, sonst das 16er doppelt). */
const itemIconBig = (id) => `<img class="item-icon big" src="${itemIcon32Url(id) ?? itemIconUrl(id)}" alt="" width="32" height="32" onerror="this.remove()">`;
/** Vor- und Nachteile eines Artefakts als kleine Liste. */
const artifactEffectsHtml = (it) => `<span class="arteffects">${(it.boons ?? []).map((x) => `<span class="boon"><i class="artmark plus"></i>${esc(x.text)}</span>`).join('')}${(it.curses ?? []).map((x) => `<span class="curse"><i class="artmark minus"></i>${esc(x.text)}</span>`).join('')}</span>`;
const emblem = (pid, size = 16) => `<img class="emblem" src="${pathwayEmblemUrl(pid, size)}" alt="" width="${size}" height="${size}" onerror="this.remove()">`;
/** 16x16-Zelle aus einem Icon-Atlas (Fähigkeiten: 7 Spalten, Zustände: 12 Spalten). */
const atlasIcon = (url, index, cols, title = '') => (index === undefined ? ''
  : `<span class="atlas-icon" title="${title}" style="background-image:url(${url});background-position:-${(index % cols) * 16}px -${Math.floor(index / cols) * 16}px"></span>`);
/** Zug-Portrait (16x16, Paket F) neben den Namen im Kampf. */
const turnFace = (id) => {
  if (TURN_PORTRAITS[id] === undefined) return '';
  const [url, cols] = TURN_PORTRAIT_URLS[id] ?? [TURN_PORTRAITS_URL, 19];
  return `<span class="turnface" style="background-image:url(${url});background-size:${cols * 2}em 2em;background-position:-${TURN_PORTRAITS[id] * 2}em 0"></span>`;
};
const skillIcon = (id) => { const ic = skillIconOf(id); return ic ? atlasIcon(ic[0], ic[1], 7) : ''; };
/** Artefakt-Slots (20x20 aus ui/N_artefakt_ui.png), angelegte mit Icon in der Öffnung. */
const artifactSlots = (ids, max, overloaded) => Array.from({ length: Math.max(max, ids.length) }, (_, i) => {
  const id = ids[i];
  const kind = !id ? 'empty' : overloaded ? 'overloaded' : 'equipped';
  return `<span class="artslot ${kind}">${id ? `<img src="${itemIconUrl(id)}" alt="" width="12" height="12">` : ''}</span>`;
}).join('');
const statusIcon = (id, title) => atlasIcon(STATUS_ICONS_URL, STATUS_ICONS[id], 12, title);
const mapMarker = (map) => { const [url, i, cols] = mapMarkerOf(map); return atlasIcon(url, i, cols); };
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
/** Beute als Liste mit Icon, Anzahl und Seltenheit (Farbe). */
const lootHtml = (loot, items) => {
  const rows = lootList(loot, items).map((e) => `<li class="loot-row rar-${e.rarity}">${itemIcon(e.id)}<strong>${esc(e.name)}</strong>${e.n > 1 ? ` ×${e.n}` : ''} <span class="rar">${rarityGem(e.rarity)}${RARITY_NAMES[e.rarity]}</span></li>`);
  if (loot?.money) rows.unshift(`<li class="loot-row">${coin}<strong>${loot.money} Schilling</strong></li>`);
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

export class Ui {
  constructor(root, state, { onNewGame, onContinue, hasSave }) {
    this.root = root;
    root.style.setProperty('--artui', `url(${new URL(ARTIFACT_UI_URL, document.baseURI).href})`);
    this.state = state;
    this.onNewGame = onNewGame;
    this.onContinue = onContinue;
    this.hasSave = hasSave;
    this.modal = null; // 'title' | 'message' | 'dialogue' | 'notebook' | 'travel' | 'ending'
    this.blockedUntil = 0;
    this.selected = [];
    this.tab = 'quests';

    root.innerHTML = `
      <div class="hud">
        <div class="hud-left">
          <div class="place"></div>
          <div class="meter life"><span>Leben</span><div class="bar"><div class="lfill"></div></div><em class="hpnum"></em></div>
          <div class="meter"><span>Nerven</span><div class="bar"><div class="fill"></div></div></div>
          <div class="meter honor"><span class="rank"></span><div class="bar"><div class="hfill"></div></div></div>
          <div class="meter digest hidden"><span>Verdaut</span><div class="bar"><div class="dfill"></div></div><em class="dnum"></em></div>
          <div class="meter unruhe hidden"><span>Unruhe</span><div class="bar"><div class="ufill"></div></div></div>
          <div class="money"></div>
          <div class="overload hidden"></div>
          <div class="fahndung hidden"></div>
          <div class="treffen hidden"></div>
          <div class="goal hidden"></div>
        </div>
        <div class="hud-right">
          <span class="key">J</span> Notizbuch &nbsp; <span class="key">I</span> Inventar &nbsp; <span class="key">P</span> Pfad &nbsp; <span class="key">Q</span> Geistsicht
        </div>
        <div class="vision-tag">Geistsicht</div>
      </div>
      <div class="prompt hidden"></div>
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
      if (this.modal === 'combat') return;
      const it = state.item(id);
      if (delta > 0) this.toast(`Erhalten: ${it.name}${delta > 1 ? ` ×${delta}` : ''}`, 'item');
      else if (it.kind !== 'consumable') this.toast(`Abgegeben: ${it.name}`, 'warn');
    });

    state.on('money', ({ delta, reason }) => {
      this.updateMoney();
      if (this.modal === 'combat' || this.modal === 'shop') return;
      this.toast(`${delta > 0 ? '+' : ''}${delta} Schilling${reason ? `: ${reason}` : ''}`, delta > 0 ? 'item' : 'warn');
    });
    state.on('unruhe', () => this.updateUnruhe());
    state.on('wanted', ({ level, delta, reason }) => {
      this.updateWanted();
      this.toast(`Fahndungsstufe ${level}${reason ? `: ${reason}` : ''}`, delta > 0 ? 'warn' : 'item');
    });
    state.on('bond', ({ name, value, delta, status }) => {
      const max = state.lonerRules()?.friend_at ?? 3;
      if (status === 'freund') this.toast(`${name} ist jetzt dein Freund.`, 'item');
      else if (status === 'feind') this.toast(`${name} ist jetzt dein Feind.`, 'warn');
      else this.toast(`${name}: ${delta > 0 ? 'Vertrauen' : 'Misstrauen'} (${value > 0 ? '+' : ''}${value} von ±${max})`, delta > 0 ? 'item' : 'warn');
    });
    this.digestAcc = {};
    state.on('digest', ({ delta, kind }) => {
      this.updateUnruhe();
      // Rückmeldung: welche Handlung hat verdaut? Geistsicht sammelt, bis es sich lohnt.
      this.digestAcc[kind] = (this.digestAcc[kind] ?? 0) + delta;
      const acc = this.digestAcc[kind];
      if (acc < (kind === 'vision' ? 5 : 1) && state.pathway.digestion < 100) return;
      this.digestAcc[kind] = 0;
      if (this.modal === 'combat') return;
      this.toast(`+${Math.round(acc)} % verdaut: ${DIGEST_LABELS[kind] ?? kind}`, 'digest');
    });
    state.on('digested', () => this.toast(state.pathway?.seq <= 8 ? 'Bereit für den nächsten Trank. Die Formel gibt es auf geheimen Treffen, selten bei Kittering.' : 'Bereit für den nächsten Trank. Kittering hat die Formel.', 'gold'));
    // Geheime Treffen: Ankündigung und Uhr im HUD
    state.on('gathering', ({ text, open }) => {
      this.updateGathering();
      if (this.modal === 'combat') return;
      this.toast(text, open ? 'gold' : 'warn');
    });
    this.gatheringTimer = setInterval(() => this.updateGathering(), 1000);
    state.on('ascend', () => { this.updateUnruhe(); this.updateHp(); });
    state.on('lostcontrol', ({ text }) => {
      this.updateHp();
      this.updateUnruhe();
      if (this.modal === 'combat') return;
      if (this.modal) { this.pendingLost = text; return; }
      this.showMessage('Kontrollverlust', text);
    });
    // Flüstern bei hoher Unruhe
    this.whisperTimer = setInterval(() => {
      if (this.modal || state.unruhe < 60 || !this.scene) return;
      const lines = ['Jemand flüstert deinen Namen.', 'Die Schatten am Rand deines Blicks bewegen sich.', 'Deine Hände zittern. Ein Ruhetee würde helfen.', 'Du hörst ein Lachen, das niemandem gehört.'];
      this.toast(lines[Math.floor(Math.random() * lines.length)], 'warn');
    }, 22000);

    ['track', 'changed', 'quest', 'clue', 'conclusion', 'travel'].forEach((ev) => state.on(ev, () => this.updateGoal()));
    ['item', 'changed', 'pathway'].forEach((ev) => state.on(ev, () => this.updateLoad()));
    window.addEventListener('keydown', (e) => this.onKey(e), true);
    this.updateComposure(state.composure);
    this.updateHonor();
    this.updateHp();
    this.updateMoney();
    this.updateUnruhe();
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
    this.updateGoal();
    this.updateLoad();
  }

  /** Wegweiser im HUD: nächster Schritt des verfolgten Auftrags. */
  goalText(t) {
    if (!t) return '';
    if (t.notebook) return `${t.notebook} (J)`;
    const where = t.map === this.state.map ? 'hier' : (this.state.content.maps[t.district]?.name ?? t.mapName);
    return `${t.name} · ${t.map === t.district || t.map === this.state.map ? where : `${t.mapName}, ${where}`}`;
  }

  updateGoal() {
    const el = this.$('.goal');
    if (!el) return;
    const s = this.state;
    const t = s.tracked ? questTarget(s, s.tracked) : null;
    el.classList.toggle('hidden', !t);
    if (t) el.innerHTML = `<span class="arrow">➤</span> ${esc(this.goalText(t))}<span class="gstep">${esc(t.step)}</span>`;
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
    el.innerHTML = `${inv !== undefined ? atlasIcon(ZIRKEL_URL, 16 + inv, 8) : (st.open ? '◆' : '◇')}${timer} ${esc(st.text)}`;
  }

  /** HUD-Hinweis nur bei Überlast, damit die Anzeige sonst ruhig bleibt. */
  updateLoad() {
    const el = this.$('.overload');
    if (!el) return;
    const heavy = this.state.isOverloaded();
    el.classList.toggle('hidden', !heavy);
    if (heavy) el.textContent = `Überladen · ${this.state.carryText()}`;
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

  updateMoney() {
    this.$('.money').innerHTML = `${coin}${this.state.money} Schilling`;
  }

  updateUnruhe() {
    const s = this.state;
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
    const fill = this.$('.fill');
    const pct = (v / this.state.maxComposure()) * 100;
    fill.style.width = `${pct}%`;
    fill.classList.toggle('low', pct < 30);
  }

  updateHp() {
    const s = this.state;
    const fill = this.$('.lfill');
    fill.style.width = `${(s.hp / s.maxHp) * 100}%`;
    fill.classList.toggle('low', s.hp / s.maxHp < 0.3);
    this.$('.hpnum').textContent = `${s.hp}/${s.maxHp}`;
  }

  updateHonor() {
    const s = this.state;
    const r = s.rank();
    const next = s.nextRank();
    this.$('.rank').textContent = `${r.name} · ${s.honor}`;
    const pct = next ? ((s.honor - r.min) / (next.min - r.min)) * 100 : 100;
    this.$('.hfill').style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }

  setPrompt(text) {
    const el = this.$('.prompt');
    if (!text || this.modal) { el.classList.add('hidden'); return; }
    if (el.dataset.text !== text) {
      el.dataset.text = text;
      el.innerHTML = `<span class="key">E</span> ${esc(text)}`;
    }
    el.classList.remove('hidden');
  }

  toast(text, kind = '', banner = null) {
    const box = this.$('.toasts');
    while (box.children.length > 5) box.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
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
    this.layer.innerHTML = `<div class="panel ${cls}">${html}</div>`;
    this.setPrompt(null);
    return this.layer.firstElementChild;
  }

  close() {
    this.modal = null;
    this.layer.innerHTML = '';
    this.blockedUntil = performance.now() + 150;
    if (this.pendingEnding) {
      const id = this.pendingEnding;
      this.pendingEnding = null;
      this.showEnding(id);
    } else if (this.pendingChapter) {
      // Kapitelende (z. B. Fall 9): eigene Tafel nach dem Schlussbild
      const ch = this.pendingChapter;
      this.pendingChapter = null;
      this.showMessage(ch.title, ch.text, { footer: ch.footer ?? '' });
    } else if (this.pendingLost) {
      const text = this.pendingLost;
      this.pendingLost = null;
      this.showMessage('Kontrollverlust', text);
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
      <div class="controls">
        <div><span class="key">WASD</span> / <span class="key">Pfeile</span> laufen</div>
        <div><span class="key">E</span> untersuchen / sprechen</div>
        <div><span class="key">Q</span> Geistsicht (kostet Nerven)</div>
        <div><span class="key">J</span> Notizbuch: Aufträge, Quellen, Schlussfolgerungen</div>
      </div>
      <div class="actions center">
        ${save ? '<button class="primary" data-act="continue">Fortsetzen <span class="key">E</span></button>' : ''}
        <button class="${save ? '' : 'primary'}" data-act="new">Neues Spiel ${save ? '<span class="key">N</span>' : '<span class="key">E</span>'}</button>
      </div>`, 'title');
    this.titleContinue = save ? () => { this.close(); this.onContinue(); } : null;
    this.titleNew = () => {
      this.close();
      this.onNewGame();
      this.showMessage(c.start.intro_title, c.start.intro, { footer: 'Tipp: Im Notizbuch (J) siehst du deine Aufträge.' });
    };
    el.querySelector('[data-act=new]').onclick = this.titleNew;
    el.querySelector('[data-act=continue]')?.addEventListener('click', this.titleContinue);
  }

  showMessage(title, text, { footer = '', extra = '', face = '', onClose = null, scene = null } = {}) {
    if (onClose) this.afterClose = onClose;
    const el = this.open('message', `
      ${sceneImg(scene)}
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
    this.showMessage(title, list ? 'Du steckst ein:' : 'Leer. Jemand war schneller.', { extra: list });
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
    this.dialogue = { npc, tree, onClose };
    this.showNode(this.state.pick(tree.start));
  }

  showNode(nodeId) {
    const s = this.state;
    const { npc, tree } = this.dialogue;
    const node = tree.nodes[nodeId];
    if (!node) throw new Error(`Dialogknoten fehlt: ${npc.dialogue}.${nodeId}`);
    s.applyEffects(node);
    if (node.combat) this.dialogue.combat = true;
    s.visitNode(npc.dialogue, nodeId);
    let text = node.text;
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
    if (choices.filter((c) => !c.locked).length === 0) choices.push({ text: node.ending ? 'Weiter' : 'Ende' });
    this.dialogue.choices = choices;
    let n = 0;
    const face = portrait(npc.id, node.mood);
    // Paket H: Nahansicht beim Untersuchen, verflucht bei Schaden oder Kampf; Risiko-Effekt über dem Bild
    const risk = npc.item ? riskOf(node) : null;
    const closeup = npc.item && inspectUrl(npc.item)
      ? `<img class="scene inspect" src="${inspectUrl(npc.item, risk === 'curse' || risk === 'ambush')}" alt="" onerror="this.remove()">` : '';
    if (risk) this.scene?.playRiskFx?.(risk);
    if (npc.item && nodeId !== tree.start) this.scene?.playInspect?.(risk === 'curse' || risk === 'ambush' ? 'flinch' : risk === 'bonus_clue' ? 'note' : risk === 'unrest' ? 'clutch_head' : 'read');
    const el = this.open('dialogue', `${closeup || sceneImg(node.scene)}${wantedImg(node.wanted, node.wanted_caught)}${face}
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span></div>
      <div class="text">${paragraphs(text)}</div>
      <ol class="choices">${choices.map((c, i) => (c.locked
        ? `<li><button disabled class="locked">🔒 ${esc(c.text)} <span class="lockinfo">${esc(c.locked)}</span></button></li>`
        : `<li><button data-i="${i}"><span class="key">${++n}</span> ${choiceRisk(c.text) ? riskIcon(choiceRisk(c.text), RISK_TITLES[choiceRisk(c.text)]) : ''}${esc(c.text)}</button></li>`)).join('')}</ol>`, `dialogue${face ? ' with-portrait' : ''}`);
    this.dialogue.keyMap = choices.map((c, i) => (c.locked ? null : i)).filter((i) => i !== null);
    el.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => this.choose(Number(b.dataset.i)); });
  }

  choose(i) {
    const choice = this.dialogue?.choices[i];
    if (!choice || choice.locked) return;
    if (choice.shop || choice.vault || choice.expert) {
      const { onClose } = this.dialogue;
      this.dialogue = null;
      onClose?.();
      if (choice.shop) this.openShop(choice.shop);
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
    const goal = s.tracked ? questTarget(s, s.tracked) : null;
    const goalMap = goal?.district ?? null;
    const meetMap = s.gatheringTarget?.()?.district ?? null;
    const pin = (map, cls, inner, attrs = '') => {
      if (map === meetMap) { cls += ' goal meet'; inner += `${questUi('qpin', QUEST_PINS.amber)}<span class="goaltag">Treffen</span>`; }
      else if (map === goalMap) { cls += ' goal'; inner += `${questUi('qpin', QUEST_PINS.amber)}<span class="goaltag">Ziel</span>`; }
      const [x, y] = pins[map];
      const [url, cell = 0, cols = 13, live = false] = mapMarkerOf(map);
      const col = cell % cols;
      return `<button class="pin ${cls}${live ? ' live' : ''}" ${attrs} style="left:${x / 8}em;top:${y / 8}em">
        <span class="mk" style="--c:${col};background-image:url(${url})"></span>${inner}</button>`;
    };
    const here = pins[current] ? pin(current, 'here', `<span class="youmark" style="background-image:url(${TRAVEL_MARKER_URL})"></span><span class="tag">Du bist hier</span>`, 'disabled') : '';
    const destPins = dests.map((d, i) => (pins[d.map] ? pin(d.map, '', `<span class="num">${i + 1}</span><span class="tag">${esc(d.name)}</span>`, `data-i="${i}"`) : '')).join('');
    const unpinned = dests.map((d, i) => (pins[d.map] ? '' : `<button data-i="${i}"><span class="key">${i + 1}</span> ${esc(d.name)}</button>`)).join('');
    const el = this.open('travel', `
      <div class="map${rules.map_image ? '' : ' plain'}"${rules.map_image ? ` style="background-image:url(${SPRITE_BASE}${rules.map_image})"` : ''}>
        ${rules.fog_image ? '<canvas class="fog" width="480" height="270"></canvas>' : ''}
        ${here}${destPins}
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
    if (fog) this.drawFog(fog, `${SPRITE_BASE}${rules.fog_image}`, [current, ...dests.map((d) => d.map)].map((m) => pins[m]).filter(Boolean));
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
    if (info) info.innerHTML = `<h3>${esc(d.name)}</h3><span class="muted">${esc(d.desc)}</span>`;
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
    modes.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => this.travelMode(b.dataset.mode); });
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

  openNotebook(tab) {
    this.selected = [];
    if (tab) this.tab = tab;
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
    const fixed = ['quests', 'items', 'pfad', 'personen', 'bestiar', 'archiv'];
    if (this.tab === 'archiv' && !solved.length) this.tab = 'quests';
    if (this.tab === 'bestiar' && !beasts.length) this.tab = 'quests';
    // Ein gelöster Fall wird im Archiv geöffnet
    if (solved.some((c) => c.id === this.tab)) { this.archiveCase = this.tab; this.tab = 'archiv'; }
    if (!fixed.includes(this.tab) && !cases.some((c) => c.id === this.tab)) this.tab = 'quests';
    if (this.tab === 'archiv' && !solved.some((c) => c.id === this.archiveCase)) this.archiveCase = solved.at(-1)?.id;
    const tabs = [{ id: 'quests', title: 'Aufträge' }, { id: 'items', title: 'Inventar' }, { id: 'pfad', title: 'Pfad' }, { id: 'personen', title: 'Personen' },
      ...(beasts.length ? [{ id: 'bestiar', title: 'Bestiarium' }] : []),
      ...cases.map((c) => ({ id: c.id, title: c.title.replace(/:.*/, '') })), ...(solved.length ? [{ id: 'archiv', title: `Archiv (${solved.length})` }] : [])];
    const caseId = this.currentCase();
    const body = this.tab === 'quests' ? this.questsHtml() : this.tab === 'items' ? this.itemsHtml() : this.tab === 'pfad' ? this.pathwayHtml()
      : this.tab === 'personen' ? this.peopleHtml() : this.tab === 'bestiar' ? this.bestiaryHtml(beasts)
      : this.tab === 'archiv' ? this.archiveHtml(solved) : this.caseHtml(this.tab);
    const isCase = !!caseId;
    const hint = String(feedback ?? '').startsWith('<div class="hint">') ? feedback : '';
    const el = this.open('notebook', `
      <div class="tabs">${tabs.map((t, i) => `<button class="tab ${t.id === this.tab ? 'sel' : ''}" data-tab="${t.id}"><span class="key">${i + 1}</span> ${esc(t.title)}</button>`).join('')}
        <span class="rankinfo">${esc(this.state.rank().name)} · Ansehen ${this.state.honor}</span></div>
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
    el.querySelectorAll('[data-fact]').forEach((b) => { b.onclick = () => this.toggleFact(b.dataset.fact); });
    el.querySelectorAll('[data-archive]').forEach((b) => { b.onclick = () => { this.archiveCase = b.dataset.archive; this.selected = []; this.renderNotebook(''); }; });
    el.querySelector('[data-act=combine]')?.addEventListener('click', () => this.combine());
    el.querySelector('[data-act=hint]')?.addEventListener('click', () => this.showHint());
    el.querySelectorAll('[data-use]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(this.state.useItem(b.dataset.use) ?? '')); });
    el.querySelectorAll('[data-equip]').forEach((b) => { b.onclick = () => { this.state.equip(b.dataset.equip); this.renderNotebook(''); }; });
    // Wegwerfen braucht einen zweiten Klick, damit nichts aus Versehen verschwindet
    el.querySelectorAll('[data-drop]').forEach((b) => {
      b.onclick = () => {
        if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = 'Wegwerfen?'; return; }
        this.renderNotebook(esc(this.state.dropItem(b.dataset.drop, 1).text));
      };
    });
    el.querySelectorAll('[data-drink]').forEach((b) => { b.onclick = () => this.drink(b.dataset.drink); });
    el.querySelector('[data-ritual]')?.addEventListener('click', () => {
      const r = this.state.performRitual();
      if (r.ok) { this.close(); this.showMessage('Ritual', r.text); } else this.renderNotebook(esc(r.text));
    });
    el.querySelectorAll('[data-wear]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(this.state.equipArtifact(b.dataset.wear).text)); });
    el.querySelectorAll('[data-unequip]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(this.state.unequipArtifact(b.dataset.unequip).text)); });
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

  /** Besiegte Gegner mit Bestiariumsseite (Paket F). */
  knownBeasts() {
    return BESTIARY.filter((id) => this.state.flags.has(`won_${id}`) && this.state.content.encounters[id]);
  }

  bestiaryHtml(ids) {
    const encs = this.state.content.encounters;
    return `<ul class="bestiary">${ids.map((id) => `<li><img src="${bestiaryUrl(id)}" alt="" onerror="this.remove()">
      <strong>${esc(encs[id].name)}</strong><span class="muted">${encs[id].occult ? 'Okkult · ' : ''}${encs[id].hp} Leben</span></li>`).join('')}</ul>`;
  }

  questsHtml() {
    const s = this.state;
    const ids = Object.keys(s.quests);
    const order = (q) => (s.quests[q] === 'active' ? 0 : 1) * 10 + (s.quest(q).kind === 'main' ? 0 : 1);
    ids.sort((a, b) => order(a) - order(b));
    if (!ids.length) return '<p class="empty">Noch keine Aufträge.</p>';
    const row = (id) => {
      const q = s.quest(id);
      const st = s.quests[id];
      const active = st === 'active';
      const tracked = s.tracked === id;
      const steps = active ? `<ul class="steps">${s.questSteps(id).map((x) => `<li class="${x.done ? 'done' : ''}">${x.done ? '✓' : '○'} ${esc(x.text)}</li>`).join('')}</ul>` : '';
      const t = active ? questTarget(s, id) : null;
      const goal = active ? `<div class="qgoal">➤ ${t ? esc(this.goalText(t)) : 'Kein fester Ort bekannt'}</div>` : '';
      return `<li class="quest ${st} ${tracked ? 'tracked' : ''}" ${active ? `data-track="${id}"` : ''}><div class="qtitle"><span class="qkind">${q.kind === 'main' ? 'Hauptfall' : 'Nebenauftrag'}</span> ${esc(q.title)} ${!active ? '<span class="badge likely">erledigt</span>' : ''}${tracked ? '<span class="badge track">verfolgt</span>' : ''}</div>
        ${active ? `<div class="qsum">${q.wanted ? wantedImg(q.wanted, false) : ''}${esc(q.summary)}</div>` : ''}${steps}${goal}</li>`;
    };
    // Erledigte Aufträge zusammengeklappt, damit die offenen oben sichtbar bleiben
    const open = ids.filter((id) => s.quests[id] === 'active');
    const closed = ids.filter((id) => s.quests[id] !== 'active');
    return `<p class="hintline">Klicke auf einen Auftrag, um ihn zu verfolgen. Ein Pfeil zeigt dir dann den Weg.</p>
      <ul class="quests">${open.map(row).join('') || '<li class="empty">Gerade keine offenen Aufträge.</li>'}</ul>
      ${closed.length ? `<details class="closed-quests"><summary>Erledigt (${closed.length})</summary><ul class="quests">${closed.map(row).join('')}</ul></details>` : ''}`;
  }

  itemsHtml() {
    const s = this.state;
    const kindOrder = { weapon: 0, artifact: 1, consumable: 2, potion: 3, formula: 4, ingredient: 5, trophy: 6, key: 7 };
    const list = s.items().sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);
    const w = s.weaponStats();
    const rows = list.map((it) => {
      let action = '';
      if (it.kind === 'weapon') action = s.weapon === it.id ? '<span class="badge likely">ausgerüstet</span>' : `<button class="small" data-equip="${it.id}">Ausrüsten</button>`;
      else if (it.kind === 'consumable' && !it.combat_only) action = `<button class="small" data-use="${it.id}">Benutzen</button>`;
      else if (it.combat_only) action = '<span class="muted">nur im Kampf</span>';
      else if (it.kind === 'potion') {
        const chk = s.drinkCheck(it.id);
        action = chk.ok ? `<button class="small" data-drink="${it.id}">Trinken</button><br><span class="muted">Risiko ${Math.round(chk.risk * 100)} %</span>` : chk.ritual ? '<button class="small" data-recipe="1">Ritual nötig</button>' : '<span class="muted">nicht trinkbar</span>';
      } else if (it.kind === 'formula') action = '<button class="small" data-recipe="1">Rezept</button>';
      else if (it.kind === 'artifact') {
        action = s.isArtifactActive(it.id) ? `<span class="badge likely">angelegt</span><br><button class="small" data-unequip="${it.id}">Ablegen</button>`
          : `<button class="small" data-wear="${it.id}" ${s.canEquipArtifact(it.id).ok ? '' : 'disabled'}>Anlegen</button>`;
        if (s.borrowed.includes(it.id)) action += '<br><span class="muted">vom Revier geliehen</span>';
      } else if (it.kind === 'ingredient') action = '<span class="muted">Zutat</span>';
      else if (it.kind === 'trophy') action = `<span class="muted rar-${itemRarity(it)}">Beutestück · ${RARITY_NAMES[itemRarity(it)]}</span>`;
      if (!action && it.inspect) action = `<button class="small" data-inspect="${it.id}">Untersuchen</button>`;
      const wt = s.itemWeight(it.id);
      if (wt > 0) action += `${action ? '<br>' : ''}<span class="muted weight">${fmtLb(wt * it.count)} Pfd.</span>`;
      if (s.canDrop(it.id) && !(it.kind === 'artifact' && s.isArtifactActive(it.id)) && !(it.kind === 'weapon' && s.weapon === it.id)) action += ` <button class="small drop" data-drop="${it.id}" title="Wegwerfen (eins)">×</button>`;
      const stat = it.kind === 'weapon' ? ` <span class="muted">Angriff ${it.atk}${it.occult ? ', stark gegen Okkultes' : ''}</span>` : '';
      const effects = it.kind === 'artifact' ? artifactEffectsHtml(it) : '';
      return `<li class="item"><div>${it.kind === 'potion' || it.kind === 'formula' ? itemIconBig(it.id) : itemIcon(it.id)}<strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}${stat}<br><span class="desc">${esc(it.desc)}</span>${effects}</div><div>${action}</div></li>`;
    }).join('');
    const arts = s.artifacts.length || list.some((it) => it.kind === 'artifact')
      ? `<div class="status"><span class="artslots">${artifactSlots(s.artifacts, s.artifactRules().max_active ?? 3, s.unruhe >= 60)}</span>Artefakte angelegt <strong>${s.artifacts.length}/${s.artifactRules().max_active ?? 3}</strong>${s.artifactUnruhe() ? ` · <span class="curse">Unruhe +${Math.round(s.artifactUnruhe() * 10) / 10} pro Sekunde</span>` : ''} · Anlegen bringt Unruhe, Ablegen kostet Nerven.</div>` : '';
    return `
      ${carryHtml(s)}
      <div class="status">Leben <strong>${s.hp}/${s.maxHp}</strong> · Nerven <strong>${Math.round(s.composure)}/${s.maxComposure()}</strong> · Waffe <strong>${esc(w.name)}</strong> (Angriff ${w.atk}) · ${coin}<strong>${s.money}</strong> Schilling</div>
      ${arts}
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
  peopleHtml() {
    const people = knownPeople(this.state);
    if (!people.length) return '<p class="empty">Du hast noch mit niemandem gesprochen.</p>';
    return `<ul class="people">${people.map((p) => {
      const face = headFace(p.id, esc(p.name));
      return `<li class="${p.quests.length ? 'busy' : ''}">${face}<div><strong>${esc(p.name)}</strong> <span class="muted">${esc(p.role)}</span>
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
      if (!reached) return `<li class="seq locked"><strong>Sequenz ${n}: ${esc(sd.name)}</strong> <span class="muted">noch nicht erreicht</span></li>`;
      return `<li class="seq"><strong>Sequenz ${n}: ${esc(sd.name)}</strong> ${n === cur.seq ? '<span class="badge likely">aktuell</span>' : ''}<br>
        <span class="desc">${esc(sd.desc)}</span><br>
        ⚔ <strong>${esc(sd.skill.name)}</strong> <span class="muted">(${sd.skill.cost} K)</span> ${esc(sd.skill.desc)}
        ${(sd.passives ?? []).map((x) => `<br>✧ ${esc(x.text)}`).join('')}</li>`;
    }).join('');
    const d = Math.floor(cur.digestion);
    return `
      <div class="pathhead"><div class="pathcard"><img src="${pathwayCardUrl(cur.id)}" alt="" width="96" height="128" onerror="this.parentNode.remove()"><span style="color:${p.color}">Sequenz ${cur.seq}<br>${esc(s.seqDef().name)}</span></div><div>${emblem(cur.id, 32)}<strong style="color:${p.color}">${esc(p.name)}</strong> · Sequenz ${cur.seq}: ${esc(s.seqDef().name)}</div></div>
      <div class="meters2">
        <div class="meter"><span>Verdaut</span><div class="bar"><div class="dfill" style="width:${d}%"></div></div><em>${d} %</em></div>
        <div class="meter"><span>Unruhe</span><div class="bar"><div class="ufill ${s.unruhe >= 60 ? 'low' : ''}" style="width:${s.unruhe}%"></div></div><em>${Math.round(s.unruhe)}</em></div>
      </div>
      <p class="lead"><em>„${esc(p.principle)}“</em> ${esc(p.digest_hint)}</p>
      <p class="muted">Jede Sequenz dieses Pfades: +${s.growth().hp} Leben, +${s.growth().nerves} Nerven. Gerade: ${s.maxHp} Leben, ${s.maxComposure()} Nerven.</p>
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
    const r = this.state.drink(itemId);
    if (r.lost) { this.close(); return; } // Meldung kommt über 'lostcontrol'
    if (!r.ok) { this.renderNotebook(esc(r.text)); return; }
    this.close();
    this.showMessage(this.state.item(itemId).name, r.text);
  }

  openBrew(feedback = '') {
    const list = this.state.recipes();
    this.brewList = list;
    const el = this.open('brew', `
      <h3>Braukessel</h3>
      <p class="lead">Der Kessel blubbert über einem Kohlebecken. Wähle eine Formel. Die Zutaten werden verbraucht.</p>
      ${this.recipesHtml(true)}
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="close">Fertig <span class="key">Esc</span></button></div>`, 'notebook brew');
    el.querySelectorAll('[data-brew]').forEach((b) => { b.onclick = () => this.brew(b.dataset.brew); });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  brew(formulaId) {
    const r = this.state.brew(formulaId);
    this.scene?.playBrewFx?.(r.ok);
    this.openBrew(`<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
  }

  openShop(merchantId, mode = 'buy', feedback = '') {
    const s = this.state;
    const m = s.merchant(merchantId);
    if (!m) throw new Error(`Händler fehlt: ${merchantId}`);
    this.shop = { id: merchantId, mode };
    let rows;
    if (mode === 'buy') {
      const stock = s.shopStock(merchantId);
      this.shop.entries = stock.map((e) => ({ id: e.item, disabled: !!e.locked || e.owned || s.money < e.price }));
      rows = stock.map((e, i) => `<li class="item ${e.locked ? 'lockedrow' : ''}"><div>${itemIconBig(e.item)}<strong>${esc(e.name)}</strong>${s.itemCount(e.item) ? ` <span class="muted">(hast ${s.itemCount(e.item)})</span>` : ''}<br>
        <span class="desc">${esc(e.locked ? `🔒 ${e.locked}` : e.desc)}</span></div>
        <div>${e.owned ? `<span class="badge likely">${e.soldOut ? 'vergriffen' : 'gekauft'}</span>` : `${e.left ? `<span class="muted">noch ${e.left}</span> ` : ''}<button class="small" data-buy="${i}" ${this.shop.entries[i].disabled ? 'disabled' : ''}>${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${e.price} Sch.</button>`}</div></li>`).join('');
    } else {
      const sellable = s.items().filter((it) => s.sellPrice(it.id) !== null);
      this.shop.entries = sellable.map((it) => ({ id: it.id }));
      rows = sellable.map((it, i) => `<li class="item"><div>${itemIconBig(it.id)}<strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}<br><span class="desc">${esc(it.desc)}</span></div>
        <div><button class="small" data-sell="${i}">${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${s.sellPrice(it.id)} Sch.</button></div></li>`).join('') || `<li class="empty">Nichts, was ${esc(m.name)} haben will.</li>`;
    }
    const el = this.open('shop', `
      <h3>${esc(m.name)} <span class="muted">${esc(m.title)}</span></h3>
      <p class="lead">„${esc(m.greeting)}“</p>
      ${m.buys ? `<div class="tabs"><button class="tab ${mode === 'buy' ? 'sel' : ''}" data-mode="buy">Kaufen</button><button class="tab ${mode === 'sell' ? 'sel' : ''}" data-mode="sell">Verkaufen</button> <span class="muted">Wechseln mit <span class="key">V</span></span></div>` : ''}
      <ul class="items shoplist">${rows}</ul>
      <div class="feedback">${feedback}</div>
      <div class="actions"><span class="purse">${coin}${s.money} Schilling</span><button data-act="close">Gehen <span class="key">Esc</span></button></div>`, 'notebook shop');
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
      ? `Das Revier führt Tränke für drei Pfade: ${names}. Jede Stufe gibt es einmal, sobald ein bestimmter Fall gelöst ist. Für alle anderen Pfade gehen Sie auf den Nachtmarkt.`
      : offers.length ? 'Ihr Pfad gehört zu denen, die das Revier unterstützt. Jede gelöste Akte bringt Sie eine Stufe weiter. Trinken sollten Sie aber erst, wenn der letzte Trank verdaut ist.'
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
    const r = sh.mode === 'buy' ? this.state.buy(sh.id, e.id) : this.state.sell(e.id);
    this.openShop(sh.id, sh.mode, `<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
  }

  // --- Eigenes Büro: Lagerschrank und Fallwand -------------------------------------------

  /** Zwei Spalten: was du dabeihast und was im Lager liegt. where: 'buero' oder ein anderes Versteck. */
  openStorage(feedback = '', where = 'buero', title = null) {
    const s = this.state;
    const own = where === 'buero';
    const row = (it, act, label, all) => `<li class="item"><div>${itemIcon(it.id)}<strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}${s.itemWeight(it.id) ? ` <span class="muted weight">${fmtLb(s.itemWeight(it.id) * it.count)} Pfd.</span>` : ''}</div>
      <div><button class="small" data-${act}="${it.id}">${label}</button>${it.count > 1 ? ` <button class="small" data-${act}-all="${it.id}">${all}</button>` : ''}</div></li>`;
    // Schwerstes zuerst: das will man meistens loswerden
    const heavy = (a, b) => s.itemWeight(b.id) * b.count - s.itemWeight(a.id) * a.count;
    const carried = s.items().filter((it) => s.canStore(it.id)).sort(heavy);
    const stored = s.storedItems(where).sort(heavy);
    const el = this.open('storage', `
      <h3>${own ? 'Asservatenschrank <span class="muted">Dein Büro im Revier</span>' : esc(title ?? 'Versteck')}</h3>
      <p class="lead">Was hier liegt, ist sicher, auch wenn du unterwegs ohnmächtig wirst oder ausgeraubt wirst. Beweisstücke bleiben bei dir.</p>
      ${carryHtml(s)}
      <div class="storage">
        <div><h4>Bei dir</h4><ul class="items">${carried.map((it) => row(it, 'store', 'Einlagern', 'Alle')).join('') || '<li class="empty">Nichts zum Einlagern.</li>'}</ul></div>
        <div><h4>${own ? 'Im Schrank' : 'Im Versteck'}</h4><ul class="items">${stored.map((it) => row(it, 'take', 'Nehmen', 'Alle')).join('') || `<li class="empty">${own ? 'Der Schrank ist leer.' : 'Hier liegt nichts.'}</li>`}</ul></div>
      </div>
      <div class="feedback">${feedback}</div>
      <div class="actions"><button data-act="close">Schließen <span class="key">Esc</span></button></div>`, 'notebook shop storage-panel');
    const act = (fn) => () => {
      const r = fn();
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

  // --- Kampf -----------------------------------------------------------------

  openCombat(scene) {
    this.combatScene = scene;
    this.combatMenuOpen = null;
    this.modal = 'combat';
    this.setPrompt(null);
    this.root.classList.add('in-combat');
    this.layer.innerHTML = `
      <div class="combat">
        <div class="cb-enemy">${turnFace(scene.encounterId)}<div class="cb-name"></div><div class="bar big"><div class="efill"></div></div><div class="cb-tags"></div></div>
        <div class="cb-msg"><div class="cb-text"></div><div class="cb-help"></div></div>
        <div class="cb-bottom">
          <div class="cb-player">
            <div class="cb-name">${turnFace('player')}Du <span class="muted cb-weapon"></span> <span class="cb-status"></span></div>
            <div class="meter"><span>Leben</span><div class="bar"><div class="pfill"></div></div><em class="cb-hp"></em></div>
            <div class="meter"><span>Nerven</span><div class="bar"><div class="nfill"></div></div></div>
            <div class="cb-ap"><span>Konzentration</span> <span class="pips"></span></div>
          </div>
          <div class="cb-menu"></div>
        </div>
      </div>`;
    this.combatRefresh();
  }

  combatRefresh() {
    const sc = this.combatScene;
    if (!sc || this.modal !== 'combat') return;
    const c = sc.combat;
    const s = this.state;
    const q = (sel) => this.layer.querySelector(sel);
    q('.cb-enemy .cb-name').textContent = `${c.enemy.name} · ${c.enemy.hp}/${c.enemy.maxHp}`;
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
    q('.cb-status').innerHTML = [c.shield ? statusIcon('eisenhaut', `Schutz ${c.shield}`) + c.shield : '', c.evading ? statusIcon('vorahnung', 'Nächster Angriff geht ins Leere') : '',
      c.bleed ? statusIcon('blutung', `Blutung: ${c.bleed.damage} pro Runde, noch ${c.bleed.rounds}`) + c.bleed.rounds : ''].join(' ');
    q('.pfill').style.width = `${(s.hp / s.maxHp) * 100}%`;
    q('.pfill').classList.toggle('low', s.hp / s.maxHp < 0.3);
    q('.cb-hp').textContent = `${s.hp}/${s.maxHp}`;
    q('.nfill').style.width = `${(s.composure / s.maxComposure()) * 100}%`;
    q('.cb-weapon').textContent = s.weaponStats().name;
    q('.pips').innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="${i < c.ap ? 'on' : ''}"></i>`).join('');
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
    el.innerHTML = paragraphs(text);
    this.layer.querySelector('.cb-help').textContent = help;
    this.layer.querySelector('.cb-menu').innerHTML = '';
    this.combatMenuOpen = null;
  }

  /** Hauptmenü bzw. Untermenüs ('skills', 'items'). */
  combatMenu(sub = 'main') {
    const sc = this.combatScene;
    const c = sc.combat;
    let entries;
    if (sub === 'main') {
      const items = this.state.items().filter((i) => i.kind === 'consumable').length;
      entries = [
        { text: 'Angriff', info: '+1 K · beendet den Zug', act: { type: 'skill', id: 'attack' } },
        { text: 'Fertigkeiten', info: `${c.ap} K`, sub: 'skills' },
        { text: 'Gegenstände', info: c.canUseItem() ? `${items}` : 'schon benutzt', sub: 'items', disabled: !c.canUseItem() },
        { text: 'Fliehen', info: c.canFlee() ? '' : 'unmöglich', act: { type: 'flee' }, disabled: !c.canFlee() },
      ];
      if (c.actions) entries.push({ text: 'Zug beenden', info: '', act: { type: 'end' } });
      this.layer.querySelector('.cb-text').innerHTML = c.actions
        ? `<p>${esc(c.log.at(-1) ?? '')}.</p><p>Runde ${c.round}: Du bist noch am Zug (${c.ap} Konzentration). Fertigkeiten kosten Konzentration, ein Gegenstand pro Zug.</p>`
        : `<p>Runde ${c.round}. Was tust du? Solange die Konzentration reicht, kannst du mehrere Fertigkeiten nacheinander einsetzen.</p>`;
      this.layer.querySelector('.cb-help').textContent = '';
    } else if (sub === 'skills') {
      entries = c.skills().filter((k) => k.id !== 'attack').map((k) => ({
        text: `${k.pathway && !skillIconOf(k.id) ? '✧ ' : ''}${k.name}`, skill: k.id, info: `${k.cost} K${k.composure ? ` · ${k.composure} Nerven` : ''}`, desc: k.desc, act: { type: 'skill', id: k.id }, disabled: !k.usable,
      }));
    } else {
      entries = this.state.items().filter((i) => i.kind === 'consumable').map((i) => ({ text: `${i.name} ×${i.count}`, icon: i.id, desc: i.desc, act: { type: 'item', id: i.id } }));
      if (!entries.length) entries = [{ text: 'Keine Gegenstände', disabled: true }];
    }
    if (sub !== 'main') entries.push({ text: 'Zurück', back: true });
    this.combatMenuOpen = { sub, entries };
    const menu = this.layer.querySelector('.cb-menu');
    menu.innerHTML = `<ol class="choices">${entries.map((e, i) => `<li><button data-i="${i}" ${e.disabled ? 'disabled' : ''} title="${esc(e.desc ?? '')}">
      <span class="key">${e.back ? 'Esc' : i + 1}</span> ${e.icon ? itemIcon(e.icon) : ''}${e.skill ? skillIcon(e.skill) : ''}${esc(e.text)} <span class="muted">${esc(e.info ?? '')}</span></button></li>`).join('')}</ol>
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
    el.textContent = text;
    el.style.left = `${xPct}%`;
    el.style.top = `${yPct}%`;
    box.appendChild(el);
    setTimeout(() => el.remove(), 1100);
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
    const title = { won: 'Sieg', lost: 'Ohnmacht', fled: 'Rückzug' }[result.outcome];
    this.keysBlockedUntil = performance.now() + 400; // hastiges E-Drücken schließt die Meldung nicht sofort
    const list = result.loot ? lootHtml(result.loot, this.state.content.items) : '';
    const extra = list ? `<h4 class="loot-title">${result.lootDeferred ? 'Beute liegt am Boden' : 'Beute'}</h4>${list}` : '';
    const footer = result.lootDeferred && list ? 'Geh hin und drück E, um sie aufzuheben.' : '';
    this.showMessage(`${title}: ${enc.name}`, result.text, { extra, footer });
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
      <div class="footer">Ansehen ${end.honor > 0 ? '+' : ''}${end.honor} · Rang: ${esc(s.rank().name)}</div>
      <button class="primary" data-act="ok">Weiter <span class="key">E</span></button>`, `ending ending-${end.honor >= 15 ? 'good' : 'bad'}`);
    // Schlussbild als Hintergrund (480x270)
    const img = endingImageUrl(id, end.case);
    if (img) { el.classList.add('with-image'); el.style.backgroundImage = `linear-gradient(rgba(10, 8, 14, 0.3), rgba(10, 8, 14, 0.85) 50%), url(${img})`; }
    if (end.chapter) this.pendingChapter = end.chapter;
    el.querySelector('[data-act=ok]').onclick = () => this.close();
  }

  // --- Tastatur ---------------------------------------------------------------

  onKey(e) {
    if (!this.modal || e.repeat) return;
    if (performance.now() < (this.keysBlockedUntil ?? 0)) { e.preventDefault(); e.stopPropagation(); return; }
    const k = e.key.toLowerCase();
    if (this.modal === 'combat') { this.onCombatKey(e, k); return; }
    const confirm = k === 'e' || k === ' ' || k === 'enter';
    const num = /^[1-9]$/.test(k) ? Number(k) - 1 : -1;
    let handled = true;
    if (this.modal === 'title' && confirm) (this.titleContinue ?? this.titleNew)();
    else if (this.modal === 'title' && k === 'n') this.titleNew();
    else if ((this.modal === 'message' || this.modal === 'ending') && (confirm || k === 'escape')) this.close();
    else if (this.modal === 'dialogue' && num >= 0) this.choose(this.dialogue.keyMap[num]);
    else if (this.modal === 'dialogue' && confirm && this.dialogue?.keyMap.length === 1) this.choose(this.dialogue.keyMap[0]);
    else if (this.modal === 'travel' && this.travelPick && (num === 0 || num === 1)) this.travelMode(num === 0 ? 'sicher' : 'schnell');
    else if (this.modal === 'travel' && !this.travelPick && num >= 0) this.travel(num);
    else if (this.modal === 'travel' && k === 'escape') { if (this.travelPick) this.openTravel(this.travelFrom); else this.close(); }
    else if (this.modal === 'notebook' && (k === 'j' || k === 'i' || k === 'p' || k === 'tab' || k === 'escape')) this.close();
    else if (this.modal === 'shop' && num >= 0) this.shopPick(num);
    else if (this.modal === 'shop' && k === 'v' && this.state.merchant(this.shop.id).buys) this.openShop(this.shop.id, this.shop.mode === 'buy' ? 'sell' : 'buy');
    else if ((this.modal === 'shop' || this.modal === 'brew' || this.modal === 'storage' || this.modal === 'vault') && (k === 'escape' || k === 'e')) this.close();
    else if (this.modal === 'vault' && num >= 0) this.vaultPick(num);
    else if (this.modal === 'brew' && num >= 0 && this.brewList?.[num]) this.brew(this.brewList[num].formula);
    else if (this.modal === 'notebook' && k === 'v') this.combine();
    else if (this.modal === 'notebook' && k === 't') this.showHint();
    else if (this.modal === 'notebook' && num >= 0 && this.notebookTabs[num]) { this.tab = this.notebookTabs[num].id; this.selected = []; this.renderNotebook(''); }
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
      const kind = k === ' ' ? 'dodge' : k === 'f' ? 'parry' : (k === 'e' || k === 'enter') ? 'confirm' : null;
      if (kind) handled = sc.onKey(kind);
    }
    if (handled || k === ' ' || k === 'tab') { e.preventDefault(); e.stopPropagation(); }
  }
}
