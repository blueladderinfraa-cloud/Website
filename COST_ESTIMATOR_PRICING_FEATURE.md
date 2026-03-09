# Cost Estimator Pricing Management Feature

## Summary
Added admin panel functionality to manage Cost Estimator pricing. Admins can now customize the per square foot price for all construction types and quality levels.

## What Was Added

### 1. Admin Panel - New "Cost Estimator Pricing" Section
**Location:** Admin Panel → Content → Cost Estimator Pricing

**Features:**
- Configure pricing for 4 construction types:
  - 🏠 Residential Construction
  - 🏢 Commercial Construction
  - 🏭 Industrial Construction
  - 🌉 Infrastructure Construction

- Each construction type has 4 quality levels:
  - Basic (Standard materials and finishes)
  - Standard (Quality materials with modern finishes)
  - Premium (High-end materials and custom features)
  - Luxury (Top-tier materials and bespoke design)

- For each quality level, you can set a single price per sq.ft. (₹)

### 2. Default Pricing (Pre-configured)

**Residential:**
- Basic: ₹125 per sq.ft.
- Standard: ₹200 per sq.ft.
- Premium: ₹325 per sq.ft.
- Luxury: ₹500 per sq.ft.

**Commercial:**
- Basic: ₹150 per sq.ft.
- Standard: ₹240 per sq.ft.
- Premium: ₹375 per sq.ft.
- Luxury: ₹575 per sq.ft.

**Industrial:**
- Basic: ₹100 per sq.ft.
- Standard: ₹160 per sq.ft.
- Premium: ₹275 per sq.ft.
- Luxury: ₹425 per sq.ft.

**Infrastructure:**
- Basic: ₹200 per sq.ft.
- Standard: ₹325 per sq.ft.
- Premium: ₹500 per sq.ft.
- Luxury: ₹750 per sq.ft.

## How to Use

### Step 1: Access Admin Panel
1. Go to: http://localhost:3001/admin/content
2. Login with your admin credentials

### Step 2: Navigate to Pricing Section
1. In the left sidebar, click on "Cost Estimator Pricing"
2. You'll see 4 sections for each construction type

### Step 3: Update Prices
1. Enter your desired price for each quality level
2. All prices are in Indian Rupees (₹) per square foot
3. Each quality level has one price field

### Step 4: Save Changes
1. Click the "Save Pricing" button at the bottom
2. You'll see a success message when saved
3. The Cost Estimator on your website will immediately use the new prices

## Technical Details

### Files Modified:
1. **client/src/pages/admin/Content.tsx**
   - Added new "pricing" section to admin panel
   - Created UI for managing all pricing fields (single price per level)
   - Added save functionality for pricing data

2. **client/src/hooks/useContentManager.ts**
   - Added `getPricingContent()` function
   - Returns pricing structure with admin values or defaults
   - Handles data parsing and fallbacks

3. **client/src/pages/CostEstimator.tsx**
   - Updated to use `getPricingContent()` from useContentManager
   - Removed hardcoded pricing ranges
   - Now displays single estimated cost instead of range
   - Uses single price per quality level

### Database Storage:
- Pricing data is stored in the `site_content` table
- Section: "pricing"
- Key: "content"
- Value: JSON object with all pricing fields

### Data Structure:
```json
{
  "residential_basic": "125",
  "residential_standard": "200",
  "residential_premium": "325",
  "residential_luxury": "500",
  "commercial_basic": "150",
  ... (and so on for all types and levels)
}
```

## Benefits

1. **Easy Price Updates:** Change prices anytime without touching code
2. **Market Flexibility:** Adjust pricing based on market conditions
3. **Regional Customization:** Set prices appropriate for your region
4. **Quality Control:** Maintain consistent pricing across quality levels
5. **Instant Updates:** Changes reflect immediately on the website
6. **Simple Interface:** One price per level - easy to understand and manage

## Testing

To test the feature:
1. Go to admin panel and change some prices
2. Save the changes
3. Visit the Cost Estimator page: http://localhost:3001/cost-estimator
4. Select different construction types and quality levels
5. Verify the estimates use your new prices

## Notes

- All prices are in Indian Rupees (₹)
- The Cost Estimator uses these prices as base rates
- Final estimates include adjustments for:
  - Number of floors (5% premium per additional floor)
  - Basement inclusion (80% of floor area)
  - Landscaping (7.5% additional cost)
- The calculator now shows a single estimated cost instead of a range

## Support

If you need to reset to default prices:
1. Simply re-enter the default values shown above
2. Or delete the pricing_content entry from the database to use hardcoded defaults
