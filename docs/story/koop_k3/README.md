# BF – Koop in Dunscar

Daten- und Textpaket für beide Erscheinungen von Spieler 2. Noch nicht in den Spielinhalt geladen. Keine Änderungen an Spielcode, anderen Paketen oder Hauptentscheidungen.

## Inhalt und Spielzeit

| Datei | Inhalt |
|---|---|
| `geplauder.json` | 40 Gespräche mit je drei Zeilen und beiden p2-Stimmen, alle 18 Dunscar-Karten |
| `kampf.json` | Nur drei neue Anlässe; jeweils 10 p2a-, 10 p2b- und 5 p1-Sprüche |
| `bindung.json` | Sechs Horchstellen mit Rollenwechsel, Warnungen, gebundenen Stimmen und Schleusenantworten; 15 zusätzliche Partnersprüche |
| `dialog_zusaetze.json` | Elf Figuren mit jeweils zwei neuen Knoten; zweite Koje bei Pfiff |
| `quests.json`, `dialogues.json` | Zwei Aufträge, normale und getauschte Schleusenrollen, Fehlversuche und Abbruch |
| `platzierung.json` | Neun vorgeschlagene Objektpositionen auf vorhandenen Karten |
| `items.json`, `encounters.json`, `npcs.json`, `case.json` | Bewusst leer; bestehende Gegenstände, Figuren und Karten werden benutzt |
| `offene_punkte.md`, `grafikwuensche.md`, `pruefen.mjs` | Einbauvertrag, zwei Requisitenwünsche und ausführbare Prüfung |

Geschätzte zusätzliche Spielzeit: **20–30 Minuten**, davon Horchen 5–7, Schleuse 7–10, Figurenreaktionen 5–8 Minuten. Geplauder und Kampfsprüche verteilen sich auf die gesamte Kapitelreise. Alternative Wexmoor-Enden und Stimmen sind nicht in einem Durchlauf vollständig hörbar.

## Reihenfolge

Ab Ankunft stehen Figurenreaktionen und frühe Gespräche bereit. Nach Akt I beginnt `koop_ds_horchen` am Schwellenring; nach Akt III beginnt `koop_ds_schleuse` mit Pfiffs Zettel im Speisewagen. Danach geht es über die vorhandenen Fußwege zur Rufschlucht. Keine neue Karte, kein Teleport, kein Ruf ersetzt eine Hauptstory-Deduktion.

Die sechs Viertel erhalten je ein Gespräch für Akt I, III und V (01–18). Sechs davon berücksichtigen die vier Wexmoor-Enden. Im Speisewagen folgen vier Gespräche nach Akt I–IV (19–22). Vier Innenräume behandeln die eigenen Pfade von Spieler 2 (23–26). Beide Nachtzugkarten bekommen je zwei Gespräche (27–30); Gefahrengebiete und Unterschicht je eines (31–33, 36), der letzte Bahnsteig zwei (34–35). Vier weitere Alltagsgespräche ergänzen die Viertel (37–40). Genau vier Gespräche verlangen bereits gefundene Rufmuster (27, 29, 34, 35).

Die Rufmusterquelle `gefunden_durch` enthält **Hinweis-IDs**, keine Flags. Deshalb verwendet dieses Paket `requires_clues`. Die Questdaten nutzen die tatsächlichen Vorlagenfelder `done.requires_flags`, `reward.gives_money`, `start_quests`, `complete_quests` und direkte Knoteneffekte. Die Kurzschreibweisen aus dem Auftrag würden vom aktuellen Spiel nicht ausgewertet.

## Prüfen

Vom Repository-Stamm: `node docs/story/koop_k3/pruefen.mjs` (Node ohne Zusatzpakete). Der Prüfer lädt den echten Inhalt über `tests/helpers.js`, fügt BF nur in einer Arbeitsspeicher-Kopie hinzu und prüft Daten, Dialoggraphen und simulierte Questabläufe. Die noch fehlende räumliche und persönliche Zustandsprüfung wird dadurch nicht als implementiert dargestellt. Vor Aktivierung gelten die Abnahmen in `offene_punkte.md`.
