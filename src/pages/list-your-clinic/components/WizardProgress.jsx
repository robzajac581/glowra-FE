import React from 'react';
import { cn } from '../../../utils/cn';

const WizardProgress = ({ currentStep, totalSteps = 6 }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="wizard-progress mb-8">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all',
                  {
                    'bg-primary text-white': currentStep >= index,
                    'bg-gray-200 text-gray-500': currentStep < index
                  }
                )}
              >
                {step}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-1 w-12 transition-all',
                  {
                    'bg-primary': currentStep > index,
                    'bg-gray-200': currentStep <= index
                  }
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center mt-3 text-sm text-text">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
};

export default WizardProgress;

