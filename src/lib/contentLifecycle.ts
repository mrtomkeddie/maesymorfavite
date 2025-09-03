import { NewsPost } from './mockNews';
import { CalendarEvent } from './mockCalendar';

export interface ContentLifecycleConfig {
  urgentAlertExpiryDays: number;
  eventArchiveDays: number;
  newsArchiveDays: number;
  autoCleanupEnabled: boolean;
}

export const defaultLifecycleConfig: ContentLifecycleConfig = {
  urgentAlertExpiryDays: 7, // Urgent alerts expire after 7 days
  eventArchiveDays: 1, // Events are archived 1 day after they end
  newsArchiveDays: 90, // News posts are archived after 90 days
  autoCleanupEnabled: true
};

export interface ArchivedContent {
  id: string;
  type: 'news' | 'event';
  archivedAt: Date;
  originalData: NewsPost | CalendarEvent;
  reason: 'expired' | 'past_event' | 'manual';
}

export class ContentLifecycleManager {
  private config: ContentLifecycleConfig;
  private archivedContent: ArchivedContent[] = [];

  constructor(config: ContentLifecycleConfig = defaultLifecycleConfig) {
    this.config = config;
  }

  /**
   * Check if an urgent news post should be archived
   */
  shouldArchiveUrgentAlert(post: NewsPost): boolean {
    if (!post.isUrgent || !this.config.autoCleanupEnabled) return false;
    
    const postDate = new Date(post.date);
    const expiryDate = new Date(postDate);
    expiryDate.setDate(expiryDate.getDate() + this.config.urgentAlertExpiryDays);
    
    return new Date() > expiryDate;
  }

  /**
   * Check if a news post should be archived
   */
  shouldArchiveNews(post: NewsPost): boolean {
    if (!this.config.autoCleanupEnabled) return false;
    
    const postDate = new Date(post.date);
    const archiveDate = new Date(postDate);
    archiveDate.setDate(archiveDate.getDate() + this.config.newsArchiveDays);
    
    return new Date() > archiveDate;
  }

  /**
   * Check if an event should be archived
   */
  shouldArchiveEvent(event: CalendarEvent): boolean {
    if (!this.config.autoCleanupEnabled) return false;
    
    const eventEndDate = new Date(event.end || event.start);
    const archiveDate = new Date(eventEndDate);
    archiveDate.setDate(archiveDate.getDate() + this.config.eventArchiveDays);
    
    return new Date() > archiveDate;
  }

  /**
   * Archive a news post
   */
  archiveNews(post: NewsPost, reason: ArchivedContent['reason'] = 'expired'): void {
    const archived: ArchivedContent = {
      id: post.id,
      type: 'news',
      archivedAt: new Date(),
      originalData: post,
      reason
    };
    
    this.archivedContent.push(archived);
  }

  /**
   * Archive an event
   */
  archiveEvent(event: CalendarEvent, reason: ArchivedContent['reason'] = 'past_event'): void {
    const archived: ArchivedContent = {
      id: event.id,
      type: 'event',
      archivedAt: new Date(),
      originalData: event,
      reason
    };
    
    this.archivedContent.push(archived);
  }

  /**
   * Filter active news posts (non-archived)
   */
  filterActiveNews(newsPosts: NewsPost[]): NewsPost[] {
    return newsPosts.filter(post => {
      // Check if already archived
      const isArchived = this.archivedContent.some(archived => 
        archived.id === post.id && archived.type === 'news'
      );
      
      if (isArchived) return false;
      
      // Check if should be archived now
      if (this.shouldArchiveNews(post)) {
        this.archiveNews(post);
        return false;
      }
      
      // For urgent alerts, check expiry
      if (post.isUrgent && this.shouldArchiveUrgentAlert(post)) {
        this.archiveNews(post, 'expired');
        return false;
      }
      
      return true;
    });
  }

  /**
   * Filter active events (non-archived)
   */
  filterActiveEvents(events: CalendarEvent[]): CalendarEvent[] {
    return events.filter(event => {
      // Check if already archived
      const isArchived = this.archivedContent.some(archived => 
        archived.id === event.id && archived.type === 'event'
      );
      
      if (isArchived) return false;
      
      // Check if should be archived now
      if (this.shouldArchiveEvent(event)) {
        this.archiveEvent(event);
        return false;
      }
      
      return true;
    });
  }

  /**
   * Get archived content
   */
  getArchivedContent(type?: 'news' | 'event'): ArchivedContent[] {
    if (type) {
      return this.archivedContent.filter(item => item.type === type);
    }
    return [...this.archivedContent];
  }

  /**
   * Restore archived content
   */
  restoreContent(id: string): boolean {
    const index = this.archivedContent.findIndex(item => item.id === id);
    if (index !== -1) {
      this.archivedContent.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Permanently delete archived content older than specified days
   */
  cleanupArchivedContent(olderThanDays: number = 365): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const initialCount = this.archivedContent.length;
    this.archivedContent = this.archivedContent.filter(
      item => item.archivedAt > cutoffDate
    );
    
    return initialCount - this.archivedContent.length;
  }

  /**
   * Get lifecycle statistics
   */
  getLifecycleStats() {
    const now = new Date();
    const stats = {
      totalArchived: this.archivedContent.length,
      archivedNews: this.archivedContent.filter(item => item.type === 'news').length,
      archivedEvents: this.archivedContent.filter(item => item.type === 'event').length,
      expiredUrgentAlerts: this.archivedContent.filter(
        item => item.type === 'news' && item.reason === 'expired'
      ).length,
      recentlyArchived: this.archivedContent.filter(
        item => {
          const daysSinceArchived = (now.getTime() - item.archivedAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceArchived <= 7;
        }
      ).length
    };
    
    return stats;
  }

  /**
   * Update lifecycle configuration
   */
  updateConfig(newConfig: Partial<ContentLifecycleConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ContentLifecycleConfig {
    return { ...this.config };
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