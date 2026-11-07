// Lädt alle Inhaltsdateien des Spiels.
import { buildContent } from './buildContent.js';
import campaign from './campaign.json';
import quests from './quests.json';
import case01 from './case_01.json';
import case02 from './case_02.json';
import revier from './maps/revier.json';
import ashgrove from './maps/ashgrove.json';
import ebba from './maps/ebba.json';
import crypt from './maps/crypt.json';
import dRevier from './dialogues/revier.json';
import dAshgrove from './dialogues/ashgrove.json';
import dEbba from './dialogues/ebba.json';

export const content = buildContent({
  campaign,
  quests,
  cases: [case01, case02],
  maps: [revier, ashgrove, ebba, crypt],
  dialogues: [dRevier, dAshgrove, dEbba],
});
