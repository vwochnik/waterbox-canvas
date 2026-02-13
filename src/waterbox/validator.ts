import { ColorScheme, Pattern, Scale } from './options';
import { parseToRgba, ColorError } from 'color2k';

export function validateDimension(dimension: unknown): number {
  assertIsNumber(dimension, true, 1);
  return dimension;
}

export function validateValue(value: unknown): number {
  assertIsNumber(value, true, 0, 100);
  return value;
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

export function validateStrokeWidth(width: unknown): number {
  assertIsNumber(width, false, 0);
  return width;
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
  if (typeof value !== "object" || value === null) {
    throw new Error("Not an object");
  }
}

function assertIsBoolean(value: unknown): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new Error("Expected a boolean");
  }
}

function assertIsFunction(
  value: unknown
): asserts value is (...args: unknown[]) => unknown {
  if (typeof value !== "function") {
    throw new Error("Expected a function");
  }
}

function assertKeys<
  K extends readonly string[]
>(
  value: unknown,
  keys: K,
  strict: boolean
): asserts value is Record<K[number], unknown> {
  assertIsObject(value);

  const valueKeys = Object.keys(value);

  const isValidLength = (!strict)
    ? valueKeys.length >= keys.length
    : valueKeys.length === keys.length;

  if (!isValidLength) {
    throw new Error(`Invalid object`);
  }

  if (!keys.every((k) => Object.prototype.hasOwnProperty.call(value, k))) {
    throw new Error(`Invalid object`);
  }
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Not a string");
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
  assertIsObject(value);
  assertKeys(value, ["fill", "stroke"], false);
  assertIsColor(value.fill);
  assertIsColor(value.stroke);

  if ("contrast" in value) {
    assertKeys(value, ["fill", "stroke", "contrast"], true);
    assertIsNumber(value.contrast, false, 0, 1);
  } else {
    assertKeys(value, ["fill", "stroke", "lighter", "darker"], true);
    assertIsColor(value.lighter);
    assertIsColor(value.darker);
  }
}

function assertIsPattern(value: unknown): asserts value is Pattern {
  assertIsObject(value);
  assertKeys(value, ["type"], false);

  if (value.type === "predefined") {
    assertKeys(value, ["type", "name", "size", "alpha"], true);
    assertIsString(value.name);
    assertIsNumber(value.size, false, 0);
    assertIsNumber(value.alpha, false, 0, 1);
  } else {
    assertKeys(value, ["type", "creator"], true);
    assertIsFunction(value.creator);
  }
}

function assertIsScale(value: unknown): asserts value is Scale {
  assertIsObject(value);
  assertKeys(value, ["divisions", "size"], true);
  assertIsNumber(value.divisions, true, 2);
  assertIsNumber(value.size, false, 0, 1);
}
