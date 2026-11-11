# Wärme und Rücklauf

## Verbindliche Grenzen

Wärme ist eine Wegeentscheidung. Sie entscheidet weder über Einwilligungen noch über das Vorhandensein eines persönlichen Rests. Temperatur, belasteter Rücklauf und Patientenentscheidung bleiben getrennte Zustände. Der gewöhnliche Wohnungsbogen, Ennas Stationszimmer und Frosts eigene Feuerstelle sind keine abschaltbaren Überschusskreise. Es gibt keine Zeitlimits, keinen Verlust beim Lesen und kein verstecktes Abkühlen während eines Verhörs.

CG, derzeit PR #246, ist Eigentümer der zwölf Ventile und ihrer Entscheidungsflags. CH liest sie, definiert aber keine konkurrierenden `bha_*`-Setter. Die gemeinsame Datenbasis enthält tatsächlich `_offen` und `_zu`; der CH-Auftrag nennt daneben `_warm`. Die Karten dieser Lieferung benutzen die vorhandenen `_offen`-Flags, statt einen nicht gesetzten Alias vorauszusetzen.

## Zustände und Anzeigen

| Zustand im späteren Heat-Modell | Bedeutung | Dialogfassung aus CG |
|---|---|---|
| `zu` | Überschuss abgetrennt, Kreis nicht in der Warmzählung | `_zu` gesetzt oder noch keine Entscheidung |
| `kalt` | Passive kalte Durchleitung, keine aktive Überschusswärme | Kalte Kartenvariante; hydraulisch noch nicht separat modelliert |
| `warm` | Bestätigte Überschusswärme, Tür kann auftauen, Blüten werden beweglich | `bha_ventil_<kreis>_offen` |

Die kalte Kartenvariante umfasst derzeit `zu` und `kalt`. Ein echtes drittes Hydraulikregister ist ein Auftrag an den Einbau, kein erfundenes JSON-Feld. Eine spätere Migration darf nicht aus einer fehlenden Entscheidung eine Zustimmung machen. Bei widersprüchlichen importierten Zuständen bleibt die letzte gültige bestätigte Stellung erhalten; fehlt sie, zeigt die Oberfläche einen reparierbaren Prüfzustand und hält den Außenweg offen.

Die Oberfläche nennt pro Kreis ausdrücklich „Überschuss: zu/kalt/warm“ und daneben „Rücklauf: ungewählt/Behälter/Klinik/leeres Gebäude“. Farbe, Geräusch und Partikel sind Zusätze. Fühlbare Kerben, Text und eindeutige Symbole reichen allein aus. Eine leere Rücklaufentscheidung wird nicht als sauberer Behälter-Rücklauf dargestellt.

## Zwölf Ventile, drei Banken

| Bank | Kreise | Regel |
|---|---|---|
| A | `hof`, `pult`, `tee`, `palm` | Höchstens einer offen |
| B | `beete`, `akten`, `waesche`, `reserve` | Höchstens einer offen |
| C | `labor`, `wurzel`, `kuehlung`, `klappe` | Höchstens einer offen |

Die bestehende CG-Dialogfassung schließt bei bestätigter Öffnung die anderen drei Kreise derselben Bank. Daraus folgen höchstens drei warme Kreise insgesamt. Es gibt keine automatische Verdrängung aus einer anderen Bank. Die unabhängige Wohnwärme und ein reparierter Reservebogen bleiben außerhalb dieser Zählung. Ein späteres freies Netz darf andere Gruppen anbieten, muss dieselbe harte Obergrenze, ausdrückliche Verdrängungsvorschau und jederzeitige Rückkehr erhalten.

Jedes physische Ventil ist als lesbares Schild mit seiner CG-ID auf der Karte vorhanden. Direkt daneben öffnet `bho_bedienen_<kreis>` den unveränderten CG-Dialog. Die zwölf Fernzüge im Bügelraum öffnen dieselben Gespräche und sind keine zwölf zusätzlichen Kreise. In den Glasgärten liegt ein Fernzug für `beete`; die zugehörige Armatur bleibt gemäß CG in der Verkaufshalle.

## Vorschau und Bestätigung

1. `preview(id, state)` berechnet ohne Schreiben die bisherige und gewünschte Stellung, alle verdrängten Kreise, die zwei getrennten Anzeigen und den verbleibenden Rückweg.
2. Die Bestätigung nennt den konkreten Bereich: etwa „Palmhaus wird warm; Gepäckhalle kühlt ab. Wohnungsbogen bleibt warm. Rücklauf weiterhin Behälter.“ Sie nennt auch neu bewegliche Pflanzen und eine gesperrte Glasabkürzung.
3. Abbruch verändert nichts. Kein Öffnen eines Lesefensters und kein Betreten einer warmen Variante zählt als Schaltentscheidung.
4. Erst die Bestätigung ruft `setValve` oder `routeReturn` auf. Beide prüfen Kapazität, Ziel und aktuellen Zustand noch einmal. Im Koop bestätigt der aktive Gesprächsführer; ein veralteter zweiter Auftrag bekommt eine neue Vorschau, keine zweite Transaktion.
5. GameState speichert alle zusammengehörigen Änderungen atomar. WorldScene aktualisiert Darstellung und Objekte, danach wird ein verständlicher Ergebnistext gezeigt. Hinweise, Inventar, einmalige Fundflags und Patientenentscheidungen bleiben bestehen.

Die CG-Vorschau benennt derzeit die Bank pauschal. Beim UI-Einbau müssen die konkret verdrängten Kreise ausgeschrieben werden. CH ergänzt dafür keine Fremdknoten mit versteckten Seiteneffekten.

## Kartenwechsel ohne Heat-Code

`tiles_warm` wird vom vorhandenen Renderer nicht ausgewertet. Deshalb gibt es 18 Grundkarten und 18 `__warm`-Varianten mit identischen Reihen und Spawnpunkten. Jeder Wegweiser benutzt einen CH-Dialog, dessen Startauswahl den maßgeblichen CG-Kreis liest und zur richtigen Variante führt. Auch die Schnellreise bietet pro Ziel nur die passende Variante an. Der sichere Wartungsausgang ist eine normale Tür; bei offenem Zielkreis übernimmt der danebenliegende Wegweiser die warme Route.

Nach einer Ventilschaltung kannst du am örtlichen Temperaturanzeiger den Kartenstand erneut betreten. Das schreibt keine Ventilflags, ist aber bis zum Einbau ein sichtbarer Ladeübergang und setzt dich an `default`. Ein künftiges `applyToMap` soll stattdessen Ort, Blickrichtung und Objektfortschritt erhalten, nur die gewählte Darstellung und bedingte Objekte wechseln und einen belegten Spawn auf den nächsten sicheren Bodenpunkt verschieben. Nacht beeinflusst die Beleuchtung, niemals den Netzzustand.

| Kreis | Darstellung zusätzlicher Orte neben CGs unmittelbarem Versorgungsort |
|---|---|
| `hof` | Kutschenhof und Kutschenhalle |
| `pult` | Pavillon und Winterpromenade |
| `tee` | Speisesaal und Stillenhäuser, ausschließlich Überschussflächen |
| `palm` | Kaltes Palmhaus |
| `beete` | Verkaufshalle und Glasgärten |
| `akten` | Aktenraum |
| `waesche` | Verlassene Wäscherei |
| `reserve` | Kesselgrund |
| `labor` | Labor |
| `wurzel` | Wurzelkammer |
| `kuehlung` | Wurzelkranz und Mutterhaus; Kühlbehälter bleiben selbst kalt |
| `klappe` | Verteilanlage, nicht automatisch Aussaatfreigabe |

`bh_buegelraum` und `bh_buegelraum__warm` sehen beide warm aus. Die zweite ID dient nur der einheitlichen Paarschnittstelle. Keine globale Netzentscheidung darf seine Heizung entfernen.

## Rücklauf

| Ziel | Sichtbare Folge | Kein automatischer Effekt |
|---|---|---|
| Behälter | Getrennte versiegelte Reste, ruhige Probenanzeige | Keine pauschale Rückgabe |
| Klinik | Rückleitung bis zum Klinikanschluss, Warnung am Stationsgang | Keine neue Entnahme, keine Patientenzustimmung |
| Leeres Gebäude | Kondensat sperrt die Glasabkürzung bzw. Wartungsnische; CG zieht zwei Nerven ab und führt zu Frost zurück | Kein Wohnraum wird gefährdet, keine Zutat und kein Hinweis verschwindet |

Die drei Rücklauf-Flags sind je Kreis gegenseitig ausschließend. Ein Rücklaufwechsel verändert die Bankbelegung nicht. Beim Leiten in das leere Gebäude bleibt der Außenweg offen. `hof`, `reserve`, `beete` und `tee` sperren ihre Glasabkürzung mit `_leer`; Malkins Reserveabkürzung ist ebenfalls gesperrt. Die übrigen Kreise brauchen beim Einbau eine lokale Kondensatkulisse, keine neue undurchquerbare Kartenwand.

Alle 18 Rückwege haben einen festen Wartungsschrank mit einem garantierten `vi_m_kupferrohrstueck`, gemeinsamem Entnahmeflag für beide Temperaturvarianten. Die Dialogfassung verbraucht zum Entsperren kein Material: bestätigtes Umleiten auf Behälter oder Klinik genügt. Daher ist auch ein verkauftes Ersatzstück kein Softlock. Soll der spätere Code Material verbrauchen, muss **jede neue Fehlleitung** genau einen zweckgebundenen Ersatzvorrat bereitstellen; dafür fehlt derzeit ein transaktionsbezogener Nachfüllhaken. Kein unbegrenzt verkaufbarer Nachfüllknopf wird hier vorgetäuscht.

Ein zusätzlicher Fehlschaltungs-Kampf darf nur nach eigener Vorschau und eigener Bestätigung angeboten werden. Die Rettung darf nicht von dessen Sieg abhängen. Der optionale Aussaatschwarm des Finales ist ein anderer, ausdrücklich gewaltsamer Handgriff.

## Akt I: drei Ventile und zwei Abzweige

Am Kesselgrund liegen die Armatur `reserve` und zwei Fernzüge `hof` und `palm`. Die beschrifteten Abzweige führen links zur Gepäckhalle und rechts zum Palmhaus. Beide sind von der Wohnwärme getrennt. Hof und Palmhaus teilen sich Bank A; Reserve liegt in Bank B.

1. Lies die Drei-Handräder-Tafel und finde den Leitungsplan. Erst `bho_leitungsplan_gelesen` erlaubt später das Leitungs-Overlay der Stadtkarte.
2. Bestätige Hofwärme und Behälter-Rücklauf für Hof. Damit bleibt der von CG verwendete sichere Auftaktzustand erhalten.
3. Öffne bei Bedarf Reserve als zweiten Kreis. Der Bügelraum war bereits vorher warm und zugänglich.
4. Prüfe am Palm-Fernzug die Folge „Hof kühlt ab, Palmhaus wird warm“. Nach Bestätigung bleibt die Reserve geöffnet, die Bank A hat weiterhin nur einen warmen Kreis.
5. Für den friedlichen Palmhausweg schließe Palm wieder. Lies Fäden und Halterung am kalten Umgang, ohne durch eine Bossarena gehen zu müssen.

## Boss- und Rückwegvertrag

BH liefert zwei Abschnitte für Glasgärtner und Atemkessel sowie drei für den Blütenmund. `won_<basisboss>` entsteht im bestehenden Kampf schon nach Abschnitt 1. CH nutzt deshalb für Belohnungen ausschließlich BHs endgültiges `vg_bh_boss_*_geloest` oder CGs jeweiligen friedlichen Abschluss und setzt danach ein eigenes `bho_*_geloest`.

Der Einbau muss CGs bestehende Siegoptionen ebenfalls auf endgültige Abschlüsse prüfen; ein früheres Basis-Siegflag darf keine Fährte abkürzen. Die Karten bieten sichere CH-Abschnittsdialoge. Kalte Bosszugänge bieten nur Erklärung und Abschlussprüfung; ein Kampf verlangt zusätzlich den offenen Kreis. Der Storyzugang für die belegte friedliche Lösung bleibt in beiden Varianten erreichbar. Keine dieser Bedingungen lässt einen lebenden Patienten zum Brennstoff werden.

## Prüffälle für den Einbau

- Nach 100 beliebigen bestätigten Bankwechseln niemals mehr als drei warme Kreise; niemals zwei derselben Bank.
- Vorschau, Abbruch, Lesen, Rast und Tagwechsel verändern keine Netzdaten.
- Leeres Gebäude sperrt nur den Zusatzweg. Rückreise, Feuerstelle, Lager und Ventiltafel bleiben nutzbar.
- Derselbe Fund in kalt/warm gibt insgesamt einmal Material. Ersatz nach einer weiteren Fehlleitung ist weder käufliche Pflicht noch Verkaufsquelle.
- Nach Schließen eines Kreises werden keine bereits gesammelten Kondensatnotizen gelöscht.
- Mutterwurzel-Abschnitt 1 oder 2 gibt keine Seq-1-Ersatzzutat; letzter Abschnitt und friedlicher Abschluss sind gleichwertige Quellen.
- Ein Wiederholungsaufruf derselben bestätigten Transaktion zahlt keine Belohnung doppelt aus. Beide Koop-Spieler sehen dieselbe Bankbelegung.
