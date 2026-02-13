/**
 * Utility type that maps each property of T to a boolean indicating whether it is optional.
 * Returns `true` if the property can be undefined, `false` if it is required.
 * @template T - The object type to analyze
 */
export type Optionality<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? true : false;
};

/**
 * Base interface for options objects. Extend this to define specific option interfaces.
 */
export interface BaseOptions {}

/**
 * Type for fluent option accessors that allow both getting and setting values.
 * Each property becomes a function that can act as both getter and setter.
 *
 * For each option key `K`:
 *
 * - `K()` returns the current value
 * - `K(value)` sets the value and returns the instance
 *
 * Additionally:
 *
 * - `options()` returns all options
 * - `options(value)` updates multiple options
 * @template T - The options object type
 */
export type OptionAccessors<T extends BaseOptions, I extends OptionAccessors<T, I>> = {
  [K in keyof T]-?: {
    (value: T[K]): I; // setter
    (): T[K]; // getter
  };
} & {
  options(): T;
  options(value: Partial<T>): I;
};

/**
 * Creates a fluent API for accessing and modifying options.
 * Returns an object where each option property is a function that can be used as both getter and setter.
 * @template T - The options object type
 * @param keysWithOptionality Object mapping all available fields to a boolean wehther they are optional
 * @param defaults - Default options. Optional fields can be omitted
 * @param updated - Optional callback function called when options are updated.
 *   Receives an array of changed keys and a copy of the current options object.
 *   This function is called initially with all avaiable options even optional ones
 * @returns An object with fluent getter/setter methods for each option
 * @example
 * ```typescript
 * interface Config {
 *   width: number;
 *   height?: number;
 * }
 *
 * const config = createOptionAccessors<Config>(
 *   { width: false, height: true },
 *   { width: 100 },
 *   (changes, options) => console.log('Updated:', changes, options),
 *   {
 *     width: (value) => Math.max(0, value)
 *   }
 * );
 *
 * config.width(200).height(300);
 * console.log(config.options()); // { width: 200, height: 300 }
 * ```
 */
export function createOptionAccessors<T extends BaseOptions, I extends OptionAccessors<T, I>>(
  instance: I,
  keysWithOptionality: Optionality<T>,
  defaults: T,
  updated?: (updatedKeys: (keyof T)[], options: T) => void,
  validators?: { [K in keyof T]?: (value: T[K]) => T[K] },
): I {
  let options!: T;

  function update(updatedKeys: (keyof T)[], diff: Partial<T>) {
    const newOptions = updatedKeys.reduce(
      (newOptions, key) => {
        const value = diff[key];
        if (value === undefined) {
          if (!keysWithOptionality[key]) {
            throw new Error(`Invalid ${key as string}: Required option cannot be undefined`);
          }
          delete newOptions[key];
        } else {
          const validator = validators?.[key];
          try {
            newOptions[key] = validator ? validator(value) : value;
          } catch (err: unknown) {
            if (err instanceof Error) {
              throw new Error(`Invalid ${key as string}: ${err.message}`);
            }
          }
        }
        return newOptions;
      },
      { ...options },
    );
    updated?.(updatedKeys, { ...newOptions });
    options = newOptions;
  }

  // Per-option getter/setters
  (Object.keys(keysWithOptionality) as (keyof T)[]).forEach((key) => {
    instance[key] = function (value?: T[typeof key]) {
      if (arguments.length === 0) return options[key];
      update([key], { [key]: value } as Partial<T>);
      return instance;
    } as I[typeof key];
  });

  // .options getter/setter
  instance.options = function (value?: Partial<T>) {
    if (arguments.length === 0) return { ...options };
    update(Object.keys(value!) as (keyof T)[], value!);
    return instance;
  } as I['options'];

  // initial update
  update(Object.keys(keysWithOptionality) as (keyof T)[], defaults);

  return instance;
}
