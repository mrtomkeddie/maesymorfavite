'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/app/(public)/LanguageProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  List,
  Download,
  Paperclip,
  CalendarPlus,
  Filter,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { calendarEvents, calendarTags, CalendarEvent, CalendarTag } from '@/lib/mockCalendar';
import { format, getMonth, getYear, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { createICalFile } from '@/lib/ical';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const content = {
  en: {
    title: 'Key Dates & Calendar',
    description: 'Upcoming events, holidays, and important dates for the school year.',
    listView: 'List View',
    calendarView: 'Calendar View',
    allDay: 'All Day',
    filter: 'Filter by Category',
    noEvents: 'No events scheduled for this month.',
    noEventsList: 'No events match your selected filters.',
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
    title: 'Dyddiadau Allweddol a Chaledr',
    description: 'Digwyddiadau, gwyliau, a dyddiadau pwysig ar gyfer y flwyddyn ysgol.',
    listView: 'Gweld fel Rhestr',
    calendarView: 'Gweld fel Calendr',
    allDay: 'Trwy\'r Dydd',
    filter: 'Hidlo yn ôl Categori',
    noEvents: 'Dim digwyddiadau wedi\'u hamserlennu ar gyfer y mis hwn.',
    noEventsList: 'Dim digwyddiadau yn cyd-fynd â\'ch hidlwyr.',
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

const tagColors: Record<CalendarTag, string> = {
    Holiday: 'bg-blue-100 text-blue-800 border-blue-200',
    INSET: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Event: 'bg-green-100 text-green-800 border-green-200',
    Trip: 'bg-purple-100 text-purple-800 border-purple-200',
    'Parents Evening': 'bg-pink-100 text-pink-800 border-pink-200'
};

export default function CalendarPage() {
  const { language } = useLanguage();
  const t = content[language];
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilters, setSelectedFilters] = useState<Record<CalendarTag, boolean>>(
    calendarTags.reduce((acc, tag) => ({...acc, [tag]: true}), {} as Record<CalendarTag, boolean>)
  );

  const handleFilterChange = (tag: CalendarTag) => {
    setSelectedFilters(prev => ({...prev, [tag]: !prev[tag]}));
  };

  const filteredEvents = useMemo(() => {
    const activeTags = Object.entries(selectedFilters).filter(([, value]) => value).map(([key]) => key);
    if (activeTags.length === calendarTags.length) return calendarEvents;
    return calendarEvents.filter(event => event.tags.some(tag => activeTags.includes(tag)));
  }, [selectedFilters]);

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
    <div className="relative rounded-lg border p-4 transition-all hover:shadow-md">
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

  const CalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const eventsForMonth = filteredEvents.filter(event => 
        isWithinInterval(new Date(event.start), { start: monthStart, end: monthEnd })
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}>Prev</Button>
                    <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
                    <Button variant="outline" onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}>Next</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(day) => day && setCurrentDate(day)}
                    className="p-0"
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    components={{
                        DayContent: ({ date }) => {
                             const dayEvents = eventsForMonth.filter(e => isSameDay(new Date(e.start), date));
                             return (
                                 <div className="relative h-full">
                                    <p>{format(date, 'd')}</p>
                                    {dayEvents.length > 0 && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                            {dayEvents.slice(0,3).map(e => (
                                                <div key={e.id} className={cn('h-1.5 w-1.5 rounded-full', tagColors[e.tags[0]])}></div>
                                            ))}
                                        </div>
                                    )}
                                 </div>
                             )
                        }
                    }}
                />
                 <div className="mt-4 space-y-2">
                    {eventsForMonth.length > 0 ? (
                        eventsForMonth.map(event => <EventItem key={event.id} event={event} />)
                    ) : (
                        <p className="text-muted-foreground text-center">{t.noEvents}</p>
                    )}
                 </div>
            </CardContent>
        </Card>
    )
  }

  const ListView = () => (
    <div className="space-y-4">
        {filteredEvents.length > 0 ? (
            filteredEvents.map(event => <EventItem key={event.id} event={event} />)
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
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        {t.filter}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {calendarTags.map(tag => (
                        <DropdownMenuCheckboxItem
                            key={tag}
                            checked={selectedFilters[tag]}
                            onCheckedChange={() => handleFilterChange(tag)}
                        >
                            {t.tags[tag]}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="bg-muted p-1 rounded-lg flex items-center">
                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')} className="flex items-center gap-2">
                    <List className="h-4 w-4" /> {t.listView}
                </Button>
                <Button variant={view === 'calendar' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('calendar')} className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> {t.calendarView}
                </Button>
            </div>
        </div>
      </div>

      {view === 'list' ? <ListView /> : <CalendarView />}
    </div>
  );
}
