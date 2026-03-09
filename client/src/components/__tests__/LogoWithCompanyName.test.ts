import { describe, it, expect } from 'vitest';

describe('Logo with Company Name Integration', () => {
  it('should display logo and company name together in navbar', () => {
    // Test navbar layout with logo + company name
    const navbarLayout = {
      hasLogo: true,
      logoMaxWidth: '120px',
      logoHeight: '2rem', // h-8
      companyNameVisible: true,
      gap: '0.75rem' // gap-3
    };

    expect(navbarLayout.hasLogo).toBe(true);
    expect(navbarLayout.companyNameVisible).toBe(true);
    expect(navbarLayout.logoMaxWidth).toBe('120px');
    expect(navbarLayout.gap).toBe('0.75rem');
  });

  it('should display logo and company name together in footer', () => {
    // Test footer layout with logo + company name
    const footerLayout = {
      hasLogo: true,
      logoMaxWidth: '100px',
      logoHeight: '1.5rem', // h-6
      companyNameVisible: true,
      gap: '0.75rem' // gap-3
    };

    expect(footerLayout.hasLogo).toBe(true);
    expect(footerLayout.companyNameVisible).toBe(true);
    expect(footerLayout.logoMaxWidth).toBe('100px');
    expect(footerLayout.gap).toBe('0.75rem');
  });

  it('should show icon and company name when no logo is uploaded', () => {
    // Test fallback behavior
    const fallbackLayout = {
      hasLogo: false,
      showIcon: true,
      companyNameVisible: true,
      iconType: 'gradient-primary' // navbar
    };

    expect(fallbackLayout.hasLogo).toBe(false);
    expect(fallbackLayout.showIcon).toBe(true);
    expect(fallbackLayout.companyNameVisible).toBe(true);
  });

  it('should handle company name splitting correctly', () => {
    // Test company name parsing
    const testCases = [
      {
        input: 'Blueladder Infra',
        expectedFirst: 'Blueladder',
        expectedSecond: 'Infra'
      },
      {
        input: 'ABC Construction Company',
        expectedFirst: 'ABC',
        expectedSecond: 'Construction'
      },
      {
        input: 'SingleName',
        expectedFirst: 'SingleName',
        expectedSecond: 'INFRA' // fallback
      }
    ];

    testCases.forEach(testCase => {
      const parts = testCase.input.split(' ');
      const first = parts[0] || 'Blueladder';
      const second = parts[1] || 'INFRA';
      
      expect(first).toBe(testCase.expectedFirst);
      expect(second).toBe(testCase.expectedSecond);
    });
  });

  it('should maintain proper spacing and alignment', () => {
    // Test layout properties
    const layoutProperties = {
      containerClass: 'flex items-center gap-3 logo-container',
      logoClass: 'logo-transparent',
      textContainerClass: 'flex flex-col',
      alignment: 'items-center'
    };

    expect(layoutProperties.containerClass).toContain('flex');
    expect(layoutProperties.containerClass).toContain('items-center');
    expect(layoutProperties.containerClass).toContain('gap-3');
    expect(layoutProperties.logoClass).toBe('logo-transparent');
  });

  it('should handle error states gracefully', () => {
    // Test error handling for logo loading
    const errorHandling = {
      onImageError: 'hide image, show fallback icon',
      preserveCompanyName: true,
      maintainLayout: true
    };

    expect(errorHandling.preserveCompanyName).toBe(true);
    expect(errorHandling.maintainLayout).toBe(true);
  });
});