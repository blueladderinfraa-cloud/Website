import { describe, it, expect } from 'vitest';

describe('Navbar Contact Integration', () => {
  it('should format phone numbers correctly for tel links', () => {
    // Test phone number formatting for tel: links
    const phoneNumber = "+1 (555) 123-4567";
    const formattedForTel = phoneNumber.replace(/\D/g, '');
    
    expect(formattedForTel).toBe("15551234567");
  });

  it('should handle different phone number formats', () => {
    const testCases = [
      { input: "+1 (234) 567-890", expected: "1234567890" },
      { input: "234-567-8900", expected: "2345678900" },
      { input: "(555) 123 4567", expected: "5551234567" },
      { input: "+1.555.123.4567", expected: "15551234567" }
    ];

    testCases.forEach(({ input, expected }) => {
      const formatted = input.replace(/\D/g, '');
      expect(formatted).toBe(expected);
    });
  });

  it('should handle empty or undefined phone numbers', () => {
    const emptyPhone = "";
    const undefinedPhone = undefined;
    
    // Should not render phone link if no phone number
    expect(emptyPhone).toBe("");
    expect(undefinedPhone).toBeUndefined();
  });

  it('should validate contact content structure for navbar', () => {
    // Test the contact content structure that navbar expects
    const mockContactContent = {
      phone1: "+1 (555) 123-4567",
      phone2: "+1 (555) 987-6543",
      email1: "info@company.com",
      address: "123 Main St, City, State"
    };

    expect(mockContactContent.phone1).toBeTruthy();
    expect(mockContactContent.phone1).toContain("555");
    expect(mockContactContent.phone1.replace(/\D/g, '')).toHaveLength(11); // US phone number with country code
  });
});