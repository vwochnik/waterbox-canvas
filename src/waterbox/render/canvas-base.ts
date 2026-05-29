import { BaseRenderingOptions, RgbaColor } from './types';
import { hasAnyKey } from '../util';
import { RenderingOptions } from './rendering-options';
import {
  createOffscreenRenderingContext,
  FillStyle,
  getContext,
  PathFunction,
  rgbaColorToString,
} from './util';

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const OPAQUE_BLACK = 'black';

export abstract class CanvasBaseRenderer<
  RenderingOptions extends BaseRenderingOptions = BaseRenderingOptions,
  Type extends string = string,
> extends RenderingOptions<RenderingOptions> {
  abstract readonly type: Type;

  protected ctx: Ctx2D;

  protected bufCtx!: OffscreenCanvasRenderingContext2D;
  protected tmpCtx!: OffscreenCanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options: RenderingOptions) {
    super(options);
    this.ctx = getContext(canvas);
    this.initializeContexts();
  }

  update(options: Partial<RenderingOptions>): void {
    super.update(options);
    if (hasAnyKey(options, ['width', 'height'])) {
      this.initializeContexts();
    }
  }

  public render(): void {
    const { width, height } = this.options;
    this.bufCtx.clearRect(0, 0, width, height);

    this.paint();

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.bufCtx.canvas, 0, 0);
  }

  abstract paint(): void;

  protected paintLayer(
    fillPaths: PathFunction[],
    strokePaths: PathFunction[],
    outerPath: PathFunction,
    fillStyles: FillStyle[],
    innerStrokeColor: RgbaColor,
    outerStrokeColor: RgbaColor,
    patterns: (CanvasPattern | undefined)[],
  ) {
    this.paintFilling(fillPaths, fillStyles, patterns);

    this.paintEdges([...fillPaths, ...strokePaths], outerPath, innerStrokeColor, outerStrokeColor);
  }

  private paintFilling(
    paths: PathFunction[],
    fillStyles: FillStyle[],
    patterns: (CanvasPattern | undefined)[],
  ): void {
    this.clearTempContext();

    paths.forEach((path, index) => {
      this.tmpCtx.save();
      path(this.tmpCtx);
      this.tmpCtx.fillStyle = fillStyles[index];
      this.tmpCtx.fill();

      const pattern = patterns[index];
      if (pattern) {
        this.tmpCtx.globalCompositeOperation = 'overlay';
        this.tmpCtx.fillStyle = pattern;
        this.tmpCtx.fill();
      }
      this.tmpCtx.restore();
    });

    this.bufCtx.drawImage(this.tmpCtx.canvas, 0, 0);
  }

  private paintEdges(
    pathFunctions: PathFunction[],
    outerPathFunction: PathFunction,
    innerStrokeColor: RgbaColor,
    outerStrokeColor: RgbaColor,
  ): void {
    const {
      strokeWidths: { outer: outerStrokeWidth, inner: innerStrokeWidth },
      clipEdges,
    } = this.options;

    // Inner edges: stroke all paths, then punch out the outer outline.
    this.clearTempContext();
    this.tmpCtx.lineCap = 'round';
    this.tmpCtx.lineJoin = 'round';
    this.tmpCtx.lineWidth = innerStrokeWidth;
    this.tmpCtx.strokeStyle = clipEdges ? OPAQUE_BLACK : opaque(innerStrokeColor);

    pathFunctions.forEach(strokePath(this.tmpCtx));

    this.tmpCtx.globalCompositeOperation = 'destination-out';
    this.tmpCtx.lineWidth = outerStrokeWidth;
    this.tmpCtx.strokeStyle = OPAQUE_BLACK;
    strokePath(this.tmpCtx)(outerPathFunction);
    this.tmpCtx.globalCompositeOperation = 'source-over';

    copyEdges(this.bufCtx, this.tmpCtx, innerStrokeColor, clipEdges);

    // Outer edge.
    this.clearTempContext();
    this.tmpCtx.lineWidth = outerStrokeWidth;
    this.tmpCtx.strokeStyle = clipEdges ? OPAQUE_BLACK : opaque(outerStrokeColor);
    strokePath(this.tmpCtx)(outerPathFunction);

    copyEdges(this.bufCtx, this.tmpCtx, outerStrokeColor, clipEdges);
  }

  private initializeContexts() {
    const { width, height } = this.options;
    this.bufCtx = createOffscreenRenderingContext(width, height);
    this.tmpCtx = createOffscreenRenderingContext(width, height);
  }

  private clearTempContext(): void {
    const { width, height } = this.options;
    this.tmpCtx.clearRect(0, 0, width, height);
  }
}

function opaque(color: RgbaColor): string {
  return rgbaColorToString({ ...color, a: 1.0 });
}

function copyEdges(ctx: Ctx2D, tmp: Ctx2D, strokeColor: RgbaColor, clipEdges: boolean) {
  ctx.globalAlpha = strokeColor.a;
  ctx.globalCompositeOperation = clipEdges ? 'destination-out' : 'source-over';
  ctx.drawImage(tmp.canvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
}

function strokePath(ctx: Ctx2D) {
  return function (pathFunction: PathFunction) {
    ctx.save();
    pathFunction(ctx);
    ctx.restore();
    ctx.stroke();
  };
}
