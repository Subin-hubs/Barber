import React, { useState } from 'react';
import { Filter, Calendar as CalendarIcon, ChevronDown, MoreVertical } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';

export const BarberAppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState('Today');
  const tabs = ['Today', 'Upcoming', 'Past', 'All'];

  const appointments = [
    { id: '1', time: '09:00', date: '2023-10-25', customerName: 'Alex Turner', serviceName: 'Classic Haircut', duration: 45, status: 'completed' },
    { id: '2', time: '10:00', date: '2023-10-25', customerName: 'Sam Riley', serviceName: 'Beard Trim & Shape', duration: 30, status: 'completed' },
    { id: '3', time: '11:00', date: '2023-10-25', customerName: 'Jordan Peele', serviceName: 'Hair & Beard Combo', duration: 75, status: 'in_progress' },
    { id: '4', time: '13:00', date: '2023-10-25', customerName: 'Marcus Johnson', serviceName: 'Classic Haircut', duration: 45, status: 'confirmed' },
    { id: '5', time: '14:00', date: '2023-10-25', customerName: 'David Chen', serviceName: 'Skin Fade', duration: 60, status: 'confirmed' },
    { id: '6', time: '15:30', date: '2023-10-25', customerName: 'Michael Chang', serviceName: 'Scalp Treatment', duration: 30, status: 'pending' },
    { id: '7', time: '16:00', date: '2023-10-25', customerName: 'Robert King', serviceName: 'Executive Package', duration: 90, status: 'cancelled' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Appointments</h1>
          <p className="text-text-secondary">Manage and view all your bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="bg-white border-border text-text-primary">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Oct 25, 2023 <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="ghost" className="bg-white border-border text-text-primary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border hide-scrollbar px-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-navy' : 'text-text-secondary hover:text-navy hover:bg-muted/50 rounded-t-lg'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gold rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
                <th className="p-4">Time</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Service</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className="font-semibold text-navy">{apt.time}</span>
                    <div className="text-xs text-text-muted">{apt.date}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-text-primary">{apt.customerName}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-text-secondary">{apt.serviceName}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-text-secondary">{apt.duration} min</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-xs font-medium text-navy hover:text-gold transition-colors">View Details</button>
                      <button className="p-1 text-text-muted hover:text-navy transition-colors rounded-md hover:bg-muted">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {appointments.length === 0 && (
            <div className="p-12 text-center text-text-muted">
              No appointments found for the selected filter.
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted">
          <span>Showing {appointments.length} appointments</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
