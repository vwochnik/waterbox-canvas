# Waterbox Canvas

![waterbox-canvas](https://github.com/vwochnik/waterbox-canvas/blob/main/preview.png?raw=true "waterbox-canvas")

![Build](https://github.com/vwochnik/waterbox-canvas/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/v/waterbox-canvas)
![Bundle size](https://img.shields.io/bundlephobia/minzip/waterbox-canvas)
![Types](https://img.shields.io/npm/types/waterbox-canvas)
![Downloads](https://img.shields.io/npm/dm/waterbox-canvas)
![License](https://img.shields.io/npm/l/waterbox-canvas)

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

#### `width`

* `width(): number`
* `width(value: number): Waterbox`

Get or set the width.

#### `height`

* `height(): number`
* `height(value: number): Waterbox`

Get or set the height.

#### `value`

* `value(): number`
* `value(value: number): Waterbox`

Get or set the value.

#### `backColor`

* `backColor(): Color`
* `backColor(value: Color): Waterbox`

Get or set the back color.

#### `waterColor`

* `waterColor(): Color`
* `waterColor(value: Color): Waterbox`

Get or set the water color.

#### `frontColor`

* `frontColor(): Color | undefined`
* `frontColor(value?: Color): Waterbox`

Get or set the front color.

#### `backPattern`

* `backPattern(): Pattern | undefined`
* `backPattern(value?: Pattern): Waterbox`

Get or set the back pattern.

#### `waterPattern`

* `waterPattern(): Pattern | undefined`
* `waterPattern(value?: Pattern): Waterbox`

Get or set the water pattern.

#### `frontPattern`

* `frontPattern(): Pattern | undefined`
* `frontPattern(value?: Pattern): Waterbox`

Get or set the front pattern.

#### `strokeWidth`

* `strokeWidth(): number`
* `strokeWidth(value: number): Waterbox`

Get or set the stroke width.

#### `scale`

* `scale(): Scale | undefined`
* `scale(value?: Scale): Waterbox`

Get or set the scale.

#### `clipEdges`

* `clipEdges(): boolean`
* `clipEdges(value: boolean): Waterbox`

Get or set whether edges are clipped.

#### `options`

* `options(): Options`
* `options(value: Partial<Options>): Waterbox`

Get or set multiple options at once.

## License

MIT

