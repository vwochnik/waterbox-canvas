import { Rectangle, Size, PathFunction } from "../util";

export function rhombusPath(
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

    const a = 0.5 * Math.hypot(w, h),
      b = Math.sqrt(2 * a * a);

    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(w / b, h / b);
    ctx.rotate(Math.PI / 4);

    ctx.beginPath();
    ctx.rect(-a / 2, -a / 2, a, a);

    if (alignToEdges) {
      if (position === 'top') {
        ctx.translate(a / 2, a / 2);
      } else {
        ctx.translate(-a / 2, -a / 2);
      }
    } else {
      if (position === 'top') {
        ctx.translate(-a / 2, -a / 2 + 2 * a);
      } else {
        ctx.translate(a / 2 - 2 * a, a / 2);
      }
    }
  };
}

export function wallPath(
  rect: Rectangle,
  size: Size,
  value: number,
  position: 'left' | 'right',
  facing: 'back' | 'front',
  alignToEdges: boolean,
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

    // TODO: introduce an option
    if (alignToEdges) {
      ctx.translate(position === 'right' ? 0 : w, h /* or 0 */);
    } else {
      ctx.translate(position === 'right' ? -w : 0, h /* or 0 */);
    }

    const scale = w / Math.hypot(rightOffset - leftOffset, w);
    ctx.scale(scale, 1);
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

export function outerPath(rect: Rectangle, size: Size, value: number): PathFunction {
  return function (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    const fillHeight = size.h + (value / 100) * (rect.h - size.h);

    const { x, y, w: rectW, h: rectH } = rect;
    const { w, h } = size;

    const halfW = w * 0.5;
    const halfH = h * 0.5;

    const yTop = y + rectH - fillHeight;
    const yBottom = y + rectH;

    const left = x;
    const right = x + w;
    const center = x + halfW;

    ctx.beginPath();

    // outer hex-like shape
    ctx.moveTo(left, yTop + halfH);
    ctx.lineTo(center, yTop);
    ctx.lineTo(right, yTop + halfH);
    ctx.lineTo(right, yBottom - halfH);
    ctx.lineTo(center, yBottom);
    ctx.lineTo(left, yBottom - halfH);

    ctx.closePath();
  };
}
