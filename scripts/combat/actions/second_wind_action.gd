## Second Wind (Fighter): Bonus Action, heal 1d10 + 1, once per combat.
class_name SecondWindAction
extends CombatAction

const FLAG := "second_wind_used"
const HEAL_DICE := "1d10"
const HEAL_BONUS := 1


func _init() -> void:
	id = &"second_wind"
	display_name = "Second Wind"
	cost = Cost.BONUS_ACTION
	requires_target = false


func is_available(actor: Actor) -> bool:
	return super.is_available(actor) and not actor.combat_flags.get(FLAG, false)


func unavailable_reason(actor: Actor) -> String:
	if actor.combat_flags.get(FLAG, false):
		return "Already used this combat"
	return super.unavailable_reason(actor)


func execute(actor: Actor, _target: Actor) -> void:
	actor.combat_flags[FLAG] = true
	var roll := Dice.parse(HEAL_DICE, HEAL_BONUS)
	var healed := actor.heal(roll.total())
	EventBus.log("[b]%s[/b] uses Second Wind: %s, heals %d HP." % [actor.display_name(), roll.describe(), healed])
	EventBus.heal_applied.emit(actor, healed, roll)
	await GameState.wait(0.6)


func description(_actor: Actor) -> String:
	return "Second Wind (%s): heal %s+%d, once per combat" % [cost_name(), HEAL_DICE, HEAL_BONUS]
