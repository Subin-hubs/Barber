import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  getAllServices,
  createService,
  updateService,
  deleteService
} from '../../firebase/serviceService';

const EMPTY_FORM = { name: '', category: 'Haircut', duration: 30, price: 0, order: 0 };
const CATEGORIES = ['Haircut', 'Beard', 'Combo', 'Treatment', 'Other'];

export const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadServices = async () => {
    try {
      setError(null);
      const data = await getAllServices();
      setServices(data);
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      order: service.order || 0,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setFormError('Service name is required.'); return; }
    if (Number(formData.price) < 0) { setFormError('Price cannot be negative.'); return; }
    if (Number(formData.duration) <= 0) { setFormError('Duration must be positive.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        duration: Number(formData.duration),
        price: Number(formData.price),
        order: Number(formData.order),
      };
      if (editingService) {
        await updateService(editingService.id, payload);
      } else {
        await createService(payload);
      }
      await loadServices();
      closeModal();
    } catch (err) {
      console.error('Error saving service:', err);
      setFormError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service) => {
    setTogglingId(service.id);
    try {
      await updateService(service.id, { active: !service.active });
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, active: !s.active } : s));
    } catch (err) {
      console.error('Error toggling service:', err);
      alert('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Delete "${service.name}"? This action cannot be undone.`)) return;
    setDeletingId(service.id);
    try {
      await deleteService(service.id);
      setServices(prev => prev.filter(s => s.id !== service.id));
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Failed to delete service.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Services</h1>
          <p className="text-text-secondary">Manage the services offered by your barbershop.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <AlertCircle className="w-10 h-10 text-error mb-4" />
            <p className="text-error font-medium">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={loadServices}>Try Again</Button>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-gold-light flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">No Services Yet</h3>
            <p className="text-text-secondary mb-6">Add your first service to get started.</p>
            <Button onClick={openAddModal}>Add Your First Service</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 cursor-grab text-text-muted">
                      <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-navy">{service.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm px-2.5 py-1 bg-muted rounded-md text-text-secondary font-medium">
                        {service.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">{service.duration} min</td>
                    <td className="p-4 font-semibold text-gold">NPR {service.price.toLocaleString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(service)}
                        disabled={togglingId === service.id}
                        className="flex items-center gap-2 cursor-pointer"
                        title={service.active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${service.active ? 'bg-success' : 'bg-muted'} ${togglingId === service.id ? 'opacity-50' : ''}`}>
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${service.active ? 'left-5' : 'left-1'}`}></div>
                        </div>
                        <span className="text-xs font-medium text-text-muted">
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-2 text-text-muted hover:text-navy transition-colors rounded-md hover:bg-muted"
                          title="Edit service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          disabled={deletingId === service.id}
                          className="p-2 text-text-muted hover:text-error transition-colors rounded-md hover:bg-error/10 disabled:opacity-50"
                          title="Delete service"
                        >
                          {deletingId === service.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-navy">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-error/10 text-error text-sm font-medium p-3 rounded-lg border border-error/20">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Classic Haircut"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Category</label>
                <select
                  className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Duration (min) *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Price (NPR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Display Order</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                  value={formData.order}
                  onChange={e => setFormData({ ...formData, order: e.target.value })}
                />
                <p className="text-xs text-text-muted mt-1">Lower numbers appear first.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>Cancel</Button>
                <Button type="submit" isLoading={saving}>
                  {editingService ? 'Save Changes' : 'Add Service'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
