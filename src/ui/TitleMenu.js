import { getLang, setLang } from '../core/I18n.js';
import { TITLE_LAYERS, CANAL_TITLE_LAYERS, dmTitleLayers, spielstandUrl, DM_CITIES, SPRITE_BASE, P2_LOOKS } from '../world/assets.js';

/**
 * Hauptmenü (Titelbildschirm): animierte Kulisse, Titel-Schriftzug und ein Menü, das sich mit Maus, Touch,
 * Tastatur (Pfeile/WASD, Enter/E, Esc) und Gamepad (Steuerkreuz/Stick, A, B) bedienen lässt.
 * Ansichten: Hauptmenü, Spielstände, Koop, Optionen, Credits. Ui.showTitle() ruft showTitleMenu() auf.
 */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
/** spielstand_marken.png: 12 Marken à 16 px (Kapitel 1–6, Koop, Pfad, Sequenz, Nachspiel, Verzicht, Seq 1). */
const mark = (i, title = '') => `<span class="tm-mark" style="background-position:${((i / 11) * 100).toFixed(2)}% 0" title="${esc(title)}"></span>`;
const VOL_STEPS = 10;

const CREDITS = [
  ['Idee, Spielleitung und jede Entscheidung', ['Seb']],
  ['Programmierung, Geschichten und Rätsel', ['Claude']],
  ['Pixelgrafik', ['Codex', 'Grok']],
  ['Musik', ['Notendaten von Codex, im Browser gespielt']],
  ['Technik', ['Phaser 3', 'Schrift: Pixelify Sans (SIL Open Font License)']],
  ['Dank', ['an alle, die nachts noch eine Laterne anzünden']],
];

export function showTitleMenu(ui, view = 'main', { sel = 0, focus = null, notice = '' } = {}) {
  const c = ui.state.content;
  const slots = ui.slots();
  const active = ui.activeSlot();
  const saved = slots.find((x) => x.n === active)?.save ?? null;
  const anySave = slots.some((x) => x.save);
  const city = saved?.map ? (c.maps[saved.map]?.city ?? 'kettlegate') : null;
  const free = saved ? (slots.find((x) => !x.save)?.n ?? null) : active;
  ui.titleView = view;

  // E/Enter auf dem Hauptmenü ohne Auswahl, N: neues Spiel (bleiben wie früher)
  ui.titleContinue = saved ? () => start(ui, () => { ui.close(); ui.onContinue(active); }) : null;
  ui.titleNew = (n = free, opts = {}) => {
    if (n == null) { showTitleMenu(ui, 'slots', { notice: 'Alle drei Plätze sind belegt. Wähle einen Platz zum Überschreiben.' }); return; }
    start(ui, () => {
      ui.testArmed = true;
      ui.close();
      ui.onNewGame(n, opts);
      ui.showMessage(c.start.intro_title, c.start.intro, { scene: 'kapitel1_karte', footer: ui.touch ? 'Tipp: Im Notizbuch (Knopf oben rechts) siehst du deine Aufträge.' : 'Tipp: Im Notizbuch (J) siehst du deine Aufträge.' });
    });
  };

  const item = (act, label, { sub = '', cls = '', attrs = '' } = {}) => `<button class="tm-item ${cls}" data-act="${act}" ${attrs}><span class="tm-flame"></span><span class="tm-label">${label}</span>${sub ? `<small class="tm-sub">${sub}</small>` : ''}</button>`;
  const back = () => item('back', 'Zurück', { cls: 'tm-back' });
  const lang = () => {
    const en = getLang() === 'en';
    return item('lang', `${en ? 'Language' : 'Sprache'}: ${en ? '<span class="muted">Deutsch</span> · <b>English</b>' : '<b>Deutsch</b> · <span class="muted">English</span>'}`, { attrs: 'data-no-tr data-lr="1"' });
  };

  let body = '';
  if (view === 'main') {
    body = `<nav class="tm-menu">
      ${saved ? item('continue', 'Fortsetzen', { sub: slotInfo(ui, saved), cls: 'tm-primary' }) : ''}
      ${item('new', 'Neues Spiel', { cls: saved ? '' : 'tm-primary' })}
      ${anySave ? item('slots', 'Spielstände') : ''}
      ${item('koop', 'Zu zweit spielen')}
      ${item('options', 'Optionen')}
      ${lang()}
      ${item('credits', 'Mitwirkende')}
    </nav>`;
  } else if (view === 'slots') {
    body = `<h3 class="tm-head">Spielstände</h3>${notice ? `<p class="tm-notice">${esc(notice)}</p>` : ''}
      <div class="tm-slots">${slots.map(({ n, save: d }) => slotCard(ui, n, d, n === active)).join('')}</div>
      <nav class="tm-menu tm-row">${back()}</nav>`;
  } else if (view === 'koop') {
    body = `<h3 class="tm-head">Zu zweit spielen</h3>
      <p class="tm-text">Zwei Ermittler an einem Rechner: Spieler 2 läuft mit, hat eigenes Leben, eigenes Inventar und einen eigenen Pfad. Geld, Ansehen und Fälle teilt ihr.</p>
      <nav class="tm-menu">
        ${saved ? item('continue2', 'Fortsetzen zu zweit', { sub: slotInfo(ui, saved), cls: 'tm-primary' }) : ''}
        ${item('new2', 'Neues Spiel zu zweit', { cls: saved ? '' : 'tm-primary' })}
        ${back()}
      </nav>
      <div class="tm-text muted tm-small">Spieler 2: <span class="key">Pfeile</span> laufen · <span class="key">Enter</span> handeln · oder ein Gamepad. Später jederzeit dazuholen oder entfernen mit <span class="key">Esc</span>.</div>`;
  } else if (view === 'options') {
    const l = ui.audio?.levels ?? { master: 0.8, musik: 0.65, effekte: 0.8 };
    body = `<h3 class="tm-head">Optionen</h3>
      <nav class="tm-menu">
        ${ui.canFullscreen?.() !== false ? item('fullscreen', ui.fullscreenLabel()) : ''}
        ${slider('master', 'Lautstärke', l.master)}
        ${slider('musik', 'Musik', l.musik)}
        ${slider('effekte', 'Geräusche', l.effekte)}
        ${lang()}
        ${back()}
      </nav>`;
  } else if (view === 'credits') {
    body = `<nav class="tm-menu tm-row">${back()}</nav>`;
  }

  const kicker = { wexmoor: 'Ein Mystery in Wexmoor', dunscar: 'Ein Mystery in Dunscar', calderwick: 'Ein Mystery in Calderwick', briarholt: 'Ein Mystery in Briarholt', varrowmouth: 'Ein Mystery in Varrowmouth' }[city] ?? 'Ein Mystery in Kettlegate';
  const card = city && spielstandUrl(city) && view === 'main' ? `<div class="savecard"><img src="${spielstandUrl(city)}" alt="" onerror="this.parentNode.remove()"><span>${esc(c.maps[saved.map]?.name ?? '')}</span></div>` : '';
  const credits = view === 'credits' ? creditsHtml(c.title) : '';
  const el = ui.open('title', `
    <div class="tm-left tm-view-${view}">
      <header class="tm-logo">
        <span class="tm-kicker">${kicker}</span>
        <h1 class="tm-title" data-text="${esc(c.title)}">${esc(c.title)}</h1>
        <span class="tm-orn"></span>
      </header>
      <div class="tm-body">${body}</div>
    </div>
    ${card}${credits}
    <footer class="tm-foot">
      <span class="no-touch"><span class="key">↑</span><span class="key">↓</span> wählen · <span class="key">Enter</span> bestätigen · <span class="key">Esc</span> zurück · Gamepad: <span class="key">A</span> / <span class="key">B</span></span>
      <span class="touch-only">Tippen zum Wählen</span>
      <span class="tm-stamp">Stand <span data-no-tr>${esc(typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev')}</span></span>
    </footer>`, 'title titlemenu');
  // Kulisse: Stadt des letzten Spielstands; ganz ohne Spielstand der Kanal mit den Gaslaternen. Beim Wechsel der Ansicht bleibt sie stehen.
  if (ui.titleSceneOn) ui.attachTitleScene(ui.titleSceneOn);
  else {
    const layers = !anySave ? CANAL_TITLE_LAYERS : dmTitleLayers(city, { warm: /__warm$/.test(saved?.map ?? '') }) ?? TITLE_LAYERS;
    ui.titleSceneOn = ui.titleScene(layers, { extra: titleMotes() });
  }
  ui.titleMusic = city === 'varrowmouth' ? 'titel_k6' : null;
  ui.layer.classList.add('tm-layer');
  if (ui.titleFirst !== false && !ui.booting) { ui.layer.classList.add('tm-intro'); ui.titleFirst = false; setTimeout(() => ui.layer.classList.remove('tm-intro'), 2600); }

  bind(ui, el, { slots, saved, active, view });
  const items = [...el.querySelectorAll('.tm-item')];
  const f = focus ? items.findIndex((b) => b.dataset.act === focus) : -1;
  ui.titleSel = undefined;
  focusItem(ui, f >= 0 ? f : Math.min(sel, items.length - 1), true);
  pollGamepad(ui);
}

/** Ort · Pfad Seq · Spielzeit eines Spielstands (eine Zeile). */
function slotInfo(ui, d) {
  const c = ui.state.content;
  const ort = c.maps[d.map]?.name ?? '';
  const pfad = d.pathway?.id ? `<span>${esc(c.pathways?.[d.pathway.id]?.name ?? '')}</span> <span>Seq ${d.pathway.seq}</span>` : '';
  const min = Math.floor((d.playTime ?? 0) / 60);
  const zeit = `<span>${Math.floor(min / 60)} Std ${min % 60} Min</span>`;
  return [ort ? `<span>${esc(ort)}</span>` : '', pfad, zeit].filter(Boolean).join(' · ');
}

/** Spielstand-Karte: Mini-Bild der Stadt, Kapitel- und Koop-Marke, Laden / Neu / Löschen. */
function slotCard(ui, n, d, active) {
  const c = ui.state.content;
  const btn = (act, label, cls = '') => `<button class="tm-item tm-btn ${cls}" data-act="${act}" data-slot="${n}" data-label="${label}"><span class="tm-label">${label}</span></button>`;
  const city = d?.map ? (c.maps[d.map]?.city ?? 'kettlegate') : null;
  const ch = Math.max(0, DM_CITIES.indexOf(city));
  const pic = city && spielstandUrl(city) ? `<img class="tm-slotpic" src="${spielstandUrl(city)}" alt="" onerror="this.remove()">` : '<span class="tm-slotpic tm-empty"></span>';
  return `<div class="tm-slot${active ? ' active' : ''}${d ? '' : ' empty'}" data-slot="${n}">
    ${pic}
    <div class="tm-slotmain">
      <div class="tm-slotname"><span>Platz ${n}</span>${d ? mark(ch, `Kapitel ${ch + 1}`) : ''}${d?.p2?.active ? mark(6, 'Koop') : ''}</div>
      <div class="tm-slotinfo">${d ? slotInfo(ui, d) : '<span class="muted">leer</span>'}</div>
      <div class="tm-slotbtns">${d ? btn('load', 'Laden', active ? 'tm-primary' : '') : ''}${btn('slotnew', 'Neu', d ? '' : 'tm-primary')}${d ? btn('delete', 'Löschen') : ''}</div>
    </div>
  </div>`;
}

function slider(key, label, value) {
  const steps = Math.round((value ?? 0) * VOL_STEPS);
  return `<button class="tm-item tm-slider" data-act="vol" data-vol="${key}" data-lr="1"><span class="tm-flame"></span><span class="tm-label">${label}</span>
    <span class="tm-rail"><span class="tm-fill" style="width:${steps * 10}%"></span><span class="tm-knob" style="left:${steps * 10}%"></span></span>
    <span class="tm-pct">${steps * 10} %</span></button>`;
}

/** Credits: Rahmen aus dem Abspann-Paket (DM), Ornament-Trenner zwischen den Abschnitten, Text läuft langsam nach oben. */
function creditsHtml(title) {
  const parts = CREDITS.map(([h, names], i) => `<span class="tm-trenner" style="background-position:${(i % 6) * 20}% 0"></span><h4>${h}</h4>${names.map((x) => `<div>${esc(x)}</div>`).join('')}`).join('');
  return `<div class="tm-credits"><div class="tm-credits-win"><div class="tm-credits-roll">
    <h2>${esc(title)}</h2>${parts}<span class="tm-trenner" style="background-position:100% 0"></span><p class="muted">Danke fürs Spielen.</p>
  </div></div></div>`;
}

/** Abspann nach oben rollen, immer um ganze Spielpixel (1em = 8 px), sonst flimmert die Pixelschrift. */
function rollCredits(ui, roll) {
  if (!roll) return;
  const win = roll.parentNode;
  const still = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (still) { win.style.overflow = 'auto'; return; }
  const t0 = performance.now();
  const step = (t) => {
    if (!roll.isConnected) return;
    const px = parseFloat(getComputedStyle(roll).fontSize); // CSS-Pixel je em (= 8 Spielpixel)
    const start = (win.clientHeight / px) * 8 * 0.55; // in Spielpixeln: knapp unter der Mitte des Fensters beginnen
    const end = -(roll.offsetHeight / px) * 8;
    const dist = (win.clientHeight / px) * 8 - end; // nach dem ersten Durchlauf von ganz unten
    const run = ((t - t0) / 1000) * 14; // 14 Spielpixel je Sekunde
    const y = Math.round(run < start - end ? start - run : (win.clientHeight / px) * 8 - ((run - (start - end)) % dist));
    roll.style.transform = `translateY(${y / 8}em)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function bind(ui, el, { slots = [], saved = null, active = 1, view, re = (v, opts) => showTitleMenu(ui, v, opts), extra = null }) {
  const items = () => [...el.querySelectorAll('.tm-item')];
  // Überschreiben und Löschen brauchen eine zweite Bestätigung
  const armed = (btn, run) => {
    if (btn.dataset.armed) return run();
    el.querySelectorAll('[data-armed]').forEach((b) => { delete b.dataset.armed; b.querySelector('.tm-label').textContent = b.dataset.label; });
    btn.dataset.armed = '1';
    btn.querySelector('.tm-label').textContent = 'Sicher? Nochmal klicken';
  };
  const act = (btn, dir = 0) => {
    const a = btn.dataset.act;
    const n = Number(btn.dataset.slot);
    const has = !!slots.find((x) => x.n === n)?.save;
    if (dir && a !== 'vol' && a !== 'lang') return false;
    if (extra?.(a, btn)) return true;
    if (a === 'continue') ui.titleContinue?.();
    else if (a === 'new') ui.titleNew();
    else if (a === 'slots') re('slots', { sel: 0 });
    else if (a === 'koop') re('koop');
    else if (a === 'options') re('options');
    else if (a === 'credits') re('credits');
    else if (a === 'back') re('main', { focus: view });
    else if (a === 'continue2') start(ui, () => { ui.close(); ui.onContinue(active, { koop: true }); });
    else if (a === 'new2') ui.titleNew(undefined, { koop: true });
    else if (a === 'load') start(ui, () => { ui.close(); ui.onContinue(n); });
    else if (a === 'slotnew') { if (has) armed(btn, () => ui.titleNew(n)); else ui.titleNew(n); }
    else if (a === 'quit') armed(btn, () => { ui.layer.classList.add('tm-out'); ui.titleLeaving = true; setTimeout(() => ui.onQuitToTitle(), 450); });
    else if (a === 'delete') armed(btn, () => { ui.onDeleteSlot(n); re('slots', { sel: 0 }); });
    else if (a === 'fullscreen') { ui.toggleFullscreen(); setTimeout(() => { const l = btn.querySelector('.tm-label'); if (l) l.textContent = ui.fullscreenLabel(); }, 300); }
    else if (a === 'lang') { setLang(getLang() === 'en' ? 'de' : 'en'); re(view, { sel: items().indexOf(btn) }); }
    else if (a === 'vol') {
      if (!ui.audio) return true;
      const key = btn.dataset.vol;
      const cur = Math.round((ui.audio.levels?.[key] ?? 0) * VOL_STEPS);
      const next = dir ? Math.max(0, Math.min(VOL_STEPS, cur + dir)) : (cur >= VOL_STEPS ? 0 : cur + 1);
      ui.audio.setVolumes({ [key]: next / VOL_STEPS });
      btn.outerHTML = slider(key, btn.querySelector('.tm-label').textContent, next / VOL_STEPS);
      const fresh = el.querySelector(`[data-vol=${key}]`);
      wire(fresh);
      focusItem(ui, items().indexOf(fresh));
    }
    return true;
  };
  const wire = (btn) => {
    btn.addEventListener('click', (e) => {
      // Schieberegler: Klick auf die Schiene setzt den Wert direkt
      const rail = btn.querySelector('.tm-rail');
      if (rail && e.target.closest('.tm-rail') && ui.audio) {
        const r = rail.getBoundingClientRect();
        const v = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * VOL_STEPS);
        const cur = Math.round((ui.audio.levels?.[btn.dataset.vol] ?? 0) * VOL_STEPS);
        act(btn, v - cur || 0);
        return;
      }
      act(btn);
    });
    btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') focusItem(ui, items().indexOf(btn), true); });
  };
  items().forEach(wire);
  ui.titleAct = act;
  if (view === 'credits') {
    el.querySelector('.tm-credits')?.addEventListener('click', () => act(el.querySelector('[data-act=back]')));
    rollCredits(ui, el.querySelector('.tm-credits-roll'));
  }
}

function focusItem(ui, i, quiet = false) {
  const items = [...ui.layer.querySelectorAll('.tm-item')];
  if (!items.length) return;
  const n = ((i % items.length) + items.length) % items.length;
  if (ui.titleSel === n && items[n].classList.contains('sel')) return;
  items.forEach((b, k) => b.classList.toggle('sel', k === n));
  if (!quiet && ui.titleSel !== undefined && ui.titleSel !== n) ui.sfx?.('ui_hover');
  ui.titleSel = n;
  items[n].scrollIntoView?.({ block: 'nearest' });
}

/** Übergang ins Spiel: Kulisse blendet ins Schwarze, danach öffnet sich das Bild wieder. */
function start(ui, run) {
  if (ui.titleLeaving) return;
  ui.titleLeaving = true;
  ui.layer.classList.add('tm-out');
  setTimeout(() => {
    ui.titleLeaving = false;
    ui.titleSceneOn = null;
    ui.layer.classList.remove('tm-out', 'tm-layer');
    run();
    const curtain = document.createElement('div');
    curtain.className = 'tm-curtain';
    ui.root.appendChild(curtain);
    setTimeout(() => curtain.remove(), 1000);
  }, 550);
}

/** Tastatur im Hauptmenü. Gibt true zurück, wenn die Taste verbraucht wurde. */
export function titleKey(ui, k) {
  if (ui.titleLeaving || ui.booting) return true; // während des Ladebildschirms keine Eingaben
  const items = [...ui.layer.querySelectorAll('.tm-item')];
  const cur = items[ui.titleSel] ?? items[0];
  if (k === 'arrowup' || k === 'w') focusItem(ui, ui.titleSel - 1);
  else if (k === 'arrowdown' || k === 's') focusItem(ui, ui.titleSel + 1);
  else if (k === 'arrowleft' || k === 'a' || k === 'arrowright' || k === 'd') {
    const dir = k === 'arrowleft' || k === 'a' ? -1 : 1;
    if (!(cur?.dataset.lr && ui.titleAct?.(cur, dir))) focusItem(ui, ui.titleSel + dir);
  } else if (k === 'e' || k === ' ' || k === 'enter') { ui.sfx?.('ui_klick'); if (cur) cur.click(); else (ui.titleContinue ?? ui.titleNew)?.(); }
  else if (k === 'n' && ui.modal === 'title' && ui.titleView === 'main') ui.titleNew();
  else if ((k === 'escape' || k === 'backspace') && ui.titleView !== 'main') { const b = ui.layer.querySelector('[data-act=back]'); if (b) ui.titleAct?.(b); }
  else if (k === 'escape' && ui.modal === 'pause') ui.close();
  else return false;
  return true;
}

/** Gamepad im Menü: Steuerkreuz oder linker Stick wählen (mit Wiederholung), A bestätigt, B geht zurück. */
function pollGamepad(ui) {
  if (ui.titlePadLoop || typeof navigator === 'undefined' || !navigator.getGamepads) return;
  let last = {};
  let nextRepeat = 0;
  const tick = (t) => {
    if (ui.modal !== 'title' && ui.modal !== 'pause') { ui.titlePadLoop = null; return; }
    ui.titlePadLoop = requestAnimationFrame(tick);
    const pad = [...navigator.getGamepads()].find(Boolean);
    if (!pad) return;
    const b = (i) => !!pad.buttons[i]?.pressed;
    const ax = pad.axes[0] ?? 0, ay = pad.axes[1] ?? 0;
    const now = { up: b(12) || ay < -0.55, down: b(13) || ay > 0.55, left: b(14) || ax < -0.55, right: b(15) || ax > 0.55, a: b(0), b: b(1), start: b(9) };
    const keys = { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright', a: 'enter', start: 'enter', b: 'escape' };
    for (const [name, key] of Object.entries(keys)) {
      const fresh = now[name] && !last[name];
      const repeat = now[name] && last[name] && ['up', 'down', 'left', 'right'].includes(name) && t >= nextRepeat;
      if (fresh || repeat) {
        titleKey(ui, key);
        nextRepeat = t + (fresh ? 380 : 130);
      }
    }
    last = now;
  };
  ui.titlePadLoop = requestAnimationFrame(tick);
}

/** Pixel-Schwebeteilchen (okkultes Türkis und Laternen-Bernstein) über der Kulisse. */
export function titleMotes(n = 16) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = (i * 37 + 11) % 100;
    const d = 9 + ((i * 7) % 9);
    out += `<i class="tm-mote${i % 3 ? '' : ' amber'}" style="left:${x}%;animation-duration:${d}s;animation-delay:${-((i * 2.3) % d).toFixed(1)}s"></i>`;
  }
  return `<div class="tm-motes">${out}</div>`;
}

export const TITLE_MARKS_URL = `${SPRITE_BASE}ui/spielstand_marken.png`;

/**
 * Pausemenü (Esc) im Stil des Hauptmenüs: das Spiel dahinter wird abgedunkelt und weichgezeichnet,
 * links Schriftzug und Menü, rechts Begrüßung von Spieler 2, Figurenwahl oder die Steuerung.
 */
export function showPauseMenu(ui, feedback = '', { view = 'main', focus = null, sel = 0 } = {}) {
  const s = ui.state;
  const on = s.hasP2();
  const p2label = on ? 'Spieler 2 entfernen' : s.p2 ? 'Spieler 2 wieder hinzufügen' : 'Spieler 2 hinzufügen';
  const pad = typeof navigator !== 'undefined' && [...(navigator.getGamepads?.() ?? [])].some(Boolean);
  ui.titleView = view;
  const item = (act, label, { sub = '', cls = '', attrs = '' } = {}) => `<button class="tm-item ${cls}" data-act="${act}" ${attrs}><span class="tm-flame"></span><span class="tm-label">${label}</span>${sub ? `<small class="tm-sub">${sub}</small>` : ''}</button>`;
  const lang = () => {
    const en = getLang() === 'en';
    return item('lang', `${en ? 'Language' : 'Sprache'}: ${en ? '<span class="muted">Deutsch</span> · <b>English</b>' : '<b>Deutsch</b> · <span class="muted">English</span>'}`, { attrs: 'data-no-tr data-lr="1"' });
  };
  let menu = '';
  let side = '';
  if (view === 'main') {
    menu = `${item('resume', 'Weiter', { cls: 'tm-primary' })}
      ${item('p2', p2label, { sub: on ? 'Ihr spielt zu zweit an diesem Rechner' : 'Zu zweit an einem Rechner' })}
      ${item('controls', 'Steuerung')}
      ${item('options', 'Optionen')}
      ${ui.onQuitToTitle ? item('quit', 'Zum Hauptmenü', { sub: 'Der Spielstand wird vorher gespeichert', attrs: 'data-label="Zum Hauptmenü"' }) : ''}
      ${ui.state.testmodus ? item('testreise', 'Testreise', { attrs: 'data-no-tr' }) : ''}`;
    side = `${feedback ? `<div class="pm-feedback">${feedback}</div>` : ''}
      ${on ? ui.p2LookPicker() : ''}
      <p class="pm-lead">${on ? 'Die Kamera hält euch beide im Bild, jeder hat sein eigenes Inventar. Geld, Ansehen und Fälle teilt ihr.' : 'Spieler 2 läuft als Begleiter mit über denselben Bildschirm, mit eigenem Leben und eigenem Inventar.'}</p>`;
  } else if (view === 'options') {
    const l = ui.audio?.levels ?? { master: 0.8, musik: 0.65, effekte: 0.8 };
    menu = `${ui.canFullscreen?.() !== false ? item('fullscreen', ui.fullscreenLabel()) : ''}
      ${slider('master', 'Lautstärke', l.master)}${slider('musik', 'Musik', l.musik)}${slider('effekte', 'Geräusche', l.effekte)}
      ${lang()}${item('back', 'Zurück', { cls: 'tm-back' })}`;
  } else if (view === 'controls') {
    menu = item('back', 'Zurück', { cls: 'tm-back' });
    side = `<div class="controls2 pm-controls">
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
      </div>
      <div class="touch-only pm-lead">Tippen: laufen, sprechen, untersuchen. Knöpfe oben rechts: Notizbuch, Menü und mehr.</div>`;
  }
  const place = s.content.maps?.[s.map]?.name ?? '';
  const el = ui.open('pause', `
    <div class="tm-left pm-left tm-view-${view === 'main' ? 'main' : 'sub'}">
      <header class="tm-logo">
        <span class="tm-kicker">${esc(place)}</span>
        <h1 class="tm-title" data-text="Pause">Pause</h1>
        <span class="tm-orn"></span>
      </header>
      <div class="tm-body"><nav class="tm-menu">${menu}</nav></div>
    </div>
    ${side ? `<aside class="pm-side${view === 'controls' ? ' wide' : ''}">${side}</aside>` : ''}
    <footer class="tm-foot">
      <span class="no-touch"><span class="key">↑</span><span class="key">↓</span> wählen · <span class="key">Enter</span> bestätigen · <span class="key">Esc</span> ${view === 'main' ? 'weiterspielen' : 'zurück'} · <span class="key">2</span> Spieler 2</span>
      <span class="touch-only">Tippen zum Wählen</span>
    </footer>`, 'titlemenu pausemenu2');
  ui.layer.classList.add('tm-layer', 'pm-layer');
  if (ui.pauseFresh) { ui.layer.classList.add('pm-intro'); setTimeout(() => ui.layer.classList.remove('pm-intro'), 500); ui.pauseFresh = false; }
  el.querySelectorAll('[data-look]').forEach((b) => b.classList.add('tm-item', 'tm-btn'));
  bind(ui, el, {
    view,
    re: (v, opts = {}) => showPauseMenu(ui, '', { view: v, ...opts }),
    extra: (a, btn) => {
      if (a === 'resume') ui.close();
      else if (a === 'p2') ui.togglePlayer2();
      else if (a === 'controls') showPauseMenu(ui, '', { view: 'controls' });
      else if (a === 'options') showPauseMenu(ui, '', { view: 'options' });
      else if (a === 'back') showPauseMenu(ui, '', { focus: view });
      else if (btn.dataset.look) { s.setP2Look(btn.dataset.look); ui.openPause(`Spieler 2 spielt jetzt mit ${P2_LOOKS[btn.dataset.look].name}.`); }
      else if (a === 'testreise') return true; // eigene Klick-Handler (TestUi, Figurenwahl)
      else return false;
      return true;
    },
  });
  const items = [...el.querySelectorAll('.tm-item')];
  const f = focus ? items.findIndex((b) => b.dataset.act === focus) : -1;
  ui.titleSel = undefined;
  focusItem(ui, f >= 0 ? f : sel, true);
  pollGamepad(ui);
  return el;
}
