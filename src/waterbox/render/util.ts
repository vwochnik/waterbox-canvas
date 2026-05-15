export function createOffscreenRenderingContext(width: number, height: number):  OffscreenCanvasRenderingContext2D {
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const context = offscreenCanvas.getContext('2d');
  if (!context) {
    throw new Error("can't get context");
  }
  return context;
}
