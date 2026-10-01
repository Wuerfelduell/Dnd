## A chest in the level: tap it in exploration, walk up, take what is inside.
## Built by [TerrainBuilder] from a "loot" entry; the model is a child.
class_name LootChest
extends StaticBody3D

@export var copper: int = 0
## Item ids (data/items/<id>.tres); the same id may appear several times.
## [member copper] is the coin inside (100 copper = 1 gold).
@export var item_ids: PackedStringArray = PackedStringArray()
var looted: bool = false

## How close the leader has to be.
const OPEN_DISTANCE := 2.4


func _ready() -> void:
	add_to_group("loot_chests")


func is_empty() -> bool:
	return looted or (copper <= 0 and item_ids.is_empty())


## Takes everything out. Returns {"copper": int, "items": Array[ItemData]}.
func open() -> Dictionary:
	var out := {"copper": 0, "items": [] as Array[ItemData]}
	if looted:
		return out
	looted = true
	out["copper"] = copper
	for item_id in item_ids:
		var item := Inventory.find_item(StringName(item_id))
		if item != null:
			out["items"].append(item)
	return out


func within_reach(actor: Actor) -> bool:
	var a := actor.global_position
	var b := global_position
	a.y = 0.0
	b.y = 0.0
	return a.distance_to(b) <= OPEN_DISTANCE
