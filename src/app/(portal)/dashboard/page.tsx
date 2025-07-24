
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Bell, FileText, ArrowRight, Calendar, ClipboardCheck, Utensils, Percent, UserCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { news as mockNews } from '@/lib/mockNews';
import { calendarEvents } from '@/lib/mockCalendar';

export default function DashboardPage() {
  const notices = mockNews.filter(n => n.published).slice(0, 3);
  const nextEvent = calendarEvents.find(e => new Date(e.start) > new Date());

  const keyDocuments = [
      { title: 'Term Dates 2024-25.pdf', href: '#' },
      { title: 'Lunch Menu - Summer.pdf', href: '#' },
      { title: 'Uniform Policy.pdf', href: '#' },
  ]

  const newsletters = [
    { title: 'June 2024 Edition', image: 'https://placehold.co/300x400.png', imageHint: 'newsletter cover' },
    { title: 'May 2024 Edition', image: 'https://placehold.co/300x400.png', imageHint: 'document cover' },
    { title: 'April 2024 Edition', image: 'https://placehold.co/300x400.png', imageHint: 'document cover' },
  ];
  
  const stats = [
      { label: "Charlie's Attendance", value: "98%", icon: Percent, href: "#" },
      { label: "Unread Notifications", value: "3", icon: Bell, href: "/news" },
      { label: "Next Upcoming Event", value: nextEvent ? new Date(nextEvent.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short'}) : 'None', icon: Calendar, href: '/calendar' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, Jane!</h1>
        <p className="text-muted-foreground">Here's what's happening at Maes Y Morfa today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map(stat => {
              const Icon = stat.icon;
              return (
                  <Card key={stat.label}>
                    <Link href={stat.href}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                      </CardContent>
                    </Link>
                  </Card>
              )
          })}
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Today's Notices</span>
              </CardTitle>
              <CardDescription>The latest urgent updates and announcements.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {notices.map((notice, index) => (
                  <li key={index} className="flex items-center justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-secondary">
                    <div>
                      <p className="font-medium">{notice.title_en}</p>
                      <p className="text-sm text-muted-foreground">{new Date(notice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/news/${notice.slug}`}><ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <span>Latest Newsletters</span>
                </CardTitle>
                <CardDescription>Catch up on the latest school-wide updates.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newsletters.map((newsletter, index) => (
                    <Link href="#" key={index} className="group block space-y-2">
                        <div className="overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                            <Image 
                                src={newsletter.image} 
                                alt={newsletter.title}
                                data-ai-hint={newsletter.imageHint}
                                width={300}
                                height={400}
                                className="aspect-[3/4] h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                        <p className="font-medium text-sm text-center">{newsletter.title}</p>
                    </Link>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Your most common tasks, one click away.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start">
                <Link href="/absence"><ClipboardCheck className="mr-2 h-4 w-4" /> Report an Absence</Link>
              </Button>
               <Button asChild variant="secondary" className="w-full justify-start">
                <Link href="#"><Utensils className="mr-2 h-4 w-4" /> View Lunch Menu</Link>
              </Button>
               <Button asChild variant="secondary" className="w-full justify-start">
                <Link href="#"><UserCheck className="mr-2 h-4 w-4" /> Update My Details</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Key Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {keyDocuments.map(doc => (
                  <li key={doc.title}>
                    <Link href={doc.href} className="flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-secondary hover:underline">
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
