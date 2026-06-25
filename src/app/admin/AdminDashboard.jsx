import React from 'react';
import { CalendarDays, DollarSign, UserX, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const kpis = [
    { label: "Today's Bookings", value: '24 / 30', icon: CalendarDays },
    { label: "Today's Revenue", value: 'NPR 12,500', icon: DollarSign },
    { label: 'No-show Rate (30d)', value: '4.2%', icon: UserX },
    { label: 'Pending Confirmations', value: '5', icon: Clock },
  ];

  const recentAppointments = [
    { id: 'F3A9', customer: 'Alex Turner', barber: 'John Doe', service: 'Classic Haircut', time: '14:30', status: 'confirmed' },
    { id: 'B2C1', customer: 'Sam Riley', barber: 'Mike Smith', service: 'Beard Trim & Shape', time: '15:00', status: 'pending' },
    { id: '7D4E', customer: 'Jordan Peele', barber: 'David Lee', service: 'Hair & Beard Combo', time: '15:30', status: 'in_progress' },
    { id: 'X9Y8', customer: 'Marcus Johnson', barber: 'John Doe', service: 'Classic Haircut', time: '16:00', status: 'confirmed' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Dashboard</h1>
          <p className="text-text-secondary">Overview of your shop's performance today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/walk-in">
            <Button className="bg-gold text-navy hover:bg-gold-hover border-transparent">
              Add Walk-in
            </Button>
          </Link>
          <Button variant="secondary" className="bg-white border-border text-navy hover:bg-muted">
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-gold-light flex items-center justify-center">
                <kpi.icon className="w-6 h-6 text-gold" />
              </div>
            </div>
            <p className="text-3xl font-bold text-navy mb-1">{kpi.value}</p>
            <p className="text-sm font-medium text-text-muted">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts area placeholder */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border h-80 flex flex-col">
            <h2 className="text-xl font-bold text-navy mb-6">Bookings This Week</h2>
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-6 pt-6 border-t border-border/50">
              {/* Dummy Bar Chart */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const heights = [40, 60, 45, 80, 100, 90, 30];
                return (
                  <div key={day} className="flex flex-col items-center flex-1 group">
                    <div className="w-full relative h-40 flex items-end justify-center">
                      <div 
                        className="w-full max-w-[3rem] bg-gold-light group-hover:bg-gold rounded-t-sm transition-colors duration-300"
                        style={{ height: `${heights[i]}%` }}
                      ></div>
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
                    <th className="p-4">Barber</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-sm text-gold font-medium">{apt.id}</td>
                      <td className="p-4 font-medium text-text-primary">{apt.customer}</td>
                      <td className="p-4 text-text-secondary">{apt.barber}</td>
                      <td className="p-4 text-text-secondary">{apt.service}</td>
                      <td className="p-4 font-medium text-navy">{apt.time}</td>
                      <td className="p-4"><StatusBadge status={apt.status} /></td>
                      <td className="p-4 text-right">
                        <button className="text-xs font-medium text-navy hover:text-gold transition-colors">View</button>
                      </td>
                    </tr>
                  ))}
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
              {/* Dummy Donut Chart */}
              <div className="w-32 h-32 rounded-full border-[16px] border-border relative">
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-gold border-r-gold rotate-45"></div>
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-l-navy -rotate-45"></div>
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex justify-between text-sm">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-gold mr-2"></span> Confirmed</div>
                <span className="font-semibold text-navy">45%</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-navy mr-2"></span> Completed</div>
                <span className="font-semibold text-navy">30%</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-border mr-2"></span> Pending</div>
                <span className="font-semibold text-navy">25%</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
