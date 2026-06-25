import React from 'react';
import { Clock, User, Scissors } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

export const AppointmentCard = ({ appointment, onAction }) => {
  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-navy text-lg">{appointment.customerName}</h4>
          <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
            <Scissors className="w-3.5 h-3.5" />
            {appointment.serviceName}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-text-muted mb-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {appointment.time} ({appointment.duration} min)
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {appointment.status === 'confirmed' && (
          <Button variant="secondary" size="sm" className="flex-1 py-1.5 text-xs" onClick={() => onAction('in_progress', appointment.id)}>
            Start
          </Button>
        )}
        {(appointment.status === 'in_progress' || appointment.status === 'confirmed') && (
          <Button variant="primary" size="sm" className="flex-1 py-1.5 text-xs" onClick={() => onAction('completed', appointment.id)}>
            Complete
          </Button>
        )}
        {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
          <Button variant="ghost" size="sm" className="flex-1 py-1.5 text-xs border-error text-error hover:bg-error hover:text-white" onClick={() => onAction('no_show', appointment.id)}>
            No Show
          </Button>
        )}
      </div>
    </div>
  );
};
