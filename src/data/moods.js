// Paket AK: Stimmungen für Schlüsselstellen der Figuren mit den zusätzlichen Ausdrücken
// (portraits/AK_<id>_emotions2.png: wütend, traurig, nachdenklich, entschlossen).
// Schlüssel: "<Dialog>/<Knoten>". Knoten mit eigener `mood` behalten sie.

export const DIALOG_MOODS = {
  'marlowe/report_bad': 'sad', 'marlowe/epilogue3': 'sad', 'marlowe/epilogue3_bad': 'sad', 'marlowe/epilogue4': 'sad',
  'marlowe/epilogue7_bad': 'sad', 'marlowe/bell': 'sad', 'marlowe/end_holt': 'angry', 'marlowe/end_rust': 'angry',
  'marlowe/raid': 'determined', 'marlowe/showdown4': 'determined', 'marlowe/showdown5': 'determined', 'marlowe/showdown6': 'determined',
  'marlowe/showdown78': 'determined', 'marlowe/accuse9': 'determined', 'marlowe/showdown9': 'determined',
  'marlowe/end_seer': 'thoughtful', 'marlowe/brief_09': 'thoughtful', 'marlowe/advice': 'thoughtful',
  'marlowe_wexmoor/buch_ende': 'determined',
  'holt/holt_clear': 'angry', 'holt/grimes': 'determined', 'holt/tip': 'thoughtful',
  'pimm/content': 'thoughtful',
  'greta/watch_dead': 'sad', 'greta/theft': 'angry', 'greta/sober': 'angry',
  'ivy/start': 'determined', 'ivy/after_bad': 'sad',
  'rook_final/nate': 'sad',
  'price/start': 'angry', 'price_docks/start': 'determined', 'price_wexmoor/kampf': 'angry',
  'barnaby/why': 'angry',
  'oda_vey/lilian': 'sad',
  'kit/bluff': 'angry',
  'wick/elias': 'sad',
  'zunder/akt2': 'angry', 'zunder/akt4': 'sad', 'zunder/akt5': 'determined', 'zunder/mutter': 'sad', 'zunder_ankunft/los': 'determined',
  'druce/tor7': 'thoughtful',
  'hale/verbuendet': 'determined', 'hale/zwoelf': 'sad', 'hale/turm': 'determined',
  'brack/jacke': 'sad',
  'hesper/amt': 'angry',
  'sedge/rat': 'thoughtful',
  'wyle/starling': 'thoughtful',
  'brandt/wofuer': 'determined',
  'elsbeth/start': 'sad',
};

/** Setzt die Stimmungen auf die Knoten, die noch keine haben. */
export function applyMoods(content, moods = DIALOG_MOODS) {
  for (const [key, mood] of Object.entries(moods)) {
    const [d, n] = key.split('/');
    const node = content.dialogues[d]?.nodes?.[n];
    if (node && !node.mood) node.mood = mood;
  }
}
