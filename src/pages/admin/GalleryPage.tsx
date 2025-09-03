import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import type { PhotoWithId } from '@/lib/types';
import { deleteFile } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PhotoForm } from '@/components/admin/PhotoForm';
import { HelpButton } from '@/components/tutorial/HelpButton';
import { useTutorial } from '@/contexts/TutorialProvider';

const galleryTutorials = [
  {
    id: 'gallery-overview',
    title: 'Photo Gallery Management',
    description: 'This page allows you to manage photos that will be visible to parents.',
    target: '[data-tutorial="gallery-overview"]',
    content: 'Here you can upload new photos, organize them by year groups, and manage the photo gallery that parents can access through their portal. Photos are displayed newest-first.',
    position: 'bottom' as const,
    tip: 'Photos should be appropriate for sharing with all parents and tagged with relevant year groups'
  },
  {
    id: 'upload-photo',
    title: 'Upload New Photos',
    description: 'Click this button to upload a new photo to the gallery.',
    target: '[data-tutorial="upload-photo"]',
    content: 'When uploading photos, you can add a caption, select which year groups the photo relates to, and the system will automatically organize them by date. Make sure photos are high quality and appropriate for sharing.',
    position: 'bottom' as const,
    tip: 'You can tag photos with multiple year groups if they show activities involving different classes'
  },
  {
    id: 'photo-grid',
    title: 'Photo Gallery Grid',
    description: 'All uploaded photos are displayed in a responsive grid layout.',
    target: '[data-tutorial="photo-grid"]',
    content: 'Each photo shows its caption, year group tags, and upload date. Hover over a photo to see the delete button. Photos are automatically resized to fit the grid while maintaining their aspect ratio.',
    position: 'top' as const,
    tip: 'The grid automatically adjusts to show more or fewer columns based on screen size'
  },
  {
    id: 'delete-photo',
    title: 'Delete Photos',
    description: 'Hover over any photo to reveal the delete button.',
    target: '[data-tutorial="delete-photo"]',
    content: 'You can remove photos from the gallery by clicking the delete button that appears when you hover over a photo. This will permanently remove the photo from both the gallery and storage.',
    position: 'left' as const,
    tip: 'Deleted photos cannot be recovered, so make sure you really want to remove them'
  },
  {
    id: 'load-more',
    title: 'Load More Photos',
    description: 'Use this button to load additional photos when there are more available.',
    target: '[data-tutorial="load-more"]',
    content: 'The gallery loads photos in batches to improve performance. When there are more photos available, this button will appear to load the next set.',
    position: 'top' as const,
    tip: 'Photos are loaded 12 at a time to keep the page responsive'
  }
];

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoWithId | null>(null);

  const { toast } = useToast();
  const { startTutorial } = useTutorial();

  const fetchPhotos = async (initial = false) => {
    if (initial) {
      setIsLoading(true);
      setLastDoc(undefined);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const { data, lastDoc: newLastDoc } = await db.getPaginatedPhotos(12, initial ? undefined : lastDoc);
      
      if (initial) {
        setPhotos(data);
      } else {
        setPhotos(prev => [...prev, ...data]);
      }
      setLastDoc(newLastDoc as any);
      setHasMore(!!newLastDoc);

    } catch (error) {
      console.error("Failed to fetch photos:", error);
      toast({
          title: "Error",
          description: "Could not fetch photo gallery.",
          variant: "destructive",
      });
    }
    
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchPhotos(true);
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchPhotos(true);
  };
  
  const openDeleteAlert = (photo: PhotoWithId) => {
    setPhotoToDelete(photo);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
      if (!photoToDelete) return;

      try {
        await deleteFile(photoToDelete.imageUrl);
        await db.deletePhoto(photoToDelete.id);

        toast({
            title: "Success",
            description: "Photo deleted successfully.",
        });
        fetchPhotos(true); // Refetch to show updated list
      } catch (error) {
        console.error("Error deleting photo:", error);
        toast({
            title: "Error",
            description: "Failed to delete photo. Please try again.",
            variant: "destructive",
        });
      } finally {
        setIsDeleteAlertOpen(false);
        setPhotoToDelete(null);
      }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div data-tutorial="gallery-overview">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Photo Gallery</h1>
                    <HelpButton 
                        tutorials={galleryTutorials}
                        onStartTutorial={() => startTutorial(galleryTutorials)}
                    />
                </div>
                <p className="text-muted-foreground">Upload and manage photos for the parent portal.</p>
            </div>
             <DialogTrigger asChild>
                <Button data-tutorial="upload-photo">
                    <PlusCircle className="mr-2 h-4 w-4" /> Upload Photo
                </Button>
            </DialogTrigger>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Photos</CardTitle>
            <CardDescription>Photos are shown newest-first.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-tutorial="photo-grid">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden group relative">
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-sm font-semibold truncate">{photo.caption}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(photo.yearGroups) ? photo.yearGroups : []).map(yg => (
                          <Badge key={yg} variant="secondary" className="text-xs">{yg}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-white/80 mt-2">{format(new Date(photo.uploadedAt), "dd MMM yyyy")}</p>
                    </div>
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openDeleteAlert(photo)}
                        data-tutorial="delete-photo"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <p className="text-muted-foreground">No photos have been uploaded yet.</p>
                </div>
            )}
            {hasMore && (
                <div className="flex justify-center mt-6">
                <Button onClick={() => fetchPhotos(false)} disabled={isLoadingMore} data-tutorial="load-more">
                    {isLoadingMore ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    Load More
                </Button>
                </div>
            )}
          </CardContent>
        </Card>
        
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This will permanently delete the photo. This action cannot be undone.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload a New Photo</DialogTitle>
          <DialogDescription>
            Select a photo and tag the relevant year groups.
          </DialogDescription>
        </DialogHeader>
        <PhotoForm onSuccess={handleFormSuccess} />
      </DialogContent>
    </Dialog>
  );
}
