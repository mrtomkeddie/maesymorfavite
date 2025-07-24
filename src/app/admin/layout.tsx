
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
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const pageTitles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/news': 'News & Alerts',
    '/admin/calendar': 'Calendar Management',
    '/admin/staff': 'Staff Management',
    '/admin/documents': 'Document Management',
    '/admin/parents': 'Parent Management',
    '/admin/children': 'Child Management',
    '/admin/settings': 'Site Settings',
    '/admin/help': 'Help',
};


function SidebarAutoClose() {
  const { setOpen } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    // Close sidebar when pathname changes (navigation occurs)
    setOpen(false);
  }, [pathname, setOpen]);

  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined);

  const currentPageTitle = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || 'Admin Panel';

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
  
  const settingsItems = [
    { href: '/admin/settings', label: 'Site Settings', icon: Settings },
    { href: '/admin/help', label: 'Help', icon: HelpCircle },
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
        <SidebarAutoClose />
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
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <SidebarTrigger />
              </div>
              <h1 className="text-xl font-semibold">{currentPageTitle}</h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2" />
                  Create New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link href="/admin/news">News Post</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/admin/calendar">Calendar Event</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/admin/staff">Staff Member</Link></DropdownMenuItem>
                 <DropdownMenuItem asChild><Link href="/admin/documents">Document</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </header>
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
