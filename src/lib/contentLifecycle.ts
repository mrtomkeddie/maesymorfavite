import { NewsPost } from './mockNews';
import { CalendarEvent } from './mockCalendar';

export interface ContentLifecycleConfig {
  urgentAlertExpiryDays: number;
  eventArchiveDays: number;
  newsArchiveDays: number;
}

export const defaultLifecycleConfig: ContentLifecycleConfig = {
  urgentAlertExpiryDays: 7, // Urgent alerts expire after 7 days
  eventArchiveDays: 1, // Events are archived 1 day after they end
  newsArchiveDays: 90, // News posts are archived after 90 days
};

export class ContentLifecycleManager {
  private config: ContentLifecycleConfig;

  constructor(config: ContentLifecycleConfig = defaultLifecycleConfig) {
    this.config = config;
  }

  /**
   * Check if an urgent news post should be filtered from homepage
   */
  shouldArchiveUrgentAlert(post: NewsPost): boolean {
    if (!post.isUrgent) return false;
    
    const postDate = new Date(post.date);
    const expiryDate = new Date(postDate);
    expiryDate.setDate(expiryDate.getDate() + this.config.urgentAlertExpiryDays);
    
    return new Date() > expiryDate;
  }

  /**
   * Check if a news post should be filtered from homepage
   */
  shouldArchiveNews(post: NewsPost): boolean {
    const postDate = new Date(post.date);
    const archiveDate = new Date(postDate);
    archiveDate.setDate(archiveDate.getDate() + this.config.newsArchiveDays);
    
    return new Date() > archiveDate;
  }

  /**
   * Check if an event should be filtered from homepage
   */
  shouldArchiveEvent(event: CalendarEvent): boolean {
    const eventEndDate = new Date(event.end || event.start);
    const archiveDate = new Date(eventEndDate);
    archiveDate.setDate(archiveDate.getDate() + this.config.eventArchiveDays);
    
    return new Date() > archiveDate;
  }

  /**
   * Filter news posts for homepage display (removes expired content)
   */
  filterActiveNews(newsPosts: NewsPost[]): NewsPost[] {
    return newsPosts.filter(post => {
      // Always show published news on dedicated pages
      if (!post.published) return false;
      
      // For homepage filtering, check if content should be archived
      if (post.isUrgent) {
        return !this.shouldArchiveUrgentAlert(post);
      } else {
        return !this.shouldArchiveNews(post);
      }
    });
  }

  /**
   * Filter events for homepage display (removes past events)
   */
  filterActiveEvents(events: CalendarEvent[]): CalendarEvent[] {
    return events.filter(event => {
      // Always show published events on dedicated pages
      if (!event.published) return false;
      
      // For homepage filtering, check if event should be archived
      return !this.shouldArchiveEvent(event);
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): ContentLifecycleConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ContentLifecycleConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const contentLifecycleManager = new ContentLifecycleManager();

// Utility functions for easy integration
export const getActiveNews = (newsPosts: NewsPost[]): NewsPost[] => {
  return contentLifecycleManager.filterActiveNews(newsPosts);
};

export const getActiveEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  return contentLifecycleManager.filterActiveEvents(events);
};

export const isUrgentAlertExpired = (post: NewsPost): boolean => {
  return contentLifecycleManager.shouldArchiveUrgentAlert(post);
};