DND — KAPUTTES DORF, WEG, BRÜCKE & FLUSS

67 GLB-Modelle, 42 Szenen mit statischen Kollisionen, 8 vorbereitete animierte Bewohner. Stil: farbige Low-Poly-Modelle passend zu den bisherigen KayKit-/Kenney-Paketen. Originale Ergänzungen sind keine offiziellen KayKit-Assets.

DIE FERTIGE DORFSZENE
project.godot mit Godot 4.3 öffnen, Import abwarten, F5 starten.
scenes/Damaged_Village.tscn enthält ein Dorf von ca. 50 x 40 m mit 116 platzierten Objekten: Fluss in der Mitte, Holzbrücke und Hauptweg quer dazu, Nebenwege auf beiden Ufern, sechs beschädigte Gebäude, Bewohner, Werkstätten, Behelfslager und Trümmer.
Die Brücke hat kaputte Geländer, aber ein durchgängiges begehbares Deck.
Maus/Finger ziehen: Ansicht verschieben. Mausrad und +/-: Zoom. Links/Rechts: Kamera drehen. Bewohner-Buttons zeigen Warten, Gehen, Arbeiten/Interaktion oder Treffer. Das Gehen im Viewer spielt die Animation an Ort und Stelle; keine NPC-KI oder Wegfindung.

MODELLLISTE
Wege (5, 4 x 4 m): Erdweg, rissiges Kopfsteinpflaster, Ecke, T-Abzweig, Schlammweg mit Radspuren. Standardgerade entlang Z, für Querwege 90 Grad um Y drehen.
Fluss (4, je 6 x 8 m): gerade, flache Felsen, Schilf, Trittsteine. Wasseroberfläche Y=-0,15 m, Fluss entlang Z. Zwei Ufermodule (1,5 x 8 m): Gras und ausgewaschenes Erdreich. Beide Module für die linke Seite um 180 Grad drehen.
Brücken (2): beschädigte Holzbrücke und alte Steinbrücke. Spannweite des Decks 10 m, mit Rampen 12 m, Deckhöhe 0,41 m, Gehbreite ca. 3 m. Achse entlang X, passt über den 6 m breiten Fluss.
Häuser (6): beschädigtes kleines Wohnhaus, halb eingestürztes Familienhaus, ausgebrannte Hütte, zerstörte Schmiede mit Kamin, beschädigter Kornspeicher, verlassenes Heilerhaus. Haustür zeigt lokal nach -Z. Türen sind echte Öffnungen; beschädigte Seitenwände und fehlende Dachstücke erlauben Blick ins Innere. Grundflächen ca. 4–7 m, Höhen ca. 3–5,6 m.
Bau-Module (7): volle Wand, Türwand, Fensterwand, kaputte Wand, Steinboden, halbe kaputte Dachfläche und lose verbarrikadierte Tür. Wände und Boden im 4-m-Raster.
Dorfgegenstände (25): Steintrümmer, Holztrümmer, kaputter Zaun, eingestürzte Bank, altes Fass, kaputtes Fass, Bergungskiste, Kornbeutel, Vorratssäcke, beschädigter Brunnen, Amboss, kalte Esse, alte Bank, Feldbett/Behelfslager, Arbeitstisch, schiefer Wegweiser, Brennholz, erloschenes Lagerfeuer, zerlumpte Wäscheleine, Holzeimer, beschädigter Gedenkstein, kaputter Wagen, Schlamm-/Schuttfleck, bemooster Flussfelsen, vertrocknetes Gras.
Werkzeuge (8): Hammer, Heugabel, Laterne, Gehstock, Säge, Medizintasche, Vorratssack, Speer. Griffpivot am Ursprung; separat nutzbar oder an KayKit handslot.r befestigen.

BEWOHNER (8)
Schmied mit Hammer, Bauer mit Heugabel, Heiler mit Medizintasche, Zimmermann mit Säge, Dorfältester mit Gehstock, Flüchtling mit Vorratssack, verletzter Bewohner mit Verband und Laterne, Dorfwache mit Speer.
Abgeleitet von KayKit Adventurers (Barbarian/Mage/Rogue/Rogue_Hooded/Knight). Originales Skelett, Skin-Gewichte und 76 Animationen pro Figur bleiben erhalten. Kleidung wurde über Materialien angepasst, Originalwaffen entfernt und Werkzeuge an den Handknochen ergänzt. Bewohner sind stilisierte Varianten vorhandener KayKit-Figuren.
Die vorbereiteten CharacterBody3D-Szenen benutzen Modellskalierung 0,75 und eine 1,85-m-Kapsel. Keine Dialoge, Questdaten oder neue Arbeitsanimationen enthalten. Interaktion nutzt den vorhandenen Interact/Use_Item-Clip. Aufgaben wie Schmieden benötigen im eigentlichen Spiel eine passende Platzierung/Animation.

EINBAU INS BESTEHENDE SPIEL
assets/village, scripts und scenes ins Projekt kopieren. Alle Beispielpfade sind res://assets/village/... und res://scenes/assets/... . Die project.godot dient der eigenständigen Demo; vorhandene Projekteinstellungen weiterverwenden.
assets/village: reine GLB-Modelle, eingebettete Materialien/Texturen.
scenes/assets: einzeln platzierbare, vorbereitete Szenen mit Kollisionen oder Bewohner-Kapseln.
layout.json: Positionen und Drehungen aller Objekte der Demoszene.
catalog.json: Pfade, Rollen, Maße, Dreieckzahlen, Materialien und NPC-Animationen.
previews: tatsächliche Mesh-Vorschauen und Dorfübersicht.

KOLLISION & WASSER
42 statische Wrapper benutzen ConcavePolygonShape3D mit korrekt gedrehter Godot-Dreiecksreihenfolge. Es sind statische Umgebungskollisionen, nicht für bewegliche RigidBody3D gedacht. Hauseingänge und fehlende Wände/Dachstücke bleiben offen.
Fluss-Szenen und dekoratives Gras besitzen absichtlich keine Kollision. Schwimmen, Ertrinken, Unsichtbarkeitsbarriere am Flussufer und Navigation gehören ins eigentliche Spiel. Für Trittstein-Gameplay separat Collider auf die sichtbaren Steine setzen; die Flussmodelle sind dekorative Gesamtszenen.
Die Demo setzt scripts/water.gdshader ausschließlich auf die blauen Wasser-Materialien. Sanfte Wellen in Weltkoordinaten bewegen sich mit TIME; keine zusätzliche Textur nötig. Der Fluss bleibt eine flache Low-Poly-Fläche, keine Flüssigkeitssimulation.
Keine NavigationRegion3D, Dialoge oder Kampflogik automatisch eingerichtet.

LIZENZEN
Neue Umgebung, Gegenstände, Werkzeuge und Scripts: CC0 1.0.
Bewohner: Derivate von KayKit Adventurers, Kay Lousberg, CC0.
Siehe licenses. Ursprung: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0

VALIDIERUNG
Godot-4.3-Import, alle Modelle/Wrapper, fünf Aktionen je Bewohner und Brückenunterstützung wurden headless geprüft. Alle fünf senkrechten Teststrahlen treffen den Hauptweg bzw. das Brückendeck.
Der Dummy-Renderer meldet beim Freigeben der Demoszene einmal 'Parameter m is null' in mesh_get_surface_count. Laden, Animation und Physics-Tests bestehen trotzdem. Grafische Darstellung/Shader und Leistung auf einem echten Android-Gerät sind noch nicht geprüft.
