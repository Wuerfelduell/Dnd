import Phaser from 'phaser';
import './style.css';
import { content } from './data/index.js';
import { GameState } from './core/GameState.js';
import { WorldScene, VIEW_W, VIEW_H } from './world/WorldScene.js';
import { Ui } from './ui/Ui.js';
import { CombatScene } from './world/CombatScene.js';
import { Audio } from './core/Audio.js';
import { wireSounds } from './core/sounds.js';

const SAVE_KEY = 'nebelakten-save';
const state = new GameState(content);
const frame = document.getElementById('frame');
const uiRoot = document.getElementById('ui');

// --- Spielstand (localStorage, Fehler werden still ignoriert) ---------------------
function readSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null'); } catch { return null; }
}
function writeSave() {
  if (!started) return;
  const scene = game.scene.getScene('world');
  const pos = scene?.player && !scene.leaving ? scene.playerPosition() : null;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.serialize(pos))); } catch { /* privat/kein Speicher */ }
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* egal */ }
}
let saveTimer = null;
const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(writeSave, 300); };
['changed', 'quest', 'honor', 'ending', 'travel', 'conclusion', 'item', 'money', 'ascend', 'digested'].forEach((ev) => state.on(ev, saveSoon));
setInterval(writeSave, 5000);

let started = false;
let game;
const restartWorld = () => game.scene.getScene('world').scene.restart();

// Paket Y: Soundeffekte (eine Instanz für alle Szenen; spielt erst nach der ersten Eingabe)
const audio = new Audio({ kinds: ['sfx'] }); // Musik (Paket Z) folgt
wireSounds(state, audio, uiRoot);

const ui = new Ui(uiRoot, state, {
  hasSave: () => [2, 3, 4].includes(readSave()?.v),
  onNewGame: () => {
    clearSave();
    state.reset();
    started = true;
    restartWorld();
    saveSoon();
  },
  onContinue: () => {
    if (!state.load(readSave())) state.reset();
    started = true;
    restartWorld();
  },
});

ui.audio = audio;

game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW_W,
  height: VIEW_H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#06070d',
  physics: { default: 'arcade', arcade: { debug: false } },
  input: { gamepad: true }, // Gamepad steuert Spieler 2 (lokaler Koop)
  scale: { mode: Phaser.Scale.NONE },
  scene: [WorldScene, CombatScene],
  callbacks: {
    preBoot: (g) => {
      g.registry.set('state', state);
      g.registry.set('ui', ui);
      g.registry.set('audio', audio);
    },
  },
});

// Ganzzahlige Skalierung: Pixel bleiben scharf (480x270 -> 960x540, 1440x810, ...).
// Auf kleinen Bildschirmen (Handy) wird stattdessen stufenlos auf die volle Fläche skaliert.
function fit() {
  const w = window.visualViewport?.width ?? window.innerWidth;
  const h = window.visualViewport?.height ?? window.innerHeight;
  const raw = Math.min(w / VIEW_W, h / VIEW_H);
  const k = raw < 2 || document.documentElement.classList.contains('touch') && raw < 3
    ? Math.max(0.5, Math.floor(raw * 20) / 20)
    : Math.floor(raw);
  frame.style.width = `${VIEW_W * k}px`;
  frame.style.height = `${VIEW_H * k}px`;
  frame.style.setProperty('--k', k);
  game?.scale?.refresh(); // Eingabe-Koordinaten an die neue Größe anpassen
}
window.addEventListener('resize', fit);
window.visualViewport?.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 200));
document.addEventListener('fullscreenchange', () => setTimeout(fit, 100));
const rotateBtn = document.querySelector('[data-rotate-fullscreen]');
if (ui.canFullscreen()) rotateBtn?.addEventListener('click', () => ui.toggleFullscreen());
else rotateBtn?.remove(); // iPhone: kein Vollbild im Browser (Hinweis im Menü: „Zum Home-Bildschirm“)
window.addEventListener('touchstart', () => setTimeout(fit, 0), { once: true, passive: true });
// Kein Kontextmenü beim langen Drücken (Handy)
frame.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('beforeunload', writeSave);
fit();

ui.showTitle();

// Für Tests und Debugging in der Browser-Konsole.
window.__nebel = { game, state, ui, content, audio, scene: () => game.scene.getScene('world') };
