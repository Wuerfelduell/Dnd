## Everything that happened during one attack roll, for logging and UI.
class_name AttackResult
extends RefCounted

var weapon: WeaponData
var attack_roll: DiceResult
var target_ac: int = 10
var hit: bool = false
var critical: bool = false
var fumble: bool = false
## Null on a miss.
var damage_roll: DiceResult
var damage_total: int = 0


func outcome_text() -> String:
	if critical:
		return "CRITICAL HIT"
	if fumble:
		return "FUMBLE"
	return "HIT" if hit else "MISS"
