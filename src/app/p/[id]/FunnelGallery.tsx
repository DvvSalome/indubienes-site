'use client';

import { useState } from 'react';
import { Property } from '@/lib/types';

interface FunnelGalleryProps {
  property: Property;
}

export default function FunnelGallery({ property }: FunnelGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Collect all images from property
  const allImages: Array<{ url: string; url_big: string }> = [];

  // Add main image
  if (property.main_image) {
    allImages.push(property.main_image);
  }

  // Add gallery images
  property.galleries.forEach(gallery => {
    if (gallery.images) {
      gallery.images.forEach(img => {
        allImages.push(img);
      });
    }
  });

  if (allImages.length === 0) {
    return (
      <div className="bg-card rounded-lg h-96 flex items-center justify-center">
        <p className="text-faint">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <>
      {/* Horizontal Scroll Gallery */}
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 min-w-min">
          {allImages.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className="relative flex-shrink-0 w-80 h-96 rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={image.url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 z-10 bg-[#4A8BC2] hover:bg-[#3B6FA0] text-white rounded-full p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <div
            className="max-w-4xl max-h-[90vh] relative flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={allImages[selectedImageIndex].url_big || allImages[selectedImageIndex].url}
              alt={`Imagen ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex === 0 ? allImages.length - 1 : selectedImageIndex - 1);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#4A8BC2] hover:bg-[#3B6FA0] text-white rounded-full p-3 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex === allImages.length - 1 ? 0 : selectedImageIndex + 1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#4A8BC2] hover:bg-[#3B6FA0] text-white rounded-full p-3 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add custom scrollbar styling */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
