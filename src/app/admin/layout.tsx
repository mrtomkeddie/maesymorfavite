
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
  Users,
  FileText,
  LogOut,
  Loader2,
  Users2,
  BookUser,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // We check for 'admin_auth' specifically for this layout.
    const authStatus = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('userRole') === 'admin';
    setIsAuth(authStatus);
    if (!authStatus && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    router.push('/admin/login');
  };

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/news', label: 'News & Alerts', icon: Newspaper },
    { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
    { href: '/admin/staff', label: 'Staff', icon: Users },
    { href: '/admin/documents', label: 'Documents', icon: FileText },
  ];

  const userManagementItems = [
      { href: '/admin/parents', label: 'Parents', icon: Users2 },
      { href: '/admin/children', label: 'Children', icon: BookUser },
  ];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
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
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Maes Y Morfa logo" width={28} height={28} className="w-7 h-7" />
              <span className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
                Admin Panel
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarGroup>
                <SidebarGroupLabel>Content</SidebarGroupLabel>
                <SidebarGroupContent>
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
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator />
               <SidebarGroup>
                <SidebarGroupLabel>Users</SidebarGroupLabel>
                 <SidebarGroupContent>
                    {userManagementItems.map((item) => (
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
                 </SidebarGroupContent>
               </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: 'Help & Instructions'}} asChild>
                    <Link href="/admin/help">
                        <HelpCircle />
                        <span>Help</span>
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
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold">Admin User</span>
                    <span className="text-muted-foreground">Administrator</span>
                </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 items-center justify-between border-b bg-background px-6 md:justify-end">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <h1 className="text-lg font-semibold md:hidden">Admin Panel</h1>
          </header>
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
