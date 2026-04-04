import { NextRequest, NextResponse } from 'next/server';
import { addLead, getLeads, getLeadStats } from '@/lib/leads';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // Prevent caching for leads

/**
 * GET /api/leads
 * Returns all leads (protected - requires session cookie)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const sessionCookie = request.cookies.get('indubienes_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifySessionToken(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      // Return statistics instead of all leads
      const leadStats = getLeadStats();
      return NextResponse.json(leadStats);
    }

    // Return all leads
    const leads = getLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Creates a new lead (public - from funnel forms)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, phone, email, property_id, source } = body;

    if (!name || !phone || !email || property_id === undefined || !source) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, phone, email, property_id, source',
        },
        { status: 400 }
      );
    }

    // Validate source
    const validSources = ['funnel', 'contact', 'whatsapp', 'direct'];
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be one of: funnel, contact, whatsapp, direct' },
        { status: 400 }
      );
    }

    // Create the lead
    const newLead = addLead({
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      message: body.message ? String(body.message).trim() : undefined,
      property_id: Number(property_id),
      property_title: body.property_title
        ? String(body.property_title).trim()
        : undefined,
      source,
      utm_source: body.utm_source ? String(body.utm_source).trim() : undefined,
      utm_medium: body.utm_medium ? String(body.utm_medium).trim() : undefined,
      utm_campaign: body.utm_campaign
        ? String(body.utm_campaign).trim()
        : undefined,
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
