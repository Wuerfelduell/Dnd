/**
 * Integrationsentwurf, NICHT importieren. Keine Zustandsänderungen implementiert.
 * GameState besitzt/serialisiert den Zustand, WorldScene zeichnet nur dessen Projektion.
 * Aufrufe werden im Koop durch eine autoritative Instanz geordnet.
 * Der Vertrag und Beispiele stehen in rufmechanik.md.
 */
export class Signals {
  constructor(gameState, stationDefinitions) {
    // Später: GameState und validierte Stationsdefinitionen referenzieren.
  }
  restore(snapshot) {
    // Schema migrieren, charges auf 0..3 begrenzen, verbrauchte Reserven erhalten.
  }
  snapshot() {
    // Plain JSON: charges, reserveUsed, learnedPatterns, bindings, revealedRoutes.
  }
  inspect(stationId, actorId) {
    // Kostenlose Vorschau: Richtung, Reichweite, Warnflächen und sichere Nischen.
  }
  listen(stationId, actorId) {
    // Keine Ladung, keine automatische Namensantwort, kein Aktfortschritt.
  }
  previewCall(stationId, patternId, direction, actorId) {
    // Vollständige visuelle/verbale Folgen und Kosten, ohne Mutation.
  }
  confirmCall(stationId, patternId, direction, actorId, commandId) {
    // Atomar prüfen, eine Ladung abbuchen, deterministisch auswerten; commandId deduplizieren.
  }
  confirmPrivateAnswer(stationId, actorId, consentToken) {
    // Separates ausdrückliches Opt-in; Bindung pro Sprecher bis zur Schallschleuse.
  }
  takeReserve(stationId, actorId, commandId) {
    // Einmalige +1 Ladung bei charges<3; bei vollem Gerät Reserve nicht verbrauchen.
  }
  refillAtPfiff(actorId) {
    // Nur am sicheren Wagen, kostenlos auf 3, Reserveverbrauch nicht zurücksetzen.
  }
  enterSoundLock(actorId) {
    // Private Bindung lösen, Alarm beenden, bekannte Wege und Wissen erhalten.
  }
  failCall(stationId, actorId, reason) {
    // Keine zweite Abbuchung, höchstens 5 Nerven; Rückkehr zur bekannten Haltestelle.
  }
  projectOverlay(mapId, accessibilityOptions) {
    // Linien, Richtungspfeile, Texte und optionale Vibration aus derselben Ereignisliste.
  }
  confirmActTransition(actId, commandId) {
    // Aufrufer AR validiert Belege/Einwilligung; Signals startet keinen Echtzeit-Timer.
  }
}
