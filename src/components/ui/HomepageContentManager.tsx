import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { news as mockNews, UrgentNewsPost } from '@/lib/mockNews';
import { calendarEvents } from '@/lib/mockCalendar';
import { format } from 'date-fns';
import type { NewsPost } from '@/lib/mockNews';
import type { CalendarEvent } from '@/lib/types';

type ContentItem = {
  id: string;
  type: 'news' | 'event' | 'urgent';
  priority: number; // Higher number = higher priority
  date: Date;
  title: string;
  content?: string;
  href: string;
  data: NewsPost | CalendarEvent;
};

const content = {
  en: {
    latestContent: 'Latest Updates',
    upcomingEvents: 'Upcoming Events',
    readMore: 'Read More',
    viewDetails: 'View Details',
    viewAll: 'View All',
    urgent: 'Urgent Announcement',
    noContent: 'No recent updates available.',
    allDay: 'All Day'
  },
  cy: {
    latestContent: 'Diweddariadau Diweddaraf',
    upcomingEvents: 'Digwyddiadau i Ddod',
    readMore: 'Darllen Mwy',
    viewDetails: 'Gweld Manylion',
    viewAll: 'Gweld Pob',
    urgent: 'Hysbysiad Pwysig',
    noContent: 'Dim diweddariadau diweddar ar gael.',
    allDay: 'Trwy\'r Dydd'
  }
};

interface HomepageContentManagerProps {
  maxItems?: number;
  showUrgentBanner?: boolean;
  className?: string;
}

export function HomepageContentManager({ 
  maxItems = 5, 
  showUrgentBanner = true,
  className = '' 
}: HomepageContentManagerProps) {
  const { language } = useLanguage();
  const t = content[language];
  
  // Get urgent news for banner
  const urgentNews: UrgentNewsPost | undefined = mockNews.find(
    p => p.isUrgent && p.published
  ) as UrgentNewsPost;
  
  // Create unified content items with priority-based sorting
  const createContentItems = (): ContentItem[] => {
    const items: ContentItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add published news posts
    mockNews
      .filter(post => post.published && !post.isUrgent) // Exclude urgent from main feed
      .forEach(post => {
        items.push({
          id: post.id,
          type: 'news',
          priority: post.category === 'Event' ? 8 : 6, // Events get higher priority
          date: new Date(post.date),
          title: post[`title_${language}`],
          content: post[`body_${language}`].replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          href: `/news/${post.slug}`,
          data: post
        });
      });
    
    // Add upcoming calendar events
    calendarEvents
      .filter(event => new Date(event.start) >= today)
      .forEach(event => {
        items.push({
          id: event.id,
          type: 'event',
          priority: 7, // Events get medium-high priority
          date: new Date(event.start),
          title: event[`title_${language}`],
          content: event[`description_${language}`]?.substring(0, 150) + '...',
          href: `/calendar#event-${event.id}`,
          data: event
        });
      });
    
    // Sort by priority (desc) then by date (asc for upcoming, desc for news)
    return items
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        
        // For same priority, sort by date
        if (a.type === 'event' && b.type === 'event') {
          return a.date.getTime() - b.date.getTime(); // Upcoming events: earliest first
        } else if (a.type === 'news' && b.type === 'news') {
          return b.date.getTime() - a.date.getTime(); // News: latest first
        } else {
          // Mixed types: events first if same priority
          return a.type === 'event' ? -1 : 1;
        }
      })
      .slice(0, maxItems);
  };
  
  const contentItems = createContentItems();
  
  const renderContentItem = (item: ContentItem) => {
    if (item.type === 'event') {
      const event = item.data as CalendarEvent;
      const eventDate = new Date(event.start);
      
      return (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 text-center bg-primary text-primary-foreground rounded-lg p-2 min-w-[60px]">
                <div className="text-lg font-bold">{format(eventDate, 'dd')}</div>
                <div className="text-xs uppercase">{format(eventDate, 'MMM')}</div>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-sm leading-tight mb-1">
                  {item.title}
                </h3>
                {!event.allDay && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Clock className="h-3 w-3" />
                    {format(eventDate, 'p')}
                  </p>
                )}
                {item.content && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.content}
                  </p>
                )}
                <Button asChild size="sm" variant="outline" className="text-xs">
                  <Link to={item.href}>{t.viewDetails}</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      // News item
      const post = item.data as NewsPost;
      
      return (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm leading-tight flex-grow pr-2">
                {item.title}
              </h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(item.date, 'MMM dd')}
              </span>
            </div>
            {item.content && (
              <p className="text-xs text-muted-foreground mb-3">
                {item.content}
              </p>
            )}
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link to={item.href}>{t.readMore}</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }
  };
  
  return (
    <div className={className}>
      {/* Urgent Banner */}
      {showUrgentBanner && urgentNews && (
        <div className="bg-destructive text-destructive-foreground mb-6">
          <div className="container mx-auto max-w-7xl px-8 py-3">
            <div className="flex items-center justify-center gap-4 text-sm md:text-base">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="font-bold">{t.urgent}:</p>
              <Link 
                to={`/news/${urgentNews.slug}`} 
                className="flex-grow text-left underline hover:text-destructive-foreground/80"
              >
                {urgentNews[`title_${language}`]}
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Unified Content Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.latestContent}</span>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/news">{t.viewAll} News</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/calendar">{t.viewAll} Events</Link>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contentItems.length > 0 ? (
            <div className="space-y-4">
              {contentItems.map(renderContentItem)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t.noContent}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HomepageContentManager;
