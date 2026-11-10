# BG – Einbau und offene Bestandsfragen

Basis: `d4caa233410ca23b2c60d747b6ad330c1ac722f4`, 10.11.2026. Bestehende Dateien bleiben durch BG unverändert. Die folgenden Arbeiten sind für Seb konkret vorbereitet.

## 1. Daten und Zustand anschließen

In `src/data/buildContent.js` bzw. dem Content-Einstieg die zwei BG-Daten laden und unter `content.claimSources` / `content.claimReplacements` ablegen. Kein gewöhnlicher Questpack-Import: BG liefert weder `items` noch `quests`, und seine Dialogbedingungen müssen zuerst bekannt sein. In `src/core/GameState.js`:

```js
import { claimMethods } from './Claims.js';
// neben den anderen Mixins:
Object.assign(GameState.prototype, claimMethods);
// reset(): nach resetParty()
this.resetClaims();
// serialize(): Rückgabe um ...this.serializeClaims() ergänzen
// load(): nach flags, Inventaren, storage/stashes und loadParty
this.loadClaims(data);
```

Ansprüche sind NICHT Teil von `PERSONAL`, sondern ein gemeinsames Register mit persönlichen Untereinträgen. `Party.js:addP2` ruft nach Aktivierung `syncClaims()` auf; `removeP2` löscht nichts. Keine Ritualflags durch BG setzen: `Pathways.js:ritualFlag` und `performRitual` sind bereits spielerbezogen. Heddas gemeinsame Questmerker dürfen kein automatisches `p2_ritual_*` ersetzen.

## 2. Quellen setzen und Bestandsauszahlungen ersetzen

Der aktuelle `GameState` hat KEIN `setFlag`/`addFlag`. Der konkrete Einstieg ist `applyEffects`, Schleife über `e.sets_flags`: erst das Flag hinzufügen, dann `this.openClaims(f)` aufrufen. Falls dafür ein Setter eingeführt wird, dort zentral aufrufen; alle direkten `flags.add` an Quellen dorthin führen. `Combat.finish()` setzt `won_<encounter>` bereits über `applyEffects`. Für späte Beitritte und frühere Siege prüft `syncClaims` nochmals alle belegten Quellen.

`won_vorhauer` und `k3o_vorhauer_geloest` sind z. B. **ein** Anspruch. Keine zusätzlichen `k3p_*_friedlich`-Flags erfinden: AU bezeichnet einige davon selbst nur als künftige Adaptermerker. BG nutzt die tatsächlich eingebauten AS-Flags. Bei Prüfungen ist `k3p_<kurzer_pfad>_bewaeltigt` der gemeinsame Kampf-/Friedensmerker.

In `src/world/CombatScene.js:over` nach erfolgreichem `Combat.finish` und den Quellflags:

```js
for (const player of Object.keys(combat.fighters).map(Number)) {
  state.redeem(`${commandId}:claim:${source}:${player}`, source, player);
}
```

Alle beteiligten Spieler berücksichtigen, auch `down === true`. Fehlende Pfade/Seq-Grenzen lassen Ansprüche für Hedda offen. Dieselbe Funktion wird vom friedlichen Abschluss verwendet. Nicht anwesende Spieler holen nach Beitritt bei Hedda ab. Die zehn Prüfungszutaten sollen nach AU weiter ausschließlich bei Hedda ausgegeben werden: für `kind: 'pruefung'` im Kampf nur öffnen, nicht sofort abholen.

Vorher die direkten persönlichen `gives_items` aus Heddas Ausgabeknoten in `src/data/packs/k3_pruefungen/dialogues.json` und aus `k3_orte/beute_vorschlag.json` durch `claim` ersetzen bzw. aus dem normalen Loot entfernen. Gemeinsame Geld-/Ehre-/Questwirkungen behalten ihre bestehende Einmal-Sperre. Nicht einfach `applyEffects` für jeden Spieler wiederholen. Die vorhandenen globalen `_kern_abgeholt`-Merker dürfen den persönlichen Zugang nicht länger sperren. `beute_vorschlag.json` ist auf dieser Basis bereits über `tests/helpers.js` eingebunden – also den bestehenden Import **umstellen**, nicht doppelt importieren.

## 3. Dialoge, Bedingungen und Befehle

In `GameState.meets` zusätzlich `&& this.meetsClaims(o)`. In `applyEffects` das BG-Teilobjekt mit `this.applyClaims(e, {commandId})` ausführen. `commandId` vom bestätigten UI-Vorgang bis in die Effektausführung weiterreichen. Ein Retry behält seine ID; eine spätere neue Ersatzprobe erhält eine neue. Knoten-ID allein reicht nicht, sonst wäre Ersatz nach erneutem Verlust für immer gesperrt. Save-Autospeicherung erst nach Rückkehr der gesamten Transaktion, nicht mitten in `money`-/`item`-Events.

Dialogzusätze sind nach **Dialog-ID** benannt, nicht nach NPC-ID:

| Figur | Dialog | Einstieg für `choices_add` |
|---|---|---|
| `k3_weichenstellerin` | `k3p_hedda` | `nodes.k3p_start` |
| `k3_pfiff` | `k3a_pfiff` | aktuelles Hub nach Ankunft/Briefing; Varianten von `start` auswerten |
| Kittering | `kittering` | `nodes.start` |

Der generische Packloader hängt an `nodes.start`; das passt für Hedda ausdrücklich nicht. `nodes_add` ohne Überschreiben ergänzen und nur die Choices am tatsächlichen Hub einhängen. Nicht blind live importieren.

Neue Adapterfelder: `requires_replacement: {seq, pathway, kind?}` und Effekt `replacement` mit demselben Objekt. `kind: 'formula'` geht an Kittering, sonst an Hedda/Pfiff. Keine separaten `takes_money`/`gives_items` hinzufügen: Preisprüfung und Auszahlung geschehen gemeinsam in `redeemReplacement`. `replacementCheck(...).reason` für ausgegraute Angebote/Erklärungen nutzen; nach Ablehnung den Knoten nicht als erfolgreichen Kauf darstellen. `requires_p2` fehlt derzeit in `GameState.meets`; BG prüft es in `meetsClaims` als „handelnde Person ist Spieler 2“. Das ist keine neue globale Koop-Freischaltung.

Heddas gleichlautende „Mein Anspruch“-Choices im UI mit `texte.k3b_offen[source]` bzw. Quellnamen versehen. Unpassende Prüfungspfade ausblenden oder als „anderer Pfad“ zeigen, offene Ansprüche aber nicht löschen. `requires_claim_missing` bedeutet fehlende **Auszahlung**, nicht Verlust eines schon ausgegebenen Items; letzteres läuft über die Ersatzprüfung.

## 4. Journal und Lager

In `src/ui/Ui.js`, Pfad-Tab: Titel `k3b_notizbuch`, offene Ansprüche aus `state.syncClaims()` je `player` auflisten. Die bestehende G-Umschaltung muss die Spieler-ID auch an `claimFor`/`replacementCheck` weitergeben. Keine Namen aus technischen Flags als alleinige Anzeige verwenden. Bei K.o. bleibt die Zeile sichtbar.

`Party.withPlayer(1)` normalisiert einen laufenden p2-Kontext nicht. Deshalb für BG-Abfragen `withClaimPlayer` verwenden; die Tests prüfen genau diesen Fall. Keine globalen `pathway`-Werte außerhalb des richtigen Spielerkontexts zum Filtern benutzen.

`storage` ist der Büroschrank, weitere Orte sind Einträge in `stashes`. Der Helfer prüft alle, ohne neue Lager anzulegen. Für den Speisewagen Text `k3b_lager`, für Büro/Kahn/andere Orte `k3b_lager_anders` einsetzen. Beide Spieler greifen auf dieselben Schränke zu; eine Zutat dort blockiert ebenfalls Ersatz. Gegenstände in der Tasche des Partners blockieren den eigenen Ersatz nicht, da diese Inventare persönlich sind.

## 5. Erwerbsquellen, Seq 9 und Verkäufer

Die 43 hohen Zutaten haben eindeutige Ereignisquellen. Für Seq 9–6 und die **sieben alten Pfade auf Seq 5** gibt es dagegen keine universellen bewältigten Bossflags: ihre Zutaten sind bestehende Handels-/Fundgüter. Insbesondere `lichtperle`, `schwertsplitter` usw. dürfen nicht durch erfundene `sq_zutat_<altpfad>_5` ersetzt werden. BG verwendet dort persönliche, gespeicherte Erwerbsquittungen `k3b_erworben_<pfad>_<seq>` unter `claimAcquisitions`, keine Weltflags. Direkt nach erfolgreichem ursprünglichem Erwerb der Kernzutat/des Tranks `recordClaimAcquisition(player, pid, seq)` aufrufen; nicht beim Öffnen des Shops oder beim bloßen Formelkauf. Auch nach einem echten Fund/Übergabe vor dem Verlust quittieren.

Diese Quellenart ist im Datenprüfer ausdrücklich getrennt von den gegen den Inhalt geprüften Flagquellen. Ein alter Save ohne Quittung darf nicht anhand eines bloß fehlenden Gegenstands als „verloren“ gelten. Beim Migrieren vorhandene Zutaten/Tränke einmal als Nachweis verwenden; bei bereits verlorenen Gegenständen ist ein bestätigter historischer Erwerbsbeleg nötig. Ohne Nachweis bleibt das Ersatzangebot gesperrt, der normale Händlerkauf aber erreichbar.

Seq-9-Erstkauf: im Verkäufer-UI zuerst einen der zehn Pfade auswählen und `selectClaimPathway(player, pid)` aufrufen. Nicht `state.pathway` setzen und nicht `requires_beyonder` verlangen. Erstkauf über den normalen Kaufpfad (mit dessen Zugang und Geldprüfung), dann Quittung speichern; erst das spätere Trinken bestimmt den echten Pfad. `replacementFor` ist bewusst kein kostenloser Erstzugang.

Die Aufgabenbeschreibung verlangt Rückgaben `where: 'hedda'|'pfiff'|'kittering'` und zugleich den „bisherigen Verkäufer“. Im Bestand besitzt Pfiff noch keinen universellen Trankersatz-Shop für 9–6. Die gelieferten Pfiff-Choices sind deshalb ein expliziter neuer Ersatzdienst, alternativ kann der bisherige Verkäufer denselben Adapter aufrufen. Kein existierendes Sortiment wird hier überschrieben. Preis pro Stufe wie Kitterings Formel, 30/70/160/260. Hedda 5–1 kostenlos, Formelersatz bei Kittering 30/70/160/260/420/180/260/380/560. Formelersatz behält Ehrenanforderungen, ist wiederholbar statt `once` und nur ohne Formel/Zieltrank möglich.

AU beschreibt für neue frühe Pfade teilweise geplante Herkunft (Sabeth, Vergessmoor, Uhrwerkwächter), während `sequenzen.js` noch Nell/Treffen enthält. Diese widersprüchlichen Handelsdaten werden durch BG nicht umgeschrieben. Erwerbsquittungen funktionieren mit dem tatsächlich gewählten Erwerbsweg.

## 6. Artefakte und Stilllegung

`k3_orte/beute_vorschlag.json` enthält aktuell **nur Kernzutaten**, keine der sechs `sq_*`-Artefaktfunde. `sequenzen/artefakte.json` definiert zwar sechs Artefakte, aber keine gesetzten Fundflags und kein `personal: true`. Deshalb keine erfundene, nicht erfüllbare Artefaktquelle in `ansprueche.json`. Sobald der Eigentümer den tatsächlichen Fundort/-merker liefert: Quelle mit dem existierenden gesetzten Flag, `kind: 'fund'`, Belohnung `{item, qty: 1, personal: true}` ergänzen. Ungebundene Artefakte brauchen kein `requires_pathway`; unmarkierte Artefakte und Beweisstücke werden von BG nie vervielfacht. Ein gesonderter Test belegt die persönliche Auszahlung mit einer lokalen Testquelle, ohne diese als echte Spieldaten auszugeben.

Für `won_unterschicht` ist `k3a_end_stilllegung` als dauerhafte Sperre modelliert, wie BG ausdrücklich vorgibt. Sie verhindert auch Ersatz und den späteren Beitrittsanspruch. Bereits eingelöste Zutaten werden nicht entzogen. AU fordert älter noch Superbosszugang nach allen vier Enden; dieser Widerspruch muss beim Einbau zugunsten der BG-Regel aufgelöst und Weltzugang/Questhinweis entsprechend angepasst werden. Andere Verfallsgründe können über `forfeit` gezielt einen Spieler betreffen.

## 7. Migration und Spielabnahme

Alte globale `_kern_abgeholt`-Flags verraten nicht, **welcher** Spieler damals die Zutat erhalten hat. Sie einfach in zwei neue offene Ansprüche umzuwandeln würde doppelte Erstbeute erzeugen. Vor Aktivierung Save-Version erhöhen, bekannte Empfänger anhand belastbarer Transaktionsdaten markieren oder diese begrenzte Altfallentscheidung im Migrationsdialog treffen; nicht beide pauschal als eingelöst markieren. Bereits vorhandene Fortschritte/Items nie löschen. Die reine `loadClaims`-Funktion migriert dieses unauflösbare Altformat absichtlich nicht automatisch.

Manuell nach Einbau: Kampf und Friedensweg; beide gleichen/verschiedenen Pfade; p2 tritt erst später bei; kein Pfad; Prüfung unter p2; beide K.o.-Varianten; Entfernung und erneuter Beitritt; Speichern vor/nach Einlösung; Retry nach Laden; alle Lager; Safe-Probe bei fehlendem Geld; Formelersatz; Erstkauf Seq 9; alle vier Kapitelenden. Der Build und die hier gelieferten reinen Tests prüfen keine Phaser-UI-Anbindung.
