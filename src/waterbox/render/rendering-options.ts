import { BaseRenderingOptions } from '.';

/**
 * Base class that owns an immutable snapshot of rendering options.
 *
 * Subclasses read configuration through the {@link options} getter and may
 * override {@link update} (calling `super.update(...)`) to react to changes.
 * The stored options are never exposed by reference, so external callers
 * cannot mutate internal state.
 *
 * @template Options - The concrete rendering options type
 */
export abstract class RenderingOptions<
  Options extends BaseRenderingOptions = BaseRenderingOptions,
> {
  private _options: Options;

  constructor(options: Options) {
    this._options = { ...options };
  }

  /**
   * A read-only copy of the current options.
   * Mutating the returned object does not affect internal state.
   */
  get options(): Readonly<Options> {
    return this._options;
  }

  /**
   * Merges the given partial options into the current options.
   * @param options - The option values to override
   */
  update(options: Partial<Options>): void {
    this._options = { ...this._options, ...options };
  }
}
