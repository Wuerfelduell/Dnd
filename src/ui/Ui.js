// HTML-Oberfläche über dem Spiel-Canvas: Hinweise, Dialoge, Notizbuch, Enden.
// Text als HTML bleibt bei jeder Skalierung scharf und ist leicht zu gestalten.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const paragraphs = (s) => esc(s).split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

export class Ui {
  constructor(root, state, { onRestart }) {
    this.root = root;
    this.state = state;
    this.onRestart = onRestart;
    this.modal = null; // 'title' | 'message' | 'dialogue' | 'notebook' | 'ending'
    this.blockedUntil = 0;
    this.selected = [];

    root.innerHTML = `
      <div class="hud">
        <div class="hud-left">
          <div class="case-title"></div>
          <div class="meter"><span>Nerven</span><div class="bar"><div class="fill"></div></div></div>
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
    this.$('.case-title').textContent = `Fall 1: ${state.caseData.title}`;

    state.on('composure', (v) => this.updateComposure(v));
    state.on('vision', (on) => root.classList.toggle('vision', on));
    state.on('notice', (t) => this.toast(t, 'warn'));
    state.on('clue', (id) => this.toast(`Neuer Hinweis: ${state.clue(id).name}`));
    state.on('conclusion', (id) => this.toast(`Schlussfolgerung: ${state.deduction(id).name}`, 'gold'));
    state.on('ending', (id) => { this.pendingEnding = id; });

    window.addEventListener('keydown', (e) => this.onKey(e), true);
    this.updateComposure(state.composure);
  }

  onSceneReady(scene) {
    this.scene = scene;
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
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
    this.$('.toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3200);
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

  showTitle(onStart) {
    const c = this.state.caseData;
    const el = this.open('title', `
      <h1>Nebelakten</h1>
      <h2>Fall 1: ${esc(c.title)}</h2>
      <div class="controls">
        <div><span class="key">WASD</span> / <span class="key">Pfeile</span> laufen</div>
        <div><span class="key">E</span> untersuchen / sprechen</div>
        <div><span class="key">Q</span> Geistsicht (kostet Nerven)</div>
        <div><span class="key">J</span> Notizbuch: Hinweise verknüpfen</div>
      </div>
      <button class="primary" data-act="start">Ermittlung beginnen <span class="key">E</span></button>`, 'title');
    this.titleStart = () => { this.close(); onStart?.(); this.showMessage(c.location, c.intro, { footer: 'Viel Glück, Ermittler.' }); };
    el.querySelector('[data-act=start]').onclick = this.titleStart;
  }

  showMessage(title, text, { footer = '' } = {}) {
    const el = this.open('message', `
      <h3>${esc(title)}</h3>
      <div class="text">${paragraphs(text)}</div>
      ${footer ? `<div class="footer">${esc(footer)}</div>` : ''}
      <button class="next" data-act="ok">Weiter <span class="key">E</span></button>`, 'message');
    el.querySelector('[data-act=ok]').onclick = () => this.close();
  }

  // --- Dialoge --------------------------------------------------------------

  openDialogue(npc, onClose) {
    this.dialogue = { npc, tree: this.state.caseData.dialogues[npc.dialogue], onClose };
    this.showNode(this.dialogue.tree.start);
  }

  showNode(nodeId) {
    const { npc, tree } = this.dialogue;
    const node = tree.nodes[nodeId];
    if (!node) throw new Error(`Dialogknoten fehlt: ${nodeId}`);
    this.state.enterDialogueNode(node);
    let choices = (node.choices ?? []).filter((c) => this.state.isChoiceAvailable(c));
    if (choices.length === 0) choices = [{ text: node.ending ? 'Weiter' : 'Ende' }];
    this.dialogue.choices = choices;
    const el = this.open('dialogue', `
      <div class="speaker">${esc(npc.name)} <span class="role">${esc(npc.role ?? '')}</span></div>
      <div class="text">${paragraphs(node.text)}</div>
      <ol class="choices">${choices.map((c, i) => `<li><button data-i="${i}"><span class="key">${i + 1}</span> ${esc(c.text)}</button></li>`).join('')}</ol>`, 'dialogue');
    el.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => this.choose(Number(b.dataset.i)); });
  }

  choose(i) {
    const choice = this.dialogue?.choices[i];
    if (!choice) return;
    if (choice.next) { this.showNode(choice.next); return; }
    const { onClose } = this.dialogue;
    this.dialogue = null;
    this.close();
    onClose?.();
  }

  // --- Notizbuch ---------------------------------------------------------------

  openNotebook() {
    this.selected = [];
    this.renderNotebook('');
  }

  renderNotebook(feedback) {
    const s = this.state;
    const c = s.caseData;
    const clueItems = s.clues.map((id) => `
      <li><button class="clue ${this.selected.includes(id) ? 'sel' : ''}" data-clue="${id}">${esc(s.clue(id).name)}</button></li>`).join('');
    const concl = s.conclusions.map((id) => `<li><strong>${esc(s.deduction(id).name)}</strong><br>${esc(s.deduction(id).text)}</li>`).join('');
    const detailId = this.selected[this.selected.length - 1];
    const el = this.open('notebook', `
      <h3>Notizbuch <span class="sub">${esc(c.title)}</span></h3>
      <div class="objective">${esc(c.objective)}</div>
      <div class="cols">
        <div class="col">
          <h4>Hinweise (${s.clues.length})</h4>
          <ul class="clues">${clueItems || '<li class="empty">Noch keine Hinweise.</li>'}</ul>
        </div>
        <div class="col">
          <h4>Schlussfolgerungen (${s.conclusions.length}/${c.deductions.length})</h4>
          <ul class="concl">${concl || '<li class="empty">Wähle zwei Hinweise aus und verknüpfe sie.</li>'}</ul>
        </div>
      </div>
      <div class="detail">${detailId ? esc(s.clue(detailId).text) : 'Klicke Hinweise an, um sie zu lesen. Mit zwei ausgewählten Hinweisen kannst du sie verknüpfen.'}</div>
      <div class="feedback">${feedback}</div>
      <div class="actions">
        <button class="primary" data-act="combine" ${this.selected.length === 2 ? '' : 'disabled'}>Verknüpfen <span class="key">V</span></button>
        <button data-act="close">Schließen <span class="key">J</span></button>
      </div>`, 'notebook');
    el.querySelectorAll('[data-clue]').forEach((b) => { b.onclick = () => this.toggleClue(b.dataset.clue); });
    el.querySelector('[data-act=combine]').onclick = () => this.combine();
    el.querySelector('[data-act=close]').onclick = () => this.close();
  }

  toggleClue(id) {
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
      none: 'Diese Hinweise ergeben zusammen keinen Sinn.',
    }[result];
    this.renderNotebook(msg);
  }

  // --- Ende -------------------------------------------------------------------

  showEnding(id) {
    const s = this.state;
    const end = s.caseData.endings[id];
    const el = this.open('ending', `
      <h1>${esc(end.title)}</h1>
      <div class="text">${paragraphs(end.text)}</div>
      <div class="footer">Schlussfolgerungen: ${s.conclusions.length}/${s.caseData.deductions.length} · Hinweise: ${s.clues.length}/${Object.keys(s.caseData.clues).length}</div>
      <button class="primary" data-act="restart">Noch einmal ermitteln <span class="key">R</span></button>`, `ending ending-${id}`);
    el.querySelector('[data-act=restart]').onclick = () => this.restart();
  }

  restart() {
    this.modal = null;
    this.layer.innerHTML = '';
    this.root.classList.remove('vision');
    this.onRestart();
  }

  // --- Tastatur ---------------------------------------------------------------

  onKey(e) {
    if (!this.modal || e.repeat) return;
    const k = e.key.toLowerCase();
    const confirm = k === 'e' || k === ' ' || k === 'enter';
    let handled = true;
    if (this.modal === 'title' && confirm) this.titleStart();
    else if (this.modal === 'message' && (confirm || k === 'escape')) this.close();
    else if (this.modal === 'dialogue' && /^[1-9]$/.test(k)) this.choose(Number(k) - 1);
    else if (this.modal === 'dialogue' && confirm && this.dialogue?.choices.length === 1) this.choose(0);
    else if (this.modal === 'notebook' && (k === 'j' || k === 'tab' || k === 'escape')) this.close();
    else if (this.modal === 'notebook' && k === 'v') this.combine();
    else if (this.modal === 'ending' && k === 'r') this.restart();
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  }
}
