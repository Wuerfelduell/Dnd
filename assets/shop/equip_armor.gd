class_name KayKitArmor
extends RefCounted

# Source GLBs retain Knight_Body weights and the complete KayKit skeleton.
# Rebind Skin by bone names; never parent a second independently animated skeleton.
static func descendants(node: Node) -> Array[Node]:
	var result: Array[Node] = [node]
	for child in node.get_children():
		result.append_array(descendants(child))
	return result

static func equip(actor: Node3D, armor: PackedScene) -> MeshInstance3D:
	var target_skeleton: Skeleton3D
	var old_body: MeshInstance3D
	for node in descendants(actor):
		if node is Skeleton3D:
			target_skeleton = node
		if node is MeshInstance3D and (str(node.name).ends_with("_Body") or node.name == &"EquippedArmor"):
			old_body = node
	if target_skeleton == null or old_body == null:
		push_error("Actor requires a KayKit Skeleton3D and a *_Body mesh.")
		return null
	var source = armor.instantiate()
	var source_skeleton: Skeleton3D
	var source_body: MeshInstance3D
	for node in descendants(source):
		if node is Skeleton3D:
			source_skeleton = node
		if node is MeshInstance3D and node.name == &"Knight_Body":
			source_body = node
	if source_skeleton == null or source_body == null or source_body.skin == null:
		source.free()
		push_error("Armor requires the original skinned Knight_Body.")
		return null
	var mapped_skin = Skin.new()
	mapped_skin.set_bind_count(source_body.skin.get_bind_count())
	for i in range(mapped_skin.get_bind_count()):
		var bone_name = source_body.skin.get_bind_name(i)
		if bone_name == &"":
			var source_index = source_body.skin.get_bind_bone(i)
			if source_index < 0 or source_index >= source_skeleton.get_bone_count():
				source.free()
				push_error("Invalid source skin bone.")
				return null
			bone_name = source_skeleton.get_bone_name(source_index)
		var target_index = target_skeleton.find_bone(bone_name)
		if target_index < 0:
			source.free()
			push_error("Missing target bone: " + str(bone_name))
			return null
		mapped_skin.set_bind_bone(i, target_index)
		mapped_skin.set_bind_pose(i, source_body.skin.get_bind_pose(i))
	var equipped = MeshInstance3D.new()
	equipped.name = &"EquippedArmor"
	equipped.mesh = source_body.mesh
	equipped.skin = mapped_skin
	# All included Adventurers use the same rest rig; preserve target mesh transform.
	equipped.transform = old_body.transform
	old_body.get_parent().add_child(equipped)
	equipped.skeleton = equipped.get_path_to(target_skeleton)
	old_body.visible = false
	if old_body.name == &"EquippedArmor":
		old_body.queue_free()
	source.free()
	return equipped
