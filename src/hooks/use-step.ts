import { useCallback, useState } from "react";

interface StepActions {
    canGoToNextStep: boolean;
    canGoToPreviousStep: boolean;
    nextStep: () => void;
    previousStep: () => void;
    reset: () => void;
    setStep: (step: number) => void;
}

export function useStep(maxSteps: number): [number, StepActions] {
    const [step, setCurrentStep] = useState(1);

    const canGoToNextStep = step < maxSteps;
    const canGoToPreviousStep = step > 1;

    const nextStep = useCallback(() => {
        setCurrentStep(prev => Math.min(prev + 1, maxSteps));
    }, [maxSteps]);

    const previousStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }, []);

    const reset = useCallback(() => {
        setCurrentStep(1);
    }, []);

    const setStep = useCallback((step: number) => {
        if (step < 1 || step > maxSteps) return;
        setCurrentStep(step);
    }, [maxSteps]);

    return [step, { canGoToNextStep, canGoToPreviousStep, nextStep, previousStep, reset, setStep }];
}
