import React from 'react';
import { Clock, Scissors } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

/**
 * AppointmentCard — used on the Dashboard timeline view.
 * onAction(newStatus, appointmentId) is called when the barber clicks an action.
 */
export const AppointmentCard = ({ appointment, onAction }) => {
  const { status, id } = appointment;

  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-navy text-base">{appointment.customerName || '—'}</h4>
          <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
            <Scissors className="w-3.5 h-3.5 shrink-0" />
            {appointment.serviceName || '—'}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-text-muted mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{appointment.slot || appointment.time || '—'}</span>
          {appointment.duration && (
            <span>({appointment.duration} min)</span>
          )}
        </div>
        {appointment.price > 0 && (
          <div className="font-medium text-text-secondary">
            NPR {appointment.price.toLocaleString()}
          </div>
        )}
      </div>

      {/* Action buttons based on status */}
      <div className="flex flex-wrap gap-2">
        {/* pending → accept or reject */}
        {status === 'pending' && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 py-1.5 text-xs"
              onClick={() => onAction('confirmed', id)}
            >
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 py-1.5 text-xs border-error text-error hover:bg-error hover:text-white"
              onClick={() => onAction('cancelled', id)}
            >
              Reject
            </Button>
          </>
        )}

        {/* confirmed → start or no show */}
        {status === 'confirmed' && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 py-1.5 text-xs"
              onClick={() => onAction('in_progress', id)}
            >
              Start
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 py-1.5 text-xs border-error text-error hover:bg-error hover:text-white"
              onClick={() => onAction('no_show', id)}
            >
              No Show
            </Button>
          </>
        )}

        {/* in_progress → complete */}
        {status === 'in_progress' && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 py-1.5 text-xs"
            onClick={() => onAction('completed', id)}
          >
            Complete Service
          </Button>
        )}
      </div>
    </div>
  );
};
