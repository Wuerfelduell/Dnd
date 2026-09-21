## Heads-up display: mode banner, initiative list, action bar with lock-and-
## confirm, dice log, camera buttons (touch), floating combat text, level-up
## and game-over overlays, rest button.
##
## Designed for a 1280x720 base resolution that is scaled to the screen, so
## all buttons stay finger sized on a phone.
class_name CombatHud
extends CanvasLayer

signal restart_requested
signal auto_battle_toggled(enabled: bool)
signal rest_requested

const LOG_MAX_LINES := 200

var combat: CombatManager
var combat_input: PlayerCombatInput
var player: Actor
var camera_rig: CameraRig

var _action_buttons: Dictionary = {}  # CombatAction -> Button
var _buttons_actor: Actor = null
var _log_lines: PackedStringArray = PackedStringArray()
var _touch: bool = false

@onready var mode_label: Label = %ModeLabel
@onready var hint_label: Label = %HintLabel
@onready var initiative_box: VBoxContainer = %InitiativeList
@onready var initiative_panel: PanelContainer = %InitiativePanel
@onready var action_bar: HFlowContainer = %ActionBar
@onready var action_panel: PanelContainer = %ActionPanel
@onready var resources_label: Label = %ResourcesLabel
@onready var end_turn_button: Button = %EndTurnButton
@onready var auto_button: Button = %AutoButton
@onready var confirm_button: Button = %ConfirmButton
@onready var cancel_button: Button = %CancelButton
@onready var log_toggle: Button = %LogToggle
@onready var log_text: RichTextLabel = %LogText
@onready var game_over_panel: PanelContainer = %GameOverPanel
@onready var game_over_label: Label = %GameOverLabel
@onready var restart_button: Button = %RestartButton
@onready var level_up_panel: PanelContainer = %LevelUpPanel
@onready var level_up_text: RichTextLabel = %LevelUpText
@onready var continue_button: Button = %ContinueButton
@onready var rest_button: Button = %RestButton
@onready var rotate_left_button: Button = %RotateLeftButton
@onready var rotate_right_button: Button = %RotateRightButton
@onready var zoom_in_button: Button = %ZoomInButton
@onready var zoom_out_button: Button = %ZoomOutButton
@onready var joystick: HudJoystick = %Joystick


func setup(p_combat: CombatManager, p_input: PlayerCombatInput, p_player: Actor, p_camera_rig: CameraRig) -> void:
	combat = p_combat
	combat_input = p_input
	player = p_player
	camera_rig = p_camera_rig
	_touch = ScreenRaycast.has_touchscreen()

	EventBus.log_message.connect(_on_log_message)
	EventBus.attack_resolved.connect(_on_attack_resolved)
	EventBus.heal_applied.connect(_on_heal_applied)
	EventBus.save_resolved.connect(_on_save_resolved)
	EventBus.status_applied.connect(_on_status_applied)
	EventBus.status_removed.connect(_on_status_removed)
	EventBus.concentration_broken.connect(_on_concentration_broken)
	GameState.state_changed.connect(func(_n, _o): _refresh_mode())

	combat.combat_started.connect(func(_p): _refresh_all())
	combat.turn_started.connect(func(_a): _refresh_all())
	combat.turn_ended.connect(func(_a): _refresh_all())
	combat.state_updated.connect(_refresh_all)
	combat.combat_ended.connect(_on_combat_ended)
	combat_input.selected_action_changed.connect(func(_a): _refresh_action_bar())
	combat_input.lock_changed.connect(_refresh_action_bar)

	end_turn_button.pressed.connect(func(): combat.end_turn())
	confirm_button.pressed.connect(func(): combat_input.confirm())
	cancel_button.pressed.connect(func(): combat_input.cancel())
	auto_button.toggled.connect(func(on): auto_battle_toggled.emit(on))
	restart_button.pressed.connect(func(): restart_requested.emit())
	continue_button.pressed.connect(func(): level_up_panel.visible = false)
	rest_button.pressed.connect(func(): rest_requested.emit())
	rotate_left_button.pressed.connect(func(): camera_rig.rotate_by(45.0))
	rotate_right_button.pressed.connect(func(): camera_rig.rotate_by(-45.0))
	zoom_in_button.pressed.connect(func(): camera_rig.zoom_by(-3.0))
	zoom_out_button.pressed.connect(func(): camera_rig.zoom_by(3.0))
	log_toggle.toggled.connect(_on_log_toggled)
	log_toggle.button_pressed = true
	game_over_panel.visible = false
	level_up_panel.visible = false
	rest_button.visible = false
	_refresh_all()


func _refresh_all() -> void:
	_refresh_mode()
	_refresh_initiative()
	_refresh_action_bar()


func _refresh_mode() -> void:
	match GameState.state:
		GameState.State.EXPLORATION:
			mode_label.text = "EXPLORATION"
			if _touch:
				hint_label.text = "Joystick or tap the ground to walk. Camera buttons on the right."
			else:
				hint_label.text = "WASD, joystick or click the ground to walk. Q/E rotate camera, wheel zoom."
			initiative_panel.visible = false
			action_panel.visible = false
			joystick.visible = true
		GameState.State.COMBAT:
			var who := combat.active_actor.display_name() if combat.active_actor else "..."
			mode_label.text = "COMBAT - Round %d - %s's turn" % [combat.initiative.round_number, who]
			var tap := "Tap" if _touch else "Click"
			if combat.is_player_turn():
				hint_label.text = _player_hint(tap)
			elif combat.party_ai != null and combat.active_actor != null and combat.active_actor.is_player():
				hint_label.text = "Auto-battle is playing %s..." % who
			else:
				hint_label.text = "%s is acting..." % who
			initiative_panel.visible = true
			action_panel.visible = combat.active_actor != null and combat.active_actor.is_player()
			joystick.visible = false
			rest_button.visible = false
		GameState.State.GAME_OVER:
			mode_label.text = "GAME OVER"
			hint_label.text = "Tap Restart to try again." if _touch else "Press R or Restart to try again."
			action_panel.visible = false
			joystick.visible = false
			rest_button.visible = false


func _player_hint(tap: String) -> String:
	var actor := combat.active_actor
	if combat_input.has_lock():
		return "%s. %s Confirm (or tap again) to go, Cancel to change." % [combat_input.describe_lock(actor), tap]
	var sel := combat_input.selected_action
	if sel != null:
		match sel.target_kind:
			CombatAction.TargetKind.POINT:
				return "%s the ground where %s should land (%.0f m range)." % [tap, sel.display_name, sel.range_m]
			CombatAction.TargetKind.ALLY:
				return "%s an ally (or yourself) for %s." % [tap, sel.display_name]
			CombatAction.TargetKind.ANY:
				return "%s a creature for %s." % [tap, sel.display_name]
			_:
				return "%s an enemy for %s." % [tap, sel.display_name]
	return "%s the ground to move, %s an enemy to attack, or pick an action below. Then Confirm." % [tap, tap.to_lower()]


func _refresh_initiative() -> void:
	for child in initiative_box.get_children():
		child.queue_free()
	if not combat.is_active:
		return
	var header := Label.new()
	header.text = "Initiative"
	header.add_theme_font_size_override("font_size", 18)
	initiative_box.add_child(header)
	for e in combat.initiative.entries:
		var lbl := Label.new()
		lbl.add_theme_font_size_override("font_size", 14)
		var marker := "> " if e.actor == combat.active_actor else "   "
		var hp := "DOWN" if not e.actor.is_alive() else "%d/%d" % [e.actor.current_hp, e.actor.max_hp()]
		var statuses := e.actor.status_summary()
		lbl.text = "%s%s (%d)  %s%s" % [marker, e.actor.display_name(), e.total, hp, ("  [" + statuses + "]") if statuses != "" else ""]
		if not e.actor.is_alive():
			lbl.modulate = Color(0.55, 0.55, 0.55)
		elif e.actor == combat.active_actor:
			lbl.modulate = Color(1.0, 0.9, 0.3)
		elif e.actor.is_player():
			lbl.modulate = Color(0.75, 0.85, 1.0)
		initiative_box.add_child(lbl)


func _refresh_action_bar() -> void:
	var actor := combat.active_actor
	var show := combat.is_active and actor != null and actor.is_player()
	action_panel.visible = show
	if not show:
		return
	if _buttons_actor != actor or _action_buttons.is_empty() or _action_buttons.size() != actor.actions.size():
		_rebuild_buttons(actor)
	var interactive := combat.is_player_turn()
	for action in _action_buttons:
		var btn: Button = _action_buttons[action]
		var available: bool = action.is_available(actor)
		btn.disabled = not interactive or not available
		var tag: String = action.tag
		if action is SpellAction and not action.spell.is_cantrip():
			tag = "L%d %d/%d" % [action.spell.level, actor.spell_slots[action.spell.level] if action.spell.level < actor.spell_slots.size() else 0, actor.max_spell_slots(action.spell.level)]
		btn.text = "%s\n%s · %s" % [action.display_name, action.cost_name(), tag]
		btn.tooltip_text = action.description(actor)
		if not available:
			btn.tooltip_text += "\n" + action.unavailable_reason(actor)
		if btn.toggle_mode:
			btn.set_pressed_no_signal(combat_input.selected_action == action)
	end_turn_button.disabled = not interactive
	var locked := combat_input.has_lock()
	confirm_button.disabled = not interactive or not locked
	confirm_button.text = "CONFIRM" if locked else "Confirm"
	cancel_button.disabled = not interactive or (not locked and combat_input.selected_action == null)
	var ts := actor.turn_state
	var parts := PackedStringArray()
	parts.append("Lv %d" % actor.data.level)
	parts.append("Action %d" % ts.actions_remaining)
	if ts.attacks_remaining > 0:
		parts.append("Attacks left %d" % ts.attacks_remaining)
	parts.append("Bonus %d" % ts.bonus_actions_remaining)
	parts.append("Reaction %s" % ("ready" if ts.reaction_available else "used"))
	parts.append("Move %.1f m" % ts.movement_remaining)
	for level in range(1, actor.spell_slots.size()):
		if actor.max_spell_slots(level) > 0:
			parts.append("L%d %d/%d" % [level, actor.spell_slots[level], actor.max_spell_slots(level)])
	if actor.concentration_spell != null:
		parts.append("Concentrating: " + actor.concentration_spell.display_name)
	resources_label.text = "  ·  ".join(parts)
	_refresh_mode()


func _rebuild_buttons(actor: Actor) -> void:
	for child in action_bar.get_children():
		child.queue_free()
	_action_buttons.clear()
	_buttons_actor = actor
	for action in actor.actions:
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(118, 54)
		btn.add_theme_font_size_override("font_size", 13)
		btn.toggle_mode = action.requires_target()
		btn.pressed.connect(func(): combat_input.use_action(action))
		action_bar.add_child(btn)
		_action_buttons[action] = btn


## Shown after a fight: what everybody gained.
func show_level_ups(reports: Array) -> void:
	var lines := PackedStringArray()
	for r in reports:
		var report: Progression.Report = r
		var head := "[b]%s[/b] (%s) +%d XP" % [report.actor.display_name(), report.actor.data.class_name_text, report.xp_gained]
		var next := Progression.xp_for_next_level(report.actor)
		if next > 0:
			head += "  (%d / %d)" % [report.actor.data.xp, next]
		if report.leveled():
			head = "[color=yellow]%s -> LEVEL %d![/color]" % [head, report.new_level]
		lines.append(head)
		for l in report.lines:
			if l.begins_with("Level "):
				continue
			lines.append("    - " + l)
	level_up_text.text = "\n".join(lines)
	level_up_panel.visible = true


func set_rest_available(available: bool) -> void:
	rest_button.visible = available and GameState.is_exploring()


func _on_log_toggled(open: bool) -> void:
	log_text.visible = open
	log_toggle.text = "Log  v" if open else "Log  >"


func _on_log_message(text: String) -> void:
	_log_lines.append(text)
	if _log_lines.size() > LOG_MAX_LINES:
		_log_lines.remove_at(0)
	log_text.text = "\n".join(_log_lines)
	# Scroll to the newest line on the next frame (text needs a layout pass).
	call_deferred("_scroll_log")


func _scroll_log() -> void:
	log_text.scroll_to_line(maxi(0, log_text.get_line_count() - 1))


func _on_attack_resolved(_attacker: Node, target: Node, result: AttackResult) -> void:
	var t := target as Actor
	if t == null:
		return
	var text: String
	var color: Color
	if result.hit:
		text = "%d" % result.damage_total
		if result.critical:
			text = "CRIT %d" % result.damage_total
		if result.sneak_roll != null:
			text += " SNEAK"
		color = Color(1.0, 0.85, 0.2) if result.critical else Color(1.0, 0.3, 0.25)
		if t.visual:
			t.visual.flash(Color(1, 1, 1))
	else:
		text = "MISS (%d vs %d)" % [result.attack_roll.total(), result.target_ac]
		color = Color(0.8, 0.8, 0.85)
	FloatingText.spawn(t.get_parent(), t.global_position, text, color)


func _on_heal_applied(actor: Node, amount: int, _roll: DiceResult) -> void:
	var a := actor as Actor
	if a == null:
		return
	FloatingText.spawn(a.get_parent(), a.global_position, "+%d" % amount, Color(0.4, 1.0, 0.4))


func _on_save_resolved(actor: Node, result: SaveResult) -> void:
	var a := actor as Actor
	if a == null or result.source_name == "concentration":
		return
	var text := "%s SAVE" % result.ability.to_upper()
	text += " OK" if result.success else " FAILED"
	FloatingText.spawn(a.get_parent(), a.global_position + Vector3(0, 0.6, 0), text,
		Color(0.6, 0.9, 1.0) if result.success else Color(1.0, 0.6, 0.3))


func _on_status_applied(actor: Node, effect: StatusEffect) -> void:
	var a := actor as Actor
	if a == null or effect.data.id == &"disengaging":
		return
	FloatingText.spawn(a.get_parent(), a.global_position + Vector3(0, 1.0, 0), effect.data.display_name.to_upper(), effect.data.tint)
	_refresh_initiative()


func _on_status_removed(actor: Node, effect: StatusEffect) -> void:
	var a := actor as Actor
	if a == null:
		return
	if effect.data.id != &"disengaging" and effect.data.id != &"guided":
		EventBus.log("[color=gray]%s is no longer %s.[/color]" % [a.display_name(), effect.data.display_name])
	_refresh_initiative()


func _on_concentration_broken(actor: Node, spell: SpellData, reason: String) -> void:
	var a := actor as Actor
	if a == null:
		return
	EventBus.log("[color=orange]%s loses concentration on %s (%s).[/color]" % [a.display_name(), spell.display_name, reason])
	FloatingText.spawn(a.get_parent(), a.global_position + Vector3(0, 1.0, 0), "CONCENTRATION LOST", Color(1.0, 0.6, 0.3))


func _on_combat_ended(victory: bool) -> void:
	_action_buttons.clear()
	_buttons_actor = null
	if not victory:
		game_over_panel.visible = true
		game_over_label.text = "The party has fallen."
	_refresh_all()
