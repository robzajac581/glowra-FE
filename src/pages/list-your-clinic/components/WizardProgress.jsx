import React from 'react';
import { cn } from '../../../utils/cn';

const WizardProgress = ({ currentStep, totalSteps = 6, isExistingFlow = false }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  // Step labels based on flow type
  const getStepLabel = (stepNum) => {
    if (isExistingFlow) {
      // add_to_existing flow: Search → Clinic Info → Providers → Procedures → Photos → Review
      const labels = ['Search', 'Clinic Info', 'Providers', 'Procedures', 'Photos', 'Review'];
      return labels[stepNum - 1] || '';
    } else {
      // new_clinic flow: Clinic Info → Providers → Procedures → Photos → Review
      const labels = ['Clinic Info', 'Providers', 'Procedures', 'Photos', 'Review'];
      return labels[stepNum - 1] || '';
    }
  };

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
                    'bg-primary text-white': currentStep >= step,
                    'bg-gray-200 text-gray-500': currentStep < step
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
                    'bg-primary': currentStep > step,
                    'bg-gray-200': currentStep <= step
                  }
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center mt-3 text-sm text-text">
        Step {currentStep} of {totalSteps}: {getStepLabel(currentStep)}
      </div>
    </div>
  );
};

export default WizardProgress;

