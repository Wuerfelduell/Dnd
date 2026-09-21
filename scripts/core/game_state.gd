## Autoload: global game mode (exploration / combat / game over).
##
## Holds no combat logic itself; CombatManager switches the state and other
## systems (player controller, HUD, camera) react to [signal state_changed].
extends Node

enum State { EXPLORATION, COMBAT, GAME_OVER }

signal state_changed(new_state: State, old_state: State)

var state: State = State.EXPLORATION

## Multiplier for "dramatic" pauses between combat steps. Headless tests set
## this to 0 so a whole fight runs in a handful of frames.
var pacing: float = 1.0


func set_state(new_state: State) -> void:
	if new_state == state:
		return
	var old := state
	state = new_state
	state_changed.emit(new_state, old)


func is_exploring() -> bool:
	return state == State.EXPLORATION


func is_in_combat() -> bool:
	return state == State.COMBAT


func is_game_over() -> bool:
	return state == State.GAME_OVER


## Await a pause of [param seconds] scaled by [member pacing].
## With pacing 0 this still yields one frame so signals/physics can settle.
func wait(seconds: float) -> void:
	if pacing <= 0.0 or seconds <= 0.0:
		await get_tree().process_frame
		return
	await get_tree().create_timer(seconds * pacing).timeout


func state_name(s: State = state) -> String:
	match s:
		State.EXPLORATION:
			return "Exploration"
		State.COMBAT:
			return "Combat"
		State.GAME_OVER:
			return "Game Over"
	return "?"
