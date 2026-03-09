# Design Document

## Overview

This design document outlines the implementation of missing admin panel features for the Blueladder Infrastructure construction company website. The system will extend the existing admin panel with five new management sections: Inquiries, Subcontractors, Tenders, Content, and Users. All features will integrate with the existing tRPC API endpoints and maintain consistency with the current admin interface design patterns.

## Architecture

### Component Architecture
The admin panel follows a consistent architectural pattern:
- **Layout Components**: Shared header, navigation, and layout structure
- **Page Components**: Individual admin pages for each feature area
- **Form Components**: Reusable forms for CRUD operations
- **Table Components**: Data display with filtering and actions
- **Modal Components**: Dialog-based forms for create/edit operations

### Data Flow Architecture
```
User Interface → tRPC Client → API Router → Database Layer
     ↑                                           ↓
Toast Notifications ← Response Handling ← Business Logic
```

### State Management
- **tRPC Queries**: Server state management with caching and invalidation
- **React State**: Local component state for forms and UI interactions
- **URL State**: Filter and search parameters in URL for bookmarkability

## Components and Interfaces

### Shared Layout Components

#### AdminLayout Component
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  title: string;
  description?: string;
}
```

**Responsibilities:**
- Render consistent header with branding and user info
- Provide navigation tabs with active state highlighting
- Handle authentication checks and redirects
- Manage logout functionality

#### AdminHeader Component
```typescript
interface AdminHeaderProps {
  user: User;
  onLogout: () => Promise<void>;
}
```

**Features:**
- Blueladder branding with link to main site
- User welcome message
- Logout button with proper session cleanup
- "View Site" link for easy navigation

#### AdminNavigation Component
```typescript
interface AdminNavigationProps {
  currentPage: string;
  navItems: Array<{
    href: string;
    label: string;
    icon?: React.ComponentType;
  }>;
}
```

**Features:**
- Horizontal tab navigation
- Active state highlighting
- Responsive design with overflow scrolling
- Consistent styling with existing patterns

### Page Components

#### AdminInquiries Component
```typescript
interface InquiryData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceType?: string;
  message?: string;
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
  createdAt: Date;
}
```

**Features:**
- Inquiry list with status badges
- Search by name, email, or service type
- Filter by status with dropdown
- Status update functionality
- Detailed inquiry view in modal
- Responsive table design

#### AdminSubcontractors Component
```typescript
interface SubcontractorApplication {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  specializations: string[];
  yearsExperience?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
```

**Features:**
- Application list with status indicators
- Filter by specialization and status
- Application detail view with documents
- Status update with approval/rejection
- Document download functionality

#### AdminTenders Component
```typescript
interface TenderData {
  id: number;
  title: string;
  description?: string;
  category: 'residential' | 'commercial' | 'industrial' | 'infrastructure';
  budget?: string;
  deadline?: Date;
  status: 'open' | 'closed' | 'awarded';
  applicationCount: number;
  createdAt: Date;
}
```

**Features:**
- Tender list with application counts
- Create/edit tender form
- Tender application management
- Status management (open/closed/awarded)
- Application review interface

#### AdminContent Component
```typescript
interface ContentSection {
  section: string;
  key: string;
  value?: string;
  type: 'text' | 'html' | 'image' | 'json';
}

interface ServiceData {
  id: number;
  title: string;
  slug: string;
  category: string;
  shortDescription?: string;
  isActive: boolean;
}
```

**Features:**
- Site content editing interface
- Service management (CRUD operations)
- Testimonial management
- Site statistics editing
- Rich text editing capabilities

#### AdminUsers Component
```typescript
interface UserData {
  id: number;
  name?: string;
  email?: string;
  role: 'user' | 'admin' | 'client' | 'subcontractor';
  lastSignedIn?: Date;
  projectAccess: Array<{
    projectId: number;
    projectTitle: string;
    accessLevel: 'view' | 'full';
  }>;
}
```

**Features:**
- User list with role indicators
- Role management functionality
- Project assignment interface
- User activity tracking
- Bulk operations support

## Data Models

### Form Data Models
Each admin page uses specific form data models for create/edit operations:

```typescript
// Inquiry form data
interface InquiryFormData {
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
}

// Tender form data
interface TenderFormData {
  title: string;
  description?: string;
  category: 'residential' | 'commercial' | 'industrial' | 'infrastructure';
  budget?: string;
  deadline?: Date;
  requirements?: string;
  status: 'open' | 'closed' | 'awarded';
}

// Service form data
interface ServiceFormData {
  title: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  category: 'residential' | 'commercial' | 'industrial' | 'infrastructure';
  features: string[];
  isActive: boolean;
}

// User role update data
interface UserRoleUpdateData {
  userId: number;
  role: 'user' | 'admin' | 'client' | 'subcontractor';
}
```

### API Integration Models
All components integrate with existing tRPC endpoints:

```typescript
// tRPC query hooks used
- trpc.inquiries.list.useQuery()
- trpc.inquiries.updateStatus.useMutation()
- trpc.subcontractors.list.useQuery()
- trpc.subcontractors.updateStatus.useMutation()
- trpc.tenders.all.useQuery()
- trpc.tenders.create.useMutation()
- trpc.tenders.update.useMutation()
- trpc.services.all.useQuery()
- trpc.services.create.useMutation()
- trpc.services.update.useMutation()
- trpc.users.list.useQuery()
- trpc.users.updateRole.useMutation()
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Now I'll analyze the acceptance criteria to determine which ones are testable as properties:

### Property Reflection

After reviewing all the testable properties from the prework analysis, I've identified several areas where properties can be consolidated:

**Redundancy Analysis:**
- Properties 1.2, 2.2, 3.2 all test that display functions include required fields - these can be combined into one comprehensive property about data display completeness
- Properties 1.5, 2.5, 5.5 all test filtering logic - these can be combined into one property about filtering functionality
- Properties 1.4, 2.4, 3.4, 5.2 all test status/data updates - these can be combined into one property about data persistence
- Properties 3.1, 4.3, 4.5 all test CRUD operations - these can be combined into one comprehensive CRUD property

**Final Consolidated Properties:**

### Correctness Properties

Property 1: Data Display Completeness
*For any* admin data list (inquiries, subcontractors, tenders, services, users), the display function should include all required fields specified for that data type
**Validates: Requirements 1.2, 2.2, 3.2**

Property 2: Filtering Functionality
*For any* admin list with filtering capability, applying a filter should return only items that match the filter criteria
**Validates: Requirements 1.5, 2.5, 5.5**

Property 3: Search Functionality  
*For any* search query on admin lists, the results should contain only items that match the query in the specified searchable fields
**Validates: Requirements 1.6**

Property 4: Data Persistence
*For any* data update operation (status changes, role updates, content edits), the changes should be saved to the database and reflected in the UI
**Validates: Requirements 1.4, 2.4, 3.4, 5.2, 4.4, 4.6**

Property 5: CRUD Operations Integrity
*For any* create, update, or delete operation on admin entities, the operation should complete successfully and maintain data integrity
**Validates: Requirements 3.1, 4.3, 4.5**

Property 6: Detail View Completeness
*For any* detail view (inquiry details, application details, tender applications), all relevant information should be displayed
**Validates: Requirements 1.3, 2.3, 3.5, 5.6**

Property 7: Relationship Management
*For any* relationship operation (assigning clients to projects, removing access), the relationships should be correctly created or removed
**Validates: Requirements 5.3, 5.4**

Property 8: Navigation State Management
*For any* admin page navigation, the current page should be properly highlighted in the navigation
**Validates: Requirements 6.2**

Property 9: Authentication and Authorization
*For any* unauthorized access attempt, the system should redirect to the login page
**Validates: Requirements 6.6**

Property 10: API Integration Consistency
*For any* admin operation, the system should use the correct tRPC API endpoints and handle responses appropriately
**Validates: Requirements 7.1, 7.4, 7.5**

Property 11: Error Handling and User Feedback
*For any* admin operation, the system should provide appropriate loading states, error handling, and user feedback
**Validates: Requirements 6.5, 7.2, 7.3**

Property 12: Data Integrity Maintenance
*For any* operation that affects related entities, data integrity should be maintained across all relationships
**Validates: Requirements 7.6**

Property 13: Image Upload and Management
*For any* image upload or replacement operation, the image should be properly stored, optimized, and immediately reflected on the website
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

Property 14: Services Management Integrity
*For any* service management operation (create, edit, activate, deactivate), the changes should be saved correctly and immediately reflected on the main website services page
**Validates: Requirements 9.2, 9.3, 9.5, 9.6**

## Error Handling

### Client-Side Error Handling
- **Network Errors**: Display user-friendly messages for connection issues
- **Validation Errors**: Show field-specific validation messages
- **Authorization Errors**: Redirect to login with appropriate messaging
- **Server Errors**: Display generic error messages with retry options

### Loading States
- **Page Loading**: Full-page loading spinners for initial data fetching
- **Action Loading**: Button loading states for form submissions
- **Table Loading**: Skeleton loading for data tables
- **Modal Loading**: Loading states within modal dialogs

### Error Recovery
- **Retry Mechanisms**: Automatic retry for transient network errors
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Form Persistence**: Maintain form data during error recovery
- **Session Recovery**: Handle expired sessions gracefully

## Testing Strategy

### Unit Testing Approach
- **Component Testing**: Test individual admin page components in isolation
- **Form Testing**: Validate form submission and validation logic
- **Utility Testing**: Test helper functions and data transformations
- **Hook Testing**: Test custom React hooks for data fetching

### Property-Based Testing Approach
- **Data Display Testing**: Generate random data sets and verify display completeness
- **Filtering Testing**: Test filtering logic with various data combinations
- **CRUD Testing**: Verify create, read, update, delete operations maintain integrity
- **Relationship Testing**: Test user-project assignments and access control

### Integration Testing
- **API Integration**: Test tRPC client-server communication
- **Authentication Flow**: Test login/logout and session management
- **Navigation Testing**: Verify routing and page transitions
- **File Upload Testing**: Test document and image upload functionality

### Property Test Configuration
- **Minimum 100 iterations** per property test to ensure comprehensive coverage
- **Test Tags**: Each property test tagged with format: **Feature: admin-panel-features, Property {number}: {property_text}**
- **Data Generators**: Smart generators that create realistic admin data scenarios
- **Edge Case Coverage**: Include empty states, maximum values, and boundary conditions

### Testing Tools and Libraries
- **Property Testing**: Use fast-check for JavaScript property-based testing
- **Component Testing**: React Testing Library for component interaction testing
- **API Testing**: Mock tRPC endpoints for isolated testing
- **E2E Testing**: Playwright for full user journey testing

The testing strategy ensures both specific examples work correctly (unit tests) and universal properties hold across all inputs (property tests), providing comprehensive coverage of the admin panel functionality.