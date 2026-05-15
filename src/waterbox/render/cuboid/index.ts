import { BaseRenderingOptions, Renderer } from "../index";
import { createOffscreenRenderingContext } from "../util";
import { render } from "./renderer";

export interface CuboidRenderingOptions extends BaseRenderingOptions {
  clipEdges: boolean;
  alignPatternToEdges: boolean;
}

export class CuboidRenderer implements Renderer<CuboidRenderingOptions, "cuboid"> {
  readonly type = 'cuboid' as const;
  private _options: CuboidRenderingOptions;

  private bufferContext!: OffscreenCanvasRenderingContext2D;
  private tempContext!: OffscreenCanvasRenderingContext2D;

  constructor(options: CuboidRenderingOptions) {
    this._options = { ...options, scale: options.scale ?? 1 };
    this.initializeContexts();
  }

  get options(): CuboidRenderingOptions {
    return this._options;
  }

  update(options: Partial<CuboidRenderingOptions>): void {
    this._options = { ...this._options, ...options };
    if (options.width !== undefined || options.height !== undefined) {
      this.initializeContexts();
    }
  }

  render(canvas: HTMLCanvasElement | OffscreenCanvas): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas.');
    }

    render(
      this._options,
      ctx,
      this.bufferContext,
      this.tempContext
    );
  }

  private initializeContexts() {
    this.bufferContext = createOffscreenRenderingContext(this._options.width, this._options.height);
    this.tempContext = createOffscreenRenderingContext(this._options.width, this._options.height);
  }
}
