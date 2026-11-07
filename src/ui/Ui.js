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
          <div class="meter"><span>Nerven</span><div class="bar"><div class="fill"></div></div></div>
          <div class="meter honor"><span class="rank"></span><div class="bar"><div class="hfill"></div></div></div>
        </div>
        <div class="hud-right">
          <span class="key">J</span> Notizbuch &nbsp; <span class="key">Q</span> Geistsicht
        </div>
        <div class="vision-tag">Geistsicht</div>
      </div>
      <div class="prompt hidden"></div>
      <div class="toasts"></div>
      <div class="layer"></div>`;
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

    window.addEventListener('keydown', (e) => this.onKey(e), true);
    this.updateComposure(state.composure);
    this.updateHonor();
  }

  onSceneReady(scene) {
    this.scene = scene;
    this.$('.place').textContent = this.state.content.maps[this.state.map].name;
    this.updateHonor();
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
    return status && STATUS_LABEL[status] ? `<span class="badge ${status}">${STATUS_LABEL[status]}</span>` : '';
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

  showMessage(title, text, { footer = '', extra = '' } = {}) {
    const el = this.open('message', `
      <h3>${esc(title)}</h3>
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
    this.showMessage(clue.name, clue.text, { extra, footer: isNew ? `Quelle: ${clue.source}. Im Notizbuch vermerkt.` : 'Steht bereits in deinem Notizbuch.' });
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
    let text = node.text;
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
    const el = this.open('dialogue', `
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span></div>
      <div class="text">${paragraphs(text)}</div>
      <ol class="choices">${choices.map((c, i) => (c.locked
        ? `<li><button disabled class="locked">🔒 ${esc(c.text)} <span class="lockinfo">${esc(c.locked)}</span></button></li>`
        : `<li><button data-i="${i}"><span class="key">${++n}</span> ${esc(c.text)}</button></li>`)).join('')}</ol>`, 'dialogue');
    this.dialogue.keyMap = choices.map((c, i) => (c.locked ? null : i)).filter((i) => i !== null);
    el.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => this.choose(Number(b.dataset.i)); });
  }

  choose(i) {
    const choice = this.dialogue?.choices[i];
    if (!choice || choice.locked) return;
    const next = this.state.pick(choice.next);
    if (next) { this.showNode(next); return; }
    const { onClose } = this.dialogue;
    this.dialogue = null;
    this.close();
    onClose?.();
  }

  // --- Stadtkarte ----------------------------------------------------------------

  openTravel(current) {
    const s = this.state;
    const dests = s.content.travel.filter((t) => t.map !== current && s.meets(t));
    this.travelDests = dests;
    const el = this.open('travel', `
      <h3>Stadtkarte von Kettlegate</h3>
      <ol class="choices">${dests.map((d, i) => `<li><button data-i="${i}"><span class="key">${i + 1}</span> ${esc(d.name)} <span class="muted">${esc(d.desc)}</span></button></li>`).join('')}
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
    if (this.tab !== 'quests' && !cases.some((c) => c.id === this.tab)) this.tab = 'quests';
    const tabs = [{ id: 'quests', title: 'Aufträge' }, ...cases.map((c) => ({ id: c.id, title: c.title.replace(/:.*/, '') }))];
    const body = this.tab === 'quests' ? this.questsHtml() : this.caseHtml(this.tab);
    const el = this.open('notebook', `
      <div class="tabs">${tabs.map((t, i) => `<button class="tab ${t.id === this.tab ? 'sel' : ''}" data-tab="${t.id}"><span class="key">${i + 1}</span> ${esc(t.title)}</button>`).join('')}
        <span class="rankinfo">${esc(this.state.rank().name)} · Ansehen ${this.state.honor}</span></div>
      ${body}
      <div class="feedback">${feedback}</div>
      <div class="actions">
        ${this.tab !== 'quests' ? `<button class="primary" data-act="combine" ${this.selected.length === 2 ? '' : 'disabled'}>Verknüpfen <span class="key">V</span></button>` : ''}
        <button data-act="close">Schließen <span class="key">J</span></button>
      </div>`, 'notebook');
    this.notebookTabs = tabs;
    el.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { this.tab = b.dataset.tab; this.selected = []; this.renderNotebook(''); }; });
    el.querySelectorAll('[data-fact]').forEach((b) => { b.onclick = () => this.toggleFact(b.dataset.fact); });
    el.querySelector('[data-act=combine]')?.addEventListener('click', () => this.combine());
    el.querySelector('[data-act=close]').onclick = () => this.close();
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

  caseHtml(caseId) {
    const s = this.state;
    const facts = s.knownFacts(caseId);
    const order = { likely: 0, suspected: 1, refuted: 2 };
    facts.sort((a, b) => order[s.factStatus(a)] - order[s.factStatus(b)]);
    const factItems = facts.map((f) => {
      const st = s.factStatus(f);
      const n = s.factSources(f).length;
      return `<li><button class="fact ${st} ${this.selected.includes(f) ? 'sel' : ''}" data-fact="${f}" ${st === 'refuted' ? 'data-refuted="1"' : ''}>
        ${this.badge(st)} ${esc(s.fact(f).text)} <span class="src">${n}×</span></button></li>`;
    }).join('');
    const ded = s.content.deductions.filter((d) => d.case === caseId && s.hasConclusion(d.id));
    const concl = ded.map((d) => `<li><strong>${esc(d.name)}</strong> ${s.isCertain(d.id) ? '<span class="badge likely">gesichert</span>' : '<span class="badge suspected">Vermutung</span>'}<br>${esc(d.text)}</li>`).join('');
    const total = s.content.deductions.filter((d) => d.case === caseId && d.honor !== 0).length;
    const detailId = this.selected[this.selected.length - 1];
    const detail = detailId
      ? `<strong>Quellen:</strong><ul class="sources">${s.factSources(detailId).map((c) => `<li><em>${esc(s.clue(c).source)}:</em> ${esc(s.clue(c).text)}</li>`).join('')}</ul>`
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
    const k = e.key.toLowerCase();
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
    else if (this.modal === 'notebook' && (k === 'j' || k === 'tab' || k === 'escape')) this.close();
    else if (this.modal === 'notebook' && k === 'v') this.combine();
    else if (this.modal === 'notebook' && num >= 0 && this.notebookTabs[num]) { this.tab = this.notebookTabs[num].id; this.selected = []; this.renderNotebook(''); }
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  }
}
