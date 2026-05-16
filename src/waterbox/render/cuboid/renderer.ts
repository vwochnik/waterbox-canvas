import { Size, Rectangle, PathFunction, calculateRectAndSize, makePatteern, makeSteps } from '../util';
import { RgbaColor, rgbaColorToString } from '../../color';
import { CuboidRenderingOptions } from '.';
import { rhombusPath, wallPath, separatorPath, outerPath } from './paths';

export function render(
  options: CuboidRenderingOptions,
  canvasContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  bufferContext: OffscreenCanvasRenderingContext2D,
  tempContext: OffscreenCanvasRenderingContext2D,
): void {
  const {
    width,
    height,
    value,
    clipEdges,
    scale,
    backColorScheme,
    waterColorScheme,
    frontColorScheme,
    backPatternSource,
    waterPatternSource,
    frontPatternSource,
  } = options;
  const scalePosition = options.scale?.position ?? 'back';
  const outerStrokeWidth = options.strokeWidths.outer;
  const innerStrokeWidth = options.strokeWidths.inner;

  const backPattern = makePatteern(bufferContext, backPatternSource);
  const waterPattern = makePatteern(bufferContext, waterPatternSource);
  const frontPattern = makePatteern(bufferContext, frontPatternSource);

  const [rect, size] = calculateRectAndSize(options);

  bufferContext.reset();

  paint(
    bufferContext,
    [
      rhombusPath(rect, size, 0, 'bottom', options.alignPatternToEdges ?? false),
      wallPath(rect, size, 100, 'left', 'back', options.alignPatternToEdges ?? false),
      wallPath(rect, size, 100, 'right', 'back', options.alignPatternToEdges ?? false),
    ],
    (scale && scalePosition === 'back' ? makeSteps(scale.divisions) : []).map((step) =>
      separatorPath(rect, size, scale?.size ?? 0, step, 'back'),
    ),
    outerPath(rect, size, 100),
    [backColorScheme.fill, backColorScheme.lighter, backColorScheme.darker],
    backColorScheme.innerStroke,
    backColorScheme.outerStroke,
    innerStrokeWidth,
    outerStrokeWidth,
    clipEdges,
    tempContext,
    width,
    height,
    backPattern,
  );

  if (value > 0) {
    paint(
      bufferContext,
      [
        wallPath(rect, size, value, 'left', 'front', options.alignPatternToEdges ?? false),
        wallPath(rect, size, value, 'right', 'front', options.alignPatternToEdges ?? false),
        rhombusPath(rect, size, value, 'top', options.alignPatternToEdges ?? false),
      ],
      (scale && scalePosition === 'water' ? makeSteps(scale.divisions, value) : []).map((step) =>
        separatorPath(rect, size, scale?.size ?? 0, step, 'front'),
      ),
      outerPath(rect, size, value),
      [waterColorScheme.darker, waterColorScheme.lighter, waterColorScheme.fill],
      waterColorScheme.innerStroke,
      waterColorScheme.outerStroke,
      innerStrokeWidth,
      outerStrokeWidth,
      clipEdges,
      tempContext,
      width,
      height,
      waterPattern,
    );
  }

  if (frontColorScheme) {
    paint(
      bufferContext,
      [
        wallPath(rect, size, 100, 'left', 'front', options.alignPatternToEdges ?? false),
        wallPath(rect, size, 100, 'right', 'front', options.alignPatternToEdges ?? false),
        rhombusPath(rect, size, 100, 'top', options.alignPatternToEdges ?? false),
      ],
      (scale && scalePosition === 'front' ? makeSteps(scale.divisions) : []).map((step) =>
        separatorPath(rect, size, scale?.size ?? 0, step, 'front'),
      ),
      outerPath(rect, size, 100),
      [frontColorScheme.darker, frontColorScheme.lighter, frontColorScheme.fill],
      frontColorScheme.innerStroke,
      frontColorScheme.outerStroke,
      innerStrokeWidth,
      outerStrokeWidth,
      clipEdges,
      tempContext,
      width,
      height,
      frontPattern,
    );
  }

  canvasContext.clearRect(0, 0, width, height);
  canvasContext.drawImage(bufferContext.canvas, 0, 0);
}

function paint(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  fillPaths: PathFunction[],
  strokePaths: PathFunction[],
  outerPath: PathFunction,
  fillColors: RgbaColor[],
  innerStrokeColor: RgbaColor,
  outerStrokeColor: RgbaColor,
  innerStrokeWidth: number,
  outerStrokeWidth: number,
  clipEdges: boolean,
  tmp: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  pattern?: CanvasPattern,
) {
  paintFilling(ctx, fillPaths, fillColors, tmp, width, height, pattern);

  paintEdges(
    ctx,
    [...fillPaths, ...strokePaths],
    outerPath,
    innerStrokeColor,
    outerStrokeColor,
    innerStrokeWidth,
    outerStrokeWidth,
    clipEdges,
    tmp,
    width,
    height,
  );
}

function paintFilling(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  paths: PathFunction[],
  fillColors: RgbaColor[],
  tmp: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  pattern?: CanvasPattern,
): void {
  tmp.clearRect(0, 0, width, height);
  paths.forEach((path, index) => {
    tmp.save();
    path(tmp);
    tmp.fillStyle = rgbaColorToString(fillColors[index]);
    tmp.fill();

    if (pattern) {
      tmp.globalCompositeOperation = 'overlay';
      tmp.fillStyle = pattern;
      tmp.fill();
      tmp.globalCompositeOperation = 'source-over';
    }
    tmp.restore();
  });
  ctx.drawImage(tmp.canvas, 0, 0);
}

function paintEdges(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pathFunctions: PathFunction[],
  outerPathFunction: PathFunction,
  innerStrokeColor: RgbaColor,
  outerStrokeColor: RgbaColor,
  innerStrokeWidth: number,
  outerStrokeWidth: number,
  clipEdges: boolean,
  tmp: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  tmp.clearRect(0, 0, width, height);

  tmp.lineCap = 'round';
  tmp.lineJoin = 'round';
  tmp.lineWidth = innerStrokeWidth;
  tmp.strokeStyle = clipEdges ? 'black' : rgbaColorToString({ ...innerStrokeColor, a: 1.0 });

  pathFunctions.forEach(strokePath(tmp));

  tmp.globalCompositeOperation = 'destination-out';
  tmp.lineWidth = outerStrokeWidth;
  tmp.strokeStyle = 'black';
  strokePath(tmp)(outerPathFunction);
  tmp.globalCompositeOperation = 'source-over';

  copyEdges(ctx, tmp, innerStrokeColor, clipEdges);

  tmp.clearRect(0, 0, width, height);

  tmp.strokeStyle = clipEdges ? 'black' : rgbaColorToString({ ...outerStrokeColor, a: 1.0 });
  tmp.lineWidth = outerStrokeWidth;
  strokePath(tmp)(outerPathFunction);

  copyEdges(ctx, tmp, outerStrokeColor, clipEdges);
}

function copyEdges(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  tmp: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  strokeColor: RgbaColor,
  clipEdges: boolean,
) {
  ctx.globalAlpha = strokeColor.a;
  if (clipEdges) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(tmp.canvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.drawImage(tmp.canvas, 0, 0);
  }
  ctx.globalAlpha = 1.0;
}

function strokePath(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  return function (pathFunction: PathFunction) {
    ctx.save();
    pathFunction(ctx);
    ctx.restore();
    ctx.stroke();
  };
}
