# Implementation Plan: Project Gallery Management

## Overview

This implementation plan transforms the single-image project system into a comprehensive multi-photo gallery with admin upload capabilities and website slider functionality. The approach ensures backward compatibility while adding powerful new features for showcasing projects from multiple angles.

## Tasks

- [x] 1. Set up database schema for multiple project photos
  - Create project_galleries table for organizing photos per project
  - Create project_images table for storing individual photo metadata
  - Add foreign key relationships and constraints
  - Create database migration script for existing projects
  - _Requirements: 5.3, 6.2_

- [ ] 2. Implement backend API for multiple photo management
  - [ ] 2.1 Create gallery CRUD endpoints
    - POST /api/projects/{id}/gallery - Create gallery for project
    - GET /api/projects/{id}/gallery - Retrieve project gallery with all photos
    - PUT /api/projects/{id}/gallery - Update gallery metadata
    - DELETE /api/projects/{id}/gallery - Remove entire gallery
    - _Requirements: 1.2, 5.3_

  - [ ]* 2.2 Write property test for gallery CRUD operations
    - **Property 7: Data integrity maintenance**
    - **Validates: Requirements 5.3**

  - [ ] 2.3 Implement batch photo upload endpoint
    - POST /api/projects/{id}/gallery/images - Upload multiple photos simultaneously
    - Handle multipart form data with multiple files
    - Validate file types and sizes for each uploaded photo
    - Return upload progress and success/error status per photo
    - _Requirements: 1.3, 1.4_

  - [ ]* 2.4 Write property test for batch upload validation
    - **Property 2: Image validation consistency**
    - **Validates: Requirements 1.3**

  - [ ] 2.5 Create photo reordering and management endpoints
    - PUT /api/projects/{id}/gallery/reorder - Reorder photos in gallery
    - PUT /api/projects/{id}/gallery/cover - Set cover photo
    - DELETE /api/projects/{id}/gallery/images/{imageId} - Delete individual photo
    - _Requirements: 1.5, 2.2, 2.3, 2.4_

  - [ ]* 2.6 Write property test for photo sequence management
    - **Property 1: Gallery sequence integrity**
    - **Validates: Requirements 1.2, 2.2, 2.4**

- [ ] 3. Create MultiImageUpload component for admin interface
  - [ ] 3.1 Build batch file selection interface
    - Support multiple file selection from file browser
    - Implement drag-and-drop for multiple files simultaneously
    - Add file type and size validation with user feedback
    - Show upload progress for each individual photo
    - _Requirements: 1.1, 1.3, 1.4_

  - [ ]* 3.2 Write unit tests for upload interface
    - Test multiple file selection and validation
    - Test drag-and-drop functionality
    - Test progress indicator accuracy
    - _Requirements: 1.1, 1.4_

  - [ ] 3.3 Implement photo grid management
    - Display uploaded photos as sortable thumbnail grid
    - Add drag-and-drop reordering within the grid
    - Implement cover photo selection with visual indicators
    - Add individual photo deletion with confirmation
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.4 Write property test for photo grid operations
    - **Property 3: Cover image designation**
    - **Validates: Requirements 2.3, 2.5**

- [ ] 4. Integrate multi-photo upload into project admin forms
  - [ ] 4.1 Replace single ImageUpload with MultiImageUpload in Projects.tsx
    - Update project form to use new multi-photo component
    - Modify form data structure to handle photo arrays
    - Update form submission to save multiple photos
    - Maintain backward compatibility with existing single-image projects
    - _Requirements: 1.1, 6.5_

  - [ ]* 4.2 Write integration tests for admin form
    - Test project creation with multiple photos
    - Test project editing with photo additions/removals
    - Test backward compatibility with existing projects
    - _Requirements: 1.1, 6.5_

- [ ] 5. Checkpoint - Ensure admin upload functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create ProjectGallery slider component for website
  - [ ] 6.1 Build interactive photo slideshow
    - Create slider component with smooth transitions between photos
    - Add previous/next navigation arrows
    - Implement dot indicators showing current photo and total count
    - Add photo counter display (e.g., "3 of 8")
    - _Requirements: 3.1, 3.2, 4.3_

  - [ ]* 6.2 Write property test for slideshow navigation
    - **Property 5: Navigation interaction consistency**
    - **Validates: Requirements 3.3, 3.5, 4.1**

  - [ ] 6.3 Add touch and keyboard support
    - Implement swipe gestures for mobile navigation
    - Add keyboard arrow key navigation for accessibility
    - Include touch event handling for tablet devices
    - _Requirements: 3.5, 4.1_

  - [ ]* 6.4 Write unit tests for interaction methods
    - Test touch gesture recognition
    - Test keyboard navigation functionality
    - Test accessibility features
    - _Requirements: 3.5, 4.1_

  - [ ] 6.5 Implement responsive design and auto-play
    - Add responsive breakpoints for different screen sizes
    - Implement optional auto-play with pause on hover
    - Ensure proper aspect ratio maintenance across devices
    - Add loading states for smooth photo transitions
    - _Requirements: 4.2, 4.4_

  - [ ]* 6.6 Write property test for responsive behavior
    - **Property 6: Responsive layout preservation**
    - **Validates: Requirements 4.2**

- [ ] 7. Integrate gallery slider into project pages
  - [ ] 7.1 Update project display pages to use gallery slider
    - Replace single image display with ProjectGallery component
    - Handle projects with single images (backward compatibility)
    - Add fallback for projects without any images
    - _Requirements: 3.1, 6.1, 6.3_

  - [ ]* 7.2 Write property test for backward compatibility
    - **Property 10: Backward compatibility preservation**
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ] 7.3 Add gallery display to project listing pages
    - Show cover photo in project cards/listings
    - Add photo count indicator on project cards (e.g., "5 photos")
    - Ensure cover photo selection works correctly
    - _Requirements: 2.3, 2.5_

- [ ] 8. Implement data migration for existing projects
  - [ ] 8.1 Create migration script for existing single-image projects
    - Convert existing coverImage URLs to gallery format
    - Create gallery records for projects with existing images
    - Preserve all existing project metadata and relationships
    - _Requirements: 6.2_

  - [ ]* 8.2 Write property test for data migration
    - **Property 8: Cascading deletion completeness**
    - **Validates: Requirements 5.4**

- [ ] 9. Add performance optimizations
  - [ ] 9.1 Implement lazy loading for gallery images
    - Load only visible images initially
    - Preload next/previous images for smooth navigation
    - Add loading placeholders and smooth transitions
    - _Requirements: 5.2_

  - [ ] 9.2 Add image optimization and compression
    - Automatically resize and compress uploaded photos
    - Generate multiple sizes for different display contexts
    - Implement efficient storage and delivery
    - _Requirements: 5.1_

  - [ ]* 9.3 Write unit tests for performance features
    - Test lazy loading behavior
    - Test image optimization results
    - Test loading state management
    - _Requirements: 5.1, 5.2_

- [ ] 10. Final checkpoint - Ensure complete functionality
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation of multi-photo functionality
- Property tests validate universal correctness properties for gallery operations
- Unit tests validate specific examples and edge cases for photo management
- The implementation maintains full backward compatibility with existing single-image projects