

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLanguage } from './LanguageProvider';

type TutorialStep = {
  id: string;
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  tip?: string;
  action?: 'click' | 'hover' | 'focus' | 'none';
};

type Tutorial = {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
};

type TutorialContextType = {
  // Current tutorial state
  activeTutorial: Tutorial | null;
  currentStep: number;
  isActive: boolean;
  
  // Tutorial management
  startTutorial: (tutorial: Tutorial) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  
  // Progress tracking
  completedTutorials: string[];
  markTutorialCompleted: (tutorialId: string) => void;
  isTutorialCompleted: (tutorialId: string) => boolean;
  
  // Settings
  showHelpButtons: boolean;
  setShowHelpButtons: (show: boolean) => void;
  autoStartForNewUsers: boolean;
  setAutoStartForNewUsers: (auto: boolean) => void;
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const STORAGE_KEY = 'maesymorfa_tutorial_progress';

type TutorialProviderProps = {
  children: ReactNode;
};

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const [showHelpButtons, setShowHelpButtons] = useState(true);
  const [autoStartForNewUsers, setAutoStartForNewUsers] = useState(true);

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCompletedTutorials(data.completedTutorials || []);
        setShowHelpButtons(data.showHelpButtons ?? true);
        setAutoStartForNewUsers(data.autoStartForNewUsers ?? true);
      } catch (error) {
        console.warn('Failed to load tutorial progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    const data = {
      completedTutorials,
      showHelpButtons,
      autoStartForNewUsers,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [completedTutorials, showHelpButtons, autoStartForNewUsers]);

  const startTutorial = (tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (activeTutorial && currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    setActiveTutorial(null);
    setCurrentStep(0);
    setIsActive(false);
  };

  const completeTutorial = () => {
    if (activeTutorial) {
      markTutorialCompleted(activeTutorial.id);
    }
    setActiveTutorial(null);
    setCurrentStep(0);
    setIsActive(false);
  };

  const markTutorialCompleted = (tutorialId: string) => {
    setCompletedTutorials(prev => {
      if (!prev.includes(tutorialId)) {
        return [...prev, tutorialId];
      }
      return prev;
    });
  };

  const isTutorialCompleted = (tutorialId: string) => {
    return completedTutorials.includes(tutorialId);
  };

  const value: TutorialContextType = {
    activeTutorial,
    currentStep,
    isActive,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    completedTutorials,
    markTutorialCompleted,
    isTutorialCompleted,
    showHelpButtons,
    setShowHelpButtons,
    autoStartForNewUsers,
    setAutoStartForNewUsers,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

// Export types for use in other components
export type { Tutorial, TutorialStep };
