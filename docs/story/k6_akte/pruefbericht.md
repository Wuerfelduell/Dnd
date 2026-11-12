# Prüfung CT

11. November 2026, `node docs/story/k6_akte/pruefen.mjs`:

```text
OK: 14 JSON-Dateien; 5 Akte, 20 Fährten, 60 Hinweise, 20 Deduktionen.
OK: 60 Dialoge, 162 Knoten; 7 Verhöre mit je 3 Fragen und 1 Lüge.
OK: 5 Anreisen, 12 Szenen, 40 Epilogkarten, 4 Koop-Karten, 80 Abspannzeilen, 36 Meldungen.
OK: 128 vollständige Datenabläufe mit echtem GameState; beide Ratszeugen, beide Bosswege und alle Solo-/Koop-Enden.
OK: Gezeitenfilter, eindeutige Enden, Abbruch der Endvorschau, Phasengrenzen und Osric-Beziehungsschwelle.
Wortzahl: 12523 Textwörter in JSON (inklusive wiederholter UI-/Quelltexte; keine geschätzte Spielzeit).
EXTERN: 12 minimale CX-Sprecherhüllen nur im Test; CU-Geometrie, CX-Profile, CZ-Kämpfe und DD-Rituale nicht integriert.
```

Zusätzlich: Syntaxprüfung des Prüfers und `git diff --check`. Kein Karten-, Kampf-, Browser- oder Netzwerkspieltest. Die zwölf minimalen Sprecheridentitäten existieren nur im Prüflauf; alle CZ-Siege sind dort simulierte Ergebnisse.
