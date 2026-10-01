class_name KayKitWeapon
extends RefCounted

static func attach(skeleton: Skeleton3D, model: PackedScene, rotation_degrees: Vector3 = Vector3.ZERO, scale_factor: float = 1.0, left_hand: bool = false) -> BoneAttachment3D:
	var bone: StringName = &"handslot.l" if left_hand else &"handslot.r"
	if skeleton.find_bone(bone) < 0:
		push_error("Missing KayKit hand bone: " + str(bone))
		return null
	var attachment = BoneAttachment3D.new()
	attachment.bone_name = bone
	skeleton.add_child(attachment)
	var weapon = model.instantiate() as Node3D
	attachment.add_child(weapon)
	weapon.rotation_degrees = rotation_degrees
	weapon.scale = Vector3.ONE * scale_factor
	return attachment
