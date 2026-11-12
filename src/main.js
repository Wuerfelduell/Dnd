import Phaser from 'phaser';
import './style.css';
import { content } from './data/index.js';
import { GameState } from './core/GameState.js';
import { WorldScene, VIEW_W, VIEW_H } from './world/WorldScene.js';
import { Ui } from './ui/Ui.js';
import { CombatScene } from './world/CombatScene.js';
import { Audio } from './core/Audio.js';
import { wireSounds, updateRitualSounds } from './core/sounds.js';
import { MusicDirector } from './core/MusicDirector.js';
import { wireMusicCues, modeFor, ritualMusic, laternenFaktoren } from './core/musicCues.js';
import { isOutdoorMap } from './world/assets.js';
import { cityOf } from './core/Travel.js';
import { HIMMEL, STURZ_EFFECTS } from './data/aufstieg.js';

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
// DS: dazu die Ritualklänge (sfx4) und aus Paket DB nur die Halbgott-Klänge (hg_*), die die Rituale wiederverwenden
const audio = new Audio({ kinds: ['sfx', 'sfx2', 'sfx3:hg_', 'sfx4'] }); // Effekte aus Paket Y und CM; Musik kommt als Notendaten (Paket Z)
wireSounds(state, audio, uiRoot, { cityOf: (m) => cityOf(state, m) });

const ui = new Ui(uiRoot, state, {
  hasSave: () => [2, 3, 4].includes(readSave()?.v),
  onNewGame: () => {
    clearSave();
    state.reset();
    // Teststart für die Seq-4-Rituale: ?probe=laterne (oder ein anderer Pfad) → Sequenz 5, voll verdaut, im Vergessmoor
    const probe = new URLSearchParams(location.search).get('probe');
    if (probe) state.seq4Probe(probe);
    // Seq 3 bis 1: ?hoch=laterne&seq=3 → eine Stufe darüber, voll verdaut, Ort gefunden (Seq 3: man steht im Ort)
    const hoch = new URLSearchParams(location.search).get('hoch');
    if (hoch) state.hochProbeStart(hoch, Number(new URLSearchParams(location.search).get('seq') ?? 3));
    // Kapitel 4: ?aufstieg=dunscar|himmel|calderwick (&pfad=eisen) → Seq 4, voll verdaut, am Endbahnhof, oben oder nach dem Sturz
    const auf = new URLSearchParams(location.search).get('aufstieg');
    if (auf) {
      state.hochProbeStart(new URLSearchParams(location.search).get('pfad') ?? 'eisen', 3);
      for (const f of [...state.flags]) if (/^gilde_.*_mitglied$/.test(f)) state.flags.delete(f);
      if (auf === 'calderwick') state.applyEffects(STURZ_EFFECTS);
      else state.flags.delete('k4_arrived');
      state.map = { himmel: HIMMEL, calderwick: 'cw_gleisfuss' }[auf] ?? 'ds_endbahnhof';
    }
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

// Paket Z: Musik aus Notendaten (Web Audio), startet mit der ersten Eingabe
const music = new MusicDirector({ audio });
ui.music = music;
wireMusicCues(state, music); // Z/AY/CL: Enden, Ankünfte, Rituale, Jahreszeiten, Abgleiche und Ventile als Ereignisstücke
const setVolumes = audio.setVolumes.bind(audio);
audio.setVolumes = (v) => { const out = setVolumes(v); music.applyVolume(); return out; };
const startMusic = () => music.start();
for (const type of ['pointerdown', 'keydown', 'touchend']) document.addEventListener(type, startMusic, { once: true });
document.addEventListener('visibilitychange', () => (document.hidden ? music.pause() : music.resume()));
let ritualMemo = {};
setInterval(() => {
  if (document.hidden || !game) return;
  const combat = game.scene.isActive('combat') ? game.scene.getScene('combat') : null;
  ritualMemo = updateRitualSounds(state, audio, ritualMemo, { modal: ui.modal }); // DS: Ritualschleifen, Kessel-Rezepte, Uhr-Tick
  const siege = game.scene.getScene('world')?.hg?.siege;
  music.update({
    ritual: ritualMusic(state, combat?.encounterId ?? null), // DS: Laternennacht, Traum, Schattenseite
    spuren: siege ? laternenFaktoren(siege.lit().length, siege.lanterns.length) : null,
    title: !started,
    combat: combat?.combat ? { id: combat.encounterId, enc: combat.combat.enc } : null,
    vision: state.spiritVision,
    map: state.map,
    city: cityOf(state, state.map),
    zone: content.zones?.[state.map] ? state.map : null,
    playTime: state.playTime,
    fest: state.festAktiv?.(cityOf(state, state.map)) ?? null, // CL: Festmusik auf den Festplätzen
    season: state.season?.() ?? null,
    // Z: Lagen mit eigener Schleife (Horchstelle, Treffen, Streife im Freien einer Polizeistadt)
    mode: modeFor({ modal: ui.modal, auction: !!state.auction, wanted: state.wanted ?? 0, police: !!state.cityPolice?.(), outdoor: !!content.maps[state.map] && isOutdoorMap(content.maps[state.map]) }),
  });
}, 500);

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
      g.registry.set('music', music);
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
window.__nebel = { game, state, ui, content, audio, music, scene: () => game.scene.getScene('world') };
