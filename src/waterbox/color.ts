import { darken, lighten, parseToRgba } from 'color2k';
import { ColorScheme } from './options';

export type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type RgbaColorScheme = {
  innerStroke: RgbaColor;
  outerStroke: RgbaColor;
  fill: RgbaColor;
  lighter: RgbaColor;
  darker: RgbaColor;
};

export function getRgbaColorScheme(colorScheme: ColorScheme): RgbaColorScheme {
  const { fill } = colorScheme;
  const lighter =
    'contrast' in colorScheme ? lighten(fill, colorScheme.contrast) : colorScheme.lighter;
  const darker =
    'contrast' in colorScheme ? darken(fill, colorScheme.contrast) : colorScheme.darker;

  const innerStroke = 'innerStroke' in colorScheme ? colorScheme.innerStroke : colorScheme.stroke;
  const outerStroke = 'outerStroke' in colorScheme ? colorScheme.outerStroke : colorScheme.stroke;

  return {
    innerStroke: stringToRgbaColor(innerStroke),
    outerStroke: stringToRgbaColor(outerStroke),
    fill: stringToRgbaColor(fill),
    lighter: stringToRgbaColor(lighter),
    darker: stringToRgbaColor(darker),
  };
}

export function rgbaColorToString(color: RgbaColor): string {
  const { r, g, b, a } = color;
  return `rgba(${r},${g},${b},${a})`;
}

function stringToRgbaColor(color: string): RgbaColor {
  const [r, g, b, a] = parseToRgba(color);
  return { r, g, b, a };
}
