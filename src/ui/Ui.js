import { DIGEST_LABELS } from '../core/Pathways.js';
import {
  itemIconUrl, itemIcon32Url, pathwayEmblemUrl, pathwayCardUrl, COIN_URL, SKILL_ICONS, SKILL_ICONS_URL, STATUS_ICONS, STATUS_ICONS_URL,
  portraitUrl, PORTRAIT_MOODS, MAP_MARKERS, MAP_MARKERS_URL, LOG_MARKERS, LOG_MARKERS_URL, SOURCE_ICONS,
} from '../world/assets.js';
import { sourceOf } from '../core/sources.js';

/** 16x16-Icon vor einem Item-Namen. Lädt es nicht, verschwindet es einfach. */
const itemIcon = (id) => `<img class="item-icon" src="${itemIconUrl(id)}" alt="" width="16" height="16" onerror="this.remove()">`;
/** Größeres Icon (Tränke in 32px, sonst das 16er doppelt). */
const itemIconBig = (id) => `<img class="item-icon big" src="${itemIcon32Url(id) ?? itemIconUrl(id)}" alt="" width="32" height="32" onerror="this.remove()">`;
const emblem = (pid, size = 16) => `<img class="emblem" src="${pathwayEmblemUrl(pid, size)}" alt="" width="${size}" height="${size}" onerror="this.remove()">`;
/** 16x16-Zelle aus einem Icon-Atlas (Fähigkeiten: 7 Spalten, Zustände: 12 Spalten). */
const atlasIcon = (url, index, cols, title = '') => (index === undefined ? ''
  : `<span class="atlas-icon" title="${title}" style="background-image:url(${url});background-position:-${(index % cols) * 16}px -${Math.floor(index / cols) * 16}px"></span>`);
const skillIcon = (id) => atlasIcon(SKILL_ICONS_URL, SKILL_ICONS[id], 7);
const statusIcon = (id, title) => atlasIcon(STATUS_ICONS_URL, STATUS_ICONS[id], 12, title);
const mapMarker = (map) => atlasIcon(MAP_MARKERS_URL, MAP_MARKERS[map], 13);
/** Portrait (64x64 aus einem 256x64-Streifen) für den Dialog. */
const portrait = (id, mood) => {
  const url = portraitUrl(id);
  if (!url) return '';
  const col = PORTRAIT_MOODS[mood] ?? 0;
  return `<div class="portrait" style="background-image:url(${url});background-position:${(col / 3) * 100}% 0"></div>`;
};
/** Kleines Quellenbild im Notizbuch: Gesicht der erzählenden Person, sonst ein Symbol. */
const SOURCE_LABEL = { observation: 'Eigene Beobachtung', vision: 'Geistsicht', police: 'Polizeibericht', archive: 'Akte', note: 'Gelesen', object: 'Spur am Ort', npc: 'Aussage' };
const sourceFace = (content, clue) => {
  const src = sourceOf(content, clue);
  const title = esc(`${clue.source} (${SOURCE_LABEL[src.type]})`);
  const face = src.type === 'npc' ? portraitUrl(src.npc) : src.type === 'observation' ? portraitUrl('player') : null;
  if (face) return `<span class="srcface face" title="${title}" style="background-image:url(${face})"></span>`;
  const [url, cell, cols] = SOURCE_ICONS[src.type] ?? SOURCE_ICONS.object;
  return `<span class="srcface icon" title="${title}" style="background-image:url(${url});background-size:${cols * 100}% 100%;background-position:${(cell / (cols - 1)) * 100}% 0"></span>`;
};
const coin = '<img class="coin" src="' + COIN_URL + '" alt="" width="16" height="16" onerror="this.remove()">';

// HTML-Oberfläche über dem Spiel-Canvas: HUD, Hinweise, Dialoge, Notizbuch,
// Stadtkarte und Enden. Text als HTML bleibt bei jeder Skalierung scharf.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const paragraphs = (s) => esc(s).split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

export const STATUS_LABEL = { suspected: 'Vermutung', likely: 'sehr wahrscheinlich', refuted: 'widerlegt' };

export class Ui {
  constructor(root, state, { onNewGame, onContinue, hasSave }) {
    this.root = root;
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
    state.on('fact', ({ id, status }) => {
      if (status === 'likely') this.toast(`Bestätigt: ${state.fact(id).text}`, 'gold');
      if (status === 'refuted') this.toast(`Widerlegt: ${state.fact(id).text}`, 'warn');
    });
    state.on('conclusion', (id) => this.toast(`Schlussfolgerung: ${state.deduction(id).name}`, 'gold'));
    state.on('honor', ({ delta, reason }) => { this.toast(`${delta > 0 ? '+' : ''}${delta} Ansehen${reason ? `: ${reason}` : ''}`, delta > 0 ? 'honor' : 'warn'); this.updateHonor(); });
    state.on('rank', ({ rank, up }) => this.toast(`${up ? 'Neuer Rang' : 'Rang verloren'}: ${rank.name}`, up ? 'gold' : 'warn'));
    state.on('quest', ({ id, status }) => {
      const q = state.quest(id);
      if (status === 'active') this.toast(`Neuer Auftrag: ${q.title}`, 'quest');
      if (status === 'done') this.toast(`Auftrag erledigt: ${q.title}`, 'quest');
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
    state.on('digested', () => this.toast('Bereit für den nächsten Trank. Kittering hat die Formel.', 'gold'));
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

    window.addEventListener('keydown', (e) => this.onKey(e), true);
    this.updateComposure(state.composure);
    this.updateHonor();
    this.updateHp();
    this.updateMoney();
    this.updateUnruhe();
  }

  onSceneReady(scene) {
    this.scene = scene;
    this.$('.place').textContent = this.state.content.maps[this.state.map].name;
    this.updateHonor();
    this.updateHp();
    this.updateMoney();
    this.updateUnruhe();
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
    fill.style.width = `${v}%`;
    fill.classList.toggle('low', v < 30);
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

  toast(text, kind = '') {
    const box = this.$('.toasts');
    while (box.children.length > 5) box.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
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
    } else if (this.pendingLost) {
      const text = this.pendingLost;
      this.pendingLost = null;
      this.showMessage('Kontrollverlust', text);
    } else if (this.state.pendingCombat && this.scene) {
      this.scene.startCombat(this.state.pendingCombat);
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

  showMessage(title, text, { footer = '', extra = '', face = '' } = {}) {
    const el = this.open('message', `
      <h3>${face}${esc(title)}</h3>
      <div class="text">${paragraphs(text)}</div>
      ${extra}
      ${footer ? `<div class="footer">${esc(footer)}</div>` : ''}
      <button class="next" data-act="ok">Weiter <span class="key">E</span></button>`, 'message');
    el.querySelector('[data-act=ok]').onclick = () => this.close();
  }

  showClue(id, isNew) {
    const s = this.state;
    const clue = s.clue(id);
    const status = s.factStatus(clue.fact);
    const n = s.factSources(clue.fact).length;
    const extra = `<div class="factline">${this.badge(status)} ${esc(s.fact(clue.fact).text)} <span class="muted">(${n} ${n === 1 ? 'Quelle' : 'Quellen'})</span></div>`;
    this.showMessage(clue.name, clue.text, { extra, face: sourceFace(s.content, clue), footer: isNew ? `Quelle: ${clue.source}. Im Notizbuch vermerkt.` : 'Steht bereits in deinem Notizbuch.' });
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
    const el = this.open('dialogue', `${face}
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span></div>
      <div class="text">${paragraphs(text)}</div>
      <ol class="choices">${choices.map((c, i) => (c.locked
        ? `<li><button disabled class="locked">🔒 ${esc(c.text)} <span class="lockinfo">${esc(c.locked)}</span></button></li>`
        : `<li><button data-i="${i}"><span class="key">${++n}</span> ${esc(c.text)}</button></li>`)).join('')}</ol>`, `dialogue${face ? ' with-portrait' : ''}`);
    this.dialogue.keyMap = choices.map((c, i) => (c.locked ? null : i)).filter((i) => i !== null);
    el.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => this.choose(Number(b.dataset.i)); });
  }

  choose(i) {
    const choice = this.dialogue?.choices[i];
    if (!choice || choice.locked) return;
    if (choice.shop) {
      const { onClose } = this.dialogue;
      this.dialogue = null;
      onClose?.();
      this.openShop(choice.shop);
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

  openTravel(current) {
    const s = this.state;
    const dests = s.content.travel.filter((t) => t.map !== current && s.meets(t));
    this.travelDests = dests;
    const el = this.open('travel', `
      <h3>Stadtkarte von Kettlegate</h3>
      <ol class="choices">${dests.map((d, i) => `<li><button data-i="${i}"><span class="key">${i + 1}</span> ${mapMarker(d.map)}${esc(d.name)} <span class="muted">${esc(d.desc)}</span></button></li>`).join('')}
      <li><button data-act="stay"><span class="key">Esc</span> Hierbleiben</button></li></ol>`, 'travel');
    el.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => this.travel(Number(b.dataset.i)); });
    el.querySelector('[data-act=stay]').onclick = () => this.close();
  }

  travel(i) {
    const d = this.travelDests?.[i];
    if (!d) return;
    this.close();
    this.scene.travelTo(d.map, d.spawn);
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
    const cases = this.visibleCases();
    const fixed = ['quests', 'items', 'pfad'];
    if (!fixed.includes(this.tab) && !cases.some((c) => c.id === this.tab)) this.tab = 'quests';
    const tabs = [{ id: 'quests', title: 'Aufträge' }, { id: 'items', title: 'Inventar' }, { id: 'pfad', title: 'Pfad' }, ...cases.map((c) => ({ id: c.id, title: c.title.replace(/:.*/, '') }))];
    const body = this.tab === 'quests' ? this.questsHtml() : this.tab === 'items' ? this.itemsHtml() : this.tab === 'pfad' ? this.pathwayHtml() : this.caseHtml(this.tab);
    const isCase = !fixed.includes(this.tab);
    const el = this.open('notebook', `
      <div class="tabs">${tabs.map((t, i) => `<button class="tab ${t.id === this.tab ? 'sel' : ''}" data-tab="${t.id}"><span class="key">${i + 1}</span> ${esc(t.title)}</button>`).join('')}
        <span class="rankinfo">${esc(this.state.rank().name)} · Ansehen ${this.state.honor}</span></div>
      ${body}
      <div class="feedback">${feedback}</div>
      <div class="actions">
        ${isCase ? `<button class="primary" data-act="combine" ${this.selected.length === 2 ? '' : 'disabled'}>Verknüpfen <span class="key">V</span></button>` : ''}
        <button data-act="close">Schließen <span class="key">J</span></button>
      </div>`, 'notebook');
    this.notebookTabs = tabs;
    el.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { this.tab = b.dataset.tab; this.selected = []; this.renderNotebook(''); }; });
    el.querySelectorAll('[data-fact]').forEach((b) => { b.onclick = () => this.toggleFact(b.dataset.fact); });
    el.querySelector('[data-act=combine]')?.addEventListener('click', () => this.combine());
    el.querySelectorAll('[data-use]').forEach((b) => { b.onclick = () => this.renderNotebook(esc(this.state.useItem(b.dataset.use) ?? '')); });
    el.querySelectorAll('[data-equip]').forEach((b) => { b.onclick = () => { this.state.equip(b.dataset.equip); this.renderNotebook(''); }; });
    el.querySelectorAll('[data-drink]').forEach((b) => { b.onclick = () => this.drink(b.dataset.drink); });
    el.querySelectorAll('[data-inspect]').forEach((b) => { b.onclick = () => this.inspectItem(b.dataset.inspect); });
    el.querySelectorAll('[data-recipe]').forEach((b) => { b.onclick = () => { this.tab = 'pfad'; this.renderNotebook(''); }; });
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  /** Fundstück untersuchen: eigener Dialog mit Risiko (Unruhe, Verletzung, Kampf) und möglichen Bonus-Hinweisen. */
  inspectItem(id) {
    const it = this.state.item(id);
    this.openDialogue({ name: it.name, role: 'Fundstück', dialogue: it.inspect }, ({ combat } = {}) => {
      if (!combat && !this.modal) this.openNotebook('items');
    });
  }

  questsHtml() {
    const s = this.state;
    const ids = Object.keys(s.quests);
    const order = (q) => (s.quests[q] === 'active' ? 0 : 1) * 10 + (s.quest(q).kind === 'main' ? 0 : 1);
    ids.sort((a, b) => order(a) - order(b));
    if (!ids.length) return '<p class="empty">Noch keine Aufträge.</p>';
    return `<ul class="quests">${ids.map((id) => {
      const q = s.quest(id);
      const st = s.quests[id];
      const steps = st === 'active' ? `<ul class="steps">${s.questSteps(id).map((x) => `<li class="${x.done ? 'done' : ''}">${x.done ? '✓' : '○'} ${esc(x.text)}</li>`).join('')}</ul>` : '';
      return `<li class="quest ${st}"><div class="qtitle"><span class="qkind">${q.kind === 'main' ? 'Hauptfall' : 'Nebenauftrag'}</span> ${esc(q.title)} ${st !== 'active' ? '<span class="badge likely">erledigt</span>' : ''}</div>
        ${st === 'active' ? `<div class="qsum">${esc(q.summary)}</div>` : ''}${steps}</li>`;
    }).join('')}</ul>`;
  }

  itemsHtml() {
    const s = this.state;
    const kindOrder = { weapon: 0, consumable: 1, potion: 2, formula: 3, ingredient: 4, key: 5 };
    const list = s.items().sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);
    const w = s.weaponStats();
    const rows = list.map((it) => {
      let action = '';
      if (it.kind === 'weapon') action = s.weapon === it.id ? '<span class="badge likely">ausgerüstet</span>' : `<button class="small" data-equip="${it.id}">Ausrüsten</button>`;
      else if (it.kind === 'consumable' && !it.combat_only) action = `<button class="small" data-use="${it.id}">Benutzen</button>`;
      else if (it.combat_only) action = '<span class="muted">nur im Kampf</span>';
      else if (it.kind === 'potion') {
        const chk = s.drinkCheck(it.id);
        action = chk.ok ? `<button class="small" data-drink="${it.id}">Trinken</button><br><span class="muted">Risiko ${Math.round(chk.risk * 100)} %</span>` : '<span class="muted">nicht trinkbar</span>';
      } else if (it.kind === 'formula') action = '<button class="small" data-recipe="1">Rezept</button>';
      else if (it.kind === 'ingredient') action = '<span class="muted">Zutat</span>';
      if (!action && it.inspect) action = `<button class="small" data-inspect="${it.id}">Untersuchen</button>`;
      const stat = it.kind === 'weapon' ? ` <span class="muted">Angriff ${it.atk}${it.occult ? ', stark gegen Okkultes' : ''}</span>` : '';
      return `<li class="item"><div>${it.kind === 'potion' || it.kind === 'formula' ? itemIconBig(it.id) : itemIcon(it.id)}<strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}${stat}<br><span class="desc">${esc(it.desc)}</span></div><div>${action}</div></li>`;
    }).join('');
    return `
      <div class="status">Leben <strong>${s.hp}/${s.maxHp}</strong> · Nerven <strong>${Math.round(s.composure)}</strong> · Waffe <strong>${esc(w.name)}</strong> (Angriff ${w.atk}) · ${coin}<strong>${s.money}</strong> Schilling</div>
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
        ${this.badge(st)} ${linkable.has(f) ? '<span class="thread" title="Lässt sich verknüpfen">✦</span> ' : ''}${esc(s.fact(f).text)} <span class="src">${n}×</span></button></li>`;
    }).join('');
    const ded = s.content.deductions.filter((d) => d.case === caseId && s.hasConclusion(d.id));
    const concl = ded.map((d) => `<li><strong>${esc(d.name)}</strong> ${s.isCertain(d.id) ? '<span class="badge likely">gesichert</span>' : '<span class="badge suspected">Vermutung</span>'}<br>${esc(d.text)}</li>`).join('');
    const total = s.content.deductions.filter((d) => d.case === caseId && d.honor !== 0).length;
    const detailId = this.selected[this.selected.length - 1];
    const detail = detailId
      ? `<strong>Quellen:</strong><ul class="sources">${s.factSources(detailId).map((c) => `<li>${sourceFace(s.content, s.clue(c))}<div><em>${esc(s.clue(c).source)}:</em> ${esc(s.clue(c).text)}</div></li>`).join('')}</ul>`
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
      <div class="detail">${detail}</div>`;
  }

  toggleFact(id) {
    if (this.selected.includes(id)) this.selected = this.selected.filter((x) => x !== id);
    else this.selected = [...this.selected, id].slice(-2);
    this.renderNotebook('');
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
      <h4>Was deinen Trank verdaut</h4>
      <ul class="digestlist">${s.digestTable().map((r) => `<li><span>${esc(r.label)}</span> <strong>+${r.points} %</strong></li>`).join('')}
        <li class="muted">Alles andere verdaut diesen Pfad nicht. Auf höheren Sequenzen geht es langsamer.</li></ul>
      <ul class="seqs">${rows}</ul>
      ${this.recipesHtml(false)}`;
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
        <div>${e.owned ? '<span class="badge likely">gekauft</span>' : `<button class="small" data-buy="${i}" ${this.shop.entries[i].disabled ? 'disabled' : ''}>${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${e.price} Sch.</button>`}</div></li>`).join('');
    } else {
      const sellable = s.items().filter((it) => s.sellPrice(it.id) !== null);
      this.shop.entries = sellable.map((it) => ({ id: it.id }));
      rows = sellable.map((it, i) => `<li class="item"><div>${itemIconBig(it.id)}<strong>${esc(it.name)}</strong>${it.count > 1 ? ` ×${it.count}` : ''}<br><span class="desc">${esc(it.desc)}</span></div>
        <div><button class="small" data-sell="${i}">${i < 9 ? `<span class="key">${i + 1}</span> ` : ''}${s.sellPrice(it.id)} Sch.</button></div></li>`).join('') || '<li class="empty">Nichts, was Gorse haben will.</li>';
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

  shopPick(i) {
    const sh = this.shop;
    const e = sh?.entries[i];
    if (!e) return;
    const r = sh.mode === 'buy' ? this.state.buy(sh.id, e.id) : this.state.sell(e.id);
    this.openShop(sh.id, sh.mode, `<span class="${r.ok ? 'good' : ''}">${esc(r.text)}</span>`);
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
        <div class="cb-enemy"><div class="cb-name"></div><div class="bar big"><div class="efill"></div></div><div class="cb-tags"></div></div>
        <div class="cb-msg"><div class="cb-text"></div><div class="cb-help"></div></div>
        <div class="cb-bottom">
          <div class="cb-player">
            <div class="cb-name">Du <span class="muted cb-weapon"></span> <span class="cb-status"></span></div>
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
      burn ? `<span class="badge suspected">${statusIcon(burn[0])}${burn[1]} ${c.burn.rounds}</span>` : '',
      c.stunned ? `<span class="badge suspected">${statusIcon('betaeubt')}betäubt</span>` : '',
      c.confused ? `<span class="badge suspected">${statusIcon('verwirrt')}verwirrt</span>` : ''].join(' ');
    q('.cb-status').innerHTML = [c.shield ? statusIcon('eisenhaut', `Schutz ${c.shield}`) + c.shield : '', c.evading ? statusIcon('vorahnung', 'Nächster Angriff geht ins Leere') : ''].join(' ');
    q('.pfill').style.width = `${(s.hp / s.maxHp) * 100}%`;
    q('.pfill').classList.toggle('low', s.hp / s.maxHp < 0.3);
    q('.cb-hp').textContent = `${s.hp}/${s.maxHp}`;
    q('.nfill').style.width = `${s.composure}%`;
    q('.cb-weapon').textContent = s.weaponStats().name;
    q('.pips').innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="${i < c.ap ? 'on' : ''}"></i>`).join('');
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
      entries = [
        { text: 'Angriff', info: '+1 K', act: { type: 'skill', id: 'attack' } },
        { text: 'Fertigkeiten', info: `${c.ap} K`, sub: 'skills' },
        { text: 'Gegenstände', info: `${this.state.items().filter((i) => i.kind === 'consumable').length}`, sub: 'items' },
        { text: 'Fliehen', info: c.canFlee() ? '' : 'unmöglich', act: { type: 'flee' }, disabled: !c.canFlee() },
      ];
      this.layer.querySelector('.cb-text').innerHTML = `<p>Runde ${c.round}. Was tust du?</p>`;
      this.layer.querySelector('.cb-help').textContent = '';
    } else if (sub === 'skills') {
      entries = c.skills().filter((k) => k.id !== 'attack').map((k) => ({
        text: `${k.pathway && SKILL_ICONS[k.id] === undefined ? '✧ ' : ''}${k.name}`, skill: k.id, info: `${k.cost} K${k.composure ? ` · ${k.composure} Nerven` : ''}`, desc: k.desc, act: { type: 'skill', id: k.id }, disabled: !k.usable,
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
    this.showMessage(`${title}: ${enc.name}`, result.text);
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
    else if (this.modal === 'travel' && num >= 0) this.travel(num);
    else if (this.modal === 'travel' && k === 'escape') this.close();
    else if (this.modal === 'notebook' && (k === 'j' || k === 'i' || k === 'p' || k === 'tab' || k === 'escape')) this.close();
    else if (this.modal === 'shop' && num >= 0) this.shopPick(num);
    else if (this.modal === 'shop' && k === 'v' && this.state.merchant(this.shop.id).buys) this.openShop(this.shop.id, this.shop.mode === 'buy' ? 'sell' : 'buy');
    else if ((this.modal === 'shop' || this.modal === 'brew') && (k === 'escape' || k === 'e')) this.close();
    else if (this.modal === 'brew' && num >= 0 && this.brewList?.[num]) this.brew(this.brewList[num].formula);
    else if (this.modal === 'notebook' && k === 'v') this.combine();
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
