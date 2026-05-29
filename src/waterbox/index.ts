import pick from 'lodash.pick';
import {
  createOptionAccessors,
  OptionAccessors,
  defineReadonlyProperty,
  assertExhaustive,
} from './util';
import { PASSTHROUGH_KEYS, Options, defaultOptions, optionsWithOptionality } from './options';
import {
  validateBoolean,
  validateColorScheme,
  validateDimension,
  validateOptionalColorScheme,
  validateOptionalPattern,
  validateOptionalScale,
  validatePadding,
  validateRenderer,
  validateStrokeWidths,
  validateTiltAngle,
  validateValue,
} from './validator';
import { createPattern } from './pattern';
import { createRenderer, Renderer } from './render';
import { BaseRenderingOptions, RgbaColorScheme } from './render/types';
import { getRgbaColorScheme } from './color';

/**
 * Main waterbox type
 */
export interface Waterbox extends OptionAccessors<Options, Waterbox> {
  readonly render: () => Waterbox;
}

export function createWaterbox(canvas: HTMLCanvasElement | OffscreenCanvas): Waterbox {
  let options!: Options;
  let renderer: Renderer;

  let backColorScheme: RgbaColorScheme;
  let waterColorScheme: RgbaColorScheme;
  let frontColorScheme: RgbaColorScheme | undefined;

  let backPatternSource: CanvasImageSource | undefined;
  let waterPatternSource: CanvasImageSource | undefined;
  let frontPatternSource: CanvasImageSource | undefined;

  // will be called when createOptionAccessors initializes
  function update(changedKeys: (keyof Options)[], newOptions: Options) {
    options = newOptions;

    const changes = new Set(changedKeys);
    const renderingOptions: Partial<BaseRenderingOptions> = {};

    if (changes.has('width')) {
      canvas.width = options.width;
    }
    if (changes.has('height')) {
      canvas.height = options.height;
    }
    if (changes.has('backColorScheme')) {
      backColorScheme = getRgbaColorScheme(options.backColorScheme);
      renderingOptions.backColorScheme = backColorScheme;
    }
    if (changes.has('waterColorScheme')) {
      waterColorScheme = getRgbaColorScheme(options.waterColorScheme);
      renderingOptions.waterColorScheme = waterColorScheme;
    }
    if (changes.has('frontColorScheme')) {
      frontColorScheme = options.frontColorScheme
        ? getRgbaColorScheme(options.frontColorScheme)
        : undefined;
      renderingOptions.frontColorScheme = frontColorScheme;
    }
    if (changes.has('backPattern')) {
      backPatternSource = options.backPattern ? createPattern(options.backPattern) : undefined;
      renderingOptions.backPatternSource = backPatternSource;
    }
    if (changes.has('waterPattern')) {
      waterPatternSource = options.waterPattern ? createPattern(options.waterPattern) : undefined;
      renderingOptions.waterPatternSource = waterPatternSource;
    }
    if (changes.has('frontPattern')) {
      frontPatternSource = options.frontPattern ? createPattern(options.frontPattern) : undefined;
      renderingOptions.frontPatternSource = frontPatternSource;
    }

    for (const key of PASSTHROUGH_KEYS) {
      if (changes.has(key)) {
        renderingOptions[key] = options[key] as never;
      }
    }

    if (changes.has('renderer')) {
      const fullRenderingOptions: BaseRenderingOptions = {
        ...pick(options, PASSTHROUGH_KEYS),
        backColorScheme,
        waterColorScheme,
        frontColorScheme,
        backPatternSource,
        waterPatternSource,
        frontPatternSource,
        ...renderingOptions,
      };
      const rendererType = options.renderer.type;
      switch (rendererType) {
        case 'cuboid':
          renderer = createRenderer('cuboid', canvas, {
            ...fullRenderingOptions,
            ...pick(options.renderer, ['alignPatternToEdges']),
          });
          break;
        case 'cylinder':
          renderer = createRenderer('cylinder', canvas, {
            ...fullRenderingOptions,
            ...pick(options.renderer, ['applyPatternToBases', 'centerPatternHorizontally']),
          });
          break;
        default:
          assertExhaustive(rendererType);
      }
    } else {
      renderer.update(renderingOptions);
    }
  }

  const instance = {} as Waterbox;

  defineReadonlyProperty(instance, 'render', function (): Waterbox {
    renderer.render();
    return instance;
  });

  return createOptionAccessors(instance, optionsWithOptionality, defaultOptions, update, {
    renderer: validateRenderer,
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
