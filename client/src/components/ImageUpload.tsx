import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  placeholder = "Upload an image or paste URL",
  accept = "image/*",
  maxSizeMB = 20,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data: { url: string; fileKey: string }) => {
      onChange(data.url);
      toast.success("Image uploaded successfully!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to upload image");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const parts = (reader.result as string).split(",");
      const base64 = parts.length > 1 ? parts[1] : null;
      if (!base64) {
        toast.error("Invalid file format");
        setIsUploading(false);
        return;
      }
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      {/* Preview */}
      {value && (
        <div className="relative group">
          <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden border bg-secondary/50">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E";
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
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
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drop an image here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF up to {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* URL Input (alternative) */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">or</span>
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleUrlChange}
          className="flex-1"
        />
      </div>
    </div>
  );
}

// Simplified version for inline use
export function ImageUploadInline({
  value,
  onChange,
  placeholder = "Upload image",
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data: { url: string; fileKey: string }) => {
      onChange(data.url);
      toast.success("Image uploaded!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Upload failed");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const parts = (reader.result as string).split(",");
      const base64 = parts.length > 1 ? parts[1] : null;
      if (!base64) {
        toast.error("Invalid file format");
        setIsUploading(false);
        return;
      }
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

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </Button>
      {value && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
