import { Color, Pattern } from './options';
import { colord } from 'colord';

export function validateDimension(dimension: number): number {
  if (!Number.isInteger(dimension) || dimension <= 0) {
    throw new Error(`Invalid dimension: ${dimension}. Dimension must be a positive integer.`);
  }
  return dimension;
}

export function validateValue(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`Invalid value: ${value}. Value must be a valid number between 0 and 100.`);
  }
  return value;
}

export function validateColor(color: Color): Color {
  throwIfInvalidObject(color, ['fill', 'stroke'], true, 'color');

  throwIfInvalidColor(color.fill);
  throwIfInvalidColor(color.stroke);
  if (color.lighter && color.darker) {
    throwIfInvalidColor(color.lighter);
    throwIfInvalidColor(color.darker);
    return color;
  }

  return {
    ...color,
    lighter: colord(color.fill).lighten(0.2).toRgbString(),
    darker: colord(color.fill).darken(0.2).toRgbString(),
  };
}

export function validateOptionalColor(color?: Color): Color | undefined {
  if (color === undefined) {
    return undefined;
  }
  return validateColor(color);
}

export function validateOptionalPattern(pattern?: Pattern): Pattern | undefined {
  if (pattern === undefined) {
    return undefined;
  }

  throwIfInvalidObject(pattern, ['type'], true, 'pattern');
  if (pattern.type === 'predefined') {
    throwIfInvalidObject(pattern, ['type', 'name', 'size', 'alpha'], false, 'pattern');
    throwIfNotAString(pattern.name);
    ['size', 'alpha'].forEach((key) => throwIfNotAPositiveNumber(pattern[key as keyof Pattern]));
  } else if (pattern.type === 'custom') {
    throwIfInvalidObject(pattern, ['type', 'creator'], false, 'pattern');
    /* tslint:disable:strict-type-predicates */
    if (typeof pattern.creator !== 'function') {
      throw new Error('Invalid pattern creator. Creator must be a function.');
    }
  }

  return pattern;
}

export function validateStrokeWidth(width: number): number {
  throwIfNotAPositiveNumber(width);
  return width;
}

export function validateDivisions(divisions: number): number {
  throwIfNotAPositiveInteger(divisions);
  return divisions;
}

export function validateSeparatorSize(size: number): number {
  if (!Number.isFinite(size) || size < 0 || size > 1) {
    throw new Error(`Invalid separator size: ${size}. Number must be between 0 and 1.`);
  }
  return size;
}

export function validateBoolean(value: boolean): boolean {
  /* tslint:disable:strict-type-predicates */
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid boolean value: ${value}.`);
  }
  return value;
}

function throwIfInvalidColor(color: string) {
  if (!colord(color).isValid()) {
    throw new Error(`Invalid color: ${color}. Color must be a valid CSS color.`);
  }
}

function throwIfInvalidObject(obj: any, keys: string[], hasOptionalKeys: boolean, objName: string) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error(`Invalid ${objName} object.`);
  }

  const objKeys = Object.keys(obj);

  const isValidLength = hasOptionalKeys
    ? objKeys.length >= keys.length
    : objKeys.length === keys.length;

  if (!isValidLength) {
    throw new Error(`Invalid ${objName} object.`);
  }

  if (!keys.every((k) => Object.prototype.hasOwnProperty.call(obj, k))) {
    throw new Error(`Invalid ${objName} object.`);
  }
}

function throwIfNotAString(value: any) {
  if (typeof value !== 'string') {
    throw new Error(`Invalid string value: ${value}. Value must be a string.`);
  }
}

function throwIfNotAPositiveNumber(value: any) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid number: ${value}. Number must be positive.`);
  }
}

function throwIfNotAPositiveInteger(value: any) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid number: ${value}. Number must be a positive integer.`);
  }
}
