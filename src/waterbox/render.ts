import { darken, lighten, parseToRgba } from 'color2k';
import { ColorScheme, Options } from './options';

type Size = {
  w: number;
  h: number;
};

type Rectangle = {
  x: number;
  y: number;
} & Size;

type PathFunction = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void;

export function render(
  options: Options,
  canvasContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  bufferContext: OffscreenCanvasRenderingContext2D,
  tempContext: OffscreenCanvasRenderingContext2D,
  backPattern?: CanvasPattern,
  waterPattern?: CanvasPattern,
  frontPattern?: CanvasPattern,
): void {
  const { width, height, value, strokeWidth, clipEdges, scale } = options;

  const backColor = getColors(options.backColorScheme);
  const waterColor = getColors(options.waterColorScheme);
  const frontColor = options.frontColorScheme ? getColors(options.frontColorScheme) : undefined;

  const actualWidth = Math.min(width, height),
    rect: Rectangle = {
      x: width / 2 - actualWidth / 2 + strokeWidth / 2,
      y: strokeWidth / 2,
      w: actualWidth - strokeWidth - 1,
      h: height - strokeWidth - 1,
    },
    size: Size = { w: rect.w, h: rect.w / 2 };

  bufferContext.clearRect(0, 0, width, height);

  paint(
    bufferContext,
    [
      (ctx) => {
        rhombusPath(ctx, rect, size, 0, 'bottom');
      },
      (ctx) => {
        wallPath(ctx, rect, size, 100, 'left', 'back');
      },
      (ctx) => {
        wallPath(ctx, rect, size, 100, 'right', 'back');
      },
    ],
    (scale ? makeSteps(scale.divisions) : []).map((step) => (ctx) => {
      separatorPath(ctx, rect, size, scale?.size ?? 0, step);
    }),
    [backColor.fill, backColor.lighter ?? backColor.fill, backColor.darker ?? backColor.fill],
    backColor.stroke,
    strokeWidth,
    clipEdges,
    tempContext,
    width,
    height,
    backPattern,
  );

  if (value > 0) {
    const fillHeight = size.h + (value / 100.0) * (rect.h - size.h);

    paint(
      bufferContext,
      [
        (ctx) => {
          wallPath(ctx, rect, size, value, 'left', 'front');
        },
        (ctx) => {
          wallPath(ctx, rect, size, value, 'right', 'front');
        },
        (ctx) => {
          rhombusPath(ctx, rect, size, value, 'top');
        },
      ],
      [],
      [
        waterColor.darker ?? waterColor?.fill,
        waterColor.lighter ?? waterColor.fill,
        waterColor.fill,
      ],
      waterColor.stroke,
      strokeWidth,
      clipEdges,
      tempContext,
      width,
      height,
      waterPattern,
    );
  }

  if (frontColor) {
    paint(
      bufferContext,
      [
        (ctx) => {
          wallPath(ctx, rect, size, 100, 'left', 'front');
        },
        (ctx) => {
          wallPath(ctx, rect, size, 100, 'right', 'front');
        },
        (ctx) => {
          rhombusPath(ctx, rect, size, 100, 'top');
        },
      ],
      [],
      [
        frontColor.darker ?? frontColor.fill,
        frontColor.lighter ?? frontColor.fill,
        frontColor.fill,
      ],
      frontColor.stroke,
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
  fillColors: string[],
  strokeColor: string,
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
  fillColor: string,
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
    tmp.fillStyle = fillColor;
    tmp.fill();
    tmp.globalCompositeOperation = 'overlay';
    tmp.fillStyle = pattern;
    tmp.fill();
    tmp.globalCompositeOperation = 'source-over';
    tmp.restore();
    ctx.drawImage(tmp.canvas, 0, 0);
  } else {
    pathFunction(ctx);
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.restore();
}

function paintEdges(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pathFunctions: PathFunction[],
  strokeColor: string,
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

  const tempStrokeColor = clipEdges ? `rgba(0,0,0,${getAlphaFromColor(strokeColor)})` : strokeColor;

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
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  size: Size,
  value: number,
  position: 'top' | 'bottom',
): void {
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
}

function wallPath(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  size: Size,
  value: number,
  position: 'left' | 'right',
  facing: 'back' | 'front',
): void {
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
}

function separatorPath(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  size: Size,
  separatorSize: number,
  value: number,
): void {
  const fillHeight = size.h + (value / 100.0) * (rect.h - size.h);

  const x = rect.x;
  const y = rect.y + rect.h - fillHeight;
  const w = size.w;
  const h = size.h;
  const s = separatorSize / 2.0;

  ctx.beginPath();
  ctx.moveTo(x + w / 2 - w * s, y + h * s);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w / 2 + w * s, y + h * s);
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
