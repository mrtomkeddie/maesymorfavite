

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Paperclip,
  Filter,
  ArrowRight
} from 'lucide-react';
import { calendarEvents, CalendarEvent } from '@/lib/mockCalendar';
import { format } from 'date-fns';
import { createICalFeed } from '@/lib/ical';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { parentChildrenYearGroups } from '@/lib/mockData';

const content = {
  en: {
    title: 'School Calendar',
    description: 'Upcoming events, holidays, and important dates for the school year.',
    allDay: 'All Day',
    noEventsList: 'No events found.',
    subscribeButton: 'Subscribe to School Calendar',
    subscribeDescription: 'Subscribe to the school calendar on your device. New events and changes will automatically appear in your calendar app.',
    attachments: 'Attachments',
    instructionsTitle: 'Subscription Instructions',
    iphoneTitle: 'iPhone/iPad',
    iphoneInstructions: 'Click the button above, then choose "Add Subscription" in your Calendar app.',
    androidTitle: 'Android',
    androidInstructions: 'Copy the URL and paste it in your calendar app (Google Calendar, Samsung Calendar, etc).',
    desktopTitle: 'Desktop',
    desktopInstructions: 'Copy the URL and add it as a "New Calendar" in Outlook, Apple Calendar, or Google Calendar.',
    filterLabel: "Only show events for my children",
    detailsButton: "View Details",
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
    subscribeButton: 'Tanysgrifio i Galendr yr Ysgol',
    subscribeDescription: 'Tanysgrifiwch i galendr yr ysgol ar eich dyfais. Bydd digwyddiadau newydd a newidiadau\'n ymddangos yn awtomatig yn eich ap calendr.',
    attachments: 'Atodiadau',
    instructionsTitle: 'Cyfarwyddiadau Tanysgrifio',
    iphoneTitle: 'iPhone/iPad',
    iphoneInstructions: 'Cliciwch y botwm uchod, yna dewiswch "Ychwanegu Tanysgrifiad" yn eich ap Calendr.',
    androidTitle: 'Android',
    androidInstructions: 'Copïwch yr URL a\'i ludo yn eich ap calendr (Google Calendar, Samsung Calendar, ayb).',
    desktopTitle: 'Cyfrifiadur',
    desktopInstructions: 'Copïwch yr URL a\'i ychwanegu fel "Calendr Newydd" yn Outlook, Apple Calendar, neu Google Calendar.',
    filterLabel: "Dangos digwyddiadau ar gyfer fy mhlant yn unig",
    detailsButton: "Gweld Manylion",
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
  const navigate = useNavigate();
  const t = content[language];
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleSubscribeToCalendar = async () => {
    try {
      // Get the base URL for the calendar subscription
      const baseUrl = window.location.origin;
      const subscriptionUrl = `${baseUrl}/.netlify/functions/calendar`;
      
      // Copy the subscription URL to clipboard
      await navigator.clipboard.writeText(subscriptionUrl);
      
      // Show success message
      alert(language === 'cy' 
        ? 'Mae URL tanysgrifiad y calendr wedi\'i gopïo i\'r clipfwrdd. Gallwch ei ludo yn eich ap calendr i danysgrifio.'
        : 'Calendar subscription URL copied to clipboard. You can paste this in your calendar app to subscribe.'
      );
      
      // For mobile devices, try to open the URL directly
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const calendarUrl = `webcal://${window.location.host}/.netlify/functions/calendar`;
        window.open(calendarUrl, '_blank');
      }
    } catch (error) {
      console.error('Error handling calendar subscription:', error);
      // Fallback: show the URL in an alert if clipboard fails
      const subscriptionUrl = `${window.location.origin}/.netlify/functions/calendar`;
      alert(language === 'cy'
        ? `Copïwch yr URL hwn i\'ch ap calendr: ${subscriptionUrl}`
        : `Copy this URL to your calendar app: ${subscriptionUrl}`
      );
    }
  };
  
  const filteredEvents = useMemo(() => {
    if (!isFiltered) {
        return calendarEvents;
    }
    return calendarEvents.filter(event => {
        if (!event.relevantTo || event.relevantTo.length === 0 || event.relevantTo.includes('All')) {
            return true;
        }
        return parentChildrenYearGroups.some(year => event.relevantTo?.includes(year as any));
    });
  }, [isFiltered]);

  const EventItem = ({ event }: { event: CalendarEvent }) => {
    const newsSlug = event.title_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    return (
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
            
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {event.attachments.length > 0 && (
                    <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-1"><Paperclip className="h-4 w-4" /> {t.attachments}</h4>
                    <div className="flex flex-col items-start gap-1">
                        {event.attachments.map(att => (
                        <Button key={att.name} variant="link" size="sm" className="p-0 h-auto">
                            <a href={att.url} download>{att.name}</a>
                        </Button>
                        ))}
                    </div>
                    </div>
                )}
                {event.linkedNewsPostId && (
                    <Button variant="outline" size="sm" asChild>
                        <Link to={`/news/${newsSlug}`}>
                            {t.detailsButton} <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                )}
            </div>
            </div>
        </div>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="filter-events" checked={isFiltered} onCheckedChange={setIsFiltered} />
          <Label htmlFor="filter-events" className="text-sm">{t.filterLabel}</Label>
        </div>
        
        <Button onClick={handleSubscribeToCalendar} variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          {t.subscribeButton}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4">{t.subscribeDescription}</p>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t.instructionsTitle}</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            <strong>{t.iphoneTitle}:</strong> {t.iphoneInstructions}
          </div>
          <div>
            <strong>{t.androidTitle}:</strong> {t.androidInstructions}
          </div>
          <div>
            <strong>{t.desktopTitle}:</strong> {t.desktopInstructions}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.noEventsList}</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <EventItem key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
