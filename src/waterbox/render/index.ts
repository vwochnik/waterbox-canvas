import { RgbaColorScheme } from '../color';
import { Scale, StrokeWidths } from '../options';
import { assertExhaustive } from '../util';
import { CuboidRenderingOptions, CuboidRenderer } from './cuboid';

export interface BaseRenderingOptions {
  width: number;
  height: number;
  padding: number;
  value: number;
  tiltAngle?: number;
  strokeWidths: StrokeWidths;
  scale?: Scale;
  backColorScheme: RgbaColorScheme;
  waterColorScheme: RgbaColorScheme;
  frontColorScheme?: RgbaColorScheme;
  backPatternSource?: CanvasImageSource;
  waterPatternSource?: CanvasImageSource;
  frontPatternSource?: CanvasImageSource;
}

export interface Renderer<
  RenderingOptions extends BaseRenderingOptions = BaseRenderingOptions,
  Type extends string = string,
> {
  readonly type: Type;
  readonly options: RenderingOptions;

  update(options: Partial<RenderingOptions>): void;

  render(): void;
}

interface RendererMap {
  cuboid: { renderer: CuboidRenderer; options: CuboidRenderingOptions };
}

export const createRenderer = <K extends keyof RendererMap>(
  type: K,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options: RendererMap[K]['options'],
): RendererMap[K]['renderer'] => {
  switch (type) {
    case 'cuboid' as K:
      return new CuboidRenderer(canvas, options);
    default:
      assertExhaustive(type);
  }
};
