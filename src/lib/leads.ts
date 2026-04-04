/**
 * Leads storage and management
 *
 * For MVP on Vercel (no persistent filesystem), this uses an in-memory store.
 * In production, this should be replaced with a database (PostgreSQL, MongoDB, etc).
 */

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message?: string;
  property_id: number;
  property_title?: string;
  source: 'funnel' | 'contact' | 'whatsapp' | 'direct';
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
}

// In-memory store (resets on cold start, but good for MVP)
// In production, replace this with a real database
let leads: Lead[] = [];

/**
 * Generate a unique ID for a lead
 */
function generateId(): string {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a new lead to the store
 */
export function addLead(
  lead: Omit<Lead, 'id' | 'created_at' | 'status'>
): Lead {
  const newLead: Lead = {
    ...lead,
    id: generateId(),
    created_at: new Date().toISOString(),
    status: 'new',
  };

  leads.push(newLead);

  // Optional: Send email notification
  sendLeadNotification(newLead).catch((err) => {
    console.error('Failed to send lead notification email:', err);
  });

  return newLead;
}

/**
 * Get all leads
 */
export function getLeads(): Lead[] {
  return leads;
}

/**
 * Get leads by property ID
 */
export function getLeadsByProperty(propertyId: number): Lead[] {
  return leads.filter((lead) => lead.property_id === propertyId);
}

/**
 * Get a single lead by ID
 */
export function getLead(id: string): Lead | null {
  return leads.find((lead) => lead.id === id) || null;
}

/**
 * Update lead status
 */
export function updateLeadStatus(
  id: string,
  status: Lead['status']
): Lead | null {
  const lead = leads.find((l) => l.id === id);
  if (!lead) return null;

  lead.status = status;
  return lead;
}

/**
 * Get lead statistics
 */
export function getLeadStats(): {
  total: number;
  thisMonth: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonth = leads.filter((lead) => {
    const leadDate = new Date(lead.created_at);
    return leadDate >= startOfMonth;
  }).length;

  const bySource: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  leads.forEach((lead) => {
    bySource[lead.source] = (bySource[lead.source] || 0) + 1;
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
  });

  return {
    total: leads.length,
    thisMonth,
    bySource,
    byStatus,
  };
}

/**
 * Send lead notification email
 * In production, integrate with SendGrid, Resend, or similar service
 */
async function sendLeadNotification(lead: Lead): Promise<void> {
  // TODO: Implement email sending
  // For now, just log it
  console.log('Lead notification:', {
    to: process.env.ADMIN_EMAIL || 'admin@indubienes.com',
    subject: `Nuevo lead: ${lead.name}`,
    lead,
  });
}

/**
 * Delete a lead (hard delete)
 * TODO: Implement soft delete with archive
 */
export function deleteLead(id: string): boolean {
  const initialLength = leads.length;
  leads = leads.filter((l) => l.id !== id);
  return leads.length < initialLength;
}

/**
 * Clear all leads (for testing/development)
 */
export function clearLeads(): void {
  leads = [];
}
