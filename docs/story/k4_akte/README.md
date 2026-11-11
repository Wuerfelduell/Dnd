# CC: Die Stadt ohne Unterschrift

Nicht eingebauter Inhalt für Kapitel 4 in Calderwick. Grundlage ist Geschichte 1 aus `../kapitel3/geschichte_1.md`, mit den vier Dunscar-Enden statt ihres alten Wexmoor-Anschlusses. BH/BJ/BL werden referenziert, nicht kopiert. 5 Hauptquests, 20 Fährten, 80 Hinweise zu 40 Fakten, 20 Deduktionen, 309 Dialogknoten, 22 Namensanker, 6 Abgleiche, 4 Enden, 18 bedingte Epilogtafeln und 9 Zeitungsmeldungen. Keine Änderungen an Spielcode oder Grafik.

| Akt | Die vier Fährten | Abschluss bei Klammer |
|---|---|---|
| I: Ein Teller zu viel | Leere Ankunft; Frau ohne Vertrag; Leerfracht; erster Abdruck | 25 Schilling, dauerhaft eingerichtete Werkstatt |
| II: Die geliehene Stadt | Namen im Pfand; Käufer der Abschriften; Idas Umweg; Blinder Zusteller | wiederverwendbares Rohrpostsiegel |
| III: Ein Titel bleibt | Namenloser Direktor; Versuchskeller; ganze Portion; Klammers Schublade | konservierter Originalsatz |
| IV: Unterschriften im Regen | Setzerin im Schaukasten; drei Erinnerungen; vierter Satz; Ausgangsfahne | Ida befreit, `bond: +2`, zusätzlich Vertrauensflag |
| V: Wer unterschreibt | Letzter Haushalt; offenes Fundament; Wetherbys Unterschrift; ein Name nach dem anderen | abschließende Bilanz, dann ausdrückliche Endwahl |

**Ablauf:** Das zum Dunscar-Ende passende Papier im Speisewagen lesen, mit Pfiff die Abreise bestätigen, am Gleisfuß Klammer folgen. Vier Quellen pro Fährte untersuchen, zwei gestützte Fakten im Notizbuch verbinden und den Schluss an der Fährtenstation bestätigen. Verhöre werden über Zusätze an die BJ-Alltagsdialoge angehängt. Jeder Akt endet bei Klammer. Erst die zweite Bestätigung an der Hauptpresse setzt das Ende.

**Abgleich ohne neuen Code:** An jeder beschrifteten Station zwei verschiedenartige Anker derselben Person vorlegen und Öffentlichkeit oder Vertraulichkeit wählen. Hauptaktionen lösen den Abgleich aus, Lesen nicht. Ein ungesicherter Versuch führt zurück und kostet einmalig 3 bis 6 Nerven; Hinweise bleiben erhalten. Öffentliche Namen führen im fünften Akt zu kostenlosen persönlichen Rückbestätigungen. Vor und nach dem letzten Abgleich die Kontaktprüfung am Bürgenbrett benutzen. Gewaltsam zerbrochene Zusatzbelege erfordern eine dritte bereits zugängliche Herkunft, niemals einen neuen Hauptbeweis.

**Bosse:** Die BH-Begegnungen bleiben unverändert. CC führt durch ihre zwei beziehungsweise drei Abschnitte oder einen ermittelten Eingriff. Ersatzkerne für Sequenz 3/2/1 sind pfadgefilterte, einmalige Abholungen bestehender Zutaten. Wetherby bleibt ein Verhörter; nur ein optionaler Registerrest braucht neue Werte von CD.

**Enden:** Das Stadtende braucht Ida, Sammelfehler, drei freiwillige Zeugengruppen und die zusätzliche Küchenbürgschaft. Amtserhalt benötigt die Titel-Deduktion, Evakuierung Ida und Frachtbahn, Sammelordnung die bekannte Warnung. Diese drei Ausgänge benötigen kein vollständiges Zeugennetz. Nach `k3a_end_vollzaehlig` benennen Ida und Klammer beim Amtserhalt die zweite übernommene Opferverwaltung ausdrücklich.

**Lieferung:** Acht Standarddateien plus `faelle.json`, Anreise, Anker, Abgleiche, Boss-Texte, Epiloge, Zeitung und `schnittstellen.json`. Die drei letztgenannten Mechanikdateien sind Zusatzdaten für den Einbau; die Dialoge verwenden bestehende Laufzeitfelder. `offene_punkte.md` nennt Zuständigkeiten und Grenzen. `grafikwuensche.md` enthält ausschließlich neue Schlüssel und Szenen.

**Prüfung:** `node docs/story/k4_akte/pruefen.mjs`. Prüft Daten und 64 vollständige Abläufe mit dem echten `GameState`. Fehlende CD-Karten und Registerrest-Werte werden ausdrücklich als offene Verträge ausgegeben; nur für den Strukturtest gibt es lokale Prüfattrappen. Die Prüfung bestätigt weder Kartengeometrie noch Kampfbalance oder die noch fehlende Bindungsanbindung. Zielspielzeit mit CD/CF: 7 bis 9 Stunden, keine aus diesen Textdaten gemessene Dauer.
