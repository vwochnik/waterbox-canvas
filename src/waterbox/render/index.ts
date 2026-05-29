import { assertExhaustive } from '../util';
import { CuboidRenderingOptions, CuboidRenderer } from './cuboid';
import { CylinderRenderer, CylinderRenderingOptions } from './cylinder';
import { BaseRenderingOptions } from './types';

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
  cylinder: { renderer: CylinderRenderer; options: CylinderRenderingOptions };
}

export const createRenderer = <K extends keyof RendererMap>(
  type: K,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options: RendererMap[K]['options'],
): RendererMap[K]['renderer'] => {
  switch (type) {
    case 'cuboid':
      return new CuboidRenderer(canvas, options as CuboidRenderingOptions);
    case 'cylinder':
      return new CylinderRenderer(canvas, options as CylinderRenderingOptions);
    default:
      assertExhaustive(type);
  }
};
