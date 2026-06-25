import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';

export const AdminWalkInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    barber: '',
    time: 'now'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingId(Math.random().toString(36).substring(2, 10).toUpperCase());
    }, 1000);
  };

  if (bookingId) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 pb-10 mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-10 text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-bold text-navy mb-2">Walk-in Created</h2>
          <p className="text-text-secondary mb-8">Appointment added to the schedule.</p>

          <div className="bg-gold-light rounded-xl p-6 max-w-sm mx-auto mb-8">
            <p className="text-sm font-semibold text-navy uppercase tracking-wide mb-2">Booking ID</p>
            <span className="text-2xl font-mono font-bold text-navy tracking-widest">{bookingId}</span>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</Button>
            <Button onClick={() => { setBookingId(null); setFormData({name:'', phone:'', service:'', barber:'', time:'now'}); }}>Add Another Walk-in</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Create Walk-in</h1>
        <p className="text-text-secondary">Quickly add a walk-in customer to the schedule.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-border p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Customer Name</label>
            <input 
              type="text" 
              required
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Phone</label>
            <div className="flex">
              <div className="bg-muted border border-border border-r-0 rounded-l-lg px-3 py-2 text-text-secondary flex items-center">+977</div>
              <input 
                type="tel" 
                required
                className="flex-1 border border-border rounded-r-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Service</label>
          <select 
            required
            className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
            value={formData.service}
            onChange={e => setFormData({...formData, service: e.target.value})}
          >
            <option value="">Select Service...</option>
            <option value="1">Classic Haircut</option>
            <option value="2">Skin Fade</option>
            <option value="3">Beard Trim</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Barber</label>
          <select 
            required
            className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
            value={formData.barber}
            onChange={e => setFormData({...formData, barber: e.target.value})}
          >
            <option value="">Select Barber...</option>
            <option value="1">John Doe</option>
            <option value="2">Mike Smith</option>
            <option value="any">Any Available</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Time</label>
          <select 
            className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
            value={formData.time}
            onChange={e => setFormData({...formData, time: e.target.value})}
          >
            <option value="now">Now (Walk-in)</option>
            <option value="14:00">14:00 Today</option>
            <option value="14:30">14:30 Today</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Create Walk-in Appointment</Button>
        </div>
      </form>
    </div>
  );
};
