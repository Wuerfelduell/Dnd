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
});
