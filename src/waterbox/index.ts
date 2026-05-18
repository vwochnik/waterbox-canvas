import pick from 'lodash.pick';
import {
  createOptionAccessors,
  OptionAccessors,
  defineReadonlyProperty,
  assertExhaustive,
} from './util';
import { Options, defaultOptions, optionsWithOptionality } from './options';
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
import { BaseRenderingOptions, createRenderer, Renderer } from './render';
import { getRgbaColorScheme, RgbaColorScheme } from './color';
import { CuboidRenderingOptions } from './render/cuboid';

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
  function update(changes: (keyof Options)[], newOptions: Options) {
    options = newOptions;

    const renderingOptions: Partial<BaseRenderingOptions> = {};

    if (changes.includes('width')) {
      canvas.width = options.width;
      renderingOptions.width = options.width;
    }
    if (changes.includes('height')) {
      canvas.height = options.height;
      renderingOptions.height = options.height;
    }
    if (changes.includes('backColorScheme')) {
      backColorScheme = getRgbaColorScheme(options.backColorScheme);
      renderingOptions.backColorScheme = backColorScheme;
    }
    if (changes.includes('waterColorScheme')) {
      waterColorScheme = getRgbaColorScheme(options.waterColorScheme);
      renderingOptions.waterColorScheme = waterColorScheme;
    }
    if (changes.includes('frontColorScheme')) {
      frontColorScheme = options.frontColorScheme
        ? getRgbaColorScheme(options.frontColorScheme)
        : undefined;
      renderingOptions.frontColorScheme = frontColorScheme;
    }
    if (changes.includes('backPattern')) {
      backPatternSource = options.backPattern ? createPattern(options.backPattern) : undefined;
      renderingOptions.backPatternSource = backPatternSource;
    }
    if (changes.includes('waterPattern')) {
      waterPatternSource = options.waterPattern ? createPattern(options.waterPattern) : undefined;
      renderingOptions.waterPatternSource = waterPatternSource;
    }
    if (changes.includes('frontPattern')) {
      frontPatternSource = options.frontPattern ? createPattern(options.frontPattern) : undefined;
      renderingOptions.frontPatternSource = frontPatternSource;
    }

    if (changes.includes('padding')) renderingOptions.padding = options.padding;
    if (changes.includes('value')) renderingOptions.value = options.value;
    if (changes.includes('tiltAngle')) renderingOptions.tiltAngle = options.tiltAngle;
    if (changes.includes('strokeWidths')) renderingOptions.strokeWidths = options.strokeWidths;
    if (changes.includes('scale')) renderingOptions.scale = options.scale;
    if (changes.includes('clipEdges')) renderingOptions.clipEdges = options.clipEdges;

    if (changes.includes('renderer')) {
      const fullRenderingOptions: BaseRenderingOptions = {
        ...pick(options, [
          'width',
          'height',
          'padding',
          'value',
          'tiltAngle',
          'strokeWidths',
          'scale',
          'clipEdges',
        ]),
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
