// Paket BN: Rufwege, Hörreichweite und persönliche Bindungen für Dunscar (src/core/SignalRoutes.js).
// Die sechs Horchstellen hängen an den bestehenden AS-Arbeitsstellen; die Drehscheibe bekommt einen eigenen Trichter.

/** Horchstelle → Arbeitsstellen-Dialog aus AS, der die Rufaktion anbietet. */
export const STATION_DIALOGUES = {
  k3o_horch_hund: 'k3o_schwellenhund_station',
  k3o_horch_vorhauer: 'k3o_vorhauer_station',
  k3o_horch_verteiler: 'k3o_vielrufer_station',
  k3o_horch_bahnsteig: 'k3o_gallowmere_station',
  k3o_horch_tiefe: 'k3o_unterschicht_station',
};

export const STATION_NAMES = {
  k3o_horch_drehscheibe: 'Trichter an der Drehscheibe',
  k3o_horch_hund: 'Horchstelle Rangierwüste',
  k3o_horch_vorhauer: 'Horchstelle Klopfbruch',
  k3o_horch_verteiler: 'Horchstelle Rufschlucht',
  k3o_horch_bahnsteig: 'Horchstelle Letzter Bahnsteig',
  k3o_horch_tiefe: 'Horchstelle Unterschicht',
};

export const DIRECTION_NAMES = { north: 'Norden', east: 'Osten', south: 'Süden', west: 'Westen' };

/** Baut das Pack: Dialogzusätze mit `signal_station`, der Trichter der Drehscheibe als Objekt und die Rufdaten. */
export function buildK3Ruf({ stationen, klang_zuordnung, bindungen, texte }) {
  const dialog_zusaetze = {};
  for (const st of stationen) {
    const id = STATION_DIALOGUES[st.id];
    if (!id) continue;
    const acc = st.accepted[0];
    dialog_zusaetze[id] = {
      choices_add: [{ text: 'Das Signalgerät ansetzen und den Rufweg prüfen.', signal_station: st.id, requires_items: ['k3a_signalgeraet'],
        ...(acc?.requires_flags ? { requires_flags: acc.requires_flags } : {}), ...(acc?.flag ? { hide_if_flags: [acc.flag] } : {}) }],
      nodes_add: {},
    };
  }
  // Seb 2026-11-12: die Hör-Fährte am Trichter der Drehscheibe ist gestrichen, der Trichter steht nicht mehr in der Welt.
  const platzierung = [];
  return { name: 'k3_ruf', dialog_zusaetze, platzierung, signalRoutes: { stationen, klang_zuordnung, bindungen, texte } };
}
