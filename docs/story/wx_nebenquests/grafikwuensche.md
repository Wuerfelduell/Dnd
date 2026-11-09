# Grafikwünsche und Platzhalter

Die folgenden Grafiken sind Wünsche für den späteren Einbau, keine in diesem Paket erzeugten Bilder. `platzhalter` bezeichnet ausschließlich vorhandene Repo-Dateien oder deren bestehende Atlasmotive; dieses Feld wird nicht in die Spieldaten übertragen. Die Farbpaletten der vier neuen NPCs ermöglichen bis dahin auch die vorhandene prozedurale Darstellung.

## Figuren

Je Figur ein Lauf-Sheet 64×128 und ein Portrait 64×64. Bei den vorhandenen Emotions-Sheets als Portrait-Platzhalter zunächst den neutralen 64×64-Ausschnitt verwenden, nicht das ganze Sheet skalieren.

| ID | Art | Beschreibung | platzhalter | English prompt |
|---|---|---|---|---|
| `k2n_eichmeisterin` | Lauf-Sheet 64×128 | Eine ältere Eichmeisterin mit Messinggewichten am Gürtel und salzgebleichten Ärmelkanten. | `public/sprites/characters/R_hesper_walk.png` | An older market inspector wears a practical burgundy coat and a belt carrying small brass calibration weights. Salt has whitened the edges of her sleeves; her stance is patient and exacting. |
| `k2n_eichmeisterin` | Portrait 64×64 | Ada betrachtet Menschen mit derselben Ruhe wie eine ausschwingende Waage. | `public/sprites/portraits/R_hesper_emotions.png` | Ada Venn has a broad lined face, grey hair pinned tightly back, and steady measuring eyes. A small brass weight rests between her thumb and forefinger. |
| `k2n_zeichner` | Lauf-Sheet 64×128 | Ein ziviler Zeichner mit zu weitem Mantel, Zeichenmappe und stumpfem Bleistift. | `public/sprites/characters/R_pedell_walk.png` | A thin civilian draftsman wears an oversized dark coat and carries a battered drawing portfolio under one arm. A short pencil is tucked behind his ear; he has no uniform or weapon. |
| `k2n_zeichner` | Portrait 64×64 | Nils hält einen Bleistift verkehrt herum und blickt an seinem Gegenüber vorbei. | `public/sprites/portraits/R_pedell_emotions.png` | Nils Feder has tired attentive eyes, ink stains on two fingers, and a pencil held by its blunt end. His expression suggests a carefully concealed kindness. |
| `k2n_student` | Lauf-Sheet 64×128 | Ein junger Student in geflickter Akademierobe mit zwei verschieden sauberen Probengläsern. | `public/sprites/characters/R_pedell_walk.png` | A young water chemistry student wears a patched indigo academic robe and carries two stoppered sample jars. One jar is clear and the other holds a faint green residue. |
| `k2n_student` | Portrait 64×64 | Jorin wirkt übernächtigt und schaut regelmäßig zur Tür. | `public/sprites/portraits/R_pedell_emotions.png` | Jorin Siel is a sleepless young student with untidy dark hair and an anxious glance over one shoulder. Green salt dust marks the cuff of his academic robe. |
| `k2n_waerter` | Lauf-Sheet 64×128 | Ein gebeugter ehemaliger Turmwärter in altem Ölzeug mit einer dochtlosen Lampe. | `public/sprites/characters/Q_druce_walk.png` | An elderly retired lighthouse keeper wears weathered oilskins and carries a small lantern with no wick. A rolled maintenance chart is tied to his belt with faded cord. |
| `k2n_waerter` | Portrait 64×64 | Rinns wettergegerbtes Gesicht steht im Widerspruch zu der sorgfältig gepflegten leeren Lampe. | `public/sprites/portraits/Q_druce_emotions.png` | Oskar Rinn has a deeply weathered face, white stubble, and calm eyes accustomed to fog. He holds a polished but unlit maintenance lantern close to his chest. |

## Gegenstände

Alle fünf Items sind Schlüsselgegenstände mit Gewicht null, keine neuen Ausrüstungswerte. Die drei Umschläge müssen durch ihre Motive auch ohne Text unterscheidbar bleiben.

| ID | Art | Beschreibung | platzhalter | English prompt |
|---|---|---|---|---|
| `k2n_pfandzettel` | Item-Icon 16×16 | Ein geknickter Pfandzettel mit halb verwischtem altem Büro-Siegel. | `public/sprites/items/pfandschein.png` | A folded pawn receipt bears a half-smudged dark seal and a clipped corner. The paper is dry but worn from a long journey; no readable lettering. |
| `k2n_ivys_brief` | Item-Icon 16×16 | Ein sorgfältig gefalteter Brief mit schmalem Bindfaden und unaufdringlichem Wachspunkt. | `public/sprites/items/liebesbrief.png` | A carefully folded personal letter is tied with thin brown thread and a small plain wax dot. It feels modest, protective, and well handled; no readable text. |
| `k2n_brief_hesper` | Item-Icon 16×16 | Ein versiegelter Umschlag mit kleinem Schalenmotiv als Zeichen für Hesper. | `public/sprites/items/liebesbrief.png` | A sealed cream envelope has a small bowl symbol impressed into warm red wax. A slight bulge suggests coins enclosed safely inside. |
| `k2n_brief_druce` | Item-Icon 16×16 | Ein fester Umschlag mit Schleusenradmotiv im grauen Siegel. | `public/sprites/items/erpresserbrief.png` | A sturdy sealed envelope carries a simple sluice wheel symbol in grey wax. Its lower edge is protected by a narrow strip of oiled cloth. |
| `k2n_brief_pedell` | Item-Icon 16×16 | Ein schmaler Umschlag mit Besenmotiv und dunkelblauem Faden. | `public/sprites/items/pfaendungsbrief.png` | A narrow sealed envelope is bound with indigo thread and marked with a small broom symbol in wax. Keep the shape distinct from a broad coin pouch. |

## Sechs Kahn-Ausbauobjekte

Jeweils eine kleine Deko-Grafik für den Innenraum; optionale 16×16-Icons können daraus separat vereinfacht werden. Finale Position und Kollision werden beim Einbau bestimmt, die Beschreibung in `kahn_ausbau.json` bleibt maßgeblich.

| ID | Art | Beschreibung | platzhalter | English prompt |
|---|---|---|---|---|
| `k2n_kahn_reet` | Deko-Prop 32×32; optional Item-Icon 16×16 | Zwei trockene, leicht ungleichmäßige Reetmatten verdecken Fugen neben einer Koje. | `public/sprites/props/R_torfstich_props.png`, vorhandenes Reetmotiv | Two handwoven reed mats hang against the inside wall of a narrow peat boat. Their warm dry fibers cover a dark drafty seam, with simple cord ties at the top. |
| `k2n_kahn_kiste` | Deko-Prop 32×32; optional Item-Icon 16×16 | Eine niedrige Vorratskiste steht auf vier kurzen Füßen über dem feuchten Boden. | `public/sprites/props/G_loot_kiste.png` | A low wooden provisions chest stands on four short feet, with salt stains outside and a clean dry lining inside. A simple brass latch keeps the lid closed. |
| `k2n_kahn_glocke` | Deko-Prop 16×32; optional Item-Icon 16×16 | Eine kleine Messingglocke hängt an einem Balken, rotes Garn um den Klöppel. | `public/sprites/items/bronzeglocke_klein.png` | A small brass homecoming bell hangs from a short rope beneath a wooden beam. Red yarn is wrapped around the clapper, with a soft worn shine on the rim. |
| `k2n_kahn_waschtisch` | Deko-Prop 32×32; optional Item-Icon 16×16 | Ein Glasbecken und ein sauber verschlossener Krug stehen auf einem schmalen Wandbrett. | `public/sprites/props/R_innen_props.png`, vorhandenes Glasmotiv | A narrow wall shelf holds a clear glass washbasin and a stoppered clean water jug. A folded cloth hangs underneath, with no glowing residue or laboratory clutter. |
| `k2n_kahn_ofen` | Deko-Prop 32×48; optional Item-Icon 16×16 | Ein kleiner genieteter Torfofen mit kurzem Rauchrohr passt in die Kajüte. | `public/sprites/props/V_glocke_props.png`, vorhandener Torfofen | A compact riveted peat stove has a short bent flue, a small warm fire door, and one peat brick waiting beside it. Its proportions fit the cramped cabin of a working boat. |
| `k2n_kahn_kartentisch` | Deko-Prop 32×32; optional Item-Icon 16×16 | Ein klappbarer Tisch trägt eine Wachstuchkarte mit genau zwei Peilstrichen. | `public/sprites/props/Q_kajuete_props.png`, vorhandenes Tischmotiv | A small folding boat table supports a waxed maintenance chart with two simple bearing lines and a few coastal marks. A dull brass paperweight and rolled cord hold the corners down; no legible words. |

Reetdecker und namenloses Kind werden in diesem Entwurf durch ortsgebundene Leseszenen vermittelt. Dafür werden keine zusätzlichen Figuren-Sheets angefordert. Neue Gegnergrafiken sind nicht erforderlich.
