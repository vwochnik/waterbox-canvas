import { CylinderRenderingOptions } from ".";
import { hasAnyKey } from "../../util";
import { RenderingOptions } from "../rendering-options";
import { calculateRectAndSize, createOffscreenRenderingContext, getCanvasImageSourceSize, Size } from "../util";

export type PatternSourceOptionProperty =
  | 'backPatternSource'
  | 'waterPatternSource'
  | 'frontPatternSource';

export class WallImageGenerator extends RenderingOptions<CylinderRenderingOptions> {
  private readonly scaleFactor = 2;

  private srcCtx: OffscreenCanvasRenderingContext2D | undefined = undefined;
  private srcValid = false;
  private srcSize: Size | undefined;

  private destCtx!: OffscreenCanvasRenderingContext2D;
  private destValid = false;

  constructor(
    options: CylinderRenderingOptions,
    private patternSourceOptionProperty: PatternSourceOptionProperty,
    private facing: 'front' | 'back',
  ) {
    super(options);
    this.initializeDestinationContext();
  }

  update(options: Partial<CylinderRenderingOptions>): void {
    super.update(options);
    if (hasAnyKey(options, ['width', 'height'])) {
      this.initializeDestinationContext();
      this.destValid = false;
    }

    if (hasAnyKey(options, [
      'padding',
      'tiltAngle',
      'strokeWidths',
    ])) {
      this.destValid = false;
    }

    if (Object.hasOwn(options, this.patternSourceOptionProperty)) {
      this.srcValid = false;
      this.destValid = false;
    }
  }

  getSource(): CanvasImageSource | undefined {
    if (this.destValid) {
      return this.destCtx.canvas;
    }

    if (!this.srcValid) {
      this.initializeSourceContext();
      if (!this.srcValid) {
        return undefined;
      }
    }

    this.render();
    return this.destCtx.canvas;
  }

  getScale(): number {
    return 1 / this.scaleFactor;
  }

  private render() {
    const patternSource = this.srcCtx?.canvas;
    if (!patternSource) {
      return undefined;
    }

    const s = this.scaleFactor;
    const sourceSize = this.srcSize!;
    const [rect, size] = calculateRectAndSize(this.options);

    const radiusX = s * size.w / 2;
    const radiusY = s * size.h / 2;
    const centerX = s * rect.x + radiusX;
    const centerY = s * rect.y + radiusY;
    const height = s * rect.h - s * size.h;

    const mappedWidth = radiusX * Math.PI;
    const uOffset =
      (this.options.centerPatternHorizontally ?? false) ? (s * sourceSize.w - mappedWidth) / 2 : 0;

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

      let u = (uOffset + progress * mappedWidth) % (s * sourceSize.w);
      while (u < 0) {
        u += s * sourceSize.w;
      }

      for (let drawY = yBottom; drawY > yTop; drawY -= s * sourceSize.h) {
        let displayHeight = Math.min(s * sourceSize.h, drawY - yTop);
        let sourceY = s * sourceSize.h - displayHeight;

        this.destCtx.clearRect(x, drawY - displayHeight, 1, displayHeight);

        this.destCtx.drawImage(
          this.srcCtx!.canvas,
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

    this.destValid = true;
  }

  private initializeSourceContext() {
    const patternSource = this.options[this.patternSourceOptionProperty];
    if (!patternSource) {
      this.srcValid = false;
      return;
    }

    this.srcSize = getCanvasImageSourceSize(patternSource);

    this.srcCtx = createOffscreenRenderingContext(this.srcSize.w * this.scaleFactor, this.srcSize.h * this.scaleFactor);

    this.srcCtx.drawImage(patternSource, 0, 0, this.srcSize.w, this.srcSize.h, 0, 0, this.srcSize.w * this.scaleFactor, this.srcSize.h * this.scaleFactor);

    this.srcValid = true;
  }

  private initializeDestinationContext() {
    this.destCtx = createOffscreenRenderingContext(this.options.width * this.scaleFactor, this.options.height * this.scaleFactor);
  }
}
