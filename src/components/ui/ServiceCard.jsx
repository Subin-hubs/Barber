import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatNPR } from '../../utils/slots';

export const ServiceCard = ({ id, name, category, duration, price, imageUrl, isCompact, isSelected, onClick }) => {
  const CardWrapper = onClick ? 'div' : 'div';

  return (
    <CardWrapper 
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-2xl p-6 transition-all duration-200",
        onClick ? "cursor-pointer" : "",
        isSelected ? "ring-2 ring-navy bg-gold-light" : "shadow-sm hover:shadow-md hover:-translate-y-1 border border-transparent",
        isCompact ? "p-4" : ""
      )}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {!isCompact && (
        <div className="w-full h-48 bg-muted rounded-xl mb-6 overflow-hidden relative">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-650" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              {/* Fallback image */}
              <span className="text-4xl text-gold opacity-50">✂</span>
            </div>
          )}
          <div className="absolute top-3 left-3 bg-gold-light text-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
            {category}
          </div>
        </div>
      )}

      {isCompact && (
        <div className="mb-2">
           <span className="inline-block bg-gold-light text-gold px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
            {category}
          </span>
        </div>
      )}

      <h3 className={cn("text-navy font-bold mb-2", isCompact ? "text-lg" : "text-xl")}>
        {name}
      </h3>
      
      <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
        <Clock className="w-4 h-4" />
        <span>{duration} min</span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
        <span className="text-gold font-bold text-lg">{formatNPR(price)}</span>
        {!onClick && (
          <Link 
            to="/book"
            state={{ serviceId: id }}
            className="text-navy font-medium text-sm hover:text-gold transition-colors"
          >
            Book Now &rarr;
          </Link>
        )}
      </div>
    </CardWrapper>
  );
};
