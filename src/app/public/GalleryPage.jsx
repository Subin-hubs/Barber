import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, Loader2 } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { cn } from '../../utils/cn';
import { getPublicGallery } from '../../firebase/galleryService';

export const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);
  const galleryReveal = useScrollReveal();

  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadGallery() {
      try {
        const data = await getPublicGallery();
        setImages(data);
        const uniqueBarbers = [...new Set(data.map(img => img.barberName).filter(Boolean))];
        setFilters(['All', ...uniqueBarbers]);
      } catch (err) {
        console.error("Error loading gallery", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const filteredImages = activeFilter === 'All' 
    ? images 
    : images.filter(img => img.barberName === activeFilter);

  return (
    <div className="pt-20 pb-20 min-h-screen">
      {/* Hero */}
      <div className="bg-navy py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center text-white/70 text-sm mb-4">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-white">Gallery</span>
          </div>
          <h1 className="text-white">Our Work</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12">
        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-colors border",
                activeFilter === filter 
                  ? "bg-navy border-navy text-white" 
                  : "bg-white border-border text-text-secondary hover:border-navy hover:text-navy"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">Could not load gallery</div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            <p className="text-lg">No images found.</p>
          </div>
        ) : (
          <div ref={galleryReveal} className="scroll-reveal columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredImages.map((img, index) => (
              <div 
                key={img.id} 
                className="scroll-reveal-child break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl bg-muted"
                style={{ transitionDelay: `${index * 50}ms` }}
                onClick={() => setLightboxImage(img.imageUrl)}
              >
                <img 
                  src={img.imageUrl} 
                  alt={img.caption || 'Gallery Image'} 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-650"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {img.barberName && <span className="text-gold font-medium text-sm mb-1">{img.barberName}</span>}
                  {img.caption && <span className="text-white font-semibold">{img.caption}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </div>
  );
};
