
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Utensils, ArrowRight, UserCheck, Percent, Pizza, Salad } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


// In a real app, this would be fetched for the logged-in parent
const parentChildren = [
    { 
        id: 'child_1', 
        name: 'Charlie K.', 
        yearGroup: 'Year 2', 
        attendance: '98%', 
        teacher: 'Mr. Evans',
        avatar: {
            src: 'https://placehold.co/100x100.png',
            fallback: 'CK',
            aiHint: 'child portrait'
        }
    },
    { 
        id: 'child_2', 
        name: 'Sophie K.', 
        yearGroup: 'Year 5', 
        attendance: '99%', 
        teacher: 'Ms. Hughes',
        avatar: {
            src: 'https://placehold.co/100x100.png',
            fallback: 'SK',
            aiHint: 'child portrait smiling'
        }
    },
];

const todaysMenu = {
    main: "Shepherd's Pie",
    alt: "Jacket Potato with Tuna",
    dessert: "Apple Crumble & Custard"
}


export default function DashboardPage() {
 
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
                <div className="flex items-start gap-3">
                    <Pizza className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-sm">Main</h4>
                        <p className="text-sm text-muted-foreground">{todaysMenu.main}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Salad className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-sm">Vegetarian / Alt</h4>
                        <p className="text-sm text-muted-foreground">{todaysMenu.alt}</p>
                    </div>
                </div>
                <div className="pt-2">
                     <Button asChild variant="secondary" className="w-full justify-start">
                        <Link href="#"><Utensils className="mr-2 h-4 w-4" /> View Full Menu</Link>
                    </Button>
                </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
