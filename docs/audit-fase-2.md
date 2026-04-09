# Auditoría Fase 2 — Admin Propiedades

**Fecha:** 2026-04-08
**Alcance:** Verificación empírica de Fase 2 (Comodidades, fotos inline, campos faltantes, modo de negocio exclusivo) contra la API real de WASI.
**Metodología:** Lectura del código + llamadas directas a `api.wasi.co/v1` con credenciales de producción.

---

## Resumen ejecutivo

La implementación del **frontend de Fase 2 es correcta estructuralmente** (estado, UI, validación, payload construido bien). Pero la auditoría descubrió **dos bugs críticos en la capa WASI** que rompen funcionalidad mucho más allá del alcance de Fase 2:

| # | Severidad | Hallazgo | Estado |
|---|-----------|----------|--------|
| 1 | 🔴 BLOQUEANTE | `/property/update/{id}` es un no-op silencioso: siempre responde `{"status":"success"}` pero no modifica ningún campo | Pre-existente, afecta edit + deactivate |
| 2 | 🔴 BLOQUEANTE | Las features (comodidades) no se guardan al crear — formato correcto desconocido | Introducido por Fase 2 |
| 3 | 🟡 MEDIO | WASI acepta `building_date` pero no `year_built` en escritura | ✅ Arreglado localmente |
| 4 | 🟡 MEDIO | No existe endpoint de delete (`property/delete`, `/remove`, `/deactivate` → 404) | Pre-existente |
| 5 | 🟢 BAJO | Propiedad huérfana de prueba 9912135 (“TEST AUDIT DELETE ME”) en WASI | Limpieza manual requerida |

---

## Hallazgo 1 — `/property/update/{id}` es un no-op silencioso 🔴

**Impacto:** TODA la funcionalidad de edición está rota. Cuando el usuario edita una propiedad, el admin muestra “guardado” pero WASI no cambió nada. El botón “Desactivar” (que usa update con `id_status`) tampoco funciona. Es un bug pre-existente que Fase 1/2 no introdujeron, pero que la auditoría reveló.

**Pruebas realizadas:** sobre propiedad 9912135 (test), intenté con todos estos formatos — todos devolvieron `{"status":"success"}` y ninguno modificó el título, bedrooms, ni features:

1. JSON `Content-Type: application/json` con `PUT` a `/property/update/{id}`
2. `application/x-www-form-urlencoded` con `POST`
3. Form-urlencoded con `_method=PUT` (override)
4. JSON con `id_user` incluido en body
5. Query params en la URL
6. Nested objects `{property: {title: ...}}`
7. Bracket syntax `internal_features[]=1&internal_features[]=5`

Ningún formato tocó el recurso. La respuesta siempre fue:
```json
{"status":"success"}
```
pero `GET /property/get/9912135` siguió devolviendo los valores originales.

**Recomendación:**
- Escalar a soporte de WASI abriendo ticket con los cURL repro.
- Mientras tanto: deshabilitar visualmente el botón “Guardar” en modo edición y mostrar banner “La edición en vivo está bloqueada por un bug de la API de WASI — contacta a Adrián.” Evita que usuarios crean que guardaron cambios que no se aplicaron.

---

## Hallazgo 2 — Features no se guardan al crear 🔴

**Impacto:** La tab “Comodidades” añadida por Fase 2 deja al usuario marcar features, el payload las envía, WASI responde `success`, pero al leer la propiedad de vuelta las listas vienen vacías.

**Pruebas realizadas:** creé propiedades con `/property/add` usando estos formatos para el campo `internal_features` / `external_features`:

| Formato | Resultado creación | Features al releer |
|---|---|---|
| JSON array `[1,5,6]` en body JSON | ✅ 200 success | `[]` vacío |
| Bracket form `internal_features[]=1&internal_features[]=5` | ✅ 200 success | `[]` vacío |
| CSV string `"1,5,6"` | ✅ 200 success (no probado due a otro error) | pendiente |
| Multipart form-data | ❌ 502 al principio | pendiente |

El código actual de Fase 2 (`page.tsx` líneas ~460-480) envía JSON arrays, que WASI acepta pero descarta silenciosamente.

**Recomendación:**
1. Abrir ticket con soporte WASI pidiendo el formato exacto de `internal_features` / `external_features` en `POST /property/add`.
2. Mientras tanto, añadir un aviso visible en la tab Comodidades: *“⚠ Las comodidades se muestran aquí pero no se están guardando en WASI hasta que se confirme el formato correcto con soporte.”*
3. No bloquear el release de Fase 2 por esto — el resto de campos (año, área privada, cuota admin, fotos inline, modo exclusivo) sí funcionan.

---

## Hallazgo 3 — `year_built` → `building_date` ✅ Arreglado

WASI devuelve `building_date` al leer pero silenciosamente ignora `year_built` al escribir. Tenía que aliasearse. Arreglo aplicado en `page.tsx`:

```typescript
// WASI read endpoint returns `building_date` but write endpoints only accept
// that same key — `year_built` is silently ignored. Rename before sending.
if (payload.year_built) {
  payload.building_date = payload.year_built;
}
delete payload.year_built;
```

Pendiente: push a GitHub + deploy.

---

## Hallazgo 4 — No hay endpoint de delete

Probados con 404: `property/delete/{id}`, `property/remove/{id}`, `property/deactivate/{id}`. El flujo “Eliminar” del admin solo puede hacerse cambiando `id_status` vía update — que también está roto (Hallazgo 1). Red flag doble.

**Recomendación:** ocultar el botón “Eliminar” del admin hasta que el update funcione.

---

## Hallazgo 5 — Propiedad huérfana

ID `9912135` (“TEST AUDIT DELETE ME”) quedó creada en producción durante las pruebas. No se puede borrar automáticamente. Adrián debe eliminarla manualmente desde el backoffice de WASI.

---

## Verificación estructural de Fase 2 (lo que SÍ funciona)

- ✅ UI: tab “Comodidades” renderiza 56 features internas + 82 externas desde `/api/locations?type=features`
- ✅ UI: cola de fotos inline con remoción individual, progreso de subida
- ✅ UI: campos `año construcción`, `área privada`, `cuota administración` presentes en tab Espacios
- ✅ UI: toggle exclusivo Venta / Arriendo / Ambos (segmented control de 3 opciones)
- ✅ Tipado: `Property`, `PropertyFeature`, `FeatureGroups` en `src/lib/types.ts`
- ✅ Data: `getFeatures()` en `src/lib/wasi.ts` extrae y normaliza `/feature/all`
- ✅ Build: mocks en `src/lib/mock-data.ts` incluyen `internal_feature_ids: []` / `external_feature_ids: []`
- ✅ Crear propiedad: TODOS los campos menos features se persisten correctamente en WASI (verificado empíricamente)
- ✅ Subida de fotos: la cola usa `/property/upload-image/{id}` multipart — funciona

---

## Siguiente acción recomendada

1. **Push** del fix `building_date` + este doc de auditoría.
2. **Decidir**: ¿sacamos Fase 2 a producción con el aviso de Comodidades + botón Edit/Delete deshabilitado? O **¿pausamos** hasta resolver el bug de `/property/update/{id}` con soporte WASI?
3. Si se decide sacar Fase 2: añadir los banners de aviso antes del deploy.
