// Nur Analyse: Entwürfe werden ausschließlich im Arbeitsspeicher zusammengeführt.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../../../tests/helpers.js';
import { GameState } from '../../../src/core/GameState.js';
import { Combat, SKILLS, AP_MAX, ENEMY_HP_MULT, ENEMY_DMG_MULT, DUO_HP_MULT } from '../../../src/core/Combat.js';
// Seit dem Einbau liegen die Daten unter src/data/packs/sequenzen; verglichen wird mit dem Stand ohne Paket AF
const read = name => JSON.parse(readFileSync(new URL(`../../../src/data/packs/sequenzen/${name}`, import.meta.url), 'utf8'));
export function draftContent() {
  const c = loadContent({ sequenzen: false });
  for (const [id, p] of Object.entries(read('seq_4_bis_1.json'))) Object.assign(c.pathways[id].seqs, p.seqs);
  Object.assign(c.pathways, read('neue_pfade.json'));
  Object.assign(c.items, read('zutaten.json'));
  for (const [id, a] of Object.entries(read('artefakte.json'))) {
    c.artifacts.list[id] = a;
    c.items[id] = { ...a, kind: 'artifact' };
  }
  return c;
}
export function hero(content, id, seq) {
  const s = new GameState(content);
  s.addItem('schlagstock'); s.equip('schlagstock');
  if (id) {
    s.pathway = { id, seq, digestion: 100 };
    // Explizite Simulation des vorgeschlagenen Metadaten-Adapters, kein Code-Patch.
    s.growthSteps = () => s.reachedSeqs().reduce((n, d) => n + (d.growth_steps ?? ([7, 6].includes(d.seq) ? 2 : 1)), 0);
  }
  s.updateMaxHp(); s.hp = s.maxHp; s.composure = s.maxComposure();
  return s;
}
export function measure(content, pid, seq, skill, { occult = false, armor = 0, grade = 'good' } = {}) {
  const s = hero(content, pid, seq);
  const c = new Combat(s, 'fog_hound');
  c.enemy.hp = c.enemy.maxHp = 1000000; c.enemy.occult = occult;
  c.armor = armor; c.weak = false; c.enemyGuard = 0; c.ap = AP_MAX;
  const before = s.composure;
  const result = c.useSkill(skill.id, Array(skill.hits).fill(grade));
  let dot = 0;
  for (let n = 0; n < (skill.burn?.[1] ?? 0); n++) dot += c.endRound();
  return { direct: result.total, dot, total: result.total + dot, nerves: before - s.composure };
}
export function rows(content = draftContent()) {
  return Object.entries(content.pathways).flatMap(([pid, p]) => Object.entries(p.seqs)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([seq, d]) => ({ pid, seq: Number(seq), skill: d.skill,
      normal: measure(content, pid, Number(seq), d.skill),
      occult: measure(content, pid, Number(seq), d.skill, { occult: true }),
      armored: measure(content, pid, Number(seq), d.skill, { armor: 3 }) })));
}
export function report() {
  const c = draftContent(), all = rows(c);
  const out = ['# Balancing AF', '',
    'Reproduzierbarer Entwurf, kein Nachweis einer fertig balancierten Kampagne. Erzeugung: `node docs/story/sequenzen/balancing.mjs > docs/story/sequenzen/balancing.md`.', '',
    '## Rechenbasis', '',
    'Die Tabelle führt echte `Combat.useSkill`- und `endRound`-Aufrufe aus. Jede Fertigkeit wird auf ihrer Freischaltsequenz mit Dienstschlagstock (6 Angriff), allen bis dahin erworbenen Pfadpassiven, vollen Nerven, 6 Konzentration, ohne Kleidung/Artefakte, ohne vorherige Schwachstelle und ohne Gegnerschutz gerechnet. Alle Takttreffer sind `good`. Der Prüfgegner lebt lang genug für alle Brandrunden. Dies ist Einzelanwendungs-Schaden, kein Schaden pro Runde.', '',
    'Normal/okkult bezeichnet den Gegner, nicht den Angriff. Bei Flat-Skills: pro Treffer `round(flat × Timing × holy × occult_mult × dmg_mult × vorhandene Schwachstelle)`. Bei Waffen-Skills: `round((6 + atk) × mult × Timing × occult_mult × dmg_mult × vorhandene Schwachstelle)`. `holy` verdoppelt nur den Flat-Grundschaden gegen Okkultes. Die Rundung erfolgt je Treffer. `weak` wird erst nach der ersten Schadensabrechnung gesetzt und verstärkt spätere Angriffe um 50 %. `sure` macht einen Miss zum Good; Perfect ist ×1,3 vor Rundung.', '',
    'Entgegen dem Panzer-Kommentar im Quelltext zieht `useSkillNow` Panzer nur einmal von der Summe einer Fertigkeit ab. Brand zieht Panzer bei jedem Tick ab, mindestens 1 Schaden bleibt; `pierce` umgeht Panzer beim Direktschaden, nicht Gegnerschutz. Brand skaliert nicht mit Pfad- oder Okkultmultiplikatoren und überschreibt vorhandenen Brand. Nervenkosten sind `round(composure × skill_composure)`. Heil-Skills und Drain erhalten keinen `heal_bonus`; dieser gilt im Bestand bei Heilgegenständen.', '',
    '## Alle 90 Pfadfertigkeiten', '',
    'D = direkter Schaden normal/okkult; F = gesamte Folgeschäden ohne Panzer; Σ = D + F normal/okkult. B3 = Σ normal gegen Panzer 3. N = effektive Nervenkosten. Sekundäre Effekte werden ausgewiesen, aber nicht als erfundener Schadenswert verbucht.', '',
    '| Pfad | Seq | Fertigkeit | K | D N/O | F | Σ N/O | B3 | N | Zusatz |',
    '|---|---:|---|---:|---:|---:|---:|---:|---:|---|'];
  const extras = sk => Object.entries(sk).filter(([k]) => ['heal','shield','drain','weak','stun','evade','confuse','sure','pierce'].includes(k)).map(([k,v]) => `${k}: ${v}`).join(', ') || 'keiner';
  for (const r of all) out.push(`| ${c.pathways[r.pid].short} | ${r.seq} | ${r.skill.name} | ${r.skill.cost} | ${r.normal.direct}/${r.occult.direct} | ${r.normal.dot} | ${r.normal.total}/${r.occult.total} | ${r.armored.total} | ${r.normal.nerves} | ${extras(r.skill)} |`);
  out.push('', '## Gemeinsame Grundfertigkeiten (ohne Pfad)', '', '| Fertigkeit | K | Schaden normal/okkult | Nerven |', '|---|---:|---:|---:|');
  for (const [id, sk] of Object.entries(SKILLS)) {
    const a = measure(c, null, null, { id, ...sk }); const b = measure(c, null, null, { id, ...sk }, { occult: true });
    out.push(`| ${sk.name} | ${sk.cost} | ${a.total}/${b.total} | ${a.nerves} |`);
  }
  out.push('', '## Wachstum des Einzelanwendungs-Schadens', '',
    'Quotient des Gesamtschadens der neuen Stufe durch den auf der jeweiligen Vorstufe gemessenen Gesamtschaden. Ziel 5→4: 1,50; danach 1,30. Toleranz ±0,12 wegen ganzzahliger Treffer/Brandwerte. Diese Kurve ist keine Gleichsetzung von Kontroll-, Heil- und Schadenswirkung. Höhere AP-Kosten bremsen den Schaden pro Konzentration zusätzlich.', '',
    '| Pfad | Schritt | Ziel | Normal | Okkult |', '|---|---|---:|---:|---:|');
  for (const [pid, p] of Object.entries(c.pathways)) for (const seq of [4,3,2,1]) {
    const a = all.find(r => r.pid === pid && r.seq === seq), b = all.find(r => r.pid === pid && r.seq === seq + 1);
    out.push(`| ${p.short} | ${seq+1}→${seq} | ${seq === 4 ? '1,50' : '1,30'} | ${(a.normal.total/b.normal.total).toFixed(3)} | ${(a.occult.total/b.occult.total).toFixed(3)} |`);
  }
  out.push('', '## Leben und Nerven', '',
    'Basis: 40 Leben, 100 Nerven. Seq 9/8/5 je ein Wachstumsschritt, 7/6 je zwei. Vorschlag für 4/3/2/1: 2/2/3/3 Schritte, kumuliert 9/11/14/17. Formel: Basis + Wachstum des Pfads × kumulierte Schritte + alle additiven Maximalwert-Passiven. Artefakte und Kleidung sind ausgeschlossen; der Nachteil der Maske ist enthalten.', '',
    '| Pfad | Wachstum LP/N | Seq 4 LP/N | Seq 3 LP/N | Seq 2 LP/N | Seq 1 LP/N |', '|---|---:|---:|---:|---:|---:|');
  for (const [pid, p] of Object.entries(c.pathways)) out.push(`| ${p.short} | ${p.growth.hp}/${p.growth.nerves} | ${[4,3,2,1].map(seq => { const s = hero(c,pid,seq); return `${s.maxHp}/${s.maxComposure()}`; }).join(' | ')} |`);
  out.push('', '## Bestehende Vergleichsgegner in Wexmoor', '',
    'Das Finale mit Brandt wird über Dialog und Enden entschieden, nicht über einen definierten Brandt-Bosskampf. Vergleichswerte sind daher die stärksten vorhandenen Einzelgänger und Constable Price. Ihre `encounters` stehen in `wexmoor.json`; sie sind dort nicht mit `boss: true` markiert. Keine erfundenen Bosswerte.', '',
    '| Gegner | HP Daten | HP solo | höchster Einzelhit Daten | Einzelhit solo |', '|---|---:|---:|---:|---:|');
  for (const id of ['price_wx_fight','ez_reetkoenig','ez_spinnerin','ez_brennerin']) {
    const e=c.encounters[id], hit=Math.max(...e.attacks.map(a=>a.damage??0));
    out.push(`| ${e.name} | ${e.hp} | ${Math.round(e.hp*ENEMY_HP_MULT)} | ${hit} | ${Math.round(hit*ENEMY_DMG_MULT)} |`);
  }
  out.push('', '## Zielkorridore für Kapitel 3 und später', '',
    `Solo-HP werden bereits mit ${ENEMY_HP_MULT} multipliziert, Schaden mit ${ENEMY_DMG_MULT}. Duo-HP zusätzlich ×${DUO_HP_MULT}, Duo-Schaden ×1,15; Rage-Schaden ×1,20. Nicht doppelt in Daten einrechnen. Zahlen unten sind neue Vorschläge, keine existierenden Encounters.`, '',
    '| Zugang mit | Rolle | HP Daten / solo | Schaden je Ring Daten / solo | Ringe je Angriff |',
    '|---|---|---|---|---|',
    '| Seq 5, Freischaltung 4 | Hüter der ersten Kernzutat | 170–220 / 238–308 | 10–14 / 14–20 | 2, angekündigter Einzelhit |',
    '| Seq 4 | regulärer Kapitel-3-Gegner | 200–280 / 280–392 | 11–15 / 15–21 | 2 |',
    '| Seq 4, Freischaltung 3 | Kapitel-3-Boss | 360–460 / 504–644 | 14–19 / 20–27 | 2–3 |',
    '| Seq 3, Freischaltung 2 | später Boss | 480–620 / 672–868 | 16–21 / 22–29 | 2–3 |',
    '| Seq 2, Freischaltung 1 | Abschluss einer Mythosreihe | 650–820 / 910–1148 | 18–23 / 25–32 | 2–3 |',
    '| Seq 1 | optionale Mythosprobe | 800–1050 / 1120–1470 | 20–25 / 28–35 | 2–3 |', '',
    'Beispiel: Laterne Seq 4 verursacht ohne Vorarbeit 81 normalen oder 195 okkulten Gesamtschaden, einschließlich 24 Brand über drei Runden. Ein okkulter K3-Boss mit 560 tatsächlichen HP fällt dadurch nicht sofort. Die Werte allein beseitigen aber Kontrollketten nicht. Ein Nutzer des Fadens oder der Uhr hat deutlich weniger Schaden; für diese Pfade müssen längere Kämpfe auch ohne perfekte Paraden überlebbar bleiben. Vor Freigabe alle zehn Pfade gegen dieselben Szenarien spielen, einschließlich normaler statt okkulter Gegner.', '',
    '## Verdauung, Wirtschaft und Artefakte', '',
    'Vorgeschlagene Raten 4/3/2/1: 0,20 / 0,16 / 0,13 / 0,10. Der letzte Wert betrifft optionales Ausmeistern, keinen Aufstieg auf Seq 0. Kein neuer Pfad braucht einen neuen Verdauungsschlüssel. Waage verlangt einen Schutz gegen Wiederverkaufs-Schleifen, Uhr gegen endlose sichere Übungsparaden, Moor gegen wiederholt vergütete Fundstellen. Siehe neue_mechaniken.md. Kleine Ereigniswerte alleine verhindern Farmen nicht.', '',
    'Einzelner Seq-4-Nachteil bleibt auf höheren Stufen wirksam. Es werden darüber keine weiteren Schadensmultiplikatoren oder AP-Startboni aufgestapelt. Die neuen Pfade erreichen durch 7/6 zusammen dmg_mult 1,265 und 3 Start-AP. Kein Skill kostet mehr als das vorhandene AP-Limit 6.', '',
    'Artefakte wirken bereits im Inventar. Beispiel Faden: Gegenakte gibt +2 Schlussfolgerungs-Ansehen, vergrößert aber zusammen mit Seq 4 den Ansehensverlust auf 1,20×1,70 = 2,04. Beispiel Torfsiegel: 0,32 Unruhe/s minus 0,25 natürlicher Abbau ergibt bei calm_decay=1 netto +0,07/s; zusammen mit weiteren Artefakten kommen Streit und gegebenenfalls Überlast hinzu. Nicht pauschal behaupten, jeder Pfad bekomme denselben Nettowert. Bestehende Rabatt- und Verkaufsmultiplikatoren können Arbitrage erlauben; AF fügt deshalb keinen neuen Preisrabatt und keinen Verkaufsbonus hinzu.', '',
    '## Grenzen und Freigabekriterien', '',
    'Die 1,5-/1,3-Kurve gilt für garantierbaren Direktschaden plus einmal vollständig auslaufenden Brand. Verwirrung ist gegnerabhängig und kann bei einer Sonderaktion 0 verursachen. Betäubung, Ausweichen, Schild und Heilung sind separat ausgewiesen. Ein bereits gesetztes weak, Perfect-Timing, bessere Waffen und Artefakte können den Schaden erheblich erhöhen. Ein Schild stapelt sich; neuer Brand überschreibt alten. Deshalb darf die Tabelle weder als DPS noch als Beweis für faire Bosskämpfe gelesen werden.', '',
    'Vor Integration: bei 50/70/90 % erfolgreichen Verteidigungen jeweils alle zehn Pfade, Solo und Duo, normale/okkulte/gepanzerte Ziele, mit und ohne Artefakte vergleichen. Ziel: Seq-4-Regelkämpfe 4–7 Runden, Bosse 8–12; Niederlage soll aus mehreren lesbaren Fehlern entstehen. Kessel/Moor dürfen durch günstige Heilung keine verlustfreie Dauerschleife haben. Echofertigkeiten zahlen ihre wegen ×0,35 deutlich reduzierten Nervenkosten weiterhin. Alte Fertigkeiten bleiben verfügbar; billige Kontrolle aus Seq 6 kann jede neue Bosskurve umgehen. Die in neue_mechaniken.md vorgeschlagene Kontrollresistenz muss vor Endgame-Freigabe entschieden werden.', '');
  return out.join('\n').trimEnd();
}
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(report());
