
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
import { getLunchMenu } from '@/lib/firebase/firestore';
import type { DailyMenu } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const lunchMenu = await getLunchMenu();
        setMenu(lunchMenu);
      } catch (error) {
        console.error("Failed to fetch lunch menu", error);
        // Set a default or empty menu to avoid breaking the UI
        setMenu({ main: 'Not available', alt: 'Not available', dessert: 'Not available' });
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);
 
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, Jane!</h1>
        <p className="text-muted-foreground">Here's what's happening at Maes Y Morfa today.</p>
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
                          <p className="text-sm text-muted-foreground">{menu?.main}</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-3">
                      <Salad className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                          <h4 className="font-semibold text-sm">Vegetarian / Alt</h4>
                          <p className="text-sm text-muted-foreground">{menu?.alt}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mt-0.5 shrink-0 h-5 w-5"><path d="M11 15.54c-2.31-1.39-3-4.24-3-6.54C8 5.42 9.79 3 12 3s4 2.42 4 6c0 2.3-1.02 5.15-3 6.54"/><path d="M12 21a6.5 6.5 0 0 0 6.5-6.5H12v6.5Z"/><path d="M12 21a6.5 6.5 0 0 1-6.5-6.5H12v6.5Z"/><path d="M12 3v18"/></svg>
                      <div>
                          <h4 className="font-semibold text-sm">Dessert</h4>
                          <p className="text-sm text-muted-foreground">{menu?.dessert}</p>
                      </div>
                  </div>
                </>
              )}
                <div className="pt-2">
                     <Button asChild variant="secondary" className="w-full justify-start">
                        <Link href="/key-info"><Utensils className="mr-2 h-4 w-4" /> View Full Menu</Link>
                    </Button>
                </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
