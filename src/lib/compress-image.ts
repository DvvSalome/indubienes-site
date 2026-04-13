/**
 * Client-side image compression utility.
 * Uses Canvas API to resize and compress images before upload.
 * 
 * Usage in admin panel:
 *   const compressed = await compressImage(file, { maxWidth: 1600, quality: 0.82 });
 *   formData.append('image', compressed.blob, compressed.filename);
 */

interface CompressOptions {
  /** Max width in px (default: 1600) */
  maxWidth?: number;
  /** Max height in px (default: proportional) */
  maxHeight?: number;
  /** JPEG quality 0-1 (default: 0.82) */
  quality?: number;
  /** Output MIME type (default: image/jpeg) */
  type?: string;
}

interface CompressResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxWidth = 1600,
    maxHeight,
    quality = 0.82,
    type = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      if (maxHeight && height > maxHeight) {
        width = Math.round(width * (maxHeight / height));
        height = maxHeight;
      }

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }

          // Generate filename with .jpg extension
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const filename = `${baseName}.jpg`;

          resolve({
            blob,
            filename,
            width,
            height,
            originalSize: file.size,
            compressedSize: blob.size,
            savedPercent: Math.round(100 - (blob.size * 100) / file.size),
          });
        },
        type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
