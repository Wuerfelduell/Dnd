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
signal next_wave_requested
signal long_rest_requested

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
@onready var next_wave_button: Button = %NextWaveButton
@onready var long_rest_button: Button = %LongRestButton
@onready var rotate_left_button: Button = %RotateLeftButton
@onready var rotate_right_button: Button = %RotateRightButton
@onready var zoom_in_button: Button = %ZoomInButton
@onready var zoom_out_button: Button = %ZoomOutButton
@onready var joystick: HudJoystick = %Joystick
@onready var bag_button: Button = %BagButton
@onready var inventory_panel: PanelContainer = %InventoryPanel
@onready var inventory_title: Label = %InventoryTitle
@onready var inventory_hint: Label = %InventoryHint
@onready var inventory_list: VBoxContainer = %InventoryList
@onready var close_bag_button: Button = %CloseBagButton

const SFX := {
	"potion": preload("res://assets/shop/sounds/potion_drink.wav"),
	"coins": preload("res://assets/shop/sounds/coin_jingle.wav"),
	"chest": preload("res://assets/shop/sounds/chest_open.wav"),
}
var _sfx: AudioStreamPlayer
var world: World


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
	EventBus.item_used.connect(_on_item_used)
	EventBus.loot_gained.connect(_on_loot_gained)
	EventBus.chest_reached.connect(func(_c): _play("chest"))
	GameState.state_changed.connect(func(_n, _o): _refresh_mode())
	_sfx = AudioStreamPlayer.new()
	_sfx.name = "Sfx"
	add_child(_sfx)
	world = get_parent() as World
	if world != null:
		world.inventory.changed.connect(_refresh_inventory)
	bag_button.pressed.connect(func(): _show_inventory(not inventory_panel.visible))
	close_bag_button.pressed.connect(func(): _show_inventory(false))
	_refresh_inventory()

	combat.combat_started.connect(func(_p): _refresh_all(); _refresh_inventory())
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
	next_wave_button.pressed.connect(func(): next_wave_requested.emit())
	long_rest_button.pressed.connect(func(): long_rest_requested.emit())
	rotate_left_button.pressed.connect(func(): camera_rig.rotate_by(45.0))
	rotate_right_button.pressed.connect(func(): camera_rig.rotate_by(-45.0))
	zoom_in_button.pressed.connect(func(): camera_rig.zoom_by(-3.0))
	zoom_out_button.pressed.connect(func(): camera_rig.zoom_by(3.0))
	log_toggle.toggled.connect(_on_log_toggled)
	log_toggle.button_pressed = true
	game_over_panel.visible = false
	level_up_panel.visible = false
	next_wave_button.visible = false
	long_rest_button.visible = false
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
				hint_label.text = "Joystick or tap the ground to walk. Stay in the dark to sneak closer. Camera buttons on the right."
			else:
				hint_label.text = "WASD, joystick or click the ground to walk. Stay in the dark to sneak closer. Q/E rotate camera, wheel zoom."
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
			next_wave_button.visible = false
			long_rest_button.visible = false
		GameState.State.GAME_OVER:
			mode_label.text = "GAME OVER"
			hint_label.text = "Tap Restart to try again." if _touch else "Press R or Restart to try again."
			action_panel.visible = false
			joystick.visible = false
			next_wave_button.visible = false
			long_rest_button.visible = false


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
		var tag: String = action.tag_for(actor)
		if action is SpellAction and not action.spell.is_cantrip():
			tag = "L%d %d/%d" % [action.spell.level, actor.spell_slots[action.spell.level] if action.spell.level < actor.spell_slots.size() else 0, actor.max_spell_slots(action.spell.level)]
		btn.text = "%s\n%s · %s" % [action.display_name, action.cost_name(), tag]
		if action is UseItemAction:
			btn.icon = action.item.icon
			btn.expand_icon = true
			btn.add_theme_constant_override("icon_max_width", 28)
			btn.modulate = action.item.icon_tint if available else Color.WHITE
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
	for kind in actor.ammo:
		parts.append("%d %s" % [actor.ammo[kind], kind])
	if actor.concentration_spell != null:
		parts.append("Concentrating: " + actor.concentration_spell.display_name)
	if Lighting.is_in_shadow(actor):
		parts.append("In the dark" + (" (revealed)" if ts.revealed else " (unseen)"))
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


## [param long_rest] additionally offers the full recovery.
func set_rest_available(available: bool, long_rest: bool, wave: int) -> void:
	next_wave_button.visible = available and GameState.is_exploring()
	next_wave_button.text = "Short rest & wave %d" % (wave + 1)
	long_rest_button.visible = available and long_rest and GameState.is_exploring()


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


# --- Bag -----------------------------------------------------------------

func _play(key: String) -> void:
	if _sfx != null and SFX.has(key):
		_sfx.stream = SFX[key]
		_sfx.play()


func _show_inventory(open: bool) -> void:
	inventory_panel.visible = open
	if open:
		_refresh_inventory()


func _refresh_inventory() -> void:
	if world == null:
		return
	var bag := world.inventory
	bag_button.text = "Bag · %d g" % bag.gold
	inventory_title.text = "Party bag · %d gold" % bag.gold
	if not inventory_panel.visible:
		return
	for child in inventory_list.get_children():
		child.queue_free()
	var items := bag.items()
	if items.is_empty():
		var empty := Label.new()
		empty.text = "Nothing but lint."
		empty.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		inventory_list.add_child(empty)
	for item in items:
		var row := HBoxContainer.new()
		row.custom_minimum_size = Vector2(0, 48)
		var icon := TextureRect.new()
		icon.texture = item.icon
		icon.modulate = item.icon_tint
		icon.custom_minimum_size = Vector2(40, 40)
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(icon)
		var label := Label.new()
		label.text = "%s  x%d\n%s" % [item.display_name, bag.count(item), item.description]
		label.add_theme_font_size_override("font_size", 13)
		label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		row.add_child(label)
		if item.is_consumable():
			var use := Button.new()
			use.text = "Use"
			use.custom_minimum_size = Vector2(72, 40)
			use.disabled = combat.is_active
			use.tooltip_text = "In combat: use it from the action bar (bonus action)." if combat.is_active else "Goes to the party member who needs it most."
			use.pressed.connect(func(): world.use_item_from_bag(item))
			row.add_child(use)
		inventory_list.add_child(row)
	inventory_hint.text = "In combat potions are a bonus action on the action bar." if combat.is_active else "Potions go to whoever needs them most. Tap a chest in the world to loot it."


func _on_item_used(_user: Node, target: Node, item: ItemData) -> void:
	_play("potion")
	var t := target as Actor
	if t != null:
		FloatingText.spawn(t.get_parent(), t.global_position + Vector3(0, 1.2, 0), item.display_name.to_upper(), Color(0.6, 0.9, 1.0))
	_refresh_inventory()


func _on_loot_gained(gold: int, items: Array) -> void:
	_play("coins")
	var who := world.leader if world != null else null
	if who != null:
		var text := "+%d GOLD" % gold if gold > 0 else ""
		if not items.is_empty():
			text += (" " if text != "" else "") + "+%d ITEM%s" % [items.size(), "S" if items.size() > 1 else ""]
		FloatingText.spawn(who.get_parent(), who.global_position + Vector3(0, 1.4, 0), text, Color(1.0, 0.85, 0.3))
	_refresh_inventory()


func _on_combat_ended(victory: bool) -> void:
	_action_buttons.clear()
	_buttons_actor = null
	_refresh_inventory()
	if not victory:
		game_over_panel.visible = true
		game_over_label.text = "The party has fallen."
	_refresh_all()
