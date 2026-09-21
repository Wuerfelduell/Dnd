## Experience and level-ups (reduced 5e, levels 3-8 for the prototype).
##
## Level-ups are applied to the actor's *runtime copy* of its ActorData, so the
## .tres files in the project never change.
class_name Progression
extends RefCounted

## XP needed to *reach* a level (counted from 0 at the starting level 3).
## Shortened so a couple of encounters show visible progress.
const XP_TO_REACH := {4: 200, 5: 450, 6: 800, 7: 1250, 8: 1800}
const MAX_LEVEL := 8

## Full-caster slot tables by level (index = slot level).
const CASTER_SLOTS := {
	3: [0, 4, 2],
	4: [0, 4, 3],
	5: [0, 4, 3, 2],
	6: [0, 4, 3, 3],
	7: [0, 4, 3, 3, 1],
	8: [0, 4, 3, 3, 2],
}

## Spells learned on reaching a level.
const SPELLS_LEARNED := {
	"Wizard": {
		4: ["res://data/spells/shatter.tres", "res://data/spells/misty_step.tres"],
		5: ["res://data/spells/fireball.tres"],
	},
	"Cleric": {
		5: ["res://data/spells/mass_healing_word.tres"],
	},
}


class Report:
	var actor: Actor
	var xp_gained: int = 0
	var old_level: int = 0
	var new_level: int = 0
	var lines: PackedStringArray = PackedStringArray()

	func leveled() -> bool:
		return new_level > old_level


static func proficiency_for_level(level: int) -> int:
	return 2 + int(floor((level - 1) / 4.0))


## Damage cantrips: 1 die at levels 1-4, 2 at 5-10, 3 at 11-16, 4 at 17+.
static func cantrip_tier(level: int) -> int:
	if level >= 17:
		return 4
	if level >= 11:
		return 3
	if level >= 5:
		return 2
	return 1


static func scaled_spell_dice(caster: Actor, spell: SpellData) -> String:
	if spell.damage_dice == "" or not spell.is_cantrip() or not spell.cantrip_scaling:
		return spell.damage_dice
	return Dice.scale_notation(spell.damage_dice, cantrip_tier(caster.data.level))


## Splits the XP of the defeated enemies among the living party, applies
## level-ups and returns one report per party member (also without level-up).
static func award_encounter(party: Array[Actor], defeated: Array[Actor]) -> Array[Report]:
	var reports: Array[Report] = []
	var total := 0
	for e in defeated:
		total += e.data.xp_value
	if party.is_empty():
		return reports
	var share := int(ceil(float(total) / float(party.size())))
	for p in party:
		reports.append(grant_xp(p, share))
	return reports


static func grant_xp(actor: Actor, amount: int) -> Report:
	var report := Report.new()
	report.actor = actor
	report.xp_gained = amount
	report.old_level = actor.data.level
	actor.data.xp += amount
	while actor.data.level < MAX_LEVEL and actor.data.xp >= XP_TO_REACH.get(actor.data.level + 1, 999999):
		report.lines.append_array(apply_level_up(actor, actor.data.level + 1))
	report.new_level = actor.data.level
	return report


static func xp_for_next_level(actor: Actor) -> int:
	return XP_TO_REACH.get(actor.data.level + 1, -1)


## Applies exactly one level and returns human readable change lines.
static func apply_level_up(actor: Actor, new_level: int) -> PackedStringArray:
	var d := actor.data
	var lines := PackedStringArray()
	var stats := d.stats
	d.level = new_level
	lines.append("Level %d!" % new_level)

	# Hit points: average hit die + CON.
	var gain := d.hit_die / 2 + 1 + stats.constitution_mod
	stats.max_hp += gain
	actor.current_hp = mini(stats.max_hp, actor.current_hp + gain)
	lines.append("+%d max HP (%d)" % [gain, stats.max_hp])

	# Proficiency bonus.
	var prof := proficiency_for_level(new_level)
	if prof != stats.proficiency_bonus:
		stats.proficiency_bonus = prof
		lines.append("Proficiency bonus +%d (attacks, saves, spell DC)" % prof)

	# Ability score improvement at 4 and 8: +2 to the primary ability (= +1 modifier).
	if new_level in [4, 8]:
		var before := stats.ability_mod(d.primary_ability)
		_raise_ability(stats, d.primary_ability)
		lines.append("%s modifier %+d -> %+d" % [d.primary_ability.to_upper(), before, before + 1])

	# Class features.
	match d.class_name_text:
		"Fighter":
			d.second_wind_bonus = new_level
			if new_level == 5:
				d.attacks_per_action = 2
				lines.append("Extra Attack: two attacks per Attack action")
		"Rogue":
			var dice := int(ceil(new_level / 2.0))
			if d.sneak_attack_dice != "%dd6" % dice:
				d.sneak_attack_dice = "%dd6" % dice
				lines.append("Sneak Attack %dd6" % dice)
			if new_level == 5:
				lines.append("Uncanny Dodge (not implemented yet)")
		"Wizard", "Cleric":
			if CASTER_SLOTS.has(new_level):
				d.spell_slots = PackedInt32Array(CASTER_SLOTS[new_level])
				var parts := PackedStringArray()
				for lvl in range(1, d.spell_slots.size()):
					parts.append("L%d x%d" % [lvl, d.spell_slots[lvl]])
				lines.append("Spell slots: " + ", ".join(parts))
			for path in SPELLS_LEARNED.get(d.class_name_text, {}).get(new_level, []):
				var spell: SpellData = load(path)
				if spell != null and not _knows(d, spell):
					d.spells.append(spell)
					lines.append("New spell: %s" % spell.display_name)
			if new_level == 5:
				lines.append("Cantrips deal double dice")
	actor.reset_spell_slots()
	actor.rebuild_actions()
	actor.hp_changed.emit(actor.current_hp, actor.max_hp())
	actor.statuses_changed.emit(actor)
	return lines


static func _raise_ability(stats: ActorStats, ability: String) -> void:
	match ability.to_lower():
		"str":
			stats.strength_mod += 1
		"dex":
			stats.dexterity_mod += 1
		"con":
			stats.constitution_mod += 1
		"int":
			stats.intelligence_mod += 1
		"wis":
			stats.wisdom_mod += 1
		"cha":
			stats.charisma_mod += 1


static func _knows(d: ActorData, spell: SpellData) -> bool:
	for s in d.spells:
		if s.display_name == spell.display_name:
			return true
	return false
