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
import k3a_epiloge from './packs/k3_akte/epiloge.json';
import k2v_epiloge from './packs/k2_akte/epiloge.json';
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
import k3p_rituale from './packs/k3_pruefungen/rituale.json';

/** Nebenauftrags-Pakete (Codex AA, AB). */
const wxNebenquests = { name: 'wx_nebenquests', quests: wx_quests, items: wx_items, encounters: wx_encounters, dialogues: wx_dialogues, npcs: wx_npcs, case: wx_case, dialog_zusaetze: wx_dialog_zusaetze, platzierung: wx_platzierung, kahn_ausbau: wx_kahn_ausbau };
/** Paket AI: Koop-Aufträge, Geplauder und Kampfsprüche zu zweit. */
const koop = { name: 'koop', quests: koop_quests, items: koop_items, encounters: koop_encounters, dialogues: koop_dialogues, npcs: koop_npcs, case: koop_case, dialog_zusaetze: koop_dialog_zusaetze, platzierung: koop_platzierung, geplauder: koop_geplauder, kampf: koop_kampf };
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
const k3Akte = { name: 'k3_akte', quests: k3a_quests, items: k3a_items, encounters: k3a_encounters, dialogues: k3a_dialogues, npcs: k3a_npcs, case: k3a_case, dialog_zusaetze: k3a_dialog_zusaetze, platzierung: k3a_platzierung, zeitung: k3a_zeitung, boss_texte: k3a_boss_texte, epiloge: k3a_epiloge };
const k2Gilde = { name: 'k2_gilde', quests: k2g_quests, items: k2g_items, encounters: k2g_encounters, dialogues: k2g_dialogues, npcs: k2g_npcs, case: k2g_case, dialog_zusaetze: k2g_dialog_zusaetze, platzierung: k2g_platzierung, artefakte: k2g_artefakte, treffen: k2g_treffen_namensgilde };
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
  packs: [kgNebenquests, wxNebenquests, koop, k2Akten, k2Orte, k2Gilde, k2Akte, k3Orte, k3Akte, k3Nebenquests, k3Pruefungen, k3Handel],
  lore: { bestiarium: lore_bestiarium, gerede: lore_gerede, item_texte: lore_item_texte, lesestuecke: lore_lesestuecke, zeitungen: lore_zeitungen },
  beziehungen,
  sequenzen: { neue_pfade: sq_neue_pfade, seq_4_bis_1: sq_seq_4_bis_1, zutaten: sq_zutaten, artefakte: sq_artefakte, rituale: k3p_rituale },
});
