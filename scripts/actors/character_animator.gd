## Maps game actions ("walk", "attack", "cast" ...) onto whatever animation
## clips an imported character model ships with, so the same calls work for
## KayKit adventurers (76 clips), the Quaternius goblin (7) and wolf (24).
## Clip names are matched by their short name after the last "|".
##
## Looping actions keep playing; one-shot actions return to the resting
## action when they finish. This only drives the visible pose: damage, rules
## and timing stay in the combat code.
class_name CharacterAnimator
extends RefCounted

const CANDIDATES := {
	"idle": ["Idle", "Unarmed_Idle", "Idle_2"],
	"walk": ["Walking_A", "Walk"],
	"run": ["Running_A", "Run", "Gallop", "Walking_A", "Walk"],
	"attack": ["1H_Melee_Attack_Slice_Diagonal", "1H_Melee_Attack_Chop", "Attack"],
	"slam": ["Slam", "2H_Melee_Attack_Chop", "Attack"],
	"ranged": ["2H_Ranged_Shoot", "1H_Ranged_Shoot", "Cast", "Attack"],
	"cast": ["Spellcast_Shoot", "Spellcasting", "Cast", "Attack"],
	"hit": ["Hit_A", "HitRecieve", "Idle_HitReact_Left", "Hit"],
	"death": ["Death_A", "Death"],
	"spawn": ["Spawn", "Idle"],
	"revive": ["Lie_StandUp", "Idle"],
	# Tavern folk
	"sit": ["Sit_Chair_Idle", "Idle"],
	"cheer": ["Cheer", "Idle"],
	"use_item": ["Use_Item", "Idle"],
	"interact": ["Interact", "Idle"],
}
const LOOPING := ["idle", "walk", "run", "sit"]

var player: AnimationPlayer
## Action to fall back to when a one-shot clip ends ("idle" or "run").
var resting_action: String = "idle"
var current_action: String = ""

var _clips: Dictionary = {}  # short name -> full clip name


func _init(p_player: AnimationPlayer) -> void:
	player = p_player
	if player == null:
		return
	for clip in player.get_animation_list():
		var short := String(clip).split("|")[-1]
		if not _clips.has(short):
			_clips[short] = clip
	player.animation_finished.connect(_on_finished)


func has_action(action: String) -> bool:
	return clip_for(action) != &""


func clip_for(action: String) -> StringName:
	if player == null or not CANDIDATES.has(action):
		return &""
	for candidate in CANDIDATES[action]:
		if _clips.has(candidate):
			return _clips[candidate]
	return &""


## Plays the clip for [param action]; false when the model has none.
func play(action: String) -> bool:
	var clip := clip_for(action)
	if clip == &"":
		return false
	var looping := action in LOOPING
	player.get_animation(clip).loop_mode = Animation.LOOP_LINEAR if looping else Animation.LOOP_NONE
	if looping:
		resting_action = action
		if current_action == action and player.is_playing():
			return true
	current_action = action
	player.play(clip, 0.15)
	if not looping and action == resting_action:
		# A one-shot resting pose (cheer, use item) restarts each time it ends.
		player.seek(0.0)
	return true


func _on_finished(_clip: StringName) -> void:
	if current_action == "death":
		return
	var next := resting_action
	current_action = ""
	play(next)
