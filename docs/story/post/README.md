# DI – Post und Briefe

Dieses Paket enthält ausschließlich Text und Daten für einen späteren Einbau. Es verändert keinen Spielcode, keine bestehenden NPCs und keine Hauptakte. 91 Briefe bilden 30 Reihen: 30 aus Kettlegate, 20 aus Wexmoor, 16 aus Dunscar, 12 aus Calderwick, 8 aus Briarholt und 5 anonyme Durchschläge. 28 zweite Briefe erscheinen ausschließlich nach Antwort 1 auf den ersten Brief ihrer Reihe. Spätere Briefe reagieren zusätzlich auf die Bitte um Vertraulichkeit.

| Datei | Inhalt |
| --- | --- |
| `briefe.json` | Briefkörper, Auslöser, Antworten, Beilagen-Verweise und bedingte Nachsätze |
| `beilagen.json` | 11 Beilagen: sechs Fotos, zwei Lesestücke, Schlüssel, vorhandener Silberstaub und 8 Schilling |
| `post.json` | Belegte Absender, Dialog- und Beziehungsquellen, Reihen, 24 Schalterzeilen, 6 Notizbuchhinweise, 3 Büromeldungen, 4 Koopzeilen, externe Flags und Adapterereignisse |
| `pruefen.mjs` | Prüfung ohne Node-Pakete, einschließlich negativer Prüffälle und ausführbarer Beispiele des Zustellvertrags |

## Quellenkonflikte und bewusste Zuordnungen

Die Aufgabenbeschreibung nennt einige Personen und Rollen, die im gelesenen Stand nicht existieren. Die folgende Tabelle macht die Abweichungen sichtbar. **Diese Ersatzreihen erfüllen nicht die wörtlich verlangten fehlenden Rollen.** Es werden keine erfundenen Verwandtschaften, Berufswechsel oder NPC-Aliase eingeführt. Alle 29 tatsächlichen Absender sind vorhandene Figuren. Eine spätere Entscheidung für andere Figuren erfordert eine inhaltliche Überarbeitung der betroffenen Reihe, nicht bloß das Umbenennen einer ID.

| Angabe im Auftrag | Befund und verwendete Reihe |
| --- | --- |
| Felix’ Schwester aus Kettlegate | Keine entsprechende Figur vorhanden. `ivy` ist ausdrücklich **Hesters** Schwester. Ihre Ersatzreihe handelt vom Haushalt der beiden. Orla Fencrest ist die Schwester eines anderen Felix in Briarholt und bleibt dort. |
| Weberin aus Kettlegate | Keine entsprechende NPC-Definition. Ersatz: `gouvernante`, Imogen Wren, mit einem eigenen Waisenhausbogen; sie wird nicht zur Weberin umgeschrieben. |
| Elsbeth Price | Die vorhandene Näherin heißt Elsbeth **Rowe**, ID `elsbeth`. Die Kettlegate-Herkunftsgruppe bleibt, tatsächlicher Absendeort ist Wexmoor. |
| Dunn Crane | Vorhanden ist `dunn`, Constable Dunn, ohne diesen Nachnamen. Agnes Crane ist eine andere Person. |
| Fasserin-Lehrling | Kein entsprechender NPC vorhanden. Ersatz: `quill`, Antiquitätenhändler, für das Schlüsselrätsel. Er wird nicht zum Lehrling Odas erklärt. |
| Moorbraut-Überlebende | Keine eindeutig so definierte Absenderfigur. Ersatz: `sedge`, mit einem Bogen über ein unbeschriftetes Täfelchen. Ihr wird kein überlebter Bosskampf zugeschrieben. |
| Fährmann | Verwendet wird `druce`, ausdrücklich **Schleusenwärter**, mit einem Bogen über eine sichere Schleuse. |
| Vier besondere Briefe, zugleich einer je Kapitel | Kapitel 2–6 ergeben fünf Zustellungen. Daher fünf unterschiedliche Durchschläge derselben alten Sendung und insgesamt 91 statt 90 Briefe. Keine zusätzliche Zustellung in Kapitel 1. |
| Oda: drei Zeilen, zugleich 80–220 Wörter | Nur `post_fasserin_1` hat die ausdrücklich geprüfte Ausnahme `oda_drei_zeilen`. Die 90 übrigen Briefkörper haben jeweils 80–220 Wörter. |

Absenderquellen liegen teils in Grunddaten (`campaign.json`, `gebaeude.json`, `treffen.json`, `wexmoor.json`) statt in nachträglichen Packs. Das Prüfskript liest die echten Definitionen an den gespeicherten JSON-Zeigern. Es akzeptiert keine erfundenen IDs aus einer lokalen Ersatz-NPC-Liste. `absender: null` bezeichnet ausschließlich die fünf anonymen Durchschläge und ist kein NPC.

## Anschluss an den Einbau

1. Drei JSON-Dateien laden; keine Aufnahme der Briefdaten in die vorhandenen Hauptfall-Dialoge erforderlich. `post.json.absender` liefert genaue NPC- und Dialogzeiger zum Anschluss des Kontakt-Ereignisses.
2. Beim persönlichen Gespräch Kontakt pro stabiler Spieler-ID merken. Vor Freigabe einer Reihe muss die Figur im tatsächlich gewählten Ausgang lebend, frei und schreibfähig sein. `post_kontakt_<npc>` ist der dafür bestätigte Freigabewert, **kein** Flag, das schon bei bloßer Sichtbarkeit gesetzt wird. Nach widersprechenden Enden Freigabe bis zum ersten Versand zurücknehmen. Keine Rettung, Freilassung, Rückreise oder Aussöhnung durch Post nachholen.
3. Für alte Spielstände Kontakte nur aus belegten Gesprächs-/Questständen rekonstruieren; andernfalls nicht pauschal alle Reihen freischalten. Beziehung allein ist kein Beleg für eine passende Fallauflösung. Ein nicht belegbarer Kontakt bleibt konservativ gesperrt. Einmal versandte Briefe bleiben historische Sendungen und werden nicht nachträglich gelöscht.
4. `k2_arrived` bis `k6_arrived` aus den vorhandenen Kapitelereignissen lesen. Beim erstmaligen Eintreffen `post_ankunft_<kapitel>` als absoluten Spieltag speichern. Diese Zeitanker sind Zahlen, keine Wahrheitsflags. Bestehende Ankunftsflags bleiben beim Weiterreisen wahr. Keine Prüfung auf aktuelle Stadtgleichheit: alte Briefe müssen nachreisen können.
5. Oda nur bei offenem regulärem Fasserin-Auftrag freigeben: `post_fasserin_auftrag_offen` synchron zum Auftragszustand halten. Bei schon abgeholtem Auftrag keine neue verspätete Werkstattmeldung erzeugen. Der Brief erstellt keinen Auftrag, verändert keine Rezeptchance, verlangt keinen Lohn und liefert kein Artefakt. Ihre beiden Antwortflags steuern lediglich den Umfang der Erklärung bei der regulären Abholung.
6. Postschalter, Büro und das freigeschaltete Haus aus DG greifen auf **denselben** Postfachzustand zu. Keine neuen Karten, Gebäude-IDs oder Räume voraussetzen. Vorhandene Lesestück-Ansicht mit Betreff, Absenderanzeige, Text, optionalem Nachsatz und Antwortauswahl verwenden. Foto-Items verwenden bis zum Grafikpaket eine Textansicht; keine Bildpfade oder Platzhaltergrafiken erfinden.
7. CT-Anschluss: Der fünfte anonyme Brief benötigt `k6_akt4_done`. Das ist der dokumentierte Anschluss an das alte Leuchtfeuer und die Registerwahrheit, kein in DI erzeugter Storyfortschritt. Falls CT die Erkenntnis später freigibt, muss der Einbau das Gate auf diese tatsächliche Erkenntnis verschieben. Nicht bei bloßer Stadtankunft aufdecken. Fall 9 belegt anonyme Briefe und Stern-Wasserzeichen; erst CT liefert die Weiterleitung nach Varrowmouth. DI behauptet **nicht**, dass Fall 9 allein bereits die Küstenverbindung erklärt.

### Datensemantik

`stadt` ist die Herkunftsgruppe der Reihe, nicht das aktuelle Zustellziel. `kapitel` ist die früheste Versandstufe und bestimmt die Sortierung. `absendeort` korrigiert bei Elsbeth die geografische Darstellung. Die umherreisende Fasserin gehört als einmalige Korrespondenz zum Dunscar-Kontingent, ohne dort festgesetzt zu werden.

`requires_flags` verlangt alle aufgeführten Flags. `requires_any_flags`, wenn vorhanden, verlangt zusätzlich mindestens eines der aufgeführten Flags. `beziehung_min: 0` wird gegen die Beziehung der adressierten Spielerperson zur genauen `beziehungs_id` geprüft. Bei ausdrücklich fehlender Beziehungsdefinition gilt neutral 0; insbesondere Maud Keel (`wx_pfandleiherin`) niemals auf die Kettlegater Wirtin `maud` abbilden. Anonyme Sendungen prüfen keine Beziehung. Die Beziehung wird nur vor Zustellung geprüft, nicht vor erneutem Lesen.

`tage_nach` zählt vollständige Spieltage seit `zeitanker`. Bei ersten Briefen gilt die Kapitelankunft; bei Folgebriefen der Zeitpunkt der verbindlichen Antwort auf den unmittelbaren Vorgänger. Fehlender Anker bedeutet nicht fällig. Nachzügler behalten ihre ursprünglichen Anker. Der Zähler wird beim Stadtwechsel nicht neu gestartet.

`folge_brief` bezeichnet ein durch die Antwort erreichbares Ziel, **keinen Sofortversand**. Kapitel, Beziehung, Zeit und Tageslimit gelten weiterhin. `folge_flag` wird immer gesetzt. `folge_brief: null` ist ein absichtlicher Abschluss der Antwort, kein unaufgelöster Verweis. Der zugehörige `abschluss_text` erklärt die Konsequenz unmittelbar im Notizbuch. Beim ersten Brief kannst du die Begleitung ablehnen: keine nachträgliche Strafbeziehung, kein behaupteter Misserfolg, aber auch keine erfundene Lösung. Die Reihe bleibt offen und endet ohne weitere Berichte. Auf späteren Zwischenstufen kannst du denselben Rat ausdrücklich vertraulich erteilen. Der nächste Brief hängt den passend bedingten Nachsatz an. Genau eine Variante darf passen; keine zufällige Wahl.

Die letzte Antwort entscheidet zwischen Bestätigung und Beendigung des Austauschs. Keine weiteren, nicht gelieferten Briefe werden versprochen. Antwortfelder bleiben beim bloßen Schließen offen. Erst eine bestätigte Auswahl setzt genau eines der exklusiven Antwortflags und speichert den numerischen Antwort-Zeitanker. Eine zweite Antwort, Änderung nach Neuladen oder gleichzeitige Doppelantwort ist ausgeschlossen.

Bei anonymen Briefen ist jede Antwort optional und führt absichtlich nicht zum nächsten Brief. Das nächste Kapitel löst dessen Durchschlag unabhängig aus. Antwort 2 unterbricht weder die Aufklärung noch irgendein Ende. Die Eintragung des Namens liegt zeitlich vor allen DI-Antworten; kein Schweigen und keine Antwort wird als Zustimmung zur Pegelherrin umgedeutet.

### Zustellung und Rückstau

Einmal am Beginn jedes Spieltags und zusätzlich bei jedem Stadtwechsel fällige Sendungen prüfen. Sortierung: `kapitel` aufsteigend, dann gespeicherter Zeitpunkt `faellig_seit`, dann Brief-ID lexikografisch. Bei erstmals erfüllten Gates `faellig_seit` einmal speichern. Es gibt **höchstens zwei neue Sendungen pro globalem Spieltag und Spielstand**, auch bei mehreren Schaltern, Stadtwechseln, Koop oder Neuladen. Beim selben Tag nur das verbliebene Kontingent nutzen. Antworten erzeugen keine zusätzlichen Prüfungen und umgehen das Kontingent nicht.

Die Grenze betrifft das Eintreffen, nicht das Lesen, Antworten oder Abholen. Bereits zugestellte ungelesene Briefe belegen keinen neuen Tagesplatz. Fällige, noch nicht zugestellte Briefe bleiben im Rückstau, ohne Verfallsdatum. Änderungen der Beziehung oder Schreibfähigkeit vor Zustellung müssen erneut geprüft werden. Spätere Kapitel löschen weder Rückstau noch Postfach. Nach dem Finale darf das Postfach in der fortgesetzten Sitzung weiter ausgelesen werden; ein unmittelbar beendetes Spiel muss ausdrücklich nicht alle optionalen Briefe zeigen.

`post_<suffix>_zugestellt`, Postfacheintrag und Tageszähler in derselben Zustandsänderung speichern. Leseflag erst beim Öffnen setzen. Antwort und Antwortzeitpunkt ebenfalls atomar speichern. Ein `id` aus `briefe.json` beginnt bereits mit `post_`: daher lautet das Leseflag beispielsweise `post_ivy_1_gelesen`, **nicht** `post_post_ivy_1_gelesen`.

### Beilagen und das Schlüsselrätsel

`beilage` ist ein Mengenobjekt wie bestehende `gives_items`-Objekte: Item-ID auf positive Anzahl oder `schilling` auf den kleinen Geldbetrag. `{}` bedeutet keine Beilage. `post_kleingeld` ist ausschließlich die Metadatendefinition für die Geldsendung, kein zusätzlich zu erzeugendes Inventar-Item. Gewicht ist in Kilogramm, Wert in Schilling angegeben. Neue Fotos und Rätsel-/Lesestücke sind nicht handelbar; Silberstaub übernimmt das vorhandene Item, ohne Rezept oder Balancing zu ändern.

Lesen und Beilage abholen sind getrennte Vorgänge. Vor Ausgabe Kapazität prüfen. Bei vollem Inventar bleibt die ganze Beilage unbeansprucht. Erst erfolgreiche atomare Übertragung setzt `post_<suffix>_beilage_erhalten`. Wiederöffnen, anderer Schalter, Wiederverbinden und zweite Koop-Person erzeugen keine erneute Ausgabe. Geld und Gegenstände gemeinsam behandeln, falls eine spätere Erweiterung sie kombiniert.

Quill 1 liefert den Schlüssel, Quill 2 das Leseblatt, Quill 3 die ausgeschriebene Lösung: Das Loch ist eine Leseblende, kein Zugangsschlüssel. Kein Schloss, keine neue Karte, kein Rückreisezwang. Das Rätsel bleibt auch bei voller Tasche oder noch nicht abgeholter Beilage verständlich, da der dritte Brief die Zeile selbst wiedergibt. Die beigelegten Objekte bleiben Andenken, keine obligatorischen Questschlüssel.

### Koop

Zustellinstanz = Kampagne + Brief-ID + stabile Empfänger-ID. Persönliche Kontakte, Beziehungen, gelesene Briefe und Antwortflags sind empfängerbezogen. Eine Einladung/Verbindung darf die Empfänger-ID nicht durch die wechselnde Hostrolle ersetzen. Zwei berechtigte Personen können je eine persönliche Instanz erhalten; jede zählt als eine Sendung gegen dasselbe Tageslimit. Die Beilage gehört jeweils ihrer Instanz. Gleiche Brief-ID an zwei verschiedene Personen ist keine doppelte Ausgabe derselben Instanz.

Die fünf anonymen Durchschläge sind eine gemeinsame Instanz mit Empfänger `beide`, zeigen denselben Text und werden nur einmal zugestellt. Eine gemeinsame Antwort erfordert übereinstimmende Bestätigung beider; bei Uneinigkeit oder Abwesenheit bleibt sie offen. Story- und Ankunftsflags sind kampagnenweit. Personengebundene `post_*`-Flags dürfen nicht in einen globalen Flag-Sack fallen. Der Antworttransport ist eine Zustandsoperation; offline wird keine Fremdantwort angenommen.

Ein persönlicher Brief an Spieler 2 ist vor Freigabe für Spieler 1 nicht lesbar. Anzeigen darf Spieler 2 ausdrücklich erlauben; Antwort und Beilage bleiben bei Spieler 2. Abholung durch Spieler 1 darf die fremde Instanz nicht verbrauchen. Die vier speziellen UI-Zeilen stehen in `post.json.koop`.

## Prüfung

Vom Repository oder einem beliebigen anderen Arbeitsverzeichnis:

```sh
node docs/story/post/pruefen.mjs --self-test
```

Das Skript prüft alle JSON-Dateien im Paket, die vollständige feste Brief-ID-Liste, eindeutige Datensatz-IDs, nichtleere Texte, 29 echte NPC-Definitionen und Dialogquellen, vorhandene Beziehungszuordnungen, Betrefflänge, Wortgrenzen auch nach Anfügen der Nachsätze, Antwort- und Beilagenverweise, Flag-Produzenten, vorwärts gerichtete Antwortketten und die Stadtkontingente. Es enthält keine Netzwerkzugriffe und benötigt keine Pakete. Die ausführbaren Vertragsszenarien prüfen den spezifizierten Adapter; sie sind **kein Test einer bereits eingebauten Postfunktion**, denn diese wird hier nicht implementiert.

Die Wortzählung trennt an Leerraum. „Briefkörper“ zählt ausschließlich `text` in `briefe.json`, „Brieftexte gesamt“ zusätzlich alle alternativ verfassten Nachsätze einmal. Antworten, Betreffzeilen, UI, Metadaten und README werden dabei nicht als Brieftext ausgegeben.

### Letzte Prüf-Ausgabe

```text
Negativtests: 12/12 erkannt
DI Post: OK
JSON: 3 lesbar; IDs eindeutig; 91 Pflichtbriefe; 29 Absender mit geprüften Quellen
Verteilung: Kettlegate 30 / Wexmoor 20 / Dunscar 16 / Calderwick 12 / Briarholt 8 / anonym 5
Wortzahl Briefkörper: 8760; zusätzliche Nachsatzvarianten: 957; Brieftexte gesamt: 9717
Wortgrenzen: 90 reguläre Briefe 80–220; Oda einmalig drei Zeilen; Varianten gerendert höchstens 220
Strikt antwortabhängige Folgebriefe: 28; alle Antworten mit Flag und sichtbarer Folge
Beilagen: 11/16, davon 6 Fotos; Schalter 24 / Notizbuch 6 / Büro 3 / Koop 4
Vertragsszenarien: Tageslimit, Rückstau, Zeitanker, Antwortsperre, einmalige Beilage, Koop-Zugriff, Finalesperre OK
```

## Absender und Quellen

JSON-Zeiger stammen aus `post.json.absender`. „Neutral“ bedeutet keine vorhandene Beziehungsdefinition, nicht eine Zuordnung zu einer ähnlich benannten Figur.

| ID | Name | NPC-Quelle | Dialog-Quelle | Beziehungs-Quelle |
| --- | --- | --- | --- | --- |
| `ivy` | Ivy Marsh | `src/data/campaign.json#/npcs/ivy` | `src/data/dialogues/ebba.json#/ivy` | `src/data/beziehungen.json#/figuren/ivy` |
| `holt` | Sergeant Holt | `src/data/campaign.json#/npcs/holt` | `src/data/dialogues/revier.json#/holt` | `src/data/beziehungen.json#/figuren/holt` |
| `gouvernante` | Miss Imogen Wren | `src/data/campaign.json#/npcs/gouvernante` | `src/data/dialogues/fall78.json#/gouvernante` | Neutral 0; keine Definition |
| `elsbeth` | Elsbeth Rowe | `src/data/wexmoor.json#/npcs/elsbeth` | `src/data/wexmoor.json#/dialogues/elsbeth` | `src/data/beziehungen.json#/figuren/elsbeth` |
| `waescherin` | Martha Doyle | `src/data/campaign.json#/npcs/waescherin` | `src/data/dialogues/fall5.json#/waescherin` | Neutral 0; keine Definition |
| `molly` | Molly | `src/data/campaign.json#/npcs/molly` | `src/data/dialogues/fall78.json#/molly` | Neutral 0; keine Definition |
| `dunn` | Constable Dunn | `src/data/gebaeude.json#/npcs/dunn` | `src/data/gebaeude.json#/dialogues/dunn` | Neutral 0; keine Definition |
| `pip` | Benji | `src/data/campaign.json#/npcs/pip` | `src/data/dialogues/ashgrove.json#/pip` | `src/data/beziehungen.json#/figuren/pip` |
| `tresswell` | Ignaz Tresswell | `src/data/treffen.json#/npcs/tresswell` | `src/data/treffen.json#/dialogues/tresswell` | Neutral 0; keine Definition |
| `quill` | Mr. Quill | `src/data/campaign.json#/npcs/quill` | `src/data/dialogues/altmarkt.json#/quill` | `src/data/beziehungen.json#/figuren/quill` |
| `wx_pfandleiherin` | Pfandleiherin Maud Keel | `src/data/wexmoor.json#/npcs/wx_pfandleiherin` | `src/data/wexmoor.json#/dialogues/wx_pfandleiherin` | Neutral 0; keine Definition |
| `wxn_krabbe` | „Krabbe“ | `src/data/packs/k2_akte/npcs.json#/wxn_krabbe` | `src/data/packs/k2_akte/dialogues.json#/k2v_krabbe` | Neutral 0; keine Definition |
| `zirkel_lichtlose` | Schwester Asche | `src/data/treffen.json#/npcs/zirkel_lichtlose` | `src/data/treffen.json#/dialogues/zirkel_lichtlose` | Neutral 0; keine Definition |
| `wxn_maler` | Lionel Vane | `src/data/packs/k2_akten/npcs.json#/wxn_maler` | `src/data/packs/k2_akten/dialogues.json#/k2a_letztes_bild_kontakt` | Neutral 0; keine Definition |
| `sedge` | Mutter Sedge | `src/data/wexmoor.json#/npcs/sedge` | `src/data/wexmoor.json#/dialogues/sedge` | `src/data/beziehungen.json#/figuren/sedge` |
| `druce` | Abel Druce | `src/data/wexmoor.json#/npcs/druce` | `src/data/wexmoor.json#/dialogues/druce` | `src/data/beziehungen.json#/figuren/druce` |
| `zirkel_schichtbund` | Agathe Rooke | `src/data/packs/k3_handel/npcs.json#/zirkel_schichtbund` | `src/data/packs/k3_handel/dialogues.json#/zirkel_schichtbund` | Neutral 0; keine Definition |
| `fasserin` | Oda Kessel | `src/data/treffen.json#/npcs/fasserin` | `src/data/treffen.json#/dialogues/fasserin` | Neutral 0; keine Definition |
| `k3_oren` | Oren Fallowby | `src/data/packs/k3_akte/npcs.json#/k3_oren` | `src/data/packs/k3_akte/dialogues.json#/k3a_oren` | `src/data/beziehungen.json#/figuren/k3_oren` |
| `k3_nellie` | Nellie Swarth | `src/data/packs/k3_akte/npcs.json#/k3_nellie` | `src/data/packs/k3_akte/dialogues.json#/k3a_nellie` | `src/data/beziehungen.json#/figuren/k3_nellie` |
| `k3_weichenstellerin` | Hedda Quist | `src/data/packs/k3_pruefungen/npcs.json#/k3_weichenstellerin` | `src/data/packs/k3_pruefungen/dialogues.json#/k3p_hedda` | `src/data/beziehungen.json#/figuren/k3_weichenstellerin` |
| `cw_crayford` | Tilda „Klammer“ Crayford | `src/data/packs/vorrat_figuren/npcs.json#/cw_crayford` | `src/data/packs/vorrat_figuren/dialogues.json#/bj_cw_crayford` | Neutral 0; keine Definition |
| `cw_darnell` | Vera Darnell | `src/data/packs/vorrat_figuren/npcs.json#/cw_darnell` | `src/data/packs/vorrat_figuren/dialogues.json#/bj_cw_darnell` | Neutral 0; keine Definition |
| `cw_pritch` | Ewan Pritch | `src/data/packs/vorrat_figuren/npcs.json#/cw_pritch` | `src/data/packs/vorrat_figuren/dialogues.json#/bj_cw_pritch` | Neutral 0; keine Definition |
| `cwn_e_griffmacherin` | Hanna Krell | `src/data/packs/k4_nebenquests/npcs.json#/cwn_e_griffmacherin` | `src/data/packs/k4_nebenquests/dialogues.json#/cwn_e_griffmacherin` | Neutral 0; keine Definition |
| `bhn_e_patientin` | Mara Sill | `src/data/packs/k5_nebenquests/npcs.json#/bhn_e_patientin` | `src/data/packs/k5_nebenquests/dialogues.json#/bhn_e_patientin` | Neutral 0; keine Definition |
| `bhn_e_lehrer` | Tobin Yew | `src/data/packs/k5_nebenquests/npcs.json#/bhn_e_lehrer` | `src/data/packs/k5_nebenquests/dialogues.json#/bhn_e_lehrer` | Neutral 0; keine Definition |
| `bh_orla_fencrest` | Orla Fencrest | `src/data/packs/vorrat_figuren/npcs.json#/bh_orla_fencrest` | `src/data/packs/vorrat_figuren/dialogues.json#/bj_bh_orla_fencrest` | Neutral 0; keine Definition |
| `bh_henshall` | Beatrice Henshall | `src/data/packs/vorrat_figuren/npcs.json#/bh_henshall` | `src/data/packs/vorrat_figuren/dialogues.json#/bj_bh_henshall` | Neutral 0; keine Definition |

## Briefbögen

| Reihe | Thema | Briefe | Früheste Kapitel | Entscheidungsbogen |
| --- | --- | --- | --- | --- |
| `post_reihe_ivy` | Ein Fenster ohne neugierige Besucher | `post_ivy_1`, `post_ivy_2`, `post_ivy_3` | 2, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_holt` | Unterschriften unter einer Nachtwache | `post_holt_1`, `post_holt_2`, `post_holt_3` | 2, 3, 5 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_gouvernante` | Ein leeres Namensfeld im Waisenhaus | `post_gouvernante_1`, `post_gouvernante_2`, `post_gouvernante_3` | 2, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_elsbeth` | Der eigene Name auf einer Naht | `post_elsbeth_1`, `post_elsbeth_2`, `post_elsbeth_3` | 3, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_waescherin` | Eine verschwundene Waschrechnung | `post_waescherin_1`, `post_waescherin_2`, `post_waescherin_3` | 2, 4, 5 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_molly` | Ein Puppenbett mit eigener Grenze | `post_molly_1`, `post_molly_2`, `post_molly_3` | 2, 3, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_dunn` | Der falsche Deckel in der Kantine | `post_dunn_1`, `post_dunn_2`, `post_dunn_3` | 2, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_pip` | Eine Berichtigung statt einer Schlagzeile | `post_pip_1`, `post_pip_2`, `post_pip_3` | 2, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_tresswell` | Ein Gewicht ohne Besitzer | `post_tresswell_1`, `post_tresswell_2`, `post_tresswell_3` | 2, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_quill` | Ein Schlüssel ohne Schloss | `post_quill_1`, `post_quill_2`, `post_quill_3` | 2, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_wx_pfandleiherin` | Ein Pfandring ohne aussprechbaren Namen | `post_wx_pfandleiherin_1`, `post_wx_pfandleiherin_2`, `post_wx_pfandleiherin_3`, `post_wx_pfandleiherin_4` | 3, 4, 5, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_wxn_krabbe` | Ein trockener Platz für die Fundstücke | `post_wxn_krabbe_1`, `post_wxn_krabbe_2`, `post_wxn_krabbe_3`, `post_wxn_krabbe_4` | 3, 4, 5, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_zirkel_lichtlose` | Decken mit einem verräterischen Zeichen | `post_zirkel_lichtlose_1`, `post_zirkel_lichtlose_2`, `post_zirkel_lichtlose_3` | 3, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_wxn_maler` | Ein Bild ohne erfundenen Blick | `post_wxn_maler_1`, `post_wxn_maler_2`, `post_wxn_maler_3` | 3, 5, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_sedge` | Ein unbeschriftetes Täfelchen am Wasser | `post_sedge_1`, `post_sedge_2`, `post_sedge_3` | 3, 4, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_druce` | Ein unbeaufsichtigtes Schleusenseil | `post_druce_1`, `post_druce_2`, `post_druce_3` | 3, 5, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_zirkel_schichtbund` | Ein Name auf zwei Schichtmarken | `post_zirkel_schichtbund_1`, `post_zirkel_schichtbund_2`, `post_zirkel_schichtbund_3`, `post_zirkel_schichtbund_4` | 4, 5, 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_fasserin` | Odas einmaliger Werkstattbescheid | `post_fasserin_1` | 4 | Einmaliger Befund; Antwort steuert Erklärung bei regulärer Abholung. |
| `post_reihe_k3_oren` | Eine ausgemusterte Stufe am Wagen | `post_k3_oren_1`, `post_k3_oren_2`, `post_k3_oren_3`, `post_k3_oren_4` | 4, 5, 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_k3_nellie` | Ein Telegramm mit unklarer Zustellung | `post_k3_nellie_1`, `post_k3_nellie_2`, `post_k3_nellie_3`, `post_k3_nellie_4` | 4, 5, 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_k3_weichenstellerin` | Eine Entscheidung ohne Prüfungsnote | `post_k3_weichenstellerin_1`, `post_k3_weichenstellerin_2`, `post_k3_weichenstellerin_3` | 4, 5, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_cw_crayford` | Eine Bürgschaft im falschen Einband | `post_cw_crayford_1`, `post_cw_crayford_2`, `post_cw_crayford_3` | 5, 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_cw_darnell` | Ein Bürge hinter der Bahnsteiglinie | `post_cw_darnell_1`, `post_cw_darnell_2`, `post_cw_darnell_3` | 5, 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_cw_pritch` | Der Streiktopf und eine offene Bürgschaft | `post_cw_pritch_1`, `post_cw_pritch_2`, `post_cw_pritch_3` | 5, 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_cwn_e_griffmacherin` | Ein Griff für zwei ungleiche Hände | `post_cwn_e_griffmacherin_1`, `post_cwn_e_griffmacherin_2`, `post_cwn_e_griffmacherin_3` | 5, 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_bhn_e_patientin` | Eine entlassene Buchhalterin behält ihren Stuhl | `post_bhn_e_patientin_1`, `post_bhn_e_patientin_2` | 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_bhn_e_lehrer` | Ein Unterricht ohne fremde Namen | `post_bhn_e_lehrer_1`, `post_bhn_e_lehrer_2` | 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_bh_orla_fencrest` | Eine Besuchsliste bleibt freiwillig | `post_bh_orla_fencrest_1`, `post_bh_orla_fencrest_2` | 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_bh_henshall` | Eine Melodie ohne Gedächtnisprüfung | `post_bh_henshall_1`, `post_bh_henshall_2` | 6, 6 | Erster Rat → weiterer Bericht; Ablehnung → offener Abschluss. Später ggf. vertraulicher Nachsatz. |
| `post_reihe_ohne_absender` | Der Brief aus Fall 9 trägt den Namen nach Varrowmouth | `post_ohne_absender_1`, `post_ohne_absender_2`, `post_ohne_absender_3`, `post_ohne_absender_4`, `post_ohne_absender_5` | 2, 3, 4, 5, 6 | Unabhängige Kapitelzustellung; Aufklärung erst nach Akt IV. |

## Flag-Liste und Zustand

Die folgenden Muster gelten pro Instanz und sind vollständig durch die feste ID-Liste darunter bestimmt. Zeitanker sind gesondert gespeichert; ihnen wird kein Wahrheitswert untergeschoben.

| Flag oder Zustand | Produzent | Bedeutung / Lebensdauer |
| --- | --- | --- |
| `k2_arrived` | `src/data/wexmoor.json` | Vorhandenes Storyereignis; nur lesen |
| `k3_arrived` | `src/data/packs/k3_orte/maps.json` | Vorhandenes Storyereignis; nur lesen |
| `k4_arrived` | `src/data/packs/k4_nebenquests/einwohner.json` | Vorhandenes Storyereignis; nur lesen |
| `k5_arrived` | `src/data/packs/k5_nebenquests/einwohner.json` | Vorhandenes Storyereignis; nur lesen |
| `k6_arrived` | `docs/art/codex_CT_k6_akte.md` | Vorhandenes Storyereignis; nur lesen |
| `k6_akt4_done` | `docs/art/codex_CT_k6_akte.md` | Vorhandenes Storyereignis; nur lesen |
| `post_kontakt_ivy` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_holt` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_gouvernante` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_elsbeth` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_waescherin` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_molly` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_dunn` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_pip` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_tresswell` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_quill` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_wx_pfandleiherin` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_wxn_krabbe` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_zirkel_lichtlose` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_wxn_maler` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_sedge` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_druce` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_zirkel_schichtbund` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_fasserin` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_k3_oren` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_k3_nellie` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_k3_weichenstellerin` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_cw_crayford` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_cw_darnell` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_cw_pritch` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_cwn_e_griffmacherin` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_bhn_e_patientin` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_bhn_e_lehrer` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_bh_orla_fencrest` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_kontakt_bh_henshall` | Postadapter, person | Persönliches Gespräch abgeschlossen; im aktuellen Ende als lebend, frei und schreibfähig bestätigt. |
| `post_fasserin_auftrag_offen` | Postadapter, person | Regulärer Fasserin-Auftrag ist offen; nach Abschluss rücksetzen. |
| `post_ankunft_2 … post_ankunft_6` | Erste Kapitelankunft | Numerischer absoluter Spieltag, unveränderlich |
| `post_<suffix>_zugestellt` | Zustelltransaktion | Boolean; einmal je Instanz |
| `post_<suffix>_gelesen` | Brief öffnen | Boolean; bleibt gesetzt |
| `post_<suffix>_beantwortet` | Antwort bestätigen | Numerischer Spieltag; fehlt vor Antwort |
| `post_antwort_<suffix>_1 / _2` | Antwort bestätigen | Genau ein exklusives Boolean; bleibt gesetzt |
| `post_<suffix>_beilage_erhalten` | Beilage erfolgreich übertragen | Boolean; nur bei vorhandener Beilage |
| `post_tageszaehler` | Zustellung | Objekt aus globalem Spieltag und Anzahl; maximal 2 |
| `post_faellig_seit` | Erste Fälligkeit | Numerischer Spieltag je Instanz |
| `post_lesefreigabe` | Empfänger bestätigt Teilen | Empfängerbezogene Freigabe für die zweite Person |

### Konkrete Lese- und Antwortflags

Keines dieser Flags verändert von selbst einen Hauptfall, eine Beziehung oder ein Ende. Abgelehnte Erstantworten haben ausdrücklich kein Folgebriefziel.

| Brief | Gelesen | Antwort 1 | Antwort 2 |
| --- | --- | --- | --- |
| `post_ivy_1` | `post_ivy_1_gelesen` | `post_antwort_ivy_1_1` | `post_antwort_ivy_1_2` |
| `post_ivy_2` | `post_ivy_2_gelesen` | `post_antwort_ivy_2_1` | `post_antwort_ivy_2_2` |
| `post_ivy_3` | `post_ivy_3_gelesen` | `post_antwort_ivy_3_1` | `post_antwort_ivy_3_2` |
| `post_holt_1` | `post_holt_1_gelesen` | `post_antwort_holt_1_1` | `post_antwort_holt_1_2` |
| `post_holt_2` | `post_holt_2_gelesen` | `post_antwort_holt_2_1` | `post_antwort_holt_2_2` |
| `post_holt_3` | `post_holt_3_gelesen` | `post_antwort_holt_3_1` | `post_antwort_holt_3_2` |
| `post_gouvernante_1` | `post_gouvernante_1_gelesen` | `post_antwort_gouvernante_1_1` | `post_antwort_gouvernante_1_2` |
| `post_gouvernante_2` | `post_gouvernante_2_gelesen` | `post_antwort_gouvernante_2_1` | `post_antwort_gouvernante_2_2` |
| `post_gouvernante_3` | `post_gouvernante_3_gelesen` | `post_antwort_gouvernante_3_1` | `post_antwort_gouvernante_3_2` |
| `post_elsbeth_1` | `post_elsbeth_1_gelesen` | `post_antwort_elsbeth_1_1` | `post_antwort_elsbeth_1_2` |
| `post_elsbeth_2` | `post_elsbeth_2_gelesen` | `post_antwort_elsbeth_2_1` | `post_antwort_elsbeth_2_2` |
| `post_elsbeth_3` | `post_elsbeth_3_gelesen` | `post_antwort_elsbeth_3_1` | `post_antwort_elsbeth_3_2` |
| `post_waescherin_1` | `post_waescherin_1_gelesen` | `post_antwort_waescherin_1_1` | `post_antwort_waescherin_1_2` |
| `post_waescherin_2` | `post_waescherin_2_gelesen` | `post_antwort_waescherin_2_1` | `post_antwort_waescherin_2_2` |
| `post_waescherin_3` | `post_waescherin_3_gelesen` | `post_antwort_waescherin_3_1` | `post_antwort_waescherin_3_2` |
| `post_molly_1` | `post_molly_1_gelesen` | `post_antwort_molly_1_1` | `post_antwort_molly_1_2` |
| `post_molly_2` | `post_molly_2_gelesen` | `post_antwort_molly_2_1` | `post_antwort_molly_2_2` |
| `post_molly_3` | `post_molly_3_gelesen` | `post_antwort_molly_3_1` | `post_antwort_molly_3_2` |
| `post_dunn_1` | `post_dunn_1_gelesen` | `post_antwort_dunn_1_1` | `post_antwort_dunn_1_2` |
| `post_dunn_2` | `post_dunn_2_gelesen` | `post_antwort_dunn_2_1` | `post_antwort_dunn_2_2` |
| `post_dunn_3` | `post_dunn_3_gelesen` | `post_antwort_dunn_3_1` | `post_antwort_dunn_3_2` |
| `post_pip_1` | `post_pip_1_gelesen` | `post_antwort_pip_1_1` | `post_antwort_pip_1_2` |
| `post_pip_2` | `post_pip_2_gelesen` | `post_antwort_pip_2_1` | `post_antwort_pip_2_2` |
| `post_pip_3` | `post_pip_3_gelesen` | `post_antwort_pip_3_1` | `post_antwort_pip_3_2` |
| `post_tresswell_1` | `post_tresswell_1_gelesen` | `post_antwort_tresswell_1_1` | `post_antwort_tresswell_1_2` |
| `post_tresswell_2` | `post_tresswell_2_gelesen` | `post_antwort_tresswell_2_1` | `post_antwort_tresswell_2_2` |
| `post_tresswell_3` | `post_tresswell_3_gelesen` | `post_antwort_tresswell_3_1` | `post_antwort_tresswell_3_2` |
| `post_quill_1` | `post_quill_1_gelesen` | `post_antwort_quill_1_1` | `post_antwort_quill_1_2` |
| `post_quill_2` | `post_quill_2_gelesen` | `post_antwort_quill_2_1` | `post_antwort_quill_2_2` |
| `post_quill_3` | `post_quill_3_gelesen` | `post_antwort_quill_3_1` | `post_antwort_quill_3_2` |
| `post_wx_pfandleiherin_1` | `post_wx_pfandleiherin_1_gelesen` | `post_antwort_wx_pfandleiherin_1_1` | `post_antwort_wx_pfandleiherin_1_2` |
| `post_wx_pfandleiherin_2` | `post_wx_pfandleiherin_2_gelesen` | `post_antwort_wx_pfandleiherin_2_1` | `post_antwort_wx_pfandleiherin_2_2` |
| `post_wx_pfandleiherin_3` | `post_wx_pfandleiherin_3_gelesen` | `post_antwort_wx_pfandleiherin_3_1` | `post_antwort_wx_pfandleiherin_3_2` |
| `post_wx_pfandleiherin_4` | `post_wx_pfandleiherin_4_gelesen` | `post_antwort_wx_pfandleiherin_4_1` | `post_antwort_wx_pfandleiherin_4_2` |
| `post_wxn_krabbe_1` | `post_wxn_krabbe_1_gelesen` | `post_antwort_wxn_krabbe_1_1` | `post_antwort_wxn_krabbe_1_2` |
| `post_wxn_krabbe_2` | `post_wxn_krabbe_2_gelesen` | `post_antwort_wxn_krabbe_2_1` | `post_antwort_wxn_krabbe_2_2` |
| `post_wxn_krabbe_3` | `post_wxn_krabbe_3_gelesen` | `post_antwort_wxn_krabbe_3_1` | `post_antwort_wxn_krabbe_3_2` |
| `post_wxn_krabbe_4` | `post_wxn_krabbe_4_gelesen` | `post_antwort_wxn_krabbe_4_1` | `post_antwort_wxn_krabbe_4_2` |
| `post_zirkel_lichtlose_1` | `post_zirkel_lichtlose_1_gelesen` | `post_antwort_zirkel_lichtlose_1_1` | `post_antwort_zirkel_lichtlose_1_2` |
| `post_zirkel_lichtlose_2` | `post_zirkel_lichtlose_2_gelesen` | `post_antwort_zirkel_lichtlose_2_1` | `post_antwort_zirkel_lichtlose_2_2` |
| `post_zirkel_lichtlose_3` | `post_zirkel_lichtlose_3_gelesen` | `post_antwort_zirkel_lichtlose_3_1` | `post_antwort_zirkel_lichtlose_3_2` |
| `post_wxn_maler_1` | `post_wxn_maler_1_gelesen` | `post_antwort_wxn_maler_1_1` | `post_antwort_wxn_maler_1_2` |
| `post_wxn_maler_2` | `post_wxn_maler_2_gelesen` | `post_antwort_wxn_maler_2_1` | `post_antwort_wxn_maler_2_2` |
| `post_wxn_maler_3` | `post_wxn_maler_3_gelesen` | `post_antwort_wxn_maler_3_1` | `post_antwort_wxn_maler_3_2` |
| `post_sedge_1` | `post_sedge_1_gelesen` | `post_antwort_sedge_1_1` | `post_antwort_sedge_1_2` |
| `post_sedge_2` | `post_sedge_2_gelesen` | `post_antwort_sedge_2_1` | `post_antwort_sedge_2_2` |
| `post_sedge_3` | `post_sedge_3_gelesen` | `post_antwort_sedge_3_1` | `post_antwort_sedge_3_2` |
| `post_druce_1` | `post_druce_1_gelesen` | `post_antwort_druce_1_1` | `post_antwort_druce_1_2` |
| `post_druce_2` | `post_druce_2_gelesen` | `post_antwort_druce_2_1` | `post_antwort_druce_2_2` |
| `post_druce_3` | `post_druce_3_gelesen` | `post_antwort_druce_3_1` | `post_antwort_druce_3_2` |
| `post_zirkel_schichtbund_1` | `post_zirkel_schichtbund_1_gelesen` | `post_antwort_zirkel_schichtbund_1_1` | `post_antwort_zirkel_schichtbund_1_2` |
| `post_zirkel_schichtbund_2` | `post_zirkel_schichtbund_2_gelesen` | `post_antwort_zirkel_schichtbund_2_1` | `post_antwort_zirkel_schichtbund_2_2` |
| `post_zirkel_schichtbund_3` | `post_zirkel_schichtbund_3_gelesen` | `post_antwort_zirkel_schichtbund_3_1` | `post_antwort_zirkel_schichtbund_3_2` |
| `post_zirkel_schichtbund_4` | `post_zirkel_schichtbund_4_gelesen` | `post_antwort_zirkel_schichtbund_4_1` | `post_antwort_zirkel_schichtbund_4_2` |
| `post_fasserin_1` | `post_fasserin_1_gelesen` | `post_antwort_fasserin_1_1` | `post_antwort_fasserin_1_2` |
| `post_k3_oren_1` | `post_k3_oren_1_gelesen` | `post_antwort_k3_oren_1_1` | `post_antwort_k3_oren_1_2` |
| `post_k3_oren_2` | `post_k3_oren_2_gelesen` | `post_antwort_k3_oren_2_1` | `post_antwort_k3_oren_2_2` |
| `post_k3_oren_3` | `post_k3_oren_3_gelesen` | `post_antwort_k3_oren_3_1` | `post_antwort_k3_oren_3_2` |
| `post_k3_oren_4` | `post_k3_oren_4_gelesen` | `post_antwort_k3_oren_4_1` | `post_antwort_k3_oren_4_2` |
| `post_k3_nellie_1` | `post_k3_nellie_1_gelesen` | `post_antwort_k3_nellie_1_1` | `post_antwort_k3_nellie_1_2` |
| `post_k3_nellie_2` | `post_k3_nellie_2_gelesen` | `post_antwort_k3_nellie_2_1` | `post_antwort_k3_nellie_2_2` |
| `post_k3_nellie_3` | `post_k3_nellie_3_gelesen` | `post_antwort_k3_nellie_3_1` | `post_antwort_k3_nellie_3_2` |
| `post_k3_nellie_4` | `post_k3_nellie_4_gelesen` | `post_antwort_k3_nellie_4_1` | `post_antwort_k3_nellie_4_2` |
| `post_k3_weichenstellerin_1` | `post_k3_weichenstellerin_1_gelesen` | `post_antwort_k3_weichenstellerin_1_1` | `post_antwort_k3_weichenstellerin_1_2` |
| `post_k3_weichenstellerin_2` | `post_k3_weichenstellerin_2_gelesen` | `post_antwort_k3_weichenstellerin_2_1` | `post_antwort_k3_weichenstellerin_2_2` |
| `post_k3_weichenstellerin_3` | `post_k3_weichenstellerin_3_gelesen` | `post_antwort_k3_weichenstellerin_3_1` | `post_antwort_k3_weichenstellerin_3_2` |
| `post_cw_crayford_1` | `post_cw_crayford_1_gelesen` | `post_antwort_cw_crayford_1_1` | `post_antwort_cw_crayford_1_2` |
| `post_cw_crayford_2` | `post_cw_crayford_2_gelesen` | `post_antwort_cw_crayford_2_1` | `post_antwort_cw_crayford_2_2` |
| `post_cw_crayford_3` | `post_cw_crayford_3_gelesen` | `post_antwort_cw_crayford_3_1` | `post_antwort_cw_crayford_3_2` |
| `post_cw_darnell_1` | `post_cw_darnell_1_gelesen` | `post_antwort_cw_darnell_1_1` | `post_antwort_cw_darnell_1_2` |
| `post_cw_darnell_2` | `post_cw_darnell_2_gelesen` | `post_antwort_cw_darnell_2_1` | `post_antwort_cw_darnell_2_2` |
| `post_cw_darnell_3` | `post_cw_darnell_3_gelesen` | `post_antwort_cw_darnell_3_1` | `post_antwort_cw_darnell_3_2` |
| `post_cw_pritch_1` | `post_cw_pritch_1_gelesen` | `post_antwort_cw_pritch_1_1` | `post_antwort_cw_pritch_1_2` |
| `post_cw_pritch_2` | `post_cw_pritch_2_gelesen` | `post_antwort_cw_pritch_2_1` | `post_antwort_cw_pritch_2_2` |
| `post_cw_pritch_3` | `post_cw_pritch_3_gelesen` | `post_antwort_cw_pritch_3_1` | `post_antwort_cw_pritch_3_2` |
| `post_cwn_e_griffmacherin_1` | `post_cwn_e_griffmacherin_1_gelesen` | `post_antwort_cwn_e_griffmacherin_1_1` | `post_antwort_cwn_e_griffmacherin_1_2` |
| `post_cwn_e_griffmacherin_2` | `post_cwn_e_griffmacherin_2_gelesen` | `post_antwort_cwn_e_griffmacherin_2_1` | `post_antwort_cwn_e_griffmacherin_2_2` |
| `post_cwn_e_griffmacherin_3` | `post_cwn_e_griffmacherin_3_gelesen` | `post_antwort_cwn_e_griffmacherin_3_1` | `post_antwort_cwn_e_griffmacherin_3_2` |
| `post_bhn_e_patientin_1` | `post_bhn_e_patientin_1_gelesen` | `post_antwort_bhn_e_patientin_1_1` | `post_antwort_bhn_e_patientin_1_2` |
| `post_bhn_e_patientin_2` | `post_bhn_e_patientin_2_gelesen` | `post_antwort_bhn_e_patientin_2_1` | `post_antwort_bhn_e_patientin_2_2` |
| `post_bhn_e_lehrer_1` | `post_bhn_e_lehrer_1_gelesen` | `post_antwort_bhn_e_lehrer_1_1` | `post_antwort_bhn_e_lehrer_1_2` |
| `post_bhn_e_lehrer_2` | `post_bhn_e_lehrer_2_gelesen` | `post_antwort_bhn_e_lehrer_2_1` | `post_antwort_bhn_e_lehrer_2_2` |
| `post_bh_orla_fencrest_1` | `post_bh_orla_fencrest_1_gelesen` | `post_antwort_bh_orla_fencrest_1_1` | `post_antwort_bh_orla_fencrest_1_2` |
| `post_bh_orla_fencrest_2` | `post_bh_orla_fencrest_2_gelesen` | `post_antwort_bh_orla_fencrest_2_1` | `post_antwort_bh_orla_fencrest_2_2` |
| `post_bh_henshall_1` | `post_bh_henshall_1_gelesen` | `post_antwort_bh_henshall_1_1` | `post_antwort_bh_henshall_1_2` |
| `post_bh_henshall_2` | `post_bh_henshall_2_gelesen` | `post_antwort_bh_henshall_2_1` | `post_antwort_bh_henshall_2_2` |
| `post_ohne_absender_1` | `post_ohne_absender_1_gelesen` | `post_antwort_ohne_absender_1_1` | `post_antwort_ohne_absender_1_2` |
| `post_ohne_absender_2` | `post_ohne_absender_2_gelesen` | `post_antwort_ohne_absender_2_1` | `post_antwort_ohne_absender_2_2` |
| `post_ohne_absender_3` | `post_ohne_absender_3_gelesen` | `post_antwort_ohne_absender_3_1` | `post_antwort_ohne_absender_3_2` |
| `post_ohne_absender_4` | `post_ohne_absender_4_gelesen` | `post_antwort_ohne_absender_4_1` | `post_antwort_ohne_absender_4_2` |
| `post_ohne_absender_5` | `post_ohne_absender_5_gelesen` | `post_antwort_ohne_absender_5_1` | `post_antwort_ohne_absender_5_2` |

## Beilagenübersicht

| ID | Gewicht (kg) | Wert (Schilling) | Zustellung |
| --- | ---: | ---: | --- |
| `post_foto_1` | 0.01 | 0 | `post_molly_3` |
| `post_foto_2` | 0.01 | 0 | `post_wxn_krabbe_4` |
| `post_foto_3` | 0.01 | 0 | `post_druce_3` |
| `post_foto_4` | 0.01 | 0 | `post_k3_oren_4` |
| `post_foto_5` | 0.01 | 0 | `post_cwn_e_griffmacherin_3` |
| `post_foto_6` | 0.01 | 0 | `post_bhn_e_patientin_2` |
| `post_schluessel_ohne_schloss` | 0.04 | 0 | `post_quill_1` |
| `post_leseblatt` | 0.01 | 0 | `post_quill_2` |
| `post_fragen_vor_der_erklaerung` | 0.01 | 0 | `post_bhn_e_lehrer_2` |
| `silberstaub` | 0.01 | 12 | `post_tresswell_3` |
| `post_kleingeld` | 0.02 | 8 | `post_waescherin_3` |
