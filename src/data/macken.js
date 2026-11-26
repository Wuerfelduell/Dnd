/**
 * Bleibende Macken (Seb 2026-11-26): Wer knapp an einem Kontrollverlust vorbeischrammt, behält manchmal etwas zurück.
 * Je Pfad zwei Eigenheiten mit kleinem Nachteil (Werte wie bei passiven Fähigkeiten, `key`/`value`, siehe Pathways.passive).
 * Sie gehören dem Spieler, der sie bekommen hat (Spieler 1 und 2 getrennt), und bleiben für immer.
 * Hat nichts mit dem Beyonder-Rest zu tun.
 */

/** Ab dieser Unruhe gilt man als „knapp dran“. */
export const MACKE_NAH = 90;
/** Fällt die Unruhe danach ohne Kontrollverlust unter diesen Wert, ist man vorbeigeschrammt. */
export const MACKE_ENTWARNUNG = 50;
/** Ein Trank, der mit mindestens diesem Risiko trotzdem gelingt, zählt auch als knapp vorbei. */
export const MACKE_TRANK_RISIKO = 0.4;
/** Chance, beim knappen Vorbeischrammen eine Macke zu behalten. */
export const MACKE_CHANCE = 0.3;
/** Höchstens so viele Macken je Spieler (auch nach einem Pfadwechsel). */
export const MACKE_MAX = 3;

export const MACKEN = {
  laterne: [
    { id: 'laterne_flackerblick', name: 'Flackernder Blick', text: 'Manchmal brennt ein Licht in deinem Augenwinkel, das niemand sonst sieht.', effects: [{ key: 'vision_cost', value: 1.1, text: 'Geistsicht kostet 10 % mehr Nerven.' }] },
    { id: 'laterne_falscher_schatten', name: 'Falscher Schatten', text: 'Dein Schatten fällt zur Lampe hin, nicht von ihr weg.', effects: [{ key: 'calm_decay', value: 0.9, text: 'Unruhe klingt 10 % langsamer ab.' }] },
  ],
  faden: [
    { id: 'faden_zuckende_finger', name: 'Zuckende Finger', text: 'Deine Finger knoten unsichtbare Fäden, auch im Schlaf.', effects: [{ key: 'skill_composure', value: 1.08, text: 'Fertigkeiten kosten 8 % mehr Nerven.' }] },
    { id: 'faden_augenwinkel', name: 'Fäden im Augenwinkel', text: 'Zwischen allen Menschen siehst du dünne Linien. Manche ziehen an dir.', effects: [{ key: 'hit_nerves', value: 1, text: 'Jeder Treffer, den du einsteckst, kostet 1 Nerv.' }] },
  ],
  maske: [
    { id: 'maske_fremdes_spiegelbild', name: 'Fremdes Spiegelbild', text: 'Im Spiegel lächelt manchmal jemand, der nicht du bist. Händler merken, dass etwas nicht stimmt.', effects: [{ key: 'price', value: 1.05, text: 'Händler verlangen 5 % mehr.' }] },
    { id: 'maske_vergessenes_gesicht', name: 'Vergessenes Gesicht', text: 'Morgens brauchst du einen Moment, um zu wissen, welches Gesicht deins ist.', effects: [{ key: 'composure_regen', value: 0.92, text: 'Nerven erholen sich 8 % langsamer.' }] },
  ],
  echo: [
    { id: 'echo_luegende_stimmen', name: 'Lügende Stimmen', text: 'Die Stimmen sind leiser geworden, aber sie lügen jetzt. Sie sagen dir, dass alles gut ist.', effects: [{ key: 'calm_decay', value: 0.88, text: 'Unruhe klingt 12 % langsamer ab.' }] },
    { id: 'echo_nachhall', name: 'Nachhall', text: 'Was du sagst, hörst du einen Atemzug später noch einmal, von irgendwo.', effects: [{ key: 'vision_cost', value: 1.1, text: 'Geistsicht kostet 10 % mehr Nerven.' }] },
  ],
  kessel: [
    { id: 'kessel_bitterer_atem', name: 'Bitterer Atem', text: 'Dein Atem riecht nach verbrannten Kräutern. Händler rümpfen die Nase.', effects: [{ key: 'sell', value: 0.95, text: 'Händler zahlen 5 % weniger.' }] },
    { id: 'kessel_zitternde_haende', name: 'Zitternde Hände', text: 'Beim Abmessen zittern deine Hände, als wollten sie mehr hineinschütten.', effects: [{ key: 'heal_bonus', value: 0.92, text: 'Heilmittel heilen 8 % weniger.' }] },
  ],
  eisen: [
    { id: 'eisen_taubheit', name: 'Eiserne Taubheit', text: 'Ein Teil von dir fühlt nichts mehr. Das macht dich nicht ruhiger, nur kälter.', effects: [{ key: 'max_nerves', value: -4, text: '4 Nerven weniger.' }] },
    { id: 'eisen_rost_im_blut', name: 'Rost im Blut', text: 'Wenn du blutest, riecht es nach altem Metall.', effects: [{ key: 'damage_taken', value: 1.04, text: 'Du nimmst 4 % mehr Schaden.' }] },
  ],
  schluessel: [
    { id: 'schluessel_klickende_gelenke', name: 'Klickende Gelenke', text: 'Deine Gelenke klicken wie Schlösser, die aufspringen. Jeder Schlag lässt etwas in dir aufschnappen.', effects: [{ key: 'hit_nerves', value: 1, text: 'Jeder Treffer, den du einsteckst, kostet 1 Nerv.' }] },
    { id: 'schluessel_fluesternde_tueren', name: 'Flüsternde Türen', text: 'Geschlossene Türen flüstern dir zu, was dahinter liegt. Meistens lügen sie.', effects: [{ key: 'calm_decay', value: 0.9, text: 'Unruhe klingt 10 % langsamer ab.' }] },
  ],
  sq_waage: [
    { id: 'waage_zwanghaftes_abwaegen', name: 'Zwanghaftes Abwägen', text: 'Du kannst nichts kaufen, ohne es dreimal in der Hand zu wiegen. Händler werden ungeduldig.', effects: [{ key: 'price', value: 1.05, text: 'Händler verlangen 5 % mehr.' }] },
    { id: 'waage_schiefes_gleichgewicht', name: 'Schiefes Gleichgewicht', text: 'Du stehst immer ein wenig schief, als läge auf einer Seite ein Gewicht.', effects: [{ key: 'damage_taken', value: 1.04, text: 'Du nimmst 4 % mehr Schaden.' }] },
  ],
  sq_moor: [
    { id: 'moor_torfgeruch', name: 'Torfgeruch', text: 'Du riechst nach Moor, egal wie oft du dich wäschst. Händler zahlen ungern viel für Waren, die nach Moor riechen.', effects: [{ key: 'sell', value: 0.95, text: 'Händler zahlen 5 % weniger.' }] },
    { id: 'moor_kalte_haut', name: 'Kalte Haut', text: 'Deine Haut bleibt kalt und feucht, auch am Feuer.', effects: [{ key: 'composure_regen', value: 0.92, text: 'Nerven erholen sich 8 % langsamer.' }] },
  ],
  sq_uhr: [
    { id: 'uhr_ticken', name: 'Ticken im Ohr', text: 'In deinem Ohr tickt eine Uhr, die nie stehen bleibt.', effects: [{ key: 'composure_regen', value: 0.92, text: 'Nerven erholen sich 8 % langsamer.' }] },
    { id: 'uhr_verlorene_sekunden', name: 'Verlorene Sekunden', text: 'Manchmal fehlen dir Sekunden. Du stehst da, und die Welt ist ein Stück weiter.', effects: [{ key: 'skill_composure', value: 1.08, text: 'Fertigkeiten kosten 8 % mehr Nerven.' }] },
  ],
};

/** Alle Macken nach id. */
export const MACKEN_BY_ID = Object.fromEntries(Object.values(MACKEN).flat().map((m) => [m.id, m]));
