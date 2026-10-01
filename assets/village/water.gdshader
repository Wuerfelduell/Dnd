shader_type spatial;
render_mode cull_disabled;
uniform vec4 water_color : source_color = vec4(0.08, 0.47, 0.57, 1.0);
varying vec3 world_position;
void vertex() {
	world_position = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}
void fragment() {
	float ripples = sin(world_position.x * 12.0 + world_position.z * 6.0 - TIME * 1.7) * 0.025;
	ALBEDO = water_color.rgb + vec3(ripples);
	ROUGHNESS = 0.22;
	METALLIC = 0.10;
}
