# Quellenstand CT

Arbeitsbasis `6ccced920b21ee296edba27f20d5215e68b62695` aus `Wuerfelduell/Dnd/main`.

- Auftrag: `docs/art/codex_CT_k6_akte.md`, vollständig gelesen.
- Gemeinsame Rollen und Anschlussverträge: `codex_CU_k6_orte.md`, `codex_CX_k6_figuren.md`, `codex_CZ_varrowmouth_gegner.md`; Seq-1-Vertrag aus `codex_DD_seq31_texte.md`.
- Vorlagen: `docs/story/k4_akte/` und `docs/story/k5_akte/`, insbesondere Fall, Dialoge, Hauptquests, Platzierung, Anreise und Epiloge.
- Tatsächliche Briarholt-Ausgänge: `docs/story/k5_akte/epiloge.json`, alle vier Endgruppen gelesen. CT ändert deren Ereignisse nicht.
- Laufzeitformen und Testgrundlage: `src/data/questPacks.js`, `src/core/GameState.js`, `src/core/Relations.js`, `tests/helpers.js`, vorhandene Inhalte aus `src/data/packs/`.

Die CT-Bestellung verlangt erzählerische Zusatzfelder wie `fuehrende_frage`, `hinweise`, `luege`, `vorbereitung` und `szene`. Sie werden bewusst von den bereits unterstützten Bedingungen und Effekten getrennt. Die README benennt ihre Einbaustellen; keine unbekannten Felder werden als schon funktionierende Mechanik ausgegeben.
