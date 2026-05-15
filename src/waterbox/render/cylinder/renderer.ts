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
  basePath(rect, size, value, 'top', true)(bufferContext);
  bufferContext.restore();
  bufferContext.stroke();

  canvasContext.clearRect(0, 0, width, height);
  canvasContext.drawImage(bufferContext.canvas, 0, 0);
}

function basePath(
  rect: Rectangle,
  size: Size,
  value: number,
  position: 'top' | 'bottom',
  alignToEdges: boolean,
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
