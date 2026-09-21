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
	_test_initiative()
	print("\n%d checks, %d failures" % [_checks, _failures])
	get_tree().quit(0 if _failures == 0 else 1)


func check(condition: bool, message: String) -> void:
	_checks += 1
	if not condition:
		_failures += 1
		push_error("FAIL: " + message)
		print("FAIL: " + message)


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
	check(d.describe().begins_with("1d8+3 → ["), "describe: " + d.describe())
	# Deterministic with seed
	Dice.seed_rng(7)
	var a := Dice.roll(3, 6).rolls
	Dice.seed_rng(7)
	var b := Dice.roll(3, 6).rolls
	check(a == b, "seeded rolls are reproducible")


func _test_data_resources() -> void:
	var hero: ActorData = load("res://data/actors/hero.tres")
	check(hero != null, "hero.tres loads")
	if hero == null:
		return
	check(hero.faction == ActorData.Faction.PLAYER, "hero is player faction")
	check(hero.stats.max_hp == 20 and hero.stats.armor_class == 15, "hero stats")
	check(hero.weapons.size() == 2, "hero has two weapons (%d)" % hero.weapons.size())
	if hero.weapons.size() == 2:
		check(hero.weapons[0] is WeaponData, "weapon typed as WeaponData")
		check(hero.weapons[0].display_name == "Longsword", "first weapon longsword")
		check(hero.weapons[1].is_ranged and hero.weapons[1].range_m == 24.0, "longbow ranged 24m")
	var gob: ActorData = load("res://data/actors/goblin_warrior.tres")
	check(gob != null and gob.faction == ActorData.Faction.ENEMY, "goblin loads as enemy")
	check(gob.weapons.size() == 1 and gob.weapons[0].damage_dice == "1d6", "goblin scimitar")


func _make_actor(path: String) -> Actor:
	var actor := Actor.new()
	actor.data = load(path)
	actor.initialize_runtime()
	return actor


func _test_turn_state() -> void:
	var ts := TurnState.new()
	ts.begin_turn(9.0)
	check(ts.action_available and ts.bonus_action_available, "fresh turn has action + bonus")
	check(ts.movement_remaining == 9.0, "movement = speed")
	check(ts.spend(CombatAction.Cost.ACTION), "spend action")
	check(not ts.spend(CombatAction.Cost.ACTION), "cannot spend action twice")
	check(ts.spend(CombatAction.Cost.BONUS_ACTION), "spend bonus action")
	check(ts.spend(CombatAction.Cost.FREE), "free always ok")
	ts.spend_movement(4.5)
	check(is_equal_approx(ts.movement_remaining, 4.5), "movement decreases")
	ts.spend_movement(100.0)
	check(ts.movement_remaining == 0.0, "movement clamps at 0")


func _test_attack_resolver() -> void:
	var hero := _make_actor("res://data/actors/hero.tres")
	var gob := _make_actor("res://data/actors/goblin_warrior.tres")
	var sword: WeaponData = hero.data.weapons[0]
	var bow: WeaponData = hero.data.weapons[1]
	check(hero.attack_bonus(sword) == 5, "sword attack bonus +5 (got %d)" % hero.attack_bonus(sword))
	check(hero.damage_bonus(sword) == 3, "sword damage bonus +3")
	check(hero.attack_bonus(bow) == 4, "bow attack bonus +4")
	check(hero.damage_bonus(bow) == 2, "bow damage bonus +2")
	check(gob.attack_bonus(gob.data.weapons[0]) == 4, "goblin scimitar +4")

	var hits := 0
	var crits := 0
	var total := 0
	for _i in 500:
		var r := AttackResolver.resolve(hero, sword, gob)
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
		total += 1
	# vs AC 13 with +5: hits on 8+ → 65 %. Loose sanity bounds.
	check(hits > 250 and hits < 400, "hit rate plausible (%d/500)" % hits)
	check(crits > 5, "some crits happened (%d)" % crits)

	# HP / down state
	check(gob.current_hp == 12, "goblin starts at max hp")
	gob.take_damage(5)
	check(gob.current_hp == 7, "damage reduces hp")
	gob.heal(3)
	check(gob.current_hp == 10, "heal adds hp")
	gob.heal(100)
	check(gob.current_hp == 12, "heal clamps to max")
	gob.take_damage(50)
	check(gob.current_hp == 0 and gob.is_down, "lethal damage → down")
	check(not gob.is_alive(), "down actor is not alive")
	hero.free()
	gob.free()


func _test_initiative() -> void:
	var hero := _make_actor("res://data/actors/hero.tres")
	var g1 := _make_actor("res://data/actors/goblin_warrior.tres")
	var g2 := _make_actor("res://data/actors/goblin_brute.tres")
	var actors: Array[Actor] = [hero, g1, g2]
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
	# Down actors are skipped
	g1.take_damage(99)
	var seen: Array[Actor] = []
	for _i in 3:
		seen.append(tracker.advance())
	check(not seen.has(g1), "down actor skipped in turn order")
	hero.free()
	g1.free()
	g2.free()
