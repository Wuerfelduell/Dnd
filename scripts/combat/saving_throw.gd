## Pure rules: d20 + ability modifier (+ proficiency, + Bless) against a DC.
class_name SavingThrow
extends RefCounted


static func resolve(actor: Actor, ability: String, dc: int, source_name: String = "") -> SaveResult:
	var result := SaveResult.new()
	result.ability = ability.to_lower()
	result.dc = dc
	result.source_name = source_name
	if result.ability in ["str", "dex"] and actor.status_flag("auto_fail_str_dex_saves"):
		result.auto_failed = true
		result.success = false
		result.roll = DiceResult.new()
	else:
		result.roll = Dice.d20(actor.data.stats.save_bonus(result.ability))
		var bonus := actor.status_bonus_dice("save_bonus_dice")
		for label in bonus:
			result.roll.add_extra(Dice.parse(bonus[label]), label)
		result.success = result.roll.total() >= dc
	EventBus.save_resolved.emit(actor, result)
	return result
