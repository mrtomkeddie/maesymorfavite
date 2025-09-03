import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  onClick?: () => void;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export function MobileNavigation({ 
  items, 
  title, 
  className,
  children 
}: MobileNavigationProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "lg:hidden h-9 w-9",
            className
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-left">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="mt-6 flex flex-col space-y-2">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant={item.isActive ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start h-12 px-4",
                    item.isActive && "bg-secondary"
                  )}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.href) {
                      window.location.href = item.href;
                    }
                    setOpen(false);
                  }}
                >
                  {Icon && <Icon className="mr-3 h-5 w-5" />}
                  {item.title}
                </Button>
              );
            })}
          </div>
        </div>
        {children && (
          <div className="mt-auto pt-6 border-t flex-shrink-0">
            {children}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}