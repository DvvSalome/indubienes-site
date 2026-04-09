# Testing Strategy — Indubienes Admin (Fase 2)

**Fecha:** 2026-04-08
**Autor:** Adrián + auditoría Claude
**Alcance:** Admin de propiedades, flujos create/edit/upload-photos/features, integración WASI.

## 1. Pirámide de testing

```
         ┌──────────┐
         │   E2E    │  3–5 escenarios críticos (Playwright contra preview de Vercel)
         ├──────────┤
         │Integration│  ~15 — /api/* routes contra WASI staging o mock server
         ├──────────┤
         │   Unit   │  ~40 — validación de forms, normalizers, aliases, state
         └──────────┘
```

La app es thin (Next.js + fetch a WASI), así que el mayor ROI está en **integration tests contra un mock de WASI controlado**, no en unit tests de componentes.

## 2. Qué probar, por capa

### 2.1 Unit (Vitest + Testing Library)

| Target | Tipo de test | Por qué importa |
|---|---|---|
| `normalizeProperty()` en `src/lib/wasi.ts` | input fixture → output esperado | WASI devuelve formatos inconsistentes (arrays vs objects, `building_date` vs `year_built`). Normalización silenciosamente rota = bugs en todo el admin. |
| `extractFeatureIds()` | arrays, objects, null, mixto | Auditoría mostró que WASI devuelve features en al menos 3 formatos distintos. |
| `getFeatures()` — mapList | lista con nombres duplicados, orden español | Ordenamiento alfabético con locale `es` — fácil romper con refactors. |
| Payload builder del form en `page.tsx` (extraer a helper) | `year_built` debe aliasear a `building_date` | Hallazgo #3 de la auditoría — regresión si alguien revierte. |
| Validación de precio (COP, min/max) | bordes: 0, 1, 10^12 | Campos de precio son los que más rompen en formularios. |
| Modo de negocio exclusivo (venta/arriendo/ambos) | cambiar entre los 3 estados | UI state fácil de romper con un refactor del segmented control. |

**Coverage target:** 80% en `src/lib/wasi.ts`, `src/lib/types.ts` (type-only → N/A), helpers de `page.tsx`.

### 2.2 Integration (Vitest + `msw` mockeando `api.wasi.co`)

Mandar requests reales de `/api/*` de Next.js y verificar:

| Test | Qué cubre |
|---|---|
| `GET /api/locations?type=features` → 56 internal + 82 external | Hallazgo de auditoría: el endpoint funciona, proteger contra regresiones |
| `POST /api/properties` con form completo | Payload correcto, campos requeridos WASI presentes |
| `POST /api/properties` con `year_built: 2018` → mock recibe `building_date` | Regresión del fix |
| `POST /api/properties` con 3 features internas → mock verifica formato enviado | Atrapa Hallazgo #2 cuando se resuelva |
| Upload de imagen multipart a `/api/properties/{id}/photos` | Boundary correcto, archivo binario intacto |
| Flow completo: crear propiedad → cola de fotos → subida secuencial | Prueba el orquestador de `handleSubmit` |

**Coverage target:** todos los endpoints en `src/app/api/` ejercitados al menos una vez.

### 2.3 Contract tests (NUEVO — alto valor dado los hallazgos)

**Correr contra WASI real 1×/día en CI** con una propiedad de pruebas dedicada (NO la 9912135, que está huérfana; crear una permanente dedicada).

| Contract test | Por qué |
|---|---|
| `POST /property/add` responde con `id_property` numérico | Smoke básico |
| Crear + `GET` → TODOS los campos enviados aparecen | **Atrapa hallazgo #2** automáticamente — si WASI empieza a guardar features, el test pasa a verde y nos enteramos. |
| `POST /property/update/{id}` realmente persiste un cambio | **Atrapa hallazgo #1** — si WASI arregla el update, nos enteramos sin revisar manual. |
| `/feature/all` devuelve ≥ 50 features internas + ≥ 70 externas | Detecta si WASI cambia el shape |

Estos tests son “documentación ejecutable” del contrato con WASI y son la única forma de saber cuándo soporte arregla los bugs.

### 2.4 E2E (Playwright contra preview deploy)

Solo los flujos que más duelen si rompen:

1. **Happy path crear**: login → crear propiedad → subir 2 fotos → ver en lista pública
2. **Editar** (cuando WASI update se arregle): abrir existente → cambiar título → recargar → título nuevo
3. **Filtros públicos**: buscar “casa en venta Bogotá” → ver resultados
4. **Ficha de propiedad pública**: abrir detalle → galería se renderiza → botón WhatsApp
5. **Modo exclusivo venta↔arriendo**: alternar toggles → validar que payload es coherente

**Coverage target:** 0% — no se mide. 5/5 escenarios deben pasar antes de cada deploy a prod.

## 3. Qué NO probar

- Componentes triviales (labels, wrappers sin lógica).
- Mock data — no tiene valor verificarlos, son fixtures.
- La UI de Tailwind (visual regression es overkill para este proyecto).
- WASI endpoints rotos (hallazgo #1, #2): probar que **llamamos bien**, no que **WASI responde bien**. Separación de responsabilidades.

## 4. Gaps actuales

| Gap | Severidad | Acción |
|---|---|---|
| Cero tests automatizados en el repo hoy | 🔴 alta | Montar Vitest + msw antes del siguiente feature |
| Sin CI que corra tests | 🔴 alta | Añadir workflow GitHub Actions → `npm test` on PR |
| Sin monitoreo de WASI contract | 🟡 media | Cron diario con contract tests + alerta a email |
| Sin seed de datos consistente para tests | 🟡 media | Script `scripts/seed-wasi-test.ts` que crea 1 propiedad “fixture” persistente |
| No hay forma de probar `/property/update/{id}` sin tocar prod | 🟡 media | Escalar a WASI: ¿hay entorno staging? |

## 5. Plan de implementación

1. **Semana 1**: instalar Vitest + msw + testing-library; escribir unit tests para `normalizeProperty`, `extractFeatureIds`, payload builder.
2. **Semana 2**: integration tests con msw mockeando WASI; cubrir los 6 casos de la tabla 2.2.
3. **Semana 3**: contract tests contra WASI real; cron en GitHub Actions; crear propiedad fixture permanente.
4. **Semana 4**: E2E Playwright con los 5 escenarios críticos; integrar en el workflow de deploy.

## 6. Casos de test de ejemplo

```typescript
// tests/unit/wasi-normalize.test.ts
describe('normalizeProperty', () => {
  it('aliases building_date → year_built on read', () => {
    const raw = { building_date: 2018, id_property: 1 };
    expect(normalizeProperty(raw).year_built).toBe(2018);
  });

  it('extracts feature ids from array of objects', () => {
    const raw = { features: { internal: [{ id: 5 }, { id_feature: 7 }] } };
    expect(normalizeProperty(raw).internal_feature_ids).toEqual([5, 7]);
  });

  it('handles WASI features as object map', () => {
    const raw = { features: { internal: { '0': { id: 5 }, '1': { id: 7 } } } };
    expect(normalizeProperty(raw).internal_feature_ids).toEqual([5, 7]);
  });
});

// tests/integration/create-property.test.ts
it('sends building_date not year_built to WASI', async () => {
  const spy = mockWasi.post('/property/add').reply(200, { status: 'success', id_property: 1 });
  await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ title: 'X', year_built: 2018, ... }),
  });
  expect(spy.lastCall.body).toContain('building_date=2018');
  expect(spy.lastCall.body).not.toContain('year_built');
});

// tests/contract/wasi-update.test.ts
it('WASI /property/update actually persists changes', async () => {
  const id = PERMANENT_TEST_ID;
  const newTitle = `audit-${Date.now()}`;
  await wasiUpdate(id, { title: newTitle });
  const fetched = await wasiGet(id);
  expect(fetched.title).toBe(newTitle); // 🔴 fallará hasta que WASI lo arregle
});
```

## 6bis. Addendum: regresión de imágenes (commit `d00f9136`)

La auditoría posterior al fix de imágenes reveló una clase de bug que merece cobertura dedicada. El síntoma era una "banda gris" en los property cards — causada por un workaround histórico en `fixImageObject()` que pre-pendía `"g"` al `filename` para obtener el raw. WASI arregló su endpoint y el workaround se invirtió: pasó a devolver imágenes 979×734 con `fit:contain` + fondo blanco baked-in.

### Tests específicos para imágenes WASI

**Unit (`tests/unit/image-normalize.test.ts`)**
```typescript
it('prefers WASI url_original when present', () => {
  const result = fixImageObject({
    url_original: 'https://images.wasi.co/inmuebles/7596.jpg',
    filename: '7596.jpg',
    url: 'https://image.wasi.co/BASE64==',
    url_big: 'https://image.wasi.co/BASE64==',
  });
  expect(result.url_original).toBe('https://images.wasi.co/inmuebles/7596.jpg');
});

it('never prepends "g" to filename', () => {
  const result = fixImageObject({ filename: '7596.jpg', url_original: '' });
  expect(result.url_original).not.toMatch(/\/g\d/);
  expect(result.url_original).toContain('/7596.jpg');
});

it('strips leading "g" if WASI returns it', () => {
  const result = fixImageObject({ filename: 'g7596.jpg', url_original: '' });
  expect(result.url_original).toContain('/7596.jpg');
});

it('returns placeholder for null image', () => {
  expect(fixImageObject(null).url_original).toBe('/placeholder-property.jpg');
});
```

**Contract (`tests/contract/wasi-images.test.ts`) — corre diario contra WASI real**
```typescript
it('WASI url_original returns real photo, not 979x734 letterbox', async () => {
  const res = await fetch(`https://api.wasi.co/v1/property/search?id_company=${CID}&wasi_token=${TOK}&take=1`);
  const data = await res.json();
  const prop = Object.values(data).find((x: any) => x?.id_property) as any;
  const url = prop.main_image.url_original;
  const dims = await getImageDimensions(url);

  // Red flag: if WASI reverts and starts returning 979x734 again, fail loudly.
  // These were the exact dimensions of the pre-letterboxed images.
  expect(dims).not.toEqual({ width: 979, height: 734 });
  expect(dims.width * dims.height).toBeGreaterThan(500_000); // sanity — at least ~700x700
});
```

**Visual regression (E2E) — snapshot de la primera card en `/propiedades`**
```typescript
test('property card image has no grey letterbox', async ({ page }) => {
  await page.goto('/propiedades');
  const card = page.locator('[data-testid="property-card"]').first();
  await expect(card).toHaveScreenshot('card.png', { maxDiffPixelRatio: 0.02 });
});
```

### Performance: imágenes raw son GRANDES 🟡

Auditoría mostró que `url_original` devuelve fotos de hasta `3468×4624` (≈440 KB). El card las renderiza en ~380×285 px. Bandwidth desperdiciado 10×.

**Recomendación corto plazo:** añadir un resize token propio (Next.js `<Image>` con `sizes`, o usar el endpoint de WASI `image.wasi.co/BASE64==` construido con `fit:"cover"` en vez de `contain`). El token actual (`url_big`) está hardcodeado a `fit:contain` con fondo blanco — hay que construir uno nuevo con:
```json
{"bucket":"staticw","key":"inmuebles/FILENAME","edits":{"resize":{"width":600,"height":450,"fit":"cover"}}}
```

Esto mata dos pájaros: bandwidth y evita el letterbox si WASI vuelve a cambiar `url_original`.

**Test de performance (Lighthouse CI):**
- LCP < 2.5s en `/propiedades`
- Total image bytes < 2 MB en la primera vista

## 7. Criterio de "listo"

- Unit + integration verdes en cada PR (bloquea merge)
- Contract tests corren de noche; alertan si rompen
- E2E verde antes de cada deploy a prod (manual run, 5 minutos)
- Coverage ≥ 70% en `src/lib/` y `src/app/api/`
