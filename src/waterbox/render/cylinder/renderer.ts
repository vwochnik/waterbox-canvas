import { Size, Rectangle, calculateRectAndSize, makePatteern, makeSteps } from '../util'; import { RgbaColor, rgbaColorToString } from '../../color';
import { CylinderRenderingOptions } from '.';
import { buffer } from 'node:stream/consumers';

type PathFunction = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void;

export function render(
  options: CylinderRenderingOptions,
  canvasContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  bufferContext: OffscreenCanvasRenderingContext2D,
  tempContext: OffscreenCanvasRenderingContext2D,
): void {
  const {
    width,
    height,
    value,
    scale,
    backColorScheme,
    waterColorScheme,
    frontColorScheme,
    backPatternSource,
    waterPatternSource,
    frontPatternSource,
  } = options;

  const [rect, size] = calculateRectAndSize(options);

  bufferContext.reset();

  bufferContext.strokeStyle = 'black';
  bufferContext.save();
  wallPath(rect, size, value, 'back')(bufferContext);
  bufferContext.restore();
  bufferContext.stroke();
  for (let i = 10; i < 100; i += 10) {
    bufferContext.save();
    separatorPath(rect, size, 0.25, i, 'back')(bufferContext);
    bufferContext.restore();
    bufferContext.stroke();
    bufferContext.save();
    separatorPath(rect, size, 0.25, i, 'front')(bufferContext);
    bufferContext.restore();
    bufferContext.stroke();
  }

  canvasContext.clearRect(0, 0, width, height);
  canvasContext.drawImage(bufferContext.canvas, 0, 0);
}

function basePath(
  rect: Rectangle,
  size: Size,
  value: number,
  position: 'top' | 'bottom',
): PathFunction {
  return function (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    const fillHeight = size.h + (value / 100.0) * (rect.h - size.h);

    const x = rect.x;
    const y = rect.y + rect.h - fillHeight;
    const w = size.w;
    const h = size.h;

    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(1, h / w);

    ctx.beginPath();
    ctx.ellipse(0, 0, w/2, w/2, 0, 0, 2 * Math.PI);
  };
}

function wallPath(
  rect: Rectangle,
  size: Size,
  value: number,
  facing: 'back' | 'front' | 'outer'
): PathFunction {
  return function (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    const fillHeight = size.h + (value / 100.0) * (rect.h - size.h);

    const x = rect.x;
    const y = rect.y + rect.h - fillHeight + size.h / 2;
    const w = size.w;
    const h = fillHeight - size.h;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.ellipse(x + w / 2, y, w/2, size.h/2, 0, Math.PI, 0, facing === "front");
    ctx.lineTo(x + w, y + h);
    ctx.ellipse(x + w / 2, y + h, w/2, size.h/2, Math.PI, Math.PI, 0, facing === "back");
    ctx.lineTo(x, y);
  };
}

function separatorPath(
  rect: Rectangle,
  size: Size,
  separatorSize: number,
  value: number,
  position: 'back' | 'front',
): PathFunction {
  return function (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    const fillHeight = size.h + (value / 100) * (rect.h - size.h);

    const x = rect.x;
    const y = rect.y + rect.h - fillHeight;
    const { w, h } = size;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const angle = position === 'back' ? 1.5 * Math.PI : Math.PI / 2;
    const angleDiff = separatorSize * Math.PI / 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, w/2, h/2, 0, angle - angleDiff, angle + angleDiff);
  };
}
