import { darken, lighten, parseToRgba } from 'color2k';
import { ColorScheme, Options } from './options';
import { RawColor, RawColorScheme, rawColorToString } from './color';

type Size = {
  w: number;
  h: number;
};

type Rectangle = {
  x: number;
  y: number;
} & Size;

type PathFunction = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void;

const DEFAULT_TILT_ANGLE = Math.atan(1.0 / Math.sqrt(2.0)) * 180 / Math.PI;

export function render(
  options: Options,
  canvasContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  bufferContext: OffscreenCanvasRenderingContext2D,
  tempContext: OffscreenCanvasRenderingContext2D,
  rawBackColorScheme: RawColorScheme,
  rawWaterColorScheme: RawColorScheme,
  rawFrontColorScheme?: RawColorScheme,
  backPattern?: CanvasPattern,
  waterPattern?: CanvasPattern,
  frontPattern?: CanvasPattern,
): void {
  const { width, height, value, strokeWidth, clipEdges, scale } = options;
  const tiltAngle = options.tiltAngle ?? DEFAULT_TILT_ANGLE;
  const scalePosition = options.scale?.position ?? 'back';

  const actualWidth = Math.min(width, height),
    rect: Rectangle = {
      x: width / 2 - actualWidth / 2 + strokeWidth / 2,
      y: strokeWidth / 2,
      w: actualWidth - strokeWidth - 1,
      h: height - strokeWidth - 1,
    },
    size: Size = { w: rect.w, h: rect.w * Math.sin(tiltAngle * Math.PI / 180) };

  bufferContext.clearRect(0, 0, width, height);

  paint(
    bufferContext,
    [
      rhombusPath(rect, size, 0, 'bottom'),
      wallPath(rect, size, 100, 'left', 'back'),
      wallPath(rect, size, 100, 'right', 'back'),
    ],
    (scale && scalePosition === 'back' ? makeSteps(scale.divisions) : []).map((step) =>
      separatorPath(rect, size, scale?.size ?? 0, step, 'back'),
    ),
    [rawBackColorScheme.fill, rawBackColorScheme.lighter, rawBackColorScheme.darker],
    rawBackColorScheme.stroke,
    strokeWidth,
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
        wallPath(rect, size, value, 'left', 'front'),
        wallPath(rect, size, value, 'right', 'front'),
        rhombusPath(rect, size, value, 'top'),
      ],
      [],
      [
        rawWaterColorScheme.darker,
        rawWaterColorScheme.lighter,
        rawWaterColorScheme.fill,
      ],
      rawWaterColorScheme.stroke,
      strokeWidth,
      clipEdges,
      tempContext,
      width,
      height,
      waterPattern,
    );
  }

  if (rawFrontColorScheme) {
    paint(
      bufferContext,
      [
        wallPath(rect, size, 100, 'left', 'front'),
        wallPath(rect, size, 100, 'right', 'front'),
        rhombusPath(rect, size, 100, 'top'),
      ],
      (scale && scalePosition === 'front' ? makeSteps(scale.divisions) : []).map((step) =>
        separatorPath(rect, size, scale?.size ?? 0, step, 'front'),
      ),
      [
        rawFrontColorScheme.darker,
        rawFrontColorScheme.lighter,
        rawFrontColorScheme.fill,
      ],
      rawFrontColorScheme.stroke,
      strokeWidth,
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
  fillColors: RawColor[],
  strokeColor: RawColor,
  strokeWidth: number,
  clipEdges: boolean,
  tmp: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  pattern?: CanvasPattern,
) {
  fillPaths.forEach((path, index) => {
    paintFilling(ctx, path, fillColors[index], tmp, width, height, pattern);
  });

  paintEdges(
    ctx,
    [...fillPaths, ...strokePaths],
    strokeColor,
    strokeWidth,
    clipEdges,
    tmp,
    width,
    height,
  );
}

function paintFilling(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pathFunction: PathFunction,
  fillColor: RawColor,
  tmp: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  pattern?: CanvasPattern,
): void {
  ctx.save();
  if (pattern) {
    tmp.save();
    tmp.clearRect(0, 0, width, height);
    pathFunction(tmp);
    tmp.fillStyle = rawColorToString(fillColor);
    tmp.fill();
    tmp.globalCompositeOperation = 'overlay';
    tmp.fillStyle = pattern;
    tmp.fill();
    tmp.globalCompositeOperation = 'source-over';
    tmp.restore();
    ctx.drawImage(tmp.canvas, 0, 0);
  } else {
    pathFunction(ctx);
    ctx.fillStyle = rawColorToString(fillColor);
    ctx.fill();
  }
  ctx.restore();
}

function paintEdges(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pathFunctions: PathFunction[],
  strokeColor: RawColor,
  strokeWidth: number,
  clipEdges: boolean,
  tmp: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  tmp.clearRect(0, 0, width, height);

  tmp.lineWidth = strokeWidth;
  tmp.lineCap = 'round';
  tmp.lineJoin = 'round';

  const tempStrokeColor = clipEdges ? `rgba(0,0,0,${strokeColor.a})` : rawColorToString(strokeColor);

  pathFunctions.forEach((pathFunction, idx) => {
    tmp.save();
    pathFunction(tmp);
    tmp.restore();
    tmp.globalCompositeOperation = 'destination-out';
    tmp.strokeStyle = 'black';
    tmp.stroke();
    tmp.globalCompositeOperation = 'source-over';
    tmp.strokeStyle = tempStrokeColor;
    tmp.stroke();
  });

  if (clipEdges) {
    ctx.globalCompositeOperation = 'destination-out';
  }
  ctx.drawImage(tmp.canvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

function rhombusPath(
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

    const a = 0.5 * Math.hypot(w, h),
      b = Math.sqrt(2 * a * a);

    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(w / b, h / b);
    ctx.rotate(Math.PI / 4);

    ctx.beginPath();
    ctx.rect(-a / 2, -a / 2, a, a);

    if (position === 'top') {
      ctx.translate(-a / 2, -a / 2 + 2 * a);
    } else {
      ctx.translate(a / 2 - 2 * a, a / 2);
    }
  };
}

function wallPath(
  rect: Rectangle,
  size: Size,
  value: number,
  position: 'left' | 'right',
  facing: 'back' | 'front',
): PathFunction {
  return function (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    const fillHeight = size.h + (value / 100.0) * (rect.h - size.h);

    const offset = facing === 'front' ? size.h / 2 : -size.h / 2;
    const leftOffset = position === 'right' ? offset : 0;
    const rightOffset = position === 'left' ? offset : 0;

    const x = rect.x + (position === 'right' ? size.w / 2 : 0);
    const w = size.w / 2;
    const y = rect.y + rect.h - fillHeight + size.h / 2;
    const h = fillHeight - size.h;

    const skewY = w === 0 ? 0 : (rightOffset - leftOffset) / w;

    ctx.translate(x, y + leftOffset);
    ctx.transform(1, skewY, 0, 1, 0, 0);

    ctx.beginPath();
    ctx.rect(0, 0, w, h);

    ctx.translate(-x, facing === 'back' ? h : 0);

    const scale = w / Math.hypot(rightOffset - leftOffset, w);
    ctx.scale(scale, 1);
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

    const w = size.w;
    const h = size.h;

    const s = separatorSize * 0.5;
    const halfW = w * 0.5;
    const dx = w * s;
    const dy = h * s;

    const cx = x + halfW;

    const isBack = position === 'back';
    const tipY = y + (isBack ? 0 : h);
    const sideY = y + (isBack ? dy : h - dy);

    ctx.beginPath();
    ctx.moveTo(cx - dx, sideY);
    ctx.lineTo(cx, tipY);
    ctx.lineTo(cx + dx, sideY);
  };
}

function makeSteps(divisions: number): number[] {
  const step = 100 / divisions;

  return Array.from({ length: divisions - 1 }, (_, i) => step * (i + 1));
}

function getColors(colorScheme: ColorScheme): {
  stroke: string;
  fill: string;
  lighter: string;
  darker: string;
} {
  if ('contrast' in colorScheme) {
    return {
      fill: darken(colorScheme.fill, 0),
      stroke: darken(colorScheme.stroke, 0),
      lighter: lighten(colorScheme.fill, colorScheme.contrast),
      darker: darken(colorScheme.fill, colorScheme.contrast),
    };
  }
  return { ...colorScheme };
}

function getAlphaFromColor(color: string): number {
  return parseToRgba(color)[3];
}
