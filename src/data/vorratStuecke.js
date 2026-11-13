// Vorratsstücke (Seb, 2026-11-12: „alle restlichen Codex-Sachen einbauen, neue Artefakte, Waffen usw.“).
// Neue Gegenstände mit Bildern aus den Codex-Vorrat-Zips Reserve200 und nebel200 (docs/art/vorrat):
// Waffen, Kleidung, Artefakte, und Wertstücke für Wexmoor (Kapitel 2) und Dunscar (Kapitel 3).
// Sie liegen bei den Händlern, fallen in den Gefahrengebieten und tauchen als Lose auf den geheimen Treffen auf.
// Bilder: items/<id>.png (16) und items/32/<id>.png, verkleinert aus den 64er-Vorlagen (BILD unten).

const b = (key, value, text) => ({ key, value, text });
const art = (name, price, desc, boons, curses) => ({ name, source: 'treffen', price, weight: 1, desc, boons, curses });

/** Herkunft der Bilder (Pfad unter public/sprites/items/). */
export const VS_BILD = {
  vs_jagdmesser: 'reserve200/ausruestung/reserve_083_jagdmesser',
  vs_steinschleuder: 'reserve200/ausruestung/reserve_085_steinschleuder',
  vs_parierdolch: 'reserve200/ausruestung/reserve_086_parierdolch',
  vs_duellsaebel: 'reserve200/ausruestung/reserve_087_duellsaebel',
  vs_handarmbrust: 'reserve200/ausruestung/reserve_084_handarmbrust',
  vs_bannnagel: 'reserve200/relikte/reserve_069_bannnagel',
  vs_spitzhacke: 'nebel200/werkzeuge/reserve_werkzeuge_13',
  vs_enterhaken: 'nebel200/werkzeuge/reserve_werkzeuge_10',
  vs_eisenkette: 'nebel200/werkzeuge/reserve_werkzeuge_16',
  vs_wollschal: 'reserve200/ausruestung/reserve_099_wollschal',
  vs_schutzbrille: 'reserve200/ausruestung/reserve_097_schutzbrille',
  vs_abzeichen: 'reserve200/ausruestung/reserve_100_abzeichen',
  vs_reisemantel: 'reserve200/ausruestung/reserve_091_reisemantel',
  vs_gasmaske: 'reserve200/ausruestung/reserve_096_gasmaske',
  vs_kettenhaube: 'reserve200/ausruestung/reserve_098_kettenhaube',
  vs_mondamulett: 'reserve200/relikte/reserve_061_mondamulett',
  vs_siegelring: 'nebel200/wertsachen/reserve_wertsachen_03',
  vs_seelenlaterne: 'reserve200/relikte/reserve_063_seelenlaterne',
  vs_geisterglocke: 'reserve200/relikte/reserve_067_geisterglocke',
  vs_fluestermuschel: 'reserve200/relikte/reserve_068_fluestermuschel',
  vs_totenuhr: 'reserve200/relikte/reserve_070_totenuhr',
  vs_runenknochen: 'reserve200/relikte/reserve_071_runenknochen',
  vs_blinder_spiegel: 'reserve200/relikte/reserve_072_blinder_spiegel',
  vs_schicksalsspindel: 'reserve200/relikte/reserve_077_schicksalsspindel',
  vs_sternenscherbe: 'reserve200/relikte/reserve_066_sternenscherbe',
  vs_orakelkugel: 'reserve200/relikte/reserve_065_orakelkugel',
  vs_dornenkrone: 'reserve200/relikte/reserve_062_dornenkrone',
  vs_ritualkelch: 'reserve200/relikte/reserve_075_ritualkelch',
  vs_ascheurne: 'reserve200/relikte/reserve_076_ascheurne',
  vs_augentalisman: 'reserve200/relikte/reserve_073_augentalisman',
  vs_opferkerze: 'reserve200/relikte/reserve_080_opferkerze',
  vs_perlenkette: 'nebel200/wertsachen/reserve_wertsachen_05',
  vs_kameenanhaenger: 'nebel200/wertsachen/reserve_wertsachen_06',
  vs_manschettenknoepfe: 'nebel200/wertsachen/reserve_wertsachen_07',
  vs_schnupftabakdose: 'nebel200/wertsachen/reserve_wertsachen_19',
  vs_silbertaschenuhr: 'nebel200/wertsachen/reserve_wertsachen_18',
  vs_smaragd: 'nebel200/wertsachen/reserve_wertsachen_11',
  vs_rohsaphir: 'nebel200/wertsachen/reserve_wertsachen_12',
  vs_goldbarren: 'nebel200/wertsachen/reserve_wertsachen_13',
  vs_rubinbrosche: 'nebel200/wertsachen/reserve_wertsachen_04',
  vs_spieldose: 'nebel200/wertsachen/reserve_wertsachen_08',
};

const W = (name, atk, price, desc, extra = {}) => ({ name, kind: 'weapon', atk, price, weight: extra.weight ?? 1.5, desc, ...extra });
const G = (name, slot, price, desc, boons) => ({ name, kind: 'gear', slot, price, weight: slot === 'mantel' ? 2 : 0.5, desc, boons });
const T = (name, price, desc) => ({ name, kind: 'trophy', rarity: 'selten', weight: 0.3, price, desc });

export const VS_ITEMS = {
  // Waffen Wexmoor (Gefahrengebiete)
  vs_jagdmesser: W('Moorjäger-Messer', 10, 140, 'Ein Jagdmesser mit halb vermoderter Scheide. Liegt gut in nasser Hand.'),
  vs_steinschleuder: W('Salzwatt-Schleuder', 9, 90, 'Eine Lederschleuder, geladen mit einem glatten Salzstein. Trifft auch, was im Nebel steht.', { occult: 1.2, weight: 0.5 }),
  vs_parierdolch: W('Parierdolch der Schleusenwache', 11, 180, 'Breiter Bügel, kurze Klinge. Die Schleusenwache hat damit Messer aus Händen gedreht.'),
  // Waffen Dunscar (Waffenhändlerin und Gefahrengebiete)
  vs_duellsaebel: W('Duellsäbel eines Bankiers', 15, 950, 'Ein schmaler Säbel mit Messingkorb. Gehörte einem Mann, der seine Schulden lieber ausfocht.'),
  vs_handarmbrust: W('Handarmbrust aus dem Stellwerk', 16, 1150, 'Kompakte Armbrust mit Stahlbügeln, gebaut, um Signaldrähte über die Gleise zu schießen.'),
  vs_bannnagel: W('Bannnagel', 14, 1050, 'Ein Zimmermannsnagel, umwickelt mit einem Streifen Pergament. Was er trifft, bleibt, wo es ist.', { occult: 1.7, weight: 1 }),
  vs_spitzhacke: W('Kalkbruch-Spitzhacke', 17, 1000, 'Schwer, stumpf, verlässlich. Im Klopfbruch hat man damit mehr als Kalk gebrochen.', { weight: 4 }),
  vs_enterhaken: W('Enterhaken der Kanalschiffer', 14, 820, 'Ein Haken an kurzer Kette. Zieht Gegner aus der Deckung und Kähne an die Kante.', { weight: 2.5 }),
  vs_eisenkette: W('Schlackenkette', 15, 900, 'Eine Eisenkette aus der Schlackengrube, noch warm. Wer sie schwingt, hält Abstand.', { occult: 1.3, weight: 3 }),
  // Kleidung Wexmoor (Schneiderin Ottilie Fenn)
  vs_wollschal: G('Dicker Moorschal', 'mantel', 190, 'Burgunderrote Wolle, dreimal um den Hals. Hält Nebel und Gerede ab.',
    [b('max_hp', 6, '+6 maximales Leben.'), b('composure_regen', 1.1, 'Nerven erholen sich 10 % schneller.')]),
  vs_schutzbrille: G('Messing-Schutzbrille', 'hut', 170, 'Türkise Gläser, Lederband. Durch sie wirkt die Geistsicht weniger grell.',
    [b('vision_cost', 0.8, 'Geistsicht kostet 20 % weniger Nerven.')]),
  vs_abzeichen: G('Ermittlerabzeichen mit Auge', 'amulett', 160, 'Ein altes Messingabzeichen ohne Inschrift. Die Leute glauben, es bedeute etwas.',
    [b('honor_loss', 0.8, 'Ansehen sinkt 20 % langsamer.'), b('lock_bonus', 5, 'Amtsschlösser verlangen 5 Ansehen weniger.')]),
  vs_reisemantel: G('Nachtblauer Reisemantel', 'mantel', 240, 'Mit Silberschnalle. Viele Taschen, wenig Gewicht.',
    [b('carry', 8, '+8 Pfund Tragkraft.'), b('dodge_window', 1.1, 'Ausweichfenster +10 %.')]),
  // Kleidung Dunscar (Kleiderhändlerin)
  vs_gasmaske: G('Leder-Atemmaske', 'hut', 720, 'Frühe Rußmaske mit runden Gläsern. Riecht nach Schmieröl und Angst.',
    [b('damage_taken', 0.92, '8 % weniger Schaden.'), b('max_nerves', 8, '+8 maximale Nerven.')]),
  vs_kettenhaube: G('Kettenhaube der Bahnwache', 'hut', 680, 'Ein Stahlgeflecht unter der Mütze. Alt, aber dicht.',
    [b('max_hp', 18, '+18 maximales Leben.')]),
  vs_mondamulett: G('Angelaufenes Mondamulett', 'amulett', 820, 'Silberne Mondsichel mit blauem Stein. Beruhigt, wenn man es festhält.',
    [b('composure_regen', 1.25, 'Nerven erholen sich 25 % schneller.'), b('max_nerves', 10, '+10 maximale Nerven.')]),
  vs_siegelring: G('Siegelring der Dunscar-Bank', 'amulett', 760, 'An einer Kette um den Hals getragen. Händler sehen ihn und werden höflich.',
    [b('price', 0.9, 'Einkaufen kostet 10 % weniger.'), b('sell', 1.1, '10 % höherer Erlös beim Verkaufen.')]),
  // Wertstücke (nur zum Verkaufen)
  vs_perlenkette: T('Perlenkette', 120, 'Echte Flussperlen, eine fehlt. Bei der Pfandleiherin ein gutes Stück wert.'),
  vs_kameenanhaenger: T('Kameenanhänger', 90, 'Ein Frauenprofil in Muschel geschnitten. Auf der Rückseite ein Datum.'),
  vs_manschettenknoepfe: T('Goldene Manschettenknöpfe', 70, 'Mit eingravierten Initialen, die niemand mehr zuordnen kann.'),
  vs_schnupftabakdose: T('Silberne Schnupftabakdose', 60, 'Leer bis auf einen Krümel. Der Deckel klemmt.'),
  vs_silbertaschenuhr: T('Beschädigte Silbertaschenuhr', 85, 'Das Glas gesprungen, das Werk steht. Das Silber ist trotzdem Silber.'),
  vs_smaragd: T('Geschliffener Smaragd', 650, 'Ein Stein, der in Dunscar mehr wert ist als ein Monatslohn im Bruch.'),
  vs_rohsaphir: T('Rohsaphir', 520, 'Ungeschliffen und schwer. Die Händler am Kalkmarkt beißen darauf.'),
  vs_goldbarren: T('Kleiner Goldbarren', 950, 'Mit dem Stempel einer Bank, die es nicht mehr gibt.'),
  vs_rubinbrosche: T('Rubinbrosche', 460, 'Rot wie ein Signal. Die Nadel ist verbogen.'),
  vs_spieldose: T('Spieldose mit Tänzerin', 380, 'Spielt drei Takte und verstummt. Die Tänzerin dreht sich weiter.'),
};

/** Neue Artefakte: Wexmoor (Treffen + Gefahrengebiete) und Dunscar (Treffen + Gefahrengebiete). */
export const VS_ARTEFAKTE = {
  vs_seelenlaterne: art('Seelenlaterne', 700, 'Eine schwarze Eisenlaterne mit einer einzigen türkisen Flamme. Sie brennt heller, wenn etwas ohne Körper nahe ist.',
    [b('occult_mult', 1.25, '25 % mehr Schaden gegen Okkultes.')], [b('max_nerves', -6, '6 weniger maximale Nerven.')]),
  vs_geisterglocke: art('Gesprungene Geisterglocke', 620, 'Eine kleine Silberglocke mit Patina. Sie läutet nur für dich, und das beruhigt.',
    [b('composure_regen', 1.3, 'Nerven erholen sich 30 % schneller.')], [b('unruhe_tick', 0.1, '+0,1 Unruhe pro Sekunde.')]),
  vs_fluestermuschel: art('Flüstermuschel', 520, 'Eine dunkle Muschel mit violettem Inneren. Hält man sie ans Ohr, sagt jemand, wo man hinsehen soll.',
    [b('vision_cost', 0.6, 'Geistsicht kostet 40 % weniger Nerven.')], [b('max_hp', -8, '8 weniger maximales Leben.')]),
  vs_totenuhr: art('Totenuhr', 900, 'Eine Taschenuhr ohne Ziffern, das Zifferblatt ein Schädel. Sie läuft nur im Kampf.',
    [b('ap_start', 1, '+1 Konzentration zum Kampfbeginn.')], [b('max_hp', -15, '15 weniger maximales Leben.')]),
  vs_runenknochen: art('Runenknochen', 820, 'Ein langer Knochen mit drei Zeichen, die keiner Schrift gehören.',
    [b('dmg_mult', 1.12, 'Schaden ×1,12.')], [b('heal_bonus', 0.8, 'Heilmittel wirken nur zu 80 %.')]),
  vs_ritualkelch: art('Angelaufener Ritualkelch', 760, 'Ein Silberkelch, in dem immer etwas Violettes steht. Wer daraus trinkt, heilt schneller und verdaut langsamer.',
    [b('heal_bonus', 1.4, 'Heilmittel wirken 40 % stärker.')], [b('digest_mult', 0.85, 'Tränke verdauen 15 % langsamer.')]),
  vs_ascheurne: art('Gesprungene Ascheurne', 680, 'Eine kleine Urne mit Kupferdeckel. Die Asche darin ist ruhig, und sie macht dich ruhig.',
    [b('max_nerves', 12, '+12 maximale Nerven.')], [b('calm_decay', 0.8, 'Unruhe klingt 20 % langsamer ab.')]),
  vs_blinder_spiegel: art('Blinder Spiegel', 2400, 'Ein Handspiegel mit völlig schwarzem Glas. Er zeigt den Schlag, nicht dich.',
    [b('dodge_window', 1.25, 'Ausweichfenster +25 %.')], [b('damage_taken', 1.08, '8 % mehr Schaden.')]),
  vs_schicksalsspindel: art('Schicksalsspindel', 2200, 'Eine alte Spindel mit dunkelrotem Faden. Was sie aufwickelt, gehört bald dir.',
    [b('money_bonus', 1.3, 'Beutegeld ×1,30.')], [b('honor_loss', 1.25, 'Ansehensverluste wiegen 25 % schwerer.')]),
  vs_sternenscherbe: art('Sternenscherbe', 3000, 'Ein gezacktes Stück eines gefallenen Sterns, blassgolden. Es wärmt das Blut und kühlt den Kopf zu sehr.',
    [b('max_hp', 50, '+50 maximales Leben.')], [b('composure_regen', 0.8, 'Nervenerholung nur 80 %.')]),
  vs_orakelkugel: art('Trübe Orakelkugel', 3600, 'Eine Kristallkugel auf drei Messingkrallen. Sie zeigt den nächsten Zug, aber sie zeigt ihn laut.',
    [b('ap_max', 1, '+1 Höchstkonzentration.')], [b('unruhe_tick', 0.2, '+0,2 Unruhe pro Sekunde.')]),
  vs_dornenkrone: art('Dornenkrone', 2800, 'Eine kleine Eisenkrone voller trockener Dornen. Sie sticht dich und jeden, den du schlägst.',
    [b('dmg_mult', 1.25, 'Schaden ×1,25.')], [b('damage_taken', 1.15, '15 % mehr Schaden.')]),
  vs_augentalisman: art('Türkiser Augentalisman', 2600, 'Ein bronzenes Auge mit türkisem Kern. Wer ihn trägt, wird seltener überrascht.',
    [b('damage_taken', 0.9, '10 % weniger Schaden.'), b('parry_ap', 1, 'Paraden bringen +1 Konzentration.')], [b('price', 1.15, 'Händlerpreise ×1,15.')]),
  vs_opferkerze: art('Opferkerze mit schwarzer Flamme', 2000, 'Brennt nicht herunter. Ihre Flamme frisst Furcht und lässt Hunger zurück.',
    [b('calm_decay', 1.3, 'Unruhe klingt 30 % schneller ab.'), b('max_nerves', 10, '+10 maximale Nerven.')], [b('max_hp', -25, '25 weniger maximales Leben.')]),
};

/** Wo es was gibt. */
export const VS_HAENDLER = {
  wx_schneiderin: ['vs_wollschal', 'vs_schutzbrille', 'vs_abzeichen', 'vs_reisemantel'],
  ds_waffenhaendlerin: ['vs_duellsaebel', 'vs_handarmbrust', 'vs_spitzhacke', 'vs_enterhaken'],
  ds_kleiderhaendlerin: ['vs_gasmaske', 'vs_kettenhaube', 'vs_mondamulett', 'vs_siegelring'],
};

/** Beute je Region: Chance für normale Gegner, Eliten ×2, Bosse ×4 (gedeckelt bei 60 %). */
export const VS_BEUTE = {
  wx_: [['vs_jagdmesser', 0.015], ['vs_steinschleuder', 0.015], ['vs_parierdolch', 0.01], ['vs_perlenkette', 0.03], ['vs_kameenanhaenger', 0.04],
    ['vs_manschettenknoepfe', 0.05], ['vs_schnupftabakdose', 0.05], ['vs_silbertaschenuhr', 0.04],
    ['vs_ritualkelch', 0.004], ['vs_ascheurne', 0.004]],
  ds_: [['vs_bannnagel', 0.008], ['vs_eisenkette', 0.01], ['vs_smaragd', 0.02], ['vs_rohsaphir', 0.03], ['vs_goldbarren', 0.012],
    ['vs_rubinbrosche', 0.03], ['vs_spieldose', 0.035], ['vs_dornenkrone', 0.003], ['vs_opferkerze', 0.003]],
};

/** Lose auf den geheimen Treffen (Zirkel → [Stück, Ausrufpreis, Chance]); Artefakte nur einmal. */
export const VS_LOSE = {
  lichtlose: [['vs_seelenlaterne', 620, 0.3], ['vs_fluestermuschel', 480, 0.3], ['vs_totenuhr', 650, 0.2]],
  salz: [['vs_geisterglocke', 620, 0.3], ['vs_runenknochen', 600, 0.25], ['vs_ritualkelch', 580, 0.15]],
  namensgilde: [['vs_ascheurne', 540, 0.2]],
  kalkofen: [['vs_sternenscherbe', 3000, 0.2], ['vs_opferkerze', 2000, 0.2]],
  stellwerk: [['vs_blinder_spiegel', 2400, 0.25]], // Seb 2026-11-13: keine schwachen Waffen in Dunscar-Zirkeln (Bannnagel raus)
  schichtbund: [['vs_schicksalsspindel', 2200, 0.25], ['vs_orakelkugel', 3600, 0.15]],
  salzds: [['vs_augentalisman', 2600, 0.25], ['vs_dornenkrone', 2800, 0.1]],
};

export const VS_ICONS = Object.keys(VS_BILD);

export function vorratStueckePack() {
  return { name: 'vorrat_stuecke', items: { ...VS_ITEMS }, artifacts: { list: VS_ARTEFAKTE } };
}

/** Händler, Beute und Treffen-Lose. Läuft nach der Dunscar-Beute und vor dem Händlerabgleich. */
export function applyVorratStuecke(content) {
  const has = (id) => !!content.items[id];
  for (const [m, ids] of Object.entries(VS_HAENDLER)) {
    const merchant = content.market?.merchants?.[m];
    if (!merchant) continue;
    for (const item of ids) {
      if (has(item) && !merchant.stock.some((e) => e.item === item)) merchant.stock.push({ item, price: content.items[item].price });
    }
  }
  for (const [id, e] of Object.entries(content.encounters)) {
    const pre = Object.keys(VS_BEUTE).find((p) => String(e.zone ?? '').startsWith(p));
    if (!pre || e.benannt) continue;
    const table = content.loot[id];
    if (!table) continue;
    const mult = (e.boss ? 4 : e.elite ? 2 : 1) * (e.zone === 'ds_schlackengrube' ? 3 : 1); // Schlackengrube bleibt die reichste Grube
    const own = new Set((table.drops ?? []).map((d) => d.item));
    const extra = VS_BEUTE[pre].filter(([item]) => has(item) && !own.has(item)).map(([item, c]) => ({ item, chance: Math.min(0.6, +(c * mult).toFixed(4)) }));
    content.loot[id] = { ...table, drops: [...(table.drops ?? []), ...extra] };
  }
  const circles = content.gatherings?.circles ?? {};
  for (const [cid, lose] of Object.entries(VS_LOSE)) {
    const members = circles[cid]?.members?.filter((m) => m.offers) ?? [];
    if (!members.length) continue;
    lose.forEach(([item, price, chance], i) => {
      if (!has(item)) return;
      const m = members[(i * 2 + 1) % members.length];
      if (m.offers.some((o) => o.item === item)) return;
      m.offers.push({ item, price, chance, ...(content.items[item].kind === 'artifact' ? { once: true } : {}) });
    });
  }
  return content;
}
