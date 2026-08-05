interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string }[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  // Calculate width for the connecting line
  const lineWidth = `${((currentStep) / (steps.length - 1)) * 100}%`;

  return (
    <div className="step-indicator">
      <div className="step-indicator__line" style={{ width: lineWidth }} />
      
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        let className = "step-item";
        if (isActive) className += " step-item--active";
        if (isCompleted) className += " step-item--completed";
        
        return (
          <div key={index} className={className}>
            <div className="step-item__circle">
              {isCompleted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <div className="step-item__label">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}
