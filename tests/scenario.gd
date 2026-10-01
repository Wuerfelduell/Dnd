## Scripted combat scenarios inside the real scene (physics, navmesh, manager).
##
## Run with:  godot --headless --path . -- --scenario
## Covers: opportunity attacks (and Disengage avoiding them), Hold Person with
## paralysis / turn skip / repeat save / auto-crit, concentration breaking,
## reviving a downed ally with Healing Word.
extends Node

var world: World
var combat: CombatManager
var _failed := false
var _time := 0.0
var _oa_count := 0


func _ready() -> void:
	world = get_parent()
	combat = world.combat
	GameState.pacing = 0.0
	Dice.seed_rng(99)
	EventBus.log_message.connect(func(t): print("[log] " + _strip(t)))
	EventBus.opportunity_attack.connect(func(_r, _m): _oa_count += 1)
	# No surprises: enemies don't spot anyone, followers stay put.
	for e in world.enemies():
		e.get_node("Perception").set_physics_process(false)
		e.get_node("Perception").set_deferred("monitoring", false)
	for p in world.party():
		var follower := p.get_node_or_null("PartyFollower")
		if follower:
			follower.set_physics_process(false)
	_run()


func _process(delta: float) -> void:
	_time += delta
	if _time > 120.0 and not _failed:
		fail("timeout")


func fail(message: String) -> void:
	_failed = true
	push_error("[scenario] FAIL: " + message)
	print("[scenario] FAIL: " + message)
	get_tree().quit(1)


func expect(condition: bool, message: String) -> void:
	if not condition:
		fail(message)


func _actor(path: String) -> Actor:
	return world.get_node(path)


func _place(actor: Actor, x: float, z: float) -> void:
	actor.global_position = Vector3(x, 0, z)


func _wait_turn(actor: Actor) -> void:
	# Let other combatants act until it is this actor's turn; other party
	# members (waiting for a human) simply pass.
	var frames := 0
	while combat.is_active and (combat.active_actor != actor or combat.is_busy()) and frames < 5000:
		if combat.is_player_turn() and combat.active_actor != actor:
			combat.end_turn()
		await get_tree().physics_frame
		frames += 1
	expect(combat.is_active and combat.active_actor == actor, "waited for %s's turn" % actor.display_name())


func _end() -> void:
	combat.abort_combat()
	await get_tree().physics_frame
	await get_tree().physics_frame


func _run() -> void:
	await get_tree().physics_frame
	await get_tree().physics_frame
	await _scenario_opportunity_attack()
	await _scenario_disengage()
	await _scenario_hold_person()
	await _scenario_revive()
	await _scenario_fireball()
	await _scenario_walk_around()
	await _scenario_terrain_cover_and_shadows()
	await _scenario_tavern_and_cave()
	if not _failed:
		print("[scenario] SUCCESS after %.1f s" % _time)
		get_tree().quit(0)


func _scenario_opportunity_attack() -> void:
	print("[scenario] --- opportunity attack ---")
	var fighter := _actor("Party/Fighter")
	var gob := _actor("Enemies/GoblinWarrior")
	_place(fighter, 0, 0)
	_place(gob, 0, -1.0)
	var start_hp := fighter.current_hp
	combat.start_combat([fighter, gob] as Array[Actor])
	await _wait_turn(fighter)
	_oa_count = 0
	await combat.move_actor(fighter, Vector3(0, 0, 6))
	expect(_oa_count == 1, "leaving the goblin's reach provoked exactly one opportunity attack (%d)" % _oa_count)
	expect(not gob.turn_state.reaction_available, "goblin spent its reaction")
	expect(fighter.global_position.z > 4.0, "fighter kept walking after the opportunity attack (%s)" % fighter.global_position)
	expect(fighter.turn_state.movement_remaining < 9.0, "movement was spent")
	print("[scenario] fighter HP %d -> %d" % [start_hp, fighter.current_hp])
	# Walking back in and out again: the goblin has no reaction left.
	_oa_count = 0
	await combat.move_actor(fighter, Vector3(0, 0, 0.2))
	await combat.move_actor(fighter, Vector3(0, 0, 3))
	expect(_oa_count == 0, "no second opportunity attack without a reaction")
	await _end()
	fighter.current_hp = fighter.max_hp()


func _scenario_disengage() -> void:
	print("[scenario] --- disengage ---")
	var rogue := _actor("Party/Rogue")
	var gob := _actor("Enemies/GoblinWarrior2")
	_place(rogue, 5, 0)
	_place(gob, 5, -1.0)
	combat.start_combat([rogue, gob] as Array[Actor])
	await _wait_turn(rogue)
	_oa_count = 0
	var ok: bool = await combat.perform_action(rogue, rogue.find_action(&"disengage_bonus"), null)
	expect(ok and rogue.has_status(&"disengaging"), "cunning disengage applied")
	expect(rogue.turn_state.action_available and not rogue.turn_state.bonus_action_available, "disengage used the bonus action only")
	await combat.move_actor(rogue, Vector3(5, 0, 6))
	expect(_oa_count == 0, "disengage prevented the opportunity attack")
	combat.end_turn()
	await get_tree().physics_frame
	expect(not rogue.has_status(&"disengaging"), "disengaging ends with the turn")
	await _end()


func _scenario_hold_person() -> void:
	print("[scenario] --- hold person ---")
	var cleric := _actor("Party/Cleric")
	var hob := _actor("Enemies/Hobgoblin")
	_place(cleric, -5, 0)
	_place(hob, -5, -1.0)
	# Force the outcome: the hobgoblin cannot pass, the cleric cannot keep concentrating when hit.
	hob.data = hob.data.duplicate(true)
	hob.data.stats.wisdom_mod = -30
	cleric.data = cleric.data.duplicate(true)
	cleric.data.stats.constitution_mod = -30
	combat.start_combat([cleric, hob] as Array[Actor])
	await _wait_turn(cleric)
	var hold := cleric.find_action(&"spell_hold_person")
	var slots_before := cleric.spell_slots[2]
	var ok: bool = await combat.perform_action(cleric, hold, hob)
	expect(ok, "hold person cast")
	expect(cleric.spell_slots[2] == slots_before - 1, "level 2 slot spent")
	expect(hob.has_status(&"paralyzed") and hob.is_incapacitated(), "hobgoblin paralyzed")
	expect(cleric.concentration_spell == hold.spell, "cleric concentrates on hold person")
	var hob_hp := hob.current_hp
	var cleric_hp := cleric.current_hp
	var mace := cleric.find_action(&"attack_mace")
	expect(not mace.is_available(cleric), "action already spent this turn")
	combat.end_turn()
	# Hobgoblin's turn is skipped, its repeat save fails, back to the cleric.
	await _wait_turn(cleric)
	expect(hob.has_status(&"paralyzed"), "hobgoblin still paralyzed after failing the repeat save")
	expect(hob.current_hp == hob_hp and cleric.current_hp == cleric_hp, "paralyzed hobgoblin did nothing")
	var swings := 0
	var crit_seen := false
	while swings < 6 and not crit_seen:
		swings += 1
		var r: AttackResult = await AttackAction.perform_attack(cleric, hob, cleric.data.weapons[0], "attacks")
		crit_seen = r.critical
		if r.fumble:
			continue
		expect(r.critical, "melee hit against a paralyzed target is a critical hit")
		break
	# Damage breaks concentration (CON save cannot succeed) and frees the hobgoblin.
	cleric.take_damage(4)
	expect(cleric.concentration_spell == null, "failed concentration save ends hold person")
	expect(not hob.has_status(&"paralyzed"), "hobgoblin freed when concentration broke")
	await _end()
	hob.current_hp = hob.max_hp()
	cleric.current_hp = cleric.max_hp()


func _scenario_revive() -> void:
	print("[scenario] --- healing word revives ---")
	var cleric := _actor("Party/Cleric")
	var wizard := _actor("Party/Wizard")
	var gob := _actor("Enemies/GoblinArcher")
	_place(cleric, 8, 0)
	_place(wizard, 10, 0)
	_place(gob, 8, -9)
	combat.start_combat([cleric, wizard, gob] as Array[Actor])
	wizard.take_damage(999)
	expect(wizard.is_down, "wizard is down")
	await _wait_turn(cleric)
	var word := cleric.find_action(&"spell_healing_word")
	expect(word.can_target(cleric, wizard), "healing word can target a downed ally")
	var ok: bool = await combat.perform_action(cleric, word, wizard)
	expect(ok and wizard.is_alive() and wizard.current_hp >= 4, "healing word revives the wizard (HP %d)" % wizard.current_hp)
	expect(not cleric.turn_state.bonus_action_available and cleric.turn_state.action_available, "healing word was a bonus action")
	await _end()
	wizard.current_hp = wizard.max_hp()


func _scenario_fireball() -> void:
	print("[scenario] --- fireball at a point ---")
	var wizard := _actor("Party/Wizard")
	var fighter := _actor("Party/Fighter")
	var g1 := _actor("Enemies/GoblinWarrior")
	var g2 := _actor("Enemies/Hobgoblin")  # 39 HP: survives the fireball so combat goes on
	for a in [wizard, fighter, g1, g2]:
		a.restore_full(a.global_position)
	_place(wizard, 0, 10)
	_place(fighter, 0, 8)
	_place(g1, 0, -2)
	_place(g2, 3, -3)
	Progression.apply_level_up(wizard, 4)
	Progression.apply_level_up(wizard, 5)
	combat.start_combat([wizard, fighter, g1, g2] as Array[Actor])
	await _wait_turn(wizard)
	var fireball := wizard.find_action(&"spell_fireball")
	expect(fireball != null and fireball.is_available(wizard), "wizard can cast fireball")
	var g1_hp := g1.current_hp
	var g2_hp := g2.current_hp
	var f_hp := fighter.current_hp
	var far: bool = await combat.perform_action(wizard, fireball, null, Vector3(0, 0, -60))
	expect(not far, "fireball refused out of range")
	var ok: bool = await combat.perform_action(wizard, fireball, null, Vector3(1.5, 0, -2.5))
	expect(ok, "fireball cast at a point")
	expect(wizard.spell_slots[3] == 1, "level 3 slot spent")
	expect(g1.current_hp < g1_hp and g2.current_hp < g2_hp, "both goblins took fire damage (%d->%d, %d->%d)" % [g1_hp, g1.current_hp, g2_hp, g2.current_hp])
	expect(fighter.current_hp == f_hp, "fighter outside the 6 m area is unharmed")
	# Misty Step teleports without provoking.
	_place(g1, 0, 11)
	g1.restore_full(g1.global_position)
	var step := wizard.find_action(&"spell_misty_step")
	var before := wizard.global_position
	_oa_count = 0
	var ok2: bool = await combat.perform_action(wizard, step, null, Vector3(6, 0, 10))
	expect(ok2 and wizard.global_position.distance_to(before) > 4.0, "misty step moved the wizard (%s -> %s)" % [before, wizard.global_position])
	expect(_oa_count == 0, "teleporting did not provoke an opportunity attack")
	expect(not wizard.turn_state.bonus_action_available, "misty step used the bonus action")
	await _end()


func _scenario_walk_around() -> void:
	print("[scenario] --- walking around bodies ---")
	var fighter := _actor("Party/Fighter")
	var rogue := _actor("Party/Rogue")
	var cleric := _actor("Party/Cleric")
	var gob := _actor("Enemies/GoblinArcher2")
	for a in [fighter, rogue, cleric, gob]:
		a.restore_full(a.global_position)
	# Two allies stand in a line between the fighter and the goblin.
	_place(fighter, -12, 8)
	_place(rogue, -12, 5)
	_place(cleric, -12, 2)
	_place(gob, -12, -6)
	combat.start_combat([fighter, rogue, cleric, gob] as Array[Actor])
	await _wait_turn(fighter)
	var before := fighter.global_position
	var ok: bool = await combat.move_actor(fighter, Vector3(-12, 0, -1))
	expect(ok, "move accepted")
	var travelled := before.distance_to(fighter.global_position)
	expect(fighter.global_position.z < 1.0, "fighter got past both allies (%s)" % fighter.global_position)
	expect(travelled > 7.0, "fighter walked a long way (%.2f m)" % travelled)
	expect(fighter.last_move_distance > 8.9 and fighter.last_move_distance < 9.1, "the whole movement budget was used on the detour (%.2f)" % fighter.last_move_distance)
	for ally in [rogue, cleric]:
		expect(fighter.center_distance_to(ally) > 0.7, "did not end up inside %s" % ally.display_name())
	await _end()


static func _strip(text: String) -> String:
	var regex := RegEx.new()
	regex.compile("\\[/?[a-z]+(=[^\\]]*)?\\]")
	return regex.sub(text, "", true)


func _scenario_terrain_cover_and_shadows() -> void:
	print("[scenario] --- terrain, cover, line of sight, shadows ---")
	var fighter := _actor("Party/Fighter")
	var wizard := _actor("Party/Wizard")
	var gob := _actor("Enemies/GoblinWarrior")
	var archer := _actor("Enemies/GoblinArcher")
	# Heights come from the generated terrain.
	expect(absf(Terrain.ground_height(world, Vector3(9, 0, -16)) - 2.0) < 0.1, "archer ledge is 2 m high (%.2f)" % Terrain.ground_height(world, Vector3(9, 0, -16)))
	expect(absf(Terrain.ground_height(world, Vector3(0, 0, 0))) < 0.05, "arena centre is flat")
	expect(absf(Terrain.ground_height(world, Vector3(4, 0, -14)) - 1.1) < 0.25, "ledge stairs are half way up in the middle (%.2f)" % Terrain.ground_height(world, Vector3(4, 0, -14)))
	var spawn: Transform3D = world._spawn_transforms[archer]
	expect(absf(spawn.origin.y - 2.0) < 0.05, "the archer spawns on the ledge (%s)" % spawn.origin)
	archer.global_position = spawn.origin

	# High ground: the archer on the ledge shoots down at +2, the fighter shoots up at -2.
	# Standing well clear of the cliff foot; right below the edge the ledge itself would hide the lower body.
	fighter.global_position = Vector3(8, 0, -6)
	var down := CombatSituation.assess(archer, fighter)
	expect(down.elevation_bonus() == 2 and down.cover == Visibility.Cover.NONE, "archer on the ledge has high ground (+2), no cover (%.2f m, %d)" % [down.elevation_m, down.cover])
	var up := CombatSituation.assess(fighter, archer)
	expect(up.elevation_bonus() == -2, "shooting up at the ledge is -2")
	expect(fighter.find_action(&"attack_longbow").can_target(fighter, archer), "the archer on the ledge is visible from below")

	# Half cover behind a crate (1 m high): some rays blocked, target still attackable.
	fighter.global_position = Vector3(-4, 0, -3.5)
	gob.global_position = Vector3(-4, 0, -8.5)
	var crate := CombatSituation.assess(fighter, gob)
	expect(crate.cover == Visibility.Cover.HALF, "goblin behind the crate has half cover (%d blocked -> %d)" % [Visibility.blocked_count(Visibility.eye_position(fighter), gob), crate.cover])
	expect(fighter.find_action(&"attack_longbow").can_target(fighter, gob), "half cover does not block the shot")
	var open := CombatSituation.assess(fighter, archer)
	expect(open.cover != Visibility.Cover.FULL, "nothing between the fighter and the archer")
	# Full cover behind a pillar: no line of sight, the action refuses the target.
	fighter.global_position = Vector3(-5, 0, -9)
	gob.global_position = Vector3(-5, 0, -17)
	expect(not Visibility.has_line_of_sight(fighter, gob), "pillar gives full cover")
	expect(not fighter.find_action(&"attack_longbow").can_target(fighter, gob), "no line of sight: cannot shoot")
	expect(not wizard.find_action(&"spell_fire_bolt").can_target(fighter, gob), "no line of sight: cannot cast either")
	# Point spells need a visible point of origin.
	wizard.global_position = Vector3(-4, 0, -3.5)
	var fireball := wizard.find_action(&"spell_fireball") as SpellAction
	expect(Visibility.point_visible(wizard, Vector3(-4, 0, -12)), "a spot beyond the crate is visible")
	expect(not Visibility.point_visible(wizard, Vector3(-4, 0, -7.4)), "the ground right behind the crate is hidden")
	if fireball != null:
		expect(fireball.can_target_point(wizard, Vector3(-4, 0, -12)) and not fireball.can_target_point(wizard, Vector3(-4, 0, -7.4)), "fireball respects the visible spot")

	# Shadows: lit at the camp torches, dark in the middle; dark creatures are noticed only up close.
	fighter.global_position = Vector3(0, 0, 12)
	expect(Lighting.is_lit(fighter), "camp is lit by its torches")
	fighter.global_position = Vector3(0, 0, 2)
	expect(Lighting.is_in_shadow(fighter), "the middle of the arena is dark")
	gob.global_position = Vector3(0, 0, -4)
	var perception: EnemyPerception = gob.get_node("Perception")
	expect(not perception.can_notice(fighter), "6 m away in the dark: not noticed")
	fighter.global_position = Vector3(0, 0, -1)
	expect(perception.can_notice(fighter), "3 m away in the dark: noticed")
	fighter.global_position = Vector3(0, 0, -8)
	expect(Lighting.is_lit(fighter), "the campfire lights the goblin camp")
	expect(perception.can_notice(fighter), "lit and 4 m away: noticed")
	gob.global_position = Vector3(-5, 0, -17)
	fighter.global_position = Vector3(-5, 0, -9)
	expect(not perception.can_notice(fighter), "no line of sight through the pillar: not noticed")

	# Walking up the stairs in combat: the fighter ends on the ledge.
	fighter.global_position = Vector3(-1, 0, -14)
	gob.global_position = Vector3(-8, 0, -9)
	combat.start_combat([fighter, archer] as Array[Actor])
	await _wait_turn(fighter)
	var ok: bool = await combat.move_actor(fighter, Vector3(7.5, 2, -14))
	expect(ok, "move onto the ledge accepted")
	expect(fighter.global_position.y > 1.8 and fighter.global_position.x > 6.2, "fighter climbed the stairs onto the ledge (%s)" % fighter.global_position)
	expect(fighter.turn_state.movement_remaining < 2.0, "the climb cost movement (%.1f left)" % fighter.turn_state.movement_remaining)
	var level := CombatSituation.assess(fighter, archer)
	expect(level.elevation_bonus() == 0, "same level on the ledge: no height bonus")
	await _end()
	fighter.global_position = Vector3(0, 0, 12)


func _scenario_tavern_and_cave() -> void:
	print("[scenario] --- tavern folk and the cave encounter ---")
	var fighter := _actor("Party/Fighter")
	var map := world.get_world_3d().navigation_map
	# The navmesh connects camp, tavern hall and cave.
	var to_tavern := CombatMovement.find_path(map, Vector3(0, 0, 12), Vector3(0, 0, 30))
	expect(to_tavern.size() > 2 and to_tavern[to_tavern.size() - 1].distance_to(Vector3(0, 0, 30)) < 1.0 and CombatMovement.path_length(to_tavern) < 30.0, "path from the camp into the tavern (%.1f m)" % CombatMovement.path_length(to_tavern))
	var to_cave := CombatMovement.find_path(map, Vector3(0, 0, 12), Vector3(-10, 0, -30))
	expect(to_cave.size() > 2 and to_cave[to_cave.size() - 1].distance_to(Vector3(-10, 0, -30)) < 1.0 and CombatMovement.path_length(to_cave) < 60.0, "path from the camp into the cave (%.1f m)" % CombatMovement.path_length(to_cave))
	# Tavern folk: neutral, lit, labelled by name, never part of a fight.
	expect(world.npcs().size() == 6, "six tavern folk (%d)" % world.npcs().size())
	var innkeeper: Actor = world.get_node("Npcs/Innkeeper")
	expect(innkeeper.is_neutral() and not fighter.is_hostile_to(innkeeper) and not innkeeper.is_hostile_to(fighter), "the innkeeper is nobody's enemy")
	var gob := _actor("Enemies/GoblinWarrior")
	expect(not gob.is_hostile_to(innkeeper) and not Targeting.living_hostiles(gob, [fighter, innkeeper] as Array[Actor]).has(innkeeper), "goblins ignore the innkeeper")
	expect(innkeeper.visual.uses_model() and innkeeper.visual.animator().current_action == "idle", "the innkeeper stands around with his model")
	var bard: Actor = world.get_node("Npcs/Bard")
	expect(bard.visual.animator().current_action == "cheer" and bard.global_position.y > 0.4, "the bard performs on the stage")
	expect(Lighting.is_lit(innkeeper) and Lighting.is_lit(bard), "the tavern is lit by hearth and chandelier")
	expect(innkeeper.name_label.text == "Innkeeper", "NPC labels show the name only (%s)" % innkeeper.name_label.text)
	expect(not fighter.find_action(&"attack_longsword").can_target(fighter, innkeeper), "you cannot attack tavern folk")
	# A fight next to the tavern: the folk stay out of it.
	_place(fighter, 0, 22)
	_place(gob, 2, 22)
	combat.start_combat([fighter, gob] as Array[Actor])
	await _wait_turn(fighter)
	expect(not combat.participants.has(innkeeper) and not combat.participants.has(world.get_node("Npcs/TownGuard")), "tavern folk are not combatants")
	await _end()
	_place(gob, -2, -9)
	# The cave: dark, its own group; walking in wakes the cave dwellers but not the goblins.
	expect(world.cave_enemies().size() == 7, "seven cave dwellers (%d)" % world.cave_enemies().size())
	var spider: Actor = world.get_node("CaveEnemies/CaveSpider1")
	var golem: Actor = world.get_node("CaveEnemies/CaveGolem")
	expect(Lighting.is_in_shadow(spider) and golem.data.display_name == "Stone Golem", "the cave is dark and guarded")
	var perception: EnemyPerception = spider.get_node("Perception")
	perception.set_physics_process(true)
	perception.monitoring = true
	for p in world.party():
		p.global_position = Vector3(-10, 0, -21) + Vector3(0.6 * (p.get_index() - 1), 0, 0.8 * p.get_index())
	fighter.global_position = Vector3(-12, 0, -22)
	expect(not perception.can_notice(fighter), "5 m away in the dark: the spider has not noticed the fighter")
	fighter.global_position = Vector3(-13, 0, -23.5)
	var frames := 0
	while GameState.is_exploring() and frames < 300:
		await get_tree().physics_frame
		frames += 1
	expect(GameState.is_in_combat(), "walking up to the spider in the dark starts the cave encounter")
	if GameState.is_in_combat():
		var cave_count := 0
		var arena_count := 0
		for a in combat.participants:
			if world.cave_enemies().has(a):
				cave_count += 1
			elif world.arena_enemies().has(a):
				arena_count += 1
		expect(cave_count == 7 and arena_count == 0, "all seven cave dwellers join, no goblin does (%d / %d)" % [cave_count, arena_count])
		expect(combat.participants.has(golem), "the golem guards the treasure")
	await _end()
	perception.set_physics_process(false)
	perception.set_deferred("monitoring", false)
	for p in world.party():
		p.global_position = Vector3(0, 0, 12)

