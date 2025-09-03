import { ReactNode, useState } from 'react';
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
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, ChevronUp, Send, Award, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { MobileNavigation, NavigationItem } from './MobileNavigation';

// Local language toggle (mirrors PortalLayout styling/behavior)
const TeacherLanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const labels = { en: { cy: 'Cymraeg', en: 'English' }, cy: { cy: 'Cymraeg', en: 'English' } } as const;
  const t = labels[language];
  return (
    <div className="flex items-center gap-1 border rounded-full p-1 text-sm bg-background">
      <Button
        variant={language === 'cy' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-full px-3 py-1 h-auto text-xs ${language === 'cy' ? 'bg-accent hover:bg-accent/80 text-accent-foreground' : ''}`}
        onClick={() => setLanguage('cy')}
      >
        {t.cy}
      </Button>
      <div className="w-px h-4 bg-border" />
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-full px-3 py-1 h-auto text-xs ${language === 'en' ? 'bg-accent hover:bg-accent/80 text-accent-foreground' : ''}`}
        onClick={() => setLanguage('en')}
      >
        {t.en}
      </Button>
    </div>
  );
};

const content = {
  en: {
    title: 'Teacher Portal',
    menu: {
      dashboard: 'My Class',
      outbox: 'Sent Messages',
      values: 'Values Award',
      gallery: 'Photo Gallery',
    },
    account: {
      title: 'My Account',
      role: 'Teacher',
      logout: 'Logout',
    },
  },
  cy: {
    title: 'Porth Athrawon',
    menu: {
      dashboard: 'Fy Nosbarth',
      outbox: 'Negeseuon a Anfonwyd',
      values: 'Gwobr Gwerthoedd',
      gallery: 'Oriel Lluniau',
    },
    account: {
      title: 'Fy Nghyfrif',
      role: 'Athro/Athrawes',
      logout: 'Allgofnodi',
    },
  },
};

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { language } = useLanguage();
  const { userEmail } = useAuth();
  const t = content[language as 'en' | 'cy'];

  const menuItems = [
    { href: '/teacher/dashboard', label: t.menu.dashboard, icon: LayoutDashboard },
    { href: '/teacher/outbox', label: t.menu.outbox, icon: Send },
    { href: '/teacher/values-award', label: t.menu.values, icon: Award },
    { href: '/teacher/gallery', label: t.menu.gallery, icon: Camera },
  ];

  // Prepare navigation items for mobile menu
  const allNavigationItems: NavigationItem[] = menuItems.map(item => ({
    title: item.label,
    href: item.href,
    icon: item.icon,
    isActive: location.pathname.startsWith(item.href)
  }));

  // local unused state kept for parity with PortalLayout if we later wire badges
  const [_unreadCount] = useState<number>(0);

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="hidden lg:flex">
        <SidebarHeader className="border-b p-4">
          <Link to="/teacher/dashboard" className="flex items-center gap-2">
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
                  <Link to={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
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
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person avatar" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">T</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden flex-grow min-w-0">
                <span className="font-semibold text-foreground truncate">{userEmail || 'Teacher'}</span>
                <span className="text-muted-foreground text-xs font-medium">{t.account.role}</span>
              </div>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 border border-transparent hover:border-destructive/20"
            >
              <Link to="/logout" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden font-medium">{t.account.logout}</span>
              </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="p-4 md:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <MobileNavigation 
                  items={allNavigationItems}
                  title={t.title}
                >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Avatar className="size-9">
                      <AvatarImage src="https://placehold.co/40x40.png" />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">T</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-foreground">{userEmail || 'Teacher'}</span>
                      <span className="text-muted-foreground text-xs font-medium">{t.account.role}</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Link to="/logout" className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">{t.account.logout}</span>
                    </Link>
                  </Button>
                </div>
              </MobileNavigation>
            </div>
            <div className="ml-auto">
              <TeacherLanguageToggle />
            </div>
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}