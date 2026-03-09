# Background Image Debug and Fix Implementation

## Issue Description
User reported a problem with the background image in the admin content page at `http://localhost:3001/admin/content`.

## Potential Issues Identified

### 1. Image URL Validation
- Empty or invalid image URLs could cause background images not to display
- Added validation in `useContentManager.ts` to ensure valid image URLs

### 2. Data Loading and Saving
- Mismatch between how hero content is saved vs. how it's retrieved
- Added debug logging to track data flow

### 3. CSS Background Image Application
- Background images applied via CSS `backgroundImage` style property
- Added fallback mechanisms for invalid URLs

## Fixes Implemented

### 1. Enhanced useContentManager.ts
```typescript
const getHeroContent = () => {
  const heroData = getContent("hero", "content", {
    // ... default values
  });
  
  // Debug logging in development
  if (import.meta.env?.DEV) {
    console.log('Hero content loaded:', heroData);
  }
  
  // Ensure image URL is valid
  if (!heroData.image || heroData.image.trim() === '') {
    heroData.image = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=1080&fit=crop";
  }
  
  return heroData;
};
```

### 2. Enhanced Admin Content Page Debug Info
Added debug information panel in development mode:
```typescript
{/* Debug Info - Remove in production */}
{import.meta.env.DEV && (
  <div className="bg-gray-100 border rounded p-3 text-xs">
    <div><strong>Debug Info:</strong></div>
    <div>Current hero_image value: {content.hero_image || 'undefined'}</div>
    <div>Default image: {DEFAULT_HERO_IMAGE}</div>
    <div>Final value: {content.hero_image || DEFAULT_HERO_IMAGE}</div>
  </div>
)}
```

### 3. Enhanced Home Page Debug Info
Added debug panel to show current hero image URL:
```typescript
{/* Debug Info - Remove in production */}
{import.meta.env.DEV && (
  <div className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
    <div>Hero Image URL: {heroContent.image}</div>
    <div>Image loaded: {heroContent.image ? 'Yes' : 'No'}</div>
  </div>
)}
```

### 4. Enhanced Save Functionality
Added logging to track what data is being saved:
```typescript
const heroData = {
  headline: content.hero_headline || "Building Tomorrow's Infrastructure Today",
  subheadline: content.hero_subheadline || "Leading construction company...",
  image: content.hero_image || DEFAULT_HERO_IMAGE,
  cta: content.hero_cta || "Get a Quote",
};

console.log('Saving hero data:', heroData); // Debug log
handleSave("hero", "content", heroData);
```

## Debugging Steps

### 1. Check Admin Panel
1. Go to `http://localhost:3001/admin/content`
2. Navigate to "Hero Section"
3. Check the debug info panel (only visible in development)
4. Verify the image URL values

### 2. Check Home Page
1. Go to `http://localhost:3001/`
2. Check the debug info panel in top-right corner (only visible in development)
3. Verify the hero image URL is loaded correctly

### 3. Check Browser Console
1. Open browser developer tools
2. Check console for any error messages
3. Look for the debug logs showing hero content data

### 4. Check Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Reload the page and check if the background image is being requested
4. Verify the image loads successfully (status 200)

## Common Issues and Solutions

### Issue 1: Image Not Uploading
**Symptoms**: Upload button doesn't work, no progress indicator
**Solution**: Check upload mutation and file validation

### Issue 2: Image Not Saving
**Symptoms**: Image uploads but reverts to default after page refresh
**Solution**: Check save functionality and database storage

### Issue 3: Image Not Displaying
**Symptoms**: Image URL is correct but background doesn't show
**Solution**: Check CSS background-image property and URL encoding

### Issue 4: Invalid Image URL
**Symptoms**: Broken image or no background
**Solution**: Validate URL format and accessibility

## Testing Checklist

- [ ] Upload a new hero background image
- [ ] Verify image appears in admin preview
- [ ] Save the hero section
- [ ] Check that image persists after page refresh
- [ ] Verify image appears on home page
- [ ] Test with different image formats (PNG, JPG)
- [ ] Test with different image sizes
- [ ] Test reset to default functionality

## Cleanup

Once the issue is resolved, remove the debug code:
1. Remove debug panels from Home.tsx
2. Remove debug panels from Content.tsx
3. Remove console.log statements from useContentManager.ts

## Status: 🔧 DEBUGGING ACTIVE

Debug code has been added to help identify the specific background image issue. Please test the application and check the debug information to determine the root cause.