'use client';

import { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  property_id: number;
  property_title?: string;
  source: 'funnel' | 'contact' | 'whatsapp' | 'direct';
  created_at: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
}

interface LeadStats {
  total: number;
  thisMonth: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | Lead['status']>('all');
  const [filterSource, setFilterSource] = useState<'all' | Lead['source']>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/leads?stats=true');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    setUpdatingId(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update lead');
      const updatedLead = await response.json();
      setLeads(leads.map((l) => (l.id === leadId ? updatedLead : l)));
      await fetchStats();
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    return matchesStatus && matchesSource;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'contacted':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'qualified':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-[#222] text-[#888] border-[#333]';
    }
  };

  const getSourceBadgeColor = (source: Lead['source']) => {
    switch (source) {
      case 'funnel':
        return 'bg-purple-500/10 text-purple-300';
      case 'contact':
        return 'bg-blue-500/10 text-blue-300';
      case 'whatsapp':
        return 'bg-green-500/10 text-green-300';
      case 'direct':
        return 'bg-orange-500/10 text-orange-300';
      default:
        return 'bg-[#222] text-[#888]';
    }
  };

  const StatCard = ({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) => (
    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222] hover:border-[#333] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-[#C9A962]/10 rounded-full flex items-center justify-center text-[#C9A962]">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-[#888]">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Leads</h1>
          <div className="h-1 w-16 bg-[#C9A962] rounded-full" />
        </div>
        <div className="text-right text-sm text-[#888]">
          <p>Total de leads: {leads.length}</p>
          <p className="text-xs mt-1">Este mes: {stats?.thisMonth || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222] animate-pulse">
              <div className="h-8 bg-[#222] rounded w-2/3 mb-4" />
              <div className="h-4 bg-[#222] rounded w-1/2" />
            </div>
          ))
        ) : (
          <>
            <StatCard label="Total Leads" value={stats?.total || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m0-5.292V2.75m0 13.604A4 4 0 108.364 20.4m0-13.604v13.604m0 0A4 4 0 1016 20.4" /></svg>} />
            <StatCard label="Nuevos" value={stats?.byStatus['new'] || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} />
            <StatCard label="Contactados" value={stats?.byStatus['contacted'] || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
            <StatCard label="Calificados" value={stats?.byStatus['qualified'] || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as 'all' | Lead['status']); setCurrentPage(1); }} className="bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C9A962]/50 transition-colors cursor-pointer">
          <option value="all">Todos los estados</option>
          <option value="new">Nuevos</option>
          <option value="contacted">Contactados</option>
          <option value="qualified">Calificados</option>
          <option value="closed">Cerrados</option>
        </select>
        <select value={filterSource} onChange={(e) => { setFilterSource(e.target.value as 'all' | Lead['source']); setCurrentPage(1); }} className="bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C9A962]/50 transition-colors cursor-pointer">
          <option value="all">Todas las fuentes</option>
          <option value="funnel">Funnel</option>
          <option value="contact">Contacto</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="direct">Directo</option>
        </select>
      </div>

      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8"><div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-[#222] rounded animate-pulse" />)}</div></div>
        ) : paginatedLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#222] bg-[#0D0D0D]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Propiedad</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Fuente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#222]/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#888]">{formatDate(lead.created_at)}</td>
                    <td className="px-6 py-4"><p className="text-sm font-medium text-white">{lead.name}</p></td>
                    <td className="px-6 py-4 text-sm"><div className="space-y-1"><a href={`mailto:${lead.email}`} className="text-[#C9A962] hover:underline block">{lead.email}</a><a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline text-xs block">{lead.phone}</a></div></td>
                    <td className="px-6 py-4 text-sm text-[#888]">{lead.property_title || `ID: ${lead.property_id}`}</td>
                    <td className="px-6 py-4"><span className={`text-xs font-medium px-2 py-1 rounded ${getSourceBadgeColor(lead.source)}`}>{lead.source}</span></td>
                    <td className="px-6 py-4"><select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])} disabled={updatingId === lead.id} className={`text-xs font-medium px-2 py-1 rounded border cursor-pointer transition-colors ${getStatusColor(lead.status)}`}><option value="new">Nuevo</option><option value="contacted">Contactado</option><option value="qualified">Calificado</option><option value="closed">Cerrado</option></select></td>
                    <td className="px-6 py-4"><div className="flex gap-2"><a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors" title="Abrir WhatsApp"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371 0-.57 0-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.115 7.737L3.329 23.994l8.23-2.161c2.261 1.23 4.787 1.878 7.465 1.878 5.37 0 9.957-4.587 9.957-10.007 0-2.679-.551-5.212-1.589-7.663-1.038-2.451-2.506-4.617-4.383-6.36-1.877-1.743-4.061-3.085-6.499-3.973C13.322.75 10.557 0 7.589 0 2.218 0-2.242 4.587-2.242 10.007c0 1.71.35 3.34 1.007 4.828L.292 23.994l8.23-2.161c2.261 1.23 4.787 1.878 7.465 1.878 5.37 0 9.957-4.587 9.957-10.007 0-2.679-.551-5.212-1.589-7.663-1.038-2.451-2.506-4.617-4.383-6.36-1.877-1.743-4.061-3.085-6.499-3.973C13.322.75 10.557 0 7.589 0 2.218 0-2.242 4.587-2.242 10.007z" /></svg></a><a href={`mailto:${lead.email}`} className="p-2 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors" title="Enviar email"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></a></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center"><svg className="w-12 h-12 text-[#444] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m0-5.292V2.75m0 13.604A4 4 0 108.364 20.4m0-13.604v13.604m0 0A4 4 0 1016 20.4" /></svg><p className="text-[#888]">No se encontraron leads</p></div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C9A962]/30 transition-colors">Anterior</button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (<button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg transition-colors ${currentPage === i + 1 ? 'bg-[#C9A962] text-black font-bold' : 'bg-[#1a1a1a] border border-[#222] text-white hover:border-[#C9A962]/30'}`}>{i + 1}</button>))}
          </div>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C9A962]/30 transition-colors">Siguiente</button>
        </div>
      )}
    </div>
  );
}
