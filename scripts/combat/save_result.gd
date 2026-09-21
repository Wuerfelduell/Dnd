## Outcome of a saving throw.
class_name SaveResult
extends RefCounted

var ability: String = "dex"
var dc: int = 10
var roll: DiceResult
var success: bool = false
var auto_failed: bool = false
var source_name: String = ""


func describe() -> String:
	if auto_failed:
		return "%s save vs DC %d: automatic failure" % [ability.to_upper(), dc]
	return "%s save vs DC %d: %s -> %s" % [ability.to_upper(), dc, roll.describe(), "SUCCESS" if success else "FAIL"]
