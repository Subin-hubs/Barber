import React, { useState, useEffect } from 'react';
import { UploadCloud, Trash2, Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getAllGallery, addGalleryImage, deleteGalleryImage, updateGalleryImage } from '../../firebase/galleryService';
import { getActiveBarbers } from '../../firebase/barberService';

export const AdminGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ imageUrl: '', caption: '', barberName: '' });
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const [imgs, barberList] = await Promise.all([getAllGallery(), getActiveBarbers()]);
      setImages(imgs);
      setBarbers(barberList);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError('Failed to load gallery.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!addForm.imageUrl.trim()) { setAddError('Image URL is required.'); return; }
    setSaving(true);
    setAddError('');
    try {
      await addGalleryImage({
        imageUrl: addForm.imageUrl.trim(),
        caption: addForm.caption.trim(),
        barberName: addForm.barberName.trim(),
        order: images.length,
        public: true,
      });
      await loadData();
      setIsAddModalOpen(false);
      setAddForm({ imageUrl: '', caption: '', barberName: '' });
    } catch (err) {
      console.error('Error adding image:', err);
      setAddError('Failed to add image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (img) => {
    if (!window.confirm('Delete this image permanently?')) return;
    setDeletingId(img.id);
    try {
      await deleteGalleryImage(img.id);
      setImages(prev => prev.filter(i => i.id !== img.id));
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Failed to delete image.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublic = async (img) => {
    setTogglingId(img.id);
    try {
      await updateGalleryImage(img.id, { public: !img.public });
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, public: !i.public } : i));
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert('Failed to update visibility.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Gallery</h1>
          <p className="text-text-secondary">Manage portfolio images displayed on the website.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UploadCloud className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Upload Zone */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-border p-8 mb-10 text-center relative group cursor-pointer hover:border-gold hover:bg-gold-light/10 transition-colors border-dashed border-2"
        onClick={() => setIsAddModalOpen(true)}
      >
        <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-light transition-colors">
          <UploadCloud className="w-8 h-8 text-navy group-hover:text-gold transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-navy mb-1">Add New Image</h3>
        <p className="text-text-secondary text-sm">Click to add a portfolio image via URL.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-error mb-4" />
          <p className="text-error">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={loadData}>Try Again</Button>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <p className="text-lg font-medium">No images yet.</p>
          <p className="text-sm mt-1">Click "Add Image" to upload your first portfolio photo.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {images.map(img => (
            <div key={img.id} className="break-inside-avoid relative group rounded-xl overflow-hidden bg-muted border border-border">
              <img
                src={img.imageUrl}
                alt={img.caption || 'Gallery Image'}
                className="w-full h-auto object-cover"
                onError={e => { e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found'; }}
              />

              <div className="absolute top-3 left-3">
                {img.barberName && (
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-navy">
                    {img.barberName}
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={() => handleTogglePublic(img)}
                  disabled={togglingId === img.id}
                  className={`bg-white/90 backdrop-blur-sm p-1.5 rounded hover:text-navy transition-colors shadow-sm ${img.public ? 'text-success' : 'text-text-muted'}`}
                  title={img.public ? 'Public – click to hide' : 'Hidden – click to show'}
                >
                  {togglingId === img.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : img.public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end">
                <span className="text-white text-sm font-medium truncate pr-2">{img.caption || 'No caption'}</span>
                <button
                  onClick={() => handleDelete(img)}
                  disabled={deletingId === img.id}
                  className="bg-error/80 hover:bg-error text-white p-2 rounded transition-colors disabled:opacity-50 shrink-0"
                >
                  {deletingId === img.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">Add Portfolio Image</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-muted rounded-lg text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddImage} className="p-6 space-y-4">
              {addError && (
                <div className="bg-error/10 text-error text-sm font-medium p-3 rounded-lg border border-error/20">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                  value={addForm.imageUrl}
                  onChange={e => setAddForm({ ...addForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Caption</label>
                <input
                  type="text"
                  className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                  value={addForm.caption}
                  onChange={e => setAddForm({ ...addForm, caption: e.target.value })}
                  placeholder="e.g. Clean fade by John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Barber</label>
                <select
                  className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
                  value={addForm.barberName}
                  onChange={e => setAddForm({ ...addForm, barberName: e.target.value })}
                >
                  <option value="">— Select Barber —</option>
                  {barbers.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" isLoading={saving}>Add Image</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
