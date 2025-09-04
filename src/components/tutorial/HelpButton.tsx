

import React, { useState } from 'react';
import { useTutorial, Tutorial } from '../../contexts/TutorialProvider';
import { useLanguage } from '../../contexts/LanguageProvider';
import { HelpCircle, Play, CheckCircle, Settings, X } from 'lucide-react';

type HelpButtonProps = {
  tutorials: Tutorial[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
};

export function HelpButton({ 
  tutorials, 
  position = 'bottom-right',
  className = '' 
}: HelpButtonProps) {
  const { 
    startTutorial, 
    isTutorialCompleted, 
    showHelpButtons,
    setShowHelpButtons 
  } = useTutorial();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const texts = {
    en: {
      help: 'Help & Tutorials',
      startTutorial: 'Start Tutorial',
      completed: 'Completed',
      noTutorials: 'No tutorials available for this page.',
      hideHelp: 'Hide help buttons',
      showHelp: 'Show help buttons',
      settings: 'Tutorial Settings'
    },
    cy: {
      help: 'Cymorth a Thiwtorialau',
      startTutorial: 'Dechrau Tiwtorial',
      completed: 'Wedi Cwblhau',
      noTutorials: 'Dim tiwtorialau ar gael ar gyfer y dudalen hon.',
      hideHelp: 'Cuddio botymau cymorth',
      showHelp: 'Dangos botymau cymorth',
      settings: 'Gosodiadau Tiwtorial'
    }
  };

  const t = texts[language];

  if (!showHelpButtons) {
    return (
      <button
        onClick={() => setShowHelpButtons(true)}
        className={`fixed z-30 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full shadow-lg transition-all duration-200 opacity-50 hover:opacity-100 ${
          position === 'bottom-right' ? 'bottom-4 right-4' :
          position === 'bottom-left' ? 'bottom-4 left-4' :
          position === 'top-right' ? 'top-4 right-4' :
          'top-4 left-4'
        } ${className}`}
        title={t.showHelp}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    );
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4', 
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const dropdownPositionClasses = {
    'bottom-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'bottom-full left-0 mb-2',
    'top-right': 'top-full right-0 mt-2',
    'top-left': 'top-full left-0 mt-2'
  };

  return (
    <div className={`fixed z-30 ${positionClasses[position]} ${className}`}>
      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className={`absolute z-20 ${dropdownPositionClasses[position]} w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t.help}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowHelpButtons(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={t.hideHelp}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Tutorial list */}
            <div className="space-y-2">
              {tutorials.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  {t.noTutorials}
                </p>
              ) : (
                tutorials.map((tutorial) => {
                  const isCompleted = isTutorialCompleted(tutorial.id);
                  
                  return (
                    <div
                      key={tutorial.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {tutorial.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {tutorial.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {tutorial.steps.length} steps
                            </span>
                            {isCompleted && (
                              <div className="flex items-center space-x-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span className="text-xs">{t.completed}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            startTutorial(tutorial);
                            setIsOpen(false);
                          }}
                          className={`ml-3 flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            isCompleted 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>{t.startTutorial}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Footer */}
            {tutorials.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to close tutorials
                </p>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Help button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
          isOpen ? 'ring-4 ring-red-200' : ''
        }`}
        title={t.help}
      >
        <HelpCircle className="w-6 h-6" />
      </button>
      
      {/* Notification badge for available tutorials */}
      {tutorials.length > 0 && tutorials.some(t => !isTutorialCompleted(t.id)) && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}
