// Codex DN (Seq-4-Rituale), DO (Schattensteuerung) und DQ (Seq-5/6-Rituale): Laden und Abspielen der 132 Ritualgrafiken.
// Die Tabelle (data/ritualArt.js) ist aus den drei Manifesten erzeugt; Texture-Key = Dateiname ohne .png
// (Kampfblätter gleichen Namens: <name>_battle). Fehlt ein Bild, liefern alle Helfer false bzw. null, und das Spiel
// bleibt bei seinen bisherigen Platzhaltern (Kreise, Tönungen).
import { RITUAL_ART } from '../data/ritualArt.js';

export { RITUAL_ART };
const BASE = './sprites/';

/** Lädt alle Ritualblätter als Spritesheets (in preloadSprites). */
export function preloadRitualArt(scene, skip = {}) {
  for (const [key, e] of Object.entries(RITUAL_ART)) {
    if (key in skip) continue; // Kampfblätter lädt preloadSprites über BATTLE_SHEETS
    if (!scene.textures.exists(key)) scene.load.spritesheet(key, BASE + e.file, { frameWidth: e.w, frameHeight: e.h });
  }
}

/** Gibt es das Blatt (geladen)? */
export const hasArt = (scene, key) => !!RITUAL_ART[key] && scene.textures.exists(key);

/** Phaser-Animation `<key>:<name>` aus der Tabelle anlegen; liefert den Schlüssel oder null. */
export function ritualAnim(scene, key, name = 'play') {
  const e = RITUAL_ART[key];
  if (!e || !scene.textures.exists(key)) return null;
  const a = e.anims?.[name] ?? (name === 'play' ? Object.values(e.anims ?? {})[0] : null);
  if (!a) return null;
  const id = `${key}:${name}`;
  if (!scene.anims.exists(id)) {
    const [frames, fps, repeat] = a;
    scene.anims.create({ key: id, frames: frames.map((frame) => ({ key, frame })), frameRate: fps || 8, repeat });
  }
  return id;
}

/** Spielt eine Animation auf einem vorhandenen Sprite (ggf. Texturwechsel). */
export function playRitual(sprite, key, name = 'play', then) {
  const id = ritualAnim(sprite.scene, key, name);
  if (!id) return false;
  if (sprite.texture.key !== key) sprite.setTexture(key);
  sprite.play(id, true);
  if (then) sprite.once(`animationcomplete-${id}`, then);
  return true;
}

/**
 * Einmal-Effekt an (x, y), danach entfernt. Optionen: anim, scale, depth, screen (fest am Bildschirm, linke obere Ecke),
 * alpha, fps (eigenes Tempo), follow (Objekt mit x/y, dem der Effekt folgt), dy (Versatz zu follow), blend ('add'), loop (bleibt stehen, gibt Sprite zurück).
 */
export function ritualFx(scene, key, x, y, opts = {}) {
  const id = ritualAnim(scene, key, opts.anim ?? 'play');
  if (!id) return null;
  const s = scene.add.sprite(x, y, key, 0).setDepth(opts.depth ?? 30).setScale(opts.scale ?? 1).setAlpha(opts.alpha ?? 1);
  if (opts.screen) s.setOrigin(0).setScrollFactor(0);
  if (opts.origin) s.setOrigin(...opts.origin);
  if (opts.blend === 'add') s.setBlendMode('ADD');
  if (opts.follow) {
    const f = opts.follow;
    const dy = opts.dy ?? 0;
    const tick = () => { if (s.active && f.active !== false) s.setPosition(f.x, f.y + dy); };
    scene.events.on('update', tick);
    s.once('destroy', () => scene.events.off('update', tick));
  }
  s.play(opts.fps ? { key: id, frameRate: opts.fps } : id);
  if (!opts.loop) s.once(`animationcomplete-${id}`, () => s.destroy());
  return s;
}

/** Einzelbild (z. B. HUD-Symbol): Sprite mit festem Frame. */
export function ritualImage(scene, key, frame, x, y, opts = {}) {
  if (!hasArt(scene, key)) return null;
  const f = typeof frame === 'string' ? (RITUAL_ART[key].anims?.[frame]?.[0]?.[0] ?? 0) : frame ?? 0;
  const s = scene.add.image(x, y, key, f).setDepth(opts.depth ?? 60).setScale(opts.scale ?? 1);
  if (opts.screen) s.setScrollFactor(0);
  if (opts.origin) s.setOrigin(...opts.origin);
  return s;
}

/** Erster Frame einer benannten Animation (Zustandsbilder wie voll_0, offen_2). */
export const artFrame = (key, name) => RITUAL_ART[key]?.anims?.[name]?.[0]?.[0] ?? null;

/** Region aus der Tabelle (x, y, w, h) oder null. */
export const artRegion = (key, name) => RITUAL_ART[key]?.regions?.[name] ?? null;

/** Ausschnitt eines Frames als CSS-Region für die DOM-Oberfläche: [url, [x, y, w, h], Blattbreite, Blatthöhe]. */
export function artCss(key, frame = 0) {
  const e = RITUAL_ART[key];
  if (!e) return null;
  const f = typeof frame === 'string' ? artFrame(key, frame) ?? 0 : frame;
  const cols = Math.max(1, Math.round(e.sw / e.w));
  return [BASE + e.file, [(f % cols) * e.w, Math.floor(f / cols) * e.h, e.w, e.h], e.sw, e.sh];
}

/** Welche Spielfigur (player, p2a, p2b) trägt dieser Spieler? Für die Zivilisten-, Schatten- und Kokonblätter. */
export const lookOf = (state, n) => (n === 2 ? state.p2Look?.() ?? 'p2a' : 'player');
