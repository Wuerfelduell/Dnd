## Root of the test level: wires world, party, enemies, combat manager, camera and HUD.
##
## Contains no rules. It decides *when* combat starts (an enemy spotted a party
## member), *who* participates (the whole party + enemies near the spotter),
## hands out experience after a victory and respawns the enemies for the next wave.
class_name World
extends Node3D

signal wave_started(number: int)

const ENEMY_SCENE := preload("res://scenes/actors/enemy.tscn")
const REINFORCEMENT_DATA := preload("res://data/actors/goblin_warrior.tres")
## A long rest is offered after every N-th wave.
const LONG_REST_EVERY := 3
const MAX_REINFORCEMENTS := 4
## Creatures from the cave and the ruins that join from a given wave on (and
## stay for every later wave, rescaled). Waves beyond the table repeat the
## last entry's roster plus the goblin reinforcements.
const WAVE_ARRIVALS := {
	2: ["res://data/actors/cave_bat.tres"],
	3: ["res://data/actors/cave_spider.tres", "res://data/actors/crystal_slime.tres"],
	4: ["res://data/actors/cave_spider.tres", "res://data/actors/mushroom_shaman.tres", "res://data/actors/bandit.tres"],
	5: ["res://data/actors/ruin_wraith.tres", "res://data/actors/bandit.tres"],
	6: ["res://data/actors/stone_golem.tres"],
}
## Where newcomers appear: in front of the cave mouth in the north-west.
const CAVE_MOUTH := Vector3(-10.0, 0.0, -17.0)

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
	# Height levels, cover walls and torches are generated, then baked into the navmesh.
	var lights := Node3D.new()
	lights.name = "Lights"
	add_child(lights)
	TerrainBuilder.build(nav_region, lights)
	_bake_navmesh()
	preview = TargetingPreview.new()
	preview.name = "TargetingPreview"
	add_child(preview)
	camera_rig.set_follow_target(leader)
	combat_input.setup(combat, camera_rig.camera)
	hud.setup(combat, combat_input, leader, camera_rig)
	hud.restart_requested.connect(restart)
	hud.auto_battle_toggled.connect(set_auto_battle)
	hud.next_wave_requested.connect(next_wave)
	hud.long_rest_requested.connect(long_rest)
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
	EventBus.log("Goblins, wolves and a hobgoblin captain camp to the north. Combat starts when one of them notices you.")
	EventBus.log("[color=gray]South through the gate lies the tavern (friendly folk, no fighting). The tunnel in the north wall leads into a cave with its own dangers and a treasure at the end.[/color]")
	EventBus.log("[color=gray]Night rules: stay out of the torchlight to get close unseen. High ground gives +2 to hit, crates and low walls give cover, full cover blocks the shot.[/color]")

	# Headless integration test hooks (godot --headless -- --autoplay / --scenario).
	for flag in ["--autoplay", "--scenario", "--screenshot"]:
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


## Every hostile creature: the arena waves and the cave encounter.
func enemies() -> Array[Actor]:
	var out: Array[Actor] = []
	for a in actors():
		if a.data.faction == ActorData.Faction.ENEMY:
			out.append(a)
	return out


## Enemies that belong to the waves (respawned between waves).
func arena_enemies() -> Array[Actor]:
	var out: Array[Actor] = []
	for e in enemies():
		if e.get_parent() == $Enemies:
			out.append(e)
	return out


## The one-time encounter inside the cave.
func cave_enemies() -> Array[Actor]:
	var out: Array[Actor] = []
	for e in enemies():
		if e.get_parent() == $CaveEnemies:
			out.append(e)
	return out


## Tavern folk and other bystanders.
func npcs() -> Array[Actor]:
	var out: Array[Actor] = []
	for a in actors():
		if a.is_neutral():
			out.append(a)
	return out


## Living enemies of the arena waves (the cave does not block resting).
func living_enemies() -> int:
	var n := 0
	for e in arena_enemies():
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
	# Only the spotter's own group joins: the cave encounter and the arena
	# waves never mix, however close the cave mouth is.
	for e in enemies():
		if e.is_alive() and e.get_parent() == enemy.get_parent() and e.center_distance_to(enemy) <= encounter_radius:
			participants.append(e)
	EventBus.log("[b]%s[/b] spotted the party!" % enemy.display_name())
	hud.set_rest_available(false, false, wave)
	combat.start_combat(participants)


func set_auto_battle(enabled: bool) -> void:
	combat.party_ai = PartyAI.new() if enabled else null
	EventBus.log("[color=gray]Auto-battle %s.[/color]" % ("on" if enabled else "off"))
	combat_input.cancel()
	# If it is currently a party member's turn, let the AI take over right away.
	if enabled and combat.is_active and combat.active_actor != null and combat.active_actor.is_player() \
			and not combat.is_busy():
		combat.call_deferred("_run_ai_turn", combat.active_actor, combat.party_ai)


func long_rest_available() -> bool:
	return wave % LONG_REST_EVERY == 0


## Long rest: everything back. Only offered after every third wave.
func long_rest() -> void:
	if combat.is_active or not GameState.is_exploring() or not long_rest_available():
		return
	for p in party():
		p.long_rest()
	EventBus.log("[color=lime][b]The party takes a long rest: hit points, spell slots, features and arrows are restored.[/b][/color]")
	_start_wave(wave + 1)


## Short rest between waves: one hit die of healing, Second Wind / Action Surge
## and half the arrows come back. Spell slots stay spent.
func next_wave() -> void:
	if combat.is_active or not GameState.is_exploring():
		return
	for p in party():
		var healed := p.short_rest()
		EventBus.log("%s catches their breath (+%d HP)." % [p.display_name(), healed])
	_start_wave(wave + 1)


## The party returns to camp, every enemy goes back to its spawn scaled to the
## party, plus reinforcements.
func _start_wave(number: int) -> void:
	wave = number
	var level := Progression.average_level(party())
	for p in party():
		var t: Transform3D = _spawn_transforms.get(p, p.global_transform)
		p.stop_moving()
		p.global_transform = t
	camera_rig.global_position = leader.global_position
	# From wave 3 on, an extra goblin joins each wave (up to MAX_REINFORCEMENTS).
	for i in mini(MAX_REINFORCEMENTS, wave - 2) - _reinforcements.size():
		_spawn_reinforcement()
	# New creature kinds arrive according to the wave table.
	if WAVE_ARRIVALS.has(wave):
		var names := PackedStringArray()
		for path in WAVE_ARRIVALS[wave]:
			var newcomer := _spawn_arrival(load(path))
			names.append(newcomer.display_name())
		EventBus.log("[color=orange]From the cave mouth: %s![/color]" % ", ".join(names))
	for e in arena_enemies():
		var t: Transform3D = _spawn_transforms.get(e, e.global_transform)
		var lines := Progression.scale_enemy(e, level)
		e.restore_full(t.origin)
		e.global_transform = t
		var perception := e.get_node_or_null("Perception")
		if perception:
			perception.set_deferred("monitoring", true)
		for l in lines:
			EventBus.log("[color=gray]%s[/color]" % l)
	hud.set_rest_available(false, false, wave)
	EventBus.log("[color=yellow][b]Wave %d approaches! The enemies are level %d.[/b][/color]" % [wave, level])
	wave_started.emit(wave)


var _reinforcements: Array[Actor] = []


func _spawn_reinforcement() -> void:
	var index := _reinforcements.size()
	var enemy := _spawn_enemy(REINFORCEMENT_DATA, Vector3(-13.0 + 3.5 * index, 0.0, -17.5), "Reinforcement%d" % (index + 1))
	_reinforcements.append(enemy)


var _arrivals: Array[Actor] = []


func _spawn_arrival(data: ActorData) -> Actor:
	var index := _arrivals.size()
	# A loose cluster in front of the cave mouth, spreading east.
	var spot := CAVE_MOUTH + Vector3(1.6 * (index % 5) + 0.8 * (index / 5), 0.0, 1.4 * (index / 5))
	var enemy := _spawn_enemy(data, spot, "Arrival%d" % (index + 1))
	enemy.play_action("spawn")
	_arrivals.append(enemy)
	return enemy


func _spawn_enemy(data: ActorData, spot: Vector3, node_name: String) -> Actor:
	var enemy: Actor = ENEMY_SCENE.instantiate()
	enemy.data = data
	enemy.transform = Transform3D(Basis.from_euler(Vector3(0, PI, 0)), spot)
	$Enemies.add_child(enemy)
	enemy.name = node_name
	_spawn_transforms[enemy] = enemy.global_transform
	return enemy


## Everyone a wave brings (for the HUD / tests).
func arrivals() -> Array[Actor]:
	return _arrivals


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
	hud.set_rest_available(living_enemies() == 0, long_rest_available(), wave)


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
	movement_indicator.global_position = Vector3(actor.global_position.x, actor.global_position.y + 0.03, actor.global_position.z)
	movement_indicator.scale = Vector3(radius, 1.0, radius)


func restart() -> void:
	if not GameState.is_game_over():
		return
	GameState.set_state(GameState.State.EXPLORATION)
	get_tree().reload_current_scene()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("restart"):
		restart()
