// mock OffscreenCanvas for Jest tests
class MockOffscreenCanvas {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext(contextType: string): OffscreenCanvasRenderingContext2D | null {
    if (contextType === '2d') {
      // Return a mock 2D context with essential methods
      return {
        canvas: this,
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        arc: jest.fn(),
        rect: jest.fn(),
        transform: jest.fn(),
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn(),
        })),
        createPattern: jest.fn(() => ({ setTransform: jest.fn() })),
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        // Add more properties/methods as needed for your tests
      } as any;
    }
    return null;
  }

  // Add other OffscreenCanvas methods if needed
  transferToImageBitmap(): ImageBitmap {
    throw new Error('transferToImageBitmap not implemented in mock');
  }
}

global.OffscreenCanvas = MockOffscreenCanvas as any;
