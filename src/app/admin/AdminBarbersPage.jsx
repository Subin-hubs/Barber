import React, { useState, useEffect } from 'react';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BarberCard } from '../../components/ui/BarberCard';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getAllBarbers, createBarber, updateBarber, deactivateBarber, reactivateBarber } from '../../firebase/barberService';

export const AdminBarbersPage = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, barberId: null, action: null });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: '', gender: '',
    specialty: '', experience: '', photoUrl: '', bio: '',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    workingHoursStart: '09:00', workingHoursEnd: '17:00'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState('');

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const data = await getAllBarbers();
      setBarbers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load barbers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const openAddModal = () => {
    setEditingBarber(null);
    setFormData({
      name: '', email: '', password: '', phone: '', address: '', gender: '',
      specialty: '', experience: '', photoUrl: '', bio: '',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHoursStart: '09:00', workingHoursEnd: '17:00'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (barber) => {
    setEditingBarber(barber);
    
    // Extract a representative start/end time from the first open day, or default
    const firstOpenDay = barber.workingHours?.find(d => d.isOpen) || {};
    const openTime = firstOpenDay.openTime || '09:00';
    const closeTime = firstOpenDay.closeTime || '17:00';
    
    // Reconstruct workingDays array from the normalized array
    const workingDays = barber.workingHours?.filter(d => d.isOpen).map(d => d.day.substring(0,3)) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    setFormData({
      name: barber.name || '', email: barber.email || '', password: '', 
      phone: barber.phone || '', address: barber.address || '', gender: barber.gender || '',
      specialty: barber.specialty || '', experience: barber.experience || '', 
      photoUrl: barber.photoUrl || '', bio: barber.bio || '',
      workingDays,
      workingHoursStart: openTime, 
      workingHoursEnd: closeTime
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day) 
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!formData.name || !formData.email || (!editingBarber && !formData.password) || !formData.phone || !formData.gender || !formData.specialty || !formData.experience) {
        throw new Error('Please fill in all required fields.');
      }

      if (!editingBarber && formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const normalizedWorkingHours = days.map(day => ({
        day,
        isOpen: formData.workingDays.some(wd => wd.startsWith(day.substring(0,3))),
        openTime: formData.workingHoursStart,
        closeTime: formData.workingHoursEnd
      }));

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        specialty: formData.specialty,
        experience: formData.experience,
        photoUrl: formData.photoUrl,
        bio: formData.bio,
        workingHours: normalizedWorkingHours,
      };

      if (editingBarber) {
        await updateBarber(editingBarber.id, payload);
        showNotification('Barber updated successfully');
      } else {
        // Pass normalizedWorkingHours to createBarber so it uses these hours,
        // not the service's internal defaults
        await createBarber({ ...payload, workingDays: formData.workingDays }, formData.password);
        showNotification('Barber added successfully');
      }

      setIsModalOpen(false);
      fetchBarbers();
    } catch (err) {
      // Improve Firebase auth error messages
      let msg = err.message || 'An error occurred.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDialog.barberId) return;
    try {
      if (confirmDialog.action === 'reactivate') {
        await reactivateBarber(confirmDialog.barberId);
        showNotification('Barber reactivated successfully');
      } else {
        await deactivateBarber(confirmDialog.barberId);
        showNotification('Barber deactivated successfully');
      }
      // Optimistic local update — no page reload needed
      setBarbers(prev => prev.map(b =>
        b.id === confirmDialog.barberId
          ? { ...b, active: confirmDialog.action === 'reactivate' }
          : b
      ));
    } catch (err) {
      console.error(err);
      setError(confirmDialog.action === 'reactivate' ? 'Failed to reactivate barber' : 'Failed to deactivate barber');
    } finally {
      setConfirmDialog({ isOpen: false, barberId: null, action: null });
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Barbers</h1>
          <p className="text-text-secondary">Manage staff profiles and availability.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Barber
        </Button>
      </div>

      {notification && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center border border-green-200">
          <Check className="w-5 h-5 mr-2" /> {notification}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-navy font-medium animate-pulse">Loading barbers...</div>
      ) : barbers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <p className="text-text-muted mb-4">No barbers found.</p>
          <Button onClick={openAddModal}>Add your first barber</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <div key={barber.id} className="relative">
               {!barber.active && <div className="absolute top-2 right-2 z-10 bg-error text-white text-xs px-2 py-1 rounded-full font-bold">Inactive</div>}
               <BarberCard
                 {...barber}
                 isAdmin={true}
                 onEdit={() => openEditModal(barber)}
                 onDeactivate={
                   barber.active
                     ? () => setConfirmDialog({ isOpen: true, barberId: barber.id, action: 'deactivate' })
                     : () => setConfirmDialog({ isOpen: true, barberId: barber.id, action: 'reactivate' })
                 }
                 deactivateLabel={barber.active ? 'Deactivate' : 'Reactivate'}
               />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBarber ? "Edit Barber" : "Add New Barber"} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{formError}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Full Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Email *</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!!editingBarber} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none disabled:bg-muted disabled:text-text-muted" />
            </div>
            {!editingBarber && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Password *</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" minLength="6" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Phone Number *</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Gender *</label>
              <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Specialization *</label>
              <input type="text" required value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" placeholder="e.g. Fade, Classic, Beard" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Years of Experience *</label>
              <input type="text" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" placeholder="e.g. 5+ Years" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-1">Address</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-1">Profile Photo URL</label>
              <input type="url" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-2">Working Days *</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button 
                    type="button"
                    key={day} 
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${formData.workingDays.includes(day) ? 'bg-navy text-white border-navy' : 'bg-white text-text-secondary border-border hover:border-navy'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Shift Start</label>
              <input type="time" required value={formData.workingHoursStart} onChange={e => setFormData({...formData, workingHoursStart: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Shift End</label>
              <input type="time" required value={formData.workingHoursEnd} onChange={e => setFormData({...formData, workingHoursEnd: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-1">Biography</label>
              <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-gold outline-none h-24 resize-none"></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : (editingBarber ? 'Update Barber' : 'Add Barber')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, barberId: null, action: null })}
        onConfirm={handleDeactivate}
        title={confirmDialog.action === 'reactivate' ? 'Reactivate Barber' : 'Deactivate Barber'}
        message={
          confirmDialog.action === 'reactivate'
            ? 'Reactivate this barber? They will become available for new bookings again.'
            : 'Are you sure you want to deactivate this barber? They will no longer be available for new bookings.'
        }
        confirmText={confirmDialog.action === 'reactivate' ? 'Reactivate' : 'Deactivate'}
        isDestructive={confirmDialog.action !== 'reactivate'}
      />
    </div>
  );
};
