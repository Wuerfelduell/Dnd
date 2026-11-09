# AP · Die fünf Akte

Eigenständiger Inhaltsentwurf für „Nebelakten“, Kapitel 2. Nur dieser Ordner gehört zum PR. Der Einbau erfolgt separat. Zunächst gelesen auf `1ecfc2df1facaacfd4e6e0caf7a554a08db20d41`, abschließend gegen `e90e5b040f9c3b6ae66c0edd55bad3f7de29a867` geprüft; verbindliche Vorlage: `docs/art/codex_AP_k2_akte.md`. Die zwischenzeitlich erhöhten Bosswerte und Sequenz-Schranken bleiben unverändert.

## Umfang und Formate

- Zehn optionale Fährten, genau zwei je Akt, jeweils vier Schritte, vier Hinweise aus unterschiedlichen Quellen, zwei Fakten und eine Deduktion.
- Elf Nebenquests einschließlich Krabbes durchgehender Geschichte; 45 Hinweise und 25 Fakten insgesamt.
- Acht sofort nutzbare, einmalige Dialoghilfen und zwei Vorteile beim vorgeschlagenen Turmaufstieg. Kein Bonus vergibt eine alte Hauptstory-Deduktion.
- Sieben Schritte für Akt V, mit den drei bisherigen Schritten unverändert an Position 2, 6 und 7.
- Vier Endfolgen mit jeweils sechs sichtbaren Szenen. Insgesamt 56 bedingte Textvarianten mit je 60 bis 120 Wörtern.
- Krabbe an fünf Orten, fünf lesbare Gegenstände, Kauf/Tausch/Arbeit und zwei gleichwertig belohnte Abschlüsse.

Die acht Standarddateien entsprechen `applyQuestPack`: `quests.json`, `dialogues.json`, `dialog_zusaetze.json`, `npcs.json`, `case.json`, `items.json`, `encounters.json`, `platzierung.json`. `encounters.json` bleibt bewusst leer. AP benötigt keinen zusätzlichen Gegner.

`akt5_neu.json` ist ein **separater Ersatzvorschlag**, ebenfalls mit den bekannten Pack-Schlüsseln `quests`, `dialogues`, `platzierung`. Er enthält den ganzen Eintrag für `k2_akt5` und sämtliche neuen Pflichtszenen. Er wird nicht durch die Standarddateien automatisch aktiviert. Seine notwendigen Zugangssperren stehen in [offene_punkte.md](offene_punkte.md).

`epiloge.json` ist die verlangte flache Szenenliste. Für das gewählte Ende alle passenden Zeilen in Dateireihenfolge anzeigen. Die Titelziffern 1 bis 6 bezeichnen Szenenplätze; bedingte Alternativen teilen eine Ziffer. Es wird kein zusätzliches Datenfeld vorausgesetzt.

## Fährten und konkrete Vorteile

Die Deduktion ermöglicht den abschließenden Entscheidungsdialog. Dieser setzt das Bonusflag und bezahlt die gewählte Belohnung genau einmal. Die acht Hilfen der Akte I bis IV müssen anschließend ausdrücklich im selben Gespräch abgerufen werden; das Flag `<quest>_genutzt` verhindert Wiederholung.

| Akt | Quest-ID und Titel | Einstieg / Abschluss | Bonusflag | Wirkung im Pflichtteil |
|---|---|---|---|---|
| I | `k2v_kleister` · Der Kleister war noch warm | Druce, Bahnhof | `k2v_kleister_bonus` | Druces Wagen deckt einen Stationsweg: Fahndung einmal um 1 senken, vor der Erkundung der Viertel. |
| I | `k2v_telegramm` · Zwei Uhren für eine Nachricht | Zunder, Kahn | `k2v_telegramm_bonus` | Die Lagebesprechung gibt einmal 8 Nerven für die weitere Ermittlung. |
| II | `k2v_hoersaale` · Die leeren Plätze | Wyle, Akademie | `k2v_hoersaale_bonus` | Wyle bereitet die Befragung über Starling vor: einmal 8 Nerven. |
| II | `k2v_schattenmass` · Das falsche Mittagslicht | Lamm, Oberstadt | `k2v_schattenmass_bonus` | Lamm gibt einmal einen Moortee für die Akademie-Ermittlung. Robe und Torbedingung bleiben nötig. |
| III | `k2v_umschlaege` · Die Briefe, die zurückkamen | Hesper, Salzmarkt | `k2v_umschlaege_bonus` | Einmal ein Lampenöl als Vorrat vor der Moorjagd; kein Ersatz für Starlings Pflichtverhör. |
| III | `k2v_quartier` · Ein Bett ohne Abdruck | Brack, Hafen | `k2v_quartier_bonus` | Einmal 10 Nerven vor Vergessmoor und Namenloser. |
| IV | `k2v_hale` · Die erste verweigerte Unterschrift | Hale, Salzmarkt, nach dem bestehenden Zunder-Gespräch | `k2v_hale_bonus` | Einmal 8 Nerven zur Vorbereitung auf das Wachhaus; kein automatisches Hale-Bündnis. |
| IV | `k2v_dienstwechsel` · Die Laterne am falschen Haken | Brack, Hafen | `k2v_dienstwechsel_bonus` | Einmal ein Verband für die Befreiung; Schlüsselbrett und Zelle bleiben unverändert. |
| V | `k2v_waerter` · Die Hände vor Brandt | Brack, Hafen | `k2v_waerter_bonus` | In `k2v_windenszene` entfällt der Verlust von 5 Nerven beim Öffnen der Klappe. |
| V | `k2v_keller` · Der Vorrat, der nie brannte | Zunder, Kahn | `k2v_keller_bonus` | In `k2v_kellerszene` einmal 12 Leben regenerieren. |

Werte werden wie gewohnt durch das Spiel begrenzt. Die normale Handlösung der Winde kostet Nerven, verlangt aber keinen Mindestwert. Überfahrt und Keller haben kostenlose sichere Wege. Keine AP-Aufgabe ist Voraussetzung eines Endes. Nachforschungen geben meist 6 bis 10 Schilling oder 2 bis 3 Ehre, einmal alternativ 1 Bindung zu Zunder. Alle Abschlussentscheidungen sind sachliche Umgangsentscheidungen über Belege; keine verkauft einen Menschen.

## Zeitfenster

Fährten werden im zugeordneten aktiven Akt angeboten. Ihre Quellen und Hilfen sind für dieses Zeitfenster geschrieben, insbesondere in Akademie und Lucents Haus, deren vorhandene Türen später nicht frei bleiben. Begonnene Fährten sollen vor dem Aktwechsel abgeschlossen werden. Ein ausgelassener Bonus blockiert weder die Hauptgeschichte noch die vorgeschlagene Überfahrt. Die Frage der Journal-Archivierung verpasster Fährten ist ausdrücklich als Integrationspunkt dokumentiert; die Daten vergeben dafür keinen falschen Erfolg.

Die Zusatzoptionen werden ausschließlich am vorhandenen `nodes.start` der jeweiligen Dialoge ergänzt. Vorhandene Start-Resolver, Haftbedingungen und NPC-Platzierungen bleiben bestehen. Erstgespräche wie Sedges Einführung werden nicht ersetzt.

## Krabbe

Die fest vergebene NPC-ID ist `wxn_krabbe`, die einzige Ausnahme vom Präfix `k2v_`. Die Figur gehört inhaltlich AP; ihre Grafik ist bereits AO zugeteilt.

| Akt | Platz | Angebot |
|---|---|---|
| I | Bojenhafen, Kai | Druckleiste |
| II | Salzwatt, landseitiger Einstieg | Messingknopf |
| III | Torfstich | Halbe Fahrkarte |
| IV | Pfahldorf, Hauptsteg | Saumbrief |
| V | Bojenhafen, Steg zum Inselboot | Rotes Tonnenholz und sämtliche verpassten Stücke |

Jedes Stück kostet wahlweise 3 Schilling, ein Salzbrot oder eine kurze, gefahrlose Sortierarbeit ohne Ressourcenpreis. Die Erwerbsflags sperren alle drei Angebote gemeinsam. Untersuchungen über das vorhandene Item-Feld `inspect` sind wiederholbar, liefern aber weder Geld noch Verbrauchsgüter.

Krabbe hat den Namen seiner Schwester Nela vergessen, nicht seinen eigenen. Brief, Holz und die gemeinsam erinnerten Einzelheiten erlauben eine Zuordnung. Sie belegen weder ihren Tod noch ihren Aufenthalt. Der Spieler darf mit Krabbe eine **Suchtafel ohne Todesdatum** anbringen oder den Brief privat bei Brack verwahren. Beide Wege geben 4 Ehre; die Entscheidung erscheint in jedem Ende. Ohne Abschluss bleibt eine eigene offene Epilogvariante. Auch wer Krabbe erst in Akt V anspricht, kann alle fünf Gegenstände kostenlos nachholen und seine Geschichte abschließen.

## Dramaturgie und Anschluss

Der Druckauftrag untersucht die Logistik der ersten Bahnhofsauflage, nicht Nils’ manipulierte spätere Oberstadtauflage. Die verschwundenen Studenten sind nachweislich abgereist, ihr späteres Schicksal bleibt offen; das ist kein zweiter Jorin-Auftrag. Die Briefe ergänzen das vorhandene Bündel an L., ohne Brandts Identität vor der Pflicht-Deduktion aufzulösen. Hales frühes Wegsehen ersetzt nicht ihre Ablieferliste. Die Wärteranleitung betrifft eine Winde, nicht Rinns Inselpeilung. Der Kellerfund betrifft gewöhnliche Nothilfe, nicht eine neue Opferliste.

Zunder kehrt nach dem letzten Gespräch ans Boot zurück. Dadurch bleibt ihre bisherige Rolle während des Finales erhalten. Das Gespräch reagiert auf `k2_fenn_found` und Bindung ab 3; `k2v_zunder_vertraut` hält diesen Moment für die Epiloge fest. Es versöhnt Zunder ausdrücklich nicht mit dem Lichtmeister-Ende.

Sämtliche alten Enden und Brandts Choices bleiben unangetastet. Die letzten Szenen führen über eine unbewiesene Beobachtung zum Namenverlust unter dem Moor. Sie legen weder Zielort noch Gegner noch Handlung von Kapitel 3 fest.

## Prüfung

Vom Repo-Wurzelverzeichnis:

```sh
node docs/story/k2_akte/pruefen.mjs
```

Das Skript benötigt nur Node und liest die vorhandenen Quellen. Es prüft JSON und Feldnamen, Flag-Produzenten, Definitionen und Referenzen, lokale Dialogknoten, die Präfix-Ausnahme, Belegpaare, einmalige Belohnungen, beide Abschlüsse aller zehn Fährten, Krabbes kostenlosen Nachholweg, 16 Akt-V-Zustände und 384 Epilogkombinationen. Die drei alten Akt-V-Schritte werden gegen die Quelle verglichen.

Koordinaten liegen auf Bodenfeldern und überschneiden sich nicht mit den gelesenen Ursprungs-, AB- oder Lore-Platzierungen. Das ersetzt keine Prüfung der sichtbaren Dekoration, Lichtkegel und Begegnungsreichweiten in Phaser. Die dafür erforderlichen Integrationsschritte stehen in [offene_punkte.md](offene_punkte.md).
