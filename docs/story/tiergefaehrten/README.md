# DF – Tiergefährten

Lieferung für den separaten Einbau: fünf JSON-Dateien, Prüfung und 20 PNGs im
Manifest `public/sprites/manifest-tiere.json`. Kein Spielcode geändert.
Dialoge nutzen `start`, `nodes`, `text`, `choices`, `next`, `effects` wie vorhandene
Packs. `tier_claim`, aktive-Tier-Bedingungen und Mechanikfelder sind neue,
ausdrücklich vorgeschlagene Adapterverträge, keine bereits ausführbaren Effekte.

## Fund und Bindung

| ID | Name | Bestehende Karte | Fund |
|---|---|---|---|
| tier_rabe | Kessel | sternwarte | Etui aus Regenrinne, danach Angebot |
| tier_kater | Rußfleck | wx_salzmarkt | Maud Keel (`wx_pfandleiherin`) |
| tier_hund | Pegel | ds_endbahnhof | Bank, verschwundener Schaffner |
| tier_ratte | Siebzehn | cw_witwenterrasse | Fracht aus dem Rattenkönig-Erbe |

Je Fund zehn Textknoten einschließlich eines Entscheidungsknotens und zweier
Enden. Ablehnen ist Aufschub und setzt kein Fundflag. Keine Geld-/Futterhürde,
kein Kampf und keine Voraussetzung aus einer möglicherweise verpassten Quest.
Etui, Fahrplan und Frachtpapier sind Szenenrequisiten, keine erfundenen Item-IDs.
Einbau platziert einen kollisionsfreien Interaktionspunkt nahe dem genannten
Objekt; es werden bewusst keine ungeprüften Kartenkoordinaten festgeschrieben.
Keine Rückreise wird hier freigeschaltet; späterer Wiederbesuch folgt Paket DK.

Flagkonvention: `<tier-id>_gefunden` und `<tier-id>_stufe`, also
`tier_rabe_gefunden`, **nicht** `tier_tier_rabe_gefunden`. `tier_aktiv` enthält
null oder genau eine Tier-ID je Spielerprofil. Stufe ist eine Ganzzahl 0–3.
Neue persistente Felder: `tier_owner[tierId]`, `tier_bond_points[tierId]`,
`tier_last_feed_day[tierId]`, `tier_day_uses[tierId,dayId]`,
`tier_pending_gift[tierId,dayId]`, `tier_battle_uses[tierId,battleId]`.
Diese Felder werden mit dem Spielstand gespeichert, nicht aus Uhrzeit/UI abgeleitet.

`tier_claim` prüft Besitzer und setzt Fundflag, Besitzer und Stufe 0 atomar.
Ist noch kein Tier aktiv, folgt das neue Tier sofort. Sonst wartet es im Büro;
ein Fund ersetzt niemals heimlich den aktiven Begleiter. Ein erneutes Lesen des
Annahmeknotens darf weder Besitzer noch Beziehung oder Tageszähler zurücksetzen.

## Folgen, Warten und Koop

- Ein Tile Abstand hinter dem Spieler, kollisionsfrei; niemals Türen oder NPCs blockieren.
- Bei Kartenwechsel an einen freien benachbarten Tile teleportieren. Fehlt ein
  sicherer Platz, Darstellung bis zum nächsten freien Tile ausblenden.
- In Gefahrengebieten versteckt sich das Tier: kein Following-Sprite und keine
  Kartengaben. Wieder sicher: Follow und Fähigkeiten ohne Kosten wieder aufnehmen.
- Tiere sind nie Kampfeinheiten: keine HP, keine Zielauswahl, kein Schaden, Tod,
  Verlust oder Unterhalt. Der ausdrücklich gewünschte Kampf-Cut-in ist eine
  sichere Hilfsaktion und funktioniert auch bei Kämpfen in Gefahrengebieten.
- Wechsel nur im Büro bzw. der DG-Unterkunft; alle anderen Tiere warten dort.
  Hier liegen je Tier zwei Propzustände (leer/besetzt), keine DG-Möbel ersetzen.
- Koop: max. ein aktives Tier je Spieler, global ein Besitzer je Tier. Die
  Autorität reserviert `tier_claim` und Büro-Übergaben atomar; bei gleichzeitigem
  Zugriff gewinnt die erste bestätigte Transaktion. Ein Eigentümer kann ein Tier
  nur im Büro freigeben; kein Kopieren beim Laden, Beitreten oder Trennen.
- Nach Trennung wartet das Tier des abwesenden Spielers im Büro. Es wird nicht
  automatisch dem Host zugeordnet. Gleichzeitige Wiederverbindung stellt die
  bestehenden IDs/Zähler wieder her. Stufe gehört zum Tier, nicht zur Sitzung.
- Gegner-Zugsperren und Schadensschutz nicht stapeln. Beide Spieler können
  verschiedene Tiergaben nutzen; Nerven/Schutz beziehen sich auf den Besitzer.

## Beziehung und Futter

`beziehung.json` enthält je Tier drei gern genommene vorhandene Nahrungs-IDs
und eine ungern genommene. Referenzen zeigen auf echte Dateien und JSON-Pfade.
Gern: ein Item verbrauchen, +1 Punkt, höchstens einmal je Tier und Spieltag.
Schwellen 0/2/5/9 → Stufen 0/1/2/3; maximal neun Punkte, niemals Abstieg, Hunger oder Strafe.
Ungern: gemeinsame Ablehnungszeile aus `feeding.dislikedMessage`, kein Itemverbrauch,
keine Punkte, kein Tagesverbrauch. Unbekannte Items werden gar nicht angeboten.
Ab Stufe 3 endet der Fortschritt; weiteres Füttern bleibt optional und zeigt die
Stufe-3-Reaktionen, unter derselben Tagesgrenze und mit sichtbarer Kostenanzeige.

Die vorhandenen Nahrungs-IDs kommen teils erst in Wexmoor oder Festen vor.
Erwerb/Basisgaben sind deshalb ohne Füttern möglich. Für frühere Steigerung kann
der Einbau bestehende Nahrungs-IDs in Händlerbestände aufnehmen; DF führt keine
neuen Nahrungsgegenstände ein. Setzerbrot wird ohne eingebettete Letter gereicht.
Futtertexte sind Spielabstraktion. Sie sind keine Anleitung für reale Tierhaltung.

## Gaben und Eingriffe (Wertevorschlag)

| Tier | Kartengabe | Kampf, Stufe 0–2 |
|---|---|---|
| Kessel | Zugängliche, unentdeckte Hinweise im Chebyshev-Radius 3; ab Stufe 1: 4, ab 3: 5 | Ein nächster Gegnerzug fällt aus |
| Rußfleck | Ein Salzbrot am Tagesanfang; ab Stufe 1 Wahl Salzbrot/Verband, ab 2 zwei Stück | +8 Nerven bis Maximum |
| Pegel | Bereits generierte Reisefalle im nächsten bekannten Reiseabschnitt sichtbar; ab Stufe 1 zwei, ab 3 drei Abschnitte | Nächster direkter Treffer ×0,5, abrunden, mindestens 1 |
| Siebzehn | Eine gewöhnlich verschlossene, ausdrücklich `tier_openable` Kiste je Tag; ab Stufe 2 zwei | Ein zugelassener Beutegegenstand stehlen |

Alle vier: **ein** Eingriff je Kampf als Basis. Die ausdrücklich vorgeschlagene
Stufe-3-Verbesserung erlaubt **zwei**, weiterhin keine Stapelung derselben Wirkung.
Knopf „Tiergabe“ neben den Fähigkeiten, keine Spieleraktion als Zusatzkosten.
Die 6-Frame-Animation dauert bei 10 FPS 0,6 Sekunden; Effekt exakt einmal auf Frame 3,
nicht je Renderframe. Eingriff-ID/idempotentes Ereignis schützt vor Doppelaufruf.
Keine Ladung bei ungültigem Ziel, vollem Nervenwert, bestehendem Schutz oder fehlender
zulässiger Beute. Flucht/Wiederaufnahme desselben Kampfes behält die `battleId`
und verbrauchten Ladungen; nur ein wirklich neuer Kampf setzt das Kontingent zurück.
Stufenanstieg im Kampf ist ausgeschlossen. Ein geladenes Replay erzeugt keine Beute.

Kessel umgeht keine Zugangs-, Quest- oder Sichtbarkeitsbedingungen und sammelt nichts
ein. Marker 6 Sekunden, Wiederholsperre 10 Sekunden je Hinweis; ab Stufe 2 bis zum
Kartenwechsel. Zugsperre gilt für die nächste reguläre Aktion, nie für zwingende
Phasenwechsel. Bei Immunität ist der Knopf deaktiviert statt wirkungslos verbraucht.

Rußfleck erzeugt einen einzigen Tagesbeleg. Ist das Tier am Tagesanfang verborgen,
wird der Fund beim ersten sicheren Aufenthalt desselben Tages angeboten. Kein
Nachholen mehrerer ausgelassener Tage. Bei vollem Inventar wird genau dieser Fund
als `pending` gespeichert; Laden, Ablehnen oder Wechsel erzeugt keinen neuen.
Beim Stufenanstieg wird das Kontingent erst am nächsten Tag erweitert. Stufe 2
lässt die zwei Stück einzeln auswählen, zählt aber denselben Tagesbeleg.

Pegel zeigt Fallen, würfelt sie nicht neu und entfernt sie nicht. Eine erzwungene
Reise wird nicht verhindert. Ab Stufe 2 steht die vorhandene Fallenkategorie dabei.
Kampfschutz betrifft einen direkten gegnerischen Schadensevent, bei Mehrfachtreffern
nur den ersten; keine Selbstkosten, Zustands- oder Umgebungsschäden. Ein verfehlter
Angriff verbraucht den Schutz nicht; ungenutzter Schutz endet mit dem Kampf.

Siebzehn öffnet nur `ordinaryLock && tier_openable && !questLock && !occultSeal`.
Prüfung vor Animation und Verbrauch; die Kistenbeute bleibt unverändert. Ab Stufe 1
zeigt die Interaktion ihre Eignung vorab. Im Kampf ist die Beute vorab festgelegt,
ohne Questobjekte, einzigartige Artefakte oder Bossbelohnungen. Gestohlenes wird
atomar aus der Abschlussbeute entfernt. Inventar voll: pending statt Neuauslosung.
Ist kein erlaubtes Item verfügbar, ist der Knopf deaktiviert. Neue Konsumdaten
im JSON sind eine Spezifikation für den Einbau, keine Änderung der Kampfengine.

## Texte und Einbauabhängigkeiten

- `tiere.json`: 4 × 3 Beschreibungssätze, 10 Fundknoten, 8 Fütterzeilen,
  4 Gabenmeldungen, 4 Kampfmeldungen, 3 Bürozeilen, 2 Koopzeilen.
- `reaktionen.json`: 30 Stadtgerüchte (5 je Stadt) und 10 feste Figurenmeinungen.
  Tiernennungen nur beim passenden aktiven Tier; Figuren nur anwesend/lebend.
  `vme_zollgeist` ist der feste neue Varrowmouth-Sprecher aus dem Auftrag und
  benötigt beim Einbau eine friedliche Umgebungsbegegnung, keinen Kampfzwang.
- `zeitung.json`: 4 einmalige Meldungen nach Erwerb; bei späterem Erwerb im Archiv.
- `lesestuecke.json`: 4 Besitzertexte mit jeweils 100–150 Wörtern, am Tierplatz
  bzw. Tiermenü lesbar. Keine zusätzliche Zutat, kein neuer Gegenstand.
- Neue Felder/Flags oben, UI-Knopf, Reisenprüfung, Wegfindung, Tageswechsel und
  Save/Koop-Transaktionen implementiert ein späterer Einbau. DG-Unterkunft und
  Varrowmouth-Sprecher sind dokumentierte Paketabhängigkeiten.

Prüfen: `node docs/story/tiergefaehrten/pruefen.mjs` und
`python tools/art/tiere/check.py --write` (Pillow). Beide müssen fehlerfrei sein.
