// Online-Koop (erste Fassung): Der Host spielt das Spiel wie im lokalen Koop, Spieler 2 sitzt aber an einem anderen Rechner.
//
// Aufbau (Host entscheidet alles):
// - Treffpunkt: Raumcode über Supabase Realtime (Signal.js), nur für den Verbindungsaufbau.
// - Danach eine direkte WebRTC-Verbindung: Der Host schickt sein Spielbild (Canvas als Video, 480x270) und den Inhalt seiner
//   Bedienoberfläche (HTML von #ui) zum Gast. Der Gast schickt Tasten, Gamepad und Klicks zurück.
// - Beim Host kommen die Tasten des Gastes als Tasten von Spieler 2 an (keys.js). Damit gelten alle Regeln des lokalen
//   Koops unverändert: eigene Figur, eigenes Inventar, eigener Pfad, Kampf zu zweit, Splitscreen in Calderwick.
import { openSignal } from './Signal.js';
import { ICE_SERVERS } from './config.js';
import { makeRoomCode, translateGuestKey, padCodes, GUEST_CAPTURE } from './keys.js';
import { morphChildren, elementPath, resolvePath } from './morph.js';
import { tr } from '../core/I18n.js';

const CHUNK = 60000; // Zeichen je Nachricht im Datenkanal (große Oberflächen werden aufgeteilt)
const UI_EVERY = 70; // ms: so oft höchstens ein Oberflächen-Update
const JOIN_EVERY = 1500;
const JOIN_TIMEOUT = 15000;
const rid = () => Math.random().toString(36).slice(2, 10);

/** Gemeinsame Teile: Datenkanal mit Aufteilung großer Nachrichten. */
function wireChannel(dc, onMsg) {
  const parts = new Map();
  dc.onmessage = (e) => {
    let m;
    try { m = JSON.parse(e.data); } catch { return; }
    if (m.t === 'part') {
      const buf = parts.get(m.id) ?? [];
      buf[m.i] = m.s;
      parts.set(m.id, buf);
      if (buf.filter((x) => x !== undefined).length === m.n) { parts.delete(m.id); try { onMsg(JSON.parse(buf.join(''))); } catch { /* kaputt */ } }
      return;
    }
    onMsg(m);
  };
  return (m) => {
    if (dc.readyState !== 'open') return;
    const s = JSON.stringify(m);
    if (s.length <= CHUNK) { dc.send(s); return; }
    const id = rid();
    const n = Math.ceil(s.length / CHUNK);
    for (let i = 0; i < n; i++) dc.send(JSON.stringify({ t: 'part', id, i, n, s: s.slice(i * CHUNK, (i + 1) * CHUNK) }));
  };
}

// --- Host ------------------------------------------------------------------------------------------------------------

export class OnlineHost {
  /** ctx: { game, ui, state }. onStatus(status, info) meldet: 'open' (Code steht), 'connecting', 'connected', 'left', 'error'. */
  constructor(ctx, onStatus = () => {}) {
    this.ctx = ctx;
    this.onStatus = onStatus;
    this.code = null;
    this.status = 'idle';
    this.guest = null; // Kennung des verbundenen Gastes
    this.held = new Set(); // vom Gast gehaltene Pfeiltasten (beim Trennen loslassen)
  }

  async open() {
    this.code = makeRoomCode();
    this.setStatus('opening');
    try {
      this.sig = await openSignal(this.code, (m) => this.onSignal(m));
    } catch (e) {
      this.setStatus('error', String(e?.message ?? e));
      return false;
    }
    this.setStatus('open');
    return true;
  }

  setStatus(s, info) { this.status = s; this.info = info; this.onStatus(s, info); }

  async onSignal(m) {
    if (!m || m.to && m.to !== 'host') return;
    if (m.type === 'join') {
      if (this.guest && this.guest !== m.from && this.status === 'connected') { this.sig.send({ type: 'full', to: m.from }); return; }
      if (this.guest === m.from && this.pc) return; // wiederholtes Anklopfen, Angebot ist schon unterwegs
      this.startPeer(m.from);
    } else if (m.from === this.guest && this.pc) {
      if (m.type === 'answer') await this.pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }).catch(() => {});
      else if (m.type === 'ice' && m.cand) await this.pc.addIceCandidate(m.cand).catch(() => {});
      else if (m.type === 'bye') this.dropGuest();
    }
  }

  async startPeer(guestId) {
    this.dropPeer();
    this.guest = guestId;
    this.setStatus('connecting');
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.pc = pc;
    const canvas = this.ctx.game.canvas;
    const stream = canvas.captureStream(30);
    const track = stream.getVideoTracks()[0];
    if (track) {
      try { track.contentHint = 'detail'; } catch { /* alt */ }
      this.sender = pc.addTrack(track, stream);
    }
    const dc = pc.createDataChannel('koop', { ordered: true });
    this.dc = dc;
    this.send = wireChannel(dc, (msg) => this.onGuestMsg(msg));
    dc.onopen = () => this.onConnected();
    dc.onclose = () => { if (this.pc === pc) this.dropGuest(); };
    pc.onicecandidate = (e) => { if (e.candidate) this.sig?.send({ type: 'ice', to: guestId, cand: e.candidate.toJSON() }); };
    pc.onconnectionstatechange = () => {
      if (this.pc !== pc) return;
      if (pc.connectionState === 'failed') { this.dropGuest(); this.setStatus('error', 'p2p'); }
      else if (pc.connectionState === 'closed') this.dropGuest();
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.sig?.send({ type: 'offer', to: guestId, sdp: offer.sdp });
  }

  async onConnected() {
    const { ui, state } = this.ctx;
    // Spielbild scharf halten: Auflösung vor Bildrate, genug Bandbreite für Pixelgrafik
    try {
      const p = this.sender?.getParameters();
      if (p) {
        p.degradationPreference = 'maintain-resolution';
        p.encodings = p.encodings?.length ? p.encodings : [{}];
        p.encodings[0].maxBitrate = 2500000;
        await this.sender.setParameters(p);
      }
    } catch { /* nicht jeder Browser kann das */ }
    if (!state.hasP2()) ui.togglePlayer2();
    ui.onlineP2 = true;
    // Eigene Pfeile/Enter/Ziffernblock des Hosts steuern in der Welt nicht mehr Spieler 2 (der sitzt am anderen Rechner)
    if (!this.blocker) {
      this.blocker = (e) => {
        if (e.fromGuest || this.status !== 'connected' || ui.modal || ui.halves?.[2]?.modal) return;
        if (e.key === 'Enter' || e.key?.startsWith('Arrow') || e.code?.startsWith('Numpad')) e.stopImmediatePropagation();
      };
      window.addEventListener('keydown', this.blocker, true);
      window.addEventListener('keyup', this.blocker, true);
    }
    this.setStatus('connected');
    this.mirror();
  }

  /** Oberfläche beobachten und gedrosselt an den Gast schicken. */
  mirror() {
    const root = this.ctx.ui.root;
    this.lastUi = null;
    const push = () => {
      this.uiTimer = null;
      const html = root.innerHTML;
      const cls = root.className;
      if (html === this.lastUi?.html && cls === this.lastUi?.cls) return;
      this.lastUi = { html, cls };
      this.send?.({ t: 'ui', html, cls });
    };
    this.observer?.disconnect();
    this.observer = new MutationObserver(() => { if (!this.uiTimer) this.uiTimer = setTimeout(push, UI_EVERY); });
    this.observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
    push();
  }

  /** Wo steht Spieler 2 gerade: Welt, Kampf oder ein Fenster? */
  context() {
    const ui = this.ctx.ui;
    const half = ui.halves?.[2];
    const modal = ui.modal || half?.modal || null;
    return { place: modal === 'combat' ? 'combat' : modal ? 'menu' : 'world', split: !!ui.halves, modal };
  }

  p2Scene() {
    const g = this.ctx.game;
    const w2 = g.scene.getScene('world2');
    if (w2?.sys.isActive() && w2.splitRole === 2) return w2;
    return g.scene.getScene('world');
  }

  combatScene() {
    const ui = this.ctx.ui;
    return ui.halves?.[2]?.combatScene ?? ui.combatScene ?? null;
  }

  onGuestMsg(m) {
    if (m.t === 'k') this.guestKey(m.code, !!m.d, m.key);
    else if (m.t === 'c') this.guestClick(m);
    else if (m.t === 'bye') this.dropGuest();
  }

  /** Taste des Gastes beim Host auslösen (als Taste von Spieler 2). */
  guestKey(code, down, key) {
    const ctx = this.context();
    const sc = this.combatScene();
    // Kampf zu zweit: im Auswahlmenü wählt der Gast nur, wenn Spieler 2 dran ist
    if (ctx.place === 'combat' && sc?.combat?.duo && sc.phase === 'menu' && sc.combat.actor !== 2 && /^(Digit|Pad)/.test(code)) return;
    for (const step of translateGuestKey(ctx, code, down, key)) {
      if (step.act) this.guestAct(step);
      else this.fire(step);
    }
  }

  fire({ type, code, key, keyCode }) {
    if (type === 'keydown') this.held.add(code); else this.held.delete(code);
    const e = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
    Object.defineProperty(e, 'keyCode', { get: () => keyCode });
    Object.defineProperty(e, 'which', { get: () => keyCode });
    e.fromGuest = true;
    window.dispatchEvent(e);
  }

  guestAct(step) {
    const scene = this.p2Scene();
    if (step.act === 'combatPad') { this.combatScene()?.padHandler?.(null, { index: step.button }); return; }
    if (step.act === 'talentMove') { scene?.ui?.moveTalentSel2?.(step.dir); return; }
    if (scene) scene.pending2 = step.act; // inventory, notebook, pathway, talent:sel (WorldScene.handleKeys)
  }

  /** Klick des Gastes auf seine Kopie der Oberfläche: dasselbe Element beim Host anklicken. */
  guestClick({ path, fx = 0.5, fy = 0.5 }) {
    const ui = this.ctx.ui;
    const el = resolvePath(ui.root, path);
    if (!el) return;
    const sc = this.combatScene();
    if (sc?.combat?.duo && sc.phase === 'menu' && sc.combat.actor !== 2 && el.closest('.cb-menu')) return; // Zug von Spieler 1
    const r = el.getBoundingClientRect();
    const opts = { bubbles: true, cancelable: true, clientX: r.left + r.width * fx, clientY: r.top + r.height * fy, button: 0 };
    el.dispatchEvent(new MouseEvent('click', opts));
  }

  releaseKeys() {
    for (const code of [...this.held]) this.fire({ type: 'keyup', code, key: code, keyCode: { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39 }[code] ?? 0 });
    this.held.clear();
  }

  dropPeer() {
    this.observer?.disconnect();
    this.observer = null;
    clearTimeout(this.uiTimer);
    this.uiTimer = null;
    this.releaseKeys();
    try { this.dc?.close(); } catch { /* egal */ }
    try { this.pc?.close(); } catch { /* egal */ }
    this.pc = null;
    this.dc = null;
    this.send = null;
  }

  /** Gast ist weg: Spieler 2 bleibt im Spiel (wie lokal), der Raum bleibt offen für einen neuen Versuch. */
  dropGuest() {
    const was = this.status === 'connected';
    this.dropPeer();
    this.guest = null;
    this.ctx.ui.onlineP2 = false;
    if (this.sig) this.setStatus(was ? 'left' : 'open');
  }

  close() {
    try { this.send?.({ t: 'bye' }); } catch { /* egal */ }
    this.dropPeer();
    this.guest = null;
    this.ctx.ui.onlineP2 = false;
    this.sig?.close();
    this.sig = null;
    if (this.blocker) { window.removeEventListener('keydown', this.blocker, true); window.removeEventListener('keyup', this.blocker, true); this.blocker = null; }
    this.setStatus('closed');
  }
}

// --- Gast ------------------------------------------------------------------------------------------------------------

export class OnlineGuest {
  /** ctx: { game, ui, music, frame }. onStatus: 'joining', 'connecting', 'connected', 'notfound', 'full', 'error', 'ended'. */
  constructor(ctx, onStatus = () => {}) {
    this.ctx = ctx;
    this.onStatus = onStatus;
    this.id = rid();
    this.status = 'idle';
    this.pendingIce = [];
  }

  setStatus(s, info) { this.status = s; this.info = info; this.onStatus(s, info); }

  async join(code) {
    this.code = code;
    this.setStatus('joining');
    try {
      this.sig = await openSignal(code, (m) => this.onSignal(m));
    } catch (e) {
      this.setStatus('error', String(e?.message ?? e));
      return;
    }
    const knock = () => this.sig?.send({ type: 'join', from: this.id, to: 'host' });
    knock();
    this.knocker = setInterval(knock, JOIN_EVERY);
    this.giveUp = setTimeout(() => { if (this.status === 'joining') { this.stopKnocking(); this.leave(); this.setStatus('notfound'); } }, JOIN_TIMEOUT);
  }

  stopKnocking() { clearInterval(this.knocker); clearTimeout(this.giveUp); }

  async onSignal(m) {
    if (!m || m.to !== this.id) return;
    if (m.type === 'full') { this.stopKnocking(); this.leave(); this.setStatus('full'); return; }
    if (m.type === 'offer') {
      if (this.pc) return;
      this.stopKnocking();
      this.setStatus('connecting');
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      this.pc = pc;
      pc.ontrack = (e) => { this.stream = e.streams[0] ?? new MediaStream([e.track]); if (this.video) this.video.srcObject = this.stream; };
      pc.ondatachannel = (e) => {
        this.dc = e.channel;
        this.send = wireChannel(this.dc, (msg) => this.onHostMsg(msg));
        this.dc.onopen = () => this.onConnected();
        this.dc.onclose = () => this.ended();
      };
      pc.onicecandidate = (e) => { if (e.candidate) this.sig?.send({ type: 'ice', from: this.id, to: 'host', cand: e.candidate.toJSON() }); };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') { if (this.status === 'connected') this.ended(); else { this.leave(); this.setStatus('error', 'p2p'); } }
      };
      await pc.setRemoteDescription({ type: 'offer', sdp: m.sdp });
      for (const c of this.pendingIce.splice(0)) await pc.addIceCandidate(c).catch(() => {});
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sig?.send({ type: 'answer', from: this.id, to: 'host', sdp: answer.sdp });
    } else if (m.type === 'ice' && m.cand) {
      if (this.pc?.remoteDescription) await this.pc.addIceCandidate(m.cand).catch(() => {});
      else this.pendingIce.push(m.cand);
    }
  }

  onConnected() {
    this.sig?.close(); // Treffpunkt wird nicht mehr gebraucht
    this.sig = null;
    this.enterView();
    this.setStatus('connected');
  }

  /** Gast-Ansicht: eigenes Spiel schlafen legen, Video statt Canvas, Oberfläche als Spiegel, Eingaben zum Host. */
  enterView() {
    const { game, ui, music, frame } = this.ctx;
    ui.netGuest = true;
    ui.close?.();
    ui.titleSceneOn = null;
    try { music?.stop?.(); } catch { /* egal */ }
    try { game?.loop?.sleep?.(); } catch { /* egal */ }
    document.documentElement.classList.add('net-guest');
    const video = document.createElement('video');
    video.className = 'net-video';
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    if (this.stream) video.srcObject = this.stream;
    frame.insertBefore(video, ui.root);
    this.video = video;
    this.baseClass = ui.root.className;
    ui.root.innerHTML = '';
    this.bindInput();
  }

  onHostMsg(m) {
    if (m.t === 'ui') {
      const root = this.ctx.ui.root;
      morphChildren(root, m.html);
      if (root.className !== m.cls) root.className = m.cls;
    } else if (m.t === 'bye') this.ended();
  }

  bindInput() {
    const root = this.ctx.ui.root;
    const down = new Set();
    const typing = (e) => e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA';
    this.onKeyDown = (e) => {
      if (typing(e) || e.ctrlKey || e.metaKey || e.altKey || e.code === 'F11' || e.code === 'F12' || e.code === 'F5') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat || down.has(e.code)) return;
      down.add(e.code);
      this.send?.({ t: 'k', code: e.code, key: e.key, d: 1 });
    };
    this.onKeyUp = (e) => {
      if (!down.has(e.code)) return;
      down.delete(e.code);
      if (GUEST_CAPTURE.has(e.code)) e.preventDefault();
      this.send?.({ t: 'k', code: e.code, key: e.key, d: 0 });
    };
    this.onBlur = () => { for (const code of down) this.send?.({ t: 'k', code, d: 0 }); down.clear(); };
    this.onClick = (e) => {
      if (this.endBox?.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target.nodeType === 1 ? e.target : e.target.parentElement;
      const path = elementPath(root, el);
      if (!path) return;
      const r = el.getBoundingClientRect();
      const fx = r.width ? (e.clientX - r.left) / r.width : 0.5;
      const fy = r.height ? (e.clientY - r.top) / r.height : 0.5;
      this.send?.({ t: 'c', path, fx, fy });
    };
    window.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('keyup', this.onKeyUp, true);
    window.addEventListener('blur', this.onBlur);
    root.addEventListener('click', this.onClick, true);
    // Gamepad des Gastes: gedrückte Knöpfe als virtuelle Tasten
    let last = new Set();
    const poll = () => {
      if (this.status !== 'connected') return;
      this.padLoop = requestAnimationFrame(poll);
      const pad = [...(navigator.getGamepads?.() ?? [])].find(Boolean);
      const now = padCodes(pad);
      for (const c of now) if (!last.has(c)) this.send?.({ t: 'k', code: c, d: 1 });
      for (const c of last) if (!now.has(c)) this.send?.({ t: 'k', code: c, d: 0 });
      last = now;
    };
    this.padLoop = requestAnimationFrame(poll);
  }

  unbindInput() {
    window.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('keyup', this.onKeyUp, true);
    window.removeEventListener('blur', this.onBlur);
    this.ctx.ui.root.removeEventListener('click', this.onClick, true);
    cancelAnimationFrame(this.padLoop);
  }

  /** Verbindung ist weg: Hinweis zeigen, Knopf lädt die Seite neu (zurück ins Hauptmenü). */
  ended() {
    if (this.status === 'ended') return;
    const wasConnected = this.status === 'connected';
    this.leave();
    this.setStatus('ended');
    if (!wasConnected) return;
    this.unbindInput();
    const box = document.createElement('div');
    box.className = 'net-ended';
    box.innerHTML = `<div class="net-ended-box"><h3>${tr('Verbindung beendet')}</h3><p>${tr('Der Host hat das Spiel verlassen oder die Verbindung ist abgerissen.')}</p><button type="button" class="primary">${tr('Zurück zum Hauptmenü')}</button></div>`;
    box.querySelector('button').addEventListener('click', () => location.reload());
    this.ctx.frame.appendChild(box);
    this.endBox = box;
  }

  leave() {
    this.stopKnocking();
    try { this.send?.({ t: 'bye' }); } catch { /* egal */ }
    try { this.dc?.close(); } catch { /* egal */ }
    try { this.pc?.close(); } catch { /* egal */ }
    this.pc = null;
    this.sig?.close();
    this.sig = null;
  }
}
