# BC · Handel in Dunscar

Daten- und Textpaket zur Geschichte „Der letzte Zug nach Dunscar“. Noch nicht in den Laufzeit-Loader eingebunden. Grundlage: `main` bei `d4caa23`, Aufgabenfassung vom 10. November 2026. Ausschließlich eigene Dateien; kein Eingriff in Kapitelhandlung oder andere Pakete.

## Inhalt und Reihenfolge

1. Ab Ankunft: Ida und Bram am Kalkmarkt, Cato am Signalhang; Mabel erhält einen Ausschank über einen Dialogzusatz. Fußwege bleiben unabhängig von Schnellreisefreigaben nutzbar.
2. Drei Händleraufträge: **Ein Mantel, zwei Besitzer**, **Der Stein ohne Maß**, **Drei kalte Klemmen**. Brams Stein ist eine gebrochene Stütze; Pelhams bestehender Grabsteinfall bleibt eigenständig.
3. Dora am Kalkmarkt vermittelt **Der eigene Span**: freiwilliges Kerbholz bei Bram, Wartungsweg im Journal, nächtlicher Besuch bei Agathe im Runddepot. Keine Namensantwort in eine Rufleitung, kein Ladungsverbrauch.
4. Danach öffnet die Treppe unter dem Runddepot während der Treffen. Agathe eröffnet die Auktion, hat aber keinen Laden. Wim, Dora und Rufus bieten Waren und drei weitere Aufträge an: **Öl für einen leeren Raum**, **Zwei Kerben für eine Hand**, **Die Pause auf der Walze**.
5. Fünf Einzelgänger sind unabhängig vom Zirkel ansprechbar. Drei einmalige Entscheidungen verändern ihre Bindung je um ±1. Mitgliederaufträge können eine zusätzliche positive Bindung zu Holm, Wenna oder Jory geben. Bei +3 gibt es eine einmalige Gabe; bei −3 einen einmaligen Verrat und einen vermeidbaren Kampf. Der Status bleibt gemäß `Bonds.js` endgültig. Bei gemischten Entscheidungen kann die Beziehung bewusst offen bleiben; die vorhandene Geschenkmechanik ist eine mögliche weitere Bindungsquelle.

| Datei | Inhalt |
|---|---|
| `quests.json` | 7 Nebenaufträge mit sichtbaren, prüfbaren Schritten |
| `items.json` | 6 Kleidungsstücke, 2 Waffen, 10 Verbrauchsmittel, Täfelchen, 2 Auftragsgegenstände, 5 Freundschaftsgaben |
| `encounters.json` | 5 nichttödliche, fliehbare Einzelgängerkämpfe; gewöhnliche Trophäen über `on_win` |
| `dialogues.json`, `npcs.json` | 12 Figuren, Bindungsentscheidungen, pfadspezifische Sätze, je 4 Wexmoor-Reaktionen bei Holm und Wenna |
| `case.json` | `{}`; keine neue Hauptakte oder fremde Schlussfolgerung |
| `dialog_zusaetze.json` | Nur Mabels Ausschank; bestehende Figur wird nicht ersetzt |
| `platzierung.json` | Vorschläge für Figuren, Lesestellen und Depotzugang auf bestehenden Karten |
| `haendler.json` | 3 neue Händler, Mabels Ausschank, 12 `k3o_*`-Verkaufswert-Basen |
| `treffen_schichtbund.json` | Zirkel, 3 Mitglieder, 15 Angebote, neue Innenkarte, Pin und Reiseeintrag |
| `einzelgaenger.json` | Ergänzung von `loners.list`, unveränderte Grenzen −3/+3 |
| `artifacts.json` | Artefaktdefinitionen zu Täfelchen und 5 Gaben für den Artefakt-Loader |
| `pruefen.mjs` | Referenz-, Raum-, Wirtschafts- und ausführbare Dialogprüfungen mit echtem `GameState` |

## Spielzeit

Zielkorridor **120–145 Minuten** bei einem normalen Erkundungsdurchgang: Händleraufträge etwa 3 × 15 Minuten, Aufnahme 10–15 Minuten, Mitgliederaufträge 3 × 15–20 Minuten, Einzelgängergespräche und erste Auktion 20–25 Minuten. Alternative Endreaktionen und sämtliche Kämpfe verlängern einen vollständigen Durchgang. Die Schätzung ist keine gemessene Spielzeit; Laufwege überschneiden sich mit der Hauptgeschichte. Keine künstliche Echtzeitfrist.

## Wirtschaft und Fortschritt

- Formeln der neuen Pfade `sq_waage`, `sq_moor`, `sq_uhr`: Sequenz 6 für 640, Sequenz 5 für 900 Schilling, mit Pfadgrenze, Wahrscheinlichkeit und `once` als Angebotsmetadaten (Auktions-Engine-Grenze siehe offene Punkte). Zweitquelle zu Wexmoor; keine Formel 4–1 und keine exklusive Kernzutat 5–1.
- Kleidungsstücke kosten 110–170 Schilling und verbessern ausgewählte Wexmoor-Werte moderat (z. B. 17 % statt 15 % Schadensreduktion); keine Kombination, die ein hohes Prüfungsartefakt vollständig ersetzt. Fäustel 15, Meißel 13 Angriff, ohne okkulte Multiplikatoren.
- Hilfsmittel kosten je 24 Schilling und nutzen ausschließlich vorhandene Verbrauchseffekte: 14 Leben, 18 Nerven oder 6 Wurfschaden. Eine Portion wird bei Benutzung verbraucht; keine erfundene Dauerwirkung oder Prüfungsbeschränkung. Bei vollen Werten gelten die üblichen Benutzungssperren.
- `sell_prices` enthält **Bewertungsbasen**, keine fertigen Auszahlungspreise: `sellPrice()` halbiert sie und wendet danach Passiven an. Beispiel: Leitungsklemme Basis 12 → 6 Schilling ohne Bonus. Alle neun gewöhnlichen Dunscar-Trophäen plus drei Verbrauchsgüter sind enthalten. Artefakte benutzen ihre vorhandenen Preise.
- Catos Quest verlangt eine Fundstellenbestätigung und drei einzelne Übergaben. Ladenkauf allein reicht nicht. Nach dokumentierter Bergung können verlorene/verkaufte Klemmen durch gleichartige gekaufte Stücke ersetzt werden; die bestehende Inventarlogik kennt keine Herkunft pro Exemplar.
- Gravur kostet einmalig genau 60 Schilling und verbraucht kein fremdes Täfelchen. Sie schützt nicht gegen private Rufbindungen.

## Koordinaten und Prüfen

**Alle Einträge in `platzierung.json` sind Platzierungsvorschläge**, nullbasiert, in 16-Pixel-Kacheln. Diese Kennzeichnung steht hier, damit kein erfundenes Metadatenfeld in Spieldaten landet. Die neue Innenkarte ist vollständig in `treffen_schichtbund.json → maps` enthalten; dort stehen die vier Zirkelfiguren. Pin `[140,125]` liegt unter dem Schwellenring `[140,95]`.

Vom Repository-Stamm:

```sh
node docs/story/k3_handel/pruefen.mjs
npm test
```

Der Prüfer lädt `tests/helpers.js → loadContent()`, ergänzt die Spezialdateien ausschließlich im Speicher und verwendet danach `applyQuestPack()`. Er spielt alle sieben Aufgaben von ihrem Start aus, Freund-/Feindwege, Einmaligkeit, Tagessperren, Gravurkosten, Klemmenverbrauch, Hilfsmittel und Auktion durch. Nur vorhandenes Hauptgeschichtenwissen und das ausdrücklich externe Nachtflag werden als Vorbedingungen gesetzt. Er prüft keine bereits erfolgte Produktionseinbindung; die Anschlüsse stehen in `offene_punkte.md`.
