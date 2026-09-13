# MAI Central Hub — Checklist de trabajo

> Marca las tareas al terminarlas. Si una tarea cambia de alcance o se
> descarta, anota el motivo debajo en vez de borrarla sin más.

## Fase 0 — Setup

- [ ] `create-next-app` con TypeScript + Tailwind + App Router
- [ ] Cuenta en Neon o Supabase (Postgres gestionado)
- [ ] `prisma init`, conectar `DATABASE_URL`
- [ ] Definir schema Prisma completo (ver modelo en `CLAUDE.md`)
- [ ] Primera migración (`prisma migrate dev`)
- [ ] Deploy vacío a Vercel — confirmar que el pipeline funciona antes
      de construir nada más
- [ ] Plausible o Vercel Analytics conectado

## Fase 1 — Calendario público (sin login)

- [x] Seed script: cargar `Subject`, `Group`, `ClassSession` de las 6
      obligatorias del PDF `Horari_MAI.pdf` (grupos 10, 11 y 12)
- [x] Endpoint `GET /api/calendar?group=10` que devuelve las sesiones
      normalizadas
- [x] Página `/calendario` con vista semanal, color por universidad
      (UPC / UB / URV)
- [ ] Selector "Grupo 10 / Grupo 11" (solo UI, rellena
      `UserSubjectSelection` de las 6 asignaturas de golpe)
- [ ] Cargar `ExamOrDeadline` en cuanto se tengan fechas reales de
      exámenes/entregas

## Fase 2 — Personalización ligera (sigue sin login)

- [ ] Generar `anon_id` en cookie en la primera visita (middleware o
      Route Handler)
- [ ] Endpoint para leer/crear `User` a partir del `anon_id`
- [ ] Selector de optativas para semestres 2º/3º (catálogo completo de
      `Subject`, elección independiente por asignatura + grupo)
- [ ] Lógica de detección de solape crítico (mismo día, examen +
      entrega en universidades distintas)
- [ ] Modelo de `UserGrade` + fórmula de evaluación por asignatura
- [ ] Simulador de nota necesaria (UI + cálculo, usar `mathjs` para
      evaluar la fórmula)

## Fase 3 — Cuentas y comunidad (opcional, solo si el MVP funciona)

- [ ] Flujo de "registro" = completar `email`/`password_hash` sobre el
      `User` existente (no crear usuario nuevo)
- [ ] Sincronización entre dispositivos para usuarios registrados
- [ ] Foro/comunidad tipo Wuolah reducido (requiere moderación —
      diseñar antes de construir)

## Fase 4 — Extras / no prioritario

- [ ] Extracción automática de guías docentes (PDF parsing) —
      alto riesgo de esfuerzo desproporcionado, evaluar antes de empezar
- [ ] Sincronización iCal directa con Atenea/Campus Virtual UB
- [ ] Radar de carga de trabajo (ECTS/semana) con gráfico

## Decisiones registradas (para no volver a discutirlas)

- Sin login en MVP — persistencia vía `anon_id` en cookie.
- No existe `User.group_id`; selección de asignatura+grupo es siempre
  independiente por fila (`UserSubjectSelection`).
- Calendario core es dato global por grupo, cargado a mano, no
  scrapeado.
- Analítica sin cookies (Plausible/Vercel Analytics), no GA4 en el MVP.