---
title: Waterbox Canvas
options:
- name: width
  type: number
  optional: false
  description: Get or set the width of the canvas.
- name: height
  type: number
  optional: false
  description: Get or set the height of the canvas.
- name: value
  type: number
  optional: false
  description: Get or set the water fill level.
- name: backColor
  type: Color
  optional: false
  description: Get or set the color of the backside of the rendered waterbox.
  example: |
    waterbox.backColor({
      fill: 'rgba(80, 80, 111, 1)',
      stroke: 'rgba(80, 80, 111, 1)',
    });
- name: waterColor
  type: Color
  optional: false
  description: Get or set the color of the water rendered inside the waterbox.
  example: |
    waterbox.waterColor({
      fill: 'rgba(58, 123, 213, 0.9)',
      stroke: 'rgba(42, 92, 160, 0.9)',
      lighter: 'rgba(90, 149, 224, 0.9)',
      darker: 'rgba(43, 95, 168, 0.9)',
    });
- name: frontColor
  type: Color
  optional: true
  description: Get or set the color of the front of the rendered waterbox.
- name: backPattern
  type: Pattern
  optional: true
  description: Get or set the pattern drawn on top of the backside of the waterbox.
  example: |
    waterbox.backPattern({
      type: "predefined",
      name: "grid",
      size: 15,
      alpha: 1.0
    });
- name: waterPattern
  type: Pattern
  optional: true
  description: Get or set the pattern drawn on top of the water.
  example: |
    waterbox.waterPattern({
      type: "custom",
      creator: (ctx) => {
        // render pattern
        return ctx.createPattern(patternCanvas, 'repeat');
      } 
    });
- name: frontPattern
  type: Pattern
  optional: true
  description: Get or set the pattern drawn on top of the front of the waterbox.
- name: strokeWidth
  type: number
  optional: false
  description: Get or set the stroke width in pixels.
- name: scale
  type: Scale
  optional: true
  description: Get or set the scale drawn at the backside of the waterbox.
  example: |
    waterbox.scale({
      size: 0.2,
      divisions: 5,
    });
- name: clipEdges
  type: boolean
  optional: false
  description: Get or set whether edges are clipped from the drawn waterbox. If edges are clipped, they appear as transparent.
---
> A simple library that renders an isometric water box on a canvas

`waterbox-canvas` is a TypeScript/JavaScript library for rendering a water level visualization on an HTML5 Canvas or OffscreenCanvas.

## Installation

### NPM

```bash
npm install waterbox-canvas
```

### Yarn

```bash
yarn add waterbox-canvas
```

### PNPM

```bash
pnpm add waterbox-canvas
```

### Browser (Direct Include)

There is a build specifically for the browser:

```html
<script src="dist/waterbox-canvas.browser.js"></script>
```

## Basic Usage

Create a canvas element:
```html
<canvas id="my-canvas"></canvas>
```

Create Waterbox:
```typescript
import { createWaterbox } from 'waterbox-canvas';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;

// Create a waterbox instance
const waterbox = createWaterbox(canvas)
  .width(80)
  .height(120);

// Set the water level (0-100)
waterbox.value(50);

// Render the waterbox
waterbox.render();
```

## Example

```typescript
import { createWaterbox } from 'waterbox-canvas';

// Initialize waterbox
const canvas = document.getElementById('waterbox') as HTMLCanvasElement;

const waterbox = createWaterbox(canvas)
  .width(80)
  .height(120)
  .divisions(5)
  .strokeWidth(1.5)
  .waterbox.waterColor({
    fill: 'rgba(33, 150, 243, 0.8)',
    stroke: 'rgba(25, 118, 210, 0.8)',
    lighter: 'rgba(66, 165, 245, 0.8)',
    darker: 'rgba(13, 71, 161, 0.8)'
  })
  .value(20)
  .render();
```

## API Reference

### `createWaterbox(canvas: HTMLCanvasElement | OffscreenCanvas): Waterbox`

Creates a new waterbox instance for the given canvas.

**Parameters:**
- `canvas` - The HTML canvas or OffscreenCanvas element to render to

**Returns:** A Waterbox instance

### `Waterbox` properties

{% for option in options -%}
#### `{{ option.name }}`

{% if option.optional -%}
* `{{ option.name }}(): {{ option.type }} | undefined`
* `{{ option.name }}(value?: {{ option.type}}): Waterbox`
{%- else -%}
* `{{ option.name }}(): {{ option.type }}`
* `{{ option.name }}(value: {{ option.type}}): Waterbox`
{%- endif %}

{{ option.description }}

{% if option.example -%}
##### Example
```
{{ option.example -}}
```

{% endif -%}
{%- endfor -%}
#### `options`

* `options(): Options`
* `options(value: Partial<Options>): Waterbox`

Get or set multiple options at once.

## License

MIT
