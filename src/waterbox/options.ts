import { BaseOptions, Optionality } from './util';

export interface Options extends BaseOptions {
  width: number;
  height: number;
  padding: number;
  value: number;
  tiltAngle?: number;
  backColorScheme: ColorScheme;
  waterColorScheme: ColorScheme;
  frontColorScheme?: ColorScheme;
  backPattern?: Pattern;
  waterPattern?: Pattern;
  frontPattern?: Pattern;
  strokeWidths: StrokeWidths;
  scale?: Scale;
  clipEdges: boolean;
}

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

export type BasePattern = {
  alignToEdges?: boolean;
};

export type PredefinedPattern = BasePattern & {
  name: string;
  size: number;
  alpha: number;
};

export type PatternCreator = (ctx: {
  createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null;
}) => CanvasPattern;

export type CustomPattern = BasePattern & {
  creator: PatternCreator;
};

export type Pattern = PredefinedPattern | CustomPattern;

export type StrokeWidths = {
  outer: number;
  inner: number;
};

export interface Scale {
  divisions: number;
  size: number;
  position?: 'back' | 'water' | 'front';
}

export const optionsWithOptionality: Optionality<Options> = {
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
