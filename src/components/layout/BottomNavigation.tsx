import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Mail, Calendar, Image, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageProvider';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  labelEn: string;
  labelCy: string;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    icon: Home,
    labelEn: 'Home',
    labelCy: 'Cartref',
    path: '/portal/dashboard'
  },
  {
    id: 'inbox',
    icon: Mail,
    labelEn: 'Inbox',
    labelCy: 'Blwch Derbyn',
    path: '/portal/inbox'
  },
  {
    id: 'calendar',
    icon: Calendar,
    labelEn: 'Calendar',
    labelCy: 'Calendr',
    path: '/portal/calendar'
  },
  {
    id: 'gallery',
    icon: Image,
    labelEn: 'Gallery',
    labelCy: 'Oriel',
    path: '/portal/gallery'
  },
  {
    id: 'absence',
    icon: UserX,
    labelEn: 'Absence',
    labelCy: 'Absenoldeb',
    path: '/portal/absence'
  }
];

export function BottomNavigation() {
  const location = useLocation();
  const { language } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around px-2 py-1 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const label = language === 'cy' ? item.labelCy : item.labelEn;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 text-xs transition-colors duration-200',
                'active:scale-95 active:bg-gray-100 rounded-lg',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon 
                className={cn(
                  'w-6 h-6 mb-1 transition-colors duration-200',
                  isActive ? 'text-blue-600' : 'text-gray-600'
                )} 
              />
              <span 
                className={cn(
                  'truncate max-w-full transition-colors duration-200',
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-600'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;