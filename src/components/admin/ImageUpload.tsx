'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export default function ImageUpload({ 
  onImagesUploaded, 
  maxImages = 5, 
  existingImages = [] 
}: ImageUploadProps) {
  const { storage } = useFirebase();
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if we're within the limit
    if (images.length + files.length > maxImages) {
      toast({
        title: 'Too many images',
        description: `You can only upload up to ${maxImages} images.`,
        variant: 'destructive',
      });
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Upload files
    uploadFiles(files);
  };

  const uploadFiles = async (files: FileList) => {
    if (!storage) {
      toast({
        title: 'Storage not available',
        description: 'Firebase Storage is not initialized.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `packages/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Wait for upload to complete
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                uploadedUrls.push(downloadURL);
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }

      // Update images state and notify parent
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesUploaded(newImages);
      
      toast({
        title: 'Upload successful',
        description: `${files.length} image(s) uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload images.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  const removePreview = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Package Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={image} 
                alt={`Package image ${index + 1}`} 
                className="w-full h-24 object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {previews.map((preview, index) => (
            <div key={`preview-${index}`} className="relative group">
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-24 object-cover rounded-md border animate-pulse"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={() => removePreview(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {images.length + previews.length < maxImages && (
            <div className="flex flex-col items-center justify-center">
              <label className="cursor-pointer w-full h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-md hover:bg-secondary transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mt-1">Add Image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
        
        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {Math.round(progress)}%
            </p>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">
          Upload up to {maxImages} images for this package. Supported formats: JPG, PNG, WEBP.
        </p>
      </CardContent>
    </Card>
  );
}