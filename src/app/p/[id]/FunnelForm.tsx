'use client';

import { useState } from 'react';

interface FunnelFormProps {
  propertyId: number;
  propertyType: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface FormState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export default function FunnelForm({
  propertyId,
  utmSource,
  utmMedium,
  utmCampaign,
}: FunnelFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [state, setState] = useState<FormState>({ status: 'idle' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ status: 'loading' });

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          property_id: propertyId,
          source: 'funnel',
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setState({
        status: 'success',
        message: '¡Gracias! Un asesor te contactará pronto',
      });

      // Reset form
      setFormData({ name: '', phone: '', email: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setState({ status: 'idle' });
      }, 5000);
    } catch {
      setState({
        status: 'error',
        message: 'Ocurrió un error al enviar el formulario. Por favor intenta de nuevo.',
      });
    }
  };

  if (state.status === 'success') {
    return (
      <div className="bg-green-500/10 border border-green-500 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-500 mb-2">¡Envío exitoso!</h3>
        <p className="text-[#B0B0B0]">{state.message}</p>
        <p className="text-[#707070] text-sm mt-4">Nos pondremos en contacto contigo en las próximas 24 horas.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1A1A1A] rounded-lg p-8 sm:p-12 border border-[#333333]">
      {/* Name */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
          Nombre completo *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full bg-[#242424] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#707070] focus:outline-none focus:border-[#C9A962] transition"
          placeholder="Tu nombre"
        />
      </div>

      {/* Phone */}
      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
          Teléfono *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full bg-[#242424] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#707070] focus:outline-none focus:border-[#C9A962] transition"
          placeholder="+57 3XX XXX XXXX"
        />
      </div>

      {/* Email */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full bg-[#242424] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#707070] focus:outline-none focus:border-[#C9A962] transition"
          placeholder="tu@email.com"
        />
      </div>

      {/* Message */}
      <div className="mb-8">
        <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
          Mensaje (opcional)
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full bg-[#242424] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#707070] focus:outline-none focus:border-[#C9A962] transition resize-none"
          placeholder="Cuéntanos más sobre tu interés en esta propiedad..."
        />
      </div>

      {/* Error Message */}
      {state.status === 'error' && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-8">
          <p className="text-red-500 text-sm">{state.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={state.status === 'loading'}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition transform ${
          state.status === 'loading'
            ? 'bg-[#707070] text-[#B0B0B0] cursor-not-allowed'
            : 'bg-[#C9A962] text-[#0D0D0D] hover:bg-[#B8943D] hover:scale-105'
        }`}
      >
        {state.status === 'loading' ? 'Enviando...' : 'Enviar solicitud'}
      </button>

      {/* Privacy Note */}
      <p className="text-[#707070] text-xs mt-6 text-center">
        Tus datos están protegidos y encriptados. No compartimos tu información con terceros.
      </p>
    </form>
  );
}
