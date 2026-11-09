# Zusätzliche Grafikwünsche · AL

Nur Ergänzungen außerhalb der gemeinsamen Eckdaten. Die vier Auftraggeber, Vanes Gegner-Sheet und die gemalte Frau sind bereits AO zugeteilt und werden hier nicht erneut bestellt. Die folgenden `platzhalter` sind vorhandene Dateien als Referenz für den späteren Asset-Einbau. In den Spieldaten gibt es kein erfundenes Feld dieses Namens.

## Ivo Senn · `k2a_senn`

Ein schmaler Frachtkopist mit abgewetzter Weste, violetten Daumen, Drahtrolle und einem stets trockenen Durchschlag unter dem Mantel.

| Art | Maße | platzhalter |
|---|---|---|
| Lauf-Sheet | 64×128, vier Richtungen | `public/sprites/characters/Q_druce_walk.png` |
| Portrait | 64×64 je Stimmung | `public/sprites/portraits/Q_druce_emotions.png` |
| Kampf-Gegner für `k2a_tinte_kampf` | 64×64 je Frame, 6 Spalten | `public/sprites/battle/enemy_kanalschmuggler.png` |

**Bild-Prompt Lauf/Portrait:** A narrow Victorian freight copyist in a worn brown waistcoat and short rain cape, with violet-stained thumbs and a folded carbon copy tucked under his coat. He has an alert, calculating expression and carries a compact coil of telegraph wire.

**Bild-Prompt Kampf:** The freight copyist braces in a cramped peat-soaked signal hut and swings a heavy wire reel while protecting a portable telegraph transmitter. Show readable idle, wind-up, strike, stagger, defeat and retreat poses without gore.

## Dr. Oren Veit · `k2a_veit`

Ein ordentlich gekleideter Materialverwalter mit grauen Ärmelschonern und rußiger Brille, dessen fahrbarer Probenschrank sauberer aussieht als seine Ausreden.

| Art | Maße | platzhalter |
|---|---|---|
| Lauf-Sheet | 64×128, vier Richtungen | `public/sprites/characters/R_pedell_walk.png` |
| Portrait | 64×64 je Stimmung | `public/sprites/portraits/R_pedell_emotions.png` |
| Kampf-Gegner für `k2a_bittere_mittel_kampf` | 64×64 je Frame, 6 Spalten | `public/sprites/battle/enemy_price.png` |

**Bild-Prompt Lauf/Portrait:** A meticulous Victorian research stores officer in a charcoal coat and grey sleeve protectors, wearing soot-flecked spectacles. His gloved hand grips a sample ledger, and pale leaf fragments cling to one cuff.

**Bild-Prompt Kampf:** The research officer defends a closed wheeled specimen cabinet with an iron stirring rod at the edge of a peat cutting. Use distinct guarded, pushing, striking, recoiling, disarmed and retreating poses; the bottles remain sealed.

## Clem Noll · `k2a_noll`

Ein selbstgefälliger Hafenkassenschreiber im zu guten Mantel, mit Messingstempel am Band und blanken Stiefeln über schlickigen Sohlen.

| Art | Maße | platzhalter |
|---|---|---|
| Lauf-Sheet | 64×128, vier Richtungen | `public/sprites/characters/12_constable_price_walk.png` |
| Portrait | 64×64 je Stimmung | `public/sprites/portraits/C_price_emotions.png` |
| Kampf-Gegner für `k2a_hafenrecht_kampf` | 64×64 je Frame, 6 Spalten | `public/sprites/battle/enemy_kanalschmuggler.png` |

**Bild-Prompt Lauf/Portrait:** A complacent Victorian harbour insurance clerk in an expensive dark green coat, with a brass registry stamp hanging from a cord. His polished boots have muddy soles, and he protects a dry envelope against his chest.

**Bild-Prompt Kampf:** The harbour clerk balances on a moored salvage punt, using a long boat hook to keep an investigator away from a sealed insurance duplicate. Show a clear idle stance, hook wind-up, thrust, loss of balance, disarmed surrender and retreat.

## Vier Inventarabschriften

Alle vier **Item-Icons 16×16**, jeweils `platzhalter: public/sprites/items/pfaendungsbrief.png`. Keine benötigte lesbare Schrift und keine zusätzlichen magischen Effekte.

| ID | Beschreibung | Englischer Bild-Prompt |
|---|---|---|
| `k2a_tinte_abschrift` | Gefalteter Telegrammstreifen mit violettem Siegel. | A folded telegraph transcript tied with thin black string, sealed with a small violet wax mark. A short zigzag paper edge distinguishes it from an ordinary letter. |
| `k2a_bittere_mittel_abschrift` | Versiegeltes Chargenprotokoll mit aufgebundenem Blattumriss. | A compact sealed batch report with a pale pressed leaf silhouette beneath its binding string. The seal is muted green and the paper has one small pharmacy-style corner fold. |
| `k2a_hafenrecht_abschrift` | Drei schmale Namensstreifen unter einem Hafensiegel. | Three narrow identity slips held together under one brass-coloured harbour seal. Their edges remain visibly separate, with a tiny anchor-shaped embossing and no readable lettering. |
| `k2a_letztes_bild_abschrift` | Rückseitenprotokoll mit grauem Farbsaum. | A folded testimony sheet with a grey paint smear along the edge and a small red wax seal. A narrow strip of canvas is tucked behind the paper. |

## Fallkarten, optional

Die vier Akten können zunächst die vorhandene Kapitel-2-Karte verwenden. Je Karte `platzhalter: public/sprites/ui/cases/R_akte_kapitel2.png`; Maße und Einpassung von dieser Vorlage übernehmen.

| ID | Art | Beschreibung | Englischer Bild-Prompt |
|---|---|---|---|
| `k2a_tinte` | Aktenkarte | Nachttelegramm, Kupferbrücke, violetter Daumenabdruck. | A small investigator case folder showing a wet telegraph strip, a removable copper bridge and a violet thumbprint, arranged as separate pieces of evidence. |
| `k2a_bittere_mittel` | Aktenkarte | Drei verschlossene Saftflaschen und ein zweites Wachssiegel. | An investigator case folder containing three sealed cough syrup bottles, a pale leaf and two overlapping wax seals. Keep the scene restrained and mournful. |
| `k2a_hafenrecht` | Aktenkarte | Leerer Kahn, drei Netzgewichte, eine durchgestrichene Registriernummer. | An investigator case folder with an empty moored boat, three distinct net weights and a crossed-out registry line, without bodies or readable text. |
| `k2a_letztes_bild` | Aktenkarte | Totenbild mit Frau am Rand und beschriebener Rückseite. | An investigator case folder with a mourning portrait tilted to reveal its annotated back; a faint woman waits at the edge of the painted background. No readable lettering. |
