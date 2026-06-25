import React, { useState } from 'react';
import {
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminReportsPage = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const ranges = ['Today', 'This Week', 'This Month', 'Custom'];

  const metrics = [
    { label: 'Total Revenue', value: 'NPR 245,000', icon: TrendingUp, color: 'text-gold' },
    { label: 'Total Appointments', value: '184', icon: Users, color: 'text-navy' },
    { label: 'Completed', value: '162', icon: CheckCircle, color: 'text-success' },
    { label: 'No-Shows/Cancelled', value: '22', icon: XCircle, color: 'text-error' },
  ];

  const barberStats = [
    { name: 'John Doe', appointments: 85, revenue: 110500, rating: 4.9 },
    { name: 'Mike Smith', appointments: 62, revenue: 86800, rating: 4.7 },
    { name: 'David Lee', appointments: 37, revenue: 47700, rating: 4.8 },
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
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 font-medium text-navy outline-none focus:ring-2 focus:ring-navy"
          >
            {ranges.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button variant="secondary" className="bg-white border-border text-navy hover:bg-muted">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-muted/50`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <h3 className="text-sm font-medium text-text-muted">{metric.label}</h3>
            </div>
            <p className="text-3xl font-bold text-navy">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Appointments Status Donut Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 flex flex-col h-96">
          <h2 className="text-xl font-bold text-navy mb-6">Appointments Status</h2>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-48 h-48 rounded-full border-[24px] border-border relative">
              <div className="absolute inset-[-24px] rounded-full border-[24px] border-transparent border-t-success border-r-success rotate-45"></div>
              <div className="absolute inset-[-24px] rounded-full border-[24px] border-transparent border-b-error -rotate-12"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-navy">184</span>
              <span className="text-xs text-text-muted">Total</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center text-sm"><span className="w-3 h-3 rounded-full bg-success mr-2"></span>Completed (88%)</div>
            <div className="flex items-center text-sm"><span className="w-3 h-3 rounded-full bg-error mr-2"></span>Cancelled (12%)</div>
          </div>
        </div>

        {/* Busiest Time Bar Chart Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 flex flex-col h-96">
          <h2 className="text-xl font-bold text-navy mb-6">Busiest Time Slots</h2>
          <div className="flex-1 flex items-end justify-between gap-2 pt-6 border-t border-border/50">
            {['9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p'].map((time, i) => {
              const heights = [30, 45, 60, 20, 35, 70, 85, 95, 100, 60];
              return (
                <div key={time} className="flex flex-col items-center flex-1 group">
                  <div className="w-full relative h-48 flex items-end justify-center">
                    <div 
                      className="w-full max-w-[2rem] bg-navy/20 group-hover:bg-navy rounded-t-sm transition-colors duration-300"
                      style={{ height: `${heights[i]}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-text-muted mt-3">{time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Barber Performance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-navy">Barber Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                <th className="p-4">Barber</th>
                <th className="p-4">Appointments</th>
                <th className="p-4">Revenue Generated</th>
                <th className="p-4 text-right">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {barberStats.map((stat, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-navy">{stat.name}</td>
                  <td className="p-4 text-text-secondary">{stat.appointments}</td>
                  <td className="p-4 font-semibold text-gold">NPR {stat.revenue.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 font-medium text-navy">
                      {stat.rating}
                      <Star className="w-4 h-4 text-gold fill-gold" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
