import { createOptionAccessors, OptionAccessors } from './util';
import { Options, defaultOptions, optionsWithOptionality } from './options';
import {
  validateBoolean,
  validateColorScheme,
  validateDimension,
  validateOptionalColorScheme,
  validateOptionalPattern,
  validateOptionalScale,
  validatePadding,
  validateStrokeWidths,
  validateTiltAngle,
  validateValue,
} from './validator';
import { createPattern } from './pattern';
import { render as renderWaterbox } from './render';
import { getRgbaColorScheme, RgbaColorScheme } from './color';

/**
 * Main waterbox type
 */
export interface Waterbox extends OptionAccessors<Options, Waterbox> {
  render(): Waterbox;
}

export function createWaterbox(canvas: HTMLCanvasElement | OffscreenCanvas): Waterbox {
  let options!: Options;

  const canvasContext = getContext(canvas);

  const [bufferCanvas, bufferContext] = createOffscreenCanvasWithContext();
  const [tempCanvas, tempContext] = createOffscreenCanvasWithContext();

  let backColorScheme: RgbaColorScheme;
  let waterColorScheme: RgbaColorScheme;
  let frontColorScheme: RgbaColorScheme | undefined;

  let backPattern: CanvasPattern | undefined;
  let waterPattern: CanvasPattern | undefined;
  let frontPattern: CanvasPattern | undefined;

  // will be called when createOptionAccessors initializes
  function update(changes: (keyof Options)[], newOptions: Options) {
    options = newOptions;
    if (changes.includes('width')) {
      canvas.width = options.width;
      bufferCanvas.width = options.width;
      tempCanvas.width = options.width;
    }
    if (changes.includes('height')) {
      canvas.height = options.height;
      bufferCanvas.height = options.height;
      tempCanvas.height = options.height;
    }
    if (changes.includes('backColorScheme')) {
      backColorScheme = getRgbaColorScheme(options.backColorScheme);
    }
    if (changes.includes('waterColorScheme')) {
      waterColorScheme = getRgbaColorScheme(options.waterColorScheme);
    }
    if (changes.includes('frontColorScheme')) {
      frontColorScheme = options.frontColorScheme
        ? getRgbaColorScheme(options.frontColorScheme)
        : undefined;
    }
    if (changes.includes('backPattern')) {
      backPattern = options.backPattern
        ? createPattern(bufferContext, options.backPattern)
        : undefined;
    }
    if (changes.includes('waterPattern')) {
      waterPattern = options.waterPattern
        ? createPattern(bufferContext, options.waterPattern)
        : undefined;
    }
    if (changes.includes('frontPattern')) {
      frontPattern = options.frontPattern
        ? createPattern(bufferContext, options.frontPattern)
        : undefined;
    }
  }

  const instance = {} as Waterbox;

  instance.render = function (): Waterbox {
    renderWaterbox(
      options,
      canvasContext,
      bufferContext,
      tempContext,
      backColorScheme,
      waterColorScheme,
      frontColorScheme,
      backPattern,
      waterPattern,
      frontPattern,
    );

    return instance;
  };

  return createOptionAccessors(instance, optionsWithOptionality, defaultOptions, update, {
    width: validateDimension,
    height: validateDimension,
    padding: validatePadding,
    value: validateValue,
    tiltAngle: validateTiltAngle,
    backColorScheme: validateColorScheme,
    waterColorScheme: validateColorScheme,
    frontColorScheme: validateOptionalColorScheme,
    backPattern: validateOptionalPattern,
    waterPattern: validateOptionalPattern,
    frontPattern: validateOptionalPattern,
    scale: validateOptionalScale,
    strokeWidths: validateStrokeWidths,
    clipEdges: validateBoolean,
  });
}

function getContext(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error("can't get context");
  }
  return context as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
}

function createOffscreenCanvasWithContext(): [OffscreenCanvas, OffscreenCanvasRenderingContext2D] {
  const offscreenCanvas = new OffscreenCanvas(0, 0);
  const context = offscreenCanvas.getContext('2d');
  if (!context) {
    throw new Error("can't get context");
  }
  return [offscreenCanvas, context];
}
