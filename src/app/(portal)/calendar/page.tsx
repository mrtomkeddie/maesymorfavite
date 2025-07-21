
'use client';

import React from 'react';
import { useLanguage } from '@/app/(public)/LanguageProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarPlus,
  Paperclip,
} from 'lucide-react';
import { calendarEvents, CalendarEvent } from '@/lib/mockCalendar';
import { format } from 'date-fns';
import { createICalFile } from '@/lib/ical';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const content = {
  en: {
    title: 'School Calendar',
    description: 'Upcoming events, holidays, and important dates for the school year.',
    allDay: 'All Day',
    noEventsList: 'No events found.',
    addToCalendar: 'Add to Calendar',
    attachments: 'Attachments',
    tags: {
      Holiday: 'Holiday',
      INSET: 'INSET Day',
      Event: 'School Event',
      Trip: 'Trip',
      'Parents Evening': 'Parents Evening'
    }
  },
  cy: {
    title: 'Calendr yr Ysgol',
    description: 'Digwyddiadau, gwyliau, a dyddiadau pwysig ar gyfer y flwyddyn ysgol.',
    allDay: 'Trwy\'r Dydd',
    noEventsList: 'Ni chanfuwyd unrhyw ddigwyddiadau.',
    addToCalendar: 'Ychwanegu at y Calendr',
    attachments: 'Atodiadau',
    tags: {
      Holiday: 'Gwyliau',
      INSET: 'Diwrnod HMS',
      Event: 'Digwyddiad Ysgol',
      Trip: 'Taith',
      'Parents Evening': 'Noson Rieni'
    }
  },
};

const tagColors: Record<(typeof calendarEvents[0]['tags'][0]), string> = {
    Holiday: 'bg-blue-100 text-blue-800 border-blue-200',
    INSET: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Event: 'bg-green-100 text-green-800 border-green-200',
    Trip: 'bg-purple-100 text-purple-800 border-purple-200',
    'Parents Evening': 'bg-pink-100 text-pink-800 border-pink-200'
};

export default function CalendarPage() {
  const { language } = useLanguage();
  const t = content[language];

  const handleDownloadICal = (event: CalendarEvent) => {
    const icalData = createICalFile(event);
    if (icalData) {
      const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${event.title_en.replace(/ /g, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const EventItem = ({ event }: { event: CalendarEvent }) => (
    <div className="relative rounded-lg border p-4 transition-all hover:shadow-md bg-card">
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
        <div className="mb-2 sm:mb-0">
          <div className="text-center font-bold text-primary">
            <div className="text-3xl">{format(new Date(event.start), 'dd')}</div>
            <div className="text-sm uppercase">{format(new Date(event.start), 'MMM')}</div>
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-lg">{event[language === 'en' ? 'title_en' : 'title_cy']}</h3>
          <div className="text-sm text-muted-foreground mb-2">
            {event.allDay ? t.allDay : `${format(new Date(event.start), 'p')} ${event.end ? `- ${format(new Date(event.end), 'p')}` : ''}`}
          </div>
          <p className="text-sm mb-3">
            {event[language === 'en' ? 'description_en' : 'description_cy']}
          </p>
           <div className="flex flex-wrap gap-2">
            {event.tags.map(tag => (
              <Badge key={tag} className={cn('font-normal', tagColors[tag])}>{t.tags[tag]}</Badge>
            ))}
          </div>
          {event.attachments.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold mb-1 flex items-center gap-1"><Paperclip className="h-4 w-4" /> {t.attachments}</h4>
              <div className="flex flex-col items-start gap-1">
                {event.attachments.map(att => (
                  <Button key={att.name} variant="link" size="sm" asChild className="p-0 h-auto">
                    <a href={att.url} download>{att.name}</a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
         <Button variant="ghost" size="icon" className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0" onClick={() => handleDownloadICal(event)}>
            <CalendarPlus className="h-5 w-5" />
            <span className="sr-only">{t.addToCalendar}</span>
        </Button>
      </div>
    </div>
  );


  const ListView = () => (
    <div className="space-y-4">
        {calendarEvents.length > 0 ? (
            calendarEvents.map(event => <EventItem key={event.id} event={event} />)
        ) : (
            <Card className="text-center p-8">
                <p className="text-muted-foreground">{t.noEventsList}</p>
            </Card>
        )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
      </div>

      <ListView />
    </div>
  );
}
