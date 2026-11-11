// Paket BV: Jahreszeiten und Feste – Uhr, Flags, Zeitung, Karten
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { DAY_NIGHT_SECONDS, DAY_SECONDS, SEASONS, SEASON_SECONDS, seasonAt, seasonDayAt, festAt, isStillerAbendAt, FESTE } from '../src/core/Clock.js';
import { FEST_MAPS, SEASON_FACADE, isOutdoorMap } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Jahreszeiten (CK): sechs Spieltage je Jahreszeit, Jahr beginnt im Herbst, Flags folgen der Spielzeit und werden nicht gespeichert', () => {
  assert.equal(DAY_SECONDS, DAY_NIGHT_SECONDS * 2);
  assert.equal(SEASON_SECONDS, DAY_SECONDS * 6);
  assert.deepEqual(SEASONS.map((_, i) => seasonAt(i * SEASON_SECONDS)), ['herbst', 'winter', 'fruehling', 'sommer']);
  assert.equal(seasonAt(4 * SEASON_SECONDS + 10), 'herbst');
  assert.deepEqual([0, 1, 5, 6].map((d) => seasonDayAt(d * DAY_SECONDS + 1)), [1, 2, 6, 1]);
  const s = new GameState(content);
  s.syncClock();
  assert.ok(s.flags.has('saison_herbst') && s.flags.has('fs_herbst'));
  assert.ok(s.flags.has('fs_laternennacht_ankuendigung') && !s.flags.has('fs_laternennacht_nachlese'));
  s.playTime = SEASON_SECONDS + 1;
  s.tick(0);
  assert.ok(s.flags.has('saison_winter') && s.flags.has('fs_winter') && !s.flags.has('saison_herbst') && !s.flags.has('fs_herbst'));
  assert.equal(s.season(), 'winter');
  const saved = s.serialize();
  assert.ok(!saved.flags.some((f) => /^(saison_|fest_aktiv_|fs_fest_|fs_stiller)/.test(f) || /^fs_(herbst|winter|fruehling|sommer)$/.test(f) || /_(ankuendigung|nachlese)$/.test(f)));
  const t = new GameState(content);
  t.load({ ...saved, playTime: 2 * SEASON_SECONDS + 5 });
  assert.ok(t.flags.has('saison_fruehling') && t.flags.has('fs_fruehling'));
});

test('Jahreszeiten (CK): Saisonwirkungen sind einmal je Jahreszeit frei, auch über Speichern und Laden hinweg', () => {
  const s = new GameState(content);
  s.syncClock();
  s.flags.add('fs_herbst_wirkung_1_genutzt');
  s.playTime += DAY_SECONDS;
  s.tick(0);
  assert.ok(s.flags.has('fs_herbst_wirkung_1_genutzt'), 'innerhalb der Jahreszeit bleibt die Wirkung verbraucht');
  const saved = s.serialize();
  assert.ok(saved.flags.includes('fs_herbst_wirkung_1_genutzt') && saved.flags.includes('fs_saison_stand_herbst'));
  const t = new GameState(content);
  t.load({ ...saved, playTime: SEASON_SECONDS + 1 });
  assert.ok(!t.flags.has('fs_herbst_wirkung_1_genutzt') && t.flags.has('fs_saison_stand_winter'));
  assert.ok(content.festeLeben.wirkungen.fs_herbst.length >= 3);
});

test('Feste (CK): Festtag ist der vierte Tag der Jahreszeit, Ankündigung davor, Nachlese danach, Stiller Abend am vierten Wintertag', () => {
  const day = (season, d) => SEASONS.indexOf(season) * SEASON_SECONDS + (d - 1) * DAY_SECONDS + 1;
  assert.equal(festAt(day('herbst', 1), 'kettlegate'), null);
  assert.equal(festAt(day('herbst', 4), 'kettlegate'), 'laternennacht');
  assert.equal(festAt(day('herbst', 4) + DAY_NIGHT_SECONDS, 'kettlegate'), 'laternennacht'); // auch nachts
  assert.equal(festAt(day('herbst', 4), 'wexmoor'), null);
  assert.equal(festAt(day('fruehling', 4), 'wexmoor'), 'salzsegen');
  assert.equal(festAt(day('fruehling', 5), 'wexmoor'), null);
  assert.equal(festAt(day('sommer', 4), 'dunscar'), 'schichtwechsel');
  assert.ok(isStillerAbendAt(day('winter', 4)) && !isStillerAbendAt(day('winter', 3)) && !isStillerAbendAt(day('herbst', 4)));
  const s = new GameState(content);
  s.playTime = day('herbst', 4);
  s.tick(0);
  assert.equal(s.festAktiv('kettlegate'), 'laternennacht');
  assert.ok(s.flags.has('fest_aktiv_laternennacht') && s.flags.has('fs_fest_laternennacht_aktiv') && !s.flags.has('fs_laternennacht_ankuendigung'));
  s.playTime = day('herbst', 5);
  s.tick(0);
  assert.ok(!s.flags.has('fest_aktiv_laternennacht') && !s.flags.has('fs_fest_laternennacht_aktiv') && s.flags.has('fs_laternennacht_nachlese'));
  s.playTime = day('winter', 4);
  s.tick(0);
  assert.ok(s.stillerAbend() && s.flags.has('fs_stiller_abend_aktiv'));
  for (const [id, f] of Object.entries(FESTE)) {
    assert.ok(f.name && f.text.length > 40, id);
    for (const m of FEST_MAPS[id]) {
      const map = content.maps[m];
      assert.ok(map, `${id}: ${m}`);
      assert.equal(map.city ?? 'kettlegate', f.city, m);
      assert.ok(isOutdoorMap(map), `${m} ist keine Außenkarte`);
    }
    // CK: Buden, Gäste und Auftrag des Festes stehen auf den Festplätzen und sind nur am Festtag da
    const fest = content.festeLeben.feste[`fs_${id}`];
    assert.deepEqual(fest.visible_if, { requires_flags: [`fs_fest_${id}_aktiv`] });
    for (const bude of Object.keys(fest.merchants)) assert.ok(content.market.merchants[bude], bude);
    for (const map of fest.karten) assert.ok(FEST_MAPS[id].includes(map), `${id}: ${map}`);
    assert.ok(content.quests[fest.auftrag], fest.auftrag);
  }
  assert.deepEqual(Object.keys(SEASON_FACADE), SEASONS);
  assert.ok(!isOutdoorMap(content.maps.ds_lohnbuero) && !isOutdoorMap(content.maps.wx_zelle) && isOutdoorMap(content.maps.altmarkt));
});

test('Feste: die Zeitung kündigt jedes Fest in seiner Jahreszeit an', () => {
  for (const [id, f] of Object.entries(FESTE)) {
    const blatt = content.newspapers.find((n) => n.id === `fest_${id}_blatt`);
    assert.ok(blatt, id);
    assert.deepEqual(blatt.requires_flags, [`saison_${f.season}`]);
    assert.ok(['kurier', 'bote', 'dunscarer_kalkblatt'].includes(blatt.zeitung));
  }
});
