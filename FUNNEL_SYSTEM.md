# Funnel Landing Page System - Indubienes

## Overview

The funnel landing page system is a conversion-optimized property sharing and lead capture system. When a property link is shared on Instagram, Facebook, or WhatsApp, it displays a beautiful preview with Open Graph meta tags, then leads to a high-conversion landing page designed to capture qualified leads.

### Key Features

- **Social Media Previews**: Beautiful Open Graph meta tags for Instagram/Facebook/WhatsApp
- **Hero Section**: Fullscreen property image with dark overlay, price, location, and key stats
- **Image Gallery**: Horizontal scrollable gallery with lightbox functionality
- **Property Details**: Full description, features grid (internal/external), and embedded map
- **Lead Capture Form**: Mobile-optimized form with validation
- **UTM Tracking**: Automatic tracking of campaign source, medium, and campaign
- **WhatsApp Integration**: Direct contact button with pre-filled property details
- **Conversion Focused**: Every element drives toward lead capture or WhatsApp contact

## File Structure

```
src/app/p/[id]/
├── page.tsx           # Server component - metadata & property fetching
├── FunnelClient.tsx   # Client component - main landing page UI
├── FunnelGallery.tsx  # Image gallery with lightbox
├── FunnelForm.tsx     # Lead capture form with validation

src/app/api/leads/
└── route.ts           # POST endpoint for lead submissions
```

## URL Structure

Property funnel pages are accessible at:
```
https://indubienes.com/p/[property_id]
```

With optional UTM parameters:
```
https://indubienes.com/p/12345?utm_source=instagram&utm_medium=story&utm_campaign=spring_sale
```

## Component Details

### 1. `page.tsx` (Server Component)

**Responsibilities:**
- Fetch property data from WASI API
- Generate Open Graph meta tags for social sharing
- Handle 404 cases gracefully
- Enable dynamic route generation

**Meta Tags Generated:**
- `og:title` - Property type, transaction type, location
- `og:description` - Full property summary with specs
- `og:image` - High-res main property image (1200x630)
- `twitter:card` - Large image summary for Twitter

**Dynamic Routes:**
- The `[id]` parameter captures the property ID from the URL
- `force-dynamic` ensures fresh data from WASI on every request

### 2. `FunnelClient.tsx` (Client Component)

**Sections:**

#### Hero Section
- Fullscreen background image of property with gradient overlay
- Property type badge (e.g., "Apartamento en Venta")
- Price in gold (#C9A962) display
- Location with pin icon
- 4-column stat grid (bedrooms, bathrooms, area, garages)
- Two primary CTAs:
  1. **WhatsApp Button** - Green, links to wa.me with pre-filled message
  2. **Information Request** - Gold, scrolls to lead form
- Animated scroll indicator (bouncing arrow)

#### Gallery Section
- Horizontal scroll of all property images (main + galleries)
- Click any image to open lightbox
- Smooth animations on hover

#### Details Section
- Property observations/description
- Internal features grid with checkmarks
- External features grid with checkmarks
- Embedded Google Maps iframe

#### Lead Form Section
- Heading: "¿Interesado en esta propiedad?"
- Contained in its own section for clear focus
- Smooth scroll to from hero CTA

#### Footer Mini
- Indubienes branding
- WhatsApp contact link
- Privacy assurance text

**Design System:**
- Dark luxury background: `#0D0D0D`
- Gold accents: `#C9A962`
- Surface color: `#1A1A1A`
- Text colors: `#FFFFFF` (primary), `#B0B0B0` (secondary), `#707070` (tertiary)
- All text responsive with Tailwind breakpoints (sm, lg, xl)

### 3. `FunnelGallery.tsx`

**Features:**
- Collects all images (main + all gallery images)
- Horizontal scroll gallery
- Click to expand in fullscreen lightbox
- Lightbox navigation (previous/next arrows)
- Image counter (e.g., "3 / 12")
- Click outside to close
- Smooth transitions and hover effects

**Responsive:**
- Mobile: Full-width scrollable gallery
- Desktop: Shows gallery cards in row

### 4. `FunnelForm.tsx`

**Form Fields:**
- **Nombre completo** - Required text input
- **Teléfono** - Required tel input
- **Email** - Required email input with validation
- **Mensaje** - Optional textarea

**Functionality:**
- Client-side validation (required fields, email format)
- Server-side validation in API
- Loading state with disabled button
- Success state with confirmation message
- Error handling with user-friendly messages
- Auto-reset form on success
- Auto-dismiss success message after 5 seconds

**UTM Tracking:**
- Captures `utm_source`, `utm_medium`, `utm_campaign` from URL
- Includes them in lead submission for campaign tracking
- Stored with lead in database

### 5. `api/leads/route.ts` (API Endpoint)

**POST /api/leads**

**Request Body:**
```typescript
{
  name: string;           // Required
  phone: string;          // Required
  email: string;          // Required, validated
  message?: string;       // Optional
  property_id: number;    // Required
  source: string;         // e.g., "funnel"
  utm_source?: string;    // From URL param
  utm_medium?: string;    // From URL param
  utm_campaign?: string;  // From URL param
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Lead submitted successfully",
  "leadId": "1712246400000"
}
```

**Response (Error - 400):**
```json
{
  "error": "Missing required fields: name, phone, email, property_id"
}
```

**Current Implementation:**
- In-memory storage (for development)
- Console logging of leads
- TODO comments for production integrations:
  - Database (Supabase, MongoDB)
  - Email service (SendGrid, Mailgun)
  - CRM (HubSpot, Salesforce)
  - Webhooks (external services)

## WhatsApp Integration

**Direct Contact Button:**
```
https://wa.me/573177597155?text={encoded_message}
```

**Pre-filled Message Format:**
```
Hola, me interesa esta propiedad: [Property Type] en [City].
[Bedrooms] hab, [Bathrooms] baños, [Area]m². [Price]
```

Example:
```
Hola, me interesa esta propiedad: Apartamento en Medellín.
3 hab, 2 baños, 85m². $450.000.000
```

## UTM Parameter Tracking

The system automatically captures campaign tracking data:

**URL with UTM:**
```
https://indubienes.com/p/12345?utm_source=instagram&utm_medium=story&utm_campaign=spring_sale
```

**Stored with Lead:**
```json
{
  "id": "1712246400000",
  "timestamp": "2026-04-04T15:00:00.000Z",
  "name": "Juan García",
  "phone": "+57 3XX XXX XXXX",
  "email": "juan@example.com",
  "property_id": 12345,
  "source": "funnel",
  "utm_source": "instagram",
  "utm_medium": "story",
  "utm_campaign": "spring_sale"
}
```

This allows tracking which campaigns drive the most qualified leads.

## Open Graph Meta Tags

When someone shares a property link on social media, the preview shows:

**Visual Preview:**
- Property main image (1200x630)
- Property type and transaction type
- Price
- Location
- Bedrooms, bathrooms, area

**Title:**
```
Apartamento en Venta en El Poblado | Indubienes
```

**Description:**
```
Apartamento de 85m² con 3 hab. 2 baños. $450.000.000. El Poblado, Medellín.
```

## Mobile Responsiveness

The entire system is mobile-first:

**Breakpoints:**
- `sm` (640px) - Tablets and larger phones
- `md` (768px) - Tablets
- `lg` (1024px) - Desktops
- `xl` (1280px) - Large desktops

**Mobile Optimizations:**
- Single column layouts on small screens
- Touch-friendly buttons (min 44px height)
- Swipeable gallery
- Vertical form layout
- Large, readable text

## Performance Optimizations

- **Dynamic Route**: Fetches fresh data on every request
- **Image Optimization**: Uses Next.js Image component
- **CSS-in-JS**: Only critical CSS loaded initially
- **Smooth Animations**: CSS transitions, no GSAP
- **Lazy Loading**: Images load as needed

## Production Checklist

- [ ] Replace in-memory lead storage with database
- [ ] Integrate with email service for lead notifications
- [ ] Connect CRM system for lead management
- [ ] Add CORS headers if API is used from external domains
- [ ] Implement rate limiting on lead submission
- [ ] Add CAPTCHA to lead form (optional but recommended)
- [ ] Set up lead webhook for real-time notifications
- [ ] Configure email templates for lead notifications
- [ ] Add analytics event tracking (Google Analytics, etc.)
- [ ] Test Open Graph preview (Facebook Share Debugger)
- [ ] Test WhatsApp sharing preview
- [ ] Monitor lead submission errors
- [ ] Set up monitoring/alerting for API failures

## Example Usage

### Sharing on Instagram Stories:
1. Copy the funnel link: `https://indubienes.com/p/12345?utm_source=instagram&utm_medium=story&utm_campaign=featured_property`
2. Paste in Instagram story caption
3. Instagram generates preview with property image and details
4. User clicks link → lands on conversion-optimized page
5. User fills form or clicks WhatsApp → lead captured

### Sharing on Facebook:
1. Copy funnel link
2. Paste in Facebook post/comment
3. Facebook generates rich preview
4. User clicks → lands on page
5. Lead captured via form or WhatsApp

### Direct WhatsApp Link:
- CTA button automatically generates `wa.me` link with pre-filled message
- User clicks → opens WhatsApp with property details
- Closes the loop immediately for hot leads

## Customization

### Colors:
Edit color tokens in `src/app/globals.css`:
- `--gold: #C9A962` - Primary accent
- `--background: #0D0D0D` - Dark background
- `--foreground: #FFFFFF` - Text

### WhatsApp Number:
Update phone number in `FunnelClient.tsx`:
```tsx
href={`https://wa.me/573177597155?text=${whatsappMessage}`}
```

### Form Fields:
Add/remove fields in `FunnelForm.tsx` and update API in `api/leads/route.ts`

### Map Provider:
Currently using Google Maps. To change:
1. Update `FunnelClient.tsx` map section
2. Replace with Mapbox, Leaflet, etc.

## API Documentation

### POST /api/leads

Submit a new lead.

**Request:**
```bash
curl -X POST https://indubienes.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan García",
    "phone": "+57 3XX XXX XXXX",
    "email": "juan@example.com",
    "message": "Me interesa para vivir",
    "property_id": 12345,
    "source": "funnel",
    "utm_source": "instagram",
    "utm_medium": "story",
    "utm_campaign": "featured"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Lead submitted successfully",
  "leadId": "1712246400000"
}
```

### GET /api/leads (Development Only)

View captured leads (add auth in production).

**Request:**
```bash
curl https://indubienes.com/api/leads \
  -H "Authorization: Bearer dev-secret"
```

## Troubleshooting

### Property not found (404):
- Verify property ID exists in WASI
- Check WASI API credentials
- Fallback uses mock data if API fails

### Images not loading:
- Check WASI image URLs are valid
- Verify CORS headers if external images
- Check image domains in `next.config.js`

### Form submission fails:
- Check API endpoint URL
- Verify network request in browser DevTools
- Check server logs for errors
- Ensure required fields are filled

### WhatsApp link not working:
- Verify phone number format
- Check URL encoding of message
- Test link on mobile device
- Ensure WhatsApp installed

### UTM parameters not captured:
- Check URL has parameters: `?utm_source=...`
- Verify `useSearchParams()` hook in FunnelForm
- Check API request payload includes utm fields

## Analytics Integration (Future)

To track funnel performance:

1. **Page Views**: Track property page views
2. **Form Submissions**: Track lead form completions
3. **WhatsApp Clicks**: Track WhatsApp CTA clicks
4. **Conversion Rate**: Calculate form submissions / page views
5. **Attribution**: Use UTM parameters to track campaign effectiveness

Add to FunnelClient.tsx:
```tsx
useEffect(() => {
  // Track page view
  gtag.pageview({
    page_path: `/p/${property.id_property}`,
    page_title: property.property_type_label,
  });
}, [property.id_property]);
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for errors
3. Test with mock data to isolate issues
4. Verify WASI API connectivity
