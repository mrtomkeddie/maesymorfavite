import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  // runContentLifecycleCleanup, 
  // getContentLifecycleStats, 
  // getArchivedContent,
  // restoreArchivedContent,
  // updateContentLifecycleConfig 
} from '@/lib/db/supabase';
import { db } from '@/lib/db';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';

interface LifecycleStats {
  totalArchived: number;
  archivedNews: number;
  archivedEvents: number;
  needingArchival: {
    news: number;
    events: number;
    total: number;
  };
  contentDetails: {
    newsNeedingArchival: any[];
    eventsNeedingArchival: any[];
  };
}

interface ArchivedItem {
  id: string;
  title: string;
  type: 'news' | 'event';
  archivedAt: string;
  reason: string;
  originalData: any;
}

interface CleanupResult {
  archivedNews: number;
  archivedEvents: number;
  errors: string[];
}

export const ContentLifecycleManager: React.FC = () => {
  const [stats, setStats] = useState<LifecycleStats | null>(null);
  const [archivedContent, setArchivedContent] = useState<ArchivedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
    loadArchivedContent();
  }, []);

  const loadStats = async () => {
    try {
      const lifecycleStats = await db.getContentLifecycleStats();
      setStats(lifecycleStats);
    } catch (error) {
      console.error('Failed to load lifecycle stats:', error);
    }
  };

  const loadArchivedContent = async () => {
    try {
      const archived = await db.getArchivedContent();
      setArchivedContent(archived);
    } catch (error) {
      console.error('Failed to load archived content:', error);
    }
  };

  const runCleanup = async () => {
    setIsLoading(true);
    try {
      const result = await db.runContentLifecycleCleanup();
      setCleanupResult(result);
      await loadStats(); // Refresh stats after cleanup
      await loadArchivedContent(); // Refresh archived content
    } catch (error) {
      console.error('Cleanup failed:', error);
      setCleanupResult({
        archivedNews: 0,
        archivedEvents: 0,
        errors: [`Cleanup failed: ${error}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const restoreContent = async (id: string) => {
    try {
      const success = await db.restoreArchivedContent(id);
      if (success) {
        await loadArchivedContent();
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to restore content:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Lifecycle Management</h2>
          <p className="text-muted-foreground">
            Manage automatic archiving and cleanup of expired content
          </p>
        </div>
        <Button 
          onClick={runCleanup} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          {isLoading ? 'Running Cleanup...' : 'Run Cleanup'}
        </Button>
      </div>

      {cleanupResult && (
        <Alert className={cleanupResult.errors.length > 0 ? 'border-destructive' : 'border-green-500'}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                Cleanup completed: {cleanupResult.archivedNews} news posts and {cleanupResult.archivedEvents} events archived.
              </p>
              {cleanupResult.errors.length > 0 && (
                <div>
                  <p className="font-medium text-destructive">Errors:</p>
                  <ul className="list-disc list-inside text-sm">
                    {cleanupResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Archival</TabsTrigger>
          <TabsTrigger value="archived">Archived Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Archived</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalArchived || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.archivedNews || 0} news, {stats?.archivedEvents || 0} events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Archiving</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.needingArchival?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.needingArchival?.news || 0} news, {stats?.needingArchival?.events || 0} events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">News Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.archivedNews || 0}</div>
                <p className="text-xs text-muted-foreground">Archived news posts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.archivedEvents || 0}</div>
                <p className="text-xs text-muted-foreground">Archived events</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Content Pending Archival
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.contentDetails ? (
                <div className="space-y-4">
                  {stats.contentDetails.newsNeedingArchival.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">News Posts ({stats.contentDetails.newsNeedingArchival.length})</h4>
                      <div className="space-y-2">
                        {stats.contentDetails.newsNeedingArchival.map((post) => (
                          <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{post.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Published: {formatDate(post.publishedAt)}
                                {post.isUrgent && <Badge variant="destructive" className="ml-2">Urgent</Badge>}
                              </p>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.contentDetails.eventsNeedingArchival.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Events ({stats.contentDetails.eventsNeedingArchival.length})</h4>
                      <div className="space-y-2">
                        {stats.contentDetails.eventsNeedingArchival.map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Date: {formatDate(event.date)}
                              </p>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.needingArchival.total === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No content currently needs archiving
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archived Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {archivedContent.length > 0 ? (
                <div className="space-y-2">
                  {archivedContent.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {item.type === 'news' ? <FileText className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                          <p className="font-medium">{item.title}</p>
                          <Badge variant="secondary">{item.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Archived: {formatDate(item.archivedAt)} • Reason: {item.reason}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreContent(item.id)}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No archived content found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentLifecycleManager;
