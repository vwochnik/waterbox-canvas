import { BaseRenderingOptions } from '.';

export abstract class RenderingOptions<
  RenderingOptions extends BaseRenderingOptions = BaseRenderingOptions,
> {
  private _options: RenderingOptions;

  constructor(options: RenderingOptions) {
    this._options = { ...options };
  }

  get options(): RenderingOptions {
    return this._options;
  }

  update(options: Partial<RenderingOptions>): void {
    this._options = { ...this._options, ...options };
  }
}
