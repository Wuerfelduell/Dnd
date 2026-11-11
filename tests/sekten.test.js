// BQ/BR: Sekten in drei Städten – Datenpaket, Umtriebe-Stufen, Ereignisplaner, Fristen, Sabotagewirkung, Schreinabbau,
// zweite Phase der Häupter, Spielstand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { loadContent, talk } from './helpers.js';
import { SK_STUFEN } from '../src/core/Sekten.js';

const content = loadContent();
const fresh = ({ frei = true } = {}) => {
  const s = new GameState(content);
  s.rng = () => 0.5;
  if (frei) { s.flags.add('k3_arrived'); s.sektenUnlock(); }
  return s;
};
const seq = (...vals) => { let i = 0; return () => (i < vals.length ? vals[i++] : 0.5); };
const kulte = content.sekten.kulte;

test('BQ: Datenpaket ist im Spiel – 3 Kulte, 36 Ereignisse, 12 Gegner mit Beute, 9 Figuren mit Tag-/Nachtplatz, 12 Lesestellen, Aufträge, Artefakte, Zeitung, Gerede, Geplauder', () => {
  assert.deepEqual(kulte.map((k) => k.id), ['sk_asche', 'sk_flut', 'sk_chor']);
  assert.equal(content.sekten.ereignisse.length, 36);
  for (const e of content.sekten.ereignisse) {
    for (const m of e.karten) assert.ok(content.maps[m], `${e.id}: Karte ${m}`);
    if (e.dialog) assert.ok(content.dialogues[e.dialog.id]?.nodes[e.dialog.node], `${e.id}: Dialog`);
    for (const g of e.gegner ?? []) assert.ok(content.encounters[g] && content.loot[g], `${e.id}: Gegner ${g}`);
    if (e.figur) assert.ok(content.npcs[e.figur], `${e.id}: Figur ${e.figur}`);
    if (e.art === 'sabotage') assert.ok(content.items[e.gegenmassnahme.item] && content.dialogues[e.gegenmassnahme.dialog.id], e.id);
  }
  for (const k of kulte) for (const r of ['novize', 'sprecher', 'hand', 'haupt']) {
    assert.ok(content.encounters[`enemy_${k.id}_${r}`], `enemy_${k.id}_${r}`);
    assert.ok(content.npcs[`${k.id}_${r}`], `Kultist ${k.id}_${r}`);
  }
  for (const k of kulte) assert.ok(content.encounters[`enemy_${k.id}_haupt`].phase2?.attacks.length >= 2, `${k.id}: zweite Phase`);
  const figuren = Object.keys(content.npcs).filter((id) => /^sk_(asche|flut|chor)_(sprecher|aussteiger|opfer)_/.test(id));
  assert.equal(figuren.length, 9);
  for (const id of figuren) {
    const spots = Object.values(content.maps).flatMap((m) => (m.npcs ?? []).filter((n) => n.id === id));
    assert.equal(spots.length, 2, `${id}: Tag- und Nachtplatz`);
    for (const n of spots) assert.ok(n.visible_if.requires_flags.includes('sk_freigegeben'), id);
    assert.equal(Object.keys(content.dialogues[id].nodes).length >= 8, true, id);
  }
  const lese = Object.values(content.maps).flatMap((m) => (m.interactables ?? []).filter((i) => /^sk_(asche|flut|chor)_lese_\d$/.test(i.id)));
  assert.equal(lese.length, 12);
  for (const l of lese) assert.ok(content.dialogues[l.dialogue], l.id);
  for (const k of kulte) {
    assert.equal(content.quests[`${k.id}_kette`].steps.length, 5);
    assert.ok(content.quests[`${k.id}_rueckholung`] && (content.quests[`${k.id}_schrein_auftrag`] || content.quests[`${k.id}_zeichen_auftrag`]), k.id);
  }
  for (const id of ['ski_art_aschenring', 'ski_art_flutkompass', 'ski_art_chorstimmgabel']) {
    assert.equal(content.items[id]?.kind, 'artifact', id);
    assert.equal(content.artifacts.list[id].source, 'sekten');
  }
  assert.equal(content.newspapers.filter((p) => p.id.startsWith('sk_')).length, 36);
  for (const city of ['kettlegate', 'wexmoor', 'dunscar']) assert.ok(Object.values(content.gossip[city]).some((lines) => lines.some((g) => g.requires_flags?.[0]?.startsWith('sk_'))), city);
  assert.equal(content.koop.geplauder.filter((g) => g.id.startsWith('sk_')).length, 12 * 9);
  // Zusatzzweige bei zehn bestehenden Figuren
  for (const id of ['marlowe', 'holt', 'greta', 'zunder', 'hale', 'k3a_pfiff', 'k3p_hedda', 'kittering', 'k3n_secondhaendler', 'varga']) assert.ok(content.dialogues[id].nodes[`sk_zusatz_${id}`], id);
});

test('BQ: Freigabe erst mit Kapitel 3; danach steht jeder Kult auf Stufe 0 mit genau einem Anzeigeflag', () => {
  const s = fresh({ frei: false });
  assert.equal(s.sektenUnlock(), false);
  assert.equal(s.sektenBesuch('giesserei', () => 0), null);
  assert.ok(!s.flags.has('sk_freigegeben'));
  s.flags.add('k3_arrived');
  assert.equal(s.sektenUnlock(), true);
  for (const k of kulte) {
    assert.equal(s.sektenStufe(k.id), 0);
    assert.equal(s.sektenStufeName(k.id), SK_STUFEN[0]);
    assert.deepEqual([...s.flags].filter((f) => f.startsWith(`${k.id}_anzeige_`)), [`${k.id}_anzeige_0`]);
  }
  s.setSektenStufe('sk_asche', 2);
  assert.deepEqual([...s.flags].filter((f) => f.startsWith('sk_asche_anzeige_')), ['sk_asche_anzeige_2']);
  assert.equal(s.setSektenStufe('sk_asche', 9), 3);
  assert.equal(s.setSektenStufe('sk_asche', -4), 0);
  // Zeitung der Stufe erscheint mit dem Anzeigeflag
  s.setSektenStufe('sk_flut', 1);
  assert.ok(s.paperArchive().some((p) => p.id === 'sk_flut_blatt_1_1'));
});

test('BQ: Ein Besuch würfelt je Kult einmal; nur freigeschaltete, zur Karte und Tageszeit passende Ereignisse, höchstens eines je Besuch und Karte', () => {
  const s = fresh();
  // Stufe 0: nur Ereignis 1–3; in der Gießerei (Heimat des Aschenbunds) liegt die Spur
  assert.deepEqual(s.sektenKandidaten('sk_asche', 'giesserei').map((e) => e.id), ['sk_asche_ereignis_01']);
  assert.deepEqual(s.sektenKandidaten('sk_asche', 'altmarkt'), []); // Altmarkt erst ab Stufe 2
  // Der Überfall braucht Nacht
  s.setSektenStufe('sk_asche', 2);
  assert.ok(!s.sektenKandidaten('sk_asche', 'wx_salzmarkt').some((e) => e.id === 'sk_asche_ereignis_09'));
  s.flags.add('k3h_nacht');
  assert.ok(s.sektenKandidaten('sk_asche', 'wx_salzmarkt').some((e) => e.id === 'sk_asche_ereignis_09'));
  s.flags.delete('k3h_nacht');
  s.setSektenStufe('sk_asche', 0);
  // Würfel: Reihenfolge (2 Werte), dann Rate je Kult, dann Auswahl
  assert.equal(s.sektenBesuch('giesserei', seq(0.5, 0.5, 0.99, 0.99, 0.99)), null); // nichts trifft
  const ev = s.sektenBesuch('giesserei', seq(0.5, 0.5, 0.01, 0.01, 0.01, 0));
  assert.equal(ev?.id, 'sk_asche_ereignis_01');
  assert.ok(s.flags.has('sk_asche_ereignis_01_aktiv'));
  assert.equal(s.sektenStufe('sk_asche'), 1, 'folge_stufe +1 beim Start');
  assert.equal(s.sektenBesuch('giesserei', () => 0), null, 'nur ein laufendes Ereignis je Karte');
  assert.equal(s.sekten.besuche, 3);
  // Lesen beendet die Spur: Flag weg → Ereignis zu, Hinweisflag gesetzt, nie wieder
  s.applyEffects({ ...ev.ende });
  s.tickSekten();
  assert.equal(s.sektenAktiv(ev.id), null);
  assert.ok(s.flags.has('sk_asche_ereignis_01_hinweis'));
  assert.ok(!s.sektenKandidaten('sk_asche', 'giesserei').some((e) => e.id === ev.id));
});

test('BQ: Abwerbung blendet die Figur aus, startet den Rückholauftrag, kehrt per Dialog (Lohn) oder Frist (kein Lohn) zurück und nie für gebrauchte Figuren', () => {
  const s = fresh();
  s.setSektenStufe('sk_asche', 1);
  assert.ok(s.sektenFigurDa('pimm'));
  const ev = s.sektenStart('sk_asche_ereignis_05', 'revier');
  assert.ok(s.sektenAbwesend('pimm'));
  assert.equal(s.quests.sk_asche_rueckholung, 'active');
  assert.equal(ev.until, s.playTime + 1440 * 60);
  // kein zweiter Abwerbungsversuch desselben Kults, solange einer läuft
  s.setSektenStufe('sk_asche', 2);
  assert.ok(!s.sektenKandidaten('sk_asche', 'altmarkt').some((e) => e.art === 'abwerbung'));
  // Rückholung über den freien Ausgang: Quest fertig, 60 Schilling, Figur zurück
  const money = s.money;
  talk(s, 'sk_asche_ereignis_05', ['hinausbegleiten']);
  s.tickSekten();
  assert.equal(s.quests.sk_asche_rueckholung, 'done');
  assert.equal(s.money, money + 60);
  assert.ok(!s.sektenAbwesend('pimm'));
  assert.ok(s.sekten.erledigt.includes('sk_asche_ereignis_05'));
  // Frist: Figur zurück, Quest bleibt offen, kein Geld
  const t = fresh();
  t.setSektenStufe('sk_asche', 2);
  t.sektenStart('sk_asche_ereignis_07', 'altmarkt');
  assert.ok(t.sektenAbwesend('ned'));
  t.playTime += 2880 * 60 + 1;
  const m2 = t.money;
  t.tickSekten();
  assert.ok(!t.sektenAbwesend('ned'));
  assert.equal(t.quests.sk_asche_rueckholung, 'active');
  assert.equal(t.money, m2);
  assert.ok(t.flags.has('sk_asche_ereignis_07_erledigt'));
  // Rückruf vor einer Hauptinteraktion
  const u = fresh();
  u.setSektenStufe('sk_flut', 1);
  u.sektenStart('sk_flut_ereignis_05', 'wx_pfahldorf');
  assert.ok(u.sektenAbwesend('sedge'));
  assert.ok(u.sektenRueckruf('sedge'));
  assert.ok(!u.sektenAbwesend('sedge'));
  // Eine Figur, die ein Hauptauftrag gerade braucht, wird nicht gewählt
  const v = fresh();
  v.setSektenStufe('sk_asche', 1);
  v.content = { ...content, quests: { ...content.quests, sk_test_main: { title: 'T', kind: 'main', steps: [{ text: 'x', done: {}, target: { map: 'revier', id: 'pimm' } }] } } };
  v.quests.sk_test_main = 'active';
  assert.ok(v.sektenFigurGebraucht('pimm'));
  assert.ok(!v.sektenKandidaten('sk_asche', 'revier').some((e) => e.id === 'sk_asche_ereignis_05'));
});

test('BQ: Sabotage wirkt nur auf ihrer Karte und endet nach der Frist oder durch die Gegenmaßnahme (Item wird verbraucht, Handarbeit ist frei)', () => {
  const s = fresh();
  s.setSektenStufe('sk_asche', 1);
  s.sektenStart('sk_asche_ereignis_06', 'ds_arbeiterbogen');
  assert.equal(s.sektenHeilFaktor('ds_arbeiterbogen'), 0.5);
  assert.equal(s.sektenHeilFaktor('giesserei'), 1);
  // Heiltrank heilt vor Ort nur halb, mindestens 1
  s.map = 'ds_arbeiterbogen';
  s.updateMaxHp?.();
  s.hp = 1;
  const potion = Object.entries(content.items).find(([, it]) => it.kind === 'consumable' && it.heal >= 10 && !it.composure)[0];
  s.addItem(potion);
  const before = s.hp;
  s.useItem(potion);
  assert.equal(s.hp - before, Math.min(s.maxHp - before, Math.max(1, Math.round(content.items[potion].heal * s.passive('heal_bonus') * 0.5))));
  // Gegenmaßnahme von Hand: Flag weg, Ereignis zu
  talk(s, 'sk_asche_ereignis_06', ['Von Hand']);
  s.tickSekten();
  assert.equal(s.sektenHeilFaktor('ds_arbeiterbogen'), 1);
  // Mit Item: wird verbraucht
  const t = fresh();
  t.setSektenStufe('sk_flut', 3);
  t.sektenStart('sk_flut_ereignis_10', 'ds_bruchstufen');
  t.addItem('ski_seilschnitt');
  talk(t, 'sk_flut_ereignis_10', ['bewusst einsetzen']);
  assert.equal(t.itemCount('ski_seilschnitt'), 0);
  t.tickSekten();
  assert.equal(t.sektenAktiv('sk_flut_ereignis_10'), null);
  // Reiseaufschlag: höchstens 5, bei Geldmangel 0; Frist 12 oder 18 Spielminuten
  const u = fresh();
  u.setSektenStufe('sk_flut', 1);
  const ev = u.sektenStart('sk_flut_ereignis_06', 'ds_schwellenring');
  u.money = 20;
  assert.equal(u.sektenReiseAufschlag('ds_schwellenring'), 5);
  assert.equal(u.sektenReiseAufschlag('ds_kalkmarkt'), 0);
  u.money = 3;
  assert.equal(u.sektenReiseAufschlag('ds_schwellenring'), 0);
  assert.ok([12, 18].includes(ev.dauer_min));
  u.playTime += ev.dauer_min * 60;
  u.tickSekten();
  assert.equal(u.sektenAktiv(ev.id), null);
  assert.ok(u.flags.has(`${ev.id}_erledigt`));
  // Dunkle Laternen: nur örtlich
  const w = fresh();
  w.setSektenStufe('sk_chor', 1);
  w.sektenStart('sk_chor_ereignis_06', 'wx_bahnhof');
  assert.ok(w.sektenDunkel('wx_bahnhof'));
  assert.ok(!w.sektenDunkel('wx_salzmarkt'));
  assert.ok(!w.flags.has('k3h_nacht'));
});

test('BQ: Schrein – Wachen fort, dann Abbau: Stufe −1, Ereignisbeute genau einmal, kleiner Auftrag bezahlt; Zeitablauf senkt nichts', () => {
  const s = fresh();
  s.setSektenStufe('sk_asche', 2);
  s.flags.add('k3h_nacht');
  const ev = s.sektenStart('sk_asche_ereignis_08', 'altmarkt');
  assert.equal(s.quests.sk_asche_schrein_auftrag, 'active');
  assert.equal(s.sektenStufe('sk_asche'), 2);
  // Ohne gesicherten Platz kein Abbau; Ablenken sichert ihn ohne Kampf
  const d = content.dialogues.sk_asche_ereignis_08;
  assert.ok(!s.meets(d.nodes.start.choices[1]));
  const money = s.money;
  talk(s, 'sk_asche_ereignis_08', ['ablenken', 'Jetzt abbauen']);
  s.tickSekten();
  assert.equal(s.sektenStufe('sk_asche'), 1);
  assert.equal(s.quests.sk_asche_schrein_auftrag, 'done');
  assert.ok(s.money >= money + 40 + 3 && s.money <= money + 40 + 8, 'Auftrag 40 + Ereignisbeute 3–8');
  assert.equal(s.itemCount('ski_aschensiegel'), 1);
  assert.equal(s.sektenAktiv(ev.id), null);
  // Frist ohne Abbau: zu, aber keine Stufe und keine Beute
  const t = fresh();
  t.setSektenStufe('sk_flut', 2);
  t.flags.add('k3h_nacht');
  const e2 = t.sektenStart('sk_flut_ereignis_08', 'wx_salzmarkt');
  const m = t.money;
  t.playTime += 90 * 60 + 1;
  t.tickSekten();
  assert.equal(t.sektenAktiv(e2.id), null);
  assert.equal(t.sektenStufe('sk_flut'), 2);
  assert.equal(t.money, m);
});

test('BQ: Werbung kostet nur beim Mitgehen 5 Nerven; Überfall lässt sich ausweichen; Zeichen am Haus wird mit Einverständnis entfernt', () => {
  const s = fresh();
  s.sektenStart('sk_asche_ereignis_02', 'wx_torfstich');
  s.setComposure(50);
  talk(s, 'sk_asche_ereignis_02', ['Zuhören', 'Mitgehen']);
  assert.equal(s.composure, 45);
  s.tickSekten();
  assert.equal(s.sektenAktiv('sk_asche_ereignis_02'), null);
  const t = fresh();
  t.setSektenStufe('sk_asche', 2);
  const ev = t.sektenStart('sk_asche_ereignis_09', 'wx_salzmarkt');
  assert.equal(ev.until, t.playTime + 30 * 60);
  talk(t, 'sk_asche_ereignis_09', ['freie Gasse']);
  t.tickSekten();
  assert.ok(t.flags.has('sk_asche_ereignis_09_erledigt'));
  const u = fresh();
  u.sektenStart('sk_asche_ereignis_03', 'ds_lohnbuero');
  talk(u, 'sk_asche_ereignis_03', ['Einverständnis']);
  u.tickSekten();
  assert.equal(u.sektenAktiv('sk_asche_ereignis_03'), null);
});

test('BQ: Haupt wechselt bei halben Leben einmal die Angriffe (Meldung, kein Heilen, gleiche Leben); Novizen fliehen', () => {
  const s = fresh();
  const c = new Combat(s, 'enemy_sk_asche_haupt');
  const names = () => c.enc.attacks.map((a) => a.name);
  assert.deepEqual(names(), ['Aschenmantel', 'Offener Ofen']);
  c.hurtEnemy(Math.ceil(c.enemy.maxHp * 0.5) + 5, { pierce: true });
  assert.ok(c.phased);
  assert.ok(c.phaseNote.includes('Aschenmantel'));
  assert.deepEqual(names(), ['Offener Ofen – Bruch', 'Aschenmantel – Nachsatz']);
  const hp = c.enemy.hp;
  c.hurtEnemy(5, { pierce: true });
  assert.ok(c.enemy.hp < hp && c.phased);
  assert.equal(content.encounters.enemy_sk_asche_novize.flees_after, 3);
  // Schreinwachen ohne eigene Beute
  const d = new Combat(fresh(), 'enemy_sk_asche_novize');
  d.outcome = 'won';
  const r = d.finish({ noLoot: true });
  assert.equal(r.loot, null);
});

test('BQ: Spielstand hält Stufen, laufende Ereignisse mit Fristen und abwesende Figuren; abgelaufene Fristen lösen sich beim Laden', () => {
  const s = fresh();
  s.setSektenStufe('sk_chor', 2);
  s.sektenStart('sk_chor_ereignis_05', 'ds_kalkmarkt');
  s.playTime = 100;
  const ev = s.sektenStart('sk_chor_ereignis_06', 'wx_bahnhof');
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const t = new GameState(content);
  assert.ok(t.load(data));
  assert.equal(t.sektenStufe('sk_chor'), 3); // Abwerbung: +1 beim Start
  assert.ok(t.sektenAbwesend('k3n_secondhaendler'));
  assert.equal(t.sektenAktiv(ev.id)?.until, ev.until);
  assert.ok(t.sektenDunkel('wx_bahnhof'));
  // Frist in der Zwischenzeit vorbei: beim Laden aufgelöst
  data.playTime = ev.until + 10;
  const u = new GameState(content);
  u.load(data);
  assert.equal(u.sektenAktiv(ev.id), null);
  assert.ok(u.sektenAbwesend('k3n_secondhaendler'));
  // Wegweiser und Hinweis
  assert.ok(u.sektenWegweiser());
  assert.equal(typeof u.sektenHinweis('ds_kalkmarkt'), 'string');
});
