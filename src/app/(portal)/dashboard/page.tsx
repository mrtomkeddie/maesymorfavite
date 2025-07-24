
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

  const stats = [
      { label: "Charlie's Attendance", value: "98%", icon: Percent, href: "#" },
      { label: "Charlie's Teacher", value: "Mr. Evans", icon: UserCheck, href: "/about" },
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
                  <Card key={stat.label} className="hover:bg-secondary/50 transition-colors">
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
                <Newspaper className="h-5 w-5 text-primary" />
                <span>Latest Updates</span>
              </CardTitle>
              <CardDescription>The latest news and announcements from school.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notices.map((notice) => (
                   <Link href={`/news/${notice.slug}`} key={notice.id} className="block p-4 rounded-lg border transition-colors hover:bg-secondary">
                        <p className="font-semibold">{notice.title_en}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(notice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-foreground/80 mt-2 line-clamp-2">
                            {notice.body_en.replace(/<[^>]*>?/gm, '')}
                        </p>
                    </Link>
                ))}
              </div>
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
                <Link href="/calendar"><Calendar className="mr-2 h-4 w-4" /> View Calendar</Link>
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
