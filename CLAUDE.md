# MAI Central Hub — Contexto del proyecto

## Qué es
Dashboard para centralizar el calendario académico del Máster en Inteligencia
Artificial (MAI — UPC + UB + URV), detectar solapamientos entre las tres
universidades, y calcular la nota necesaria por asignatura. Público objetivo:
estudiantes del MAI, sin fricción de registro.

## Decisiones de arquitectura — NO cambiar sin discutirlo antes

- **Stack**: Next.js (App Router, TypeScript) + Prisma + Postgres
  (Neon o Supabase) + Tailwind. Todo en un único repo: los Route Handlers
  de Next.js (`app/api/...`) hacen de backend. No usar FastAPI ni otro
  servicio separado en el MVP.
- **Deploy**: Vercel. Cron jobs vía Vercel Cron si hacen falta.
- **Sin login en el MVP.** Persistencia de usuario vía `anon_id` (UUID
  generado client-side) guardado en cookie de larga duración desde la
  primera visita. No pedir registro para usar el calendario ni la
  calculadora.
- La tabla `User` existe desde el día 1 con `email` y `password_hash`
  **nullable**, para poder añadir login más adelante (Fase 3) sin migrar
  datos ni cambiar la forma de la tabla — "registrarse" será simplemente
  rellenar esos dos campos sobre la fila que ya existía.
- **No existe `User.group_id`.** Cada asignatura se selecciona de forma
  independiente con su propio grupo vía `UserSubjectSelection`, porque a
  partir de 2º/3r semestre no hay un grupo único válido para todo el
  expediente (solo aplica como atajo de UI en 1r semestre).
- El calendario "core" (asignaturas, horarios de clase, exámenes) es un
  dato **GLOBAL** compartido por todos los usuarios de un mismo grupo —
  NO es un dato por-usuario. Se carga a mano (seed) desde los PDFs
  oficiales de horarios de la FIB/UPC. No intentar scrapear
  automáticamente las guías docentes ni los horarios en el MVP.
- Lo único genuinamente per-user es: qué asignaturas/grupo ha
  seleccionado cada uno (`UserSubjectSelection`) y sus notas parciales
  (`UserGrade`).
- Analítica: usar Plausible o Vercel Analytics (sin cookies, sin banner
  RGPD). No usar Google Analytics en el MVP salvo decisión explícita —
  GA4 exige banner de consentimiento de cookies en la UE.

## Modelo de datos de referencia

```
Group          { id, name, semester }
Subject        { id, name, code, ects, university, semester }
ClassSession   { id, subject_id, group_id, day_of_week, start_time, end_time, type, room? }
ExamOrDeadline { id, subject_id, group_id, date, type }
User           { id, anon_id (unique), email?, password_hash?, created_at }
UserSubjectSelection { user_id, subject_id, group_id }
UserGrade      { user_id, subject_id, component, value }
```

`ClassSession` y `ExamOrDeadline` son tablas globales, cargadas por seed,
no por interacción del usuario. `UserSubjectSelection` y `UserGrade` son
las únicas tablas verdaderamente per-user.

## Fuera de alcance en el MVP — no implementar salvo que se pida explícitamente

- Extracción automática de guías docentes (PDF parsing).
- Multiusuario/login real, foro tipo Wuolah.
- Predicción con ML de carga de trabajo.
- Sincronización iCal con Atenea/Campus Virtual UB (fase posterior; el
  MVP usa datos cargados a mano desde los PDFs de horarios oficiales).

## Convenciones de código

- TypeScript estricto (`strict: true`).
- Prisma como única capa de acceso a datos — no queries SQL crudas salvo
  necesidad justificada.
- Nombres de tablas/campos en inglés; contenido (nombres de asignaturas,
  universidades) tal cual viene de la fuente oficial, sin traducir.
- Componentes de servidor por defecto en Next.js; usar `"use client"`
  solo donde haga falta interactividad real.

## Estado actual

Ver `CHECKLIST.md` para las tareas pendientes por fase. Actualizar ese
archivo (marcar checkboxes) al final de cada sesión de trabajo, no dejar
que quede desincronizado con el código real.

Lee DESIGN.md. Rediseña la página /calendario y el selector de
asignaturas siguiendo exactamente ese sistema de diseño (color solo
como codificación de universidad, tipografía de una sola familia por
peso, layout con hairlines en vez de tarjetas con sombra, radio de
esquina solo en elementos interactivos). No añadas gradientes,
mayúsculas en etiquetas, ni componentes tipo tarjeta-SaaS genéricos.