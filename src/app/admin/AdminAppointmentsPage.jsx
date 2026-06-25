import React, { useState } from 'react';
import { Filter, Search, Download, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';

export const AdminAppointmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const appointments = [
    { id: 'F3A9-B2C1', customer: 'Alex Turner', phone: '9841234567', barber: 'John Doe', service: 'Classic Haircut', duration: 45, date: '2023-10-25', time: '14:30', status: 'confirmed', payment: 'pending', source: 'online' },
    { id: 'B2C1-7D4E', customer: 'Sam Riley', phone: '9851122334', barber: 'Mike Smith', service: 'Beard Trim & Shape', duration: 30, date: '2023-10-25', time: '15:00', status: 'pending', payment: 'pending', source: 'phone' },
    { id: '7D4E-X9Y8', customer: 'Jordan Peele', phone: '9861998877', barber: 'David Lee', service: 'Hair & Beard Combo', duration: 75, date: '2023-10-25', time: '15:30', status: 'in_progress', payment: 'paid', source: 'walk-in' },
    { id: 'X9Y8-Z1W2', customer: 'Marcus Johnson', phone: '9801554433', barber: 'John Doe', service: 'Classic Haircut', duration: 45, date: '2023-10-25', time: '16:00', status: 'completed', payment: 'paid', source: 'online' },
    { id: 'Z1W2-K3L4', customer: 'David Chen', phone: '9811665544', barber: 'Sarah Jones', service: 'Skin Fade', duration: 60, date: '2023-10-26', time: '09:00', status: 'cancelled', payment: 'refunded', source: 'online' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">All Appointments</h1>
          <p className="text-text-secondary">Manage and track all bookings across the shop.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="bg-white border-border text-navy hover:bg-muted">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Filters Top Bar */}
        <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, phone, or ID..." 
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-navy focus:border-navy text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <select className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy">
              <option>All Dates</option>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This Week</option>
            </select>
            <select className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy">
              <option>All Status</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Completed</option>
            </select>
            <select className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy">
              <option>All Barbers</option>
              <option>John Doe</option>
              <option>Mike Smith</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Barber</th>
                <th className="p-4">Service</th>
                <th className="p-4">Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                  <td className="p-4">
                    <span className="font-mono text-sm text-gold font-medium">{apt.id}</span>
                    <div className="text-[10px] uppercase font-semibold text-text-muted mt-1 px-2 py-0.5 bg-muted rounded-full inline-block">
                      {apt.source}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-text-primary">{apt.customer}</p>
                    <p className="text-xs text-text-secondary mt-0.5">+977-{apt.phone}</p>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">{apt.barber}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-text-primary">{apt.service}</p>
                    <p className="text-xs text-text-muted mt-0.5">{apt.duration} min</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-navy">{apt.time}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{apt.date}</p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={apt.status} className="mb-1 block w-max" />
                    {apt.payment === 'paid' ? (
                      <span className="text-[10px] font-bold text-success uppercase tracking-wider">Paid</span>
                    ) : (
                      <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Unpaid</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted">
          <span>Showing 1-5 of 42 appointments</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-border rounded-md hover:bg-muted disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 border border-border rounded-md hover:bg-muted disabled:opacity-50 text-navy font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
