import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface ProjectImage {
  id?: number;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
  isCover?: boolean;
}

interface SimpleMultiImageUploadProps {
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  onCoverImageChange?: (url: string) => void;
}

export function SimpleMultiImageUpload({
  images,
  onChange,
  onCoverImageChange,
}: SimpleMultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data: { url: string; fileKey: string }) => {
      // Create new image object
      const newImage: ProjectImage = {
        imageUrl: data.url,
        sortOrder: images.length,
        isCover: images.length === 0,
      };
      
      // Add to existing images
      const updatedImages = [...images, newImage];
      
      // Update parent component
      onChange(updatedImages);
      
      // Set cover image if this is the first image
      if (images.length === 0 && onCoverImageChange) {
        onCoverImageChange(data.url);
      }
      
      setIsUploading(false);
      toast.success("Photo uploaded successfully!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to upload photo");
      setIsUploading(false);
    },
  });

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

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
      toast.error("Failed to read file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const addImageByUrl = () => {
    if (!urlInput.trim()) return;
    
    const newImage: ProjectImage = {
      imageUrl: urlInput.trim(),
      sortOrder: images.length,
      isCover: images.length === 0,
    };
    
    const updatedImages = [...images, newImage];
    onChange(updatedImages);
    
    if (images.length === 0 && onCoverImageChange) {
      onCoverImageChange(urlInput.trim());
    }
    
    setUrlInput("");
    toast.success("Photo added!");
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, sortOrder: i }));
    
    onChange(updatedImages);
    
    if (updatedImages.length > 0 && onCoverImageChange) {
      onCoverImageChange(updatedImages[0].imageUrl);
    } else if (updatedImages.length === 0 && onCoverImageChange) {
      onCoverImageChange('');
    }
    
    toast.success("Photo removed!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      files.forEach((file) => {
        handleFileUpload(file);
      });
      
      // Clear the input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-gray-700 font-medium">Project Photos ({images.length})</Label>
      
      {/* Photo Grid - This shows your uploaded photos */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {images.map((image, index) => (
            <div key={`${image.imageUrl}-${index}`} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
                <img
                  src={image.imageUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' fill='%23ccc'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14' fill='%23999'%3EImage not found%3C/text%3E%3C/svg%3E"; }}
                />
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg border-2 border-white"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
                {/* Cover Label */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Cover Photo
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          <Upload className="h-12 w-12 text-blue-500" />
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700">
              {isUploading ? "Uploading photos..." : "Click to upload photos"}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Select multiple photos (PNG, JPG, GIF up to 5MB each)
            </div>
          </div>
        </label>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Or paste photo URL here"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1"
        />
        <Button type="button" onClick={addImageByUrl} disabled={!urlInput.trim()}>
          Add Photo
        </Button>
      </div>
    </div>
  );
}