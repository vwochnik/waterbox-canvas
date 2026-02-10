import { colord } from 'colord';
import { Options } from './options';

interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Size {
  w: number;
  h: number;
}

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
  const { width, height, value, strokeWidth, clipEdges, backColor, frontColor, waterColor, scale } =
    options;

  const actualWidth = Math.min(width, height),
    rect: Area = {
      x: width / 2 - actualWidth / 2 + strokeWidth / 2,
      y: strokeWidth / 2,
      w: actualWidth - strokeWidth - 1,
      h: height - strokeWidth - 1,
    },
    size: Size = { w: rect.w, h: rect.w / 2 };

  bufferContext.clearRect(0, 0, width, height);

  const bottomRhombusArea: Area = { x: rect.x, y: rect.y + rect.h - size.h, w: size.w, h: size.h };
  const leftBackWallArea: Area = { x: rect.x, y: rect.y, w: size.w / 2, h: rect.h };
  const rightBackWallArea: Area = { x: rect.x + rect.w / 2, y: rect.y, w: size.w / 2, h: rect.h };

  paint(
    bufferContext,
    [
      (ctx) => {
        rhombusPath(ctx, bottomRhombusArea, 'bottom');
      },
      (ctx) => {
        wallPath(ctx, leftBackWallArea, size, 0, -size.h / 2, 'back');
      },
      (ctx) => {
        wallPath(ctx, rightBackWallArea, size, -size.h / 2, 0, 'back');
      },
    ],
    scale
      ? makeSteps(scale.divisions).map((step) => {
          const separatorArea: Area = {
            x: rect.x,
            y: rect.y + rect.h - size.h - ((rect.h - size.h) * step) / 100.0,
            w: size.w,
            h: size.h,
          };
          return (ctx) => separatorPath(ctx, separatorArea, scale.size);
        })
      : [],
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

    const leftFillWallArea: Area = {
      x: rect.x,
      y: rect.y + rect.h - fillHeight,
      w: size.w / 2,
      h: fillHeight,
    };
    const rightFillWallArea: Area = {
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h - fillHeight,
      w: size.w / 2,
      h: fillHeight,
    };
    const fillTopRhombusArea: Area = {
      x: rect.x,
      y: rect.y + rect.h - fillHeight,
      w: size.w,
      h: size.h,
    };
    paint(
      bufferContext,
      [
        (ctx) => {
          wallPath(ctx, leftFillWallArea, size, 0, size.h / 2, 'front');
        },
        (ctx) => {
          wallPath(ctx, rightFillWallArea, size, size.h / 2, 0, 'front');
        },
        (ctx) => {
          rhombusPath(ctx, fillTopRhombusArea, 'top');
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
    const leftFrontWallArea: Area = { x: rect.x, y: rect.y, w: size.w / 2, h: rect.h };
    const rightFrontWallArea: Area = {
      x: rect.x + rect.w / 2,
      y: rect.y,
      w: size.w / 2,
      h: rect.h,
    };
    const topRhombusArea: Area = { x: rect.x, y: rect.y, w: size.w, h: size.h };

    paint(
      bufferContext,
      [
        (ctx) => {
          wallPath(ctx, leftFrontWallArea, size, 0, size.h / 2, 'front');
        },
        (ctx) => {
          wallPath(ctx, rightFrontWallArea, size, size.h / 2, 0, 'front');
        },
        (ctx) => {
          rhombusPath(ctx, topRhombusArea, 'top');
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

  const tempStrokeColor = clipEdges ? `rgba(0,0,0,${colord(strokeColor).alpha()})` : strokeColor;

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
  area: Area,
  position: 'top' | 'bottom',
): void {
  const a = 0.5 * Math.hypot(area.w, area.h),
    b = Math.sqrt(2 * a * a);

  ctx.translate(area.x + area.w / 2, area.y + area.h / 2);
  ctx.scale(area.w / b, area.h / b);
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
  area: Area,
  size: Size,
  leftOffset: number,
  rightOffset: number,
  facing: 'back' | 'front',
): void {
  const x = area.x,
    y = area.y + size.h / 2,
    w = area.w,
    h = area.h - size.h;

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
  area: Area,
  size: number,
): void {
  const s = size / 2.0;
  ctx.beginPath();
  ctx.moveTo(area.x + area.w / 2 - area.w * s, area.y + area.h * s);
  ctx.lineTo(area.x + area.w / 2, area.y);
  ctx.lineTo(area.x + area.w / 2 + area.w * s, area.y + area.h * s);
}

function makeSteps(divisions: number): number[] {
  const step = 100 / divisions;

  return Array.from({ length: divisions - 1 }, (_, i) => step * (i + 1));
}
