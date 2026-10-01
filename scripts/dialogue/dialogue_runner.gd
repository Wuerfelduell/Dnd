## Plays a [DialogueTree]: walks the nodes, filters and explains choices,
## rolls skill checks, applies effects to the bag and the [StoryState] and
## asks the world (via [signal world_effect]) for things only it can do
## (start a fight, send the party out of the tavern).
##
## Flow: [method start] enters the entry node → [signal line_changed] +
## [signal choices_changed] → the UI calls [method choose] with an index of
## the last choice list, or [method advance] for "Weiter" / the end of a
## terminal node → ... → [signal ended].
##
## Choice visibility follows the authoring conventions in the JSON:
## * once_answered choices disappear for the rest of the conversation once
##   taken (shared between the question menus that repeat them),
## * a skill check is rolled once per conversation (retry: false),
## * branches the author marked not_authored are hidden, never improvised,
## * once_per_run nodes (the free round of beer) happen once per game,
## * a choice that would (re)decide a quest already decided is hidden,
## * payments the party cannot afford are shown but disabled with the reason.
class_name DialogueRunner
extends RefCounted

## [param speaker] is the display name ("Wirt"), empty for the system voice.
signal line_changed(speaker: String, text: String, stage_direction: String)
## Array of views: {"index", "id", "text", "enabled", "reason", "kind", "is_check"}.
## kind is "choice", "continue" (automatic_next) or "end" (terminal node).
signal choices_changed(choices: Array)
## {"skill", "ability", "roller", "roller_name", "natural", "modifier", "total", "dc", "success", "proficient"}
signal check_resolved(result: Dictionary)
## An effect the runner cannot apply itself: start_combat, leave_location, set_navigation_hint.
signal world_effect(effect: Dictionary)
signal ended(reason: String)

## Used where the author left the DC open (null).
const DEFAULT_DC := 12
## Items the dialogue hands out, by the id used in the JSON.
const ITEM_IDS := {"beer": &"beer", "stew": &"stew", "innkeeper_copper_mug": &"innkeeper_copper_mug"}
## Navigation labels for additional entry points (not spoken lines).
const ENTRY_LABELS := {"return_mug": "[Den Kupferkrug zurückgeben]"}
const CONTINUE_LABEL := "Weiter"
const END_LABEL := "Gespräch beenden"
const SKILL_NAMES := {"intimidation": "Einschüchtern", "persuasion": "Überzeugen", "deception": "Täuschen"}

var tree: DialogueTree
var inventory: Inventory
var story: StoryState
## Who can roll skill checks (alive party members).
var party: Array[Actor] = []
var default_dc: int = DEFAULT_DC

var is_running: bool = false
var current_id: String = ""
var last_check: Dictionary = {}
## The node the conversation started at (entry choices are only added there).
var _entry_id: String = ""
var _answered: Dictionary = {}
var _pending_auto: String = ""
var _pending_end: bool = false
var _views: Array = []
var _choices: Array = []  # the real choice dictionaries behind the views


func _init(p_tree: DialogueTree, p_inventory: Inventory, p_story: StoryState, p_party: Array[Actor] = []) -> void:
	tree = p_tree
	inventory = p_inventory
	story = p_story
	party = p_party


## Begins at [param entry_id] (default: the tree's entry node).
func start(entry_id: String = "") -> void:
	if tree == null:
		ended.emit("no_tree")
		return
	is_running = true
	_answered.clear()
	last_check = {}
	_entry_id = entry_id if entry_id != "" else tree.entry
	_enter(_entry_id)


## The choice views of the current node (same as the last [signal choices_changed]).
func choices() -> Array:
	return _views


## Takes choice [param index] of the current list. False when refused.
func choose(index: int) -> bool:
	if not is_running or index < 0 or index >= _views.size():
		return false
	var view: Dictionary = _views[index]
	if not view["enabled"]:
		return false
	match view["kind"]:
		"continue", "end":
			advance()
			return true
	return _take(_choices[index])


## Continues after a node with automatic_next, or ends after a terminal node.
func advance() -> void:
	if not is_running:
		return
	if _pending_auto != "":
		var next := _pending_auto
		_pending_auto = ""
		_enter(next)
	elif _pending_end:
		end("terminal")


func end(reason: String = "player") -> void:
	if not is_running:
		return
	is_running = false
	_views = []
	_choices = []
	_pending_auto = ""
	_pending_end = false
	ended.emit(reason)


# --- Nodes -----------------------------------------------------------------

func _enter(node_id: String) -> void:
	if not tree.has_node(node_id):
		push_warning("Dialogue '%s': node '%s' missing" % [tree.id, node_id])
		end("missing_node")
		return
	var node: Dictionary = tree.node(node_id)
	if DialogueTree.is_switch(node):
		var target := _resolve_switch(node)
		if target == "":
			end("switch_without_target")
		else:
			_enter(target)
		return
	if not DialogueTree.is_authored(node):
		EventBus.log("[color=gray]This part of the conversation has not been written yet (%s).[/color]" % node_id)
		end("not_authored")
		return
	if node.has("requires") and not node_requirements_met(node):
		end("requirements_not_met")
		return
	current_id = node_id
	var skip_effects := false
	if node.get("once_per_run", false):
		skip_effects = story.is_consumed(node_id)
		story.consume(node_id)
	if not skip_effects:
		for effect in node.get("effects", []):
			_apply_effect(effect)
			if not is_running:
				return
	var text := str(node.get("text", ""))
	var stage := str(node.get("stage_direction", ""))
	var has_content := text != "" or stage != ""
	if has_content:
		line_changed.emit(tree.speaker_name(str(node.get("speaker", "system"))), text, stage)
	_pending_auto = str(node["automatic_next"]) if node.get("automatic_next") != null else ""
	_pending_end = bool(node.get("terminal", false))
	if _pending_auto != "":
		if not has_content:
			advance()
			return
		_set_views([_nav_view(CONTINUE_LABEL, "continue")], [{}])
		return
	if _pending_end:
		if not has_content:
			end("terminal")
			return
		_set_views([_nav_view(END_LABEL, "end")], [{}])
		return
	_build_choice_views(node)


func _resolve_switch(node: Dictionary) -> String:
	var sw: Dictionary = node["switch"]
	var key := ""
	if sw.has("flag"):
		key = str(story.get_flag(str(sw["flag"]), 0))
	elif sw.has("quest"):
		var field := str(sw.get("field", "status"))
		if field == "status":
			key = story.quest_status(str(sw["quest"]))
		else:
			key = str(story.quests.get(str(sw["quest"]), {}).get(field, ""))
	var cases: Dictionary = sw.get("cases", {})
	if cases.has(key):
		return str(cases[key])
	return str(sw["default"]) if sw.get("default") != null else ""


## Requirements on a node (used by additional entries such as the mug return).
func node_requirements_met(node: Dictionary) -> bool:
	var req: Dictionary = node.get("requires", {})
	if req.has("item"):
		var item := Inventory.find_item(ITEM_IDS.get(str(req["item"]), StringName(str(req["item"]))))
		if item == null or inventory.count(item) < int(req.get("quantity", 1)):
			return false
	if req.has("quest_not_completed") and story.quest_completed(str(req["quest_not_completed"])):
		return false
	return true


# --- Choices ---------------------------------------------------------------

func _build_choice_views(node: Dictionary) -> void:
	var views: Array = []
	var choices: Array = []
	for choice in node.get("choices", []):
		if not _choice_visible(choice):
			continue
		var verdict := _choice_enabled(choice)
		views.append({
			"index": views.size(), "id": str(choice.get("id", "")), "text": str(choice.get("text", "")),
			"enabled": verdict["enabled"], "reason": verdict["reason"], "kind": "choice", "is_check": choice.has("check"),
		})
		choices.append(choice)
	if current_id == _entry_id:
		for alias in tree.additional_entries:
			var target := str(tree.additional_entries[alias])
			if not _entry_available(target):
				continue
			views.append({
				"index": views.size(), "id": str(alias), "text": str(ENTRY_LABELS.get(alias, "[%s]" % alias)),
				"enabled": true, "reason": "", "kind": "choice", "is_check": false,
			})
			choices.append({"id": alias, "text": "", "next": target, "effects": []})
	if views.is_empty():
		# Nothing left to say (everything hidden): never trap the player.
		views.append(_nav_view(END_LABEL, "end"))
		choices.append({})
		_pending_end = true
	_set_views(views, choices)


func _set_views(views: Array, choices: Array) -> void:
	_views = views
	_choices = choices
	choices_changed.emit(_views)


func _nav_view(label: String, kind: String) -> Dictionary:
	return {"index": 0, "id": kind, "text": label, "enabled": true, "reason": "", "kind": kind, "is_check": false}


func _answer_key(choice: Dictionary) -> String:
	return "%s>%s" % [str(choice.get("id", "")), str(choice.get("next", ""))]


func _choice_visible(choice: Dictionary) -> bool:
	var key := _answer_key(choice)
	if (choice.get("once_answered", false) or choice.has("check")) and _answered.has(key):
		return false
	for target in DialogueTree.choice_targets(choice):
		var node := _resolve_node(target)
		if node.is_empty() or not DialogueTree.is_authored(node):
			return false
		if node.get("once_per_run", false) and story.is_consumed(target) and not choice.has("check"):
			return false
	if choice.has("check"):
		var success := _resolve_node(str(choice["check"].get("success", "")))
		if success.get("once_per_run", false) and story.is_consumed(str(choice["check"]["success"])):
			return false
	if _decides_settled_quest(choice):
		return false
	return true


## Follows switch nodes to the node that would actually be shown.
func _resolve_node(node_id: String) -> Dictionary:
	var node := tree.node(node_id)
	var hops := 0
	while DialogueTree.is_switch(node) and hops < 8:
		var target := _resolve_switch(node)
		node = tree.node(target)
		hops += 1
	return node


## A choice whose effects (or whose next node's choices) would set the status
## of a quest that already has one: the innkeeper does not renegotiate.
func _decides_settled_quest(choice: Dictionary) -> bool:
	if _sets_settled_quest(choice.get("effects", [])):
		return true
	if choice.get("next") != null:
		var next := tree.node(str(choice["next"]))
		for sub in next.get("choices", []):
			if _sets_settled_quest(sub.get("effects", [])):
				return true
	return false


func _sets_settled_quest(effects: Array) -> bool:
	for effect in effects:
		if str(effect.get("type", "")) == "set_quest" and story.quest_status(str(effect.get("quest", ""))) != "":
			return true
	return false


func _entry_available(target: String) -> bool:
	var node := tree.node(target)
	if node.is_empty():
		return false
	if node.has("requires") and not node_requirements_met(node):
		return false
	var shown := _resolve_node(target)
	return not shown.is_empty() and DialogueTree.is_authored(shown)


## {"enabled": bool, "reason": String} for a visible choice.
func _choice_enabled(choice: Dictionary) -> Dictionary:
	var req: Dictionary = choice.get("requires", {})
	var needed := int(req.get("minimum_copper", 0))
	needed = maxi(needed, _copper_needed(choice.get("effects", [])))
	if needed > inventory.copper:
		return {"enabled": false, "reason": "Nicht genug Münzen (%s nötig, ihr habt %s)." % [Inventory.format_money(needed), Inventory.format_money(inventory.copper)]}
	if req.get("food_service_allowed", false) and story.get_flag("food_service_refused", false):
		return {"enabled": false, "reason": "Die Köchin bedient euch nicht mehr."}
	return {"enabled": true, "reason": ""}


func _copper_needed(effects: Array) -> int:
	var sum := 0
	for effect in effects:
		if str(effect.get("type", "")) == "spend_currency" and effect.get("require_funds", true):
			sum += int(effect.get("amount", 0))
	return sum


func _take(choice: Dictionary) -> bool:
	# Payments are atomic: nothing happens when the purse is too small.
	if _copper_needed(choice.get("effects", [])) > inventory.copper:
		EventBus.log("[color=gray]Not enough coin for that.[/color]")
		return false
	var key := _answer_key(choice)
	if choice.get("once_answered", false) or choice.has("check"):
		_answered[key] = true
	for effect in choice.get("effects", []):
		_apply_effect(effect)
		if not is_running:
			return true
	if choice.has("check"):
		var check: Dictionary = choice["check"]
		var result := roll_check(check)
		check_resolved.emit(result)
		_enter(str(check["success"] if result["success"] else check["failure"]))
		return true
	if choice.get("end_conversation", false):
		end("choice")
		return true
	if choice.get("next") != null:
		_enter(str(choice["next"]))
		return true
	end("choice")
	return true


# --- Skill checks ------------------------------------------------------------

## d20 + ability modifier (+ proficiency bonus if the roller has the skill)
## against the DC (default when the author left it null). The party member with
## the best bonus speaks.
func roll_check(check: Dictionary) -> Dictionary:
	var skill := str(check.get("skill", ""))
	var ability := str(check.get("ability", "charisma"))
	var roller := best_roller(skill, ability)
	var modifier := 0
	var proficient := false
	if roller != null:
		modifier = roller.data.stats.ability_mod(ability)
		proficient = roller.data.stats.has_skill(skill)
		if proficient:
			modifier += roller.data.stats.proficiency_bonus
	var dc := int(check["dc"]) if check.get("dc") != null else default_dc
	var roll := Dice.d20(modifier)
	var result := {
		"skill": skill, "ability": ability, "roller": roller,
		"roller_name": roller.display_name() if roller != null else "Party",
		"natural": roll.dice_sum(), "modifier": modifier, "total": roll.total(),
		"dc": dc, "success": roll.total() >= dc, "proficient": proficient,
	}
	last_check = result
	EventBus.log("[color=aqua]%s %s check: %s vs DC %d - %s.[/color]" % [
		result["roller_name"], skill.capitalize(), roll.describe(), dc, "success" if result["success"] else "failure"])
	return result


## The living party member with the highest bonus; on a tie the one trained
## in the skill speaks.
func best_roller(skill: String, ability: String) -> Actor:
	var best: Actor = null
	var best_bonus := -INF
	var best_trained := false
	for member in party:
		if member == null or not member.is_alive():
			continue
		var trained: bool = member.data.stats.has_skill(skill)
		var bonus := float(member.data.stats.ability_mod(ability))
		if trained:
			bonus += member.data.stats.proficiency_bonus
		if bonus > best_bonus or (bonus == best_bonus and trained and not best_trained):
			best_bonus = bonus
			best_trained = trained
			best = member
	return best


static func skill_name_de(skill: String) -> String:
	return SKILL_NAMES.get(skill, skill.capitalize())


# --- Effects -----------------------------------------------------------------

func _apply_effect(effect: Dictionary) -> void:
	var type := str(effect.get("type", ""))
	match type:
		"set_flag":
			story.set_flag(str(effect["flag"]), effect.get("value", true))
		"increment_flag":
			story.increment_flag(str(effect["flag"]), int(effect.get("amount", 1)))
		"spend_currency":
			var amount := int(effect.get("amount", 0))
			if inventory.spend_copper(amount):
				EventBus.log("[color=yellow]The party pays %s.[/color]" % Inventory.format_money(amount))
			elif effect.get("require_funds", true):
				EventBus.log("[color=gray]Not enough coin to pay %s.[/color]" % Inventory.format_money(amount))
		"give_currency":
			var amount := int(effect.get("amount", 0))
			inventory.add_copper(amount)
			EventBus.log("[color=yellow]The party receives %s.[/color]" % Inventory.format_money(amount))
			EventBus.loot_gained.emit(amount, [])
		"give_item":
			var item := _item(str(effect["item"]))
			var quantity := int(effect.get("quantity", 1))
			if item != null:
				inventory.add(item, quantity)
				EventBus.log("[color=yellow]The party receives %d x %s.[/color]" % [quantity, item.display_name])
				var items: Array = []
				for _i in quantity:
					items.append(item)
				EventBus.loot_gained.emit(0, items)
		"remove_item":
			var item := _item(str(effect["item"]))
			if item != null and inventory.remove(item, int(effect.get("quantity", 1))):
				EventBus.log("[color=gray]%s handed over.[/color]" % item.display_name)
		"set_quest":
			var quest := str(effect["quest"])
			var status := str(effect.get("status", "accepted"))
			story.set_quest(quest, status, int(effect.get("reward_copper", 0)), int(effect.get("reward_beer", 0)))
			EventBus.log("[color=yellow]Quest '%s': %s.[/color]" % [quest.replace("_", " "), status])
		"give_quest_reward":
			var reward := story.quest_reward(str(effect["quest"]))
			var items: Array = []
			if reward["copper"] > 0:
				inventory.add_copper(reward["copper"])
			var beer := _item("beer")
			if reward["beer"] > 0 and beer != null:
				inventory.add(beer, reward["beer"])
				for _i in reward["beer"]:
					items.append(beer)
			EventBus.log("[color=yellow]Reward: %s%s.[/color]" % [Inventory.format_money(reward["copper"]), (" and %d beer" % reward["beer"]) if reward["beer"] > 0 else ""])
			EventBus.loot_gained.emit(reward["copper"], items)
		"complete_quest":
			story.complete_quest(str(effect["quest"]))
			EventBus.log("[color=lime]Quest '%s' completed.[/color]" % str(effect["quest"]).replace("_", " "))
		"quest_hint":
			story.set_flag("hint_" + str(effect["quest"]), true)
			EventBus.log("[color=gray]Hint noted: %s.[/color]" % str(effect["quest"]).replace("_", " "))
		"set_navigation_hint":
			story.set_navigation_hint(str(effect["destination"]), str(effect.get("presented_as", "")))
			world_effect.emit(effect)
		"start_combat":
			world_effect.emit(effect)
			end("combat")
		"leave_location":
			world_effect.emit(effect)
		_:
			push_warning("Dialogue '%s': unknown effect '%s'" % [tree.id, type])


func _item(dialogue_item: String) -> ItemData:
	return Inventory.find_item(ITEM_IDS.get(dialogue_item, StringName(dialogue_item)))
