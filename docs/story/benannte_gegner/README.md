# DJ · Benannte Gegner

Dieses Paket liefert 24 einmalige Varianten, je vier für Kettlegate, Wexmoor, Dunscar, Calderwick, Briarholt und Varrowmouth. Es verändert keinen Spielcode. `gegner.json` erweitert das bestehende Encounter-Objektformat; neue Felder sind ein Anschlussvertrag, keine bereits wirksame Engine-Funktion.

## Inhalt und Abhängigkeiten

- `gegner.json`: Herkunft, Fundort, Faktoren, Angriffe, feste Beute und Einmaligkeitsflags.
- `bestiarium.json`: 24 eigene Seiten mit je vier Sätzen Vorgeschichte und konkreter Schwäche.
- `auftritt.json`: je zwei Auftrittszeilen und eine Fallzeile, zwölf Gerüchte und sechs Sichtungsmeldungen.
- `beute.json`: acht neue Einzelstücke und acht Artefakte mit den Textfeldern aus CR; zusätzlich Chance, Lohn und Auftragsvertrag.
- `pruefen.mjs`: Mengen, IDs, Verweise, Texte, Faktoren und berechnete Werte; optional `--art` für die Grafikverweise.
- `public/sprites/manifest-benannte.json`: ausschließlich DJ-Dateien, Animationen und Regionen.

Die Quellen stehen je Gegner in `grundlage_quelle`; der gelesene Git-Stand steht in `docs/art/batch-benannte-generation.json`. CR wurde zusätzlich in PR #285 gelesen. CU wurde in PR #291 gelesen; CZ ist noch nicht geliefert. Beide Pakete fehlen auf diesem main-Ausgangsstand: Die vier `vme_*`-Grundlagen und `vm_*`-Orte sind feste Vertrags-IDs aus `codex_CZ_varrowmouth_gegner.md` und CU PR #291. Ihre numerischen Basiswerte sind bewusst nicht erfunden; `ableitung` beschreibt die Auflösung nach CZ. Der Prüfer meldet diese vier Abhängigkeiten ausdrücklich. Vor einem Laufzeiteinbau muss er mit `--strict-dependencies` ohne diese Meldung bestehen.

Die Glasmöwe stammt technisch aus Wexmoor, wird hier als einzelne benannte Ausnahme im Kettlegate-Kraterwald verwendet. Die Varianten behalten ihre ausgewiesene Grundlage. `zone` nennt den bevorzugten Fundort; `erscheinen.zonen` enthält alle zulässigen Fundorte. Damit sind alle auf dem Quellenstand bekannten Gefahrengebiete der sechs Städte abgedeckt: fünf in Wexmoor, vier in Dunscar, vier in Calderwick einschließlich Landstraße, drei in Briarholt jeweils kalt/warm sowie drei aus CU. Grubenlicht-Mutter, Schaffner und Bremser können jeweils in zwei Gebieten auftauchen, bleiben aber dieselbe einmalige Begegnung. Die warmen Briarholt-Zonen sind alternative Zustände, keine zusätzlichen Gegner.

## Erscheinen und Speichern

1. Der Host prüft Ort, Ankunftsflags, Zeit/Gezeit und den dauerhaften Siegstatus. **Ab Sequenz 6** bedeutet im Spiel Fortschritt 6 → 5 → … → 1, also numerisch `1 <= sequenz <= 6`. Sequenz 7–9 ist ausgeschlossen. Das ist keine numerische `>= 6`-Prüfung.
2. Pro Kombination aus Spielstand, Gegner-ID, Zone, Spieltag und Nacht- bzw. Gezeitenfenster gibt es genau einen Zufallswurf mit Chance 0,10. Ergebnis und Schlüssel werden gespeichert, bevor der Gegner sichtbar wird. Menüwechsel, Laden und Kartenwechsel würfeln nicht erneut. Nicht erfüllte Voraussetzungen verbrauchen keinen Wurf.
3. Teilen sich mehrere Varianten eine Zone, werden nur unbesiegte, gültige Kandidaten geprüft; erfolgreiche Kandidaten kommen in eine gespeicherte Reihenfolge. Höchstens einer erscheint je Zone gleichzeitig; zusätzlich reserviert der Host jede Gegner-ID global, damit dieselbe Variante nicht an zwei Fundorten zugleich erscheint. Das erhöht nicht die individuelle Chance. Nach Abschluss oder Verlassen wird der nächste Erfolg erst beim erneuten Betreten sichtbar.
4. Sichtung setzt `<id>_gesichtet`. Flucht und Niederlage setzen **kein** Siegflag und geben keine Beute. Ein Gegner, den du gesehen und verlassen hast, bleibt für dasselbe Fenster als derselbe Kandidat gespeichert. Ein Zeitwechsel entfernt keine bereits begonnene Begegnung.
5. Sieg setzt `<id>_besiegt`, entfernt alle Instanzen und vergibt exakt einmal ein Stück aus `beute_fest`. Flag, Beute und Bestiarium-Fortschritt werden atomar gespeichert. `loot.drops` und `beute_fest` sind zwei Darstellungen derselben Belohnung und dürfen niemals doppelt ausgezahlt werden. `first_win` der Grundlage wird nicht übernommen.
6. Ein begonnenes Gefecht wird bei Gezeitenwechsel nicht abgebrochen. Nach Sieg/Flucht/Niederlage wird der gültige sichere Ausgang benutzt; keine Rückkehr auf inzwischen überschwemmte Felder. Für die drei Varrowmouth-Zonen bestätigt CU PR #291 den sicheren Ausgang `vm_zollhafen/default`.

Alle Varianten sind fliehbar. Die zwei Nebelausweichzüge des Rattenkönigs sind ein Kampfmechanismus, kein Ende der Begegnung; HP bleiben erhalten, die Schwellen lösen je Kampf einmal aus. Weder er noch der Salzmann beschwören Grundgegner. Eine Fessel überspringt höchstens einen eigenen Zug und kann vor dessen Abschluss nicht erneuert werden. Gegnerschaden, Nerven-Schaden, Effekte und Rüstung werden jeweils nach den gewöhnlichen Parier-/Ausweichregeln abgewickelt; `nerves` gilt pro gelandetem Einzeltreffer, nicht zusätzlich zum gleichnamigen Dokumentationsfeld.

Die Grundwerte werden mit den angegebenen Faktoren multipliziert und aufgerundet. Die ersten zwei Grundangriffe bilden den Ausgangspunkt; `eigenheit` überschreibt ausdrücklich widersprechende Grundmechaniken. Der leise Wächter ist die benannte Ausnahme: sein Lebensschaden ist null, seine Treffer wirken nur auf Nerven. Faktoren sollen nicht noch einmal auf die bereits berechneten Zahlen angewendet werden. Artefaktwirkungen und Gegnereigenheiten benötigen beim Einbau eigene Handler; ihre Textbeschreibung allein aktiviert sie nicht.

## Bestiarium und Darstellung

Eine Sichtung öffnet eine eigene Seite mit 64×64-Bild, 24×24-Kopf, Name, Geschichte und Schwäche. Sieg ergänzt das Besiegt-Symbol und die feste Beute. Die fünf Symbole stehen im Streifen in der Reihenfolge gesichtet, besiegt, Beute, neue Seite, Fasserin-tauglich. Auftritt: acht 96×96-Frames, unbeschriftetes Schild; der Name wird als lokalisierter UI-Text separat gesetzt, niemals ins PNG geschrieben.

Beim Zollgeist enthält der Export eine neutrale Maskenfläche. Beim Einbau wird dort das aktuelle Spielerporträt eingesetzt (Solo Spieler 1, Koop stets Spieler 2). Das gilt unabhängig davon, wen der Gegner angreift. Für Bestiarium und Kopf ist dieselbe Ersetzung erforderlich; die neutralen PNGs sind keine Behauptung eines passenden Spieler-Gesichts.

Kampfzellen folgen den vorhandenen Grundblättern, einschließlich 96×96 für Rattenkönig, Schwellenhund und Vorhauer. Fünf Reihen: idle, attack1, attack2, hurt, defeated, je sechs Frames. Die ersten beiden Ausholframes sind identisch. Kartenblätter haben vier Richtungen und vier Bewegungsframes. Der Export und die Prüfung dokumentieren Geometrie, Alpha und Palette; die Vorschau dient zusätzlich der Sichtprüfung.

## Koop

Die höher entwickelte Sequenz bestimmt das bevorzugte lebende Ziel: **kleinere Sequenznummer gewinnt**, Gleichstand Spieler 1. Bei Ausscheiden wird auf den anderen lebenden Spieler umgestellt; nach jedem gegnerischen Zug wird neu geprüft. Explizite Mehrziel- oder Wechselattacken der Eigenheit überschreiben diese Vorauswahl nur für diesen Angriff. Das Gesicht des Zollgeists bleibt trotzdem Spieler 2.

Einmaligkeit und Sichtung gelten für den gemeinsamen Kampagnenspielstand. Es gibt zusammen genau ein festes Beutestück, nicht eines je Client. Der Host ordnet es vor dem Sieg dem bevorzugten Ziel als Besitzer zu; bei vollem Inventar bleibt eine persistente Abholbelohnung. Verbindungsabbruch, erneutes Verbinden und wiederholte Siegmeldungen vervielfachen die Beute nicht. Ein neues Solo-Spiel hat einen eigenen Fortschritt, importiert aber keine Beute aus dieser Vergabe.

## Fasserin-Aufträge

Die acht `bnl_*` sind die einzigen neuen Rohstücke. Die übrigen 16 festen Drops verweisen auf bestehende Items. Jede neue Beute ist genau einer Variante zugeordnet und ergibt ausschließlich ihr `fa_bnl_*`-Artefakt. Chance und Haken werden vor Annahme gezeigt. Ein Stück plus Lohn wird abgegeben; Abholung beim nächsten Treffen desselben Zirkels, auch durch dessen Gastgeber, auch wenn Oda fehlt. Zwei offene Aufträge je Besitzer als CR-Anschlussvertrag. Ein verpasstes Treffen lässt den Auftrag liegen.

Der Erfolg wird beim ersten Abholen einmal gewürfelt und dauerhaft an die Auftrags-ID gebunden. Misserfolg verbraucht das Stück und erstattet genau einmal den halben Lohn. Die neuen Stücke sind nicht nachfarmbar; auf diese Endgültigkeit muss die Auftragsbestätigung hinweisen. Die hier festgelegten Chancen sind 40–70 Prozent und gelten pro Auftrag, nicht pro Abholversuch. Die Fassung wirkt nur beim Besitzer, nicht automatisch bei beiden Koop-Spielern. Prozentwerte in den Wirkungstexten sind explizite Vorschläge für den separaten Einbau.

CR enthält bislang nur Zirkel aus früheren Städten. Da Rückreisen nicht erlaubt sind, muss der Einbau Oda/Gastgeber-Aufträge in Calderwick, Briarholt und Varrowmouth verfügbar machen, bevor dortige `bnl_*` praktisch nutzbar werden. Dieses Paket erfindet keine neuen Zirkel-IDs und schaltet keine Reisen frei.

## Prüfung

```sh
node docs/story/benannte_gegner/pruefen.mjs
node docs/story/benannte_gegner/pruefen.mjs --art
python tools/art/benannte/check.py
# Nach Lieferung von CZ/CU:
node docs/story/benannte_gegner/pruefen.mjs --strict-dependencies
```
