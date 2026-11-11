import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Ui } from '../src/ui/Ui.js';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

function notebook() {
  const ui = Object.create(Ui.prototype);
  ui.state = new GameState(content);
  ui.state.map = 'wx_bahnhof';
  ui.state.quests.k2_akt1 = 'done';
  ui.state.quests.k2_akt2 = 'active';
  ui.state.quests.k2a_tinte = 'active';
  ui.tab = 'quests';
  ui.selected = [];
  ui.forgetScroll = () => {};
  const button = { dataset: { questCase: 'k2a_tinte' } };
  ui.open = (_, html) => {
    ui.html = html;
    return {
      querySelectorAll: (selector) => selector === '[data-quest-case]' ? [button] : [],
      querySelector: () => ({ addEventListener() {} }),
    };
  };
  return { ui, button };
}

test('Aufträge bieten direkte Fallakten, einschließlich erledigter Aufträge', () => {
  const { ui } = notebook();
  const html = ui.questsHtml();
  assert.match(html, /data-quest-case="kapitel2"/);
  assert.match(html, /data-quest-case="k2a_tinte"/);
  assert.match(html, /Die Tinte des Telegrafisten: Schlüsse ziehen/);
  assert.equal((html.match(/data-quest-case="kapitel2"/g) ?? []).length, 2);
});

test('Klick öffnet nur die gewählte Fallakte, leert die Auswahl und ändert den Wegweiser nicht', () => {
  const { ui, button } = notebook();
  ui.state.tracked = 'k2_akt2';
  ui.renderNotebook('');
  ui.selected = ['old_a', 'old_b'];
  let stopped = false;
  button.onclick({ stopPropagation() { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(ui.currentCase(), 'k2a_tinte');
  assert.deepEqual(ui.selected, []);
  assert.equal(ui.state.tracked, 'k2_akt2');
  assert.match(ui.html, /Zurück zu den Aufträgen/);
  assert.match(ui.html, /data-act="combine" disabled/);
});

test('Erledigte Fälle öffnen weiterhin ihre eigene Akte im Archiv', () => {
  const { ui } = notebook();
  ui.state.quests.case_01 = 'done';
  ui.openNotebook('case_01');
  assert.equal(ui.tab, 'archiv');
  assert.equal(ui.currentCase(), 'case_01');
});
