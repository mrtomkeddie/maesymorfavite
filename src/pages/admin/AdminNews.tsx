

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/tutorial/HelpButton';
import { useTutorial, Tutorial } from '@/contexts/TutorialProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';

import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, FileText, Search } from 'lucide-react';
import { NewsForm } from '@/components/admin/NewsForm';
import { db } from '@/lib/db';
import type { NewsPostWithId } from '@/lib/types';
import { deleteFile } from '@/lib/storage';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const newsTutorials: Tutorial[] = [
  {
    id: 'news-management',
    title: 'News & Alerts Management',
    description: 'Learn how to create, edit, and manage school news posts and urgent alerts.',
    steps: [
      {
        id: 'overview',
        target: '[data-tutorial="news-overview"]',
        title: 'News Management Overview',
        content: 'This is your news management page where you can create announcements, urgent alerts, and manage all school communications that will be visible to parents and staff.',
        position: 'bottom',
        tip: 'News posts can be marked as urgent to ensure they get priority attention from parents.'
      },
      {
        id: 'add-news',
        target: '[data-tutorial="add-news-button"]',
        title: 'Creating News Posts',
        content: 'Click this button to create a new news post or alert. You can add titles in both English and Welsh, attach files, and mark posts as urgent.',
        position: 'left',
        action: 'click'
      }
    ]
  }
];

export default function AdminNews() {
  const [news, setNews] = useState<NewsPostWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsPostWithId | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<NewsPostWithId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  const { toast } = useToast();
  const { language } = useLanguage();
  const { autoStartForNewUsers, isTutorialCompleted } = useTutorial();

  const fetchNews = async (initial = false) => {
    setIsLoading(true);
    const { data } = await db.getPaginatedNews(100);
    setNews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Auto-start tutorial for new users
  useEffect(() => {
    if (autoStartForNewUsers && !isTutorialCompleted('news-management') && news.length === 0 && !isLoading) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        // Only start if there are no news posts (likely a new user)
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStartForNewUsers, isTutorialCompleted, news.length, isLoading]);

  const filteredNews = useMemo(() => {
    let result = [...news];
    if (showUrgentOnly) {
      result = result.filter(n => n.isUrgent);
    }
    if (searchQuery) {
      result = result.filter(n => n.title_en.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [news, searchQuery, showUrgentOnly]);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedNews(null);
    fetchNews(true);
  };

  const handleEdit = (newsPost: NewsPostWithId) => {
    setSelectedNews(newsPost);
    setIsDialogOpen(true);
  };
  
  const openDeleteAlert = (newsPost: NewsPostWithId) => {
    setNewsToDelete(newsPost);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
      if (!newsToDelete) return;

      try {
        await db.deleteNews(newsToDelete.id);

        if (newsToDelete.attachmentUrl) {
           await deleteFile(newsToDelete.attachmentUrl);
        }

        toast({
            title: "Success",
            description: "News post deleted successfully.",
            variant: "default",
        });
        fetchNews(true);
      } catch (error) {
        console.error("Error deleting news post:", error);
        toast({
            title: "Error",
            description: "Failed to delete news post. Please try again.",
            variant: "destructive",
        });
      } finally {
        setIsDeleteAlertOpen(false);
        setNewsToDelete(null);
      }
  };
  
  const isValidDate = (date: any) => {
    return date && !isNaN(new Date(date).getTime());
  }

  return (
    <>
      <div className="space-y-6" data-tutorial="news-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">News & Alerts</h1>
                    <HelpButton 
                        tutorials={newsTutorials}
                        onStartTutorial={() => {}}
                    />
                </div>
                <p className="text-muted-foreground">Create, edit, and manage all school announcements.</p>
            </div>
                <Button data-tutorial="add-news-button" onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add News Post
                </Button>
        </div>
        

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div>
                    <CardTitle>Published News</CardTitle>
                    <CardDescription>A list of all current news posts and alerts.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by title..."
                            className="w-full pl-8 sm:w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            data-tutorial="search-news"
                        />
                    </div>
                    <div className="flex items-center space-x-2" data-tutorial="urgent-filter">
                        <Checkbox id="urgent-filter" checked={showUrgentOnly} onCheckedChange={(checked) => setShowUrgentOnly(checked as boolean)} />
                        <Label htmlFor="urgent-filter" className="text-sm font-medium">Show urgent only</Label>
                    </div>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attachment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNews.length > 0 ? (
                      filteredNews.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title_en}</TableCell>
                           <TableCell>{isValidDate(post.date) ? format(new Date(post.date), 'dd MMM yyyy') : 'Invalid Date'}</TableCell>
                           <TableCell data-tutorial="news-status">
                            {post.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                           </TableCell>
                           <TableCell data-tutorial="attachments">
                            {post.attachmentUrl && (
                                <a href={post.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                                    <FileText className="h-4 w-4" /> View
                                </a>
                            )}
                           </TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0" data-tutorial="news-actions">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEdit(post)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openDeleteAlert(post)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No news posts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the news post
                  and remove its data from our servers.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) setSelectedNews(null);
      }}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNews ? 'Edit' : 'Create'} News Post</DialogTitle>
            <DialogDescription>
              {selectedNews ? 'Update the news post details below.' : 'Fill in the details to create a new news post.'}
            </DialogDescription>
          </DialogHeader>
          <NewsForm
            onSuccess={handleFormSuccess}
            existingNews={selectedNews}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
