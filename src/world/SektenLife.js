// BQ/BR: Sekten-Ereignisse auf der Karte. Die Spiellogik (Würfeln, Stufen, Fristen, Sabotagewirkung) steht in
// core/Sekten.js; hier entstehen daraus Kartenobjekte: Zeichen zum Lesen, Kultisten zum Ansprechen, gesperrte
// Brunnen/Laternen/Fähren mit Lösungsdialog, Kultplätze mit Wachen, Überfälle aus dem Nebel. Abgeworbene Figuren
// stehen nicht an ihrem Platz, bis das Ereignis endet. Ein Ereignis gilt als beendet, sobald sein Dialog das
// Aktivflag löscht; dann verschwinden die Objekte wieder (siehe tickSekten).
import Phaser from 'phaser';
import { createCharacterSheet, TILE } from './textures.js';
import { playSheetAnim, SK_KURZ, SK_ZEICHEN } from './assets.js';

const DIRS = ['down', 'left', 'right', 'up'];
const WALK = new Set(['.', ',', 'g', 'p', 'c', 's', 'P', 'w']);
const INTERACT_RANGE = 26;
const SABOTAGE_SPRITE = { heilung: 'brunnen', nacht: 'laterne', reise: { sk_flut: 'faehre', sk_chor: 'bahnhebel', sk_asche: 'bahnhebel' } };

export class SektenLife {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.ui = scene.ui;
    this.objects = {}; // Ereignis → Kartenobjekte und Sprites
    this.hiddenNpcs = [];
    this.cleanups = [];
  }

  /** Beim Aufbau der Karte. `visit`: echter Besuch (Reise, Start), kein Laden eines Spielstands. */
  build(visit) {
    const s = this.state;
    if (!s.sektenData?.()) return;
    for (const it of this.scene.interactables) if (it.kind === 'npc' && s.sektenAbwesend(it.def.id)) this.setHidden(it, true);
    let fresh = null;
    if (visit) fresh = s.sektenBesuch(s.map, Math.random);
    for (const ev of s.sektenAktiveAuf(s.map)) this.place(ev, ev.id === fresh?.id);
    this.applyDark();
    if (visit) {
      const hint = s.sektenHinweis(s.map);
      if (hint && !fresh) this.ui.toast(hint, 'gold');
    }
    this.checkHausZeichen();
    this.cleanups.push(s.on('sekten', (e) => this.onEvent(e)));
    this.scene.cleanups.push(() => this.destroy());
  }

  destroy() {
    for (const fn of this.cleanups) fn();
    this.cleanups = [];
  }

  onEvent(e) {
    const s = this.state;
    if (e.kind === 'ende') {
      if (e.map === s.map || e.ev.art === 'abwerbung') this.remove(e.id, e.grund === 'dialog');
      if (e.ev.art === 'abwerbung') for (const it of this.hiddenNpcs.filter((x) => x.def.id === e.ev.figur)) this.setHidden(it, false);
      if (e.ev.art === 'sabotage') this.applyDark();
      if (e.beute && (e.beute.money || Object.keys(e.beute.items).length)) this.ui.toast(`Beute vom Kultplatz: ${[e.beute.money ? `${e.beute.money} Schilling` : '', ...Object.keys(e.beute.items).map((id) => s.item(id)?.name ?? id)].filter(Boolean).join(', ')}`, 'gold');
    }
    if (e.kind === 'stufe' && s.sektenFrei()) {
      const k = s.sektenKult(e.kult);
      this.ui.toast(`${k.name}: ${s.sektenStufeName(e.kult)}${e.stufe > e.prev ? ' – die Umtriebe nehmen zu' : ' – die Umtriebe lassen nach'}`, e.stufe > e.prev ? 'warn' : 'gold');
    }
  }

  // --- Platz finden ---------------------------------------------------------------------------------------------

  /** Begehbare freie Kacheln, von (fx, fy) aus erreichbar, nach Abstand sortiert (nah, aber nicht auf dem Spieler). */
  freeTilesNear(fx, fy, min = 2, max = 7) {
    const rows = this.scene.mapDef.rows;
    const h = rows.length;
    const w = rows[0].length;
    const walk = (x, y) => y >= 0 && x >= 0 && y < h && x < w && WALK.has(rows[y][x]);
    const taken = new Set();
    const mark = (x, y, r) => { for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) taken.add(`${x + dx},${y + dy}`); };
    for (const it of this.scene.interactables) mark(Math.round((it.x - 8) / TILE), Math.round((it.y - 8) / TILE), 1);
    for (const d of this.scene.mapDef.decor ?? []) mark(d.tile[0], d.tile[1], 1);
    mark(fx, fy, min - 1);
    const seen = new Set([`${fx},${fy}`]);
    const out = [];
    const q = [[fx, fy, 0]];
    while (q.length) {
      const [x, y, d] = q.shift();
      if (d > max) continue;
      if (d >= min && !taken.has(`${x},${y}`) && x > 0 && y > 0 && x < w - 1 && y < h - 1) out.push([x, y, d]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = `${x + dx},${y + dy}`;
        if (!seen.has(k) && walk(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy, d + 1]); }
      }
    }
    return out;
  }

  /** Feste Kachel je Ereignis (gleicher Platz nach dem Laden): nahe der Figur, sonst nahe dem Spieler. */
  tileFor(ev, index = 0, near = null) {
    const a = this.state.sektenAktiv(ev.id);
    if (a?.tiles?.[index]) return a.tiles[index];
    const p = near ?? this.scene.player;
    const fx = Math.round((p.x - 8) / TILE);
    const fy = Math.round(((p.y - 3) - 8) / TILE);
    const free = this.freeTilesNear(fx, fy, index === 0 ? 2 : 1, 8);
    const pick = free.length ? free[Math.min(free.length - 1, index * 2 + 1)] : [fx + 1 + index, fy];
    if (a) (a.tiles ??= [])[index] = [pick[0], pick[1]];
    return [pick[0], pick[1]];
  }

  // --- Objekte -------------------------------------------------------------------------------------------------

  /** Figur (Lauf-Sheet) als ansprechbares Objekt, wie buildNpcs. */
  addNpc(evId, npcId, tile, { dialogue = null, prompt = null, kind = 'npc', extra = {} } = {}) {
    const sc = this.scene;
    const npc = this.state.content.npcs[npcId] ?? { name: npcId };
    const key = `npc_${npcId}`;
    createCharacterSheet(sc, key, npc.palette ?? {});
    const x = tile[0] * TILE + 8;
    const y = tile[1] * TILE + 15;
    const facing = 'down';
    const sprite = sc.add.sprite(x, y, key, DIRS.indexOf(facing) * 4).setOrigin(0.5, 1).setDepth(100 + y);
    const blocker = sc.addBlocker(x, y - 3, 10, 6);
    const item = {
      kind, def: { ...npc, id: npcId, dialogue: dialogue ?? npc.dialogue, ...extra }, sprite, blocker, x, y: y - 4,
      prompt: prompt ?? `Mit ${npc.name} sprechen`, facing, reach: INTERACT_RANGE, active: true, parts: [sprite], sekten: evId,
    };
    sc.interactables.push(item);
    (this.objects[evId] ??= []).push(item);
    return item;
  }

  /** Kartenobjekt (Zeichen, Brunnen, Kultplatz) wie in buildObjects, mit Funkeln. */
  addObject(evId, def, tile) {
    const sc = this.scene;
    const x = tile[0] * TILE + 8;
    const y = tile[1] * TILE + 8;
    const item = { kind: def.kind ?? 'read', def: { ...def, tile }, x, y, hidden: false, prompt: def.prompt, reach: def.reach ?? INTERACT_RANGE, active: true, parts: [], sekten: evId };
    if (def.sprite && sc.textures.exists(def.sprite)) {
      item.sprite = sc.add.sprite(x, y, def.sprite, 0).setDepth(def.ysort ? 100 + y + 8 : 50);
      if (def.origin) item.sprite.setOrigin(...def.origin);
      item.parts.push(item.sprite);
    }
    if (def.marker !== false) {
      item.glint = sc.add.image(x + 3, y - 5, 'glint').setDepth(60).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
      item.parts.push(item.glint);
      sc.tweens.add({ targets: item.glint, alpha: 0.9, duration: 700, yoyo: true, repeat: -1, repeatDelay: 1800 + Math.random() * 1500, delay: Math.random() * 2000 });
    }
    if (def.solid) item.blocker = sc.addBlocker(x, y + 2, def.solid[0], def.solid[1]);
    sc.interactables.push(item);
    (this.objects[evId] ??= []).push(item);
    return item;
  }

  /** Nur Bild, nicht benutzbar (Zeichen an der Tür, Flamme über dem Kultplatz). */
  addDecor(evId, sprite, tile, { anim = null, dy = 0, depth = null } = {}) {
    const sc = this.scene;
    if (!sc.textures.exists(sprite)) return null;
    const x = tile[0] * TILE + 8;
    const y = tile[1] * TILE + 8 + dy;
    const img = sc.add.sprite(x, y, sprite, 0).setDepth(depth ?? 100 + y + 8);
    if (anim && sc.anims.exists(anim)) img.play(anim);
    (this.objects[evId] ??= []).push({ parts: [img], decor: true });
    return img;
  }

  /** Ereignis-Effekt des Kults (Asche/Flut/Chor) an einer Stelle. */
  fx(ev, x, y) {
    const sc = this.scene;
    if (!sc.textures.exists('sk_ereignis')) return;
    const spr = sc.add.sprite(x, y - 8, 'sk_ereignis', 0).setDepth(100 + y + 20);
    if (!playSheetAnim(spr, 'sk_ereignis', SK_KURZ[ev.kult], () => spr.destroy())) spr.destroy();
  }

  setHidden(it, hidden) {
    it.active = !hidden && this.state.meets(it.def.visible_if);
    for (const p of it.parts) p.setVisible(it.active);
    if (it.blocker) it.blocker.body.enable = it.active;
    if (hidden && !this.hiddenNpcs.includes(it)) this.hiddenNpcs.push(it);
    if (!hidden) this.hiddenNpcs = this.hiddenNpcs.filter((x) => x !== it);
  }

  remove(evId, withFx = true) {
    const list = this.objects[evId] ?? [];
    for (const it of list) {
      if (withFx && it.x !== undefined) this.fx(this.state.sektenEreignis(evId) ?? { kult: 'sk_asche' }, it.x, it.y);
      for (const p of it.parts) p.destroy();
      it.blocker?.destroy();
      it.active = false;
    }
    this.scene.interactables = this.scene.interactables.filter((it) => it.sekten !== evId);
    delete this.objects[evId];
  }

  // --- Ereignisse ----------------------------------------------------------------------------------------------

  /** Objekte eines laufenden Ereignisses aufstellen. `fresh`: es hat gerade begonnen (Meldung, Dialog). */
  place(ev, fresh) {
    const s = this.state;
    const kurz = SK_KURZ[ev.kult];
    const kult = s.sektenKult(ev.kult);
    const say = () => {
      this.ui.toast(`${kult.name}: ${ev.meldung}`, 'warn');
      if (s.hasP2?.() && ev.koop_zeile) this.ui.toast(`Spieler 2: „${ev.koop_zeile}“`);
    };
    const figurItem = ev.figur ? this.scene.interactables.find((it) => it.kind === 'npc' && it.def.id === ev.figur) : null;
    switch (ev.art) {
      case 'spur': {
        const t = this.tileFor(ev, 0);
        this.addObject(ev.id, { id: ev.id, kind: 'read', title: ev.titel, text: ev.text, prompt: 'Zeichen ansehen', sprite: `sk_zeichen_${kurz}_${SK_ZEICHEN[kurz][0]}`,
          effects: ev.ende, done_flag: `${ev.id}_erledigt`, footer: `${kult.name} · ${kult.erkennungszeichen}` }, t);
        if (fresh) say();
        break;
      }
      case 'werbung': {
        const t = this.tileFor(ev, 0);
        this.addNpc(ev.id, `${ev.kult}_sprecher`, t, { dialogue: ev.dialog.id, prompt: 'Die Einladung anhören' });
        if (fresh) say();
        break;
      }
      case 'zeichen_am_haus': {
        if (figurItem) this.addDecor(ev.id, `sk_zeichen_${kurz}_${SK_ZEICHEN[kurz][1]}`, [Math.round((figurItem.x - 8) / TILE) + 1, Math.round((figurItem.y - 8) / TILE) - 1], { depth: 55 });
        if (fresh) say();
        break;
      }
      case 'abwerbung': {
        const near = this.hiddenNpcs.find((it) => it.def.id === ev.figur) ?? null;
        const t = this.tileFor(ev, 0, near);
        this.addNpc(ev.id, `${ev.kult}_hand`, t, { dialogue: ev.dialog.id, prompt: `Nach ${s.content.npcs[ev.figur]?.name ?? 'der Person'} fragen` });
        if (fresh) say();
        break;
      }
      case 'sabotage': {
        const t = this.tileFor(ev, 0);
        const art = ev.wirkung?.art;
        const region = art === 'reise' ? SABOTAGE_SPRITE.reise[ev.kult] : SABOTAGE_SPRITE[art] ?? 'haus';
        this.addObject(ev.id, { id: ev.id, kind: 'dialogue', title: ev.titel, role: kult.name, prompt: 'Störung ansehen', dialogue: ev.gegenmassnahme.dialog.id, sprite: `sk_sabotage_${region}`, solid: [12, 10] }, t);
        if (fresh) say();
        break;
      }
      case 'schrein': {
        const t = this.tileFor(ev, 0);
        this.addObject(ev.id, { id: ev.id, kind: 'dialogue', title: ev.titel, role: `Kultplatz ${kult.beiname ? `– ${kult.name}` : ''}`, prompt: 'Kultplatz untersuchen', dialogue: ev.dialog.id,
          sprite: `sk_schrein_${kurz}_base`, origin: [0.5, 0.8], ysort: true, solid: [30, 12] }, t);
        this.addDecor(ev.id, `sk_schrein_${kurz}_effekt`, t, { anim: `sk_schrein_${kurz}_effekt`, dy: -22, depth: 100 + t[1] * TILE + 40 });
        this.placeGuards(ev, t);
        if (fresh) say();
        break;
      }
      case 'ueberfall': {
        if (fresh) {
          this.ui.toast(`${kult.name}: ${ev.meldung}`, 'warn');
          this.scene.time.delayedCall(500, () => {
            if (!s.sektenAktiv(ev.id)) return;
            this.ui.openDialogue({ name: ev.titel, role: kult.name, dialogue: ev.dialog.id }, () => { if (s.sektenAktiv(ev.id)) this.placeAttackers(ev); });
          });
        } else this.placeAttackers(ev);
        break;
      }
      default:
        break;
    }
  }

  /** Wachen eines Kultplatzes: nacheinander zu stellen, ohne eigene Beute; sind alle fort, ist der Platz gesichert. */
  placeGuards(ev, center) {
    const a = this.state.sektenAktiv(ev.id);
    const beaten = a?.besiegt ?? [];
    const open = ev.gegner.filter((g, i) => !beaten.includes(i));
    if (!open.length) { this.state.flags.add(`${ev.id}_gesichert`); return; }
    ev.gegner.forEach((encId, i) => {
      if (beaten.includes(i)) return;
      const t = this.tileFor(ev, i + 1, { x: center[0] * TILE + 8, y: center[1] * TILE + 11 });
      const rang = encId.split('_').at(-1);
      this.addNpc(ev.id, `${ev.kult}_${rang}`, t, { kind: 'combat', prompt: 'Wache stellen', extra: { encounter: encId, no_loot: true, after: (r) => this.afterGuard(ev, i, r) } });
    });
  }

  afterGuard(ev, i, result) {
    if (result.outcome !== 'won') return;
    const a = this.state.sektenAktiv(ev.id);
    if (!a) return;
    (a.besiegt ??= []).push(i);
    const guard = (this.objects[ev.id] ?? []).find((it) => it.kind === 'combat' && it.def.encounter === ev.gegner[i] && it.active);
    if (guard) { for (const p of guard.parts) p.destroy(); guard.blocker?.destroy(); guard.active = false; this.scene.interactables = this.scene.interactables.filter((it) => it !== guard); }
    if (a.besiegt.length >= ev.gegner.length) {
      this.state.flags.add(`${ev.id}_gesichert`);
      this.ui.toast('Die Wachen sind fort. Der Kultplatz lässt sich jetzt abbauen.', 'gold');
      this.state.emit('changed');
    }
  }

  /** Überfall: Angreifer stellen sich in den Weg; der Sieg über alle beendet das Ereignis mit gewöhnlicher Beute. */
  placeAttackers(ev) {
    const a = this.state.sektenAktiv(ev.id);
    const beaten = a?.besiegt ?? [];
    ev.gegner.forEach((encId, i) => {
      if (beaten.includes(i)) return;
      const t = this.tileFor(ev, i, null);
      const rang = encId.split('_').at(-1);
      this.addNpc(ev.id, `${ev.kult}_${rang}`, t, { kind: 'combat', prompt: 'Stellen', extra: { encounter: encId, after: (r) => this.afterAttacker(ev, i, r) } });
    });
  }

  afterAttacker(ev, i, result) {
    const s = this.state;
    const a = s.sektenAktiv(ev.id);
    if (!a) return;
    if (result.outcome === 'lost') { s.applyEffects(ev.ende); return; } // Niederlage: keine Strafe, die Gestalten ziehen ab
    if (result.outcome !== 'won') return;
    (a.besiegt ??= []).push(i);
    const it = (this.objects[ev.id] ?? []).find((x) => x.kind === 'combat' && x.def.encounter === ev.gegner[i] && x.active);
    if (it) { for (const p of it.parts) p.destroy(); it.blocker?.destroy(); it.active = false; this.scene.interactables = this.scene.interactables.filter((x) => x !== it); }
    if (a.besiegt.length >= ev.gegner.length) s.applyEffects(ev.ende);
  }

  /** Markiertes Haus: beim nächsten Besuch bei der Figur öffnet sich ihr Zusatzgespräch. */
  checkHausZeichen() {
    const s = this.state;
    for (const ev of s.sektenAlleAktiven()) {
      if (ev.art !== 'zeichen_am_haus' || s.playTime - ev.start < 5) continue;
      const it = this.scene.interactables.find((x) => x.kind === 'npc' && x.def.id === ev.figur && x.active);
      if (!it) continue;
      this.scene.time.delayedCall(900, () => {
        if (!s.sektenAktiv(ev.id) || this.ui.isBlocking()) return;
        const npc = s.content.npcs[ev.figur];
        this.ui.openDialogue({ id: ev.figur, name: npc?.name ?? ev.figur, role: npc?.role ?? '', dialogue: ev.naechster_besuch.dialog.id });
      });
      break;
    }
  }

  /** Abgedrehte Laternen: die Karte bleibt dunkler, solange die Sabotage läuft. */
  applyDark() {
    const sc = this.scene;
    sc.baseNightSekten ??= sc.baseNight;
    sc.baseNight = this.state.sektenDunkel(this.state.map) ? Math.min(0.97, sc.baseNightSekten + 0.08) : sc.baseNightSekten;
    sc.lighting.nightAlpha = sc.state.spiritVision ? Math.max(0.5, sc.baseNight - 0.1) : sc.baseNight;
  }
}
