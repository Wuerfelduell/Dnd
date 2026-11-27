/**
 * Habseligkeiten der Gefallenen (Seb 2026-11-27: „für Calderwick noch einige ungenutzte Assets einbauen“, „die Vorratspakete von Codex nutzen“).
 * Fünfundzwanzig Fundstücke, die Gestürzte von oben mitbringen und unten verlieren. Bilder aus den bisher ungenutzten Codex-Vorräten
 * Reserve200 (items/reserve200), Future200 (future200/icons) und Nebel200 (items/nebel200). Reine Wertsachen zum Verkaufen, keine Wirkung.
 * Quellen: Fund-Topf der Calderwicker Gegner (calderwickBeute.js), je ein Stück in den Verstecken (calderwickErkunden.js).
 */
const R = (kat, f) => `reserve200/${kat}/${f}`;
const F = (f) => `../future200/icons/${f}`;
const N = (n) => `nebel200/wertsachen/reserve_wertsachen_${n}`;

/** [id, Name, Bild, Preis, Gewicht im Topf, Beschreibung] */
export const CW_FUNDE = [
  ['cwf_fallbuchseite', 'Herausgerissene Fallbuchseite', F('future200_004_charred_diary'), 600, 3, 'Eine Seite aus einem Fallbuch, an den Rändern verkohlt. Drei Namen, zwei davon gestrichen.'],
  ['cwf_fahrkarte_oben', 'Entwertete Fahrkarte nach oben', F('future200_003_torn_railway_ticket'), 500, 3, 'Einfache Fahrt, Calderwick nach oben. Gelocht, entwertet, nie benutzt.'],
  ['cwf_brille', 'Gesprungene Brille', F('future200_005_cracked_spectacles'), 300, 3, 'Beim Sturz zersprungen. Wer sie trug, sah danach vermutlich nichts mehr.'],
  ['cwf_zinnsoldat', 'Zinnsoldat aus der Oberstadt', R('kuriositaeten', 'reserve_189_zinnsoldat'), 400, 3, 'Ein Kinderspielzeug mit dem Wappen eines oberen Regiments. Wer fällt mit so etwas in der Tasche?'],
  ['cwf_haftbefehl', 'Haftbefehl gegen einen Gefallenen', F('future200_111_rolled_arrest_warrant'), 700, 2.5, 'Ausgestellt oben, zugestellt nie. Unten gilt er nichts, aber Sammler zahlen gut.'],
  ['cwf_rabenkarte', 'Spielkarte mit Rabenwappen', F('future200_119_blank_playing_card_with_raven_emblem'), 650, 2.5, 'Eine leere Karte mit einem Raben auf der Rückseite. In der Oberstadt ein Zeichen, unten ein Rätsel.'],
  ['cwf_manschettenknoepfe', 'Gravierte Manschettenknöpfe', F('future200_087_engraved_cufflinks'), 900, 2, 'Initialen, die im Fallbuch nicht vorkommen. Gutes Silber.'],
  ['cwf_gildenbinde', 'Bestickte Gildenbinde', F('future200_110_embroidered_guild_armband'), 900, 2, 'Die Armbinde einer oberen Gilde. Unten näht man sie zu Taschen.'],
  ['cwf_bleisiegel', 'Bleisiegel des Kronenarchivs', R('schluessel_siegel', 'reserve_172_bleisiegel'), 1000, 2, 'Von einer Kiste abgerissen, die nach Briarholt ging. Die Nummer ist abgekratzt.'],
  ['cwf_porzellanpuppe', 'Porzellanpuppe mit Sprung', R('kuriositaeten', 'reserve_181_porzellanpuppe'), 800, 2, 'Der Sprung geht quer über das Gesicht. Sie lächelt trotzdem.'],
  ['cwf_schnupftabakdose', 'Silberne Schnupftabakdose', F('future200_086_silver_snuff_box'), 1100, 1.5, 'Leer bis auf einen Krümel und einen eingeritzten Namen.'],
  ['cwf_medaillon', 'Medaillon mit einem Bild von oben', R('fundstuecke', 'reserve_039_medaillonfoto'), 1200, 1.5, 'Darin ein Foto: ein Garten, Sonne, jemand lacht. So sieht es oben aus. Angeblich.'],
  ['cwf_taschenuhr', 'Stehengebliebene Taschenuhr', F('future200_041_brass_pocket_watch'), 1300, 1.5, 'Blieb in der Minute des Sturzes stehen. Alle Uhren von Gefallenen zeigen eine andere Zeit.'],
  ['cwf_samtbeutel', 'Samtbeutel mit Münzen von oben', F('future200_088_velvet_coin_purse'), 1400, 1.2, 'Oben gängiges Geld, unten nur Metall. Lottie zahlt trotzdem.'],
  ['cwf_trauerkamee', 'Trauerkamee', F('future200_083_mourning_cameo'), 1500, 1.2, 'Ein Profil in Elfenbein. Getragen für jemanden, der zuerst gefallen ist.'],
  ['cwf_spieluhr', 'Spieluhr ohne Melodie', R('kuriositaeten', 'reserve_182_spieluhr'), 1600, 1, 'Die Walze dreht sich, aber kein Ton kommt heraus. Als hätte sie das Lied oben gelassen.'],
  ['cwf_siegelring', 'Siegelring eines Gestürzten', R('fundstuecke', 'reserve_035_siegelring'), 1800, 0.8, 'Das Wappen eines oberen Hauses. Im Kronenarchiv würde man fragen, woher du ihn hast.'],
  ['cwf_gerichtsakte', 'Versiegelte Gerichtsakte von oben', F('future200_117_sealed_court_dossier'), 2000, 0.6, 'Das Siegel ist unversehrt. Wer sie öffnet, erfährt, warum jemand fallen musste.'],
  ['cwf_fuellfeder', 'Füllfeder eines Schreibers von oben', N('14'), 700, 2.5, 'Die Tinte darin ist eingetrocknet. Die letzte Zeile, die sie schrieb, war vielleicht ein Urteil.'],
  ['cwf_scherenschnitt', 'Scherenschnitt eines Kindes', N('20'), 450, 2.5, 'Ein schwarzes Profil auf weißem Grund. Auf der Rückseite: „Komm bald heim.“'],
  ['cwf_opernglas', 'Opernglas aus der Oberstadt', N('16'), 1300, 1.5, 'Damit sah man oben auf die Bühne. Hier unten sieht man damit nur nach oben.'],
  ['cwf_orden', 'Verliehener Orden', N('17'), 1700, 1, 'Für Verdienste, die oben zählten. Das Band ist beim Sturz gerissen.'],
  ['cwf_silberkelch', 'Silberkelch mit Wappen', N('09'), 2100, 0.6, 'Aus einem Haus, das es oben noch gibt. Im Kronenarchiv steht der Kelch als „verloren“.'],
  ['cwf_glasvogel', 'Glasvogel', R('kuriositaeten', 'reserve_200_glasvogel'), 2400, 0.4, 'Fein wie ein Atemzug und den ganzen Sturz heil geblieben. Niemand weiß, wie.'],
  ['cwf_totenmaske', 'Totenmaske eines Engels', R('kuriositaeten', 'reserve_192_totenmaske'), 4500, 0.15, 'Kalt, glatt und zu schön. Man legt sie nicht gern mit dem Gesicht nach oben.'],
];

/**
 * Einzelporträts (64x64) aus dem Vorrat Future200 für Calderwicker ohne eigenes Bild:
 * Einwohner, Marktleute und die Leute der beiden Calderwicker Zirkel.
 */
export const CW_VORRAT_PORTRAETS = {
  cwn_aufzugswaerter: '124_bearded_railway_porter', cwn_e_bote: '130_young_male_postal_clerk', cwn_e_laternenwart: '122_young_male_lamplighter_with_soot_on_cheeks',
  cwn_e_griffmacherin: '147_female_factory_engineer_with_copper_goggles', cwn_e_nachtsetzer: '136_old_male_archivist_with_ink_stains',
  cwo_marktstand: '153_woman_salt_merchant_in_blue_shawl', cwn_e_marktfrau: '159_female_innkeeper_with_braided_grey_hair',
  cwz_tuersteherin: '139_female_detective_with_cropped_hair', cwn_e_fensterputzerin: '145_woman_ferry_ticket_seller', cwn_e_waescherin: '155_female_wax_sculptor_with_amber_earrings',
  cwn_e_archivdienerin: '143_female_bookbinder_in_leather_apron', cwz_bleisetzer: '158_male_ceramicist_with_clay_stained_apron',
  cwz_waffenwart: '137_woman_glassblower_with_protective_goggles', cwz_schneiderin: '133_woman_newspaper_editor_with_spectacles', cwz_kesselflicker: '154_male_street_sweeper_in_wool_cap',
  cwz_letternfrau: '151_female_telegraph_operator_with_headset', cwz_pfandmeister: '138_male_tea_merchant_with_patterned_waistcoat', cwz_schaetzerin: '121_elderly_woman_locksmith_with_loupe',
  cwz_kassenwart: '126_bald_male_alchemist_with_round_glasses', cwz_sammlerin: '141_woman_astronomer_with_star_brooch', cwz_aschehaendler: '140_male_night_watchman_with_sideburns',
};

/** Bild je Fundstück (für ITEM_ICON_ALIASES in world/assets.js). */
export const CWF_ICONS = Object.fromEntries(CW_FUNDE.map(([id, , bild]) => [id, bild]));

export function applyCalderwickFunde(content) {
  for (const [id, name, , price, , desc] of CW_FUNDE) {
    content.items[id] ??= { name, kind: 'trophy', weight: 0.2, price, desc, cw_fund: true };
  }
}

/** Topf-Einträge der Fundstücke (calderwickBeute.js). */
export const cwFundTopf = (content) => CW_FUNDE.filter(([id]) => content.items[id]).map(([item, , , , w]) => ({ item, w }));
