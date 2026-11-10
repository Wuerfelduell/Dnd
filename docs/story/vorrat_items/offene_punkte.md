# Offene Punkte vor dem Einbau

## Vertrag mit dem aktuellen Code

Kein Spielcode wird mit BL geändert. Die Daten sind Vorrat, kein bereits spielbarer Ausbau. **Alle folgenden betroffenen Items müssen bis zur vollständigen Umsetzung gesperrt bleiben**, auch wenn einzelne Teilwirkungen schon unterstützt werden. Insbesondere darf kein Artefakt mit aktivem Vorteil und noch inaktivem Nachteil verteilt werden.

- `Gear.js` und `Artifacts.js` verwenden `boons`/`curses` mit `key`, `value`, `text`. Ein Text ohne `key` beschreibt hier eine geforderte, bislang fehlende Wirkung und wird vom aktuellen `passive(key)` ignoriert. Das ist kein neuer Effekt-Schlüssel. Vor der Integration durch echte implementierte Schlüssel ersetzen und beidseitig testen.
- Verbrauch nutzt im Bestand `heal`, `composure`, `calm`, `combat_only`, `damage`, `stun`, `cleanse`. Die Aufgabenbegriffe `nerves`, `unruhe`, `cure`, `revive` sind keine frei ergänzbaren Item-Felder. Terrassentee nutzt deshalb `composure`, Wurzelpastille `calm`. Unruheanstieg wird nicht als negatives `calm` getarnt, da dies bei Unruhe 0 nicht zuverlässig wirkt.
- Gegenstände ohne wirksame Verbrauchsfelder können heute trotzdem verbraucht werden. Erst mit Zielprüfung, Erfolgsrückmeldung und atomarem Verbrauch einbauen. Abbruch, ungültiges Ziel, voller Wert oder gescheiterte Freischaltung dürfen nichts kosten. Koop-Effekte müssen das ausgewählte Ziel prüfen, nicht still den aktiven Spieler verwenden.
- Waffen unterstützen derzeit `atk` und gegebenenfalls `occult`, aber keine Waffen-Taktung, Reichweite, einzelnen Trefferprofile oder Parade-Nachwirkung. Die Zielwerte stehen unten und in README; keine unerkannte Eigenschaft wurde in JSON erfunden.
- Die vier vorgeschlagenen Zustände `vi_oel_aktiv`, `vi_zollsiegel_bereit`, `vi_nebelkerze_aktiv`, `vi_feder_bereit` sind ausschließlich Spezifikation. Sie existieren noch nicht in Kapitel-Flags. Dauer, Ladung und Besitzer müssen gespeichert werden; Laden oder Ausrüsten darf nichts erneuern. Zeitbasierte Effekte pausieren in Menüs; Wiederholung ersetzt/restauriert höchstens die ursprüngliche Dauer, ohne Stapelung.
- Den Sozialbonus der Archivrobe unterstützt der Bestand nur als geringeren Ehrenverlust (`honor_loss: 0.7`), nicht als automatische Amtsberechtigung. Der zusätzliche Schlossbonus ist mechanisch vorhandene Archivarbeit, kein Zugang zu gesperrten Hauptfällen. Ein späterer Amtsdialog muss seine Zugangsregeln selbst prüfen.
- `fundstuecke.json` wird nicht automatisch als Pack-Datei geladen. Beim Einbau mit den Dialogen zusammenführen, Artefaktdefinitionen registrieren und das vollständige Itemregister genau einmal verwenden. Die derzeit leeren Standarddateien nicht mit anderen Paketen überschreiben.
- Drei Händler-IDs in `handel.json` sind reine Rollen ohne NPC oder Karte. Der Bestand kennt globale Verkaufspreise, keinen rollenspezifischen Ankauf. Die Rollen in README erst über spätere Handelszugänge umsetzen; BL setzt keine unbekannten NPC-Referenzen. Alle BJ-Verknüpfungen sind Textvorschläge.
- Keine neuen Hinweise, Wissenseinträge, Quests, Kernzutaten oder Fakten durch Kopieren erzeugen. Drei Erkenntnisse je Schlüsselstück sind Beobachtungen mit Grenzen. Die Pflanzenkapsel bleibt versiegelt; keine automatische Erinnerungseinpflanzung oder unterstellte Einwilligung. Calderwick-Kopien derselben Quelle sind keine unabhängigen Namensanker.
- BM besitzt Icons und Bildgestaltung. Untersuchen-Dialoge sind keine Grafikaufträge. Vor späterer Integration auf vorhandene BM-Dateien prüfen. BH-Trophäen sind nicht Teil dieser 72 IDs.

## Konkrete fehlende Wirkungen je Gegenstand

Die folgenden Werte sind der verbindliche Integrationsvorschlag. Wo `boons`/`curses` bereits unterstützte Werte enthalten, gelten diese zusätzlich; die Gesamtwirkung bleibt bis zur Umsetzung aller Teile gesperrt.

### `vi_hut_setzerkappe`

- Beim bestätigten Lesen eines Lesestücks 25 % weniger Nervenverlust; mindestens 1 bei einem ursprünglichen Verlust. Kein Schutz vor Gesprächs- oder Kampfkosten.

### `vi_hut_zylinder_vermesser`

- Bei einer bezahlten Reisebegegnung 20 % geringere Geldforderung, aufrunden; keine Änderung von Zeugen, Entscheidungen oder Beweisen.

### `vi_hut_fuhrmannshut`

- Wetterbedingte Nerven- und Tempomali auf Reisen entfallen. Keine allgemeine Schadensimmunität, keine Wirkung gegen gegnerische Angriffe.

### `vi_mantel_druckerschurz`

- 20 % weniger Schnittschaden, auf den eingehenden Schnittanteil vor Rundung. Kein Schutz gegen Dampf, Sturz oder Namenverlust.

### `vi_mantel_dampfmantel`

- 25 % weniger Hitze- und Dampfschaden; überlappende Kennzeichnungen zählen einmal. Kein Schutz gegen andere Schadensarten.

### `vi_amulett_pfirsichkern`

- Außerhalb des Kampfes alle 10 aktiven Spielsekunden +1 Leben bis zum Höchstwert. Menüzeit zählt nicht; Anlegen startet keinen sofortigen Heilimpuls. Der soziale Schwerpunkt ist geduldiges Zuhören, keine erzwungene Zustimmung.

### `vi_amulett_grenzsteinsplitter`

- Bei ausdrücklich fliehbaren Begegnungen +20 Prozentpunkte auf eine spätere Fluchtprobe, höchstens 95 %. Der Bestand kennt nur erlaubte/verbotene Flucht und braucht hierfür eine echte Probe; niemals einen Bossausgang stillschweigend öffnen.

### `vi_amulett_rohrpostkapsel`

- Einmal je Kampf den ersten schadensverursachenden Treffer gegen den Träger vollständig abwehren. Nur dessen Ladung verbrauchen; An- und Ablegen sowie Laden eines Spielstands geben keine zusätzliche Ladung.

### `vi_waffe_setzhaken`

- Tempo 120 %, Trefferfenster 110 % des Grundangriffs; ein Treffer mit Stärke 9. Schnell, aber kein zusätzlicher Zug.

### `vi_waffe_bleihammer`

- Tempo 80 %, Trefferfenster 90 %; ein Treffer mit Stärke 12. Keine zweite Schadenssteigerung über das Gewicht.

### `vi_waffe_veredelungsschere`

- Tempo 100 %, Trefferfenster 100 %; zwei Teiltreffer mit jeweils 50 % des gesamten Waffenschadens. Abwehr wird pro Aktion einmal verrechnet, nicht je Teiltreffer; keine Verdopplung der Stärke 10.

### `vi_waffe_dampfrohr`

- Tempo 90 %, Trefferfenster 100 %; Stärke 11 als Gesamtschaden, davon 30 % Hitze und 70 % Stoß. Keine kostenlose zusätzliche Brennrunde.

### `vi_waffe_kutschpeitsche`

- Tempo 110 %, Trefferfenster 105 %; Reichweite 2 statt 1 Nahkampfschritt. Gewinnt nur den ersten Initiativgleichstand; kein zusätzlicher Eröffnungsangriff.

### `vi_waffe_richterstab`

- Tempo 95 %, Trefferfenster 100 %; nach einer erfolgreichen Parade den nächsten Treffer derselben gegnerischen Angriffsfolge um 20 % mindern. Nicht stapelbar; verfällt am Ende der Folge.

### `vi_v_durchschlagpapier`

- Eine bestätigte Abschrift eines schon vorhandenen Hinweises erzeugen; nur dann 1 Blatt verbrauchen. Journalwissen bleibt erhalten. Die Kopie zählt ausdrücklich nicht als zweite unabhängige Quelle oder Namensanker.

### `vi_v_rohrpostmarke`

- Genau eine bereits freigeschaltete örtliche Rohrpostfahrt ohne Grundfahrpreis. Keine Sperren, Abgleiche oder Zufallsereignisse umgehen; Verbrauch erst bei bestätigter Abfahrt.

### `vi_v_pfirsichsud`

- Zusätzlich zur Heilung +8 Unruhe unmittelbar nach erfolgreicher Anwendung, auch ausgehend von 0; danach normaler Abbau. Kein negativer calm-Wert, dessen Ausführung bei 0 Unruhe übersprungen würde.

### `vi_v_dampfkompresse`

- Betäubung beim gewählten lebenden Verbündeten entfernen; kein Schaden, keine Heilung und keine zusätzliche Aktion. Nur verbrauchen, wenn Betäubung tatsächlich vorliegt; außer- und innerhalb des Kampfes dieselbe Zielprüfung.

### `vi_v_kurkarte`

- Einmal die Grundgebühr eines gewöhnlichen Kurbesuchs erlassen. Keine verschlossenen Behandlungsräume öffnen und keine Einwilligung ersetzen; Verbrauch erst beim bestätigten Eintritt.

### `vi_v_wegzehrung`

- Die Heilung ausschließlich an einem sicheren Reisehalt ermöglichen. Für sofortige Stadtheilung nicht freischalten; anhalten zählt als bewusste Aktion, nicht als Zeitfrist.

### `vi_v_laternenoel_klar`

- Geistsicht für 60 aktive Spielsekunden mit 25 % weniger Nervenkosten. Vorgesehene lokale Markierung vi_oel_aktiv; erneute Anwendung ersetzt die Restdauer, stapelt nicht. Menüzeit pausiert, Speichern erhält Restdauer; Ablauf löscht die Markierung.

### `vi_v_zollsiegel`

- Genau eine gewöhnliche Reisestreife vor ihrem Kampf umgehen. Vorgesehene Markierung vi_zollsiegel_bereit, Verbrauch und Löschung erst beim bestätigten Umgehen; verfällt bei Ende der nächsten Reise. Keine Fahndungs-, Boss- oder Hauptfallsperre aufheben.

### `vi_v_riechsalz_stark`

- Im Koop genau den gewählten bewusstlosen Verbündeten mit 20 % seines maximalen Lebens, mindestens 1, aufrichten. Kostet die normale Gegenstandsaktion; nur 1 Portion verbrauchen. Im Solo, ohne K.o.-Ziel oder nach Kampfende ohne gültiges Ziel keine Wirkung und kein Verbrauch.

### `vi_v_nebelkerze`

- Vorgesehene Markierung vi_nebelkerze_aktiv verhindert gewöhnliche Sichtentdeckung für den nächsten betretenen Raum. Endet bei Angriff, freiwilligem Alarm oder Verlassen dieses Raums; erneutes Zünden stapelt nicht. Kein Boss, Gespräch oder Hauptereignis wird ausgelassen.

### `vi_v_schlafpulver`

- stun ist der vorhandene technische Rundenaussetzer. Die Oberfläche nennt ihn bislang geblendet; vor Einbindung für dieses Pulver neutral oder schlafend benennen, ohne einen zweiten Schlafzustand zu erfinden.

### `vi_v_schreibfeder_eisen`

- Vorgesehene Markierung vi_feder_bereit: +10 Prozentpunkte auf die nächste ausdrücklich ausgewählte Verhörprobe, höchstens 95 %. Nach der Probe oder dem Verlassen des Gesprächs löschen. Vor Beginn eines Verhörs nicht verbrauchen; niemals Beweislage, Wissen oder Antwortwahrheit ändern.

### `vi_v_bitterwasser`

- Genau die Vergiftung des gewählten lebenden Verbündeten entfernen. Nicht mit Blutung oder Artefaktkorruption verwechseln; ohne Vergiftung kein Verbrauch. Erfordert einen vorhandenen Vergiftungszustand samt Abfrage und Heilpfad.

### `vi_art_das_leere_tuerschild`

- Nach erfolgreicher Flucht verlieren gewöhnliche Verfolger die persönliche Zielbindung bis zur nächsten eigenen feindlichen Aktion; kein Fahndungsabbau und kein Vergessen von Beweisen.
- Je abgeschlossenem Reisetag −1 Bindung bei genau einem bereits bekannten Kontakt mit positiver Bindung, deterministisch rotierend; bei leerer Auswahl keine neue Beziehung erzeugen. Nur mitgetragen, nicht eingelagert; kein Echtzeitverlust beim Lesen.

### `vi_art_der_erste_durchschlag`

- Einmal je Kampf den ersten bewusst bestätigten erfolgreichen eigenen Waffentreffer verdoppeln. Nur diesen Teiltreffer, keine ganze Mehrfachaktion; Verbrauch der Ladung erst bei Treffer, keine Aufladung durch Inventarwechsel.

### `vi_art_die_warme_postkarte`

- Am Ende jeder vollständigen Kampfrunde +3 Nerven, höchstens bis zum Höchstwert; kein Gewinn durch Menüs oder zusätzliche Teilaktionen.
- Jedes ausdrücklich bestätigte Lesen der Karte verursacht +6 Unruhe; nicht bereits das Öffnen des Inventars und nicht der Rückweg im Dialog.

### `vi_art_der_falsche_fahrplan`

- Auf einer freigeschalteten Schnellreise kein zufälliges Reiseereignis; fest angekündigte Hauptaktionen und gesperrte Routen bleiben unverändert.
- Beute aus optionalen Kämpfen und Reiseereignissen −20 %: Geld und Mengen gewöhnlicher Gegenstände abrunden, Einzelstück-Chancen mit 0,8 multiplizieren. Garantierte Beweise, Schlüssel, Questbelohnungen und Kernzutaten bleiben vollständig.

### `vi_art_die_gaertnerschnur`

- Rüstung −2, mindestens 0; nur im künftigen flachen Rüstungssystem. Nicht stillschweigend in einen Schadensmultiplikator umrechnen.

### `vi_art_der_stille_stempel`

- Bei einer ausdrücklich gewählten Verhörprobe +15 Prozentpunkte, höchstens 95 %; keine erzwungene Zustimmung und keine neuen Beweise.
- Bei endgültigem Abschluss eines Falls −5 Ehre, einmal je Fall-ID und unabhängig vom gewählten Ende; kein wiederholter Abzug beim Laden oder Lesen des Abschlusses.

### `vi_art_das_bremserseil`

- Der erste gegnerische schadensverursachende Treffer je Kampf richtet sich an den Träger und ist nicht ausweich- oder parierbar. Bei zwei Trägern feste Spielerreihenfolge; blockierende Rohrpostkapsel wird vor diesem Zwangstreffer nicht ausgelöst. Flucht selbst bleibt immer verfügbar.

### `vi_art_die_kurglocke`

- Zu Kampfbeginn schläft der Gegner eine Runde und setzt seinen ersten Zug aus; kein erneuter Schlaf durch Umlagern. Schlaf endet sofort beim ersten Schaden.
- Weckt Schaden den Gegner vor dem ersten ausgelassenen Zug, verursacht seine nächste vollständige Angriffsfolge doppelten Grundschaden; nach dieser Folge endet der Zorn. Bei natürlichem Erwachen ohne Schaden kein Zorn; die Warnung muss vor dem Angriff sichtbar sein.

## Abnahme der späteren Integration

Gezielt testen: Bonus und Preis jedes Artefakts im selben Zustand; Reihenfolge mehrerer getragener Artefakte; Koop-Besitz und Zielwahl; Laden mitten im Kampf; An-/Ablegen ohne zusätzliche Ladung; Menüpausen; Abbruch ohne Verbrauch; geschützte garantierte Beute; keine Schleifen durch erneutes Lesen. Das Bremserseil hat gegenüber der Rohrpostkapsel Vorrang für den garantierten ersten Gegnertreffer. Die Kurglocke kündigt den Zorn vor dem Angriff an. Waffen müssen einschließlich Tempo, Doppeltreffer und Rüstung noch einmal gegen die 1,25-Grenze geprüft werden; der Datencheck prüft heute nur die vorhandenen Angriffswerte.
