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
	# Let other combatants act until it is this actor's turn.
	var frames := 0
	while combat.is_active and (combat.active_actor != actor or combat.is_busy()) and frames < 5000:
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
	_place(gob, 8, -12)
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


static func _strip(text: String) -> String:
	var regex := RegEx.new()
	regex.compile("\\[/?[a-z]+(=[^\\]]*)?\\]")
	return regex.sub(text, "", true)
