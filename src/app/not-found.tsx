import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <p className="text-gold text-6xl font-display mb-4">404</p>
        <h1 className="text-2xl font-display text-foreground mb-4">
          Página no encontrada
        </h1>
        <p className="text-muted font-body mb-8">
          La página que busca no existe o ha sido movida. Verifique la URL o regrese a la página principal.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold hover:bg-gold-hover text-white font-body font-semibold text-sm tracking-wide rounded-full transition-all duration-300"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
