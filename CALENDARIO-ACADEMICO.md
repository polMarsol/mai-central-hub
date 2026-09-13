# Calendario académico real — MAI 2026-27 (1r semestre)

> Fuente de verdad para fechas reales de curso, exámenes y festivos.
> Igual que `Horari_MAI.pdf` es la fuente de los horarios de clase,
> este archivo es la fuente de las fechas cargadas en `ExamOrDeadline`
> (ver `prisma/seed.ts`). Actualizar aquí primero, seed después.

## Horario vs. calendario — dos cosas distintas en la app

- **`/horario`**: el horario semanal recurrente (lunes-viernes, sin
  fechas concretas) — de dónde sale cada clase cada semana. No cambia
  según el mes.
- **`/calendario`**: el calendario real, con fechas concretas — vista
  de mes navegable, exámenes/entregas puestos en su día real, festivos
  fijos marcados, y un listado de "exámenes y entregas pendientes" con
  fecha, día y hora. Es donde vive toda la información de este archivo.

## Festivos fijos cargados en `/calendario` (2026-27)

Estos SÍ son fechas reales para el curso 2026-27 (a diferencia del
resto de este documento, que en su mayoría referencia 2025/26): son
festivos nacionales/catalanes de fecha fija, calculables directamente
del calendario gregoriano, no decisiones del calendario académico de
ninguna universidad.

| Fecha       | Festivo                        |
|-------------|----------------------------------|
| 12-10-2026  | Fiesta Nacional de España        |
| 01-11-2026  | Todos los Santos                 |
| 06-12-2026  | Día de la Constitución           |
| 08-12-2026  | Inmaculada Concepción            |
| 25-12-2026  | Navidad                          |
| 26-12-2026  | San Esteban                      |
| 01-01-2027  | Año Nuevo                        |
| 06-01-2027  | Reyes                            |

Festivos universitarios variables (Fiesta de la FIB, puentes locales,
vacaciones exactas de Navidad/Semana Santa) NO están cargados — cambian
cada curso y no tengo confirmación oficial para 2026-27 todavía (ver
"Qué falta por confirmar").

## Inicio de curso 2026-27

Cada universidad tiene su propia fecha institucional de inicio de
clases, pero las asignaturas del MAI arrancan según el calendario
conjunto del máster (ver más abajo) — pueden no coincidir exactamente.

**Cuatrimestre de otoño (2026-27)**
- UPC: 14 de septiembre de 2026 — C/ Jordi Girona 1-3, Campus Nord,
  08034 Barcelona
- UB: 21 de septiembre de 2026 — C/ Gran Via de les Corts Catalanes
  585, Pati de Ciències, 08011 Barcelona
- URV: 21 de septiembre de 2026 — Av. Països Catalans 26, Edifici E4,
  Campus Sescelades, 43007 Tarragona

**Cuatrimestre de primavera (2026-27)**
- UPC: 15 de febrero de 2027
- UB: 23 de febrero de 2027
- URV: 8 de febrero de 2027

**AIS — Artificial Intelligence Seminar (2026-27)**: una semana de
mayo de 2027, fecha exacta por confirmar (aula UPC-Campus Nord).

## Periodo docente por asignatura (1r semestre, confirmado)

De los avisos oficiales del máster:

| Asignatura | Periodo docente        | Notas                              |
|------------|-------------------------|-------------------------------------|
| CV-MAI     | 14-09-2026 – 18-12-2026 | —                                    |
| IML-MAI    | 14-09-2026 – 18-12-2026 | —                                    |
| IMAS-MAI   | 22-09-2026 – 18-12-2026 | Laboratorios en semanas alternas    |
| PAR-MAI    | 22-09-2026 – 18-12-2026 | Laboratorios en semanas alternas    |
| CI-MAI     | no especificado         | —                                    |
| IHLT-MAI   | no especificado         | Grupo 10 (Teoria): mientras duren las obras del aulari A5, las clases se hacen en **C5 016** en vez de su aula habitual |

Estos rangos no se cargan en `ClassSession` (el modelo es un horario
semanal recurrente sin fecha de inicio/fin), quedan aquí solo como
referencia.

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

## Estructura general del curso — calendario oficial UPC/FIB

> Referencia estructural: el PDF oficial más reciente disponible es el
> **calendario de másters (MEI, MIRI, MAI, MDS) del curso 2025/26**
> (`calendari-academic-curs-2025-2026-masters.pdf`) — es de un curso
> anterior al que estamos preparando (2026-27), así que sus fechas
> exactas NO valen para este curso. Se deja aquí solo para entender el
> **patrón** habitual (cuándo caen exámenes, vacaciones, etc.), no como
> fuente de fechas.

Del curso 2025/26 (patrón, no fechas literales para 2026-27):

- Periodo docente de otoño: de inicios de septiembre a mediados de
  diciembre.
- Exámenes parciales: última semana de octubre / primera de noviembre.
- Exámenes finales: primeras tres semanas de enero.
- Fecha límite de entrega de notas: ~23 de enero.
- Defensa de TFM: matrícula extra a finales de octubre, matrícula
  regular a finales de enero.
- Periodo docente de primavera: de inicios de febrero a finales de
  mayo.
- Exámenes parciales de primavera: primera semana de abril.
- Exámenes finales de primavera: primeras tres semanas de junio.
- No hay clase durante la semana de exámenes parciales.
- Las asignaturas sin examen final pueden dar clase hasta el final del
  periodo de exámenes finales.

**Festivos / días sin clase (curso 2025/26, patrón orientativo):**
Fiesta de la FIB (~24 de septiembre), Día de la Constitución/Puente de
diciembre (~6-8 diciembre), vacaciones de Navidad (~22 diciembre al 6
enero), Semana Santa (variable, marzo/abril), 1 de mayo. Las fechas
exactas de 2026-27 hay que confirmarlas cuando la FIB publique el
calendario de ese curso.

## Qué falta por confirmar

- [ ] Calendario oficial de másters 2026-27 (cuando la FIB lo publique
      — sustituirá el de 2025/26 usado aquí como referencia de patrón).
- [ ] Fechas de examen de IMAS-MAI y PAR-MAI.
- [ ] Fechas de exámenes de recuperación (todas las asignaturas).
- [ ] Festivos concretos del curso 2026-27 (Navidad, Semana Santa,
      puentes).
- [ ] Fecha exacta del AIS (semana de mayo de 2027).
