import { BaseOptions, Optionality } from './util';

export interface Options extends BaseOptions {
  width: number;
  height: number;
  value: number;
  backColorScheme: ColorScheme;
  waterColorScheme: ColorScheme;
  frontColorScheme?: ColorScheme;
  backPattern?: Pattern;
  waterPattern?: Pattern;
  frontPattern?: Pattern;
  strokeWidth: number;
  scale?: Scale;
  clipEdges: boolean;
}

export type BaseColorScheme = {
  fill: string;
  stroke: string;
};

export type StaticColorScheme = BaseColorScheme & {
  lighter: string;
  darker: string;
};

export type DynamicColorScheme = BaseColorScheme & {
  contrast: number;
}

export type ColorScheme = StaticColorScheme | DynamicColorScheme;

export type PredefinedPattern = {
  type: 'predefined';
  name: string;
  size: number;
  alpha: number;
};

export type PatternCreator = (ctx: {
  createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null;
}) => CanvasPattern;

export type CustomPattern = {
  type: 'custom';
  creator: PatternCreator;
};

export type Pattern = PredefinedPattern | CustomPattern;

export interface Scale {
  divisions: number;
  size: number;
}

export const optionsWithOptionality: Optionality<Options> = {
  width: false,
  height: false,
  value: false,
  backColorScheme: false,
  waterColorScheme: false,
  frontColorScheme: true,
  backPattern: true,
  waterPattern: true,
  frontPattern: true,
  strokeWidth: false,
  scale: true,
  clipEdges: false,
};

export const defaultOptions: Options = {
  width: 100,
  height: 200,
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
  strokeWidth: 1,
  clipEdges: false,
};
