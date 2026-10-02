import { HeatmapStyle, ImageAlignment } from '../types';

export interface DiffResult {
  dataUrl: string;
  diffPercentage: number; // 0 to 100%
  meanDelta: number; // 0 to 100%
  width: number;
  height: number;
}

// Turbo / Jet color map helper for heatmaps
function getHeatmapColor(value: number, alpha: number = 255): [number, number, number, number] {
  // value is 0.0 to 1.0
  const v = Math.max(0, Math.min(1, value));
  let r = 0;
  let g = 0;
  let b = 0;

  if (v < 0.25) {
    // Deep Blue to Cyan
    const t = v / 0.25;
    r = Math.round(15 * (1 - t) + 0 * t);
    g = Math.round(23 * (1 - t) + 200 * t);
    b = Math.round(120 * (1 - t) + 255 * t);
  } else if (v < 0.5) {
    // Cyan to Green
    const t = (v - 0.25) / 0.25;
    r = Math.round(0 * (1 - t) + 34 * t);
    g = Math.round(200 * (1 - t) + 197 * t);
    b = Math.round(255 * (1 - t) + 94 * t);
  } else if (v < 0.75) {
    // Green to Yellow / Orange
    const t = (v - 0.5) / 0.25;
    r = Math.round(34 * (1 - t) + 245 * t);
    g = Math.round(197 * (1 - t) + 158 * t);
    b = Math.round(94 * (1 - t) + 11 * t);
  } else {
    // Orange to Bright Red / Hot Magenta
    const t = (v - 0.75) / 0.25;
    r = Math.round(245 * (1 - t) + 239 * t);
    g = Math.round(158 * (1 - t) + 35 * t);
    b = Math.round(11 * (1 - t) + 60 * t);
  }

  return [r, g, b, alpha];
}

// Load image into an HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

// Convert any image source (including SVG data URLs) to clean raster PNG base64
export async function ensureRasterBase64(src: string): Promise<string> {
  // If it's already a standard raster base64 (png, jpeg, webp) and NOT an svg
  if (
    (src.startsWith('data:image/png;base64,') ||
      src.startsWith('data:image/jpeg;base64,') ||
      src.startsWith('data:image/webp;base64,')) &&
    !src.includes('svg')
  ) {
    return src;
  }

  try {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 800;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to rasterize image on canvas:', err);
    return src;
  }
}

export async function generatePixelDiff(
  realSrc: string,
  renderSrc: string,
  style: HeatmapStyle = 'turbo_heatmap',
  threshold: number = 18, // 0 to 255
  alignment: ImageAlignment = { scale: 1, offsetX: 0, offsetY: 0, rotation: 0 }
): Promise<DiffResult> {
  const [realImg, renderImg] = await Promise.all([loadImage(realSrc), loadImage(renderSrc)]);

  const width = Math.min(1000, Math.max(realImg.naturalWidth || 800, renderImg.naturalWidth || 800));
  const height = Math.min(1000, Math.max(realImg.naturalHeight || 800, renderImg.naturalHeight || 800));

  // Canvas for Real
  const realCanvas = document.createElement('canvas');
  realCanvas.width = width;
  realCanvas.height = height;
  const realCtx = realCanvas.getContext('2d');
  if (!realCtx) throw new Error('Could not get 2D context for real canvas');
  realCtx.drawImage(realImg, 0, 0, width, height);
  const realData = realCtx.getImageData(0, 0, width, height);

  // Canvas for Render (with alignment transform)
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = width;
  renderCanvas.height = height;
  const renderCtx = renderCanvas.getContext('2d');
  if (!renderCtx) throw new Error('Could not get 2D context for render canvas');

  renderCtx.save();
  renderCtx.translate(width / 2 + alignment.offsetX, height / 2 + alignment.offsetY);
  if (alignment.rotation !== 0) {
    renderCtx.rotate((alignment.rotation * Math.PI) / 180);
  }
  renderCtx.scale(alignment.scale, alignment.scale);
  renderCtx.drawImage(renderImg, -width / 2, -height / 2, width, height);
  renderCtx.restore();

  const renderData = renderCtx.getImageData(0, 0, width, height);

  // Diff output canvas
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');
  if (!diffCtx) throw new Error('Could not get 2D context for diff canvas');
  const diffImageData = diffCtx.createImageData(width, height);

  const totalPixels = width * height;
  let differingPixels = 0;
  let totalDeltaSum = 0;

  const r1 = realData.data;
  const r2 = renderData.data;
  const out = diffImageData.data;

  for (let i = 0; i < r1.length; i += 4) {
    const redDiff = Math.abs(r1[i] - r2[i]);
    const greenDiff = Math.abs(r1[i + 1] - r2[i + 1]);
    const blueDiff = Math.abs(r1[i + 2] - r2[i + 2]);

    // Average RGB delta for pixel
    const delta = (redDiff + greenDiff + blueDiff) / 3;
    totalDeltaSum += delta;

    const isExceeding = delta >= threshold;
    if (isExceeding) {
      differingPixels++;
    }

    const normalizedDelta = Math.min(1, delta / 180);

    if (style === 'turbo_heatmap') {
      if (delta < threshold * 0.4) {
        // Transparent or very dim subtle dark
        out[i] = 10;
        out[i + 1] = 15;
        out[i + 2] = 26;
        out[i + 3] = 160;
      } else {
        const [hr, hg, hb] = getHeatmapColor(normalizedDelta);
        out[i] = hr;
        out[i + 1] = hg;
        out[i + 2] = hb;
        out[i + 3] = 240;
      }
    } else if (style === 'neon_mask') {
      // Background shows real image in darkened monochrome, discrepancies in vivid electric magenta/cyan
      const gray = Math.round(0.299 * r1[i] + 0.587 * r1[i + 1] + 0.114 * r1[i + 2]) * 0.35;
      if (isExceeding) {
        // High visibility electric magenta / yellow
        out[i] = Math.min(255, 230 + Math.round(delta));
        out[i + 1] = Math.round(40 * (1 - normalizedDelta));
        out[i + 2] = Math.round(150 + 100 * normalizedDelta);
        out[i + 3] = 255;
      } else {
        out[i] = gray;
        out[i + 1] = gray;
        out[i + 2] = gray;
        out[i + 3] = 255;
      }
    } else if (style === 'amplified_diff') {
      // Delta amplified 3.5x on pure dark slate
      const amp = Math.min(255, Math.round(delta * 3.5));
      out[i] = amp;
      out[i + 1] = Math.round(amp * 0.4);
      out[i + 2] = Math.round(amp * 0.2);
      out[i + 3] = 255;
    } else {
      // Grayscale difference
      out[i] = Math.round(delta);
      out[i + 1] = Math.round(delta);
      out[i + 2] = Math.round(delta);
      out[i + 3] = 255;
    }
  }

  diffCtx.putImageData(diffImageData, 0, 0);

  const diffPercentage = (differingPixels / totalPixels) * 100;
  const meanDelta = (totalDeltaSum / (totalPixels * 255)) * 100;

  return {
    dataUrl: diffCanvas.toDataURL('image/png'),
    diffPercentage: Number(diffPercentage.toFixed(1)),
    meanDelta: Number(meanDelta.toFixed(1)),
    width,
    height,
  };
}
