import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ReviewCard = ({ customerName, date, rating, reviewText, barberName, className, isAdmin, onApprove, onReject }) => {
  return (
    <div className={cn("bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-gold/20", className)}>
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn("w-4 h-4", i < rating ? "fill-gold text-gold" : "fill-muted text-muted")} 
          />
        ))}
      </div>
      
      <p className="text-text-secondary italic mb-6 leading-relaxed">
        "{reviewText}"
      </p>

      <div className="mt-auto pt-4 border-t border-border/50 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-semibold text-navy text-sm">{customerName}</p>
          <p className="text-text-muted text-xs mt-0.5">{date}</p>
        </div>
        {barberName && (
          <div className="text-right">
            <span className="text-xs text-text-muted">Barber: </span>
            <span className="text-xs font-medium text-gold">{barberName}</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button 
            onClick={onApprove}
            className="flex-1 py-1.5 text-xs font-medium text-success bg-success/10 hover:bg-success/20 rounded transition-colors"
          >
            Approve
          </button>
          <button 
            onClick={onReject}
            className="flex-1 py-1.5 text-xs font-medium text-error bg-error/10 hover:bg-error/20 rounded transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};
