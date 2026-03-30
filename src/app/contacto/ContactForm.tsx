'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hola, soy ${formData.nombre}.\n\nAsunto: ${formData.asunto}\n\n${formData.mensaje}\n\nEmail: ${formData.email}\nTeléfono: ${formData.telefono}`
    );
    window.open(`https://wa.me/573177597155?text=${msg}`, '_blank');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-display text-xl text-foreground mb-2">¡Mensaje enviado!</h3>
        <p className="text-muted font-body mb-6">Se ha abierto WhatsApp para completar el envío de su mensaje.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
          }}
          className="px-6 py-2.5 border border-border text-muted hover:text-foreground font-body text-sm rounded-lg transition-colors"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const inputClass = "w-full bg-surface text-foreground border border-border rounded-lg px-4 py-3 text-sm font-body placeholder:text-faint transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-body text-muted mb-2">Nombre completo *</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            placeholder="Su nombre"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-body text-muted mb-2">Correo electrónico *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="su@email.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-body text-muted mb-2">Teléfono</label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="+57 300 000 0000"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-body text-muted mb-2">Asunto *</label>
          <select
            value={formData.asunto}
            onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
            required
            className={inputClass + ' cursor-pointer appearance-none'}
          >
            <option value="">Seleccione un asunto</option>
            <option value="Comprar propiedad">Comprar propiedad</option>
            <option value="Arrendar propiedad">Arrendar propiedad</option>
            <option value="Vender mi propiedad">Vender mi propiedad</option>
            <option value="Arrendar mi propiedad">Arrendar mi propiedad</option>
            <option value="Administración de inmueble">Administración de inmueble</option>
            <option value="Avalúo">Avalúo</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-body text-muted mb-2">Mensaje *</label>
        <textarea
          value={formData.mensaje}
          onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
          required
          rows={5}
          placeholder="Escriba su mensaje aquí..."
          className={inputClass + ' resize-none'}
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto px-10 py-3.5 bg-gold hover:bg-gold-hover text-[#0D0D0D] font-body font-semibold text-sm tracking-wide rounded-lg transition-all duration-300 hover:shadow-lg"
      >
        Enviar mensaje
      </button>
    </form>
  );
}
