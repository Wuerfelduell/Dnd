# Online-Koop (erste Fassung)

Zwei Rechner, ein Spielstand: Der **Host** spielt Spieler 1 auf seinem Spielstand, der **Gast** steuert Spieler 2 übers Internet.
Im Spiel selbst gilt alles vom lokalen Koop (eigene Figur, eigenes Inventar, eigener Pfad, Kampf zu zweit, Splitscreen in Calderwick).

## So geht's

1. Host: im Spiel `Esc` → **Online zu zweit** → **Raum öffnen**. Ein Code aus fünf Zeichen erscheint (z. B. `K7QMR`).
2. Gast: Hauptmenü → **Zu zweit spielen** → **Online beitreten** → Code eintippen → **Beitreten**.
3. Sobald die Verbindung steht, wird Spieler 2 beim Host automatisch hinzugefügt. Der Gast sieht das Bild des Hosts.

Steuerung des Gastes (wie Spieler 1): `WASD`/Pfeile laufen · `E` handeln · `Q` Geistsicht · `I` Inventar · `J` Notizbuch ·
`P` Pfad · `1`–`9` Welt-Fähigkeiten · `0` Gestalt · `R` Ausrüstungs-Set · Kampf: `E` Takt, `Leertaste` ausweichen, `F` parieren,
`1`–`4` Menü · Fenster: Maus oder Tasten · Gamepad wie im lokalen Koop.

## Technik

- `src/net/Signal.js`: Treffpunkt über **Supabase Realtime Broadcast** im Projekt *Diceduel* (Würfelduell). Kanal
  `nebelakten-koop-<CODE>`, **keine Tabellen, keine Migrationen**, nur der öffentliche *publishable key* (`src/net/config.js`).
  Über den Treffpunkt laufen nur die paar Nachrichten zum Verbindungsaufbau (join, offer, answer, ice).
- `src/net/Online.js`: danach eine **direkte WebRTC-Verbindung**. Der Host schickt sein Spielbild (Canvas 480×270 als Video,
  bis 2,5 Mbit/s) und den Inhalt seiner Oberfläche (`#ui` als HTML, gedrosselt auf ~14/s; der Gast gleicht seine Kopie Knoten für
  Knoten an, `src/net/morph.js`). Der Gast schickt Tasten, Gamepad und Klicks.
- `src/net/keys.js`: übersetzt die Tasten des Gastes beim Host in die Tasten von Spieler 2 (Pfeile, Enter, Ziffernblock), je
  nachdem, ob gerade Welt, Kampf oder ein Fenster offen ist. Der Host entscheidet alles (host-authoritative), es gibt keinen
  zweiten Spielstand.
- Während der Gast verbunden ist, steuern die Pfeile/Enter/Ziffernblock des Hosts Spieler 2 nicht mehr, und im Kampf zu zweit
  kann der Host nicht für Spieler 2 wählen (und umgekehrt).
- Test ohne Internet: `?netlocal=1` an die Adresse hängen, dann läuft der Treffpunkt über einen BroadcastChannel (zwei Tabs im
  selben Browser).

## Grenzen dieser Fassung

- **Ton nur beim Host.** Der Gast hört nichts.
- **Direkte Verbindung nötig.** Über öffentliche STUN-Server klappt das in den meisten Heimnetzen. Hinter strengen Firmen-,
  Schul- oder Mobilfunk-Netzen (symmetrisches NAT) kommt keine Verbindung zustande; dann erscheint ein Hinweis. Abhilfe wäre
  später ein TURN-Server.
- **Bild des Hosts.** Der Gast sieht genau den Bildschirm des Hosts (wie bei „Remote Play Together“), auch Fenster, die der Host
  öffnet. Die Sprache der Oberfläche ist die des Hosts.
- **Verzögerung.** Tasten des Gastes kommen mit Netz-Laufzeit an (meist 30–120 ms); bei Takt-Treffern im Kampf spürbar.
- **Klicks ins Spielbild** (hintippen zum Laufen) und Textfelder (Suche im Notizbuch/Bestiarium) gehen beim Gast nicht. Tooltips
  beim Überfahren mit der Maus zeigt nur der Host.
- **Splitscreen-Fenster:** Im geteilten Bild gehen beim Gast Zahlen, Enter und Esc an seine Hälfte; andere Buchstaben in Fenstern
  (z. B. `G`) landen in der Hälfte von Spieler 1.
- Ein Raum nimmt genau einen Gast. Trennt sich der Gast, bleibt Spieler 2 im Spiel und der Raum offen.
- Supabase Free: Realtime-Kontingent wird nur beim Verbindungsaufbau genutzt (ein paar Dutzend Nachrichten je Sitzung).
