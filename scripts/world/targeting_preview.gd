## Draws what a locked command would do: area circle, destination marker,
## path line. Pure presentation, driven by [PlayerCombatInput.lock_changed].
class_name TargetingPreview
extends Node3D

var _area: MeshInstance3D
var _area_material: StandardMaterial3D
var _destination: MeshInstance3D
var _line: MeshInstance3D
var _line_mesh: ImmediateMesh
var _line_material: StandardMaterial3D


func _ready() -> void:
	_area = _make_disc(Color(1.0, 0.55, 0.15, 0.28), Color(1.0, 0.5, 0.1))
	_area_material = _area.material_override
	add_child(_area)
	_destination = _make_disc(Color(0.3, 0.9, 1.0, 0.5), Color(0.3, 0.9, 1.0))
	_destination.scale = Vector3(0.45, 1.0, 0.45)
	add_child(_destination)
	_line_mesh = ImmediateMesh.new()
	_line = MeshInstance3D.new()
	_line.mesh = _line_mesh
	_line_material = StandardMaterial3D.new()
	_line_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_line_material.albedo_color = Color(0.3, 0.9, 1.0)
	_line.material_override = _line_material
	add_child(_line)
	clear()


func _make_disc(color: Color, emission: Color) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = 1.0
	mesh.bottom_radius = 1.0
	mesh.height = 0.02
	var mat := StandardMaterial3D.new()
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = color
	mat.emission_enabled = true
	mat.emission = emission
	mat.emission_energy_multiplier = 0.5
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.top_level = true
	return inst


func clear() -> void:
	_area.visible = false
	_destination.visible = false
	_line.visible = false
	_line_mesh.clear_surfaces()


func show_area(center: Vector3, radius: float, hits_ally: bool) -> void:
	clear()
	_area.visible = true
	_area.global_position = Vector3(center.x, 0.04, center.z)
	_area.scale = Vector3(maxf(0.3, radius), 1.0, maxf(0.3, radius))
	_area_material.albedo_color = Color(1.0, 0.25, 0.2, 0.32) if hits_ally else Color(1.0, 0.55, 0.15, 0.28)


func show_path(path: PackedVector3Array, provokes: bool) -> void:
	clear()
	if path.size() < 2:
		return
	var color := Color(1.0, 0.4, 0.3) if provokes else Color(0.3, 0.9, 1.0)
	_line_material.albedo_color = color
	_line_mesh.clear_surfaces()
	_line_mesh.surface_begin(Mesh.PRIMITIVE_LINE_STRIP)
	for p in path:
		_line_mesh.surface_add_vertex(Vector3(p.x, 0.08, p.z))
	_line_mesh.surface_end()
	_line.visible = true
	_line.global_transform = Transform3D.IDENTITY
	var end := path[path.size() - 1]
	_destination.visible = true
	_destination.global_position = Vector3(end.x, 0.05, end.z)
	_destination.material_override.albedo_color = Color(color.r, color.g, color.b, 0.5)
