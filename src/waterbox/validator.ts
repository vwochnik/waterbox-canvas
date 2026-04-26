import { ColorScheme, Pattern, Scale, StrokeWidths } from './options';
import { parseToRgba, ColorError } from 'color2k';

export function validateDimension(dimension: unknown): number {
  assertIsNumber(dimension, true, 1);
  return dimension;
}

export function validatePadding(padding: unknown): number {
  assertIsNumber(padding, true, 0);
  return padding;
}

export function validateValue(value: unknown): number {
  assertIsNumber(value, true, 0, 100);
  return value;
}

export function validateTiltAngle(tiltAngle: unknown): number {
  assertIsNumber(tiltAngle, true, 0, 45);
  return tiltAngle;
}

export function validateColorScheme(colorScheme: unknown): ColorScheme {
  assertIsColorScheme(colorScheme);
  return colorScheme;
}

export function validateOptionalColorScheme(colorScheme?: unknown): ColorScheme | undefined {
  if (colorScheme === undefined) {
    return undefined;
  }
  return validateColorScheme(colorScheme);
}

export function validateOptionalPattern(pattern?: unknown): Pattern | undefined {
  if (pattern === undefined) {
    return undefined;
  }

  assertIsPattern(pattern);
  return pattern;
}

export function validateStrokeWidths(strokeWidths: unknown): StrokeWidths {
  assertIsStrokeWidths(strokeWidths);
  return strokeWidths;
}

export function validateOptionalScale(scale?: unknown): Scale | undefined {
  if (scale === undefined) {
    return undefined;
  }

  assertIsScale(scale);
  return scale;
}

export function validateBoolean(value: unknown): boolean {
  assertIsBoolean(value);
  return value;
}

function assertIsNumber(
  value: unknown,
  mustBeInteger: boolean,
  min?: number,
  max?: number,
): asserts value is number {
  if (mustBeInteger) {
    if (!Number.isInteger(value)) {
      throw new Error('Not an integer');
    }
  } else {
    if (!Number.isFinite(value)) {
      throw new Error('Not a number');
    }
  }

  const numericValue = value as number;
  if (min !== undefined) {
    if (numericValue < min) {
      throw new Error(`Number must be greater than or equal to ${min}`);
    }
  }

  if (max !== undefined) {
    if (numericValue > max) {
      throw new Error(`Number must be less than or equal to ${max}`);
    }
  }
}

function assertIsObject(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Not an object');
  }
}

function assertIsBoolean(value: unknown): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new Error('Expected a boolean');
  }
}

export function assertIsOneOf<const T extends readonly unknown[]>(
  value: unknown,
  available: T,
): asserts value is T[number] {
  if (!(available as readonly unknown[]).includes(value)) {
    throw new Error(`Expected value to be one of: ${available.map(String).join(', ')}`);
  }
}

function assertIsFunction(value: unknown): asserts value is (...args: unknown[]) => unknown {
  if (typeof value !== 'function') {
    throw new Error('Expected a function');
  }
}

function assertKeys<K extends readonly string[]>(
  value: unknown,
  requiredKeys: K,
  optionalKeys: readonly K[number][] = [],
  allowOtherKeys: boolean = false,
): asserts value is Record<K[number], unknown> {
  assertIsObject(value);

  const valueKeys = Object.keys(value);

  const allKeys = [...requiredKeys, ...optionalKeys];

  // Compute required keys by excluding optional ones
  const missingKeys = requiredKeys.filter((key) => !valueKeys.includes(key));
  if (missingKeys.length > 0) {
    throw new Error(`Missing keys: "${missingKeys.join(', ')}"`);
  }

  if (!allowOtherKeys) {
    const extraKeys = valueKeys.filter((k) => !allKeys.includes(k));
    if (extraKeys.length > 0) {
      throw new Error(`Unexpected keys: ${extraKeys.join(', ')}`);
    }
  }
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string');
  }
}

function assertIsColor(value: unknown): asserts value is string {
  assertIsString(value);
  try {
    parseToRgba(value);
  } catch (err: unknown) {
    if (err instanceof ColorError) {
      throw err;
    }
    throw new Error('Invalid color');
  }
}

function assertIsColorScheme(value: unknown): asserts value is ColorScheme {
  assertKeys(
    value,
    ['fill'],
    ['stroke', 'innerStroke', 'outerStroke', 'contrast', 'lighter', 'darker'],
    false,
  );
  assertIsColor(value.fill);
  if ('stroke' in value) {
    assertIsColor(value.stroke);
  } else {
    assertIsColor(value.innerStroke);
    assertIsColor(value.outerStroke);
  }

  if ('contrast' in value) {
    assertIsNumber(value.contrast, false, 0, 1);
  } else {
    assertIsColor(value.lighter);
    assertIsColor(value.darker);
  }
}

function assertIsPattern(value: unknown): asserts value is Pattern {
  assertIsObject(value);

  if (value.alignToEdges !== undefined) {
    assertIsBoolean(value.alignToEdges);
  }

  if ('name' in value) {
    assertKeys(value, ['name', 'size', 'alpha'], ['alignToEdges'], false);
    assertIsString(value.name);
    assertIsNumber(value.size, false, 0);
    assertIsNumber(value.alpha, false, 0, 1);
  } else {
    assertKeys(value, ['creator'], ['alignToEdges'], false);
    assertIsFunction(value.creator);
  }
}

function assertIsScale(value: unknown): asserts value is Scale {
  assertKeys(value, ['divisions', 'size'], ['position'], false);
  if (value.position !== undefined) {
    assertIsOneOf(value.position, ['back', 'water', 'front']);
  }
  assertIsNumber(value.divisions, true, 2);
  assertIsNumber(value.size, false, 0, 1);
}

function assertIsStrokeWidths(value: unknown): asserts value is StrokeWidths {
  assertKeys(value, ['outer', 'inner'], [], false);
  assertIsNumber(value.outer, true, 0);
  assertIsNumber(value.inner, true, 0);
}
