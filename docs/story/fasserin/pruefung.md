# Prüfung BO

Stand: 10. November 2026, Basis `97da1e2`.

- `node tools/art/fasserin/validate.mjs`: zehn kollisionsfreie Rezepte, ausschließlich vorhandene Beutestücke, je zwei bis drei Zutaten und mindestens eine besondere Zutat; fünf Wexmoor-, drei Stadtgegner-Rezepte. Preise, Löhne, Wirkungsschlüssel und Textanzahlen geprüft.
- Alle zehn zusätzlichen Rezepte mit der unveränderten `GameState`-/Artisan-Logik in einer nur im Speicher erweiterten Inhaltskopie gefasst. Fehlendes Geld und fehlende Zutaten verhindern den Kauf; erfolgreicher Kauf zieht den festen Lohn und alle Zutaten ab. Je ein frischer Spielstand verhindert, dass kumulierte Artefakt-Unruhe unabhängige Ereignisse auslöst.
- 1.000 Angebotszyklen: reproduzierbare Angebote mit vier Rezepten; Ausgangspool nach hypothetischer Ergänzung 20 Rezepte. Anwesenheitschance bleibt 30 %.
- `python tools/art/fasserin/validate.py`: 26 indizierte PNGs, genaue Maße, maximal 32 gemeinsame sichtbare Farben, binäres Alpha, transparente Zellränder, unterschiedliche Animationsposen und gemeinsame Figuren-Grundlinie geprüft.
- Exportbilder visuell auf Richtungen, Portraitstimmungen, erkennbare Silhouetten und die zehn Artefaktmotive geprüft. Bei 16×16 sind filigrane Draht- und Ritzdetails zwangsläufig reduziert; die 32×32-Fassungen erhalten mehr Details.
- `npm test`: 457 Tests bestanden, keine Fehler.
- `git diff --check`: ohne Befund.

Keine Laufzeitintegration vorgenommen. Texte und Artefakte benötigen nach dem Einbau eine Spielprobe zur Balance.
