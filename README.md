# Nebelakten

Ein 2D-Pixel-Mystery im Browser: Top-down wie ein Farm-/Life-Sim, aber düster.
Nebel, Gaslaternen, eine viktorianisch-okkulte Großstadt. Im Mittelpunkt stehen
Ermitteln, Gespräche und das Verknüpfen von Hinweisen, nicht Kämpfe.

![Screenshot](docs/screenshot.png)

**Stand:** spielbarer Prototyp mit einem kompletten kleinen Fall,
*„Die erloschene Laterne“* (ca. 10 Minuten, drei mögliche Enden).

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
- **Geistsicht** macht okkulte Spuren sichtbar. Sie zehrt an den **Nerven**;
  bei 0 reißt dich ein Kopfschmerz heraus, danach erholen sie sich langsam.
- **Verknüpfen**: Im Notizbuch kombinierst du zwei Hinweise zu einer
  **Schlussfolgerung**. Manche Gesprächsoptionen tauchen erst mit dem passenden
  Hinweis oder der passenden Schlussfolgerung auf.
- **Auflösung**: Wenn du glaubst, es zu wissen, sprich mit der Polizei. Welche
  Antworten du geben kannst, hängt von deinen Schlussfolgerungen ab.

## Technik

- [Phaser 3](https://phaser.io) (2D-Engine, WebGL) + [Vite](https://vitejs.dev) (Dev-Server & Build).
- Spielauflösung 480x270, ganzzahlig hochskaliert (960x540, 1440x810, …), damit die Pixel scharf bleiben.
- Licht: eine Dunkelheits-Ebene, aus der jede Lampe ein weiches Loch radiert, plus additiver Lichtschein.
  Der Nebel liegt *unter* der Dunkelheit und glüht deshalb um die Laternen herum auf.
- Die Oberfläche (Dialoge, Notizbuch) ist HTML/CSS über dem Canvas, damit Text bei jeder Größe scharf ist.

```
src/
  main.js               Start, Skalierung, Verdrahtung
  core/GameState.js     Spielzustand & Regeln (ohne Phaser, in Node testbar)
  world/StreetScene.js  Karte, Figuren, Bewegung, Interaktion
  world/Lighting.js     Nachtlicht
  world/textures.js     Platzhalter-Pixelgrafik, prozedural erzeugt
  ui/Ui.js, style.css   HUD, Dialoge, Notizbuch, Enden
  data/case_01.json     Der komplette Fall: Karte, Hinweise, Dialoge, Enden
tests/                  `npm test`: prüft Falldaten und Spiellogik
```

### Einen Fall bearbeiten

Alles Inhaltliche steht in `src/data/case_01.json`: die Karte als Zeichenraster
(Legende in `map_legend`), Hinweise, Schlussfolgerungen (welche Hinweis-Paare
zusammengehören), Figuren, Dialogbäume und Enden. Dialogoptionen können mit
`requires_clues`, `requires_conclusions` und `hide_if_clues` an den
Ermittlungsstand gebunden werden. `npm test` meldet kaputte Verweise.

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
