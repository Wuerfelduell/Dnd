# Kampffiguren der Rivalen (Sequenz 9–5) und Kopfgeldjäger

Erzeugt mit `python3 tools/art/rivalen/rivalen.py` (Pillow, pixelweise, deterministisch). Format wie die bisherigen Leihkörper:
288x240, Zellen 48x48, 6x5, Blick nach links. Reihen: idle 0–3, attack 6–11, special 12–17, hurt 18–20, defeated 24–27 (`manifest-rivalen.json`).
Palette: `manifest-halbgott.json`, dieselbe wie die Halbgott-Blätter, die die Rivalen ab Sequenz 4 tragen.

## Befund

- Alle Rivalen der Sequenzen 9–5 (zehn Pfade, beide Spieler, 100 Kämpfe) kämpften mit denselben drei Leihkörpern:
  Gleisplünderer (Seq 9–7), Moorhehler (Seq 6) und Staubschmuggler (Seq 5). Der Pfad war nicht zu erkennen.
- Die Kopfgeldjäger trugen Leihkörper (Dunscar: `k3k_*`). Die in Calderwick und Briarholt trugen sogar Halbgott-Blätter eines falschen Pfads
  (z. B. der Schlüssel-Jäger Rutger Pell im Kessel-Blatt, die Waage-Jägerin Tilde Wilk im Eisen-Blatt).

## Die zehn Figuren (je Pfad ein Rivale)

| Pfad | Rivale | erkennbar an | Angriffswirkung |
|---|---|---|---|
| Laterne | Corvin Ashby | Zylinder, Laterne | Lichtball mit Strahlen |
| Schlüssel | Nell Quist | großer Messingschlüssel, Schlüsselbund | türkise Schlossglyphe |
| Echo | Petra Sandor | Krempenhut, Schallbögen schon im Stand | Schallwellen |
| Maske | Silas Morrel | Porzellanmaske, Kapuze | geworfene Maskengesichter |
| Faden | Mirela Stroud | Fäden an den Fingern, Spule | peitschende Fäden |
| Uhr | Tobias Merrin | Taschenuhr an der Kette | Zifferblatt mit Zeigern |
| Waage | Ottoline Brack | Balkenwaage | goldene Gewichte |
| Eisen | Garrick Holm | eiserne Faust, Schulterplatte, Kette | Funken |
| Kessel | Bram Sutter | Phiolen-Bandelier | türkiser Spritzer |
| Moor | Fenna Caddow | Moostuch, Schilfstab | Moorranken aus dem Boden |

Ruhe (4 Frames, Atmen) und Angriff (6 Frames: Bereitschaft, Ausholen, Ausholen voll, Stoß, Wirkung, Erholung) sind eigens gezeichnet.
Spezial (Angriff mit voller Wirkung), Treffer (Rückstoß, erster Frame aufgehellt) und Niederlage (Zusammensinken) sind aus denselben Posen abgeleitet,
damit der Kampfablauf vollständig bleibt.

**Kopfgeldjäger:** Je Pfad gibt es eine Jäger-Fassung (`enemy_kgj_<pfad>`) aus demselben Generator: Staubmantel, breite Krempe, Steckbrief am Gürtel,
Pfadgegenstand und Wirkung bleiben. Die Fassungen sind abgeleitet und keine eigenen Figuren. Zwei Jäger desselben Pfads (z. B. Mara Harrow und Aldo Thorne, beide Eisen) teilen sich ein Blatt.

## Einbau

- `src/data/rivale.js`: Seq 9–5 → `enemy_rv_<pfad>`, ab Seq 4 weiter `hg_battle_<pfad>`.
- `src/data/kopfgeldjaeger.js`: jeder Jäger → `enemy_kgj_<eigener Pfad>`.
- `src/world/assets.js`: `RIVALEN_PFADE`, `BATTLE_SHEETS`, `manifestRivalen` (geladen und in `BATTLE_MANIFESTS`).
- Test: `tests/rivalen_grafik.test.js`. Neue Spieltexte: keine.

## Sichtprüfung

1. Erste Fassung: Pfadgegenstände gut lesbar, aber dünne, steife „Papierpuppen“ neben den geduckten, kräftigen Vorlagen → verworfen.
2. Breiter Stand, gebeugte Knie, dickere Glieder, Gürtel, Revers, Glanzlicht. Die Wirkung lag beim Stoß teils außerhalb der Zelle → Stoßpunkt nach innen versetzt.

Die Figuren sind schlichter schattiert als die gemalten k3k-Körper, haben aber dieselbe Größe, Haltung und Lesbarkeit (`neben_vorlagen.png`).

## Offen

- Spieler 2 hat eigene Rivalen (name2). Sie teilen sich das Blatt mit dem Rivalen desselben Pfads.
- Das Gefolge der Rivalen (`rivale_gefolge_*`) trägt weiter Leihblätter.
