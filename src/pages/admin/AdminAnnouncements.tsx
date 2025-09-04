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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, FileText, Search, Calendar, Newspaper } from 'lucide-react';
import { AnnouncementForm } from '@/components/admin/AnnouncementForm';
import { db } from '@/lib/db';
import type { NewsPostWithId, CalendarEventWithId } from '@/lib/types';
import { deleteFile } from '@/lib/storage';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const announcementsTutorials: Tutorial[] = [
  {
    id: 'announcements-overview',
    title: 'Unified Announcements',
    description: 'Learn how to create announcements that can be both news posts and calendar events',
    target: '[data-tutorial="announcements-overview"]',
    content: 'This unified system lets you create announcements that automatically become news posts, calendar events, or both based on what information you provide.',
    position: 'bottom' as const,
    tip: 'Add a date to create a calendar event, add body text to create a news post, or add both!'
  },
  {
    id: 'add-announcement-button',
    title: 'Create New Announcement',
    description: 'Add a new announcement to the system',
    target: '[data-tutorial="add-announcement-button"]',
    content: 'Click here to create a new announcement. The form will automatically determine what to create based on the fields you fill out.',
    position: 'left' as const,
    tip: 'Urgent announcements always create news posts with homepage banners'
  },
  {
    id: 'search-announcements',
    title: 'Search Announcements',
    description: 'Find specific announcements quickly',
    target: '[data-tutorial="search-announcements"]',
    content: 'Use this search box to find announcements by title. Works across both news posts and calendar events.',
    position: 'bottom' as const,
    tip: 'Search is case-insensitive and matches partial titles'
  },
  {
    id: 'urgent-filter',
    title: 'Filter Urgent Items',
    description: 'Show only urgent announcements',
    target: '[data-tutorial="urgent-filter"]',
    content: 'Toggle this to show only urgent announcements that appear as homepage banners.',
    position: 'left' as const,
    tip: 'Urgent items are automatically promoted to news posts'
  }
];

type AnnouncementItem = {
  id: string;
  title: string;
  date: Date;
  type: 'news' | 'event' | 'both';
  isUrgent: boolean;
  attachment?: string;
  source: 'news' | 'calendar';
  originalData: NewsPostWithId | CalendarEventWithId;
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AnnouncementItem | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { startTutorial } = useTutorial();

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      
      // Load both news posts and calendar events
      const [newsData, calendarData] = await Promise.all([
        db.news.getAll(),
        db.calendar.getAll()
      ]);

      const combinedAnnouncements: AnnouncementItem[] = [];

      // Add news posts
      newsData.forEach(post => {
        combinedAnnouncements.push({
          id: `news-${post.id}`,
          title: post.title_en,
          date: post.createdAt,
          type: 'news',
          isUrgent: post.isUrgent || false,
          attachment: post.attachment,
          source: 'news',
          originalData: post
        });
      });

      // Add calendar events
      calendarData.forEach(event => {
        combinedAnnouncements.push({
          id: `event-${event.id}`,
          title: event.title_en,
          date: event.eventDate,
          type: 'event',
          isUrgent: event.isUrgent || false,
          source: 'calendar',
          originalData: event
        });
      });

      // Sort by date (newest first)
      combinedAnnouncements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAnnouncements(combinedAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUrgent = !showUrgentOnly || item.isUrgent;
      return matchesSearch && matchesUrgent;
    });
  }, [announcements, searchQuery, showUrgentOnly]);

  const handleEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: AnnouncementItem) => {
    try {
      if (item.source === 'news') {
        const newsPost = item.originalData as NewsPostWithId;
        if (newsPost.attachment) {
          await deleteFile(newsPost.attachment);
        }
        await db.news.delete(newsPost.id);
      } else {
        const calendarEvent = item.originalData as CalendarEventWithId;
        await db.calendar.delete(calendarEvent.id);
      }

      toast({
        title: "Success",
        description: `${item.type === 'news' ? 'News post' : 'Calendar event'} deleted successfully.`,
      });
      
      await loadAnnouncements();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDeleteAlert = (item: AnnouncementItem) => {
    setItemToDelete(item);
    setDeleteAlertOpen(true);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    loadAnnouncements();
  };

  const isValidDate = (date: any) => {
    return date && !isNaN(new Date(date).getTime());
  };

  return (
    <>
      <div className="space-y-6" data-tutorial="announcements-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
              <HelpButton 
                tutorials={announcementsTutorials}
                onStartTutorial={() => {}}
              />
            </div>
            <p className="text-muted-foreground">Create and manage unified announcements that can be news posts, calendar events, or both.</p>
          </div>
          <Button data-tutorial="add-announcement-button" onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Announcement
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
              <div>
                <CardTitle>All Announcements</CardTitle>
                <CardDescription>A unified view of all news posts and calendar events.</CardDescription>
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
                    data-tutorial="search-announcements"
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
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attachment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnnouncements.length > 0 ? (
                      filteredAnnouncements.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {item.type === 'news' && <Newspaper className="h-4 w-4 text-blue-500" />}
                              {item.type === 'event' && <Calendar className="h-4 w-4 text-green-500" />}
                              <span className="capitalize">{item.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isValidDate(item.date) ? format(new Date(item.date), 'dd MMM yyyy') : 'Invalid date'}
                          </TableCell>
                          <TableCell>
                            {item.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.attachment && (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openDeleteAlert(item)} className="text-destructive focus:text-destructive">
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
                        <TableCell colSpan={6} className="h-24 text-center">
                          No announcements found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Update the announcement details below.' 
                : 'Fill out the form below to create a new announcement. Add a date to create a calendar event, body text to create a news post, or both!'}
            </DialogDescription>
          </DialogHeader>
          <AnnouncementForm
            existingData={editingItem?.originalData}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {itemToDelete?.type === 'news' ? 'news post' : 'calendar event'} "{itemToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  handleDelete(itemToDelete);
                  setDeleteAlertOpen(false);
                  setItemToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}