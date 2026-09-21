## A running instance of a [StatusEffectData] on an actor.
class_name StatusEffect
extends RefCounted

var data: StatusEffectData
## Rounds left; -1 = until removed by something else.
var remaining_rounds: int = -1
## Who caused it (for logs and concentration).
var source: Actor
## Who carries it.
var holder: Actor
## DC for [member StatusEffectData.repeat_save_ability] (set by the spell).
var save_dc: int = 0
## When set, the effect ends as soon as this actor loses concentration.
var concentration_owner: Actor


func id() -> StringName:
	return data.id


func display_name() -> String:
	return data.display_name


func describe() -> String:
	var s := data.display_name
	if remaining_rounds >= 0:
		s += " (%d)" % remaining_rounds
	return s
