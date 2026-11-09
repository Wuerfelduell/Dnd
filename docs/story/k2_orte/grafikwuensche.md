# Zusätzlicher Grafikwunsch und Platzhalter

AN liefert bereits Orte, Monster, Boss, Hintergründe, Kartenmarker und die Icons `schlickzahn`, `wurmseide`, `grubenglas`, `torfbernstein`, `brautschleier`, `brautring`, `brautkranz`. AO liefert Agathe Mulch, Corvin Tallow und Jonas Peck. Diese Bilder werden hier nicht erneut beauftragt.

## Ein zusätzlicher Wunsch

| ID | Art | Beschreibung | English prompt | platzhalter |
|---|---|---|---|---|
| `k2o_amtsschluessel` | Item-Icon 16×16, zusätzlich 32×32 | Ein langer angelaufener Messingschlüssel mit kleinem Leuchtturm im Griff und schwarzem Bestatterband. | An old brass mortuary key with a small lighthouse-shaped bow and a short black mourning ribbon. Tarnished metal, readable silhouette, no lettering. | `amulett_schluessel` |

## Vorläufige Zuordnung für den späteren Einbau

Dies sind Hinweise für den Asset-Lader, keine zusätzlichen Felder in den Spieldaten und keine neuen Grafikaufträge.

| ID / Verwendung | platzhalter | Ablösung |
|---|---|---|
| `wxn_bestatterin` | NPC-Sheet von `sedge`, Portrait von Sedge | AO Agathe Mulch |
| `wxn_lichtschreiber` | NPC-Sheet von `pedell`, Portrait des Pedells | AO Corvin Tallow |
| `wxn_torfgraeber` | NPC-Sheet von `ez_reetkoenig`, dessen Portrait | AO Jonas Peck |
| `enemy_torfleiche` | `enemy_ratsherr` | AN Torfleiche |
| `enemy_grubenlicht` | `enemy_weisslicht` | AN Grubenlicht |
| `enemy_torfwurm` | `enemy_pfahlbohrer` | AN Torfwurm |
| `enemy_schlickhund` | `enemy_schlickaal` | AN Schlickhund |
| `enemy_moorbraut` | `enemy_namenlose` | AN Moorbraut |
| `schlickzahn` | `schlickperle` | AN Icon |
| `wurmseide` | `reetfaser` | AN Icon |
| `grubenglas` | `sternglas` | AN Icon |
| `torfbernstein` | `schlickperle` | AN Icon |
| `brautschleier` | `hut_witwenschleier` | AN Icon |
| `brautring` | `siegelring` | AN Icon |
| `brautkranz` | `geweihreif` | AN Icon |

Die Gegner-Platzhalter verweisen auf bereits verwendete Wexmoor-Begegnungen. ANs neue Bossfigur soll die erhaltene Braut im Kleid zeigen, ohne drastische Verfallsdarstellung. Dekoration und Tiles sind in `maps.json` bereits auf vorhandene Keys gesetzt: `r_torf`, `r_wachhaus`, `g_katakomben`, `b_grab_*` und `r_innen_props_*`.
