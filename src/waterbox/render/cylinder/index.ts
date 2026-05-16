import { BaseRenderingOptions, Renderer } from '../index';
import { createOffscreenRenderingContext, getContext } from '../util';
import { render } from './renderer';

export interface CylinderRenderingOptions extends BaseRenderingOptions {
}

export class CylinderRenderer implements Renderer<CylinderRenderingOptions, 'cylinder'> {
  readonly type = 'cylinder' as const;
  private _options: CylinderRenderingOptions;

  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  private bufCtx!: OffscreenCanvasRenderingContext2D;
  private tmpCtx!: OffscreenCanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options: CylinderRenderingOptions) {
    this._options = { ...options };
    this.ctx = getContext(canvas);
    this.initializeContexts();
  }

  get options(): CylinderRenderingOptions {
    return this._options;
  }

  update(options: Partial<CylinderRenderingOptions>): void {
    this._options = { ...this._options, ...options };
    if (options.width !== undefined || options.height !== undefined) {
      this.initializeContexts();
    }
  }

  render(): void {
    render(this._options, this.ctx, this.bufCtx, this.tmpCtx);
  }

  private initializeContexts() {
    this.bufCtx = createOffscreenRenderingContext(this._options.width, this._options.height);
    this.tmpCtx = createOffscreenRenderingContext(this._options.width, this._options.height);
  }
}
