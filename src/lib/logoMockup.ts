/**
 * Generate a mockup image by overlaying a logo on top of a product image.
 * Uses the HTML Canvas API — runs entirely client-side.
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateMockup(
  productImageUrl: string,
  logoFile: File
): Promise<string> {
  const [productImg, logoDataUrl] = await Promise.all([
    loadImage(productImageUrl),
    fileToDataUrl(logoFile),
  ]);
  const logoImg = await loadImage(logoDataUrl);

  // Canvas sized to product image (max 800px for performance)
  const maxDim = 800;
  const scale = Math.min(1, maxDim / Math.max(productImg.width, productImg.height));
  const w = Math.round(productImg.width * scale);
  const h = Math.round(productImg.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Draw product
  ctx.drawImage(productImg, 0, 0, w, h);

  // Overlay logo — centered, scaled to ~25% of the product width
  const logoMaxW = w * 0.25;
  const logoScale = Math.min(logoMaxW / logoImg.width, logoMaxW / logoImg.height);
  const lw = Math.round(logoImg.width * logoScale);
  const lh = Math.round(logoImg.height * logoScale);
  const lx = Math.round((w - lw) / 2);
  const ly = Math.round((h - lh) / 2);

  ctx.globalAlpha = 0.9;
  ctx.drawImage(logoImg, lx, ly, lw, lh);
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}
