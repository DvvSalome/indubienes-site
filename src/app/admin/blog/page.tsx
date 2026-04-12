'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { compressImage, validateImageFile, type MediaTarget } from '@/lib/media';

interface BlogImage {
  name: string;
  url: string;
  size: number;
  sha: string;
}

export default function AdminBlogPage() {
  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/media/upload?target=blog');
      const data = await res.json();
      setImages(data.images || []);
    } catch {
      console.error('Error fetching blog images');
    }
  }, []);

  useEffect(() => {
    fetchImages().finally(() => setLoading(false));
  }, [fetchImages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setProgress('Comprimiendo imagen...');

    try {
      const result = await compressImage(file, 'blog' as MediaTarget);
      setCompressedBlob(result.blob);
      setPreview(result.preview);
      setProgress(`Comprimida: ${result.width}×${result.height}px — ${(result.blob.size / 1024).toFixed(0)} KB`);

      // Suggest a name based on the original filename
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      if (!customName) setCustomName(`blog-${baseName}.jpg`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error comprimiendo imagen');
      setProgress('');
    }
  };

  const handleUpload = async () => {
    if (!compressedBlob || !customName.trim()) {
      setError('Selecciona una imagen y define un nombre');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setProgress('Subiendo a GitHub...');

    try {
      const formData = new FormData();
      formData.append('image', compressedBlob, customName);
      formData.append('target', 'blog');
      formData.append('filename', customName.trim());

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setSuccess(`Imagen subida: ${data.url} (commit ${data.commit})`);
        setPreview(null);
        setCompressedBlob(null);
        setCustomName('');
        setProgress('');
        fetchImages(); // Refresh list
      } else {
        setError(data.error || 'Error subiendo imagen');
      }
    } catch {
      setError('Error de conexión al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setCompressedBlob(null);
    setCustomName('');
    setProgress('');
    setError('');
    setSuccess('');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog — Media</h1>
          <p className="text-sm text-[#888] mt-1">
            Sube y administra imágenes para los artículos del blog
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#555]">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          {images.length} imagen{images.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* Upload Section */}
      <section className="bg-[#111] border border-[#222] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#4A8BC2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Subir imagen
        </h2>

        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#333] rounded-xl cursor-pointer hover:border-[#4A8BC2] hover:bg-[#4A8BC2]/5 transition-all">
            <svg className="w-10 h-10 text-[#555] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm text-[#888]">Haz clic o arrastra una imagen</span>
            <span className="text-xs text-[#555] mt-1">JPG, PNG o WebP · Máx 8 MB · Se comprime a 2400px</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative w-full h-56 rounded-lg overflow-hidden bg-[#0a0a0a]">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Filename */}
            <div>
              <label className="block text-xs text-[#888] mb-1">Nombre del archivo</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value.replace(/[^a-zA-Z0-9._-]/g, '-'))}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white text-sm focus:border-[#4A8BC2] focus:outline-none"
                placeholder="blog-mi-imagen.jpg"
              />
            </div>

            {progress && (
              <p className="text-xs text-[#4A8BC2]">{progress}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2.5 bg-[#4A8BC2] text-white text-sm font-medium rounded-lg hover:bg-[#3a7bb2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Subir imagen
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={uploading}
                className="px-4 py-2.5 border border-[#333] text-[#888] text-sm rounded-lg hover:text-white hover:border-[#555] disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}
      </section>

      {/* Existing Images Gallery */}
      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#4A8BC2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Imágenes del blog
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-6 h-6 text-[#4A8BC2]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-[#555]">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No hay imágenes aún</p>
            <p className="text-xs mt-1">Sube la primera imagen arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.sha}
                className="group relative bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#222] hover:border-[#4A8BC2]/50 transition-colors"
              >
                <div className="relative aspect-video">
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-white truncate font-mono">{img.name}</p>
                  <p className="text-[10px] text-[#555] mt-0.5">{formatSize(img.size)}</p>
                </div>
                {/* Copy path button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(img.url);
                    setSuccess(`Ruta copiada: ${img.url}`);
                    setTimeout(() => setSuccess(''), 2000);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/70 text-white p-1.5 rounded-md text-xs transition-opacity"
                  title="Copiar ruta"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tip */}
      <div className="mt-6 px-4 py-3 bg-[#111] border border-[#222] rounded-lg text-xs text-[#666]">
        <strong className="text-[#888]">Tip:</strong> Las imágenes del hero del blog deben ser horizontales (16:9) y mínimo 1920px de ancho para verse nítidas. El sistema comprime automáticamente a 2400px y calidad 90%.
      </div>
    </div>
  );
}
