## Result of a single dice roll expression such as "1d20+5" or "2d6".
##
## Keeps the individual die values so the UI can show *what* was rolled,
## not only the total. A d20 rolled with advantage/disadvantage keeps both
## dice and remembers which one counts ([member kept]).
class_name DiceResult
extends RefCounted

enum Mode { NORMAL, ADVANTAGE, DISADVANTAGE }

var count: int = 1
var sides: int = 20
var modifier: int = 0
var rolls: Array[int] = []
var mode: Mode = Mode.NORMAL
## Index of the die that counts (advantage/disadvantage); -1 = all dice are summed.
var kept: int = -1
## Extra dice added on top (e.g. Bless +1d4). Their totals count towards [method total].
var extras: Array[DiceResult] = []
## Short label for the extras, e.g. "Bless".
var extra_labels: PackedStringArray = PackedStringArray()


## Sum of the dice without the modifier (the kept die for advantage rolls).
func dice_sum() -> int:
	if kept >= 0 and kept < rolls.size():
		return rolls[kept]
	var sum := 0
	for r in rolls:
		sum += r
	return sum


func extras_total() -> int:
	var sum := 0
	for e in extras:
		sum += e.total()
	return sum


func total() -> int:
	return dice_sum() + modifier + extras_total()


## The die that counts. For a d20 attack roll this is the "natural" roll.
func natural() -> int:
	if rolls.is_empty():
		return 0
	if kept >= 0 and kept < rolls.size():
		return rolls[kept]
	return rolls[0]


func add_extra(extra: DiceResult, label: String) -> void:
	extras.append(extra)
	extra_labels.append(label)


func notation() -> String:
	var s := "%dd%d" % [count, sides]
	if modifier > 0:
		s += "+%d" % modifier
	elif modifier < 0:
		s += "%d" % modifier
	return s


## e.g. "1d20+5: [14] + 5 = 19", "1d20+5 (adv): [14, 3] -> 14 + 5 + Bless 1d4 [3] = 22"
func describe() -> String:
	var parts := PackedStringArray()
	for r in rolls:
		parts.append(str(r))
	var s := notation()
	if mode == Mode.ADVANTAGE:
		s += " (adv)"
	elif mode == Mode.DISADVANTAGE:
		s += " (dis)"
	s += ": [%s]" % ", ".join(parts)
	if kept >= 0 and rolls.size() > 1:
		s += " -> %d" % rolls[kept]
	if modifier > 0:
		s += " + %d" % modifier
	elif modifier < 0:
		s += " - %d" % absi(modifier)
	for i in extras.size():
		var e := extras[i]
		var label := extra_labels[i] if i < extra_labels.size() else "bonus"
		var eparts := PackedStringArray()
		for r in e.rolls:
			eparts.append(str(r))
		s += " + %s %s [%s]" % [label, e.notation(), ", ".join(eparts)]
	s += " = %d" % total()
	return s
