# Contexto de **drakes-affiliate** para el repo **drakes-ops**

Copia este archivo a tu otro repositorio, por ejemplo: **`drakes-ops/docs/drakes-affiliate-context.md`**. Así el backoffice tendrá en local la referencia aunque no tengas el repo del afiliado abierto.

---

## 1. Relación entre repos

| | **drakes-affiliate** (este) | **drakes-ops** (backoffice) |
|---|-----------------------------|-----------------------------|
| **Quién lo usa** | Creadores: Ledger, Billboard, tracking | Staff / plataforma: imports CSV, revisión, lotes |
| **Código** | [Repo afiliado en Git] | [Repo ops en Git] |
| **Vercel** | Dominio público de afiliación | Subdominio `ops.*` (no indexar) |
| **Base de datos** | **El mismo proyecto Supabase** | Idem (no otra instancia) |

- **Fuente de verdad del esquema SQL:** `drakes-affiliate/supabase/migrations/`. Nuevas tablas o cambios: PR ahí, luego SQL Editor en Supabase. **En ops no se mantienen migraciones que diverjan.**

---

## 2. Arquitectura relevante para integrar (afiliado)

- **Clicks (tracking):** el usuario abre un enlace con `GET /api/r?bc=<billboard_campaign_id>`. Eso escribe en `clicks` y redirige. Implementación: `drakes-affiliate/src/app/api/r/route.ts`.
- **Postback (operador → Casa):** `POST /api/postback` con cuerpo JSON y `Authorization: Bearer <POSTBACK_SECRET>`. Idempotencia: clave lógica **`(operator_id, external_id)`** en `conversions`. Implementación: `drakes-affiliate/src/app/api/postback/route.ts`.
- **Cualquier import CSV o job en ops** debería escribir en `conversions` (y relaciones) con **la misma semántica** que el postback: mismas columnas, mismos `external_id` estables, sin duplicar filas (unique en BD).

- **Payouts (v1 en afiliado):** tabla `payout_requests` (migración `0003_payout_requests.sql`). La UI vive en el Ledger; la **operación fuerte** (validar, marcar paid) puede ser en ops más adelante.

---

## 3. Tablas principales (Postgres / Supabase)

Definidas en `0001_init.sql` (y `0002`, `0003`):

- `profiles` — usuario, rol (`creator` | `operator` | `admin`)
- `creators`, `operators` — anclados a `auth.users`
- `bounties`, `billboard_campaigns` — ofertas y huecos en el Billboard
- `clicks` — eventos de tracking
- `conversions` — postbacks (comisiones, eventos)
- `payout_requests` — solicitudes de cobro (si aplicaste `0003`)

`conversions` (resumen): `operator_id`, `bounty_id`, `creator_id`, `event_type`, `amount_cents`, `commission_cents`, `currency`, `external_id`, `occurred_at`, `click_id` opcional. **Unique:** `(operator_id, external_id)`.

---

## 4. Variables de entorno (misma idea en ambas apps)

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Misma en ambas |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Misma en ambas (UI si hace queries con usuario logueado) |
| `NEXT_PUBLIC_APP_URL` | **La URL canónica de *esta* app** (ops: URL de Vercel del backoffice) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo en servidor** (ops: imports batch, tareas de staff). Nunca al cliente. |
| `POSTBACK_SECRET` | Sobre todo en el **proyecto afiliado** (endpoint postback). Ops puede no necesitarla salvo reenvíes/bridges. |

En ops: restringir login (solo staff) con políticas o allowlist; no reutilices la misma “superficie pública” que el afiliado.

---

## 5. Enlaces a código (en el clon de drakes-affiliate)

- Proxy / i18n: `src/proxy.ts` (el afiliado no aplica a ops tal cual, pero entiendes el stack)
- Postback: `src/app/api/postback/route.ts`
- Redirect + click: `src/app/api/r/route.ts`
- Cliente service: `src/lib/supabase/service.ts`

---

## 6. Qué debe hacer drakes-ops (orientación)

- UI basada en tus **HTML de referencia** (carpeta tipo `reference/html-ops/`), portada a **Next.js (componentes)**, no servir el HTML en bruto en producción.
- Funcionalidad que toca BD: **Server Actions o Route Handlers** con `createClient` server + ojo con **RLS**; para imports masivos suele usarse **service role solo en el servidor** y validar filas.
- `robots.txt` / `noindex` en ops.
- Respetar el documento de ecosistema: `docs/ecosistema-repos.md` (en el repo afiliado) — puedes duplicar el resumen al README de ops.

---

## 7. Cómo “dar contexto” a Cursor en drakes-ops (resumen)

1. Copia **`docs/copiar-a-drakes-ops/regla-cursor.mdc`** (de este repo) a **`drakes-ops/.cursor/rules/drakes-ops.mdc`**.
2. Copia este markdown a **`drakes-ops/docs/drakes-affiliate-context.md`**.
3. Primer chat en ops: pega el “primer prompt” de `docs/ecosistema-repos.md` (sección *Primer prompt*) + `@reference` a tu carpeta de HTML.

Con eso, el agente en **ops** tiene reglas fijas y un doc de contexto; el repo **afiliado** sigue siendo la fuente de esquema y de contratos de API.
