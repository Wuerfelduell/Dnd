/**
 * Ladebildschirm beim ersten Start. Das Gerüst steht in index.html (#boot), damit es sofort sichtbar ist;
 * hier kommt der Fortschritt der Phaser-Ladeliste (WorldScene.preload) dazu, wechselnde Hinweise und das Ausblenden,
 * sobald alles geladen ist und das Titelbild bereitsteht. Bis dahin nimmt das Titelmenü keine Eingaben an (ui.booting).
 */

/** Kurze Hinweise, die während des Ladens wechseln (Englisch über das Wörterbuch ladebildschirm.json). */
export const LADE_TIPPS = [
  'Gaslaternen werden entzündet …',
  'Der Nebel kriecht über das Kopfsteinpflaster …',
  'Akten werden sortiert, Spuren gesichert …',
  'Die Turmuhr von Kettlegate schlägt dreizehn …',
  'Zutaten werden abgewogen, Formeln geprüft …',
  'Irgendwo flüstert jemand deinen Namen …',
  'Die Fähre legt im Morgengrauen ab …',
  'Tinte trocknet auf frischen Steckbriefen …',
];

export const LADE_TEXTE = {
  spiel: 'Das Spiel wird geladen …',
  bilder: 'Bilder und Klänge werden geladen …',
  titel: 'Gleich geht es los …',
};

/**
 * Hängt sich an den Ladebildschirm aus index.html. Gibt ein Objekt zurück, das WorldScene.preload mit seinem
 * Loader füttert (attach) und das sich selbst ausblendet. Ohne #boot (Tests) passiert nichts.
 */
export function bootLoader(ui) {
  const el = typeof document !== 'undefined' ? document.getElementById('boot') : null;
  if (!el) return { attach() {}, done: Promise.resolve() };
  ui.booting = true;
  const q = (s) => el.querySelector(s);
  const text = q('.bt-text');
  const pct = q('.bt-prozent');
  const fill = q('.bt-fuell');
  const tipp = q('.bt-tipp');
  text.textContent = LADE_TEXTE.spiel;

  let tippAt = Math.floor(Math.random() * LADE_TIPPS.length);
  tipp.textContent = LADE_TIPPS[tippAt];
  const tippTimer = setInterval(() => {
    tipp.classList.add('weg');
    setTimeout(() => { tippAt = (tippAt + 1) % LADE_TIPPS.length; tipp.textContent = LADE_TIPPS[tippAt]; tipp.classList.remove('weg'); }, 400);
  }, 3600);

  let shown = 0;
  const show = (v) => {
    shown = Math.max(shown, Math.min(1, v)); // nie rückwärts
    fill.style.width = `${(shown * 100).toFixed(1)}%`;
    pct.textContent = `${Math.round(shown * 100)} %`;
  };
  show(0.02);

  let finish;
  const done = new Promise((r) => { finish = r; });
  let attached = false;
  // Sicherheitsnetz: hängt das Laden (kein Fortschritt mehr), geht der Bildschirm trotzdem weg, statt das Spiel zu verdecken
  let lastTick = Date.now();
  const watchdog = setInterval(() => { if (Date.now() - lastTick > 25000) hide(); }, 2000);

  let hidden = false;
  const hide = () => {
    if (hidden) return;
    hidden = true;
    clearInterval(tippTimer);
    clearInterval(watchdog);
    show(1);
    el.classList.add('out');
    el.removeAttribute('aria-busy');
    ui.booting = false;
    ui.titleFirst = false;
    // Das Titelmenü bekommt seinen Auftritt erst jetzt, wenn man es auch sieht
    if (ui.modal === 'title') {
      ui.layer.classList.add('tm-intro', 'tm-boot'); // tm-boot: Hintergrund steht schon, nur Logo und Menü treten auf
      setTimeout(() => ui.layer.classList.remove('tm-intro', 'tm-boot'), 2600);
    }
    setTimeout(() => el.remove(), 700);
    finish();
  };

  /** Wartet (höchstens ms) darauf, dass die Bilder des Titelhintergrunds geladen sind, damit er nicht schwarz aufgeht. */
  const titleReady = (ms) => {
    const imgs = [...(ui.root?.querySelectorAll?.('.titlescene img') ?? [])];
    const all = Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))));
    return Promise.race([all, new Promise((r) => setTimeout(r, ms))]);
  };

  return {
    done,
    /** Phaser-Loader der Hauptwelt (nur der erste Ladevorgang zählt). */
    attach(load) {
      if (attached) return;
      attached = true;
      lastTick = Date.now();
      text.textContent = LADE_TEXTE.bilder;
      const total = () => load.totalToLoad || 1;
      const onProgress = () => { lastTick = Date.now(); show(0.05 + 0.9 * ((load.totalComplete + load.totalFailed) / total())); };
      load.on('progress', onProgress);
      load.on('load', onProgress);
      load.on('loaderror', onProgress);
      load.once('complete', () => {
        load.off('progress', onProgress);
        load.off('load', onProgress);
        load.off('loaderror', onProgress);
        show(0.96);
        text.textContent = LADE_TEXTE.titel;
        titleReady(4000).then(() => setTimeout(hide, 250));
      });
    },
  };
}
