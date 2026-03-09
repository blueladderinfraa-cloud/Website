/**
 * Image Utilities
 * 
 * This module provides utilities for image processing, optimization, and validation
 * for the admin panel image management system.
 */

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  maintainAspectRatio?: boolean;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
  aspectRatio: number;
}

/**
 * Validates image file before upload
 */
export function validateImageFile(file: File, options: {
  maxSizeMB?: number;
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
} = {}): Promise<ImageValidationResult> {
  const {
    maxSizeMB = 10,
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    minWidth = 100,
    minHeight = 100,
    maxWidth = 4000,
    maxHeight = 4000,
  } = options;

  return new Promise((resolve) => {
    const result: ImageValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      result.isValid = false;
      result.errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`);
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      result.isValid = false;
      result.errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`);
    }

    // Check image dimensions
    if (file.type.startsWith("image/")) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        if (img.width < minWidth || img.height < minHeight) {
          result.isValid = false;
          result.errors.push(`Image dimensions (${img.width}x${img.height}) are too small. Minimum: ${minWidth}x${minHeight}`);
        }
        
        if (img.width > maxWidth || img.height > maxHeight) {
          result.warnings.push(`Image dimensions (${img.width}x${img.height}) are large. Consider resizing for better performance.`);
        }
        
        // Check aspect ratio for common use cases
        const aspectRatio = img.width / img.height;
        if (aspectRatio < 0.5 || aspectRatio > 3) {
          result.warnings.push(`Unusual aspect ratio (${aspectRatio.toFixed(2)}). Consider cropping for better display.`);
        }
        
        resolve(result);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        result.isValid = false;
        result.errors.push("Invalid image file or corrupted data");
        resolve(result);
      };
      
      img.src = url;
    } else {
      resolve(result);
    }
  });
}

/**
 * Gets metadata from an image file
 */
export function getImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        format: file.type,
        aspectRatio: img.width / img.height,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}

/**
 * Optimizes an image file by resizing and compressing
 */
export function optimizeImage(file: File, options: ImageOptimizationOptions = {}): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = "jpeg",
    maintainAspectRatio = true,
  } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let { width, height } = img;
      
      // Calculate new dimensions
      if (maintainAspectRatio) {
        const aspectRatio = width / height;
        
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      } else {
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error("Failed to optimize image"));
            }
          },
          `image/${format}`,
          quality
        );
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}

/**
 * Creates a thumbnail from an image file
 */
export function createThumbnail(file: File, size: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate thumbnail dimensions (square crop from center)
      const minDimension = Math.min(img.width, img.height);
      const sourceX = (img.width - minDimension) / 2;
      const sourceY = (img.height - minDimension) / 2;
      
      canvas.width = size;
      canvas.height = size;
      
      if (ctx) {
        ctx.drawImage(
          img,
          sourceX, sourceY, minDimension, minDimension,
          0, 0, size, size
        );
        
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}

/**
 * Generates responsive image sizes
 */
export function generateResponsiveSizes(file: File, sizes: number[] = [400, 800, 1200, 1600]): Promise<{ size: number; dataUrl: string }[]> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(url);
      
      const results: { size: number; dataUrl: string }[] = [];
      const aspectRatio = img.width / img.height;
      
      for (const targetWidth of sizes) {
        if (targetWidth <= img.width) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            const width = targetWidth;
            const height = Math.round(width / aspectRatio);
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            results.push({
              size: targetWidth,
              dataUrl: canvas.toDataURL("image/jpeg", 0.8),
            });
          }
        }
      }
      
      resolve(results);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}

/**
 * Converts image to different format
 */
export function convertImageFormat(file: File, targetFormat: "jpeg" | "png" | "webp", quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Fill with white background for JPEG
        if (targetFormat === "jpeg") {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, `.${targetFormat}`), {
                type: `image/${targetFormat}`,
                lastModified: Date.now(),
              });
              resolve(convertedFile);
            } else {
              reject(new Error("Failed to convert image"));
            }
          },
          `image/${targetFormat}`,
          quality
        );
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}

/**
 * Utility to format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Utility to get image dimensions from URL
 */
export function getImageDimensionsFromUrl(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image from URL"));
    };
    
    img.src = url;
  });
}

/**
 * Generates a placeholder image data URL
 */
export function generatePlaceholder(width: number, height: number, text?: string): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = width;
  canvas.height = height;
  
  if (ctx) {
    // Fill background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    if (text) {
      ctx.fillStyle = "#999";
      ctx.font = `${Math.min(width, height) / 10}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, width / 2, height / 2);
    }
    
    return canvas.toDataURL("image/png");
  }
  
  return "";
}