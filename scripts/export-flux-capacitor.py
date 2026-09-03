"""Export the saved flux capacitor scene for its vgpu vertex shader.

Blender --background --python scripts/export-flux-capacitor.py
This reads the editable scene without changing it or rendering an image.
"""

import json
import struct
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public/models'
SOURCE = ROOT / 'design/flux-capacitor/flux-capacitor.blend'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene = bpy.context.scene


def describe_material(material):
    bsdf = material.node_tree.nodes.get('Principled BSDF')
    inputs = bsdf.inputs
    name = material.name
    alpha = 1.0
    kind = 'opaque'
    if name == 'Low iron protective glass':
        alpha, kind = 0.06, 'glass'
    elif name == 'Borosilicate conduit glass':
        alpha, kind = 0.12, 'glass'
    elif name == 'Incandescent amber light':
        kind = 'core'
    strength = inputs['Emission Strength'].default_value
    return {
        'name': name,
        'baseColor': list(inputs['Base Color'].default_value[:3]),
        'metallic': inputs['Metallic'].default_value,
        'roughness': inputs['Roughness'].default_value,
        'emission': [value * strength for value in inputs['Emission Color'].default_value[:3]],
        'alpha': alpha,
        'kind': kind,
        'surface': int(material.get('surface', 0)),
    }


# Evaluate modifiers at render detail, including bevels and weighted normals.
for obj in scene.objects:
    for modifier in obj.modifiers:
        modifier.show_viewport = modifier.show_render
        if modifier.type == 'SUBSURF':
            modifier.levels = modifier.render_levels
    if obj.type in {'CURVE', 'FONT', 'SURFACE'} and obj.data.render_resolution_u:
        obj.data.resolution_u = obj.data.render_resolution_u

depsgraph = bpy.context.evaluated_depsgraph_get()
vertices = bytearray()
vertex_lookup = {}
material_batches = {}
materials_by_name = {}
minimum = [float('inf')] * 3
maximum = [float('-inf')] * 3
object_count = 0

for obj in sorted(scene.objects, key=lambda item: item.name):
    if obj.hide_render or obj.type not in {'MESH', 'CURVE', 'FONT', 'SURFACE'}:
        continue
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh(preserve_all_data_layers=True, depsgraph=depsgraph)
    try:
        mesh.calc_loop_triangles()
        transform = evaluated.matrix_world
        normal_transform = transform.to_3x3().inverted().transposed()
        mirrored = transform.to_3x3().determinant() < 0
        positions = [transform @ vertex.co for vertex in mesh.vertices]
        normals = [(normal_transform @ corner.vector).normalized() for corner in mesh.corner_normals]
        for triangle in mesh.loop_triangles:
            material = mesh.materials[triangle.material_index]
            name = material.name
            if name not in materials_by_name:
                materials_by_name[name] = describe_material(material)
                material_batches[name] = []
            batch = material_batches[name]
            loops = list(triangle.loops)
            if mirrored:
                loops.reverse()
            for loop_index in loops:
                position = positions[mesh.loops[loop_index].vertex_index]
                normal = normals[loop_index]
                packed = struct.pack('<6f', *position, *normal)
                vertex_index = vertex_lookup.get(packed)
                if vertex_index is None:
                    vertex_index = len(vertex_lookup)
                    vertex_lookup[packed] = vertex_index
                    vertices.extend(packed)
                    for axis in range(3):
                        minimum[axis] = min(minimum[axis], position[axis])
                        maximum[axis] = max(maximum[axis], position[axis])
                batch.append(vertex_index)
        object_count += 1
    finally:
        evaluated.to_mesh_clear()

# Separate transparent draws let the renderer disable depth writes for glass.
names = sorted(material_batches, key=lambda name: (materials_by_name[name]['kind'] == 'glass', name))
indices = bytearray()
draws = []
for material_index, name in enumerate(names):
    batch = material_batches[name]
    draws.append({'material': material_index, 'firstIndex': len(indices) // 4, 'indexCount': len(batch)})
    indices.extend(struct.pack(f'<{len(batch)}I', *batch))

camera = scene.camera
forward = camera.matrix_world.to_quaternion() @ Vector((0, 0, -1))
# Intersect the viewing axis with the model's z=0 plane.
target = camera.location + forward * (-camera.location.z / forward.z)
metadata = {
    'binary': 'flux-capacitor.bin',
    'vertexCount': len(vertex_lookup),
    'indexCount': len(indices) // 4,
    'vertexByteOffset': 0,
    'vertexByteLength': len(vertices),
    'indexByteOffset': len(vertices),
    'indexByteLength': len(indices),
    'vertexStride': 24,
    'materials': [materials_by_name[name] for name in names],
    'draws': draws,
    'bounds': {'min': minimum, 'max': maximum},
    'camera': {
        'position': list(camera.location),
        'target': list(target),
        'up': [0, 0, 1],
        'type': 'orthographic',
        'orthoScale': camera.data.ortho_scale,
        'aspect': scene.render.resolution_x / scene.render.resolution_y,
    },
}
OUTPUT.mkdir(parents=True, exist_ok=True)
(OUTPUT / metadata['binary']).write_bytes(vertices + indices)
(OUTPUT / 'flux-capacitor.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(f'Exported {object_count} objects, {len(names)} draws, {len(vertex_lookup):,} vertices, '
      f'{len(indices) // 12:,} triangles, {len(vertices) + len(indices):,} bytes')
