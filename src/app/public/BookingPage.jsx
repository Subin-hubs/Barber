import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Scissors, Loader2 } from 'lucide-react';
import { StepIndicator } from '../../components/booking/StepIndicator';
import { SlotPicker } from '../../components/booking/SlotPicker';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { BarberCard } from '../../components/ui/BarberCard';
import { Button } from '../../components/ui/Button';

import { getActiveServices } from '../../firebase/serviceService';
import { getActiveBarbers } from '../../firebase/barberService';
import { createBooking, getTakenSlots } from '../../firebase/bookingService';
import { sendBookingConfirmation } from '../../services/emailService';
import { generateSlots, formatNPR } from '../../utils/slots';

export const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(location.state?.serviceId || null);
  const [selectedBarber, setSelectedBarber] = useState(location.state?.barberId || null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const steps = [
    'Choose Service',
    'Choose Barber',
    'Date & Time',
    'Your Details'
  ];

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [servicesData, barbersData] = await Promise.all([
          getActiveServices(),
          getActiveBarbers()
        ]);
        setServices(servicesData);
        setBarbers([
          { id: 'any', name: 'Any Available Barber', isAny: true },
          ...barbersData
        ]);

        if (location.state?.serviceId) setStep(2);
        if (location.state?.barberId) setStep(3);

      } catch (err) {
        console.error("Error loading booking data", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadInitialData();
  }, [location.state]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !selectedBarber) return;
      setLoadingSlots(true);
      try {
        // localDate to string format YYYY-MM-DD
        const dateStr = [
          selectedDate.getFullYear(),
          String(selectedDate.getMonth() + 1).padStart(2, '0'),
          String(selectedDate.getDate()).padStart(2, '0')
        ].join('-');

        let start = '09:00';
        let end = '19:00';
        let isOpen = true;

        if (selectedBarber !== 'any') {
          const barber = barbers.find(b => b.id === selectedBarber);
          if (barber) {
            // Check if barber is on leave
            if (barber.leaves?.some(l => l.date === dateStr)) {
              isOpen = false;
            } else {
              // Check working hours for this specific day
              const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
              const shift = barber.workingHours?.find(wh => wh.day === dayName);
              if (shift) {
                isOpen = shift.isOpen;
                start = shift.openTime;
                end = shift.closeTime;
              }
            }
          }
        }

        if (!isOpen) {
          setAvailableSlots([]);
        } else {
          const takenSlots = await getTakenSlots(dateStr, selectedBarber);
          const allSlots = generateSlots(start, end, 30);
          
          const mappedSlots = allSlots.map(time => ({
            time,
            available: !takenSlots.includes(time)
          }));

          setAvailableSlots(mappedSlots);
        }
        
        setSelectedTime(null); // Reset time when date changes
      } catch (err) {
        console.error("Error loading slots", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedDate, selectedBarber]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const service = services.find(s => s.id === selectedService);
      const barber = barbers.find(b => b.id === selectedBarber);
      const dateStr = [
        selectedDate.getFullYear(),
        String(selectedDate.getMonth() + 1).padStart(2, '0'),
        String(selectedDate.getDate()).padStart(2, '0')
      ].join('-');

      const bookingData = {
        serviceId: selectedService,
        serviceName: service.name,
        barberId: selectedBarber,
        barberName: barber.name,
        date: dateStr,
        slot: selectedTime,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        notes: formData.notes,
        price: service.price,
        duration: service.duration,
      };

      const result = await createBooking(bookingData);

      // Send email in background if email is provided
      if (formData.email) {
        sendBookingConfirmation({
          to_email: formData.email,
          to_name: formData.fullName,
          booking_id: result.bookingId,
          service_name: service.name,
          date: selectedDate.toLocaleDateString(),
          time: selectedTime,
          barber_name: barber.name
        }).catch(console.error);
      }

      navigate('/book/confirm', { 
        state: { 
          bookingId: result.bookingId,
          phone: formData.phone,
          serviceName: service.name,
          date: selectedDate.toLocaleDateString(),
          time: selectedTime
        }
      });
      
    } catch (err) {
      console.error("Error confirming booking", err);
      alert("Failed to confirm booking. Please try again.");
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-navy mb-6">Select a Service</h2>
      {loadingInitial ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                {...service}
                isCompact
                isSelected={selectedService === service.id}
                onClick={() => setSelectedService(service.id)}
              />
            ))}
          </div>
          <div className="flex justify-end pt-6 border-t border-border">
            <Button onClick={handleNext} disabled={!selectedService}>
              Next: Choose Barber <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-navy mb-6">Select a Barber</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {barbers.map(barber => (
          <BarberCard
            key={barber.id}
            {...barber}
            isCompact
            isSelected={selectedBarber === barber.id}
            onClick={() => setSelectedBarber(barber.id)}
          />
        ))}
      </div>
      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="ghost" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext} disabled={!selectedBarber}>
          Next: Date & Time <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-navy mb-6">Choose Date & Time</h2>
      <div className="mb-8 relative">
        {loadingSlots && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
          </div>
        )}
        <SlotPicker 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          availableSlots={availableSlots}
        />
      </div>
      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="ghost" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext} disabled={!selectedDate || !selectedTime}>
          Next: Your Details <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const service = services.find(s => s.id === selectedService);
    const barber = barbers.find(b => b.id === selectedBarber);

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col md:flex-row gap-10">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-navy mb-6">Your Details</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Full Name *</label>
              <input 
                type="text" 
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy focus:border-navy outline-none"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Phone Number *</label>
              <div className="flex">
                <div className="bg-muted border border-border border-r-0 rounded-l-lg px-3 py-2 flex items-center text-text-secondary">
                  +977
                </div>
                <input 
                  type="tel" 
                  className="flex-1 border border-border rounded-r-lg px-4 py-2 focus:ring-2 focus:ring-navy focus:border-navy outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Email (Optional)</label>
              <input 
                type="email" 
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy focus:border-navy outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Notes for Barber (Optional)</label>
              <textarea 
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy focus:border-navy outline-none h-24 resize-none"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Any specific requests?"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Summary Sticky Card */}
        <div className="md:w-80 shrink-0">
          <div className="bg-muted rounded-xl p-6 sticky top-24">
            <h3 className="font-bold text-navy mb-4 pb-4 border-b border-border">Booking Summary</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-text-secondary">Service</span>
                <span className="font-medium text-navy text-right">{service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Duration</span>
                <span className="font-medium text-navy text-right">{service?.duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Barber</span>
                <span className="font-medium text-navy text-right">{barber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Date & Time</span>
                <span className="font-medium text-navy text-right">
                  {selectedDate?.toLocaleDateString()} at {selectedTime}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-6 flex justify-between items-center">
              <span className="font-semibold text-navy">Total</span>
              <span className="text-xl font-bold text-gold">{formatNPR(service?.price || 0)}</span>
            </div>

            <p className="text-xs text-text-muted mb-6">
              Payment at shop. Free cancellation up to 2 hours before.
            </p>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleBack} className="px-3" disabled={isSubmitting}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleConfirm}
                disabled={!formData.fullName || !formData.phone}
                isLoading={isSubmitting}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-base">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-10">
          <StepIndicator currentStep={step} steps={steps} />

          <div className="min-h-[400px]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>
        </div>
      </div>
    </div>
  );
};
