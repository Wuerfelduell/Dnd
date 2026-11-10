# Einbauvertrag und offene Punkte

Stand: Aufgabenfassung vom 10.11.2026. BF liefert ausschließlich Inhalte in diesem Ordner. Ein erfolgreicher Datenprüfer ist keine Freigabe, die räumlichen Aufträge ohne Adapter zu aktivieren.

## Bestehendes Format und fremde Zuständigkeiten

Der aktuelle Inhalt verwendet Questobjekte mit ID als Schlüssel, `done.requires_flags`, `reward.gives_money` und direkte Dialogknoteneffekte. Diese Felder werden übernommen. Kein neues Spielschema und keine eigenen Gegenstände, Figuren, Begegnungen oder Karten. Sämtliche neuen Effektflags beginnen mit `koop_ds_`. Bestehende Fortschrittsflags werden ausschließlich gelesen.

`docs/story/k3_akte/rufmuster.json` benennt unter `gefunden_durch` **Hinweise** (`k3a_12_c1`, `k3a_14_c2`, `k3a_43_c1`, `k3a_54_c1`). Die vier Bedingungen stehen daher in `requires_clues`; keine gleichnamigen Scheinflags anlegen. Die Funde verraten in diesen Gesprächen keine neue Fährtenlösung.

`koop_aktiv` wird bereits von Party abgeleitet. Für laufende Aktionen trotzdem echte Anwesenheit, Bewusstsein und Spielerzuordnung prüfen. Keine Geschichte, Hauptflagge, Endentscheidung oder Bindung der jeweils anderen Person setzen. „Bindung zu Pfiff“ (`bond.k3_pfiff`) und persönliche Rufbindung sind verschiedene Zustände.

## Geplauder und Ereignisse

BF-Geplauder an `content.koop.geplauder` anhängen, die drei Kampfereignisse ergänzen. Gelesene IDs wie in AI speichern. Sichere Weltphase, beide Personen auf derselben Karte, 90 Sekunden Gesprächspause, einmal pro ID. Die aktuellspezifischen Gespräche vor den vier allgemeinen bevorzugen. Die frühen endabhängigen Zeilen sind Alternativen; sie müssen nicht in jedem Durchlauf verfügbar sein. Spätere Viertelgespräche gelten für alle Enden.

**Pfadprüfung:** 23–26 prüfen `requires_pathway` im Kontext von Spieler 2, unabhängig davon, wer läuft oder eine Interaktion auslöst. `Koop.pickChat` verwendet momentan `state.meets` ohne diesen besonderen Kontext. Beim Einbau anpassen; niemals den Pfad von p1 als Ersatz nehmen. Eigenständige Stimmen aus `p2Look()` bzw. `koopVoice()` übernehmen.

Kampfanlässe: `koop_schichtgaenger` ersetzt den gewöhnlichen Beginn gegen den lebenden Arbeiter; `koop_nachhall` gehört zur sichtbaren Wiederholung einer Partnerbewegung; `koop_pruefung` wird ausschließlich von der **zuschauenden** Person gesprochen. Der Prüfling kämpft allein. Diese Texte ändern weder Teilnahme noch Beute. Für getrennte Zutatenansprüche mit BG abstimmen.

Die fünf Partnersprüche je Stimme stehen als `koop_ds_partner_gebunden` in `bindung.json`, damit `kampf.json` genau die verlangten drei neuen Schlüssel enthält. Nur beim tatsächlichen Übergang des Partners in Bindung auslösen, nicht bei jeder Runde. Zustandsmeldung hat Vorrang vor gewöhnlichem Kampfgeplauder. Wie AI nur eine Zeile, vier Sekunden Pause, keine sprechende K.o.-Person.

## NPC-Einstiege

Zusatzschlüssel sind Dialog-IDs, keine NPC-IDs. `applyQuestPack` unterstützt diese Startknoten bereits.

| NPC | Dialog | Einstieg |
|---|---|---|
| k3_pfiff | k3a_pfiff | k3a_start |
| k3_gallowmere | k3a_gallowmere | k3a_start |
| k3_willa | k3a_willa | k3a_start |
| k3_oren | k3a_oren | k3a_start |
| k3_mabel | k3a_mabel | k3a_start |
| k3_pelham | k3a_pelham | k3a_start |
| k3_nellie | k3a_nellie | k3a_start |
| k3_huxford | k3a_huxford | k3a_start |
| k3_esther | k3a_esther | k3a_start |
| k3_adaine | k3a_adaine | k3a_start |
| k3_weichenstellerin | k3p_hedda | k3p_start |

Nur Pfiff setzt `koop_ds_koje`; es gibt weder Nervenprämien noch wiederholbare Belohnungseffekte. Zweite Koje ist ein Angebot im vorhandenen Wagen, kein automatisch erschaffener Schlafplatz. Figuren behalten ihre Sichtbarkeitsbedingungen. Bei Austritt p2 die Koop-Folge abbrechen; keine Hauptszene verdrängen.

## BN: stabile Text-IDs

`bindung.json` ist ein Textkatalog, keine neue Signals-Konfiguration. BN lädt die folgende Zuordnung ausdrücklich. Pro Präfix existieren `_p1_ruft`, `_p2_ruft`, `_warnung`, `_gebunden`, `_schleuse`. Die ersten beiden sind Zeilenfolgen im AI-Format. Warnungen haben die Stimmen `p1`, `p2a`, `p2b`; Zustand und Schleuse haben je Stimme eine Zeilenfolge. Bei Zustand/Schleuse bezeichnet der äußere Schlüssel die **gebundene bzw. gerade befreite Person**, nicht den Beobachter. Innerhalb der Zeilen wählt `a`/`b` die tatsächliche p2-Erscheinung.

| Horchstelle | Textpräfix |
|---|---|
| k3o_horch_drehscheibe | koop_ds_bindung_drehscheibe |
| k3o_horch_hund | koop_ds_bindung_hund |
| k3o_horch_vorhauer | koop_ds_bindung_vorhauer |
| k3o_horch_verteiler | koop_ds_bindung_verteiler |
| k3o_horch_bahnsteig | koop_ds_bindung_bahnsteig |
| k3o_horch_tiefe | koop_ds_bindung_tiefe |

Zusätzlich: `koop_ds_bindung_regel` = „Ein Gerät, zwei Sprecher; ein Befehl zählt einmal.“ sowie `koop_ds_partner_gebunden`. Die sechs Stations-IDs sind im Rufvertrag definiert, bislang keine sechs gleichnamigen Kartenobjekte. Nicht versehentlich neue Stationen aus diesen Texten erzeugen.

Vor Namensantwort Sprecher, Warnung und ausdrückliches Ja prüfen. BN verwaltet private Bindung und idempotente Befehle. Text allein setzt keine Bindung. Schleusenzeilen erst **nach** tatsächlichem Eintritt und persönlicher Befreiung ausgeben; ein Gespräch über die Schleuse befreit niemanden.

## Rollenadapter: gemeinsame Regeln

Die vier Objekte `koop_ds_horchen_p1`, `koop_ds_horchen_p2`, `koop_ds_schleuse_p1`, `koop_ds_schleuse_p2` gehören den genannten Personen. Ihre gleichnamigen Flags sind flüchtige Belegungen. `sets_flags` erst nach Akteur- und Positionsprüfung ausführen. Keine `done_flag` an Rollenobjekten. Normales Objektlesen genügt nicht.

Vor jedem konsequenten Dialogschritt beide Belegungen, aktuelle Karte, Rolleninhaber, aktive Quest und offene Abschlussflagge erneut prüfen. Auch pausierte Dialoge beweisen keine Anwesenheit. Auszahlungen nur atomar mit Abschluss; wiederholte Eingabe desselben Knotens ignorieren. `reward.gives_money: 0` verhindert die automatische zusätzliche Nebenquestprämie. Rohbeträge sind 40 bzw. 60 Schilling; globale Geldmodifikatoren gelten weiter.

Loslassen, Weggehen, K.o., Festnahme, normaler Kampf, Kartenwechsel, Abbruch, p2-Austritt und Laden löschen laufende Belegungen und Versuchszustände. Keine flüchtigen Flags aus einem Save wiederherstellen. Den Dialog schließen, später von vorn beginnen. Angenommene und abgeschlossene Aufträge sowie `koop_ds_hinterzugang` bleiben erhalten. Normale Ausgänge bleiben frei, solo weder Erfolg noch Auszahlung.

Die Schleusen-Gegner-Runden sind ausdrücklich **Dialogphasen**, kein normaler Kampf. Daher löschen sie nicht selbst die Rollen. Ein echter Kampf außerhalb dieser Inszenierung bricht den Versuch hingegen ab.

## Horchen: Ablauf und Rücksetzen

Vorschläge auf `ds_schwellenring`: p1 am vorhandenen Trichter (34,3), p2 am beobachteten Hinterzugang (40,3), Auswahldialog bei (34,4). Beide bleiben auf derselben Karte; p2 wechselt nicht ins Depot. Die zusätzliche Rolleninteraktion am vorhandenen Trichter phasenabhängig anbieten, nicht als zweites sichtbares Gerät stapeln. Radius höchstens 1,5 Kacheln, keine Wand dazwischen.

`k3o_horch_drehscheibe` bezeichnet die Station im AS-Rufvertrag. Bei `koop_ds_horchen_gesendet` genau **einmal** `signal: call` buchen. BN darf für denselben Befehl keine zweite Ladung abbuchen. P1 löst den Ruf aus, nur p2 liest `koop_ds_horchen_beobachtung`, danach wählt p1 eine von Norden/Osten/Westen. Richtig ist Osten. Auf gemeinsamem Bildschirm beschriftete Übergabe verwenden; Hinweis nicht vorab im Journal zeigen. Audioabschaltung ändert nichts an der sichtbaren Beobachtung.

Fehler/Abbruch löschen Rollen und `koop_ds_horchen_ruf_laeuft`; der eine verbrauchte Ruf bleibt verbraucht, kein weiterer Abzug und keine Nervenstrafe. Neuer Versuch erfordert einen neuen Ruf. Null Ladungen: kostenlos horchen oder zu Pfiff, der auf drei auffüllt. Ein laufendes Ruf-Flag darf nicht für spätere Richtungsversuche gespeichert werden.

Erfolg setzt ausschließlich den **zusätzlichen** lokalen Hinterzugang `koop_ds_hinterzugang`, gibt 40 Schilling und Pfiff-Vertrauen +1. AS/AR müssen die begehbare Verbindung mit diesem Flag verknüpfen. Nicht `k3a_14_geschlossen` oder andere AR-Fortschritte setzen; vorhandene öffentliche Tür und Hauptdeduktion bleiben unabhängig.

## Schleuse: Rollenwechsel, Bindung, drei Runden

Auftrag ab Akt IV im Speisewagen, Durchführung auf `ds_rufschlucht`. Vorgeschlagener Hebel innen (2,5), Sammelpunkt (2,6), Dialog (3,5), Splitter (8,5): genau sechs horizontale Kacheln; der aktuelle Korridor ist frei. Die räumliche Schleuse dort muss erst als sichere Nische inszeniert werden. Keine neue Karte nötig, keine vorhandene Gefahrenkarte pauschal sicher machen.

Beide bestätigen zunächst ihre personenbezogenen Rollenobjekte. Wahl `koop_ds_schleuse_p1_plan`: p1 geht hinaus, p2 hält bei (2,5). Wahl `_p2_plan`: p2 geht hinaus, p1 hält bei (2,5). Der Adapter weist danach die Positionen neu zu; die `_p1`-/`_p2`-Flags bleiben **Akteursflags**, nicht fest an die ursprüngliche Kachel gebundene Schalter. Für die gehende Person bedeutet gültige Rolle: im freigegebenen Korridor, richtiger Phasenschritt; für die haltende Person: Hebel gedrückt, Radius höchstens 1,5 Kacheln. Beide Belegungen müssen durchgehend gelten. Die unterschiedlichen Planknoten liefern andere Zeilen, anschließend ist der Ablauf symmetrisch.

Zusätzliche ausschließlich vom Adapter erzeugte flüchtige Flags:

| Flag | Verbindliche Quelle |
|---|---|
| koop_ds_schleuse_bindung_bestaetigt | BN bestätigt die private Bindung der **gehenden** Person nach deren eigenem Ja in `_zustimmung`; bereits bestehende Bindung nur nach dieser erneuten bewussten Bestätigung nutzen |
| koop_ds_schleuse_rueckkehr_geprueft | Direkter Rückweg beendet, Hebel weiter gehalten, Person innerhalb der Schleuse, zweite Runde beendet und dritte noch nicht ausgeführt; BN hat ihre Bindung tatsächlich gelöst |

Keines dieser Flags wird durch die JSON-Texte vorgetäuscht. Ohne Adapter bleiben die Erfolgspfade gesperrt. Der Prüfer setzt sie ausschließlich als explizite Annahmen eines erfolgreichen Adapterergebnisses.

1. Ausdrückliche private Zustimmung nur vom gehenden Spieler; Ablehnung ist kostenlos. Darauf erster Schritt auf (4,5): erste Gegner-Runde (`_runde_eins`).
2. Weiter auf (8,5): zweite Gegner-Runde (`_runde_zwei`). Greifen führt in `_rueckweg`; `_splitter` ist nur die provisorische Bergung. Keine dritte Runde für die reine Textanzeige.
3. Die Rückkehrchoice ist eine direkte Bewegung auf (2,5) **vor** dem nächsten Gegnerzug. Erst nach real geprüfter Rückkehr setzt der Adapter `_rueckkehr_geprueft` und darf den Erfolgsknoten bestätigen. Im UI diesen Rückweg als Aktion anbieten, nicht auf eine unerreichbare bereits erfüllte Bedingung warten. Ein Umweg führt stattdessen in `_zu_spaet` (dritte Runde), ohne Prämie.

`_p1_draussen`/`_p2_draussen`, `_runde1`, `_runde2`, `_splitter`, beide externen Prüfflags und beide Rollenflags verfallen beim Abbruch. Bei `_abbruch` und `_zu_spaet` zunächst die sichere Rückkehr darstellen und die persönliche Bindung über BN lösen; erst dann den entsprechenden Text ausgeben. Bei unerwartetem Austritt/K.o. nicht die Bindung per Flaglöschung heilen: der persönliche Zustand folgt dem normalen Rückkehr-/Schleusenvertrag von BN.

Der Trichterglas-Splitter wird bis zur erfolgreichen Rückkehr als Versuchszustand geführt und erst dann als bestehendes Item `k3o_trichterglas` gutgeschrieben. Daher entfernt ein Fehler niemals schon früher besessenes Trichterglas und dupliziert keinen Fund. Das bloße Fundobjekt vergibt nichts. Bei Erfolg einmal `k3o_stillring`, ein Splitter und 60 Schilling; persönliche Inventarzuweisung mit BG abstimmen (Bergung an gehende Person, Stillring an bestätigten Beuteempfänger). Kein neues `claim`-Feld in BF erfinden. Bei voller Tasche reguläre gesicherte Übergabe verwenden, Auszahlung und Zustellung zusammen quittieren.

## Abnahme vor Aktivierung

Beide p2-Stimmen und alle vier Wexmoor-Enden; fremder p1-Pfad bei passendem p2-Pfad und umgekehrt; alle elf bestehenden NPC-Einstiege; keine neuen Hauptstoryhinweise. Horchen richtig/falsch, null Ladungen, zweimal derselbe Befehl, p2 verlässt Platz bei offener Wahl, private Übergabe bei stummem Audio. Schleuse beide Rollenzuteilungen, jede Person sagt Nein, eine Bindung bleibt persönlich, Erfolg nach Runde zwei, Umweg in Runde drei, Abbruch ohne Verlust vorhandener Splitter. Solo-Laden, K.o., Festnahme und Austritt mit belegten Rollen; keine gespeicherten Belegungen; Rückweg bleibt offen. Wiederholte Auszahlungsklicks, volle Tasche und bestehender Stillring. Weder Koop-Erfolg noch Rollenwechsel ersetzt eine individuelle Sequenzprüfung.
