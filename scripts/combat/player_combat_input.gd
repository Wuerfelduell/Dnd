## "Lock and roll" input for a party member's turn:
##   1. pick an action from the bar (or none for move / default attack)
##   2. tap a target, a point on the ground or a destination -> it is *locked*
##      and previewed (rings, area circle, path, warnings)
##   3. tap Confirm (or tap the same target again) to execute, Cancel to drop it.
## Knows nothing about rules; it only asks the CombatManager.
class_name PlayerCombatInput
extends Node

signal selected_action_changed(action: CombatAction)
signal hovered_actor_changed(actor: Actor)
## The locked target / point / path changed (also when cleared).
signal lock_changed

enum LockKind { NONE, MOVE, ACTOR, POINT }

@export var combat: CombatManager
@export var camera: Camera3D

var selected_action: CombatAction = null
var hovered_actor: Actor = null

var lock_kind: LockKind = LockKind.NONE
var locked_actor: Actor = null
var locked_point: Vector3 = Vector3.ZERO
var locked_path: PackedVector3Array = PackedVector3Array()
## Hostiles that get an opportunity attack along the locked path.
var locked_provokers: Array[Actor] = []
## Creatures inside the locked area (POINT actions).
var locked_area_targets: Array[Actor] = []

var _pending_click: bool = false
var _pending_click_position: Vector2 = Vector2.ZERO
var _mouse_position: Vector2 = Vector2.ZERO


## Called by [World] once the manager and camera exist.
func setup(p_combat: CombatManager, p_camera: Camera3D) -> void:
	combat = p_combat
	camera = p_camera
	combat.turn_started.connect(func(_a): cancel())
	combat.combat_ended.connect(func(_v): cancel())
	combat.state_updated.connect(_revalidate_lock)


func _unhandled_input(event: InputEvent) -> void:
	if not combat.is_player_turn():
		return
	if event is InputEventMouseMotion:
		_mouse_position = event.position
	elif ScreenRaycast.is_tap(event):
		if OS.is_stdout_verbose():
			print("[input] select at ", event.position)
		_pending_click = true
		_pending_click_position = event.position
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("cancel"):
		cancel()
	elif event.is_action_pressed("confirm"):
		confirm()
	elif event.is_action_pressed("end_turn"):
		combat.end_turn()


func has_lock() -> bool:
	return lock_kind != LockKind.NONE


func select_action(action: CombatAction) -> void:
	if action != null and action == selected_action:
		action = null
	_clear_lock()
	selected_action = action
	selected_action_changed.emit(action)


## Called by the action bar: instant actions run, targeted ones get selected.
func use_action(action: CombatAction) -> void:
	if not combat.is_player_turn():
		return
	var actor := combat.active_actor
	if not action.is_available(actor):
		EventBus.log("[color=gray]%s: %s[/color]" % [action.display_name, action.unavailable_reason(actor)])
		return
	if action.requires_target():
		select_action(action)
	else:
		select_action(null)
		combat.perform_action(actor, action, null)


## Executes whatever is locked.
func confirm() -> void:
	if not combat.is_player_turn() or not has_lock():
		return
	var actor := combat.active_actor
	var kind := lock_kind
	var action := selected_action
	var target := locked_actor
	var point := locked_point
	var path := locked_path
	_clear_lock()
	selected_action = null
	selected_action_changed.emit(null)
	match kind:
		LockKind.MOVE:
			if path.size() >= 2:
				combat.move_actor(actor, path[path.size() - 1])
		LockKind.ACTOR:
			if action != null:
				combat.perform_action(actor, action, target)
		LockKind.POINT:
			if action != null:
				combat.perform_action(actor, action, null, point)


## Drops the lock and the selection.
func cancel() -> void:
	var had := has_lock() or selected_action != null
	_clear_lock()
	selected_action = null
	if had:
		selected_action_changed.emit(null)


func _clear_lock() -> void:
	var had := has_lock()
	if locked_actor != null and is_instance_valid(locked_actor) and locked_actor.visual:
		locked_actor.visual.set_targetable(false)
	lock_kind = LockKind.NONE
	locked_actor = null
	locked_path = PackedVector3Array()
	locked_provokers = []
	locked_area_targets = []
	if had:
		lock_changed.emit()


func _physics_process(_delta: float) -> void:
	if camera == null or not combat.is_player_turn():
		_set_hovered(null)
		return
	var actor := combat.active_actor
	# Hover highlight only while nothing is locked (touch has no hover anyway).
	if not has_lock():
		var hover_hit := ScreenRaycast.pick(camera, _mouse_position)
		var hover_actor: Actor = hover_hit.get("actor")
		_set_hovered(hover_actor if hover_actor != null and _is_clickable_target(actor, hover_actor) else null)
	else:
		_set_hovered(null)

	if not _pending_click:
		return
	_pending_click = false
	var hit := ScreenRaycast.pick(camera, _pending_click_position)
	if OS.is_stdout_verbose():
		print("[input] click raycast: ", hit)
	if hit.is_empty():
		return
	_on_tap(actor, hit.get("actor"), hit["position"])


func _on_tap(actor: Actor, clicked: Actor, position: Vector3) -> void:
	if selected_action != null:
		match selected_action.target_kind:
			CombatAction.TargetKind.POINT:
				var point := position
				if clicked != null:
					point = clicked.global_position
				point = _clamp_to_range(actor, point, selected_action.range_m)
				if lock_kind == LockKind.POINT and point.distance_to(locked_point) < 0.6:
					confirm()
				else:
					_lock_point(actor, point)
			_:
				if clicked == null:
					EventBus.log("[color=gray]%s needs a creature as target. Tap one, or Cancel.[/color]" % selected_action.display_name)
					return
				if not selected_action.can_target(actor, clicked):
					combat._explain_bad_target(actor, selected_action, clicked)
					return
				if lock_kind == LockKind.ACTOR and locked_actor == clicked:
					confirm()
				else:
					_lock_actor(clicked)
		return

	# Nothing selected: enemies get the default attack, the ground is a move.
	if clicked != null:
		if clicked == actor:
			return
		if actor.is_hostile_to(clicked) and clicked.is_alive():
			if lock_kind == LockKind.ACTOR and locked_actor == clicked:
				confirm()
				return
			var attack := _default_attack_for(actor, clicked)
			if attack == null:
				EventBus.log("[color=gray]No attack can reach %s from here. Move closer or pick a ranged option.[/color]" % clicked.display_name())
				return
			_clear_lock()
			selected_action = attack
			selected_action_changed.emit(attack)
			_lock_actor(clicked)
		else:
			EventBus.log("[color=gray]Pick a spell or ability first to use it on %s.[/color]" % clicked.display_name())
		return
	if lock_kind == LockKind.MOVE and locked_path.size() >= 2 \
			and position.distance_to(locked_path[locked_path.size() - 1]) < 0.8:
		confirm()
	else:
		_lock_move(actor, position)


func _lock_actor(target: Actor) -> void:
	_clear_lock()
	lock_kind = LockKind.ACTOR
	locked_actor = target
	if target.visual:
		target.visual.set_targetable(true)
	lock_changed.emit()


func _lock_point(actor: Actor, point: Vector3) -> void:
	_clear_lock()
	lock_kind = LockKind.POINT
	locked_point = point
	if selected_action is SpellAction:
		locked_area_targets = SpellResolver.collect_targets(actor, selected_action.spell, null, point)
	lock_changed.emit()


func _lock_move(actor: Actor, destination: Vector3) -> void:
	_clear_lock()
	if actor.turn_state.movement_remaining <= 0.05:
		EventBus.log("[color=gray]%s has no movement left.[/color]" % actor.display_name())
		return
	var path := CombatMovement.plan(actor, destination, combat.participants)
	path = CombatMovement.truncate(path, actor.turn_state.movement_remaining)
	if path.size() < 2 or CombatMovement.path_length(path) < 0.1:
		return
	lock_kind = LockKind.MOVE
	locked_path = path
	locked_provokers = CombatMovement.provoking_hostiles(actor, path, combat.participants)
	lock_changed.emit()


## After an action resolved, a locked target may be gone or out of range.
func _revalidate_lock() -> void:
	if not has_lock():
		return
	var actor := combat.active_actor
	if actor == null:
		_clear_lock()
		return
	match lock_kind:
		LockKind.ACTOR:
			if selected_action == null or not selected_action.can_target(actor, locked_actor):
				_clear_lock()
		LockKind.POINT:
			if selected_action == null or not selected_action.can_target_point(actor, locked_point):
				_clear_lock()
		LockKind.MOVE:
			if actor.turn_state.movement_remaining < CombatMovement.path_length(locked_path) - 0.05:
				_clear_lock()


static func _clamp_to_range(actor: Actor, point: Vector3, range_m: float) -> Vector3:
	var origin := actor.global_position
	var flat := point
	flat.y = origin.y
	var offset := flat - origin
	if offset.length() > range_m:
		flat = origin + offset.normalized() * range_m
	return flat


## Human readable state for the HUD hint line.
func describe_lock(actor: Actor) -> String:
	match lock_kind:
		LockKind.MOVE:
			var text := "Move %.1f m" % CombatMovement.path_length(locked_path)
			if not locked_provokers.is_empty():
				var names := PackedStringArray()
				for p in locked_provokers:
					names.append(p.display_name())
				text += " - provokes an opportunity attack from %s!" % ", ".join(names)
			return text
		LockKind.ACTOR:
			return "%s on %s" % [selected_action.display_name, locked_actor.display_name()]
		LockKind.POINT:
			if selected_action is SpellAction and selected_action.spell.teleport:
				return "%s to that spot" % selected_action.display_name
			var names := PackedStringArray()
			for t in locked_area_targets:
				names.append(t.display_name() + ("" if actor.is_hostile_to(t) else " (ally!)"))
			if names.is_empty():
				return "%s there hits nobody" % selected_action.display_name
			return "%s hits %s" % [selected_action.display_name, ", ".join(names)]
	return ""


func _is_clickable_target(actor: Actor, other: Actor) -> bool:
	if selected_action != null:
		return selected_action.can_target(actor, other)
	return other.is_alive() and actor.is_hostile_to(other)


## Nothing selected + tap on an enemy: use the first attack that can reach it,
## preferring melee (it usually has the better bonus in this prototype).
func _default_attack_for(actor: Actor, target: Actor) -> CombatAction:
	for action in actor.actions:
		if action is AttackAction and action.is_available(actor) and action.can_target(actor, target):
			return action
	return null


func _set_hovered(actor: Actor) -> void:
	if actor == hovered_actor:
		return
	if hovered_actor != null and is_instance_valid(hovered_actor) and hovered_actor.visual and hovered_actor != locked_actor:
		hovered_actor.visual.set_targetable(false)
	hovered_actor = actor
	if hovered_actor != null and hovered_actor.visual:
		hovered_actor.visual.set_targetable(true)
	hovered_actor_changed.emit(hovered_actor)
