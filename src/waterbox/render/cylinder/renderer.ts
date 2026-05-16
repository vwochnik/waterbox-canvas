import { Size, Rectangle, PathFunction, calculateRectAndSize, makePatteern, makeSteps } from '../util'; import { RgbaColor, rgbaColorToString } from '../../color';
import { CylinderRenderingOptions } from '.';
import { basePath, wallPath, separatorPath } from './paths';

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
