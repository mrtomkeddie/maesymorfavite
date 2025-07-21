
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
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  ClipboardCheck,
  Swords,
  FolderOpen,
  Settings,
  LogOut,
  ShieldAlert,
  School,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageProvider } from '../(public)/LanguageProvider';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuth(authStatus);
    if (!authStatus) {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/news', label: 'News & Alerts', icon: Newspaper },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/absence', label: 'Report Absence', icon: ClipboardCheck },
    { href: '/clubs', label: 'Clubs & Permissions', icon: Swords },
    { href: '/documents', label: 'Document Vault', icon: FolderOpen },
  ];
  
  const adminMenuItems = [
    { href: '/admin/announcements', label: 'Announcements AI', icon: ShieldAlert },
  ];

  if (isAuth === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }
  
  return (
    <LanguageProvider>
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <School className="w-7 h-7 text-primary" />
              <span className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
                MorfaConnect
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
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
            
            <SidebarMenu className="mt-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">Admin Tools</p>
              {adminMenuItems.map((item) => (
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
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip={{ children: 'Settings' }}>
                  <Link href="#">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Logout' }}>
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-4 flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
                <Avatar className="size-8">
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold">Jane Doe</span>
                    <span className="text-muted-foreground">Parent</span>
                </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 items-center justify-between border-b bg-background px-6 md:justify-end">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <h1 className="text-lg font-semibold md:hidden">MorfaConnect</h1>
          </header>
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LanguageProvider>
  );
}
