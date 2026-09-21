## Pure-ish rules: applies a [SpellData] to its targets (attack rolls, saving
## throws, auto hits, healing, statuses, concentration) and logs everything.
class_name SpellResolver
extends RefCounted


static func cast(caster: Actor, spell: SpellData, target: Actor) -> void:
	var targets := collect_targets(caster, spell, target)
	var names := PackedStringArray()
	for t in targets:
		names.append(t.display_name())
	var level_text := "cantrip" if spell.is_cantrip() else "level %d" % spell.level
	EventBus.log("[color=aqua][b]%s[/b] casts [b]%s[/b] (%s)%s[/color]" % [
		caster.display_name(), spell.display_name, level_text,
		"" if names.is_empty() else " on " + ", ".join(names)])
	if spell.concentration:
		caster.start_concentration(spell)
	if not targets.is_empty():
		caster.face_actor(targets[0])
	EventBus.spell_cast.emit(caster, spell, targets)
	for t in targets:
		for i in spell.repeat_count:
			await _apply_to(caster, spell, t, i)
			if not t.is_alive() and spell.heal_dice == "":
				break
	await GameState.wait(0.6)


static func collect_targets(caster: Actor, spell: SpellData, target: Actor) -> Array[Actor]:
	var out: Array[Actor] = []
	var others := CombatContext.actors_near(caster)
	match spell.target_kind:
		SpellData.TargetKind.SELF:
			out.append(caster)
		SpellData.TargetKind.ENEMY, SpellData.TargetKind.ALLY, SpellData.TargetKind.ANY_CREATURE:
			if target != null:
				out.append(target)
		SpellData.TargetKind.ALLIES_NEAR_SELF:
			out.append(caster)
			var allies: Array[Actor] = []
			for a in others:
				if a != caster and a.is_alive() and not caster.is_hostile_to(a) \
						and caster.center_distance_to(a) <= spell.area_radius_m:
					allies.append(a)
			allies.sort_custom(func(x, y): return caster.center_distance_to(x) < caster.center_distance_to(y))
			for a in allies:
				if out.size() >= spell.max_targets:
					break
				out.append(a)
		SpellData.TargetKind.ENEMIES_NEAR_SELF:
			for a in others:
				if a.is_alive() and caster.is_hostile_to(a) and caster.distance_to(a) <= spell.area_radius_m:
					out.append(a)
	return out


static func _apply_to(caster: Actor, spell: SpellData, target: Actor, index: int) -> void:
	var affected := true
	var damage_multiplier := 1.0
	var shot := "" if spell.repeat_count <= 1 else " #%d" % (index + 1)
	match spell.attack_kind:
		SpellData.AttackKind.SPELL_ATTACK:
			var profile := AttackProfile.from_spell(caster, spell)
			profile.label = spell.display_name + shot
			var result := AttackResolver.resolve(caster, target, profile, CombatContext.actors_near(caster))
			EventBus.log("%s%s vs [b]%s[/b]: %s vs AC %d = [b]%s[/b]%s%s" % [
				spell.display_name, shot, target.display_name(), result.attack_roll.describe(),
				result.target_ac, result.outcome_text(), result.mode_text(),
				(". Damage " + result.damage_roll.describe()) if result.hit else ""])
			EventBus.attack_resolved.emit(caster, target, result)
			affected = result.hit
			if result.hit:
				_deal(target, result.damage_total, spell.damage_type)
			await GameState.wait(0.5)
			if affected and spell.applies_status != null:
				_apply_status(caster, spell, target)
			return
		SpellData.AttackKind.SAVE:
			var save := SavingThrow.resolve(target, spell.save_ability, caster.data.spell_save_dc(), spell.display_name)
			EventBus.log("%s: [b]%s[/b] %s" % [spell.display_name, target.display_name(), save.describe()])
			if save.success:
				if spell.half_damage_on_save:
					damage_multiplier = 0.5
				else:
					affected = false
		SpellData.AttackKind.AUTO_HIT:
			affected = true
	if affected and spell.damage_dice != "":
		var roll := Dice.parse(spell.damage_dice)
		var amount := int(floor(roll.total() * damage_multiplier))
		EventBus.log("%s%s hits [b]%s[/b]: %s%s = %d %s damage" % [
			spell.display_name, shot, target.display_name(), roll.describe(),
			" (halved)" if damage_multiplier < 1.0 else "", amount, spell.damage_type])
		_deal(target, amount, spell.damage_type)
		EventBus.floating_text_requested.emit(target.global_position, str(amount), Color(1.0, 0.55, 0.2))
	elif not affected and spell.damage_dice != "":
		EventBus.floating_text_requested.emit(target.global_position, "SAVED", Color(0.8, 0.8, 0.85))
	if affected and spell.heal_dice != "":
		var heal_roll := Dice.parse(spell.heal_dice, caster.data.casting_mod() if spell.heal_adds_casting_mod else 0)
		var was_down := target.is_down
		var healed := target.heal(heal_roll.total())
		EventBus.log("%s heals [b]%s[/b]: %s -> %d HP%s" % [
			spell.display_name, target.display_name(), heal_roll.describe(), healed,
			" (back on their feet!)" if was_down else ""])
		EventBus.heal_applied.emit(target, healed, heal_roll)
	if affected and spell.applies_status != null:
		_apply_status(caster, spell, target)
	await GameState.wait(0.4)


static func _deal(target: Actor, amount: int, damage_type: String) -> void:
	target.take_damage(amount, damage_type)
	if not target.is_alive():
		EventBus.log("[color=orange][b]%s[/b] goes down![/color]" % target.display_name())


static func _apply_status(caster: Actor, spell: SpellData, target: Actor) -> void:
	if not target.is_alive():
		return
	var effect := target.add_status(spell.applies_status, caster, spell.status_rounds, caster.data.spell_save_dc())
	if spell.concentration:
		caster.link_concentration_effect(effect)
	EventBus.log("[color=orange]%s is now %s.[/color]" % [target.display_name(), spell.applies_status.display_name])
