# CLAUDE.md — indubienes-site

Contexto específico del proyecto Indubienes. El workspace raíz tiene su propio `CLAUDE.md` con reglas globales.

## Qué es

Sitio inmobiliario de **INMOBILIARIA INDUBIENES SAS** (NIT 900965649), Carrera 77 #36-31, Laureles, Medellín. Objetivo: reemplazar/complementar el template por defecto de WASI con mejor UX y animaciones premium.

## Stack

- **Framework:** Next.js 14.2 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Animaciones:** GSAP (fork en `Adriangar333/GSAP` con plugins premium: ScrollTrigger, SplitText, ScrollSmoother, Flip) — **aún no integrado**, solo CSS animations por ahora
- **Backend de datos:** WASI API (`api.wasi.co/v1`), company ID `1288465`, Plan PRO
- **Deploy:** Vercel → `indubienes-site.vercel.app`
- **Dominio:** `indubienes.com` (DNS pendiente: `ns1.tubien.co` / `ns2.tubien.co` o A record a `54.88.200.57`)

## Variables de entorno críticas

- `WASI_TOKEN` — requerida para datos reales de propiedades. **Si falta, el sitio muestra mock data.** Verificar en Vercel dashboard si la prod está sirviendo datos fake.

## Contactos del negocio

- WhatsApp: `573177597155`
- Teléfono: `604 322 0207`
- Email: `gerencia@indubienes.com`

## Páginas existentes

Home, Properties listing (con filtros), Property detail (con galería), Contact, 404.

## Assets pesados

**NO están en el repo.** Viven en `../../shared/assets/indubienes/`:
- `video/` — 4 videos "FAMILIA" (MOVIL + ESCRITORIO ×2), ~45MB total
- `brand/` — logos (limpio PNG, original GIF) y una imagen Gemini

Al referenciarlos desde código/docs, usar rutas relativas al workspace, no copiarlos adentro del repo.

## Trabajo pendiente

- [ ] Integrar GSAP (prioridad: polish visual)
- [ ] Verificar `WASI_TOKEN` en Vercel (prod sirve mock data según última revisión)
- [ ] Configurar DNS del dominio `indubienes.com`
- [ ] Revisar code review en `../../shared/docs/reviews/indubienes-code-review.md`
- [ ] Evaluar patches sueltos en `../../shared/scratch/map-satellite.patch` y `PropertyDetailClient.tsx`

## Comandos útiles

```bash
# Dev local
npm run dev

# Build producción
npm run build

# Snapshot del proyecto (desde la raíz del workspace)
./shared/scripts/snapshot.sh indubienes-site
```

## Cómo hacer cambios

1. **Cambios visuales / UX:** priorizar polish y animaciones. GSAP cuando se integre.
2. **Cambios de datos:** tocar WASI API integration, verificar que el token esté en env.
3. **Antes de commit:** correr `npm run build` localmente para cazar errores de tipos.
4. **Antes de push a main:** crear snapshot con `./shared/scripts/snapshot.sh indubienes-site`.
