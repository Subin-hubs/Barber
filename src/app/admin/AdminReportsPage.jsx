import React, { useState, useEffect } from 'react';
import {
  Download,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Star
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getAllBookings } from '../../firebase/bookingService';
import { getAllBarbers } from '../../firebase/barberService';

const dateRanges = ['Today', 'This Week', 'This Month', 'All Time'];

function getDateBounds(range) {
  const now = new Date();
  const todayStr = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  if (range === 'Today') return { start: todayStr, end: todayStr };
  if (range === 'This Week') {
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
    return {
      start: [weekStart.getFullYear(), String(weekStart.getMonth() + 1).padStart(2, '0'), String(weekStart.getDate()).padStart(2, '0')].join('-'),
      end: [weekEnd.getFullYear(), String(weekEnd.getMonth() + 1).padStart(2, '0'), String(weekEnd.getDate()).padStart(2, '0')].join('-'),
    };
  }
  if (range === 'This Month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: [monthStart.getFullYear(), String(monthStart.getMonth() + 1).padStart(2, '0'), String(monthStart.getDate()).padStart(2, '0')].join('-'),
      end: [monthEnd.getFullYear(), String(monthEnd.getMonth() + 1).padStart(2, '0'), String(monthEnd.getDate()).padStart(2, '0')].join('-'),
    };
  }
  return { start: null, end: null };
}

export const AdminReportsPage = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [bookings, setBookings] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { start, end } = getDateBounds(dateRange);
        const [bookingList, barberList] = await Promise.all([
          getAllBookings({ startDate: start || undefined, endDate: end || undefined }),
          getAllBarbers()
        ]);
        setBookings(bookingList);
        setBarbers(barberList);
      } catch (err) {
        console.error('Error loading reports:', err);
        setError('Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dateRange]);

  // Computed metrics
  const totalRevenue = bookings.filter(b => ['completed', 'in_progress', 'confirmed'].includes(b.status)).reduce((sum, b) => sum + (b.price || 0), 0);
  const totalAppointments = bookings.length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const cancelled = bookings.filter(b => ['cancelled'].includes(b.status)).length;

  // Slot popularity (busiest times)
  const slotCounts = {};
  bookings.forEach(b => {
    if (b.slot) slotCounts[b.slot] = (slotCounts[b.slot] || 0) + 1;
  });
  const sortedSlots = Object.entries(slotCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxSlotCount = Math.max(...sortedSlots.map(s => s[1]), 1);

  // Barber performance
  const barberStats = barbers.map(barber => {
    const barberBookings = bookings.filter(b => b.barberId === barber.id);
    const revenue = barberBookings.filter(b => ['completed', 'confirmed', 'in_progress'].includes(b.status)).reduce((sum, b) => sum + (b.price || 0), 0);
    return {
      name: barber.name,
      appointments: barberBookings.length,
      completed: barberBookings.filter(b => b.status === 'completed').length,
      revenue,
    };
  }).filter(s => s.appointments > 0).sort((a, b) => b.appointments - a.appointments);

  // Service popularity
  const serviceCounts = {};
  bookings.forEach(b => {
    if (b.serviceName) serviceCounts[b.serviceName] = (serviceCounts[b.serviceName] || 0) + 1;
  });
  const popularServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const completedPct = totalAppointments > 0 ? Math.round((completed / totalAppointments) * 100) : 0;
  const cancelledPct = totalAppointments > 0 ? Math.round((cancelled / totalAppointments) * 100) : 0;

  const metrics = [
    { label: 'Total Revenue', value: `NPR ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-gold' },
    { label: 'Total Appointments', value: totalAppointments, icon: Users, color: 'text-navy' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-success' },
    { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'text-error' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Revenue & Analytics</h1>
          <p className="text-text-secondary">Track your shop's performance and financial metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 font-medium text-navy outline-none focus:ring-2 focus:ring-navy"
          >
            {dateRanges.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button variant="secondary" className="bg-white border-border text-navy hover:bg-muted">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-error mb-4" />
          <p className="text-error">{error}</p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <h3 className="text-sm font-medium text-text-muted">{metric.label}</h3>
                </div>
                <p className="text-3xl font-bold text-navy">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Appointment Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 flex flex-col">
              <h2 className="text-xl font-bold text-navy mb-6">Appointments by Status</h2>
              {totalAppointments === 0 ? (
                <div className="flex-1 flex items-center justify-center text-text-muted">No data for this period.</div>
              ) : (
                <>
                  <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                    <div className="w-48 h-48 rounded-full border-[24px] border-border relative">
                      <div className="absolute inset-[-24px] rounded-full border-[24px] border-transparent border-t-success border-r-success rotate-45"></div>
                      <div className="absolute inset-[-24px] rounded-full border-[24px] border-transparent border-b-error -rotate-12"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-navy">{totalAppointments}</span>
                      <span className="text-xs text-text-muted">Total</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center text-sm"><span className="w-3 h-3 rounded-full bg-success mr-2"></span>Completed ({completedPct}%)</div>
                    <div className="flex items-center text-sm"><span className="w-3 h-3 rounded-full bg-error mr-2"></span>Cancelled ({cancelledPct}%)</div>
                  </div>
                </>
              )}
            </div>

            {/* Busiest Time Slots */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 flex flex-col">
              <h2 className="text-xl font-bold text-navy mb-6">Busiest Time Slots</h2>
              {sortedSlots.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-text-muted">No data for this period.</div>
              ) : (
                <div className="flex-1 flex items-end justify-between gap-2 pt-6 border-t border-border/50">
                  {sortedSlots.map(([time, count]) => {
                    const heightPct = Math.round((count / maxSlotCount) * 100);
                    return (
                      <div key={time} className="flex flex-col items-center flex-1 group">
                        <div className="w-full relative h-48 flex items-end justify-center">
                          <div
                            className="w-full max-w-[2rem] bg-navy/20 group-hover:bg-navy rounded-t-sm transition-colors duration-300"
                            style={{ height: `${heightPct}%` }}
                            title={`${count} bookings`}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-text-muted mt-3">{time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Popular Services */}
          {popularServices.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-navy">Most Popular Services</h2>
              </div>
              <div className="p-6 space-y-4">
                {popularServices.map(([name, count]) => {
                  const pct = Math.round((count / totalAppointments) * 100);
                  return (
                    <div key={name} className="flex items-center gap-4">
                      <span className="w-40 text-sm font-medium text-navy truncate">{name}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-text-muted">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barber Performance Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-navy">Barber Performance</h2>
            </div>
            {barberStats.length === 0 ? (
              <div className="p-12 text-center text-text-muted">No barber data for this period.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                      <th className="p-4">Barber</th>
                      <th className="p-4">Appointments</th>
                      <th className="p-4">Completed</th>
                      <th className="p-4 text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {barberStats.map((stat, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium text-navy">{stat.name}</td>
                        <td className="p-4 text-text-secondary">{stat.appointments}</td>
                        <td className="p-4 text-text-secondary">{stat.completed}</td>
                        <td className="p-4 text-right font-semibold text-gold">NPR {stat.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
