# Drake's Bounty

SaaS de afiliación para gambling / trading / cripto con universo narrativo propio (el Gremio, el Código, el Ledger, el Pagadero, la Carta Náutica…).

## Estructura

```
drakes-affiliate/
├── html-dashboard-afiliado/   # HTMLs originales de referencia (diseño)
├── supabase/
│   └── migrations/            # Migraciones SQL (aplicar en Supabase Cloud)
├── messages/                  # Traducciones next-intl (en.json, es.json)
├── public/
├── src/
│   ├── app/[locale]/          # Rutas con prefijo de idioma
│   ├── components/
│   ├── i18n/                  # Configuración next-intl
│   ├── lib/supabase/          # Clientes Supabase (browser/server/proxy)
│   └── proxy.ts               # Middleware (i18n + session refresh)
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Stack

| Capa       | Tecnología                                                             |
| ---------- | ---------------------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router) + React 19 + TypeScript                        |
| Estilos    | Tailwind CSS 4 con paleta custom (Fraunces, Work Sans, JetBrains Mono) |
| i18n       | next-intl (bilingüe `/en` y `/es` desde el día 1)                      |
| Backend    | Supabase Cloud (Postgres + Auth + RLS + Storage)                       |
| Despliegue | Vercel                                                                 |

## Arrancar en local (primera vez)

### 1. Crear un proyecto en Supabase Cloud

1. Ve a https://supabase.com → **New project**.
2. Copia la **Project URL** y la **anon (public) key** desde *Settings → API*.
3. Copia también la **service_role key** (la usaremos para scripts, nunca la expongas al cliente).

### 2. Aplicar el schema inicial

1. En el dashboard de Supabase, abre **SQL Editor**.
2. Pega el contenido de `supabase/migrations/0001_init.sql` y ejecútalo.
3. Verifica en **Table editor** que se crearon las tablas (`profiles`, `creators`, `operators`, `bounties`, `billboard_campaigns`, `clicks`, `conversions`, `code_signatures`).

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y rellena:

```
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurar auth en Supabase

En el dashboard de Supabase, **Authentication → URL Configuration**:

- **Site URL**: `https://drakesbounty.com` (o la URL definitiva de producción)
- **Redirect URLs** (una por línea — añade las que uses):
  ```
  http://localhost:3000/auth/callback
  https://<tu-preview>.vercel.app/auth/callback
  https://drakesbounty.com/auth/callback
  ```

En **Authentication → Providers**, activa:

| Proveedor | Dónde crear la app                                                  | Callback a registrar en el IdP                               |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Email     | Ya viene activo.                                                    | —                                                            |
| Google    | https://console.cloud.google.com/ → OAuth consent + credentials     | `https://<tu-proyecto>.supabase.co/auth/v1/callback`         |
| Twitch    | https://dev.twitch.tv/console/apps                                  | `https://<tu-proyecto>.supabase.co/auth/v1/callback`         |
| Discord   | https://discord.com/developers/applications                         | `https://<tu-proyecto>.supabase.co/auth/v1/callback`         |

Pega en cada proveedor el Client ID y Client Secret que te da el IdP.

> **Nota:** has elegido *no* obligar a verificar el correo antes de entrar. Asegúrate de que en **Authentication → Settings → Email** la opción **"Confirm email"** esté **desactivada** (si la dejas activa, los signups por email/password no podrán entrar hasta hacer clic en el enlace del correo).

### 5. Instalar dependencias y arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:3000 → te redirige a http://localhost:3000/en (o `/es`).

## Despliegue en Vercel

1. Importa el repo en Vercel. Con la app en la raíz, no hace falta configurar "Root Directory".
2. En **Settings → Environment Variables** añade las mismas que tienes en `.env.local` (marca `SUPABASE_SERVICE_ROLE_KEY` como *Sensitive*). Scope: Production + Preview + Development.
3. Redeploy.

## Convenciones

- **Idioma por defecto**: inglés (`en`). Español (`es`) disponible desde el selector.
- **Rutas de miembros**: `/(en|es)/ledger`, `/(en|es)/billboard`, etc.
- **Páginas públicas de creador (Billboard)**: `/@<handle>` — sin prefijo de idioma.
- **Textos traducibles**: siempre en `messages/{en,es}.json`, nunca hardcoded en los componentes.

## Próximos pasos (roadmap)

- [x] Fase 1 — Scaffolding: Next.js + Tailwind Drake + i18n + Supabase base
- [x] Fase 1 — Threshold + auth flow (email/pass + magic link + OAuth Google/Twitch/Discord) con firma del Código
- [ ] Fase 2 — Ledger (dashboard del creador con datos reales)
- [ ] Fase 2 — Billboard editor + página pública del creador
- [ ] Fase 3 — Pagadero (estados de cobro) + payouts USDC/SEPA
- [ ] Fase 4 — Standards Index + Compass (smart routing básico)

## Script de base de datos

Para regenerar o actualizar el schema: crea un archivo nuevo en `supabase/migrations/` con número incremental (`0002_xxx.sql`, `0003_xxx.sql`…) y pégalo en el SQL Editor.

---

© MMXXVI · Drake's Bounty
