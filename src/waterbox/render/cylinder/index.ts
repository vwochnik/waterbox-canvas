import { BaseRenderingOptions } from '../index';
import {
  calculateRectAndSize,
  getCanvasImageSourceSize,
  makePattern,
  makeSteps,
  Rectangle,
} from '../util';
import { RgbaColorScheme, rgbaColorToString } from '../../color';
import { basePath, wallPath, separatorPath } from './paths';
import { CanvasBaseRenderer } from '../canvas-base';
import { assertExhaustive, hasAnyKey } from '../../util';
import { WallImageGenerator, PatternSourceOptionProperty } from './wall-image-generator';

type WallImageGeneratorProperty =
| 'backWallImageGenerator'
| 'waterWallImageGenerator'
| 'frontWallImageGenerator';

export interface CylinderRenderingOptions extends BaseRenderingOptions {
  applyPatternToBases?: boolean;
  centerPatternHorizontally?: boolean;
}

export class CylinderRenderer extends CanvasBaseRenderer<CylinderRenderingOptions, 'cylinder'> {
  readonly type = 'cylinder' as const;

  private backWallImageGenerator: WallImageGenerator | undefined;
  private waterWallImageGenerator: WallImageGenerator | undefined;
  private frontWallImageGenerator: WallImageGenerator | undefined;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options: CylinderRenderingOptions) {
    super(canvas, options);
    this.initializeOrUpdateWallPatternImageGenerators({});
  }

  update(options: Partial<CylinderRenderingOptions>): void {
    super.update(options);
    this.initializeOrUpdateWallPatternImageGenerators(options);
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
    const applyPatternToBases = this.options.applyPatternToBases ?? false;

    const scalePosition = this.options.scale?.position ?? 'back';

    const backPattern = makePattern(this.bufCtx, backPatternSource);
    const waterPattern = makePattern(this.bufCtx, waterPatternSource);
    const frontPattern = makePattern(this.bufCtx, frontPatternSource);

    const backWallPattern = this.backWallImageGenerator?.getPattern();
    const waterWallPattern = this.waterWallImageGenerator?.getPattern();
    const frontWallPattern = this.frontWallImageGenerator?.getPattern();

    const [rect, size] = calculateRectAndSize(this.options);

    this.paintLayer(
      [basePath(rect, size, 0, 'bottom'), wallPath(rect, size, 100, 'back')],
      (scale && scalePosition === 'back' ? makeSteps(scale.divisions) : []).map((step) =>
        separatorPath(rect, size, scale?.size ?? 0, step, 'back'),
      ),
      wallPath(rect, size, 100, 'outer'),
      [
        rgbaColorToString(backColorScheme.fill),
        makeWallGradient(this.bufCtx, rect, backColorScheme),
      ],
      backColorScheme.innerStroke,
      backColorScheme.outerStroke,
      [applyPatternToBases ? backPattern : undefined, backWallPattern],
    );

    if (value > 0) {
      this.paintLayer(
        [wallPath(rect, size, value, 'front'), basePath(rect, size, value, 'top')],
        (scale && scalePosition === 'water' ? makeSteps(scale.divisions, value) : []).map((step) =>
          separatorPath(rect, size, scale?.size ?? 0, step, 'front'),
        ),
        wallPath(rect, size, value, 'outer'),
        [
          makeWallGradient(this.bufCtx, rect, waterColorScheme),
          rgbaColorToString(waterColorScheme.fill),
        ],
        waterColorScheme.innerStroke,
        waterColorScheme.outerStroke,
        [waterWallPattern, applyPatternToBases ? waterPattern : undefined],
      );
    }

    if (frontColorScheme) {
      this.paintLayer(
        [wallPath(rect, size, 100, 'front'), basePath(rect, size, 100, 'top')],
        (scale && scalePosition === 'front' ? makeSteps(scale.divisions) : []).map((step) =>
          separatorPath(rect, size, scale?.size ?? 0, step, 'front'),
        ),
        wallPath(rect, size, 100, 'outer'),
        [
          makeWallGradient(this.bufCtx, rect, frontColorScheme),
          rgbaColorToString(frontColorScheme.fill),
        ],
        frontColorScheme.innerStroke,
        frontColorScheme.outerStroke,
        [frontWallPattern, applyPatternToBases ? frontPattern : undefined],
      );
    }
  }

  private initializeOrUpdateWallPatternImageGenerators(    partialOptions: Partial<CylinderRenderingOptions>) {
    this.initializeOrUpdateWallPatternImageGenerator('backPatternSource', 'backWallImageGenerator', partialOptions, 'back');
    this.initializeOrUpdateWallPatternImageGenerator('waterPatternSource', 'waterWallImageGenerator', partialOptions, 'front');
    this.initializeOrUpdateWallPatternImageGenerator('frontPatternSource', 'frontWallImageGenerator', partialOptions, 'front');
  }

  private initializeOrUpdateWallPatternImageGenerator(
    patternSourceOptionProperty: PatternSourceOptionProperty,
    wallImageGeneratorProperty: WallImageGeneratorProperty,
    partialOptions: Partial<CylinderRenderingOptions>,
    facing: 'back' | 'front',
  ): void {
    const patternSource = this.options[patternSourceOptionProperty];
    if (patternSource !== undefined) {
      if (this[wallImageGeneratorProperty]) {
        this[wallImageGeneratorProperty].update(partialOptions);
      } else {
        this[wallImageGeneratorProperty] = new WallImageGenerator({ ...this.options, ...partialOptions }, patternSourceOptionProperty, facing);
      }
    } else {
      this[wallImageGeneratorProperty] = undefined;
    }
  }
}

function makeWallGradient(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  colorScheme: RgbaColorScheme,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y);
  gradient.addColorStop(0, rgbaColorToString(colorScheme.darker));
  gradient.addColorStop(0.5, rgbaColorToString(colorScheme.lighter));
  gradient.addColorStop(1, rgbaColorToString(colorScheme.darker));
  return gradient;
}
