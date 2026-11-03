// Photos are 4:5 (width:height) portraits.
export const PHOTO_ASPECT = 4 / 5;
export const PHOTO_WIDTH = 600;
export const PHOTO_HEIGHT = 750;

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
// Uploads are shrunk to this before saving so the draft fits in localStorage.
const SOURCE_MAX_SIDE = 1600;
const JPEG_QUALITY = 0.88;

export type Area = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be decoded"));
    image.src = src;
  });
}

function toJpeg(canvas: HTMLCanvasElement) {
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function whiteCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  // JPEG has no transparency, so transparent PNG areas would turn black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  return { canvas, context };
}

// Decodes an upload (applying its EXIF orientation) into a smaller JPEG.
export async function prepareSource(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, SOURCE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const { canvas, context } = whiteCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return toJpeg(canvas);
}

// Cuts `area` out of the source rotated by `rotation` degrees, matching how
// react-easy-crop reports the crop area for a rotated image.
export async function cropPhoto(source: string, area: Area, rotation: number): Promise<string> {
  const image = await loadImage(source);
  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const rotatedWidth = image.width * cos + image.height * sin;
  const rotatedHeight = image.width * sin + image.height * cos;

  const rotated = whiteCanvas(Math.round(rotatedWidth), Math.round(rotatedHeight));
  rotated.context.translate(rotatedWidth / 2, rotatedHeight / 2);
  rotated.context.rotate(radians);
  rotated.context.drawImage(image, -image.width / 2, -image.height / 2);

  const output = whiteCanvas(PHOTO_WIDTH, PHOTO_HEIGHT);
  output.context.imageSmoothingQuality = "high";
  output.context.drawImage(rotated.canvas, area.x, area.y, area.width, area.height, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
  return toJpeg(output.canvas);
}
