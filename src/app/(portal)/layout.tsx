



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
  Loader2,
  Camera,
  ChevronUp,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '../(public)/LanguageProvider';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { supabase, getUserRole } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { db } from '@/lib/db';

export const LanguageToggle = () => {
    const { language, setLanguage } = useLanguage();
    const content = {
        en: { lang1: 'Cymraeg', lang2: 'English' },
        cy: { lang1: 'Cymraeg', lang2: 'English' }
    };
    const t = content[language];
    return (
        <div className="flex items-center gap-1 border rounded-full p-1 text-sm bg-background">
            <Button variant={language === 'cy' ? 'default' : 'ghost'} size="sm" className={`rounded-full px-3 py-1 h-auto text-xs portal-lang-toggle ${language === 'cy' ? 'bg-accent hover:bg-accent/80 text-accent-foreground' : ''}`} onClick={() => setLanguage('cy')}>{t.lang1}</Button>
            <div className="w-px h-4 bg-border"></div>
            <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" className={`rounded-full px-3 py-1 h-auto text-xs portal-lang-toggle ${language === 'en' ? 'bg-accent hover:bg-accent/80 text-accent-foreground' : ''}`} onClick={() => setLanguage('en')}>{t.lang2}</Button>
        </div>
    )
}

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
    }
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
    }
  }
};


export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { language } = useLanguage();
  const t = content[language];
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


  useEffect(() => {
    if (!isSupabaseConfigured) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
            setSession({ user: { id: 'parent-1' } } as Session);
        } else {
             router.replace('/login');
        }
        setIsLoading(false);
        return;
    }
    
    const getSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const role = await getUserRole(session.user.id);
        if (role === 'parent') {
          setSession(session);
        } else {
          // If logged in but not a parent, log out and redirect to parent login
          await supabase.auth.signOut();
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
      setIsLoading(false);
    };

    getSessionAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.replace('/login');
        } else if (session) {
          getSessionAndRole();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, isSupabaseConfigured]);
  
  useEffect(() => {
    if (session) {
      const userId = session.user.id;
      db.getUnreadMessageCount(userId, 'parent').then(setUnreadCount);
      // Optional: Set up a listener for real-time updates if using Supabase subscriptions
    }
  }, [session, pathname]);


  const handleLogout = async () => {
    if (isSupabaseConfigured) {
        await supabase.auth.signOut();
    }
    // For both Supabase and mock, clear local storage and redirect
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { href: '/dashboard', label: t.menu.dashboard, icon: LayoutDashboard },
    { href: '/inbox', label: t.menu.inbox, icon: Mail, badge: unreadCount },
    { href: '/calendar', label: t.menu.calendar, icon: Calendar },
    { href: '/gallery', label: t.menu.gallery, icon: Camera },
    { href: '/absence', label: t.menu.absence, icon: ClipboardCheck },
  ];
  
  if (isLoading || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
      <SidebarProvider>
        <Sidebar variant="sidebar" collapsible="none">
          <SidebarHeader className="border-b p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/icon.png" alt="School logo" width={28} height={28} className="w-7 h-7" />
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
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      ): null}
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
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden flex-grow min-w-0">
                  <span className="font-semibold text-foreground truncate">{session.user?.email || 'parent@example.com'}</span>
                  <span className="text-muted-foreground text-xs font-medium">{t.account.role}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 border border-transparent hover:border-destructive/20"
              >
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden font-medium">{t.account.logout}</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
           <main className="p-4 md:p-6 lg:p-8">
            <div className="lg:hidden mb-4">
                <SidebarTrigger />
            </div>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
