import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { trackBooking, cancelBooking } from '../../firebase/bookingService';

export const TrackBookingPage = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [bookingId, setBookingId] = useState(initialId);
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleTrack = async (e) => {
    e?.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);
    
    try {
      const data = await trackBooking(bookingId.trim(), phone.trim());
      if (data) {
        setResult(data);
      } else {
        setError('No booking found with this ID and phone number.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while tracking the booking.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!result) return;
    setIsCancelling(true);
    try {
      await cancelBooking(result.id);
      setResult(prev => ({ ...prev, status: 'cancelled' }));
      setIsCancelDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking. Please try again or call the shop.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-base flex items-start justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-navy mb-6 text-center">Track Your Appointment</h2>
        
        <form onSubmit={handleTrack} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Booking Reference</label>
            <input 
              type="text" 
              required
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy focus:border-navy outline-none uppercase font-mono"
              placeholder="e.g. F3A9-B2C1"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Phone Number</label>
            <div className="flex">
              <div className="bg-muted border border-border border-r-0 rounded-l-lg px-3 py-2 flex items-center text-text-secondary">
                +977
              </div>
              <input 
                type="tel" 
                required
                className="flex-1 border border-border rounded-r-lg px-4 py-2 focus:ring-2 focus:ring-navy focus:border-navy outline-none"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Track Booking
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="border border-border rounded-xl p-6 bg-base">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Status</p>
                  <StatusBadge status={result.status} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Booking ID</p>
                  <p className="font-mono font-bold text-navy">{result.bookingId}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Service</span>
                  <span className="font-medium text-navy">{result.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Barber</span>
                  <span className="font-medium text-navy">{result.barberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Date & Time</span>
                  <span className="font-medium text-navy">{result.date} at {result.slot}</span>
                </div>
              </div>

              {result.status !== 'cancelled' && result.status !== 'completed' && (
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <button 
                    className="text-sm font-medium text-error hover:underline"
                    onClick={() => setIsCancelDialogOpen(true)}
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={isCancelDialogOpen}
          title="Cancel Appointment"
          message="Are you sure you want to cancel this appointment? This action cannot be undone."
          confirmText="Yes, Cancel Booking"
          cancelText="No, Keep It"
          onConfirm={handleCancel}
          onCancel={() => setIsCancelDialogOpen(false)}
          isLoading={isCancelling}
          isDestructive={true}
        />
      </div>
    </div>
  );
};
