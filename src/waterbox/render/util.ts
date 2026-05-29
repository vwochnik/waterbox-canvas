import { BaseRenderingOptions } from '.';
import { assertExhaustive } from '../util';

const DEFAULT_TILT_ANGLE = (Math.atan(1.0 / Math.sqrt(2.0)) * 180) / Math.PI;

export type Size = {
  w: number;
  h: number;
};

export type Rectangle = {
  x: number;
  y: number;
} & Size;

export type PathFunction = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
) => void;

export type FillStyle = string | CanvasGradient | CanvasPattern;

/**
 * Restricts a value to lie within the inclusive range `[min, max]`.
 * @param value - The value to clamp
 * @param min - The lower bound
 * @param max - The upper bound
 * @returns `value` constrained to the range `[min, max]`
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getContext(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error("can't get context");
  }

  // tslint:disable-next-line:no-unnecessary-type-assertion
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
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return context;
}

export function calculateRectAndSize({
  width,
  height,
  padding,
  tiltAngle = DEFAULT_TILT_ANGLE,
  strokeWidths: { outer: strokeWidth },
}: BaseRenderingOptions): [Rectangle, Size] {
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

export function makePattern(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  source: CanvasImageSource | undefined,
  scale: number = 1,
): CanvasPattern | undefined {
  if (!source) {
    return undefined;
  }
  const pattern = ctx.createPattern(source, 'repeat');
  if (pattern === null) {
    throw new Error('Failed to create pattern');
  }
  if (scale !== 1) {
    const transform = new DOMMatrix().scale(scale);
    pattern.setTransform(transform);
  }
  return pattern;
}

export function getCanvasImageSourceSize(source: CanvasImageSource): Size {
  if (source instanceof HTMLImageElement) {
    return {
      w: source.naturalWidth,
      h: source.naturalHeight,
    };
  }

  if (source instanceof HTMLVideoElement) {
    return {
      w: source.videoWidth,
      h: source.videoHeight,
    };
  }

  if (
    source instanceof HTMLCanvasElement ||
    source instanceof OffscreenCanvas ||
    source instanceof ImageBitmap
  ) {
    return {
      w: source.width,
      h: source.height,
    };
  }

  if (source instanceof SVGImageElement) {
    const { width, height } = source.getBoundingClientRect();
    return { w: width, h: height };
  }

  if (source instanceof VideoFrame) {
    return {
      w: source.displayWidth,
      h: source.displayHeight,
    };
  }

  assertExhaustive(source);
}
