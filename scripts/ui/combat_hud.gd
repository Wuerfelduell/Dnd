## Heads-up display: mode banner, initiative list, action bar, dice log,
## floating combat text and the game-over overlay.
class_name CombatHud
extends CanvasLayer

const LOG_MAX_LINES := 200

var combat: CombatManager
var combat_input: PlayerCombatInput
var player: Actor

var _action_buttons: Dictionary = {}  # CombatAction -> Button
var _log_lines: PackedStringArray = PackedStringArray()

@onready var mode_label: Label = %ModeLabel
@onready var hint_label: Label = %HintLabel
@onready var initiative_box: VBoxContainer = %InitiativeList
@onready var initiative_panel: PanelContainer = %InitiativePanel
@onready var action_bar: HBoxContainer = %ActionBar
@onready var action_panel: PanelContainer = %ActionPanel
@onready var resources_label: Label = %ResourcesLabel
@onready var end_turn_button: Button = %EndTurnButton
@onready var log_text: RichTextLabel = %LogText
@onready var game_over_panel: PanelContainer = %GameOverPanel
@onready var game_over_label: Label = %GameOverLabel


func setup(p_combat: CombatManager, p_input: PlayerCombatInput, p_player: Actor) -> void:
	combat = p_combat
	combat_input = p_input
	player = p_player

	EventBus.log_message.connect(_on_log_message)
	EventBus.attack_resolved.connect(_on_attack_resolved)
	EventBus.heal_applied.connect(_on_heal_applied)
	GameState.state_changed.connect(func(_n, _o): _refresh_mode())

	combat.combat_started.connect(func(_p): _refresh_all())
	combat.turn_started.connect(func(_a): _refresh_all())
	combat.turn_ended.connect(func(_a): _refresh_all())
	combat.state_updated.connect(_refresh_all)
	combat.combat_ended.connect(_on_combat_ended)
	combat_input.selected_action_changed.connect(func(_a): _refresh_action_bar())

	end_turn_button.pressed.connect(func(): combat.end_turn())
	game_over_panel.visible = false
	_refresh_all()


func _refresh_all() -> void:
	_refresh_mode()
	_refresh_initiative()
	_refresh_action_bar()


func _refresh_mode() -> void:
	match GameState.state:
		GameState.State.EXPLORATION:
			mode_label.text = "EXPLORATION"
			hint_label.text = "WASD move · Q/E rotate camera · wheel zoom"
			initiative_panel.visible = false
			action_panel.visible = false
		GameState.State.COMBAT:
			var who := combat.active_actor.display_name() if combat.active_actor else "…"
			mode_label.text = "COMBAT · Round %d · %s's turn" % [combat.initiative.round_number, who]
			if combat.is_player_turn():
				if combat_input.selected_action != null:
					hint_label.text = "Click an enemy to use %s · right click / Esc to cancel" % combat_input.selected_action.display_name
				else:
					hint_label.text = "Click ground to move · click enemy to attack · Space = end turn"
			else:
				hint_label.text = "Enemy is acting…"
			initiative_panel.visible = true
			action_panel.visible = true
		GameState.State.GAME_OVER:
			mode_label.text = "GAME OVER"
			hint_label.text = "Press R to restart"
			action_panel.visible = false


func _refresh_initiative() -> void:
	for child in initiative_box.get_children():
		child.queue_free()
	if not combat.is_active:
		return
	var header := Label.new()
	header.text = "Initiative"
	header.add_theme_font_size_override("font_size", 20)
	initiative_box.add_child(header)
	for e in combat.initiative.entries:
		var lbl := Label.new()
		var marker := "▶ " if e.actor == combat.active_actor else "   "
		var hp := "DOWN" if not e.actor.is_alive() else "%d/%d HP" % [e.actor.current_hp, e.actor.max_hp()]
		lbl.text = "%s%s (%d)  %s" % [marker, e.actor.display_name(), e.total, hp]
		if not e.actor.is_alive():
			lbl.modulate = Color(0.55, 0.55, 0.55)
		elif e.actor == combat.active_actor:
			lbl.modulate = Color(1.0, 0.9, 0.3)
		initiative_box.add_child(lbl)


func _refresh_action_bar() -> void:
	var actor := combat.active_actor
	var show := combat.is_active and actor != null and actor.is_player()
	action_panel.visible = show
	if not show:
		return
	# Rebuild buttons if the actor changed.
	if _action_buttons.is_empty() or not _action_buttons.values()[0].is_inside_tree() \
			or _action_buttons.keys()[0] not in actor.actions:
		for child in action_bar.get_children():
			if child != end_turn_button:
				child.queue_free()
		_action_buttons.clear()
		for action in actor.actions:
			var btn := Button.new()
			btn.custom_minimum_size = Vector2(150, 44)
			btn.toggle_mode = action.requires_target
			btn.pressed.connect(func(): combat_input.use_action(action))
			action_bar.add_child(btn)
			action_bar.move_child(btn, action_bar.get_child_count() - 2)
			_action_buttons[action] = btn
	var interactive := combat.is_player_turn()
	for action in _action_buttons:
		var btn: Button = _action_buttons[action]
		var available: bool = action.is_available(actor)
		btn.disabled = not interactive or not available
		btn.text = "%s\n[%s]" % [action.display_name, action.cost_name()]
		btn.tooltip_text = action.description(actor)
		if not available:
			btn.tooltip_text += "\n" + action.unavailable_reason(actor)
		if btn.toggle_mode:
			btn.set_pressed_no_signal(combat_input.selected_action == action)
	end_turn_button.disabled = not interactive
	var ts := actor.turn_state
	resources_label.text = "Action: %s   Bonus: %s   Movement: %.1f m" % [
		"✔" if ts.action_available else "✘",
		"✔" if ts.bonus_action_available else "✘",
		ts.movement_remaining]
	_refresh_mode()


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


func _on_combat_ended(victory: bool) -> void:
	_action_buttons.clear()
	if not victory:
		game_over_panel.visible = true
		game_over_label.text = "You have fallen.\nPress R to restart."
	_refresh_all()
