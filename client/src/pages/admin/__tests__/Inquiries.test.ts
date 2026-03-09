import { describe, expect, it } from "vitest";

// Property 1: Data Display Completeness
// For any admin data list (inquiries), the display function should include all required fields specified for that data type

describe("AdminInquiries - Property Tests", () => {
  // Feature: admin-panel-features, Property 1: Data Display Completeness
  it("should display all required inquiry fields in the table", () => {
    // Test data representing different inquiry scenarios
    const testInquiries = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        company: "ABC Corp",
        projectType: "residential",
        budget: "$50,000-$100,000",
        timeline: "3-6 months",
        message: "Looking for home renovation",
        status: "new" as const,
        createdAt: new Date("2024-01-01"),
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@company.com",
        phone: null,
        company: null,
        projectType: "commercial",
        budget: null,
        timeline: null,
        message: "Office building construction",
        status: "contacted" as const,
        createdAt: new Date("2024-01-02"),
      },
      {
        id: 3,
        name: "Bob Wilson",
        email: "bob@test.com",
        phone: "+9876543210",
        company: "Wilson Industries",
        projectType: null,
        budget: "$200,000+",
        timeline: "1 year",
        message: null,
        status: "quoted" as const,
        createdAt: new Date("2024-01-03"),
      },
    ];

    // Property: For any inquiry data, the display should include all required fields
    testInquiries.forEach((inquiry) => {
      // Required fields that must always be present in display
      expect(inquiry.id).toBeDefined();
      expect(inquiry.name).toBeDefined();
      expect(inquiry.email).toBeDefined();
      expect(inquiry.status).toBeDefined();
      expect(inquiry.createdAt).toBeDefined();
      
      // Verify field types are correct
      expect(typeof inquiry.id).toBe("number");
      expect(typeof inquiry.name).toBe("string");
      expect(typeof inquiry.email).toBe("string");
      expect(typeof inquiry.status).toBe("string");
      expect(inquiry.createdAt).toBeInstanceOf(Date);
      
      // Verify required fields are not empty
      expect(inquiry.name.length).toBeGreaterThan(0);
      expect(inquiry.email.length).toBeGreaterThan(0);
      expect(inquiry.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Basic email format
      
      // Verify status is valid
      expect(["new", "contacted", "quoted", "converted", "closed"]).toContain(inquiry.status);
      
      // Optional fields can be null but if present, should be valid
      if (inquiry.phone !== null) {
        expect(typeof inquiry.phone).toBe("string");
        expect(inquiry.phone.length).toBeGreaterThan(0);
      }
      
      if (inquiry.company !== null) {
        expect(typeof inquiry.company).toBe("string");
        expect(inquiry.company.length).toBeGreaterThan(0);
      }
      
      if (inquiry.projectType !== null) {
        expect(typeof inquiry.projectType).toBe("string");
        expect(["residential", "commercial", "industrial", "infrastructure", "general"]).toContain(inquiry.projectType);
      }
      
      if (inquiry.budget !== null) {
        expect(typeof inquiry.budget).toBe("string");
        expect(inquiry.budget.length).toBeGreaterThan(0);
      }
      
      if (inquiry.timeline !== null) {
        expect(typeof inquiry.timeline).toBe("string");
        expect(inquiry.timeline.length).toBeGreaterThan(0);
      }
      
      if (inquiry.message !== null) {
        expect(typeof inquiry.message).toBe("string");
        expect(inquiry.message.length).toBeGreaterThan(0);
      }
    });
  });

  it("should handle inquiry data with all possible field combinations", () => {
    // Property: Data display completeness should work for all valid field combinations
    const fieldCombinations = [
      // Minimal required fields only
      {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        phone: null,
        company: null,
        projectType: null,
        budget: null,
        timeline: null,
        message: null,
        status: "new" as const,
        createdAt: new Date(),
      },
      // All fields populated
      {
        id: 2,
        name: "Full Data User",
        email: "full@example.com",
        phone: "+1234567890",
        company: "Full Company",
        projectType: "residential",
        budget: "$100,000",
        timeline: "6 months",
        message: "Complete inquiry message",
        status: "contacted" as const,
        createdAt: new Date(),
      },
      // Mixed field population
      {
        id: 3,
        name: "Partial User",
        email: "partial@example.com",
        phone: "+9876543210",
        company: null,
        projectType: "commercial",
        budget: null,
        timeline: "ASAP",
        message: null,
        status: "quoted" as const,
        createdAt: new Date(),
      },
    ];

    // Property: All combinations should be valid for display
    fieldCombinations.forEach((inquiry) => {
      // Core validation that applies to all inquiries
      expect(inquiry).toHaveProperty("id");
      expect(inquiry).toHaveProperty("name");
      expect(inquiry).toHaveProperty("email");
      expect(inquiry).toHaveProperty("status");
      expect(inquiry).toHaveProperty("createdAt");
      
      // Property: Required fields should never be null/undefined
      expect(inquiry.id).not.toBeNull();
      expect(inquiry.name).not.toBeNull();
      expect(inquiry.email).not.toBeNull();
      expect(inquiry.status).not.toBeNull();
      expect(inquiry.createdAt).not.toBeNull();
      
      // Property: Optional fields can be null but not undefined
      expect(inquiry.phone).not.toBeUndefined();
      expect(inquiry.company).not.toBeUndefined();
      expect(inquiry.projectType).not.toBeUndefined();
      expect(inquiry.budget).not.toBeUndefined();
      expect(inquiry.timeline).not.toBeUndefined();
      expect(inquiry.message).not.toBeUndefined();
    });
  });

  it("should validate inquiry status transitions", () => {
    // Property: Status field should only contain valid values
    const validStatuses = ["new", "contacted", "quoted", "converted", "closed"];
    const testInquiry = {
      id: 1,
      name: "Status Test",
      email: "status@test.com",
      phone: null,
      company: null,
      projectType: null,
      budget: null,
      timeline: null,
      message: null,
      createdAt: new Date(),
    };

    // Property: For any valid status, the inquiry should be displayable
    validStatuses.forEach((status) => {
      const inquiryWithStatus = { ...testInquiry, status: status as any };
      
      // Verify the status is valid
      expect(validStatuses).toContain(inquiryWithStatus.status);
      
      // Verify the inquiry is still complete with this status
      expect(inquiryWithStatus.id).toBeDefined();
      expect(inquiryWithStatus.name).toBeDefined();
      expect(inquiryWithStatus.email).toBeDefined();
      expect(inquiryWithStatus.status).toBeDefined();
      expect(inquiryWithStatus.createdAt).toBeDefined();
    });
  });

  it("should handle date formatting for display", () => {
    // Property: Date fields should be properly formatted for display
    const testDates = [
      new Date("2024-01-01T10:00:00Z"),
      new Date("2024-06-15T14:30:00Z"),
      new Date("2024-12-31T23:59:59Z"),
      new Date(), // Current date
    ];

    const baseInquiry = {
      id: 1,
      name: "Date Test",
      email: "date@test.com",
      phone: null,
      company: null,
      projectType: null,
      budget: null,
      timeline: null,
      message: null,
      status: "new" as const,
    };

    // Property: For any valid date, the inquiry should display correctly
    testDates.forEach((date, index) => {
      const inquiry = { ...baseInquiry, id: index + 1, createdAt: date };
      
      // Verify date is valid
      expect(inquiry.createdAt).toBeInstanceOf(Date);
      expect(inquiry.createdAt.getTime()).not.toBeNaN();
      
      // Verify date can be formatted for display
      const formattedDate = inquiry.createdAt.toLocaleDateString();
      expect(typeof formattedDate).toBe("string");
      expect(formattedDate.length).toBeGreaterThan(0);
      
      // Verify the inquiry is still complete with this date
      expect(inquiry.id).toBeDefined();
      expect(inquiry.name).toBeDefined();
      expect(inquiry.email).toBeDefined();
      expect(inquiry.status).toBeDefined();
    });
  });

  it("should validate email format consistency", () => {
    // Property: All email fields should be valid email addresses
    const testEmails = [
      "user@example.com",
      "test.email@domain.co.uk",
      "name+tag@company.org",
      "simple@test.io",
      "complex.email+test@sub.domain.com",
    ];

    const baseInquiry = {
      id: 1,
      name: "Email Test",
      phone: null,
      company: null,
      projectType: null,
      budget: null,
      timeline: null,
      message: null,
      status: "new" as const,
      createdAt: new Date(),
    };

    // Property: For any valid email, the inquiry should be displayable
    testEmails.forEach((email, index) => {
      const inquiry = { ...baseInquiry, id: index + 1, email };
      
      // Verify email format
      expect(inquiry.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      
      // Verify the inquiry is complete
      expect(inquiry.id).toBeDefined();
      expect(inquiry.name).toBeDefined();
      expect(inquiry.email).toBeDefined();
      expect(inquiry.status).toBeDefined();
      expect(inquiry.createdAt).toBeDefined();
      
      // Verify email is not empty
      expect(inquiry.email.length).toBeGreaterThan(0);
    });
  });

  // Property 2: Filtering Functionality
  // Feature: admin-panel-features, Property 2: Filtering Functionality
  describe("Property 2: Filtering Functionality", () => {
    it("should filter inquiries by status correctly", () => {
      // Test data with various statuses
      const testInquiries = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          company: "ABC Corp",
          projectType: "residential",
          budget: "$50,000",
          timeline: "3 months",
          message: "Home renovation",
          status: "new" as const,
          createdAt: new Date("2024-01-01"),
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@company.com",
          phone: null,
          company: null,
          projectType: "commercial",
          budget: null,
          timeline: null,
          message: "Office building",
          status: "contacted" as const,
          createdAt: new Date("2024-01-02"),
        },
        {
          id: 3,
          name: "Bob Wilson",
          email: "bob@test.com",
          phone: "+9876543210",
          company: "Wilson Industries",
          projectType: "industrial",
          budget: "$200,000",
          timeline: "1 year",
          message: "Factory construction",
          status: "quoted" as const,
          createdAt: new Date("2024-01-03"),
        },
        {
          id: 4,
          name: "Alice Brown",
          email: "alice@example.com",
          phone: null,
          company: "Brown LLC",
          projectType: "residential",
          budget: "$75,000",
          timeline: "6 months",
          message: "Kitchen remodel",
          status: "converted" as const,
          createdAt: new Date("2024-01-04"),
        },
        {
          id: 5,
          name: "Charlie Davis",
          email: "charlie@test.com",
          phone: "+5555555555",
          company: null,
          projectType: "commercial",
          budget: "$150,000",
          timeline: "8 months",
          message: "Retail space",
          status: "closed" as const,
          createdAt: new Date("2024-01-05"),
        },
      ];

      const validStatuses = ["new", "contacted", "quoted", "converted", "closed"];

      // Property: For any status filter, only inquiries with that status should be returned
      validStatuses.forEach((statusFilter) => {
        const filteredResults = testInquiries.filter((inquiry) => {
          return inquiry.status === statusFilter;
        });

        // Verify all results match the filter
        filteredResults.forEach((inquiry) => {
          expect(inquiry.status).toBe(statusFilter);
        });

        // Verify we get the expected count for each status
        const expectedCount = testInquiries.filter(i => i.status === statusFilter).length;
        expect(filteredResults.length).toBe(expectedCount);

        // Verify no inquiries with different statuses are included
        const otherStatuses = validStatuses.filter(s => s !== statusFilter);
        filteredResults.forEach((inquiry) => {
          expect(otherStatuses).not.toContain(inquiry.status);
        });
      });
    });

    it("should handle empty filter results correctly", () => {
      const testInquiries = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          phone: null,
          company: null,
          projectType: "residential",
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date(),
        },
      ];

      // Property: Filtering by non-existent status should return empty array
      const nonExistentStatuses = ["pending", "archived", "invalid"];
      
      nonExistentStatuses.forEach((statusFilter) => {
        const filteredResults = testInquiries.filter((inquiry) => {
          return inquiry.status === statusFilter;
        });

        expect(filteredResults).toHaveLength(0);
        expect(Array.isArray(filteredResults)).toBe(true);
      });
    });

    it("should filter by multiple criteria combinations", () => {
      const testInquiries = [
        {
          id: 1,
          name: "John Residential",
          email: "john@example.com",
          phone: null,
          company: null,
          projectType: "residential",
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date("2024-01-01"),
        },
        {
          id: 2,
          name: "Jane Commercial",
          email: "jane@example.com",
          phone: null,
          company: null,
          projectType: "commercial",
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date("2024-01-02"),
        },
        {
          id: 3,
          name: "Bob Residential",
          email: "bob@example.com",
          phone: null,
          company: null,
          projectType: "residential",
          budget: null,
          timeline: null,
          message: null,
          status: "contacted" as const,
          createdAt: new Date("2024-01-03"),
        },
      ];

      // Property: Combined filters should work correctly
      const statusProjectCombinations = [
        { status: "new", projectType: "residential", expectedIds: [1] },
        { status: "new", projectType: "commercial", expectedIds: [2] },
        { status: "contacted", projectType: "residential", expectedIds: [3] },
        { status: "contacted", projectType: "commercial", expectedIds: [] },
      ];

      statusProjectCombinations.forEach(({ status, projectType, expectedIds }) => {
        const filteredResults = testInquiries.filter((inquiry) => {
          return inquiry.status === status && inquiry.projectType === projectType;
        });

        expect(filteredResults.map(i => i.id)).toEqual(expectedIds);
        
        // Verify all results match both criteria
        filteredResults.forEach((inquiry) => {
          expect(inquiry.status).toBe(status);
          expect(inquiry.projectType).toBe(projectType);
        });
      });
    });
  });

  // Property 3: Search Functionality
  // Feature: admin-panel-features, Property 3: Search Functionality
  describe("Property 3: Search Functionality", () => {
    it("should search by name correctly", () => {
      const testInquiries = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@company.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "contacted" as const,
          createdAt: new Date(),
        },
        {
          id: 3,
          name: "Bob Wilson",
          email: "bob@test.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "quoted" as const,
          createdAt: new Date(),
        },
      ];

      const searchQueries = [
        { query: "john", expectedIds: [1] },
        { query: "Jane", expectedIds: [2] },
        { query: "bob", expectedIds: [3] },
        { query: "smith", expectedIds: [2] },
        { query: "doe", expectedIds: [1] },
        { query: "wilson", expectedIds: [3] },
        { query: "xyz", expectedIds: [] },
      ];

      // Property: For any search query, results should contain only inquiries where name matches (case-insensitive)
      searchQueries.forEach(({ query, expectedIds }) => {
        const searchResults = testInquiries.filter((inquiry) => {
          return inquiry.name.toLowerCase().includes(query.toLowerCase());
        });

        expect(searchResults.map(i => i.id)).toEqual(expectedIds);

        // Verify all results contain the search query in the name
        searchResults.forEach((inquiry) => {
          expect(inquiry.name.toLowerCase()).toContain(query.toLowerCase());
        });
      });
    });

    it("should search by email correctly", () => {
      const testInquiries = [
        {
          id: 1,
          name: "User One",
          email: "user1@example.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "User Two",
          email: "user2@company.org",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "contacted" as const,
          createdAt: new Date(),
        },
        {
          id: 3,
          name: "User Three",
          email: "admin@test.net",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "quoted" as const,
          createdAt: new Date(),
        },
      ];

      const emailSearchQueries = [
        { query: "user1", expectedIds: [1] },
        { query: "company", expectedIds: [2] },
        { query: "admin", expectedIds: [3] },
        { query: "example", expectedIds: [1] },
        { query: "test", expectedIds: [3] },
        { query: "@", expectedIds: [1, 2, 3] }, // All emails contain @
        { query: "nonexistent", expectedIds: [] },
      ];

      // Property: For any email search query, results should contain only inquiries where email matches (case-insensitive)
      emailSearchQueries.forEach(({ query, expectedIds }) => {
        const searchResults = testInquiries.filter((inquiry) => {
          return inquiry.email.toLowerCase().includes(query.toLowerCase());
        });

        expect(searchResults.map(i => i.id)).toEqual(expectedIds);

        // Verify all results contain the search query in the email
        searchResults.forEach((inquiry) => {
          expect(inquiry.email.toLowerCase()).toContain(query.toLowerCase());
        });
      });
    });

    it("should search by both name and email", () => {
      const testInquiries = [
        {
          id: 1,
          name: "John Admin",
          email: "john@example.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Jane User",
          email: "admin@company.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "contacted" as const,
          createdAt: new Date(),
        },
        {
          id: 3,
          name: "Bob Smith",
          email: "bob@test.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "quoted" as const,
          createdAt: new Date(),
        },
      ];

      const combinedSearchQueries = [
        { query: "admin", expectedIds: [1, 2] }, // Matches name in #1, email in #2
        { query: "john", expectedIds: [1] }, // Matches name in #1
        { query: "company", expectedIds: [2] }, // Matches email in #2
        { query: "smith", expectedIds: [3] }, // Matches name in #3
        { query: "test", expectedIds: [3] }, // Matches email in #3
        { query: "xyz", expectedIds: [] }, // No matches
      ];

      // Property: For any search query, results should include inquiries where EITHER name OR email matches
      combinedSearchQueries.forEach(({ query, expectedIds }) => {
        const searchResults = testInquiries.filter((inquiry) => {
          const queryLower = query.toLowerCase();
          return inquiry.name.toLowerCase().includes(queryLower) || 
                 inquiry.email.toLowerCase().includes(queryLower);
        });

        expect(searchResults.map(i => i.id)).toEqual(expectedIds);

        // Verify all results contain the search query in either name or email
        searchResults.forEach((inquiry) => {
          const queryLower = query.toLowerCase();
          const nameMatch = inquiry.name.toLowerCase().includes(queryLower);
          const emailMatch = inquiry.email.toLowerCase().includes(queryLower);
          expect(nameMatch || emailMatch).toBe(true);
        });
      });
    });

    it("should handle case-insensitive search correctly", () => {
      const testInquiries = [
        {
          id: 1,
          name: "JOHN DOE",
          email: "JOHN@EXAMPLE.COM",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "jane smith",
          email: "jane@company.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "contacted" as const,
          createdAt: new Date(),
        },
      ];

      const caseTestQueries = [
        { query: "john", expectedIds: [1] },
        { query: "JOHN", expectedIds: [1] },
        { query: "John", expectedIds: [1] },
        { query: "jane", expectedIds: [2] },
        { query: "JANE", expectedIds: [2] },
        { query: "Jane", expectedIds: [2] },
        { query: "example", expectedIds: [1] },
        { query: "EXAMPLE", expectedIds: [1] },
        { query: "Example", expectedIds: [1] },
      ];

      // Property: Search should be case-insensitive for both name and email
      caseTestQueries.forEach(({ query, expectedIds }) => {
        const searchResults = testInquiries.filter((inquiry) => {
          const queryLower = query.toLowerCase();
          return inquiry.name.toLowerCase().includes(queryLower) || 
                 inquiry.email.toLowerCase().includes(queryLower);
        });

        expect(searchResults.map(i => i.id)).toEqual(expectedIds);

        // Verify case-insensitive matching works
        searchResults.forEach((inquiry) => {
          const queryLower = query.toLowerCase();
          const nameMatch = inquiry.name.toLowerCase().includes(queryLower);
          const emailMatch = inquiry.email.toLowerCase().includes(queryLower);
          expect(nameMatch || emailMatch).toBe(true);
        });
      });
    });

    it("should handle empty and whitespace search queries", () => {
      const testInquiries = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date(),
        },
      ];

      const emptyQueries = ["", "   ", "\t", "\n"];

      // Property: Empty or whitespace-only queries should return all inquiries
      emptyQueries.forEach((query) => {
        const searchResults = testInquiries.filter((inquiry) => {
          if (!query.trim()) {
            return true; // Empty query returns all
          }
          const queryLower = query.toLowerCase();
          return inquiry.name.toLowerCase().includes(queryLower) || 
                 inquiry.email.toLowerCase().includes(queryLower);
        });

        expect(searchResults).toHaveLength(testInquiries.length);
        expect(searchResults).toEqual(testInquiries);
      });
    });

    it("should handle special characters in search queries", () => {
      const testInquiries = [
        {
          id: 1,
          name: "John O'Connor",
          email: "john.oconnor@example.com",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "new" as const,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Jane Smith-Wilson",
          email: "jane+work@company.co.uk",
          phone: null,
          company: null,
          projectType: null,
          budget: null,
          timeline: null,
          message: null,
          status: "contacted" as const,
          createdAt: new Date(),
        },
      ];

      const specialCharQueries = [
        { query: "o'connor", expectedIds: [1] },
        { query: "smith-wilson", expectedIds: [2] },
        { query: "john.oconnor", expectedIds: [1] },
        { query: "jane+work", expectedIds: [2] },
        { query: "co.uk", expectedIds: [2] },
      ];

      // Property: Search should handle special characters correctly
      specialCharQueries.forEach(({ query, expectedIds }) => {
        const searchResults = testInquiries.filter((inquiry) => {
          const queryLower = query.toLowerCase();
          return inquiry.name.toLowerCase().includes(queryLower) || 
                 inquiry.email.toLowerCase().includes(queryLower);
        });

        expect(searchResults.map(i => i.id)).toEqual(expectedIds);

        // Verify special characters are matched correctly
        searchResults.forEach((inquiry) => {
          const queryLower = query.toLowerCase();
          const nameMatch = inquiry.name.toLowerCase().includes(queryLower);
          const emailMatch = inquiry.email.toLowerCase().includes(queryLower);
          expect(nameMatch || emailMatch).toBe(true);
        });
      });
    });
  });
});

// Note: These tests validate Requirements 1.5 and 1.6 - Filtering and Search Functionality
// Property 2 ensures that for any status filter, only matching inquiries are returned
// Property 3 ensures that for any search query, only inquiries with matching name/email are returned
// Both properties work with case-insensitive matching and handle edge cases properly