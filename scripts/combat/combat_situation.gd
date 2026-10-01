## Everything about the battlefield that changes an attack: cover, height
## difference, who stands in the dark. Built once per attack from the scene
## ([method assess]) or by hand in tests, then handed to [AttackResolver], so
## the rules themselves never touch physics.
class_name CombatSituation
extends RefCounted

var cover: Visibility.Cover = Visibility.Cover.NONE
## Attacker height minus target height in meters.
var elevation_m: float = 0.0
var attacker_in_shadow: bool = false
var target_in_shadow: bool = false
## Edge-to-edge distance between the two.
var distance_m: float = 0.0


static func assess(attacker: Actor, target: Actor) -> CombatSituation:
	var s := CombatSituation.new()
	if attacker == null or target == null:
		return s
	s.distance_m = attacker.distance_to(target)
	if attacker.is_inside_tree() and target.is_inside_tree():
		s.cover = Visibility.cover_between(attacker, target)
		s.elevation_m = attacker.global_position.y - target.global_position.y
		s.attacker_in_shadow = Lighting.is_in_shadow(attacker)
		s.target_in_shadow = Lighting.is_in_shadow(target)
	return s


func cover_ac_bonus() -> int:
	return Visibility.cover_bonus(cover)


func elevation_bonus() -> int:
	return Visibility.elevation_bonus(elevation_m)


func has_high_ground() -> bool:
	return elevation_bonus() > 0


## Unseen archer: shooting from the dark at someone who hasn't been
## alerted by an attack yet.
func unseen_attacker(ranged: bool, revealed: bool) -> bool:
	return ranged and attacker_in_shadow and not revealed


## Hard to see: a ranged shot at a creature in the dark that isn't close.
func target_hard_to_see(ranged: bool) -> bool:
	return ranged and target_in_shadow and distance_m > Lighting.SHADOW_RANGE_M


## Human readable notes for the HUD / log, e.g. ["half cover: AC +2", "high ground: +2 to hit"].
func summary(ranged: bool, uses_attack_roll: bool, revealed: bool) -> PackedStringArray:
	var out := PackedStringArray()
	if ranged and cover != Visibility.Cover.NONE:
		out.append("%s: AC +%d" % [Visibility.cover_name(cover), cover_ac_bonus()])
	var elevation := elevation_bonus()
	if elevation > 0:
		out.append("high ground: +%d to hit" % elevation)
	elif elevation < 0:
		out.append("target above: %d to hit" % elevation)
	if uses_attack_roll:
		if unseen_attacker(ranged, revealed):
			out.append("attacking from the shadows: advantage")
		if target_hard_to_see(ranged):
			out.append("target in the dark: disadvantage")
	return out
