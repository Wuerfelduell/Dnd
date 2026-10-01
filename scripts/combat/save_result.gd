## Outcome of a saving throw.
class_name SaveResult
extends RefCounted

var ability: String = "dex"
var dc: int = 10
var roll: DiceResult
var success: bool = false
var auto_failed: bool = false
var source_name: String = ""
## Situational bonus already included in the roll (e.g. cover), for the log.
var bonus: int = 0
var bonus_label: String = ""


func describe() -> String:
	if auto_failed:
		return "%s save vs DC %d: automatic failure" % [ability.to_upper(), dc]
	var note := ""
	if bonus != 0:
		note = " (%s %+d)" % [bonus_label, bonus]
	return "%s save vs DC %d: %s%s -> %s" % [ability.to_upper(), dc, roll.describe(), note, "SUCCESS" if success else "FAIL"]
