
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { getPaginatedPhotos, deletePhoto, PhotoWithId } from '@/lib/firebase/firestore';
import { deleteFile } from '@/lib/firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PhotoForm } from '@/components/admin/PhotoForm';


export default function GalleryAdminPage() {
  const [photos, setPhotos] = useState<PhotoWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoWithId | null>(null);

  const { toast } = useToast();

  const fetchPhotos = async (initial = false) => {
    if (initial) {
      setIsLoading(true);
      setLastDoc(undefined);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) throw new Error("Firebase not configured");
      const { data, lastDoc: newLastDoc } = await getPaginatedPhotos(12, initial ? undefined : lastDoc);
      
      if (initial) {
        setPhotos(data);
      } else {
        setPhotos(prev => [...prev, ...data]);
      }
      setLastDoc(newLastDoc);
      setHasMore(!!newLastDoc && data.length === 12);

    } catch (error) {
      console.log('Firebase not configured, using mock data for photo gallery');
      setPhotos([]);
      setHasMore(false);
    }
    
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchPhotos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await deletePhoto(photoToDelete.id);

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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Photo Gallery</h1>
                <p className="text-muted-foreground">Upload and manage photos for the parent portal.</p>
            </div>
             <DialogTrigger asChild>
                <Button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden group relative">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.caption}
                      width={400}
                      height={400}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-sm font-semibold truncate">{photo.caption}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photo.yearGroups.map(yg => <Badge key={yg} variant="secondary" className="text-xs">{yg}</Badge>)}
                      </div>
                      <p className="text-xs text-white/80 mt-2">{format(new Date(photo.uploadedAt), "dd MMM yyyy")}</p>
                    </div>
                     <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openDeleteAlert(photo)}
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
                <Button onClick={() => fetchPhotos(false)} disabled={isLoadingMore}>
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
