# MAI Central Hub: Checklist de trabajo

> Marca las tareas al terminarlas. Si una tarea cambia de alcance o se
> descarta, anota el motivo debajo en vez de borrarla sin más.

## Fase 0: Setup

- [ ] `create-next-app` con TypeScript + Tailwind + App Router
- [ ] Cuenta en Neon o Supabase (Postgres gestionado)
- [ ] `prisma init`, conectar `DATABASE_URL`
- [ ] Definir schema Prisma completo (ver modelo en `CLAUDE.md`)
- [ ] Primera migración (`prisma migrate dev`)
- [ ] Deploy vacío a Vercel: confirmar que el pipeline funciona antes
      de construir nada más
- [ ] Plausible o Vercel Analytics conectado

## Fase 1: Calendario público (sin login)

- [x] Seed script: cargar `Subject`, `Group`, `ClassSession` de las 6
      obligatorias del PDF `Horari_MAI.pdf` (grupos 10, 11 y 12)
- [x] Endpoint `GET /api/calendar?group=10` que devuelve las sesiones
      normalizadas
- [x] Página `/horario` con vista semanal recurrente, color por
      universidad (UPC / UB / URV). **Horario y calendario son cosas
      distintas**: `/horario` es la plantilla semanal sin fechas,
      `/calendario` (ver más abajo) es el calendario real con fechas.
- [ ] Selector "Grupo 10 / Grupo 11" (solo UI, rellena
      `UserSubjectSelection` de las 6 asignaturas de golpe)
- [x] Cargar `ExamOrDeadline` con fechas reales confirmadas (ver
      `CALENDARIO-ACADEMICO.md`): parcial de CV y finales de IML, CV,
      CI, IHLT. IMAS y PAR aún no tienen fecha anunciada, no
      inventadas.
- [x] Página `/calendario`: calendario real interactivo, con el resumen
      de "exámenes y entregas pendientes" primero (asignatura, tipo,
      fecha, día y hora) y luego la vista de mes navegable
      (anterior/siguiente/hoy) con fechas de verdad, festivos de
      2026-27, primer día de clase por asignatura e inicio de curso
      institucional marcados en la propia rejilla.
- [x] Internacionalización completa (next-intl: `es`/`ca`/`en`, `en` por
      defecto): rutas bajo `app/[locale]/`, middleware de detección de
      idioma, selector ES/CA/EN en el header (rueda vertical de ratón).
      Los API routes no llevan locale.
- [x] Páginas de contenido `/objetivos`, `/sobre-el-proyecto`,
      `/sugerencias`, `/privacidad`, `/contacto`: contenido redactado
      de cero en los tres idiomas (no existía versión previa pese a lo
      que se pensaba). El email de contacto vive en `lib/contact.ts`.
- [x] Reskin completo según el diseño de referencia entregado
      (`MAI Central Hub Dashboard.zip`): tipografía (CMU Serif peso 400
      + stack de sistema), topbar de una fila con cristal esmerilado
      (`sticky` + `backdrop-filter`), footer con columnas reales,
      hover con subrayado en nav/footer, hero de la home con
      estadísticas reales calculadas de Prisma (no cifras de ejemplo)
      y un único reveal orquestado al entrar en el viewport. `DESIGN.md`
      reescrito para documentar este sistema.
- [x] Enlace a la guía docente oficial de cada asignatura desde
      `/horario` (FIB/UPC aloja el currículum conjunto del máster,
      válido también para asignaturas de UB/URV), más una sección de
      ubicaciones con Google Maps.
- [x] Banner de consentimiento de cookies (aceptar/rechazar con el mismo
      peso visual) y carga condicional de Google AdSense, a la espera de
      un ID de publicador real.

## Fase 2: Personalización ligera (sigue sin login)

- [x] Generar `anon_id` en cookie en la primera visita (`lib/use-anon-id.ts`,
      generado client-side al usar la calculadora de notas)
- [x] Endpoint para leer/crear `User` a partir del `anon_id`
      (`app/api/selections`, `app/api/grades`: upsert por `anon_id`)
- [ ] Selector de optativas para semestres 2º/3º (catálogo completo de
      `Subject`, elección independiente por asignatura + grupo)
- [ ] Lógica de detección de solape crítico (mismo día, examen +
      entrega en universidades distintas)
- [x] Modelo de `UserGrade` + calculadora de notas (`/calculadora`):
      componentes dinámicos por asignatura (nombre + peso + nota),
      número variable, no solo 2 fijos. El peso lo introduce el usuario
      cada vez (no se persiste ni se carga desde `Subject`, decisión
      explícita); solo el nombre del componente y la nota obtenida se
      guardan en `UserGrade` vía `anon_id`. Resuelve la nota que falta
      cuando se deja un único componente en blanco.
- [x] El filtro de grupo (10/11/12) de `/horario` es solo una vista
      local del navegador, no se persiste en `UserSubjectSelection`
      (decisión explícita, revertida de un diseño anterior que sí
      persistía).

## Fase 3: Cuentas y comunidad (opcional, solo si el MVP funciona)

- [ ] Flujo de "registro" = completar `email`/`password_hash` sobre el
      `User` existente (no crear usuario nuevo)
- [ ] Sincronización entre dispositivos para usuarios registrados
- [ ] Foro/comunidad tipo Wuolah reducido (requiere moderación,
      diseñar antes de construir)

## Fase 4: Extras / no prioritario

- [ ] Extracción automática (parsing) del contenido de las guías
      docentes: alto riesgo de esfuerzo desproporcionado, evaluar antes
      de empezar. El enlace directo a la guía oficial ya está hecho
      (ver Fase 1); esto es distinto, sería parsear su contenido.
- [ ] Sincronización iCal directa con Atenea/Campus Virtual UB
- [ ] Radar de carga de trabajo (ECTS/semana) con gráfico

## Decisiones registradas (para no volver a discutirlas)

- Sin login en MVP: persistencia vía `anon_id` en cookie.
- No existe `User.group_id`; selección de asignatura+grupo es siempre
  independiente por fila (`UserSubjectSelection`).
- Calendario core es dato global por grupo, cargado a mano, no
  scrapeado.
- Analítica sin cookies (Plausible/Vercel Analytics), no GA4 en el MVP.
- Anuncios: Google AdSense, con banner de consentimiento previo
  (aceptar/rechazar con el mismo peso visual). Solo se activa cuando
  exista un ID de publicador real en `NEXT_PUBLIC_ADSENSE_CLIENT_ID`.
