# Homepage flux capacitor

An original procedural Blender model, shaped after the practical film prop and
exported as real mesh geometry for the homepage's vgpu renderer. The enclosure has
worn gray fiberglass, a deeply rounded window and black rubber gasket. Separate
sloping acrylic light blocks sit beneath clear glass relays, brass contacts, and
dark cradles. Broad relay bases carry bent oxide boots and loose ochre leads.
Three red label-tape strips have raised ivory text:

- `DISCONNECT CAPACITOR DRIVE`
- `BEFORE OPENING`
- `SHIELD EYES FROM LIGHT`

See [the prop research](research.md) for sources, confidence, and art direction.

The labels use Andale Mono regular, converted to mesh geometry during export. The
font is packed into the saved Blender scene. The rebuild script loads the font
from macOS's `/System/Library/Fonts/Supplemental/Andale Mono.ttf`.

## Files

- `flux-capacitor.blend`: editable compressed scene, named parts, packed font,
  materials, camera, and studio lights.
- `preview.png`: 760 × 620 transparent draft.
- `../../src/assets/flux-capacitor.png`: 1520 × 1240 transparent production render.
- `../../scripts/render-flux-capacitor.py`: rebuilds the scene and renders it.
- `../../scripts/export-flux-capacitor.py`: exports the saved scene for vgpu.
- `../../public/models/flux-capacitor.bin`: positions, normals, and indices.
- `../../public/models/flux-capacitor.json`: materials, draws, bounds, and camera.

## Build and render

Tested with Blender 5.2.1 LTS and Cycles CPU. From the repository root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python scripts/render-flux-capacitor.py -- --draft
```

Omit `-- --draft` to save the editable scene and render the production PNG. Use
`-- --model-only` to rebuild and save without rendering. The production render uses
160 samples; the draft uses 40. Both use denoising, AgX, and transparent film.
The original three-quarter orthographic camera and framing are preserved.

The script reconstructs the scene. Save manual Blender edits under a different
file name before running it. No downloaded model or texture is needed.

## Export browser geometry

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python scripts/export-flux-capacitor.py
```

This reads the saved scene and writes only the two files under `public/models`.
It evaluates render-visible modifiers and converts text and curves to triangles.
The current export contains 180 objects and 14 material draws in a roughly
2.6 MB binary. Vertex and triangle counts are recorded in the JSON export.

The binary is little-endian: interleaved float32 world positions and face-corner
normals (`position.xyz`, `normal.xyz`, 24 bytes per vertex), followed by uint32
triangle indices. JSON provides byte offsets and lengths. Each draw references a
material and gives `firstIndex` and `indexCount` in index units. Shared vertices
are deduplicated by position and normal. Coordinates remain Blender Z-up; the
front points toward negative Y. The camera is at `(5.2, -12.6, 4.4)`.

## Materials and patina

Material colors are linear RGB. `emission` includes emission strength. `kind` is
`opaque`, `core` for the amber illuminated acrylic faces, or `glass`. Glass draws
come last, with alpha 0.06 for the protective panel and 0.12 for conduit envelopes
and terminals. These values approximate transmission in the browser.

Every material has a numeric `surface`, exported from its Blender custom property:

| Value | Surface |
| --- | --- |
| 0 | Clean parts, raised lettering, emissive cores |
| 1 | Painted enclosure and backplate |
| 2 | Aged brass |
| 3 | Rubber and cable insulation |
| 4 | Red label tape |
| 5 | Glass |
| 6 | Steel |

The live shader uses this classification for material-specific patina. Blender
uses layered procedural noise for uneven paint, tarnish, and fine surface texture.
Small scuffs along exposed fiberglass edges are physical geometry. The still and live
renderer share geometry and base materials; procedural shading is not baked into
the mesh and each renderer supplies its own lighting.

The live light uses an inward 2.1-second amber chase with overlapping pools and
soft decay. It runs while visible, with a modest hover boost and bounded click
surge. Reduced motion holds a steady warm level and still gives charge feedback.
