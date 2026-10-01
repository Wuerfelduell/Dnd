## Everything the story remembers about this run: flags set by dialogues,
## quests with their status and rewards, navigation hints and which
## once-per-run dialogue nodes already happened.
##
## Pure data with a signal; the dialogue runner writes, the HUD and the world
## read. Saving the game later means serialising exactly this object.
class_name StoryState
extends RefCounted

signal changed

var flags: Dictionary = {}  # String -> Variant (bool / int)
## quest id -> {"status": String, "reward_copper": int, "reward_beer": int, "completed": bool}
var quests: Dictionary = {}
## destination -> what the party was told it is ("cave" -> "hunter_hut").
var navigation_hints: Dictionary = {}
## Dialogue node ids that may only happen once per run and already did.
var consumed_nodes: Dictionary = {}


func set_flag(flag: String, value: Variant) -> void:
	flags[flag] = value
	changed.emit()


func get_flag(flag: String, default: Variant = false) -> Variant:
	return flags.get(flag, default)


func increment_flag(flag: String, amount: int = 1) -> int:
	var value := int(flags.get(flag, 0)) + amount
	flags[flag] = value
	changed.emit()
	return value


## Status of a quest ("" when it was never mentioned; "accepted", "declined",
## "withdrawn", "completed").
func quest_status(quest: String) -> String:
	if not quests.has(quest):
		return ""
	return quests[quest]["status"]


func set_quest(quest: String, status: String, reward_copper: int = 0, reward_beer: int = 0) -> void:
	var entry: Dictionary = quests.get(quest, {"completed": false})
	entry["status"] = status
	entry["reward_copper"] = reward_copper
	entry["reward_beer"] = reward_beer
	quests[quest] = entry
	changed.emit()


func quest_reward(quest: String) -> Dictionary:
	var entry: Dictionary = quests.get(quest, {})
	return {"copper": int(entry.get("reward_copper", 0)), "beer": int(entry.get("reward_beer", 0))}


func quest_completed(quest: String) -> bool:
	return quests.has(quest) and bool(quests[quest].get("completed", false))


func complete_quest(quest: String) -> void:
	var entry: Dictionary = quests.get(quest, {"status": "accepted", "reward_copper": 0, "reward_beer": 0})
	entry["completed"] = true
	entry["status"] = "completed"
	quests[quest] = entry
	changed.emit()


func set_navigation_hint(destination: String, presented_as: String) -> void:
	navigation_hints[destination] = presented_as
	changed.emit()


func is_consumed(node_id: String) -> bool:
	return consumed_nodes.has(node_id)


func consume(node_id: String) -> void:
	consumed_nodes[node_id] = true
	changed.emit()


## Serialisable snapshot (for saving later and for tests).
func to_dict() -> Dictionary:
	return {
		"flags": flags.duplicate(),
		"quests": quests.duplicate(true),
		"navigation_hints": navigation_hints.duplicate(),
		"consumed_nodes": consumed_nodes.keys(),
	}
