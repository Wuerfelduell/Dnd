# Codex AD: Lesetexte und Lore

Fertiger Text- und Datenentwurf für **Nebelakten**, noch nicht ins Spiel eingebunden. Referenz: `docs/art/codex_AD_lesetexte_lore.md`, Inhaltsstand `bf3088505e19b1c94a991ed791ae0852c10e382e`. Der vor Veröffentlichung geprüfte neuere Hauptbranch enthielt keine Änderungen an den verwendeten Inhaltsdateien oder am AD-Auftrag.

| Datei | Inhalt | Umfang |
| --- | --- | ---: |
| `zeitungen.json` | Kettlegater Kurier und Wexmoorer Bote | 42 Ausgaben |
| `lesestuecke.json` | Bücher, Briefe, Aushänge, Lieder mit Fundort | 40, je 20 pro Stadt |
| `gerede.json` | Kurze Passantensätze nach Stadt und Karte | 120, je 60 pro Stadt |
| `item_texte.json` | Bestehende Beschreibung `alt`, vorgeschlagene Beschreibung `neu` | 58 Items |
| `bestiarium.json` | Beschreibung und belegbarer Kampftipp | 140 Begegnungen |
| `pruefen.mjs` | Prüfskript ohne zusätzliche Pakete | Node |
| `offene_punkte.md` | Anzeige, Zustandsgrenzen und Integrationshinweise | Redaktion/Integration |

## Herkunft und Abdeckung

Gelesen wurden die neun Fälle, `campaign.json`, die Wexmoor-Akte einschließlich Enden und Aktenaufträgen, die Lesetexte der Karten und `dialogues/fundstuecke.json`. Gegenstände und Gegner werden zusätzlich über den bestehenden `buildContent`-Zusammenbau kontrolliert. Dadurch fehlen weder Reise- und Sektentreffen noch Einzelgänger, Übungskämpfe oder die dynamisch erzeugten Elitevarianten.

Das Bestiarium enthält 104 Grundbegegnungen und 36 bereits vom Spiel erzeugte Eliten. Alle 311 zur Laufzeit verfügbaren Items wurden für die Beschreibungen berücksichtigt, einschließlich Formeln, Tränken und Artefakten. Alle 19 Beschreibungen mit weniger als acht Wörtern wurden ersetzt. Weitere 39 kurze Zutaten-, Verbrauchs- und Ausrüstungstexte wurden erweitert, damit der geforderte Mindestumfang überschritten wird. Vorhandene Zahlen und die Sätze mit diesen Angaben bleiben wortgleich erhalten. Einträge verändern ausschließlich die spätere `desc`, niemals Werte, Effekte oder Preise. Der Vergleich `alt` muss bei der Übernahme weiterhin stimmen.

## Bedingungen und Zeitungen

`requires_flags` verlangt sämtliche genannten Flags. Bereits ein vorhandenes `hide_if_flags`-Flag blendet den Datensatz aus. Das sind die bestehenden Regeln von `GameState.meets`. Die Arrays sind keine alternativen Bedingungen und ihre Reihenfolge hat keine Bedeutung.

- Der Kurier enthält **32 Ausgaben für 32 definierte Kapitel-1-Enden**. `c7_wren` steht tatsächlich in `case_08.json`, gehört aber zu Fall 7. Die drei gemeinsamen Abschlüsse `c8_perfect`, `c8_good`, `c8_early` erwähnen die gleichzeitige Schließung von Thornes Fall. Sie erzeugen keine zusätzliche direkte `c7_wren`-Ausgabe.
- Enden mit gemeinsamen Flags werden durch Ausschlüsse getrennt, etwa `c1_half` gegen `c1_wrong`, `c2_good` gegen `ritual_broken` oder `c9_early` gegen `c9_wrong`.
- Der Bote hat **vier Aktausgaben, vier Schlussausgaben und zwei alternative Fassungen** für Akt III/IV nach dem bereits vorhandenen Flag `k2_price_beaten`. Die Alternativen ersetzen die jeweilige normale Ausgabe. Zu einem gegebenen Wexmoor-Spielstand passt höchstens eine aktuelle Ausgabe.
- Die schärfere Amtssprache nach dem Hafenstreit bezeichnet ein tatsächlich geschehenes Ereignis. Sie behauptet ausdrücklich keine gegenwärtige Fahndungsstufe. Der fehlende numerische Filter steht in `offene_punkte.md`.
- Nach Freispruch beziehungsweise Erlöschen des Feuers korrigiert der Bote seine früheren Anschuldigungen. Beim Lichtmeister-Ende wechselt die Zensurunterschrift, beim Meer-Ende bleibt Brandts Zensur bestehen.
- Zeitungen sind Berichte zum jeweiligen Abschlusszeitpunkt, keine rückwirkende Allwissenheit. Die Redaktion kann sich irren; Tatsachen des vom Spieler gewählten Endes werden dadurch nicht umgeschrieben.

Für ein dauerhaftes Zeitungsarchiv muss die Integration beim Abschluss die passende Ausgaben-ID speichern. Späteres erneutes Auswerten aller historischen Abschlussflags ist dafür ungeeignet: Fall 8 kann frühere Aussagen zu Fall 7 überholen. Die hier gelieferten Bedingungen lösen die Auswahl am Veröffentlichungszeitpunkt; sie führen kein Archiv ein.

## Lesestücke und Gerede

Fundorte sind Vorschläge mit **nullbasierten** Kacheln `[x, y]`. Die äußeren Felder `map` und `tile` sind Platzierungsdaten. Beim Einbau `tile` auf das Interactable übertragen und dieses in die passende Karte einsetzen. Alle Texte nutzen das vorhandene Sprite `paper`. Keine Belohnung, kein neuer Auftrag, kein neues Flag und kein zusätzlicher Hinweis wird beim Lesen vergeben. `visible_if: {}` bedeutet nach Erreichen der Karte sichtbar.

Die Kacheln liegen auf erreichbarem Boden neben Wänden, Möbeln beziehungsweise den Ruinen der Altstadt. Das Skript berücksichtigt feste Dekoblockaden und reservierte Objektpositionen. Die spätere grafische Kontrolle bleibt sinnvoll, weil eine große PNG-Grafik mehr Fläche verdecken kann als ihre Kollisionsfläche.

Je Stadt reagieren genau **20 von 60 Passantensätzen** auf vorhandene Fortschrittsflags. Aussagen zu noch geltender Verfolgung werden, wo nötig, mit `kapitel2_done` ausgeschlossen. Die übrigen Sätze beschreiben Alltag und Gerüchte. Jeder Satz umfasst höchstens 14 durch Leerraum getrennte Wörter. Die Texte sind gesprochener Inhalt; eine spätere Sprechblase soll keine weiteren Anführungszeichen hinzufügen.

## Bestiarium und vorhandene IDs

Die Schlüssel in `item_texte.json` und `bestiarium.json` verweisen auf **vorhandene** IDs und bekommen deshalb kein neues Präfix. Auch IDs wie `moorleiche_elite` existieren bereits durch `buildContent`. Nur neue Lesestück- und Zeitungs-IDs tragen `lore_`. Es werden keine neuen NPCs, Dialoge oder Kämpfe angelegt.

Kampftipps benennen jeweils einen realen Angriff und verwenden dessen tatsächlichen Effekt, Trefferzahl oder Vorlaufzeit. Bei Elitegegnern wird die zusammengesetzte Laufzeitfassung zugrunde gelegt. Einzelne Wexmoor-Gegner verwenden in den Quellen überraschende Angriffsnamen; diese werden weder umbenannt noch als erfundene Körpermerkmale erklärt. Details hierzu stehen in den offenen Punkten.

Bestiariumstexte können Täter oder späte Zusammenhänge verraten. Bei der Integration erst nach der Begegnung beziehungsweise dem Sieg anzeigen, nicht als frei zugängliches Nachschlagewerk am Spielbeginn.

## Prüfen

Vom Repository-Stamm aus:

```sh
node docs/story/lore/pruefen.mjs
```

Das Skript prüft JSON und genaue Felder, neue IDs, Flag-Setzstellen, bestehende Referenzen, alle Abschlussvarianten, die Aktfolge samt Hafenstreit und vier Wexmoor-Enden, Mengen und Wortgrenzen, Fundort-Kollisionen und Erreichbarkeit, ursprüngliche Itemtexte und unveränderte Zahlen sowie die vollständige Gegnerabdeckung einschließlich belegter Kampftipps. Die generische Dialogprüfung kontrolliert `start` und `next`, falls Dialoge vorliegen; dieses Paket enthält keine.

Es sind keine neuen Bilder erforderlich. Vorhandenes Papier und vorhandene Item-/Gegnergrafiken reichen aus. Sämtliche Änderungen dieses Pakets liegen ausschließlich in `docs/story/lore/`.
