import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { MobileNavigation, NavigationItem } from './MobileNavigation';
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
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
  Newspaper,
  Calendar,
  Users,
  FileText,
  LogOut,
  Users2,
  BookUser,
  Settings,
  Mail,
  Camera,
  Utensils,
  ChevronUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useAuth } from '@/contexts/AuthProvider';

// Lightweight language toggle for the admin header (mirrors Portal/Teacher)
const AdminLanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const labels = { en: { cy: 'Cymraeg', en: 'English' }, cy: { cy: 'Cymraeg', en: 'English' } } as const;
  const t = labels[language as 'en' | 'cy'];
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
    title: 'Admin Portal',
    menu: {
      dashboard: 'Dashboard',
      inbox: 'Inbox',
    },
    groups: {
      content: 'Content',
      users: 'Users',
      system: 'System',
    },
    contentManagement: {
      news: 'News & Alerts',
      calendar: 'Calendar',
      staff: 'Staff',
      gallery: 'Photo Gallery',
      documents: 'Documents',
      menu: 'Lunch Menu',
    },
    userManagement: {
      parents: 'Parents',
      children: 'Children',
      allUsers: 'All Users',
    },
    settings: {
      site: 'Site Settings',
      lifecycle: 'Content Lifecycle',
    },
    account: {
      title: 'My Account',
      role: 'Administrator',
      logout: 'Logout',
    },
  },
  cy: {
    title: 'Porth Gweinyddu',
    menu: {
      dashboard: 'Dangosfwrdd',
      inbox: 'Mewnflwch',
    },
    groups: {
      content: 'Cynnwys',
      users: 'Defnyddwyr',
      system: 'System',
    },
    contentManagement: {
      news: 'Newyddion a Hysbysiadau',
      calendar: 'Calendr',
      staff: 'Staff',
      gallery: 'Oriel Ffotograffau',
      documents: 'Dogfennau',
      menu: 'Bwydlen Ginio',
    },
    userManagement: {
      parents: 'Rhieni',
      children: 'Plant',
      allUsers: 'Holl Ddefnyddwyr',
    },
    settings: {
      site: 'Gosodiadau Gwefan',
      lifecycle: 'Cylchred Bywyd Cynnwys',
    },
    account: {
      title: 'Fy Nghyfrif',
      role: 'Gweinyddwr',
      logout: 'Allgofnodi',
    },
  },
} as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { language } = useLanguage();
  const { userEmail } = useAuth();
  const t = content[language as 'en' | 'cy'];

  // Optional unread badge (can be wired later)
  const [unreadCount] = useState<number>(0);

  const menuItems = [
    { href: '/admin/dashboard', label: t.menu.dashboard, icon: LayoutDashboard },
    { href: '/admin/inbox', label: t.menu.inbox, icon: Mail, badge: unreadCount },
  ];

  const contentManagementItems = [
    { href: '/admin/news', label: t.contentManagement.news, icon: Newspaper },
    { href: '/admin/calendar', label: t.contentManagement.calendar, icon: Calendar },
    { href: '/admin/staff', label: t.contentManagement.staff, icon: Users },
    { href: '/admin/gallery', label: t.contentManagement.gallery, icon: Camera },
    { href: '/admin/documents', label: t.contentManagement.documents, icon: FileText },
    { href: '/admin/menu', label: t.contentManagement.menu, icon: Utensils },
  ];

  const userManagementItems = [
    { href: '/admin/parents', label: t.userManagement.parents, icon: Users2 },
    { href: '/admin/children', label: t.userManagement.children, icon: BookUser },
    { href: '/admin/users', label: t.userManagement.allUsers, icon: Users },
  ];

  const settingsItems = [
    { href: '/admin/settings', label: t.settings.site, icon: Settings },
    // removed lifecycle admin page link
  ];

  // Prepare navigation items for mobile menu
  const allNavigationItems: NavigationItem[] = [
    ...menuItems.map(item => ({
      title: item.label,
      href: item.href,
      icon: item.icon,
      isActive: location.pathname.startsWith(item.href)
    })),
    // Content Management section
    ...contentManagementItems.map(item => ({
      title: item.label,
      href: item.href,
      icon: item.icon,
      isActive: location.pathname.startsWith(item.href)
    })),
    // User Management section
    ...userManagementItems.map(item => ({
      title: item.label,
      href: item.href,
      icon: item.icon,
      isActive: location.pathname.startsWith(item.href)
    })),
    // Settings section
    ...settingsItems.map(item => ({
      title: item.label,
      href: item.href,
      icon: item.icon,
      isActive: location.pathname.startsWith(item.href)
    }))
  ];

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <Sidebar variant="sidebar" collapsible="icon" className="hidden lg:flex">
          <SidebarHeader className="border-b p-4">
            <Link to="/admin/dashboard" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>{t.groups.content}</SidebarGroupLabel>
                <SidebarGroupContent>
                  {contentManagementItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }}
                      >
                        <Link to={item.href} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>{t.groups.users}</SidebarGroupLabel>
                <SidebarGroupContent>
                  {userManagementItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }}
                      >
                        <Link to={item.href} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>{t.groups.system}</SidebarGroupLabel>
                <SidebarGroupContent>
                  {settingsItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }}
                      >
                        <Link to={item.href} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border/50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
                <Avatar className="size-9 ring-2 ring-background shadow-sm">
                  <AvatarImage src="https://placehold.co/40x40.png" />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden flex-grow min-w-0">
                  <span className="font-semibold text-foreground truncate">{userEmail || 'admin@example.com'}</span>
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
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">AD</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold text-foreground">{userEmail || 'admin@example.com'}</span>
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
                <AdminLanguageToggle />
              </div>
            </div>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <TutorialOverlay />
    </>
  );
}