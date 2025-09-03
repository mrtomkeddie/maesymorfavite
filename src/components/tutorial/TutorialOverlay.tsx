

import React, { useEffect, useState, useRef } from 'react';
import { useTutorial } from '../../contexts/TutorialProvider';
import { useLanguage } from '../../contexts/LanguageProvider';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

type Position = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function TutorialOverlay() {
  const { 
    activeTutorial, 
    currentStep, 
    isActive, 
    nextStep, 
    previousStep, 
    skipTutorial,
    completeTutorial 
  } = useTutorial();
  const { language } = useLanguage();
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [overlayPosition, setOverlayPosition] = useState<Position | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      skip: 'Skip Tutorial',
      previous: 'Previous',
      next: 'Next',
      finish: 'Finish',
      stepOf: 'Step {current} of {total}',
      tip: 'Tip:'
    },
    cy: {
      skip: 'Hepgor Tiwtorial',
      previous: 'Blaenorol',
      next: 'Nesaf',
      finish: 'Gorffen',
      stepOf: 'Cam {current} o {total}',
      tip: 'Awgrym:'
    }
  };

  const t = texts[language];

  // Calculate target element position and highlight it
  useEffect(() => {
    if (!isActive || !activeTutorial) {
      setTargetPosition(null);
      setOverlayPosition(null);
      return;
    }

    const currentStepData = activeTutorial.steps[currentStep];
    if (!currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) {
      console.warn(`Tutorial target not found: ${currentStepData.target}`);
      // Auto-advance to next step if the target is missing to avoid blocking the UI
      nextStep();
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    const position = {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };

    setTargetPosition(position);

    // Calculate overlay position based on preferred position
    const overlayElement = overlayRef.current;
    if (overlayElement) {
      const overlayRect = overlayElement.getBoundingClientRect();
      const preferredPosition = currentStepData.position || 'bottom';
      
      let overlayTop = position.top;
      let overlayLeft = position.left;

      switch (preferredPosition) {
        case 'top':
          overlayTop = position.top - overlayRect.height - 16;
          overlayLeft = position.left + (position.width / 2) - (overlayRect.width / 2);
          break;
        case 'bottom':
          overlayTop = position.top + position.height + 16;
          overlayLeft = position.left + (position.width / 2) - (overlayRect.width / 2);
          break;
        case 'left':
          overlayTop = position.top + (position.height / 2) - (overlayRect.height / 2);
          overlayLeft = position.left - overlayRect.width - 16;
          break;
        case 'right':
          overlayTop = position.top + (position.height / 2) - (overlayRect.height / 2);
          overlayLeft = position.left + position.width + 16;
          break;
      }

      // Ensure overlay stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (overlayLeft < 16) overlayLeft = 16;
      if (overlayLeft + overlayRect.width > viewportWidth - 16) {
        overlayLeft = viewportWidth - overlayRect.width - 16;
      }
      if (overlayTop < 16) overlayTop = 16;
      if (overlayTop + overlayRect.height > viewportHeight - 16) {
        overlayTop = viewportHeight - overlayRect.height - 16;
      }

      setOverlayPosition({
        top: overlayTop,
        left: overlayLeft,
        width: overlayRect.width,
        height: overlayRect.height
      });
    }

    // Scroll target into view if needed
    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    });
  }, [isActive, activeTutorial, currentStep]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          skipTutorial();
          break;
        case 'ArrowRight':
        case 'Enter':
          nextStep();
          break;
        case 'ArrowLeft':
          previousStep();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, previousStep, skipTutorial]);

  if (!isActive || !activeTutorial || !activeTutorial.steps[currentStep]) {
    return null;
  }

  const currentStepData = activeTutorial.steps[currentStep];
  const isLastStep = currentStep === activeTutorial.steps.length - 1;
  const stepText = t.stepOf
    .replace('{current}', (currentStep + 1).toString())
    .replace('{total}', activeTutorial.steps.length.toString());

  return (
    <>
      {/* Backdrop - only show when we have a valid target to avoid blocking the UI */}
      {targetPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}
      
      {/* Target highlight */}
      {targetPosition && (
        <div 
          className="fixed z-50 border-4 border-blue-500 rounded-lg shadow-lg animate-pulse"
          style={{
            top: targetPosition.top - 4,
            left: targetPosition.left - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Tutorial overlay */}
      <div 
        ref={overlayRef}
        className="fixed z-50 bg-white rounded-lg shadow-xl border max-w-sm p-6"
        style={overlayPosition ? {
          top: overlayPosition.top,
          left: overlayPosition.left
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-gray-600">
              {stepText}
            </span>
          </div>
          <button
            onClick={skipTutorial}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={t.skip}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-700 mb-3">
            {currentStepData.content}
          </p>
          {currentStepData.tip && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-medium">{t.tip}</span> {currentStepData.tip}
              </p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.previous}</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={skipTutorial}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              <span>{t.skip}</span>
            </button>
            
            <button
              onClick={isLastStep ? completeTutorial : nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>{isLastStep ? t.finish : t.next}</span>
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex space-x-1">
            {activeTutorial.steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
