import React from 'react';
import { cn } from '../../utils/cn';

const statusStyles = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-info/10 text-info",
  in_progress: "bg-purple-100 text-purple-600",
  completed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
  no_show: "bg-gray-100 text-gray-500"
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show"
};

export const StatusBadge = ({ status, className }) => {
  return (
    <span className={cn("rounded-full font-medium text-xs px-3 py-1 inline-flex items-center justify-center", statusStyles[status], className)}>
      {statusLabels[status] || status}
    </span>
  );
};
