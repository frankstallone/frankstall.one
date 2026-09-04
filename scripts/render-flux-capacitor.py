"""Build and render the original homepage flux capacitor in Blender.

Blender --background --python scripts/render-flux-capacitor.py -- --draft
Omit --draft for the production PNG and editable scene.
Use --model-only to rebuild and save the scene without rendering.
"""

import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parent.parent
DRAFT = '--draft' in sys.argv
MODEL_ONLY = '--model-only' in sys.argv
OUTPUT = ROOT / 'design/flux-capacitor'
OUTPUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, color, metal=0, roughness=0.3, transmission=0, emission=0, surface=0):
    mat = bpy.data.materials.new(name)
    mat['surface'] = surface
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metal
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Transmission Weight'].default_value = transmission
    bsdf.inputs['IOR'].default_value = 1.46
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*color, 1)
        bsdf.inputs['Emission Strength'].default_value = emission
    if surface in {1, 2, 3, 4, 6}:
        # Layer broad tarnish with fine cast/paint texture; no image textures.
        coord = nodes.new('ShaderNodeTexCoord')
        noise = nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 5.4 if surface == 1 else 8.0
        noise.inputs['Detail'].default_value = 5
        noise.inputs['Roughness'].default_value = .72
        links.new(coord.outputs['Generated'], noise.inputs['Vector'])
        ramp = nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = .22
        ramp.color_ramp.elements[0].color = (*(v*.48 for v in color), 1)
        ramp.color_ramp.elements[1].position = .78
        ramp.color_ramp.elements[1].color = (*(min(v*1.12, 1) for v in color), 1)
        links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
        links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
        fine = nodes.new('ShaderNodeTexNoise')
        fine.inputs['Scale'].default_value = 160
        fine.inputs['Detail'].default_value = 3
        links.new(coord.outputs['Generated'], fine.inputs['Vector'])
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .16
        bump.inputs['Distance'].default_value = .006
        links.new(fine.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return mat


paint = material('Weathered gray fiberglass enclosure', (.20, .215, .205), 0, .65, surface=1)
fiberglass = material('Scuffed fiberglass', (.16, .165, .14), 0, .82, surface=1)
backplate = material('Aged charcoal backplate', (.035, .039, .034), .28, .72, surface=1)
black = material('Blackened hardware', (.027, .029, .025), .40, .68, surface=6)
rubber = material('Black rubber window gasket', (.018, .021, .018), 0, .79, surface=3)
steel = material('Dull exposed steel', (.28, .29, .26), .80, .57, surface=6)
brass = material('Tarnished yellow brass', (.47, .32, .13), .76, .47, surface=2)
yellow = material('Faded ochre cable insulation', (.40, .29, .068), 0, .67, surface=3)
red = material('Oxide brown terminal boots', (.24, .087, .046), 0, .54, surface=3)
tape = material('Red embossed label tape', (.46, .020, .009), 0, .55, surface=4)
glass = material('Borosilicate conduit glass', (.71, .80, .73), 0, .15, 1, surface=5)
cover = material('Low iron protective glass', (.94, .96, .91), 0, .055, 1, surface=5)
white = material('Raised ivory label lettering', (.94, .91, .78), 0, .52, surface=0)
light = material('Incandescent amber light', (1, .22, .045), 0, .50, 0, 1.8, surface=0)
font = bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Andale Mono.ttf')


def finish(obj, name, mat, bevel=0):
    obj.name = name
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Tool radius', 'BEVEL')
        mod.width = bevel
        mod.segments = 4
    if obj.type == 'MESH':
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        mod = obj.modifiers.new('Weighted face normals', 'WEIGHTED_NORMAL')
        mod.keep_sharp = True
    return obj


def box(name, center, dimensions, mat, bevel=.03):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    obj = bpy.context.object
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat, bevel)


def cylinder(name, start, end, radius, mat, vertices=64):
    a, b = Vector(start), Vector(end)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=(b-a).length,
                                      location=(a+b)/2)
    obj = bpy.context.object
    obj.rotation_euler = (b-a).to_track_quat('Z', 'Y').to_euler()
    return finish(obj, name, mat, .009)


def cable(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 20
    curve.bevel_depth = radius
    curve.bevel_resolution = 5
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points)-1)
    for point, co in zip(spline.bezier_points, points):
        point.co = co
        point.handle_left_type = 'AUTO'
        point.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def rounded_loop(width, height, radius, y):
    # Traverse clockwise from the upper right arc through the lower right.
    coords = []
    for x,z,begin in [(width/2-radius,height/2-radius,0),
                      (width/2-radius,-height/2+radius,90),
                      (-width/2+radius,-height/2+radius,180),
                      (-width/2+radius,height/2-radius,270)]:
        for i in range(9):
            a=math.radians(begin+i*90/8)
            coords.append((x+radius*math.sin(a),y,z+radius*math.cos(a)))
    return coords


def frame(name, outer, inner, front, back, mat):
    loops = [rounded_loop(*outer, front), rounded_loop(*inner, front),
             rounded_loop(*outer, back), rounded_loop(*inner, back)]
    n=len(loops[0])
    faces=[]
    for a,b in [(0,1),(2,0),(1,3),(3,2)]:
        for i in range(n):
            j=(i+1)%n
            faces.append((a*n+i,a*n+j,b*n+j,b*n+i))
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(sum(loops,[]), [], faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    finish(obj,name,mat,.018)
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.select_set(False)
    return obj


def text(name, body, location, size, mat, align='CENTER'):
    curve=bpy.data.curves.new(name,'FONT')
    curve.body=body
    curve.size=size
    curve.align_x=align
    curve.align_y='CENTER'
    curve.font=font
    curve.space_character=1.12
    curve.resolution_u=3
    curve.extrude=.0015
    curve.bevel_depth=.0003
    curve.bevel_resolution=0
    obj=bpy.data.objects.new(name,curve)
    bpy.context.collection.objects.link(obj)
    obj.location=location
    obj.rotation_euler=(math.pi/2,0,0)
    curve.materials.append(mat)
    return obj


# Fiberglass electrical enclosure and rubber-lined inspection window.
box('Rear enclosure', (0,.23,0), (3.72,.56,4.38), paint, .16)
frame('Deep painted enclosure', (3.8,4.46,.26), (3.28,3.77,.72), -.65,.18,paint)
frame('Enclosure seam', (3.81,4.47,.26), (3.73,4.39,.23), -.51,-.42,black)
box('Recessed steel backplate',(0,-.094,0),(3.26,.11,3.75),backplate,.24)
frame('Thick window gasket', (3.32,3.81,.75),(3.10,3.58,.65),-.805,-.645,rubber)
frame('Broad painted front bezel', (3.83,4.49,.26),(3.32,3.81,.75),-.80,-.63,paint)
frame('Gasket inner rolled edge',(3.15,3.63,.68),(3.09,3.57,.65),-.82,-.78,rubber)

for x in [-1.29,1.29]:
    for z in [-1.47,1.44]:
        cylinder('Backplate screw',(x,-.15,z),(x,-.19,z),.045,steel,32)
        box('Backplate screw slot',(x,-.195,z),(.045,.008,.009),black,.002)

# Clear relay tubes sit above sloping acrylic light blocks. The dark contacts
# remain visible in silhouette; the concealed warm light is behind the glass.
center=Vector((0,-.47,-.18))
ends=[Vector((-.97,-.47,.94)),Vector((.97,-.47,.94)),Vector((-.10,-.47,-1.34))]
for number, endpoint in enumerate(ends,1):
    direction=(endpoint-center).normalized()
    across=Vector((direction.z,0,-direction.x))
    angle=math.atan2(direction.x,direction.z)
    inner=center+direction*.035
    outer=endpoint-direction*.08
    # A wedge, not a solid metal Y. Each inner tip ends before the junction.
    vertices=[]
    for p, front_y, half_width in [(inner,-.395,.055),(outer,-.49,.105)]:
        for y in [-.27,front_y]:
            for side in [-1,1]:
                q=p+across*half_width*side
                vertices.append((q.x,y,q.z))
    mesh=bpy.data.meshes.new(f'Branch {number} acrylic prism')
    mesh.from_pydata(vertices,[],[(0,1,3,2),(4,6,7,5),(0,4,5,1),
                                (0,2,6,4),(1,5,7,3),(2,3,7,6)])
    mesh.update()
    prism=bpy.data.objects.new(f'Branch {number} · sloping acrylic light block',mesh)
    bpy.context.collection.objects.link(prism)
    finish(prism,prism.name,black)
    mesh.materials.append(glass)
    mesh.polygons[-1].material_index=1
    # The translucent illuminated face carries the three shader light pools.
    a=center+direction*.08
    b=endpoint-direction*.17
    front_a=-.395-((a-inner).length)/((outer-inner).length)*.095
    front_b=-.395-((b-inner).length)/((outer-inner).length)*.095
    points=[]
    for p,y in [(a,front_a-.003),(b,front_b-.003)]:
        for side in [-1,1]:
            q=p+across*.041*side
            points.append((q.x,y,q.z))
    lit_mesh=bpy.data.meshes.new(f'Branch {number} backlight face')
    lit_mesh.from_pydata(points,[],[(0,1,3,2)])
    lit_mesh.update()
    lit=bpy.data.objects.new(f'Branch {number} · concealed amber light',lit_mesh)
    bpy.context.collection.objects.link(lit)
    finish(lit,lit.name,light)
    # Two thin brass rails and small black brackets support the transparent tube.
    for side in [-1,1]:
        rail_a=center+direction*.34+across*.088*side+Vector((0,-.043,0))
        rail_b=endpoint-direction*.12+across*.088*side+Vector((0,-.043,0))
        cylinder(f'Branch {number} · brass cradle rail',rail_a,rail_b,.011,brass,16)
    for fraction in [.31,.76]:
        p=center+(endpoint-center)*fraction+Vector((0,-.045,0))
        for side in [-1,1]:
            q=p+across*.108*side
            clamp=box(f'Branch {number} · secondary black bracket',q,(.04,.11,.055),black,.006)
            clamp.rotation_euler=(0,angle,0)
            cylinder(f'Branch {number} · cradle screw',(q.x,-.57,q.z),(q.x,-.584,q.z),.018,steel,16)
    start=center+direction*.35+Vector((0,-.072,0))
    end=endpoint+direction*.02+Vector((0,-.072,0))
    cylinder(f'Branch {number} · clear relay stem',start,end,.074,glass,40)
    cylinder(f'Branch {number} · internal brass contact',start,end,.013,brass,20)
    for fraction in [.33,.79]:
        p=center+(endpoint-center)*fraction+Vector((0,-.072,0))
        cylinder(f'Branch {number} · relay contact collar',p-direction*.013,p+direction*.013,.081,brass,32)
    # Broad round actuator and transverse glass capsule give each relay its T form.
    p=endpoint+direction*.12
    cylinder(f'Branch {number} · terminal base',(p.x,-.18,p.z),(p.x,-.31,p.z),.265,steel,48)
    cylinder(f'Branch {number} · base brass rim',(p.x,-.302,p.z),(p.x,-.323,p.z),.271,brass,48)
    cylinder(f'Branch {number} · glass terminal',(p.x,-.28,p.z),(p.x,-.57,p.z),.191,glass,48)
    cylinder(f'Branch {number} · internal terminal',(p.x,-.24,p.z),(p.x,-.56,p.z),.071,steel,32)
    bpy.ops.mesh.primitive_torus_add(major_segments=48, minor_segments=10,
        location=(p.x,-.58,p.z), rotation=(math.pi/2,0,0), major_radius=.178, minor_radius=.023)
    finish(bpy.context.object,f'Branch {number} · hollow terminal rim',brass)
    for dx in [-.115,.115]:
        cylinder(f'Branch {number} · terminal tie rod',(p.x+dx,-.25,p.z),(p.x+dx,-.57,p.z),.013,steel,16)
    sign=-1 if number in {1,3} else 1
    cable(f'Branch {number} · bent oxide boot',[(p.x,-.59,p.z),(p.x+sign*.15,-.63,p.z-.025),(p.x+sign*.19,-.62,p.z-.23)],.089,red)

# Loose muted leads, as fitted to the practical prop.
cable('Left ochre lead',[(-1.24,-.60,.78),(-1.23,-.57,.42),(-1.13,-.48,.12),(-.93,-.40,.03),(-.78,-.35,.08)],.035,yellow)
cable('Right ochre lead',[(1.24,-.60,.78),(1.30,-.48,.38),(1.30,-.28,-.02),(1.12,-.23,-.14)],.035,yellow)
cable('Lower ochre lead',[(-.30,-.60,-1.56),(-.56,-.46,-1.63),(-1.06,-.28,-1.51),(-1.22,-.24,-1.21)],.035,yellow)

# Thin protective glazing retains the heavily rounded window silhouette.
# Build its face explicitly to avoid cube bevel clamping on thin glass.
outline=rounded_loop(3.12,3.60,.67,-.76)
n=len(outline)
mesh=bpy.data.meshes.new('Rounded protective glazing')
mesh.from_pydata(outline+[(x,-.735,z) for x,y,z in outline],[],
                 [tuple(reversed(range(n))),tuple(range(n,2*n))]+
                 [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)])
mesh.update()
panel=bpy.data.objects.new('Protective glass',mesh)
bpy.context.collection.objects.link(panel)
finish(panel,panel.name,cover)

# Red Dymo-style tape: actual raised, spaced lettering on slightly uneven strips.
def label(name, body, center, width, height, size, angle=0):
    strip=box(name+' · red tape',center,(width,.026,height),tape,.006)
    strip.rotation_euler.y=angle
    lettering=text(name+' · embossed letters',body,(center[0],center[1]-.019,center[2]),size,white)
    bpy.context.view_layer.update()
    scale=min((width-.18)/lettering.dimensions.x, height*.60/lettering.dimensions.z)
    lettering.scale=(scale,scale,scale)
    lettering.rotation_euler.y=angle
    return strip

label('Disconnect warning','DISCONNECT CAPACITOR DRIVE',(0,-.827,2.089),2.57,.166,.132,-.012)
label('Opening warning','BEFORE OPENING',(.02,-.83,1.895),1.48,.164,.132,.009)
label('Eye shield warning','SHIELD EYES FROM LIGHT',(0,-.846,-.83),2.35,.196,.143,-.008)

# Sparse small paint losses, concentrated on exposed edges; no repeating grunge.
rng=random.Random(41)
for i in range(31):
    side=rng.choice([-1,1])
    x=side*rng.uniform(1.76,1.86)
    z=rng.uniform(-1.97,1.98)
    chip=box('Small fiberglass edge scuff',(x,-.803,z),(rng.uniform(.013,.048),.006,rng.uniform(.007,.026)),fiberglass,.002)
    chip.rotation_euler.y=rng.uniform(-.7,.7)

# The standalone enclosure has small latches, without a looped side handle.
for z in [-1.15,1.10]:
    box('Enclosure toggle latch plate',(1.925,-.39,z),(.045,.30,.24),steel,.02)
    cylinder('Enclosure latch pivot',(1.963,-.50,z-.055),(1.963,-.27,z-.055),.028,steel,24)
    box('Enclosure latch lever',(1.981,-.39,z+.065),(.037,.12,.17),steel,.012)
for x in [-1.64,1.64]:
    for z in [-2.18,2.18]:
        box('Mounting ear',(x,.35,z),(.42,.25,.35),paint,.045)


def area(name, position, target, energy, color, size, size_y=None):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy
    data.color=color
    data.shape='RECTANGLE'
    data.size=size
    data.size_y=size_y or size
    obj=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(obj)
    obj.location=position
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()


area('Large softbox · left',(-4,-5,7),(0,0,0),700,(.85,.93,1),4,3)
area('Edge strip · right',(4,1,3),(0,0,0),1400,(.77,.88,1),1.5,5)
area('Warm fill',(-3,-1,-3),(0,0,0),260,(1,.85,.67),3,3)
area('Front reflection strip',(-4.6,-7,0),(0,0,0),35,(1,1,1),.22,9)

scene=bpy.context.scene
world=bpy.data.worlds.new('Neutral studio')
world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.42,.47,.53,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.4
scene.world=world
bpy.ops.object.camera_add(location=(5.2,-12.6,4.4))
camera=bpy.context.object
camera.name='Product camera'
camera.rotation_euler=(Vector((.10,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=6.85
scene.camera=camera
scene.render.engine='CYCLES'
scene.cycles.samples=40 if DRAFT else 160
scene.cycles.use_denoising=True
scene.cycles.max_bounces=12
scene.cycles.transmission_bounces=8
scene.cycles.device='CPU'
scene.render.resolution_x=760 if DRAFT else 1520
scene.render.resolution_y=620 if DRAFT else 1240
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
scene.render.filepath=str(OUTPUT/'preview.png' if DRAFT else ROOT/'src/assets/flux-capacitor.png')
if not DRAFT:
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT/'flux-capacitor.blend'),compress=True)
if not MODEL_ONLY:
    bpy.ops.render.render(write_still=True)
