## Plays a [DialogueTree]: walks the nodes, filters and explains choices,
## rolls skill checks, applies effects to the bag and the [StoryState] and
## asks the world (via [signal world_effect]) for things only it can do
## (start a fight, send the party out of the tavern, open the shop).
##
## Flow: [method start] enters the entry node → [signal line_changed] +
## [signal choices_changed] → the UI calls [method choose] with an index of
## the last choice list, or [method advance] for "Weiter" / the end of a
## terminal node → ... → [signal ended].
##
## Choice visibility follows the authoring conventions in the JSON files:
## * once_answered choices disappear for the rest of the conversation once
##   taken (shared between the question menus that repeat them),
## * a skill check is rolled once per conversation (retry: false); a check
##   with an attempt_key is rolled once per run and never offered again,
## * requirements on flags, items, quests and living bystanders hide a
##   choice; money and refused food service only grey it out with the reason,
## * branches the author marked not_authored are hidden, never improvised,
## * once_per_run / once_per_save nodes apply their effects once per run,
## * a choice that would (re)decide a quest already decided is hidden,
## * payments are atomic: nothing happens when the purse is too small.
class_name DialogueRunner
extends RefCounted

## [param speaker] is the display name ("Wirt"), empty for the system voice.
signal line_changed(speaker: String, text: String, stage_direction: String)
## Array of views: {"index", "id", "text", "enabled", "reason", "kind", "is_check"}.
## kind is "choice", "continue" (automatic_next / a fight after the line) or "end" (terminal node).
signal choices_changed(choices: Array)
## {"skill", "ability", "roller", "roller_name", "natural", "modifier", "total", "dc", "success", "proficient"}
signal check_resolved(result: Dictionary)
## An effect the runner cannot apply itself: start_combat, leave_location,
## set_navigation_hint, open_shop, serve_drink.
signal world_effect(effect: Dictionary)
signal ended(reason: String)

## Used where the author left the DC open (null).
const DEFAULT_DC := 12
## Items the dialogues hand out, by the id used in the JSON (others map 1:1 to data/items/<id>.tres).
const ITEM_IDS := {"beer": &"beer", "stew": &"stew", "innkeeper_copper_mug": &"innkeeper_copper_mug"}
## Navigation labels for additional entry points (not spoken lines).
const ENTRY_LABELS := {
	"return_mug": "[Den Kupferkrug zurückgeben]",
	"complain_about_ring": "[Wegen des Rings beschweren]",
	"claim_cave_reward": "[Die Höhlenbelohnung einfordern]",
}
const CONTINUE_LABEL := "Weiter"
const END_LABEL := "Gespräch beenden"
const SKILL_NAMES := {
	"intimidation": "Einschüchtern", "persuasion": "Überzeugen", "deception": "Täuschen",
	"perception": "Wahrnehmung", "insight": "Menschenkenntnis", "survival": "Überlebenskunst",
	"arcana": "Arkane Kunde", "athletics": "Athletik", "investigation": "Nachforschen",
}
## Requirements that hide a choice (everything else only disables it).
const HIDING_REQUIREMENTS := ["npc_alive", "flag_true", "flag_false", "item", "quest_not_accepted", "quest_not_completed", "quest_accepted_or_completed"]

var tree: DialogueTree
var inventory: Inventory
var story: StoryState
## Who can roll skill checks (alive party members).
var party: Array[Actor] = []
var default_dc: int = DEFAULT_DC
## Is the bystander with this actor reference alive and still a bystander?
## Set by the world; the default knows nobody is missing.
var npc_available: Callable = func(_reference: String) -> bool: return true
## Is a quest objective ("cave_cleared") fulfilled? Set by the world.
var objective_met: Callable = func(_objective: String) -> bool: return false

var is_running: bool = false
var current_id: String = ""
var last_check: Dictionary = {}
## The first spoken node of this conversation (entry choices are only added there).
var _entry_id: String = ""
var _entry_resolved: String = ""
var _answered: Dictionary = {}
var _pending_auto: String = ""
var _pending_end: bool = false
## A start_combat effect waiting until the player has read the line.
var _pending_combat: Dictionary = {}
var _views: Array = []
var _choices: Array = []  # the real choice dictionaries behind the views


func _init(p_tree: DialogueTree, p_inventory: Inventory, p_story: StoryState, p_party: Array[Actor] = []) -> void:
	tree = p_tree
	inventory = p_inventory
	story = p_story
	party = p_party


## Begins at [param entry_id]: a node id, an additional entry alias
## ("return_mug") or empty for the tree's entry node.
func start(entry_id: String = "") -> void:
	if tree == null:
		ended.emit("no_tree")
		return
	is_running = true
	_answered.clear()
	last_check = {}
	_pending_combat = {}
	if tree.additional_entries.has(entry_id):
		entry_id = str(tree.additional_entries[entry_id])
	_entry_id = entry_id if entry_id != "" else tree.entry
	_entry_resolved = ""
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


## Continues after a node with automatic_next (or a fight), or ends after a terminal node.
func advance() -> void:
	if not is_running:
		return
	if not _pending_combat.is_empty():
		var effect := _pending_combat
		_pending_combat = {}
		world_effect.emit(effect)
		end("combat")
	elif _pending_auto != "":
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
	_pending_combat = {}
	ended.emit(reason)


# --- Nodes -----------------------------------------------------------------

func _enter(node_id: String) -> void:
	if not tree.has_node(node_id):
		push_warning("Dialogue '%s': node '%s' missing" % [tree.id, node_id])
		end("missing_node")
		return
	var node: Dictionary = tree.node(node_id)
	if node.has("requires") and not node_requirements_met(node):
		end("requirements_not_met")
		return
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
	current_id = node_id
	if _entry_resolved == "":
		_entry_resolved = node_id
	var skip_effects := false
	if node.get("once_per_run", false) or node.get("once_per_save", false):
		skip_effects = story.is_consumed(_consumed_key(node_id))
		story.consume(_consumed_key(node_id))
	var deferred_combat: Dictionary = {}
	if not skip_effects:
		for effect in node.get("effects", []):
			if str(effect.get("type", "")) == "start_combat":
				deferred_combat = effect
				continue
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
	if not deferred_combat.is_empty():
		# The fight starts once the player has read the line (if there is one).
		_pending_combat = deferred_combat
		if not has_content:
			advance()
			return
		_set_views([_nav_view(CONTINUE_LABEL, "continue")], [{}])
		return
	if _pending_auto != "":
		if not has_content:
			advance()
			return
		_set_views([_nav_view(CONTINUE_LABEL, "continue")], [{}])
		return
	if _pending_end and not has_content:
		end("terminal")
		return
	# A terminal node still offers the additional entries (a refused customer
	# may complain about the ring) and then "Gespräch beenden".
	_build_choice_views(node)


## once_per_run nodes are remembered per dialogue (two files may reuse a node id).
func _consumed_key(node_id: String) -> String:
	return "%s/%s" % [tree.id, node_id]


func _resolve_switch(node: Dictionary) -> String:
	var sw: Dictionary = node["switch"]
	var key := ""
	if sw.has("flag"):
		key = str(story.get_flag(str(sw["flag"]), 0))
	elif sw.has("quest"):
		var quest := str(sw["quest"])
		var field := str(sw.get("field", "status"))
		match field:
			"status":
				key = story.quest_status(quest)
			"claim_state":
				key = claim_state(quest)
			_:
				key = str(story.quests.get(quest, {}).get(field, ""))
	var cases: Dictionary = sw.get("cases", {})
	if cases.has(key):
		return str(cases[key])
	return str(sw["default"]) if sw.get("default") != null else ""


## "ready" (accepted and the objective is done), "accepted_incomplete",
## "completed" or "" for a quest nobody took.
func claim_state(quest: String) -> String:
	var status := story.quest_status(quest)
	if status == "completed" or story.quest_claimed(quest):
		return "completed"
	if status != "accepted":
		return ""
	var objective := quest_objective(quest)
	if objective == "" or objective_met.call(objective):
		return "ready"
	return "accepted_incomplete"


## The objective a quest's reward claim verifies ("cave_cleared"), read from
## the claim_quest_reward effects of this tree; "" when it has none.
func quest_objective(quest: String) -> String:
	for node_id in tree.nodes:
		for effect in tree.node(node_id).get("effects", []):
			if str(effect.get("type", "")) == "claim_quest_reward" and str(effect.get("quest", "")) == quest:
				return str(effect.get("require_objective", ""))
	return ""


## Requirements on a node or a choice (the keys that hide; money and food
## service are handled by [method _choice_enabled]).
func node_requirements_met(node: Dictionary) -> bool:
	return requirements_met(node.get("requires", {}))


func requirements_met(req: Dictionary) -> bool:
	if req.has("item"):
		var item := _item(str(req["item"]))
		if item == null or inventory.count(item) < int(req.get("quantity", 1)):
			return false
	if req.has("quest_not_completed") and story.quest_completed(str(req["quest_not_completed"])):
		return false
	if req.has("quest_not_accepted") and story.quest_accepted(str(req["quest_not_accepted"])):
		return false
	if req.has("quest_accepted_or_completed") and not story.quest_accepted(str(req["quest_accepted_or_completed"])):
		return false
	if req.has("flag_true") and not bool(story.get_flag(str(req["flag_true"]), false)):
		return false
	if req.has("flag_false") and bool(story.get_flag(str(req["flag_false"]), false)):
		return false
	if req.has("npc_alive") and not npc_available.call(str(req["npc_alive"])):
		return false
	return true


# --- Choices ---------------------------------------------------------------

func _build_choice_views(node: Dictionary) -> void:
	var views: Array = []
	var choices: Array = []
	var next_targets: Array[String] = []
	for choice in node.get("choices", []):
		if not _choice_visible(choice):
			continue
		var verdict := _choice_enabled(choice)
		views.append({
			"index": views.size(), "id": str(choice.get("id", "")), "text": str(choice.get("text", "")),
			"enabled": verdict["enabled"], "reason": verdict["reason"], "kind": "choice", "is_check": choice.has("check"),
		})
		choices.append(choice)
		if choice.get("next") != null:
			next_targets.append(str(choice["next"]))
	if current_id == _entry_resolved:
		for alias in tree.additional_entries:
			var target := str(tree.additional_entries[alias])
			if next_targets.has(target) or not _entry_available(target):
				continue
			views.append({
				"index": views.size(), "id": str(alias), "text": str(ENTRY_LABELS.get(alias, "[%s]" % alias)),
				"enabled": true, "reason": "", "kind": "choice", "is_check": false,
			})
			choices.append({"id": alias, "text": "", "next": target, "effects": []})
	if views.is_empty() or _pending_end:
		# Terminal node, or nothing left to say (everything hidden): never trap the player.
		var nav := _nav_view(END_LABEL, "end")
		nav["index"] = views.size()
		views.append(nav)
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
	if choice.has("check"):
		var attempt := str(choice["check"].get("attempt_key", ""))
		if attempt != "" and story.has_attempted(attempt):
			return false
	if not _hiding_requirements_met(choice.get("requires", {})):
		return false
	for target in DialogueTree.choice_targets(choice):
		var node := _resolve_node(target)
		if node.is_empty() or not DialogueTree.is_authored(node):
			return false
		if _once_consumed(target, node) and not choice.has("check"):
			return false
	if choice.has("check"):
		var success_id := str(choice["check"].get("success", ""))
		if _once_consumed(success_id, _resolve_node(success_id)):
			return false
	if _decides_settled_quest(choice):
		return false
	return true


func _once_consumed(node_id: String, node: Dictionary) -> bool:
	return (node.get("once_per_run", false) or node.get("once_per_save", false)) and story.is_consumed(_consumed_key(node_id))


func _hiding_requirements_met(req: Dictionary) -> bool:
	var hiding := {}
	for key in req:
		if HIDING_REQUIREMENTS.has(key) or key == "quantity":
			hiding[key] = req[key]
	return requirements_met(hiding)


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
## of a quest that already has one: nobody renegotiates a settled deal.
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
	# A claim for a quest nobody has mentioned yet is not offered.
	if DialogueTree.is_switch(node) and node["switch"].has("quest") and story.quest_status(str(node["switch"]["quest"])) == "":
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
## the best bonus speaks. A check with an attempt_key is remembered for the run.
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
	var attempt := str(check.get("attempt_key", ""))
	if attempt != "":
		story.record_attempt(attempt, result["success"])
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
			else:
				push_warning("Dialogue '%s': unknown item '%s'" % [tree.id, effect["item"]])
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
			_pay_quest_reward(str(effect["quest"]))
		"claim_quest_reward":
			var quest := str(effect["quest"])
			var ok := true
			if effect.get("require_accepted", true) and story.quest_status(quest) != "accepted":
				ok = false
			if effect.get("require_not_claimed", true) and story.quest_claimed(quest):
				ok = false
			var objective := str(effect.get("require_objective", ""))
			if ok and objective != "" and effect.get("verify_objective_before_claim", true) and not objective_met.call(objective):
				ok = false
			if ok:
				_pay_quest_reward(quest)
			else:
				EventBus.log("[color=gray]No reward is due for '%s' right now.[/color]" % quest.replace("_", " "))
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
		"leave_location", "open_shop", "serve_drink":
			world_effect.emit(effect)
		_:
			push_warning("Dialogue '%s': unknown effect '%s'" % [tree.id, type])


## Copper and beer promised for [param quest], once.
func _pay_quest_reward(quest: String) -> void:
	var reward := story.quest_reward(quest)
	var items: Array = []
	if reward["copper"] > 0:
		inventory.add_copper(reward["copper"])
	var beer := _item("beer")
	if reward["beer"] > 0 and beer != null:
		inventory.add(beer, reward["beer"])
		for _i in reward["beer"]:
			items.append(beer)
	story.mark_quest_claimed(quest)
	EventBus.log("[color=yellow]Reward: %s%s.[/color]" % [Inventory.format_money(reward["copper"]), (" and %d beer" % reward["beer"]) if reward["beer"] > 0 else ""])
	EventBus.loot_gained.emit(reward["copper"], items)


func _item(dialogue_item: String) -> ItemData:
	return Inventory.find_item(ITEM_IDS.get(dialogue_item, StringName(dialogue_item)))
