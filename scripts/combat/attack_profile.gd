## Describes *how* an attack is made so [AttackResolver] can treat weapon
## attacks and spell attacks the same way.
class_name AttackProfile
extends RefCounted

var label: String = "attack"
var attack_bonus: int = 0
var damage_dice: String = "1d6"
var damage_bonus: int = 0
var damage_type: String = ""
var is_ranged: bool = false
var reach_m: float = 1.5
## Finesse / ranged weapons may add Sneak Attack.
var sneak_eligible: bool = false
## Spells never add Sneak Attack and ignore the light-weapon rule.
var is_weapon: bool = true
var weapon: WeaponData


static func from_weapon(attacker: Actor, p_weapon: WeaponData, add_damage_bonus: bool = true) -> AttackProfile:
	var p := AttackProfile.new()
	p.label = p_weapon.display_name
	p.weapon = p_weapon
	p.attack_bonus = attacker.attack_bonus(p_weapon)
	p.damage_dice = p_weapon.damage_dice
	p.damage_bonus = attacker.damage_bonus(p_weapon) if add_damage_bonus else 0
	p.damage_type = p_weapon.damage_type
	p.is_ranged = p_weapon.is_ranged
	p.reach_m = p_weapon.range_m
	p.sneak_eligible = p_weapon.qualifies_for_sneak_attack()
	p.is_weapon = true
	return p


static func from_spell(caster: Actor, spell: SpellData) -> AttackProfile:
	var p := AttackProfile.new()
	p.label = spell.display_name
	p.attack_bonus = caster.data.spell_attack_bonus()
	p.damage_dice = Progression.scaled_spell_dice(caster, spell)
	p.damage_bonus = 0
	p.damage_type = spell.damage_type
	p.is_ranged = spell.range_m > 1.5
	p.reach_m = spell.range_m
	p.sneak_eligible = false
	p.is_weapon = false
	return p
