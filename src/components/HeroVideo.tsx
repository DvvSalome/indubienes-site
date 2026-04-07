'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface HeroVideoData {
  id: string;
  label: string;
  desktop: string;
  mobile: string;
  active: boolean;
}

interface HeroVideoConfig {
  videos: HeroVideoData[];
  posterDesktop: string;
  posterMobile: string;
}

/**
 * HeroVideo — loops through multiple videos with crossfade.
 * Shows landscape on desktop, portrait on mobile.
 * Config is fetched from /api/hero-videos (editable in admin).
 */
export default function HeroVideo() {
  const [config, setConfig] = useState<HeroVideoConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [fadeClass, setFadeClass] = useState('opacity-100');
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch config
  useEffect(() => {
    fetch('/api/hero-videos')
      .then((r) => r.json())
      .then((data: HeroVideoConfig) => {
        const activeVideos = data.videos?.filter((v) => v.active) || [];
        if (activeVideos.length > 0) {
          setConfig({ ...data, videos: activeVideos });
        }
      })
      .catch(() => {})
      .finally(() => setConfigLoaded(true));
  }, []);

  const activeVideos = config?.videos || [];
  const poster = isMobile ? config?.posterMobile : config?.posterDesktop;

  // Get video URL for current device
  const getVideoUrl = useCallback(
    (idx: number) => {
      if (!activeVideos.length) return '';
      const v = activeVideos[idx % activeVideos.length];
      return isMobile ? v.mobile : v.desktop;
    },
    [activeVideos, isMobile]
  );

  // Crossfade to next video when current ends
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideos.length) return;

    const handleEnded = () => {
      if (activeVideos.length <= 1) {
        // Single video — just loop
        video.currentTime = 0;
        video.play().catch(() => {});
        return;
      }

      // Crossfade
      const nextIdx = (currentIdx + 1) % activeVideos.length;

      // Preload next video
      if (nextVideoRef.current) {
        nextVideoRef.current.src = getVideoUrl(nextIdx);
        nextVideoRef.current.load();
        nextVideoRef.current.play().catch(() => {});
      }

      // Fade out current
      setFadeClass('opacity-0');

      setTimeout(() => {
        setCurrentIdx(nextIdx);
        setFadeClass('opacity-100');
      }, 800);
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [currentIdx, activeVideos, getVideoUrl]);

  // Auto-play when source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideos.length) return;

    const src = getVideoUrl(currentIdx);
    if (video.src !== window.location.origin + src && src) {
      video.src = src;
      video.load();
      video.play().catch(() => {});
    }
  }, [currentIdx, activeVideos, getVideoUrl]);

  if (!activeVideos.length) {
    if (!configLoaded) {
      // Still loading config — show blank dark bg to avoid flash of fallback image
      return <div className="absolute inset-0 bg-[#1a1a1a]" />;
    }
    // Config loaded but no videos — fallback to static background
    return (
      <div
        className="hero-bg-image absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop')`,
          transform: 'scale(1.15)',
        }}
      />
    );
  }

  return (
    <>
      {/* Main video */}
      <video
        ref={videoRef}
        muted
        playsInline
        poster={poster || undefined}
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in-out ${fadeClass}`}
        style={{ transform: 'scale(1.05)' }}
      />

      {/* Hidden next-video for preloading crossfade */}
      {activeVideos.length > 1 && (
        <video
          ref={nextVideoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
          style={{ transform: 'scale(1.05)' }}
        />
      )}
    </>
  );
}
