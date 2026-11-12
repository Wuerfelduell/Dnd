// Lädt alle Inhaltsdateien des Spiels.
import { buildContent } from './buildContent.js';
import campaign from './campaign.json';
import quests from './quests.json';
import items from './items.json';
import encounters from './encounters.json';
import case01 from './case_01.json';
import case02 from './case_02.json';
import case03 from './case_03.json';
import caseAltmarkt from './case_altmarkt.json';
import case04 from './case_04.json';
import nordtor from './maps/nordtor.json';
import theater from './maps/theater.json';
import uhrturm from './maps/uhrturm.json';
import gaskanaele from './maps/gaskanaele.json';
import schlachthof from './maps/schlachthof.json';
import sternwarte from './maps/sternwarte.json';
import dNordtor from './dialogues/nordtor.json';
import dFunde from './dialogues/fundstuecke.json';
import altmarkt from './maps/altmarkt.json';
import tavern from './maps/tavern.json';
import dAltmarkt from './dialogues/altmarkt.json';
import docks from './maps/docks.json';
import warehouse from './maps/warehouse.json';
import dHafen from './dialogues/hafen.json';
import revier from './maps/revier.json';
import ashgrove from './maps/ashgrove.json';
import ebba from './maps/ebba.json';
import crypt from './maps/crypt.json';
import dRevier from './dialogues/revier.json';
import dAshgrove from './dialogues/ashgrove.json';
import dEbba from './dialogues/ebba.json';
import pathways from './pathways.json';
import market from './market.json';
import travel from './travel.json';
import nachtmarkt from './maps/nachtmarkt.json';
import dNachtmarkt from './dialogues/nachtmarkt.json';
import wilds from './wilds.json';
import marsch from './maps/marsch.json';
import katakomben from './maps/katakomben.json';
import pestgassen from './maps/pestgassen.json';
import kraterwald from './maps/kraterwald.json';
import factions from './factions.json';
import city from './stadtgegner.json';
import dKopfgeld from './dialogues/kopfgeld.json';
import ankerhof from './maps/ankerhof.json';
import rostkapelle from './maps/rostkapelle.json';
import hausMorrow from './maps/haus_morrow.json';
import schleierhaus from './maps/schleierhaus.json';
import dFactions from './dialogues/factions.json';
import case05 from './case_05.json';
import case06 from './case_06.json';
import giesserei from './maps/giesserei.json';
import hausVey from './maps/haus_vey.json';
import resonanzkammer from './maps/resonanzkammer.json';
import atelier from './maps/atelier.json';
import ballsaal from './maps/ballsaal.json';
import spiegelkabinett from './maps/spiegelkabinett.json';
import dFall5 from './dialogues/fall5.json';
import dFall6 from './dialogues/fall6.json';
import case07 from './case_07.json';
import case08 from './case_08.json';
import case09 from './case_09.json';
import kontorThorne from './maps/kontor_thorne.json';
import waisenhaus from './maps/waisenhaus.json';
import traumkeller from './maps/traumkeller.json';
import dFall78 from './dialogues/fall78.json';
import dFall9 from './dialogues/fall9.json';
import buildings from './gebaeude.json';
import gatherings from './treffen.json';
import wexmoor from './wexmoor.json';

import kg_quests from './packs/kg_nebenquests/quests.json';
import kg_items from './packs/kg_nebenquests/items.json';
import kg_encounters from './packs/kg_nebenquests/encounters.json';
import kg_dialogues from './packs/kg_nebenquests/dialogues.json';
import kg_npcs from './packs/kg_nebenquests/npcs.json';
import kg_case from './packs/kg_nebenquests/case.json';
import kg_dialog_zusaetze from './packs/kg_nebenquests/dialog_zusaetze.json';
import kg_platzierung from './packs/kg_nebenquests/platzierung.json';
import wx_quests from './packs/wx_nebenquests/quests.json';
import wx_items from './packs/wx_nebenquests/items.json';
import wx_encounters from './packs/wx_nebenquests/encounters.json';
import wx_dialogues from './packs/wx_nebenquests/dialogues.json';
import wx_npcs from './packs/wx_nebenquests/npcs.json';
import wx_case from './packs/wx_nebenquests/case.json';
import wx_dialog_zusaetze from './packs/wx_nebenquests/dialog_zusaetze.json';
import wx_platzierung from './packs/wx_nebenquests/platzierung.json';
import wx_kahn_ausbau from './packs/wx_nebenquests/kahn_ausbau.json';
import lore_bestiarium from './packs/lore/bestiarium.json';
import lore_gerede from './packs/lore/gerede.json';
import lore_item_texte from './packs/lore/item_texte.json';
import lore_lesestuecke from './packs/lore/lesestuecke.json';
import lore_zeitungen from './packs/lore/zeitungen.json';
import k2a_quests from './packs/k2_akten/quests.json';
import k2a_items from './packs/k2_akten/items.json';
import k2a_encounters from './packs/k2_akten/encounters.json';
import k2a_dialogues from './packs/k2_akten/dialogues.json';
import k2a_npcs from './packs/k2_akten/npcs.json';
import k2a_case from './packs/k2_akten/case.json';
import k2a_dialog_zusaetze from './packs/k2_akten/dialog_zusaetze.json';
import k2a_platzierung from './packs/k2_akten/platzierung.json';
import k2a_faelle from './packs/k2_akten/faelle.json';
import k2a_zeitung from './packs/k2_akten/zeitung.json';
import k2o_quests from './packs/k2_orte/quests.json';
import k2o_items from './packs/k2_orte/items.json';
import k2o_encounters from './packs/k2_orte/encounters.json';
import k2o_dialogues from './packs/k2_orte/dialogues.json';
import k2o_npcs from './packs/k2_orte/npcs.json';
import k2o_case from './packs/k2_orte/case.json';
import k2o_dialog_zusaetze from './packs/k2_orte/dialog_zusaetze.json';
import k2o_platzierung from './packs/k2_orte/platzierung.json';
import k2o_artifacts from './packs/k2_orte/artifacts.json';
import k2o_maps from './packs/k2_orte/maps.json';
import k2o_travel from './packs/k2_orte/travel.json';
import k2o_zone from './packs/k2_orte/zone.json';
import k2o_pins from './packs/k2_orte/pins.json';
import k2v_quests from './packs/k2_akte/quests.json';
import k2v_items from './packs/k2_akte/items.json';
import k2v_encounters from './packs/k2_akte/encounters.json';
import k2v_dialogues from './packs/k2_akte/dialogues.json';
import k2v_npcs from './packs/k2_akte/npcs.json';
import k2v_case from './packs/k2_akte/case.json';
import k2v_dialog_zusaetze from './packs/k2_akte/dialog_zusaetze.json';
import k2v_platzierung from './packs/k2_akte/platzierung.json';
import k3o_quests from './packs/k3_orte/quests.json';
import k3o_items from './packs/k3_orte/items.json';
import k3o_encounters from './packs/k3_orte/encounters.json';
import k3o_dialogues from './packs/k3_orte/dialogues.json';
import k3o_npcs from './packs/k3_orte/npcs.json';
import k3o_case from './packs/k3_orte/case.json';
import k3o_dialog_zusaetze from './packs/k3_orte/dialog_zusaetze.json';
import k3o_platzierung from './packs/k3_orte/platzierung.json';
import k3o_maps from './packs/k3_orte/maps.json';
import k3o_travel from './packs/k3_orte/travel.json';
import k3o_zones from './packs/k3_orte/zones.json';
import k3o_bosses from './packs/k3_orte/bosses.json';
import k3o_phasen from './packs/k3_orte/phasen.json';
import k3o_artifacts from './packs/k3_orte/artifacts.json';
import k3o_city from './packs/k3_orte/city.json';
import k3o_beute from './packs/k3_orte/beute_vorschlag.json';
import k3a_quests from './packs/k3_akte/quests.json';
import k3a_items from './packs/k3_akte/items.json';
import k3a_encounters from './packs/k3_akte/encounters.json';
import k3a_dialogues from './packs/k3_akte/dialogues.json';
import k3a_npcs from './packs/k3_akte/npcs.json';
import k3a_case from './packs/k3_akte/case.json';
import k3a_dialog_zusaetze from './packs/k3_akte/dialog_zusaetze.json';
import k3a_platzierung from './packs/k3_akte/platzierung.json';
import k3a_zeitung from './packs/k3_akte/zeitung.json';
import bv_zeitung from './packs/feste/zeitung.json';
import k3a_epiloge from './packs/k3_akte/epiloge.json';
import k2v_epiloge from './packs/k2_akte/epiloge.json';
import k1_epiloge from './packs/k1_finale/epiloge.json';
import k1_police from './packs/k1_finale/police.json';
import k2v_akt5 from './packs/k2_akte/akt5_neu.json';
import k2v_turm_sperren from './packs/k2_akte/turm_sperren.json';
import k3h_quests from './packs/k3_handel/quests.json';
import k3h_items from './packs/k3_handel/items.json';
import k3h_encounters from './packs/k3_handel/encounters.json';
import k3h_dialogues from './packs/k3_handel/dialogues.json';
import k3h_npcs from './packs/k3_handel/npcs.json';
import k3h_case from './packs/k3_handel/case.json';
import k3h_dialog_zusaetze from './packs/k3_handel/dialog_zusaetze.json';
import k3h_platzierung from './packs/k3_handel/platzierung.json';
import k3h_haendler from './packs/k3_handel/haendler.json';
import k3h_treffen_schichtbund from './packs/k3_handel/treffen_schichtbund.json';
import k3h_einzelgaenger from './packs/k3_handel/einzelgaenger.json';
import k3h_artifacts from './packs/k3_handel/artifacts.json';
// Paket BD: Leben in Dunscar (Einwohner mit Tagesplan, Kopfgeld, Aufseher, Gerede, Zeitung, Wetter und Tiere)
import k3e_quests from './packs/k3_leben/quests.json';
import k3e_items from './packs/k3_leben/items.json';
import k3e_encounters from './packs/k3_leben/encounters.json';
import k3e_dialogues from './packs/k3_leben/dialogues.json';
import k3e_npcs from './packs/k3_leben/npcs.json';
import k3e_case from './packs/k3_leben/case.json';
import k3e_dialog_zusaetze from './packs/k3_leben/dialog_zusaetze.json';
import k3e_platzierung from './packs/k3_leben/platzierung.json';
import k3e_einwohner from './packs/k3_leben/einwohner.json';
import k3e_stadtgegner from './packs/k3_leben/stadtgegner_dunscar.json';
import k3e_phasen from './packs/k3_leben/phasen.json';
import k3e_streifen from './packs/k3_leben/streifen.json';
import k3e_gerede from './packs/k3_leben/gerede.json';
import k3e_zeitung from './packs/k3_leben/zeitung.json';
import k3e_leben from './packs/k3_leben/leben.json';
import k3p_quests from './packs/k3_pruefungen/quests.json';
import k3p_items from './packs/k3_pruefungen/items.json';
import k3p_encounters from './packs/k3_pruefungen/encounters.json';
import k3p_dialogues from './packs/k3_pruefungen/dialogues.json';
import k3p_npcs from './packs/k3_pruefungen/npcs.json';
import k3p_case from './packs/k3_pruefungen/case.json';
import k3p_dialog_zusaetze from './packs/k3_pruefungen/dialog_zusaetze.json';
import k3p_platzierung from './packs/k3_pruefungen/platzierung.json';
import k3a_boss_texte from './packs/k3_akte/boss_texte.json';
import k3n_quests from './packs/k3_nebenquests/quests.json';
import k3n_items from './packs/k3_nebenquests/items.json';
import k3n_encounters from './packs/k3_nebenquests/encounters.json';
import k3n_dialogues from './packs/k3_nebenquests/dialogues.json';
import k3n_npcs from './packs/k3_nebenquests/npcs.json';
import k3n_case from './packs/k3_nebenquests/case.json';
import k3n_dialog_zusaetze from './packs/k3_nebenquests/dialog_zusaetze.json';
import k3n_platzierung from './packs/k3_nebenquests/platzierung.json';
import k3n_zeitung from './packs/k3_nebenquests/zeitung.json';
import k3n_gerede from './packs/k3_nebenquests/gerede.json';
import k3n_bestiarium from './packs/k3_nebenquests/bestiarium.json';
import k3n_lesestuecke from './packs/k3_nebenquests/lesestuecke.json';
import k2g_quests from './packs/k2_gilde/quests.json';
import k2g_items from './packs/k2_gilde/items.json';
import k2g_encounters from './packs/k2_gilde/encounters.json';
import k2g_dialogues from './packs/k2_gilde/dialogues.json';
import k2g_npcs from './packs/k2_gilde/npcs.json';
import k2g_case from './packs/k2_gilde/case.json';
import k2g_dialog_zusaetze from './packs/k2_gilde/dialog_zusaetze.json';
import k2g_platzierung from './packs/k2_gilde/platzierung.json';
import k2g_artefakte from './packs/k2_gilde/artefakte.json';
import k2g_treffen_namensgilde from './packs/k2_gilde/treffen_namensgilde.json';
import koop_quests from './packs/koop/quests.json';
import koop_items from './packs/koop/items.json';
import koop_encounters from './packs/koop/encounters.json';
import koop_dialogues from './packs/koop/dialogues.json';
import koop_npcs from './packs/koop/npcs.json';
import beziehungen from './beziehungen.json';
import koop_case from './packs/koop/case.json';
import koop_dialog_zusaetze from './packs/koop/dialog_zusaetze.json';
import koop_platzierung from './packs/koop/platzierung.json';
import koop_geplauder from './packs/koop/geplauder.json';
import koop_kampf from './packs/koop/kampf.json';
import sq_neue_pfade from './packs/sequenzen/neue_pfade.json';
import sq_seq_4_bis_1 from './packs/sequenzen/seq_4_bis_1.json';
import sq_zutaten from './packs/sequenzen/zutaten.json';
import sq_artefakte from './packs/sequenzen/artefakte.json';
import sq_faehigkeiten from './packs/sequenzen/faehigkeiten2.json';
import k3p_rituale from './packs/k3_pruefungen/rituale.json';
import bf_quests from './packs/koop_k3/quests.json';
import bf_items from './packs/koop_k3/items.json';
import bf_encounters from './packs/koop_k3/encounters.json';
import bf_dialogues from './packs/koop_k3/dialogues.json';
import bf_npcs from './packs/koop_k3/npcs.json';
import bf_case from './packs/koop_k3/case.json';
import bf_dialog_zusaetze from './packs/koop_k3/dialog_zusaetze.json';
import bf_platzierung from './packs/koop_k3/platzierung.json';
import bf_geplauder from './packs/koop_k3/geplauder.json';
import bf_kampf from './packs/koop_k3/kampf.json';
import bf_bindung from './packs/koop_k3/bindung.json';
import bg_ansprueche from './packs/koop_beute/ansprueche.json';
import bg_ersatz from './packs/koop_beute/ersatz.json';
import bg_texte from './packs/koop_beute/texte.json';
import bg_dialog_zusaetze from './packs/koop_beute/dialog_zusaetze.json';
import bn_stationen from './packs/k3_ruf/stationen.json';
import bn_klang from './packs/k3_ruf/klang_zuordnung.json';
import bn_bindungen from './packs/k3_ruf/bindungen.json';
import bn_texte from './packs/k3_ruf/texte.json';
import { buildK3Ruf } from './k3Ruf.js';
import { runde8Packs } from './runde8.js';
import bz_dialog_zusaetze from './packs/beziehungen/dialog_zusaetze.json';
import bo_rezepte from './packs/fasserin/rezepte.json';
import bo_gerede from './packs/fasserin/gerede.json';
import bo_zeitung from './packs/fasserin/zeitung.json';
import bo_texte from './packs/fasserin/texte.json';

/** Nebenauftrags-Pakete (Codex AA, AB). */
const wxNebenquests = { name: 'wx_nebenquests', quests: wx_quests, items: wx_items, encounters: wx_encounters, dialogues: wx_dialogues, npcs: wx_npcs, case: wx_case, dialog_zusaetze: wx_dialog_zusaetze, platzierung: wx_platzierung, kahn_ausbau: wx_kahn_ausbau };
/** Paket AI: Koop-Aufträge, Geplauder und Kampfsprüche zu zweit. */
const koop = { name: 'koop', quests: koop_quests, items: koop_items, encounters: koop_encounters, dialogues: koop_dialogues, npcs: koop_npcs, case: koop_case, dialog_zusaetze: koop_dialog_zusaetze, platzierung: koop_platzierung, geplauder: koop_geplauder, kampf: koop_kampf };
/** Paket BF: Koop in Dunscar. Geplauder, Kampfsprüche und Bindungstexte (BN) kommen zu AI dazu; der Horch-Auftrag läuft
 *  über die Rollenplätze von AI. Die Schallschleuse wartet auf die Rufbindung aus BN und bleibt bis dahin ohne Objekte. */
const koopK3 = { name: 'koop_k3', quests: bf_quests, items: bf_items, encounters: bf_encounters, dialogues: bf_dialogues, npcs: bf_npcs, case: bf_case, dialog_zusaetze: bf_dialog_zusaetze,
  platzierung: bf_platzierung.filter((p) => !p.interactable.id.startsWith('koop_ds_schleuse')), geplauder: bf_geplauder, kampf: bf_kampf, bindung: bf_bindung };
/** Paket BG: persönliche Koop-Beute. Ansprüche je Spieler auf Hüter- und Prüfungszutaten, Ersatzproben bei Hedda, Pfiff und Kittering. */
const koopBeute = { name: 'koop_beute', dialog_zusaetze: bg_dialog_zusaetze, ansprueche: bg_ansprueche, ersatz: bg_ersatz, texte: bg_texte };
/** Paket BN: Rufwege, Hörreichweite und persönliche Bindungen (src/data/k3Ruf.js). */
const k3Ruf = buildK3Ruf({ stationen: bn_stationen, klang_zuordnung: bn_klang, bindungen: bn_bindungen, texte: bn_texte });
/** Paket AZ: Beziehungszweige (freundlich: Tipp oder Geschenk, feindselig: Wiedergutmachung) für 20 Figuren; die Profile stehen in beziehungen.json. */
const beziehungenPack = { name: 'beziehungen', dialog_zusaetze: bz_dialog_zusaetze };
/** Paket BO: die Fasserin Oda Kessel. Zehn Vorrats-Rezepte (fass_*) mit Artefakten, Begrüßungen je Zirkel, Gerede an den Treffpunkten, zwei Zeitungsnotizen. */
import sk_daten from './packs/sekten/daten.json';
import sk_figuren from './packs/sekten/figuren.json';
import sk_gegner from './packs/sekten/gegner.json';
import sk_auftraege from './packs/sekten/auftraege.json';
import sk_dialog_zusaetze from './packs/sekten/dialog_zusaetze.json';
import sk_platzierung from './packs/sekten/platzierung.json';
import sk_zeitung from './packs/sekten/zeitung.json';
import sk_gerede from './packs/sekten/gerede.json';
import sk_geplauder from './packs/sekten/geplauder.json';
/** BQ/BR: drei Sekten in drei Städten (Daten in packs/sekten, Laufzeit in core/Sekten.js). */
const sektenPack = { name: 'sekten', npcs: sk_figuren.npcs, dialogues: sk_figuren.dialogues, einwohner: sk_figuren.einwohner, items: sk_gegner.items, encounters: sk_gegner.encounters, loot: sk_gegner.loot,
  quests: sk_auftraege.quests, artifacts: sk_auftraege.artifacts, dialog_zusaetze: sk_dialog_zusaetze, platzierung: sk_platzierung, zeitung: sk_zeitung, gerede: sk_gerede, geplauder: sk_geplauder, sekten: sk_daten };
/** Paket BV: Jahreszeiten und Feste (Laufzeit in core/Clock.js und world/Feste.js), hier nur die Ankündigungen in der Zeitung. */
const festePack = { name: 'feste', zeitung: bv_zeitung };
// Codex-Runde 8 (BH/BJ/BL Vorrat, CC–CK Kapitel 4, 5 und Feste-Leben): Zusammenstellung in runde8.js
import r8_vorrat_gegner_quests from './packs/vorrat_gegner/quests.json';
import r8_vorrat_gegner_items from './packs/vorrat_gegner/items.json';
import r8_vorrat_gegner_encounters from './packs/vorrat_gegner/encounters.json';
import r8_vorrat_gegner_dialogues from './packs/vorrat_gegner/dialogues.json';
import r8_vorrat_gegner_npcs from './packs/vorrat_gegner/npcs.json';
import r8_vorrat_gegner_case from './packs/vorrat_gegner/case.json';
import r8_vorrat_gegner_dialog_zusaetze from './packs/vorrat_gegner/dialog_zusaetze.json';
import r8_vorrat_gegner_platzierung from './packs/vorrat_gegner/platzierung.json';
import r8_vorrat_gegner_bosses from './packs/vorrat_gegner/bosses.json';
import r8_vorrat_gegner_phasen from './packs/vorrat_gegner/phasen.json';
import r8_vorrat_gegner_bestiarium from './packs/vorrat_gegner/bestiarium.json';
import r8_vorrat_gegner_zonen_vorschlag from './packs/vorrat_gegner/zonen_vorschlag.json';
import r8_vorrat_figuren_quests from './packs/vorrat_figuren/quests.json';
import r8_vorrat_figuren_items from './packs/vorrat_figuren/items.json';
import r8_vorrat_figuren_encounters from './packs/vorrat_figuren/encounters.json';
import r8_vorrat_figuren_dialogues from './packs/vorrat_figuren/dialogues.json';
import r8_vorrat_figuren_npcs from './packs/vorrat_figuren/npcs.json';
import r8_vorrat_figuren_case from './packs/vorrat_figuren/case.json';
import r8_vorrat_figuren_dialog_zusaetze from './packs/vorrat_figuren/dialog_zusaetze.json';
import r8_vorrat_figuren_platzierung from './packs/vorrat_figuren/platzierung.json';
import r8_vorrat_items_quests from './packs/vorrat_items/quests.json';
import r8_vorrat_items_items from './packs/vorrat_items/items.json';
import r8_vorrat_items_encounters from './packs/vorrat_items/encounters.json';
import r8_vorrat_items_dialogues from './packs/vorrat_items/dialogues.json';
import r8_vorrat_items_npcs from './packs/vorrat_items/npcs.json';
import r8_vorrat_items_case from './packs/vorrat_items/case.json';
import r8_vorrat_items_dialog_zusaetze from './packs/vorrat_items/dialog_zusaetze.json';
import r8_vorrat_items_platzierung from './packs/vorrat_items/platzierung.json';
import r8_vorrat_items_fundstuecke from './packs/vorrat_items/fundstuecke.json';
import r8_vorrat_items_artifacts from './packs/vorrat_items/artifacts.json';
import r8_vorrat_items_handel from './packs/vorrat_items/handel.json';
import r8_k4_orte_quests from './packs/k4_orte/quests.json';
import r8_k4_orte_items from './packs/k4_orte/items.json';
import r8_k4_orte_encounters from './packs/k4_orte/encounters.json';
import r8_k4_orte_dialogues from './packs/k4_orte/dialogues.json';
import r8_k4_orte_npcs from './packs/k4_orte/npcs.json';
import r8_k4_orte_case from './packs/k4_orte/case.json';
import r8_k4_orte_dialog_zusaetze from './packs/k4_orte/dialog_zusaetze.json';
import r8_k4_orte_platzierung from './packs/k4_orte/platzierung.json';
import r8_k4_orte_maps from './packs/k4_orte/maps.json';
import r8_k4_orte_travel from './packs/k4_orte/travel.json';
import r8_k4_orte_zones from './packs/k4_orte/zones.json';
import r8_k4_orte_zonen_bindung from './packs/k4_orte/zonen_bindung.json';
import r8_k4_orte_bosses from './packs/k4_orte/bosses.json';
import r8_k4_orte_artifacts from './packs/k4_orte/artifacts.json';
import r8_k4_orte_city from './packs/k4_orte/city.json';
import r8_k4_orte_landstrasse from './packs/k4_orte/landstrasse.json';
import r8_k4_akte_quests from './packs/k4_akte/quests.json';
import r8_k4_akte_items from './packs/k4_akte/items.json';
import r8_k4_akte_encounters from './packs/k4_akte/encounters.json';
import r8_k4_akte_dialogues from './packs/k4_akte/dialogues.json';
import r8_k4_akte_npcs from './packs/k4_akte/npcs.json';
import r8_k4_akte_case from './packs/k4_akte/case.json';
import r8_k4_akte_dialog_zusaetze from './packs/k4_akte/dialog_zusaetze.json';
import r8_k4_akte_platzierung from './packs/k4_akte/platzierung.json';
import r8_k4_akte_faelle from './packs/k4_akte/faelle.json';
import r8_k4_akte_zeitung from './packs/k4_akte/zeitung.json';
import r8_k4_akte_boss_texte from './packs/k4_akte/boss_texte.json';
import r8_k4_akte_epiloge from './packs/k4_akte/epiloge.json';
import r8_k4_nebenquests_quests from './packs/k4_nebenquests/quests.json';
import r8_k4_nebenquests_items from './packs/k4_nebenquests/items.json';
import r8_k4_nebenquests_encounters from './packs/k4_nebenquests/encounters.json';
import r8_k4_nebenquests_dialogues from './packs/k4_nebenquests/dialogues.json';
import r8_k4_nebenquests_npcs from './packs/k4_nebenquests/npcs.json';
import r8_k4_nebenquests_case from './packs/k4_nebenquests/case.json';
import r8_k4_nebenquests_dialog_zusaetze from './packs/k4_nebenquests/dialog_zusaetze.json';
import r8_k4_nebenquests_platzierung from './packs/k4_nebenquests/platzierung.json';
import r8_k4_nebenquests_einwohner from './packs/k4_nebenquests/einwohner.json';
import r8_k4_nebenquests_leben from './packs/k4_nebenquests/leben.json';
import r8_k4_nebenquests_gerede from './packs/k4_nebenquests/gerede.json';
import r8_k4_nebenquests_zeitung from './packs/k4_nebenquests/zeitung.json';
import r8_k4_nebenquests_lesestuecke from './packs/k4_nebenquests/lesestuecke.json';
import r8_k4_nebenquests_geplauder from './packs/k4_nebenquests/geplauder.json';
import r8_k5_orte_quests from './packs/k5_orte/quests.json';
import r8_k5_orte_items from './packs/k5_orte/items.json';
import r8_k5_orte_encounters from './packs/k5_orte/encounters.json';
import r8_k5_orte_dialogues from './packs/k5_orte/dialogues.json';
import r8_k5_orte_npcs from './packs/k5_orte/npcs.json';
import r8_k5_orte_case from './packs/k5_orte/case.json';
import r8_k5_orte_dialog_zusaetze from './packs/k5_orte/dialog_zusaetze.json';
import r8_k5_orte_platzierung from './packs/k5_orte/platzierung.json';
import r8_k5_orte_maps from './packs/k5_orte/maps.json';
import r8_k5_orte_travel from './packs/k5_orte/travel.json';
import r8_k5_orte_zones from './packs/k5_orte/zones.json';
import r8_k5_orte_zonen_bindung from './packs/k5_orte/zonen_bindung.json';
import r8_k5_orte_bosses from './packs/k5_orte/bosses.json';
import r8_k5_orte_artifacts from './packs/k5_orte/artifacts.json';
import r8_k5_orte_city from './packs/k5_orte/city.json';
import r8_k5_akte_quests from './packs/k5_akte/quests.json';
import r8_k5_akte_items from './packs/k5_akte/items.json';
import r8_k5_akte_encounters from './packs/k5_akte/encounters.json';
import r8_k5_akte_dialogues from './packs/k5_akte/dialogues.json';
import r8_k5_akte_npcs from './packs/k5_akte/npcs.json';
import r8_k5_akte_case from './packs/k5_akte/case.json';
import r8_k5_akte_dialog_zusaetze from './packs/k5_akte/dialog_zusaetze.json';
import r8_k5_akte_platzierung from './packs/k5_akte/platzierung.json';
import r8_k5_akte_zeitung from './packs/k5_akte/zeitung.json';
import r8_k5_akte_boss_texte from './packs/k5_akte/boss_texte.json';
import r8_k5_akte_epiloge from './packs/k5_akte/epiloge.json';
import r8_k5_nebenquests_quests from './packs/k5_nebenquests/quests.json';
import r8_k5_nebenquests_items from './packs/k5_nebenquests/items.json';
import r8_k5_nebenquests_encounters from './packs/k5_nebenquests/encounters.json';
import r8_k5_nebenquests_dialogues from './packs/k5_nebenquests/dialogues.json';
import r8_k5_nebenquests_npcs from './packs/k5_nebenquests/npcs.json';
import r8_k5_nebenquests_case from './packs/k5_nebenquests/case.json';
import r8_k5_nebenquests_dialog_zusaetze from './packs/k5_nebenquests/dialog_zusaetze.json';
import r8_k5_nebenquests_platzierung from './packs/k5_nebenquests/platzierung.json';
import r8_k5_nebenquests_einwohner from './packs/k5_nebenquests/einwohner.json';
import r8_k5_nebenquests_leben from './packs/k5_nebenquests/leben.json';
import r8_k5_nebenquests_gerede from './packs/k5_nebenquests/gerede.json';
import r8_k5_nebenquests_zeitung from './packs/k5_nebenquests/zeitung.json';
import r8_k5_nebenquests_lesestuecke from './packs/k5_nebenquests/lesestuecke.json';
import r8_k5_nebenquests_geplauder from './packs/k5_nebenquests/geplauder.json';
import r8_feste_leben_quests from './packs/feste_leben/quests.json';
import r8_feste_leben_items from './packs/feste_leben/items.json';
import r8_feste_leben_encounters from './packs/feste_leben/encounters.json';
import r8_feste_leben_dialogues from './packs/feste_leben/dialogues.json';
import r8_feste_leben_npcs from './packs/feste_leben/npcs.json';
import r8_feste_leben_case from './packs/feste_leben/case.json';
import r8_feste_leben_dialog_zusaetze from './packs/feste_leben/dialog_zusaetze.json';
import r8_feste_leben_platzierung from './packs/feste_leben/platzierung.json';
import r8_feste_leben_feste from './packs/feste_leben/feste.json';
import r8_feste_leben_artefakte from './packs/feste_leben/artefakte.json';
import r8_feste_leben_zeitung from './packs/feste_leben/zeitung.json';
import r8_feste_leben_geplauder from './packs/feste_leben/geplauder.json';
import r8_feste_leben_texte from './packs/feste_leben/texte.json';
import r8_feste_leben_kalender from './packs/feste_leben/kalender.json';
import r8_feste_leben_kalender_uebergaenge from './packs/feste_leben/kalender_uebergaenge.json';
import r8_feste_leben_wirkungen from './packs/feste_leben/wirkungen.json';
import r8_feste_leben_wirkungen_platzierung from './packs/feste_leben/wirkungen_platzierung.json';
import r8_kg_leben_quests from './packs/kg_leben/quests.json';
import r8_kg_leben_items from './packs/kg_leben/items.json';
import r8_kg_leben_encounters from './packs/kg_leben/encounters.json';
import r8_kg_leben_dialogues from './packs/kg_leben/dialogues.json';
import r8_kg_leben_npcs from './packs/kg_leben/npcs.json';
import r8_kg_leben_case from './packs/kg_leben/case.json';
import r8_kg_leben_dialog_zusaetze from './packs/kg_leben/dialog_zusaetze.json';
import r8_kg_leben_platzierung from './packs/kg_leben/platzierung.json';
import r8_kg_leben_einwohner from './packs/kg_leben/einwohner.json';
import r8_kg_leben_leben from './packs/kg_leben/leben.json';
import r8_kg_leben_gerede from './packs/kg_leben/gerede.json';
import r8_kg_leben_zeitung from './packs/kg_leben/zeitung.json';
import r8_kg_leben_geplauder from './packs/kg_leben/geplauder.json';
import r8_kg_leben_streifen from './packs/kg_leben/streifen.json';
const runde8 = runde8Packs({
  vorrat_gegner: { quests: r8_vorrat_gegner_quests, items: r8_vorrat_gegner_items, encounters: r8_vorrat_gegner_encounters, dialogues: r8_vorrat_gegner_dialogues, npcs: r8_vorrat_gegner_npcs, case: r8_vorrat_gegner_case, dialog_zusaetze: r8_vorrat_gegner_dialog_zusaetze, platzierung: r8_vorrat_gegner_platzierung, bosses: r8_vorrat_gegner_bosses, phasen: r8_vorrat_gegner_phasen, bestiarium: r8_vorrat_gegner_bestiarium, zonen_vorschlag: r8_vorrat_gegner_zonen_vorschlag },
  vorrat_figuren: { quests: r8_vorrat_figuren_quests, items: r8_vorrat_figuren_items, encounters: r8_vorrat_figuren_encounters, dialogues: r8_vorrat_figuren_dialogues, npcs: r8_vorrat_figuren_npcs, case: r8_vorrat_figuren_case, dialog_zusaetze: r8_vorrat_figuren_dialog_zusaetze, platzierung: r8_vorrat_figuren_platzierung },
  vorrat_items: { quests: r8_vorrat_items_quests, items: r8_vorrat_items_items, encounters: r8_vorrat_items_encounters, dialogues: r8_vorrat_items_dialogues, npcs: r8_vorrat_items_npcs, case: r8_vorrat_items_case, dialog_zusaetze: r8_vorrat_items_dialog_zusaetze, platzierung: r8_vorrat_items_platzierung, fundstuecke: r8_vorrat_items_fundstuecke, artifacts: r8_vorrat_items_artifacts, handel: r8_vorrat_items_handel },
  k4_orte: { quests: r8_k4_orte_quests, items: r8_k4_orte_items, encounters: r8_k4_orte_encounters, dialogues: r8_k4_orte_dialogues, npcs: r8_k4_orte_npcs, case: r8_k4_orte_case, dialog_zusaetze: r8_k4_orte_dialog_zusaetze, platzierung: r8_k4_orte_platzierung, maps: r8_k4_orte_maps, travel: r8_k4_orte_travel, zones: r8_k4_orte_zones, zonen_bindung: r8_k4_orte_zonen_bindung, bosses: r8_k4_orte_bosses, artifacts: r8_k4_orte_artifacts, city: r8_k4_orte_city, landstrasse: r8_k4_orte_landstrasse },
  k4_akte: { quests: r8_k4_akte_quests, items: r8_k4_akte_items, encounters: r8_k4_akte_encounters, dialogues: r8_k4_akte_dialogues, npcs: r8_k4_akte_npcs, case: r8_k4_akte_case, dialog_zusaetze: r8_k4_akte_dialog_zusaetze, platzierung: r8_k4_akte_platzierung, faelle: r8_k4_akte_faelle, zeitung: r8_k4_akte_zeitung, boss_texte: r8_k4_akte_boss_texte, epiloge: r8_k4_akte_epiloge },
  k4_nebenquests: { quests: r8_k4_nebenquests_quests, items: r8_k4_nebenquests_items, encounters: r8_k4_nebenquests_encounters, dialogues: r8_k4_nebenquests_dialogues, npcs: r8_k4_nebenquests_npcs, case: r8_k4_nebenquests_case, dialog_zusaetze: r8_k4_nebenquests_dialog_zusaetze, platzierung: r8_k4_nebenquests_platzierung, einwohner: r8_k4_nebenquests_einwohner, leben: r8_k4_nebenquests_leben, gerede: r8_k4_nebenquests_gerede, zeitung: r8_k4_nebenquests_zeitung, lesestuecke: r8_k4_nebenquests_lesestuecke, geplauder: r8_k4_nebenquests_geplauder },
  k5_orte: { quests: r8_k5_orte_quests, items: r8_k5_orte_items, encounters: r8_k5_orte_encounters, dialogues: r8_k5_orte_dialogues, npcs: r8_k5_orte_npcs, case: r8_k5_orte_case, dialog_zusaetze: r8_k5_orte_dialog_zusaetze, platzierung: r8_k5_orte_platzierung, maps: r8_k5_orte_maps, travel: r8_k5_orte_travel, zones: r8_k5_orte_zones, zonen_bindung: r8_k5_orte_zonen_bindung, bosses: r8_k5_orte_bosses, artifacts: r8_k5_orte_artifacts, city: r8_k5_orte_city },
  k5_akte: { quests: r8_k5_akte_quests, items: r8_k5_akte_items, encounters: r8_k5_akte_encounters, dialogues: r8_k5_akte_dialogues, npcs: r8_k5_akte_npcs, case: r8_k5_akte_case, dialog_zusaetze: r8_k5_akte_dialog_zusaetze, platzierung: r8_k5_akte_platzierung, zeitung: r8_k5_akte_zeitung, boss_texte: r8_k5_akte_boss_texte, epiloge: r8_k5_akte_epiloge },
  k5_nebenquests: { quests: r8_k5_nebenquests_quests, items: r8_k5_nebenquests_items, encounters: r8_k5_nebenquests_encounters, dialogues: r8_k5_nebenquests_dialogues, npcs: r8_k5_nebenquests_npcs, case: r8_k5_nebenquests_case, dialog_zusaetze: r8_k5_nebenquests_dialog_zusaetze, platzierung: r8_k5_nebenquests_platzierung, einwohner: r8_k5_nebenquests_einwohner, leben: r8_k5_nebenquests_leben, gerede: r8_k5_nebenquests_gerede, zeitung: r8_k5_nebenquests_zeitung, lesestuecke: r8_k5_nebenquests_lesestuecke, geplauder: r8_k5_nebenquests_geplauder },
  feste_leben: { quests: r8_feste_leben_quests, items: r8_feste_leben_items, encounters: r8_feste_leben_encounters, dialogues: r8_feste_leben_dialogues, npcs: r8_feste_leben_npcs, case: r8_feste_leben_case, dialog_zusaetze: r8_feste_leben_dialog_zusaetze, platzierung: r8_feste_leben_platzierung, feste: r8_feste_leben_feste, artefakte: r8_feste_leben_artefakte, zeitung: r8_feste_leben_zeitung, geplauder: r8_feste_leben_geplauder, texte: r8_feste_leben_texte, kalender: r8_feste_leben_kalender, kalender_uebergaenge: r8_feste_leben_kalender_uebergaenge, wirkungen: r8_feste_leben_wirkungen, wirkungen_platzierung: r8_feste_leben_wirkungen_platzierung },
  kg_leben: { quests: r8_kg_leben_quests, items: r8_kg_leben_items, encounters: r8_kg_leben_encounters, dialogues: r8_kg_leben_dialogues, npcs: r8_kg_leben_npcs, case: r8_kg_leben_case, dialog_zusaetze: r8_kg_leben_dialog_zusaetze, platzierung: r8_kg_leben_platzierung, einwohner: r8_kg_leben_einwohner, leben: r8_kg_leben_leben, gerede: r8_kg_leben_gerede, zeitung: r8_kg_leben_zeitung, geplauder: r8_kg_leben_geplauder, streifen: r8_kg_leben_streifen },
});
import { fasserinAuftragPack, halbgottPack } from './runde9.js';
import fa_oda from './packs/fasserin_auftrag/oda.json';
import fa_gastgeber from './packs/fasserin_auftrag/gastgeber.json';
import fa_texte from './packs/fasserin_auftrag/texte.json';
import fa_artefakte from './packs/fasserin_auftrag/artefakte.json';
import fa_gerede from './packs/fasserin_auftrag/gerede.json';
import fa_zeitung from './packs/fasserin_auftrag/zeitung.json';
import fa_lesestuecke from './packs/fasserin_auftrag/lesestuecke.json';
import hg_trinktexte from './packs/halbgott/trinktexte.json';
import hg_kreaturform from './packs/halbgott/kreaturform.json';
import hg_furcht from './packs/halbgott/furcht.json';
import hg_rituale from './packs/halbgott/rituale.json';
import hg_encounters from './packs/halbgott/encounters.json';
import hg_bestiarium from './packs/halbgott/bestiarium.json';
import hg_zeitung from './packs/halbgott/zeitung.json';
import hg_gerede from './packs/halbgott/gerede.json';
import hg_lesestuecke from './packs/halbgott/lesestuecke.json';
import hg_koop from './packs/halbgott/koop.json';
/** Codex-Runde 9: CR Fasserin-Aufträge (20 fa_*-Artefakte) und CP Halbgott/Engel-Texte. */
const fasserinAuftrag = fasserinAuftragPack({ oda: fa_oda, gastgeber: fa_gastgeber, texte: fa_texte, artefakte: fa_artefakte, gerede: fa_gerede, zeitung: fa_zeitung, lesestuecke: fa_lesestuecke });
const halbgott = halbgottPack({ trinktexte: hg_trinktexte, kreaturform: hg_kreaturform, furcht: hg_furcht, rituale: hg_rituale, encounters: hg_encounters, bestiarium: hg_bestiarium, zeitung: hg_zeitung, gerede: hg_gerede, lesestuecke: hg_lesestuecke, koop: hg_koop });
const fasserinPack = { name: 'fasserin', rezepte: bo_rezepte.recipes, artifacts: bo_rezepte.artifacts, fasserin_texte: bo_texte, gerede: bo_gerede, zeitung: bo_zeitung };
/** Paket AL: vier Wexmoorer Akten. */
const k2Akten = { name: 'k2_akten', quests: k2a_quests, items: k2a_items, encounters: k2a_encounters, dialogues: k2a_dialogues, npcs: k2a_npcs, case: k2a_case, dialog_zusaetze: k2a_dialog_zusaetze, platzierung: k2a_platzierung, faelle: k2a_faelle, zeitung: k2a_zeitung };
const k2Orte = { name: 'k2_orte', quests: k2o_quests, items: k2o_items, encounters: k2o_encounters, dialogues: k2o_dialogues, npcs: k2o_npcs, case: k2o_case, dialog_zusaetze: k2o_dialog_zusaetze, platzierung: k2o_platzierung, artifacts: k2o_artifacts, maps: k2o_maps, travel: k2o_travel, zone: k2o_zone, pins: k2o_pins };
// AP Akt V: Überfahrt, Keller, Winde und Abschied ersetzen die alte Akt-V-Quest; Sperren im Turm erzwingen die Reihenfolge
const k2Akte = { name: 'k2_akte', quests: { ...k2v_quests, ...k2v_akt5.quests }, items: k2v_items, encounters: k2v_encounters, dialogues: { ...k2v_dialogues, ...k2v_akt5.dialogues }, npcs: k2v_npcs, case: k2v_case, dialog_zusaetze: k2v_dialog_zusaetze, platzierung: [...k2v_platzierung, ...k2v_akt5.platzierung, ...k2v_turm_sperren], epiloge: k2v_epiloge };
const k3Orte = { name: 'k3_orte', quests: k3o_quests, items: k3o_items, encounters: k3o_encounters, dialogues: { ...k3o_dialogues, ...k3o_beute }, npcs: k3o_npcs, case: k3o_case, dialog_zusaetze: k3o_dialog_zusaetze, platzierung: k3o_platzierung, maps: k3o_maps, travel: k3o_travel, zones: k3o_zones, bosses: k3o_bosses, phasen: k3o_phasen, artifacts: k3o_artifacts, city: k3o_city };
const k3Nebenquests = { name: 'k3_nebenquests', quests: k3n_quests, items: k3n_items, encounters: k3n_encounters, dialogues: k3n_dialogues, npcs: k3n_npcs, case: k3n_case, dialog_zusaetze: k3n_dialog_zusaetze, platzierung: k3n_platzierung, zeitung: k3n_zeitung, gerede: k3n_gerede, bestiarium: k3n_bestiarium, lesestuecke: k3n_lesestuecke };
const k3Pruefungen = { name: 'k3_pruefungen', quests: k3p_quests, items: k3p_items, encounters: k3p_encounters, dialogues: k3p_dialogues, npcs: k3p_npcs, case: k3p_case, dialog_zusaetze: k3p_dialog_zusaetze, platzierung: k3p_platzierung };
// BC: Handel in Dunscar (Händler, Schichtbund als Treffen unter dem Runddepot, Einzelgänger, Freundschaftsgaben als Artefakte)
const k3Handel = { name: 'k3_handel', quests: k3h_quests, items: k3h_items, encounters: k3h_encounters, dialogues: k3h_dialogues, npcs: k3h_npcs, case: k3h_case, dialog_zusaetze: k3h_dialog_zusaetze, platzierung: k3h_platzierung, haendler: k3h_haendler, treffen: k3h_treffen_schichtbund, einzelgaenger: k3h_einzelgaenger, artifacts: k3h_artifacts };
// BD: Die Tagespositionen aus platzierung.json sind nur Vorschläge; die Figuren stehen über einwohner.json (Tag/Nacht) auf den Karten.
const k3Leben = { name: 'k3_leben', quests: k3e_quests, items: k3e_items, encounters: k3e_encounters, dialogues: k3e_dialogues, npcs: k3e_npcs, case: k3e_case, dialog_zusaetze: k3e_dialog_zusaetze,
  platzierung: k3e_platzierung.filter((p) => !p.npc), einwohner: k3e_einwohner, stadtgegner: k3e_stadtgegner, phasen: k3e_phasen, streifen: k3e_streifen, gerede: k3e_gerede, zeitung: k3e_zeitung, leben: k3e_leben };
const k3Akte = { name: 'k3_akte', quests: k3a_quests, items: k3a_items, encounters: k3a_encounters, dialogues: k3a_dialogues, npcs: k3a_npcs, case: k3a_case, dialog_zusaetze: k3a_dialog_zusaetze, platzierung: k3a_platzierung, zeitung: k3a_zeitung, boss_texte: k3a_boss_texte, epiloge: k3a_epiloge };
const k2Gilde = { name: 'k2_gilde', quests: k2g_quests, items: k2g_items, encounters: k2g_encounters, dialogues: k2g_dialogues, npcs: k2g_npcs, case: k2g_case, dialog_zusaetze: k2g_dialog_zusaetze, platzierung: k2g_platzierung, artefakte: k2g_artefakte, treffen: k2g_treffen_namensgilde };
/** Kapitel-1-Finale: Epilogtafeln nach Fall 9 und die Fahndung in Kettlegate (Price lässt nach dir suchen). */
const k1Finale = { name: 'k1_finale', epiloge: k1_epiloge, police: k1_police };
const kgNebenquests = { name: 'kg_nebenquests', quests: kg_quests, items: kg_items, encounters: kg_encounters, dialogues: kg_dialogues, npcs: kg_npcs, case: kg_case, dialog_zusaetze: kg_dialog_zusaetze, platzierung: kg_platzierung };

export const content = buildContent({
  campaign,
  quests,
  items,
  encounters,
  cases: [case01, case02, case03, caseAltmarkt, case04, case05, case06, case07, case08, case09],
  maps: [revier, ashgrove, ebba, crypt, docks, warehouse, altmarkt, tavern, nachtmarkt, nordtor, theater, uhrturm, gaskanaele, schlachthof, sternwarte, marsch, katakomben, pestgassen, kraterwald, ankerhof, rostkapelle, hausMorrow, schleierhaus, giesserei, hausVey, resonanzkammer, atelier, ballsaal, spiegelkabinett, kontorThorne, waisenhaus, traumkeller],
  dialogues: [dRevier, dAshgrove, dEbba, dHafen, dAltmarkt, dNachtmarkt, dNordtor, dFunde, dFactions, dFall5, dFall6, dFall78, dFall9, dKopfgeld],
  pathways,
  market,
  travel,
  wilds,
  factions,
  buildings,
  gatherings,
  city,
  wexmoor,
  packs: [k1Finale, kgNebenquests, wxNebenquests, koop, k2Akten, k2Orte, k2Gilde, k2Akte, k3Orte, k3Akte, k3Nebenquests, k3Pruefungen, k3Handel, k3Leben, koopK3, koopBeute, k3Ruf, beziehungenPack, fasserinPack, fasserinAuftrag, halbgott, festePack, sektenPack, ...runde8],
  lore: { bestiarium: lore_bestiarium, gerede: lore_gerede, item_texte: lore_item_texte, lesestuecke: lore_lesestuecke, zeitungen: lore_zeitungen },
  beziehungen,
  sequenzen: { neue_pfade: sq_neue_pfade, seq_4_bis_1: sq_seq_4_bis_1, zutaten: sq_zutaten, artefakte: sq_artefakte, rituale: k3p_rituale, faehigkeiten: sq_faehigkeiten },
});
