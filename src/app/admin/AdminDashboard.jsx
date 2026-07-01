import React, { useState, useEffect } from 'react';
import { CalendarDays, DollarSign, UserX, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminDashboardMetrics } from '../../firebase/bookingService';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-navy text-lg animate-pulse font-medium">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>
        <Button variant="secondary" onClick={fetchMetrics}>Try Again</Button>
      </div>
    );
  }

  const kpis = [
    { label: "Today's Bookings",      value: String(metrics.todaysBookings),                              icon: CalendarDays, iconBg: 'bg-gold-light',    iconColor: 'text-gold'    },
    { label: "Today's Revenue",       value: `NPR ${metrics.todaysRevenue.toLocaleString()}`,              icon: DollarSign,   iconBg: 'bg-gold-light',    iconColor: 'text-gold'    },
    { label: 'Pending Confirmations', value: String(metrics.pendingConfirmations),                         icon: Clock,        iconBg: 'bg-warning/10',    iconColor: 'text-warning' },
    { label: 'Completed Today',       value: String(metrics.completedToday),                               icon: CheckCircle,  iconBg: 'bg-success/10',    iconColor: 'text-success' },
    { label: 'Cancelled Today',       value: String(metrics.cancelledToday),                               icon: XCircle,      iconBg: 'bg-error/10',      iconColor: 'text-error'   },
    { label: 'No-show Rate',          value: `${metrics.noShowRate}%`,                                     icon: UserX,        iconBg: 'bg-navy/10',       iconColor: 'text-navy'    },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">Dashboard</h1>
          <p className="text-sm text-text-secondary">Overview of your shop's performance today.</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <Link to="/admin/walk-in">
            <Button className="bg-gold text-navy hover:bg-gold-hover border-transparent">
              Add Walk-in
            </Button>
          </Link>
          {/* ✅ Generate Report now navigates to Reports page */}
          <Button
            variant="secondary"
            className="bg-white border-border text-navy hover:bg-muted"
            onClick={() => navigate('/admin/reports')}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPIs — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-border">
            <div className={`inline-flex p-2.5 rounded-xl ${kpi.iconBg} mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-navy mb-0.5">{kpi.value}</p>
            <p className="text-xs font-medium text-text-muted leading-tight">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border h-80 flex flex-col">
            <h2 className="text-xl font-bold text-navy mb-6">Bookings This Week</h2>
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-6 pt-6 border-t border-border/50">
              {metrics.weekDays.map((day, i) => {
                const height = metrics.weekHeights[i];
                return (
                  <div key={day + i} className="flex flex-col items-center flex-1 group">
                    <div className="w-full relative h-40 flex items-end justify-center">
                      <div
                        className="w-full max-w-[3rem] bg-gold-light group-hover:bg-gold rounded-t-sm transition-colors duration-300"
                        style={{ height: `${height}%` }}
                        title={`${metrics.weekCounts[i]} bookings`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-text-muted mt-3 uppercase">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">Recent Appointments</h2>
              <Link to="/admin/appointments" className="text-sm font-medium text-navy flex items-center hover:text-gold transition-colors">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 text-text-muted text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4">ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4 hidden md:table-cell">Barber</th>
                    <th className="p-4 hidden sm:table-cell">Service</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {metrics.recentAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-text-muted">No recent appointments found.</td>
                    </tr>
                  ) : (
                    metrics.recentAppointments.map(apt => (
                      <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-sm text-gold font-medium">{apt.bookingId || apt.id.substring(0, 6)}</td>
                        <td className="p-4 font-medium text-text-primary">{apt.customerName}</td>
                        <td className="p-4 text-text-secondary hidden md:table-cell">{apt.barberName}</td>
                        <td className="p-4 text-text-secondary hidden sm:table-cell">{apt.serviceName}</td>
                        <td className="p-4 font-medium text-navy text-sm">{apt.date} {apt.slot}</td>
                        <td className="p-4"><StatusBadge status={apt.status} /></td>
                        <td className="p-4 text-right">
                          <Link to="/admin/appointments" className="text-xs font-medium text-navy hover:text-gold transition-colors">View</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-navy mb-6">Appointments by Status</h2>
            <div className="flex items-center justify-center h-48 relative">
              <div className="w-32 h-32 rounded-full border-[16px] border-border relative flex items-center justify-center">
                <span className="text-xl font-bold text-navy">{metrics.statusPercentages.confirmed || 0}%</span>
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-gold border-r-gold rotate-45 opacity-80" />
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-l-navy -rotate-45 opacity-80" />
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex justify-between text-sm">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-gold mr-2" /> Confirmed</div>
                <span className="font-semibold text-navy">{metrics.statusPercentages.confirmed || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-navy mr-2" /> Completed</div>
                <span className="font-semibold text-navy">{metrics.statusPercentages.completed || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-border mr-2" /> Pending</div>
                <span className="font-semibold text-navy">{metrics.statusPercentages.pending || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-navy mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/walk-in" className="block w-full text-left px-4 py-3 rounded-lg border border-border hover:border-gold hover:bg-gold-light/30 transition-colors font-medium text-navy">
                + Add Walk-in Appointment
              </Link>
              <Link to="/admin/services" className="block w-full text-left px-4 py-3 rounded-lg border border-border hover:border-navy hover:bg-navy/5 transition-colors font-medium text-navy">
                + Add New Service
              </Link>
              <Link to="/admin/barbers" className="block w-full text-left px-4 py-3 rounded-lg border border-border hover:border-navy hover:bg-navy/5 transition-colors font-medium text-navy">
                + Add New Barber
              </Link>
              <Link to="/admin/reports" className="block w-full text-left px-4 py-3 rounded-lg border border-border hover:border-navy hover:bg-navy/5 transition-colors font-medium text-navy">
                View Full Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
