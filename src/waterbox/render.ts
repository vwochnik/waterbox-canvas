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

  const bottomRhombusRect: Rectangle = {
    x: rect.x,
    y: rect.y + rect.h - size.h,
    w: size.w,
    h: size.h,
  };
  const leftBackWallRect: Rectangle = { x: rect.x, y: rect.y, w: size.w / 2, h: rect.h };
  const rightBackWallRect: Rectangle = {
    x: rect.x + rect.w / 2,
    y: rect.y,
    w: size.w / 2,
    h: rect.h,
  };

  const scaleRects = scale
    ? makeSteps(scale.divisions).map(
        (step): Rectangle => ({
          x: rect.x,
          y: rect.y + rect.h - size.h - ((rect.h - size.h) * step) / 100.0,
          w: size.w,
          h: size.h,
        }),
      )
    : [];

  paint(
    bufferContext,
    [
      (ctx) => {
        rhombusPath(ctx, bottomRhombusRect, 'bottom');
      },
      (ctx) => {
        wallPath(ctx, leftBackWallRect, size, 0, -size.h / 2, 'back');
      },
      (ctx) => {
        wallPath(ctx, rightBackWallRect, size, -size.h / 2, 0, 'back');
      },
    ],
    scaleRects.map((rect) => (ctx) => separatorPath(ctx, rect, scale?.size ?? 0)),
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

    const leftFillWallRect: Rectangle = {
      x: rect.x,
      y: rect.y + rect.h - fillHeight,
      w: size.w / 2,
      h: fillHeight,
    };
    const rightFillWallRect: Rectangle = {
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h - fillHeight,
      w: size.w / 2,
      h: fillHeight,
    };
    const fillTopRhombusRect: Rectangle = {
      x: rect.x,
      y: rect.y + rect.h - fillHeight,
      w: size.w,
      h: size.h,
    };
    paint(
      bufferContext,
      [
        (ctx) => {
          wallPath(ctx, leftFillWallRect, size, 0, size.h / 2, 'front');
        },
        (ctx) => {
          wallPath(ctx, rightFillWallRect, size, size.h / 2, 0, 'front');
        },
        (ctx) => {
          rhombusPath(ctx, fillTopRhombusRect, 'top');
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
    const leftFrontWallRect: Rectangle = { x: rect.x, y: rect.y, w: size.w / 2, h: rect.h };
    const rightFrontWallRect: Rectangle = {
      x: rect.x + rect.w / 2,
      y: rect.y,
      w: size.w / 2,
      h: rect.h,
    };
    const topRhombusRect: Rectangle = { x: rect.x, y: rect.y, w: size.w, h: size.h };

    paint(
      bufferContext,
      [
        (ctx) => {
          wallPath(ctx, leftFrontWallRect, size, 0, size.h / 2, 'front');
        },
        (ctx) => {
          wallPath(ctx, rightFrontWallRect, size, size.h / 2, 0, 'front');
        },
        (ctx) => {
          rhombusPath(ctx, topRhombusRect, 'top');
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
  position: 'top' | 'bottom',
): void {
  const a = 0.5 * Math.hypot(rect.w, rect.h),
    b = Math.sqrt(2 * a * a);

  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.scale(rect.w / b, rect.h / b);
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
  leftOffset: number,
  rightOffset: number,
  facing: 'back' | 'front',
): void {
  const x = rect.x,
    y = rect.y + size.h / 2,
    w = rect.w,
    h = rect.h - size.h;

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
  size: number,
): void {
  const s = size / 2.0;
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.w / 2 - rect.w * s, rect.y + rect.h * s);
  ctx.lineTo(rect.x + rect.w / 2, rect.y);
  ctx.lineTo(rect.x + rect.w / 2 + rect.w * s, rect.y + rect.h * s);
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
