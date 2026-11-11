/** Entwurf, nicht importieren. GameState hält pro Spielstand gefundene Quellen,
 * Markierungen, verbrauchte Aktionsbindungen und die letzte sichere Kreuzung.
 * WorldScene zeigt ausschließlich preview-Ergebnisse als Overlay und Text an.
 * Der CC-Aktionsdialog ruft resolve erst nach ausdrücklicher Bestätigung auf.
 * Gemeinsamer Koop-Stand: ein atomarer Host-Befehl, eine Vorschau für beide.
 */
export class Vouch {
  constructor(gameState) { /* Adapter und Persistenzvertrag hier anbinden. */ }
  mark(anker, ort) { /* Unabhängige Quelle, Ziel und Grenze von drei Verbindungen prüfen. */ }
  unmark(anker, ort) { /* Im Unterschlupf kostenlos; gefundene Quelle bleibt erhalten. */ }
  preview(abgleich) { /* Reine Vorschau: betroffene Straßen, Kontakte, Quellen und Folgen. */ }
  resolve(abgleich) { /* Bestätigte Hauptaktion atomar; niemals von Zeit oder Lesen aufrufen. */ }
  stableRoutes() { /* Gesicherte Wege samt Textbezeichnung für Karte und Journal. */ }
}
