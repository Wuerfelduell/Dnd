## Central dice roller.
##
## All randomness in the rules layer goes through this class so tests can seed
## it and so a future "dice history" has one entry point.
class_name Dice
extends RefCounted

static var _rng := RandomNumberGenerator.new()
static var _notation_regex: RegEx


## Make rolls deterministic (used by tests and the --seed command line flag).
static func seed_rng(seed_value: int) -> void:
	_rng.seed = seed_value


static func roll(count: int, sides: int, modifier: int = 0) -> DiceResult:
	assert(count >= 1 and sides >= 2, "Invalid dice: %dd%d" % [count, sides])
	var result := DiceResult.new()
	result.count = count
	result.sides = sides
	result.modifier = modifier
	for _i in count:
		result.rolls.append(_rng.randi_range(1, sides))
	return result


static func d20(modifier: int = 0, mode: DiceResult.Mode = DiceResult.Mode.NORMAL) -> DiceResult:
	if mode == DiceResult.Mode.NORMAL:
		return roll(1, 20, modifier)
	var result := roll(2, 20, modifier)
	result.count = 1
	result.mode = mode
	if mode == DiceResult.Mode.ADVANTAGE:
		result.kept = 0 if result.rolls[0] >= result.rolls[1] else 1
	else:
		result.kept = 0 if result.rolls[0] <= result.rolls[1] else 1
	return result


## Combines advantage and disadvantage sources the 5e way: any of both cancels out.
static func combine_modes(advantage: bool, disadvantage: bool) -> DiceResult.Mode:
	if advantage and not disadvantage:
		return DiceResult.Mode.ADVANTAGE
	if disadvantage and not advantage:
		return DiceResult.Mode.DISADVANTAGE
	return DiceResult.Mode.NORMAL


## Roll a notation string like "1d8+3", "2d6" or "d4-1".
## [param extra_modifier] is added on top (e.g. the ability modifier).
static func parse(notation: String, extra_modifier: int = 0) -> DiceResult:
	if _notation_regex == null:
		_notation_regex = RegEx.new()
		_notation_regex.compile("^\\s*(\\d*)\\s*[dD]\\s*(\\d+)\\s*(?:([+-])\\s*(\\d+))?\\s*$")
	var m := _notation_regex.search(notation)
	assert(m != null, "Invalid dice notation: '%s'" % notation)
	var count := 1
	if m.get_string(1) != "":
		count = int(m.get_string(1))
	var sides := int(m.get_string(2))
	var modifier := 0
	if m.get_string(4) != "":
		modifier = int(m.get_string(4))
		if m.get_string(3) == "-":
			modifier = -modifier
	return roll(count, sides, modifier + extra_modifier)


## Random pick used for tie breaking etc. (also seeded).
static func randf() -> float:
	return _rng.randf()
