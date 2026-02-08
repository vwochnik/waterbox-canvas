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
  scale?: Scale;
  clipEdges: boolean;
}

export interface Color {
  fill: string;
  stroke: string;
  lighter?: string;
  darker?: string;
}

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
  backColor: false,
  waterColor: false,
  frontColor: true,
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
  backColor: {
    fill: '#8d8d9f',
    stroke: '#8a8a9a',
  },
  waterColor: {
    fill: 'rgba(58, 123, 213, 0.9)',
    stroke: 'rgba(42, 92, 160, 0.9)',
  },
  backPattern: undefined,
  waterPattern: undefined,
  frontPattern: undefined,
  strokeWidth: 1,
  clipEdges: false,
};
