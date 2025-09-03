import { news as mockNews, UrgentNewsPost } from '@/lib/mockNews';
import { calendarEvents } from '@/lib/mockCalendar';
import { getActiveNews, getActiveEvents, contentLifecycleManager } from '@/lib/contentLifecycle';

export interface HomepageContentItem {
  id: string;
  type: 'news' | 'event' | 'urgent';
  priority: number; // Higher number = higher priority
  title_en: string;
  title_cy: string;
  date: Date;
  slug?: string;
  isUrgent?: boolean;
  allDay?: boolean;
  linkedNewsPostId?: string;
  linkedCalendarEventId?: string;
  body_en?: string;
  body_cy?: string;
  start?: string;
}

export interface HomepageContentConfig {
  maxNewsItems: number;
  maxEventItems: number;
  maxTotalItems: number;
  urgentAlertDurationDays: number;
}

const defaultConfig: HomepageContentConfig = {
  maxNewsItems: 3,
  maxEventItems: 3,
  maxTotalItems: 6,
  urgentAlertDurationDays: 7
};

/**
 * Get unified homepage content with priority-based display logic
 */
export function getHomepageContent(config: Partial<HomepageContentConfig> = {}): {
  urgentAlert: UrgentNewsPost | null;
  prioritizedContent: HomepageContentItem[];
  stats: {
    totalNews: number;
    totalEvents: number;
    urgentAlerts: number;
  };
} {
  const finalConfig = { ...defaultConfig, ...config };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const urgentCutoff = new Date(today);
  urgentCutoff.setDate(urgentCutoff.getDate() - finalConfig.urgentAlertDurationDays);

  // Get active content using lifecycle management
  const activeNews = getActiveNews(mockNews);
  const activeEvents = getActiveEvents(calendarEvents);
  
  // Get urgent alert (only one at a time) - check if not expired
  const urgentAlert = activeNews.find(p => 
    p.isUrgent && 
    p.published && 
    !contentLifecycleManager.shouldArchiveUrgentAlert(p)
  ) as UrgentNewsPost || null;

  // Get published news (excluding urgent alerts for main content)
  const publishedNews = activeNews
    .filter(n => n.published && !n.isUrgent)
    .slice(0, finalConfig.maxNewsItems)
    .map(post => ({
      id: post.id,
      type: 'news' as const,
      priority: calculateNewsPriority(post),
      title_en: post.title_en,
      title_cy: post.title_cy,
      date: new Date(post.date),
      slug: post.slug,
      body_en: post.body_en,
      body_cy: post.body_cy,
      linkedCalendarEventId: post.linkedCalendarEventId
    }));

  // Get upcoming events (only active ones)
  const upcomingEvents = activeEvents
    .filter(event => new Date(event.start) >= today)
    .slice(0, finalConfig.maxEventItems)
    .map(event => ({
      id: event.id,
      type: 'event' as const,
      priority: calculateEventPriority(event),
      title_en: event.title_en,
      title_cy: event.title_cy,
      date: new Date(event.start),
      start: event.start,
      allDay: event.allDay,
      linkedNewsPostId: event.linkedNewsPostId
    }));

  // Combine and sort by priority
  const allContent = [...publishedNews, ...upcomingEvents]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, finalConfig.maxTotalItems);

  return {
    urgentAlert,
    prioritizedContent: allContent,
    stats: {
      totalNews: publishedNews.length,
      totalEvents: upcomingEvents.length,
      urgentAlerts: urgentAlert ? 1 : 0
    }
  };
}

/**
 * Calculate priority for news posts
 * Higher values = higher priority
 */
function calculateNewsPriority(post: any): number {
  let priority = 50; // Base priority for news
  
  const postDate = new Date(post.date);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Newer posts get higher priority
  if (daysDiff <= 1) priority += 20;
  else if (daysDiff <= 3) priority += 15;
  else if (daysDiff <= 7) priority += 10;
  else if (daysDiff <= 14) priority += 5;
  
  // Linked to calendar events get slight boost
  if (post.linkedCalendarEventId) priority += 5;
  
  return priority;
}

/**
 * Calculate priority for calendar events
 * Higher values = higher priority
 */
function calculateEventPriority(event: any): number {
  let priority = 40; // Base priority for events (slightly lower than news)
  
  const eventDate = new Date(event.start);
  const now = new Date();
  const daysDiff = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Events happening soon get higher priority
  if (daysDiff <= 1) priority += 25;
  else if (daysDiff <= 3) priority += 20;
  else if (daysDiff <= 7) priority += 15;
  else if (daysDiff <= 14) priority += 10;
  else if (daysDiff <= 30) priority += 5;
  
  // Important event types get priority boost
  if (event.tags?.includes('Parents Evening')) priority += 15;
  else if (event.tags?.includes('INSET')) priority += 10;
  else if (event.tags?.includes('Holiday')) priority += 8;
  else if (event.tags?.includes('Trip')) priority += 5;
  
  // Linked to news posts get slight boost
  if (event.linkedNewsPostId) priority += 5;
  
  return priority;
}

/**
 * Check if urgent alerts should be automatically archived
 */
export function shouldArchiveUrgentAlert(post: UrgentNewsPost, maxDays: number = 7): boolean {
  const postDate = new Date(post.date);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDiff > maxDays;
}

/**
 * Get content statistics for admin dashboard
 */
export function getContentStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const publishedNews = mockNews.filter(n => n.published);
  const urgentNews = publishedNews.filter(n => n.isUrgent);
  const upcomingEvents = calendarEvents.filter(event => new Date(event.start) >= today);
  const pastEvents = calendarEvents.filter(event => new Date(event.start) < today);
  
  return {
    totalNews: publishedNews.length,
    urgentAlerts: urgentNews.length,
    upcomingEvents: upcomingEvents.length,
    pastEvents: pastEvents.length,
    linkedContent: {
      newsWithEvents: publishedNews.filter(n => n.linkedCalendarEventId).length,
      eventsWithNews: calendarEvents.filter(e => e.linkedNewsPostId).length
    }
  };
}