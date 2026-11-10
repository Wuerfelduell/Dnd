# Kartenverhalten und Angriffssignale

Vorschläge für den späteren Einbau. Kacheln messen 16 Pixel. Keine der folgenden Streifen, Sichtlinien oder Koop-Regeln ist durch dieses Vorratspaket bereits aktiviert.

## Wahrnehmung und Rückwege

Sicht wird durch massive Wände gebrochen. Hören folgt begehbaren Korridoren; geschlossene Schallsperren stoppen es. Tag/Nacht bestimmt nur die Darstellung und mögliche Auswahl, niemals einen unsichtbaren Storyfortschritt. Jeder Bereich hat einen gegnerfreien Eingang und einen jederzeit offenen Rückweg. Lauerer kündigen den Wechsel in den Angriff sichtbar an. Flüchter laufen nicht in verschlossene Räume.

`roam.speed`, `chase` und `aggro` sind bestehende Kartenwerte in Pixeln bzw. Pixeln pro Sekunde. Die getrennten Sicht-/Hörweiten dieser Tabelle benötigen einen Wahrnehmungsadapter; sie sind nicht stillschweigend identisch mit `aggro`.

| ID | Typ | Sicht (Kacheln) | Hören (Kacheln) | Zeit | Schwerpunkt |
|---|---|---:|---:|---|---|
| `vg_cw_letternlaeufer` | Streuner | 5 | 5 | Nacht | schnell |
| `vg_cw_rohrpostwespe` | Wächter | 6 | 5 | Tag und Nacht | fern |
| `vg_cw_stempelhand` | Lauerer | 5 | 8 | Tag und Nacht | betaeubung |
| `vg_cw_durchschlag` | Flüchter | 5 | 8 | Nacht | nerven |
| `vg_cw_registerratte` | Streuner | 5 | 5 | Tag und Nacht | schnell |
| `vg_cw_seilbahnwaechter` | Wächter | 5 | 5 | Tag und Nacht | zaeh |
| `vg_cw_tintenschatten` | Lauerer | 6 | 5 | Nacht | fern |
| `vg_cw_leerfracht` | Flüchter | 5 | 8 | Tag und Nacht | nerven |
| `vg_bh_dampfschwester` | Streuner | 5 | 8 | Tag und Nacht | betaeubung |
| `vg_bh_wurzelgaenger` | Wächter | 5 | 5 | Nacht | zaeh |
| `vg_bh_glasmotte` | Lauerer | 5 | 5 | Tag und Nacht | schnell |
| `vg_bh_bluetenkopf` | Lauerer | 5 | 8 | Tag und Nacht | nerven |
| `vg_bh_rohrwurm` | Streuner | 5 | 5 | Nacht | zaeh |
| `vg_bh_postkartenschreiber` | Wächter | 5 | 8 | Tag und Nacht | nerven |
| `vg_bh_waeschegeist` | Lauerer | 6 | 5 | Tag und Nacht | fern |
| `vg_bh_sudtraeger` | Flüchter | 5 | 8 | Nacht | betaeubung |
| `vg_all_wegelagerer` | Streuner | 5 | 5 | Tag und Nacht | schnell |
| `vg_all_kutschengeist` | Wächter | 6 | 5 | Tag und Nacht | fern |
| `vg_all_zollhund` | Lauerer | 5 | 5 | Nacht | zaeh |
| `vg_all_nebelkraehe` | Flüchter | 5 | 5 | Tag und Nacht | schnell |
| `vg_all_marktschreier` | Streuner | 5 | 8 | Tag und Nacht | nerven |
| `vg_all_grenzstein` | Wächter | 5 | 5 | Nacht | zaeh |
| `vg_all_fuhrmannsschatten` | Lauerer | 6 | 5 | Tag und Nacht | fern |
| `vg_all_brueckenzoll` | Flüchter | 5 | 8 | Tag und Nacht | betaeubung |
| `vg_cw_boss_bleisammler` | Wächter | 7 | 10 | Tag und Nacht | Boss |
| `vg_cw_boss_blinder_zusteller` | Wächter | 7 | 10 | Tag und Nacht | Boss |
| `vg_cw_boss_nullfundament` | Wächter | 7 | 10 | Tag und Nacht | Boss |
| `vg_bh_boss_glasgaertner` | Wächter | 7 | 10 | Tag und Nacht | Boss |
| `vg_bh_boss_waescherei` | Wächter | 7 | 10 | Tag und Nacht | Boss |
| `vg_bh_boss_mutterwurzel` | Wächter | 7 | 10 | Tag und Nacht | Boss |
| `vg_all_boss_landvermesser` | Wächter | 7 | 10 | Tag und Nacht | Boss |
| `vg_all_boss_schlafkutsche` | Wächter | 7 | 10 | Tag und Nacht | Boss |

## Gruppen

- Alte Setzerei: Letternläufer und Registerratte bewegen sich in Paaren; die Stempelhand bewacht allein die innere Tür. Höchstens eine Gruppe bindet den Rückweg.
- Sortiergrube: Eine Rohrpostwespe patrouilliert zwischen zwei ruhenden Leerfrachten. Der Durchschlag folgt erst nach sichtbarer Aktivierung; keine Verstärkung während des Lesens.
- Nullfundament: Seilbahnwächter und Tintenschatten bleiben in getrennten Kontrollabschnitten. Der Registerleib ruft keine zusätzlichen Menschen herbei.
- Palmhaus: Glasmotten kreisen außerhalb der Blütenreichweite. Der Wurzelgänger bleibt als hilfsbedürftiger Patient von den Lauerblüten getrennt.
- Wäscherei: Rohrwurm am Boden, Wäschegeist am Trockengestell, Dampfschwester am Ventil. Niemals alle drei gleichzeitig am Eingang. Der Bügelraum hat eine baulich unabhängige sichere Zufahrt.
- Wurzelkammer: Der Sudträger bleibt im Wartungsbereich. Den lebenden Postkartenschreiber trifft man auf der äußeren Promenadenkante, nicht als Brennstoff im Bossraum.
- Landstraße: Wegelagerer paarweise, Zollhund nur an der alten Schranke, Marktschreier ausschließlich als freiwillige Gesprächsbegegnung. Grenzstein und Fuhrmannsschatten besetzen getrennte Abzweige. Landvermesser oder Schlafkutsche werden pro Reise gewählt, nie beide hintereinander erzwungen.

## Koop-Verhalten

Im bestehenden Kampf bekommt jeder stehende Spieler regulär einen gegnerischen Angriff; Stärke und Leben skalieren bereits. Die folgenden Unterschiede sind Integrationsvorschläge, keine neuen unbenutzten JSON-Felder:

| Gegner | Gewünschter Unterschied | Fairnessregel |
|---|---|---|
| Rohrpostwespe, Nebelkrähe | Suchen vor Kampfbeginn die sichtbar schwächere Person (aktueller Lebensanteil). | Zielmarker vor dem Wechsel, höchstens einmal je voller Runde; keine zusätzlichen Treffer. |
| Durchschlag, Tintenschatten | Teilen ihre Darstellung in zwei versetzte Konturen. | Ein gemeinsamer Lebensvorrat; Aufteilung erzeugt weder einen zweiten Gegner noch doppelte Beute. |
| Wurzelgänger, Postkartenschreiber | Zweite Person kann den sicheren Rückweg freihalten. | Kein Bonus durch Verletzen des Patienten; Bewusstlosigkeit bleibt nicht tödlich. |
| Stempelhand, Dampfschwester, Sudträger, Brückenzoll | Angekündigter Benommenheitsdruck gegen die zuletzt aktive Person. | Aktuell nur Schaden und 4 Nerven; echtes Aussetzen erst mit separater Engine-Unterstützung, nie beide Spieler zugleich sperren. |
| Schlafkutsche | Ein Spieler beobachtet die Achse, der andere die geschützten Türen. | Die schlafenden Reisenden sind niemals anwählbare Ziele. |
| Alle anderen | Bestehendes Koop-Verhalten. | Keine neue Zielwahl und keine zusätzliche Aktionsökonomie. |

## Sichtbare Angriffssignale

Der vorhandene Angriffskatalog benutzt `name`, `hits`, `damage`, optional `nerves` und `unparryable`. Ein Feld `tells` existiert nicht. Daher steht die konkrete Ausholbewegung bereits im angezeigten Angriffsnamen. BI hält diese Pose zwei Frames. Normale Hiebe sind parierbar; die mit „ausweichen“ bezeichneten Flächen- und Druckangriffe setzen `unparryable: true`. Text, Pose und Timingring reichen auch ohne Klang oder Farberkennung.

| ID | Parierbares Signal | Ausweichsignal |
|---|---|---|
| `vg_cw_letternlaeufer` | Zieht den linken Fuß ein. | Hält den Setzkasten über den Kopf. |
| `vg_cw_rohrpostwespe` | Hält vor dem Sprung die Flügel still. | Richtet den offenen Kapselmund aus. |
| `vg_cw_stempelhand` | Rollt die Manschette auf. | Hebt den Stempel senkrecht. |
| `vg_cw_durchschlag` | Faltet den Ellbogen nach innen. | Öffnet den Brustfalz. |
| `vg_cw_registerratte` | Zieht die Schnauze unter den Streifen. | Stellt die Papierstreifen auf. |
| `vg_cw_seilbahnwaechter` | Schließt beide Hände um das Rad. | Lehnt den gesichtslosen Kopf zurück. |
| `vg_cw_tintenschatten` | Sammelt sich entlang der Bordkante. | Wölbt die Oberfläche zur Blase. |
| `vg_cw_leerfracht` | Zieht die obere Naht straff. | Stellt sich auf die Sackkante. |
| `vg_bh_dampfschwester` | Faltet die Haube nach vorn. | Sammelt Dampf unter der Schürze. |
| `vg_bh_wurzelgaenger` | Senkt die verwachsenen Hände. | Zieht beide Arme aus dem Boden. |
| `vg_bh_glasmotte` | Legt die Flügel übereinander. | Hält beide Flügel breit und still. |
| `vg_bh_bluetenkopf` | Dreht das Gesicht zum Licht. | Schließt alle Blütenblätter zugleich. |
| `vg_bh_rohrwurm` | Zieht die Segmente ineinander. | Bläht die mittlere Dichtung. |
| `vg_bh_postkartenschreiber` | Dreht die Handfläche nach oben. | Hebt die Karte vor das Gesicht. |
| `vg_bh_waeschegeist` | Spannt eine einzelne Ecke. | Rollt alle Säume nach innen. |
| `vg_bh_sudtraeger` | Zieht den Henkel nach hinten. | Hebt den Deckel mit Dampf an. |
| `vg_all_wegelagerer` | Verlagert das Gewicht aufs Vorderbein. | Greift mit der freien Hand zum Boden. |
| `vg_all_kutschengeist` | Schwingt eine unsichtbare Tür auf. | Lässt zwei Lichtkreise übereinanderlaufen. |
| `vg_all_zollhund` | Spannt die Leine vor dem Sprung. | Senkt den Brustkorb bis zum Boden. |
| `vg_all_nebelkraehe` | Stellt die Nackenfedern auf. | Verschwindet bis auf beide Flügelränder. |
| `vg_all_marktschreier` | Nimmt den Vorführstock in beide Hände. | Holt tief Luft und hebt den Beutel. |
| `vg_all_grenzstein` | Kippt auf die schmale Ecke. | Hebt das Moos vom Boden ab. |
| `vg_all_fuhrmannsschatten` | Spannt beide Hände auseinander. | Hebt den leeren Arm über die Schulter. |
| `vg_all_brueckenzoll` | Schiebt die leere Kasse vor die Brust. | Zeichnet mit beiden Armen einen Bogen. |
| `vg_cw_boss_bleisammler` | Zieht die Walze vor die Brust. | Öffnet den Setzkasten über sich. |
| `vg_cw_boss_blinder_zusteller` | Tastet die Fächer von links nach rechts ab. | Spannt den Postsack über den Rücken. |
| `vg_cw_boss_nullfundament` | Klappt zwei schwere Deckel auf. | Presst alle Rücken zusammen. |
| `vg_bh_boss_glasgaertner` | Öffnet die Schere auf Schulterhöhe. | Spiegelt einen Lichtstreifen auf den Boden. |
| `vg_bh_boss_waescherei` | Zieht die nassen Tücher nach innen. | Bläht den Dampf über dem Deckel. |
| `vg_bh_boss_mutterwurzel` | Hebt zwei Wurzelarme aus dem trockenen Boden. | Schließt den Blütenmund bis auf einen Spalt. |
| `vg_all_boss_landvermesser` | Setzt den Zirkel auf zwei Bodenpunkte. | Zieht das Messband bis zum Anschlag. |
| `vg_all_boss_schlafkutsche` | Senkt die Deichsel auf den Boden. | Dreht beide Vorderräder nach außen. |

## Nicht tödliche Abschlüsse

Verbindlich für BI: `vg_cw_durchschlag` zerfällt zu Papier; `vg_bh_wurzelgaenger` wird von äußeren Strängen befreit und bleibt am Leben; `vg_bh_postkartenschreiber` wird bewusstlos und betreut; `vg_all_marktschreier` flieht. Zusätzlich fliehen Wegelagerer und Zollhund. Trophäen sind abgefallene Gegenstände, niemals Körperteile oder geraubte persönliche Erinnerungen.

Ein Sieg über die Schlafkutsche löst nur deren fremdes Fahrgestell; die Schlafenden werden gesichert. Das Nullfundament und die Mutterwurzel sind örtliche Kontakte derselben Macht. Ein Kampf beendet ihren lokalen Zugriff und vernichtet nicht den Hunger unter allen Städten.
