import { darken, lighten, parseToRgba } from 'color2k';
import { ColorScheme } from './options';
import { RgbaColor, RgbaColorScheme } from './render/types';

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

function stringToRgbaColor(color: string): RgbaColor {
  const [r, g, b, a] = parseToRgba(color);
  return { r, g, b, a };
}
