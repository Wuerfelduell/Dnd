// Seq-4-Ritual der Laterne: die Laternennacht in Echtzeit, ohne Kampfbildschirm (ohne Phaser, in Node testbar).
// WorldScene (world/LaternenNacht.js) zeichnet und füttert jede Spielsekunde mit Position und Tasten des Spielers.
//
// Regeln (Seb, 2026-11-12):
// - sechs Laternen im Kreis um den Startpunkt; jede brennt langsam herunter, Wesen an ihr saugen sie schneller leer.
// - fünfzehn Wesen kommen in Wellen und greifen immer die schwächste brennende Laterne an; nur Licht verletzt sie:
//   jede brennende Laterne versengt Wesen in ihrem Schein, das schwache Leuchten des Spielers ebenfalls (und schiebt sie weg).
// - Nachfüllen: neben einer Laterne R 1,5 s halten (kostet Nerven). Ein Treffer unterbricht und stößt zurück, Schaden statt Kampf.
// - Das eigene Leuchten zehrt an den Nerven; ohne Nerven erlischt es. Die Unruhe steigt mit der Dauer.
// - Nach dem fünfzehnten Wesen der Wächter: immun gegen einzelne Laternen, fällt nur durch den Sonnenaufgang (F), wenn er
//   zwischen drei brennenden Laternen steht (im Dreieck ihrer Standorte).
// - Gescheitert: alle Laternen aus, oder das Leben fällt auf 1.

export const WACHT = {
  lanterns: 6, ring: 76, light: 46, oilMax: 100, burn: 1.2, drainMonster: 16, drainGuardian: 26,
  refillRange: 20, refillSec: 1.5, refillNerves: 6, auraRadius: 22, auraDps: 3, auraNerves: 0.5, lightDps: 7, push: 18,
  monsters: 15, maxAlive: 6, spawnEvery: 2.4, chase: 36, spawnRadius: 175, monsterHp: 14, monsterSpeed: 22, monsterHit: 8, hitCooldown: 1.2, knock: 26,
  guardianSpeed: 15, guardianHit: 20, sunriseNerves: 20, sunriseFailNerves: 5, sunriseMinOil: 20, unruheEvery: 8,
};

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Liegt p im Dreieck a, b, c (Rand eingeschlossen)? */
export function inTriangle(p, a, b, c) {
  const s = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d1 = s(p, a, b);
  const d2 = s(p, b, c);
  const d3 = s(p, c, a);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

export class Laternenwacht {
  /** center: Startpunkt des Spielers, rng: Zufall, hooks: { nerves(), spend(n), hurt(n) → Leben danach, unruhe(n) } */
  constructor(center, { rng = Math.random, hooks, rules = WACHT } = {}) {
    this.r = rules;
    this.rng = rng;
    this.hooks = hooks;
    this.center = { ...center };
    this.lanterns = Array.from({ length: rules.lanterns }, (_, i) => {
      const a = (i / rules.lanterns) * Math.PI * 2 - Math.PI / 2;
      return { i, x: center.x + Math.cos(a) * rules.ring, y: center.y + Math.sin(a) * rules.ring, oil: rules.oilMax };
    });
    this.monsters = [];
    this.spawned = 0;
    this.kills = 0;
    this.guardian = null;
    this.spawnT = 1.5;
    this.t = 0;
    this.unruheT = 0;
    this.refill = null; // { lantern, t }
    this.aura = true;
    this.outcome = null; // 'won' | 'lost'
    this.reason = null;
    this.events = [];
    this.soundT = { attacked: 0, scorch: 0 }; // DS: Klirren und Zischen höchstens so oft, dass es nicht rattert
  }

  lit() {
    return this.lanterns.filter((l) => l.oil > 0);
  }

  /** Schwächste brennende Laterne (Ziel der Wesen). */
  weakest() {
    const lit = this.lit();
    return lit.length ? lit.reduce((a, b) => (b.oil < a.oil ? b : a)) : null;
  }

  /** Steht der Wächter zwischen drei brennenden Laternen (genug Öl)? */
  sunriseReady() {
    const g = this.guardian;
    if (!g) return false;
    const ok = this.lanterns.filter((l) => l.oil >= this.r.sunriseMinOil);
    for (let i = 0; i < ok.length; i++) for (let j = i + 1; j < ok.length; j++) for (let k = j + 1; k < ok.length; k++) {
      if (inTriangle(g, ok[i], ok[j], ok[k])) return true;
    }
    return false;
  }

  spawnMonster() {
    const a = this.rng() * Math.PI * 2;
    this.monsters.push({ id: this.spawned, x: this.center.x + Math.cos(a) * this.r.spawnRadius, y: this.center.y + Math.sin(a) * this.r.spawnRadius, hp: this.r.monsterHp, cd: 0 });
    this.spawned += 1;
  }

  /** Eine Zeitscheibe. input: { x, y, refill: Taste gehalten, sunrise: Taste gedrückt (einmalig) }. Gibt Ereignisse zurück. */
  update(dt, input) {
    this.events = [];
    if (this.outcome) return this.events;
    const r = this.r;
    const p = { x: input.x, y: input.y };
    this.t += dt;
    this.soundT.attacked = Math.max(0, this.soundT.attacked - dt);
    this.soundT.scorch = Math.max(0, this.soundT.scorch - dt);
    let attacked = null;
    let scorched = false;
    // Unruhe mit der Dauer
    this.unruheT += dt;
    while (this.unruheT >= r.unruheEvery) { this.unruheT -= r.unruheEvery; this.hooks.unruhe(1); }
    // Leuchten des Spielers zehrt an den Nerven
    this.aura = this.hooks.nerves() > 0;
    if (this.aura) this.hooks.spend(r.auraNerves * dt);
    // Laternen brennen herunter
    for (const l of this.lanterns) if (l.oil > 0) l.oil = Math.max(0, l.oil - r.burn * dt);
    // Wellen
    if (this.spawned < r.monsters) {
      this.spawnT -= dt;
      if (this.spawnT <= 0 && this.monsters.length < r.maxAlive) { this.spawnMonster(); this.spawnT = r.spawnEvery; }
    }
    // Wesen: zur schwächsten Laterne, im Licht versengt, am Spieler zuschlagen
    const target = this.weakest();
    for (const m of this.monsters) {
      m.cd = Math.max(0, m.cd - dt);
      // Wer dem Spieler zu nahe kommt, geht auf ihn los (Treffer unterbrechen das Nachfüllen)
      const chase = dist(m, p) <= r.chase ? p : null;
      if (chase) {
        const d = dist(m, chase);
        if (d > 6) { m.x += ((chase.x - m.x) / d) * r.monsterSpeed * dt; m.y += ((chase.y - m.y) / d) * r.monsterSpeed * dt; }
      } else if (target) {
        const d = dist(m, target);
        if (d > 8) { m.x += ((target.x - m.x) / d) * r.monsterSpeed * dt; m.y += ((target.y - m.y) / d) * r.monsterSpeed * dt; }
        else { target.oil = Math.max(0, target.oil - r.drainMonster * dt); attacked = target.i; }
      }
      for (const l of this.lanterns) {
        if (l.oil <= 0) continue;
        const d = dist(m, l);
        if (d <= r.light) {
          m.hp -= r.lightDps * dt;
          scorched = true;
          if (d > 0.1) { m.x += ((m.x - l.x) / d) * r.push * 0.35 * dt; m.y += ((m.y - l.y) / d) * r.push * 0.35 * dt; }
        }
      }
      const dp = dist(m, p);
      if (this.aura && dp <= r.auraRadius) {
        m.hp -= r.auraDps * dt;
        scorched = true;
        if (dp > 0.1) { m.x += ((m.x - p.x) / dp) * r.push * dt; m.y += ((m.y - p.y) / dp) * r.push * dt; }
      }
      if (dp <= 10 && m.cd <= 0) {
        m.cd = r.hitCooldown;
        this.hit(r.monsterHit, m, p);
      }
    }
    // DS: ein Wesen saugt an einer Laterne (Glasklirren), Licht versengt Wesen (Zischen)
    if (attacked !== null && this.soundT.attacked <= 0) { this.soundT.attacked = 1.4; this.events.push({ type: 'lantern_attacked', lantern: attacked }); }
    if (scorched && this.soundT.scorch <= 0) { this.soundT.scorch = 1.8; this.events.push({ type: 'scorch' }); }
    // Laternen, die in dieser Zeitscheibe schwach geworden oder erloschen sind (für Meldungen)
    for (const l of this.lanterns) {
      const state = l.oil <= 0 ? 'out' : l.oil < 25 ? 'weak' : 'ok';
      if (l.state && l.state !== state && state !== 'ok') this.events.push({ type: state === 'out' ? 'lantern_out' : 'lantern_weak', lantern: l.i });
      l.state = state;
    }
    const before = this.monsters.length;
    this.monsters = this.monsters.filter((m) => m.hp > 0);
    const died = before - this.monsters.length;
    if (died) { this.kills += died; this.events.push({ type: 'kill', n: died, kills: this.kills }); }
    // Wächter, sobald alle fünfzehn gefallen sind
    if (!this.guardian && this.kills >= r.monsters) {
      const a = this.rng() * Math.PI * 2;
      this.guardian = { x: this.center.x + Math.cos(a) * r.spawnRadius, y: this.center.y + Math.sin(a) * r.spawnRadius, cd: 0 };
      this.events.push({ type: 'guardian' });
    }
    const g = this.guardian;
    if (g) {
      g.cd = Math.max(0, g.cd - dt);
      const tg = this.weakest();
      if (tg) {
        // er stellt sich knapp innen vor seine Laterne, so steht er zwischen ihr und den Nachbarn
        const inner = { x: tg.x + (this.center.x - tg.x) * 0.15, y: tg.y + (this.center.y - tg.y) * 0.15 };
        const d = dist(g, inner);
        if (d > 4) { g.x += ((inner.x - g.x) / d) * r.guardianSpeed * dt; g.y += ((inner.y - g.y) / d) * r.guardianSpeed * dt; }
        if (dist(g, tg) <= 16) tg.oil = Math.max(0, tg.oil - r.drainGuardian * dt);
      }
      if (dist(g, p) <= 14 && g.cd <= 0) { g.cd = r.hitCooldown; this.hit(r.guardianHit, g, p); }
    }
    // Nachfüllen
    if (input.refill && !this.outcome) {
      const near = this.lanterns.filter((l) => dist(l, p) <= r.refillRange).sort((a, b) => dist(a, p) - dist(b, p))[0];
      if (!near) this.refill = null;
      else {
        if (this.refill?.lantern !== near.i) this.refill = { lantern: near.i, t: 0 };
        this.refill.t += dt;
        if (this.refill.t >= r.refillSec) {
          if (this.hooks.nerves() >= r.refillNerves) {
            this.hooks.spend(r.refillNerves);
            near.oil = r.oilMax;
            this.events.push({ type: 'refill', lantern: near.i });
          } else this.events.push({ type: 'tired' });
          this.refill = null;
        }
      }
    } else this.refill = null;
    // Sonnenaufgang
    if (input.sunrise && g && !this.outcome) {
      if (this.sunriseReady() && this.hooks.nerves() >= r.sunriseNerves) {
        this.hooks.spend(r.sunriseNerves);
        this.guardian = null;
        this.outcome = 'won';
        this.events.push({ type: 'sunrise' });
        return this.events;
      }
      this.hooks.spend(r.sunriseFailNerves);
      this.events.push({ type: 'sunrise_fail' });
    }
    if (!this.lit().length) { this.outcome = 'lost'; this.reason = 'Die letzte Laterne ist erloschen. Die Nacht hat gewonnen.'; }
    return this.events;
  }

  /** Treffer am Spieler: Schaden, Rückstoß, Nachfüllen unterbrochen. Bei 1 Leben ist die Nacht verloren. */
  hit(n, from, p) {
    const left = this.hooks.hurt(n);
    this.refill = null;
    const d = Math.max(0.1, dist(from, p));
    this.events.push({ type: 'hit', damage: n, knock: { x: ((p.x - from.x) / d) * this.r.knock, y: ((p.y - from.y) / d) * this.r.knock } });
    if (left <= 1 && !this.outcome) { this.outcome = 'lost'; this.reason = 'Du gehst zu Boden. Als du aufwachst, sind die Laternen kalt.'; }
  }
}
