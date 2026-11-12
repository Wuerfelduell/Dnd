# Codex-Paket DR – Seq-4-Rituale und Einnahmen in Wexmoor

Nur Daten und Texte. Keine Änderung unter `src/`. Andere Pakete (DN/DO/DP/DS) können parallel arbeiten.

## Dateien
- `rituale.json`: Pfad-Reiter, Regelkarte, Vorbereitung, Start, Erfolg, Fehler, Notizbuch.
- `meldungen.json`: ereignisgesteuerte Kurzmeldungen.
- `waechter.json`: ritualabhängige Dialoge und Sichtbeschreibungen (Echo stumm).
- `kessel_rezepte.json`: fünf Rezeptvorschläge mit existierenden Zutaten-IDs aus `src/data/sude.js`. Wirkungen sind Vorschläge, keine implementierten Effekte.
- `moor_relikt.json`: 20 mögliche Eigenschaften, Namen, Zersetzungstexte.
- `nebentexte.json`: Koop-Zuschauer, Zweifel, Stadtgerede, Zeitungen und Lesestücke.
- `wexmoor_einnahmen.json`: acht Kopfgelder, sechs wiederholbare Arbeiten, zehn Funde und Mauds Dialoge. Lohnstufen sind symbolisch; keine Geldbeträge vorgegeben.
- `pruefen.mjs`: Validierung ohne externe Pakete.

## Einbau / Ereignisse
- Für alle Pfade: Ritualstart, Regelerfüllung, Regelbruch, Niederlage, Wächterstart, Sieg, Verdauungsverlust, Freigabe des Seq-4-Tranks und Wiederholung verbinden. Flags: `s4r_<pfad>_aktiv`, `s4r_<pfad>_done`, `s4r_<pfad>_fehlschlag`; Koop-Spieler optional mit `p2_` davor. `{pct}` aus der jeweiligen Regel berechnen (Laterne/Maske 20, Echo/Kessel/Moor 25, übrige nur nach vorhandener Gameplay-Festlegung; keine erfundene Prozentzahl).
- Laterne: Echtzeit-Laternen, Halten/Unterbrechen, Lichtschaden, Nerven/Spiritualität, Unruhe-Stufen, Sonnenaufgang mit drei Laternen. Kein Kampfmodus bis Wächterphase.
- Faden: fünf eindeutige Kreaturen und Gebiete, dauerhafte Markierung, Schlaf, gleichzeitiger Traumkampf, Heilsperre.
- Maske: Zivilgestalt, Beyonder Seq 5+, erlaubte Ausrüstung/Tränke, verbotene Fähigkeiten/Artefakte, Verschonen, dauerhafter Zweifel.
- Echo: Audio und Angriffskreise abschalten; Sichttexte statt hörbarer Wächterrede.
- Kessel: Rezeptfreigabe nach voller Seq-5-Verdauung und Seq-4-Formel, fünf Tränke in Reihenfolge, nur Trankwirkung als Wächter-Schaden.
- Eisen: Inventar/Traglast/Slots fortlaufend prüfen, Ausweichverbot, Überleben bis Runde 6, vorher kein Todesstoß.
- Schlüssel: Körper immobilisieren, Schatten mit 40 % Leben, Schattenattacke ca. 80 % Schaden, pro Runde genau eine zufällige eigene Fähigkeit, keine Heilung/Parade, zwei Gegner und Wächter.
- Waage: Besitz versiegeln, Kapital wählen, bestehendes Zirkelangebot unverändert lassen, alles kaufen, nur dort gekaufte Gegenstände im Kampf zulassen, danach Besitz zurückgeben. Formelpreis von 4000 nur, falls angeboten.
- Moor: fünf geeignete Gegenstände ausschließlich mit Moor-Fähigkeiten zersetzen, Relikt zufällig formen, pro Runde Moorwasser verbrauchen, Relikt nach Sieg behalten.
- Uhr: jedes der drei Monster muss angreifen, null Fehler in Vorprüfung, maximal drei Fehler beim Wächter, Parade sperren.
- Koop: nur Aufsteigender steuert; Zuschauerzeilen an den zweiten Spieler binden.
- Wexmoor: Kopfgelder im Wachhaus `wx_wachhaus` anbieten und abrechnen, Arbeiten wiederholbar machen, Funde an `wx_pfandleiherin` verkaufen; Geldwerte im Balancing setzen, damit etwa 10 000 Schilling durch Farmen erreichbar sind. `wx_wachhaus` ist eine Auftraggeber-ID, keine neue Karte; Abgabe auf bestehender Karte `wx_oberstadt`.

## Prüfung
`node docs/story/seq4_rituale/pruefen.mjs`

Hinweis: In der Aufgabenbeschreibung stehen acht JSON-Dateien, aber sieben JSON-Dateinamen. Dieses Paket enthält alle sieben explizit verlangten JSON-Dateien, README und Prüfer.
