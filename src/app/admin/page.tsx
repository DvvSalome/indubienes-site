'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  reference: string;
  city_label: string;
  created_at: string;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Justo ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHr < 24) return `Hace ${diffHr}h`;
  if (diffDay === 1) return 'Ayer';
  if (diffDay < 7) return `Hace ${diffDay} días`;
  if (diffDay < 30) return `Hace ${Math.floor(diffDay / 7)} sem`;
  return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
}

function getClientTypeIcon(types: WasiClient['client_types']): { icon: string; color: string; label: string } {
  const typeIds = types.map(t => t.id_client_type);
  if (typeIds.includes(7)) return { icon: '🔍', color: 'bg-blue-500/20 text-blue-300', label: 'Buscando' };
  if (typeIds.includes(5)) return { icon: '🏠', color: 'bg-amber-500/20 text-amber-300', label: 'Propietario' };
  if (typeIds.includes(6)) return { icon: '💼', color: 'bg-purple-500/20 text-purple-300', label: 'Inversionista' };
  return { icon: '👤', color: 'bg-gray-500/20 text-gray-300', label: 'Cliente' };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentClients, setRecentClients] = useState<WasiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch stats and recent clients in parallel
      const [statsResult, clientsResult] = await Promise.allSettled([
        fetchStats(),
        fetchRecentClients(),
      ]);
      if (statsResult.status === 'rejected') console.error('Stats fetch failed:', statsResult.reason);
      if (clientsResult.status === 'rejected') console.error('Clients fetch failed:', clientsResult.reason);
    };
    fetchAll();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch property count and client stats in parallel
      const [propertiesRes, clientStatsRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/clients?stats=true'),
      ]);

      const propertiesData = await propertiesRes.json();
      const clientStats = await clientStatsRes.json();

      const totalProperties = propertiesData.properties?.length || propertiesData.total || 0;
      const totalClients = clientStats.total || 0;
      const newThisMonth = clientStats.newThisMonth || 0;

      setStats([
        {
          label: 'Total Propiedades',
          value: totalProperties,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11v-5m0 0V9m0 5h.01" />
            </svg>
          ),
          trend: 'WASI sincronizado',
          trendUp: true,
        },
        {
          label: 'Total Clientes',
          value: totalClients.toLocaleString('es-CO'),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          trend: 'Desde WASI',
          trendUp: true,
        },
        {
          label: 'Nuevos este mes',
          value: newThisMonth,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ),
          trend: newThisMonth > 0 ? `+${newThisMonth} leads` : 'Sin nuevos',
          trendUp: newThisMonth > 0,
        },
        {
          label: 'Fuente principal',
          value: 'Página web',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          ),
          trend: 'Indubienes.com',
          trendUp: true,
        },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats([
        {
          label: 'Total Propiedades',
          value: '—',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11v-5m0 0V9m0 5h.01" />
            </svg>
          ),
          trend: 'Error de conexión',
          trendUp: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentClients = async () => {
    try {
      const res = await fetch('/api/clients?take=15');
      const data = await res.json();
      setRecentClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching recent clients:', error);
    } finally {
      setClientsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h1>
          <div className="h-1 w-16 bg-[#C9A962] rounded-full" />
        </div>
        <div className="text-right text-sm text-[#888]">
          <p>Panel sincronizado con WASI</p>
          <p className="text-xs mt-1">Última actualización: ahora</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222] animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#222] rounded-full" />
              </div>
              <div className="h-8 bg-[#222] rounded w-2/3 mb-2" />
              <div className="h-4 bg-[#222] rounded w-1/2" />
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222] hover:border-[#333] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#C9A962]/10 rounded-full flex items-center justify-center text-[#C9A962]">
                  {stat.icon}
                </div>
                {stat.trend && (
                  <span
                    className={`text-xs font-medium ${
                      stat.trendUp ? 'text-green-400' : 'text-[#888]'
                    }`}
                  >
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-[#888]">{stat.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-white">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/marketing"
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-6 py-4 text-white hover:bg-[#222] hover:border-[#C9A962]/30 transition-all flex items-center gap-3 group"
          >
            <svg className="w-5 h-5 text-[#C9A962] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="font-medium">Generar link de propiedad</span>
          </Link>

          <Link
            href="/admin/propiedades"
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-6 py-4 text-white hover:bg-[#222] hover:border-[#C9A962]/30 transition-all flex items-center gap-3 group"
          >
            <svg className="w-5 h-5 text-[#C9A962] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11v-5m0 0V9m0 5h.01" />
            </svg>
            <span className="font-medium">Ver propiedades</span>
          </Link>

          <Link
            href="/admin/leads"
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-6 py-4 text-white hover:bg-[#222] hover:border-[#C9A962]/30 transition-all flex items-center gap-3 group"
          >
            <svg className="w-5 h-5 text-[#C9A962] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">Ver clientes / leads</span>
          </Link>
        </div>
      </div>

      {/* Recent Clients from WASI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C9A962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Últimos clientes (WASI)
          </h2>
          <Link href="/admin/leads" className="text-sm text-[#C9A962] hover:text-[#B8943D] transition-colors">
            Ver todos →
          </Link>
        </div>

        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg overflow-hidden">
          {clientsLoading ? (
            <div className="divide-y divide-[#222]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#222] rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#222] rounded w-1/3" />
                    <div className="h-3 bg-[#222] rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-[#222] rounded w-20" />
                </div>
              ))}
            </div>
          ) : recentClients.length > 0 ? (
            <div className="divide-y divide-[#222]">
              {recentClients.map((client) => {
                const typeInfo = getClientTypeIcon(client.client_types);
                const displayName = [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Sin nombre';
                const contactInfo = client.cell_phone || client.phone || client.email;

                return (
                  <div
                    key={client.id_client}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-[#222]/50 transition-colors"
                  >
                    {/* Avatar/Type icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${typeInfo.color}`}>
                      {typeInfo.icon}
                    </div>

                    {/* Client info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{displayName}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {client.client_status_label === 'Nuevo' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-300">
                            NUEVO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {contactInfo && (
                          <p className="text-xs text-[#888] truncate">{contactInfo}</p>
                        )}
                        {client.city_label && (
                          <p className="text-xs text-[#666] truncate">• {client.city_label}</p>
                        )}
                      </div>
                    </div>

                    {/* Reference */}
                    {client.reference && (
                      <span className="text-[10px] text-[#666] bg-[#222] px-2 py-1 rounded hidden sm:block">
                        {client.reference}
                      </span>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-[#666] flex-shrink-0 whitespace-nowrap">
                      {timeAgo(client.created_at)}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {(client.cell_phone || client.phone) && (
                        <a
                          href={`https://wa.me/${(client.cell_phone || client.phone || '').replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                          title="WhatsApp"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </a>
                      )}
                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="Email"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-[#444] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-[#888]">No se encontraron clientes en WASI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
