import React from 'react';
import { cn } from '../../utils/cn';

export const StepIndicator = ({ currentStep, steps }) => {
  const progress = ((currentStep) / steps.length) * 100;

  return (
    <div className="w-full mb-8">
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gold transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-navy font-bold text-lg">
          Step {currentStep} of {steps.length}
        </div>
        <div className="text-text-secondary font-medium">
          {steps[currentStep - 1]}
        </div>
      </div>
    </div>
  );
};
