# Ecosistema de repos (Drake’s Bounty)

Guía para mantener **afiliado** y **backoffice** separados pero alineados.

**Arranque del repo ops (contexto + Cursor en un solo paso):** lee [`copiar-a-drakes-ops/README.md`](copiar-a-drakes-ops/README.md) y el contexto global para pegar en ops: [`contexto-para-drakes-ops.md`](contexto-para-drakes-ops.md).

## Repos previstos

| Repo | Rol | Deploy típico |
|------|-----|----------------|
| **`drakes-affiliate`** (este) | Producto creador: Ledger, Billboard público, tracking, postback al consumo del afiliado | Vercel → dominio público de afiliación |
| **`drakes-ops`** (nombre sugerido) | Consola interna: import CSV, revisión, lotes, staff/operador de plataforma | Vercel → subdominio `ops.*` (no indexar en buscadores) |

Mismo **proyecto Supabase** en ambos (una sola base de verdad). Distintos **proyectos Vercel** y, si puedes, **distintas variables** (mismo `NEXT_PUBLIC_SUPABASE_URL`, distintas políticas de uso de `service_role`).

## Qué vive en cada sitio

### Este repo (`drakes-affiliate`)

- Código de la app de creadores.
- `supabase/migrations/` — **fuente de verdad del esquema** (cambios de tablas aquí primero, luego aplicar en Supabase).
- `html-dashboard-afiliado/` — referencia de diseño legacy (HTML estático).

### Repo `drakes-ops`

- Next.js (misma major de React/Next que el afiliado si queréis reutilizar mentalidad).
- `reference/html-ops/` o `design-reference/` — tus HTML de ops **solo como referencia de maquetación** (opcional).
- Sin duplicar migraciones: **no** segundo `migrations/` que diverja; o bien copias solo para CI de prueba, o apuntan al mismo remoto. Lo sano: **migraciones solo en `drakes-affiliate`** (o en un tercer repo `drakes-db` en el futuro).

## Variables de entorno (idea)

**Ambas apps**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (cada una su URL canónica)

**Solo servidor / ops (nunca al cliente)**

- `SUPABASE_SERVICE_ROLE_KEY` — solo en **Route Handlers**, Server Actions o scripts; **solo** en el proyecto Vercel de ops (o con mucho cuidado en el afiliado solo donde ya lo uséis, p. ej. postback con service client).

**Auth**

- Mismo Supabase Auth; en ops podéis restringir acceso por **rol en `profiles`**, **allowlist de email** o tabla `platform_staff` + RLS. Definidlo en una migración y documentad la regla aquí cuando exista.

## Flujo de trabajo recomendado

1. **Cambio de base de datos** → PR en `drakes-affiliate` → SQL en `supabase/migrations/` → aplicar en Supabase (staging → prod).
2. **Cambio de UI ops** → PR en `drakes-ops` → despliegue a preview de Vercel.
3. **CSV / batch** → implementación en `drakes-ops` insertando/actualizando las mismas tablas que ya usa el postback (mismos `external_id` + `operator_id` para idempotencia).

## Checklist al crear `drakes-ops`

- [ ] Next.js + TypeScript, mismo `Node`/`npm` alineado con este repo.
- [ ] Vercel: proyecto nuevo, dominio `ops.tudominio.com`, variables sensibles.
- [ ] Supabase: Redirect URLs con la URL de ops para OAuth si usáis login con magic link / Google para staff.
- [ ] RLS: políticas que permitan a `platform_*` o `service_role` lo que haga falta **sin** abrir datos de más al rol `anon` del front.
- [ ] `robots.txt` o meta **noindex** en ops.
- [ ] En el README de ops: enlace a este doc o copia resumida de “misma BD, migraciones en afiliado”.

## Nombre del repo

`drakes-ops`, `drakes-bounty-ops` o `drakes-house` — lo importante es **fijo y buscable**; el nombre bonito lo unificáis con el branding después.

## Primer prompt (repo casi vacío, solo HTMLs de diseño)

Úsalo **la primera vez** que abras el backoffice en Cursor. Ajusta nombres y rutas.

```
Repo: [nombre, ej. drakes-ops] — app interna, desplegada en [URL Vercel de ops].

Estado: proyecto vacío de lógica; tengo HTML estático de referencia en [ej. reference/html-ops/ o ./html/ — indica la carpeta real].

Ecosistema (no tocar de otro modo):
- Hermano: repo drakes-affiliate (Ledger, migraciones en supabase/migrations/, /api/postback, /api/r).
- Misma instancia Supabase; las migraciones NUEVAS solo se añaden en drakes-affiliate, no aquí.
- Misma clave: conversiones vía (operator_id + external_id) idempotente; el CSV/ops debe respetar el mismo modelo al escribir en BD.
- service_role de Supabase solo en rutas/servidor de este proyecto, nunca en el bundle del cliente.
- Necesito noindex/robots para ops (no listar en Google).

Quiero:
1) Inicializar Next.js [versión, ej. 16] con TypeScript, App Router, y estilos alineados con el tono de los HTML (o Tailwind si encaja con portar componentes poco a poco).
2) Estructura clara: los HTML quedan como referencia, no como runtime; el layout principal (shell: sidebar / header) portado a React a partir de [nombre del .html principal si lo hay].
3) Primera ruta [ej. / o /login] y README con: variables .env, enlace a la convención de repos del afiliado, y qué hace el siguiente paso (auth staff o subida CSV — lo que elijas tú ahora: [A / B]).
4) .env.example con los mismos nombres que el afiliado para Supabase, más NEXT_PUBLIC_APP_URL apuntando a la URL de este Vercel.

Sé explícito en los archivos que crees; no añadas dependencias pesadas salvo justificación.
```

Sustituye lo entre corchetes, indica dónde están los HTML, y añade **una** prioridad (landing + login, o solo shell). En el primer mensaje puedes añadir: *@reference* o arrastrar la carpeta a Cursor si tu cliente lo permite, para indexar esos archivos.

## Plantilla de prompt (Cursor / IA)

Cópiala **al inicio** de un chat (o fijala en **Cursor Rules** / nota del proyecto) según dónde estés trabajando. Sustituye los corchetes.

### Mientras abres `drakes-affiliate`

```
Contexto ecosistema:
- Repo actual: drakes-affiliate (app creadores: Ledger, Billboard, /api/r, /api/postback).
- Hermano: [nombre real del repo ops] en otro repo + otro Vercel; [URL preview/prod de ops si aplica].
- Misma instancia Supabase: URL [o “la de .env”].
- Esquema: solo tocar vía supabase/migrations/ en ESTE repo; luego SQL Editor en Supabase.
- No romper: postback idempotente (operator_id + external_id), clicks por billboard campaign.

Tarea: [lo que quieres hacer hoy]
```

### Mientras abres el repo de ops (backoffice)

```
Contexto ecosistema:
- Repo actual: [nombre, ej. drakes-ops] — backoffice interno, su propio Vercel.
- Hermano: drakes-affiliate — ahí viven migraciones y /api/postback; NO duplicar esquema divergente.
- Misma instancia Supabase: mismas tablas (conversions, operators, etc.).
- service_role: solo en servidor (API routes / server); nunca al cliente.
- Import CSV / lotes: mismas reglas de idempotencia y columnas que el flujo S2S del afiliado.

Tarea: [lo que quieres hacer hoy]
```

### Si la tarea cruza los dos repos

Abre con:

```
Cambio cruzado (2 repos):
- [drakes-afiliate] …
- [drakes-ops] …
- BD compartida; migración nueva solo en drakes-afiliate: [sí / no y nombre si aplica]
```

Suficiente con esto + pegar un error o ruta concreta. El detalle alarga `docs/ecosistema-repos.md` en el repo del afiliado; en ops puedes copiar este fichero a `docs/` o poner en el README un enlace al repo del afiliado.

---

*Última actualización: añadido al repo afiliado como ancla; al crear `drakes-ops`, podéis duplicar este archivo allí o enlazar desde su README.*
