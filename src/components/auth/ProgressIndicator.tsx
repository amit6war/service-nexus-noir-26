
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 <= currentStep
                  ? 'bg-teal text-white'
                  : 'bg-secondary border border-border text-muted-foreground'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {index + 1}
            </motion.div>
            {index < totalSteps - 1 && (
              <motion.div
                className={`flex-1 h-0.5 mx-4 ${
                  index + 1 < currentStep ? 'bg-teal' : 'bg-border'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: index + 1 < currentStep ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
};

export default ProgressIndicator;
