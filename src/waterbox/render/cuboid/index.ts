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
    this._options = { ...options };
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
    const ctx = getContext(canvas);

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

function getContext(canvas: HTMLCanvasElement | OffscreenCanvas): CanvasRenderingContext2D |OffscreenCanvasRenderingContext2D {
  let context: CanvasRenderingContext2D |OffscreenCanvasRenderingContext2D | null;
  if (canvas instanceof HTMLCanvasElement) {
    context = canvas.getContext('2d');
  } else {
    context = canvas.getContext('2d');
  }
  if (!context) {
    throw new Error("can't get context");
  }
  return context;
}
