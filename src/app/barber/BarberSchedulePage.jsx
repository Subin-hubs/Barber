import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBarberByUserId } from '../../firebase/barberService';
import { getBarberAllBookings } from '../../firebase/bookingService';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** Returns the Monday of the current week as a Date object. */
function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns YYYY-MM-DD for a Date object. */
function toDateStr(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 9 → 19

const STATUS_COLORS = {
  completed:   'bg-success/20 text-success border border-success/30',
  in_progress: 'bg-purple-100 text-purple-600 border border-purple-200',
};

export const BarberSchedulePage = () => {
  const { user } = useAuth();

  // Keep barberId in a ref so the week-navigation effect can use it
  // without needing barber object in the dependency array (avoids infinite loop)
  const barberIdRef = useRef(null);

  const [weekStart, setWeekStart]   = useState(() => getMondayOf(new Date()));
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [barberName, setBarberName] = useState('');

  /* ---------------------------------------------------------------- */
  /* One-time: resolve barber ID                                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!user) return;
    getBarberByUserId(user.uid)
      .then(b => {
        if (b) {
          barberIdRef.current = b.id;
          setBarberName(b.name || '');
        }
      })
      .catch(err => console.error('Failed to load barber profile:', err));
  }, [user]);

  /* ---------------------------------------------------------------- */
  /* Fetch bookings whenever the week changes                           */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function fetchWeek() {
      // Wait until barber is resolved
      if (!barberIdRef.current) {
        // Retry after a short delay if barber not yet loaded
        const timer = setTimeout(fetchWeek, 300);
        return () => clearTimeout(timer);
      }

      setLoading(true);
      try {
        const startDate = toDateStr(weekStart);
        const endDate   = toDateStr(new Date(weekStart.getTime() + 6 * 86400000));

        const data = await getBarberAllBookings(barberIdRef.current, { startDate, endDate });
        if (!cancelled) setBookings(data);
      } catch (err) {
        console.error('Failed to load schedule:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeek();
    return () => { cancelled = true; };
  }, [weekStart]); // Only re-run when week changes — barber is in a ref

  /* ---------------------------------------------------------------- */
  /* Derived dates                                                      */
  /* ---------------------------------------------------------------- */

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  /* ---------------------------------------------------------------- */
  /* Calendar blocks                                                    */
  /* ---------------------------------------------------------------- */

  const blocks = bookings
    .filter(b => b.status !== 'cancelled')
    .map(b => {
      const d = new Date(b.date + 'T00:00:00');
      let dayIndex = d.getDay() - 1; // Mon=0 … Sat=5
      if (dayIndex === -1) dayIndex = 6; // Sun

      const parts = (b.slot || '09:00').split(':').map(Number);
      const startHour = parts[0] + (parts[1] || 0) / 60;
      const duration  = (b.duration || 30) / 60;

      const color = STATUS_COLORS[b.status] || 'bg-navy text-white';

      return { dayIndex, startHour, duration, title: b.serviceName || 'Booking', customer: b.customerName, color };
    });

  /* ---------------------------------------------------------------- */
  /* Navigation                                                         */
  /* ---------------------------------------------------------------- */

  const handlePrevWeek = () =>
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });

  const handleNextWeek = () =>
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });

  /* ---------------------------------------------------------------- */
  /* Date range label                                                   */
  /* ---------------------------------------------------------------- */

  const startLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate    = dates[6];
  const endLabel   = endDate.toLocaleDateString('en-US', {
    month: endDate.getMonth() === weekStart.getMonth() ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  });

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 h-full flex flex-col">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">My Schedule</h1>
          <p className="text-text-secondary">Weekly view of your appointments.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border rounded-lg p-1">
          <button onClick={handlePrevWeek} className="p-2 hover:bg-muted rounded-md text-text-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-navy px-4 min-w-[180px] text-center">
            {startLabel} — {endLabel}
          </span>
          <button onClick={handleNextWeek} className="p-2 hover:bg-muted rounded-md text-text-secondary">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-border flex flex-col flex-1 min-h-0 overflow-hidden relative">

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
          </div>
        )}

        {/* Calendar Header */}
        <div className="grid grid-cols-8 border-b border-border bg-muted/30 shrink-0">
          <div className="p-4 flex items-end justify-center border-r border-border/50 text-xs font-semibold text-text-muted uppercase">
            Time
          </div>
          {DAYS.map((day, i) => {
            const isToday = dates[i].toDateString() === new Date().toDateString();
            return (
              <div key={day} className={`p-4 text-center border-r border-border/50 ${isToday ? 'bg-gold-light/30' : ''}`}>
                <div className="text-sm font-medium text-text-secondary mb-1">{day}</div>
                <div className={`text-xl font-bold ${isToday ? 'text-navy' : 'text-text-primary'}`}>
                  {dates[i].getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto bg-white relative">
          {/* Hour rows */}
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-border/50 h-20">
              <div className="border-r border-border/50 flex items-start justify-center pt-2 text-xs font-medium text-text-muted bg-white z-10">
                {hour}:00
              </div>
              {DAYS.map((_, i) => (
                <div key={i} className="border-r border-border/50 relative" />
              ))}
            </div>
          ))}

          {/* Booking blocks */}
          {blocks.map((block, i) => {
            // Guard: only render blocks within visible hours (9–19)
            if (block.startHour < 9 || block.startHour >= 19) return null;

            const topRem    = (block.startHour - 9) * 5; // each hour = 5rem (h-20)
            const heightRem = block.duration * 5;
            const colWidth  = 100 / 8;               // 8 columns
            const leftPct   = colWidth * (block.dayIndex + 1); // +1 for time column

            return (
              <div
                key={i}
                title={`${block.customer} — ${block.title}`}
                className={`absolute rounded-md px-2 py-1 overflow-hidden shadow-sm text-xs font-semibold cursor-default transition-transform hover:scale-[1.02] ${block.color}`}
                style={{
                  top:    `${topRem}rem`,
                  height: `${Math.max(heightRem, 1)}rem`,
                  width:  `calc(${colWidth}% - 8px)`,
                  left:   `calc(${leftPct}% + 4px)`,
                }}
              >
                <div className="truncate">{block.title}</div>
                {block.customer && (
                  <div className="truncate opacity-75">{block.customer}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
