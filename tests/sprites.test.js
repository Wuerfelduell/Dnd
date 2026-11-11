import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { X_ITEMS, X_FIGHTS, mapMarkerOf, W_ENEMIES, W_ITEMS, S_ENEMIES, S_LONERS, S_HOSTS, S_ITEMS, TURN_PORTRAITS, R_SCENES, T_MEMBERS, U_FIGURES, AUKTION_REGIONS, SHEETS, BATTLE_SHEETS, ANIM_SHEETS, TILE_CELLS, PROP_CELLS, PROP_ANIMS, CHARACTER_SHEETS, ENCOUNTER_SHEETS, ENEMY_BATTLE_SHEETS, THEME_TILE_LIST, PORTRAITS, MAP_MARKERS, C_CHARACTERS, BATTLE_BACKGROUNDS, ENCOUNTER_BACKGROUNDS, SKILL_FX, SKILL_ICONS, STATUS_ICONS, PATHWAY_POSES, WEAPON_POSES, itemIconUrl, itemIcon32Url, pathwayEmblemUrl, pathwayCardUrl, COIN_URL, bossIntroImage,
  REGION_SHEETS, REGION_ANIMS, ICON_STRIPS, CASE_SHEETS, WHOLE_PROPS, FACADES, E_CHARACTERS, PORTRAIT_SPECIAL, PORTRAIT_EXTRA, PORTRAIT_MOODS, AK_MOODS_EN, ENDING_IMAGES, endingImageUrl,
  caseFileUrl, SCENES, sceneUrl, CITY_MAP_URL, CITY_FOG_URL, QUEST_UI_URL,
  OVERWORLD_SHEETS, BESTIARY, bestiaryUrl, F_EQUIPMENT, BOSS_INTROS, F_UI_SHEETS, overworldIdFor } from '../src/world/assets.js';
import { TILE_KEYS } from '../src/world/textures.js';

// Spiel-URLs ('./sprites/...') zeigen auf public/sprites/
const file = (url) => new URL(`../public/${url.replace(/^\.\//, '')}`, import.meta.url);
const sprite = (path) => new URL(`../public/sprites/${path}`, import.meta.url);
const content = loadContent();

test('alle Sheets aus assets.js liegen unter public/sprites', () => {
  const paths = [...Object.values(SHEETS), ...Object.values(BATTLE_SHEETS).map(([p]) => p), ...Object.values(ANIM_SHEETS).map(([p]) => p)];
  for (const p of paths) assert.ok(existsSync(sprite(p)), p);
});

test('Tabellen verweisen nur auf bekannte Sheets und Tiles', () => {
  for (const [key, [sheet, , base]] of Object.entries(TILE_CELLS)) {
    assert.ok(TILE_KEYS.includes(key), `Tile-Key ${key}`);
    assert.ok(SHEETS[sheet], `Sheet ${sheet}`);
    if (base) assert.ok(TILE_KEYS.includes(base), `Basis ${base}`);
  }
  for (const [sheet] of [...Object.values(PROP_CELLS), ...Object.values(PROP_ANIMS)]) assert.ok(SHEETS[sheet], sheet);
  for (const sheet of Object.values(CHARACTER_SHEETS)) assert.ok(SHEETS[sheet], sheet);
});

test('jede Figur mit Karteneinsatz und jeder Händler hat ein Lauf-Sheet', () => {
  for (const id of Object.keys(content.market.npcs)) assert.ok(CHARACTER_SHEETS[`npc_${id}`], id);
});

test('jedes Item hat ein Icon, Tränke auch in 32px', () => {
  for (const [id, it] of Object.entries(content.items)) {
    assert.ok(existsSync(file(itemIconUrl(id))), `Icon fehlt: ${id}`);
    if (it.kind === 'potion') assert.ok(existsSync(file(itemIcon32Url(id))), `32er fehlt: ${id}`);
  }
  assert.ok(existsSync(file(COIN_URL)));
});

test('jeder Pfad hat Embleme und eine Karte', () => {
  for (const pid of Object.keys(content.pathways)) {
    for (const size of [16, 32, 64]) assert.ok(existsSync(file(pathwayEmblemUrl(pid, size))), `${pid} ${size}`);
    assert.ok(existsSync(file(pathwayCardUrl(pid))), pid);
  }
});

test('Deko auf den Karten nutzt bekannte Sprites', () => {
  const known = new Set([...Object.keys(PROP_CELLS), ...Object.keys(PROP_ANIMS)]);
  for (const map of Object.values(content.maps)) {
    if (map.tiles !== 'nachtmarkt') continue;
    for (const d of map.decor) assert.ok(known.has(d.sprite), `${map.id}: ${d.sprite}`);
  }
});

const kampf = JSON.parse(readFileSync(sprite('manifest-kampf.json'), 'utf8'));
const kampfAsset = (id) => kampf.assets.find((a) => a.id === id);

test('Kampf: jede Begegnung hat ein Gegner-Sheet und jede Karte/Begegnung einen vorhandenen Hintergrund', () => {
  for (const [id, enc] of Object.entries(content.encounters)) {
    const sheet = enc.sheet ?? ENCOUNTER_SHEETS[id] ?? ENEMY_BATTLE_SHEETS[enc.sprite];
    assert.ok(sheet && BATTLE_SHEETS[sheet], `kein Kampf-Sheet für ${id}`);
  }
  // Einträge für Begegnungen/Karten, die es noch nicht gibt, sind erlaubt (Vorbereitung für neue Fälle)
  for (const sheet of Object.values(ENCOUNTER_SHEETS)) assert.ok(BATTLE_SHEETS[sheet], sheet);
  for (const bg of [...Object.values(BATTLE_BACKGROUNDS), ...Object.values(ENCOUNTER_BACKGROUNDS)]) assert.ok(existsSync(sprite(`battle/${bg}.png`)), bg);
});

test('Kampf: jede Pfad-Fähigkeit hat Effekt und Icon wie im Manifest', () => {
  const icons = kampfAsset('skill_icons').icons;
  assert.deepEqual(SKILL_ICONS, icons);
  assert.deepEqual(STATUS_ICONS, kampfAsset('status_icons').icons);
  for (const p of Object.values(content.pathways)) {
    for (const sd of Object.values(p.seqs)) {
      // Neue Fähigkeiten dürfen bis zur eigenen Grafik den Effekt einer anderen leihen (fx)
      const id = sd.skill.fx ?? sd.skill.id;
      assert.ok(SKILL_FX[id], `Effekt fehlt: ${id}`);
      const fx = kampfAsset(`fx_${id}`) ?? MANIFEST_FILES.manifestSequenzen2.assets.find((a) => a.id === `fx_${id}`)
        ?? manifest('sequenzen3').assets.find((a) => a.id === `fx_sq_${id}` || a.id === `fx_${id}` || a.id === id); // Paket AG: Seq 4 bis 1
      assert.equal(fx.frameWidth, SKILL_FX[id], `Framegröße ${id}`);
      assert.ok(fx.animations.cast, id);
    }
  }
});

test('Kampf: Posen und Gegner-Animationen stehen im Manifest', () => {
  const skills = kampfAsset('battle_player_skills').animations;
  for (const pid of Object.keys(content.pathways)) assert.ok(skills[PATHWAY_POSES[pid]], pid);
  const weapons = kampfAsset('battle_player_weapons').animations;
  for (const pose of [...Object.values(WEAPON_POSES), 'victory']) assert.ok(weapons[pose], pose);
  for (const [key, [, size]] of Object.entries(BATTLE_SHEETS)) {
    if (!key.startsWith('enemy_')) continue;
    const a = kampfAsset(key);
    if (!a) continue; // 14b-Gegner stehen in manifest-14b.json
    assert.equal(a.frameWidth, size, key);
    for (const anim of ['idle', 'attack', 'special', 'hurt', 'defeated']) assert.ok(a.animations[anim], `${key}.${anim}`);
  }
});

const welt = JSON.parse(readFileSync(sprite('manifest-welt.json'), 'utf8'));

test('Paket C: Themen-Tiles verweisen auf vorhandene 16x16-Regionen', () => {
  for (const t of THEME_TILE_LIST) {
    if (typeof t.region === 'number') { // Paket G: Zellindex im 8x8-Raster
      assert.ok(existsSync(sprite(SHEETS[t.sheet])) && t.region >= 0 && t.region < 64, t.key);
      assert.ok(TILE_KEYS.includes(t.key), t.key);
      continue;
    }
    const asset = welt.assets.find((a) => a.file === SHEETS[t.sheet]);
    assert.ok(asset, `Sheet ${t.sheet} fehlt im Manifest`);
    const r = asset.regions[t.region];
    assert.ok(r, `${t.key}: Region ${t.region} fehlt`);
    assert.equal(r.width, 16, t.key);
    assert.equal(r.height, 16, t.key);
    assert.ok(TILE_KEYS.includes(t.key), t.key);
  }
});

test('Paket C: Karten mit Thema nutzen ein bekanntes Thema', () => {
  const themes = new Set(THEME_TILE_LIST.map((t) => t.theme));
  for (const map of Object.values(content.maps)) {
    if (map.tiles && map.tiles !== 'nachtmarkt') assert.ok(themes.has(map.tiles), `${map.id}: ${map.tiles}`);
  }
});

test('Paket C: Portraits, Lauf-Sheets und Kartenmarker sind vollständig', () => {
  for (const file of Object.values(PORTRAITS)) assert.ok(existsSync(sprite(`portraits/${file}`)), file);
  for (const id of C_CHARACTERS) assert.ok(CHARACTER_SHEETS[`npc_${id}`] === `c_${id}`, id);
  // Jede Figur aus campaign.json/market.json mit Portrait-Datei bekommt sie auch
  for (const id of Object.keys(content.npcs)) {
    if (existsSync(sprite(`portraits/C_${id}_emotions.png`))) assert.ok(PORTRAITS[id], `Portrait nicht zugeordnet: ${id}`);
  }
  for (const t of content.travel) if (!['crypt'].includes(t.map)) assert.ok(mapMarkerOf(t.map)[1] !== undefined, `Marker fehlt: ${t.map}`);
});

// --- Paket D (Stadt) und E (Fälle) -------------------------------------------------
const manifest = (name) => JSON.parse(readFileSync(sprite(`manifest-${name}.json`), 'utf8'));
const MANIFEST_FILES = { manifestStadt: manifest('stadt'), manifestFaelle: manifest('faelle'), manifestJournal: manifest('journal'), manifestReise: manifest('reise'), manifestWildnis: manifest('wildnis'), manifestGegner3: manifest('gegner3'), manifestFall5: manifest('fall5'), manifestFall6: manifest('fall6'), manifestFall78: manifest('fall78'), manifestTreffen: manifest('treffen'), manifestSequenzen2: manifest('sequenzen2'), manifestWexmoor: manifest('wexmoor'), manifestRituale: manifest('rituale'), manifestWexmoor2: manifest('wexmoor2'), manifestWexmoor3: manifest('wexmoor3'), manifestWexmoor4: manifest('wexmoor4'), manifestWexmoor5: manifest('wexmoor5'), manifestPlatzhalter: manifest('platzhalter'), manifestSpieler2: manifest('spieler2'), manifestNebenquests: manifest('nebenquests') };
const regionNames = (def) => {
  const regions = Array.isArray(def.regions) ? def.regions.map((r) => r.name) : Object.keys(def.regions ?? {});
  return [...regions, ...Object.keys(def.animations ?? {}), ...Object.keys(def.regionAnimations ?? {})];
};

test('Paket D/E: Region-Sheets passen zu ihren Manifesten', () => {
  for (const [prefix, [m, id]] of Object.entries(REGION_SHEETS)) {
    const def = MANIFEST_FILES[m].assets.find((a) => a.id === id);
    assert.ok(def, `${prefix}: ${id} fehlt in ${m}`);
    assert.equal(SHEETS[prefix], def.file, prefix);
  }
  for (const [prefix, [path, id]] of Object.entries(ICON_STRIPS)) {
    assert.equal(MANIFEST_FILES.manifestFaelle.assets.find((a) => a.id === id)?.file, path, prefix);
  }
  for (const [key, [path, , , id]] of Object.entries(CASE_SHEETS)) {
    assert.ok(existsSync(sprite(path)), key);
    assert.equal(MANIFEST_FILES.manifestFaelle.assets.find((a) => a.id === id)?.file, path, key);
  }
});

test('Paket D/E: Karten-Deko nutzt nur vorhandene Regionen', () => {
  const known = new Set([...Object.keys(WHOLE_PROPS), ...Object.keys(CASE_SHEETS), ...Object.keys(ANIM_SHEETS), ...Object.keys(PROP_CELLS)]);
  for (const [prefix, [m, id]] of Object.entries(REGION_SHEETS)) {
    for (const n of regionNames(MANIFEST_FILES[m].assets.find((a) => a.id === id))) known.add(`${prefix}_${n}`);
    for (const n of Object.keys(REGION_ANIMS[prefix] ?? {})) known.add(`${prefix}_${n}`);
  }
  for (const [prefix, [, id]] of Object.entries(ICON_STRIPS)) {
    for (const n of Object.keys(MANIFEST_FILES.manifestFaelle.assets.find((a) => a.id === id).icons)) known.add(`${prefix}_${n}`);
  }
  for (const map of Object.values(content.maps)) {
    for (const d of map.decor ?? []) if (/^[bdehigjkmoqrsvw]_/.test(d.sprite)) assert.ok(known.has(d.sprite), `${map.id}: ${d.sprite}`);
    for (const d of map.interactables ?? []) if (/^[bdehigjkmoqrsvw]_/.test(d.sprite ?? '')) assert.ok(known.has(d.sprite), `${map.id}: ${d.sprite}`);
    if (map.facade) assert.ok(FACADES.includes(map.facade), `${map.id}: Fassade ${map.facade}`);
  }
});

test('Paket D/E: Figuren, Portraits, Schlussbilder, Akten und Szenen liegen bereit', () => {
  for (const id of E_CHARACTERS) {
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
    assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
  }
  for (const [id, [f, moods]] of Object.entries({ ...PORTRAIT_SPECIAL, ...PORTRAIT_EXTRA })) {
    assert.ok(existsSync(sprite(`portraits/${f}`)), f);
    assert.ok(Object.values(moods).every((c) => c >= 0 && c < 4), id);
  }
  // Stimmungen in Dialogen gibt es als Portrait-Spalte
  for (const [tid, tree] of Object.entries(content.dialogues)) {
    for (const [nid, node] of Object.entries(tree.nodes ?? {})) {
      if (node.scene) assert.ok(sceneUrl(node.scene), `${tid}.${nid}: Szene ${node.scene}`);
      if (!node.mood) continue;
      const npcMoods = [...Object.values(PORTRAIT_SPECIAL), ...Object.values(PORTRAIT_EXTRA)].flatMap(([, m]) => Object.keys(m));
      assert.ok(node.mood in PORTRAIT_MOODS || node.mood in AK_MOODS_EN || npcMoods.includes(node.mood), `${tid}.${nid}: ${node.mood}`);
    }
  }
  for (const id of Object.keys(ENDING_IMAGES)) assert.ok(content.endings[id], `Ende ${id}`);
  for (const [id, end] of Object.entries(content.endings)) {
    const url = endingImageUrl(id, end.case);
    if (url) assert.ok(existsSync(file(url)), url);
  }
  for (const c of content.cases) assert.ok(existsSync(file(caseFileUrl(c.id))), c.id);
  for (const id of SCENES) assert.ok(existsSync(file(sceneUrl(id))), id);
  for (const map of Object.values(content.maps)) for (const d of map.interactables ?? []) if (d.scene) assert.ok(sceneUrl(d.scene), `${map.id}: ${d.scene}`);
  assert.ok(existsSync(sprite(content.travelRules.map_image)));
  if (content.travelRules.fog_image) assert.ok(existsSync(sprite(content.travelRules.fog_image)));
  for (const url of [CITY_MAP_URL, CITY_FOG_URL, QUEST_UI_URL]) assert.ok(existsSync(file(url)), url);
  for (const [, pin] of Object.entries(content.travelRules.pins)) assert.ok(pin[0] >= 0 && pin[0] <= 480 && pin[1] >= 0 && pin[1] <= 270);
});

test('Paket F: Bosse, Kartengegner, Bestiarium und Ausrüstung liegen bereit', () => {
  const m = JSON.parse(readFileSync(sprite('manifest-kampf2.json'), 'utf8'));
  for (const [id, [path, w, h]] of Object.entries(OVERWORLD_SHEETS)) {
    assert.ok(existsSync(sprite(path)), path);
    const def = m.assets.find((a) => a.file === path);
    if (def) assert.deepEqual([def.frameWidth, def.frameHeight], [w, h], id);
  }
  for (const id of BESTIARY) assert.ok(existsSync(file(bestiaryUrl(id))), id);
  for (const id of F_EQUIPMENT) {
    assert.ok(existsSync(file(itemIconUrl(id))), id);
    assert.ok(existsSync(file(itemIcon32Url(id))), id);
  }
  for (const id of Object.values(BOSS_INTROS)) assert.ok(existsSync(sprite(bossIntroImage(id)[1])), id);
  for (const [key, [path]] of Object.entries(F_UI_SHEETS)) assert.ok(m.assets.some((a) => a.id === key && a.file === path), key);
  // Wilde Gegner mit passendem Kampf-Sheet bekommen ein Lauf-Sheet
  assert.equal(overworldIdFor('nebelgeist', { sheet: 'enemy_gasgeist' }), 'gasgeist');
  assert.equal(overworldIdFor('puppenfund', { sheet: 'enemy_schattenpuppe' }), null);
  for (const key of [...Object.values(BATTLE_BACKGROUNDS), ...Object.values(ENCOUNTER_BACKGROUNDS)]) assert.ok(existsSync(sprite(`battle/${key}.png`)), key);
});

test('Paket H: Köpfe, Quellen, Nahansichten und Risiko-Effekte liegen bereit', async () => {
  const H = await import('../src/world/assets.js');
  const m = JSON.parse(readFileSync(sprite('manifest-journal.json'), 'utf8'));
  for (const id of H.HEADS) assert.ok(existsSync(file(H.headUrl(id))), id);
  for (const id of H.SOURCE_KINDS) assert.ok(existsSync(file(H.sourceKindUrl(id))), id);
  for (const id of H.INSPECT_VIEWS) {
    assert.ok(existsSync(file(H.inspectUrl(id))), id);
    assert.ok(existsSync(file(H.inspectUrl(id, true))), id);
  }
  // Jedes untersuchbare Fundstück mit Nahansicht hat auch einen Untersuchen-Dialog
  for (const id of H.INSPECT_VIEWS) assert.ok(content.items[id]?.inspect, id);
  for (const key of ['player_inspect', 'risk_fx']) {
    const [path, w, h] = H.ANIM_SHEETS[key];
    const def = m.assets.find((a) => a.file === path);
    assert.deepEqual([def.frameWidth, def.frameHeight], [w, h], key);
  }
  const risk = m.assets.find((a) => a.id === 'H_06_risiko').animations;
  for (const k of ['unrest', 'curse', 'ambush', 'bonus_clue']) assert.ok(risk[k], k);
  const icons = m.assets.find((a) => a.id === 'H_06_risiko_icons').regions;
  for (const [k, [x, y, n]] of Object.entries(H.RISK_ICONS)) assert.deepEqual(icons[k], [x, y, n, n], k);
  const frame = m.assets.find((a) => a.id === 'H_journal_rahmen').regions;
  for (const [k, r] of Object.entries(H.JOURNAL_FRAME)) assert.deepEqual(frame[k], r, k);
  for (const id of ['verlorenes_gesangbuch', 'spiegelscherbe']) assert.ok(existsSync(file(itemIcon32Url(id))), id);
  assert.equal(H.sourceKind('note', 'Tagebuch der Pflegerin'), 'tagebuch');
  assert.equal(H.sourceKind('npc', 'Holt'), null);
});

test('Paket I: Sektengegner, Verwandlungen, Figuren, Reisebilder und Wappen liegen bereit', async () => {
  const I = await import('../src/world/assets.js');
  const m = JSON.parse(readFileSync(sprite('manifest-reise.json'), 'utf8'));
  const byFile = (path) => m.assets.find((a) => a.file === path);
  for (const id of I.I_ENEMIES) {
    const [path, w] = I.BATTLE_SHEETS[I.ENCOUNTER_SHEETS[id]];
    assert.equal(byFile(path)?.frameWidth, w, id);
    assert.ok(existsSync(sprite(I.OVERWORLD_SHEETS[id][0])), id);
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
  }
  for (const id of ['rost_streife', 'schleier_schatten']) assert.ok(I.BATTLE_SHEETS[I.ENCOUNTER_SHEETS[id]], id);
  for (const [id, sheet] of Object.entries(I.BOSS_FORMS).filter(([id]) => I.I_ENEMIES.includes(id))) { // spätere Pakete: eigene Tests
    assert.ok(byFile(I.BATTLE_SHEETS[sheet][0])?.animations?.phase2, id);
    assert.ok(content.encounters[id], id);
  }
  for (const id of [...I.I_CHARACTERS, 'rost_vater', 'schleier_mutter']) assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
  for (const id of I.I_CHARACTERS) assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
  for (const id of I.TRAVEL_SCENES) {
    assert.ok(existsSync(file(I.sceneUrl(id))), id);
    assert.ok(content.travelRules.events.some((e) => e.id === id), `Reiseereignis ${id}`);
  }
  for (const id of Object.keys(content.factions)) assert.ok(existsSync(file(I.factionEmblemUrl(id))), id);
  for (const url of [I.TRAVEL_MODES_URL, I.TRAVEL_MARKER_URL]) assert.ok(existsSync(file(url)), url);
  for (const id of ['rostwasser', 'ankerhaken', 'schleierdolch', 'porzellanmaske']) assert.ok(existsSync(file(itemIcon32Url(id))), id);
});

test('Paket G: Monster, Gebiete, Beute und Gefahren-Anzeige liegen bereit', async () => {
  const G = await import('../src/world/assets.js');
  const m = JSON.parse(readFileSync(sprite('manifest-wildnis.json'), 'utf8'));
  const byFile = (path) => m.assets.find((a) => a.file === path);
  for (const [id, [w, ow, oh]] of Object.entries(G.G_MONSTERS)) {
    assert.equal(byFile(G.BATTLE_SHEETS[`enemy_${id}`][0])?.frameWidth, w, id);
    const owDef = byFile(G.OVERWORLD_SHEETS[id][0]);
    assert.deepEqual([owDef?.frameWidth, owDef?.frameHeight], [ow, oh], id);
    assert.ok(existsSync(file(G.bestiaryUrl(id))), id);
    assert.ok(content.encounters[id], `Begegnung ${id}`);
    assert.equal(content.encounters[id].sheet, `enemy_${id}`, id);
  }
  for (const z of G.ZONES) {
    assert.ok(existsSync(sprite(`battle/${G.BATTLE_BACKGROUNDS[z]}.png`)), z);
    assert.equal(content.maps[z].tiles, `g_${z}`, z);
  }
  for (const path of Object.values(G.LOOT_SHEETS)) assert.equal(byFile(path)?.frameWidth, 16, path);
  for (const id of G.G_ITEMS) {
    assert.ok(existsSync(file(itemIconUrl(id))), id);
    assert.ok(existsSync(file(itemIcon32Url(id))), id);
  }
  for (const id of Object.keys(content.items)) if (G.G_ITEMS.includes(id)) assert.ok(content.items[id].name, id);
  const danger = m.assets.find((a) => a.id === 'danger').regions;
  G.DANGER_ICONS.forEach(([x, y], i) => assert.deepEqual([danger[`danger_${i + 1}`].x, danger[`danger_${i + 1}`].y], [x, y]));
  const r = m.assets.find((a) => a.id === 'rarity').regions;
  for (const [k, [x, y]] of Object.entries(G.RARITY_GEMS)) assert.deepEqual([r[`gem_${k}`].x, r[`gem_${k}`].y], [x, y], k);
});

test('Paket L: Stadtgegner, Kopfgelder und Beute liegen bereit', async () => {
  const L = await import('../src/world/assets.js');
  const m = JSON.parse(readFileSync(sprite('manifest-gegner3.json'), 'utf8'));
  const byFile = (path) => m.assets.find((a) => a.file === path);
  const order = m.assets.find((a) => a.id === 'L_zug_portraits').frameNames;
  for (const [id, [w, ow]] of Object.entries(L.L_ENEMIES)) {
    const def = byFile(L.BATTLE_SHEETS[`enemy_${id}`][0]);
    assert.equal(def?.frameWidth, w, id);
    const [atk, spc] = id === 'schmugglerkoenigin' ? ['attack_cutlass', 'attack_crate'] : ['attack_a', 'attack_b'];
    assert.ok(def.animations[atk] && def.animations[spc] && def.animations.hurt && def.animations.defeated, id);
    const owDef = byFile(L.OVERWORLD_SHEETS[id][0]);
    assert.deepEqual([owDef?.frameWidth, owDef?.frameHeight], [ow, 32], id);
    assert.ok(existsSync(file(L.bestiaryUrl(id))), id);
    assert.ok(L.BESTIARY.includes(id), id);
    assert.equal(order[L.TURN_PORTRAITS[id]], id);
  }
  for (const [, [key, path]] of Object.entries(L.BOSS_INTRO_IMAGES)) assert.ok(existsSync(sprite(path)), key);
  for (const bg of ['daecher', 'markthalle']) assert.ok(existsSync(sprite(`battle/${L.BATTLE_BACKGROUNDS[bg]}.png`)), bg);
  for (const fx of Object.values(L.ENCOUNTER_FX).map((f) => f.attack).filter((s) => s?.startsWith('fx_'))) assert.ok(existsSync(sprite(L.BATTLE_SHEETS[fx][0])), fx);
  for (const id of L.L_ITEMS) {
    assert.ok(existsSync(file(itemIconUrl(id))), id);
    assert.ok(existsSync(file(itemIcon32Url(id))), id);
  }
  for (const id of ['laternendieb', 'kanalschmuggler']) assert.ok(existsSync(file(L.wantedUrl(id))), id);
  assert.ok(existsSync(sprite(SHEETS.l_schmugglerkoenigin)));
});

test('Paket J: Fall 5 nutzt die echten Grafiken', async () => {
  const J = await import('../src/world/assets.js');
  const m = JSON.parse(readFileSync(sprite('manifest-fall5.json'), 'utf8'));
  const byFile = (path) => m.assets.find((a) => a.file === path);
  const order = m.assets.find((a) => a.id === 'J_zug_portraits').frameNames;
  for (const [id, [w, ow]] of Object.entries(J.J_ENEMIES)) {
    const def = byFile(J.BATTLE_SHEETS[`enemy_${id}`][0]);
    assert.equal(def?.frameWidth, w, id);
    assert.ok(def.animations.attack_a && def.animations.attack_b, id);
    assert.equal(byFile(J.OVERWORLD_SHEETS[id][0])?.frameWidth, ow, id);
    assert.ok(existsSync(file(J.bestiaryUrl(id))), id);
    assert.equal(order[J.TURN_PORTRAITS[id]], id);
    assert.ok(content.encounters[id], id);
  }
  const glocke = byFile(J.BATTLE_SHEETS[J.BOSS_FORMS.miriam][0]);
  assert.equal(glocke?.frameWidth, 96);
  for (const n of ['grabgelaeut', 'chor_stimmen', 'summon']) assert.ok(glocke.animations[n], n);
  for (const [key, path] of Object.values(J.BOSS_FORM_INTROS)) assert.ok(existsSync(sprite(path)), key);
  for (const bg of [...Object.values(J.BOSS_FORM_BACKGROUNDS), 'bg_giesserei', 'bg_haus_vey', 'bg_resonanzkammer']) assert.ok(existsSync(sprite(`battle/${bg}.png`)), bg);
  for (const fx of Object.values(J.ENCOUNTER_FX).flatMap((f) => Object.values(f)).filter((s) => /^fx_/.test(s))) assert.ok(existsSync(sprite(J.BATTLE_SHEETS[fx][0])), fx);
  for (const id of ['brannock', 'oda_vey', 'lilian_echo']) {
    assert.ok(content.npcs[id], id);
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
    assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
  }
  for (const id of J.J_ITEMS) assert.ok(existsSync(file(itemIcon32Url(id))), id);
  for (const id of J.J_ITEMS.slice(0, 6)) assert.ok(content.items[id], id); // Belohnungen kommen mit den Daten
  for (const id of J.J_SCENES) assert.ok(existsSync(file(J.sceneUrl(id))), id);
  for (const id of Object.keys(content.cases?.case_05?.endings ?? {})) assert.ok(existsSync(file(J.endingImageUrl(id, 'case_05'))), id);
  for (const id of ['c5_perfect', 'c5_good', 'c5_early', 'c5_rust']) assert.ok(existsSync(file(J.endingImageUrl(id, 'case_05'))), id);
  assert.ok(existsSync(file(J.caseFileUrl('case_05'))));
  for (const map of Object.keys(J.J_MAP_MARKERS)) assert.ok(content.maps[map], map);
  for (const map of ['giesserei', 'haus_vey', 'resonanzkammer']) assert.match(content.maps[map].tiles, /^j_/);
});

test('Paket K: Fall 6 nutzt die echten Grafiken', async () => {
  const K = await import('../src/world/assets.js');
  const m = JSON.parse(readFileSync(sprite('manifest-fall6.json'), 'utf8'));
  const byFile = (path) => m.assets.find((a) => a.file === path);
  const order = m.assets.find((a) => a.id === 'turn_portraits').frameNames;
  for (const [id, [w, ow]] of Object.entries(K.K_ENEMIES)) {
    const def = byFile(K.BATTLE_SHEETS[`enemy_${id}`][0]);
    assert.equal(def?.frameWidth, w, id);
    assert.ok(def.animations.hurt && def.animations.defeated, id);
    assert.equal(byFile(K.OVERWORLD_SHEETS[id][0])?.frameWidth, ow, id);
    assert.ok(existsSync(file(K.bestiaryUrl(id))), id);
    assert.equal(order[K.TURN_PORTRAITS[id]], id);
    assert.ok(content.encounters[id], id);
  }
  const gast = byFile(K.BATTLE_SHEETS.enemy_dreizehnter_gast[0]).animations;
  for (const n of ['belichtung', 'schattenschnitt', 'gruppenbild', 'phase2']) assert.ok(gast[n], n);
  assert.ok(existsSync(sprite(K.bossIntroImage(K.BOSS_INTROS.dreizehnter_gast)[1])));
  for (const fx of Object.values(K.ENCOUNTER_FX).flatMap((f) => Object.values(f)).filter((s) => /^fx_/.test(s))) assert.ok(existsSync(sprite(K.BATTLE_SHEETS[fx][0])), fx);
  for (const id of ['ashcombe', 'mews']) {
    assert.ok(content.npcs[id], id);
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
  }
  for (const id of K.K_ITEMS) assert.ok(existsSync(file(itemIcon32Url(id))), id);
  for (const id of K.K_SCENES) assert.ok(existsSync(file(K.sceneUrl(id))), id);
  for (const id of ['c6_perfect', 'c6_good', 'c6_early', 'c6_seer']) assert.ok(existsSync(file(K.endingImageUrl(id, 'case_06'))), id);
  assert.ok(existsSync(file(K.inspectUrl('fotoplatte'))) && existsSync(file(K.inspectUrl('fotoplatte', true))));
  assert.ok(existsSync(file(K.caseFileUrl('case_06'))));
  for (const map of ['atelier', 'ballsaal', 'spiegelkabinett']) assert.match(content.maps[map].tiles, /^k_/);
});

test('Paket M: Fall 7 und 8 nutzen die echten Grafiken', async () => {
  const M = await import('../src/world/assets.js');
  const m = JSON.parse(readFileSync(sprite('manifest-fall78.json'), 'utf8'));
  const byFile = (path) => m.assets.find((a) => a.file === path);
  const order = m.assets.find((a) => a.id === 'M_zug_portraits').frameNames;
  for (const [id, [w, ow]] of Object.entries(M.M_ENEMIES)) {
    assert.equal(byFile(M.BATTLE_SHEETS[`enemy_${id}`][0])?.frameWidth, w, id);
    if (ow) assert.equal(byFile(M.OVERWORLD_SHEETS[id][0])?.frameWidth, ow, id);
    assert.ok(existsSync(file(M.bestiaryUrl(id))), id);
    assert.equal(order[M.TURN_PORTRAITS[id]], id);
    assert.ok(content.encounters[id], id);
  }
  const netz = byFile(M.BATTLE_SHEETS[M.BOSS_FORMS.miss_wren][0]).animations;
  for (const n of ['schere', 'schuldnetz', 'albtraum', 'defeated']) assert.ok(netz[n], n);
  assert.ok(existsSync(sprite(M.bossIntroImage(M.BOSS_INTROS.miss_wren)[1])));
  for (const fx of Object.values(M.ENCOUNTER_FX).flatMap((f) => Object.values(f)).filter((s) => /^fx_/.test(s))) assert.ok(existsSync(sprite(M.BATTLE_SHEETS[fx][0])), fx);
  for (const id of ['finch', 'molly']) assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
  for (const id of M.M_ITEMS) assert.ok(existsSync(file(itemIcon32Url(id))), id);
  for (const id of M.M_SCENES) assert.ok(existsSync(file(M.sceneUrl(id))), id);
  for (const id of ['c7_heir', 'c7_wren', 'c8_perfect', 'c8_good', 'c8_early', 'c8_piper']) assert.ok(existsSync(file(M.endingImageUrl(id, 'case_08'))), id);
  for (const c of ['case_07', 'case_08']) assert.ok(existsSync(file(M.caseFileUrl(c))), c);
  for (const map of ['kontor_thorne', 'waisenhaus', 'traumkeller']) assert.match(content.maps[map].tiles, /^m_/);
});

test('Paket O: Geheime Treffen nutzen die echten Grafiken', async () => {
  const O = await import('../src/world/assets.js');
  const m = JSON.parse(readFileSync(sprite('manifest-treffen.json'), 'utf8'));
  for (const a of m.assets) assert.ok(existsSync(sprite(a.file)), a.file);
  for (const id of ['schleierbote', 'tresswell', 'vellacourt', 'kohlenjem']) {
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
    assert.ok(existsSync(file(O.portraitUrl(id))), id);
    assert.ok(O.headUrl(id), id);
  }
  const regions = Object.fromEntries(m.assets.filter((a) => a.regions).map((a) => [a.id, Object.keys(a.regions)]));
  for (const map of ['treffen_waage', 'treffen_kreide', 'treffen_russ']) {
    assert.match(content.maps[map].tiles, /^o_/, map);
    assert.equal(O.mapMarkerOf(map)[0], O.O_MAP_MARKERS_URL, map);
    for (const d of content.maps[map].decor) {
      const hit = /^o_(waage|kreide|russ)_props_(.+)$/.exec(d.sprite);
      if (!hit) continue;
      const names = regions[`${hit[1]}_props`];
      assert.ok(names.includes(hit[2]) || names.some((n) => n.startsWith(`${hit[2]}_`)), d.sprite);
    }
  }
});

test('Paket N: Sequenz 6/5, Artefakte und Asservatenkammer nutzen die echten Grafiken', async () => {
  const N = await import('../src/world/assets.js');
  const m = MANIFEST_FILES.manifestSequenzen2;
  for (const a of m.assets) assert.ok(existsSync(sprite(a.file)), a.file);
  const ids = m.assets.find((a) => a.id === 'skill_icons_2').skillIds.flat();
  ids.forEach((id, i) => {
    assert.equal(N.SKILL_ICONS_2[id], i, id);
    assert.equal(m.assets.find((a) => a.id === `fx_${id}`).frameWidth, SKILL_FX[id], id);
  });
  for (const id of [...N.N_ARTIFACTS, ...N.N_INGREDIENTS]) {
    assert.ok(content.items[id], id);
    assert.ok(existsSync(file(itemIcon32Url(id))), id);
  }
  for (const url of Object.values(N.PULSE_ICONS)) assert.ok(existsSync(file(url)), url);
  assert.ok(existsSync(file(N.ARTIFACT_UI_URL)));
  for (const id of ['thale', 'varga']) {
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
    assert.ok(existsSync(file(N.portraitUrl(id))), id);
    assert.ok(existsSync(file(N.headUrl(id))), id);
  }
});

test('Paket P und Q: Rituale und Wexmoor nutzen die echten Grafiken', async () => {
  const A = await import('../src/world/assets.js');
  for (const m of [MANIFEST_FILES.manifestRituale, MANIFEST_FILES.manifestWexmoor]) for (const a of m.assets) assert.ok(existsSync(sprite(a.file)), a.file);
  for (const p of A.RITUAL_PATHS) {
    assert.ok(content.pathways[p], p);
    assert.ok(existsSync(sprite(ANIM_SHEETS[`ritual_${p}`][0])), p);
    assert.ok(existsSync(file(A.ritualCardUrl(p))), p);
  }
  for (const id of ['zunder', 'druce', 'grauspaeher']) {
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
    assert.ok(existsSync(file(A.portraitUrl(id))), id);
  }
  const city = content.travelRules.cities.wexmoor;
  assert.ok(existsSync(sprite(city.map_image)) && existsSync(sprite(city.fog_image)));
  for (const map of Object.keys(A.Q_MAP_MARKERS)) {
    assert.ok(content.maps[map], map);
    assert.ok(city.pins[map], map);
    assert.equal(A.mapMarkerOf(map)[0], A.Q_MAP_MARKERS_URL);
  }
  assert.equal(content.maps.wx_kahn.tiles, 'q_kajuete');
});

// --- Paket R (Wexmoor, Kapitel 2) ----------------------------------------------------
test('Paket R: Wexmoor hat eigene Böden, Figuren, Bosse, Verkleidungen und Szenen', () => {
  const themes = new Set(THEME_TILE_LIST.map((t) => t.theme));
  for (const id of ['wx_bahnhof', 'wx_salzmarkt', 'wx_bojenhafen', 'wx_oberstadt', 'wx_pfahldorf', 'wx_torfstich', 'wx_akademie', 'wx_lucent',
    'wx_wachhaus', 'wx_zelle', 'wx_vergessmoor', 'wx_leuchtturm']) {
    assert.match(content.maps[id].tiles, /^(r_|c_bahnhof$)/, id);
    assert.ok(themes.has(content.maps[id].tiles), id);
    assert.ok(!content.maps[id].decor.some((d) => /^d_(gaswerk|nordtor|bruecken_winch|strassenmoebel)/.test(d.sprite)), `${id}: Platzhalter-Deko`);
  }
  for (const id of ['hesper', 'brack', 'pedell', 'sedge', 'wyle', 'lichtmann', 'hale', 'brandt']) {
    assert.ok(existsSync(sprite(`characters/R_${id}_walk.png`)), id);
    assert.ok(PORTRAITS[id], id);
  }
  assert.equal(content.zones.wx_vergessmoor.encounters.namenlose.sheet, 'enemy_namenlose');
  assert.equal(content.zones.wx_leuchtturm.encounters.leuchtfeuer.sheet, 'enemy_leuchtfeuer');
  for (const id of ['torfkittel', 'fischerjacke', 'akademierobe']) assert.ok(existsSync(sprite(`characters/R_spieler_${id}.png`)), id);
  for (const id of R_SCENES) assert.ok(existsSync(sprite(sceneUrl(id).replace(/^.*?sprites\//, ''))), id);
});

// --- Paket T (Zirkelmitglieder) -------------------------------------------------------
test('Paket T: alle Auktionsmitglieder haben Figur, Portrait und Kopf; Atlas-Regionen passen zum Manifest', () => {
  const zirkel = manifest('zirkel');
  const atlas = zirkel.assets.find((a) => a.id === 'T_auktion');
  for (const id of Object.keys(content.npcs).filter((n) => n.startsWith('tm_'))) {
    assert.ok(T_MEMBERS.includes(id), id);
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
    assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
    assert.ok(existsSync(sprite(`ui/heads/${id}.png`)), id);
  }
  const names = { waage: 'silent_scale', kreide: 'chalk_circle', russ: 'soot_society', lichtlose: 'lightless', salz: 'salt_brothers' };
  for (const [k, r] of Object.entries(AUKTION_REGIONS)) assert.deepEqual(r, atlas.regions[names[k] ?? k], k);
});

// --- Paket U (Gebäudefiguren) ---------------------------------------------------------
test('Paket U: Dunn, Crane und Quint haben eigene Figur, Portrait und Kopf', () => {
  for (const id of U_FIGURES) {
    assert.ok(content.npcs[id], id);
    assert.equal(CHARACTER_SHEETS[`npc_${id}`], `u_${id}`);
    assert.ok(existsSync(sprite(SHEETS[`u_${id}`])), id);
    assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
    assert.ok(existsSync(sprite(`ui/heads/${id}.png`)), id);
  }
});


// --- Paket S (Wexmoor-Monster, Einzelgänger, Salzwatt, Zirkel) -------------------------
test('Paket S: Monster, Einzelgänger, Gastgeber, Salzwatt und Zirkelräume nutzen die neue Kunst', () => {
  for (const id of [...Object.keys(S_ENEMIES), 'glockenmutter', ...S_LONERS]) {
    assert.ok(existsSync(sprite(BATTLE_SHEETS[`enemy_${id}`][0])), id);
    assert.ok(TURN_PORTRAITS[id] !== undefined, id);
  }
  for (const id of [...Object.keys(S_ENEMIES), 'glockenmutter', 'namenlose', 'leuchtfeuer']) assert.ok(existsSync(sprite(`ui/bestiary/S_${id}.png`)), id);
  for (const z of Object.values(content.zones)) {
    for (const [id, e] of Object.entries(z.encounters ?? {})) if (S_ENEMIES[id] || id === 'glockenmutter') assert.equal(e.sheet, `enemy_${id}`, id);
  }
  for (const id of [...S_LONERS, ...S_HOSTS]) {
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
    assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
  }
  for (const id of S_ITEMS) assert.ok(existsSync(sprite(`items/32/${id}.png`)), id);
  assert.equal(content.maps.wx_salzwatt.tiles, 's_salzwatt');
  assert.equal(content.maps.treffen_lichtlose.tiles, 's_lichtlose');
  assert.equal(content.maps.treffen_salz.tiles, 's_salz');
});

test('Liegengebliebene Bögen: Oberflächen-Ausschnitte liegen im Bild, Fundstücke sind Beute', async () => {
  const A = await import('../src/world/assets.js');
  for (const path of Object.values(A.UI_SKINS)) assert.ok(existsSync(sprite(path)), path);
  for (const [sheet, regions] of Object.entries(A.UI_REGIONS)) {
    const [path, w, h] = A.UI_SHEETS[sheet];
    assert.ok(existsSync(sprite(path)), path);
    for (const [name, [x, y, rw, rh]] of Object.entries(regions)) assert.ok(x >= 0 && y >= 0 && x + rw <= w && y + rh <= h, `${sheet}.${name}`);
  }
  for (const n of [1, 15, 40, 100]) assert.ok(existsSync(file(A.moneyIconUrl(n))), `Geld ${n}`);
  for (const id of ['ehering', 'liebesbrief', 'spieldose_klein', 'medaille_polizei']) {
    assert.equal(content.items[id]?.kind, 'trophy', id);
    assert.ok(Object.values(content.encounters).some((e) => e.loot?.drops?.some((d) => d.item === id)) || Object.values(content.loot ?? {}).some((t) => t.drops?.some((d) => d.item === id)), `${id} fällt nirgends`);
  }
  for (const id of ['elsbeth', 'price_wx', 'streife']) assert.ok(existsSync(sprite(`portraits/${A.PORTRAITS[id]}`)), id);
});

test('Liegengebliebene Tiles und Requisiten: Räume nutzen ihre Bögen, Deko liegt auf freiem Boden', () => {
  const tiles = { mietskaserne: 'd_wohnung', haus_morrow: 'b_interieur', schleierhaus: 'b_keller', pfandhaus: 'b_auktion', bestatter: 'b_sanatorium', wx_bahnhof: 'c_bahnhof' };
  for (const [map, theme] of Object.entries(tiles)) assert.equal(content.maps[map].tiles, theme, map);
  const used = new Set(Object.values(content.maps).flatMap((m) => (m.decor ?? []).map((d) => d.sprite)));
  for (const key of Object.keys(PROP_CELLS).filter((k) => /^(b|c_bahn)_/.test(k))) assert.ok(used.has(key), `${key} wird nirgends gezeigt`);
  for (const m of Object.values(content.maps)) for (const d of m.decor ?? []) {
    if (!/^(b|c_bahn)_/.test(d.sprite)) continue;
    const [x, y] = d.tile;
    assert.ok(!'I#E'.includes(m.rows[y][x]), `${m.id}: ${d.sprite} steht in der Wand`);
  }
});

// --- Paket V (Elsbeth, Gasthaus Glocke, Price) ---------------------------------------
test('Paket V: Elsbeth, die Ertrunkene Glocke und Prices Kampf nutzen die neue Kunst', () => {
  assert.equal(CHARACTER_SHEETS.npc_elsbeth, 'v_elsbeth');
  assert.ok(existsSync(sprite(SHEETS.v_elsbeth)));
  assert.ok(existsSync(sprite(`portraits/${PORTRAITS.elsbeth}`)));
  assert.ok(existsSync(sprite('ui/heads/elsbeth.png')));
  assert.equal(content.maps.wx_glocke.tiles, 'v_glocke');
  assert.equal(content.encounters.price_wx_fight.sheet, 'enemy_price');
  assert.ok(existsSync(sprite(BATTLE_SHEETS.enemy_price[0])));
});

// --- Paket W (Versunkene Altstadt, Monster, Bürgermeister) -----------------------------
test('Paket W: die Versunkene Altstadt, ihre Monster und der Bürgermeister nutzen die neue Kunst', () => {
  assert.equal(content.maps.wx_altstadt.tiles, 'w_altstadt');
  for (const id of [...W_ENEMIES, 'buergermeister']) {
    assert.equal(content.encounters[id].sheet, `enemy_${id}`, id);
    assert.ok(existsSync(sprite(BATTLE_SHEETS[`enemy_${id}`][0])), id);
    assert.ok(TURN_PORTRAITS[id] !== undefined, id);
    assert.ok(existsSync(sprite(`ui/bestiary/W_${id}.png`)), id);
  }
  for (const id of W_ENEMIES) assert.ok(existsSync(sprite(`characters/W_ow_${id}.png`)), id);
  for (const id of W_ITEMS) assert.ok(existsSync(sprite(`items/32/${id}.png`)) && existsSync(sprite(`items/${id}.png`)), id);
  assert.equal(BATTLE_BACKGROUNDS.wx_altstadt, 'bg_altstadt');
  assert.ok(existsSync(sprite(`${bossIntroImage('buergermeister_w')[1]}`)));
  assert.ok(content.maps.wx_altstadt.decor.some((d) => d.sprite === 'w_altstadt_props_town_hall'));
});

// --- Batch X (Artefakte, Fall 9, fehlende Portraits) -----------------------------------
test('Batch X: Artefakte, Fall-9-Kämpfe, Zug-Portraits, Büsten und Zirkel-Marker sind eingebunden', () => {
  for (const id of X_ITEMS) assert.ok(existsSync(sprite(`items/32/${id}.png`)) && existsSync(sprite(`items/${id}.png`)), id);
  for (const [enc, [id]] of Object.entries(X_FIGHTS)) {
    assert.ok(content.encounters[enc], enc);
    assert.equal(ENCOUNTER_SHEETS[enc], `enemy_${id}`);
    assert.ok(existsSync(sprite(BATTLE_SHEETS[`enemy_${id}`][0])), id);
  }
  for (const id of ['starling_fight', 'moorkoenigin', 'rattenkoenig', 'ossuarwaechter', 'sternhirsch']) assert.ok(existsSync(sprite(bossIntroImage(`${id}_x`)[1])), id);
  for (const id of ['rost_schlaeger', 'moorkoenigin', 'price_wx_fight', 'starling_fight']) assert.ok(TURN_PORTRAITS[id] !== undefined, id);
  for (const id of ['rost_schlaeger', 'schleier_seherin']) assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
  assert.ok(mapMarkerOf('treffen_salz')[0].includes('X_map_markers_zirkel'));
});

// --- Codex-Runde 7: Icon-Pakete BX, BY, BZ, CA, CB und BO-Artefakte --------------------
test('Runde 7: alle Fähigkeiten und Welt-Fähigkeiten haben ein Icon aus den Atlanten BZ/CA', async () => {
  const A = await import('../src/world/assets.js');
  for (const [name, aid, table, cols] of [['faehigkeiten2', 'skill_icons_3', A.SKILL_ICONS_3, 10], ['faehigkeiten2', 'talent_icons', A.TALENT_ICONS, 10],
    ['skill-icons-hoch', 'skill_icons_hoch', A.SKILL_ICONS_HOCH, 10], ['skill-icons-hoch', 'skill_icons_neu', A.SKILL_ICONS_NEU, 3]]) {
    const def = manifest(name).assets.find((a) => a.id === aid);
    assert.ok(existsSync(sprite(def.file)), def.file);
    assert.equal(def.columns, cols, aid);
    def.skillIds.flat().forEach((id, i) => assert.equal(table[id], i, `${aid}: ${id}`));
  }
  for (const p of Object.values(content.pathways)) {
    for (const sd of Object.values(p.seqs)) {
      assert.ok(A.skillIconOf(sd.skill.id), sd.skill.id);
      if (sd.skill2) assert.ok(A.skillIconOf(sd.skill2.id), sd.skill2.id);
      if (sd.talent) assert.ok(A.talentIconOf(sd.talent.id), sd.talent.id);
    }
  }
});

test('Runde 7: Nerven-, Konzentrations-, Fasserin- und Dunscar-Gegenstände nutzen eigene Icons', async () => {
  const A = await import('../src/world/assets.js');
  for (const name of ['konzentration', 'nerven-artefakte', 'icons3', 'fasserin']) for (const a of manifest(name).assets) assert.ok(existsSync(sprite(a.file)), a.file);
  const own = [...A.NERVEN_ARTEFAKTE, ...A.KONZENTRATION_ARTEFAKTE, ...A.ARTISAN_ARTEFAKTE, ...A.CB_ITEMS];
  for (const id of own) {
    assert.ok(content.items[id], id);
    assert.equal(itemIconUrl(id), `./sprites/items/${id}.png`, id); // kein Platzhalter mehr
    assert.ok(existsSync(file(itemIconUrl(id))), id);
  }
  for (const id of [...A.NERVEN_ARTEFAKTE, ...A.ARTISAN_ARTEFAKTE, ...A.CB_ITEMS_32]) {
    assert.equal(itemIcon32Url(id), `./sprites/items/32/${id}.png`, id);
    assert.ok(existsSync(file(itemIcon32Url(id))), id);
  }
});
