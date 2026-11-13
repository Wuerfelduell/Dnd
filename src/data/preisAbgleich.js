// Preis- und Belohnungsabgleich über alle Kapitel (Seb, 2026-11-13: „alle Artefakte, Preise und Belohnungen,
// auch Heilung, Konzentration und Nerven“). Richtwerte je Gebiet:
//
//   Gebiet          Seq    Leben   Nerven   Geld je Kampf (normal/Boss)
//   Kettlegate      9–7    45–80   105–130  ~15 / ~40
//   Wexmoor         7–5    60–135  110–190  ~33 / ~120
//   Dunscar         5–4   90–275  130–290  ~250 / ~1200
//   Calderwick      4      175–275 190–290  ~250 / ~1100
//   Briarholt       4      175–275 190–290  ~650 / ~3100
//
// Befunde und Änderungen:
//  - Wexmoor heilte im Laden höchstens 25 (Tonikum), bei Seq 5 mit ~100 Leben und Wexmoor-Gegnern mit +50 % Schaden.
//    Maud Keel führt jetzt die Verbandrolle (50), die Namensgilde-Brühen heilen spürbar statt 6/18 für 90 Schilling.
//  - Calderwick/Briarholt (Seq 4, 175–275 Leben) verkauften Verpflegung mit 14–45 Heilung und Riechsalz mit +10 Nerven.
//    Das lag unter Dunscar (Verbandrolle 50 bis Kalkelixier 260). Jetzt 60–260 Leben und 120/220 Nerven.
//  - Waffen und Kleidung dort lagen unter dem, was man aus Dunscar mitbringt (Atk 16–18 gegen Zirkel 23–36).
//    Jetzt Atk 32–50 und +100–300 Leben (über den Dunscar-Zirkelstücken), Preise 6.000–26.000.
//  - Die acht Artefakte aus Calderwick/Briarholt hatten nur Beschreibungen ohne Wirkung (Codex-Entwurf). Jetzt echte
//    Wirkungen mit vorhandenen Schlüsseln, kurze Texte, Preise auf Kapitel-4-Niveau.
//  - Konzentration: Es gab kein Mittel, das im Kampf Konzentration bringt. Rangiererkaffee (Dunscar) und Terrassentee
//    (Calderwick) geben jetzt +1 Konzentration (Feld `ap` an Verbrauchsgütern, Combat.useItemNow).
//  - Geisterlaterne (Dunscar-Zirkel, 1500): zusätzlich eine Minute lang keine neue Unruhe (Seb: −120 bringt bei Höchstwert 100 nichts).
//  - Prüfungshilfen des Lampenwarts (Dunscar) heilten 14 / Nerven 18 / Schaden 6: auf Dunscar-Maß gehoben.

/** Verbrauchsgüter: neue Werte (heal, composure, calm, ap, damage), Grundpreis und Beschreibung. */
export const VERBRAUCH = {
  // Wexmoor
  k2g_rufpastille: { heal: 30, calm: 15, desc: 'Sumpfminze und Honig, in Papier mit leerem Namensfeld. Stellt 30 Leben wieder her und senkt die Unruhe um 15. Sie gibt keinen verlorenen Namen zurück.' },
  k2g_schreinbruehe: { heal: 60, calm: 10, desc: 'Warme Brühe aus Gerste und Salzkräutern. Stellt 60 Leben wieder her und senkt die Unruhe um 10. Der Löffel ist nicht im Preis enthalten.' },
  // Dunscar
  dsh_kaffee: { ap: 1, desc: 'Schwarz und so stark, dass der Löffel steht. +55 Nerven, im Kampf +1 Konzentration.' },
  dsz_geisterlaterne: { buff: { key: 'unruhe_gain', value: 0, seconds: 60 }, desc: 'Brennt mit einem Licht, das nicht wärmt. Ein Atemzug davon beruhigt Kopf und Nerven. Senkt die Unruhe um 60, beruhigt die Nerven (+40) und eine Minute lang steigt keine Unruhe.' },
  // Calderwick/Briarholt
  vi_v_setzerbrot: { heal: 120, price: 120, desc: 'Brot mit eingebackener Letter. +120 Leben.' },
  vi_v_bitterwasser: { heal: 60, calm: 15, price: 75, desc: 'Trübes Wasser aus der Terrasse; bitter, aber reinigend: +60 Leben, −15 Unruhe.' },
  vi_v_dampfkompresse: { heal: 90, calm: 20, price: 110, desc: 'Heiße Kompresse; löst Verspannung und Unruhe: +90 Leben, −20 Unruhe.' },
  vi_v_wegzehrung: { heal: 160, price: 160, desc: 'Speck, Brot, Zwiebel im Tuch. +160 Leben.' },
  vi_v_pfirsichsud: { heal: 260, price: 450, desc: 'Klarer warmer Sud. +260 Leben.' },
  vi_v_riechsalz_stark: { heal: 30, composure: 120, price: 150, desc: 'Starkes Riechsalz; bringt Benommene zu sich: +30 Leben, +120 Nerven.' },
  vi_v_terrassentee: { composure: 220, ap: 1, price: 300, desc: 'Rußiger schwarzer Tee. +220 Nerven, im Kampf +1 Konzentration.' },
};

/** Prüfungshilfen des Lampenwarts (Dunscar): je Art neue Stärke. */
const HILFE = { heal: 60, composure: 70, damage: 40 };

/** Läden: [Laden, Stück, Preis] (neu oder neuer Preis). */
export const LADEN = [
  ['wx_pfandleiherin', 'dsh_verbandrolle', 90],
  ['vi_handel_druckerei', 'vi_v_setzerbrot', 240],
  ['vi_handel_druckerei', 'dsh_kaffee', 180],
  ['vi_handel_garten', 'vi_v_bitterwasser', 150],
  ['vi_handel_garten', 'vi_v_dampfkompresse', 220],
  ['vi_handel_garten', 'vi_v_pfirsichsud', 900],
  ['vi_handel_garten', 'vi_v_terrassentee', 600],
  ['vi_handel_reise', 'vi_v_wegzehrung', 320],
  ['vi_handel_reise', 'vi_v_riechsalz_stark', 300],
  ['vi_handel_reise', 'dsh_schichttonikum', 450],
];

/** Kalkapotheke: Kaffee mit Konzentration etwas teurer. */
const DUNSCAR_PREIS = { dsh_kaffee: 120 };

/** Kleidung Calderwick/Briarholt: [Wirkungen, Preis]. Muss über der Dunscar-Zirkelkleidung liegen
 *  (dsz_*: +60–120 Leben, −15 % Schaden, +35–45 Nerven, 8.000–13.000), sonst ist sie nach Dunscar wertlos. */
export const SPAET_GEAR = {
  vi_hut_setzerkappe: [[['max_nerves', 70, '+70 maximale Nerven.'], ['dmg_mult', 1.1, 'Du richtest 10 % mehr Schaden an.']], 7000],
  vi_hut_kurhaube: [[['max_hp', 220, '+220 maximales Leben.'], ['max_nerves', -10, '−10 maximale Nerven.']], 14000],
  vi_hut_zylinder_vermesser: [[['sell', 1.3, '30 % höherer Erlös beim Verkaufen, auch bei Geboten und Gesuchen auf den Treffen.']], 6000],
  vi_hut_fuhrmannshut: [[['max_hp', 180, '+180 maximales Leben.']], 11000],
  vi_mantel_druckerschurz: [[['max_nerves', 80, '+80 maximale Nerven.'], ['max_hp', 100, '+100 maximales Leben.'], ['damage_taken', 0.85, '15 % weniger erlittener Schaden.']], 17000],
  vi_mantel_dampfmantel: [[['max_hp', 300, '+300 maximales Leben.']], 22000],
  vi_mantel_reisepelerine: [[['carry', 30, '+30 Pfund Tragkraft.'], ['max_hp', 130, '+130 maximales Leben.']], 10000],
  vi_mantel_archivrobe: [[['lock_bonus', 25, 'Amtsschlösser verlangen 25 Ansehen weniger.'], ['honor_loss', 0.6, '40 % weniger Ansehensverlust.']], 6000],
  vi_amulett_bleiletter: [[['vision_cost', 0.5, 'Geistsicht kostet 50 % weniger Nerven.']], 6000],
  vi_amulett_pfirsichkern: [[['unruhe_gain', 0.7, 'Unruhe steigt 30 % langsamer.'], ['max_nerves', 70, '+70 maximale Nerven.']], 14000],
  vi_amulett_grenzsteinsplitter: [[['dodge_window', 1.4, 'Ausweichfenster +40 %.']], 8000],
  vi_amulett_rohrpostkapsel: [[['damage_taken', 0.7, '30 % weniger erlittener Schaden.'], ['max_hp', 40, '+40 maximales Leben.']], 18000],
};

/** Waffen Calderwick/Briarholt: [Atk, Preis]. Dunscar: Läden 13–17, Zirkel 23–36 (8.500–28.000).
 *  Die schwächste Kapitel-4-Waffe liegt über den gängigen Zirkelwaffen (~27), die stärkste über der Schichtglocke (36). */
export const SPAET_WAFFEN = {
  vi_waffe_setzhaken: [32, 12000],
  vi_waffe_kutschpeitsche: [35, 15000],
  vi_waffe_veredelungsschere: [38, 18000],
  vi_waffe_richterstab: [42, 22000],
  vi_waffe_dampfrohr: [46, 26000],
  vi_waffe_bleihammer: [50, 31000], // Seb 2026-11-13: Waffen bis 50, eine 50er mindestens 25.000
};

/** Artefakte Calderwick/Briarholt: echte Wirkungen statt Entwurfstext, stärker als die gängigen Dunscar-Zirkelartefakte. */
export const SPAET_ARTEFAKTE = {
  vi_art_das_leere_tuerschild: {
    price: 6000, desc: 'Messingschild ohne Namen. Wer dich sucht, findet die Tür nicht; wer dich kennt, auch nicht mehr so recht.',
    boons: [['dodge_window', 1.5, 'Ausweichfenster +50 %.']], curses: [['honor_loss', 1.3, '30 % mehr Ansehensverlust.']],
  },
  vi_art_der_erste_durchschlag: {
    price: 9000, desc: 'Durchschlag mit fremder Unterschrift. Was du tust, zählt doppelt, und es kostet dich etwas.',
    boons: [['dmg_mult', 1.5, 'Du richtest 50 % mehr Schaden an.']], curses: [['max_nerves', -30, '−30 maximale Nerven.']],
  },
  vi_art_die_warme_postkarte: {
    price: 6500, desc: 'Postkarte, die nie kalt wird. Im Kampf kehren die Nerven zurück, aber sie flüstert weiter.',
    boons: [['round_nerves', 15, 'Jede Kampfrunde +15 Nerven.']], curses: [['unruhe_tick', 0.15, 'Unruhe steigt langsam.']],
  },
  vi_art_der_falsche_fahrplan: {
    price: 5000, desc: 'Fahrplan mit Personen als Fracht. Man reist leichter, aber jemand anderes bekommt deinen Anteil.',
    boons: [['carry', 40, '+40 Pfund Tragkraft.'], ['max_hp', 60, '+60 maximales Leben.']], curses: [['money_bonus', 0.8, '20 % weniger Geld aus Kämpfen.']],
  },
  vi_art_die_gaertnerschnur: {
    price: 6000, desc: 'Grüne Schnur mit Knoten. Wunden schließen sich schneller, aber die Haut wird dünn.',
    boons: [['heal_bonus', 1.8, 'Heilmittel wirken 80 % stärker.'], ['max_hp', 80, '+80 maximales Leben.']], curses: [['damage_taken', 1.1, '10 % mehr erlittener Schaden.']],
  },
  vi_art_der_stille_stempel: {
    price: 5000, desc: 'Stempel ohne Zeichen. Aussagen fallen dir zu, aber dein Name verliert an Gewicht.',
    boons: [['conclusion_honor', 3, '+3 Ansehen je Schlussfolgerung.'], ['occult_mult', 1.3, '30 % mehr Schaden gegen Übernatürliches.']], curses: [['honor_loss', 1.3, '30 % mehr Ansehensverlust.']],
  },
  vi_art_das_bremserseil: {
    price: 6000, desc: 'Seil der Standseilbahn. Es hält dich immer zurück, auch wenn du bleiben willst.',
    boons: [['always_flee', true, 'Flucht ist aus jedem Kampf möglich.'], ['damage_taken', 0.8, '20 % weniger erlittener Schaden.']], curses: [['dmg_mult', 0.9, 'Du richtest 10 % weniger Schaden an.']],
  },
  vi_art_die_kurglocke: {
    price: 8000, desc: 'Kleine Glocke der Stillenhäuser. Gewöhnliche Gegner schlafen beim ersten Ton ein, und wachen zornig auf.',
    boons: [['opening_stun', true, 'Gewöhnliche Gegner (keine Bosse) setzen ihren ersten Zug aus.'], ['ap_start', 1, '+1 Konzentration zu Kampfbeginn.']], curses: [['damage_taken', 1.15, '15 % mehr erlittener Schaden.']],
  },
};

const kv = (l) => l.map(([key, value, text]) => ({ key, value, text }));

function setItem(content, id, patch) {
  if (content.items[id]) content.items[id] = { ...content.items[id], ...patch };
}

function setStock(content, mid, item, price) {
  const m = content.market.merchants[mid];
  if (!m || !content.items[item]) return;
  const has = m.stock.some((e) => e.item === item && e.rare === undefined);
  const stock = has ? m.stock.map((e) => (e.item === item && e.rare === undefined ? { ...e, price } : e)) : [...m.stock, { item, price }];
  content.market.merchants[mid] = { ...m, stock };
}

export function applyPreisAbgleich(content) {
  if (!content.market?.merchants) return;
  content.market = { ...content.market, merchants: { ...content.market.merchants } };
  for (const [id, p] of Object.entries(VERBRAUCH)) setItem(content, id, p);
  for (const [id, it] of Object.entries(content.items)) {
    if (!id.startsWith('k3h_hilfe_')) continue;
    const art = ['heal', 'composure', 'damage'].find((k) => it[k]);
    if (!art) continue;
    setItem(content, id, { [art]: HILFE[art], price: 60, desc: it.desc?.replace(/\d+/, String(HILFE[art])) });
    setStock(content, 'k3h_lampenwart', id, 60);
  }
  for (const [id, [boons, price]] of Object.entries(SPAET_GEAR)) setItem(content, id, { boons: kv(boons), price });
  for (const [id, [atk, price]] of Object.entries(SPAET_WAFFEN)) setItem(content, id, { atk, price });
  for (const [id, a] of Object.entries(SPAET_ARTEFAKTE)) setItem(content, id, { price: a.price, desc: a.desc, boons: kv(a.boons), curses: kv(a.curses) });
  // Ladenpreise nachziehen: alles, was oben einen Preis bekam, kostet im Laden so viel (Restposten bleiben).
  const preise = { ...DUNSCAR_PREIS };
  for (const [id, [, price]] of Object.entries(SPAET_GEAR)) preise[id] = price;
  for (const [id, [, price]] of Object.entries(SPAET_WAFFEN)) preise[id] = price;
  for (const [mid, m] of Object.entries(content.market.merchants)) {
    for (const e of m.stock) if (preise[e.item] && e.rare === undefined) setStock(content, mid, e.item, preise[e.item]);
  }
  for (const [mid, item, price] of LADEN) setStock(content, mid, item, price);
}
