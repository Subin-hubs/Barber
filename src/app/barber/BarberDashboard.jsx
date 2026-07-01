import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, Users, CheckCircle, Star, Loader2,
  ArrowRight, AlertCircle, RefreshCw, TrendingUp,
  Calendar, XCircle, PlayCircle
} from 'lucide-react';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { useAuth } from '../../context/AuthContext';
import { getBarberByUserId } from '../../firebase/barberService';
import { getBarberAllBookings, updateBookingStatus } from '../../firebase/bookingService';
import { todayString } from '../../utils/slots';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const BarberDashboard = () => {
  const { user } = useAuth();
  const [barber, setBarber]           = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [actionData, setActionData]   = useState(null);
  const [isUpdating, setIsUpdating]   = useState(false);

  /* ---- Load -------------------------------------------------------- */
  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const barberDoc = await getBarberByUserId(user.uid);
      if (!barberDoc) { setError('Barber profile not found for your account.'); return; }
      setBarber(barberDoc);
      const sevenDaysAgo = (() => {
        const d = new Date(); d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
      })();
      const bookings = await getBarberAllBookings(barberDoc.id, { startDate: sevenDaysAgo });
      setAllBookings(bookings);
    } catch (err) {
      console.error('Error loading dashboard', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  /* ---- Action handlers --------------------------------------------- */
  const handleActionClick = (action, id) => setActionData({ id, action });

  const confirmAction = async () => {
    if (!actionData) return;
    setIsUpdating(true);
    try {
      await updateBookingStatus(actionData.id, actionData.action);
      setAllBookings(prev =>
        prev.map(apt => apt.id === actionData.id ? { ...apt, status: actionData.action } : apt)
      );
      setActionData(null);
    } catch (err) {
      console.error('Failed to update status', err);
      setError('Failed to update appointment status.');
    } finally { setIsUpdating(false); }
  };

  /* ---- Derived stats ------------------------------------------------ */
  const today = todayString();
  const weekStart = (() => {
    const d = new Date(); const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  })();

  const todayBookings    = allBookings.filter(a => a.date === today);
  const upcomingBookings = allBookings.filter(a => a.date > today);
  const completedToday   = todayBookings.filter(a => a.status === 'completed').length;
  const pendingToday     = todayBookings.filter(a => a.status === 'pending').length;
  const inProgressToday  = todayBookings.filter(a => a.status === 'in_progress').length;
  const cancelledToday   = todayBookings.filter(a => a.status === 'cancelled').length;

  const nextCustomer = todayBookings
    .filter(a => ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => a.slot.localeCompare(b.slot))[0] || null;

  /* ---- Loading / Error --------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  if (error && !barber) {
    return (
      <div className="bg-error/5 border border-error/20 text-error rounded-2xl p-8 flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10" />
        <p className="font-semibold text-center">{error}</p>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border border-error/30 rounded-lg hover:bg-error hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  /* ---- Stat cards --------------------------------------------------- */
  const stats = [
    { label: "Today's Appointments", value: todayBookings.length,                           icon: Users,      iconBg: 'bg-navy/10',     iconColor: 'text-navy'    },
    { label: 'Completed Today',       value: completedToday,                                 icon: CheckCircle,iconBg: 'bg-success/10',  iconColor: 'text-success' },
    { label: 'Upcoming This Week',    value: upcomingBookings.filter(a => a.date >= weekStart).length, icon: TrendingUp, iconBg: 'bg-info/10', iconColor: 'text-info' },
    { label: 'Rating',                value: barber?.rating ? barber.rating.toFixed(1) : 'New', icon: Star,   iconBg: 'bg-gold-light',  iconColor: 'text-gold'    },
  ];

  /* ---- Today's overview rows --------------------------------------- */
  // Use a row-based layout with text-navy for all values — avoids low-contrast tinted cards
  const overview = [
    { label: 'Pending',     count: pendingToday,    icon: Clock,       dot: 'bg-warning'  },
    { label: 'In Progress', count: inProgressToday, icon: PlayCircle,  dot: 'bg-purple-500' },
    { label: 'Completed',   count: completedToday,  icon: CheckCircle, dot: 'bg-success'  },
    { label: 'Cancelled',   count: cancelledToday,  icon: XCircle,     dot: 'bg-error'    },
  ];

  /* ---- Render ------------------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">Dashboard</h1>
        <p className="text-text-secondary text-sm md:text-base">
          Welcome back, {barber?.name || 'Barber'}! Here's your schedule for today.
        </p>
      </div>

      {/* Non-blocking error */}
      {error && (
        <div className="mb-5 bg-error/5 border border-error/20 text-error rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-5 md:mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-border">
            <div className={`inline-flex p-2 md:p-3 rounded-xl ${stat.iconBg} mb-3 md:mb-4`}>
              <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.iconColor}`} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-navy mb-0.5">{stat.value}</p>
            <p className="text-xs md:text-sm font-medium text-text-muted leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Middle row: Next Customer + Today's Overview ────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 mb-5 md:mb-6">

        {/* Next Customer */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight className="w-4 h-4 text-gold" />
            <h2 className="text-base font-bold text-navy">Next Customer</h2>
          </div>
          {nextCustomer ? (
            <div>
              <p className="text-xl font-bold text-navy mb-0.5">{nextCustomer.customerName}</p>
              <p className="text-sm text-text-secondary mb-3">{nextCustomer.serviceName}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                <Clock className="w-4 h-4" />
                {nextCustomer.slot}
                {nextCustomer.duration && (
                  <span className="text-text-muted font-normal">· {nextCustomer.duration} min</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-text-muted">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No upcoming customers today</p>
            </div>
          )}
        </div>

        {/* Today's Overview — clean white card, colored dots, dark text */}
        <div className="md:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-sm border border-border p-5">
          <h2 className="text-base font-bold text-navy mb-4">Today's Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            {overview.map(({ label, count, icon: Icon, dot }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border">
                <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                <div className="min-w-0">
                  <p className="text-xl font-bold text-navy leading-none">{count}</p>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Today's Schedule ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-border p-5 md:p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-navy">Today's Schedule</h2>
          <span className="text-xs md:text-sm font-medium text-text-secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {todayBookings.length === 0 ? (
          <div className="text-center py-14 text-text-muted">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold mb-1">No appointments today</p>
            <p className="text-sm">Enjoy your free day, or check Appointments for upcoming bookings.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayBookings
              .sort((a, b) => a.slot.localeCompare(b.slot))
              .map(apt => (
                <div key={apt.id} className="flex gap-3 md:gap-6">
                  {/* Time column — hidden on xs, show on sm+ */}
                  <div className="hidden sm:flex w-14 shrink-0 pt-4 text-xs font-bold text-text-secondary text-right justify-end">
                    {apt.slot}
                  </div>
                  <div className="flex-1">
                    {/* Time shown inline on xs */}
                    <p className="sm:hidden text-xs font-bold text-text-secondary mb-1">{apt.slot}</p>
                    <AppointmentCard appointment={apt} onAction={handleActionClick} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!actionData}
        onClose={() => setActionData(null)}
        title={actionData?.action === 'cancelled' ? 'Cancel Appointment' : 'Update Status'}
        message={`Are you sure you want to mark this appointment as "${actionData?.action}"?`}
        confirmText="Yes, Update"
        cancelText="No, Go Back"
        onConfirm={confirmAction}
        isLoading={isUpdating}
        isDestructive={actionData?.action === 'cancelled' || actionData?.action === 'no_show'}
      />
    </div>
  );
};
