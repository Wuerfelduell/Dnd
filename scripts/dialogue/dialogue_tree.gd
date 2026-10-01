## A hand-written dialogue loaded from data/dialogues/<id>.json (schema 1).
##
## Only reads and validates; it never changes game state. The runtime
## interpretation (effects, checks, visibility of choices) is [DialogueRunner].
##
## Node keys: speaker, text, choices, effects, stage_direction, terminal,
## automatic_next, switch {flag | quest + field, cases, default}, requires
## {item, quantity, quest_not_completed, quest_not_accepted,
## quest_accepted_or_completed, flag_true, flag_false, npc_alive}, once_per_run /
## once_per_save, status ("not_authored" marks a branch the author has not
## written yet). Keys such as presentation, atomic_effects, participant_conditions,
## rumour_reliability and note are authoring metadata the runtime does not need.
## Choice keys: id, text, next, effects, end_conversation, once_answered,
## repeatable, requires {minimum_copper, food_service_allowed + the node keys},
## check {ability, skill, dc, success, failure, retry, attempt_key}.
class_name DialogueTree
extends RefCounted

const DIALOGUE_DIR := "res://data/dialogues/"
const KNOWN_EFFECTS := [
	"set_flag", "increment_flag", "spend_currency", "give_currency", "give_item", "remove_item",
	"set_quest", "give_quest_reward", "complete_quest", "quest_hint", "set_navigation_hint",
	"start_combat", "leave_location", "open_shop", "serve_drink", "claim_quest_reward",
	"unlock_service", "narrative_event", "narrative_work", "heal_actor",
]

var id: String = ""
var title: String = ""
var language: String = "de"
var entry: String = ""
## Extra starting points, e.g. {"return_mug": "mug_return"}: offered as
## navigation choices when their node's requirements are met.
var additional_entries: Dictionary = {}
## speaker key -> {"name": String, "actor_reference": String}
var speakers: Dictionary = {}
var nodes: Dictionary = {}
var errors: PackedStringArray = PackedStringArray()


## Loads data/dialogues/<dialogue_id>.json; null when the file is missing or broken.
static func load_by_id(dialogue_id: String) -> DialogueTree:
	return load_from_path(DIALOGUE_DIR + dialogue_id + ".json")


static func load_from_path(path: String) -> DialogueTree:
	if not FileAccess.file_exists(path):
		push_error("Dialogue file not found: " + path)
		return null
	var text := FileAccess.get_file_as_string(path)
	var parsed = JSON.parse_string(text)
	if not (parsed is Dictionary):
		push_error("Dialogue file is not a JSON object: " + path)
		return null
	return from_dict(parsed)


static func from_dict(data: Dictionary) -> DialogueTree:
	var tree := DialogueTree.new()
	tree.id = str(data.get("id", ""))
	tree.title = str(data.get("title", ""))
	tree.language = str(data.get("language", "de"))
	tree.entry = str(data.get("entry", ""))
	tree.additional_entries = data.get("additional_entries", {})
	tree.speakers = data.get("speakers", {})
	tree.nodes = data.get("nodes", {})
	tree.validate()
	return tree


func has_node(node_id: String) -> bool:
	return nodes.has(node_id)


func node(node_id: String) -> Dictionary:
	return nodes.get(node_id, {})


## Display name of a speaker key ("innkeeper" -> "Wirt"); "" for the system voice.
func speaker_name(speaker: String) -> String:
	var info: Dictionary = speakers.get(speaker, {})
	return str(info.get("name", speaker if speaker != "system" else ""))


## Which actor in the scene a speaker key stands for ("town_guard").
func actor_reference(speaker: String) -> String:
	var info: Dictionary = speakers.get(speaker, {})
	return str(info.get("actor_reference", speaker))


## True for a branch the author marked as not written yet.
static func is_authored(dialogue_node: Dictionary) -> bool:
	return str(dialogue_node.get("status", "")) != "not_authored"


## A switch node routes to another node without speaking itself.
static func is_switch(dialogue_node: Dictionary) -> bool:
	return dialogue_node.has("switch")


## Everything a node can jump to (for validation and reachability).
static func targets_of(dialogue_node: Dictionary) -> PackedStringArray:
	var out := PackedStringArray()
	if dialogue_node.get("automatic_next") != null:
		out.append(str(dialogue_node["automatic_next"]))
	if dialogue_node.has("switch"):
		var sw: Dictionary = dialogue_node["switch"]
		for case_target in sw.get("cases", {}).values():
			out.append(str(case_target))
		if sw.get("default") != null:
			out.append(str(sw["default"]))
	for choice in dialogue_node.get("choices", []):
		for target in choice_targets(choice):
			out.append(target)
	return out


static func choice_targets(choice: Dictionary) -> PackedStringArray:
	var out := PackedStringArray()
	if choice.get("next") != null:
		out.append(str(choice["next"]))
	if choice.has("check"):
		var check: Dictionary = choice["check"]
		if check.get("success") != null:
			out.append(str(check["success"]))
		if check.get("failure") != null:
			out.append(str(check["failure"]))
	return out


## Fills [member errors]; an empty list means the file is consistent.
func validate() -> bool:
	errors.clear()
	if entry == "" or not nodes.has(entry):
		errors.append("entry node '%s' missing" % entry)
	for alias in additional_entries:
		if not nodes.has(str(additional_entries[alias])):
			errors.append("additional entry '%s' points to missing node '%s'" % [alias, additional_entries[alias]])
	for node_id in nodes:
		var n: Dictionary = nodes[node_id]
		for target in targets_of(n):
			if not nodes.has(target):
				errors.append("node '%s' points to missing node '%s'" % [node_id, target])
		for effect in _all_effects(n):
			if not KNOWN_EFFECTS.has(str(effect.get("type", ""))):
				errors.append("node '%s' uses unknown effect '%s'" % [node_id, effect.get("type", "")])
		var exits := targets_of(n).size() > 0 or bool(n.get("terminal", false))
		for choice in n.get("choices", []):
			if choice.get("end_conversation", false):
				exits = true
		if not exits:
			errors.append("node '%s' has no way out" % node_id)
		if not speakers.has(str(n.get("speaker", ""))):
			errors.append("node '%s' has unknown speaker '%s'" % [node_id, n.get("speaker", "")])
	return errors.is_empty()


## Nodes reachable from the entry points (unreachable ones are usually typos).
func reachable_nodes() -> PackedStringArray:
	var seen := {}
	var stack: Array[String] = [entry]
	for alias in additional_entries:
		stack.append(str(additional_entries[alias]))
	while not stack.is_empty():
		var current: String = stack.pop_back()
		if seen.has(current) or not nodes.has(current):
			continue
		seen[current] = true
		for target in targets_of(nodes[current]):
			stack.append(target)
	var out := PackedStringArray()
	for node_id in seen:
		out.append(node_id)
	return out


static func _all_effects(dialogue_node: Dictionary) -> Array:
	var out: Array = []
	out.append_array(dialogue_node.get("effects", []))
	for choice in dialogue_node.get("choices", []):
		out.append_array(choice.get("effects", []))
	return out
