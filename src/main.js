import Phaser from 'phaser';
import './style.css';
import { content } from './data/index.js';
import { GameState } from './core/GameState.js';
import { WorldScene, WorldScene2, VIEW_W, VIEW_H } from './world/WorldScene.js';
import { Ui } from './ui/Ui.js';
import { CombatScene, CombatScene2 } from './world/CombatScene.js';
import { Audio } from './core/Audio.js';
import { wireSounds, updateRitualSounds } from './core/sounds.js';
import { MusicDirector } from './core/MusicDirector.js';
import { wireMusicCues, modeFor, ritualMusic, laternenFaktoren } from './core/musicCues.js';
import { isOutdoorMap } from './world/assets.js';
import { cityOf } from './core/Travel.js';
import { HIMMEL, STURZ_EFFECTS } from './data/aufstieg.js';
import { watchDom, patchPhaser } from './core/I18n.js';
import { skipTraining } from './core/Lehrstunde.js';

// Drei lokale Speicherplätze. Platz 1 nutzt den alten Schlüssel, damit bestehende Spielstände dort bleiben.
const SLOTS = [1, 2, 3];
const SLOT_KEY = 'nebelakten-slot';
const saveKey = (n) => (n === 1 ? 'nebelakten-save' : `nebelakten-save-${n}`);
let slot = (() => { try { const n = Number(localStorage.getItem(SLOT_KEY)); return SLOTS.includes(n) ? n : 1; } catch { return 1; } })();
function setSlot(n) {
  slot = n;
  try { localStorage.setItem(SLOT_KEY, String(n)); } catch { /* egal */ }
}
const state = new GameState(content);
const frame = document.getElementById('frame');
const uiRoot = document.getElementById('ui');
// Sprachwahl: angezeigte Texte (DOM + Phaser) werden bei Englisch übersetzt
patchPhaser(Phaser);
watchDom(uiRoot, document.getElementById('rotate'));

// --- Spielstand (localStorage, Fehler werden still ignoriert) ---------------------
function readSave(n = slot) {
  try { return JSON.parse(localStorage.getItem(saveKey(n)) ?? 'null'); } catch { return null; }
}
const validSave = (n) => { const d = readSave(n); return [2, 3, 4].includes(d?.v) ? d : null; };
function writeSave() {
  if (!started) return;
  const scene = game.scene.getScene('world');
  const pos = scene?.player && !scene.leaving ? scene.playerPosition() : null;
  const w2 = game.scene.getScene('world2'); // Kapitel 4: Splitscreen, Spieler 2 merkt sich seine eigene Stelle
  if (state.splitOn && state.p2 && w2?.player && w2.sys.isActive() && !w2.leaving) state.p2.position = w2.playerPosition();
  try { localStorage.setItem(saveKey(slot), JSON.stringify(state.serialize(pos))); } catch { /* privat/kein Speicher */ }
}
function clearSave(n = slot) {
  try { localStorage.removeItem(saveKey(n)); } catch { /* egal */ }
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
  slots: () => SLOTS.map((n) => ({ n, save: validSave(n) })),
  activeSlot: () => slot,
  onDeleteSlot: (n) => clearSave(n),
  onNewGame: (n = slot, { koop = false } = {}) => {
    setSlot(n);
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
      // &koop=1 (&pfad2=laterne): Spieler 2 mit Seq 4 dazu, in Calderwick teilt sich dann der Bildschirm
      if (new URLSearchParams(location.search).get('koop')) {
        state.addP2();
        state.p2.pathway = { id: new URLSearchParams(location.search).get('pfad2') ?? 'laterne', seq: 4, digestion: 100 };
        state.withPlayer(2, () => { state.updateMaxHp(); state.hp = state.maxHp; }, { quiet: true });
      }
    }
    // Kapitel 7: ?varrowmouth=1 (&pfad=eisen) → Seq 2 nach dem Thron im Bügelraum (Anreise); ?varrowmouth=hafen → gleich am Zollhafen, =wrack → Akt II im Wrackfeld
    const vm = new URLSearchParams(location.search).get('varrowmouth');
    if (vm) {
      state.hochProbeStart(new URLSearchParams(location.search).get('pfad') ?? 'eisen', 2);
      state.applyEffects(STURZ_EFFECTS);
      for (const f of ['kapitel4_done', 'k5_arrived', 'kapitel5_done', 'bha_end_wahl', 'kapitel6_done', 'k6_thron']) state.flags.add(f);
      state.map = 'bh_buegelraum';
      if (vm === 'hafen') { state.applyEffects({ sets_flags: ['k6_anreise_wahl', 'k6_arrived'], start_quests: ['k6_akt1'] }); state.map = 'vm_zollhafen'; }
      // ?varrowmouth=wrack → Akt II, im Wrackfeld (Ebbe kommt mit der Uhr)
      if (new URLSearchParams(location.search).has('flut')) state.playTime = 370; // &flut → gleich bei Flut (Gezeit wechselt alle 360 s)
      if (vm === 'wrack') { state.applyEffects({ sets_flags: ['k6_anreise_wahl', 'k6_arrived', 'k6_tam_weg', 'k6_akt1_done'], start_quests: ['k6_akt1', 'k6_akt2'] }); state.map = 'vm_wrackfeld'; }
    }
    if (koop && !state.hasP2()) state.addP2(); // Hauptmenü „Zu zweit spielen“
    // Schnellstarts überspringen das Pflicht-Kampftraining mit Holt; ?training=aus überspringt es auch beim normalen Start
    if (probe || hoch || auf || vm || ['aus', '0', 'nein', 'off'].includes(new URLSearchParams(location.search).get('training'))) skipTraining(state);
    started = true;
    restartWorld();
    saveSoon();
  },
  // Pausemenü „Zum Hauptmenü“: speichern und neu laden, so startet das Hauptmenü mit sauberem Zustand
  onQuitToTitle: () => {
    writeSave();
    started = false;
    location.reload();
  },
  onContinue: (n = slot, { koop = false } = {}) => {
    setSlot(n);
    if (!state.load(readSave())) state.reset();
    if (koop && !state.hasP2()) state.addP2();
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
    titleTrack: ui.titleMusic ?? null, // Hauptmenü: ab Varrowmouth die Titelfassung mit dem Pegel-Puls
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
  scene: [WorldScene, WorldScene2, CombatScene, CombatScene2], // WorldScene2: rechte Hälfte des Splitscreens (Kapitel 4)
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
