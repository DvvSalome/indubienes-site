import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ForceDarkMode from "@/components/ForceDarkMode";

export const metadata: Metadata = {
  title: "Indubienes - Inmobiliaria en Medellín | Venta y Arriendo de Propiedades",
  description:
    "Inmobiliaria en Medellín especializada en venta, arriendo y administración de propiedades. Apartamentos, casas, fincas, lotes y locales comerciales en Laureles, El Poblado, Belén, Envigado, Sabaneta.",
  keywords: "inmobiliaria medellín, venta apartamentos medellín, arriendo medellín, propiedades medellín, indubienes",
  openGraph: {
    title: "Indubienes - Inmobiliaria en Medellín",
    description: "Venta, arriendo y administración de propiedades en Medellín y el Área Metropolitana",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Montserrat only — loaded via Google Fonts */}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
        <ForceDarkMode />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
