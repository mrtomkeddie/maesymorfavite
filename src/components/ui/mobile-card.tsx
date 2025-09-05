import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MobileCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'featured';
}

export function MobileCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  badge,
  badgeVariant = 'default',
  className,
  children,
  variant = 'default'
}: MobileCardProps) {
  const isInteractive = !!(href || onClick);
  
  const cardClasses = cn(
    'mobile-card touch-target',
    'transition-all duration-200 ease-in-out',
    isInteractive && [
      'cursor-pointer hover:shadow-md',
      'active:scale-[0.98] active:shadow-sm'
    ],
    variant === 'compact' && 'p-3',
    variant === 'featured' && 'border-2 border-red-100 bg-red-50/30',
    className
  );

  const content = (
    <Card className={cardClasses}>
      <CardHeader className={cn(
        'flex flex-row items-center justify-between space-y-0',
        variant === 'compact' ? 'pb-2' : 'pb-3'
      )}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {Icon && (
            <div className={cn(
              'flex items-center justify-center rounded-lg',
              variant === 'featured' 
                ? 'bg-red-100 text-red-600 p-2'
                : 'bg-muted text-muted-foreground p-2'
            )}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              'text-base font-semibold truncate',
              variant === 'compact' && 'text-sm'
            )}>
              {title}
            </CardTitle>
            {description && (
              <p className={cn(
                'text-sm text-muted-foreground mt-1 line-clamp-2',
                variant === 'compact' && 'text-xs'
              )}>
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {badge && (
            <Badge variant={badgeVariant} className="text-xs">
              {badge}
            </Badge>
          )}
          {isInteractive && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {children && (
        <CardContent className={variant === 'compact' ? 'pt-0' : 'pt-0'}>
          {children}
        </CardContent>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}

// Specialized cards for common dashboard items
export function QuickActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  className
}: Omit<MobileCardProps, 'variant'>) {
  return (
    <MobileCard
      title={title}
      description={description}
      icon={icon}
      href={href}
      onClick={onClick}
      variant="featured"
      className={className}
    />
  );
}

export function NotificationCard({
  title,
  description,
  badge,
  href,
  onClick,
  className
}: Omit<MobileCardProps, 'variant' | 'icon'>) {
  return (
    <MobileCard
      title={title}
      description={description}
      badge={badge}
      badgeVariant={badge ? 'destructive' : 'default'}
      href={href}
      onClick={onClick}
      variant="compact"
      className={className}
    />
  );
}

export function InfoCard({
  title,
  children,
  className
}: Pick<MobileCardProps, 'title' | 'children' | 'className'>) {
  return (
    <MobileCard
      title={title}
      variant="default"
      className={className}
    >
      {children}
    </MobileCard>
  );
}

export default MobileCard;