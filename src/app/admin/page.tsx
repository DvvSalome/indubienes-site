'use client';

import { useState, useEffect } from 'react';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total properties from WASI API
        const propertiesRes = await fetch('/api/properties');
        const propertiesData = await propertiesRes.json();
        const totalProperties = propertiesData.properties?.length || propertiesData.total || 0;

        setStats([
          {
            label: 'Total Propiedades',
            value: totalProperties,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11v-5m0 0V9m0 5h.01" />
              </svg>
            ),
            trend: '+2 este mes',
            trendUp: true,
          },
          {
            label: 'Leads este mes',
            value: 0,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.666" />
              </svg>
            ),
            trend: 'Por activar',
            trendUp: false,
          },
          {
            label: 'Visitas hoy',
            value: 0,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ),
            trend: 'Tiempo real',
            trendUp: true,
          },
          {
            label: 'Conversión',
            value: '0%',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
            trend: 'Por medir',
            trendUp: false,
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
            trend: 'Error',
            trendUp: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const recentActivity = [
    { id: 1, action: 'Nueva propiedad agregada', timestamp: 'Hace 2 horas' },
    { id: 2, action: 'Nuevo lead registrado', timestamp: 'Hace 5 horas' },
    { id: 3, action: 'Propiedad actualizada', timestamp: 'Hace 1 día' },
    { id: 4, action: 'Campaña de marketing iniciada', timestamp: 'Hace 3 días' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h1>
          <div className="h-1 w-16 bg-[#C9A962] rounded-full" />
        </div>
        <div className="text-right text-sm text-[#888]">
          <p>Bienvenido al panel administrativo</p>
          <p className="text-xs mt-1">Última actualización: ahora</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton loaders
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
          <button className="bg-[#1a1a1a] border border-[#222] rounded-lg px-6 py-4 text-white hover:bg-[#222] hover:border-[#C9A962]/30 transition-all flex items-center gap-3 group">
            <svg className="w-5 h-5 text-[#C9A962] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="font-medium">Generar link de propiedad</span>
          </button>

          <a
            href="/admin/propiedades"
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-6 py-4 text-white hover:bg-[#222] hover:border-[#C9A962]/30 transition-all flex items-center gap-3 group"
          >
            <svg className="w-5 h-5 text-[#C9A962] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11v-5m0 0V9m0 5h.01" />
            </svg>
            <span className="font-medium">Ver propiedades</span>
          </a>

          <button className="bg-[#1a1a1a] border border-[#222] rounded-lg px-6 py-4 text-white hover:bg-[#222] hover:border-[#C9A962]/30 transition-all flex items-center gap-3 group">
            <svg className="w-5 h-5 text-[#C9A962] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Exportar leads</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-white">Actividad reciente</h2>
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg overflow-hidden">
          <div className="divide-y divide-[#222]">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#222]/50 transition-colors"
              >
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-sm text-[#888]">{activity.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
