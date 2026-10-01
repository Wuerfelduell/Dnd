## A creature in the world: party member or enemy.
##
## Owns runtime state (HP, turn resources, spell slots, statuses, concentration,
## available actions) and low-level movement. It does not decide anything:
## exploration input comes from [PlayerController] / [PartyFollower], combat
## decisions from [CombatManager] and the AI brains.
class_name Actor
extends CharacterBody3D

signal hp_changed(current: int, maximum: int)
signal downed(actor: Actor)
signal revived(actor: Actor)
signal statuses_changed(actor: Actor)
## The action list was rebuilt (level-up, new spells).
signal actions_changed(actor: Actor)
signal movement_finished(actor: Actor)
## Emitted while moving in combat when this actor leaves a hostile's reach
## (the [CombatManager] resolves the opportunity attack).
signal reach_left(mover: Actor, hostile: Actor)

const BODY_RADIUS := 0.4
const MELEE_REACH := 1.5
const GRAVITY := 25.0

@export var data: ActorData
## Visual walking speed in m/s (rules movement is in TurnState).
@export var move_speed: float = 5.0

var current_hp: int = 0
var is_down: bool = false
var turn_state: TurnState = TurnState.new()
var actions: Array[CombatAction] = []
## Free-form per-combat flags (e.g. "second_wind_used"); reset on combat start.
var combat_flags: Dictionary = {}
## Remaining spell slots, index = level.
var spell_slots: PackedInt32Array = PackedInt32Array()
var statuses: Array[StatusEffect] = []
## Spell currently concentrated on (null = none) and the effects it sustains.
var concentration_spell: SpellData = null
var concentration_effects: Array[StatusEffect] = []
## Distance actually travelled during the last [method move_along_path].
var last_move_distance: float = 0.0
## Actors that can threaten this one while it moves (set by the CombatManager).
var threat_sources: Array[Actor] = []

## Ammunition per kind, e.g. {"arrows": 20}.
var ammo: Dictionary = {}
## The party's shared bag (null for enemies and bystanders). Set by [World].
var inventory: Inventory = null

var _path: PackedVector3Array = PackedVector3Array()
var _path_index: int = 0
var _distance_budget: float = 0.0
var _moving: bool = false
var _pause_depth: int = 0
var _stall_frames: int = 0
var _oa_reacted: Array[Actor] = []
var _runtime_initialized: bool = false
## The .tres this actor was built from (enemy scaling rebuilds from it).
var _source_data: ActorData

@onready var visual: ActorVisual = get_node_or_null("Visual")
@onready var name_label: ActorLabel = get_node_or_null("Label")


func _ready() -> void:
	assert(data != null, "Actor '%s' has no ActorData" % name)
	initialize_runtime()
	add_to_group("actors")
	floor_snap_length = 0.4
	if visual:
		visual.apply_color(data.color)
	if name_label:
		name_label.bind(self)
	hp_changed.emit(current_hp, max_hp())


## Sets up HP, slots and actions from [member data]. Safe to call without a
## scene tree (unit tests build actors with Actor.new()).
func initialize_runtime() -> void:
	if _runtime_initialized:
		return
	_runtime_initialized = true
	# Own copy: level-ups and tests mutate it without touching the .tres files.
	_source_data = data
	data = data.duplicate(true)
	current_hp = data.stats.max_hp
	reset_spell_slots()
	refill_ammo()
	_build_actions()


## Fresh runtime data from the original resource (used when enemies are
## re-scaled for a new wave). Keeps the actor's node, loses level-ups.
func rebuild_from_source() -> void:
	data = _source_data.duplicate(true)
	current_hp = data.stats.max_hp
	reset_spell_slots()
	refill_ammo()
	rebuild_actions()


## Rebuilds the action list from [member data] (after a level-up).
func rebuild_actions() -> void:
	_build_actions()
	actions_changed.emit(self)


## Back to full health at the spawn position (new wave / rest).
func restore_full(at_position: Vector3 = global_position) -> void:
	global_position = at_position
	clear_all_statuses()
	break_concentration("rest", false)
	turn_state.clear()
	stop_moving()
	reset_spell_slots()
	if is_down:
		_revive(max_hp())
	else:
		current_hp = max_hp()
		hp_changed.emit(current_hp, max_hp())


func _build_actions() -> void:
	actions.clear()
	for weapon in data.weapons:
		actions.append(AttackAction.new(weapon))
	if data.offhand_weapon != null:
		actions.append(OffhandAttackAction.new(data.offhand_weapon))
	for spell in data.spells:
		actions.append(SpellAction.new(spell))
	actions.append(DashAction.new(CombatAction.Cost.ACTION))
	actions.append(DisengageAction.new(CombatAction.Cost.ACTION))
	if data.has_cunning_action:
		actions.append(DashAction.new(CombatAction.Cost.BONUS_ACTION))
		actions.append(DisengageAction.new(CombatAction.Cost.BONUS_ACTION))
	if data.has_second_wind:
		actions.append(SecondWindAction.new())
	if data.has_action_surge:
		actions.append(ActionSurgeAction.new())
	if inventory != null:
		for item in Inventory.consumables():
			actions.append(UseItemAction.new(item))


## Hands the actor the party's bag (potion buttons appear on the action bar).
func set_inventory(bag: Inventory) -> void:
	inventory = bag
	rebuild_actions()


## Called at combat start. Slots, once-per-rest features and ammunition are
## NOT refreshed here: they only come back by resting.
func reset_for_combat() -> void:
	clear_all_statuses()
	break_concentration("combat start", false)
	turn_state.clear()
	stop_moving()


func reset_spell_slots() -> void:
	spell_slots = data.spell_slots.duplicate()


# --- Ammunition -----------------------------------------------------------

func refill_ammo() -> void:
	ammo.clear()
	for w in data.weapons:
		if w.uses_ammo:
			ammo[w.ammo_name] = maxi(ammo.get(w.ammo_name, 0), w.ammo_max)


func ammo_left(weapon: WeaponData) -> int:
	if not weapon.uses_ammo:
		return -1
	return ammo.get(weapon.ammo_name, 0)


func has_ammo(weapon: WeaponData) -> bool:
	return not weapon.uses_ammo or ammo.get(weapon.ammo_name, 0) > 0


func spend_ammo(weapon: WeaponData) -> void:
	if weapon.uses_ammo:
		ammo[weapon.ammo_name] = maxi(0, ammo.get(weapon.ammo_name, 0) - 1)


## Adds ammunition up to each weapon's maximum.
func recover_ammo(fraction: float) -> void:
	for w in data.weapons:
		if w.uses_ammo:
			var gain := int(ceil(w.ammo_max * fraction))
			ammo[w.ammo_name] = mini(w.ammo_max, ammo.get(w.ammo_name, 0) + gain)


# --- Resting --------------------------------------------------------------

## Short rest: one hit die of healing per two levels, short-rest features
## (Second Wind, Action Surge) and some ammunition come back. Downed
## creatures get up.
func short_rest() -> int:
	var dice := maxi(1, int(ceil(data.level / 2.0)))
	var heal_amount := (data.hit_die / 2 + 1 + data.stats.constitution_mod) * dice
	clear_all_statuses()
	break_concentration("rest", false)
	turn_state.clear()
	stop_moving()
	combat_flags.clear()
	recover_ammo(0.5)
	return heal(maxi(1, heal_amount))


## Long rest: everything back.
func long_rest() -> void:
	restore_full(global_position)


# --- Queries -------------------------------------------------------------

func display_name() -> String:
	return data.display_name


func faction() -> ActorData.Faction:
	return data.faction


func is_player() -> bool:
	return data.faction == ActorData.Faction.PLAYER


func is_hostile_to(other: Actor) -> bool:
	if other == self or other.data.faction == data.faction:
		return false
	return data.faction != ActorData.Faction.NEUTRAL and other.data.faction != ActorData.Faction.NEUTRAL


func is_neutral() -> bool:
	return data.faction == ActorData.Faction.NEUTRAL


func is_alive() -> bool:
	return not is_down


func max_hp() -> int:
	return data.stats.max_hp


func armor_class() -> int:
	return data.stats.armor_class + int(status_sum("armor_class_bonus"))


## Movement per turn after status effects (Ray of Frost etc.).
func speed_m() -> float:
	var speed := data.stats.speed_m + float(status_sum("speed_delta_m"))
	for e in statuses:
		speed *= e.data.speed_multiplier
	return maxf(0.0, speed)


func is_incapacitated() -> bool:
	return is_down or status_flag("incapacitated")


func attack_bonus(weapon: WeaponData) -> int:
	return data.stats.ability_mod(weapon.ability) + data.stats.proficiency_bonus


func damage_bonus(weapon: WeaponData) -> int:
	return data.stats.ability_mod(weapon.ability)


## First melee weapon (used for opportunity attacks).
func melee_weapon() -> WeaponData:
	for w in data.weapons:
		if not w.is_ranged:
			return w
	return null


## Horizontal edge-to-edge distance (0 when the capsules touch).
func distance_to(other: Actor) -> float:
	return maxf(0.0, center_distance_to(other) - BODY_RADIUS * 2.0)


func center_distance_to(other: Actor) -> float:
	var a := global_position
	var b := other.global_position
	a.y = 0.0
	b.y = 0.0
	return a.distance_to(b)


func find_action(action_id: StringName) -> CombatAction:
	for a in actions:
		if a.id == action_id:
			return a
	return null


func has_spell_slot(level: int) -> bool:
	if level <= 0:
		return true
	return level < spell_slots.size() and spell_slots[level] > 0


func spend_spell_slot(level: int) -> bool:
	if level <= 0:
		return true
	if not has_spell_slot(level):
		return false
	spell_slots[level] -= 1
	return true


func max_spell_slots(level: int) -> int:
	return data.spell_slots[level] if level < data.spell_slots.size() else 0


# --- HP ------------------------------------------------------------------

func take_damage(amount: int, damage_type: String = "") -> void:
	if is_down or amount <= 0:
		return
	current_hp = maxi(0, current_hp - amount)
	hp_changed.emit(current_hp, max_hp())
	EventBus.damage_applied.emit(self, amount, damage_type)
	if current_hp == 0:
		_go_down()
	else:
		play_action("hit")
		if concentration_spell != null:
			_concentration_check(amount)


## Heals; a downed creature gets back up with the healed amount.
func heal(amount: int) -> int:
	if amount <= 0:
		return 0
	if is_down:
		_revive(mini(max_hp(), amount))
		return current_hp
	var before := current_hp
	current_hp = mini(max_hp(), current_hp + amount)
	hp_changed.emit(current_hp, max_hp())
	return current_hp - before


func _go_down() -> void:
	is_down = true
	turn_state.clear()
	stop_moving()
	clear_all_statuses()
	break_concentration("went down")
	if visual:
		visual.set_down(true)
	# Let others walk through the body; deferred because this can run inside physics callbacks.
	var shape := get_node_or_null("CollisionShape3D")
	if shape:
		shape.set_deferred("disabled", true)
	downed.emit(self)


func _revive(hp: int) -> void:
	is_down = false
	current_hp = hp
	if visual:
		visual.set_down(false)
	var shape := get_node_or_null("CollisionShape3D")
	if shape:
		shape.set_deferred("disabled", false)
	hp_changed.emit(current_hp, max_hp())
	revived.emit(self)


# --- Statuses ------------------------------------------------------------

func add_status(effect_data: StatusEffectData, source: Actor = null, rounds: int = -2, save_dc: int = 0) -> StatusEffect:
	# Refresh instead of stacking the same condition twice.
	var existing := get_status(effect_data.id)
	if existing != null:
		remove_status(existing, true)
	var effect := StatusEffect.new()
	effect.data = effect_data
	effect.source = source
	effect.holder = self
	effect.save_dc = save_dc
	effect.remaining_rounds = effect_data.default_rounds if rounds == -2 else rounds
	statuses.append(effect)
	if effect_data.incapacitated:
		turn_state.clear()
		stop_moving()
	if visual:
		visual.set_status_tint(_status_tint())
	statuses_changed.emit(self)
	EventBus.status_applied.emit(self, effect)
	return effect


func remove_status(effect: StatusEffect, silent: bool = false) -> void:
	if not statuses.has(effect):
		return
	statuses.erase(effect)
	if effect.concentration_owner != null:
		effect.concentration_owner.concentration_effects.erase(effect)
	if visual:
		visual.set_status_tint(_status_tint())
	statuses_changed.emit(self)
	if not silent:
		EventBus.status_removed.emit(self, effect)


func clear_all_statuses() -> void:
	for e in statuses.duplicate():
		remove_status(e, true)


func get_status(status_id: StringName) -> StatusEffect:
	for e in statuses:
		if e.data.id == status_id:
			return e
	return null


func has_status(status_id: StringName) -> bool:
	return get_status(status_id) != null


## True when any active status has the boolean [param flag] set.
func status_flag(flag: String) -> bool:
	for e in statuses:
		if e.data.get(flag) == true:
			return true
	return false


func status_names_with_flag(flag: String) -> String:
	var names := PackedStringArray()
	for e in statuses:
		if e.data.get(flag) == true:
			names.append(e.data.display_name)
	return ", ".join(names)


## Sum of a numeric status field over all active statuses.
func status_sum(field: String) -> float:
	var sum := 0.0
	for e in statuses:
		sum += float(e.data.get(field))
	return sum


## Dice notations from statuses (e.g. {"Bless": "1d4"}).
func status_bonus_dice(field: String) -> Dictionary:
	var out := {}
	for e in statuses:
		var dice: String = e.data.get(field)
		if dice != "":
			out[e.data.display_name] = dice
	return out


func status_summary() -> String:
	var parts := PackedStringArray()
	for e in statuses:
		parts.append(e.data.short_name)
	return ", ".join(parts)


func consume_statuses_on_attacked() -> void:
	for e in statuses.duplicate():
		if e.data.consumed_on_attacked:
			remove_status(e)


func _status_tint() -> Color:
	for e in statuses:
		if e.data.tint != Color(1, 1, 1, 1):
			return e.data.tint
	return Color(1, 1, 1, 1)


## Called by the CombatManager at the end of this actor's turn: durations
## tick down, repeatable saves are attempted.
func end_of_turn_tick() -> void:
	for e in statuses.duplicate():
		if not statuses.has(e):
			continue
		if e.data.repeat_save_ability != "" and e.save_dc > 0 and is_alive():
			var save := SavingThrow.resolve(self, e.data.repeat_save_ability, e.save_dc, e.data.display_name)
			EventBus.log("%s tries to shake off %s: %s" % [display_name(), e.data.display_name, save.describe()])
			if save.success:
				remove_status(e)
				continue
		if e.remaining_rounds > 0:
			e.remaining_rounds -= 1
			if e.remaining_rounds == 0:
				remove_status(e)
		elif e.remaining_rounds == 0:
			remove_status(e)


# --- Concentration -------------------------------------------------------

func start_concentration(spell: SpellData) -> void:
	if concentration_spell != null:
		break_concentration("casting %s" % spell.display_name)
	concentration_spell = spell
	statuses_changed.emit(self)


func link_concentration_effect(effect: StatusEffect) -> void:
	effect.concentration_owner = self
	concentration_effects.append(effect)


func break_concentration(reason: String, announce: bool = true) -> void:
	if concentration_spell == null:
		return
	var spell := concentration_spell
	concentration_spell = null
	for e in concentration_effects.duplicate():
		if e.holder != null and is_instance_valid(e.holder):
			e.holder.remove_status(e)
	concentration_effects.clear()
	statuses_changed.emit(self)
	if announce:
		EventBus.concentration_broken.emit(self, spell, reason)


func _concentration_check(damage: int) -> void:
	var dc := maxi(10, damage / 2)
	var save := SavingThrow.resolve(self, "con", dc, "concentration")
	EventBus.log("%s concentration check (%s): %s" % [display_name(), concentration_spell.display_name, save.describe()])
	if not save.success:
		break_concentration("failed the concentration save")


# --- Movement ------------------------------------------------------------

## Starts walking along [param path] (world points) but never further than
## [param max_distance]. Emits [signal movement_finished] when done.
func move_along_path(path: PackedVector3Array, max_distance: float) -> void:
	last_move_distance = 0.0
	_path = path
	_path_index = 1
	_distance_budget = max_distance
	_oa_reacted.clear()
	_pause_depth = 0
	_stall_frames = 0
	if path.size() < 2 or max_distance <= 0.0:
		_moving = false
		call_deferred("_emit_movement_finished")
		return
	_moving = true
	play_action("run")


func is_moving() -> bool:
	return _moving


func stop_moving() -> void:
	if _moving:
		_finish_move()


## Freezes the walk (e.g. while an opportunity attack resolves).
func pause_moving() -> void:
	_pause_depth += 1
	play_action("idle")


func resume_moving() -> void:
	_pause_depth = maxi(0, _pause_depth - 1)
	if _moving and _pause_depth == 0:
		play_action("run")


func _emit_movement_finished() -> void:
	movement_finished.emit(self)


func _physics_process(delta: float) -> void:
	if not _moving or _pause_depth > 0:
		return
	# Skip waypoints we are already standing on.
	while _path_index < _path.size() and _flat_distance_to(_path[_path_index]) < 0.05:
		_path_index += 1
	if _path_index >= _path.size() or _distance_budget <= 0.0001:
		_finish_move()
		return
	var target := _path[_path_index]
	target.y = global_position.y
	var to_target := target - global_position
	var dist := to_target.length()
	var step := minf(move_speed * delta, minf(dist, _distance_budget))
	var dir := to_target / dist
	face_direction(dir)
	var threats := _threats_in_reach()
	var moved := walk(dir * (step / delta), delta)
	last_move_distance += moved
	_distance_budget -= moved
	_check_reach_left(threats)
	if _flat_distance_to(target) < 0.15:
		_path_index += 1
	# Stuck against something for a while: give up gracefully.
	if _moving:
		if moved < 0.002:
			_stall_frames += 1
			if _stall_frames >= 20:
				_finish_move()
		else:
			_stall_frames = 0


## One physics step of walking with [param horizontal_velocity] (m/s) while
## gravity keeps the body on the ground: up stairs, down slopes, sliding along
## other creatures and walls. Returns the horizontal distance travelled.
func walk(horizontal_velocity: Vector3, delta: float) -> float:
	var before := global_position
	var vertical := velocity.y
	if is_on_floor():
		vertical = -1.0
	else:
		vertical -= GRAVITY * delta
	velocity = Vector3(horizontal_velocity.x, vertical, horizontal_velocity.z)
	move_and_slide()
	var moved := global_position - before
	moved.y = 0.0
	return moved.length()


func _flat_distance_to(point: Vector3) -> float:
	var a := global_position
	a.y = 0.0
	point.y = 0.0
	return a.distance_to(point)


func _threats_in_reach() -> Array[Actor]:
	var out: Array[Actor] = []
	if threat_sources.is_empty() or status_flag("immune_to_opportunity_attacks"):
		return out
	for other in threat_sources:
		if other == self or not is_instance_valid(other) or not other.is_alive() or other.is_incapacitated():
			continue
		if not is_hostile_to(other) or not other.turn_state.reaction_available or _oa_reacted.has(other):
			continue
		if other.melee_weapon() == null:
			continue
		if distance_to(other) <= MELEE_REACH + 0.001:
			out.append(other)
	return out


func _check_reach_left(threats: Array[Actor]) -> void:
	for other in threats:
		if distance_to(other) > MELEE_REACH + 0.001:
			_oa_reacted.append(other)
			reach_left.emit(self, other)


func _finish_move() -> void:
	_moving = false
	_pause_depth = 0
	velocity = Vector3.ZERO
	play_action("idle")
	movement_finished.emit(self)


## Visible pose for an action ("attack", "ranged", "cast", "hit", "run" ...);
## does nothing for miniatures and capsules.
func play_action(action: String) -> void:
	if visual != null:
		visual.play_action(action)


## Height of the visible figure in metres (eye height, labels).
func figure_height() -> float:
	if data == null:
		return 1.8
	if visual != null and visual.uses_model():
		return data.model_height
	if data.model != "" and visual == null:
		return data.model_height
	if MiniatureBuilder.has_recipe(data.miniature):
		return MiniatureBuilder.height_of(data.miniature)
	return 1.8


func face_direction(dir: Vector3) -> void:
	dir.y = 0.0
	if dir.length_squared() < 0.0001:
		return
	look_at(global_position + dir, Vector3.UP)


func face_actor(other: Actor) -> void:
	face_direction(other.global_position - global_position)
