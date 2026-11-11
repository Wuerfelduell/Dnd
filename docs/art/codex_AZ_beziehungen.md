# Codex-Paket AZ: Beziehungen und Stimmungen der Figuren (Texte)

**Paket-Name:** `beziehungen` · **Ordner:** `docs/story/beziehungen/` · **Art:** nur Texte und JSON, keine Grafik

Das Spiel hat seit PR „NPC-Beziehungen mit drei Stimmungen“ ein Beziehungssystem: Jede Figur hat einen **Beziehungswert** (−5 bis +6) zum Ermittler und daraus eine von **drei Stimmungen**: **feindselig** (ab −2), **neutral**, **freundlich** (ab +3). Das Gerüst steht, die Inhalte fehlen: Dieses Paket liefert die Texte und Zuordnungen, damit sich die Figuren wirklich an den Spieler erinnern.

## 0. Regeln (zuerst lesen)

- Diese Datei ist in sich vollständig. Lies außerdem im Repo: `src/core/Relations.js` (Regeln im Kopfkommentar), `src/data/beziehungen.json` (das Gerüst mit wenigen Beispielen, **dein Ergebnis ersetzt es**), `src/data/relations.js` (wie zusammengeführt wird) und als Format-Vorlage `src/data/packs/kg_nebenquests/dialog_zusaetze.json`.
- Alles kommt in **deinen eigenen Ordner** `docs/story/beziehungen/`. **Keinen Spielcode ändern**, keine anderen Ordner anfassen. Eingebaut wird es danach von Claude.
- Sprache: Deutsch, Ton wie die vorhandenen Dialoge (viktorianisch-okkultes Kettlegate, Wexmoor, Dunscar; knapp, trocken, nie kitschig). Der Spieler wird gesiezt, außer die Figur duzt ihn schon in ihren Dialogen.
- Alle IDs (Figuren, Gegenstände, Dialoge, Knoten, Aufträge) müssen existieren. Figuren: `src/data/campaign.json` → `npcs`, `src/data/market.json` → `npcs`, `src/data/gebaeude.json`, `src/data/factions.json`, `src/data/treffen.json`, `src/data/wexmoor.json`, alle `src/data/packs/*/npcs.json`. Gegenstände: `src/data/items.json` und alle `src/data/packs/*/items.json`. Dialoge: `src/data/dialogues/*.json`, `src/data/packs/*/dialogues.json`, `src/data/wexmoor.json` → `dialogues`.
- Prüfe am Ende mit `node --test tests/beziehungen.test.js` nach dem Kopieren deiner `beziehungen.json` nach `src/data/beziehungen.json` **nur lokal zum Testen** (danach zurücksetzen, Code bleibt unverändert). Alle JSON-Dateien müssen gültig sein.

## 1. Was das System schon kann (nicht neu bauen)

| Mechanik | Wie es funktioniert |
|---|---|
| Wert ändern | Effekt `"relation": { "<figur>": 1 }` an einem Dialogknoten (wirkt nur beim ersten Besuch des Knotens), an einer Auftragsbelohnung (`reward`) oder an einem Objekt |
| Bedingungen | `requires_relation: { "<figur>": 2 }` (mindestens), `requires_relation_max`, `requires_mood: { "<figur>": "freundlich" }` (auch Liste), `hide_if_mood` an Optionen, Knotenvarianten (`next: [{ node, requires_mood }]`) und Objekten |
| Geschenke | Menüpunkt „Etwas schenken …“ bei jeder Figur. Jede Figur mag zwei **Arten** (`mag_arten` aus consumable, potion, ingredient, trophy, gear, weapon, artifact; ohne Angabe zugelost) und einzelne Dinge (`mag`); das Fenster zeigt die Arten. Gemochtes und Wertvolles (ab 12 Schilling) → +1, höchstens 3 Mal pro Figur. `verabscheut` / `verabscheut_arten` → −1, Gegenstand bleibt beim Spieler. Billiges, Unpassendes → Ablehnung, in der die Figur ihren Wunsch nennt (`{wunsch}`) |
| Sichtbar | Abzeichen neben dem Namen, Portrait (freundlich lächelt, feindselig misstraut), ein Begrüßungssatz am Anfang jedes Gesprächs (nicht bei neutral) |
| Händler | freundlich −10 %, feindselig +20 % auf alle Preise |
| Kampf | Kampf aus einem Gespräch heraus macht die Figur sofort feindselig (Übungskämpfe nicht) |
| Einzelgänger, Zunder, Pfiff | behalten ihr bestehendes Vertrauen (`bond`), es zählt als Beziehung. Für sie **keine** `relation`-Effekte schreiben, nur `begruessung`, `mag`, `verabscheut` |

Platzhalter in Geschenktexten: `{name}` = Name der Figur, `{item}` = Name des Gegenstands.

## 2. Lieferung 1: `docs/story/beziehungen/beziehungen.json`

Gleiche Struktur wie `src/data/beziehungen.json`:

```json
{
  "rules": { "min": -5, "max": 6, "feindselig_ab": -2, "freundlich_ab": 3, "geschenk_max": 3, "geschenk_wert": 12, "preis": { "freundlich": 0.9, "feindselig": 1.2 } },
  "texte": { "dank": "…", "genug": "…", "ablehnung": "…", "beleidigt": "…" },
  "allgemein": { "freundlich": ["…"], "feindselig": ["…"] },
  "figuren": {
    "marlowe": {
      "mag_arten": ["consumable", "trophy"], "mag": ["tonikum"], "verabscheut": ["blitzpulver"], "verabscheut_arten": [],
      "begruessung": { "freundlich": "…", "feindselig": "…" },
      "dank": "…", "dank_wertvoll": "…", "dank_genug": "…", "ablehnung": "…", "ablehnung_beleidigt": "…"
    }
  },
  "knoten": { "holt/holt_clear": { "holt": 1 } },
  "quests": { "<auftrag>": { "<figur>": 1 } }
}
```

- `rules` unverändert übernehmen.
- `texte`: die fünf allgemeinen Geschenk-Antworten `dank`, `wertvoll`, `genug`, `ablehnung` (mit `{wunsch}`), `beleidigt` (für Figuren ohne eigene).
- `allgemein`: **12 freundliche und 12 feindselige** Begrüßungssätze, die zu jeder Figur passen (ein bis zwei Sätze, mit kleiner Geste: Nicken, Blick, Haltung). Keine Namen, kein Ort.
- `figuren`: **mindestens 45 Figuren**, darunter auf jeden Fall diese 31 mit eigenen Gesichtern: `marlowe, holt, pimm, greta, quill, kit, pip, hester, ivy, rook, price, barnaby, miriam, oda_vey, mews, astronom, lichtmann, maud, ned, wick, souffleur, zunder, druce, sedge, hale, brack, hesper, wyle, pedell, brandt, elsbeth`, dazu die Händler `nell, kittering, gorse, sabeth, grubenwirt` und die wichtigsten Figuren aus Kapitel 3 (`src/data/packs/k3_akte/npcs.json`, `k3_orte`). Pro Figur:
  - `begruessung.freundlich` und `begruessung.feindselig`: je ein bis zwei Sätze in der Stimme der Figur, mit Bezug auf ihre Rolle (Marlowe knapp und dienstlich, Greta laut, Pimm zwischen Akten, Zunder ohne Sie).
  - `mag_arten`: genau zwei Arten, die zur Figur passen (Wirtin: consumable + trophy, Kräuterfrau: ingredient + potion, Sergeant: consumable + weapon).
  - `mag`: 2 bis 4 Gegenstände, die zur Figur passen (ein Archivar mag Taschentuch oder Lampenöl, eine Wirtin Gewürzwein, ein Beyonder Bannsalz). Nur verschenkbare Dinge (keine `key`-Beweisstücke, keine Formeln). Teure Dinge sparsam.
  - `verabscheut`: 0 bis 2 Gegenstände, die die Figur beleidigen (Blitzpulver bei einer Inspektorin, Gin bei einer Abstinenzlerin).
  - `dank`, `dank_wertvoll`, `dank_genug`, `ablehnung` (nennt `{wunsch}`), `ablehnung_beleidigt`: je ein Satz in ihrer Stimme (mit `{item}`, wo es passt).
- `knoten`: **80 bis 120 Zuordnungen** `"<dialog>/<knoten>": { "<figur>": ±1 }` (seltener ±2) auf **bestehende** Knoten. Lies die Dialoge der 45 Figuren und markiere die Stellen, an denen der Spieler sich entscheidet: Drohen, Lügen (wenn es auffliegt), Beschuldigen, Erpressen, Bestechen ablehnen, Geheimnis verraten → −1; helfen, Wort halten, Mitgefühl, Wahrheit sagen, ihr Anliegen erledigen → +1; große Taten für die Figur (Angehörige gerettet, Unschuld bewiesen) → +2. Die Figur, die das betrifft, ist nicht immer die, mit der man spricht (wer Holt bei Marlowe anschwärzt, verliert bei Holt). Nur Knoten, die man gezielt über eine Option erreicht, keine Start- oder Hub-Knoten. Die fünf Beispiele in `src/data/beziehungen.json` übernehmen.
- `quests`: **20 bis 30 Aufträge** (Nebenaufträge aller Pakete, `src/data/quests.json` und `packs/*/quests.json`) mit `+1` oder `+2` bei der Auftraggeberin oder dem Auftraggeber.

## 3. Lieferung 2: `docs/story/beziehungen/dialog_zusaetze.json`

Format wie `src/data/packs/kg_nebenquests/dialog_zusaetze.json` (`choices_add` wird vor der letzten Option des Start- bzw. Hub-Knotens eingefügt, `nodes_add` hängt neue Knoten an; keine bestehenden Knoten überschreiben, neue Knoten-IDs mit Präfix `bz_`).

Für **20 Figuren** (die wichtigsten aus Kapitel 1 bis 3) je **zwei Zusatzzweige**:

- **freundlich** (`"requires_mood": { "<figur>": "freundlich" }`): ein kleiner Vorteil in der Stimme der Figur: ein Tipp zum laufenden Fall (allgemein gehalten, kein Spoiler der Lösung, kein neuer Hinweis), ein Gerücht aus der Stadt, einmalig ein kleines Geschenk (`gives_items` mit Verband, Tonikum, Riechsalz o. ä., gesichert durch `sets_flags: ["bz_<figur>_geschenk"]` und `hide_if_flags`), oder bei Händlern ein Satz zum Nachlass.
- **feindselig** (`"requires_mood": { "<figur>": "feindselig" }`): eine Option „Was habe ich Ihnen getan?“ (oder in der Stimme der Figur), die zu einem Knoten führt, in dem die Figur ihren Groll benennt, und eine **Wiedergutmachung** anbietet: eine Entschuldigung (einmalig, `relation +1`, `sets_flags: ["bz_<figur>_entschuldigt"]`), eine kleine Aufgabe (ein bestimmter Gegenstand, `requires_items` + `takes_items`, `relation +1`), oder Geld (`takes_money`, 20 bis 60 Schilling). Jede Figur anders, nicht dreimal dieselbe Mechanik.

Optionstexte kurz (unter 60 Zeichen), Knotentexte 2 bis 5 Sätze. Nichts davon darf einen Fall lösbar oder unlösbar machen.

## 4. Lieferung 3: `docs/story/beziehungen/README.md`

Eine Seite: welche Figuren Profile haben, Übersicht `mag`/`verabscheut` als Tabelle, Liste der 20 Figuren mit Zusatzzweigen, und offene Vorschläge (z. B. Figuren, bei denen eine dritte Stimmung ein eigenes Portrait bräuchte).

## 5. Prüfliste vor dem Pull Request

1. `beziehungen.json` und `dialog_zusaetze.json` sind gültiges JSON.
2. Jede Figur in `figuren`, `knoten`, `quests` und in den Bedingungen existiert; jeder Knoten in `knoten` existiert (Schreibweise `dialog/knoten`); jeder Gegenstand in `mag`/`verabscheut`/`gives_items` existiert.
3. Keine `relation`-Effekte auf Einzelgänger (`wexmoor.json` → `loners.list`), `zunder` oder `k3_pfiff`.
4. Keine Begrüßung länger als zwei Sätze; keine Figur bekommt denselben Satz wie eine andere.
5. Ein Pull Request nur mit dem Ordner `docs/story/beziehungen/`.
