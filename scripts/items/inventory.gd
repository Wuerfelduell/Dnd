## The party's shared bag: coins and stacks of items. Pure data with a signal;
## the HUD, the dialogues, the merchant and [UseItemAction] all talk to this.
##
## Money is counted in copper: 10 copper = 1 silver, 10 silver = 1 gold
## (the convention of the hand-written dialogues). [method format_money]
## renders it as "2 G 3 S 5 K".
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

const COPPER_PER_SILVER := 10
const SILVER_PER_GOLD := 10
const COPPER_PER_GOLD := COPPER_PER_SILVER * SILVER_PER_GOLD

var copper: int = 0
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


func add_copper(amount: int) -> void:
	if amount <= 0:
		return
	copper += amount
	changed.emit()


## False when the party cannot afford it (nothing is taken then).
func spend_copper(amount: int) -> bool:
	if amount > copper or amount < 0:
		return false
	copper -= amount
	changed.emit()
	return true


func can_afford(amount: int) -> bool:
	return amount <= copper


## "2 G 3 S 5 K" (gold, silver, copper); zero parts are left out, 0 -> "0 K".
static func format_money(amount: int) -> String:
	if amount <= 0:
		return "0 K"
	var gold := amount / COPPER_PER_GOLD
	var silver := (amount % COPPER_PER_GOLD) / COPPER_PER_SILVER
	var rest := amount % COPPER_PER_SILVER
	var parts := PackedStringArray()
	if gold > 0:
		parts.append("%d G" % gold)
	if silver > 0:
		parts.append("%d S" % silver)
	if rest > 0:
		parts.append("%d K" % rest)
	return " ".join(parts)


func describe() -> String:
	var parts := PackedStringArray()
	for item in items():
		parts.append("%s x%d" % [item.display_name, count(item)])
	return "%s%s" % [format_money(copper), (", " + ", ".join(parts)) if not parts.is_empty() else ""]
