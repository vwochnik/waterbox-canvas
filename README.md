<div align="center">
<h1># Waterbox Canvas</h1>

![waterbox-canvas](https://github.com/vwochnik/waterbox-canvas/blob/main/preview.png?raw=true "waterbox-canvas")

![Build](https://github.com/vwochnik/waterbox-canvas/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/v/waterbox-canvas)
![Bundle size](https://img.shields.io/bundlephobia/minzip/waterbox-canvas)
![Types](https://img.shields.io/npm/types/waterbox-canvas)
![Downloads](https://img.shields.io/npm/dm/waterbox-canvas)
![License](https://img.shields.io/npm/l/waterbox-canvas)
</div>

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

Get or set the width of the canvas.

#### `height`

* `height(): number`
* `height(value: number): Waterbox`

Get or set the height of the canvas.

#### `value`

* `value(): number`
* `value(value: number): Waterbox`

Get or set the water fill level.

#### `backColor`

* `backColor(): Color`
* `backColor(value: Color): Waterbox`

Get or set the color of the backside of the rendered waterbox.

##### Example
```
waterbox.backColor({
  fill: 'rgba(80, 80, 111, 1)',
  stroke: 'rgba(80, 80, 111, 1)',
});
```

#### `waterColor`

* `waterColor(): Color`
* `waterColor(value: Color): Waterbox`

Get or set the color of the water rendered inside the waterbox.

##### Example
```
waterbox.waterColor({
  fill: 'rgba(58, 123, 213, 0.9)',
  stroke: 'rgba(42, 92, 160, 0.9)',
  lighter: 'rgba(90, 149, 224, 0.9)',
  darker: 'rgba(43, 95, 168, 0.9)',
});
```

#### `frontColor`

* `frontColor(): Color | undefined`
* `frontColor(value?: Color): Waterbox`

Get or set the color of the front of the rendered waterbox.

#### `backPattern`

* `backPattern(): Pattern | undefined`
* `backPattern(value?: Pattern): Waterbox`

Get or set the pattern drawn on top of the backside of the waterbox.

##### Example
```
waterbox.backPattern({
  type: "predefined",
  name: "grid",
  size: 15,
  alpha: 1.0
});
```

#### `waterPattern`

* `waterPattern(): Pattern | undefined`
* `waterPattern(value?: Pattern): Waterbox`

Get or set the pattern drawn on top of the water.

##### Example
```
waterbox.waterPattern({
  type: "custom",
  creator: (ctx) => {
    // render pattern
    return ctx.createPattern(patternCanvas, 'repeat');
  } 
});
```

#### `frontPattern`

* `frontPattern(): Pattern | undefined`
* `frontPattern(value?: Pattern): Waterbox`

Get or set the pattern drawn on top of the front of the waterbox.

#### `strokeWidth`

* `strokeWidth(): number`
* `strokeWidth(value: number): Waterbox`

Get or set the stroke width in pixels.

#### `scale`

* `scale(): Scale | undefined`
* `scale(value?: Scale): Waterbox`

Get or set the scale drawn at the backside of the waterbox.

##### Example
```
waterbox.scale({
  size: 0.2,
  divisions: 5,
});
```

#### `clipEdges`

* `clipEdges(): boolean`
* `clipEdges(value: boolean): Waterbox`

Get or set whether edges are clipped from the drawn waterbox. If edges are clipped, they appear as transparent.

#### `options`

* `options(): Options`
* `options(value: Partial<Options>): Waterbox`

Get or set multiple options at once.

## License

MIT

