# Quellen und Prüfbasis

- Dnd-Hauptzweig als Arbeitsbasis: `3bb41696ffa7bff82cbc88a574deb6b37259113d`.
- Aufgabenvertrag: `docs/art/codex_CH_k5_orte.md`.
- Vollständige Storyvorlage: `docs/story/kapitel3/geschichte_2.md`; Anschluss abgeglichen mit `story_bisher.md` und den gemeinsamen Eckdaten von `docs/art/codex_CC_k4_akte.md`.
- Datenformen: `src/data/packs/k3_akte/`, `src/data/packs/k3_orte/`, `src/data/packs/k3_leben/platzierung.json`, `src/data/items.json`, `src/data/dialogues/kopfgeld.json`.
- Vorrat: `docs/story/vorrat_gegner/` (BH), `docs/story/vorrat_figuren/` (BJ), `docs/story/vorrat_items/` (BL), jeweils von obiger Basis. Keine fremden Werte oder Figuren umgeschrieben.
- Renderer und Bedingungen: `src/world/assets.js`, `src/data/buildContent.js`, `src/world/Roamers.js` und vorhandene Zustandsbedingungen. Die Prüfung lädt Basiskarten über `tests/helpers.js`.
- Parallelpaket CG: [PR #246](https://github.com/Wuerfelduell/Dnd/pull/246), Branch `codex/cg-k5-akte`, geprüfter Commit `1bdfc07993c286c15dc7dd1e437d6be77a863844`. Quellen nur extern gelesen, nicht in CH dupliziert.

CG-Eingaben der Vollprüfung, jeweils SHA-256:

| Datei unter `docs/story/k5_akte/` | SHA-256 |
|---|---|
| `dialogues.json` | `ab67c952500e3d6c68af25672b6412cdc908314020af591701f7380a30265dd7` |
| `dialog_zusaetze.json` | `5aa718987a4f81dc5ec34246491b32e3d976151cf7b22399f922734f08b8c43e` |
| `platzierung.json` | `523b4fb00802d11d9a046e7cdad59b4fbd16ef48c5d499453d395ae241e82679` |
| `ventile.json` | `0d44f4e4d855176951edb36b140bfded64dee1c2ba55aabbb13e3dd780ef64cc` |
| `boss_texte.json` | `3ed937f111bc77e5d6391f9c076b57a58011c74148982cb82b2604d5fdc4080d` |

Die reine lokale Prüfung akzeptiert keine erfundenen Flag-Setter. Wenn CG noch nicht vorliegt, werden dessen genau benannte Verweise separat als offene externe Verträge ausgegeben. Die Vollprüfung lädt die tatsächlichen CG-Dateien über `--cg-dir`.
