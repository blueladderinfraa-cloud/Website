# Design Document

## Overview

This design document outlines the implementation of an enhanced image guidance system for the admin panel content management interface. The system will provide clear visual and textual guidance for optimal image dimensions, improve the upload experience, and revert the hero section to use hardcoded content while maintaining dynamic content for other sections.

## Architecture

### Component Structure

```
AdminContentManager/
├── ImageUploadWithGuidance/
│   ├── DimensionGuidance
│   ├── AspectRatioPreview
│   ├── UploadProgress
│   └── ImagePreview
├── SectionSpecificGuidance/
│   ├── HeroImageGuidance
│   ├── AboutImageGuidance
│   ├── ServiceImageGuidance
│   └── TeamImageGuidance
└── ContentSectionManager/
    ├── HeroSectionManager (with reset capability, fully editable)
    ├── AboutSectionManager (dynamic)
    ├── ServicesSectionManager (dynamic)
    ├── ContactSectionManager (dynamic)
    └── BrandingSectionManager (logo and favicon management)
```

### Data Flow

1. **Image Upload Process**:
   - User selects image → Validation → Progress tracking → Upload → Preview generation → Success feedback

2. **Guidance Display**:
   - Section type detection → Dimension lookup → Guidance rendering → Preview generation

3. **Content Management**:
   - Hero section: Resettable to default image with full editing capabilities maintained
   - Other sections: Dynamic content via useContentManager hook
   - Branding: Logo and favicon management with live preview

## Components and Interfaces

### ImageUploadWithGuidance Component

```typescript
interface ImageUploadWithGuidanceProps {
  section: ContentSection;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
  fileSize: string;
  formats: string[];
  minDimensions: { width: number; height: number };
  responsiveInfo: string;
  optimizationTips: string;
}

interface SectionGuidance {
  [key: string]: ImageDimensions;
}
```

### Dimension Guidance Configuration

```typescript
const IMAGE_GUIDANCE: SectionGuidance = {
  hero: {
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    description: "Full-width hero background image",
    fileSize: "< 500KB",
    formats: ["JPEG", "WebP"],
    minDimensions: { width: 1200, height: 675 },
    responsiveInfo: "Displays full-width on desktop, cropped on mobile",
    optimizationTips: "Use WebP format for better compression"
  },
  about: {
    width: 800,
    height: 600,
    aspectRatio: "4:3",
    description: "About section feature image",
    fileSize: "< 200KB",
    formats: ["JPEG", "PNG", "WebP"],
    minDimensions: { width: 400, height: 300 },
    responsiveInfo: "Scales proportionally on all devices",
    optimizationTips: "Compress to 80% quality for optimal balance"
  },
  services: {
    width: 600,
    height: 400,
    aspectRatio: "3:2",
    description: "Service card images",
    fileSize: "< 150KB",
    formats: ["JPEG", "PNG", "WebP"],
    minDimensions: { width: 300, height: 200 },
    responsiveInfo: "Stacks vertically on mobile, grid on desktop",
    optimizationTips: "Use consistent lighting and composition"
  },
  team: {
    width: 300,
    height: 300,
    aspectRatio: "1:1",
    description: "Team member profile photos",
    fileSize: "< 100KB",
    formats: ["JPEG", "PNG"],
    minDimensions: { width: 150, height: 150 },
    responsiveInfo: "Circular crop on all devices",
    optimizationTips: "Center faces in frame for best results"
  },
  testimonials: {
    width: 150,
    height: 150,
    aspectRatio: "1:1",
    description: "Client profile photos",
    fileSize: "< 50KB",
    formats: ["JPEG", "PNG"],
    minDimensions: { width: 75, height: 75 },
    responsiveInfo: "Small circular thumbnails",
    optimizationTips: "High contrast photos work best"
  },
  projects: {
    width: 800,
    height: 600,
    aspectRatio: "4:3",
    description: "Project gallery images",
    fileSize: "< 300KB",
    formats: ["JPEG", "PNG", "WebP"],
    minDimensions: { width: 400, height: 300 },
    responsiveInfo: "Gallery grid layout, lightbox on click",
    optimizationTips: "Showcase key project features prominently"
  },
  logo: {
    width: 200,
    height: 80,
    aspectRatio: "5:2",
    description: "Company logo for navbar and footer",
    fileSize: "< 50KB",
    formats: ["PNG", "SVG", "WebP"],
    minDimensions: { width: 100, height: 40 },
    responsiveInfo: "Scales down on mobile, maintains aspect ratio",
    optimizationTips: "Use transparent background, high contrast for readability"
  },
  favicon: {
    width: 32,
    height: 32,
    aspectRatio: "1:1",
    description: "Browser favicon and app icon",
    fileSize: "< 10KB",
    formats: ["PNG", "ICO"],
    minDimensions: { width: 16, height: 16 },
    responsiveInfo: "Multiple sizes generated automatically",
    optimizationTips: "Simple design, recognizable at small sizes"
  }
};
```

### Enhanced ImageUpload Component

The existing `ImageUpload` component will be enhanced with:

1. **Dimension Display**: Show recommended and actual image dimensions
2. **Aspect Ratio Preview**: Visual representation of target aspect ratio with placeholder
3. **Upload Progress**: Real-time upload progress indicator with file size
4. **Validation Feedback**: Warnings for non-optimal dimensions with cropping preview
5. **Responsive Previews**: Show how image appears on desktop, tablet, and mobile
6. **Drag and Drop Feedback**: Visual indicators for active drop zones
7. **Format Support**: Support for JPEG, PNG, WebP with format recommendations
8. **Optimization Suggestions**: Automatic optimization options for large files
9. **Accessibility Guidance**: Alt text prompts and naming convention suggestions

### Hero Section Management

The hero section will have enhanced management capabilities:

1. **Reset Functionality**: "Reset to Default Image" button in admin interface to restore original image
2. **Content Preservation**: Maintain headline, subheadline, and CTA text during image reset
3. **Default Image Restoration**: Restore original hero background image when requested
4. **Confirmation Feedback**: Success message when default image is restored
5. **Full Editability**: Complete admin editing capabilities for all hero content including future image uploads
6. **Flexible Image Management**: Ability to upload new images after reset, maintaining full control

### Responsive Image Guidance

The system will provide comprehensive responsive guidance:

1. **Device-Specific Previews**: Show appearance on desktop, tablet, mobile
2. **Responsive Behavior Explanation**: How images adapt across screen sizes
3. **Minimum Dimension Guidelines**: Ensure quality on high-resolution displays
4. **Performance Optimization**: Recommendations for better website performance

### BrandingSectionManager

The branding section will provide comprehensive logo and favicon management:

1. **Logo Upload**: Company logo upload with guidance for navbar and footer display
2. **Favicon Management**: Favicon upload with automatic size generation
3. **Preview System**: Live previews showing logo in navbar and footer contexts
4. **Fallback Handling**: Graceful fallback to text-based logo when no custom logo exists
5. **Responsive Guidance**: Guidance on how logos appear across different screen sizes
6. **Format Support**: Support for PNG, SVG, WebP with transparency handling

## Data Models

### ImageGuidanceConfig

```typescript
interface ImageGuidanceConfig {
  section: string;
  dimensions: {
    recommended: { width: number; height: number };
    minimum: { width: number; height: number };
    aspectRatio: string;
  };
  fileSize: {
    recommended: string;
    maximum: string;
  };
  formats: {
    preferred: string[];
    supported: string[];
  };
  usage: {
    description: string;
    examples: string[];
    bestPractices: string[];
  };
  responsive: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  optimization: {
    compressionLevel: number;
    qualityRecommendation: string;
    performanceTips: string[];
  };
  accessibility: {
    altTextGuidance: string;
    namingConventions: string[];
  };
}
```

### UploadProgress

```typescript
interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  fileSize: number;
  fileName: string;
  dimensions?: { width: number; height: number };
  error?: string;
  optimizationSuggested?: boolean;
  compressionOptions?: CompressionOption[];
}

interface CompressionOption {
  level: number;
  quality: string;
  estimatedSize: string;
  description: string;
}
```

### HeroSectionReset

```typescript
interface HeroSectionReset {
  defaultImageUrl: string;
  currentContent: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
  };
  resetConfirmation: {
    message: string;
    timestamp: Date;
  };
}
```

### BrandingConfig

```typescript
interface BrandingConfig {
  logo: {
    url: string;
    altText: string;
    dimensions: { width: number; height: number };
    format: string;
    hasTransparency: boolean;
  };
  favicon: {
    url: string;
    sizes: FaviconSize[];
    format: string;
  };
  fallback: {
    textLogo: string;
    initials: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
  preview: {
    navbarContext: string;
    footerContext: string;
    mobileContext: string;
  };
}

interface FaviconSize {
  size: number;
  url: string;
  type: 'icon' | 'apple-touch-icon' | 'manifest';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Section-specific dimension guidance display
*For any* content section type, the image upload component should display the correct recommended dimensions as defined in the guidance configuration
**Validates: Requirements 1.1, 1.4**

### Property 2: Hover context information display
*For any* dimension guidance element, hovering should reveal additional context information about why those dimensions are optimal
**Validates: Requirements 1.2**

### Property 3: Image dimension detection accuracy
*For any* uploaded image, the system should correctly detect and display the actual dimensions of the image
**Validates: Requirements 1.3**

### Property 4: Aspect ratio preview placeholder accuracy
*For any* content section, the preview placeholder should maintain the correct aspect ratio as specified in the guidance configuration
**Validates: Requirements 2.1**

### Property 5: Upload preview generation
*For any* successfully uploaded image, the system should generate a preview showing how the image will appear in the target section
**Validates: Requirements 2.2**

### Property 6: Aspect ratio mismatch warning display
*For any* uploaded image with incorrect aspect ratio, the system should display appropriate warnings and cropping previews
**Validates: Requirements 2.3**

### Property 7: Visual guidelines provision
*For any* content section, the system should provide aspect ratio guidelines with visual examples
**Validates: Requirements 2.4**

### Property 8: Hero section image reset functionality
*For any* hero section reset operation, the system should restore the original default hero background image
**Validates: Requirements 3.1**

### Property 9: Content preservation during reset
*For any* hero section reset, the system should maintain the current headline, subheadline, and CTA text from the admin panel
**Validates: Requirements 3.2**

### Property 10: Hero section editability preservation
*For any* hero section content field, the system should continue to allow full editing capabilities through the admin panel interface
**Validates: Requirements 3.3**

### Property 11: Reset confirmation display
*For any* successful default image restoration, the system should show a confirmation message
**Validates: Requirements 3.5**

### Property 12: Drag feedback responsiveness
*For any* drag operation over an upload area, the system should provide immediate visual feedback indicating the active drop zone
**Validates: Requirements 4.1**

### Property 13: Upload progress tracking
*For any* image upload operation, the system should display real-time progress information including file size and upload percentage
**Validates: Requirements 4.2**

### Property 14: Success feedback completeness
*For any* successful image upload, the system should display success confirmation including the final image dimensions
**Validates: Requirements 4.3**

### Property 15: Error message clarity
*For any* failed image upload, the system should provide clear error messages with actionable solutions
**Validates: Requirements 4.4**

### Property 16: Image format support
*For any* supported image format (JPEG, PNG, WebP), the system should accept the upload and provide appropriate format recommendations
**Validates: Requirements 4.5**

### Property 17: Responsive guidance information
*For any* image guidance display, the system should include explanations of how images will appear across desktop, tablet, and mobile devices
**Validates: Requirements 5.1**

### Property 18: Multi-viewport preview availability
*For any* uploaded image, the system should provide preview options showing appearance on desktop, tablet, and mobile viewports
**Validates: Requirements 5.2**

### Property 19: Minimum dimension guidance provision
*For any* content section, the system should provide guidance on minimum image dimensions to ensure quality on high-resolution displays
**Validates: Requirements 5.3**

### Property 20: Optimization technique recommendations
*For any* image guidance display, the system should recommend image optimization techniques for better website performance
**Validates: Requirements 5.4**

### Property 21: File size guidance consistency
*For any* content section, the system should provide appropriate file size recommendations based on the section's usage requirements
**Validates: Requirements 6.1**

### Property 22: Compression level suggestions
*For any* image guidance display, the system should suggest image compression levels for optimal balance between quality and performance
**Validates: Requirements 6.2**

### Property 23: Large file optimization offers
*For any* uploaded image exceeding recommended file size, the system should present automatic optimization options
**Validates: Requirements 6.3**

### Property 24: Accessibility guidance provision
*For any* image upload interface, the system should provide alt text guidance for accessibility compliance
**Validates: Requirements 6.4**

### Property 25: Naming convention recommendations
*For any* image upload interface, the system should recommend image naming conventions for better organization
**Validates: Requirements 6.5**

### Property 26: Logo display replacement
*For any* uploaded company logo, the system should display it in both navbar and footer replacing the current text-based logo
**Validates: Requirements 7.2**

### Property 27: Favicon update functionality
*For any* uploaded favicon, the system should update the browser tab icon and app icons
**Validates: Requirements 7.3**

### Property 28: Logo guidance provision
*For any* logo upload interface, the system should provide upload guidance for optimal display across different screen sizes
**Validates: Requirements 7.4**

### Property 29: Transparent background support
*For any* logo upload with transparent background, the system should support the transparency and provide contrast guidance
**Validates: Requirements 7.5**

### Property 30: Logo fallback behavior
*For any* branding interface when no custom logo is uploaded, the system should continue displaying the current text-based logo as fallback
**Validates: Requirements 7.6**

### Property 31: Logo preview contexts
*For any* logo upload interface, the system should provide preview options showing how the logo appears in navbar and footer contexts
**Validates: Requirements 7.7**

<function_calls>
<invoke name="prework">
<parameter name="featureName">image-guidance-enhancement

## Error Handling

### Image Upload Errors
- **File size too large**: Display warning with optimization suggestions and automatic compression options
- **Unsupported format**: Show supported formats (JPEG, PNG, WebP) and conversion recommendations
- **Network failure**: Provide retry mechanism with exponential backoff and progress restoration
- **Server errors**: Display user-friendly error messages with support contact information
- **Invalid dimensions**: Show warnings but allow upload with cropping suggestions and aspect ratio guidance

### Validation Errors
- **Aspect ratio mismatch**: Display visual preview of how image will be cropped with before/after comparison
- **Missing alt text**: Prompt for accessibility compliance with guidance on writing effective alt text
- **Poor image quality**: Suggest minimum resolution requirements and quality improvement tips
- **Inappropriate file naming**: Recommend naming conventions for better organization

### Hero Section Reset Errors
- **Reset failure**: Provide clear error message and retry option for default image restoration
- **Content preservation failure**: Ensure text content is maintained even if image reset fails
- **Permission errors**: Display appropriate access control messages for admin-only functions

### Graceful Degradation
- **No JavaScript**: Basic file upload functionality remains available with server-side validation
- **Slow connections**: Progressive loading with appropriate feedback and timeout handling
- **Browser compatibility**: Fallback to standard file input for older browsers with reduced guidance
- **Mobile devices**: Touch-optimized interface with simplified guidance display

## Testing Strategy

### Unit Testing
- Test image dimension calculation functions
- Validate guidance configuration completeness
- Test upload progress tracking logic
- Verify error message generation

### Property-Based Testing
- **Minimum 100 iterations per property test**
- Each property test references its design document property
- Tag format: **Feature: image-guidance-enhancement, Property {number}: {property_text}**

**Dual Testing Approach**:
- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary for comprehensive coverage

### Integration Testing
- Test complete upload workflow from selection to preview
- Verify admin panel integration with guidance system
- Test responsive preview generation
- Validate hero section reversion functionality

### User Experience Testing
- Test drag-and-drop interactions
- Verify guidance clarity and usefulness
- Test responsive behavior across devices
- Validate accessibility compliance