'use client';

import { useState, useEffect, useRef } from 'react';

interface HeroVideo {
  id: string;
  label: string;
  desktop: string;
  mobile: string;
  active: boolean;
}

interface HeroVideoConfig {
  videos: HeroVideo[];
  posterDesktop: string;
  posterMobile: string;
  updatedAt: string;
  updatedBy: string;
}

export default function HeroVideoAdmin() {
  const [config, setConfig] = useState<HeroVideoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/hero-videos')
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/hero-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        setMessage('Configuración guardada exitosamente. Los cambios se reflejarán después del próximo deploy.');
      } else {
        setMessage('Error al guardar la configuración');
      }
    } catch {
      setMessage('Error de conexión');
    }
    setSaving(false);
  };

  const updateVideo = (idx: number, field: keyof HeroVideo, value: string | boolean) => {
    if (!config) return;
    const updated = { ...config };
    updated.videos = [...updated.videos];
    updated.videos[idx] = { ...updated.videos[idx], [field]: value };
    setConfig(updated);
  };

  const addVideo = () => {
    if (!config) return;
    const newId = String(Date.now());
    setConfig({
      ...config,
      videos: [
        ...config.videos,
        {
          id: newId,
          label: 'Nuevo video',
          desktop: '/videos/hero-desktop-1.mp4',
          mobile: '/videos/hero-mobile-1.mp4',
          active: false,
        },
      ],
    });
  };

  const removeVideo = (idx: number) => {
    if (!config) return;
    const updated = { ...config };
    updated.videos = updated.videos.filter((_, i) => i !== idx);
    setConfig(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Video del Hero</h1>
          <p className="text-gray-400 text-sm">
            Configura los videos de fondo de la página principal. Se muestran en bucle con transición suave.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          {message}
        </div>
      )}

      {/* Info card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300/80">
            <p className="font-medium text-blue-300 mb-1">¿Cómo funciona?</p>
            <ul className="space-y-1 text-blue-300/70">
              <li>• Cada video tiene versión <strong>desktop</strong> (horizontal) y <strong>mobile</strong> (vertical)</li>
              <li>• Los videos activos se reproducen en secuencia con transición suave</li>
              <li>• Duración recomendada: <strong>5 segundos</strong> cada uno, sin audio</li>
              <li>• Formato: MP4, tamaño ideal menor a 500KB por clip</li>
              <li>• Sube los videos a la carpeta <code className="bg-blue-500/20 px-1.5 py-0.5 rounded text-xs">/public/videos/</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Poster images */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Imágenes poster (se muestran mientras carga el video)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Poster Desktop</label>
            <input
              type="text"
              value={config?.posterDesktop || ''}
              onChange={(e) => config && setConfig({ ...config, posterDesktop: e.target.value })}
              placeholder="/videos/hero-poster-desktop.jpg"
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Poster Mobile</label>
            <input
              type="text"
              value={config?.posterMobile || ''}
              onChange={(e) => config && setConfig({ ...config, posterMobile: e.target.value })}
              placeholder="/videos/hero-poster-mobile.jpg"
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Video list */}
      <div className="space-y-4 mb-6">
        {config?.videos.map((video, idx) => (
          <div
            key={video.id}
            className={`bg-[#141414] border rounded-xl p-5 transition-colors ${video.active ? 'border-green-500/30' : 'border-white/[0.06]'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm font-mono">#{idx + 1}</span>
                <input
                  type="text"
                  value={video.label}
                  onChange={(e) => updateVideo(idx, 'label', e.target.value)}
                  className="bg-transparent border-none text-white font-medium text-base focus:outline-none focus:ring-0"
                  placeholder="Nombre del video"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Toggle active */}
                <button
                  onClick={() => updateVideo(idx, 'active', !video.active)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    video.active
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/10 text-gray-500 border border-white/[0.06]'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${video.active ? 'bg-green-400' : 'bg-gray-600'}`} />
                  {video.active ? 'Activo' : 'Inactivo'}
                </button>
                {/* Remove */}
                <button
                  onClick={() => removeVideo(idx)}
                  className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  title="Eliminar video"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Desktop */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Desktop (horizontal)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={video.desktop}
                    onChange={(e) => updateVideo(idx, 'desktop', e.target.value)}
                    placeholder="/videos/hero-desktop-1.mp4"
                    className="flex-1 bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => setPreviewVideo(video.desktop)}
                    className="px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Mobile (vertical)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={video.mobile}
                    onChange={(e) => updateVideo(idx, 'mobile', e.target.value)}
                    placeholder="/videos/hero-mobile-1.mp4"
                    className="flex-1 bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => setPreviewVideo(video.mobile)}
                    className="px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add video button */}
      <button
        onClick={addVideo}
        className="w-full py-3 border-2 border-dashed border-white/[0.08] hover:border-blue-500/40 rounded-xl text-gray-500 hover:text-blue-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Agregar video
      </button>

      {/* Preview modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative bg-[#141414] rounded-2xl overflow-hidden max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <span className="text-white text-sm font-medium">Vista previa</span>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                ref={previewRef}
                src={previewVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3 text-center">
              <code className="text-xs text-gray-500">{previewVideo}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
