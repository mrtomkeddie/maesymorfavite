
'use client';

import { Card } from "@/components/ui/card";
import { Camera, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from 'react';
import { PhotoWithId, getPhotosForYearGroups } from '@/lib/firebase/firestore';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// In a real app, this would come from the parent's authenticated session
const parentChildrenYearGroups = ['Year 2', 'Year 5'];

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetPhotos = async () => {
      setIsLoading(true);
      try {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          console.log("Firebase not configured, gallery will be empty.");
          setPhotos([]);
          return;
        }
        const relevantPhotos = await getPhotosForYearGroups(parentChildrenYearGroups);
        setPhotos(relevantPhotos);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
        // Optionally set an error state to show a message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetPhotos();
  }, []);

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Photo Gallery</h1>
        <p className="text-muted-foreground">Recent photos from your children's classes and school events.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : photos.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">No Photos Yet</h2>
            <p className="mt-2 text-muted-foreground">
                There are no photos to display for your children's classes at the moment.
                <br />
                Please check back soon!
            </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden group relative transition-all hover:shadow-lg">
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption}
                  width={400}
                  height={400}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-sm font-semibold truncate group-hover:whitespace-normal group-hover:line-clamp-none">{photo.caption}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {photo.yearGroups.map(yg => <Badge key={yg} variant="secondary" className="text-xs">{yg}</Badge>)}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
