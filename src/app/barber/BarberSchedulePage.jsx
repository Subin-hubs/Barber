import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBarberByUserId } from '../../firebase/barberService';
import { getAllBookings } from '../../firebase/bookingService';

export const BarberSchedulePage = () => {
  const { user } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  });

  const [barber, setBarber] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 11 }, (_, i) => i + 9); // 9am to 7pm

  const getDates = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const dates = getDates();
  
  const startDateStr = dates[0].toISOString().split('T')[0];
  const endDateStr = dates[6].toISOString().split('T')[0];

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        let b = barber;
        if (!b) {
          b = await getBarberByUserId(user.uid);
          setBarber(b);
        }
        
        if (b) {
          const weekBookings = await getAllBookings({
            barberId: b.id,
            startDate: startDateStr,
            endDate: endDateStr,
          });
          setBookings(weekBookings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, barber, startDateStr, endDateStr]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  // Convert bookings to blocks
  const blocks = bookings.filter(b => b.status !== 'cancelled').map(b => {
    const d = new Date(b.date);
    let dayIndex = d.getDay() - 1;
    if (dayIndex === -1) dayIndex = 6; // Sunday
    
    const [h, m] = b.slot.split(':').map(Number);
    const startHour = h + (m / 60);
    const duration = (b.duration || 30) / 60;

    let color = 'bg-navy text-white';
    if (b.status === 'completed') color = 'bg-success/20 text-success border border-success/30';
    else if (b.status === 'in_progress') color = 'bg-info/20 text-info border border-info/30';

    return {
      day: dayIndex,
      startHour,
      duration,
      title: b.serviceName,
      color
    };
  });

  const monthYearStr = currentWeekStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const endMonthYearStr = dates[6].toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const dateRangeStr = `${monthYearStr} - ${endMonthYearStr === monthYearStr ? dates[6].getDate() : endMonthYearStr}`;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">My Schedule</h1>
          <p className="text-text-secondary">Weekly view of your appointments and breaks.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border rounded-lg p-1">
          <button onClick={handlePrevWeek} className="p-2 hover:bg-muted rounded-md text-text-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-navy px-4">{dateRangeStr}</span>
          <button onClick={handleNextWeek} className="p-2 hover:bg-muted rounded-md text-text-secondary">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border flex flex-col flex-1 min-h-0 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
          </div>
        )}
        
        {/* Calendar Header */}
        <div className="grid grid-cols-8 border-b border-border bg-muted/30 shrink-0">
          <div className="p-4 flex items-end justify-center border-r border-border/50 text-xs font-semibold text-text-muted uppercase">
            Time
          </div>
          {days.map((day, i) => {
            const isToday = dates[i].toDateString() === new Date().toDateString();
            return (
              <div key={day} className={`p-4 text-center border-r border-border/50 ${isToday ? 'bg-gold-light/30' : ''}`}>
                <div className="text-sm font-medium text-text-secondary mb-1">{day}</div>
                <div className={`text-xl font-bold ${isToday ? 'text-navy' : 'text-text-primary'}`}>{dates[i].getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto bg-white relative">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-border/50 relative h-20">
              <div className="border-r border-border/50 flex items-start justify-center pt-2 text-xs font-medium text-text-muted relative z-10 bg-white">
                {hour}:00
              </div>
              {days.map((_, i) => (
                <div key={i} className="border-r border-border/50 relative"></div>
              ))}
            </div>
          ))}

          {/* Render Blocks */}
          {blocks.map((block, i) => (
            <div 
              key={i}
              className={`absolute left-0 right-0 mx-1 rounded-md p-2 overflow-hidden shadow-sm text-xs font-semibold cursor-pointer transition-transform hover:scale-[1.02] ${block.color}`}
              style={{
                top: `${(block.startHour - 9) * 5}rem`,
                height: `${block.duration * 5}rem`,
                width: `calc(12.5% - 8px)`,
                left: `calc(${12.5 * (block.day + 1)}% + 4px)`
              }}
            >
              {block.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
