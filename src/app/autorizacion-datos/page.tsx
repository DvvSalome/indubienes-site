import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Autorización para el Tratamiento de Datos Personales | Indubienes',
  description: 'Formato de autorización para el tratamiento de datos personales de INMOBILIARIA INDUBIENES SAS.',
};

export default function AutorizacionDatos() {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-muted hover:text-gold transition-colors font-body mb-8 inline-flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver al inicio
        </Link>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3 mt-6">Autorización para el Tratamiento de Datos Personales</h1>
        <p className="text-sm text-muted font-body mb-10">INMOBILIARIA INDUBIENES SAS · NIT 900.965.649</p>

        <div className="prose-section space-y-8 text-[15px] text-muted font-body leading-relaxed">

          <section>
            <p>
              En cumplimiento de lo dispuesto en la Ley 1581 de 2012, el Decreto 1377 de 2013, y demás normas concordantes, <strong className="text-foreground">INMOBILIARIA INDUBIENES SAS</strong>, identificada con NIT 900.965.649, con domicilio en la ciudad de Medellín, Cra 77 #36-31, Laureles, como responsable del tratamiento de datos personales, informa al titular que:
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">Alcance de la autorización</h2>
            <p>Al suministrar sus datos personales a través de nuestro sitio web, formularios de contacto, correo electrónico, WhatsApp, llamada telefónica, o de manera presencial, usted autoriza de manera libre, previa, expresa e informada a INMOBILIARIA INDUBIENES SAS para:</p>
            <div className="mt-3 space-y-2 pl-4">
              <p>1. Recolectar, almacenar, usar, circular, suprimir y en general, tratar sus datos personales conforme a las finalidades descritas en nuestra Política de Privacidad.</p>
              <p>2. Contactarlo por cualquier medio (teléfono, correo electrónico, WhatsApp, mensajes de texto) para ofrecer información sobre propiedades, servicios inmobiliarios y novedades comerciales.</p>
              <p>3. Compartir sus datos con aliados comerciales y plataformas inmobiliarias vinculadas al proceso de venta, arriendo o administración de propiedades.</p>
              <p>4. Realizar consultas en centrales de riesgo cuando sea necesario para la gestión inmobiliaria.</p>
              <p>5. Conservar sus datos durante el tiempo necesario para las finalidades del tratamiento y los plazos legales aplicables.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">Derechos del titular</h2>
            <p>Como titular de los datos personales, usted tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos; revocar la autorización otorgada; presentar quejas ante la Superintendencia de Industria y Comercio (SIC); y ser informado sobre el uso que se le da a sus datos personales.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">Canal de atención</h2>
            <p>Para ejercer sus derechos o para cualquier consulta o reclamo relacionado con el tratamiento de sus datos personales, puede comunicarse a:</p>
            <p className="mt-2">
              <strong className="text-foreground">Correo electrónico:</strong> <a href="mailto:gerencia@indubienes.com" className="text-gold hover:underline">gerencia@indubienes.com</a><br />
              <strong className="text-foreground">Teléfono:</strong> +57 604 322 0207<br />
              <strong className="text-foreground">WhatsApp:</strong> +57 317 759 7155<br />
              <strong className="text-foreground">Dirección:</strong> Cra 77 #36-31, Laureles, Medellín, Colombia
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">Consentimiento</h2>
            <p>Al enviar sus datos a través de cualquiera de nuestros canales de comunicación, usted declara que ha leído y aceptado la presente autorización y la <Link href="/politica-privacidad" className="text-gold hover:underline">Política de Privacidad y Tratamiento de Datos</Link> de INMOBILIARIA INDUBIENES SAS.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/politica-privacidad" className="text-sm text-gold hover:underline font-body font-medium">
            ← Ver Política de Privacidad y Tratamiento de Datos
          </Link>
        </div>
      </div>
    </div>
  );
}
