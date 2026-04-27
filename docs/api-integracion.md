# Integración técnica (operadores y partners)

Base URL: la de tu despliegue (`NEXT_PUBLIC_APP_URL` en Vercel, p. ej. `https://tu-dominio.com`).

Todas las rutas de API viven bajo el **origen** de la app (sin prefijo `/en`).

---

## 1. Clicks trackeados — `GET /api/r`

Registra un click y redirige al destino de la oferta.

| Parámetro | Obligatorio | Descripción |
|-----------|------------|-------------|
| `bc`      | Sí         | UUID de `billboard_campaigns.id` (hueco de campaña en el Billboard del creador). |

**Condiciones** (si fallan, redirect a `/{defaultLocale}` sin registrar click en muchos casos):

- Existe la campaña, `visible = true`, creador con Billboard publicado.
- La bounty asociada está `active` y tiene `tracking_url` HTTP(S) (ver migración `0002`).

**Respuesta:** `302` a `tracking_url` (u origen de la app si falta URL válida).

**Nota:** geodatos best-effort (`x-vercel-ip-country`, etc.) para el Map Room.

---

## 2. Postback (conversiones) — `POST /api/postback`

Evento **servidor a servidor** para registrar ingresos en el Ledger. No usar desde el navegador del usuario final.

**Cabecera obligatoria**

```http
Authorization: Bearer <POSTBACK_SECRET>
```

`POSTBACK_SECRET` lo defines en Vercel; solo lo conocen vuestro backend o el operador acordado.

**Cuerpo JSON** (tipos alineados con el código en `src/app/api/postback/route.ts`):

| Campo | Tipo | Obligatorio | Notas |
|-------|------|------------|--------|
| `operator_id` | UUID | Sí | = `operators.id` (mismo que `auth.users` del operador). |
| `bounty_id` | UUID | Sí | Bounty del operador. |
| `creator_id` | UUID | Sí | Creador a acreditar. |
| `event_type` | string | Sí | `registration` · `deposit` · `ftd` · `custom` |
| `external_id` | string | Sí | Id **estable** del evento en el lado operador; idempotencia con `operator_id`. Max 500 caracteres. |
| `occurred_at` | string (ISO-8601) | Sí | Instante del hecho. |
| `amount_cents` | entero o null | No | Importe del depósito/FTD si aplica. |
| `commission_cents` | entero o null | No | Comisión al creador en unidades mínimas de moneda. |
| `currency` | string | No (defecto `EUR`) | Código ISO de moneda. |
| `click_id` | UUID o null | No | Si conoces el `clicks.id` del primer touch. |

**Idempotencia:** misma pareja `operator_id` + `external_id` no inserta de nuevo. Respuesta de ejemplo: `{ "ok": true, "duplicate": true, "id": "…" }`.

**Errores habituales:** `401` (Bearer incorrecto), `400` (JSON o validación), `503` (sin `POSTBACK_SECRET` en el servidor), `5xx` (DB).

---

## 3. Flujo CSV / backoffice

Los cierres por Excel/CSV suelen alimentar la misma tabla `conversions` (u operaciones de conciliación) desde **otro producto (ops)**, con la misma lógica de `external_id` + `operator_id` para no duplicar filas. La migración `0004` añade `import_batches` y lectura admin en conversiones; el código de import vive en el repo del backoffice.

---

## 4. Checklist de despliegue

- [ ] `POSTBACK_SECRET` en Vercel (producción y preview si probáis postback en preview).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` en el servidor (ya usada en `/api/r` y `/api/postback`).
- [ ] Bounties con `status = active` y `tracking_url` real antes de tráfico.
- [ ] Probar: un `GET /api/r?bc=…` y un `POST /api/postback` de prueba (cURL) antes de conectar al casino.

Ejemplo cURL (postback):

```bash
curl -sS -X POST "https://TU_DOMINIO/api/postback" \
  -H "Authorization: Bearer $POSTBACK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "operator_id": "00000000-0000-4000-8000-000000000001",
    "bounty_id": "00000000-0000-4000-8000-000000000002",
    "creator_id": "00000000-0000-4000-8000-000000000003",
    "event_type": "ftd",
    "external_id": "test-ftd-001",
    "occurred_at": "2026-01-15T12:00:00.000Z",
    "commission_cents": 5000,
    "currency": "EUR"
  }'
```

Sustituye los UUID por filas reales de tu base.
