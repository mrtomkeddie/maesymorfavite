
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Utensils, ArrowRight, UserCheck, Percent, Calendar as CalendarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { calendarEvents } from '@/lib/mockCalendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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

const parentChildrenYearGroups = parentChildren.map(c => c.yearGroup);


export default function DashboardPage() {
  const nextEvent = calendarEvents.find(e => new Date(e.start) > new Date());
  
  const relevantEvents = calendarEvents.filter(event => {
      if (new Date(event.start) < new Date()) return false; // Event must be in the future
      if (!event.relevantTo || event.relevantTo.includes('All')) return true; // Include 'All' events
      return parentChildrenYearGroups.some(year => event.relevantTo?.includes(year as any)); // Include if relevant to child's year
  }).slice(0, 3); // Get the next 3 events

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

            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span>Upcoming Events for Your Children</span>
                </CardTitle>
                <CardDescription>Key dates and events relevant to your children's year groups.</CardDescription>
                </CardHeader>
                <CardContent>
                    {relevantEvents.length > 0 ? (
                        <div className="space-y-4">
                            {relevantEvents.map((event) => (
                            <Link href={`/calendar`} key={event.id} className="block p-4 rounded-lg border transition-colors hover:bg-secondary">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{event.title_en}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {format(new Date(event.start), 'eeee, dd MMMM yyyy')}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        {event.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                                {event.description_en && (
                                    <p className="text-sm text-foreground/80 mt-2 line-clamp-2">
                                        {event.description_en}
                                    </p>
                                )}
                            </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground p-4 text-center">No upcoming events specifically for your children.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start">
                <Link href="/absence"><ClipboardCheck className="mr-2 h-4 w-4" /> Report an Absence</Link>
              </Button>
               <Button asChild variant="secondary" className="w-full justify-start">
                <Link href="#"><Utensils className="mr-2 h-4 w-4" /> View Lunch Menu</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
