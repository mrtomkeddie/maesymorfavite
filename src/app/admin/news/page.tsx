
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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

import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, FileText, ExternalLink } from 'lucide-react';
import { NewsForm } from '@/components/admin/NewsForm';
import { getNews, deleteNews, NewsPostWithId, getPaginatedNews } from '@/lib/firebase/firestore';
import { deleteFile } from '@/lib/firebase/storage';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { news } from '@/lib/mockNews';

export default function NewsAdminPage() {
  const [news, setNews] = useState<NewsPostWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsPostWithId | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<NewsPostWithId | null>(null);

  const { toast } = useToast();

  const fetchNews = async (initial = false) => {
    if (initial) {
      setIsLoading(true);
      setLastDoc(undefined);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      // Check if Firebase is properly configured
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        throw new Error('Firebase not configured');
      }
      
      const { data, lastDoc: newLastDoc } = await getPaginatedNews(20, initial ? undefined : lastDoc);
      if (initial) {
        setNews(data);
      } else {
        setNews(prev => [...prev, ...data]);
      }
      setLastDoc(newLastDoc);
      setHasMore(!!newLastDoc && data.length === 20);
    } catch (error) {
      console.log('Firebase not configured, using mock data');
      // Use mock data if Firebase fails
      const mockNewsData = news.map((post, index) => ({
        ...post,
        id: `mock_${index}`
      }));
      
      if (initial) {
        setNews(mockNewsData);
      } else {
        setNews(prev => [...prev, ...mockNewsData]);
      }
      setHasMore(false); // No more mock data to load
    }
    
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchNews(true);
  }, []);

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
        await deleteNews(newsToDelete.id);

        if (newsToDelete.attachmentUrl) {
           await deleteFile(newsToDelete.attachmentUrl);
        }

        toast({
            title: "Success",
            description: "News post deleted successfully.",
            variant: "default",
        });
        fetchNews();
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) setSelectedNews(null);
    }}>
      <div className="space-y-6">
        <p className="text-muted-foreground">Create, edit, and manage all school announcements.</p>
        

        <Card>
          <CardHeader>
            <CardTitle>Published News</CardTitle>
            <CardDescription>A list of all current news posts and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
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
                    {news.length > 0 ? (
                      news.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title_en}</TableCell>
                          <TableCell>{format(new Date(post.date), 'dd MMM yyyy')}</TableCell>
                           <TableCell>
                            {post.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                           </TableCell>
                           <TableCell>
                            {post.attachmentUrl && (
                                <a href={post.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                                    <FileText className="h-4 w-4" /> View
                                </a>
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
                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => fetchNews(false)} disabled={isLoadingMore}>
                      {isLoadingMore ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                      Load More
                    </Button>
                  </div>
                )}
              </>
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

       <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNews ? 'Edit' : 'Create'} News Post</DialogTitle>
            <DialogDescription>
              Fill in the details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <NewsForm
            onSuccess={handleFormSuccess}
            existingNews={selectedNews}
          />
        </DialogContent>
    </Dialog>
  );
}

    

    
