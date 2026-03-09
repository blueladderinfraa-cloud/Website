import React from 'react';
import { getImageGuidance, type ContentSection } from '@/lib/imageGuidance';
import { generatePlaceholder } from '@/lib/imageUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AspectRatioPreviewProps {
  section: ContentSection;
  showDimensions?: boolean;
  showDescription?: boolean;
  maxWidth?: number;
  className?: string;
}

export function AspectRatioPreview({
  section,
  showDimensions = true,
  showDescription = true,
  maxWidth = 300,
  className = '',
}: AspectRatioPreviewProps) {
  const guidance = getImageGuidance(section);
  
  if (!guidance) {
    return (
      <div className="text-red-500 text-sm">
        Invalid section: {section}
      </div>
    );
  }

  // Generate placeholder image
  const placeholderUrl = generatePlaceholder(
    guidance.width, 
    guidance.height, 
    `${guidance.width} × ${guidance.height}\n${guidance.aspectRatio}`
  );

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {showDescription && (
            <div>
              <h4 className="font-medium text-sm">{guidance.description}</h4>
              <Badge variant="secondary" className="mt-1">
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Badge>
            </div>
          )}
          
          <div 
            className="relative bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25"
            style={{ 
              aspectRatio: `${guidance.width} / ${guidance.height}`,
              maxWidth: `${maxWidth}px`
            }}
          >
            {placeholderUrl ? (
              <img
                src={placeholderUrl}
                alt={`${section} aspect ratio preview`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-mono">
                    {guidance.width} × {guidance.height}
                  </div>
                  <div className="text-sm">
                    {guidance.aspectRatio}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {showDimensions && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Recommended:</span>
                <span className="font-mono">{guidance.width} × {guidance.height}</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum:</span>
                <span className="font-mono">{guidance.minDimensions.width} × {guidance.minDimensions.height}</span>
              </div>
              <div className="flex justify-between">
                <span>Aspect Ratio:</span>
                <span>{guidance.aspectRatio}</span>
              </div>
              <div className="flex justify-between">
                <span>File Size:</span>
                <span>{guidance.fileSize}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AspectRatioGridProps {
  sections: ContentSection[];
  maxWidth?: number;
  columns?: number;
  className?: string;
}

export function AspectRatioGrid({
  sections,
  maxWidth = 200,
  columns = 3,
  className = '',
}: AspectRatioGridProps) {
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {sections.map(section => (
        <AspectRatioPreview
          key={section}
          section={section}
          maxWidth={maxWidth}
          showDescription={true}
          showDimensions={false}
        />
      ))}
    </div>
  );
}

interface AspectRatioComparisonProps {
  section: ContentSection;
  actualWidth?: number;
  actualHeight?: number;
  showMismatchWarning?: boolean;
  className?: string;
}

export function AspectRatioComparison({
  section,
  actualWidth,
  actualHeight,
  showMismatchWarning = true,
  className = '',
}: AspectRatioComparisonProps) {
  const guidance = getImageGuidance(section);
  
  if (!guidance) {
    return null;
  }

  const expectedRatio = guidance.width / guidance.height;
  const actualRatio = actualWidth && actualHeight ? actualWidth / actualHeight : null;
  const ratioMatch = actualRatio ? Math.abs(expectedRatio - actualRatio) <= 0.1 : false;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Expected Preview */}
        <div>
          <h4 className="text-sm font-medium mb-2">Expected</h4>
          <AspectRatioPreview
            section={section}
            showDescription={false}
            showDimensions={true}
            maxWidth={200}
          />
        </div>
        
        {/* Actual Preview */}
        {actualWidth && actualHeight && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Actual
              {ratioMatch ? (
                <Badge variant="default" className="ml-2 bg-green-500">
                  ✓ Match
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-2">
                  ⚠ Mismatch
                </Badge>
              )}
            </h4>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div 
                  className="relative bg-muted rounded-lg overflow-hidden border-2 border-dashed"
                  style={{ 
                    aspectRatio: `${actualWidth} / ${actualHeight}`,
                    maxWidth: '200px'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-lg font-mono">
                        {actualWidth} × {actualHeight}
                      </div>
                      <div className="text-sm">
                        {actualRatio?.toFixed(2)}:1
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="font-mono">{actualWidth} × {actualHeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aspect Ratio:</span>
                    <span>{actualRatio?.toFixed(2)}:1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Mismatch Warning */}
      {showMismatchWarning && actualRatio && !ratioMatch && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-orange-500 mt-0.5">⚠</div>
            <div className="text-sm">
              <p className="font-medium text-orange-800">Aspect Ratio Mismatch</p>
              <p className="text-orange-700 mt-1">
                Your image has a {actualRatio.toFixed(2)}:1 aspect ratio, but {guidance.aspectRatio} is recommended for {section} images. 
                The image may be cropped or stretched when displayed.
              </p>
              <p className="text-orange-600 text-xs mt-2">
                Consider resizing your image to {guidance.width} × {guidance.height} or a proportional size.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CroppingPreviewProps {
  section: ContentSection;
  imageUrl: string;
  actualWidth: number;
  actualHeight: number;
  className?: string;
}

export function CroppingPreview({
  section,
  imageUrl,
  actualWidth,
  actualHeight,
  className = '',
}: CroppingPreviewProps) {
  const guidance = getImageGuidance(section);
  
  if (!guidance) {
    return null;
  }

  const expectedRatio = guidance.width / guidance.height;
  const actualRatio = actualWidth / actualHeight;
  
  // Calculate how the image will be cropped
  let cropStyle: React.CSSProperties = {};
  let cropDescription = '';
  
  if (actualRatio > expectedRatio) {
    // Image is wider than expected - will crop sides
    const cropWidth = (actualHeight * expectedRatio) / actualWidth * 100;
    cropStyle = {
      width: `${cropWidth}%`,
      height: '100%',
      objectPosition: 'center',
    };
    cropDescription = 'Image will be cropped on the sides to fit the aspect ratio.';
  } else if (actualRatio < expectedRatio) {
    // Image is taller than expected - will crop top/bottom
    const cropHeight = (actualWidth / expectedRatio) / actualHeight * 100;
    cropStyle = {
      width: '100%',
      height: `${cropHeight}%`,
      objectPosition: 'center',
    };
    cropDescription = 'Image will be cropped on the top and bottom to fit the aspect ratio.';
  } else {
    // Perfect match
    cropStyle = {
      width: '100%',
      height: '100%',
    };
    cropDescription = 'Image aspect ratio matches perfectly - no cropping needed.';
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Original Image */}
        <div>
          <h4 className="text-sm font-medium mb-2">Original Image</h4>
          <div 
            className="relative bg-muted rounded-lg overflow-hidden border"
            style={{ 
              aspectRatio: `${actualWidth} / ${actualHeight}`,
              maxWidth: '200px'
            }}
          >
            <img
              src={imageUrl}
              alt="Original image"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {actualWidth} × {actualHeight} ({actualRatio.toFixed(2)}:1)
          </p>
        </div>
        
        {/* Cropped Preview */}
        <div>
          <h4 className="text-sm font-medium mb-2">How It Will Display</h4>
          <div 
            className="relative bg-muted rounded-lg overflow-hidden border"
            style={{ 
              aspectRatio: `${guidance.width} / ${guidance.height}`,
              maxWidth: '200px'
            }}
          >
            <img
              src={imageUrl}
              alt="Cropped preview"
              className="object-cover"
              style={cropStyle}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {guidance.width} × {guidance.height} ({guidance.aspectRatio})
          </p>
        </div>
      </div>
      
      {/* Cropping Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-500 mt-0.5">ℹ</div>
          <div className="text-sm">
            <p className="font-medium text-blue-800">Cropping Preview</p>
            <p className="text-blue-700 mt-1">{cropDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}