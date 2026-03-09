import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2, GripVertical, Star } from "lucide-react";

interface ProjectImage {
  id?: number;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
  isCover?: boolean;
}

interface MultiImageUploadProps {
  projectId?: number;
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  coverImageUrl?: string;
  onCoverImageChange?: (url: string) => void;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  projectId,
  images,
  onChange,
  coverImageUrl,
  onCoverImageChange,
  label = "Project Images",
  maxImages = 15,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data: { url: string; fileKey: string }) => {
      const newImage: ProjectImage = {
        imageUrl: data.url,
        sortOrder: images.length,
        isCover: images.length === 0, // First image is cover by default
      };
      
      const updatedImages = [...images, newImage];
      onChange(updatedImages);
      
      // Set as cover image if it's the first one
      if (images.length === 0 && onCoverImageChange) {
        onCoverImageChange(data.url);
      }
      
      toast.success("Image uploaded successfully!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to upload image");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    
    if (images.length + validFiles.length > maxImages) {
      toast.error(`Cannot upload more than ${maxImages} images per project`);
      return;
    }

    setIsUploading(true);

    // Upload files one by one
    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        uploadMutation.mutate({
          base64,
          filename: file.name,
          contentType: file.type,
        });
      };
      reader.onerror = () => {
        toast.error(`Failed to read ${file.name}`);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    const updatedImages = images.filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, sortOrder: i }));
    
    onChange(updatedImages);
    
    // If removed image was cover, set first image as cover
    if (imageToRemove.isCover && updatedImages.length > 0 && onCoverImageChange) {
      onCoverImageChange(updatedImages[0].imageUrl);
    }
  };

  const setCoverImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isCover: i === index
    }));
    onChange(updatedImages);
    
    if (onCoverImageChange) {
      onCoverImageChange(images[index].imageUrl);
    }
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    
    // Update sort orders
    const reorderedImages = updatedImages.map((img, i) => ({
      ...img,
      sortOrder: i
    }));
    
    onChange(reorderedImages);
  };

  const addImageByUrl = (url: string) => {
    if (!url.trim()) return;
    
    if (images.length >= maxImages) {
      toast.error(`Cannot add more than ${maxImages} images per project`);
      return;
    }

    const newImage: ProjectImage = {
      imageUrl: url.trim(),
      sortOrder: images.length,
      isCover: images.length === 0,
    };
    
    const updatedImages = [...images, newImage];
    onChange(updatedImages);
    
    if (images.length === 0 && onCoverImageChange) {
      onCoverImageChange(url.trim());
    }
  };

  return (
    <div className="space-y-4">
      {label && <Label className="text-gray-700 font-medium">{label}</Label>}
      
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                <img
                  src={image.imageUrl}
                  alt={image.caption || `Project image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E";
                  }}
                />
                
                {/* Cover Image Indicator */}
                {image.isCover && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Cover
                  </div>
                )}
                
                {/* Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setCoverImage(index)}
                      className="bg-white text-gray-800 hover:bg-gray-100"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Drag Handle */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                  <GripVertical className="h-4 w-4 text-white drop-shadow-lg" />
                </div>
              </div>
              
              {/* Image Counter */}
              <div className="text-center text-xs text-gray-500 mt-1">
                {index + 1} of {images.length}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-colors
            ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
            ${isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-sm text-gray-600">Uploading images...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-blue-100">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop images here or click to upload
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB each • {images.length}/{maxImages} images
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* URL Input */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">or</span>
        <Input
          type="text"
          placeholder="Paste image URL and press Enter"
          className="flex-1 border-2 border-gray-200 focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addImageByUrl((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      </div>
      
      {/* Image Count Info */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="font-medium">Gallery: {images.length} image{images.length !== 1 ? 's' : ''}</p>
          <p className="text-xs mt-1">
            Click the star icon to set a cover image • Drag images to reorder • First image is cover by default
          </p>
        </div>
      )}
    </div>
  );
}