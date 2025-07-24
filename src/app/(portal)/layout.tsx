
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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageProvider } from '../(public)/LanguageProvider';
import Image from 'next/image';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // We check for 'parent_auth' specifically for this layout.
    const authStatus = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('userRole') === 'parent';
    setIsAuth(authStatus);
    if (!authStatus) {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/gallery', label: 'Photo Gallery', icon: Camera },
    { href: '/absence', label: 'Report Absence', icon: ClipboardCheck },
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
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Maes Y Morfa logo" width={28} height={28} className="w-7 h-7" />
              <span className="text-lg font-extrabold tracking-tighter text-foreground group-data-[collapsible=icon]:hidden">
                Parent Portal
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
                <div className="flex w-full cursor-pointer items-center gap-3 p-2 transition-colors hover:bg-secondary rounded-md group-data-[collapsible=icon]:justify-center">
                    <Avatar className="size-8">
                        <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person avatar" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden flex-grow">
                        <span className="font-semibold">Jane Doe</span>
                        <span className="text-muted-foreground">Parent</span>
                    </div>
                     <ChevronUp className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56 mb-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    </LanguageProvider>
  );
}
