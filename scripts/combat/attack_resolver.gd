## Pure rules: resolves a weapon attack (d20 + bonus vs AC, damage dice).
##
## Reduced 5e: natural 20 = automatic hit + doubled damage dice,
## natural 1 = automatic miss. No advantage/disadvantage, cover or resistances
## yet — those belong here when they arrive.
class_name AttackResolver
extends RefCounted


static func resolve(attacker: Actor, weapon: WeaponData, target: Actor) -> AttackResult:
	var result := AttackResult.new()
	result.weapon = weapon
	result.target_ac = target.armor_class()
	result.attack_roll = Dice.d20(attacker.attack_bonus(weapon))
	var natural := result.attack_roll.natural()
	result.critical = natural == 20
	result.fumble = natural == 1
	if result.critical:
		result.hit = true
	elif result.fumble:
		result.hit = false
	else:
		result.hit = result.attack_roll.total() >= result.target_ac

	if result.hit:
		result.damage_roll = Dice.parse(weapon.damage_dice, attacker.damage_bonus(weapon))
		if result.critical:
			# Critical: roll the weapon dice a second time (modifier only once).
			var extra := Dice.parse(weapon.damage_dice, 0)
			result.damage_roll.rolls.append_array(extra.rolls)
			result.damage_roll.count += extra.count
		result.damage_total = maxi(1, result.damage_roll.total())
	return result
