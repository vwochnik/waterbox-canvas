import { darken, lighten, parseToRgba } from "color2k";
import { ColorScheme } from "./options";

export type RawColor = {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type RawColorScheme = {
  stroke: RawColor;
  fill: RawColor;
  lighter: RawColor;
  darker: RawColor;
};

export function getRawColorScheme(colorScheme: ColorScheme): RawColorScheme {
  const { fill, stroke } = colorScheme;
  const lighter = 'contrast' in colorScheme ? lighten(fill, colorScheme.contrast) : fill;
  const darker = 'contrast' in colorScheme ? darken(fill, colorScheme.contrast) : fill;

  return {
    stroke: stringToRawColor(stroke),
    fill: stringToRawColor(fill),
    lighter: stringToRawColor(lighter),
    darker: stringToRawColor(darker),
  };
}

export function rawColorToString(color: RawColor): string {
  const { r, g, b, a } = color;
  return `rgba(${r},${g},${b},${a})`;
}

function stringToRawColor(color: string): RawColor {
  const [ r, g, b, a ] = parseToRgba(color);
  return { r, g, b, a };
}
