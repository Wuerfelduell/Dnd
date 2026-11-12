// Seq-6-Rituale ortsunabhängig (Seb, 2026-11-12): Weil es keine Rückreise in frühere Städte gibt, hängt keine
// Bedingung der Sequenz 6 an einem Ort oder Fall. Faden, Echo, Moor und Uhr legen zufällige Proben ab,
// die Waage deckt einen Betrug auf einem geheimen Treffen auf, der Schlüssel knackt irgendein Schloss.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, talk } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { PROBE_FAIL, FADEN_PAARE, ECHO_STIMMEN, MOOR_NAMEN } from '../src/core/Proben.js';
import { FRAUD_WRONG } from '../src/core/Auction.js';

const content = loadContent();
const seeded = (seed) => { let x = seed; return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; }; };

function at(pid, seq = 7) {
  const s = new GameState(content);
  s.pathway = { id: pid, seq, digestion: 100 };
  s.composure = 100;
  return s;
}

test('Keine Seq-6-Bedingung hängt an Ort, Fall oder alten Schlussfolgerungen', () => {
  for (const [pid, p] of Object.entries(content.pathways)) {
    const r = p.seqs['6'].ritual;
    assert.ok(r, `${pid}: Ritual 6`);
    // Der Ort war schon vorher nur Überlieferung (ritualHtml: „Überall ausführbar“); die umgebauten Rituale nennen keinen mehr
    if (['faden', 'echo', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr'].includes(pid)) assert.equal(r.map, undefined, `${pid} 6: kein Ritualort`);
    assert.equal(r.min_conclusions, undefined, `${pid} 6: keine alten Schlüsse`);
    for (const f of r.requires?.requires_flags ?? []) assert.ok(!/^(case_|kapitel|won_)/.test(f), `${pid} 6: hängt an ${f}`);
    assert.ok(r.desc && r.name, pid);
  }
  // Laterne, Maske, Kessel, Eisen bleiben wie sie waren (Seb: passt)
  assert.deepEqual(content.pathways.laterne.seqs['6'].ritual.consumes, { lampenoel: 2, leuchtmoos: 1 });
  assert.equal(content.pathways.maske.seqs['6'].ritual.min_nerves, 60);
  assert.deepEqual(content.pathways.kessel.seqs['6'].ritual.consumes, { bitterwurz: 2, kroetenschleim: 2, tonikum: 1 });
  assert.equal(content.pathways.eisen.seqs['6'].ritual.max_hp_pct, 0.5);
  // Die geänderten
  assert.equal(content.pathways.faden.seqs['6'].ritual.probe, 'faden');
  assert.equal(content.pathways.echo.seqs['6'].ritual.probe, 'echo');
  assert.equal(content.pathways.sq_moor.seqs['6'].ritual.probe, 'moor');
  assert.equal(content.pathways.sq_uhr.seqs['6'].ritual.probe, 'uhr');
  assert.equal(content.pathways.sq_waage.seqs['6'].ritual.fraud, true);
  assert.equal(content.pathways.schluessel.seqs['6'].ritual.min_picks, 1);
});

test('Ritualschritte nennen Probe, Betrug und Schloss lesbar', () => {
  const texts = (pid) => at(pid).ritualSteps(pid, 6).map((x) => x.text);
  assert.ok(texts('faden').includes('Die Fadenprobe bestanden'));
  assert.ok(texts('echo').includes('Die Stimmenprüfung bestanden'));
  assert.ok(texts('sq_moor').includes('Die Namensprobe bestanden'));
  assert.ok(texts('sq_uhr').includes('Die Fristprobe bestanden'));
  assert.ok(texts('sq_waage').includes('Einen Betrug auf einem geheimen Treffen aufgedeckt'));
  assert.ok(texts('schluessel').includes('Ein Schloss geknackt (0)'));
  assert.ok(!texts('faden').some((t) => /Schlussfolgerungen/.test(t)));
  assert.ok(!texts('sq_waage').some((t) => /Fall \d/.test(t)));
});

test('Fadenprobe: vier Spuren richtig zugeordnet besteht, ein Fehler kostet Nerven und Unruhe', () => {
  const s = at('faden');
  assert.equal(s.pendingProbe().kind, 'faden');
  let r = s.startProbe(seeded(7));
  assert.equal(r.ok, true);
  assert.equal(s.probe.rounds.length, 4);
  for (const round of s.probe.rounds) assert.ok(FADEN_PAARE.some(([spur, schluss]) => spur === round.prompt && schluss === round.answer));
  // Falsch antworten
  const round = s.probe.rounds[0];
  const wrong = round.options.findIndex((o) => o !== round.answer);
  r = s.probeAnswer(wrong);
  assert.equal(r.passed, false);
  assert.equal(s.composure, 100 - PROBE_FAIL.nerves);
  assert.equal(s.unruhe, PROBE_FAIL.unruhe);
  assert.equal(s.probe, null);
  assert.ok(!s.probeDone('faden', 6));
  // Noch einmal, richtig: eine andere Auswahl, dann bestanden
  s.startProbe(seeded(99));
  while (s.probe) {
    const rd = s.probe.rounds[s.probe.step];
    r = s.probeAnswer(rd.options.indexOf(rd.answer));
  }
  assert.equal(r.passed, true);
  assert.ok(s.probeDone('faden', 6));
  assert.ok(s.ritualSteps('faden', 6).find((x) => x.probe).done);
  assert.equal(s.pendingProbe(), null);
});

test('Stimmenprüfung (leicht, Seb): drei Stimmen von drei Sprechern, eine hallt nach und wird zugeordnet', () => {
  const s = at('echo');
  s.startProbe(seeded(3));
  const pr = s.probe;
  assert.equal(pr.listen.length, 3);
  assert.equal(new Set(pr.listen.map((l) => l.who)).size, 3);
  for (const l of pr.listen) assert.ok(ECHO_STIMMEN[l.who].includes(l.text));
  assert.equal(pr.rounds.length, 1);
  const [rd] = pr.rounds;
  assert.ok(rd.options.includes(rd.answer) && rd.options.length === 3);
  const again = pr.listen.find((l) => l.who === rd.answer);
  assert.ok(rd.prompt.includes(again.text), 'die wiederholte Stimme steht in der Frage');
  s.probeListened();
  let r;
  while (s.probe) { const rd = s.probe.rounds[s.probe.step]; r = s.probeAnswer(rd.options.indexOf(rd.answer)); }
  assert.equal(r.passed, true);
});

test('Namensprobe: sieben Namen, dann fehlt einer und einer ist fremd', () => {
  const s = at('sq_moor');
  s.startProbe(seeded(11));
  const pr = s.probe;
  assert.equal(pr.listen.length, 7);
  assert.equal(pr.second.length, 7);
  const [fehlt, neu] = pr.rounds;
  assert.ok(pr.listen.includes(fehlt.answer) && !pr.second.includes(fehlt.answer));
  assert.ok(!pr.listen.includes(neu.answer) && pr.second.includes(neu.answer));
  for (const n of [...pr.listen, ...pr.second]) assert.ok(MOOR_NAMEN.includes(n));
  s.probeListened();
  s.probeAnswer(fehlt.options.indexOf(fehlt.answer));
  const r = s.probeAnswer(neu.options.indexOf(neu.answer));
  assert.equal(r.passed, true);
  assert.ok(s.probeDone('sq_moor', 6));
});

test('Fristprobe: nach n Sekunden anhalten, 0,8 Sekunden Spiel', () => {
  const s = at('sq_uhr');
  s.startProbe(seeded(5), 0);
  const t = s.probe.target;
  assert.ok(t >= 7 && t <= 12);
  assert.equal(s.probeStop(1000).ok, false); // noch nicht gestartet
  s.probeStart(10000);
  let r = s.probeStop(10000 + (t + 2) * 1000);
  assert.equal(r.passed, false);
  assert.match(r.text, /Zu spät/);
  s.startProbe(seeded(6), 0);
  const t2 = s.probe.target;
  s.probeStart(0);
  r = s.probeStop((t2 + 0.5) * 1000);
  assert.equal(r.passed, true);
  assert.ok(s.probeDone('sq_uhr', 6));
});

test('Abbruch vor der ersten Antwort kostet nichts, danach zählt er als Fehlversuch', () => {
  const s = at('faden');
  s.startProbe(seeded(1));
  assert.equal(s.cancelProbe().passed, undefined);
  assert.equal(s.composure, 100);
  s.startProbe(seeded(1));
  const rd = s.probe.rounds[0];
  s.probeAnswer(rd.options.indexOf(rd.answer));
  assert.equal(s.cancelProbe().passed, false);
  assert.equal(s.composure, 100 - PROBE_FAIL.nerves);
});

test('Spieler 2 hat eigene Proben-Merker', () => {
  const s = at('faden');
  s.acting = 2;
  assert.equal(s.probeFlag('faden', 6), 'p2_probe_faden_6');
  s.acting = 1;
  assert.equal(s.probeFlag('faden', 6), 'probe_faden_6');
});

// --- Waage: Betrug auf einem geheimen Treffen -------------------------------------------------------
function waageSession() {
  const s = new GameState(content);
  s.flags.add('briefed_04');
  s.money = 5000;
  s.composure = 100;
  s.pathway = { id: 'sq_waage', seq: 7, digestion: 100 };
  talk(s, 'schleierbote', ['Stillen Waage']);
  let c = s.marketCycle() + 1;
  while (s.gatheringSlot(c).id !== 'waage') c++;
  s.playTime = s.gatheringSlot(c).start + 1;
  return s;
}

/** Bis zum falsch gewogenen Los vorspulen (aussteigen, Gesuche ablehnen). */
function toRiggedLot(s) {
  const a = s.auction;
  let guard = 0;
  while (guard++ < 40) {
    if (a.phase === 'lot' && a.lot.rigged) return a.lot;
    if (a.phase === 'lot') { assert.equal(a.lot.declared, a.lot.onTable, 'ehrliche Lose stimmen'); s.passLot(); } else if (a.phase === 'request') s.declineRequest(); else break;
  }
  return null;
}

test('Waage: in jeder Runde ist genau ein Los falsch gewogen, Angabe und Tisch stehen bei jedem Los', () => {
  const s = waageSession();
  assert.ok(s.fraudPending());
  assert.equal(s.startSession('waage').ok, true);
  const a = s.auction;
  assert.ok(a.fraud && a.fraud.turn >= 0 && a.fraud.turn < a.members.length);
  const lot = toRiggedLot(s);
  assert.ok(lot, 'ein falsch gewogenes Los');
  assert.ok(lot.declared > lot.onTable && lot.onTable >= 1, `${lot.declared} angesagt, ${lot.onTable} da`);
  assert.ok(a.log.some((t) => new RegExp(`${lot.declared} Stück`).test(t)), a.log.join(' | '));
  // Anprangern: Schritt erfüllt, Los verfällt
  const acc = s.accuseFraud();
  assert.equal(acc.exposed, true);
  assert.ok(s.fraudExposed('sq_waage', 6));
  assert.ok(s.ritualSteps('sq_waage', 6).find((x) => x.fraud).done);
  assert.ok(!s.fraudPending());
  assert.ok(!a.lot?.rigged);
});

test('Waage: falsche Anschuldigung wirft einen aus der Runde', () => {
  const s = waageSession();
  s.startSession('waage');
  const a = s.auction;
  let guard = 0;
  while (guard++ < 40 && !(a.phase === 'lot' && !a.lot.rigged)) { if (a.phase === 'lot') s.passLot(); else if (a.phase === 'request') s.declineRequest(); else break; }
  if (a.phase !== 'lot') return; // alle anderen Lose fielen aus (sehr selten)
  const r = s.accuseFraud();
  assert.equal(r.exposed, false);
  assert.ok(r.ended);
  assert.equal(s.auction, null);
  assert.equal(s.composure, 100 - FRAUD_WRONG.nerves);
  assert.equal(s.unruhe, FRAUD_WRONG.unruhe);
  assert.ok(!s.fraudExposed('sq_waage', 6));
});

test('Ohne Waage-Ritual bleibt die Runde wie bisher', () => {
  const s = waageSession();
  s.pathway = { id: 'eisen', seq: 8, digestion: 0 };
  s.startSession('waage');
  assert.equal(s.auction.fraud, undefined);
  assert.equal(s.accuseFraud().ok, false);
  let guard = 0;
  while (guard++ < 40 && s.auction.phase !== 'own') { if (s.auction.phase === 'lot') { assert.ok(!s.auction.lot.rigged && !s.auction.lot.declared); s.passLot(); } else if (s.auction.phase === 'request') s.declineRequest(); else break; }
});

// --- Schlüssel: Schlösser knacken ---------------------------------------------------------------
function pickable() {
  const out = [];
  for (const [mid, m] of Object.entries(content.maps)) for (const o of m.interactables ?? []) if (o.lock?.pick) out.push(`${mid}:${o.id}`);
  return out;
}

test('Knackbare Schlösser: Lagerhaus 7, die vier Truhen im Wilden, Asservatenschrank, Schließfächer in Wexmoor und Dunscar', () => {
  const ids = pickable();
  for (const want of ['docks:door7', 'katakomben:treasure', 'kraterwald:treasure', 'marsch:treasure', 'pestgassen:treasure', 'revier:evidence', 'wx_bahnhof:schliessfach', 'ds_endbahnhof:k3o_endbahnhof_gepaeck']) assert.ok(ids.includes(want), want);
  // Die neuen Schließfächer geben etwas Brauchbares und sind einmalig
  for (const [mid, oid] of [['wx_bahnhof', 'schliessfach'], ['ds_endbahnhof', 'k3o_endbahnhof_gepaeck']]) {
    const o = content.maps[mid].interactables.find((i) => i.id === oid);
    assert.equal(o.kind, 'read');
    assert.ok(o.done_flag && o.effects.gives_items.verband && o.effects.gives_money > 0, oid);
    for (const id of Object.keys(o.effects.gives_items)) assert.ok(content.items[id], id);
  }
  // Das Zellenschloss in Wexmoor zählt dauerhaft mit
  const zelle = content.dialogues.wx_zelle;
  assert.ok(zelle.nodes.pick_ok.sets_flags.includes('k2_zelle_geknackt'));
});

test('Knacken: Schlüssel-Pfad, Brecheisen oder Haarnadel öffnen; jedes Schloss zählt einmal', () => {
  const s = at('schluessel', 9); // Seq 9 hat noch keinen lock_bonus
  s.pathway = null;
  const door = content.maps.docks.interactables.find((i) => i.id === 'door7');
  assert.ok(!s.meetsLock(door.lock));
  assert.equal(s.tryPick(door.lock, 'docks:door7'), null, 'ohne Werkzeug bleibt es zu');
  assert.ok(s.pickHint().includes('Brecheisen'));
  s.addItem('brecheisen');
  let r = s.tryPick(door.lock, 'docks:door7');
  assert.equal(r.ok, true);
  assert.equal(r.first, true);
  assert.equal(s.pickCount(), 1);
  r = s.tryPick(door.lock, 'docks:door7');
  assert.equal(r.first, false);
  assert.equal(s.pickCount(), 1, 'dieselbe Tür zählt nicht doppelt');
  // Nicht knackbare Schlösser bleiben, wie sie sind
  const spind = content.maps.revier.interactables.find((i) => i.lock?.requires_conclusions);
  assert.equal(s.tryPick(spind.lock, 'revier:spind'), null);
  // Haarnadel reicht auch
  const s2 = new GameState(content);
  s2.addItem('haarnadel');
  assert.ok(s2.canPick());
  // Der Pfad des Schlüssels braucht nichts
  const s3 = at('schluessel', 7);
  assert.ok(s3.passive('lock_bonus') > 0);
  assert.ok(s3.canPick());
  assert.equal(s3.tryPick(door.lock, 'docks:door7').first, true);
  assert.ok(s3.ritualSteps('schluessel', 6).find((x) => /Schloss geknackt/.test(x.text)).done);
  // Zellenschloss
  const s4 = new GameState(content);
  s4.flags.add('k2_zelle_geknackt');
  assert.equal(s4.pickCount(), 1);
});

test('Geknackte Schlösser und bestandene Proben überleben Speichern und Laden', () => {
  const s = at('schluessel', 7);
  s.tryPick({ pick: true }, 'docks:door7');
  s.flags.add(s.probeFlag('faden', 6));
  const data = JSON.parse(JSON.stringify(s.serialize(null)));
  const t = new GameState(content);
  assert.ok(t.load(data));
  assert.equal(t.pickCount(), 1);
  assert.ok(t.pickedLocks.has('docks:door7'));
  assert.ok(t.probeDone('faden', 6));
});
