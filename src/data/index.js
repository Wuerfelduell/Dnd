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
import nachtmarkt from './maps/nachtmarkt.json';
import dNachtmarkt from './dialogues/nachtmarkt.json';

export const content = buildContent({
  campaign,
  quests,
  items,
  encounters,
  cases: [case01, case02, case03, caseAltmarkt, case04],
  maps: [revier, ashgrove, ebba, crypt, docks, warehouse, altmarkt, tavern, nachtmarkt, nordtor, theater, uhrturm, gaskanaele, schlachthof, sternwarte],
  dialogues: [dRevier, dAshgrove, dEbba, dHafen, dAltmarkt, dNachtmarkt, dNordtor],
  pathways,
  market,
});
