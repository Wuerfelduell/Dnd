# Vorratsverknüpfungen

Dies ist ein Einbauplan, kein zusätzliches Laufzeitformat. Vor `buildContent` die unten genannten Vorratszonen materialisieren: `encounters`, `loot_tables` und `elite_drops` aus der Quellzone übernehmen, anschließend die lokalen Werte aus `zones.json` darüberlegen, wobei deren leere drei Sammlungen **nicht** die Quelle löschen. Die leeren Sammlungen markieren bewusst den fehlenden Referenz-Resolver. Unverändert mit allen `roam`-, `elite`-, Beute- und Angriffswerten übernehmen. Nicht isoliert als leere Zone laden.

| Karte | Vorratszone |
|---|---|
| cw_alte_setzerei | vg_zone_cw_setzerei |
| cw_sortiergrube | vg_zone_cw_sortiergrube |
| cw_nullfundament | vg_zone_cw_nullfundament |
| reise_landstrasse | vg_zone_all_landstrasse |

Quelle: `../vorrat_gegner/zonen_vorschlag.json`. Normale Gegner: Setzerei Letternläufer, Stempelhand, Registerratte; Grube Rohrpostwespe, Durchschlag, Leerfracht; Fundament Seilbahnwächter, Tintenschatten. Alle acht unterschiedlichen Calderwick-Gegner werden verwendet. Bosse und ihre Folgeabschnitte bleiben ausschließlich in BH `bosses.json`/`phasen.json`; die platzierten BH-Dialoge steuern friedliche Lösung, Abbruch und Abschnitte.

Landstraße: Alle acht normalen `vg_all_*` stehen über die Quellzone bereit. Marktschreier nur als freiwillige Gesprächsbegegnung, Zollhund an der Schranke, Grenzstein und Fuhrmannsschatten an getrennten Abzweigen. **Beide Reisebosse aus automatischer Roamer-Auswahl ausschließen**, sie starten ausschließlich über die zwei gegenseitig gesperrten Gesprächsobjekte. Auch die drei Calderwick-Bosse nicht automatisch als Roamer starten, damit friedliche Lösungen erreichbar bleiben.

Roamer-Streifen für den Einbau (Kacheln, jeweils nur Boden): Setzerei (24,12)–(28,12), Ratte (34,20)–(38,20), Stempelhand (40,22); Grube Wespe (24,12)–(28,12), Leerfracht (34,20), Durchschlag (38,20); Fundament Wächter (24,12), Schatten (38,20). Eingangsring x≤5 bleibt gegnerfrei. Sicht-/Höradapter und Zeiten gemäß BH `verhalten.md`, kein neues JSON-Feld behauptet diese Unterstützung.

## Händlerrollen

| Figur / Ort | BL-Rolle |
|---|---|
| cw_wicksend / cw_pfandhaus | vi_handel_druckerei |
| cw_pritch / cw_quittungsmarkt, Streiktopf-Ausgabe | vi_handel_garten |
| cwo_marktstand / cw_quittungsmarkt | vi_handel_reise |

BL enthält tatsächlich Druckerei, Garten und Reise, keine eigenständigen Pfandhaus-/Streiktopf-Shops. Die Rollen werden vollständig referenziert, nicht umbenannt oder umsortiert. Pritch gibt den vorhandenen Gartenbedarf als überregional gespendeten Vorrat am Streiktopf aus. Preise und Bestände aus BL `handel.json` unter deren IDs in `content.merchants` registrieren. Die Dialogzusätze nutzen genau diese IDs. Ein eigener Streiktopf-Lebensmittelbestand wäre später CF/BL-Abstimmung.
