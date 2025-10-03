"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Download, Eye, X, ZoomIn } from 'lucide-react';

interface ProofPhoto {
  url: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  uploaded_at?: string;
}

interface ProofPhotosDisplayProps {
  photos: (string | ProofPhoto)[];
  taskId: string;
  taskTitle: string;
  className?: string;
}

export function ProofPhotosDisplay({ 
  photos, 
  taskId, 
  taskTitle, 
  className = "" 
}: ProofPhotosDisplayProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Extract URLs from photos (handle both string and object formats)
  const getPhotoUrl = (photo: string | ProofPhoto): string => {
    return typeof photo === 'string' ? photo : photo.url;
  };

  // Get all photo URLs
  const photoUrls = photos.map(getPhotoUrl);

  // Handle image load errors
  const handleImageError = (photoUrl: string) => {
    setImageErrors(prev => new Set([...prev, photoUrl]));
  };

  // Download image
  const handleDownload = async (photoUrl: string, index: number) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${taskId}-proof-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // If no photos, don't render anything
  if (!photos || photos.length === 0) {
    return null;
  }

  // Filter out errored images
  const validPhotos = photoUrls.filter(photoUrl => !imageErrors.has(photoUrl));

  if (validPhotos.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Camera className="h-4 w-4" />
            Proof Photos
            <Badge variant="secondary" className="ml-auto">
              {photoUrls.length} photo{photoUrls.length !== 1 ? 's' : ''} (failed to load)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Photos could not be loaded
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Camera className="h-4 w-4" />
          Proof Photos
          <Badge variant="secondary" className="ml-auto">
            {validPhotos.length} photo{validPhotos.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {validPhotos.map((photoUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={photoUrl}
                  alt={`Proof photo ${index + 1} for ${taskTitle}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={() => handleImageError(photoUrl)}
                  loading="lazy"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedPhoto(photoUrl)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                      <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center justify-between">
                          <span>Proof Photo {index + 1}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(photoUrl, index)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="p-6 pt-4">
                        <div className="relative">
                          <img
                            src={photoUrl}
                            alt={`Proof photo ${index + 1} for ${taskTitle}`}
                            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownload(photoUrl, index)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Photo number badge */}
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 h-6 w-6 p-0 flex items-center justify-center text-xs"
              >
                {index + 1}
              </Badge>
            </div>
          ))}
        </div>
        
        {/* Summary info */}
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Task: {taskTitle}</span>
            <span>ID: {taskId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified version for inline display
export function ProofPhotosInline({ 
  photos, 
  className = "" 
}: { 
  photos: (string | ProofPhoto)[]; 
  className?: string; 
}) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Extract URLs from photos (handle both string and object formats)
  const getPhotoUrl = (photo: string | ProofPhoto): string => {
    return typeof photo === 'string' ? photo : photo.url;
  };

  // Get all photo URLs
  const photoUrls = photos.map(getPhotoUrl);

  const handleImageError = (photoUrl: string) => {
    setImageErrors(prev => new Set([...prev, photoUrl]));
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  const validPhotos = photoUrls.filter(photoUrl => !imageErrors.has(photoUrl));

  if (validPhotos.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
        <Camera className="h-3 w-3" />
        <span>{photoUrls.length} photo{photoUrls.length !== 1 ? 's' : ''} (failed to load)</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        {validPhotos.slice(0, 3).map((photoUrl, index) => (
          <div key={index} className="relative">
            <img
              src={photoUrl}
              alt={`Proof ${index + 1}`}
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
              onError={() => handleImageError(photoUrl)}
            />
          </div>
        ))}
        {validPhotos.length > 3 && (
          <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
            +{validPhotos.length - 3}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Camera className="h-3 w-3" />
        <span>{validPhotos.length}</span>
      </div>
    </div>
  );
}
