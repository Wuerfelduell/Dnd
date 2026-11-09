# Nebelakten

Ein 2D-Pixel-Mystery im Browser: Top-down wie ein Farm-/Life-Sim, aber düster.
Nebel, Gaslaternen, eine viktorianisch-okkulte Großstadt. Im Mittelpunkt stehen
Ermitteln, Gespräche und das Verknüpfen von Hinweisen, nicht Kämpfe.

![Screenshot](docs/screenshot.png)

**Stand:** spielbarer Prototyp mit drei zusammenhängenden Fällen, sechzehn Nebenaufträgen,
acht Orten (Polizeirevier, Ashgrove Lane mit Hinterhof, Taverne „Zum Ertrunkenen Mond“, Altmarkt,
Friedhof St. Ebba, Krypta, Kanalhafen, Lagerhaus 7), Inventar, Leben,
einem kleinen Rundenkampf mit Timing und Spielständen.

## Spielen

**Online:** https://wuerfelduell.github.io/Dnd/
(wird bei jedem Push auf `main` automatisch neu gebaut, siehe unten „Deployment“).

**Lokal am Laptop:**

1. [Node.js](https://nodejs.org) (Version 20 oder neuer) installieren.
2. Im Projektordner einmalig `npm install` ausführen.
3. `npm run dev` starten und die angezeigte Adresse öffnen (http://localhost:5173).
   Änderungen am Code oder an den Falldaten erscheinen sofort im Browser.

## Steuerung

| Taste | Wirkung |
|---|---|
| `WASD` / Pfeiltasten | laufen |
| `E` | untersuchen, sprechen, weiter |
| `1`–`9` oder Klick | Antwort im Gespräch wählen |
| `Q` | Geistsicht an/aus: zeigt verborgene Spuren, kostet Nerven |
| `J` / `Tab` | Notizbuch: zwei Hinweise anklicken, mit `V` verknüpfen |
| `I` | Inventar: Gegenstände benutzen, Waffe ausrüsten |
| Kampf: `1`–`4` | Aktion wählen (Angriff, Fertigkeiten, Gegenstände, Flucht) |
| Kampf: `E` / `Leertaste` | beim Angriff im goldenen Bereich drücken |
| Kampf: `Leertaste` / `F` | beim gegnerischen Schlag ausweichen / parieren |
| `R` | nach einem Ende neu starten |

## Spielmechanik

- **Hinweise** findest du in der Welt (funkelnde Stellen) oder in Gesprächen.
  Jeder Hinweis ist eine **Quelle** für eine **Information**.
- **Nicht alles ist wahr**: Eine Information mit einer Quelle ist nur eine
  *Vermutung*. Erst ab **zwei unabhängigen Quellen** gilt sie als *sehr wahrscheinlich*.
  Auch die Polizei liegt manchmal falsch; solche Infos werden durch Gegenbeweise *widerlegt*.
- **Verknüpfen**: Im Notizbuch kombinierst du zwei Informationen zu einer
  **Schlussfolgerung**. Sie ist *gesichert*, wenn beide Informationen sehr wahrscheinlich sind.
  Für eine Auflösung wollen Price und Marlowe gesicherte Schlussfolgerungen sehen.
- **Ansehen bei der Polizei**: Gelöste Fälle, gestellte Gauner und Nebenaufträge bringen
  Ansehen, falsche Beschuldigungen kosten es. Fünf Ränge (Zivilist, Hilfsermittler,
  Ermittler, Vertrauter des Reviers, Geachteter Ermittler) öffnen Archivakten,
  Dienstbücher und Gesprächsoptionen, die zusätzliche Quellen und Abkürzungen liefern.
  Gesperrte Optionen sieht man ausgegraut mit dem nötigen Rang. Manche Leute (Häftlinge)
  reden dafür *weniger*, je angesehener du bist.
- **Geistsicht** macht okkulte Spuren sichtbar. Sie zehrt an den **Nerven**.
- **Leben und Inventar**: Verbände und Tonikum heilen, Riechsalz beruhigt die Nerven,
  Bannsalz hilft gegen Okkultes. Die Pritsche im Revier heilt vollständig. Bessere Waffen
  gibt es mit höherem Rang (Dienstschlagstock ab Hilfsermittler, Stockdegen ab Vertrauter).
- **Kampf** ist selten und kurz, das Ermitteln bleibt im Vordergrund. Rundenbasiert mit Timing:
  Angriffe im richtigen Moment treffen präzise. Gegnerische Schläge kündigt ein schrumpfender
  Ring an: *Ausweichen* (Leertaste) ist großzügig, *Parieren* (F) eng, bringt aber Konzentration
  und einen Konter. Wer alle Schläge einer Attacke pariert, setzt zum Gegenschlag an.
  Konzentration bezahlt Fertigkeiten (Doppelschlag, Laternenblende, Bannwort).
  Wissen aus den Ermittlungen deckt Schwachstellen auf. Eine Niederlage ist kein Game Over:
  Man wacht mit wenig Leben wieder auf. Kämpfe bisher: Übungskampf mit Sergeant Holt,
  der Nebelhund am Kanal (Nebenauftrag), der Aschewächter in der Krypta (Fall 2), Ratten im Archiv,
  der Chor und Rook im Lagerhaus 7 (Fall 3), Silas der Falschspieler und der Spiegelschatten.
- **Aufträge** stehen im Notizbuch mit abhakbaren Schritten. Der Spielstand wird
  automatisch im Browser gespeichert (Titelbildschirm: Fortsetzen / Neues Spiel).

![Lagerhaus 7](docs/lagerhaus.png)
![Kampf](docs/kampf.png)
![Inventar](docs/inventar.png)
![Notizbuch](docs/notizbuch.png)
![Gesperrte Option](docs/gesperrt.png)

## Geschichte bisher

1. **Die erloschene Laterne:** Der Lampenanzünder Elias Thorne verschwindet in Ashgrove Lane. Spur: Miriam Vey, ehemalige Chorleiterin von St. Ebba.
2. **Asche von St. Ebba:** Hester Marsh wird von einem Wiegenlied in die Krypta gelockt. Vey will ihre tote Tochter Lilian zurückholen.
3. **Der Chor singt woanders:** Jemand im Revier hilft Vey. Falsche Fährten führen zu Sergeant Holt, die Wahrheit zu Constable Rook und zum Lagerhaus 7 am Kanalhafen. Wer herausfindet, dass Vey noch die Glocke von St. Ebba braucht, kann ihr Ritual aufhalten.

Nebenaufträge: Taschendieb, verlegte Akte, Klopfen in der Zelle, Hesters Medaillon, Nebelhund, Die Uhr ohne Besitzer, Ratten im Archiv, Barnabys Unschuld (ein falscher Polizeibericht), Der Ertrunkene vom Kanalhafen (Geistsicht), Die Schlagzeile (eine Entscheidung mit Folgen fürs Ansehen).

Neu am Altmarkt und in der Taverne: **Gezinkte Würfel** (die Wirtin verdächtigt den Falschen), **Laternenrunde**
(vier vereiste Laternen neu anzünden), **Der Spiegel von Mr. Quill** (Geistsicht und ein okkulter Kampf),
**Was der blinde Ned hört** (ein Verband gegen Wissen), **Die schwarzen Kerzen** (nicht jeder Verdacht auf den Chor
stimmt) und **Gretas Stand** (ein korrupter Marktwart, drei Lösungswege). Wer genau hinsieht, merkt:
Veys Chor ist noch nicht ganz verstummt.

## Technik

- [Phaser 3](https://phaser.io) (2D-Engine, WebGL) + [Vite](https://vitejs.dev) (Dev-Server & Build).
- Spielauflösung 480x270, ganzzahlig hochskaliert (960x540, 1440x810, …), damit die Pixel scharf bleiben.
- Licht: eine Dunkelheits-Ebene, aus der jede Lampe ein weiches Loch radiert, plus additiver Lichtschein.
  Der Nebel liegt *unter* der Dunkelheit und glüht deshalb um die Laternen herum auf.
- Die Oberfläche (Dialoge, Notizbuch) ist HTML/CSS über dem Canvas, damit Text bei jeder Größe scharf ist.

```
src/
  main.js                 Start, Skalierung, Spielstand
  core/GameState.js       Regeln: Quellen, Ansehen, Aufträge, Leben, Inventar, Bedingungen (ohne Phaser, in Node testbar)
  core/Combat.js          Kampfregeln: Timing-Fenster, Schaden, Konzentration, Folgen (in Node testbar)
  world/WorldScene.js     Orte, Figuren, Bewegung, Interaktion, Reisen
  world/CombatScene.js    Kampfbildschirm: Seitenansicht, Ringe, Takt-Leiste, Animationen
  world/Lighting.js       Nachtlicht
  world/assets.js         lädt die PNG-Pixel-Art und ordnet sie den Texture-Keys zu
  world/textures.js       prozedurale Platzhalter für alles ohne PNG
  ui/Ui.js, style.css     HUD, Dialoge, Notizbuch, Stadtkarte, Enden
  data/
    campaign.json         Start, Ränge, Reiseziele, alle Figuren
    quests.json           Haupt- und Nebenaufträge mit Schritten
    items.json            Gegenstände (Waffen, Heilung, Kampfhilfen)
    encounters.json       Gegner: Leben, Attacken (Schlagzeiten in ms), Schwachstellen, Folgen
    case_01.json, ...     Informationen, Hinweise (Quellen), Schlussfolgerungen, Enden (Fall 1 bis 3)
    case_altmarkt.json    Informationen und Hinweise der Altmarkt-Nebenaufträge
    maps/*.json           Orte als Zeichenraster + Objekte + Figuren
    dialogues/*.json      Dialogbäume
tests/                    `npm test`: Datenprüfung, Kampfregeln und Balance, beide Fälle über die echten Dialoge durchgespielt
```

### Inhalte bearbeiten

Alles Inhaltliche liegt als JSON in `src/data/`. Bedingungen funktionieren überall gleich
(Dialogoptionen, Startknoten, Objekte, Sperren): `requires_clues`, `requires_facts`,
`requires_likely` (≥ 2 Quellen), `requires_conclusions`, `requires_certain`, `requires_flags`,
`requires_honor`, `max_honor`, `requires_quests_active`, `requires_items`, `hide_if_*`. Effekte genauso:
`gives_clues`, `sets_flags`, `start_quests`, `complete_quests`, `honor`, `gives_items`, `takes_items`,
`heal`, `combat` (startet einen Kampf), `ending`. Kartenobjekte mit `"kind": "combat"` sind Gegner,
`"auto"` löst sie beim Näherkommen aus, `"kind": "rest"` heilt.
`npm test` meldet kaputte Verweise und prüft, dass beide Fälle lösbar bleiben.

### Pixel-Art

Die echten Grafiken liegen als PNG unter `public/sprites/` (von Codex erzeugt,
auf die Zielgrößen normalisiert: Tiles 16x16, Figuren 16x32, Lauf-Sheets 64x128
mit den Reihen unten/links/rechts/oben). `src/world/assets.js` lädt sie im
`preload()` und legt sie unter denselben Texture-Keys an wie die alten Platzhalter:

- `TILE_CELLS`: Tile-Key → Zelle im Tileset (optional mit Grund-Tile darunter)
- `PROP_CELLS`: Prop-Key → Ausschnitt aus einem Prop-Sheet
- `CHARACTER_SHEETS`: Figur (`player`, `npc_<id>`) → Lauf-Sheet

Alles, was dort nicht zugeordnet ist, zeichnet `textures.js` weiterhin prozedural
(z. B. Gras, Brücke, Schreibtisch, Miss Pimm). Ein neues Asset einbauen heißt also:
PNG nach `public/sprites/` legen und eine Zeile in `assets.js` ergänzen.

## Deployment (GitHub Pages)

Der Workflow `.github/workflows/deploy.yml` testet und baut jeden Pull Request
und veröffentlicht `main` auf GitHub Pages. Einmalig nötig:
**Repository → Settings → Pages → Source: „GitHub Actions“**.

## Alter Stand

Das frühere 3D-RPG (Godot, „Baldur's Gate“-inspiriert) steckt vollständig in
der Git-Historie (letzter Commit vor dem Umbau: `673ace7`).
