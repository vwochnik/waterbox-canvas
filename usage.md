---
title: Waterbox Canvas
options:
- name: width
  type: number
  optional: false
  description: Get or set the width.
- name: height
  type: number
  optional: false
  description: Get or set the height.
- name: value
  type: number
  optional: false
  description: Get or set the value.
- name: backColor
  type: Color
  optional: false
  description: Get or set the back color.
- name: waterColor
  type: Color
  optional: false
  description: Get or set the water color.
- name: frontColor
  type: Color
  optional: true
  description: Get or set the front color.
- name: backPattern
  type: Pattern
  optional: true
  description: Get or set the back pattern.
- name: waterPattern
  type: Pattern
  optional: true
  description: Get or set the water pattern.
- name: frontPattern
  type: Pattern
  optional: true
  description: Get or set the front pattern.
- name: strokeWidth
  type: number
  optional: false
  description: Get or set the stroke width.
- name: scale
  type: Scale
  optional: true
  description: Get or set the scale.
- name: clipEdges
  type: boolean
  optional: false
  description: Get or set whether edges are clipped.
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

You can also use the UMD build directly in the browser:

```html
<script src="dist/waterbox-canvas.umd.js"></script>
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

{% endfor -%}
#### `options`

* `options(): Options`
* `options(value: Partial<Options>): Waterbox`

Get or set multiple options at once.

## License

MIT
