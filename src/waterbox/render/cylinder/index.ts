import { BaseRenderingOptions } from '../index';
import { calculateRectAndSize, makePatteern, makeSteps, Rectangle } from '../util';
import { RgbaColor, RgbaColorScheme, rgbaColorToString } from '../../color';
import { basePath, wallPath, separatorPath } from './paths';
import { CanvasBaseRenderer } from '../canvas-base';
import { rgba } from 'color2k';

export interface CylinderRenderingOptions extends BaseRenderingOptions {
  clipEdges: boolean;
}

export class CylinderRenderer extends CanvasBaseRenderer<CylinderRenderingOptions, 'cylinder'> {
  readonly type = 'cylinder' as const;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options: CylinderRenderingOptions) {
    super(canvas, options);
  }

  render(): void {
    const {
      width,
      height,
      value,
      clipEdges,
      scale,
      backColorScheme,
      waterColorScheme,
      frontColorScheme,
      backPatternSource,
      waterPatternSource,
      frontPatternSource,
    } = this.options;

    const scalePosition = this.options.scale?.position ?? 'back';

    const backPattern = makePatteern(this.bufCtx, backPatternSource);
    const waterPattern = makePatteern(this.bufCtx, waterPatternSource);
    const frontPattern = makePatteern(this.bufCtx, frontPatternSource);

    const [rect, size] = calculateRectAndSize(this.options);

    this.bufCtx.reset();

    this.paint(
      [
        basePath(rect, size, 0, 'bottom'),
        wallPath(rect, size, 0, 'back'),
      ],
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
      clipEdges,
      [backPattern, backPattern, backPattern],
    );

    if (value > 0) {
      this.paint(
        [
          wallPath(rect, size, value, 'front'),
          basePath(rect, size, value, 'top'),
        ],
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
        clipEdges,
        [waterPattern, waterPattern, waterPattern],
      );
    }

    if (frontColorScheme) {
      this.paint(
        [
          wallPath(rect, size, 100, 'front'),
          basePath(rect, size, 100, 'top'),
        ],
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
        clipEdges,
        [frontPattern, frontPattern, frontPattern],
      );
    }

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.bufCtx.canvas, 0, 0);
  }
}

function makeWallGradient(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  colorScheme: RgbaColorScheme
): CanvasGradient {
  const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y);
  gradient.addColorStop(0, rgbaColorToString(colorScheme.darker));
  gradient.addColorStop(0.5, rgbaColorToString(colorScheme.lighter));
  gradient.addColorStop(1, rgbaColorToString(colorScheme.darker));
  return gradient;
}
