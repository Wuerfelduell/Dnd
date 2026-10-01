## Everything that happened during one attack roll, for logging and UI.
class_name AttackResult
extends RefCounted

var label: String = "attack"
var attack_roll: DiceResult
var target_ac: int = 10
var hit: bool = false
var critical: bool = false
var fumble: bool = false
## Null on a miss.
var damage_roll: DiceResult
var damage_total: int = 0
var damage_type: String = ""
## Extra Sneak Attack dice (null when not applied).
var sneak_roll: DiceResult
## Why the roll had advantage / disadvantage (for the log).
var advantage_reasons: PackedStringArray = PackedStringArray()
var disadvantage_reasons: PackedStringArray = PackedStringArray()
## Flat modifiers from the battlefield, e.g. "half cover AC +2", "high ground +2".
var notes: PackedStringArray = PackedStringArray()
var situation: CombatSituation


func outcome_text() -> String:
	if critical:
		return "CRITICAL HIT"
	if fumble:
		return "FUMBLE"
	return "HIT" if hit else "MISS"


func mode_text() -> String:
	var parts := PackedStringArray()
	for n in notes:
		parts.append(n)
	if not advantage_reasons.is_empty():
		parts.append("advantage: " + ", ".join(advantage_reasons))
	if not disadvantage_reasons.is_empty():
		parts.append("disadvantage: " + ", ".join(disadvantage_reasons))
	if parts.is_empty():
		return ""
	return " (%s)" % "; ".join(parts)
