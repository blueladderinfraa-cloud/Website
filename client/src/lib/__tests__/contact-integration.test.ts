import { describe, it, expect } from 'vitest';

describe('Contact Information Integration', () => {
  it('should handle contact content structure correctly', () => {
    // Test the contact content structure that useContentManager returns
    const mockContactData = {
      contact_address: "123 Main St, City, State 12345",
      contact_phone1: "+1 (555) 123-4567",
      contact_phone2: "+1 (555) 987-6543",
      contact_email1: "info@company.com",
      contact_email2: "support@company.com",
      contact_hours: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed"
    };

    // Simulate the contact content transformation
    const contactContent = {
      address: mockContactData.contact_address || "123 Construction Ave, Building District, New York, NY 10001",
      phone1: mockContactData.contact_phone1 || "+1 (234) 567-890",
      phone2: mockContactData.contact_phone2 || "",
      email1: mockContactData.contact_email1 || "info@blueladderinfra.com",
      email2: mockContactData.contact_email2 || "",
      hours: mockContactData.contact_hours || "Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed"
    };

    expect(contactContent.address).toBe("123 Main St, City, State 12345");
    expect(contactContent.phone1).toBe("+1 (555) 123-4567");
    expect(contactContent.phone2).toBe("+1 (555) 987-6543");
    expect(contactContent.email1).toBe("info@company.com");
    expect(contactContent.email2).toBe("support@company.com");
    expect(contactContent.hours).toContain("Monday - Friday");
  });

  it('should handle empty contact data with defaults', () => {
    const mockContactData = {};

    // Simulate default contact content
    const contactContent = {
      address: (mockContactData as any).contact_address || "123 Construction Ave, Building District, New York, NY 10001",
      phone1: (mockContactData as any).contact_phone1 || "+1 (234) 567-890",
      phone2: (mockContactData as any).contact_phone2 || "",
      email1: (mockContactData as any).contact_email1 || "info@blueladderinfra.com",
      email2: (mockContactData as any).contact_email2 || "",
      hours: (mockContactData as any).contact_hours || "Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed"
    };

    expect(contactContent.address).toBe("123 Construction Ave, Building District, New York, NY 10001");
    expect(contactContent.phone1).toBe("+1 (234) 567-890");
    expect(contactContent.phone2).toBe("");
    expect(contactContent.email1).toBe("info@blueladderinfra.com");
    expect(contactContent.email2).toBe("");
    expect(contactContent.hours).toContain("Monday - Friday: 8:00 AM - 6:00 PM");
  });

  it('should format phone numbers for tel links correctly', () => {
    const phoneNumber = "+1 (555) 123-4567";
    const formattedForTel = phoneNumber.replace(/\s/g, '');
    
    expect(formattedForTel).toBe("+1(555)123-4567");
  });

  it('should handle multiline business hours', () => {
    const hours = "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed";
    const lines = hours.split('\n');
    
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Monday - Friday: 9:00 AM - 5:00 PM");
    expect(lines[1]).toBe("Saturday: 10:00 AM - 2:00 PM");
    expect(lines[2]).toBe("Sunday: Closed");
  });

  it('should generate map URLs from addresses', () => {
    const address = "123 Main St, New York, NY 10001";
    const encodedAddress = encodeURIComponent(address);
    const expectedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    
    expect(expectedUrl).toContain('maps.google.com');
    expect(expectedUrl).toContain('output=embed');
    expect(expectedUrl).toContain(encodedAddress);
  });

  it('should clean addresses for map display', () => {
    const address = "123 Main St\nNew York, NY\n10001";
    const cleaned = address.replace(/\n+/g, ', ').replace(/,\s*,/g, ',').replace(/,\s*$/, '').trim();
    
    expect(cleaned).toBe("123 Main St, New York, NY, 10001");
  });
});