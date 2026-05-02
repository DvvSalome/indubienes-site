# Funnel Landing Page - Implementation Guide

## Quick Start

The funnel landing page system is now fully implemented. Here's what was created:

### Files Created

**Landing Page Components:**
1. `src/app/p/[id]/page.tsx` - Server component with Open Graph metadata
2. `src/app/p/[id]/FunnelClient.tsx` - Main client component (hero, gallery, form)
3. `src/app/p/[id]/FunnelGallery.tsx` - Image gallery with lightbox
4. `src/app/p/[id]/FunnelForm.tsx` - Lead capture form

**API Endpoint:**
5. `src/app/api/leads/route.ts` - POST endpoint for lead submissions

**Documentation:**
6. `FUNNEL_SYSTEM.md` - Complete system documentation
7. `IMPLEMENTATION_GUIDE.md` - This file

## What It Does

When someone shares a property link on Instagram, Facebook, or WhatsApp:

1. **Social Preview** - Beautiful Open Graph preview with:
   - Property image
   - Property type and price
   - Full description with specs
   - Optimized for all platforms

2. **Conversion Landing Page** - Optimized funnel with:
   - Fullscreen hero with property image
   - Key stats (bedrooms, bathrooms, area, garages)
   - Direct WhatsApp contact button
   - Scrollable image gallery
   - Full property details and features
   - Lead capture form
   - Privacy assurance

3. **Lead Capture** - Automatically tracks:
   - Contact information (name, phone, email)
   - UTM campaign parameters
   - Property ID and source
   - Timestamp

## URL Format

```
https://indubienes.com/p/[property_id]
```

Examples:
```
https://indubienes.com/p/12345
https://indubienes.com/p/12345?utm_source=instagram&utm_medium=story&utm_campaign=featured
https://indubienes.com/p/67890?utm_source=facebook&utm_medium=post
```

## Key Features Implemented

### 1. Server-Side Rendering (page.tsx)
- Fetches property from WASI API
- Generates dynamic Open Graph meta tags
- Handles 404 errors gracefully
- Always fetches fresh data (`force-dynamic`)

### 2. Beautiful Hero Section
- Fullscreen background image with dark overlay
- Large price display in gold
- Property type badge
- Location with pin icon
- 4-column stats grid (responsive)
- Two primary CTAs:
  - **WhatsApp**: Direct contact with pre-filled message
  - **Information**: Scroll to lead form

### 3. Image Gallery
- Horizontal scrollable gallery of all images
- Click to expand in fullscreen lightbox
- Navigate with arrows in lightbox
- Image counter (e.g., "3 / 12")
- Smooth animations and transitions

### 4. Property Details
- Property description (observations)
- Internal features grid with checkmarks
- External features grid with checkmarks
- Embedded Google Maps
- All responsive and mobile-friendly

### 5. Lead Capture Form
- Fields: Name, Phone, Email, Message (optional)
- Client-side validation
- Server-side validation
- Loading state with disabled button
- Success/error messages
- Auto-reset after submission
- Privacy assurance footer

### 6. UTM Tracking
- Automatically captures campaign parameters
- Includes in lead submission
- Enables campaign attribution

### 7. WhatsApp Integration
- Direct contact button with pre-filled message
- Message includes property details
- Opens WhatsApp directly on mobile

### 8. Responsive Design
- Mobile-first approach
- Tailwind breakpoints (sm, lg, xl)
- Touch-friendly buttons and controls
- Optimized images

## Current State

### What's Ready:
- Complete UI/UX implementation
- All components fully functional
- Open Graph meta tag generation
- Lead form validation
- UTM parameter tracking
- WhatsApp integration
- Mobile responsiveness
- Image gallery with lightbox
- Property details display

### What Needs Configuration (Production):

1. **Lead Storage** (`src/app/api/leads/route.ts`)
   - Currently: In-memory storage
   - TODO: Connect to database
   ```typescript
   // Replace with your database:
   // - Supabase: await supabase.from('leads').insert([lead])
   // - MongoDB: await Lead.create(lead)
   // - Firebase: await db.collection('leads').add(lead)
   ```

2. **Email Notifications**
   - TODO: Send email when lead submitted
   ```typescript
   // Add email service:
   // - SendGrid
   // - Mailgun
   // - AWS SES
   // - Supabase Emails
   ```

3. **CRM Integration**
   - TODO: Push leads to your CRM
   ```typescript
   // Integrate with:
   // - HubSpot
   // - Salesforce
   // - Pipedrive
   // - Your custom system
   ```

4. **Analytics**
   - TODO: Track conversions and page views
   ```typescript
   // Add:
   // - Google Analytics
   // - Hotjar
   // - Mixpanel
   ```

5. **WhatsApp Phone Number**
   - Current: `+57 3177 597155`
   - Update in `FunnelClient.tsx` line 47

6. **Google Maps API Key**
   - Current: Using placeholder key
   - Update in `FunnelClient.tsx` map section
   - Get key: https://console.cloud.google.com

## How to Use

### Testing Locally

1. Start dev server:
   ```bash
   cd indubienes-site
   npm run dev
   ```

2. Visit a property:
   ```
   http://localhost:3000/p/1
   http://localhost:3000/p/2
   ```

3. Test form submission:
   - Fill in the form
   - Check console for lead data
   - Check `/api/leads` endpoint for stored leads

4. Test social sharing:
   - Open DevTools Network tab
   - Right-click page → Share
   - Check preview with property image and details

### Testing WhatsApp Button

1. On desktop: WhatsApp link opens web.whatsapp.com
2. On mobile: Opens WhatsApp app with pre-filled message
3. Test message format:
   ```
   Hola, me interesa esta propiedad: Apartamento en Medellín.
   3 hab, 2 baños, 85m². $450.000.000
   ```

### Testing UTM Parameters

1. Visit with UTM params:
   ```
   http://localhost:3000/p/12345?utm_source=instagram&utm_medium=story&utm_campaign=test
   ```

2. Fill form and submit
3. Check `/api/leads` to verify UTM fields stored

## Production Deployment

### Before Going Live:

1. **Database Setup**
   - Choose: Supabase, MongoDB, Firebase, PostgreSQL
   - Create `leads` table/collection
   - Update `api/leads/route.ts`

2. **Email Service**
   - Choose: SendGrid, Mailgun, AWS SES
   - Set up email template for lead notifications
   - Configure API keys in environment variables

3. **Google Maps**
   - Get API key from Google Cloud Console
   - Update in `FunnelClient.tsx`
   - Or use different map provider

4. **WhatsApp**
   - Verify phone number is correct
   - Test on actual device

5. **Environment Variables**
   - Create `.env.local`:
   ```
   NEXT_PUBLIC_WASI_COMPANY_ID=1288465
   NEXT_PUBLIC_WASI_TOKEN=***REDACTED***
   LEADS_API_SECRET=your_secret_key
   SENDGRID_API_KEY=your_key
   GOOGLE_MAPS_API_KEY=your_key
   ```

6. **Testing**
   - Test all links work
   - Test form submission and validation
   - Test WhatsApp sharing
   - Test social media preview (use Facebook Share Debugger)
   - Test on mobile devices

7. **Monitoring**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor lead submission errors
   - Track form completion rates

## File Reference

### Component Files

```tsx
// src/app/p/[id]/page.tsx
- Fetches property from WASI
- Generates meta tags
- Returns FunnelClient with property data

// src/app/p/[id]/FunnelClient.tsx
- Hero section with CTAs
- Gallery section
- Details section
- Form section
- Footer
- All styling and interactions

// src/app/p/[id]/FunnelGallery.tsx
- Horizontal scroll gallery
- Lightbox modal
- Image navigation
- Image counter

// src/app/p/[id]/FunnelForm.tsx
- Form fields: name, phone, email, message
- Client-side validation
- Server submission
- Success/error states
```

### API Files

```ts
// src/app/api/leads/route.ts
POST /api/leads
- Validates required fields
- Validates email format
- Stores lead
- Returns success response

GET /api/leads (dev only)
- Returns all captured leads
```

### Imports Used

```tsx
// React
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Next.js
import { Metadata } from 'next';

// Types
import { Property } from '@/lib/types';

// Utilities
import { getProperty, formatPrice } from '@/lib/wasi';
```

## Styling Reference

### Color Palette
- Dark background: `#0D0D0D`
- Gold accent: `#C9A962`
- Dark surface: `#1A1A1A`
- Light text: `#FFFFFF`
- Secondary text: `#B0B0B0`
- Tertiary text: `#707070`
- Green (WhatsApp): `green-500`

### Tailwind Classes Used
- `dark` - Dark mode enabled globally
- `bg-[#0D0D0D]` - Dark background
- `text-[#C9A962]` - Gold text
- `border border-[#333333]` - Dark border
- `hover:scale-105` - Zoom on hover
- `hover:bg-[#B8943D]` - Darker gold on hover

### Responsive Classes
- `sm:` - 640px and up (mobile landscape)
- `lg:` - 1024px and up (desktop)
- `grid-cols-1 sm:grid-cols-2` - 1 col mobile, 2 cols tablet
- `px-4 sm:px-6 lg:px-8` - Responsive padding

## Common Customizations

### Change WhatsApp Number
In `FunnelClient.tsx` line 47:
```tsx
href={`https://wa.me/573177597155?text=${whatsappMessage}`}
                      // ^^^^^^^^^^^^^^ Change this
```

### Change Gold Color
In `globals.css`:
```css
--gold: #C9A962;      /* Change this hex code */
--gold-hover: #B8943D;
```

### Add Form Fields
1. Add to `FormData` interface in `FunnelForm.tsx`
2. Add input in form JSX
3. Update API validation in `api/leads/route.ts`

### Change Map Provider
Replace Google Maps iframe with alternative:
```tsx
// Use Mapbox, Leaflet, Mapbox GL, etc.
<MapComponent lat={property.latitude} lng={property.longitude} />
```

## Testing Checklist

- [ ] Property pages load and display correctly
- [ ] Images load and display
- [ ] Gallery scrolls and lightbox opens
- [ ] WhatsApp button works (desktop and mobile)
- [ ] Form validates and submits
- [ ] Form success message appears
- [ ] UTM parameters are captured
- [ ] Open Graph preview shows correctly
- [ ] Mobile responsive layout works
- [ ] All links work
- [ ] Map embeds correctly
- [ ] Features display correctly
- [ ] 404 handling works for non-existent properties

## Support & Troubleshooting

See `FUNNEL_SYSTEM.md` for:
- Detailed architecture
- API documentation
- UTM tracking
- Open Graph meta tags
- Mobile responsiveness
- Performance optimizations
- Production checklist
- Troubleshooting guide

## Next Steps

1. **Test locally** - Run dev server and visit `/p/[id]`
2. **Configure production** - Set up database and email service
3. **Deploy** - Push to Vercel or your hosting
4. **Monitor** - Track leads and user behavior
5. **Iterate** - Optimize based on conversion metrics

## Questions?

Review:
1. This file for quick reference
2. `FUNNEL_SYSTEM.md` for detailed documentation
3. Component files for implementation details
4. `src/lib/wasi.ts` for property data
5. `src/lib/types.ts` for TypeScript interfaces
