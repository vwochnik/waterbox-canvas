import { BaseRenderingOptions } from '.';
import { RgbaColor, rgbaColorToString } from '../color';
import { hasAnyKey } from '../util';
import { createOffscreenRenderingContext, FillStyle, getContext, PathFunction } from './util';

export abstract class CanvasBaseRenderer<
  RenderingOptions extends BaseRenderingOptions = BaseRenderingOptions,
  Type extends string = string,
> {
  abstract readonly type: Type;
  private _options: RenderingOptions;

  protected ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  protected bufCtx!: OffscreenCanvasRenderingContext2D;
  protected tmpCtx!: OffscreenCanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options: RenderingOptions) {
    this._options = { ...options };
    this.ctx = getContext(canvas);
    this.initializeContexts();
  }

  get options(): RenderingOptions {
    return this._options;
  }

  update(options: Partial<RenderingOptions>): void {
    this._options = { ...this._options, ...options };
    if (hasAnyKey(options, ['width', 'height'])) {
      this.initializeContexts();
    }
  }

  abstract render(): void;

  protected paint(
    fillPaths: PathFunction[],
    strokePaths: PathFunction[],
    outerPath: PathFunction,
    fillStyles: FillStyle[],
    innerStrokeColor: RgbaColor,
    outerStrokeColor: RgbaColor,
    patterns: (CanvasPattern | undefined)[],
  ) {
    this.paintFilling(fillPaths, fillStyles, patterns);

    this.paintEdges(
      [...fillPaths, ...strokePaths],
      outerPath,
      innerStrokeColor,
      outerStrokeColor,
    );
  }

  private paintFilling(
    paths: PathFunction[],
    fillStyles: FillStyle[],
    patterns: (CanvasPattern | undefined)[],
  ): void {
    const { width, height } = this.options;

    this.tmpCtx.clearRect(0, 0, width, height);
    paths.forEach((path, index) => {
      this.tmpCtx.save();
      path(this.tmpCtx);
      this.tmpCtx.fillStyle = fillStyles[index];
      this.tmpCtx.fill();

      if (patterns[index]) {
        this.tmpCtx.globalCompositeOperation = 'overlay';
        this.tmpCtx.fillStyle = patterns[index]!;
        this.tmpCtx.fill();
        this.tmpCtx.globalCompositeOperation = 'source-over';
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
      width,
      height,
      strokeWidths: { outer: outerStrokeWidth, inner: innerStrokeWidth },
    } = this.options;
    const clipEdges = this.options.clipEdges;

    this.tmpCtx.clearRect(0, 0, width, height);

    this.tmpCtx.lineCap = 'round';
    this.tmpCtx.lineJoin = 'round';
    this.tmpCtx.lineWidth = innerStrokeWidth;
    this.tmpCtx.strokeStyle = clipEdges
      ? 'black'
      : rgbaColorToString({ ...innerStrokeColor, a: 1.0 });

    pathFunctions.forEach(strokePath(this.tmpCtx));

    this.tmpCtx.globalCompositeOperation = 'destination-out';
    this.tmpCtx.lineWidth = outerStrokeWidth;
    this.tmpCtx.strokeStyle = 'black';
    strokePath(this.tmpCtx)(outerPathFunction);
    this.tmpCtx.globalCompositeOperation = 'source-over';

    copyEdges(this.bufCtx, this.tmpCtx, innerStrokeColor, clipEdges);

    this.tmpCtx.clearRect(0, 0, width, height);

    this.tmpCtx.strokeStyle = clipEdges
      ? 'black'
      : rgbaColorToString({ ...outerStrokeColor, a: 1.0 });
    this.tmpCtx.lineWidth = outerStrokeWidth;
    strokePath(this.tmpCtx)(outerPathFunction);

    copyEdges(this.bufCtx, this.tmpCtx, outerStrokeColor, clipEdges);
  }

  private initializeContexts() {
    this.bufCtx = createOffscreenRenderingContext(this.options.width, this.options.height);
    this.tmpCtx = createOffscreenRenderingContext(this.options.width, this.options.height);
  }
}

function copyEdges(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  tmp: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  strokeColor: RgbaColor,
  clipEdges: boolean,
) {
  ctx.globalAlpha = strokeColor.a;
  if (clipEdges) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(tmp.canvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.drawImage(tmp.canvas, 0, 0);
  }
  ctx.globalAlpha = 1.0;
}

function strokePath(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  return function (pathFunction: PathFunction) {
    ctx.save();
    pathFunction(ctx);
    ctx.restore();
    ctx.stroke();
  };
}
