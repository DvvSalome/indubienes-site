import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Tratamiento de Datos | Indubienes',
  description: 'Política de privacidad, cookies y tratamiento de datos personales de INMOBILIARIA INDUBIENES SAS.',
};

export default function PoliticaPrivacidad() {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-muted hover:text-gold transition-colors font-body mb-8 inline-flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver al inicio
        </Link>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3 mt-6">Política de Privacidad y Tratamiento de Datos</h1>
        <p className="text-sm text-muted font-body mb-10">Última actualización: abril de 2026</p>

        <div className="prose-section space-y-8 text-[15px] text-muted font-body leading-relaxed">

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">1. Responsable del tratamiento</h2>
            <p>
              <strong className="text-foreground">INMOBILIARIA INDUBIENES SAS</strong><br />
              NIT: 900.965.649<br />
              Dirección: Cra 77 #36-31, Laureles, Medellín, Colombia<br />
              Teléfono: +57 604 322 0207<br />
              WhatsApp: +57 317 759 7155<br />
              Correo electrónico: <a href="mailto:gerencia@indubienes.com" className="text-gold hover:underline">gerencia@indubienes.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">2. Datos personales que recopilamos</h2>
            <p>En el ejercicio de nuestra actividad inmobiliaria, podemos recopilar los siguientes datos personales:</p>
            <p className="mt-2">
              Nombre completo, número de identificación (cédula, NIT), dirección de residencia o correspondencia, número de teléfono y celular, correo electrónico, información financiera necesaria para la gestión inmobiliaria, e información de navegación en nuestro sitio web (cookies, dirección IP, tipo de navegador).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">3. Finalidad del tratamiento</h2>
            <p>Los datos personales serán utilizados para: gestionar servicios de venta, arriendo y administración de propiedades; dar respuesta a solicitudes, consultas y requerimientos; enviar información comercial sobre propiedades y servicios inmobiliarios; cumplir con obligaciones legales, contractuales y regulatorias; realizar análisis estadísticos y de mercado; mejorar la experiencia del usuario en nuestro sitio web; y gestionar la relación contractual con clientes, propietarios y arrendatarios.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">4. Derechos del titular</h2>
            <p>De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, como titular de datos personales usted tiene derecho a: conocer, actualizar y rectificar sus datos; solicitar prueba de la autorización otorgada; ser informado sobre el uso de sus datos; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización y/o solicitar la supresión de sus datos; y acceder en forma gratuita a sus datos personales.</p>
            <p className="mt-2">Para ejercer estos derechos puede comunicarse a <a href="mailto:gerencia@indubienes.com" className="text-gold hover:underline">gerencia@indubienes.com</a> o al teléfono +57 604 322 0207.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">5. Política de cookies</h2>
            <p>Nuestro sitio web utiliza cookies para mejorar la experiencia de navegación. Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio.</p>
            <p className="mt-2"><strong className="text-foreground">Cookies esenciales:</strong> necesarias para el funcionamiento del sitio web, como la navegación entre páginas y el acceso a áreas seguras.</p>
            <p className="mt-2"><strong className="text-foreground">Cookies analíticas:</strong> nos permiten entender cómo los visitantes interactúan con el sitio web, recopilando información de forma anónima.</p>
            <p className="mt-2">Usted puede configurar su navegador para rechazar cookies o para que le avise cuando se envían. Sin embargo, algunas funciones del sitio pueden no funcionar correctamente sin cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">6. Seguridad de la información</h2>
            <p>INMOBILIARIA INDUBIENES SAS adopta medidas técnicas, humanas y administrativas razonables para proteger los datos personales contra acceso no autorizado, pérdida, alteración o destrucción. El acceso a los datos personales está restringido a empleados y colaboradores autorizados que necesitan conocer dicha información para cumplir con sus funciones.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">7. Transferencia y transmisión de datos</h2>
            <p>Los datos personales podrán ser compartidos con aliados comerciales, plataformas inmobiliarias (WASI, Finca Raíz, Metro Cuadrado, entre otras) y entidades gubernamentales cuando sea requerido por ley, siempre garantizando niveles adecuados de protección de datos.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">8. Vigencia</h2>
            <p>Los datos personales serán almacenados durante el tiempo necesario para cumplir con las finalidades descritas en esta política y conforme a los términos legales aplicables. Una vez cumplida la finalidad, los datos serán eliminados de nuestras bases de datos.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">9. Modificaciones a esta política</h2>
            <p>INMOBILIARIA INDUBIENES SAS se reserva el derecho de modificar esta política en cualquier momento. Las modificaciones serán publicadas en este sitio web y entrarán en vigencia a partir de su publicación.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">10. Legislación aplicable</h2>
            <p>Esta política se rige por la legislación colombiana, en particular la Ley 1581 de 2012 (Ley de Protección de Datos Personales), el Decreto 1377 de 2013 y demás normas concordantes.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/autorizacion-datos" className="text-sm text-gold hover:underline font-body font-medium">
            Ver Autorización para el Tratamiento de Datos Personales →
          </Link>
        </div>
      </div>
    </div>
  );
}
