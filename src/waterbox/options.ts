import { BaseOptions, Optionality } from './util';
import { CuboidRenderingOptions } from './render/cuboid';
import { CylinderRenderingOptions } from './render/cylinder';
import { BaseRenderingOptions, Scale, StrokeWidths } from './render/types';

/** Option keys that are forwarded to the renderer unchanged. */
export const PASSTHROUGH_KEYS = [
  'width',
  'height',
  'padding',
  'value',
  'tiltAngle',
  'strokeWidths',
  'scale',
  'clipEdges',
] as const;

export interface Options extends BaseOptions {
  renderer: Renderer;
  width: BaseRenderingOptions['width'];
  height: BaseRenderingOptions['height'];
  padding: BaseRenderingOptions['padding'];
  value: BaseRenderingOptions['value'];
  tiltAngle?: BaseRenderingOptions['tiltAngle'];
  strokeWidths: BaseRenderingOptions['strokeWidths'];
  scale?: BaseRenderingOptions['scale'];
  clipEdges: BaseRenderingOptions['clipEdges'];
  backColorScheme: ColorScheme;
  waterColorScheme: ColorScheme;
  frontColorScheme?: ColorScheme;
  backPattern?: Pattern;
  waterPattern?: Pattern;
  frontPattern?: Pattern;
}

export type Renderer =
  | (Pick<CuboidRenderingOptions, 'alignPatternToEdges'> & {
      type: 'cuboid';
    })
  | (Pick<CylinderRenderingOptions, 'applyPatternToBases' | 'centerPatternHorizontally'> & {
      type: 'cylinder';
    });

type StrokeColorScheme = { stroke: string } | { innerStroke: string; outerStroke: string };

export type BaseColorScheme = {
  fill: string;
} & StrokeColorScheme;

export type StaticColorScheme = BaseColorScheme & {
  lighter: string;
  darker: string;
};

export type DynamicColorScheme = BaseColorScheme & {
  contrast: number;
};

export type ColorScheme = StaticColorScheme | DynamicColorScheme;

export type PredefinedPattern = {
  name: string;
  size: number;
  alpha: number;
};

export type CustomPattern = {
  image: CanvasImageSource;
};

export type Pattern = PredefinedPattern | CustomPattern;

export const optionsWithOptionality: Optionality<Options> = {
  renderer: false,
  width: false,
  height: false,
  padding: false,
  value: false,
  tiltAngle: true,
  backColorScheme: false,
  waterColorScheme: false,
  frontColorScheme: true,
  backPattern: true,
  waterPattern: true,
  frontPattern: true,
  strokeWidths: false,
  scale: true,
  clipEdges: false,
};

export const defaultOptions: Options = {
  renderer: { type: 'cuboid', alignPatternToEdges: false },
  width: 100,
  height: 200,
  padding: 2,
  value: 0,
  backColorScheme: {
    fill: '#8d8d9f',
    stroke: '#8a8a9a',
    contrast: 0.1,
  },
  waterColorScheme: {
    fill: 'rgba(58, 123, 213, 0.9)',
    stroke: 'rgba(42, 92, 160, 0.9)',
    contrast: 0.1,
  },
  backPattern: undefined,
  waterPattern: undefined,
  frontPattern: undefined,
  strokeWidths: {
    outer: 2,
    inner: 1,
  },
  clipEdges: false,
};
