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
  cuboid: {
    renderer: CuboidRenderer;
    destination: HTMLCanvasElement | OffscreenCanvas;
    options: CuboidRenderingOptions;
  };
  cylinder: {
    renderer: CylinderRenderer;
    destination: HTMLCanvasElement | OffscreenCanvas;
    options: CylinderRenderingOptions;
  };
}

export const createRenderer = <K extends keyof RendererMap>(
  type: K,
  destination: RendererMap[K]['destination'],
  options: RendererMap[K]['options'],
): RendererMap[K]['renderer'] => {
  switch (type) {
    case 'cuboid':
      return new CuboidRenderer(destination, options as CuboidRenderingOptions);
    case 'cylinder':
      return new CylinderRenderer(destination, options as CylinderRenderingOptions);
    default:
      assertExhaustive(type);
  }
};
