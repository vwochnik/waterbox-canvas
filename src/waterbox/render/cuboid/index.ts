import { BaseRenderingOptions } from '../index';
import { calculateRectAndSize, makePattern, makeSteps } from '../util';
import { rgbaColorToString } from '../../color';
import { rhombusPath, wallPath, separatorPath, outerPath } from './paths';
import { CanvasBaseRenderer } from '../canvas-base';

export interface CuboidRenderingOptions extends BaseRenderingOptions {
  alignPatternToEdges?: boolean;
}

export class CuboidRenderer extends CanvasBaseRenderer<CuboidRenderingOptions, 'cuboid'> {
  readonly type = 'cuboid' as const;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options: CuboidRenderingOptions) {
    super(canvas, options);
  }

  paint(): void {
    const {
      value,
      scale,
      backColorScheme,
      waterColorScheme,
      frontColorScheme,
      backPatternSource,
      waterPatternSource,
      frontPatternSource,
    } = this.options;
    const alignPatternToEdges = this.options.alignPatternToEdges ?? false;

    const scalePosition = this.options.scale?.position ?? 'back';

    const backPattern = makePattern(this.bufCtx, backPatternSource);
    const waterPattern = makePattern(this.bufCtx, waterPatternSource);
    const frontPattern = makePattern(this.bufCtx, frontPatternSource);

    const [rect, size] = calculateRectAndSize(this.options);

    this.bufCtx.reset();

    const separators = (
      position: 'back' | 'water' | 'front',
      face: 'back' | 'front',
      fillValue?: number,
    ) =>
      scale && scalePosition === position
        ? makeSteps(scale.divisions, fillValue).map((step) =>
            separatorPath(rect, size, scale.size, step, face),
          )
        : [];

    this.paintLayer(
      [
        rhombusPath(rect, size, 0, 'bottom', alignPatternToEdges ?? false),
        wallPath(rect, size, 100, 'left', 'back', alignPatternToEdges ?? false),
        wallPath(rect, size, 100, 'right', 'back', alignPatternToEdges ?? false),
      ],
      separators('back', 'back'),
      outerPath(rect, size, 100),
      [backColorScheme.fill, backColorScheme.lighter, backColorScheme.darker].map(
        rgbaColorToString,
      ),
      backColorScheme.innerStroke,
      backColorScheme.outerStroke,
      [backPattern, backPattern, backPattern],
    );

    if (value > 0) {
      this.paintLayer(
        [
          wallPath(rect, size, value, 'left', 'front', alignPatternToEdges ?? false),
          wallPath(rect, size, value, 'right', 'front', alignPatternToEdges ?? false),
          rhombusPath(rect, size, value, 'top', alignPatternToEdges ?? false),
        ],
        separators('water', 'front', value),
        outerPath(rect, size, value),
        [waterColorScheme.darker, waterColorScheme.lighter, waterColorScheme.fill].map(
          rgbaColorToString,
        ),
        waterColorScheme.innerStroke,
        waterColorScheme.outerStroke,
        [waterPattern, waterPattern, waterPattern],
      );
    }

    if (frontColorScheme) {
      this.paintLayer(
        [
          wallPath(rect, size, 100, 'left', 'front', alignPatternToEdges ?? false),
          wallPath(rect, size, 100, 'right', 'front', alignPatternToEdges ?? false),
          rhombusPath(rect, size, 100, 'top', alignPatternToEdges ?? false),
        ],
        separators('front', 'front'),
        outerPath(rect, size, 100),
        [frontColorScheme.darker, frontColorScheme.lighter, frontColorScheme.fill].map(
          rgbaColorToString,
        ),
        frontColorScheme.innerStroke,
        frontColorScheme.outerStroke,
        [frontPattern, frontPattern, frontPattern],
      );
    }
  }
}
