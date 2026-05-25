import { CylinderRenderingOptions } from ".";
import { hasAnyKey } from "../../util";
import { RenderingOptions } from "../rendering-options";
import { calculateRectAndSize, createOffscreenRenderingContext, getCanvasImageSourceSize } from "../util";

export type PatternSourceOptionProperty =
  | 'backPatternSource'
  | 'waterPatternSource'
  | 'frontPatternSource';

export class WallImageGenerator extends RenderingOptions<CylinderRenderingOptions> {

  private destCtx!: OffscreenCanvasRenderingContext2D;
  private valid = false;

  constructor(
    options: CylinderRenderingOptions,
    private patternSourceOptionProperty: PatternSourceOptionProperty,
    private facing: 'front' | 'back',
  ) {
    super(options);
    this.initializeContexts();
  }

  update(options: Partial<CylinderRenderingOptions>): void {
    super.update(options);
    if (hasAnyKey(options, ['width', 'height'])) {
      this.initializeContexts();
      this.valid = false;
      return;
    }

    const needsPatternUpdate = hasAnyKey(options, [
      'padding',
      'tiltAngle',
      'strokeWidths',
    ]);

    if (needsPatternUpdate || Object.hasOwn(options, this.patternSourceOptionProperty)) {
      this.valid = false;
    }
  }

  getSource(): CanvasImageSource | undefined {
    if (this.valid) {
      return this.destCtx.canvas;
    }

    const patternSource = this.options[this.patternSourceOptionProperty];

    if (!patternSource) {
      return undefined;
    }

    this.render();
    return this.destCtx.canvas;
  }

  private render() {
    const patternSource = this.options[this.patternSourceOptionProperty];

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
    const uOffset =
      (this.options.centerPatternHorizontally ?? false) ? (sourceSize.w - mappedWidth) / 2 : 0;

    this.destCtx.reset();

    const startX = centerX - radiusX;
    const endX = centerX + radiusX;

    for (let x = startX; x <= endX; x++) {
      const normalizedX = Math.max(-1, Math.min(1, (x - centerX) / radiusX));

      const angle = Math.asin(normalizedX);

      const yTop = centerY + (this.facing === 'back' ? -1 : 1) * Math.cos(angle) * radiusY;
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

        this.destCtx.clearRect(x, drawY - displayHeight, 1, displayHeight);

        this.destCtx.drawImage(
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

    this.valid = true;
  }

  private initializeContexts() {
    this.destCtx = createOffscreenRenderingContext(this.options.width, this.options.height);
  }
}
