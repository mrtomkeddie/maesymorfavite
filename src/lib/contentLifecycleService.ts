import { contentLifecycleManager, ContentLifecycleConfig } from './contentLifecycle';
import { news as mockNews } from './mockNews';
import { calendarEvents } from './mockCalendar';

/**
 * Service for running content lifecycle management tasks
 */
export class ContentLifecycleService {
  private static instance: ContentLifecycleService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  static getInstance(): ContentLifecycleService {
    if (!ContentLifecycleService.instance) {
      ContentLifecycleService.instance = new ContentLifecycleService();
    }
    return ContentLifecycleService.instance;
  }

  /**
   * Start automatic content lifecycle management
   * @param intervalHours How often to run cleanup (default: 24 hours)
   */
  start(intervalHours: number = 24): void {
    if (this.isRunning) {
      console.log('Content lifecycle service is already running');
      return;
    }

    console.log(`Starting content lifecycle service (interval: ${intervalHours} hours)`);
    
    // Run immediately on start
    this.runLifecycleManagement();
    
    // Set up recurring execution
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.runLifecycleManagement();
    }, intervalMs);
    
    this.isRunning = true;
  }

  /**
   * Stop automatic content lifecycle management
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Content lifecycle service stopped');
  }

  /**
   * Check if the service is currently running
   */
  getStatus(): { isRunning: boolean; nextRun?: Date } {
    return {
      isRunning: this.isRunning,
      nextRun: this.intervalId ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
    };
  }

  /**
   * Manually run content lifecycle management
   */
  async runLifecycleManagement(): Promise<void> {
    try {
      console.log('Running content lifecycle management...');
      
      const result = await contentLifecycleManager.runLifecycleManagement(
        mockNews,
        calendarEvents
      );
      
      console.log('Content lifecycle management completed:', {
        archivedNews: result.archivedNews.length,
        archivedEvents: result.archivedEvents.length,
        archivedUrgentAlerts: result.archivedUrgentAlerts.length
      });
      
      // Log details if any content was archived
      if (result.archivedNews.length > 0) {
        console.log('Archived news:', result.archivedNews.map(n => n.title_en));
      }
      if (result.archivedEvents.length > 0) {
        console.log('Archived events:', result.archivedEvents.map(e => e.title_en));
      }
      if (result.archivedUrgentAlerts.length > 0) {
        console.log('Archived urgent alerts:', result.archivedUrgentAlerts.map(u => u.title_en));
      }
      
    } catch (error) {
      console.error('Error running content lifecycle management:', error);
    }
  }

  /**
   * Get lifecycle statistics
   */
  async getLifecycleStats() {
    return await contentLifecycleManager.getLifecycleStats(mockNews, calendarEvents);
  }

  /**
   * Get current lifecycle configuration
   */
  getConfig() {
    return contentLifecycleManager.getConfig();
  }

  /**
   * Update lifecycle configuration
   */
  updateConfig(newConfig: Partial<ContentLifecycleConfig>) {
    contentLifecycleManager.updateConfig(newConfig);
  }
}

// Export singleton instance
export const contentLifecycleService = ContentLifecycleService.getInstance();

// Utility functions for easy access
export const startContentLifecycle = (intervalHours?: number) => {
  contentLifecycleService.start(intervalHours);
};

export const stopContentLifecycle = () => {
  contentLifecycleService.stop();
};

export const runContentLifecycleNow = () => {
  return contentLifecycleService.runLifecycleManagement();
};

export const getContentLifecycleStatus = () => {
  return contentLifecycleService.getStatus();
};