

'use client';

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
  SidebarSeparator,
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
  LogOut,
  Loader2,
  Send,
  Award,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useLanguage } from '../(public)/LanguageProvider';
import { supabase, getUserRole } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { LanguageToggle } from '../(portal)/layout';

const content = {
  en: {
    title: 'Teacher Portal',
    menu: {
      dashboard: 'My Class',
      outbox: 'Sent Messages',
      values: 'Values Award',
    },
    account: {
        title: 'My Account',
        role: 'Teacher',
        logout: 'Logout'
    }
  },
  cy: {
    title: 'Porth Athrawon',
    menu: {
      dashboard: 'Fy Nosbarth',
      outbox: 'Negeseuon a Anfonwyd',
      values: 'Gwobr Gwerthoedd',
    },
     account: {
        title: 'Fy Nghyfrif',
        role: 'Athro/Athrawes',
        logout: 'Allgofnodi'
    }
  }
};


export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const t = content[language];
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


  useEffect(() => {
    if (!isSupabaseConfigured) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userRole = localStorage.getItem('userRole');
        if (isAuthenticated && userRole === 'teacher') {
            setSession({ user: { id: `${userRole}-1` } } as Session);
        } else {
             if (pathname !== '/teacher/login') {
                router.replace('/teacher/login');
             }
        }
        setIsLoading(false);
        return;
    }
    
    const getSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const role = await getUserRole(session.user.id);
        if (role === 'teacher') {
          setSession(session);
        } else {
          await supabase.auth.signOut();
          router.replace('/teacher/login');
        }
      } else {
         if (pathname !== '/teacher/login') {
            router.replace('/teacher/login');
         }
      }
      setIsLoading(false);
    };

    getSessionAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === 'SIGNED_OUT') {
          router.replace('/teacher/login');
        } else if (newSession) {
           getSessionAndRole();
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname, isSupabaseConfigured]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
        await supabase.auth.signOut();
    }
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { href: '/teacher/dashboard', label: t.menu.dashboard, icon: LayoutDashboard },
    { href: '/teacher/outbox', label: t.menu.outbox, icon: Send },
    { href: '/teacher/values-award', label: t.menu.values, icon: Award },
  ];
  
  if (pathname.startsWith('/teacher/login')) {
    return <>{children}</>;
  }

  if (isLoading || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
      <SidebarProvider>
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b p-4">
            <Link href="/teacher/dashboard" className="flex items-center gap-2">
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
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <div className="flex w-full cursor-pointer items-center gap-3 p-2 transition-colors group-data-[collapsible=icon]:justify-center hover:bg-muted rounded-md">
                        <Avatar className="size-8">
                            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person avatar" />
                            <AvatarFallback>T</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden flex-grow text-left">
                            <span className="font-semibold">{session.user?.email || 'Teacher'}</span>
                            <span className="text-muted-foreground">{t.account.role}</span>
                        </div>
                        <ChevronUp className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </div>
                </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-[calc(var(--sidebar-width)_-_1rem)] mb-2" side="top" align="center">
                    <DropdownMenuLabel>{t.account.title}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t.account.logout}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="p-4 md:p-6 lg:p-8">
             <div className="flex justify-between items-center mb-4">
                 <div className="lg:hidden">
                    <SidebarTrigger />
                 </div>
                <div className="ml-auto">
                    <LanguageToggle />
                </div>
            </div>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
