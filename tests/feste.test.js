// Paket BV: Jahreszeiten und Feste – Uhr, Flags, Zeitung, Karten
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { DAY_NIGHT_SECONDS, SEASONS, SEASON_SECONDS, seasonAt, festAt, FESTE } from '../src/core/Clock.js';
import { FEST_MAPS, SEASON_FACADE, isOutdoorMap } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Jahreszeiten: zwei Tage je Jahreszeit, Jahr beginnt im Herbst, Flags folgen der Spielzeit und werden nicht gespeichert', () => {
  assert.equal(SEASON_SECONDS, DAY_NIGHT_SECONDS * 4);
  assert.deepEqual(SEASONS.map((_, i) => seasonAt(i * SEASON_SECONDS)), ['herbst', 'winter', 'fruehling', 'sommer']);
  assert.equal(seasonAt(4 * SEASON_SECONDS + 10), 'herbst');
  const s = new GameState(content);
  s.syncClock();
  assert.ok(s.flags.has('saison_herbst'));
  s.playTime = SEASON_SECONDS + 1;
  s.tick(0);
  assert.ok(s.flags.has('saison_winter') && !s.flags.has('saison_herbst'));
  assert.equal(s.season(), 'winter');
  const saved = s.serialize();
  assert.ok(!saved.flags.some((f) => f.startsWith('saison_') || f.startsWith('fest_aktiv_')));
  const t = new GameState(content);
  t.load({ ...saved, playTime: 2 * SEASON_SECONDS + 5 });
  assert.ok(t.flags.has('saison_fruehling'));
});

test('Feste: Laternennacht in Kettlegates Herbstnächten, Salzsegen an Wexmoors Frühlingstagen, Schichtwechsel an Dunscars Sommertagen', () => {
  assert.equal(festAt(0, 'kettlegate'), null); // Herbst, Tag
  assert.equal(festAt(DAY_NIGHT_SECONDS + 1, 'kettlegate'), 'laternennacht'); // Herbst, Nacht
  assert.equal(festAt(DAY_NIGHT_SECONDS + 1, 'wexmoor'), null);
  assert.equal(festAt(2 * SEASON_SECONDS + 1, 'wexmoor'), 'salzsegen');
  assert.equal(festAt(2 * SEASON_SECONDS + DAY_NIGHT_SECONDS + 1, 'wexmoor'), null);
  assert.equal(festAt(3 * SEASON_SECONDS + 1, 'dunscar'), 'schichtwechsel');
  const s = new GameState(content);
  s.playTime = DAY_NIGHT_SECONDS + 1;
  s.tick(0);
  assert.equal(s.festAktiv('kettlegate'), 'laternennacht');
  assert.ok(s.flags.has('fest_aktiv_laternennacht'));
  s.playTime = 2 * DAY_NIGHT_SECONDS + 1;
  s.tick(0);
  assert.ok(!s.flags.has('fest_aktiv_laternennacht'));
  for (const [id, f] of Object.entries(FESTE)) {
    assert.ok(f.name && f.text.length > 40, id);
    for (const m of FEST_MAPS[id]) {
      const map = content.maps[m];
      assert.ok(map, `${id}: ${m}`);
      assert.equal(map.city ?? 'kettlegate', f.city, m);
      assert.ok(isOutdoorMap(map), `${m} ist keine Außenkarte`);
    }
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
