import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageProvider';

interface FloatingActionButtonProps {
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16'
};

const iconSizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7'
};

export function FloatingActionButton({
  href,
  onClick,
  icon: Icon = Plus,
  className,
  variant = 'primary',
  size = 'md',
  children
}: FloatingActionButtonProps) {
  const baseClasses = cn(
    'fab rounded-full shadow-lg hover:shadow-xl transition-all duration-200',
    'flex items-center justify-center',
    'mobile-button touch-target',
    'focus:outline-none focus:ring-4 focus:ring-offset-2',
    sizeClasses[size],
    variant === 'primary' && [
      'bg-red-600 hover:bg-red-700 text-white',
      'focus:ring-red-500'
    ],
    variant === 'secondary' && [
      'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
      'focus:ring-gray-500'
    ],
    className
  );

  const content = (
    <>
      <Icon className={iconSizeClasses[size]} />
      {children && (
        <span className="sr-only">{children}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
}

// Specialized FAB for reporting absence
export function ReportAbsenceFAB() {
  const { language } = useLanguage();
  
  const labels = {
    en: 'Report Absence',
    cy: 'Riportio Absenoldeb'
  };

  return (
    <FloatingActionButton
      href="/portal/absence"
      icon={UserX}
      className="md:hidden"
      size="lg"
    >
      {labels[language]}
    </FloatingActionButton>
  );
}

export default FloatingActionButton;