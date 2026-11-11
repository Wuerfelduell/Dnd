# Codex-Paket DK: Das Nachspiel (freies Spiel nach dem Finale, Rückkehr in alle Städte, Nachrichten der Enden)

**Schreibt nach:** `docs/story/nachspiel/`

Nach dem Ende von Kapitel 6 (Paket CT) geht das Spiel weiter: Im **Nachspiel** fällt die Regel „keine Rückreise“ für den Spieler weg (die Küstenbahn fährt jetzt alle Städte an), die Städte zeigen die Folgen seiner Entscheidungen, offene Nebenaufträge und Prüfungen bleiben spielbar, benannte Gegner (Paket DJ) und die Fahrende Auktion (DE) laufen weiter, und jede Stadt hat ein **Nachspiel-Gespräch** mit den wichtigsten Figuren. Reine Texte und Daten; die Logik (Reisen freischalten, Stadt-Zustände) beschreibt dein README für den Einbau.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern** und keine Dateien unter `src/` anfassen: Du lieferst Daten und Texte als JSON und Markdown in deinen eigenen Ordner unter `docs/story/`. Der Einbau passiert separat. Andere Pakete laufen gleichzeitig.

- **Format:** JSON wie die bestehenden Pakete unter `src/data/packs/` (nur lesen). Texte auf Deutsch, Spieler wird mit „du“ angesprochen, Figuren sagen „Sie“ zum Spieler. Kurze Sätze, kein Pathos-Überschwang, keine Namen oder Begriffe aus fremden Büchern, Spielen oder Filmen.
- **Ton:** viktorianisch-industriell, melancholisch, trocken; Okkultes wirkt körperlich und unheimlich, nie blutig. Keine Schreie, keine Folter.
- **IDs:** nur Kleinbuchstaben, Ziffern, Unterstrich. Benutze die festen IDs unten genau so. Erfinde keine neuen Pfade, Sequenznamen, Städte, Karten oder Figuren; was fehlt, bekommt dein Paket-Präfix.
- **Prüfskript:** `docs/story/<paket>/pruefen.mjs` (Node ohne Pakete): alle JSON lesbar, alle Pflicht-IDs vorhanden, keine doppelten IDs, keine leeren Texte. Pull Request mit der Prüf-Ausgabe.
- **README:** `docs/story/<paket>/README.md` erklärt kurz, welche Datei wofür ist und was der Einbau anschließen muss (Flags, Ereignisse), damit der Einbau nur noch Zeilen ergänzt.

## Eckdaten
- Beginn: Flag `k6_done` mit einem der vier Enden `k6_ende_schliessen`, `k6_ende_verbrennen` (hier ist Varrowmouth geräumt: die Stadt ist nur noch als Ebbe-Ruine begehbar), `k6_ende_uebergeben`, `k6_ende_teilen`. Zusätzlich die Enden der früheren Kapitel aus `docs/story/k1_finale` (`src/data/packs/k1_finale/`), `k2_akte/epiloge.json`, `k3_akte`, `k4_akte/epiloge.json`, `k5_akte/epiloge.json` (nur lesen): Das Nachspiel kombiniert sie.
- Städte-Zustände `nachspiel_<city>_<zustand>` je Stadt 2 bis 3 Zustände (Kettlegate: Starling-Fahndung beendet oder nicht; Wexmoor: Namensgilde offen oder zerschlagen; Dunscar: Zug fährt wieder oder Endbahnhof bleibt; Calderwick: Unterschrift zurück oder nicht; Briarholt: warm oder kalt; Varrowmouth je Ende).
- Reise: Küstenbahn `nachspiel_bahn` mit Fahrplan zwischen allen sechs Städten, 6 Reiseereignisse (ruhig; ein Ereignis mit dem Zugpersonal aus Dunscar).
- Sequenz 1 (Paket DD) ist im Nachspiel erreichbar oder schon erreicht: Figuren reagieren darauf (Reaktionen aus DD, hier nur Verweise).

## 1. Stadt-Zustände (`zustaende.json`)
Je Stadt und Zustand: Beschreibung beim Ankommen (4 bis 6 Sätze), Änderungen als Daten (welche Sprecher fehlen oder dazukommen, welche Karten gesperrt, welche Läden andere Preise haben, welche Zeitung ausliegt), 10 Gerede-Zeilen je Zustand (ca. 150 insgesamt), Nacht-Änderungen.

## 2. Nachspiel-Gespräche (`gespraeche.json`)
Je Stadt 3 Hauptfiguren (18 Gespräche, 10 bis 16 Zeilen, ein Entscheidungsknoten, Varianten nach Zustand und Ende), dazu 6 kurze Gespräche mit Nebenfiguren je Stadt (36, 4 bis 6 Zeilen). Koop: je Stadt ein Gespräch zu dritt. Figuren-IDs aus den Packs nachschlagen; für Varrowmouth Paket CX.

## 3. Offene Fäden (`offene_faeden.json`)
Liste aller Nebenaufträge und Prüfungen, die im Nachspiel weiter spielbar sind (IDs aus `kg_nebenquests`, `wx_nebenquests`, `k3_nebenquests`, `k4_nebenquests`, `k5_nebenquests`, `k3_pruefungen`, Seq-3-Prüfungen aus DD), je mit einer Zeile, wie der Auftraggeber den Spieler nach so langer Zeit empfängt (ca. 60 Zeilen), und 6 **neue** kleine Nachspiel-Aufträge `np_*` (einer je Stadt, 3 Schritte, Belohnung ein Haus-Stück aus Paket DG oder ein Foto aus Paket DI).

## 4. Das letzte Lesestück und der Abspann (`abschluss.json`)
- 6 Lesestücke je 150 bis 200 Wörter: „Was die Städte vom Spieler erzählen“, je Stadt eines, in Varianten nach Zustand (Platzhalter `{zustand_satz}` mit Satzliste).
- Abspann-Texte, falls der Spieler das Nachspiel beendet (Schlafen im Haus mit Flag `nachspiel_abschluss`): 30 Zeilen, die aus den Enden aller Kapitel zusammengesetzt werden (Regel im README), Koop-Fassung.
- Titelbild-Zeile: 6 Varianten des Untertitels im Hauptmenü nach Abschluss (für Paket DM; kurze Sätze ohne Eigennamen aus fremden Werken).

## 5. Abgabe
Alle JSON, `README.md` (Spezifikation: Reise-Freischaltung, Zustands-Ableitung aus Flags als Tabelle, Sprecher-Änderungen, Nachspiel-Abschluss), `pruefen.mjs` (alle referenzierten IDs existieren in den gelesenen Packs), Pull Request mit Prüf-Ausgabe und Wortzahl.
