import React from 'react';

// Step interface
interface Step {
  id: number;
  name: string;
  icon: string;
  description: string;
}

// Default steps for health profile creation
const defaultSteps: Step[] = [
  { id: 0, name: "Personal Info", icon: "1", description: "Basic information about you" },
  { id: 1, name: "Medical Condition", icon: "2", description: "Your health condition details" },
  { id: 2, name: "Symptoms", icon: "3", description: "Symptoms you experience" },
  { id: 3, name: "Diagnosis & Treatment", icon: "4", description: "Medical diagnosis and treatments" },
  { id: 4, name: "Review", icon: "5", description: "Review and submit your profile" }
];

// Props interface
interface ProgressIndicatorProps {
  currentStep: number;
  steps?: Step[];
  className?: string;
  onStepClick?: (stepIndex: number) => void;
}

// Progress Indicator Component
export default function ProgressIndicator({ 
  currentStep, 
  steps = defaultSteps, 
  className = "",
  onStepClick
}: ProgressIndicatorProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Step Circle */}
              <button
                onClick={() => onStepClick && onStepClick(index)}
                disabled={!onStepClick}
                className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full font-semibold text-sm transition-all duration-300
                  ${index <= currentStep 
                    ? 'bg-blue-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }
                  ${index === currentStep ? 'ring-4 ring-blue-200 ring-opacity-50' : ''}
                  ${onStepClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  disabled:cursor-default
                `}
              >
                <span className="text-lg font-bold">{step.icon}</span>
              </button>
              
              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <div className={`
                    h-full rounded transition-all duration-500 ease-in-out
                    ${index < currentStep ? 'bg-blue-500' : 'bg-gray-200'}
                  `} />
                </div>
              )}
            </div>
            
            {/* Step Label */}
            <div className="mt-3 text-center">
              <div className={`
                text-sm font-medium transition-colors duration-200
                ${index <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
              `}>
                {step.name}
              </div>
              <div className={`
                text-xs mt-1 transition-colors duration-200
                ${index === currentStep ? 'text-blue-500 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500'}
              `}>
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export the Step interface and default steps for use in other components
export type { Step };
export { defaultSteps };