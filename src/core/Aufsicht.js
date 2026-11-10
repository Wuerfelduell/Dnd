// Kapitel 3 (BD): zivile Bahnaufseher in Dunscar. Nachts laufen zwei Aufseher (Endbahnhof, Signalhang) ihre Runde.
// Wer ohne Bahnkarte oder Aufsichtsmarke in ihren Sichtkegel gerät, verliert einmal 5 Nerven und wird in den Speisewagen
// geschickt: keine Fahndungsstufe, keine Geldstrafe, keine Beschlagnahme, keine Zelle, kein Kampf (world/Patrols.js).
export const AUFSICHT = {
  cone: { range: 60, angle: 70, catchSec: 1.1 },
  /** Besitz von einem der beiden Papiere befreit (ODER, bewusst keine `requires_items`-Liste mit beiden). */
  passes: ['k3a_bahnkarte', 'k3a_aufsichtsmarke'],
  nerves: -5,
  to: { map: 'ds_speisewagen', spawn: 'default' },
  figures: ['k3e_aufseher_a', 'k3e_aufseher_b'],
  text: 'Ohne Berechtigung geht es hier nachts nicht weiter. Kommen Sie. Im Speisewagen ist Licht.',
};
