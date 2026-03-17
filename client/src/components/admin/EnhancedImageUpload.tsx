import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  validateImageFile,
  optimizeImage,
  getImageMetadata,
  formatFileSize,
  ImageValidationResult,
  ImageMetadata,
} from "@/lib/imageUtils";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface EnhancedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  maxSizeMB?: number;
  allowOptimization?: boolean;
  showMetadata?: boolean;
  validationOptions?: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowedTypes?: string[];
  };
}

export default function EnhancedImageUpload({
  value,
  onChange,
  label = "Image",
  placeholder = "Upload an image or paste URL",
  accept = "image/*",
  maxSizeMB = 5,
  allowOptimization = true,
  showMetadata = true,
  validationOptions = {},
}: EnhancedImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [validationResult, setValidationResult] = useState<ImageValidationResult | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [optimizationSettings, setOptimizationSettings] = useState({
    enabled: true,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: "jpeg" as const,
  });
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data: { url: string; fileKey: string }) => {
      onChange(data.url);
      toast.success("Image uploaded successfully!");
      setUploadProgress(100);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to upload image");
      setUploadProgress(0);
    },
    onSettled: () => {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    },
  });

  const handleFileSelect = async (file: File) => {
    // Reset states
    setValidationResult(null);
    setImageMetadata(null);

    // Validate file
    const validation = await validateImageFile(file, {
      maxSizeMB,
      ...validationOptions,
    });
    setValidationResult(validation);

    // Show validation errors
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    // Show validation warnings
    validation.warnings.forEach(warning => toast.warning(warning));

    // Get image metadata
    try {
      const metadata = await getImageMetadata(file);
      setImageMetadata(metadata);
    } catch (error) {
      console.warn("Failed to get image metadata:", error);
    }

    // Optimize image if enabled
    let fileToUpload = file;
    if (allowOptimization && optimizationSettings.enabled) {
      try {
        toast.info("Optimizing image...");
        fileToUpload = await optimizeImage(file, {
          maxWidth: optimizationSettings.maxWidth,
          maxHeight: optimizationSettings.maxHeight,
          quality: optimizationSettings.quality,
          format: optimizationSettings.format,
        });
        toast.success(`Image optimized: ${formatFileSize(file.size)} → ${formatFileSize(fileToUpload.size)}`);
      } catch (error) {
        console.warn("Failed to optimize image:", error);
        toast.warning("Image optimization failed, uploading original");
      }
    }

    // Upload file
    setIsUploading(true);
    setUploadProgress(10);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      setUploadProgress(50);
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        base64,
        filename: fileToUpload.name,
        contentType: fileToUpload.type,
      });
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsUploading(false);
      setUploadProgress(0);
    };
    reader.readAsDataURL(fileToUpload);
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
    // Reset validation when URL is manually entered
    setValidationResult(null);
    setImageMetadata(null);
  };

  const clearImage = () => {
    onChange("");
    setValidationResult(null);
    setImageMetadata(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {label && <Label>{label}</Label>}
        {allowOptimization && (
          <Dialog open={showOptimizationDialog} onOpenChange={setShowOptimizationDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto p-1">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Image Optimization Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Optimization</Label>
                  <Switch
                    checked={optimizationSettings.enabled}
                    onCheckedChange={(enabled) =>
                      setOptimizationSettings({ ...optimizationSettings, enabled })
                    }
                  />
                </div>
                {optimizationSettings.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Max Width</Label>
                        <Input
                          type="number"
                          value={optimizationSettings.maxWidth}
                          onChange={(e) =>
                            setOptimizationSettings({
                              ...optimizationSettings,
                              maxWidth: parseInt(e.target.value) || 1920,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Height</Label>
                        <Input
                          type="number"
                          value={optimizationSettings.maxHeight}
                          onChange={(e) =>
                            setOptimizationSettings({
                              ...optimizationSettings,
                              maxHeight: parseInt(e.target.value) || 1080,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Quality ({Math.round(optimizationSettings.quality * 100)}%)</Label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={optimizationSettings.quality}
                        onChange={(e) =>
                          setOptimizationSettings({
                            ...optimizationSettings,
                            quality: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <select
                        value={optimizationSettings.format}
                        onChange={(e) =>
                          setOptimizationSettings({
                            ...optimizationSettings,
                            format: e.target.value as "jpeg" | "png" | "webp",
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WebP</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
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

      {/* Validation Status */}
      {validationResult && (
        <div className="space-y-2">
          {validationResult.isValid ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Image validation passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Image validation failed</span>
            </div>
          )}
          {validationResult.warnings.length > 0 && (
            <div className="text-xs text-orange-600 space-y-1">
              {validationResult.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Metadata */}
      {showMetadata && imageMetadata && (
        <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div>Dimensions: {imageMetadata.width} × {imageMetadata.height}</div>
            <div>Size: {formatFileSize(imageMetadata.size)}</div>
            <div>Format: {imageMetadata.format}</div>
            <div>Aspect Ratio: {imageMetadata.aspectRatio.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            Uploading... {uploadProgress}%
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
                  {allowOptimization && optimizationSettings.enabled && " (will be optimized)"}
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
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={handleUrlChange}
          className="flex-1"
        />
      </div>
    </div>
  );
}