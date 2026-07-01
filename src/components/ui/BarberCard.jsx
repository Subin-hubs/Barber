import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { cn } from '../../utils/cn';

export const BarberCard = ({ id, name, photoUrl, specialty, experience, bio, isCompact, isSelected, onClick, isAdmin, onEdit, onDeactivate, deactivateLabel = 'Deactivate' }) => {
  const CardWrapper = onClick ? 'div' : 'div';

  return (
    <CardWrapper 
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-2xl p-6 transition-all duration-200",
        onClick ? "cursor-pointer" : "",
        isSelected ? "ring-2 ring-navy bg-gold-light" : "shadow-sm hover:shadow-md hover:-translate-y-1 border border-transparent",
        isCompact ? "p-4 flex items-center gap-4" : "flex flex-col"
      )}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className={cn(
        "bg-muted overflow-hidden shrink-0", 
        isCompact ? "w-16 h-16 rounded-full" : "w-full aspect-square rounded-xl mb-6 relative"
      )}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-650" />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center bg-gold-light text-gold", isCompact ? "bg-gold text-navy" : "")}>
            <Scissors className={cn(isCompact ? "w-6 h-6" : "w-12 h-12 opacity-50")} />
          </div>
        )}
      </div>

      <div className={cn("flex-1", isCompact ? "" : "flex flex-col flex-1")}>
        <div className={cn("flex items-start justify-between", !isCompact && "mb-2")}>
          <h3 className={cn("text-navy font-bold", isCompact ? "text-base" : "text-xl")}>
            {name}
          </h3>
        </div>
        
        {!isCompact && specialty && (
          <div className="mb-2">
            <span className="inline-block bg-gold-light text-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
              {specialty}
            </span>
          </div>
        )}

        {experience && (
          <p className="text-text-muted text-sm mb-3">
            {experience} experience
          </p>
        )}

        {!isCompact && bio && (
          <p className="text-text-secondary text-sm line-clamp-2 mb-6 flex-1">
            {bio}
          </p>
        )}

        {isCompact && specialty && (
          <p className="text-text-secondary text-xs">{specialty}</p>
        )}

        {!onClick && !isAdmin && (
          <div className="mt-auto pt-4 border-t border-border/50">
            <Link 
              to="/book"
              state={{ barberId: id }}
              className="block w-full text-center py-2 px-4 border border-navy text-navy rounded-lg font-medium hover:bg-navy hover:text-white transition-colors"
            >
              Book with {name.split(' ')[0]} &rarr;
            </Link>
          </div>
        )}

        {isAdmin && (
          <div className="mt-auto pt-4 border-t border-border/50 flex gap-2">
            <button type="button" onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="flex-1 py-2 text-sm text-navy hover:bg-muted rounded-md transition-colors font-medium">Edit</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDeactivate?.(); }} className={`flex-1 py-2 text-sm rounded-md transition-colors font-medium ${deactivateLabel === 'Reactivate' ? 'text-success hover:bg-success/10' : 'text-error hover:bg-error/10'}`}>{deactivateLabel}</button>
          </div>
        )}
      </div>
    </CardWrapper>
  );
};
