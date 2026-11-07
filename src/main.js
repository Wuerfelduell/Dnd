import Phaser from 'phaser';
import './style.css';
import caseData from './data/case_01.json';
import { GameState } from './core/GameState.js';
import { StreetScene, VIEW_W, VIEW_H } from './world/StreetScene.js';
import { Ui } from './ui/Ui.js';

const state = new GameState(caseData);
const frame = document.getElementById('frame');
const uiRoot = document.getElementById('ui');

let game;
const ui = new Ui(uiRoot, state, {
  onRestart: () => {
    state.reset();
    game.scene.getScene('street').scene.restart();
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
  scale: { mode: Phaser.Scale.NONE },
  scene: [StreetScene],
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
fit();

ui.showTitle();

// Für Tests und Debugging in der Browser-Konsole.
window.__nebel = { game, state, ui, scene: () => game.scene.getScene('street') };
