'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import './login.css';

interface LoginFormData {
  company_id: string;
  wasi_token: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    company_id: '',
    wasi_token: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof LoginFormData
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Redirect after brief success animation
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        setError(data.error || 'Error al iniciar sesión. Intenta de nuevo.');
        setIsLoading(false);
      }
    } catch {
      setError('Error de conexión. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Background with subtle animation */}
      <div className="admin-login-background" />

      {/* Main login card */}
      <div className={`admin-login-card ${success ? 'success' : ''}`}>
        {/* Logo */}
        <div className="admin-login-logo-wrapper">
          <Logo height={48} />
        </div>

        {/* Title with gold gradient and underline */}
        <div className="admin-login-title-section">
          <h1 className="admin-login-title gold-text">Panel Administrativo</h1>
          <div className="admin-login-accent-line" />
        </div>

        {/* Subtitle */}
        <p className="admin-login-subtitle">
          Ingresa tus credenciales WASI para continuar
        </p>

        {/* Success message */}
        {success && (
          <div className="admin-login-success-message">
            <div className="admin-login-success-icon">✓</div>
            <p>Autenticación exitosa</p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="admin-login-form">
            {/* Company ID Input */}
            <div className="admin-login-form-group">
              <label htmlFor="company_id" className="admin-login-label">
                ID de Compañía
              </label>
              <input
                id="company_id"
                type="text"
                placeholder="Ej: COMP-12345"
                value={formData.company_id}
                onChange={(e) => handleInputChange(e, 'company_id')}
                disabled={isLoading}
                className="admin-login-input"
                required
              />
            </div>

            {/* WASI Token Input */}
            <div className="admin-login-form-group">
              <label htmlFor="wasi_token" className="admin-login-label">
                Token WASI
              </label>
              <input
                id="wasi_token"
                type="password"
                placeholder="Ingresa tu token WASI"
                value={formData.wasi_token}
                onChange={(e) => handleInputChange(e, 'wasi_token')}
                disabled={isLoading}
                className="admin-login-input"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="admin-login-error-message">
                <span className="admin-login-error-icon">!</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.company_id || !formData.wasi_token}
              className={`admin-login-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="admin-login-spinner" />
                  Verificando...
                </>
              ) : (
                'Acceder al Panel'
              )}
            </button>
          </form>
        )}

        {/* Footer text */}
        <p className="admin-login-footer">
          Para soporte, contacta con el equipo de WASI
        </p>
      </div>

      {/* Decorative elements */}
      <div className="admin-login-decoration-left" />
      <div className="admin-login-decoration-right" />
    </div>
  );
}
