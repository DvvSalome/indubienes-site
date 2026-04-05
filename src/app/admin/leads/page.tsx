'use client';

import { useState, useEffect, useCallback } from 'react';

interface WasiClient {
  id_client: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cell_phone: string | null;
  client_type_label: string;
  client_types: { id_client_type: number; client_type_label: string }[];
  client_status_label: string;
  client_pipeline_label: string;
  client_origin_label: string;
  reference: string;
  comment: string | null;
  city_label: string;
  created_at: string;
  updated_at: string;
}

// ─── CLIENT FORM MODAL ────────────────────────────────────────────────────
interface ClientFormProps {
  client?: WasiClient | null;
  onClose: () => void;
  onSaved: () => void;
}

function ClientFormModal({ client, onClose, onSaved }: ClientFormProps) {
  const isEditing = !!client;

  const [form, setForm] = useState({
    first_name: client?.first_name || '',
    last_name: client?.last_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    cell_phone: client?.cell_phone || '',
    comment: client?.comment || '',
    id_client_status: 1,
    id_client_type: 7,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let res: Response;
      if (isEditing && client) {
        res = await fetch(`/api/clients/${client.id_client}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (res.ok && (data.status === 'success' || data.id_client)) {
        setSuccess(isEditing ? 'Cliente actualizado en WASI' : `Cliente creado en WASI (ID: ${data.id_client})`);
        setTimeout(() => { onSaved(); onClose(); }, 1200);
      } else {
        setError(data.error || 'Error al guardar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A962]/60 transition-colors';
  const labelClass = 'block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wider';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            {isEditing && <p className="text-xs text-[#666] mt-1">ID: {client?.id_client}</p>}
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">{success}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Apellido</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="Fijo" />
            </div>
            <div>
              <label className={labelClass}>Celular</label>
              <input name="cell_phone" value={form.cell_phone} onChange={handleChange} className={inputClass} placeholder="WhatsApp" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de cliente</label>
              <select name="id_client_type" value={form.id_client_type} onChange={handleChange} className={inputClass}>
                <option value={7}>Buscando propiedad</option>
                <option value={5}>Propietario</option>
                <option value={6}>Inversionista</option>
                <option value={8}>Arrendatario</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select name="id_client_status" value={form.id_client_status} onChange={handleChange} className={inputClass}>
                <option value={1}>Nuevo</option>
                <option value={2}>Activo</option>
                <option value={3}>Inactivo</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notas / Comentarios</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} rows={3} className={inputClass + ' resize-none'} placeholder="Notas sobre el cliente..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-[#C9A962] hover:bg-[#b89952] disabled:opacity-50 text-black py-3 rounded-lg text-sm font-bold transition-colors">
              {saving ? 'Guardando...' : isEditing ? 'Actualizar en WASI' : 'Crear en WASI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [clients, setClients] = useState<WasiClient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const itemsPerPage = 15;

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<WasiClient | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String(page * itemsPerPage),
        take: String(itemsPerPage),
      });
      if (searchQuery) params.set('query', searchQuery);

      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(data.clients || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearchQuery(searchInput);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTypeColor = (types: WasiClient['client_types']) => {
    const typeIds = types.map(t => t.id_client_type);
    if (typeIds.includes(7)) return 'bg-blue-500/20 text-blue-300';
    if (typeIds.includes(5)) return 'bg-amber-500/20 text-amber-300';
    if (typeIds.includes(6)) return 'bg-purple-500/20 text-purple-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'nuevo': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'activo': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'inactivo': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-[#222] text-[#888] border-[#333]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Clientes & Leads</h1>
          <div className="h-1 w-16 bg-[#C9A962] rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-[#888] hidden sm:block">
            <p>Total en WASI: <span className="text-white font-semibold">{total.toLocaleString('es-CO')}</span></p>
            <p className="text-xs mt-1">Sincronizado en tiempo real</p>
          </div>
          <button
            onClick={() => { setEditingClient(null); setShowForm(true); }}
            className="bg-[#C9A962] hover:bg-[#b89952] text-black font-bold px-5 py-3 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#C9A962]/10 rounded-full flex items-center justify-center text-[#C9A962]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <span className="text-xs text-green-400">WASI</span>
          </div>
          <p className="text-3xl font-bold text-white">{total.toLocaleString('es-CO')}</p>
          <p className="text-sm text-[#888]">Total Clientes</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{clients.filter(c => c.client_types.some(t => t.id_client_type === 7)).length}</p>
          <p className="text-sm text-[#888]">Buscando propiedad</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-4 7 4M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{clients.filter(c => c.client_types.some(t => t.id_client_type === 5)).length}</p>
          <p className="text-sm text-[#888]">Propietarios</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#C9A962]/50 transition-colors"
          />
        </div>
        <button type="submit" className="bg-[#C9A962] hover:bg-[#B8943D] text-[#0D0D0D] font-semibold px-6 py-3 rounded-lg transition-colors">Buscar</button>
        {searchQuery && (
          <button type="button" onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(0); }} className="bg-[#222] hover:bg-[#333] text-white px-4 py-3 rounded-lg transition-colors">Limpiar</button>
        )}
      </form>

      {/* Clients Table */}
      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#222] rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#222] bg-[#0D0D0D]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Fuente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#888] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {clients.map((client) => {
                  const displayName = [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Sin nombre';
                  const phone = client.cell_phone || client.phone || '';

                  return (
                    <tr key={client.id_client} className="hover:bg-[#222]/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-[#888] whitespace-nowrap">{formatDate(client.created_at)}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{displayName}</p>
                          {client.city_label && <p className="text-xs text-[#666] mt-0.5">{client.city_label}</p>}
                          {client.comment && <p className="text-xs text-[#555] mt-0.5 italic truncate max-w-[180px]">{client.comment}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          {client.email && <a href={`mailto:${client.email}`} className="text-[#C9A962] hover:underline block truncate max-w-[200px]">{client.email}</a>}
                          {phone && <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline text-xs block">{phone}</a>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {client.client_types.map((t, i) => (
                            <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded ${getTypeColor([t])}`}>{t.client_type_label}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(client.client_status_label)}`}>{client.client_status_label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-[#888] bg-[#222] px-2 py-1 rounded">{client.client_origin_label || client.reference || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => { setEditingClient(client); setShowForm(true); }}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          {phone && (
                            <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors" title="WhatsApp">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            </a>
                          )}
                          {client.email && (
                            <a href={`mailto:${client.email}`} className="p-2 rounded-lg bg-[#C9A962]/20 text-[#C9A962] hover:bg-[#C9A962]/30 transition-colors" title="Email">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </a>
                          )}
                          {phone && (
                            <a href={`tel:${phone}`} className="p-2 rounded-lg bg-[#222] text-[#888] hover:bg-[#333] transition-colors" title="Llamar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-[#444] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-[#888]">{searchQuery ? 'No se encontraron resultados' : 'No hay clientes registrados en WASI'}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#888]">
            Mostrando {page * itemsPerPage + 1}–{Math.min((page + 1) * itemsPerPage, total)} de {total.toLocaleString('es-CO')}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C9A962]/30 transition-colors">Anterior</button>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <>
                  <button onClick={() => setPage(0)} className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#222] text-white hover:border-[#C9A962]/30 transition-colors text-sm">1</button>
                  {page > 2 && <span className="text-[#666] px-1">...</span>}
                </>
              )}
              {[page - 1, page, page + 1].filter(p => p >= 0 && p < totalPages).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg transition-colors text-sm ${p === page ? 'bg-[#C9A962] text-black font-bold' : 'bg-[#1a1a1a] border border-[#222] text-white hover:border-[#C9A962]/30'}`}>{p + 1}</button>
              ))}
              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="text-[#666] px-1">...</span>}
                  <button onClick={() => setPage(totalPages - 1)} className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#222] text-white hover:border-[#C9A962]/30 transition-colors text-sm">{totalPages}</button>
                </>
              )}
            </div>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 bg-[#1a1a1a] border border-[#222] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C9A962]/30 transition-colors">Siguiente</button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ClientFormModal
          client={editingClient}
          onClose={() => { setShowForm(false); setEditingClient(null); }}
          onSaved={fetchClients}
        />
      )}
    </div>
  );
}
