/**
 * Image Guidance Configuration
 * 
 * This module provides comprehensive image guidance configuration for different
 * content sections in the admin panel, including dimension recommendations,
 * file size limits, format preferences, and optimization tips.
 */

export interface ImageDimensions {
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

export interface ImageGuidanceConfig {
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

export interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  fileSize: number;
  fileName: string;
  dimensions?: { width: number; height: number };
  error?: string;
  optimizationSuggested?: boolean;
  compressionOptions?: CompressionOption[];
}

export interface CompressionOption {
  level: number;
  quality: string;
  estimatedSize: string;
  description: string;
}

export interface HeroSectionReset {
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

export interface BrandingConfig {
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

export interface FaviconSize {
  size: number;
  url: string;
  type: 'icon' | 'apple-touch-icon' | 'manifest';
}

export type ContentSection = 'hero' | 'about' | 'services' | 'team' | 'testimonials' | 'projects' | 'logo' | 'favicon';

export interface SectionGuidance {
  [key: string]: ImageDimensions;
}

/**
 * Comprehensive image guidance configuration for all content sections
 */
export const IMAGE_GUIDANCE: SectionGuidance = {
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

/**
 * Detailed guidance configuration for each section
 */
export const DETAILED_IMAGE_GUIDANCE: Record<ContentSection, ImageGuidanceConfig> = {
  hero: {
    section: "hero",
    dimensions: {
      recommended: { width: 1920, height: 1080 },
      minimum: { width: 1200, height: 675 },
      aspectRatio: "16:9"
    },
    fileSize: {
      recommended: "< 500KB",
      maximum: "1MB"
    },
    formats: {
      preferred: ["WebP", "JPEG"],
      supported: ["JPEG", "PNG", "WebP"]
    },
    usage: {
      description: "Full-width hero background image that creates the first impression",
      examples: ["Landscape photography", "Office buildings", "Team at work", "Project showcases"],
      bestPractices: [
        "Use high-quality, professional images",
        "Ensure good contrast with overlay text",
        "Avoid busy backgrounds that compete with text",
        "Consider the focal point for mobile cropping"
      ]
    },
    responsive: {
      desktop: "Displays full-width at 1920px maximum",
      tablet: "Scales proportionally, may crop top/bottom",
      mobile: "Center-cropped to maintain aspect ratio"
    },
    optimization: {
      compressionLevel: 80,
      qualityRecommendation: "High quality (80-90%) for best visual impact",
      performanceTips: [
        "Use WebP format for 25-35% smaller file sizes",
        "Optimize for Core Web Vitals (LCP)",
        "Consider lazy loading for below-fold images"
      ]
    },
    accessibility: {
      altTextGuidance: "Describe the scene and mood, not just objects. Example: 'Modern office space with natural lighting and collaborative workspace'",
      namingConventions: ["hero-main.webp", "hero-homepage.jpg", "hero-construction-site.webp"]
    }
  },
  about: {
    section: "about",
    dimensions: {
      recommended: { width: 800, height: 600 },
      minimum: { width: 400, height: 300 },
      aspectRatio: "4:3"
    },
    fileSize: {
      recommended: "< 200KB",
      maximum: "500KB"
    },
    formats: {
      preferred: ["WebP", "JPEG"],
      supported: ["JPEG", "PNG", "WebP"]
    },
    usage: {
      description: "Feature image for the about section that represents company culture or values",
      examples: ["Team collaboration", "Office environment", "Company history", "Core values visualization"],
      bestPractices: [
        "Show authentic moments and real people",
        "Maintain consistent style with brand identity",
        "Use images that tell your company story",
        "Ensure diversity and inclusion in representation"
      ]
    },
    responsive: {
      desktop: "Displays alongside text content",
      tablet: "May stack above or below text",
      mobile: "Full-width, stacked layout"
    },
    optimization: {
      compressionLevel: 75,
      qualityRecommendation: "Good quality (75-85%) balancing size and clarity",
      performanceTips: [
        "Compress images to reduce page load time",
        "Use appropriate dimensions to avoid browser scaling",
        "Consider using srcset for responsive images"
      ]
    },
    accessibility: {
      altTextGuidance: "Describe the company culture or values shown. Example: 'Team members collaborating in a modern conference room'",
      namingConventions: ["about-team.webp", "about-office.jpg", "about-values.webp"]
    }
  },
  services: {
    section: "services",
    dimensions: {
      recommended: { width: 600, height: 400 },
      minimum: { width: 300, height: 200 },
      aspectRatio: "3:2"
    },
    fileSize: {
      recommended: "< 150KB",
      maximum: "300KB"
    },
    formats: {
      preferred: ["WebP", "JPEG"],
      supported: ["JPEG", "PNG", "WebP"]
    },
    usage: {
      description: "Service card images that represent different service offerings",
      examples: ["Construction equipment", "Architectural drawings", "Project sites", "Service processes"],
      bestPractices: [
        "Use consistent style across all service images",
        "Show the service in action when possible",
        "Maintain professional quality and lighting",
        "Use images that clearly represent the service"
      ]
    },
    responsive: {
      desktop: "Grid layout with multiple cards per row",
      tablet: "Fewer cards per row, larger images",
      mobile: "Single column, full-width cards"
    },
    optimization: {
      compressionLevel: 70,
      qualityRecommendation: "Good quality (70-80%) for fast loading",
      performanceTips: [
        "Optimize for grid display with consistent dimensions",
        "Use lazy loading for services below the fold",
        "Consider WebP format for better compression"
      ]
    },
    accessibility: {
      altTextGuidance: "Describe the specific service shown. Example: 'Construction worker operating excavation equipment'",
      namingConventions: ["service-excavation.webp", "service-design.jpg", "service-management.webp"]
    }
  },
  team: {
    section: "team",
    dimensions: {
      recommended: { width: 300, height: 300 },
      minimum: { width: 150, height: 150 },
      aspectRatio: "1:1"
    },
    fileSize: {
      recommended: "< 100KB",
      maximum: "200KB"
    },
    formats: {
      preferred: ["JPEG", "WebP"],
      supported: ["JPEG", "PNG", "WebP"]
    },
    usage: {
      description: "Professional headshots of team members",
      examples: ["Professional headshots", "Casual team photos", "Action shots at work", "Portrait photography"],
      bestPractices: [
        "Use consistent lighting and background",
        "Center faces in the frame for circular crops",
        "Maintain professional appearance",
        "Use high-resolution source images"
      ]
    },
    responsive: {
      desktop: "Circular thumbnails in grid layout",
      tablet: "Larger thumbnails, fewer per row",
      mobile: "Single or double column layout"
    },
    optimization: {
      compressionLevel: 75,
      qualityRecommendation: "Good quality (75-85%) for clear facial features",
      performanceTips: [
        "Optimize for circular crop display",
        "Use appropriate resolution for thumbnail size",
        "Consider progressive JPEG for faster loading"
      ]
    },
    accessibility: {
      altTextGuidance: "Include person's name and role. Example: 'John Smith, Project Manager'",
      namingConventions: ["team-john-smith.jpg", "team-manager-jane.webp", "team-lead-mike.jpg"]
    }
  },
  testimonials: {
    section: "testimonials",
    dimensions: {
      recommended: { width: 150, height: 150 },
      minimum: { width: 75, height: 75 },
      aspectRatio: "1:1"
    },
    fileSize: {
      recommended: "< 50KB",
      maximum: "100KB"
    },
    formats: {
      preferred: ["JPEG", "WebP"],
      supported: ["JPEG", "PNG", "WebP"]
    },
    usage: {
      description: "Small profile photos of clients providing testimonials",
      examples: ["Client headshots", "Company logos", "Professional portraits", "Avatar images"],
      bestPractices: [
        "Use high-contrast images for small display",
        "Ensure faces are clearly visible at small sizes",
        "Maintain consistent style with team photos",
        "Use professional or semi-professional photos"
      ]
    },
    responsive: {
      desktop: "Small circular thumbnails next to testimonials",
      tablet: "Slightly larger thumbnails",
      mobile: "Consistent small size for space efficiency"
    },
    optimization: {
      compressionLevel: 70,
      qualityRecommendation: "Good quality (70-80%) optimized for small display",
      performanceTips: [
        "Heavily optimize for small file size",
        "Use appropriate resolution for display size",
        "Consider using WebP for better compression"
      ]
    },
    accessibility: {
      altTextGuidance: "Include client name or company. Example: 'Sarah Johnson, ABC Construction'",
      namingConventions: ["testimonial-sarah-johnson.jpg", "testimonial-abc-corp.webp", "client-review-mike.jpg"]
    }
  },
  projects: {
    section: "projects",
    dimensions: {
      recommended: { width: 800, height: 600 },
      minimum: { width: 400, height: 300 },
      aspectRatio: "4:3"
    },
    fileSize: {
      recommended: "< 300KB",
      maximum: "600KB"
    },
    formats: {
      preferred: ["WebP", "JPEG"],
      supported: ["JPEG", "PNG", "WebP"]
    },
    usage: {
      description: "Project showcase images for portfolio gallery",
      examples: ["Completed projects", "Before/after shots", "Construction progress", "Architectural details"],
      bestPractices: [
        "Showcase key project features prominently",
        "Use high-quality photography",
        "Maintain consistent style across project images",
        "Include variety of angles and perspectives"
      ]
    },
    responsive: {
      desktop: "Gallery grid with lightbox functionality",
      tablet: "Responsive grid with fewer columns",
      mobile: "Single or double column gallery"
    },
    optimization: {
      compressionLevel: 75,
      qualityRecommendation: "High quality (75-85%) for portfolio showcase",
      performanceTips: [
        "Optimize for gallery display and lightbox",
        "Use lazy loading for large galleries",
        "Consider progressive JPEG for better UX"
      ]
    },
    accessibility: {
      altTextGuidance: "Describe the project and key features. Example: 'Modern office building with glass facade and landscaped entrance'",
      namingConventions: ["project-office-building.webp", "project-residential-complex.jpg", "project-renovation-before.webp"]
    }
  },
  logo: {
    section: "logo",
    dimensions: {
      recommended: { width: 200, height: 80 },
      minimum: { width: 100, height: 40 },
      aspectRatio: "5:2"
    },
    fileSize: {
      recommended: "< 50KB",
      maximum: "100KB"
    },
    formats: {
      preferred: ["PNG", "SVG", "WebP"],
      supported: ["PNG", "SVG", "WebP", "JPEG"]
    },
    usage: {
      description: "Company logo for navbar and footer display",
      examples: ["Company wordmark", "Logo symbol", "Combined logo and text", "Brand mark"],
      bestPractices: [
        "Use transparent background for flexibility",
        "Ensure high contrast for readability",
        "Test at various sizes for scalability",
        "Maintain brand consistency"
      ]
    },
    responsive: {
      desktop: "Full size in navbar and footer",
      tablet: "Slightly smaller but proportional",
      mobile: "Compact size, may show symbol only"
    },
    optimization: {
      compressionLevel: 90,
      qualityRecommendation: "Highest quality (90-100%) for brand representation",
      performanceTips: [
        "Use SVG format when possible for scalability",
        "Optimize PNG with transparency",
        "Consider multiple sizes for different contexts"
      ]
    },
    accessibility: {
      altTextGuidance: "Use company name as alt text. Example: 'ABC Construction Company'",
      namingConventions: ["logo-company.svg", "logo-navbar.png", "brand-mark.webp"]
    }
  },
  favicon: {
    section: "favicon",
    dimensions: {
      recommended: { width: 32, height: 32 },
      minimum: { width: 16, height: 16 },
      aspectRatio: "1:1"
    },
    fileSize: {
      recommended: "< 10KB",
      maximum: "25KB"
    },
    formats: {
      preferred: ["PNG", "ICO"],
      supported: ["PNG", "ICO", "SVG"]
    },
    usage: {
      description: "Browser favicon and app icon for brand recognition",
      examples: ["Company initials", "Logo symbol", "Brand icon", "Simplified logo"],
      bestPractices: [
        "Use simple design recognizable at small sizes",
        "Ensure good contrast at 16x16 pixels",
        "Test visibility in browser tabs",
        "Consider dark/light theme compatibility"
      ]
    },
    responsive: {
      desktop: "16x16, 32x32, and 48x48 sizes",
      tablet: "Touch icon sizes (152x152, 180x180)",
      mobile: "App icon sizes (192x192, 512x512)"
    },
    optimization: {
      compressionLevel: 95,
      qualityRecommendation: "Highest quality (95-100%) for small icon clarity",
      performanceTips: [
        "Generate multiple sizes automatically",
        "Use PNG for better quality at small sizes",
        "Keep file size minimal for fast loading"
      ]
    },
    accessibility: {
      altTextGuidance: "Not applicable for favicons (no alt text needed)",
      namingConventions: ["favicon.ico", "favicon-32x32.png", "apple-touch-icon.png"]
    }
  }
};

/**
 * Get guidance for a specific content section
 */
export function getImageGuidance(section: ContentSection): ImageDimensions {
  return IMAGE_GUIDANCE[section];
}

/**
 * Get detailed guidance for a specific content section
 */
export function getDetailedImageGuidance(section: ContentSection): ImageGuidanceConfig {
  return DETAILED_IMAGE_GUIDANCE[section];
}

/**
 * Get all available content sections
 */
export function getAvailableSections(): ContentSection[] {
  return Object.keys(IMAGE_GUIDANCE) as ContentSection[];
}

/**
 * Validate if a section exists in the guidance configuration
 */
export function isValidSection(section: string): section is ContentSection {
  return section in IMAGE_GUIDANCE;
}

/**
 * Get aspect ratio as a number for calculations
 */
export function getAspectRatioNumber(section: ContentSection): number {
  const guidance = getImageGuidance(section);
  return guidance.width / guidance.height;
}

/**
 * Check if image dimensions match the recommended aspect ratio
 */
export function checkAspectRatio(
  section: ContentSection, 
  width: number, 
  height: number, 
  tolerance: number = 0.1
): boolean {
  const expectedRatio = getAspectRatioNumber(section);
  const actualRatio = width / height;
  const difference = Math.abs(expectedRatio - actualRatio);
  return difference <= tolerance;
}

/**
 * Get file size limit in bytes for a section
 */
export function getFileSizeLimit(section: ContentSection): number {
  const guidance = getImageGuidance(section);
  const sizeStr = guidance.fileSize.replace(/[<>\s]/g, '');
  
  if (sizeStr.includes('KB')) {
    return parseInt(sizeStr) * 1024;
  } else if (sizeStr.includes('MB')) {
    return parseInt(sizeStr) * 1024 * 1024;
  }
  
  return 5 * 1024 * 1024; // Default 5MB
}