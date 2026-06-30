import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { getActiveServices } from '../../firebase/serviceService';
import { getActiveBarbers } from '../../firebase/barberService';
import { createBooking, generateBookingId } from '../../firebase/bookingService';
import { todayString } from '../../utils/slots';

export const AdminWalkInPage = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    barberId: '',
    slot: 'now',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [svcList, barberList] = await Promise.all([
          getActiveServices(),
          getActiveBarbers()
        ]);
        setServices(svcList);
        setBarbers(barberList);
      } catch (err) {
        console.error('Error loading walk-in data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Generate available time slots for today starting from the current hour
  const generateTodaySlots = () => {
    const now = new Date();
    const slots = [];
    const startHour = now.getMinutes() > 30 ? now.getHours() + 1 : now.getHours();
    for (let h = startHour; h < 19; h++) {
      for (const m of [0, 30]) {
        if (h === startHour && m < (now.getMinutes() > 0 && now.getMinutes() <= 30 ? 30 : 0)) continue;
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTodaySlots();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.serviceId) { setFormError('Please select a service.'); return; }
    if (!formData.barberId) { setFormError('Please select a barber.'); return; }

    const service = services.find(s => s.id === formData.serviceId);
    const barber = barbers.find(b => b.id === formData.barberId);

    if (!service || !barber) { setFormError('Invalid service or barber selection.'); return; }

    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const slotToUse = formData.slot === 'now' ? currentTimeStr : formData.slot;

    setIsSubmitting(true);
    try {
      const result = await createBooking({
        serviceId: service.id,
        serviceName: service.name,
        barberId: barber.id,
        barberName: barber.name,
        date: todayString(),
        slot: slotToUse,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: '',
        notes: formData.notes.trim(),
        price: service.price,
        duration: service.duration,
        status: 'confirmed',
        source: 'walk-in',
      });
      setBookingResult({ bookingId: result.bookingId, service: service.name, barber: barber.name, slot: slotToUse });
    } catch (err) {
      console.error('Error creating walk-in:', err);
      setFormError('Failed to create walk-in booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingResult) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 pb-10 mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-10 text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-bold text-navy mb-2">Walk-in Created!</h2>
          <p className="text-text-secondary mb-8">Appointment has been added to the schedule.</p>

          <div className="bg-gold-light rounded-xl p-6 max-w-sm mx-auto mb-6">
            <p className="text-sm font-semibold text-navy uppercase tracking-wide mb-2">Booking ID</p>
            <span className="text-2xl font-mono font-bold text-navy tracking-widest">{bookingResult.bookingId}</span>
          </div>

          <div className="text-sm text-text-secondary space-y-1 mb-8">
            <p><span className="font-medium text-navy">Service:</span> {bookingResult.service}</p>
            <p><span className="font-medium text-navy">Barber:</span> {bookingResult.barber}</p>
            <p><span className="font-medium text-navy">Time:</span> {bookingResult.slot} today</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</Button>
            <Button onClick={() => {
              setBookingResult(null);
              setFormData({ customerName: '', customerPhone: '', serviceId: '', barberId: '', slot: 'now', notes: '' });
            }}>
              Add Another Walk-in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Create Walk-in</h1>
        <p className="text-text-secondary">Quickly add a walk-in customer to today's schedule.</p>
      </div>

      {loadingData ? (
        <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-border">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-border p-8 space-y-6">
          {formError && (
            <div className="bg-error/10 text-error text-sm font-medium p-3 rounded-lg border border-error/20">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Customer Name *</label>
              <input
                type="text"
                required
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Phone *</label>
              <div className="flex">
                <div className="bg-muted border border-border border-r-0 rounded-l-lg px-3 py-2 text-text-secondary flex items-center text-sm">+977</div>
                <input
                  type="tel"
                  required
                  className="flex-1 border border-border rounded-r-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none"
                  value={formData.customerPhone}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Service *</label>
            <select
              required
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
              value={formData.serviceId}
              onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
            >
              <option value="">Select Service...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} — NPR {s.price} ({s.duration} min)</option>
              ))}
            </select>
            {services.length === 0 && (
              <p className="text-xs text-error mt-1">No active services found. Add services first.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Barber *</label>
            <select
              required
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
              value={formData.barberId}
              onChange={e => setFormData({ ...formData, barberId: e.target.value })}
            >
              <option value="">Select Barber...</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {barbers.length === 0 && (
              <p className="text-xs text-error mt-1">No active barbers found. Add barbers first.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Time Slot</label>
            <select
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none bg-white"
              value={formData.slot}
              onChange={e => setFormData({ ...formData, slot: e.target.value })}
            >
              <option value="now">Now (current time)</option>
              {timeSlots.map(t => <option key={t} value={t}>{t} Today</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Notes</label>
            <textarea
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy outline-none resize-none"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} disabled={services.length === 0 || barbers.length === 0}>
              Create Walk-in Appointment
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
