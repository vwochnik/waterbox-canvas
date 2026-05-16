import { Rectangle, Size, PathFunction } from "../util";

export function basePath(
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

export function wallPath(
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

export function separatorPath(
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
