# Qué copiar al repo `drakes-ops`

1. **`regla-cursor.mdc`** → en el otro repo como **`.cursor/rules/drakes-ops.mdc`** (crea la carpeta `.cursor/rules/` si no existe).

2. **`../contexto-para-drakes-ops.md`** → copia el contenido a **`drakes-ops/docs/drakes-affiliate-context.md`** (o deja en ops solo la copia; el original sigue en el afiliado).

3. **Primer prompt** al abrir ops en Cursor: ver `ecosistema-repos.md` en el afiliado, sección *Primer prompt (repo casi vacío, solo HTMLs de diseño)*, y añade `@` a la carpeta de HTML.

Tras esto, el agente en **ops** tiene:
- reglas fijas (`.cursor/rules`);
- contexto de datos y contratos (`docs/drakes-affiliate-context.md`);
- tu prompt inicial con la carpeta de diseño.

No hace falta abrir **dos ventanas a la vez** para que “entienda” el afiliado: el doc + la regla lo sustituyen. Abre el afiliado solo cuando toques **migraciones** o el propio postback/tracking.
