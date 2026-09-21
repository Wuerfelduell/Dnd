## Result of a single dice roll expression such as "1d20+5" or "2d6".
##
## Keeps the individual die values so the UI can show *what* was rolled,
## not only the total.
class_name DiceResult
extends RefCounted

var count: int = 1
var sides: int = 20
var modifier: int = 0
var rolls: Array[int] = []


func total() -> int:
	var sum := modifier
	for r in rolls:
		sum += r
	return sum


## Sum of the dice without the modifier.
func dice_sum() -> int:
	var sum := 0
	for r in rolls:
		sum += r
	return sum


## The first die. For a d20 attack roll this is the "natural" roll.
func natural() -> int:
	return rolls[0] if rolls.size() > 0 else 0


func notation() -> String:
	var s := "%dd%d" % [count, sides]
	if modifier > 0:
		s += "+%d" % modifier
	elif modifier < 0:
		s += "%d" % modifier
	return s


## e.g. "1d20+5: [14] + 5 = 19"
func describe() -> String:
	var parts := PackedStringArray()
	for r in rolls:
		parts.append(str(r))
	var s := "%s: [%s]" % [notation(), ", ".join(parts)]
	if modifier > 0:
		s += " + %d" % modifier
	elif modifier < 0:
		s += " - %d" % absi(modifier)
	s += " = %d" % total()
	return s
