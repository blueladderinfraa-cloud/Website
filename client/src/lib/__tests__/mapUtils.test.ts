import { describe, it, expect } from 'vitest';
import { 
  generateMapEmbedUrlFallback, 
  cleanAddressForMap, 
  isValidAddressForMap 
} from '../mapUtils';

describe('Map Utilities', () => {
  describe('generateMapEmbedUrlFallback', () => {
    it('should generate a valid Google Maps embed URL for a valid address', () => {
      const address = "123 Main St, New York, NY 10001";
      const url = generateMapEmbedUrlFallback(address);
      
      expect(url).toContain('maps.google.com');
      expect(url).toContain('output=embed');
      expect(url).toContain(encodeURIComponent(address));
    });

    it('should return default New York URL for empty address', () => {
      const url = generateMapEmbedUrlFallback('');
      
      expect(url).toContain('google.com');
      expect(url).toContain('New%20York');
    });

    it('should handle addresses with special characters', () => {
      const address = "123 Main St & Broadway, New York, NY";
      const url = generateMapEmbedUrlFallback(address);
      
      expect(url).toContain('maps.google.com');
      expect(url).toContain('output=embed');
    });
  });

  describe('cleanAddressForMap', () => {
    it('should replace line breaks with commas', () => {
      const address = "123 Main St\nNew York, NY\n10001";
      const cleaned = cleanAddressForMap(address);
      
      expect(cleaned).toBe("123 Main St, New York, NY, 10001");
    });

    it('should remove double commas', () => {
      const address = "123 Main St,, New York, NY";
      const cleaned = cleanAddressForMap(address);
      
      expect(cleaned).toBe("123 Main St, New York, NY");
    });

    it('should remove trailing commas', () => {
      const address = "123 Main St, New York, NY,";
      const cleaned = cleanAddressForMap(address);
      
      expect(cleaned).toBe("123 Main St, New York, NY");
    });

    it('should handle empty address', () => {
      const cleaned = cleanAddressForMap('');
      expect(cleaned).toBe('');
    });
  });

  describe('isValidAddressForMap', () => {
    it('should return true for valid addresses', () => {
      expect(isValidAddressForMap("123 Main St, New York, NY 10001")).toBe(true);
      expect(isValidAddressForMap("456 Broadway Ave, Los Angeles, CA")).toBe(true);
    });

    it('should return false for invalid addresses', () => {
      expect(isValidAddressForMap("")).toBe(false);
      expect(isValidAddressForMap("123")).toBe(false);
      expect(isValidAddressForMap("Main St")).toBe(false);
      expect(isValidAddressForMap("   ")).toBe(false);
    });

    it('should require numbers, letters, and separators', () => {
      expect(isValidAddressForMap("123456789")).toBe(false); // No letters
      expect(isValidAddressForMap("MainStreet")).toBe(false); // No numbers or separators
      expect(isValidAddressForMap("123MainSt")).toBe(false); // No separators
    });
  });
});