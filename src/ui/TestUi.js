// i18n: ignorieren (nur für Seb, erscheint nirgends in der Oberfläche und wird nicht übersetzt)
// Verborgener Testmodus: Nach „Neues Spiel“ Umschalt + Ä + Ö + Ü gleichzeitig → Kennwort.
// Ist er an, öffnet dieselbe Tastenfolge die Testreise zu allen Karten.
import { testCodeOk, watchUmlautCombo } from '../core/Testmodus.js';

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

export function installTestmodus(ui) {
  watchUmlautCombo(window, () => testCombo(ui));
}

function testCombo(ui) {
  if (!ui.scene || ui.combatScene || ui.modal === 'combat' || ui.modal === 'title') return;
  if (ui.state.testmodus) { openTestReise(ui); return; }
  if (!ui.testArmed) return;
  const el = ui.open('testcode', `<div data-no-tr>
    <h3>Passwort</h3>
    <input type="password" class="testcode" autocomplete="off" style="width:100%;font:inherit;padding:4px">
    <div class="muted testcode-msg" style="min-height:1.2em"></div>
    <div class="actions center"><button class="primary" data-act="ok">OK</button><button data-act="x">Abbrechen</button></div></div>`);
  const input = el.querySelector('input');
  const msg = el.querySelector('.testcode-msg');
  const go = async () => {
    if (!(await testCodeOk(input.value))) { msg.textContent = 'Falsch.'; input.select(); return; }
    ui.testArmed = false;
    ui.state.startTestmodus();
    openTestReise(ui); // gleich die Liste aller Orte zeigen (ohne Wahl: Karte neu aufbauen)
    ui.testRebuild = true;
  };
  input.onkeydown = (e) => {
    e.stopPropagation(); // Tasten gehören dem Feld (Phaser und Ui.onKey bleiben draußen)
    if (e.key === 'Enter') go();
    if (e.key === 'Escape') ui.close();
  };
  el.querySelector('[data-act=ok]').onclick = go;
  el.querySelector('[data-act=x]').onclick = () => ui.close();
  setTimeout(() => input.focus(), 0);
}

function openTestReise(ui) {
  const names = { kettlegate: 'Kettlegate', wexmoor: 'Wexmoor', dunscar: 'Dunscar', himmel: 'Himmelsstadt', calderwick: 'Calderwick', briarholt: 'Briarholt' };
  const groups = Object.entries(ui.state.testKarten()).map(([city, maps]) => `<h4>${esc(names[city] ?? city)}</h4>
    <div class="testreise">${maps.map((m) => `<button data-map="${esc(m.id)}" style="margin:1px">${esc(m.name)}</button>`).join('')}</div>`).join('');
  const el = ui.open('testreise', `<div data-no-tr><h3>Testmodus</h3><div style="max-height:60vh;overflow:auto">${groups}</div>
    <div class="actions center"><button data-act="x">Schließen <span class="key">Esc</span></button></div></div>`);
  el.querySelectorAll('[data-map]').forEach((b) => { b.onclick = () => { ui.testRebuild = false; ui.close(); ui.scene?.travelTo?.(b.dataset.map, 'default'); }; });
  el.querySelector('[data-act=x]').onclick = () => closeTestReise(ui);
}

/** Schließen; direkt nach dem Freischalten wird die Karte neu aufgebaut (Bosse, Gegner, Zirkel). */
export function closeTestReise(ui) {
  ui.close();
  if (ui.testRebuild) { ui.testRebuild = false; ui.scene?.travelTo?.(ui.state.map, ui.state.spawn ?? 'default'); }
}

/** Knopf im Pausemenü, nur wenn der Testmodus an ist. */
export function testPauseButton(ui) {
  return ui.state.testmodus ? '<button data-act="testreise" data-no-tr>Testreise</button>' : '';
}

export function bindTestPause(ui, el) {
  const b = el.querySelector('[data-act=testreise]');
  if (b) b.onclick = () => openTestReise(ui);
}
