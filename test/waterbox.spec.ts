import { colord } from 'colord';
import { createWaterbox, Waterbox } from '../src/waterbox';
import { defaultOptions, Pattern } from '../src/waterbox/options';

describe('Waterbox', () => {
  let canvas: OffscreenCanvas;
  let waterbox: Waterbox;

  beforeEach(() => {
    canvas = new OffscreenCanvas(0, 0);
    waterbox = createWaterbox(canvas);
  });

  it('canvas dimensions are automatically updated', () => {
    expect(canvas.width).toBe(defaultOptions.width);
    expect(canvas.height).toBe(defaultOptions.height);
    expect(waterbox.width(500).width()).toBe(500);
    expect(waterbox.height(1000).height()).toBe(1000);
    expect(canvas.width).toBe(500);
    expect(canvas.height).toBe(1000);
  });

  it('cannot set width to zero', () => {
    try {
      waterbox.width(0);
      throw new Error('should have thrown');
    } catch (e: unknown) {
      expect((e as Error).message).toEqual(
        'Invalid dimension: 0. Dimension must be a positive integer.',
      );
    }
  });

  it('can generate lighter/darker colors', () => {
    const fill = 'rgba(100, 150, 200, 0.1)';

    waterbox.backColor({ fill, stroke: '#000' });

    const { lighter, darker } = waterbox.backColor();

    if (!lighter || !darker) {
      throw new Error('lighter or darker color is undefined');
    }

    const fillBrightness = colord(fill).brightness();
    const lighterBrightness = colord(lighter).brightness();
    const darkerBrightness = colord(darker).brightness();

    expect(lighterBrightness).toBeGreaterThan(fillBrightness);
    expect(darkerBrightness).toBeLessThan(fillBrightness);
  });

  it('can set a predefined pattern', () => {
    const pattern: Pattern = { type: 'predefined', name: 'blocky', size: 10, alpha: 0.5 };
    waterbox.waterPattern(pattern);
    expect(waterbox.waterPattern()).toEqual(pattern);
  });

  it('can set a custom pattern', () => {
    const pattern: Pattern = {
      type: 'custom',
      creator: (ctx) => {
        return ctx.createPattern(new OffscreenCanvas(10, 10), 'repeat')!;
      },
    };
    waterbox.waterPattern(pattern);
    expect(waterbox.waterPattern()).toEqual(pattern);
  });

  it('can not set an invalid pattern', () => {
    const pattern: Pattern = { type: 'predefined', name: 'blocky', size: -1, alpha: 0.5 };
    try {
      waterbox.waterPattern(pattern);
      throw new Error('should have thrown');
    } catch (e: unknown) {
      expect((e as Error).message).toEqual('Invalid number: -1. Number must be positive.');
    }
  });

  it('can render', () => {
    waterbox.render();
  });
});
