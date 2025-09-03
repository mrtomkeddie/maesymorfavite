import React from 'react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getHomepageContent, HomepageContentItem, HomepageContentConfig } from '@/lib/homepageContent';
import { UrgentBanner } from '@/components/ui/UrgentBanner';

interface HomepageContentProps {
  config?: Partial<HomepageContentConfig>;
  className?: string;
  showUrgentBanner?: boolean;
  showEvents?: boolean;
}

const content = {
  en: {
    latestUpdates: 'Latest Updates',
    upcomingEvents: 'Upcoming Events',
    latestNews: 'Latest News',
    readMore: 'Read More',
    viewDetails: 'View Details',
    viewAllNews: 'View All News',
    viewFullCalendar: 'View Full Calendar',
    noContent: 'No recent updates available.',
    event: 'Event',
    news: 'News'
  },
  cy: {
    latestUpdates: 'Diweddariadau Diweddaraf',
    upcomingEvents: 'Digwyddiadau i Ddod',
    latestNews: 'Newyddion Diweddaraf',
    readMore: 'Darllen Mwy',
    viewDetails: 'Gweld Manylion',
    viewAllNews: 'Gweld Pob Newyddion',
    viewFullCalendar: 'Gweld y Calendr Llawn',
    noContent: 'Dim diweddariadau diweddar ar gael.',
    event: 'Digwyddiad',
    news: 'Newyddion'
  }
};

export function HomepageContent({ config, className = '', showUrgentBanner = true, showEvents = true }: HomepageContentProps) {
  const { language } = useLanguage();
  const t = content[language];
  
  const { urgentAlert, prioritizedContent, stats } = getHomepageContent(config);
  
  // Separate content by type for different display sections
  const newsItems = prioritizedContent.filter(item => item.type === 'news');
  const eventItems = prioritizedContent.filter(item => item.type === 'event');
  
  return (
    <div className={className}>
      {/* Urgent Alert Banner */}
      {showUrgentBanner && urgentAlert && <UrgentBanner post={urgentAlert} />}

      {showEvents ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area - News */}
          <div className="lg:col-span-2">
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter text-foreground mb-8">
              {t.latestNews}
            </h2>
            
            {newsItems.length > 0 ? (
              <div className="space-y-6">
                {newsItems.map((item) => (
                  <NewsCard key={item.id} item={item} language={language} t={t} />
                ))}
              </div>
            ) : (
              <Card className="bg-background/70 shadow-lg border-0">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">{t.noContent}</p>
                </CardContent>
              </Card>
            )}
            
            <div className="mt-8">
              <Button asChild variant="outline">
                <Link to="/news">{t.viewAllNews}</Link>
              </Button>
            </div>
          </div>

          {/* Sidebar - Upcoming Events */}
          <div className="lg:col-span-1">
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter text-foreground mb-8">
              {t.upcomingEvents}
            </h2>
            
            {eventItems.length > 0 ? (
              <div className="space-y-4">
                {eventItems.map((item) => (
                  <EventCard key={item.id} item={item} language={language} t={t} />
                ))}
              </div>
            ) : (
              <Card className="bg-background/70 shadow-lg border-0">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">{t.noContent}</p>
                </CardContent>
              </Card>
            )}

            <div className="mt-8">
              <Button asChild variant="outline">
                <Link to="/calendar">{t.viewFullCalendar}</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // News-only layout (no internal events column)
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter text-foreground mb-8">
            {t.latestNews}
          </h2>
          {newsItems.length > 0 ? (
            <div className="space-y-6">
              {newsItems.slice(0, 2).map((item) => (
                <Card key={item.id} className="bg-background/70 shadow-lg border-0">
                  <CardContent className="p-6">
                    <span className="text-sm text-muted-foreground block">
                      {item.date.toLocaleDateString(language === 'cy' ? 'cy-GB' : 'en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <Link
                      to={`/news/${item.slug}`}
                      className="mt-1 block text-xl font-bold hover:underline"
                    >
                      {item[`title_${language}` as keyof HomepageContentItem] as string}
                    </Link>
                    {item.body_en && (
                      <p className="text-muted-foreground mt-2 line-clamp-2">
                        {(item.body_en as string).replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                      </p>
                    )}
                    <Button asChild variant="link" className="p-0 mt-2">
                      <Link to={`/news/${item.slug}`}>
                        {t.readMore} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-background/70 shadow-lg border-0">
              <CardContent className="p-6">
                <p className="text-muted-foreground">{t.noContent}</p>
              </CardContent>
            </Card>
          )}
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/news">{t.viewAllNews}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// News Card Component
function NewsCard({ item, language, t }: { item: HomepageContentItem; language: string; t: any }) {
  const plainBody = item.body_en?.replace(/<[^>]*>?/gm, '') || '';
  
  return (
    <Card className="bg-background/70 shadow-lg border-0">
      <CardContent className="p-6">
        <span className="text-sm text-muted-foreground mb-2 block">
          {item.date.toLocaleDateString(language === 'cy' ? 'cy-GB' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
        <h3 className="text-xl font-bold">{item[`title_${language}` as keyof HomepageContentItem] as string}</h3>
        <p className="text-muted-foreground line-clamp-2 mt-2">
          {plainBody.substring(0, 150)}...
        </p>
        {item.linkedCalendarEventId && (
          <div className="flex items-center gap-2 mt-2 text-sm text-primary">
            <CalendarIcon className="h-4 w-4" />
            <span>Related event available</span>
          </div>
        )}
        <Button asChild variant="link" className="p-0 mt-4">
          <Link to={`/news/${item.slug}`}>
            {t.readMore} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Event Card Component
function EventCard({ item, language }: { item: HomepageContentItem; language: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-center font-bold text-primary border-r pr-4">
        <div className="text-2xl">{format(item.date, 'dd')}</div>
        <div className="text-xs uppercase">{format(item.date, 'MMM')}</div>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm leading-tight">
          {item[`title_${language}` as keyof HomepageContentItem] as string}
        </p>
        {!item.allDay && item.start && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {format(new Date(item.start), 'p')}
          </p>
        )}
        {item.linkedNewsPostId && (
          <div className="flex items-center gap-1 mt-1 text-xs text-primary">
            <CalendarIcon className="h-3 w-3" />
            <span>News post available</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Unified Content Card Component
function UnifiedContentCard({ item, language, t }: { item: HomepageContentItem; language: string; t: any }) {
  const isEvent = item.type === 'event';
  const linkTo = isEvent ? `/calendar` : `/news/${item.slug}`;
  
  return (
    <Card className="bg-background/70 shadow-lg border-0 hover:shadow-xl transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isEvent 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isEvent ? t.event : t.news}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(item.date, 'MMM dd')}
          </span>
        </div>
        
        <h4 className="font-semibold text-sm leading-tight mb-2">
          {item[`title_${language}` as keyof HomepageContentItem] as string}
        </h4>
        
        {!isEvent && item.body_en && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {item.body_en.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
          </p>
        )}
        
        {(item.linkedCalendarEventId || item.linkedNewsPostId) && (
          <div className="flex items-center gap-1 mb-2 text-xs text-primary">
            <CalendarIcon className="h-3 w-3" />
            <span>Linked content</span>
          </div>
        )}
        
        <Button asChild variant="link" size="sm" className="p-0 h-auto">
          <Link to={linkTo}>
            {isEvent ? t.viewDetails : t.readMore}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}