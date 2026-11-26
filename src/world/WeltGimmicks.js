import Phaser from 'phaser';
import { TILE } from './textures.js';
import { DEPTH } from './Lighting.js';
import { Combat } from '../core/Combat.js';
import { rollLoot, isEmptyLoot } from '../core/Loot.js';

// Welt-Fähigkeiten ab Seq 4 mit eigenem Kniff (Seb 2026-11-26): Was `gimmick` an einer Welt-Fähigkeit
// (data/packs/sequenzen/faehigkeiten2.json) auf der Karte bewirkt. Der Spielstand ruft nur das Ereignis
// 'talent' {effect: 'gimmick'} aus (core/Talents.js), die WorldScene setzt es hier um und meldet das Ergebnis.
// Keine neuen Grafiken: Ringe, Tönungen und Tweens aus Skriptgrafik.
//
// smite {radius, max, heal, text}   gewöhnliche Gegner im Umkreis brechen zusammen (gelten als besiegt, Beute fällt)
// freeze {radius, seconds, color}   Gegner erstarren (Bosse halb so lange)
// lure {seconds, where}             Gegner laufen zu einem Köder: 'here' Doppelgänger, 'ahead' 10 Felder voraus
// rob {radius, max}                 Gegner verlieren ihre Beute an dich, ohne Kampf (ein Behälter vor deinen Füßen)
// blink {tiles, through, smite}     Satz in Blickrichtung; through = durch Wände; smite = Gegner im Weg fallen
// rewind {seconds}                  zurück an den Ort von vor n Sekunden, Leben und Nerven von damals, wenn höher
// knockback {radius, seconds}       Gegner fliegen zurück und stehen benommen
// infight {seconds, max}            Gegner gehen aufeinander los: nach und nach fällt einer
// harvest                           alle liegenden Beutebehälter der Karte wandern zu dir
// tether                            Koop: der Partner steht sofort neben dir
// forget                            alle Gegner vergessen dich und kehren heim
// tribute {min, max, seconds}       jeder gewöhnliche Gegner zahlt Schilling und lässt dich in Ruhe

const HISTORY_MS = 500;
const HISTORY_LEN = 50; // 25 Sekunden Rückblick für `rewind`
const hex = (c) => Number.parseInt(String(c).replace('#', ''), 16);
const STEP = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

/** Gewöhnlicher Gegner: kein Boss, keine Elite, kein benannter, keiner mit Sequenzgrenze. */
export const isWeak = (r) => r.alive && !r.boss && !r.elite && !r.def?.bn && !r.enc?.min_seq && !r.enc?.boss;

export function installWeltGimmicks(scene) {
  const S = scene;
  S.weltHistory = {};
  S.time.addEvent({ delay: HISTORY_MS, loop: true, callback: () => recordHistory(S) });
  S.weltInstantWin = (r, verb) => instantWin(S, r, verb);
  S.weltPush = (r, from, tiles) => push(S, r, from, tiles);
}

/** Spielernummer der Figuren dieser Szene (im Splitscreen gehört die rechte Hälfte Spieler 2). */
function players(S) {
  if (S.splitRole === 2) return [[S.player, 2]];
  return S.playerSprites().map((q, i) => [q, i + 1]);
}

function spriteOf(S, n) {
  if (S.split || S.splitRole === 2) return S.splitRole === n ? S.player : null;
  return n === 2 ? S.p2 ?? null : S.player;
}

const real = (S) => S.realState ?? S.state;

function recordHistory(S) {
  if (!S.player || S.leaving) return;
  const st = real(S);
  for (const [q, n] of players(S)) {
    const snap = st.withPlayer(n, () => ({ hp: st.hp, c: st.composure }), { quiet: true });
    const list = (S.weltHistory[n] ??= []);
    list.push({ x: q.x, y: q.y, ...snap });
    if (list.length > HISTORY_LEN) list.shift();
  }
}

// --- Hilfen ------------------------------------------------------------------

/** Ist ein Punkt (Körpermitte) frei begehbar? Kacheln, Hindernisse und Kartenrand. */
function freeAt(S, x, y) {
  if (x < 6 || y < 6 || x > S.mapW - 6 || y > S.mapH - 6) return false;
  for (const [ox, oy] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) {
    if (S.groundLayer.getTileAtWorldXY(x + ox, y + oy)?.collides) return false;
  }
  for (const z of S.blockers?.getChildren?.() ?? []) {
    const b = z.body;
    if (b && x + 4 > b.x && x - 4 < b.right && y + 3 > b.y && y - 3 < b.bottom) return false;
  }
  return true;
}

/** Hängt ein freier Punkt mit dem Startpunkt zusammen (keine Falle hinter einer Mauer)? Flutfüllung über Kacheln. */
function connected(S, from, to) {
  const tx = (v) => Math.floor(v / TILE);
  const goal = `${tx(to.x)},${tx(to.y)}`;
  const seen = new Set([`${tx(from.x)},${tx(from.y)}`]);
  const queue = [[tx(from.x), tx(from.y)]];
  while (queue.length && seen.size < 6000) {
    const [x, y] = queue.shift();
    if (`${x},${y}` === goal) return true;
    for (const [dx, dy] of Object.values(STEP)) {
      const k = `${x + dx},${y + dy}`;
      if (seen.has(k)) continue;
      seen.add(k);
      if (freeAt(S, (x + dx) * TILE + 8, (y + dy) * TILE + 8)) queue.push([x + dx, y + dy]);
    }
  }
  return false;
}

function moveSprite(q, cx, cy) {
  const offY = q.body ? q.body.center.y - q.y : 0;
  const offX = q.body ? q.body.center.x - q.x : 0;
  if (q.body) q.body.reset(cx - offX, cy - offY);
  else q.setPosition(cx - offX, cy - offY);
}

function ring(S, x, y, color, radius, ms = 500) {
  const c = S.add.circle(x, y, 6, hex(color), 0).setStrokeStyle(2, hex(color), 0.9).setDepth(DEPTH.dark + 2).setBlendMode(Phaser.BlendModes.ADD);
  S.tweens.add({ targets: c, radius, alpha: 0, duration: ms, ease: 'Cubic.out', onComplete: () => c.destroy() });
}

function puff(S, x, y, color) {
  const c = S.add.circle(x, y - 8, 10, hex(color), 0.55).setDepth(DEPTH.dark + 2).setBlendMode(Phaser.BlendModes.ADD);
  S.tweens.add({ targets: c, scale: 2.2, alpha: 0, duration: 600, onComplete: () => c.destroy() });
}

function restoreTint(r) {
  if (!r.sprite?.setTint) return;
  if (r.elite) r.sprite.setTint(0xff9080);
  else if (r.enc?.tint) r.sprite.setTint(hex(r.enc.tint));
  else r.sprite.clearTint();
}

function alive(S) {
  return (S.roamers?.list ?? []).filter((r) => r.alive);
}

const dist = (r, q) => Math.hypot(r.body.x - q.x, r.body.y - (q.y - 3));

/** Gegner bricht ohne Kampf zusammen, wie vor der mythischen Gestalt: gilt als besiegt, Beute fällt. */
function instantWin(S, r, verb = 'bricht zusammen') {
  if (!r?.alive || r.boss) return false;
  const st = S.state;
  if (!st.pendingCombat) st.combatBy = st.acting;
  const c = new Combat(st, r.id);
  c.outcome = 'won';
  const result = c.finish({ deferLoot: true });
  puff(S, r.body.x, r.body.y, '#fff0c0');
  S.roamers.afterCombat(r, result);
  S.weltLast = `${c.enc.name} ${verb}`;
  return true;
}

/** Schiebt einen Gegner von einer Figur weg, nur so weit der Weg frei ist. */
function push(S, r, from, tiles) {
  const v = new Phaser.Math.Vector2(r.body.x - from.x, r.body.y - from.y);
  if (v.lengthSq() < 1) v.set(1, 0);
  v.normalize();
  let { x, y } = r.body;
  for (let i = 0; i < tiles * 4; i++) {
    const nx = x + v.x * 4;
    const ny = y + v.y * 4;
    if (!freeAt(S, nx, ny)) break;
    x = nx;
    y = ny;
  }
  r.body.body.reset(x, y);
}

// --- Wirkungen -----------------------------------------------------------------

export function applyGimmick(S, e) {
  const g = e.gimmick ?? {};
  const q = spriteOf(S, e.player);
  if (!q || !S.roamers) return;
  const n = e.player;
  const now = S.time.now;
  const say = (t) => S.ui?.toast?.(t, 'good');
  const st = real(S);

  if (g.rewind) {
    const list = S.weltHistory[n] ?? [];
    const back = Math.round((g.rewind.seconds * 1000) / HISTORY_MS);
    const snap = list[Math.max(0, list.length - back)];
    if (snap) {
      ring(S, q.x, q.y - 8, '#9aa8c8', 30);
      q.setPosition(snap.x, snap.y);
      q.body?.reset(snap.x, snap.y);
      const got = st.withPlayer(n, () => {
        const hp = snap.hp > st.hp ? st.heal(snap.hp - st.hp) : 0;
        const c = st.composure;
        if (snap.c > c) st.setComposure(snap.c);
        return { hp, c: Math.round(st.composure - c) };
      });
      S.weltHistory[n] = list.slice(0, Math.max(0, list.length - back));
      ring(S, snap.x, snap.y - 8, '#9aa8c8', 30);
      say(`${e.name}: zurück an den Ort von vor ${g.rewind.seconds} Sekunden${got?.hp ? `, +${got.hp} Leben` : ''}${got?.c ? `, +${got.c} Nerven` : ''}.`);
    } else say(`${e.name}: Hier gibt es noch nichts, wohin du zurückkönntest.`);
  }

  if (g.blink) {
    const [sx, sy] = STEP[n === 2 && S.p2 === q ? S.p2Facing : S.facing] ?? STEP.down;
    const start = { x: q.body?.center.x ?? q.x, y: q.body?.center.y ?? q.y };
    let land = null;
    const path = [];
    if (g.blink.through) {
      // Schlüssel: der fernste freie Punkt, der mit dem Rest der Karte verbunden ist
      for (let t = g.blink.tiles; t >= 1 && !land; t--) {
        const p = { x: start.x + sx * t * TILE, y: start.y + sy * t * TILE };
        if (freeAt(S, p.x, p.y) && connected(S, p, start)) land = p;
      }
    } else {
      let p = { ...start };
      for (let i = 0; i < g.blink.tiles * 4; i++) {
        const nx = p.x + sx * 4;
        const ny = p.y + sy * 4;
        if (!freeAt(S, nx, ny)) break;
        p = { x: nx, y: ny };
        path.push(p);
      }
      if (path.length) land = p;
    }
    if (land) {
      const ghost = S.add.sprite(q.x, q.y, q.texture.key, q.frame.name).setOrigin(q.originX, q.originY).setAlpha(0.5).setDepth(q.depth).setTint(0x9fb8ff);
      S.tweens.add({ targets: ghost, alpha: 0, duration: 450, onComplete: () => ghost.destroy() });
      moveSprite(q, land.x, land.y);
      ring(S, q.x, q.y - 8, g.blink.smite ? '#d0c0a0' : '#c8b0ff', 22, 350);
      let k = 0;
      if (g.blink.smite) {
        for (const r of alive(S).filter(isWeak)) {
          if (path.some((p) => Math.hypot(r.body.x - p.x, r.body.y - p.y) < 18) && instantWin(S, r, 'bleibt zerdrückt liegen')) k++;
        }
        S.roamers.graceUntil = Math.max(S.roamers.graceUntil, now + 1500);
      }
      say(`${e.name}: ${k ? `${k} ${k === 1 ? 'Gegner bleibt' : 'Gegner bleiben'} auf deinem Weg liegen.` : 'Satz geglückt.'}`);
    } else say(`${e.name}: Kein freier Platz in Blickrichtung.`);
  }

  if (g.smite) {
    const { radius = 5, max = 1, heal = 0, color = '#fff0c0' } = g.smite;
    ring(S, q.x, q.y - 8, color, radius * TILE);
    const targets = alive(S).filter((r) => isWeak(r) && dist(r, q) < radius * TILE).sort((a, b) => dist(a, q) - dist(b, q)).slice(0, max);
    let k = 0;
    let healed = 0;
    for (const r of targets) {
      if (!instantWin(S, r)) continue;
      k++;
      if (heal) healed += st.withPlayer(n, () => st.heal(Math.max(1, Math.round(st.maxHp * heal)))) ?? 0;
    }
    if (k === 1) say(`${g.smite.text ?? e.name}: ${S.weltLast}.${healed ? ` +${healed} Leben.` : ''}`);
    else if (k) say(`${g.smite.text ?? e.name}: ${k} Gegner fallen.${healed ? ` +${healed} Leben.` : ''}`);
    else say(`${g.smite.text ?? e.name}: Kein gewöhnlicher Gegner in Reichweite.`);
  }

  if (g.freeze) {
    const { radius = 99, seconds = 10, color = '#bfd8ff' } = g.freeze;
    ring(S, q.x, q.y - 8, color, Math.min(radius, 12) * TILE, 700);
    const hit = alive(S).filter((r) => dist(r, q) < radius * TILE);
    for (const r of hit) {
      const ms = seconds * 1000 * (r.boss ? 0.5 : 1);
      r.stunUntil = Math.max(r.stunUntil ?? 0, now + ms);
      r.body.body.setVelocity(0, 0);
      r.sprite?.setTint?.(hex(color));
      r.sprite?.anims?.pause?.();
      S.time.delayedCall(ms, () => { if (!r.alive) return; restoreTint(r); r.sprite?.anims?.resume?.(); });
    }
    say(hit.length ? `${e.name}: ${hit.length} ${hit.length === 1 ? 'Gegner erstarrt' : 'Gegner erstarren'} für ${seconds} Sekunden.` : `${e.name}: Kein Gegner in Reichweite.`);
  }

  if (g.knockback) {
    const { radius = 5, seconds = 5 } = g.knockback;
    ring(S, q.x, q.y - 8, '#e8e8ff', radius * TILE, 400);
    S.cameras.main.shake(180, 0.006);
    const hit = alive(S).filter((r) => !r.boss && dist(r, q) < radius * TILE);
    for (const r of hit) {
      push(S, r, q, 3);
      r.stunUntil = Math.max(r.stunUntil ?? 0, now + seconds * 1000);
      r.mode = 'wander';
      r.target = null;
    }
    S.roamers.graceUntil = Math.max(S.roamers.graceUntil, now + 1500);
    say(hit.length ? `${e.name}: ${hit.length} Gegner fliegen zurück und bleiben ${seconds} Sekunden benommen.` : `${e.name}: Niemand in Reichweite.`);
  }

  if (g.lure) {
    const { seconds = 25, where = 'ahead' } = g.lure;
    let x = q.x;
    let y = q.y;
    if (where === 'ahead') {
      const [sx, sy] = STEP[n === 2 && S.p2 === q ? S.p2Facing : S.facing] ?? STEP.down;
      x = Phaser.Math.Clamp(q.x + sx * 10 * TILE, 8, S.mapW - 8);
      y = Phaser.Math.Clamp(q.y + sy * 10 * TILE, 8, S.mapH - 8);
      const mark = S.add.circle(x, y - 6, 5, 0xbfd8ff, 0.6).setDepth(DEPTH.dark + 2).setBlendMode(Phaser.BlendModes.ADD);
      S.tweens.add({ targets: mark, scale: 2.4, alpha: 0.1, duration: 700, yoyo: true, repeat: Math.floor((seconds * 1000) / 1400), onComplete: () => mark.destroy() });
    } else {
      // Maske: ein Doppelgänger bleibt stehen
      const ghost = S.add.sprite(q.x, q.y, q.texture.key, q.frame.name).setOrigin(q.originX, q.originY).setAlpha(0.65).setDepth(q.depth).setTint(0xd8c8ff);
      S.tweens.add({ targets: ghost, alpha: 0.35, duration: 900, yoyo: true, repeat: -1 });
      S.time.delayedCall(seconds * 1000, () => S.tweens.add({ targets: ghost, alpha: 0, duration: 400, onComplete: () => ghost.destroy() }));
    }
    const hit = alive(S).filter((r) => !r.boss);
    for (const r of hit) r.lure = { x, y: y - 3, until: now + seconds * 1000 };
    say(hit.length ? `${e.name}: ${hit.length} Gegner folgen ${seconds} Sekunden lang ${where === 'here' ? 'deinem Doppelgänger' : 'deiner Stimme'}.` : `${e.name}: Niemand auf dieser Karte, der dir folgen könnte.`);
  }

  if (g.rob) {
    const { radius = 4, max = 1 } = g.rob;
    const loot = { money: 0, items: {} };
    const targets = alive(S).filter((r) => !r.boss && !r.robbed && dist(r, q) < radius * TILE).sort((a, b) => dist(a, q) - dist(b, q)).slice(0, max);
    for (const r of targets) {
      r.robbed = true;
      const table = S.state.content.loot?.[r.id] ?? S.state.content.loot?.[r.def.encounter];
      const got = rollLoot(table);
      loot.money += got.money || 3 + Math.floor(Math.random() * 8);
      for (const [id, k] of Object.entries(got.items)) loot.items[id] = (loot.items[id] ?? 0) + k;
      puff(S, r.body.x, r.body.y, '#ffe08a');
    }
    if (targets.length && !isEmptyLoot(loot)) {
      S.roamers.dropLoot(q.x + 10, q.y + 4, loot, targets.length === 1 ? targets[0].enc.name : 'Fremde Taschen');
      say(`${e.name}: ${targets.length === 1 ? `${targets[0].enc.name} merkt nichts` : `${targets.length} Gegner merken nichts`}, die Beute liegt vor deinen Füßen.`);
    } else say(`${e.name}: Keine Tasche in Reichweite, die du nicht schon geleert hast.`);
  }

  if (g.harvest) {
    const drops = (S.roamers.drops ?? []).filter((it) => it.active);
    drops.forEach((it, i) => {
      const a = (i / Math.max(1, drops.length)) * Math.PI * 2;
      const tx = q.x + Math.cos(a) * 16;
      const ty = q.y + 6 + Math.sin(a) * 9;
      const dx = tx - it.x;
      const dy = ty - it.y;
      it.x += dx;
      it.y += dy;
      for (const part of it.parts) S.tweens.add({ targets: part, x: part.x + dx, y: part.y + dy, duration: 700, ease: 'Sine.inOut' });
      if (it.glow) { it.glow.x = (it.glow.x ?? 0) + dx; it.glow.y = (it.glow.y ?? 0) + dy; }
    });
    say(drops.length ? `${e.name}: ${drops.length} ${drops.length === 1 ? 'Behälter wandert' : 'Behälter wandern'} zu dir.` : `${e.name}: Auf dieser Karte liegt keine Beute.`);
  }

  if (g.tether) {
    const other = S.split || S.splitRole === 2 ? null : n === 1 ? S.p2 : S.player;
    if (other) {
      const cx = q.body?.center.x ?? q.x;
      const cy = q.body?.center.y ?? q.y;
      const spot = [[14, 0], [-14, 0], [0, 12], [0, -12]].map(([ox, oy]) => ({ x: cx + ox, y: cy + oy })).find((p) => freeAt(S, p.x, p.y)) ?? { x: cx, y: cy };
      moveSprite(other, spot.x, spot.y);
      ring(S, other.x, other.y - 8, '#c8b0ff', 18, 350);
      say(`${e.name}: Der Faden zieht deinen Partner an deine Seite.`);
    }
  }

  if (g.forget) {
    for (const r of alive(S)) { r.mode = 'return'; r.target = { ...r.home }; r.noticed = false; r.lure = null; r.peaceUntil = Math.max(r.peaceUntil ?? 0, now + 5000); r.alert?.setVisible?.(false); }
    S.roamers.graceUntil = Math.max(S.roamers.graceUntil, now + 4000);
    ring(S, q.x, q.y - 8, '#8fa36b', 10 * TILE, 900);
    say(`${e.name}: Jeder Gegner der Karte hat vergessen, dass es dich gibt.`);
  }

  if (g.tribute) {
    const { min = 8, max = 15, seconds = 90 } = g.tribute;
    const payers = alive(S).filter(isWeak);
    let sum = 0;
    for (const r of payers) { sum += min + Math.floor(Math.random() * (max - min + 1)); r.peaceUntil = now + seconds * 1000; puff(S, r.body.x, r.body.y, '#ffd75e'); }
    const got = sum ? st.withPlayer(n, () => st.addMoney(sum, { loot: true, reason: e.name })) : 0;
    say(payers.length ? `${e.name}: ${payers.length} Gegner zahlen ${got} Schilling und lassen dich ${seconds} Sekunden in Ruhe.` : `${e.name}: Hier schuldet dir niemand etwas.`);
  }

  if (g.infight) {
    const { seconds = 60, max = 6 } = g.infight;
    const every = (seconds * 1000) / max;
    let left = max;
    say(`${e.name}: Die Gegner der Karte halten einander für dich.`);
    const tick = () => {
      if (!S.scene.isActive() && !S.scene.isPaused()) return;
      const pool = alive(S).filter(isWeak);
      if (!pool.length || left <= 0) return;
      left--;
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (instantWin(S, r, 'fällt einem anderen Gegner zum Opfer')) say(S.weltLast);
      if (left > 0) S.time.delayedCall(every, tick);
    };
    S.time.delayedCall(Math.min(2500, every), tick);
  }

  S.refreshVisibility?.();
}
