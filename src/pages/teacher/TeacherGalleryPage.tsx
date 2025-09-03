import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { PhotoForm } from '@/components/admin/PhotoForm';
import { db } from '@/lib/db';
import type { PhotoWithId } from '@/lib/types';



const TeacherGalleryPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const photosPerPage = 12;

  const content = {
    en: {
      title: 'Photo Gallery',
      description: 'Manage and view school photos',
      addPhoto: 'Add Photo',
      deletePhoto: 'Delete Photo',
      confirmDelete: 'Are you sure you want to delete this photo?',
      deleteDescription: 'This action cannot be undone.',
      cancel: 'Cancel',
      delete: 'Delete',
      uploadedBy: 'Uploaded by',
      noPhotos: 'No photos available',

    },
    cy: {
      title: 'Oriel Lluniau',
      description: 'Rheoli a gweld lluniau ysgol',
      addPhoto: 'Ychwanegu Llun',
      deletePhoto: 'Dileu Llun',
      confirmDelete: 'Ydych chi\'n siŵr eich bod am ddileu\'r llun hwn?',
      deleteDescription: 'Ni ellir dadwneud y weithred hon.',
      cancel: 'Canslo',
      delete: 'Dileu',
      uploadedBy: 'Wedi\'i lwytho gan',
      noPhotos: 'Dim lluniau ar gael',

    }
  };

  const fetchPhotos = async (initial = false) => {
    if (initial) {
      setLoading(true);
      setLastDoc(undefined);
    }
    
    try {
      const { data, lastDoc: newLastDoc } = await db.getPaginatedPhotos(photosPerPage, initial ? undefined : lastDoc);
      
      if (initial) {
        setPhotos(data);
      } else {
        setPhotos(prev => [...prev, ...data]);
      }
      setLastDoc(newLastDoc as any);
      
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(true);
  }, []);

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await db.deletePhoto(photoId);
      await fetchPhotos(true);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handlePhotoUploaded = () => {
    setIsUploadDialogOpen(false);
    fetchPhotos(true);
  };

  const handleLoadMore = () => {
    fetchPhotos(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">
                {content[language].title}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {content[language].description}
              </p>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {content[language].addPhoto}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{content[language].addPhoto}</DialogTitle>
                </DialogHeader>
                <PhotoForm onSuccess={handlePhotoUploaded} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{content[language].noPhotos}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {photo.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="text-xs">
                          {content[language].uploadedBy}: {photo.uploadedBy}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {content[language].deletePhoto}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {content[language].confirmDelete}
                                <br />
                                {content[language].deleteDescription}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {content[language].cancel}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {content[language].delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Load More */}
              {photos.length >= photosPerPage && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherGalleryPage;
