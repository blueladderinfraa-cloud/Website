/**
 * Utility functions for Google Maps integration
 */

/**
 * Generates a Google Maps embed URL from an address
 * @param address - The address to show on the map
 * @returns Google Maps embed URL
 */
export function generateMapEmbedUrl(address: string): string {
  if (!address || address.trim() === '') {
    // Default to New York if no address provided
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304603!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1635959481000!5m2!1sen!2s";
  }

  // Clean and encode the address for URL
  const encodedAddress = encodeURIComponent(address.trim());
  
  // Generate Google Maps embed URL using the address
  // This uses the Google Maps Embed API with a place search
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-TK7VCg&q=${encodedAddress}&zoom=15&maptype=roadmap`;
}

/**
 * Generates a fallback Google Maps embed URL using the old embed format
 * This is used when the API key method doesn't work
 * @param address - The address to show on the map
 * @returns Google Maps embed URL (fallback method)
 */
export function generateMapEmbedUrlFallback(address: string): string {
  if (!address || address.trim() === '') {
    // Default to New York if no address provided
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304603!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1635959481000!5m2!1sen!2s";
  }

  // Clean and encode the address for URL
  const encodedAddress = encodeURIComponent(address.trim());
  
  // Use the simpler Google Maps search URL format
  // This doesn't require an API key but may be less reliable
  return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Extracts a clean address for map display
 * Removes extra formatting and ensures it's suitable for geocoding
 * @param address - Raw address from admin panel
 * @returns Cleaned address string
 */
export function cleanAddressForMap(address: string): string {
  if (!address) return '';
  
  // Remove excessive line breaks and clean up formatting
  return address
    .replace(/\n+/g, ', ') // Replace line breaks with commas
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/,\s*$/, '') // Remove trailing comma
    .trim();
}

/**
 * Validates if an address looks reasonable for mapping
 * @param address - Address to validate
 * @returns true if address seems valid for mapping
 */
export function isValidAddressForMap(address: string): boolean {
  if (!address || address.trim().length < 10) return false;
  
  // Check if address contains some basic components
  const hasNumbers = /\d/.test(address);
  const hasLetters = /[a-zA-Z]/.test(address);
  const hasCommaOrSpace = /[,\s]/.test(address);
  
  return hasNumbers && hasLetters && hasCommaOrSpace;
}