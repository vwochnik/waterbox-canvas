import { BaseRenderingOptions } from ".";

const DEFAULT_TILT_ANGLE = (Math.atan(1.0 / Math.sqrt(2.0)) * 180) / Math.PI;

export type Size = {
  w: number;
  h: number;
};

export type Rectangle = {
  x: number;
  y: number;
} & Size;

export function getContext(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error("can't get context");
  }
  return context as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
}

export function createOffscreenRenderingContext(
  width: number,
  height: number,
): OffscreenCanvasRenderingContext2D {
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const context = offscreenCanvas.getContext('2d');
  if (!context) {
    throw new Error("can't get context");
  }
  return context;
}

export function calculateRectAndSize(
  {
    width,
    height,
    padding,
    tiltAngle = DEFAULT_TILT_ANGLE,
    strokeWidths: { outer: strokeWidth }
  }: BaseRenderingOptions
): [Rectangle, Size] {
  const angleRad = (tiltAngle * Math.PI) / 180;
  const ratio = Math.sin(angleRad);

  const halfMinSide = Math.min(width, height) / 2;
  const maxPadding = halfMinSide - strokeWidth;
  const actualPadding = Math.min(padding, maxPadding);

  const innerWidth = width - 2 * actualPadding - strokeWidth;
  const innerHeight = height - 2 * actualPadding - strokeWidth;

  const actualHeight = innerHeight;
  const actualWidth = ratio !== 0 ? Math.min(innerWidth, actualHeight / ratio) : innerWidth;

  const rect: Rectangle = {
    x: (width - actualWidth) / 2,
    y: (height - actualHeight) / 2,
    w: actualWidth,
    h: actualHeight,
  };
  const size: Size = { w: rect.w, h: rect.w * ratio };
  return [rect, size];
}

export function makeSteps(divisions: number, value: number = 100): number[] {
  const step = 100 / divisions;

  const count = Math.max(0, Math.ceil(value / step) - 1);
  const length = Math.min(count, divisions - 1);

  return Array.from({ length }, (_, i) => step * (i + 1));
}

export function makePatteern(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  source?: CanvasImageSource,
): CanvasPattern | undefined {
  if (!source) {
    return undefined;
  }
  const pattern = ctx.createPattern(source, 'repeat');
  if (pattern === null) {
    throw new Error('Failed to create pattern');
  }
  return pattern;
}
