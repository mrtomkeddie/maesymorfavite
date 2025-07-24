
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar,
  SidebarMenuBadge,
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
  Settings,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { getUnreadMessageCount } from '@/lib/firebase/firestore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // We check for 'admin_auth' specifically for this layout.
    const authStatus = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('userRole') === 'admin';
    setIsAuth(authStatus);
    if (!authStatus && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    if (isAuth) {
        getUnreadMessageCount().then(setUnreadCount).catch(console.error);
    }
  }, [isAuth, pathname]); // Refetch on path change to update badge

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    router.push('/admin/login');
  };

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/inbox', label: 'Inbox', icon: Mail, badge: unreadCount },
  ];

  const contentManagementItems = [
    { href: '/admin/news', label: 'News & Alerts', icon: Newspaper },
    { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
    { href: '/admin/staff', label: 'Staff', icon: Users },
    { href: '/admin/documents', label: 'Documents', icon: FileText },
  ];

  const userManagementItems = [
      { href: '/admin/parents', label: 'Parents', icon: Users2 },
      { href: '/admin/children', label: 'Children', icon: BookUser },
  ];
  
  const settingsItems = [
    { href: '/admin/settings', label: 'Site Settings', icon: Settings },
    // { href: '/admin/help', label: 'Help', icon: HelpCircle },
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
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Maes Y Morfa logo" width={28} height={28} className="w-7 h-7" />
              <span className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
                Admin Panel
              </span>
            </Link>
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
                            {item.badge && item.badge > 0 && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Content</SidebarGroupLabel>
                <SidebarGroupContent>
                    {contentManagementItems.map((item) => (
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
                <SidebarSeparator />
                 <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        {settingsItems.map((item) => (
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
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
