# Nebelakten

Ein 2D-Pixel-Mystery im Browser: Top-down wie ein Farm-/Life-Sim, aber düster.
Nebel, Gaslaternen, eine viktorianisch-okkulte Großstadt. Im Mittelpunkt stehen
Ermitteln, Gespräche und das Verknüpfen von Hinweisen, nicht Kämpfe.

![Screenshot](docs/screenshot.png)

**Stand:** spielbarer Prototyp mit zwei zusammenhängenden Fällen, vier Nebenaufträgen,
vier Orten (Polizeirevier, Ashgrove Lane, Friedhof St. Ebba, Krypta) und Spielständen.

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
- **Aufträge** stehen im Notizbuch mit abhakbaren Schritten. Der Spielstand wird
  automatisch im Browser gespeichert (Titelbildschirm: Fortsetzen / Neues Spiel).

![Notizbuch](docs/notizbuch.png)
![Gesperrte Option](docs/gesperrt.png)

## Technik

- [Phaser 3](https://phaser.io) (2D-Engine, WebGL) + [Vite](https://vitejs.dev) (Dev-Server & Build).
- Spielauflösung 480x270, ganzzahlig hochskaliert (960x540, 1440x810, …), damit die Pixel scharf bleiben.
- Licht: eine Dunkelheits-Ebene, aus der jede Lampe ein weiches Loch radiert, plus additiver Lichtschein.
  Der Nebel liegt *unter* der Dunkelheit und glüht deshalb um die Laternen herum auf.
- Die Oberfläche (Dialoge, Notizbuch) ist HTML/CSS über dem Canvas, damit Text bei jeder Größe scharf ist.

```
src/
  main.js                 Start, Skalierung, Spielstand
  core/GameState.js       Regeln: Quellen, Ansehen, Aufträge, Bedingungen (ohne Phaser, in Node testbar)
  world/WorldScene.js     Orte, Figuren, Bewegung, Interaktion, Reisen
  world/Lighting.js       Nachtlicht
  world/textures.js       Platzhalter-Pixelgrafik, prozedural erzeugt
  ui/Ui.js, style.css     HUD, Dialoge, Notizbuch, Stadtkarte, Enden
  data/
    campaign.json         Start, Ränge, Reiseziele, alle Figuren
    quests.json           Haupt- und Nebenaufträge mit Schritten
    case_01.json, ...     Informationen, Hinweise (Quellen), Schlussfolgerungen, Enden
    maps/*.json           Orte als Zeichenraster + Objekte + Figuren
    dialogues/*.json      Dialogbäume
tests/                    `npm test`: Datenprüfung + beide Fälle über die echten Dialoge durchgespielt
```

### Inhalte bearbeiten

Alles Inhaltliche liegt als JSON in `src/data/`. Bedingungen funktionieren überall gleich
(Dialogoptionen, Startknoten, Objekte, Sperren): `requires_clues`, `requires_facts`,
`requires_likely` (≥ 2 Quellen), `requires_conclusions`, `requires_certain`, `requires_flags`,
`requires_honor`, `max_honor`, `requires_quests_active`, `hide_if_*`. Effekte genauso:
`gives_clues`, `sets_flags`, `start_quests`, `complete_quests`, `honor`, `ending`.
`npm test` meldet kaputte Verweise und prüft, dass beide Fälle lösbar bleiben.

### Echte Pixel-Art einbauen

Die Grafik ist bewusst Platzhalter und wird zur Laufzeit erzeugt. Die Maße
entsprechen schon den Vorgaben für echte Assets: Tiles 16x16, Figuren 16x32,
Lauf-Sheets 64x128 (4 Frames × Reihen unten/links/rechts/oben), Props auf 16er-Raster.
Ein PNG kann also später einfach die erzeugte Textur gleichen Namens ersetzen
(z. B. in `public/assets/` ablegen und in der Szene laden statt erzeugen).

## Deployment (GitHub Pages)

Der Workflow `.github/workflows/deploy.yml` testet und baut jeden Pull Request
und veröffentlicht `main` auf GitHub Pages. Einmalig nötig:
**Repository → Settings → Pages → Source: „GitHub Actions“**.

## Alter Stand

Das frühere 3D-RPG (Godot, „Baldur's Gate“-inspiriert) steckt vollständig in
der Git-Historie (letzter Commit vor dem Umbau: `673ace7`).
