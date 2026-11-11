# Prüfergebnis

Geprüft am 11. November 2026 mit den in `quellen.md` angegebenen CG-Dateien.

```text
OK: 13 JSON-Dateien; 36 Karten / 18 identische Zustandspaare.
OK: 338 Lesestellen über beide Zustände; 72 Tür-Ausgänge; alle Spawns und Objekte erreichbar.
OK: 27 Dialoge, 1 Quest, 11 Items, 6 Zonen; IDs, next-Ziele und Referenzen geprüft.
OK: 125 Netzbelegungen: Rückwege aus allen 36 Karten auch ohne Glasgänge offen.
OK: 30 pfadgefilterte Ersatzzutaten; endgültige Bossabschlüsse; Schwarm 0,7; keine fremden Flag-Setter.
OK: CG-Quellen geladen; 7500 Wärme-/Rücklaufübergänge halten die Drei-Kreise-Grenze.
EINBAU OFFEN: BH-Zonenbindung, CG-Endphasenprüfung, Variantenwechsel ohne Neuladen und CD-Landstraßenanschluss.
```

Zusätzlich erfolgreich: `node --check docs/story/k5_orte/Heat.skeleton.js` und `git diff --check`. Der Lauf ohne CG-Quellen listet deren externe Verweise ausdrücklich als offen. Keine Browser- oder Laufzeitprüfung des noch nicht eingebauten Kapitels.
