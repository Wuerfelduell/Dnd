## Autoload: decoupled game events.
##
## Gameplay systems emit here; UI / presentation systems listen. This keeps the
## combat code free of any knowledge about labels, logs or floating text.
extends Node

## Human readable line for the combat log. Supports BBCode.
signal log_message(text: String)

## An attack was fully resolved (hit or miss). [param result] is an AttackResult.
signal attack_resolved(attacker: Node, target: Node, result: AttackResult)

## A saving throw was rolled.
signal save_resolved(actor: Node, result: SaveResult)

## Someone rolled initiative.
signal initiative_rolled(actor: Node, result: DiceResult)

## Healing was applied.
signal heal_applied(actor: Node, amount: int, roll: DiceResult)

## Direct damage without an attack roll (spell effects).
signal damage_applied(actor: Node, amount: int, damage_type: String)

## A status effect started / ended on an actor.
signal status_applied(actor: Node, effect: StatusEffect)
signal status_removed(actor: Node, effect: StatusEffect)

## An actor lost concentration on a spell.
signal concentration_broken(actor: Node, spell: SpellData, reason: String)

## A spell was cast.
signal spell_cast(caster: Node, spell: SpellData, targets: Array)

## Someone used their reaction for an opportunity attack.
signal opportunity_attack(reactor: Node, mover: Node)

## An enemy noticed the player during exploration.
signal enemy_spotted(enemy: Node)

## A consumable was used on someone.
signal item_used(user: Node, target: Node, item: ItemData)

## The party's bag received copper and/or items (victory loot, chests, purchases).
signal loot_gained(copper: int, items: Array)

## The leader reached a chest it was sent to.
signal chest_reached(chest: Node)

## The leader walked up to a bystander it was sent to (talk).
signal npc_reached(npc: Node)

## A conversation opened / closed.
signal dialogue_started(npc: Node, dialogue_id: String)
signal dialogue_ended(npc: Node, dialogue_id: String)

## Request for a floating text at a world position (presentation only).
signal floating_text_requested(world_position: Vector3, text: String, color: Color)


func log(text: String) -> void:
	log_message.emit(text)
