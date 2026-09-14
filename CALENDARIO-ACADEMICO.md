# Calendario académico real — MAI 2026-27 (1r semestre)

> Fuente de verdad para fechas reales de curso, exámenes y festivos.
> Igual que `Horari_MAI.pdf` es la fuente de los horarios de clase,
> este archivo es la fuente de las fechas cargadas en `ExamOrDeadline`
> (ver `prisma/seed.ts`). Actualizar aquí primero, seed después.

## Horario vs. calendario — dos cosas distintas en la app

- **`/horario`**: el horario semanal recurrente (lunes-viernes, sin
  fechas concretas) — de dónde sale cada clase cada semana. No cambia
  según el mes.
- **`/calendario`**: el calendario real, con fechas concretas. Primero
  el resumen de "exámenes y entregas pendientes" (fecha, día y hora),
  después solo la vista de mes navegable — con festivos, primer día de
  clase por asignatura e inicio de curso institucional marcados en su
  día correspondiente, todo dentro de la propia rejilla (no como listas
  aparte). Las direcciones/Google Maps de cada universidad NO están
  aquí — viven en `/horario` (ver más abajo).

## Festivos y avisos cargados en `/calendario` (2026-27)

Fuente: **calendario académico oficial de másters (MEI, MIRI, MAI, MDS)
de la FIB/UPC, curso 2026/27**
(`calendari-academic-curs-2026-2027--masters-.pdf`). Es el calendario
oficial de UPC — el propio documento avisa de que **las asignaturas de
UB y URV pueden empezar un poco más tarde** y no necesariamente
comparten exactamente los mismos festivos/puentes. Válido con
seguridad para CI-MAI e IHLT-MAI (UPC); para CV-MAI/IML-MAI (UB) e
IMAS-MAI/PAR-MAI (URV) se usa como referencia hasta tener confirmación
específica de esas universidades.

**Días sin clase (festivos):**

| Fecha                     | Motivo                          |
|----------------------------|----------------------------------|
| 11-09-2026                 | Diada Nacional de Catalunya      |
| 12-10-2026                 | Fiesta Nacional de España        |
| 07-12-2026                 | Puente (día no lectivo)          |
| 08-12-2026                 | Inmaculada Concepción            |
| 23-12-2026 al 06-01-2027   | Vacaciones de Navidad            |

**Avisos informativos (no bloquean clase, pero se muestran en el calendario):**

| Fecha       | Aviso                                              |
|-------------|-----------------------------------------------------|
| 03-09-2026  | Welcome event — alumnos de intercambio               |
| 16-09-2026  | Master's Welcome Ceremony, 12:15, Sala d'Actes (edifici Vèrtex). Reprogramada — la sesión inicialmente prevista el 9/9 se canceló por indicaciones de Protecció Civil (email oficial de Secretaria FIB, 10/9/2026) |
| 14-10-2026  | Cambio de horario puntual: el miércoles sigue horario de lunes (compensa el festivo del lunes 12/10) |
| 21 y 22-12-2026 | Preparación de exámenes (sin clase nueva, no es festivo oficial) |

Festivos universitarios variables no confirmados en este PDF (Semana
Santa, 1 de mayo, Fiesta de la FIB de primavera) no están cargados —
pertenecen al cuatrimestre de primavera, fuera de alcance de la app por
ahora.

## Inicio de curso 2026-27

Cada universidad tiene su propia fecha institucional de inicio de
clases (marcada en `/calendario` en su día, con el nombre de la
universidad) — es distinta del primer día de clase real de cada
asignatura del MAI (ver siguiente sección), que puede ser bastante
posterior. Las direcciones y el enlace a Google Maps de cada campus
están en `/horario`, no aquí.

**Cuatrimestre de otoño (2026-27)**
- UPC: 14 de septiembre de 2026
- UB: 21 de septiembre de 2026
- URV: 21 de septiembre de 2026

**Cuatrimestre de primavera (2026-27)**
- UPC: 15 de febrero de 2027
- UB: 23 de febrero de 2027
- URV: 8 de febrero de 2027

**AIS — Artificial Intelligence Seminar (2026-27)**: una semana de
mayo de 2027, fecha exacta por confirmar (aula UPC-Campus Nord).

## Primer día de clase confirmado por asignatura (1r semestre)

**Importante**: esto NO es lo mismo que el "periodo docente" general de
la universidad (arriba) ni que el inicio de curso institucional. Son
las fechas reales del primer día de clase de cada asignatura del MAI,
confirmadas directamente por el usuario/avisos oficiales del máster —
pueden ser (y de hecho son) bastante posteriores al inicio del periodo
docente general. El caso de IML es el ejemplo: la profesora corrigió
oficialmente la fecha inicialmente anunciada.

| Asignatura | Primer día de clase | Notas                              |
|------------|----------------------|-------------------------------------|
| CV-MAI     | martes 15-09-2026    | —                                    |
| IML-MAI    | martes 22-09-2026    | Corrección oficial de la profesora (7/9/2026): se había anunciado el 15/09 por error. Primera clase a las 10:00, en la UB (Gran Via de les Corts Catalanes 585, aula B1) |
| PAR-MAI    | miércoles 23-09-2026 | Laboratorios en semanas alternas    |
| IMAS-MAI   | miércoles 23-09-2026 | Laboratorios en semanas alternas    |
| IHLT-MAI   | jueves 01-10-2026    | Grupo 10 (Teoria): mientras duren las obras del aulari A5, las clases se hacen en **C5 016** en vez de su aula habitual |
| CI-MAI     | jueves 01-10-2026    | —                                    |

Todas estas fechas están marcadas en `/calendario`, en el día
correspondiente de la rejilla del mes (recuadro con el código de la
asignatura). No se cargan en `ClassSession` (el modelo de `/horario` es
un horario semanal recurrente sin fecha de inicio/fin).

## Exámenes confirmados (1r semestre 2026-27)

Fuente: avisos oficiales del máster (captura de pantalla, curso
2026-27). Formato de fecha original M/D/AAAA.

### Parciales

| Asignatura | Fecha       | Hora        |
|------------|-------------|-------------|
| CV-MAI     | 03-11-2026  | 14:00–18:00 |

### Finales

| Asignatura | Fecha       | Hora        |
|------------|-------------|-------------|
| IML-MAI    | 15-12-2026  | 10:00–13:00 |
| CV-MAI     | 15-12-2026  | 14:00–18:00 |
| CI-MAI     | 07-01-2027  | 15:00–18:00 |
| IHLT-MAI   | 14-01-2027  | 11:30–14:30 |

### Sin fecha todavía

- **IMAS-MAI**: sin parcial ni final anunciados.
- **PAR-MAI**: sin parcial ni final anunciados.
- **Exámenes de recuperación**: la fuente original los mencionaba pero
  la captura no llegó a mostrar las fechas — pendiente.

Estas son las únicas fechas cargadas en `ExamOrDeadline` — no se ha
inventado ninguna para IMAS/PAR ni para las recuperaciones.

## Estructura general del curso — calendario oficial UPC/FIB 2026-27

Fuente: **calendario académico oficial de másters (MEI, MIRI, MAI, MDS)
de la FIB/UPC, curso 2026/27**
(`calendari-academic-curs-2026-2027--masters-.pdf`). Fechas literales,
confirmadas, no un patrón orientativo.

**Cuatrimestre de otoño:**
- Preinscripción de optativas: 1r periodo 13-14/07/2026, ajustes
  15-16/07/2026, 2n periodo 17/07/2026.
- Días de matrícula: 21/07/2026 (alumnos ya en el máster), 23/07/2026
  (alumnos nuevos).
- Periodo docente: 14/09/2026 al 18/12/2026 (UB y URV pueden empezar un
  poco más tarde).
- Exámenes finales (ventana oficial UPC): 14/01/2027 al 18/01/2027.
- Fecha límite de entrega de notas: 25/01/2027 (hasta las 12:00).
- Defensa de TFM: con matrícula extra 15-21/10/2026; matrícula regular
  26/01/2027 al 01/02/2027. (No aplica todavía a estudiantes de 1r
  semestre — se deja aquí solo como referencia para más adelante.)
- Las asignaturas sin examen final pueden dar clase hasta el final del
  periodo de exámenes finales.

**Cuatrimestre de primavera** (fuera de alcance de la app por ahora,
solo como referencia):
- Periodo docente: 15/02/2027 al 28/05/2027.
- Exámenes finales: 03/06/2027 al 18/06/2027.
- Fecha límite de entrega de notas: 28/06/2027.

No hay ningún examen parcial ("mid-term exams", verde en la leyenda
oficial) marcado con fecha concreta en la cuadrícula del semestre de
otoño — por eso no se ha añadido ninguna fecha genérica de parciales
aquí; los parciales reales por asignatura son los de la sección
anterior ("Exámenes confirmados").

## Qué falta por confirmar

- [x] ~~Calendario oficial de másters 2026-27~~ — confirmado, es
      `calendari-academic-curs-2026-2027--masters-.pdf`.
- [x] ~~Festivos concretos del curso 2026-27 (otoño)~~ — confirmados y
      cargados (ver tabla más arriba).
- [ ] Fechas de examen de IMAS-MAI y PAR-MAI.
- [ ] Fechas de exámenes de recuperación (todas las asignaturas).
- [ ] Confirmación específica de UB/URV de si sus festivos/puentes de
      otoño coinciden exactamente con el calendario UPC usado aquí.
- [ ] Fecha exacta del AIS (semana de mayo de 2027).
- [ ] Festivos del cuatrimestre de primavera (Semana Santa, 1 de mayo,
      Fiesta de la FIB) — no cargados todavía, fuera de alcance actual.
