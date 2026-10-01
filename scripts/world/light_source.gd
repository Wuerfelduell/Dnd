## A light that counts for the rules (torch, campfire). The rendered
## OmniLight3D is only decoration; [Lighting] asks these nodes whether a
## creature stands in the light. Place the node at the flame.
class_name LightSource
extends Node3D

## Creatures farther away than this are in the dark as far as this light goes.
@export var radius_m: float = 6.0
## Extinguished lights stay in the scene but light nothing.
@export var lit: bool = true


func _ready() -> void:
	add_to_group("light_source")
