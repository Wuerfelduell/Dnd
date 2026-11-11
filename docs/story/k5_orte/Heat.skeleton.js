/**
 * CH-Vertrag, absichtlich keine Laufzeitimplementierung.
 * CG besitzt Ventilentscheidungen und bha_* Flags. GameState soll später einen
 * serialisierten Netzzustand halten; vorhandene Spielstände werden migriert.
 * WorldScene bekommt nach einer bestätigten Transaktion den Kartenpatch.
 * Lesen, Pause, Zeitwechsel und applyToMap dürfen keine Entscheidung auslösen.
 */
export class Heat {
  /** GameState, CG-Ventilkatalog und Kartenbindung später injizieren. */
  constructor(state, valves, mapBindings) {}

  /** Bestätigten Zustand zu|kalt|warm setzen; Kapazität atomar erneut prüfen. */
  setValve(id, state) {}

  /** Nebenwirkungsfreie Vorschau: Kreis, verdrängte Kreise, Rücklauf, Rückweg. */
  preview(id, state) {}

  /** Liste aktiver Überschusskreise; niemals Grundversorgung mitzählen. */
  warmCircuits() {}

  /** Bestätigtes Ziel behaelter|klinik|leer für den ausgewählten Kreis. */
  routeReturn(target) {}

  /** Nur Darstellung/Objekte aktualisieren; Position und Beweisstand erhalten. */
  applyToMap(mapId) {}
}
