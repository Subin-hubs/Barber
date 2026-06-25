import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SlotPicker = ({ selectedDate, onDateSelect, selectedTime, onTimeSelect, availableSlots }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Dummy calendar logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = new Date();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = date.getDay() === 0;
      const isDisabled = isPast || isSunday;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <button
          key={i}
          disabled={isDisabled}
          onClick={() => onDateSelect(date)}
          className={cn(
            "h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
            isDisabled && "text-text-muted cursor-not-allowed",
            isPast && "line-through",
            !isDisabled && !isSelected && !isToday && "hover:bg-muted text-text-primary",
            isToday && !isSelected && !isDisabled && "bg-gold-light text-navy font-bold",
            isSelected && "bg-navy text-white"
          )}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-navy font-bold">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded-md text-text-secondary">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded-md text-text-secondary">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-text-muted py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const renderSlots = () => {
    if (!selectedDate) {
      return (
        <div className="h-full flex items-center justify-center text-text-muted text-sm italic">
          Please select a date first
        </div>
      );
    }

    const morningSlots = availableSlots.filter(s => parseInt(s.time.split(':')[0]) < 12);
    const afternoonSlots = availableSlots.filter(s => parseInt(s.time.split(':')[0]) >= 12);

    const renderSlotSection = (title, slots) => (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-text-secondary mb-3">{title}</h4>
        {slots.length === 0 ? (
          <p className="text-sm text-text-muted italic">No slots available</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map(slot => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => onTimeSelect(slot.time)}
                className={cn(
                  "py-2 rounded-lg text-sm font-medium border transition-colors",
                  !slot.available && "bg-muted border-transparent text-text-muted line-through cursor-not-allowed",
                  slot.available && selectedTime !== slot.time && "bg-white border-border text-text-primary hover:bg-gold-light hover:border-gold hover:text-navy",
                  selectedTime === slot.time && "bg-navy border-navy text-white"
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div className="w-full">
        {renderSlotSection('Morning', morningSlots)}
        {renderSlotSection('Afternoon', afternoonSlots)}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <div className="flex-1">
        {renderCalendar()}
      </div>
      <div className="hidden md:block w-px bg-border"></div>
      <div className="flex-1">
        {renderSlots()}
      </div>
    </div>
  );
};
