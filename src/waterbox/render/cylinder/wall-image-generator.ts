import { CylinderRenderingOptions } from '.';
import { hasAnyKey } from '../../util';
import { RenderingOptions } from '../rendering-options';
import {
  calculateRectAndSize,
  clamp,
  createOffscreenRenderingContext,
  getCanvasImageSourceSize,
  makePattern,
  Size,
} from '../util';

export type PatternSourceOptionProperty =
  | 'backPatternSource'
  | 'waterPatternSource'
  | 'frontPatternSource';

export class WallImageGenerator extends RenderingOptions<CylinderRenderingOptions> {
  private scaleFactor: number;
  /** Extra source-width sampled near the cylinder edges to reduce stretching artifacts. */
  private readonly edgeSampleFactor = 4;

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
    this.scaleFactor = options.wallPatternUpscaling ?? 2;
    this.initializeDestinationContext();
  }

  update(options: Partial<CylinderRenderingOptions>): void {
    super.update(options);
    if (hasAnyKey(options, ['width', 'height', 'wallPatternUpscaling'])) {
      this.scaleFactor = options.wallPatternUpscaling ?? 2;
      this.initializeDestinationContext();
      this.destValid = false;
    }

    if (hasAnyKey(options, ['padding', 'tiltAngle', 'strokeWidths', 'centerPatternHorizontally'])) {
      this.destValid = false;
    }

    if (Object.hasOwn(options, 'wallPatternUpscaling')) {
      this.srcValid = false;
    }

    if (Object.hasOwn(options, this.patternSourceOptionProperty)) {
      this.srcValid = false;
      this.destValid = false;
    }
  }

  getPattern(): CanvasPattern | undefined {
    const source = this.getSource();
    if (!source) {
      return undefined;
    }

    const scale = 1 / this.scaleFactor;
    return makePattern(this.destCtx, source, scale);
  }

  private getSource(): CanvasImageSource | undefined {
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

  private render(): void {
    if (!this.srcCtx) {
      return;
    }

    const s = this.scaleFactor;
    const sourceSize = this.srcSize!;
    const scaledSrcW = s * sourceSize.w;
    const scaledSrcH = s * sourceSize.h;
    const [rect, size] = calculateRectAndSize(this.options);

    const radiusX = (s * size.w) / 2;
    const radiusY = (s * size.h) / 2;
    const centerX = s * rect.x + radiusX;
    const centerY = s * rect.y + radiusY;
    const height = s * rect.h - s * size.h;

    const mappedWidth = radiusX * Math.PI;
    const uOffset =
      (this.options.centerPatternHorizontally ?? false) ? (scaledSrcW - mappedWidth) / 2 : 0;

    const facingSign = this.facing === 'back' ? -1 : 1;

    this.destCtx.clearRect(0, 0, scaledSrcW, scaledSrcH);

    const sourcePattern = this.destCtx.createPattern(this.srcCtx.canvas, 'repeat');
    if (!sourcePattern) {
      return;
    }

    this.destCtx.clearRect(0, 0, this.destCtx.canvas.width, this.destCtx.canvas.height);

    const startX = centerX - radiusX;
    const endX = centerX + radiusX;

    for (let x = startX; x <= endX; x++) {
      const normalizedX = clamp((x - centerX) / radiusX, -1, 1);

      const angle = Math.asin(normalizedX);

      const yTop = centerY + facingSign * Math.cos(angle) * radiusY;
      const yBottom = yTop + height;

      const progress = (angle + Math.PI / 2) / Math.PI;

      const u = (uOffset + progress * mappedWidth) % scaledSrcW;
      sourcePattern.setTransform(new DOMMatrix().scale(1, 1).translate(u, 0));

      this.destCtx.save();
      this.destCtx.fillStyle = sourcePattern;
      this.destCtx.translate(x, yBottom);
      this.destCtx.fillRect(0, -height, 1, height);
      this.destCtx.restore();
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

    const scaledWidth = this.srcSize.w * this.scaleFactor;
    const scaledHeight = this.srcSize.h * this.scaleFactor;

    if (
      this.srcCtx &&
      this.srcCtx.canvas.width === scaledWidth &&
      this.srcCtx.canvas.height === scaledHeight
    ) {
      this.srcCtx.reset();
    } else {
      this.srcCtx = createOffscreenRenderingContext(scaledWidth, scaledHeight);
    }

    this.srcCtx.imageSmoothingEnabled = true;
    this.srcCtx.imageSmoothingQuality = 'high';
    this.srcCtx.drawImage(
      patternSource,
      0,
      0,
      this.srcSize.w,
      this.srcSize.h,
      0,
      0,
      this.srcSize.w * this.scaleFactor,
      this.srcSize.h * this.scaleFactor,
    );

    this.srcValid = true;
  }

  private initializeDestinationContext() {
    this.destCtx = createOffscreenRenderingContext(
      this.options.width * this.scaleFactor,
      this.options.height * this.scaleFactor,
    );
  }
}
