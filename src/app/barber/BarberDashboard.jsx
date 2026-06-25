import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, Star, Loader2 } from 'lucide-react';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { useAuth } from '../../context/AuthContext';
import { getBarberByUserId } from '../../firebase/barberService';
import { getBarberBookings, updateBookingStatus } from '../../firebase/bookingService';
import { todayString } from '../../utils/slots';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const BarberDashboard = () => {
  const { user } = useAuth();
  const [barber, setBarber] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [actionData, setActionData] = useState(null); // { id, action }
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const barberDoc = await getBarberByUserId(user.uid);
        setBarber(barberDoc);

        if (barberDoc) {
          const bookings = await getBarberBookings(barberDoc.id, todayString());
          setAppointments(bookings);
        }
      } catch (err) {
        console.error("Error loading dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const handleActionClick = (action, id) => {
    setActionData({ id, action });
  };

  const confirmAction = async () => {
    if (!actionData) return;
    setIsUpdating(true);
    try {
      await updateBookingStatus(actionData.id, actionData.action);
      setAppointments(prev => prev.map(apt => 
        apt.id === actionData.id ? { ...apt, status: actionData.action } : apt
      ));
      setActionData(null);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>;
  }

  if (!barber) {
    return <div className="text-center py-20 text-text-secondary">Barber profile not found.</div>;
  }

  const completedToday = appointments.filter(a => a.status === 'completed').length;

  const stats = [
    { label: "Today's Appointments", value: appointments.length, icon: Users, color: 'text-navy', bg: 'bg-navy/10' },
    { label: 'Completed Today', value: completedToday, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Upcoming This Week', value: '--', icon: Clock, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Average Rating', value: barber.rating || 'New', icon: Star, color: 'text-gold', bg: 'bg-gold-light' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back, {barber.name}! Here's your schedule for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-navy mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-navy">Today's Schedule</h2>
          <span className="text-sm font-medium text-text-secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-text-muted italic">No appointments for today.</div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-16 top-0 bottom-0 w-px bg-border/50 hidden md:block"></div>
            
            <div className="space-y-6">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex flex-col md:flex-row gap-4 md:gap-8 relative">
                  <div className="w-16 shrink-0 pt-4 text-sm font-bold text-text-secondary md:text-right hidden md:block relative bg-white z-10">
                    {apt.slot}
                  </div>
                  <div className="flex-1">
                    <div className="md:hidden text-sm font-bold text-text-secondary mb-2">
                      {apt.slot}
                    </div>
                    <AppointmentCard appointment={apt} onAction={handleActionClick} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!actionData}
        title={actionData?.action === 'cancelled' ? "Cancel Appointment" : "Update Status"}
        message={`Are you sure you want to mark this appointment as ${actionData?.action}?`}
        confirmText="Yes, Update"
        cancelText="No"
        onConfirm={confirmAction}
        onCancel={() => setActionData(null)}
        isLoading={isUpdating}
        isDestructive={actionData?.action === 'cancelled'}
      />
    </div>
  );
};
