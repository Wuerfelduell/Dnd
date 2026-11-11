# Bedingte Bossbeute: nicht direkt laden

`rollLoot` ignoriert Bedingungen an Drops. Daher folgende gewünschte Ergänzungen ausschließlich als Spezifikation; keinesfalls als aktuelle Laufzeitbeute importieren. Die drei platzierten `cwo_kern_*`-Dialoge sind der vorhandene funktionierende Ersatz. Sie prüfen Boss gelöst, eigenen Pfad, fehlenden Gegenstand und einmalige Abholung. Friedliche Lösung und Kampf sind gleichwertig. Nach Verbrauch der Zutat verhindert das eigene Abholflag weiteres Farmen. Bei mehreren Bossabschnitten nur nach vollständiger Lösung ausgeben.

```json
{
  "vg_cw_boss_bleisammler": {
    "drops": [
      {
        "item": "sq_zutat_laterne_3",
        "chance": 1,
        "requires_pathway": [
          "sq_laterne",
          9
        ],
        "hide_if_items": [
          "sq_zutat_laterne_3"
        ]
      },
      {
        "item": "sq_zutat_faden_3",
        "chance": 1,
        "requires_pathway": [
          "sq_faden",
          9
        ],
        "hide_if_items": [
          "sq_zutat_faden_3"
        ]
      },
      {
        "item": "sq_zutat_maske_3",
        "chance": 1,
        "requires_pathway": [
          "sq_maske",
          9
        ],
        "hide_if_items": [
          "sq_zutat_maske_3"
        ]
      },
      {
        "item": "sq_zutat_echo_3",
        "chance": 1,
        "requires_pathway": [
          "sq_echo",
          9
        ],
        "hide_if_items": [
          "sq_zutat_echo_3"
        ]
      },
      {
        "item": "sq_zutat_kessel_3",
        "chance": 1,
        "requires_pathway": [
          "sq_kessel",
          9
        ],
        "hide_if_items": [
          "sq_zutat_kessel_3"
        ]
      },
      {
        "item": "sq_zutat_eisen_3",
        "chance": 1,
        "requires_pathway": [
          "sq_eisen",
          9
        ],
        "hide_if_items": [
          "sq_zutat_eisen_3"
        ]
      },
      {
        "item": "sq_zutat_schluessel_3",
        "chance": 1,
        "requires_pathway": [
          "sq_schluessel",
          9
        ],
        "hide_if_items": [
          "sq_zutat_schluessel_3"
        ]
      },
      {
        "item": "sq_zutat_waage_3",
        "chance": 1,
        "requires_pathway": [
          "sq_waage",
          9
        ],
        "hide_if_items": [
          "sq_zutat_waage_3"
        ]
      },
      {
        "item": "sq_zutat_moor_3",
        "chance": 1,
        "requires_pathway": [
          "sq_moor",
          9
        ],
        "hide_if_items": [
          "sq_zutat_moor_3"
        ]
      },
      {
        "item": "sq_zutat_uhr_3",
        "chance": 1,
        "requires_pathway": [
          "sq_uhr",
          9
        ],
        "hide_if_items": [
          "sq_zutat_uhr_3"
        ]
      }
    ]
  },
  "vg_cw_boss_blinder_zusteller": {
    "drops": [
      {
        "item": "sq_zutat_laterne_2",
        "chance": 1,
        "requires_pathway": [
          "sq_laterne",
          9
        ],
        "hide_if_items": [
          "sq_zutat_laterne_2"
        ]
      },
      {
        "item": "sq_zutat_faden_2",
        "chance": 1,
        "requires_pathway": [
          "sq_faden",
          9
        ],
        "hide_if_items": [
          "sq_zutat_faden_2"
        ]
      },
      {
        "item": "sq_zutat_maske_2",
        "chance": 1,
        "requires_pathway": [
          "sq_maske",
          9
        ],
        "hide_if_items": [
          "sq_zutat_maske_2"
        ]
      },
      {
        "item": "sq_zutat_echo_2",
        "chance": 1,
        "requires_pathway": [
          "sq_echo",
          9
        ],
        "hide_if_items": [
          "sq_zutat_echo_2"
        ]
      },
      {
        "item": "sq_zutat_kessel_2",
        "chance": 1,
        "requires_pathway": [
          "sq_kessel",
          9
        ],
        "hide_if_items": [
          "sq_zutat_kessel_2"
        ]
      },
      {
        "item": "sq_zutat_eisen_2",
        "chance": 1,
        "requires_pathway": [
          "sq_eisen",
          9
        ],
        "hide_if_items": [
          "sq_zutat_eisen_2"
        ]
      },
      {
        "item": "sq_zutat_schluessel_2",
        "chance": 1,
        "requires_pathway": [
          "sq_schluessel",
          9
        ],
        "hide_if_items": [
          "sq_zutat_schluessel_2"
        ]
      },
      {
        "item": "sq_zutat_waage_2",
        "chance": 1,
        "requires_pathway": [
          "sq_waage",
          9
        ],
        "hide_if_items": [
          "sq_zutat_waage_2"
        ]
      },
      {
        "item": "sq_zutat_moor_2",
        "chance": 1,
        "requires_pathway": [
          "sq_moor",
          9
        ],
        "hide_if_items": [
          "sq_zutat_moor_2"
        ]
      },
      {
        "item": "sq_zutat_uhr_2",
        "chance": 1,
        "requires_pathway": [
          "sq_uhr",
          9
        ],
        "hide_if_items": [
          "sq_zutat_uhr_2"
        ]
      }
    ]
  },
  "vg_cw_boss_nullfundament": {
    "drops": [
      {
        "item": "sq_zutat_laterne_1",
        "chance": 1,
        "requires_pathway": [
          "sq_laterne",
          9
        ],
        "hide_if_items": [
          "sq_zutat_laterne_1"
        ]
      },
      {
        "item": "sq_zutat_faden_1",
        "chance": 1,
        "requires_pathway": [
          "sq_faden",
          9
        ],
        "hide_if_items": [
          "sq_zutat_faden_1"
        ]
      },
      {
        "item": "sq_zutat_maske_1",
        "chance": 1,
        "requires_pathway": [
          "sq_maske",
          9
        ],
        "hide_if_items": [
          "sq_zutat_maske_1"
        ]
      },
      {
        "item": "sq_zutat_echo_1",
        "chance": 1,
        "requires_pathway": [
          "sq_echo",
          9
        ],
        "hide_if_items": [
          "sq_zutat_echo_1"
        ]
      },
      {
        "item": "sq_zutat_kessel_1",
        "chance": 1,
        "requires_pathway": [
          "sq_kessel",
          9
        ],
        "hide_if_items": [
          "sq_zutat_kessel_1"
        ]
      },
      {
        "item": "sq_zutat_eisen_1",
        "chance": 1,
        "requires_pathway": [
          "sq_eisen",
          9
        ],
        "hide_if_items": [
          "sq_zutat_eisen_1"
        ]
      },
      {
        "item": "sq_zutat_schluessel_1",
        "chance": 1,
        "requires_pathway": [
          "sq_schluessel",
          9
        ],
        "hide_if_items": [
          "sq_zutat_schluessel_1"
        ]
      },
      {
        "item": "sq_zutat_waage_1",
        "chance": 1,
        "requires_pathway": [
          "sq_waage",
          9
        ],
        "hide_if_items": [
          "sq_zutat_waage_1"
        ]
      },
      {
        "item": "sq_zutat_moor_1",
        "chance": 1,
        "requires_pathway": [
          "sq_moor",
          9
        ],
        "hide_if_items": [
          "sq_zutat_moor_1"
        ]
      },
      {
        "item": "sq_zutat_uhr_1",
        "chance": 1,
        "requires_pathway": [
          "sq_uhr",
          9
        ],
        "hide_if_items": [
          "sq_zutat_uhr_1"
        ]
      }
    ]
  }
}
```
