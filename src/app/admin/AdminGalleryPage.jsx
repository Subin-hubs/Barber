import React, { useState } from 'react';
import { UploadCloud, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export const AdminGalleryPage = () => {
  const [images, setImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800', barber: 'John Doe', alt: 'Clean fade', public: true },
    { id: 2, url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800', barber: 'Mike Smith', alt: 'Classic cut', public: true },
    { id: 3, url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800', barber: 'David Lee', alt: 'Beard trim', public: false },
  ]);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Gallery</h1>
        <p className="text-text-secondary">Manage portfolio images displayed on the website.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 mb-10 text-center relative group cursor-pointer hover:border-gold hover:bg-gold-light/10 transition-colors border-dashed border-2">
        <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-light transition-colors">
          <UploadCloud className="w-8 h-8 text-navy group-hover:text-gold transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-navy mb-1">Upload New Image</h3>
        <p className="text-text-secondary text-sm">Drag and drop or click to browse. Max 5MB.</p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {images.map(img => (
          <div key={img.id} className="break-inside-avoid relative group rounded-xl overflow-hidden bg-muted border border-border">
            <img src={img.url} alt={img.alt} className="w-full h-auto object-cover" />
            
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-navy">
              {img.barber}
            </div>
            
            <div className="absolute top-3 right-3 flex gap-1">
              <button className="bg-white/90 backdrop-blur-sm p-1.5 rounded hover:text-navy transition-colors text-text-secondary shadow-sm">
                {img.public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end">
              <span className="text-white text-sm font-medium truncate pr-2">{img.alt}</span>
              <div className="flex gap-2 shrink-0">
                <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="bg-error/80 hover:bg-error text-white p-2 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
