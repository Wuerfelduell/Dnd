## Translates mouse clicks / hotkeys into CombatManager commands on the
## player's turn. Knows nothing about rules; it only asks the manager.
class_name PlayerCombatInput
extends Node

signal selected_action_changed(action: CombatAction)
signal hovered_actor_changed(actor: Actor)

@export var combat: CombatManager
@export var camera: Camera3D

var selected_action: CombatAction = null
var hovered_actor: Actor = null

var _pending_click: bool = false
var _pending_click_position: Vector2 = Vector2.ZERO
var _mouse_position: Vector2 = Vector2.ZERO


## Called by [World] once the manager and camera exist.
func setup(p_combat: CombatManager, p_camera: Camera3D) -> void:
	combat = p_combat
	camera = p_camera
	combat.turn_started.connect(func(_a): select_action(null))
	combat.combat_ended.connect(func(_v): select_action(null))


func _unhandled_input(event: InputEvent) -> void:
	if not combat.is_player_turn():
		return
	if event is InputEventMouseMotion:
		_mouse_position = event.position
	elif event.is_action_pressed("select"):
		if OS.is_stdout_verbose():
			print("[input] select at ", event.position)
		_pending_click = true
		_pending_click_position = event.position
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("cancel"):
		select_action(null)
	elif event.is_action_pressed("end_turn"):
		combat.end_turn()


func select_action(action: CombatAction) -> void:
	if action != null and action == selected_action:
		action = null
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
	if action.requires_target:
		select_action(action)
	else:
		select_action(null)
		combat.perform_action(actor, action, null)


func _physics_process(_delta: float) -> void:
	if camera == null or not combat.is_player_turn():
		_set_hovered(null)
		return
	# Hover highlight
	var hover_hit := ScreenRaycast.pick(camera, _mouse_position)
	var hover_actor: Actor = hover_hit.get("actor")
	_set_hovered(hover_actor if hover_actor != null and hover_actor.is_alive() and hover_actor.is_hostile_to(combat.active_actor) else null)

	if not _pending_click:
		return
	_pending_click = false
	var hit := ScreenRaycast.pick(camera, _pending_click_position)
	if OS.is_stdout_verbose():
		print("[input] click raycast: ", hit)
	if hit.is_empty():
		return
	var actor := combat.active_actor
	var clicked: Actor = hit.get("actor")
	if clicked != null and clicked.is_alive() and actor.is_hostile_to(clicked):
		var action := selected_action
		if action == null:
			action = _default_attack_for(actor, clicked)
		if action == null:
			EventBus.log("[color=gray]No attack can reach %s from here.[/color]" % clicked.display_name())
			return
		select_action(null)
		combat.perform_action(actor, action, clicked)
	elif clicked == null:
		# Ground click = move (clears an attack selection).
		select_action(null)
		combat.move_actor(actor, hit["position"])


## Nothing selected + click on an enemy: use the first attack that can reach it,
## preferring melee (it usually has the better bonus in this prototype).
func _default_attack_for(actor: Actor, target: Actor) -> CombatAction:
	var fallback: CombatAction = null
	for action in actor.actions:
		if action is AttackAction and action.is_available(actor):
			if action.can_target(actor, target):
				return action
			if fallback == null:
				fallback = action
	return null


func _set_hovered(actor: Actor) -> void:
	if actor == hovered_actor:
		return
	if hovered_actor != null and is_instance_valid(hovered_actor) and hovered_actor.visual:
		hovered_actor.visual.set_targetable(false)
	hovered_actor = actor
	if hovered_actor != null and hovered_actor.visual:
		hovered_actor.visual.set_targetable(true)
	hovered_actor_changed.emit(hovered_actor)
