## Casting a [SpellData]: checks slots and targets, then hands the effect to
## [SpellResolver]. One class covers every spell in the data files.
class_name SpellAction
extends CombatAction

var spell: SpellData


func _init(p_spell: SpellData) -> void:
	spell = p_spell
	id = StringName("spell_" + spell.display_name.to_lower().replace(" ", "_"))
	display_name = spell.display_name
	cost = spell.cost
	range_m = spell.range_m
	match spell.target_kind:
		SpellData.TargetKind.ENEMY:
			target_kind = TargetKind.ENEMY
		SpellData.TargetKind.ALLY:
			target_kind = TargetKind.ALLY
		SpellData.TargetKind.ANY_CREATURE:
			target_kind = TargetKind.ANY
		_:
			target_kind = TargetKind.NONE
	tag = "cantrip" if spell.is_cantrip() else "L%d" % spell.level


func is_available(actor: Actor) -> bool:
	return super.is_available(actor) and actor.has_spell_slot(spell.level)


func unavailable_reason(actor: Actor) -> String:
	var base := super.unavailable_reason(actor)
	if base != "":
		return base
	if not actor.has_spell_slot(spell.level):
		return "No level %d spell slot left" % spell.level
	return ""


func can_target(actor: Actor, target: Actor) -> bool:
	if not requires_target():
		return true
	if target == null or not target.is_alive() and not (spell.heal_dice != "" and target.is_down):
		return false
	if not in_range(actor, target):
		return false
	if spell.creature_type_filter != "" and target.data.creature_type != spell.creature_type_filter:
		return false
	match spell.target_kind:
		SpellData.TargetKind.ENEMY:
			return actor.is_hostile_to(target)
		SpellData.TargetKind.ALLY:
			return not actor.is_hostile_to(target)
	return true


func pay_cost(actor: Actor) -> bool:
	if not actor.turn_state.spend(cost):
		return false
	return actor.spend_spell_slot(spell.level)


func execute(actor: Actor, target: Actor) -> void:
	await SpellResolver.cast(actor, spell, target)


func description(actor: Actor) -> String:
	var s := "%s (%s, %s" % [display_name, "cantrip" if spell.is_cantrip() else "level %d" % spell.level, cost_name()]
	if spell.concentration:
		s += ", concentration"
	s += "): " + spell.description
	match spell.attack_kind:
		SpellData.AttackKind.SPELL_ATTACK:
			s += " Spell attack 1d20%+d." % actor.data.spell_attack_bonus()
		SpellData.AttackKind.SAVE:
			s += " %s save DC %d." % [spell.save_ability.to_upper(), actor.data.spell_save_dc()]
	return s
