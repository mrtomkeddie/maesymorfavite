import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  LogOut,
  Camera,
  ChevronUp,
  Mail,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { BottomNavigation } from './BottomNavigation';

// Lightweight language toggle for the portal header (uses the existing context)
const PortalLanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const labels = { en: { cy: 'Cymraeg', en: 'English' }, cy: { cy: 'Cymraeg', en: 'English' } };
  const t = labels[language];
  return (
    <div className="flex items-center gap-1 border rounded-full p-1 text-sm bg-background">
      <Button
        variant={language === 'cy' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-full px-3 py-1 h-auto text-xs ${language === 'cy' ? 'bg-red-100 hover:bg-red-200 text-red-900' : ''}`}
        onClick={() => setLanguage('cy')}
      >
        {t.cy}
      </Button>
      <div className="w-px h-4 bg-border" />
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-full px-3 py-1 h-auto text-xs ${language === 'en' ? 'bg-red-100 hover:bg-red-200 text-red-900' : ''}`}
        onClick={() => setLanguage('en')}
      >
        {t.en}
      </Button>
    </div>
  );
};

const content = {
  en: {
    title: 'Parent Portal',
    menu: {
      dashboard: 'Dashboard',
      inbox: 'Inbox',
      calendar: 'Calendar',
      gallery: 'Photo Gallery',
      absence: 'Report Absence',
    },
    account: {
      title: 'My Account',
      logout: 'Logout',
      role: 'Parent',
    },
  },
  cy: {
    title: 'Porth Rieni',
    menu: {
      dashboard: 'Dangosfwrdd',
      inbox: 'Mewnflwch',
      calendar: 'Calendr',
      gallery: 'Oriel Ffotograffau',
      absence: 'Riportio Absenoldeb',
    },
    account: {
      title: 'Fy Nghyfrif',
      logout: 'Allgofnodi',
      role: 'Rhiant',
    },
  },
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { language } = useLanguage();
  const { userEmail } = useAuth();
  const t = content[language];

  // Optional unread badge (can be wired to data later)
  const [unreadCount] = useState<number>(0);

  // Menu definition
  const menuItems = [
    { href: '/dashboard', label: t.menu.dashboard, icon: LayoutDashboard },
    { href: '/inbox', label: t.menu.inbox, icon: Mail, badge: unreadCount },
    { href: '/calendar', label: t.menu.calendar, icon: Calendar },
    { href: '/gallery', label: t.menu.gallery, icon: Camera },
    { href: '/absence', label: t.menu.absence, icon: ClipboardCheck },
  ];

  // No need for mobile navigation items preparation anymore

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="hidden lg:flex">
        <SidebarHeader className="border-b p-4">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/icon.png" alt="School logo" width={28} height={28} className="w-7 h-7" />
            <span className="text-lg font-extrabold tracking-tighter text-foreground group-data-[collapsible=icon]:hidden">
              {t.title}
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="p-2">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <Link to={item.href} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3 border-t border-border/50">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
              <Avatar className="size-9 ring-2 ring-background shadow-sm">
                <AvatarImage src="https://placehold.co/40x40.png" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">PP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden flex-grow min-w-0">
                <span className="font-semibold text-foreground truncate">{userEmail || 'parent@example.com'}</span>
                <span className="text-muted-foreground text-xs font-medium">{t.account.role}</span>
              </div>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 border border-transparent hover:border-destructive/20"
            >
              <Link to="/logout" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden font-medium">{t.account.logout}</span>
              </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="flex justify-between items-center mb-4 md:hidden">
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src="https://placehold.co/40x40.png" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">PP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-foreground text-sm">{userEmail || 'parent@example.com'}</span>
                <span className="text-muted-foreground text-xs">{t.account.role}</span>
              </div>
            </div>
            <PortalLanguageToggle />
          </div>
          <div className="hidden md:flex justify-end items-center mb-4">
            <PortalLanguageToggle />
          </div>
          {children}
        </main>
        <BottomNavigation />
      </SidebarInset>
    </SidebarProvider>
  );
}