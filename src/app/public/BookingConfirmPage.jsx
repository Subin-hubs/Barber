import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Copy } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const BookingConfirmPage = () => {
  const location = useLocation();
  const state = location.state;

  if (!state || !state.bookingId) {
    return <Navigate to="/book" replace />;
  }

  const { bookingId, phone, serviceName, date, time } = state;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingId);
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-base px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-10 max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-navy mb-2">Booking Confirmed!</h2>
        <p className="text-text-secondary mb-8">
          Confirmation details sent to +977-{phone}
        </p>

        <div className="bg-gold-light rounded-xl p-6 max-w-sm mx-auto mb-8">
          <p className="text-sm font-semibold text-navy uppercase tracking-wide mb-2">Booking ID</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-bold text-navy tracking-widest">{bookingId}</span>
            <button onClick={copyToClipboard} className="text-navy hover:text-gold transition-colors p-1">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-sm mx-auto bg-white border border-border rounded-xl p-6 mb-8 text-left text-sm space-y-3">
           <div className="flex justify-between">
              <span className="text-text-secondary">Service:</span>
              <span className="font-medium text-navy">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Date & Time:</span>
              <span className="font-medium text-navy">{date} at {time}</span>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to={`/track?id=${bookingId}`}>
            <Button variant="ghost" className="w-full sm:w-auto">Track Your Booking</Button>
          </Link>
          <Link to="/book">
            <Button className="w-full sm:w-auto">
              Book Another Appointment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
