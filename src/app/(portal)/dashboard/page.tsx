
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Utensils, ArrowRight, UserCheck, Percent, Pizza, Salad, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { parentChildren } from '@/lib/mockData';
import { useEffect, useState } from 'react';
import { getWeeklyMenu } from '@/lib/firebase/firestore';
import type { DailyMenu, WeeklyMenu } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LanguageToggle } from '../layout';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export default function DashboardPage() {
  const [todayMenu, setTodayMenu] = useState<DailyMenu | null>(null);
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const fullMenu = await getWeeklyMenu();
        if (fullMenu) {
            setWeeklyMenu(fullMenu);
            const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
            const currentDayMenu = fullMenu[today] || { main: 'Not available today', alt: 'Not available today', dessert: 'Not available today' };
            setTodayMenu(currentDayMenu);
        } else {
             setTodayMenu({ main: 'Not available', alt: 'Not available', dessert: 'Not available' });
        }
      } catch (error) {
        console.error("Failed to fetch lunch menu", error);
        setTodayMenu({ main: 'Not available', alt: 'Not available', dessert: 'Not available' });
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);
 
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome back, Jane!</h1>
          <p className="text-muted-foreground">Here's what's happening at Maes Y Morfa today.</p>
        </div>
        <LanguageToggle />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Children</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {parentChildren.map(child => (
                        <div key={child.id} className="flex items-center gap-4 rounded-lg border p-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={child.avatar.src} data-ai-hint={child.avatar.aiHint} />
                                <AvatarFallback>{child.avatar.fallback}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-bold text-lg">{child.name}</h3>
                                    <p className="text-sm text-muted-foreground">{child.yearGroup}</p>
                                </div>
                                <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-sm">
                                        <Percent className="h-4 w-4 text-primary" />
                                        <span>Attendance: <strong>{child.attendance}</strong></span>
                                     </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <UserCheck className="h-4 w-4 text-primary" />
                                        <span>Teacher: <strong>{child.teacher}</strong></span>
                                     </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full justify-start">
                <Link href="/absence"><ClipboardCheck className="mr-2 h-4 w-4" /> Report an Absence</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    <span>Today's Lunch</span>
                </CardTitle>
                <CardDescription>A sample of what's on the menu today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingMenu ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                      <Pizza className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                          <h4 className="font-semibold text-sm">Main</h4>
                          <p className="text-sm text-muted-foreground">{todayMenu?.main}</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-3">
                      <Salad className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                          <h4 className="font-semibold text-sm">Vegetarian / Alt</h4>
                          <p className="text-sm text-muted-foreground">{todayMenu?.alt}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mt-0.5 shrink-0 h-5 w-5"><path d="M11 15.54c-2.31-1.39-3-4.24-3-6.54C8 5.42 9.79 3 12 3s4 2.42 4 6c0 2.3-1.02 5.15-3 6.54"/><path d="M12 21a6.5 6.5 0 0 0 6.5-6.5H12v6.5Z"/><path d="M12 21a6.5 6.5 0 0 1-6.5-6.5H12v6.5Z"/><path d="M12 3v18"/></svg>
                      <div>
                          <h4 className="font-semibold text-sm">Dessert</h4>
                          <p className="text-sm text-muted-foreground">{todayMenu?.dessert}</p>
                      </div>
                  </div>
                </>
              )}
                <div className="pt-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="w-full justify-start">
                                <Utensils className="mr-2 h-4 w-4" /> View Full Menu
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>This Week's Lunch Menu</DialogTitle>
                                <DialogDescription>
                                    Here's what's on offer for lunch this week at Maes Y Morfa.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="pt-4">
                                {isLoadingMenu ? (
                                    <div className="flex justify-center items-center h-48">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Day</TableHead>
                                                <TableHead>Main Course</TableHead>
                                                <TableHead>Vegetarian / Alt</TableHead>
                                                <TableHead>Dessert</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {days.map(day => (
                                                <TableRow key={day}>
                                                    <TableCell className="font-medium capitalize">{day}</TableCell>
                                                    <TableCell>{weeklyMenu?.[day]?.main || 'N/A'}</TableCell>
                                                    <TableCell>{weeklyMenu?.[day]?.alt || 'N/A'}</TableCell>
                                                    <TableCell>{weeklyMenu?.[day]?.dessert || 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
