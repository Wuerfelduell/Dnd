## An item the party can carry: potions, ammunition, later weapons and armour.
##
## Consumables describe their effect declaratively (heal dice, cured status,
## restored spell slot, applied status, ammunition) and [method use_on] applies
## it; the inventory, the action bar and the merchant only read these fields.
class_name ItemData
extends Resource

enum Kind { CONSUMABLE, AMMO, WEAPON, ARMOR, TRINKET }

@export var id: StringName = &"item"
@export var display_name: String = "Item"
@export_multiline var description: String = ""
@export var icon: Texture2D
## Tint for icons that are reused (the strength potion shares the health icon).
@export var icon_tint: Color = Color.WHITE
@export var kind: Kind = Kind.CONSUMABLE
## Price in gold at the merchant; sells for half.
@export var value: int = 10
@export var stack_max: int = 20
## 3D model below res://assets/shop/models/ (shop table, loot drops).
@export var model: String = ""

@export_group("Consumable effect")
## Healing when drunk, e.g. "2d4" + [member heal_bonus]. Revives a downed ally.
@export var heal_dice: String = ""
@export var heal_bonus: int = 0
## Status id removed when drunk (antidote: "poisoned").
@export var cures_status: StringName = &""
## Gives back one spent spell slot of the highest spent level.
@export var restores_spell_slot: bool = false
## Status gained when drunk (strength potion: Empowered).
@export var applies_status: StatusEffectData
@export var status_rounds: int = 5
## Ammunition: adds [member ammo_amount] of [member ammo_name] to the target.
@export var ammo_name: String = ""
@export var ammo_amount: int = 0


func is_consumable() -> bool:
	return kind == Kind.CONSUMABLE or kind == Kind.AMMO


## Can this item do anything for [param target] right now?
func can_use_on(target: Actor) -> bool:
	if target == null or not is_consumable():
		return false
	if heal_dice != "":
		return target.is_down or target.current_hp < target.max_hp()
	if cures_status != &"":
		return target.is_alive() and target.has_status(cures_status)
	if restores_spell_slot:
		return target.is_alive() and _spent_slot_level(target) > 0
	if applies_status != null:
		return target.is_alive() and not target.has_status(applies_status.id)
	if ammo_name != "":
		return target.is_alive() and _ammo_room(target) > 0
	return false


## Why it cannot be used (empty when it can).
func unusable_reason(target: Actor) -> String:
	if target == null:
		return "No target"
	if heal_dice != "" and not (target.is_down or target.current_hp < target.max_hp()):
		return "%s is at full health" % target.display_name()
	if cures_status != &"" and not target.has_status(cures_status):
		return "%s is not %s" % [target.display_name(), String(cures_status)]
	if restores_spell_slot and _spent_slot_level(target) <= 0:
		return "%s has no spent spell slot" % target.display_name()
	if applies_status != null and target.has_status(applies_status.id):
		return "%s is already %s" % [target.display_name(), applies_status.display_name]
	if ammo_name != "" and _ammo_room(target) <= 0:
		return "%s cannot carry more %s" % [target.display_name(), ammo_name]
	return ""


## Applies the effect. Returns the log line. [param user] is who administered it.
func use_on(target: Actor, user: Actor) -> String:
	var who := target.display_name() if user == target else "%s gives %s" % [user.display_name(), target.display_name()]
	if heal_dice != "":
		var roll := Dice.parse(heal_dice, heal_bonus)
		var was_down := target.is_down
		var healed := target.heal(roll.total())
		EventBus.heal_applied.emit(target, healed, roll)
		return "%s drinks %s: %s, heals %d HP%s." % [who, display_name, roll.describe(), healed, " (back on their feet!)" if was_down else ""]
	if cures_status != &"":
		var effect := target.get_status(cures_status)
		if effect != null:
			target.remove_status(effect)
		return "%s drinks %s and shakes off %s." % [who, display_name, String(cures_status)]
	if restores_spell_slot:
		var level := _spent_slot_level(target)
		if level > 0:
			target.spell_slots[level] += 1
		return "%s drinks %s: a level %d spell slot returns." % [who, display_name, level]
	if applies_status != null:
		target.add_status(applies_status, user, status_rounds)
		return "%s drinks %s and is %s." % [who, display_name, applies_status.display_name]
	if ammo_name != "":
		var room := _ammo_room(target)
		target.ammo[ammo_name] = target.ammo.get(ammo_name, 0) + mini(room, ammo_amount)
		return "%s takes %d %s." % [who, mini(room, ammo_amount), ammo_name]
	return "%s uses %s." % [who, display_name]


func _spent_slot_level(target: Actor) -> int:
	for level in range(target.spell_slots.size() - 1, 0, -1):
		if target.spell_slots[level] < target.max_spell_slots(level):
			return level
	return 0


func _ammo_room(target: Actor) -> int:
	var cap := 0
	for w in target.data.weapons:
		if w.uses_ammo and w.ammo_name == ammo_name:
			cap = maxi(cap, w.ammo_max)
	return maxi(0, cap - target.ammo.get(ammo_name, 0))
