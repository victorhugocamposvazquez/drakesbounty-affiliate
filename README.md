# Drake's Bounty — Monorepo

SaaS de afiliación para gambling / trading / cripto con universo narrativo propio (el Gremio, el Código, el Ledger, el Pagadero, la Carta Náutica…).

## Estructura

```
drakes-affiliate/
├── html-dashboard-afiliado/   # HTMLs originales de referencia (diseño)
├── supabase/
│   └── migrations/            # Migraciones SQL (aplicar en Supabase Cloud)
└── web/                       # App Next.js 16 (frontend + API routes)
```

## Stack

| Capa        | Tecnología                                          |
| ----------- | --------------------------------------------------- |
| Frontend    | Next.js 16 (App Router) + React 19 + TypeScript     |
| Estilos     | Tailwind CSS 4 con paleta custom (Fraunces, Work Sans, JetBrains Mono) |
| i18n        | next-intl (bilingüe `/en` y `/es` desde el día 1)   |
| Backend     | Supabase Cloud (Postgres + Auth + RLS + Storage)    |
| Despliegue  | Vercel (previsto)                                   |

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
cd web
cp .env.example .env.local
```

Edita `.env.local` y rellena:

```
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Instalar dependencias y arrancar

```bash
cd web
npm install
npm run dev
```

Abre http://localhost:3000 → te redirige a http://localhost:3000/en (o `/es`).

## Convenciones

- **Idioma por defecto**: inglés (`en`). Español (`es`) disponible desde el selector.
- **Rutas de miembros**: `/(en|es)/ledger`, `/(en|es)/billboard`, etc.
- **Páginas públicas de creador (Billboard)**: `/@<handle>` — sin prefijo de idioma.
- **Textos traducibles**: siempre en `web/messages/{en,es}.json`, nunca en los componentes.

## Próximos pasos (roadmap)

- [x] Fase 1 — Scaffolding: Next.js + Tailwind Drake + i18n + Supabase base
- [ ] Fase 1 — Threshold + auth flow (signup con firma del Código)
- [ ] Fase 2 — Ledger (dashboard del creador con datos reales)
- [ ] Fase 2 — Billboard editor + página pública del creador
- [ ] Fase 3 — Pagadero (estados de cobro) + integración Stripe
- [ ] Fase 4 — Standards Index + Compass (smart routing básico)

## Script de base de datos

Para regenerar o actualizar el schema: edita `supabase/migrations/` creando un archivo nuevo con número incremental y pégalo en el SQL Editor.

---

© MMXXVI · Drake's Bounty
