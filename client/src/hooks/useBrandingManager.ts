import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

interface BrandingContent {
  logo: string;
  favicon: string;
  logoAlt: string;
  companyName: string;
}

const DEFAULT_BRANDING: BrandingContent = {
  logo: '',
  favicon: '',
  logoAlt: 'Blueladder Infra Company Logo',
  companyName: 'Blueladder Infra',
};

export function useBrandingManager() {
  const [brandingContent, setBrandingContent] = useState<BrandingContent>(DEFAULT_BRANDING);

  const { data: siteContent } = trpc.siteContent.get.useQuery();

  useEffect(() => {
    if (siteContent) {
      const brandingData = siteContent.find((item: any) => 
        item.section === 'branding' && item.key === 'content'
      );
      
      if (brandingData?.value) {
        try {
          const parsedBranding = JSON.parse(brandingData.value);
          setBrandingContent({
            logo: parsedBranding.logo || '',
            favicon: parsedBranding.favicon || '',
            logoAlt: parsedBranding.logoAlt || DEFAULT_BRANDING.logoAlt,
            companyName: parsedBranding.companyName || DEFAULT_BRANDING.companyName,
          });
        } catch (error) {
          console.warn('Failed to parse branding content:', error);
          setBrandingContent(DEFAULT_BRANDING);
        }
      }
    }
  }, [siteContent]);

  const getBrandingContent = () => brandingContent;

  const hasCustomLogo = () => Boolean(brandingContent.logo);

  const getLogoProps = () => ({
    src: brandingContent.logo,
    alt: brandingContent.logoAlt,
    fallbackText: brandingContent.companyName,
  });

  const getFaviconUrl = () => brandingContent.favicon;

  return {
    getBrandingContent,
    hasCustomLogo,
    getLogoProps,
    getFaviconUrl,
  };
}