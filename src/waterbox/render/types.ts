export interface BaseRenderingOptions {
  width: number;
  height: number;
  padding: number;
  value: number;
  tiltAngle?: number;
  strokeWidths: StrokeWidths;
  scale?: Scale;
  clipEdges: boolean;
  backColorScheme: RgbaColorScheme;
  waterColorScheme: RgbaColorScheme;
  frontColorScheme?: RgbaColorScheme;
  backPatternSource?: CanvasImageSource;
  waterPatternSource?: CanvasImageSource;
  frontPatternSource?: CanvasImageSource;
}

export type StrokeWidths = {
  outer: number;
  inner: number;
};

export interface Scale {
  divisions: number;
  size: number;
  position?: 'back' | 'water' | 'front';
}

export type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type RgbaColorScheme = {
  innerStroke: RgbaColor;
  outerStroke: RgbaColor;
  fill: RgbaColor;
  lighter: RgbaColor;
  darker: RgbaColor;
};
