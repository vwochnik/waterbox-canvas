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
import { hasAnyKey } from '../../util';

export interface CylinderRenderingOptions extends BaseRenderingOptions {
  applyPatternToBases: boolean;
  centerPatternHorizontally: boolean;
}

export class CylinderRenderer extends CanvasBaseRenderer<CylinderRenderingOptions, 'cylinder'> {
  readonly type = 'cylinder' as const;

  private backWallPatternSource: ImageBitmap | undefined;
  private waterWallPatternSource: ImageBitmap | undefined;
  private frontWallPatternSource: ImageBitmap | undefined;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options: CylinderRenderingOptions) {
    super(canvas, options);
    this.initializeWallPatternSources();
  }

  update(options: Partial<CylinderRenderingOptions>): void {
    super.update(options);
    if (
      hasAnyKey(options, [
        'width',
        'height',
        'padding',
        'tiltAngle',
        'strokeWidths',
        'backPatternSource',
        'waterPatternSource',
        'frontPatternSource',
      ])
    ) {
      this.initializeWallPatternSources();
    }
  }

  render(): void {
    const {
      width,
      height,
      value,
      scale,
      backColorScheme,
      waterColorScheme,
      frontColorScheme,
      backPatternSource,
      waterPatternSource,
      frontPatternSource,
      applyPatternToBases,
    } = this.options;

    const scalePosition = this.options.scale?.position ?? 'back';

    const backPattern = makePattern(this.bufCtx, backPatternSource);
    const waterPattern = makePattern(this.bufCtx, waterPatternSource);
    const frontPattern = makePattern(this.bufCtx, frontPatternSource);

    const backWallPattern = makePattern(this.bufCtx, this.backWallPatternSource);
    const waterWallPattern = makePattern(this.bufCtx, this.waterWallPatternSource);
    const frontWallPattern = makePattern(this.bufCtx, this.frontWallPatternSource);

    const [rect, size] = calculateRectAndSize(this.options);

    this.bufCtx.reset();

    this.paint(
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
      [(applyPatternToBases ? backPattern : undefined), backWallPattern],
    );

    if (value > 0) {
      this.paint(
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
        [waterWallPattern, (applyPatternToBases ? waterPattern : undefined)],
      );
    }

    if (frontColorScheme) {
      this.paint(
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
        [frontWallPattern, (applyPatternToBases ? frontPattern : undefined)],
      );
    }

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.bufCtx.canvas, 0, 0);
  }

  private initializeWallPatternSources(): void {
    this.backWallPatternSource = this.generateWallPatternSource(
      this.options.backPatternSource,
      'back',
    );
    this.waterWallPatternSource = this.generateWallPatternSource(
      this.options.waterPatternSource,
      'front',
    );
    this.frontWallPatternSource = this.generateWallPatternSource(
      this.options.frontPatternSource,
      'front',
    );
  }

  private generateWallPatternSource(
    patternSource: CanvasImageSource | undefined,
    facing: 'back' | 'front',
  ): ImageBitmap | undefined {
    if (!patternSource) {
      return undefined;
    }

    const sourceSize = getCanvasImageSourceSize(patternSource);
    const [rect, size] = calculateRectAndSize(this.options);

    const radiusX = size.w / 2;
    const radiusY = size.h / 2;
    const centerX = rect.x + radiusX;
    const centerY = rect.y + radiusY;
    const height = rect.h - size.h;

    const mappedWidth = radiusX * Math.PI;
    const uOffset = (this.options.centerPatternHorizontally) ? (sourceSize.w - mappedWidth) / 2 : 0;

    this.tmpCtx.reset();

    const startX = centerX - radiusX;
    const endX = centerX + radiusX;

    for (let x = startX; x <= endX; x++) {
      const normalizedX = Math.max(-1, Math.min(1, (x - centerX) / radiusX));

      const angle = Math.asin(normalizedX);

      const yTop = centerY + (facing === 'back' ? -1 : 1) * Math.cos(angle) * radiusY;
      const yBottom = yTop + height;

      const progress = (angle + Math.PI / 2) / Math.PI;
      const w = 1 + (1 - Math.cos(angle)) * 4;

      let u = (uOffset + progress * mappedWidth) % sourceSize.w;
      while (u < 0) {
        u += sourceSize.w;
      }

      for (let drawY = yBottom; drawY > yTop; drawY -= sourceSize.h) {
        let displayHeight = Math.min(sourceSize.h, drawY - yTop);
        let sourceY = sourceSize.h - displayHeight;

        this.tmpCtx.clearRect(
          x,
          drawY - displayHeight,
          1,
          displayHeight,
        );

        this.tmpCtx.drawImage(
          patternSource,
          u,
          sourceY,
          w,
          displayHeight,
          x,
          drawY - displayHeight,
          1,
          displayHeight,
        );
      }
    }

    return this.tmpCtx.canvas.transferToImageBitmap();
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
