## Headless unit tests for the pure rules layer.
##
## Run with:  godot --headless --path . res://tests/unit_tests.tscn
## Exit code 0 = all passed.
extends Node

var _failures: int = 0
var _checks: int = 0


func _ready() -> void:
	Dice.seed_rng(12345)
	_test_dice()
	_test_data_resources()
	_test_turn_state()
	_test_attack_resolver()
	_test_advantage_rules()
	_test_saving_throws()
	_test_statuses_and_concentration()
	_test_spell_slots_and_actions()
	_test_point_spells()
	_test_progression()
	_test_movement_planning()
	_test_ammo_and_rests()
	_test_enemy_scaling()
	_test_initiative()
	print("\n%d checks, %d failures" % [_checks, _failures])
	get_tree().quit(0 if _failures == 0 else 1)


func check(condition: bool, message: String) -> void:
	_checks += 1
	if not condition:
		_failures += 1
		push_error("FAIL: " + message)
		print("FAIL: " + message)


func _make_actor(path: String) -> Actor:
	var actor := Actor.new()
	actor.data = load(path)
	add_child(actor)  # global_position etc. need a scene tree
	actor.initialize_runtime()
	actor.turn_state.begin_turn(actor.speed_m())
	return actor


func _place(actor: Actor, x: float, z: float) -> void:
	actor.position = Vector3(x, 0, z)


func _status(name: String) -> StatusEffectData:
	return load("res://data/statuses/%s.tres" % name)


# --- Dice -----------------------------------------------------------------

func _test_dice() -> void:
	for _i in 200:
		var r := Dice.roll(1, 20)
		check(r.total() >= 1 and r.total() <= 20, "d20 in range")
	var p := Dice.parse("2d6+3")
	check(p.count == 2 and p.sides == 6 and p.modifier == 3, "parse 2d6+3")
	check(p.rolls.size() == 2, "two dice rolled")
	check(p.total() == p.dice_sum() + 3, "total includes modifier")
	var neg := Dice.parse("d4-1", 2)
	check(neg.count == 1 and neg.sides == 4 and neg.modifier == 1, "parse d4-1 with extra +2")
	var d := Dice.parse("1d8", 3)
	check(d.notation() == "1d8+3", "notation: " + d.notation())
	check(d.describe().begins_with("1d8+3: ["), "describe: " + d.describe())
	Dice.seed_rng(7)
	var a := Dice.roll(3, 6).rolls
	Dice.seed_rng(7)
	var b := Dice.roll(3, 6).rolls
	check(a == b, "seeded rolls are reproducible")
	# Advantage / disadvantage keep the right die.
	for _i in 100:
		var adv := Dice.d20(2, DiceResult.Mode.ADVANTAGE)
		check(adv.rolls.size() == 2 and adv.natural() == maxi(adv.rolls[0], adv.rolls[1]), "advantage keeps the higher die")
		check(adv.total() == adv.natural() + 2, "advantage total = kept + modifier")
		var dis := Dice.d20(0, DiceResult.Mode.DISADVANTAGE)
		check(dis.natural() == mini(dis.rolls[0], dis.rolls[1]), "disadvantage keeps the lower die")
	check(Dice.combine_modes(true, true) == DiceResult.Mode.NORMAL, "adv + dis cancel")
	check(Dice.combine_modes(true, false) == DiceResult.Mode.ADVANTAGE, "adv alone")
	var blessed := Dice.d20(5)
	blessed.add_extra(Dice.parse("1d4"), "Bless")
	check(blessed.total() == blessed.natural() + 5 + blessed.extras[0].total(), "extra dice count towards the total")
	check("Bless" in blessed.describe(), "extras appear in describe: " + blessed.describe())


# --- Data -----------------------------------------------------------------

func _test_data_resources() -> void:
	var fighter: ActorData = load("res://data/actors/fighter.tres")
	check(fighter != null and fighter.faction == ActorData.Faction.PLAYER, "fighter.tres loads as player")
	check(fighter.stats.max_hp == 28 and fighter.stats.armor_class == 16, "fighter stats")
	check(fighter.weapons.size() == 2 and fighter.weapons[0] is WeaponData, "fighter weapons typed")
	check(fighter.has_second_wind and fighter.has_action_surge, "fighter features")
	check(fighter.stats.is_save_proficient("str") and not fighter.stats.is_save_proficient("dex"), "fighter save proficiencies")
	var wizard: ActorData = load("res://data/actors/wizard.tres")
	check(wizard.is_caster() and wizard.spells.size() == 5 and wizard.spells[0] is SpellData, "wizard spells typed")
	check(wizard.spell_slots.size() == 3 and wizard.spell_slots[1] == 4 and wizard.spell_slots[2] == 2, "wizard slots 4/2")
	check(wizard.spell_save_dc() == 13 and wizard.spell_attack_bonus() == 5, "wizard DC 13, attack +5")
	var cleric: ActorData = load("res://data/actors/cleric.tres")
	check(cleric.spells.size() == 6 and cleric.spell_save_dc() == 13, "cleric spells and DC")
	var rogue: ActorData = load("res://data/actors/rogue.tres")
	check(rogue.sneak_attack_dice == "2d6" and rogue.offhand_weapon != null and rogue.has_cunning_action, "rogue features")
	var wolf: ActorData = load("res://data/actors/wolf.tres")
	check(wolf.weapons[0].on_hit_status != null and wolf.weapons[0].on_hit_status.id == &"prone", "wolf bite knocks prone")
	var hob: ActorData = load("res://data/actors/hobgoblin.tres")
	check(hob.attacks_per_action == 2, "hobgoblin multiattack")
	var hold: SpellData = load("res://data/spells/hold_person.tres")
	check(hold.concentration and hold.applies_status.id == &"paralyzed" and hold.creature_type_filter == "humanoid", "hold person data")


# --- Turn state -----------------------------------------------------------

func _test_turn_state() -> void:
	var ts := TurnState.new()
	ts.begin_turn(9.0)
	check(ts.action_available and ts.bonus_action_available and ts.reaction_available, "fresh turn has action, bonus, reaction")
	check(ts.movement_remaining == 9.0, "movement = speed")
	check(ts.spend(CombatAction.Cost.ACTION), "spend action")
	check(not ts.spend(CombatAction.Cost.ACTION), "cannot spend action twice")
	check(ts.spend(CombatAction.Cost.BONUS_ACTION), "spend bonus action")
	check(ts.spend(CombatAction.Cost.REACTION) and not ts.reaction_available, "spend reaction")
	check(ts.spend(CombatAction.Cost.FREE), "free always ok")
	ts.spend_movement(4.5)
	check(is_equal_approx(ts.movement_remaining, 4.5), "movement decreases")
	ts.spend_movement(100.0)
	check(ts.movement_remaining == 0.0, "movement clamps at 0")


# --- Attacks --------------------------------------------------------------

func _test_attack_resolver() -> void:
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var gob := _make_actor("res://data/actors/goblin_warrior.tres")
	_place(fighter, 0, 0)
	_place(gob, 0, 1.2)
	var others: Array[Actor] = [fighter, gob]
	CombatContext.override_actors = others
	var sword: WeaponData = fighter.data.weapons[0]
	var bow: WeaponData = fighter.data.weapons[1]
	check(fighter.attack_bonus(sword) == 5 and fighter.damage_bonus(sword) == 3, "sword +5 / +3")
	check(fighter.attack_bonus(bow) == 3 and fighter.damage_bonus(bow) == 1, "bow +3 / +1")

	var hits := 0
	var crits := 0
	for _i in 500:
		var r := AttackResolver.resolve(fighter, gob, AttackProfile.from_weapon(fighter, sword), others)
		check(r.attack_roll.modifier == 5, "attack roll uses +5")
		if r.hit:
			hits += 1
			check(r.damage_total >= 4 and r.damage_total <= (2 * 8 + 3), "damage in 1d8+3 range (crit doubles dice)")
			if r.critical:
				crits += 1
				check(r.damage_roll.rolls.size() == 2, "crit rolls two damage dice")
		else:
			check(r.damage_total == 0, "miss deals no damage")
		if r.attack_roll.natural() == 20:
			check(r.hit and r.critical, "nat 20 always hits and crits")
		if r.attack_roll.natural() == 1:
			check(not r.hit, "nat 1 always misses")
	check(hits > 250 and hits < 400, "hit rate plausible (%d/500)" % hits)
	check(crits > 5, "some crits happened (%d)" % crits)

	check(gob.current_hp == 12, "goblin starts at max hp")
	gob.take_damage(5)
	check(gob.current_hp == 7, "damage reduces hp")
	gob.heal(3)
	check(gob.current_hp == 10, "heal adds hp")
	gob.take_damage(50)
	check(gob.current_hp == 0 and gob.is_down and not gob.is_alive(), "lethal damage -> down")
	gob.heal(4)
	check(gob.is_alive() and gob.current_hp == 4, "healing a downed creature revives it with the healed amount")
	CombatContext.override_actors = []
	fighter.queue_free()
	gob.queue_free()


func _test_advantage_rules() -> void:
	var rogue := _make_actor("res://data/actors/rogue.tres")
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var gob := _make_actor("res://data/actors/goblin_warrior.tres")
	var archer := _make_actor("res://data/actors/goblin_archer.tres")
	_place(rogue, 0, 0)
	_place(gob, 0, 1.2)
	_place(fighter, 1.2, 1.2)
	_place(archer, 10, 10)
	var others: Array[Actor] = [rogue, fighter, gob, archer]
	CombatContext.override_actors = others
	var shortsword: WeaponData = rogue.data.weapons[0]
	var shortbow: WeaponData = rogue.data.weapons[1]

	# Sneak Attack: ally adjacent to the target, once per turn.
	var r := AttackResolver.resolve(rogue, gob, AttackProfile.from_weapon(rogue, shortsword), others)
	if r.hit:
		check(r.sneak_roll != null and r.sneak_roll.count == 2, "sneak attack adds 2d6 with an adjacent ally")
		var r2 := AttackResolver.resolve(rogue, gob, AttackProfile.from_weapon(rogue, shortsword), others)
		check(r2.sneak_roll == null, "sneak attack only once per turn")
	else:
		check(r.sneak_roll == null, "no sneak dice on a miss")
	rogue.turn_state.sneak_attack_used = false
	check(rogue.turn_state.attacked_with_light_weapon, "light weapon attack remembered for two-weapon fighting")

	# No ally adjacent and no advantage -> no sneak attack.
	_place(fighter, 8, 8)
	rogue.turn_state.sneak_attack_used = false
	var r3 := AttackResolver.resolve(rogue, gob, AttackProfile.from_weapon(rogue, shortsword), others)
	check(r3.sneak_roll == null, "no sneak attack without ally or advantage")

	# Ranged attack with a hostile adjacent -> disadvantage.
	var r4 := AttackResolver.resolve(rogue, archer, AttackProfile.from_weapon(rogue, shortbow), others)
	check(r4.attack_roll.mode == DiceResult.Mode.DISADVANTAGE and "enemy adjacent" in r4.disadvantage_reasons, "shooting while adjacent to an enemy has disadvantage")

	# Prone target: melee advantage, ranged disadvantage; prone attacker disadvantage.
	gob.add_status(_status("prone"), null, -1)
	var r5 := AttackResolver.resolve(rogue, gob, AttackProfile.from_weapon(rogue, shortsword), others)
	check(r5.attack_roll.mode == DiceResult.Mode.ADVANTAGE, "melee vs prone has advantage")
	_place(rogue, 0, -6)
	var r6 := AttackResolver.resolve(rogue, gob, AttackProfile.from_weapon(rogue, shortbow), others)
	check(r6.attack_roll.mode == DiceResult.Mode.DISADVANTAGE, "ranged vs prone has disadvantage")
	var r7 := AttackResolver.resolve(gob, fighter, AttackProfile.from_weapon(gob, gob.data.weapons[0]), others)
	check(r7.attack_roll.mode == DiceResult.Mode.DISADVANTAGE, "prone attacker has disadvantage")
	gob.clear_all_statuses()

	# Guided: advantage on the next attack, then gone. Adv + dis cancel.
	_place(rogue, 0, 0)
	gob.add_status(_status("guided"), null, 1)
	var r8 := AttackResolver.resolve(rogue, gob, AttackProfile.from_weapon(rogue, shortsword), others)
	check(r8.attack_roll.mode == DiceResult.Mode.ADVANTAGE, "guided target grants advantage")
	check(not gob.has_status(&"guided"), "guided is consumed by the attack")
	gob.add_status(_status("guided"), null, 1)
	rogue.add_status(_status("prone"), null, -1)
	var r9 := AttackResolver.resolve(rogue, gob, AttackProfile.from_weapon(rogue, shortsword), others)
	check(r9.attack_roll.mode == DiceResult.Mode.NORMAL, "advantage and disadvantage cancel out")
	rogue.clear_all_statuses()

	# Paralyzed target: advantage and automatic crit from melee.
	gob.add_status(_status("paralyzed"), null, 10, 13)
	var r10 := AttackResolver.resolve(fighter, gob, AttackProfile.from_weapon(fighter, fighter.data.weapons[0]), others)
	check(r10.attack_roll.mode == DiceResult.Mode.ADVANTAGE, "paralyzed target grants advantage")
	_place(fighter, 0, 2.2)
	var r11 := AttackResolver.resolve(fighter, gob, AttackProfile.from_weapon(fighter, fighter.data.weapons[0]), others)
	check(r11.hit and r11.critical or r11.fumble, "melee hit vs paralyzed is a critical (or a natural 1)")
	check(gob.is_incapacitated(), "paralyzed = incapacitated")
	gob.clear_all_statuses()

	# Bless adds 1d4 to the attack roll.
	fighter.add_status(_status("blessed"), null, 10)
	var r12 := AttackResolver.resolve(fighter, gob, AttackProfile.from_weapon(fighter, fighter.data.weapons[0]), others)
	check(r12.attack_roll.extras.size() == 1 and r12.attack_roll.extras[0].sides == 4, "bless adds a d4 to attacks")
	CombatContext.override_actors = []
	for a in others:
		a.queue_free()


# --- Saving throws --------------------------------------------------------

func _test_saving_throws() -> void:
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var gob := _make_actor("res://data/actors/goblin_warrior.tres")
	check(fighter.data.stats.save_bonus("str") == 5, "fighter STR save +5 (proficient)")
	check(fighter.data.stats.save_bonus("dex") == 1, "fighter DEX save +1")
	var s := SavingThrow.resolve(fighter, "str", 11, "test")
	check(s.roll.modifier == 5 and s.success == (s.roll.total() >= 11), "save compares total vs DC")
	fighter.add_status(_status("blessed"), null, 10)
	var s2 := SavingThrow.resolve(fighter, "con", 10, "test")
	check(s2.roll.extras.size() == 1, "bless adds a d4 to saves")
	gob.add_status(_status("paralyzed"), null, 10, 13)
	var s3 := SavingThrow.resolve(gob, "dex", 10, "test")
	check(s3.auto_failed and not s3.success, "paralyzed auto-fails DEX saves")
	var s4 := SavingThrow.resolve(gob, "wis", 1, "test")
	check(not s4.auto_failed and s4.success, "paralyzed still rolls WIS saves")
	fighter.queue_free()
	gob.queue_free()


# --- Statuses & concentration ---------------------------------------------

func _test_statuses_and_concentration() -> void:
	var cleric := _make_actor("res://data/actors/cleric.tres")
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var gob := _make_actor("res://data/actors/goblin_warrior.tres")
	check(gob.speed_m() == 9.0, "goblin speed 9")
	gob.add_status(_status("slowed"), null, 1)
	check(gob.speed_m() == 6.0, "slowed reduces speed to 6")
	gob.end_of_turn_tick()
	check(not gob.has_status(&"slowed") and gob.speed_m() == 9.0, "slowed expires at the end of the goblin's turn")
	gob.add_status(_status("disengaging"), gob, 0)
	check(gob.status_flag("immune_to_opportunity_attacks"), "disengaging flag")
	gob.end_of_turn_tick()
	check(not gob.has_status(&"disengaging"), "disengaging ends at end of turn")
	gob.add_status(_status("prone"), null, -1)
	gob.end_of_turn_tick()
	check(gob.has_status(&"prone"), "prone does not expire on its own")
	gob.clear_all_statuses()

	# Repeat save on paralyzed: DC 1 -> shakes it off at end of turn.
	gob.add_status(_status("paralyzed"), cleric, 10, 1)
	gob.end_of_turn_tick()
	check(not gob.has_status(&"paralyzed"), "successful repeat save ends paralysis")
	gob.add_status(_status("paralyzed"), cleric, 10, 100)
	gob.end_of_turn_tick()
	check(gob.has_status(&"paralyzed") and gob.get_status(&"paralyzed").remaining_rounds == 9, "failed repeat save: still paralyzed, duration ticks")

	# Concentration links: breaking it removes effects from every holder.
	var bless: SpellData = load("res://data/spells/bless.tres")
	cleric.start_concentration(bless)
	var e1 := cleric.add_status(_status("blessed"), cleric, 10)
	var e2 := fighter.add_status(_status("blessed"), cleric, 10)
	cleric.link_concentration_effect(e1)
	cleric.link_concentration_effect(e2)
	check(cleric.has_status(&"blessed") and fighter.has_status(&"blessed"), "bless applied to two allies")
	cleric.break_concentration("test")
	check(cleric.concentration_spell == null, "concentration cleared")
	check(not cleric.has_status(&"blessed") and not fighter.has_status(&"blessed"), "breaking concentration removes linked effects")

	# Casting a second concentration spell replaces the first.
	cleric.start_concentration(bless)
	var e3 := fighter.add_status(_status("blessed"), cleric, 10)
	cleric.link_concentration_effect(e3)
	var hold: SpellData = load("res://data/spells/hold_person.tres")
	cleric.start_concentration(hold)
	check(cleric.concentration_spell == hold and not fighter.has_status(&"blessed"), "new concentration spell ends the previous one")

	# Damage forces a CON save (DC max(10, dmg/2)); going down always breaks it.
	var broke := false
	for _i in 60:
		cleric.start_concentration(hold)
		cleric.current_hp = cleric.max_hp()
		cleric.take_damage(20)  # DC 10 vs +2, survivable
		if cleric.concentration_spell == null:
			broke = true
			break
	check(broke, "damage can break concentration")
	cleric.start_concentration(hold)
	cleric.take_damage(999)
	check(cleric.is_down and cleric.concentration_spell == null, "going down breaks concentration")
	check(gob.has_status(&"paralyzed"), "unlinked statuses stay")
	gob.take_damage(999)
	check(gob.statuses.is_empty(), "going down clears statuses")
	cleric.queue_free()
	fighter.queue_free()
	gob.queue_free()


# --- Spell slots & action economy ----------------------------------------

func _test_spell_slots_and_actions() -> void:
	var wizard := _make_actor("res://data/actors/wizard.tres")
	var rogue := _make_actor("res://data/actors/rogue.tres")
	var hob := _make_actor("res://data/actors/hobgoblin.tres")
	var gob := _make_actor("res://data/actors/goblin_warrior.tres")
	_place(wizard, 0, 0)
	_place(gob, 0, 6)
	_place(rogue, 0, 1.2)
	_place(hob, 1.2, 1.2)
	check(wizard.has_spell_slot(1) and wizard.has_spell_slot(2) and wizard.has_spell_slot(0), "slots available")
	var mm := wizard.find_action(&"spell_magic_missile") as SpellAction
	var fb := wizard.find_action(&"spell_fire_bolt") as SpellAction
	var sr := wizard.find_action(&"spell_scorching_ray") as SpellAction
	check(mm != null and fb != null and sr != null, "wizard has spell actions")
	check(mm.target_kind == CombatAction.TargetKind.ENEMY and mm.can_target(wizard, gob), "magic missile targets an enemy in range")
	check(not mm.can_target(wizard, rogue), "magic missile cannot target an ally")
	for _i in 4:
		check(mm.pay_cost(wizard), "pay level 1 slot")
		wizard.turn_state.begin_turn(9.0)
	check(not wizard.has_spell_slot(1) and not mm.is_available(wizard), "no level 1 slots left")
	check(mm.unavailable_reason(wizard).begins_with("No level 1"), "reason mentions the slot")
	check(fb.is_available(wizard), "cantrips never run out")
	check(sr.is_available(wizard), "level 2 slots untouched")
	wizard.reset_spell_slots()
	check(wizard.has_spell_slot(1), "slots reset")
	var burning := wizard.find_action(&"spell_burning_hands") as SpellAction
	check(burning.target_kind == CombatAction.TargetKind.NONE, "area spell needs no click target")
	var others: Array[Actor] = [wizard, rogue, hob, gob]
	CombatContext.override_actors = others
	var targets := SpellResolver.collect_targets(wizard, burning.spell, null)
	check(targets.size() == 1 and targets[0] == hob, "burning hands hits only hostiles within 4.5 m (%d)" % targets.size())
	var cleric := _make_actor("res://data/actors/cleric.tres")
	_place(cleric, 3, 0)
	others.append(cleric)
	var bless := cleric.find_action(&"spell_bless") as SpellAction
	var bless_targets := SpellResolver.collect_targets(cleric, bless.spell, null)
	check(bless_targets.size() == 3 and bless_targets[0] == cleric and not bless_targets.has(hob), "bless picks caster + 2 nearest allies (%d)" % bless_targets.size())
	var hold := cleric.find_action(&"spell_hold_person") as SpellAction
	var wolf := _make_actor("res://data/actors/wolf.tres")
	_place(wolf, 3, 3)
	check(hold.can_target(cleric, hob) and not hold.can_target(cleric, wolf), "hold person only targets humanoids")
	CombatContext.override_actors = []

	# Multiattack: one action, two swings.
	var hob_attack := hob.find_action(&"attack_longsword") as AttackAction
	check(hob_attack.pay_cost(hob) and hob.turn_state.attacks_remaining == 1 and not hob.turn_state.action_available, "first swing spends the action, one swing left")
	check(hob_attack.is_available(hob) and hob_attack.pay_cost(hob) and hob.turn_state.attacks_remaining == 0, "second swing uses the remaining attack")
	check(not hob_attack.is_available(hob), "no third swing")

	# Two-weapon fighting needs a light weapon attack first; Cunning Action is a bonus action.
	var offhand := rogue.find_action(&"offhand_dagger")
	check(offhand != null and not offhand.is_available(rogue), "off-hand attack locked before a light attack")
	rogue.turn_state.attacked_with_light_weapon = true
	check(offhand.is_available(rogue), "off-hand attack unlocked after a light attack")
	check(rogue.find_action(&"dash_bonus") != null and rogue.find_action(&"disengage_bonus") != null, "rogue has cunning action variants")
	check(wizard.find_action(&"dash_bonus") == null, "wizard has no cunning action")

	# Fighter: Action Surge grants a second action, Second Wind heals.
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var surge := fighter.find_action(&"action_surge")
	check(surge != null and surge.is_available(fighter), "action surge available")
	fighter.turn_state.spend(CombatAction.Cost.ACTION)
	check(surge.pay_cost(fighter), "surge is free")
	fighter.turn_state.actions_remaining += 1
	fighter.combat_flags["action_surge_used"] = true
	check(fighter.turn_state.action_available and not surge.is_available(fighter), "one extra action, surge spent")
	for a in others:
		a.queue_free()
	cleric.queue_free()
	wolf.queue_free()
	fighter.queue_free()


# --- Point spells ---------------------------------------------------------

func _test_point_spells() -> void:
	var wizard := _make_actor("res://data/actors/wizard.tres")
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var g1 := _make_actor("res://data/actors/goblin_warrior.tres")
	var g2 := _make_actor("res://data/actors/goblin_archer.tres")
	var wolf := _make_actor("res://data/actors/wolf.tres")
	_place(wizard, 0, 0)
	_place(g1, 10, 0)
	_place(g2, 12, 1)
	_place(wolf, 30, 0)
	_place(fighter, 11, -4)
	var others: Array[Actor] = [wizard, fighter, g1, g2, wolf]
	CombatContext.override_actors = others
	var fireball: SpellData = load("res://data/spells/fireball.tres")
	check(fireball.needs_point() and fireball.area_radius_m == 6.0 and fireball.area_affects_allies, "fireball is a 6 m point spell")
	var hit := SpellResolver.collect_targets(wizard, fireball, null, Vector3(11, 0, 0))
	check(hit.size() == 3 and hit.has(g1) and hit.has(g2) and hit.has(fighter), "fireball at (11,0) hits both goblins and the fighter (%d)" % hit.size())
	check(not hit.has(wolf) and not hit.has(wizard), "fireball misses creatures outside the area")
	var shatter: SpellData = load("res://data/spells/shatter.tres")
	var s_hit := SpellResolver.collect_targets(wizard, shatter, null, Vector3(11, 0, 0))
	check(s_hit.size() == 2 and not s_hit.has(fighter), "shatter (3 m) hits the goblins but not the fighter 4 m away (%d)" % s_hit.size())
	# Actions: range check and AI spot finder.
	Progression.apply_level_up(wizard, 4)
	Progression.apply_level_up(wizard, 5)
	var fb := wizard.find_action(&"spell_fireball") as SpellAction
	check(fb != null and fb.target_kind == CombatAction.TargetKind.POINT, "wizard knows fireball at level 5 as a point action")
	check(fb.can_target_point(wizard, Vector3(40, 0, 0)) and not fb.can_target_point(wizard, Vector3(50, 0, 0)), "fireball range 45 m")
	var ms := wizard.find_action(&"spell_misty_step") as SpellAction
	check(ms != null and ms.spell.teleport and ms.cost == CombatAction.Cost.BONUS_ACTION, "misty step is a bonus action teleport")
	check(SpellResolver.collect_targets(wizard, ms.spell, null, Vector3(5, 0, 0)).is_empty(), "misty step has no targets")
	CombatContext.override_actors = []
	for a in others:
		a.queue_free()


# --- Progression ----------------------------------------------------------

func _test_progression() -> void:
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var rogue := _make_actor("res://data/actors/rogue.tres")
	var wizard := _make_actor("res://data/actors/wizard.tres")
	var cleric := _make_actor("res://data/actors/cleric.tres")
	var hob := _make_actor("res://data/actors/hobgoblin.tres")
	var gob := _make_actor("res://data/actors/goblin_warrior.tres")
	check(fighter.data.level == 3 and fighter.data.xp == 0, "party starts at level 3 with 0 xp")
	check(Progression.proficiency_for_level(4) == 2 and Progression.proficiency_for_level(5) == 3, "proficiency table")
	check(Progression.cantrip_tier(3) == 1 and Progression.cantrip_tier(5) == 2 and Progression.cantrip_tier(11) == 3, "cantrip tiers")
	check(Dice.scale_notation("1d10", 2) == "2d10" and Dice.scale_notation("1d4+1", 2) == "2d4+1", "dice scaling")
	# Data on disk must stay untouched: the actor works on a copy.
	var on_disk: ActorData = load("res://data/actors/fighter.tres")
	check(fighter.data != on_disk, "actor owns a runtime copy of its data")

	var hp_before := fighter.max_hp()
	var lines := Progression.apply_level_up(fighter, 4)
	check(fighter.data.level == 4 and fighter.max_hp() == hp_before + 8, "fighter L4: +8 HP (d10 avg 6 + CON 2)")
	check(fighter.data.stats.strength_mod == 4 and fighter.attack_bonus(fighter.data.weapons[0]) == 6, "fighter L4 ASI: STR +4, sword +6")
	check(on_disk.stats.strength_mod == 3 and on_disk.level == 3, "fighter.tres untouched")
	Progression.apply_level_up(fighter, 5)
	check(fighter.data.stats.proficiency_bonus == 3 and fighter.attack_bonus(fighter.data.weapons[0]) == 7, "fighter L5: proficiency +3, sword +7")
	check(fighter.data.attacks_per_action == 2 and fighter.data.second_wind_bonus == 5, "fighter L5: extra attack, second wind +5")
	check(lines.size() >= 3, "level-up reports lines (%d)" % lines.size())

	Progression.apply_level_up(rogue, 4)
	Progression.apply_level_up(rogue, 5)
	check(rogue.data.sneak_attack_dice == "3d6" and rogue.data.stats.dexterity_mod == 4, "rogue L5: sneak 3d6, DEX +4")

	Progression.apply_level_up(wizard, 4)
	check(wizard.data.spell_slots == PackedInt32Array([0, 4, 3]), "wizard L4 slots 4/3")
	check(wizard.find_action(&"spell_shatter") != null and wizard.find_action(&"spell_misty_step") != null, "wizard L4 learns shatter + misty step")
	Progression.apply_level_up(wizard, 5)
	check(wizard.data.spell_slots == PackedInt32Array([0, 4, 3, 2]) and wizard.has_spell_slot(3), "wizard L5 slots 4/3/2")
	check(wizard.find_action(&"spell_fireball") != null, "wizard L5 learns fireball")
	check(wizard.data.spell_save_dc() == 15, "wizard L5 DC 15 (8 + 3 + INT 4)")
	var fire_bolt: SpellData = load("res://data/spells/fire_bolt.tres")
	check(Progression.scaled_spell_dice(wizard, fire_bolt) == "2d10", "fire bolt scales to 2d10 at level 5")
	var mm: SpellData = load("res://data/spells/magic_missile.tres")
	check(Progression.scaled_spell_dice(wizard, mm) == "1d4+1", "leveled spells do not scale")

	Progression.apply_level_up(cleric, 4)
	Progression.apply_level_up(cleric, 5)
	check(cleric.find_action(&"spell_mass_healing_word") != null and cleric.data.stats.wisdom_mod == 4, "cleric L5: mass healing word, WIS +4")

	# XP sharing and automatic level-ups.
	var f2 := _make_actor("res://data/actors/fighter.tres")
	var w2 := _make_actor("res://data/actors/wizard.tres")
	var party: Array[Actor] = [f2, w2]
	var defeated: Array[Actor] = [hob, gob]
	var reports := Progression.award_encounter(party, defeated)
	check(reports.size() == 2 and reports[0].xp_gained == 375, "750 XP split between two = 375 each")
	check(f2.data.level == 4 and reports[0].leveled() and reports[0].new_level == 4, "375 XP reaches level 4 (200) but not 5 (450)")
	var r2 := Progression.grant_xp(f2, 100)
	check(f2.data.level == 5 and r2.leveled(), "475 XP reaches level 5")
	check(Progression.xp_for_next_level(f2) == 800, "next level needs 800")
	for a in [fighter, rogue, wizard, cleric, hob, gob, f2, w2]:
		a.queue_free()


# --- Movement planning ----------------------------------------------------

func _test_movement_planning() -> void:
	var mover := _make_actor("res://data/actors/fighter.tres")
	var blocker := _make_actor("res://data/actors/goblin_warrior.tres")
	var blocker2 := _make_actor("res://data/actors/wolf.tres")
	_place(mover, 0, 0)
	_place(blocker, 0, -5)
	_place(blocker2, 0, -8)
	var others: Array[Actor] = [blocker, blocker2]
	var path := CombatMovement.plan(mover, Vector3(0, 0, -12), others)
	check(path.size() >= 3, "path around two bodies gets detour points (%d)" % path.size())
	var min_clearance := INF
	for i in range(1, path.size()):
		for b in others:
			min_clearance = minf(min_clearance, _segment_distance(path[i - 1], path[i], b.global_position))
	check(min_clearance >= CombatMovement.CLEARANCE - 0.05, "no path segment crosses a body (min %.2f)" % min_clearance)
	check(path[path.size() - 1].distance_to(Vector3(0, 0, -12)) < 0.1, "destination kept when free")
	# Destination on top of a creature is moved next to it.
	var occupied := CombatMovement.plan(mover, Vector3(0, 0, -5), others)
	var end := occupied[occupied.size() - 1]
	check(end.distance_to(blocker.global_position) >= CombatMovement.CLEARANCE - 0.01, "occupied destination shifted out of the body (%.2f)" % end.distance_to(blocker.global_position))
	# Walking up to an adjacent enemy still ends next to it (no pointless detour).
	var adjacent := CombatMovement.plan(mover, Vector3(0, 0, -3.9), others)
	check(adjacent.size() == 2, "approach to an adjacent spot stays a straight line (%d)" % adjacent.size())
	# Downed creatures don't block.
	blocker.take_damage(999)
	var through := CombatMovement.plan(mover, Vector3(0, 0, -6.5), others)
	check(through.size() == 2, "downed bodies are ignored (%d)" % through.size())
	mover.queue_free()
	blocker.queue_free()
	blocker2.queue_free()


func _segment_distance(a: Vector3, b: Vector3, p: Vector3) -> float:
	a.y = 0.0
	b.y = 0.0
	p.y = 0.0
	var ab := b - a
	var len := ab.length()
	if len < 0.001:
		return a.distance_to(p)
	var t := clampf((p - a).dot(ab) / (len * len), 0.0, 1.0)
	return (a + ab * t).distance_to(p)


# --- Ammunition & rests ---------------------------------------------------

func _test_ammo_and_rests() -> void:
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var wizard := _make_actor("res://data/actors/wizard.tres")
	var archer := _make_actor("res://data/actors/goblin_archer.tres")
	var bow: WeaponData = fighter.data.weapons[1]
	check(bow.uses_ammo and fighter.ammo_left(bow) == 20, "longbow starts with 20 arrows")
	var bow_action := fighter.find_action(&"attack_longbow") as AttackAction
	check(bow_action.is_available(fighter) and "20 arrows" in bow_action.tag_for(fighter), "bow action shows arrows")
	fighter.ammo["arrows"] = 1
	fighter.spend_ammo(bow)
	check(fighter.ammo_left(bow) == 0 and not bow_action.is_available(fighter), "no arrows -> bow unavailable")
	check(bow_action.unavailable_reason(fighter) == "No arrows left", "reason mentions arrows")
	check(fighter.find_action(&"attack_longsword").is_available(fighter), "sword still works")
	check(archer.ammo_left(archer.data.weapons[0]) == 8 and archer.data.weapons.size() == 2, "goblin archer: 8 arrows and a dagger")
	# Slots and features persist through combat starts, come back on rest.
	wizard.spend_spell_slot(1)
	wizard.spend_spell_slot(2)
	fighter.combat_flags["second_wind_used"] = true
	wizard.reset_for_combat()
	fighter.reset_for_combat()
	check(wizard.spell_slots[1] == 3 and wizard.spell_slots[2] == 1, "combat start keeps spent slots")
	check(fighter.combat_flags.get("second_wind_used", false), "combat start keeps used features")
	fighter.current_hp = 5
	var healed := fighter.short_rest()
	check(healed == 16 and fighter.current_hp == 21, "short rest at level 3 heals two hit dice (2 x (6 + CON 2))")
	check(not fighter.combat_flags.has("second_wind_used"), "short rest recharges Second Wind / Action Surge")
	check(fighter.ammo_left(bow) == 10, "short rest recovers half the arrows")
	wizard.short_rest()
	check(wizard.spell_slots[1] == 3, "short rest does not restore spell slots")
	wizard.long_rest()
	check(wizard.spell_slots[1] == 4 and wizard.spell_slots[2] == 2, "long rest restores slots")
	fighter.take_damage(999)
	fighter.short_rest()
	check(fighter.is_alive() and fighter.current_hp == 16, "short rest gets a downed character up")
	fighter.long_rest()
	check(fighter.current_hp == fighter.max_hp() and fighter.ammo_left(bow) == 20, "long rest: full HP and arrows")
	fighter.queue_free()
	wizard.queue_free()
	archer.queue_free()


# --- Enemy scaling --------------------------------------------------------

func _test_enemy_scaling() -> void:
	var gob := _make_actor("res://data/actors/goblin_warrior.tres")
	var hob := _make_actor("res://data/actors/hobgoblin.tres")
	var base_hit := gob.attack_bonus(gob.data.weapons[0])
	var lines := Progression.scale_enemy(gob, 5)
	check(gob.data.level == 5 and gob.max_hp() == 17 and gob.current_hp == 17, "goblin level 5: 12 HP * 1.8 = 17 (%d)" % gob.max_hp())
	check(gob.armor_class() == 14, "goblin level 5: AC 13 + 1 (%d)" % gob.armor_class())
	check(gob.attack_bonus(gob.data.weapons[0]) == base_hit + 2, "goblin level 5: +1 proficiency +1 DEX to hit (%d)" % gob.attack_bonus(gob.data.weapons[0]))
	check(gob.data.xp_value == 100 and lines.size() == 1, "goblin level 5 is worth 100 XP (%d)" % gob.data.xp_value)
	Progression.scale_enemy(gob, 4)
	check(gob.data.level == 4 and gob.max_hp() == 14, "re-scaling starts from the base again: level 4 = 12 * 1.2 = 14 HP (%d)" % gob.max_hp())
	check(gob.armor_class() == 13 and gob.attack_bonus(gob.data.weapons[0]) == base_hit, "one level up changes only HP")
	var same := Progression.scale_enemy(hob, 3)
	check(same.is_empty() and hob.max_hp() == 39, "hobgoblin at its own level is unchanged")
	var f := _make_actor("res://data/actors/fighter.tres")
	var w := _make_actor("res://data/actors/wizard.tres")
	Progression.apply_level_up(w, 4)
	check(Progression.average_level([f, w] as Array[Actor]) == 4, "average level rounds (3, 4 -> 4)")
	gob.queue_free()
	hob.queue_free()
	f.queue_free()
	w.queue_free()


# --- Initiative -----------------------------------------------------------

func _test_initiative() -> void:
	var fighter := _make_actor("res://data/actors/fighter.tres")
	var g1 := _make_actor("res://data/actors/goblin_warrior.tres")
	var g2 := _make_actor("res://data/actors/hobgoblin.tres")
	var actors: Array[Actor] = [fighter, g1, g2]
	var tracker := InitiativeTracker.new()
	tracker.roll_for(actors)
	check(tracker.entries.size() == 3, "three initiative entries")
	for i in range(1, tracker.entries.size()):
		check(tracker.entries[i - 1].total >= tracker.entries[i].total, "sorted descending")
	check(tracker.round_number == 0, "no round before first advance")
	var first := tracker.advance()
	check(first == tracker.entries[0].actor, "first advance = highest initiative")
	check(tracker.round_number == 1, "round 1 started")
	tracker.advance()
	tracker.advance()
	var wrapped := tracker.advance()
	check(wrapped == first and tracker.round_number == 2, "wraps to round 2")
	g1.take_damage(99)
	var seen: Array[Actor] = []
	for _i in 3:
		seen.append(tracker.advance())
	check(not seen.has(g1), "down actor skipped in turn order")
	fighter.queue_free()
	g1.queue_free()
	g2.queue_free()
