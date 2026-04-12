/**
 * Shared media utilities for Indubienes.
 * Compression presets + upload helpers used by both property and blog flows.
 * See ADR-0002: shared/docs/adr/0002-unified-media-upload.md
 */

export type MediaTarget = 'property' | 'blog';

interface CompressionPreset {
  maxDim: number;
  quality: number;
  maxSizeMB: number;
}

export const PRESETS: Record<MediaTarget, CompressionPreset> = {
  property: { maxDim: 1600, quality: 0.82, maxSizeMB: 5 },
  blog:     { maxDim: 2400, quality: 0.90, maxSizeMB: 8 },
};

export interface CompressedImage {
  blob: Blob;
  preview: string; // tiny dataURL for local preview
  width: number;
  height: number;
}

/**
 * Client-side image compression using canvas.
 * Resizes to maxDim, converts to JPEG at the given quality.
 */
export function compressImage(
  file: File,
  target: MediaTarget = 'property'
): Promise<CompressedImage> {
  const { maxDim, quality, maxSizeMB } = PRESETS[target];

  if (file.size > maxSizeMB * 1024 * 1024) {
    return Promise.reject(
      new Error(`El archivo excede ${maxSizeMB} MB. Selecciona una imagen más liviana.`)
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error comprimiendo la imagen'));
              return;
            }
            // Tiny preview for UI (200px wide)
            const previewCanvas = document.createElement('canvas');
            const pw = 200;
            const ph = Math.round((height * pw) / width);
            previewCanvas.width = pw;
            previewCanvas.height = ph;
            const pctx = previewCanvas.getContext('2d');
            pctx?.drawImage(img, 0, 0, pw, ph);
            const preview = previewCanvas.toDataURL('image/jpeg', 0.5);

            resolve({ blob, preview, width, height });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Accepted image MIME types.
 */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate file is an acceptable image.
 */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Solo se aceptan imágenes JPG, PNG o WebP.';
  }
  return null;
}

/**
 * Upload media to the unified endpoint.
 */
export async function uploadMedia(
  blob: Blob,
  filename: string,
  target: MediaTarget,
  entityId?: number | string,
  options?: { description?: string; position?: number }
): Promise<{ status: string; url?: string; id_image?: number; error?: string }> {
  const formData = new FormData();
  formData.append('image', blob, filename);
  formData.append('target', target);
  if (entityId) formData.append('entityId', String(entityId));
  if (options?.description) formData.append('description', options.description);
  if (options?.position != null) formData.append('position', String(options.position));

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  return res.json();
}
