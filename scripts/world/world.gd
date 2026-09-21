## Root of the test level: wires world, party, enemies, combat manager, camera and HUD.
##
## Contains no rules. It decides *when* combat starts (an enemy spotted a party
## member), *who* participates (the whole party + enemies near the spotter),
## hands out experience after a victory and respawns the enemies for the next wave.
class_name World
extends Node3D

signal wave_started(number: int)

## Enemies within this distance of the one who spotted the party join the fight.
@export var encounter_radius: float = 16.0

@onready var nav_region: NavigationRegion3D = $NavigationRegion3D
@onready var leader: Actor = $Party/Fighter
@onready var combat: CombatManager = $CombatManager
@onready var camera_rig: CameraRig = $CameraRig
@onready var combat_input: PlayerCombatInput = $PlayerCombatInput
@onready var movement_indicator: MeshInstance3D = $MovementIndicator
@onready var hud: CombatHud = $CombatHud

var preview: TargetingPreview
var wave: int = 1
var last_reports: Array[Progression.Report] = []

var _spawn_transforms: Dictionary = {}  # Actor -> Transform3D

## Kept for tests / scripts that talk about "the player".
var player: Actor:
	get:
		return leader


func _ready() -> void:
	_bake_navmesh()
	preview = TargetingPreview.new()
	preview.name = "TargetingPreview"
	add_child(preview)
	camera_rig.set_follow_target(leader)
	combat_input.setup(combat, camera_rig.camera)
	hud.setup(combat, combat_input, leader, camera_rig)
	hud.restart_requested.connect(restart)
	hud.auto_battle_toggled.connect(set_auto_battle)
	hud.rest_requested.connect(rest_and_next_wave)
	combat_input.lock_changed.connect(_update_preview)
	combat_input.selected_action_changed.connect(func(_a): _update_preview())

	for a in actors():
		_spawn_transforms[a] = a.global_transform

	EventBus.enemy_spotted.connect(_on_enemy_spotted)
	combat.turn_started.connect(_on_turn_started)
	combat.turn_ended.connect(_on_turn_ended)
	combat.state_updated.connect(_update_movement_indicator)
	combat.combat_ended.connect(_on_combat_ended)
	EventBus.floating_text_requested.connect(func(pos, text, color): FloatingText.spawn(self, pos, text, color))
	movement_indicator.visible = false

	EventBus.log("Your party: %s." % ", ".join(_party_names()))
	EventBus.log("Goblins, wolves and a hobgoblin captain lurk to the north. Combat starts when one of them notices you.")

	# Headless integration test hooks (godot --headless -- --autoplay / --scenario).
	for flag in ["--autoplay", "--scenario"]:
		if OS.get_cmdline_user_args().has(flag):
			var script: GDScript = load("res://tests/%s.gd" % flag.trim_prefix("--"))
			if script != null:
				var node: Node = script.new()
				node.name = flag.trim_prefix("--").capitalize()
				add_child(node)


func _bake_navmesh() -> void:
	# Runtime bake from the static colliders in the scene (placeholder level).
	nav_region.bake_navigation_mesh(false)


func actors() -> Array[Actor]:
	var out: Array[Actor] = []
	for n in get_tree().get_nodes_in_group("actors"):
		if n is Actor:
			out.append(n)
	return out


func party() -> Array[Actor]:
	var out: Array[Actor] = []
	for a in actors():
		if a.is_player():
			out.append(a)
	return out


func enemies() -> Array[Actor]:
	var out: Array[Actor] = []
	for a in actors():
		if not a.is_player():
			out.append(a)
	return out


func living_enemies() -> int:
	var n := 0
	for e in enemies():
		if e.is_alive():
			n += 1
	return n


func _party_names() -> PackedStringArray:
	var names := PackedStringArray()
	for p in party():
		names.append("%s the %s" % [p.display_name(), p.data.class_name_text])
	return names


func _on_enemy_spotted(enemy: Actor) -> void:
	if not GameState.is_exploring() or combat.is_active:
		return
	var participants: Array[Actor] = []
	for p in party():
		if p.is_alive():
			participants.append(p)
	for e in enemies():
		if e.is_alive() and e.center_distance_to(enemy) <= encounter_radius:
			participants.append(e)
	EventBus.log("[b]%s[/b] spotted the party!" % enemy.display_name())
	hud.set_rest_available(false)
	combat.start_combat(participants)


func set_auto_battle(enabled: bool) -> void:
	combat.party_ai = PartyAI.new() if enabled else null
	EventBus.log("[color=gray]Auto-battle %s.[/color]" % ("on" if enabled else "off"))
	combat_input.cancel()
	# If it is currently a party member's turn, let the AI take over right away.
	if enabled and combat.is_active and combat.active_actor != null and combat.active_actor.is_player() \
			and not combat.is_busy():
		combat.call_deferred("_run_ai_turn", combat.active_actor, combat.party_ai)


## Heals the party, refreshes slots and puts every enemy back at its spawn.
func rest_and_next_wave() -> void:
	if combat.is_active or not GameState.is_exploring():
		return
	wave += 1
	for p in party():
		p.restore_full(p.global_position)
	for e in enemies():
		var t: Transform3D = _spawn_transforms.get(e, e.global_transform)
		e.restore_full(t.origin)
		e.global_transform = t
		var perception := e.get_node_or_null("Perception")
		if perception:
			perception.set_deferred("monitoring", true)
	hud.set_rest_available(false)
	EventBus.log("[color=yellow][b]The party rests. Wave %d approaches![/b][/color]" % wave)
	wave_started.emit(wave)


func _on_turn_started(actor: Actor) -> void:
	camera_rig.set_follow_target(actor)
	for a in actors():
		if a.visual:
			a.visual.set_active(a == actor)
	_update_movement_indicator()


func _on_turn_ended(actor: Actor) -> void:
	if actor.visual:
		actor.visual.set_active(false)
	movement_indicator.visible = false
	preview.clear()


func _on_combat_ended(victory: bool) -> void:
	camera_rig.set_follow_target(leader)
	for a in actors():
		if a.visual:
			a.visual.set_active(false)
			a.visual.set_targetable(false)
	movement_indicator.visible = false
	preview.clear()
	if not victory:
		return
	# Downed party members are stabilised after the fight (no death saves yet).
	for p in party():
		if p.is_down:
			p.heal(1)
			EventBus.log("%s gets back up with 1 HP." % p.display_name())
	# Experience for the defeated enemies of this encounter.
	var defeated: Array[Actor] = []
	for a in combat.participants:
		if not a.is_player() and not a.is_alive():
			defeated.append(a)
	last_reports = Progression.award_encounter(party(), defeated)
	for r in last_reports:
		var line := "%s gains %d XP" % [r.actor.display_name(), r.xp_gained]
		if r.leveled():
			line += " and reaches [b]level %d[/b]: %s" % [r.new_level, ", ".join(r.lines)]
		EventBus.log("[color=yellow]%s[/color]" % line)
	hud.show_level_ups(last_reports)
	hud.set_rest_available(living_enemies() == 0)


func _update_preview() -> void:
	if preview == null:
		return
	var actor := combat.active_actor
	if actor == null or not combat_input.has_lock():
		preview.clear()
		return
	match combat_input.lock_kind:
		PlayerCombatInput.LockKind.MOVE:
			preview.show_path(combat_input.locked_path, not combat_input.locked_provokers.is_empty())
		PlayerCombatInput.LockKind.POINT:
			var radius := 0.6
			var hits_ally := false
			var sel := combat_input.selected_action
			if sel is SpellAction:
				radius = maxf(0.6, sel.spell.area_radius_m)
				for t in combat_input.locked_area_targets:
					if not actor.is_hostile_to(t):
						hits_ally = true
			preview.show_area(combat_input.locked_point, radius, hits_ally)
		_:
			preview.clear()


func _update_movement_indicator() -> void:
	var actor := combat.active_actor
	if not combat.is_active or actor == null or not actor.is_player():
		movement_indicator.visible = false
		return
	var radius := actor.turn_state.movement_remaining
	movement_indicator.visible = radius > 0.05
	movement_indicator.global_position = Vector3(actor.global_position.x, 0.03, actor.global_position.z)
	movement_indicator.scale = Vector3(radius, 1.0, radius)


func restart() -> void:
	if not GameState.is_game_over():
		return
	GameState.set_state(GameState.State.EXPLORATION)
	get_tree().reload_current_scene()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("restart"):
		restart()
