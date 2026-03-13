import { useRef, useEffect, useState } from 'react';
import { useOnboarding } from './OnboardingProvider';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { WALKTHROUGH_STEPS } from '@/lib/onboardingSteps';

const WalkthroughOverlay = () => {
    const { isActive, currentStep, nextStep, prevStep, skipTour, completeTour } = useOnboarding();
    const { t, language } = useTranslation();
    const [targetRect, setTargetRect] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const steps = WALKTHROUGH_STEPS[language] || WALKTHROUGH_STEPS['en'];
    const currentStepData = steps[currentStep];

    useEffect(() => {
        if (!isActive || !currentStepData) return;

        const updatePosition = () => {
            const element = document.getElementById(currentStepData.targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                // Calculate absolute position including scroll
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

                setTargetRect({
                    top: rect.top + scrollTop,
                    left: rect.left + scrollLeft,
                    width: rect.width,
                    height: rect.height
                });

                // Scroll to element if off-screen
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

                // Calculate tooltip position (prefer bottom, fallback to top)
                const tooltipTop = rect.bottom + 20 + scrollTop;
                // Basic overflow check
                setTooltipPosition({
                    top: tooltipTop,
                    left: Math.max(10, rect.left + scrollLeft) // Prevent left overflow
                });
            } else {
                // Skip step if element not found
                console.warn(`Target element ${currentStepData.targetId} not found, skipping.`);
                if (currentStep < steps.length - 1) {
                    nextStep();
                }
            }
        };

        // Initial update
        const timeout = setTimeout(updatePosition, 300); // Allow for transitions
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [isActive, currentStep, currentStepData]);

    if (!isActive || !currentStepData || !targetRect) return null;

    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Dimmed Background */}
            {/* We use a massive box-shadow on the highlight element to create the cutout effect simply */}

            {/* Highlight Box */}
            <div
                className="absolute transition-all duration-500 ease-in-out border-4 border-primary rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-none"
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                }}
            />

            {/* Tooltip */}
            <div
                className="absolute bg-card p-6 rounded-xl shadow-2xl border w-[90vw] max-w-sm pointer-events-auto transition-all duration-500 ease-in-out"
                style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left
                }}
            >
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                    <button onClick={skipTour} className="text-xs text-muted-foreground hover:text-foreground">
                        Skip
                    </button>
                </div>

                <h3 className="text-lg font-bold mb-2">{currentStepData.title}</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                    {currentStepData.description}
                </p>

                <div className="flex justify-between gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                    >
                        Back
                    </Button>
                    <Button
                        size="sm"
                        onClick={isLastStep ? completeTour : nextStep}
                    >
                        {isLastStep ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WalkthroughOverlay;
