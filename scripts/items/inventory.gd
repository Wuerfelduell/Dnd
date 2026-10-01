## The party's shared bag: gold and stacks of items. Pure data with a signal;
## the HUD, the merchant and [UseItemAction] all talk to this.
class_name Inventory
extends RefCounted

signal changed

## Consumables every party member gets an action button for (greyed out
## while the bag holds none).
const CONSUMABLE_PATHS := [
	"res://data/items/potion_health.tres",
	"res://data/items/potion_mana.tres",
	"res://data/items/potion_antidote.tres",
	"res://data/items/potion_strength.tres",
]

static var _consumables: Array[ItemData] = []

var gold: int = 0
var _stacks: Dictionary = {}  # ItemData -> int


static func consumables() -> Array[ItemData]:
	if _consumables.is_empty():
		for path in CONSUMABLE_PATHS:
			var item: ItemData = load(path)
			if item != null:
				_consumables.append(item)
	return _consumables


static func find_item(item_id: StringName) -> ItemData:
	for item in consumables():
		if item.id == item_id:
			return item
	var path := "res://data/items/%s.tres" % String(item_id)
	if ResourceLoader.exists(path):
		return load(path)
	return null


func add(item: ItemData, amount: int = 1) -> void:
	if item == null or amount <= 0:
		return
	_stacks[item] = count(item) + amount
	changed.emit()


## Takes [param amount] out; false (and nothing taken) when there aren't enough.
func remove(item: ItemData, amount: int = 1) -> bool:
	if count(item) < amount:
		return false
	var left := count(item) - amount
	if left <= 0:
		_stacks.erase(item)
	else:
		_stacks[item] = left
	changed.emit()
	return true


func count(item: ItemData) -> int:
	return _stacks.get(item, 0)


func has(item: ItemData) -> bool:
	return count(item) > 0


## Items in the bag, consumables first, then by name.
func items() -> Array[ItemData]:
	var out: Array[ItemData] = []
	for item in _stacks:
		out.append(item)
	out.sort_custom(func(a: ItemData, b: ItemData):
		if a.kind != b.kind:
			return a.kind < b.kind
		return a.display_name < b.display_name)
	return out


func total_items() -> int:
	var n := 0
	for item in _stacks:
		n += _stacks[item]
	return n


func add_gold(amount: int) -> void:
	if amount <= 0:
		return
	gold += amount
	changed.emit()


## False when the party cannot afford it.
func spend_gold(amount: int) -> bool:
	if amount > gold:
		return false
	gold -= amount
	changed.emit()
	return true


func describe() -> String:
	var parts := PackedStringArray()
	for item in items():
		parts.append("%s x%d" % [item.display_name, count(item)])
	return "%d gold%s" % [gold, (", " + ", ".join(parts)) if not parts.is_empty() else ""]
