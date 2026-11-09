# Grafikwünsche für die Koop-Aufträge

Spieler-2-Figuren und Portraits kommen aus Paket AH, Varianten p2a/p2b. Keine zusätzlichen Personen, Gegner oder Inventar-Icons nötig. Die Geldbelohnungen verwenden die bestehende Anzeige. Die folgenden kleinen Requisiten sind optionale Ergänzungen; die genannten Platzhalter sind ausschließlich Angaben für den späteren Einbau und stehen nicht als neue Felder in den Spieldaten.

| ID | Art | Beschreibung | platzhalter | English prompt |
|---|---|---|---|---|
| koop_zwei_schluessel_schloss | Karten-Requisite 16×16 | Messingschloss mit Rückstellfeder und einem eingeritzten Richtungspfeil. | `locker` | A small brass keyhole plate with a visible return spring and a shallow inward arrow. Tarnished edges, no lettering. |
| koop_ablenkung_ablage | Karten-Requisite 16×16 | Zwei schmale Ablagefächer mit Anker und Krone als Zeichen. | `paper` | Two narrow wooden document slots, one marked with an anchor symbol and the other with a small crown. Worn salt-stained wood, no words or numbers. |
| koop_spiegelbild_seitenrahmen | Karten-Requisite 32×48, offen/verhängt | Schmaler intakter Seitenspiegel mit beweglichem dunklem Tuch. | `paper` als Wartungsschild für die Textinteraktion | A narrow Victorian service mirror in a plain brass frame with a dark cloth tied beside it. Show an uncovered and a fully covered version, with no people or lettering. |

Die Spielfunktion ist auch als markierte Textinteraktion möglich. Das Papier steht als Wartungsschild für die Spiegelinteraktion, nicht als Ersatzbild eines Spiegels. Die bekannten Sprite-Keys `locker` und `paper` sind in `src/data/maps/revier.json` belegt. Für das spätere Verhängen ist eine eigene Rahmenvariante vorgesehen.
