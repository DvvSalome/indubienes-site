# Funnel Landing Page - Quick Reference

## File Locations

```
src/app/p/[id]/
├── page.tsx            (Server component - metadata & routing)
├── FunnelClient.tsx    (Main landing page UI)
├── FunnelGallery.tsx   (Image gallery with lightbox)
└── FunnelForm.tsx      (Lead capture form)

src/app/api/leads/
└── route.ts            (Lead submission API)

Documentation:
├── FUNNEL_SYSTEM.md           (Complete documentation)
├── IMPLEMENTATION_GUIDE.md    (Quick start & configuration)
├── QUICK_REFERENCE.md         (This file)
└── FUNNEL_BUILD_SUMMARY.txt   (Project summary)
```

## URLs

```
Basic property link:
https://indubienes.com/p/12345

With UTM parameters:
https://indubienes.com/p/12345?utm_source=instagram&utm_medium=story&utm_campaign=featured
```

## Component Overview

### page.tsx (Server)
```typescript
// - Fetches property from WASI API
// - Generates Open Graph meta tags
// - Returns FunnelClient component
// - Handles 404 errors

export async function generateMetadata({ params }: Props): Promise<Metadata>
// Generates: title, description, og:image, og:title, twitter:card
```

### FunnelClient.tsx (Client)
```typescript
// - Hero section with fullscreen image
// - WhatsApp CTA button
// - Information request CTA button
// - Gallery section with FunnelGallery
// - Property details section
// - Lead form section with FunnelForm
// - Footer with branding
```

### FunnelGallery.tsx (Client)
```typescript
// - Horizontal scrollable gallery
// - Click to expand in lightbox
// - Navigation arrows in lightbox
// - Image counter
// - Collects images from:
//   - property.main_image
//   - property.galleries[].images
```

### FunnelForm.tsx (Client)
```typescript
// - Form fields: name, phone, email, message
// - POST to /api/leads
// - Validation: required fields, email format
// - States: idle, loading, success, error
// - Captures UTM parameters from URL
```

### api/leads/route.ts (API)
```typescript
// POST /api/leads
// - Validates required fields
// - Validates email format
// - Stores lead (currently in-memory)
// - Returns success with leadId

// GET /api/leads (dev only)
// - Returns all captured leads
// - Requires authorization header
```

## Key Imports

```typescript
// React
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Next.js
import { Metadata } from 'next';

// Types
import { Property } from '@/lib/types';

// Utils
import { getProperty, formatPrice } from '@/lib/wasi';
```

## Color System

```css
--gold: #C9A962;           /* Primary accent */
--gold-hover: #B8943D;     /* Darker gold */
--background: #0D0D0D;     /* Dark bg */
--foreground: #FFFFFF;     /* White text */
--surface: #1A1A1A;        /* Dark surface */
--muted: #B0B0B0;          /* Secondary text */
--faint: #707070;          /* Tertiary text */
--border-color: #333333;   /* Dark border */
```

## Responsive Classes

```tailwind
sm:  640px   /* Mobile landscape + tablets */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */

Examples:
- grid-cols-1 sm:grid-cols-2  (1 col mobile, 2 cols tablet)
- px-4 sm:px-6 lg:px-8        (responsive padding)
- text-2xl sm:text-3xl        (responsive font size)
```

## Common Edits

### Change WhatsApp Number
**File**: `FunnelClient.tsx` line 47
```tsx
href={`https://wa.me/573177597155?text=${whatsappMessage}`}
                      // ^^^^^^^^^^^^^^ Change here
```

### Change Gold Color
**File**: `src/app/globals.css` line 19
```css
--gold: #C9A962;      /* Change this hex */
```

### Add Form Field
**File**: `FunnelForm.tsx`
1. Add to `FormData` interface
2. Add input in form JSX
3. Update API validation in `api/leads/route.ts`

### Update Google Maps API Key
**File**: `FunnelClient.tsx` (map section)
```tsx
src={`https://www.google.com/maps/embed/v1/place?key=YOUR_KEY&q=...`}
                                                      // ^^^^^^ Update here
```

## API Reference

### POST /api/leads

**Request:**
```typescript
interface LeadRequest {
  name: string;              // Required
  phone: string;             // Required
  email: string;             // Required
  message?: string;          // Optional
  property_id: number;       // Required
  source: string;            // "funnel"
  utm_source?: string;       // From URL
  utm_medium?: string;       // From URL
  utm_campaign?: string;     // From URL
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Lead submitted successfully",
  "leadId": "1712246400000"
}
```

**Response (400):**
```json
{
  "error": "Missing required fields: name, phone, email, property_id"
}
```

### GET /api/leads (Development)

**Request:**
```bash
curl https://indubienes.com/api/leads \
  -H "Authorization: Bearer dev-secret"
```

**Response:**
```json
{
  "total": 5,
  "leads": [
    {
      "id": "1712246400000",
      "timestamp": "2026-04-04T15:00:00.000Z",
      "name": "Juan García",
      "phone": "+57 3XX XXX XXXX",
      "email": "juan@example.com",
      "property_id": 12345,
      "source": "funnel",
      "utm_source": "instagram"
    }
  ]
}
```

## Design System

### Hero Section
- Fullscreen background image with gradient overlay
- Property type badge (gold)
- Price in large gold text
- Location with icon
- 4-stat grid (responsive)
- Two CTA buttons
- Scroll indicator

### Gallery Section
- Horizontal scrollable container
- Hover effect on images
- Click to expand
- Lightbox with navigation

### Details Section
- Description text
- Feature grids with icons
- Google Maps embed
- Dark background with cards

### Form Section
- Input fields with gold focus state
- Loading button state
- Success message
- Error handling
- Privacy footer

## Performance Tips

```typescript
// Force fresh data (important for dynamic content)
export const dynamic = 'force-dynamic';

// Use responsive images
<img src={url} alt={title} className="w-full h-full object-cover" />

// CSS-only animations (no JS needed)
className="transition hover:scale-105 duration-300"

// Lazy load images
loading="lazy" (native HTML)
```

## Mobile Optimization

```tsx
// Responsive layout
<div className="flex flex-col sm:flex-row gap-4">

// Touch-friendly buttons (44px min height)
<button className="py-4 px-8">  {/* 44px high */}

// Large text on mobile
<h1 className="text-2xl sm:text-3xl lg:text-4xl">

// Full-width inputs on mobile
<input className="w-full px-4 py-3" />

// Vertical stack on mobile
<div className="grid grid-cols-1 sm:grid-cols-2">
```

## Common Issues & Fixes

### Form not submitting
```typescript
// Check:
1. Required fields are filled
2. Email format is valid (includes @)
3. API endpoint is reachable
4. Server logs for errors
5. Network tab in DevTools
```

### Images not loading
```typescript
// Check:
1. WASI API returns valid image URLs
2. Image URLs are HTTPS
3. CORS headers if external images
4. next.config.js image domains
```

### WhatsApp button not opening
```typescript
// Check:
1. Phone number format is correct
2. URL encoding is working
3. Testing on mobile device
4. WhatsApp app is installed
5. Browser DevTools console for errors
```

### UTM parameters not captured
```typescript
// Check:
1. URL has parameters: ?utm_source=...
2. useSearchParams() hook working
3. Parameters passed to form
4. API request includes fields
5. Database stores fields
```

## Testing

### Local Testing
```bash
npm run dev                    # Start dev server
# Visit http://localhost:3000/p/1
```

### Form Submission
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+57 3XX XXX XXXX",
    "email": "test@example.com",
    "property_id": 1,
    "source": "funnel"
  }'
```

### View Leads
```bash
curl http://localhost:3000/api/leads \
  -H "Authorization: Bearer dev-secret"
```

### Test Social Preview
1. Facebook: https://developers.facebook.com/tools/debug/sharing
2. Twitter: https://cards-dev.twitter.com/validator
3. LinkedIn: https://www.linkedin.com/post-inspector

## Production Checklist

```
Before deploying:
☐ Database configured and connected
☐ Email service set up
☐ Google Maps API key added
☐ WhatsApp number verified
☐ Environment variables set
☐ Rate limiting added
☐ Error monitoring configured
☐ Analytics integrated
☐ CAPTCHA added (optional)
☐ All links tested
☐ Mobile tested
☐ Form submissions working
☐ Social preview tested
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WASI_COMPANY_ID=1288465
NEXT_PUBLIC_WASI_TOKEN=***REDACTED***

# For production
DATABASE_URL=your_db_url
SENDGRID_API_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key
LEADS_API_SECRET=your_secret

# Optional
SENTRY_DSN=your_sentry_url
NEXT_PUBLIC_ANALYTICS_ID=your_ga_id
```

## Support Resources

- **Full docs**: `FUNNEL_SYSTEM.md`
- **Setup guide**: `IMPLEMENTATION_GUIDE.md`
- **This file**: Quick reference for common tasks
- **Source code**: Component files with detailed comments
- **WASI API**: `/src/lib/wasi.ts` for property data
- **Types**: `/src/lib/types.ts` for TypeScript interfaces

## Next Steps

1. Run dev server: `npm run dev`
2. Test pages: `/p/1`, `/p/2`, `/p/3`
3. Submit test form
4. Configure database
5. Set up email service
6. Deploy to production

---

**Need help?** Check the detailed documentation files or review component source code comments.
