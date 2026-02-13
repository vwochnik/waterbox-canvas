import { ColorScheme, Pattern, Scale } from './options';
import { parseToRgba, ColorError } from 'color2k';

export function validateDimension(dimension: unknown): number {
  /*if (!Number.isInteger(dimension) || dimension <= 0) {
    throw new Error(`Dimension must be a positive integer`);
  }*/
  return dimension as number;
}

export function validateValue(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`Value must be a valid integer between 0 and 100.`);
  }
  return value;
}

export function validateColorScheme(colorScheme: ColorScheme): ColorScheme {
  throwIfInvalidObject(colorScheme, ['fill', 'stroke'], true);

  throwIfInvalidColor(colorScheme.fill);
  throwIfInvalidColor(colorScheme.stroke);
  if ('contrast' in colorScheme) {
    throwIfInvalidObject(colorScheme, ['fill', 'stroke', 'contrast'], false);
    if (
      !Number.isFinite(colorScheme.contrast) ||
      colorScheme.contrast < 0 ||
      colorScheme.contrast > 1
    ) {
      throw new Error(`Contrast must be between 0 and 1`);
    }
  } else /*if ("lighter" in colorScheme && "darker" in colorScheme)*/ {
    throwIfInvalidObject(colorScheme, ['fill', 'stroke', 'lighter', 'darker'], false);
    throwIfInvalidColor(colorScheme.lighter);
    throwIfInvalidColor(colorScheme.darker);
  }

  return colorScheme;
}

export function validateOptionalColorScheme(colorScheme?: ColorScheme): ColorScheme | undefined {
  if (colorScheme === undefined) {
    return undefined;
  }
  return validateColorScheme(colorScheme);
}

export function validateOptionalPattern(pattern?: Pattern): Pattern | undefined {
  if (pattern === undefined) {
    return undefined;
  }

  throwIfInvalidObject(pattern, ['type'], true);
  if (pattern.type === 'predefined') {
    throwIfInvalidObject(pattern, ['type', 'name', 'size', 'alpha'], false);
    throwIfNotAString(pattern.name);
    ['size', 'alpha'].forEach((key) => throwIfNotAPositiveNumber(pattern[key as keyof Pattern]));
  } else if (pattern.type === 'custom') {
    throwIfInvalidObject(pattern, ['type', 'creator'], false);
    /* tslint:disable:strict-type-predicates */
    if (typeof pattern.creator !== 'function') {
      throw new Error('Creator must be a function');
    }
  }

  return pattern;
}

export function validateStrokeWidth(width: number): number {
  throwIfNotAPositiveNumber(width);
  return width;
}

export function validateOptionalScale(scale?: Scale): Scale | undefined {
  if (scale === undefined) {
    return undefined;
  }
  throwIfInvalidObject(scale, ['divisions', 'size'], false);
  if (!Number.isFinite(scale.size) || scale.size < 0 || scale.size > 1) {
    throw new Error(`Size must be a number between 0 and 1`);
  }
  if (!Number.isInteger(scale.divisions) || scale.divisions < 2) {
    throw new Error(`Divisions must be an integer greater than 1`);
  }
  return scale;
}

export function validateBoolean(value: boolean): boolean {
  /* tslint:disable:strict-type-predicates */
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid boolean`);
  }
  return value;
}

function throwIfInvalidColor(color: string) {
  try {
    parseToRgba(color);
  } catch (err: unknown) {
    if (err instanceof ColorError) {
      throw err;
    }
    throw new Error('Invalid color');
  }
}

function throwIfInvalidObject(obj: any, keys: string[], hasOptionalKeys: boolean) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error(`Invalid object`);
  }

  const objKeys = Object.keys(obj);

  const isValidLength = hasOptionalKeys
    ? objKeys.length >= keys.length
    : objKeys.length === keys.length;

  if (!isValidLength) {
    throw new Error(`Invalid object`);
  }

  if (!keys.every((k) => Object.prototype.hasOwnProperty.call(obj, k))) {
    throw new Error(`Invalid object`);
  }
}

function throwIfNotAString(value: any) {
  if (typeof value !== 'string') {
    throw new Error(`Invalid string`);
  }
}

function throwIfNotAPositiveNumber(value: any) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid number`);
  }
}


function assertIsNumber(value: unknown, mustBeInteger: boolean, min?: number, max?: number): asserts value is number {
  if (mustBeInteger) {
    if (!Number.isInteger(value)) {
      throw new Error("Not an integer");
    }
  } else {
    if (!Number.isFinite(value)) {
      throw new Error("Not a number");
    }
  }

  const numericValue = value as number;
  if (min !== undefined) {
    if (numericValue < min) {
      throw new Error(`Number must be greater than ${min}`);
    }
  }

  if (max !== undefined) {
    if (numericValue > max) {
      throw new Error(`Number must be less than ${max}`);
    }
  }
}
