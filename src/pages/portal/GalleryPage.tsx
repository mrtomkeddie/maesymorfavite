

import { Card } from "@/components/ui/card";
import { Camera, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db';
import type { PhotoWithId } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { parentChildrenYearGroups } from '@/lib/mockData';
import { useLanguage } from "@/contexts/LanguageProvider";

const content = {
  en: {
    title: "Photo Gallery",
    description: "Recent photos from your children's classes and school events.",
    filterLabel: "Filter by class:",
    noPhotosTitle: "No Photos Yet",
    noPhotosDescription1: "There are no photos to display for your children's classes at the moment.",
    noPhotosDescription2: "Please check back soon!",
  },
  cy: {
    title: "Oriel Ffotograffau",
    description: "Lluniau diweddar o ddosbarthiadau eich plant a digwyddiadau ysgol.",
    filterLabel: "Hidlo yn ôl dosbarth:",
    noPhotosTitle: "Dim Lluniau Eto",
    noPhotosDescription1: "Nid oes unrhyw luniau i'w harddangos ar gyfer dosbarthiadau eich plant ar hyn o bryd.",
    noPhotosDescription2: "Gwiriwch yn ôl yn fuan!",
  }
};

export default function GalleryPage() {
  const { language } = useLanguage();
  const t = content[language];
  const [photos, setPhotos] = useState<PhotoWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchAndSetPhotos = async () => {
      setIsLoading(true);
      try {
        // Fetch all photos relevant to any of the parent's children
        const relevantPhotos = await db.getPhotosForYearGroups(parentChildrenYearGroups);
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

  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'All') {
      return photos;
    }
    return photos.filter(photo => photo.yearGroups.includes(activeFilter));
  }, [photos, activeFilter]);
  
  const allParentYearGroups = useMemo(() => {
      const uniqueYears = new Set(parentChildrenYearGroups);
      return Array.from(uniqueYears);
  }, []);
  
  const filterOptions = ['All', ...allParentYearGroups];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <p className="text-muted-foreground">{t.description}</p>
      </div>
      
      {allParentYearGroups.length > 1 && (
         <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 flex-wrap">
          <p className="text-sm font-medium mr-2">{t.filterLabel}</p>
          {filterOptions.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredPhotos.length === 0 ? (
        <Card className="p-12 text-center">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.noPhotosTitle}</h3>
          <p className="text-muted-foreground mb-1">{t.noPhotosDescription1}</p>
          <p className="text-muted-foreground">{t.noPhotosDescription2}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium mb-2">{photo.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {photo.yearGroups.map((yearGroup) => (
                    <Badge key={yearGroup} variant="secondary" className="text-xs">
                      {yearGroup}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(photo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
