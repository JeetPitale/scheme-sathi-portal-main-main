import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [conversationalModalOpen, setConversationalModalOpen] = useState(false); // For language selection
    const { setLanguage } = useTranslation();

    useEffect(() => {
        const hasCompleted = localStorage.getItem('onboardingCompleted');
        if (!hasCompleted) {
            setConversationalModalOpen(true);
        }
    }, []);

    const startTour = (lang) => {
        setLanguage(lang);
        localStorage.setItem('preferredLanguage', lang);
        setConversationalModalOpen(false);
        setIsActive(true);
        setCurrentStep(0);
    };

    const nextStep = () => setCurrentStep((prev) => prev + 1);
    const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));

    const skipTour = () => {
        setIsActive(false);
        localStorage.setItem('onboardingCompleted', 'true');
    };

    const restartTour = () => {
        localStorage.removeItem('onboardingCompleted');
        setConversationalModalOpen(true);
        setCurrentStep(0);
        setIsActive(false);
    };

    const completeTour = () => {
        setIsActive(false);
        localStorage.setItem('onboardingCompleted', 'true');
    };

    return (
        <OnboardingContext.Provider value={{
            isActive,
            currentStep,
            startTour,
            nextStep,
            prevStep,
            skipTour,
            restartTour,
            completeTour,
            conversationalModalOpen,
            setIsActive
        }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
