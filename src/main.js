import Phaser from 'phaser';
import './style.css';
import { content } from './data/index.js';
import { GameState } from './core/GameState.js';
import { WorldScene, VIEW_W, VIEW_H } from './world/WorldScene.js';
import { Ui } from './ui/Ui.js';
import { CombatScene } from './world/CombatScene.js';

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
    },
  },
});

// Ganzzahlige Skalierung: Pixel bleiben scharf (480x270 -> 960x540, 1440x810, ...).
function fit() {
  const k = Math.max(1, Math.floor(Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H)));
  frame.style.width = `${VIEW_W * k}px`;
  frame.style.height = `${VIEW_H * k}px`;
  frame.style.setProperty('--k', k);
}
window.addEventListener('resize', fit);
window.addEventListener('beforeunload', writeSave);
fit();

ui.showTitle();

// Für Tests und Debugging in der Browser-Konsole.
window.__nebel = { game, state, ui, content, scene: () => game.scene.getScene('world') };
