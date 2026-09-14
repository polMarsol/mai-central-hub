# MAI Central Hub: Sistema de diseño

Dirección: minimalista, blanco, "Apple-like", educativo. El color
codifica información real (universidad), no decora. Referencia visual
definitiva: el diseño entregado en `MAI Central Hub Dashboard.zip`
(topbar, tipografía, hero, calendario, footer). Este documento
describe ESE diseño, ya aplicado al proyecto real.

## Color

- Fondo base: `#FFFFFF`
- Fondo secundario (secciones alternas): `#FAFAFA`
- Texto principal: `#1D1D1F` (nunca negro puro `#000000`)
- Texto secundario: `#6E6E73`
- Divisores/hairlines: `#E5E5E7`

Color por universidad (única fuente de color saturado en la UI,
siempre con función informativa, nunca decorativa):
- UPC: `#2563EB`
- UB: `#F2A93B`
- URV: `#14B8A6`

Usar estos tres en fondo de baja opacidad (7-15%) para bloques de
calendario, y a opacidad completa solo en indicadores pequeños
(punto, borde izquierdo de 3px, leyenda). No rellenar celdas enteras
con color saturado.

## Tipografía

Dos familias, con roles claramente distintos (no mezclar sin motivo):

- **Display / títulos / logo / cifras destacadas**:
  `'Latin Modern Roman', 'CMU Serif', Georgia, serif`, peso 400
  (regular; no usar 500/600 sobre esta familia, no hay esos cortes
  cargados). Usar en h1/h2, el nombre del producto, encabezados de
  sección y números grandes destacados (estadísticas, resultado de la
  calculadora de notas), nunca en texto denso o de cuerpo pequeño.
  Tracking negativo según tamaño: `-0.02em` en h1 grande (~68px),
  `-0.015em` en h2 (~36px), `-0.01em` en tamaños de logo/subtítulo.
- **UI / cuerpo / datos**: stack de sistema
  `-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif`,
  para todo lo demás: navegación, celdas de calendario, labels, botones,
  formularios, footer. Tracking ligeramente negativo (`-0.005em`) en
  textos de navegación/UI de tamaño normal.
- **Datos numéricos** (horas, ECTS, notas, estadísticas): añadir
  `font-variant-numeric: tabular-nums` para que los dígitos alineen en
  columnas.

Jerarquía dentro de cada familia por peso, no añadiendo más familias.

Instalación (paquete npm con los .woff2 ya listos, sin depender de
CDNs externos):
```bash
npm install computer-modern
```
En Next.js, usar `next/font/local` apuntando a esos .woff2 (declarados
a `weight: "400"`) para que se sirvan optimizados y sin parpadeo de
carga (FOUT). `'Latin Modern Roman'` se deja primero en el stack por
fidelidad a la referencia; como no se autoaloja, el navegador cae en
`'CMU Serif'` (la que sí servimos).

**Mayúsculas**: reservadas para "eyebrows", una línea corta antes de
un h1/h2 (p. ej. "Màster en Intel·ligència Artificial · UPC · UB ·
URV") o encabezados de columna en el footer ("PROYECTO", "AYUDA",
"LEGAL"). Siempre en `text-secondary`, tamaño pequeño (~12.5px) y
tracking positivo (`+0.06em`). Nunca en botones, labels de formulario,
ni para "decorar" una palabra suelta.

## Layout

- El "casco" de la app (header, hero, calendario, footer) se centra en
  un contenedor de `max-width: 1120px` con `padding` lateral (~28px):
  una columna legible con márgenes generosos, no un dashboard que
  fuerza el ancho completo de pantallas ultra-anchas.
- Calendario: rejilla con líneas finas (hairlines, `#E5E5E7`), NO
  celdas tipo tarjeta con `box-shadow`.
- Radio de esquina: 6-8px, solo en elementos interactivos (botones,
  selects, inputs, el contenedor del selector de idioma), no en
  celdas de calendario ni contenedores pasivos.
- Sin gradientes decorativos, sin sombras grises genéricas de kit
  SaaS.

## Topbar

- `position: sticky; top: 0`, fondo cristal esmerilado:
  `background: rgba(255,255,255,0.72)` +
  `backdrop-filter: saturate(180%) blur(20px)` (con prefijo
  `-webkit-`), hairline inferior. Esto flota sobre el contenido al
  hacer scroll sin taparlo del todo.
- Una sola fila, `height: 56px`: logotipo a la izquierda, navegación
  centrada (`flex: 1; justify-content: center`), selector de idioma a
  la derecha.
- Logotipo en dos tonos: `MAI` en `text-primary` + `Central Hub` en
  `text-secondary`, tipografía display, `font-size: 21px`.
- Selector de idioma (ES/CA/EN): en reposo solo se ve el idioma
  activo, en una sola fila compacta con borde+radio. Al pasar el ratón
  por encima, el control se expande y las dos opciones adyacentes
  aparecen con un pequeño giro (`rotateX`, `transform-origin` en el
  borde correspondiente) más un fundido de opacidad, como si la rueda
  se desplegara. Se elige girando la rueda del ratón sobre el control
  (un "tick" = un paso) o pulsando directamente la fila que aparece.
  Idioma activo con fondo `text-primary` y texto blanco; los
  adyacentes en `text-secondary`, atenuados. Idioma por defecto:
  inglés.

## Footer

Varias columnas de enlaces reales del sitio (no inventar secciones
que no existan), cada columna con un eyebrow en mayúsculas como
título. Cierra con una barra inferior: nombre del proyecto en
tipografía display + una línea secundaria (el disclaimer de que es un
proyecto personal, no oficial).

## Responsive / móvil

Mobile-first: diseñar primero la vista de móvil, expandir a
escritorio después, no al revés.

- Breakpoint principal: `640px` (por debajo = móvil).
- Calendario semanal en escritorio (lunes-viernes en columnas) pasa
  a **vista de un día con pestañas** en móvil. No intentar encajar 5
  columnas apretadas en una pantalla estrecha, se vuelve ilegible.
- Tamaño mínimo de texto en móvil: 14px para datos densos (horas,
  código de asignatura), 16px para texto interactivo (evita que
  Safari haga zoom automático en inputs).
- Objetivos táctiles de botones/selects/pestañas de tamaño principal:
  al menos 44×44px. Enlaces de texto secundarios (footer, filas del
  selector de idioma) pueden ser más compactos, con foco en la
  legibilidad antes que en el tamaño del objetivo táctil.
- El título en CMU Serif se mantiene incluso en móvil (es parte de la
  identidad), pero reduce su tamaño en vez de forzar scroll horizontal
  en la cabecera. En móvil el topbar puede apilar navegación debajo
  del logo/selector si no cabe en una fila.

## Motion

Usos permitidos, nada de hover genérico en cada tarjeta ni animaciones
de entrada repetidas sección a sección:

1. **Hover sutil en todo elemento interactivo** (enlaces de
   navegación, footer, selector de idioma, botones): un cambio leve,
   como un subrayado que aparece con `transform: scaleX()` desde
   `transform-origin: left`, opacidad, o un micro-desplazamiento
   (`translateY(-1px)`). Transición 180-300ms,
   `cubic-bezier(.2,.7,.2,1)` o `ease`. Nunca sombra genérica de kit
   SaaS.
2. **Un único reveal orquestado en el hero de la home**, disparado la
   primera vez que el hero entra en el viewport (no se repite al
   volver a hacer scroll): eyebrow, título, descripción, CTAs y
   estadísticas aparecen con un fade + `translateY` breve y un
   pequeño *stagger* entre ellos. Ningún otro bloque de la app anima
   al hacer scroll.
3. **Reveal por giro (rotateX) en el selector de idioma**, al pasar
   el ratón por encima: ver Topbar. Es el único sitio de la app donde
   se usa una transformación 3D.

Fuera de esos casos, sin animaciones de entrada por scroll.

## Qué evitar explícitamente

- Fondo crema/beige con acento terracota (tell genérico de diseño
  generado por IA).
- Kit de tarjetas idénticas con el mismo `border-radius` y sombra
  gris en todo.
- Numeración "01 / 02 / 03" salvo que el contenido sea una secuencia
  real.
- Separadores con punto medio ("A · B · C") o em dash espaciado
  ("Word, fragmento") como chrome decorativo. Excepción: sí se usa
  el punto medio como separador de metadatos cortos en una misma
  línea (p. ej. "UPC · 6 ECTS · Teoria"), que es distinto de decorar
  una frase.
- El em dash (—) en general, en cualquier texto de la interfaz o de
  este documento: es un tell reconocible de texto generado por IA.
  Usar coma, punto y seguido, dos puntos o paréntesis según el caso.
- Estadísticas o cifras inventadas: cualquier número que se muestre
  (ECTS, nº de asignaturas, solapes) tiene que salir de datos reales
  de Prisma, nunca un placeholder de la maqueta de referencia.
