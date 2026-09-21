## Rolls initiative and hands out turns in order, round after round.
##
## Down actors stay in the list (so the UI can still show them) but are skipped.
class_name InitiativeTracker
extends RefCounted


class Entry:
	var actor: Actor
	var roll: DiceResult
	var total: int = 0


var entries: Array[Entry] = []
var current_index: int = -1
var round_number: int = 0


func roll_for(actors: Array[Actor]) -> void:
	entries.clear()
	current_index = -1
	round_number = 0
	for actor in actors:
		var e := Entry.new()
		e.actor = actor
		e.roll = Dice.d20(actor.data.stats.initiative_bonus())
		e.total = e.roll.total()
		entries.append(e)
		EventBus.initiative_rolled.emit(actor, e.roll)
	entries.sort_custom(_compare)


static func _compare(a: Entry, b: Entry) -> bool:
	if a.total != b.total:
		return a.total > b.total
	# 5e tie-break: higher dex wins, then keep insertion order (stable enough).
	return a.actor.data.stats.dexterity_mod > b.actor.data.stats.dexterity_mod


func current() -> Actor:
	if current_index < 0 or current_index >= entries.size():
		return null
	return entries[current_index].actor


## Moves to the next living actor and returns it. Returns null if nobody is alive.
func advance() -> Actor:
	if entries.is_empty():
		return null
	for _i in entries.size():
		current_index += 1
		if current_index >= entries.size():
			current_index = 0
			round_number += 1
		elif round_number == 0:
			round_number = 1
		var actor := entries[current_index].actor
		if actor.is_alive():
			return actor
	return null


func entry_for(actor: Actor) -> Entry:
	for e in entries:
		if e.actor == actor:
			return e
	return null
