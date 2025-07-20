import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Bell, FileText, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const notices = [
    { title: 'Parent-Teacher meetings next week', date: '2 days ago' },
    { title: 'School photos are now available to order', date: '4 days ago' },
    { title: 'Reminder: Half-day on Friday', date: '5 days ago' },
  ];

  const newsletters = [
    { title: 'June 2024 Edition', image: 'https://placehold.co/300x400.png', imageHint: 'newsletter cover' },
    { title: 'May 2024 Edition', image: 'https://placehold.co/300x400.png', imageHint: 'document cover' },
  ];

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
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Today's Notices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {notices.map((notice, index) => (
                  <li key={index} className="flex items-center justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-secondary">
                    <div>
                      <p className="font-medium">{notice.title}</p>
                      <p className="text-sm text-muted-foreground">{notice.date}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="#"><ArrowRight className="h-4 w-4" /></Link>
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
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Report an Absence</CardTitle>
              <CardDescription className="text-primary-foreground/80">Need to let us know your child is unwell?</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/absence">Report Absence Now</Link>
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
                <li><Link href="#" className="flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-secondary hover:underline">Term Dates 2024-25.pdf</Link></li>
                <li><Link href="#" className="flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-secondary hover:underline">Lunch Menu - Summer.pdf</Link></li>
                <li><Link href="#" className="flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-secondary hover:underline">Uniform Policy.pdf</Link></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
