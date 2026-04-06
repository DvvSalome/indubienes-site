'use client';
import { useEffect, useState } from 'react';

interface SessionInfo {
  companyId?: string;
  isValid: boolean;
}

export default function UsuariosPage() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/check', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setSessionInfo({ companyId: data.companyId, isValid: true });
        } else {
          setSessionInfo({ isValid: false });
        }
      } catch (error) {
        console.error('Error:', error);
        setSessionInfo({ isValid: false });
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Usuarios</h1>
          <div className="h-1 w-16 bg-[#4A8BC2] rounded-full" />
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-white">Usuario Actual</h2>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-[#222] rounded w-1/3" />
            <div className="h-4 bg-[#222] rounded w-1/4" />
          </div>
        ) : sessionInfo?.isValid ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#4A8BC2]/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#4A8BC2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{sessionInfo?.companyId || 'Usuario Administrador'}</h3>
                <p className="text-sm text-[#888]">Sesión activa</p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#222] space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#222] rounded-lg">
                <span className="text-sm text-[#888]">Rol</span>
                <span className="text-white font-medium">Administrador</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#222] rounded-lg">
                <span className="text-sm text-[#888]">Empresa</span>
                <span className="text-white font-medium">{sessionInfo?.companyId || 'Indubienes'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#222] rounded-lg">
                <span className="text-sm text-[#888]">Acceso</span>
                <span className="text-green-300 font-medium">Completo</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-[#444] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <p className="text-[#888]">No se pudo verificar la sesión</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-[#4A8BC2]/30 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#4A8BC2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          <h2 className="text-xl font-bold text-white">Próximamente</h2>
        </div>
        <p className="text-[#888] text-sm">Estamos trabajando en nuevas funcionalidades:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {[
            { icon: '👥', title: 'Gestión de múltiples usuarios', description: 'Invita a otros miembros del equipo' },
            { icon: '🔐', title: 'Roles y permisos', description: 'Asigna roles específicos personalizados' },
            { icon: '📊', title: 'Auditoría de actividades', description: 'Registra todas las acciones' },
            { icon: '🔑', title: 'Autenticación de dos factores', description: 'Protege tu cuenta con verificación en dos pasos' },
          ].map((feature, index) => (
            <div key={index} className="p-4 bg-[#1a1a1a] border border-[#222] rounded-lg space-y-2">
              <div className="text-2xl">{feature.icon}</div>
              <h3 className="font-bold text-white text-sm">{feature.title}</h3>
              <p className="text-xs text-[#888]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-white">Necesitas ayuda?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="https://wa.me/573177597155?text=Hola,%20tengo%20una%20pregunta%20sobre%20mi%20cuenta" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-colors group">
            <div><h3 className="font-bold text-white group-hover:text-green-300 transition-colors">WhatsApp</h3><p className="text-xs text-[#888]">Soporte en vivo</p></div>
            <svg className="w-5 h-5 text-green-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </a>
          <a href="mailto:admin@indubienes.com" className="flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors group">
            <div><h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">Email</h3><p className="text-xs text-[#888]">Contacto directo</p></div>
            <svg className="w-5 h-5 text-blue-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
