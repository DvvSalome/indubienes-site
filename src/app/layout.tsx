import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CookieBanner from "@/components/CookieBanner";
import ForceDarkMode from "@/components/ForceDarkMode";

const SITE_URL = "https://indubienes-site.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Inmobiliaria en Medellín | Venta y Arriendo - Indubienes",
    template: "%s | Indubienes",
  },
  description:
    "Venta, arriendo y administración de apartamentos, casas, fincas y locales en Medellín y el Área Metropolitana.",
  keywords: [
    "inmobiliaria medellín",
    "venta apartamentos medellín",
    "arriendo medellín",
    "propiedades medellín",
    "indubienes",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Inmobiliaria en Medellín | Venta y Arriendo - Indubienes",
    description:
      "Venta, arriendo y administración de apartamentos, casas, fincas y locales en Medellín y el Área Metropolitana.",
    url: SITE_URL,
    siteName: "Indubienes",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "/logo-hd.png",
        width: 1200,
        height: 630,
        alt: "Indubienes - Inmobiliaria en Medellín",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inmobiliaria en Medellín | Venta y Arriendo - Indubienes",
    description:
      "Venta, arriendo y administración de apartamentos, casas, fincas y locales en Medellín y el Área Metropolitana.",
    images: ["/logo-hd.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": `${SITE_URL}/#organization`,
      name: "Indubienes",
      alternateName: "Inmobiliaria Indubienes",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-hd.png`,
      image: `${SITE_URL}/logo-hd.png`,
      description:
        "Inmobiliaria en Medellín especializada en venta, arriendo y administración de propiedades residenciales y comerciales.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Medellín",
        addressRegion: "Antioquia",
        addressCountry: "CO",
      },
      areaServed: [
        { "@type": "City", name: "Medellín" },
        { "@type": "City", name: "Envigado" },
        { "@type": "City", name: "Sabaneta" },
        { "@type": "City", name: "Itagüí" },
        { "@type": "City", name: "Bello" },
        { "@type": "AdministrativeArea", name: "Área Metropolitana del Valle de Aburrá" },
      ],
      priceRange: "$$",
      knowsLanguage: ["es"],
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Indubienes",
      description: "Venta, arriendo y administración de propiedades en Medellín",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "es-CO",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/propiedades?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
        <ForceDarkMode />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <CookieBanner />
      </body>
    </html>
  );
}
