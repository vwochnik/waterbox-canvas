import { BaseOptions, Optionality } from './util';

export interface Options extends BaseOptions {
  width: number;
  height: number;
  value: number;
  backColor: Color;
  waterColor: Color;
  frontColor?: Color;
  backPattern?: Pattern;
  waterPattern?: Pattern;
  frontPattern?: Pattern;
  strokeWidth: number;
  divisions?: number;
  separatorSize: number;
  clipEdges: boolean;
}

export interface Color {
  fill: string;
  stroke: string;
  lighter?: string;
  darker?: string;
}

type PredefinedPattern = {
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

export const optionsWithOptionality: Optionality<Options> = {
  width: false,
  height: false,
  value: false,
  backColor: false,
  waterColor: false,
  frontColor: true,
  backPattern: true,
  waterPattern: true,
  frontPattern: true,
  strokeWidth: false,
  divisions: true,
  separatorSize: false,
  clipEdges: false,
};

export const defaultOptions: Options = {
  width: 100,
  height: 200,
  value: 0,
  backColor: {
    fill: '#1e1e1e',
    stroke: '#000000',
    lighter: '#2a2a2a',
    darker: '#141414',
  },
  waterColor: {
    fill: 'rgba(58, 123, 213, 0.7)',
    stroke: 'rgba(42, 92, 160, 0.7)',
    lighter: 'rgba(90, 149, 224, 0.7)',
    darker: 'rgba(43, 95, 168, 0.7)',
  },
  backPattern: undefined,
  waterPattern: undefined,
  frontPattern: undefined,
  strokeWidth: 1,
  separatorSize: 0.125,
  clipEdges: false,
};
