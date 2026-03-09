import React, { useState, useRef, useEffect } from "react";
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
  getImageDimensionsFromUrl,
  ImageValidationResult,
  ImageMetadata,
} from "@/lib/imageUtils";
import {
  getImageGuidance,
  getDetailedImageGuidance,
  isValidSection,
  checkAspectRatio,
  getFileSizeLimit,
  type ContentSection,
} from "@/lib/imageGuidance";
import { AspectRatioComparison, CroppingPreview } from "./AspectRatioPreview";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Settings,
  Info,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageUploadWithGuidanceProps {
  section: ContentSection;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  allowOptimization?: boolean;
  showMetadata?: boolean;
  showResponsivePreviews?: boolean;
}

export function ImageUploadWithGuidance({
  section,
  label,
  value,
  onChange,
  placeholder = "Upload an image or paste URL",
  allowOptimization = true,
  showMetadata = true,
  showResponsivePreviews = true,
}: ImageUploadWithGuidanceProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [validationResult, setValidationResult] = useState<ImageValidationResult | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [actualDimensions, setActualDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showGuidanceDialog, setShowGuidanceDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState({
    enabled: true,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: "jpeg" as const,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get guidance for the current section
  const guidance = isValidSection(section) ? getImageGuidance(section) : null;
  const detailedGuidance = isValidSection(section) ? getDetailedImageGuidance(section) : null;

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

  // Get actual dimensions when image URL changes
  useEffect(() => {
    if (value && value.startsWith('http')) {
      getImageDimensionsFromUrl(value)
        .then(dimensions => {
          setActualDimensions(dimensions);
        })
        .catch(() => {
          setActualDimensions(null);
        });
    } else {
      setActualDimensions(null);
    }
  }, [value]);

  const handleFileSelect = async (file: File) => {
    if (!guidance) {
      toast.error("Invalid section for image upload");
      return;
    }

    // Reset states
    setValidationResult(null);
    setImageMetadata(null);
    setActualDimensions(null);

    // Validate file
    const maxSizeMB = getFileSizeLimit(section) / (1024 * 1024);
    const validation = await validateImageFile(file, {
      maxSizeMB,
      minWidth: guidance.minDimensions.width,
      minHeight: guidance.minDimensions.height,
      maxWidth: guidance.width * 2, // Allow up to 2x recommended size
      maxHeight: guidance.height * 2,
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
      setActualDimensions({ width: metadata.width, height: metadata.height });

      // Check aspect ratio
      const aspectRatioMatch = checkAspectRatio(section, metadata.width, metadata.height);
      if (!aspectRatioMatch) {
        toast.warning(`Image aspect ratio (${metadata.aspectRatio.toFixed(2)}) doesn't match recommended ${guidance.aspectRatio}`);
      }
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
    setActualDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!guidance || !detailedGuidance) {
    return (
      <div className="text-red-500">
        Invalid section: {section}. Please check the section configuration.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header with Label and Guidance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium">{label}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">{guidance.description}</p>
                  <p className="text-sm text-muted-foreground">{guidance.optimizationTips}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showGuidanceDialog} onOpenChange={setShowGuidanceDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View Guidance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Image Guidance: {detailedGuidance.usage.description}</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="dimensions" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
                    <TabsTrigger value="responsive">Responsive</TabsTrigger>
                    <TabsTrigger value="optimization">Optimization</TabsTrigger>
                    <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dimensions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recommended Dimensions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">Recommended Size</p>
                            <p className="text-2xl font-bold text-primary">
                              {guidance.width} × {guidance.height}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Aspect Ratio: {guidance.aspectRatio}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Minimum Size</p>
                            <p className="text-lg">
                              {guidance.minDimensions.width} × {guidance.minDimensions.height}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              File Size: {guidance.fileSize}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Supported Formats</p>
                          <div className="flex gap-2">
                            {guidance.formats.map(format => (
                              <Badge key={format} variant="secondary">{format}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="responsive" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Responsive Behavior</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Monitor className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Desktop</p>
                              <p className="text-sm text-muted-foreground">{detailedGuidance.responsive.desktop}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Tablet className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Tablet</p>
                              <p className="text-sm text-muted-foreground">{detailedGuidance.responsive.tablet}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="font-medium">Mobile</p>
                              <p className="text-sm text-muted-foreground">{detailedGuidance.responsive.mobile}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="optimization" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Optimization Guidelines</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="font-medium">Quality Recommendation</p>
                          <p className="text-sm text-muted-foreground">{detailedGuidance.optimization.qualityRecommendation}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Performance Tips</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {detailedGuidance.optimization.performanceTips.map((tip, index) => (
                              <li key={index}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Best Practices</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {detailedGuidance.usage.bestPractices.map((practice, index) => (
                              <li key={index}>{practice}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="accessibility" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Accessibility & Organization</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="font-medium">Alt Text Guidance</p>
                          <p className="text-sm text-muted-foreground">{detailedGuidance.accessibility.altTextGuidance}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Naming Conventions</p>
                          <div className="flex flex-wrap gap-2">
                            {detailedGuidance.accessibility.namingConventions.map((convention, index) => (
                              <Badge key={index} variant="outline">{convention}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            {/* Preview Dialog */}
            {value && actualDimensions && (
              <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>Image Preview: How it will appear in {section} section</DialogTitle>
                  </DialogHeader>
                  
                  <Tabs defaultValue="comparison" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="comparison">Aspect Ratio</TabsTrigger>
                      <TabsTrigger value="cropping">Cropping Preview</TabsTrigger>
                      <TabsTrigger value="responsive">Responsive</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="comparison" className="space-y-4">
                      <AspectRatioComparison
                        section={section}
                        actualWidth={actualDimensions.width}
                        actualHeight={actualDimensions.height}
                        showMismatchWarning={true}
                      />
                    </TabsContent>
                    
                    <TabsContent value="cropping" className="space-y-4">
                      {!checkAspectRatio(section, actualDimensions.width, actualDimensions.height) ? (
                        <CroppingPreview
                          section={section}
                          imageUrl={value}
                          actualWidth={actualDimensions.width}
                          actualHeight={actualDimensions.height}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium">Perfect Aspect Ratio!</h3>
                          <p className="text-muted-foreground">
                            Your image matches the recommended aspect ratio perfectly. No cropping will occur.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="responsive" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Desktop Preview */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-blue-500" />
                              Desktop
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div 
                              className="relative bg-muted rounded overflow-hidden border"
                              style={{ 
                                aspectRatio: `${guidance.width} / ${guidance.height}`,
                                maxWidth: '200px'
                              }}
                            >
                              <img
                                src={value}
                                alt="Desktop preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {detailedGuidance.responsive.desktop}
                            </p>
                          </CardContent>
                        </Card>
                        
                        {/* Tablet Preview */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Tablet className="h-4 w-4 text-green-500" />
                              Tablet
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div 
                              className="relative bg-muted rounded overflow-hidden border"
                              style={{ 
                                aspectRatio: `${guidance.width} / ${guidance.height}`,
                                maxWidth: '150px'
                              }}
                            >
                              <img
                                src={value}
                                alt="Tablet preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {detailedGuidance.responsive.tablet}
                            </p>
                          </CardContent>
                        </Card>
                        
                        {/* Mobile Preview */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-purple-500" />
                              Mobile
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div 
                              className="relative bg-muted rounded overflow-hidden border"
                              style={{ 
                                aspectRatio: `${guidance.width} / ${guidance.height}`,
                                maxWidth: '100px'
                              }}
                            >
                              <img
                                src={value}
                                alt="Mobile preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {detailedGuidance.responsive.mobile}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Dimension Display */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-medium">Recommended:</span>
                <span className="ml-1 text-primary font-mono">
                  {guidance.width} × {guidance.height}
                </span>
                <span className="ml-2 text-muted-foreground">({guidance.aspectRatio})</span>
              </div>
              {actualDimensions && (
                <div>
                  <span className="font-medium">Actual:</span>
                  <span className="ml-1 font-mono">
                    {actualDimensions.width} × {actualDimensions.height}
                  </span>
                  <span className="ml-2">
                    {checkAspectRatio(section, actualDimensions.width, actualDimensions.height) ? (
                      <CheckCircle className="inline h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="inline h-4 w-4 text-orange-500" />
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="text-muted-foreground">
              {guidance.fileSize} • {guidance.formats.join(", ")}
            </div>
          </div>
        </div>

        {/* Preview */}
        {value && (
          <div className="relative group">
            <div 
              className="relative rounded-lg overflow-hidden border bg-secondary/50"
              style={{ 
                aspectRatio: `${guidance.width} / ${guidance.height}`,
                maxWidth: '400px'
              }}
            >
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
            accept="image/*"
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
                    {guidance.formats.join(", ")} • {guidance.fileSize}
                    {allowOptimization && " (will be optimized)"}
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
    </TooltipProvider>
  );
}